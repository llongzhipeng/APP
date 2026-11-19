<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tutorial-title">{{ t.tutorialTitle }}</h2>
      <div class="step-dots">
        <span v-for="i in 4" :key="i" class="dot" :class="{ active: step === i - 1 }"></span>
      </div>
      <div class="demo-area">
        <!-- Step 0: Two sides shown -->
        <div v-if="step === 0" class="demo-step">
          <div class="demo-sides">
            <div class="demo-col">
              <div class="demo-card" v-for="i in 2" :key="'l'+i">
                <span class="demo-img-placeholder">{{ ['🐱','🍎'][i-1] }}</span>
              </div>
            </div>
            <div class="demo-vs">VS</div>
            <div class="demo-col">
              <div class="demo-card" v-for="i in 2" :key="'r'+i">
                <span class="demo-img-placeholder">{{ ['🐶','🍊'][i-1] }}</span>
              </div>
            </div>
          </div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '屏幕两侧各有一组图片' : 'Images appear on both sides' }}</p>
        </div>
        <!-- Step 1: Click left item -->
        <div v-if="step === 1" class="demo-step">
          <div class="demo-sides">
            <div class="demo-col">
              <div class="demo-card selected" v-for="i in 2" :key="'l'+i" :class="{ selected: i === 1 }">
                <span class="demo-img-placeholder">{{ ['🐱','🍎'][i-1] }}</span>
              </div>
            </div>
            <div class="demo-vs">⬇</div>
            <div class="demo-col">
              <div class="demo-card" v-for="i in 2" :key="'r'+i">
                <span class="demo-img-placeholder">{{ ['🐶','🍊'][i-1] }}</span>
              </div>
            </div>
          </div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '先点击左侧一张图片（高亮选中）' : 'Click a left image to select it' }}</p>
        </div>
        <!-- Step 2: Click right to match -->
        <div v-if="step === 2" class="demo-step">
          <div class="demo-sides">
            <div class="demo-col">
              <div class="demo-card" :class="{ matched: i === 1 }" v-for="i in 2" :key="'l'+i">
                <span class="demo-img-placeholder">{{ ['🐱','🍎'][i-1] }}</span>
              </div>
            </div>
            <div class="demo-vs">⬇</div>
            <div class="demo-col">
              <div class="demo-card" :class="{ matched: i === 1 }" v-for="i in 2" :key="'r'+i">
                <span class="demo-img-placeholder">{{ ['🐶','🍊'][i-1] }}</span>
              </div>
            </div>
          </div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '再点击右侧关联图片完成配对' : 'Click the matching right image to pair' }}</p>
        </div>
        <!-- Step 3: Score -->
        <div v-if="step === 3" class="demo-step success-step">
          <div class="success-anim">🎉</div>
          <div class="score-preview">+5 {{ lang === 'zh' ? '分' : 'pts' }}</div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '配对正确得分！难度自动调整' : 'Correct match scores! Difficulty auto-adjusts' }}</p>
        </div>
      </div>
      <div class="tutorial-nav">
        <button class="nav-btn" @click="$emit('skip')">{{ t.skip }}</button>
        <div class="nav-arrows">
          <button class="nav-btn arrow-btn" :disabled="step === 0" @click="step--">{{ t.prev }}</button>
          <button class="nav-btn arrow-btn primary" @click="onNext">
            {{ step === 3 ? t.skip : t.next }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String })
const emit = defineEmits(['done', 'skip'])
const t = computed(() => messages[props.lang] || messages.zh)
const step = ref(0)
function onNext() {
  if (step.value < 3) step.value++
  else emit('done')
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.tutorial-box {
  background: linear-gradient(160deg, #0d2137, #060e1a);
  border: 0.2vmin solid rgba(100,180,255,0.3); border-radius: 2vmin;
  padding: 3vmin 4vmin; width: min(65vmin, 92vw);
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.tutorial-title { color: #c8e0f5; font-size: 3vmin; font-weight: 800; }
.step-dots { display: flex; gap: 1.2vmin; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: rgba(255,255,255,0.2); transition: background 0.3s; }
.dot.active { background: #2a6abf; }
.demo-area { width: 100%; min-height: 28vmin; display: flex; align-items: center; justify-content: center; }
.demo-step { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; width: 100%; }
.demo-sides { display: flex; align-items: center; gap: 2vmin; }
.demo-col { display: flex; flex-direction: column; gap: 1vmin; }
.demo-card {
  width: 8vmin; height: 8vmin; border-radius: 1vmin;
  background: rgba(20,50,90,0.8); border: 0.2vmin solid rgba(100,180,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 3.5vmin;
  transition: all 0.3s;
}
.demo-card.selected { border-color: rgba(100,200,255,0.8); background: rgba(30,80,150,0.9); box-shadow: 0 0 1.5vmin rgba(100,200,255,0.5); }
.demo-card.matched { border-color: rgba(100,220,100,0.8); background: rgba(20,80,30,0.9); }
.demo-vs { font-size: 2.5vmin; color: rgba(200,224,245,0.6); font-weight: 700; }
.demo-hint-text { font-size: 2vmin; color: rgba(200,224,245,0.8); text-align: center; }
.success-step { gap: 2vmin; }
.success-anim { font-size: 8vmin; animation: pop 0.6s ease-out; }
@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
.score-preview { font-size: 4vmin; font-weight: 900; color: #ffd700; text-shadow: 0 0 2vmin rgba(255,215,0,0.5); }
.tutorial-nav { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 1vmin; }
.nav-arrows { display: flex; gap: 1.5vmin; }
.nav-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: rgba(255,255,255,0.08); border: 0.2vmin solid rgba(255,255,255,0.15);
  color: #c8e0f5; transition: all 0.2s; font-weight: 600;
}
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.15); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.arrow-btn.primary { background: linear-gradient(135deg, #1a4a8a, #2a6abf); border-color: rgba(100,180,255,0.4); }
.nav-btn.arrow-btn.primary:hover { background: linear-gradient(135deg, #2a5a9a, #3a7acf); }
</style>
