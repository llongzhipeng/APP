<template>
  <div class="game-page">
    <!-- Top status bar -->
    <div class="status-bar">
      <!-- Quit button -->
      <div class="quit-group">
        <button v-if="showBatchSkip" class="quit-btn skip-btn" @click="onBatchSkip">
          ⏭ {{ t('skipGame') }}
        </button>
        <button class="quit-btn" @click="showQuitConfirm = true">
          ✕ {{ t('quitGame') }}
        </button>
      </div>

      <div class="status-items">
        <div class="status-item">
          <span class="status-label">{{ t('difficultyLabel') }}</span>
          <span class="status-value">{{ difficulty }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">{{ t('scoreLabel') }}</span>
          <span class="status-value score-val">{{ displayScore }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">{{ t('timeLabel') }}</span>
          <span class="status-value" :class="{ 'time-warning': gameTimeLeft <= 10 }">
            {{ gameTimeLeft }}s
          </span>
        </div>
      </div>
    </div>

    <!-- Instruction (prominent) -->
    <div class="instruction">
      <span class="instruction-icon">👁</span>
      {{ t('instruction') }}
    </div>

    <!-- Quit confirmation overlay -->
    <transition name="fade">
      <div v-if="showQuitConfirm" class="confirm-overlay">
        <div class="confirm-box">
          <p class="confirm-msg">{{ t('quitConfirm') }}</p>
          <div class="confirm-btns">
            <button class="cbtn cbtn-yes" @click="confirmQuit">{{ t('quitYes') }}</button>
            <button class="cbtn cbtn-no"  @click="showQuitConfirm = false">{{ t('quitNo') }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Word display area -->
    <div class="word-area">
      <div
        class="game-word"
        :style="{ color: currentColor }"
        :class="feedbackClass"
      >{{ currentWordText }}</div>
    </div>

    <!-- Question timer bar -->
    <div class="q-timer-wrap">
      <div
        class="q-timer-bar"
        :style="{ width: questionTimePct + '%' }"
        :class="{ danger: questionTimeLeft <= 2 }"
      ></div>
    </div>
    <div class="q-timer-label">{{ questionTimeLeft }}s</div>

    <!-- Feedback overlay text -->
    <transition name="fade">
      <div v-if="feedback" class="feedback-overlay" :class="feedback">
        <span v-if="feedback === 'correct'">✓</span>
        <span v-else-if="feedback === 'wrong'">✗</span>
        <span v-else>{{ t('timeUp') }}</span>
      </div>
    </transition>

    <!-- Answer buttons 2×2 -->
    <div class="answers">
      <button
        v-for="c in colorOptions"
        :key="c.key"
        class="ans-btn"
        :class="{ 'ans-btn-plain': difficulty >= 3 }"
        :style="difficulty < 3
          ? { background: c.hex, color: '#fff', borderColor: c.hex }
          : { background: '#f5f5f5', color: '#333', borderColor: '#ccc' }"
        :disabled="!!feedback || isGameOver"
        @click="handleAnswer(c.key)"
      >{{ lang === 'zh' ? c.btnZh : c.btnEn }}</button>
    </div>

    <!-- 30s window progress indicator -->
    <div class="window-bar-wrap">
      <div class="window-bar" :style="{ width: windowPct + '%' }"></div>
      <span class="window-label">{{ windowSecondsElapsed }}s / 30s</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import { translations } from '../i18n.js'
import { COLORS, COLOR_KEYS, DIFFICULTY_CONFIG } from '../gameConfig.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const COLOR_MAP = {
  red:    { hex: '#E57373', wordZh: '红', wordEn: 'Red',    btnZh: '红色', btnEn: 'Red'    },
  green:  { hex: '#81C784', wordZh: '绿', wordEn: 'Green',  btnZh: '绿色', btnEn: 'Green'  },
  blue:   { hex: '#64B5F6', wordZh: '蓝', wordEn: 'Blue',   btnZh: '蓝色', btnEn: 'Blue'   },
  yellow: { hex: '#FFD54F', wordZh: '黄', wordEn: 'Yellow', btnZh: '黄色', btnEn: 'Yellow' },
}

export default {
  name: 'GamePage',
  props: {
    lang:     { type: String, default: 'zh' },
    duration: { type: Number, default: 60  },
  },
  emits: ['end'],
  setup(props, { emit }) {
    const t = (key) => translations[props.lang][key] || key

    // ── reactive state ──────────────────────────────────────────
    const startDifficulty   = getBatchStartDifficultyForGame('ystz')
    const difficulty        = ref(startDifficulty)
    const score             = ref(0)
    const gameTimeLeft      = ref(props.duration)
    const questionTimeLeft  = ref(DIFFICULTY_CONFIG[startDifficulty].timeLimit)
    const currentWordKey    = ref('red')
    const currentColorKey   = ref('red')
    const totalQuestions    = ref(0)
    const correctAnswers    = ref(0)
    const reactionTimes     = ref([])
    const maxDifficulty     = ref(startDifficulty)
    const windowTotal       = ref(0)
    const windowCorrect     = ref(0)
    const windowSecondsElapsed = ref(0)
    const feedback          = ref(null) // null | 'correct' | 'wrong' | 'timeout'
    const isGameOver        = ref(false)
    const isTransitioning   = ref(false)
    const questionStartTime = ref(Date.now())
    const showQuitConfirm   = ref(false)
    let   gameInterval      = null

    // ── computed ────────────────────────────────────────────────
    const colorOptions = computed(() =>
      COLOR_KEYS.map(k => ({ key: k, hex: COLOR_MAP[k].hex, btnZh: COLOR_MAP[k].btnZh, btnEn: COLOR_MAP[k].btnEn }))
    )
    const currentColor    = computed(() => COLOR_MAP[currentColorKey.value].hex)
    const currentWordText = computed(() =>
      props.lang === 'zh'
        ? COLOR_MAP[currentWordKey.value].wordZh
        : COLOR_MAP[currentWordKey.value].wordEn
    )
    const questionTimeMax = computed(() => DIFFICULTY_CONFIG[difficulty.value].timeLimit)
    const questionTimePct = computed(() =>
      Math.max(0, (questionTimeLeft.value / questionTimeMax.value) * 100)
    )
    const windowPct       = computed(() => (windowSecondsElapsed.value / 30) * 100)
    const displayScore    = computed(() => {
      const s = score.value
      return Number.isInteger(s) ? s : s.toFixed(1)
    })
    const feedbackClass   = computed(() => feedback.value ? `flash-${feedback.value}` : '')

    // ── helpers ─────────────────────────────────────────────────
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

    function generateQuestion() {
      const wordKey = rand(COLOR_KEYS)
      let colorKey
      if (!DIFFICULTY_CONFIG[difficulty.value].mismatch) {
        colorKey = wordKey
      } else {
        const others = COLOR_KEYS.filter(k => k !== wordKey)
        colorKey = rand(others)
      }
      currentWordKey.value   = wordKey
      currentColorKey.value  = colorKey
      questionTimeLeft.value = DIFFICULTY_CONFIG[difficulty.value].timeLimit
      questionStartTime.value = Date.now()
    }

    function checkWindowDifficulty() {
      if (windowTotal.value > 0) {
        const acc = windowCorrect.value / windowTotal.value
        if (acc >= 0.9 && difficulty.value < 6) {
          difficulty.value++
        } else if (acc < 0.7 && difficulty.value > 1) {
          difficulty.value--
        }
        if (difficulty.value > maxDifficulty.value) {
          maxDifficulty.value = difficulty.value
        }
      }
      windowTotal.value          = 0
      windowCorrect.value        = 0
      windowSecondsElapsed.value = 0
      // Reset question timer for new difficulty
      questionTimeLeft.value = DIFFICULTY_CONFIG[difficulty.value].timeLimit
    }

    function endGame() {
      if (isGameOver.value) return
      isGameOver.value = true
      clearInterval(gameInterval)

      const avg = reactionTimes.value.length > 0
        ? Math.round(reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length)
        : 0

      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ` +
                      `${pad(now.getHours())}:${pad(now.getMinutes())}`

      const total   = totalQuestions.value
      const correct = correctAnswers.value
      const wrong   = total - correct
      const rate    = total > 0 ? Math.round(correct / total * 1000) / 10 : 0
      const sc      = Math.round(score.value * 10) / 10

      emit('end', {
        id:              Date.now(),
        date:            dateStr,
        project:         props.lang === 'zh' ? '颜色挑战' : 'Color Challenge',
        maxDifficulty:   difficulty.value, // 与 HUD 当前难度一致（供上传）
        duration:        props.duration,
        total,
        correct,
        wrong,
        successRate:     rate,
        avgReactionTime: avg,
        minReactionTime: reactionTimes.value.length ? Math.min(...reactionTimes.value) : 0,
        maxReactionTime: reactionTimes.value.length ? Math.max(...reactionTimes.value) : 0,
        score:           sc,
      })
    }

    function handleTimeout() {
      if (isTransitioning.value || isGameOver.value) return
      isTransitioning.value = true
      totalQuestions.value++
      windowTotal.value++
      feedback.value = 'timeout'
      setTimeout(() => {
        feedback.value        = null
        isTransitioning.value = false
        if (!isGameOver.value) generateQuestion()
      }, 700)
    }

    function handleAnswer(colorKey) {
      if (isTransitioning.value || isGameOver.value) return
      const rt = Date.now() - questionStartTime.value
      reactionTimes.value.push(rt)
      totalQuestions.value++
      windowTotal.value++
      if (colorKey === currentColorKey.value) {
        correctAnswers.value++
        windowCorrect.value++
        score.value += 5 * DIFFICULTY_CONFIG[difficulty.value].coefficient
        feedback.value = 'correct'
      } else {
        feedback.value = 'wrong'
      }
      isTransitioning.value = true
      setTimeout(() => {
        feedback.value        = null
        isTransitioning.value = false
        if (!isGameOver.value) generateQuestion()
      }, 600)
    }

    // ── lifecycle ───────────────────────────────────────────────
    onMounted(() => {
      generateQuestion()
      gameInterval = setInterval(() => {
        if (isGameOver.value) return

        // Game countdown
        gameTimeLeft.value--
        if (gameTimeLeft.value <= 0) { endGame(); return }

        // 30-second window tracking
        windowSecondsElapsed.value++
        if (windowSecondsElapsed.value >= 30) checkWindowDifficulty()

        // Question countdown (pause during transition)
        if (!isTransitioning.value) {
          questionTimeLeft.value--
          if (questionTimeLeft.value <= 0) handleTimeout()
        }
      }, 1000)
    })

    const showBatchSkip = shouldShowPbBatchSkip()
    function onBatchSkip() { skipPbBatchGame() }

    function confirmQuit() {
      showQuitConfirm.value = false
      clearInterval(gameInterval)
      leavePbGameWindow({ confirm: false })
    }

    onUnmounted(() => clearInterval(gameInterval))

    return {
      t,
      difficulty, score, displayScore, gameTimeLeft,
      questionTimeLeft, questionTimePct, windowPct, windowSecondsElapsed,
      currentWordText, currentColor, feedbackClass,
      colorOptions, feedback, isGameOver,
      showQuitConfirm, confirmQuit,
      showBatchSkip, onBatchSkip,
      handleAnswer,
      COLORS,
    }
  },
}
</script>

<style scoped>
.game-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1vmin 3vmin 1vmin;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  box-sizing: border-box;
}

/* ─── Status bar ─── */
.status-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 2vmin;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.2vmin 2vmin;
  flex-shrink: 0;
}
.status-items {
  flex: 1;
  display: flex;
  justify-content: space-around;
}
.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3vmin;
}
.status-label {
  font-size: 1.5vmin;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.1vmin;
}
.status-value {
  font-size: 3.2vmin;
  font-weight: 700;
  color: #333;
}
.score-val { color: #FF9800; }
.time-warning { color: #f44336; animation: blink 0.6s infinite; }
@keyframes blink { 50% { opacity: 0.4; } }

/* ─── Instruction (prominent) ─── */
.instruction {
  margin-top: 1vmin;
  padding: 1vmin 3vmin;
  font-size: 2.4vmin;
  font-weight: 700;
  color: #fff;
  text-align: center;
  background: #4A90E2;
  border: 2px solid #357abd;
  border-radius: 8px;
  letter-spacing: 0.05vmin;
  flex-shrink: 0;
  width: 95%;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}
.instruction-icon {
  margin-right: 1vmin;
  font-style: normal;
}

/* ─── Quit button ─── */
.quit-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
.quit-btn {
  padding: 0.8vmin 1.8vmin;
  font-size: 1.7vmin;
  font-weight: 600;
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #f44336;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
.quit-btn:hover {
  background: #ffebee;
  border-color: #f44336;
}

/* ─── Quit confirm overlay ─── */
.confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.confirm-box {
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 4vmin 5vmin;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3vmin;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.confirm-msg {
  font-size: 2.8vmin;
  font-weight: 600;
  color: #333;
}
.confirm-btns {
  display: flex;
  gap: 2vmin;
  justify-content: center;
}
.cbtn {
  padding: 1.2vmin 3.5vmin;
  font-size: 2.2vmin;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.cbtn:hover { transform: scale(1.02); }
.cbtn-yes {
  background: #f44336;
  color: #fff;
}
.cbtn-no {
  background: #4A90E2;
  color: #fff;
}

/* ─── Word area ─── */
.word-area {
  flex: 1 1 0;
  min-height: 0;
  max-height: 28vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.game-word {
  font-size: min(18vmin, 22vh);
  font-weight: 900;
  user-select: none;
  transition: color 0.1s;
  text-shadow: 0 2px 8px rgba(0,0,0,0.1);
  line-height: 1;
}
.flash-correct { animation: flashCorrect 0.55s ease; }
.flash-wrong   { animation: flashWrong   0.55s ease; }
.flash-timeout { animation: flashTimeout 0.65s ease; }
@keyframes flashCorrect {
  0%,100% { transform: scale(1); }
  40%     { transform: scale(1.1); filter: brightness(1.3); }
}
@keyframes flashWrong {
  0%,100% { transform: scale(1); }
  40%     { transform: scale(0.95); filter: brightness(0.7); }
}
@keyframes flashTimeout {
  0%,100% { opacity: 1; }
  40%     { opacity: 0.3; }
}

/* ─── Question timer bar ─── */
.q-timer-wrap {
  width: 90%;
  height: 0.8vmin;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}
.q-timer-bar {
  height: 100%;
  background: #4A90E2;
  border-radius: 4px;
  transition: width 1s linear, background 0.3s;
}
.q-timer-bar.danger { background: #f44336; }
.q-timer-label {
  font-size: 1.6vmin;
  color: #666;
  margin-top: 0.5vmin;
  flex-shrink: 0;
}

/* ─── Feedback overlay ─── */
.feedback-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 15vmin;
  font-weight: 900;
  pointer-events: none;
  z-index: 10;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.feedback-overlay.correct { color: #4CAF50; }
.feedback-overlay.wrong   { color: #f44336; }
.feedback-overlay.timeout {
  font-size: 4vmin;
  color: #666;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ─── Answer buttons ─── */
.answers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5vmin;
  width: 90%;
  flex-shrink: 0;
  margin: 2vmin 0 1vmin;
}
.ans-btn {
  padding: 2.5vmin 0;
  font-size: 2.8vmin;
  font-weight: 700;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.1s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.ans-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.ans-btn:active:not(:disabled) { transform: translateY(0); }
.ans-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ─── 30s window bar ─── */
.window-bar-wrap {
  width: 90%;
  height: 0.6vmin;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}
.window-bar {
  height: 100%;
  background: #FF9800;
  border-radius: 4px;
  transition: width 1s linear;
}
.window-label {
  display: none;
}
</style>
