<template>
  <div class="home">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ t('langSwitch') }}</button>
    <div class="hero">
      <div class="hero-title">{{ t('title') }}</div>
      <div class="hero-sub">{{ t('subtitle') }}</div>
    </div>
    <div class="menu">
      <button class="btn primary" @click="$emit('go', 'tutorial')">{{ t('startGame') }}</button>
      <button class="btn" @click="$emit('go', 'rules')">{{ t('rules') }}</button>
      <button class="btn" @click="$emit('go', 'history') ">{{ t('history') }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'
export default {
  name: 'HomePage',
  props: ['lang'],
  methods: {
    t(k, p) { return t(this.lang, k, p) }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  padding: 4vmin;
}
.lang-btn {
  position: absolute;
  top: 3vmin; right: 3vmin;
  padding: 1.2vmin 2.5vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.15);
}
.lang-btn:hover { background: #fff8ec; }
.hero { text-align: center; margin-bottom: 8vmin; }
.hero-title {
  font-size: 9vmin;
  font-weight: 700;
  color: #7a3a1e;
  letter-spacing: 0.8vmin;
  text-shadow: 0 0.4vmin 0 rgba(0,0,0,.05);
}
.hero-sub {
  font-size: 2.6vmin;
  color: #8a6a3a;
  margin-top: 2.5vmin;
  letter-spacing: 0.3vmin;
}
.menu {
  display: flex; flex-direction: column; gap: 2.5vmin;
  width: 32vmin;
}
.btn {
  padding: 2vmin 3vmin;
  font-size: 2.6vmin;
  border-radius: 1.5vmin;
  border: 0.25vmin solid #b08b4f;
  background: #fff;
  color: #7a5a2c;
  cursor: pointer;
  font-weight: 600;
  transition: all .18s;
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.12);
}
@media (hover: hover) {
  .btn:hover { transform: translateY(-0.3vmin); box-shadow: 0 0.6vmin 1.6vmin rgba(122,90,44,.22); }
}
.btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }
.btn.primary:hover { background: linear-gradient(135deg, #e28855, #bd5a24); }

@media (orientation: portrait) {
  .home {
    padding: calc(4vmin + env(safe-area-inset-top)) 6vw calc(4vmin + env(safe-area-inset-bottom));
  }
  .lang-btn {
    top: calc(3vmin + env(safe-area-inset-top));
    right: 4vw;
    padding: 2vmin 4vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 4vmin;
    border-width: 0.4vmin;
  }
  .hero { margin-bottom: 10vmin; }
  .hero-title { font-size: max(14vw, 40px); letter-spacing: 0.4vmin; }
  .hero-sub { font-size: max(4vmin, 15px); margin-top: 3vmin; letter-spacing: 0.15vmin; }
  .menu { width: 82vw; gap: 3vmin; }
  .btn {
    padding: 3.2vmin 4vmin;
    font-size: max(4.5vmin, 17px);
    border-radius: 2.5vmin;
    border-width: 0.4vmin;
  }
}
</style>
