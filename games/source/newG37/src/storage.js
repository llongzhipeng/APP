// 历史记录存储
const KEY = 'sortChallenge.history.v1'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (e) { return [] }
}

export function saveHistoryRecord(rec) {
  const list = loadHistory()
  list.unshift(rec)
  // 最多 50 条
  const trimmed = list.slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}

export function formatDate(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
