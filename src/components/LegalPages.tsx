/**
 * Terms, Privacy, Refunds and Contact.
 *
 * These four routes previously rendered the homepage: the hash router did not
 * know them, so #/privacy quietly showed the hero and a visitor looking for a
 * privacy policy concluded there wasn't one. Payment providers check for these
 * pages during activation, and since the app now stores birth details and email
 * addresses, India's DPDP Act requires the privacy notice regardless of what any
 * gateway asks for.
 *
 * Written plainly and narrowly. It is tempting to pad a policy with inherited
 * boilerplate about cookies and third-party advertising partners that do not
 * exist here; that is worse than useless, because it describes a different
 * product and nobody can tell which parts are true. Everything below describes
 * what this app actually does today.
 *
 * NOT LEGAL ADVICE. This is a plain-language starting point written by the
 * engineer who built the thing, not by a lawyer. Have it reviewed before
 * trading at any volume.
 */

import { useEffect } from 'react';

/**
 * Shown wherever the policies tell someone how to reach a human.
 *
 * Deliberately a placeholder: publishing a personal address on a public page is
 * the operator's decision to make, not one to be made for them. Replace this
 * with a real monitored inbox before taking payments — a support address that
 * bounces is worse than none, and gateways do check.
 */
const CONTACT_EMAIL = 'hello@thepatterns.app';

/** Last substantive revision; update when the text below changes. */
const UPDATED = '6 November 2026';

export type LegalRoute = 'terms' | 'privacy' | 'refunds' | 'contact';

