/**
 * The drifting star field behind the hero.
 *
 * Canvas rather than DOM nodes or SVG. Two hundred animated elements in the
 * DOM means two hundred things for the browser to lay out and composite every
 * frame; on canvas it is one element and the work is drawing, which is what
 * the GPU is for. On a mid-range Android the DOM version drops frames and this
 * one does not.
 *
 * Three depth bands, each drifting at its own speed and reacting to the
 * pointer by a different amount. That difference is the entire illusion: a
 * field where everything moves together reads as a moving texture, and a field
 * where near things move more than far things reads as space.
 *
 * Honest about its limits: this is parallax, not astronomy. It is not the
 * user's sky and does not pretend to be — the real sky is drawn, to scale,
 * from their own chart in the wheel beside it.
 */

import { useEffect, useRef } from 'react';

type Star = {
  x: number;          // 0..1, fraction of width, so resizing never re-seeds
  y: number;          // 0..1
  r: number;          // radius in CSS px
  band: 0 | 1 | 2;    // depth: 0 farthest
  drift: number;      // px/sec, horizontal
  phase: number;      // where in its twinkle it starts
  speed: number;      // twinkle rate
  base: number;       // baseline opacity
};

const BANDS = [
  { count: 110, drift: 1.6, parallax: 4, rMin: 0.5, rMax: 1.0, alpha: 0.26 },
  { count: 55, drift: 3.4, parallax: 10, rMin: 0.8, rMax: 1.6, alpha: 0.36 },
  { count: 22, drift: 6.0, parallax: 20, rMin: 1.2, rMax: 2.2, alpha: 0.48 },
] as const;

/**
 * Warm ink, not white.
 *
 * The instinct on a star field is a pale dot, but the page behind this one is
 * cream (#F6F2EB). A pale star on a pale ground is invisible — the first pass
 * here rendered a field nobody could see. Darker than the background at low
 * opacity reads the way dust in a sunbeam does, which is the right reference
 * for a daylit page anyway.
 */
const STAR_RGB = '122, 99, 72';

export default function StarField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;

    // Pointer parallax, held as a target and eased toward, so moving the
    // mouse quickly does not whip the field across the screen.
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const stars: Star[] = [];
    function seed() {
      stars.length = 0;
      BANDS.forEach((band, i) => {
        for (let n = 0; n < band.count; n++) {
          stars.push({
            x: Math.random(),
            y: Math.random(),
            r: band.rMin + Math.random() * (band.rMax - band.rMin),
            band: i as 0 | 1 | 2,
            drift: band.drift * (0.6 + Math.random() * 0.8),
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.7,
            base: band.alpha * (0.65 + Math.random() * 0.35),
          });
        }
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      // Cap at 2x: beyond that the extra pixels cost real milliseconds and
      // nobody can see a sub-pixel star.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(elapsed: number) {
      ctx!.clearRect(0, 0, width, height);

      // Ease the pointer offset toward its target. 0.06 is slow enough to feel
      // weighty and fast enough not to lag behind a deliberate movement.
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      for (const s of stars) {
        const band = BANDS[s.band];
        // Horizontal drift wraps rather than resetting, so there is no visible
        // seam where stars pop back to the left edge.
        const driftPx = (s.drift * elapsed) % (width + 40);
        let x = s.x * width + driftPx;
        if (x > width + 20) x -= width + 40;
        const y = s.y * height;

        const px = x + curX * band.parallax;
        const py = y + curY * band.parallax;

        if (px < -4 || px > width + 4 || py < -4 || py > height + 4) continue;

        // Twinkle is a slow sine, never reaching zero: stars that blink fully
        // out look like dead pixels.
        const tw = 0.75 + 0.25 * Math.sin(s.phase + elapsed * s.speed);
        ctx!.globalAlpha = s.base * tw;
        ctx!.beginPath();
        ctx!.arc(px, py, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgb(${STAR_RGB})`;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    const start = performance.now();
    function frame(now: number) {
      if (!running) return;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }

    function renderStatic() {
      // Reduced motion still gets a star field — it simply holds still.
      draw(0);
    }

    function onPointer(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function onVisibility() {
      // A field animating in a tab nobody is looking at is pure battery drain.
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion.matches) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }

    function begin() {
      resize();
      seed();
      cancelAnimationFrame(raf);
      if (reduceMotion.matches) {
        running = false;
        renderStatic();
      } else {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }

    begin();

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) renderStatic();
    });
    ro.observe(canvas);

    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduceMotion.addEventListener('change', begin);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMotion.removeEventListener('change', begin);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
