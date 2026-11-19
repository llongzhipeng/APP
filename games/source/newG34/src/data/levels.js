// Level meta. Difficulty coefficient tracks the rubric in redme.md.
export const LEVELS = [
  { level: 1, pool: 'simple',   options: 2, coeff: 1.0 },
  { level: 2, pool: 'simple',   options: 3, coeff: 1.5 },
  { level: 3, pool: 'medium',   options: 3, coeff: 2.0 },
  { level: 4, pool: 'medium',   options: 4, coeff: 2.5 },
  { level: 5, pool: 'abstract', options: 4, coeff: 3.0 },
  { level: 6, pool: 'abstract', options: 0, coeff: 3.5 }, // free input
];

export const BASE_SCORE = 5;
export const MAX_ANSWER_MS = 15000;
export const WINDOW_MS = 60000;

export function levelMeta(level) {
  return LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];
}
