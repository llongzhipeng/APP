<template>
  <div class="home-view">
    <div class="deco-orbs">
      <div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
    </div>
    <button class="lang-btn" @click="$emit('toggle-lang')">
      🌐 {{ t('langBtn') }}
    </button>
    <div class="home-inner">
      <div class="home-title">{{ t('appTitle') }}</div>
      <div class="home-subtitle">{{ t('subTitle') }}</div>
      <div class="home-btns">
        <button class="btn btn-primary" @click="$emit('go', 'tutorial')">▶ {{ t('start') }}</button>
        <button class="btn btn-secondary" @click="$emit('go', 'rules')">📖 {{ t('rules') }}</button>
        <button class="btn btn-secondary" @click="$emit('go', 'history')">📊 {{ t('history') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import { t as trans } from '../i18n.js'
import { store } from '../store.js'
export default {
  name: 'Home',
  methods: { t(k) { return trans(store.lang, k) } }
}
</script>
<style scoped>
.home-view {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, #4a5db8 0%, transparent 45%),
    radial-gradient(circle at 80% 30%, #9b59b6 0%, transparent 40%),
    radial-gradient(circle at 60% 80%, #16a085 0%, transparent 45%),
    linear-gradient(135deg, #1a1a3e 0%, #2d1b5e 100%);
  overflow: hidden;
}
.deco-orbs .orb {
  position: absolute; border-radius: 50%; filter: blur(60px); opacity: .5;
  animation: float 12s ease-in-out infinite;
}
.orb.o1 { width: 40vmin; height: 40vmin; background: #ff8fbd; top: -8vmin; left: -8vmin; }
.orb.o2 { width: 32vmin; height: 32vmin; background: #6ee7ff; bottom: -6vmin; right: -6vmin; animation-delay: -4s; }
.orb.o3 { width: 24vmin; height: 24vmin; background: #ffd166; top: 40%; left: 65%; animation-delay: -8s; }
@keyframes float { 50% { transform: translate(2vmin, -3vmin) scale(1.1); } }

.lang-btn {
  position: absolute; top: 3vh; right: 3vw; z-index: 10;
  padding: 1.2vmin 2.4vmin;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.35);
  color: #fff; border-radius: 999px; cursor: pointer;
  font-size: 2.2vmin; font-weight: 600;
  transition: all .2s;
}
.lang-btn:hover { background: rgba(255,255,255,0.28); transform: scale(1.05); }

.home-inner {
  position: relative;
  text-align: center;
  padding: 6vmin 8vmin;
  max-width: 92vw;
}

.home-title {
  font-size: 6.5vmin;
  font-weight: 900;
  margin-bottom: 1.5vmin;
  letter-spacing: 0.4vmin;
  text-align: center;
  background: linear-gradient(135deg, #fff 0%, #ffd166 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.home-subtitle {
  color: rgba(255,255,255,0.8);
  font-size: 2.4vmin;
  margin-bottom: 5vmin;
}

.home-btns {
  display: flex; flex-direction: column;
  gap: 2.2vmin;
  align-items: center;
}
.btn {
  padding: 2vmin 5vmin;
  border-radius: 1.6vmin;
  border: 2px solid rgba(255,255,255,0.25);
  cursor: pointer;
  font-size: 2.8vmin;
  font-weight: 700;
  transition: all .25s;
  color: #fff;
  min-width: 34vmin;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  gap: 1.2vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.25);
}
.btn:hover { transform: translateY(-3px); background: rgba(255,255,255,0.2); box-shadow: 0 1.4vmin 3vmin rgba(0,0,0,0.35); }
.btn-primary {
  background: linear-gradient(135deg, #ef476f, #ffd166);
  border-color: transparent;
  font-size: 3.2vmin;
  padding: 2.4vmin 5vmin;
  box-shadow: 0 1.4vmin 3vmin rgba(239, 71, 111, 0.5);
}
.btn-secondary { background: rgba(255,255,255,0.12); }
.btn-ghost { background: transparent; opacity: 0.85; }
</style>
