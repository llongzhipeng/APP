<template>
  <div class="game-view">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="header-left">
        <button v-if="showBatchSkip" class="icon-btn skip-btn" @click="onBatchSkip">
          {{ t('game.skip') }}
        </button>
        <button @click="handleBack" class="icon-btn">
          <span>←</span>
        </button>
        <div class="difficulty-badge">
          <span class="difficulty-label">{{ t('game.level') }}</span>
          <span class="difficulty-value">{{ gameState.difficultyLevel }}</span>
        </div>
      </div>

      <div class="header-center">
        <div class="target-display">
          <span class="target-label">{{ t('game.target') }}</span>
          <span class="target-value">{{ gameState.targetValue }}</span>
        </div>
      </div>

      <div class="header-right">
        <div class="timer">
          <span class="timer-icon">⏱</span>
          <span class="timer-value">{{ formattedTime }}</span>
        </div>
        <div class="score">
          <span class="score-label">{{ t('game.currentScore') }}</span>
          <span class="score-value">{{ gameState.score }}</span>
        </div>
      </div>
    </div>

    <!-- 卡片网格区域 -->
    <div class="cards-container">
      <div
        :class="['cards-grid', `grid-${gridSize}`]"
        :style="{
          '--card-count': gameState.cards.length,
          '--cols': gridSize,
          '--rows': gridRows
        }"
      >
        <GameCard
          v-for="card in gameState.cards"
          :key="card.id"
          :card="card"
          :is-selected="selectedCardIds.has(card.id)"
          :is-disappearing="card.isDisappearing"
          @select="selectCard"
        />
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="game-footer">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">{{ t('game.correct') }}</span>
          <span class="stat-value success">{{ gameState.successCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('game.wrong') }}</span>
          <span class="stat-value error">{{ gameState.failCount }}</span>
        </div>
      </div>

      <button @click="togglePause" class="btn-pause">
        {{ gameState.isPaused ? t('common.continue') : t('common.pause') }}
      </button>
    </div>

    <!-- 暂停遮罩 -->
    <div v-if="gameState.isPaused" class="pause-overlay" @click="togglePause">
      <div class="pause-content">
        <h2>{{ t('game.paused') }}</h2>
        <p>{{ t('game.resume') }}</p>
      </div>
    </div>

    <!-- 得分飘字效果 -->
    <div v-for="float in floatingScores" :key="float.id" class="floating-score" :style="float.style">
      +{{ float.score }}
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from '@vue/composition-api';
import GameCard from '../components/game/GameCard.vue';
import { useGameState } from '../composables/useGameState.js';
import { formatTime } from '../utils/helpers.js';
import { getDifficultyConfig } from '../config/difficulty.js';
import { t } from '../i18n/index.js';
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy';

