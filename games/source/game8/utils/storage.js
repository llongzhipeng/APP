const KEY = 'logic_chain_history'

export function saveRecord(record) {
  const list = getHistory()
  list.unshift(record)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    // Storage full – drop oldest
    list.pop()
    localStorage.setItem(KEY, JSON.stringify(list))
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch (e) {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
