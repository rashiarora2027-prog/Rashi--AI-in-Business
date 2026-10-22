/**
 * The paid detailed reading: checkout, then the report.
 *
 * Stages run intro -> paying (redirect to Dodo's hosted checkout) and, on
 * return, verifying -> generating -> report, with error as a side exit. The access token lives in component state and is also handed back to
 * the server on retry, so a failed generation after a successful payment can
 * be recovered without charging again — the server returns the stored report
 * for a payment that already produced one.
 *
 * Opens above the free reading rather than replacing it, so closing this
 * returns you to the reflection you were already given.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  /** What they were already reflecting on, carried into the paid reading. */
  focusHint?: string;
  /**
   * Set when the customer has just come back from Dodo's hosted checkout.
   * The modal then skips the offer, confirms the payment server-side and
   * goes straight to the reading.
   */
  returningPaymentId?: string;
};

type Stage = 'intro' | 'paying' | 'verifying' | 'generating' | 'report' | 'error';

type ReportContext = {
  name?: string;
  birthDetails: { date?: string; time?: string; location?: string };
  focus?: string;
  email?: string;
};

/**
 * Checkout happens on Dodo's own page, which means leaving this site. What the
 * customer typed here is parked in localStorage so the reading can be built
 * from it when they come back.
 */
const PENDING_KEY = 'patterns_pending_report';

function savePending(ctx: ReportContext) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(ctx));
  } catch {
    /* private mode: the reading falls back to the saved profile */
  }
}

