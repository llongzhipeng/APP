<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2>{{ t('historyTitle') }}</h2>
      <button class="btn btn-secondary" @click="$emit('back')">← {{ t('backBtn') }}</button>
    </div>

    <div v-if="records.length === 0" class="empty">{{ t('noHistory') }}</div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('col_time') }}</th>
            <th>{{ t('col_diff') }}</th>
            <th>{{ t('col_dur') }}</th>
            <th>{{ t('col_total') }}</th>
            <th>{{ t('col_success') }}</th>
            <th>{{ t('col_fail') }}</th>
            <th>{{ t('col_rate') }}</th>
            <th>{{ t('col_avg') }}</th>
            <th>{{ t('col_score') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in records" :key="i">
            <td>{{ r.time }}</td>
            <td>Lv.{{ r.difficulty }}</td>
            <td>{{ r.duration }}s</td>
            <td>{{ r.total }}</td>
            <td class="success-cell">{{ r.success }}</td>
            <td class="fail-cell">{{ r.failure }}</td>
            <td>{{ r.rate }}</td>
            <td>{{ r.avgReaction }}</td>
            <td class="score-cell">{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game10HistoryPage'
};
</script>

<script setup>
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n.js'

const props = defineProps({ lang: String })
defineEmits(['back'])
const t = useI18n(() => props.lang)

const records = ref(JSON.parse(localStorage.getItem('mazeHistory') || '[]'))
</script>

<style scoped>
.page-wrap {
  width: 100vw; height: 100vh;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2vh, 20px);
  padding: clamp(12px, 2.5vw, 28px);
  overflow: hidden;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-header h2 {
  font-size: clamp(16px, 3vmin, 28px);
  color: #4A90E2;
  font-weight: 700;
}
.empty {
  text-align: center;
  color: #666;
  font-size: clamp(14px, 2.5vmin, 22px);
  margin-top: 10vh;
}
.table-wrap {
  flex: 1;
  overflow: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(11px, 1.7vmin, 15px);
}
th, td {
  padding: clamp(6px,1vh,12px) clamp(8px,1.2vw,14px);
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
}
th { color: #666; background: #f8f9fa; position: sticky; top: 0; }
td { color: #333; }
tr:hover td { background: #f0f0f0; }
.success-cell { color: #81C784; }
.fail-cell    { color: #EF9A9A; }
.score-cell   { color: #FFB74D; font-weight: 700; }
</style>
