import { ref, computed } from '@vue/composition-api'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const itemImages = {
  beverage: require('../public/image/item/Beverage.png'),
  broccoli: require('../public/image/item/Broccoli.png'),
  chocolate: require('../public/image/item/Chocolate.png'),
  cola: require('../public/image/item/Cola.png'),
  cookie: require('../public/image/item/Cookie.png'),
  edibleOil: require('../public/image/item/Edible_oil.png'),
  egg: require('../public/image/item/egg.png'),
  milk: require('../public/image/item/Milk.png'),
  plate: require('../public/image/item/Plate.png'),
  rice: require('../public/image/item/Rice.png')
}
// 难度配置
const difficultyConfig = [
  { level: 1, itemCount: 1, questionTime: 5, answerTime: 25, coefficient: 1 },
  { level: 2, itemCount: 2, questionTime: 5, answerTime: 25, coefficient: 1.5 },
  { level: 3, itemCount: 3, questionTime: 5, answerTime: 25, coefficient: 2 },
  { level: 4, itemCount: 3, questionTime: 4, answerTime: 25, coefficient: 2.5 },
  { level: 5, itemCount: 4, questionTime: 5, answerTime: 25, coefficient: 3 },
  { level: 6, itemCount: 4, questionTime: 4, answerTime: 25, coefficient: 3.5 }
]

// 商品列表 - 包含图片路径和价格范围
// const itemsConfig = [
//   { id: 1, name: 'beverage', image: '../public/image/item/Beverage.png', priceRange: [2, 10] },
//   { id: 2, name: 'broccoli', image: '../public/image/item/Broccoli.png', priceRange: [2, 10] },
//   { id: 3, name: 'chocolate', image: '../public/image/item/Chocolate.png', priceRange: [2, 10] },
//   { id: 4, name: 'cola', image: '../public/image/item/Cola.png', priceRange: [2, 10] },
//   { id: 5, name: 'cookie', image: '../public/image/item/Cookie.png', priceRange: [2, 10] },
//   { id: 6, name: 'edibleOil', image: '../public/image/item/Edible_oil.png', priceRange: [30, 50] },
//   { id: 7, name: 'egg', image: '../public/image/item/egg.png', priceRange: [2, 10] },
//   { id: 8, name: 'milk', image: '../public/image/item/Milk.png', priceRange: [2, 10] },
//   { id: 9, name: 'plate', image: '../public/image/item/Plate.png', priceRange: [2, 10] },
//   { id: 10, name: 'rice', image: '../public/image/item/Rice.png', priceRange: [30, 50] }
// ]
// 商品列表 - 包含图片路径和价格范围
const itemsConfig = [
  { id: 1, name: 'beverage', image: itemImages.beverage, priceRange: [2, 10] },
  { id: 2, name: 'broccoli', image: itemImages.broccoli, priceRange: [2, 10] },
  { id: 3, name: 'chocolate', image: itemImages.chocolate, priceRange: [2, 10] },
  { id: 4, name: 'cola', image: itemImages.cola, priceRange: [2, 10] },
  { id: 5, name: 'cookie', image: itemImages.cookie, priceRange: [2, 10] },
  { id: 6, name: 'edibleOil', image: itemImages.edibleOil, priceRange: [30, 50] },
  { id: 7, name: 'egg', image: itemImages.egg, priceRange: [2, 10] },
  { id: 8, name: 'milk', image: itemImages.milk, priceRange: [2, 10] },
  { id: 9, name: 'plate', image: itemImages.plate, priceRange: [2, 10] },
  { id: 10, name: 'rice', image: itemImages.rice, priceRange: [30, 50] }
]


// 生成随机价格的商品列表
const generateItemsWithPrices = () => {
  return itemsConfig.map(item => ({
    ...item,
    price: Math.floor(Math.random() * (item.priceRange[1] - item.priceRange[0] + 1)) + item.priceRange[0]
  }))
}

// 当前游戏使用的商品列表（带随机价格）
let itemsData = generateItemsWithPrices()

