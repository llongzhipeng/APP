<template>
  <div class="home">
    <button class="lang-btn" @click="$emit('toggle-lang')">🌐 {{ t('langSwitch') }}</button>

    <div class="hero">
      <div class="seal">語</div>
      <div class="hero-title">{{ t('title') }}</div>
      <div class="hero-sub">{{ t('subtitle') }}</div>
      <div class="divider">
        <span></span><i>◆</i><span></span>
      </div>
    </div>

    <div class="menu">
      <button class="btn primary" @click="$emit('go', 'tutorial')">{{ t('startGame') }}</button>
      <button class="btn" @click="$emit('go', 'rules')">{{ t('rules') }}</button>
      <button class="btn" @click="$emit('go', 'history')">{{ t('history') }}</button>
    </div>

    <div class="foot">言之有物 · 心之所向</div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'
export default {
  name: 'HomeScreen',
  props: ['lang'],
  methods: { t(k, p) { return t(this.lang, k, p) } }
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
  display: flex; align-items: center; gap: 0.6vmin;
  transition: all .18s;
}
.lang-btn:hover { background: #fff8ec; transform: translateY(-0.3vmin); }

.hero { text-align: center; margin-bottom: 6vmin; }
.seal {
  width: 12vmin; height: 12vmin;
  margin: 0 auto 2.5vmin;
  background: linear-gradient(135deg, #c53a1d, #8a2612);
  color: #fff5e6;
  border-radius: 2vmin;
  display: flex; align-items: center; justify-content: center;
  font-size: 7vmin; font-weight: 900;
  font-family: 'STSong', 'Noto Serif SC', serif;
  transform: rotate(-4deg);
  box-shadow: 0 1.2vmin 2.4vmin rgba(138,38,18,.35), inset 0 0 0 0.4vmin rgba(255,245,230,.25);
}
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
.divider {
  display: flex; align-items: center; justify-content: center; gap: 1.5vmin;
  margin-top: 2vmin;
}
.divider span {
  width: 6vmin; height: 0.2vmin;
  background: linear-gradient(90deg, transparent, #b08b4f, transparent);
}
.divider i {
  color: #b08b4f;
  font-size: 1.4vmin;
  font-style: normal;
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

.foot {
  margin-top: 5vmin;
  color: #a58857;
  font-size: 1.9vmin;
  letter-spacing: 0.4vmin;
  opacity: .7;
}
</style>
