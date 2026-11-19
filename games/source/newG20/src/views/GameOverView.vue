<template>
  <div class="game-over">
    <div class="card">
      <h2>🏆 {{ t.gameOver }}</h2>
      <div class="score-display">
        <div class="score-label">{{ t.finalScore }}</div>
        <div class="score-value">{{ record.score }}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">{{ t.total }}</div>
          <div class="stat-value">{{ record.total }}</div>
        </div>
        <div class="stat-box success">
          <div class="stat-label">{{ t.successCount }}</div>
          <div class="stat-value">{{ record.success }}</div>
        </div>
        <div class="stat-box fail">
          <div class="stat-label">{{ t.failCount }}</div>
          <div class="stat-value">{{ record.fail }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">{{ t.successRate }}</div>
          <div class="stat-value">{{ record.rate }}%</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">{{ t.avgReaction }}</div>
          <div class="stat-value">{{ record.avgReaction }}s</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">{{ t.finalDifficulty }}</div>
          <div class="stat-value">{{ record.finalDifficulty }}</div>
        </div>
      </div>
      <div class="actions">
        <button class="action-btn" @click="$emit('nav', 'home')">🏠 {{ t.backHome }}</button>
        <button class="action-btn primary" @click="$emit('nav', 'duration')">🎮 {{ t.playAgain }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameOverView',
  props: ['t', 'record']
}
</script>

<style scoped>
.game-over {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
  background: linear-gradient(135deg, #87ceeb 0%, #98d8e8 50%, #b8e6c9 100%);
  overflow: auto;
}
.card {
  background: #fff;
  border-radius: 3vmin;
  padding: 4vmin 5vmin;
  max-width: 90vw;
  width: 80vmin;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.2);
  text-align: center;
  animation: slideUp 0.4s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(4vmin); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
h2 { font-size: 4.5vmin; color: #2c3e50; margin-bottom: 2vmin; }
.score-display {
  background: linear-gradient(135deg, #fff9c4, #fff59d);
  padding: 3vmin;
  border-radius: 2.5vmin;
  margin-bottom: 3vmin;
  border: 0.5vmin solid #ffd54f;
}
.score-label { font-size: 2.4vmin; color: #7f6b30; margin-bottom: 0.5vmin; font-weight: 600; }
.score-value {
  font-size: 7vmin;
  font-weight: 900;
  color: #f57f17;
  line-height: 1;
  text-shadow: 0.4vmin 0.4vmin 0 rgba(0,0,0,0.05);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2vmin;
  margin-bottom: 3vmin;
}
.stat-box {
  background: #f5f7fa;
  padding: 2vmin 1vmin;
  border-radius: 1.5vmin;
}
.stat-box.success { background: #e8f5e9; }
.stat-box.fail { background: #ffebee; }
.stat-box .stat-label { font-size: 1.9vmin; color: #7f8c8d; margin-bottom: 0.6vmin; font-weight: 600; }
.stat-box .stat-value { font-size: 3vmin; font-weight: 700; color: #2c3e50; }
.stat-box.success .stat-value { color: #2e7d32; }
.stat-box.fail .stat-value { color: #c62828; }
.actions { display: flex; gap: 2vmin; justify-content: center; flex-wrap: wrap; }
.action-btn {
  padding: 1.6vmin 3.5vmin;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  font-size: 2.4vmin;
  background: #ecf0f1;
  color: #2c3e50;
  box-shadow: 0 0.6vmin 1.5vmin rgba(0,0,0,0.08);
  transition: all 0.15s;
  min-width: 22vmin;
}
.action-btn:hover { transform: translateY(-0.4vmin); box-shadow: 0 1vmin 2.5vmin rgba(0,0,0,0.12); }
.action-btn.primary {
  background: linear-gradient(135deg, #ff9a56, #ff6a3d);
  color: #fff;
  box-shadow: 0 0.6vmin 1.5vmin rgba(255,106,61,0.4);
}
.action-btn.primary:hover { box-shadow: 0 1vmin 3vmin rgba(255,106,61,0.5); }

@media (orientation: portrait) {
  .game-over {
    padding: 3vmin;
    padding-top: calc(3vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
    align-items: flex-start;
  }
  .card {
    padding: 5vmin 4vmin;
    width: 92vw;
    max-width: 92vw;
    border-radius: 3.4vmin;
  }
  h2 { font-size: max(6vmin, 22px); margin-bottom: 3vmin; }
  .score-display { padding: 4vmin 2vmin; border-radius: 3vmin; margin-bottom: 4vmin; }
  .score-label { font-size: max(3.6vmin, 14px); }
  .score-value { font-size: max(11vmin, 46px); }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.4vmin;
    margin-bottom: 4vmin;
  }
  .stat-box { padding: 2.6vmin 1.4vmin; border-radius: 2vmin; }
  .stat-box .stat-label { font-size: max(3vmin, 12px); }
  .stat-box .stat-value { font-size: max(4.4vmin, 18px); }
  .actions { flex-direction: column; gap: 2.4vmin; }
  .action-btn {
    font-size: max(3.8vmin, 16px);
    padding: 2.4vmin 4vmin;
    min-width: 80%;
    border-radius: 2.8vmin;
  }
}
</style>
