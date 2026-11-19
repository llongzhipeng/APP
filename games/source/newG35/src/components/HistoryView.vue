<template>
  <div class="hist-view">
    <div class="hist paper">
      <header class="hist-header">
        <button class="back-btn" @click="$emit('nav', { to: 'home' })">
          <span>←</span> {{ t('back') }}
        </button>
        <h2>{{ t('historyTitle') }}</h2>
        <button v-if="records.length" class="clear-btn" @click="askClear">
          🗑 {{ t('historyClear') }}
        </button>
        <span v-else class="hdr-spacer"></span>
      </header>

      <div v-if="!records.length" class="empty">
        <div class="empty-icon">📊</div>
        <div class="empty-text">{{ t('historyEmpty') }}</div>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('colTime') }}</th>
              <th>{{ t('colProject') }}</th>
              <th>{{ t('colFinalLv') }}</th>
              <th>{{ t('colDuration') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th>{{ t('colOk') }}</th>
              <th>{{ t('colFail') }}</th>
              <th>{{ t('colRate') }}</th>
              <th>{{ t('colAvg') }}</th>
              <th>{{ t('colScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ fmtTime(r.time) }}</td>
              <td>{{ t('projectName') }}</td>
              <td><span class="lv-chip">{{ r.finalLevel }}</span></td>
              <td>{{ fmtDur(r.duration) }}</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.correct }}</td>
              <td class="bad">{{ r.wrong }}</td>
              <td>{{ Math.round(r.rate * 100) }}%</td>
              <td>{{ (r.avgRT / 1000).toFixed(2) }}s</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="fade">
      <div v-if="confirming" class="confirm-overlay" @click.self="confirming = false">
        <div class="confirm paper">
          <p>{{ t('confirmClear') }}</p>
          <div class="confirm-actions">
            <button class="btn" @click="confirming = false">{{ t('cancel') }}</button>
            <button class="btn btn-danger" @click="doClear">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { loadHistory, clearHistory } from '../storage.js'
import { i18nMixin } from '../i18n.js'

export default {
  name: 'HistoryView',
  mixins: [i18nMixin],
  data() { return { records: loadHistory(), confirming: false } },
  methods: {
    fmtTime(iso) {
      const d = new Date(iso)
      const pad = (n) => (n < 10 ? '0' + n : '' + n)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    fmtDur(s) {
      const m = Math.floor(s / 60), r = s % 60
      return `${m}:${r < 10 ? '0' : ''}${r}`
    },
    askClear() { this.confirming = true },
    doClear() {
      clearHistory()
      this.records = []
      this.confirming = false
    },
  },
}
</script>

<style scoped>
.hist-view {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.hist {
  width: min(120vmin, 100%);
  max-height: 96%;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.hist-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2.8vmin 3.5vmin;
  border-bottom: 0.2vmin solid var(--c-line);
  background: var(--c-paper-soft);
  gap: 2vmin;
}
.hist-header h2 { font-size: 3.6vmin; font-weight: 700; color: var(--c-title); letter-spacing: 0.3vmin; }
.back-btn {
  padding: 1vmin 2vmin;
  background: var(--c-paper);
  border: 0.25vmin solid var(--c-line-2);
  border-radius: 3vmin;
  font-size: 2.2vmin;
  color: var(--c-brown);
  display: inline-flex; align-items: center; gap: 0.6vmin;
  box-shadow: var(--shadow-sm);
}
.back-btn:hover { background: var(--c-paper-soft); }
.clear-btn {
  padding: 1vmin 2vmin;
  background: var(--c-paper);
  border: 0.25vmin solid #d55;
  color: #c22;
  border-radius: 3vmin;
  font-size: 2vmin;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.clear-btn:hover { background: var(--c-err-bg); }
.hdr-spacer { display: inline-block; width: 12vmin; }

.empty {
  padding: 10vmin 4vmin;
  text-align: center;
  color: var(--c-brown-dim);
}
.empty-icon { font-size: 10vmin; opacity: .55; }
.empty-text { margin-top: 1.2vmin; font-size: 2.6vmin; }

.table-wrap {
  overflow: auto;
  padding: 2.5vmin 3vmin;
}
table { width: 100%; border-collapse: collapse; min-width: 90vmin; }
th, td {
  padding: 1.4vmin 1vmin;
  text-align: center;
  font-size: 2vmin;
  white-space: nowrap;
  border-bottom: 0.15vmin solid #eadfc4;
}
tbody tr:last-child td { border-bottom: none; }
thead th {
  position: sticky; top: 0;
  background: #efe3c8;
  color: var(--c-brown);
  font-weight: 700;
  letter-spacing: 0.1vmin;
}
tbody tr { transition: background .2s; }
tbody tr:hover { background: #fff2e0; }
tbody td { color: #4a3a26; }

.lv-chip {
  display: inline-block;
  min-width: 3vmin; padding: 0.3vmin 1.2vmin;
  border-radius: 3vmin;
  background: linear-gradient(135deg, var(--c-orange), var(--c-orange-dim));
  color: #fff; font-weight: 700;
}
.ok  { color: var(--c-ok-text); font-weight: 700; }
.bad { color: var(--c-err-text); font-weight: 700; }
.score { font-weight: 800; color: var(--c-title); }

.confirm-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(122,58,30,.25);
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.confirm {
  width: min(50vmin, 100%);
  padding: 4vmin;
  display: flex; flex-direction: column; gap: 2.5vmin;
  text-align: center;
}
.confirm p { font-size: 2.6vmin; color: var(--c-title); font-weight: 600; }
.confirm-actions { display: flex; gap: 2vmin; justify-content: center; }

.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
