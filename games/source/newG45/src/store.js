// History storage using localStorage
const KEY = 'crease_detective_history_v1'

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

export function saveRecord(record) {
  const list = loadHistory()
  list.unshift(record)
  // Cap at 200 records
  while (list.length > 200) list.pop()
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {}
}

export function clearHistory() {
  try { localStorage.removeItem(KEY) } catch (e) {}
}
