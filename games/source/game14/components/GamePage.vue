<template>
  <div class="game-page">
    <!-- Header -->
    <div class="game-header">
      <div class="header-left">
        <div class="stat-item">
          <span class="stat-label">{{ L.level }}</span>
          <span class="stat-val level-badge">Lv.{{ currentLevel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ L.score }}</span>
          <span class="stat-val score-val">{{ score }}</span>
        </div>
        <div class="stat-item" :class="{ 'time-warn': gameTimeLeft <= 10 }">
          <span class="stat-label">{{ L.timeLeft }}</span>
          <span class="stat-val">{{ formatTime(gameTimeLeft) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ L.question }}</span>
          <span class="stat-val">{{ currentQuestionIndex + 1 }}/{{ questionHistory.length }}</span>
        </div>
      </div>

      <div class="header-center">
        <span class="rule-text">{{ levelConfig[currentLevel].rule[lang] }}</span>
      </div>

      <div class="header-right">
        <button v-if="showBatchSkip" class="return-btn skip-btn" @click="onBatchSkip">⏭ {{ L.skip }}</button>
        <button class="return-btn" @click="confirmReturn">{{ L.return }}</button>
      </div>
    </div>

    <!-- Question area -->
    <div class="question-area" v-if="question">
      <!-- classify / classify-dual -->
      <template v-if="question.type === 'classify' || question.type === 'classify-dual'">
        <div class="single-image-wrap">
          <img :src="question.image" class="question-img" />
        </div>
        <div :key="questionKey" :class="['options-wrap', question.options.length === 2 ? 'opts-2' : 'opts-4']">
          <button
            v-for="(opt, i) in question.options"
            :key="i"
            class="opt-btn"
            :class="getOptClass(opt, i)"
            :disabled="answered"
            @click="submitAnswer(i)"
          >
            {{ opt.label[lang] }}
          </button>
        </div>
      </template>

      <!-- oddone -->
      <template v-else-if="question.type === 'oddone'">
        <div :key="questionKey" class="oddone-grid">
          <div
            v-for="(img, i) in question.images"
            :key="i"
            class="odd-card"
            :class="getOddClass(img, i)"
            @click="submitAnswer(i)"
          >
            <img :src="img.src" />
          </div>
        </div>
      </template>
    </div>

    <!-- Navigation buttons -->
    <div class="nav-buttons">
      <button class="nav-btn prev-btn" @click="goToPrevQuestion" :disabled="currentQuestionIndex === 0">
        ← {{ L.prev }}
      </button>
      <button class="nav-btn next-btn" @click="goToNextQuestion">
        {{ currentQuestionIndex === questionHistory.length - 1 ? L.nextNew : L.next }} →
      </button>
    </div>

    <!-- Feedback flash -->
    <Transition name="flash">
      <div v-if="feedbackVisible" class="feedback-flash" :class="lastCorrect ? 'flash-correct' : 'flash-wrong'">
        <div class="flash-icon">{{ lastCorrect ? '✓' : '✗' }}</div>
      </div>
    </Transition>

    <!-- Return confirm dialog -->
    <div v-if="showReturnConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p class="confirm-msg">{{ L.confirmMsg }}</p>
        <div class="confirm-btns">
          <button class="cbtn cbtn-cancel" @click="showReturnConfirm = false">{{ L.cancel }}</button>
          <button class="cbtn cbtn-confirm" @click="doReturn">{{ L.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14GamePage'
};
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import { levelConfig, generateQuestion, saveHistory } from '../utils/gameData.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({
  language: String,
  duration: Number
})

const emit = defineEmits(['end', 'return-home'])

const lang = computed(() => props.language || 'zh')

