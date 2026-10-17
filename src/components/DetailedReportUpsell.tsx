/**
 * The offer that closes every reading.
 *
 * Each journey — a feeling, a stuck decision, a relationship, a chart, a
 * tarot spread — ends somewhere different, so each gets a line written for
 * where it just left you rather than one generic blurb. What stays identical
 * is the shape of the promise: the reading you were just given is whole, and
 * this goes further into the same chart.
 *
 * It is deliberately not a cliffhanger. Withholding something ominous and
 * charging to reveal it would be prediction dressed as a teaser, which is the
 * one thing this product promises not to do.
 *
 * The user profile is read from local storage rather than passed down. Two of
 * the modals that need this never received the profile as a prop, and
 * threading it through would have meant touching the root component for a
 * value it already persists there under this exact key.
 */

import { useState } from 'react';
import { UserProfile } from '../types';
import DetailedReportModal from './DetailedReportModal';

const PROFILE_KEY = 'patterns_user_profile';

const FALLBACK_PROFILE: UserProfile = {
  name: 'Seeker',
  birthDate: '',
  birthTime: '',
  birthLocation: '',
  sunSign: '',
  moonSign: '',
  ascendant: '',
  nakshatra: '',
  onboarded: false,
};

function readProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? { ...FALLBACK_PROFILE, ...JSON.parse(saved) } : FALLBACK_PROFILE;
  } catch {
    return FALLBACK_PROFILE;
  }
}

type Context = 'feeling' | 'stuck' | 'relationship' | 'chart' | 'tarot';

/** One line per journey, picking up where that particular reading stopped. */
const COPY: Record<Context, { heading: string; body: string }> = {
  feeling: {
    heading: 'The whole chart, not just this moment.',
    body:
      'What you have just read is complete in itself. The detailed reading goes further into the same chart — your Lagna, Moon and Sun one by one, the Dasha period you are running, four areas of life taken separately, and the months ahead.',
  },
  stuck: {
    heading: 'The decision sits inside a longer season.',
    body:
      'This looked at the choice in front of you. The detailed reading looks at the chapter it falls in — the Dasha period you are running and what it asks of you, the patterns that keep returning, and how the coming months are shaped.',
  },
  relationship: {
    heading: 'Your own chart, read on its own terms.',
    body:
      'This read the two of you together. The detailed reading turns back to you alone — your Lagna, Moon and Sun, the period you are running, and the patterns you bring into every relationship rather than this one.',
  },
  chart: {
    heading: 'The placements, read rather than listed.',
    body:
      'You have the positions. The detailed reading interprets them — what your Ascendant, Moon and Sun each describe, the Vimshottari period you are in, and four areas of life taken separately with a practice for each.',
  },
  tarot: {
    heading: 'The cards show the moment. The chart shows the season.',
    body:
      'A spread reads where you are standing today. The detailed reading works from your birth chart instead — the long planetary period you are inside, the patterns that keep returning, and the months ahead.',
  },
};

type Props = {
  context: Context;
  /** Carried into the paid reading as what they were already circling. */
  focusHint?: string;
};

export default function DetailedReportUpsell({ context, focusHint }: Props) {
  const [open, setOpen] = useState(false);
  const [profile] = useState<UserProfile>(readProfile);
  const copy = COPY[context];

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F6F2EB] border border-[#DECDBB]">
        <h4 className="font-serif text-lg sm:text-xl text-[#1F1B16] mb-2">{copy.heading}</h4>
        <p className="text-xs sm:text-[13px] text-[#5C5042] leading-relaxed mb-4">{copy.body}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#181512] text-[#F9F7F1] text-xs font-medium tracking-wide hover:bg-[#302821] transition-colors cursor-pointer"
        >
          Read the detailed report · ₹50
        </button>
      </div>

      <DetailedReportModal
        isOpen={open}
        onClose={() => setOpen(false)}
        userProfile={profile}
        focusHint={focusHint}
      />
    </>
  );
}
