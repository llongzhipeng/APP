<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tut-title">{{ t.tutorialTitle }}</h2>

      <!-- Step indicators -->
      <div class="step-dots">
        <span
          v-for="i in 4" :key="i"
          class="dot"
          :class="{ active: step === i }"
        />
      </div>

      <!-- Tutorial content area -->
      <div class="tut-scene">
        <!-- Step 1: Show puzzle with holes highlighted -->
        <div v-if="step === 1" class="scene-step">
          <div class="demo-board">
            <div
              v-for="(cell, idx) in demoStep1.cells"
              :key="idx"
              class="demo-cell"
              :class="{ 'demo-hole': demoStep1.holes.includes(idx), 'pulse': demoStep1.holes.includes(idx) }"
              :style="demoStep1.holes.includes(idx) ? {} : { background: cell }"
            />
          </div>
          <div class="hint-arrow">↓</div>
          <div class="demo-tray">
            <div
              v-for="p in demoStep1.tray"
              :key="p.id"
              class="demo-piece"
              :style="{ background: p.color }"
            />
          </div>
          <p class="step-hint">{{ t.tutorialStep1Hint }}</p>
        </div>

        <!-- Step 2: Highlight a piece in the tray -->
        <div v-if="step === 2" class="scene-step">
          <div class="demo-board">
            <div
              v-for="(cell, idx) in demoStep1.cells"
              :key="idx"
              class="demo-cell"
              :class="{ 'demo-hole': demoStep1.holes.includes(idx) }"
              :style="demoStep1.holes.includes(idx) ? {} : { background: cell }"
            />
          </div>
          <div class="hint-arrow anim-bounce">↓</div>
          <div class="demo-tray">
            <div
              v-for="(p, i) in demoStep1.tray"
              :key="p.id"
              class="demo-piece"
              :class="{ 'piece-highlight': i === 0 }"
              :style="{ background: p.color }"
            />
          </div>
          <p class="step-hint">{{ t.tutorialStep2Hint }}</p>
        </div>

        <!-- Step 3: Animate dragging piece to hole -->
        <div v-if="step === 3" class="scene-step">
          <div class="demo-board">
            <div
              v-for="(cell, idx) in demoStep1.cells"
              :key="idx"
              class="demo-cell"
              :class="{ 'demo-hole': idx === demoStep1.holes[0] && !placed, 'hole-target': idx === demoStep1.holes[0] && !placed }"
              :style="idx === demoStep1.holes[0] && placed
                ? { background: demoStep1.tray[0].color }
                : demoStep1.holes.includes(idx) && idx !== demoStep1.holes[0]
                  ? {}
                  : { background: demoStep1.cells[idx] }"
            />
          </div>
          <div class="drag-demo">
            <div
              class="flying-piece"
              :class="{ 'fly-anim': animating }"
              :style="{ background: demoStep1.tray[0].color }"
            />
          </div>
          <p class="step-hint">{{ t.tutorialStep3Hint }}</p>
        </div>

        <!-- Step 4: Success state -->
        <div v-if="step === 4" class="scene-step">
          <div class="demo-board">
            <div
              v-for="(cell, idx) in demoStep1.cells"
              :key="idx"
              class="demo-cell"
              :class="{ 'cell-success': demoStep1.holes.includes(idx) }"
              :style="{ background: demoStep1.holes.includes(idx) ? ((demoStep1.tray[demoStep1.holes.indexOf(idx)] && demoStep1.tray[demoStep1.holes.indexOf(idx)].color) || cell) : cell }"
            />
          </div>
          <div class="success-badge">✓</div>
          <p class="step-hint">{{ t.tutorialStep4Hint }}</p>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="tut-nav">
        <button
          v-if="step > 1"
          class="btn btn-ghost"
          @click="step--"
        >{{ t.tutorialPrev }}</button>
        <button class="btn btn-ghost skip-btn" @click="$emit('skip')">{{ t.tutorialSkip }}</button>
        <button
          v-if="step < 4"
          class="btn btn-accent"
          @click="nextStep"
        >{{ t.tutorialNext }}</button>
        <button
          v-if="step === 4"
          class="btn btn-accent"
          @click="$emit('done')"
        >{{ t.tutorialStart }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted } from '@vue/composition-api'