const texts = {
  zh: {
    level: '难度',
    score: '得分',
    timeLeft: '剩余',
    question: '题号',
    return: '返回',
    skip: '跳过游戏',
    prev: '上一题',
    next: '下一题',
    nextNew: '下一题（新）',
    confirmMsg: '确定要结束游戏并返回首页吗？',
    cancel: '取消',
    confirm: '确定'
  },
  en: {
    level: 'Level',
    score: 'Score',
    timeLeft: 'Time',
    question: 'Q',
    return: 'Exit',
    skip: 'Skip Game',
    prev: 'Previous',
    next: 'Next',
    nextNew: 'Next (New)',
    confirmMsg: 'End the game and return to home?',
    cancel: 'Cancel',
    confirm: 'OK'
  }
}
const L = computed(() => texts[lang.value] || texts.zh)

// Game state
const currentLevel = ref(getBatchStartDifficultyForGame('wpgl'))
const score = ref(0)
const gameTimeLeft = ref(props.duration)
const questionHistory = ref([])
const currentQuestionIndex = ref(0)
const answered = ref(false)
const answeredIndex = ref(-1)
const lastCorrect = ref(false)
const feedbackVisible = ref(false)
const showReturnConfirm = ref(false)
const questionKey = ref(0)

const question = computed(() => questionHistory.value[currentQuestionIndex.value] || null)

// Stats
const totalAnswered = ref(0)
const totalCorrect = ref(0)
const responseTimes = []
let questionStartTime = Date.now()
let windowAnswers = []
let windowStartTime = Date.now()

let mainInterval = null
let feedbackTimer = null

