<template>
  <div class="game-page">
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
        <span class="task-msg">{{ t.gameInstruction }}</span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
        <button class="back-btn" @click="onBackClick">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Game area -->
    <div class="game-area" ref="gameAreaRef"
      :style="`--pairs: ${LEVELS[difficulty - 1].pairs}; --cols: ${colsPerSide}; --rows: ${rowsPerSide}`"
    >
      <!-- Left column -->
      <div class="card-col" ref="leftColRef">
        <div
          v-for="item in leftItems"
          :key="item.id"
          :ref="el => setCardRef(el, item.id)"
          class="card"
          :class="cardClass(item, 'left')"
          @click="onClickLeft(item)"
        >
          <img :src="item.img" :alt="item.id" class="card-img" />
        </div>
      </div>

      <!-- SVG lines overlay -->
      <svg class="lines-svg" ref="linesSvgRef">
        <!-- matched lines -->
        <line
          v-for="line in matchedLines"
          :key="line.key"
          :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
          class="line-matched"
        />
      </svg>

      <!-- Right column -->
      <div class="card-col" ref="rightColRef">
        <div
          v-for="item in rightItems"
          :key="item.id"
          :ref="el => setCardRef(el, item.id)"
          class="card"
          :class="cardClass(item, 'right')"
          @click="onClickRight(item)"
        >
          <img :src="item.img" :alt="item.id" class="card-img" />
        </div>
      </div>
    </div>

    <!-- Feedback overlay -->
    <transition name="fade-msg">
      <div v-if="feedback" class="feedback-overlay">
        <div class="feedback-msg" :class="feedback === 'correct' ? 'msg-correct' : 'msg-wrong'">
          {{ feedback === 'correct' ? t.correct : t.wrong }}
        </div>
      </div>
    </transition>

    <!-- Confirm back dialog -->
    <div v-if="showBackConfirm" class="confirm-overlay" @click.self="showBackConfirm = false">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from '@vue/composition-api'
import messages from '../i18n.js'
import { pairImage } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ lang: String, duration: Number })
const emit = defineEmits(['end', 'back'])
const t = computed(() => messages[props.lang] || messages.zh)
const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

const LEVELS = [
  { category: 'simple', pairs: 2, coeff: 1 },
  { category: 'simple', pairs: 3, coeff: 1.5 },
  { category: 'medium', pairs: 3, coeff: 2 },
  { category: 'medium', pairs: 4, coeff: 2.5 },
  { category: 'complex', pairs: 4, coeff: 3 },
  { category: 'complex', pairs: 5, coeff: 3.5 },
]

const difficulty = ref(getBatchStartDifficultyForGame('lxds'))
const colsPerSide = computed(() => LEVELS[difficulty.value - 1].pairs >= 4 ? 2 : 1)
const rowsPerSide = computed(() => Math.ceil(LEVELS[difficulty.value - 1].pairs / colsPerSide.value))
const score = ref(0)
const gameTimeLeft = ref(props.duration)
const leftItems = ref([])
const rightItems = ref([])
const selectedLeft = ref(null)
const selectedRight = ref(null)
const feedback = ref(null)
const showBackConfirm = ref(false)
const matchedLines = ref([])   // { key, x1, y1, x2, y2 }

const gameAreaRef = ref(null)
const linesSvgRef = ref(null)
const cardRefs = {}  // id → el

const totalRounds = ref(0)
const correctRounds = ref(0)
const wrongRounds = ref(0)
const windowStart = ref(Date.now())
const windowCorrect = ref(0)
const windowTotal = ref(0)
const totalReactionMs = ref(0)
const reactionCount = ref(0)
const roundStartTime = ref(0)

let gameTimer = null
let feedbackTimer = null
let nextRoundTimer = null
let vhHandler = null

function setCardRef(el, id) {
  if (el) cardRefs[id] = el
  else delete cardRefs[id]
}

