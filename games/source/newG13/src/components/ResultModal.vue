<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t('resultTitle') }}</h2>
      </div>
      <div class="modal-body">
        <div class="score-block">
          <div class="score-label">{{ t('finalScore') }}</div>
          <div class="score-value">{{ result.score }}</div>
        </div>
        <div class="stat-grid">
          <div class="stat-cell">
            <div class="s-lbl">{{ t('totalQ') }}</div>
            <div class="s-val">{{ result.totalCount }}</div>
          </div>
          <div class="stat-cell">
            <div class="s-lbl">{{ t('correctQ') }}</div>
            <div class="s-val ok">{{ result.correctCount }}</div>
          </div>
          <div class="stat-cell">
            <div class="s-lbl">{{ t('wrongQ') }}</div>
            <div class="s-val bad">{{ result.wrongCount }}</div>
          </div>
          <div class="stat-cell">
            <div class="s-lbl">{{ t('rate') }}</div>
            <div class="s-val">{{ successRate }}%</div>
          </div>
          <div class="stat-cell">
            <div class="s-lbl">{{ t('avgTime') }}</div>
            <div class="s-val">{{ result.avgReactionTime }}{{ t('seconds') }}</div>
          </div>
          <div class="stat-cell">
            <div class="s-lbl">{{ t('difficulty') }}</div>
            <div class="s-val">Lv{{ result.maxDifficulty }}</div>
          </div>
        </div>
        <div class="btn-row">
          <button class="rbtn" @click="$emit('again')">{{ t('playAgain') }}</button>
          <button class="rbtn primary" @click="$emit('home')">{{ t('backHome') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultModal',
  props: {
    t: { type: Function, required: true },
    result: { type: Object, required: true },
  },
  computed: {
    successRate() {
      if (!this.result.totalCount) return 0;
      return Math.round((this.result.correctCount / this.result.totalCount) * 100);
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #fff 60%, #fff6e5);
  border: 0.3vmin solid #ff8c1a;
  border-radius: 2vmin;
  width: min(75vmin, 96vw); max-height: 92vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.4);
}
.modal-header {
  padding: 2vmin 3vmin;
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  text-align: center;
  flex-shrink: 0;
}
.modal-header h2 { color: #fff; font-size: 3vmin; font-weight: 800; }
.modal-body { overflow: auto; padding: 3vmin; display: flex; flex-direction: column; gap: 2.5vmin; }
.score-block { text-align: center; }
.score-label { font-size: 2vmin; color: #888; font-weight: 700; margin-bottom: 0.5vmin; }
.score-value {
  font-size: 10vmin; color: #ff8c1a; font-weight: 900; line-height: 1;
  text-shadow: 0.4vmin 0.4vmin 0 rgba(255,140,26,0.15);
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5vmin;
}
.stat-cell {
  background: #fff6e5;
  border-radius: 1.2vmin;
  padding: 1.6vmin 1vmin;
  text-align: center;
}
.s-lbl { color: #888; font-size: 1.6vmin; font-weight: 700; margin-bottom: 0.6vmin; }
.s-val { color: #333; font-size: 3vmin; font-weight: 900; }
.s-val.ok { color: #4caf50; }
.s-val.bad { color: #f44336; }
.btn-row { display: flex; gap: 2vmin; justify-content: center; flex-wrap: wrap; }
.rbtn {
  padding: 1.4vmin 3.5vmin;
  border-radius: 999px;
  border: 0.3vmin solid #ff8c1a;
  background: #fff;
  color: #ff8c1a;
  font-weight: 700;
  cursor: pointer;
  font-size: 2vmin;
  min-width: 14vmin;
  transition: transform 0.15s;
}
.rbtn:hover { transform: translateY(-0.3vmin); }
.rbtn.primary {
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  color: #fff;
}
@media (max-width: 500px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (orientation: portrait) {
  .modal-overlay {
    padding-top: calc(2vmin + env(safe-area-inset-top));
    padding-bottom: calc(2vmin + env(safe-area-inset-bottom));
  }
  .modal-box {
    width: 92vw;
    max-height: 92vh;
    border-radius: 3vmin;
  }
  .modal-header { padding: 2.5vmin 3vmin; }
  .modal-header h2 { font-size: max(5vmin, 20px); }
  .modal-body { padding: 4vmin; gap: 3.5vmin; }
  .score-label { font-size: max(3.4vmin, 14px); }
  .score-value {
    font-size: max(16vmin, 60px);
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5vmin;
  }
  .stat-cell {
    padding: 2.4vmin 1.4vmin;
    border-radius: 2vmin;
  }
  .s-lbl { font-size: max(3vmin, 12px); margin-bottom: 1vmin; }
  .s-val { font-size: max(5vmin, 20px); }
  .btn-row {
    flex-direction: column-reverse;
    gap: 2vmin;
    align-items: stretch;
  }
  .rbtn {
    width: 100%;
    min-width: 0;
    padding: 2.4vmin 3vmin;
    font-size: max(4vmin, 16px);
    border-radius: 999px;
  }
}
</style>
