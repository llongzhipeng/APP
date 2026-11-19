<template>
  <div class="result">
    <div class="confetti" v-for="i in 30" :key="i" :style="conf(i)"></div>
    <div class="panel">
      <div class="trophy">
        <svg viewBox="0 0 64 64" width="4rem" height="4rem">
          <path fill="#ffd76a" d="M20 4h24v10a12 12 0 0 1-24 0V4Z"/>
          <path fill="#ffb347" d="M20 18a12 12 0 0 1-12-12h6v6a6 6 0 0 0 6 6ZM44 18a12 12 0 0 0 12-12h-6v6a6 6 0 0 1-6 6Z"/>
          <path fill="#8b5a1e" d="M24 30h16v6H24z"/>
          <path fill="#6b3f10" d="M18 38h28v6H18z"/>
          <path fill="#4a2f10" d="M14 46h36v6H14z"/>
        </svg>
      </div>
      <h2>{{ t('resultTitle') }}</h2>
      <div class="score-big">{{ result.score }}</div>
      <div class="score-label">{{ t('yourScore') }}</div>
      <div class="stats">
        <div class="stat"><div class="v">{{ result.total }}</div><div class="k">{{ t('totalQ') }}</div></div>
        <div class="stat"><div class="v ok">{{ result.success }}</div><div class="k">{{ t('successQ') }}</div></div>
        <div class="stat"><div class="v no">{{ result.fail }}</div><div class="k">{{ t('failQ') }}</div></div>
        <div class="stat"><div class="v">{{ result.rate }}%</div><div class="k">{{ t('successRate') }}</div></div>
        <div class="stat"><div class="v">{{ result.avgMs }}</div><div class="k">{{ t('avgTime') }} ({{ t('ms') }})</div></div>
        <div class="stat"><div class="v">L{{ result.levels }}</div><div class="k">{{ t('difficulty') }}</div></div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" @click="$emit('home')">{{ t('backHome') }}</button>
        <button class="btn btn-primary" @click="$emit('again')">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n'
export default {
  mixins: [i18nMixin],
  props: { result: Object },
  methods: {
    conf(i) {
      const c = ['#ffd76a','#ff7a3d','#6fd88a','#4a7bff','#ffb3c8'][i % 5]
      const left = Math.random() * 100
      const delay = Math.random() * 3
      const dur = 3 + Math.random() * 3
      const size = 6 + Math.random() * 8
      return `left:${left}%;background:${c};animation-delay:-${delay}s;animation-duration:${dur}s;width:${size}px;height:${size*.4}px;`
    },
  },
}
</script>

<style scoped>
.result {
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at top, #1a2436 0%, #0b1018 55%, #06090e 100%);
  overflow: hidden;
}
.confetti {
  position: absolute; top: -2rem;
  animation: fall linear infinite;
  border-radius: 2px;
}
@keyframes fall {
  0% { transform: translateY(-2rem) rotate(0); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
.panel {
  position: relative;
  width: min(38rem, 92vw);
  background: linear-gradient(180deg, #1c2331, #141822);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 1.5rem; padding: 2.5rem;
  box-shadow: 0 2rem 5rem rgba(0,0,0,.6);
  text-align: center;
  z-index: 5;
}
.trophy { margin-bottom: 1rem; }
h2 { font-size: 1.5rem; color: rgba(255,255,255,.7); font-weight: 500; letter-spacing: .05em; }
.score-big {
  font-size: 6rem; font-weight: 900; line-height: 1;
  background: linear-gradient(180deg, #fff, #ffd76a 60%, #ff7a3d);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin: 1rem 0 .3rem;
  text-shadow: 0 .5rem 3rem rgba(255, 215, 106, .3);
}
.score-label { color: rgba(255,255,255,.5); letter-spacing: .2em; text-transform: uppercase; font-size: .9rem; }
.stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
  margin: 2rem 0;
}
.stat {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: .8rem; padding: 1rem .5rem;
}
.stat .v { font-size: 1.6rem; font-weight: 800; color: #fff; }
.stat .v.ok { color: #6fd88a; }
.stat .v.no { color: #ff8b8b; }
.stat .k { font-size: .75rem; color: rgba(255,255,255,.5); margin-top: .3rem; letter-spacing: .05em; }
.actions { display: flex; gap: 1rem; }
.actions .btn { flex: 1; }
</style>
