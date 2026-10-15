import React, { useState } from 'react';

const CLASSIC_BOOKS = [
  {
    title: 'BRIHAT PARASHARA HORA SHASTRA',
    era: 'c. 6th–7th Century CE',
    author: 'Sage Parashara',
    theme: 'The definitive foundational encyclopedia of Vedic astrology (Jyotish). Establishes planetary aspects, 16 divisional charts (Vargas), and planetary periods (Dashas).',
    color: '#8A7156',
    height: 'h-6',
  },
  {
    title: 'JATAKA PARIJATA',
    era: 'c. 15th Century CE',
    author: 'Vaidyanatha Dikshita',
    theme: 'A masterwork on predictive yogas, planetary dignities, and psychological character discernment based on classical Sanskrit verses.',
    color: '#6B5441',
    height: 'h-6',
  },
  {
    title: 'SARAVALI',
    era: 'c. 800 CE',
    author: 'Kalyana Varma',
    theme: 'Celebrated treatise on planetary combinations, houses, and the subtleties of human emotions and relational chemistry.',
    color: '#4E3E30',
    height: 'h-6',
  },
  {
    title: 'PHALADEEPIKA',
    era: 'c. 13th Century CE',
    author: 'Mantreswara',
    theme: 'Renowned for practical wisdom on transits (Gochara), Ashtakavarga, and navigating cycles of difficulty with mindful grace.',
    color: '#382D23',
    height: 'h-6',
  },
  {
    title: 'HOURS OF ASTROLOGY',
    era: 'Classical Compendium',
    author: 'Traditional Horary & Natal Canon',
    theme: 'Reflections on the hourly planetary lords (Horas) and timing life decisions in harmony with natural cosmological rhythms.',
    color: '#28211A',
    height: 'h-6',
  },
];

export const BookStackIllustration: React.FC = () => {
  const [activeBook, setActiveBook] = useState<typeof CLASSIC_BOOKS[0] | null>(null);

  return (
    <div className="relative flex flex-col items-end select-none">
      {/* Book details popover if clicked */}
      {activeBook && (
        <div className="absolute bottom-36 right-0 w-72 p-3.5 rounded-xl bg-[#FAF5ED] border border-[#D8C7B4] shadow-lg z-30 text-xs">
          <div className="flex justify-between items-start">
            <h4 className="font-serif font-semibold text-[#251F19] text-sm">
              {activeBook.title}
            </h4>
            <button
              onClick={() => setActiveBook(null)}
              className="text-[#887460] hover:text-black p-0.5 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-[#866D52] font-medium uppercase tracking-wider mt-1">
            {activeBook.author} &bull; {activeBook.era}
          </p>
          <p className="text-[#4E4336] leading-relaxed mt-2 text-[11px]">
            {activeBook.theme}
          </p>
        </div>
      )}

      {/* Realistic Stack of Antique Leather Books */}
      <div className="w-56 md:w-64 space-y-[2px] filter drop-shadow-md">
        {CLASSIC_BOOKS.map((book, idx) => (
          <div
            key={book.title}
            onClick={() => setActiveBook(activeBook?.title === book.title ? null : book)}
            style={{ backgroundColor: book.color }}
            className={`w-full py-1.5 px-3 rounded-xs border-y border-white/10 cursor-pointer transition-all duration-200 hover:brightness-110 flex items-center justify-between text-[#F1E8DB] shadow-xs relative overflow-hidden group ${
              idx === 0 ? 'rounded-t-sm' : ''
            } ${idx === CLASSIC_BOOKS.length - 1 ? 'rounded-b-sm' : ''}`}
            title={`Click to read about ${book.title}`}
          >
            {/* Vintage Book Spine Foil Line */}
            <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-[#D4AF37]/40" />
            <div className="absolute right-1 top-0 bottom-0 w-[1px] bg-[#D4AF37]/40" />

            <span className="text-[9px] md:text-[10px] tracking-[0.14em] font-serif uppercase truncate text-[#E9DEC9] group-hover:text-[#FFF8EC]">
              {book.title}
            </span>

            {/* Subtle vintage gold emblem */}
            <span className="text-[8px] text-[#D8B979] ml-1 opacity-70 group-hover:opacity-100 font-serif">
              ✦
            </span>
          </div>
        ))}

        {/* Travertine Stone Plinth & Brass Singing Bowl */}
        <div className="relative pt-1">
          {/* Stone Plinth */}
          <div className="w-full h-3.5 bg-gradient-to-r from-[#DFD3C3] via-[#EADBCA] to-[#D5C7B5] rounded-xs shadow-inner border-t border-[#FFF8EE]/60 flex items-center justify-between px-2">
            <span className="text-[8px] text-[#86735E] font-serif italic">travertine pedestal</span>
          </div>

          {/* Brass Singing Bowl on side */}
          <div className="absolute -top-3 -right-3 w-8 h-5 rounded-b-full bg-gradient-to-b from-[#C49B55] via-[#A87F3B] to-[#7A5B23] border border-[#8C6B2F] shadow-sm transform rotate-6 flex items-center justify-center">
            <div className="w-6 h-1 rounded-full bg-[#E5BF77]/60 -mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
