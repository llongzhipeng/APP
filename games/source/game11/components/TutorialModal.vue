<template>
  <div class="tutorial-overlay">
    <div class="tutorial-modal">
      <!-- Step indicator -->
      <div class="step-indicator">
        <span
          v-for="i in TOTAL_STEPS"
          :key="i"
          class="step-dot"
          :class="{ active: i - 1 === currentStep, done: i - 1 < currentStep }"
        ></span>
      </div>

      <!-- Canvas animation area -->
      <div class="canvas-wrap">
        <canvas ref="tutCanvas" class="tut-canvas"></canvas>
      </div>

      <!-- Navigation -->
      <div class="nav-row">
        <button class="tut-btn tut-btn-ghost" @click="$emit('skip')">{{ t('tutorial.skip') }}</button>
        <div class="nav-center">
          <button class="tut-btn tut-btn-outline" :disabled="currentStep === 0" @click="prevStep">
            ← {{ t('tutorial.prev') }}
          </button>
          <button
            v-if="currentStep < TOTAL_STEPS - 1"
            class="tut-btn tut-btn-primary"
            @click="nextStep"
          >
            {{ t('tutorial.next') }} →
          </button>
          <button v-else class="tut-btn tut-btn-primary" @click="$emit('finish')">
            {{ t('tutorial.finish') }}
          </button>
        </div>
        <span class="step-label">{{ t('tutorial.stepLabel') }} {{ currentStep + 1 }} / {{ TOTAL_STEPS }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game11TutorialModal'
};
</script>

<script setup>
import { ref, watch, onMounted, onUnmounted } from '@vue/composition-api'

defineProps({ t: Function })
defineEmits(['finish', 'skip'])

const TOTAL_STEPS = 4
const currentStep = ref(0)
const tutCanvas = ref(null)

let animId = null
let startTime = null
let stepState = null

