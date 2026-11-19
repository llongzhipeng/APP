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
          <div class="stat-value gold">{{ result && result.score || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.totalRounds }}</div>
          <div class="stat-value">{{ result && result.totalRounds || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successCount }}</div>
          <div class="stat-value green">{{ result && result.correctRounds || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.failCount }}</div>
          <div class="stat-value red">{{ result && result.wrongRounds || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.successRate }}</div>
          <div class="stat-value">{{ accuracy }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t.avgReaction }}</div>
          <div class="stat-value">{{ result && result.avgReaction || '--' }}</div>
        </div>
      </div>
      <button class="home-btn" @click="$emit('close')">🏠 {{ t.backHome }}</button>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String, result: Object },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    accuracy() {
      if (!this.result || this.result.totalRounds === 0) return '0%'
      return Math.round(this.result.correctRounds / this.result.totalRounds * 100) + '%'
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.78);
  display: flex; align-items: center; justify-content: center; z-index: 300; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #0d3b2e, #061a12);
  border: 0.2vmin solid rgba(100,255,150,0.3); border-radius: 2vmin;
  padding: 3.5vmin 5vmin; width: min(65vmin, 94vw);
  display: flex; flex-direction: column; align-items: center; gap: 3vmin;
  box-shadow: 0 2vmin 8vmin rgba(0,0,0,0.7); animation: resultIn 0.4s ease-out;
}
@keyframes resultIn { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
.result-top { display: flex; flex-direction: column; align-items: center; gap: 1vmin; }
.result-icon { font-size: 7vmin; }
.result-title { color: #d4f5e0; font-size: 3.5vmin; font-weight: 900; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5vmin; width: 100%; }
.stat-card {
  background: rgba(255,255,255,0.05); border: 0.15vmin solid rgba(255,255,255,0.1);
  border-radius: 1.2vmin; padding: 1.5vmin 1vmin;
  display: flex; flex-direction: column; align-items: center; gap: 0.6vmin;
}
.stat-card.highlight {
  background: rgba(45,184,112,0.15); border-color: rgba(100,255,150,0.3);
  grid-column: span 3; flex-direction: row; justify-content: center; gap: 2vmin; padding: 2vmin;
}
.stat-label { font-size: 1.5vmin; color: rgba(212,245,224,0.55); text-transform: uppercase; }
.stat-value { font-size: 3vmin; font-weight: 900; color: #d4f5e0; }
.stat-card.highlight .stat-value { font-size: 5.5vmin; }
.stat-value.gold { color: #ffd700; }
.stat-value.green { color: #a5d6a7; }
.stat-value.red { color: #ef9a9a; }
.home-btn {
  width: 100%; padding: 1.8vmin; font-size: 2.2vmin; font-weight: 800;
  background: linear-gradient(135deg, #1a7a45, #2db870);
  border: 0.2vmin solid rgba(100,255,150,0.4); color: #d4f5e0;
  border-radius: 1.5vmin; cursor: pointer; transition: all 0.2s;
}
.home-btn:hover { background: linear-gradient(135deg, #22a05a, #38d880); transform: translateY(-0.2vmin); }
</style>
