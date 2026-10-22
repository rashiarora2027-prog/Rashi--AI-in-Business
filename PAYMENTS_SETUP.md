# Turning on the ₹50 detailed reading (Dodo Payments)

Plain-language guide. With no Dodo keys set, checkout reports itself as
unavailable and the paid route returns 402. That is deliberate — the code can
ship before the paperwork is done.

---

## What was built

| File | What it does |
|---|---|
| `accessToken.ts` | Mints and checks proof-of-purchase tokens. Knows nothing about the payment provider. |
| `payments.ts` | Dodo: opens the hosted checkout, confirms payments with Dodo's API, handles the webhook, records the sale. |
| `detailedReport.ts` | The paid reading itself. Unreachable without a valid token. |
| `supabaseClient.ts` | Writes purchases to the database. Server-only. (Its id columns are still named `razorpay_*`; they now hold Dodo ids.) |
| `src/components/DetailedReportModal.tsx` | What the customer sees: offer → Dodo checkout → back to the site → reading. |

**The price lives on the product in the Dodo dashboard.** `REPORT_PRICE_PAISE`
in `payments.ts` is only what the button displays — keep the two in step.

---

## Step 1 — The product in Dodo

Dodo dashboard (Test Mode) → **Products → Create product** → one-time payment,
₹50 INR, name "PATTERNS Detailed Reading". Copy its **product id** (starts `pdt_`).

## Step 2 — API key

**Developer → API Keys → Create New Key.** It is shown once. The key never goes
in the frontend, never in a chat, never in git. If it leaks, delete it and make
a new one.

## Step 3 — Webhook

**Developer → Webhooks → Add endpoint**:
`https://thepatterns.app/api/payment/webhook`, subscribed to `payment.succeeded`.
Copy the **signing secret** (starts `whsec_`).

## Step 4 — Put them in Vercel

**Settings → Environment Variables**, type **Sensitive** for the secrets:

| Name | Value |
|---|---|
| `DODO_PAYMENTS_API_KEY` | API key from step 2 |
| `DODO_PRODUCT_ID` | Product id from step 1 |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | Signing secret from step 3 |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` (later `live_mode`) |
| `ACCESS_TOKEN_SECRET` | Any long random string you invent |
| `SUPABASE_URL` | `https://bfqggpejdpwwrdiegurg.supabase.co` (optional, for sales records) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (optional) |
| `GEMINI_API_KEY` | Already set |

**Redeploy afterwards.** Environment variables only apply to new builds.

## Step 5 — Test it

Dodo test mode accepts the test card `4242 4242 4242 4242`, any future expiry,
any CVV. No money moves. Check that:

- The modal shows ₹50 and sends you to Dodo's checkout page
- After paying you land back on the site and the reading appears
- The payment appears under **Transactions** in Dodo (Test Mode)
- **Calling `/api/detailed-report` without paying returns 402** ← the important one

## Step 6 — Going live

Only after Dodo approves your account verification (and the Product
Information Form). Then, in **Live Mode**: create the same product, a live API
key and a live webhook, and swap `DODO_PAYMENTS_API_KEY`, `DODO_PRODUCT_ID`,
`DODO_PAYMENTS_WEBHOOK_SECRET` in Vercel, with `DODO_PAYMENTS_ENVIRONMENT=live_mode`.
No code changes.

---

## How the security works

The browser can lie. It can claim a payment succeeded when it did not. So the
server never takes its word — not even the `?status=succeeded` Dodo puts in the
return address, which anyone can type.

Instead `payments.ts` asks Dodo's API directly, using the secret key, about the
payment id. Only if Dodo says it **succeeded** and it bought **our product** is
an access token issued.

The webhook is checked with the Standard Webhooks signature Dodo sends
(HMAC-SHA256 over id, timestamp and the exact body), rejects anything older
than five minutes, and re-fetches the payment from Dodo before recording it.

Verified against the built server with a simulated Dodo:

| Request | Result |
|---|---|
| Report with no token / forged token | 402 |
| Verify a succeeded payment for our product | token issued |
| Verify a payment for a different product | rejected |
| Verify a failed or made-up payment | rejected |
| Webhook with valid signature | accepted |
| Webhook with forged signature or old timestamp | rejected |

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

**A buyer who closes the tab on Dodo's page** is still recorded by the webhook,
but does not see the reading until you send it. Their details are in the
Dodo payment's metadata and the Supabase row.

**Refunds are manual**, from the Dodo dashboard.

**₹50 is low for card fees.** Dodo's per-payment fee takes a large share of
₹50. Consider a higher price once it is working.

**`npm install` needs legacy peer resolution.** `vite@8` wants a newer esbuild
than this project pins. Vercel currently works around it automatically, but it
is a latent trap — worth fixing properly by bumping esbuild.

---

## Your legal obligations

Taking money from the public in India brings requirements this code does not
cover. Dodo will ask for most of them during verification:

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
