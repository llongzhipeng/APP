<template>
  <div class="game-scene" :style="sceneVars">
    <!-- Header bar -->
    <div class="header">
      <div class="header-left">
        <div class="stat-chip level-chip">
          <span class="stat-label">{{ t('difficulty') }}</span>
          <span class="stat-value lv-badge" :style="{ background: lvColor }">{{ difficulty }}</span>
        </div>
        <div class="stat-chip score-chip">
          <span class="stat-label">{{ t('score') }}</span>
          <span class="stat-value score-val">{{ score }}</span>
        </div>
        <div class="stat-chip time-chip" :class="{ urgent: gameTimeLeft <= 10 }">
          <span class="stat-label">{{ t('timeLeft') }}</span>
          <span class="stat-value">{{ formatTime(gameTimeLeft) }}</span>
        </div>
      </div>
      <div class="header-center">
        <span class="rule-text">{{ t('gameRule') }}</span>
      </div>
      <div class="header-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" type="button" @click="onBatchSkip">⏭ {{ t('skipGame') }}</button>
        <button class="back-btn" @click="openConfirm">{{ t('backBtn') }}</button>
      </div>
    </div>

    <!-- Question timer bar -->
    <div class="qtimer-track">
      <div
        class="qtimer-fill"
        :style="{
          width: qTimerPct + '%',
          background: qTimerColor,
        }"
      ></div>
    </div>

    <!-- Game area -->
    <div class="game-area" v-if="question">
      <!-- Left: Reference -->
      <div class="ref-pane">
        <div class="pane-label ref-label">{{ t('reference') }}</div>
        <div class="card">
          <img v-if="question.type === 'image'"
            :src="question.imageUrl"
            class="shape-content"
            :style="{
              width: '75%',
              height: '75%',
              transform: `rotate(${question.refRotation}deg)`,
            }"
            alt="Reference"
          />
          <svg v-else viewBox="0 0 100 100"
            class="shape-content"
            :style="{
              width: '75%',
              height: '75%',
              transform: `rotate(${question.refRotation}deg)`,
            }"
          >
            <path :d="question.shapePath" :fill="question.shapeColor" stroke="#222" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- Right: 4 options (2×2 grid) -->
      <div class="options-pane">
        <div class="pane-label opt-label">{{ t('options') }}</div>
        <div class="options-grid">
          <div
            v-for="(option, index) in question.options"
            :key="questionId + '-' + index"
            class="card option-card"
            :class="{
              correct: answerState === 'correct' && index === question.correctIndex,
              wrong: answerState === 'wrong' && index === selectedIndex
            }"
            @click="selectOption(index)"
          >
            <img v-if="question.type === 'image'"
              :src="question.imageUrl"
              class="shape-content"
              :style="{
                width: option.sizePct + '%',
                height: option.sizePct + '%',
              }"
              alt="Option"
            />
            <svg v-else viewBox="0 0 100 100"
              class="shape-content"
              :style="{
                width: option.sizePct + '%',
                height: option.sizePct + '%',
              }"
            >
              <path :d="question.shapePath" :fill="question.shapeColor" stroke="#222" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback toast -->
    <transition name="toast">
      <div v-if="feedbackMsg" class="feedback-toast" :class="feedbackType">
        {{ feedbackMsg }}
        <span v-if="feedbackType === 'correct'" class="toast-score">+{{ lastScore }}</span>
      </div>
    </transition>

    <!-- Confirm back dialog -->
    <div v-if="showConfirm" class="confirm-overlay" @click.self="closeConfirm">
      <div class="confirm-box">
        <p>{{ t('confirmBack') }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="closeConfirm">{{ t('cancel') }}</button>
          <button class="cbtn confirm" @click="doBack">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateQuestion, calculateScore, TIME_LIMITS, formatTime } from '../gameUtils.js'
import { t } from '../i18n.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const LV_COLORS = ['#66BB6A','#42A5F5','#FFA726','#FF7043','#AB47BC','#E53935']

