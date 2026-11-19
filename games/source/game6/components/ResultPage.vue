<template>
  <div class="result-page">
    <div class="result-center">
      <!-- Trophy animation -->
      <div class="trophy">🏆</div>
      <h1 class="game-over-title">{{ t.gameOver }}</h1>

      <!-- Score highlight -->
      <div class="score-highlight">
        <div class="score-label">{{ t.finalScore }}</div>
        <div class="score-value">{{ result.score }}</div>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t.totalCount }}</div>
          <div class="stat-value">{{ result.totalCorrectAppeared }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">{{ t.successCount }}</div>
          <div class="stat-value">{{ result.totalPopped }}</div>
        </div>
        <div class="stat-card fail">
          <div class="stat-label">{{ t.failCount }}</div>
          <div class="stat-value">{{ result.totalCorrectAppeared - result.totalPopped }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successRate }}</div>
          <div class="stat-value">{{ successRate }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.avgReaction }}</div>
          <div class="stat-value">{{ result.avgReactionTime }}<span class="unit">ms</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.difficulty }}</div>
          <div class="stat-value">Lv.{{ result.maxDifficulty }}</div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="result-btns">
        <BatchTrainActions :home-text="t.backHome" @home="$emit('home')" />
        <button class="res-btn primary" @click="$emit('playAgain')">▶ {{ t.playAgain }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

export default {
  name: 'Game6ResultPage',
  components: { BatchTrainActions },
};
</script>

<script setup>
import { computed } from '@vue/composition-api'

const props = defineProps({
  t: Object,
  result: Object,
  duration: Number,
})
defineEmits(['playAgain', 'home'])

const successRate = computed(() => {
  if (!props.result || props.result.totalCorrectAppeared === 0) return 0
  return Math.round((props.result.totalPopped / props.result.totalCorrectAppeared) * 100)
})
</script>

<style scoped>
.result-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.result-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 20px;
  max-width: 520px;
  width: 100%;
}

.trophy {
  font-size: 64px;
  animation: trophyBounce 0.6s ease-out;
}
@keyframes trophyBounce {
  0% { transform: scale(0) rotate(-20deg); }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.game-over-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 3px;
}

.score-highlight {
  background: linear-gradient(135deg, rgba(25,118,210,0.4), rgba(66,165,245,0.2));
  border: 2px solid rgba(66,165,245,0.5);
  border-radius: 16px;
  padding: 20px 60px;
  text-align: center;
  box-shadow: 0 0 30px rgba(33,150,243,0.3);
}
.score-label {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.score-value {
  font-size: 52px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  text-shadow: 0 0 20px rgba(100,181,246,0.8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.stat-card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
}
.stat-card.success {
  background: rgba(76,175,80,0.1);
  border-color: rgba(76,175,80,0.3);
}
.stat-card.fail {
  background: rgba(244,67,54,0.1);
  border-color: rgba(244,67,54,0.3);
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.stat-card.success .stat-value { color: #81c784; }
.stat-card.fail .stat-value { color: #e57373; }
.unit { font-size: 14px; font-weight: 400; opacity: 0.7; margin-left: 2px; }

.result-btns {
  display: flex;
  gap: 16px;
  width: 100%;
}

.res-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 1px;
}
.res-btn.primary {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: #fff;
  box-shadow: 0 4px 15px rgba(33,150,243,0.4);
}
.res-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(33,150,243,0.6); }

.res-btn.secondary {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.2);
}
.res-btn.secondary:hover { background: rgba(255,255,255,0.18); }
</style>
