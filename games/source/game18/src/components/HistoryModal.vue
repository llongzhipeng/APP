<template>
  <div class="overlay">
    <div class="box">
      <h2 class="title">{{ t.historyTitle }}</h2>
      <div v-if="records.length === 0" class="empty">{{ t.noHistory }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.trainTime }}</th>
              <th>{{ t.diffLevel }}</th>
              <th>{{ t.durationHeader }}</th>
              <th>{{ t.total }}</th>
              <th>{{ t.success }}</th>
              <th>{{ t.fail }}</th>
              <th>{{ t.rate }}</th>
              <th>{{ t.avgTime }}</th>
              <th>{{ t.scoreHeader }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ r.time }}</td>
              <td>{{ r.level }}</td>
              <td>{{ r.duration }}s</td>
              <td>{{ r.total }}</td>
              <td>{{ r.correct }}</td>
              <td>{{ r.wrong }}</td>
              <td>{{ r.rate }}%</td>
              <td>{{ r.avgRT }}s</td>
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
const props = defineProps({ lang: String })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)
const records = computed(() => {
  try { return JSON.parse(localStorage.getItem('faceMemoryHistory') || '[]') } catch(e) { return [] }
})
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.box {
  background: linear-gradient(160deg, #0e1a30, #060e1a);
  border: 0.2vmin solid rgba(100,150,255,0.3); border-radius: 2vmin;
  padding: 3vmin 4vmin; width: min(90vmin, 96vw); max-height: 80vh;
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.title { color: #e8f0ff; font-size: 3vmin; font-weight: 800; }
.empty { color: rgba(200,220,255,0.5); font-size: 2vmin; padding: 3vmin; }
.table-wrap { width: 100%; overflow: auto; flex: 1; }
table { width: 100%; border-collapse: collapse; font-size: 1.6vmin; white-space: nowrap; }
th, td { padding: 0.8vmin 1.2vmin; text-align: center; border-bottom: 0.1vmin solid rgba(100,150,255,0.15); }
th { color: rgba(200,220,255,0.7); font-weight: 700; }
td { color: #e8f0ff; }
tr:hover td { background: rgba(100,150,255,0.05); }
.close-btn {
  padding: 1.5vmin 4vmin; font-size: 2vmin; font-weight: 700;
  border-radius: 1vmin; cursor: pointer;
  background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #e8f0ff; transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.2); }
</style>
