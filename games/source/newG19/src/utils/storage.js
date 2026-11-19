const KEY = 'idiom_correction_history_v1'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

export function saveHistoryRecord(record) {
  const all = loadHistory()
  all.unshift(record)
  const trimmed = all.slice(0, 200)
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch (e) {}
}

export function clearHistory() {
  try { localStorage.removeItem(KEY) } catch (e) {}
}

export function formatDate(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
