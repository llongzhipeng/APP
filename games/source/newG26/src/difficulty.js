// Difficulty configuration
// level: 1..6
// bpm: beats per minute (each side alternates -> combined rate = 2 * side rate)
// tolerance: seconds allowed either side of the beat for a "hit"
// coef: score coefficient

export const LEVELS = [
  { level: 1, bpm: 40,  tolerance: 2.0,  coef: 1.0, labelKey: 'tempoSlow'   },
  { level: 2, bpm: 55,  tolerance: 1.0,  coef: 1.5, labelKey: 'tempoSlower' },
  { level: 3, bpm: 75,  tolerance: 0.5,  coef: 2.0, labelKey: 'tempoMid'    },
  { level: 4, bpm: 95,  tolerance: 0.3,  coef: 2.5, labelKey: 'tempoMid'    },
  { level: 5, bpm: 115, tolerance: 0.2,  coef: 3.0, labelKey: 'tempoFast'   },
  { level: 6, bpm: 135, tolerance: 0.15, coef: 3.5, labelKey: 'tempoFaster' }
]

export function getLevel(n) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, n - 1))]
}

// Duration between alternating beats (left→right→left) in seconds.
// One "beat" event is one side, so beat interval = 60 / bpm.
export function beatInterval(level) {
  return 60 / getLevel(level).bpm
}
