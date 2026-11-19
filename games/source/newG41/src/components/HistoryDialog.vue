<template>
  <Modal :show="show" :title="t.historyTitle" @close="$emit('close')">
    <div v-if="records.length === 0" class="empty">
      <div class="empty-icon">🛸</div>
      <p>{{ t.noHistory }}</p>
    </div>
    <div v-else class="table-wrap">
      <table class="hist">
        <thead>
          <tr>
            <th>{{ t.colTime }}</th>
            <th>{{ t.colProject }}</th>
            <th>{{ t.colDifficulty }}</th>
            <th>{{ t.colDuration }}</th>
            <th>{{ t.colTotal }}</th>
            <th>{{ t.colSuccess }}</th>
            <th>{{ t.colFail }}</th>
            <th>{{ t.colRate }}</th>
            <th>{{ t.colAvgTime }}</th>
            <th>{{ t.colScore }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in records" :key="i">
            <td>{{ r.time }}</td>
            <td>{{ t.appName }}</td>
            <td><span class="lv-pill">Lv {{ r.maxLevel }}</span></td>
            <td>{{ Math.round(r.duration / 60) }} {{ t.minute }}</td>
            <td>{{ r.total }}</td>
            <td class="ok">{{ r.correct }}</td>
            <td class="bad">{{ r.wrong }}</td>
            <td>{{ r.total ? Math.round(r.correct / r.total * 100) : 0 }}%</td>
            <td>{{ r.avgRT }}{{ t.ms }}</td>
            <td class="score">{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <button v-if="records.length" class="btn btn-danger" @click="onClear">{{ t.clearHistory }}</button>
      <button class="btn" @click="$emit('close')">{{ t.close }}</button>
    </template>
  </Modal>
</template>

<script>
import Modal from './Modal.vue'
export default {
  name: 'HistoryDialog',
  components: { Modal },
  props: { show: Boolean, t: Object, records: Array },
  methods: {
    onClear() {
      if (confirm(this.t.confirmClear)) this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.empty { text-align: center; padding: 3em 0; color: #8fa8d8; }
.empty-icon { font-size: 4em; margin-bottom: 0.5em; opacity: 0.7; }
.table-wrap { overflow-x: auto; }
table.hist { width: 100%; border-collapse: collapse; font-size: 0.9em; }
.hist th, .hist td {
  padding: 0.7em 0.6em; text-align: center; border-bottom: 1px solid rgba(140, 180, 255, 0.1);
  white-space: nowrap;
}
.hist th {
  color: #a5c8ff; font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-weight: 700;
  background: rgba(60, 80, 160, 0.25);
  position: sticky; top: 0;
}
.hist tbody tr:hover { background: rgba(90, 120, 220, 0.1); }
.lv-pill {
  display: inline-block;
  padding: 0.15em 0.6em;
  border-radius: 999px;
  background: linear-gradient(135deg, #3d5afe, #7c4dff);
  color: #fff;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85em;
}
.ok { color: #69db7c; font-weight: 700; }
.bad { color: #ff8787; font-weight: 700; }
.score { color: #ffd43b; font-weight: 700; font-family: 'Orbitron', sans-serif; }
.btn {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  padding: 0.6em 1.6em;
  border-radius: 999px;
  border: 1px solid rgba(140, 180, 255, 0.4);
  background: rgba(60, 80, 160, 0.3);
  color: #cfe0ff;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: all .2s;
}
.btn:hover { background: rgba(90, 120, 220, 0.5); color: #fff; }
.btn-danger { border-color: rgba(255, 120, 120, 0.4); color: #ff8787; }
.btn-danger:hover { background: rgba(255, 80, 100, 0.3); color: #fff; }
</style>
