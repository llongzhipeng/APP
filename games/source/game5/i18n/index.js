import { reactive }  from '@vue/composition-api';

const messages = {
  zh: {
    title: '超市购物',
    startGame: '开始游戏',
    viewRecords: '查看记录',
    gameRules: '游戏规则',
    skip: '跳过游戏',
    selectDuration: '选择训练时长',
    minutes: '分钟',
    difficulty: '难度',
    score: '分数',
    timeLeft: '剩余时间',
    question: '请选择以下商品',
    submit: '提交答案',
    checkout: '结算',
    selectPrice: '请选择总价',
    totalPrice: '总价',
    correct: '回答正确',
    incorrect: '回答错误',
    itemsNotMatch: '商品选择不正确',
    prevQuestion: '上一题',
    nextQuestion: '下一题',
    startAnswer: '开始答题',
    gameOver: '游戏结束',
    finalScore: '最终得分',
    backToHome: '返回主页',
    records: '训练记录',
    trainingTime: '训练时间',
    trainingProject: '训练项目',
    difficultyLevel: '难度等级',
    duration: '时长',
    totalQuestions: '总次数',
    successCount: '成功次数',
    failCount: '失败次数',
    successRate: '成功率',
    avgResponseTime: '平均反应时长',
    scoreLabel: '得分',
    close: '关闭',
    rulesTitle: '游戏规则',
    rulesContent: {
      intro: '游戏介绍：超市购物是将基础算术与物品匹配相结合的快速反应游戏，核心主要是训练计算自动化和视觉匹配度。',
      objective: '游戏目标：根据题目要求选购指定的商品，并计算所购商品的总价。',
      howToPlay: '玩法描述：进入超市购物场景中，正前方会出现标有商品名称和价格的货架，用户需要根据题目要求选择相应的货物至购物车，在选择货物过程中需记住货物的价格并计算所需货物的总价。',
      difficultyTitle: '难度分级：',
      difficultyDesc: '共6个难度等级，物品数量从1-4个，题目展示时间4-5秒，答题时间25秒',
      smartAdjust: '智能调整：30秒内正确率90%以上升1级，70%以下降1级',
      scoringRule: '评分规则：难度1答对得5分，后续每答对1题得分=5×难度系数'
    },
    items: {
      beverage: '饮料',
      broccoli: '西兰花',
      chocolate: '巧克力',
      cola: '可乐',
      cookie: '饼干',
      edibleOil: '食用油',
      egg: '鸡蛋',
      milk: '牛奶',
      plate: '盘子',
      rice: '大米'
    },
    tutorial: {
      skip: '跳过教程',
      prev: '上一步',
      next: '下一步',
      start: '开始游戏',
      cart: '购物车',
      step1: {
        title: '第一步：查看题目',
        desc: '系统会显示需要购买的商品名称，请仔细记住它们！',
        hint: '记住商品名称，准备开始购物'
      },
      step2: {
        title: '第二步：选择商品',
        desc: '从货架上找到并选择所需商品，注意记住价格！',
        hint: '点击商品卡片选择，再次点击取消选择'
      },
      step3: {
        title: '第三步：计算总价',
        desc: '记住商品价格，计算总价，然后从4个选项中选择正确答案',
        hint: '选择正确的总价才能得分'
      },
      step4: {
        title: '准备好了吗？',
        desc: '完成以上步骤就能得分！现在让我们开始游戏吧！',
        feature1: '6个难度等级，智能调整',
        feature2: '详细的训练数据统计',
        feature3: '记录反应时间和成功率'
      }
    }
  },
  en: {
    title: 'Supermarket Shopping',
    startGame: 'Start Game',
    viewRecords: 'View Records',
    gameRules: 'Game Rules',
    skip: 'Skip Game',
    selectDuration: 'Select Training Duration',
    minutes: 'min',
    difficulty: 'Difficulty',
    score: 'Score',
    timeLeft: 'Time Left',
    question: 'Please select the following items',
    submit: 'Submit Answer',
    checkout: 'Checkout',
    selectPrice: 'Please select the total price',
    totalPrice: 'Total Price',
    correct: 'Correct',
    incorrect: 'Incorrect',
    itemsNotMatch: 'Items selection incorrect',
    prevQuestion: 'Previous',
    nextQuestion: 'Next',
    startAnswer: 'Start Answering',
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    backToHome: 'Back to Home',
    records: 'Training Records',
    trainingTime: 'Training Time',
    trainingProject: 'Training Project',
    difficultyLevel: 'Difficulty Level',
    duration: 'Duration',
    totalQuestions: 'Total',
    successCount: 'Success',
    failCount: 'Failed',
    successRate: 'Success Rate',
    avgResponseTime: 'Avg Response Time',
    scoreLabel: 'Score',
    close: 'Close',
    rulesTitle: 'Game Rules',
    rulesContent: {
      intro: 'Introduction: Supermarket Shopping is a fast-response game combining basic arithmetic with item matching, focusing on calculation automation and visual matching.',
      objective: 'Objective: Select specified items according to requirements and calculate the total price.',
      howToPlay: 'How to Play: Enter the supermarket shopping scene, shelves with item names and prices will appear. Select required items to the cart and calculate the total price.',
      difficultyTitle: 'Difficulty Levels:',
      difficultyDesc: '6 difficulty levels, 1-4 items, 4-5 seconds question time, 25 seconds answer time',
      smartAdjust: 'Smart Adjust: Success rate ≥90% in 30s upgrades 1 level, ≤70% downgrades 1 level',
      scoringRule: 'Scoring: Level 1 gets 5 points per correct answer, later levels = 5 × difficulty coefficient'
    },
    items: {
      beverage: 'Beverage',
      broccoli: 'Broccoli',
      chocolate: 'Chocolate',
      cola: 'Cola',
      cookie: 'Cookie',
      edibleOil: 'Edible Oil',
      egg: 'Egg',
      milk: 'Milk',
      plate: 'Plate',
      rice: 'Rice'
    },
    tutorial: {
      skip: 'Skip Tutorial',
      prev: 'Previous',
      next: 'Next',
      start: 'Start Game',
      cart: 'Cart',
      step1: {
        title: 'Step 1: View Question',
        desc: 'The system will display the items you need to buy. Remember them!',
        hint: 'Remember the item names and get ready to shop'
      },
      step2: {
        title: 'Step 2: Select Items',
        desc: 'Find and select the required items from the shelf. Remember the prices!',
        hint: 'Click item cards to select, click again to deselect'
      },
      step3: {
        title: 'Step 3: Calculate Total',
        desc: 'Remember item prices, calculate the total, then choose the correct answer from 4 options',
        hint: 'Select the correct total price to score points'
      },
      step4: {
        title: 'Ready to Play?',
        desc: 'Complete these steps to score points! Let\'s start the game!',
        feature1: '6 difficulty levels with smart adjustment',
        feature2: 'Detailed training data statistics',
        feature3: 'Track response time and success rate'
      }
    }
  }
}

const i18n = reactive({
  locale: 'zh',
  messages
})

export function useI18n() {
  const t = (key) => {
    const keys = key.split('.')
    let value = i18n.messages[i18n.locale]
    for (const k of keys) {
      value = value[k]
      if (!value) return key
    }
    return value
  }

  const setLocale = (locale) => {
    if (i18n.messages[locale]) {
      i18n.locale = locale
    }
  }

  return {
    locale: i18n.locale,
    t,
    setLocale
  }
}

export default i18n
