<template>
  <div class="game-page">
    <!-- Status bar：统计在左，操作按钮在右，避免遮挡倒计时 -->
    <div class="status-bar">
      <div class="stat-group">
        <div class="stat-item">
          <span class="stat-label">{{ t('difficulty') }}</span>
          <span class="stat-value level-badge">Lv {{ currentLevel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('score') }}</span>
          <span class="stat-value score-val">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('timeLeft') }}</span>
          <span class="stat-value time-val" :class="{ 'time-warn': gameTimeLeft <= 10 }">
            {{ formatTime(gameTimeLeft) }}
          </span>
        </div>
      </div>
      <div class="action-group">
        <button
          v-if="showBatchSkip"
          class="hud-btn hud-btn-skip"
          type="button"
          @click="onBatchSkip"
        >
          ⏭ {{ t('skipGame') }}
        </button>
        <button class="hud-btn hud-btn-back" type="button" @click="onBack">
          {{ t('back') }}
        </button>
      </div>
    </div>

    <!-- Rule text -->
    <div class="rule-bar">
      <span class="rule-label">{{ t('currentRule') }}</span>
      <span class="rule-text" v-html="ruleTextHighlighted"></span>
    </div>

    <!-- Question timer bar -->
    <div class="q-timer-wrap">
      <div
        class="q-timer-fill"
        :style="{ width: qTimerPct + '%', background: qTimerColor }"
      />
    </div>

    <!-- Main area: reference cards + target card, kept together -->
    <div class="main-area">
      <!-- Reference cards -->
      <div class="ref-area">
        <CardItem
          v-for="card in referenceCards"
          :key="card.id"
          :card="card"
          :size="'normal'"
          :state="cardState(card.id)"
          @click="onCardClick(card)"
        />
      </div>

      <!-- Feedback -->
      <div class="feedback-slot">
        <transition name="feedback-fade">
          <div v-if="feedbackVisible" class="feedback-msg" :class="`fb-${feedbackType}`">
            {{ feedbackText }}
          </div>
        </transition>
      </div>

      <!-- Target card area -->
      <div class="target-area">
        <div class="target-label">▼ {{ t('targetLabel') }}</div>
        <CardItem
          v-if="targetCard"
          :card="targetCard"
          :size="'large'"
          :state="'idle'"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CardItem from './CardItem.vue'
