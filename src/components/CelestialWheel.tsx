import React, { useState } from 'react';

interface CelestialWheelProps {
  onSelectSign?: (sign: string) => void;
}

const ZODIAC_SIGNS = [
  { symbol: '♈', name: 'Aries', sanskrit: 'Mesha', element: 'Fire', angle: -90 },
  { symbol: '♉', name: 'Taurus', sanskrit: 'Vrishabha', element: 'Earth', angle: -60 },
  { symbol: '♊', name: 'Gemini', sanskrit: 'Mithuna', element: 'Air', angle: -30 },
  { symbol: '♋', name: 'Cancer', sanskrit: 'Karka', element: 'Water', angle: 0 },
  { symbol: '♌', name: 'Leo', sanskrit: 'Simha', element: 'Fire', angle: 30 },
  { symbol: '♍', name: 'Virgo', sanskrit: 'Kanya', element: 'Earth', angle: 60 },
  { symbol: '♎', name: 'Libra', sanskrit: 'Tula', element: 'Air', angle: 90 },
  { symbol: '♏', name: 'Scorpio', sanskrit: 'Vrishchika', element: 'Water', angle: 120 },
  { symbol: '♐', name: 'Sagittarius', sanskrit: 'Dhanu', element: 'Fire', angle: 150 },
  { symbol: '♑', name: 'Capricorn', sanskrit: 'Makara', element: 'Earth', angle: 180 },
  { symbol: '♒', name: 'Aquarius', sanskrit: 'Kumbha', element: 'Air', angle: 210 },
  { symbol: '♓', name: 'Pisces', sanskrit: 'Meena', element: 'Water', angle: 240 },
];

const MOON_PHASES = [
  { name: 'New Moon', cx: 250, cy: 90, r: 8, fill: '#6B5E4F' },
  { name: 'Waxing Crescent', cx: 365, cy: 135, r: 8, fill: '#947E64' },
  { name: 'First Quarter', cx: 410, cy: 250, r: 8, fill: '#BA9E7B' },
  { name: 'Waxing Gibbous', cx: 365, cy: 365, r: 8, fill: '#D1BA9C' },
  { name: 'Full Moon', cx: 250, cy: 410, r: 8, fill: '#EFE7DA' },
  { name: 'Waning Gibbous', cx: 135, cy: 365, r: 8, fill: '#D1BA9C' },
  { name: 'Last Quarter', cx: 90, cy: 250, r: 8, fill: '#BA9E7B' },
  { name: 'Waning Crescent', cx: 135, cy: 135, r: 8, fill: '#947E64' },
];

