<template>
  <div class="game-header">
    <div class="header-item">
      <span class="header-label">{{ t('remainingTime') }}</span>
      <span class="header-value time">{{ formatTime(remainingTime) }}</span>
    </div>

    <div class="header-item">
      <span class="header-label">{{ t('score') }}</span>
      <span class="header-value score">{{ score }}</span>
    </div>

    <div class="header-item">
      <span class="header-label">{{ t('difficulty') }}</span>
      <span class="header-value difficulty">{{ t('level') }} {{ difficulty }}</span>
    </div>
  </div>
</template>

<script>
import { formatTime } from '../../utils/helpers.js'

export default {
  name: 'GameHeader',
  inject: ['i18n'],
  props: {
    remainingTime: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    difficulty: {
      type: Number,
      required: true
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  },
  methods: {
    formatTime
  }
}
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.header-label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.header-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.header-value.time {
  color: #2196F3;
  font-family: 'Courier New', monospace;
}

.header-value.score {
  color: #4CAF50;
}

.header-value.difficulty {
  color: #FF9800;
}
</style>
