<template>
  <div class="rules-page">
    <div class="rules-header">
      <button class="back-btn" @click="$emit('back')">← {{ t.rulesBack }}</button>
      <h1>{{ t.rulesTitle }}</h1>
      <div style="width:80px" />
    </div>

    <div class="rules-content">
      <!-- Section 1 -->
      <section class="rules-section">
        <h2 class="section-title">📖 {{ t.rulesSection1 }}</h2>
        <p class="section-text">{{ t.rulesDesc1 }}</p>
      </section>

      <!-- Section 2: difficulty table -->
      <section class="rules-section">
        <h2 class="section-title">📊 {{ t.rulesSection2 }}</h2>
        <div class="table-wrap">
          <table class="rules-table">
            <thead>
              <tr>
                <th v-for="col in t.rulesCols" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in t.rulesRows" :key="i">
                <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="rules-section">
        <h2 class="section-title">⚡ {{ t.rulesSection3 }}</h2>
        <p class="section-text">{{ t.rulesDesc3 }}</p>
      </section>

      <!-- Section 4 -->
      <section class="rules-section">
        <h2 class="section-title">🏆 {{ t.rulesSection4 }}</h2>
        <p class="section-text">{{ t.rulesDesc4 }}</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game6RulesPage'
};
</script>

<script setup>
defineProps({ t: Object })
defineEmits(['back'])
</script>

<style scoped>
.rules-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rules-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.back-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.back-btn:hover {
  background: rgba(255,255,255,0.18);
}

.rules-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
}

.rules-content::-webkit-scrollbar {
  width: 6px;
}
.rules-content::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
}
.rules-content::-webkit-scrollbar-thumb {
  background: rgba(100,181,246,0.4);
  border-radius: 3px;
}

.rules-section {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px 24px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #64b5f6;
  margin-bottom: 12px;
}

.section-text {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  line-height: 1.8;
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
  background: rgba(33,150,243,0.25);
  color: #90caf9;
  padding: 10px 14px;
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.1);
}

.rules-table td {
  padding: 10px 14px;
  text-align: center;
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.08);
}

.rules-table tr:nth-child(even) td {
  background: rgba(255,255,255,0.04);
}

.rules-table tr:hover td {
  background: rgba(33,150,243,0.1);
}
</style>
