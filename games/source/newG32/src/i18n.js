// Simple reactive i18n for Vue 2
import Vue from 'vue'

export const state = Vue.observable({
  lang: 'zh',
  locked: false, // when game is running, prevent switching
})

const dict = {
  zh: {
    appTitle: '课堂学习',
    subTitle: '专注力与反应力训练',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    langBtn: 'EN',
    back: '返回',
    next: '下一步',
    prev: '上一步',
    skip: '跳过教程',
    startNow: '开始游戏',
    selectDuration: '选择训练时长',
    min1: '1 分钟',
    min3: '3 分钟',
    min5: '5 分钟',
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余',
    ruleTip: '本题规则',
    skipGame: '跳过游戏',
    confirmExit: '确定要退出游戏吗？',
    confirmExitDesc: '当前进度将结算并记录。',
    cancel: '取消游戏',
    confirm: '确定退出',
    correct: '正确！',
    wrong: '错误',
    timeout: '超时',
    resultTitle: '训练完成',
    yourScore: '本次得分',
    totalQ: '总题数',
    successQ: '成功',
    failQ: '失败',
    successRate: '成功率',
    avgTime: '平均反应',
    backHome: '返回首页',
    playAgain: '再来一次',
    seconds: '秒',
    ms: '毫秒',
    tutorialTitle: '游戏教程',
    tutorialStep1: '黑板上会出现数字',
    tutorialStep1Desc: '按顺序在下方键盘上依次点击',
    tutorialStep2: '中等难度：只点圆形中的数字',
    tutorialStep2Desc: '其它形状忽略',
    tutorialStep3: '高等难度：点击非三角形中的数字',
    tutorialStep3Desc: '三角形要跳过',
    tutorialStep4: '注意黑板前的飞鸟干扰',
    tutorialStep4Desc: '保持专注，快速反应',
    rulesTitle: '规则介绍',
    rulesBody: [
      '难度 1-2：依次点击屏幕上方出现的数字。',
      '难度 3-4：只点击「圆形」框住的数字，其它忽略。',
      '难度 5-6：点击「非三角形」框住的数字，其它忽略。。',
      '每 60 秒统计正确率：≥90% 升级，≤70% 降级，其余保持。',
      '难度 1 每题 5 分，后续 = 5 × 难度系数。',
      '偶数难度会有飞鸟干扰，请保持专注。',
    ],
    historyTitle: '历史记录',
    noHistory: '暂无训练记录',
    clearHistory: '清空记录',
    confirmClear: '确定清空全部记录？',
    time: '训练时间',
    project: '项目',
    level: '难度',
    duration: '时长',
    total: '总次数',
    success: '成功',
    fail: '失败',
    rate: '成功率',
    avg: '平均反应',
    scoreCol: '得分',
    projectName: '课堂学习',
    paused: '已暂停',
    countdownGo: '开始',
  },
  en: {
    appTitle: 'Classroom Learning',
    subTitle: 'Focus & Reaction Training',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    langBtn: '中',
    back: 'Back',
    next: 'Next',
    prev: 'Prev',
    skip: 'Skip Tutorial',
    startNow: 'Start',
    selectDuration: 'Select Duration',
    min1: '1 min',
    min3: '3 min',
    min5: '5 min',
    difficulty: 'Level',
    score: 'Score',
    timeLeft: 'Time',
    ruleTip: 'Current Rule',
    skipGame: 'Skip',
    confirmExit: 'Exit the game?',
    confirmExitDesc: 'Current progress will be recorded.',
    cancel: 'Resume',
    confirm: 'Exit',
    correct: 'Correct!',
    wrong: 'Wrong',
    timeout: 'Timeout',
    resultTitle: 'Training Complete',
    yourScore: 'Score',
    totalQ: 'Total',
    successQ: 'Success',
    failQ: 'Fail',
    successRate: 'Success Rate',
    avgTime: 'Avg Reaction',
    backHome: 'Home',
    playAgain: 'Play Again',
    seconds: 's',
    ms: 'ms',
    tutorialTitle: 'Tutorial',
    tutorialStep1: 'Numbers appear on the board',
    tutorialStep1Desc: 'Tap them in order on the keyboard below',
    tutorialStep2: 'Medium: only tap numbers inside a CIRCLE',
    tutorialStep2Desc: 'Ignore the other shapes',
    tutorialStep3: 'Hard: tap numbers NOT inside a triangle',
    tutorialStep3Desc: 'Skip the triangles',
    tutorialStep4: 'Watch out for the bird flying past',
    tutorialStep4Desc: 'Stay focused, react fast',
    rulesTitle: 'Rules',
    rulesBody: [
      'Level 1-2: Tap numbers on the board in order.',
      'Level 3-4: Only tap numbers inside a CIRCLE.',
      'Level 5-6: Tap numbers NOT inside a TRIANGLE.',
      'Every 60s: accuracy ≥90% level up, ≤70% level down.',
      'Level 1 = 5 pts/question. Higher = 5 × coefficient.',
      'Even levels have bird interference. Stay focused.',
    ],
    historyTitle: 'History',
    noHistory: 'No records yet',
    clearHistory: 'Clear',
    confirmClear: 'Clear all records?',
    time: 'Date',
    project: 'Project',
    level: 'Level',
    duration: 'Duration',
    total: 'Total',
    success: 'Success',
    fail: 'Fail',
    rate: 'Rate',
    avg: 'Avg RT',
    scoreCol: 'Score',
    projectName: 'Classroom Learning',
    paused: 'Paused',
    countdownGo: 'Go',
  },
}

/**
 * <summary>
 * 按当前语言查词典
 * </summary>
 */
function translate(key) {
  const l = dict[state.lang] || dict.zh // 当前语言表
  return l[key] !== undefined ? l[key] : key
}

export function t(key) {
  return translate(key)
}

export function setLang(l) {
  if (state.locked) return
  state.lang = l
}

export function toggleLang() {
  if (state.locked) return
  state.lang = state.lang === 'zh' ? 'en' : 'zh'
}

export function lockLang(v) { state.locked = v }

// Mixin to make t reactive（勿用 $t，避免与主应用 vue-i18n 冲突）
export const i18nMixin = {
  computed: {
    lang() { return state.lang }, // 当前语言
    langLocked() { return state.locked }, // 语言是否锁定
  },
  methods: {
    /**
     * <summary>
     * 按当前语言取文案
     * </summary>
     */
    t(key) { void this.lang; return translate(key) },
  },
}
