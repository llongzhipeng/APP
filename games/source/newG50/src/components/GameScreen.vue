<template>
  <div class="game-page">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="stat">
          <div class="label">{{ t('difficulty') }}</div>
          <div class="value">L{{ level }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('score') }}</div>
          <div class="value">{{ score }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('timeLeft') }}</div>
          <div class="value" :class="{ warn: timeLeft <= 10 }">{{ formatTime(timeLeft) }}</div>
        </div>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="hud-btn batch-skip" @click="onBatchSkip">{{ t('skipBatch') }}</button>
        <button class="hud-btn" @click="onExit">← {{ t('back') }}</button>
      </div>
    </div>

    <!-- Stage -->
    <div class="stage">
      <div class="rule">{{ q && q.inputMode ? t('promptInput') : t('promptFill') }}</div>

      <div class="question-timer">
        <div class="qt-bar" :style="{ width: qtPct + '%' }"></div>
      </div>

      <!-- 4-cell idiom -->
      <div class="idiom-container" :class="{ shake: shakeIdiom }">
        <div
          v-for="(cell, i) in cells"
          :key="qId + '-' + i"
          class="idiom-tile"
          :class="{
            blank: cell.isBlank && !cell.revealed,
            focus: cell.isBlank && !cell.revealed && i === focusIdx,
            correct: cell.revealed && cell.correct,
            wrong: cell.wrong,
            answer: cell.revealed && !cell.correct
          }"
        >
          <template v-if="cell.revealed || !cell.isBlank">{{ cell.show }}</template>
          <span v-else class="dash"></span>
        </div>
      </div>

      <!-- Choices -->
      <div v-if="q && !q.inputMode" class="choices">
        <button
          v-for="(c, i) in q.options"
          :key="c + '-' + i"
          class="choice"
          :class="{
            picked: pickedChars.includes(c),
            revealCorrect: revealAnswer && q.blanks.map(b => b.answer).includes(c)
          }"
          :disabled="revealAnswer || pickedChars.includes(c)"
          @click="onPickOption(c)"
        >{{ c }}</button>
      </div>

      <!-- Input -->
      <div v-else-if="q && q.inputMode" class="input-row">
        <input
          ref="charInput"
          v-model="typedInput"
          class="char-input"
          :maxlength="q.blanks.length"
          :disabled="revealAnswer"
          @keydown.enter="onSubmitTyped"
        />
        <button class="submit-btn" @click="onSubmitTyped" :disabled="typedInput.length !== q.blanks.length || revealAnswer">
          {{ t('submit') }}
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="feedback" class="feedback" :class="feedback.type">
        <div class="fb-title">{{ feedback.title }}</div>
        <div v-if="feedback.detail" class="fb-detail">{{ feedback.detail }}</div>
      </div>
    </div>

    <!-- Adaptive window progress -->
    <div class="bottom-scroll">
      <div class="scroll-track">
        <span v-for="i in 12" :key="i" class="tick" :class="{ active: i-1 < adjustedTicks }"></span>
      </div>
      <div class="scroll-label">
        {{ t('accuracy') }}: {{ periodRate }}%
      </div>
    </div>

    <!-- Exit confirm -->
    <div v-if="showExitConfirm" class="confirm-overlay" @click.self="cancelExit">
      <div class="confirm-card">
        <div class="confirm-text">{{ t('exitConfirm') }}</div>
        <div class="confirm-btns">
          <button class="mini-btn" @click="cancelExit">{{ t('back') }}</button>
          <button class="mini-btn primary" @click="doExit">{{ t('submit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'
import { generateQuestion } from '../utils/generator.js'
import { QUESTION_TIME, ADJUST_INTERVAL, MAX_LEVEL } from '../data/difficulty.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'cytk' // 成语填空
const MAX_ANSWER_MS = QUESTION_TIME * 1000
const WINDOW_MS = ADJUST_INTERVAL * 1000
const BASE_SCORE = 5

export default {
  name: 'GameScreen',
  props: {
    lang: String, // 语言
    duration: Number, // 训练时长（秒）
    showBatchSkip: { type: Boolean, default: false }, // 批次跳过
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE), // HUD 当前难度
      pendingLevel: null,
      score: 0,
      timeLeft: this.duration,
      // question state
      q: null,
      qId: 0,
      cells: [],
      pickedChars: [],
      typedInput: '',
      revealAnswer: false,
      feedback: null,
      shakeIdiom: false,
      focusIdx: -1,
      // timers
      gameTimer: null,
      questionTimer: null,
      questionStartMs: 0,
      qtPct: 100,
      qtRaf: null,
      // adaptive window
      windowStats: { correct: 0, total: 0 },
      windowTimer: null,
      windowElapsedAtStart: 0,
      // overall stats
      stats: { total: 0, correct: 0, fail: 0, reactionTimes: [] },
      maxLevel: 1,
      // exit
      showExitConfirm: false,
      paused: false,
      pauseStartTime: 0,
      recentIdioms: [],
      // audio
      audio: null
    }
  },
  computed: {
    periodRate() {
      const w = this.windowStats
      return w.total ? Math.round(w.correct / w.total * 100) : 0
    },
    adjustedTicks() {
      const usedSec = this.duration - this.timeLeft
      const inWindow = usedSec - this.windowElapsedAtStart
      return Math.min(12, Math.max(0, Math.floor(inWindow / (ADJUST_INTERVAL / 12))))
    }
  },
  methods: {
    t(k, p) { return t(this.lang, k, p) },
    formatTime(sec) {
      const m = Math.floor(sec / 60), s = sec % 60
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    },
    onBatchSkip() { skipPbBatchGame() },
    nextQuestion() {
      if (this.pendingLevel != null) {
        this.level = this.pendingLevel
        this.pendingLevel = null
      }
      this.maxLevel = Math.max(this.maxLevel, this.level)
      this.pickedChars = []
      this.typedInput = ''
      this.revealAnswer = false
      this.feedback = null
      this.shakeIdiom = false
      this.q = generateQuestion(this.level, this.recentIdioms.slice(-15))
      this.recentIdioms.push(this.q.idiom)
      this.qId++
      this.cells = this.q.idiom.split('').map((ch, i) => {
        const b = this.q.blanks.find(b => b.index === i)
        return { char: ch, show: b ? '' : ch, isBlank: !!b, revealed: false, correct: false, wrong: false }
      })
      this.focusIdx = this.cells.findIndex(c => c.isBlank)
      this.questionStartMs = Date.now()
      this.startQuestionTimer()
      this.playQuestionVoice()
      if (this.q.inputMode) {
        this.$nextTick(() => { if (this.$refs.charInput) this.$refs.charInput.focus() })
      }
    },
    playQuestionVoice() {
      // 难度 1-5 → 1.mp3；难度 6 → 2.mp3；按语言选择目录
      try {
        this.stopAudio()
        const folder = this.lang === 'en' ? 'english' : 'chinese'
        const file = this.q && this.q.inputMode ? '2.mp3' : '1.mp3'
        this.audio = new Audio(`voice/${folder}/${file}`)
        this.audio.play().catch(() => {})
      } catch (e) {}
    },
    stopAudio() {
      try {
        if (this.audio) {
          this.audio.pause()
          this.audio.currentTime = 0
          this.audio = null
        }
      } catch (e) {}
    },
    startQuestionTimer() {
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      this.qtPct = 100
      this.qtRaf = setInterval(() => {
        if (this.paused) return
        const elapsed = Date.now() - this.questionStartMs
        this.qtPct = Math.max(0, 100 - (elapsed / MAX_ANSWER_MS) * 100)
        if (this.qtPct <= 0 || this.revealAnswer) clearInterval(this.qtRaf)
      }, 100)
      this.questionTimer = setTimeout(() => {
        if (!this.revealAnswer) this.onTimeout()
      }, MAX_ANSWER_MS)
    },
    onPickOption(char) {
      if (this.revealAnswer) return
      const blankIdx = this.cells.findIndex(c => c.isBlank && !c.revealed)
      if (blankIdx < 0) return
      const expected = this.cells[blankIdx].char
      this.pickedChars.push(char)
      if (char === expected) {
        this.cells[blankIdx].revealed = true
        this.cells[blankIdx].correct = true
        this.cells[blankIdx].show = char
        const next = this.cells.findIndex(c => c.isBlank && !c.revealed)
        this.focusIdx = next
        if (next < 0) this.recordAndReveal(true)
      } else {
        this.cells[blankIdx].wrong = true
        this.shakeIdiom = true
        setTimeout(() => { this.cells[blankIdx].wrong = false; this.shakeIdiom = false }, 500)
        this.recordAndReveal(false)
      }
    },
    onSubmitTyped() {
      if (this.revealAnswer) return
      if (this.typedInput.length !== this.q.blanks.length) return
      const expected = this.q.blanks.map(b => b.answer).join('')
      const ok = this.typedInput === expected
      this.recordAndReveal(ok)
    },
    onTimeout() {
      this.recordAndReveal(false, true)
    },
    recordAndReveal(correct, timeout) {
      const rt = Date.now() - this.questionStartMs
      this.stats.total++
      this.windowStats.total++
      if (correct) {
        this.stats.correct++
        this.windowStats.correct++
        this.score += BASE_SCORE * this.q.coef
        this.stats.reactionTimes.push(rt)
        this.feedback = { type: 'ok', title: this.t('correct') }
      } else {
        this.stats.fail++
        this.feedback = {
          type: 'bad',
          title: timeout ? this.t('timeUp') : this.t('wrong'),
          detail: this.t('correctAnswerIs') + this.q.idiom
        }
      }
      // 揭示全部答案
      this.q.blanks.forEach(b => {
        this.cells[b.index].revealed = true
        this.cells[b.index].show = b.answer
        if (correct) this.cells[b.index].correct = true
      })
      this.revealAnswer = true
      clearInterval(this.qtRaf)
      clearTimeout(this.questionTimer)
      setTimeout(() => {
        if (this.timeLeft > 0) this.nextQuestion()
      }, 1300)
    },
    startGameTimer() {
      this.gameTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft--
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.endGame() }
      }, 1000)
    },
    startAdaptiveWindow() {
      this.windowStats = { correct: 0, total: 0 }
      this.windowElapsedAtStart = this.duration - this.timeLeft
      clearInterval(this.windowTimer)
      this.windowTimer = setInterval(() => this.evaluateAdaptive(), WINDOW_MS)
    },
    evaluateAdaptive() {
      const w = this.windowStats
      if (w.total > 0) {
        const rate = w.correct / w.total
        let nl = this.level
        if (rate >= 0.9 && this.level < MAX_LEVEL) nl = this.level + 1
        else if (rate < 0.7 && this.level > 1) nl = this.level - 1
        if (nl !== this.level) this.pendingLevel = nl
      }
      this.windowStats = { correct: 0, total: 0 }
      this.windowElapsedAtStart = this.duration - this.timeLeft
    },
    endGame() {
      clearInterval(this.gameTimer)
      clearInterval(this.windowTimer)
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      this.stopAudio()
      const totalSec = this.duration - this.timeLeft
      const avgRt = this.stats.reactionTimes.length
        ? Math.round(this.stats.reactionTimes.reduce((a,b)=>a+b,0) / this.stats.reactionTimes.length)
        : 0
      this.$emit('end', {
        timestamp: Date.now(),
        duration: totalSec,
        maxLevel: this.maxLevel,
        endLevel: this.level, // HUD 当前难度（上传用）
        total: this.stats.total,
        correct: this.stats.correct,
        wrong: this.stats.fail,
        rate: this.stats.total ? Math.round(this.stats.correct / this.stats.total * 100) : 0,
        avgReact: +(avgRt / 1000).toFixed(2),
        score: Math.round(this.score)
      })
    },
    onExit() {
      this.paused = true
      this.pauseStartTime = Date.now()
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      this.showExitConfirm = true
    },
    cancelExit() {
      this.showExitConfirm = false
      if (this.paused && this.pauseStartTime) {
        const delta = Date.now() - this.pauseStartTime
        if (this.questionStartMs) this.questionStartMs += delta
        if (!this.revealAnswer && this.q) {
          const elapsed = Date.now() - this.questionStartMs
          const remaining = Math.max(0, MAX_ANSWER_MS - elapsed)
          this.qtRaf = setInterval(() => {
            if (this.paused) return
            const el = Date.now() - this.questionStartMs
            this.qtPct = Math.max(0, 100 - (el / MAX_ANSWER_MS) * 100)
            if (this.qtPct <= 0 || this.revealAnswer) clearInterval(this.qtRaf)
          }, 100)
          this.questionTimer = setTimeout(() => {
            if (!this.revealAnswer) this.onTimeout()
          }, remaining)
        }
      }
      this.paused = false
    },
    doExit() {
      this.showExitConfirm = false
      clearInterval(this.gameTimer)
      clearInterval(this.windowTimer)
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      this.stopAudio()
      leavePbGameWindow({ confirm: false })
      this.$emit('quit')
    }
  },
  mounted() {
    this.level = getBatchStartDifficultyForGame(GAME_TYPE) // 开局起始难度
    this.pendingLevel = null
    this.maxLevel = this.level
    this.nextQuestion()
    this.startGameTimer()
    this.startAdaptiveWindow()
  },
  beforeDestroy() {
    clearInterval(this.gameTimer)
    clearInterval(this.windowTimer)
    clearTimeout(this.questionTimer)
    clearInterval(this.qtRaf)
    this.stopAudio()
  }
}
</script>

