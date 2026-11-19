<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <h2 class="modal-title">{{ t.historyTitle }}</h2>

      <div v-if="records.length === 0" class="empty">{{ t.historyEmpty }}</div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.historyDate }}</th>
              <th>{{ t.historyProject }}</th>
              <th>{{ t.historyMaxDiff }}</th>
              <th>{{ t.historyDuration }}</th>
              <th>{{ t.historyTotal }}</th>
              <th>{{ t.historySuccess }}</th>
              <th>{{ t.historyFail }}</th>
              <th>{{ t.historySuccessRate }}</th>
              <th>{{ t.historyAvgReaction }}</th>
              <th>{{ t.historyScore }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td class="td-date" :data-label="t.historyDate">{{ r.date }}</td>
              <td :data-label="t.historyProject">{{ r.project }}</td>
              <td :data-label="t.historyMaxDiff"><span class="badge-level">Lv.{{ r.maxDifficulty }}</span></td>
              <td :data-label="t.historyDuration">{{ formatDuration(r.duration) }}</td>
              <td :data-label="t.historyTotal">{{ r.totalQuestions }}</td>
              <td class="td-correct" :data-label="t.historySuccess">{{ r.totalCorrect }}</td>
              <td class="td-wrong" :data-label="t.historyFail">{{ r.failCount }}</td>
              <td :data-label="t.historySuccessRate">
                <span class="rate-badge" :class="rateClass(r.successRate)">
                  {{ r.successRate }}
                </span>
              </td>
              <td :data-label="t.historyAvgReaction">{{ r.avgReactionTime }}s</td>
              <td class="td-score" :data-label="t.historyScore">{{ r.finalScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-footer">
        <button v-if="records.length > 0" class="btn-clear" @click="onClear">{{ t.historyClear }}</button>
        <button class="btn-close" @click="$emit('close')">{{ t.close }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getHistory, clearHistory } from '../gameConfig.js'

export default {
  name: 'HistoryModal',
  props: {
    t: { type: Object, required: true }
  },
  emits: ['close'],
  data() {
    return { records: getHistory() }
  },
  methods: {
    formatDuration(seconds) {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return m > 0
        ? `${m}${this.t.historyMin}${s > 0 ? s + this.t.historySec : ''}`
        : `${s}${this.t.historySec}`
    },
    rateClass(rate) {
      const n = parseFloat(rate)
      if (n >= 90) return 'rate-high'
      if (n >= 70) return 'rate-mid'
      return 'rate-low'
    },
    onClear() {
      clearHistory()
      this.records = []
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(0.3rem);
}

.modal-box {
  background: linear-gradient(135deg, #141830, #1e2040);
  border: 0.1rem solid rgba(0, 212, 255, 0.3);
  border-radius: 1rem;
  padding: 1.5rem 1.8rem;
  width: min(96vw, 60rem);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-title {
  color: #00d4ff;
  font-size: 1.2rem;
  text-align: center;
  margin: 0;
  flex-shrink: 0;
}

.empty {
  color: rgba(255,255,255,0.4);
  text-align: center;
  font-size: 0.9rem;
  padding: 2.5rem 0;
}

.table-wrap { overflow: auto; flex: 1; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  color: #e0e8ff;
  white-space: nowrap;
}

th {
  background: rgba(0, 212, 255, 0.12);
  color: #00d4ff;
  padding: 0.5rem 0.65rem;
  text-align: center;
  font-weight: 600;
  position: sticky;
  top: 0;
}

td {
  padding: 0.42rem 0.65rem;
  text-align: center;
  border-bottom: 0.05rem solid rgba(255,255,255,0.06);
}

tr:last-child td { border-bottom: none; }
tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
tr:hover td { background: rgba(0,212,255,0.06); }

.td-date { color: rgba(255,255,255,0.5); font-size: 0.72rem; text-align: left; }
.td-correct { color: #4ade80; font-weight: 600; }
.td-wrong { color: #f87171; font-weight: 600; }
.td-score { color: #00d4ff; font-weight: 700; }

.badge-level {
  background: rgba(167,139,250,0.15);
  border: 0.06rem solid rgba(167,139,250,0.35);
  color: #a78bfa;
  border-radius: 0.3rem;
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.rate-badge {
  border-radius: 2rem;
  padding: 0.1rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 600;
}
.rate-high { background: rgba(74,222,128,0.15); color: #4ade80; }
.rate-mid  { background: rgba(251,191,36,0.15);  color: #fbbf24; }
.rate-low  { background: rgba(248,113,113,0.15); color: #f87171; }

.modal-footer {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex-shrink: 0;
}

.btn-close {
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}
.btn-close:hover { opacity: 0.85; }

.btn-clear {
  background: rgba(255,60,60,0.12);
  color: #ff6060;
  border: 0.1rem solid rgba(255,60,60,0.3);
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-clear:hover { background: rgba(255,60,60,0.25); }

@media (orientation: portrait) {
  .modal-box {
    width: 94vw;
    max-height: 90vh;
    padding: 1.4rem 1rem;
    padding-top: calc(1.4rem + env(safe-area-inset-top));
    padding-bottom: calc(1.4rem + env(safe-area-inset-bottom));
    border-radius: 1.2rem;
  }
  .modal-title { font-size: max(4.8vmin, 18px); }
  .empty { font-size: max(3.6vmin, 14px); }
  /* Card-style rows */
  .table-wrap { overflow-x: visible; overflow-y: auto; }
  table, thead, tbody, tr, td { display: block; width: 100%; white-space: normal; }
  thead { display: none; }
  tr {
    background: rgba(255,255,255,0.04);
    border: 0.1rem solid rgba(0,212,255,0.18);
    border-radius: 0.8rem;
    padding: 0.7rem 0.9rem;
    margin-bottom: 0.7rem;
  }
  tr:nth-child(even) td { background: transparent; }
  td {
    border-bottom: 0.05rem dashed rgba(255,255,255,0.08);
    padding: 0.35rem 0;
    text-align: left;
    font-size: max(3.3vmin, 13px);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  tr td:last-child { border-bottom: none; }
  td::before {
    content: attr(data-label);
    color: rgba(0,212,255,0.75);
    font-weight: 600;
    margin-right: 0.6rem;
  }
  .td-date { font-size: max(3vmin, 12px); text-align: left; }
  .modal-footer { flex-direction: column-reverse; gap: 0.7rem; }
  .btn-close, .btn-clear {
    width: 100%;
    padding: 0.9rem;
    font-size: max(4vmin, 15px);
    border-radius: 0.7rem;
  }
}
</style>
