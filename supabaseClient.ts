/**
 * Server-side Supabase access for purchase records.
 *
 * This module uses the SERVICE ROLE key, which bypasses row level security and
 * can read and write anything. It must therefore never be imported by anything
 * that ships to the browser — only by server code. The `purchases` table has
 * RLS enabled with no policies, so the browser's publishable key can read
 * nothing even if it were exposed.
 *
 * Everything here degrades quietly. If the environment variables are missing,
 * the client is null and each function logs and returns instead of throwing.
 * A database outage should cost you the record of a sale, not the sale itself:
 * the customer has already paid by the time we write anything, and failing
 * their request at that point would be the worst possible moment to fail.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else {
  console.warn(
    '[db] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. ' +
      'Purchases will not be recorded. Payments still work; you just lose the record.'
  );
}

export function isDatabaseConfigured(): boolean {
  return supabase !== null;
}

export type PurchaseInput = {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  email?: string | null;
  amountPaise: number;
  currency?: string;
  name?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  birthLocation?: string | null;
  focus?: string | null;
};

/**
 * Record a payment that has already had its signature verified.
 *
 * Upserts on razorpay_payment_id so a repeated verification of the same
 * payment updates one row rather than creating duplicates.
 */
export async function recordPurchase(input: PurchaseInput): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('purchases').upsert(
    {
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_order_id: input.razorpayOrderId,
      email: input.email ?? null,
      amount_paise: input.amountPaise,
      currency: input.currency ?? 'INR',
      status: 'paid',
      name: input.name ?? null,
      birth_date: input.birthDate ?? null,
      birth_time: input.birthTime ?? null,
      birth_location: input.birthLocation ?? null,
      focus: input.focus ?? null,
    },
    { onConflict: 'razorpay_payment_id' }
  );

  if (error) {
    // Deliberately not thrown. See the note at the top of this file.
    console.error('[db] Could not record purchase:', error.message);
  }
}

/** Attach the generated report to its purchase, so it can be reopened later. */
export async function attachReport(paymentId: string, report: unknown): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('purchases')
    .update({ report })
    .eq('razorpay_payment_id', paymentId);

  if (error) {
    console.error('[db] Could not attach report to purchase:', error.message);
  }
}

/**
 * Fetch a previously generated report for a payment.
 *
 * Keyed on the payment id, which the caller can only know by holding a valid
 * signed access token. There is deliberately no lookup by email: an endpoint
 * that returns someone's reading given only their address would let anyone
 * read anyone else's by guessing.
 */
export async function getStoredReport(paymentId: string): Promise<unknown | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('purchases')
    .select('report')
    .eq('razorpay_payment_id', paymentId)
    .maybeSingle();

  if (error) {
    console.error('[db] Could not read stored report:', error.message);
    return null;
  }
  return data?.report ?? null;
}
