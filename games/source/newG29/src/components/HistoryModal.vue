<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal wide">
      <div class="modal-title">{{ t('historyTitle') }}</div>
      <div v-if="!records.length" class="empty">{{ t('noHistory') }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr><th v-for="(c,i) in t('columns')" :key="i">{{ c }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ fmtDate(r.date) }}</td>
              <td>{{ t('title') }}</td>
              <td>Lv{{ r.level }}</td>
              <td>{{ Math.round(r.duration/60) }}{{ t('minutes') }}</td>
              <td>{{ r.total }}</td>
              <td>{{ r.correct }}</td>
              <td>{{ r.wrong }}</td>
              <td>{{ (r.accuracy*100).toFixed(0) }}%</td>
              <td>{{ (r.avgReactionMs/1000).toFixed(2) }}{{ t('seconds') }}</td>
              <td class="score-cell">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn primary" @click="$emit('close')">{{ t('close') }}</button>
    </div>
  </div>
</template>
<script>
import { t, store } from '../i18n'
export default {
  name: 'HistoryModal',
  computed: { records () { return store.history } },
  methods: {
    t,
    fmtDate (iso) {
      const d = new Date(iso)
      const pad = n => (n < 10 ? '0' : '') + n
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
  },
}
</script>
<style scoped>
@import './modal.css';
.modal.wide { max-width: min(110vmin, 96vw); }
.empty { text-align: center; padding: 6vh 0; color: rgba(200, 220, 240, 0.55); font-size: 2vmin; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; color: #e6efff; font-size: 1.7vmin; }
th, td { padding: 1.1vmin 1.2vmin; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
th { color: rgba(200, 220, 240, 0.7); font-weight: 500; font-size: 1.4vmin; text-transform: uppercase; letter-spacing: 0.12vmin; }
tr:hover td { background: rgba(255,255,255,0.03); }
.score-cell { color: #7cd9a4; font-weight: 600; }
</style>
