# Turning on the ₹50 detailed reading

Plain-language guide. Nothing here is switched on yet: with no Razorpay keys
set, checkout reports itself as unavailable and the paid route returns 402.
That is deliberate — the code can ship before the paperwork is done.

---

## What was built

| File | What it does |
|---|---|
| `accessToken.ts` | Mints and checks proof-of-purchase tokens. Deliberately knows nothing about Razorpay, so a second payment provider can reuse it. |
| `payments.ts` | Razorpay: creates the order, verifies the signature, records the sale. |
| `detailedReport.ts` | The paid reading itself. Unreachable without a valid token. |
| `supabaseClient.ts` | Writes purchases to the database. Server-only. |
| `src/components/DetailedReportModal.tsx` | What the customer sees: offer → checkout → reading. |

The price lives in **one place**: `REPORT_PRICE_PAISE` at the top of
`payments.ts`. It is in paise, so `5000` means ₹50. Change that number and
nothing else.

---

## Step 1 — Razorpay keys

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Stay in **Test Mode** (toggle at the top) until you have tested it
3. **Settings → API Keys → Generate Test Key**
4. You get a **Key ID** (starts `rzp_test_`) and a **Key Secret**

The secret never goes in the frontend, never in a chat, never in git. If it
leaks, regenerate it from the same screen.

## Step 2 — Supabase service key

The database already exists (project `patterns`, table `purchases`). You need
its service role key:

1. Open your Supabase project → **Settings → API**
2. Copy the **service_role** key — not the anon/publishable one

This key bypasses row-level security, which is exactly why it must live only in
Vercel's environment variables and never reach the browser.

## Step 3 — Put them in Vercel

**Settings → Environment Variables**, type **Secret** for all of these:

| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Your Key ID |
| `RAZORPAY_KEY_SECRET` | Your Key Secret |
| `ACCESS_TOKEN_SECRET` | Any long random string you invent |
| `SUPABASE_URL` | `https://bfqggpejdpwwrdiegurg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The service_role key from step 2 |
| `GEMINI_API_KEY` | Already set |

**Redeploy afterwards.** Environment variables only apply to new builds.

## Step 4 — Test it

Razorpay's test mode gives you fake cards that behave like real ones. The
standard one is `4111 1111 1111 1111`, any future expiry, any CVV. No money
moves.

Check that:

- The modal opens and shows ₹50
- Checkout accepts the test card
- The reading appears afterwards
- A row appears in the Supabase `purchases` table
- **Calling `/api/detailed-report` without paying returns 402** ← the important one

## Step 5 — Going live

Only after Razorpay approves your KYC: PAN, bank account, business details,
usually a few days. Then generate **Live** keys and swap the two values in
Vercel. No code changes.

---

## How the security works

The browser can lie. It can claim a payment succeeded when it did not. So the
server never takes its word.

When a payment completes, Razorpay returns a signature — a fingerprint made by
combining the order ID and payment ID with your key secret. Only Razorpay and
your server know that secret, so only they can produce a matching fingerprint.
`payments.ts` recomputes it and compares using a constant-time comparison. If
it does not match, no reading.

The amount is set **server-side**, so nobody can edit the page and pay ₹1.

Verified against the built server:

| Request | Result |
|---|---|
| Report with no token | 402 |
| Report with an invented token | 402 |
| Report with a valid token, one character changed | 402 |
| Verify with a forged signature | rejected |
| Verify with a genuine signature | token issued |

---

## Known limitations

Worth knowing before you take real money.

**No email is actually sent.** The checkout collects an address and stores it,
and the reading is saved against the purchase so it *can* be sent — but
nothing sends it. Wiring that up needs an email provider (Resend is the usual
choice, free for low volume). Until then the buyer sees their reading once, in
the browser, and can save it as a PDF.

**No retrieval link.** A buyer who closes the tab cannot get back in on their
own. There is deliberately no "look up my reading by email" endpoint, because
that would let anyone read anyone else's by guessing an address. Proper
retrieval needs a one-time link sent by email.

**Access tokens last 24 hours and are not revocable.** For ₹50 that is a fair
trade. If you raise the price substantially, revisit it.

**The webhook is a stub.** `/api/payment/webhook` verifies signatures correctly
but does nothing with the result. Worth finishing: if a customer closes the tab
mid-payment, the browser never reports back, and the webhook is the only way
you would learn they paid.

**Refunds are manual**, from the Razorpay dashboard.

**`npm install` needs legacy peer resolution.** `vite@8` wants a newer esbuild
than this project pins. Vercel currently works around it automatically, but it
is a latent trap — worth fixing properly by bumping esbuild.

---

## Selling outside India

Razorpay is built for Indian businesses taking rupees. For US or European
customers, a merchant-of-record service such as Dodo Payments handles foreign
sales tax and cross-border compliance by becoming the legal seller.

The important part is the pricing, not the plumbing: ₹50 is about $0.57, and
card processing costs roughly 30–50 cents *per transaction* regardless of size.
At that price you would keep around a quarter of the sale. US pricing needs to
be around **$5**, where fees take roughly 12% instead of 75%.

`accessToken.ts` is provider-agnostic precisely so this can be added beside
Razorpay rather than replacing it: route Indian visitors to Razorpay at ₹50 and
everyone else to Dodo at $5.

---

## Your legal obligations

Taking money from the public in India brings requirements this code does not
cover. Razorpay will ask for most of them during KYC:

- Terms of Service, Privacy Policy, Refund Policy and Contact page on the site
- A clear statement of what the customer gets for ₹50, before they pay
- GST registration once you cross the threshold
- An accurate description of the service

Two that matter especially here:

**You are now storing personal data** — email addresses, birth dates, birth
places. That requires a privacy policy saying what you keep and why, and under
India's DPDP Act, a way for people to ask for deletion.

**Keep the paid reading honest.** The system prompts insist on reflective
rather than predictive language, and the paid prompt repeats that instruction
deliberately. Charging money raises the standard rather than lowering it: do
not let the detailed report drift into claiming it predicts outcomes, and never
present it as a substitute for professional advice.
