const KEY = 'huoyanjinjing_history'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (_) { return [] }
}

export function saveHistoryEntry(entry) {
  const list = loadHistory()
  list.unshift(entry)
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100))) } catch (_) {}
}
