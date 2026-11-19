<template>
  <div class="home-page">
    <button v-if="showLang" class="lang-btn" @click="$emit('toggleLang')">{{ t.langToggle }}</button>
    <div class="home-center">
      <div class="logo-area">
        <div class="logo-icon">🐟</div>
        <h1 class="game-title">{{ t.gameTitle }}</h1>
        <p class="game-subtitle">{{ t.gameSubtitle }}</p>
      </div>
      <div class="menu-buttons">
        <button class="menu-btn primary" @click="$emit('start')">▶ {{ t.startGame }}</button>
        <button class="menu-btn secondary" @click="$emit('rules')">📋 {{ t.rules }}</button>
        <button class="menu-btn secondary" @click="$emit('history')">📊 {{ t.history }}</button>
      </div>
    </div>
    <div class="deco-fish">
      <img v-for="f in decoFish" :key="f.id" :src="f.src" class="deco-fish-img" :style="f.style" />
    </div>
  </div>
</template>

<script>
import { fishImage } from '../../utils/images'

export default {
  name: 'HomePage',
  props: { t: Object, showLang: { type: Boolean, default: true } },
  emits: ['start', 'rules', 'history', 'toggleLang'],
  data() {
    const positions = [
      { left: '5%', top: '20%', size: 80, delay: '0s', dur: '7s', flip: false },
      { left: '82%', top: '15%', size: 65, delay: '1s', dur: '9s', flip: true },
      { left: '10%', top: '65%', size: 90, delay: '2s', dur: '8s', flip: false },
      { left: '78%', top: '60%', size: 70, delay: '0.5s', dur: '10s', flip: true },
      { left: '50%', top: '8%', size: 55, delay: '3s', dur: '11s', flip: false },
      { left: '90%', top: '40%', size: 60, delay: '1.5s', dur: '8s', flip: true },
      { left: '3%', top: '42%', size: 75, delay: '2.5s', dur: '9s', flip: false },
      { left: '65%', top: '78%', size: 68, delay: '4s', dur: '7s', flip: true },
    ]
    return {
      decoFish: positions.map((p, i) => ({
        id: i,
        src: fishImage((i % 4) + 1),
        style: {
          left: p.left, top: p.top,
          width: p.size + 'px', height: p.size + 'px',
          animationDelay: p.delay, animationDuration: p.dur,
          transform: p.flip ? 'scaleX(-1)' : 'scaleX(1)',
        },
      })),
    }
  },
}
</script>

<style scoped>
.home-page {
  position: relative;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.lang-btn {
  position: absolute; top: 20px; right: 20px; z-index: 10;
  background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4);
  color: #fff; padding: 8px 18px; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  backdrop-filter: blur(4px); transition: all 0.2s;
}
.lang-btn:hover { background: rgba(255,255,255,0.35); }
.home-center {
  position: relative; z-index: 5;
  display: flex; flex-direction: column; align-items: center; gap: 48px;
}
.logo-area { text-align: center; }
.logo-icon { font-size: 72px; margin-bottom: 16px; animation: pulse 3s ease-in-out infinite; }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
.game-title {
  font-size: 52px; font-weight: 800; color: #fff; letter-spacing: 4px;
  text-shadow: 0 0 30px rgba(0,180,255,0.8), 0 2px 10px rgba(0,0,0,0.6);
  margin-bottom: 12px;
}
.game-subtitle { font-size: 16px; color: rgba(255,255,255,0.7); letter-spacing: 2px; }
.menu-buttons { display: flex; flex-direction: column; gap: 16px; width: 300px; }
.menu-btn {
  width: 100%; padding: 16px 0; border: none; border-radius: 30px;
  font-size: 20px; font-weight: bold; cursor: pointer;
  transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.menu-btn.primary { background: linear-gradient(135deg, #f093fb, #f5576c); color: #fff; }
.menu-btn.secondary { background: rgba(255,255,255,0.9); color: #333; }
.menu-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
.deco-fish { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.deco-fish-img {
  position: absolute; object-fit: contain; opacity: 0.6;
  animation: fishFloat ease-in-out infinite;
}
@keyframes fishFloat {
  0%,100%{transform:translateY(0) scaleX(var(--fx,1))}
  50%{transform:translateY(-18px) scaleX(var(--fx,1))}
}
</style>
