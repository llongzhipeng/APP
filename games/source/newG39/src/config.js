// Difficulty table per requirement
export const DIFFICULTY = [
  { level: 1, bugInterval: 3000, fireInterval: 10000, maxAnswerTime: 10000, coeff: 1 },
  { level: 2, bugInterval: 2500, fireInterval: 10000, maxAnswerTime: 10000, coeff: 1.5 },
  { level: 3, bugInterval: 2500, fireInterval: 8000,  maxAnswerTime: 8000,  coeff: 2 },
  { level: 4, bugInterval: 2300, fireInterval: 8000,  maxAnswerTime: 8000,  coeff: 2.5 },
  { level: 5, bugInterval: 2600, fireInterval: 6000,  maxAnswerTime: 6000,  coeff: 3 },
  { level: 6, bugInterval: 2100, fireInterval: 6000,  maxAnswerTime: 6000,  coeff: 3.5 }
]

export const BUG_SCORE = 5
export const FIRE_SCORE = 10
export const ADAPT_WINDOW = 60000 // 60s
export const UP_THRESHOLD = 0.9
export const DOWN_THRESHOLD = 0.7
