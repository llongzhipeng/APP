<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <!-- Step indicators -->
      <div class="step-dots">
        <span
          v-for="i in 4" :key="i"
          class="dot"
          :class="{ active: step === i - 1 }"
        ></span>
      </div>

      <!-- Step 1: Reference shape spotlight -->
      <div v-if="step === 0" class="step-content">
        <div class="demo-board">
          <div class="demo-left">
            <div class="demo-ref-area" :class="{ highlight: hlRef }">
              <div class="demo-label-tag ref-tag">
                <svg width="1.4em" height="1.4em" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FF7043" stroke-width="2.5"/><path d="M12 8v4l3 3" stroke="#FF7043" stroke-width="2.5" stroke-linecap="round"/></svg>
              </div>
              <div class="shape-area">
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <circle cx="100" cy="100" r="55" fill="#FF7043" stroke="#E64A19" stroke-width="3"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="demo-divider"></div>
          <div class="demo-right">
            <div class="demo-opts-empty">
              <div v-for="i in 4" :key="i" class="opt-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="step-hint">
          <span class="hint-icon">👁️</span>
        </div>
      </div>

      <!-- Step 2: Options appear -->
      <div v-if="step === 1" class="step-content">
        <div class="demo-board">
          <div class="demo-left">
            <div class="demo-ref-area">
              <div class="shape-area">
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <circle cx="100" cy="100" r="55" fill="#FF7043" stroke="#E64A19" stroke-width="3"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="demo-divider"></div>
          <div class="demo-right">
            <div class="demo-opts">
              <div
                v-for="(opt, i) in demoOpts"
                :key="i"
                class="demo-opt-cell"
                :class="{ 'opt-visible': optVisible >= i + 1 }"
              >
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <g :transform="`rotate(${opt.rot}, 100, 100)`">
                    <circle :cx="100" :cy="100" :r="opt.r" fill="#5C6BC0" stroke="#3949AB" stroke-width="3"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="step-hint">
          <span class="hint-icon">🔍</span>
        </div>
      </div>

      <!-- Step 3: Select the correct one -->
      <div v-if="step === 2" class="step-content">
        <div class="demo-board">
          <div class="demo-left">
            <div class="demo-ref-area">
              <div class="shape-area">
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <circle cx="100" cy="100" r="55" fill="#FF7043" stroke="#E64A19" stroke-width="3"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="demo-divider"></div>
          <div class="demo-right">
            <div class="demo-opts">
              <div
                v-for="(opt, i) in demoOpts"
                :key="i"
                class="demo-opt-cell opt-visible"
                :class="{
                  'opt-correct': clickPhase >= 2 && i === 1,
                  'opt-cursor': clickPhase === 1 && i === 1,
                }"
              >
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <g :transform="`rotate(${opt.rot}, 100, 100)`">
                    <circle
                      :cx="100" :cy="100" :r="opt.r"
                      :fill="(clickPhase >= 2 && i === 1) ? '#43A047' : '#5C6BC0'"
                      :stroke="(clickPhase >= 2 && i === 1) ? '#2E7D32' : '#3949AB'"
                      stroke-width="3"
                    />
                  </g>
                </svg>
                <div v-if="clickPhase >= 2 && i === 1" class="correct-check">✓</div>
              </div>
            </div>
          </div>
        </div>
        <div class="step-hint">
          <span v-if="clickPhase >= 2" class="hint-icon score-pop">+5</span>
          <span v-else class="hint-icon">👆</span>
        </div>
      </div>

      <!-- Step 4: New question starts -->
      <div v-if="step === 3" class="step-content">
        <div class="demo-board">
          <div class="demo-left">
            <div class="demo-ref-area" :class="{ 'new-q': newQAnim }">
              <div class="shape-area">
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <!-- square shape for variety -->
                  <rect x="45" y="45" width="110" height="110" rx="6" fill="#FF7043" stroke="#E64A19" stroke-width="3"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="demo-divider"></div>
          <div class="demo-right">
            <div class="demo-opts">
              <div v-for="(opt2, i) in demoOpts2" :key="i" class="demo-opt-cell opt-visible">
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <rect
                    :x="100-opt2.r" :y="100-opt2.r"
                    :width="opt2.r*2" :height="opt2.r*2"
                    rx="4"
                    fill="#5C6BC0" stroke="#3949AB" stroke-width="3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="step-hint">
          <div class="timer-demo">
            <div class="timer-fill" :style="{ width: timerW + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="nav-row">
        <button v-if="step > 0" class="nav-btn outline" @click="prev">{{ t('prev') }}</button>
        <button v-else class="nav-btn ghost" @click="$emit('done')">{{ t('skip') }}</button>

        <div class="step-label">{{ step + 1 }} / 4</div>

        <button v-if="step < 3" class="nav-btn primary" @click="next">{{ t('next') }}</button>
        <button v-else class="nav-btn primary" @click="$emit('done')">{{ t('startPlay') }}</button>
      </div>

      <!-- Skip top-right -->
      <button v-if="step < 3" class="skip-top" @click="$emit('done')">{{ t('skip') }} ›</button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'TutorialModal',
  props: {
    language: { type: String, required: true },
  },
  emits: ['done'],
  data() {
    return {
      step: 0,
      hlRef: false,
      optVisible: 0,
      clickPhase: 0,
      newQAnim: false,
      timerW: 100,
      stepTimer: null,
      // Demo option data
      demoOpts: [
        { r: 30, rot: 0 },
        { r: 55, rot: 0 },
        { r: 72, rot: 0 },
        { r: 42, rot: 0 },
      ],
      demoOpts2: [
        { r: 28 },
        { r: 55 },
        { r: 70 },
        { r: 40 },
      ],
    }
  },
  mounted() {
    this.runStepAnim()
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    t(key) { return t(this.language, key) },
    clearTimer() {
      if (this.stepTimer) { clearTimeout(this.stepTimer); this.stepTimer = null }
    },
    runStepAnim() {
      this.clearTimer()
      if (this.step === 0) {
        this.hlRef = false
        this.stepTimer = setTimeout(() => { this.hlRef = true }, 300)
      } else if (this.step === 1) {
        this.optVisible = 0
        const show = (i) => {
          this.stepTimer = setTimeout(() => {
            this.optVisible = i
            if (i < 4) show(i + 1)
          }, 350)
        }
        show(1)
      } else if (this.step === 2) {
        this.clickPhase = 0
        this.stepTimer = setTimeout(() => {
          this.clickPhase = 1
          this.stepTimer = setTimeout(() => {
            this.clickPhase = 2
          }, 600)
        }, 600)
      } else if (this.step === 3) {
        this.timerW = 100
        this.newQAnim = false
        this.stepTimer = setTimeout(() => { this.newQAnim = true }, 200)
        const tick = () => {
          this.stepTimer = setTimeout(() => {
            if (this.timerW > 0) {
              this.timerW = Math.max(0, this.timerW - 3)
              tick()
            }
          }, 120)
        }
        tick()
      }
    },
    next() {
      if (this.step < 3) {
        this.step++
        this.runStepAnim()
      }
    },
    prev() {
      if (this.step > 0) {
        this.step--
        this.runStepAnim()
      }
    },
  },
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.tutorial-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.step-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  transition: background 0.3s, transform 0.3s;
}
.dot.active { background: #5C6BC0; transform: scale(1.3); }

.step-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Demo board layout */
.demo-board {
  display: flex;
  align-items: stretch;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #F8F9FF;
  border-radius: 12px;
  padding: 20px;
}

.demo-left {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.demo-divider {
  width: 2px;
  background: #e0e0e0;
  border-radius: 1px;
  align-self: stretch;
  margin: 10px 0;
}
.demo-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-ref-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  transition: box-shadow 0.4s, background 0.4s;
}
.demo-ref-area.highlight {
  background: rgba(255,112,67,0.08);
  box-shadow: 0 0 0 3px #FF7043, 0 0 18px 4px rgba(255,112,67,0.35);
  animation: pulse-ref 1.2s ease-in-out infinite alternate;
}
.demo-ref-area.new-q {
  animation: new-q-in 0.5s ease-out;
}
@keyframes pulse-ref {
  from { box-shadow: 0 0 0 3px #FF7043, 0 0 10px 2px rgba(255,112,67,0.25); }
  to   { box-shadow: 0 0 0 4px #FF7043, 0 0 24px 8px rgba(255,112,67,0.45); }
}
@keyframes new-q-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

.demo-label-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #FF7043;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-area {
  width: 80%;
  height: 80%;
}

/* Options grid */
.demo-opts, .demo-opts-empty {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  width: 100%;
  height: 100%;
}
.demo-opt-cell, .opt-placeholder {
  background: #fff;
  border-radius: 10px;
  border: 2px solid #e8eaf6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s, transform 0.3s, border-color 0.3s, background 0.3s;
}
.opt-placeholder {
  opacity: 1;
  transform: none;
  border-style: dashed;
  border-color: #c5cae9;
}
.demo-opt-cell.opt-visible {
  opacity: 1;
  transform: scale(1);
}
.demo-opt-cell.opt-cursor {
  border-color: #5C6BC0;
  box-shadow: 0 0 0 2px rgba(92,107,192,0.4);
}
.demo-opt-cell.opt-correct {
  border-color: #43A047;
  background: rgba(67,160,71,0.1);
  animation: correct-bounce 0.4s ease;
}
@keyframes correct-bounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.correct-check {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #43A047;
  font-weight: 900;
  pointer-events: none;
  animation: check-in 0.3s ease;
}
@keyframes check-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.step-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36px;
  flex-shrink: 0;
}
.hint-icon {
  font-size: 32px;
}
.score-pop {
  font-size: 36px;
  color: #43A047;
  font-weight: 900;
  animation: score-pop-anim 0.5s ease;
}
@keyframes score-pop-anim {
  from { opacity: 0; transform: translateY(10px) scale(0.7); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Timer demo */
.timer-demo {
  width: 70%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}
.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #43A047, #FFCA28, #E53935);
  background-size: 300% 100%;
  background-position: left;
  transition: width 0.12s linear;
  border-radius: 10px;
}

/* Nav */
.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  flex-shrink: 0;
}
.step-label {
  color: #9e9e9e;
  font-size: 14px;
}
.nav-btn {
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform 0.15s, box-shadow 0.15s;
  min-width: 90px;
}
.nav-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.nav-btn.primary { background: #5C6BC0; color: #fff; }
.nav-btn.outline { background: #fff; color: #5C6BC0; border: 2px solid #5C6BC0; }
.nav-btn.ghost   { background: transparent; color: #999; }

.skip-top {
  position: absolute;
  top: 16px;
  right: 18px;
  background: none;
  border: none;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
}
.skip-top:hover { color: #666; }
</style>
