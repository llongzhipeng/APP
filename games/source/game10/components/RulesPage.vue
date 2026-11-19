<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2>{{ t('rulesTitle') }}</h2>
      <button class="btn btn-secondary" @click="$emit('back')">← {{ t('backBtn') }}</button>
    </div>

    <div class="rules-body card">
      <!-- Difficulty table -->
      <h3>{{ lang === 'zh' ? '难度等级' : 'Difficulty Levels' }}</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ lang === 'zh' ? '难度' : 'Level' }}</th>
              <th>{{ lang === 'zh' ? '路径复杂度' : 'Path' }}</th>
              <th>{{ lang === 'zh' ? '答题时间' : 'Time' }}</th>
              <th>{{ lang === 'zh' ? '难度系数' : 'Coeff.' }}</th>
              <th>{{ lang === 'zh' ? '答对得分' : 'Score' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in diffTable" :key="row.lv">
              <td>Lv.{{ row.lv }}</td>
              <td>{{ lang === 'zh' ? row.desc_zh : row.desc_en }}</td>
              <td>{{ row.time }}s</td>
              <td>×{{ row.coeff }}</td>
              <td class="score-cell">{{ (5 * row.coeff).toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Adaptive rules -->
      <h3 style="margin-top:16px">{{ lang === 'zh' ? '智能难度调整（每30秒）' : 'Adaptive Difficulty (every 30s)' }}</h3>
      <div class="rule-rows">
        <div class="rule-row up">
          <span>≥ 90%</span>
          <span>→ {{ lang === 'zh' ? '难度升级 ⬆' : 'Difficulty up ⬆' }}</span>
        </div>
        <div class="rule-row dn">
          <span>≤ 70%</span>
          <span>→ {{ lang === 'zh' ? '难度降低 ⬇' : 'Difficulty down ⬇' }}</span>
        </div>
        <div class="rule-row">
          <span>70% – 90%</span>
          <span>→ {{ lang === 'zh' ? '保持不变' : 'Unchanged' }}</span>
        </div>
      </div>

      <!-- Scoring -->
      <h3 style="margin-top:16px">{{ lang === 'zh' ? '得分规则' : 'Scoring' }}</h3>
      <p class="rule-desc">
        {{ lang === 'zh'
          ? '每答对1题得分 = 5 × 难度系数。最终得分为所有答对题目的总分。'
          : 'Score per correct answer = 5 × difficulty coefficient. Final score = total of all correct answers.' }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game10RulesPage'
};
</script>

<script setup>
import { useI18n } from '../i18n.js'

const props = defineProps({ lang: String })
defineEmits(['back'])
const t = useI18n(() => props.lang)

const diffTable = [
  { lv: 1, desc_zh: '直线，无分叉',       desc_en: 'Straight, no turns', time: 10, coeff: 1   },
  { lv: 2, desc_zh: '简单走廊+1个转弯',   desc_en: 'Simple + 1 turn',    time: 10, coeff: 1.5 },
  { lv: 3, desc_zh: '简单走廊+2个转弯',   desc_en: 'Simple + 2 turns',   time: 10, coeff: 2   },
  { lv: 4, desc_zh: '简单走廊+3个转弯',   desc_en: 'Simple + 3 turns',   time: 15, coeff: 2.5 },
  { lv: 5, desc_zh: '简单走廊+3个转弯',   desc_en: 'Simple + 3 turns',   time: 13, coeff: 3   },
  { lv: 6, desc_zh: '简单走廊+4个转弯',   desc_en: 'Simple + 4 turns',   time: 20, coeff: 3.5 },
]
</script>

<style scoped>
.page-wrap {
  width: 100vw; height: 100vh;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2vh, 20px);
  padding: clamp(12px, 2.5vw, 28px);
  overflow: hidden;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.page-header h2 {
  font-size: clamp(16px, 3vmin, 28px);
  color: #4A90E2;
  font-weight: 700;
}
.rules-body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
}
h3 {
  font-size: clamp(13px, 2.2vmin, 20px);
  color: #FFB74D;
  font-weight: 600;
}
.table-wrap { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(11px, 1.7vmin, 15px);
}
th, td {
  padding: clamp(5px, 0.9vh, 10px) clamp(8px, 1.2vw, 14px);
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
}
th { color: #666; background: #f8f9fa; }
td { color: #333; }
.score-cell { color: #FFB74D; font-weight: 700; }

.rule-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rule-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 14px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: clamp(12px, 2vmin, 17px);
  color: #333;
  border: 1px solid #e0e0e0;
}
.rule-row.up span:last-child { color: #81C784; font-weight: 700; }
.rule-row.dn span:last-child { color: #EF9A9A; font-weight: 700; }

.rule-desc {
  font-size: clamp(12px, 1.8vmin, 16px);
  color: #666;
  line-height: 1.6;
}
</style>
