<template>
  <div class="game-screen">
    <!-- Top HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.difficulty }}</span>
          <span class="hud-val diff-val">Lv.{{ currentDiff.level }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-val score-val">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-val time-val" :class="{ urgent: gameTimeLeft <= 10 }">
            {{ formatTime(gameTimeLeft) }}
          </span>
        </div>
      </div>
      <div class="hud-center">
        <span class="rule-text forward" v-if="currentDiff.rule === 'forward'">
          <template v-if="t.forwardRule.includes('顺序')">
            请按照数字出现的<em class="rule-keyword">顺序</em>依次输入
          </template>
          <template v-else>
            Enter digits in the <em class="rule-keyword">ORDER</em> they appeared
          </template>
        </span>
        <span class="rule-text reverse" v-else>
          <template v-if="t.reverseRule.includes('逆序')">
            请按照数字出现的<em class="rule-keyword">逆序</em>依次输入
          </template>
          <template v-else>
            Enter digits in <em class="rule-keyword">REVERSE</em> order
          </template>
        </span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="exit-btn skip-btn" @click="onBatchSkip">
          <span class="exit-icon">⏭</span>
          <span class="exit-label">{{ t.skip }}</span>
        </button>
        <button class="exit-btn" @click="requestExit">
          <span class="exit-icon">&#8592;</span>
          <span class="exit-label">{{ t.exitGame }}</span>
        </button>
      </div>
    </div>

    <!-- Main area -->
    <div class="main-area">
      <!-- Number display phase -->
      <transition name="fade">
        <div v-if="phase === 'showing'" class="number-display">
          <p class="memorize-hint">{{ t.memorize }}</p>
          <div class="digits-row">
            <span v-for="(d, i) in currentNumbers" :key="i" class="digit">{{ d }}</span>
          </div>
          <div class="display-timer-bar">
            <div class="display-timer-fill" :style="{ width: displayTimerWidth + '%' }"></div>
          </div>
        </div>
      </transition>

      <!-- Input phase -->
      <transition name="fade">
        <div v-if="phase === 'inputting'" class="input-phase">
          <div class="input-display">
            <span
              v-for="i in currentDiff.count"
              :key="i"
              class="input-slot"
              :class="{ filled: userInput.length >= i }"
            >{{ userInput[i - 1] !== undefined ? userInput[i - 1] : '' }}</span>
          </div>
          <div class="round-timer-bar">
            <div
              class="round-timer-fill"
              :class="{ low: roundTimeLeft <= 5 }"
              :style="{ width: roundTimerWidth + '%' }"
            ></div>
            <span class="round-timer-text">{{ roundTimeLeft }}s</span>
          </div>
          <div class="numpad">
            <button
              v-for="key in numpadKeys"
              :key="key"
              class="key"
              :class="{
                'key-del': key === 'DEL',
                'key-spacer': key === ''
              }"
              :disabled="key === ''"
              @click="handleKey(key)"
            >
              <span v-if="key === 'DEL'">{{ t.del }}</span>
              <span v-else>{{ key }}</span>
            </button>
          </div>
        </div>
      </transition>

      <!-- Feedback phase -->
      <transition name="scale-fade">
        <div v-if="phase === 'feedback'" class="feedback" :class="lastResult">
          <div class="feedback-icon">{{ lastResult === 'correct' ? '✓' : '✗' }}</div>
          <div class="feedback-text">
            {{ lastResult === 'correct' ? t.correct : (lastResult === 'timeout' ? t.timeout : t.wrong) }}
          </div>
          <div v-if="lastResult === 'correct'" class="feedback-score">+{{ lastScore }}</div>
          <div v-if="diffNotice" class="diff-notice" :class="diffNotice">
            {{ diffNotice === 'up' ? t.diffUp : t.diffDown }}
          </div>
        </div>
      </transition>
    </div>

    <!-- Exit confirm overlay -->
    <transition name="overlay-fade">
      <div v-if="showExitConfirm" class="exit-overlay">
        <div class="exit-dialog">
          <p class="exit-msg">{{ t.exitConfirmMsg }}</p>
          <div class="exit-actions">
            <button class="btn-cancel" @click="cancelExit">{{ t.exitCancel }}</button>
            <button class="btn-confirm" @click="confirmExit">{{ t.exitConfirm }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from '@vue/composition-api'
import {
  DIFFICULTIES, DISPLAY_TIME, PERIOD_SECONDS,
  ACCURACY_UP, ACCURACY_DOWN,
  generateNumbers, calcScore
} from '../gameConfig.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GameScreen',
  props: {
    t: { type: Object, required: true },
    duration: { type: Number, required: true }
  },
  emits: ['game-over', 'exit-game'],

  setup(props, { emit }) {
    const startDifficulty = getBatchStartDifficultyForGame('szfb')
    const difficultyIndex = ref(startDifficulty - 1)
    const pendingDifficultyIndex = ref(null)
    const currentDiff = computed(() => DIFFICULTIES[difficultyIndex.value])

    const score = ref(0)
    const gameTimeLeft = ref(props.duration)

    const phase = ref('showing')
    const currentNumbers = ref([])
    const userInput = ref([])

    const roundTimeLeft = ref(15)
    const displayTimerMax = ref(3000)
    const displayTimerLeft = ref(3000)

    const lastResult = ref('')
    const lastScore = ref(0)
    const diffNotice = ref('')

    const periodStats = ref({ correct: 0, total: 0 })
    const periodElapsed = ref(0)

    const totalCorrect = ref(0)
    const totalQuestions = ref(0)
    const maxDifficulty = ref(startDifficulty)
    const reactionTimes = []   // ms per round (input phase start → resolve)
    let inputStartTime = 0

    const showExitConfirm = ref(false)

    let gameInterval = null
    let roundInterval = null
    let displayInterval = null
    let feedbackTimeout = null

    const numpadKeys = ['1','2','3','4','5','6','7','8','9','DEL','0','']

    const roundTimerWidth = computed(() =>
      (roundTimeLeft.value / currentDiff.value.maxTime) * 100
    )
    const displayTimerWidth = computed(() =>
      (displayTimerLeft.value / displayTimerMax.value) * 100
    )

    function formatTime(s) {
      const m = Math.floor(s / 60)
      const sec = s % 60
      return `${m}:${String(sec).padStart(2, '0')}`
    }

    // --- Timer helpers ---
    function startGameInterval() {
      gameInterval = setInterval(() => {
        if (gameTimeLeft.value <= 0) { endGame(); return }
        gameTimeLeft.value--
        periodElapsed.value++
        if (periodElapsed.value >= PERIOD_SECONDS) {
          checkPeriodDifficulty()
          periodElapsed.value = 0
          periodStats.value = { correct: 0, total: 0 }
        }
        if (gameTimeLeft.value <= 0) endGame()
      }, 1000)
    }

    function startRoundInterval() {
      roundTimeLeft.value = currentDiff.value.maxTime
      roundInterval = setInterval(() => {
        roundTimeLeft.value--
        if (roundTimeLeft.value <= 0) {
          clearInterval(roundInterval)
          resolveAnswer('timeout')
        }
      }, 1000)
    }

    function startDisplayInterval(showMs) {
      displayTimerMax.value = showMs
      displayTimerLeft.value = showMs
      const step = 100
      displayInterval = setInterval(() => {
        displayTimerLeft.value -= step
        if (displayTimerLeft.value <= 0) {
          clearInterval(displayInterval)
          startInputPhase()
        }
      }, step)
    }

    function clearAllTimers() {
      clearInterval(gameInterval)
      clearInterval(roundInterval)
      clearInterval(displayInterval)
      clearTimeout(feedbackTimeout)
    }

    // --- Game flow ---
    function startGame() {
      startGameInterval()
      startRound()
    }

    function startRound() {
      // Apply pending difficulty change before starting new round
      if (pendingDifficultyIndex.value !== null) {
        difficultyIndex.value = pendingDifficultyIndex.value
        pendingDifficultyIndex.value = null
      }
      userInput.value = []
      currentNumbers.value = generateNumbers(currentDiff.value.count)
      phase.value = 'showing'
      startDisplayInterval(DISPLAY_TIME[currentDiff.value.count])
    }

    function startInputPhase() {
      phase.value = 'inputting'
      inputStartTime = Date.now()
      startRoundInterval()
    }

    function handleKey(key) {
      if (phase.value !== 'inputting') return
      if (key === 'DEL') {
        if (userInput.value.length > 0) userInput.value = userInput.value.slice(0, -1)
      } else if (key !== '') {
        if (userInput.value.length < currentDiff.value.count) {
          userInput.value = [...userInput.value, parseInt(key)]
          if (userInput.value.length === currentDiff.value.count) {
            clearInterval(roundInterval)
            checkAnswer()
          }
        }
      }
    }

    function checkAnswer() {
      const expected = currentDiff.value.rule === 'forward'
        ? [...currentNumbers.value]
        : [...currentNumbers.value].reverse()
      const correct = userInput.value.length === expected.length &&
                      userInput.value.every((v, i) => v === expected[i])
      resolveAnswer(correct ? 'correct' : 'wrong')
    }

    function resolveAnswer(result) {
      clearInterval(roundInterval)
      clearInterval(displayInterval)
      reactionTimes.push(Date.now() - inputStartTime)
      totalQuestions.value++
      periodStats.value.total++

      if (result === 'correct') {
        const pts = calcScore(currentDiff.value.coefficient)
        score.value += pts
        lastScore.value = pts
        totalCorrect.value++
        periodStats.value.correct++
        if (currentDiff.value.level > maxDifficulty.value) maxDifficulty.value = currentDiff.value.level
      }

      lastResult.value = result
      diffNotice.value = ''
      phase.value = 'feedback'

      feedbackTimeout = setTimeout(() => {
        diffNotice.value = ''
        if (gameTimeLeft.value <= 0) endGame()
        else startRound()
      }, 1500)
    }

    function checkPeriodDifficulty() {
      const { correct, total } = periodStats.value
      if (total === 0) return
      const rate = correct / total
      let notice = ''
      if (rate >= ACCURACY_UP && difficultyIndex.value < DIFFICULTIES.length - 1) {
        pendingDifficultyIndex.value = difficultyIndex.value + 1
        notice = 'up'
      } else if (rate <= ACCURACY_DOWN && difficultyIndex.value > 0) {
        pendingDifficultyIndex.value = difficultyIndex.value - 1
        notice = 'down'
      }
      if (notice && phase.value === 'feedback') diffNotice.value = notice
    }

    function endGame() {
      clearAllTimers()
      const avgReaction = reactionTimes.length
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 100) / 10
        : 0
      emit('game-over', {
        finalScore: score.value,
        totalCorrect: totalCorrect.value,
        totalQuestions: totalQuestions.value,
        maxDifficulty: currentDiff.value.level, // 与 HUD 当前难度一致（供上传）
        duration: props.duration,
        minReactionTime: reactionTimes.length ? parseFloat((Math.min(...reactionTimes) / 1000).toFixed(2)) : 0,
        maxReactionTime: reactionTimes.length ? parseFloat((Math.max(...reactionTimes) / 1000).toFixed(2)) : 0,
        avgReactionTime: parseFloat(avgReaction).toFixed(2)
      })
    }

    // --- Pause / Exit ---
    function requestExit() {
      clearAllTimers()
      showExitConfirm.value = true
    }

    function cancelExit() {
      showExitConfirm.value = false
      // Restart game timer
      startGameInterval()
      // Restart the appropriate phase timer
      if (phase.value === 'inputting' && roundTimeLeft.value > 0) {
        roundInterval = setInterval(() => {
          roundTimeLeft.value--
          if (roundTimeLeft.value <= 0) {
            clearInterval(roundInterval)
            resolveAnswer('timeout')
          }
        }, 1000)
      } else if (phase.value === 'showing' && displayTimerLeft.value > 0) {
        const step = 100
        displayInterval = setInterval(() => {
          displayTimerLeft.value -= step
          if (displayTimerLeft.value <= 0) {
            clearInterval(displayInterval)
            startInputPhase()
          }
        }, step)
      }
    }

    const showBatchSkip = shouldShowPbBatchSkip()
    function onBatchSkip() { skipPbBatchGame() }

    function confirmExit() {
      showExitConfirm.value = false
      clearAllTimers()
      leavePbGameWindow({ confirm: false })
    }

    onUnmounted(clearAllTimers)
    startGame()

    return {
      currentDiff, score, gameTimeLeft,
      phase, currentNumbers, userInput,
      roundTimeLeft, roundTimerWidth,
      displayTimerWidth,
      lastResult, lastScore, diffNotice,
      numpadKeys, showExitConfirm,
      formatTime, handleKey,
      showBatchSkip, onBatchSkip,
      requestExit, cancelExit, confirmExit
    }
  }
}
</script>

