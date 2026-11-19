<template>
  <div class="game-page">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="header-left">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">{{ t('skip') }}</button>
        <button @click="backToHome" class="back-btn">{{ t('backToHome') }}</button>
      </div>
      <div class="game-info">
        <div class="info-item">
          <span>{{ t('difficulty') }}: </span>
          <strong>{{ difficulty }}</strong>
        </div>
        <div class="info-item">
          <span>{{ t('score') }}: </span>
          <strong>{{ score }}</strong>
        </div>
        <div class="info-item">
          <span>{{ t('timeLeft') }}: </span>
          <strong>{{ formatTime(timeLeft) }}</strong>
        </div>
      </div>
    </div>

    <!-- 游戏主体 -->
    <!-- 购物阶段 -->
    <div v-if="gamePhase === 'shopping'" class="game-content">
      <div class="shelves-section">
        <div class="shelf-header">
          <div class="required-items-inline">
            <span class="required-label">{{ t('question') }}：</span>
            <span
              v-for="item in (currentQuestion && currentQuestion.requiredItems) || []"
              :key="item.id"
              class="required-item-inline"
            >{{ t(`items.${item.name}`) }}</span>
          </div>
        </div>

        <div class="items-grid">
          <div
            v-for="item in (currentQuestion && currentQuestion.displayItems) || []"
            :key="item.id"
            @click="onItemClick(item)"
            :class="['item-card', { selected: isSelected(item) }]"
          >
            <img :src="item.image" :alt="t(`items.${item.name}`)" class="item-image" />
            <div class="item-name">{{ t(`items.${item.name}`) }}</div>
            <div v-if="selectedItems.length < (currentQuestion.requiredItems && currentQuestion.requiredItems.length)" class="item-price">¥{{ item.price }}</div>
          </div>
        </div>

        <div class="cart-display">
          <div class="nav-buttons">
            <button @click="goToPrev" :disabled="historyIndex <= 0" class="nav-btn">{{ t('prevQuestion') }}</button>
            <button @click="goToNext" class="nav-btn">{{ t('nextQuestion') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 结算弹窗 -->
    <div v-if="showCheckoutModal" class="checkout-modal-overlay">
      <div class="checkout-modal">
        <h2>{{ t('selectPrice') }}</h2>
        <div class="price-options">
          <button
            v-for="price in (currentQuestion && currentQuestion.priceOptions) || []"
            :key="price"
            @click="selectPrice(price)"
            class="price-option-btn"
          >
            ¥{{ price }}
          </button>
        </div>
      </div>
    </div>

    <!-- 阶段4: 反馈 -->
    <div v-if="gamePhase === 'feedback'" class="feedback-overlay">
      <div :class="['feedback-box', lastAnswerCorrect ? 'correct-box' : 'incorrect-box']">
        <div class="feedback-icon">{{ lastAnswerCorrect ? '✓' : '✗' }}</div>
        <div class="feedback-text">{{ feedbackMessage }}</div>
        <div v-if="lastAnswerCorrect" class="score-gain">+{{ lastScore }} {{ t('score') }}</div>
      </div>
    </div>

    <!-- 游戏结束 -->
    <div v-if="gamePhase === 'gameover'" class="gameover-overlay">
      <div class="gameover-content">
        <h2>{{ t('gameOver') }}</h2>
        <div class="final-stats">
          <div class="stat-item">
            <span>{{ t('finalScore') }}</span>
            <strong>{{ score }}</strong>
          </div>
          <div class="stat-item">
            <span>{{ t('totalQuestions') }}</span>
            <strong>{{ totalAnswered }}</strong>
          </div>
          <div class="stat-item">
            <span>{{ t('successCount') }}</span>
            <strong>{{ successAnswered }}</strong>
          </div>
          <div class="stat-item">
            <span>{{ t('successRate') }}</span>
            <strong>{{ successRate }}%</strong>
          </div>
          <div class="stat-item">
            <span>{{ t('avgResponseTime') }}</span>
            <strong>{{ averageResponseTime }}s</strong>
          </div>
        </div>
        <button @click="backToHome" class="primary-btn">{{ t('backToHome') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, inject, onMounted, onUnmounted } from '@vue/composition-api'
import { useI18n } from '../i18n'
import { useGameLogic } from '../composables/useGameLogic'
import { saveTrainingRecord } from '../utils/storage'
import api from '@/api'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GamePage',
  props: {
    duration: {
      type: Number,
      required: true
    }
  },
  emits: ['back-home'],
  setup(props, { emit }) {
    const archiveId = inject('archiveId', ref(-1))
    const { t } = useI18n()
    const {
      difficulty,
      score,
      responseTimes,
      currentQuestion,
      selectedItems,
      totalAnswered,
      successAnswered,
      failedAnswered,
      currentDifficultyConfig,
      averageResponseTime,
      successRate,
      generateQuestion,
      toggleItem,
      checkItemSelection,
      checkPriceAnswer,
      evaluateIntervalAndAdjustDifficulty,
      resetGame
    } = useGameLogic()

    const gamePhase = ref('shopping') // shopping, feedback, gameover
    const showCheckoutModal = ref(false)
    const timeLeft = ref(props.duration * 60)
    const lastAnswerCorrect = ref(false)
    const feedbackMessage = ref('')
    const lastScore = ref(0)

    // 题目历史，用于上一题/下一题导航
    const questionSnapshots = ref([]) // [{question, selectedItems, answered}]
    const historyIndex = ref(-1)

    let gameTimer = null
    let difficultyTimer = null

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isSelected = (item) => {
      return selectedItems.value.some(i => i.id === item.id)
    }

    const startQuestionPhase = () => {
      generateQuestion()
      questionSnapshots.value.push({ question: currentQuestion.value, answered: false })
      historyIndex.value = questionSnapshots.value.length - 1
      gamePhase.value = 'shopping'
      showCheckoutModal.value = false
    }

    const onItemClick = (item) => {
      toggleItem(item)
      if (checkItemSelection()) {
        showCheckoutModal.value = true
      }
    }

    const selectPrice = (selectedPrice) => {
      showCheckoutModal.value = false
      const isCorrect = checkPriceAnswer(selectedPrice)
      lastAnswerCorrect.value = isCorrect
      feedbackMessage.value = isCorrect ? t('correct') : t('incorrect')
      lastScore.value = isCorrect ? 5 * currentDifficultyConfig.value.coefficient : 0
      questionSnapshots.value[historyIndex.value].answered = true
      showFeedback()
    }

    const showFeedback = () => {
      gamePhase.value = 'feedback'
      setTimeout(() => {
        if (timeLeft.value > 0) {
          startQuestionPhase()
        }
      }, 1500)
    }

    const goToPrev = () => {
      if (historyIndex.value <= 0) return
      historyIndex.value--
      currentQuestion.value = questionSnapshots.value[historyIndex.value].question
      selectedItems.value = []
      showCheckoutModal.value = false
    }

    const goToNext = () => {
      if (historyIndex.value < questionSnapshots.value.length - 1) {
        historyIndex.value++
        currentQuestion.value = questionSnapshots.value[historyIndex.value].question
        selectedItems.value = []
        showCheckoutModal.value = false
      } else {
        startQuestionPhase()
      }
    }

    const showBatchSkip = shouldShowPbBatchSkip()
    function onBatchSkip() { skipPbBatchGame() }

    const backToHome = () => {
      if (!leavePbGameWindow()) return
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
    }

    const endGame = () => {
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
      gamePhase.value = 'gameover'

      saveTrainingRecord({
        difficulty: difficulty.value,
        duration: props.duration,
        totalQuestions: totalAnswered.value,
        successCount: successAnswered.value,
        failCount: failedAnswered.value,
        successRate: successRate.value,
        avgResponseTime: averageResponseTime.value,
        score: score.value
      })
      const times = responseTimes.value
      const body = {
          archiveId: archiveId.value,
          trainType: 'capacity',
          gameType: 'csgw',
          minTime: times.length ? Math.min(...times) : 0,
          maxTime: times.length ? Math.max(...times) : 0,
          avgTime: parseFloat(averageResponseTime.value),
          score: score.value,
          successCount: successAnswered.value, // 成功次数
          failCount: failedAnswered.value, // 失败次数
          trainDuration: props.duration, // 训练时长（分钟，与方案一致）
          difficultyLevel: difficulty.value, // 结束时难度
        }
       api.submitPbGameRecord(body).catch(() => {});
    }

    onMounted(() => {
      // 开始游戏
      startQuestionPhase()

      // 总时间倒计时
      gameTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          endGame()
        }
      }, 1000)

      // 每30秒评估一次难度调整
      difficultyTimer = setInterval(() => {
        evaluateIntervalAndAdjustDifficulty()
      }, 30000)
    })

    onUnmounted(() => {
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
    })

    return {
      t,
      gamePhase,
      showCheckoutModal,
      difficulty,
      score,
      currentQuestion,
      selectedItems,
      totalAnswered,
      successAnswered,
      successRate,
      averageResponseTime,
      timeLeft,
      lastAnswerCorrect,
      feedbackMessage,
      lastScore,
      questionSnapshots,
      historyIndex,
      formatTime,
      isSelected,
      toggleItem,
      onItemClick,
      selectPrice,
      goToPrev,
      goToNext,
      backToHome,
      showBatchSkip,
      onBatchSkip
    }
  }
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.back-btn {
  padding: 10px 20px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #ff5252;
}