export default {
  name: 'TutorialModal',
  props: { t: Object },
  setup() {
    const step = ref(1)
    const animating = ref(false)
    const placed = ref(false)
    let timer = null

    // Demo puzzle data (3×3 grid, 2 holes)
    const demoStep1 = {
      cells: [
        '#87CEEB','#87CEEB','#FFD700',
        '#FFA500','#FF6347','#FF4500',
        '#191970','#000080','#191970',
      ],
      holes: [2, 5], // index 2 and 5 are missing
      tray: [
        { id: 'p1', color: '#FFD700' },
        { id: 'p2', color: '#FF4500' },
        { id: 'p3', color: '#228B22' }, // distractor
      ]
    }

    function nextStep() {
      step.value++
      if (step.value === 3) {
        placed.value = false
        animating.value = false
        setTimeout(() => { animating.value = true }, 200)
        setTimeout(() => { placed.value = true }, 1400)
      }
    }

    onUnmounted(() => { if (timer) clearTimeout(timer) })

    return { step, animating, placed, demoStep1, nextStep }
  }
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
}

.tutorial-box {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 1.2em;
  padding: 3vh 3vw;
  width: clamp(280px, 70vmin, 500px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vh;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.tut-title {
  font-size: clamp(15px, 2.5vmin, 24px);
  color: #667eea;
  font-weight: 700;
}

.step-dots {
  display: flex;
  gap: 0.6em;
}
.dot {
  width: 0.7em;
  height: 0.7em;
  border-radius: 50%;
  background: #e0e0e0;
  transition: background 0.3s;
}
.dot.active {
  background: #667eea;
}

.tut-scene {
  width: 100%;
  min-height: clamp(160px, 30vmin, 280px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-step {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;
}

/* Demo board: 3x3 grid */
.demo-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  width: clamp(90px, 18vmin, 160px);
  aspect-ratio: 1;
  border: 3px solid #667eea;
  border-radius: 0.4em;
  padding: 3px;
  background: #f5f7fa;
}

.demo-cell {
  border-radius: 3px;
  transition: background 0.4s;
}

.demo-hole {
  background: rgba(102, 126, 234, 0.1) !important;
  border: 2px dashed rgba(102, 126, 234, 0.5) !important;
  border-radius: 3px;
}

.hole-target {
  border-color: #667eea !important;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.7);
}

.cell-success {
  animation: successPop 0.5s ease-out forwards;
}
@keyframes successPop {
  0% { transform: scale(0.5); opacity: 0.5; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.pulse {
  animation: pulseAnim 1.2s ease-in-out infinite;
}
@keyframes pulseAnim {
  0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(102, 126, 234, 0); }
}

.hint-arrow {
  font-size: clamp(14px, 2.5vmin, 22px);
  color: #999;
}
.anim-bounce {
  animation: bounce 0.8s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.demo-tray {
  display: flex;
  gap: 0.5em;
}
.demo-piece {
  width: clamp(24px, 5vmin, 44px);
  height: clamp(24px, 5vmin, 44px);
  border-radius: 0.3em;
  border: 2px solid #667eea;
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
}
.piece-highlight {
  border-color: #667eea !important;
  box-shadow: 0 0 12px rgba(102, 126, 234, 0.8);
  animation: pieceGlow 0.9s ease-in-out infinite alternate;
}
@keyframes pieceGlow {
  from { transform: scale(1); }
  to { transform: scale(1.12); }
}

/* Flying piece animation */
.drag-demo {
  height: clamp(30px, 6vmin, 55px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.flying-piece {
  width: clamp(24px, 5vmin, 44px);
  height: clamp(24px, 5vmin, 44px);
  border-radius: 0.3em;
  border: 2px solid #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.6);
}
.fly-anim {
  animation: flyUp 1.2s ease-in-out forwards;
}
@keyframes flyUp {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  60% { transform: translateY(-20px) scale(1.1); opacity: 1; }
  100% { transform: translateY(-30px) scale(0.8); opacity: 0; }
}

.success-badge {
  font-size: clamp(24px, 5vmin, 48px);
  color: #4caf50;
  animation: popIn 0.5s ease-out;
}
@keyframes popIn {
  0% { transform: scale(0); }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.step-hint {
  font-size: clamp(12px, 1.8vmin, 17px);
  color: #666;
  text-align: center;
}

/* Navigation */
.tut-nav {
  display: flex;
  gap: 1em;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 0.6em 1.5em;
  border-radius: 0.5em;
  font-size: clamp(12px, 1.8vmin, 16px);
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}
.btn-ghost {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}
.btn-ghost:hover {
  background: #f0f0f0;
}

.btn-accent {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
}
.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(102, 126, 234, 0.6);
}

.skip-btn {
  font-size: clamp(11px, 1.5vmin, 14px);
  opacity: 0.7;
}
</style>
