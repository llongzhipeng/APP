<template>
  <div class="home">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t.lang.toggle }}</button>
    <div class="home-content">
      <h1 class="title">{{ t.appTitle }}</h1>
      <p class="subtitle">{{ t.home.subtitle }}</p>
      <div class="hand-demo">
        <div class="hand left-hand">
          <div class="finger"></div>
          <div class="finger"></div>
          <div class="finger"></div>
          <div class="finger"></div>
          <div class="thumb"></div>
        </div>
        <div class="hand right-hand">
          <div class="finger"></div>
          <div class="finger"></div>
          <div class="finger"></div>
          <div class="finger"></div>
          <div class="thumb"></div>
        </div>
      </div>
      <div class="btn-group">
        <button class="primary-btn" @click="$emit('go', 'tutorial')">{{ t.home.start }}</button>
        <button class="secondary-btn" @click="$emit('go', 'rules')">{{ t.home.rules }}</button>
        <button class="secondary-btn" @click="$emit('go', 'history')">{{ t.home.history }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  props: { t: { type: Object, required: true } }
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}
.lang-btn {
  position: absolute;
  top: calc(var(--u) * 2);
  right: calc(var(--u) * 2);
  padding: calc(var(--u) * 0.8) calc(var(--u) * 1.6);
  font-size: calc(var(--u) * 1.4);
  border: 2px solid #fff;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border-radius: calc(var(--u) * 0.6);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: all .2s;
}
.lang-btn:hover { background: rgba(255,255,255,0.3); }
.home-content {
  text-align: center;
  color: #fff;
  padding: calc(var(--u) * 2);
  max-width: 90vw;
}
.title {
  font-size: calc(var(--u) * 5);
  margin-bottom: calc(var(--u) * 1.2);
  letter-spacing: calc(var(--u) * 0.4);
  text-shadow: 0 4px 12px rgba(0,0,0,0.25);
}
.subtitle {
  font-size: calc(var(--u) * 1.7);
  margin-bottom: calc(var(--u) * 3);
  opacity: 0.9;
}
.hand-demo {
  display: flex;
  justify-content: center;
  gap: calc(var(--u) * 5);
  margin-bottom: calc(var(--u) * 3);
}
.hand {
  width: calc(var(--u) * 6);
  height: calc(var(--u) * 7);
  background: #ffd8b3;
  border-radius: calc(var(--u) * 1.2);
  position: relative;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}
.hand .finger {
  position: absolute;
  width: calc(var(--u) * 1);
  height: calc(var(--u) * 3);
  background: #ffd8b3;
  border-radius: calc(var(--u) * 0.5);
  top: calc(var(--u) * -2.5);
}
.hand .finger:nth-child(1) { left: calc(var(--u) * 0.4); height: calc(var(--u) * 2.6); top: calc(var(--u) * -2.1); }
.hand .finger:nth-child(2) { left: calc(var(--u) * 1.6); }
.hand .finger:nth-child(3) { left: calc(var(--u) * 2.8); height: calc(var(--u) * 3.4); top: calc(var(--u) * -2.9); }
.hand .finger:nth-child(4) { left: calc(var(--u) * 4); height: calc(var(--u) * 2.6); top: calc(var(--u) * -2.1); }
.hand .thumb {
  position: absolute;
  width: calc(var(--u) * 1.4);
  height: calc(var(--u) * 2);
  background: #ffd8b3;
  border-radius: calc(var(--u) * 0.6);
}
.left-hand .thumb { right: calc(var(--u) * -1); top: calc(var(--u) * 0.5); transform: rotate(20deg); }
.right-hand .thumb { left: calc(var(--u) * -1); top: calc(var(--u) * 0.5); transform: rotate(-20deg); }
.btn-group { display: flex; flex-direction: column; align-items: center; gap: calc(var(--u) * 1.4); }
.primary-btn, .secondary-btn {
  min-width: calc(var(--u) * 22);
  padding: calc(var(--u) * 1.4) calc(var(--u) * 3);
  font-size: calc(var(--u) * 1.8);
  border-radius: calc(var(--u) * 0.8);
  cursor: pointer;
  border: none;
  transition: transform .15s, box-shadow .15s;
}
.primary-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff8e53);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255,107,107,0.4);
}
.secondary-btn {
  background: rgba(255,255,255,0.9);
  color: #333;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
.primary-btn:hover, .secondary-btn:hover { transform: translateY(-2px); }

@media (orientation: portrait) {
  .home-content {
    padding: calc(var(--u) * 2) 5vw;
    padding-top: calc(var(--u) * 2 + env(safe-area-inset-top));
    padding-bottom: calc(var(--u) * 2 + env(safe-area-inset-bottom));
    max-width: 100vw;
  }
  .lang-btn {
    top: calc(var(--u) * 1.5 + env(safe-area-inset-top));
    right: 4vw;
    padding: 1.6vmin 3.2vmin;
    font-size: max(3vmin, 14px);
    border-radius: 2vmin;
  }
  .title {
    font-size: max(7vmin, 24px);
    letter-spacing: 0.4vmin;
    margin-bottom: 2vh;
  }
  .subtitle {
    font-size: max(3.6vmin, 14px);
    margin-bottom: 4vh;
    line-height: 1.5;
  }
  .hand-demo {
    gap: 10vmin;
    margin-bottom: 5vh;
  }
  .btn-group { gap: 2.4vh; width: 100%; }
  .primary-btn, .secondary-btn {
    width: 82%;
    min-width: 0;
    padding: 2.4vmin 4vmin;
    font-size: max(4vmin, 16px);
    border-radius: 3vmin;
  }
}
</style>
