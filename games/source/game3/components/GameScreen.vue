<template>
  <div class="game-screen">
    <div class="game-header">
      <div class="game-info">
        <span class="info-item">
          <i class="icon">🎯</i>
          {{ t('difficulty') }}: {{ currentDifficulty }}
        </span>
        <span class="info-item">
          <i class="icon">⭐</i>
          {{ t('score') }}: {{ currentScore }}
        </span>
        <span class="info-item">
          <i class="icon">⏰</i>
          {{ t('timeRemaining') }}: {{ Math.floor(remainingTime) }}{{ t('seconds') }}
        </span>
      </div>
      <div class="nav-btns">
        <button @click="$emit('prev-question')" :disabled="!canGoPrev" class="nav-btn">&#8592;</button>
        <button @click="$emit('next-question')" :disabled="!canGoNext" class="nav-btn">&#8594;</button>
      </div>
      <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">{{ t('skip') }}</button>
      <button @click="confirmExit" class="back-btn">{{ t('back') }}</button>
    </div>

    <div class="question-container">
      <h2 class="question">{{ currentQuestion }}</h2>
    </div>

    <div class="options-container">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="option-card"
        :class="{
          'rotated': option.rotation,
          'correct': showFeedback && index === correctAnswerIndex,
          'wrong': showFeedback && selectedAnswerIndex === index && index !== correctAnswerIndex,
          'disabled': showFeedback
        }"
        @click="selectOption(index)"
      >
        <img :src="option.image" :alt="option.name" />
      </div>
    </div>
  </div>
</template>

<script>
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GameScreen',
  props: {
    t: { type: Function, required: true },
    currentDifficulty: { type: Number, required: true },
    currentScore: { type: Number, required: true },
    remainingTime: { type: Number, required: true },
    currentQuestion: { type: String, required: true },
    options: { type: Array, required: true },
    showFeedback: { type: Boolean, default: false },
    selectedAnswerIndex: { type: Number, default: -1 },
    correctAnswerIndex: { type: Number, default: -1 },
    canGoPrev: { type: Boolean, default: false },
    canGoNext: { type: Boolean, default: false }
  },
  emits: ['select-option', 'prev-question', 'next-question', 'end-game'],
  data() {
    return {
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  methods: {
    selectOption(index) {
      if (!this.showFeedback) {
        this.$emit('select-option', index);
      }
    },
    onBatchSkip() {
      skipPbBatchGame();
    },
    confirmExit() {
      leavePbGameWindow();
    },
    endGame() {
      this.$emit('end-game');
    }
  }
}
</script>

<style scoped>
.game-screen {
  height: 100vh;
  width: 100vw;
  padding: 1vh 2vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1vh;
  flex-wrap: wrap;
  gap: 1vw;
  flex-shrink: 0;
}

.game-info {
  display: flex;
  gap: 1.5vw;
  flex-wrap: wrap;
}

.info-item {
  color: white;
  font-size: clamp(11px, 1.5vw, 16px);
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.8vh 1.5vw;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5vw;
}

.icon {
  font-style: normal;
  font-size: clamp(14px, 1.8vw, 18px);
}

.nav-btns {
  display: flex;
  gap: 0.5vw;
}

.nav-btn {
  padding: 1vh 2vw;
  font-size: clamp(14px, 1.8vw, 20px);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):hover {
  background: white;
  transform: translateY(-2px);
}

.back-btn {
  padding: 1vh 3vw;
  font-size: clamp(13px, 1.5vw, 16px);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.back-btn:hover {
  background: white;
  transform: translateY(-2px);
}

.skip-btn {
  margin-right: 0.5vw;
}

.question-container {
  text-align: center;
  margin-bottom: 1vh;
  flex-shrink: 0;
}

.question {
  font-size: clamp(18px, 2.5vw, 26px);
  color: white;
  margin-bottom: 1vh;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.countdown-bar {
  width: 100%;
  max-width: 500px;
  height: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  margin: 0 auto 8px;
  overflow: hidden;
}

.countdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.1s linear;
  border-radius: 10px;
}

.countdown-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.options-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: min(2vw, 2vh);
  width: 100%;
  max-width: min(95vw, 75vh);
  margin: 0 auto;
  flex: 1;
  align-content: center;
  box-sizing: border-box;
}

.option-card {
  background: white;
  border-radius: min(15px, 2vw);
  padding: min(18px, 2.5vw);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.option-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.option-card.disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.option-card.correct {
  background: #4caf50;
  border: 3px solid #2e7d32;
  animation: correctPulse 0.5s ease-out;
}

.option-card.wrong {
  background: #f44336;
  border: 3px solid #c62828;
  animation: wrongShake 0.5s ease-out;
}

@keyframes correctPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes wrongShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.option-card.rotated img {
  transform: rotate(180deg);
}

.option-card img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}
</style>
