// LocalStorage-based history persistence
const KEY = 'space_explorer_history_v1'
const LANG_KEY = 'space_explorer_lang'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (_) { return [] }
}

export function saveHistory(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch (_) {}
}

export function appendRecord(rec) {
  const list = loadHistory()
  list.unshift(rec)
  saveHistory(list.slice(0, 100))
}

export function clearHistory() { saveHistory([]) }

export function loadLang() {
  try { return localStorage.getItem(LANG_KEY) || 'zh' } catch (_) { return 'zh' }
}
export function saveLang(l) { try { localStorage.setItem(LANG_KEY, l) } catch (_) {} }
