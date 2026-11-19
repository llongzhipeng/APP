// Difficulty config per README
export const LEVELS = {
  1: { interferer: false, maxTime: 4.0,  coef: 1.0 },
  2: { interferer: true,  maxTime: 3.0,  coef: 1.5 },
  3: { interferer: false, maxTime: 3.0,  coef: 2.0 },
  4: { interferer: true,  maxTime: 2.5,  coef: 2.5 },
  5: { interferer: false, maxTime: 2.5,  coef: 3.0 },
  6: { interferer: true,  maxTime: 2.0,  coef: 3.5 },
}

// Rule kind per level
// 1-2: order — tap all digits shown in order
// 3-4: only tap digits inside circle
// 5-6: tap digits NOT inside triangle
export function ruleKind(level) {
  if (level <= 2) return 'order'
  if (level <= 4) return 'circle'
  return 'nonTriangle'
}

export function ruleText(level, lang) {
  const k = ruleKind(level)
  if (lang === 'en') {
    if (k === 'order') return 'Quickly press the numbers shown on the blackboard on your keyboard.'
    if (k === 'circle') return 'Quickly press only the numbers inside the circular frames on your keyboard.'
    return 'Quickly type only numbers outside triangular frames on your keyboard.'
  }
  if (k === 'order') return '请快速在键盘上点击黑板上出现的数字。'
  if (k === 'circle') return '请快速在键盘上点击仅被「圆形」框住的数字'
  return '请快速在键盘上点击「非三角形」框住的数字'
}

const HISTORY_KEY = 'newG32_history'

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch (e) { return [] }
}
export function saveHistory(rec) {
  const list = loadHistory()
  list.unshift(rec)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 200)))
}
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}
