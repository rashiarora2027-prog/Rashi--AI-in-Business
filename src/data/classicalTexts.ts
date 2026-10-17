/**
 * The classical Vedic texts PATTERNS draws its interpretive vocabulary from.
 *
 * Dating and authorship of these works is genuinely contested by scholars — the
 * surviving manuscripts are much later than the traditions they record. The
 * copy here hedges deliberately rather than stating disputed dates as fact,
 * which is the same standard the readings themselves are held to.
 */

export type ClassicalText = {
  slug: string;
  title: string;
  sanskrit: string;
  translation: string;
  attributed: string;
  period: string;
  /** One line for the stacked list on the homepage. */
  summary: string;
  /** Two or three paragraphs for the detail page. */
  about: string[];
  /** What this specific text contributes to a PATTERNS reading. */
  usedFor: string[];
};

export const CLASSICAL_TEXTS: ClassicalText[] = [
  {
    slug: 'brihat-parashara-hora-shastra',
    title: 'Brihat Parashara Hora Shastra',
    sanskrit: 'बृहत् पराशर होरा शास्त्र',
    translation: 'The Great Treatise on Horoscopy by Parashara',
    attributed: 'Attributed to Maharishi Parashara',
    period: 'Surviving manuscripts are medieval; the tradition it records is far older',
    summary:
      'The foundational textbook of Vedic astrology, and the source of the Dasha timeline your chart is read through.',
    about: [
      'If Vedic astrology has a single root text, this is it. Across roughly ninety-seven chapters it sets out the grammar the entire tradition still speaks: what each planet signifies, how the twelve houses divide a life, how divisional charts open a single placement into finer detail, and — most consequentially for this app — the Vimshottari Dasha system that maps a life into planetary chapters.',
      'It is worth being honest about provenance. The text is traditionally ascribed to Parashara, a sage of considerable antiquity, but the manuscripts that survive are much later compilations and scholars disagree sharply about what is original and what accreted over centuries. That does not make it less useful as an interpretive framework. It does mean nobody should present it as a fixed document handed down intact.',
      'What makes it readable as psychology rather than prophecy is its own method: it rarely states outcomes flatly, preferring to describe a planet\'s disposition, its dignity, and the conditions that strengthen or weaken it. That conditional structure is exactly what lets a modern reading treat a placement as a tendency to examine rather than a sentence to serve.',
    ],
    usedFor: [
      'The Vimshottari Dasha timeline — the running Mahadasha and Antardasha shown in your chart',
      'Planetary significations (karakatva): what Saturn, Moon or Mercury are each taken to govern',
      'House meanings, which shape how a reading separates work, relationship, mind and body',
    ],
  },
  {
    slug: 'saravali',
    title: 'Saravali',
    sanskrit: 'सारावली',
    translation: 'A Garland of Essence',
    attributed: 'Kalyana Varma',
    period: 'Usually placed around the 10th century CE',
    summary:
      'A systematic catalogue of planetary combinations, and the source of much of the archetypal language in your readings.',
    about: [
      'Where Parashara lays the foundations, Saravali builds the vocabulary. Its great contribution is the organised treatment of yogas — specific planetary combinations — and what each is held to mean. It is the kind of book that turns a chart from a list of positions into something that can be described.',
      'Kalyana Varma was explicit that he was compiling and systematising earlier material rather than inventing it, which is part of why the text reads as a reference work: dense, orderly, and more interested in completeness than persuasion.',
      'PATTERNS leans on it for tone as much as content. The idea that a difficult period is a threshold with a shape — rather than a misfortune to be averted — comes directly from how these texts describe planetary seasons.',
    ],
    usedFor: [
      'Archetypal readings of planetary combinations',
      'The language of thresholds and seasons used in reflective interpretations',
    ],
  },
  {
    slug: 'phaladeepika',
    title: 'Phaladeepika',
    sanskrit: 'फलदीपिका',
    translation: 'The Lamp That Illuminates Results',
    attributed: 'Mantreswara',
    period: 'Commonly dated to the 13th–14th century CE',
    summary:
      'Prized for concision — the text practitioners reach for when they want a principle stated cleanly.',
    about: [
      'Phaladeepika earned its long life by being clear. Where older treatises sprawl, Mantreswara compresses: significations, house results and planetary periods are stated in a form a reader can actually hold in mind. For centuries it has been the practical handbook sitting beside the foundational ones.',
      'Its concision is also its limitation, and worth naming. Compressed rules read as more absolute than they are, and the text is easy to quote in a fatalistic register it does not really require. Used carefully it sharpens a reading; used lazily it produces exactly the kind of flat prediction this app refuses to make.',
    ],
    usedFor: [
      'Concise significations for planets and houses',
      'Cross-checking interpretations against a second classical source',
    ],
  },
  {
    slug: 'jataka-parijata',
    title: 'Jataka Parijata',
    sanskrit: 'जातक पारिजात',
    translation: 'The Celestial Flowering Tree of Nativity',
    attributed: 'Vaidyanatha Dikshita',
    period: 'Commonly dated to around the 15th century CE',
    summary:
      'A comprehensive later synthesis, valued for how cleanly it classifies what came before.',
    about: [
      'Jataka Parijata arrives late enough in the tradition to survey it. Its value is organisational: it gathers scattered principles into a structure a reader can navigate, which is why it became a standard teaching text and remains one.',
      'For a product like this, its usefulness is structural rather than mystical. When a reading separates a life into domains — work and dharma, relationship, inner life, body and rhythm — it is borrowing a logic of classification these later syntheses did a great deal to settle.',
    ],
    usedFor: [
      'The house-based structure behind the life areas in a detailed reading',
    ],
  },
];

export function getTextBySlug(slug: string): ClassicalText | undefined {
  return CLASSICAL_TEXTS.find((t) => t.slug === slug);
}
