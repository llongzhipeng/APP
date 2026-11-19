<template>
  <div class="history-page">
    <!-- Header -->
    <div class="hist-header">
      <button class="back-btn" @click="$emit('back')">‹ {{ t('back') }}</button>
      <h2>{{ t('historyTitle') }}</h2>
      <button v-if="history.length > 0" class="clear-btn" @click="confirmClear">{{ t('clearHistory') }}</button>
      <div v-else class="spacer"></div>
    </div>

    <!-- Empty state -->
    <div v-if="history.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>{{ t('noHistory') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table class="hist-table">
        <thead>
          <tr>
            <th>{{ t('colDate') }}</th>
            <th>{{ t('colProject') }}</th>
            <th>{{ t('colLevel') }}</th>
            <th>{{ t('colDuration') }}</th>
            <th>{{ t('colTotal') }}</th>
            <th>{{ t('colCorrect') }}</th>
            <th>{{ t('colWrong') }}</th>
            <th>{{ t('colRate') }}</th>
            <th>{{ t('colAvgTime') }}</th>
            <th>{{ t('colScore') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in history" :key="i">
            <td class="date-cell">{{ item.date }}</td>
            <td>{{ item.project }}</td>
            <td>
              <span class="lv-badge" :style="{ background: lvColors[item.difficulty - 1] }">
                {{ item.difficulty }}
              </span>
            </td>
            <td>{{ item.duration }}{{ t('durationUnit') }}</td>
            <td>{{ item.total }}</td>
            <td class="correct-cell">{{ item.correct }}</td>
            <td class="wrong-cell">{{ item.wrong }}</td>
            <td>
              <span class="rate-badge" :class="rateClass(item.rate)">{{ item.rate }}%</span>
            </td>
            <td>{{ item.avgTime }}s</td>
            <td class="score-cell">{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm clear dialog -->
    <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm = false">
      <div class="confirm-box">
        <p>{{ t('confirmClear') }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="showConfirm = false">{{ t('cancel') }}</button>
          <button class="cbtn confirm" @click="doClear">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { clearHistory } from '../gameUtils.js'
export default {
  name: 'HistoryPage',
  props: {
    language: { type: String, required: true },
    history: { type: Array, required: true },
  },
  emits: ['back', 'history-cleared'],
  data() {
    return {
      showConfirm: false,
      lvColors: ['#66BB6A','#42A5F5','#FFA726','#FF7043','#AB47BC','#E53935'],
    }
  },
  methods: {
    t(key) { return t(this.language, key) },
    rateClass(rate) {
      if (rate >= 90) return 'rate-high'
      if (rate >= 70) return 'rate-mid'
      return 'rate-low'
    },
    confirmClear() { this.showConfirm = true },
    doClear() {
      clearHistory()
      this.showConfirm = false
      this.$emit('history-cleared')
    },
  },
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
}

.hist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0 24px;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0;
}
.hist-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #333;
}
.back-btn {
  padding: 8px 20px;
  background: #fff;
  border: 2px solid #5C6BC0;
  border-radius: 20px;
  color: #5C6BC0;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { background: #5C6BC0; color: #fff; }
.clear-btn {
  padding: 8px 20px;
  background: #fff;
  border: 2px solid #E53935;
  border-radius: 20px;
  color: #E53935;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover { background: #E53935; color: #fff; }
.spacer { width: 100px; }

/* Empty */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #aaa;
}
.empty-icon { font-size: 72px; }
.empty-state p { font-size: 18px; font-weight: 500; margin: 0; }

/* Table */
.table-wrap {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
.hist-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 14px;
  min-width: 700px;
}
.hist-table th {
  background: #4A90E2;
  color: #fff;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}
.hist-table td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid #e8eaf6;
  color: #333;
  white-space: nowrap;
}
.hist-table tr:last-child td { border-bottom: none; }
.hist-table tbody tr:hover td { background: #f5f5f5; }

.date-cell { font-size: 12px; color: #666; }
.correct-cell { color: #43A047; font-weight: 700; }
.wrong-cell   { color: #E53935; font-weight: 700; }
.score-cell   { color: #FF7043; font-weight: 800; }

.lv-badge {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
  font-size: 13px;
}
.rate-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
}
.rate-high { background: #e8f5e9; color: #2e7d32; }
.rate-mid  { background: #fff8e1; color: #e65100; }
.rate-low  { background: #fde8e8; color: #b71c1c; }

/* Confirm */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.confirm-box {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 380px;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.confirm-box p {
  font-size: 16px;
  color: #333;
  margin: 0 0 24px;
  font-weight: 600;
}
.confirm-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.cbtn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.cbtn.cancel  { background: #f5f5f5; color: #555; border: 2px solid #ddd; }
.cbtn.confirm { background: #E53935; color: #fff; }
.cbtn:hover   { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
</style>
