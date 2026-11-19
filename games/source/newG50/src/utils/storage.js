const KEY = 'idiom-fill-history-v1'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (_) { return [] }
}

export function saveHistory(record) {
  const list = loadHistory()
  list.unshift(record)
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}

export function formatTime(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}分${String(s).padStart(2,'0')}秒`
}
