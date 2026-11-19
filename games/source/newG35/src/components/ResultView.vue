<template>
  <div class="result-view">
    <div class="result paper">
      <div class="ribbon">
        <div class="ribbon-inner">{{ t('resultTitle') }}</div>
      </div>

      <div class="score-hero">
        <div class="score-label">{{ t('resultScore') }}</div>
        <div class="score-value">
          <span class="score-num">{{ animatedScore }}</span>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-label">{{ t('resultTotal') }}</div>
          <div class="stat-value">{{ record ? record.total : 0 }}</div>
        </div>
        <div class="stat ok">
          <div class="stat-label">{{ t('resultCorrect') }}</div>
          <div class="stat-value">{{ record ? record.correct : 0 }}</div>
        </div>
        <div class="stat bad">
          <div class="stat-label">{{ t('resultWrong') }}</div>
          <div class="stat-value">{{ record ? record.wrong : 0 }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t('resultAccuracy') }}</div>
          <div class="stat-value">{{ pct(record ? record.rate : 0) }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t('resultAvg') }}</div>
          <div class="stat-value">{{ record ? (record.avgRT / 1000).toFixed(2) : '0.00' }}s</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t('level') }}</div>
          <div class="stat-value">{{ record ? record.finalLevel : 1 }}</div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn" @click="$emit('nav', { to: 'home' })">{{ t('backHome') }}</button>
        <button class="btn btn-primary" @click="$emit('nav', { to: 'duration' })">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n.js'
export default {
  name: 'ResultView',
  mixins: [i18nMixin],
  props: { record: { type: Object, default: null } },
  data() { return { animatedScore: 0 } },
  mounted() {
    const target = (this.record && this.record.score) || 0
    const start = performance.now()
    const dur = 900
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      this.animatedScore = Math.round(target * e)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  },
  methods: {
    pct(v) { return Math.round(v * 100) + '%' },
  },
}
</script>

<style scoped>
.result-view {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.result {
  width: min(85vmin, 100%);
  padding: 6vmin 5vmin 5vmin;
  display: flex; flex-direction: column; align-items: center;
  gap: 3vmin;
  position: relative;
}

.ribbon {
  position: absolute;
  top: -2.5vmin;
  padding: 1vmin 3.5vmin;
  background: linear-gradient(135deg, var(--c-orange), var(--c-orange-dim));
  border-radius: 4vmin;
  box-shadow: var(--shadow-md);
  border: 0.25vmin solid #a34418;
}
.ribbon-inner {
  font-size: 2.4vmin;
  font-weight: 700;
  letter-spacing: 0.3vmin;
  color: #fff;
  text-transform: uppercase;
}

.score-hero { text-align: center; margin-top: 1.5vmin; }
.score-label {
  font-size: 2.2vmin;
  color: var(--c-brown-dim);
  text-transform: uppercase;
  letter-spacing: 0.4vmin;
  font-weight: 600;
}
.score-num {
  font-size: 15vmin;
  font-weight: 800;
  line-height: 1;
  color: var(--c-title);
  font-variant-numeric: tabular-nums;
  display: inline-block;
  margin-top: 0.5vmin;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2vmin;
  width: 100%;
}
.stat {
  padding: 2vmin 1.5vmin;
  border-radius: 1.5vmin;
  background: var(--c-paper-soft);
  border: 0.25vmin solid var(--c-line);
  text-align: center;
}
.stat.ok  { border-color: var(--c-ok); background: var(--c-ok-bg); }
.stat.bad { border-color: var(--c-err); background: var(--c-err-bg); }
.stat-label {
  font-size: 1.8vmin;
  color: var(--c-brown-dim);
  text-transform: uppercase;
  letter-spacing: 0.15vmin;
  font-weight: 600;
}
.stat.ok  .stat-label { color: var(--c-ok-text); }
.stat.bad .stat-label { color: var(--c-err-text); }
.stat-value {
  margin-top: 0.5vmin;
  font-size: 3.8vmin;
  font-weight: 800;
  color: var(--c-title);
  font-variant-numeric: tabular-nums;
}
.stat.ok  .stat-value { color: var(--c-ok-text); }
.stat.bad .stat-value { color: var(--c-err-text); }

.result-actions {
  display: flex; gap: 2vmin;
  margin-top: 1vmin;
  flex-wrap: wrap; justify-content: center;
}
</style>
