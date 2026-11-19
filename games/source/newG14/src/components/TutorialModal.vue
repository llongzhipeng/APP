<template>
  <div class="modal-overlay">
    <div class="tutorial-box">
      <!-- Header -->
      <div class="tut-header">
        <h2 class="tut-title">{{ t.tutorialTitle }}</h2>
        <div class="step-dots">
          <span v-for="i in 3" :key="i" class="dot" :class="{ active: i - 1 === step }"></span>
        </div>
      </div>

      <!-- Step hint -->
      <div class="step-hint">{{ t.tutDemoHints[step] }}</div>

      <!-- Demo board -->
      <div class="demo-board">
        <template v-if="step < 2">
          <div class="demo-rule">
            {{ step === 0 ? t.forwardRule : t.reverseRule }}
          </div>

          <!-- Broadcast / speaker demo area -->
          <div class="demo-broadcast-area">
            <!-- Speaker icon (visible during listening) -->
            <transition name="fade">
              <div v-if="demoPhase === 'showing'" class="speaker-wrap">
                <div class="speaker-icon" :class="{ active: currentDigitIdx >= 0 }">
                  <div class="wave w1"></div>
                  <div class="wave w2"></div>
                  <div class="wave w3"></div>
                  <span class="mic">🎙</span>
                </div>
                <div class="broadcast-text">
                  <span
                    v-for="(d, i) in demoNumbers"
                    :key="i"
                    class="broadcast-digit"
                    :class="{ active: currentDigitIdx === i }"
                  >{{ d }}</span>
                </div>
              </div>
            </transition>

            <!-- Input slots -->
            <transition name="fade">
              <div v-if="demoPhase === 'inputting' || demoPhase === 'correct'" class="demo-slots-row">
                <span
                  v-for="i in demoNumbers.length"
                  :key="i"
                  class="demo-slot"
                  :class="{ filled: demoInput.length >= i }"
                >{{ demoInput[i - 1] !== undefined ? demoInput[i - 1] : '' }}</span>
              </div>
            </transition>
          </div>

          <!-- Feedback -->
          <transition name="scale-pop">
            <div v-if="demoPhase === 'correct'" class="demo-feedback">
              <span class="fb-check">✓</span>
              <span class="fb-text">{{ t.correct }}</span>
              <span class="fb-pts">{{ step === 0 ? '+5' : '+12.5' }}</span>
            </div>
          </transition>

          <!-- Mini keyboard -->
          <div v-if="demoPhase === 'inputting' || demoPhase === 'correct'" class="demo-keyboard">
            <button
              v-for="k in miniKeys"
              :key="k"
              class="mini-key"
              :class="{
                'mini-key-del': k === 'D',
                'mini-key-ok': k === 'OK',
                'mini-key-hl': highlightKey === k
              }"
            >{{ k === 'D' ? t.del : k === 'OK' ? t.confirm : k }}</button>
          </div>
        </template>

        <!-- Step 2: difficulty adjustment demo -->
        <template v-else>
          <div class="period-demo">
            <div class="level-row">
              <div class="level-badge" :class="{ upgraded: showLevelUp }">
                Lv.{{ currentLevel }}
              </div>
              <transition name="fade">
                <div v-if="showLevelUp" class="level-up-badge">▲ {{ t.tutLevelUp }}</div>
              </transition>
            </div>

            <div class="period-row">
              <span class="period-label">60s</span>
              <div class="period-bar">
                <div class="period-fill" :style="{ width: periodPct + '%' }"></div>
              </div>
            </div>

            <div class="checks-row">
              <transition-group name="check-pop" tag="div" class="checks-inner">
                <span v-for="i in correctCount" :key="i" class="check-mark">✓</span>
              </transition-group>
              <span v-if="showAccuracy" class="accuracy-badge">{{ t.tutAccuracy }} ≥ 90%</span>
            </div>

            <div class="adj-rules">
              <div class="adj-rule up">{{ t.tutAccuracyHigh }}</div>
              <div class="adj-rule down">{{ t.tutAccuracyLow }}</div>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer nav -->
      <div class="tut-footer">
        <button class="btn-skip" @click="$emit('done')">{{ t.tutSkip }}</button>
        <div class="nav-btns">
          <button v-if="step > 0" class="btn-nav" @click="prevStep">{{ t.tutPrev }}</button>
          <button v-if="step < 2" class="btn-nav btn-next" @click="nextStep">{{ t.tutNext }}</button>
          <button v-else class="btn-nav btn-start" @click="$emit('done')">{{ t.tutStart }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TutorialModal',
  props: {
    t: { type: Object, required: true }
  },
  emits: ['done'],
  data() {
    return {
      step: 0,
      demoPhase: 'idle',   // idle | showing | inputting | correct
      demoNumbers: [],
      demoInput: [],
      highlightKey: null,
      currentDigitIdx: -1,
      periodPct: 0,
      correctCount: 0,
      showAccuracy: false,
      showLevelUp: false,
      currentLevel: 1,
      miniKeys: ['1','2','3','4','5','6','7','8','9','D','0','OK'],
      timers: []
    }
  },
  watch: {
    step(s) { this.runStep(s) }
  },
  mounted() {
    this.runStep(0)
  },
  beforeDestroy() {
    this.clearAll()
  },
  methods: {
    after(ms, fn) {
      const id = setTimeout(fn, ms)
      this.timers.push(id)
    },
    clearAll() {
      this.timers.forEach(clearTimeout)
      this.timers = []
    },
    resetState() {
      this.demoPhase = 'idle'
      this.demoNumbers = []
      this.demoInput = []
      this.highlightKey = null
      this.currentDigitIdx = -1
      this.periodPct = 0
      this.correctCount = 0
      this.showAccuracy = false
      this.showLevelUp = false
      this.currentLevel = 1
    },
    runStep(s) {
      this.clearAll()
      this.resetState()
      if (s === 0) this.runForwardDemo()
      else if (s === 1) this.runReverseDemo()
      else this.runPeriodDemo()
    },
    runDigitDemo(numbers, order) {
      this.demoNumbers = numbers
      this.demoPhase = 'showing'
      this.demoInput = []
      this.highlightKey = null
      this.currentDigitIdx = -1

      // Sequentially highlight each digit as if broadcasting it
      const gap = 700
      numbers.forEach((_, i) => {
        this.after(300 + i * gap, () => { this.currentDigitIdx = i })
      })
      const showMs = 300 + numbers.length * gap + 400

      this.after(showMs, () => {
        this.demoPhase = 'inputting'
        this.currentDigitIdx = -1
        const sequence = order === 'forward' ? numbers.slice() : numbers.slice().reverse()

        sequence.forEach((key, i) => {
          this.after(500 + i * 600, () => {
            this.highlightKey = key
            this.demoInput = this.demoInput.concat(key)
            this.after(250, () => { this.highlightKey = null })

            if (i === sequence.length - 1) {
              this.after(450, () => {
                this.demoPhase = 'correct'
                this.after(1800, () => this.runDigitDemo(numbers, order))
              })
            }
          })
        })
      })
    },
    runForwardDemo() { this.runDigitDemo([5, 8, 3], 'forward') },
    runReverseDemo() { this.runDigitDemo([4, 1, 6], 'reverse') },
    runPeriodDemo() {
      this.periodPct = 0
      this.correctCount = 0
      this.showAccuracy = false
      this.showLevelUp = false
      this.currentLevel = 1

      const totalMs = 4000
      const fps = 40
      const frameMs = totalMs / fps
      let frame = 0
      const barId = setInterval(() => {
        frame++
        this.periodPct = (frame / fps) * 100
        if (frame >= fps) clearInterval(barId)
      }, frameMs)
      this.timers.push(barId)

      const popTimes = [300, 750, 1300, 1900, 2600, 3200]
      popTimes.forEach((t, i) => {
        this.after(t, () => { this.correctCount = i + 1 })
      })

      this.after(3500, () => { this.showAccuracy = true })

      this.after(4200, () => {
        this.showLevelUp = true
        this.currentLevel = 2
        this.after(2000, () => this.runPeriodDemo())
      })
    },
    nextStep() { if (this.step < 2) this.step++ },
    prevStep() { if (this.step > 0) this.step-- }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 1.5vh;
  z-index: 100;
  backdrop-filter: blur(0.3rem);
}

.tutorial-box {
  background: linear-gradient(135deg, #0e1228, #161c38);
  border: 0.1rem solid rgba(0, 212, 255, 0.3);
  border-radius: 1.2rem;
  padding: 1.2rem 1.6rem;
  width: min(92vw, 34rem);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  box-shadow: 0 0 3rem rgba(0, 0, 0, 0.6);
}

.tut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tut-title {
  color: #00d4ff;
  font-size: 1.25rem;
  margin: 0;
  letter-spacing: 0.05em;
}

.step-dots { display: flex; gap: 0.4rem; }
.dot {
  width: 0.55rem; height: 0.55rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: background 0.3s, transform 0.3s;
}
.dot.active { background: #00d4ff; transform: scale(1.4); }

.step-hint {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.45;
  min-height: 1.8em;
}

.demo-board {
  background: rgba(0,0,0,0.3);
  border: 0.08rem solid rgba(255,255,255,0.08);
  border-radius: 0.8rem;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-height: 15rem;
  justify-content: center;
}

.demo-rule {
  font-size: 1rem;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.03em;
  text-align: center;
}

.demo-broadcast-area {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 6.5rem;
}

.speaker-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  transition: opacity 0.3s;
}

.speaker-icon {
  position: relative;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 50%;
  background: rgba(0, 212, 255, 0.15);
  border: 0.1rem solid rgba(0, 212, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.speaker-icon.active {
  background: rgba(0, 212, 255, 0.35);
  box-shadow: 0 0 1rem rgba(0, 212, 255, 0.5);
  transform: scale(1.05);
}
.mic { font-size: 1.5rem; }
.wave {
  position: absolute;
  border: 0.1rem solid rgba(0, 212, 255, 0.6);
  border-radius: 50%;
  inset: 0;
  opacity: 0;
  animation: none;
}
.speaker-icon.active .wave { animation: ripple 1.2s ease-out infinite; }
.speaker-icon.active .w2 { animation-delay: 0.3s; }
.speaker-icon.active .w3 { animation-delay: 0.6s; }
@keyframes ripple {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2.2); opacity: 0; }
}

.broadcast-text {
  display: flex;
  gap: 0.4rem;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.4);
}
.broadcast-digit {
  padding: 0.15rem 0.5rem;
  border-radius: 0.3rem;
  transition: all 0.2s;
}
.broadcast-digit.active {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.15);
  text-shadow: 0 0 0.5rem rgba(0, 212, 255, 0.6);
  transform: scale(1.15);
}

