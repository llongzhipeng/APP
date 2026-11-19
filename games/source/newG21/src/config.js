// 难度分级配置
export const DIFFICULTIES = [
  { level: 1, starCount: 2, maxTime: 15, coef: 1 },
  { level: 2, starCount: 3, maxTime: 15, coef: 1.5 },
  { level: 3, starCount: 3, maxTime: 15, coef: 2 },
  { level: 4, starCount: 4, maxTime: 15, coef: 2.5 },
  { level: 5, starCount: 4, maxTime: 30, coef: 3 },
  { level: 6, starCount: 5, maxTime: 30, coef: 3.5 },
  { level: 7, starCount: 5, maxTime: 15, coef: 4 }
]

export const DURATIONS = [1, 3, 5] // 分钟

export const HISTORY_KEY = 'starLine_history_v1'
