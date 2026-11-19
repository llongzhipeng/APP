<template>
  <div class="home-screen">
    <div class="home-card">
      <div class="home-title">
        <img :src="resolveImage('/images/2.png')" class="title-duck" alt="duck" />
        <h1>{{ t('title') }}</h1>
        <img :src="resolveImage('/images/1.png')" class="title-duck" alt="duck" />
      </div>
      <div class="home-btns">
        <button class="btn-main" @click="$emit('start')">{{ t('startGame') }}</button>
        <button class="btn-sec" @click="$emit('rules')">{{ t('rules') }}</button>
        <button class="btn-sec" @click="$emit('history')">{{ t('history') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
import { t } from '../i18n.js'
export default {
  props: ['lang'],
  methods: { resolveImage, t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.home-screen {
  width: 100%; height: 100%;
  background: url(~@/views/game/newG03/public/images/bacground.png) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
}
.home-card {
  background: rgba(255,255,255,0.92); border-radius: 3vmin;
  padding: 5vmin 6vmin; display: flex; flex-direction: column;
  align-items: center; gap: 4vmin;
  box-shadow: 0 1vmin 5vmin rgba(0,0,0,0.25);
}
.home-title {
  display: flex; align-items: center; gap: 2.5vmin;
}
.home-title h1 { font-size: 6vmin; color: #1a5ca8; white-space: nowrap; font-weight: 900; letter-spacing: 0.3vmin; }
.title-duck { width: 9vmin; animation: bob 1.5s ease-in-out infinite; }
.title-duck:nth-child(3) { animation-delay: 0.75s; }
@keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1vmin)} }

.home-btns { display: flex; flex-direction: column; align-items: center; gap: 2.8vmin; width: 100%; }
.btn-main {
  width: 100%; padding: 2.2vmin 0; font-size: 3.2vmin; font-weight: 700;
  background: #f5a623; color: #fff; border: none; border-radius: 4vmin;
  cursor: pointer; transition: transform 0.15s, background 0.2s;
  min-width: 32vmin;
  margin-bottom: 2.2vmin;
}
.btn-main:hover { background: #e0921a; transform: scale(1.03); }
.btn-sec {
  width: 100%; padding: 1.8vmin 0; font-size: 2.6vmin; font-weight: 700;
  background: #4a9eff; color: #fff; border: none; border-radius: 4vmin;
  cursor: pointer; transition: transform 0.15s, background 0.2s;
  margin-bottom: 2.2vmin;
}
.btn-sec:last-child { margin-bottom: 0; }
.btn-sec:hover { background: #2270c4; transform: scale(1.03); }

/* ---------- Portrait (mobile / WeChat web-view) ---------- */
@media (orientation: portrait) {
  .home-card {
    width: 84vw;
    padding: 8vmin 6vmin;
    padding-top: calc(8vmin + env(safe-area-inset-top));
    padding-bottom: calc(8vmin + env(safe-area-inset-bottom));
    border-radius: 5vmin;
    gap: 6vmin;
  }
  .home-title { gap: 3vmin; }
  .home-title h1 { font-size: max(8vmin, 26px); letter-spacing: 0.4vmin; }
  .title-duck { width: 14vmin; }

  .home-btns { gap: 4vmin; }
  .btn-main {
    width: 100%;
    padding: 3.4vmin 0;
    font-size: max(5vmin, 20px);
    border-radius: 6vmin;
    min-width: 0;
  }
  .btn-sec {
    width: 100%;
    padding: 3vmin 0;
    font-size: max(4.2vmin, 16px);
    border-radius: 6vmin;
  }
}
</style>
