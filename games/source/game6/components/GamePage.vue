<template>
  <div class="game-page" ref="gameAreaRef">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.difficulty }}</span>
          <span class="hud-value level">Lv.{{ currentDifficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-value score">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-value time" :class="{ urgent: timeLeft <= 10 }">{{ formatTime(timeLeft) }}</span>
        </div>
      </div>

      <div class="hud-task">
        <span class="task-text" v-html="formattedTask"></span>
      </div>

      <div class="hud-right">
        <button v-if="showBatchSkip" class="quit-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
        <button class="quit-btn" @click="confirmQuit">✕ {{ t.quitGame || '退出' }}</button>
      </div>
    </div>

    <!-- Game area -->
    <div class="game-area" @click.self="onAreaClick">
      <div
        v-for="bubble in bubbles"
        :key="bubble.id"
        class="bubble"
        :class="[bubble.color, { popping: bubble.popping }]"
        :style="getBubbleStyle(bubble)"
        @click.stop="clickBubble($event, bubble)"
        @animationend="onAnimEnd($event, bubble)"
      >{{ bubble.content }}</div>

      <div
        v-for="popup in scorePopups"
        :key="popup.id"
        class="score-popup"
        :style="{ left: popup.x + 'px', top: popup.y + 'px' }"
      >+{{ popup.pts }}</div>
    </div>

    <!-- Difficulty toast -->
    <Transition name="toast">
      <div v-if="diffToast" class="diff-toast" :class="diffToast.type">
        {{ diffToast.msg }}
      </div>
    </Transition>

    <!-- Quit confirm dialog -->
    <div v-if="showQuitDialog" class="dialog-overlay">
      <div class="dialog">
        <p>{{ t.quitConfirm || '确定要退出游戏吗？当前进度将不会保存。' }}</p>
        <div class="dialog-btns">
          <button class="dialog-btn cancel" @click="resumeGame">
            {{ t.quitCancel || '继续游戏' }}
          </button>
          <button class="dialog-btn confirm" @click="doQuit">
            {{ t.quitConfirmBtn || '退出' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game6GamePage'
};
</script>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from '@vue/composition-api'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ t: Object, duration: Number })
const emit = defineEmits(['end', 'quit'])

// ─── Difficulty config ───────────────────────────────────────────────────────
const DIFFICULTIES = [
  { level: 1, coefficient: 1,   speed: 'slow'   },
  { level: 2, coefficient: 1.5, speed: 'medium' },
  { level: 3, coefficient: 2,   speed: 'slow'   },
  { level: 4, coefficient: 2.5, speed: 'medium' },
  { level: 5, coefficient: 3,   speed: 'slow'   },
  { level: 6, coefficient: 3.5, speed: 'medium' },
]

// ─── State ───────────────────────────────────────────────────────────────────
const startDifficulty = getBatchStartDifficultyForGame('szqb')
const currentDifficulty = ref(startDifficulty)
const score = ref(0)
const timeLeft = ref(props.duration)
const bubbles = ref([])
const scorePopups = ref([])
const diffToast = ref(null)
const showQuitDialog = ref(false)
const gameAreaRef = ref(null)

const totalCorrectAppeared = ref(0)
const totalPopped = ref(0)
const reactionTimes = ref([])

const windowCorrectAppeared = ref(0)
const windowPopped = ref(0)
const windowWrongClicks = ref(0)

let maxDifficulty = startDifficulty
let gameTimer = null
let spawnTimer = null
let windowTimer = null
let bubbleIdCounter = 0
let gamePaused = false

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function diffConfig(level) { return DIFFICULTIES[level - 1] }

function isCorrectBubble(color, isNumber, level) {
  if (level <= 2) return isNumber              // 蓝色气泡中，只有数字的才正确
  if (level <= 4) return color === 'blue'      // 蓝色气泡正确，白色是干扰
  return color === 'blue' && !isNumber         // 蓝色+字母才正确
}

function getSpeed(level) {
  const slow = diffConfig(level).speed === 'slow'
  return slow ? 8 + Math.random() * 4 : 4 + Math.random() * 3
}

function randomContent(isNumber) {
  if (isNumber) return String(Math.floor(Math.random() * 10))
  // Exclude O and I to prevent confusion with 0 and 1
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return letters[Math.floor(Math.random() * letters.length)]
}

// ─── Computed ────────────────────────────────────────────────────────────────
const formattedTask = computed(() => {
  const taskText = props.t.tasks[currentDifficulty.value - 1]
  const patterns = [
    { regex: /(蓝色且显示字母的气泡|显示字母的蓝色气球)/g, replacement: '<span class="task-capsule">$1</span>' },
    { regex: /(显示数字的气泡|数字的气球)/g, replacement: '<span class="task-capsule">$1</span>' },
    { regex: /(蓝色气泡|蓝色的气球)/g, replacement: '<span class="task-capsule">$1</span>' },
    { regex: /(blue bubbles with letters)/gi, replacement: '<span class="task-capsule">$1</span>' },
    { regex: /(number bubbles)/gi, replacement: '<span class="task-capsule">$1</span>' },
    { regex: /(blue bubbles)/gi, replacement: '<span class="task-capsule">$1</span>' },
  ]
  let result = taskText
  patterns.forEach(p => { result = result.replace(p.regex, p.replacement) })
  return result
})

// ─── Spawn ───────────────────────────────────────────────────────────────────
function spawnBubble() {
  if (gamePaused) return
  const level = currentDifficulty.value
  let color, isNumber

  if (level <= 2) {
    // 只有蓝色气泡，但混合数字和字母
    // ~60% 数字(正确目标) + ~40% 字母(干扰)
    color = 'blue'
    isNumber = Math.random() < 0.6
  } else if (level <= 4) {
    // 蓝色和白色气泡混合，任务：刺破蓝色
    // ~50% 蓝色(正确) + ~50% 白色(干扰)，两种颜色都混合数字和字母
    color = Math.random() < 0.5 ? 'blue' : 'white'
    isNumber = Math.random() < 0.5
  } else {
    // level 5 & 6：任务是刺破"蓝色且显示字母"的气泡
    // ~60% 蓝+字母(正确) + ~15% 蓝+数字(干扰) + ~15% 白+字母(干扰) + ~10% 白+数字(干扰)
    const r = Math.random()
    if (r < 0.60)      { color = 'blue';  isNumber = false }
    else if (r < 0.75) { color = 'blue';  isNumber = true  }
    else if (r < 0.90) { color = 'white'; isNumber = false }
    else               { color = 'white'; isNumber = true  }
  }

  const correct = isCorrectBubble(color, isNumber, level)
  const size = 80 + Math.floor(Math.random() * 40)
  const gameArea = gameAreaRef.value
  const areaWidth = gameArea ? gameArea.clientWidth : window.innerWidth
  const maxLeft = Math.max(areaWidth - size - 10, 10)
  const leftPx = 10 + Math.floor(Math.random() * maxLeft)
  const drift = (Math.random() - 0.5) * 80
  const speed = getSpeed(level)

  const bubble = {
    id: ++bubbleIdCounter,
    color, isNumber,
    content: randomContent(isNumber),
    isCorrect: correct,
    size, leftPx, drift, speed,
    createdAt: Date.now(),
    popping: false,
  }

  if (correct) {
    totalCorrectAppeared.value++
    windowCorrectAppeared.value++
  }
  bubbles.value.push(bubble)
}

// ─── Bubble interaction ───────────────────────────────────────────────────────
function clickBubble(event, bubble) {
  if (bubble.popping || gamePaused) return
  if (bubble.isCorrect) {
    // Capture the bubble's current visual position so pop animation plays in place
    const el = event.currentTarget
    const elRect = el.getBoundingClientRect()
    const gamePageEl = gameAreaRef.value
    const areaEl = gamePageEl ? gamePageEl.querySelector('.game-area') : null
    if (areaEl) {
      const areaRect = areaEl.getBoundingClientRect()
      bubble.popTop = elRect.top - areaRect.top
      bubble.popLeft = elRect.left - areaRect.left
    }
    reactionTimes.value.push(Date.now() - bubble.createdAt)
    totalPopped.value++
    windowPopped.value++
    const pts = Math.round(5 * diffConfig(currentDifficulty.value).coefficient)
    score.value += pts
    showScorePopup(bubble, pts)
    bubble.popping = true
  } else {
    windowWrongClicks.value++
  }
}

function showScorePopup(bubble, pts) {
  const gameArea = gameAreaRef.value
  if (!gameArea) return
  scorePopups.value.push({
    id: Date.now() + Math.random(),
    x: bubble.leftPx + bubble.size / 2,
    y: Math.max(gameArea.clientHeight * 0.3, 60),
    pts,
  })
  setTimeout(() => {
    scorePopups.value.splice(0, 1)
  }, 800)
}

function onAnimEnd(event, bubble) {
  if (event.animationName === 'bubblePop' || event.animationName === 'bubbleFloat') {
    removeBubble(bubble.id)
  }
}

function removeBubble(id) {
  const idx = bubbles.value.findIndex(b => b.id === id)
  if (idx !== -1) bubbles.value.splice(idx, 1)
}

function onAreaClick() { windowWrongClicks.value++ }

// ─── Bubble style ─────────────────────────────────────────────────────────────
function getBubbleStyle(bubble) {
  const base = {
    width: bubble.size + 'px',
    height: bubble.size + 'px',
    fontSize: Math.round(bubble.size * 0.38) + 'px',
  }
  if (bubble.popping) {
    // Use captured position so the pop plays exactly where the bubble was
    return {
      ...base,
      left: (bubble.popLeft !== undefined ? bubble.popLeft : bubble.leftPx) + 'px',
      top: (bubble.popTop !== undefined ? bubble.popTop : 100) + 'px',
      animation: 'bubblePop 0.35s ease-out forwards',
      pointerEvents: 'none',
    }
  }
  return {
    ...base,
    left: bubble.leftPx + 'px',
    bottom: `-${bubble.size + 4}px`,
    animation: `bubbleFloat ${bubble.speed}s linear forwards`,
    '--drift': bubble.drift + 'px',
  }
}

// ─── Difficulty adjustment ────────────────────────────────────────────────────
// README：操作正确率 = 正确点击数 / 总点击数（正确+错误）
// 90%以上升级，70%以下降级，其余不变
function adjustDifficulty() {
  const totalClicks = windowPopped.value + windowWrongClicks.value
  if (totalClicks === 0) { resetWindowStats(); return }
  const accuracy = windowPopped.value / totalClicks
  let newLevel = currentDifficulty.value
  if (accuracy >= 0.9 && newLevel < 6) newLevel++
  else if (accuracy < 0.7 && newLevel > 1) newLevel--
  if (newLevel !== currentDifficulty.value) {
    const up = newLevel > currentDifficulty.value
    currentDifficulty.value = newLevel
    if (newLevel > maxDifficulty) maxDifficulty = newLevel
    showDiffToast(up)
  }
  resetWindowStats()
}

function resetWindowStats() {
  windowCorrectAppeared.value = 0
  windowPopped.value = 0
  windowWrongClicks.value = 0
}

function showDiffToast(up) {
  diffToast.value = { type: up ? 'up' : 'down', msg: up ? `⬆ Lv.${currentDifficulty.value}` : `⬇ Lv.${currentDifficulty.value}` }
  setTimeout(() => { diffToast.value = null }, 2000)
}

const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

// ─── Quit ─────────────────────────────────────────────────────────────────────
function confirmQuit() {
  gamePaused = true
  showQuitDialog.value = true
}

function resumeGame() {
  showQuitDialog.value = false
  gamePaused = false
}

function doQuit() {
  clearAll()
  leavePbGameWindow({ confirm: false })
}

// ─── Game lifecycle ───────────────────────────────────────────────────────────
function scheduleSpawn() {
  spawnTimer = setTimeout(() => {
    if (bubbles.value.length < 14) spawnBubble()
    scheduleSpawn()
  }, 1200 + Math.random() * 600)
}

function startGame() {
  gameTimer = setInterval(() => {
    if (gamePaused) return
    timeLeft.value--
    if (timeLeft.value <= 0) endGame()
  }, 1000)

  // Initial burst
  for (let i = 0; i < 5; i++) setTimeout(spawnBubble, i * 250)
  scheduleSpawn()

  windowTimer = setInterval(adjustDifficulty, 30000)
}

function endGame() {
  clearAll()
  const times = reactionTimes.value
  const avgRT = reactionTimes.value.length > 0
    ? Math.round(reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length)
    : 0
  emit('end', { score: score.value, totalCorrectAppeared: totalCorrectAppeared.value, totalPopped: totalPopped.value, avgReactionTime: avgRT, minReactionTime: times.length ? Math.min(...times) : 0, maxReactionTime: times.length ? Math.max(...times) : 0, maxDifficulty: currentDifficulty.value })
}

function clearAll() {
  clearInterval(gameTimer)
  clearTimeout(spawnTimer)
  clearInterval(windowTimer)
}

onMounted(startGame)
onBeforeUnmount(clearAll)
</script>

<!-- ⚠️ NOT scoped — @keyframes names must be global to work with JS inline animation -->
<style>
@keyframes bubbleFloat {
  /* 逻辑游戏区高度约 832px，气泡需从底部 -size 运动到顶部以上，用固定 px 而非 vh */
  0%   { transform: translateX(0)                         translateY(0);      opacity: 1; }
  25%  { transform: translateX(calc(var(--drift) * 0.5))  translateY(-220px); opacity: 1; }
  60%  { transform: translateX(var(--drift))              translateY(-520px); opacity: 1; }
  85%  { transform: translateX(calc(var(--drift) * 0.3))  translateY(-740px); opacity: 0.8; }
  100% { transform: translateX(0)                         translateY(-1050px); opacity: 0; }
}

@keyframes bubblePop {
  0%   { transform: scale(1);    opacity: 1; }
  40%  { transform: scale(1.5);  opacity: 0.9; }
  100% { transform: scale(0);    opacity: 0; }
}

@keyframes scoreFloat {
  0%   { transform: translateY(0);    opacity: 1; }
  100% { transform: translateY(-70px); opacity: 0; }
}
</style>

<style scoped>
.game-page {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HUD */
.hud {
  height: 68px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(0,0,0,0.45);
  border-bottom: 1px solid rgba(100,181,246,0.2);
  backdrop-filter: blur(6px);
  gap: 12px;
}

.hud-left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 220px;
}

.hud-right {
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.hud-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.hud-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.hud-value.level { color: #42a5f5; }
.hud-value.score { color: #ffb74d; }
.hud-value.time  { color: #a5d6a7; font-size: 20px; font-variant-numeric: tabular-nums; }
.hud-value.time.urgent { color: #ef5350; animation: blink 0.5s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.hud-task {
  flex: 1;
  text-align: center;
}
.task-text {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  background: rgba(33,150,243,0.2);
  border: 1px solid rgba(100,181,246,0.3);
  border-radius: 8px;
  padding: 8px 20px;
  display: inline-block;
  white-space: nowrap;
  letter-spacing: 1px;
}

.task-text :deep(.task-capsule) {
  display: inline-block;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  padding: 6px 18px;
  border-radius: 50px;
  margin: 0 4px;
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
}

.quit-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.65);
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}
.quit-btn:hover {
  background: rgba(244,67,54,0.2);
  border-color: rgba(244,67,54,0.4);
  color: #ef9a9a;
}

/* Game area */
.game-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: default;
}

/* Bubbles */
.bubble {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
  will-change: transform;
  line-height: 1;
}
.bubble.blue {
  background: radial-gradient(circle at 30% 30%, #90caf9, #1565c0);
  box-shadow: 0 0 14px rgba(33,150,243,0.7), inset 0 -4px 8px rgba(0,0,0,0.2);
  border: 2px solid rgba(144,202,249,0.8);
  color: #fff;
}
.bubble.white {
  background: radial-gradient(circle at 30% 30%, #ffffff, #bdbdbd);
  box-shadow: 0 0 8px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.08);
  border: 2px solid rgba(200,200,200,0.9);
  color: #333;
}

/* Score popup */
.score-popup {
  position: absolute;
  font-size: 22px;
  font-weight: 800;
  color: #ffeb3b;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  pointer-events: none;
  animation: scoreFloat 0.8s ease-out forwards;
  z-index: 20;
}

/* Difficulty toast */
.diff-toast {
  position: absolute;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 28px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: 700;
  z-index: 50;
  pointer-events: none;
}
.diff-toast.up   { background: rgba(76,175,80,0.9);  color:#fff; box-shadow:0 4px 20px rgba(76,175,80,0.5); }
.diff-toast.down { background: rgba(244,67,54,0.9); color:#fff; box-shadow:0 4px 20px rgba(244,67,54,0.5); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity:0; margin-top: -8px; }

/* Quit dialog */
.dialog-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}
.dialog {
  background: linear-gradient(145deg,#1a2744,#0f1e38);
  border: 1px solid rgba(100,181,246,0.3);
  border-radius: 16px;
  padding: 32px 36px;
  text-align: center;
  max-width: 360px;
  width: 90vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  animation: popIn 0.2s ease-out;
}
@keyframes popIn { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
.dialog p {
  color: rgba(255,255,255,0.85);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}
.dialog-btns { display:flex; gap:12px; }
.dialog-btn {
  flex:1; padding:11px; border:none; border-radius:10px;
  font-size:15px; font-weight:600; cursor:pointer; transition:all 0.2s;
}
.dialog-btn.cancel {
  background:rgba(255,255,255,0.1);
  color:rgba(255,255,255,0.8);
  border:1px solid rgba(255,255,255,0.2);
}
.dialog-btn.cancel:hover { background:rgba(255,255,255,0.18); }
.dialog-btn.confirm {
  background:linear-gradient(135deg,#c62828,#ef5350);
  color:#fff;
  box-shadow:0 4px 15px rgba(244,67,54,0.4);
}
.dialog-btn.confirm:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(244,67,54,0.6); }
</style>
