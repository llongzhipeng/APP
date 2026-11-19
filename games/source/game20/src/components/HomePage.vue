<template>
  <div class="home-page">
    <button v-if="!langHidden" class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>
    <div class="title-area">
      <div class="icon-wrap">🔍</div>
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.appSubtitle }}</p>
    </div>
    <div class="menu-area">
      <button class="menu-btn primary" @click="$emit('start')">{{ t.startGame }}</button>
      <button class="menu-btn" @click="$emit('rules')">{{ t.rules }}</button>
      <button class="menu-btn" @click="$emit('history')">{{ t.history }}</button>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String, langHidden: Boolean },
  emits: ['start', 'rules', 'history', 'toggle-lang'],
  computed: { t() { return messages[this.lang] || messages.zh } },
}
</script>

<style scoped>
.home-page {
  width: 100vw; height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #0d2b4e 0%, #061525 70%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.lang-btn {
  position: absolute; top: 2.5vmin; right: 3vmin;
  background: rgba(255,255,255,0.12); border: 0.2vmin solid rgba(255,255,255,0.3);
  color: #c8e0ff; font-size: 1.8vmin; padding: 0.8vmin 1.8vmin;
  border-radius: 1vmin; cursor: pointer; font-weight: 600; z-index: 10;
}
.lang-btn:hover { background: rgba(255,255,255,0.25); }
.title-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 6vmin; }
.icon-wrap { font-size: 10vmin; margin-bottom: 1vmin; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5vmin)} }
.game-title { font-size: 6vmin; font-weight: 900; color: #c8e0ff; text-shadow: 0 0 3vmin rgba(100,180,255,0.5); letter-spacing: 0.3vmin; }
.game-subtitle { font-size: 2.2vmin; color: rgba(200,224,255,0.6); margin-top: 0.8vmin; }
.menu-area { display: flex; flex-direction: column; gap: 2.5vmin; align-items: center; }
.menu-btn {
  width: 30vmin; padding: 2vmin 3vmin; font-size: 2.4vmin; font-weight: 700;
  border-radius: 1.5vmin; cursor: pointer; border: 0.2vmin solid rgba(255,255,255,0.15);
  color: #c8e0ff; background: rgba(20,60,100,0.7); transition: all 0.2s;
}
.menu-btn:hover { transform: translateY(-0.3vmin) scale(1.02); background: rgba(30,80,140,0.9); }
.menu-btn.primary {
  background: linear-gradient(135deg, #1a5fa8, #2e8fd4);
  border-color: rgba(100,180,255,0.4);
  box-shadow: 0 0.5vmin 2vmin rgba(46,143,212,0.3);
}
.menu-btn.primary:hover { background: linear-gradient(135deg, #2070c0, #3aa0e8); }
</style>
