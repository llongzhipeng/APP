// 训练记录管理
const STORAGE_KEY = 'shopping_game_records'

export function saveTrainingRecord(record) {
  const records = getTrainingRecords()
  records.unshift({
    ...record,
    timestamp: Date.now(),
    date: new Date().toLocaleString()
  })

  // 只保留最近50条记录
  const limitedRecords = records.slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedRecords))
}

export function getTrainingRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load training records:', error)
    return []
  }
}

export function clearTrainingRecords() {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
