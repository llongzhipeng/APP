export const COLORS = [
  { key: 'red',    hex: '#E57373' },
  { key: 'green',  hex: '#81C784' },
  { key: 'blue',   hex: '#64B5F6' },
  { key: 'yellow', hex: '#FFD54F' },
]

export const COLOR_KEYS = ['red', 'green', 'blue', 'yellow']

// Index 0 is unused; levels are 1–6
export const DIFFICULTY_CONFIG = [
  null,
  { level: 1, timeLimit: 10, coefficient: 1,   mismatch: false },
  { level: 2, timeLimit: 10, coefficient: 1.5, mismatch: true  },
  { level: 3, timeLimit: 8,  coefficient: 2,   mismatch: true  },
  { level: 4, timeLimit: 6,  coefficient: 2.5, mismatch: true  },
  { level: 5, timeLimit: 4,  coefficient: 3,   mismatch: true  },
  { level: 6, timeLimit: 3,  coefficient: 3.5, mismatch: true  },
]

export const HISTORY_KEY = 'colorChallenge_history'
