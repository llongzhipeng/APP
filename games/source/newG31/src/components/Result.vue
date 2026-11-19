<template>
  <div class="result">
    <div class="card">
      <div class="crown">🏆</div>
      <h2>{{ t('result') }}</h2>
      <div class="big-score">
        <div class="label">{{ t('totalScore') }}</div>
        <div class="value">{{ result.score }}</div>
      </div>
      <div class="grid">
        <div class="cell"><div class="k">{{ t('difficultyLevel') }}</div><div class="v">Lv.{{ result.maxLevel }}</div></div>
        <div class="cell"><div class="k">{{ t('duration') }}</div><div class="v">{{ Math.round(result.duration/60) }} min</div></div>
        <div class="cell"><div class="k">{{ t('totalRounds') }}</div><div class="v">{{ result.total }}</div></div>
        <div class="cell"><div class="k">{{ t('successCount') }}</div><div class="v ok">{{ result.success }}</div></div>
        <div class="cell"><div class="k">{{ t('failCount') }}</div><div class="v bad">{{ result.fail }}</div></div>
        <div class="cell"><div class="k">{{ t('successRate') }}</div><div class="v">{{ result.rate }}%</div></div>
        <div class="cell wide"><div class="k">{{ t('avgTime') }}</div><div class="v">{{ result.avgRt.toFixed(2) }} s</div></div>
      </div>
      <div class="actions">
        <button class="btn ghost" @click="$emit('home')">🏠 {{ t('backHome') }}</button>
        <button class="btn primary" @click="$emit('replay')">🔄 {{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'Result',
  props: { lang: String, result: Object },
  methods: { t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.result {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 30px;
}
.card {
  background: linear-gradient(160deg, #fff, #f2f6ff);
  border-radius: 28px;
  padding: 40px 50px;
  width: 640px; max-width: 94vw;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  text-align: center;
  animation: pop 0.4s cubic-bezier(.2,.9,.35,1.3);
}
@keyframes pop { from { transform: scale(0.85); opacity: 0; } }
.crown { font-size: 60px; animation: swing 2s ease-in-out infinite; }
@keyframes swing { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
h2 { color: #2b3f6a; font-size: 30px; margin: 8px 0 20px; }
.big-score {
  background: linear-gradient(135deg, #ffd166, #ff6b6b);
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 24px;
  color: #fff;
  box-shadow: 0 14px 30px rgba(255,107,107,0.4);
}
.big-score .label { font-size: 14px; letter-spacing: 2px; opacity: 0.9; }
.big-score .value { font-size: 60px; font-weight: 900; }
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}
.cell {
  background: #f8faff;
  border-radius: 14px;
  padding: 14px;
}
.cell.wide { grid-column: span 3; }
.k { font-size: 12px; color: #868e96; font-weight: 600; }
.v { font-size: 24px; color: #2b3f6a; font-weight: 800; margin-top: 4px; }
.v.ok { color: #37b24d; }
.v.bad { color: #e03131; }
.actions { display: flex; gap: 14px; justify-content: center; }
.btn {
  padding: 14px 34px; border-radius: 14px; border: none;
  cursor: pointer; font-size: 16px; font-weight: 700;
}
.btn.ghost { background: #e9ecef; color: #495057; }
.btn.primary {
  background: linear-gradient(135deg, #4dabf7, #339af0);
  color: #fff; box-shadow: 0 8px 20px rgba(77,171,247,0.4);
}
.btn:hover { transform: translateY(-2px); }
</style>
