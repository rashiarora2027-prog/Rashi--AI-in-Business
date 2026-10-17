/**
 * The paid detailed reading: checkout, then the report.
 *
 * Stages run intro -> paying -> generating -> report, with error as a side
 * exit. The access token lives in component state and is also handed back to
 * the server on retry, so a failed generation after a successful payment can
 * be recovered without charging again — the server returns the stored report
 * for a payment that already produced one.
 *
 * Opens above the free reading rather than replacing it, so closing this
 * returns you to the reflection you were already given.
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  /** What they were already reflecting on, carried into the paid reading. */
  focusHint?: string;
};

type Stage = 'intro' | 'paying' | 'generating' | 'report' | 'error';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export default function DetailedReportModal({ isOpen, onClose, userProfile, focusHint }: Props) {
  const [stage, setStage] = useState<Stage>('intro');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState(focusHint ?? '');
  const [price, setPrice] = useState('₹50');
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const [report, setReport] = useState<any>(null);

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

  const birthDetails = {
    date: userProfile.birthDate,
    time: userProfile.birthTime,
    location: userProfile.birthLocation,
  };

  const fetchReport = useCallback(
    async (accessToken: string) => {
      setStage('generating');
      try {
        const res = await fetch('/api/detailed-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: userProfile.name,
            birthDetails,
            focus: focus.trim() || undefined,
          }),
        });
        if (!res.ok) throw new Error('report_failed');
        setReport(await res.json());
        setStage('report');
      } catch {
        setError(
          'Your payment went through, but the reading could not be generated just now. ' +
            'Nothing further has been charged. Email us and we will send it to you.'
        );
        setStage('error');
      }
    },
    [userProfile.name, userProfile.birthDate, userProfile.birthTime, userProfile.birthLocation, focus]
  );

  const startPayment = useCallback(async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter an email we can send your reading to.');
      return;
    }
    setError('');
    setStage('paying');

    const scriptReady = await loadRazorpayScript();
    if (!scriptReady) {
      setError('Could not reach the payment provider. Please check your connection.');
      setStage('error');
      return;
    }

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!orderRes.ok) throw new Error('order_failed');
      const order = await orderRes.json();

      const rzp = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'PATTERNS',
        description: 'Detailed Reading',
        theme: { color: '#1F1B16' },
        prefill: { name: userProfile.name || undefined, email: email.trim() },
        modal: { ondismiss: () => setStage('intro') },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              email: email.trim(),
              name: userProfile.name,
              birthDetails,
              focus: focus.trim() || undefined,
            }),
          });

          if (!verifyRes.ok) {
            setError(
              'We could not verify that payment. If money has left your account, ' +
                'it will be returned automatically within a few days.'
            );
            setStage('error');
            return;
          }

          const { accessToken } = await verifyRes.json();
          await fetchReport(accessToken);
        },
      });

      rzp.open();
    } catch {
      setError('Could not start checkout. Please try again in a moment.');
      setStage('error');
    }
  }, [email, focus, userProfile.name, fetchReport]);

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

          {(stage === 'paying' || stage === 'generating') && (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-5 h-8 w-8 rounded-full border-2 border-[#DECDBB] border-t-[#8B6E46] animate-spin" />
              <p className="text-sm text-[#4C4337]">
                {stage === 'paying' ? 'Opening secure checkout…' : 'Reading your chart…'}
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
                onClick={() => {
                  setError('');
                  setStage('intro');
                }}
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
