<template>
  <div class="result-container">
    <!-- 顶部按钮区域 - 替代原来的标题位置 -->
    <div class="result-header">
      <button class="btn btn-primary" @click="playAgain">{{ t('result.playAgain') }}</button>
      <button class="btn btn-secondary" @click="viewHistory">{{ t('result.viewHistory') }}</button>
      <BatchTrainActions home-button-class="btn btn-secondary" :home-text="t('result.goHome')" @home="goHome" />
    </div>

    <!-- 结果卡片 - 紧凑网格布局 -->
    <div class="result-card">
      <div class="result-item highlight">
        <span class="result-label">{{ t('result.score') }}</span>
        <span class="result-value score">{{ record.score }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.duration') }}</span>
        <span class="result-value">{{ record.actualDuration }} {{ lang === 'zh' ? '秒' : 's' }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.difficulty') }}</span>
        <span class="result-value">{{ record.difficultyLevel }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.total') }}</span>
        <span class="result-value">{{ record.totalTimes }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.success') }}</span>
        <span class="result-value">{{ record.successTimes }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.fail') }}</span>
        <span class="result-value">{{ record.failTimes }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.rate') }}</span>
        <span class="result-value">{{ record.successRate.toFixed(1) }}%</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('result.reaction') }}</span>
        <span class="result-value">{{ record.averageReactionTime }} {{ lang === 'zh' ? '毫秒' : 'ms' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

export default {
  name: 'Game1GameResult',
  components: { BatchTrainActions },
};
</script>

<script setup>
import { inject } from '@vue/composition-api';
// 移除 defineProps/defineEmits 的导入
const props = defineProps({
  record: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['playAgain', 'viewHistory', 'goHome']);
const t = inject('t');
const lang = inject('lang');

// 重新训练
const playAgain = () => {
  emit('playAgain');
};

// 查看历史记录
const viewHistory = () => {
  emit('viewHistory');
};

// 返回主页
const goHome = () => {
  emit('goHome');
};
</script>

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 0;
}

.result-header {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.result-header .btn {
  padding: 10px 20px;
  font-size: 14px;
}

.result-card {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  align-content: start;
  overflow-y: auto;
  min-height: 0;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-item.highlight {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.result-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.result-value {
  font-size: 20px;
  font-weight: bold;
  color: #4A90E2;
}

.result-value.score {
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-container {
    padding: 8px 0;
  }

  .result-header {
    margin-bottom: 15px;
  }

  .result-header .btn {
    padding: 8px 16px;
    font-size: 13px;
    flex: 1;
    min-width: 100px;
  }

  .result-card {
    padding: 10px;
    gap: 6px;
  }

  .result-item {
    padding: 8px;
  }

  .result-label {
    font-size: 11px;
    margin-bottom: 4px;
  }

  .result-value {
    font-size: 18px;
  }

  .result-value.score {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .result-container {
    padding: 5px 0;
  }

  .result-header {
    margin-bottom: 10px;
    gap: 8px;
  }

  .result-header .btn {
    padding: 6px 12px;
    font-size: 12px;
    min-width: 90px;
  }

  .result-card {
    padding: 8px;
    gap: 5px;
    grid-template-columns: 1fr;
  }

  .result-item {
    padding: 6px;
  }

  .result-item.highlight {
    grid-column: 1;
  }

  .result-label {
    font-size: 10px;
    margin-bottom: 3px;
  }

  .result-value {
    font-size: 16px;
  }

  .result-value.score {
    font-size: 22px;
  }
}
</style>
