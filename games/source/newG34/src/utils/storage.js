const HISTORY_KEY = 'newG34_history_v1';

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch (e) { return []; }
}

export function saveHistoryRecord(record) {
  const list = loadHistory();
  list.unshift(record);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 100))); }
  catch (e) { /* ignore */ }
}

export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* ignore */ }
}

export function formatDate(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
