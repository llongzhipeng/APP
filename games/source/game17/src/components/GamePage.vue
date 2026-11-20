<template>
  <div class="game-page">
    <!-- Background -->
    <div class="bg-gradient"></div>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.level }}</span>
          <span class="hud-value level-badge">{{ difficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-value">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-value" :class="{ 'time-urgent': gameTimeLeft <= 10 }">{{ formatTime(gameTimeLeft) }}</span>
        </div>
      </div>
      <div class="hud-center">
        <span class="task-msg">{{ t.taskMsg }}</span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
        <button class="back-btn" @click="onBackClick">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Cards area -->
    <div class="cards-area">
      <div
        v-for="(card, i) in cards"
        :key="roundKey + '-' + i"
        class="card"
        :class="cardClass(card)"
        @click="onCardClick(card)"
      >
        <img
          :src="card.src"
          :style="card.transform ? `transform: ${card.transform}` : ''"
          class="card-img"
          draggable="false"
        />
        <transition name="result-pop">
          <div v-if="card.result" class="card-result" :class="card.result">
            {{ card.result === 'correct' ? '✓' : '✗' }}
          </div>
        </transition>
      </div>
    </div>

    <!-- Click feedback overlay -->
    <transition name="feedback-fade">
      <div v-if="feedback" class="feedback-overlay">
        <div class="feedback-msg" :class="feedback">
          {{ feedback === 'correct' ? t.correct : t.wrong }}
        </div>
      </div>
    </transition>

    <!-- Confirm back dialog -->
    <div v-if="showBackConfirm" class="confirm-overlay" @click.self="cancelBack">
      <div class="confirm-box">
        <p class="confirm-text">{{ t.confirmBack }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="cancelBack">{{ t.cancel }}</button>
          <button class="cbtn confirm" @click="forceBack">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import messages from '../i18n.js'
import { spotDiffImage } from '../../utils/images'
import { getBatchStartDifficultyForGame, isActiveBatchGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ lang: String, duration: Number })
const emit = defineEmits(['end', 'back'])
const t = computed(() => messages[props.lang] || messages.zh)
const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

const TYPES = ['tiger', 'dog', 'birdie', 'duck', 'house', 'people', 'tree', 'women']
const DIFF_COUNTS = { One_difference: 3, Two_difference: 3, Three_difference: 3, Many_differences: 3 }

// State
const roundKey = ref(0)
const difficulty = ref(getBatchStartDifficultyForGame('spotdiff'))
const cards = ref([])
const score = ref(0)
const gameTimeLeft = ref(props.duration)
const totalRounds = ref(0)
const correctRounds = ref(0)
const wrongRounds = ref(0)
const feedback = ref(null)
const showBackConfirm = ref(false)
const answered = ref(false)

// 60s window for difficulty adjustment
const windowStart = ref(Date.now())
const windowCorrect = ref(0)
const windowTotal = ref(0)

// Reaction time
const roundStartTime = ref(0)
const totalReactionMs = ref(0)
const reactionCount = ref(0)

const COEFFS = [1, 1.5, 2, 2.5, 3, 3.5]

let gameTimer = null
let feedbackTimer = null
let vhHandler = null
let pausedAt = 0

function rand(n) { return Math.floor(Math.random() * n) }
function randItem(arr) { return arr[rand(arr.length)] }
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function imgPath(type, sub, file) {
  return spotDiffImage(type, sub, file)
}

function randomFlip() {
  const flips = ['scaleX(-1)', 'scaleY(-1)', 'scaleX(-1) scaleY(-1)']
  return randItem(flips)
}

function buildCards() {
  const d = difficulty.value
  let newCards = []

  if (d === 1) {
    // 3 same type template + 1 different type template
    const mainType = randItem(TYPES)
    const otherTypes = TYPES.filter(t => t !== mainType)
    const oddType = randItem(otherTypes)
    const mainSrc = imgPath(mainType, null, '1.png')
    const oddSrc = imgPath(oddType, null, '1.png')
    newCards = [
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: oddSrc, isOdd: true, transform: null, result: null },
    ]
  } else if (d === 2) {
    const mainType = randItem(TYPES)
    const otherTypes = TYPES.filter(t => t !== mainType)
    const oddType = randItem(otherTypes)
    const mainSrc = imgPath(mainType, null, '1.png')
    const oddSrc = imgPath(oddType, null, '1.png')
    const flip = randomFlip()
    newCards = [
      { src: mainSrc, isOdd: false, transform: flip, result: null },
      { src: mainSrc, isOdd: false, transform: flip, result: null },
      { src: mainSrc, isOdd: false, transform: flip, result: null },
      { src: oddSrc, isOdd: true, transform: flip, result: null },
    ]
  } else if (d === 3) {
    // 3 same template + 1 from Many_differences
    const type = randItem(TYPES)
    const mainSrc = imgPath(type, null, '1.png')
    const n = DIFF_COUNTS.Many_differences
    const oddFile = `${rand(n) + 1}.png`
    const oddSrc = imgPath(type, 'Many_differences', oddFile)
    newCards = [
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: oddSrc, isOdd: true, transform: null, result: null },
    ]
  } else {
    // d = 4,5,6 → Three_difference, Two_difference, One_difference
    const folderMap = { 4: 'Three_difference', 5: 'Two_difference', 6: 'One_difference' }
    const folder = folderMap[d]
    const type = randItem(TYPES)
    const mainSrc = imgPath(type, null, '1.png')
    const n = DIFF_COUNTS[folder]
    const oddFile = `${rand(n) + 1}.png`
    const oddSrc = imgPath(type, folder, oddFile)
    newCards = [
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: mainSrc, isOdd: false, transform: null, result: null },
      { src: oddSrc, isOdd: true, transform: null, result: null },
    ]
  }

  cards.value = shuffle(newCards)
}

