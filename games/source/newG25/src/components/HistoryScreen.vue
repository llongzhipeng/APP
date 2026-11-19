<template>
  <div class="mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="head">
        <h2>📊 {{ t.historyTitle }}</h2>
        <div class="head-actions">
          <button class="mini" @click="doClear" v-if="list.length">🗑 {{ t.clearHistory }}</button>
          <button class="close" @click="$emit('close')">✕</button>
        </div>
      </div>
      <div class="body">
        <div class="empty" v-if="!list.length">
          <div class="empty-icon">📋</div>
          <div class="empty-txt">{{ t.noHistory }}</div>
        </div>
        <div class="tbl-wrap" v-else>
          <table>
            <thead>
              <tr>
                <th>{{ t.time }}</th><th>{{ t.project }}</th><th>{{ t.level }}</th>
                <th>{{ t.duration }}</th><th>{{ t.totalCount }}</th>
                <th>{{ t.successCount }}</th><th>{{ t.failCount }}</th>
                <th>{{ t.correctRate }}</th><th>{{ t.avgReaction }}</th><th>{{ t.score }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in list" :key="i">
                <td>{{ formatTime(r.ts) }}</td>
                <td><span class="pill">🥊 {{ t.boxing }}</span></td>
                <td><span class="badge">Lv.{{ r.avgLevel }}</span></td>
                <td>{{ formatDuration(r.duration) }}</td>
                <td>{{ r.total }}</td>
                <td class="ok">{{ r.success }}</td>
                <td class="fail">{{ r.fail }}</td>
                <td><span class="rate" :class="rateClass(r.rate)">{{ r.rate }}%</span></td>
                <td>{{ r.avgReaction }}{{ t.reactionMs }}</td>
                <td class="score">{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="foot"><button class="btn primary" @click="$emit('close')">{{ t.back }}</button></div>
    </div>
  </div>
</template>

<script>
import { loadHistory, clearHistory, formatTime, formatDuration } from '../utils/storage'
export default {
  name: 'HistoryScreen', props: ['t'],
  data() { return { list: loadHistory() } },
  methods: {
    formatTime, formatDuration,
    doClear() { clearHistory(); this.list = [] },
    rateClass(r) { return r >= 80 ? 'good' : r >= 50 ? 'mid' : 'low' }
  }
}
</script>

<style scoped>
.mask {
  position: fixed; inset: 0; z-index: 100;
  background: radial-gradient(ellipse at center, rgba(20,5,15,.85), rgba(0,0,0,.95));
  backdrop-filter: blur(1vmin);
  display: flex; align-items: center; justify-content: center; padding: 3vmin;
}
.modal {
  width: min(95vw, 160vmin); max-height: 92vh;
  background: linear-gradient(160deg, #241028, #150818);
  border: 0.3vmin solid rgba(255,60,80,.35); border-radius: 2.5vmin; color: #fff;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,.7);
  display: flex; flex-direction: column; overflow: hidden;
}
.head { padding: 2.5vmin 3.5vmin; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 0.15vmin solid rgba(255,255,255,.08);
  background: linear-gradient(180deg, rgba(255,60,80,.12), transparent);
}
.head h2 { font-size: 3.4vmin; letter-spacing: 0.3vmin; font-weight: 900; }
.head-actions { display: flex; gap: 1.5vmin; align-items: center; }
.mini {
  padding: 1vmin 2vmin; font-size: 1.8vmin; font-weight: 700;
  background: rgba(255,80,90,.15); color: #ff8a99;
  border: 0.2vmin solid rgba(255,80,90,.3); border-radius: 0.8vmin; cursor: pointer;
  letter-spacing: 0.2vmin;
}
.mini:hover { background: rgba(255,80,90,.3); }
.close { width: 4vmin; height: 4vmin; border-radius: 50%; border: none;
  background: rgba(255,255,255,.1); color: #fff; cursor: pointer; font-size: 2vmin;
  display: flex; align-items: center; justify-content: center;
}
.close:hover { background: #ff3b4c; }

.body { padding: 2vmin 3.5vmin; overflow: auto; flex: 1; }
.empty { text-align: center; padding: 8vmin 0; color: rgba(255,255,255,.5); }
.empty-icon { font-size: 8vmin; opacity: .5; margin-bottom: 2vmin; }
.empty-txt { font-size: 2.4vmin; letter-spacing: 0.3vmin; }

.tbl-wrap { border-radius: 1.2vmin; background: rgba(0,0,0,.2); overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
th, td { padding: 1.4vmin 1vmin; text-align: center; white-space: nowrap; }
thead { background: linear-gradient(180deg, rgba(255,60,80,.2), rgba(255,60,80,.08));
  color: #fff; font-weight: 800; letter-spacing: 0.2vmin;
  position: sticky; top: 0;
}
tbody tr { border-top: 0.1vmin solid rgba(255,255,255,.06); }
tbody tr:hover { background: rgba(255,255,255,.04); }
.pill { padding: 0.4vmin 1.2vmin; background: rgba(255,60,80,.15); border-radius: 99px; font-size: 1.6vmin; }
.badge { display: inline-block; padding: 0.4vmin 1.2vmin;
  background: linear-gradient(135deg,#ff3b4c,#b8102a); border-radius: 99px; font-weight: 800; font-size: 1.6vmin; }
.ok { color: #22c55e; font-weight: 800; font-size: 2vmin; }
.fail { color: #ff5568; font-weight: 800; font-size: 2vmin; }
.rate { padding: 0.4vmin 1vmin; border-radius: 0.6vmin; font-weight: 800; }
.rate.good { background: rgba(34,197,94,.2); color: #22c55e; }
.rate.mid  { background: rgba(245,179,1,.2); color: #ffd166; }
.rate.low  { background: rgba(255,60,80,.2); color: #ff5568; }
.score { color: #ffd166; font-weight: 900; font-size: 2.2vmin; }

.foot { padding: 2vmin 3.5vmin; text-align: right; border-top: 0.15vmin solid rgba(255,255,255,.08); }
.btn { padding: 1.6vmin 4vmin; border-radius: 1vmin; border: 0.2vmin solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.06); color: #fff; cursor: pointer;
  font-size: 2.2vmin; font-weight: 700; letter-spacing: 0.3vmin;
}
.btn.primary { background: linear-gradient(135deg, #ff3b4c, #b8102a); border-color: transparent;
  box-shadow: 0 0.8vmin 2vmin rgba(255,60,80,.4); }
.btn:hover { transform: translateY(-0.2vmin); }
</style>
