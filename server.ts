import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini client if API key is available
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System prompts adhering to the non-deterministic, reflective philosophy
const ASTROLOGY_SYSTEM_INSTRUCTION = `
You are the reflective intelligence behind PATTERNS, a luxury self-discovery and astrology platform.
CRITICAL PRINCIPLES:
1. Never present astrology as scientific fact or deterministic prediction.
2. Never make fatalistic claims like "Saturn is causing your anxiety" or "You will have a fight on Tuesday".
3. Use reflective, psychological, and contemplative language: "In classical Vedic traditions (such as Brihat Parashara Hora Shastra), Saturn resonates with themes of maturation, boundaries, and quiet discipline. Its current transit through your experiential landscape may mirror this internal reckoning..."
4. Maintain a warm, calm, grounded, poetic, and discerning editorial tone.
5. Provide actionable self-inquiries, gentle reframings, and reflective themes.
`;

// Helper: Call Gemini or return fallback
async function generateReflectiveText(prompt: string, fallback: string): Promise<string> {
  if (!aiClient || !process.env.GEMINI_API_KEY) {
    return fallback;
  }
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ASTROLOGY_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || fallback;
  } catch (error) {
    console.warn('Gemini API call failed, using graceful fallback:', error);
    return fallback;
  }
}

import { calculateFullKundali, calculatePlanetaryPositions, getLahiriAyanamsa } from './src/utils/astronomy.ts';

// Helper: Formats mathematically verified astronomical transits & natal coordinates for Gemini prompts
function getCosmicTelemetry(birthDate?: string, birthTime?: string, birthLocation?: string): string {
  try {
    const now = new Date();
    const ayanamsa = getLahiriAyanamsa(now);
    const transits = calculatePlanetaryPositions(now, ayanamsa);

    let summary = `\nMATHEMATICALLY VERIFIED ASTRONOMICAL DATA (NASA JPL algorithms & Lahiri Ayanamsha ${ayanamsa.toFixed(2)}°):\n`;
    summary += `Real-Time Sky Placements for Today (${now.toDateString()}):\n`;
    for (const p of Object.values(transits)) {
      summary += `- ${p.name} (${p.sanskritName}): ${p.formattedDegree} in ${p.sign} (${p.signSanskrit}) | Nakshatra: ${p.nakshatra} (Pada ${p.pada})${p.isRetrograde ? ' [RETROGRADE ℞]' : ''}\n`;
    }

    if (birthDate) {
      const natal = calculateFullKundali(birthDate, birthTime || '12:00', birthLocation || 'New York, NY');
      summary += `\nUser's Exact Natal Kundali Placements (Sidereal):\n`;
      summary += `- Ascendant (Lagna): ${natal.ascendant.formattedDegree} in ${natal.ascendant.sign} (${natal.ascendant.signSanskrit}) | Nakshatra: ${natal.ascendant.nakshatra} (Pada ${natal.ascendant.pada})\n`;
      summary += `- Moon (Chandra): ${natal.moon.formattedDegree} in ${natal.moon.sign} (${natal.moon.signSanskrit}) | Nakshatra: ${natal.moon.nakshatra} (Pada ${natal.moon.pada})\n`;
      summary += `- Sun (Surya): ${natal.sun.formattedDegree} in ${natal.sun.sign} (${natal.sun.signSanskrit}) | Nakshatra: ${natal.sun.nakshatra}\n`;
      summary += `- Running Vimshottari Dasha: ${natal.currentDasha.mahadasha} Mahadasha / ${natal.currentDasha.antardasha} Antardasha (Active until ${natal.currentDasha.endDate})\n`;
    }
    return summary;
  } catch (err) {
    console.warn('Error formatting cosmic telemetry:', err);
    return '';
  }
}

// 0. API: Calculate Mathematical Kundali Chart (100% Free, zero-external-cost)
app.post('/api/calculate-chart', (req: Request, res: Response) => {
  try {
    const { birthDate, birthTime, birthLocation } = req.body;
    if (!birthDate) {
      return res.status(400).json({ error: 'Birth date is required' });
    }
    const chart = calculateFullKundali(
      birthDate,
      birthTime || '12:00',
      birthLocation || 'New York, NY'
    );
    res.json(chart);
  } catch (err) {
    console.error('Error calculating chart:', err);
    res.status(500).json({ error: 'Failed to calculate astrological chart' });
  }
});

