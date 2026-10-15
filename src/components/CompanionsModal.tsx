import React, { useState } from 'react';
import { CompanionBot, UserProfile } from '../types';

interface CompanionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const COMPANIONS: CompanionBot[] = [
  {
    id: 'personal-astrologer',
    name: 'Personal Astrologer',
    title: 'The Vedic Mentor',
    tagline: 'Transits, Dashas & Cyclical Pacing',
    description: 'Grounds your daily experiences in planetary movements, classical Sanskrit principles, and cosmic timing.',
    symbol: '☉',
    initialGreeting: 'Welcome. I am looking at the sky alongside you. What crossroad or feeling is asking for your contemplation today?',
    starterQuestions: [
      'What planetary cycles are active for me right now?',
      'Why does this week feel so dense and introspective?',
      'How does my Vedic Moon sign inform my emotional recharge?'
    ]
  },
  {
    id: 'relationship-guide',
    name: 'Relationship Guide',
    title: 'The Relational Mirror',
    tagline: 'Interpersonal Harmony & Shadow Synastry',
    description: 'Explores communication styles, love languages through Venus/Mars, and boundary dynamics without judgment.',
    symbol: '⚯',
    initialGreeting: 'Relationships are sacred mirrors of our unexamined corners. Tell me about the connection you wish to explore today.',
    starterQuestions: [
      'Why do I pull away when someone gets too close?',
      'How can my partner and I communicate through differing stress styles?',
      'What is my Venus placement teaching me about self-worth?'
    ]
  },
  {
    id: 'career-guide',
    name: 'Career & Purpose Guide',
    title: 'The Dharma Architect',
    tagline: '10th House Vocation & Long-term Mastery',
    description: 'Guides you through Saturnian endurance, authentic vocation, and pacing major milestones without burnout.',
    symbol: '♄',
    initialGreeting: 'Vocation in Vedic philosophy is known as Dharma—the sacred duty aligned with your nature. What are you building right now?',
    starterQuestions: [
      'Is my current frustration a sign to quit or a sign to persevere?',
      'How can I measure success by internal integrity rather than speed?',
      'What role does Saturn play in my career timing?'
    ]
  },
  {
    id: 'tarot-guide',
    name: 'Tarot & Archetype Guide',
    title: 'The Symbolic Companion',
    tagline: 'Jungian Mirrors & Symbolic Storytelling',
    description: 'Bridges Tarot archetypes with your subconscious narratives to find perspective on ambiguous moments.',
    symbol: '🂠',
    initialGreeting: 'Symbols speak what words often stumble over. Draw near with whatever question is unresolved.',
    starterQuestions: [
      'What does the archetype of The Hermit have to say to my loneliness?',
      'Help me interpret a card I pulled earlier today.',
      'How can I use Tarot for mindful journaling?'
    ]
  }
];

export const CompanionsModal: React.FC<CompanionsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionBot>(COMPANIONS[0]);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: COMPANIONS[0].initialGreeting }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSwitchCompanion = (bot: CompanionBot) => {
    setSelectedCompanion(bot);
    setMessages([{ role: 'assistant', content: bot.initialGreeting }]);
    setInputText('');
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: text.trim() }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: selectedCompanion.id,
          messages: newMessages,
          userProfile,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch reply');
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Thank you for sharing that. As we look at the classical wisdom of this moment, remember that planetary cycles do not dictate our destiny; they merely describe the weather in which our free will takes root. What small step feels most aligned with your inner peace today?'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#DECDBB] shadow-2xl my-8 h-[88vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold block font-sans mb-0.5">
              PERSONAL GUIDES
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-[#221C16] font-normal">
              Astrological Companions
            </h2>
            <p className="text-xs text-[#6B5A47]">
              Reflective dialogues tailored to your life season &bull; Inquiries for {userProfile.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Two-column layout: Left selector, Right chat */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 pt-4 overflow-hidden">
          
          {/* Companion Selector Column */}
          <div className="md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 pr-1 border-b md:border-b-0 md:border-r border-[#EADBCA]">
            {COMPANIONS.map((bot) => {
              const isSelected = selectedCompanion.id === bot.id;
              return (
                <button
                  key={bot.id}
                  onClick={() => handleSwitchCompanion(bot)}
                  className={`p-3 rounded-xl text-left cursor-pointer transition-all flex items-start gap-3 whitespace-nowrap md:whitespace-normal shrink-0 md:shrink border ${
                    isSelected
                      ? 'bg-[#EFE4D3] border-[#A8885B] text-[#221C16] shadow-xs'
                      : 'bg-white/60 border-transparent hover:bg-[#F5EDE1] text-[#4E4133]'
                  }`}
                >
                  <span className="text-lg font-serif text-[#866C4A] mt-0.5">{bot.symbol}</span>
                  <div>
                    <h4 className="text-xs font-semibold">{bot.name}</h4>
                    <p className="text-[10px] text-[#786754] font-serif italic line-clamp-1">{bot.tagline}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conversation Column */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-left">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#1C1814] text-[#FAF7F2] rounded-br-xs'
                        : 'bg-white/80 border border-[#E1D4C3] text-[#2E271F] font-serif italic rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 border border-[#E1D4C3] rounded-2xl p-4 text-xs text-[#7F6E5C] flex items-center gap-2">
                    <span className="animate-spin text-sm">✦</span>
                    <span className="font-serif italic">Contemplating planetary alignments...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Starter Prompts */}
            {messages.length <= 2 && (
              <div className="pt-3 pb-2 flex flex-wrap gap-1.5">
                {selectedCompanion.starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#EFE6D9] hover:bg-[#E5DAC9] text-[#473B2D] border border-[#DECDBB] transition-colors cursor-pointer text-left"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="pt-3 border-t border-[#E8DDCD] flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask ${selectedCompanion.name} anything about your patterns...`}
                className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full bg-white border border-[#DACBB8] text-[#241F1A] focus:outline-none focus:border-[#967448]"
              />
              <button
                type="button"
                disabled={loading || !inputText.trim()}
                onClick={() => handleSend()}
                className="px-5 py-2.5 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium hover:bg-[#342D26] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Send</span>
                <span className="font-serif">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
