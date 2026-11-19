<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>{{ t.historyTitle }}</h2>
      <div v-if="!history.length" class="empty">{{ t.noHistory }}</div>
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
            <tr v-for="(r, i) in history" :key="i">
              <td>{{ r.trainTime }}</td>
              <td>{{ r.level }}</td>
              <td>{{ r.duration }}</td>
              <td>{{ r.total }}</td>
              <td>{{ r.success }}</td>
              <td>{{ r.fail }}</td>
              <td>{{ r.rate }}</td>
              <td>{{ r.avgReaction }}s</td>
              <td>{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ t.close }}</button>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String, history: Array },
  emits: ['close'],
  computed: { t() { return messages[this.lang] || messages.zh } },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: linear-gradient(135deg, #0d2b4e, #0a1e35);
  border: 0.2vmin solid rgba(100,180,255,0.3);
  border-radius: 2vmin; padding: 4vmin 5vmin; max-width: 90vw; max-height: 80vh;
  display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
h2 { color: #c8e0ff; font-size: 3.5vmin; }
.empty { color: rgba(200,224,255,0.5); font-size: 2vmin; }
.table-wrap { overflow-y: auto; max-height: 50vh; width: 100%; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 0.8vmin 1.5vmin; text-align: center; font-size: 1.6vmin; color: rgba(200,224,255,0.85); border-bottom: 0.1vmin solid rgba(255,255,255,0.08); white-space: nowrap; }
th { color: #64b4ff; font-weight: 700; position: sticky; top: 0; background: #0d2b4e; }
.close-btn {
  padding: 1.2vmin 3.5vmin; font-size: 2vmin; font-weight: 700; border-radius: 1.2vmin; cursor: pointer;
  background: linear-gradient(135deg,#1a5fa8,#2e8fd4); border: none; color: #fff;
}
</style>
