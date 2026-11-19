<template>
  <div class="rules-view">
    <div class="header">
      <h2>{{ t.rules.title }}</h2>
      <button class="back-btn" @click="$emit('go', 'home')">{{ t.rules.back }}</button>
    </div>
    <div class="content">
      <div class="section">
        <p>{{ t.rules.p1 }}</p>
        <p>{{ t.rules.p2 }}</p>
        <p>{{ t.rules.p3 }}</p>
        <p>{{ t.rules.p4 }}</p>
        <p>{{ t.rules.p5 }}</p>
        <p>{{ t.rules.p6 }}</p>
        <p>{{ t.rules.p7 }}</p>
      </div>
      <div class="section">
        <h3>{{ t.rules.difficultyTable }}</h3>
        <table class="diff-table">
          <thead>
            <tr>
              <th>{{ t.rules.levelCol }}</th>
              <th>{{ t.rules.intervalCol }}</th>
              <th>{{ t.rules.responseCol }}</th>
              <th>{{ t.rules.coefCol }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lvl in levels" :key="lvl.level">
              <td>{{ lvl.level }}</td>
              <td>{{ lvl.interval }}</td>
              <td>{{ lvl.maxResponse }}</td>
              <td>{{ lvl.coef }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { DIFFICULTY_LEVELS } from '../config.js'
export default {
  name: 'RulesView',
  props: { t: { type: Object, required: true } },
  data() { return { levels: DIFFICULTY_LEVELS } }
}
</script>

<style scoped>
.rules-view {
  width: 100%;
  height: 100%;
  background: #f6f8fb;
  display: flex;
  flex-direction: column;
  padding: calc(var(--u) * 2);
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: calc(var(--u) * 1.5);
  border-bottom: 2px solid #e5e9f2;
}
.header h2 {
  font-size: calc(var(--u) * 2.6);
  color: #333;
}
.back-btn {
  padding: calc(var(--u) * 0.8) calc(var(--u) * 2);
  font-size: calc(var(--u) * 1.4);
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: calc(var(--u) * 0.6);
  cursor: pointer;
}
.content {
  margin-top: calc(var(--u) * 1.5);
  overflow-y: auto;
  flex: 1;
  padding-right: calc(var(--u) * 1);
}
.section { margin-bottom: calc(var(--u) * 2); }
.section p {
  font-size: calc(var(--u) * 1.5);
  line-height: 1.75;
  color: #444;
  margin-bottom: calc(var(--u) * 0.6);
}
.section h3 {
  font-size: calc(var(--u) * 1.9);
  color: #333;
  margin-bottom: calc(var(--u) * 1);
}
.diff-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: calc(var(--u) * 0.6);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.diff-table th, .diff-table td {
  padding: calc(var(--u) * 1) calc(var(--u) * 1.2);
  font-size: calc(var(--u) * 1.4);
  text-align: center;
  border-bottom: 1px solid #eef0f5;
}
.diff-table th { background: #667eea; color: #fff; font-weight: 600; }
.diff-table tr:nth-child(even) td { background: #fafbfd; }

@media (orientation: portrait) {
  .rules-view {
    padding: 3vw;
    padding-top: calc(3vw + env(safe-area-inset-top));
    padding-bottom: calc(3vw + env(safe-area-inset-bottom));
  }
  .header h2 { font-size: max(5vmin, 20px); }
  .back-btn {
    padding: 1.6vmin 3.6vmin;
    font-size: max(3.4vmin, 14px);
    border-radius: 2vmin;
  }
  .section p { font-size: max(3.4vmin, 14px); line-height: 1.7; }
  .section h3 { font-size: max(4.2vmin, 17px); }

  /* Shrink table to fit portrait */
  .diff-table th, .diff-table td {
    padding: 1.4vmin 1vmin;
    font-size: max(2.8vmin, 12px);
  }
}
</style>
