<template>
  <div class="history-page">
    <div class="page-header">
      <button class="back-btn" @click="$emit('back')">← {{ t('back') }}</button>
      <span class="page-title">{{ t('historyTitle') }}</span>
      <button v-if="records.length" class="clear-btn" @click="onClear">{{ t('clearHistory') }}</button>
      <span v-else class="placeholder-btn" />
    </div>

    <div class="content">
      <div v-if="!records.length" class="empty-state">
        <div class="empty-icon">📊</div>
        <p>{{ t('noHistory') }}</p>
      </div>

      <div v-else class="table-wrap">
        <table class="records-table">
          <thead>
            <tr>
              <th>{{ t('colTime') }}</th>
              <th>{{ t('colProject') }}</th>
              <th>{{ t('colDiff') }}</th>
              <th>{{ t('colDuration') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th>{{ t('colCorrect') }}</th>
              <th>{{ t('colWrong') }}</th>
              <th>{{ t('colRate') }}</th>
              <th>{{ t('colAvgTime') }}</th>
              <th>{{ t('colScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ r.timestamp }}</td>
              <td>{{ isZh ? r.projectZh : r.projectEn }}</td>
              <td>Lv {{ r.level }}</td>
              <td>{{ r.duration / 60 }}min</td>
              <td>{{ r.total }}</td>
              <td class="td-correct">{{ r.correct }}</td>
              <td class="td-wrong">{{ r.wrong }}</td>
              <td>{{ (r.successRate * 100).toFixed(1) }}%</td>
              <td>{{ (r.avgReaction / 1000).toFixed(2) }}s</td>
              <td class="td-score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { t, langState } from '../utils/i18n.js'
import { getHistory, clearHistory } from '../utils/storage.js'

export default {
  name: 'HistoryPage',
  emits: ['back'],
  data() {
    return { records: getHistory() }
  },
  computed: {
    isZh() { return langState.current === 'zh' },
  },
  methods: {
    t,
    onClear() {
      if (confirm(t('confirmClear'))) {
        clearHistory()
        this.records = []
      }
    },
  },
}
</script>

<style scoped>
.history-page {
  width: 100%;
  height: 100%;
  background: #f0f4ff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  background: linear-gradient(135deg, #4A90E2, #4A90E2);
  color: white;
  padding: 1.5vmin 3vmin;
  display: flex;
  align-items: center;
  gap: 2vmin;
  flex-shrink: 0;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 2.4vmin;
  font-weight: 700;
}

.back-btn, .clear-btn {
  background: rgba(255,255,255,0.15);
  border: 0.15vmin solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.7vmin 1.8vmin;
  border-radius: 0.8vmin;
  font-size: 1.7vmin;
  cursor: pointer;
  white-space: nowrap;
}
.back-btn:hover, .clear-btn:hover { background: rgba(255,255,255,0.25); }

.clear-btn { background: rgba(229,57,53,0.5); border-color: rgba(229,57,53,0.7); }
.clear-btn:hover { background: rgba(229,57,53,0.75); }

.placeholder-btn { width: 8vmin; }

.content {
  flex: 1;
  overflow: auto;
  padding: 2vmin 3vmin;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  gap: 2vmin;
}

.empty-icon { font-size: 6vmin; }

.empty-state p { font-size: 2vmin; }

/* Table */
.table-wrap {
  overflow: auto;
  border-radius: 1.2vmin;
  box-shadow: 0 0.3vmin 2vmin rgba(0,0,0,0.1);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.6vmin;
  background: white;
  min-width: 80vmin;
}

.records-table th {
  background: #4A90E2;
  color: white;
  padding: 1.2vmin 1.5vmin;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.records-table td {
  padding: 1vmin 1.5vmin;
  text-align: center;
  border-bottom: 0.1vmin solid #e8ecf8;
  white-space: nowrap;
}

.records-table tbody tr:nth-child(even) { background: #f5f7ff; }
.records-table tbody tr:hover { background: #e8f0fe; }

.td-correct { color: #2e7d32; font-weight: 600; }
.td-wrong   { color: #c62828; font-weight: 600; }
.td-score   { color: #4A90E2; font-weight: 700; font-size: 1.8vmin; }
</style>
