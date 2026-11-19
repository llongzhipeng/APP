<template>
  <div class="history-page">
    <button class="back-btn" @click="$emit('back')">{{ t('back') }}</button>
    <div class="header">
      <h1 class="title">{{ t('historyTitle') }}</h1>
      <button v-if="records.length" class="clear-btn" @click="onClear">{{ t('clearHistory') }}</button>
    </div>

    <div v-if="!records.length" class="empty">{{ t('historyEmpty') }}</div>

    <div v-else class="table-wrap">
      <table class="records">
        <thead>
          <tr>
            <th>{{ t('colTime') }}</th>
            <th>{{ t('colProject') }}</th>
            <th>{{ t('colLevel') }}</th>
            <th>{{ t('colDuration') }}</th>
            <th>{{ t('colTotal') }}</th>
            <th>{{ t('colSuccess') }}</th>
            <th>{{ t('colFail') }}</th>
            <th>{{ t('colRate') }}</th>
            <th>{{ t('colAvgTime') }}</th>
            <th>{{ t('colScore') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in records" :key="i">
            <td>{{ formatDate(r.finishedAt) }}</td>
            <td>{{ t('projectName') }}</td>
            <td>L{{ r.finalLevel }}</td>
            <td>{{ Math.round(r.durationSec / 60) }}min</td>
            <td>{{ r.total }}</td>
            <td>{{ r.correct }}</td>
            <td>{{ r.fail }}</td>
            <td>{{ (r.rate * 100).toFixed(0) }}%</td>
            <td>{{ (r.avgRt / 1000).toFixed(2) }}s</td>
            <td>{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm = false">
      <div class="confirm-card">
        <div class="confirm-text">{{ t('confirmClear') }}</div>
        <div class="confirm-btns">
          <button class="mini-btn" @click="showConfirm = false">{{ t('back') }}</button>
          <button class="mini-btn danger" @click="doClear">{{ t('clearHistory') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js';
import { loadHistory, clearHistory, formatDate } from '../utils/storage.js';

export default {
  name: 'HistoryPage',
  props: ['lang'],
  data() { return { records: [], showConfirm: false }; },
  methods: {
    t(k, p) { return t(this.lang, k, p); },
    formatDate,
    onClear() { this.showConfirm = true; },
    doClear() { clearHistory(); this.records = []; this.showConfirm = false; },
  },
  mounted() { this.records = loadHistory(); },
};
</script>

<style scoped>
.history-page {
  width: 100%; height: 100%;
  padding: 6vmin 6vmin 4vmin;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  overflow: hidden;
  position: relative;
  display: flex; flex-direction: column;
}
.back-btn {
  position: absolute; top: 3vmin; left: 3vmin;
  padding: 1.2vmin 2.5vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
}
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3vmin; padding-left: 20vmin; }
.title { font-size: 4.5vmin; color: #7a3a1e; letter-spacing: 0.3vmin; }
.clear-btn {
  padding: 1.2vmin 2.5vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #d55;
  color: #c22;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 600;
}
.empty {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: 3vmin; color: #999;
}
.table-wrap { flex: 1; overflow-y: auto; background: #fff; border-radius: 2vmin; border: 0.25vmin solid #b08b4f; }
.records { width: 100%; border-collapse: collapse; font-size: 2vmin; }
.records th, .records td {
  padding: 1.5vmin 1vmin;
  text-align: center;
  border-bottom: 0.1vmin solid #f0e4c8;
}
.records th {
  background: #f6ebd5;
  color: #7a3a1e;
  font-weight: 700;
  position: sticky; top: 0;
}
.records td { color: #444; }
.records tbody tr:hover { background: #fff8ec; }

.confirm-overlay {
  position: absolute; inset: 0;
  background: rgba(30,20,10,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 60;
}
.confirm-card {
  background: #fdf9f0;
  padding: 4vmin;
  border-radius: 2vmin;
  border: 0.3vmin solid #b08b4f;
  min-width: 40vmin;
}
.confirm-text { font-size: 2.6vmin; color: #7a3a1e; margin-bottom: 3vmin; text-align: center; }
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
.mini-btn {
  padding: 1.5vmin 3vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  border-radius: 1.2vmin;
  color: #7a5a2c;
  font-weight: 600;
  cursor: pointer;
}
.mini-btn.danger { background: #d55; color: #fff; border-color: #b33; }
</style>