export default {
  name: 'GameView',
  components: {
    GameCard
  },
  emits: ['game-over', 'back'],
  setup(_props, { emit }) {
    const { gameState, selectCard: selectCardAction, pauseGame, resumeGame } = useGameState();
    const floatingScores = ref([]);

    const selectedCardIds = computed(() => {
      return new Set(gameState.selectedCards.map(c => c.id));
    });

    // 格式化时间显示
    const formattedTime = computed(() => formatTime(gameState.timeLeft));

    // 根据卡片数量动态计算网格大小
    const gridSize = computed(() => {
      const count = gameState.cards.length;
      if (count <= 9) return 3;
      if (count <= 16) return 4;
      if (count <= 25) return 5;
      return 6;
    });

    // 计算行数（用于让网格按可用空间自适应缩放）
    const gridRows = computed(() => {
      const count = gameState.cards.length;
      return Math.max(1, Math.ceil(count / gridSize.value));
    });

    // 选择卡片
    const selectCard = (card) => {
      const config = getDifficultyConfig(gameState.difficultyLevel);
      const oldScore = gameState.score;

      selectCardAction(card);

      // 如果得分增加了，显示飘字效果
      if (gameState.score > oldScore) {
        const points = 5 * config.coefficient;
        showFloatingScore(points);
      }
    };

    // 显示飘字效果
    const showFloatingScore = (score) => {
      const id = Date.now();
      const float = {
        id,
        score,
        style: {
          left: `${50 + Math.random() * 10 - 5}%`,
          top: `${40 + Math.random() * 10 - 5}%`
        }
      };

      floatingScores.value.push(float);

      // 2秒后移除
      setTimeout(() => {
        const index = floatingScores.value.findIndex(f => f.id === id);
        if (index !== -1) {
          floatingScores.value.splice(index, 1);
        }
      }, 2000);
    };

    // 暂停/继续
    const togglePause = () => {
      if (gameState.isPaused) {
        resumeGame();
      } else {
        pauseGame();
      }
    };

    const showBatchSkip = shouldShowPbBatchSkip();
    function onBatchSkip() { skipPbBatchGame(); }

    // 返回
    const handleBack = () => {
      if (leavePbGameWindow()) emit('back');
    };

    // 监听游戏结束
    watch(() => gameState.isGameOver, (isOver) => {
      if (isOver) {
        emit('game-over');
      }
    });

    return {
      gameState,
      formattedTime,
      gridSize,
      gridRows,
      floatingScores,
      selectedCardIds,
      selectCard,
      togglePause,
      handleBack,
      showBatchSkip,
      onBatchSkip,
      t
    };
  }
};
</script>

<style scoped>
.game-view {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding: 15px;
  position: relative;
  overflow: hidden;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  /* 保证目标值等 header 内元素始终显示在卡片之上，
     即使卡片选中动画有短暂的向上位移也不会被遮挡 */
  position: relative;
  z-index: 10;
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f0f0f0;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.icon-btn:hover {
  background: #e0e0e0;
  transform: scale(1.1);
}

.skip-btn {
  width: auto;
  padding: 0 12px;
  font-size: 14px;
}

.difficulty-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  color: white;
}

.difficulty-label {
  font-size: 12px;
}

.difficulty-value {
  font-size: 18px;
  font-weight: bold;
}

.target-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.target-label {
  font-size: 12px;
  color: white;
  opacity: 0.9;
}

.target-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.timer,
.score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.timer-icon {
  font-size: 20px;
}

.timer-value {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
}

.score-label {
  font-size: 11px;
  color: #666;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
  color: #f5576c;
}

.cards-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 顶部多留一点安全区，避免选中卡片放大后与顶部目标值胶囊
     的下沉阴影相互重叠 */
  padding: 16px 10px 10px;
  min-height: 0;
}

.cards-grid {
  display: grid;
  gap: 12px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  /* 关键：按列/行比例保持宽高一致，同时受父容器宽高双向约束，
     确保在横屏平板等小高度屏幕上不会超出可视区域 */
  aspect-ratio: var(--cols) / var(--rows);
  max-height: 100%;
  /* 有 aspect-ratio 时，让浏览器优先按可用高度反推宽度 */
  width: auto;
  height: auto;
}

.cards-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
  max-width: 500px;
}

.cards-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
  max-width: 600px;
}

.cards-grid.grid-5 {
  grid-template-columns: repeat(5, 1fr);
  max-width: 700px;
}

.cards-grid.grid-6 {
  grid-template-columns: repeat(6, 1fr);
  max-width: 700px;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.stat-value.success {
  color: #4caf50;
}

.stat-value.error {
  color: #f44336;
}

.btn-pause {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pause:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pause-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.pause-content {
  text-align: center;
  color: white;
}

.pause-content h2 {
  font-size: 48px;
  margin-bottom: 20px;
}

.pause-content p {
  font-size: 24px;
  opacity: 0.8;
}

.floating-score {
  position: fixed;
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  animation: float-up 2s ease-out forwards;
  z-index: 999;
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.5);
  }
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 15px;
  }

  .cards-grid {
    gap: 10px;
  }

  .cards-grid.grid-5,
  .cards-grid.grid-6 {
    gap: 8px;
  }

  .target-value {
    font-size: 28px;
  }

  .game-footer {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
