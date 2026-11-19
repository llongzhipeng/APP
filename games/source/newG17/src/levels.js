// Level config per spec
// jumpMin/jumpMax: random inclusive range of jumping dogs
// total: total dogs on screen
// distractTime: distractor task duration (seconds)
// coef: score coefficient
// distractStart: starting number for the "subtract 3" distractor (kept large so
//   subtraction never dips below zero for the given distractTime)
export const LEVELS = [
  { jumpMin: 1, jumpMax: 3, total: 4,  distractTime: 5,  coef: 1,   distractStart: 20 },
  { jumpMin: 1, jumpMax: 4, total: 6,  distractTime: 10, coef: 1.5, distractStart: 20 },
  { jumpMin: 2, jumpMax: 5, total: 8,  distractTime: 15, coef: 2,   distractStart: 30 },
  { jumpMin: 3, jumpMax: 6, total: 10, distractTime: 20, coef: 2.5, distractStart: 30 },
  { jumpMin: 4, jumpMax: 7, total: 12, distractTime: 25, coef: 3,   distractStart: 40 },
  { jumpMin: 5, jumpMax: 7, total: 14, distractTime: 30, coef: 3.5, distractStart: 40 },
]
