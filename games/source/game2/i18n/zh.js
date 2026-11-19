export default {
  // 通用
  appName: '记忆画师',
  start: '开始训练',
  back: '返回',
  pause: '暂停',
  resume: '继续',
  restart: '重新开始',
  finish: '结束训练',
  confirm: '确认',
  cancel: '取消',

  // 开始界面
  selectDuration: '选择训练时长',
  duration1Min: '1 分钟',
  duration3Min: '3 分钟',
  duration5Min: '5 分钟',
  startTraining: '开始训练',
  viewRecords: '训练记录',
  viewRules: '游戏规则',
  skip: '跳过游戏',

  // 游戏界面
  score: '得分',
  difficulty: '难度',
  level: '等级',
  remainingTime: '剩余时间',
  memorizeTime: '记忆时间',
  answerTime: '答题时间',
  correct: '正确',
  incorrect: '错误',
  timeout: '超时',
  question: '选择缺失的元素',
  selectCount: '已选择',

  // 结果界面
  trainingComplete: '训练完成',
  trainingResults: '训练结果',
  finalScore: '最终得分',
  totalQuestions: '答题总数',
  correctAnswers: '答对题数',
  incorrectAnswers: '答错题数',
  accuracy: '正确率',
  avgResponseTime: '平均反应时间',
  avgDifficulty: '平均难度',
  trainingDuration: '训练时长',
  seconds: '秒',
  backToStart: '返回开始',

  // 训练记录
  trainingHistory: '训练记录',
  noRecords: '暂无训练记录',
  trainingTime: '训练时间',
  exportCSV: '导出记录',
  clearHistory: '清空记录',
  confirmClear: '确认清空所有训练记录吗？',

  // 游戏规则
  gameRules: '游戏规则',
  rulesGameplay: '游戏玩法',
  rulesStep1: '选择训练时长（1分钟、3分钟或5分钟）',
  rulesStep2: '系统展示包含多个元素的图片，记住所有元素',
  rulesStep3: '图片消失后，系统展示缺少一个或多个元素的图片',
  rulesStep4: '从4个选项中选择缺失的元素',
  rulesStep5: '答对得分，继续下一题，直到时间结束',

  rulesDifficulty: '难度等级',
  rulesElements: '元素数',
  rulesMemTime: '记忆时间',
  rulesRemoved: '移除数',
  rulesScore: '答对得分',

  rulesAutoAdjust: '智能难度调整',
  rulesAdjust1: '系统根据最近30秒内的答题正确率自动调整难度',
  rulesAdjust2: '正确率 ≥ 90%，难度提升一级',
  rulesAdjust3: '正确率 ≤ 70%，难度降低一级',

  rulesScoring: '评分规则',
  rulesScoringDesc: '答对一题得分 = 5分 × 难度系数。答错不得分。最终得分为所有答对题目的总分累加。',

  // 消息提示
  difficultyIncreased: '难度提升',
  difficultyDecreased: '难度降低',
  goodJob: '做得好',
  keepGoing: '继续加油',

  // 语言切换
  language: '语言',
  chinese: '中文',
  english: 'English',

  // 教程
  tutorialTitle: '游戏教程',
  tutorialStep1Title: '第一步：记忆元素',
  tutorialStep1Desc: '系统会展示一张包含多个元素的图片，请在规定时间内记住所有元素的位置和内容。记忆时间会根据难度等级变化。',
  tutorialStep2Title: '第二步：选择缺失元素',
  tutorialStep2Desc: '图片消失后，系统会展示缺少一个或多个元素的图片，并提供4个选项。请从这4个选项中选出缺失的元素。',
  tutorialStep3Title: '第三步：多选模式',
  tutorialStep3Desc: '在较高难度下，会有多个元素缺失。此时需要选择对应数量的正确答案。选中的选项会显示蓝色勾选标记，顶部会显示已选择数量。',
  previous: '上一步',
  next: '下一步'
}
