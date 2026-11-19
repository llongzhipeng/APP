<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ L.title }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="history.length === 0" class="empty-state">
          <span class="empty-icon">📊</span>
          <p>{{ L.empty }}</p>
        </div>

        <template v-else>
          <div class="summary-bar">
            <div class="sum-item">
              <span class="sum-num">{{ history.length }}</span>
              <span class="sum-label">{{ L.games }}</span>
            </div>
            <div class="sum-item">
              <span class="sum-num">{{ bestScore }}</span>
              <span class="sum-label">{{ L.bestScore }}</span>
            </div>
            <div class="sum-item">
              <span class="sum-num">{{ avgRate }}</span>
              <span class="sum-label">{{ L.avgRate }}</span>
            </div>
          </div>

          <div class="history-list">
            <div class="history-item" v-for="(rec, i) in history" :key="i">
              <div class="rec-top">
                <span class="rec-date">{{ rec.date }}</span>
                <span class="rec-score">{{ rec.score }} {{ L.pts }}</span>
              </div>
              <div class="rec-stats">
                <span class="rs-item">
                  <em>{{ L.level }}</em> Lv.{{ rec.level }}
                </span>
                <span class="rs-item">
                  <em>{{ L.total }}</em> {{ rec.total }}
                </span>
                <span class="rs-item green">
                  <em>{{ L.correct }}</em> {{ rec.correct }}
                </span>
                <span class="rs-item red">
                  <em>{{ L.incorrect }}</em> {{ rec.incorrect }}
                </span>
                <span class="rs-item orange">
                  <em>{{ L.rate }}</em> {{ rec.successRate }}
                </span>
                <span class="rs-item">
                  <em>{{ L.avgRT }}</em> {{ rec.avgResponseTime }}{{ String(rec.avgResponseTime).endsWith('s') ? '' : 's' }}
                </span>
              </div>
            </div>
          </div>

          <button class="clear-btn" @click="clearHistory">{{ L.clear }}</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14HistoryModal'
};
</script>

<script setup>
import { ref, computed, onMounted } from '@vue/composition-api'
import { getHistory } from '../utils/gameData.js'

const props = defineProps({ language: String })
defineEmits(['close'])

const lang = computed(() => props.language || 'zh')
const history = ref([])

const texts = {
  zh: {
    title: '历史记录',
    empty: '暂无记录，快去开始训练吧！',
    games: '总局数',
    bestScore: '最高分',
    avgRate: '平均正确率',
    pts: '分',
    level: '难度',
    total: '题数',
    correct: '正确',
    incorrect: '错误',
    rate: '正确率',
    avgRT: '平均反应',
    clear: '清空记录'
  },
  en: {
    title: 'History',
    empty: 'No records yet. Start training!',
    games: 'Games',
    bestScore: 'Best Score',
    avgRate: 'Avg Accuracy',
    pts: 'pts',
    level: 'Level',
    total: 'Total',
    correct: 'Correct',
    incorrect: 'Wrong',
    rate: 'Accuracy',
    avgRT: 'Avg RT',
    clear: 'Clear History'
  }
}

const L = computed(() => texts[lang.value] || texts.zh)

const bestScore = computed(() => {
  if (!history.value.length) return 0
  return Math.max(...history.value.map(r => r.score))
})

const avgRate = computed(() => {
  if (!history.value.length) return '0%'
  const rates = history.value.map(r => parseInt(r.successRate) || 0)
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) + '%'
})

function clearHistory() {
  localStorage.removeItem('game14_history')
  history.value = []
}

onMounted(() => {
  history.value = getHistory()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
  backdrop-filter: blur(4px);
  padding: 2vmin;
}

.modal-box {
  background: white;
  border-radius: 2vmin;
  width: 90vmin;
  max-width: 96vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2vmin 3vmin;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: clamp(16px, 3vmin, 30px);
  font-weight: 800;
  color: white;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  width: 4vmin;
  height: 4vmin;
  min-width: 28px;
  min-height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: clamp(12px, 2vmin, 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover { background: rgba(255,255,255,0.4); }

.modal-body {
  overflow-y: auto;
  padding: 2.5vmin 3vmin;
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 6vmin;
  color: #94a3b8;
}

.empty-icon {
  font-size: clamp(36px, 8vmin, 80px);
  display: block;
  margin-bottom: 2vmin;
}

.empty-state p {
  font-size: clamp(13px, 2vmin, 20px);
  font-weight: 600;
}

.summary-bar {
  display: flex;
  gap: 2vmin;
  margin-bottom: 2.5vmin;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 1.5vmin;
  padding: 2vmin;
  border: 1px solid #bfdbfe;
}

.sum-item {
  flex: 1;
  text-align: center;
}

.sum-num {
  display: block;
  font-size: clamp(18px, 3.5vmin, 36px);
  font-weight: 900;
  color: #1e40af;
}

.sum-label {
  font-size: clamp(10px, 1.6vmin, 14px);
  color: #64748b;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5vmin;
  margin-bottom: 2.5vmin;
}

.history-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1.2vmin;
  padding: 1.5vmin 2vmin;
}

.rec-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1vmin;
}

.rec-date {
  font-size: clamp(10px, 1.6vmin, 14px);
  color: #94a3b8;
}

.rec-score {
  font-size: clamp(14px, 2.5vmin, 24px);
  font-weight: 800;
  color: #b45309;
  background: #fef9c3;
  padding: 0.3vmin 1vmin;
  border-radius: 0.8vmin;
}

.rec-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1vmin;
}

.rs-item {
  font-size: clamp(10px, 1.6vmin, 14px);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.6vmin;
  padding: 0.3vmin 0.8vmin;
  color: #334155;
  font-weight: 600;
}

.rs-item em {
  font-style: normal;
  color: #94a3b8;
  font-weight: 500;
  margin-right: 0.3vmin;
}

.rs-item.green { border-color: #bbf7d0; color: #15803d; background: #f0fdf4; }
.rs-item.red { border-color: #fecaca; color: #dc2626; background: #fff1f2; }
.rs-item.orange { border-color: #fde68a; color: #d97706; background: #fffbeb; }

.clear-btn {
  width: 100%;
  padding: 1.5vmin;
  background: #fee2e2;
  border: 2px solid #fca5a5;
  color: #dc2626;
  border-radius: 1vmin;
  font-size: clamp(12px, 2vmin, 18px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #fecaca;
}
</style>
