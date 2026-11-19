<template>
  <div class="tut-view">
    <div class="tut paper">
      <div class="tut-progress">
        <div v-for="(s, i) in steps" :key="i" class="dot" :class="{ active: i === step, done: i < step }"></div>
      </div>

      <h2 class="tut-title">{{ t('tutorialTitle') }}</h2>

      <div class="stage">
        <transition name="fade">
          <div v-if="step === 0" key="s1" class="s-target">
            <div class="target-word">{{ t('demoWord') }}</div>
            <div class="pointer">↑</div>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="step === 1" key="s2" class="s-prompt">
            <div class="target-word small">{{ t('demoWord') }}</div>
            <div class="prompt-box">{{ t('demoAsk') }}</div>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="step === 2" key="s3" class="s-pick">
            <div class="target-word small">{{ t('demoWord') }}</div>
            <div class="opts">
              <div class="opt tap">{{ t('demoOpt1') }}<span class="tap-ring"></span></div>
              <div class="opt">{{ t('demoOpt2') }}</div>
            </div>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="step === 3" key="s4" class="s-feedback">
            <div class="target-word small">{{ t('demoWord') }}</div>
            <div class="opts">
              <div class="opt correct">{{ t('demoOpt1') }} <span class="check">✓</span></div>
              <div class="opt">{{ t('demoOpt2') }}</div>
            </div>
            <div class="score-pop">+5</div>
          </div>
        </transition>
      </div>

      <div class="hint">{{ steps[step] }}</div>

      <div class="tut-actions">
        <button class="btn" @click="skip">{{ t('skip') }}</button>
        <div class="mid-actions">
          <button class="btn" :disabled="step === 0" @click="step--">{{ t('prev') }}</button>
          <button v-if="step < steps.length - 1" class="btn btn-primary" @click="step++">{{ t('next') }}</button>
          <button v-else class="btn btn-primary" @click="finish">{{ t('tutorialGotIt') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n.js'
export default {
  name: 'TutorialModal',
  mixins: [i18nMixin],
  data() { return { step: 0 } },
  computed: {
    steps() {
      return [
        this.t('tutorialStep1'),
        this.t('tutorialStep2'),
        this.t('tutorialStep3'),
        this.t('tutorialStep4'),
      ]
    },
  },
  methods: {
    skip()   { this.$emit('nav', { to: 'duration' }) },
    finish() { this.$emit('nav', { to: 'duration' }) },
  },
}
</script>

<style scoped>
.tut-view {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.tut {
  width: min(90vmin, 100%);
  max-height: 96%;
  padding: 4vmin 5vmin;
  display: flex; flex-direction: column; gap: 3vmin;
}
.tut-progress { display: flex; justify-content: center; gap: 1.2vmin; }
.dot {
  width: 1.4vmin; height: 1.4vmin; border-radius: 50%;
  background: #e6d6b2;
  transition: all .3s;
}
.dot.done   { background: var(--c-ok); }
.dot.active { background: var(--c-orange); transform: scale(1.4); box-shadow: 0 0 2vmin rgba(217,119,66,.5); }

.tut-title { font-size: 3.6vmin; font-weight: 700; text-align: center; color: var(--c-title); letter-spacing: 0.2vmin; }

.stage {
  position: relative;
  height: 36vmin;
  border-radius: 2vmin;
  background: var(--c-paper-soft);
  border: 0.3vmin dashed var(--c-line);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.stage > div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.5vmin; }

.target-word {
  font-size: 9vmin;
  font-weight: 700;
  color: var(--c-title);
  letter-spacing: 0.4vmin;
  animation: pop .5s cubic-bezier(.2,.9,.3,1.4);
}
.target-word.small { font-size: 5.5vmin; }
@keyframes pop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.pointer {
  font-size: 4vmin;
  color: var(--c-orange);
  animation: bounce 1s ease-in-out infinite;
}
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5vmin); } }

.prompt-box {
  padding: 1.2vmin 2.4vmin;
  background: var(--c-paper);
  border: 0.25vmin solid var(--c-orange);
  color: var(--c-orange-dim);
  border-radius: 4vmin;
  font-size: 2.6vmin;
  font-weight: 600;
  animation: pop .5s;
  box-shadow: var(--shadow-sm);
}

.opts { display: flex; gap: 2.4vmin; }
.opt {
  min-width: 14vmin;
  padding: 1.6vmin 2.6vmin;
  border-radius: 1.5vmin;
  background: var(--c-paper);
  border: 0.35vmin solid var(--c-line);
  color: #333;
  font-size: 3vmin;
  font-weight: 600;
  display: inline-flex; align-items: center; gap: 0.8vmin;
  position: relative;
  box-shadow: var(--shadow-sm);
}
.opt.tap {
  background: #fff2e0;
  border-color: var(--c-orange);
  transform: scale(1.05);
}
.tap-ring {
  position: absolute; inset: -0.8vmin;
  border: 0.3vmin solid var(--c-orange);
  border-radius: 2vmin;
  animation: ring 1.4s ease-out infinite;
}
@keyframes ring { 0% { transform: scale(.9); opacity: 1; } 100% { transform: scale(1.15); opacity: 0; } }
.opt.correct {
  background: var(--c-ok-bg);
  border-color: var(--c-ok);
  color: var(--c-ok-text);
}
.check { color: var(--c-ok-text); font-weight: 800; }
.score-pop {
  position: absolute;
  top: 22%; right: 26%;
  font-size: 4vmin;
  font-weight: 800;
  color: var(--c-ok-text);
  animation: rise 1.2s ease-out;
}
@keyframes rise { from { opacity: 0; transform: translateY(2vmin); } 40% { opacity: 1; } to { opacity: 0; transform: translateY(-4vmin); } }

.hint {
  text-align: center;
  font-size: 2.4vmin;
  color: var(--c-brown-dim);
  min-height: 1.5em;
}
.tut-actions {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5vmin; flex-wrap: wrap;
}
.mid-actions { display: flex; gap: 1.5vmin; }

.fade-enter-active, .fade-leave-active { transition: opacity .4s, transform .4s; }
.fade-enter, .fade-leave-to { opacity: 0; transform: translateY(0.6vmin); }
</style>
