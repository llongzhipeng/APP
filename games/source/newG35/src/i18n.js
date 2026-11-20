import { bindTrainingLanguage } from '@/language.js'
// Bilingual dictionary. Simple reactive-friendly getter via Vue.observable.
import Vue from 'vue'

const messages = {
  zh: {
    appTitle: '词义分类',
    appSubtitle: '言语能力训练',
    start: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    back: '返回',
    next: '下一步',
    prev: '上一步',
    skip: '跳过教程',
    close: '关闭',
    ok: '知道了',
    confirm: '确认',
    cancel: '取消',
    lang: 'EN',
    langTip: '切换语言',

    rulesTitle: '游戏规则',
    ruleLine1: '本游戏专为轻度认知障碍人群设计，用于训练言语能力。',
    ruleLine2: '屏幕会展示一个目标词语，你需要在选项中选出它的 近义词 或 反义词。',
    ruleLine3: '每题最长答题时间 15 秒，超时视为未答对。',
    ruleLine4: '系统每 60 秒统计一次正确率：≥ 90% 难度升级，≤ 70% 难度降低。',
    ruleLine5: '难度 1 每题 5 分，之后每答对 1 题得分 = 5 × 难度系数。',
    difficultyTable: '难度分级',
    colLevel: '难度',
    colType: '分类',
    colComplexity: '词语复杂度',
    colOptions: '选项数',
    colCoef: '难度系数',
    typeSyn: '近义词',
    typeAnt: '反义词',
    cxCommon: '常用',
    cxMid: '中等',
    cxHard: '复杂',

    tutorialTitle: '游戏教程',
    tutorialStep1: '这是目标词语',
    tutorialStep2: '题目会告诉你选 近义词 还是 反义词',
    tutorialStep3: '点击你认为正确的选项',
    tutorialStep4: '答对得分，答错或超时进入下一题',
    tutorialGotIt: '开始训练',

    durationTitle: '选择训练时长',
    durationTip: '建议先从短时长开始，逐步适应',
    minute: '分钟',
    minutes: '分钟',

    findSyn: '请选择「{word}」的近义词',
    findAnt: '请选择「{word}」的反义词',
    level: '难度',
    score: '得分',
    timeLeft: '剩余',
    skipGame: '跳过游戏',
    pauseTitle: '游戏已暂停',
    pauseTip: '继续游戏，还是返回主页？',
    resume: '继续游戏',
    quit: '返回主页',
    correct: '答对啦！',
    wrong: '再想一想',
    timeUp: '时间到',

    resultTitle: '训练完成',
    resultTotal: '总题数',
    resultCorrect: '正确',
    resultWrong: '错误',
    resultAccuracy: '正确率',
    resultAvg: '平均反应',
    resultScore: '本次得分',
    playAgain: '再来一局',
    backHome: '返回主页',

    historyTitle: '历史记录',
    historyEmpty: '暂无训练记录',
    historyClear: '清空记录',
    confirmClear: '确定清空全部历史记录吗？',
    colTime: '训练时间',
    colProject: '训练项目',
    colFinalLv: '难度等级',
    colDuration: '时长',
    colTotal: '总次数',
    colOk: '成功',
    colFail: '失败',
    colRate: '成功率',
    colAvg: '平均反应',
    colScore: '得分',
    projectName: '词义分类',

    demoWord: '高兴',
    demoAsk: '请选择「高兴」的近义词',
    demoOpt1: '快乐',
    demoOpt2: '悲伤',
  },
  en: {
    appTitle: 'Word Classification',
    appSubtitle: 'Verbal Ability Training',
    start: 'Start',
    rules: 'How to Play',
    history: 'History',
    back: 'Back',
    next: 'Next',
    prev: 'Previous',
    skip: 'Skip',
    close: 'Close',
    ok: 'Got it',
    confirm: 'Confirm',
    cancel: 'Cancel',
    lang: '中',
    langTip: 'Switch Language',

    rulesTitle: 'Game Rules',
    ruleLine1: 'Designed for people with mild cognitive impairment to train verbal ability.',
    ruleLine2: 'A target word is shown. Pick its synonym or antonym from the options.',
    ruleLine3: 'Each question has a 15-second time limit; timeout counts as incorrect.',
    ruleLine4: 'Every 60s: accuracy ≥ 90% raises difficulty, ≤ 70% lowers it.',
    ruleLine5: 'Score per correct answer = 5 × difficulty coefficient.',
    difficultyTable: 'Difficulty Levels',
    colLevel: 'Level',
    colType: 'Type',
    colComplexity: 'Complexity',
    colOptions: 'Options',
    colCoef: 'Coef.',
    typeSyn: 'Synonym',
    typeAnt: 'Antonym',
    cxCommon: 'Common',
    cxMid: 'Medium',
    cxHard: 'Complex',

    tutorialTitle: 'Tutorial',
    tutorialStep1: 'This is the target word',
    tutorialStep2: 'Choose a synonym or an antonym as instructed',
    tutorialStep3: 'Tap the option you believe is correct',
    tutorialStep4: 'Correct scores points; wrong or timeout moves on',
    tutorialGotIt: 'Start Training',

    durationTitle: 'Select Duration',
    durationTip: 'Try a shorter session first',
    minute: 'minute',
    minutes: 'minutes',

    findSyn: 'Pick the synonym of "{word}"',
    findAnt: 'Pick the antonym of "{word}"',
    level: 'Level',
    score: 'Score',
    timeLeft: 'Time',
    skipGame: 'End Game',
    pauseTitle: 'Game Paused',
    pauseTip: 'Resume the game or return home?',
    resume: 'Resume',
    quit: 'Home',
    correct: 'Correct!',
    wrong: 'Try again',
    timeUp: 'Time up',

    resultTitle: 'Session Complete',
    resultTotal: 'Total',
    resultCorrect: 'Correct',
    resultWrong: 'Wrong',
    resultAccuracy: 'Accuracy',
    resultAvg: 'Avg. Reaction',
    resultScore: 'Score',
    playAgain: 'Play Again',
    backHome: 'Home',

    historyTitle: 'History',
    historyEmpty: 'No records yet',
    historyClear: 'Clear',
    confirmClear: 'Clear all history records?',
    colTime: 'Time',
    colProject: 'Project',
    colFinalLv: 'Level',
    colDuration: 'Duration',
    colTotal: 'Total',
    colOk: 'Correct',
    colFail: 'Wrong',
    colRate: 'Accuracy',
    colAvg: 'Avg. RT',
    colScore: 'Score',
    projectName: 'Word Classification',

    demoWord: 'Happy',
    demoAsk: 'Pick the synonym of "Happy"',
    demoOpt1: 'Joyful',
    demoOpt2: 'Sad',
  },
}

export const i18n = Vue.observable({
  locale: (localStorage.getItem('wc_locale') || 'zh'),
})

/**
 * <summary>
 * 按当前语言查词典（支持 {param} 占位）
 * </summary>
 */
function translate(key, params) {
  const dict = messages[i18n.locale] || messages.zh // 当前语言表
  let s = dict[key] != null ? dict[key] : key // 文案
  if (params) {
    for (const k in params) s = s.replace(`{${k}}`, params[k])
  }
  return s
}

export function t(key, params) {
  return translate(key, params)
}

export function setLocale(l) {
  i18n.locale = l
  localStorage.setItem('wc_locale', l)
  document.documentElement.lang = l === 'zh' ? 'zh' : 'en'
}

/**
 * <summary>
 * 局部 i18n mixin（勿用 $t / 全局 Vue.mixin，避免与主应用 vue-i18n 冲突）
 * </summary>
 */
export const i18nMixin = {
  computed: {
    locale() { return i18n.locale }, // 当前语言
  },
  methods: {
    /**
     * <summary>
     * 按当前语言取文案
     * </summary>
     */
    t(key, params) { return translate(key, params) },
  },
}

bindTrainingLanguage(() => i18n.locale, setLocale)
