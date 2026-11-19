<template>
  <div class="game-view" :class="{ 'flash-mode': stimSide }">
    <!-- Split background halves (also serve as touch/click zones) -->
    <div
      class="split left"
      :class="{ flash: stimSide === 'left' }"
      @click="onHand('left')"
      @touchstart.prevent="onHand('left')"
    ></div>
    <div
      class="split right"
      :class="{ flash: stimSide === 'right' }"
      @click="onHand('right')"
      @touchstart.prevent="onHand('right')"
    ></div>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-item">
        <div class="hud-label">{{ t.game.level }}</div>
        <div class="hud-value">{{ level }}</div>
      </div>
      <div class="hud-item">
        <div class="hud-label">{{ t.game.score }}</div>
        <div class="hud-value">{{ Math.round(score) }}</div>
      </div>
      <div class="hud-item">
        <div class="hud-label">{{ t.game.timeLeft }}</div>
        <div class="hud-value">{{ formatTime(timeLeft) }}</div>
      </div>
    </div>

    <!-- Top task instruction pill -->
    <div class="task-pill" v-html="isInverted ? t.game.taskInvert : t.game.taskSame"></div>

    <!-- Feedback burst -->
    <div v-if="feedback" class="feedback" :class="feedback">
      <span v-if="feedback === 'correct'">✓</span>
      <span v-else>✗</span>
    </div>

    <!-- Countdown overlay -->
    <div v-if="countdown !== null" class="countdown-overlay">
      <div class="countdown-number">
        {{ countdown === 0 ? t.game.go : countdown }}
      </div>
    </div>

    <!-- Skip + Exit buttons -->
    <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t.game.skipGame }}</button>
    <button class="exit-btn" @click="tryExit">{{ t.game.back }}</button>

    <!-- Tablet-mode hand buttons -->
    <div class="hand-buttons">
      <button class="hand-btn left" @click="onHand('left')" @touchstart.prevent="onHand('left')">
        <span class="key">A</span>
        <span class="label">{{ t.game.leftHand }}</span>
      </button>
      <button class="hand-btn right" @click="onHand('right')" @touchstart.prevent="onHand('right')">
        <span class="key">L</span>
        <span class="label">{{ t.game.rightHand }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { getLevelConfig } from '../config.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GameView',
  props: {
    t: { type: Object, required: true },
    duration: { type: Number, required: true },
    lang: { type: String, default: 'zh' }
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame('zysxt'),
      score: 0,
      timeLeft: this.duration,
      stimSide: null,
      awaitingResponse: false,
      feedback: null,
      countdown: 3,
      trials: [],
      windowTrials: [],
      startTime: 0,
      stimStartTime: 0,
      tickTimer: null,
      stimulusTimer: null,
      responseTimer: null,
      feedbackTimer: null,
      countdownTimer: null,
      nextAdaptiveCheck: 60,
      finished: false,
      levelChanges: [],
      lastStimSide: null,
      sameSideRun: 0,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    isInverted() { return getLevelConfig(this.level).invert }
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown)
    this.runCountdown()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown)
    this.clearAllTimers()
  },
  methods: {
    formatTime(sec) {
      sec = Math.max(0, Math.ceil(sec))
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    },

    runCountdown() {
      this.countdown = 3
      const tick = () => {
        this.countdownTimer = setTimeout(() => {
          this.countdown--
          if (this.countdown < 0) {
            this.countdown = null
            this.startGame()
          } else {
            tick()
          }
        }, 800)
      }
      tick()
    },

    startGame() {
      this.startTime = Date.now()
      this.nextAdaptiveCheck = 60
      this.levelChanges.push({ time: 0, level: this.level })
      this.playStimulusVoice()
      this.tickTimer = setInterval(this.tick, 100)
      this.scheduleNextTrial()
    },

    tick() {
      const elapsed = (Date.now() - this.startTime) / 1000
      this.timeLeft = this.duration - elapsed
      if (this.timeLeft <= 0) {
        this.finishGame()
        return
      }
      if (elapsed >= this.nextAdaptiveCheck) {
        this.evaluateWindow()
        this.nextAdaptiveCheck += 60
      }
    },

    scheduleNextTrial() {
      if (this.finished) return
      const cfg = getLevelConfig(this.level)
      this.stimulusTimer = setTimeout(() => this.showStimulus(), cfg.interval * 1000)
    },

    showStimulus() {
      if (this.finished) return
      let side
      if (this.lastStimSide && this.sameSideRun >= 3) {
        side = this.lastStimSide === 'left' ? 'right' : 'left'
      } else {
        side = Math.random() < 0.5 ? 'left' : 'right'
      }
      if (side === this.lastStimSide) this.sameSideRun++
      else this.sameSideRun = 1
      this.lastStimSide = side
      this.stimSide = side
      this.awaitingResponse = true
      this.stimStartTime = Date.now()
      const cfg = getLevelConfig(this.level)
      this.responseTimer = setTimeout(() => this.onTimeout(), cfg.maxResponse * 1000)
    },

    playStimulusVoice() {
      try {
        const folder = this.lang === 'en' ? 'english' : 'chinese'
        const audio = new Audio(`voice/${folder}/1.mp3`)
        audio.volume = 1
        audio.play().catch(() => {})
      } catch (_) { /* ignore */ }
    },

    onKeydown(e) {
      const key = e.key || ''
      const lk = key.toLowerCase()
      if (lk === 'a' || key === 'ArrowLeft') this.onHand('left')
      else if (lk === 'l' || key === 'ArrowRight') this.onHand('right')
    },

    onHand(hand) {
      if (!this.awaitingResponse || this.finished || this.countdown !== null) return
      this.awaitingResponse = false
      clearTimeout(this.responseTimer)
      const rt = Date.now() - this.stimStartTime
      const cfg = getLevelConfig(this.level)
      const expected = cfg.invert
        ? (this.stimSide === 'left' ? 'right' : 'left')
        : this.stimSide
      const correct = hand === expected
      this.recordTrial({
        level: this.level,
        stimSide: this.stimSide,
        hand,
        expected,
        correct,
        rt,
        timedOut: false
      })
      if (correct) this.score += 5 * cfg.coef
      this.showFeedback(correct)
      this.stimSide = null
      this.scheduleNextTrial()
    },

    onTimeout() {
      if (!this.awaitingResponse || this.finished) return
      this.awaitingResponse = false
      const cfg = getLevelConfig(this.level)
      const expected = cfg.invert
        ? (this.stimSide === 'left' ? 'right' : 'left')
        : this.stimSide
      this.recordTrial({
        level: this.level,
        stimSide: this.stimSide,
        hand: null,
        expected,
        correct: false,
        rt: null,
        timedOut: true
      })
      this.showFeedback(false)
      this.stimSide = null
      this.scheduleNextTrial()
    },

    recordTrial(trial) {
      this.trials.push(trial)
      this.windowTrials.push(trial)
    },

    showFeedback(ok) {
      this.feedback = ok ? 'correct' : 'wrong'
      clearTimeout(this.feedbackTimer)
      this.feedbackTimer = setTimeout(() => { this.feedback = null }, 400)
    },

    evaluateWindow() {
      if (!this.windowTrials.length) return
      const correctCount = this.windowTrials.filter(x => x.correct).length
      const rate = correctCount / this.windowTrials.length
      let newLevel = this.level
      if (rate >= 0.9 && this.level < 6) newLevel = this.level + 1
      else if (rate < 0.7 && this.level > 1) newLevel = this.level - 1
      if (newLevel !== this.level) {
        this.level = newLevel
        const elapsed = (Date.now() - this.startTime) / 1000
        this.levelChanges.push({ time: elapsed, level: newLevel })
        this.playStimulusVoice()
      }
      this.windowTrials = []
    },

    onSkipClick() {
      skipPbBatchGame()
    },

    tryExit() {
      if (confirm(this.t.game.confirmExit)) {
        this.clearAllTimers() // 停止所有计时器
        leavePbGameWindow({ confirm: false })
      }
    },

    clearAllTimers() {
      clearInterval(this.tickTimer)
      clearTimeout(this.stimulusTimer)
      clearTimeout(this.responseTimer)
      clearTimeout(this.feedbackTimer)
      clearTimeout(this.countdownTimer)
    },

    finishGame() {
      if (this.finished) return
      this.finished = true
      this.clearAllTimers()
      const total = this.trials.length
      const success = this.trials.filter(x => x.correct).length
      const fail = total - success
      const rate = total ? Math.round((success / total) * 100) : 0
      const rts = this.trials.filter(x => x.rt != null).map(x => x.rt)
      const avgRt = rts.length ? Math.round(rts.reduce((a,b)=>a+b,0) / rts.length) : 0
      const actualDuration = Math.min(this.duration, Math.round((Date.now() - this.startTime) / 1000))
      const levelsUsed = [...new Set(this.levelChanges.map(x => x.level))].sort((a,b)=>a-b)
      const result = {
        time: Date.now(),
        project: this.t.appTitle,
        duration: actualDuration,
        total,
        success,
        fail,
        rate,
        avgRt,
        score: Math.round(this.score),
        levelSummary: levelsUsed.join('/'),
        finalLevel: this.level,
        trials: this.trials.length
      }
      this.$emit('finish', result)
    }
  }
}
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100%;
  position: relative;
  background: #1e2233;
  overflow: hidden;
  user-select: none;
}
.split {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background: #2a2f42;
  transition: background-color 0.06s linear;
  cursor: pointer;
  z-index: 1;
}
.split.left { left: 0; border-right: 2px dashed #3a4159; }
.split.right { right: 0; }
.split.flash { background: #ff2b2b; }

.hud {
  position: absolute;
  top: calc(var(--u) * 1.5);
  left: calc(var(--u) * 2);
  display: flex;
  gap: calc(var(--u) * 2.5);
  z-index: 5;
}
.hud-item {
  background: rgba(255,255,255,0.1);
  padding: calc(var(--u) * 0.7) calc(var(--u) * 1.4);
  border-radius: calc(var(--u) * 0.6);
  backdrop-filter: blur(6px);
  color: #fff;
  min-width: calc(var(--u) * 7);
  text-align: center;
}
.hud-label { font-size: calc(var(--u) * 1.1); opacity: 0.7; }
.hud-value { font-size: calc(var(--u) * 2); font-weight: 700; margin-top: calc(var(--u) * 0.2); }

.exit-btn {
  position: absolute;
  top: calc(var(--u) * 1.5);
  right: calc(var(--u) * 2);
  padding: calc(var(--u) * 0.8) calc(var(--u) * 1.8);
  font-size: calc(var(--u) * 1.4);
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: calc(var(--u) * 0.6);
  cursor: pointer;
  z-index: 5;
}
.exit-btn:hover { background: rgba(255,255,255,0.3); }

.skip-btn {
  position: absolute;
  top: calc(var(--u) * 1.5);
  right: calc(var(--u) * 11);
  padding: calc(var(--u) * 0.8) calc(var(--u) * 1.8);
  font-size: calc(var(--u) * 1.4);
  background: rgba(160,168,189,0.35);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.35);
  border-radius: calc(var(--u) * 0.6);
  cursor: pointer;
  z-index: 5;
}
.skip-btn:hover { background: rgba(160,168,189,0.55); }

@media (orientation: portrait) {
  .hud {
    top: calc(var(--u) * 1.2 + env(safe-area-inset-top));
    left: calc(var(--u) * 1);
    gap: calc(var(--u) * 1);
    flex-wrap: wrap;
    max-width: 55vw;
  }
  .hud-item {
    padding: calc(var(--u) * 0.5) calc(var(--u) * 0.9);
    min-width: 0;
  }
  .hud-label { font-size: max(2.4vmin, 12px); }
  .hud-value { font-size: max(3.6vmin, 16px); }

  .task-pill {
    top: auto;
    bottom: calc(var(--u) * 16 + env(safe-area-inset-bottom));
    font-size: max(3.4vmin, 14px);
    padding: 1.6vmin 3.2vmin;
    max-width: 92vw;
    white-space: normal;
    text-align: center;
    line-height: 1.35;
  }

  .exit-btn,
  .skip-btn {
    top: calc(var(--u) * 1.2 + env(safe-area-inset-top));
    padding: 1.4vmin 3vmin;
    font-size: max(3.2vmin, 14px);
    border-radius: 2vmin;
  }
  .exit-btn { right: 2vw; }
  .skip-btn { right: calc(2vw + 22vmin); }

  .hand-buttons {
    bottom: calc(var(--u) * 1.2 + env(safe-area-inset-bottom));
    padding: 0 4vw;
  }
  .hand-btn {
    padding: 2.4vmin 4vmin;
    border-radius: 3vmin;
  }
  .hand-btn .key { font-size: max(6vmin, 22px); }
  .hand-btn .label { font-size: max(2.8vmin, 13px); }

  .feedback { font-size: max(18vmin, 60px); }
  .countdown-number { font-size: max(22vmin, 80px); }
}

.task-pill {
  position: absolute;
  top: calc(var(--u) * 1.8);
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: calc(var(--u) * 1.6);
  font-weight: 600;
  padding: calc(var(--u) * 0.8) calc(var(--u) * 2.2);
  background: rgba(0,0,0,0.55);
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(6px);
  white-space: nowrap;
  z-index: 6;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}
.task-pill :deep(.task-highlight) {
  color: #ff4d4f;
  font-weight: 800;
}

.feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: calc(var(--u) * 9);
  font-weight: 700;
  z-index: 8;
  animation: feedbackPop 0.4s ease-out;
  pointer-events: none;
  text-shadow: 0 0 calc(var(--u) * 1) rgba(0,0,0,0.5);
}
.feedback.correct { color: #52c41a; }
.feedback.wrong { color: #ff4d4f; }
@keyframes feedbackPop {
  0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
}

.countdown-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
.countdown-number {
  font-size: calc(var(--u) * 12);
  color: #fff;
  font-weight: 700;
  animation: countPop 0.8s ease-out;
  text-shadow: 0 0 calc(var(--u) * 2) rgba(255,255,255,0.4);
}
@keyframes countPop {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.hand-buttons {
  position: absolute;
  bottom: calc(var(--u) * 2);
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0 calc(var(--u) * 4);
  z-index: 5;
  pointer-events: none;
}
.hand-btn {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--u) * 0.4);
  padding: calc(var(--u) * 1) calc(var(--u) * 2);
  background: rgba(255,255,255,0.92);
  color: #333;
  border: none;
  border-radius: calc(var(--u) * 0.8);
  cursor: pointer;
  box-shadow: 0 6px 0 #a0a8bd, 0 8px 20px rgba(0,0,0,0.3);
  transition: transform .1s, box-shadow .1s;
}
.hand-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #a0a8bd; }
.hand-btn .key {
  font-size: calc(var(--u) * 3);
  font-weight: 800;
  color: #667eea;
}
.hand-btn .label { font-size: calc(var(--u) * 1.2); color: #555; }
</style>
