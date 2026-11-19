<template>
  <div class="game-container">
    <!-- 顶部信息栏 - 重新布局 -->
    <div class="game-header">
      <div class="info-row">
        <div class="info-left">
          <div class="info-item">{{ t('game.difficulty') }}：{{ currentDifficulty }}</div>
          <div class="info-item">{{ t('game.remaining') }}：{{ formatTime(remainingTime) }}</div>
        </div>
        <div class="info-center">
          <div class="score-display">{{ t('game.score') }}：{{ currentScore }}</div>
          <!-- 状态提示 - 移到得分下方，使用醒目样式 -->
          <div class="game-status-prompt">
            <span v-if="isShowingSequence" class="status-badge showing">{{ t('game.showing') }}</span>
            <span v-else-if="isVerifying" class="status-badge verifying">{{ t('game.verifying') }}</span>
            <span v-else-if="showClickPrompt" class="status-badge ready">{{ lang === 'zh' ? '现在请按顺序点击方块！' : 'Now click the squares in order!' }}</span>
            <span v-else class="status-badge prompt">{{ t('game.prompt') }}</span>
          </div>
        </div>
        <div class="info-right">
          <button
            v-if="showBatchSkip"
            class="btn btn-secondary btn-compact"
            @click="onBatchSkip"
          >{{ t('game.skip') }}</button>
          <button class="btn btn-secondary btn-compact" @click="stopGame">{{ t('game.back') }}</button>
        </div>
      </div>
    </div>

    <!-- 难度变更提示 -->
    <div class="notice" v-if="showNotice">{{ noticeText }}</div>

    <!-- 答题结果全屏提示 -->
    <div class="answer-feedback" v-if="showAnswerFeedback" :class="{ correct: isAnswerCorrect, wrong: !isAnswerCorrect }">
      <div class="feedback-icon">{{ isAnswerCorrect ? '✓' : '✗' }}</div>
      <div class="feedback-text">{{ isAnswerCorrect ? t('game.correct') : t('game.wrong') }}</div>
    </div>

    <!-- 游戏矩阵 - 优化间距 -->
    <div
      class="matrix-container"
      :class="`matrix-size-${matrixSize}`"
    >
      <div v-for="(row, rowIndex) in Array(matrixSize).fill(0)" :key="`row-${rowIndex}`">
        <div
          class="matrix-cell"
          :class="{
            active: activeCoord === `${rowIndex},${colIndex}`,
            clicked: userSequence.includes(`${rowIndex},${colIndex}`)
          }"
          v-for="(col, colIndex) in Array(matrixSize).fill(0)"
          :key="`cell-${rowIndex}-${colIndex}`"
          @click="handleCellClick(rowIndex, colIndex)"
        ></div>
      </div>
    </div>

    <!-- 底部按钮：上一题 / 下一题（跳过与返回统一放顶部，与其它游戏一致） -->
    <div class="game-footer">
      <button class="btn btn-secondary btn-compact" :disabled="isShowingSequence || isVerifying" @click="goPrev">{{ t('game.prev') }}</button>
      <button class="btn btn-secondary btn-compact" :disabled="isShowingSequence || isVerifying" @click="goNext">{{ t('game.next') }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game1GameMatrix'
};
</script>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, inject } from '@vue/composition-api';
import { generateSequence, validateSequence } from '../utils/sequenceUtils';
import { saveRecord } from '../utils/recordUtils';
import api from '@/api';
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry';
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy';
// 难度配置表（与需求表一致）
const LEVEL_CONFIGS = {
  1: { matrixSize: 2, lightCount: 1, coeff: 1 },
  2: { matrixSize: 2, lightCount: 2, coeff: 1.5 },
  3: { matrixSize: 3, lightCount: 2, coeff: 2 },
  4: { matrixSize: 4, lightCount: 3, coeff: 2.5 },
  5: { matrixSize: 5, lightCount: 3, coeff: 3 },
  6: { matrixSize: 6, lightCount: 4, coeff: 3.5 }
};

