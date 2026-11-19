<template>
  <div class="home-page">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>
    <div class="title-area">
      <div class="brain-icon">🧠</div>
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
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String })
defineEmits(['start', 'rules', 'history', 'toggle-lang'])
const t = computed(() => messages[props.lang] || messages.zh)
</script>

<style scoped>
.home-page {
  width: 100vw; height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #0d2137 0%, #060e1a 70%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.home-page::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(30,80,160,0.2) 0%, transparent 70%);
  pointer-events: none;
}
.lang-btn {
  position: absolute; top: 2.5vmin; right: 3vmin;
  background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.25);
  color: #c8e0f5; font-size: 1.8vmin; padding: 0.8vmin 1.8vmin;
  border-radius: 1vmin; cursor: pointer; transition: background 0.2s; z-index: 10; font-weight: 600;
}
.lang-btn:hover { background: rgba(255,255,255,0.2); }
.title-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 6vmin; }
.brain-icon { font-size: 10vmin; margin-bottom: 1vmin; animation: floatIcon 3s ease-in-out infinite; }
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5vmin); }
}
.game-title {
  font-size: 6vmin; font-weight: 900; color: #c8e0f5;
  text-shadow: 0 0.4vmin 2vmin rgba(0,0,0,0.8), 0 0 3vmin rgba(80,160,255,0.4);
  letter-spacing: 0.3vmin;
}
.game-subtitle { font-size: 2.2vmin; color: rgba(200,224,245,0.6); margin-top: 0.8vmin; letter-spacing: 0.2vmin; }
.menu-area { display: flex; flex-direction: column; gap: 2.5vmin; align-items: center; }
.menu-btn {
  display: flex; align-items: center; gap: 1.5vmin;
  width: 30vmin; padding: 2vmin 3vmin; font-size: 2.4vmin; font-weight: 700;
  border-radius: 1.5vmin; cursor: pointer; border: 0.2vmin solid rgba(255,255,255,0.12);
  transition: all 0.2s; color: #c8e0f5; background: rgba(20,50,90,0.7); backdrop-filter: blur(4px);
}
.menu-btn:hover { transform: translateY(-0.3vmin) scale(1.02); background: rgba(30,70,120,0.9); box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.4); }
.menu-btn.primary {
  background: linear-gradient(135deg, #1a4a8a, #2a6abf);
  border-color: rgba(100,180,255,0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(42,106,191,0.3);
}
.menu-btn.primary:hover { background: linear-gradient(135deg, #2a5a9a, #3a7acf); box-shadow: 0 0.8vmin 3vmin rgba(42,106,191,0.5); }
.btn-icon { font-size: 2.8vmin; }
</style>
