import { HISTORY_KEY } from './config.js'

export function saveHistory(record) {
  const list = getHistory()
  list.unshift(record)
  // 只保留最近 100 条
  if (list.length > 100) list.length = 100
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch (e) {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export function formatTime(ts) {
  const d = new Date(ts)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// 随机生成 count 个不重叠的星星位置 (百分比坐标)
export function generateStarPositions(count, area = { xMin: 8, xMax: 92, yMin: 8, yMax: 78 }) {
  const positions = []
  const minDist = count <= 3 ? 22 : count === 4 ? 20 : 18
  let attempts = 0
  while (positions.length < count && attempts < 500) {
    const x = area.xMin + Math.random() * (area.xMax - area.xMin)
    const y = area.yMin + Math.random() * (area.yMax - area.yMin)
    const ok = positions.every(p => Math.hypot(p.x - x, p.y - y) > minDist)
    if (ok) positions.push({ x, y })
    attempts++
  }
  // 兜底：不够的就随便填
  while (positions.length < count) {
    positions.push({
      x: area.xMin + Math.random() * (area.xMax - area.xMin),
      y: area.yMin + Math.random() * (area.yMax - area.yMin)
    })
  }
  return positions
}
