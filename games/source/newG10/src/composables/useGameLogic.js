import { ref, computed } from '@vue/composition-api'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

import { resolveImage } from '../assets'
// 难度配置（依据 redme.md）
const difficultyConfig = [
  { level: 1, itemCount: 1, memoryTime: 5, answerTime: 15, coefficient: 1 },
  { level: 2, itemCount: 2, memoryTime: 5, answerTime: 15, coefficient: 1.5 },
  { level: 3, itemCount: 3, memoryTime: 5, answerTime: 15, coefficient: 2 },
  { level: 4, itemCount: 3, memoryTime: 4, answerTime: 15, coefficient: 2.5 },
  { level: 5, itemCount: 4, memoryTime: 8, answerTime: 15, coefficient: 3 },
  { level: 6, itemCount: 4, memoryTime: 5, answerTime: 15, coefficient: 3.5 }
]

const itemsConfig = [
  { id: 1, name: 'beverage', image: resolveImage('/image/item/Beverage.png') },
  { id: 2, name: 'broccoli', image: resolveImage('/image/item/Broccoli.png') },
  { id: 3, name: 'chocolate', image: resolveImage('/image/item/Chocolate.png') },
  { id: 4, name: 'cola', image: resolveImage('/image/item/Cola.png') },
  { id: 5, name: 'cookie', image: resolveImage('/image/item/Cookie.png') },
  { id: 6, name: 'edibleOil', image: resolveImage('/image/item/Edible_oil.png') },
  { id: 7, name: 'egg', image: resolveImage('/image/item/egg.png') },
  { id: 8, name: 'milk', image: resolveImage('/image/item/Milk.png') },
  { id: 9, name: 'plate', image: resolveImage('/image/item/Plate.png') },
  { id: 10, name: 'rice', image: resolveImage('/image/item/Rice.png') }
]

export function useGameLogic() {
  const difficulty = ref(getBatchStartDifficultyForGame('gwqd'))
  const score = ref(0)
  const currentQuestion = ref(null)
  const selectedItems = ref([])
  const questionHistory = ref([])
  const totalAnswered = ref(0)
  const successAnswered = ref(0)
  const failedAnswered = ref(0)
  const responseTimes = ref([])

  const currentDifficultyConfig = computed(() => difficultyConfig[difficulty.value - 1])

  const generateRandomItems = (count) => {
    const shuffled = [...itemsConfig].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const generateQuestion = () => {
    const config = currentDifficultyConfig.value
    const requiredItems = generateRandomItems(config.itemCount)

    // 货架上显示 8 个物品（必选 + 干扰）
    const remaining = itemsConfig.filter(d => !requiredItems.find(r => r.id === d.id))
    const shuffled = [...remaining].sort(() => Math.random() - 0.5)
    const displayItems = [...requiredItems, ...shuffled.slice(0, 8 - requiredItems.length)]
      .sort(() => Math.random() - 0.5)

    currentQuestion.value = {
      requiredItems,
      displayItems,
      startTime: Date.now()
    }
    selectedItems.value = []
  }

  const addToCart = (item) => {
    if (!selectedItems.value.find(i => i.id === item.id)) {
      selectedItems.value.push(item)
    }
  }

  const removeFromCart = (item) => {
    const idx = selectedItems.value.findIndex(i => i.id === item.id)
    if (idx > -1) selectedItems.value.splice(idx, 1)
  }

  const toggleItem = (item) => {
    const idx = selectedItems.value.findIndex(i => i.id === item.id)
    if (idx > -1) selectedItems.value.splice(idx, 1)
    else selectedItems.value.push(item)
  }

  // 校验购物车内容是否与清单完全一致
  const checkAnswer = () => {
    if (!currentQuestion.value) return false
    const config = currentDifficultyConfig.value
    const responseTime = (Date.now() - currentQuestion.value.startTime) / 1000

    const required = currentQuestion.value.requiredItems
    const selected = selectedItems.value

    const allRequired = required.every(r => selected.find(s => s.id === r.id))
    const noExtra = selected.length === required.length
    const isCorrect = allRequired && noExtra

    totalAnswered.value++
    responseTimes.value.push(responseTime)

    if (isCorrect) {
      successAnswered.value++
      score.value += 5 * config.coefficient
    } else {
      failedAnswered.value++
    }

    questionHistory.value.push({ timestamp: Date.now(), isCorrect, responseTime })
    return isCorrect
  }

  // 每 60 秒调一次，评估当前时段正确率调整难度
  const evaluateIntervalAndAdjustDifficulty = () => {
    if (questionHistory.value.length === 0) return
    const correctCount = questionHistory.value.filter(q => q.isCorrect).length
    const rate = correctCount / questionHistory.value.length
    if (rate >= 0.9 && difficulty.value < 6) difficulty.value++
    else if (rate <= 0.7 && difficulty.value > 1) difficulty.value--
    questionHistory.value = []
  }

  const resetGame = () => {
    difficulty.value = 1
    score.value = 0
    currentQuestion.value = null
    selectedItems.value = []
    questionHistory.value = []
    totalAnswered.value = 0
    successAnswered.value = 0
    failedAnswered.value = 0
    responseTimes.value = []
  }

  const averageResponseTime = computed(() => {
    if (responseTimes.value.length === 0) return 0
    const sum = responseTimes.value.reduce((a, b) => a + b, 0)
    return (sum / responseTimes.value.length).toFixed(2)
  })

  const successRate = computed(() => {
    if (totalAnswered.value === 0) return 0
    return ((successAnswered.value / totalAnswered.value) * 100).toFixed(1)
  })

  return {
    difficulty,
    score,
    responseTimes,
    currentQuestion,
    selectedItems,
    totalAnswered,
    successAnswered,
    failedAnswered,
    currentDifficultyConfig,
    averageResponseTime,
    successRate,
    generateQuestion,
    addToCart,
    removeFromCart,
    toggleItem,
    checkAnswer,
    evaluateIntervalAndAdjustDifficulty,
    resetGame
  }
}
