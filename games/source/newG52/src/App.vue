<template>
  <div id="app" :style="rootScale">
    <!-- 顶部语言切换 -->
    <button
      v-if="!inGame"
      class="lang-btn"
      @click="toggleLang"
    >{{ lang === 'zh' ? 'EN' : '中' }}</button>

    <!-- 首页 -->
    <div v-if="page === 'home'" class="page home">
      <h1 class="title">{{ t.title }}</h1>
      <div class="subtitle">{{ t.subtitle }}</div>
      <div class="home-card">
        <button class="btn primary big" @click="startFlow">{{ t.startGame }}</button>
        <button class="btn big" @click="page = 'rules'">{{ t.rules }}</button>
        <button class="btn big" @click="page = 'history'">{{ t.history }}</button>
      </div>
    </div>

    <!-- 规则介绍 -->
    <div v-if="page === 'rules'" class="page rules-page">
      <h2>{{ t.rules }}</h2>
      <div class="rules-content">
        <p>{{ t.rulesText1 }}</p>
        <p>{{ t.rulesText2 }}</p>
        <table class="rule-table">
          <thead>
            <tr>
              <th>{{ t.diff }}</th>
              <th>{{ t.presentation }}</th>
              <th>{{ t.intensity }}</th>
              <th>{{ t.optionsCount }}</th>
              <th>{{ t.coeff }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in ruleTableRows" :key="i">
              <td>{{ row.d }}</td>
              <td>{{ row.p }}</td>
              <td>{{ row.i }}</td>
              <td>{{ row.o }}</td>
              <td>{{ row.c }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn" @click="page = 'home'">{{ t.back }}</button>
    </div>

    <!-- 历史记录 -->
    <div v-if="page === 'history'" class="page history-page">
      <h2>{{ t.history }}</h2>
      <div v-if="history.length === 0" class="empty">{{ t.noHistory }}</div>
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>{{ t.hTime }}</th>
            <th>{{ t.hProject }}</th>
            <th>{{ t.hDiff }}</th>
            <th>{{ t.hDur }}</th>
            <th>{{ t.hTotal }}</th>
            <th>{{ t.hSuc }}</th>
            <th>{{ t.hFail }}</th>
            <th>{{ t.hRate }}</th>
            <th>{{ t.hAvg }}</th>
            <th>{{ t.hScore }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in history" :key="i">
            <td>{{ r.time }}</td>
            <td>{{ t.title }}</td>
            <td>{{ r.finalDiff }}</td>
            <td>{{ formatDur(r.duration) }}</td>
            <td>{{ r.total }}</td>
            <td>{{ r.correct }}</td>
            <td>{{ r.wrong }}</td>
            <td>{{ r.total ? Math.round(r.correct / r.total * 100) : 0 }}%</td>
            <td>{{ r.avgReact.toFixed(2) }}s</td>
            <td>{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
      <button class="btn" @click="page = 'home'">{{ t.back }}</button>
    </div>

    <!-- 教程弹窗 -->
    <div v-if="page === 'tutorial'" class="modal-mask">
      <div class="modal">
        <h3>{{ t.tutorial }} ({{ tutorialStep + 1 }}/{{ tutorialSteps.length }})</h3>
        <div class="tutorial-body">
          <div class="tutorial-visual">
            <img
              :src="tutorialSteps[tutorialStep].img"
              class="demo-img"
              :class="{ half: tutorialSteps[tutorialStep].demoType==='half', eyes: tutorialSteps[tutorialStep].demoType==='eyes' }"
              alt="demo"
            />
            <div class="demo-options">
              <button
                v-for="(op, i) in tutorialSteps[tutorialStep].options"
                :key="i"
                class="op-btn"
                :class="{ correct: op.correct && tutorialSteps[tutorialStep].showAnswer, wrong: !op.correct && tutorialSteps[tutorialStep].showAnswer }"
              >{{ op.label }}</button>
            </div>
            <div class="tutorial-hint">{{ tutorialSteps[tutorialStep].hint }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="skipTutorial">{{ t.skip }}</button>
          <button class="btn" :disabled="tutorialStep === 0" @click="tutorialStep--">{{ t.prev }}</button>
          <button v-if="tutorialStep < tutorialSteps.length-1" class="btn primary" @click="tutorialStep++">{{ t.next }}</button>
          <button v-else class="btn primary" @click="onTutorialDone">{{ t.done }}</button>
        </div>
      </div>
    </div>

    <!-- 时长选择页 -->
    <div v-if="page === 'duration'" class="page duration-page">
      <h2 class="duration-title">{{ t.chooseDuration }}</h2>
      <div class="duration-options">
        <button
          v-for="d in [60, 180, 300]"
          :key="d"
          class="duration-btn"
          :class="{ active: selectedDuration === d }"
          @click="selectedDuration = d"
        >{{ d / 60 }} {{ t.min }}</button>
      </div>
      <div class="duration-controls">
        <button class="btn big" @click="backFromDuration">{{ t.back }}</button>
        <button class="btn big primary" :disabled="!selectedDuration" @click="beginGame(selectedDuration)">{{ t.startGame }}</button>
      </div>
    </div>

    <!-- 游戏中 -->
    <div v-if="page === 'game'" class="page game-page">
      <div class="hud">
        <div class="hud-left">
          <div>{{ t.diff }}：{{ difficulty }}</div>
          <div>{{ t.score }}：{{ score }}</div>
          <div>{{ t.timeLeft }}：{{ formatDur(remainingTime) }}</div>
        </div>
        <div class="hud-center">{{ t.gameGoal }}</div>
        <div class="hud-right">
          <button v-if="showBatchSkip" class="btn small secondary skip-btn" @click="onBatchSkip">{{ t.skipBatch }}</button>
          <button class="btn small" @click="confirmQuit">{{ t.quit }}</button>
        </div>
      </div>

      <div class="qbar">
        <div class="qtimer">
          <div class="qtimer-bar" :style="{ width: (questionRemain/15*100) + '%' }"></div>
        </div>
        <div class="qtimer-txt">{{ Math.ceil(questionRemain) }}s</div>
      </div>

      <div class="game-body" v-if="currentQuestion">
        <img
          :src="currentQuestion.img"
          class="q-img"
          :class="{ half: currentQuestion.imgClass==='half', eyes: currentQuestion.imgClass==='eyes' }"
          alt="emotion"
        />
        <div class="options" :class="{ 'no-hover': hoverLock }">
          <button
            v-for="(op, i) in currentQuestion.options"
            :key="questionSeq + '-' + i"
            class="op-btn"
            :class="{
              correct: showResult && op.key === currentQuestion.answer,
              wrong: showResult && op.key === chosenKey && op.key !== currentQuestion.answer,
              disabled: showResult
            }"
            :disabled="showResult"
            @click="onOptionClick($event, op.key)"
          >{{ op.label }}</button>
        </div>
      </div>
    </div>

    <!-- 结束页 -->
    <div v-if="page === 'result'" class="page result-page">
      <h2>{{ t.gameOver }}</h2>
      <div class="result-stats">
        <div>{{ t.hScore }}：{{ lastResult.score }}</div>
        <div>{{ t.hTotal }}：{{ lastResult.total }}</div>
        <div>{{ t.hSuc }}：{{ lastResult.correct }}</div>
        <div>{{ t.hFail }}：{{ lastResult.wrong }}</div>
        <div>{{ t.hRate }}：{{ lastResult.total ? Math.round(lastResult.correct/lastResult.total*100) : 0 }}%</div>
        <div>{{ t.hAvg }}：{{ lastResult.avgReact.toFixed(2) }}s</div>
      </div>
      <div class="result-btns">
        <button class="btn primary" @click="returnToTraining">{{ t.backHome }}</button>
        <button v-if="!isHosted" class="btn" @click="startFlow">{{ t.playAgain }}</button>
      </div>
    </div>

    <!-- 退出确认 -->
    <div v-if="quitAsk" class="modal-mask">
      <div class="modal small-modal">
        <div>{{ t.confirmQuit }}</div>
        <div class="modal-actions">
          <button class="btn" @click="cancelQuit">{{ t.no }}</button>
          <button class="btn primary" @click="doQuit">{{ t.yes }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from './assets.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame, isActiveBatchGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'ysdx' // 眼神读心
const EMOTIONS = ['Anger', 'Happy', 'sad']
// 各难度对应的图片文件夹与扩展名映射
// key 是情绪文件夹名，val 是扩展名（依据实际文件）
const FOLDER_MAP = {
  1: { path: 'all/Exaggerated', ext: { Anger: 'jpg', Happy: 'jpg', sad: 'jpg' }, imgClass: 'full' },
  2: { path: 'all/obvious',     ext: { Anger: 'jpg', Happy: 'jpg', sad: 'jpg' }, imgClass: 'full' },
  3: { path: 'Half_face',       ext: { Anger: 'png', Happy: 'jpg', sad: 'jpg' }, imgClass: 'half' },
  4: { path: 'Half_face',       ext: { Anger: 'png', Happy: 'jpg', sad: 'jpg' }, imgClass: 'half' },
  5: { path: 'Only_eyes',       ext: { Anger: 'png', Happy: 'jpg', sad: 'png' }, imgClass: 'eyes' },
  6: { path: 'Only_eyes',       ext: { Anger: 'png', Happy: 'jpg', sad: 'png' }, imgClass: 'eyes' }
}
const IMG_COUNT = 8

const DIFF_CONFIG = {
  1: { options: 3, coeff: 1 },
  2: { options: 4, coeff: 1.5 },
  3: { options: 4, coeff: 2 },
  4: { options: 5, coeff: 2.5 },
  5: { options: 6, coeff: 3 },
  6: { options: 7, coeff: 3.5 }
}

const I18N = {
  zh: {
    title: '眼神读心',
    subtitle: '通过眼神识别情绪，训练情绪识别与社会认知能力',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    back: '返回',
    backHome: '返回首页',
    playAgain: '再玩一次',
    tutorial: '游戏教程',
    prev: '上一步',
    next: '下一步',
    skip: '跳过教程',
    done: '开始训练',
    chooseDuration: '请选择训练时长',
    min: '分钟',
    diff: '难度',
    score: '得分',
    timeLeft: '剩余时间',
    quit: '返回',
    confirmQuit: '确定要结束本次训练吗？',
    yes: '确定',
    no: '取消',
    gameGoal: '请根据人物眼神判断情绪类型',
    gameOver: '训练结束',
    presentation: '呈现方式',
    intensity: '表情强度',
    optionsCount: '选项数量',
    coeff: '难度系数',
    noHistory: '暂无训练记录',
    hTime: '训练时间',
    hProject: '训练项目',
    hDiff: '难度等级',
    hDur: '时长',
    hTotal: '总次数',
    hSuc: '成功次数',
    hFail: '失败次数',
    hRate: '成功率',
    hAvg: '平均反应时长',
    hScore: '得分',
    skipGame: '跳过',
    skipBatch: '跳过游戏',
    rulesText1: '本游戏会先展示一张图片，请根据画面（脸部或眼神）在给定的选项中选择正确的情绪。',
    rulesText2: '每题限时 15 秒，每 60 秒依据正确率智能调整难度：90% 以上升级，70% 以下降级。',
    presentations: { full: '全脸', half: '下半张脸被遮挡', eyes: '仅眼睛' },
    intensities: ['夸张', '明显', '中等', '中等', '细微', '细微'],
    emotions: { Anger: '生气', Happy: '开心', sad: '伤心', Surprise: '惊讶', Fear: '害怕', Disgust: '厌恶', Calm: '平静' },
    tutorialSteps: [
      '示例1：全脸出现，从 3 个情绪选项中选择正确的一项。',
      '示例2：下半张脸被遮挡，观察上半张脸和眼睛判断情绪。',
      '示例3：仅显示眼睛区域，靠眼神判断情绪，红色为错误，绿色为正确。'
    ]
  },
  en: {
    title: 'Eye Reading',
    subtitle: 'Recognize emotions from eyes to train emotion recognition and social cognition.',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    back: 'Back',
    backHome: 'Back to Home',
    playAgain: 'Play Again',
    tutorial: 'Tutorial',
    prev: 'Prev',
    next: 'Next',
    skip: 'Skip',
    done: 'Start',
    chooseDuration: 'Choose training duration',
    min: 'min',
    diff: 'Level',
    score: 'Score',
    timeLeft: 'Time Left',
    quit: 'Quit',
    confirmQuit: 'Are you sure to end this training?',
    yes: 'Yes',
    no: 'No',
    gameGoal: 'Please identify the emotion from the face or eyes.',
    gameOver: 'Training Finished',
    presentation: 'Presentation',
    intensity: 'Intensity',
    optionsCount: 'Options',
    coeff: 'Coefficient',
    noHistory: 'No records',
    hTime: 'Time',
    hProject: 'Project',
    hDiff: 'Final Level',
    hDur: 'Duration',
    hTotal: 'Total',
    hSuc: 'Correct',
    hFail: 'Wrong',
    hRate: 'Success Rate',
    hAvg: 'Avg Reaction',
    hScore: 'Score',
    skipGame: 'Skip',
    skipBatch: 'Skip Game',
    rulesText1: 'An image is shown; identify the emotion from the given options based on the face or eyes.',
    rulesText2: 'Each question has 15s. Difficulty is auto-adjusted every 60s: >90% up, <70% down.',
    presentations: { full: 'Whole face', half: 'Lower face covered', eyes: 'Eyes only' },
    intensities: ['Exaggerated', 'Obvious', 'Medium', 'Medium', 'Subtle', 'Subtle'],
    emotions: { Anger: 'Anger', Happy: 'Happy', sad: 'Sad', Surprise: 'Surprise', Fear: 'Fear', Disgust: 'Disgust', Calm: 'Calm' },
    tutorialSteps: [
      'Ex.1: Full face shown, choose the correct emotion from 3 options.',
      'Ex.2: Lower face covered, rely on the upper face and eyes.',
      'Ex.3: Only eyes shown. Green = correct, red = wrong.'
    ]
  }
}
const DISTRACTORS = ['Surprise', 'Fear', 'Disgust', 'Calm']

function pick (arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle (arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default {
  name: 'App',
  data () {
    return {
      lang: 'zh',
      page: 'home', // home | rules | history | tutorial | duration | game | result
      tutorialStep: 0,
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE), // HUD 当前难度
      score: 0,
      remainingTime: 60,
      duration: 60,
      selectedDuration: 60,
      questionRemain: 15, // 秒（浮点，用于平滑动画）
      currentQuestion: null,
      chosenKey: null,
      showResult: false,
      quitAsk: false,
      gameTimer: null,
      questionTimer: null,
      nextQuestionTimer: null,
      pausedAt: 0,
      audio: null,
      questionTickMs: 100, // 每 100ms 更新一次进度条
      lastCorrect: null, // 上一题答对的题目信息，用于避免连续重复
      questionSeq: 0, // 题目序号，用于强制刷新按钮 DOM
      hoverLock: false, // 换题瞬间抑制 :hover 残留
      adjustAccumulator: 0, // 用于按60秒统计
      windowStats: { correct: 0, total: 0 },
      sessionStats: {
        total: 0, correct: 0, wrong: 0, reactSum: 0, startedAt: null
      },
      questionStartedAt: 0,
      history: [],
      lastResult: { total: 0, correct: 0, wrong: 0, score: 0, avgReact: 0 },
      viewportScale: 1,
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 批次跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    t () { return I18N[this.lang] },
    isHosted () { return isActiveBatchGame(GAME_TYPE) },
    inGame () {
      return ['tutorial', 'duration', 'game', 'result'].includes(this.page) && this.page !== 'result'
    },
    rootScale () {
      return { '--scale': this.viewportScale }
    },
    ruleTableRows () {
      const p = this.t.presentations
      const pres = ['full', 'full', 'half', 'half', 'eyes', 'eyes']
      return [1,2,3,4,5,6].map(d => ({
        d, p: p[pres[d-1]], i: this.t.intensities[d-1],
        o: DIFF_CONFIG[d].options, c: DIFF_CONFIG[d].coeff
      }))
    },
    tutorialSteps () {
      const et = this.t.emotions
      return [
        {
          img: this.buildImgUrl(1, 'Happy', 1),
          demoType: 'full',
          options: [
            { label: et.Anger, correct: false },
            { label: et.Happy, correct: true },
            { label: et.sad, correct: false }
          ],
          showAnswer: true,
          hint: this.t.tutorialSteps[0]
        },
        {
          img: this.buildImgUrl(3, 'sad', 1),
          demoType: 'half',
          options: [
            { label: et.Anger, correct: false },
            { label: et.Happy, correct: false },
            { label: et.sad, correct: true },
            { label: et.Surprise, correct: false }
          ],
          showAnswer: true,
          hint: this.t.tutorialSteps[1]
        },
        {
          img: this.buildImgUrl(5, 'Anger', 1),
          demoType: 'eyes',
          options: [
            { label: et.Anger, correct: true },
            { label: et.Happy, correct: false },
            { label: et.sad, correct: false },
            { label: et.Surprise, correct: false },
            { label: et.Fear, correct: false },
            { label: et.Disgust, correct: false }
          ],
          showAnswer: true,
          hint: this.t.tutorialSteps[2]
        }
      ]
    }
  },
  mounted () {
    this.computeScale()
    window.addEventListener('resize', this.computeScale)
    try {
      const raw = localStorage.getItem('eyeReadingHistory')
      if (raw) this.history = JSON.parse(raw)
    } catch (e) {}
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.selectedDuration = sec; this.duration = sec },
      openTutorial: () => { this.tutorialStep = 0; this.page = 'tutorial' },
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.computeScale)
    this.clearTimers()
  },
  methods: {
    computeScale () {
      // 设计基准 1280x780
      const w = window.innerWidth
      const h = window.innerHeight
      const s = Math.min(w / 1280, h / 780)
      this.viewportScale = Math.max(0.4, Math.min(2, s))
    },
    toggleLang () { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    formatDur (sec) {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${String(s).padStart(2,'0')}`
    },
    buildImgUrl (diff, emotion, idx) {
      const cfg = FOLDER_MAP[diff]
      const ext = cfg.ext[emotion]
      return resolveImage(`/images/${cfg.path}/${emotion}/${idx}.${ext}`)
    },
    startFlow () {
      this.tutorialStep = 0
      this.page = 'tutorial'
    },
    skipTutorial () { this.onTutorialDone() },
    /**
     * <summary>
     * 教程完成：批次模式直接开局，否则进入时长选择
     * </summary>
     */
    onTutorialDone () {
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.beginGame(sec))) return
      this.selectedDuration = 60
      this.page = 'duration'
    },
    backFromDuration () { this.page = 'home' },
    beginGame (sec) {
      this.duration = sec
      this.remainingTime = sec
      this.score = 0
      this.difficulty = getBatchStartDifficultyForGame(GAME_TYPE) // 起始难度
      this.adjustAccumulator = 0
      this.windowStats = { correct: 0, total: 0 }
      this.sessionStats = { total: 0, correct: 0, wrong: 0, reactSum: 0, startedAt: Date.now() }
      this.lastCorrect = null
      this.page = 'game'
      this.nextQuestion()
      this.gameTimer = setInterval(this.tickGame, 1000)
    },
    tickGame () {
      if (this.quitAsk) return // 暂停
      this.remainingTime--
      this.adjustAccumulator++
      if (this.adjustAccumulator >= 60) {
        this.adjustDifficulty()
        this.adjustAccumulator = 0
        this.windowStats = { correct: 0, total: 0 }
      }
      if (this.remainingTime <= 0) {
        this.finishGame()
      }
    },
    adjustDifficulty () {
      const { correct, total } = this.windowStats
      if (total === 0) return
      const rate = correct / total
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
      else if (rate < 0.7 && this.difficulty > 1) this.difficulty--
    },
    nextQuestion () {
      this.chosenKey = null
      this.showResult = false
      this.questionSeq++
      this.hoverLock = true
      setTimeout(() => { this.hoverLock = false }, 400)
      let answer, idx
      // 若上一题答对，避免连续重复同一情绪+同一图片
      const avoid = this.lastCorrect
      for (let tries = 0; tries < 20; tries++) {
        answer = pick(EMOTIONS)
        idx = 1 + Math.floor(Math.random() * IMG_COUNT)
        if (!avoid) break
        if (avoid.answer !== answer || avoid.idx !== idx || avoid.difficulty !== this.difficulty) break
      }
      const cfg = FOLDER_MAP[this.difficulty]
      const optionCount = DIFF_CONFIG[this.difficulty].options
      // 构造选项：正确答案 + 其他情绪 + 干扰情绪
      const pool = EMOTIONS.filter(e => e !== answer).concat(DISTRACTORS)
      const otherOptions = shuffle(pool).slice(0, optionCount - 1)
      const optionKeys = shuffle([answer, ...otherOptions])
      const et = this.t.emotions
      this.currentQuestion = {
        img: this.buildImgUrl(this.difficulty, answer, idx),
        imgClass: cfg.imgClass,
        answer,
        idx,
        difficulty: this.difficulty,
        options: optionKeys.map(k => ({ key: k, label: et[k] }))
      }
      this.questionRemain = 15
      this.questionStartedAt = Date.now()
      if (this.questionTimer) clearInterval(this.questionTimer)
      this.questionTimer = setInterval(this.tickQuestion, this.questionTickMs)
      this.playPrompt()
    },
    playPrompt () {
      try {
        if (this.audio) { this.audio.pause() }
        const url = resolveVoice(`/voice/${this.lang === 'zh' ? 'chinese' : 'english'}/1.mp3`)
        this.audio = new Audio(url)
        this.audio.play().catch(() => {})
      } catch (e) {}
    },
    tickQuestion () {
      if (this.quitAsk) return // 暂停
      this.questionRemain = Math.max(0, this.questionRemain - this.questionTickMs / 1000)
      if (this.questionRemain <= 0) {
        this.handleAnswer(null) // 超时算错
      }
    },
    submitAnswer (key) {
      if (this.quitAsk || this.showResult) return
      this.handleAnswer(key)
    },
    onOptionClick (e, key) {
      if (e && e.currentTarget) { try { e.currentTarget.blur() } catch (err) {} }
      this.submitAnswer(key)
    },
    handleAnswer (key) {
      if (this.questionTimer) { clearInterval(this.questionTimer); this.questionTimer = null }
      this.chosenKey = key
      this.showResult = true
      const react = (Date.now() - this.questionStartedAt) / 1000
      const isCorrect = key === this.currentQuestion.answer
      this.sessionStats.total++
      this.sessionStats.reactSum += react
      this.windowStats.total++
      if (isCorrect) {
        this.sessionStats.correct++
        this.windowStats.correct++
        this.score += 5 * DIFF_CONFIG[this.difficulty].coeff
        this.lastCorrect = {
          answer: this.currentQuestion.answer,
          idx: this.currentQuestion.idx,
          difficulty: this.currentQuestion.difficulty
        }
      } else {
        this.sessionStats.wrong++
        this.lastCorrect = null
      }
      // 显示 0.8s 后进入下一题
      this.nextQuestionTimer = setTimeout(() => {
        this.nextQuestionTimer = null
        if (!this.quitAsk && this.page === 'game' && this.remainingTime > 0) this.nextQuestion()
      }, 800)
    },
    clearTimers () {
      if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null }
      if (this.questionTimer) { clearInterval(this.questionTimer); this.questionTimer = null }
      clearTimeout(this.nextQuestionTimer)
      this.nextQuestionTimer = null
      this.audio?.pause()
      this.audio = null
    },
    confirmQuit () {
      this.pausedAt = Date.now()
      this.quitAsk = true
      this.audio?.pause()
    },
    cancelQuit () {
      this.quitAsk = false
      if (this.questionTimer) this.questionStartedAt += Date.now() - this.pausedAt
      if (this.showResult && !this.nextQuestionTimer) this.nextQuestion()
      else if (this.audio?.paused && !this.audio.ended) this.audio.play().catch(() => {})
    },
    onBatchSkip () { skipPbBatchGame() },
    doQuit () {
      this.quitAsk = false
      this.clearTimers()
      this.returnToTraining()
    },
    returnToTraining () {
      if (this.isHosted) leavePbGameWindow({ confirm: false })
      else this.page = 'home'
    },
    finishGame () {
      this.clearTimers()
      const s = this.sessionStats
      const avg = s.total ? s.reactSum / s.total : 0
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avg),
        score: Math.round(this.score || 0),
        successCount: s.correct || 0,
        failCount: s.wrong || 0,
        trainDuration: this.duration,
        difficultyLevel: this.difficulty || 1, // HUD 当前难度
      })
      const rec = {
        time: new Date().toLocaleString(),
        finalDiff: this.difficulty,
        duration: this.duration,
        total: s.total,
        correct: s.correct,
        wrong: s.wrong,
        avgReact: avg,
        score: Math.round(this.score * 100) / 100
      }
      this.lastResult = rec
      this.history.unshift(rec)
      if (this.history.length > 50) this.history = this.history.slice(0, 50)
      try { localStorage.setItem('eyeReadingHistory', JSON.stringify(this.history)) } catch (e) {}
      this.page = 'result'
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: linear-gradient(135deg, #eef4ff 0%, #f8ecff 100%);
  color: #333;
}
#app {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
}
#app > .page, #app > .modal-mask {
  transform: scale(var(--scale, 1));
  transform-origin: center center;
}
.page {
  width: 1200px; height: 720px;
  background: rgba(255,255,255,0.85);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(80,80,120,0.15);
  padding: 40px;
  display: flex; flex-direction: column;
  align-items: center;
  position: relative;
}
.lang-btn {
  position: fixed; top: 20px; right: 20px;
  padding: 10px 22px; border-radius: 24px;
  border: 2px solid #6a68ff; background: #fff; color: #6a68ff;
  cursor: pointer; font-weight: 700; font-size: 18px;
  min-width: 70px;
  box-shadow: 0 4px 14px rgba(106,104,255,0.2);
  z-index: 20;
  transition: all .2s;
}
.lang-btn:hover { background: #6a68ff; color: #fff; }
.title { font-size: 56px; color: #4b48c6; margin-top: 60px; }
.subtitle { font-size: 20px; color: #666; margin-top: 20px; text-align: center; max-width: 700px; }
.home-card {
  margin-top: 50px;
  background: #fff;
  border-radius: 20px;
  padding: 36px 48px;
  box-shadow: 0 12px 32px rgba(80,80,140,0.15);
  border: 1px solid rgba(106,104,255,0.15);
  display: flex; flex-direction: column; gap: 18px;
  min-width: 320px;
}
.btn {
  min-width: 140px; padding: 14px 28px;
  border-radius: 30px; border: 2px solid #6a68ff;
  background: #fff; color: #6a68ff; font-size: 18px; cursor: pointer;
  transition: all .2s;
}
.btn.big { padding: 18px 36px; font-size: 22px; min-width: 240px; font-weight: 600; }
.btn:hover:not(:disabled) { background: #6a68ff; color: #fff; }
.btn.primary { background: #6a68ff; color: #fff; }
.btn.primary:hover:not(:disabled) { background: #4b48c6; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn.small { min-width: 80px; padding: 8px 16px; font-size: 14px; }

.rules-page, .history-page { overflow: hidden; }
.rules-content { flex: 1; overflow: auto; margin: 20px 0; width: 100%; }
.rules-content p { margin: 12px 0; font-size: 16px; line-height: 1.6; }
.rule-table, .history-table {
  width: 100%; border-collapse: collapse; margin-top: 16px;
  background: #fff;
}
.rule-table th, .rule-table td, .history-table th, .history-table td {
  padding: 10px 8px; border: 1px solid #ddd; text-align: center; font-size: 14px;
}
.rule-table th, .history-table th { background: #eeecff; color: #4b48c6; }
.history-table { font-size: 13px; }
.empty { flex: 1; display: flex; align-items: center; justify-content: center; color: #999; font-size: 20px; }

.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
}
.modal {
  background: #fff; border-radius: 20px; padding: 32px;
  min-width: 520px; max-width: 800px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; align-items: center;
}
.modal.small-modal { min-width: 320px; }
.modal h3 { color: #4b48c6; margin-bottom: 20px; font-size: 28px; font-weight: 700; }
.modal-actions { margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.modal-actions .btn { font-size: 20px; font-weight: 700; padding: 14px 32px; }
.duration-btns { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 8px; }

/* 时长选择页 */
.duration-page { justify-content: center; align-items: center; }
.duration-title { font-size: 40px; color: #4b48c6; margin-bottom: 20px; font-weight: 700; }
.duration-options { display: flex; gap: 40px; margin: 40px 0; flex-wrap: wrap; justify-content: center; }
.duration-btn {
  width: 220px; height: 220px;
  border-radius: 32px; border: 5px solid #6a68ff;
  background: #fff; color: #6a68ff;
  font-size: 44px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(106,104,255,0.15);
}
.duration-btn:hover, .duration-btn.active {
  background: #6a68ff; color: #fff; transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(106,104,255,0.35);
}
.duration-controls { display: flex; gap: 24px; margin-top: 20px; }

.tutorial-body { width: 100%; }
.tutorial-visual { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.demo-img { width: 260px; height: 260px; object-fit: cover; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); background: #eee; }
.demo-img.half { object-position: top; height: 180px; width: 260px; object-fit: cover; }
.demo-img.eyes { height: 120px; width: 320px; object-fit: cover; object-position: center; }
.demo-options { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.tutorial-hint { text-align: center; color: #666; font-size: 14px; margin-top: 8px; }

/* 游戏页 */
.game-page { padding: 24px; }
.hud {
  width: 100%; display: grid; grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}
.hud-left { display: flex; gap: 24px; font-weight: 600; color: #4b48c6; font-size: 18px; }
.hud-center { text-align: center; font-size: 22px; font-weight: 600; color: #333; }
.hud-right { text-align: right; }
.qbar { width: 100%; margin-top: 20px; display: flex; align-items: center; gap: 12px; }
.qtimer { flex: 1; height: 10px; background: #eaeaf5; border-radius: 5px; overflow: hidden; }
.qtimer-bar { height: 100%; background: linear-gradient(90deg, #6a68ff, #b48bff); transition: width .1s linear; }
.qtimer-txt { width: 40px; text-align: right; font-weight: 600; color: #666; }

.game-body { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
.q-img {
  max-width: 420px; max-height: 420px;
  border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  background: #eee;
}
.q-img.half { max-height: 260px; object-fit: cover; object-position: top; width: 420px; }
.q-img.eyes { max-height: 180px; object-fit: cover; width: 480px; }
.options {
  display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;
  max-width: 800px;
}
.op-btn {
  min-width: 160px; padding: 20px 36px;
  border-radius: 36px; border: 3px solid #6a68ff;
  background: #fff; color: #6a68ff; font-size: 28px; font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  outline: none;
}
.op-btn:focus { outline: none; }
@media (hover: hover) {
  .op-btn:hover:not(:disabled):not(.correct):not(.wrong) { background: #6a68ff; color: #fff; }
}
.options.no-hover .op-btn { pointer-events: none; }
.options.no-hover .op-btn:hover { background: #fff !important; color: #6a68ff !important; }
.op-btn.correct { background: #29c26d; border-color: #29c26d; color: #fff; }
.op-btn.wrong { background: #ff5b6a; border-color: #ff5b6a; color: #fff; }
.op-btn.disabled { cursor: default; }

.result-page { justify-content: center; }
.result-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 40px; margin: 40px 0; font-size: 20px; }
.result-btns { display: flex; gap: 16px; }

/* secondary 灰色按钮 —— 用于跳过等次要操作 */
.btn.secondary {
  border-color: #b5b5c4;
  color: #666;
  background: #f2f2f7;
}
.btn.secondary:hover:not(:disabled) { background: #d9d9e2; color: #333; }
.hud-right { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }

/* ---------- 竖屏 / 手机端优化（微信 web-view） ---------- */
@media (orientation: portrait) {
  html, body { overflow: auto; }
  #app {
    width: 100vw; height: 100vh;
    align-items: flex-start;
    padding: calc(8px + env(safe-area-inset-top)) 0 calc(8px + env(safe-area-inset-bottom));
    overflow: auto;
  }
  /* 关掉整体缩放，改用流式布局 */
  #app > .page, #app > .modal-mask { transform: none !important; }

  .page {
    width: 96vw;
    height: auto;
    min-height: calc(100vh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    padding: 20px 14px;
    border-radius: 20px;
  }

  .lang-btn {
    top: calc(10px + env(safe-area-inset-top));
    right: 12px;
    padding: 10px 18px;
    font-size: max(3.6vmin, 16px);
    min-width: 64px;
    border-width: 2px;
    border-radius: 24px;
  }

  .title { font-size: max(7vmin, 26px); margin-top: 30px; text-align: center; }
  .subtitle { font-size: max(3.6vmin, 14px); margin-top: 14px; padding: 0 12px; }

  .home-card {
    margin-top: 30px;
    padding: 22px 20px;
    width: 86%;
    min-width: 0;
    border-radius: 20px;
  }

  .btn {
    min-width: 0;
    padding: 12px 20px;
    font-size: max(3.8vmin, 15px);
    border-radius: 24px;
  }
  .btn.big {
    width: 100%;
    padding: 16px 20px;
    font-size: max(4.4vmin, 18px);
    min-width: 0;
    border-radius: 28px;
  }
  .btn.small {
    padding: 8px 14px;
    font-size: max(3.2vmin, 13px);
    min-width: 0;
  }

  /* 规则/历史 */
  h2 { font-size: max(5vmin, 20px); text-align: center; }
  .rules-content p { font-size: max(3.6vmin, 14px); }
  .rule-table th, .rule-table td { padding: 6px 4px; font-size: max(2.8vmin, 12px); }

  /* 历史表格改卡片 */
  .history-table, .history-table thead, .history-table tbody,
  .history-table tr, .history-table th, .history-table td { display: block; width: 100%; }
  .history-table thead { display: none; }
  .history-table tr {
    background: #fff;
    border: 1px solid #e5e5f0;
    border-radius: 12px;
    margin-bottom: 10px;
    padding: 10px 12px;
  }
  .history-table td {
    border: none;
    padding: 4px 0;
    text-align: left;
    font-size: max(3.2vmin, 13px);
    display: flex;
    justify-content: space-between;
  }
  .history-table td::before {
    content: attr(data-label);
    color: #888;
    margin-right: 12px;
  }

  /* 弹窗 */
  .modal {
    width: 92vw;
    min-width: 0;
    max-width: 92vw;
    padding: 22px 18px;
    border-radius: 18px;
  }
  .modal.small-modal { min-width: 0; width: 82vw; }
  .modal h3 { font-size: max(4.4vmin, 18px); text-align: center; }
  .modal-actions { width: 100%; gap: 10px; }
  .modal-actions .btn { flex: 1; }
  .duration-btns { gap: 12px; width: 100%; }
  .duration-btns .btn { flex: 1; min-width: 30%; }

  /* 教程演示 */
  .demo-img { width: 70vw; height: 70vw; max-width: 320px; max-height: 320px; }
  .demo-img.half { width: 70vw; height: 45vw; max-width: 320px; max-height: 200px; }
  .demo-img.eyes { width: 80vw; height: 28vw; max-width: 360px; max-height: 140px; }
  .demo-options { gap: 8px; }
  .tutorial-hint { font-size: max(3.2vmin, 13px); padding: 0 8px; }

  /* 游戏页 HUD 改两行 */
  .game-page { padding: 14px 12px; }
  .hud {
    grid-template-columns: 1fr;
    gap: 8px;
    padding-top: calc(4px + env(safe-area-inset-top));
  }
  .hud-left {
    flex-wrap: wrap;
    gap: 10px 16px;
    font-size: max(3.4vmin, 14px);
    justify-content: center;
  }
  .hud-center {
    font-size: max(3.6vmin, 14px);
    order: 3;
  }
  .hud-right {
    order: 2;
    justify-content: center;
  }

  .qbar { margin-top: 14px; }
  .qtimer-txt { font-size: max(3vmin, 12px); }

  .game-body { gap: 18px; padding-bottom: env(safe-area-inset-bottom); }
  .q-img { max-width: 80vw; max-height: 80vw; }
  .q-img.half { width: 80vw; max-height: 50vw; }
  .q-img.eyes { width: 90vw; max-height: 34vw; }

  /* 选项 3+ 列改双列 */
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    max-width: 100%;
  }
  .op-btn {
    min-width: 0;
    padding: 12px 10px;
    font-size: max(3.8vmin, 15px);
    border-radius: 24px;
  }

  /* 结算页 */
  .result-stats {
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 24px 0;
    font-size: max(3.8vmin, 15px);
    width: 100%;
    padding: 0 16px;
  }
  .result-btns { flex-direction: column; width: 82%; gap: 12px; }
  .result-btns .btn { width: 100%; }
}
</style>
