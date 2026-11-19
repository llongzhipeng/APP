<template>
  <div class="result-page">
    <div class="result-card">
      <h2 class="result-title">{{ t('gameOverTitle') }}</h2>

      <div class="score-display">
        <span class="score-big">{{ result.score }}</span>
        <span class="score-unit">{{ t('totalScore') }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">{{ t('totalQuestions') }}</span>
          <span class="stat-val">{{ result.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('correctCount') }}</span>
          <span class="stat-val correct">{{ result.correct }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('wrongCount') }}</span>
          <span class="stat-val wrong">{{ result.wrong }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('accuracy') }}</span>
          <span class="stat-val">{{ result.successRate }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('avgReaction') }}</span>
          <span class="stat-val">{{ result.avgReactionTime }}{{ t('ms') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('difficultyLabel') }}</span>
          <span class="stat-val">{{ result.maxDifficulty }}</span>
        </div>
      </div>

      <BatchTrainActions :home-text="t('backHome')" @home="$emit('home')" />
    </div>
  </div>
</template>

<script>
import { translations } from '../i18n.js'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'
export default {
  name: 'ResultModal',
  components: { BatchTrainActions },
  props: { lang: String, result: Object },
  emits: ['home'],
  setup(props) {
    const t = (key) => translations[props.lang][key] || key
    return { t }
  },
}
</script>

<style scoped>
.result-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}

.result-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 4vmin 5vmin;
  width: 88%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.result-title {
  font-size: 3.5vmin;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.2vmin;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vmin;
}
.score-big {
  font-size: 10vmin;
  font-weight: 900;
  color: #FF9800;
  line-height: 1;
}
.score-unit {
  font-size: 2vmin;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.2vmin;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2vmin;
  width: 100%;
}
.stat-item {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.8vmin 1vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vmin;
}
.stat-label {
  font-size: 1.4vmin;
  color: #666;
  text-align: center;
}
.stat-val {
  font-size: 2.8vmin;
  font-weight: 700;
  color: #333;
}
.stat-val.correct { color: #4CAF50; }
.stat-val.wrong   { color: #f44336; }

.home-btn {
  width: 60%;
  padding: 2vmin 0;
  font-size: 2.2vmin;
  font-weight: 600;
  background: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
  transition: all 0.2s;
}
.home-btn:hover {
  background: #357abd;
  transform: translateY(-2px);
}
</style>
