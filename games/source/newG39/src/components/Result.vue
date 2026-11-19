<template>
  <div class="result">
    <div class="card panel">
      <div class="trophy">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#fff2b0"/><stop offset="60%" stop-color="#f5b800"/><stop offset="100%" stop-color="#a76c00"/>
            </linearGradient>
          </defs>
          <path d="M30 15 h40 v15 a20 20 0 0 1-40 0z" fill="url(#gold)" stroke="#7a4d00" stroke-width="1.5"/>
          <path d="M20 22 q-10 4 -6 15 t14 6" fill="none" stroke="url(#gold)" stroke-width="4"/>
          <path d="M80 22 q10 4 6 15 t-14 6" fill="none" stroke="url(#gold)" stroke-width="4"/>
          <rect x="42" y="45" width="16" height="20" fill="url(#gold)"/>
          <rect x="30" y="65" width="40" height="10" rx="2" fill="url(#gold)"/>
          <rect x="26" y="75" width="48" height="8" rx="2" fill="#a76c00"/>
        </svg>
      </div>
      <h1>{{ t('resultTitle') }}</h1>
      <div class="score-big">{{ result.score }}</div>
      <div class="grid">
        <div class="cell"><span class="k">{{ t('resultProject') }}</span><span class="v">{{ result.project }}</span></div>
        <div class="cell"><span class="k">{{ t('resultDifficulty') }}</span><span class="v">Lv.{{ result.level }}</span></div>
        <div class="cell"><span class="k">{{ t('resultDuration') }}</span><span class="v">{{ Math.round(result.duration/60) }} {{ t('seconds')==='s'?'min':'分钟' }}</span></div>
        <div class="cell"><span class="k">{{ t('resultTotal') }}</span><span class="v">{{ result.total }}</span></div>
        <div class="cell"><span class="k">{{ t('resultSuccess') }}</span><span class="v ok">{{ result.success }}</span></div>
        <div class="cell"><span class="k">{{ t('resultFail') }}</span><span class="v bad">{{ result.fail }}</span></div>
        <div class="cell"><span class="k">{{ t('resultRate') }}</span><span class="v">{{ (result.rate*100).toFixed(1) }}%</span></div>
        <div class="cell"><span class="k">{{ t('resultAvg') }}</span><span class="v">{{ result.avgMs }} {{ t('ms') }}</span></div>
      </div>
      <div class="actions">
        <button class="btn ghost" @click="$emit('home')">{{ t('backHome') }}</button>
        <button class="btn" @click="$emit('again')">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { store, t } from '../store'
export default {
  props: { result: { type: Object, required: true } },
  data () { return { store } },
  computed: { t () { const _ = this.store.lang; return t } }
}
</script>

<style scoped>
.result { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 4vmin; }
.panel { width: min(82vmin, 96vw); padding: 5vmin 6vmin 4vmin; text-align: center; }
.trophy { width: 15vmin; height: 15vmin; margin: -11vmin auto 1vmin; filter: drop-shadow(0 14px 22px rgba(245,184,0,.45)); }
h1 { font-size: 4vmin; letter-spacing: .08em; margin-bottom: 1vmin; }
.score-big {
  font-size: 13vmin; font-weight: 900; line-height: 1;
  background: linear-gradient(135deg,#fde68a,#f472b6);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin: 1.6vmin 0 3.6vmin;
}
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6vmin 2vmin; margin-bottom: 3.6vmin; }
.cell {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 2vmin 2.4vmin;
  background: rgba(255,255,255,.05);
  border-radius: 1.4vmin;
  border: 1px solid rgba(255,255,255,.08);
}
.k { color: #cbd5e1; font-size: 2vmin; letter-spacing: .05em; }
.v { font-weight: 800; font-size: 2.4vmin; color: #fff; }
.v.ok { color: #86efac; }
.v.bad { color: #fca5a5; }
.actions { display: flex; gap: 1.6vmin; }
.actions .btn { flex: 1; padding: 1.1em; font-size: 2.4vmin; }
</style>
