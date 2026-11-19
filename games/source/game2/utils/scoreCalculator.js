import { getDifficultyConfig } from '../config/difficulty.js'

/**
 * 计算单题得分
 * @param {Number} difficultyLevel - 难度等级
 * @param {Boolean} isCorrect - 是否答对
 * @returns {Number} 得分
 */
export function calculateQuestionScore(difficultyLevel, isCorrect) {
  if (!isCorrect) {
    return 0
  }

  const config = getDifficultyConfig(difficultyLevel)
  return 5 * config.coefficient
}

/**
 * 计算总分
 * @param {Array} answerRecords - 答题记录数组
 * @returns {Number} 总分
 */
export function calculateTotalScore(answerRecords) {
  return answerRecords.reduce((total, record) => {
    if (record.isCorrect) {
      return total + calculateQuestionScore(record.difficulty, true)
    }
    return total
  }, 0)
}
