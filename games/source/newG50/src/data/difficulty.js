// 难度配置 —— 严格按 redme.md
export const DIFFICULTY_CONFIG = {
  1: { tiers: ['super'],                       blanks: 1, options: 2, coef: 1.0,  input: false },
  2: { tiers: ['common'],                      blanks: 1, options: 3, coef: 1.5,  input: false },
  3: { tiers: ['simple', 'medium'],            blanks: 1, options: 4, coef: 2.0,  input: false },
  4: { tiers: ['simple', 'medium'],            blanks: 2, options: 4, coef: 2.5,  input: false },
  5: { tiers: ['simple', 'medium', 'hard'],    blanks: 2, options: 4, coef: 3.0,  input: false },
  6: { tiers: ['simple', 'medium', 'hard'],    blanks: 2, options: 0, coef: 3.5,  input: true  }
}

export const MAX_LEVEL = 6
export const QUESTION_TIME = 15   // 每题时间（秒）
export const ADJUST_INTERVAL = 60 // 难度调整周期（秒）