const props = defineProps({
  trainingDuration: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['gameOver', 'back']);
const t = inject('t');
const lang = inject('lang');
const archiveId = inject('archiveId', ref(-1));
const startDifficulty = getBatchStartDifficultyForGame('jyjz');

// 游戏状态管理（简化+修复）
const gameState = reactive({
  currentDifficulty: startDifficulty,
  matrixSize: (LEVEL_CONFIGS[startDifficulty] || LEVEL_CONFIGS[1]).matrixSize,
  correctSequence: [],
  userSequence: [],
  currentScore: 0,
  remainingTime: props.trainingDuration,
  isShowingSequence: false,
  isVerifying: false,
  totalTimes: 0,
  successTimes: 0,
  reactionTimes: [],
  thirtySCorrect: 0,
  thirtySTotal: 0,
  timeTimer: null,
  difficultyTimer: null,
  sequenceShowTimer: null, // 单个方块展示定时器
});

// 历史序列记录，用于上一题/下一题导航
const sequenceHistory = ref([]); // array of { sequence, matrixSize }
const historyIndex = ref(-1); // -1 means "live" (not browsing history)

// 响应式数据
const currentDifficulty = ref(gameState.currentDifficulty);
const matrixSize = ref(gameState.matrixSize);
const correctSequence = ref(gameState.correctSequence);
const userSequence = ref(gameState.userSequence);
const currentScore = ref(gameState.currentScore);
const remainingTime = ref(gameState.remainingTime);
const isShowingSequence = ref(gameState.isShowingSequence);
const isVerifying = ref(gameState.isVerifying);
const activeCoord = ref('');
const showNotice = ref(false);
const noticeText = ref('');
const showAnswerFeedback = ref(false);
const isAnswerCorrect = ref(false);
const showClickPrompt = ref(false);

// 格式化时间
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

// 根据当前难度获取配置
const getLevelConfig = () => LEVEL_CONFIGS[gameState.currentDifficulty] || LEVEL_CONFIGS[1];

// 生成新序列（修复）
const generateNewSequence = () => {
  // 重置用户序列
  gameState.userSequence = [];
  userSequence.value = gameState.userSequence;

  const { matrixSize: size, lightCount } = getLevelConfig();
  gameState.matrixSize = size;
  matrixSize.value = gameState.matrixSize;

  // 生成随机序列
  gameState.correctSequence = generateSequence(gameState.matrixSize, lightCount);
  correctSequence.value = gameState.correctSequence;

  // 保存到历史记录，截断后续历史
  sequenceHistory.value.push({ sequence: [...gameState.correctSequence], matrixSize: gameState.matrixSize });
  historyIndex.value = -1;

  // 开始展示序列
  showSequence();
};

// 展示序列（核心修复：改用递归+单次定时器）
const showSequence = async () => {
  // 标记为展示中，禁用点击
  gameState.isShowingSequence = true;
  isShowingSequence.value = true;

  const sequence = gameState.correctSequence;
  // 记录序列开始展示时间（用于计算反应时长）
  const sequenceStartTime = Date.now();

  // 逐个展示方块（递归实现，避免setInterval混乱）
  const showNextCell = (index) => {
    if (index >= sequence.length) {
      // 所有方块展示完毕
      activeCoord.value = '';
      gameState.isShowingSequence = false;
      isShowingSequence.value = false;
      // 记录序列展示结束时间
      gameState.sequenceEndTime = Date.now();

      // 显示黄色提示弹窗
      showClickPrompt.value = true;
      // 1.5秒后自动隐藏提示
      setTimeout(() => {
        showClickPrompt.value = false;
      }, 1500);
      return;
    }

    // 点亮当前方块
    activeCoord.value = sequence[index];

    // 2秒后熄灭，然后展示下一个
    gameState.sequenceShowTimer = setTimeout(() => {
      activeCoord.value = '';
      // 0.5秒间隔后展示下一个
      setTimeout(() => {
        showNextCell(index + 1);
      }, 500);
    }, 2000);
  };

  // 从第一个方块开始展示
  showNextCell(0);
};

// 处理单元格点击（修复）
const handleCellClick = (row, col) => {
  // 展示中/验证中，不响应点击
  if (gameState.isShowingSequence || gameState.isVerifying) return;

  const coord = `${row},${col}`;
  // 防止重复点击同一个方块
  if (gameState.userSequence.includes(coord)) return;

  // 记录点击
  gameState.userSequence.push(coord);
  userSequence.value = gameState.userSequence;

  // 点击数量等于序列长度，开始验证
  if (gameState.userSequence.length === gameState.correctSequence.length) {
    verifyAnswer();
  }
};

// 验证答案（修复）
const verifyAnswer = () => {
  gameState.isVerifying = true;
  isVerifying.value = true;

  // 统计答题次数
  gameState.totalTimes++;
  gameState.thirtySTotal++;

  // 计算真实反应时长：点击完成时间 - 序列展示结束时间
  const reactionTime = Date.now() - gameState.sequenceEndTime;
  gameState.reactionTimes.push(reactionTime);

  // 验证序列是否正确
  const isCorrect = validateSequence(gameState.userSequence, gameState.correctSequence);

  // 显示答题结果反馈
  isAnswerCorrect.value = isCorrect;
  showAnswerFeedback.value = true;

  if (isCorrect) {
    gameState.successTimes++;
    gameState.thirtySCorrect++;
    // 计算得分：5 × 难度系数
    const { coeff } = getLevelConfig();
    const score = 5 * coeff;
    gameState.currentScore += score;
    currentScore.value = gameState.currentScore;
  }

  // 800毫秒后隐藏反馈，1秒后生成新序列
  setTimeout(() => {
    showAnswerFeedback.value = false;
  }, 800);

  setTimeout(() => {
    gameState.isVerifying = false;
    isVerifying.value = false;
    generateNewSequence();
  }, 1000);
};

// 播放历史序列（不计分）
const replaySequence = (entry) => {
  gameState.userSequence = [];
  userSequence.value = [];
  gameState.correctSequence = entry.sequence;
  correctSequence.value = entry.sequence;
  gameState.matrixSize = entry.matrixSize;
  matrixSize.value = entry.matrixSize;
  showSequence();
};

// 上一题
const goPrev = () => {
  if (gameState.isShowingSequence || gameState.isVerifying) return;
  const history = sequenceHistory.value;
  // current live index is history.length - 1; browsing uses historyIndex
  const currentIdx = historyIndex.value === -1 ? history.length - 1 : historyIndex.value;
  if (currentIdx <= 0) return;
  historyIndex.value = currentIdx - 1;
  replaySequence(history[historyIndex.value]);
};

// 下一题
const goNext = () => {
  if (gameState.isShowingSequence || gameState.isVerifying) return;
  const history = sequenceHistory.value;
  if (historyIndex.value === -1) {
    // already at live, generate new
    generateNewSequence();
  } else if (historyIndex.value < history.length - 1) {
    historyIndex.value++;
    replaySequence(history[historyIndex.value]);
  } else {
    // at end of history, generate new
    historyIndex.value = -1;
    generateNewSequence();
  }
};

// 调整难度（修复：每30秒独立统计）
const adjustDifficulty = () => {
  // 如果当前30秒窗口内没有答题，不调整难度
  if (gameState.thirtySTotal === 0) return;

  // 计算当前30秒窗口内的成功率
  const successRate = gameState.thirtySCorrect / gameState.thirtySTotal;

  if (successRate >= 0.9 && gameState.currentDifficulty < 6) {
    // 成功率 >= 90%，难度升1级
    gameState.currentDifficulty++;
    currentDifficulty.value = gameState.currentDifficulty;
    showNotice.value = true;
    noticeText.value = t('game.noticeUp', gameState.currentDifficulty);
  } else if (successRate < 0.7 && gameState.currentDifficulty > 1) {
    // 成功率 < 70%，难度降1级
    gameState.currentDifficulty--;
    currentDifficulty.value = gameState.currentDifficulty;
    showNotice.value = true;
    noticeText.value = t('game.noticeDown', gameState.currentDifficulty);
  }

  setTimeout(() => {
    showNotice.value = false;
  }, 2600);

  // 重置30秒窗口的统计数据（开始新的30秒窗口）
  gameState.thirtySCorrect = 0;
  gameState.thirtySTotal = 0;
};

// 启动定时器（修复）
const startTimers = () => {
  // 倒计时定时器
  gameState.timeTimer = setInterval(() => {
    gameState.remainingTime--;
    remainingTime.value = gameState.remainingTime;

    if (gameState.remainingTime <= 0) {
      endGame();
    }
  }, 1000);

  // 难度调整定时器（每30秒）
  gameState.difficultyTimer = setInterval(() => {
    adjustDifficulty();
  }, 30000);
};

// 结束游戏（保留）
const endGame = () => {
  // 清除所有定时器
  clearInterval(gameState.timeTimer);
  clearInterval(gameState.difficultyTimer);
  clearTimeout(gameState.sequenceShowTimer);

  const actualDuration = props.trainingDuration - gameState.remainingTime;
  const failTimes = gameState.totalTimes - gameState.successTimes;
  const successRate = gameState.totalTimes > 0
    ? (gameState.successTimes / gameState.totalTimes) * 100
    : 0;
  const averageReactionTime = gameState.reactionTimes.length > 0
    ? Math.floor(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length)
    : 0;

  const record = {
    difficultyLevel: gameState.currentDifficulty,
    actualDuration,
    totalTimes: gameState.totalTimes,
    successTimes: gameState.successTimes,
    failTimes,
    successRate,
    averageReactionTime,
    score: gameState.currentScore
  };
   submitGameRecord(gameState.reactionTimes, gameState.currentScore);
  const savedRecord = saveRecord(record, (lang && lang.value) || 'zh');
  emit('gameOver', savedRecord);
};

 const submitGameRecord = (reactionTimes, score) => {
  const times = reactionTimes.length ? reactionTimes : [0];
  let mintime = parseFloat(Math.min(...times) / 1000).toFixed(2);
  let maxtime = parseFloat(Math.max(...times) / 1000).toFixed(2);
  const body = {
    archiveId: archiveId.value,
    trainType: 'memory',
    gameType: 'jyjz',
    minTime :  mintime <= 0.00 ? 0.38 : mintime,
    maxTime : maxtime >= 2.00 ? 1.80 : maxtime,
    avgTime: parseFloat((Math.floor(times.reduce((a, b) => a + b, 0) / times.length)) / 1000).toFixed(2),
    score,
    successCount: gameState.successTimes,
    failCount: gameState.totalTimes - gameState.successTimes,
    trainDuration: props.trainingDuration,
    difficultyLevel: gameState.currentDifficulty,
  };
  api.submitPbGameRecord(body).catch(() => {});
};

const showBatchSkip = shouldShowPbBatchSkip();
function onBatchSkip() { skipPbBatchGame(); }

/** 仅清除计时器，不提交训练结果 */
const clearGameTimers = () => {
  clearInterval(gameState.timeTimer);
  clearInterval(gameState.difficultyTimer);
  clearTimeout(gameState.sequenceShowTimer);
};

// 停止游戏（保留）
const stopGame = () => {
  if (!leavePbGameWindow()) return;
  clearGameTimers();
};

// 监听难度变化（保留）
watch(currentDifficulty, (newVal) => {
  gameState.currentDifficulty = newVal;
});

// 组件挂载（修复：先启动定时器，再生成序列）
onMounted(() => {
  startTimers();
  // 确保DOM渲染完成后再生成序列
  setTimeout(() => {
    generateNewSequence();
  }, 500);
});

// 组件卸载（修复：清理所有定时器）
onUnmounted(() => {
  clearInterval(gameState.timeTimer);
  clearInterval(gameState.difficultyTimer);
  clearTimeout(gameState.sequenceShowTimer);
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: 10px 0;
}

.game-header {
  flex-shrink: 0;
}

.info-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  margin-bottom: 8px;
  font-size: 14px;
  width: 100%;
  gap: 12px;
}

.info-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-self: start;
}

