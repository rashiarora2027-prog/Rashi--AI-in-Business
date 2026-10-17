/**
 * Razorpay payment layer for PATTERNS.
 *
 * The flow, and where the trust sits:
 *
 *   1. Browser asks /api/payment/create-order    -> we create a ₹50 order
 *   2. Razorpay's checkout opens, the customer pays
 *   3. Browser posts the result to /api/payment/verify
 *   4. We verify Razorpay's signature SERVER-SIDE, record the purchase, and
 *      issue a signed access token
 *   5. Browser sends that token to /api/detailed-report to unlock the report
 *
 * Step 4 is the security boundary. The browser can claim anything — that a
 * payment succeeded, that it was for ₹5000, that it belongs to someone else.
 * None of that is believed. The only thing trusted is an HMAC that could only
 * have been produced by Razorpay using a secret that lives on the server.
 *
 * The amount is likewise fixed here and never read from the request, so
 * editing the page cannot change the price.
 *
 * This file is Razorpay-specific on purpose. What a verified payment entitles
 * you to lives in accessToken.ts, so a second provider for customers outside
 * India can be added beside this one without touching the paid routes.
 */

import crypto from 'crypto';
import Razorpay from 'razorpay';
import type { Express, Request, Response } from 'express';
import { recordPurchase } from './supabaseClient.ts';
import { signAccessToken, safeEqual, ACCESS_TTL_MS } from './accessToken.ts';

/** Price of one detailed report, in paise. 5000 paise = ₹50. */
export const REPORT_PRICE_PAISE = 5000;

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpay: Razorpay | null = null;
if (KEY_ID && KEY_SECRET) {
  razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
} else {
  console.warn(
    '[payments] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set. ' +
      'Checkout is switched off; payment endpoints return 503 until they are configured.'
  );
}

/** Whether checkout is live. The frontend asks before showing any price. */
export function paymentsEnabled(): boolean {
  return razorpay !== null;
}

/** Light sanity check. Not validation — just enough to avoid storing nonsense. */
function cleanEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 254);
  return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(trimmed) ? trimmed : null;
}

export function registerPaymentRoutes(app: Express) {
  /** Tells the frontend what a report costs and whether checkout is live. */
  app.get('/api/payment/config', (_req: Request, res: Response) => {
    res.json({
      enabled: paymentsEnabled(),
      keyId: KEY_ID || null,
      amountPaise: REPORT_PRICE_PAISE,
      amountDisplay: `₹${(REPORT_PRICE_PAISE / 100).toFixed(0)}`,
      currency: 'INR',
    });
  });

  /** Step 1: create the order. Amount is fixed here, never taken from the browser. */
  app.post('/api/payment/create-order', async (req: Request, res: Response) => {
    if (!razorpay) {
      return res.status(503).json({
        error: 'payments_unconfigured',
        message: 'Payments are not switched on yet.',
      });
    }

    const email = cleanEmail(req.body?.email);

    try {
      const order = await razorpay.orders.create({
        amount: REPORT_PRICE_PAISE,
        currency: 'INR',
        receipt: `patterns_${Date.now()}`,
        // Carried through to the Razorpay dashboard, so a payment can be traced
        // back to a person even if our own database write fails.
        notes: { product: 'PATTERNS Detailed Report', email: email ?? '' },
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: KEY_ID,
      });
    } catch (err) {
      console.error('[payments] Could not create order:', err);
      res.status(502).json({
        error: 'order_failed',
        message: 'Could not start checkout. Please try again.',
      });
    }
  });

  /**
   * Step 2: verify. Razorpay signs `order_id|payment_id` with the key secret.
   * Recomputing that HMAC is the only trustworthy proof the payment happened.
   */
  app.post('/api/payment/verify', async (req: Request, res: Response) => {
    if (!KEY_SECRET) {
      return res.status(503).json({ error: 'payments_unconfigured' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      name,
      birthDetails,
      focus,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Incomplete payment details.',
      });
    }

    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeEqual(razorpay_signature, expected)) {
      console.warn('[payments] Signature mismatch for order', razorpay_order_id);
      return res.status(400).json({
        error: 'invalid_signature',
        message: 'We could not verify this payment. You have not been charged for a report.',
      });
    }

    // Recorded only after the signature checks out. Deliberately awaited but
    // never allowed to fail the response: the customer has already paid, and
    // a database problem is ours to fix, not theirs to be blocked by.
    await recordPurchase({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      email: cleanEmail(email),
      amountPaise: REPORT_PRICE_PAISE,
      currency: 'INR',
      name: typeof name === 'string' ? name.slice(0, 120) : null,
      birthDate: birthDetails?.date ?? null,
      birthTime: birthDetails?.time ?? null,
      birthLocation: birthDetails?.location ?? null,
      focus: typeof focus === 'string' ? focus.slice(0, 400) : null,
    });

    res.json({
      verified: true,
      accessToken: signAccessToken(razorpay_payment_id),
      expiresInMs: ACCESS_TTL_MS,
    });
  });

  /**
   * Optional webhook. Razorpay can notify the server directly, which is more
   * reliable than the browser callback — a customer who closes the tab
   * mid-payment never reaches step 3, and without this you would never learn
   * that they paid. Set RAZORPAY_WEBHOOK_SECRET and point Razorpay here.
   *
   * This verifies correctly but does not yet reconcile the payment into the
   * purchases table; see PAYMENTS_SETUP.md.
   */
  app.post('/api/payment/webhook', (req: Request, res: Response) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(503).end();

    const signature = req.headers['x-razorpay-signature'] as string;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (!signature || !safeEqual(signature, expected)) {
      return res.status(400).json({ error: 'invalid_signature' });
    }

    console.log('[payments] Webhook received:', req.body?.event);
    res.json({ received: true });
  });
}
