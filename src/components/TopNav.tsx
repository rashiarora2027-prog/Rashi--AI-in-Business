import React from 'react';

interface TopNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onStartNow: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onSelectTab, onStartNow }) => {
  return (
    <header className="w-full pt-3.5 pb-2.5 px-6 md:px-12 flex items-center justify-between border-b border-[#E7DDCE]/50">
      {/* Brand Logo: Star Icon + PATTERNS */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => onSelectTab('home')}
      >
        {/* Faceted 8-point celestial star mark */}
        <div className="w-6 h-6 flex items-center justify-center text-[#7F6643] transition-transform duration-300 group-hover:rotate-45">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
          </svg>
        </div>
        <span className="text-xl md:text-2xl font-serif tracking-[0.24em] text-[#1E1A16] uppercase font-semibold">
          PATTERNS
        </span>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden lg:flex items-center gap-8 text-[13px] text-[#4F463B] font-sans">
        {[
          { id: 'home', label: 'Home' },
          { id: 'explore', label: 'Explore' },
          { id: 'about', label: 'About' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'faqs', label: 'FAQs' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative py-1 cursor-pointer transition-colors duration-150 ${
                isActive
                  ? 'text-[#1E1A16] font-medium'
                  : 'text-[#635748] hover:text-[#1E1A16]'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#1E1A16] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side: Clean Start Now Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onStartNow}
          className="cursor-pointer px-5 py-2 rounded-full bg-[#1A1815] text-[#F9F7F2] text-xs md:text-sm font-medium tracking-wide transition-all duration-200 hover:bg-[#2F2923] hover:shadow-md flex items-center gap-2"
        >
          <span>Start Now</span>
          <span className="text-sm font-serif">→</span>
        </button>
      </div>
    </header>
  );
};
