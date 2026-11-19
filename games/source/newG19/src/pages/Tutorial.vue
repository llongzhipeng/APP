<template>
  <div class="tutorial-overlay">
    <div class="tutorial-card">
      <div class="tut-head">
        <div class="tut-title">{{ t('tutorialTitle') }}</div>
        <div class="tut-step">{{ t('tutorialStep', {current: step+1, total: steps.length}) }}</div>
      </div>

      <div class="tut-body">
        <div class="tut-heading">{{ t(current.titleKey) }}</div>
        <div class="tut-hint">{{ t(current.hintKey) }}</div>

        <!-- Idiom demo -->
        <div class="idiom-row">
          <div
            v-for="(ch, i) in idiomChars"
            :key="i"
            class="idiom-tile"
            :class="{
              wrong: showWrong && i === current.wrongIdx,
              correct: showCorrect && i === current.wrongIdx
            }"
          >{{ showCorrect && i === current.wrongIdx ? current.correctChar : ch }}</div>
        </div>

        <!-- Choices (for pickWrong / pickCorrect modes) -->
        <div v-if="current.mode !== 'inputCorrect'" class="choices">
          <div
            v-for="(c, i) in choices"
            :key="i"
            class="choice"
            :class="{
              highlight: highlightChoice === i,
              wrongChoice: (current.mode === 'pickWrong' && c === current.wrongChar && animPhase >= 1),
              rightChoice: (current.mode === 'pickCorrect' && c === current.correctChar && animPhase >= 1)
            }"
          >{{ c }}</div>
        </div>

        <!-- Keyboard input demo -->
        <div v-else class="input-demo">
          <div class="fake-input">
            <span class="typed">{{ typedChar }}</span>
            <span v-if="!typedChar" class="caret">|</span>
          </div>
          <div class="input-tip">{{ t('hintType') }}</div>
        </div>

        <div class="example-tag">{{ t('example') }}</div>
      </div>

      <div class="tut-foot">
        <button class="mini-btn" @click="prev" :disabled="step === 0">{{ t('prev') }}</button>
        <button class="mini-btn skip" @click="$emit('skip')">{{ t('skip') }}</button>
        <button class="mini-btn primary" @click="next">
          {{ step === steps.length - 1 ? t('startNow') : t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'

export default {
  name: 'TutorialPage',
  props: ['lang'],
  data() {
    return {
      step: 0,
      animPhase: 0,        // 0 idle, 1 highlight choice, 2 apply
      showWrong: false,    // mark wrong char in idiom
      showCorrect: false,  // replace with correct char
      highlightChoice: -1,
      typedChar: '',
      timer: null,
      steps: [
        {
          mode: 'pickWrong', titleKey: 'tut1Title', hintKey: 'hintPickWrong',
          idiomWrong: '兴高彩烈', correctChar: '采', wrongChar: '彩', wrongIdx: 2,
          choicesCount: 2
        },
        {
          mode: 'pickWrong', titleKey: 'tut2Title', hintKey: 'hintPickWrong',
          idiomWrong: '再接再励', correctChar: '厉', wrongChar: '励', wrongIdx: 3,
          choicesCount: 3
        },
        {
          mode: 'pickCorrect', titleKey: 'tut3Title', hintKey: 'hintPickCorrect',
          idiomWrong: '一喏千金', correctChar: '诺', wrongChar: '喏', wrongIdx: 1,
          choicesCount: 4
        },
        {
          mode: 'inputCorrect', titleKey: 'tut4Title', hintKey: 'hintType',
          idiomWrong: '世外桃园', correctChar: '源', wrongChar: '园', wrongIdx: 3,
          choicesCount: 0
        }
      ]
    }
  },
  computed: {
    current() { return this.steps[this.step] },
    idiomChars() { return this.current.idiomWrong.split('') },
    choices() {
      const s = this.current
      if (s.mode === 'pickWrong') {
        // include wrong char + distractors from idiom
        const others = s.idiomWrong.split('').filter(c => c !== s.wrongChar)
        const pool = [s.wrongChar, ...others]
        return pool.slice(0, s.choicesCount)
      } else if (s.mode === 'pickCorrect') {
        const distractors = ['喏', '话', '若']
        const opts = [s.correctChar, ...distractors].slice(0, s.choicesCount)
        return opts
      }
      return []
    }
  },
  methods: {
    t(k, p) { return t(this.lang, k, p) },
    resetAnim() {
      this.animPhase = 0
      this.showWrong = false
      this.showCorrect = false
      this.highlightChoice = -1
      this.typedChar = ''
    },
    startAnim() {
      this.resetAnim()
      const s = this.current
      // demo animation
      if (s.mode === 'inputCorrect') {
        this.timer = setTimeout(() => {
          this.showWrong = true
          this.timer = setTimeout(() => {
            this.typedChar = s.correctChar
            this.timer = setTimeout(() => {
              this.showCorrect = true
              this.scheduleLoop()
            }, 700)
          }, 900)
        }, 500)
        return
      }
      // pickWrong / pickCorrect
      const targetChar = s.mode === 'pickWrong' ? s.wrongChar : s.correctChar
      const idx = this.choices.indexOf(targetChar)
      this.timer = setTimeout(() => {
        this.showWrong = true
        this.timer = setTimeout(() => {
          this.highlightChoice = idx
          this.animPhase = 1
          this.timer = setTimeout(() => {
            if (s.mode === 'pickCorrect') this.showCorrect = true
            this.scheduleLoop()
          }, 700)
        }, 900)
      }, 500)
    },
    scheduleLoop() {
      this.timer = setTimeout(() => this.startAnim(), 2200)
    },
    next() {
      if (this.step === this.steps.length - 1) {
        this.$emit('done')
      } else {
        this.step++
      }
    },
    prev() {
      if (this.step > 0) this.step--
    }
  },
  watch: {
    step() {
      clearTimeout(this.timer)
      this.startAnim()
    }
  },
  mounted() { this.startAnim() },
  beforeDestroy() { clearTimeout(this.timer) }
}
</script>

<style scoped>
.tutorial-overlay {
  position: absolute; inset: 0;
  background: rgba(30, 20, 10, 0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.tutorial-card {
  width: 78vmin; max-height: 90vmin;
  background: #fdf9f0;
  border-radius: 3vmin;
  border: 0.3vmin solid #b08b4f;
  padding: 4vmin;
  display: flex; flex-direction: column;
  box-shadow: 0 2vmin 5vmin rgba(0,0,0,.3);
}
.tut-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 3vmin;
}
.tut-title { font-size: 3.2vmin; font-weight: 700; color: #7a3a1e; }
.tut-step { font-size: 2vmin; color: #8a6a3a; }
.tut-body {
  flex: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: 2vmin;
  padding: 2vmin 0;
  position: relative;
}
.tut-heading { font-size: 3vmin; font-weight: 600; color: #7a3a1e; }
.tut-hint { font-size: 2.3vmin; color: #666; }
.idiom-row { display: flex; gap: 1.5vmin; margin: 2vmin 0; }
.idiom-tile {
  width: 11vmin; height: 11vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 1.5vmin;
  font-size: 6vmin; font-weight: 700;
  color: #333;
  transition: all .4s;
}
.idiom-tile.wrong {
  background: #ffe8e0;
  border-color: #d55;
  color: #c22;
  transform: translateY(-0.5vmin);
  box-shadow: 0 0.8vmin 1.6vmin rgba(220,60,40,.25);
}
.idiom-tile.correct {
  background: #e0f5df;
  border-color: #58a058;
  color: #2b7a2b;
}
.choices { display: flex; gap: 2vmin; margin-top: 1vmin; flex-wrap: wrap; justify-content: center; }
.choice {
  width: 9vmin; height: 9vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 1.2vmin;
  font-size: 4.5vmin; font-weight: 700;
  color: #333;
  transition: all .3s;
}
.choice.highlight {
  transform: scale(1.1);
  box-shadow: 0 0 0 0.5vmin rgba(255,180,60,.6);
}
.choice.wrongChoice { background: #ffe8e0; border-color: #d55; color: #c22; }
.choice.rightChoice { background: #e0f5df; border-color: #58a058; color: #2b7a2b; }
.input-demo { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; margin-top: 1vmin; }
.fake-input {
  width: 18vmin; height: 8vmin;
  background: #fff;
  border: 0.3vmin solid #b08b4f;
  border-radius: 1vmin;
  display: flex; align-items: center; justify-content: center;
  font-size: 5vmin; font-weight: 700;
  color: #2b7a2b;
}
.caret { color: #999; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }
.input-tip { font-size: 2vmin; color: #888; }
.example-tag {
  position: absolute; top: 0; right: 0;
  background: #b08b4f; color: #fff;
  padding: 0.5vmin 1.5vmin;
  border-radius: 1vmin;
  font-size: 1.8vmin;
}
.tut-foot { display: flex; justify-content: space-between; margin-top: 2vmin; gap: 1.5vmin; }
.mini-btn {
  flex: 1;
  padding: 1.6vmin 2vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  border-radius: 1.2vmin;
  color: #7a5a2c;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
}
.mini-btn:hover:not(:disabled) { background: #fff8ec; }
.mini-btn:disabled { opacity: .4; cursor: not-allowed; }
.mini-btn.skip { color: #888; border-color: #ccc; }
.mini-btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }
.mini-btn.primary:hover { background: linear-gradient(135deg, #e28855, #bd5a24); }

@media (orientation: portrait) {
  .tutorial-card {
    width: 92vw;
    max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 6vmin);
    padding: 5vmin 4vmin calc(4vmin + env(safe-area-inset-bottom));
    margin-top: env(safe-area-inset-top);
    border-radius: 4vmin;
    border-width: 0.5vmin;
  }
  .tut-title { font-size: max(5vmin, 18px); }
  .tut-step { font-size: max(3.4vmin, 12px); }
  .tut-heading { font-size: max(4.6vmin, 17px); }
  .tut-hint { font-size: max(3.8vmin, 14px); }
  .idiom-row { gap: 2vmin; }
  .idiom-tile {
    width: min(18vw, 16vmin);
    height: min(18vw, 16vmin);
    font-size: max(9vw, 32px);
    border-radius: 2vmin;
    border-width: 0.5vmin;
  }
  .choices { gap: 3vmin; }
  .choice {
    width: min(15vw, 14vmin);
    height: min(15vw, 14vmin);
    font-size: max(7vw, 26px);
    border-radius: 2vmin;
    border-width: 0.5vmin;
  }
  .fake-input {
    width: 30vw; height: 14vw;
    font-size: max(8vw, 28px);
    border-radius: 2vmin;
    border-width: 0.5vmin;
  }
  .input-tip { font-size: max(3.4vmin, 13px); }
  .example-tag { font-size: max(3vmin, 11px); padding: 1vmin 2.5vmin; border-radius: 1.5vmin; }
  .tut-foot { gap: 2vmin; margin-top: 3vmin; }
  .mini-btn {
    padding: 2.4vmin 2vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 2vmin;
    border-width: 0.4vmin;
  }
}
</style>
