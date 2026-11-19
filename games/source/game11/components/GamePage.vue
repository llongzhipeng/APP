<template>
  <div class="game-page">
    <!-- Header bar -->
    <div class="game-header">
      <div class="header-left">
        <div class="info-chip">
          <span class="info-label">{{ t('game.difficulty') }}</span>
          <span class="info-val diff-val">Lv.{{ gs.difficulty }}</span>
        </div>
        <div class="info-chip">
          <span class="info-label">{{ t('game.score') }}</span>
          <span class="info-val score-val">{{ gs.score }}</span>
        </div>
        <div class="info-chip" :class="{ urgent: gs.timeLeft <= 10 }">
          <span class="info-label">{{ t('game.timeLeft') }}</span>
          <span class="info-val">{{ formatTime(gs.timeLeft) }}</span>
        </div>
      </div>

      <div class="header-center">
        <span class="phase-text" :class="'phase-' + phase">{{ phaseText }}</span>
      </div>

      <div class="header-right">
        <button v-if="showBatchSkip" class="return-btn skip-btn" @click="onBatchSkip">⏭ {{ t('game.skip') }}</button>
        <button class="return-btn" @click="onReturnClick">{{ t('game.returnBtn') }}</button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="canvas-wrap" ref="canvasWrap">
      <canvas ref="gameCanvas" class="game-canvas" @click="handleCanvasClick" @touchend.prevent="handleTouchEnd"></canvas>
    </div>

    <!-- Game Over overlay -->
    <div v-if="phase === 'gameover'" class="gameover-overlay">
      <div class="gameover-card">
        <h2 class="go-title">{{ t('game.gameOver.title') }}</h2>
        <div class="go-stats">
          <div class="go-stat">
            <span class="go-stat-label">{{ t('game.gameOver.score') }}</span>
            <span class="go-stat-val score-big">{{ gs.score }}</span>
          </div>
          <div class="go-stat">
            <span class="go-stat-label">{{ t('game.gameOver.accuracy') }}</span>
            <span class="go-stat-val">{{ accuracyStr }}</span>
          </div>
          <div class="go-stat">
            <span class="go-stat-label">{{ t('game.gameOver.avgTime') }}</span>
            <span class="go-stat-val">{{ avgTimeStr }}{{ t('game.gameOver.seconds') }}</span>
          </div>
        </div>
        <BatchTrainActions :home-text="t('backHome')" @home="emitGameEnd" />
      </div>
    </div>

    <!-- Confirm return dialog -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-card">
        <p>{{ t('game.confirmReturn') }}</p>
        <div class="confirm-btns">
          <button class="confirm-no" @click="showConfirm = false">{{ t('game.no') }}</button>
          <button class="confirm-yes" @click="forceReturn">{{ t('game.yes') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted,inject } from '@vue/composition-api'
import api from '@/api'
import { getTrainTypeForGame } from '@/utils/pbGameRegistry'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ t: Function, duration: Number })
const emit = defineEmits(['game-end', 'return-home'])

/* ─── Difficulty config ─────────────────────────────────── */
const DIFF_CFG = [
  null,
  { balls: 2, movement: 'linear',   speed: 'slow',     coeff: 1   },
  { balls: 2, movement: 'curved',   speed: 'slow',     coeff: 1.5 },
  { balls: 2, movement: 'brownian', speed: 'variable', coeff: 2   },
  { balls: 3, movement: 'curved',   speed: 'fast',     coeff: 2.5 },
  { balls: 3, movement: 'brownian', speed: 'variable', coeff: 3   },
  { balls: 4, movement: 'curved',   speed: 'fast',     coeff: 3.5 },
]

const IDENTIFY_MS = 3000
const MOVING_MS   = 5500
const SELECT_MS   = 10000
const FEEDBACK_MS = 1500

/* ─── State ─────────────────────────────────────────────── */
const gameCanvas  = ref(null)
const canvasWrap  = ref(null)
const phase       = ref('identifying') // identifying | moving | selecting | feedback | gameover
const showConfirm = ref(false)
const archiveId = inject('archiveId', ref(-1));

const gs = reactive({
  difficulty: getBatchStartDifficultyForGame('dtqq'),
  score: 0,
  timeLeft: props.duration,
  totalRounds: 0,
  correctRounds: 0,
  totalReactionMs: 0,
  targetIndex: 0,
  balls: [],
  feedback: null, // 'correct'|'wrong'|'timeout'
  // difficulty window
  winStart: Date.now(),
  winTotal: 0,
  winCorrect: 0,
})

