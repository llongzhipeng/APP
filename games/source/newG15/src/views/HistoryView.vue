<template>
  <div class="history-view">
    <div class="header">
      <h2>{{ t.history.title }}</h2>
      <div class="header-btns">
        <button v-if="records.length" class="clear-btn" @click="doClear">{{ t.history.clear }}</button>
        <button class="back-btn" @click="$emit('go', 'home')">{{ t.history.back }}</button>
      </div>
    </div>
    <div class="content">
      <div v-if="!records.length" class="empty">{{ t.history.empty }}</div>
      <table v-else class="record-table">
        <thead>
          <tr>
            <th>{{ t.history.time }}</th>
            <th>{{ t.history.project }}</th>
            <th>{{ t.history.level }}</th>
            <th>{{ t.history.duration }}</th>
            <th>{{ t.history.total }}</th>
            <th>{{ t.history.success }}</th>
            <th>{{ t.history.fail }}</th>
            <th>{{ t.history.rate }}</th>
            <th>{{ t.history.avgRt }}</th>
            <th>{{ t.history.score }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in records" :key="i">
            <td>{{ formatDate(r.time) }}</td>
            <td>{{ r.project }}</td>
            <td>{{ r.levelSummary }}</td>
            <td>{{ formatDuration(r.duration) }}</td>
            <td>{{ r.total }}</td>
            <td>{{ r.success }}</td>
            <td>{{ r.fail }}</td>
            <td>{{ r.rate }}%</td>
            <td>{{ r.avgRt }} {{ t.common.ms }}</td>
            <td class="score-cell">{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { loadHistory, clearHistory, formatDate, formatDuration } from '../utils/storage.js'
export default {
  name: 'HistoryView',
  props: { t: { type: Object, required: true } },
  data() { return { records: [] } },
  created() { this.records = loadHistory() },
  methods: {
    formatDate,
    formatDuration,
    doClear() {
      if (confirm(this.t.history.confirmClear)) {
        clearHistory()
        this.records = []
      }
    }
  }
}
</script>

<style scoped>
.history-view {
  width: 100%;
  height: 100%;
  background: #f6f8fb;
  display: flex;
  flex-direction: column;
  padding: calc(var(--u) * 2);
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: calc(var(--u) * 1.5);
  border-bottom: 2px solid #e5e9f2;
}
.header h2 { font-size: calc(var(--u) * 2.6); color: #333; }
.header-btns { display: flex; gap: calc(var(--u) * 1); }
.clear-btn, .back-btn {
  padding: calc(var(--u) * 0.8) calc(var(--u) * 2);
  font-size: calc(var(--u) * 1.4);
  color: #fff;
  border: none;
  border-radius: calc(var(--u) * 0.6);
  cursor: pointer;
}
.clear-btn { background: #e74c3c; }
.back-btn { background: #667eea; }
.content { margin-top: calc(var(--u) * 1.5); flex: 1; overflow: auto; }
.empty {
  padding: calc(var(--u) * 4);
  text-align: center;
  font-size: calc(var(--u) * 1.8);
  color: #888;
}
.record-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: calc(var(--u) * 0.6);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  min-width: calc(var(--u) * 70);
}
.record-table th, .record-table td {
  padding: calc(var(--u) * 0.9) calc(var(--u) * 0.8);
  font-size: calc(var(--u) * 1.3);
  text-align: center;
  border-bottom: 1px solid #eef0f5;
  white-space: nowrap;
}
.record-table th { background: #667eea; color: #fff; font-weight: 600; }
.record-table tr:nth-child(even) td { background: #fafbfd; }
.score-cell { color: #e67e22; font-weight: 700; }

@media (orientation: portrait) {
  .history-view {
    padding: 3vw;
    padding-top: calc(3vw + env(safe-area-inset-top));
    padding-bottom: calc(3vw + env(safe-area-inset-bottom));
  }
  .header h2 { font-size: max(5vmin, 20px); }
  .clear-btn, .back-btn {
    padding: 1.6vmin 3.2vmin;
    font-size: max(3.2vmin, 13px);
    border-radius: 2vmin;
  }
  .empty { font-size: max(4vmin, 15px); padding: 8vmin 4vmin; }

  /* Turn record rows into cards */
  .content { overflow-y: auto; overflow-x: hidden; }
  .record-table { min-width: 0; background: transparent; box-shadow: none; }
  .record-table thead { display: none; }
  .record-table, .record-table tbody, .record-table tr, .record-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .record-table tr {
    background: #fff;
    border-radius: 2vmin;
    margin-bottom: 2.4vmin;
    padding: 2.4vmin 3vmin;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .record-table tr:nth-child(even) td { background: transparent; }
  .record-table td {
    text-align: left;
    white-space: normal;
    padding: 1.2vmin 0;
    border-bottom: 1px dashed #eef0f5;
    font-size: max(3.2vmin, 13px);
  }
  .record-table td:last-child { border-bottom: none; }
  .record-table td:nth-of-type(1) { font-weight: 600; color: #667eea; font-size: max(3.4vmin, 14px); }
}
</style>
