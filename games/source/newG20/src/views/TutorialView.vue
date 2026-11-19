<template>
  <div class="tutorial">
    <div class="card">
      <h2>{{ t.tutorialTitle }} ({{ step }}/{{ totalSteps }})</h2>

      <div class="demo-area">
        <div class="demo-grid" :style="gridStyle">
          <div
            v-for="(cell, i) in flatCells"
            :key="i"
            class="demo-cell"
            :class="{
              obstacle: cell.type === 3 && (step >= 3),
              highlight: cell.highlight,
              path: cell.onPath
            }"
          >
            <img v-if="cell.type === 1 && step >= 1" :src="resolveImage('/images/1.png')" class="cell-img"/>
            <img v-if="cell.type === 2 && step >= 2" :src="resolveImage('/images/2.png')" class="cell-img"/>
            <img v-if="cell.type === 4 && step >= 2" :src="resolveImage('/images/4.png')" class="cell-img"/>
            <img v-if="cell.hasTruck && cell.type === 0" :src="resolveImage('/images/3.png')" class="cell-img truck" :class="{ 'face-right': cell.faceRight }"/>
            <span v-if="cell.checkmark" class="checkmark">✓</span>
          </div>
        </div>
      </div>

      <div class="step-text">{{ stepText }}</div>

      <div class="tutorial-buttons">
        <button class="tut-btn" @click="prev" :disabled="step === 1">{{ t.prev }}</button>
        <button class="tut-btn skip" @click="skip">{{ t.skip }}</button>
        <button v-if="step < totalSteps" class="tut-btn primary" @click="next">{{ t.next }}</button>
        <button v-else class="tut-btn primary" @click="$emit('done')">{{ t.startNow }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
export default {
  name: 'TutorialView',
  props: ['t'],
  data() {
    return {
      step: 1,
      totalSteps: 5,
      rows: 4,
      cols: 5,
      warehouse: { r: 3, c: 0 },
      endpoint: { r: 0, c: 0 },
      deliveries: [{ r: 0, c: 2 }, { r: 1, c: 4 }],
      obstacles: [{ r: 2, c: 2 }, { r: 2, c: 3 }],
      demoPath: [
        { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 },
        { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 2, c: 4 },
        { r: 1, c: 4 }, { r: 1, c: 3 }, { r: 1, c: 2 },
        { r: 0, c: 2 }, { r: 0, c: 1 }, { r: 0, c: 0 }
      ],
      pathIdx: 0,
      animTimer: null
    }
  },
  computed: {
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.cols}, 1fr)`,
        gridTemplateRows: `repeat(${this.rows}, 1fr)`
      }
    },
    stepText() {
      return this.t['tutorialStep' + this.step]
    },
    flatCells() {
      const cells = []
      const pathSoFar = this.demoPath.slice(0, this.pathIdx + 1)
      const pathSet = new Set(pathSoFar.map(p => p.r + ',' + p.c))
      const currentTruckPos = this.step >= 4 ? this.demoPath[this.pathIdx] : this.warehouse
      // Determine facing from last horizontal move
      let faceRight = false
      if (this.step >= 4) {
        for (let i = this.pathIdx; i >= 1; i--) {
          const dc = this.demoPath[i].c - this.demoPath[i - 1].c
          if (dc > 0) { faceRight = true; break }
          if (dc < 0) { faceRight = false; break }
        }
      }
      const visited = new Set()
      if (this.step >= 4) {
        pathSoFar.forEach(p => {
          if (this.deliveries.some(d => d.r === p.r && d.c === p.c)) {
            visited.add(p.r + ',' + p.c)
          }
        })
      }
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          let type = 0
          if (this.warehouse.r === r && this.warehouse.c === c) type = 1
          else if (this.endpoint.r === r && this.endpoint.c === c) type = 4
          else if (this.deliveries.some(d => d.r === r && d.c === c)) type = 2
          else if (this.obstacles.some(o => o.r === r && o.c === c)) type = 3

          const hasTruck = this.step >= 1 && currentTruckPos.r === r && currentTruckPos.c === c
          const onPath = this.step >= 4 && pathSet.has(r + ',' + c) && type === 0
          const checkmark = this.step >= 4 && type === 2 && visited.has(r + ',' + c)

          let highlight = false
          if (this.step === 1 && type === 1) highlight = true
          if (this.step === 2 && (type === 2 || type === 4)) highlight = true
          if (this.step === 3 && type === 3) highlight = true

          cells.push({ type, hasTruck, onPath, checkmark, highlight, faceRight })
        }
      }
      return cells
    }
  },
  watch: {
    step(newStep) {
      this.stopAnim()
      if (newStep >= 4) {
        this.pathIdx = 0
        this.startAnim()
      } else {
        this.pathIdx = 0
      }
    }
  },
  beforeDestroy() { this.stopAnim() },
  methods: { resolveImage,
    next() { if (this.step < this.totalSteps) this.step++ },
    prev() { if (this.step > 1) this.step-- },
    skip() { this.$emit('done') },
    startAnim() {
      this.animTimer = setInterval(() => {
        if (this.pathIdx < this.demoPath.length - 1) {
          this.pathIdx++
        } else {
          setTimeout(() => { this.pathIdx = 0 }, 1500)
        }
      }, 500)
    },
    stopAnim() {
      if (this.animTimer) { clearInterval(this.animTimer); this.animTimer = null }
    }
  }
}
</script>

<style scoped>
.tutorial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
  background: rgba(0,0,0,0.5);
}
.card {
  background: #fff;
  border-radius: 3vmin;
  padding: 4vmin 5vmin;
  max-width: 90vw;
  box-shadow: 0 4vmin 8vmin rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 { text-align: center; color: #2c3e50; margin-bottom: 3vmin; font-size: 3.2vmin; }
.demo-area {
  display: flex;
  justify-content: center;
  margin-bottom: 3vmin;
}
.demo-grid {
  display: grid;
  gap: 0.5vmin;
  background: #d4c199;
  padding: 1vmin;
  border-radius: 1.5vmin;
  width: 60vmin;
  max-width: 80vw;
  aspect-ratio: 5 / 4;
}
.demo-cell {
  background: #f4e8d0;
  border-radius: 0.8vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s;
}
.demo-cell.obstacle { background: #6b5b73; }
.demo-cell.highlight {
  background: #fff3a8;
  box-shadow: 0 0 2vmin rgba(255, 215, 0, 0.8);
  animation: pulse 1s ease-in-out infinite;
}
.demo-cell.path { background: #ffdfa8; }
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.cell-img { width: 80%; height: 80%; object-fit: contain; }
.cell-img.truck { z-index: 2; transition: all 0.4s ease; }
.cell-img.truck.face-right { transform: scaleX(-1); }
.checkmark {
  position: absolute;
  top: 0.4vmin;
  right: 0.8vmin;
  color: #4caf50;
  font-weight: bold;
  font-size: 2.6vmin;
  text-shadow: 0 0 0.5vmin white;
}
.step-text {
  text-align: center;
  font-size: 2.4vmin;
  color: #34495e;
  padding: 2vmin 3vmin;
  background: #f5f7fa;
  border-radius: 1.5vmin;
  margin-bottom: 3vmin;
  min-height: 6vmin;
  min-width: 40vmin;
  max-width: 80vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}
.tutorial-buttons { display: flex; justify-content: center; gap: 2vmin; flex-wrap: wrap; }
.tut-btn {
  padding: 1.4vmin 3vmin;
  border: none;
  border-radius: 999px;
  font-size: 2.2vmin;
  cursor: pointer;
  font-weight: 600;
  background: #ecf0f1;
  color: #2c3e50;
  transition: all 0.15s;
  min-width: 14vmin;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}
.tut-btn:focus { outline: none; }
@media (hover: hover) {
  .tut-btn:hover:not(:disabled) { background: #dfe6e9; }
  .tut-btn.skip:hover { color: #7f8c8d; }
  .tut-btn.primary:hover { transform: translateY(-0.3vmin); box-shadow: 0 1vmin 2vmin rgba(255,106,61,0.5); }
}
.tut-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tut-btn.skip { background: transparent; color: #95a5a6; }
.tut-btn.primary,
.tut-btn.primary:focus,
.tut-btn.primary:active {
  background: linear-gradient(135deg, #ff9a56, #ff6a3d);
  color: #fff;
  box-shadow: 0 0.6vmin 1.5vmin rgba(255,106,61,0.35);
}

@media (orientation: portrait) {
  .tutorial {
    padding: 3vmin;
    padding-top: calc(3vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
    align-items: flex-start;
  }
  .card {
    padding: 5vmin 4vmin;
    width: 92vw;
    max-width: 92vw;
    border-radius: 3vmin;
  }
  h2 { font-size: max(4.4vmin, 18px); margin-bottom: 3vmin; }
  .demo-grid { width: 80vw; max-width: 80vw; }
  .step-text {
    font-size: max(3.6vmin, 15px);
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 2.4vmin 2.4vmin;
    min-height: 8vmin;
    border-radius: 2vmin;
  }
  .checkmark { font-size: max(3.6vmin, 14px); }
  .tutorial-buttons { gap: 2vmin; width: 100%; }
  .tut-btn {
    font-size: max(3.6vmin, 15px);
    padding: 2.2vmin 3.4vmin;
    min-width: 26vw;
    border-radius: 2.4vmin;
  }
}
</style>
