<template>
  <div class="tutorial-overlay">
    <div class="tutorial-modal">
      <!-- Header -->
      <div class="tut-header">
        <div class="tut-dots">
          <span
            v-for="i in totalSteps"
            :key="i"
            class="tut-dot"
            :class="{ active: i - 1 === step }"
          ></span>
        </div>
        <button class="skip-btn" @click="$emit('done')">
          {{ L.skip }}
        </button>
      </div>

      <!-- Step content -->
      <div class="tut-body">
        <!-- Step 0: Single attribute classify -->
        <div v-if="step === 0" class="tut-step">
          <div class="tut-scene">
            <div class="tut-image-wrap pulse-border">
              <img :src="tutorialImages.fruit31" class="tut-img" />
            </div>
            <div class="tut-arrow">↓</div>
            <div class="tut-opts-row">
              <div class="tut-opt correct-opt">
                <span class="opt-check">✓</span>
                {{ L.s0opt1 }}
              </div>
              <div class="tut-opt wrong-opt">{{ L.s0opt2 }}</div>
            </div>
          </div>
          <div class="tut-hint">{{ L.s0hint }}</div>
        </div>

        <!-- Step 1: Odd one out -->
        <div v-else-if="step === 1" class="tut-step">
          <div class="tut-scene">
            <div class="tut-grid-2x2">
              <div class="tut-grid-item normal-item">
                <img :src="tutorialImages.fruit32" />
              </div>
              <div class="tut-grid-item normal-item">
                <img :src="tutorialImages.fruit33" />
              </div>
              <div class="tut-grid-item normal-item">
                <img :src="tutorialImages.fruit34" />
              </div>
              <div class="tut-grid-item odd-item">
                <img :src="tutorialImages.animal01" />
                <span class="odd-indicator">✓</span>
              </div>
            </div>
          </div>
          <div class="tut-hint">{{ L.s1hint }}</div>
        </div>

        <!-- Step 2: Dual attribute classify -->
        <div v-else-if="step === 2" class="tut-step">
          <div class="tut-scene">
            <div class="tut-image-wrap pulse-border">
              <img :src="tutorialImages.other6" class="tut-img" />
            </div>
            <div class="tut-arrow">↓</div>
            <div class="tut-opts-grid">
              <div class="tut-opt correct-opt">
                <span class="opt-check">✓</span>
                {{ L.s2opt1 }}
              </div>
              <div class="tut-opt wrong-opt">{{ L.s2opt2 }}</div>
              <div class="tut-opt wrong-opt">{{ L.s2opt3 }}</div>
              <div class="tut-opt wrong-opt">{{ L.s2opt4 }}</div>
            </div>
          </div>
          <div class="tut-hint">{{ L.s2hint }}</div>
        </div>
      </div>

      <!-- Footer nav -->
      <div class="tut-footer">
        <button class="nav-btn prev-btn" @click="prev" :disabled="step === 0">
          ← {{ L.prev }}
        </button>
        <button class="nav-btn next-btn" @click="next">
          {{ step === totalSteps - 1 ? L.start : L.next }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14TutorialModal'
};
</script>

<script setup>
import { ref, computed } from '@vue/composition-api'

const props = defineProps({ language: String })
const emit = defineEmits(['done'])
const tutorialImages = {
  fruit31: require('../public/image/elements/fruits/31.jpg'),
  fruit32: require('../public/image/elements/fruits/32.jpg'),
  fruit33: require('../public/image/elements/fruits/33.jpg'),
  fruit34: require('../public/image/elements/fruits/34.jpg'),
  animal01: require('../public/image/elements/animal/01.jpg'),
  other6: require('../public/image/elements/Other/6.jpg')
}

const step = ref(0)
const totalSteps = 3

const texts = {
  zh: {
    skip: '跳过',
    prev: '上一步',
    next: '下一步',
    start: '开始游戏',
    s0hint: '看图片，选择正确的类别',
    s0opt1: '水果',
    s0opt2: '蔬菜',
    s1hint: '找出与其他3个不同的那一个，点击它',
    s2hint: '看图片，从4个名称选项中选出与图片匹配的那一个',
    s2opt1: '红苹果',
    s2opt2: '蓝鹦鹉',
    s2opt3: '大黑狗',
    s2opt4: '黄瓶子'
  },
  en: {
    skip: 'Skip',
    prev: 'Prev',
    next: 'Next',
    start: 'Start',
    s0hint: 'Look at the image and select the correct category',
    s0opt1: 'Fruit',
    s0opt2: 'Vegetable',
    s1hint: 'Find the item that is different from the other 3 and click it',
    s2hint: 'Choose the name that matches the image from 4 options',
    s2opt1: 'Red Apple',
    s2opt2: 'Blue Parrot',
    s2opt3: 'Big Black Dog',
    s2opt4: 'Yellow Bottle'
  }
}

