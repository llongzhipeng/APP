<template>
  <div class="dur-wrap">
    <h2 class="dur-title">{{ t('selectDuration') }}</h2>
    <div class="dur-options">
      <button
        v-for="opt in options"
        :key="opt.sec"
        class="btn dur-btn"
        :class="selected === opt.sec ? 'btn-primary' : 'btn-secondary'"
        @click="selected = opt.sec"
      >
        <span class="dur-icon">{{ opt.icon }}</span>
        <span>{{ t(opt.key) }}</span>
      </button>
    </div>
    <div class="dur-footer">
      <button class="btn btn-secondary" @click="$emit('back')">← {{ t('backBtn') }}</button>
      <button class="btn btn-success" @click="$emit('select', selected)">
        {{ lang === 'zh' ? '开始游戏 ▶' : 'Start ▶' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game10DurationSelect'
};
</script>

<script setup>
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n.js'

const props = defineProps({ lang: String })
defineEmits(['select', 'back'])
const t = useI18n(() => props.lang)

const selected = ref(60)
const options = [
  { sec: 60,  key: 'dur1', icon: '⏱' },
  { sec: 180, key: 'dur3', icon: '⏱' },
  { sec: 300, key: 'dur5', icon: '⏱' },
]
</script>

<style scoped>
.dur-wrap {
  width: 100vw; height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(18px, 3.5vh, 40px);
}

.dur-title {
  font-size: clamp(18px, 3.5vmin, 32px);
  font-weight: 700;
  color: #4A90E2;
}

.dur-options {
  display: flex;
  gap: clamp(12px, 2.5vw, 28px);
  flex-wrap: wrap;
  justify-content: center;
}

.dur-btn {
  flex-direction: column;
  gap: 6px;
  width: clamp(90px, 20vmin, 150px);
  height: clamp(90px, 20vmin, 150px);
  font-size: clamp(14px, 2.5vmin, 22px);
  border: 2px solid transparent;
}
.btn-primary.dur-btn { border-color: #4A90E2; }

.dur-icon { font-size: clamp(22px, 4vmin, 40px); }

.dur-footer {
  display: flex;
  gap: clamp(14px, 3vw, 28px);
  margin-top: 8px;
}
</style>
