<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2 class="modal-title">{{ lang === 'zh' ? '游戏结束' : 'Game Over' }}</h2>
      <div class="stats">
        <div class="stat-row"><span>{{ lang === 'zh' ? '总得分' : 'Score' }}</span><span class="highlight">{{ result.score }}</span></div>
        <div class="stat-row"><span>{{ lang === 'zh' ? '最终难度' : 'Final Level' }}</span><span>Lv.{{ result.finalLevel }}</span></div>
        <div class="stat-row"><span>{{ lang === 'zh' ? '总题数' : 'Total' }}</span><span>{{ result.total }}</span></div>
        <div class="stat-row"><span>{{ lang === 'zh' ? '答对' : 'Correct' }}</span><span class="correct">{{ result.correct }}</span></div>
        <div class="stat-row"><span>{{ lang === 'zh' ? '答错' : 'Wrong' }}</span><span class="wrong">{{ result.wrong }}</span></div>
        <div class="stat-row"><span>{{ lang === 'zh' ? '正确率' : 'Accuracy' }}</span><span>{{ result.total > 0 ? Math.round(result.correct / result.total * 100) + '%' : '0%' }}</span></div>
        <div class="stat-row"><span>{{ lang === 'zh' ? '平均反应' : 'Avg React' }}</span><span>{{ formatAvg(result.avgReaction) }}</span></div>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ lang === 'zh' ? '返回首页' : 'Back to Home' }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ lang: String, result: Object })
defineEmits(['close'])
/**
 * <summary>
 * 格式化平均反应时间展示
 * </summary>
 */
function formatAvg(v) {
  if (v == null || v === '' || v === '—') return '—'
  if (typeof v === 'number') return v.toFixed(2) + 's'
  return v
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal-card {
  background: linear-gradient(135deg, #1e0a3c, #2d1060);
  border: 1px solid rgba(168,85,247,0.5);
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  width: min(90vw, 400px);
  color: #e8d5ff;
  box-shadow: 0 0 5vmin rgba(168,85,247,0.4);
  text-align: center;
}
.modal-title {
  font-size: 3vmin; font-weight: 900; color: #c084fc; margin-bottom: 3vmin;
}
.stats { display: flex; flex-direction: column; gap: 1.2vmin; margin-bottom: 3vmin; }
.stat-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 2vmin; padding: 0.6vmin 0;
  border-bottom: 1px solid rgba(168,85,247,0.15);
}
.highlight { color: #fbbf24; font-weight: 800; font-size: 2.4vmin; }
.correct { color: #4ade80; }
.wrong { color: #f87171; }
.close-btn {
  width: 100%; padding: 1.5vmin;
  font-size: 2.2vmin; font-weight: 700;
  background: linear-gradient(135deg, #6b21a8, #a855f7);
  border: none; border-radius: 1vmin; color: #fff; cursor: pointer;
}
.close-btn:hover { opacity: 0.9; }
</style>
