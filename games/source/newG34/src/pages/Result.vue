<template>
  <div class="result-page">
    <div class="card">
      <div class="crown">★</div>
      <h1 class="title">{{ t('resultTitle') }}</h1>
      <div class="score-num">{{ result.score }}</div>
      <div class="score-label">{{ t('finalScore') }}</div>

      <div class="stats-row">
        <div class="stat">
          <div class="lab">{{ t('difficulty') }}</div>
          <div class="val">L{{ result.finalLevel }}</div>
        </div>
        <div class="stat">
          <div class="lab">{{ t('colTotal') }}</div>
          <div class="val">{{ result.total }}</div>
        </div>
        <div class="stat">
          <div class="lab">{{ t('accuracy') }}</div>
          <div class="val">{{ (result.rate * 100).toFixed(0) }}%</div>
        </div>
        <div class="stat">
          <div class="lab">{{ t('avgTime') }}</div>
          <div class="val">{{ (result.avgRt / 1000).toFixed(2) }}s</div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn" @click="$emit('go', 'home')">{{ t('backHome') }}</button>
        <button class="btn primary" @click="$emit('go', 'duration')">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js';
export default {
  name: 'ResultPage',
  props: ['lang', 'result'],
  methods: { t(k, p) { return t(this.lang, k, p); } },
};
</script>

<style scoped>
.result-page {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  padding: 4vmin;
}
.card {
  width: 70vmin;
  background: #fff;
  border-radius: 3vmin;
  border: 0.3vmin solid #b08b4f;
  padding: 5vmin;
  text-align: center;
  box-shadow: 0 1.5vmin 4vmin rgba(122,90,44,.2);
  position: relative;
}
.crown {
  width: 10vmin; height: 10vmin;
  margin: -10vmin auto 2vmin;
  background: linear-gradient(135deg, #f7c04d, #d97742);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 5vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(217,119,66,.4);
}
.title { font-size: 4.5vmin; color: #7a3a1e; margin-bottom: 3vmin; letter-spacing: 0.3vmin; }
.score-num {
  font-size: 12vmin;
  font-weight: 800;
  color: #d97742;
  line-height: 1;
  text-shadow: 0 0.5vmin 0 rgba(217,119,66,.15);
}
.score-label { font-size: 2.4vmin; color: #8a6a3a; margin-bottom: 3vmin; }
.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 2vmin 0;
  border-top: 0.15vmin dashed #d0b48a;
  border-bottom: 0.15vmin dashed #d0b48a;
  margin-bottom: 3vmin;
}
.stat { text-align: center; }
.stat .lab { font-size: 1.9vmin; color: #8a6a3a; margin-bottom: 0.5vmin; }
.stat .val { font-size: 3.4vmin; font-weight: 700; color: #7a3a1e; }
.btn-row { display: flex; gap: 2vmin; justify-content: center; }
.btn {
  padding: 1.8vmin 4vmin;
  font-size: 2.4vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 600;
}
.btn:hover { background: #fff8ec; }
.btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }
.btn.primary:hover { background: linear-gradient(135deg, #e28855, #bd5a24); }
</style>
