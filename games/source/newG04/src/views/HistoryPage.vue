<template>
  <div class="history-wrap">
    <div class="header">
      <h2>{{ T.historyTitle }}</h2>
      <button class="btn-back" @click="$emit('back')">{{ T.back }}</button>
    </div>
    <div class="table-wrap">
      <p v-if="!records.length" class="empty">{{ T.historyEmpty }}</p>
      <table v-else class="hist-table">
        <thead>
          <tr><th v-for="h in T.histCols" :key="h">{{ h }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r,i) in records" :key="i">
            <td :data-label="T.histCols[0]">{{ r.date }}</td>
            <td :data-label="T.histCols[1]">{{ r.difficulty }}</td>
            <td :data-label="T.histCols[2]">{{ r.duration }}{{ lang==='zh'?'分钟':'min' }}</td>
            <td :data-label="T.histCols[3]">{{ r.total }}</td>
            <td class="green" :data-label="T.histCols[4]">{{ r.success }}</td>
            <td class="red" :data-label="T.histCols[5]">{{ r.fail }}</td>
            <td :data-label="T.histCols[6]">{{ r.successRate }}</td>
            <td :data-label="T.histCols[7]">{{ r.avgReaction }}</td>
            <td class="gold" :data-label="T.histCols[8]">{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { getRecords } from '../gameConfig.js'
export default {
  props: ['lang'],
  computed: {
    T() { return t[this.lang] },
    records() { return getRecords() },
  },
}
</script>

<style scoped>
.history-wrap { width:100%; height:100%; display:flex; flex-direction:column; padding:2vmin; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2vmin; }
h2 { font-size:3.5vmin; color:#7eb8f7; font-weight:700; }
.btn-back {
  background:rgba(255,255,255,.1); color:#c5d8f5;
  padding:1vmin 3vmin; border-radius:1.2vmin; font-size:2vmin;
}
.btn-back:hover { background:rgba(255,255,255,.18); }
.table-wrap { flex:1; overflow-y:auto; }
.empty { text-align:center; color:#7a9abc; font-size:2.5vmin; margin-top:10vmin; }
.hist-table { width:100%; border-collapse:collapse; font-size:1.6vmin; }
.hist-table th, .hist-table td { border:1px solid #2a3f6f; padding:1vmin 1.2vmin; text-align:center; }
.hist-table th { background:#1e2f5a; color:#7eb8f7; position:sticky; top:0; }
.hist-table td { color:#c5d8f5; }
.hist-table tr:nth-child(even) td { background:rgba(255,255,255,.03); }
.green { color:#2ecc71 !important; }
.red { color:#e74c3c !important; }
.gold { color:#f1c40f !important; font-weight:700; }

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .history-wrap {
    padding: 3vw;
    padding-top: calc(3vw + env(safe-area-inset-top));
    padding-bottom: calc(3vw + env(safe-area-inset-bottom));
  }
  .header { margin-bottom: 4vw; gap: 3vw; }
  h2 { font-size: max(6vw, 22px); }
  .btn-back {
    padding: max(2.4vw, 10px) max(5vw, 20px);
    border-radius: 3vw;
    font-size: max(4vw, 16px);
  }
  .empty { font-size: max(4.4vw, 17px); margin-top: 12vw; }

  /* Convert wide table into stacked cards */
  .hist-table, .hist-table thead, .hist-table tbody,
  .hist-table tr, .hist-table th, .hist-table td { display: block; }
  .hist-table thead { display: none; }
  .hist-table tr {
    background: rgba(255,255,255,.04);
    border: 1px solid #2a3f6f;
    border-radius: 3vw;
    margin-bottom: 3vw;
    padding: 3vw 4vw;
  }
  .hist-table tr:nth-child(even) td { background: transparent; }
  .hist-table td {
    border: none;
    padding: 1.4vw 0;
    text-align: left;
    font-size: max(3.8vw, 14px);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .hist-table td::before {
    content: attr(data-label);
    color: #7a9abc;
    font-weight: 600;
    margin-right: 3vw;
  }
}
</style>
