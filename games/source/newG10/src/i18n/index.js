import { bindTrainingLanguage } from '@/language.js'
import { reactive } from '@vue/composition-api'

const messages = {
  zh: {
    title: '购物清单',
    startGame: '开始游戏',
    viewRecords: '查看记录',
    gameRules: '游戏规则',
    selectDuration: '选择训练时长',
    minutes: '分钟',
    difficulty: '难度',
    score: '分数',
    timeLeft: '剩余时间',
    question: '购物清单',
    memorizePrompt: '请记住所需购买的物品',
    selectPrompt: '请选择对应物品放入购物车',
    memoryTimeLeft: '记忆倒计时',
    answerTimeLeft: '答题倒计时',
    cart: '购物车',
    confirmCart: '确认购物',
    correct: '回答正确',
    incorrect: '回答错误',
    prevQuestion: '上一题',
    nextQuestion: '下一题',
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
    pauseTitle: '游戏已暂停',
    pauseHint: '是否要返回主页？训练进度将不会保存。',
    continue: '继续游戏',
    confirmBack: '确认返回',
    back: '返回',
    skipGame: '跳过',
    rulesTitle: '游戏规则',
    rulesContent: {
      intro: '游戏介绍：购物清单是针对轻度认知障碍人群设计的超市购物场景，界面显示购物清单（图片+语音提示），需要在超市中按清单找到对应物品放入购物车。',
      objective: '游戏目标：训练用户的工作记忆及短时记忆能力。',
      howToPlay: '玩法描述：先记住购物清单中的物品，随后从货架上把对应物品拖入购物车中，全部选完后系统自动判定。',
      difficultyTitle: '难度分级：',
      difficultyDesc: '共6个难度等级，清单物品1-4件，记忆时间4-8秒，答题时间15秒',
      smartAdjust: '智能调整：60秒内正确率90%以上升1级，70%以下降1级',
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
        title: '第一步：记住购物清单',
        desc: '系统会显示购物清单里的物品，请仔细记住！',
        hint: '记住所有物品，准备开始购物'
      },
      step2: {
        title: '第二步：拖入购物车',
        desc: '从货架上把清单中对应的物品拖入购物车',
        hint: '点击物品也可放入购物车，再次点击可取消'
      },
      step3: {
        title: '第三步：确认购物',
        desc: '选完全部物品后点击"确认购物"或等待时间结束',
        hint: '选对全部所需物品即可得分'
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
    title: 'Shopping List',
    startGame: 'Start Game',
    viewRecords: 'View Records',
    gameRules: 'Game Rules',
    selectDuration: 'Select Training Duration',
    minutes: 'min',
    difficulty: 'Difficulty',
    score: 'Score',
    timeLeft: 'Time Left',
    question: 'Shopping List',
    memorizePrompt: 'Please remember the items to buy',
    selectPrompt: 'Please put the corresponding items into the cart',
    memoryTimeLeft: 'Memory Time',
    answerTimeLeft: 'Answer Time',
    cart: 'Cart',
    confirmCart: 'Confirm',
    correct: 'Correct',
    incorrect: 'Incorrect',
    prevQuestion: 'Previous',
    nextQuestion: 'Next',
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
    pauseTitle: 'Game Paused',
    pauseHint: 'Return to home page? Your training progress will not be saved.',
    continue: 'Continue',
    confirmBack: 'Confirm',
    back: 'Back',
    skipGame: 'Skip',
    rulesTitle: 'Game Rules',
    rulesContent: {
      intro: 'Introduction: Shopping List is a supermarket game designed for mild cognitive impairment. A shopping list is shown with visual and audio cues; find and place the listed items into the cart.',
      objective: 'Objective: Train working memory and short-term memory.',
      howToPlay: 'How to Play: Memorize the shopping list first, then drag the corresponding items from the shelf into the cart.',
      difficultyTitle: 'Difficulty Levels:',
      difficultyDesc: '6 levels, 1-4 items per list, 4-8s memory time, 15s to answer',
      smartAdjust: 'Smart Adjust: Success rate >=90% within 60s upgrades 1 level, <=70% downgrades 1 level',
      scoringRule: 'Scoring: Level 1 gets 5 points per correct answer, later levels = 5 x difficulty coefficient'
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
        title: 'Step 1: Memorize the list',
        desc: 'The system shows the shopping list. Remember all the items!',
        hint: 'Remember every item, get ready to shop'
      },
      step2: {
        title: 'Step 2: Drag into cart',
        desc: 'Drag the required items from the shelf into the cart',
        hint: 'Clicking an item also adds it; click again to remove'
      },
      step3: {
        title: 'Step 3: Confirm',
        desc: 'When done, click "Confirm" or wait for time to run out',
        hint: 'Pick all required items exactly to score'
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

bindTrainingLanguage(() => i18n.locale, value => { i18n.locale = value })
