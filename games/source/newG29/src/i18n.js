import { bindTrainingLanguage } from '@/language.js'
import Vue from 'vue'

export const store = Vue.observable({
  lang: 'zh',
  history: JSON.parse(localStorage.getItem('sg_history') || '[]'),
})

export const dict = {
  zh: {
    title: '星海守护者',
    subtitle: 'STELLAR GUARDIAN',
    start: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    skip: '跳过游戏',
    skipGame: '跳过游戏',
    langBtn: 'EN',
    rulesTitle: '游戏规则',
    rulesBody: [
      '· 你正驾驶太空战机穿越陨石带。',
      '· 前方会飞来红色和灰色两种陨石。',
      '· 只射击红色陨石，避免射击灰色陨石。',
      '· 每题最长答题时间 15 秒。',
      '· 系统会根据你的正确率自动调整难度。',
      '· 难度越高，得分越高。祝你好运，守护者！',
    ],
    historyTitle: '训练记录',
    columns: ['训练时间','训练项目','难度','时长','总次数','成功','失败','成功率','平均反应','得分'],
    noHistory: '暂无训练记录',
    tutorialTitle: '游戏教程',
    tutorialSteps: [
      '陨石会从远方飞向你，有红色和灰色两种。',
      '用鼠标点击红色陨石即可摧毁它。',
      '灰色陨石是友好的，请勿点击它！',
      '摧毁所有红色陨石即可完成本题。',
    ],
    prev: '上一步',
    next: '下一步',
    skipTut: '跳过教程',
    startTraining: '开始训练',
    chooseDuration: '选择训练时长',
    min1: '1 分钟',
    min3: '3 分钟',
    min5: '5 分钟',
    back: '返回',
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余',
    ruleHint: '仅射击 红色 陨石！',
    pauseTitle: '游戏已暂停',
    resume: '继续游戏',
    quit: '结束游戏',
    resultTitle: '训练完成',
    total: '总题数',
    correct: '正确',
    wrong: '错误',
    accuracy: '正确率',
    avgTime: '平均反应',
    finalScore: '最终得分',
    playAgain: '再来一次',
    home: '返回首页',
    close: '关闭',
    seconds: '秒',
    minutes: '分钟',
    tapToShoot: '点击画面 / 按空格键 射击',
    controlHint: 'A / D 或 ← → 移动，空格键射击',
    ruleHintShort: '仅摧毁 红色 陨石',
  },
  en: {
    title: 'Stellar Guardian',
    subtitle: 'COSMIC DEFENDER',
    start: 'Start Game',
    rules: 'Rules',
    history: 'History',
    skip: 'Skip Game',
    skipGame: 'Skip Game',
    langBtn: '中',
    rulesTitle: 'Game Rules',
    rulesBody: [
      '· You are piloting through an asteroid belt.',
      '· Red and gray asteroids will approach you.',
      '· Only shoot the RED asteroids, spare the gray ones.',
      '· Each question lasts up to 15 seconds.',
      '· Difficulty adapts to your performance every 60s.',
      '· Higher difficulty means higher score. Good luck!',
    ],
    historyTitle: 'Training History',
    columns: ['Date','Project','Level','Duration','Total','Correct','Wrong','Accuracy','Avg Time','Score'],
    noHistory: 'No records yet',
    tutorialTitle: 'How To Play',
    tutorialSteps: [
      'Asteroids fly toward you — some red, some gray.',
      'Click on a red asteroid to destroy it.',
      'Gray asteroids are friendly — do NOT click them!',
      'Destroy all red asteroids to clear the round.',
    ],
    prev: 'Prev',
    next: 'Next',
    skipTut: 'Skip Tutorial',
    startTraining: 'Launch',
    chooseDuration: 'Choose Duration',
    min1: '1 min',
    min3: '3 min',
    min5: '5 min',
    back: 'Back',
    difficulty: 'LVL',
    score: 'SCORE',
    timeLeft: 'TIME',
    ruleHint: 'Shoot only RED asteroids!',
    pauseTitle: 'Paused',
    resume: 'Resume',
    quit: 'Quit',
    resultTitle: 'Training Complete',
    total: 'Total',
    correct: 'Correct',
    wrong: 'Wrong',
    accuracy: 'Accuracy',
    avgTime: 'Avg Reaction',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    home: 'Home',
    close: 'Close',
    seconds: 's',
    minutes: 'min',
    tapToShoot: 'Click / press Space to fire',
    controlHint: 'A / D or ← → to move, SPACE to fire',
    ruleHintShort: 'Destroy only RED asteroids',
  },
}

export function t (key) {
  return dict[store.lang][key]
}

export function saveHistory (rec) {
  const list = JSON.parse(localStorage.getItem('sg_history') || '[]')
  list.unshift(rec)
  const trimmed = list.slice(0, 50)
  localStorage.setItem('sg_history', JSON.stringify(trimmed))
  store.history = trimmed
}

bindTrainingLanguage(() => store.lang, value => { store.lang = value })
