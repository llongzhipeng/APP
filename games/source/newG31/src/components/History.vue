<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <button class="close" @click="$emit('close')">×</button>
      <h2>📊 {{ t('history') }}</h2>
      <div v-if="!records.length" class="empty">🎼 {{ t('noHistory') }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('date') }}</th>
              <th>{{ t('project') }}</th>
              <th>{{ t('difficultyLevel') }}</th>
              <th>{{ t('duration') }}</th>
              <th>{{ t('totalRounds') }}</th>
              <th>{{ t('successCount') }}</th>
              <th>{{ t('failCount') }}</th>
              <th>{{ t('successRate') }}</th>
              <th>{{ t('avgTime') }}</th>
              <th>{{ t('score') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.ts">
              <td>{{ fmt(r.ts) }}</td>
              <td>{{ t('title') }}</td>
              <td>{{ r.maxLevel }}</td>
              <td>{{ Math.round(r.duration/60) }}min</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.success }}</td>
              <td class="bad">{{ r.fail }}</td>
              <td>{{ r.rate }}%</td>
              <td>{{ r.avgRt.toFixed(1) }}s</td>
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
import { loadHistory, formatDate } from '../game.js'
export default {
  name: 'History',
  props: { lang: String },
  data() { return { records: loadHistory() } },
  methods: {
    t(k) { return t(this.lang, k) },
    fmt(ts) { return formatDate(ts) }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,20,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: linear-gradient(160deg, #fff, #f2f6ff);
  border-radius: 24px;
  padding: 40px;
  width: 900px;
  max-width: 94vw;
  max-height: 88vh;
  overflow: auto;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  position: relative;
}
.close {
  position: absolute; top: 14px; right: 18px;
  background: none; border: none; font-size: 32px;
  cursor: pointer; color: #888;
}
h2 { color: #2b3f6a; font-size: 28px; margin-bottom: 20px; text-align: center; }
.empty { text-align: center; color: #888; padding: 60px 0; font-size: 20px; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th {
  background: #4dabf7;
  color: #fff;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
}
td { padding: 10px 6px; text-align: center; color: #333; border-bottom: 1px solid #eef2f8; }
tbody tr:hover { background: #f6f9ff; }
.ok { color: #37b24d; font-weight: 700; }
.bad { color: #e03131; font-weight: 700; }
.score { color: #ef476f; font-weight: 800; }
</style>
