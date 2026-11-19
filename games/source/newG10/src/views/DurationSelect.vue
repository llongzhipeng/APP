<template>
  <div class="duration-page">
    <div class="duration-container">
      <h1 class="page-title">{{ t('selectDuration') }}</h1>

      <div class="duration-options">
        <button
          v-for="option in durationOptions"
          :key="option"
          @click="selectedDuration = option"
          :class="['duration-btn', { active: selectedDuration === option }]"
        >
          <div class="duration-number">{{ option }}</div>
          <div class="duration-unit">{{ t('minutes') }}</div>
        </button>
      </div>

      <div class="action-buttons">
        <button @click="onBack" class="back-btn">{{ t('back') }}</button>
        <button @click="onStart" class="start-btn">{{ t('startGame') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n'

export default {
  name: 'DurationSelect',
  emits: ['back', 'start-game'],
  setup(_, { emit }) {
    const { t } = useI18n()
    const selectedDuration = ref(1)
    const durationOptions = [1, 3, 5]

    const onBack = () => emit('back')
    const onStart = () => emit('start-game', selectedDuration.value)

    return {
      t,
      selectedDuration,
      durationOptions,
      onBack,
      onStart
    }
  }
}
</script>

<style scoped>
.duration-page {
  width: 100vw;
  height: 100vh;
  height: calc(var(--real-vh, 1vh) * 100);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vmin;
  overflow: hidden;
}

.duration-container {
  background: white;
  border-radius: 2.8vmin;
  padding: 6vmin 6vmin;
  box-shadow: 0 1.5vmin 5vmin rgba(0,0,0,0.25);
  max-width: 110vmin;
  width: 100%;
  max-height: 95vh;
  max-height: calc(var(--real-vh, 1vh) * 95);
  overflow-y: auto;
  text-align: center;
}

.page-title {
  font-size: 5.5vmin;
  color: #667eea;
  margin-bottom: 5vmin;
  font-weight: bold;
  letter-spacing: 0.2vmin;
}

.duration-options {
  display: flex;
  gap: 3vmin;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 6vmin;
}

.duration-btn {
  padding: 4vmin 6vmin;
  border: 0.4vmin solid #667eea;
  background: white;
  border-radius: 2vmin;
  cursor: pointer;
  transition: all 0.3s;
  color: #667eea;
  font-weight: 600;
  min-width: 22vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vmin;
}

.duration-btn:hover {
  background: #f0f0ff;
  transform: translateY(-3px);
  box-shadow: 0 0.6vmin 1.6vmin rgba(102,126,234,0.25);
}

.duration-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 0.8vmin 2vmin rgba(102,126,234,0.4);
}

.duration-number {
  font-size: 6vmin;
  font-weight: bold;
  line-height: 1;
}

.duration-unit {
  font-size: 2.4vmin;
  opacity: 0.85;
}

.action-buttons {
  display: flex;
  gap: 3vmin;
  justify-content: center;
  flex-wrap: wrap;
}

.back-btn {
  padding: 2.4vmin 5vmin;
  background: white;
  color: #667eea;
  border: 0.3vmin solid #667eea;
  border-radius: 1.6vmin;
  font-size: 2.8vmin;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #f0f0ff;
  transform: translateY(-2px);
}

.start-btn {
  padding: 2.4vmin 6vmin;
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  border: none;
  border-radius: 1.6vmin;
  font-size: 3vmin;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 0.6vmin 2vmin rgba(64,192,87,0.4);
}

.start-btn:hover {
  transform: scale(1.05);
}

/* 手机竖屏（微信 web-view）适配 */
@media (orientation: portrait) {
  .duration-page {
    padding: 4vmin;
    padding-top: calc(4vmin + env(safe-area-inset-top));
    padding-bottom: calc(4vmin + env(safe-area-inset-bottom));
  }
  .duration-container {
    padding: 8vmin 5vmin;
    border-radius: 4vmin;
    max-width: 100%;
  }
  .page-title {
    font-size: max(7vmin, 22px);
    margin-bottom: 7vmin;
  }
  .duration-options {
    gap: 4vmin;
    margin-bottom: 8vmin;
  }
  .duration-btn {
    padding: 5vmin 6vmin;
    border-radius: 3vmin;
    min-width: 32vmin;
  }
  .duration-number { font-size: max(8vmin, 28px); }
  .duration-unit { font-size: max(3.4vmin, 13px); }
  .action-buttons {
    flex-direction: column;
    gap: 3vmin;
    align-items: stretch;
  }
  .back-btn,
  .start-btn {
    padding: 3.4vmin 6vmin;
    font-size: max(4.4vmin, 16px);
    border-radius: 2.5vmin;
    width: 85%;
    margin: 0 auto;
  }
}
</style>
