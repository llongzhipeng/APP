<template>
  <div class="game-container">
    <div class="top-right-controls">
      <button
        v-if="showBatchSkip"
        class="top-btn skip-btn"
        @click="onBatchSkip"
      >{{ t('skip') }}</button>
      <button class="top-btn back-btn" @click="handleBack">{{ t('back') }}</button>
    </div>

    <GameHeader
      :remaining-time="remainingTime"
      :score="score"
      :difficulty="currentDifficulty"
    />

    <div class="game-content">
      <div class="left-panel">
        <ImageDisplay
          :elements="currentQuestion.allElements"
          :removed-elements="currentQuestion.removedElements"
          :mode="imageMode"
          :display-time-left="currentQuestion.displayTimeLeft"
        />

        <div class="nav-controls">
          <button class="nav-btn" @click="goToPrevQuestion">上一题</button>
          <button class="nav-btn" @click="goToNextQuestion">下一题</button>
        </div>

        <GameControls
          @finish="handleFinish"
        />
      </div>

      <div class="right-panel">
        <OptionsPanel
          v-if="gameState === 'answering' || gameState === 'feedback'"
          :options="currentQuestion.options"
          :selected-answers="selectedAnswers"
          :correct-answers="currentQuestion.correctAnswers"
          :required-count="currentQuestion.requiredCount"
          :answered="gameState === 'feedback'"
          @select="handleAnswer"
        />
      </div>
    </div>
  </div>
</template>

