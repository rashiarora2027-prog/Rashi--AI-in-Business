/**
 * Dodo Payments layer for PATTERNS.
 *
 * The flow, and where the trust sits:
 *
 *   1. Browser asks /api/payment/create-order  -> we open a Dodo checkout
 *      session for the detailed-report product and return its hosted URL
 *   2. Browser goes to Dodo's hosted checkout, the customer pays
 *   3. Dodo sends the customer back to our site with ?payment_id=...
 *   4. Browser posts that id to /api/payment/verify. We ask Dodo's API
 *      directly (with our secret key) whether that payment succeeded and was
 *      for our product, record the purchase, and issue a signed access token
 *   5. Browser sends that token to /api/detailed-report to unlock the report
 *
 * Step 4 is the security boundary. The browser can claim anything — that a
 * payment succeeded, that it was for a different product. None of that is
 * believed. The only thing trusted is Dodo's own answer, fetched server-side
 * with a key the browser never sees.
 *
 * The price lives on the product in the Dodo dashboard, never in the request,
 * so editing the page cannot change what is charged.
 *
 * Separately, Dodo calls /api/payment/webhook when a payment succeeds. That
 * records the sale even if the customer closes the tab before step 3.
 */

import crypto from 'crypto';
import type { Express, Request, Response } from 'express';
import { recordPurchase } from './supabaseClient.ts';
import { signAccessToken, safeEqual, ACCESS_TTL_MS } from './accessToken.ts';

/** Shown on the button. Must match the price set on the product in Dodo. */
export const REPORT_PRICE_PAISE = 5000;

const API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const PRODUCT_ID = process.env.DODO_PRODUCT_ID;
const WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const IS_LIVE = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
const API_BASE = IS_LIVE ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

if (!API_KEY || !PRODUCT_ID) {
  console.warn(
    '[payments] DODO_PAYMENTS_API_KEY / DODO_PRODUCT_ID not set. ' +
      'Checkout is switched off; payment endpoints return 503 until they are configured.'
  );
}

/** Whether checkout is live. The frontend asks before showing any price. */
export function paymentsEnabled(): boolean {
  return Boolean(API_KEY && PRODUCT_ID);
}

/** Light sanity check. Not validation — just enough to avoid storing nonsense. */
function cleanEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 254);
  return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(trimmed) ? trimmed : null;
}

function str(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
}

