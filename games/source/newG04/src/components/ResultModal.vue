<template>
  <div class="overlay">
    <div class="modal">
      <h2>{{ T.gameOver }}</h2>
      <div class="stats">
        <div class="stat-row">
          <span class="stat-label">{{ T.totalScore }}</span>
          <span class="stat-val gold">{{ stats.score }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">{{ T.accuracy }}</span>
          <span class="stat-val">{{ stats.successRate }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">{{ T.avgReaction }}</span>
          <span class="stat-val">{{ stats.avgReaction }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">{{ lang==='zh'?'总题数':'Total' }}</span>
          <span class="stat-val">{{ stats.total }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">{{ lang==='zh'?'正确':'Correct' }}</span>
          <span class="stat-val green">{{ stats.success }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">{{ lang==='zh'?'错误':'Wrong' }}</span>
          <span class="stat-val red">{{ stats.fail }}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn-again" @click="$emit('again')">{{ T.playAgain }}</button>
        <button class="btn-home" @click="$emit('home')">{{ T.backHome }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  props: ['lang', 'stats'],
  computed: { T() { return t[this.lang] } },
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.75);
  display: flex; align-items: center; justify-content: center; z-index: 300;
}
.modal {
  background: #16213e; border-radius: 2vmin; padding: 4vmin 5vmin;
  display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  min-width: 50vmin;
}
h2 { font-size: 4vmin; font-weight: 700; color: #7eb8f7; }
.stats { width: 100%; display: flex; flex-direction: column; gap: 1.2vmin; }
.stat-row { display: flex; justify-content: space-between; padding: 0.8vmin 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.stat-label { font-size: 2vmin; color: #7a9abc; }
.stat-val { font-size: 2.4vmin; font-weight: 600; color: #e0eaf8; }
.stat-val.gold { color: #f1c40f; font-size: 3vmin; }
.stat-val.green { color: #2ecc71; }
.stat-val.red { color: #e74c3c; }
.actions { display: flex; gap: 2vmin; width: 100%; }
.btn-again {
  flex: 1; background: #3a7bd5; color: #fff;
  padding: 1.5vmin 0; border-radius: 1.2vmin; font-size: 2.2vmin; font-weight: 600;
}
.btn-again:hover { background: #4e8fe0; }
.btn-home {
  flex: 1; background: rgba(255,255,255,.1); color: #c5d8f5;
  padding: 1.5vmin 0; border-radius: 1.2vmin; font-size: 2.2vmin;
}
.btn-home:hover { background: rgba(255,255,255,.18); }

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .modal {
    width: 92vw; max-width: 92vw;
    padding: 6vw 5vw;
    border-radius: 4vw;
    gap: 5vw;
    min-width: 0;
  }
  h2 { font-size: max(7vw, 26px); }
  .stats { gap: 2vw; }
  .stat-row { padding: 2vw 0; }
  .stat-label { font-size: max(4vw, 15px); }
  .stat-val { font-size: max(4.6vw, 17px); }
  .stat-val.gold { font-size: max(6vw, 22px); }
  .actions { gap: 3vw; }
  .btn-again, .btn-home {
    padding: max(3.6vw, 14px) 0;
    border-radius: 3vw;
    font-size: max(4.4vw, 16px);
  }
}
</style>
