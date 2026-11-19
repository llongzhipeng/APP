<template>
  <div class="page">
    <button class="back-btn" @click="$emit('go', 'home')">← {{ t('back') }}</button>
    <div class="wrap">
      <div class="header-row">
        <h2>{{ t('history') }}</h2>
        <button v-if="store.history.length" class="clear-btn" @click="doClear">🗑 {{ t('clearHistory') }}</button>
      </div>
      <div v-if="!store.history.length" class="empty">📭 {{ t('noHistory') }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('trainDate') }}</th>
              <th>{{ t('trainItem') }}</th>
              <th>{{ t('difficultyLv') }}</th>
              <th>{{ t('duration') }}</th>
              <th>{{ t('totalCount') }}</th>
              <th>{{ t('successCount') }}</th>
              <th>{{ t('failCount') }}</th>
              <th>{{ t('successRate') }}</th>
              <th>{{ t('avgReact') }}</th>
              <th>{{ t('score') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h, i) in store.history" :key="i">
              <td>{{ h.date }}</td>
              <td>{{ t('itemName') }}</td>
              <td>Lv.{{ h.maxLevel }}</td>
              <td>{{ h.duration }}{{ t('seconds') }}</td>
              <td>{{ h.total }}</td>
              <td class="ok">{{ h.correct }}</td>
              <td class="err">{{ h.wrong }}</td>
              <td>{{ h.total ? Math.round(h.correct * 100 / h.total) : 0 }}%</td>
              <td>{{ h.avgReact }}ms</td>
              <td class="score">{{ h.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import { t as trans } from '../i18n.js'
import { store, clearHistory } from '../store.js'
export default {
  name: 'History',
  data() { return { store } },
  methods: {
    t(k) { return trans(store.lang, k) },
    doClear() { if (confirm(this.t('clearHistory') + '?')) clearHistory() }
  }
}
</script>
<style scoped>
.page { position: absolute; inset: 0; background: linear-gradient(135deg, #1a1a3e, #2d1b5e); overflow: auto; padding: 5vh 4vw; color: #fff; }
.back-btn {
  background: linear-gradient(135deg, #ef476f, #ffd166);
  border: none;
  color: #fff;
  padding: 1.6vmin 3.2vmin;
  border-radius: 999px;
  cursor: pointer;
  margin-bottom: 3vmin;
  font-size: 2.4vmin;
  font-weight: 700;
  box-shadow: 0 1.2vmin 2.4vmin rgba(239, 71, 111, 0.45);
  transition: all .2s;
}
.back-btn:hover { transform: translateY(-3px); box-shadow: 0 1.6vmin 3vmin rgba(239, 71, 111, 0.55); }
.wrap { max-width: 1200px; margin: 0 auto; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h2 { font-size: 1.8em; background: linear-gradient(135deg, #ffd166, #ef476f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.clear-btn { background: rgba(239, 71, 111, 0.3); border: 1px solid rgba(239, 71, 111, 0.5); color: #fff; padding: 0.6em 1.2em; border-radius: 12px; cursor: pointer; }
.empty { text-align: center; padding: 100px 20px; font-size: 1.3em; opacity: .7; }
.table-wrap { background: rgba(255,255,255,0.06); border-radius: 16px; overflow: auto; }
table { width: 100%; border-collapse: collapse; min-width: 900px; }
th, td { padding: 14px 12px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
thead { background: rgba(255,255,255,0.12); }
th { font-weight: 700; }
tr:hover td { background: rgba(255,255,255,0.04); }
.ok { color: #6ee7ff; }
.err { color: #ef476f; }
.score { color: #ffd166; font-weight: 700; }
</style>
