import { getDifficultyConfig } from '../config/difficulty.js'
import { getAllElements } from '../config/elements.js'
import { shuffleArray, getRandomItems } from './helpers.js'

/**
 * 生成游戏题目
 * @param {Number} difficultyLevel - 难度等级 (1-6)
 * @returns {Object} 题目对象
 */
export function generateQuestion(difficultyLevel) {
  const config = getDifficultyConfig(difficultyLevel)
  const allElements = getAllElements()

  // 1. 随机选择指定数量的元素
  const selectedElements = getRandomItems(allElements, config.elementCount)

  // 2. 从选中的元素中随机移除指定数量的元素
  const removedElements = getRandomItems(selectedElements, config.removeCount)

  // 3. 生成选项（始终4个）
  // 选项 = 所有被移除的元素 + 干扰项（从未被选中的元素中随机选择）
  // 确保总共4个选项
  const availableForWrong = allElements.filter(
    e => !selectedElements.find(s => s.id === e.id)
  )
  const wrongCount = 4 - config.removeCount // 需要的干扰项数量
  const wrongOptions = getRandomItems(availableForWrong, wrongCount)
  // 组合并打乱选项
  const options = shuffleArray([...removedElements, ...wrongOptions])

  return {
    allElements: selectedElements.map(e => e.id),
    removedElements: removedElements.map(e => e.id),
    options: options.map(e => e.id),
    correctAnswers: removedElements.map(e => e.id), // 所有正确答案
    requiredCount: config.removeCount, // 需要选择的数量
    displayTime: config.displayTime,
    answerTime: config.answerTime,
    displayTimeLeft: config.displayTime,
    answerTimeLeft: config.answerTime
  }
}

/**
 * 验证单个选择是否正确
 * @param {Object} question - 题目对象
 * @param {Number} selectedOptionId - 用户选择的选项ID
 * @returns {Boolean} 是否正确
 */
export function validateAnswer(question, selectedOptionId) {
  return question.correctAnswers.includes(selectedOptionId)
}

/**
 * 检查是否已完成所有选择
 * @param {Object} question - 题目对象
 * @param {Array} selectedAnswers - 已选择的答案数组
 * @returns {Boolean} 是否已完成
 */
export function isAnswerComplete(question, selectedAnswers) {
  return selectedAnswers.length >= question.requiredCount
}

/**
 * 计算最终正确率
 * @param {Object} question - 题目对象
 * @param {Array} selectedAnswers - 已选择的答案数组
 * @returns {Boolean} 是否全部正确
 */
export function isFinalAnswerCorrect(question, selectedAnswers) {
  // 检查数量是否正确
  if (selectedAnswers.length !== question.requiredCount) {
    return false
  }

  // 检查每个选择是否都正确
  return selectedAnswers.every(id => question.correctAnswers.includes(id))
}
