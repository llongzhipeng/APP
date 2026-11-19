const HISTORY_KEY = 'newG51_history'

export function loadHistory() {
  try {
    const s = localStorage.getItem(HISTORY_KEY)
    if (!s) return []
    return JSON.parse(s) || []
  } catch (e) {
    return []
  }
}

export function saveRecord(record) {
  const all = loadHistory()
  all.unshift(record)
  const clipped = all.slice(0, 100)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(clipped))
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export function formatDate(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
