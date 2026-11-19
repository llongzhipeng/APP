<template>
  <div class="history-page">
    <button class="back-btn" @click="$emit('back')">← {{ t('back') }}</button>
    <div class="header">
      <h1 class="title">{{ t('historyTitle') }}</h1>
      <button v-if="records.length" class="clear-btn" @click="onClear">{{ t('clearHistory') }}</button>
    </div>

    <div v-if="!records.length" class="empty">
      <div class="empty-ico">📜</div>
      <div>{{ t('historyEmpty') }}</div>
    </div>

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
            <td>{{ formatDate(r.timestamp) }}</td>
            <td>{{ t('projectName') }}</td>
            <td>L{{ r.maxLevel }}</td>
            <td>{{ Math.round(r.duration / 60) }} min</td>
            <td>{{ r.total }}</td>
            <td class="ok">{{ r.correct }}</td>
            <td class="ng">{{ r.wrong }}</td>
            <td>{{ r.rate }}%</td>
            <td>{{ r.avgReact }}s</td>
            <td class="score">{{ r.score }}</td>
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
import { t } from '../data/i18n.js'
import { loadHistory, clearHistory, formatTime } from '../utils/storage.js'

export default {
  name: 'HistoryScreen',
  props: ['lang'],
  data() { return { records: [], showConfirm: false } },
  methods: {
    t(k, p) { return t(this.lang, k, p) },
    formatDate(ts) { return formatTime(ts) },
    onClear() { this.showConfirm = true },
    doClear() { clearHistory(); this.records = []; this.showConfirm = false }
  },
  mounted() { this.records = loadHistory() }
}
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
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.15);
  z-index: 2;
}
.back-btn:hover { background: #fff8ec; }
.header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 3vmin;
  padding: 0 20vmin;
}
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
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 3vmin; color: #a58857;
  gap: 2vmin;
}
.empty-ico { font-size: 8vmin; opacity: .4; }
.table-wrap {
  flex: 1; overflow-y: auto;
  background: #fff;
  border-radius: 2vmin;
  border: 0.25vmin solid #b08b4f;
  box-shadow: 0 0.6vmin 2vmin rgba(122,90,44,.12);
}
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
  z-index: 1;
}
.records td { color: #444; }
.records tbody tr:hover { background: #fff8ec; }
.records .ok { color: #2b7a2b; font-weight: 700; }
.records .ng { color: #c22; font-weight: 700; }
.records .score { color: #d97742; font-weight: 800; font-size: 2.2vmin; }

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
.mini-btn:hover { background: #fff8ec; }
.mini-btn.danger { background: #d55; color: #fff; border-color: #b33; }
.mini-btn.danger:hover { background: #c22; }
</style>
