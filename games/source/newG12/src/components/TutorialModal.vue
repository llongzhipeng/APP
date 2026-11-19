<template>
  <div class="modal-backdrop">
    <div class="modal">
      <button class="skip-btn" @click="$emit('skip')">{{ t('skip') }}</button>

      <div class="stage">
        <!-- Step 1: Watch the face -->
        <div v-if="step === 0" class="stage-inner">
          <div class="stage-hint">{{ t('tutorialStep1') }}</div>
          <div class="face-box">
            <img :src="resolveImage(`/images/happy/1.png`)" class="face-img" />
          </div>
          <div class="timer-bar">
            <div class="timer-fill anim1"></div>
          </div>
        </div>

        <!-- Step 2: Face hidden -->
        <div v-else-if="step === 1" class="stage-inner">
          <div class="stage-hint">{{ t('tutorialStep2') }}</div>
          <div class="face-box">
            <div class="face-hidden">?</div>
          </div>
        </div>

        <!-- Step 3: Options -->
        <div v-else-if="step === 2" class="stage-inner">
          <div class="stage-hint">{{ t('tutorialStep3') }}</div>
          <div class="prompt-line">{{ t('promptRecall') }}</div>
          <div class="options-demo">
            <button v-for="e in demoOptions" :key="e.key"
              class="opt-btn"
              :class="{ demoCorrect: e.key === 'happy' }">
              {{ e[lang] }}
            </button>
          </div>
        </div>

        <!-- Step 4: Correct feedback -->
        <div v-else-if="step === 3" class="stage-inner">
          <div class="stage-hint">{{ t('tutorialStep4') }}</div>
          <div class="feedback-badge">+5</div>
          <div class="options-demo">
            <button v-for="e in demoOptions" :key="e.key"
              class="opt-btn"
              :class="{ correctShow: e.key === 'happy' }">
              {{ e[lang] }}
            </button>
          </div>
        </div>

        <!-- Step 5: Two faces -->
        <div v-else class="stage-inner">
          <div class="stage-hint">{{ t('tutorialStep5') }}</div>
          <div class="prompt-line">{{ t('promptRecallLeft') }}</div>
          <div class="two-faces">
            <div class="face-box small">
              <img :src="resolveImage(`/images/Anger/1.png`)" class="face-img" />
              <div class="side-label left-label">{{ t('left') }}</div>
            </div>
            <div class="face-box small">
              <img :src="resolveImage(`/images/Sadness/1.png`)" class="face-img" />
              <div class="side-label right-label">{{ t('right') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="dots">
        <span v-for="i in totalSteps" :key="i"
          class="dot" :class="{ active: i - 1 === step }"></span>
      </div>

      <div class="controls">
        <button class="ctrl-btn" @click="prev" :disabled="step === 0">{{ t('prev') }}</button>
        <button v-if="step < totalSteps - 1" class="ctrl-btn primary" @click="next">{{ t('next') }}</button>
        <button v-else class="ctrl-btn primary" @click="$emit('done')">{{ t('startNow') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
import { t, i18n } from '../i18n.js'
import { EMOTIONS } from '../gameConfig.js'

export default {
  name: 'TutorialModal',
  data() {
    return {
      step: 0,
      totalSteps: 5,
      demoOptions: EMOTIONS
    }
  },
  computed: {
    lang() { return i18n.lang }
  },
  methods: { resolveImage,
    t,
    prev() { if (this.step > 0) this.step-- },
    next() { if (this.step < this.totalSteps - 1) this.step++ }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  width: min(85vmin, 92vw);
  height: min(80vmin, 90vh);
  background: white;
  border-radius: 3vmin;
  padding: 4vmin;
  display: flex; flex-direction: column; gap: 2vmin;
  position: relative;
}
.skip-btn {
  position: absolute;
  top: 2vmin;
  right: 2vmin;
  padding: 1vmin 2.5vmin;
  border-radius: 3vmin;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  cursor: pointer;
  font-size: 2.1vmin;
}
.skip-btn:hover { background: #e2e8f0; }

.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stage-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  width: 100%;
}
.stage-hint {
  font-size: 2.6vmin;
  color: #4f46e5;
  font-weight: 600;
  text-align: center;
  padding: 0 2vmin;
}
.prompt-line {
  font-size: 2.4vmin;
  color: #334155;
}
.face-box {
  width: 28vmin;
  height: 28vmin;
  border-radius: 3vmin;
  background: #f8fafc;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,0.08);
  position: relative;
}
.face-box.small { width: 20vmin; height: 20vmin; }
.face-img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.face-hidden {
  font-size: 12vmin;
  color: #cbd5e1;
  font-weight: bold;
}
.timer-bar {
  width: 28vmin;
  height: 1vmin;
  background: #e2e8f0;
  border-radius: 0.5vmin;
  overflow: hidden;
}
.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  width: 100%;
  transform-origin: left;
}
.anim1 {
  animation: shrink 3s linear infinite;
}
@keyframes shrink {
  0% { transform: scaleX(1); }
  100% { transform: scaleX(0); }
}

.options-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 2vmin;
  justify-content: center;
  max-width: 80vmin;
}
.opt-btn {
  padding: 2vmin 3.5vmin;
  border-radius: 3vmin;
  border: 0.3vmin solid #e2e8f0;
  background: white;
  font-size: 2.4vmin;
  cursor: default;
  color: #334155;
  min-width: 15vmin;
}
.opt-btn.demoCorrect {
  animation: hoverGlow 1.5s ease-in-out infinite;
  border-color: #10b981;
  color: #10b981;
  font-weight: 600;
}
.opt-btn.correctShow {
  border-color: #10b981;
  background: #d1fae5;
  color: #065f46;
  font-weight: 600;
}
@keyframes hoverGlow {
  0%, 100% { transform: translateY(0); box-shadow: 0 0 0 rgba(16,185,129,0); }
  50% { transform: translateY(-1vmin); box-shadow: 0 1vmin 2vmin rgba(16,185,129,0.4); }
}
.feedback-badge {
  font-size: 6vmin;
  color: #10b981;
  font-weight: bold;
  animation: pop 0.6s ease-out;
}
@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.two-faces {
  display: flex;
  gap: 4vmin;
}
.side-label {
  position: absolute;
  top: -0.5vmin;
  padding: 0.6vmin 1.5vmin;
  border-radius: 1.5vmin;
  font-size: 1.8vmin;
  color: white;
  font-weight: 600;
}
.left-label { left: 1vmin; background: #6366f1; }
.right-label { right: 1vmin; background: #94a3b8; }

.dots {
  display: flex;
  gap: 1.2vmin;
  justify-content: center;
}
.dot {
  width: 1.4vmin;
  height: 1.4vmin;
  border-radius: 50%;
  background: #cbd5e1;
  transition: background 0.2s, transform 0.2s;
}
.dot.active {
  background: #6366f1;
  transform: scale(1.3);
}

.controls {
  display: flex;
  gap: 2vmin;
  justify-content: center;
}
.ctrl-btn {
  padding: 1.4vmin 4vmin;
  border-radius: 3vmin;
  border: 0.25vmin solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 2.4vmin;
  cursor: pointer;
  min-width: 18vmin;
}
.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ctrl-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border-color: transparent;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .modal {
    width: 94vw;
    height: min(90vh, 130vw);
    padding: 5vmin 4vmin calc(4vmin + env(safe-area-inset-bottom));
    padding-top: calc(6vmin + env(safe-area-inset-top));
    border-radius: 4vmin;
    gap: 3vmin;
  }
  .skip-btn {
    top: calc(2vmin + env(safe-area-inset-top));
    right: 3vmin;
    padding: 1.6vmin 3.5vmin;
    font-size: max(3.2vmin, 13px);
    border-radius: 3vmin;
  }
  .stage-hint { font-size: max(4vmin, 16px); }
  .prompt-line { font-size: max(3.6vmin, 15px); }
  .face-box { width: 45vmin; height: 45vmin; border-radius: 4vmin; }
  .face-box.small { width: 32vmin; height: 32vmin; }
  .face-hidden { font-size: 20vmin; }
  .timer-bar { width: 45vmin; height: 1.6vmin; }
  .options-demo { gap: 2.5vmin; max-width: 92vw; }
  .opt-btn {
    flex: 1 1 40%;
    min-width: 38vw;
    padding: 3vmin 4vmin;
    font-size: max(3.6vmin, 15px);
    border-radius: 4vmin;
  }
  .feedback-badge { font-size: max(9vmin, 36px); }
  .two-faces { gap: 3vmin; }
  .side-label { font-size: max(2.6vmin, 12px); padding: 1vmin 2vmin; }
  .dot { width: 2.2vmin; height: 2.2vmin; }
  .controls { gap: 3vmin; flex-wrap: wrap; }
  .ctrl-btn {
    flex: 1 1 40%;
    min-width: 36vw;
    padding: 2.4vmin 5vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 4vmin;
  }
}
</style>