<style scoped>
.game-page {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  padding: 3vmin;
  position: relative;
  gap: 2vmin;
}
.hud {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 1vmin;
}
.hud-left { display: flex; gap: 2.5vmin; }
.stat {
  background: #fff;
  padding: 1.5vmin 2.5vmin;
  border-radius: 1.5vmin;
  border: 0.25vmin solid #b08b4f;
  min-width: 14vmin;
  text-align: center;
  box-shadow: 0 0.4vmin 1vmin rgba(122,90,44,.12);
}
.stat .label { font-size: 1.8vmin; color: #8a6a3a; letter-spacing: 0.1vmin; }
.stat .value { font-size: 3.6vmin; font-weight: 700; color: #7a3a1e; line-height: 1.1; font-variant-numeric: tabular-nums; }
.stat .value.warn { color: #d33; animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: 0.5; } }

.hud-right { display: flex; gap: 1.2vmin; }
.hud-btn {
  padding: 1.4vmin 2.6vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 0.4vmin 1vmin rgba(122,90,44,.12);
  transition: all .18s;
}
.hud-btn:hover { background: #fff8ec; transform: translateY(-0.2vmin); }

.stage {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 2vmin;
  position: relative;
}
.rule {
  font-size: 3.4vmin;
  font-weight: 700;
  color: #7a3a1e;
  margin-bottom: 3vmin;
  text-align: center;
  letter-spacing: 0.2vmin;
}
.question-timer {
  width: 70vmin; height: 1.2vmin;
  background: #e8ddc8;
  border-radius: 1vmin;
  overflow: hidden;
  margin-bottom: 4vmin;
}
.qt-bar {
  height: 100%;
  background: linear-gradient(90deg, #58a058, #d97742);
  border-radius: 1vmin;
  transition: width 0.1s linear;
}

.idiom-container {
  display: flex; gap: 2vmin;
  margin-bottom: 4vmin;
}
.idiom-container.shake { animation: shake .4s; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-1.2vmin); }
  75% { transform: translateX(1.2vmin); }
}
.idiom-tile {
  width: 14vmin; height: 14vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 2vmin;
  font-size: 8vmin; font-weight: 700;
  color: #333;
  transition: all .25s;
  user-select: none;
  font-family: 'STSong', 'Noto Serif SC', serif;
}
.idiom-tile.blank {
  background: #fff8ec;
  border-style: dashed;
  border-color: #b08b4f;
}
.idiom-tile.blank .dash {
  display: block;
  width: 45%; height: 0.5vmin;
  background: #b08b4f;
  border-radius: 0.25vmin;
  opacity: .6;
}
.idiom-tile.focus {
  border-color: #d97742;
  border-style: solid;
  box-shadow: 0 0 0 0.6vmin rgba(217,119,66,.28);
  transform: translateY(-0.5vmin);
  animation: pulseFocus 1.4s infinite;
}
@keyframes pulseFocus {
  0%,100% { box-shadow: 0 0 0 0.6vmin rgba(217,119,66,.28); }
  50% { box-shadow: 0 0 0 1.1vmin rgba(217,119,66,.15); }
}
.idiom-tile.correct { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; border-style: solid; }
.idiom-tile.wrong { background: #ffd6cc; border-color: #d55; color: #c22; }
.idiom-tile.answer { background: #fff8dc; border-color: #d97742; color: #d97742; border-style: solid; }

.choices { display: flex; gap: 2vmin; flex-wrap: wrap; justify-content: center; }
.choice {
  width: 12vmin; height: 12vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 2vmin;
  font-size: 6vmin; font-weight: 700;
  color: #333;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 0.5vmin 1.2vmin rgba(122,90,44,.12);
  font-family: 'STSong', 'Noto Serif SC', serif;
}
@media (hover: hover) {
  .choice:hover:not(:disabled) { transform: translateY(-0.8vmin); border-color: #d97742; }
}
.choice:disabled { cursor: default; }
.choice.picked { opacity: .35; background: #f0e4c8; }
.choice.revealCorrect { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; }

.input-row { display: flex; gap: 2vmin; align-items: center; }
.char-input {
  width: 20vmin; height: 12vmin;
  font-size: 6vmin; font-weight: 700;
  text-align: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 2vmin;
  color: #333;
  outline: none;
  font-family: 'STSong', 'Noto Serif SC', serif;
  letter-spacing: 0.5vmin;
}
.char-input:focus { border-color: #d97742; box-shadow: 0 0 0 0.5vmin rgba(217,119,66,.2); }
.submit-btn {
  padding: 2vmin 3vmin;
  font-size: 2.4vmin;
  background: linear-gradient(135deg, #d97742, #b04e1e);
  color: #fff;
  border: 0.25vmin solid #a34418;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 700;
}
.submit-btn:disabled { opacity: .4; cursor: not-allowed; }

.feedback {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  min-width: 32vmin;
  padding: 3vmin 5vmin;
  border-radius: 2vmin;
  font-size: 3.2vmin;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,.2);
  z-index: 80;
  animation: fbPop .25s;
  pointer-events: none;
}
.feedback.ok { background: #d3f0d3; color: #2b7a2b; border: 0.3vmin solid #58a058; }
.feedback.bad { background: #ffd6cc; color: #c22; border: 0.3vmin solid #d55; }
.fb-detail { font-size: 2.4vmin; font-weight: 500; margin-top: 1vmin; letter-spacing: 0.2vmin; }
@keyframes fbPop {
  from { opacity: 0; transform: translate(-50%, -50%) scale(.85); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* Bottom adaptive scroll */
.bottom-scroll {
  display: flex; justify-content: space-between; align-items: center;
  gap: 2vmin;
  padding: 0 1vmin;
}
.scroll-track { flex: 1; display: flex; gap: 0.4vmin; }
.scroll-track .tick {
  flex: 1; height: 0.6vmin;
  background: #e8ddc8;
  border-radius: 0.3vmin;
  transition: background .3s;
}
.scroll-track .tick.active { background: linear-gradient(90deg, #d97742, #b04e1e); }
.scroll-label {
  font-size: 1.9vmin;
  color: #8a6a3a;
  font-weight: 600;
  min-width: 20vmin;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Exit confirm */
.confirm-overlay {
  position: absolute; inset: 0;
  background: rgba(30,20,10,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 60;
}
.confirm-card {
  background: #fdf9f0;
  padding: 4vmin;
  border-radius: 2vmin;
  border: 0.3vmin solid #b08b4f;
  min-width: 40vmin;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,.3);
}
.confirm-text { font-size: 2.6vmin; color: #7a3a1e; margin-bottom: 3vmin; text-align: center; }
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
.mini-btn {
  padding: 1.5vmin 3vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  border-radius: 1.2vmin;
  color: #7a5a2c;
  font-weight: 600;
  cursor: pointer;
  min-width: 12vmin;
}
.mini-btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }
</style>
