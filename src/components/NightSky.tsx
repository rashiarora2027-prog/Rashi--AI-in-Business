/**
 * The night sky behind the whole page.
 *
 * This replaces the cream star field, and the change of background is what
 * makes it possible. Glow, twinkle and shooting stars all work by adding
 * light; on a pale ground there is no headroom to add light into, which is
 * why the previous version had to be dust motes rather than stars. On a deep
 * sky the whole vocabulary opens up.
 *
 * One canvas for everything — stars, constellations, moon, sun, meteors.
 * Fifty DOM nodes animating is fifty things to lay out per frame; one canvas
 * is one element and the work is drawing. That matters most on the phones
 * this will mostly be seen on.
 *
 * The constellations are real figures (Orion, Ursa Major, Cassiopeia, Lyra,
 * Scorpius), not decorative scribbles, because this is an astrology product
 * and inventing the sky in an app that computes real planetary positions
 * would be a strange thing to do.
 */

import { useEffect, useRef } from 'react';

type Star = {
  x: number; y: number;      // 0..1 of the canvas
  r: number;                 // radius, CSS px
  band: 0 | 1 | 2;           // depth
  phase: number; speed: number;
  base: number;              // baseline alpha
};

type Meteor = {
  x: number; y: number;      // CSS px
  vx: number; vy: number;
  life: number; max: number;
};

const BANDS = [
  { count: 150, parallax: 3, rMin: 0.4, rMax: 0.9, alpha: 0.55 },
  { count: 70, parallax: 9, rMin: 0.7, rMax: 1.4, alpha: 0.75 },
  { count: 26, parallax: 18, rMin: 1.1, rMax: 1.9, alpha: 0.95 },
] as const;

/**
 * Constellation figures in a 0..1 box, with the segments that join them.
 * Coordinates are approximations of the real shapes — recognisable rather
 * than survey-accurate.
 */