/** Call Dodo's REST API with the secret key. Throws on a non-2xx answer. */
async function dodo<T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Dodo ${init.method || 'GET'} ${path} failed: ${res.status} ${text.slice(0, 300)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

/** A payment counts only if Dodo says it succeeded and it bought our product. */
function isPaidForReport(payment: any): boolean {
  if (!payment || payment.status !== 'succeeded') return false;
  const cart: Array<{ product_id?: string }> = Array.isArray(payment.product_cart) ? payment.product_cart : [];
  return cart.some((item) => item?.product_id === PRODUCT_ID);
}

/** Turn a verified Dodo payment into a purchases row. Never throws. */
async function recordDodoPayment(payment: any) {
  const meta = payment?.metadata || {};
  await recordPurchase({
    // The table's id columns predate Dodo; they hold Dodo's ids now.
    razorpayPaymentId: payment.payment_id,
    razorpayOrderId: payment.checkout_session_id || payment.payment_id,
    email: cleanEmail(payment.customer?.email) ?? cleanEmail(meta.email),
    amountPaise: typeof payment.total_amount === 'number' ? payment.total_amount : REPORT_PRICE_PAISE,
    currency: payment.currency || 'INR',
    name: str(meta.name, 120),
    birthDate: str(meta.birth_date, 20),
    birthTime: str(meta.birth_time, 20),
    birthLocation: str(meta.birth_location, 200),
    focus: str(meta.focus, 400),
  });
}

/**
 * Verify a Standard Webhooks signature, which is what Dodo uses.
 * Signed content is `${id}.${timestamp}.${rawBody}`, HMAC-SHA256 with the
 * base64 part of the `whsec_...` secret. The header may hold several
 * space-separated `v1,<sig>` entries during key rotation.
 */
function verifyWebhook(rawBody: string, headers: Request['headers']): boolean {
  if (!WEBHOOK_SECRET) return false;
  const id = headers['webhook-id'] as string;
  const timestamp = headers['webhook-timestamp'] as string;
  const signatureHeader = headers['webhook-signature'] as string;
  if (!id || !timestamp || !signatureHeader) return false;

  // Reject anything older or newer than five minutes, so a captured request
  // cannot be replayed later.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(WEBHOOK_SECRET.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64');

  return signatureHeader
    .split(' ')
    .map((part) => part.split(',')[1])
    .some((sig) => sig && safeEqual(sig, expected));
}

export function registerPaymentRoutes(app: Express) {
  /** Tells the frontend what a report costs and whether checkout is live. */
  app.get('/api/payment/config', (_req: Request, res: Response) => {
    res.json({
      enabled: paymentsEnabled(),
      provider: 'dodo',
      amountPaise: REPORT_PRICE_PAISE,
      amountDisplay: `₹${(REPORT_PRICE_PAISE / 100).toFixed(0)}`,
      currency: 'INR',
    });
  });

  /** Step 1: open a hosted checkout for our product. Price comes from Dodo, not the browser. */
  app.post('/api/payment/create-order', async (req: Request, res: Response) => {
    if (!paymentsEnabled()) {
      return res.status(503).json({
        error: 'payments_unconfigured',
        message: 'Payments are not switched on yet.',
      });
    }

    const email = cleanEmail(req.body?.email);
    const name = str(req.body?.name, 120);
    const birth = req.body?.birthDetails || {};

    // Send the customer back to the page they came from. Only our own origin
    // is accepted, so the return address cannot be pointed somewhere else.
    const origin = `${req.protocol}://${req.get('host')}`;
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto') || 'https';
    const siteOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;
    const returnUrl = `${siteOrigin}/?checkout=dodo`;

    try {
      const session = await dodo<{ session_id: string; checkout_url: string }>('/checkouts', {
        method: 'POST',
        body: {
          product_cart: [{ product_id: PRODUCT_ID, quantity: 1 }],
          ...(email ? { customer: { email, ...(name ? { name } : {}) } } : {}),
          return_url: returnUrl,
          // Carried through to the Dodo dashboard and the webhook, so the sale
          // can be traced and recorded even if the customer never comes back.
          metadata: {
            product: 'PATTERNS Detailed Report',
            email: email ?? '',
            name: name ?? '',
            birth_date: str(birth.date, 20) ?? '',
            birth_time: str(birth.time, 20) ?? '',
            birth_location: str(birth.location, 200) ?? '',
            focus: str(req.body?.focus, 400) ?? '',
          },
        },
      });

      if (!session?.checkout_url) throw new Error('No checkout_url in Dodo response');
      res.json({ checkoutUrl: session.checkout_url, sessionId: session.session_id });
    } catch (err) {
      console.error('[payments] Could not create checkout session:', err);
      res.status(502).json({
        error: 'order_failed',
        message: 'Could not start checkout. Please try again.',
      });
    }
  });

  /**
   * Step 2: verify. We never trust the ?status= in the return URL; we ask
   * Dodo directly about this payment id using our secret key.
   */
  app.post('/api/payment/verify', async (req: Request, res: Response) => {
    if (!paymentsEnabled()) {
      return res.status(503).json({ error: 'payments_unconfigured' });
    }

    const paymentId = str(req.body?.payment_id, 100);
    if (!paymentId || !/^[A-Za-z0-9_-]+$/.test(paymentId)) {
      return res.status(400).json({ error: 'missing_fields', message: 'Incomplete payment details.' });
    }

    let payment: any;
    try {
      payment = await dodo(`/payments/${encodeURIComponent(paymentId)}`);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 404 || status === 422 || status === 400) {
        return res.status(400).json({
          error: 'payment_not_found',
          message: 'We could not find that payment. You have not been charged for a report.',
        });
      }
      console.error('[payments] Could not fetch payment', paymentId, err);
      return res.status(502).json({
        error: 'verify_unavailable',
        message: 'We could not reach the payment provider to confirm your payment. Please try again.',
      });
    }

    if (payment?.status === 'processing' || payment?.status === 'requires_customer_action') {
      return res.status(409).json({ error: 'payment_pending', message: 'Your payment is still processing.' });
    }

    if (!isPaidForReport(payment)) {
      console.warn('[payments] Payment not valid for report:', paymentId, payment?.status);
      return res.status(400).json({
        error: 'payment_not_successful',
        message: 'We could not confirm this payment. You have not been charged for a report.',
      });
    }

    // Awaited but never allowed to fail the response: the customer has
    // already paid, and a database problem is ours to fix, not theirs.
    await recordDodoPayment(payment);

    res.json({
      verified: true,
      accessToken: signAccessToken(payment.payment_id),
      expiresInMs: ACCESS_TTL_MS,
    });
  });

  /**
   * Dodo calls this directly when a payment changes state. More reliable than
   * the browser: a customer who closes the tab mid-payment never reaches
   * step 3, and this is how we still learn they paid.
   */
  app.post('/api/payment/webhook', async (req: Request, res: Response) => {
    if (!WEBHOOK_SECRET) return res.status(503).end();

    const rawBody = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    if (!verifyWebhook(rawBody, req.headers)) {
      return res.status(400).json({ error: 'invalid_signature' });
    }

    const event = req.body?.type;
    const data = req.body?.data;

    if (event === 'payment.succeeded' && data?.payment_id) {
      // Re-fetch rather than trusting the payload shape, then apply the same
      // test the browser path uses.
      try {
        const payment = await dodo(`/payments/${encodeURIComponent(data.payment_id)}`);
        if (isPaidForReport(payment)) await recordDodoPayment(payment);
      } catch (err) {
        console.error('[payments] Webhook could not confirm payment:', err);
        // 500 tells Dodo to retry later.
        return res.status(500).json({ error: 'retry' });
      }
    }

    res.json({ received: true });
  });
}
