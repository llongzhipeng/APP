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

        <!-- Steps 0 & 1: digit game demo -->
        <template v-if="step < 2">
          <div class="demo-rule">
            {{ step === 0 ? t.forwardRule : t.reverseRule }}
          </div>

          <!-- Number display / input slots -->
          <div class="demo-digits-area">
            <div class="demo-digits-row">
              <span
                v-for="(d, i) in demoNumbers"
                :key="i"
                class="demo-digit"
                :class="{ visible: demoPhase === 'showing' }"
              >{{ demoPhase === 'showing' ? d : '' }}</span>
            </div>

            <!-- Input slots (visible during inputting) -->
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

          <!-- Display timer bar (showing phase) -->
          <div v-if="demoPhase === 'showing'" class="demo-timer-bar">
            <div class="demo-timer-fill" :style="{ width: demoTimerPct + '%' }"></div>
          </div>

          <!-- Feedback (correct phase) -->
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
            <!-- Level badge -->
            <div class="level-row">
              <div class="level-badge" :class="{ upgraded: showLevelUp }">
                Lv.{{ currentLevel }}
              </div>
              <transition name="fade">
                <div v-if="showLevelUp" class="level-up-badge">▲ {{ t.tutLevelUp }}</div>
              </transition>
            </div>

            <!-- 30-second period bar -->
            <div class="period-row">
              <span class="period-label">30s</span>
              <div class="period-bar">
                <div class="period-fill" :style="{ width: periodPct + '%' }"></div>
              </div>
            </div>

            <!-- Correct answers -->
            <div class="checks-row">
              <transition-group name="check-pop" tag="div" class="checks-inner">
                <span v-for="i in correctCount" :key="i" class="check-mark">✓</span>
              </transition-group>
              <span v-if="showAccuracy" class="accuracy-badge">{{ t.tutAccuracy }} ≥ 90%</span>
            </div>

            <!-- Rule descriptions -->
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
import { ref, watch, onMounted, onUnmounted } from '@vue/composition-api'

export default {
  name: 'TutorialModal',
  props: {
    t: { type: Object, required: true }
  },
  emits: ['done'],

  setup() {
    const step = ref(0)

    // Shared demo state
    const demoPhase = ref('idle')   // idle | showing | inputting | correct
    const demoNumbers = ref([])
    const demoInput = ref([])
    const highlightKey = ref(null)
    const demoTimerPct = ref(100)   // progress bar for showing phase

    // Step 2 state
    const periodPct = ref(0)
    const correctCount = ref(0)
    const showAccuracy = ref(false)
    const showLevelUp = ref(false)
    const currentLevel = ref(1)

    const miniKeys = ['1','2','3','4','5','6','7','8','9','D','0','OK']

    let timers = []

    function after(ms, fn) {
      const id = setTimeout(fn, ms)
      timers.push(id)
    }

    function clearAll() {
      timers.forEach(clearTimeout)
      timers = []
    }

    function resetState() {
      demoPhase.value = 'idle'
      demoNumbers.value = []
      demoInput.value = []
      highlightKey.value = null
      demoTimerPct.value = 100
      periodPct.value = 0
      correctCount.value = 0
      showAccuracy.value = false
      showLevelUp.value = false
      currentLevel.value = 1
    }

    function runStep(s) {
      clearAll()
      resetState()
      if (s === 0) runForwardDemo()
      else if (s === 1) runReverseDemo()
      else runPeriodDemo()
    }

    // Animate the timer bar draining over `ms` milliseconds
    function animateTimerBar(ms) {
      const fps = 30
      const interval = ms / fps
      let frames = fps
      const id = setInterval(() => {
        frames--
        demoTimerPct.value = (frames / fps) * 100
        if (frames <= 0) clearInterval(id)
      }, interval)
      timers.push(id)
    }

    function runDigitDemo(numbers, order) {
      demoNumbers.value = numbers
      demoPhase.value = 'showing'
      demoInput.value = []
      highlightKey.value = null
      demoTimerPct.value = 100

      const showMs = 2800
      animateTimerBar(showMs)

      after(showMs, () => {
        demoPhase.value = 'inputting'
        const sequence = order === 'forward' ? [...numbers] : [...numbers].reverse()

        sequence.forEach((key, i) => {
          after(500 + i * 600, () => {
            highlightKey.value = key
            demoInput.value = [...demoInput.value, key]
            after(250, () => { highlightKey.value = null })

            if (i === sequence.length - 1) {
              after(450, () => {
                demoPhase.value = 'correct'
                after(1800, () => runDigitDemo(numbers, order))
              })
            }
          })
        })
      })
    }

    function runForwardDemo() {
      runDigitDemo([5, 8, 3], 'forward')
    }

    function runReverseDemo() {
      runDigitDemo([4, 1, 6], 'reverse')
    }

    function runPeriodDemo() {
      periodPct.value = 0
      correctCount.value = 0
      showAccuracy.value = false
      showLevelUp.value = false
      currentLevel.value = 1

      // Animate period bar over 4 seconds
      const totalMs = 4000
      const fps = 40
      const frameMs = totalMs / fps
      let frame = 0
      const barId = setInterval(() => {
        frame++
        periodPct.value = (frame / fps) * 100
        if (frame >= fps) clearInterval(barId)
      }, frameMs)
      timers.push(barId)

      // Pop in correct answers
      const popTimes = [300, 750, 1300, 1900, 2600, 3200]
      popTimes.forEach((t, i) => {
        after(t, () => { correctCount.value = i + 1 })
      })

      // Show accuracy label
      after(3500, () => { showAccuracy.value = true })

      // Level up
      after(4200, () => {
        showLevelUp.value = true
        currentLevel.value = 2
        after(2000, () => runPeriodDemo())
      })
    }

    onMounted(() => runStep(0))
    onUnmounted(() => clearAll())
    watch(step, (s) => runStep(s))

    function nextStep() { if (step.value < 2) step.value++ }
    function prevStep() { if (step.value > 0) step.value-- }

    return {
      step, demoPhase, demoNumbers, demoInput, highlightKey,
      demoTimerPct, miniKeys,
      periodPct, correctCount, showAccuracy, showLevelUp, currentLevel,
      nextStep, prevStep
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: #f5ead2;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(0.3rem);
  padding: 2vh 0;
  overflow-y: auto;
}

.tutorial-box {
  background: #fffaf0; color: #384357;
  border: 0.1rem solid rgba(0, 212, 255, 0.3);
  border-radius: 1.2rem;
  padding: 1.5rem 2rem;
  width: min(92vw, 28rem);
  max-height: 90vh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 12px 40px rgba(88, 70, 34, 0.18);
  overflow-y: auto;
}

.tut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tut-title {
  color: #245481;
  font-size: 1.1rem;
  margin: 0;
  letter-spacing: 0.05em;
}

.step-dots { display: flex; gap: 0.4rem; }
.dot {
  width: 0.45rem; height: 0.45rem;
  border-radius: 50%;
  background: #c9bc9d;
  transition: background 0.3s, transform 0.3s;
}
.dot.active { background: #00d4ff; transform: scale(1.4); }

.step-hint {
  color: #514f48;
  font-size: 0.78rem;
  text-align: center;
  line-height: 1.5;
  min-height: 2.2em;
}

/* Demo board */
.demo-board {
  background: #263951; color: #f7fbff;
  border: 0.08rem solid rgba(255,255,255,0.08);
  border-radius: 0.8rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-height: 16rem;
  justify-content: center;
}

.demo-rule {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.03em;
  text-align: center;
}

.demo-digits-area {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.5rem;
}

.demo-digits-row, .demo-slots-row {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  position: absolute;
  transition: opacity 0.3s;
}

.demo-slots-row { top: 0; }

.demo-digit {
  width: min(2.6rem, 9vw);
  height: min(3rem, 10vw);
  font-size: min(1.6rem, 5.5vw);
  font-weight: 900;
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.08);
  border: 0.1rem solid rgba(0, 212, 255, 0.2);
  color: transparent;
  transition: color 0.3s, background 0.3s, border-color 0.3s;
}
.demo-digit.visible {
  color: #fff;
  background: rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.5);
  text-shadow: 0 0 1rem rgba(0, 212, 255, 0.5);
}

.demo-slot {
  width: min(2.6rem, 9vw);
  height: min(3rem, 10vw);
  font-size: min(1.6rem, 5.5vw);
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

.demo-timer-bar {
  width: 80%;
  height: 0.25rem;
  background: rgba(255,255,255,0.1);
  border-radius: 1rem;
  overflow: hidden;
  margin-top: 2.8rem;
}
.demo-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0078ff);
  border-radius: 1rem;
  transition: width 0.05s linear;
}

