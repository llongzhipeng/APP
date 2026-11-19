<template>
  <div class="home-page">
    <button v-if="screen === 'home'" class="lang-btn" @click="$emit('toggle-lang')">{{ t.langBtn }}</button>
    <div class="title-area">
      <div class="game-icon">🍎</div>
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.appSubtitle }}</p>
    </div>
    <div class="menu-area">
      <button class="menu-btn primary" @click="$emit('start')">{{ t.startGame }}</button>
      <button class="menu-btn" @click="$emit('rules')">{{ t.rules }}</button>
      <button class="menu-btn" @click="$emit('history')">{{ t.history }}</button>
    </div>
    <div v-for="(d, i) in decos" :key="i" class="deco-item" :style="d"></div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    screen() { return 'home' },
    decos() {
      return [
        { top: '8%', left: '5%', fontSize: '6vmin', content: '🍊' },
        { top: '12%', right: '6%', fontSize: '5vmin', content: '🐶' },
        { top: '50%', left: '3%', fontSize: '7vmin', content: '🍇' },
        { top: '55%', right: '4%', fontSize: '6vmin', content: '🐱' },
        { bottom: '15%', left: '7%', fontSize: '5vmin', content: '🍓' },
        { bottom: '18%', right: '8%', fontSize: '6vmin', content: '🐸' },
      ]
    }
  },
}
</script>

<style scoped>
.home-page {
  width: 100vw; height: 100vh;
  background: #f5f0e8;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.lang-btn {
  position: absolute; top: 2.5vmin; right: 3vmin;
  background: #fff; border: 0.2vmin solid #d0c8b8;
  color: #555; font-size: 1.8vmin; padding: 0.8vmin 1.8vmin;
  border-radius: 1vmin; cursor: pointer; font-weight: 600; z-index: 10;
  box-shadow: 0 0.2vmin 0.8vmin rgba(0,0,0,0.08);
}
.lang-btn:hover { background: #ede8df; }
.title-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 6vmin; }
.game-icon { font-size: 10vmin; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5vmin)} }
.game-title { font-size: 6vmin; font-weight: 900; color: #333; letter-spacing: 0.3vmin; }
.game-subtitle { font-size: 2.2vmin; color: #888; margin-top: 0.8vmin; }
.menu-area { display: flex; flex-direction: column; gap: 2.5vmin; align-items: center; }
.menu-btn {
  width: 30vmin; padding: 2vmin 3vmin; font-size: 2.4vmin; font-weight: 700;
  border-radius: 1.5vmin; cursor: pointer; border: 0.2vmin solid #d0c8b8;
  color: #444; background: #fff; transition: all 0.2s;
  box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.08);
}
.menu-btn:hover { transform: translateY(-0.3vmin) scale(1.02); background: #ede8df; }
.menu-btn.primary {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  border-color: #a5d6a7; color: #fff;
  box-shadow: 0 0.5vmin 2vmin rgba(76,175,80,0.3);
}
.menu-btn.primary:hover { background: linear-gradient(135deg, #43a047, #5cb860); }
.deco-item {
  position: absolute; pointer-events: none;
  animation: decoFloat 4s ease-in-out infinite;
}
@keyframes decoFloat { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.1)} }
</style>