let animId         = null
let lastTs         = null
let phaseStartTs   = null
let selectStartTs  = null
let diffWinStartTs = null
let gameEnded      = false
let recordSubmitted = false

/* ─── Computed ──────────────────────────────────────────── */
const phaseText = computed(() => {
  const map = {
    identifying: props.t('game.identify'),
    moving:      props.t('game.moving'),
    selecting:   props.t('game.selecting'),
    feedback:    gs.feedback === 'correct' ? props.t('game.correct') : (gs.feedback === 'timeout' ? props.t('game.timeout') : props.t('game.wrong')),
    gameover:    '',
  }
  return map[phase.value] || ''
})

const accuracyStr = computed(() => {
  if (!gs.totalRounds) return '0%'
  return Math.round((gs.correctRounds / gs.totalRounds) * 100) + '%'
})

const avgTimeStr = computed(() => {
  if (!gs.correctRounds) return '0.0'
  return (gs.totalReactionMs / gs.correctRounds / 1000).toFixed(1)
})

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ─── Ball helpers ───────────────────────────────────────── */
function getBallRadius() {
  const c = gameCanvas.value
  if (!c) return 20
  return Math.min(c.width, c.height) * 0.065
}

function getSpeed(type) {
  const c = gameCanvas.value
  const base = Math.min(c.width, c.height)
  if (type === 'slow')     return base * 0.26
  if (type === 'fast')     return base * 0.42
  return base * (0.2 + Math.random() * 0.26) // variable
}

function genPositions(n, r, w, h) {
  const positions = []
  const minDist = r * 3.5
  let attempts = 0
  while (positions.length < n && attempts < 2000) {
    const x = r * 2.5 + Math.random() * (w - r * 5)
    const y = r * 2.5 + Math.random() * (h - r * 5)
    const ok = positions.every(p => {
      const dx = x - p.x, dy = y - p.y
      return Math.sqrt(dx * dx + dy * dy) >= minDist
    })
    if (ok) positions.push({ x, y })
    attempts++
  }
  while (positions.length < n) {
    positions.push({ x: r * 3 + Math.random() * (w - r * 6), y: r * 3 + Math.random() * (h - r * 6) })
  }
  return positions
}

function initBalls() {
  const c = gameCanvas.value
  if (!c) return
  const cfg = DIFF_CFG[gs.difficulty]
  const r   = getBallRadius()
  const spd = getSpeed(cfg.speed)
  const positions = genPositions(cfg.balls, r, c.width, c.height)

  gs.balls = positions.map(({ x, y }) => {
    const angle = Math.random() * Math.PI * 2
    return {
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      angle: Math.random() * Math.PI * 2,
      brownianTimer: Math.random() * 0.5,
      trail: [],
    }
  })
  gs.targetIndex = Math.floor(Math.random() * cfg.balls)
}

/* ─── Physics ───────────────────────────────────────────── */
function updateBalls(dt) {
  const c = gameCanvas.value
  if (!c) return
  const r   = getBallRadius()
  const cfg = DIFF_CFG[gs.difficulty]
  const w   = c.width, h = c.height

  gs.balls.forEach(b => {
    b.trail.push({ x: b.x, y: b.y })
    if (b.trail.length > 9) b.trail.shift()

    if (cfg.movement === 'linear') {
      b.x += b.vx * dt
      b.y += b.vy * dt
    } else if (cfg.movement === 'curved') {
      b.angle += 1.8 * dt
      const force = Math.min(w, h) * 0.06
      b.vx += -Math.sin(b.angle) * force * dt
      b.vy +=  Math.cos(b.angle) * force * dt
      const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
      const targetSpd = getSpeed(cfg.speed)
      if (spd > 0) {
        b.vx = (b.vx / spd) * targetSpd
        b.vy = (b.vy / spd) * targetSpd
      }
      b.x += b.vx * dt
      b.y += b.vy * dt
    } else { // brownian
      b.brownianTimer -= dt
      if (b.brownianTimer <= 0) {
        b.brownianTimer = 0.25 + Math.random() * 0.55
        const a = Math.random() * Math.PI * 2
        const spd = getSpeed('variable')
        b.vx = Math.cos(a) * spd
        b.vy = Math.sin(a) * spd
      }
      b.x += b.vx * dt
      b.y += b.vy * dt
    }

    // Wall bounce
    if (b.x - r < 0)   { b.x = r;     b.vx =  Math.abs(b.vx) }
    if (b.x + r > w)   { b.x = w - r; b.vx = -Math.abs(b.vx) }
    if (b.y - r < 0)   { b.y = r;     b.vy =  Math.abs(b.vy) }
    if (b.y + r > h)   { b.y = h - r; b.vy = -Math.abs(b.vy) }
  })
}

