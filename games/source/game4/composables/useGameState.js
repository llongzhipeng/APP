/**
 * 游戏状态管理 Composable
 * 使用 Vue3 Composition API
 */
import { reactive, computed } from '@vue/composition-api';
import { getDifficultyConfig, DIFFICULTY_ADJUSTMENT } from '../config/difficulty.js';
import { randomInt, checkSum, generateId } from '../utils/helpers.js';

// 游戏全局状态
const gameState = reactive({
  // 游戏状态
  isPlaying: false,
  isPaused: false,
  isGameOver: false,

  // 配置
  duration: 0,              // 训练时长（秒）
  difficultyLevel: 1,       // 当前难度等级

  // 游戏数据
  cards: [],                // 卡片数组
  selectedCards: [],        // 当前选中的卡片
  targetValue: 0,           // 目标值
  score: 0,                 // 当前得分
  timeLeft: 0,              // 剩余时间（秒）

  // 统计数据
  successCount: 0,          // 成功次数
  failCount: 0,             // 失败次数
  totalAttempts: 0,         // 总尝试次数
  reactionTimes: [],        // 反应时长数组
  startTime: null,          // 游戏开始时间
  currentTargetStartTime: null, // 当前目标值开始时间

  // 难度调整
  lastDifficultyCheckTime: 0,    // 上次难度检查时间
  periodSuccessCount: 0,         // 当前30秒周期的成功次数
  periodTotalCount: 0            // 当前30秒周期的总次数
});

// 定时器引用
let gameTimer = null;
let checkAnswerTimer = null;
let wrongAnswerTimer = null;
let correctAnswerTimer = null;

/**
 * 初始化游戏
 * @param {number} duration - 训练时长（秒）
 * @param {number} initialDifficulty - 初始难度等级
 */
