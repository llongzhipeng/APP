<template>
  <div class="result-page">
    <div class="result-content">
      <div class="result-title">{{ t('resultTitle') }}</div>

      <div class="score-card">
        <div class="score-label">{{ t('resultScore') }}</div>
        <div class="score-num">{{ record.score }}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('resultCorrect') }}</div>
          <div class="stat-val ok">{{ record.correct }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('resultWrong') }}</div>
          <div class="stat-val ng">{{ record.wrong }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('resultRate') }}</div>
          <div class="stat-val">{{ (record.accuracy * 100).toFixed(1) }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('resultAvg') }}</div>
          <div class="stat-val">{{ record.avgRT }}<span class="unit">ms</span></div>
        </div>
      </div>

      <div class="acts">
        <button class="a-btn home" @click="$emit('home')">{{ t('resultHome') }}</button>
        <button class="a-btn again" @click="$emit('again')">{{ t('resultAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'Result',
  props: { record: Object },
  methods: { t },
}
</script>

<style scoped>
.result-page {
  position: absolute; inset: 0; overflow: hidden;
  background: #f6efe0;
  color: #3a2f1f;
  display: flex; align-items: center; justify-content: center;
}
.result-content { text-align: center; max-width: 92vw; padding: 2em; }
.result-title {
  font-size: 2.6em; font-weight: 800; letter-spacing: 0.25em;
  color: #4a3a1e;
  margin-bottom: 1em;
}

.score-card {
  display: inline-block; padding: 1.2em 3em;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  border-radius: 1em;
  margin-bottom: 2em;
}
.score-label { font-size: 0.95em; letter-spacing: 0.25em; color: #8a7550; font-weight: 600; text-transform: uppercase; }
.score-num {
  font-size: 5.5em; font-weight: 800; line-height: 1;
  color: #b98738;
  font-variant-numeric: tabular-nums;
}

.stats-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1em; max-width: 46em; margin: 0 auto 2em;
}
.stat-card {
  padding: 1em 1.2em; text-align: center;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  border-radius: 0.7em;
}
.stat-label { font-size: 0.8em; color: #8a7550; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; }
.stat-val { font-size: 1.7em; font-weight: 800; color: #4a3a1e; margin-top: 0.2em; }
.stat-val.ok { color: #6b8e5a; }
.stat-val.ng { color: #c0392b; }
.unit { font-size: 0.5em; color: #8a7550; font-weight: 600; margin-left: 0.3em; }

.acts { display: flex; gap: 1.2em; justify-content: center; }
.a-btn {
  padding: 0.9em 2.4em; border-radius: 999px;
  font-size: 1.1em; font-weight: 600; letter-spacing: 0.15em;
  cursor: pointer; transition: all .2s; border: 1px solid transparent;
}
.a-btn.home { background: #fff8e8; border-color: #d9c9a3; color: #6b5a3a; }
.a-btn.home:hover { background: #f0e2be; }
.a-btn.again { background: #c99a4b; color: #fff; }
.a-btn.again:hover { background: #b98738; }
</style>
