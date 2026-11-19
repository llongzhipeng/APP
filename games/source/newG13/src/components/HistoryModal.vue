<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t('historyTitle') }}</h2>
        <div class="header-actions">
          <button v-if="records.length" class="clear-btn" @click="handleClear">{{ t('clearHistory') }}</button>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
      </div>
      <div class="modal-body">
        <p v-if="!records.length" class="empty">{{ t('noHistory') }}</p>
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
                <th>{{ t('colAvgTime') }}</th>
                <th>{{ t('colScore') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in records" :key="i">
                <td :data-label="t('colDate')">{{ r.date }}</td>
                <td :data-label="t('colProject')">{{ t('projectName') }}</td>
                <td :data-label="t('colDifficulty')"><span class="lvtag">Lv{{ r.maxDifficulty }}</span></td>
                <td :data-label="t('colDuration')">{{ formatDur(r.duration) }}</td>
                <td :data-label="t('colTotal')">{{ r.totalCount }}</td>
                <td class="ok" :data-label="t('colSuccess')">{{ r.correctCount }}</td>
                <td class="bad" :data-label="t('colFail')">{{ r.wrongCount }}</td>
                <td :data-label="t('colRate')">{{ r.successRate }}%</td>
                <td :data-label="t('colAvgTime')">{{ r.avgReactionTime }}{{ t('seconds') }}</td>
                <td class="score" :data-label="t('colScore')">{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadHistory, clearHistory } from '../gameLogic.js';

export default {
  name: 'HistoryModal',
  props: { t: { type: Function, required: true } },
  data() {
    return { records: loadHistory() };
  },
  methods: {
    formatDur(sec) {
      if (sec >= 60 && sec % 60 === 0) return `${sec / 60}${this.t('minutes')}`;
      return `${sec}${this.t('seconds')}`;
    },
    handleClear() {
      if (confirm(this.t('confirmClear'))) {
        clearHistory();
        this.records = [];
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #fff 60%, #fff6e5);
  border: 0.3vmin solid #ff8c1a;
  border-radius: 2vmin;
  width: min(120vmin, 96vw); max-height: 88vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.4);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2vmin 3vmin;
  border-bottom: 0.15vmin solid rgba(255,140,26,0.3);
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  flex-shrink: 0;
}
.modal-header h2 { color: #fff; font-size: 2.6vmin; font-weight: 800; }
.header-actions { display: flex; gap: 1.5vmin; align-items: center; }
.clear-btn {
  background: rgba(255,255,255,0.9);
  border: none;
  color: #ff8c1a;
  padding: 0.8vmin 1.8vmin;
  border-radius: 999px;
  font-size: 1.7vmin;
  font-weight: 700;
  cursor: pointer;
}
.close-btn {
  background: rgba(255,255,255,0.25); border: none;
  color: #fff; font-size: 2.5vmin;
  cursor: pointer;
  padding: 0.3vmin 1.2vmin;
  border-radius: 999px;
  transition: background 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.45); }
.modal-body { overflow: auto; padding: 2.5vmin 3vmin; }
.empty { text-align: center; color: #888; font-size: 2.2vmin; padding: 6vmin 0; }
.table-wrap { overflow-x: auto; }
table {
  width: 100%; border-collapse: collapse;
  background: #fff;
  border-radius: 1vmin; overflow: hidden;
  font-size: 1.6vmin;
}
th { background: #ff8c1a; color: #fff; padding: 1.2vmin 1vmin; text-align: center; font-weight: 700; white-space: nowrap; }
td { padding: 1.2vmin 1vmin; text-align: center; color: #444; border-bottom: 0.1vmin solid #eee; white-space: nowrap; }
tr:hover td { background: #fff6e5; }
.lvtag {
  display: inline-block;
  padding: 0.2vmin 1vmin;
  background: #ffe6c2;
  color: #ff8c1a;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.5vmin;
}
.ok { color: #4caf50; font-weight: 700; }
.bad { color: #f44336; font-weight: 700; }
.score { color: #ff8c1a; font-weight: 800; }

@media (orientation: portrait) {
  .modal-overlay {
    padding-top: calc(2vmin + env(safe-area-inset-top));
    padding-bottom: calc(2vmin + env(safe-area-inset-bottom));
  }
  .modal-box {
    width: 94vw;
    max-height: 90vh;
    border-radius: 3vmin;
  }
  .modal-header { padding: 2.5vmin 3.5vmin; }
  .modal-header h2 { font-size: max(4.4vmin, 17px); }
  .clear-btn {
    font-size: max(3.2vmin, 13px);
    padding: 1.2vmin 2.4vmin;
  }
  .close-btn {
    font-size: max(4.4vmin, 17px);
    padding: 0.6vmin 2vmin;
  }
  .modal-body { padding: 3vmin; }
  .empty { font-size: max(4vmin, 16px); }

  /* table → cards */
  table thead { display: none; }
  table, tbody, tr, td {
    display: block;
    width: 100%;
  }
  table {
    background: transparent;
    border-radius: 0;
  }
  tr {
    background: #fff;
    border-radius: 2vmin;
    padding: 2vmin 2.4vmin;
    margin-bottom: 2vmin;
    box-shadow: 0 0.6vmin 1.6vmin rgba(0,0,0,0.08);
  }
  tr:hover td { background: transparent; }
  td {
    text-align: left;
    padding: 0.8vmin 0;
    border-bottom: none;
    white-space: normal;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: max(3.4vmin, 14px);
  }
  td::before {
    content: attr(data-label);
    color: #888;
    font-weight: 700;
    font-size: max(3vmin, 12px);
    margin-right: 2vmin;
  }
  .lvtag {
    padding: 0.6vmin 2vmin;
    font-size: max(3.2vmin, 13px);
  }
}
</style>