function formatTime(s) {
  const secs = Math.ceil(s)
  const m = Math.floor(secs / 60)
  const r = secs % 60
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${secs}s`
}

function getOptClass(opt, i) {
  if (!answered.value) return ''
  if (answeredIndex.value === i) {
    return opt.correct ? 'opt-correct' : 'opt-wrong'
  }
  if (answered.value && opt.correct) return 'opt-correct-show'
  return 'opt-dim'
}

function getOddClass(img, i) {
  if (answered.value) {
    if (answeredIndex.value === i) {
      return img.correct ? 'odd-correct' : 'odd-wrong'
    }
    if (img.correct) return 'odd-correct-show'
    return 'odd-dim'
  }
  return ''
}

function submitAnswer(index) {
  if (answered.value) return
  answered.value = true
  answeredIndex.value = index

  const responseTime = (Date.now() - questionStartTime) / 1000
  responseTimes.push(responseTime)

  let correct = false
  if (question.value.type === 'oddone') {
    correct = question.value.images[index].correct
  } else {
    correct = question.value.options[index].correct
  }

  lastCorrect.value = correct
  feedbackVisible.value = true
  totalAnswered.value++
  windowAnswers.push(correct)

  if (correct) {
    totalCorrect.value++
    const pts = Math.round(5 * levelConfig[currentLevel.value].coefficient)
    score.value += pts
  }

  feedbackTimer = setTimeout(() => {
    feedbackVisible.value = false
    goToNextQuestion()
  }, 900)
}

function goToNextQuestion() {
  if (currentQuestionIndex.value < questionHistory.value.length - 1) {
    currentQuestionIndex.value++
    answered.value = false
    answeredIndex.value = -1
    questionKey.value++
    questionStartTime = Date.now()
  } else {
    addNewQuestion()
  }
}

function goToPrevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    answered.value = false
    answeredIndex.value = -1
    questionKey.value++
    questionStartTime = Date.now()
  }
}

function addNewQuestion() {
  const newQ = generateQuestion(currentLevel.value)
  questionHistory.value.push(newQ)
  currentQuestionIndex.value = questionHistory.value.length - 1
  answered.value = false
  answeredIndex.value = -1
  questionKey.value++
  questionStartTime = Date.now()
}

function adjustDifficulty() {
  if (windowAnswers.length === 0) {
    windowAnswers = []
    windowStartTime = Date.now()
    return
  }
  const correct = windowAnswers.filter(Boolean).length
  const rate = correct / windowAnswers.length

  if (rate >= 0.9) {
    currentLevel.value = Math.min(6, currentLevel.value + 1)
  } else if (rate < 0.7) {
    currentLevel.value = Math.max(1, currentLevel.value - 1)
  }

  windowAnswers = []
  windowStartTime = Date.now()
}

function roundSec(seconds) {
  return parseFloat(Number(seconds).toFixed(2))
}

function endGame() {
  if (mainInterval) clearInterval(mainInterval)
  if (feedbackTimer) clearTimeout(feedbackTimer)

  const minRT = responseTimes.length > 0 ? roundSec(Math.min(...responseTimes)) : 0
  const maxRT = responseTimes.length > 0 ? roundSec(Math.max(...responseTimes)) : 0
  const avgRT = responseTimes.length > 0
    ? roundSec(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  const result = {
    date: new Date().toLocaleString(),
    project: props.language === 'en' ? 'Item Classification' : '物品归类',
    level: currentLevel.value,
    duration: props.duration,
    total: totalAnswered.value,
    correct: totalCorrect.value,
    incorrect: totalAnswered.value - totalCorrect.value,
    successRate: totalAnswered.value > 0 ? Math.round(totalCorrect.value / totalAnswered.value * 100) + '%' : '0%',
    minResponseTime: minRT,
    maxResponseTime: maxRT,
    avgResponseTime: avgRT,
    score: score.value
  }

  saveHistory(result)
  emit('end', result)
}

function confirmReturn() {
  showReturnConfirm.value = true
}

const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

function doReturn() {
  if (mainInterval) clearInterval(mainInterval)
  if (feedbackTimer) clearTimeout(feedbackTimer)
  showReturnConfirm.value = false
  leavePbGameWindow({ confirm: false })
}

onMounted(() => {
  questionHistory.value = [generateQuestion(currentLevel.value)]
  currentQuestionIndex.value = 0
  questionStartTime = Date.now()
  windowStartTime = Date.now()

  let lastTick = Date.now()

  mainInterval = setInterval(() => {
    const now = Date.now()
    const delta = (now - lastTick) / 1000
    lastTick = now

    // Game timer
    gameTimeLeft.value = Math.max(0, gameTimeLeft.value - delta)
    if (gameTimeLeft.value <= 0) {
      endGame()
      return
    }

    // 30s window check
    if (now - windowStartTime >= 30000) {
      adjustDifficulty()
    }
  }, 200)
})

onUnmounted(() => {
  if (mainInterval) clearInterval(mainInterval)
  if (feedbackTimer) clearTimeout(feedbackTimer)
})
</script>

<style scoped>
.game-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 1.5vmin 2.5vmin;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  flex-shrink: 0;
  gap: 1vmin;
}

.header-left {
  display: flex;
  gap: 2vmin;
  align-items: center;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: clamp(9px, 1.3vmin, 13px);
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-val {
  font-size: clamp(13px, 2.8vmin, 28px);
  font-weight: 800;
  color: #1e40af;
}

.level-badge {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  padding: 0.2vmin 0.8vmin;
  border-radius: 0.8vmin;
  font-size: clamp(11px, 2vmin, 20px);
}

.score-val {
  color: #d97706;
}

.time-warn .stat-val {
  color: #dc2626;
  animation: blink 0.6s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 1vmin;
}

.rule-text {
  font-size: clamp(11px, 2vmin, 20px);
  font-weight: 700;
  color: #334155;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.return-btn {
  padding: 0.8vmin 1.8vmin;
  background: #fee2e2;
  border: 2px solid #fca5a5;
  color: #dc2626;
  border-radius: 0.8vmin;
  font-size: clamp(11px, 1.8vmin, 18px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.return-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2vmin;
  gap: 2.5vmin;
  overflow: hidden;
}

/* Navigation buttons */
.nav-buttons {
  display: flex;
  gap: 2vmin;
  justify-content: center;
  padding: 1.5vmin 0;
  flex-shrink: 0;
}

.nav-btn {
  padding: 1.2vmin 3vmin;
  border-radius: 1vmin;
  font-size: clamp(13px, 2vmin, 20px);
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.prev-btn {
  background: #e2e8f0;
  color: #64748b;
}

.prev-btn:hover:not(:disabled) {
  background: #cbd5e1;
  transform: translateX(-2px);
}

.prev-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.next-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

.next-btn:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5);
}

/* Classify layout */
.single-image-wrap {
  width: clamp(160px, 38vmin, 420px);
  height: clamp(160px, 38vmin, 420px);
  background: white;
  border-radius: 2vmin;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  overflow: hidden;
  border: 3px solid #e2e8f0;
  flex-shrink: 0;
}

.question-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1vmin;
}

.options-wrap {
  display: flex;
  gap: 2vmin;
  width: 100%;
  max-width: 80vmin;
  justify-content: center;
  flex-wrap: wrap;
}

.opts-2 {
  flex-direction: row;
}

.opts-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.opt-btn {
  flex: 1;
  min-width: 20vmin;
  padding: 2vmin 1.5vmin;
  border-radius: 1.5vmin;
  font-size: clamp(13px, 2.5vmin, 26px);
  font-weight: 700;
  border: 3px solid #cbd5e1;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  letter-spacing: 0.02em;
}

.opt-btn:hover:not(:disabled) {
  border-color: #60a5fa;
  background: #eff6ff;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
}

.opt-correct {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
  border-color: #16a34a !important;
  color: #15803d !important;
  transform: scale(1.04) !important;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.35) !important;
}

.opt-wrong {
  background: linear-gradient(135deg, #fee2e2, #fecaca) !important;
  border-color: #dc2626 !important;
  color: #dc2626 !important;
}

.opt-correct-show {
  border-color: #16a34a !important;
  background: #f0fdf4 !important;
  color: #15803d !important;
}

.opt-dim {
  opacity: 0.4;
}

/* Odd one out layout */
.oddone-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2vmin;
  width: 100%;
  max-width: 80vmin;
}

.odd-card {
  border-radius: 2vmin;
  overflow: hidden;
  background: white;
  border: 3px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.22s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  aspect-ratio: 1;
}

.odd-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1vmin;
}

.odd-card:hover:not(.odd-correct):not(.odd-wrong):not(.odd-dim) {
  border-color: #60a5fa;
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);
}

.odd-correct {
  border-color: #16a34a !important;
  background: #dcfce7 !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4) !important;
}

.odd-wrong {
  border-color: #dc2626 !important;
  background: #fee2e2 !important;
}

.odd-correct-show {
  border-color: #16a34a !important;
  background: #f0fdf4 !important;
}

.odd-dim {
  opacity: 0.45;
}

/* Feedback flash */
.feedback-flash {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 900;
}

.flash-icon {
  font-size: clamp(48px, 15vmin, 140px);
  font-weight: 900;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.3));
  animation: popScale 0.3s ease;
}

@keyframes popScale {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.flash-correct .flash-icon { color: #16a34a; }
.flash-wrong .flash-icon { color: #dc2626; }

.flash-enter-active { transition: opacity 0.15s; }
.flash-leave-active { transition: opacity 0.35s 0.3s; }
.flash-enter-from, .flash-leave-to { opacity: 0; }

/* Return confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 800;
}

.confirm-box {
  background: white;
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
  min-width: 36vmin;
}

.confirm-msg {
  font-size: clamp(14px, 2.5vmin, 24px);
  color: #334155;
  font-weight: 600;
  margin-bottom: 3vmin;
}

.confirm-btns {
  display: flex;
  gap: 2vmin;
  justify-content: center;
}

.cbtn {
  padding: 1.2vmin 3vmin;
  border-radius: 1vmin;
  font-size: clamp(13px, 2vmin, 20px);
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.cbtn-cancel {
  background: #e2e8f0;
  color: #64748b;
}

.cbtn-cancel:hover { background: #cbd5e1; }

.cbtn-confirm {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.cbtn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
}
</style>
