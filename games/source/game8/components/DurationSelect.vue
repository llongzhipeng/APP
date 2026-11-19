<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h2 class="modal-title">{{ t('selectDuration') }}</h2>
      <p class="modal-hint">{{ t('durationHint') }}</p>

      <div class="duration-options">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="dur-btn"
          @click="$emit('selected', opt.value)"
        >
          <span class="dur-icon">{{ opt.icon }}</span>
          <span class="dur-label">{{ t(opt.key) }}</span>
          <span class="dur-sub">{{ opt.value / 60 }} min</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../utils/i18n.js'

export default {
  name: 'DurationSelect',
  emits: ['selected'],
  data() {
    return {
      options: [
        { value: 60,  key: 'min1', icon: '⚡' },
        { value: 180, key: 'min3', icon: '🎯' },
        { value: 300, key: 'min5', icon: '🏆' },
      ],
    }
  },
  methods: { t },
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #fff;
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.3);
  min-width: 50vmin;
}

.modal-title {
  font-size: 3vmin;
  font-weight: 800;
  color: #4A90E2;
  margin: 0;
}

.modal-hint {
  font-size: 1.8vmin;
  color: #888;
  margin: 0;
}

.duration-options {
  display: flex;
  gap: 3vmin;
}

.dur-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vmin;
  padding: 2.5vmin 3.5vmin;
  background: #f5f7ff;
  border: 0.3vmin solid #c5cae9;
  border-radius: 1.5vmin;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 13vmin;
}

.dur-btn:hover {
  background: #4A90E2;
  border-color: #4A90E2;
  color: white;
  transform: translateY(-0.5vmin);
  box-shadow: 0 1vmin 3vmin rgba(74,144,226,0.35);
}

.dur-icon {
  font-size: 3.5vmin;
}

.dur-label {
  font-size: 2.2vmin;
  font-weight: 700;
  color: inherit;
}

.dur-sub {
  font-size: 1.6vmin;
  opacity: 0.6;
  color: inherit;
}
</style>
