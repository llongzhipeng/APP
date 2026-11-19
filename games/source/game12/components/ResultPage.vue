<template>
  <div class="result-page">
    <div class="card">
      <h2 class="title">{{ t('gameOver') }}</h2>

      <div class="score-hero">
        <span class="score-num">{{ result.score }}</span>
        <span class="score-label">{{ t('totalScore') }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="si-val">{{ result.total }}</span>
          <span class="si-label">{{ t('totalQuestions') }}</span>
        </div>
        <div class="stat-item correct">
          <span class="si-val">{{ result.correct }}</span>
          <span class="si-label">{{ t('correctCount') }}</span>
        </div>
        <div class="stat-item wrong">
          <span class="si-val">{{ result.wrong }}</span>
          <span class="si-label">{{ t('wrongCount') }}</span>
        </div>
        <div class="stat-item">
          <span class="si-val">{{ result.rate }}%</span>
          <span class="si-label">{{ t('correctRate') }}</span>
        </div>
        <div class="stat-item">
          <span class="si-val">{{ result.avgTime }}{{ t('seconds') }}</span>
          <span class="si-label">{{ t('avgTime') }}</span>
        </div>
        <div class="stat-item">
          <span class="si-val">{{ result.duration }}{{ language === 'zh' ? '分钟' : 'min' }}</span>
          <span class="si-label">{{ language === 'zh' ? '训练时长' : 'Duration' }}</span>
        </div>
      </div>

      <!-- Accuracy ring -->
      <div class="accuracy-ring-wrap">
        <svg viewBox="0 0 80 80" width="clamp(80px,14vmin,130px)" height="clamp(80px,14vmin,130px)">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#e8eaf6" stroke-width="8"/>
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            :stroke="rateColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="`${ringDash} 213.6`"
            stroke-dashoffset="53.4"
            style="transition: stroke-dasharray 1s ease"
          />
        </svg>
        <div class="ring-text">{{ result.rate }}%</div>
      </div>

      <div class="btn-row">
        <BatchTrainActions :home-text="t('backHome')" @home="$emit('back-home')" />
        <button class="res-btn outline" @click="$emit('view-history')">{{ t('viewHistory') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'
export default {
  name: 'ResultPage',
  components: { BatchTrainActions },
  props: {
    language: { type: String, required: true },
    result: { type: Object, required: true },
  },
  emits: ['back-home', 'view-history'],
  computed: {
    rateColor() {
      const r = this.result.rate
      if (r >= 90) return '#43A047'
      if (r >= 70) return '#FFCA28'
      return '#E53935'
    },
    ringDash() {
      return (this.result.rate / 100) * 213.6
    },
  },
  methods: {
    t(key) { return t(this.language, key) },
  },
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #333;
}

.score-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.score-num {
  font-size: 64px;
  font-weight: 900;
  color: #FF7043;
  line-height: 1;
}
.score-label {
  font-size: 16px;
  color: #888;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  width: 100%;
}
.stat-item {
  background: #f5f6ff;
  border-radius: 12px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.stat-item.correct { background: #e8f5e9; }
.stat-item.wrong   { background: #fde8e8; }
.si-val {
  font-size: 24px;
  font-weight: 800;
  color: #333;
}
.stat-item.correct .si-val { color: #43A047; }
.stat-item.wrong   .si-val { color: #E53935; }
.si-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.accuracy-ring-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-text {
  position: absolute;
  font-size: 20px;
  font-weight: 800;
  color: #333;
}

.btn-row {
  display: flex;
  gap: 16px;
  width: 100%;
}
.res-btn {
  flex: 1;
  padding: 16px 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.res-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.res-btn.primary { background: #4CAF50; color: #fff; }
.res-btn.outline { background: #fff; color: #4A90E2; border: 2px solid #4A90E2; }

</style>
