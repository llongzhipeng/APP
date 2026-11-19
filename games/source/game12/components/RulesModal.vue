<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t('rulesTitle') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <p class="rules-desc">{{ t('rulesDesc') }}</p>
      <div class="table-wrap">
        <table class="rules-table">
          <thead>
            <tr>
              <th>{{ t('diffLevel') }}</th>
              <th>{{ t('sizeDiff') }}</th>
              <th>{{ t('position') }}</th>
              <th>{{ t('maxTime') }}</th>
              <th>{{ t('diffCoeff') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.level" :class="`row-lv${row.level}`">
              <td class="lv-cell">
                <span class="lv-badge" :style="{ background: row.color }">{{ row.level }}</span>
              </td>
              <td>{{ t(row.sizeDiff) }}</td>
              <td>
                <span class="pos-badge" :class="row.tilted ? 'tilted' : 'normal'">
                  {{ t(row.tilted ? 'tilted' : 'normal') }}
                </span>
              </td>
              <td>{{ row.time }}s</td>
              <td class="coeff">× {{ row.coeff }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="scoring-note">
        <strong>{{ language === 'zh' ? '得分规则' : 'Scoring' }}：</strong>
        {{ language === 'zh'
          ? '每答对一题得分 = 5 × 难度系数（难度1答对得5分，难度6答对得17.5分）'
          : 'Score per correct answer = 5 × difficulty coefficient (Level 1: 5pts, Level 6: 17.5pts)' }}
      </div>
      <div class="scoring-note">
        <strong>{{ language === 'zh' ? '难度调整' : 'Difficulty Adjustment' }}：</strong>
        {{ language === 'zh'
          ? '每30秒统计正确率，≥90%升级，≤70%降级'
          : 'Every 30s: ≥90% accuracy → level up, ≤70% → level down' }}
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'RulesModal',
  props: {
    language: { type: String, required: true },
  },
  emits: ['close'],
  computed: {
    rows() {
      return [
        { level: 1, sizeDiff: 'large',         tilted: false, time: 10, coeff: 1,   color: '#66BB6A' },
        { level: 2, sizeDiff: 'large',         tilted: true,  time: 10, coeff: 1.5, color: '#42A5F5' },
        { level: 3, sizeDiff: 'moderateLarge', tilted: false, time: 8,  coeff: 2,   color: '#FFA726' },
        { level: 4, sizeDiff: 'moderateLarge', tilted: true,  time: 8,  coeff: 2.5, color: '#FF7043' },
        { level: 5, sizeDiff: 'small',         tilted: false, time: 5,  coeff: 3,   color: '#AB47BC' },
        { level: 6, sizeDiff: 'small',         tilted: true,  time: 5,  coeff: 3.5, color: '#E53935' },
      ]
    },
  },
  methods: {
    t(key) { return t(this.language, key) },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 700;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  line-height: 1;
}
.close-btn:hover { color: #333; }

.rules-desc {
  margin: 0;
  color: #555;
  font-size: 15px;
  line-height: 1.6;
}

.table-wrap {
  overflow-x: auto;
}

.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.rules-table th {
  background: #4A90E2;
  color: #fff;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
}
.rules-table td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid #e8eaf6;
  color: #333;
}
.rules-table tr:last-child td { border-bottom: none; }
.rules-table tr:hover td { background: #f5f5f5; }

.lv-badge {
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
}

.pos-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
.pos-badge.normal  { background: #e8f5e9; color: #2e7d32; }
.pos-badge.tilted  { background: #fff3e0; color: #e65100; }

.coeff { font-weight: 700; color: #5c6bc0; }

.scoring-note {
  font-size: 14px;
  color: #555;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 16px;
  line-height: 1.6;
}
</style>
