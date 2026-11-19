<template>
  <div class="home">
    <!-- Language toggle -->
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t('langBtn') }}</button>

    <!-- Animated background canvas -->
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <!-- Center content -->
    <div class="home-center">
      <div class="title-group">
        <div class="ball-icon">
          <span class="ball b1"></span>
          <span class="ball b2"></span>
          <span class="ball b3"></span>
        </div>
        <h1 class="game-title">{{ t('appTitle') }}</h1>
        <p class="game-subtitle">{{ t('home.subtitle') }}</p>
      </div>

      <div class="home-buttons">
        <button class="btn btn-primary" @click="$emit('start-game')">
          <span class="btn-icon">▶</span>{{ t('home.startGame') }}
        </button>
        <button class="btn btn-secondary" @click="$emit('show-rules')">
          <span class="btn-icon">📋</span>{{ t('home.rules') }}
        </button>
        <button class="btn btn-secondary" @click="$emit('show-history')">
          <span class="btn-icon">📊</span>{{ t('home.history') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game11HomePage'
};
</script>

<script setup>
import { ref, onMounted, onUnmounted } from '@vue/composition-api'

defineProps({ t: Function, lang: String })
defineEmits(['start-game', 'show-rules', 'show-history', 'toggle-lang'])

const bgCanvas = ref(null)
let animId = null
const balls = []

function initBalls(w, h) {
  balls.length = 0
  for (let i = 0; i < 15; i++) {
    balls.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 18 + 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.18 + 0.04,
    })
  }
}

function animate() {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)
  for (const b of balls) {
    b.x += b.vx
    b.y += b.vy
    if (b.x < -b.r) b.x = w + b.r
    if (b.x > w + b.r) b.x = -b.r
    if (b.y < -b.r) b.y = h + b.r
    if (b.y > h + b.r) b.y = -b.r
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${b.alpha})`
    ctx.fill()
  }
  animId = requestAnimationFrame(animate)
}

function resize() {
  const canvas = bgCanvas.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  initBalls(canvas.width, canvas.height)
}

onMounted(() => {
  resize()
  animate()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lang-btn {
  position: absolute;
  top: 2.5vh;
  right: 2.5vw;
  z-index: 10;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 0.5vh 1.8vw;
  font-size: clamp(12px, 1.4vw, 18px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  letter-spacing: 1px;
}
.lang-btn:hover {
  background: rgba(255, 255, 255, 0.32);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.home-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
}

.title-group {
  text-align: center;
}

.ball-icon {
  display: flex;
  justify-content: center;
  gap: 1vw;
  margin-bottom: 2vh;
}

.ball {
  display: inline-block;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  box-shadow: 0 0 16px rgba(255,255,255,0.5);
}
.b1 { width: clamp(14px,2vw,28px); height: clamp(14px,2vw,28px); animation: float 3s ease-in-out infinite; }
.b2 { width: clamp(18px,2.6vw,36px); height: clamp(18px,2.6vw,36px); animation: float 3s ease-in-out 0.5s infinite; background: #FFD700; box-shadow: 0 0 18px rgba(255,215,0,0.7); }
.b3 { width: clamp(14px,2vw,28px); height: clamp(14px,2vw,28px); animation: float 3s ease-in-out 1s infinite; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.game-title {
  color: #fff;
  font-size: clamp(1.8rem, 4.5vw, 4rem);
  font-weight: 700;
  text-shadow: 0 2px 16px rgba(0,0,0,0.25);
  letter-spacing: 2px;
  margin-bottom: 1.2vh;
}

.game-subtitle {
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(0.8rem, 1.6vw, 1.3rem);
  letter-spacing: 0.5px;
}

.home-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.8vh;
  align-items: center;
  width: 100%;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7em;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: clamp(200px, 22vw, 300px);
  padding: 1.4vh 0;
  font-size: clamp(13px, 1.4vw, 20px);
  letter-spacing: 0.5px;
}

.btn-icon {
  font-size: 0.9em;
}

.btn-primary {
  background: #fff;
  color: #667eea;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  background: #f0f4ff;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(6px);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
</style>
