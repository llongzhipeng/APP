<template>
  <div class="home-page">
    <!-- Language toggle (top-right) -->
    <button class="lang-btn" @click="$emit('toggleLang')">{{ t.langToggle }}</button>

    <!-- Center content -->
    <div class="home-center">
      <!-- Logo / Title area -->
      <div class="logo-area">
        <div class="logo-icon">🎯</div>
        <h1 class="game-title">{{ t.gameTitle }}</h1>
        <p class="game-subtitle">{{ t.lang === 'EN' ? '信息加工 · 快速反应 · 精准执行' : 'Process · React · Execute' }}</p>
      </div>

      <!-- Menu buttons -->
      <div class="menu-buttons">
        <button class="menu-btn primary" @click="$emit('start')">
          <span class="btn-icon">▶</span>
          {{ t.startGame }}
        </button>
        <button class="menu-btn secondary" @click="$emit('rules')">
          <span class="btn-icon">📋</span>
          {{ t.rules }}
        </button>
        <button class="menu-btn secondary" @click="$emit('history')">
          <span class="btn-icon">📊</span>
          {{ t.history }}
        </button>
      </div>
    </div>

    <!-- Decorative bubbles background -->
    <div class="deco-bubbles">
      <div v-for="i in 11" :key="i" class="deco-bubble" :style="decoBubbleStyle(i)">
        {{ decoBubbleContent(i) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game6HomePage'
};
</script>

<script setup>
defineProps({ t: Object })
defineEmits(['start', 'rules', 'history', 'toggleLang'])

const decoContents = ['3', 'A', '7', 'K', '5', 'Z', '2', 'M', '9', 'B', '4']
const decoColors = ['blue', 'white', 'blue', 'blue', 'white', 'blue', 'white', 'blue', 'blue', 'white', 'blue']

function decoBubbleStyle(i) {
  const positions = [
    { left: '5%', top: '15%', size: 70, delay: '0s', dur: '8s' },
    { left: '88%', top: '20%', size: 55, delay: '1.5s', dur: '10s' },
    { left: '15%', top: '70%', size: 80, delay: '3s', dur: '7s' },
    { left: '80%', top: '65%', size: 60, delay: '0.5s', dur: '9s' },
    { left: '45%', top: '5%', size: 50, delay: '2s', dur: '11s' },
    { left: '92%', top: '45%', size: 65, delay: '4s', dur: '8s' },
    { left: '2%', top: '45%', size: 55, delay: '1s', dur: '12s' },
    { left: '60%', top: '75%', size: 75, delay: '2.5s', dur: '9s' },
    { left: '94%', top: '10%', size: 58, delay: '3.5s', dur: '10s' },
    { left: '90%', top: '80%', size: 62, delay: '1.8s', dur: '11s' },
    { left: '85%', top: '35%', size: 68, delay: '2.8s', dur: '9s' },
  ]
  const p = positions[i - 1]
  const color = decoColors[i - 1]
  return {
    left: p.left,
    top: p.top,
    width: p.size + 'px',
    height: p.size + 'px',
    fontSize: (p.size * 0.36) + 'px',
    animationDelay: p.delay,
    animationDuration: p.dur,
    background: color === 'blue'
      ? 'radial-gradient(circle at 35% 35%, rgba(100,181,246,0.5), rgba(21,101,192,0.3))'
      : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(200,200,200,0.2))',
    border: color === 'blue'
      ? '2px solid rgba(100,181,246,0.4)'
      : '2px solid rgba(255,255,255,0.3)',
    color: color === 'blue' ? 'rgba(255,255,255,0.7)' : 'rgba(180,180,200,0.7)',
  }
}

function decoBubbleContent(i) {
  return decoContents[i - 1]
}
</script>

<style scoped>
.home-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lang-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  color: #fff;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.lang-btn:hover {
  background: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.5);
}

.home-center {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

.logo-area {
  text-align: center;
}

.logo-icon {
  font-size: 72px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 20px rgba(100,181,246,0.8));
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.game-title {
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 0 30px rgba(100,181,246,0.8), 0 2px 10px rgba(0,0,0,0.5);
  margin-bottom: 12px;
}

.game-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 2px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 280px;
}

.menu-btn {
  width: 100%;
  padding: 15px 60px;
  border: none;
  border-radius: 30px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.menu-btn.primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}
.menu-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
.menu-btn.primary:active {
  transform: translateY(0);
}

.menu-btn.secondary {
  background: white;
  color: #333;
}
.menu-btn.secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 20px;
}

/* Decorative background bubbles */
.deco-bubbles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.deco-bubble {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  animation: decoFloat linear infinite;
}

@keyframes decoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(5deg); }
  75% { transform: translateY(10px) rotate(-5deg); }
}
</style>