import { t } from '../utils/i18n.js'
import {
  CARD_DECK,
  getDifficulty,
  generateTargetCard,
  pickCorrectCard,
  calcPoints,
  formatTime,
} from '../utils/gameData.js'
import { saveRecord } from '../utils/storage.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GamePage',
  components: { CardItem },
  props: {
    duration: { type: Number, required: true }, // seconds
  },
  emits: ['game-ended'],

  data() {
    return {
      showBatchSkip: shouldShowPbBatchSkip(),
      // Game state
      currentLevel: getBatchStartDifficultyForGame('ljlt'),
      score: 0,
      gameTimeLeft: this.duration,

      // Per-question
      referenceCards: [],
      targetCard: null,
      correctCardId: null,
      questionTimeLeft: 0,
      questionTimeLimitMs: 0,
      questionStartTs: 0,

      // Feedback
      feedbackVisible: false,
      feedbackType: null,      // 'correct' | 'wrong' | 'timeout'
      selectedCardId: null,

      // Overall stats
      totalAnswered: 0,
      totalCorrect: 0,
      totalWrong: 0,
      reactionTimes: [],       // ms for each answered question

      // 30-second difficulty window
      windowCorrect: 0,
      windowTotal: 0,
      windowNextCheckAt: 30,   // seconds of elapsed game time for next evaluation

      // Timers (not reactive, stored directly)
      gameIntervalId: null,
      qIntervalId: null,
      feedbackTimeoutId: null,

      // Lock to prevent double-clicks during feedback
      answerLocked: false,
    }
  },

  computed: {
    diff() {
      return getDifficulty(this.currentLevel)
    },
    ruleText() {
      const rule = this.diff.rule
      if (rule === 'color')    return t('ruleColor')
      if (rule === 'quantity') return t('ruleQuantity')
      return t('ruleShape')
    },
    ruleTextHighlighted() {
      const text = this.ruleText
      const style = 'color:#E53935;font-weight:800;font-size:3.4vmin;'
      return text
        .replace(/颜色|Color/g, `<span style="${style}">$&</span>`)
        .replace(/数量|Quantity/g, `<span style="${style}">$&</span>`)
        .replace(/形状|Shape/g, `<span style="${style}">$&</span>`)
    },
    qTimerPct() {
      if (!this.questionTimeLimitMs) return 100
      return Math.max(0, (this.questionTimeLeft / this.questionTimeLimitMs) * 100)
    },
    qTimerColor() {
      const p = this.qTimerPct
      if (p > 60) return '#43A047'
      if (p > 30) return '#F9A825'
      return '#E53935'
    },
    feedbackText() {
      if (this.feedbackType === 'correct')  return t('correct')
      if (this.feedbackType === 'wrong')    return t('wrong')
      if (this.feedbackType === 'timeout')  return t('timeout')
      return ''
    },
    elapsedTime() {
      return this.duration - this.gameTimeLeft
    },
  },

  methods: {
    t,
    formatTime,
    onBatchSkip() {
      skipPbBatchGame()
    },
    /**
     * 返回/退出：任意入口均显示，确认后关窗或返回
     */
    onBack() {
      leavePbGameWindow()
    },

    cardState(id) {
      if (!this.feedbackVisible) return 'idle'
      if (id === this.correctCardId) return 'correct'
      if (id === this.selectedCardId && this.feedbackType === 'wrong') return 'wrong'
      return 'idle'
    },

    // ─── Game lifecycle ───────────────────────────────────────────────

    startGame() {
      this.newQuestion()
      this.startGameTimer()
    },

    startGameTimer() {
      this.gameIntervalId = setInterval(() => {
        if (this.gameTimeLeft <= 0) {
          this.endGame()
          return
        }
        this.gameTimeLeft -= 0.1

        // 30-second window check
        if (this.elapsedTime >= this.windowNextCheckAt) {
          this.evaluateWindow()
        }
      }, 100)
    },

    evaluateWindow() {
      this.windowNextCheckAt += 30
      if (this.windowTotal === 0) return

      const acc = this.windowCorrect / this.windowTotal
      if (acc > 0.9 && this.currentLevel < 6) {
        this.currentLevel++
      } else if (acc < 0.7 && this.currentLevel > 1) {
        this.currentLevel--
      }
      this.windowCorrect = 0
      this.windowTotal = 0
    },

    startQuestionTimer() {
      this.questionTimeLeft = this.questionTimeLimitMs
      clearInterval(this.qIntervalId)
      this.qIntervalId = setInterval(() => {
        if (this.questionTimeLeft <= 0) {
          clearInterval(this.qIntervalId)
          this.onTimeout()
          return
        }
        this.questionTimeLeft -= 100
      }, 100)
    },

    newQuestion() {
      clearInterval(this.qIntervalId)
      const d = getDifficulty(this.currentLevel)
      this.referenceCards = CARD_DECK.slice(0, d.cardCount)
      const correct = pickCorrectCard(d.cardCount)
      this.correctCardId = correct.id
      this.targetCard = generateTargetCard(correct, d.rule, d.cardCount)
      this.selectedCardId = null
      this.questionTimeLimitMs = d.timeLimit * 1000
      this.questionStartTs = Date.now()
      this.answerLocked = false
      this.startQuestionTimer()
    },

    // ─── Player actions ───────────────────────────────────────────────

    onCardClick(card) {
      if (this.answerLocked || this.feedbackVisible || this.gameTimeLeft <= 0) return
      this.answerLocked = true
      clearInterval(this.qIntervalId)

      const reactionMs = Date.now() - this.questionStartTs
      this.reactionTimes.push(reactionMs)
      this.selectedCardId = card.id
      this.totalAnswered++
      this.windowTotal++

      if (card.id === this.correctCardId) {
        this.score += calcPoints(this.currentLevel)
        this.totalCorrect++
        this.windowCorrect++
        this.showFeedback('correct')
      } else {
        this.totalWrong++
        this.showFeedback('wrong')
      }
    },

    onTimeout() {
      if (this.gameTimeLeft <= 0) return
      this.answerLocked = true
      this.totalAnswered++
      this.totalWrong++
      this.windowTotal++
      // Use full time limit as reaction time for timeouts
      this.reactionTimes.push(this.questionTimeLimitMs)
      this.showFeedback('timeout')
    },

    showFeedback(type) {
      this.feedbackType = type
      this.feedbackVisible = true
      clearTimeout(this.feedbackTimeoutId)
      this.feedbackTimeoutId = setTimeout(() => {
        this.feedbackVisible = false
        this.feedbackType = null
        if (this.gameTimeLeft > 0) {
          this.newQuestion()
        }
      }, 650)
    },

    // ─── Game end ─────────────────────────────────────────────────────

    endGame() {
      clearInterval(this.gameIntervalId)
      clearInterval(this.qIntervalId)
      clearTimeout(this.feedbackTimeoutId)

      const avgReaction = this.reactionTimes.length
        ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
        : 0

      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

      const result = {
        timestamp,
        projectZh: '逻辑链条',
        projectEn: 'Logic Chain',
        level: this.currentLevel,
        duration: this.duration,
        total: this.totalAnswered,
        correct: this.totalCorrect,
        wrong: this.totalWrong,
        successRate: this.totalAnswered > 0
          ? (this.totalCorrect / this.totalAnswered)
          : 0,
        avgReaction,
        minReaction: this.reactionTimes.length ? Math.min(...this.reactionTimes) : 0,
        maxReaction: this.reactionTimes.length ? Math.max(...this.reactionTimes) : 0,
        score: this.score,
      }

      saveRecord(result)
      this.$emit('game-ended', result)
    },
  },

  mounted() {
    this.startGame()
  },

  beforeUnmount() {
    clearInterval(this.gameIntervalId)
    clearInterval(this.qIntervalId)
    clearTimeout(this.feedbackTimeoutId)
  },
}
</script>

