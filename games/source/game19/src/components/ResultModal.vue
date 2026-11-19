<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h2 class="result-title">{{ t.gameOver }}</h2>
      <div class="result-grid">
        <div class="result-item">
          <span class="result-label">{{ t.totalScore }}</span>
          <span class="result-value score-val">{{ result.score }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t.diffLevel }}</span>
          <span class="result-value">{{ result.finalLevel }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t.totalRounds }}</span>
          <span class="result-value">{{ result.totalRounds }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t.successCount }}</span>
          <span class="result-value success-val">{{ result.correctRounds }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t.failCount }}</span>
          <span class="result-value fail-val">{{ result.wrongRounds }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t.successRate }}</span>
          <span class="result-value">{{ result.totalRounds > 0 ? Math.round(result.correctRounds / result.totalRounds * 100) + '%' : '0%' }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t.avgReaction }}</span>
          <span class="result-value">{{ result.avgReaction }}</span>
        </div>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ t.backHome }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String, result: Object })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center; z-index: 300;
}
.modal-box {
  background: linear-gradient(160deg, #0d2137, #060e1a);
  border: 0.2vmin solid rgba(100,180,255,0.4); border-radius: 2vmin;
  padding: 4vmin 5vmin; width: min(60vmin, 92vw);
  display: flex; flex-direction: column; align-items: center; gap: 3vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.7);
  animation: popIn 0.4s ease-out;
}
@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.result-title { color: #c8e0f5; font-size: 3.5vmin; font-weight: 900; }
.result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5vmin 3vmin; width: 100%; }
.result-item { display: flex; flex-direction: column; align-items: center; gap: 0.5vmin; background: rgba(20,50,100,0.5); border-radius: 1vmin; padding: 1.2vmin; }
.result-label { font-size: 1.5vmin; color: rgba(200,224,245,0.6); }
.result-value { font-size: 2.8vmin; font-weight: 800; color: #c8e0f5; }
.score-val { color: #ffd700; font-size: 3.5vmin; }
.success-val { color: #a5d6a7; }
.fail-val { color: #ef9a9a; }
.close-btn {
  padding: 1.5vmin 5vmin; font-size: 2.2vmin; font-weight: 800;
  background: linear-gradient(135deg, #1a4a8a, #2a6abf);
  border: 0.2vmin solid rgba(100,180,255,0.4); color: #c8e0f5;
  border-radius: 1.5vmin; cursor: pointer; transition: all 0.2s;
}
.close-btn:hover { background: linear-gradient(135deg, #2a5a9a, #3a7acf); }
</style>
