<template>
  <div class="home-page">
    <div class="home-container">
      <h1 class="game-title">{{ t('title') }}</h1>

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
                <td :data-label="t('trainingTime')">{{ record.date }}</td>
                <td :data-label="t('difficultyLevel')">{{ record.difficulty }}</td>
                <td :data-label="t('duration')">{{ record.duration }}{{ t('minutes') }}</td>
                <td :data-label="t('totalQuestions')">{{ record.totalQuestions }}</td>
                <td :data-label="t('successCount')">{{ record.successCount }}</td>
                <td :data-label="t('failCount')">{{ record.failCount }}</td>
                <td :data-label="t('successRate')">{{ record.successRate }}%</td>
                <td :data-label="t('avgResponseTime')">{{ record.avgResponseTime }}s</td>
                <td :data-label="t('scoreLabel')">{{ record.score }}</td>
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
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n'
import { getTrainingRecords } from '../utils/storage'

export default {
  name: 'HomePage',
  emits: ['start-game'],
  setup(_, { emit }) {
    const { t } = useI18n()
    const showRules = ref(false)
    const showRecords = ref(false)
    const records = ref(getTrainingRecords())

    const startGame = () => {
      emit('start-game')
    }

    return {
      t,
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
  width: 100vw;
  height: 100vh;
  height: calc(var(--real-vh, 1vh) * 100);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vmin;
  overflow: hidden;
}

.home-container {
  background: white;
  border-radius: 2.8vmin;
  padding: 5vmin 6vmin;
  box-shadow: 0 1.5vmin 5vmin rgba(0,0,0,0.25);
  max-width: 110vmin;
  width: 100%;
  max-height: 95vh;
  max-height: calc(var(--real-vh, 1vh) * 95);
  overflow-y: auto;
  text-align: center;
}

.game-title {
  font-size: 7vmin;
  color: #667eea;
  margin-bottom: 5vmin;
  font-weight: bold;
  letter-spacing: 0.2vmin;
}

.duration-selector {
  margin-bottom: 5vmin;
}

.duration-selector h3 {
  font-size: 3.2vmin;
  color: #333;
  margin-bottom: 2.5vmin;
}

.duration-options {
  display: flex;
  gap: 2.5vmin;
  justify-content: center;
  flex-wrap: wrap;
}

.duration-btn {
  padding: 2.4vmin 5vmin;
  border: 0.3vmin solid #667eea;
  background: white;
  border-radius: 1.6vmin;
  font-size: 2.8vmin;
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
  gap: 2.5vmin;
}

.primary-btn {
  padding: 2.8vmin 5.5vmin;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 1.6vmin;
  font-size: 3.4vmin;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 0.6vmin 2vmin rgba(102,126,234,0.35);
}

.primary-btn:hover {
  transform: scale(1.05);
}

.secondary-btn {
  padding: 2.4vmin 5.5vmin;
  background: white;
  color: #667eea;
  border: 0.3vmin solid #667eea;
  border-radius: 1.6vmin;
  font-size: 2.8vmin;
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
  padding: 2vmin;
}

.modal-content {
  background: white;
  border-radius: 2vmin;
  padding: 4.5vmin 5vmin;
  max-width: 90vmin;
  width: 100%;
  max-height: 90vh;
  max-height: calc(var(--real-vh, 1vh) * 90);
  overflow-y: auto;
}

.records-modal {
  max-width: 95%;
}

.modal-content h2 {
  color: #667eea;
  margin-bottom: 2.8vmin;
  font-size: 4vmin;
}

.rules-content {
  text-align: left;
  line-height: 1.9;
  color: #333;
  font-size: 2.4vmin;
}

.rules-content p {
  margin-bottom: 1.8vmin;
}

.records-table {
  overflow-x: auto;
  margin-bottom: 2.5vmin;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 2vmin;
}

th, td {
  padding: 1.6vmin 1.2vmin;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #667eea;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  font-size: 2vmin;
}

tr:hover {
  background: #f5f5f5;
}

.no-records {
  text-align: center;
  color: #999;
  padding: 5vmin;
  font-size: 2.4vmin;
}

.close-btn {
  padding: 1.6vmin 4vmin;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 1vmin;
  font-size: 2.4vmin;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #5568d3;
}

/* 手机竖屏（微信 web-view）适配 */
@media (orientation: portrait) {
  .home-page {
    padding: 4vmin;
    padding-top: calc(4vmin + env(safe-area-inset-top));
    padding-bottom: calc(4vmin + env(safe-area-inset-bottom));
  }
  .home-container {
    padding: 8vmin 6vmin;
    border-radius: 4vmin;
    max-width: 100%;
  }
  .game-title {
    font-size: max(9vmin, 26px);
    margin-bottom: 8vmin;
  }
  .action-buttons {
    gap: 4vmin;
  }
  .primary-btn {
    padding: 4vmin 6vmin;
    font-size: max(5vmin, 18px);
    border-radius: 2.5vmin;
    width: 85%;
    margin: 0 auto;
  }
  .secondary-btn {
    padding: 3.6vmin 6vmin;
    font-size: max(4.2vmin, 16px);
    border-radius: 2.5vmin;
    width: 85%;
    margin: 0 auto;
  }

  .modal-content {
    width: 92vw;
    max-width: 92vw;
    padding: 6vmin 5vmin;
    border-radius: 3vmin;
    max-height: 85vh;
    max-height: calc(var(--real-vh, 1vh) * 85);
  }
  .modal-content h2 {
    font-size: max(5.5vmin, 20px);
    margin-bottom: 4vmin;
  }
  .rules-content { font-size: max(3.8vmin, 14px); }
  .rules-content p { margin-bottom: 2.5vmin; }
  .close-btn {
    padding: 2.4vmin 5vmin;
    font-size: max(3.8vmin, 15px);
    border-radius: 2vmin;
    width: 80%;
  }

  /* 记录表格改卡片式 */
  .records-table { overflow-x: hidden; }
  .records-table table,
  .records-table thead,
  .records-table tbody,
  .records-table th,
  .records-table td,
  .records-table tr {
    display: block;
  }
  .records-table thead { display: none; }
  .records-table tr {
    background: #f9fafc;
    border: 1px solid #e0e0e0;
    border-radius: 2vmin;
    margin-bottom: 3vmin;
    padding: 2vmin 2.5vmin;
  }
  .records-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 1.2vmin 0;
    border-bottom: 1px dashed #eee;
    font-size: max(3.4vmin, 13px);
  }
  .records-table td:last-child { border-bottom: none; }
  .records-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #667eea;
    text-align: left;
    flex: 1;
  }
  .no-records { font-size: max(3.6vmin, 14px); }
}
</style>
