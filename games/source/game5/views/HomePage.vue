<template>
  <div class="home-page">
    <div class="home-container">
      <h1 class="game-title">{{ t('title') }}</h1>

      <div class="duration-selector">
        <h3>{{ t('selectDuration') }}</h3>
        <div class="duration-options">
          <button
            v-for="option in durationOptions"
            :key="option"
            @click="selectedDuration = option"
            :class="['duration-btn', { active: selectedDuration === option }]"
          >
            {{ option }} {{ t('minutes') }}
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="startGame" class="primary-btn">
          {{ t('startGame') }}
        </button>
        <button @click="showRecords = true" class="secondary-btn">
          {{ t('viewRecords') }}
        </button>
        <button @click="showRules = true" class="secondary-btn">
          {{ t('gameRules') }}
        </button>
      </div>
    </div>

    <!-- 规则弹窗 -->
    <div v-if="showRules" class="modal-overlay" @click="showRules = false">
      <div class="modal-content" @click.stop>
        <h2>{{ t('rulesTitle') }}</h2>
        <div class="rules-content">
          <p>{{ t('rulesContent.intro') }}</p>
          <p>{{ t('rulesContent.objective') }}</p>
          <p>{{ t('rulesContent.howToPlay') }}</p>
          <p><strong>{{ t('rulesContent.difficultyTitle') }}</strong> {{ t('rulesContent.difficultyDesc') }}</p>
          <p><strong>{{ t('rulesContent.smartAdjust') }}</strong></p>
          <p><strong>{{ t('rulesContent.scoringRule') }}</strong></p>
        </div>
        <button @click="showRules = false" class="close-btn">{{ t('close') }}</button>
      </div>
    </div>

    <!-- 记录弹窗 -->
    <div v-if="showRecords" class="modal-overlay" @click="showRecords = false">
      <div class="modal-content records-modal" @click.stop>
        <h2>{{ t('records') }}</h2>
        <div class="records-table">
          <table v-if="records.length > 0">
            <thead>
              <tr>
                <th>{{ t('trainingTime') }}</th>
                <th>{{ t('difficultyLevel') }}</th>
                <th>{{ t('duration') }}</th>
                <th>{{ t('totalQuestions') }}</th>
                <th>{{ t('successCount') }}</th>
                <th>{{ t('failCount') }}</th>
                <th>{{ t('successRate') }}</th>
                <th>{{ t('avgResponseTime') }}</th>
                <th>{{ t('scoreLabel') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="index">
                <td>{{ record.date }}</td>
                <td>{{ record.difficulty }}</td>
                <td>{{ record.duration }}{{ t('minutes') }}</td>
                <td>{{ record.totalQuestions }}</td>
                <td>{{ record.successCount }}</td>
                <td>{{ record.failCount }}</td>
                <td>{{ record.successRate }}%</td>
                <td>{{ record.avgResponseTime }}s</td>
                <td>{{ record.score }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-records">暂无训练记录 / No records yet</p>
        </div>
        <button @click="showRecords = false" class="close-btn">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref }  from '@vue/composition-api'
import { useI18n } from '../i18n'
import { getTrainingRecords } from '../utils/storage'

export default {
  name: 'HomePage',
  emits: ['start-game'],
  setup(_, { emit }) {
    const { t } = useI18n()
    const selectedDuration = ref(1)
    const durationOptions = [1, 3, 5]
    const showRules = ref(false)
    const showRecords = ref(false)
    const records = ref(getTrainingRecords())

    const startGame = () => {
      emit('start-game', selectedDuration.value)
    }

    return {
      t,
      selectedDuration,
      durationOptions,
      showRules,
      showRecords,
      records,
      startGame
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.home-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.game-title {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 40px;
  font-weight: bold;
}

.duration-selector {
  margin-bottom: 40px;
}

.duration-selector h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.duration-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.duration-btn {
  padding: 15px 30px;
  border: 2px solid #667eea;
  background: white;
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  color: #667eea;
  font-weight: 600;
}

.duration-btn:hover {
  background: #f0f0ff;
  transform: translateY(-2px);
}

.duration-btn.active {
  background: #667eea;
  color: white;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.primary-btn {
  padding: 18px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.primary-btn:hover {
  transform: scale(1.05);
}

.secondary-btn {
  padding: 15px 40px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.secondary-btn:hover {
  background: #f0f0ff;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.records-modal {
  max-width: 95%;
}

.modal-content h2 {
  color: #667eea;
  margin-bottom: 20px;
  font-size: 28px;
}

.rules-content {
  text-align: left;
  line-height: 1.8;
  color: #333;
}

.rules-content p {
  margin-bottom: 15px;
}

.records-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #667eea;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
}

tr:hover {
  background: #f5f5f5;
}

.no-records {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 16px;
}

.close-btn {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #5568d3;
}
</style>
