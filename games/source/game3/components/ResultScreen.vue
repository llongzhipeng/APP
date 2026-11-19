<template>
  <div class="result-screen">
    <h2>{{ t('gameOver') }}</h2>
    <div class="result-content">
      <p class="result-score">{{ t('finalScore') }}: {{ currentScore }}</p>
      <div class="result-stats">
        <div class="stat-item">
          <span class="stat-label">{{ t('totalCount') }}:</span>
          <span class="stat-value">{{ totalQuestions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('successCount') }}:</span>
          <span class="stat-value success">{{ correctAnswers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('failCount') }}:</span>
          <span class="stat-value fail">{{ totalQuestions - correctAnswers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('successRate') }}:</span>
          <span class="stat-value">{{ ((correctAnswers / totalQuestions * 100) || 0).toFixed(1) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('avgReactionTime') }}:</span>
          <span class="stat-value">{{ (avgReactionTime || 0).toFixed(2) }}{{ t('seconds') }}</span>
        </div>
      </div>
    </div>
    <BatchTrainActions :home-text="t('backToMenu')" @home="goBack" />
  </div>
</template>

<script>
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

export default {
  name: 'ResultScreen',
  components: { BatchTrainActions },
  props: {
    t: {
      type: Function,
      required: true
    },
    currentScore: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    avgReactionTime: {
      type: Number,
      required: true
    }
  },
  emits: ['back'],
  methods: {
    goBack() {
      this.$emit('back');
    }
  }
}
</script>

<style scoped>
.result-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.result-screen h2 {
  font-size: 48px;
  color: white;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.result-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 40px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  min-width: 400px;
}

.result-score {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 30px;
  text-align: center;
}

.result-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f5f5f5;
  border-radius: 10px;
}

.stat-label {
  font-size: 18px;
  color: #666;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-value.success {
  color: #4caf50;
}

.stat-value.fail {
  color: #f44336;
}

.menu-btn {
  padding: 15px 60px;
  font-size: 20px;
  background: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.menu-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .result-screen h2 {
    font-size: 36px;
  }

  .result-content {
    min-width: auto;
    width: 100%;
  }

  .stat-label,
  .stat-value {
    font-size: 16px;
  }

  .menu-btn {
    font-size: 18px;
    padding: 12px 40px;
  }
}
</style>
