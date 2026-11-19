<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2 class="modal-title">{{ t.historyTitle }}</h2>
      <div v-if="history.length === 0" class="no-data">{{ t.noHistory }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.trainTime }}</th>
              <th>{{ t.level }}</th>
              <th>{{ t.duration }}</th>
              <th>{{ t.total }}</th>
              <th>{{ t.success }}</th>
              <th>{{ t.fail }}</th>
              <th>{{ t.rate }}</th>
              <th>{{ t.avgReaction }}</th>
              <th>{{ t.scoreCol }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in history" :key="i">
              <td>{{ r.trainTime }}</td>
              <td>Lv.{{ r.level }}</td>
              <td>{{ r.duration }}</td>
              <td>{{ r.total }}</td>
              <td>{{ r.success }}</td>
              <td>{{ r.fail }}</td>
              <td>{{ r.rate }}</td>
              <td>{{ r.avgReaction }}</td>
              <td>{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ t.close }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String, history: Array })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: linear-gradient(135deg, #1e0a3c, #2d1060);
  border: 1px solid rgba(168,85,247,0.4);
  border-radius: 2vmin;
  padding: 4vmin;
  width: min(95vw, 900px);
  max-height: 80vh;
  overflow-y: auto;
  color: #e8d5ff;
  box-shadow: 0 0 4vmin rgba(168,85,247,0.3);
}
.modal-title {
  font-size: 3vmin;
  font-weight: 800;
  color: #c084fc;
  margin-bottom: 3vmin;
  text-align: center;
}
.no-data { text-align: center; color: rgba(232,213,255,0.5); font-size: 2vmin; padding: 4vmin; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 1.6vmin; }
th { background: rgba(168,85,247,0.2); color: #c084fc; padding: 1vmin; text-align: center; white-space: nowrap; }
td { padding: 0.8vmin 1vmin; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d8c5f0; }
tr:hover td { background: rgba(168,85,247,0.1); }
.close-btn {
  display: block;
  margin: 3vmin auto 0;
  padding: 1.2vmin 4vmin;
  background: linear-gradient(135deg, #6b21a8, #a855f7);
  color: #fff;
  border: none;
  border-radius: 1vmin;
  font-size: 2vmin;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.close-btn:hover { opacity: 0.85; }
</style>
