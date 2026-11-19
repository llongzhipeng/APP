<template>
  <div class="result-view">
    <!-- 语言切换按钮 -->
    <div class="language-toggle">
      <button @click="toggleLanguage" class="lang-btn">
        {{ currentLang === 'zh' ? 'EN' : '中文' }}
      </button>
    </div>

    <div class="result-container">
      <div class="result-header">
        <h1 class="result-title">{{ t('result.title') }}</h1>
      </div>

      <div class="final-score">
        <span class="score-label">{{ t('result.finalScore') }}</span>
        <span class="score-value">{{ result.score }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏱</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.duration') }}</span>
            <span class="stat-value">{{ formatDuration(result.duration) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.totalAttempts') }}</span>
            <span class="stat-value">{{ result.totalAttempts }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.successCount') }}</span>
            <span class="stat-value success">{{ result.successCount }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.failCount') }}</span>
            <span class="stat-value error">{{ result.failCount }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.successRate') }}</span>
            <span class="stat-value">{{ result.successRate }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.avgReactionTime') }}</span>
            <span class="stat-value">{{ result.avgReactionTime }}{{ t('result.millisecond') }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-info">
            <span class="stat-label">{{ t('result.difficultyLevel') }}</span>
            <span class="stat-value">{{ result.difficultyLevel }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <BatchTrainActions :home-text="t('result.backToMenu')" @home="backToMenu" />
        <button @click="viewRecords" class="btn btn-secondary">
          {{ t('records.title') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';
import { t, setLanguage, getCurrentLanguage } from '../i18n/index.js';
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue';

export default {
  name: 'ResultView',
  components: { BatchTrainActions },
  props: {
    result: {
      type: Object,
      required: true
    }
  },
  emits: ['back-to-menu', 'view-records'],
  setup(_props, { emit }) {
    const currentLang = ref(getCurrentLanguage());

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}${t('result.minute')}${secs}${t('result.second')}`;
    };

    const toggleLanguage = () => {
      const newLang = currentLang.value === 'zh' ? 'en' : 'zh';
      setLanguage(newLang);
      currentLang.value = newLang;
    };

    const backToMenu = () => {
      emit('back-to-menu');
    };

    const viewRecords = () => {
      emit('view-records');
    };

    return {
      currentLang,
      formatDuration,
      toggleLanguage,
      backToMenu,
      viewRecords,
      t
    };
  }
};
</script>

<style scoped>
.result-view {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2vh;
  position: relative;
  overflow: hidden;
}

/* 语言切换按钮 */
.language-toggle {
  position: absolute;
  top: 2vh;
  right: 2vh;
  z-index: 100;
}

.lang-btn {
  padding: 0.8vh 1.5vw;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  font-size: clamp(12px, 1.5vh, 16px);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.lang-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.result-container {
  background: white;
  border-radius: 20px;
  padding: 3vh 3vw;
  max-width: 90vw;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.result-header {
  text-align: center;
  margin-bottom: 2vh;
}

.result-title {
  font-size: clamp(24px, 4vh, 36px);
  font-weight: bold;
  color: #667eea;
  margin: 0 0 1vh 0;
}

.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5vh 3vw;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  margin-bottom: 2.5vh;
}

.final-score .score-label {
  font-size: clamp(14px, 2vh, 18px);
  color: white;
  opacity: 0.9;
  margin-bottom: 1vh;
}

.final-score .score-value {
  font-size: clamp(32px, 7vh, 64px);
  font-weight: bold;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5vh;
  margin-bottom: 2.5vh;
  flex: 1;
  align-content: start;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1vw;
  padding: 1.5vh 1.5vw;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: clamp(20px, 3.5vh, 32px);
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.3vh;
  min-width: 0;
}

.stat-label {
  font-size: clamp(11px, 1.5vh, 14px);
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: clamp(16px, 2.5vh, 24px);
  font-weight: bold;
  color: #333;
}

.stat-value.success {
  color: #4caf50;
}

.stat-value.error {
  color: #f44336;
}

.actions {
  display: flex;
  gap: 1.5vw;
  justify-content: center;
  margin-top: auto;
  padding-top: 1vh;
}

.btn {
  flex: 1;
  max-width: 250px;
  padding: 1.5vh 3vw;
  border: none;
  border-radius: 10px;
  font-size: clamp(14px, 2vh, 18px);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f0f4ff;
  transform: translateY(-2px);
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .result-container {
    padding: 2vh 4vw;
    max-width: 95vw;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1vh;
  }

  .actions {
    flex-direction: column;
    gap: 1.5vh;
  }

  .btn {
    max-width: none;
  }

  .lang-btn {
    padding: 1vh 3vw;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .result-view {
    padding: 1vh;
  }

  .language-toggle {
    top: 1vh;
    right: 1vh;
  }

  .result-container {
    padding: 1.5vh 3vw;
    border-radius: 12px;
  }

  .stat-card {
    padding: 1vh 2vw;
    gap: 2vw;
  }
}

/* 大屏幕限制 */
@media (min-width: 1400px) {
  .result-container {
    max-width: 1200px;
  }

  .btn {
    max-width: 300px;
  }
}
</style>