/* ─── Drawing ───────────────────────────────────────────── */
function drawStar(ctx, cx, cy, r) {
  ctx.save()
  ctx.fillStyle = '#FFD700'
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = 10
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI / 5) - Math.PI / 2
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function draw(ts) {
  const c = gameCanvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  const w = c.width, h = c.height

  // Background
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, w, h)

  const r = getBallRadius()
  const phaseElapsed = ts - (phaseStartTs || ts)

  // Trails (moving phase)
  if (phase.value === 'moving') {
    gs.balls.forEach(b => {
      b.trail.forEach((pos, i) => {
        const alpha = (i / b.trail.length) * 0.2
        const tr = r * (0.3 + (i / b.trail.length) * 0.7)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, tr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(74,144,226,${alpha})`
        ctx.fill()
      })
    })
  }

  // Balls
  gs.balls.forEach((b, i) => {
    const isTarget = i === gs.targetIndex

    // Identify highlight
    if (isTarget && phase.value === 'identifying') {
      const pulse = Math.sin(phaseElapsed / 320) * 0.5 + 0.5
      ctx.beginPath()
      ctx.arc(b.x, b.y, r + 6 + pulse * 7, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,215,0,${0.55 + pulse * 0.45})`
      ctx.lineWidth = 3
      ctx.stroke()
      drawStar(ctx, b.x, b.y - r - 16, 9)
    }

    // Feedback highlight
    if (phase.value === 'feedback') {
      if (isTarget) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, r + 8, 0, Math.PI * 2)
        ctx.strokeStyle = '#4CAF50'
        ctx.lineWidth = 4
        ctx.stroke()
      }
    }

    // Selecting: dim non-target hint (subtle)
    ctx.beginPath()
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#4A90E2'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  // Feedback text on canvas
  if (phase.value === 'feedback') {
    const fadeProgress = Math.min(1, phaseElapsed / 300)
    const fadeOut = phaseElapsed > FEEDBACK_MS - 400
      ? Math.max(0, (FEEDBACK_MS - phaseElapsed) / 400)
      : 1
    const alpha = fadeProgress * fadeOut

    ctx.save()
    ctx.globalAlpha = alpha
    const fontSize = Math.min(w, h) * 0.1
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (gs.feedback === 'correct') {
      ctx.fillStyle = '#4CAF50'
      ctx.shadowColor = '#4CAF50'
      ctx.shadowBlur = 20
    } else {
      ctx.fillStyle = '#F44336'
      ctx.shadowColor = '#F44336'
      ctx.shadowBlur = 20
    }
    ctx.fillText(
      gs.feedback === 'correct' ? props.t('game.correct')
        : gs.feedback === 'timeout' ? props.t('game.timeout')
        : props.t('game.wrong'),
      w / 2, h * 0.3
    )
    ctx.restore()
  }

  // Selecting timer ring (outer progress ring)
  if (phase.value === 'selecting' && selectStartTs) {
    const elapsed = ts - selectStartTs
    const pct = Math.max(0, 1 - elapsed / SELECT_MS)
    const cx = w - r * 1.5, cy = h - r * 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.9, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2)
    ctx.strokeStyle = pct > 0.4 ? '#4CAF50' : '#F44336'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

/* ─── Phase transitions ─────────────────────────────────── */
function startRound() {
  initBalls()
  phase.value = 'identifying'
  phaseStartTs = performance.now()
}

function startMoving(ts) {
  phase.value = 'moving'
  phaseStartTs = ts
}

function startSelecting(ts) {
  gs.balls.forEach(b => b.trail = [])
  phase.value = 'selecting'
  phaseStartTs = ts
  selectStartTs = ts
}

function handleAnswer(isCorrect, ts) {
  if (phase.value !== 'selecting') return
  const reactionMs = selectStartTs ? ts - selectStartTs : SELECT_MS
  gs.totalRounds++
  gs.winTotal++
  if (isCorrect) {
    const pts = Math.round(5 * DIFF_CFG[gs.difficulty].coeff)
    gs.score += pts
    gs.correctRounds++
    gs.totalReactionMs += reactionMs
    gs.feedback = 'correct'
    gs.winCorrect++
  } else {
    gs.feedback = 'wrong'
  }
  phase.value = 'feedback'
  phaseStartTs = ts
}

function handleTimeout(ts) {
  gs.totalRounds++
  gs.winTotal++
  gs.feedback = 'timeout'
  phase.value = 'feedback'
  phaseStartTs = ts
}

function checkDifficultyWindow(ts) {
  if (!diffWinStartTs) { diffWinStartTs = ts; return }
  const elapsed = (ts - diffWinStartTs) / 1000
  if (elapsed >= 30) {
    if (gs.winTotal > 0) {
      const acc = gs.winCorrect / gs.winTotal
      if (acc >= 0.9 && gs.difficulty < 6) gs.difficulty++
      else if (acc < 0.7 && gs.difficulty > 1) gs.difficulty--
    }
    gs.winTotal = 0
    gs.winCorrect = 0
    diffWinStartTs = ts
  }
}

function submitGameRecord() {
  if (recordSubmitted) return
  recordSubmitted = true
  const avgMs = gs.correctRounds > 0 ? gs.totalReactionMs / gs.correctRounds : 0
  api.submitPbGameRecord({
    archiveId: archiveId.value,
    trainType: getTrainTypeForGame('dtqq'),
    gameType: 'dtqq',
    minTime: 0,
    maxTime: 0,
    avgTime: parseFloat((avgMs / 1000).toFixed(2)),
    score: gs.score,
    successCount: gs.correctRounds,
    failCount: gs.totalRounds - gs.correctRounds,
    trainDuration: props.duration,
    difficultyLevel: gs.difficulty,
  }).catch(() => {})
}

function endGame() {
  if (gameEnded) return
  gameEnded = true
  cancelAnimationFrame(animId)
  animId = null
  phase.value = 'gameover'
  submitGameRecord()
}

/* ─── Main game loop ─────────────────────────────────────── */
function gameLoop(ts) {
  if (!lastTs) lastTs = ts
  const dt = Math.min((ts - lastTs) / 1000, 0.05) // cap dt at 50ms
  lastTs = ts

  // Total timer
  gs.timeLeft -= dt
  if (gs.timeLeft <= 0) {
    gs.timeLeft = 0
    draw(ts)
    endGame()
    return
  }

  // Check difficulty window
  checkDifficultyWindow(ts)

  const phaseElapsed = ts - (phaseStartTs || ts)

  switch (phase.value) {
    case 'identifying':
      if (phaseElapsed >= IDENTIFY_MS) startMoving(ts)
      break
    case 'moving':
      updateBalls(dt)
      if (phaseElapsed >= MOVING_MS) startSelecting(ts)
      break
    case 'selecting':
      if (phaseElapsed >= SELECT_MS) handleTimeout(ts)
      break
    case 'feedback':
      if (phaseElapsed >= FEEDBACK_MS) startRound()
      break
  }

  draw(ts)
  animId = requestAnimationFrame(gameLoop)
}

/* ─── Click / touch ─────────────────────────────────────── */
function handleCanvasClick(e) {
  if (phase.value !== 'selecting') return
  const c = gameCanvas.value
  const rect = c.getBoundingClientRect()
  const scaleX = c.width / rect.width
  const scaleY = c.height / rect.height
  const cx = (e.clientX - rect.left) * scaleX
  const cy = (e.clientY - rect.top) * scaleY
  checkClick(cx, cy, performance.now())
}

function handleTouchEnd(e) {
  if (phase.value !== 'selecting') return
  const touch = e.changedTouches[0]
  const c = gameCanvas.value
  const rect = c.getBoundingClientRect()
  const scaleX = c.width / rect.width
  const scaleY = c.height / rect.height
  const cx = (touch.clientX - rect.left) * scaleX
  const cy = (touch.clientY - rect.top) * scaleY
  checkClick(cx, cy, performance.now())
}

function checkClick(cx, cy, ts) {
  const r = getBallRadius()
  for (let i = 0; i < gs.balls.length; i++) {
    const b = gs.balls[i]
    const dx = cx - b.x, dy = cy - b.y
    if (Math.sqrt(dx * dx + dy * dy) <= r + 4) {
      handleAnswer(i === gs.targetIndex, ts)
      return
    }
  }
}

const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

/* ─── Return / game over ─────────────────────────────────── */
function onReturnClick() {
  if (phase.value === 'gameover') return
  showConfirm.value = true
}

function forceReturn() {
  gameEnded = true
  cancelAnimationFrame(animId)
  animId = null
  showConfirm.value = false
  leavePbGameWindow({ confirm: false })
}

function emitGameEnd() {
  emit('game-end', {
    project: '动态追球',
    difficulty: gs.difficulty,
    duration: props.duration,
    total: gs.totalRounds,
    success: gs.correctRounds,
    fail: gs.totalRounds - gs.correctRounds,
    rate: accuracyStr.value,
    avgTime: avgTimeStr.value,
    score: gs.score,
  })
}

/* ─── Resize ─────────────────────────────────────────────── */
function resize() {
  const wrap = canvasWrap.value
  const c = gameCanvas.value
  if (!wrap || !c) return
  c.width = wrap.clientWidth
  c.height = wrap.clientHeight
}

/* ─── Lifecycle ─────────────────────────────────────────── */
onMounted(() => {
  resize()
  diffWinStartTs = performance.now()
  startRound()
  animId = requestAnimationFrame(gameLoop)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.game-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0d1117;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────────────────── */
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2vw;
  height: clamp(52px, 9vh, 80px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
  gap: 1vw;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.35);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1vw;
  flex-shrink: 0;
}

.info-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 0.3vh 1vw;
  min-width: clamp(60px, 6vw, 90px);
}
.info-chip.urgent {
  border-color: rgba(255, 100, 100, 0.7);
  background: rgba(255, 80, 80, 0.2);
  animation: pulse-urgent 1s infinite;
}
@keyframes pulse-urgent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.info-label {
  color: rgba(255, 255, 255, 0.75);
  font-size: clamp(9px, 0.85vw, 12px);
  white-space: nowrap;
}
.info-val {
  color: #fff;
  font-size: clamp(12px, 1.3vw, 18px);
  font-weight: 700;
}
.diff-val { color: #FFD700; }
.score-val { color: #a8f0c6; }

.header-center {
  flex: 1;
  text-align: center;
  overflow: hidden;
}

.phase-text {
  font-size: clamp(13px, 1.6vw, 22px);
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.3s;
}
.phase-identifying { color: #FFD700; }
.phase-moving      { color: #c8e6ff; }
.phase-selecting   { color: #fff; animation: blink 1.2s infinite; }
.phase-feedback    { color: #fff; }
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.return-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  border-radius: 50px;
  padding: 0.5vh 1.5vw;
  font-size: clamp(11px, 1.1vw, 15px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.return-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgba(255, 150, 150, 0.6);
  transform: translateY(-1px);
}

/* ── Canvas ─────────────────────────────────────────────── */
.canvas-wrap {
  flex: 1;
  min-height: 0;
  position: relative;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* ── Game Over ──────────────────────────────────────────── */
.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(102, 78, 162, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.gameover-card {
  background: #fff;
  border-radius: 20px;
  padding: 5vh 5vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  width: min(88vw, 420px);
}

.go-title {
  color: #333;
  font-size: clamp(1.2rem, 2.5vw, 2rem);
  font-weight: 700;
  letter-spacing: 1px;
}

.go-stats {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  width: 100%;
}

.go-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2vh 2vw;
  background: rgba(102, 126, 234, 0.06);
  border-radius: 10px;
}

.go-stat-label {
  color: #666;
  font-size: clamp(12px, 1.2vw, 16px);
}

.go-stat-val {
  color: #333;
  font-size: clamp(14px, 1.5vw, 20px);
  font-weight: 700;
}

.score-big { color: #667eea; font-size: clamp(18px, 2vw, 28px); }

.go-home-btn {
  width: 100%;
  padding: 1.5vh 0;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: clamp(13px, 1.4vw, 18px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}
.go-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(102, 126, 234, 0.55);
}

/* ── Confirm dialog ─────────────────────────────────────── */
.confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(102, 78, 162, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.confirm-card {
  background: #fff;
  border-radius: 16px;
  padding: 4vh 4vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vh;
  width: min(85vw, 360px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2);
}

.confirm-card p {
  color: #333;
  font-size: clamp(13px, 1.4vw, 18px);
  text-align: center;
  line-height: 1.5;
}

.confirm-btns {
  display: flex;
  gap: 2vw;
  width: 100%;
}

.confirm-no, .confirm-yes {
  flex: 1;
  padding: 1.2vh 0;
  border-radius: 50px;
  font-size: clamp(13px, 1.3vw, 17px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.confirm-no {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1.5px solid rgba(102, 126, 234, 0.3);
}
.confirm-no:hover {
  background: rgba(102, 126, 234, 0.18);
  transform: translateY(-1px);
}

.confirm-yes {
  background: linear-gradient(135deg, #F44336, #e53935);
  color: #fff;
  box-shadow: 0 3px 10px rgba(244, 67, 54, 0.35);
}
.confirm-yes:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(244, 67, 54, 0.5);
}
</style>
