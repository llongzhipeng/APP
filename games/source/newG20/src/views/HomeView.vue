<template>
  <div class="home">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.langSwitch }}</button>
    <div class="home-content">
      <h1 class="game-title">🚚 {{ t.title }}</h1>
      <div class="preview">
        <img :src="resolveImage('/images/3.png')" alt="truck" class="preview-truck"/>
      </div>
      <div class="btn-group">
        <button class="menu-btn primary" @click="$emit('nav', 'tutorial')">{{ t.start }}</button>
        <button class="menu-btn" @click="$emit('nav', 'rules')">{{ t.rules }}</button>
        <button class="menu-btn" @click="$emit('nav', 'history')">{{ t.history }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
export default {
  methods: { resolveImage },
  name: 'HomeView',
  props: ['t']
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #87ceeb 0%, #98d8e8 50%, #b8e6c9 100%);
}
.lang-btn {
  position: absolute;
  top: 3vmin;
  right: 3vmin;
  padding: 1.2vmin 2.4vmin;
  font-size: 2.2vmin;
  border: 2px solid #fff;
  background: rgba(255,255,255,0.85);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  color: #2c3e50;
  transition: all 0.2s;
}
.lang-btn:hover { background: #fff; transform: translateY(-2px); }
.home-content {
  text-align: center;
  padding: 2vmin;
}
.game-title {
  font-size: 6vmin;
  color: #fff;
  text-shadow: 0.4vmin 0.4vmin 0 #4a90e2, 0.8vmin 0.8vmin 2vmin rgba(0,0,0,0.2);
  margin-bottom: 2vmin;
  font-weight: 900;
  letter-spacing: 0.5vmin;
}
.preview {
  margin: 2vmin 0 4vmin;
}
.preview-truck {
  width: 22vmin;
  height: auto;
  animation: bounce 1.5s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2vmin); }
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 2vmin;
  align-items: center;
}
.menu-btn {
  padding: 2vmin 5vmin;
  font-size: 2.6vmin;
  border-radius: 999px;
  border: none;
  background: #fff;
  color: #2c3e50;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 0.6vmin 0 #b0c4de, 0 1vmin 2.5vmin rgba(0,0,0,0.15);
  transition: all 0.15s;
  min-width: 28vmin;
}
.menu-btn:hover { transform: translateY(-2px); box-shadow: 0 0.9vmin 0 #b0c4de, 0 1.2vmin 3vmin rgba(0,0,0,0.2); }
.menu-btn:active { transform: translateY(2px); box-shadow: 0 0.3vmin 0 #b0c4de; }
.menu-btn.primary {
  background: linear-gradient(135deg, #ff9a56, #ff6a3d);
  color: #fff;
  box-shadow: 0 0.6vmin 0 #cc5030, 0 1vmin 2.5vmin rgba(255,106,61,0.4);
}
.menu-btn.primary:hover { box-shadow: 0 0.9vmin 0 #cc5030, 0 1.2vmin 3vmin rgba(255,106,61,0.5); }
.menu-btn.primary:active { box-shadow: 0 0.3vmin 0 #cc5030; }

@media (orientation: portrait) {
  .lang-btn {
    top: calc(3vmin + env(safe-area-inset-top));
    font-size: max(3.6vmin, 15px);
    padding: 2vmin 3.6vmin;
    border-radius: 2.4vmin;
  }
  .home-content { padding-bottom: env(safe-area-inset-bottom); width: 100%; }
  .game-title {
    font-size: max(9vmin, 32px);
    letter-spacing: 0.3vmin;
    margin-bottom: 3vmin;
  }
  .preview-truck { width: max(38vmin, 140px); }
  .btn-group { gap: 3vmin; }
  .menu-btn {
    font-size: max(4.4vmin, 18px);
    padding: 3vmin 6vmin;
    min-width: 80%;
    border-radius: 2.8vmin;
  }
}
</style>
