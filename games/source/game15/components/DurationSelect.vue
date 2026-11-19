<template>
  <div class="duration-page">
    <h2 class="dur-title">{{ t.selectDuration }}</h2>
    <div class="dur-options">
      <div
        v-for="opt in options"
        :key="opt.value"
        class="dur-card"
        :class="{ selected: selected === opt.value }"
        @click="selected = opt.value"
      >
        <div class="dur-icon">{{ opt.icon }}</div>
        <div class="dur-label">{{ opt.label }}</div>
        <div class="dur-value">{{ opt.valueLabel }}</div>
      </div>
    </div>
    <button class="confirm-btn" @click="onConfirm">{{ t.confirmStart }}</button>
    <button class="back-link" @click="$emit('back')">← {{ t.backBtn }}</button>
  </div>
</template>

<script>
export default {
  name: 'Game15DurationSelect'
};
</script>

<script setup>
import { ref, computed } from '@vue/composition-api'
import messages from '../i18n.js'

const props = defineProps({ lang: String })
const emit = defineEmits(['selected', 'back'])
const t = computed(() => messages[props.lang] || messages.zh)

const selected = ref(60)

const options = computed(() => [
  { value: 60, label: t.value.min1, icon: '⏱️', valueLabel: '60s' },
  { value: 180, label: t.value.min3, icon: '⏳', valueLabel: '180s' },
  { value: 300, label: t.value.min5, icon: '🕐', valueLabel: '300s' },
])

function onConfirm() {
  emit('selected', selected.value)
}
</script>

<style scoped>
.duration-page {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #3d200e 0%, #1a0c05 70%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4vmin;
}

.dur-title {
  color: #f5e6c8;
  font-size: 3.5vmin;
  font-weight: 800;
  text-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.5);
}

.dur-options {
  display: flex;
  gap: 3vmin;
  flex-wrap: wrap;
  justify-content: center;
}

.dur-card {
  width: 20vmin;
  padding: 3vmin 2vmin;
  background: rgba(80, 45, 20, 0.7);
  border: 0.3vmin solid rgba(255,255,255,0.15);
  border-radius: 2vmin;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5vmin;
  transition: all 0.25s;
  backdrop-filter: blur(4px);
}
.dur-card:hover {
  background: rgba(110, 65, 30, 0.8);
  transform: translateY(-0.5vmin);
}
.dur-card.selected {
  background: linear-gradient(135deg, #8B5E2A, #C47C3A);
  border-color: rgba(255, 200, 80, 0.6);
  box-shadow: 0 0.8vmin 3vmin rgba(196, 124, 58, 0.4);
  transform: translateY(-0.5vmin) scale(1.04);
}

.dur-icon { font-size: 5vmin; }
.dur-label { color: #f5e6c8; font-size: 2.2vmin; font-weight: 700; }
.dur-value { color: rgba(245,230,200,0.6); font-size: 1.8vmin; }

.confirm-btn {
  padding: 1.8vmin 6vmin;
  font-size: 2.4vmin;
  font-weight: 800;
  background: linear-gradient(135deg, #8B5E2A, #C47C3A);
  border: 0.2vmin solid rgba(255,200,100,0.4);
  color: #f5e6c8;
  border-radius: 1.5vmin;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0.5vmin 2vmin rgba(196, 124, 58, 0.3);
}
.confirm-btn:hover {
  background: linear-gradient(135deg, #A06E35, #D48940);
  transform: translateY(-0.2vmin);
  box-shadow: 0 0.8vmin 3vmin rgba(196, 124, 58, 0.5);
}

.back-link {
  background: none;
  border: none;
  color: rgba(245,230,200,0.5);
  font-size: 1.8vmin;
  cursor: pointer;
  padding: 0.5vmin 1vmin;
  transition: color 0.2s;
}
.back-link:hover {
  color: rgba(245,230,200,0.9);
}
</style>