export function useGameLogic() {
  const difficulty = ref(getBatchStartDifficultyForGame('csgw'))
  const score = ref(0)
  const currentQuestion = ref(null)
  const selectedItems = ref([])
  const questionHistory = ref([]) // 记录当前30秒区间内的答题历史
  const totalAnswered = ref(0)
  const successAnswered = ref(0)
  const failedAnswered = ref(0)
  const responseTimes = ref([])
  const currentIntervalStart = ref(0) // 当前30秒区间的开始时间

  // 获取当前难度配置
  const currentDifficultyConfig = computed(() => {
    return difficultyConfig[difficulty.value - 1]
  })

  // 生成随机商品
  const generateRandomItems = (count) => {
    const shuffled = [...itemsData].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // 生成价格选项
  const generatePriceOptions = (correctPrice) => {
    const options = [correctPrice]
    const usedPrices = new Set([correctPrice])

    while (options.length < 4) {
      
      const offset = Math.floor(Math.random() * 10) + 1
      const sign = Math.random() > 0.5 ? 1 : -1
      let wrongPrice = correctPrice + (offset * sign)

      // 确保价格为正数且不重复
      if (wrongPrice > 0 && !usedPrices.has(wrongPrice)) {
        options.push(wrongPrice)
        usedPrices.add(wrongPrice)
      }
    }

    // 随机打乱选项顺序
    return options.sort(() => Math.random() - 0.5)
  }


  const generateQuestion = () => {
    const config = currentDifficultyConfig.value
    const requiredItems = generateRandomItems(config.itemCount)

    
    const remaining = itemsData.filter(d => !requiredItems.find(r => r.id === d.id))
    const shuffled = [...remaining].sort(() => Math.random() - 0.5)
    const displayItems = [...requiredItems, ...shuffled.slice(0, 8 - requiredItems.length)]
      .sort(() => Math.random() - 0.5)

    const correctTotal = requiredItems.reduce((sum, item) => sum + item.price, 0)
    const priceOptions = generatePriceOptions(correctTotal)

    currentQuestion.value = {
      requiredItems,
      displayItems,
      correctTotal,
      priceOptions,
      startTime: Date.now()
    }

    selectedItems.value = []
  }

  // 选择/取消选择商品
  const toggleItem = (item) => {
    const index = selectedItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(item)
    }
  }

  // 计算选中商品总价
  const selectedTotal = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.price, 0)
  })

  // 检查商品选择是否正确
  const checkItemSelection = () => {
    if (!currentQuestion.value) return false

    // 检查是否选择了所有必选商品
    const allItemsSelected = currentQuestion.value.requiredItems.every(required =>
      selectedItems.value.find(selected => selected.id === required.id)
    )

    // 检查是否没有多选
    const noExtraItems = selectedItems.value.length === currentQuestion.value.requiredItems.length

    return allItemsSelected && noExtraItems
  }

  // 检查价格答案是否正确
  const checkPriceAnswer = (selectedPrice) => {
    if (!currentQuestion.value) return false

    const config = currentDifficultyConfig.value
    const responseTime = (Date.now() - currentQuestion.value.startTime) / 1000

    const isCorrect = selectedPrice === currentQuestion.value.correctTotal

    // 记录答题结果
    totalAnswered.value++
    responseTimes.value.push(responseTime)

    if (isCorrect) {
      successAnswered.value++
      const points = 5 * config.coefficient
      score.value += points
    } else {
      failedAnswered.value++
    }

    // 记录到当前30秒区间的历史
    questionHistory.value.push({
      timestamp: Date.now(),
      isCorrect,
      responseTime
    })

    return isCorrect
  }

  // 评估当前30秒区间并调整难度 
  const evaluateIntervalAndAdjustDifficulty = () => {
    if (questionHistory.value.length === 0) {
      // 没有答题记录，不调整难度
      return
    }

    const correctCount = questionHistory.value.filter(q => q.isCorrect).length
    const successRate = correctCount / questionHistory.value.length

    // 90%以上升1级，70%以下降1级
    if (successRate >= 0.9 && difficulty.value < 6) {
      difficulty.value++
    } else if (successRate <= 0.7 && difficulty.value > 1) {
      difficulty.value--
    }

    // 清空当前区间历史，准备下一个30秒区间
    questionHistory.value = []
  }

  // 重置游戏状态
  const resetGame = () => {
    difficulty.value = getBatchStartDifficultyForGame('csgw')
    score.value = 0
    currentQuestion.value = null
    selectedItems.value = []
    questionHistory.value = []
    totalAnswered.value = 0
    successAnswered.value = 0
    failedAnswered.value = 0
    responseTimes.value = []
    currentIntervalStart.value = 0
    // 重新生成商品价格
    itemsData = generateItemsWithPrices()
  }

  // 计算平均反应时间
  const averageResponseTime = computed(() => {
    if (responseTimes.value.length === 0) return 0
    const sum = responseTimes.value.reduce((a, b) => a + b, 0)
    return (sum / responseTimes.value.length).toFixed(2)
  })

  // 计算成功率
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
    selectedTotal,
    averageResponseTime,
    successRate,
    generateQuestion,
    toggleItem,
    checkItemSelection,
    checkPriceAnswer,
    evaluateIntervalAndAdjustDifficulty,
    resetGame,
    itemsData
  }
}
