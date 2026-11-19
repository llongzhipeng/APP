<template>
  <div class="overlay">
    <div class="box">
      <h2 class="title">{{ t.gameOver }}</h2>
      <div class="stats">
        <div class="stat-row"><span class="stat-label">{{ t.totalScore }}</span><span class="stat-val gold">{{ result.score }}</span></div>
        <div class="stat-row"><span class="stat-label">{{ t.diffLevel }}</span><span class="stat-val">{{ result.level }}</span></div>
        <div class="stat-row"><span class="stat-label">{{ t.totalRounds }}</span><span class="stat-val">{{ result.total }}</span></div>
        <div class="stat-row"><span class="stat-label">{{ t.successCount }}</span><span class="stat-val green">{{ result.correct }}</span></div>
        <div class="stat-row"><span class="stat-label">{{ t.failCount }}</span><span class="stat-val red">{{ result.wrong }}</span></div>
        <div class="stat-row"><span class="stat-label">{{ t.successRate }}</span><span class="stat-val">{{ result.rate }}%</span></div>
        <div class="stat-row"><span class="stat-label">{{ t.avgReaction }}</span><span class="stat-val">{{ result.avgRT }}{{ t.sec }}</span></div>
      </div>
      <button class="home-btn" @click="$emit('home')">{{ t.backHome }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String, result: Object })
defineEmits(['home'])
const t = computed(() => messages[props.lang] || messages.zh)
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.box {
  background: linear-gradient(160deg, #0e1a30, #060e1a);
  border: 0.2vmin solid rgba(100,150,255,0.3); border-radius: 2vmin;
  padding: 3.5vmin 5vmin; width: min(55vmin, 90vw);
  display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.title { color: #e8f0ff; font-size: 3.5vmin; font-weight: 900; }
.stats { width: 100%; display: flex; flex-direction: column; gap: 1.2vmin; }
.stat-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1vmin 1.5vmin; background: rgba(255,255,255,0.05); border-radius: 0.8vmin;
}
.stat-label { font-size: 1.9vmin; color: rgba(200,220,255,0.7); }
.stat-val { font-size: 2.2vmin; font-weight: 800; color: #e8f0ff; }
.stat-val.gold { color: #ffd700; }
.stat-val.green { color: #4caf50; }
.stat-val.red { color: #f44336; }
.home-btn {
  padding: 1.8vmin 5vmin; font-size: 2.2vmin; font-weight: 800;
  border-radius: 1.2vmin; cursor: pointer;
  background: linear-gradient(135deg, #2a4a8a, #4a7acc);
  border: 0.2vmin solid rgba(100,150,255,0.4); color: #e8f0ff; transition: all 0.2s;
}
.home-btn:hover { background: linear-gradient(135deg, #3a5a9a, #5a8adc); }
</style>
