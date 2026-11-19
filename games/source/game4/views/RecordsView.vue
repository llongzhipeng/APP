<template>
  <div class="records-view">
    <div class="records-container">
      <div class="records-header">
        <button @click="goBack" class="back-btn">
          <span>←</span>
        </button>
        <h1 class="records-title">{{ t('records.title') }}</h1>
        <button
          v-if="records.length > 0"
          @click="handleClearAll"
          class="clear-btn"
        >
          {{ t('records.clearAll') }}
        </button>
      </div>

      <div v-if="records.length === 0" class="no-records">
        <div class="no-records-icon">📋</div>
        <p>{{ t('records.noRecords') }}</p>
      </div>

      <div v-else class="records-list">
        <div
          v-for="(record, index) in records"
          :key="index"
          class="record-card"
        >
          <div class="record-header">
            <span class="record-index">#{{ index + 1 }}</span>
            <span class="record-time">{{ record.trainTime }}</span>
          </div>

          <div class="record-body">
            <div class="record-item">
              <span class="item-label">{{ t('records.project') }}:</span>
              <span class="item-value">{{ record.project }}</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('common.score') }}:</span>
              <span class="item-value highlight">{{ record.score }}</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('records.duration') }}:</span>
              <span class="item-value">{{ formatDuration(record.duration) }}</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('common.difficulty') }}:</span>
              <span class="item-value">{{ record.difficultyLevel }}</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('records.successRate') }}:</span>
              <span class="item-value">{{ record.successRate }}%</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('result.avgReactionTime') }}:</span>
              <span class="item-value">{{ record.avgReactionTime }}ms</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('result.successCount') }}:</span>
              <span class="item-value success">{{ record.successCount }}</span>
            </div>

            <div class="record-item">
              <span class="item-label">{{ t('result.failCount') }}:</span>
              <span class="item-value error">{{ record.failCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from '@vue/composition-api';
import { getRecords, clearRecords } from '../utils/storage.js';
import { t } from '../i18n/index.js';

export default {
  name: 'RecordsView',
  emits: ['back'],
  setup(props, { emit }) {
    const records = ref([]);

    const loadRecords = () => {
      records.value = getRecords();
    };

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}${t('result.minute')}${secs}${t('result.second')}`;
    };

    const handleClearAll = () => {
      if (confirm(t('records.confirmClear'))) {
        clearRecords();
        loadRecords();
      }
    };

    const goBack = () => {
      emit('back');
    };

    onMounted(() => {
      loadRecords();
    });

    return {
      records,
      formatDuration,
      handleClearAll,
      goBack,
      t
    };
  }
};
</script>

<style scoped>
.records-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.records-container {
  max-width: 1200px;
  margin: 0 auto;
}

.records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-btn,
.clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn {
  background: #f0f0f0;
  color: #333;
}

.back-btn:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.back-btn span {
  font-size: 24px;
}

.records-title {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.clear-btn {
  background: #f44336;
  color: white;
}

.clear-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.no-records {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-records-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-records p {
  font-size: 20px;
  color: #666;
}

.records-list {
  display: grid;
  gap: 20px;
}

.record-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.record-index {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

.record-time {
  font-size: 14px;
  color: #666;
}

.record-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-label {
  font-size: 14px;
  color: #666;
}

.item-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.item-value.highlight {
  color: #667eea;
  font-size: 20px;
}

.item-value.success {
  color: #4caf50;
}

.item-value.error {
  color: #f44336;
}

@media (max-width: 768px) {
  .records-header {
    flex-wrap: wrap;
    gap: 15px;
  }

  .records-title {
    font-size: 24px;
    flex: 1 100%;
    text-align: center;
  }

  .record-body {
    grid-template-columns: 1fr;
  }
}
</style>
