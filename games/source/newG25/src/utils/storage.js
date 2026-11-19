const KEY = 'boxing_history_v1'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (_) { return [] }
}

export function saveRecord(rec) {
  const list = loadHistory()
  list.unshift(rec)
  if (list.length > 100) list.length = 100
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}

export function formatTime(ts) {
  const d = new Date(ts)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2,'0')}`
}
