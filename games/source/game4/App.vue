<template>
  <div id="app">
    <component
      :is="currentView"
      v-bind="viewProps"
      @start-game="handleStartGame"
      @game-over="handleGameOver"
      @back="handleBack"
      @back-to-menu="handleBackToMenu"
      @view-records="handleViewRecords"
    />

    <!-- 教程模态框 -->
    <TutorialModal
      :visible="tutorialVisible"
      @close="handleTutorialClose"
      @start="handleTutorialComplete"
    />
  </div>
</template>

<script>
import { ref, computed, getCurrentInstance, onMounted } from '@vue/composition-api';
import {
  applyBatchTutorialEntry,
  afterBatchTutorial,
  isActiveBatchGame,
  getBatchStartDifficultyForGame,
} from '@/utils/pbGameBatchEntry';
import MainMenu from './views/MainMenu.vue';
import GameView from './views/GameView.vue';
import ResultView from './views/ResultView.vue';
import RecordsView from './views/RecordsView.vue';
import TutorialModal from './components/game/TutorialModal.vue';
import { useGameState } from './composables/useGameState';
import { saveRecord, getLastDifficulty } from './utils/storage';
import { formatDateTime } from './utils/helpers';
import { t } from './i18n';
import api from '@/api';
import { getTrainTypeForGame } from '@/utils/pbGameRegistry';

const GAME_TYPE = 'sslk'; // 速算连连看

const resolveArchiveId = (route) => {
  const fromQuery = route && route.query && route.query.archiveId;
  if (fromQuery != null && fromQuery !== '') return fromQuery;
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) {
    const id = new URLSearchParams(hash.slice(qIndex + 1)).get('archiveId');
    if (id != null && id !== '') return id;
  }
  return -1;
};
const VIEW_NAMES = {
  MENU: 'MainMenu',
  GAME: 'GameView',
  RESULT: 'ResultView',
  RECORDS: 'RecordsView'
};

export default {
  name: 'App',
  components: {
    MainMenu,
    GameView,
    ResultView,
    RecordsView,
    TutorialModal
  },


  setup() {
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));

    const currentView = ref(VIEW_NAMES.MENU);
    const gameResult = ref(null);
    const tutorialVisible = ref(false);
    const pendingDuration = ref(null); // 待开局时长（秒）

    const { gameState, initGame, resetGame, avgReactionTime, successRate } = useGameState();

    const viewProps = computed(() => {
      if (currentView.value === VIEW_NAMES.RESULT && gameResult.value) {
        return { result: gameResult.value };
      }
      return {};
    });

    /**
     * <summary>
     * 使用指定时长直接进入游戏页（跳过时长选择）
     * </summary>
     */
    const startGameDirectly = (duration) => {
      const startDifficulty = isActiveBatchGame(GAME_TYPE)
        ? getBatchStartDifficultyForGame(GAME_TYPE)
        : getLastDifficulty();
      initGame(duration, startDifficulty);
      currentView.value = VIEW_NAMES.GAME;
    };

    /**
     * <summary>
     * 一键启动批次：教程结束后按方案时长直接开局，不进入选择时长页
     * </summary>
     */
    const startAfterTutorialInBatch = () => {
      return afterBatchTutorial(GAME_TYPE, (duration) => {
        const finalDuration = duration != null ? duration : pendingDuration.value; // 优先批次方案时长
        if (finalDuration == null) return;
        startGameDirectly(finalDuration);
        pendingDuration.value = null;
      });
    };

    /**
     * <summary>
     * 主菜单点击开始：未看过教程则先弹教程，否则直接开局
     * </summary>
     */
    const handleStartGame = (duration) => {
      const tutorialCompleted = localStorage.getItem('tutorial_completed');

      if (!tutorialCompleted || isActiveBatchGame(GAME_TYPE)) {
        pendingDuration.value = duration;
        tutorialVisible.value = true;
      } else {
        startGameDirectly(duration);
      }
    };

    /**
     * <summary>
     * 教程点「开始游戏」：批次模式跳过时长选择直接开局
     * </summary>
     */
    const handleTutorialComplete = () => {
      tutorialVisible.value = false;
      if (startAfterTutorialInBatch()) return;
      if (pendingDuration.value) {
        startGameDirectly(pendingDuration.value);
        pendingDuration.value = null;
      }
    };

    /**
     * <summary>
     * 关闭教程：一键启动时同样直接开局，避免回到选择时长页
     * </summary>
     */
    const handleTutorialClose = () => {
      tutorialVisible.value = false;
      if (startAfterTutorialInBatch()) return;
    };

    onMounted(() => {
      applyBatchTutorialEntry(GAME_TYPE, {
        setDuration: (duration) => { pendingDuration.value = duration },
        openTutorial: () => { tutorialVisible.value = true },
      });
    });

    // 游戏结束
    const handleGameOver = () => {
      // 创建训练记录
      const record = {
        trainTime: formatDateTime(new Date()),
        project: t('records.projectName'),
        difficultyLevel: gameState.difficultyLevel,
        duration: gameState.duration,
        totalAttempts: gameState.totalAttempts,
        successCount: gameState.successCount,
        failCount: gameState.failCount,
        successRate: parseFloat(successRate.value),
        avgReactionTime: avgReactionTime.value,
        score: gameState.score
      };

      // 保存记录
      saveRecord(record);
      const times = gameState.reactionTimes || []; // 反应时长列表（毫秒）
      const mintime = times.length
        ? parseFloat((Math.min(...times) / 1000).toFixed(2))
        : 0; // 未答题时为 0，避免 -Infinity
      const maxtime = times.length
        ? parseFloat((Math.max(...times) / 1000).toFixed(2))
        : 0; // 未答题时为 0，避免 Infinity
      const body = {
          archiveId: archiveId.value,
          trainType: getTrainTypeForGame(GAME_TYPE),
          gameType: GAME_TYPE,
          minTime: mintime,
          maxTime: maxtime,
          avgTime: parseFloat((Number(record.avgReactionTime || 0) / 1000).toFixed(2)),
          score: record.score,
          successCount: gameState.successCount,
          failCount: gameState.failCount,
          trainDuration: gameState.duration,
          difficultyLevel: gameState.difficultyLevel,
          };

      api.submitPbGameRecord(body).catch(() => {});

      // 设置结果数据
      gameResult.value = record;

      // 显示结果页面
      currentView.value = VIEW_NAMES.RESULT;
    };

    // 返回按钮
    const handleBack = () => {
      resetGame();
      currentView.value = VIEW_NAMES.MENU;
    };

    // 从结果页返回主菜单
    const handleBackToMenu = () => {
      resetGame();
      currentView.value = VIEW_NAMES.MENU;
    };

    // 查看历史记录
    const handleViewRecords = () => {
      currentView.value = VIEW_NAMES.RECORDS;
    };

    return {
      currentView,
      viewProps,
      tutorialVisible,
      handleStartGame,
      handleTutorialComplete,
      handleTutorialClose,
      handleGameOver,
      handleBack,
      handleBackToMenu,
      handleViewRecords
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 禁用文本选择 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
