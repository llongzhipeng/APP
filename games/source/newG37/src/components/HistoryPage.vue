<template>
  <div class="page">
    <div class="topbar">
      <button class="back" @click="$emit('back')">← {{ t.back }}</button>
      <div class="title">{{ t.historyTitle }}</div>
      <button class="clear" v-if="list.length" @click="onClear">{{ t.clearHistory }}</button>
      <span v-else class="ph"></span>
    </div>

    <div class="bg"><div class="grid"></div><div class="glow g1"></div><div class="glow g2"></div></div>

    <div class="content">
      <div v-if="!list.length" class="empty">
        <div class="empty-ico">📊</div>
        <div class="empty-text">{{ t.noHistory }}</div>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.thTime }}</th>
              <th>{{ t.thProject }}</th>
              <th>{{ t.thDiff }}</th>
              <th>{{ t.thDur }}</th>
              <th>{{ t.thTotal }}</th>
              <th>{{ t.thSucc }}</th>
              <th>{{ t.thFail }}</th>
              <th>{{ t.thRate }}</th>
              <th>{{ t.thAvg }}</th>
              <th>{{ t.thScore }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in list" :key="i">
              <td>{{ fmt(r.time) }}</td>
              <td>{{ t.projectName }}</td>
              <td><span class="badge">L{{ r.difficulty }}</span></td>
              <td>{{ (r.duration/60).toFixed(0) }} {{ t.minute }}</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.success }}</td>
              <td class="err">{{ r.fail }}</td>
              <td><b>{{ r.rate }}%</b></td>
              <td>{{ r.avgReact }}ms</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { loadHistory, clearHistory, formatDate } from '../storage.js'
export default {
  name: 'HistoryPage',
  props: ['t'],
  data() { return { list: [] } },
  mounted() { this.list = loadHistory() },
  methods: {
    fmt: formatDate,
    onClear() { clearHistory(); this.list = [] }
  }
}
</script>

<style scoped>
.page { position: relative; width: 100%; height: 100%;
  background: radial-gradient(ellipse at top,#0d2a4d 0%,#061225 60%,#030814 100%); color: #eaf4ff; overflow: hidden; }
.topbar { position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between;
  padding: 2.5vh 3vw; border-bottom: 1px solid rgba(80,180,255,.15); backdrop-filter: blur(8px); }
.back, .clear { padding: 1.2vh 2vh; background: rgba(255,255,255,.08); color: #eaf4ff;
  border: 1px solid rgba(120,200,255,.35); border-radius: 10px; cursor: pointer; font-size: 1.8vh; transition: .2s; }
.back:hover { background: rgba(80,180,255,.2); }
.clear { color: #ff6b6b; border-color: rgba(255,107,107,.35); }
.clear:hover { background: rgba(255,107,107,.15); }
.title { font-size: 2.4vh; font-weight: 700; letter-spacing: .12em;
  background: linear-gradient(90deg,#4facfe,#00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ph { width: 80px; }

.bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.grid { position: absolute; inset: 0; background-image:
  linear-gradient(rgba(100,180,255,.05) 1px, transparent 1px),
  linear-gradient(90deg,rgba(100,180,255,.05) 1px, transparent 1px);
  background-size: 60px 60px; mask-image: radial-gradient(ellipse at center,#000 30%,transparent 75%); }
.glow { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .5; }
.g1 { width: 30vw; height: 30vw; background: #1c56c9; top: 10%; left: -8vw; }
.g2 { width: 30vw; height: 30vw; background: #00d1c7; bottom: -10vw; right: -8vw; }

.content { position: relative; z-index: 2; padding: 3vh 4vw; height: calc(100% - 10vh); overflow: auto; box-sizing: border-box; }

.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 2vh; color: #8ba9c9; }
.empty-ico { font-size: 8vh; opacity: .5; }
.empty-text { font-size: 2.2vh; letter-spacing: .05em; }

.table-wrap { border-radius: 16px; border: 1px solid rgba(120,200,255,.2); overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01)); backdrop-filter: blur(6px); }
table { width: 100%; border-collapse: collapse; font-size: 1.7vh; }
th { text-align: left; padding: 1.8vh 1.6vh; background: rgba(79,172,254,.12); color: #7ff0ff; letter-spacing: .1em; font-weight: 600;
  border-bottom: 1px solid rgba(80,180,255,.25); font-size: 1.5vh; text-transform: uppercase; white-space: nowrap; }
td { padding: 1.6vh; border-bottom: 1px solid rgba(120,200,255,.08); white-space: nowrap; }
tbody tr:hover { background: rgba(79,172,254,.06); }
.badge { padding: .4vh 1vh; border-radius: 999px; background: rgba(179,127,235,.2); color: #d1b3ff; font-weight: 700; font-size: 1.5vh; }
.ok { color: #7ed957; font-weight: 700; }
.err { color: #ff8a8a; font-weight: 700; }
.score { color: #ffd453; font-weight: 800; font-size: 2vh; }
</style>
