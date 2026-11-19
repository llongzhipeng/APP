<template>
  <div class="home-page">
    <!-- Language toggle -->
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>

    <!-- Title -->
    <div class="title-area">
      <div class="fossil-icon">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="55" rx="42" ry="38" fill="#8a7060" opacity="0.3"/>
          <ellipse cx="50" cy="50" rx="40" ry="36" fill="url(#stoneGrad)"/>
          <circle cx="35" cy="38" r="8" fill="rgba(255,255,255,0.15)"/>
          <defs>
            <radialGradient id="stoneGrad" cx="35%" cy="35%">
              <stop offset="0%" stop-color="#b8a090"/>
              <stop offset="50%" stop-color="#8a7060"/>
              <stop offset="100%" stop-color="#5a4030"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.appSubtitle }}</p>
    </div>

    <!-- Menu -->
    <div class="menu-area">
      <button class="menu-btn primary" @click="$emit('start')">
        <span class="btn-icon">⚒️</span>
        <span>{{ t.startGame }}</span>
      </button>
      <button class="menu-btn" @click="$emit('rules')">
        <span class="btn-icon">📜</span>
        <span>{{ t.rules }}</span>
      </button>
      <button class="menu-btn" @click="$emit('history')">
        <span class="btn-icon">📊</span>
        <span>{{ t.history }}</span>
      </button>
    </div>

    <!-- Decorative stones -->
    <div
      v-for="(s, i) in decoStones"
      :key="i"
      class="deco-stone"
      :style="s"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Game15HomePage'
};
</script>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'

const props = defineProps({ lang: String })
defineEmits(['start', 'rules', 'history', 'toggle-lang'])

const t = computed(() => messages[props.lang] || messages.zh)

const decoStones = [
  { top: '8%', left: '4%', width: '7vmin', height: '7vmin', animationDelay: '0s' },
  { top: '15%', right: '6%', width: '5vmin', height: '5vmin', animationDelay: '0.5s' },
  { top: '55%', left: '3%', width: '6vmin', height: '6vmin', animationDelay: '1s' },
  { top: '70%', right: '4%', width: '8vmin', height: '8vmin', animationDelay: '1.5s' },
  { bottom: '12%', left: '7%', width: '5vmin', height: '5vmin', animationDelay: '0.8s' },
  { bottom: '20%', right: '8%', width: '6vmin', height: '6vmin', animationDelay: '0.3s' },
  { top: '38%', left: '2%', width: '4vmin', height: '4vmin', animationDelay: '1.2s' },
  { top: '42%', right: '2%', width: '4.5vmin', height: '4.5vmin', animationDelay: '0.7s' },
]
</script>

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #3d200e 0%, #1a0c05 70%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Subtle ground texture */
.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(101, 67, 33, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.lang-btn {
  position: absolute;
  top: 2.5vmin;
  right: 3vmin;
  background: rgba(255,255,255,0.12);
  border: 0.2vmin solid rgba(255,255,255,0.3);
  color: #f5e6c8;
  font-size: 1.8vmin;
  padding: 0.8vmin 1.8vmin;
  border-radius: 1vmin;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
  font-weight: 600;
}
.lang-btn:hover {
  background: rgba(255,255,255,0.25);
}

.title-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6vmin;
}

.fossil-icon {
  width: 12vmin;
  height: 12vmin;
  margin-bottom: 1vmin;
  animation: floatIcon 3s ease-in-out infinite;
}
.fossil-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0.5vmin 1vmin rgba(0,0,0,0.5));
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5vmin); }
}

.game-title {
  font-size: 6vmin;
  font-weight: 900;
  color: #f5e6c8;
  text-shadow: 0 0.4vmin 2vmin rgba(0,0,0,0.8), 0 0 3vmin rgba(255, 200, 100, 0.3);
  letter-spacing: 0.3vmin;
}

.game-subtitle {
  font-size: 2.2vmin;
  color: rgba(245, 230, 200, 0.6);
  margin-top: 0.8vmin;
  letter-spacing: 0.2vmin;
}

.menu-area {
  display: flex;
  flex-direction: column;
  gap: 2.5vmin;
  align-items: center;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 1.5vmin;
  width: 30vmin;
  padding: 2vmin 3vmin;
  font-size: 2.4vmin;
  font-weight: 700;
  border-radius: 1.5vmin;
  cursor: pointer;
  border: 0.2vmin solid rgba(255,255,255,0.15);
  transition: all 0.2s;
  color: #f5e6c8;
  background: rgba(80, 45, 20, 0.7);
  backdrop-filter: blur(4px);
}
.menu-btn:hover {
  transform: translateY(-0.3vmin) scale(1.02);
  background: rgba(110, 65, 30, 0.9);
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.4);
}
.menu-btn.primary {
  background: linear-gradient(135deg, #8B5E2A, #C47C3A);
  border-color: rgba(255, 200, 100, 0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(196, 124, 58, 0.3);
}
.menu-btn.primary:hover {
  background: linear-gradient(135deg, #A06E35, #D48940);
  box-shadow: 0 0.8vmin 3vmin rgba(196, 124, 58, 0.5);
}

.btn-icon {
  font-size: 2.8vmin;
}

/* Decorative stones */
.deco-stone {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #a07850, #4a3020);
  opacity: 0.5;
  animation: stonePulse 4s ease-in-out infinite;
  pointer-events: none;
  box-shadow: inset -0.5vmin -0.5vmin 1vmin rgba(0,0,0,0.4);
}

@keyframes stonePulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
</style>
