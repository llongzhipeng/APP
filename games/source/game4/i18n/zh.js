/**
 * 中文语言包
 */
export default {
  common: {
    start: '开始游戏',
    pause: '暂停',
    continue: '继续',
    back: '返回',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    save: '保存',
    delete: '删除',
    clear: '清空',
    score: '得分',
    time: '时间',
    difficulty: '难度',
    language: '语言'
  },
  menu: {
    title: '速算连连看',
    subtitle: '认知训练游戏',
    selectDuration: '选择训练时长',
    viewRules: '游戏规则',
    viewRecords: '历史记录',
    startGame: '开始训练'
  },
  game: {
    target: '目标值',
    currentScore: '当前得分',
    timeLeft: '剩余时间',
    level: '难度等级',
    correct: '正确',
    wrong: '错误',
    paused: '游戏已暂停',
    resume: '点击继续',
    levelUp: '难度提升！',
    levelDown: '难度降低',
    skip: '跳过游戏'
  },
  rules: {
    title: '游戏规则',
    rule1: '屏幕上方会显示一个目标值',
    rule2: '快速找出2个相加等于目标值的数字卡片并点击',
    rule3: '答对一题得分 = 5 × 当前难度系数',
    rule4: '每30秒根据该时间段内的正确率自动调整难度',
    rule5: '正确率>90%难度提升，<70%难度降低',
    rule6: '答对后卡片消失，空位自动生成新卡片，目标值随机更新',
    rule7: '难度等级1-6，卡片数量从8张到18张，目标值范围逐渐增大'
  },
  result: {
    title: '训练完成',
    finalScore: '最终得分',
    duration: '训练时长',
    totalAttempts: '总尝试次数',
    successCount: '成功次数',
    failCount: '失败次数',
    successRate: '成功率',
    avgReactionTime: '平均反应时长',
    difficultyLevel: '难度等级',
    backToMenu: '返回主菜单',
    viewDetails: '查看详情',
    millisecond: '毫秒',
    second: '秒',
    minute: '分钟'
  },
  records: {
    title: '历史记录',
    noRecords: '暂无训练记录',
    trainTime: '训练时间',
    project: '训练项目',
    duration: '时长',
    score: '得分',
    successRate: '成功率',
    clearAll: '清空所有记录',
    confirmClear: '确定要清空所有记录吗？',
    projectName: '速算连连看'
  },
  tutorial: {
    title: '游戏教程',
    previous: '上一步',
    next: '下一步',
    startGame: '开始游戏',
    dontShowAgain: '不再显示此教程',
    accuracy: '正确率',
    step1Title: '第一步：认识目标值',
    step1Desc: '游戏开始时，屏幕上方会显示一个目标值，这是你需要凑成的数字。',
    step1Tip: '每次答对后，目标值会随机更新',
    step2Title: '第二步：选择卡片',
    step2Desc: '在卡片区域中，依次点击数字卡片，让它们的和等于目标值。',
    step2Tip: '所有难度等级都需要选择2张卡片相加',
    step3Title: '第三步：卡片消失与刷新',
    step3Desc: '答对后，选中的卡片会消失，空位会自动生成新的数字卡片。',
    step3Tip: '新卡片会带有闪烁动画提示',
    step4Title: '第四步：智能难度调整',
    step4Desc: '游戏会每30秒根据该时间段内的正确率自动调整难度等级。',
    step4Tip: '正确率>90%难度提升，<70%难度降低，让游戏始终保持挑战性'
  }
};
