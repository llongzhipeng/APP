<template>
  <div class="overlay tut-overlay" @click.self="$emit('skip')">
    <div class="modal card tut-modal">
      <div class="tut-head">
        <h2>{{ t('tutorialTitle') }}</h2>
        <div class="steps">
          <span v-for="i in 4" :key="i"
                class="step-dot" :class="{active: step === i}"></span>
        </div>
      </div>

      <!-- Visual demo area（可收缩，避免挤掉底部按钮） -->
      <div class="demo">
        <div class="demo-mn left" :class="{highlight: step >= 1 && step <= 2}">
          <Metronome side="left" :bpm="60" :running="true" hintText=""
                     :glow="step === 1 || step === 2" />
          <div class="mn-tag" :class="{ on: step === 1 || step === 2 }">A · {{ leftHandLabel }}</div>
        </div>

        <div class="demo-hands">
          <div class="hand-key" :class="{ press: step === 2, dim: step > 2 }">
            <div class="key-cap">A</div>
            <div class="key-label">{{ leftHandLabel }}</div>
          </div>
          <div class="beat-arrow" :class="{'to-right': step >= 3}">
            <svg viewBox="0 0 100 40" width="100%" height="100%">
              <path d="M10 20 Q50 -10 90 20" fill="none"
                    stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 4"/>
              <path d="M83 15 L92 20 L83 25" fill="none"
                    stroke="var(--accent)" stroke-width="2"/>
            </svg>
          </div>
          <div class="hand-key" :class="{ press: step === 4, dim: step < 3 }">
            <div class="key-cap">L</div>
            <div class="key-label">{{ rightHandLabel }}</div>
          </div>
        </div>

        <div class="demo-mn right" :class="{highlight: step >= 3}">
          <Metronome side="right" :bpm="60" :running="true" hintText=""
                     :glow="step === 3 || step === 4" />
          <div class="mn-tag" :class="{ on: step === 3 || step === 4 }">L · {{ rightHandLabel }}</div>
        </div>
      </div>

      <!-- Text -->
      <div class="tut-text">
        <div class="tut-num">{{ step }} / 4</div>
        <div class="tut-title">{{ t(`tutorialStep${step}`) }}</div>
        <div class="tut-desc">{{ t(`tutorialStep${step}Desc`) }}</div>
        <div class="tut-tap">{{ t('tutorialTap') }}</div>
      </div>

      <!-- Actions：始终可见 -->
      <div class="tut-actions">
        <button class="btn btn-ghost" @click="$emit('skip')">
          {{ t('skipTutorial') }}
        </button>
        <div class="row gap-1">
          <button class="btn" :disabled="step === 1" @click="prev">
            ◀ {{ t('prev') }}
          </button>
          <button v-if="step < 4" class="btn btn-primary" @click="next">
            {{ t('next') }} ▶
          </button>
          <button v-else class="btn btn-primary" @click="$emit('done')">
            {{ t('startTrain') }} ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Metronome from '../components/Metronome.vue'
import { i18nMixin } from '../i18n.js'
export default {
  mixins: [i18nMixin],
  components: { Metronome },
  data() { return { step: 1 } }, // 当前步骤 1..4
  computed: {
    leftHandLabel() { return this.lang === 'zh' ? '左手' : 'Left' }, // 左手文案
    rightHandLabel() { return this.lang === 'zh' ? '右手' : 'Right' }, // 右手文案
  },
  methods: {
    /**
     * <summary>
     * 进入下一步教程
     * </summary>
     */
    next() { if (this.step < 4) this.step++ },
    /**
     * <summary>
     * 返回上一步教程
     * </summary>
     */
    prev() { if (this.step > 1) this.step-- },
  },
}
</script>