const L = computed(() => texts[props.language] || texts.zh)

function prev() {
  if (step.value > 0) step.value--
}

function next() {
  if (step.value < totalSteps - 1) {
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
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  backdrop-filter: blur(4px);
}

.tutorial-modal {
  background: white;
  border-radius: 2.5vmin;
  width: 90vmin;
  max-width: 95vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.tut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2vmin 3vmin;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.tut-dots {
  display: flex;
  gap: 1vmin;
}

.tut-dot {
  width: 1.5vmin;
  height: 1.5vmin;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

.tut-dot.active {
  background: white;
  width: 3vmin;
  border-radius: 1vmin;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 0.6vmin 1.5vmin;
  border-radius: 2em;
  cursor: pointer;
  font-size: clamp(11px, 1.6vmin, 16px);
  font-weight: 600;
  transition: all 0.2s;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.tut-body {
  flex: 1;
  overflow: hidden;
  padding: 2vmin 2.5vmin;
  display: flex;
  flex-direction: column;
}

.tut-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.5vmin;
  flex: 1;
  min-height: 0;
}

.tut-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5vmin;
  width: 100%;
  flex: 1;
  min-height: 0;
  justify-content: center;
}

.tut-image-wrap {
  width: 18vmin;
  height: 18vmin;
  border-radius: 1.5vmin;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.pulse-border {
  border: 3px solid #2563eb;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4), 0 4px 16px rgba(0,0,0,0.15); }
  50% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0), 0 4px 16px rgba(0,0,0,0.15); }
}

.tut-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tut-arrow {
  font-size: clamp(16px, 3vmin, 30px);
  color: #94a3b8;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

.tut-opts-row {
  display: flex;
  gap: 2vmin;
  width: 100%;
  justify-content: center;
}

.tut-opts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5vmin;
  width: 100%;
}

.tut-opt {
  padding: 1.5vmin 2vmin;
  border-radius: 1vmin;
  font-size: clamp(12px, 2vmin, 20px);
  font-weight: 700;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8vmin;
  min-width: 12vmin;
}

.correct-opt {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border: 2.5px solid #16a34a;
  color: #15803d;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
  animation: popIn 0.4s ease;
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.wrong-opt {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  color: #94a3b8;
}

.opt-check {
  font-size: clamp(14px, 2.2vmin, 22px);
}

.tut-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5vmin;
  width: min(42vmin, 42vh);
  max-height: 42vh;
  margin: 0 auto;
}

.tut-grid-item {
  border-radius: 1.5vmin;
  overflow: hidden;
  aspect-ratio: 1;
  position: relative;
  border: 2.5px solid transparent;
}

.tut-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f8fafc;
}

.normal-item {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.odd-item {
  border-color: #16a34a;
  background: #dcfce7;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3);
  animation: glowGreen 1.2s ease-in-out infinite;
}

@keyframes glowGreen {
  0%, 100% { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.1); }
}

.odd-indicator {
  position: absolute;
  top: 0.5vmin;
  right: 0.5vmin;
  background: #16a34a;
  color: white;
  border-radius: 50%;
  width: 3.5vmin;
  height: 3.5vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(10px, 1.8vmin, 18px);
  font-weight: 800;
}

.tut-hint {
  font-size: clamp(13px, 2.2vmin, 22px);
  color: #475569;
  text-align: center;
  font-weight: 600;
  line-height: 1.5;
  padding: 1.5vmin 2vmin;
  background: #f1f5f9;
  border-radius: 1vmin;
  width: 100%;
}

.tut-footer {
  display: flex;
  justify-content: space-between;
  padding: 2vmin 3vmin;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.nav-btn {
  padding: 1.2vmin 2.5vmin;
  border-radius: 1vmin;
  font-size: clamp(12px, 2vmin, 18px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.prev-btn {
  background: #e2e8f0;
  color: #64748b;
}

.prev-btn:hover:not(:disabled) {
  background: #cbd5e1;
  transform: translateX(-2px);
}

.prev-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.next-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

.next-btn:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5);
}
</style>