function loadPending(): ReportContext | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as ReportContext) : null;
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export default function DetailedReportModal({
  isOpen,
  onClose,
  userProfile,
  focusHint,
  returningPaymentId,
}: Props) {
  const [stage, setStage] = useState<Stage>(returningPaymentId ? 'verifying' : 'intro');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState(focusHint ?? '');
  const [price, setPrice] = useState('₹50');
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const [report, setReport] = useState<any>(null);
  const accessTokenRef = useRef<string | null>(null);
  const resumeStarted = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/payment/config')
      .then((r) => r.json())
      .then((cfg) => {
        setPrice(cfg.amountDisplay || '₹50');
        setPaymentsEnabled(Boolean(cfg.enabled));
      })
      .catch(() => setPaymentsEnabled(false));
  }, [isOpen]);

  const currentContext = (): ReportContext => ({
    name: userProfile.name,
    birthDetails: {
      date: userProfile.birthDate,
      time: userProfile.birthTime,
      location: userProfile.birthLocation,
    },
    focus: focus.trim() || undefined,
    email: email.trim(),
  });

  const fetchReport = useCallback(async (accessToken: string, ctx: ReportContext) => {
    setStage('generating');
    try {
      const res = await fetch('/api/detailed-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: ctx.name,
          birthDetails: ctx.birthDetails,
          focus: ctx.focus,
        }),
      });
      if (!res.ok) throw new Error('report_failed');
      setReport(await res.json());
      setStage('report');
      try {
        localStorage.removeItem(PENDING_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      setError(
        'Your payment went through, but the reading could not be generated just now. ' +
          'Nothing further has been charged — press Try again, or email us and we will send it to you.'
      );
      setStage('error');
    }
  }, []);

  /** Ask our server to confirm the payment with Dodo, retrying while it is still processing. */
  const verifyAndLoad = useCallback(
    async (paymentId: string) => {
      setStage('verifying');
      const ctx = loadPending() ?? {
        name: userProfile.name,
        birthDetails: {
          date: userProfile.birthDate,
          time: userProfile.birthTime,
          location: userProfile.birthLocation,
        },
      };

      for (let attempt = 0; attempt < 6; attempt++) {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId }),
        }).catch(() => null);

        if (res?.ok) {
          const { accessToken } = await res.json();
          accessTokenRef.current = accessToken;
          await fetchReport(accessToken, ctx);
          return;
        }
        // 409 = still processing, 502 = could not reach Dodo: wait and retry.
        if (res && res.status !== 409 && res.status !== 502) break;
        await new Promise((r) => setTimeout(r, 2500));
      }

      setError(
        'We could not confirm that payment. If money has left your account, it will be ' +
          'returned automatically within a few days — or email us with your receipt and we will sort it out.'
      );
      setStage('error');
    },
    [userProfile.name, userProfile.birthDate, userProfile.birthTime, userProfile.birthLocation, fetchReport]
  );

  // Coming back from Dodo's checkout: confirm once, then show the reading.
  useEffect(() => {
    if (!isOpen || !returningPaymentId || resumeStarted.current) return;
    resumeStarted.current = true;
    verifyAndLoad(returningPaymentId);
  }, [isOpen, returningPaymentId, verifyAndLoad]);

  const startPayment = useCallback(async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter an email we can send your reading to.');
      return;
    }
    setError('');
    setStage('paying');

    const ctx = currentContext();
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      if (!orderRes.ok) throw new Error('order_failed');
      const { checkoutUrl } = await orderRes.json();
      if (!checkoutUrl) throw new Error('no_checkout_url');

      savePending(ctx);
      // Off to Dodo's secure page. They send the customer back here afterwards.
      window.location.href = checkoutUrl;
    } catch {
      setError('Could not start checkout. Please try again in a moment.');
      setStage('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, focus, userProfile.name, userProfile.birthDate, userProfile.birthTime, userProfile.birthLocation]);

  const retry = () => {
    setError('');
    if (accessTokenRef.current) {
      // Already paid: regenerate without charging again.
      fetchReport(accessTokenRef.current, loadPending() ?? currentContext());
    } else if (returningPaymentId) {
      verifyAndLoad(returningPaymentId);
    } else {
      setStage('intro');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#F6F2EB] border border-[#DFD1BE] shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full w-8 h-8 flex items-center justify-center text-[#7A6A56] hover:bg-[#E8DDCD] cursor-pointer"
        >
          ✕
        </button>

        <div className="p-7 md:p-10">
          {stage === 'intro' && (
            <>
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold block mb-3">
                THE DETAILED READING
              </span>
              <h2 className="mb-4 font-serif text-3xl text-[#1F1B16] font-normal">
                The whole chart<span className="font-serif italic text-[#8B6E46]">,</span> not just this moment.
              </h2>
              <p className="mb-5 text-[15px] leading-relaxed text-[#4C4337]">
                The reflection you just read is complete in itself. This goes further into the same
                chart it came from: your Lagna, Moon and Sun read one by one, the Vimshottari period
                you are actually running, four areas of life taken separately, the patterns that keep
                returning, and the months ahead window by window.
              </p>

              <ul className="mb-6 space-y-2">
                {[
                  'Your Ascendant, Moon and Sun, read individually',
                  'The Dasha period you are running, and what it asks of you',
                  'Work, relationships, inner life and body — separately',
                  'Recurring patterns, where they come from, how they loosen',
                  'The coming months, and a practice to sit with',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-[#5C5042]">
                    <span className="text-[#8B6E46] font-serif mt-px shrink-0">✶</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <label className="mb-1.5 block text-xs font-medium text-[#4C4337]">
                Where should we send it?
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-4 w-full rounded-lg border border-[#DECDBB] bg-white/70 p-3 text-sm text-[#241F1A] placeholder:text-[#A8977F] focus:border-[#8B6E46] focus:outline-none"
              />

              <label className="mb-1.5 block text-xs font-medium text-[#4C4337]">
                Anything particular on your mind? <span className="text-[#8A7B68]">(optional)</span>
              </label>
              <textarea
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder="A decision you are weighing, a relationship, a question you keep circling…"
                className="mb-5 w-full resize-none rounded-lg border border-[#DECDBB] bg-white/70 p-3 text-sm text-[#241F1A] placeholder:text-[#A8977F] focus:border-[#8B6E46] focus:outline-none"
              />

              {error && <p className="mb-3 text-xs text-[#8C4A3A]">{error}</p>}

              {paymentsEnabled === false ? (
                <p className="rounded-xl bg-[#F0E6D8]/70 border border-[#DAC8B4] p-4 text-sm text-[#5C5042]">
                  Checkout is not switched on yet. The detailed reading is nearly ready — come back
                  shortly.
                </p>
              ) : (
                <>
                  <button
                    onClick={startPayment}
                    disabled={paymentsEnabled === null}
                    className="w-full rounded-full bg-[#181512] py-3.5 text-sm font-medium tracking-wide text-[#F9F7F1] transition hover:bg-[#302821] disabled:opacity-50 cursor-pointer"
                  >
                    {paymentsEnabled === null ? 'Checking…' : `Read the detailed report · ${price}`}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-[#8A7B68]">
                    One payment, no subscription. Reflection, never prediction.
                  </p>
                </>
              )}
            </>
          )}

          {(stage === 'paying' || stage === 'verifying' || stage === 'generating') && (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-5 h-8 w-8 rounded-full border-2 border-[#DECDBB] border-t-[#8B6E46] animate-spin" />
              <p className="text-sm text-[#4C4337]">
                {stage === 'paying'
                  ? 'Opening secure checkout…'
                  : stage === 'verifying'
                    ? 'Confirming your payment…'
                    : 'Reading your chart…'}
              </p>
              {stage === 'generating' && (
                <p className="mt-2 text-xs text-[#8A7B68]">
                  This takes a moment. Please do not close this window.
                </p>
              )}
            </div>
          )}

          {stage === 'error' && (
            <div className="py-10">
              <h3 className="mb-3 font-serif text-2xl text-[#1F1B16]">Something went wrong</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#5C5042]">{error}</p>
              <button
                onClick={retry}
                className="rounded-full bg-[#181512] px-6 py-3 text-sm text-[#F9F7F1] hover:bg-[#302821] cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {stage === 'report' && report && (
            <article className="space-y-8">
              <header>
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold block mb-3">
                  YOUR DETAILED READING
                </span>
                <h2 className="font-serif text-3xl text-[#1F1B16]">{report.title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[#453B2F]">{report.overview}</p>
              </header>

              {report.chartFoundations && (
                <section>
                  <h3 className="mb-3 font-serif text-xl text-[#1F1B16]">Chart foundations</h3>
                  <div className="space-y-3 text-sm leading-relaxed text-[#4C4337]">
                    <p>{report.chartFoundations.lagnaReading}</p>
                    <p>{report.chartFoundations.moonReading}</p>
                    <p>{report.chartFoundations.sunReading}</p>
                  </div>
                </section>
              )}

              {report.dashaNarrative && (
                <section className="rounded-2xl bg-[#F0E6D8]/70 border border-[#DAC8B4] p-5">
                  <h3 className="mb-2 font-serif text-lg text-[#1F1B16]">
                    {report.dashaNarrative.currentPeriod}
                  </h3>
                  <p className="mb-2 text-sm text-[#4C4337]">{report.dashaNarrative.whatItAsks}</p>
                  <p className="text-xs text-[#8A7B68]">{report.dashaNarrative.howLongItLasts}</p>
                </section>
              )}

              {Array.isArray(report.lifeAreas) && (
                <section className="space-y-5">
                  {report.lifeAreas.map((a: any, i: number) => (
                    <div key={i} className="border-l-2 border-[#CBB08A] pl-4">
                      <h4 className="mb-2 text-sm font-semibold text-[#241F1A]">{a.area}</h4>
                      <p className="mb-2 text-sm leading-relaxed text-[#4C4337]">{a.reading}</p>
                      <p className="text-xs italic text-[#8B6E46]">{a.practice}</p>
                    </div>
                  ))}
                </section>
              )}

              {Array.isArray(report.recurringPatterns) && (
                <section>
                  <h3 className="mb-3 font-serif text-xl text-[#1F1B16]">Recurring patterns</h3>
                  <div className="space-y-4">
                    {report.recurringPatterns.map((p: any, i: number) => (
                      <div key={i}>
                        <h4 className="text-sm font-semibold text-[#241F1A]">{p.pattern}</h4>
                        <p className="text-xs text-[#8A7B68]">{p.origin}</p>
                        <p className="mt-1 text-sm text-[#4C4337]">{p.shift}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {Array.isArray(report.comingMonths) && (
                <section>
                  <h3 className="mb-3 font-serif text-xl text-[#1F1B16]">The coming months</h3>
                  <div className="space-y-4">
                    {report.comingMonths.map((w: any, i: number) => (
                      <div key={i}>
                        <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#937C63] font-semibold">
                          {w.window}
                        </h4>
                        <p className="text-sm font-medium text-[#241F1A]">{w.theme}</p>
                        <p className="text-sm text-[#4C4337]">{w.guidance}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {report.reflectionPractice && (
                <section className="rounded-2xl bg-[#1F1B16] p-6 text-[#EFE7DA]">
                  <h3 className="mb-4 font-serif text-xl">To sit with</h3>
                  <p className="mb-2 text-sm">
                    <span className="text-[#A8977F]">Daily — </span>
                    {report.reflectionPractice.dailyQuestion}
                  </p>
                  <p className="mb-4 text-sm">
                    <span className="text-[#A8977F]">Weekly — </span>
                    {report.reflectionPractice.weeklyReview}
                  </p>
                  <p className="font-serif text-lg italic">{report.reflectionPractice.mantra}</p>
                </section>
              )}

              {report.closing && (
                <p className="border-t border-[#E8DDCD] pt-6 text-sm leading-relaxed text-[#4C4337]">
                  {report.closing}
                </p>
              )}

              <button
                onClick={() => window.print()}
                className="w-full rounded-full border border-[#DECDBB] py-3 text-sm text-[#4C4337] hover:bg-[#EFE9DF] cursor-pointer"
              >
                Save as PDF
              </button>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
