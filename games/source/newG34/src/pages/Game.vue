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
          <div class="value">{{ Math.round(score * 10) / 10 }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('timeLeft') }}</div>
          <div class="value" :class="{ warn: timeLeft <= 10 }">{{ formatTime(timeLeft) }}</div>
        </div>
      </div>
      <div class="hud-center">{{ isInput ? t('promptInput') : t('prompt') }}</div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="skip-btn" @click="$emit('batch-skip')">{{ t('skipGame') }}</button>
        <button class="exit-btn" @click="onExit">{{ t('back') }}</button>
      </div>
    </div>

    <!-- Question timer (under prompt, separated from picture) -->
    <div class="question-timer">
      <div class="qt-bar" :style="{ width: qtPct + '%' }"></div>
    </div>

    <!-- Stage -->
    <div class="stage">
      <div class="picture-card">
        <img v-if="q" class="picture" :src="q.image" :alt="q.answer" />
      </div>

      <!-- Options (levels 1-5) -->
      <div v-if="q && !isInput" class="choices" :class="'ch-' + q.options.length">
        <button
          v-for="(opt, i) in q.options"
          :key="opt + i"
          class="choice"
          :class="{
            picked: pickedChoice === opt && !revealAnswer,
            right: revealAnswer && opt === q.answer,
            wrong: revealAnswer && pickedChoice === opt && opt !== q.answer,
          }"
          :disabled="revealAnswer"
          @click="onPickChoice(opt)"
        >{{ opt }}</button>
      </div>

      <!-- Input (level 6) -->
      <div v-if="q && isInput" class="input-row">
        <input
          ref="answerInput"
          v-model="typedInput"
          class="answer-input"
          :placeholder="t('inputPlaceholder')"
          maxlength="8"
          :disabled="revealAnswer"
          @keydown.enter="onSubmitTyped"
        />
        <button class="submit-btn" :disabled="!typedInput || revealAnswer" @click="onSubmitTyped">
          {{ t('submit') }}
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="feedback" class="feedback" :class="feedback.type">
        <div class="fb-title">{{ feedback.title }}</div>
        <div v-if="feedback.detail" class="fb-detail">{{ feedback.detail }}</div>
      </div>
    </div>

    <!-- Exit confirm -->
    <div v-if="showExitConfirm" class="confirm-overlay" @click.self="cancelExit">
      <div class="confirm-card">
        <div class="confirm-text">{{ t('exitConfirm') }}</div>
        <div class="confirm-btns">
          <button class="mini-btn" @click="cancelExit">{{ t('back') }}</button>
          <button class="mini-btn primary" @click="doExit">{{ t('endGame') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js';
import { drawQuestion } from '../data/idioms.js';
import { LEVELS, BASE_SCORE, MAX_ANSWER_MS, WINDOW_MS, levelMeta } from '../data/levels.js';
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry';

const GAME_TYPE = 'ktccy'; // 看图猜成语 gameType

export default {
  name: 'GamePage',
  props: ['lang', 'duration', 'showBatchSkip'],
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      pendingLevel: null,
      score: 0,
      timeLeft: this.duration,
      // current question
      q: null,
      pickedChoice: null,
      typedInput: '',
      revealAnswer: false,
      feedback: null,
      // timers
      gameTimer: null,
      questionTimer: null,
      questionStartMs: 0,
      qtPct: 100,
      qtInterval: null,
      // adaptive difficulty
      windowStats: { correct: 0, total: 0 },
      windowTimer: null,
      // overall stats
      stats: { total: 0, correct: 0, fail: 0, reactionTimes: [] },
      // exit / pause
      showExitConfirm: false,
      paused: false,
      pauseStartTime: 0,
      // avoid repeats within a session
      usedImages: [],
      // audio prompt
      audio: null,
    };
  },
  computed: {
    currentLevel() { return levelMeta(this.level); },
    isInput() { return this.currentLevel.options === 0; },
  },
  methods: {
    t(k, p) { return t(this.lang, k, p); },
    formatTime(sec) {
      const m = Math.floor(sec / 60), s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
    nextQuestion() {
      if (this.pendingLevel != null) {
        this.level = this.pendingLevel;
        this.pendingLevel = null;
      }
      const lv = this.currentLevel;
      const q = drawQuestion(lv.pool, lv.options, this.usedImages);
      this.usedImages.push(q.image);
      // cap repeat-avoid list per pool
      if (this.usedImages.length > 30) this.usedImages.shift();

      this.q = q;
      this.pickedChoice = null;
      this.typedInput = '';
      this.revealAnswer = false;
      this.feedback = null;
      this.questionStartMs = Date.now();
      this.startQuestionTimer();
      this.playQuestionVoice();
      if (this.isInput) {
        this.$nextTick(() => { if (this.$refs.answerInput) this.$refs.answerInput.focus(); });
      }
    },
    playQuestionVoice() {
      try {
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
        const folder = this.lang === 'en' ? 'english' : 'chinese';
        this.audio = new Audio(`voice/${folder}/1.mp3`);
        this.audio.play().catch(() => {});
      } catch (e) { /* ignore */ }
    },
    stopAudio() {
      try {
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
          this.audio = null;
        }
      } catch (e) { /* ignore */ }
    },
    startQuestionTimer() {
      clearTimeout(this.questionTimer);
      clearInterval(this.qtInterval);
      this.qtPct = 100;
      this.qtInterval = setInterval(() => {
        if (this.paused) return;
        const elapsed = Date.now() - this.questionStartMs;
        this.qtPct = Math.max(0, 100 - (elapsed / MAX_ANSWER_MS) * 100);
        if (this.qtPct <= 0 || this.revealAnswer) clearInterval(this.qtInterval);
      }, 100);
      this.questionTimer = setTimeout(() => {
        if (!this.revealAnswer) this.onTimeout();
      }, MAX_ANSWER_MS);
    },
    onPickChoice(opt) {
      if (this.revealAnswer) return;
      this.pickedChoice = opt;
      const ok = opt === this.q.answer;
      this.recordAnswer(ok, false);
      this.showRevealAndAdvance();
    },
    onSubmitTyped() {
      if (this.revealAnswer || !this.typedInput) return;
      const ok = this.typedInput.trim() === this.q.answer;
      this.recordAnswer(ok, false);
      this.showRevealAndAdvance();
    },
    onTimeout() {
      this.recordAnswer(false, true);
      this.showRevealAndAdvance();
    },
    recordAnswer(correct, timeout) {
      const rt = Date.now() - this.questionStartMs;
      this.stats.total++;
      this.windowStats.total++;
      if (correct) {
        this.stats.correct++;
        this.windowStats.correct++;
        this.score += BASE_SCORE * this.currentLevel.coeff;
        this.stats.reactionTimes.push(rt);
        this.feedback = { type: 'ok', title: this.t('correct') };
      } else {
        this.stats.fail++;
        this.feedback = {
          type: 'bad',
          title: timeout ? this.t('timeUp') : this.t('wrong'),
          detail: this.t('correctAnswerIs') + this.q.answer,
        };
      }
    },
    showRevealAndAdvance() {
      this.revealAnswer = true;
      clearInterval(this.qtInterval);
      clearTimeout(this.questionTimer);
      setTimeout(() => {
        if (this.timeLeft > 0 && !this.showExitConfirm) this.nextQuestion();
      }, 1300);
    },
    startGameTimer() {
      this.gameTimer = setInterval(() => {
        if (this.paused) return;
        this.timeLeft--;
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.endGame(); }
      }, 1000);
    },
    startAdaptiveWindow() {
      this.windowStats = { correct: 0, total: 0 };
      clearInterval(this.windowTimer);
      this.windowTimer = setInterval(() => this.evaluateAdaptive(), WINDOW_MS);
    },
    evaluateAdaptive() {
      const w = this.windowStats;
      if (w.total > 0) {
        const rate = w.correct / w.total;
        let nextLevel = this.level;
        if (rate >= 0.9 && this.level < LEVELS.length) nextLevel = this.level + 1;
        else if (rate <= 0.7 && this.level > 1) nextLevel = this.level - 1;
        if (nextLevel !== this.level) this.pendingLevel = nextLevel;
      }
      this.windowStats = { correct: 0, total: 0 };
    },
    onSkipClick() { /* per spec: visual only, no functional skip */ },
    onExit() {
      this.paused = true;
      this.pauseStartTime = Date.now();
      clearTimeout(this.questionTimer);
      clearInterval(this.qtInterval);
      this.showExitConfirm = true;
    },
    cancelExit() {
      this.showExitConfirm = false;
      if (this.paused && this.pauseStartTime) {
        const delta = Date.now() - this.pauseStartTime;
        if (this.questionStartMs) this.questionStartMs += delta;
        if (!this.revealAnswer && this.q) {
          const elapsed = Date.now() - this.questionStartMs;
          const remaining = Math.max(0, MAX_ANSWER_MS - elapsed);
          this.qtInterval = setInterval(() => {
            if (this.paused) return;
            const el = Date.now() - this.questionStartMs;
            this.qtPct = Math.max(0, 100 - (el / MAX_ANSWER_MS) * 100);
            if (this.qtPct <= 0 || this.revealAnswer) clearInterval(this.qtInterval);
          }, 100);
          this.questionTimer = setTimeout(() => { if (!this.revealAnswer) this.onTimeout(); }, remaining);
        }
      }
      this.paused = false;
    },
    doExit() { this.showExitConfirm = false; this.$emit('quit') },
    endGame() {
      clearInterval(this.gameTimer);
      clearInterval(this.windowTimer);
      clearTimeout(this.questionTimer);
      clearInterval(this.qtInterval);
      this.stopAudio();
      const summary = {
        durationSec: this.duration,
        finalLevel: this.level,
        score: Math.round(this.score * 10) / 10,
        total: this.stats.total,
        correct: this.stats.correct,
        fail: this.stats.fail,
        rate: this.stats.total ? this.stats.correct / this.stats.total : 0,
        avgRt: this.stats.reactionTimes.length
          ? Math.round(this.stats.reactionTimes.reduce((a, b) => a + b, 0) / this.stats.reactionTimes.length)
          : 0,
        finishedAt: Date.now(),
      };
      this.$emit('end', summary);
    },
  },
  mounted() {
    this.nextQuestion();
    this.startGameTimer();
    this.startAdaptiveWindow();
  },
  beforeDestroy() {
    clearInterval(this.gameTimer);
    clearInterval(this.windowTimer);
    clearTimeout(this.questionTimer);
    clearInterval(this.qtInterval);
    this.stopAudio();
  },
};
</script>

