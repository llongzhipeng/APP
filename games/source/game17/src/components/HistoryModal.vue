<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t.historyTitle }}</h2>
        <button class="close-btn" @click="$emit('close')">âœ•</button>
      </div>
      <div class="modal-body">
        <p v-if="!history || history.length === 0" class="empty-msg">{{ t.noHistory }}</p>
        <div v-else class="table-wrap">
          <table class="hist-table">
            <thead>
              <tr>
                <th>{{ t.trainTime }}</th>
                <th>{{ t.trainProject }}</th>
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
              <tr v-for="(rec, i) in history" :key="i">
                <td class="time-col">{{ rec.trainTime }}</td>
                <td>{{ rec.project }}</td>
                <td><span class="level-tag">{{ rec.level }}</span></td>
                <td>{{ formatDuration(rec.duration) }}</td>
                <td>{{ rec.total }}</td>
                <td class="success-cell">{{ rec.success }}</td>
                <td class="fail-cell">{{ rec.fail }}</td>
                <td>{{ rec.rate }}</td>
                <td>{{ rec.avgReaction }}</td>
                <td class="score-cell">{{ rec.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'

const props = defineProps({ lang: String, history: Array })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)

function formatDuration(sec) {
  if (!sec) return '--'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}m${s}s` : `${m}min`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #0d2137, #060e1a);
  border: 0.2vmin solid rgba(100,200,255,0.3);
  border-radius: 2vmin;
  width: min(130vmin, 98vw);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2vmin 3vmin;
  border-bottom: 0.15vmin solid rgba(100,200,255,0.2);
  flex-shrink: 0;
}
.modal-header h2 { color: #c8e6ff; font-size: 2.5vmin; font-weight: 800; }
.close-btn {
  background: none;
  border: none;
  color: rgba(200,230,255,0.6);
  font-size: 2.5vmin;
  cursor: pointer;
  padding: 0.3vmin 0.8vmin;
  border-radius: 0.5vmin;
  transition: color 0.2s;
}
.close-btn:hover { color: #c8e6ff; }
.modal-body { overflow: auto; padding: 2vmin 3vmin; }
.empty-msg { text-align: center; color: rgba(200,230,255,0.5); font-size: 2vmin; padding: 4vmin 0; }
.table-wrap { overflow-x: auto; }
.hist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.5vmin;
  white-space: nowrap;
}
.hist-table th {
  background: rgba(42,138,196,0.25);
  color: rgba(200,230,255,0.9);
  padding: 1.2vmin 1.5vmin;
  text-align: center;
  font-weight: 700;
  border-bottom: 0.15vmin solid rgba(100,200,255,0.3);
}
.hist-table td {
  padding: 0.9vmin 1.5vmin;
  text-align: center;
  color: rgba(200,230,255,0.75);
  border-bottom: 0.1vmin solid rgba(255,255,255,0.06);
}
.hist-table tr:hover td { background: rgba(255,255,255,0.04); }
.time-col { font-size: 1.3vmin; color: rgba(200,230,255,0.5); }
.level-tag {
  display: inline-block;
  width: 3vmin; height: 3vmin; line-height: 3vmin;
  border-radius: 50%;
  background: rgba(42,138,196,0.5);
  color: #64c8ff;
  font-weight: 800;
  font-size: 1.5vmin;
}
.success-cell { color: #a5d6a7; }
.fail-cell { color: #ef9a9a; }
.score-cell { color: #ffd700; font-weight: 700; }
</style>