.demo-slots-row {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  transition: opacity 0.3s;
}

.demo-slot {
  width: 2.6rem;
  height: 3rem;
  font-size: 1.6rem;
  font-weight: 700;
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 0.1rem solid rgba(255,255,255,0.2);
  color: #888;
  transition: all 0.2s;
}
.demo-slot.filled {
  background: rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.5);
  color: #00d4ff;
}

.demo-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(74, 222, 128, 0.15);
  border: 0.08rem solid rgba(74, 222, 128, 0.35);
  border-radius: 2rem;
  padding: 0.4rem 1.1rem;
}
.fb-check { color: #4ade80; font-size: 1.3rem; font-weight: 900; }
.fb-text { color: #4ade80; font-size: 1.05rem; font-weight: 700; }
.fb-pts { color: rgba(255,255,255,0.75); font-size: 1rem; }

.demo-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
  width: 12rem;
}
.mini-key {
  aspect-ratio: 1.15;
  border-radius: 0.4rem;
  border: 0.08rem solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  font-family: inherit;
}
.mini-key-del {
  background: rgba(255, 100, 100, 0.08);
  border-color: rgba(255, 100, 100, 0.2);
  color: #ff8080;
  font-size: 0.85rem;
}
.mini-key-ok {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  font-size: 0.85rem;
}
.mini-key-hl {
  background: rgba(0, 212, 255, 0.35) !important;
  border-color: #00d4ff !important;
  color: #fff !important;
  transform: scale(1.12);
  box-shadow: 0 0 0.5rem rgba(0, 212, 255, 0.5);
}

.period-demo {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.level-badge {
  background: rgba(167, 139, 250, 0.15);
  border: 0.1rem solid rgba(167, 139, 250, 0.4);
  color: #a78bfa;
  border-radius: 0.4rem;
  padding: 0.3rem 0.7rem;
  font-size: 1rem;
  font-weight: 800;
  transition: all 0.4s;
}
.level-badge.upgraded {
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.level-up-badge {
  background: rgba(74, 222, 128, 0.15);
  border: 0.08rem solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 2rem;
}

.period-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
}
.period-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}
.period-bar {
  flex: 1;
  height: 0.4rem;
  background: rgba(255,255,255,0.1);
  border-radius: 1rem;
  overflow: hidden;
}
.period-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #a78bfa);
  border-radius: 1rem;
  transition: width 0.1s linear;
}

