const messages = {
  zh: {
    gameName: '迷宫巡航',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    skip: '跳过游戏',
    langToggle: 'EN',
    tutorialTitle: '游戏教程',
    tutorialNext: '下一步',
    tutorialPrev: '上一步',
    tutorialSkip: '跳过',
    selectDuration: '选择训练时长',
    dur1: '1 分钟',
    dur3: '3 分钟',
    dur5: '5 分钟',
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余',
    watching: '观察机器人路径…',
    yourTurn: '请重复路径！',
    correct: '✓ 正确！',
    wrong: '✗ 错误！',
    timeUp: '超时！',
    backBtn: '返回',
    gameOver: '游戏结束',
    totalScore: '总分',
    totalTrials: '总题数',
    correctCount: '答对',
    accuracy: '正确率',
    avgTime: '平均反应时间',
    backHome: '返回首页',
    historyTitle: '历史记录',
    noHistory: '暂无记录',
    col_time: '训练时间',
    col_item: '训练项目',
    col_diff: '难度等级',
    col_dur: '时长',
    col_total: '总次数',
    col_success: '成功',
    col_fail: '失败',
    col_rate: '成功率',
    col_avg: '平均反应时长',
    col_score: '得分',
    rulesTitle: '规则介绍',
    rulesDesc: `难度等级说明：
• 难度1：直线，无分叉，答题时间10秒，难度系数1
• 难度2：简单走廊+1个转弯，答题时间10秒，难度系数1.5
• 难度3：简单走廊+2个转弯，答题时间10秒，难度系数2
• 难度4：简单走廊+3个转弯，答题时间15秒，难度系数2.5
• 难度5：简单走廊+3个转弯，答题时间13秒，难度系数3
• 难度6：简单走廊+4个转弯，答题时间20秒，难度系数3.5

智能难度调整（每30秒）：
• 正确率 ≥ 90%：难度提升
• 正确率 ≤ 70%：难度降低
• 其余不变

得分规则：每答对1题 = 5 × 难度系数`,
    close: '关闭',
    seconds: '秒',
    level: '等级',
    mazeNav: '迷宫巡航',
  },
  en: {
    gameName: 'Maze Navigation',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    skip: 'Skip Game',
    langToggle: '中',
    tutorialTitle: 'Tutorial',
    tutorialNext: 'Next',
    tutorialPrev: 'Prev',
    tutorialSkip: 'Skip',
    selectDuration: 'Select Duration',
    dur1: '1 Min',
    dur3: '3 Min',
    dur5: '5 Min',
    difficulty: 'Difficulty',
    score: 'Score',
    timeLeft: 'Left',
    watching: 'Watch the robot path…',
    yourTurn: 'Trace the path!',
    correct: '✓ Correct!',
    wrong: '✗ Wrong!',
    timeUp: 'Time Up!',
    backBtn: 'Back',
    gameOver: 'Game Over',
    totalScore: 'Total Score',
    totalTrials: 'Trials',
    correctCount: 'Correct',
    accuracy: 'Accuracy',
    avgTime: 'Avg Response',
    backHome: 'Home',
    historyTitle: 'History',
    noHistory: 'No records yet',
    col_time: 'Time',
    col_item: 'Game',
    col_diff: 'Difficulty',
    col_dur: 'Duration',
    col_total: 'Total',
    col_success: 'Success',
    col_fail: 'Fail',
    col_rate: 'Rate',
    col_avg: 'Avg Reaction',
    col_score: 'Score',
    rulesTitle: 'Rules',
    rulesDesc: `Difficulty Levels:
• Level 1: Straight line, 10s limit, ×1 coefficient
• Level 2: 1 turn, 10s limit, ×1.5 coefficient
• Level 3: 2 turns, 10s limit, ×2 coefficient
• Level 4: 3 turns, 15s limit, ×2.5 coefficient
• Level 5: 3 turns, 13s limit, ×3 coefficient
• Level 6: 4 turns, 20s limit, ×3.5 coefficient

Smart Difficulty (every 30s):
• Accuracy ≥ 90%: difficulty up
• Accuracy ≤ 70%: difficulty down
• Otherwise: unchanged

Scoring: Each correct answer = 5 × coefficient`,
    close: 'Close',
    seconds: 's',
    level: 'Level',
    mazeNav: 'Maze Navigation',
  },
}

// lang can be a plain string OR a reactive getter () => string
export function useI18n(lang) {
  return (key) => {
    const l = typeof lang === 'function' ? lang() : lang
    const locale = messages[l] || {}
    return locale[key] !== undefined ? locale[key] : key
  }
}

export default messages
