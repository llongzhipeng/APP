import { getMaxDifficulty, getMinDifficulty } from '../config/difficulty.js'

/**
 * 计算指定时间段内的答题正确率
 * @param {Array} answerHistory - 答题历史记录
 * @param {Number} periodStartTime - 时间段开始时间戳（毫秒）
 * @param {Number} periodEndTime - 时间段结束时间戳（毫秒）
 * @returns {Number|null} 正确率 (0-1)，如果记录为空则返回null
 */
export function calculatePeriodAccuracy(answerHistory, periodStartTime, periodEndTime) {
  const periodAnswers = answerHistory.filter(
    record => record.timestamp >= periodStartTime && record.timestamp < periodEndTime
  )

  if (periodAnswers.length === 0) {
    return null
  }

  const correctCount = periodAnswers.filter(r => r.isCorrect).length
  return correctCount / periodAnswers.length
}

/**
 * 根据正确率调整难度
 * @param {Number} currentLevel - 当前难度等级
 * @param {Number|null} accuracy - 正确率 (0-1)
 * @returns {Number} 新的难度等级
 */
export function adjustDifficulty(currentLevel, accuracy) {
  // 如果正确率为null（答题数不足），不调整难度
  if (accuracy === null) {
    return currentLevel
  }

  const maxDifficulty = getMaxDifficulty()
  const minDifficulty = getMinDifficulty()

  // 正确率 ≥ 90%，难度提升一级
  if (accuracy >= 0.9 && currentLevel < maxDifficulty) {
    return currentLevel + 1
  }

  // 正确率 ≤ 70%，难度降低一级
  if (accuracy <= 0.7 && currentLevel > minDifficulty) {
    return currentLevel - 1
  }

  // 其他情况，难度不变
  return currentLevel
}

/**
 * 检查当前30秒时间段并调整难度
 * @param {Number} currentLevel - 当前难度等级
 * @param {Array} answerHistory - 答题历史记录
 * @param {Number} gameStartTime - 游戏开始时间戳（毫秒）
 * @param {Number} currentTime - 当前时间戳（毫秒）
 * @returns {Object} { newLevel, accuracy, changed, periodStart, periodEnd }
 */
export function checkAndAdjustDifficulty(currentLevel, answerHistory, gameStartTime, currentTime) {
  // 计算已经过的时间（秒）
  const elapsedSeconds = Math.floor((currentTime - gameStartTime) / 1000)

  // 计算刚结束的30秒时间段的索引（0-based）
  // 例如：第30秒时，检查第0个时间段（0-30秒）
  //       第60秒时，检查第1个时间段（30-60秒）
  const completedPeriodIndex = Math.floor(elapsedSeconds / 30) - 1

  // 计算刚结束的时间段的开始和结束时间戳
  const periodStartTime = gameStartTime + (completedPeriodIndex * 30 * 1000)
  const periodEndTime = periodStartTime + (30 * 1000)

  // 计算该时间段的正确率
  const accuracy = calculatePeriodAccuracy(answerHistory, periodStartTime, periodEndTime)

  // 调整难度
  const newLevel = adjustDifficulty(currentLevel, accuracy)

  return {
    newLevel,
    accuracy,
    changed: newLevel !== currentLevel,
    increased: newLevel > currentLevel,
    decreased: newLevel < currentLevel,
    periodStart: periodStartTime,
    periodEnd: periodEndTime,
    completedPeriodIndex
  }
}