const TITLES: Record<LegalRoute, { eyebrow: string; title: string }> = {
  terms: { eyebrow: 'The agreement', title: 'Terms of Service' },
  privacy: { eyebrow: 'What we keep', title: 'Privacy Policy' },
  refunds: { eyebrow: 'If you want your money back', title: 'Refund Policy' },
  contact: { eyebrow: 'Reaching a person', title: 'Contact' },
};

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-serif text-xl text-[#1F1B16] mb-2.5">{heading}</h2>
      <div className="space-y-3 text-[13px] sm:text-sm text-[#4C4337] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function LegalPages({
  route,
  onHome,
}: {
  route: LegalRoute;
  onHome: () => void;
}) {
  // A policy page opened from a footer link should start at the top, not wherever
  // the homepage happened to be scrolled to.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  const { eyebrow, title } = TITLES[route];

  return (
    <div className="w-full max-w-[760px] mx-auto px-6 md:px-10 py-12 sm:py-16 text-left">
      <nav className="text-[11px] text-[#8A7B68] mb-7">
        <button
          type="button"
          onClick={onHome}
          className="hover:text-[#1F1B16] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span className="mx-1.5">/</span>
        <span className="text-[#5C5042]">{title}</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.25em] text-[#937C63] font-semibold block mb-2">
        {eyebrow}
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl text-[#1F1B16] mb-2">{title}</h1>
      <p className="text-xs text-[#8A7B68] mb-10">Last updated {UPDATED}</p>

      {route === 'terms' && (
        <>
          <Section heading="What PATTERNS is">
            <p>
              PATTERNS calculates your Vedic (sidereal) birth chart from the date,
              time and place of birth you give us, and uses it as the basis for
              written reflections. The astronomy is real: positions are computed
              with established algorithms and the Lahiri ayanamsa. The readings
              are written by a language model working from those positions.
            </p>
            <p>
              The service is offered for reflection and self-examination. It does
              not predict events, and it is not a substitute for medical,
              psychological, legal or financial advice. If you are dealing with
              something serious, please speak to a qualified professional.
            </p>
          </Section>

          <Section heading="What you agree to">
            <p>
              Use the service for yourself, and don’t try to break it, overload
              it, resell it, or scrape it. Don’t enter another living person’s
              birth details for a compatibility reading unless they are happy for
              you to do so.
            </p>
            <p>
              You must be 18 or older to buy a reading. The free readings are
              written for adults too.
            </p>
          </Section>

          <Section heading="Payment">
            <p>
              Everything on the site is free except the detailed reading, which is
              a single payment of ₹50 for that reading. It is not a subscription
              and nothing renews. Payment is handled by our payment provider; we
              never see or store your card details.
            </p>
          </Section>

          <Section heading="What we don’t promise">
            <p>
              Readings are generated, so no two are identical and we cannot
              guarantee any particular content, tone or outcome. The service is
              provided as it is. We are not liable for decisions you make after
              reading something here — the reading is a mirror, and what you do
              next is yours.
            </p>
            <p>
              We may change or withdraw features. If we change these terms
              materially, the date above changes.
            </p>
          </Section>

          <Section heading="Governing law">
            <p>
              These terms are governed by the laws of India, and the courts of
              Pune, Maharashtra have jurisdiction.
            </p>
          </Section>
        </>
      )}

      {route === 'privacy' && (
        <>
          <Section heading="What we collect">
            <p>
              <strong>Birth details</strong> — the name, date, time and place of
              birth you type in. These are what the chart is calculated from. They
              are kept in your own browser so you don’t have to re-enter them.
            </p>
            <p>
              <strong>Your email address</strong> — only if you buy the detailed
              reading, so the purchase can be tied to something and so we can send
              you the reading if you ask for it again.
            </p>
            <p>
              <strong>What you write</strong> — the feeling or question you
              describe is sent to the model that writes your reading. For a paid
              reading it is stored alongside the purchase.
            </p>
            <p>
              <strong>Basic usage analytics</strong> — we use Microsoft Clarity to
              see which parts of the site people struggle with. It records
              interactions with pages, not your identity.
            </p>
          </Section>

          <Section heading="Who else sees it">
            <p>
              The text of your reading request goes to Google’s Gemini API, which
              generates the reading. Purchases are recorded in our database, hosted
              by Supabase. Payments are processed by our payment provider, who
              handles your card details directly — we never receive them.
            </p>
            <p>We do not sell your data, and we do not use it for advertising.</p>
          </Section>

          <Section heading="Your rights under the DPDP Act">
            <p>
              You can ask us what we hold about you, ask us to correct it, or ask
              us to delete it. Write to{' '}
              <a className="underline hover:text-[#1F1B16]" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{' '}
              and we will act within 30 days.
            </p>
            <p>
              Clearing your browser storage removes the birth details held on your
              own device immediately, without asking us.
            </p>
          </Section>

          <Section heading="How long we keep it">
            <p>
              Purchase records are kept as long as we are required to keep
              financial records. Birth details attached to a purchase are deleted
              on request. Free readings are not stored on our servers at all.
            </p>
          </Section>
        </>
      )}

      {route === 'refunds' && (
        <>
          <Section heading="The short version">
            <p>
              If the detailed reading didn’t generate, didn’t arrive, or you were
              charged twice, write to us and we will refund you in full. No
              argument.
            </p>
          </Section>

          <Section heading="How to ask">
            <p>
              Email{' '}
              <a className="underline hover:text-[#1F1B16]" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{' '}
              within 7 days of the payment, from the address you used at checkout.
              Tell us roughly when you paid. We’ll confirm within 2 working days and
              the money goes back to the card or account it came from, usually within
              5–7 working days after that.
            </p>
          </Section>

          <Section heading="Where it gets harder">
            <p>
              A reading that generated and that you read is a delivered product, so
              we can’t generally refund one simply because you disagreed with it —
              the same way a book isn’t returnable because you didn’t like the
              ending. That said, we would rather refund someone than have them feel
              cheated. Ask, and tell us what went wrong.
            </p>
          </Section>
        </>
      )}

      {route === 'contact' && (
        <>
          <Section heading="Email">
            <p>
              <a className="underline hover:text-[#1F1B16]" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              One person reads this, so replies take a day or two rather than
              minutes.
            </p>
          </Section>

          <Section heading="What to write about">
            <p>
              Refunds and payment problems, deleting your data, something on the
              site being broken, or a reading that didn’t make sense. All of it is
              welcome — a bug report is a favour.
            </p>
          </Section>

          <Section heading="What we can’t do">
            <p>
              We can’t give readings by email, and we can’t advise on medical,
              legal or financial matters. If something urgent is going on, please
              reach a professional rather than this inbox.
            </p>
          </Section>
        </>
      )}

      <div className="mt-12 pt-6 border-t border-[#E7DCCB]">
        <button
          type="button"
          onClick={onHome}
          className="text-xs text-[#8A7155] hover:text-[#1F1B16] transition-colors cursor-pointer"
        >
          ← Back to PATTERNS
        </button>
      </div>
    </div>
  );
}
