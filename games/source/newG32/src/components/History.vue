<template>
  <div class="history">
    <button class="back" @click="$emit('back')">
      <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/></svg>
      {{ t('back') }}
    </button>
    <div class="panel">
      <div class="hdr">
        <h2>{{ t('historyTitle') }}</h2>
        <button v-if="list.length" class="clear" @click="clear">{{ t('clearHistory') }}</button>
      </div>
      <div v-if="!list.length" class="empty">
        <svg viewBox="0 0 24 24" width="4rem" height="4rem"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14v14M7 10h2v7H7v-7m4-3h2v10h-2V7m4 6h2v4h-2v-4Z" opacity=".4"/></svg>
        <p>{{ t('noHistory') }}</p>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('time') }}</th><th>{{ t('project') }}</th><th>{{ t('level') }}</th>
              <th>{{ t('duration') }}</th><th>{{ t('total') }}</th><th>{{ t('success') }}</th>
              <th>{{ t('fail') }}</th><th>{{ t('rate') }}</th><th>{{ t('avg') }}</th><th>{{ t('scoreCol') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in list" :key="i">
              <td>{{ r.time }}</td>
              <td>{{ t('projectName') }}</td>
              <td><span class="lv">{{ r.levels }}</span></td>
              <td>{{ formatDur(r.duration) }}</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.success }}</td>
              <td class="fail">{{ r.fail }}</td>
              <td>{{ r.rate }}%</td>
              <td>{{ r.avgMs }} {{ t('ms') }}</td>
              <td><b>{{ r.score }}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n'
import { loadHistory, clearHistory } from '../game'
export default {
  mixins: [i18nMixin],
  data() { return { list: [] } },
  mounted() { this.list = loadHistory() },
  methods: {
    formatDur(s) {
      const m = Math.floor(s / 60), r = s % 60
      return m + 'm' + (r ? ' ' + r + 's' : '')
    },
    clear() {
      if (confirm(this.t('confirmClear'))) { clearHistory(); this.list = [] }
    },
  },
}
</script>

<style scoped>
.history {
  position: relative; width: 100%; height: 100%; overflow: auto;
  background: radial-gradient(ellipse at top, #1a2436 0%, #0b1018 55%, #06090e 100%);
  padding: 4rem 2rem 2rem;
}
.back {
  position: absolute; top: 1.5rem; left: 1.5rem;
  display: inline-flex; align-items: center; gap: .4em;
  padding: .6em 1.2em; border-radius: 999px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: #fff;
}
.back:hover { background: rgba(255,255,255,.16); }
.panel {
  max-width: 75rem; margin: 0 auto;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
  border-radius: 1.5rem; padding: 2rem 2.5rem; backdrop-filter: blur(20px);
}
.hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
h2 { font-size: 2rem; color: #ffb347; }
.clear {
  padding: .5em 1.2em; border-radius: 999px;
  background: rgba(255, 90, 90, .15); border: 1px solid rgba(255, 90, 90, .4); color: #ff8b8b;
}
.clear:hover { background: rgba(255, 90, 90, .25); }
.empty { text-align: center; padding: 4rem 1rem; color: rgba(255,255,255,.35); }
.empty p { margin-top: 1rem; font-size: 1.1rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: .95rem; }
th, td { padding: .8rem .6rem; text-align: center; white-space: nowrap; }
th { background: rgba(255,255,255,.06); color: rgba(255,255,255,.65); font-weight: 600; font-size: .85rem; letter-spacing: .05em; }
tbody tr { transition: background .15s; }
tbody tr:hover td { background: rgba(255,179,71,.06); }
tbody td { border-bottom: 1px solid rgba(255,255,255,.05); }
.ok { color: #4ade80; }
.fail { color: #ff8b8b; }
.lv {
  display: inline-block; padding: .15em .6em; border-radius: 999px;
  background: rgba(255,179,71,.2); color: #ffb347; font-weight: 700;
}
</style>
