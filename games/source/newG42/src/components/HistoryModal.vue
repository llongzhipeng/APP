<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal" style="width: min(94vw, calc(var(--u) * 96));">
      <div class="modal-header">
        <div class="modal-title">{{ t('historyTitle') }}</div>
        <div class="row gap-1">
          <button v-if="records.length" class="btn btn-danger-ghost btn-sm" @click="doClear">{{ t('clearHistory') }}</button>
          <button class="icon-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="modal-body">
        <div v-if="!records.length" class="empty">
          <div class="empty-line"></div>
          <p>{{ t('historyEmpty') }}</p>
          <div class="empty-line"></div>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>{{ t('thTime') }}</th>
              <th>{{ t('thProject') }}</th>
              <th>{{ t('thLevel') }}</th>
              <th>{{ t('thDuration') }}</th>
              <th>{{ t('thTotal') }}</th>
              <th>{{ t('thSuccess') }}</th>
              <th>{{ t('thFail') }}</th>
              <th>{{ t('thRate') }}</th>
              <th>{{ t('thReact') }}</th>
              <th>{{ t('thScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.time">
              <td>{{ formatTime(r.time) }}</td>
              <td>{{ t('projectName') }}</td>
              <td><span class="rn">{{ roman[r.level-1] }}</span></td>
              <td>{{ formatDur(r.duration) }}</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.correct }}</td>
              <td class="bad">{{ r.wrong }}</td>
              <td>{{ r.total ? Math.round((r.correct/r.total)*100) : 0 }}%</td>
              <td>{{ r.avgReact ? r.avgReact.toFixed(2) : '-' }}s</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { loadHistory, clearHistory } from '../utils/storage.js'

export default {
  name: 'HistoryModal',
  data() { return { records: loadHistory(), roman: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ'] } },
  methods: {
    t,
    formatTime(ts) {
      const d = new Date(ts)
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    formatDur(s) {
      const m = Math.floor(s / 60); const sec = s % 60
      return `${m}:${String(sec).padStart(2,'0')}`
    },
    doClear() {
      if (confirm(t('confirmClear'))) { clearHistory(); this.records = [] }
    }
  }
}
</script>

<style scoped>
.empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: calc(var(--u) * 5) 0;
  color: var(--ink-3);
  gap: calc(var(--u) * 2);
  font-size: calc(var(--u) * 1.25);
}
.empty-line { width: calc(var(--u) * 4); height: 1px; background: var(--line-2); }
.rn { font-family: var(--font-serif); color: var(--accent); font-size: calc(var(--u) * 1.4); letter-spacing: 0.05em; }
.ok { color: var(--ok); }
.bad { color: var(--bad); }
.score { color: var(--accent); font-weight: 500; }
</style>
