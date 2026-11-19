<template>
  <div class="result-view">
    <div class="card">
      <h2 class="title">{{ t.result.title }}</h2>
      <div class="score-block">
        <div class="score-label">{{ t.result.finalScore }}</div>
        <div class="score-value">{{ result.score }}</div>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-label">{{ t.result.total }}</div>
          <div class="stat-value">{{ result.total }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t.result.success }}</div>
          <div class="stat-value success">{{ result.success }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t.result.fail }}</div>
          <div class="stat-value fail">{{ result.fail }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t.result.rate }}</div>
          <div class="stat-value">{{ result.rate }}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t.result.avgRt }}</div>
          <div class="stat-value">{{ result.avgRt }} {{ t.common.ms }}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn primary" @click="$emit('go', 'tutorial')">{{ t.result.restart }}</button>
        <button class="btn" @click="$emit('go', 'home')">{{ t.result.home }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultView',
  props: {
    t: { type: Object, required: true },
    result: { type: Object, required: true }
  }
}
</script>

<style scoped>
.result-view {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card {
  width: min(90vw, calc(var(--u) * 55));
  background: #fff;
  border-radius: calc(var(--u) * 1.2);
  padding: calc(var(--u) * 3);
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  text-align: center;
}
.title {
  font-size: calc(var(--u) * 2.6);
  color: #333;
  margin-bottom: calc(var(--u) * 2);
}
.score-block {
  background: linear-gradient(90deg, #ff6b6b, #ff8e53);
  color: #fff;
  padding: calc(var(--u) * 1.5);
  border-radius: calc(var(--u) * 0.8);
  margin-bottom: calc(var(--u) * 2);
}
.score-label { font-size: calc(var(--u) * 1.4); opacity: 0.9; }
.score-value {
  font-size: calc(var(--u) * 5);
  font-weight: 800;
  margin-top: calc(var(--u) * 0.4);
}
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: calc(var(--u) * 1);
  margin-bottom: calc(var(--u) * 2);
}
.stat {
  background: #f6f8fb;
  padding: calc(var(--u) * 1);
  border-radius: calc(var(--u) * 0.6);
}
.stat-label { font-size: calc(var(--u) * 1.1); color: #888; }
.stat-value {
  font-size: calc(var(--u) * 1.8);
  font-weight: 700;
  color: #333;
  margin-top: calc(var(--u) * 0.3);
}
.stat-value.success { color: #52c41a; }
.stat-value.fail { color: #ff4d4f; }
.actions {
  display: flex;
  gap: calc(var(--u) * 1.2);
  justify-content: center;
}
.btn {
  padding: calc(var(--u) * 1) calc(var(--u) * 2.2);
  font-size: calc(var(--u) * 1.5);
  border: 1px solid #d0d5e0;
  background: #fff;
  color: #333;
  border-radius: calc(var(--u) * 0.6);
  cursor: pointer;
}
.btn.primary {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

@media (orientation: portrait) {
  .card {
    width: 92vw;
    padding: 5vmin 4vmin;
    padding-top: calc(5vmin + env(safe-area-inset-top));
    padding-bottom: calc(5vmin + env(safe-area-inset-bottom));
    border-radius: 3vmin;
  }
  .title { font-size: max(5.5vmin, 22px); margin-bottom: 3vh; }
  .score-block {
    padding: 3vmin;
    border-radius: 2vmin;
    margin-bottom: 3vh;
  }
  .score-label { font-size: max(3.4vmin, 14px); }
  .score-value { font-size: max(11vmin, 40px); }
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 2vmin;
    margin-bottom: 3vh;
  }
  .stat { padding: 2vmin; border-radius: 2vmin; }
  .stat-label { font-size: max(2.8vmin, 12px); }
  .stat-value { font-size: max(4.2vmin, 17px); }
  .actions { flex-direction: column; gap: 2vmin; }
  .btn {
    width: 100%;
    padding: 2.4vmin 4vmin;
    font-size: max(3.8vmin, 15px);
    border-radius: 2vmin;
  }
}
</style>
