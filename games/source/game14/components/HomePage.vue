<template>
  <div class="home-page">
    <div class="home-card">
      <div class="game-icon">🧩</div>
      <h1 class="game-title">{{ L.title }}</h1>
      <p class="game-subtitle">{{ L.subtitle }}</p>

      <div class="btn-group">
        <button class="btn btn-primary" @click="$emit('start')">
          <span class="btn-icon">▶</span>
          {{ L.start }}
        </button>
        <button class="btn btn-secondary" @click="$emit('show-rules')">
          <span class="btn-icon">📋</span>
          {{ L.rules }}
        </button>
        <button class="btn btn-secondary" @click="$emit('show-history')">
          <span class="btn-icon">📊</span>
          {{ L.history }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14HomePage'
};
</script>

<script setup>
import { computed } from '@vue/composition-api'

const props = defineProps({ language: String })
defineEmits(['start', 'show-rules', 'show-history'])

const texts = {
  zh: {
    title: '物品归类',
    subtitle: '抽象能力训练游戏',
    start: '开始游戏',
    rules: '规则介绍',
    history: '历史记录'
  },
  en: {
    title: 'Item Classification',
    subtitle: 'Abstract Thinking Training',
    start: 'Start Game',
    rules: 'Game Rules',
    history: 'History'
  }
}

const L = computed(() => texts[props.language] || texts.zh)
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-card {
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.game-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.game-title {
  font-size: 32px;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 10px;
}

.game-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  font-size: 18px;
}
</style>
