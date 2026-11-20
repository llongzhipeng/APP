<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tutorial-title">{{ t.tutorialTitle }}</h2>
      <div class="step-dots">
        <span v-for="i in 3" :key="i" class="dot" :class="{ active: step === i - 1 }"></span>
      </div>
      <div class="demo-area">
        <!-- Step 0: 4 images, 3 same + 1 different type -->
        <div v-if="step === 0" class="demo-step">
          <div class="demo-grid">
            <div v-for="(card, i) in demoCards0" :key="i" class="demo-card" :class="{ odd: card.odd }">
              <span class="demo-emoji">{{ card.emoji }}</span>
              <span v-if="card.odd" class="odd-badge">?</span>
            </div>
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '4张图中有1张与其他不同，点击找出它！' : '1 of 4 images differs — tap to find it!' }}</p>
        </div>
        <!-- Step 1: click feedback -->
        <div v-if="step === 1" class="demo-step">
          <div class="demo-grid">
            <div v-for="(card, i) in demoCards0" :key="i" class="demo-card"
              :class="{ correct: card.odd && clicked, wrong: !card.odd && i === wrongIdx && clicked }">
              <span class="demo-emoji">{{ card.emoji }}</span>
              <span v-if="card.odd && clicked" class="result-mark">✓</span>
              <span v-if="!card.odd && i === wrongIdx && clicked" class="result-mark wrong-mark">✗</span>
            </div>
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '答对得分！难度自动调整' : 'Correct = score! Difficulty auto-adjusts' }}</p>
        </div>
        <!-- Step 2: difficulty levels -->
        <div v-if="step === 2" class="demo-step levels-step">
          <div class="level-list">
            <div v-for="row in levelHints" :key="row.level" class="level-row">
              <span class="lv-badge">{{ row.level }}</span>
              <span class="lv-desc">{{ row.desc }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tutorial-nav">
        <button class="nav-btn" @click="$emit('skip')">{{ t.skip }}</button>
        <div class="nav-arrows">
          <button class="nav-btn" :disabled="step === 0" @click="step--">{{ t.prev }}</button>
          <button class="nav-btn primary" @click="onNext">{{ step === 2 ? t.skip : t.next }}</button>
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
const clicked = ref(false)
const wrongIdx = 0
const hintStep0 = '\u0034\u5F20\u56FE\u7247\u4E2D\u6709\u0031\u5F20\u4E0E\u5176\u4ED6\u4E0D\u540C\uFF0C\u70B9\u51FB\u627E\u51FA\u6765\uFF01'
const hintStep1 = '\u7B54\u5BF9\u5F97\u5206\uFF01\u96BE\u5EA6\u81EA\u52A8\u8C03\u6574'

const demoCards0 = [
  { emoji: '\uD83D\uDC1F', odd: false },
  { emoji: '\uD83D\uDC1F', odd: false },
  { emoji: '\uD83D\uDC21', odd: true },
  { emoji: '\uD83D\uDC1F', odd: false },
]

const levelHints = computed(() => props.lang === 'zh'
  ? [
    { level: 1, desc: '\u4E0D\u540C\u79CD\u7C7B' },
    { level: 2, desc: '\u4E0D\u540C\u79CD\u7C7B+\u7FFB\u8F6C' },
    { level: 3, desc: '3\u5904\u4EE5\u4E0A\u4E0D\u540C' },
    { level: 4, desc: '3\u5904\u4E0D\u540C' },
    { level: 5, desc: '2\u5904\u4E0D\u540C' },
    { level: 6, desc: '1\u5904\u4E0D\u540C' },
  ]
  : [
    { level: 1, desc: 'Different type' },
    { level: 2, desc: 'Different type + flipped' },
    { level: 3, desc: '3+ differences' },
    { level: 4, desc: '3 differences' },
    { level: 5, desc: '2 differences' },
    { level: 6, desc: '1 difference' },
  ]
)

function onNext() {
  if (step.value === 1) clicked.value = true
  if (step.value < 2) {
    step.value++
  } else {
    emit('done')
  }
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.tutorial-box {
  background: linear-gradient(160deg, #0d2137, #060e1a);
  border: 0.2vmin solid rgba(100,200,255,0.3);
  border-radius: 2vmin;
  padding: 3vmin 4vmin;
  width: min(60vmin, 90vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.tutorial-title { color: #c8e6ff; font-size: 3vmin; font-weight: 800; }
.step-dots { display: flex; gap: 1.2vmin; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: rgba(255,255,255,0.25); transition: background 0.3s; }
.dot.active { background: #2a8ac4; }
.demo-area { width: 100%; min-height: 28vmin; display: flex; align-items: center; justify-content: center; }
.demo-step { display: flex; flex-direction: column; align-items: center; gap: 2vmin; width: 100%; }
.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5vmin;
}
.demo-card {
  width: 10vmin; height: 10vmin;
  border-radius: 1.5vmin;
  background: rgba(20,50,80,0.8);
  border: 0.3vmin solid rgba(100,200,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5vmin;
  position: relative;
  transition: all 0.3s;
}
.demo-card.odd { border-color: rgba(255,200,50,0.5); }
.demo-card.correct { background: rgba(30,100,40,0.8); border-color: rgba(76,175,80,0.6); }
.demo-card.wrong { background: rgba(100,30,30,0.8); border-color: rgba(244,67,54,0.6); }
.odd-badge {
  position: absolute;
  top: 0.3vmin; right: 0.5vmin;
  font-size: 1.8vmin;
  color: #ffd700;
  font-weight: 900;
}
.result-mark {
  position: absolute;
  font-size: 4vmin;
  font-weight: 900;
  color: #4caf50;
}
.result-mark.wrong-mark { color: #ef5350; }
.demo-hint { font-size: 2vmin; color: rgba(200,230,255,0.8); text-align: center; }
.levels-step { gap: 1vmin; }
.level-list { display: flex; flex-direction: column; gap: 1vmin; width: 100%; }
.level-row { display: flex; align-items: center; gap: 2vmin; padding: 0.8vmin 1.5vmin; background: rgba(255,255,255,0.04); border-radius: 0.8vmin; }
.lv-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3vmin; height: 3vmin;
  border-radius: 50%;
  background: rgba(42,138,196,0.5);
  color: #64c8ff;
  font-weight: 800;
  font-size: 1.6vmin;
  flex-shrink: 0;
}
.lv-desc { color: rgba(200,230,255,0.8); font-size: 1.8vmin; }
.tutorial-nav { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 1vmin; }
.nav-arrows { display: flex; gap: 1.5vmin; }
.nav-btn {
  padding: 1.2vmin 2.5vmin;
  font-size: 1.8vmin;
  border-radius: 1vmin;
  cursor: pointer;
  background: rgba(255,255,255,0.1);
  border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #c8e6ff;
  transition: all 0.2s;
  font-weight: 600;
}
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.primary {
  background: linear-gradient(135deg, #1a5a8a, #2a8ac4);
  border-color: rgba(100,200,255,0.4);
}
.nav-btn.primary:hover { background: linear-gradient(135deg, #2a6a9a, #3a9ad4); }
</style>
