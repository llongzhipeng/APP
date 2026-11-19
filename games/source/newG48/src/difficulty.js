// Emotion Journey difficulty config per redme.md
// happy: number of happy stars, sad: number of sad stars,
// speed: multiplier (0.5 slow → 1.5 fast), coeff: score coefficient
export const DIFFICULTIES = [
  { level: 1, happy: 3,  sad: 1, speed: 0.3, coeff: 1   },
  { level: 2, happy: 5,  sad: 2, speed: 0.5, coeff: 1.5 },
  { level: 3, happy: 7,  sad: 3, speed: 1.0, coeff: 2   },
  { level: 4, happy: 8,  sad: 4, speed: 1.0, coeff: 2.5 },
  { level: 5, happy: 9,  sad: 5, speed: 1.5, coeff: 3   },
  { level: 6, happy: 10, sad: 6, speed: 1.5, coeff: 3.5 }
]

export function getDifficulty(level) {
  const c = Math.max(1, Math.min(6, level))
  return DIFFICULTIES[c - 1]
}
