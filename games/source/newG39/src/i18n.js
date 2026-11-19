// Language dictionary for 守护花朵 / Guard the Flower
export const dict = {
  zh: {
    title: '守护花朵',
    subtitle: '视觉持续定位训练 · 注意分配',
    start: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    lang: 'EN',
    tutorial: '游戏教程',
    prev: '上一步',
    next: '下一步',
    skip: '跳过',
    startGame: '开始游戏',
    tutorialSteps: [
      { title: '守护中央花朵', desc: '森林中央有一朵珍贵的花朵，需要你的守护。' },
      { title: '击退靠近的害虫', desc: '虫子会从四周爬向花朵，鼠标点击将其消灭，每只 +5 分。' },
      { title: '扑灭树上的火焰', desc: '周边树木会随机起火，点击火焰将其扑灭，每处 +10 分。' },
      { title: '难度自适应', desc: '每 60 秒统计一次正确率：≥90% 升级，≤70% 降级，尽力守护！' }
    ],
    chooseDuration: '选择训练时长',
    back: '返回',
    min1: '1 分钟',
    min3: '3 分钟',
    min5: '5 分钟',
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余时间',
    taskPrompt: '请消灭花朵周边的害虫并熄灭火焰',
    skipGame: '跳过游戏',
    pauseTitle: '游戏已暂停',
    pauseDesc: '返回将结束本次训练进度，是否继续？',
    resume: '继续游戏',
    quit: '结束返回',
    resultTitle: '训练完成',
    resultTime: '训练时间',
    resultProject: '训练项目',
    resultDifficulty: '难度等级',
    resultDuration: '时长',
    resultTotal: '总次数',
    resultSuccess: '成功次数',
    resultFail: '失败次数',
    resultRate: '成功率',
    resultAvg: '平均反应时长',
    resultScore: '得分',
    playAgain: '再玩一次',
    backHome: '返回首页',
    historyTitle: '历史训练记录',
    empty: '暂无训练记录',
    clear: '清空记录',
    confirmClear: '确定清空全部历史记录？',
    cancel: '取消',
    confirm: '确定',
    seconds: '秒',
    ms: '毫秒',
    rulesTitle: '游戏规则',
    rulesBody: [
      '· 场景为森林场景，中央为花朵，四周随机生成虫子，周边树木随机起火。',
      '· 用鼠标点击靠近花朵的虫子和出现的火灾以保护花朵。',
      '· 消灭一只害虫 +5 分，扑灭一处火焰 +10 分；难度提升后分数按难度系数放大。',
      '· 每 60 秒统计一次正确率：≥90% 难度升级；≤70% 难度降级；其余保持。',
      '· 训练时长可选 1 / 3 / 5 分钟。'
    ],
    close: '关闭'
  },
  en: {
    title: 'Guard the Flower',
    subtitle: 'Sustained Visual Localization · Attention',
    start: 'Start',
    rules: 'Rules',
    history: 'History',
    lang: '中',
    tutorial: 'Tutorial',
    prev: 'Prev',
    next: 'Next',
    skip: 'Skip',
    startGame: 'Start Game',
    tutorialSteps: [
      { title: 'Guard the Flower', desc: 'A precious flower blooms at the heart of the forest — protect it.' },
      { title: 'Squash the Bugs', desc: 'Bugs crawl toward the flower. Click to squash them. +5 points each.' },
      { title: 'Extinguish the Fires', desc: 'Trees around the flower may catch fire. Click to put them out. +10 points each.' },
      { title: 'Adaptive Difficulty', desc: 'Every 60s: accuracy ≥90% levels up, ≤70% levels down. Stay sharp!' }
    ],
    chooseDuration: 'Choose Training Duration',
    back: 'Back',
    min1: '1 min',
    min3: '3 min',
    min5: '5 min',
    difficulty: 'Level',
    score: 'Score',
    timeLeft: 'Time Left',
    taskPrompt: 'Eliminate bugs near the flower and extinguish the fires',
    skipGame: 'End Game',
    pauseTitle: 'Game Paused',
    pauseDesc: 'Going back will end this training session. Continue?',
    resume: 'Resume',
    quit: 'End & Back',
    resultTitle: 'Training Complete',
    resultTime: 'Time',
    resultProject: 'Project',
    resultDifficulty: 'Level',
    resultDuration: 'Duration',
    resultTotal: 'Total',
    resultSuccess: 'Success',
    resultFail: 'Fail',
    resultRate: 'Success Rate',
    resultAvg: 'Avg Reaction',
    resultScore: 'Score',
    playAgain: 'Play Again',
    backHome: 'Back Home',
    historyTitle: 'Training History',
    empty: 'No records yet',
    clear: 'Clear',
    confirmClear: 'Clear all history records?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    seconds: 's',
    ms: 'ms',
    rulesTitle: 'Rules',
    rulesBody: [
      '· A forest scene with a flower at the center; bugs spawn around it and trees may catch fire.',
      '· Click bugs approaching the flower, and click fires on trees to extinguish them.',
      '· +5 pts per bug, +10 pts per fire. Points scale with the current difficulty coefficient.',
      '· Every 60s, accuracy ≥90% → level up; ≤70% → level down; otherwise unchanged.',
      '· Training duration: 1 / 3 / 5 minutes.'
    ],
    close: 'Close'
  }
}

export function createI18n () {
  return {
    lang: (localStorage.getItem('gf_lang') || 'zh'),
    t (key) {
      const cur = dict[this.lang] || dict.zh
      return cur[key]
    },
    set (l) {
      this.lang = l
      localStorage.setItem('gf_lang', l)
    }
  }
}
