<template>
  <div class="game-page">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="game-info">
        <div class="info-item"><span>{{ t('difficulty') }}: </span><strong>{{ difficulty }}</strong></div>
        <div class="info-item"><span>{{ t('score') }}: </span><strong>{{ score }}</strong></div>
        <div class="info-item"><span>{{ t('timeLeft') }}: </span><strong>{{ formatTime(timeLeft) }}</strong></div>
      </div>
      <div class="header-actions">
        <button v-if="showBatchSkip" @click="onSkipClick" class="skip-btn">{{ t('skipGame') }}</button>
        <button @click="pauseGame" class="back-btn">{{ t('backToHome') }}</button>
      </div>
    </div>

    <!-- 阶段提示（顶部横幅） -->
    <div v-if="gamePhase === 'memorize' || gamePhase === 'selecting'" class="phase-banner">
      <div class="phase-text">{{ phaseText }}</div>
      <div class="phase-timer">
        <span v-if="gamePhase === 'memorize'">{{ t('memoryTimeLeft') }}: {{ memoryTimeLeft }}s</span>
        <span v-else>{{ t('answerTimeLeft') }}: {{ answerTimeLeft }}s</span>
      </div>
    </div>

    <!-- 记忆阶段：设计感的购物清单（记事本样式） -->
    <div v-if="gamePhase === 'memorize'" class="memorize-section">
      <div class="notepad">
        <div class="notepad-top">
          <div class="notepad-hole"></div>
          <div class="notepad-hole"></div>
          <div class="notepad-hole"></div>
          <div class="notepad-hole"></div>
        </div>
        <div class="notepad-body">
          <div class="notepad-header">
            <span class="notepad-title">🛒 {{ t('question') }}</span>
            <span class="notepad-date">{{ todayStr }}</span>
          </div>
          <ul class="notepad-list">
            <li
              v-for="(item, idx) in currentQuestion && currentQuestion.requiredItems"
              :key="item.id"
              class="notepad-line"
              :style="{ animationDelay: (idx * 0.15) + 's' }"
            >
              <span class="notepad-check">☐</span>
              <span class="notepad-name">{{ t('items.' + item.name) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 选择阶段：货架 -->
    <div v-if="gamePhase === 'selecting'" class="selecting-section">
      <div class="shelf-area">
        <div class="items-grid">
          <div
            v-for="item in currentQuestion && currentQuestion.displayItems"
            :key="item.id"
            :class="['item-card', { selected: isSelected(item) }]"
            @pointerdown="onPointerDown($event, item)"
            @pointermove="onPointerMove($event)"
            @pointerup="onPointerUp($event)"
            @pointercancel="onPointerCancel($event)"
          >
            <img :src="item.image" :alt="t('items.' + item.name)" class="item-image" />
            <div class="item-name">{{ t('items.' + item.name) }}</div>
          </div>
        </div>
      </div>

      <!-- 购物车：固定在右下角，占屏幕1/9 -->
      <div
        class="cart-fixed"
        :class="{ 'drag-over': isDragOver }"
      >
        <img :src="resolveImage('/image/1.png')" alt="cart" class="cart-fixed-image" />
        <div class="cart-fixed-badge" v-if="selectedItems.length > 0">{{ selectedItems.length }}</div>
        <div class="cart-fixed-items">
          <img
            v-for="item in selectedItems"
            :key="item.id"
            :src="item.image"
            :alt="t('items.' + item.name)"
            class="cart-fixed-item"
            @click="removeFromCart(item)"
          />
        </div>
      </div>

      <!-- 拖动时的浮动幽灵图片 -->
      <img
        v-if="touchGhost.visible"
        :src="touchGhost.image"
        class="touch-ghost"
        :style="{ left: touchGhost.x + 'px', top: touchGhost.y + 'px' }"
      />
    </div>

    <!-- 暂停确认弹窗 -->
    <div v-if="isPaused" class="pause-overlay">
      <div class="pause-box">
        <h2>{{ t('pauseTitle') }}</h2>
        <p>{{ t('pauseHint') }}</p>
        <div class="pause-actions">
          <button class="pause-btn continue-btn" @click="resumeGame">{{ t('continue') }}</button>
          <button class="pause-btn confirm-back-btn" @click="confirmBackToHome">{{ t('confirmBack') }}</button>
        </div>
      </div>
    </div>

    <!-- 反馈 -->
    <div v-if="gamePhase === 'feedback'" class="feedback-overlay">
      <div :class="['feedback-box', lastAnswerCorrect ? 'correct-box' : 'incorrect-box']">
        <div class="feedback-icon">{{ lastAnswerCorrect ? '✓' : '✗' }}</div>
        <div class="feedback-text">{{ feedbackMessage }}</div>
        <div v-if="lastAnswerCorrect" class="score-gain">+{{ lastScore }} {{ t('score') }}</div>
      </div>
    </div>

    <!-- 结束 -->
    <div v-if="gamePhase === 'gameover'" class="gameover-overlay">
      <div class="gameover-content">
        <h2>{{ t('gameOver') }}</h2>
        <div class="final-stats">
          <div class="stat-item"><span>{{ t('finalScore') }}</span><strong>{{ score }}</strong></div>
          <div class="stat-item"><span>{{ t('totalQuestions') }}</span><strong>{{ totalAnswered }}</strong></div>
          <div class="stat-item"><span>{{ t('successCount') }}</span><strong>{{ successAnswered }}</strong></div>
          <div class="stat-item"><span>{{ t('successRate') }}</span><strong>{{ successRate }}%</strong></div>
          <div class="stat-item"><span>{{ t('avgResponseTime') }}</span><strong>{{ averageResponseTime }}s</strong></div>
        </div>
        <button @click="backToHome" class="primary-btn">{{ t('backToHome') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from '../assets'
import { ref, onMounted, onUnmounted, computed, watch } from '@vue/composition-api'
import i18n, { useI18n } from '../i18n'
import { useGameLogic } from '../composables/useGameLogic'
import { saveTrainingRecord } from '../utils/storage'
import { submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'gwqd'

export default {
  methods: { resolveImage },
  name: 'GamePage',
  props: {
    duration: { type: Number, required: true },
    archiveId: { type: [String, Number], default: -1 },
  },
  emits: ['back-home'],
  setup(props, { emit }) {
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
      addToCart,
      removeFromCart,
      toggleItem,
      checkAnswer,
      evaluateIntervalAndAdjustDifficulty,
      resetGame
    } = useGameLogic()

    const gamePhase = ref('memorize')
    const timeLeft = ref(props.duration * 60)
    const memoryTimeLeft = ref(5)
    const answerTimeLeft = ref(15)
    const lastAnswerCorrect = ref(false)
    const feedbackMessage = ref('')
    const lastScore = ref(0)
    const isDragOver = ref(false)
    const isPaused = ref(false)
    const touchGhost = ref({ visible: false, x: 0, y: 0, image: '' })
    // 使用 Pointer Events 统一处理鼠标 / 触摸 / 触控笔拖动
    const activePointer = ref(null) // { id, item, startX, startY, moved }

    const showBatchSkip = shouldShowPbBatchSkip()

    let gameTimer = null
    let difficultyTimer = null
    let phaseTimer = null
    let currentAudio = null

    const phaseText = ref('')

    const todayStr = computed(() => {
      const d = new Date()
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    })

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isSelected = (item) => selectedItems.value.some(i => i.id === item.id)

    const playAudio = (index) => {
      try {
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }
        const lang = i18n.locale === 'zh' ? 'chinese' : 'english'
        currentAudio = new Audio(resolveVoice(`/voice/${lang}/${index}.mp3`))
        currentAudio.play().catch(() => {})
      } catch (e) { /* ignore */ }
    }

    const startMemorizePhase = () => {
      clearInterval(phaseTimer)
      generateQuestion()
      gamePhase.value = 'memorize'
      phaseText.value = t('memorizePrompt')
      const memTime = currentDifficultyConfig.value.memoryTime
      memoryTimeLeft.value = memTime
      playAudio(1)

      phaseTimer = setInterval(() => {
        memoryTimeLeft.value--
        if (memoryTimeLeft.value <= 0) {
          clearInterval(phaseTimer)
          startSelectingPhase()
        }
      }, 1000)
    }

    const startSelectingPhase = () => {
      clearInterval(phaseTimer)
      gamePhase.value = 'selecting'
      phaseText.value = t('selectPrompt')
      answerTimeLeft.value = currentDifficultyConfig.value.answerTime
      if (currentQuestion.value) currentQuestion.value.startTime = Date.now()
      playAudio(2)

      phaseTimer = setInterval(() => {
        answerTimeLeft.value--
        if (answerTimeLeft.value <= 0) {
          clearInterval(phaseTimer)
          submitAnswer()
        }
      }, 1000)
    }

    const submitAnswer = () => {
      clearInterval(phaseTimer)
      const isCorrect = checkAnswer()
      lastAnswerCorrect.value = isCorrect
      feedbackMessage.value = isCorrect ? t('correct') : t('incorrect')
      lastScore.value = isCorrect ? 5 * currentDifficultyConfig.value.coefficient : 0
      gamePhase.value = 'feedback'

      setTimeout(() => {
        if (timeLeft.value > 0) startMemorizePhase()
      }, 1500)
    }

    const onDragStart = (e, item) => {
      // 桌面浏览器仍支持原生 HTML5 拖拽（可选保留），Pointer Events 已覆盖主要场景
      e.dataTransfer && e.dataTransfer.setData('text/plain', String(item.id))
    }

    // ===== Pointer Events 统一处理鼠标 / 触摸 / 触控笔 =====
    const DRAG_THRESHOLD = 8 // px

    const onPointerDown = (e, item) => {
      // 只处理主按钮 / 触摸 / 笔
      if (e.pointerType === 'mouse' && e.button !== 0) return
      activePointer.value = {
        id: e.pointerId,
        item,
        startX: e.clientX,
        startY: e.clientY,
        moved: false
      }
      touchGhost.value = { visible: false, x: e.clientX, y: e.clientY, image: item.image }
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) {}
    }

    const onPointerMove = (e) => {
      const ap = activePointer.value
      if (!ap || ap.id !== e.pointerId) return
      const dx = e.clientX - ap.startX
      const dy = e.clientY - ap.startY
      if (!ap.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        ap.moved = true
        touchGhost.value.visible = true
      }
      if (ap.moved) {
        e.preventDefault()
        touchGhost.value.x = e.clientX
        touchGhost.value.y = e.clientY
        const el = document.elementFromPoint(e.clientX, e.clientY)
        isDragOver.value = !!(el && el.closest('.cart-fixed'))
      }
    }

    const onPointerUp = (e) => {
      const ap = activePointer.value
      if (!ap || ap.id !== e.pointerId) return
      if (ap.moved) {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (el && el.closest('.cart-fixed')) {
          addToCart(ap.item)
        }
      } else {
        // 点击（未拖动）：切换选中/取消
        toggleItem(ap.item)
      }
      touchGhost.value.visible = false
      isDragOver.value = false
      activePointer.value = null
      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) {}
    }

    const onPointerCancel = (e) => {
      const ap = activePointer.value
      if (!ap || ap.id !== e.pointerId) return
      touchGhost.value.visible = false
      isDragOver.value = false
      activePointer.value = null
    }

    // 当购物车物品数量达到清单要求数量时，自动判定
    watch(selectedItems, (newVal) => {
      if (
        gamePhase.value === 'selecting' &&
        currentQuestion.value &&
        newVal.length >= currentQuestion.value.requiredItems.length
      ) {
        submitAnswer()
      }
    }, { deep: true })

    const endGame = () => {
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
      clearInterval(phaseTimer)
      if (currentAudio) currentAudio.pause()
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

      const avgMs = Math.round(parseFloat(averageResponseTime.value) * 1000) || 0
      submitPbGameEndRecord(props.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgMs),
        score: score.value,
        successCount: successAnswered.value,
        failCount: failedAnswered.value,
        trainDuration: props.duration,
        difficultyLevel: difficulty.value,
      }).catch(() => {})
    }

    const backToHome = () => {
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
      clearInterval(phaseTimer)
      if (currentAudio) currentAudio.pause()
      resetGame()
      emit('back-home')
    }

    // 暂停：停止所有计时器和音频，等待用户选择继续或返回
    const pauseGame = () => {
      if (isPaused.value) return
      isPaused.value = true
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
      clearInterval(phaseTimer)
      gameTimer = null
      difficultyTimer = null
      phaseTimer = null
      if (currentAudio) {
        try { currentAudio.pause() } catch (_) {}
      }
    }

    // 继续：使用保存的剩余时间重启计时器
    const resumeGame = () => {
      if (!isPaused.value) return
      isPaused.value = false

      gameTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) endGame()
      }, 1000)

      difficultyTimer = setInterval(() => {
        evaluateIntervalAndAdjustDifficulty()
      }, 60000)

      if (gamePhase.value === 'memorize') {
        phaseTimer = setInterval(() => {
          memoryTimeLeft.value--
          if (memoryTimeLeft.value <= 0) {
            clearInterval(phaseTimer)
            startSelectingPhase()
          }
        }, 1000)
      } else if (gamePhase.value === 'selecting') {
        phaseTimer = setInterval(() => {
          answerTimeLeft.value--
          if (answerTimeLeft.value <= 0) {
            clearInterval(phaseTimer)
            submitAnswer()
          }
        }, 1000)
      }

      if (currentAudio) {
        try { currentAudio.play().catch(() => {}) } catch (_) {}
      }
    }

    const confirmBackToHome = () => {
      isPaused.value = false
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
      clearInterval(phaseTimer)
      if (currentAudio) currentAudio.pause()
      leavePbGameWindow({ confirm: false })
    }

    const onSkipClick = () => {
      skipPbBatchGame()
    }

    onMounted(() => {
      startMemorizePhase()

      gameTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) endGame()
      }, 1000)

      difficultyTimer = setInterval(() => {
        evaluateIntervalAndAdjustDifficulty()
      }, 60000)
    })

    onUnmounted(() => {
      clearInterval(gameTimer)
      clearInterval(difficultyTimer)
      clearInterval(phaseTimer)
      if (currentAudio) currentAudio.pause()
    })

    return {
      t,
      resolveImage,
      gamePhase,
      phaseText,
      difficulty,
      score,
      currentQuestion,
      selectedItems,
      totalAnswered,
      successAnswered,
      successRate,
      averageResponseTime,
      timeLeft,
      memoryTimeLeft,
      answerTimeLeft,
      lastAnswerCorrect,
      feedbackMessage,
      lastScore,
      isDragOver,
      isPaused,
      touchGhost,
      todayStr,
      formatTime,
      isSelected,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      removeFromCart,
      submitAnswer,
      pauseGame,
      resumeGame,
      confirmBackToHome,
      backToHome,
      onSkipClick,
      showBatchSkip,
    }
  }
}
</script>

