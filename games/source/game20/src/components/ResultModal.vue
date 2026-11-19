<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>{{ t.gameOver }}</h2>
      <div class="stats">
        <div class="stat-row"><span>{{ t.totalScore }}</span><span class="val">{{ result.score }}</span></div>
        <div class="stat-row"><span>{{ t.totalRounds }}</span><span class="val">{{ result.totalRounds }}</span></div>
        <div class="stat-row"><span>{{ t.successCount }}</span><span class="val">{{ result.correctRounds }}</span></div>
        <div class="stat-row"><span>{{ t.failCount }}</span><span class="val">{{ result.wrongRounds }}</span></div>
        <div class="stat-row"><span>{{ t.successRate }}</span><span class="val">{{ rate }}%</span></div>
        <div class="stat-row"><span>{{ t.avgReaction }}</span><span class="val">{{ result.avgReaction }}{{ t.sec }}</span></div>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ t.backHome }}</button>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String, result: Object },
  emits: ['close'],
  computed: {
    t() { return messages[this.lang] || messages.zh },
    rate() {
      const { totalRounds, correctRounds } = this.result
      return totalRounds > 0 ? Math.round(correctRounds / totalRounds * 100) : 0
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: linear-gradient(135deg, #0d2b4e, #0a1e35);
  border: 0.2vmin solid rgba(100,180,255,0.3);
  border-radius: 2vmin; padding: 4vmin 5vmin; min-width: 40vmin;
  display: flex; flex-direction: column; align-items: center; gap: 3vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
h2 { color: #c8e0ff; font-size: 4vmin; }
.stats { width: 100%; display: flex; flex-direction: column; gap: 1.5vmin; }
.stat-row { display: flex; justify-content: space-between; color: rgba(200,224,255,0.8); font-size: 2vmin; padding: 0.8vmin 0; border-bottom: 0.1vmin solid rgba(255,255,255,0.08); }
.val { color: #64b4ff; font-weight: 700; }
.close-btn {
  padding: 1.5vmin 4vmin; font-size: 2.2vmin; font-weight: 700; border-radius: 1.2vmin; cursor: pointer;
  background: linear-gradient(135deg,#1a5fa8,#2e8fd4); border: none; color: #fff;
}
</style>
