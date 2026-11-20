<template>
  <div class="home-page">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>
    <div class="title-area">
      <div class="game-icon">🔍</div>
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.appSubtitle }}</p>
    </div>
    <div class="menu-area">
      <button class="menu-btn primary" @click="$emit('start')">
        <span class="btn-icon">🎮</span>
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
    <div v-for="(s, i) in decoItems" :key="i" class="deco-item" :style="s"></div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'

const props = defineProps({ lang: String })
defineEmits(['start', 'rules', 'history', 'toggle-lang'])
const t = computed(() => messages[props.lang] || messages.zh)

const decoItems = [
  { top: '8%', left: '4%', width: '7vmin', height: '7vmin', animationDelay: '0s' },
  { top: '15%', right: '6%', width: '5vmin', height: '5vmin', animationDelay: '0.5s' },
  { top: '55%', left: '3%', width: '6vmin', height: '6vmin', animationDelay: '1s' },
  { top: '70%', right: '4%', width: '8vmin', height: '8vmin', animationDelay: '1.5s' },
  { bottom: '12%', left: '7%', width: '5vmin', height: '5vmin', animationDelay: '0.8s' },
  { bottom: '20%', right: '8%', width: '6vmin', height: '6vmin', animationDelay: '0.3s' },
]
</script>

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #0d2137 0%, #060e1a 70%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.lang-btn {
  position: absolute;
  top: 2.5vmin;
  right: 3vmin;
  background: rgba(255,255,255,0.12);
  border: 0.2vmin solid rgba(255,255,255,0.3);
  color: #c8e6ff;
  font-size: 1.8vmin;
  padding: 0.8vmin 1.8vmin;
  border-radius: 1vmin;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
  font-weight: 600;
}
.lang-btn:hover { background: rgba(255,255,255,0.25); }
.title-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6vmin;
}
.game-icon {
  font-size: 12vmin;
  margin-bottom: 1vmin;
  animation: floatIcon 3s ease-in-out infinite;
  filter: drop-shadow(0 0.5vmin 1vmin rgba(0,0,0,0.5));
}
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5vmin); }
}
.game-title {
  font-size: 6vmin;
  font-weight: 900;
  color: #c8e6ff;
  text-shadow: 0 0.4vmin 2vmin rgba(0,0,0,0.8), 0 0 3vmin rgba(100,180,255,0.4);
  letter-spacing: 0.3vmin;
}
.game-subtitle {
  font-size: 2.2vmin;
  color: rgba(200,230,255,0.6);
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
  color: #c8e6ff;
  background: rgba(20,50,80,0.7);
  backdrop-filter: blur(4px);
}
.menu-btn:hover {
  transform: translateY(-0.3vmin) scale(1.02);
  background: rgba(30,70,110,0.9);
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.4);
}
.menu-btn.primary {
  background: linear-gradient(135deg, #1a5a8a, #2a8ac4);
  border-color: rgba(100,200,255,0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(42,138,196,0.3);
}
.menu-btn.primary:hover {
  background: linear-gradient(135deg, #2a6a9a, #3a9ad4);
  box-shadow: 0 0.8vmin 3vmin rgba(42,138,196,0.5);
}
.btn-icon { font-size: 2.8vmin; }
.deco-item {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #2a6a9a, #0a2a4a);
  opacity: 0.4;
  animation: pulse 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
</style>
