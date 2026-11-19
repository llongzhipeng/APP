<template>
  <div class="result-screen">
    <div class="result-container">
      <div class="result-card">
        <div class="score-section">
          <div class="final-score">
            <span class="score-label">{{ t('finalScore') }}</span>
            <span class="score-value">{{ record.score }}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">{{ t('totalQuestions') }}</div>
            <div class="stat-value">{{ record.totalCount }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">{{ t('correctAnswers') }}</div>
            <div class="stat-value success">{{ record.successCount }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">{{ t('incorrectAnswers') }}</div>
            <div class="stat-value error">{{ record.failureCount }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">{{ t('accuracy') }}</div>
            <div class="stat-value">{{ formatPercent(record.successRate) }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">{{ t('avgResponseTime') }}</div>
            <div class="stat-value">{{ record.averageResponseTime.toFixed(2) }}{{ t('seconds') }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">{{ t('avgDifficulty') }}</div>
            <div class="stat-value">{{ record.averageDifficulty.toFixed(2) }}</div>
          </div>
        </div>

        <BatchTrainActions :home-text="t('backToStart')" @home="backToStart" />
      </div>
    </div>
  </div>
</template>

<script>
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

export default {
  name: 'ResultScreen',
  components: { BatchTrainActions },
  inject: ['i18n'],
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  },
  methods: {
    formatPercent(value) {
      return `${(value * 100).toFixed(1)}%`
    },
    backToStart() {
      this.$emit('back')
    }
  }
}
</script>

<style scoped>
.result-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.result-container {
  max-width: 700px;
  width: 100%;
}

.result-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.score-section {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
}

.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.score-label {
  font-size: 18px;
  color: #666;
  font-weight: 500;
}

.score-value {
  font-size: 72px;
  color: #4CAF50;
  font-weight: 800;
  line-height: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  color: #333;
  font-weight: 700;
}

.stat-value.success {
  color: #4CAF50;
}

.stat-value.error {
  color: #F44336;
}

.back-btn {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.back-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .result-screen {
    min-height: 100vh;
    padding: 15px;
  }

  .result-card {
    padding: 25px 20px;
  }

  .score-value {
    font-size: 56px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-value {
    font-size: 24px;
  }

  .back-btn {
    padding: 14px;
    font-size: 16px;
  }
}
</style>