// 0b. API: Current Real-Time Planetary Transits
app.get('/api/current-transits', (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const ayanamsa = getLahiriAyanamsa(now);
    const transits = calculatePlanetaryPositions(now, ayanamsa);
    res.json({
      timestamp: now.toISOString(),
      ayanamsa: {
        name: 'Lahiri (Chitrapaksha) Sidereal',
        degrees: ayanamsa,
      },
      transits,
    });
  } catch (err) {
    console.error('Error fetching current transits:', err);
    res.status(500).json({ error: 'Failed to calculate transits' });
  }
});

// 1. API: Why Am I Feeling This?
app.post('/api/feeling-insight', async (req: Request, res: Response) => {
  const { feeling, quickState, birthDetails, name } = req.body;
  const feelingInput = feeling || quickState || 'feeling a quiet shift in rhythm';
  const userName = name || 'Friend';

  const cosmicTelemetry = getCosmicTelemetry(birthDetails?.date, birthDetails?.time, birthDetails?.location);

  const prompt = `
The user (${userName}) shares this feeling or life experience:
"${feelingInput}"

${cosmicTelemetry}

CRITICAL INSTRUCTION:
Anchor your reflective interpretation directly in the verified astronomical transits and natal markers listed above. For example, explain how the actual planetary weather (such as Saturn's transit or the current Moon nakshatra) and their running Dasha mirror their subjective experience.

Generate a thoughtful, reflective Vedic astrological insight following these specific JSON keys:
{
  "summary": "2-3 sentences validating their subjective experience with tenderness and depth.",
  "cosmicContext": "An explanation of the archetypal weather (e.g. current planetary movements, transits, or Vedic planetary periods like Dasha) reflecting this emotion.",
  "planetaryInfluences": [
    {
      "planet": "e.g. Saturn (Shani)",
      "symbol": "♄",
      "archetype": "The Architect of Patience",
      "description": "How this planetary principle relates to their stated feeling."
    },
    {
      "planet": "e.g. Moon (Chandra)",
      "symbol": "☽",
      "archetype": "The Tidal Mind",
      "description": "How the lunar rhythm mirrors this emotional flow."
    }
  ],
  "affectedAreas": [
    {
      "area": "Relationships & Boundaries",
      "impact": "A natural urge to retreat or seek deeper reciprocity.",
      "guidance": "Honor the pause before committing."
    },
    {
      "area": "Internal Purpose & Pace",
      "impact": "Questioning long-held milestones.",
      "guidance": "Measure progress by depth rather than external speed."
    }
  ],
  "whyItFeelsDifferent": "Why this particular cycle feels distinct from past phases (e.g. cumulative growth, crossing a threshold).",
  "timelineOfChange": "When the energy begins shifting (e.g., 'As Mercury enters forward motion in 2 weeks and the coming New Moon resets the horizon, the pressure around articulation softens. Anticipate renewed momentum by mid-month.').",
  "reflectionThemes": [
    "What expectations am I carrying that belong to someone else?",
    "Where is silence serving me better than explanation?",
    "What would change if I gave this feeling permission to simply be?"
  ]
}
Return STRICT JSON ONLY without markdown backticks.
`;

  const fallbackData = {
    summary: `What you are describing—"${feelingInput}"—is not a random glitch in your mood, but an intelligible chapter in your emotional ecology. There is an invitation here to stop treating your hesitation as a flaw and start viewing it as a compass.`,
    cosmicContext: `In Vedic wisdom, periods of feeling withdrawn or recalibrating often mirror the quiet transit of Saturn (Shani) and the shifting tides of the Moon (Chandra). Rather than demanding immediate answers, this cosmic climate asks you to prune what is extraneous so that your roots can anchor deeper.`,
    planetaryInfluences: [
      {
        planet: 'Saturn (Shani)',
        symbol: '♄',
        archetype: 'The Master of Boundaries & Depth',
        description: 'Traditionally associated with structure and honest reckoning. When active, it gently exposes where we have outgrown superficial agreements.'
      },
      {
        planet: 'Moon (Chandra)',
        symbol: '☽',
        archetype: 'The Inner Tide & Intuition',
        description: 'The indicator of the emotional mind (Manas). A feeling of disconnection frequently coincides with a lunar transition asking you to replenish internally before reconnecting externally.'
      },
      {
        planet: 'Mercury (Budha)',
        symbol: '☿',
        archetype: 'The Discernment of Thought',
        description: 'Currently encouraging you to slow down mental chatter and replace reactive responses with contemplative silence.'
      }
    ],
    affectedAreas: [
      {
        area: 'Emotional Autonomy',
        impact: 'You may find yourself less tolerant of emotional noise or performance.',
        guidance: 'Give yourself permission to decline non-essential demands without guilt.'
      },
      {
        area: 'Creative & Professional Timing',
        impact: 'A feeling of friction if you try to force decisions before their organic season.',
        guidance: 'Trust that gestation is also part of productivity.'
      }
    ],
    whyItFeelsDifferent: 'Unlike earlier bouts of fatigue, this sensation is rooted in discernment. You are not losing interest in life; you are losing interest in what no longer rings true for the person you have quietly become.',
    timelineOfChange: 'Cosmic transits are inherently cyclical. As the current lunar cycle moves through its waxing phase over the next 10 to 14 days, the dense interiority will gradually lift into actionable clarity.',
    reflectionThemes: [
      'What expectations am I carrying that belong to someone else?',
      'Where is silence serving me better than explanation?',
      'What would change if I treated this pause as purposeful rest rather than an impasse?'
    ]
  };

  try {
    const rawResult = await generateReflectiveText(prompt, JSON.stringify(fallbackData));
    const cleaned = rawResult.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch {
    res.json(fallbackData);
  }
});

// 2. API: I'm Stuck (Decision & Pattern Analysis)
app.post('/api/stuck-analysis', async (req: Request, res: Response) => {
  const { answers } = req.body;
  // answers: [{ question: string, answer: 'yes' | 'no' | 'unsure' }]

  const prompt = `
The user completed a guided "I'm Stuck" inquiry with these answers:
${JSON.stringify(answers, null, 2)}

Analyze their responses and identify their underlying behavioral and emotional patterns.
Connect this to classical Vedic archetypes (Saturn's threshold tests, Rahu's desires, Jupiter's expansive trust) without being deterministic.

Return STRICT JSON ONLY in this format:
{
  "identifiedPatterns": [
    {
      "title": "e.g. The Paradox of External Permission",
      "description": "How the answers reveal where they are waiting for external validation rather than trusting internal instinct."
    },
    {
      "title": "e.g. Anticipatory Grief for the Old Self",
      "description": "Fear of the void that occurs between closing one door and seeing the next one open."
    }
  ],
  "astrologicalResonance": "How this crossroads mirrors classic astrological threshold archetypes (e.g. Saturnian consolidation vs. Mars impulse).",
  "theCoreChoice": "The essential single question or truth they must face without distractions.",
  "gentleActions": [
    "Step 1: Write down the worst-case scenario and notice how much of it is social embarrassment rather than actual danger.",
    "Step 2: Take one 24-hour moratorium on asking anyone else for advice.",
    "Step 3: Test a micro-commitment before making the full leap."
  ]
}
`;

  const fallbackData = {
    identifiedPatterns: [
      {
        title: 'The Paradox of External Permission',
        description: 'Your answers indicate that the path forward is already known to your deeper instinct, but you may be waiting for a social or familial sign-off that may never arrive.'
      },
      {
        title: 'The Weighing of Familiar Discomfort vs. Unknown Possibility',
        description: 'Staying in familiar friction often feels safer than the vulnerable emptiness of starting anew. This is not weakness; it is your nervous system seeking equilibrium.'
      }
    ],
    astrologicalResonance: 'In classic Vedic texts like Saravali, periods of being "stuck" often correspond with planetary thresholds—such as crossing into a new Nakshatra or the quiet stationing of Jupiter. You are experiencing the natural inertia that precedes structural realignment.',
    theCoreChoice: 'Are you choosing to stay because it is truly nourishing, or simply because you know how to survive the familiar ache?',
    gentleActions: [
      'Take a 48-hour moratorium on asking friends or family for their opinion on this matter.',
      'Spend 15 minutes writing the truth of what you want if guaranteed that nobody would judge you.',
      'Take one small, reversible action toward the new direction to test the waters without burning bridges.'
    ]
  };

  try {
    const rawResult = await generateReflectiveText(prompt, JSON.stringify(fallbackData));
    const cleaned = rawResult.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch {
    res.json(fallbackData);
  }
});

// 3. API: Compatibility Synastry (Non-Percentage)
app.post('/api/compatibility', async (req: Request, res: Response) => {
  const { personA, personB } = req.body;

  let synastryTelemetry = '';
  try {
    if (personA?.birthDate && personB?.birthDate) {
      const chartA = calculateFullKundali(personA.birthDate, personA.birthTime || '12:00', personA.birthLocation || 'New York, NY');
      const chartB = calculateFullKundali(personB.birthDate, personB.birthTime || '12:00', personB.birthLocation || 'New York, NY');
      synastryTelemetry = `
MATHEMATICALLY CALCULATED SYNASTRY PLACEMENTS (Sidereal / Lahiri):
${personA.name || 'Partner A'}:
- Moon: ${chartA.moon.formattedDegree} in ${chartA.moon.sign} | Nakshatra: ${chartA.moon.nakshatra} (Pada ${chartA.moon.pada})
- Lagna: ${chartA.ascendant.formattedDegree} in ${chartA.ascendant.sign}
- Venus: ${chartA.planets.venus?.formattedDegree || 'N/A'} in ${chartA.planets.venus?.sign || 'N/A'}
- Mars: ${chartA.planets.mars?.formattedDegree || 'N/A'} in ${chartA.planets.mars?.sign || 'N/A'}
- Mercury: ${chartA.planets.mercury?.formattedDegree || 'N/A'} in ${chartA.planets.mercury?.sign || 'N/A'}

${personB.name || 'Partner B'}:
- Moon: ${chartB.moon.formattedDegree} in ${chartB.moon.sign} | Nakshatra: ${chartB.moon.nakshatra} (Pada ${chartB.moon.pada})
- Lagna: ${chartB.ascendant.formattedDegree} in ${chartB.ascendant.sign}
- Venus: ${chartB.planets.venus?.formattedDegree || 'N/A'} in ${chartB.planets.venus?.sign || 'N/A'}
- Mars: ${chartB.planets.mars?.formattedDegree || 'N/A'} in ${chartB.planets.mars?.sign || 'N/A'}
- Mercury: ${chartB.planets.mercury?.formattedDegree || 'N/A'} in ${chartB.planets.mercury?.sign || 'N/A'}
`;
    }
  } catch (err) {
    console.warn('Error calculating synastry placements:', err);
  }

  const prompt = `
Analyze the relationship dynamics between:
Person 1: ${personA?.name || 'Partner A'} (${personA?.birthDate || 'Date unspecified'}, ${personA?.birthLocation || 'Location unspecified'})
Person 2: ${personB?.name || 'Partner B'} (${personB?.birthDate || 'Date unspecified'}, ${personB?.birthLocation || 'Location unspecified'})

${synastryTelemetry}

Adhere to the rule: DO NOT PROVIDE A PERCENTAGE MATCH.
Instead, unpack the multidimensional Vedic synastry (such as Moon-Moon harmony, Mercury communication flow, Venus-Mars magnetic polarity, and Saturnian longevity) grounded in the planetary alignments above.

Return STRICT JSON ONLY in this format:
{
  "emotionalConnection": {
    "title": "Lunar Rhythm & Emotional Sanctuary",
    "description": "How their feeling natures interlock, soothe, or require space."
  },
  "communication": {
    "title": "Intellectual Cadence & Mercury Flow",
    "description": "How they share ideas, handle misunderstandings, and process dialogue."
  },
  "attraction": {
    "title": "Magnetic Spark & Venusian Chemistry",
    "description": "The nature of the draw between them—whether electric, slow-burning, or deeply spiritual."
  },
  "conflictPatterns": {
    "title": "Recurring Friction Points",
    "description": "Where differing defensive styles trigger one another (e.g. withdrawal vs. pursuit)."
  },
  "differentNeeds": {
    "title": "Contrasting Needs for Space vs. Intimacy",
    "description": "How their individuality must be honored for the partnership to breathe."
  },
  "currentThemes": {
    "title": "The Present Shared Season",
    "description": "The cosmic theme illuminating their bond right now."
  },
  "areasOfGrowth": [
    "Practicing conscious listening when feeling criticized.",
    "Cultivating separate creative or personal outlets so the relationship does not carry the weight of all fulfillment.",
    "Honoring each other's pace in making decisions."
  ]
}
`;

  const fallbackData = {
    emotionalConnection: {
      title: 'Deep Empathy with Differing Rhythms',
      description: 'Your connection operates on a foundation of unspoken mutual recognition. When one is overwhelmed, the other naturally senses the shift. However, one of you processes emotion through verbal reflection, while the other needs silent integration before sharing.'
    },
    communication: {
      title: 'Curious & Expansive Dialogue',
      description: 'Mercury indicates an easy flow of ideas and shared curiosity about life. Misunderstandings usually arise not from ill intent, but from differences in delivery—one being direct and factual, the other sensitive to nuance and undertones.'
    },
    attraction: {
      title: 'Devotional & Grounded Spark',
      description: 'This is not an erratic, roller-coaster chemistry; it is a grounding magnetic affinity that deepens as trust is earned. You offer each other a feeling of arriving home.'
    },
    conflictPatterns: {
      title: 'The Classic Pursuit & Retreat Dynamic',
      description: 'Under pressure, one partner tends to seek immediate resolution through conversation, while the other instinctively pulls back into their shell to protect themselves from emotional flooding.'
    },
    differentNeeds: {
      title: 'Autonomy vs. Shared Sanctity',
      description: 'One needs explicit solitude to recharge their creative energy, while the other finds renewal through shared rituals and presence.'
    },
    currentThemes: {
      title: 'Transitioning from Romance to Conscious Partnership',
      description: 'The current planetary transits highlight mutual accountability. It is an era of moving past idealized expectations and embracing each other as wonderfully imperfect human beings.'
    },
    areasOfGrowth: [
      'Learning to say "I love you and I need two hours of silence" instead of abruptly shutting down.',
      'Allowing space for differing opinions without equating disagreement with a lack of love.',
      'Creating intentional rituals of connection that break through the routine of daily logistics.'
    ]
  };

  try {
    const rawResult = await generateReflectiveText(prompt, JSON.stringify(fallbackData));
    const cleaned = rawResult.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch {
    res.json(fallbackData);
  }
});

// 4. API: Tarot Reflection
app.post('/api/tarot-reading', async (req: Request, res: Response) => {
  const { question, cards } = req.body;
  // cards: Array of { name, arcana, orientation, keywords }

  const prompt = `
A seeker asks: "${question || 'What does my current path ask of me?'}"
They drew three Tarot cards:
1. The Root / Foundation: ${cards?.[0]?.name || 'The High Priestess'} (${cards?.[0]?.orientation || 'Upright'})
2. The Present Crucible / Opportunity: ${cards?.[1]?.name || 'The Wheel of Fortune'} (${cards?.[1]?.orientation || 'Upright'})
3. The Guiding Insight / Horizon: ${cards?.[2]?.name || 'The Star'} (${cards?.[2]?.orientation || 'Upright'})

Provide a reflective, psychological Tarot interpretation. Connect the cards into a coherent story of self-discovery rather than fortune-telling.

Return STRICT JSON ONLY in this format:
{
  "theme": "A poetic overarching theme for the spread",
  "rootInterpretation": "How card 1 illuminates what brought them to this moment.",
  "crucibleInterpretation": "How card 2 speaks to the present tension or mirror.",
  "horizonInterpretation": "How card 3 offers a perspective to hold as they move forward.",
  "syntheticGuidance": "A synthesis of how all three cards weave together.",
  "meditationMantra": "A one-sentence contemplation for their journal."
}
`;

  const fallbackData = {
    theme: 'The Surrender to Natural Cycles & Inward Restoration',
    rootInterpretation: `At the root of your inquiry is ${cards?.[0]?.name || 'The High Priestess'}. You have been accumulating quiet impressions and unspoken truths that have not yet found their verbal expression. The seeds of your current question were planted in a moment of solitary realization.`,
    crucibleInterpretation: `In the present moment sits ${cards?.[1]?.name || 'The Wheel of Fortune'}. Life is shifting circumstances outside your direct command. The discomfort you feel is the friction of trying to steer a current that simply wishes to carry you past an old shoreline.`,
    horizonInterpretation: `Guiding your path ahead is ${cards?.[2]?.name || 'The Star'}. After the storm, calm waters always return. This card is a quiet reassurance that clarity is not something you have to fabricate by force; it will emerge naturally as the dust settles.`,
    syntheticGuidance: 'Your spread suggests that the anxiety around "solving" your situation is actually preventing you from receiving the natural resolution already unfolding. Honor the stillness at your core.',
    meditationMantra: 'I do not have to fight the tide to arrive where I am meant to be.'
  };

  try {
    const rawResult = await generateReflectiveText(prompt, JSON.stringify(fallbackData));
    const cleaned = rawResult.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch {
    res.json(fallbackData);
  }
});

// 5. API: Companion Bot Dialogue
app.post('/api/companion-chat', async (req: Request, res: Response) => {
  const { companionId, messages, userProfile } = req.body;
  // companionId: 'personal-astrologer' | 'relationship-guide' | 'career-guide' | 'tarot-guide'
  
  const companionRoles: Record<string, string> = {
    'personal-astrologer': 'You are a warm, classical Vedic Astrological Mentor. You speak through planetary archetypes, Dasha cycles, and the Nakshatras with quiet wisdom and humility.',
    'relationship-guide': 'You are the Relationship Guide on PATTERNS. You examine communication, attachment security, Venusian values, and interpersonal empathy without judgment.',
    'career-guide': 'You are the Purpose & Dharma Guide. You look at Saturnian discipline, 10th house karmic callings, and authentic life pacing, helping people find deep meaning over frantic hustle.',
    'tarot-guide': 'You are the Archetypal Tarot Companion. You explore the symbols of the major and minor arcana as mirrors of the human psyche.'
  };

  const companionRoleDesc = companionRoles[companionId] || companionRoles['personal-astrologer'];
  const userContext = userProfile ? `User name: ${userProfile.name}, Birth Date: ${userProfile.birthDate || 'Unknown'}` : 'Seeker';
  const cosmicTelemetry = userProfile?.birthDate ? getCosmicTelemetry(userProfile.birthDate, userProfile.birthTime, userProfile.birthLocation) : getCosmicTelemetry();

  const lastUserMessage = messages?.[messages.length - 1]?.content || 'Hello, I would like to explore my current state.';

  const prompt = `
${companionRoleDesc}
Context: ${userContext}

${cosmicTelemetry}

Conversation history:
${(messages || []).map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')}

Respond to the user's latest query with depth, emotional warmth, and reflective precision.
Draw gently on their actual astronomical placements, running Dasha, or current planetary transits if relevant, but always keep the focus on their lived emotional experience.
Keep the response to 2-3 focused paragraphs. Do not use generic chatbot boilerplate. Speak like an experienced, thoughtful mentor sitting with them over warm tea.
`;

  const fallbackResponse = `Thank you for sharing that with me. When we step back and look at where you find yourself today, it is natural for the mind to seek immediate certainty. Yet the planetary energies and your own lived history remind us that the periods of greatest growth are often quiet, unassuming, and somewhat ambiguous. What would happen if, just for today, you stopped measuring your readiness and simply trusted what your body is telling you?`;

  try {
    const text = await generateReflectiveText(prompt, fallbackResponse);
    res.json({ reply: text });
  } catch {
    res.json({ reply: fallbackResponse });
  }
});

// Serve frontend in dev or prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PATTERNS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
