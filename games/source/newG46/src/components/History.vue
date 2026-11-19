<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <div class="modal-title">{{ t('historyTitle') }}</div>
      <div class="modal-body">
        <div v-if="!list.length" class="empty">
          <div>{{ t('hEmpty') }}</div>
        </div>
        <div v-else class="tbl-wrap">
          <div class="tbl">
            <div class="th">
              <div v-for="(h,i) in t('hCols')" :key="i">{{ h }}</div>
            </div>
            <div class="tr" v-for="(r,i) in list" :key="i">
              <div>{{ fmtDate(r.date) }}</div>
              <div>{{ r.project }}</div>
              <div><span class="badge" :class="'b'+r.level">{{ r.level }}</span></div>
              <div>{{ r.duration }}s</div>
              <div>{{ r.total }}</div>
              <div class="ok">{{ r.correct }}</div>
              <div class="ng">{{ r.wrong }}</div>
              <div>{{ (r.accuracy * 100).toFixed(0) }}%</div>
              <div>{{ r.avgRT }}ms</div>
              <div class="sc">{{ r.score }}</div>
            </div>
          </div>
        </div>
      </div>
      <button class="ok-btn" @click="$emit('close')">{{ t('close') }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { loadHistory } from '../history.js'
export default {
  name: 'History',
  data() { return { list: loadHistory() } },
  methods: {
    t,
    fmtDate(d) {
      const dt = new Date(d)
      const pad = n => (n < 10 ? '0' + n : n)
      return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    },
  },
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(74,58,30,0.35); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  font-size: 1em;
}
.modal-card {
  width: min(72em, 95vw); max-height: 85vh; overflow-y: auto;
  padding: 2em; color: #3a2f1f; position: relative;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  border-radius: 1.2em;
  box-shadow: 0 1em 3em rgba(74,58,30,.2);
}
.close-btn {
  position: absolute; top: 1em; right: 1em;
  width: 2em; height: 2em; border-radius: 50%;
  background: #f6efe0; border: 1px solid #d9c9a3; color: #6b5a3a; font-size: 0.95em; cursor: pointer;
  transition: all .2s;
}
.close-btn:hover { background: #e8c8b8; color: #7a1f10; }
.modal-title {
  font-size: 1.7em; font-weight: 700; letter-spacing: 0.15em; color: #4a3a1e; margin-bottom: 1.2em;
}
.empty { text-align: center; padding: 3em 0; color: #8a7550; font-size: 1.05em; }
.tbl-wrap { border-radius: 0.7em; overflow: hidden; border: 1px solid #d9c9a3; }
.tbl { display: grid; grid-template-columns: 1fr; font-size: 0.95em; }
.th, .tr {
  display: grid;
  grid-template-columns: 1.8fr 1fr 0.7fr 0.9fr 0.8fr 0.8fr 0.8fr 1fr 1fr 0.9fr;
}
.th { background: #f6e6c1; color: #4a3a1e; font-weight: 700; }
.th > div, .tr > div { padding: 0.65em 0.5em; text-align: center; color: #4a3a1e; }
.tr { border-top: 1px solid #e5d5ad; }
.ok { color: #6b8e5a; }
.ng { color: #c0392b; }
.sc { color: #b98738; font-weight: 700; }
.badge {
  display: inline-block; width: 1.8em; text-align: center; border-radius: 999px; padding: 0.1em 0;
  color: #fff; font-weight: 700;
}
.b1 { background: #6b8e5a; } .b2 { background: #8ba86e; }
.b3 { background: #c99a4b; } .b4 { background: #b98738; }
.b5 { background: #a1683a; } .b6 { background: #7a4a2a; }
.ok-btn {
  display: block; margin: 1.5em auto 0; padding: 0.8em 2.6em;
  background: #c99a4b;
  border: none; border-radius: 999px; color: #fff; font-weight: 600; letter-spacing: 0.15em;
  font-size: 1.05em; cursor: pointer;
  transition: background .2s;
}
.ok-btn:hover { background: #b98738; }
</style>
