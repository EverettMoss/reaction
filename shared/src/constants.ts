import type { MatchLengthOption } from './types';

export const MATCH_LENGTH_OPTIONS: MatchLengthOption[] = [
  { tier: 'short',  label: 'Short (10–30 pts)',   min: 10,  max: 30  },
  { tier: 'medium', label: 'Medium (50–100 pts)', min: 50,  max: 100 },
  { tier: 'long',   label: 'Long (150–300 pts)',  min: 150, max: 300 },
];

export const WAGER_OPTIONS = [0, 1, 2, 3, 5, 10] as const;
export type WagerValue = typeof WAGER_OPTIONS[number];

export const ACCURACY_BONUSES = {
  DEAD_CENTER: { thresholdMs: 0,  bonus: 5, label: 'Dead Center!' },
  PERFECT:     { thresholdMs: 10, bonus: 2, label: 'Perfect!'     },
  ELITE:       { thresholdMs: 25, bonus: 1, label: 'Elite!'       },
} as const;

export const ROUNDS_MODE_TOTAL = 10;

export const TARGET_INTERVAL_RANGE = { minMs: 1000, maxMs: 9999 };

export const PRE_ROUND_DISPLAY_DURATION_MS = 3000;
