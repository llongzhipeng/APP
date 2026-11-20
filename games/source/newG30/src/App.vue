<template>
  <div id="app" :style="scaleStyle">
    <div class="stage" :class="'stage-' + scene">
      <!-- 装饰元素：店铺遮阳棚 & 装饰 -->
      <div v-if="scene !== 'game'" class="deco-awning"></div>
      <div v-if="scene === 'home'" class="deco-cloud c1"></div>
      <div v-if="scene === 'home'" class="deco-cloud c2"></div>
      <div v-if="scene === 'home'" class="deco-cloud c3"></div>
      <div v-if="scene === 'home'" class="deco-shop">
        <div class="deco-shop-window"></div>
        <div class="deco-shop-door"></div>
      </div>
      <!-- 顶部语言切换 -->
      <button
        v-if="scene !== 'game' && scene !== 'duration' && scene !== 'tutorial'"
        class="lang-btn"
        @click="toggleLang"
      >{{ lang === 'zh' ? 'EN' : '中' }}</button>

      <!-- 首页 -->
      <div v-if="scene === 'home'" class="scene home">
        <div class="title">{{ t.title }}</div>
        <div class="subtitle">{{ t.subtitle }}</div>
        <div class="home-buttons">
          <button class="main-btn primary" @click="goTutorial">{{ t.start }}</button>
          <button class="main-btn" @click="showRules = true">{{ t.rules }}</button>
          <button class="main-btn" @click="showHistory = true">{{ t.history }}</button>
          <button class="main-btn ghost">{{ t.skip }}</button>
        </div>
      </div>

      <!-- 规则介绍弹窗 -->
      <div v-if="showRules" class="modal-mask" @click.self="showRules = false">
        <div class="modal">
          <div class="modal-title">{{ t.rules }}</div>
          <div class="modal-body">
            <p>{{ t.ruleText1 }}</p>
            <p>{{ t.ruleText2 }}</p>
            <p>{{ t.ruleText3 }}</p>
            <table class="rule-table">
              <thead>
                <tr>
                  <th>{{ t.difficulty }}</th>
                  <th>{{ t.complexity }}</th>
                  <th>{{ t.optionCount }}</th>
                  <th>{{ t.coef }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in difficultyConfigs" :key="d.level">
                  <td>{{ d.level }}</td>
                  <td>{{ lang === 'zh' ? d.complexityZh : d.complexityEn }}</td>
                  <td>{{ d.options }}</td>
                  <td>{{ d.coef }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button class="main-btn" @click="showRules = false">{{ t.close }}</button>
        </div>
      </div>

      <!-- 历史记录弹窗 -->
      <div v-if="showHistory" class="modal-mask" @click.self="showHistory = false">
        <div class="modal wide">
          <div class="modal-title">{{ t.history }}</div>
          <div class="modal-body">
            <table class="history-table" v-if="history.length">
              <thead>
                <tr>
                  <th>{{ t.trainTime }}</th>
                  <th>{{ t.trainItem }}</th>
                  <th>{{ t.difficulty }}</th>
                  <th>{{ t.duration }}</th>
                  <th>{{ t.total }}</th>
                  <th>{{ t.success }}</th>
                  <th>{{ t.fail }}</th>
                  <th>{{ t.successRate }}</th>
                  <th>{{ t.avgRt }}</th>
                  <th>{{ t.score }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(h, i) in history" :key="i">
                  <td>{{ h.date }}</td>
                  <td>{{ t.title }}</td>
                  <td>{{ h.finalDifficulty }}</td>
                  <td>{{ h.duration }}s</td>
                  <td>{{ h.total }}</td>
                  <td>{{ h.correct }}</td>
                  <td>{{ h.wrong }}</td>
                  <td>{{ h.rate }}%</td>
                  <td>{{ h.avgRt }}s</td>
                  <td>{{ h.score }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty">{{ t.noHistory }}</div>
          </div>
          <button class="main-btn" @click="showHistory = false">{{ t.close }}</button>
        </div>
      </div>

      <!-- 教程 -->
      <div v-if="scene === 'tutorial'" class="scene tutorial">
        <div class="tutorial-body">
          <div class="demo-scene">
            <div class="demo-store">
              <img :src="tutorialSteps[tutorialStep].img" class="demo-customer" />
              <div class="demo-bubble" v-if="tutorialSteps[tutorialStep].bubble">
                {{ tutorialSteps[tutorialStep].bubble }}
              </div>
            </div>
            <div class="demo-options">
              <button
                v-for="(opt, i) in tutorialSteps[tutorialStep].options"
                :key="i"
                class="opt-btn"
                :class="{
                  correct: tutorialSteps[tutorialStep].reveal && opt.correct,
                  wrong: tutorialSteps[tutorialStep].reveal && opt.wrong
                }"
              >{{ opt.label }}</button>
            </div>
          </div>
        </div>
        <div class="tutorial-title">{{ t.tutorial }} ({{ tutorialStep + 1 }}/{{ tutorialSteps.length }})</div>
        <div class="tutorial-controls">
          <button class="main-btn" :disabled="tutorialStep === 0" @click="tutorialStep--">{{ t.prev }}</button>
          <button class="main-btn ghost" @click="onTutorialDone">{{ t.skipTutorial }}</button>
          <button v-if="tutorialStep < tutorialSteps.length - 1" class="main-btn primary" @click="tutorialStep++">{{ t.next }}</button>
          <button v-else class="main-btn primary" @click="onTutorialDone">{{ t.done }}</button>
        </div>
      </div>

      <!-- 时长选择 -->
      <div v-if="scene === 'duration'" class="scene duration">
        <div class="title">{{ t.chooseDuration }}</div>
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
          <button class="main-btn" @click="scene = 'home'">{{ t.back }}</button>
          <button class="main-btn primary" type="button" @click="startGame()">{{ t.start }}</button>
        </div>
      </div>

      <!-- 游戏中 -->
      <div v-if="scene === 'game'" class="scene game">
        <!-- 背景层：welcome阶段用bac.png，answering阶段用表情图 -->
        <div class="game-bg" :style="gameBgStyle"></div>
        <div class="game-bg-overlay"></div>

        <div class="hud">
          <div class="hud-item">{{ t.difficulty }}: {{ difficulty }}</div>
          <div class="hud-item">{{ t.score }}: {{ score }}</div>
          <div class="hud-item">{{ t.timeLeft }}: {{ remainingTime }}s</div>
        </div>
        <div class="hud-actions">
          <button v-if="showBatchSkip" class="return-btn" type="button" @click="onBatchSkip">{{ t.skipGame || '跳过' }}</button>
          <button class="return-btn" type="button" @click="onReturnClick">{{ t.return }}</button>
        </div>

        <!-- welcome阶段：展示欢迎语 -->
        <div v-if="gamePhase === 'welcome'" class="welcome-banner">
          <div class="welcome-emoji">🦌</div>
          <div class="welcome-text">{{ t.welcome }}</div>
        </div>

        <!-- answering阶段：展示题目 -->
        <template v-if="gamePhase === 'answering' && currentQuestion">
          <div class="prompt">
            <span class="bell">🔔</span> {{ t.gamePrompt }}
          </div>
          <div class="timer-bar" v-if="optionsVisible">
            <div class="timer-bar-inner" :style="{ width: (questionTimeLeft / 15 * 100) + '%' }"></div>
          </div>
          <div class="options" v-if="optionsVisible">
            <button
              v-for="opt in currentQuestion.options"
              :key="opt.key"
              class="opt-btn"
              :class="{
                correct: revealed && opt.key === currentQuestion.correct,
                wrong: revealed && selectedKey === opt.key && opt.key !== currentQuestion.correct
              }"
              :disabled="revealed || paused"
              @click="selectAnswer(opt.key)"
            >{{ opt.label }}</button>
          </div>
        </template>

        <!-- 返回确认 -->
        <div v-if="showReturnConfirm" class="modal-mask">
          <div class="modal">
            <div class="modal-title">{{ t.confirmReturn }}</div>
            <div class="modal-controls">
              <button class="main-btn" @click="resumeGame">{{ t.cancel }}</button>
              <button class="main-btn primary" @click="abortLeave">{{ t.confirm }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 结束 -->
      <div v-if="scene === 'end'" class="scene end">
        <div class="title">{{ t.gameOver }}</div>
        <div class="result">
          <div class="result-row"><span>{{ t.score }}:</span><b>{{ lastRecord.score }}</b></div>
          <div class="result-row"><span>{{ t.total }}:</span><b>{{ lastRecord.total }}</b></div>
          <div class="result-row"><span>{{ t.success }}:</span><b>{{ lastRecord.correct }}</b></div>
          <div class="result-row"><span>{{ t.fail }}:</span><b>{{ lastRecord.wrong }}</b></div>
          <div class="result-row"><span>{{ t.successRate }}:</span><b>{{ lastRecord.rate }}%</b></div>
          <div class="result-row"><span>{{ t.avgRt }}:</span><b>{{ lastRecord.avgRt }}s</b></div>
        </div>
        <div class="end-controls">
          <button class="main-btn" @click="returnToTraining">{{ t.backHome }}</button>
          <button v-if="!isHosted" class="main-btn primary" @click="goTutorial">{{ t.playAgain }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame, isActiveBatchGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import { resolveImage, resolveVoice } from './assets.js'

const GAME_TYPE = 'bqblbd'

const EMOTIONS = ['happy', 'anger', 'sad', 'Scared', 'Surprised', 'Disgusted', 'Calm']
const EMOTION_LABELS = {
  zh: { happy: '开心', anger: '愤怒', sad: '悲伤', Scared: '害怕', Surprised: '惊讶', Disgusted: '厌恶', Calm: '平静' },
  en: { happy: 'Happy', anger: 'Angry', sad: 'Sad', Scared: 'Scared', Surprised: 'Surprised', Disgusted: 'Disgusted', Calm: 'Calm' }
}
const DIFFICULTY_CONFIGS = [
  { level: 1, folder: 'Exaggerated', options: 2, coef: 1,   complexityZh: '夸张明显', complexityEn: 'Exaggerated' },
  { level: 2, folder: 'Exaggerated', options: 3, coef: 1.5, complexityZh: '夸张明显', complexityEn: 'Exaggerated' },
  { level: 3, folder: 'Moderate',    options: 3, coef: 2,   complexityZh: '适中变化', complexityEn: 'Moderate' },
  { level: 4, folder: 'Moderate',    options: 4, coef: 2.5, complexityZh: '适中变化', complexityEn: 'Moderate' },
  { level: 5, folder: 'tiny',        options: 3, coef: 3,   complexityZh: '细微变化', complexityEn: 'Tiny' },
  { level: 6, folder: 'tiny',        options: 4, coef: 3.5, complexityZh: '细微变化', complexityEn: 'Tiny' }
]
const I18N = {
  zh: {
    title: '表情便利店', subtitle: '识别顾客的表情，帮助他们！',
    start: '开始游戏', rules: '规则介绍', history: '历史记录', skip: '跳过游戏', skipGame: '跳过游戏',
    close: '关闭',
    ruleText1: '虚拟便利店，顾客带着不同表情来购物，请你观察顾客的面部表情识别其情绪。',
    ruleText2: '共七种表情：开心/愤怒/悲伤/害怕/惊讶/厌恶/平静。每题最长答题时间15秒。',
    ruleText3: '答对得分 = 5 × 难度系数。系统每60秒根据正确率自动调整难度。',
    difficulty: '难度', complexity: '表情复杂度', optionCount: '选项数量', coef: '难度系数',
    tutorial: '游戏教程', prev: '上一步', next: '下一步', skipTutorial: '跳过教程', done: '开始游戏',
    chooseDuration: '选择训练时长', min: '分钟', back: '返回',
    timeLeft: '剩余时间', score: '得分', return: '返回', gamePrompt: '这位客人是什么表情呢？选一选下面那个按钮。',
    welcome: '欢迎来到小鹿便利店！今天有好多客人要来，我们一起来帮助他们吧。',
    confirmReturn: '确定要结束本次游戏吗？', cancel: '取消', confirm: '确定',
    gameOver: '本次游戏结束',
    trainTime: '训练时间', trainItem: '训练项目', duration: '时长',
    total: '总次数', success: '成功次数', fail: '失败次数', successRate: '成功率', avgRt: '平均反应时长',
    noHistory: '暂无历史记录', backHome: '回到首页', playAgain: '再来一局'
  },
  en: {
    title: 'Emotion Store', subtitle: 'Recognize customer emotions to help them!',
    start: 'Start', rules: 'Rules', history: 'History', skip: 'Skip', skipGame: 'Skip Game',
    close: 'Close',
    ruleText1: 'A virtual convenience store — customers arrive with different expressions. Observe their faces and identify each emotion.',
    ruleText2: 'Seven emotions: Happy/Angry/Sad/Scared/Surprised/Disgusted/Calm. Max 15 seconds per question.',
    ruleText3: 'Score per correct answer = 5 × difficulty coefficient. Difficulty auto-adjusts every 60s based on accuracy.',
    difficulty: 'Level', complexity: 'Expression', optionCount: 'Options', coef: 'Coef',
    tutorial: 'Tutorial', prev: 'Prev', next: 'Next', skipTutorial: 'Skip', done: 'Start',
    chooseDuration: 'Choose Duration', min: 'min', back: 'Back',
    timeLeft: 'Time', score: 'Score', return: 'Back', gamePrompt: "What's this customer's emotion? Tap a button below.",
    welcome: 'Welcome to Little Deer Store! Many customers are coming — let\'s help them together!',
    confirmReturn: 'End this game?', cancel: 'Cancel', confirm: 'Confirm',
    gameOver: 'Game Over',
    trainTime: 'Time', trainItem: 'Item', duration: 'Duration',
    total: 'Total', success: 'Correct', fail: 'Wrong', successRate: 'Rate', avgRt: 'Avg RT',
    noHistory: 'No history yet', backHome: 'Home', playAgain: 'Play again'
  }
}

export default {
  name: 'App',
  data() {
    return {
      lang: 'zh',
      scene: 'home', // home | tutorial | duration | game | end
      showRules: false,
      showHistory: false,
      // tutorial
      tutorialStep: 0,
      // game
      selectedDuration: 60,
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      remainingTime: 0,
      currentQuestion: null,
      gamePhase: 'welcome', // welcome | answering
      optionsVisible: false,
      revealed: false,
      selectedKey: null,
      paused: false,
      showReturnConfirm: false,
      currentAudio: null,
      // timers
      gameTimer: null,
      questionTimer: null,
      windowTimer: null,
      nextQuestionTimer: null,
      pausedAt: 0,
      questionTimeLeft: 15,
      questionStart: 0,
      // stats
      windowStats: { correct: 0, total: 0 },
      answers: [], // { correct, rt, difficulty }
      history: [],
      lastRecord: {},
      // scale
      scale: 1,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    t() { return I18N[this.lang] },
    scaleStyle() { return { '--scale': this.scale } },
    isHosted() { return isActiveBatchGame(GAME_TYPE) },
    difficultyConfigs() { return DIFFICULTY_CONFIGS },
    currentConfig() { return DIFFICULTY_CONFIGS.find(d => d.level === this.difficulty) },
    gameBgStyle() {
      if (this.gamePhase === 'answering' && this.currentQuestion) {
        return { backgroundImage: `url('${this.currentQuestion.image}')` }
      }
      return { backgroundImage: `url('${resolveImage('/images/bac.png')}')` }
    },
    tutorialSteps() {
      const t = this.t
      return [
        {
          img: resolveImage('/images/Exaggerated/happy/1.png'),
          bubble: this.lang === 'zh' ? '这位客人是什么表情？' : "What's this customer's emotion?",
          options: [
            { label: t.zh || EMOTION_LABELS[this.lang].happy, correct: false },
            { label: EMOTION_LABELS[this.lang].sad, correct: false }
          ].map((_, i) => i === 0
            ? { label: EMOTION_LABELS[this.lang].happy }
            : { label: EMOTION_LABELS[this.lang].sad })
        },
        {
          img: resolveImage('/images/Exaggerated/happy/1.png'),
          bubble: this.lang === 'zh' ? '点击你认为正确的选项' : 'Tap the correct option',
          options: [
            { label: EMOTION_LABELS[this.lang].happy },
            { label: EMOTION_LABELS[this.lang].sad }
          ]
        },
        {
          img: resolveImage('/images/Exaggerated/happy/1.png'),
          bubble: this.lang === 'zh' ? '答对了！获得分数。' : 'Correct! You get points.',
          reveal: true,
          options: [
            { label: EMOTION_LABELS[this.lang].happy, correct: true },
            { label: EMOTION_LABELS[this.lang].sad }
          ]
        },
        {
          img: resolveImage('/images/Exaggerated/anger/1.png'),
          bubble: this.lang === 'zh' ? '答错则不得分，继续下一位客人。' : 'Wrong answers get no points. Next customer.',
          reveal: true,
          options: [
            { label: EMOTION_LABELS[this.lang].happy, wrong: true },
            { label: EMOTION_LABELS[this.lang].anger, correct: true },
            { label: EMOTION_LABELS[this.lang].sad }
          ]
        }
      ]
    }
  },
  mounted() {
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    try {
      const raw = localStorage.getItem('emotion-store-history')
      if (raw) this.history = JSON.parse(raw)
    } catch (e) {}
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.selectedDuration = dur },
      openTutorial: () => { this.tutorialStep = 0; this.scene = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScale)
    this.clearAllTimers()
  },
  methods: {
    updateScale() {
      const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800)
      this.scale = s
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    playVoice(n, onEnd) {
      try {
        const audio = new Audio(resolveVoice(`/voice/${this.lang === 'zh' ? 'chinese' : 'english'}/${n}.mp3`))
        this.currentAudio = audio
        const finish = () => {
          if (this.currentAudio !== audio) return
          this.currentAudio = null
          if (this.scene === 'game') onEnd?.()
        }
        audio.addEventListener('ended', finish, { once: true })
        audio.addEventListener('error', finish, { once: true })
        audio.play().catch(finish)
        return audio
      } catch (e) {
        if (onEnd) onEnd()
      }
    },
    goTutorial() {
      this.tutorialStep = 0
      this.scene = 'tutorial'
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.scene = 'duration'
    },
    onBatchSkip() { skipPbBatchGame() },
    /**
     * <summary>
     * 开始对局；dur 须为秒数（勿把点击事件传入）
     * </summary>
     */
    startGame(dur) {
      if (typeof dur === 'number' && Number.isFinite(dur) && dur > 0) {
        this.selectedDuration = dur
      }
      const durationSec = Number(this.selectedDuration) // 训练总时长（秒）
      this.selectedDuration = (Number.isFinite(durationSec) && durationSec > 0) ? durationSec : 60
      this.difficulty = getBatchStartDifficultyForGame(GAME_TYPE)
      this.score = 0
      this.answers = []
      this.windowStats = { correct: 0, total: 0 }
      this.remainingTime = this.selectedDuration
      this.scene = 'game'
      this.paused = false
      this.gamePhase = 'welcome'
      this.revealed = false
      this.currentQuestion = null
      this.startGameTimer()
      this.startWindowTimer()
      // 播放欢迎语（bac.png 背景）——播完后再来第一位客人
      this.playVoice(1, () => {
        if (this.scene === 'game') this.nextQuestion()
      })
    },
    startGameTimer() {
      this.clearTimer('gameTimer')
      this.gameTimer = setInterval(() => {
        if (this.paused) return
        this.remainingTime--
        if (this.remainingTime <= 0) {
          this.endGame(false)
        }
      }, 1000)
    },
    startWindowTimer() {
      this.clearTimer('windowTimer')
      this.windowTimer = setInterval(() => {
        if (this.paused) return
        this.adjustDifficulty()
      }, 60000)
    },
    adjustDifficulty() {
      const { correct, total } = this.windowStats
      if (total > 0) {
        const rate = correct / total
        if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
        else if (rate < 0.7 && this.difficulty > 1) this.difficulty--
      }
      this.windowStats = { correct: 0, total: 0 }
    },
    nextQuestion() {
      this.revealed = false
      this.selectedKey = null
      this.optionsVisible = false
      const cfg = this.currentConfig
      const correct = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
      const imgIdx = Math.floor(Math.random() * 2) + 1
      const image = resolveImage(`/images/${cfg.folder}/${correct}/${imgIdx}.png`)
      const pool = EMOTIONS.filter(e => e !== correct)
      const distractors = []
      while (distractors.length < cfg.options - 1) {
        const idx = Math.floor(Math.random() * pool.length)
        distractors.push(pool.splice(idx, 1)[0])
      }
      const keys = [correct, ...distractors].sort(() => Math.random() - 0.5)
      const options = keys.map(k => ({ key: k, label: EMOTION_LABELS[this.lang][k] }))
      this.currentQuestion = { image, correct, options }

      // 门铃响 → 切换背景 → 依次播放 2、3、4.mp3；4.mp3播放完毕后再出现选项并开始计时
      this.gamePhase = 'answering'
      this.questionTimeLeft = 15
      this.playVoice(2, () => {
        if (this.scene !== 'game') return
        this.playVoice(3, () => {
          if (this.scene !== 'game') return
          this.playVoice(4, () => {
            if (this.scene !== 'game') return
            this.optionsVisible = true
            this.startQuestionTimer()
          })
        })
      })
    },
    startQuestionTimer() {
      this.questionStart = Date.now()
      this.questionTimeLeft = 15
      this.clearTimer('questionTimer')
      this.questionTimer = setInterval(() => {
        if (this.paused) return
        this.questionTimeLeft -= 0.1
        if (this.questionTimeLeft <= 0) {
          this.recordAnswer(null)
        }
      }, 100)
    },
    selectAnswer(key) {
      if (this.paused || this.revealed || !this.questionTimer) return
      this.selectedKey = key
      this.recordAnswer(key)
    },
    recordAnswer(key) {
      this.clearTimer('questionTimer')
      this.revealed = true
      const rt = (Date.now() - this.questionStart) / 1000
      const isCorrect = key === this.currentQuestion.correct
      this.answers.push({ correct: isCorrect, rt: Math.min(rt, 15), difficulty: this.difficulty })
      this.windowStats.total++
      if (isCorrect) {
        this.windowStats.correct++
        this.score += Math.round(5 * this.currentConfig.coef * 10) / 10
      }
      this.nextQuestionTimer = setTimeout(() => {
        this.nextQuestionTimer = null
        if (!this.paused && this.scene === 'game' && this.remainingTime > 0) this.nextQuestion()
      }, 1000)
    },
    onReturnClick() {
      this.pausedAt = Date.now()
      this.paused = true
      this.showReturnConfirm = true
      if (this.currentAudio) { try { this.currentAudio.pause() } catch (e) {} }
    },
    resumeGame() {
      this.showReturnConfirm = false
      this.paused = false
      if (this.questionTimer) this.questionStart += Date.now() - this.pausedAt
      const audio = this.currentAudio
      if (audio?.paused && !audio.ended) {
        audio.play().catch(() => audio.dispatchEvent(new Event('error')))
      }
      if (this.revealed && !this.nextQuestionTimer) this.nextQuestion()
    },
    endGame(userQuit) {
      this.clearAllTimers()
      this.paused = false
      this.showReturnConfirm = false
      const total = this.answers.length
      const correct = this.answers.filter(a => a.correct).length
      const wrong = total - correct
      const rate = total ? Math.round(correct / total * 100) : 0
      const avgRt = total ? (this.answers.reduce((s, a) => s + a.rt, 0) / total).toFixed(2) : '0'
      const rec = {
        date: new Date().toLocaleString(),
        finalDifficulty: this.difficulty,
        duration: this.selectedDuration,
        total, correct, wrong, rate, avgRt,
        score: Math.round(this.score * 10) / 10
      }
      this.lastRecord = rec
      this.history.unshift(rec)
      try { localStorage.setItem('emotion-store-history', JSON.stringify(this.history.slice(0, 50))) } catch (e) {}
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgRt),
        score: rec.score ? Math.round(rec.score) : 0,
        successCount: correct || 0,
        failCount: wrong || 0,
        trainDuration: this.selectedDuration,
        difficultyLevel: this.difficulty || 1,
      })
      this.scene = 'end'
    },
    abortLeave() {
      this.clearAllTimers()
      this.paused = false
      this.showReturnConfirm = false
      this.returnToTraining()
    },
    returnToTraining() {
      if (this.isHosted) leavePbGameWindow({ confirm: false })
      else this.scene = 'home'
    },
    clearTimer(name) {
      if (this[name]) { clearInterval(this[name]); this[name] = null }
    },
    clearAllTimers() {
      this.clearTimer('gameTimer')
      this.clearTimer('questionTimer')
      this.clearTimer('windowTimer')
      clearTimeout(this.nextQuestionTimer)
      this.nextQuestionTimer = null
      const audio = this.currentAudio
      this.currentAudio = null
      audio?.pause()
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%; overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #ffe0b2, #ffccbc);
}
#app {
  position: relative;
}
.stage {
  position: absolute;
  top: 50%; left: 50%;
  width: 1280px; height: 800px;
  transform: translate(-50%, -50%) scale(var(--scale, 1));
  transform-origin: center center;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
}
/* 各场景独立背景（非游戏场景不再使用 bac.png） */
.stage-home, .stage-tutorial, .stage-duration, .stage-end {
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(255,255,255,0.4), transparent 40%),
    linear-gradient(160deg, #ffe0b2 0%, #ffab91 60%, #ff8a65 100%);
}
.stage-game { background: #263238; }

/* 装饰：遮阳棚条纹 */
.deco-awning {
  position: absolute; top: 0; left: 0; right: 0; height: 90px;
  background: repeating-linear-gradient(90deg,
    #e53935 0 60px, #fff 60px 120px);
  border-bottom: 6px solid #b71c1c;
  z-index: 1;
}
.deco-awning::after {
  content: ''; position: absolute; left: 0; right: 0; top: 100%;
  height: 24px;
  background:
    radial-gradient(circle at 30px 0, #b71c1c 22px, transparent 23px) repeat-x;
  background-size: 60px 24px;
}
.deco-cloud {
  position: absolute; background: rgba(255,255,255,0.85);
  border-radius: 50%; z-index: 1;
  box-shadow:
    40px 10px 0 -6px rgba(255,255,255,0.85),
    -40px 8px 0 -8px rgba(255,255,255,0.85);
}
.deco-cloud.c1 { width: 100px; height: 50px; top: 140px; left: 100px; }
.deco-cloud.c2 { width: 140px; height: 60px; top: 180px; right: 140px; }
.deco-cloud.c3 { width: 90px; height: 45px; top: 260px; left: 45%; }
.deco-shop {
  position: absolute; bottom: 0; left: 0; right: 0; height: 200px;
  background: linear-gradient(180deg, #fff8e1 0%, #ffe082 100%);
  border-top: 6px solid #d4a017;
  z-index: 1;
}
.deco-shop-window {
  position: absolute; bottom: 60px; left: 80px; width: 220px; height: 100px;
  background: rgba(179, 229, 252, 0.7);
  border: 6px solid #6d4c41; border-radius: 8px;
  box-shadow: inset 0 0 0 4px #fff;
}
.deco-shop-door {
  position: absolute; bottom: 0; right: 120px; width: 120px; height: 160px;
  background: #6d4c41; border-radius: 60px 60px 0 0;
  border: 6px solid #4e342e;
}
.deco-shop-door::after {
  content: '●'; color: #ffd54f; font-size: 14px;
  position: absolute; top: 50%; left: 12px;
}

/* 通用按钮 */
.main-btn {
  padding: 14px 40px;
  font-size: 22px;
  border: 3px solid #ff8a65;
  border-radius: 50px;
  background: #fff;
  color: #ff5722;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.15s, box-shadow 0.15s;
  min-width: 180px;
}
.main-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(255,87,34,0.25); }
.main-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.main-btn.primary { background: #ff5722; color: #fff; }
.main-btn.ghost { background: transparent; }

.lang-btn {
  position: absolute; top: 20px; right: 20px;
  width: 60px; height: 60px; border-radius: 50%;
  background: #fff; border: 3px solid #ff8a65;
  color: #ff5722; font-size: 20px; font-weight: 700;
  cursor: pointer; z-index: 10;
}

.scene {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px;
  z-index: 2;
}
.title { font-size: 56px; color: #d84315; font-weight: 800; margin-bottom: 16px; text-shadow: 2px 2px 0 #fff; }
.subtitle { font-size: 24px; color: #6d4c41; margin-bottom: 40px; }

/* 首页 */
.home-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.home-buttons .main-btn { min-width: 240px; }

/* 弹窗 */
.modal-mask {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 20;
}
.modal {
  background: #fff; padding: 32px; border-radius: 20px;
  min-width: 480px; max-width: 900px; max-height: 700px;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px;
}
.modal.wide { min-width: 900px; }
.modal-title { font-size: 32px; font-weight: 700; color: #d84315; }
.modal-body { font-size: 18px; color: #444; line-height: 1.8; text-align: left; overflow: auto; max-height: 500px; }
.modal-body p { margin-bottom: 8px; }
.modal-controls { display: flex; gap: 20px; }
.rule-table, .history-table {
  width: 100%; border-collapse: collapse; margin-top: 12px;
}
.rule-table th, .rule-table td,
.history-table th, .history-table td {
  border: 1px solid #ffab91; padding: 8px 12px; text-align: center;
}
.rule-table th, .history-table th { background: #ffccbc; color: #bf360c; }
.history-table { font-size: 14px; }
.empty { padding: 40px; color: #999; font-size: 18px; text-align: center; }

/* 教程 */
.tutorial-title {
  font-size: 32px; color: #fff; font-weight: 700;
  background: #d84315; padding: 10px 32px; border-radius: 30px;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  margin: 20px 0 16px;
}
.tutorial-body { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
.demo-scene { display: flex; flex-direction: column; align-items: center; gap: 30px; }
.demo-store { position: relative; }
.demo-customer { width: 260px; height: 260px; object-fit: contain; background: #fffde7; border-radius: 20px; padding: 12px; border: 4px solid #ffb74d; }
.demo-bubble {
  position: absolute; top: -20px; left: 100%; margin-left: 20px;
  background: #fff; padding: 12px 20px; border-radius: 20px;
  border: 3px solid #ff8a65; color: #6d4c41; font-size: 18px;
  white-space: nowrap;
}
.demo-options { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.tutorial-controls { display: flex; gap: 20px; margin-top: 24px; }

/* 时长选择 */
.duration-options { display: flex; gap: 32px; margin: 40px 0; }
.duration-btn {
  width: 200px; height: 200px;
  border-radius: 30px; border: 5px solid #ff8a65;
  background: #fff; color: #ff5722;
  font-size: 40px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.duration-btn:hover, .duration-btn.active {
  background: #ff5722; color: #fff; transform: scale(1.05);
}
.duration-controls { display: flex; gap: 20px; }

/* 游戏中 */
.game { padding: 20px; justify-content: flex-end; z-index: 2; }
.game-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.3s ease-in-out;
  z-index: 0;
}
.game-bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.55) 100%);
  z-index: 0;
}
.hud {
  position: absolute; top: 24px; left: 24px;
  display: flex; flex-direction: column; gap: 8px;
  background: rgba(255,255,255,0.92); padding: 14px 20px;
  border-radius: 16px; border: 3px solid #ffab91;
  z-index: 3;
}
.hud-item { font-size: 20px; color: #bf360c; font-weight: 700; }
.hud-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 3;
  flex-wrap: nowrap;
}
.return-btn {
  position: relative;
  top: auto;
  right: auto;
  padding: 12px 28px; border-radius: 50px;
  background: #fff; border: 3px solid #ff8a65;
  color: #ff5722; font-size: 18px; font-weight: 700; cursor: pointer;
  z-index: 3;
  white-space: nowrap;
}
.welcome-banner {
  position: relative; z-index: 2;
  margin: auto;
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.95); padding: 40px 60px;
  border-radius: 30px; border: 6px solid #ffb74d;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  max-width: 800px;
}
.welcome-emoji { font-size: 80px; margin-bottom: 16px; }
.welcome-text { font-size: 26px; color: #4e342e; text-align: center; line-height: 1.6; font-weight: 600; }

.prompt {
  position: relative; z-index: 2;
  align-self: center;
  font-size: 24px; color: #4e342e; font-weight: 700;
  background: rgba(255,255,255,0.95); padding: 14px 32px; border-radius: 40px;
  border: 3px solid #ffb74d;
  margin-bottom: 16px;
}
.prompt .bell { margin-right: 8px; }
.timer-bar {
  position: relative; z-index: 2;
  align-self: center;
  width: 60%; height: 16px;
  background: rgba(255,255,255,0.5); border-radius: 8px; overflow: hidden;
  border: 2px solid rgba(255,255,255,0.8);
  margin-bottom: 20px;
}
.timer-bar-inner {
  height: 100%; background: linear-gradient(90deg, #66bb6a, #ffca28, #ef5350);
  transition: width 0.1s linear;
}
.options {
  position: relative; z-index: 2;
  display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;
  max-width: 1100px; align-self: center;
  padding-bottom: 20px;
}
.opt-btn {
  min-width: 160px; padding: 18px 32px;
  font-size: 24px; font-weight: 700;
  border: 4px solid #ff8a65; border-radius: 50px;
  background: #fff; color: #ff5722; cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
}
.opt-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255,87,34,0.4); }
.opt-btn:disabled { cursor: not-allowed; }
.opt-btn.correct { background: #66bb6a; color: #fff; border-color: #388e3c; }
.opt-btn.wrong { background: #ef5350; color: #fff; border-color: #c62828; }

/* 结束 */
.result {
  background: #fff; padding: 32px 48px; border-radius: 20px;
  border: 4px solid #ffab91; margin: 24px 0 40px;
  min-width: 480px;
}
.result-row {
  display: flex; justify-content: space-between;
  font-size: 22px; padding: 8px 0; color: #4e342e;
  border-bottom: 1px dashed #ffccbc;
}
.result-row:last-child { border-bottom: none; }
.result-row b { color: #d84315; font-size: 26px; }
.end-controls { display: flex; gap: 24px; }
</style>
