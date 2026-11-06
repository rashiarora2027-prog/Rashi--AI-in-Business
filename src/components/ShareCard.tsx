/**
 * Turns a reading into an image worth posting.
 *
 * This is the cheapest distribution the product has. Nobody screenshots a
 * paragraph of body copy, but they will post a well-set card — it is how
 * Co–Star became ubiquitous without advertising. The card has to look like it
 * belongs on a feed rather than like a screenshot of a website, which means
 * portrait, generous margins, one idea, and the brand small.
 *
 * Drawn on a canvas rather than rendered from DOM. Rasterising HTML in the
 * browser means html2canvas or similar: a large dependency that approximates
 * the layout engine and gets fonts, gradients and blend modes subtly wrong.
 * The card is a fixed composition, so drawing it directly is both smaller and
 * exact.
 *
 * 1080x1350 is the 4:5 portrait that Instagram and most feeds crop to without
 * cutting anything off.
 */

import { useState } from 'react';

const W = 1080;
const H = 1350;

/** Matches the night sky the site now uses, so a card looks like it came from here. */
const SKY_TOP = '#070B16';
const SKY_MID = '#0C1324';
const SKY_BOT = '#131A2E';
const CREAM = '#F0EADF';
const BRASS = '#E3C98B';
const MUTED = '#9AA6C0';

export type ShareCardProps = {
  /** The one line worth posting. Kept short; long quotes do not read on a feed. */
  quote: string;
  /** Small line above the quote, e.g. "Why am I feeling this". */
  eyebrow?: string;
  /** Chart context under the rule, e.g. "Sagittarius rising · Revati moon". */
  meta?: string;
  className?: string;
  label?: string;
};

/**
 * Picks the one sentence worth putting on a card.
 *
 * Readings open by restating what the person typed — `What you are describing
 * — "I keep starting things and abandoning them" — is not a random glitch…`.
 * That is right in the app, where it signals being heard, and wrong on a card:
 * it is quotation marks inside quotation marks, it is about the complaint
 * rather than the insight, and it puts the reader's private words on a public
 * image.
 *
 * So prefer the first sentence that carries an idea rather than an echo, and
 * never ship nested quotes.
 */
export function quotable(text: string): string {
  if (!text) return '';
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);

  const clean = sentences.filter((x) => !/["“”]/.test(x) && x.length >= 55 && x.length <= 230);
  if (clean.length) return clean[0];

  // Nothing ideal: take the longest sentence that fits and strip any inner
  // quotation marks so the card never shows a quote inside a quote.
  const fallback =
    sentences.filter((x) => x.length <= 230).sort((a, b) => b.length - a.length)[0] ||
    sentences[0] ||
    text;
  return fallback.replace(/["“”]/g, '').trim();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A four-point star, the same mark as the favicon and the header. */
function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  const w = r * 0.27;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + w, cy - w);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx + w, cy + w);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - w, cy + w);
  ctx.lineTo(cx - r, cy);
  ctx.lineTo(cx - w, cy - w);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

async function draw({ quote, eyebrow, meta }: ShareCardProps): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Wait for the display face, otherwise the first card a visitor makes is set
  // in the fallback serif while every later one is correct — which looks like
  // a bug and is impossible to explain.
  try {
    await (document as any).fonts?.load?.('600 72px "Cormorant Garamond"');
    await (document as any).fonts?.load?.('400 26px "Plus Jakarta Sans"');
    await (document as any).fonts?.ready;
  } catch {
    /* A missing Font Loading API is not a reason to fail the card. */
  }

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, SKY_TOP);
  sky.addColorStop(0.5, SKY_MID);
  sky.addColorStop(1, SKY_BOT);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // A warm wash in the lower left, echoing the site's sun below the horizon.
  const warm = ctx.createRadialGradient(W * 0.1, H * 1.02, 0, W * 0.1, H * 1.02, W * 0.9);
  warm.addColorStop(0, 'rgba(197,142,78,0.22)');
  warm.addColorStop(1, 'rgba(197,142,78,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, W, H);

  // Stars. Seeded by nothing in particular — each card is its own sky, which
  // is a small, honest kind of uniqueness.
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 1.6 + 0.4;
    ctx.globalAlpha = 0.18 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF6E2';
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const M = 96;                       // margin
  star(ctx, M + 10, M + 10, 16, BRASS);

  if (eyebrow) {
    ctx.font = '600 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = MUTED;
    ctx.letterSpacing = '6px';
    ctx.fillText(eyebrow.toUpperCase(), M + 46, M + 20);
    ctx.letterSpacing = '0px';
  }

  // The quote. Size steps down as it gets longer so a short line lands big and
  // a long one still fits without ever overflowing the card.
  const picked = quotable(quote);
  const len = picked.length;
  const size = len < 90 ? 74 : len < 160 ? 62 : len < 240 ? 52 : 44;
  ctx.font = `400 ${size}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = CREAM;
  const lines = wrap(ctx, `“${picked}”`, W - M * 2);
  const lineHeight = size * 1.32;
  let y = H * 0.42 - (lines.length * lineHeight) / 2;
  for (const line of lines) {
    ctx.fillText(line, M, y);
    y += lineHeight;
  }

  // Rule, then the chart context beneath it.
  const ruleY = Math.min(y + 56, H - 300);
  ctx.strokeStyle = 'rgba(227,201,139,0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(M, ruleY);
  ctx.lineTo(M + 120, ruleY);
  ctx.stroke();

  if (meta) {
    ctx.font = '400 27px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = MUTED;
    for (const line of wrap(ctx, meta, W - M * 2).slice(0, 2)) {
      ctx.fillText(line, M, ruleY + 52);
    }
  }

  // Footer: the brand stays small. A card that shouts the URL reads as an ad
  // and does not get posted, which defeats the point of making it.
  ctx.font = '600 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = CREAM;
  ctx.letterSpacing = '8px';
  ctx.fillText('PATTERNS', M, H - M - 34);
  ctx.letterSpacing = '0px';

  ctx.font = '400 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = MUTED;
  ctx.fillText('thepatterns.app · reflection, not prediction', M, H - M + 4);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
}

export default function ShareCard(props: ShareCardProps) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      const blob = await draw(props);
      if (!blob) return;
      const file = new File([blob], 'patterns-reading.png', { type: 'image/png' });

      // On a phone, the share sheet is the whole point: it puts the card one
      // tap from a story. Falling back to a download on desktop, where there
      // is no share sheet worth using.
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await (nav as any).share({ files: [file], title: 'PATTERNS' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'patterns-reading.png';
        a.click();
        URL.revokeObjectURL(url);
      }
      setDone(true);
      setTimeout(() => setDone(false), 2600);
    } catch (err) {
      // A cancelled share sheet throws, and is not an error worth reporting.
      console.warn('Could not create share card:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide border transition-all cursor-pointer disabled:opacity-60 bg-white border-[#D6C5B1] text-[#473B2E] hover:bg-[#F7F1E8] ${props.className || ''}`}
    >
      {busy ? 'Drawing…' : done ? '✓ Card saved' : props.label || '✦ Share this reading'}
    </button>
  );
}
