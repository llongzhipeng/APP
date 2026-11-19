<template>
  <div class="home-page">
    <div class="lang-btn-wrap">
      <button class="lang-btn" @click="$emit('toggle-lang')">{{ t('langSwitch') }}</button>
    </div>
    <div class="home-content">
      <h1 class="game-title">{{ t('appTitle') }}</h1>
      <div class="btn-group">
        <button class="menu-btn primary" @click="$emit('start')">{{ t('startGame') }}</button>
        <button class="menu-btn" @click="$emit('rules')">{{ t('rules') }}</button>
        <button class="menu-btn" @click="$emit('history')">{{ t('history') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
export default {
  name: 'HomePage',
  props: { t: { type: Function, required: true } },
};
</script>

<style scoped>
.home-page {
  width: 100%; height: 100%;
  position: relative;
  background: linear-gradient(180deg, #7ec8f2 0%, #b8e2f7 45%, #f9e79b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.home-page::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url(~@/views/game/newG13/public/images/bac.png);
  background-size: cover;
  background-position: center;
  opacity: 0.55;
}
.lang-btn-wrap {
  position: absolute;
  top: 2.5vmin;
  right: 3vmin;
  z-index: 5;
}
.lang-btn {
  background: #fff;
  color: #ff8c1a;
  border: 0.3vmin solid #ff8c1a;
  border-radius: 999px;
  padding: 1vmin 2.2vmin;
  font-size: 2vmin;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0.5vmin 1.2vmin rgba(0,0,0,0.15);
  transition: transform 0.15s;
}
.lang-btn:hover { transform: scale(1.05); }
.home-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 4vmin 6vmin;
  background: rgba(255,255,255,0.85);
  border-radius: 2vmin;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,0.15);
}
.game-title {
  font-size: 6vmin;
  color: #ff8c1a;
  margin-bottom: 3vmin;
  text-shadow: 0.4vmin 0.4vmin 0 rgba(255,255,255,0.8);
  font-weight: 900;
}
.btn-group {
  display: flex; flex-direction: column;
  gap: 1.5vmin;
  align-items: center;
}
.menu-btn {
  min-width: 32vmin;
  padding: 1.6vmin 3vmin;
  font-size: 2.6vmin;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #444;
  cursor: pointer;
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.15);
  transition: transform 0.15s, box-shadow 0.15s;
}
.menu-btn:hover { transform: translateY(-0.3vmin); box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.2); }
.menu-btn.primary {
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  color: #fff;
}

@media (orientation: portrait) {
  .lang-btn-wrap {
    top: calc(2.5vmin + env(safe-area-inset-top));
    right: 4vmin;
  }
  .lang-btn {
    font-size: max(3.6vmin, 14px);
    padding: 1.6vmin 3.4vmin;
    border-radius: 999px;
  }
  .home-content {
    width: 84vw;
    padding: 7vmin 5vmin;
    border-radius: 3vmin;
  }
  .game-title {
    font-size: max(8vmin, 26px);
    margin-bottom: 5vmin;
  }
  .btn-group { gap: 2.5vmin; }
  .menu-btn {
    width: 100%;
    min-width: 0;
    font-size: max(4.6vmin, 18px);
    padding: 2.6vmin 3vmin;
    border-radius: 999px;
  }
}
</style>
