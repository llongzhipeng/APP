<template>
  <div class="rules-screen">
    <h2>{{ t('rulesTitle') }}</h2>
    <div class="rules-content">
      <p><strong>{{ t('gameGoal') }}</strong> {{ t('gameGoalDesc') }}</p>
      <p><strong>{{ t('gameplay') }}</strong> {{ t('gameplayDesc') }}</p>

      <h3>{{ t('difficultyLevels') }}</h3>
      <table class="difficulty-table">
        <thead>
          <tr>
            <th>{{ t('level') }}</th>
            <th>{{ t('interference') }}</th>
            <th>{{ t('timeLimit') }}</th>
            <th>{{ t('coefficient') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 6" :key="i">
            <td>{{ i }}</td>
            <td>{{ t(`diff${i}`) }}</td>
            <td>{{ [15, 10, 10, 10, 10, 8][i-1] }}{{ t('seconds') }}</td>
            <td>{{ [1, 1.5, 2, 2.5, 3, 3.5][i-1] }}</td>
          </tr>
        </tbody>
      </table>

      <p><strong>{{ t('adaptiveDifficulty') }}</strong> {{ t('adaptiveDifficultyDesc') }}</p>
      <p><strong>{{ t('scoringRules') }}</strong> {{ t('scoringRulesDesc') }}</p>
    </div>
    <button @click="goBack" class="back-btn">{{ t('back') }}</button>
  </div>
</template>

<script>
export default {
  name: 'RulesScreen',
  props: {
    t: {
      type: Function,
      required: true
    }
  },
  emits: ['back'],
  methods: {
    goBack() {
      this.$emit('back');
    }
  }
}
</script>

<style scoped>
.rules-screen {
  padding: 80px 20px 40px;
  max-width: 1000px;
  margin: 0 auto;
  color: white;
}

.rules-screen h2 {
  font-size: 36px;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.rules-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 20px;
  color: #333;
  margin-bottom: 30px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.rules-content p {
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 16px;
}

.rules-content h3 {
  margin: 25px 0 15px;
  color: #667eea;
  font-size: 22px;
}

.difficulty-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.difficulty-table th,
.difficulty-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.difficulty-table th {
  background: #667eea;
  color: white;
  font-weight: bold;
}

.difficulty-table tr:nth-child(even) {
  background: #f9f9f9;
}

.back-btn {
  padding: 12px 40px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: block;
  margin: 0 auto;
}

.back-btn:hover {
  background: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .rules-screen h2 {
    font-size: 28px;
  }

  .rules-content {
    padding: 20px;
  }

  .difficulty-table {
    font-size: 14px;
  }

  .difficulty-table th,
  .difficulty-table td {
    padding: 8px;
  }
}
</style>
