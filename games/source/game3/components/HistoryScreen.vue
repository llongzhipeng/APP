<template>
  <div class="history-screen">
    <h2>{{ t('trainingRecords') }}</h2>
    <div v-if="trainingHistory.length === 0" class="no-records">
      {{ t('noRecords') }}
    </div>
    <div v-else class="history-table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>{{ t('trainingTime') }}</th>
            <th>{{ t('trainingProject') }}</th>
            <th>{{ t('difficultyLevel') }}</th>
            <th>{{ t('duration') }}</th>
            <th>{{ t('totalCount') }}</th>
            <th>{{ t('successCount') }}</th>
            <th>{{ t('failCount') }}</th>
            <th>{{ t('successRate') }}</th>
            <th>{{ t('avgReactionTime') }}</th>
            <th>{{ t('score') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in trainingHistory" :key="index">
            <td>{{ record.time }}</td>
            <td>{{ t('gameTitle') }}</td>
            <td>{{ record.difficultyLevel }}</td>
            <td>{{ record.duration }}{{ t('seconds') }}</td>
            <td>{{ record.totalCount }}</td>
            <td>{{ record.successCount }}</td>
            <td>{{ record.failCount }}</td>
            <td>{{ record.successRate }}%</td>
            <td>{{ record.avgReactionTime }}{{ t('seconds') }}</td>
            <td>{{ record.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button @click="goBack" class="back-btn">{{ t('back') }}</button>
  </div>
</template>

<script>
export default {
  name: 'HistoryScreen',
  props: {
    t: {
      type: Function,
      required: true
    },
    trainingHistory: {
      type: Array,
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
.history-screen {
  padding: 80px 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  color: white;
}

.history-screen h2 {
  font-size: 36px;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.no-records {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: #666;
  font-size: 18px;
  margin-bottom: 30px;
}

.history-table-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 30px;
  overflow-x: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.history-table th,
.history-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
  color: #333;
}

.history-table th {
  background: #667eea;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
}

.history-table tr:nth-child(even) {
  background: #f9f9f9;
}

.history-table tr:hover {
  background: #f0f0f0;
}

.back-btn {
  padding: 12px 40px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: block;
  margin: 0 auto;
}

.back-btn:hover {
  background: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .history-screen h2 {
    font-size: 28px;
  }

  .history-table {
    font-size: 14px;
  }

  .history-table th,
  .history-table td {
    padding: 8px;
  }
}
</style>
