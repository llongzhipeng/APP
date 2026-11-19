// Difficulty configuration per the spec.
export const DIFFICULTIES = [
  { level: 1, infoCount: 2, memTime: 5, distTime: 0,  coef: 1   },
  { level: 2, infoCount: 2, memTime: 5, distTime: 5,  coef: 1.5 },
  { level: 3, infoCount: 3, memTime: 5, distTime: 7,  coef: 2   },
  { level: 4, infoCount: 4, memTime: 5, distTime: 9,  coef: 2.5 },
  { level: 5, infoCount: 4, memTime: 5, distTime: 11, coef: 3   },
  { level: 6, infoCount: 5, memTime: 5, distTime: 13, coef: 3.5 }
]

export const ANSWER_TIME_LIMIT = 15   // seconds
export const BASE_POINT = 5
export const UPGRADE_STREAK = 3
export const DOWNGRADE_STREAK = 2
