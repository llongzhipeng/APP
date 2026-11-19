<template>
  <div class="dur-page">
    <div class="dur-card">
      <h2 class="dur-title">{{ t('duration.title') }}</h2>

      <div class="dur-options">
        <button
          v-for="opt in t('duration.options')"
          :key="opt.value"
          class="dur-opt"
          :class="{ selected: selected === opt.value }"
          @click="selected = opt.value"
        >
          <span class="opt-time">{{ opt.label }}</span>
          <span class="opt-check" v-if="selected === opt.value">✓</span>
        </button>
      </div>

      <div class="dur-actions">
        <button class="dur-back" @click="$emit('back')">←</button>
        <button class="dur-confirm" :disabled="!selected" @click="confirm">
          {{ t('duration.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game11DurationSelect'
};
</script>

<script setup>
import { ref } from '@vue/composition-api'

defineProps({ t: Function })
const emit = defineEmits(['select', 'back'])

const selected = ref(null)

function confirm() {
  if (selected.value) emit('select', selected.value)
}
</script>

<style scoped>
.dur-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dur-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 5vh 5vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4vh;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  width: min(90vw, 480px);
}

.dur-title {
  color: #fff;
  font-size: clamp(1.1rem, 2.5vw, 2rem);
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
}

.dur-options {
  display: flex;
  flex-direction: column;
  gap: 1.8vh;
  width: 100%;
}

.dur-opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2vh 3vw;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: clamp(14px, 1.8vw, 22px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s;
  letter-spacing: 0.5px;
}
.dur-opt:hover {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.22);
  transform: translateX(4px);
}
.dur-opt.selected {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.2);
}

.opt-time {
  flex: 1;
  text-align: center;
}

.opt-check {
  color: #FFD700;
  font-size: 1.2em;
}

.dur-actions {
  display: flex;
  align-items: center;
  gap: 2vw;
  width: 100%;
}

.dur-back {
  flex-shrink: 0;
  width: clamp(36px, 5vw, 52px);
  height: clamp(36px, 5vw, 52px);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: clamp(14px, 1.5vw, 20px);
  cursor: pointer;
  transition: all 0.2s;
}
.dur-back:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-2px);
}

.dur-confirm {
  flex: 1;
  padding: 1.5vh 0;
  border: none;
  border-radius: 50px;
  background: #fff;
  color: #667eea;
  font-size: clamp(13px, 1.4vw, 20px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}
.dur-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.dur-confirm:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.22);
  background: #f0f4ff;
}
</style>
