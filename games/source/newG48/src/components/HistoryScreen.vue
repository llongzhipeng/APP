<template>
  <div class="history">
    <div class="header">
      <button class="back-btn" @click="$emit('back')">{{ t('back') }}</button>
      <h1>{{ t('historyTitle') }}</h1>
      <div class="spacer"></div>
      <button v-if="records.length" class="clear-btn" @click="onClear">{{ t('clearHistory') }}</button>
    </div>

    <div class="body" v-if="records.length > 0">
      <div class="summary">
        <div class="stat">
          <div class="stat-value">{{ records.length }}</div>
          <div class="stat-label">{{ t('trainingSession') }}</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ totalScore }}</div>
          <div class="stat-label">{{ t('totalScore') }}</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ bestScore }}</div>
          <div class="stat-label">{{ t('bestScore') }}</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ avgRate }}%</div>
          <div class="stat-label">{{ t('avgRate') }}</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('colTime') }}</th>
              <th>{{ t('colProject') }}</th>
              <th>{{ t('colDifficulty') }}</th>
              <th>{{ t('colDuration') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th>{{ t('colSuccess') }}</th>
              <th>{{ t('colFail') }}</th>
              <th>{{ t('colRate') }}</th>
              <th>{{ t('colReact') }}</th>
              <th>{{ t('colScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ formatDate(r.time) }}</td>
              <td>{{ t('projectName') }}</td>
              <td><span class="lvl" :class="'lvl'+r.difficulty">{{ r.difficulty }}</span></td>
              <td>{{ (r.duration/60).toFixed(0) }}{{ t('unit.min') }}</td>
              <td>{{ r.total }}</td>
              <td class="ok">{{ r.success }}</td>
              <td class="bad">{{ r.fail }}</td>
              <td>
                <div class="rate">
                  <div class="rate-bar"><div class="rate-fill" :style="{ width: r.rate + '%', background: rateColor(r.rate) }"></div></div>
                  <span>{{ r.rate }}%</span>
                </div>
              </td>
              <td>{{ r.avgReact }}{{ t('unit.ms') }}</td>
              <td class="score">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="empty" v-else>
      <p>{{ t('historyEmpty') }}</p>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
import { loadHistory, formatDate, clearHistory } from '../store.js'

export default {
  name: 'HistoryScreen',
  data() { return { records: [] } },
  computed: {
    lang() { return i18n.lang },
    totalScore() { return this.records.reduce((s, r) => s + r.score, 0) },
    bestScore() { return this.records.reduce((m, r) => Math.max(m, r.score), 0) },
    avgRate() {
      if (this.records.length === 0) return 0
      return Math.round(this.records.reduce((s, r) => s + r.rate, 0) / this.records.length)
    }
  },
  mounted() { this.records = loadHistory() },
  methods: {
    t, formatDate,
    rateColor(rate) {
      if (rate >= 90) return '#7cb98f'
      if (rate >= 70) return '#d4a94a'
      return '#c5674a'
    },
    onClear() {
      if (window.confirm(t('confirmClear'))) {
        clearHistory()
        this.records = []
      }
    }
  }
}
</script>

<style scoped>
.history {
  position: absolute; inset: 0;
  background: #faf6ef;
  display: flex; flex-direction: column;
  padding: 3vh 4vw;
  color: #2c2721;
}
.header {
  display: flex; align-items: center; gap: 2vw;
  margin-bottom: 3vh;
}
.back-btn, .clear-btn {
  padding: 1.4vmin 3vmin; border-radius: 999px;
  background: #ffffff; color: #2c2721;
  border: 0.2vmin solid #e5ddce;
  font-size: 2.4vmin;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.1);
}
.back-btn:hover { border-color: #d97757; color: #d97757; }
.clear-btn { color: #a94a3a; border-color: #ecd6cf; }
.clear-btn:hover { background: #a94a3a; color: #fff; border-color: #a94a3a; }
.spacer { flex: 1; }
.header h1 {
  font-size: 5vmin; font-weight: 800;
  color: #2c2721;
}

.summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2vw;
  margin-bottom: 3vh;
}
.stat {
  padding: 2.4vh 1.5vw;
  background: #ffffff;
  border: 0.15vmin solid #f0eadf;
  border-radius: 1.8vmin; text-align: center;
}
.stat-value {
  font-size: 5.6vmin; font-weight: 800;
  color: #d97757;
}
.stat-label {
  font-size: 1.9vmin;
  color: #7a7266; letter-spacing: 0.12em;
  margin-top: 0.8vmin;
}

.table-wrap {
  flex: 1; overflow: auto; border-radius: 1.8vmin;
  background: #ffffff; border: 0.15vmin solid #f0eadf;
}
table { width: 100%; border-collapse: collapse; font-size: 2vmin; }
thead { position: sticky; top: 0; background: #f5efe4; z-index: 2; }
thead th {
  padding: 1.4vmin 1.4vmin; text-align: left; font-weight: 700;
  color: #6b6357; border-bottom: 0.15vmin solid #f0eadf;
  white-space: nowrap; letter-spacing: 0.03em;
  font-size: 1.9vmin;
}
tbody td {
  padding: 1.4vmin 1.4vmin; border-bottom: 0.15vmin solid #f5efe4;
  color: #2c2721;
  white-space: nowrap;
}
tbody tr:hover { background: #faf6ef; }
.ok { color: #6aa77a; font-weight: 700; }
.bad { color: #c5674a; font-weight: 700; }
.score { color: #d97757; font-weight: 800; }
.lvl {
  display: inline-block; width: 3.6vmin; height: 3.6vmin; min-width: 26px; min-height: 26px; border-radius: 50%;
  text-align: center; line-height: 3.6vmin; font-weight: 700; font-size: 1.8vmin; color: #fff;
}
.lvl1 { background: #7cb98f; }
.lvl2 { background: #6aa77a; }
.lvl3 { background: #d4a94a; }
.lvl4 { background: #d47f4a; }
.lvl5 { background: #c5674a; }
.lvl6 { background: #a94a3a; }
.rate { display: flex; align-items: center; gap: 1.2vmin; min-width: 14vmin; }
.rate-bar { flex: 1; height: 0.8vmin; min-height: 6px; background: #f0eadf; border-radius: 3px; overflow: hidden; }
.rate-fill { height: 100%; transition: width 0.4s; }

.empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #a89f92;
}
.empty p { font-size: 2.8vmin; }

@media (max-width: 720px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
</style>
