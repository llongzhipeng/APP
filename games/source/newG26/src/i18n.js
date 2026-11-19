import Vue from 'vue'

const dict = {
  zh: {
    appTitle: '节奏敲击',
    subtitle: '认知训练 · 节奏协调',
    start: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    skip: '跳过游戏',
    skipGame: '跳过游戏',
    lang: 'EN',
    back: '返回',
    next: '下一步',
    prev: '上一步',
    skipTutorial: '跳过教程',
    close: '关闭',
    confirm: '确认',
    cancel: '取消',

    rulesTitle: '规则介绍',
    rulesIntro: '本游戏针对轻度认知障碍人群设计，用户需要跟随左右两侧节拍器节奏，左右手交替敲击，训练视觉注意、快速反应与双手协调能力。',
    rulesHow: '玩法说明',
    rulesHowText: 'PC 端：左侧节拍器响起时按 A 键，右侧节拍器响起时按 L 键。平板端：直接触摸左右两侧屏幕区域。',
    rulesLevels: '难度分级',
    levelCol: '难度',
    tempoCol: '节奏速度',
    toleranceCol: '容错时间',
    coefCol: '难度系数',
    tempoSlow: '慢',
    tempoSlower: '较慢',
    tempoMid: '中等',
    tempoFast: '快',
    tempoFaster: '较快',
    rulesAdaptive: '智能难度调整',
    rulesAdaptiveText: '每 60 秒统计一次正确率：正确率 ≥ 90% 难度升级，≤ 70% 难度降低，其余不变。',
    rulesScore: '评分规则',
    rulesScoreText: '难度 1 每答对一题得 5 分。后续难度每答对一题得分 = 5 × 难度系数。最终得分为所有答对题目的总分。',

    historyTitle: '训练记录',
    noHistory: '暂无训练记录',
    colDate: '训练时间',
    colName: '训练项目',
    colLevel: '难度等级',
    colDuration: '时长',
    colTotal: '总次数',
    colSuccess: '成功次数',
    colFail: '失败次数',
    colRate: '成功率',
    colAvgRt: '平均反应时长',
    colScore: '得分',
    clearHistory: '清空记录',
    clearConfirm: '确定清空所有历史记录吗？',

    tutorialTitle: '游戏教程',
    tutorialStep1: '注视左侧节拍器',
    tutorialStep1Desc: '当左侧摆锤敲击并发出声音时',
    tutorialStep2: '按下 A 键（左手）',
    tutorialStep2Desc: '及时准确地按键回应',
    tutorialStep3: '注视右侧节拍器',
    tutorialStep3Desc: '当右侧摆锤敲击并发出声音时',
    tutorialStep4: '按下 L 键（右手）',
    tutorialStep4Desc: '左右手交替，跟随节拍',
    tutorialTap: '平板端请直接触摸左右两侧',

    durationTitle: '选择训练时长',
    durationDesc: '请选择本次训练的目标时长',
    min1: '1 分钟',
    min3: '3 分钟',
    min5: '5 分钟',
    min6: '6 分钟',
    startTrain: '开始训练',

    gameLevel: '难度',
    gameScore: '得分',
    gameTime: '剩余时间',
    gameTask: '请跟随节拍器节奏，随节奏敲击对应一侧',
    tapLeft: '按 A / 触摸左侧',
    tapRight: '按 L / 触摸右侧',
    hitPerfect: '完美',
    hitGood: '成功',
    hitMiss: '失误',
    wrongHand: '错误手',
    paused: '游戏已暂停',
    resume: '继续游戏',
    endGame: '结束游戏',
    pauseTip: '点击继续以恢复计时',
    lvUpTitle: '难度升级',
    lvDownTitle: '难度降低',

    resultTitle: '训练完成',
    resultScore: '本次得分',
    resultAccuracy: '成功率',
    resultTotal: '总次数',
    resultSuccess: '成功',
    resultFail: '失误',
    resultAvgRt: '平均反应时长',
    resultMaxLevel: '最高难度',
    playAgain: '再玩一次',
    backHome: '返回首页',

    unit_s: '秒',
    unit_ms: '毫秒',
    unit_min: '分钟'
  },
  en: {
    appTitle: 'Rhythm Tap',
    subtitle: 'Cognitive Training · Rhythmic Coordination',
    start: 'Start Game',
    rules: 'Rules',
    history: 'History',
    skip: 'Skip Game',
    skipGame: 'Skip Game',
    lang: '中',
    back: 'Back',
    next: 'Next',
    prev: 'Previous',
    skipTutorial: 'Skip Tutorial',
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',

    rulesTitle: 'Rules',
    rulesIntro: 'Designed for people with mild cognitive impairment. Follow the left and right metronomes, alternating hands to tap in rhythm. Trains visual attention, reaction speed and bimanual coordination.',
    rulesHow: 'How to Play',
    rulesHowText: 'PC: press A when the left metronome ticks; press L when the right one ticks. Tablet: tap the left or right side of the screen.',
    rulesLevels: 'Difficulty Levels',
    levelCol: 'Level',
    tempoCol: 'Tempo',
    toleranceCol: 'Tolerance',
    coefCol: 'Coefficient',
    tempoSlow: 'Slow',
    tempoSlower: 'Slower',
    tempoMid: 'Medium',
    tempoFast: 'Fast',
    tempoFaster: 'Faster',
    rulesAdaptive: 'Adaptive Difficulty',
    rulesAdaptiveText: 'Every 60 s the accuracy of the window is measured: ≥ 90% level up, ≤ 70% level down, otherwise unchanged.',
    rulesScore: 'Scoring',
    rulesScoreText: 'Level 1 scores 5 points per hit. Higher levels: score = 5 × coefficient per hit. Final score is the sum of all hits.',

    historyTitle: 'Training History',
    noHistory: 'No training records yet',
    colDate: 'Date',
    colName: 'Program',
    colLevel: 'Level',
    colDuration: 'Duration',
    colTotal: 'Total',
    colSuccess: 'Hits',
    colFail: 'Misses',
    colRate: 'Accuracy',
    colAvgRt: 'Avg. RT',
    colScore: 'Score',
    clearHistory: 'Clear History',
    clearConfirm: 'Clear all training records?',

    tutorialTitle: 'Tutorial',
    tutorialStep1: 'Watch the Left Metronome',
    tutorialStep1Desc: 'When the left pendulum ticks and beats',
    tutorialStep2: 'Press A (Left Hand)',
    tutorialStep2Desc: 'Respond in time and accurately',
    tutorialStep3: 'Watch the Right Metronome',
    tutorialStep3Desc: 'When the right pendulum ticks and beats',
    tutorialStep4: 'Press L (Right Hand)',
    tutorialStep4Desc: 'Alternate hands with the rhythm',
    tutorialTap: 'On tablet, tap the left/right side of screen',

    durationTitle: 'Select Duration',
    durationDesc: 'Choose the target duration for this session',
    min1: '1 minute',
    min3: '3 minutes',
    min5: '5 minutes',
    min6: '6 minutes',
    startTrain: 'Start Training',

    gameLevel: 'Level',
    gameScore: 'Score',
    gameTime: 'Time Left',
    gameTask: 'Follow the beat and tap the side that ticks',
    tapLeft: 'A / Tap Left',
    tapRight: 'L / Tap Right',
    hitPerfect: 'Perfect',
    hitGood: 'Good',
    hitMiss: 'Miss',
    wrongHand: 'Wrong hand',
    paused: 'Game Paused',
    resume: 'Resume',
    endGame: 'End Game',
    pauseTip: 'Tap resume to continue the timer',
    lvUpTitle: 'Level Up',
    lvDownTitle: 'Level Down',

    resultTitle: 'Training Complete',
    resultScore: 'Score',
    resultAccuracy: 'Accuracy',
    resultTotal: 'Total Beats',
    resultSuccess: 'Hits',
    resultFail: 'Misses',
    resultAvgRt: 'Avg. Reaction',
    resultMaxLevel: 'Max Level',
    playAgain: 'Play Again',
    backHome: 'Home',

    unit_s: 's',
    unit_ms: 'ms',
    unit_min: 'min'
  }
}

export const i18nStore = Vue.observable({
  lang: (localStorage.getItem('rt.lang') || 'zh')
})

export function setLang(l) {
  i18nStore.lang = l
  try { localStorage.setItem('rt.lang', l) } catch (e) {}
}

export function toggleLang() {
  setLang(i18nStore.lang === 'zh' ? 'en' : 'zh')
}

/**
 * <summary>
 * 按当前语言查词典
 * </summary>
 */
function translate(key) {
  const table = dict[i18nStore.lang] || dict.zh // 当前语言表
  return table[key] != null ? table[key] : key
}

export function t(key) {
  return translate(key)
}

/**
 * <summary>
 * 局部 i18n mixin（勿用 $t，避免与主应用 vue-i18n 冲突）
 * </summary>
 */
export const i18nMixin = {
  computed: {
    lang() { return i18nStore.lang }, // 当前语言
  },
  methods: {
    /**
     * <summary>
     * 按当前语言取文案
     * </summary>
     */
    t(k) { return translate(k) },
  },
}

/** 仅独立入口 main.js 使用；嵌入路由时请用 i18nMixin，勿 Vue.use */
export default {
  install(V) {
    V.mixin(i18nMixin)
  },
}
