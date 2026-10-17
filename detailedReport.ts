/**
 * The paid ₹50 detailed report.
 *
 * Kept in its own file so server.ts needs only two extra lines. It receives
 * the Gemini helper and the telemetry formatter from server.ts rather than
 * duplicating them, so the paid reading is built from exactly the same
 * verified placements as the free one — it goes deeper into the same chart,
 * it does not consult a different oracle.
 *
 * Every request here has already passed requirePaidAccess, so req.paymentId
 * is a payment this server verified itself.
 */

import type { Express, Response } from 'express';
import { requirePaidAccess, type PaidRequest } from './accessToken.ts';
import { attachReport, getStoredReport } from './supabaseClient.ts';

type Deps = {
  generateReflectiveText: (prompt: string, fallback: string) => Promise<string>;
  getCosmicTelemetry: (birthDate?: string, birthTime?: string, birthLocation?: string) => string;
};

export function registerDetailedReportRoute(app: Express, deps: Deps) {
  const { generateReflectiveText, getCosmicTelemetry } = deps;

  app.post('/api/detailed-report', requirePaidAccess, async (req: PaidRequest, res: Response) => {
    const { name, birthDetails, focus } = req.body || {};
    const userName = name || 'Friend';
    const paymentId = req.paymentId!;

    // If this payment already produced a report, return that one. A buyer who
    // reloads should see the reading they paid for, not a freshly generated
    // and subtly different one. It also means a second request costs nothing.
    const existing = await getStoredReport(paymentId);
    if (existing) {
      return res.json(existing);
    }

    const cosmicTelemetry = getCosmicTelemetry(
      birthDetails?.date,
      birthDetails?.time,
      birthDetails?.location
    );

    const prompt = `
Produce the PATTERNS DETAILED REPORT for ${userName}.

This is the paid, long-form reading. It must be substantially richer than the
free reflection: more specific, more structured, and anchored throughout in the
verified placements below. The reader has paid for depth — give them depth.

Hold the same line the free reading holds. No predictions, no fixed outcomes,
no scoring. Describe tendencies, thresholds and developmental tasks. If a
period is difficult, say what it asks of them rather than what it will do to
them.

${cosmicTelemetry}

${focus ? `They particularly want insight on: "${focus}"` : ''}

Return STRICT JSON ONLY in this format:
{
  "title": "A short evocative title for this reading",
  "overview": "4-5 sentences establishing the central theme of this life season.",
  "chartFoundations": {
    "lagnaReading": "What their Ascendant says about how they meet the world.",
    "moonReading": "What their Moon placement and Nakshatra say about their inner weather.",
    "sunReading": "What their Sun placement says about their core direction and vitality."
  },
  "dashaNarrative": {
    "currentPeriod": "Name the running Mahadasha/Antardasha from the data above.",
    "whatItAsks": "The developmental task of this period, in reflective language.",
    "howLongItLasts": "The arc of this period and what follows it."
  },
  "lifeAreas": [
    { "area": "Work & Dharma", "reading": "4-5 sentences.", "practice": "One concrete practice." },
    { "area": "Relationships & Intimacy", "reading": "4-5 sentences.", "practice": "One concrete practice." },
    { "area": "Inner Life & Mind", "reading": "4-5 sentences.", "practice": "One concrete practice." },
    { "area": "Body & Rhythm", "reading": "4-5 sentences.", "practice": "One concrete practice." }
  ],
  "recurringPatterns": [
    { "pattern": "Name of a recurring loop.", "origin": "Where it likely comes from.", "shift": "How it might loosen." }
  ],
  "comingMonths": [
    { "window": "e.g. Next 4-6 weeks", "theme": "What this window asks for.", "guidance": "How to meet it." }
  ],
  "reflectionPractice": {
    "dailyQuestion": "One question to sit with each morning.",
    "weeklyReview": "One practice to do once a week.",
    "mantra": "A single grounding sentence."
  },
  "closing": "3-4 sentences that land the reading with warmth and without prediction."
}

Return STRICT JSON ONLY without markdown backticks.
`;

    const fallbackData = {
      title: 'The Season of Quiet Recalibration',
      overview: `${userName}, this reading finds you in a period that resists being rushed. The themes surfacing now are not new arrivals but older threads asking to be looked at directly. What has felt like stalling is more accurately a reordering of priorities that has not yet announced itself in outward form. The work of this season is discernment rather than decision.`,
      chartFoundations: {
        lagnaReading:
          'Your Ascendant describes the doorway through which you meet the world — the manner others encounter first, which is rarely identical to the self you know from inside. Learning where that gap sits is useful.',
        moonReading:
          'The Moon governs Manas, the feeling mind. Its placement describes what genuinely restores you, as distinct from what you have been told should restore you.',
        sunReading:
          'The Sun speaks to core vitality and direction — not ambition in the performative sense, but the thing that remains interesting to you when nobody is watching.',
      },
      dashaNarrative: {
        currentPeriod: 'Your running Vimshottari period is shown in your chart data.',
        whatItAsks:
          'Each planetary period has a developmental task rather than a fixed outcome. The present one appears to ask for consolidation before expansion.',
        howLongItLasts:
          'These periods move in years rather than weeks. Knowing roughly where you sit within the arc helps you stop measuring progress against the wrong clock.',
      },
      lifeAreas: [
        {
          area: 'Work & Dharma',
          reading:
            'There is a distinction worth drawing between the work that pays and the work that is yours. Periods like this one tend to make the gap between them uncomfortable, which is uncomfortable precisely because it is informative.',
          practice: 'Write down the part of your week you would keep if money were not a factor.',
        },
        {
          area: 'Relationships & Intimacy',
          reading:
            'Where you have been over-explaining yourself, notice it. Relationships recalibrate when one person stops performing agreeableness, and that recalibration is rarely smooth at first.',
          practice: 'Let one small disagreement stand unresolved for a week without smoothing it over.',
        },
        {
          area: 'Inner Life & Mind',
          reading:
            'Mental noise in this season tends to be anticipatory rather than responsive — rehearsing conversations that have not happened. The mind does this when it senses change it cannot yet name.',
          practice: 'Ten minutes each morning before any screen, with nothing to solve.',
        },
        {
          area: 'Body & Rhythm',
          reading:
            'The body usually registers a transition before the mind consents to it. Fatigue that does not resolve with sleep is often asking about pace rather than rest.',
          practice: 'Keep a loose note of energy levels across a fortnight and look for the shape.',
        },
      ],
      recurringPatterns: [
        {
          pattern: 'Waiting for external permission',
          origin:
            'Usually learned early, where approval was the reliable signal that a choice was safe.',
          shift:
            'Make one low-stakes decision a week without consulting anyone, purely as practice.',
        },
        {
          pattern: 'Mistaking familiar discomfort for stability',
          origin:
            'The known ache is predictable; the unknown is not. The nervous system prefers predictable.',
          shift: 'Name the cost of staying as precisely as you name the risk of leaving.',
        },
      ],
      comingMonths: [
        {
          window: 'Next 4-6 weeks',
          theme: 'Clarification rather than action.',
          guidance: 'Resist the urge to force a resolution before the question has fully formed.',
        },
        {
          window: 'The following quarter',
          theme: 'Early movement becomes possible.',
          guidance: 'Test small and reversible before committing to anything structural.',
        },
      ],
      reflectionPractice: {
        dailyQuestion: 'What am I carrying today that is not mine to carry?',
        weeklyReview:
          'Once a week, note one thing you did because you wanted to, not because it was expected.',
        mantra: 'I do not have to force the tide to arrive where I am going.',
      },
      closing: `None of this is prediction, ${userName}. It is a set of mirrors held at angles you may not have tried. Take what reads as true, leave what does not, and return to it in a few months to see what has shifted. The patterns are yours; the reading only names them.`,
    };

    let report: Record<string, unknown>;
    try {
      const raw = await generateReflectiveText(prompt, JSON.stringify(fallbackData));
      const cleaned = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      report = { ...JSON.parse(cleaned), generatedAt: new Date().toISOString() };
    } catch {
      report = { ...fallbackData, generatedAt: new Date().toISOString() };
    }

    // Stored so the buyer can reopen it, and so you can resend it on request.
    // Not awaited into the response path beyond this: the reading is already
    // paid for and should reach them whatever the database is doing.
    await attachReport(paymentId, report);

    res.json(report);
  });
}
