export const DIFFICULTIES = [
  { level: 1, carSpeed: 180, obstacleInterval: 7000, coeff: 1 },
  { level: 2, carSpeed: 240, obstacleInterval: 6000, coeff: 1.5 },
  { level: 3, carSpeed: 320, obstacleInterval: 5000, coeff: 2 },
  { level: 4, carSpeed: 400, obstacleInterval: 4000, coeff: 2.5 },
  { level: 5, carSpeed: 500, obstacleInterval: 3000, coeff: 3 },
  { level: 6, carSpeed: 620, obstacleInterval: 3000, coeff: 3.5 }
]

export function getDifficulty(level) {
  const clamped = Math.max(1, Math.min(6, level))
  return DIFFICULTIES[clamped - 1]
}
