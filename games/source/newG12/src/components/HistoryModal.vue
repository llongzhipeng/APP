<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <h2 class="modal-title">{{ t('historyTitle') }}</h2>

      <div v-if="records.length === 0" class="empty">{{ t('noHistory') }}</div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('colDate') }}</th>
              <th>{{ t('colProject') }}</th>
              <th>{{ t('colDifficulty') }}</th>
              <th>{{ t('colDuration') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th>{{ t('colSuccess') }}</th>
              <th>{{ t('colFail') }}</th>
              <th>{{ t('colRate') }}</th>
              <th>{{ t('colAvg') }}</th>
              <th>{{ t('colScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.time">
              <td :data-label="t('colDate')">{{ formatDate(r.time) }}</td>
              <td :data-label="t('colProject')">{{ t('projectName') }}</td>
              <td :data-label="t('colDifficulty')">{{ r.maxLevel }}</td>
              <td :data-label="t('colDuration')">{{ r.durationMin }}{{ t('minute') }}</td>
              <td :data-label="t('colTotal')">{{ r.total }}</td>
              <td :data-label="t('colSuccess')">{{ r.correct }}</td>
              <td :data-label="t('colFail')">{{ r.wrong }}</td>
              <td :data-label="t('colRate')">{{ r.accuracy }}%</td>
              <td :data-label="t('colAvg')">{{ r.avgRt }}{{ t('seconds') }}</td>
              <td :data-label="t('colScore')">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-actions">
        <button v-if="records.length" class="btn danger" @click="onClear">{{ t('clearHistory') }}</button>
        <button class="btn primary" @click="$emit('close')">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { loadHistory, clearHistory, formatDate } from '../store.js'

export default {
  name: 'HistoryModal',
  data() { return { records: loadHistory() } },
  methods: {
    t,
    formatDate,
    onClear() {
      if (window.confirm(t('confirmClear'))) {
        clearHistory()
        this.records = []
      }
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  width: min(120vmin, 95vw);
  max-height: 90vh;
  background: white;
  border-radius: 3vmin;
  padding: 4vmin;
  display: flex; flex-direction: column; gap: 2vmin;
}
.modal-title {
  font-size: 4vmin;
  color: #4f46e5;
  text-align: center;
}
.empty {
  text-align: center;
  padding: 6vmin;
  color: #94a3b8;
  font-size: 2.6vmin;
}
.table-wrap {
  overflow: auto;
  max-height: 60vh;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 2vmin;
}
th, td {
  border: 0.15vmin solid #e2e8f0;
  padding: 1vmin;
  text-align: center;
  white-space: nowrap;
}
th {
  background: #f1f5f9;
  color: #334155;
  position: sticky;
  top: 0;
}
tbody tr:nth-child(even) { background: #f8fafc; }

.modal-actions {
  display: flex;
  gap: 2vmin;
  justify-content: center;
}
.btn {
  padding: 1.4vmin 5vmin;
  border-radius: 3vmin;
  border: none;
  font-size: 2.4vmin;
  cursor: pointer;
}
.btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
}
.btn.danger {
  background: #fee2e2;
  color: #dc2626;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .modal {
    width: 94vw;
    max-height: 90vh;
    padding: 5vmin 4vmin calc(4vmin + env(safe-area-inset-bottom));
    padding-top: calc(5vmin + env(safe-area-inset-top));
    border-radius: 4vmin;
    gap: 3vmin;
  }
  .modal-title { font-size: max(5.5vmin, 20px); }
  .empty { font-size: max(3.6vmin, 15px); padding: 8vmin 2vmin; }

  .table-wrap { max-height: 65vh; overflow: auto; }
  /* Convert wide table into stacked cards */
  table, thead, tbody, tr, td { display: block; width: 100%; }
  thead { display: none; }
  tr {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 3vmin;
    padding: 3vmin;
    margin-bottom: 3vmin;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5vmin 2vmin;
  }
  tbody tr:nth-child(even) { background: #f8fafc; }
  td {
    border: none;
    padding: 0.5vmin 0;
    text-align: left;
    white-space: normal;
    font-size: max(3.2vmin, 13px);
    color: #334155;
  }
  td::before {
    content: attr(data-label);
    display: block;
    font-size: max(2.6vmin, 11px);
    color: #94a3b8;
    margin-bottom: 0.4vmin;
  }

  .modal-actions { gap: 3vmin; flex-wrap: wrap; }
  .btn {
    padding: 2.4vmin 6vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 4vmin;
  }
}
</style>