export const CelestialWheel: React.FC<CelestialWheelProps> = ({ onSelectSign }) => {
  const [activeSign, setActiveSign] = useState<string | null>(null);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[460px] mx-auto">
      {/* Subtle outer warm aura */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#EEDDC6]/30 via-[#E4D1B8]/20 to-transparent blur-2xl pointer-events-none" />

      {/* SVG Celestial Diagram */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-auto max-w-[460px] filter drop-shadow-sm transition-transform duration-700 hover:scale-[1.01]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F9F5EE" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#EADBCA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#DFCEB6" stopOpacity="0" />
          </radialGradient>

          <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#705A3E" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Everything in this group turns together: the rings, the 72 degree
            ticks and the sector spokes. The dashed circles are what actually
            show the motion — a plain circle rotating is invisible. */}
        <g className="wheel-ring">

        {/* Outer Fine Concentric Circles */}
        <circle cx="250" cy="250" r="236" fill="none" stroke="#BAA58C" strokeWidth="0.8" opacity="0.6" />
        <circle cx="250" cy="250" r="232" fill="none" stroke="#BAA58C" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.75" />
        <circle cx="250" cy="250" r="202" fill="none" stroke="#BAA58C" strokeWidth="0.8" opacity="0.5" />
        <circle cx="250" cy="250" r="160" fill="none" stroke="#C4B29A" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.7" />
        <circle cx="250" cy="250" r="110" fill="none" stroke="#B8A388" strokeWidth="0.9" opacity="0.7" />

        {/* Degree Tick Marks (72 ticks) */}
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = (i * 360) / 72;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 6 === 0;
          const r1 = 232;
          const r2 = isMajor ? 224 : 228;
          return (
            <line
              key={i}
              x1={250 + r1 * Math.cos(rad)}
              y1={250 + r1 * Math.sin(rad)}
              x2={250 + r2 * Math.cos(rad)}
              y2={250 + r2 * Math.sin(rad)}
              stroke="#A8947C"
              strokeWidth={isMajor ? 0.9 : 0.4}
              opacity={isMajor ? 0.75 : 0.4}
            />
          );
        })}

        {/* Zodiac Sector Dividing Spokes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={250 + 160 * Math.cos(angle)}
              y1={250 + 160 * Math.sin(angle)}
              x2={250 + 202 * Math.cos(angle)}
              y2={250 + 202 * Math.sin(angle)}
              stroke="#BAA58C"
              strokeWidth="0.6"
              opacity="0.5"
            />
          );
        })}

        </g>

        {/* The glyphs stay still. They are click targets, and a sign that
            drifts is a sign you have to chase; they would also hang upside
            down for half of every turn. */}
        {/* 12 Zodiac Symbols */}
        {ZODIAC_SIGNS.map((sign) => {
          const rad = (sign.angle * Math.PI) / 180;
          const x = 250 + 217 * Math.cos(rad);
          const y = 250 + 217 * Math.sin(rad);
          const isHovered = activeSign === sign.name;

          return (
            <g
              key={sign.name}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setActiveSign(sign.name)}
              onMouseLeave={() => setActiveSign(null)}
              onClick={() => onSelectSign?.(sign.name)}
            >
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 15 : 12}
                fill={isHovered ? '#EFE6D7' : 'transparent'}
                stroke={isHovered ? '#B39158' : 'transparent'}
                strokeWidth="0.8"
                className="transition-all"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize={isHovered ? '20' : '17'}
                fontFamily="Georgia, serif"
                fill={isHovered ? '#8D692B' : '#524536'}
                className="select-none transition-all"
                style={{ filter: 'url(#subtleShadow)' }}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Moon Phase Markers in Middle Ring */}
        {MOON_PHASES.map((phase, idx) => (
          <g key={idx} className="cursor-default">
            <circle
              cx={phase.cx}
              cy={phase.cy}
              r={phase.r}
              fill="none"
              stroke="#A38F75"
              strokeWidth="0.8"
              opacity="0.8"
            />
            {/* Split for phase visualization */}
            <path
              d={`M ${phase.cx} ${phase.cy - phase.r} A ${phase.r} ${phase.r} 0 0 1 ${phase.cx} ${phase.cy + phase.r} Z`}
              fill={phase.fill}
              opacity="0.85"
            />
          </g>
        ))}

        {/* Subtle Radial Sun Rays Behind the Center Medallion */}
        <g className="wheel-corona" opacity="0.65">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const rStart = 78;
            const rEnd = i % 2 === 0 ? 104 : 95;
            const x1 = 250 + rStart * Math.cos(angle);
            const y1 = 250 + rStart * Math.sin(angle);
            const x2 = 250 + rEnd * Math.cos(angle);
            const y2 = 250 + rEnd * Math.sin(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#C2AA8A"
                strokeWidth={i % 2 === 0 ? 1.2 : 0.8}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Inner Sun Center Medallion Glow */}
        <circle cx="250" cy="250" r="76" fill="url(#sunGlow)" />
        <circle cx="250" cy="250" r="76" fill="none" stroke="#BD9E75" strokeWidth="1" opacity="0.8" />

        {/* Wavy Traditional Sun Rays (Solar Corona). Grouped with the thin
            rays above and turning the opposite way to the outer ring, so the
            face at the centre reads as held still while the light moves. */}
        <g className="wheel-corona">
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const rayTipX = 250 + 94 * Math.cos(angle);
          const rayTipY = 250 + 94 * Math.sin(angle);
          const baseLeftAngle = ((i * 22.5 - 5) * Math.PI) / 180;
          const baseRightAngle = ((i * 22.5 + 5) * Math.PI) / 180;
          const xLeft = 250 + 76 * Math.cos(baseLeftAngle);
          const yLeft = 250 + 76 * Math.sin(baseLeftAngle);
          const xRight = 250 + 76 * Math.cos(baseRightAngle);
          const yRight = 250 + 76 * Math.sin(baseRightAngle);

          return (
            <polygon
              key={`ray-${i}`}
              points={`${xLeft},${yLeft} ${rayTipX},${rayTipY} ${xRight},${yRight}`}
              fill="#E1CFB8"
              stroke="#A88B64"
              strokeWidth="0.6"
              opacity="0.85"
            />
          );
        })}
        </g>

        {/* Central Sun Face (Calm, Serene, Classical) */}
        <g id="sun-face" transform="translate(205, 205)">
          {/* Eyebrows */}
          <path d="M 22 36 Q 30 32 38 36" fill="none" stroke="#68543E" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 52 36 Q 60 32 68 36" fill="none" stroke="#68543E" strokeWidth="1.2" strokeLinecap="round" />

          {/* Eyes (Gentle, Serene, Closed or Half-lidded) */}
          <path d="M 22 42 Q 30 46 38 42" fill="none" stroke="#5E4B37" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 52 42 Q 60 46 68 42" fill="none" stroke="#5E4B37" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="30" cy="42" r="1.5" fill="#5E4B37" />
          <circle cx="60" cy="42" r="1.5" fill="#5E4B37" />

          {/* Nose */}
          <path d="M 45 40 L 45 54 Q 48 57 44 59 Q 40 57 43 54" fill="none" stroke="#7A644C" strokeWidth="1.1" strokeLinecap="round" />

          {/* Lips (Subtle serene Renaissance smile) */}
          <path d="M 36 67 Q 45 70 54 67" fill="none" stroke="#66523D" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 40 71 Q 45 73 50 71" fill="none" stroke="#7A644C" strokeWidth="0.9" strokeLinecap="round" />
        </g>

        {/* Crescent Moon Profile Nestled on Right Side of Sun */}
        <g id="crescent-moon-embrace" transform="translate(262, 214)">
          {/* Moon Profile Silhouette */}
          <path
            d="M 5 -12 
               C 28 8, 32 48, 12 76 
               C 2 89, -14 96, -24 98
               C -8 88, 6 72, 8 46
               C 10 18, 0 -3, -12 -14
               C -4 -16, 0 -14, 5 -12 Z"
            fill="#EFE4D2"
            stroke="#9E8567"
            strokeWidth="0.9"
            opacity="0.95"
          />
          {/* Moon Face Details: Closed eye, nose tip, lips */}
          <path d="M 12 28 Q 16 31 20 29" fill="none" stroke="#68543E" strokeWidth="1" strokeLinecap="round" />
          {/* Moon eyelid lash */}
          <path d="M 16 29.5 L 17 31.5" stroke="#68543E" strokeWidth="0.8" strokeLinecap="round" />
          {/* Lips */}
          <path d="M 10 51 Q 14 53 18 51" fill="none" stroke="#68543E" strokeWidth="0.9" strokeLinecap="round" />
        </g>

        {/* Surrounding Delicate 4-Point Compass Stars */}
        <g opacity="0.6">
          <path d="M 250 8 L 252 14 L 258 16 L 252 18 L 250 24 L 248 18 L 242 16 L 248 14 Z" fill="#9C8363" />
          <path d="M 250 476 L 252 482 L 258 484 L 252 486 L 250 492 L 248 486 L 242 484 L 248 482 Z" fill="#9C8363" />
          <path d="M 16 250 L 22 252 L 24 258 L 26 252 L 32 250 L 26 248 L 24 242 L 22 248 Z" fill="#9C8363" />
          <path d="M 468 250 L 474 252 L 476 258 L 478 252 L 484 250 L 478 248 L 476 242 L 474 248 Z" fill="#9C8363" />
          
          <path d="M 100 100 L 102 104 L 106 106 L 102 108 L 100 112 L 98 108 L 94 106 L 98 104 Z" fill="#A89274" />
          <path d="M 400 100 L 402 104 L 406 106 L 402 108 L 400 112 L 398 108 L 394 106 L 398 104 Z" fill="#A89274" />
          <path d="M 100 400 L 102 404 L 106 406 L 102 408 L 100 412 L 98 408 L 94 406 L 98 404 Z" fill="#A89274" />
          <path d="M 400 400 L 402 404 L 406 406 L 402 408 L 400 412 L 398 408 L 394 406 L 398 404 Z" fill="#A89274" />
        </g>
      </svg>

      {/* Caption directly under wheel as shown in design: "IT'S ALL CONNECTED" */}
      <div className="mt-4 text-center">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[#86735E] font-medium font-sans">
          I T &apos; S&nbsp;&nbsp;A L L&nbsp;&nbsp;C O N N E C T E D
        </p>
        {activeSign && (
          <p className="text-xs text-[#9E8363] mt-1 font-serif italic transition-opacity">
            {activeSign} &bull; {ZODIAC_SIGNS.find(s => s.name === activeSign)?.sanskrit} ({ZODIAC_SIGNS.find(s => s.name === activeSign)?.element})
          </p>
        )}
      </div>
    </div>
  );
};
