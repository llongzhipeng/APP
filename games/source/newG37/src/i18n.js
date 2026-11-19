// 中英文文案
export const messages = {
  zh: {
    appTitle: '分类挑战赛',
    subtitle: '未来环保工厂 · 智能分类训练',
    start: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    lang: 'EN',
    back: '返回',
    close: '关闭',
    next: '下一步',
    prev: '上一步',
    skip: '跳过教程',
    startNow: '立即开始',
    // 规则
    rulesTitle: '规则介绍',
    rulesText: [
      '请将传送带上的物品放入指定的分类桶中。',
      '每题最长答题时间 15 秒，超时或错分均计为错误。',
      '每 60 秒系统会根据正确率智能调整难度：≥90% 升级，≤70% 降级。',
      '难度 1 每题得 5 分，后续难度得分 = 5 × 难度系数。',
      '共 6 个难度：从颜色分类逐步过渡到材质与可回收性分类。'
    ],
    // 教程
    tutorialTitle: '游戏教程',
    tutorialSteps: [
      '观察上方规则屏，明确本题的分类要求。',
      '按住传送带上的物品，将它拖到正确的分类桶中。',
      '放对得分，放错扣时。加油完成挑战！'
    ],
    tutorialTip: '示例演示（自动播放）',
    // 时长选择
    durationTitle: '选择训练时长',
    minute: '分钟',
    // 游戏
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余',
    skipGame: '跳过游戏',
    pauseTitle: '游戏已暂停',
    pauseText: '确定要返回吗？当前游戏进度将不会保存。',
    confirmEnd: '确认返回',
    cancelEnd: '继续游戏',
    rulePrefix: '请将',
    ruleSuffix: '放入对应分类桶',
    correct: '正确',
    wrong: '错误',
    timeout: '超时',
    // 结果
    resultTitle: '训练完成',
    totalScore: '总得分',
    accuracy: '正确率',
    avgReact: '平均反应',
    successCount: '成功',
    failCount: '失败',
    totalCount: '总题数',
    playAgain: '再来一次',
    backHome: '返回首页',
    // 历史
    historyTitle: '训练记录',
    noHistory: '暂无训练记录',
    clearHistory: '清空记录',
    // 表头
    thTime: '训练时间',
    thProject: '项目',
    thDiff: '难度',
    thDur: '时长',
    thTotal: '总次数',
    thSucc: '成功',
    thFail: '失败',
    thRate: '正确率',
    thAvg: '平均反应',
    thScore: '得分',
    projectName: '分类挑战赛',
    // 分类
    binRed: '红色',
    binBlue: '蓝色',
    binGreen: '绿色',
    binYellow: '黄色',
    binPurple: '紫色',
    binRecycle: '可回收',
    binNoRecycle: '不可回收',
    binMetal: '金属',
    binNonMetal: '非金属',
    // 提示
    tapItemFirst: '按住物品并拖入分类桶',
    ready: '准备',
    go: '开始',
    sec: '秒'
  },
  en: {
    appTitle: 'Sort Challenge',
    subtitle: 'Future Eco Factory · Smart Sorting',
    start: 'Start',
    rules: 'Rules',
    history: 'History',
    lang: '中',
    back: 'Back',
    close: 'Close',
    next: 'Next',
    prev: 'Prev',
    skip: 'Skip Tutorial',
    startNow: 'Start Now',
    rulesTitle: 'Game Rules',
    rulesText: [
      'Drag items on the conveyor into the correct bin.',
      'Max 15s per item. Timeout or wrong placement counts as an error.',
      'Every 60s difficulty auto-adjusts: ≥90% up, ≤70% down.',
      'Level 1 = 5 points each; higher levels = 5 × difficulty multiplier.',
      '6 levels total: from color sorting to material & recyclability.'
    ],
    tutorialTitle: 'Tutorial',
    tutorialSteps: [
      'Read the rule board to know the current sorting requirement.',
      'Press and drag an item on the conveyor into the matching bin.',
      'Correct = points. Wrong = penalty. Good luck!'
    ],
    tutorialTip: 'Demo (auto-play)',
    durationTitle: 'Select Duration',
    minute: 'min',
    difficulty: 'Level',
    score: 'Score',
    timeLeft: 'Time',
    skipGame: 'End',
    pauseTitle: 'Paused',
    pauseText: 'Leave now? Current progress will not be saved.',
    confirmEnd: 'Leave',
    cancelEnd: 'Resume',
    rulePrefix: 'Sort ',
    ruleSuffix: ' into the right bin',
    correct: 'Correct',
    wrong: 'Wrong',
    timeout: 'Timeout',
    resultTitle: 'Training Complete',
    totalScore: 'Total Score',
    accuracy: 'Accuracy',
    avgReact: 'Avg Reaction',
    successCount: 'Success',
    failCount: 'Fail',
    totalCount: 'Total',
    playAgain: 'Play Again',
    backHome: 'Home',
    historyTitle: 'Training History',
    noHistory: 'No records yet',
    clearHistory: 'Clear',
    thTime: 'Time',
    thProject: 'Project',
    thDiff: 'Level',
    thDur: 'Duration',
    thTotal: 'Total',
    thSucc: 'Success',
    thFail: 'Fail',
    thRate: 'Rate',
    thAvg: 'Avg RT',
    thScore: 'Score',
    projectName: 'Sort Challenge',
    binRed: 'Red',
    binBlue: 'Blue',
    binGreen: 'Green',
    binYellow: 'Yellow',
    binPurple: 'Purple',
    binRecycle: 'Recyclable',
    binNoRecycle: 'Non-Recyclable',
    binMetal: 'Metal',
    binNonMetal: 'Non-Metal',
    tapItemFirst: 'Hold and drag the item into a bin',
    ready: 'Ready',
    go: 'Go',
    sec: 's'
  }
}

export function createI18n() {
  return {
    data() { return { lang: (localStorage.getItem('lang') || 'zh') } },
    computed: {
      t() { return messages[this.lang] }
    },
    methods: {
      toggleLang() {
        this.lang = this.lang === 'zh' ? 'en' : 'zh'
        localStorage.setItem('lang', this.lang)
      }
    }
  }
}
