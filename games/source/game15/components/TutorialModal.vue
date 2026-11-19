<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tutorial-title">{{ t.tutorialTitle }}</h2>

      <!-- Step indicator -->
      <div class="step-dots">
        <span
          v-for="i in totalSteps"
          :key="i"
          class="dot"
          :class="{ active: step === i - 1 }"
        ></span>
      </div>

      <!-- Visual demo area -->
      <div class="demo-area">
        <!-- Step 0: Only fossil stones appear -->
        <div v-if="step === 0" class="demo-step">
          <div class="demo-grid" :style="{ gridTemplateColumns: 'repeat(3, 1fr)' }">
            <div
              v-for="(cell, idx) in step0Grid"
              :key="idx"
              class="demo-cell"
              :class="cell.isFossil ? 'stone-visible' : ''"
            >
              <svg v-if="cell.isFossil" viewBox="0 0 100 100" class="stone-icon">
                <ellipse cx="50" cy="60" rx="42" ry="32" fill="#8B8680" stroke="#5C5650" stroke-width="3" />
                <ellipse cx="50" cy="55" rx="38" ry="28" fill="#A09890" />
                <ellipse cx="40" cy="48" rx="12" ry="8" fill="#B8B0A8" opacity="0.6" />
              </svg>
            </div>
          </div>
          <div class="demo-arrow">⬇</div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '记住化石的位置！' : 'Remember the fossil positions!' }}</p>
        </div>

        <!-- Step 1: Fossils disappear -->
        <div v-if="step === 1" class="demo-step">
          <div class="demo-grid" :style="{ gridTemplateColumns: 'repeat(3, 1fr)' }">
            <div
              v-for="(cell, idx) in step0Grid"
              :key="idx"
              class="demo-cell"
            >
            </div>
          </div>
          <div class="demo-arrow">⬇</div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '化石消失了！回忆位置' : 'Fossils disappeared! Recall positions' }}</p>
        </div>

        <!-- Step 2: Player clicks fossil positions -->
        <div v-if="step === 2" class="demo-step">
          <div class="demo-grid" :style="{ gridTemplateColumns: 'repeat(3, 1fr)' }">
            <div
              v-for="(cell, idx) in step0Grid"
              :key="idx"
              class="demo-cell"
              :class="{
                'hit-correct': cell.isFossil && hitStep >= idx + 1,
                'hit-wrong': !cell.isFossil && idx === wrongHitIdx && hitStep > 5
              }"
            >
              <svg v-if="cell.isFossil && hitStep >= idx + 1" viewBox="0 0 100 100" class="stone-icon">
                <ellipse cx="50" cy="60" rx="42" ry="32" fill="#8B8680" stroke="#5C5650" stroke-width="3" />
                <ellipse cx="50" cy="55" rx="38" ry="28" fill="#A09890" />
                <ellipse cx="40" cy="48" rx="12" ry="8" fill="#B8B0A8" opacity="0.6" />
              </svg>
              <span v-if="cell.isFossil && hitStep >= idx + 1" class="check-mark">✓</span>
              <span v-if="!cell.isFossil && idx === wrongHitIdx && hitStep > 5" class="x-mark">✗</span>
            </div>
          </div>
          <div class="shovel-anim">🥄</div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '用铲子点击化石消失的位置' : 'Click where the fossils disappeared!' }}</p>
        </div>

        <!-- Step 3: Success -->
        <div v-if="step === 3" class="demo-step success-step">
          <div class="success-anim">🎉</div>
          <div class="score-preview">+{{ lang === 'zh' ? '10 分' : '10 pts' }}</div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '答对得分！难度自动调整' : 'Score earned! Difficulty auto-adjusts' }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="tutorial-nav">
        <button class="nav-btn" @click="onSkip">{{ t.skip }}</button>
        <div class="nav-arrows">
          <button class="nav-btn arrow-btn" :disabled="step === 0" @click="step--">{{ t.prev }}</button>
          <button class="nav-btn arrow-btn primary" @click="onNext">
            {{ step === totalSteps - 1 ? t.skip : t.next }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game15TutorialModal'
};
</script>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from '@vue/composition-api'
import messages from '../i18n.js'

const props = defineProps({ lang: String })
const emit = defineEmits(['done', 'skip'])

const t = computed(() => messages[props.lang] || messages.zh)
const step = ref(0)
const totalSteps = 4

const step0Grid = [
  { isFossil: false }, { isFossil: true }, { isFossil: false },
  { isFossil: false }, { isFossil: false }, { isFossil: true },
  { isFossil: true }, { isFossil: false }, { isFossil: false },
]

