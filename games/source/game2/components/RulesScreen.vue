<template>
  <div class="rules-screen">
    <div class="rules-container">
      <h1 class="rules-title">{{ t('gameRules') }}</h1>

      <div class="rules-content">
        <section class="rule-section">
          <h2>{{ t('rulesGameplay') }}</h2>
          <ol>
            <li>{{ t('rulesStep1') }}</li>
            <li>{{ t('rulesStep2') }}</li>
            <li>{{ t('rulesStep3') }}</li>
            <li>{{ t('rulesStep4') }}</li>
            <li>{{ t('rulesStep5') }}</li>
          </ol>
        </section>

        <section class="rule-section">
          <h2>{{ t('rulesDifficulty') }}</h2>
          <div class="difficulty-table">
            <div class="table-row table-header">
              <div>{{ t('level') }}</div>
              <div>{{ t('rulesElements') }}</div>
              <div>{{ t('rulesMemTime') }}</div>
              <div>{{ t('rulesRemoved') }}</div>
              <div>{{ t('rulesScore') }}</div>
            </div>
            <div v-for="level in difficultyLevels" :key="level.level" class="table-row">
              <div>{{ level.level }}</div>
              <div>{{ level.elementCount }}</div>
              <div>{{ level.displayTime }}s</div>
              <div>{{ level.removeCount }}</div>
              <div>{{ (5 * level.coefficient).toFixed(1) }}</div>
            </div>
          </div>
        </section>

        <section class="rule-section">
          <h2>{{ t('rulesAutoAdjust') }}</h2>
          <ul>
            <li>{{ t('rulesAdjust1') }}</li>
            <li>{{ t('rulesAdjust2') }}</li>
            <li>{{ t('rulesAdjust3') }}</li>
          </ul>
        </section>

        <section class="rule-section">
          <h2>{{ t('rulesScoring') }}</h2>
          <p>{{ t('rulesScoringDesc') }}</p>
        </section>
      </div>

      <button class="back-btn" @click="$emit('back')">
        {{ t('back') }}
      </button>
    </div>
  </div>
</template>

<script>
import { DIFFICULTY_LEVELS } from '../config/difficulty.js'

export default {
  name: 'RulesScreen',
  inject: ['i18n'],
  data() {
    return {
      difficultyLevels: DIFFICULTY_LEVELS
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  }
}
</script>

<style scoped>
.rules-screen {
  min-height: calc(100vh - 150px);
  padding: 20px;
}

.rules-container {
  max-width: 900px;
  margin: 0 auto;
}

.rules-title {
  font-size: 32px;
  color: #333;
  text-align: center;
  margin-bottom: 40px;
  font-weight: 700;
}

.rules-content {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.rule-section {
  margin-bottom: 35px;
}

.rule-section:last-child {
  margin-bottom: 0;
}

.rule-section h2 {
  font-size: 22px;
  color: #4CAF50;
  margin-bottom: 15px;
  font-weight: 600;
}

.rule-section ol,
.rule-section ul {
  padding-left: 25px;
  line-height: 1.8;
  color: #555;
}

.rule-section li {
  margin-bottom: 10px;
}

.rule-section p {
  line-height: 1.8;
  color: #555;
}

.difficulty-table {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.table-row:last-child {
  border-bottom: none;
}

.table-header {
  background-color: #4CAF50;
  color: #fff;
  font-weight: 600;
}

.table-row:not(.table-header):hover {
  background-color: #f5f5f5;
}

.back-btn {
  width: 100%;
  max-width: 300px;
  display: block;
  margin: 0 auto;
  padding: 16px;
  font-size: 18px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

@media (max-width: 768px) {
  .rules-content {
    padding: 25px;
  }

  .difficulty-table {
    font-size: 14px;
  }

  .table-row {
    padding: 10px 5px;
  }
}
</style>
