<template>
  <div class="game-page">
    <div class="bg-layer"></div>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t('difficulty') }}</span>
          <span class="hud-value level-badge">Lv{{ level }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t('score') }}</span>
          <span class="hud-value">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t('timeLeft') }}</span>
          <span class="hud-value" :class="{ 'time-urgent': timeLeft <= 10 }">{{ formatTime(timeLeft) }}</span>
        </div>
      </div>
      <div class="hud-center">
        <div class="task-msg">{{ t('question') }}</div>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t('skipGame') }}</button>
        <button class="back-btn" @click="handleExit">✕ {{ t('exit') }}</button>
      </div>
    </div>

    <!-- Question timer -->
    <div class="q-timer-wrap">
      <div class="q-timer-bar" :style="{ width: qTimerPct + '%', background: qTimerColor }"></div>
    </div>

    <!-- Price list on the left -->
    <div class="price-panel" v-if="question">
      <div class="price-title">{{ t('priceTitle') }}</div>
      <div class="price-row" v-for="g in question.groups" :key="g.typeKey">
        <span class="price-type">{{ t(g.typeKey) }}</span>
        <span class="price-sep">:</span>
        <span class="price-num">{{ g.price }}</span>
        <span class="price-unit">{{ t('priceYuan') }}</span>
      </div>
    </div>

    <!-- Characters (positioned in the red-box area) -->
    <div class="character-area" v-if="question">
      <div class="char-group" v-for="(g, i) in question.groups" :key="i">
        <div class="char-imgs">
          <img
            v-for="(src, j) in g.images"
            :key="j"
            :src="src"
            :alt="g.typeKey"
            class="char-img"
          />
        </div>
      </div>
    </div>

    <!-- Options -->
    <div class="options-area">
      <button
        v-for="(opt, i) in currentOptions"
        :key="i"
        class="opt-btn"
        :class="optClass(opt)"
        :disabled="answered"
        @click="pickAnswer(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <!-- Feedback -->
    <transition name="pop">
      <div class="feedback" v-if="feedback" :class="feedback.kind">
        <div class="fb-icon">{{ feedback.icon }}</div>
        <div class="fb-text">{{ feedback.text }}</div>
      </div>
    </transition>

    <!-- Exit confirm -->
    <div v-if="showExitConfirm" class="confirm-mask">
      <div class="confirm-box">
        <p>{{ t('exitConfirm') }}</p>
        <div class="confirm-btns">
          <button class="cbtn" @click="cancelExit">{{ t('back') }}</button>
          <button class="cbtn primary" @click="confirmExit">{{ t('exit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import {
  generateQuestion,
  DIFFICULTY_CONFIG,
  MAX_LEVEL,
  MIN_LEVEL,
  QUESTION_TIME_LIMIT,
} from '../gameLogic.js';
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy';

export default {
  name: 'GamePage',
  props: {
    t: { type: Function, required: true },
    lang: { type: String, required: true },
    durationSec: { type: Number, required: true },
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame('dwygp'),
      score: 0,
      timeLeft: this.durationSec,
      question: null,
      currentOptions: [],
      answered: false,
      pickedOption: null,
      qTimerStart: 0,
      qTimerMs: QUESTION_TIME_LIMIT * 1000,
      feedback: null,
      windowStart: 0,
      windowCorrect: 0,
      windowTotal: 0,
      totalCount: 0,
      correctCount: 0,
      wrongCount: 0,
      maxDifficulty: 1,
      reactionTimes: [],
      showExitConfirm: false,
      paused: false,
      pauseStartTime: 0,
      qTimerPct: 100,
      qTimerColor: '#4caf50',
      showBatchSkip: shouldShowPbBatchSkip(),
    };
  },
  computed: {
    questionText() {
      if (!this.question) return '';
      const parts = this.question.groups.map((g) => {
        const type = this.t(g.typeKey);
        if (this.lang === 'zh') return `${g.count}张${type}票`;
        return `${g.count} ${type}`;
      });
      const joiner = ' + ';
      if (this.lang === 'zh') return '买 ' + parts.join(joiner) + '，共需多少元？';
      return 'Buy ' + parts.join(joiner) + '. Total?';
    },
  },
  mounted() {
    this.windowStart = Date.now();
    this.primeAudio();
    this.startNextQuestion();
    this.mainTimer = setInterval(this.tickMain, 1000);
    this.qFrame = requestAnimationFrame(this.tickQ);
  },
  beforeDestroy() {
    this.cleanup();
  },
  methods: {
    cleanup() {
      if (this.mainTimer) clearInterval(this.mainTimer);
      if (this.qFrame) cancelAnimationFrame(this.qFrame);
      this.mainTimer = null;
      this.qFrame = null;
      if (this.promptAudio) {
        try { this.promptAudio.pause(); } catch (e) {}
        this.promptAudio = null;
      }
    },
    // Prime a single reusable <audio> element so the first play call
    // on tablet browsers (iPadOS Safari in particular) doesn't clip the
    // opening of the clip. We run a silent play/pause to unlock the audio
    // context inside the same user-gesture that mounted the game, then
    // load the real prompt and wait until it's buffered before use.
    primeAudio() {
      try {
        const dir = this.lang === 'en' ? 'english' : 'chinese';
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0;
        audio.muted = true;
        audio.src = resolveVoice(`/voice/${dir}/1.mp3`);
        this.promptAudio = audio;
        this.audioReady = false;
        const markReady = () => {
          audio.muted = false;
          audio.volume = 1;
          this.audioReady = true;
        };
        audio.addEventListener('canplaythrough', markReady, { once: true });
        // Fallback: some browsers don't reliably fire canplaythrough.
        setTimeout(markReady, 800);
        // Silent warm-up play to unlock the audio pipeline.
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    },
    startNextQuestion() {
      this.answered = false;
      this.pickedOption = null;
      this.feedback = null;
      this.question = generateQuestion(this.level);
      this.currentOptions = this.question.options;
      this.qTimerStart = Date.now();
      this.qTimerPct = 100;
      this.qTimerColor = '#4caf50';
      if (this.level > this.maxDifficulty) this.maxDifficulty = this.level;
      this.playPrompt();
    },
    playPrompt() {
      try {
        const dir = this.lang === 'en' ? 'english' : 'chinese';
        const src = resolveVoice(`/voice/${dir}/1.mp3`);
        let audio = this.promptAudio;
        if (!audio) {
          audio = new Audio(src);
          audio.preload = 'auto';
          this.promptAudio = audio;
        }
        // If language changed since priming, swap src.
        if (!audio.src.endsWith(src)) {
          audio.src = src;
        }
        audio.muted = false;
        audio.volume = 1;
        const start = () => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {}
          const p = audio.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        };
        // Wait until the audio is buffered enough so the first sample
        // isn't dropped on tablet browsers.
        if (this.audioReady && audio.readyState >= 3) {
          start();
        } else {
          const onReady = () => {
            audio.removeEventListener('canplaythrough', onReady);
            this.audioReady = true;
            start();
          };
          audio.addEventListener('canplaythrough', onReady, { once: true });
          // Safety net in case the event never fires.
          setTimeout(() => {
            if (!this.audioReady) {
              audio.removeEventListener('canplaythrough', onReady);
              this.audioReady = true;
              start();
            }
          }, 400);
        }
      } catch (e) {
        // ignore playback errors (autoplay policy, missing file, etc.)
      }
    },
    tickMain() {
      if (this.paused) return
      this.timeLeft--;
      const elapsedInWin = (Date.now() - this.windowStart) / 1000;
      if (elapsedInWin >= 60) this.adjustDifficulty();
      if (this.timeLeft <= 0) this.endGame();
    },
    tickQ() {
      if (this.paused) {
        this.qFrame = requestAnimationFrame(this.tickQ);
        return;
      }
      if (this.answered) {
        this.qFrame = requestAnimationFrame(this.tickQ);
        return;
      }
      const elapsed = Date.now() - this.qTimerStart;
      const pct = Math.max(0, 100 - (elapsed / this.qTimerMs) * 100);
      this.qTimerPct = pct;
      if (pct > 60) this.qTimerColor = '#4caf50';
      else if (pct > 30) this.qTimerColor = '#ff9800';
      else this.qTimerColor = '#f44336';
      if (elapsed >= this.qTimerMs) this.timeoutAnswer();
      this.qFrame = requestAnimationFrame(this.tickQ);
    },
    pickAnswer(opt) {
      if (this.answered) return;
      this.answered = true;
      this.pickedOption = opt;
      const reactionMs = Date.now() - this.qTimerStart;
      this.reactionTimes.push(reactionMs);
      const correct = opt === this.question.answer;
      this.totalCount++;
      this.windowTotal++;
      if (correct) {
        const cfg = DIFFICULTY_CONFIG[this.level];
        const gained = Math.round(5 * cfg.coef);
        this.score += gained;
        this.correctCount++;
        this.windowCorrect++;
        this.showFeedback('correct', '✓', this.t('correct') + ' +' + gained);
      } else {
        this.wrongCount++;
        this.showFeedback('wrong', '✗', this.t('wrong'));
      }
      setTimeout(() => {
        if (this.timeLeft > 0) this.startNextQuestion();
      }, 900);
    },
    timeoutAnswer() {
      if (this.answered) return;
      this.answered = true;
      this.reactionTimes.push(this.qTimerMs);
      this.totalCount++;
      this.wrongCount++;
      this.windowTotal++;
      this.showFeedback('wrong', '✗', this.t('timeUp'));
      setTimeout(() => {
        if (this.timeLeft > 0) this.startNextQuestion();
      }, 900);
    },
    showFeedback(kind, icon, text) {
      this.feedback = { kind, icon, text };
    },
    adjustDifficulty() {
      if (this.windowTotal > 0) {
        const rate = this.windowCorrect / this.windowTotal;
        if (rate >= 0.9 && this.level < MAX_LEVEL) this.level++;
        else if (rate < 0.7 && this.level > MIN_LEVEL) this.level--;
      }
      this.windowStart = Date.now();
      this.windowCorrect = 0;
      this.windowTotal = 0;
    },
    optClass(opt) {
      if (!this.answered) return '';
      if (opt === this.question.answer) return 'correct';
      if (opt === this.pickedOption) return 'wrong';
      return 'faded';
    },
    formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    },
    onSkipClick() {
      skipPbBatchGame();
    },
    handleExit() {
      this.paused = true;
      this.pauseStartTime = Date.now();
      this.showExitConfirm = true;
    },
    cancelExit() {
      this.showExitConfirm = false;
      if (this.paused) {
        const delta = Date.now() - this.pauseStartTime;
        if (this.qTimerStart) this.qTimerStart += delta;
        if (this.windowStart) this.windowStart += delta;
      }
      this.paused = false;
    },
    confirmExit() {
      this.cleanup();
      leavePbGameWindow({ confirm: false });
    },
    endGame() {
      this.cleanup();
      this.$emit('end', this.buildResult(false));
    },
    buildResult(aborted) {
      const avgMs = this.reactionTimes.length
        ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
        : 0;
      return {
        aborted,
        totalCount: this.totalCount,
        correctCount: this.correctCount,
        wrongCount: this.wrongCount,
        score: this.score,
        maxDifficulty: this.level, // 与 HUD 当前难度一致（供上传）
        avgReactionTime: +(avgMs / 1000).toFixed(2),
        durationPlayed: this.durationSec - this.timeLeft,
        durationSet: this.durationSec,
      };
    },
  },
};
</script>

