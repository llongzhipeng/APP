<template>
  <div class="history-page">
    <div class="page-header">
      <button class="back-btn" @click="$emit('back')">← {{ t('back') }}</button>
      <h2 class="page-title">{{ t('historyTitle') }}</h2>
      <div style="width:6vmin"></div>
    </div>

    <div class="table-wrap">
      <div v-if="records.length === 0" class="no-record">
        {{ t('noRecord') }}
      </div>

      <table v-else class="history-table">
        <thead>
          <tr>
            <th>{{ t('colDate') }}</th>
            <th>{{ t('colProject') }}</th>
            <th>{{ t('colLevel') }}</th>
            <th>{{ t('colDuration') }}</th>
            <th>{{ t('colTotal') }}</th>
            <th>{{ t('colCorrect') }}</th>
            <th>{{ t('colWrong') }}</th>
            <th>{{ t('colRate') }}</th>
            <th>{{ t('colReaction') }}</th>
            <th>{{ t('colScore') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id">
            <td>{{ r.date }}</td>
            <td>{{ lang === 'zh' ? '颜色挑战' : 'Color Challenge' }}</td>
            <td>{{ r.maxDifficulty }}</td>
            <td>{{ r.duration }}{{ t('secUnit') }}</td>
            <td>{{ r.total }}</td>
            <td class="c-correct">{{ r.correct }}</td>
            <td class="c-wrong">{{ r.wrong }}</td>
            <td>{{ r.successRate }}%</td>
            <td>{{ r.avgReactionTime }}{{ t('ms') }}</td>
            <td class="c-score">{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { translations } from '../i18n.js'
import { HISTORY_KEY } from '../gameConfig.js'

export default {
  name: 'HistoryPage',
  props: { lang: String },
  emits: ['back'],
  setup(props) {
    const t = (key) => translations[props.lang][key] || key
    const records = ref(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'))
    return { t, records }
  },
}
</script>

<style scoped>
.history-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2vmin 3vmin;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5vmin;
  flex-shrink: 0;
}
.page-title {
  font-size: 3vmin;
  font-weight: 700;
  color: #333;
}
.back-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
  font-size: 1.8vmin;
  padding: 0.8vmin 2vmin;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover { background: #e9e9e9; }

.table-wrap {
  flex: 1;
  overflow-y: auto;
  border-radius: 8px;
}

.no-record {
  text-align: center;
  color: #999;
  font-size: 2.5vmin;
  margin-top: 8vmin;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.6vmin;
}
.history-table thead th {
  background: #f5f5f5;
  color: #666;
  font-weight: 600;
  padding: 1.5vmin 1vmin;
  text-align: center;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}
.history-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.history-table tbody tr:hover {
  background: #fafafa;
}
.history-table tbody td {
  padding: 1.4vmin 1vmin;
  text-align: center;
  color: #333;
}
.c-correct { color: #4CAF50; font-weight: 600; }
.c-wrong   { color: #f44336; font-weight: 600; }
.c-score   { color: #FF9800; font-weight: 700; }

/* Scrollbar */
.table-wrap::-webkit-scrollbar { width: 0.5vmin; }
.table-wrap::-webkit-scrollbar-track { background: transparent; }
.table-wrap::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
</style>
