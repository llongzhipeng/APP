<template>
  <div class="overlay">
    <div class="box">
      <h2 class="title">{{ t.tutorialTitle }}</h2>
      <div class="step-dots">
        <span v-for="i in 4" :key="i" class="dot" :class="{ active: step === i - 1 }"></span>
      </div>
      <div class="demo-area">
        <!-- Step 0: Show faces to remember -->
        <div v-if="step === 0" class="demo-step">
          <div class="face-row">
            <div v-for="i in 2" :key="i" class="face-card show">
              <img :src="faceImage(i)" class="face-img" />
            </div>
          </div>
          <div class="arrow">⬇</div>
          <p class="hint">{{ lang === 'zh' ? '记住这些面孔！' : 'Remember these faces!' }}</p>
        </div>
        <!-- Step 1: Faces hidden -->
        <div v-if="step === 1" class="demo-step">
          <div class="face-row">
            <div v-for="i in 2" :key="i" class="face-card hidden">
              <span class="question">?</span>
            </div>
          </div>
          <div class="arrow">⬇</div>
          <p class="hint">{{ lang === 'zh' ? '面孔消失了！回忆一下' : 'Faces hidden! Try to recall' }}</p>
        </div>
        <!-- Step 2: Judge if face appeared -->
        <div v-if="step === 2" class="demo-step">
          <p class="judge-label">{{ lang === 'zh' ? '这张面孔出现过吗？' : 'Did this face appear?' }}</p>
          <div class="face-card show single">
            <img :src="faceImage(1)" class="face-img" />
          </div>
          <div class="btn-row">
            <div class="demo-btn yes-btn">{{ lang === 'zh' ? '是' : 'Yes' }}</div>
            <div class="demo-btn no-btn">{{ lang === 'zh' ? '否' : 'No' }}</div>
          </div>
          <p class="hint">{{ lang === 'zh' ? '判断该面孔是否出现过' : 'Judge if this face appeared' }}</p>
        </div>
        <!-- Step 3: Score -->
        <div v-if="step === 3" class="demo-step success-step">
          <div class="success-icon">🎉</div>
          <div class="score-text">+10 {{ lang === 'zh' ? '分' : 'pts' }}</div>
          <p class="hint">{{ lang === 'zh' ? '答对得分！难度自动调整' : 'Correct! Difficulty auto-adjusts' }}</p>
        </div>
      </div>
      <div class="nav">
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
import { ref, computed } from '@vue/composition-api'
import messages from '../i18n.js'
import { faceImage } from '../../utils/images'
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
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.box {
  background: linear-gradient(160deg, #0e1a30, #060e1a);
  border: 0.2vmin solid rgba(100,150,255,0.3); border-radius: 2vmin;
  padding: 3vmin 4vmin; width: min(65vmin, 92vw);
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.title { color: #e8f0ff; font-size: 3vmin; font-weight: 800; }
.step-dots { display: flex; gap: 1.2vmin; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: rgba(255,255,255,0.25); transition: background 0.3s; }
.dot.active { background: #4a7acc; }
.demo-area { width: 100%; min-height: 28vmin; display: flex; align-items: center; justify-content: center; }
.demo-step { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; width: 100%; }
.face-row { display: flex; gap: 2vmin; justify-content: center; }
.face-card {
  width: 10vmin; height: 10vmin; border-radius: 1.5vmin;
  border: 0.3vmin solid rgba(100,150,255,0.4);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.face-card.show { background: rgba(30,50,100,0.6); }
.face-card.hidden { background: rgba(10,20,40,0.8); border-color: rgba(100,150,255,0.2); }
.face-card.single { width: 12vmin; height: 12vmin; }
.face-img { width: 100%; height: 100%; object-fit: cover; border-radius: 1vmin; }
.question { font-size: 5vmin; color: rgba(100,150,255,0.4); font-weight: 900; }
.arrow { font-size: 3vmin; color: rgba(200,220,255,0.5); animation: bounce 1s ease-in-out infinite; }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(0.5vmin)} }
.hint { font-size: 2vmin; color: rgba(200,220,255,0.8); text-align: center; }
.judge-label { font-size: 2.2vmin; color: #e8f0ff; font-weight: 700; }
.btn-row { display: flex; gap: 2vmin; }
.demo-btn {
  padding: 1.2vmin 3vmin; font-size: 2vmin; font-weight: 700; border-radius: 1vmin;
  cursor: default;
}
.yes-btn { background: linear-gradient(135deg, #1a5c2a, #2e9c4a); color: #e8f0ff; }
.no-btn { background: linear-gradient(135deg, #5c1a1a, #9c2e2e); color: #e8f0ff; }
.success-step { gap: 2vmin; }
.success-icon { font-size: 8vmin; animation: pop 0.6s ease-out; }
@keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
.score-text { font-size: 4vmin; font-weight: 900; color: #ffd700; text-shadow: 0 0 2vmin rgba(255,215,0,0.5); }
.nav { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 1vmin; }
.nav-arrows { display: flex; gap: 1.5vmin; }
.nav-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #e8f0ff; transition: all 0.2s; font-weight: 600;
}
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.primary { background: linear-gradient(135deg, #2a4a8a, #4a7acc); border-color: rgba(100,150,255,0.4); }
.nav-btn.primary:hover { background: linear-gradient(135deg, #3a5a9a, #5a8adc); }
</style>
