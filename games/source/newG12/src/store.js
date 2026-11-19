const KEY = 'emotion.history'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function saveHistoryRecord(record) {
  const list = loadHistory()
  list.unshift(record)
  const trimmed = list.slice(0, 100)
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