<style scoped>
.game-page {
  width: 100%; height: 100%;
  position: relative;
  overflow: hidden;
  background: #cfe9fb;
}
.bg-layer {
  position: absolute; inset: 0;
  background-image: url(~@/views/game/newG13/public/images/bac.png);
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* HUD — game19-style larger sizing */
.hud {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 2vmin 3vmin;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2vmin;
  z-index: 5;
}
.hud-left { display: flex; gap: 1.5vmin; flex-wrap: wrap; }
.hud-item {
  background: rgba(255,255,255,0.92);
  padding: 1.2vmin 2vmin;
  border-radius: 1.5vmin;
  border: 0.3vmin solid rgba(255,140,26,0.5);
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
  align-items: center;
  gap: 0.3vmin;
  min-width: 12vmin;
}
.hud-label { font-size: 1.5vmin; color: #888; letter-spacing: 0.1vmin; font-weight: 700; }
.hud-value { font-size: 2.8vmin; font-weight: 900; color: #ff8c1a; }
.level-badge { color: #f44336; }
.time-urgent { color: #f44336 !important; animation: blink 0.6s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }

.hud-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1vmin;
}
.task-msg {
  font-size: 2.3vmin;
  color: #ff8c1a;
  font-weight: 800;
  background: rgba(255,255,255,0.95);
  padding: 1.4vmin 2.5vmin;
  border-radius: 1.5vmin;
  border: 0.3vmin solid rgba(255,140,26,0.4);
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.15);
  max-width: 50vw;
  text-align: center;
  line-height: 1.4;
}

.back-btn {
  padding: 1.2vmin 2vmin;
  font-size: 1.8vmin;
  font-weight: 800;
  background: rgba(255,255,255,0.92);
  border: 0.3vmin solid #f44336;
  color: #f44336;
  border-radius: 1.5vmin;
  cursor: pointer;
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.15);
  transition: transform 0.15s;
}
.back-btn:hover { transform: translateY(-0.3vmin); }

.hud-right { display: flex; gap: 1.2vmin; align-items: center; }
.skip-btn {
  padding: 1.2vmin 2vmin;
  font-size: 1.8vmin;
  font-weight: 800;
  background: rgba(255,255,255,0.92);
  border: 0.3vmin solid #999;
  color: #666;
  border-radius: 1.5vmin;
  cursor: pointer;
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.15);
  transition: transform 0.15s;
}
.skip-btn:hover { transform: translateY(-0.3vmin); }

/* Question timer bar under HUD */
.q-timer-wrap {
  position: absolute;
  top: 12vh;
  left: 20vw; right: 20vw;
  height: 1.2vh;
  min-height: 8px;
  background: rgba(255,255,255,0.7);
  border-radius: 999px;
  overflow: hidden;
  z-index: 4;
  box-shadow: 0 0.3vmin 0.8vmin rgba(0,0,0,0.15);
}
.q-timer-bar { height: 100%; transition: width 0.1s linear, background 0.2s; }

/* Price list on the left */
.price-panel {
  position: absolute;
  top: 22vh;
  left: 3vw;
  z-index: 4;
  background: rgba(255,255,255,0.95);
  border: 0.4vmin solid #ff8c1a;
  border-radius: 2vmin;
  padding: 2.5vmin 3vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.2);
  min-width: 32vmin;
}
.price-title {
  font-size: 3.2vmin;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  padding: 1vmin 2vmin;
  border-radius: 999px;
  text-align: center;
  margin-bottom: 2vmin;
  box-shadow: 0 0.4vmin 1vmin rgba(255,140,26,0.4);
  letter-spacing: 0.2vmin;
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 0.6vmin;
  font-size: 3vmin;
  color: #333;
  padding: 1vmin 0;
  border-bottom: 0.2vmin dashed rgba(255,140,26,0.35);
  font-weight: 800;
}
.price-row:last-child { border-bottom: none; }
.price-type { color: #444; min-width: 7vmin; }
.price-sep { color: #999; margin: 0 0.3vmin; }
.price-num { color: #ff8c1a; font-weight: 900; font-size: 3.6vmin; }
.price-unit { color: #666; font-size: 2.2vmin; font-weight: 700; }

/* Character area — characters "stand" with feet ~83% from top (bottom of red box),
   heads extend upward. Portrait images shown at natural aspect (no circular crop). */
.character-area {
  position: absolute;
  left: 42vmin;
  right: 5%;
  bottom: 16vh;
  top: 22vh;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4vmin;
  flex-wrap: nowrap;
  pointer-events: none;
}
.char-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vmin;
  animation: bounce-in 0.4s ease-out;
}
.char-imgs {
  display: flex;
  align-items: flex-end;
  gap: 0.4vmin;
}
.char-img {
  height: 45vh;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0.8vmin 1vmin rgba(0,0,0,0.3));
}

.options-area {
  position: absolute;
  bottom: 2vh;
  left: 3vw; right: 3vw;
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2vmin;
}
.opt-btn {
  padding: 1.6vmin 0.5vmin;
  font-size: 3.4vmin;
  font-weight: 900;
  border-radius: 1.5vmin;
  border: 0.4vmin solid #ff8c1a;
  background: rgba(255,255,255,0.95);
  color: #ff8c1a;
  cursor: pointer;
  box-shadow: 0 0.6vmin 1.5vmin rgba(0,0,0,0.2);
  transition: transform 0.1s, background 0.2s, color 0.2s;
}
.opt-btn:hover:not(:disabled) { transform: translateY(-0.5vmin); }
.opt-btn:disabled { cursor: default; }
.opt-btn.correct { background: #4caf50; color: #fff; border-color: #4caf50; }
.opt-btn.wrong { background: #f44336; color: #fff; border-color: #f44336; }
.opt-btn.faded { opacity: 0.4; }

.feedback {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: flex; flex-direction: column;
  align-items: center; gap: 1vmin;
  pointer-events: none;
}
.feedback .fb-icon {
  width: 22vmin; height: 22vmin;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14vmin;
  font-weight: 900;
  color: #fff;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,0.35);
}
.feedback.correct .fb-icon { background: #4caf50; }
.feedback.wrong .fb-icon { background: #f44336; }
.feedback .fb-text {
  background: rgba(0,0,0,0.75);
  color: #fff;
  padding: 0.8vmin 1.8vmin;
  border-radius: 999px;
  font-size: 2.6vmin;
  font-weight: 700;
}

.pop-enter-active, .pop-leave-active { transition: all 0.25s ease-out; }
.pop-enter, .pop-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }

@keyframes bounce-in {
  0% { opacity: 0; transform: translateY(30px) scale(0.7); }
  60% { opacity: 1; transform: translateY(-5px) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.confirm-mask {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.confirm-box {
  background: linear-gradient(160deg, #fff 60%, #fff6e5);
  border: 0.3vmin solid #ff8c1a;
  padding: 3.5vmin 5vmin;
  border-radius: 2vmin;
  text-align: center;
  min-width: 50vmin;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,0.4);
}
.confirm-box p {
  font-size: 2.4vmin;
  color: #333;
  margin-bottom: 2.5vmin;
  font-weight: 700;
}
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
.cbtn {
  padding: 1.2vmin 3vmin;
  border-radius: 999px;
  border: 0.3vmin solid #ff8c1a;
  background: #fff;
  color: #ff8c1a;
  font-weight: 700;
  cursor: pointer;
  font-size: 2vmin;
  min-width: 10vmin;
}
.cbtn.primary { background: linear-gradient(180deg, #ffb84d, #ff8c1a); color: #fff; }

@media (orientation: portrait) {
  .hud {
    flex-wrap: wrap;
    padding: calc(1.5vmin + env(safe-area-inset-top)) 2vmin 1.5vmin;
    gap: 1.5vmin;
  }
  .hud-left { gap: 1vmin; flex: 1 1 100%; justify-content: space-between; }
  .hud-item {
    padding: 1.2vmin 1.4vmin;
    border-radius: 2vmin;
    min-width: 0;
    flex: 1;
  }
  .hud-label { font-size: max(2.6vmin, 12px); }
  .hud-value { font-size: max(4.2vmin, 18px); }
  .hud-center { flex: 1 1 60%; order: 3; padding: 0; }
  .task-msg {
    font-size: max(3.4vmin, 15px);
    padding: 1.6vmin 2vmin;
    max-width: 100%;
    border-radius: 2vmin;
  }
  .hud-right { order: 2; gap: 1.5vmin; }
  .skip-btn, .back-btn {
    font-size: max(3vmin, 14px);
    padding: 1.6vmin 2.6vmin;
    border-radius: 2vmin;
  }

  .q-timer-wrap {
    top: auto;
    left: 4vw; right: 4vw;
    /* Push below the wrapped HUD */
    top: calc(24vh + env(safe-area-inset-top));
    height: 1.4vh;
  }

  /* Stack price panel + characters vertically */
  .price-panel {
    top: calc(28vh + env(safe-area-inset-top));
    left: 4vw;
    right: 4vw;
    min-width: 0;
    padding: 2.5vmin 3vmin;
  }
  .price-title { font-size: max(4.2vmin, 18px); }
  .price-row { font-size: max(4vmin, 16px); padding: 1.2vmin 0; }
  .price-num { font-size: max(5vmin, 20px); }
  .price-unit { font-size: max(3vmin, 13px); }
  .price-type { min-width: 12vmin; }

  .character-area {
    left: 4vw;
    right: 4vw;
    top: auto;
    bottom: calc(20vh + env(safe-area-inset-bottom));
    height: 25vh;
    gap: 2vmin;
  }
  .char-img { height: 22vh; }

  .options-area {
    grid-template-columns: repeat(2, 1fr);
    gap: 2vmin;
    left: 4vw; right: 4vw;
    bottom: calc(2vh + env(safe-area-inset-bottom));
  }
  .opt-btn {
    padding: 2.4vmin 0.5vmin;
    font-size: max(5vmin, 20px);
    border-radius: 2vmin;
  }

  .feedback .fb-icon { width: 30vmin; height: 30vmin; font-size: 18vmin; }
  .feedback .fb-text { font-size: max(3.6vmin, 15px); }

  .confirm-box {
    min-width: 0;
    width: 90vw;
    padding: 4vmin 4vmin;
    border-radius: 3vmin;
  }
  .confirm-box p { font-size: max(4vmin, 16px); }
  .cbtn {
    font-size: max(3.6vmin, 15px);
    padding: 1.8vmin 3.5vmin;
    min-width: 22vmin;
  }
}
</style>
