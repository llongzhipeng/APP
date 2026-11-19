<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="result-top">
        <div class="result-icon">🏆</div>
        <h2 class="result-title">{{ t.gameOver }}</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-label">{{ t.totalScore }}</div>
          <div class="stat-value gold">{{ result && result.score != null ? result.score : 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.totalRounds }}</div>
          <div class="stat-value">{{ result && result.totalRounds != null ? result.totalRounds : 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successCount }}</div>
          <div class="stat-value green">{{ result && result.correctRounds != null ? result.correctRounds : 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.failCount }}</div>
          <div class="stat-value red">{{ result && result.wrongRounds != null ? result.wrongRounds : 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successRate }}</div>
          <div class="stat-value">{{ accuracy }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.avgReaction }}</div>
          <div class="stat-value">{{ result && result.avgReaction != null ? result.avgReaction : '--' }}</div>
        </div>
      </div>

      <BatchTrainActions :home-text="t.backHome" @home="$emit('close')" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game15ResultModal'
};
</script>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'

const props = defineProps({ lang: String, result: Object })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)

const accuracy = computed(() => {
  if (!props.result || props.result.totalRounds === 0) return '0%'
  return Math.round(props.result.correctRounds / props.result.totalRounds * 100) + '%'
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #2e1a0a, #1a0c05);
  border: 0.2vmin solid rgba(255,200,100,0.4);
  border-radius: 2vmin;
  padding: 3.5vmin 5vmin;
  width: min(65vmin, 94vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  box-shadow: 0 2vmin 8vmin rgba(0,0,0,0.7), 0 0 4vmin rgba(196,124,58,0.15);
  animation: resultIn 0.4s ease-out;
}
@keyframes resultIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.result-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vmin;
}
.result-icon {
  font-size: 7vmin;
  animation: trophy 1s ease-out;
}
@keyframes trophy {
  0% { transform: scale(0) rotate(-30deg); }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.result-title {
  color: #f5e6c8;
  font-size: 3.5vmin;
  font-weight: 900;
  text-shadow: 0 0.3vmin 1.5vmin rgba(0,0,0,0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5vmin;
  width: 100%;
}
.stat-card {
  background: rgba(255,255,255,0.05);
  border: 0.15vmin solid rgba(255,255,255,0.1);
  border-radius: 1.2vmin;
  padding: 1.5vmin 1vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6vmin;
}
.stat-card.highlight {
  background: rgba(196,124,58,0.18);
  border-color: rgba(255,200,80,0.35);
  grid-column: span 3;
  flex-direction: row;
  justify-content: center;
  gap: 2vmin;
  padding: 2vmin;
}
.stat-label {
  font-size: 1.5vmin;
  color: rgba(245,230,200,0.55);
  text-transform: uppercase;
  letter-spacing: 0.1vmin;
}
.stat-value {
  font-size: 3vmin;
  font-weight: 900;
  color: #f5e6c8;
}
.stat-card.highlight .stat-value {
  font-size: 5.5vmin;
}
.stat-value.gold { color: #ffd700; text-shadow: 0 0 2vmin rgba(255,215,0,0.4); }
.stat-value.green { color: #a5d6a7; }
.stat-value.red { color: #ef9a9a; }

.home-btn {
  width: 100%;
  padding: 1.8vmin;
  font-size: 2.2vmin;
  font-weight: 800;
  background: linear-gradient(135deg, #8B5E2A, #C47C3A);
  border: 0.2vmin solid rgba(255,200,100,0.4);
  color: #f5e6c8;
  border-radius: 1.5vmin;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0.5vmin 2vmin rgba(196,124,58,0.3);
}
.home-btn:hover {
  background: linear-gradient(135deg, #A06E35, #D48940);
  transform: translateY(-0.2vmin);
  box-shadow: 0 0.8vmin 3vmin rgba(196,124,58,0.5);
}
</style>
