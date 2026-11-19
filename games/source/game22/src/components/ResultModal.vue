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
          <div class="stat-value gold">{{ score }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.totalRounds }}</div>
          <div class="stat-value">{{ totalRounds }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successCount }}</div>
          <div class="stat-value green">{{ correctRounds }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.failCount }}</div>
          <div class="stat-value red">{{ wrongRounds }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successRate }}</div>
          <div class="stat-value">{{ accuracy }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.avgReaction }}</div>
          <div class="stat-value">{{ avgReaction }}</div>
        </div>
      </div>
      <button class="home-btn" @click="$emit('close')">🏠 {{ t.backHome }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'

const props = defineProps({ lang: String, result: Object })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)
const accuracy = computed(() => {
  if (!props.result || props.result.totalRounds === 0) return '0%'
  return Math.round(props.result.correctRounds / props.result.totalRounds * 100) + '%'
})
const score = computed(() => (props.result && props.result.score != null) ? props.result.score : 0)
const totalRounds = computed(() => (props.result && props.result.totalRounds != null) ? props.result.totalRounds : 0)
const correctRounds = computed(() => (props.result && props.result.correctRounds != null) ? props.result.correctRounds : 0)
const wrongRounds = computed(() => (props.result && props.result.wrongRounds != null) ? props.result.wrongRounds : 0)
const avgReaction = computed(() => (props.result && props.result.avgReaction != null) ? props.result.avgReaction : '--')
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.78);
  display: flex; align-items: center; justify-content: center; z-index: 300; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #0a1e35, #061525);
  border: 0.2vmin solid rgba(100,200,255,0.4); border-radius: 2vmin;
  padding: 3.5vmin 5vmin; width: min(65vmin, 94vw);
  display: flex; flex-direction: column; align-items: center; gap: 3vmin;
  box-shadow: 0 2vmin 8vmin rgba(0,0,0,0.7); animation: resultIn 0.4s ease-out;
}
@keyframes resultIn { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
.result-top { display: flex; flex-direction: column; align-items: center; gap: 1vmin; }
.result-icon { font-size: 7vmin; animation: trophy 1s ease-out; }
@keyframes trophy { 0%{transform:scale(0) rotate(-30deg)} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }
.result-title { color: #e8f4ff; font-size: 3.5vmin; font-weight: 900; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5vmin; width: 100%; }
.stat-card {
  background: rgba(255,255,255,0.05); border: 0.15vmin solid rgba(255,255,255,0.1);
  border-radius: 1.2vmin; padding: 1.5vmin 1vmin;
  display: flex; flex-direction: column; align-items: center; gap: 0.6vmin;
}
.stat-card.highlight {
  background: rgba(45,156,219,0.15); border-color: rgba(100,200,255,0.35);
  grid-column: span 3; flex-direction: row; justify-content: center; gap: 2vmin; padding: 2vmin;
}
.stat-label { font-size: 1.5vmin; color: rgba(232,244,255,0.55); text-transform: uppercase; letter-spacing: 0.1vmin; }
.stat-value { font-size: 3vmin; font-weight: 900; color: #e8f4ff; }
.stat-card.highlight .stat-value { font-size: 5.5vmin; }
.stat-value.gold { color: #ffd700; text-shadow: 0 0 2vmin rgba(255,215,0,0.4); }
.stat-value.green { color: #a5d6a7; }
.stat-value.red { color: #ef9a9a; }
.home-btn {
  width: 100%; padding: 1.8vmin; font-size: 2.2vmin; font-weight: 800;
  background: linear-gradient(135deg, #1a6bb5, #2d9cdb);
  border: 0.2vmin solid rgba(100,200,255,0.4); color: #e8f4ff;
  border-radius: 1.5vmin; cursor: pointer; transition: all 0.2s;
}
.home-btn:hover { background: linear-gradient(135deg, #2080cc, #3aafe8); transform: translateY(-0.2vmin); }
</style>