export default {
  name: 'GameScene',
  components: {},
  props: {
    language: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
  },
  emits: ['game-end'],
  data() {
    return {
      difficulty: getBatchStartDifficultyForGame('bdx'),
      score: 0,
      gameTimeLeft: 0,
      questionTimeLeft: 0,
      question: null,
      answerState: null,
      feedbackMsg: '',
      feedbackType: '',
      lastScore: 0,
      showConfirm: false,
      showBatchSkip: shouldShowPbBatchSkip(),
      paused: false,
      pauseInfo: null,
      questionCount: 0,
      correctCount: 0,
      windowCorrect: 0,
      windowTotal: 0,
      reactionTimes: [],
      questionStartTime: 0,
      gameTimer: null,
      qTimer: null,
      adjustTimer: null,
      feedbackTimer: null,
      selectedIndex: null,
      questionId: 0,
      cardPx: 0,
    }
  },
  computed: {
    lvColor() {
      return LV_COLORS[this.difficulty - 1]
    },
    sceneVars() {
      return { '--card-size': this.cardPx + 'px' }
    },
    qTimerPct() {
      const limit = TIME_LIMITS[this.difficulty - 1]
      return (this.questionTimeLeft / limit) * 100
    },
    qTimerColor() {
      const pct = this.qTimerPct
      if (pct > 60) return '#43A047'
      if (pct > 30) return '#FFCA28'
      return '#E53935'
    },
  },
  mounted() {
    // Calculate card size once from stable window dimensions — avoids vmin reflow jitter
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    this.cardPx = Math.round(Math.min(Math.max(vmin * 0.28, 160), 380))
    this.initGame()
  },
  beforeUnmount() {
    this.clearAllTimers()
  },
  methods: {
    t(key) { return t(this.language, key) },
    formatTime,

    clearAllTimers() {
      clearInterval(this.gameTimer)
      clearInterval(this.qTimer)
      clearInterval(this.adjustTimer)
      clearTimeout(this.feedbackTimer)
      clearTimeout(this.qTimeoutTimer)
    },

    initGame() {
      this.difficulty = getBatchStartDifficultyForGame('bdx')
      this.score = 0
      this.gameTimeLeft = this.duration * 60
      this.questionCount = 0
      this.correctCount = 0
      this.windowCorrect = 0
      this.windowTotal = 0
      this.reactionTimes = []

      // Game countdown timer
      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--
        if (this.gameTimeLeft <= 0) {
          this.endGame()
        }
      }, 1000)

      // Difficulty adjustment every 30s
      this.adjustTimer = setInterval(() => {
        if (this.windowTotal > 0) {
          const rate = this.windowCorrect / this.windowTotal
          if (rate >= 0.9 && this.difficulty < 6) {
            this.difficulty++
          } else if (rate < 0.7 && this.difficulty > 1) {
            this.difficulty--
          }
        }
        this.windowCorrect = 0
        this.windowTotal = 0
      }, 30000)

      this.nextQuestion()
    },

    nextQuestion() {
      clearInterval(this.qTimer)
      clearTimeout(this.qTimeoutTimer)
      this.answerState = null
      this.selectedIndex = null
      this.questionId = (this.questionId || 0) + 1
      this.question = generateQuestion(this.difficulty)
      this.questionStartTime = Date.now()
      this.startQTimer()
    },

    startQTimer() {
      const limit = TIME_LIMITS[this.difficulty - 1]
      this.questionTimeLeft = limit
      // Use a countdown that fires exactly when the bar visually hits 0
      this.qTimer = setInterval(() => {
        if (this.questionTimeLeft > 0) {
          this.questionTimeLeft--
        }
        if (this.questionTimeLeft <= 0) {
          clearInterval(this.qTimer)
          // Wait for progress bar CSS transition (0.9s) to finish before showing timeout
          this.qTimeoutTimer = setTimeout(() => this.onTimeout(), 950)
        }
      }, 1000)
    },

    selectOption(index) {
      if (this.answerState !== null) return

      this.selectedIndex = index
      clearInterval(this.qTimer)
      clearTimeout(this.qTimeoutTimer)

      const reaction = (Date.now() - this.questionStartTime) / 1000
      this.reactionTimes.push(reaction)
      this.questionCount++
      this.windowTotal++

      if (index === this.question.correctIndex) {
        // Correct answer
        this.answerState = 'correct'
        this.correctCount++
        this.windowCorrect++

        const pts = calculateScore(this.difficulty)
        this.score += pts
        this.lastScore = pts
        this.showFeedback(this.t('correct'), 'correct')
      } else {
        // Wrong answer
        this.answerState = 'wrong'
        this.showFeedback(this.t('wrong'), 'wrong')
      }

      this.feedbackTimer = setTimeout(() => this.nextQuestion(), 900)
    },

    onTimeout() {
      clearInterval(this.qTimer)
      this.answerState = 'timeout'
      this.questionCount++
      this.windowTotal++
      this.showFeedback(this.t('timeout'), 'wrong')
      this.feedbackTimer = setTimeout(() => this.nextQuestion(), 900)
    },

    showFeedback(msg, type) {
      this.feedbackMsg = msg
      this.feedbackType = type
      setTimeout(() => { this.feedbackMsg = '' }, 800)
    },

    endGame() {
      this.clearAllTimers()
      const avgTime = this.reactionTimes.length > 0
        ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
        : 0
      this.$emit('game-end', {
        date: new Date().toLocaleString(),
        project: this.language === 'zh' ? '比大小' : 'Size Compare',
        difficulty: this.difficulty,
        duration: this.duration,
        total: this.questionCount,
        correct: this.correctCount,
        wrong: this.questionCount - this.correctCount,
        rate: this.questionCount > 0
          ? Math.round((this.correctCount / this.questionCount) * 100)
          : 0,
        avgTime: Math.round(avgTime * 10) / 10,
    
        score: Math.round(this.score * 10) / 10,
      })
    },

    doBack() {
      this.showConfirm = false
      this.clearAllTimers()
      leavePbGameWindow({ confirm: false })
    },
     onBatchSkip() {
      skipPbBatchGame()
     },

    openConfirm() {
      this.pauseGame()
      this.showConfirm = true
    },

    closeConfirm() {
      this.showConfirm = false
      this.resumeGame()
    },

    pauseGame() {
      if (this.paused) return
      const pendingFeedback = this.answerState !== null && !!this.feedbackTimer
      const pendingTimeout = this.questionTimeLeft <= 0 && this.answerState === null && !!this.qTimeoutTimer
      this.pauseInfo = {
        pendingFeedback,
        pendingTimeout,
        pausedAt: Date.now(),
      }
      clearInterval(this.gameTimer)
      clearInterval(this.qTimer)
      clearInterval(this.adjustTimer)
      clearTimeout(this.feedbackTimer)
      clearTimeout(this.qTimeoutTimer)
      this.gameTimer = null
      this.qTimer = null
      this.adjustTimer = null
      this.feedbackTimer = null
      this.qTimeoutTimer = null
      this.paused = true
    },

    resumeGame() {
      if (!this.paused) return
      const info = this.pauseInfo || {}
      if (info.pausedAt) {
        this.questionStartTime += Date.now() - info.pausedAt
      }

      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--
        if (this.gameTimeLeft <= 0) this.endGame()
      }, 1000)

      this.adjustTimer = setInterval(() => {
        if (this.windowTotal > 0) {
          const rate = this.windowCorrect / this.windowTotal
          if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
          else if (rate < 0.7 && this.difficulty > 1) this.difficulty--
        }
        this.windowCorrect = 0
        this.windowTotal = 0
      }, 30000)

      if (info.pendingFeedback) {
        this.feedbackTimer = setTimeout(() => this.nextQuestion(), 900)
      } else if (info.pendingTimeout) {
        this.qTimeoutTimer = setTimeout(() => this.onTimeout(), 950)
      } else if (this.answerState === null && this.questionTimeLeft > 0) {
        this.qTimer = setInterval(() => {
          if (this.questionTimeLeft > 0) this.questionTimeLeft--
          if (this.questionTimeLeft <= 0) {
            clearInterval(this.qTimer)
            this.qTimeoutTimer = setTimeout(() => this.onTimeout(), 950)
          }
        }, 1000)
      }

      this.paused = false
      this.pauseInfo = null
    },
  },
}
</script>

