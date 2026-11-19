export const DIFFICULTIES = [
  { level: 1, rule: 'forward', count: 3, maxTime: 15, coefficient: 1 },
  { level: 2, rule: 'forward', count: 4, maxTime: 15, coefficient: 1.5 },
  { level: 3, rule: 'forward', count: 5, maxTime: 15, coefficient: 2 },
  { level: 4, rule: 'reverse', count: 3, maxTime: 15, coefficient: 2.5 },
  { level: 5, rule: 'reverse', count: 4, maxTime: 15, coefficient: 3 },
  { level: 6, rule: 'reverse', count: 5, maxTime: 15, coefficient: 3.5 }
]

export const DISPLAY_TIME = {
  3: 3000,
  4: 4000,
  5: 5000
}

export const PERIOD_SECONDS = 30
export const ACCURACY_UP = 0.9
export const ACCURACY_DOWN = 0.7

export function generateNumbers(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10))
}

export function calcScore(coefficient) {
  return 5 * coefficient
}

export function saveHistory(record) {
  const key = 'digitalStormHistory'
  const list = getHistory()
  list.unshift(record)
  if (list.length > 20) list.pop()
  localStorage.setItem(key, JSON.stringify(list))
}

export function getHistory() {
  const key = 'digitalStormHistory'
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch (error) {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem('digitalStormHistory')
}
