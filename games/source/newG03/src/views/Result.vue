<template>
  <div class="result-screen">
    <div class="result-card">
      <h2>{{ t('gameOver') }}</h2>
      <div class="stat-grid">
        <div class="stat-item"><span>{{ t('totalScore') }}</span><b class="big-score">{{ record.score }}</b></div>
        <div class="stat-item"><span>{{ t('diffLevel') }}</span><b>{{ record.maxLevel }}</b></div>
        <div class="stat-item"><span>{{ t('duration') }}</span><b>{{ record.duration }}s</b></div>
        <div class="stat-item"><span>{{ t('totalQ') }}</span><b>{{ record.total }}</b></div>
        <div class="stat-item"><span>{{ t('correctQ') }}</span><b class="green">{{ record.correct }}</b></div>
        <div class="stat-item"><span>{{ t('wrongQ') }}</span><b class="red">{{ record.wrong }}</b></div>
        <div class="stat-item"><span>{{ t('accuracy') }}</span><b>{{ record.accuracy }}%</b></div>
        <div class="stat-item"><span>{{ t('avgTime') }}</span><b>{{ record.avgMs }}ms</b></div>
      </div>
      <button class="btn-home" @click="$emit('home')">{{ t('backHome') }}</button>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
import { t } from '../i18n.js'
export default {
  props: ['lang', 'record'],
  methods: { t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.result-screen {
  width: 100%; height: 100%;
  background: url(~@/views/game/newG03/public/images/bacground.png) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
}
.result-card {
  background: rgba(255,255,255,0.94); border-radius: 3vmin;
  padding: 5vmin 5vmin; display: flex; flex-direction: column;
  align-items: center; gap: 3.5vmin;
  box-shadow: 0 1vmin 5vmin rgba(0,0,0,0.3);
  min-width: 60vmin;
}
.result-card h2 { font-size: 4.5vmin; color: #1a5ca8; font-weight: 900; }
.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2vmin 3vmin; width: 100%;
}
.stat-item {
  display: flex; flex-direction: column; align-items: center; gap: 0.6vmin;
  background: #f0f7ff; border-radius: 1.5vmin; padding: 1.5vmin 1vmin;
}
.stat-item span { font-size: 2vmin; color: #666; font-weight: 700; }
.stat-item b { font-size: 3.2vmin; color: #1a3a7a; font-weight: 900; }
.big-score { font-size: 5.5vmin !important; color: #f5a623 !important; }
.green { color: #22c55e !important; }
.red { color: #e53935 !important; }
.btn-home {
  padding: 1.8vmin 6vmin; background: #4a9eff; color: #fff;
  border: none; border-radius: 3.5vmin; cursor: pointer;
  font-size: 2.8vmin; font-weight: 700; transition: background 0.2s;
}
.btn-home:hover { background: #2270c4; }

/* ---------- Portrait (mobile / WeChat web-view) ---------- */
@media (orientation: portrait) {
  .result-card {
    width: 90vw;
    min-width: 0;
    padding: 7vmin 5vmin;
    padding-top: calc(7vmin + env(safe-area-inset-top));
    padding-bottom: calc(7vmin + env(safe-area-inset-bottom));
    border-radius: 5vmin;
    gap: 5vmin;
  }
  .result-card h2 { font-size: max(7vmin, 24px); }
  .stat-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3vmin 3vmin;
  }
  .stat-item {
    padding: 3vmin 1.5vmin;
    border-radius: 2.5vmin;
    gap: 1vmin;
  }
  .stat-item span { font-size: max(3.2vmin, 12px); }
  .stat-item b { font-size: max(5vmin, 20px); }
  .big-score { font-size: max(8vmin, 32px) !important; }
  .btn-home {
    padding: 3vmin 0;
    width: 80%;
    font-size: max(4.4vmin, 18px);
    border-radius: 5vmin;
  }
}
</style>
