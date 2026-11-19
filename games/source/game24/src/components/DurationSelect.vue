<template>
  <div class="duration-page">
    <h2 class="dur-title">{{ t.selectDuration }}</h2>
    <div class="dur-options">
      <div v-for="opt in options" :key="opt.value" class="dur-card" :class="{ selected: selected === opt.value }" @click="selected = opt.value">
        <div class="dur-icon">{{ opt.icon }}</div>
        <div class="dur-label">{{ opt.label }}</div>
        <div class="dur-value">{{ opt.valueLabel }}</div>
      </div>
    </div>
    <button class="confirm-btn" @click="$emit('selected', selected)">{{ t.confirmStart }}</button>
    <button class="back-link" @click="$emit('back')">← {{ t.backBtn }}</button>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String },
  emits: ['selected', 'back'],
  data() { return { selected: 60 } },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    options() {
      return [
        { value: 60, label: this.t.min1, icon: '⏱️', valueLabel: '60s' },
        { value: 180, label: this.t.min3, icon: '⏳', valueLabel: '180s' },
        { value: 300, label: this.t.min5, icon: '🕐', valueLabel: '300s' },
      ]
    }
  }
}
</script>

<style scoped>
.duration-page {
  width: 100vw; height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #1a2a4a 0%, #0a1020 70%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4vmin;
}
.dur-title { color: #e8f0ff; font-size: 3.5vmin; font-weight: 800; text-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.5); }
.dur-options { display: flex; gap: 3vmin; flex-wrap: wrap; justify-content: center; }
.dur-card {
  width: 20vmin; padding: 3vmin 2vmin;
  background: rgba(30,50,90,0.7); border: 0.3vmin solid rgba(255,255,255,0.15);
  border-radius: 2vmin; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 1.5vmin;
  transition: all 0.25s; backdrop-filter: blur(4px);
}
.dur-card:hover { background: rgba(50,80,140,0.8); transform: translateY(-0.5vmin); }
.dur-card.selected {
  background: linear-gradient(135deg, #2A5EA8, #4A90D9);
  border-color: rgba(100,180,255,0.6);
  box-shadow: 0 0.8vmin 3vmin rgba(74,144,217,0.4);
  transform: translateY(-0.5vmin) scale(1.04);
}
.dur-icon { font-size: 5vmin; }
.dur-label { color: #e8f0ff; font-size: 2.2vmin; font-weight: 700; }
.dur-value { color: rgba(232,240,255,0.6); font-size: 1.8vmin; }
.confirm-btn {
  padding: 1.8vmin 6vmin; font-size: 2.4vmin; font-weight: 800;
  background: linear-gradient(135deg, #2A5EA8, #4A90D9);
  border: 0.2vmin solid rgba(100,180,255,0.4); color: #e8f0ff;
  border-radius: 1.5vmin; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 0.5vmin 2vmin rgba(74,144,217,0.3);
}
.confirm-btn:hover { background: linear-gradient(135deg, #3A70C0, #5AA8F0); transform: translateY(-0.2vmin); }
.back-link { background: none; border: none; color: rgba(232,240,255,0.5); font-size: 1.8vmin; cursor: pointer; padding: 0.5vmin 1vmin; transition: color 0.2s; }
.back-link:hover { color: rgba(232,240,255,0.9); }
</style>
