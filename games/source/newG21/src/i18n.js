import Vue from 'vue'

export const LANG_KEY = 'starLine_lang'

export const messages = {
  zh: {
    gameTitle: '星星连线',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    langBtn: 'EN',
    // Rules
    rulesTitle: '规则介绍',
    rulesIntro: '本游戏主要是针对认知障碍人群的短期记忆能力训练。',
    rulesGoal: '游戏目标：进入游戏界面屏幕为星空背景，上方陆续有星星出现。',
    rulesPlay: '玩法描述：用户需要记忆星星出现的顺序，并依次点击点亮星星。',
    rulesOp: '游戏规则：选择常规鼠标操作的方式。',
    rulesDiff: '难度分级：',
    rulesScore: '评分规则：难度1答对一题得5分，后续每答对1题的分数 = 5 × 难度系数。',
    rulesAuto: '智能调整难度：每60秒统计一次正确率，90%以上难度升级，70%以下难度降级。',
    back: '返回',
    // History
    historyTitle: '训练历史',
    noHistory: '暂无训练记录',
    colTime: '训练时间',
    colProject: '训练项目',
    colDifficulty: '难度等级',
    colDuration: '时长',
    colTotal: '总次数',
    colSuccess: '成功次数',
    colFail: '失败次数',
    colRate: '成功率',
    colAvg: '平均反应时长',
    colScore: '得分',
    clearHistory: '清空记录',
    confirmClear: '确定清空所有训练记录吗？',
    seconds: '秒',
    minutes: '分钟',
    // Tutorial
    tutorialTitle: '游戏教程',
    prev: '上一步',
    next: '下一步',
    skip: '跳过教程',
    tutorialStep: '第 {n} / {total} 步',
    // Duration
    selectDuration: '请选择训练时长',
    min1: '1 分钟',
    min3: '3 分钟',
    min5: '5 分钟',
    // Game
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余时间',
    exit: '返回',
    memorize: '记忆星星出现的顺序',
    clickInOrder: '请依次点亮星星',
    correct: '正确！',
    wrong: '错误！',
    timeout: '超时！',
    confirmExit: '确定要退出当前游戏吗？',
    cancel: '取消',
    confirm: '确认',
    // Result
    skipGame: '跳过',
    resultTitle: '训练结束',
    finalScore: '最终得分',
    successRate: '正确率',
    avgTime: '平均反应时长',
    playAgain: '再玩一次',
    backHome: '返回首页'
  },
  en: {
    gameTitle: 'Star Line',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    langBtn: '中',
    // Rules
    rulesTitle: 'Game Rules',
    rulesIntro: 'This game is designed to train short-term memory for people with cognitive impairment.',
    rulesGoal: 'Goal: The screen shows a starry background, with stars gradually appearing above.',
    rulesPlay: 'Play: Memorize the order of stars appearing, then click them in the same order.',
    rulesOp: 'Operation: Use standard mouse click.',
    rulesDiff: 'Difficulty levels:',
    rulesScore: 'Scoring: Level 1 = 5 points per correct answer, higher levels multiply by difficulty coefficient.',
    rulesAuto: 'Auto-adjust: Every 60s the accuracy is checked. >=90% level up, <=70% level down.',
    back: 'Back',
    // History
    historyTitle: 'Training History',
    noHistory: 'No training records yet',
    colTime: 'Time',
    colProject: 'Project',
    colDifficulty: 'Difficulty',
    colDuration: 'Duration',
    colTotal: 'Total',
    colSuccess: 'Success',
    colFail: 'Fail',
    colRate: 'Rate',
    colAvg: 'Avg Time',
    colScore: 'Score',
    clearHistory: 'Clear',
    confirmClear: 'Clear all training records?',
    seconds: 's',
    minutes: 'min',
    // Tutorial
    tutorialTitle: 'Tutorial',
    prev: 'Previous',
    next: 'Next',
    skip: 'Skip',
    tutorialStep: 'Step {n} / {total}',
    // Duration
    selectDuration: 'Select Training Duration',
    min1: '1 minute',
    min3: '3 minutes',
    min5: '5 minutes',
    // Game
    difficulty: 'Level',
    score: 'Score',
    timeLeft: 'Time Left',
    exit: 'Exit',
    memorize: 'Memorize the star sequence',
    clickInOrder: 'Click stars in order',
    correct: 'Correct!',
    wrong: 'Wrong!',
    timeout: 'Timeout!',
    confirmExit: 'Exit current game?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    // Result
    skipGame: 'Skip',
    resultTitle: 'Training Complete',
    finalScore: 'Final Score',
    successRate: 'Accuracy',
    avgTime: 'Avg Response',
    playAgain: 'Play Again',
    backHome: 'Home'
  }
}

const state = Vue.observable({
  lang: localStorage.getItem(LANG_KEY) || 'zh'
})

export function useI18n() {
  return {
    get lang() { return state.lang },
    setLang(l) {
      state.lang = l
      localStorage.setItem(LANG_KEY, l)
    },
    toggleLang() {
      const nl = state.lang === 'zh' ? 'en' : 'zh'
      state.lang = nl
      localStorage.setItem(LANG_KEY, nl)
    },
    t(key, params) {
      let s = messages[state.lang][key] || key
      if (params) {
        for (const p in params) s = s.replace(`{${p}}`, params[p])
      }
      return s
    }
  }
}

export function t(key, params) {
  let s = messages[state.lang][key] || key
  if (params) {
    for (const p in params) s = s.replace(`{${p}}`, params[p])
  }
  return s
}

export function currentLang() {
  return state.lang
}
