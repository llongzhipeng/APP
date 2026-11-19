export const DIFFICULTY_LEVELS = [
  { level: 1, interval: 3.0, maxResponse: 3.0, coef: 1.0,  invert: false },
  { level: 2, interval: 2.5, maxResponse: 2.0, coef: 1.5,  invert: false },
  { level: 3, interval: 2.0, maxResponse: 2.5, coef: 2.0,  invert: false },
  { level: 4, interval: 2.5, maxResponse: 1.5, coef: 2.5,  invert: true  },
  { level: 5, interval: 2.0, maxResponse: 2.5, coef: 3.0,  invert: true  },
  { level: 6, interval: 1.5, maxResponse: 1.5, coef: 3.5,  invert: true  }
]

export function getLevelConfig(level) {
  const idx = Math.max(1, Math.min(6, level)) - 1
  return DIFFICULTY_LEVELS[idx]
}

export function pointsFor(level) {
  return 5 * getLevelConfig(level).coef
}