function startRound() {
  roundKey.value++
  answered.value = false
  buildCards()
  roundStartTime.value = Date.now()
}

function onCardClick(card) {
  if (answered.value) return
  answered.value = true

  const success = card.isOdd
  card.result = success ? 'correct' : 'wrong'
  // Mark the actual odd card if wrong click
  if (!success) {
    const oddCard = cards.value.find(c => c.isOdd)
    if (oddCard) oddCard.result = 'missed'
  }

  totalRounds.value++
  windowTotal.value++
  if (success) {
    correctRounds.value++
    windowCorrect.value++
    score.value += Math.round(5 * COEFFS[difficulty.value - 1])
    const rt = (Date.now() - roundStartTime.value) / 1000
    totalReactionMs.value += rt
    reactionCount.value++
  } else {
    wrongRounds.value++
  }

  feedback.value = success ? 'correct' : 'wrong'

  // Check 60s window
  const elapsed = (Date.now() - windowStart.value) / 1000
  if (elapsed >= 60) {
    adjustDifficulty()
    windowStart.value = Date.now()
    windowCorrect.value = 0
    windowTotal.value = 0
  }

  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    feedback.value = null
    if (gameTimeLeft.value > 0) startRound()
  }, 1000)
}

function adjustDifficulty() {
  if (windowTotal.value === 0) return
  const rate = windowCorrect.value / windowTotal.value
  if (rate >= 0.9 && difficulty.value < 6) difficulty.value++
  else if (rate < 0.7 && difficulty.value > 1) difficulty.value--
}

