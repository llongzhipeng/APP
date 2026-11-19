<template>
  <div class="game-page">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-item">{{ t.level }}: <span class="hud-val">{{ level }}</span></div>
      <div class="hud-item">{{ t.score }}: <span class="hud-val gold">{{ score }}</span></div>
      <div class="hud-item">{{ t.timeLeft }}: <span class="hud-val" :class="{ urgent: timeLeft <= 10 }">{{ timeLeft }}s</span></div>
    </div>
    <div class="back-group">
      <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
      <button class="back-btn" @click="onBackClick">{{ t.backBtn }}</button>
    </div>

    <!-- Game instruction -->
    <div class="game-rule">{{ t.gameRule }}</div>

    <!-- Images area -->
    <div class="images-area">
      <div
        v-for="(item, idx) in currentImages"
        :key="item.name"
        class="image-slot"
        :data-idx="idx"
        :class="{ correct: item.matched === true, wrong: item.matched === false }"
        @dragover.prevent
        @drop="onDrop($event, item)"
      >
        <img :src="itemImage(item.name)" :alt="item.label" />
        <div v-if="item.matched === true" class="slot-label correct-label">{{ item.label }}</div>
        <div v-if="item.matched === false" class="slot-label wrong-label">✗</div>
      </div>
    </div>

    <!-- Word cards area -->
    <div class="cards-area">
      <div
        v-for="card in currentCards"
        :key="card.id"
        class="word-card"
        :class="{ used: card.used, dragging: card.dragging }"
        draggable="true"
        @dragstart="onDragStart($event, card)"
        @dragend="onDragEnd(card)"
        @touchstart="onTouchStart($event, card)"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      >
        {{ card.label }}
      </div>
    </div>

    <!-- Feedback overlay -->
    <transition name="fade">
      <div v-if="feedback" class="feedback-overlay" :class="feedback">
        {{ feedback === 'correct' ? t.correct : t.wrong }}
      </div>
    </transition>

    <!-- Confirm back dialog -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>{{ t.confirmBack }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="cancelBack">{{ t.cancel }}</button>
          <button class="cbtn confirm" @click="doBack">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import messages from '../i18n.js'
import { itemImage } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ lang: String, duration: Number })
const emit = defineEmits(['end', 'back'])
const t = computed(() => messages[props.lang] || messages.zh)
const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

// All available images (filename without extension = Chinese name)
const ALL_ITEMS = [
  { name: 'apple', zh: '苹果', en: 'apple' },
  { name: 'banana', zh: '香蕉', en: 'banana' },
  { name: 'bed', zh: '床', en: 'bed' },
  { name: 'cat', zh: '猫', en: 'cat' },
  { name: 'chair', zh: '椅子', en: 'chair' },
  { name: 'cock', zh: '公鸡', en: 'cock' },
  { name: 'dog', zh: '狗', en: 'dog' },
  { name: 'fish', zh: '鱼', en: 'fish' },
  { name: 'mug', zh: '杯子', en: 'mug' },
  { name: 'orange', zh: '橘子', en: 'orange' },
  { name: 'panda', zh: '熊猫', en: 'panda' },
  { name: 'parrot', zh: '鹦鹉', en: 'parrot' },
  { name: 'pen', zh: '笔', en: 'pen' },
  { name: 'pot', zh: '盆', en: 'pot' },
  { name: 'sheep', zh: '羊', en: 'sheep' },
  { name: 'slipper', zh: '拖鞋', en: 'slipper' },
  { name: 'tiger', zh: '老虎', en: 'tiger' },
  { name: 'toothbrush', zh: '牙刷', en: 'toothbrush' },
]

const LEVELS = [
  { level: 1, images: 2, cards: 2, coeff: 1 },
  { level: 2, images: 3, cards: 3, coeff: 1.5 },
  { level: 3, images: 3, cards: 4, coeff: 2 },
  { level: 4, images: 4, cards: 4, coeff: 2.5 },
  { level: 5, images: 4, cards: 5, coeff: 3 },
  { level: 6, images: 5, cards: 7, coeff: 3.5 },
]

const level = ref(getBatchStartDifficultyForGame('mcgf'))
const score = ref(0)
const timeLeft = ref(props.duration)
const showConfirm = ref(false)
const feedback = ref(null)
const currentImages = ref([])
const currentCards = ref([])

// Stats
let totalRounds = 0
let correctRounds = 0
let wrongRounds = 0
let reactionTimes = []
let roundStartTime = 0

// Difficulty adjustment: track per 60s window
let windowCorrect = 0
let windowTotal = 0
let windowTimer = 0

let gameTimer = null
let feedbackTimer = null
let dragCard = null
let vhHandler = null