<style scoped>
.game-page {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  position: relative;
}

/* Status bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2vmin;
  background: #4A90E2;
  padding: 1.2vmin 2.4vmin;
  color: white;
  flex-shrink: 0;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 3.2vmin;
  min-width: 0;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 1.2vmin;
  flex-shrink: 0;
  margin-right: 1vmin; /* 相对原先右上角浮层整体偏左，避开倒计时 */
}

.hud-btn {
  border: none;
  border-radius: 0.6vmin;
  padding: 0.8vmin 1.6vmin;
  font-size: 1.6vmin;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.hud-btn-skip {
  background: #667eea;
  color: #fff;
}

.hud-btn-back {
  background: #ff6b6b;
  color: #fff;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2vmin;
}

.stat-label {
  font-size: 1.3vmin;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2.8vmin;
  font-weight: 800;
  line-height: 1;
}

.level-badge {
  background: rgba(255,255,255,0.2);
  padding: 0.2vmin 0.8vmin;
  border-radius: 0.5vmin;
}

.score-val { color: #FFF176; }

.time-val { font-feature-settings: "tnum"; }
.time-warn { color: #FF8A65; animation: pulse 1s infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

/* Rule text */
.rule-bar {
  background: #fff;
  padding: 2vmin 3vmin;
  text-align: center;
  flex-shrink: 0;
  border-bottom: 0.3vmin solid #4A90E2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1vmin;
}

.rule-label {
  font-size: 2.2vmin;
  font-weight: 700;
  color: #4A90E2;
}

.rule-text {
  font-size: 3vmin;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.04em;
}

.keyword-color {
  color: #E53935;
  font-weight: 800;
  font-size: 3.4vmin;
}

.keyword-quantity {
  color: #E53935;
  font-weight: 800;
  font-size: 3.4vmin;
}

.keyword-shape {
  color: #E53935;
  font-weight: 800;
  font-size: 3.4vmin;
}

/* Question timer bar */
.q-timer-wrap {
  height: 0.8vmin;
  background: #dde3f0;
  flex-shrink: 0;
  overflow: hidden;
}

.q-timer-fill {
  height: 100%;
  transition: width 0.1s linear, background 0.5s;
}

/* Main area: keeps ref cards and target card close together */
.main-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5vmin;
  padding: 1.5vmin 3vmin;
}

/* Reference cards area */
.ref-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5vmin;
  flex-shrink: 0;
}

/* Feedback placeholder — fixed height so target card doesn't jump */
.feedback-slot {
  height: 4vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Feedback message */
.feedback-msg {
  text-align: center;
  font-size: 2.8vmin;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1;
}

.fb-correct { color: #2e7d32; }
.fb-wrong   { color: #c62828; }
.fb-timeout { color: #e65100; }

.feedback-fade-enter-active,
.feedback-fade-leave-active { transition: opacity 0.2s; }
.feedback-fade-enter-from,
.feedback-fade-leave-to { opacity: 0; }

/* Target card area */
.target-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vmin;
}

.target-label {
  font-size: 1.6vmin;
  font-weight: 600;
  color: #4A90E2;
  letter-spacing: 0.06em;
}
</style>
