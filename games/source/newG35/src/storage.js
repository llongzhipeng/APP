// Local-storage backed history log.
const KEY = 'wc_history_v1'

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch (_) { return [] }
}
export function saveRecord(rec) {
  const list = loadHistory()
  list.unshift(rec)
  // Cap to a reasonable ceiling.
  if (list.length > 200) list.length = 200
  localStorage.setItem(KEY, JSON.stringify(list))
}
export function clearHistory() {
  localStorage.removeItem(KEY)
}
