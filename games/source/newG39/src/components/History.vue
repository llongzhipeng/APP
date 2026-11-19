<template>
  <div class="history">
    <div class="card panel">
      <div class="head">
        <button class="back" @click="$emit('back')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          {{ t('back') }}
        </button>
        <h2>{{ t('historyTitle') }}</h2>
        <button v-if="store.history.length" class="btn danger small" @click="askClear=true">
          {{ t('clear') }}
        </button>
        <span v-else></span>
      </div>

      <div v-if="!store.history.length" class="empty">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v4M16 4v4"/></svg>
        <p>{{ t('empty') }}</p>
      </div>

      <div v-else class="scroll list">
        <table>
          <thead>
            <tr>
              <th>{{ t('resultTime') }}</th>
              <th>{{ t('resultProject') }}</th>
              <th>{{ t('resultDifficulty') }}</th>
              <th>{{ t('resultDuration') }}</th>
              <th>{{ t('resultTotal') }}</th>
              <th>{{ t('resultSuccess') }}</th>
              <th>{{ t('resultFail') }}</th>
              <th>{{ t('resultRate') }}</th>
              <th>{{ t('resultAvg') }}</th>
              <th>{{ t('resultScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in store.history" :key="i">
              <td class="dim">{{ fmtDate(r.ts) }}</td>
              <td>{{ r.project }}</td>
              <td>Lv.{{ r.level }}</td>
              <td>{{ Math.round(r.duration/60) }} min</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.success }}</td>
              <td class="bad">{{ r.fail }}</td>
              <td>{{ (r.rate*100).toFixed(1) }}%</td>
              <td>{{ r.avgMs }} ms</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="fade">
      <div v-if="askClear" class="overlay" @click.self="askClear=false">
        <div class="card confirm-card">
          <p>{{ t('confirmClear') }}</p>
          <div class="confirm-actions">
            <button class="btn ghost" @click="askClear=false">{{ t('cancel') }}</button>
            <button class="btn danger" @click="doClear">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { store, actions, t } from '../store'
export default {
  data () { return { store, askClear: false } },
  computed: { t () { const _ = this.store.lang; return t } },
  methods: {
    fmtDate (ts) {
      const d = new Date(ts)
      const p = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    doClear () { actions.clearHistory(); this.askClear = false }
  }
}
</script>

<style scoped>
.history { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 4vmin; }
.panel { width: min(96vmin, 98vw); max-height: 90vh; padding: 3.5vmin 4vmin; display: flex; flex-direction: column; }
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.6vmin; gap: 1.2vmin; }
.head h2 { font-size: 3.4vmin; letter-spacing: .06em; }
.back { padding: 1.2vmin 2.2vmin; border-radius: 999px; color:#fff; background: rgba(255,255,255,.1); display: inline-flex; align-items: center; gap: .8vmin; font-size: 2vmin; font-weight: 700; }
.back:hover { background: rgba(255,255,255,.2); }
.back svg { width: 2.2vmin; height: 2.2vmin; }
.btn.small { padding: .8em 1.6em; font-size: 2vmin; font-weight: 800; }

.empty { text-align: center; padding: 8vmin 2vmin; color: #cbd5e1; }
.empty svg { width: 12vmin; height: 12vmin; }
.empty p { margin-top: 2vmin; font-size: 2.2vmin; letter-spacing: .1em; }

.list { flex: 1; overflow: auto; border-radius: 1.6vmin; border: 1px solid rgba(255,255,255,.08); }
table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
thead th {
  position: sticky; top: 0;
  background: rgba(15,25,40,.95);
  padding: 1.8vmin 1.4vmin; text-align: left;
  font-weight: 800; color: #e2e8f0; letter-spacing: .05em;
  border-bottom: 1px solid rgba(255,255,255,.14);
  white-space: nowrap;
  font-size: 1.7vmin;
}
tbody td { padding: 1.8vmin 1.4vmin; border-bottom: 1px solid rgba(255,255,255,.05); white-space: nowrap; }
tbody tr:hover { background: rgba(255,255,255,.04); }
.dim { color: #cbd5e1; }
.ok { color: #86efac; font-weight: 700; }
.bad { color: #fca5a5; font-weight: 700; }
.score { color: #fde68a; font-weight: 900; font-size: 2.2vmin; }

.confirm-card { padding: 4vmin 4.4vmin; width: min(50vmin, 94vw); text-align: center; }
.confirm-card p { color: #e2e8f0; margin-bottom: 3vmin; line-height: 1.6; font-size: 2.2vmin; }
.confirm-actions { display: flex; gap: 1.4vmin; }
.confirm-actions .btn { flex: 1; padding: 1.1em; font-size: 2vmin; }
</style>
