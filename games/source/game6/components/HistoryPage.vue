<template>
  <div class="history-page">
    <div class="history-header">
      <button class="back-btn" @click="$emit('back')">← {{ t.historyBack }}</button>
      <h1>{{ t.historyTitle }}</h1>
      <button
        v-if="records.length > 0"
        class="clear-btn"
        @click="clearAll"
      >{{ t.clearHistory }}</button>
      <div v-else style="width:80px" />
    </div>

    <div class="history-content">
      <!-- Empty state -->
      <div v-if="records.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>{{ t.historyEmpty }}</p>
      </div>

      <!-- Records table -->
      <div v-else class="table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th>{{ t.hDate }}</th>
              <th>{{ t.hProject }}</th>
              <th>{{ t.hDifficulty }}</th>
              <th>{{ t.hDuration }}</th>
              <th>{{ t.hTotal }}</th>
              <th>{{ t.hSuccess }}</th>
              <th>{{ t.hFail }}</th>
              <th>{{ t.hRate }}</th>
              <th>{{ t.hAvgTime }}</th>
              <th>{{ t.hScore }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ r.date }}</td>
              <td>{{ r.project }}</td>
              <td>Lv.{{ r.difficulty }}</td>
              <td>{{ formatDuration(r.duration) }}</td>
              <td>{{ r.total }}</td>
              <td class="success">{{ r.success }}</td>
              <td class="fail">{{ r.fail }}</td>
              <td>{{ r.rate }}%</td>
              <td>{{ r.avgTime }}ms</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game6HistoryPage'
};
</script>

<script setup>
import { ref } from '@vue/composition-api'

defineProps({ t: Object })
defineEmits(['back'])

const records = ref(JSON.parse(localStorage.getItem('numberCatchHistory') || '[]'))

function formatDuration(secs) {
  if (secs < 60) return secs + 's'
  return Math.floor(secs / 60) + 'min'
}

function clearAll() {
  localStorage.removeItem('numberCatchHistory')
  records.value = []
}
</script>

<style scoped>
.history-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.history-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.back-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 80px;
}
.back-btn:hover { background: rgba(255,255,255,0.18); }

.history-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.clear-btn {
  background: rgba(244,67,54,0.2);
  border: 1px solid rgba(244,67,54,0.4);
  color: #ef9a9a;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 80px;
}
.clear-btn:hover {
  background: rgba(244,67,54,0.35);
  border-color: rgba(244,67,54,0.6);
}

.history-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.history-content::-webkit-scrollbar { width: 6px; height: 6px; }
.history-content::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
.history-content::-webkit-scrollbar-thumb { background: rgba(100,181,246,0.4); border-radius: 3px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: rgba(255,255,255,0.4);
  font-size: 16px;
}
.empty-icon { font-size: 56px; }

.table-wrap {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  white-space: nowrap;
}

.history-table th {
  background: rgba(33,150,243,0.2);
  color: #90caf9;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.1);
  position: sticky;
  top: 0;
}

.history-table td {
  padding: 10px 16px;
  text-align: center;
  color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.07);
}
.history-table tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
.history-table tr:hover td { background: rgba(33,150,243,0.08); }

.success { color: #81c784; }
.fail { color: #e57373; }
.score { color: #ffb74d; font-weight: 700; }
</style>
