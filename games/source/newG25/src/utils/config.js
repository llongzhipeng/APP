// Difficulty configuration per level (1-6)
// grid: rows x cols targets, colors: number of color kinds, targetCount: how many active target-color targets,
// maxTime seconds, coef: score coefficient
export const DIFFICULTY = [
  { level: 1, gridR: 2, gridC: 2, colors: 1, targetCount: 1, maxTime: 10, coef: 1 },
  { level: 2, gridR: 3, gridC: 3, colors: 2, targetCount: 1, maxTime: 10, coef: 1.5 },
  { level: 3, gridR: 4, gridC: 4, colors: 2, targetCount: 2, maxTime: 8,  coef: 2 },
  { level: 4, gridR: 5, gridC: 5, colors: 3, targetCount: 2, maxTime: 8,  coef: 2.5 },
  { level: 5, gridR: 5, gridC: 6, colors: 3, targetCount: 3, maxTime: 6,  coef: 3 },
  { level: 6, gridR: 6, gridC: 6, colors: 4, targetCount: 3, maxTime: 6,  coef: 3.5 },
]

export const COLOR_POOL = [
  { key: 'red',    hex: '#ff3b4c', ring: '#ffb0b8', name: { zh: '红', en: 'RED' } },
  { key: 'blue',   hex: '#2f80ff', ring: '#b7d3ff', name: { zh: '蓝', en: 'BLUE' } },
  { key: 'green',  hex: '#22c55e', ring: '#a7ecc0', name: { zh: '绿', en: 'GREEN' } },
  { key: 'yellow', hex: '#f5b301', ring: '#ffe19b', name: { zh: '黄', en: 'YELLOW' } },
]

export function getDifficulty(level) {
  const idx = Math.max(1, Math.min(6, level)) - 1
  return DIFFICULTY[idx]
}

export function pickColors(n) {
  const arr = COLOR_POOL.slice(0, n)
  return arr
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