function getLabel(item) {
  return props.lang === 'en' ? item.en : item.zh
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function startRound() {
  feedback.value = null
  const cfg = LEVELS[level.value - 1]
  const pool = shuffle(ALL_ITEMS)
  const chosen = pool.slice(0, cfg.images)
  const distractors = pool.slice(cfg.images, cfg.images + (cfg.cards - cfg.images))

  currentImages.value = chosen.map(item => ({
    name: item.name,
    label: getLabel(item),
    matched: null,
  }))

  const cardItems = shuffle([...chosen, ...distractors])
  currentCards.value = cardItems.map((item, i) => ({
    id: i,
    name: item.name,
    label: getLabel(item),
    used: false,
    dragging: false,
  }))

  roundStartTime = Date.now()
}

function onDragStart(e, card) {
  if (card.used) { e.preventDefault(); return }
  dragCard = card
  card.dragging = true
  e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd(card) {
  card.dragging = false
}

// Touch drag support for tablets
let touchDragCard = null
let touchGhost = null

function onTouchStart(e, card) {
  if (card.used) return
  e.preventDefault()
  touchDragCard = card
  card.dragging = true
  const touch = e.touches[0]
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  touchGhost = el.cloneNode(true)
  touchGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:${rect.width}px;height:${rect.height}px;left:${touch.clientX - rect.width / 2}px;top:${touch.clientY - rect.height / 2}px;opacity:0.85;transition:none;`
  document.body.appendChild(touchGhost)
}

function onTouchMove(e) {
  if (!touchGhost) return
  const touch = e.touches[0]
  const w = touchGhost.offsetWidth
  const h = touchGhost.offsetHeight
  touchGhost.style.left = `${touch.clientX - w / 2}px`
  touchGhost.style.top = `${touch.clientY - h / 2}px`
}

function onTouchEnd(e) {
  if (touchDragCard) touchDragCard.dragging = false
  if (touchGhost) { document.body.removeChild(touchGhost); touchGhost = null }
  if (!touchDragCard) return
  const touch = e.changedTouches[0]
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  const slot = el && el.closest('.image-slot')
  if (slot) {
    const idx = parseInt(slot.dataset.idx)
    if (!isNaN(idx) && currentImages.value[idx]) {
      dragCard = touchDragCard
      onDrop(null, currentImages.value[idx])
    }
  }
  touchDragCard = null
  dragCard = null
}

function onDrop(e, imageSlot) {
  if (!dragCard || dragCard.used) return
  if (imageSlot.matched === true) return

  const rt = Date.now() - roundStartTime
  reactionTimes.push(rt)
  totalRounds++
  windowTotal++

  if (dragCard.name === imageSlot.name) {
    imageSlot.matched = true
    dragCard.used = true
    correctRounds++
    windowCorrect++
    score.value += Math.round(5 * LEVELS[level.value - 1].coeff)
    showFeedback('correct')

    // Check if all images matched
    const allDone = currentImages.value.every(img => img.matched === true)
    if (allDone) {
      clearTimeout(feedbackTimer)
      feedbackTimer = setTimeout(startRound, 800)
    }
  } else {
    imageSlot.matched = false
    wrongRounds++
    showFeedback('wrong')
    setTimeout(() => { imageSlot.matched = null }, 600)
  }

  dragCard = null
}

function showFeedback(type) {
  feedback.value = type
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { feedback.value = null }, 700)
}

function adjustDifficulty() {
  if (windowTotal === 0) { windowCorrect = 0; windowTotal = 0; return }
  const rate = windowCorrect / windowTotal
  if (rate >= 0.9 && level.value < 6) level.value++
  else if (rate < 0.7 && level.value > 1) level.value--
  windowCorrect = 0
  windowTotal = 0
  startRound()
}

function onBackClick() {
  clearInterval(gameTimer)
  showConfirm.value = true
}

function cancelBack() {
  showConfirm.value = false
  gameTimer = setInterval(() => {
    timeLeft.value--
    windowTimer++
    if (windowTimer >= 60) { windowTimer = 0; adjustDifficulty() }
    if (timeLeft.value <= 0) endGame()
  }, 1000)
}

function doBack() {
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
  showConfirm.value = false
  leavePbGameWindow({ confirm: false })
}

function endGame() {
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
  const avgReaction = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 100) / 10 + 's'
    : '--'
  emit('end', {
    finalLevel: level.value,
    score: score.value,
    totalRounds,
    correctRounds,
    wrongRounds,
    avgReaction,
    minReactionTime: reactionTimes.length ? Math.min(...reactionTimes) : 0,
    maxReactionTime: reactionTimes.length ? Math.max(...reactionTimes) : 0,
    duration: props.duration, // 训练时长（秒），供上传 trainDuration
    durationLabel: props.duration,
  })
}

onMounted(() => {
  vhHandler = () => document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
  vhHandler()
  window.addEventListener('resize', vhHandler)
  startRound()
  gameTimer = setInterval(() => {
    timeLeft.value--
    windowTimer++
    if (windowTimer >= 60) {
      windowTimer = 0
      adjustDifficulty()
    }
    if (timeLeft.value <= 0) endGame()
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', vhHandler)
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
})
</script>

<style scoped>
.game-page {
  width: 100vw; height: 100vh; height: calc(var(--real-vh, 1vh) * 100);
  background: radial-gradient(ellipse at 50% 20%, #0d2b4a 0%, #061525 70%);
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-start; padding: 2vmin; position: relative; overflow: hidden;
  box-sizing: border-box;
}
.hud {
  position: absolute; top: 2vmin; left: 3vmin;
  display: flex; gap: 3vmin; align-items: center;
}
.hud-item { color: rgba(232,244,255,0.7); font-size: 2vmin; font-weight: 600; }
.hud-val { color: #e8f4ff; font-weight: 800; font-size: 2.2vmin; }
.hud-val.gold { color: #ffd700; }
.hud-val.urgent { color: #ff6b6b; animation: blink 0.5s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.back-group {
  position: absolute; top: 2vmin; right: 3vmin;
  display: flex; align-items: center; gap: 10px;
}
.back-btn {
  background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #e8f4ff; font-size: 1.8vmin; padding: 0.8vmin 2vmin;
  border-radius: 1vmin; cursor: pointer; transition: background 0.2s; font-weight: 600;
}
.back-btn:hover { background: rgba(255,255,255,0.2); }
.game-rule {
  margin-top: 7vmin; color: rgba(232,244,255,0.8); font-size: 2.2vmin;
  font-weight: 600; text-align: center; flex-shrink: 0;
}
.images-area {
  display: flex; gap: 2vmin; flex-wrap: wrap; justify-content: center;
  align-items: center; flex: 1; min-height: 0; overflow: hidden; padding: 1vmin 3vmin; width: 100%;
}
.image-slot {
  /* Size adapts: fills available space up to a max, shrinks on small screens */
  width: clamp(14vmin, 22vmin, 28vmin);
  height: clamp(14vmin, 22vmin, 28vmin);
  border-radius: 2vmin;
  background: rgba(255,255,255,0.07); border: 0.3vmin solid rgba(100,200,255,0.3);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; transition: all 0.3s; cursor: default; flex-shrink: 1;
}
.image-slot:hover { border-color: rgba(100,200,255,0.6); background: rgba(255,255,255,0.1); }
.image-slot.correct { border-color: rgba(100,255,150,0.7); background: rgba(50,200,100,0.15); }
.image-slot.wrong { border-color: rgba(255,100,100,0.7); background: rgba(200,50,50,0.15); animation: shake 0.3s ease-out; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-1vmin)} 75%{transform:translateX(1vmin)} }
.image-slot img { width: 90%; height: 90%; object-fit: contain; }
.slot-label {
  position: absolute; bottom: 0; left: 0; right: 0;
  text-align: center; font-size: 2vmin; font-weight: 700; padding: 0.4vmin;
  border-radius: 0 0 1.7vmin 1.7vmin;
}
.correct-label { background: rgba(50,200,100,0.85); color: #fff; }
.wrong-label { background: rgba(200,50,50,0.85); color: #fff; font-size: 2.5vmin; }
.cards-area {
  display: flex; gap: 2vmin; flex-wrap: wrap; justify-content: center;
  padding: 1.5vmin 3vmin; flex-shrink: 0; width: 100%;
}
.word-card {
  padding: 1.5vmin 3.5vmin; font-size: clamp(1.8vmin, 2.5vmin, 3vmin); font-weight: 700;
  background: linear-gradient(135deg, #1a6bb5, #2d9cdb);
  border: 0.2vmin solid rgba(100,200,255,0.5); border-radius: 1.5vmin;
  color: #fff; cursor: grab; transition: all 0.2s; user-select: none;
  box-shadow: 0 0.4vmin 1.5vmin rgba(45,156,219,0.3);
  touch-action: none;
}
.word-card:hover:not(.used) { transform: translateY(-0.4vmin) scale(1.05); box-shadow: 0 0.8vmin 2vmin rgba(45,156,219,0.5); }
.word-card.used { opacity: 0.3; cursor: default; pointer-events: none; }
.word-card.dragging { opacity: 0.6; transform: scale(1.08); }
.feedback-overlay {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 6vmin; font-weight: 900; pointer-events: none; z-index: 50;
  text-shadow: 0 0 3vmin currentColor;
}
.feedback-overlay.correct { color: #4caf50; }
.feedback-overlay.wrong { color: #ef5350; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.confirm-box {
  background: linear-gradient(160deg, #0a1e35, #061525);
  border: 0.2vmin solid rgba(100,200,255,0.3); border-radius: 2vmin;
  padding: 4vmin 5vmin; display: flex; flex-direction: column; align-items: center; gap: 3vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.confirm-box p { color: #e8f4ff; font-size: 2.5vmin; font-weight: 600; }
.confirm-btns { display: flex; gap: 2vmin; }
.cbtn {
  padding: 1.2vmin 3.5vmin; font-size: 2vmin; font-weight: 700;
  border-radius: 1vmin; cursor: pointer; transition: all 0.2s;
}
.cbtn.cancel { background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2); color: #e8f4ff; }
.cbtn.cancel:hover { background: rgba(255,255,255,0.2); }
.cbtn.confirm { background: linear-gradient(135deg, #1a6bb5, #2d9cdb); border: 0.2vmin solid rgba(100,200,255,0.4); color: #fff; }
.cbtn.confirm:hover { background: linear-gradient(135deg, #2080cc, #3aafe8); }
</style>
