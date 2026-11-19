<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t.historyTitle }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
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
                <td>{{ formatDur(rec.duration) }}</td>
                <td>{{ rec.total }}</td>
                <td class="green">{{ rec.success }}</td>
                <td class="red">{{ rec.fail }}</td>
                <td>{{ rec.rate }}</td>
                <td>{{ rec.avgReaction }}</td>
                <td class="gold">{{ rec.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String, history: Array },
  computed: { t() { return messages[this.lang] || messages.zh } },
  methods: {
    formatDur(sec) {
      if (!sec) return '--'
      const m = Math.floor(sec / 60), s = sec % 60
      return s ? `${m}m${s}s` : `${m}min`
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.72);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #0d3b2e, #061a12);
  border: 0.2vmin solid rgba(100,255,150,0.3); border-radius: 2vmin;
  width: min(130vmin, 98vw); max-height: 88vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2vmin 3vmin; border-bottom: 0.15vmin solid rgba(100,255,150,0.2); flex-shrink: 0;
}
.modal-header h2 { color: #d4f5e0; font-size: 2.5vmin; font-weight: 800; }
.close-btn { background: none; border: none; color: rgba(212,245,224,0.6); font-size: 2.5vmin; cursor: pointer; }
.close-btn:hover { color: #d4f5e0; }
.modal-body { overflow: auto; padding: 2vmin 3vmin; }
.empty-msg { text-align: center; color: rgba(212,245,224,0.5); font-size: 2vmin; padding: 4vmin 0; }
.table-wrap { overflow-x: auto; }
.hist-table { width: 100%; border-collapse: collapse; font-size: 1.5vmin; white-space: nowrap; }
.hist-table th {
  background: rgba(45,184,112,0.2); color: rgba(212,245,224,0.9);
  padding: 1.2vmin 1.5vmin; text-align: center; font-weight: 700;
  border-bottom: 0.15vmin solid rgba(100,255,150,0.3);
}
.hist-table td {
  padding: 0.9vmin 1.5vmin; text-align: center; color: rgba(212,245,224,0.75);
  border-bottom: 0.1vmin solid rgba(255,255,255,0.06);
}
.hist-table tr:hover td { background: rgba(255,255,255,0.04); }
.time-col { font-size: 1.3vmin; color: rgba(212,245,224,0.5); }
.level-tag {
  display: inline-block; width: 3vmin; height: 3vmin; line-height: 3vmin;
  border-radius: 50%; background: rgba(45,184,112,0.4); color: #a5f5c0; font-weight: 800; font-size: 1.5vmin;
}
.green { color: #a5d6a7; }
.red { color: #ef9a9a; }
.gold { color: #ffd700; font-weight: 700; }
</style>
