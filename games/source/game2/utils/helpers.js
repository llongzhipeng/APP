// 生成UUID
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Fisher-Yates 数组打乱算法
export function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 延迟函数
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 格式化时间（秒转 mm:ss）
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 格式化日期时间
export function formatDateTime(isoString) {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化百分比
export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}

// 从数组中随机选择n个不重复的元素
export function getRandomItems(array, count) {
  return shuffleArray(array).slice(0, count)
}

// 判断两个数组是否有交集
export function hasIntersection(arr1, arr2) {
  return arr1.some(item => arr2.includes(item))
}

// 数组去重
export function uniqueArray(array) {
  return [...new Set(array)]
}