const FIGURES: { name: string; at: [number, number]; scale: number; pts: [number, number][]; links: [number, number][] }[] = [
  {
    name: 'Orion',
    at: [0.13, 0.62], scale: 0.115,
    pts: [[0.5,0],[0.05,0.22],[0.42,0.47],[0.5,0.5],[0.58,0.53],[0.95,0.3],[0.28,0.95],[0.78,0.92]],
    links: [[0,1],[0,5],[1,2],[2,3],[3,4],[4,5],[2,6],[4,7],[6,7]],
  },
  {
    name: 'Ursa Major',
    at: [0.72, 0.12], scale: 0.145,
    pts: [[0,0.42],[0.2,0.3],[0.4,0.36],[0.55,0.52],[0.74,0.45],[0.9,0.6],[0.72,0.72]],
    links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
  },
  {
    name: 'Cassiopeia',
    at: [0.42, 0.08], scale: 0.1,
    pts: [[0,0.1],[0.26,0.62],[0.52,0.18],[0.76,0.66],[1,0.22]],
    links: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    name: 'Lyra',
    at: [0.86, 0.52], scale: 0.075,
    pts: [[0.5,0],[0.1,0.42],[0.72,0.38],[0.2,0.88],[0.8,0.82]],
    links: [[0,1],[0,2],[1,3],[2,4],[3,4]],
  },
  {
    name: 'Scorpius',
    at: [0.3, 0.3], scale: 0.1,
    pts: [[0,0],[0.22,0.16],[0.44,0.34],[0.5,0.6],[0.66,0.8],[0.88,0.76],[0.96,0.54]],
    links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
];

export default function NightSky({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0, h = 0, dpr = 1, raf = 0, running = true;
    let tx = 0, ty = 0, cx = 0, cy = 0;     // pointer parallax, target and eased
    let scrollY = 0;

    const stars: Star[] = [];
    const meteors: Meteor[] = [];
    let nextMeteor = 4 + Math.random() * 6;

    function seed() {
      stars.length = 0;
      BANDS.forEach((b, i) => {
        for (let n = 0; n < b.count; n++) {
          stars.push({
            x: Math.random(), y: Math.random(),
            r: b.rMin + Math.random() * (b.rMax - b.rMin),
            band: i as 0 | 1 | 2,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 1.1,
            base: b.alpha * (0.55 + Math.random() * 0.45),
          });
        }
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * The sky itself never changes, so it is painted once to an offscreen
     * canvas and blitted each frame.
     *
     * The first version rebuilt two full-screen gradients every frame, which
     * at 2x device pixels is ten million pixels of gradient per frame and was
     * holding the whole thing to 25fps on a desktop. Caching it is the single
     * change that makes this viable on a phone.
     */
    let bg: HTMLCanvasElement | null = null;
    function paintSky() {
      bg = document.createElement('canvas');
      bg.width = Math.max(1, Math.floor(w * dpr));
      bg.height = Math.max(1, Math.floor(h * dpr));
      const b = bg.getContext('2d');
      if (!b) return;
      b.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = b.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#070B16');
      g.addColorStop(0.45, '#0C1324');
      g.addColorStop(1, '#131A2E');
      b.fillStyle = g;
      b.fillRect(0, 0, w, h);

      // A faint warm wash low on the left — the memory of a sun just set.
      const warm = b.createRadialGradient(w * 0.12, h * 1.02, 0, w * 0.12, h * 1.02, Math.max(w, h) * 0.55);
      warm.addColorStop(0, 'rgba(197,142,78,0.20)');
      warm.addColorStop(1, 'rgba(197,142,78,0)');
      b.fillStyle = warm;
      b.fillRect(0, 0, w, h);
    }

    function sky() {
      if (bg) ctx!.drawImage(bg, 0, 0, w, h);
    }

    function drawStars(t: number) {
      for (const s of stars) {
        const b = BANDS[s.band];
        const px = s.x * w + cx * b.parallax;
        const py = s.y * h + cy * b.parallax - scrollY * (0.02 + s.band * 0.025);
        if (px < -6 || px > w + 6 || py < -6 || py > h + 6) continue;
        const tw = 0.6 + 0.4 * Math.sin(s.phase + t * s.speed);
        ctx!.globalAlpha = s.base * tw;
        ctx!.beginPath();
        ctx!.arc(px, py, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = '#FFF6E2';
        ctx!.fill();
        // The brightest band gets a halo. Doing this for every star would be
        // both ugly and the single biggest cost in the frame.
        if (s.band === 2) {
          ctx!.globalAlpha = s.base * tw * 0.18;
          ctx!.beginPath();
          ctx!.arc(px, py, s.r * 4.5, 0, Math.PI * 2);
          ctx!.fillStyle = '#CFE2FF';
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
    }

    function drawFigures(t: number) {
      const unit = Math.min(w, h);
      FIGURES.forEach((f, fi) => {
        const ox = f.at[0] * w + cx * 6;
        const oy = f.at[1] * h + cy * 6 - scrollY * 0.04;
        const s = f.scale * unit;
        // Each figure breathes on its own slow cycle so the sky never pulses
        // as one object.
        const breathe = 0.55 + 0.45 * Math.sin(t * 0.22 + fi * 1.7);

        ctx!.lineWidth = 0.7;
        ctx!.strokeStyle = `rgba(190,214,255,${0.13 + 0.1 * breathe})`;
        ctx!.beginPath();
        for (const [a, b] of f.links) {
          ctx!.moveTo(ox + f.pts[a][0] * s, oy + f.pts[a][1] * s);
          ctx!.lineTo(ox + f.pts[b][0] * s, oy + f.pts[b][1] * s);
        }
        ctx!.stroke();

        for (const p of f.pts) {
          const x = ox + p[0] * s, y = oy + p[1] * s;
          ctx!.globalAlpha = 0.5 + 0.45 * breathe;
          ctx!.beginPath();
          ctx!.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx!.fillStyle = '#EAF1FF';
          ctx!.fill();
          ctx!.globalAlpha = 0.14 * breathe;
          ctx!.beginPath();
          ctx!.arc(x, y, 6, 0, Math.PI * 2);
          ctx!.fillStyle = '#9FC2FF';
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      });
    }

    function drawMoon(t: number) {
      const r = Math.max(34, Math.min(w, h) * 0.058);
      const x = w * 0.84 + cx * 12;
      const y = h * 0.2 + cy * 12 - scrollY * 0.06;

      const glow = ctx!.createRadialGradient(x, y, r * 0.7, x, y, r * 4.2);
      glow.addColorStop(0, 'rgba(226,232,246,0.22)');
      glow.addColorStop(1, 'rgba(226,232,246,0)');
      ctx!.fillStyle = glow;
      ctx!.beginPath(); ctx!.arc(x, y, r * 4.2, 0, Math.PI * 2); ctx!.fill();

      ctx!.beginPath(); ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fillStyle = '#EDE6D8'; ctx!.fill();

      // Craters, fixed positions so the moon does not shimmer.
      const craters: [number, number, number][] = [
        [-0.32, -0.22, 0.17], [0.22, -0.3, 0.1], [0.08, 0.26, 0.22],
        [-0.42, 0.3, 0.11], [0.44, 0.12, 0.09],
      ];
      ctx!.globalAlpha = 0.5;
      for (const [dx, dy, cr] of craters) {
        ctx!.beginPath();
        ctx!.arc(x + dx * r, y + dy * r, cr * r, 0, Math.PI * 2);
        ctx!.fillStyle = '#D6CDBC'; ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // The terminator: a shadow disc that drifts very slowly across, so the
      // phase appears to change over minutes rather than being a static icon.
      const off = Math.sin(t * 0.035) * r * 0.75;
      ctx!.save();
      ctx!.beginPath(); ctx!.arc(x, y, r + 0.5, 0, Math.PI * 2); ctx!.clip();
      ctx!.beginPath(); ctx!.arc(x + r * 0.78 + off, y - r * 0.1, r, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(9,13,24,0.90)'; ctx!.fill();
      ctx!.restore();
    }

    function drawSun(t: number) {
      // Low and distant, opposite the moon: Surya and Chandra in one sky.
      const x = w * 0.1 + cx * 4;
      const y = h * 0.95 + cy * 4 - scrollY * 0.03;
      const r = Math.max(26, Math.min(w, h) * 0.04);
      const pulse = 1 + 0.045 * Math.sin(t * 0.5);

      const g = ctx!.createRadialGradient(x, y, 0, x, y, r * 6 * pulse);
      g.addColorStop(0, 'rgba(240,186,110,0.5)');
      g.addColorStop(0.35, 'rgba(226,150,74,0.17)');
      g.addColorStop(1, 'rgba(226,150,74,0)');
      ctx!.fillStyle = g;
      ctx!.beginPath(); ctx!.arc(x, y, r * 6 * pulse, 0, Math.PI * 2); ctx!.fill();

      ctx!.beginPath(); ctx!.arc(x, y, r * pulse, 0, Math.PI * 2);
      ctx!.fillStyle = '#F2C98B'; ctx!.fill();

      // Rays, turning slowly.
      ctx!.save();
      ctx!.translate(x, y); ctx!.rotate(t * 0.045);
      ctx!.strokeStyle = 'rgba(242,201,139,0.3)'; ctx!.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx!.beginPath();
        ctx!.moveTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35);
        ctx!.lineTo(Math.cos(a) * r * 2.1, Math.sin(a) * r * 2.1);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawMeteors(dt: number) {
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx * dt; m.y += m.vy * dt; m.life += dt;
        const k = 1 - m.life / m.max;
        if (k <= 0) { meteors.splice(i, 1); continue; }
        const tailX = m.x - m.vx * 0.16, tailY = m.y - m.vy * 0.16;
        const g = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
        g.addColorStop(0, `rgba(255,248,230,${0.85 * k})`);
        g.addColorStop(1, 'rgba(255,248,230,0)');
        ctx!.strokeStyle = g; ctx!.lineWidth = 1.6; ctx!.lineCap = 'round';
        ctx!.beginPath(); ctx!.moveTo(m.x, m.y); ctx!.lineTo(tailX, tailY); ctx!.stroke();
      }
    }

    function spawnMeteor() {
      const fromLeft = Math.random() > 0.35;
      const speed = 420 + Math.random() * 320;
      const ang = (Math.random() * 0.25 + 0.12) * Math.PI;
      meteors.push({
        x: fromLeft ? -40 : w * (0.4 + Math.random() * 0.6),
        y: Math.random() * h * 0.45,
        vx: Math.cos(ang) * speed * (fromLeft ? 1 : 1),
        vy: Math.sin(ang) * speed,
        life: 0,
        max: 1.1 + Math.random() * 0.5,
      });
    }

    let last = performance.now();
    const start = last;

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - start) / 1000;

      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;

      sky();
      drawStars(t);
      drawFigures(t);
      drawSun(t);
      drawMoon(t);

      nextMeteor -= dt;
      if (nextMeteor <= 0) { spawnMeteor(); nextMeteor = 5 + Math.random() * 9; }
      drawMeteors(dt);

      raf = requestAnimationFrame(frame);
    }

    function still() {
      // Reduced motion still gets the sky, the constellations, the moon and
      // the sun — simply not moving, and with no meteors.
      sky(); drawStars(0); drawFigures(0); drawSun(0); drawMoon(0);
    }

    function onPointer(e: PointerEvent) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    function onScroll() { scrollY = window.scrollY; }
    function onVisibility() {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce.matches) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    function begin() {
      resize(); paintSky(); seed(); cancelAnimationFrame(raf);
      if (reduce.matches) { running = false; still(); }
      else { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    begin();
    const ro = new ResizeObserver(() => { resize(); paintSky(); if (!running) still(); });
    ro.observe(canvas);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduce.addEventListener('change', begin);

    return () => {
      running = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduce.removeEventListener('change', begin);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
