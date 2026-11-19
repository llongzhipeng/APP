<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal card hist-modal">
      <div class="modal-head">
        <h2>{{ t('historyTitle') }}</h2>
        <div class="row gap-1">
          <button class="btn btn-ghost" @click="onClear" v-if="records.length">
            {{ t('clearHistory') }}
          </button>
          <button class="btn btn-ghost" @click="$emit('close')">{{ t('close') }}</button>
        </div>
      </div>

      <div v-if="!records.length" class="empty">
        <div class="empty-ico">▤</div>
        <div>{{ t('noHistory') }}</div>
      </div>

      <div v-else class="table-wrap">
        <table class="hist-table">
          <thead>
            <tr>
              <th>{{ t('colDate') }}</th>
              <th>{{ t('colName') }}</th>
              <th>{{ t('colLevel') }}</th>
              <th>{{ t('colDuration') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th>{{ t('colSuccess') }}</th>
              <th>{{ t('colFail') }}</th>
              <th>{{ t('colRate') }}</th>
              <th>{{ t('colAvgRt') }}</th>
              <th>{{ t('colScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.id">
              <td>{{ fmtDate(r.date) }}</td>
              <td>{{ t('appTitle') }}</td>
              <td><span class="lvl-badge">{{ r.maxLevel }}</span></td>
              <td>{{ (r.duration/60).toFixed(0) }} {{ t('unit_min') }}</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.success }}</td>
              <td class="bad">{{ r.fail }}</td>
              <td>{{ (r.total ? (r.success/r.total*100) : 0).toFixed(1) }}%</td>
              <td>{{ r.avgRt.toFixed(0) }} {{ t('unit_ms') }}</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { loadHistory, clearHistory } from '../history.js'
import { t, i18nMixin } from '../i18n.js'
export default {
  mixins: [i18nMixin],
  data() { return { records: loadHistory() } },
  methods: {
    fmtDate(d) {
      const dt = new Date(d)
      const pad = n => String(n).padStart(2, '0')
      return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    },
    onClear() {
      if (confirm(t('clearConfirm'))) { clearHistory(); this.records = [] }
    }
  }
}
</script>

<style scoped>
.hist-modal { width: min(96vw, 1000px); }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.modal-head h2 { font-size: 1.5rem; font-weight: 700; }
.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ink-dim);
}
.empty-ico { font-size: 3rem; opacity: .5; margin-bottom: .5rem; }
.table-wrap { overflow: auto; max-height: 65vh; }
.hist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .95rem;
  min-width: 720px;
}
.hist-table th, .hist-table td {
  padding: .7em .8em;
  text-align: center;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.hist-table th {
  color: var(--ink-dim);
  font-weight: 600;
  letter-spacing: .05em;
  position: sticky; top: 0;
  background: rgba(15, 23, 48, 0.85);
  backdrop-filter: blur(6px);
}
.hist-table td.ok { color: var(--good); font-weight: 600; }
.hist-table td.bad { color: var(--bad); font-weight: 600; }
.hist-table td.score { color: var(--accent); font-weight: 700; }
.lvl-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.8em; height: 1.8em; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #2a1a05; font-weight: 700;
}
</style>
