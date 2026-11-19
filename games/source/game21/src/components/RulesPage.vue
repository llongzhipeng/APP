<template>
  <div class="rules-page">
    <button class="back-btn" @click="$emit('back')">← {{ t.back }}</button>
    <div class="rules-box">
      <h2 class="rules-title">{{ t.rulesTitle }}</h2>
      <ul class="rules-list">
        <li v-for="(r, i) in t.rulesContent" :key="i">{{ r }}</li>
      </ul>
      <h3 class="table-title">{{ t.lang === 'EN' ? 'Difficulty Levels' : '难度等级' }}</h3>
      <table class="diff-table">
        <thead>
          <tr>
            <th>{{ t.lang === 'EN' ? 'Level' : '难度' }}</th>
            <th>{{ t.lang === 'EN' ? 'Fish' : '鱼数' }}</th>
            <th>{{ t.lang === 'EN' ? 'Mem(s)' : '记忆(s)' }}</th>
            <th>{{ t.lang === 'EN' ? 'Range' : '数字范围' }}</th>
            <th>{{ t.lang === 'EN' ? 'Coef' : '系数' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in t.difficultyTable" :key="d.level">
            <td>{{ d.level }}</td><td>{{ d.fish }}</td><td>{{ d.mem }}</td>
            <td>{{ d.range }}</td><td>{{ d.coef }}</td>
          </tr>
        </tbody>
      </table>
      <p class="scoring-note">{{ t.lang === 'EN'
        ? 'Score per correct answer = 5 × difficulty coefficient'
        : '每题得分 = 5 × 难度系数，每60秒统计正确率自动调整难度' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RulesPage',
  props: { t: Object },
  emits: ['back'],
}
</script>

<style scoped>
.rules-page {
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.back-btn {
  position: absolute; top: 20px; left: 20px;
  background: rgba(0,0,0,0.55); border: 2px solid rgba(0,0,0,0.3);
  color: #fff; padding: 8px 18px; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer; backdrop-filter: blur(4px);
}
.back-btn:hover { background: rgba(0,0,0,0.75); }
.rules-box {
  background: rgba(0,30,60,0.75); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 20px;
  padding: 40px 50px; max-width: 700px; width: 90%; color: #fff;
}
.rules-title { font-size: 28px; font-weight: 800; margin-bottom: 20px; text-align: center; color: #7ee8fa; }
.rules-list { list-style: none; margin-bottom: 24px; }
.rules-list li { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 16px; }
.rules-list li::before { content: '🐟 '; }
.table-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #7ee8fa; }
.diff-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
.diff-table th, .diff-table td {
  padding: 8px 12px; text-align: center;
  border: 1px solid rgba(255,255,255,0.15);
}
.diff-table th { background: rgba(0,180,255,0.2); font-weight: 700; }
.diff-table tr:nth-child(even) td { background: rgba(255,255,255,0.05); }
.scoring-note { font-size: 13px; color: rgba(255,255,255,0.6); text-align: center; }
</style>