/* ── helpers ─────────────────────────────────────────────── */
function drawBall(ctx, x, y, r, color = '#4A90E2', strokeColor = '#28608f') {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawStar(ctx, cx, cy, r, color = '#b57103') {
  ctx.save()
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
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

function drawCursor(ctx, x, y, scale = 1) {
  const s = 18 * scale
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = 'rgba(20,20,20,0.85)'
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(s, s * 1.2)
  ctx.lineTo(s * 0.45, s * 1.05)
  ctx.lineTo(s * 0.7, s * 1.75)
  ctx.lineTo(s * 0.48, s * 1.82)
  ctx.lineTo(s * 0.22, s * 1.12)
  ctx.lineTo(-s * 0.08, s * 1.28)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

/* ── Step animations ─────────────────────────────────────── */
// Step 1: Identify — balls appear, target highlighted
function drawStep1(ctx, w, h, elapsed) {
  const r = Math.min(w, h) * 0.09
  const cx1 = w * 0.32, cy1 = h * 0.5
  const cx2 = w * 0.68, cy2 = h * 0.5
  const loopT = elapsed % 3000

  const appear = Math.min(1, loopT / 500)
  ctx.globalAlpha = appear

  // Target pulse ring
  if (loopT > 400) {
    const pulse = Math.sin((loopT - 400) / 350) * 0.5 + 0.5
    ctx.beginPath()
    ctx.arc(cx1, cy1, r + 6 + pulse * 7, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(151,94,0,${0.65 + pulse * 0.35})`
    ctx.lineWidth = 3
    ctx.stroke()

    // Star icon above target
    const starY = cy1 - r - 18
    drawStar(ctx, cx1, starY, 10)
  }

  drawBall(ctx, cx1, cy1, r)
  drawBall(ctx, cx2, cy2, r)
  ctx.globalAlpha = 1
}

// Step 2: Moving — balls animate with trails
function initStep2State(w, h) {
  const r = Math.min(w, h) * 0.09
  const spd = Math.min(w, h) * 0.30
  const a1 = Math.PI * 0.25
  const a2 = Math.PI * 1.3
  return {
    r,
    balls: [
      { x: w * 0.3, y: h * 0.5, vx: Math.cos(a1) * spd, vy: Math.sin(a1) * spd, trail: [] },
      { x: w * 0.7, y: h * 0.4, vx: Math.cos(a2) * spd, vy: Math.sin(a2) * spd, trail: [] },
    ],
    lastT: null,
  }
}

function drawStep2(ctx, w, h, elapsed, state) {
  const dt = state.lastT === null ? 0 : (elapsed - state.lastT) / 1000
  state.lastT = elapsed
  const r = state.r

  state.balls.forEach(b => {
    b.trail.push({ x: b.x, y: b.y })
    if (b.trail.length > 10) b.trail.shift()

    b.x += b.vx * dt
    b.y += b.vy * dt

    if (b.x - r < 0) { b.x = r; b.vx = Math.abs(b.vx) }
    if (b.x + r > w) { b.x = w - r; b.vx = -Math.abs(b.vx) }
    if (b.y - r < 0) { b.y = r; b.vy = Math.abs(b.vy) }
    if (b.y + r > h) { b.y = h - r; b.vy = -Math.abs(b.vy) }
  })

  // Trails
  state.balls.forEach(b => {
    b.trail.forEach((pos, i) => {
      const alpha = (i / b.trail.length) * 0.22
      const tr = r * (0.3 + (i / b.trail.length) * 0.7)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, tr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74,144,226,${alpha})`
      ctx.fill()
    })
  })

  state.balls.forEach(b => drawBall(ctx, b.x, b.y, r))
}

// Step 3: Select — stopped balls, cursor clicks target
function drawStep3(ctx, w, h, elapsed) {
  const r = Math.min(w, h) * 0.09
  const cx1 = w * 0.32, cy1 = h * 0.5
  const cx2 = w * 0.68, cy2 = h * 0.5
  const loopT = elapsed % 3600

  drawBall(ctx, cx1, cy1, r)
  drawBall(ctx, cx2, cy2, r)

  // Phase: cursor moves (0–1200ms), click (1200–1700ms), highlight (1700–2400ms), pause
  if (loopT < 1200) {
    const p = loopT / 1200
    const ease = 1 - Math.pow(1 - p, 3)
    const sx = w * 0.88, sy = h * 0.85
    const curX = sx + (cx1 - sx) * ease
    const curY = sy + (cy1 - sy) * ease
    drawCursor(ctx, curX, curY)
  } else if (loopT < 1700) {
    const cp = (loopT - 1200) / 500
    drawCursor(ctx, cx1, cy1, cp < 0.5 ? 1 : 0.75)
    if (cp > 0.3) {
      const rip = (cp - 0.3) / 0.7
      ctx.beginPath()
      ctx.arc(cx1, cy1, r + rip * 35, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(76,175,80,${1 - rip})`
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
  } else if (loopT < 2800) {
    const gp = Math.min(1, (loopT - 1700) / 300)
    drawBall(ctx, cx1, cy1, r, '#4A90E2')
    ctx.beginPath()
    ctx.arc(cx1, cy1, r + 7, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(76,175,80,${gp})`
    ctx.lineWidth = 4
    ctx.stroke()
    drawCursor(ctx, cx1, cy1)
  }
}

// Step 4: Score — checkmark + points
function drawStep4(ctx, w, h, elapsed) {
  const loopT = elapsed % 2800

  // Green flash
  if (loopT < 300) {
    ctx.fillStyle = `rgba(76,175,80,${0.25 * (1 - loopT / 300)})`
    ctx.fillRect(0, 0, w, h)
  }

  // Checkmark
  if (loopT > 100) {
    const prog = Math.min(1, (loopT - 100) / 450)
    const size = Math.min(w, h) * 0.16
    ctx.save()
    ctx.translate(w * 0.5, h * 0.42)
    ctx.strokeStyle = `rgba(76,175,80,${prog})`
    ctx.lineWidth = Math.min(w, h) * 0.015
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = '#4CAF50'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.moveTo(-size * 0.5, 0)
    ctx.lineTo(-size * 0.1, size * 0.4)
    ctx.lineTo(size * 0.5, -size * 0.4)
    ctx.stroke()
    ctx.restore()
  }

  // +5 score
  if (loopT > 550) {
    const sp = Math.min(1, (loopT - 550) / 400)
    const rise = Math.min(40, (loopT - 550) * 0.06)
    ctx.save()
    ctx.globalAlpha = sp > 0.8 ? 1 - (sp - 0.8) / 0.2 : sp / 0.15 > 1 ? 1 : sp / 0.15
    ctx.globalAlpha = Math.min(1, sp * 5)
    ctx.font = `bold ${Math.min(w, h) * 0.14}px Arial`
    ctx.fillStyle = '#815108'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#FF8C00'
    ctx.shadowBlur = 10
    ctx.fillText('+5', w * 0.5, h * 0.72 - rise)
    ctx.restore()
  }

  // Particles
  if (loopT > 200 && loopT < 1800) {
    const seed = Math.floor(loopT / 80)
    for (let i = 0; i < 6; i++) {
      const ang = (seed * 0.7 + i * (Math.PI * 2 / 6)) % (Math.PI * 2)
      const dist = ((loopT - 200) / 1600) * Math.min(w, h) * 0.35
      const px = w * 0.5 + Math.cos(ang) * dist
      const py = h * 0.42 + Math.sin(ang) * dist * 0.6
      const colors = ['#FFD700', '#FF6B35', '#4CAF50', '#2196F3', '#9C27B0', '#FF4081']
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = colors[i % colors.length]
      ctx.globalAlpha = 1 - (loopT - 200) / 1600
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
}

/* ── Main render loop ────────────────────────────────────── */
function render(ts) {
  const canvas = tutCanvas.value
  if (!canvas) return

  if (!startTime) startTime = ts
  const elapsed = ts - startTime

  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  switch (currentStep.value) {
    case 0: drawStep1(ctx, w, h, elapsed); break
    case 1: drawStep2(ctx, w, h, elapsed, stepState); break
    case 2: drawStep3(ctx, w, h, elapsed); break
    case 3: drawStep4(ctx, w, h, elapsed); break
  }

  animId = requestAnimationFrame(render)
}

function resetAnim() {
  cancelAnimationFrame(animId)
  startTime = null
  if (currentStep.value === 1) {
    const canvas = tutCanvas.value
    stepState = canvas ? initStep2State(canvas.width, canvas.height) : null
  } else {
    stepState = null
  }
  animId = requestAnimationFrame(render)
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}
function nextStep() {
  if (currentStep.value < TOTAL_STEPS - 1) currentStep.value++
}

watch(currentStep, () => resetAnim())

function resize() {
  const canvas = tutCanvas.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  if (currentStep.value === 1) {
    stepState = initStep2State(canvas.width, canvas.height)
  }
}

onMounted(() => {
  resize()
  resetAnim()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: #e5f1e6;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 2vh 2vw;
}

.tutorial-modal {
  background: #fff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  width: min(92vw, 820px);
  height: min(88vh, 600px);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 2vh 0 1.5vh;
}

.step-dot {
  width: clamp(8px, 1.2vw, 14px);
  height: clamp(8px, 1.2vw, 14px);
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  transition: all 0.3s;
}
.step-dot.active {
  background: #667eea;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.6);
  transform: scale(1.2);
}
.step-dot.done {
  background: #4CAF50;
}

.canvas-wrap {
  flex: 1;
  padding: 0 2vw;
  min-height: 0;
}

.tut-canvas {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 12px;
  background: linear-gradient(145deg, #f2fbf3, #dfeee1);
}

.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2vh 3vw;
  gap: 1vw;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.nav-center {
  display: flex;
  gap: 1.5vw;
}

.step-label {
  color: #999;
  font-size: clamp(11px, 1.2vw, 15px);
  min-width: 60px;
  text-align: right;
}

.tut-btn {
  border: none;
  border-radius: 50px;
  padding: 0.8vh 2vw;
  font-size: clamp(12px, 1.2vw, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.tut-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tut-btn-ghost {
  background: transparent;
  color: #aaa;
}
.tut-btn-ghost:hover {
  color: #666;
}

.tut-btn-outline {
  background: transparent;
  color: #667eea;
  border: 1.5px solid #667eea;
}
.tut-btn-outline:not(:disabled):hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateY(-1px);
}

.tut-btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.4);
}
.tut-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(102, 126, 234, 0.55);
}
</style>
