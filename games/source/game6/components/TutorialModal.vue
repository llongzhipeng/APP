<template>
  <div class="tutorial-overlay">
    <div class="tutorial-modal">
      <!-- Header -->
      <div class="tutorial-header">
        <h2>{{ t.tutorialTitle }}</h2>
        <div class="step-dots">
          <span
            v-for="(_, i) in t.tutorialSteps"
            :key="i"
            class="dot"
            :class="{ active: i === currentStep }"
            @click="currentStep = i"
          />
        </div>
      </div>

      <!-- Step content -->
      <div class="tutorial-body">
        <div class="step-icon">{{ currentStepData.icon }}</div>
        <h3 class="step-title">{{ currentStepData.title }}</h3>
        <p class="step-desc">{{ currentStepData.desc }}</p>
      </div>

      <!-- Footer buttons -->
      <div class="tutorial-footer">
        <button class="tut-btn skip" @click="$emit('done')">{{ t.skip }}</button>

        <div class="nav-btns">
          <button
            class="tut-btn nav"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >{{ t.prev }}</button>

          <button
            v-if="currentStep < t.tutorialSteps.length - 1"
            class="tut-btn primary"
            @click="currentStep++"
          >{{ t.next }}</button>

          <button
            v-else
            class="tut-btn primary"
            @click="$emit('done')"
          >{{ t.startGame2 }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game6TutorialModal'
};
</script>

<script setup>
import { ref, computed } from '@vue/composition-api'

const props = defineProps({ t: Object })
defineEmits(['done'])

const currentStep = ref(0)
const currentStepData = computed(() => props.t.tutorialSteps[currentStep.value])
</script>

<style scoped>
.tutorial-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.tutorial-modal {
  background: white;
  border: none;
  border-radius: 24px;
  width: 640px;
  max-width: 92%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.tutorial-header {
  padding: 24px 28px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tutorial-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 700;
}

.step-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.2s;
}
.dot.active {
  background: #f5576c;
  transform: scale(1.2);
}

.tutorial-body {
  padding: 44px 36px;
  text-align: center;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.step-icon {
  font-size: 72px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.step-title {
  font-size: 26px;
  font-weight: 700;
  color: #f5576c;
}

.step-desc {
  font-size: 18px;
  color: #666;
  line-height: 1.7;
  max-width: 500px;
}

.tutorial-footer {
  padding: 20px 28px;
  border-top: 1px solid rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btns {
  display: flex;
  gap: 10px;
}

.tut-btn {
  padding: 12px 28px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tut-btn.skip {
  background: transparent;
  color: #999;
  border: 1px solid #ddd;
}
.tut-btn.skip:hover {
  color: #666;
  border-color: #bbb;
}

.tut-btn.nav {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}
.tut-btn.nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.tut-btn.nav:not(:disabled):hover {
  background: #e8e8e8;
}

.tut-btn.primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.tut-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
</style>
