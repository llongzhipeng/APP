<template>
  <div class="game-screen">
    <div class="bg-image"></div>
    <div class="bg-veil"></div>

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
          <template v-if="ruleForwardIsZh">
            请按照数字出现的<em class="rule-keyword">顺序</em>依次输入
          </template>
          <template v-else>
            Enter digits in the <em class="rule-keyword">ORDER</em> heard
          </template>
        </span>
        <span class="rule-text reverse" v-else>
          <template v-if="ruleReverseIsZh">
            请按照数字出现的<em class="rule-keyword">逆序</em>依次输入
          </template>
          <template v-else>
            Enter digits in <em class="rule-keyword">REVERSE</em> order
          </template>
        </span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">
          <span class="skip-label">{{ t.skipGame }}</span>
        </button>
        <button class="exit-btn" @click="requestExit">
          <span class="exit-icon">&#8592;</span>
          <span class="exit-label">{{ t.exitGame }}</span>
        </button>
      </div>
    </div>

    <!-- Main area -->
    <div class="main-area">
      <!-- Broadcast phase -->
      <transition name="fade">
        <div v-if="phase === 'showing'" class="broadcast-panel">
          <div class="on-air-tag">
            <span class="live-dot"></span>
            <span>{{ t.onAir }}</span>
            <span class="room-label">· {{ t.broadcastRoom }}</span>
          </div>
          <p class="listen-hint">{{ isPlayingRule ? rulePromptText : t.listening }}</p>

          <div class="speaker-stage">
            <div class="speaker-orb" :class="{ pulsing: isPlayingDigit || isPlayingRule, rule: isPlayingRule }">
              <div class="ring r1"></div>
              <div class="ring r2"></div>
              <div class="ring r3"></div>
              <div class="mic-glyph">🎙</div>
            </div>
            <div class="digit-dots">
              <span
                v-for="i in currentNumbers.length"
                :key="i"
                class="dot"
                :class="{
                  played: currentDigitIdx >= i,
                  active: currentDigitIdx === i - 1
                }"
              ></span>
            </div>
          </div>

          <button
            class="replay-btn"
            :disabled="isPlayingDigit || isPlayingRule || replayCount >= maxReplays"
            @click="replay"
          >
            🔁 {{ t.replay }}
            <span class="replay-count" v-if="maxReplays > 0">
              ({{ maxReplays - replayCount }})
            </span>
          </button>
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

      <!-- Feedback -->
      <transition name="scale-fade">
        <div v-if="phase === 'feedback'" class="feedback" :class="lastResult">
          <div class="feedback-icon">{{ lastResult === 'correct' ? '✓' : '✗' }}</div>
          <div class="feedback-text">
            {{ lastResult === 'correct' ? t.correct : (lastResult === 'timeout' ? t.timeout : t.wrong) }}
          </div>
          <div v-if="lastResult === 'correct'" class="feedback-score">+{{ lastScore }}</div>
          <div v-if="lastResult !== 'correct'" class="reveal-answer">
            {{ answerLabel }}: <span>{{ currentNumbers.join(' ') }}</span>
          </div>
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
import { resolveImage } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import {
  DIFFICULTIES, VOICE_GAP, PERIOD_SECONDS,
  ACCURACY_UP, ACCURACY_DOWN,
  generateNumbers, calcScore
} from '../gameConfig.js'
import { playSequence, preloadAll, warmupForRound } from '../voicePlayer.js'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GameScreen',
  props: {
    t: { type: Object, required: true },
    lang: { type: String, default: 'zh' },
    duration: { type: Number, required: true }
  },
  emits: ['game-over', 'exit-game'],
  data() {
    return {
      difficultyIndex: Math.max(0, getBatchStartDifficultyForGame('szfbyy') - 1),
      pendingDifficultyIndex: null,
      score: 0,
      gameTimeLeft: this.duration,

      phase: 'showing',
      currentNumbers: [],
      userInput: [],
      currentDigitIdx: -1,
      isPlayingDigit: false,
      isPlayingRule: false,

      roundTimeLeft: 15,
      lastResult: '',
      lastScore: 0,
      diffNotice: '',

      periodCorrect: 0,
      periodTotal: 0,
      periodElapsed: 0,

      totalCorrect: 0,
      totalQuestions: 0,
      maxDifficulty: 1,
      reactionTimes: [],
      inputStartTime: 0,

      replayCount: 0,
      maxReplays: 1,

      showExitConfirm: false,

      isFirstRound: true,

      numpadKeys: ['1','2','3','4','5','6','7','8','9','DEL','0',''],

      gameInterval: null,
      roundInterval: null,
      feedbackTimeout: null,
      voiceCtl: null,
      wasPausedDuringInput: false,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    currentDiff() { return DIFFICULTIES[this.difficultyIndex] },
    roundTimerWidth() {
      return (this.roundTimeLeft / this.currentDiff.maxTime) * 100
    },
    ruleForwardIsZh() { return this.t.forwardRule && this.t.forwardRule.indexOf('顺序') !== -1 },
    ruleReverseIsZh() { return this.t.reverseRule && this.t.reverseRule.indexOf('逆序') !== -1 },
    answerLabel() { return this.t.confirm && this.t.correct ? (this.ruleForwardIsZh ? '答案' : 'Answer') : 'Answer' },
    rulePromptText() {
      const isZh = this.lang !== 'en'
      if (this.currentDiff.rule === 'reverse') {
        return isZh ? '正在播报题目要求（逆序）...' : 'Playing rule prompt (reverse)...'
      }
      return isZh ? '正在播报题目要求（顺序）...' : 'Playing rule prompt (order)...'
    }
  },
  mounted() {
    preloadAll(this.lang)
    this.startGame()
  },
  beforeDestroy() {
    this.clearAllTimers()
    if (this.voiceCtl) this.voiceCtl.cancel()
  },
  methods: {
    formatTime(s) {
      const m = Math.floor(s / 60)
      const sec = s % 60
      return `${m}:${String(sec).padStart(2, '0')}`
    },

    startGameInterval() {
      this.gameInterval = setInterval(() => {
        if (this.gameTimeLeft <= 0) { this.endGame(); return }
        this.gameTimeLeft--
        this.periodElapsed++
        if (this.periodElapsed >= PERIOD_SECONDS) {
          this.checkPeriodDifficulty()
          this.periodElapsed = 0
          this.periodCorrect = 0
          this.periodTotal = 0
        }
        if (this.gameTimeLeft <= 0) this.endGame()
      }, 1000)
    },

    startRoundInterval() {
      this.roundTimeLeft = this.currentDiff.maxTime
      this.roundInterval = setInterval(() => {
        this.roundTimeLeft--
        if (this.roundTimeLeft <= 0) {
          clearInterval(this.roundInterval)
          this.resolveAnswer('timeout')
        }
      }, 1000)
    },

    clearAllTimers() {
      clearInterval(this.gameInterval)
      clearInterval(this.roundInterval)
      clearTimeout(this.feedbackTimeout)
      clearTimeout(this.firstRoundDelayTimer)
    },

    startGame() {
      this.startGameInterval()
      this.startRound()
    },

    startRound() {
      if (this.pendingDifficultyIndex !== null) {
        this.difficultyIndex = this.pendingDifficultyIndex
        this.pendingDifficultyIndex = null
      }
      this.userInput = []
      this.currentNumbers = generateNumbers(this.currentDiff.count)
      this.phase = 'showing'
      this.currentDigitIdx = -1
      this.replayCount = 0
      // Re-warm the audio pipeline between rounds — on Edge Android the
      // <audio> decoders otherwise go cold during the input phase and the
      // first digit of the next round comes out silent.
      try { warmupForRound(this.lang) } catch (e) {}
      // On the very first round of this game instance, give the audio pipeline
      // ~1s to warm up before broadcasting the first digit. Without this, on
      // some tablet browsers the first digit is inaudible.
      if (this.isFirstRound) {
        this.isFirstRound = false
        this.firstRoundDelayTimer = setTimeout(() => {
          if (this.phase === 'showing') this.playCurrentSequence()
        }, 1000)
      } else {
        // Give the warmup silent buffer (~400ms) time to fully open the
        // Android output pipeline's AGC gate before the first real digit.
        // Without this, the first digit of every round is quiet.
        this.firstRoundDelayTimer = setTimeout(() => {
          if (this.phase === 'showing') this.playCurrentSequence()
        }, 600)
      }
    },

    playCurrentSequence() {
      if (this.voiceCtl) this.voiceCtl.cancel()
      this.isPlayingDigit = false
      this.currentDigitIdx = -1
      this.isPlayingRule = false

      const digits = this.currentNumbers
      const rule = this.currentDiff.rule
      this.voiceCtl = playSequence(digits, VOICE_GAP, (i) => {
        if (i >= 0) {
          this.currentDigitIdx = i
          this.isPlayingDigit = true
        } else if (i === -1) {
          this.isPlayingDigit = false
          if (this.phase === 'showing') this.startInputPhase()
        } else if (i === -2) {
          this.isPlayingRule = true
        } else if (i === -3) {
          this.isPlayingRule = false
        }
      }, this.lang, rule)
    },

    replay() {
      if (this.replayCount >= this.maxReplays) return
      if (this.isPlayingDigit) return
      this.replayCount++
      this.playCurrentSequence()
    },

    startInputPhase() {
      this.phase = 'inputting'
      this.inputStartTime = Date.now()
      this.startRoundInterval()
    },

    handleKey(key) {
      if (this.phase !== 'inputting') return
      if (key === 'DEL') {
        if (this.userInput.length > 0) this.userInput = this.userInput.slice(0, -1)
      } else if (key !== '') {
        if (this.userInput.length < this.currentDiff.count) {
          this.userInput = this.userInput.concat(parseInt(key))
          if (this.userInput.length === this.currentDiff.count) {
            clearInterval(this.roundInterval)
            this.checkAnswer()
          }
        }
      }
    },

    checkAnswer() {
      const expected = this.currentDiff.rule === 'forward'
        ? this.currentNumbers.slice()
        : this.currentNumbers.slice().reverse()
      const correct = this.userInput.length === expected.length &&
                      this.userInput.every((v, i) => v === expected[i])
      this.resolveAnswer(correct ? 'correct' : 'wrong')
    },

    resolveAnswer(result) {
      clearInterval(this.roundInterval)
      if (this.voiceCtl) this.voiceCtl.cancel()
      this.reactionTimes.push(Date.now() - this.inputStartTime)
      this.totalQuestions++
      this.periodTotal++

      if (result === 'correct') {
        const pts = calcScore(this.currentDiff.coefficient)
        this.score += pts
        this.lastScore = pts
        this.totalCorrect++
        this.periodCorrect++
        if (this.currentDiff.level > this.maxDifficulty) this.maxDifficulty = this.currentDiff.level
      }

      this.lastResult = result
      this.diffNotice = ''
      this.phase = 'feedback'

      this.feedbackTimeout = setTimeout(() => {
        this.diffNotice = ''
        if (this.gameTimeLeft <= 0) this.endGame()
        else this.startRound()
      }, 1500)
    },

    checkPeriodDifficulty() {
      const total = this.periodTotal
      if (total === 0) return
      const rate = this.periodCorrect / total
      let notice = ''
      if (rate >= ACCURACY_UP && this.difficultyIndex < DIFFICULTIES.length - 1) {
        this.pendingDifficultyIndex = this.difficultyIndex + 1
        notice = 'up'
      } else if (rate <= ACCURACY_DOWN && this.difficultyIndex > 0) {
        this.pendingDifficultyIndex = this.difficultyIndex - 1
        notice = 'down'
      }
      if (notice && this.phase === 'feedback') this.diffNotice = notice
    },

    endGame() {
      this.clearAllTimers()
      if (this.voiceCtl) this.voiceCtl.cancel()
      const avgReaction = this.reactionTimes.length
        ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length / 100) / 10
        : 0
      this.$emit('game-over', {
        finalScore: this.score,
        totalCorrect: this.totalCorrect,
        totalQuestions: this.totalQuestions,
        maxDifficulty: this.currentDiff.level, // 与 HUD 当前难度一致（供上传）
        duration: this.duration,
        avgReactionTime: avgReaction
      })
    },

    requestExit() {
      this.clearAllTimers()
      if (this.voiceCtl) this.voiceCtl.cancel()
      this.wasPausedDuringInput = this.phase === 'inputting'
      this.showExitConfirm = true
    },

    cancelExit() {
      this.showExitConfirm = false
      this.startGameInterval()
      if (this.phase === 'inputting' && this.roundTimeLeft > 0) {
        this.roundInterval = setInterval(() => {
          this.roundTimeLeft--
          if (this.roundTimeLeft <= 0) {
            clearInterval(this.roundInterval)
            this.resolveAnswer('timeout')
          }
        }, 1000)
      } else if (this.phase === 'showing') {
        this.playCurrentSequence()
      }
    },

    confirmExit() {
      this.showExitConfirm = false
      this.clearAllTimers()
      if (this.voiceCtl) this.voiceCtl.cancel()
      leavePbGameWindow({ confirm: false })
    },

    onSkipClick() {
      skipPbBatchGame()
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
  position: relative;
  overflow: hidden;
  background: #0a0e27;
}

.bg-image {
  position: absolute;
  inset: 0;
  background: url(~@/views/game/newG14/public/images/1.png) center/cover no-repeat;
  filter: brightness(0.42) saturate(1.05) blur(0.2rem);
  transform: scale(1.05);
  z-index: 0;
}
.bg-veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(0, 212, 255, 0.12), transparent 60%),
    linear-gradient(180deg, rgba(10,14,39,0.5), rgba(10,14,39,0.8));
  z-index: 0;
}