export function useGameState() {
  const initGame = (duration, initialDifficulty = 1) => {
    // 重置状态
    Object.assign(gameState, {
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      duration,
      difficultyLevel: initialDifficulty,
      selectedCards: [],
      score: 0,
      timeLeft: duration,
      successCount: 0,
      failCount: 0,
      totalAttempts: 0,
      reactionTimes: [],
      startTime: new Date(),
      currentTargetStartTime: Date.now(),
      lastDifficultyCheckTime: Date.now(),
      periodSuccessCount: 0,
      periodTotalCount: 0
    });

    // 初始化卡片和目标值
    resetCardsAndTarget();

    // 启动计时器
    startTimer();
  };

  /**
   * 生成卡片数组
   */
  const generateCards = () => {
    const config = getDifficultyConfig(gameState.difficultyLevel);
    const cards = [];
    const [minValue, maxValue] = config.cardValueRange;

    for (let i = 0; i < config.cardCount; i++) {
      cards.push({
        id: generateId(),
        value: randomInt(minValue, maxValue),
        isSelected: false,
        isDisappearing: false
      });
    }

    return cards;
  };

  /**
   * 生成目标值
   * 确保有解（至少有一组卡片的和等于目标值）
   * 特别注意：必须保证有解，不能出现无解的情况
   */
  const generateTargetValue = (cards) => {
    const config = getDifficultyConfig(gameState.difficultyLevel);
    const [minTarget, maxTarget] = config.targetRange;
    const cardCount = config.rule; // 需要几张卡片相加

    // 策略：从现有卡片中随机选择指定数量的卡片，直接使用它们的和作为目标值
    // 如果和不在范围内，就调整卡片值后再计算
    let targetValue;
    let attempts = 0;
    const maxAttempts = 50; // 增加尝试次数

    while (attempts < maxAttempts) {
      // 随机选择指定数量的卡片
      const selectedIndices = [];
      while (selectedIndices.length < cardCount) {
        const index = randomInt(0, cards.length - 1);
        if (!selectedIndices.includes(index)) {
          selectedIndices.push(index);
        }
      }

      // 计算和
      const sum = selectedIndices.reduce((acc, idx) => acc + cards[idx].value, 0);

      // 检查是否在目标范围内
      if (sum >= minTarget && sum <= maxTarget) {
        targetValue = sum;
        break;
      }

      attempts++;
    }

    // 如果还是没找到，强制生成一个有解的目标值
    if (!targetValue) {
      // 策略：选择前N张卡片，计算它们的和
      const selectedCards = cards.slice(0, cardCount);
      let sum = selectedCards.reduce((acc, card) => acc + card.value, 0);

      // 如果和太小，增大某些卡片的值
      while (sum < minTarget) {
        const randomIndex = randomInt(0, selectedCards.length - 1);
        const increase = Math.min(5, minTarget - sum);
        selectedCards[randomIndex].value += increase;
        sum += increase;
      }

      // 如果和太大，减小某些卡片的值
      while (sum > maxTarget) {
        const randomIndex = randomInt(0, selectedCards.length - 1);
        const decrease = Math.min(selectedCards[randomIndex].value - 1, sum - maxTarget);
        if (decrease > 0) {
          selectedCards[randomIndex].value -= decrease;
          sum -= decrease;
        } else {
          break;
        }
      }

      targetValue = sum;
    }

    return targetValue;
  };

  const excludeTargetFromCards = (cards, targetValue) => {
    const config = getDifficultyConfig(gameState.difficultyLevel);
    const [minValue, maxValue] = config.cardValueRange;
    cards.forEach(card => {
      let attempts = 0;
      while (card.value === targetValue && attempts < 20) {
        card.value = randomInt(minValue, maxValue);
        attempts++;
      }
    });
  };

  /**
   * 重置卡片和目标值
   */
  const resetCardsAndTarget = () => {
    gameState.cards = generateCards();
    gameState.targetValue = generateTargetValue(gameState.cards);
    excludeTargetFromCards(gameState.cards, gameState.targetValue);
    gameState.currentTargetStartTime = Date.now();
  };

  /**
   * 选择卡片
   * @param {object} card - 卡片对象
   */
  const selectCard = (card) => {
    if (gameState.isPaused || gameState.isGameOver || card.isDisappearing) {
      return;
    }

    // 用户点击时，取消挂起的答案校验
    if (checkAnswerTimer) {
      clearTimeout(checkAnswerTimer);
      checkAnswerTimer = null;
    }

    // 若正处于"答错延迟"窗口，立即结束错误展示，让本次点击生效
    if (wrongAnswerTimer) {
      clearTimeout(wrongAnswerTimer);
      wrongAnswerTimer = null;
      gameState.selectedCards.forEach(c => {
        if (c.id !== card.id) c.isSelected = false;
      });
      gameState.selectedCards = gameState.selectedCards.filter(c => c.id === card.id);
    }

    const config = getDifficultyConfig(gameState.difficultyLevel);
    const maxSelection = config.rule;

    // 如果已经选中，则取消选中
    if (card.isSelected) {
      card.isSelected = false;
      const index = gameState.selectedCards.findIndex(c => c.id === card.id);
      if (index !== -1) {
        gameState.selectedCards.splice(index, 1);
      }
      return;
    }

    // 如果已达到最大选择数，先移除最早选中的一张，为当前点击腾出位置
    // （保证用户任何点击都能立即产生视觉反馈）
    while (gameState.selectedCards.length >= maxSelection) {
      const oldest = gameState.selectedCards.shift();
      if (oldest && oldest.id !== card.id) {
        oldest.isSelected = false;
      }
    }

    // 选中卡片
    card.isSelected = true;
    gameState.selectedCards.push(card);

    // 如果选够了指定数量的卡片，检查是否正确
    if (gameState.selectedCards.length === maxSelection) {
      checkAnswerTimer = setTimeout(() => checkAnswer(), 100);
    }
  };

  /**
   * 检查答案
   */
  const checkAnswer = () => {
    const selectedValues = gameState.selectedCards.map(c => c.value);
    const isCorrect = checkSum(selectedValues, gameState.targetValue);

    gameState.totalAttempts++;
    gameState.periodTotalCount++;

    if (isCorrect) {
      // 答对了
      handleCorrectAnswer();
    } else {
      // 答错了
      handleWrongAnswer();
    }
  };

  /**
   * 处理答对的情况
   */
  const handleCorrectAnswer = () => {
    gameState.successCount++;
    gameState.periodSuccessCount++;

    // 计算得分
    const config = getDifficultyConfig(gameState.difficultyLevel);
    const points = 5 * config.coefficient;
    gameState.score += points;

    // 记录反应时长
    const reactionTime = Date.now() - gameState.currentTargetStartTime;
    gameState.reactionTimes.push(reactionTime);

    // 快照本次答对涉及的卡片 id，避免与用户在动画期间的新点击混淆
    const disappearingIds = gameState.selectedCards.map(c => c.id);
    gameState.selectedCards.forEach(card => {
      card.isDisappearing = true;
    });
    // 立即清空选中列表，让用户可以在动画期间点击其它卡片
    gameState.selectedCards = [];

    // 延迟后生成新卡片和目标值
    correctAnswerTimer = setTimeout(() => {
      correctAnswerTimer = null;
      // 只替换真正消失的卡片，不要动用户在动画期间新点选的卡片
      // 使用 splice 保证 Vue 2 数组响应式（下标赋值不会触发更新）
      disappearingIds.forEach(id => {
        const index = gameState.cards.findIndex(c => c.id === id);
        if (index !== -1) {
          const cfg = getDifficultyConfig(gameState.difficultyLevel);
          const [minValue, maxValue] = cfg.cardValueRange;
          gameState.cards.splice(index, 1, {
            id: generateId(),
            value: randomInt(minValue, maxValue),
            isSelected: false,
            isDisappearing: false
          });
        }
      });

      // 生成新的目标值
      gameState.targetValue = generateTargetValue(gameState.cards);
      excludeTargetFromCards(gameState.cards, gameState.targetValue);
      gameState.currentTargetStartTime = Date.now();

      // 检查是否需要调整难度
      checkDifficultyAdjustment();
    }, 300);
  };

  /**
   * 处理答错的情况
   */
  const handleWrongAnswer = () => {
    clearTimeout(checkAnswerTimer);
    checkAnswerTimer = null;
    gameState.failCount++;

    // 短暂展示错误状态后，取消选中并更换题目
    wrongAnswerTimer = setTimeout(() => {
      wrongAnswerTimer = null;
      gameState.selectedCards.forEach(card => {
        card.isSelected = false;
      });
      gameState.selectedCards = [];

      // 答错后更换题目（重新生成卡片和目标值）
      resetCardsAndTarget();

      // 检查是否需要调整难度
      checkDifficultyAdjustment();
    }, 500);
  };

  /**
   * 检查并调整难度
   * 每30秒统计该时间段内的正确率
   */
  const checkDifficultyAdjustment = () => {
    const now = Date.now();
    const timeSinceLastCheck = (now - gameState.lastDifficultyCheckTime) / 1000;

    // 每30秒检查一次
    if (timeSinceLastCheck >= DIFFICULTY_ADJUSTMENT.CHECK_INTERVAL) {
      // 只统计当前30秒周期内的数据
      if (gameState.periodTotalCount > 0) {
        const successRate = gameState.periodSuccessCount / gameState.periodTotalCount;

        if (successRate > DIFFICULTY_ADJUSTMENT.UPGRADE_THRESHOLD &&
            gameState.difficultyLevel < DIFFICULTY_ADJUSTMENT.MAX_LEVEL) {
          // 提升难度
          gameState.difficultyLevel++;
          resetCardsAndTarget();
        } else if (successRate < DIFFICULTY_ADJUSTMENT.DOWNGRADE_THRESHOLD &&
                   gameState.difficultyLevel > DIFFICULTY_ADJUSTMENT.MIN_LEVEL) {
          // 降低难度
          gameState.difficultyLevel--;
          resetCardsAndTarget();
        }
      }

      // 重置当前周期的统计，开始新的30秒周期
      gameState.lastDifficultyCheckTime = now;
      gameState.periodSuccessCount = 0;
      gameState.periodTotalCount = 0;
    }
  };

  /**
   * 启动计时器
   */
  const startTimer = () => {
    if (gameTimer) {
      clearInterval(gameTimer);
    }

    gameTimer = setInterval(() => {
      if (!gameState.isPaused && gameState.isPlaying) {
        gameState.timeLeft--;

        if (gameState.timeLeft <= 0) {
          endGame();
        }
      }
    }, 1000);
  };

  /**
   * 暂停游戏
   */
  const pauseGame = () => {
    gameState.isPaused = true;
  };

  /**
   * 继续游戏
   */
  const resumeGame = () => {
    gameState.isPaused = false;
  };

  /**
   * 结束游戏
   */
  const endGame = () => {
    gameState.isPlaying = false;
    gameState.isGameOver = true;

    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
  };

  /**
   * 重置游戏
   */
  const resetGame = () => {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }

    Object.assign(gameState, {
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      cards: [],
      selectedCards: [],
      targetValue: 0,
      score: 0,
      timeLeft: 0,
      successCount: 0,
      failCount: 0,
      totalAttempts: 0,
      reactionTimes: [],
      startTime: null,
      currentTargetStartTime: null
    });
  };

  // 计算属性
  const successRate = computed(() => {
    if (gameState.totalAttempts === 0) return 0;
    return ((gameState.successCount / gameState.totalAttempts) * 100).toFixed(2);
  });

  const avgReactionTime = computed(() => {
    if (gameState.reactionTimes.length === 0) return 0;
    const sum = gameState.reactionTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / gameState.reactionTimes.length);
  });

  return {
    gameState,
    initGame,
    selectCard,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    successRate,
    avgReactionTime
  };
}
