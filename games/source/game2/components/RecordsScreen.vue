<template>
  <div class="records-screen">
    <div class="records-container">
      <h1 class="records-title">{{ t('trainingHistory') }}</h1>

      <div v-if="records.length === 0" class="no-records">
        {{ t('noRecords') }}
      </div>

      <div v-else class="records-list">
        <div
          v-for="record in records"
          :key="record.id"
          class="record-card"
        >
          <div class="record-header">
            <span class="record-time">{{ formatDateTime(record.trainingTime) }}</span>
            <span class="record-score">{{ record.score }} {{ t('score') }}</span>
          </div>

          <div class="record-stats">
            <div class="stat-item">
              <span class="stat-label">{{ t('totalQuestions') }}</span>
              <span class="stat-value">{{ record.totalCount }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">{{ t('accuracy') }}</span>
              <span class="stat-value">{{ formatPercent(record.successRate) }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">{{ t('avgDifficulty') }}</span>
              <span class="stat-value">{{ record.averageDifficulty.toFixed(1) }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">{{ t('trainingDuration') }}</span>
              <span class="stat-value">{{ formatTime(record.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <button class="back-btn" @click="$emit('back')">
        {{ t('back') }}
      </button>
    </div>
  </div>
</template>

<script>
import { storage } from '../utils/storage.js'
import { formatDateTime, formatTime } from '../utils/helpers.js'

export default {
  name: 'RecordsScreen',
  inject: ['i18n'],
  data() {
    return {
      records: []
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  },
  mounted() {
    this.loadRecords()
  },
  methods: {
    loadRecords() {
      this.records = storage.getRecords().reverse() // 最新的在前
    },
    formatDateTime,
    formatTime,
    formatPercent(value) {
      return `${(value * 100).toFixed(1)}%`
    }
  }
}
</script>

<style scoped>
.records-screen {
  min-height: calc(100vh - 150px);
  padding: 20px;
}

.records-container {
  max-width: 900px;
  margin: 0 auto;
}

.records-title {
  font-size: 32px;
  color: #333;
  text-align: center;
  margin-bottom: 40px;
  font-weight: 700;
}

.no-records {
  text-align: center;
  font-size: 18px;
  color: #999;
  padding: 60px 20px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.record-card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.record-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.record-time {
  font-size: 14px;
  color: #666;
}

.record-score {
  font-size: 24px;
  font-weight: 700;
  color: #4CAF50;
}

.record-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.back-btn {
  width: 100%;
  max-width: 300px;
  display: block;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .record-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
