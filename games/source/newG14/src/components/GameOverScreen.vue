<template>
  <div class="gameover-screen">
    <div class="gameover-card">
      <h2 class="gameover-title">{{ t.gameOver }}</h2>

      <div class="score-display">
        <div class="big-score">{{ result.finalScore }}</div>
        <div class="score-label">{{ t.finalScore }}</div>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-num correct">{{ result.totalCorrect }}</div>
          <div class="stat-name">{{ t.totalCorrect }}</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">{{ result.totalQuestions }}</div>
          <div class="stat-name">{{ t.totalQuestions }}</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num accent">{{ accuracyStr }}</div>
          <div class="stat-name">{{ t.accuracy }}</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num level">Lv.{{ result.maxDifficulty }}</div>
          <div class="stat-name">{{ t.historyMaxDiff }}</div>
        </div>
      </div>

      <div class="action-btns">
        <button class="btn-action btn-primary" @click="$emit('play-again')">{{ t.playAgain }}</button>
        <button class="btn-action btn-secondary" @click="$emit('home')">{{ t.backHome }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameOverScreen',
  props: {
    t: { type: Object, required: true },
    result: { type: Object, required: true }
  },
  emits: ['play-again', 'home'],
  computed: {
    accuracyStr() {
      if (this.result.totalQuestions === 0) return '0%'
      return Math.round((this.result.totalCorrect / this.result.totalQuestions) * 100) + '%'
    }
  }
}
</script>

<style scoped>
.gameover-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0d1b4b 100%);
}

.gameover-card {
  background: linear-gradient(135deg, #141830, #1e2040);
  border: 0.1rem solid rgba(0, 212, 255, 0.3);
  border-radius: 1.2rem;
  padding: 2.5rem 3rem;
  width: min(88vw, 28rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 0 4rem rgba(0, 212, 255, 0.15);
}

.gameover-title {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.05em;
}

.score-display { text-align: center; }

.big-score {
  font-size: 5rem;
  font-weight: 900;
  color: #00d4ff;
  line-height: 1;
  text-shadow: 0 0 2rem rgba(0, 212, 255, 0.5);
}

.score-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.1em;
  margin-top: 0.3rem;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.stat-num {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
}

.stat-num.correct { color: #4ade80; }
.stat-num.accent { color: #00d4ff; }
.stat-num.level { color: #a78bfa; }

.stat-name {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
}

.stat-divider {
  width: 0.05rem;
  height: 2rem;
  background: rgba(255,255,255,0.1);
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

.btn-action {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.6rem;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s, transform 0.15s;
  letter-spacing: 0.03em;
}
.btn-action:hover { opacity: 0.88; transform: translateY(-0.1rem); }
.btn-action:active { transform: translateY(0); }

.btn-primary {
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  color: #fff;
  box-shadow: 0 0.2rem 1rem rgba(0, 212, 255, 0.35);
}

.btn-secondary {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: 0.1rem solid rgba(255,255,255,0.2) !important;
}

@media (orientation: portrait) {
  .gameover-screen {
    padding: env(safe-area-inset-top) 4vw env(safe-area-inset-bottom);
  }
  .gameover-card {
    width: 90vw;
    max-width: 30rem;
    padding: 2rem 1.4rem;
    gap: 2rem;
    border-radius: 1.4rem;
  }
  .gameover-title { font-size: max(5.4vmin, 20px); }
  .big-score { font-size: max(16vmin, 60px); }
  .score-label { font-size: max(3.2vmin, 12px); }
  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 0.5rem;
  }
  .stat-divider { display: none; }
  .stat-num { font-size: max(4.4vmin, 17px); }
  .stat-name { font-size: max(2.8vmin, 11px); }
  .btn-action {
    padding: 1.1rem;
    font-size: max(4.2vmin, 16px);
    border-radius: 0.8rem;
  }
}
</style>
