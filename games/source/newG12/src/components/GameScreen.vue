<template>
  <div class="game">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="stats">
        <div class="stat">
          <span class="stat-label">{{ t('gameLevel') }}</span>
          <span class="stat-value">{{ currentLevel }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t('gameScore') }}</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t('gameTimeLeft') }}</span>
          <span class="stat-value">{{ formatTime(remainingSec) }}</span>
        </div>
      </div>

      <div class="prompt">{{ currentPrompt }}</div>

      <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t('skipGame') }}</button>
      <button class="back-btn" @click="onBack">← {{ t('gameBack') }}</button>
    </div>

    <!-- Main play area -->
    <div v-if="question" class="play-area">
      <!-- Showing phase -->
      <div v-if="phase === 'showing'" class="show-area">
        <div class="faces-row">
          <div class="face-slot" v-for="(f, i) in question.faces" :key="'s'+i">
            <img :src="imgSrc(f.emotion, f.imgIdx)" class="face-img" />
            <div v-if="question.faces.length > 1" class="side-label"
                 :class="i === 0 ? 'left' : 'right'">
              {{ i === 0 ? t('left') : t('right') }}
            </div>
          </div>
        </div>
        <div class="phase-timer">
          <div class="phase-timer-fill" :style="{ width: showProgress + '%' }"></div>
        </div>
      </div>

      <!-- Answering phase -->
      <div v-else-if="phase === 'answering'" class="answer-area">
        <div class="hidden-faces">
          <div class="hidden-face" v-for="(f, i) in question.faces" :key="'h'+i">
            <span>?</span>
            <div v-if="question.faces.length > 1" class="side-label"
                 :class="i === 0 ? 'left' : 'right'"
                 :style="{ opacity: i === question.targetIndex ? 1 : 0.35 }">
              {{ i === 0 ? t('left') : t('right') }}
            </div>
          </div>
        </div>

        <div class="options">
          <button v-for="opt in question.options" :key="opt.key"
            class="opt-btn"
            @click="onAnswer(opt)">
            {{ opt[lang] }}
          </button>
        </div>

        <div class="phase-timer red">
          <div class="phase-timer-fill red" :style="{ width: answerProgress + '%' }"></div>
        </div>
      </div>

      <!-- Feedback phase -->
      <div v-else class="feedback-area">
        <div class="feedback-icon" :class="lastResult">
          <span v-if="lastResult === 'correct'">✓</span>
          <span v-else>✗</span>
        </div>
        <div class="feedback-text" :class="lastResult">
          {{ lastResult === 'correct' ? t('feedbackCorrect')
             : lastResult === 'timeout' ? t('feedbackTimeout')
             : t('feedbackWrong') }}
        </div>
        <div v-if="lastResult === 'correct'" class="feedback-score">
          +{{ lastEarned }}
        </div>
      </div>
    </div>

    <!-- Confirm back modal -->
    <div v-if="showConfirm" class="modal-backdrop" @click.self="cancelBack">
      <div class="confirm-modal">
        <p>{{ t('gameConfirmBack') }}</p>
        <div class="confirm-actions">
          <button class="cbtn cancel" @click="cancelBack">{{ t('gameNo') }}</button>
          <button class="cbtn primary" @click="doExit">{{ t('gameYes') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { t, i18n } from '../i18n.js'
import {
  DIFFICULTIES, MAX_ANSWER_TIME, DIFFICULTY_WINDOW, FEEDBACK_TIME,
  EMOTIONS, imagePath, randomEmotion, randomImageIndex, pickOptions
} from '../gameConfig.js'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GameScreen',
  props: {
    durationMin: { type: Number, required: true }
  },
  data() {
    return {
      currentLevel: getBatchStartDifficultyForGame('qxjy'),
      score: 0,
      remainingSec: this.durationMin * 60,
      elapsedSec: 0,
      phase: 'showing',
      question: null,
      showStartTs: 0,
      answerStartTs: 0,
      feedbackStartTs: 0,
      showProgress: 100,
      answerProgress: 100,
      lastResult: null,
      lastEarned: 0,
      showConfirm: false,
      paused: false,
      pauseAt: 0,
      phaseRemainingMs: 0,

      answers: [],
      windowStart: 0,
      windowCorrect: 0,
      windowTotal: 0,
      maxLevel: 1,

      mainTimer: null,
      phaseTimer: null,
      frameId: null,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    lang() { return i18n.lang },
    difficulty() {
      return DIFFICULTIES.find(d => d.level === this.currentLevel)
    },
    currentPrompt() {
      if (this.phase === 'showing') {
        return this.question && this.question.faces.length > 1
          ? t('promptRememberMulti')
          : t('promptRemember')
      }
      if (this.phase === 'answering') {
        if (this.question && this.question.faces.length > 1) {
          return this.question.targetIndex === 0
            ? t('promptRecallLeft')
            : t('promptRecallRight')
        }
        return t('promptRecall')
      }
      return ''
    }
  },
  mounted() {
    this.memorizeAudio = new Audio()
    this.recallAudio = new Audio()
    this.startGame()
  },
  beforeDestroy() {
    this.clearTimers()
    this.stopAudio()
  },
  methods: {
    t,
    imgSrc(emotion, idx) { return imagePath(emotion.key, idx) },
    voiceBase() {
      return i18n.lang === 'en' ? '/voice/english' : '/voice/chinese'
    },
    stopAudio() {
      if (this.memorizeAudio) { this.memorizeAudio.pause(); this.memorizeAudio.currentTime = 0 }
      if (this.recallAudio) { this.recallAudio.pause(); this.recallAudio.currentTime = 0 }
    },
    playVoice(which) {
      this.stopAudio()
      const audio = which === 'memorize' ? this.memorizeAudio : this.recallAudio
      const folder = i18n.lang === 'en' ? 'english' : 'chinese'
      const file = which === 'memorize' ? '1.mp3' : '2.mp3'
      audio.src = resolveVoice(`/voice/${folder}/${file}`)
      const p = audio.play()
      if (p && p.catch) p.catch(() => {})
    },
    formatTime(s) {
      const m = Math.floor(s / 60)
      const sec = s % 60
      return `${m}:${String(sec).padStart(2, '0')}`
    },
    startGame() {
      this.mainTimer = setInterval(this.tick, 1000)
      this.frameId = requestAnimationFrame(this.animate)
      this.startRound()
    },
    tick() {
      this.remainingSec -= 1
      this.elapsedSec += 1
      if (this.elapsedSec > 0 && this.elapsedSec % DIFFICULTY_WINDOW === 0) {
        this.evaluateWindow()
      }
      if (this.remainingSec <= 0) {
        this.endGame()
      }
    },
    animate() {
      if (this.paused) return
      const now = performance.now()
      if (this.phase === 'showing') {
        const elapsed = (now - this.showStartTs) / 1000
        this.showProgress = Math.max(0, 100 * (1 - elapsed / this.difficulty.displayTime))
      } else if (this.phase === 'answering') {
        const elapsed = (now - this.answerStartTs) / 1000
        this.answerProgress = Math.max(0, 100 * (1 - elapsed / MAX_ANSWER_TIME))
      }
      this.frameId = requestAnimationFrame(this.animate)
    },
    evaluateWindow() {
      if (this.windowTotal > 0) {
        const acc = this.windowCorrect / this.windowTotal
        if (acc >= 0.9 && this.currentLevel < 6) {
          this.currentLevel += 1
        } else if (acc <= 0.7 && this.currentLevel > 1) {
          this.currentLevel -= 1
        }
      }
      this.windowStart = this.elapsedSec
      this.windowCorrect = 0
      this.windowTotal = 0
      if (this.currentLevel > this.maxLevel) this.maxLevel = this.currentLevel
    },
    startRound() {
      const d = this.difficulty
      const faces = []
      for (let i = 0; i < d.faces; i++) {
        const emotion = randomEmotion()
        faces.push({ emotion, imgIdx: randomImageIndex(emotion) })
      }
      const targetIndex = d.faces > 1 ? Math.floor(Math.random() * d.faces) : 0
      const correctKey = faces[targetIndex].emotion.key
      const options = pickOptions(correctKey, d.options)
      this.question = { faces, targetIndex, options, correctKey }
      this.showProgress = 100
      this.answerProgress = 100
      this.phase = 'showing'
      this.showStartTs = performance.now()
      this.playVoice('memorize')
      this.phaseTimer = setTimeout(() => this.transitionToAnswer(), d.displayTime * 1000)
    },
    transitionToAnswer() {
      this.phase = 'answering'
      this.answerStartTs = performance.now()
      this.playVoice('recall')
      this.phaseTimer = setTimeout(() => this.handleAnswer(null), MAX_ANSWER_TIME * 1000)
    },
    onAnswer(opt) {
      if (this.phase !== 'answering') return
      this.handleAnswer(opt)
    },
    handleAnswer(opt) {
      if (this.phaseTimer) { clearTimeout(this.phaseTimer); this.phaseTimer = null }
      const rt = (performance.now() - this.answerStartTs) / 1000
      const correct = opt && opt.key === this.question.correctKey
      const timeout = opt === null
      this.lastResult = correct ? 'correct' : (timeout ? 'timeout' : 'wrong')
      const earned = correct ? Math.round(5 * this.difficulty.coefficient * 10) / 10 : 0
      this.lastEarned = earned
      if (correct) this.score = Math.round((this.score + earned) * 10) / 10
      this.answers.push({
        correct,
        rt: correct ? rt : (timeout ? MAX_ANSWER_TIME : rt),
        level: this.currentLevel,
        coefficient: this.difficulty.coefficient
      })
      this.windowTotal += 1
      if (correct) this.windowCorrect += 1
      if (this.currentLevel > this.maxLevel) this.maxLevel = this.currentLevel
      this.phase = 'feedback'
      this.feedbackStartTs = performance.now()
      this.phaseTimer = setTimeout(() => {
        if (this.remainingSec > 0) this.startRound()
      }, FEEDBACK_TIME)
    },
    onBack() {
      this.pause()
      this.showConfirm = true
    },
    onSkipClick() {
      skipPbBatchGame()
    },
    cancelBack() {
      this.showConfirm = false
      this.resume()
    },
    doExit() {
      this.showConfirm = false
      this.clearTimers()
      this.stopAudio()
      leavePbGameWindow({ confirm: false })
    },
    pause() {
      if (this.paused) return
      this.paused = true
      this.stopAudio()
      const now = performance.now()
      this.pauseAt = now
      if (this.mainTimer) { clearInterval(this.mainTimer); this.mainTimer = null }
      if (this.frameId) { cancelAnimationFrame(this.frameId); this.frameId = null }
      if (this.phase === 'showing') {
        this.phaseRemainingMs = this.difficulty.displayTime * 1000 - (now - this.showStartTs)
      } else if (this.phase === 'answering') {
        this.phaseRemainingMs = MAX_ANSWER_TIME * 1000 - (now - this.answerStartTs)
      } else if (this.phase === 'feedback') {
        this.phaseRemainingMs = FEEDBACK_TIME - (now - this.feedbackStartTs)
      }
      if (this.phaseTimer) { clearTimeout(this.phaseTimer); this.phaseTimer = null }
    },
    resume() {
      if (!this.paused) return
      const now = performance.now()
      const gap = now - this.pauseAt
      this.showStartTs += gap
      this.answerStartTs += gap
      this.feedbackStartTs += gap
      this.paused = false
      this.mainTimer = setInterval(this.tick, 1000)
      this.frameId = requestAnimationFrame(this.animate)
      const rem = Math.max(0, this.phaseRemainingMs)
      if (this.phase === 'showing') {
        this.phaseTimer = setTimeout(() => this.transitionToAnswer(), rem)
      } else if (this.phase === 'answering') {
        this.phaseTimer = setTimeout(() => this.handleAnswer(null), rem)
      } else if (this.phase === 'feedback') {
        this.phaseTimer = setTimeout(() => {
          if (this.remainingSec > 0) this.startRound()
        }, rem)
      }
    },
    endGame() {
      this.clearTimers()
      this.stopAudio()
      const total = this.answers.length
      const correctCount = this.answers.filter(a => a.correct).length
      const totalRt = this.answers.reduce((s, a) => s + a.rt, 0)
      const avgRt = total > 0 ? Math.round((totalRt / total) * 10) / 10 : 0
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0
      this.$emit('finish', {
        time: Date.now(),
        durationMin: this.durationMin,
        maxLevel: this.currentLevel, // 与 HUD 当前难度一致（供上传）
        total,
        correct: correctCount,
        wrong: total - correctCount,
        accuracy,
        avgRt,
        score: Math.round(this.score * 10) / 10
      })
    },
    clearTimers() {
      if (this.mainTimer) { clearInterval(this.mainTimer); this.mainTimer = null }
      if (this.phaseTimer) { clearTimeout(this.phaseTimer); this.phaseTimer = null }
      if (this.frameId) { cancelAnimationFrame(this.frameId); this.frameId = null }
    }
  }
}
</script>

<style scoped>
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%);
  padding: 2vmin;
  gap: 2vmin;
  position: relative;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 2vmin;
  padding: 1.5vmin 2vmin;
  background: white;
  border-radius: 2vmin;
  box-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.05);
}
.stats {
  display: flex;
  gap: 2vmin;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 10vmin;
}
.stat-label {
  font-size: 1.8vmin;
  color: #64748b;
}
.stat-value {
  font-size: 3vmin;
  font-weight: 700;
  color: #4f46e5;
}
.prompt {
  flex: 1;
  text-align: center;
  font-size: 2.6vmin;
  font-weight: 600;
  color: #1e293b;
}
.back-btn {
  padding: 1.4vmin 2.6vmin;
  border-radius: 2vmin;
  background: #f1f5f9;
  color: #475569;
  border: none;
  font-size: 2.2vmin;
  cursor: pointer;
}
.back-btn:hover { background: #e2e8f0; }
.skip-btn {
  padding: 1.4vmin 2.6vmin;
  border-radius: 2vmin;
  background: #e2e8f0;
  color: #475569;
  border: none;
  font-size: 2.2vmin;
  cursor: pointer;
}
.skip-btn:hover { background: #cbd5e1; }

.play-area {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.show-area, .answer-area, .feedback-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3vmin;
  width: 100%;
  height: 100%;
}
.show-area {
  gap: 3vmin;
}
.face-slot {
  position: relative;
}
.face-img {
  width: 40vmin;
  height: 40vmin;
  max-width: 55vh;
  max-height: 55vh;
  object-fit: cover;
  border-radius: 3vmin;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,0.15);
}
/* Two-face layout */
.faces-row {
  display: flex;
  flex-direction: row;
  gap: 4vmin;
  justify-content: center;
  align-items: center;
}
.hidden-faces {
  display: flex;
  gap: 4vmin;
  justify-content: center;
}
.hidden-face {
  position: relative;
  width: 40vmin;
  height: 40vmin;
  max-width: 45vh;
  max-height: 45vh;
  border-radius: 3vmin;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}
.hidden-face span {
  font-size: 18vmin;
  font-weight: bold;
}

.side-label {
  position: absolute;
  top: 1vmin;
  padding: 0.8vmin 2vmin;
  border-radius: 2vmin;
  font-size: 2vmin;
  color: white;
  font-weight: 600;
}
.side-label.left { left: 1vmin; background: #6366f1; }
.side-label.right { right: 1vmin; background: #ec4899; }

.phase-timer {
  width: min(60vmin, 80%);
  height: clamp(6px, 1vmin, 12px);
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
}
.phase-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  will-change: width;
}
.phase-timer-fill.red {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 2vmin, 22px);
  justify-content: center;
  max-width: min(80vmin, 900px);
}
.opt-btn {
  padding: clamp(10px, 2vmin, 20px) clamp(18px, 3.5vmin, 40px);
  border-radius: 3vmin;
  border: 0.3vmin solid #e2e8f0;
  background: white;
  font-size: clamp(18px, 3.2vmin, 32px);
  font-weight: 600;
  cursor: pointer;
  color: #334155;
  min-width: clamp(90px, 16vmin, 180px);
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.opt-btn:hover {
  transform: translateY(-0.5vmin);
  border-color: #6366f1;
  box-shadow: 0 1vmin 2vmin rgba(99,102,241,0.2);
}

.feedback-area {
  gap: 2vmin;
}
.feedback-icon {
  width: 22vmin;
  height: 22vmin;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14vmin;
  font-weight: bold;
  color: white;
  animation: popIn 0.4s ease-out;
}
.feedback-icon.correct { background: #10b981; }
.feedback-icon.wrong, .feedback-icon.timeout { background: #ef4444; }
.feedback-text {
  font-size: 4vmin;
  font-weight: 700;
}
.feedback-text.correct { color: #10b981; }
.feedback-text.wrong, .feedback-text.timeout { color: #ef4444; }
.feedback-score {
  font-size: 3vmin;
  color: #10b981;
  font-weight: 600;
}
@keyframes popIn {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(15,23,42,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.confirm-modal {
  background: white;
  padding: 4vmin;
  border-radius: 3vmin;
  min-width: 40vmin;
  display: flex;
  flex-direction: column;
  gap: 3vmin;
  align-items: center;
}
.confirm-modal p {
  font-size: 2.6vmin;
  color: #1e293b;
}
.confirm-actions {
  display: flex;
  gap: 2vmin;
}
.cbtn {
  padding: 1.4vmin 4vmin;
  border-radius: 3vmin;
  border: none;
  font-size: 2.4vmin;
  cursor: pointer;
}
.cbtn.cancel { background: #f1f5f9; color: #475569; }
.cbtn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .game {
    padding: 3vmin 3vmin calc(3vmin + env(safe-area-inset-bottom));
    gap: 3vmin;
  }
  .top-bar {
    flex-wrap: wrap;
    padding: 2.5vmin 3vmin;
    padding-top: calc(2.5vmin + env(safe-area-inset-top));
    border-radius: 3vmin;
    gap: 2vmin;
  }
  .stats { order: 1; width: 100%; justify-content: space-around; gap: 3vmin; }
  .stat { min-width: 0; }
  .stat-label { font-size: max(2.6vmin, 12px); }
  .stat-value { font-size: max(4.2vmin, 18px); }
  .prompt {
    order: 3;
    width: 100%;
    flex: 0 0 100%;
    font-size: max(3.6vmin, 16px);
  }
  .skip-btn, .back-btn {
    order: 2;
    padding: 2vmin 4vmin;
    font-size: max(3.4vmin, 15px);
    border-radius: 2.5vmin;
  }
  .face-img {
    width: 65vmin;
    height: 65vmin;
    max-width: 80vw;
    max-height: 80vw;
    border-radius: 4vmin;
  }
  .hidden-face {
    width: 55vmin;
    height: 55vmin;
    max-width: 70vw;
    max-height: 70vw;
    border-radius: 4vmin;
  }
  .hidden-face span { font-size: 24vmin; }
  .faces-row, .hidden-faces { gap: 3vmin; }
  .side-label { font-size: max(2.6vmin, 12px); padding: 1vmin 2.5vmin; }
  .options {
    max-width: 92vw;
    gap: 2.5vmin;
  }
  .opt-btn {
    flex: 1 1 40%;
    min-width: 38vw;
    padding: 3vmin 4vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 4vmin;
  }
  .phase-timer {
    width: 88%;
    height: clamp(8px, 1.6vmin, 14px);
  }
  .feedback-icon {
    width: 34vmin; height: 34vmin;
    font-size: 22vmin;
  }
  .feedback-text { font-size: max(5vmin, 20px); }
  .feedback-score { font-size: max(4vmin, 18px); }
  .confirm-modal {
    width: 90vw;
    min-width: 0;
    padding: 6vmin 5vmin;
    border-radius: 4vmin;
  }
  .confirm-modal p { font-size: max(4vmin, 16px); }
  .cbtn {
    padding: 2.4vmin 6vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 4vmin;
  }
}
</style>