<style scoped>
.tut-overlay {
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
           max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
}
.tut-modal {
  width: min(92vw, 820px);
  max-height: min(92dvh, 92vh);
  display: flex;
  flex-direction: column;
  padding: clamp(0.9rem, 2vmin, 1.6rem);
  overflow: hidden;
  box-sizing: border-box;
}
.tut-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.tut-head h2 { font-size: clamp(1.15rem, 2.3vmin, 1.7rem); font-weight: 700; }
.steps { display: flex; gap: 0.4rem; }
.step-dot {
  width: clamp(8px, 1.1vmin, 12px); height: clamp(8px, 1.1vmin, 12px); border-radius: 50%;
  background: rgba(255,255,255,.2);
  transition: all .2s ease;
}
.step-dot.active {
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  transform: scale(1.3);
}

.demo {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: 0.6rem;
  align-items: center;
  flex: 1 1 auto;
  min-height: 120px;
  max-height: min(36vh, 260px);
  padding: 0.4rem 0;
  overflow: hidden;
}
.demo-mn {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: transform .3s ease;
  overflow: hidden;
}
.demo-mn >>> .metronome { max-height: calc(100% - 1.8rem); }
.demo-mn >>> .mn-chip { display: none; } /* 教程用下方 mn-tag，避免与中间按键叠字 */
.demo-mn.left  { color: var(--left); }
.demo-mn.right { color: var(--right); }
.demo-mn.highlight { transform: scale(1.03); }
.mn-tag {
  flex-shrink: 0;
  font-size: clamp(0.75rem, 1.5vmin, 1rem);
  font-weight: 700;
  color: var(--ink-dim);
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.mn-tag.on { color: currentColor; }

.demo-hands {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  height: 100%;
  justify-content: center;
  min-width: 0;
}
.hand-key {
  display: flex; align-items: center; gap: 0.5rem;
  transition: all .2s ease;
  z-index: 1;
}
.hand-key.dim { opacity: .35; }
.hand-key.press .key-cap {
  transform: translateY(3px);
  box-shadow: 0 0 0 3px var(--accent), 0 0 24px var(--accent);
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: #2a1a05;
}
.key-cap {
  width: clamp(40px, 5.5vmin, 64px); height: clamp(40px, 5.5vmin, 64px);
  border-radius: 12px;
  background: linear-gradient(180deg, #2a3564, #1a2148);
  border: 1px solid rgba(255,255,255,.25);
  box-shadow: 0 4px 0 rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: clamp(1.2rem, 2.4vmin, 1.8rem);
  transition: all .15s ease;
  flex-shrink: 0;
}
.key-label {
  color: var(--ink-mid);
  font-size: clamp(0.85rem, 1.6vmin, 1.15rem);
  white-space: nowrap;
}
.beat-arrow { width: 70%; height: 28px; opacity: .6; flex-shrink: 0; }
.beat-arrow.to-right { transform: scaleX(-1); }

.tut-text {
  text-align: center;
  padding: 0.55rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.7rem;
  flex-shrink: 0;
}
.tut-num {
  color: var(--accent);
  font-weight: 700;
  letter-spacing: .15em;
  font-size: clamp(0.75rem, 1.4vmin, 1rem);
  position: relative;
  z-index: 2;
}
.tut-title { font-size: clamp(1.1rem, 2.2vmin, 1.65rem); font-weight: 700; margin: .15em 0; }
.tut-desc { color: var(--ink-mid); font-size: clamp(0.85rem, 1.6vmin, 1.15rem); }
.tut-tap { color: var(--ink-dim); font-size: clamp(0.75rem, 1.4vmin, 1rem); margin-top: .35em; }

.tut-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.tut-actions .btn {
  padding: 0.65em 1.2em;
  font-size: clamp(0.9rem, 1.7vmin, 1.2rem);
}

/* 矮屏 / 平板横屏：进一步压缩演示区 */
@media (max-height: 700px), (max-width: 1024px) and (orientation: landscape) {
  .demo { max-height: min(30vh, 200px); min-height: 100px; }
  .key-cap { width: 40px; height: 40px; font-size: 1.2rem; }
  .tut-text { padding: 0.4rem 0; margin-bottom: 0.5rem; }
  .tut-actions .btn { padding: 0.55em 1em; }
}
</style>