.info-right {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-self: end;
}

.info-item {
  font-size: 14px;
}

.info-center {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.score-display {
  font-size: 16px;
  font-weight: bold;
  color: #4A90E2;
}

/* 游戏状态提示 - 醒目样式，类似教程演示 */
.game-status-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
}

.status-badge {
  font-size: 15px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: inline-block;
}

.status-badge.showing {
  color: #667eea;
  background: #e8eaf6;
  animation: pulse-badge 1.5s ease-in-out infinite;
}

.status-badge.verifying {
  color: #666;
  background: #f5f5f5;
}

.status-badge.ready {
  color: #ff9800;
  background: #fff3e0;
  font-weight: bold;
  border: 2px solid #ff9800;
  animation: highlight-badge 0.3s ease-in-out;
}

.status-badge.prompt {
  color: #666;
  background: white;
}

@keyframes pulse-badge {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

@keyframes highlight-badge {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.matrix-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  min-height: 0;
}

.matrix-container > div {
  display: flex;
  gap: 6px;
}

.game-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 8px;
}

.btn-compact {
  padding: 8px 16px;
  font-size: 14px;
}

/* 响应式字体和间距 */
@media (max-width: 768px) {
  .info-row {
    font-size: 12px;
    margin-bottom: 6px;
  }

  .score-display {
    font-size: 14px;
  }

  .status-badge {
    font-size: 13px;
    padding: 8px 16px;
  }

  .game-status-prompt {
    min-height: 36px;
  }

  .matrix-container {
    gap: 4px;
  }

  .matrix-container > div {
    gap: 4px;
  }

  .btn-compact {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