const showFossil = ref(false)
const hitStep = ref(0)
let animTimer = null

function startStepAnimation() {
  clearInterval(animTimer)
  showFossil.value = false
  hitStep.value = 0

  if (step.value === 0) {
    setTimeout(() => { showFossil.value = true }, 400)
  } else if (step.value === 2) {
    let h = 0
    animTimer = setInterval(() => {
      h++
      hitStep.value = h
      if (h >= 10) clearInterval(animTimer)
    }, 500)
  }
}

const wrongHitIdx = 3

watch(step, startStepAnimation)
onMounted(startStepAnimation)
onUnmounted(() => clearInterval(animTimer))

function onNext() {
  if (step.value < totalSteps - 1) {
    step.value++
  } else {
    emit('done')
  }
}
function onSkip() {
  emit('skip')
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
  background: linear-gradient(160deg, #2e1a0a, #1a0c05);
  border: 0.2vmin solid rgba(255,200,100,0.3);
  border-radius: 2vmin;
  padding: 3vmin 4vmin;
  width: min(60vmin, 90vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}

.tutorial-title {
  color: #f5e6c8;
  font-size: 3vmin;
  font-weight: 800;
}

.step-dots {
  display: flex;
  gap: 1.2vmin;
}
.dot {
  width: 1.5vmin;
  height: 1.5vmin;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  transition: background 0.3s;
}
.dot.active {
  background: #c47c3a;
}

.demo-area {
  width: 100%;
  min-height: 28vmin;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5vmin;
  width: 100%;
}

.demo-grid {
  display: grid;
  gap: 1vmin;
}

.demo-cell {
  width: 7vmin;
  height: 7vmin;
  border-radius: 1vmin;
  background: radial-gradient(circle at 35% 35%, #8a7060, #5a4030);
  border: 0.2vmin solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3vmin;
  transition: all 0.4s;
  position: relative;
  overflow: hidden;
}

.stone-icon {
  width: 80%;
  height: 80%;
}

.demo-cell.stone-visible {
  background: radial-gradient(circle at 35% 35%, #8a7060, #5a4030);
}

.demo-cell.stone-hidden {
  background: radial-gradient(circle at 35% 35%, #4a3020, #2a1808);
  opacity: 0.3;
}

.check-mark {
  position: absolute;
  font-size: 4vmin;
  color: #4caf50;
  font-weight: 900;
  z-index: 1;
}

.x-mark {
  position: absolute;
  font-size: 4vmin;
  color: #ef5350;
  font-weight: 900;
  z-index: 1;
}

.demo-cell.hit-correct {
  background: radial-gradient(circle at 35% 35%, #2e7d32, #1b5e20);
  border-color: rgba(76, 175, 80, 0.6);
  animation: hitPulse 0.3s ease-out;
}

.demo-cell.hit-wrong {
  background: radial-gradient(circle at 35% 35%, #c62828, #7f0000);
  border-color: rgba(244, 67, 54, 0.6);
}

@keyframes hitPulse {
  0% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.demo-arrow {
  font-size: 3vmin;
  color: rgba(245, 230, 200, 0.5);
  animation: bounce 1s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(0.5vmin); }
}

.demo-hint-text {
  font-size: 2vmin;
  color: rgba(245, 230, 200, 0.8);
  text-align: center;
}

.shovel-anim {
  font-size: 5vmin;
  animation: shovelSwing 1s ease-in-out infinite;
}
@keyframes shovelSwing {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(20deg); }
}

.success-step {
  gap: 2vmin;
}
.success-anim {
  font-size: 8vmin;
  animation: pop 0.6s ease-out;
}
@keyframes pop {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.score-preview {
  font-size: 4vmin;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 0 2vmin rgba(255, 215, 0, 0.5);
}

.tutorial-nav {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1vmin;
}
.nav-arrows {
  display: flex;
  gap: 1.5vmin;
}
.nav-btn {
  padding: 1.2vmin 2.5vmin;
  font-size: 1.8vmin;
  border-radius: 1vmin;
  cursor: pointer;
  background: rgba(255,255,255,0.1);
  border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #f5e6c8;
  transition: all 0.2s;
  font-weight: 600;
}
.nav-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
.nav-btn.arrow-btn.primary {
  background: linear-gradient(135deg, #8B5E2A, #C47C3A);
  border-color: rgba(255,200,100,0.4);
}
.nav-btn.arrow-btn.primary:hover {
  background: linear-gradient(135deg, #A06E35, #D48940);
}
</style>
