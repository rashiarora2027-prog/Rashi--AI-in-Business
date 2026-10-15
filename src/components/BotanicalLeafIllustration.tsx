import React from 'react';

export const BotanicalLeafIllustration: React.FC = () => {
  return (
    <div className="relative w-48 md:w-60 h-48 md:h-60 pointer-events-none select-none">
      {/* Botanical Ficus / Rubber Plant Leaves SVG with organic shadows and highlights */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full filter drop-shadow-md overflow-visible"
      >
        <defs>
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A5844" />
            <stop offset="60%" stopColor="#2F3E2B" />
            <stop offset="100%" stopColor="#1B271A" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#5D6D54" />
            <stop offset="50%" stopColor="#3C4B37" />
            <stop offset="100%" stopColor="#253221" />
          </linearGradient>
          <linearGradient id="leafGrad3" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#6C7F64" />
            <stop offset="70%" stopColor="#44543D" />
            <stop offset="100%" stopColor="#2A3725" />
          </linearGradient>
        </defs>

        {/* Deep background leaf */}
        <path
          d="M 10 190 C 20 130, 70 80, 110 50 C 130 90, 100 150, 40 195 Z"
          fill="url(#leafGrad1)"
          opacity="0.85"
        />

        {/* Left arched leaf */}
        <path
          d="M -10 180 C 15 110, 60 70, 95 40 C 90 90, 60 140, 5 190 Z"
          fill="url(#leafGrad2)"
          opacity="0.9"
        />
        {/* Leaf central vein */}
        <path
          d="M 5 185 C 40 120, 70 80, 95 40"
          fill="none"
          stroke="#7E9175"
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Foreground broad sculptural ficus leaf */}
        <path
          d="M 20 200 C 50 140, 110 90, 155 70 C 170 120, 130 175, 55 205 Z"
          fill="url(#leafGrad3)"
        />
        {/* Veins */}
        <path
          d="M 35 195 C 80 145, 120 110, 155 70"
          fill="none"
          stroke="#93A889"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <path
          d="M 80 155 C 95 145, 115 148, 125 152"
          fill="none"
          stroke="#93A889"
          strokeWidth="0.6"
          opacity="0.4"
        />
        <path
          d="M 110 125 C 125 115, 142 120, 150 122"
          fill="none"
          stroke="#93A889"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* Tiny lower accent sprout */}
        <path
          d="M 70 200 C 90 170, 125 155, 140 145 C 145 170, 120 195, 85 202 Z"
          fill="url(#leafGrad2)"
        />
      </svg>
    </div>
  );
};