.game-info {
  display: flex;
  gap: 30px;
  font-size: 18px;
}

.info-item strong {
  color: #667eea;
  font-size: 22px;
}

.game-content {
  max-width: 1200px;
  margin: 0 auto;
}

.required-items-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  justify-content: center;
}

.required-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.required-item-inline {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
}

.question-timer,
.answer-timer {
  font-size: 24px;
  color: #ff6b6b;
  font-weight: bold;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.nav-btn {
  padding: 10px 24px;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: white;
  color: #667eea;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.shelves-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  position: relative;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
}

.shelves-section > * {
  position: relative;
  z-index: 1;
}

.shelf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px 12px 0 0;
}

.shelf-header h3 {
  color: #333;
  font-size: 22px;
  margin: 0;
  flex: 1;
  text-align: center;
}

.checkout-btn {
  padding: 10px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.checkout-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 3%;
  row-gap: 8%;
  padding: 3% 15% 5% 15%;
  flex: 1;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.cart-display {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px 30px;
  border-radius: 0 0 12px 12px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cart-display .selected-items {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
  min-height: 30px;
}

.cart-display .answer-timer {
  font-size: 18px;
  color: #ff6b6b;
  font-weight: bold;
}

.item-card {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  min-height: 0;
}

/* 第二行的商品向上移动 */
.item-card:nth-child(n+5) {
  transform: translateY(0px);
}

.item-card:nth-child(n+5):hover {
  transform: translateY(0px) scale(1.05);
}

.item-card:nth-child(n+5).selected .item-image {
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.8));
  transform: scale(1.1);
}