<style scoped>
.game-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #fff9e9, #f5e9c7);
  overflow: hidden;
}

/* HUD */
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5% 3%;
  background: rgba(255,255,255,0.95);
  border-bottom: 0.1rem solid rgba(74, 144, 226, 0.2);
  flex-shrink: 0;
  gap: 1rem;
}

.hud-left {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex: 0 0 auto;
}

.hud-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
}

.rule-text {
  color: #333;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.6);
  padding: 0.5rem 1.2rem;
  border-radius: 2rem;
  border: 0.15rem solid rgba(74, 144, 226, 0.25);
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.rule-keyword {
  font-style: normal;
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.9rem;
  border-radius: 2rem;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.5;
}

.rule-text.forward .rule-keyword {
  background: linear-gradient(135deg, #4A90E2, #357abd);
  color: #fff;
  box-shadow: 0 2px 8px rgba(74,144,226,0.4);
}

.rule-text.reverse .rule-keyword {
  background: linear-gradient(135deg, #e53e3e, #c0392b);
  color: #fff;
  box-shadow: 0 2px 8px rgba(229,62,62,0.4);
}

.hud-right {
  flex: 0 0 auto;
  display: flex;
  gap: 10px;
  align-items: center;
}

.exit-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #f5f5f5;
  border: 0.1rem solid #ddd;
  color: #666;
  border-radius: 0.4rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  white-space: nowrap;
}
.exit-btn:hover { background: #e9e9e9; }

.exit-icon { font-size: 0.9rem; }

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}
.hud-label {
  font-size: 0.65rem;
  color: rgba(0,0,0,0.5);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hud-val { font-size: 1.1rem; font-weight: 700; color: #333; }
.diff-val { color: #4A90E2; }
.score-val { color: #4A90E2; }
.time-val { color: #4A90E2; }
.time-val.urgent { color: #f87171; animation: blink 0.5s step-end infinite; }

@keyframes blink { 50% { opacity: 0.4; } }

.main-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Number display */
.number-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vh;
  position: absolute;
  width: 100%;
}
.memorize-hint {
  color: #40627c;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  margin: 0;
}
.digits-row { display: flex; gap: 0.8rem; justify-content: center; }
.digit {
  font-size: min(6rem, 12vw);
  font-weight: 900;
  color: #245481;
  background: #fffdf7;
  border: 0.15rem solid rgba(74, 144, 226, 0.3);
  border-radius: 0.8rem;
  width: min(5rem, 11vw);
  height: min(6.5rem, 14vw);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
}
.display-timer-bar {
  width: min(80%, 20rem);
  height: 0.3rem;
  background: rgba(255,255,255,0.1);
  border-radius: 1rem;
  overflow: hidden;
}
.display-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0078ff);
  border-radius: 1rem;
  transition: width 0.1s linear;
}

/* Input phase */
.input-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vh;
  position: absolute;
  width: 100%;
  padding: 0 5%;
}
.input-display { display: flex; gap: 0.5rem; justify-content: center; }
.input-slot {
  font-size: min(3rem, 7vw);
  font-weight: 700;
  color: #4A90E2;
  background: rgba(255,255,255,0.9);
  border: 0.12rem solid rgba(74, 144, 226, 0.3);
  border-radius: 0.5rem;
  width: min(3.5rem, 8vw);
  height: min(4rem, 9vw);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
}
.input-slot.filled {
  background: rgba(74, 144, 226, 0.1);
  border-color: rgba(74, 144, 226, 0.6);
  color: #4A90E2;
}

.round-timer-bar {
  width: min(80%, 20rem);
  height: 0.35rem;
  background: rgba(255,255,255,0.1);
  border-radius: 1rem;
  overflow: visible;
  position: relative;
}
.round-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 1rem;
  transition: width 1s linear, background 0.3s;
}
.round-timer-fill.low { background: linear-gradient(90deg, #f87171, #ef4444); }
.round-timer-text {
  position: absolute;
  right: -0.1rem;
  top: 50%;
  transform: translateY(-50%) translateX(120%);
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

/* Numpad */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: min(0.6rem, 1.5vw);
  width: min(18rem, 60vw);
}
.key {
  aspect-ratio: 1.2;
  border-radius: 0.6rem;
  border: 0.1rem solid #ddd;
  background: white;
  color: #4A90E2;
  font-size: min(1.3rem, 3.5vw);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  touch-action: manipulation;
}
.key:hover { background: #f5f5f5; border-color: #4A90E2; }
.key:active { transform: scale(0.93); background: #e9e9e9; }
.key-del { background: #f5f5f5; border-color: #ddd; color: #666; font-size: min(0.8rem, 2.2vw); }
.key-spacer { background: transparent; border-color: transparent; cursor: default; pointer-events: none; }

/* Feedback */
.feedback {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}
.feedback-icon { font-size: min(5rem, 15vw); font-weight: 900; line-height: 1; }
.feedback-text { font-size: min(1.4rem, 4vw); font-weight: 700; }
.feedback-score { font-size: min(1.1rem, 3vw); color: #4d5559; }
.diff-notice {
  font-size: min(0.85rem, 2.5vw);
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-weight: 600;
}
.feedback.correct .feedback-icon, .feedback.correct .feedback-text { color: #17663d; }
.feedback.wrong .feedback-icon, .feedback.wrong .feedback-text { color: #9c283b; }
.feedback.timeout .feedback-icon, .feedback.timeout .feedback-text { color: #79510e; }
.diff-notice.up { background: rgba(74, 222, 128, 0.15); color: #17663d; border: 0.05rem solid rgba(74, 222, 128, 0.3); }
.diff-notice.down { background: rgba(251, 191, 36, 0.15); color: #79510e; border: 0.05rem solid rgba(251, 191, 36, 0.3); }

/* Exit confirm overlay */
.exit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(0.2rem);
}
.exit-dialog {
  background: linear-gradient(135deg, #141830, #1e2040);
  border: 0.1rem solid rgba(255, 100, 100, 0.35);
  border-radius: 1rem;
  padding: 2rem 2.5rem;
  width: min(85vw, 22rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 0 2rem rgba(0,0,0,0.5);
}
.exit-msg {
  color: #fff;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}
.exit-actions { display: flex; gap: 0.8rem; width: 100%; }
.btn-cancel {
  flex: 1;
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: 0.1rem solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-cancel:hover { background: rgba(255,255,255,0.15); }
.btn-confirm {
  flex: 1;
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}
.btn-confirm:hover { opacity: 0.85; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-fade-enter-active { transition: opacity 0.25s, transform 0.25s; }
.scale-fade-leave-active { transition: opacity 0.2s; }
.scale-fade-enter-from { opacity: 0; transform: scale(0.7); }
.scale-fade-leave-to { opacity: 0; }
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.2s; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
</style>
