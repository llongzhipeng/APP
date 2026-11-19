<template>
  <div class="history-page">
    <div class="history-header">
      <button class="back-btn" @click="$emit('back')">← {{ t.backBtn }}</button>
      <h2 class="history-title">{{ t.historyTitle }}</h2>
      <div style="width:80px" />
    </div>

    <div class="history-body">
      <div v-if="records.length === 0" class="empty-tip">
        {{ t.historyEmpty }}
      </div>
      <div v-else class="table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th>{{ t.colTime }}</th>
              <th>{{ t.colProject }}</th>
              <th>{{ t.colDiff }}</th>
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
              <td>{{ r.project }}</td>
              <td>
                <span class="diff-chip" :style="{ background: diffColor(r.difficulty) }">
                  Lv.{{ r.difficulty }}
                </span>
              </td>
              <td>{{ r.duration }}s</td>
              <td>{{ r.total }}</td>
              <td class="green">{{ r.success }}</td>
              <td class="red">{{ r.fail }}</td>
              <td>{{ r.rate }}</td>
              <td>{{ r.avgTime }}</td>
              <td class="score-col">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from '@vue/composition-api'

const DIFF_COLORS = ['#4caf50','#8bc34a','#f5a623','#ff9800','#ff5722','#e94560']

export default {
  name: 'HistoryPage',
  props: { t: Object },
  setup() {
    const records = ref([])

    onMounted(() => {
      try {
        records.value = JSON.parse(localStorage.getItem('game13_history') || '[]')
      } catch (e) { console.warn(e) }
    })

    function diffColor(lv) {
      return DIFF_COLORS[(lv || 1) - 1] || '#4caf50'
    }

    return { records, diffColor }
  }
}
</script>

<style scoped>
.history-page {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5vh 2vw;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.back-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 0.5em;
  padding: 0.4em 1em;
  font-size: clamp(12px, 1.8vmin, 16px);
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  background: #667eea;
  color: white;
}

.history-title {
  font-size: clamp(15px, 2.5vmin, 24px);
  color: #667eea;
  text-align: center;
  font-weight: 700;
}

.history-body {
  flex: 1;
  overflow: auto;
  padding: 2vh 2vw;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: clamp(13px, 2vmin, 20px);
  margin-top: 20vh;
}

.table-wrap {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(10px, 1.5vmin, 14px);
  white-space: nowrap;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.history-table th {
  background: #667eea;
  color: white;
  padding: 0.7em 1em;
  text-align: center;
  border: 1px solid #5a6fd8;
  position: sticky;
  top: 0;
  z-index: 5;
  font-weight: 600;
}

.history-table td {
  padding: 0.6em 1em;
  text-align: center;
  border: 1px solid #e0e0e0;
  color: #555;
}

.history-table tr:nth-child(even) td {
  background: #f9f9f9;
}
.history-table tr:hover td {
  background: #f0f0f0;
}

.diff-chip {
  display: inline-block;
  padding: 0.15em 0.6em;
  border-radius: 0.4em;
  color: #fff;
  font-weight: 700;
  font-size: 0.9em;
}

.green { color: #4caf50; font-weight: 700; }
.red   { color: #e94560; font-weight: 700; }
.score-col { color: #667eea; font-weight: 700; }
</style>
