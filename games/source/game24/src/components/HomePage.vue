<template>
  <div class="home-page">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>
    <div class="title-area">
      <div class="block-icon">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="40" width="35" height="35" rx="4" fill="#E8A838" stroke="#C47C20" stroke-width="2"/>
          <rect x="55" y="40" width="35" height="35" rx="4" fill="#4A90D9" stroke="#2E6FAA" stroke-width="2"/>
          <rect x="32" y="15" width="35" height="35" rx="4" fill="#E85C3A" stroke="#C03A1A" stroke-width="2"/>
        </svg>
      </div>
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.appSubtitle }}</p>
    </div>
    <div class="menu-area">
      <button class="menu-btn primary" @click="$emit('start')">
        <span class="btn-icon">🧩</span>
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
    <div v-for="(s, i) in decoBlocks" :key="i" class="deco-block" :style="s"></div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String },
  emits: ['start', 'rules', 'history', 'toggle-lang'],
  computed: {
    t() { return messages[this.lang] || messages.zh },
    decoBlocks() {
      return [
        { top: '8%', left: '4%', width: '6vmin', height: '6vmin', background: 'rgba(232,168,56,0.3)', animationDelay: '0s' },
        { top: '15%', right: '6%', width: '5vmin', height: '5vmin', background: 'rgba(74,144,217,0.3)', animationDelay: '0.5s' },
        { top: '55%', left: '3%', width: '7vmin', height: '7vmin', background: 'rgba(232,92,58,0.3)', animationDelay: '1s' },
        { top: '70%', right: '4%', width: '8vmin', height: '8vmin', background: 'rgba(232,168,56,0.25)', animationDelay: '1.5s' },
        { bottom: '12%', left: '7%', width: '5vmin', height: '5vmin', background: 'rgba(74,144,217,0.25)', animationDelay: '0.8s' },
        { bottom: '20%', right: '8%', width: '6vmin', height: '6vmin', background: 'rgba(232,92,58,0.25)', animationDelay: '0.3s' },
      ]
    }
  }
}
</script>

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #1a2a4a 0%, #0a1020 70%);
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
  color: #e8f0ff;
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
.block-icon {
  width: 14vmin;
  height: 14vmin;
  margin-bottom: 1vmin;
  animation: floatIcon 3s ease-in-out infinite;
  filter: drop-shadow(0 0.5vmin 1.5vmin rgba(0,0,0,0.5));
}
.block-icon svg { width: 100%; height: 100%; }
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5vmin); }
}
.game-title {
  font-size: 6vmin;
  font-weight: 900;
  color: #e8f0ff;
  text-shadow: 0 0.4vmin 2vmin rgba(0,0,0,0.8), 0 0 3vmin rgba(100,160,255,0.3);
  letter-spacing: 0.3vmin;
}
.game-subtitle {
  font-size: 2.2vmin;
  color: rgba(232,240,255,0.6);
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
  color: #e8f0ff;
  background: rgba(30,50,90,0.7);
  backdrop-filter: blur(4px);
}
.menu-btn:hover {
  transform: translateY(-0.3vmin) scale(1.02);
  background: rgba(50,80,140,0.9);
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.4);
}
.menu-btn.primary {
  background: linear-gradient(135deg, #2A5EA8, #4A90D9);
  border-color: rgba(100,180,255,0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(74,144,217,0.3);
}
.menu-btn.primary:hover {
  background: linear-gradient(135deg, #3A70C0, #5AA8F0);
  box-shadow: 0 0.8vmin 3vmin rgba(74,144,217,0.5);
}
.btn-icon { font-size: 2.8vmin; }
.deco-block {
  position: absolute;
  border-radius: 0.8vmin;
  opacity: 0.6;
  animation: blockPulse 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes blockPulse {
  0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.7; transform: scale(1.05) rotate(5deg); }
}
</style>