.item-card:hover {
  transform: scale(1.05);
}

.item-card.selected {
  background: transparent;
  color: #667eea;
  border: none;
  box-shadow: none;
}

.item-card.selected .item-image {
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.8));
  transform: scale(1.1);
}

.item-image {
  width: 100%;
  height: 90px;
  object-fit: contain;
  margin-bottom: 8px;
  border-radius: 4px;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
}

.item-price {
  font-size: 22px;
  font-weight: bold;
  color: #ff6b6b;
}

.item-card.selected .item-price {
  color: #667eea;
  font-weight: 900;
}

.selected-item-tag {
  background: #e0e7ff;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.empty-cart {
  color: #666;
  font-size: 14px;
  font-weight: 600;
}

.checkout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

.checkout-modal {
  background: white;
  padding: 40px 50px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  text-align: center;
  animation: popBounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.checkout-modal h2 {
  color: #667eea;
  margin-bottom: 30px;
  font-size: 28px;
}

.price-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 600px;
  margin: 0 auto 30px;
}

.price-option-btn {
  padding: 30px;
  background: #f5f5f5;
  border: 3px solid #667eea;
  border-radius: 12px;
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s;
}

.price-option-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
}

.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.feedback-box {
  text-align: center;
  padding: 60px 80px;
  border-radius: 30px;
  animation: popBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  min-width: 400px;
}

