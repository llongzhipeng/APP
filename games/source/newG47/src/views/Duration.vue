<template>
  <div class="page">
    <div class="orbs"><div class="o o1"></div><div class="o o2"></div></div>
    <button class="back-btn" @click="$emit('go', 'home')">← {{ t('back') }}</button>
    <div class="card">
      <h2>{{ t('chooseDuration') }}</h2>
      <p class="sub">选择你想要训练的时长 · Choose training duration</p>
      <div class="options">
        <button class="opt" :class="{ active: sel === 60 }" @click="sel = 60">
          <div class="num">1</div>
          <div class="unit">{{ t('minutes') }}</div>
          <div class="tag">轻度 / Light</div>
        </button>
        <button class="opt" :class="{ active: sel === 180 }" @click="sel = 180">
          <div class="num">3</div>
          <div class="unit">{{ t('minutes') }}</div>
          <div class="tag">推荐 / Recommended</div>
        </button>
        <button class="opt" :class="{ active: sel === 360 }" @click="sel = 360">
          <div class="num">6</div>
          <div class="unit">{{ t('minutes') }}</div>
          <div class="tag">强化 / Intense</div>
        </button>
      </div>
      <button class="start" @click="$emit('start', sel)">
        {{ t('start') }} <span>→</span>
      </button>
    </div>
  </div>
</template>
<script>
import { t as trans } from '../i18n.js'
import { store } from '../store.js'
export default {
  name: 'Duration',
  data() { return { sel: 180 } },
  methods: { t(k) { return trans(store.lang, k) } }
}
</script>
<style scoped>
.page { position: absolute; inset: 0; background: linear-gradient(135deg, #1a1a3e, #2d1b5e); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.orbs .o { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; }
.o1 { width: 36vmin; height: 36vmin; background: #ffd166; top: -6vmin; right: -6vmin; }
.o2 { width: 30vmin; height: 30vmin; background: #6ee7ff; bottom: -5vmin; left: -5vmin; }
.back-btn {
  position: absolute; top: 3vh; left: 3vw;
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.35);
  color: #fff; padding: 1.2vmin 2.4vmin;
  border-radius: 999px; cursor: pointer; z-index: 5;
  font-size: 2.2vmin; font-weight: 600;
}
.back-btn:hover { background: rgba(255,255,255,0.25); }
.card {
  position: relative;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 3vmin;
  padding: 6vmin 7vmin;
  color: #fff; text-align: center;
  box-shadow: 0 3vmin 6vmin rgba(0,0,0,0.4);
  max-width: 92vw;
}
h2 { font-size: 4.2vmin; background: linear-gradient(135deg, #ffd166, #ef476f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1vmin; }
.sub { opacity: .75; margin-bottom: 4vmin; font-size: 2.2vmin; }
.options { display: flex; gap: 3vmin; margin-bottom: 4vmin; flex-wrap: wrap; justify-content: center; }
.opt {
  flex: 1; min-width: 20vmin;
  padding: 4vmin 3vmin;
  background: rgba(255,255,255,0.06);
  border: 2.5px solid rgba(255,255,255,0.2);
  border-radius: 2.4vmin;
  color: #fff; cursor: pointer; transition: all .25s;
}
.opt:hover { transform: translateY(-4px); }
.opt.active {
  border-color: #ffd166;
  background: linear-gradient(180deg, rgba(239,71,111,0.3), rgba(255,209,102,0.18));
  box-shadow: 0 1.6vmin 4vmin rgba(239,71,111,0.4);
}
.num { font-size: 7vmin; font-weight: 900; line-height: 1; }
.unit { opacity: .85; margin: 0.6vmin 0 1vmin; font-size: 2.4vmin; }
.tag { font-size: 1.6vmin; opacity: .6; }
.start {
  padding: 2.2vmin 5vmin;
  background: linear-gradient(135deg, #ef476f, #ffd166);
  border: none;
  border-radius: 2vmin;
  color: #fff;
  font-size: 3vmin;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1.4vmin 3vmin rgba(239, 71, 111, 0.5);
  transition: all .2s;
}
.start:hover { transform: translateY(-3px); box-shadow: 0 2vmin 4vmin rgba(239, 71, 111, 0.6); }
.start span { display: inline-block; margin-left: 1vmin; transition: transform .3s; }
.start:hover span { transform: translateX(0.6vmin); }
</style>