<style scoped>
.game-page {
  width: 100%; height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex; flex-direction: column;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  padding: 2vmin 3vmin;
  position: relative;
  box-sizing: border-box;
}
.hud {
  display: flex; justify-content: space-between; align-items: center;
  gap: 2vmin;
  padding: 0 1vmin;
}
.hud-left { display: flex; gap: 2vmin; flex-shrink: 0; }
.hud-center {
  flex: 1;
  text-align: center;
  font-size: 2.8vmin;
  font-weight: 700;
  color: #7a3a1e;
  letter-spacing: 0.25vmin;
  padding: 0 1vmin;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat {
  background: #fff;
  padding: 1.2vmin 2.2vmin;
  border-radius: 1.5vmin;
  border: 0.25vmin solid #b08b4f;
  min-width: 14vmin;
  text-align: center;
  box-shadow: 0 0.4vmin 1vmin rgba(122,90,44,.12);
}
.stat .label { font-size: 1.7vmin; color: #8a6a3a; letter-spacing: 0.1vmin; }
.stat .value { font-size: 3.2vmin; font-weight: 700; color: #7a3a1e; }
.stat .value.warn { color: #d33; animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: 0.5; } }

.hud-right { display: flex; gap: 1.5vmin; flex-shrink: 0; }
.skip-btn, .exit-btn {
  padding: 1.4vmin 2.6vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
}
.skip-btn:hover, .exit-btn:hover { background: #fff8ec; }

.stage {
  flex: 1 1 auto;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 1.5vmin 2vmin 1vmin;
  gap: 1.8vmin;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
.question-timer {
  width: min(70vmin, 92vw); height: 1.2vmin;
  margin: 1.5vmin auto 0;
  background: #e8ddc8;
  border-radius: 1vmin;
  overflow: hidden;
  flex-shrink: 0;
}
.qt-bar {
  height: 100%;
  background: linear-gradient(90deg, #58a058, #d97742);
  border-radius: 1vmin;
  transition: width 0.1s linear;
}

.picture-card {
  flex: 1 1 auto;
  min-height: 0;
  width: min(82vmin, 92vw);
  max-height: 52vh;
  background: #fff;
  border: 0.35vmin solid #b08b4f;
  border-radius: 2.5vmin;
  padding: 1.2vmin;
  box-shadow: 0 1vmin 2.4vmin rgba(122,90,44,.18);
  display: flex; align-items: center; justify-content: center;
  box-sizing: border-box;
}
.picture { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; user-select: none; -webkit-user-drag: none; }

.choices {
  display: grid;
  gap: 1.5vmin;
  justify-content: center;
  width: min(78vmin, 92vw);
  flex-shrink: 0;
}
.ch-2 { grid-template-columns: repeat(2, 1fr); }
.ch-3 { grid-template-columns: repeat(3, 1fr); }
.ch-4 { grid-template-columns: repeat(2, 1fr); }
@media (min-aspect-ratio: 4/3) {
  .ch-4 { grid-template-columns: repeat(4, 1fr); }
}
.choice {
  padding: 2.2vmin 2vmin;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 1.8vmin;
  font-size: 3.8vmin; font-weight: 800;
  color: #222;
  letter-spacing: 0.4vmin;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 0.5vmin 1.2vmin rgba(122,90,44,.12);
}
@media (hover: hover) {
  .choice:hover:not(:disabled) {
    transform: translateY(-0.6vmin);
    border-color: #b08b4f;
    box-shadow: 0 0.8vmin 1.6vmin rgba(122,90,44,.2);
  }
}
.choice:disabled { cursor: default; }
.choice.picked { border-color: #d97742; background: #fff2e0; }
.choice.right { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; box-shadow: 0 0 0 0.4vmin rgba(88,160,88,.25); }
.choice.wrong { background: #ffd6cc; border-color: #d55; color: #c22; }

.input-row { display: flex; gap: 2vmin; align-items: center; }
.answer-input {
  width: 42vmin; height: 8vmin;
  padding: 0 2.5vmin;
  font-size: 3.2vmin; font-weight: 700;
  text-align: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 1.8vmin;
  color: #333;
  letter-spacing: 0.3vmin;
  outline: none;
}
.answer-input:focus { border-color: #d97742; box-shadow: 0 0 0 0.5vmin rgba(217,119,66,.2); }
.answer-input:disabled { background: #f6f2ea; }
.submit-btn {
  padding: 2vmin 3.5vmin;
  font-size: 2.6vmin;
  background: linear-gradient(135deg, #d97742, #b04e1e);
  color: #fff;
  border: 0.25vmin solid #a34418;
  border-radius: 1.8vmin;
  cursor: pointer;
  font-weight: 700;
}
.submit-btn:disabled { opacity: .4; cursor: not-allowed; }

.feedback {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  min-width: 32vmin;
  padding: 3vmin 5vmin;
  border-radius: 2vmin;
  font-size: 3.2vmin; font-weight: 700;
  text-align: center;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,.25);
  z-index: 80;
  animation: fbPop .25s;
}
.feedback.ok  { background: #d3f0d3; color: #2b7a2b; border: 0.3vmin solid #58a058; }
.feedback.bad { background: #ffd6cc; color: #c22; border: 0.3vmin solid #d55; }
.fb-detail { font-size: 2.4vmin; font-weight: 500; margin-top: 1vmin; letter-spacing: 0.2vmin; }
@keyframes fbPop {
  from { opacity: 0; transform: translate(-50%, -50%) scale(.85); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

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
}
.mini-btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }

/* Short-height screens (landscape tablets, small laptops): tighten sizing so image + choices + HUD all fit */
@media (max-height: 700px) {
  .picture-card { max-height: 46vh; }
  .stat { padding: 0.9vmin 1.6vmin; min-width: 12vmin; }
  .stat .value { font-size: 2.6vmin; }
  .stat .label { font-size: 1.5vmin; }
  .hud-center { font-size: 2.2vmin; }
  .skip-btn, .exit-btn { padding: 1vmin 2vmin; font-size: 1.9vmin; }
  .choice { padding: 1.6vmin 1.6vmin; font-size: 3.2vmin; }
  .stage { gap: 1.2vmin; padding: 1vmin 2vmin; }
}
@media (max-height: 520px) {
  .picture-card { max-height: 42vh; }
  .question-timer { height: 0.9vmin; }
  .choice { padding: 1.3vmin 1.4vmin; font-size: 2.8vmin; }
}
</style>
