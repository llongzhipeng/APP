export const DIFFICULTIES = [
  { level: 1, rule: 'forward', count: 3, maxTime: 15, coefficient: 1 },
  { level: 2, rule: 'forward', count: 4, maxTime: 15, coefficient: 1.5 },
  { level: 3, rule: 'forward', count: 5, maxTime: 15, coefficient: 2 },
  { level: 4, rule: 'reverse', count: 3, maxTime: 15, coefficient: 2.5 },
  { level: 5, rule: 'reverse', count: 4, maxTime: 15, coefficient: 3 },
  { level: 6, rule: 'reverse', count: 5, maxTime: 15, coefficient: 3.5 }
]

// Interval between voice broadcast digits (ms)
export const VOICE_GAP = 900

export const PERIOD_SECONDS = 60
export const ACCURACY_UP = 0.9
export const ACCURACY_DOWN = 0.7

export function generateNumbers(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10))
}

export function calcScore(coefficient) {
  return 5 * coefficient
}

const HISTORY_KEY = 'digitalStormVoiceHistory'

export function saveHistory(record) {
  const list = getHistory()
  list.unshift(record)
  if (list.length > 20) list.pop()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch (e) {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}