<style scoped>
.game-page {
  width: 100vw;
  height: 100vh;
  height: calc(var(--real-vh, 1vh) * 100);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1.5vmin;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5vmin 2.5vmin;
  border-radius: 1.4vmin;
  box-shadow: 0 0.2vmin 0.8vmin rgba(0,0,0,0.1);
  margin-bottom: 1.5vmin;
  flex-shrink: 0;
}

.back-btn {
  padding: 1vmin 2.4vmin;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 1vmin;
  font-size: 2vmin;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}
.back-btn:hover { background: #ff5252; }

.header-actions {
  display: flex;
  gap: 1.2vmin;
  align-items: center;
}

.skip-btn {
  padding: 1vmin 2.4vmin;
  background: #adb5bd;
  color: white;
  border: none;
  border-radius: 1vmin;
  font-size: 2vmin;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}
.skip-btn:hover { background: #909aa4; }

.game-info { display: flex; gap: 4vmin; font-size: 2.2vmin; }
.info-item strong { color: #667eea; font-size: 2.8vmin; }

.phase-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5vmin 2.5vmin;
  border-radius: 1.4vmin;
  margin-bottom: 2vmin;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0.4vmin 1.2vmin rgba(102,126,234,0.3);
  flex-shrink: 0;
}
.phase-text { font-size: 2.8vmin; font-weight: bold; }
.phase-timer { font-size: 2.4vmin; font-weight: bold; background: rgba(255,255,255,0.2); padding: 0.8vmin 2vmin; border-radius: 1vmin; }

/* 记忆阶段 - 记事本风格 */
.memorize-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5vmin;
  min-height: 0;
  overflow: hidden;
}

.notepad {
  width: min(80vmin, 92%);
  max-height: 100%;
  background: transparent;
  position: relative;
  filter: drop-shadow(0 2vmin 4vmin rgba(0,0,0,0.25));
  display: flex;
  flex-direction: column;
}

.notepad-top {
  height: 4.5vmin;
  background: linear-gradient(180deg, #b48b5c 0%, #8b6540 100%);
  border-radius: 1.6vmin 1.6vmin 0 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 5vmin;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.notepad-hole {
  width: 2.4vmin;
  height: 2.4vmin;
  background: #f5f7fa;
  border-radius: 50%;
  box-shadow: inset 0 0.2vmin 0.4vmin rgba(0,0,0,0.3);
}

.notepad-body {
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0 7vmin,
      #dfe4ea 7vmin calc(7vmin + 1px)
    ),
    linear-gradient(90deg, #ff9a9e 0 0.5vmin, transparent 0.5vmin),
    #fffdf6;
  padding: 4vmin 5vmin 5vmin 9vmin;
  border-radius: 0 0 1.6vmin 1.6vmin;
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  background-position: 0 3.5vmin, 7vmin 0, 0 0;
  background-repeat: repeat, repeat-y, no-repeat;
  border-left: 0.4vmin double #f8b4b4;
}

.notepad-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 0.3vmin dashed #c8b8a0;
  padding-bottom: 2vmin;
  margin-bottom: 2.5vmin;
}

.notepad-title {
  font-size: 5vmin;
  font-weight: bold;
  color: #5a4a3a;
  font-family: 'Comic Sans MS', 'KaiTi', 'STKaiti', cursive;
}

.notepad-date {
  font-size: 2.4vmin;
  color: #a89a85;
  font-style: italic;
}

.notepad-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notepad-line {
  display: flex;
  align-items: center;
  gap: 3vmin;
  padding: 2vmin 0;
  border-bottom: 1px dashed #e5dcc8;
  animation: slideInLeft 0.5s ease-out both;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.notepad-check {
  font-size: 4.5vmin;
  color: #667eea;
  font-weight: bold;
}

.notepad-name {
  font-size: 4.5vmin;
  color: #3d3327;
  font-weight: 600;
  font-family: 'KaiTi', 'STKaiti', 'Comic Sans MS', cursive;
  letter-spacing: 0.2vmin;
}

/* 选择阶段 */
.selecting-section {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.shelf-area {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 1.4vmin;
  padding: 2.5vmin 3vmin;
  padding-right: 38vw;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.4vmin 1.2vmin rgba(0,0,0,0.1);
  height: 100%;
  overflow: hidden;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2vmin;
  width: 100%;
  max-width: 90vmin;
  height: 100%;
  max-height: 65vh;
  max-height: calc(var(--real-vh, 1vh) * 65);
}

.item-card {
  background: white;
  border: 0.3vmin solid transparent;
  border-radius: 1.4vmin;
  padding: 1.5vmin;
  cursor: grab;
  transition: all 0.25s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.2vmin 0.8vmin rgba(0,0,0,0.08);
  min-width: 0;
  min-height: 0;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.item-card:active { cursor: grabbing; }
.item-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
.item-card.selected {
  border-color: #667eea;
  background: #f0f0ff;
  box-shadow: 0 0 0 0.4vmin rgba(102,126,234,0.2);
}
.item-image { width: 100%; height: 60%; object-fit: contain; margin-bottom: 1vmin; pointer-events: none; }
.item-name { font-size: 2.2vmin; font-weight: 600; color: #333; }

/* 购物车：固定屏幕右下角，占1/9 */
.cart-fixed {
  position: fixed;
  right: 1.5vw;
  bottom: 1.5vh;
  bottom: calc(var(--real-vh, 1vh) * 1.5);
  width: 32vw;
  height: 32vh;
  height: calc(var(--real-vh, 1vh) * 32);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s;
  z-index: 100;
}
.cart-fixed-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 0.8vmin 2vmin rgba(0,0,0,0.2));
  transition: transform 0.25s;
}
.cart-fixed.drag-over .cart-fixed-image {
  transform: scale(1.08);
  filter: drop-shadow(0 1.2vmin 3vmin rgba(102,126,234,0.5));
}

.cart-fixed-badge {
  position: absolute;
  top: 8%;
  right: 10%;
  background: #ff6b6b;
  color: white;
  border-radius: 999px;
  padding: 0.8vmin 2vmin;
  font-size: 2.6vmin;
  font-weight: bold;
  box-shadow: 0 0.4vmin 1.2vmin rgba(255,107,107,0.5);
  z-index: 3;
}

.cart-fixed-items {
  position: absolute;
  top: 30%;
  left: 12%;
  right: 12%;
  bottom: 20%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8vmin;
  justify-content: center;
  align-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}
.cart-fixed-item {
  width: clamp(5vmin, 7vmin, 10vmin);
  height: clamp(5vmin, 7vmin, 10vmin);
  object-fit: contain;
  background: rgba(255,255,255,0.95);
  border-radius: 1vmin;
  padding: 0.5vmin;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s;
  box-shadow: 0 0.4vmin 1vmin rgba(0,0,0,0.25);
}
.cart-fixed-item:hover { transform: scale(1.15); background: #ffe0e0; }

/* 触摸拖动幽灵图 */
.touch-ghost {
  position: fixed;
  width: 14vmin;
  height: 14vmin;
  object-fit: contain;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  opacity: 0.9;
  filter: drop-shadow(0 1vmin 2vmin rgba(0,0,0,0.4));
  background: rgba(255,255,255,0.9);
  border-radius: 1.4vmin;
  padding: 0.8vmin;
}

/* 暂停弹窗 */
.pause-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  animation: fadeIn 0.2s ease-out;
}
.pause-box {
  background: white;
  padding: 5vmin 6vmin;
  border-radius: 2.4vmin;
  text-align: center;
  min-width: 40vmin;
  max-width: 70vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.4);
  animation: popBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.pause-box h2 {
  color: #667eea;
  font-size: 4.6vmin;
  margin-bottom: 2vmin;
}
.pause-box p {
  color: #666;
  font-size: 2.6vmin;
  margin-bottom: 4vmin;
  line-height: 1.6;
}
.pause-actions {
  display: flex;
  justify-content: center;
  gap: 3vmin;
  flex-wrap: wrap;
}
.pause-btn {
  padding: 2vmin 4.5vmin;
  border: none;
  border-radius: 1.4vmin;
  font-size: 2.6vmin;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pause-btn:hover { transform: translateY(-2px); }
.continue-btn {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  box-shadow: 0 0.4vmin 1.2vmin rgba(64,192,87,0.4);
}
.confirm-back-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: white;
  box-shadow: 0 0.4vmin 1.2vmin rgba(255,107,107,0.4);
}

/* 反馈弹窗 */
.feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}
.feedback-box {
  text-align: center;
  padding: 5vmin 7vmin;
  border-radius: 3vmin;
  animation: popBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.3);
  min-width: 40vmin;
}
.feedback-box.correct-box { background: linear-gradient(135deg, #51cf66 0%, #40c057 100%); border: 0.5vmin solid #40c057; }
.feedback-box.incorrect-box { background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); border: 0.5vmin solid #ff5252; }
.feedback-icon { font-size: 10vmin; font-weight: bold; color: white; margin-bottom: 2vmin; }
.feedback-text { font-size: 5vmin; font-weight: bold; color: white; margin-bottom: 1.5vmin; }
.score-gain { font-size: 3.6vmin; font-weight: bold; color: #fff; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popBounce {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

/* 结束弹窗 */
.gameover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2vmin;
}
.gameover-content {
  background: white;
  padding: 5vmin 6vmin;
  border-radius: 2.4vmin;
  text-align: center;
  max-width: 80vmin;
  width: 90%;
  max-height: 90vh;
  max-height: calc(var(--real-vh, 1vh) * 90);
  overflow-y: auto;
}
.gameover-content h2 { font-size: 5.4vmin; color: #667eea; margin-bottom: 3.8vmin; }
.final-stats { display: flex; flex-direction: column; gap: 2vmin; margin-bottom: 3.5vmin; }
.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 2.6vmin;
  padding: 2vmin 2.4vmin;
  background: #f5f5f5;
  border-radius: 1vmin;
}
.stat-item strong { color: #667eea; font-size: 3.2vmin; }
.primary-btn {
  padding: 2vmin 5.5vmin;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 1.4vmin;
  font-size: 2.6vmin;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}
.primary-btn:hover { transform: scale(1.05); }

/* 响应式：极窄屏（手机竖屏）叠加调整 */
@media (max-width: 600px) {
  .game-page { padding: 1.5vmin; }
  .game-header { flex-direction: column; gap: 1vmin; padding: 1.5vmin; margin-bottom: 1vmin; }
  .phase-banner { flex-direction: column; gap: 1vmin; padding: 1.5vmin; }
  .items-grid { max-height: 55vh; max-height: calc(var(--real-vh, 1vh) * 55); }
  .shelf-area { padding-right: 40vw; }
}

/* 手机竖屏（微信 web-view）适配 */
@media (orientation: portrait) {
  .game-page {
    padding: 2vmin;
    padding-bottom: calc(2vmin + env(safe-area-inset-bottom));
  }
  .game-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5vmin;
    padding: 2vmin 2.5vmin;
    padding-top: calc(2vmin + env(safe-area-inset-top));
    border-radius: 2vmin;
  }
  .game-info {
    justify-content: space-between;
    gap: 2vmin;
    font-size: max(3.2vmin, 14px);
  }
  .info-item strong { font-size: max(4vmin, 16px); }
  .header-actions {
    justify-content: flex-end;
    gap: 2vmin;
  }
  .skip-btn,
  .back-btn {
    padding: 2vmin 4vmin;
    font-size: max(3.4vmin, 15px);
    border-radius: 2vmin;
    min-width: 22vmin;
  }
  .phase-banner {
    flex-direction: column;
    gap: 1.2vmin;
    padding: 2vmin;
    border-radius: 2vmin;
  }
  .phase-text { font-size: max(4vmin, 17px); }
  .phase-timer { font-size: max(3.6vmin, 15px); padding: 1.2vmin 3vmin; }

  .notepad { width: 92%; }
  .notepad-title { font-size: max(6vmin, 20px); }
  .notepad-date { font-size: max(3.2vmin, 13px); }
  .notepad-check { font-size: max(6vmin, 22px); }
  .notepad-name { font-size: max(6vmin, 20px); }

  /* 货架：竖屏改 2 列，购物车挪到底部横条 */
  .shelf-area {
    padding: 2vmin;
    padding-right: 2vmin;
    padding-bottom: calc(34vh + env(safe-area-inset-bottom));
    padding-bottom: calc(calc(var(--real-vh, 1vh) * 34) + env(safe-area-inset-bottom));
    align-items: flex-start;
  }
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 2.5vmin;
    max-width: 100%;
    max-height: 100%;
  }
  .item-card {
    padding: 2vmin;
    border-radius: 2vmin;
  }
  .item-name { font-size: max(3.4vmin, 14px); }

  .cart-fixed {
    right: 50%;
    transform: translateX(50%);
    bottom: calc(1.5vh + env(safe-area-inset-bottom));
    width: 60vw;
    height: 28vh;
    height: calc(var(--real-vh, 1vh) * 28);
  }
  .cart-fixed-badge {
    font-size: max(3vmin, 13px);
    padding: 1vmin 2.4vmin;
  }

  /* 弹窗 90vw+ */
  .pause-box,
  .gameover-content,
  .feedback-box {
    width: 90vw;
    max-width: 90vw;
    min-width: 0;
    padding: 6vmin 5vmin;
    border-radius: 3vmin;
  }
  .pause-box h2 { font-size: max(5vmin, 20px); }
  .pause-box p { font-size: max(3.4vmin, 14px); }
  .pause-btn {
    padding: 2.4vmin 5vmin;
    font-size: max(3.4vmin, 15px);
    border-radius: 2vmin;
    min-width: 30vmin;
  }
  .feedback-icon { font-size: max(14vmin, 60px); }
  .feedback-text { font-size: max(6vmin, 22px); }
  .score-gain { font-size: max(4.2vmin, 17px); }
  .gameover-content h2 { font-size: max(6vmin, 22px); }
  .stat-item {
    font-size: max(3.4vmin, 14px);
    padding: 2.4vmin 2.8vmin;
    border-radius: 1.6vmin;
  }
  .stat-item strong { font-size: max(4vmin, 16px); }
  .primary-btn {
    padding: 2.6vmin 6vmin;
    font-size: max(3.6vmin, 15px);
    border-radius: 2vmin;
    width: 80%;
  }
}
</style>
