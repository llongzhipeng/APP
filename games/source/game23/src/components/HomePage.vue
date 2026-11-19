<template>
  <div class="home-page" :style="bgStyle">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>

    <div class="title-area">
      <div class="chest-icon">
        <img :src="closeImage" alt="chest" />
      </div>
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.appSubtitle }}</p>
    </div>

    <div class="menu-area">
      <button class="menu-btn primary" @click="$emit('start')">🗝️ {{ t.startGame }}</button>
      <button class="menu-btn" @click="$emit('rules')">📜 {{ t.rules }}</button>
      <button class="menu-btn" @click="$emit('history')">📊 {{ t.history }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
import { bgImage, closeImage } from '../../utils/images.js'

const props = defineProps({ lang: String })
defineEmits(['start', 'rules', 'history', 'toggle-lang'])
const t = computed(() => messages[props.lang] || messages.zh)
const bgStyle = { background: `url('${bgImage}') center/contain no-repeat, #0d0618` }
</script>

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(10, 4, 20, 0.45);
  pointer-events: none;
}
.lang-btn {
  position: absolute;
  top: 2.5vmin;
  right: 3vmin;
  background: rgba(255,255,255,0.1);
  border: 0.2vmin solid rgba(255,255,255,0.3);
  color: #e8d5ff;
  font-size: 1.8vmin;
  padding: 0.8vmin 1.8vmin;
  border-radius: 1vmin;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
  font-weight: 600;
}
.lang-btn:hover { background: rgba(255,255,255,0.2); }
.title-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6vmin;
  position: relative;
  z-index: 1;
}
.chest-icon {
  width: 14vmin;
  height: 14vmin;
  margin-bottom: 2vmin;
  animation: floatIcon 3s ease-in-out infinite;
  border-radius: 1vmin;
  overflow: hidden;
  box-shadow: 0 0 3vmin rgba(180, 100, 255, 0.5);
}
.chest-icon img { width: 100%; height: 100%; object-fit: contain; }
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5vmin); }
}
.game-title {
  font-size: 6vmin;
  font-weight: 900;
  color: #e8d5ff;
  text-shadow: 0 0 3vmin rgba(180, 100, 255, 0.8), 0 0.4vmin 2vmin rgba(0,0,0,0.8);
  letter-spacing: 0.3vmin;
}
.game-subtitle {
  font-size: 2.2vmin;
  color: rgba(232, 213, 255, 0.6);
  margin-top: 0.8vmin;
}
.menu-area {
  display: flex;
  flex-direction: column;
  gap: 2.5vmin;
  align-items: center;
  position: relative;
  z-index: 1;
}
.menu-btn {
  width: 32vmin;
  padding: 2vmin 3vmin;
  font-size: 2.4vmin;
  font-weight: 700;
  border-radius: 1.5vmin;
  cursor: pointer;
  border: 0.2vmin solid rgba(255,255,255,0.15);
  transition: all 0.2s;
  color: #e8d5ff;
  background: rgba(60, 20, 80, 0.7);
  backdrop-filter: blur(4px);
}
.menu-btn:hover {
  transform: translateY(-0.3vmin) scale(1.02);
  background: rgba(90, 40, 120, 0.9);
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.4);
}
.menu-btn.primary {
  background: linear-gradient(135deg, #6b21a8, #a855f7);
  border-color: rgba(200, 150, 255, 0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(168, 85, 247, 0.4);
}
.menu-btn.primary:hover {
  background: linear-gradient(135deg, #7c3aed, #c084fc);
  box-shadow: 0 0.8vmin 3vmin rgba(168, 85, 247, 0.6);
}
</style>