<script>
import GameHeader from './game/GameHeader.vue'
import ImageDisplay from './game/ImageDisplay.vue'
import OptionsPanel from './game/OptionsPanel.vue'
import GameControls from './game/GameControls.vue'
import { generateQuestion, isAnswerComplete, isFinalAnswerCorrect } from '../utils/questionGenerator.js'
import { checkAndAdjustDifficulty } from '../utils/difficultyManager.js'
import { calculateQuestionScore } from '../utils/scoreCalculator.js'
import { generateUUID } from '../utils/helpers.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GameContainer',
  inject: ['i18n'],
  components: {
    GameHeader,
    ImageDisplay,
    OptionsPanel,
    GameControls
  },
  props: {
    duration: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      gameState: 'idle', // idle | showing | answering | feedback
      currentDifficulty: getBatchStartDifficultyForGame('jyhsz'),
      score: 0,
      showBatchSkip: shouldShowPbBatchSkip(), // 仅一键启动显示跳过
      totalTime: this.duration,
      remainingTime: this.duration,
      gameStartTime: null, // 游戏开始时间戳

      currentQuestion: {
        allElements: [],
        removedElements: [],
        options: [],
        correctAnswers: [],
        requiredCount: 1,
        displayTimeLeft: 0
      },

      selectedAnswers: [],

      questionHistory: [], // 所有已生成题目的快照 {question, selectedAnswers}
      historyIndex: -1,    // 当前浏览的历史索引，-1表示当前题

      answerHistory: [],

      statistics: {
        totalCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        totalResponseTime: 0,
        difficultySum: 0
      },

      timers: {
        mainTimer: null,
        displayTimer: null,
        difficultyCheckTimer: null
      },

      lastDifficultyCheckPeriod: -1 // 记录上次检查的时间段索引
    }
  },
  computed: {
    imageMode() {
      return this.gameState === 'showing' ? 'full' : 'missing'
    },
    t() {
      return key => this.i18n.t(key)
    }
  },
  mounted() {
    this.startGame()
  },
  beforeUnmount() {
    this.clearAllTimers()
  },
  methods: {
    async startGame() {
      this.gameState = 'idle'
      this.gameStartTime = Date.now() // 记录游戏开始时间
      this.startMainTimer()
      this.startDifficultyCheckTimer() // 启动难度检查定时器
      await this.nextQuestion()
    },

    async nextQuestion() {
      // 检查时间是否用完
      if (this.remainingTime <= 0) {
        this.endGame()
        return
      }

      // 生成新题目
      this.currentQuestion = generateQuestion(this.currentDifficulty)
      this.selectedAnswers = [] // 重置已选答案

      // 展示完整图片
      await this.showFullImage()

      // 展示缺失图片并等待答题
      await this.waitForAnswer()

      // 下一题
      await this.nextQuestion()
    },

    async showFullImage() {
      this.gameState = 'showing'

      return new Promise(resolve => {
        this.timers.displayTimer = setInterval(() => {
          this.currentQuestion.displayTimeLeft--

          if (this.currentQuestion.displayTimeLeft <= 0) {
            clearInterval(this.timers.displayTimer)
            this.timers.displayTimer = null
            resolve()
          }
        }, 1000)
      })
    },

    async waitForAnswer() {
      this.gameState = 'answering'
      this.answerStartTime = Date.now()
      return new Promise(resolve => {
        this.answerCallback = () => {
          setTimeout(() => resolve(), 800)
        }
      })
    },

    handleAnswer(selectedOptionId) {
      if (this.gameState !== 'answering') return
      if (this.selectedAnswers.includes(selectedOptionId)) return

      this.selectedAnswers.push(selectedOptionId)
      const responseTime = (Date.now() - this.answerStartTime) / 1000
      if (isAnswerComplete(this.currentQuestion, this.selectedAnswers)) {
        const isCorrect = isFinalAnswerCorrect(this.currentQuestion, this.selectedAnswers)
        this.recordAnswer(isCorrect, responseTime)
        if (isCorrect) {
          this.score += calculateQuestionScore(this.currentDifficulty, true)
        }
        this.gameState = 'feedback'

        // 保存到历史
        this.questionHistory.push({
          question: { ...this.currentQuestion },
          selectedAnswers: [...this.selectedAnswers]
        })
        this.historyIndex = -1

        if (this.answerCallback) {
          this.answerCallback()
          this.answerCallback = null
        }
      }
    },

    recordAnswer(isCorrect, responseTime) {
      const now = Date.now()

      // 添加到答题历史
      this.answerHistory.push({
        timestamp: now,
        isCorrect,
        responseTime,
        difficulty: this.currentDifficulty
      })

      // 更新统计
      this.statistics.totalCount++
      if (isCorrect) {
        this.statistics.correctCount++
      } else {
        this.statistics.incorrectCount++
      }
      this.statistics.totalResponseTime += responseTime
      this.statistics.difficultySum += this.currentDifficulty
    },

    startDifficultyCheckTimer() {
      // 每秒检查一次是否到达30秒边界
      this.timers.difficultyCheckTimer = setInterval(() => {
        this.checkDifficultyAdjustment()
      }, 1000)
    },

    checkDifficultyAdjustment() {
      if (!this.gameStartTime) return

      const now = Date.now()
      const elapsedSeconds = Math.floor((now - this.gameStartTime) / 1000)

      // 计算刚结束的30秒时间段的索引
      const completedPeriodIndex = Math.floor(elapsedSeconds / 30) - 1

      // 检查是否刚好到达30秒边界（30秒、60秒、90秒...）
      const isAt30SecondMark = elapsedSeconds % 30 === 0 && elapsedSeconds > 0

      // 如果到达30秒边界，且这个时间段还没检查过
      if (isAt30SecondMark && completedPeriodIndex >= 0 && completedPeriodIndex > this.lastDifficultyCheckPeriod) {
        const result = checkAndAdjustDifficulty(
          this.currentDifficulty,
          this.answerHistory,
          this.gameStartTime,
          now
        )

        // 输出调试信息（无论是否变化）
        const periodStart = completedPeriodIndex * 30
        const periodEnd = (completedPeriodIndex + 1) * 30

        console.log(`=== 第${elapsedSeconds}秒 - 难度检查 ===`)
        console.log(`统计时间段: ${periodStart}-${periodEnd}秒`)
        console.log(`当前难度: ${this.currentDifficulty}`)
        console.log(`该时间段答题数: ${this.answerHistory.filter(r => r.timestamp >= result.periodStart && r.timestamp < result.periodEnd).length}`)
        console.log(`正确率: ${result.accuracy !== null ? (result.accuracy * 100).toFixed(1) + '%' : '无答题记录'}`)

        if (result.changed) {
          this.currentDifficulty = result.newLevel
          console.log(`✓ 难度调整: ${result.increased ? '升级' : '降级'} -> 等级 ${this.currentDifficulty}`)
        } else {
          if (result.accuracy === null) {
            console.log(`✗ 难度未变化: 该时间段内无答题记录`)
          } else if (result.accuracy > 0.9) {
            console.log(`✗ 难度未变化: 正确率${(result.accuracy * 100).toFixed(1)}%，但已达到最高难度`)
          } else if (result.accuracy < 0.7) {
            console.log(`✗ 难度未变化: 正确率${(result.accuracy * 100).toFixed(1)}%，但已达到最低难度`)
          } else {
            console.log(`✗ 难度未变化: 正确率${(result.accuracy * 100).toFixed(1)}%在70%-90%之间`)
          }
        }
        console.log('===============================')

        this.lastDifficultyCheckPeriod = completedPeriodIndex
      }
    },

    startMainTimer() {
      this.timers.mainTimer = setInterval(() => {
        this.remainingTime--

        if (this.remainingTime <= 0) {
          this.clearAllTimers()
          this.endGame()
        }
      }, 1000)
    },

    endGame() {
      this.clearAllTimers()

      const times = this.answerHistory.map(r => r.responseTime)
      const record = {
        id: generateUUID(),
        trainingTime: new Date().toISOString(),
        projectName: '记忆画师',
        averageDifficulty: this.statistics.totalCount > 0
          ? this.statistics.difficultySum / this.statistics.totalCount
          : 0,
        duration: this.totalTime,
        totalCount: this.statistics.totalCount,
        successCount: this.statistics.correctCount,
        failureCount: this.statistics.incorrectCount,
        successRate: this.statistics.totalCount > 0
          ? this.statistics.correctCount / this.statistics.totalCount
          : 0,
        averageResponseTime: this.statistics.totalCount > 0
          ? this.statistics.totalResponseTime / this.statistics.totalCount
          : 0,
        minResponseTime: times.length ? Math.min(...times) : 0,
        maxResponseTime: times.length ? Math.max(...times) : 0,
        score: this.score,
        difficultyLevel: this.currentDifficulty,
      }

      this.$emit('game-finished', record)
    },

    handleBack() {
      if (!leavePbGameWindow()) return // 二次确认后关闭当前页
      this.clearAllTimers()
    },

    /**
     * <summary>
     * 一键启动批次：跳过当前游戏（不上传）
     * </summary>
     */
    onBatchSkip() {
      skipPbBatchGame()
    },

    handleFinish() {
      if (confirm('确定要结束训练吗？')) {
        this.clearAllTimers() // 停止所有计时器
        leavePbGameWindow({ confirm: false })
      }
    },

    clearAllTimers() {
      Object.values(this.timers).forEach(timer => {
        if (timer) clearInterval(timer)
      })
      this.timers = {
        mainTimer: null,
        displayTimer: null,
        difficultyCheckTimer: null
      }
    },

    goToPrevQuestion() {
      if (this.questionHistory.length === 0) return
      if (this.historyIndex === -1) {
        this.historyIndex = this.questionHistory.length - 1
      } else if (this.historyIndex > 0) {
        this.historyIndex--
      }
      this.loadHistoryQuestion(this.historyIndex)
    },

    goToNextQuestion() {
      if (this.historyIndex === -1) return
      if (this.historyIndex < this.questionHistory.length - 1) {
        this.historyIndex++
        this.loadHistoryQuestion(this.historyIndex)
      } else {
        // 回到当前答题
        this.historyIndex = -1
        this.currentQuestion = generateQuestion(this.currentDifficulty)
        this.selectedAnswers = []
        this.gameState = 'answering'
        // 重新等待答题
        this.waitForAnswer().then(() => this.nextQuestion())
      }
    },

    loadHistoryQuestion(index) {
      const entry = this.questionHistory[index]
      this.currentQuestion = { ...entry.question }
      this.selectedAnswers = [...entry.selectedAnswers]
      this.gameState = 'feedback'
    }
  }
}
</script>

<style scoped>
.game-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.top-right-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.top-btn {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s;
}

.top-btn.skip-btn {
  background-color: #FF9800;
}

.top-btn.skip-btn:hover {
  background-color: #F57C00;
  transform: translateY(-2px);
}

.top-btn.back-btn {
  background-color: #9E9E9E;
}

.top-btn.back-btn:hover {
  background-color: #757575;
  transform: translateY(-2px);
}

.game-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  flex: 1;
}

.left-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  width: 400px;
  flex-shrink: 0;
}

.nav-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.nav-btn {
  padding: 8px 24px;
  border: 2px solid #4CAF50;
  background: #fff;
  color: #4CAF50;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #4CAF50;
  color: #fff;
}

/* 平板设备 (768px - 1200px) */
@media (max-width: 1200px) and (min-width: 768px) {
  .game-container {
    padding: 20px 15px;
  }

  .game-content {
    gap: 20px;
  }

  .right-panel {
    width: 350px;
  }
}

/* 小屏设备 (手机和小平板) */
@media (max-width: 767px) {
  .game-container {
    padding: 15px 10px;
    min-height: 100vh;
  }

  .game-content {
    flex-direction: column;
    gap: 20px;
  }

  .right-panel {
    width: 100%;
  }
}
</style>
