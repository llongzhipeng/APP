<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tutorial-title">{{ t.tutorialTitle }}</h2>
      <div class="step-dots">
        <span v-for="i in 4" :key="i" class="dot" :class="{ active: step === i - 1 }"></span>
      </div>

      <div class="demo-area">
        <!-- Step 0: Show images with labels -->
        <div v-if="step === 0" class="demo-step">
          <div class="demo-images">
            <div v-for="item in demoItems.slice(0,3)" :key="item.name" class="demo-img-card">
              <img :src="itemImage(item.name)" :alt="item.label" />
            </div>
          </div>
          <div class="demo-arrow">⬇</div>
          <p class="demo-hint">{{ lang === 'zh' ? '屏幕上显示物体图片' : 'Object images appear on screen' }}</p>
        </div>

        <!-- Step 1: Word cards below -->
        <div v-if="step === 1" class="demo-step">
          <div class="demo-images">
            <div v-for="item in demoItems.slice(0,3)" :key="item.name" class="demo-img-card">
              <img :src="itemImage(item.name)" :alt="item.label" />
            </div>
          </div>
          <div class="demo-arrow">⬇</div>
          <div class="demo-cards">
            <div v-for="item in shuffledDemo" :key="item.name" class="demo-word-card">{{ item.label }}</div>
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '下方出现词语卡片' : 'Word cards appear below' }}</p>
        </div>

        <!-- Step 2: Drag to match -->
        <div v-if="step === 2" class="demo-step">
          <div class="demo-images">
            <div v-for="(item, idx) in demoItems.slice(0,3)" :key="item.name" class="demo-img-card" :class="{ matched: dragStep > idx }">
              <img :src="itemImage(item.name)" :alt="item.label" />
              <div v-if="dragStep > idx" class="match-badge">{{ item.label }}</div>
            </div>
          </div>
          <div class="drag-hint-row">
            <span class="drag-emoji">👆</span>
            <span class="drag-arrow">→</span>
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '将词语卡片拖拽到对应图片上' : 'Drag word cards to matching images' }}</p>
        </div>

        <!-- Step 3: Correct feedback -->
        <div v-if="step === 3" class="demo-step success-step">
          <div class="success-anim">🎉</div>
          <div class="score-preview">+{{ lang === 'zh' ? '5 分' : '5 pts' }}</div>
          <p class="demo-hint">{{ lang === 'zh' ? '答对得分！难度自动调整' : 'Score earned! Difficulty auto-adjusts' }}</p>
        </div>
      </div>

      <div class="tutorial-nav">
        <button class="nav-btn" @click="$emit('skip')">{{ t.skip }}</button>
        <div class="nav-arrows">
          <button class="nav-btn" :disabled="step === 0" @click="step--">{{ t.prev }}</button>
          <button class="nav-btn primary" @click="onNext">{{ step === 3 ? t.skip : t.next }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from '@vue/composition-api'
import messages from '../i18n.js'
import { itemImage } from '../../utils/images'

const props = defineProps({ lang: String })
const emit = defineEmits(['done', 'skip'])
const t = computed(() => messages[props.lang] || messages.zh)
const step = ref(0)

const demoItems = [
  { name: 'apple', label: props.lang === 'en' ? 'apple' : '苹果' },
  { name: 'banana', label: props.lang === 'en' ? 'banana' : '香蕉' },
  { name: 'cat', label: props.lang === 'en' ? 'cat' : '猫' },
]
const shuffledDemo = [...demoItems].sort(() => Math.random() - 0.5)

const dragStep = ref(0)
let animTimer = null

function startAnim() {
  clearInterval(animTimer)
  dragStep.value = 0
  if (step.value === 2) {
    animTimer = setInterval(() => {
      dragStep.value++
      if (dragStep.value >= 3) clearInterval(animTimer)
    }, 700)
  }
}

watch(step, startAnim)
onMounted(startAnim)
onUnmounted(() => clearInterval(animTimer))

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
  background: linear-gradient(160deg, #0a1e35, #061525);
  border: 0.2vmin solid rgba(100,200,255,0.3); border-radius: 2vmin;
  padding: 3vmin 4vmin; width: min(65vmin, 92vw);
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.tutorial-title { color: #e8f4ff; font-size: 3vmin; font-weight: 800; }
.step-dots { display: flex; gap: 1.2vmin; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: rgba(255,255,255,0.25); transition: background 0.3s; }
.dot.active { background: #2d9cdb; }
.demo-area { width: 100%; min-height: 30vmin; display: flex; align-items: center; justify-content: center; }
.demo-step { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; width: 100%; }
.demo-images { display: flex; gap: 2vmin; justify-content: center; }
.demo-img-card {
  width: 10vmin; height: 10vmin; border-radius: 1.5vmin;
  background: rgba(255,255,255,0.08); border: 0.2vmin solid rgba(100,200,255,0.3);
  display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
  transition: all 0.3s;
}
.demo-img-card.matched { border-color: rgba(100,255,150,0.6); background: rgba(50,200,100,0.15); }
.demo-img-card img { width: 80%; height: 80%; object-fit: contain; }
.match-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(50,200,100,0.85); color: #fff; font-size: 1.4vmin; font-weight: 700;
  text-align: center; padding: 0.3vmin;
}
.demo-cards { display: flex; gap: 1.5vmin; flex-wrap: wrap; justify-content: center; }
.demo-word-card {
  padding: 0.8vmin 1.8vmin; background: linear-gradient(135deg, #1a6bb5, #2d9cdb);
  border-radius: 1vmin; color: #fff; font-size: 1.8vmin; font-weight: 700;
  border: 0.15vmin solid rgba(100,200,255,0.4);
}
.demo-arrow { font-size: 3vmin; color: rgba(232,244,255,0.5); animation: bounce 1s ease-in-out infinite; }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(0.5vmin)} }
.drag-hint-row { display: flex; align-items: center; gap: 1vmin; font-size: 4vmin; }
.drag-arrow { font-size: 3vmin; color: rgba(232,244,255,0.6); }
.demo-hint { font-size: 2vmin; color: rgba(232,244,255,0.8); text-align: center; }
.success-step { gap: 2vmin; }
.success-anim { font-size: 8vmin; animation: pop 0.6s ease-out; }
@keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
.score-preview { font-size: 4vmin; font-weight: 900; color: #ffd700; text-shadow: 0 0 2vmin rgba(255,215,0,0.5); }
.tutorial-nav { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 1vmin; }
.nav-arrows { display: flex; gap: 1.5vmin; }
.nav-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #e8f4ff; transition: all 0.2s; font-weight: 600;
}
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.primary { background: linear-gradient(135deg, #1a6bb5, #2d9cdb); border-color: rgba(100,200,255,0.4); }
.nav-btn.primary:hover { background: linear-gradient(135deg, #2080cc, #3aafe8); }
</style>
