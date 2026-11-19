<template>
  <div class="result">
    <button class="lang-btn" @click="toggleLang">{{ t('langSwitch') }}</button>
    <div class="card">
      <h1 class="title">{{ t('resultTitle') }}</h1>

      <div class="score-display">
        <div class="score-num">{{ record.score }}</div>
        <div class="score-label">{{ t('resultScore') }}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-cell">
          <div class="v">{{ record.total }}</div>
          <div class="l">{{ t('resultTotal') }}</div>
        </div>
        <div class="stat-cell">
          <div class="v" style="color:#10b981;">{{ record.correct }}</div>
          <div class="l">{{ t('resultCorrect') }}</div>
        </div>
        <div class="stat-cell">
          <div class="v" style="color:#ef4444;">{{ record.wrong }}</div>
          <div class="l">{{ t('resultWrong') }}</div>
        </div>
        <div class="stat-cell">
          <div class="v">{{ record.accuracy }}%</div>
          <div class="l">{{ t('resultAccuracy') }}</div>
        </div>
        <div class="stat-cell">
          <div class="v">{{ record.avgRt }}{{ t('seconds') }}</div>
          <div class="l">{{ t('resultAvg') }}</div>
        </div>
        <div class="stat-cell">
          <div class="v">{{ record.maxLevel }}</div>
          <div class="l">{{ t('gameLevel') }}</div>
        </div>
      </div>

      <div class="actions">
        <button class="rbtn" @click="$emit('home')">{{ t('resultBack') }}</button>
        <button class="rbtn primary" @click="$emit('again')">{{ t('resultAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t, i18n, setLang } from '../i18n.js'
export default {
  name: 'ResultScreen',
  props: { record: { type: Object, required: true } },
  methods: {
    t,
    toggleLang() { setLang(i18n.lang === 'zh' ? 'en' : 'zh') }
  }
}
</script>

<style scoped>
.result {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
  position: relative;
}
.lang-btn {
  position: absolute;
  top: 2.5vmin;
  right: 2.5vmin;
  width: 6vmin;
  height: 6vmin;
  border-radius: 50%;
  border: 0.3vmin solid #6366f1;
  background: white;
  color: #6366f1;
  font-size: 2.2vmin;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
}
.card {
  background: white;
  border-radius: 4vmin;
  padding: 5vmin 6vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  width: min(90vmin, 90vw);
}
.title {
  font-size: 5vmin;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.score-display {
  text-align: center;
}
.score-num {
  font-size: 12vmin;
  font-weight: 700;
  color: #4f46e5;
  line-height: 1;
}
.score-label {
  font-size: 2.4vmin;
  color: #64748b;
  margin-top: 1vmin;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2vmin;
  width: 100%;
}
.stat-cell {
  padding: 2vmin;
  background: #f8fafc;
  border-radius: 2vmin;
  text-align: center;
}
.stat-cell .v {
  font-size: 3.5vmin;
  font-weight: 700;
  color: #1e293b;
}
.stat-cell .l {
  font-size: 1.8vmin;
  color: #64748b;
  margin-top: 0.5vmin;
}
.actions {
  display: flex;
  gap: 2vmin;
}
.rbtn {
  padding: 1.6vmin 5vmin;
  border-radius: 3vmin;
  border: 0.3vmin solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 2.4vmin;
  cursor: pointer;
}
.rbtn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border-color: transparent;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .result {
    padding: calc(3vmin + env(safe-area-inset-top)) 4vw calc(3vmin + env(safe-area-inset-bottom));
    align-items: flex-start;
  }
  .card {
    width: 92vw;
    padding: 6vmin 5vmin;
    border-radius: 5vmin;
    gap: 4vmin;
    margin-top: 4vh;
  }
  .title { font-size: max(7vmin, 24px); }
  .score-num { font-size: max(18vmin, 60px); }
  .score-label { font-size: max(3.6vmin, 15px); }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3vmin;
  }
  .stat-cell {
    padding: 3.5vmin;
    border-radius: 3vmin;
  }
  .stat-cell .v { font-size: max(5.5vmin, 22px); }
  .stat-cell .l { font-size: max(3vmin, 13px); }
  .actions {
    flex-direction: column;
    width: 100%;
    gap: 2.5vmin;
  }
  .rbtn {
    width: 100%;
    padding: 3vmin 5vmin;
    font-size: max(4vmin, 17px);
    border-radius: 4vmin;
  }
  .lang-btn {
    top: calc(2vmin + env(safe-area-inset-top));
    right: 4vw;
    width: max(9vmin, 42px);
    height: max(9vmin, 42px);
    font-size: max(3.2vmin, 14px);
  }
}
</style>