.feedback-box.correct-box {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  border: 5px solid #40c057;
}

.feedback-box.incorrect-box {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border: 5px solid #ff5252;
}

.feedback-icon {
  font-size: 120px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  animation: iconPulse 0.6s ease-out;
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.feedback-text {
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.score-gain {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  animation: scoreUp 0.5s ease-out 0.3s both;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes popBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes scoreUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.gameover-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.gameover-content {
  background: white;
  padding: 50px;
  border-radius: 20px;
  text-align: center;
  max-width: 600px;
  width: 90%;
}

.gameover-content h2 {
  font-size: 42px;
  color: #667eea;
  margin-bottom: 30px;
}

.final-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-item strong {
  color: #667eea;
  font-size: 24px;
}

.primary-btn {
  padding: 15px 40px;
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

/* 响应式设计 - 确保所有内容在一屏内显示 */
@media (max-width: 1024px) {
  .game-page {
    padding: 10px;
  }

  .game-header {
    padding: 15px 20px;
    margin-bottom: 15px;
  }

  .game-info {
    gap: 15px;
    font-size: 14px;
  }

  .info-item strong {
    font-size: 18px;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .game-page {
    padding: 8px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .game-header {
    padding: 12px 15px;
    margin-bottom: 10px;
    flex-direction: column;
    gap: 10px;
  }

  .game-info {
    gap: 10px;
    font-size: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .info-item strong {
    font-size: 16px;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 14px;
    width: 100%;
  }

  .game-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* 问题阶段 */
  .question-section {
    padding: 20px 15px;
    margin-bottom: 10px;
  }

  .question-section h2 {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .required-items {
    gap: 8px;
  }

  .required-item {
    padding: 10px 20px;
    font-size: 16px;
  }

  .question-timer,
  .answer-timer {
    font-size: 18px;
  }

  /* 货架和商品 */
  .shelves-section {
    max-width: 100%;
    margin-bottom: 10px;
  }

  .shelf-header {
    padding: 10px 15px;
    flex-direction: row;
  }

  .shelf-header h3 {
    font-size: 16px;
  }

  .checkout-btn {
    padding: 8px 20px;
    font-size: 14px;
  }

  .items-grid {
    padding: 5% 8% 3% 8%;
    gap: 2%;
    row-gap: 5%;
    max-width: 100%;
  }

  /* 购物车显示 */
  .cart-display {
    padding: 10px 15px;
  }

  .cart-display .selected-items {
    margin-bottom: 8px;
    min-height: 25px;
  }

  .selected-item-tag {
    padding: 6px 12px;
    font-size: 12px;
  }

  .cart-display .answer-timer {
    font-size: 16px;
  }

  /* 第二行商品 - 移动端调整 */
  .item-card:nth-child(n+5) {
    transform: translateY(0px);
  }

  .item-card:nth-child(n+5):hover {
    transform: translateY(0px) scale(1.05);
  }

  .item-image {
    height: 65px;
    margin-bottom: 5px;
  }

  .item-name {
    font-size: 15px;
    margin-bottom: 5px;
  }

  .item-price {
    font-size: 18px;
  }

  /* 结算页面 */
  .checkout-section {
    padding: 30px 20px;
  }

  .checkout-section h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .price-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 100%;
    margin-bottom: 20px;
  }

  .price-option-btn {
    padding: 20px;
    font-size: 24px;
  }

  /* 反馈弹窗 */
  .feedback-box {
    padding: 40px 50px;
    min-width: auto;
    width: 80%;
  }

  .feedback-icon {
    font-size: 80px;
  }

  .feedback-text {
    font-size: 36px;
  }

  .score-gain {
    font-size: 28px;
  }

  /* 游戏结束 */
  .gameover-content {
    padding: 30px 20px;
  }

  .gameover-content h2 {
    font-size: 32px;
  }

  .stat-item {
    font-size: 16px;
    padding: 12px;
  }

  .stat-item strong {
    font-size: 20px;
  }
}

/* 超小屏幕（手机竖屏）*/
@media (max-width: 480px) {
  .game-header {
    padding: 10px;
  }

  .game-info {
    font-size: 11px;
  }

  .info-item strong {
    font-size: 14px;
  }

  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .question-section {
    padding: 15px 10px;
  }

  .question-section h2 {
    font-size: 18px;
  }

  .required-item {
    padding: 8px 16px;
    font-size: 14px;
  }

  .items-grid {
    padding: 5% 5% 3% 5%;
    gap: 1.5%;
    row-gap: 4%;
  }

  .checkout-btn {
    padding: 6px 15px;
    font-size: 12px;
  }

  .cart-display {
    padding: 8px 12px;
  }

  .cart-display .selected-items {
    margin-bottom: 6px;
  }

  .cart-display .answer-timer {
    font-size: 14px;
  }

  .item-card:nth-child(n+5) {
    transform: translateY(0px);
  }

  .item-card:nth-child(n+5):hover {
    transform: translateY(0px) scale(1.05);
  }

  .item-image {
    height: 55px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-price {
    font-size: 16px;
  }

  .checkout-section {
    padding: 20px 15px;
  }

  .checkout-section h2 {
    font-size: 20px;
  }

  .price-options {
    gap: 10px;
  }

  .price-option-btn {
    padding: 15px;
    font-size: 20px;
  }

  .feedback-box {
    padding: 30px 40px;
  }

  .feedback-icon {
    font-size: 60px;
  }

  .feedback-text {
    font-size: 28px;
  }

  .score-gain {
    font-size: 22px;
  }

  .gameover-content {
    padding: 20px 15px;
  }

  .gameover-content h2 {
    font-size: 24px;
  }

  .stat-item {
    font-size: 14px;
    padding: 10px;
  }

  .stat-item strong {
    font-size: 18px;
  }

  .primary-btn {
    padding: 12px 30px;
    font-size: 16px;
  }
}

/* 横屏模式优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .game-page {
    padding: 5px;
  }

  .game-header {
    padding: 8px 15px;
    margin-bottom: 5px;
  }

  .question-section,
  .checkout-section {
    padding: 10px;
  }

  .shelf-header {
    padding: 8px 15px;
  }

  .checkout-btn {
    padding: 6px 15px;
    font-size: 13px;
  }

  .cart-display {
    padding: 8px 15px;
  }

  .cart-display .answer-timer {
    font-size: 14px;
  }

  .question-section h2,
  .checkout-section h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .required-item {
    padding: 6px 15px;
    font-size: 14px;
  }

  .items-grid {
    padding: 3% 8% 3% 8%;
  }

  .item-image {
    height: 50px;
  }

  .item-name {
    font-size: 13px;
  }

  .item-price {
    font-size: 15px;
  }

  .item-card:nth-child(n+5) {
    transform: translateY(0px);
  }

  .item-card:nth-child(n+5):hover {
    transform: translateY(0px) scale(1.05);
  }

  .price-option-btn {
    padding: 10px;
    font-size: 18px;
  }

  .feedback-box {
    padding: 20px 30px;
  }

  .feedback-icon {
    font-size: 50px;
  }

  .feedback-text {
    font-size: 24px;
  }
}
</style>
