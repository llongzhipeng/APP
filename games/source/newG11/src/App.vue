<template>
  <div id="app" :style="appStyle">
    <!-- Top-right language toggle (hidden during game) -->
    <button
      v-if="screen !== 'game'"
      class="lang-btn"
      @click="toggleLang"
    >{{ lang === 'zh' ? 'EN' : '中文' }}</button>

    <!-- ================= HOME ================= -->
    <div v-if="screen === 'home'" class="home">
      <div class="title">{{ t('title') }}</div>
      <div class="subtitle">{{ t('subtitle') }}</div>
      <div class="home-btns">
        <button class="big-btn primary" @click="goStart">{{ t('startGame') }}</button>
        <button class="big-btn" @click="showRules = true">{{ t('rules') }}</button>
        <button class="big-btn" @click="showHistory = true">{{ t('history') }}</button>
      </div>
    </div>

    <!-- ================= RULES MODAL ================= -->
    <div v-if="showRules" class="modal-mask" @click.self="showRules = false">
      <div class="modal">
        <h2>{{ t('rules') }}</h2>
        <div class="rules-body">
          <p>{{ t('rule1') }}</p>
          <p>{{ t('rule2') }}</p>
          <p>{{ t('rule3') }}</p>
          <p>{{ t('rule4') }}</p>
          <table class="diff-table">
            <thead>
              <tr>
                <th>{{ t('difficulty') }}</th>
                <th>{{ t('animalCount') }}</th>
                <th>{{ t('displayTime') }}</th>
                <th>{{ t('clickTime') }}</th>
                <th>{{ t('coeff') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in DIFFICULTIES" :key="d.level">
                <td>{{ d.level }}</td>
                <td>{{ d.animalCount }}</td>
                <td>{{ d.displayTime[0] === d.displayTime[1] ? d.displayTime[0] : d.displayTime[0] + '-' + d.displayTime[1] }}s</td>
                <td>{{ d.clickTime }}s</td>
                <td>{{ d.coeff }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn" @click="showRules = false">{{ t('close') }}</button>
      </div>
    </div>

    <!-- ================= HISTORY MODAL ================= -->
    <div v-if="showHistory" class="modal-mask" @click.self="showHistory = false">
      <div class="modal wide">
        <h2>{{ t('history') }}</h2>
        <div class="history-body">
          <table class="history-table" v-if="history.length">
            <thead>
              <tr>
                <th>{{ t('trainTime') }}</th>
                <th>{{ t('project') }}</th>
                <th>{{ t('difficulty') }}</th>
                <th>{{ t('duration') }}</th>
                <th>{{ t('total') }}</th>
                <th>{{ t('success') }}</th>
                <th>{{ t('fail') }}</th>
                <th>{{ t('rate') }}</th>
                <th>{{ t('avgReact') }}</th>
                <th>{{ t('score') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(h, i) in history" :key="i">
                <td>{{ h.time }}</td>
                <td>{{ t('title') }}</td>
                <td>{{ h.difficulty }}</td>
                <td>{{ h.duration }}min</td>
                <td>{{ h.total }}</td>
                <td>{{ h.success }}</td>
                <td>{{ h.fail }}</td>
                <td>{{ h.rate }}%</td>
                <td>{{ h.avgReact }}ms</td>
                <td>{{ h.score }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty">{{ t('noHistory') }}</div>
        </div>
        <div class="modal-actions">
          <button class="btn danger" v-if="history.length" @click="clearHistory">{{ t('clear') }}</button>
          <button class="btn" @click="showHistory = false">{{ t('close') }}</button>
        </div>
      </div>
    </div>

    <!-- ================= TUTORIAL ================= -->
    <div v-if="screen === 'tutorial'" class="modal-mask">
      <div class="modal tutorial">
        <h2>{{ t('tutorial') }}</h2>
        <div class="tut-stage" :style="tutStageStyle">
          <img class="tut-bg" :src="bgSrc" alt="" />
          <!-- Tutorial animals -->
          <img
            v-for="(a, i) in tutorialAnimals"
            :key="i"
            :src="a.src"
            class="tut-animal"
            :style="{ left: a.left + '%', top: a.top + '%', width: a.size + '%' }"
          />
          <!-- Cue -->
          <div class="tut-cue" v-if="tutStep.cue === 'click'">
            <div class="tap-anim">👆</div>
            <div class="cue-text">{{ t('tutClick') }}</div>
          </div>
          <div class="tut-cue nope" v-else-if="tutStep.cue === 'noclick'">
            <div class="tap-anim">✋</div>
            <div class="cue-text">{{ t('tutNoClick') }}</div>
          </div>
          <div class="tut-cue" v-else-if="tutStep.cue === 'ok'">
            <div class="tap-anim">✅</div>
            <div class="cue-text">{{ t('tutOK') }}</div>
          </div>
        </div>
        <div class="tut-dots">
          <span v-for="i in tutorialSteps.length" :key="i" :class="{ dot: true, active: i - 1 === tutIndex }"></span>
        </div>
        <div class="tut-actions">
          <button class="btn" :disabled="tutIndex === 0" @click="prevTut">{{ t('prev') }}</button>
          <button class="btn" @click="skipTut">{{ t('skip') }}</button>
          <button class="btn primary" @click="nextTut">{{ tutIndex === tutorialSteps.length - 1 ? t('done') : t('next') }}</button>
        </div>
      </div>
    </div>

    <!-- ================= DURATION SELECTION ================= -->
    <div v-if="screen === 'duration'" class="modal-mask">
      <div class="modal">
        <h2>{{ t('chooseDuration') }}</h2>
        <div class="duration-options">
          <div
            v-for="m in [1, 3, 5]"
            :key="m"
            class="dur-btn"
            :class="{ selected: selectedDuration === m }"
            @click="selectedDuration = m"
          >
            <div class="dur-icon">⏱</div>
            <div class="dur-value">{{ m }} {{ t('minute') }}</div>
          </div>
        </div>
        <div class="modal-actions" style="justify-content: space-between;">
          <button class="btn" @click="screen = 'home'">{{ t('back') }}</button>
          <button class="btn primary" :disabled="!selectedDuration" @click="startGame(selectedDuration)">
            {{ t('startGame') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ================= GAME ================= -->
    <div v-if="screen === 'game'" class="game" @click="onGameClick">
      <img class="game-bg" :src="bgSrc" alt="" />

      <!-- HUD Top-left -->
      <div class="hud hud-left">
        <div>{{ t('difficulty') }}: <b>{{ currentDifficulty.level }}</b></div>
        <div>{{ t('score') }}: <b>{{ score }}</b></div>
        <div>{{ t('timeLeft') }}: <b>{{ formatTime(gameTimeLeft) }}</b></div>
      </div>

      <!-- Center prompt -->
      <div class="hud hud-center">{{ t('prompt') }}</div>

      <!-- Skip button (placeholder) -->
      <button v-if="showBatchSkip" class="hud hud-skip btn small" @click.stop="onSkipClick">{{ t('skipGame') }}</button>

      <!-- Back button top-right -->
      <button class="hud hud-right btn small" @click.stop="quitGame">{{ t('quit') }}</button>

      <!-- Animals area -->
      <div class="animal-zone" :style="zoneStyle">
        <img
          v-for="(a, i) in animals"
          :key="a.id"
          :src="a.src"
          class="animal"
          :style="{ left: a.left + '%', top: a.top + '%', width: a.size + 'vmin', height: a.size + 'vmin' }"
        />
      </div>

      <!-- Feedback overlay -->
      <transition name="fade">
        <div v-if="feedback" :class="['feedback', feedback.type]">
          {{ feedback.text }}
        </div>
      </transition>

      <!-- Quit confirmation (game paused while shown) -->
      <div v-if="showQuitConfirm" class="quit-mask" @click.stop>
        <div class="quit-box" @click.stop>
          <div class="quit-text">{{ t('confirmQuit') }}</div>
          <div class="quit-actions">
            <button class="btn" @click.stop="cancelQuit">{{ t('cancel') }}</button>
            <button class="btn primary" @click.stop="confirmQuit">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-if="screen === 'result'" class="modal-mask">
      <div class="modal">
        <h2>{{ t('finished') }}</h2>
        <div class="result-body">
          <div class="result-item"><span>{{ t('score') }}</span><b>{{ score }}</b></div>
          <div class="result-item"><span>{{ t('total') }}</span><b>{{ stats.total }}</b></div>
          <div class="result-item"><span>{{ t('success') }}</span><b>{{ stats.success }}</b></div>
          <div class="result-item"><span>{{ t('fail') }}</span><b>{{ stats.fail }}</b></div>
          <div class="result-item"><span>{{ t('rate') }}</span><b>{{ successRate }}%</b></div>
          <div class="result-item"><span>{{ t('avgReact') }}</span><b>{{ avgReactTime }}ms</b></div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="goHome">{{ t('backHome') }}</button>
          <button class="btn primary" @click="goStart">{{ t('playAgain') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from './assets'
const DIFFICULTIES = [
  { level: 1, animalCount: 1, displayTime: [3, 3],   clickTime: 3,   coeff: 1 },
  { level: 2, animalCount: 1, displayTime: [2, 3],   clickTime: 2,   coeff: 1.5 },
  { level: 3, animalCount: 2, displayTime: [1.7, 2.7], clickTime: 1.7, coeff: 2 },
  { level: 4, animalCount: 2, displayTime: [1.5, 2.5], clickTime: 1.5, coeff: 2.5 },
  { level: 5, animalCount: 3, displayTime: [1.5, 2.5], clickTime: 1.5, coeff: 3 },
  { level: 6, animalCount: 4, displayTime: [1.5, 2.0], clickTime: 1.5, coeff: 3.5 },
]

const I18N = {
  zh: {
    title: '寻找小猫',
    subtitle: '视觉注意力与反应速度训练',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    close: '关闭',
    clear: '清空',
    back: '返回',
    quit: '返回',
    tutorial: '游戏教程',
    prev: '上一步',
    next: '下一步',
    skip: '跳过',
    done: '开始',
    chooseDuration: '选择训练时长',
    minute: '分钟',
    difficulty: '难度',
    animalCount: '动物数量',
    displayTime: '展示时间',
    clickTime: '可点击时间',
    coeff: '难度系数',
    score: '得分',
    timeLeft: '剩余',
    prompt: '看到小猫快速点击屏幕',
    finished: '训练完成',
    total: '总次数',
    success: '成功',
    fail: '失败',
    rate: '成功率',
    avgReact: '平均反应',
    backHome: '返回首页',
    playAgain: '再玩一次',
    trainTime: '训练时间',
    project: '训练项目',
    duration: '时长',
    noHistory: '暂无记录',
    rule1: '本游戏训练选择性注意力与视觉检索能力。',
    rule2: '屏幕中会快速出现不同的动物，如果其中有小猫请快速点击屏幕，否则不要点击。',
    rule3: '每 60 秒根据正确率自动调整难度：≥90% 升级，≤70% 降级。',
    rule4: '得分 = 5 × 难度系数，每题独立计算。',
    tutClick: '有小猫，点击屏幕！',
    tutNoClick: '没有小猫，不要点击',
    tutOK: '很好！',
    correct: '正确 +',
    wrong: '错误',
    miss: '错过',
    confirmQuit: '确认结束训练并返回？',
    cancel: '取消',
    confirm: '确认',
    skipGame: '跳过',
  },
  en: {
    title: 'Find the Kitten',
    subtitle: 'Visual attention & reaction training',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    close: 'Close',
    clear: 'Clear',
    back: 'Back',
    quit: 'Quit',
    tutorial: 'Tutorial',
    prev: 'Prev',
    next: 'Next',
    skip: 'Skip',
    done: 'Start',
    chooseDuration: 'Choose Duration',
    minute: 'min',
    difficulty: 'Level',
    animalCount: 'Animals',
    displayTime: 'Display',
    clickTime: 'Click Window',
    coeff: 'Coeff',
    score: 'Score',
    timeLeft: 'Left',
    prompt: 'Tap the screen quickly when you see the kitten',
    finished: 'Session Complete',
    total: 'Rounds',
    success: 'Correct',
    fail: 'Wrong',
    rate: 'Accuracy',
    avgReact: 'Avg React',
    backHome: 'Home',
    playAgain: 'Play Again',
    trainTime: 'Time',
    project: 'Project',
    duration: 'Duration',
    noHistory: 'No records yet',
    rule1: 'Train selective attention and visual search.',
    rule2: 'Animals will appear briefly. Tap if a kitten is among them; otherwise do not tap.',
    rule3: 'Difficulty auto-adjusts every 60s: ≥90% up, ≤70% down.',
    rule4: 'Score = 5 × difficulty coefficient per correct round.',
    tutClick: 'Kitten here — tap!',
    tutNoClick: 'No kitten — do not tap',
    tutOK: 'Great!',
    correct: 'Correct +',
    wrong: 'Wrong',
    miss: 'Missed',
    confirmQuit: 'Quit the session and go back?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    skipGame: 'Skip',
  },
}

let animalIdSeq = 0

import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'xzxm'

export default {
  name: 'App',
  data() {
    return {
      DIFFICULTIES,
      screen: 'home',
      lang: 'zh',
      showRules: false,
      showHistory: false,

      // Tutorial state
      tutIndex: 0,

      // Game state
      duration: 1,               // minutes
      selectedDuration: null,    // for duration selection screen
      gameTimeLeft: 0,           // seconds
      currentDifficultyIdx: Math.max(0, getBatchStartDifficultyForGame(GAME_TYPE) - 1),   // index in DIFFICULTIES
      score: 0,
      animals: [],
      roundActive: false,
      roundHasCat: false,
      roundStartTime: 0,
      roundClickable: false,
      roundClicked: false,
      feedback: null,

      // Pause / quit-confirm state
      showQuitConfirm: false,
      isPaused: false,
      roundEndTime: 0,           // performance.now() timestamp when round should end
      clickEndTime: 0,           // performance.now() timestamp when click window closes
      adaptiveWindowStart: 0,    // performance.now() when current 60s window started
      pausedRoundRemaining: 0,
      pausedClickRemaining: 0,
      pausedAdaptiveRemaining: 0,

      // Voice reminder
      voiceAudio: null,

      // Viewport tracking (updates on resize)
      viewportW: typeof window !== 'undefined' ? window.innerWidth : 1024,
      viewportH: typeof window !== 'undefined' ? window.innerHeight : 768,

      // Stats overall
      stats: { total: 0, success: 0, fail: 0, reactTimes: [] },
      // Window stats (60s adaptive)
      windowStats: { total: 0, success: 0 },

      history: [],

      // Timers
      gameTimer: null,
      roundTimer: null,
      clickWindowTimer: null,
      adaptiveTimer: null,
      feedbackTimer: null,

      bgSrc: resolveImage('/images/bac.png'),
      archiveId: -1,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    currentDifficulty() {
      return DIFFICULTIES[this.currentDifficultyIdx]
    },
    appStyle() {
      return {}
    },
    zoneStyle() {
      // Animals appear from 50% to 85.5% of screen height.
      // On tablets / short-height screens, browsers show a bottom UI bar that
      // covers ~1/8 of the viewport, so pull the bottom edge up further.
      // Detect "tablet-like" viewports: small viewport height OR touch device with limited height.
      const safeBottom = this.isTabletLike ? 25 : 14.5
      // top = 50%, bottom = 100% - safeBottom% => height = 50 - safeBottom
      return {
        top: '50%',
        height: (50 - safeBottom) + '%',
      }
    },
    tutStageStyle() {
      return {}
    },
    tutorialSteps() {
      // Static examples: (1) only-non-cat -> don't click, (2) cat present -> click, (3) mixed -> click, (4) tap prompt to start
      return [
        { animals: [{ src: this.pickNonCat(1), left: 40, top: 30, size: 30 }], cue: 'noclick' },
        { animals: [{ src: resolveImage('/images/11.png'), left: 40, top: 30, size: 30 }], cue: 'click' },
        { animals: [
          { src: this.pickNonCat(2), left: 15, top: 30, size: 25 },
          { src: resolveImage('/images/11.png'), left: 45, top: 30, size: 25 },
          { src: this.pickNonCat(3), left: 75, top: 30, size: 25 },
        ], cue: 'click' },
        { animals: [
          { src: this.pickNonCat(4), left: 20, top: 30, size: 28 },
          { src: this.pickNonCat(5), left: 55, top: 30, size: 28 },
        ], cue: 'noclick' },
      ]
    },
    tutStep() {
      return this.tutorialSteps[this.tutIndex]
    },
    tutorialAnimals() {
      return this.tutStep.animals
    },
    successRate() {
      if (!this.stats.total) return 0
      return Math.round((this.stats.success / this.stats.total) * 100)
    },
    avgReactTime() {
      if (!this.stats.reactTimes.length) return 0
      const sum = this.stats.reactTimes.reduce((a, b) => a + b, 0)
      return Math.round(sum / this.stats.reactTimes.length)
    },
    isTabletLike() {
      // Treat as tablet-like if touch device or short viewport height,
      // in which case the browser's bottom UI often overlays the page.
      const hasTouch = typeof window !== 'undefined' &&
        (('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
      return hasTouch || this.viewportH < 900
    },
    vmin() {
      return Math.min(this.viewportW, this.viewportH) / 100
    },
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.loadHistory()
    const savedLang = localStorage.getItem('findKitten.lang')
    if (savedLang) this.lang = savedLang
  },
  mounted() {
    this._onResize = () => {
      this.viewportW = window.innerWidth
      this.viewportH = window.innerHeight
    }
    window.addEventListener('resize', this._onResize)
    window.addEventListener('orientationchange', this._onResize)
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (min) => { this.selectedDuration = min },
      openTutorial: () => { this.screen = 'tutorial'; this.tutIndex = 0 },
    })
  },
  beforeDestroy() {
    this.clearAllTimers()
    this.stopVoice()
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize)
      window.removeEventListener('orientationchange', this._onResize)
    }
  },
  methods: {
    t(key) { return I18N[this.lang][key] || key },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
      localStorage.setItem('findKitten.lang', this.lang)
    },
    pickNonCat(seed) {
      // Deterministic but seed-varied picks for tutorial
      const candidates = [1,2,3,4,5,6,7,8,9,10,12]
      return resolveImage(`/images/${candidates[(seed * 7) % candidates.length]}.png`)
    },
    randomNonCat() {
      const candidates = [1,2,3,4,5,6,7,8,9,10,12]
      return candidates[Math.floor(Math.random() * candidates.length)]
    },

    // ---------- Navigation ----------
    goStart() {
      this.tutIndex = 0
      this.screen = 'tutorial'
    },
    goHome() {
      this.screen = 'home'
    },
    prevTut() { if (this.tutIndex > 0) this.tutIndex-- },
    nextTut() {
      if (this.tutIndex < this.tutorialSteps.length - 1) this.tutIndex++
      else this.onTutorialDone()
    },
    skipTut() {
      this.onTutorialDone()
    },
    onTutorialDone() {
      this.tutIndex = 0
      if (afterBatchTutorial(GAME_TYPE, (min) => this.startGame(min))) return
      this.selectedDuration = null
      this.screen = 'duration'
    },

    // ---------- Game core ----------
    startGame(minutes) {
      if (!minutes) return
      this.duration = minutes
      this.gameTimeLeft = minutes * 60
      this.currentDifficultyIdx = Math.max(0, getBatchStartDifficultyForGame(GAME_TYPE) - 1)
      this.score = 0
      this.stats = { total: 0, success: 0, fail: 0, reactTimes: [] }
      this.windowStats = { total: 0, success: 0 }
      this.showQuitConfirm = false
      this.isPaused = false
      this.screen = 'game'

      // Overall countdown
      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--
        if (this.gameTimeLeft <= 0) this.endGame()
      }, 1000)

      // Adaptive difficulty every 60s
      this.adaptiveWindowStart = performance.now()
      this.adaptiveTimer = setInterval(this.onAdaptiveTick, 60 * 1000)

      // Begin first round
      this.$nextTick(() => this.startRound())
    },

    onAdaptiveTick() {
      this.adaptDifficulty()
      this.adaptiveWindowStart = performance.now()
    },

    startRound() {
      if (this.screen !== 'game') return
      const diff = this.currentDifficulty
      const count = diff.animalCount
      // At least ~50% chance to include a cat -> use 55% for safe margin
      const hasCat = Math.random() < 0.55

      const positions = this.generatePositions(count)
      const list = []
      const catSlot = hasCat ? Math.floor(Math.random() * count) : -1
      for (let i = 0; i < count; i++) {
        const isCat = i === catSlot
        list.push({
          id: ++animalIdSeq,
          src: isCat ? resolveImage('/images/11.png') : resolveImage(`/images/${this.randomNonCat()}.png`),
          ...positions[i],
        })
      }
      this.animals = list
      this.roundHasCat = hasCat
      this.roundActive = true
      this.roundClicked = false
      this.roundClickable = true
      this.roundStartTime = performance.now()

      this.playRoundVoice()

      const displayMs = this.randRange(diff.displayTime[0], diff.displayTime[1]) * 1000
      const clickMs = diff.clickTime * 1000

      this.clickEndTime = this.roundStartTime + clickMs
      this.roundEndTime = this.roundStartTime + displayMs

      // Close click window (if display is longer than click window)
      if (clickMs < displayMs) {
        this.clickWindowTimer = setTimeout(() => {
          this.roundClickable = false
        }, clickMs)
      }

      // End round when display ends
      this.roundTimer = setTimeout(() => this.finishRound(false), displayMs)
    },

    finishRound(userClicked) {
      if (!this.roundActive) return
      this.roundActive = false
      this.roundClickable = false
      clearTimeout(this.roundTimer)
      clearTimeout(this.clickWindowTimer)

      // Judge
      let correct = false
      if (this.roundHasCat && userClicked) correct = true
      if (!this.roundHasCat && !userClicked) correct = true

      this.stats.total++
      this.windowStats.total++
      if (correct) {
        this.stats.success++
        this.windowStats.success++
        const pts = 5 * this.currentDifficulty.coeff
        this.score += pts
        if (userClicked && this.roundStartTime) {
          this.stats.reactTimes.push(Math.round(performance.now() - this.roundStartTime))
        }
        this.showFeedback('correct', `${this.t('correct')}${pts}`)
      } else {
        this.stats.fail++
        this.showFeedback('wrong', this.roundHasCat && !userClicked ? this.t('miss') : this.t('wrong'))
      }

      // Clear animals, then next round after brief pause
      this.animals = []
      setTimeout(() => {
        if (this.screen === 'game' && this.gameTimeLeft > 0) this.startRound()
      }, 500)
    },

    onGameClick() {
      if (this.showQuitConfirm || this.isPaused) return
      if (!this.roundActive) return
      if (!this.roundClickable) return
      if (this.roundClicked) return
      this.roundClicked = true
      this.finishRound(true)
    },

    showFeedback(type, text) {
      this.feedback = { type, text }
      clearTimeout(this.feedbackTimer)
      this.feedbackTimer = setTimeout(() => { this.feedback = null }, 700)
    },

    playRoundVoice() {
      const src = this.lang === 'en' ? resolveVoice('/voice/english/1.mp3') : resolveVoice('/voice/chinese/1.mp3')
      try {
        this.stopVoice()
        const a = new Audio(src)
        a.volume = 1.0
        this.voiceAudio = a
        const p = a.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch (e) { /* ignore */ }
    },

    stopVoice() {
      if (this.voiceAudio) {
        try { this.voiceAudio.pause() } catch (e) {}
        this.voiceAudio = null
      }
    },

    adaptDifficulty() {
      const w = this.windowStats
      if (w.total > 0) {
        const rate = w.success / w.total
        if (rate >= 0.9 && this.currentDifficultyIdx < DIFFICULTIES.length - 1) {
          this.currentDifficultyIdx++
        } else if (rate <= 0.7 && this.currentDifficultyIdx > 0) {
          this.currentDifficultyIdx--
        }
      }
      this.windowStats = { total: 0, success: 0 }
    },

    quitGame() {
      // Pause the game and ask for confirmation
      this.pauseGame()
      this.showQuitConfirm = true
    },

    onSkipClick() {
      skipPbBatchGame()
    },

    cancelQuit() {
      this.showQuitConfirm = false
      this.resumeGame()
    },

    confirmQuit() {
      this.showQuitConfirm = false
      this.clearAllTimers()
      this.stopVoice()
      leavePbGameWindow({ confirm: false })
    },

    pauseGame() {
      if (this.isPaused) return
      this.isPaused = true
      this.stopVoice()
      const now = performance.now()
      // Save remaining time for the round
      this.pausedRoundRemaining = this.roundActive ? Math.max(0, this.roundEndTime - now) : 0
      this.pausedClickRemaining = this.roundActive && this.roundClickable
        ? Math.max(0, this.clickEndTime - now) : 0
      // Adaptive: remaining time until next 60s adjustment
      const elapsedInWindow = now - this.adaptiveWindowStart
      this.pausedAdaptiveRemaining = Math.max(0, 60000 - elapsedInWindow)
      // Stop all timers
      clearInterval(this.gameTimer)
      clearInterval(this.adaptiveTimer)
      clearTimeout(this.roundTimer)
      clearTimeout(this.clickWindowTimer)
      this.gameTimer = this.adaptiveTimer = this.roundTimer = this.clickWindowTimer = null
    },

    resumeGame() {
      if (!this.isPaused) return
      this.isPaused = false
      const now = performance.now()
      // Restart overall countdown
      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--
        if (this.gameTimeLeft <= 0) this.endGame()
      }, 1000)
      // Restart round timer with remaining time
      if (this.roundActive && this.pausedRoundRemaining > 0) {
        this.roundEndTime = now + this.pausedRoundRemaining
        this.roundTimer = setTimeout(() => this.finishRound(false), this.pausedRoundRemaining)
        // Restart click window timer
        if (this.pausedClickRemaining > 0) {
          this.clickEndTime = now + this.pausedClickRemaining
          if (this.pausedClickRemaining < this.pausedRoundRemaining) {
            this.clickWindowTimer = setTimeout(() => { this.roundClickable = false }, this.pausedClickRemaining)
          }
        } else {
          this.roundClickable = false
        }
      }
      // Restart adaptive timer for remainder of current 60s window
      this.adaptiveTimer = setTimeout(() => {
        this.onAdaptiveTick()
        this.adaptiveTimer = setInterval(this.onAdaptiveTick, 60 * 1000)
      }, this.pausedAdaptiveRemaining)
      this.adaptiveWindowStart = now - (60000 - this.pausedAdaptiveRemaining)
    },

    endGame() {
      this.clearAllTimers()
      this.stopVoice()
      this.roundActive = false
      this.animals = []
      this.saveHistory()
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(this.avgReactTime || 0),
        score: Math.round(this.score) || 0,
        successCount: this.stats.success,
        failCount: this.stats.fail,
        trainDuration: this.duration,
        difficultyLevel: this.currentDifficulty.level,
      }).catch(() => {})
      this.screen = 'result'
    },

    clearAllTimers() {
      clearInterval(this.gameTimer)
      clearInterval(this.adaptiveTimer)
      clearTimeout(this.roundTimer)
      clearTimeout(this.clickWindowTimer)
      clearTimeout(this.feedbackTimer)
      this.gameTimer = this.adaptiveTimer = this.roundTimer = this.clickWindowTimer = this.feedbackTimer = null
    },

    // ---------- Positioning ----------
    generatePositions(count) {
      // Animal size in vmin (independent of zone dimensions).
      const sizeVmin = count === 1 ? 18 : count === 2 ? 16 : count === 3 ? 13 : 11
      // Convert vmin -> px -> % of viewport width (for `left`) and % of zone height (for `top`).
      const px = sizeVmin * this.vmin
      const wPct = (px / this.viewportW) * 100
      // Zone height in px based on current zoneStyle (50 - safeBottom)%.
      const zoneHeightPct = this.isTabletLike ? 25 : 35.5
      const zoneHeightPx = (zoneHeightPct / 100) * this.viewportH
      const hPct = zoneHeightPx > 0 ? (px / zoneHeightPx) * 100 : 60

      const positions = []
      const slotWidth = 100 / count
      for (let i = 0; i < count; i++) {
        const slotCenter = slotWidth * i + slotWidth / 2
        const maxJitter = Math.max(0, slotWidth / 2 - wPct / 2 - 2)
        const jitter = (Math.random() * 2 - 1) * maxJitter
        const left = Math.max(0, Math.min(100 - wPct, slotCenter + jitter - wPct / 2))
        const topMax = Math.max(0, 100 - hPct)
        const top = Math.random() * topMax
        positions.push({ left, top, size: sizeVmin })
      }
      return positions
    },

    // ---------- Utilities ----------
    randRange(min, max) { return min + Math.random() * (max - min) },
    formatTime(sec) {
      sec = Math.max(0, Math.floor(sec))
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s < 10 ? '0' + s : s}`
    },

    // ---------- History ----------
    loadHistory() {
      try {
        const raw = localStorage.getItem('findKitten.history')
        if (raw) this.history = JSON.parse(raw)
      } catch (e) { this.history = [] }
    },
    saveHistory() {
      const entry = {
        time: this.nowStr(),
        difficulty: this.currentDifficulty.level,
        duration: this.duration,
        total: this.stats.total,
        success: this.stats.success,
        fail: this.stats.fail,
        rate: this.successRate,
        avgReact: this.avgReactTime,
        score: Math.round(this.score * 10) / 10,
      }
      this.history.unshift(entry)
      // Keep last 50
      if (this.history.length > 50) this.history.length = 50
      localStorage.setItem('findKitten.history', JSON.stringify(this.history))
    },
    clearHistory() {
      this.history = []
      localStorage.removeItem('findKitten.history')
    },
    nowStr() {
      const d = new Date()
      const pad = n => (n < 10 ? '0' + n : n)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; width: 100%; overflow: hidden; }
body { background: #0f2744; color: #e8f4fd; }
body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  overflow: hidden;
}

.lang-btn {
  position: fixed;
  top: 2.5vmin;
  right: 3vmin;
  z-index: 100;
  padding: 0.8vmin 1.8vmin;
  font-size: 1.8vmin;
  background: rgba(255, 255, 255, 0.9);
  border: 0.2vmin solid #4caf50;
  color: #2e7d32;
  border-radius: 1vmin;
  cursor: pointer;
  font-weight: bold;
}

/* ================= HOME ================= */
.home {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3vmin;
  background-image: url(~@/views/game/newG11/public/images/bac.png);
  background-size: cover;
  background-position: center;
}
.title {
  font-size: 8vmin;
  font-weight: 900;
  color: #fff;
  text-shadow: 0.4vmin 0.4vmin 1vmin rgba(0, 0, 0, 0.5);
  letter-spacing: 0.3vmin;
}
.subtitle {
  font-size: 2.5vmin;
  color: #fff;
  text-shadow: 0.2vmin 0.2vmin 0.6vmin rgba(0, 0, 0, 0.5);
  margin-bottom: 2vmin;
}
.home-btns {
  display: flex;
  flex-direction: column;
  gap: 2.5vmin;
}
.big-btn {
  padding: 2vmin 3vmin;
  font-size: 2.4vmin;
  border: 0.3vmin solid #fff;
  background: rgba(255, 255, 255, 0.85);
  color: #2e7d32;
  border-radius: 5vmin;
  cursor: pointer;
  font-weight: 700;
  width: 34vmin;
  transition: transform 0.15s;
}
.big-btn:hover { transform: scale(1.05); }
.big-btn.primary { background: #4caf50; color: #fff; }

/* ================= MODAL ================= */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 3vmin;
}
.modal {
  background: #fff;
  border-radius: 2vmin;
  padding: 4vmin;
  max-width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
  width: min(80vmin, 92vw);
}
.modal.wide { width: min(120vmin, 96vw); }
.modal h2 {
  margin-bottom: 2.5vmin;
  color: #2e7d32;
  font-size: 3vmin;
  font-weight: 800;
}
.modal-actions {
  display: flex;
  gap: 1.5vmin;
  justify-content: flex-end;
  margin-top: 2.5vmin;
}
.btn {
  padding: 1.2vmin 2.5vmin;
  font-size: 2vmin;
  border: 0.25vmin solid #4caf50;
  background: #fff;
  color: #2e7d32;
  border-radius: 1vmin;
  cursor: pointer;
  font-weight: 700;
}
.btn:hover { background: #e8f5e9; }
.btn.primary { background: #4caf50; color: #fff; }
.btn.primary:hover { background: #43a047; }
.btn.danger { border-color: #e53935; color: #e53935; }
.btn.danger:hover { background: #ffebee; }
.btn.small { padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.rules-body p { margin-bottom: 1.2vmin; line-height: 1.6; font-size: 2vmin; color: #444; }
.diff-table, .history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5vmin;
  font-size: 1.8vmin;
}
.diff-table th, .diff-table td,
.history-table th, .history-table td {
  padding: 1vmin 1.2vmin;
  border: 0.1vmin solid #ddd;
  text-align: center;
}
.diff-table th, .history-table th {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 700;
}
.history-body { max-height: 60vh; overflow-y: auto; }
.empty { text-align: center; padding: 4vmin; color: #999; font-size: 2vmin; }

/* ================= TUTORIAL ================= */
.tutorial { width: min(90vmin, 94vw); }
.tut-stage {
  position: relative;
  width: 100%;
  height: 40vmin;
  border-radius: 1.5vmin;
  overflow: hidden;
  margin-bottom: 2vmin;
  background: #f5f5f5;
}
.tut-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tut-animal {
  position: absolute;
  object-fit: contain;
}
.tut-cue {
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 1vmin 2vmin;
  border-radius: 3vmin;
  border: 0.3vmin solid #4caf50;
  display: flex;
  align-items: center;
  gap: 1vmin;
  font-weight: 700;
  color: #2e7d32;
  font-size: 2.2vmin;
}
.tut-cue.nope { border-color: #e53935; color: #c62828; }
.tap-anim {
  font-size: 1.6em;
  animation: tap 1s infinite;
}
@keyframes tap {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
.tut-dots {
  display: flex;
  justify-content: center;
  gap: 1.2vmin;
  margin: 1.5vmin 0;
}
.dot {
  width: 1.4vmin;
  height: 1.4vmin;
  border-radius: 50%;
  background: #ccc;
}
.dot.active { background: #4caf50; }
.tut-actions {
  display: flex;
  justify-content: space-between;
  gap: 1.5vmin;
}

/* ================= DURATION ================= */
.duration-options {
  display: flex;
  gap: 2.5vmin;
  justify-content: center;
  margin: 3vmin 0;
  flex-wrap: wrap;
}
.dur-btn {
  padding: 3vmin 2vmin;
  font-size: 2.8vmin;
  border: 0.3vmin solid #4caf50;
  background: #fff;
  color: #2e7d32;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 800;
  width: 20vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vmin;
  transition: all 0.2s;
}
.dur-btn:hover { background: #e8f5e9; transform: translateY(-0.4vmin); }
.dur-btn.selected {
  background: #4caf50;
  color: #fff;
  transform: translateY(-0.4vmin) scale(1.04);
  box-shadow: 0 0.8vmin 2vmin rgba(76, 175, 80, 0.35);
}
.dur-icon { font-size: 4vmin; }
.dur-value { font-size: 2.4vmin; font-weight: 800; }

/* ================= GAME ================= */
.game {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}
.game-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.hud {
  position: absolute;
  z-index: 10;
  background: rgba(255, 255, 255, 0.92);
  padding: 1.5vmin 2.2vmin;
  border-radius: 1.5vmin;
  border: 0.25vmin solid rgba(76, 175, 80, 0.5);
  box-shadow: 0 0.5vmin 1.5vmin rgba(0, 0, 0, 0.15);
  color: #2e7d32;
  font-weight: 700;
}
.hud-left {
  top: 2.5vmin;
  left: 3vmin;
  display: flex;
  flex-direction: column;
  gap: 0.6vmin;
  font-size: 2.4vmin;
  line-height: 1.4;
}
.hud-left b { font-size: 2.8vmin; color: #1b5e20; }
.hud-center {
  top: 2.5vmin;
  left: 50%;
  transform: translateX(-50%);
  max-width: 55vw;
  text-align: center;
  font-size: 2.2vmin;
  padding: 1.8vmin 2.5vmin;
}
.hud-right {
  top: 2.5vmin;
  right: 3vmin;
  background: #e53935;
  color: #fff;
  border-color: #e53935;
  padding: 1.5vmin 2.8vmin;
  font-size: 2.2vmin;
  font-weight: 700;
}
.hud-right:hover { background: #c62828; color: #fff; }
.animal-zone {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: none;
}
.animal {
  position: absolute;
  object-fit: contain;
  animation: pop 0.25s ease-out;
}
@keyframes pop {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.feedback {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5.5vmin;
  font-weight: 900;
  padding: 1.5vmin 3.5vmin;
  border-radius: 1.5vmin;
  z-index: 20;
  pointer-events: none;
}
.feedback.correct { background: rgba(76, 175, 80, 0.9); color: #fff; }
.feedback.wrong { background: rgba(229, 57, 53, 0.9); color: #fff; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* ================= RESULT ================= */
.result-body {
  margin: 2vmin 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5vmin 2vmin;
}
.result-item {
  display: flex;
  justify-content: space-between;
  padding: 1.5vmin 2vmin;
  background: #e8f5e9;
  border-radius: 1vmin;
  font-size: 2.2vmin;
}
.result-item b { color: #2e7d32; }

/* ================= QUIT CONFIRMATION ================= */
.quit-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: default;
}
.quit-box {
  background: #fff;
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  box-shadow: 0 2vmin 5vmin rgba(0, 0, 0, 0.3);
  min-width: 40vmin;
}
.quit-text {
  color: #2e7d32;
  font-size: 2.6vmin;
  font-weight: 700;
  text-align: center;
}
.quit-actions {
  display: flex;
  gap: 2vmin;
}

/* Skip button — sits just left of the top-right Quit button, secondary gray style */
.hud-skip {
  top: 2.5vmin;
  right: calc(3vmin + 16vmin);
  background: #9e9e9e;
  color: #fff;
  border-color: #757575;
  padding: 1.5vmin 2.8vmin;
  font-size: 2.2vmin;
  font-weight: 700;
}
.hud-skip:hover { background: #757575; color: #fff; }

/* ================= PORTRAIT (phone / WeChat web-view) ================= */
@media (orientation: portrait) {
  .title {
    font-size: max(9vmin, 28px);
    letter-spacing: 0.2vmin;
  }
  .subtitle {
    font-size: max(3.6vmin, 15px);
    padding: 0 4vmin;
    text-align: center;
  }
  .home-btns { gap: 3.2vmin; width: 100%; align-items: center; }
  .big-btn {
    width: 82vw;
    padding: 3.2vmin 4vmin;
    font-size: max(4.2vmin, 17px);
    border-radius: 8vmin;
  }

  .lang-btn {
    top: calc(2.5vmin + env(safe-area-inset-top));
    padding: 1.4vmin 3vmin;
    font-size: max(3.2vmin, 13px);
    border-radius: 2vmin;
  }

  /* Modals: 90vw+ wide, rounder */
  .modal {
    width: 92vw !important;
    max-width: 92vw;
    padding: 5vmin 4.5vmin;
    border-radius: 3.5vmin;
    padding-top: calc(5vmin + env(safe-area-inset-top));
    padding-bottom: calc(5vmin + env(safe-area-inset-bottom));
  }
  .modal.wide { width: 94vw !important; max-width: 94vw; }
  .modal h2 { font-size: max(4.6vmin, 20px); }
  .rules-body p { font-size: max(3.4vmin, 14px); line-height: 1.7; }
  .empty { font-size: max(3.4vmin, 14px); }

  /* Buttons in modals */
  .btn {
    padding: 2.2vmin 4vmin;
    font-size: max(3.6vmin, 15px);
    border-radius: 2vmin;
  }
  .btn.small { padding: 2vmin 3.5vmin; font-size: max(3.2vmin, 14px); }
  .modal-actions { gap: 2.5vmin; flex-wrap: wrap; }
  .modal-actions .btn { flex: 1 1 40%; min-width: 30vw; }

  /* Rules difficulty table — render as cards */
  .diff-table, .diff-table thead, .diff-table tbody,
  .diff-table tr, .diff-table th, .diff-table td { display: block; width: 100%; }
  .diff-table thead { display: none; }
  .diff-table tr {
    margin-bottom: 2vmin;
    padding: 2vmin;
    border: 0.3vmin solid #c8e6c9;
    border-radius: 2vmin;
    background: #f9fdf9;
  }
  .diff-table td {
    display: flex;
    justify-content: space-between;
    padding: 1vmin 0.5vmin;
    border: none;
    text-align: left;
    font-size: max(3.2vmin, 13px);
  }
  .diff-table td::before {
    content: attr(data-label);
    font-weight: 700;
    color: #2e7d32;
  }
  /* Since we don't set data-label on cells, use nth-child labels via generated content */
  .diff-table tr td:nth-child(1)::before { content: 'Lv'; }
  .diff-table tr td:nth-child(2)::before { content: '🐾'; }
  .diff-table tr td:nth-child(3)::before { content: '⏱'; }
  .diff-table tr td:nth-child(4)::before { content: '⏰'; }
  .diff-table tr td:nth-child(5)::before { content: '×'; }

  /* History table -> cards */
  .history-body { max-height: 65vh; }
  .history-table, .history-table thead, .history-table tbody,
  .history-table tr, .history-table th, .history-table td { display: block; width: 100%; }
  .history-table thead { display: none; }
  .history-table tr {
    margin-bottom: 2.5vmin;
    padding: 2.5vmin;
    border: 0.3vmin solid #c8e6c9;
    border-radius: 2vmin;
    background: #f9fdf9;
  }
  .history-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.8vmin 0.5vmin;
    border: none;
    text-align: left;
    font-size: max(3.2vmin, 13px);
  }

  /* Tutorial */
  .tutorial { width: 94vw !important; max-width: 94vw; }
  .tut-stage { height: 55vmin; }
  .tut-cue { font-size: max(3.6vmin, 15px); padding: 1.6vmin 3vmin; border-radius: 5vmin; }
  .tut-actions { gap: 2vmin; flex-wrap: wrap; }
  .tut-actions .btn { flex: 1 1 28%; padding: 2vmin 2vmin; }
  .dot { width: 2.4vmin; height: 2.4vmin; }

  /* Duration selection -> two columns */
  .duration-options { gap: 3vmin; }
  .dur-btn {
    width: 26vw;
    padding: 4vmin 2vmin;
    border-radius: 2.5vmin;
  }
  .dur-icon { font-size: 7vmin; }
  .dur-value { font-size: max(3.6vmin, 15px); }

  /* ========== GAME (in-progress) ========== */
  .hud-left {
    top: calc(2.5vmin + env(safe-area-inset-top));
    left: 2.5vmin;
    padding: 2vmin 2.5vmin;
    gap: 0.8vmin;
    font-size: max(3.4vmin, 13px);
    border-radius: 2vmin;
  }
  .hud-left b { font-size: max(3.8vmin, 15px); }

  .hud-center {
    top: calc(2.5vmin + env(safe-area-inset-top));
    /* Push down under the score card so it doesn't overlap */
    top: calc(22vmin + env(safe-area-inset-top));
    max-width: 90vw;
    font-size: max(3.2vmin, 13px);
    padding: 2vmin 2.5vmin;
    border-radius: 2vmin;
  }

  .hud-right {
    top: calc(2.5vmin + env(safe-area-inset-top));
    right: 2.5vmin;
    padding: 2vmin 3.2vmin;
    font-size: max(3.4vmin, 14px);
    border-radius: 2vmin;
  }
  .hud-skip {
    top: calc(2.5vmin + env(safe-area-inset-top));
    right: calc(2.5vmin + 22vw);
    padding: 2vmin 3.2vmin;
    font-size: max(3.4vmin, 14px);
    border-radius: 2vmin;
  }

  .feedback {
    font-size: max(7vmin, 26px);
    padding: 2vmin 4.5vmin;
    border-radius: 2.5vmin;
  }

  /* Result cards -> single column */
  .result-body {
    grid-template-columns: 1fr;
    gap: 1.5vmin;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .result-item {
    padding: 2.5vmin 3vmin;
    font-size: max(3.6vmin, 15px);
    border-radius: 1.5vmin;
  }

  /* Quit confirmation */
  .quit-box {
    padding: 5vmin 4vmin;
    min-width: 70vw;
    max-width: 88vw;
    border-radius: 3vmin;
  }
  .quit-text { font-size: max(4vmin, 16px); }
  .quit-actions { gap: 3vmin; width: 100%; }
  .quit-actions .btn { flex: 1; }
}
</style>