<style scoped>
.game-scene {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.header {
  background: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 16px;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #000;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #000;
}

.lv-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.score-val {
  color: #000;
}

.time-chip.urgent .stat-value {
  color: #f44336;
  animation: blink 0.7s linear infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.rule-text {
  font-size: 15px;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
}

.back-btn {
  padding: 8px 20px;
  background: white;
  border: 2px solid #f44336;
  border-radius: 20px;
  color: #f44336;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f44336;
  color: white;
}

/* ── Question timer bar ── */
.qtimer-track {
  height: 6px;
  background: #e0e0e0;
  flex-shrink: 0;
}
.qtimer-fill {
  height: 100%;
  transition: width 0.9s linear, background 0.5s;
}

/* ── Game area ── */
.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  gap: clamp(24px, 4vw, 60px);
  overflow: hidden;
  min-height: 0;
}

/* ── Pane labels ── */
.pane-label {
  font-size: clamp(14px, 2vmin, 20px);
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}
.ref-label { color: #FF7043; }
.opt-label { color: #5C6BC0; }

/* ── Reference pane (left) ── */
.ref-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* ── Options pane (right) — 2×2 grid ── */
.options-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(8px, 1.2vmin, 16px);
}

/* ── Unified card — same size for reference and options ── */
.card {
  width: var(--card-size, 240px);
  height: var(--card-size, 240px);
  background: #fff;
  border-radius: 12px;
  border: 3px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.ref-pane > .card {
  border-color: #FFE0B2;
  box-shadow: 0 4px 20px rgba(255,112,67,0.15);
}
.option-card {
  border-color: #e8eaf6;
  box-shadow: 0 2px 10px rgba(92,107,192,0.1);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.1s, box-shadow 0.2s;
}
.option-card:hover {
  border-color: #5C6BC0;
  transform: scale(1.04);
  box-shadow: 0 4px 16px rgba(92,107,192,0.25);
}
.option-card.correct {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76,175,80,0.3);
  animation: flash-correct 0.4s;
}
.option-card.wrong {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244,67,54,0.3);
  animation: flash-wrong 0.4s;
}

/* ── Shape inside card ── */
.shape-content {
  object-fit: contain;
  flex-shrink: 0;
}

@keyframes flash-correct {
  0%, 100% { background: #fff; }
  50% { background: #e8f5e9; }
}
@keyframes flash-wrong {
  0%, 100% { background: #fff; }
  50% { background: #ffebee; }
}

/* ── Feedback toast ── */
.feedback-toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 20px;
  font-weight: 800;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
}
.feedback-toast.correct { background: #43A047; color: #fff; }
.feedback-toast.wrong   { background: #E53935; color: #fff; }
.toast-score {
  font-size: 17px;
  opacity: 0.9;
}
.toast-enter-active { animation: toast-in 0.25s ease; }
.toast-leave-active { animation: toast-out 0.25s ease; }
@keyframes toast-in  { from{ opacity:0; transform:translateX(-50%) translateY(-16px); } to{ opacity:1; transform:translateX(-50%) translateY(0); } }
@keyframes toast-out { from{ opacity:1; } to{ opacity:0; } }

/* ── Confirm dialog ── */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.confirm-box {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 380px;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 16px 50px rgba(0,0,0,0.3);
}
.confirm-box p {
  font-size: 16px;
  color: #333;
  margin: 0 0 24px;
  font-weight: 600;
}
.confirm-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.cbtn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.cbtn.cancel  { background: #f5f5f5; color: #555; border: 2px solid #ddd; }
.cbtn.confirm { background: #E53935; color: #fff; }
.cbtn:hover   { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
</style>
