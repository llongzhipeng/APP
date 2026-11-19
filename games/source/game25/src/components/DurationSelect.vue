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
  data() { return { selected: 60 } },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    options() {
      return [
        { value: 60, label: this.t.min1, icon: '⏱️', valueLabel: '60s' },
        { value: 180, label: this.t.min3, icon: '⏳', valueLabel: '180s' },
        { value: 300, label: this.t.min5, icon: '🕐', valueLabel: '300s' },
      ]
    },
  },
}
</script>

<style scoped>
.duration-page {
  width: 100vw; height: 100vh; background: #f5f0e8;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4vmin;
}
.dur-title { color: #333; font-size: 3.5vmin; font-weight: 800; }
.dur-options { display: flex; gap: 3vmin; flex-wrap: wrap; justify-content: center; }
.dur-card {
  width: 20vmin; padding: 3vmin 2vmin;
  background: #fff; border: 0.3vmin solid #d0c8b8;
  border-radius: 2vmin; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 1.5vmin;
  transition: all 0.25s; box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.08);
}
.dur-card:hover { background: #f0ebe2; transform: translateY(-0.5vmin); }
.dur-card.selected {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  border-color: #a5d6a7; color: #fff;
  box-shadow: 0 0.8vmin 3vmin rgba(76,175,80,0.35);
  transform: translateY(-0.5vmin) scale(1.04);
}
.dur-icon { font-size: 5vmin; }
.dur-label { color: #333; font-size: 2.2vmin; font-weight: 700; }
.dur-card.selected .dur-label { color: #fff; }
.dur-value { color: #888; font-size: 1.8vmin; }
.dur-card.selected .dur-value { color: rgba(255,255,255,0.8); }
.confirm-btn {
  padding: 1.8vmin 6vmin; font-size: 2.4vmin; font-weight: 800;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  border: 0.2vmin solid #a5d6a7; color: #fff;
  border-radius: 1.5vmin; cursor: pointer; transition: all 0.2s;
}
.confirm-btn:hover { background: linear-gradient(135deg, #43a047, #5cb860); transform: translateY(-0.2vmin); }
.back-link {
  background: none; border: none; color: #999;
  font-size: 1.8vmin; cursor: pointer; padding: 0.5vmin 1vmin; transition: color 0.2s;
}
.back-link:hover { color: #555; }
</style>
