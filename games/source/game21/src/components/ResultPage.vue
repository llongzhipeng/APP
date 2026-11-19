<template>
  <div class="result-page">
    <div class="result-box">
      <h2 class="result-title">{{ t.gameOver }}</h2>
      <div class="score-big">{{ result.score }}</div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">{{ t.totalRounds }}</span>
          <span class="stat-val">{{ result.totalRounds }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t.successRounds }}</span>
          <span class="stat-val green">{{ result.successRounds }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t.failRounds }}</span>
          <span class="stat-val red">{{ result.failRounds }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t.successRate }}</span>
          <span class="stat-val">{{ result.successRate }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t.avgReaction }}</span>
          <span class="stat-val">{{ result.avgReaction }}ms</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t.difficulty }}</span>
          <span class="stat-val">{{ result.maxDifficulty }}</span>
        </div>
      </div>
      <div class="result-btns">
        <button class="res-btn primary" @click="$emit('playAgain')">{{ t.playAgain }}</button>
        <button class="res-btn secondary" @click="$emit('home')">{{ t.backHome }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultPage',
  props: { t: Object, result: Object },
  emits: ['playAgain', 'home'],
}
</script>

<style scoped>
.result-page {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.result-box {
  background: rgba(0,30,60,0.88); backdrop-filter: blur(12px);
  border: 1px solid rgba(0,180,255,0.3); border-radius: 24px;
  padding: 48px 60px; color: #fff;
  display: flex; flex-direction: column; align-items: center; gap: 28px;
  min-width: 480px;
}
.result-title { font-size: 30px; font-weight: 800; color: #7ee8fa; }
.score-big { font-size: 80px; font-weight: 900; color: #ffd700; line-height: 1;
  text-shadow: 0 0 30px rgba(255,215,0,0.6); }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; width: 100%; }
.stat-item {
  background: rgba(0,100,180,0.2); border-radius: 12px; padding: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  border: 1px solid rgba(0,180,255,0.15);
}
.stat-label { font-size: 13px; color: rgba(255,255,255,0.6); }
.stat-val { font-size: 22px; font-weight: 800; }
.stat-val.green { color: #4caf50; }
.stat-val.red { color: #f44336; }
.result-btns { display: flex; gap: 20px; }
.res-btn {
  padding: 13px 40px; border-radius: 30px; border: none;
  font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.3s;
}
.res-btn.primary { background: linear-gradient(135deg, #f093fb, #f5576c); color: #fff; }
.res-btn.secondary { background: rgba(255,255,255,0.15); color: #fff; border: 2px solid rgba(255,255,255,0.3); }
.res-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
</style>