.checks-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 1.6rem;
}
.checks-inner {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.check-mark {
  color: #4ade80;
  font-size: 1.1rem;
  font-weight: 900;
  display: inline-block;
}
.accuracy-badge {
  background: rgba(74, 222, 128, 0.15);
  border: 0.07rem solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 2rem;
}

.adj-rules {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}
.adj-rule {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.4rem;
  text-align: center;
}
.adj-rule.up {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
  border: 0.06rem solid rgba(74, 222, 128, 0.25);
}
.adj-rule.down {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 0.06rem solid rgba(251, 191, 36, 0.25);
}

.tut-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.btn-skip {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  padding: 0.3rem 0.5rem;
  transition: color 0.2s;
}
.btn-skip:hover { color: rgba(255,255,255,0.85); }

.nav-btns { display: flex; gap: 0.5rem; }
.btn-nav {
  background: rgba(255,255,255,0.08);
  border: 0.08rem solid rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-nav:hover { background: rgba(255,255,255,0.15); }
.btn-next, .btn-start {
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  border-color: transparent;
}
.btn-next:hover, .btn-start:hover {
  background: linear-gradient(135deg, #22e0ff, #0088ff);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter, .fade-leave-to { opacity: 0; }

.scale-pop-enter-active { transition: opacity 0.25s, transform 0.25s; }
.scale-pop-enter { opacity: 0; transform: scale(0.6); }

.check-pop-enter-active { transition: opacity 0.2s, transform 0.2s; }
.check-pop-enter { opacity: 0; transform: scale(0) translateY(0.5rem); }

@media (orientation: portrait) {
  .tutorial-box {
    width: 92vw;
    max-height: 90vh;
    padding: 1.4rem 1rem;
    padding-top: calc(1.4rem + env(safe-area-inset-top));
    padding-bottom: calc(1.4rem + env(safe-area-inset-bottom));
    border-radius: 1.2rem;
  }
  .tut-title { font-size: max(5vmin, 18px); }
  .step-hint { font-size: max(3.6vmin, 14px); }
  .demo-board { padding: 1rem 0.6rem; }
  .demo-rule { font-size: max(3.6vmin, 14px); }
  .speaker-icon { width: max(14vmin, 3.6rem); height: max(14vmin, 3.6rem); }
  .mic { font-size: max(6vmin, 22px); }
  .broadcast-digit { font-size: max(5vmin, 18px); }
  .demo-slot {
    font-size: max(6.5vmin, 24px);
    width: max(10vmin, 40px);
    height: max(12vmin, 48px);
  }
  .demo-keyboard {
    width: 82%;
    max-width: 22rem;
    gap: max(1.5vmin, 6px);
  }
  .mini-key {
    font-size: max(4.4vmin, 17px);
    padding: 0.7rem 0;
    border-radius: 0.5rem;
  }
  .mini-key-del, .mini-key-ok { font-size: max(3.2vmin, 12px); }
  .demo-feedback .fb-text { font-size: max(4vmin, 15px); }
  .demo-feedback .fb-check { font-size: max(7vmin, 26px); }
  .demo-feedback .fb-pts { font-size: max(3.6vmin, 14px); }
  .level-badge { font-size: max(4.4vmin, 16px); padding: 0.4rem 0.9rem; }
  .level-up-badge { font-size: max(3.4vmin, 13px); }
  .period-label { font-size: max(3.4vmin, 13px); }
  .accuracy-badge { font-size: max(3.2vmin, 12px); }
  .adj-rules { flex-direction: column; gap: 0.6rem; }
  .adj-rule { font-size: max(3.4vmin, 13px); text-align: center; }
  .tut-footer {
    flex-direction: column-reverse;
    gap: 0.8rem;
    align-items: stretch;
  }
  .nav-btns { justify-content: space-between; gap: 0.8rem; }
  .btn-nav {
    flex: 1;
    padding: 1rem;
    font-size: max(4vmin, 15px);
    border-radius: 0.7rem;
  }
  .btn-skip {
    align-self: center;
    font-size: max(3.6vmin, 13px);
    padding: 0.6rem 1rem;
  }
}
</style>
