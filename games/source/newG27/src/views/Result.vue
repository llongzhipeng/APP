<template>
  <div class="page">
    <div class="orbs"><div class="o o1"></div><div class="o o2"></div><div class="o o3"></div></div>
    <button class="lang-btn" @click="$emit('toggle-lang')">🌐 {{ t('langBtn') }}</button>
    <div class="confetti" v-if="result.correct > 0">
      <span v-for="i in 24" :key="i" :style="cStyle(i)"></span>
    </div>
    <div class="card">
      <div class="trophy">🏆</div>
      <h1>{{ t('resultTitle') }}</h1>
      <div class="big-score">
        <span class="label">{{ t('totalScore') }}</span>
        <div class="value">{{ result.score }}</div>
      </div>
      <div class="grid">
        <div class="cell">
          <div class="cl">{{ t('totalCount') }}</div><div class="cv">{{ result.total }}</div>
        </div>
        <div class="cell">
          <div class="cl">{{ t('successCount') }}</div><div class="cv ok">{{ result.correct }}</div>
        </div>
        <div class="cell">
          <div class="cl">{{ t('failCount') }}</div><div class="cv err">{{ result.wrong }}</div>
        </div>
        <div class="cell">
          <div class="cl">{{ t('successRate') }}</div><div class="cv">{{ successRate }}%</div>
        </div>
        <div class="cell">
          <div class="cl">{{ t('avgReact') }}</div><div class="cv">{{ result.avgReact }}<span class="u">ms</span></div>
        </div>
        <div class="cell">
          <div class="cl">{{ t('difficultyLv') }}</div><div class="cv">Lv.{{ result.maxLevel }}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn" @click="$emit('go', 'home')">🏠 {{ t('backHome') }}</button>
        <button class="btn primary" @click="$emit('go', 'duration')">🔁 {{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import { t as trans } from '../i18n.js'
import { store } from '../store.js'
export default {
  name: 'Result',
  props: { result: { type: Object, required: true } },
  computed: {
    successRate() { return this.result.total ? Math.round(this.result.correct * 100 / this.result.total) : 0 }
  },
  methods: {
    t(k) { return trans(store.lang, k) },
    cStyle(i) {
      const colors = ['#ffd166','#ef476f','#6ee7ff','#2ecc71','#9b59b6','#ff8fbd']
      return {
        left: (Math.random() * 100) + '%',
        background: colors[i % colors.length],
        animationDelay: (Math.random() * 2) + 's',
        animationDuration: (2 + Math.random() * 2) + 's'
      }
    }
  }
}
</script>
<style scoped>
.page {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 30%, #4a2a7a 0%, transparent 55%), linear-gradient(180deg, #1a1a3e, #0f0f2a);
  overflow: auto;
  display: flex; align-items: center; justify-content: center;
  padding: 2vh 3vw;
  padding-bottom: calc(2vh + env(safe-area-inset-bottom, 0px));
  padding-top: calc(2vh + env(safe-area-inset-top, 0px));
}
.lang-btn { position: absolute; top: 2vh; right: 3vw; z-index: 20; padding: 1vmin 2vmin; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); color: #fff; border-radius: 999px; cursor: pointer; font-size: 1.9vmin; font-weight: 600; }
.lang-btn:hover { background: rgba(255,255,255,0.22); }
.orbs .o { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .4; pointer-events: none; }
.o1 { width: 36vmin; height: 36vmin; background: #ffd166; top: -8vmin; left: -8vmin; }
.o2 { width: 32vmin; height: 32vmin; background: #ef476f; bottom: -6vmin; right: -6vmin; }
.o3 { width: 22vmin; height: 22vmin; background: #6ee7ff; top: 40%; right: 20%; }
.confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.confetti span { position: absolute; top: -20px; width: 10px; height: 14px; animation: fall linear infinite; border-radius: 2px; }
@keyframes fall { to { transform: translateY(105vh) rotate(720deg); opacity: 0; } }

.card {
  position: relative;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 2.4vmin;
  padding: 2.4vmin 3vmin;
  color: #fff; text-align: center;
  box-shadow: 0 3vmin 6vmin rgba(0,0,0,0.5);
  width: min(60vmin, 92vw);
  max-height: calc(100vh - 4vh - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px));
  overflow: auto;
  display: flex; flex-direction: column;
}
.trophy { font-size: 6vmin; line-height: 1; margin-bottom: 0.6vmin; filter: drop-shadow(0 1vmin 2vmin rgba(255,209,102,0.6)); animation: sway 2s ease infinite; }
@keyframes sway { 50% { transform: rotate(8deg); } }
h1 { font-size: 2.8vmin; margin-bottom: 1.6vmin; background: linear-gradient(135deg, #ffd166, #ef476f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.big-score { padding: 1.6vmin; background: linear-gradient(135deg, rgba(239,71,111,0.3), rgba(255,209,102,0.2)); border-radius: 1.8vmin; margin-bottom: 1.8vmin; border: 1px solid rgba(255,209,102,0.4); }
.big-score .label { display: block; opacity: 0.8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 0.4vmin; font-size: 1.6vmin; }
.big-score .value { font-size: 6vmin; font-weight: 900; line-height: 1; background: linear-gradient(135deg, #fff, #ffd166); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2vmin; margin-bottom: 2vmin; }
.cell { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 1.4vmin; padding: 1.2vmin 0.6vmin; }
.cl { opacity: 0.7; font-size: 1.5vmin; margin-bottom: 0.4vmin; }
.cv { font-size: 2.6vmin; font-weight: 800; line-height: 1.1; }
.cv .u { font-size: 0.5em; opacity: 0.7; margin-left: 2px; }
.cv.ok { color: #6efaa0; }
.cv.err { color: #ff8fbd; }
.actions { display: flex; gap: 1.6vmin; justify-content: center; margin-top: auto; }
.actions .btn { flex: 1; padding: 1.8vmin 1.2vmin; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.22); color: #fff; border-radius: 1.4vmin; cursor: pointer; font-size: 2.2vmin; font-weight: 700; }
.btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.2); }
.btn.primary { background: linear-gradient(135deg, #ef476f, #ffd166); border-color: transparent; box-shadow: 0 1vmin 2.4vmin rgba(239,71,111,0.4); }
</style>
