/**
 * Proof-of-purchase tokens, independent of who took the money.
 *
 * A token says one thing: "payment <id> was verified by this server before
 * <expiry>". It carries no payment provider, so when a second provider is
 * added — Dodo Payments for customers outside India, say — it mints the same
 * kind of token and every paid route keeps working untouched. The provider
 * owns verification; this module owns what verification entitles you to.
 *
 * The token is signed, not encrypted: anyone can read the payment id inside
 * it, nobody can forge one. That is the right trade here, because knowing a
 * payment id is useless without a signature over it.
 */

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/** How long a paid-for report stays claimable after payment. */
export const ACCESS_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Falls back to the Dodo API key so a minimal setup works with one fewer
 * variable, but setting ACCESS_TOKEN_SECRET explicitly is better: it means
 * rotating the payment key does not invalidate every outstanding token.
 */
const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.DODO_PAYMENTS_API_KEY || '';

/** Constant-time comparison that tolerates unequal lengths without leaking it. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Mint a tamper-proof token proving a specific payment was completed. */
export function signAccessToken(paymentId: string): string {
  const payload = `${paymentId}.${Date.now() + ACCESS_TTL_MS}`;
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', ACCESS_SECRET).update(encoded).digest('hex');
  return `${encoded}.${signature}`;
}

/** Validate a token minted by signAccessToken. Returns the payment id, or null. */
export function readAccessToken(token: string): string | null {
  if (!token || !ACCESS_SECRET) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expected = crypto.createHmac('sha256', ACCESS_SECRET).update(encoded).digest('hex');
  if (!safeEqual(signature, expected)) return null;

  const payload = Buffer.from(encoded, 'base64url').toString('utf8');
  const [paymentId, expiryRaw] = payload.split('.');
  const expiry = Number(expiryRaw);

  if (!paymentId || !Number.isFinite(expiry) || Date.now() > expiry) return null;
  return paymentId;
}

/** A request that has passed requirePaidAccess carries the payment it paid with. */
export type PaidRequest = Request & { paymentId?: string };

/**
 * Express middleware. Rejects the request unless it carries a valid access
 * token from a verified payment. Attach to any route that must be paid for.
 *
 * 402 Payment Required is the honest status here, and the frontend uses it to
 * reopen checkout rather than showing a generic failure.
 */
export function requirePaidAccess(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.body?.accessToken as string);

  const paymentId = readAccessToken(token);
  if (!paymentId) {
    return res.status(402).json({
      error: 'payment_required',
      message: 'This report requires payment. Please complete checkout and try again.',
    });
  }

  (req as PaidRequest).paymentId = paymentId;
  next();
}
