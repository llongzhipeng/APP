<template>
  <div class="history">
    <div class="card">
      <h2>{{ t.historyTitle }}</h2>
      <div v-if="!records.length" class="empty">{{ t.noHistory }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.colTime }}</th>
              <th>{{ t.colProject }}</th>
              <th>{{ t.colDifficulty }}</th>
              <th>{{ t.colDuration }}</th>
              <th>{{ t.colTotal }}</th>
              <th>{{ t.colSuccess }}</th>
              <th>{{ t.colFail }}</th>
              <th>{{ t.colRate }}</th>
              <th>{{ t.colAvgTime }}</th>
              <th>{{ t.colScore }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td :data-label="t.colTime">{{ r.time }}</td>
              <td :data-label="t.colProject">{{ t.projectName }}</td>
              <td :data-label="t.colDifficulty">{{ r.finalDifficulty }}</td>
              <td :data-label="t.colDuration">{{ r.duration }}</td>
              <td :data-label="t.colTotal">{{ r.total }}</td>
              <td :data-label="t.colSuccess">{{ r.success }}</td>
              <td :data-label="t.colFail">{{ r.fail }}</td>
              <td :data-label="t.colRate">{{ r.rate }}%</td>
              <td :data-label="t.colAvgTime">{{ r.avgReaction }}s</td>
              <td :data-label="t.colScore">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="back-btn" @click="$emit('nav', 'home')">← {{ t.back }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryView',
  props: ['t'],
  data() { return { records: [] } },
  mounted() {
    try {
      const data = localStorage.getItem('g20_history')
      if (data) this.records = JSON.parse(data).slice().reverse()
    } catch (e) {}
  }
}
</script>

<style scoped>
.history {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
  background: linear-gradient(135deg, #87ceeb 0%, #98d8e8 50%, #b8e6c9 100%);
  overflow: auto;
}
.card {
  background: #fff;
  border-radius: 3vmin;
  padding: 4vmin;
  max-width: 95vw;
  width: 140vmin;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.15);
}
h2 { text-align: center; color: #2c3e50; margin-bottom: 3vmin; font-size: 3.6vmin; }
.empty { text-align: center; padding: 6vmin; color: #999; font-size: 2.4vmin; }
.table-wrap { overflow-x: auto; margin-bottom: 3vmin; max-height: 60vh; }
table { width: 100%; border-collapse: collapse; font-size: 1.9vmin; }
th, td { padding: 1.2vmin 1vmin; text-align: center; border-bottom: 0.2vmin solid #e0e0e0; white-space: nowrap; }
th { background: #f5f7fa; color: #2c3e50; font-weight: 700; position: sticky; top: 0; }
tr:hover { background: #fafbfc; }
.back-btn {
  display: block;
  margin: 0 auto;
  padding: 1.4vmin 3vmin;
  border: none;
  background: #4a90e2;
  color: #fff;
  border-radius: 999px;
  font-size: 2.3vmin;
  cursor: pointer;
  font-weight: 600;
  min-width: 18vmin;
  box-shadow: 0 0.6vmin 1.5vmin rgba(74,144,226,0.3);
}
.back-btn:hover { background: #357abd; }

@media (orientation: portrait) {
  .history {
    padding: 3vmin;
    padding-top: calc(3vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
    align-items: flex-start;
  }
  .card {
    padding: 4vmin 3vmin;
    width: 94vw;
    max-width: 94vw;
    border-radius: 3vmin;
  }
  h2 { font-size: max(5vmin, 20px); margin-bottom: 3vmin; }
  .empty { font-size: max(3.6vmin, 15px); padding: 8vmin 2vmin; }
  .table-wrap { max-height: 65vh; overflow-y: auto; overflow-x: hidden; }
  table thead { display: none; }
  table, tbody, tr, td { display: block; width: 100%; }
  tr {
    background: #f9fbfd;
    border-radius: 2vmin;
    padding: 2vmin 2.5vmin;
    margin-bottom: 2vmin;
    box-shadow: 0 0.6vmin 1.6vmin rgba(0,0,0,0.06);
  }
  tr:hover { background: #f9fbfd; }
  td {
    border-bottom: 0.15vmin solid #eef2f5;
    padding: 1.2vmin 0;
    text-align: left;
    white-space: normal;
    font-size: max(3.2vmin, 13px);
    display: flex;
    justify-content: space-between;
    gap: 2vmin;
  }
  td:last-child { border-bottom: none; }
  td::before {
    content: attr(data-label);
    color: #7f8c8d;
    font-weight: 600;
    flex-shrink: 0;
  }
  .back-btn {
    font-size: max(3.8vmin, 16px);
    padding: 2.4vmin 4vmin;
    min-width: 60vw;
    border-radius: 2.8vmin;
  }
}
</style>
