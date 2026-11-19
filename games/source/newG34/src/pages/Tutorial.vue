<template>
  <div class="tutorial-overlay">
    <div class="tutorial-card">
      <div class="tut-head">
        <div class="tut-title">{{ t('tutorialTitle') }}</div>
        <div class="tut-step">{{ t('tutorialStep', { current: step + 1, total: steps.length }) }}</div>
      </div>

      <div class="tut-body">
        <div class="tut-heading">{{ t(current.titleKey) }}</div>
        <div class="tut-hint">{{ t(current.hintKey) }}</div>

        <!-- Demo scene -->
        <div class="demo-scene">
          <img class="demo-img" :src="demoImage" alt="idiom" />
          <div class="example-tag">{{ t('example') }}</div>
        </div>

        <!-- Options (steps 0..2 show options; step 3 shows input demo) -->
        <div v-if="step < 3" class="choices">
          <div
            v-for="(opt, i) in choices"
            :key="i"
            class="choice"
            :class="{
              picked: animPhase >= 1 && opt === answer,
              right: animPhase >= 2 && opt === answer,
            }"
          >{{ opt }}</div>
        </div>
        <div v-else class="input-demo">
          <div class="fake-input">
            <span class="typed">{{ typedText }}</span>
            <span v-if="typedText.length < answer.length" class="caret">|</span>
          </div>
        </div>
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
import { t } from '../data/i18n.js';
import { POOLS } from '../data/idioms.js';

export default {
  name: 'TutorialPage',
  props: ['lang'],
  data() {
    return {
      step: 0,
      // step 0 -> answer=简单示例, step 1 -> also simple, step 2 -> abstract, step 3 -> abstract (input)
      steps: [
        { titleKey: 'tut1Title', hintKey: 'tut1Hint', pool: 'simple',   idx: 0, options: 2 },
        { titleKey: 'tut2Title', hintKey: 'tut2Hint', pool: 'simple',   idx: 4, options: 3 },
        { titleKey: 'tut3Title', hintKey: 'tut3Hint', pool: 'medium',   idx: 0, options: 4 },
        { titleKey: 'tut4Title', hintKey: 'tut4Hint', pool: 'abstract', idx: 1, options: 0 },
      ],
      animPhase: 0, // 0 idle -> 1 pick -> 2 reveal
      typedText: '',
      timer: null,
    };
  },
  computed: {
    current() { return this.steps[this.step]; },
    poolItem() { return POOLS[this.current.pool][this.current.idx]; },
    demoImage() { return this.poolItem.image; },
    answer() { return this.poolItem.answer; },
    choices() {
      const s = this.current;
      if (s.options === 0) return [];
      const pool = POOLS[s.pool];
      const others = pool.filter((p) => p.answer !== this.answer).slice(0, s.options - 1).map((p) => p.answer);
      // deterministic ordering so animation is stable
      return [this.answer, ...others];
    },
  },
  methods: {
    t(k, p) { return t(this.lang, k, p); },
    resetAnim() { this.animPhase = 0; this.typedText = ''; },
    startAnim() {
      this.resetAnim();
      if (this.step < 3) {
        this.timer = setTimeout(() => {
          this.animPhase = 1;
          this.timer = setTimeout(() => {
            this.animPhase = 2;
            this.scheduleLoop();
          }, 700);
        }, 700);
      } else {
        // typing demo
        let i = 0;
        const typeNext = () => {
          if (i <= this.answer.length) {
            this.typedText = this.answer.slice(0, i);
            i++;
            this.timer = setTimeout(typeNext, 380);
          } else {
            this.scheduleLoop();
          }
        };
        this.timer = setTimeout(typeNext, 500);
      }
    },
    scheduleLoop() { this.timer = setTimeout(() => this.startAnim(), 1800); },
    next() {
      if (this.step === this.steps.length - 1) this.$emit('done');
      else this.step++;
    },
    prev() { if (this.step > 0) this.step--; },
  },
  watch: {
    step() { clearTimeout(this.timer); this.startAnim(); },
  },
  mounted() { this.startAnim(); },
  beforeDestroy() { clearTimeout(this.timer); },
};
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
  padding: 1vmin 0;
}
.tut-heading { font-size: 3vmin; font-weight: 600; color: #7a3a1e; }
.tut-hint { font-size: 2.2vmin; color: #666; text-align: center; padding: 0 2vmin; }

.demo-scene {
  position: relative;
  width: 48vmin; height: 28vmin;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 2vmin;
  overflow: hidden;
  box-shadow: 0 0.6vmin 1.6vmin rgba(122,90,44,.15);
}
.demo-img { width: 100%; height: 100%; object-fit: contain; padding: 1vmin; }
.example-tag {
  position: absolute; top: 1vmin; right: 1vmin;
  background: #b08b4f; color: #fff;
  padding: 0.5vmin 1.5vmin;
  border-radius: 1vmin;
  font-size: 1.8vmin;
}

.choices { display: flex; gap: 1.5vmin; flex-wrap: wrap; justify-content: center; }
.choice {
  padding: 1.4vmin 2.4vmin;
  min-width: 14vmin;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 1.4vmin;
  font-size: 2.6vmin; font-weight: 700;
  color: #333;
  letter-spacing: 0.2vmin;
  transition: all .3s;
}
.choice.picked { transform: scale(1.05); box-shadow: 0 0 0 0.5vmin rgba(255,180,60,.6); }
.choice.right { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; }

.input-demo { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; }
.fake-input {
  min-width: 26vmin; height: 8vmin; padding: 0 2vmin;
  background: #fff;
  border: 0.3vmin solid #b08b4f;
  border-radius: 1.4vmin;
  display: flex; align-items: center; justify-content: center;
  font-size: 3.6vmin; font-weight: 700;
  color: #2b7a2b;
  letter-spacing: 0.3vmin;
}
.caret { color: #999; animation: blink 1s infinite; margin-left: 0.2vmin; }
@keyframes blink { 50% { opacity: 0; } }

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
</style>
