<template>
  <div class="result-page">
    <div class="result-card">
      <div class="result-header">
        <div class="trophy">🏆</div>
        <h2 class="result-title">{{ L.title }}</h2>
        <div class="final-score">
          <span class="score-num">{{ result.score }}</span>
          <span class="score-label">{{ L.points }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-row" v-for="row in statRows" :key="row.key">
          <span class="srow-label">{{ row.label }}</span>
          <span class="srow-val" :class="row.class">{{ row.value }}</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="act-btn act-again" @click="$emit('again')">
          {{ L.again }}
        </button>
        <BatchTrainActions :home-text="L.home" @home="$emit('home')" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14ResultPage',
};
</script>

<script setup>
import { computed } from '@vue/composition-api'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

const props = defineProps({ language: String, result: Object })
defineEmits(['again', 'home'])

const lang = computed(() => props.language || 'zh')

const texts = {
  zh: {
    title: '训练完成！',
    points: '分',
    again: '再来一局',
    home: '返回首页',
    labels: {
      date: '训练时间',
      project: '训练项目',
      level: '最终难度',
      duration: '训练时长',
      total: '总题数',
      correct: '正确',
      incorrect: '错误',
      successRate: '正确率',
      minResponseTime: '最短反应时间',
      maxResponseTime: '最长反应时间',
      avgResponseTime: '平均反应时间',
    },
    secs: '秒'
  },
  en: {
    title: 'Training Complete!',
    points: 'pts',
    again: 'Play Again',
    home: 'Home',
    labels: {
      date: 'Date',
      project: 'Game',
      level: 'Final Level',
      duration: 'Duration',
      total: 'Total',
      correct: 'Correct',
      incorrect: 'Incorrect',
      successRate: 'Accuracy',
      minResponseTime: 'Min Response',
      maxResponseTime: 'Max Response',
      avgResponseTime: 'Avg Response',
    },
    secs: 's'
  }
}

const L = computed(() => texts[lang.value] || texts.zh)

const statRows = computed(() => {
  if (!props.result) return []
  const r = props.result
  const labels = L.value.labels
  const durSecs = r.duration
  const m = Math.floor(durSecs / 60)
  const s = durSecs % 60
  const durStr = m > 0 ? `${m}min${s > 0 ? ' ' + s + 's' : ''}` : durSecs + 's'

  return [
    { key: 'date', label: labels.date, value: r.date, class: '' },
    { key: 'project', label: labels.project, value: r.project, class: '' },
    { key: 'level', label: labels.level, value: 'Lv.' + r.level, class: 'val-blue' },
    { key: 'duration', label: labels.duration, value: durStr, class: '' },
    { key: 'total', label: labels.total, value: r.total, class: '' },
    { key: 'correct', label: labels.correct, value: r.correct, class: 'val-green' },
    { key: 'incorrect', label: labels.incorrect, value: r.incorrect, class: 'val-red' },
    { key: 'successRate', label: labels.successRate, value: r.successRate, class: 'val-orange' },
    { key: 'minResponseTime', label: labels.minResponseTime, value: (r.minResponseTime) + 's', class: '' },
    { key: 'maxResponseTime', label: labels.maxResponseTime, value: (r.maxResponseTime) + 's', class: '' },
    { key: 'avgResponseTime', label: labels.avgResponseTime, value: (r.avgResponseTime  ) + 's', class: '' }
  ]
})
</script>

<style scoped>
.result-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.result-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 2.5vmin;
  padding: 3vmin 4vmin;
  max-width: 70vmin;
  width: 92%;
  box-shadow: 0 8px 40px rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(255,255,255,0.7);
  max-height: 95vh;
  overflow-y: auto;
}

.result-header {
  text-align: center;
  margin-bottom: 3vmin;
}

.trophy {
  font-size: clamp(32px, 7vmin, 72px);
  margin-bottom: 1vmin;
}

.result-title {
  font-size: clamp(18px, 3.5vmin, 36px);
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 2vmin;
}

.final-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 1vmin;
  background: linear-gradient(135deg, #fef9c3, #fde68a);
  padding: 1.5vmin 4vmin;
  border-radius: 1.5vmin;
  border: 2px solid #f59e0b;
}

.score-num {
  font-size: clamp(28px, 6vmin, 62px);
  font-weight: 900;
  color: #b45309;
}

.score-label {
  font-size: clamp(14px, 2.5vmin, 26px);
  font-weight: 700;
  color: #92400e;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2vmin;
  margin-bottom: 2.5vmin;
}

.stat-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.2vmin 1vmin;
  background: #f8fafc;
  border-radius: 1vmin;
  border: 1px solid #e2e8f0;
  gap: 0.4vmin;
}

.srow-label {
  font-size: clamp(10px, 1.5vmin, 15px);
  color: #64748b;
  font-weight: 600;
  text-align: center;
}

.srow-val {
  font-size: clamp(12px, 2vmin, 20px);
  font-weight: 800;
  color: #1e293b;
  text-align: center;
}

.val-blue { color: #2563eb; }
.val-green { color: #16a34a; }
.val-red { color: #dc2626; }
.val-orange { color: #d97706; }

.result-actions {
  display: flex;
  gap: 2vmin;
}

.act-btn {
  flex: 1;
  padding: 1.8vmin;
  border: none;
  border-radius: 1.2vmin;
  font-size: clamp(13px, 2.3vmin, 22px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
}

.act-again {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.act-again:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

.act-home {
  background: #e2e8f0;
  color: #475569;
}

.act-home:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}
</style>
