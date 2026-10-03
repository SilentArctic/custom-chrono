import { PILL_KEYWORDS } from '@/utils/gameCard/cardText';

export const TRIGGERS = [
   'Immortalize',
   'Enter',
   'Play',
   'Activate',
   'Flourish',
   'Phase',
   'Sprout',
   'Erase',
   'Last Gasp',
   'Decay',
   'Bleed',
   'Deplete',
   'Rewind',
   'Strongest',
   'Weakest',
   'Breakdown',
   'Paradox',
   'Overflow',
   'Sacrifice',
   'Slip',
   'Disarm',
   'Refresh',
   'Mute',
];

export const ALL = [...PILL_KEYWORDS, ...TRIGGERS.filter((t) => !PILL_KEYWORDS.includes(t))];
