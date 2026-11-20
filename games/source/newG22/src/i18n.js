import { bindTrainingLanguage } from '@/language.js'
import Vue from 'vue'

export const i18n = Vue.observable({
  lang: 'zh'
})

export const messages = {
  zh: {
    appTitle: '极速赛车',
    subtitle: '认知训练 · 视觉注意 · 快速反应',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    back: '返回',
    close: '关闭',
    next: '下一步',
    prev: '上一步',
    skip: '跳过教程',
    startNow: '开始训练',
    continue: '继续游戏',
    exit: '退出游戏',
    pauseTitle: '游戏暂停',
    pauseTip: '是否退出本次训练？',
    cancel: '取消',
    confirm: '确认退出',
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余时间',
    duration: '训练时长',
    min1: '1 分钟',
    min3: '3 分钟',
    min5: '5 分钟',
    chooseDuration: '选择训练时长',
    ready: '准备',
    go: '出发',
    rulesTitle: '游戏规则',
    ruleText: '请驾驶车辆并注意躲避障碍物。屏幕上有 3 条赛道，默认在中间赛道行驶。使用左右方向键或点击屏幕按钮切换赛道，及时避开前方障碍物。',
    ruleGoal: '训练目标',
    ruleGoalText: '训练用户的视觉注意、快速反应和双手协调能力。',
    ruleDifficulty: '难度分级',
    ruleDifficultyText: '游戏共 6 个难度等级，系统会根据您的表现每 60 秒自动调整难度：正确率 90% 以上升级，70% 以下降级。',
    ruleScore: '评分规则',
    ruleScoreText: '难度 1 每答对一题得 5 分，后续难度提升，每答对 1 题的分数 = 5 × 难度系数。',
    tutorialTitle: '游戏教程',
    tutorial1Title: '认识赛道',
    tutorial1Desc: '前方有 3 条赛道，你的赛车默认在中间赛道行驶。',
    tutorial2Title: '躲避障碍物',
    tutorial2Desc: '当障碍物出现在你所在的赛道时，需要及时切换到其他赛道。',
    tutorial3Title: '切换赛道',
    tutorial3Desc: '使用键盘 ← ↑ → 键，或点击屏幕下方按钮切换赛道。',
    tutorial4Title: '开始挑战',
    tutorial4Desc: '成功躲避可以获得积分，正确率越高难度会自动提升哦！',
    historyTitle: '训练记录',
    historyEmpty: '还没有训练记录，快去开始你的第一次训练吧！',
    colTime: '训练时间',
    colProject: '训练项目',
    colDifficulty: '难度等级',
    colDuration: '时长',
    colTotal: '总次数',
    colSuccess: '成功次数',
    colFail: '失败次数',
    colRate: '成功率',
    colReact: '平均反应时长',
    colScore: '得分',
    projectName: '极速赛车',
    gameOverTitle: '训练完成',
    finalScore: '最终得分',
    finalRate: '成功率',
    finalDifficulty: '最终难度',
    totalObs: '遇到障碍',
    successCount: '成功躲避',
    failCount: '碰撞次数',
    avgReact: '平均反应',
    playAgain: '再玩一次',
    backHome: '返回主页',
    unit: {
      sec: '秒',
      ms: '毫秒',
      min: '分钟'
    },
    countdown: {
      three: '3',
      two: '2',
      one: '1',
      go: 'GO!'
    },
    difficultyUp: '难度提升!',
    difficultyDown: '难度降低',
    perfect: '完美!',
    crashed: '碰撞!'
  },
  en: {
    appTitle: 'Speed Racer',
    subtitle: 'Cognitive Training · Visual Attention · Quick Response',
    startGame: 'Start Game',
    rules: 'How to Play',
    history: 'History',
    back: 'Back',
    close: 'Close',
    next: 'Next',
    prev: 'Prev',
    skip: 'Skip Tutorial',
    startNow: 'Start Training',
    continue: 'Continue',
    exit: 'Quit',
    pauseTitle: 'Game Paused',
    pauseTip: 'Do you want to quit this training?',
    cancel: 'Cancel',
    confirm: 'Quit',
    difficulty: 'Level',
    score: 'Score',
    timeLeft: 'Time',
    duration: 'Duration',
    min1: '1 Minute',
    min3: '3 Minutes',
    min5: '5 Minutes',
    chooseDuration: 'Choose Training Duration',
    ready: 'Ready',
    go: 'Go',
    rulesTitle: 'Game Rules',
    ruleText: 'Drive your car and avoid the obstacles. There are 3 lanes on the road, you start in the middle lane. Use arrow keys or tap the on-screen buttons to switch lanes and dodge obstacles ahead.',
    ruleGoal: 'Training Goal',
    ruleGoalText: 'Improves visual attention, quick response, and bimanual coordination.',
    ruleDifficulty: 'Difficulty',
    ruleDifficultyText: '6 difficulty levels. The system auto-adjusts every 60 seconds based on your performance: 90%+ accuracy levels up, below 70% levels down.',
    ruleScore: 'Scoring',
    ruleScoreText: 'Level 1: 5 points per successful dodge. Higher levels multiply by the difficulty coefficient.',
    tutorialTitle: 'Tutorial',
    tutorial1Title: 'The Track',
    tutorial1Desc: 'There are 3 lanes ahead. Your car starts in the middle lane.',
    tutorial2Title: 'Dodge Obstacles',
    tutorial2Desc: 'When an obstacle appears in your lane, switch to another lane in time.',
    tutorial3Title: 'Change Lanes',
    tutorial3Desc: 'Use ← ↑ → keys or tap the buttons at the bottom of the screen.',
    tutorial4Title: 'Ready to Play',
    tutorial4Desc: 'Dodge successfully to earn points. Higher accuracy will level you up!',
    historyTitle: 'Training Records',
    historyEmpty: 'No training records yet. Start your first training now!',
    colTime: 'Time',
    colProject: 'Project',
    colDifficulty: 'Level',
    colDuration: 'Duration',
    colTotal: 'Total',
    colSuccess: 'Success',
    colFail: 'Fail',
    colRate: 'Accuracy',
    colReact: 'Avg. React',
    colScore: 'Score',
    projectName: 'Speed Racer',
    gameOverTitle: 'Training Complete',
    finalScore: 'Final Score',
    finalRate: 'Accuracy',
    finalDifficulty: 'Final Level',
    totalObs: 'Obstacles',
    successCount: 'Dodged',
    failCount: 'Crashed',
    avgReact: 'Avg. React',
    playAgain: 'Play Again',
    backHome: 'Home',
    unit: {
      sec: 's',
      ms: 'ms',
      min: 'min'
    },
    countdown: {
      three: '3',
      two: '2',
      one: '1',
      go: 'GO!'
    },
    difficultyUp: 'LEVEL UP!',
    difficultyDown: 'Level Down',
    perfect: 'PERFECT!',
    crashed: 'CRASH!'
  }
}

export function t(key) {
  const parts = key.split('.')
  let obj = messages[i18n.lang]
  for (const p of parts) {
    if (obj == null) return key
    obj = obj[p]
  }
  return obj == null ? key : obj
}

export function setLang(lang) {
  i18n.lang = lang
}

bindTrainingLanguage(() => i18n.lang, setLang)
