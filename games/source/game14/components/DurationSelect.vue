<template>
  <div class="duration-page">
    <div class="duration-card">
      <h2 class="dur-title">{{ L.title }}</h2>
      <p class="dur-subtitle">{{ L.subtitle }}</p>

      <div class="dur-options">
        <button
          v-for="opt in options"
          :key="opt.seconds"
          class="dur-btn"
          :class="{ selected: selected === opt.seconds }"
          @click="selected = opt.seconds"
        >
          <span class="dur-num">{{ opt.num }}</span>
          <span class="dur-unit">{{ L[opt.unit] }}</span>
        </button>
      </div>

      <button class="confirm-btn" :disabled="!selected" @click="$emit('select', selected)">
        {{ L.confirm }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14DurationSelect'
};
</script>

<script setup>
import { ref, computed } from '@vue/composition-api'

const props = defineProps({ language: String })
const emit = defineEmits(['select'])

const selected = ref(null)

const options = [
  { num: 1, unit: 'min', seconds: 60 },
  { num: 3, unit: 'min', seconds: 180 },
  { num: 5, unit: 'min', seconds: 300 }
]

const texts = {
  zh: {
    title: '选择训练时长',
    subtitle: '请选择本次训练的时间',
    min: '分钟',
    confirm: '确认开始'
  },
  en: {
    title: 'Select Duration',
    subtitle: 'Choose your training duration',
    min: 'min',
    confirm: 'Start Training'
  }
}

const L = computed(() => texts[props.language] || texts.zh)
</script>

<style scoped>
.duration-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.duration-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 2.5vmin;
  padding: 5vmin 6vmin;
  text-align: center;
  box-shadow: 0 8px 40px rgba(37, 99, 235, 0.18);
  min-width: 42vmin;
  max-width: 60vmin;
  width: 90%;
  border: 1px solid rgba(255,255,255,0.7);
}

.dur-title {
  font-size: clamp(18px, 4vmin, 40px);
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 1vmin;
}

.dur-subtitle {
  font-size: clamp(12px, 2vmin, 20px);
  color: #64748b;
  margin-bottom: 4vmin;
}

.dur-options {
  display: flex;
  gap: 2.5vmin;
  justify-content: center;
  margin-bottom: 4vmin;
  flex-wrap: wrap;
}

.dur-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 16vmin;
  height: 16vmin;
  border: 3px solid #cbd5e1;
  border-radius: 2vmin;
  background: white;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dur-btn:hover {
  border-color: #60a5fa;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
}

.dur-btn.selected {
  border-color: #2563eb;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  transform: translateY(-3px);
}

.dur-num {
  font-size: clamp(24px, 5.5vmin, 56px);
  font-weight: 900;
  color: #1e40af;
  line-height: 1;
}

.dur-btn.selected .dur-num {
  color: #1e3a8a;
}

.dur-unit {
  font-size: clamp(11px, 2vmin, 20px);
  color: #64748b;
  font-weight: 600;
}

.confirm-btn {
  width: 100%;
  padding: 1.8vmin;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  border: none;
  border-radius: 1.2vmin;
  font-size: clamp(14px, 2.5vmin, 24px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.35);
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

.confirm-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
</style>
