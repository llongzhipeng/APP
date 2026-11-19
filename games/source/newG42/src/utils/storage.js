const KEY = 'cp_history_v1'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (e) {
    return []
  }
}

export function saveHistory(record) {
  const list = loadHistory()
  list.unshift(record)
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200))) } catch (e) {}
}

export function clearHistory() {
  try { localStorage.removeItem(KEY) } catch (e) {}
}
