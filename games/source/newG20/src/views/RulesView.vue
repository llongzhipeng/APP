<template>
  <div class="rules">
    <div class="card">
      <h2>{{ t.rulesTitle }}</h2>
      <ul class="rule-list">
        <li v-for="(rule, i) in t.rulesContent" :key="i">{{ rule }}</li>
      </ul>
      <table class="diff-table">
        <thead>
          <tr>
            <th>{{ t.difficulty }}</th>
            <th>{{ t.lang === 'zh' ? '网格' : 'Grid' }}</th>
            <th>{{ t.lang === 'zh' ? '收货点' : 'Points' }}</th>
            <th>{{ t.lang === 'zh' ? '障碍物' : 'Obstacles' }}</th>
            <th>{{ t.lang === 'zh' ? '系数' : 'Coeff' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in diffs" :key="d.level">
            <td>{{ d.level }}</td>
            <td>{{ d.rows }}×{{ d.cols }}</td>
            <td>{{ d.deliveryMin === d.deliveryMax ? d.deliveryMin : d.deliveryMin + '-' + d.deliveryMax }}</td>
            <td>{{ d.obstacles }}</td>
            <td>{{ d.coeff }}</td>
          </tr>
        </tbody>
      </table>
      <button class="back-btn" @click="$emit('nav', 'home')">← {{ t.back }}</button>
    </div>
  </div>
</template>

<script>
import { DIFFICULTIES } from '../game.js'
export default {
  name: 'RulesView',
  props: ['t'],
  data() { return { diffs: DIFFICULTIES } }
}
</script>

<style scoped>
.rules {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
  background: linear-gradient(135deg, #87ceeb 0%, #98d8e8 50%, #b8e6c9 100%);
  overflow: auto;
}
.card {
  background: #fff;
  border-radius: 3vmin;
  padding: 4vmin 5vmin;
  max-width: 90vw;
  width: 80vmin;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.15);
}
h2 { text-align: center; color: #2c3e50; margin-bottom: 3vmin; font-size: 3.6vmin; }
.rule-list { padding-left: 3vmin; margin-bottom: 3vmin; }
.rule-list li { margin: 1.2vmin 0; color: #34495e; font-size: 2.2vmin; line-height: 1.5; }
.diff-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 3vmin;
  font-size: 2vmin;
}
.diff-table th, .diff-table td {
  padding: 1.2vmin;
  text-align: center;
  border-bottom: 0.2vmin solid #e0e0e0;
}
.diff-table th { background: #f5f7fa; color: #2c3e50; font-weight: 700; }
.back-btn {
  display: block;
  margin: 0 auto;
  padding: 1.4vmin 3vmin;
  border: none;
  background: #4a90e2;
  color: #fff;
  border-radius: 999px;
  font-size: 2.3vmin;
  cursor: pointer;
  font-weight: 600;
  min-width: 18vmin;
  box-shadow: 0 0.6vmin 1.5vmin rgba(74,144,226,0.3);
}
.back-btn:hover { background: #357abd; }

@media (orientation: portrait) {
  .rules {
    padding: 3vmin;
    padding-top: calc(3vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
    align-items: flex-start;
  }
  .card {
    padding: 5vmin 4vmin;
    width: 92vw;
    max-width: 92vw;
    border-radius: 3vmin;
  }
  h2 { font-size: max(5vmin, 20px); margin-bottom: 4vmin; }
  .rule-list { padding-left: 4vmin; }
  .rule-list li { font-size: max(3.4vmin, 14px); margin: 1.6vmin 0; }
  .diff-table { font-size: max(3vmin, 12px); }
  .diff-table th, .diff-table td { padding: 1.4vmin 0.6vmin; }
  .back-btn {
    font-size: max(3.8vmin, 16px);
    padding: 2.4vmin 4vmin;
    min-width: 60vw;
    border-radius: 2.8vmin;
  }
}
</style>