/* HUD */
.hud {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 3%;
  background: rgba(10, 15, 40, 0.55);
  border-bottom: 0.1rem solid rgba(0, 212, 255, 0.25);
  backdrop-filter: blur(0.5rem);
  flex-shrink: 0;
  gap: 0.8rem;
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
  color: #e5f2ff;
  font-size: 1.15rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.06);
  padding: 0.35rem 1rem;
  border-radius: 2rem;
  border: 0.12rem solid rgba(0, 212, 255, 0.35);
  box-shadow: 0 2px 12px rgba(0, 212, 255, 0.15);
}

.rule-keyword {
  font-style: normal;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.75rem;
  border-radius: 2rem;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.4;
}

.rule-text.forward .rule-keyword {
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.5);
}

.rule-text.reverse .rule-keyword {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
}

.hud-right { flex: 0 0 auto; }

.exit-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255,255,255,0.08);
  border: 0.1rem solid rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 0.4rem;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  white-space: nowrap;
}
.exit-btn:hover { background: rgba(255,255,255,0.16); }

.exit-icon { font-size: 0.95rem; }

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}
.hud-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hud-val { font-size: 1.2rem; font-weight: 800; color: #fff; }
.diff-val { color: #00d4ff; }
.score-val { color: #00d4ff; }
.time-val { color: #00d4ff; }
.time-val.urgent { color: #f87171; animation: blink 0.5s step-end infinite; }
@keyframes blink { 50% { opacity: 0.4; } }

.main-area {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Broadcast panel */
.broadcast-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vh;
  padding: 1rem;
  position: absolute;
}

.on-air-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.18);
  border: 0.1rem solid rgba(248, 113, 113, 0.55);
  padding: 0.4rem 1.1rem;
  border-radius: 2rem;
  color: #fca5a5;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}
.on-air-tag .live-dot {
  width: 0.6rem; height: 0.6rem;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0.6rem #ef4444;
  animation: livepulse 1.2s ease-in-out infinite;
}
.on-air-tag .room-label { color: rgba(255,255,255,0.6); letter-spacing: 0.1em; }
@keyframes livepulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.listen-hint {
  color: rgba(0, 212, 255, 0.9);
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  margin: 0;
}

.speaker-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.speaker-orb {
  position: relative;
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(0, 212, 255, 0.55), rgba(0, 60, 200, 0.15) 70%);
  border: 0.15rem solid rgba(0, 212, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 2rem rgba(0, 212, 255, 0.3), inset 0 0 1.5rem rgba(0, 212, 255, 0.25);
  transition: transform 0.15s;
}
.speaker-orb.pulsing { transform: scale(1.05); }
.speaker-orb.rule {
  background: radial-gradient(circle at 35% 30%, rgba(251, 191, 36, 0.55), rgba(180, 83, 9, 0.15) 70%);
  border-color: rgba(251, 191, 36, 0.7);
  box-shadow: 0 0 2rem rgba(251, 191, 36, 0.4), inset 0 0 1.5rem rgba(251, 191, 36, 0.3);
}
.speaker-orb.rule .mic-glyph { filter: drop-shadow(0 0 0.5rem rgba(251, 191, 36, 0.7)); }
.speaker-orb.rule .ring { border-color: rgba(251, 191, 36, 0.6); }
.mic-glyph {
  font-size: 3.5rem;
  filter: drop-shadow(0 0 0.5rem rgba(0, 212, 255, 0.6));
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 0.12rem solid rgba(0, 212, 255, 0.55);
  opacity: 0;
  pointer-events: none;
}
.speaker-orb.pulsing .ring { animation: ringOut 1.2s ease-out infinite; }
.speaker-orb.pulsing .r2 { animation-delay: 0.3s; }
.speaker-orb.pulsing .r3 { animation-delay: 0.6s; }
@keyframes ringOut {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.9); opacity: 0; }
}

.digit-dots {
  display: flex;
  gap: 0.6rem;
}
.digit-dots .dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 0.08rem solid rgba(0, 212, 255, 0.4);
  transition: all 0.2s;
}
.digit-dots .dot.played {
  background: rgba(0, 212, 255, 0.85);
  box-shadow: 0 0 0.5rem rgba(0, 212, 255, 0.6);
}
.digit-dots .dot.active {
  transform: scale(1.5);
  background: #00d4ff;
  box-shadow: 0 0 0.8rem #00d4ff;
}

.replay-btn {
  background: rgba(255,255,255,0.08);
  border: 0.1rem solid rgba(0, 212, 255, 0.4);
  color: #00d4ff;
  border-radius: 2rem;
  padding: 0.6rem 1.6rem;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.replay-btn:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.15);
  transform: translateY(-0.1rem);
}
.replay-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.replay-count {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.55);
}

