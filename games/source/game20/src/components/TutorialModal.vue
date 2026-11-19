<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="step-indicator">{{ step + 1 }} / {{ steps.length }}</div>
      <div class="tutorial-content">
        <div class="tutorial-scene">
          <!-- Step 0: Show target at bottom, items in grid -->
          <template v-if="step === 0">
            <p class="hint-text">{{ lang === 'zh' ? '屏幕下方显示目标物' : 'Target shown at bottom' }}</p>
            <div class="demo-grid">
              <div v-for="i in 6" :key="i" class="demo-item" :class="{highlight: i===2}">
                <img :src="demoImgs[i-1]" />
              </div>
            </div>
            <div class="demo-target">
              <span class="target-label">{{ lang === 'zh' ? '目标物' : 'Target' }}</span>
              <img :src="demoImgs[1]" class="target-img" />
            </div>
          </template>
          <!-- Step 1: Click matching item -->
          <template v-if="step === 1">
            <p class="hint-text">{{ lang === 'zh' ? '点击与目标物相同的物品' : 'Click items matching the target' }}</p>
            <div class="demo-grid">
              <div v-for="i in 6" :key="i" class="demo-item" :class="{correct: i===2, pulse: i===2}">
                <img :src="demoImgs[i-1]" />
                <div v-if="i===2" class="click-hint">👆</div>
              </div>
            </div>
            <div class="demo-target">
              <span class="target-label">{{ lang === 'zh' ? '目标物' : 'Target' }}</span>
              <img :src="demoImgs[1]" class="target-img" />
            </div>
          </template>
          <!-- Step 2: Multiple targets -->
          <template v-if="step === 2">
            <p class="hint-text">{{ lang === 'zh' ? '高难度时有多个目标物需要找出' : 'Higher levels have multiple targets' }}</p>
            <div class="demo-grid demo-grid-lg">
              <div v-for="i in 11" :key="i" class="demo-item" :class="{correct: i===2||i===7}">
                <img :src="demoImgs2[i-1]" />
              </div>
            </div>
            <div class="demo-target multi">
              <span class="target-label">{{ lang === 'zh' ? '目标物' : 'Target' }}</span>
              <img :src="demoImgs2[1]" class="target-img" />
              <img :src="demoImgs2[6]" class="target-img" />
            </div>
          </template>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn-skip" @click="$emit('skip')">{{ t.skip }}</button>
        <button v-if="step > 0" class="btn-nav" @click="step--">{{ t.prev }}</button>
        <button v-if="step < steps.length - 1" class="btn-nav primary" @click="step++">{{ t.next }}</button>
        <button v-else class="btn-nav primary" @click="$emit('done')">{{ t.confirmStart }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
import { elementImage } from '../../utils/images'
const CATS = ['animal','botany','electric_appliance','fruits','furniture','metal','nonmetal','vegetable']
const CAT_COUNTS = { animal:10, botany:10, electric_appliance:10, fruits:10, furniture:10, metal:20, nonmetal:10, vegetable:10 }
function imgPath(cat, n) {
  const file = cat === 'animal' ? String(n).padStart(2, '0') : n
  return elementImage(cat, file)
}
function demoSet(cat, indices) {
  return indices.map(n => imgPath(cat, n))
}
export default {
  props: { lang: String },
  emits: ['done', 'skip'],
  data() {
    return {
      step: 0,
      steps: [0, 1, 2],
      demoImgs: demoSet('animal', [3,1,5,7,9,2]),
      demoImgs2: demoSet('fruits', [33,31,35,37,39,32,31,36,38,34,40]),
    }
  },
  computed: { t() { return messages[this.lang] || messages.zh } },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: linear-gradient(135deg, #0d2b4e, #0a1e35);
  border: 0.2vmin solid rgba(100,180,255,0.3);
  border-radius: 2vmin; padding: 3vmin 4vmin;
  width: 70vmin; max-width: 90vw;
  display: flex; flex-direction: column; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.step-indicator { color: rgba(200,224,255,0.5); font-size: 1.8vmin; text-align: center; }
.tutorial-content { min-height: 40vmin; display: flex; align-items: center; justify-content: center; }
.tutorial-scene { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 2vmin; }
.hint-text { color: #c8e0ff; font-size: 2.2vmin; text-align: center; }
.demo-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5vmin; width: 100%;
}
.demo-grid-lg { grid-template-columns: repeat(4, 1fr); }
.demo-item {
  background: rgba(255,255,255,0.08); border-radius: 1vmin;
  border: 0.2vmin solid rgba(255,255,255,0.1);
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.demo-item img { width: 80%; height: 80%; object-fit: contain; }
.demo-item.highlight { border-color: rgba(100,180,255,0.6); background: rgba(100,180,255,0.15); }
.demo-item.correct { border-color: #4caf50; background: rgba(76,175,80,0.2); }
.demo-item.pulse { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
.click-hint { position: absolute; bottom: 0.5vmin; right: 0.5vmin; font-size: 2vmin; }
.demo-target {
  display: flex; align-items: center; gap: 1.5vmin;
  background: rgba(255,255,255,0.08); border-radius: 1.5vmin;
  padding: 1vmin 2vmin; border: 0.2vmin solid rgba(100,180,255,0.3);
}
.demo-target.multi { gap: 2vmin; }
.target-label { color: #64b4ff; font-size: 1.8vmin; font-weight: 700; }
.target-img { width: 6vmin; height: 6vmin; object-fit: contain; }
.btn-row { display: flex; gap: 1.5vmin; justify-content: center; }
.btn-skip {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: transparent; border: 0.2vmin solid rgba(255,255,255,0.2); color: rgba(200,224,255,0.6);
}
.btn-nav {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: rgba(20,60,100,0.8); border: 0.2vmin solid rgba(100,180,255,0.3); color: #c8e0ff;
}
.btn-nav.primary { background: linear-gradient(135deg, #1a5fa8, #2e8fd4); border-color: rgba(100,180,255,0.5); }
.btn-nav:hover { opacity: 0.85; }
</style>