/* Feedback */
.demo-feedback {
  position: absolute;
  bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(74, 222, 128, 0.15);
  border: 0.08rem solid rgba(74, 222, 128, 0.35);
  border-radius: 2rem;
  padding: 0.3rem 0.9rem;
}
.fb-check { color: #4ade80; font-size: 1rem; font-weight: 900; }
.fb-text { color: #4ade80; font-size: 0.82rem; font-weight: 700; }
.fb-pts { color: rgba(255,255,255,0.6); font-size: 0.78rem; }

/* Mini keyboard */
.demo-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
  width: min(12rem, 40vw);
  margin-top: 3.2rem;
}
.mini-key {
  aspect-ratio: 1.15;
  border-radius: 0.35rem;
  border: 0.08rem solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
  font-size: min(0.8rem, 2.5vw);
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
  font-size: min(0.6rem, 1.8vw);
}
.mini-key-ok {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  font-size: min(0.6rem, 1.8vw);
}
.mini-key-hl {
  background: rgba(0, 212, 255, 0.35) !important;
  border-color: #00d4ff !important;
  color: #fff !important;
  transform: scale(1.12);
  box-shadow: 0 0 0.5rem rgba(0, 212, 255, 0.5);
}

/* Period demo */
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

/* Footer */
.tut-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.btn-skip {
  background: none;
  border: none;
  color: #5a5140;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  padding: 0.3rem 0.5rem;
  transition: color 0.2s;
}
.btn-skip:hover { color: #30291f; }

.nav-btns { display: flex; gap: 0.5rem; }
.btn-nav {
  background: #f5e9ca;
  border: 0.08rem solid #dfcfa7;
  color: #374558;
  border-radius: 0.5rem;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-nav:hover { background: rgba(255,255,255,0.15); }
.btn-next, .btn-start {
  background: #2560a0;
  color: #fff;
  border-color: transparent;
}
.btn-next:hover, .btn-start:hover {
  background: #1d4e83;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-pop-enter-active { transition: opacity 0.25s, transform 0.25s; }
.scale-pop-enter-from { opacity: 0; transform: scale(0.6); }

.check-pop-enter-active { transition: opacity 0.2s, transform 0.2s; }
.check-pop-enter-from { opacity: 0; transform: scale(0) translateY(0.5rem); }
</style>