/* Input phase */
.input-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vh;
  position: absolute;
  width: 100%;
  padding: 0 5% 1vh;
  top: 3vh;
}
.input-display { display: flex; gap: 0.5rem; justify-content: center; }
.input-slot {
  font-size: 2.8rem;
  font-weight: 700;
  color: #00d4ff;
  background: rgba(255,255,255,0.06);
  border: 0.12rem solid rgba(0, 212, 255, 0.35);
  border-radius: 0.5rem;
  width: 3.2rem;
  height: 3.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
  backdrop-filter: blur(0.3rem);
}
.input-slot.filled {
  background: rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.7);
  color: #00d4ff;
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
  gap: 0.7rem;
  width: 21rem;
}
.key {
  aspect-ratio: 1.25;
  border-radius: 0.6rem;
  border: 0.1rem solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
  color: #00d4ff;
  font-size: 1.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  touch-action: manipulation;
  backdrop-filter: blur(0.3rem);
}
.key:hover { background: rgba(0, 212, 255, 0.2); border-color: #00d4ff; }
.key:active { transform: scale(0.93); background: rgba(0, 212, 255, 0.3); }
.key-del {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.8rem;
}
.key-spacer { background: transparent; border-color: transparent; cursor: default; pointer-events: none; }

/* Feedback */
.feedback {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  background: rgba(10, 15, 40, 0.5);
  border-radius: 1rem;
  backdrop-filter: blur(0.5rem);
}
.feedback-icon { font-size: 5rem; font-weight: 900; line-height: 1; }
.feedback-text { font-size: 1.4rem; font-weight: 700; }
.feedback-score { font-size: 1.1rem; color: rgba(255,255,255,0.85); }
.reveal-answer {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.1em;
}
.reveal-answer span {
  color: #00d4ff;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-left: 0.3rem;
}
.diff-notice {
  font-size: 0.85rem;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-weight: 600;
}
.feedback.correct .feedback-icon, .feedback.correct .feedback-text { color: #4ade80; }
.feedback.wrong .feedback-icon, .feedback.wrong .feedback-text { color: #f87171; }
.feedback.timeout .feedback-icon, .feedback.timeout .feedback-text { color: #fbbf24; }
.diff-notice.up { background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 0.05rem solid rgba(74, 222, 128, 0.3); }
.diff-notice.down { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 0.05rem solid rgba(251, 191, 36, 0.3); }

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
.fade-enter, .fade-leave-to { opacity: 0; }
.scale-fade-enter-active { transition: opacity 0.25s, transform 0.25s; }
.scale-fade-leave-active { transition: opacity 0.2s; }
.scale-fade-enter { opacity: 0; transform: scale(0.7); }
.scale-fade-leave-to { opacity: 0; }
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.2s; }
.overlay-fade-enter, .overlay-fade-leave-to { opacity: 0; }

/* Portrait / mobile web-view layout */
@media (orientation: portrait) {
  .hud {
    flex-wrap: wrap;
    padding: 0.5rem 3%;
    padding-top: calc(0.5rem + env(safe-area-inset-top));
    gap: 0.5rem;
  }
  .hud-left {
    order: 1;
    flex: 1 1 auto;
    gap: max(2.2vmin, 12px);
    justify-content: flex-start;
  }
  .hud-right {
    order: 2;
    display: flex;
    gap: 0.4rem;
  }
  .hud-center {
    order: 3;
    flex: 1 1 100%;
    padding: 0.2rem 0;
  }
  .hud-label { font-size: max(2.4vmin, 11px); }
  .hud-val { font-size: max(4vmin, 16px); }
  .rule-text {
    font-size: max(3.4vmin, 14px);
    padding: 0.4rem 0.9rem;
    border-radius: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .rule-keyword {
    font-size: max(3.6vmin, 15px);
    padding: 0.2rem 0.7rem;
  }
  .exit-btn, .skip-btn {
    font-size: max(3.2vmin, 13px);
    padding: 0.5rem 0.9rem;
    border-radius: 0.6rem;
  }

  .main-area {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .broadcast-panel {
    width: 100%;
    padding: 1rem 4%;
    gap: 2.5vh;
  }
  .on-air-tag { font-size: max(3vmin, 13px); }
  .listen-hint { font-size: max(3.8vmin, 15px); }
  .speaker-orb {
    width: min(38vmin, 12rem);
    height: min(38vmin, 12rem);
  }
  .mic-glyph { font-size: min(14vmin, 4.5rem); }
  .digit-dots .dot {
    width: max(2.4vmin, 10px);
    height: max(2.4vmin, 10px);
  }
  .replay-btn {
    font-size: max(4vmin, 16px);
    padding: 0.8rem 2rem;
    border-radius: 2rem;
    width: 80%;
    max-width: 22rem;
    justify-content: center;
  }

  .input-phase {
    top: 2vh;
    gap: 3vh;
    padding: 0 4% 2vh;
  }
  .input-display { gap: 0.4rem; flex-wrap: wrap; }
  .input-slot {
    font-size: max(7vmin, 26px);
    width: max(11vmin, 42px);
    height: max(13vmin, 52px);
    border-radius: 0.6rem;
  }
  .round-timer-bar {
    width: 82%;
    height: 0.5rem;
  }
  .numpad {
    width: min(88vw, 24rem);
    gap: max(2vmin, 8px);
  }
  .key {
    font-size: max(6vmin, 22px);
    border-radius: 0.8rem;
  }
  .key-del { font-size: max(3.2vmin, 13px); }

  .feedback {
    width: 82vw;
    padding: 1.4rem 1.5rem;
    border-radius: 1.2rem;
  }
  .feedback-icon { font-size: max(14vmin, 4rem); }
  .feedback-text { font-size: max(4.6vmin, 18px); }
  .feedback-score { font-size: max(3.8vmin, 15px); }
  .reveal-answer { font-size: max(3.4vmin, 14px); }
  .diff-notice { font-size: max(3.2vmin, 13px); }

  .exit-dialog {
    width: 90vw;
    max-width: 26rem;
    padding: 2rem 1.6rem;
    border-radius: 1.2rem;
  }
  .exit-msg { font-size: max(3.8vmin, 15px); }
  .btn-cancel, .btn-confirm {
    font-size: max(3.8vmin, 15px);
    padding: 0.9rem;
    border-radius: 0.6rem;
  }
}
</style>
