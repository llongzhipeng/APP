<template>
  <div class="history-page">
    <button class="back-btn" @click="$emit('back')">← {{ t.back }}</button>
    <div class="history-box">
      <h2 class="history-title">{{ t.historyTitle }}</h2>
      <div v-if="records.length === 0" class="no-data">{{ t.noHistory }}</div>
      <div v-else class="table-wrap">
        <table class="history-table">
          <thead>
            <tr><th v-for="h in t.historyHeaders" :key="h">{{ h }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ r.date }}</td>
              <td>{{ r.project }}</td>
              <td>{{ r.difficulty }}</td>
              <td>{{ r.duration }}s</td>
              <td>{{ r.total }}</td>
              <td>{{ r.success }}</td>
              <td>{{ r.fail }}</td>
              <td>{{ r.rate }}%</td>
              <td>{{ r.avgTime }}ms</td>
              <td>{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryPage',
  props: { t: Object },
  emits: ['back'],
  data() {
    return { records: JSON.parse(localStorage.getItem('fishLinkHistory') || '[]') }
  },
}
</script>

<style scoped>
.history-page {
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.back-btn {
  position: absolute; top: 20px; left: 20px;
  background: rgba(0,0,0,0.55); border: 2px solid rgba(0,0,0,0.3);
  color: #fff; padding: 8px 18px; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer; backdrop-filter: blur(4px);
}
.back-btn:hover { background: rgba(0,0,0,0.75); }
.history-box {
  background: rgba(0,30,60,0.8); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 20px;
  padding: 36px 40px; width: 92%; max-height: 80vh; display: flex; flex-direction: column;
  color: #fff;
}
.history-title { font-size: 26px; font-weight: 800; margin-bottom: 20px; text-align: center; color: #7ee8fa; }
.no-data { text-align: center; color: rgba(255,255,255,0.5); font-size: 16px; padding: 40px 0; }
.table-wrap { overflow-y: auto; flex: 1; }
.history-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.history-table th, .history-table td {
  padding: 8px 10px; text-align: center;
  border: 1px solid rgba(255,255,255,0.12);
}
.history-table th { background: rgba(0,180,255,0.2); font-weight: 700; position: sticky; top: 0; }
.history-table tr:nth-child(even) td { background: rgba(255,255,255,0.04); }
</style>
