<template>
  <div class="result">
    <div class="panel">
      <h2 class="ttl">{{ t('resultTitle') }}</h2>

      <div class="score-block">
        <div class="score-label">{{ t('finalScore') }}</div>
        <div class="score-value">{{ summary.score }}</div>
      </div>

      <div class="grid">
        <div class="cell">
          <div class="cell-label">{{ t('colDuration') }}</div>
          <div class="cell-value">{{ summary.durationMin }} {{ t('minutes') }}</div>
        </div>
        <div class="cell">
          <div class="cell-label">{{ t('colDifficulty') }}</div>
          <div class="cell-value">{{ summary.difficultyDisplay }}</div>
        </div>
        <div class="cell">
          <div class="cell-label">{{ t('colTotal') }}</div>
          <div class="cell-value">{{ summary.total }}</div>
        </div>
        <div class="cell">
          <div class="cell-label">{{ t('colSuccess') }}</div>
          <div class="cell-value success">{{ summary.success }}</div>
        </div>
        <div class="cell">
          <div class="cell-label">{{ t('colFail') }}</div>
          <div class="cell-value fail">{{ summary.fail }}</div>
        </div>
        <div class="cell">
          <div class="cell-label">{{ t('successRate') }}</div>
          <div class="cell-value">{{ summary.rate }}%</div>
        </div>
        <div class="cell wide">
          <div class="cell-label">{{ t('avgTime') }}</div>
          <div class="cell-value">{{ summary.avgMs }} ms</div>
        </div>
      </div>

      <div class="btns">
        <button class="g-btn secondary" @click="$emit('again')">{{ t('playAgain') }}</button>
        <button class="g-btn" @click="$emit('home')">{{ t('backHome') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../i18n.js'
defineProps({ summary: { type: Object, required: true } })
const { t } = useI18n()
</script>

<style scoped>
.result {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
}
.panel {
  width: min(90vw, 100vmin);
  background: rgba(15, 20, 60, 0.85);
  border: 0.3vmin solid rgba(255, 224, 100, 0.5);
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  display: flex;
  flex-direction: column;
  gap: 3vmin;
  align-items: center;
  box-shadow: 0 1vmin 4vmin rgba(0, 0, 0, 0.5);
}
.ttl {
  font-size: 4.5vmin;
  color: #ffe066;
}
.score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vmin;
  margin: 1vmin 0;
}
.score-label {
  font-size: 2.4vmin;
  color: #ffe066;
}
.score-value {
  font-size: 10vmin;
  font-weight: bold;
  color: #ffe066;
  line-height: 1;
  text-shadow: 0 0 3vmin rgba(255, 224, 100, 0.7);
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5vmin;
  width: 100%;
}
.cell {
  padding: 1.6vmin 2vmin;
  background: rgba(255, 224, 100, 0.12);
  border: 0.2vmin solid rgba(255, 224, 100, 0.4);
  border-radius: 1vmin;
  display: flex;
  flex-direction: column;
  gap: 0.6vmin;
  align-items: center;
}
.cell.wide { grid-column: span 3; }
.cell-label { font-size: 1.8vmin; color: #ffe066; opacity: 0.9; }
.cell-value { font-size: 3vmin; color: #fff; font-weight: bold; }
.cell-value.success { color: #7cf07c; }
.cell-value.fail { color: #ff8080; }
.btns {
  display: flex;
  gap: 3vmin;
  margin-top: 1vmin;
}

/* 竖屏适配 */
@media (orientation: portrait) {
  .result {
    padding: 3vmin;
    padding-top: calc(4vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
  }
  .panel {
    width: 92vw;
    padding: 5vmin 4vmin;
    gap: 3.5vmin;
    border-radius: max(2.4vmin, 14px);
  }
  .ttl { font-size: max(6vmin, 24px); }
  .score-label { font-size: max(3.4vmin, 15px); }
  .score-value { font-size: max(14vmin, 56px); }
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2vmin;
  }
  .cell {
    padding: 2.4vmin 2vmin;
    border-radius: max(1.6vmin, 10px);
  }
  .cell.wide { grid-column: span 2; }
  .cell-label { font-size: max(2.8vmin, 12px); }
  .cell-value { font-size: max(4.2vmin, 18px); }
  .btns {
    flex-direction: column;
    gap: 2.5vmin;
    width: 100%;
  }
  .btns .g-btn {
    width: 100%;
    font-size: max(3.8vmin, 16px);
    padding: max(2.8vmin, 14px) max(4vmin, 18px);
    border-radius: max(2vmin, 12px);
  }
}
</style>
