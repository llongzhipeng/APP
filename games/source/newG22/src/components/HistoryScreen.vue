<template>
  <div class="history">
    <div class="header">
      <button class="back-btn" @click="$emit('back')">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        <span>{{ t('back') }}</span>
      </button>
      <h1>{{ t('historyTitle') }}</h1>
      <div class="spacer"></div>
    </div>

    <div class="body" v-if="records.length > 0">
      <div class="summary">
        <div class="stat">
          <div class="stat-value">{{ records.length }}</div>
          <div class="stat-label">{{ lang==='zh'?'训练次数':'Sessions' }}</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ totalScore }}</div>
          <div class="stat-label">{{ lang==='zh'?'累计得分':'Total Score' }}</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ bestScore }}</div>
          <div class="stat-label">{{ lang==='zh'?'最高分':'Best' }}</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ avgRate }}%</div>
          <div class="stat-label">{{ lang==='zh'?'平均成功率':'Avg. Accuracy' }}</div>
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
      <div class="empty-icon">📋</div>
      <p>{{ t('historyEmpty') }}</p>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
import { loadHistory, formatDate } from '../store.js'

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
      if (rate >= 90) return 'linear-gradient(90deg, #10b981, #34d399)'
      if (rate >= 70) return 'linear-gradient(90deg, #fbbf24, #facc15)'
      return 'linear-gradient(90deg, #ef4444, #f87171)'
    }
  }
}
</script>

<style scoped>
.history {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0b1020 60%, #05070f 100%);
  display: flex; flex-direction: column;
  padding: 3vh 4vw;
}
.header {
  display: flex; align-items: center; gap: 2vw;
  margin-bottom: 3vh;
}
.back-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 0.7em 1.2em; border-radius: 999px;
  background: rgba(255,255,255,0.08); color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: clamp(12px, 1.3vw, 14px);
}
.back-btn:hover { background: rgba(255,255,255,0.15); }
.spacer { flex: 1; }
.header h1 {
  font-size: clamp(22px, 3vw, 32px); font-weight: 800;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

.summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5vw;
  margin-bottom: 3vh;
}
.stat {
  padding: 1.5vh 1.5vw;
  background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; text-align: center;
  backdrop-filter: blur(10px);
}
.stat-value {
  font-size: clamp(24px, 3.5vw, 42px); font-weight: 800;
  background: linear-gradient(180deg, #fff, #fbbf24);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.stat-label {
  font-size: clamp(11px, 1.2vw, 13px);
  color: rgba(255,255,255,0.6); letter-spacing: 0.1em;
  margin-top: 4px;
}

.table-wrap {
  flex: 1; overflow: auto; border-radius: 16px;
  background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.06);
}
table { width: 100%; border-collapse: collapse; font-size: clamp(11px, 1.2vw, 13px); }
thead { position: sticky; top: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); z-index: 2; }
thead th {
  padding: 1em 0.8em; text-align: left; font-weight: 600;
  color: #fbbf24; border-bottom: 1px solid rgba(255,255,255,0.08);
}
tbody td {
  padding: 0.9em 0.8em; border-bottom: 1px solid rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.85);
}
tbody tr:hover { background: rgba(255,255,255,0.03); }
.ok { color: #34d399; font-weight: 700; }
.bad { color: #f87171; font-weight: 700; }
.score { color: #fbbf24; font-weight: 800; }
.lvl {
  display: inline-block; width: 26px; height: 26px; border-radius: 50%;
  text-align: center; line-height: 26px; font-weight: 700; font-size: 12px; color: #000;
}
.lvl1 { background: #86efac; } .lvl2 { background: #4ade80; }
.lvl3 { background: #facc15; } .lvl4 { background: #fb923c; }
.lvl5 { background: #f87171; } .lvl6 { background: #dc2626; color: #fff; }
.rate { display: flex; align-items: center; gap: 8px; min-width: 100px; }
.rate-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.rate-fill { height: 100%; transition: width 0.4s; }

.empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4);
}
.empty-icon { font-size: 80px; margin-bottom: 16px; opacity: 0.4; }
.empty p { font-size: clamp(14px, 1.6vw, 18px); }

@media (max-width: 720px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
</style>
