const KEY = 'rt.history.v1'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (e) { return [] }
}

export function saveRecord(rec) {
  const list = loadHistory()
  list.unshift(rec)
  // keep last 100
  const trimmed = list.slice(0, 100)
  try { localStorage.setItem(KEY, JSON.stringify(trimmed)) } catch (e) {}
  return trimmed
}

export function clearHistory() {
  try { localStorage.removeItem(KEY) } catch (e) {}
}
