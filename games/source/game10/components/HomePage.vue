<template>
  <div class="home-wrap">
    <!-- Language toggle (top-right) -->
    <button class="lang-btn btn btn-secondary" @click="$emit('toggle-lang')">
      {{ t('langToggle') }}
    </button>

    <!-- Logo / title area -->
    <div class="home-hero">
      <div class="maze-icon">🧭</div>
      <h1 class="title">{{ t('gameName') }}</h1>
      <p class="subtitle">{{ lang === 'zh' ? '训练视空间能力' : 'Visuospatial Training' }}</p>
    </div>

    <!-- Main action buttons -->
    <div class="home-actions">
      <button class="btn btn-primary action-btn" @click="$emit('start')">
        🎮 {{ t('startGame') }}
      </button>
      <button class="btn btn-secondary action-btn" @click="$emit('rules')">
        📋 {{ t('rules') }}
      </button>
      <button class="btn btn-secondary action-btn" @click="$emit('history')">
        📊 {{ t('history') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game10HomePage'
};
</script>

<script setup>
import { useI18n } from '../i18n.js'
const props = defineProps({ lang: String })
defineEmits(['start', 'rules', 'history', 'toggle-lang'])
const t = useI18n(() => props.lang)
</script>

<style scoped>
.home-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 3vh, 36px);
  position: relative;
}

.lang-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px 16px;
  font-size: 14px;
}

.home-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.2vh, 14px);
}

.maze-icon {
  font-size: clamp(48px, 10vmin, 96px);
  line-height: 1;
}

.title {
  font-size: clamp(24px, 5vmin, 42px);
  font-weight: 600;
  color: #4A90E2;
  letter-spacing: 1px;
  text-align: center;
}

.subtitle {
  font-size: clamp(13px, 2.2vmin, 18px);
  color: #666;
}

.home-actions {
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.8vh, 16px);
  width: clamp(180px, 40vmin, 280px);
}

.action-btn {
  width: 100%;
  font-size: clamp(15px, 2.4vmin, 18px);
  padding: clamp(10px, 2vh, 14px);
}
</style>
