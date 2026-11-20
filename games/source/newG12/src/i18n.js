import { bindTrainingLanguage } from '@/language.js'
import Vue from 'vue'

export const messages = {
  zh: {
    appTitle: '情绪记忆',
    appSubtitle: '通过记忆人物面部情绪，训练注意辨别与短时记忆',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    langSwitch: 'EN',

    rulesTitle: '规则介绍',
    rulesGoal: '游戏目标',
    rulesGoalText: '训练用户的注意辨别能力及短时记忆能力。',
    rulesPlay: '玩法',
    rulesPlayText: '屏幕会展示面孔一段时间，然后隐藏。请回忆人物的情绪并从下方选项中选择正确答案。',
    rulesLevels: '难度分级',
    rulesLevelHeaders: ['难度', '面孔数量', '展示时间(秒)', '选项数量', '难度系数'],
    rulesLevelHint: '难度1-4：回忆展示人物的表情；难度5-6：回忆左侧或右侧展示人物的表情。最长答题时间15秒。',
    rulesAdaptive: '智能难度调整',
    rulesAdaptiveText: '每60秒统计正确率：≥90%升级，≤70%降级，其余不变。',
    rulesScore: '评分规则',
    rulesScoreText: '每答对一题得分 = 5 × 当前难度系数。',
    close: '关闭',

    historyTitle: '历史记录',
    colDate: '训练时间',
    colProject: '训练项目',
    colDifficulty: '难度等级',
    colDuration: '时长',
    colTotal: '总次数',
    colSuccess: '成功次数',
    colFail: '失败次数',
    colRate: '成功率',
    colAvg: '平均反应时长',
    colScore: '得分',
    noHistory: '暂无训练记录',
    clearHistory: '清空记录',
    confirmClear: '确定要清空历史记录吗？',
    projectName: '情绪记忆',

    tutorialTitle: '游戏教程',
    tutorialStep1: '第一步：屏幕会展示一张面孔，请仔细观察面部情绪',
    tutorialStep2: '第二步：面孔会隐藏，此时需要回忆刚才看到的情绪',
    tutorialStep3: '第三步：从下方选项中选择正确的情绪',
    tutorialStep4: '选择正确将得到分数，让我们开始训练吧！',
    tutorialStep5Title: '高难度提示',
    tutorialStep5: '难度5-6时会同时展示两张面孔，请注意题目要求回忆的是左侧还是右侧',
    prev: '上一步',
    next: '下一步',
    skip: '跳过教程',
    startNow: '开始训练',

    durationTitle: '请选择训练时长',
    duration1: '1分钟',
    duration3: '3分钟',
    duration5: '5分钟',

    gameLevel: '难度',
    gameScore: '得分',
    gameTimeLeft: '剩余',
    gameBack: '返回',
    skipGame: '跳过',
    gameConfirmBack: '确定要结束当前训练吗？',
    gameYes: '确定',
    gameNo: '取消',

    promptRemember: '请记住这张面孔的表情',
    promptRememberMulti: '请记住这两张面孔的表情',
    promptRecall: '请回忆展示人物的表情',
    promptRecallLeft: '请回忆左侧展示人物的表情',
    promptRecallRight: '请回忆右侧展示人物的表情',
    feedbackCorrect: '正确',
    feedbackWrong: '错误',
    feedbackTimeout: '超时',

    resultTitle: '训练完成',
    resultScore: '本次得分',
    resultAccuracy: '正确率',
    resultTotal: '总题数',
    resultCorrect: '正确题数',
    resultWrong: '错误题数',
    resultAvg: '平均反应时长',
    resultBack: '返回首页',
    resultAgain: '再玩一次',

    seconds: '秒',
    minute: '分钟',
    left: '左侧',
    right: '右侧'
  },

  en: {
    appTitle: 'Emotion Memory',
    appSubtitle: 'Train attention, discrimination and short-term memory by recalling facial emotions',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    langSwitch: '中',

    rulesTitle: 'Rules',
    rulesGoal: 'Goal',
    rulesGoalText: 'Train attention, discrimination and short-term memory abilities.',
    rulesPlay: 'How to Play',
    rulesPlayText: 'A face is shown briefly, then hidden. Recall the emotion and choose the correct option below.',
    rulesLevels: 'Difficulty Levels',
    rulesLevelHeaders: ['Level', 'Faces', 'Display(s)', 'Options', 'Coefficient'],
    rulesLevelHint: 'Levels 1-4: recall the shown face. Levels 5-6: recall the left or right face. Max answer time is 15s.',
    rulesAdaptive: 'Adaptive Difficulty',
    rulesAdaptiveText: 'Every 60s the accuracy is measured: ≥90% levels up, ≤70% levels down.',
    rulesScore: 'Scoring',
    rulesScoreText: 'Each correct answer scores 5 × current coefficient.',
    close: 'Close',

    historyTitle: 'History',
    colDate: 'Date',
    colProject: 'Project',
    colDifficulty: 'Level',
    colDuration: 'Duration',
    colTotal: 'Total',
    colSuccess: 'Correct',
    colFail: 'Wrong',
    colRate: 'Accuracy',
    colAvg: 'Avg. RT',
    colScore: 'Score',
    noHistory: 'No training records yet',
    clearHistory: 'Clear',
    confirmClear: 'Clear all history records?',
    projectName: 'Emotion Memory',

    tutorialTitle: 'Tutorial',
    tutorialStep1: 'Step 1: A face will appear. Watch its expression carefully.',
    tutorialStep2: 'Step 2: The face will disappear. Recall the expression.',
    tutorialStep3: 'Step 3: Choose the correct emotion from the options.',
    tutorialStep4: 'A correct answer earns points. Let\'s begin!',
    tutorialStep5Title: 'Higher Levels',
    tutorialStep5: 'At levels 5-6, two faces appear. Pay attention to whether the question asks about the left or right face.',
    prev: 'Prev',
    next: 'Next',
    skip: 'Skip',
    startNow: 'Start Training',

    durationTitle: 'Choose Training Duration',
    duration1: '1 minute',
    duration3: '3 minutes',
    duration5: '5 minutes',

    gameLevel: 'Level',
    gameScore: 'Score',
    gameTimeLeft: 'Time',
    gameBack: 'Back',
    skipGame: 'Skip',
    gameConfirmBack: 'End the current training?',
    gameYes: 'Yes',
    gameNo: 'No',

    promptRemember: 'Remember this expression',
    promptRememberMulti: 'Remember both expressions',
    promptRecall: 'Recall the expression shown',
    promptRecallLeft: 'Recall the LEFT face expression',
    promptRecallRight: 'Recall the RIGHT face expression',
    feedbackCorrect: 'Correct',
    feedbackWrong: 'Wrong',
    feedbackTimeout: 'Timeout',

    resultTitle: 'Training Complete',
    resultScore: 'Score',
    resultAccuracy: 'Accuracy',
    resultTotal: 'Total',
    resultCorrect: 'Correct',
    resultWrong: 'Wrong',
    resultAvg: 'Avg. Response Time',
    resultBack: 'Home',
    resultAgain: 'Play Again',

    seconds: 's',
    minute: 'min',
    left: 'Left',
    right: 'Right'
  }
}

export const i18n = Vue.observable({
  lang: (localStorage.getItem('emotion.lang') || 'zh')
})

export function setLang(l) {
  i18n.lang = l
  localStorage.setItem('emotion.lang', l)
}

export function t(key) {
  return messages[i18n.lang][key]
}

export function emotionLabel(emotion) {
  return emotion[i18n.lang]
}

bindTrainingLanguage(() => i18n.lang, setLang)
