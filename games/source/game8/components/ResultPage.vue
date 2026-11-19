<template>
  <div class="result-page">
    <div class="result-card">
      <div class="trophy">🏆</div>
      <h2 class="game-over-title">{{ t('gameOver') }}</h2>

      <div class="score-display">
        <div class="score-label">{{ t('finalScore') }}</div>
        <div class="score-number">{{ result.score }}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-n">{{ result.total }}</div>
          <div class="stat-l">{{ t('totalQuestions') }}</div>
        </div>
        <div class="stat-box stat-correct">
          <div class="stat-n">{{ result.correct }}</div>
          <div class="stat-l">{{ t('correctAnswers') }}</div>
        </div>
        <div class="stat-box stat-wrong">
          <div class="stat-n">{{ result.wrong }}</div>
          <div class="stat-l">{{ t('wrongAnswers') }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-n">{{ accuracyStr }}</div>
          <div class="stat-l">{{ t('accuracy') }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-n">{{ avgStr }}</div>
          <div class="stat-l">{{ t('avgReactionTime') }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-n">Lv {{ result.level }}</div>
          <div class="stat-l">{{ t('difficulty') }}</div>
        </div>
      </div>

      <BatchTrainActions :home-text="t('backHome')" @home="$emit('back-home')" />
    </div>
  </div>
</template>

<script>
import { t } from '../utils/i18n.js'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

export default {
  name: 'ResultPage',
  components: { BatchTrainActions },
  emits: ['back-home'],
  props: {
    result: { type: Object, required: true },
  },
  computed: {
    accuracyStr() {
      return this.result.total > 0
        ? (this.result.successRate * 100).toFixed(1) + '%'
        : '0%'
    },
    avgStr() {
      return (this.result.avgReaction / 1000).toFixed(2) + 's'
    },
  },
  methods: { t },
}
</script>

<style scoped>
.result-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(155deg, #4A90E2, #4A90E2 50%, #4A90E2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.result-card {
  background: white;
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.3);
  min-width: 55vmin;
  max-width: 90vw;
}

.trophy {
  font-size: 6vmin;
}

.game-over-title {
  font-size: 3.5vmin;
  font-weight: 800;
  color: #4A90E2;
  margin: 0;
}

.score-display {
  background: linear-gradient(135deg, #4A90E2, #4A90E2);
  border-radius: 1.5vmin;
  padding: 2vmin 5vmin;
  text-align: center;
  color: white;
}

.score-label {
  font-size: 1.6vmin;
  opacity: 0.8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.score-number {
  font-size: 6vmin;
  font-weight: 900;
  color: #FFF176;
  line-height: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5vmin;
  width: 100%;
}

.stat-box {
  background: #f5f7ff;
  border-radius: 1vmin;
  padding: 1.2vmin 1vmin;
  text-align: center;
  border: 0.15vmin solid #dde3f0;
}

.stat-correct {
  background: #E8F5E9;
  border-color: #A5D6A7;
}

.stat-wrong {
  background: #FFEBEE;
  border-color: #FFCDD2;
}

.stat-n {
  font-size: 2.8vmin;
  font-weight: 800;
  color: #4A90E2;
  line-height: 1;
}

.stat-correct .stat-n { color: #2e7d32; }
.stat-wrong .stat-n   { color: #c62828; }

.stat-l {
  font-size: 1.3vmin;
  color: #888;
  margin-top: 0.3vmin;
}

.btn-home {
  padding: 1.5vmin 5vmin;
  font-size: 2.2vmin;
  font-weight: 700;
  background: linear-gradient(135deg, #4A90E2, #4A90E2);
  color: white;
  border: none;
  border-radius: 1.2vmin;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: transform 0.12s, box-shadow 0.12s;
  box-shadow: 0 0.5vmin 2vmin rgba(13,71,161,0.4);
}

.btn-home:hover {
  transform: translateY(-0.3vmin);
  box-shadow: 0 1vmin 3vmin rgba(13,71,161,0.5);
}
</style>