// Get center of a card relative to the SVG element
function cardCenter(id) {
  const el = cardRefs[id]
  const svg = linesSvgRef.value
  if (!el || !svg) return null
  const er = el.getBoundingClientRect()
  const sr = svg.getBoundingClientRect()
  return {
    x: er.left + er.width / 2 - sr.left,
    y: er.top + er.height / 2 - sr.top,
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildRound() {
  const cfg = LEVELS[difficulty.value - 1]
  const all = Array.from({ length: 10 }, (_, i) => i + 1)
  shuffle(all)
  const folders = all.slice(0, cfg.pairs)

  const left = folders.map((folder, idx) => ({
    id: `l-${idx}`, pairId: idx,
    img: pairImage(cfg.category, folder, 1), state: 'normal',
  }))
  const right = folders.map((folder, idx) => ({
    id: `r-${idx}`, pairId: idx,
    img: pairImage(cfg.category, folder, 2), state: 'normal',
  }))

  leftItems.value = shuffle(left)
  rightItems.value = shuffle(right)
  selectedLeft.value = null
  selectedRight.value = null
  matchedLines.value = []
  roundStartTime.value = Date.now()
}

function getSelected() { return selectedLeft.value || selectedRight.value }

function tryMatch(leftItem, rightItem) {
  selectedLeft.value = null
  selectedRight.value = null

  const correct = leftItem.pairId === rightItem.pairId
  totalRounds.value++
  windowTotal.value++

  if (correct) {
    leftItem.state = 'matched'
    rightItem.state = 'matched'
    correctRounds.value++
    windowCorrect.value++
    score.value += Math.round(5 * LEVELS[difficulty.value - 1].coeff)
    totalReactionMs.value += (Date.now() - roundStartTime.value) / 1000
    reactionCount.value++
    nextTick(() => {
      const lc = cardCenter(leftItem.id)
      const rc = cardCenter(rightItem.id)
      if (lc && rc) matchedLines.value.push({ key: `${leftItem.id}-${rightItem.id}`, x1: lc.x, y1: lc.y, x2: rc.x, y2: rc.y })
    })
    showFeedback('correct')
    if (leftItems.value.every(i => i.state === 'matched')) {
      checkWindowAdjust()
      clearTimeout(nextRoundTimer)
      nextRoundTimer = setTimeout(buildRound, 900)
    }
  } else {
    leftItem.state = 'wrong-flash'
    rightItem.state = 'wrong-flash'
    wrongRounds.value++
    showFeedback('wrong')
    setTimeout(() => { leftItem.state = 'normal'; rightItem.state = 'normal' }, 600)
  }
}

function onClickLeft(item) {
  if (item.state !== 'normal') return
  if (selectedRight.value) {
    tryMatch(item, selectedRight.value)
  } else {
    selectedLeft.value = item
    selectedRight.value = null
  }
}

function onClickRight(item) {
  if (item.state !== 'normal') return
  if (selectedLeft.value) {
    tryMatch(selectedLeft.value, item)
  } else {
    selectedRight.value = item
    selectedLeft.value = null
  }
}

function showFeedback(type) {
  feedback.value = type
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { feedback.value = null }, 800)
}

function checkWindowAdjust() {
  const elapsed = (Date.now() - windowStart.value) / 1000
  if (elapsed >= 60) {
    if (windowTotal.value > 0) {
      const rate = windowCorrect.value / windowTotal.value
      if (rate >= 0.9 && difficulty.value < 6) difficulty.value++
      else if (rate < 0.7 && difficulty.value > 1) difficulty.value--
    }
    windowStart.value = Date.now()
    windowCorrect.value = 0
    windowTotal.value = 0
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss.toString().padStart(2, '0')}`
}

function endGame() {
  clearAllTimers()
  const avgReaction = reactionCount.value > 0
    ? (totalReactionMs.value / reactionCount.value).toFixed(1) + t.value.sec : '--'
  emit('end', {
    score: score.value, finalLevel: difficulty.value,
    totalRounds: totalRounds.value, correctRounds: correctRounds.value,
    wrongRounds: wrongRounds.value, duration: props.duration, avgReaction,
  })
}

function clearAllTimers() {
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
  clearTimeout(nextRoundTimer)
}

function onBackClick() {
  clearInterval(gameTimer)
  showBackConfirm.value = true
}

function cancelBack() {
  showBackConfirm.value = false
  gameTimer = setInterval(() => {
    gameTimeLeft.value--
    if (gameTimeLeft.value <= 0) endGame()
  }, 1000)
}

function forceBack() {
  clearAllTimers()
  showBackConfirm.value = false
  leavePbGameWindow({ confirm: false })
}

function cardClass(item, side) {
  const cls = []
  if (side === 'left' && selectedLeft.value && selectedLeft.value.id === item.id) cls.push('selected')
  if (side === 'right' && selectedRight.value && selectedRight.value.id === item.id) cls.push('selected')
  if (item.state === 'matched') cls.push('matched')
  if (item.state === 'wrong-flash') cls.push('wrong')
  return cls
}

onMounted(() => {
  vhHandler = () => document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
  vhHandler()
  window.addEventListener('resize', vhHandler)
  buildRound()
  gameTimer = setInterval(() => {
    gameTimeLeft.value--
    if (gameTimeLeft.value <= 0) endGame()
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', vhHandler)
  clearAllTimers()
})
</script>

<style scoped>
.game-page {
  width: 100vw; height: 100vh; height: calc(var(--real-vh, 1vh) * 100);
  background: radial-gradient(ellipse at 50% 20%, #0d2137 0%, #060e1a 70%);
  display: flex; flex-direction: column; overflow: hidden;
}

.hud {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.5vmin 3vmin; flex-shrink: 0; z-index: 10;
}
.hud-left { display: flex; gap: 2vmin; }
.hud-item {
  background: rgba(10,30,70,0.85); backdrop-filter: blur(4px);
  padding: 1.2vmin 2vmin; border-radius: 1.5vmin;
  border: 0.2vmin solid rgba(100,180,255,0.4);
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.3);
  display: flex; flex-direction: column; align-items: center; gap: 0.3vmin;
}
.hud-label { font-size: 1.2vmin; color: rgba(100,180,255,0.8); letter-spacing: 0.1vmin; }
.hud-value { font-size: 2.5vmin; font-weight: 800; color: #c8e0f5; }
.level-badge { color: #64b4ff; }
.time-urgent { color: #fca5a5 !important; animation: blink 0.6s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }

.hud-center { flex: 1; text-align: center; display: flex; align-items: center; justify-content: center; padding: 0 2vmin; }
.task-msg {
  font-size: 2.2vmin; color: #c8e0f5; font-weight: 700;
  background: rgba(10,30,70,0.85); backdrop-filter: blur(6px);
  padding: 1.5vmin 3vmin; border-radius: 2vmin;
  border: 0.2vmin solid rgba(100,180,255,0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.4);
}
.hud-right { display: flex; align-items: center; gap: 10px; }
.back-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.6vmin; font-weight: 700;
  background: rgba(80,10,10,0.8); backdrop-filter: blur(4px);
  border: 0.2vmin solid rgba(239,68,68,0.5); color: #fca5a5;
  border-radius: 1.2vmin; cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { background: rgba(120,20,20,0.9); }

.game-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 0; padding: 2vmin 0; position: relative; overflow: hidden;
  min-height: 0;
}

.lines-svg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 5; overflow: visible;
}
.line-matched {
  stroke: #4caf50; stroke-width: 0.4vmin; stroke-dasharray: none;
  filter: drop-shadow(0 0 0.4vmin rgba(76,175,80,0.7));
}

.card-col {
  display: grid;
  grid-template-columns: repeat(var(--cols, 1), 1fr);
  gap: 1.5vmin;
  margin: 0 4vmin;
  align-content: center;
  justify-items: center;
}

.card {
  --gap-h: calc(1.5vmin * (var(--rows) - 1) + 4vmin);
  --available-h: calc(var(--real-vh, 1vh) * 95 - 10vmin - var(--gap-h));
  --size-by-h: calc(var(--available-h) / var(--rows));
  --size-by-w: calc((100vw - 32vmin) / (var(--cols) * 2));
  width: min(var(--size-by-h), var(--size-by-w));
  height: min(var(--size-by-h), var(--size-by-w));
  min-width: 0; min-height: 0;
  border-radius: 1.5vmin;
  background: rgba(15,40,80,0.8); border: 0.3vmin solid rgba(100,180,255,0.2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s; overflow: hidden;
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.4);
  flex-shrink: 0;
}
.card:hover { transform: scale(1.05); border-color: rgba(100,180,255,0.5); }
.card.selected {
  border-color: rgba(100,200,255,0.9); background: rgba(20,60,130,0.9);
  box-shadow: 0 0 2vmin rgba(100,200,255,0.6); transform: scale(1.06);
}
.card.matched {
  border-color: rgba(80,200,80,0.7); background: rgba(10,60,20,0.8);
  box-shadow: 0 0 1.5vmin rgba(80,200,80,0.4); opacity: 0.7; cursor: default;
}
.card.wrong {
  border-color: rgba(239,68,68,0.8); background: rgba(100,10,10,0.8);
  animation: wrongShake 0.4s ease-out;
}
@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-0.8vmin); }
  75% { transform: translateX(0.8vmin); }
}
.card-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.feedback-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 50;
}
.feedback-msg {
  font-size: 7vmin; font-weight: 900; padding: 2vmin 5vmin; border-radius: 2vmin;
  animation: msgPop 0.3s ease-out;
}
@keyframes msgPop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.msg-correct { color: #a5d6a7; background: rgba(20,80,30,0.9); border: 0.3vmin solid rgba(76,175,80,0.6); }
.msg-wrong { color: #ef9a9a; background: rgba(100,10,10,0.9); border: 0.3vmin solid rgba(244,67,54,0.6); }
.fade-msg-enter-active, .fade-msg-leave-active { transition: opacity 0.3s; }
.fade-msg-enter-from, .fade-msg-leave-to { opacity: 0; }

.confirm-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.confirm-box {
  background: linear-gradient(160deg, #0d2137, #060e1a);
  border: 0.2vmin solid rgba(100,180,255,0.3); border-radius: 2vmin;
  padding: 3.5vmin 5vmin; display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  box-shadow: 0 2vmin 5vmin rgba(0,0,0,0.5);
}
.confirm-text { color: #c8e0f5; font-size: 2.2vmin; font-weight: 600; }
.confirm-btns { display: flex; gap: 2vmin; }
.cbtn { padding: 1.2vmin 3.5vmin; font-size: 2vmin; font-weight: 700; border-radius: 1vmin; cursor: pointer; transition: all 0.2s; }
.cbtn.cancel { background: rgba(255,255,255,0.08); border: 0.2vmin solid rgba(255,255,255,0.15); color: #c8e0f5; }
.cbtn.cancel:hover { background: rgba(255,255,255,0.15); }
.cbtn.confirm { background: linear-gradient(135deg, #1a4a8a, #2a6abf); border: 0.2vmin solid rgba(100,180,255,0.4); color: #c8e0f5; }
.cbtn.confirm:hover { background: linear-gradient(135deg, #2a5a9a, #3a7acf); }
</style>
