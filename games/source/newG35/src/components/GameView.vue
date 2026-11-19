<template>
  <div class="game-view" :class="'phase-' + phase">
    <!-- Top HUD ------------------------------------------------- -->
    <header class="hud">
      <div class="hud-left">
        <div class="stat">
          <div class="label">{{ t('level') }}</div>
          <div class="value">{{ level }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('score') }}</div>
          <div class="value" :class="{ bump: scoreBump }">{{ score }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('timeLeft') }}</div>
          <div class="value" :class="{ warn: sessionLeft <= 10 }">{{ fmtSec(sessionLeft) }}</div>
        </div>
      </div>

      <div class="hud-right">
        <button class="ctrl-btn" @click="pause">{{ t('back') }}</button>
        <button v-if="showBatchSkip" class="ctrl-btn danger" @click="onBatchSkip">{{ t('skipGame') }}</button>
      </div>
    </header>

    <!-- Stage --------------------------------------------------- -->
    <div class="stage">
      <div class="rule-tag">
        {{ q ? (q.type === 'syn' ? synHint : antHint) : '' }}
      </div>

      <div class="question-timer">
        <div class="qt-bar" :class="{ warn: qLeft <= 3 }" :style="{ width: qtPct + '%' }"></div>
      </div>

      <transition name="prompt" mode="out-in">
        <div class="target-card" :key="q ? q.word : 'x'" v-if="q">
          <div class="target-prompt">{{ q.type === 'syn' ? t('typeSyn') : t('typeAnt') }}</div>
          <div class="target-word">{{ q.word }}</div>
        </div>
      </transition>

      <transition name="opts-fade" mode="out-in">
        <div v-if="q" :key="qSeq" class="options" :class="'opts-' + q.options.length">
          <button
            v-for="(o, i) in q.options"
            :key="i"
            class="opt"
            :class="{
              correct: reveal && o === q.correct,
              wrong: reveal && picked === o && o !== q.correct,
              dim: reveal && picked !== o && o !== q.correct,
            }"
            :disabled="picked !== null"
            :style="{ '--i': i }"
            @click="answer(o)"
          >
            <span class="opt-idx">{{ ['A','B','C','D'][i] }}</span>
            <span class="opt-text">{{ o }}</span>
            <span class="opt-mark" v-if="reveal && o === q.correct">✓</span>
            <span class="opt-mark wrong" v-else-if="reveal && picked === o">✗</span>
          </button>
        </div>
      </transition>

      <transition name="rise">
        <div v-if="feedback" class="feedback" :class="feedback.kind">
          <span>{{ feedback.label }}</span>
          <span v-if="feedback.delta" class="fb-delta">+{{ feedback.delta }}</span>
        </div>
      </transition>
    </div>

    <!-- Pause overlay -------------------------------------------- -->
    <transition name="fade">
      <div v-if="phase === 'paused'" class="pause-overlay">
        <div class="pause-card paper">
          <div class="pause-icon">⏸</div>
          <h3>{{ t('pauseTitle') }}</h3>
          <p>{{ t('pauseTip') }}</p>
          <div class="pause-actions">
            <button class="btn" @click="quit">{{ t('quit') }}</button>
            <button class="btn btn-primary" @click="resume">{{ t('resume') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { makeQuestion, DIFFICULTIES } from '../wordBank.js'
import { i18n, i18nMixin } from '../i18n.js'
import { saveRecord } from '../storage.js'
import { playPrompt, stopPrompt } from '../audio.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'cyfl' // 词义分类 gameType

const MAX_Q_SEC = 15
const WINDOW_SEC = 60

export default {
  name: 'GameView',
  mixins: [i18nMixin],
  props: {
    duration: { type: Number, default: 180 },
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      phase: 'playing',
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      scoreBump: false,

      q: null,
      qSeq: 0,
      qLeft: MAX_Q_SEC,
      qStartedAt: 0,
      picked: null,
      reveal: false,
      feedback: null,

      sessionLeft: this.duration,
      windowElapsed: 0,
      windowCorrect: 0,
      windowTotal: 0,

      totalQ: 0,
      totalCorrect: 0,
      totalWrong: 0,
      reactionSum: 0,
      reactionCount: 0,

      startedAtISO: new Date().toISOString(),
      tickH: null,
    }
  },
  computed: {
    qtPct() { return (this.qLeft / MAX_Q_SEC) * 100 },
    synHint() { return i18n.locale === 'zh' ? '选择意思相近的词' : 'Choose a word with similar meaning' },
    antHint() { return i18n.locale === 'zh' ? '选择意思相反的词' : 'Choose a word with opposite meaning' },
  },
  mounted() {
    this.next()
    this.tickH = setInterval(this.tick, 1000)
  },
  beforeDestroy() { clearInterval(this.tickH); stopPrompt() },
  methods: {
    fmtSec(s) {
      const m = Math.floor(s / 60), r = s % 60
      return `${m}:${r < 10 ? '0' : ''}${r}`
    },

    tick() {
      if (this.phase !== 'playing') return
      this.sessionLeft--
      if (this.sessionLeft <= 0) { this.endGame(); return }
      if (this.q && this.picked === null) {
        this.qLeft--
        if (this.qLeft <= 0) this.timeUp()
      }
      this.windowElapsed++
      if (this.windowElapsed >= WINDOW_SEC) this.evalWindow()
    },

    next() {
      this.q = makeQuestion(this.level, i18n.locale)
      this.qSeq++
      this.picked = null
      this.reveal = false
      this.qLeft = MAX_Q_SEC
      this.qStartedAt = performance.now()
      playPrompt(i18n.locale, this.q.type)
    },

    answer(opt) {
      if (this.picked !== null || !this.q) return
      const rt = performance.now() - this.qStartedAt
      this.picked = opt
      this.reveal = true

      const ok = opt === this.q.correct
      this.windowTotal++
      this.totalQ++
      if (ok) {
        const gain = Math.round(5 * this.q.coef)
        this.score += gain
        this.bumpScore()
        this.totalCorrect++
        this.windowCorrect++
        this.reactionSum += rt
        this.reactionCount++
        this.showFeedback('ok', this.t('correct'), gain)
      } else {
        this.totalWrong++
        this.showFeedback('bad', this.t('wrong'))
      }
      setTimeout(() => { if (this.phase === 'playing') this.next() }, 1100)
    },

    timeUp() {
      if (this.picked !== null || !this.q) return
      this.reveal = true
      this.totalQ++
      this.totalWrong++
      this.windowTotal++
      this.showFeedback('bad', this.t('timeUp'))
      setTimeout(() => { if (this.phase === 'playing') this.next() }, 1100)
    },

    evalWindow() {
      if (this.windowTotal > 0) {
        const rate = this.windowCorrect / this.windowTotal
        if (rate >= 0.9 && this.level < DIFFICULTIES.length) this.level++
        else if (rate <= 0.7 && this.level > 1) this.level--
      }
      this.windowElapsed = 0
      this.windowCorrect = 0
      this.windowTotal = 0
    },

    bumpScore() {
      this.scoreBump = true
      setTimeout(() => { this.scoreBump = false }, 400)
    },

    showFeedback(kind, label, delta) {
      this.feedback = { kind, label, delta }
      setTimeout(() => { this.feedback = null }, 900)
    },

    pause() { if (this.phase === 'playing') this.phase = 'paused' },
    resume() { if (this.phase === 'paused') this.phase = 'playing' },
    quit() {
      leavePbGameWindow({ confirm: false })
    },

    endGame() {
      this.phase = 'over'
      const rec = this.persistRecord()
      this.$emit('nav', { to: 'result', data: rec })
    },
    onBatchSkip() {
      skipPbBatchGame()
    },

    persistRecord() {
      const elapsed = this.duration - this.sessionLeft
      const rate = this.totalQ ? this.totalCorrect / this.totalQ : 0
      const avgRT = this.reactionCount ? Math.round(this.reactionSum / this.reactionCount) : 0
      const rec = {
        time: this.startedAtISO,
        project: 'word_class',
        finalLevel: this.level,
        duration: elapsed,
        total: this.totalQ,
        correct: this.totalCorrect,
        wrong: this.totalWrong,
        rate,
        avgRT,
        score: this.score,
      }
      saveRecord(rec)
      return rec
    },
  },
}
</script>

<style scoped>
.game-view {
  width: 100%; height: 100%;
  padding: 3vmin 4vmin;
  display: flex; flex-direction: column;
  gap: 2.5vmin;
}

/* --- HUD ----------------------------------------------------- */
.hud {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2vmin; flex-wrap: wrap;
}
.hud-left { display: flex; gap: 2vmin; flex-wrap: wrap; }
.hud-right { display: flex; gap: 1.5vmin; }

.stat {
  min-width: 14vmin;
  padding: 1.4vmin 2.4vmin;
  border-radius: 1.5vmin;
  background: var(--c-paper);
  border: 0.25vmin solid var(--c-line-2);
  box-shadow: var(--shadow-sm);
  text-align: center;
}
.stat .label {
  font-size: 1.8vmin;
  color: var(--c-brown-dim);
  letter-spacing: 0.15vmin;
  font-weight: 600;
}
.stat .value {
  font-size: 3.6vmin;
  font-weight: 700;
  color: var(--c-title);
  font-variant-numeric: tabular-nums;
  margin-top: 0.3vmin;
}
.stat .value.warn { color: var(--c-warn); animation: pulse 1s infinite; }
.stat .value.bump { animation: bump .4s ease-out; }
@keyframes pulse { 50% { transform: scale(1.08); } }
@keyframes bump { 30% { transform: scale(1.25); color: var(--c-orange); } 100% { transform: scale(1); } }

.ctrl-btn {
  padding: 1.4vmin 2.4vmin;
  font-size: 2.2vmin;
  font-weight: 600;
  background: var(--c-paper);
  color: var(--c-brown);
  border: 0.25vmin solid var(--c-line-2);
  border-radius: 3vmin;
  box-shadow: var(--shadow-sm);
  transition: all .18s;
}
.ctrl-btn:hover { background: var(--c-paper-soft); transform: translateY(-0.3vmin); }
.ctrl-btn.danger {
  background: linear-gradient(135deg, #d55, #a33);
  color: #fff;
  border-color: #922;
}
.ctrl-btn.danger:hover { background: linear-gradient(135deg, #e66, #b44); }

/* --- Stage --------------------------------------------------- */
.stage {
  flex: 1;
  min-height: 0;
  display: flex; flex-direction: column; align-items: center;
  gap: 3vmin;
  position: relative;
  padding: 2vmin;
}
.rule-tag {
  padding: 1.2vmin 3vmin;
  background: var(--c-paper);
  border: 0.25vmin solid var(--c-orange);
  color: var(--c-orange-dim);
  border-radius: 4vmin;
  font-size: 2.4vmin;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.question-timer {
  width: 60vmin; max-width: 90%;
  height: 1.6vmin;
  background: #e8ddc8;
  border-radius: 1vmin;
  overflow: hidden;
}
.qt-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--c-ok), var(--c-orange));
  border-radius: 1vmin;
  transition: width 1s linear;
}
.qt-bar.warn { background: linear-gradient(90deg, var(--c-orange), #d33); }

.target-card {
  width: min(70vmin, 90%);
  padding: 4vmin 5vmin;
  border-radius: 2.4vmin;
  background: var(--c-paper);
  border: 0.4vmin solid var(--c-line-2);
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; align-items: center;
  gap: 1.5vmin;
}
.target-prompt {
  font-size: 2.4vmin;
  color: var(--c-brown-dim);
  letter-spacing: 0.4vmin;
  font-weight: 600;
}
.target-word {
  font-size: 9vmin;
  font-weight: 800;
  color: var(--c-title);
  letter-spacing: 0.6vmin;
  line-height: 1;
  text-align: center;
}

/* --- Options ------------------------------------------------ */
.options {
  display: grid;
  gap: 2vmin;
  width: min(80vmin, 96%);
}
.opts-2 { grid-template-columns: repeat(2, 1fr); }
.opts-3 { grid-template-columns: repeat(3, 1fr); }
.opts-4 { grid-template-columns: repeat(2, 1fr); }
@media (min-width: 900px) {
  .opts-4 { grid-template-columns: repeat(4, 1fr); }
}

.opt {
  position: relative;
  padding: 3vmin 2.5vmin;
  min-height: 14vmin;
  border-radius: 1.8vmin;
  background: var(--c-paper);
  border: 0.35vmin solid var(--c-line);
  color: #333;
  display: flex; align-items: center; gap: 2vmin;
  box-shadow: var(--shadow-sm);
  transition: all .2s;
  animation: optIn .4s calc(var(--i) * .06s) both;
}
@keyframes optIn { from { opacity: 0; transform: translateY(1.5vmin); } to { opacity: 1; transform: none; } }
.opt:hover:not(:disabled) { transform: translateY(-0.6vmin); border-color: var(--c-orange); box-shadow: var(--shadow-md); }
.opt:disabled { cursor: default; }

.opt-idx {
  width: 5.4vmin; height: 5.4vmin;
  border-radius: 50%;
  background: var(--c-paper-soft);
  border: 0.3vmin solid var(--c-line-2);
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 3vmin;
  color: var(--c-brown);
  flex-shrink: 0;
}
.opt-text {
  font-size: 4.6vmin;
  font-weight: 700;
  color: var(--c-title);
  letter-spacing: 0.25vmin;
  flex: 1;
}
.opt-mark {
  font-size: 4.4vmin;
  font-weight: 900;
  color: var(--c-ok-text);
}
.opt-mark.wrong { color: var(--c-err-text); }

.opt.correct {
  background: var(--c-ok-bg);
  border-color: var(--c-ok);
  box-shadow: 0 0 0 0.5vmin rgba(88,160,88,.2);
  animation: correctFlash .5s;
}
.opt.correct .opt-text { color: var(--c-ok-text); }
.opt.correct .opt-idx { background: var(--c-ok); color: #fff; border-color: var(--c-ok); }
@keyframes correctFlash { 0% { transform: scale(1); } 30% { transform: scale(1.03); } 100% { transform: scale(1); } }

.opt.wrong {
  background: var(--c-err-bg);
  border-color: var(--c-err);
  animation: shake .4s;
}
.opt.wrong .opt-text { color: var(--c-err-text); }
.opt.wrong .opt-idx { background: var(--c-err); color: #fff; border-color: var(--c-err); }
@keyframes shake {
  10%, 90% { transform: translateX(-0.4vmin); }
  30%, 70% { transform: translateX(0.6vmin); }
  50% { transform: translateX(-0.8vmin); }
}
.opt.dim { opacity: .45; }

/* --- Feedback --------------------------------------------- */
.feedback {
  position: absolute;
  left: 50%;
  bottom: 4vmin;
  transform: translateX(-50%);
  padding: 1.4vmin 3vmin;
  font-size: 3.2vmin;
  font-weight: 800;
  border-radius: 4vmin;
  display: flex; align-items: center; gap: 1vmin;
  pointer-events: none;
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
}
.feedback.ok {
  background: var(--c-ok);
  color: #fff;
}
.feedback.bad {
  background: var(--c-err);
  color: #fff;
}
.rise-enter-active, .rise-leave-active { transition: opacity .35s, transform .35s; }
.rise-enter { opacity: 0; transform: translate(-50%, 2vmin); }
.rise-leave-to { opacity: 0; transform: translate(-50%, -2vmin); }

.opts-fade-enter-active, .opts-fade-leave-active { transition: opacity .22s ease; }
.opts-fade-enter, .opts-fade-leave-to { opacity: 0; }

/* --- Pause overlay --------------------------------------- */
.pause-overlay {
  position: absolute; inset: 0; z-index: 10;
  background: rgba(122,58,30,.25);
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.pause-card {
  width: min(55vmin, 100%);
  padding: 5vmin;
  display: flex; flex-direction: column; align-items: center;
  gap: 2vmin;
  text-align: center;
}
.pause-icon {
  font-size: 9vmin;
  color: var(--c-orange);
}
.pause-card h3 {
  font-size: 4vmin;
  font-weight: 700;
  color: var(--c-title);
  letter-spacing: 0.3vmin;
}
.pause-card p { color: var(--c-brown-dim); font-size: 2.4vmin; }
.pause-actions { display: flex; gap: 2vmin; margin-top: 1vmin; }

.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

.prompt-enter-active, .prompt-leave-active { transition: opacity .35s, transform .35s; }
.prompt-enter { opacity: 0; transform: scale(.9); }
.prompt-leave-to { opacity: 0; transform: scale(1.05); }
</style>
