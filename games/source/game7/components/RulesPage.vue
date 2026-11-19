<template>
  <div class="rules-page">
    <div class="page-header">
      <button class="back-btn" @click="$emit('back')">← {{ t('back') }}</button>
      <h2 class="page-title">{{ t('rulesTitle') }}</h2>
      <div style="width:6vmin"></div>
    </div>

    <div class="rules-body">
      <!-- Introduction -->
      <section class="rules-section">
        <h3 class="sec-title">{{ t('rulesIntro') }}</h3>
        <p class="sec-text">{{ t('rulesIntroText') }}</p>
      </section>

      <!-- Difficulty table -->
      <section class="rules-section">
        <h3 class="sec-title">{{ t('rulesDiff') }}</h3>
        <div class="table-wrap">
          <table class="rules-table">
            <thead>
              <tr>
                <th>{{ t('levelLabel') }}</th>
                <th>{{ t('colRule') }}</th>
                <th>{{ t('colMatch') }}</th>
                <th>{{ t('colTime') }}</th>
                <th>{{ t('colCoeff') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in diffRows" :key="d.level">
                <td>{{ d.level }}</td>
                <td>{{ t('rulesRule') }}</td>
                <td :class="d.mismatch ? 'mismatch' : 'match'">
                  {{ d.mismatch ? t('mismatch') : t('match') }}
                </td>
                <td>{{ d.timeLimit }}{{ t('secSuffix') }}</td>
                <td>{{ d.coefficient }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Scoring -->
      <section class="rules-section">
        <h3 class="sec-title">{{ t('rulesScoring') }}</h3>
        <p class="sec-text">{{ t('rulesScoringText') }}</p>
      </section>

      <!-- Dynamic difficulty -->
      <section class="rules-section">
        <h3 class="sec-title">{{ t('rulesAuto') }}</h3>
        <p class="sec-text">{{ t('rulesAutoText') }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import { translations } from '../i18n.js'
import { DIFFICULTY_CONFIG } from '../gameConfig.js'

export default {
  name: 'RulesPage',
  props: { lang: String },
  emits: ['back'],
  setup(props) {
    const t = (key) => translations[props.lang][key] || key
    const diffRows = DIFFICULTY_CONFIG.slice(1)
    return { t, diffRows }
  },
}
</script>

<style scoped>
.rules-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2vmin 3vmin;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5vmin;
  flex-shrink: 0;
}
.page-title {
  font-size: 3vmin;
  font-weight: 700;
  color: #333;
}
.back-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
  font-size: 1.8vmin;
  padding: 0.8vmin 2vmin;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover { background: #e9e9e9; }

.rules-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 3vmin;
  padding-right: 0.5vmin;
}

.rules-section {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2.5vmin 3vmin;
}
.sec-title {
  font-size: 2.2vmin;
  font-weight: 600;
  color: #4A90E2;
  margin-bottom: 1.5vmin;
}
.sec-text {
  font-size: 1.8vmin;
  color: #555;
  line-height: 1.8;
}

.table-wrap { overflow-x: auto; }
.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.7vmin;
}
.rules-table thead th {
  background: #e9e9e9;
  color: #666;
  padding: 1.2vmin 2vmin;
  text-align: center;
  border-bottom: 2px solid #ddd;
}
.rules-table tbody td {
  padding: 1.2vmin 2vmin;
  text-align: center;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}
.match    { color: #4CAF50; font-weight: 600; }
.mismatch { color: #f44336; font-weight: 600; }

.rules-body::-webkit-scrollbar { width: 0.5vmin; }
.rules-body::-webkit-scrollbar-track { background: transparent; }
.rules-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
</style>