function cardClass(card) {
  const cls = []
  if (!answered.value) cls.push('clickable')
  if (card.result === 'correct') cls.push('correct')
  if (card.result === 'wrong') cls.push('wrong')
  if (card.result === 'missed') cls.push('missed')
  return cls
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss.toString().padStart(2, '0')}`
}

function endGame() {
  clearAllTimers()
  const avgReaction = reactionCount.value > 0
    ? (totalReactionMs.value / reactionCount.value).toFixed(1) + t.value.sec
    : '--'
  const durationSec = props.duration
  const durationLabel = formatTime(durationSec)
  emit('end', {
    score: score.value,
    finalLevel: difficulty.value,
    totalRounds: totalRounds.value,
    correctRounds: correctRounds.value,
    wrongRounds: wrongRounds.value,
    duration: props.duration,
    durationLabel,
    avgReaction,
  })
}

function clearAllTimers() {
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
}

function startGameTimer() {
  gameTimer = setInterval(() => {
    gameTimeLeft.value--
    if (gameTimeLeft.value <= 0) endGame()
  }, 1000)
}

function onBackClick() {
  clearAllTimers()
  pausedAt = Date.now()
  showBackConfirm.value = true
}

function cancelBack() {
  if (!showBackConfirm.value) return
  showBackConfirm.value = false
  const pausedDuration = Date.now() - pausedAt
  windowStart.value += pausedDuration
  if (answered.value) {
    feedback.value = null
    startRound()
  } else {
    roundStartTime.value += pausedDuration
  }
  startGameTimer()
}

function forceBack() {
  clearAllTimers()
  showBackConfirm.value = false
  if (isActiveBatchGame('spotdiff')) leavePbGameWindow({ confirm: false })
  else emit('back')
}

onMounted(() => {
  vhHandler = () => document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
  vhHandler()
  window.addEventListener('resize', vhHandler)
  startRound()
  startGameTimer()
})

onUnmounted(() => {
  window.removeEventListener('resize', vhHandler)
  clearAllTimers()
})
</script>

<style scoped>
.game-page {
  width: 100vw;
  height: 100vh;
  height: calc(var(--real-vh, 1vh) * 100);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 20%, #0d2137 0%, #060e1a 100%);
  z-index: 0;
}

/* HUD */
.hud {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5vmin 3vmin;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.hud-left { display: flex; gap: 2vmin; }
.hud-item {
  background: rgba(10,40,70,0.85);
  backdrop-filter: blur(4px);
  padding: 1.2vmin 2vmin;
  border-radius: 1.5vmin;
  border: 0.2vmin solid rgba(100,200,255,0.4);
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3vmin;
}
.hud-label { font-size: 1.2vmin; color: rgba(100,200,255,0.8); letter-spacing: 0.1vmin; }
.hud-value { font-size: 2.5vmin; font-weight: 800; color: #c8e6ff; }
.level-badge { color: #64c8ff; }
.time-urgent { color: #fca5a5 !important; animation: blink 0.6s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }
.hud-center {
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2vmin;
}
.task-msg {
  font-size: 2.8vmin;
  color: #c8e6ff;
  font-weight: 800;
  background: linear-gradient(135deg, rgba(10,40,70,0.95), rgba(15,55,90,0.95));
  backdrop-filter: blur(6px);
  padding: 1.5vmin 3vmin;
  border-radius: 2vmin;
  border: 0.3vmin solid rgba(100,200,255,0.5);
  box-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.4);
}
.hud-right { display: flex; align-items: center; gap: 10px; }
.back-btn {
  padding: 1.2vmin 2.5vmin;
  font-size: 1.6vmin;
  font-weight: 700;
  background: rgba(80,20,20,0.8);
  backdrop-filter: blur(4px);
  border: 0.2vmin solid rgba(239,68,68,0.5);
  color: #fca5a5;
  border-radius: 1.2vmin;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { background: rgba(100,30,30,1); }

/* Cards area */
.cards-area {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2vmin;
  padding: 2vmin;
  width: min(94vw, calc(var(--real-vh, 1vh) * 76));
  height: min(94vw, calc(var(--real-vh, 1vh) * 76));
  margin: auto;
  position: relative;
  z-index: 5;
}
.card {
  aspect-ratio: 1 / 1;
  border-radius: 2vmin;
  background: rgba(15,40,65,0.8);
  border: 0.3vmin solid rgba(100,200,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  transition: all 0.2s;
  user-select: none;
  min-width: 0;
  min-height: 0;
}
.card.clickable { cursor: pointer; }
.card.clickable:hover {
  border-color: rgba(100,200,255,0.6);
  box-shadow: 0 0 2vmin rgba(100,200,255,0.3);
  transform: scale(1.01);
}
.card.correct { border-color: rgba(76,175,80,0.8); box-shadow: 0 0 2vmin rgba(76,175,80,0.4); }
.card.wrong { border-color: rgba(244,67,54,0.8); box-shadow: 0 0 2vmin rgba(244,67,54,0.4); }
.card.missed { border-color: rgba(255,200,50,0.6); opacity: 0.7; }
.card-img {
  width: 90%;
  height: 90%;
  object-fit: contain;
  pointer-events: none;
}
.card-result {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12vmin;
  font-weight: 900;
  border-radius: 2vmin;
}
.card.correct .card-result { color: #4caf50; background: rgba(30,100,40,0.5); }
.card.wrong .card-result { color: #ef5350; background: rgba(100,30,30,0.5); }
.result-pop-enter-active { animation: resultPop 0.3s ease-out; }
@keyframes resultPop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

/* Feedback overlay */
.feedback-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 50;
}
.feedback-msg {
  font-size: 8vmin;
  font-weight: 900;
  padding: 2vmin 5vmin;
  border-radius: 2vmin;
  animation: msgPop 0.3s ease-out;
}
.feedback-msg.correct { color: #a5d6a7; background: rgba(27,94,32,0.9); border: 0.3vmin solid rgba(76,175,80,0.6); }
.feedback-msg.wrong { color: #ef9a9a; background: rgba(127,0,0,0.9); border: 0.3vmin solid rgba(244,67,54,0.6); }
@keyframes msgPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.feedback-fade-enter-active, .feedback-fade-leave-active { transition: opacity 0.3s; }
.feedback-fade-enter-from, .feedback-fade-leave-to { opacity: 0; }

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.confirm-box {
  background: linear-gradient(160deg, #0d2137, #060e1a);
  border: 0.2vmin solid rgba(100,200,255,0.3);
  border-radius: 2vmin;
  padding: 3.5vmin 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  box-shadow: 0 2vmin 5vmin rgba(0,0,0,0.5);
}
.confirm-text { color: #c8e6ff; font-size: 2.2vmin; font-weight: 600; }
.confirm-btns { display: flex; gap: 2vmin; }
.cbtn {
  padding: 1.2vmin 3.5vmin;
  font-size: 2vmin;
  font-weight: 700;
  border-radius: 1vmin;
  cursor: pointer;
  transition: all 0.2s;
}
.cbtn.cancel {
  background: rgba(255,255,255,0.1);
  border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #c8e6ff;
}
.cbtn.cancel:hover { background: rgba(255,255,255,0.2); }
.cbtn.confirm {
  background: linear-gradient(135deg, #1a5a8a, #2a8ac4);
  border: 0.2vmin solid rgba(100,200,255,0.4);
  color: #c8e6ff;
}
.cbtn.confirm:hover { background: linear-gradient(135deg, #2a6a9a, #3a9ad4); }
</style>
