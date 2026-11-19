<template>
  <div class="duration-page">
    <h2 class="title">{{ t.selectDuration }}</h2>
    <div class="options">
      <button
        v-for="opt in opts" :key="opt.val"
        class="dur-btn"
        :class="{selected: selected === opt.val}"
        @click="selected = opt.val"
      >{{ opt.label }}</button>
    </div>
    <button class="start-btn" :disabled="!selected" @click="$emit('selected', selected)">{{ t.confirmStart }}</button>
    <button class="back-btn" @click="$emit('back')">← {{ t.backBtn }}</button>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String },
  emits: ['selected', 'back'],
  data() { return { selected: null } },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    opts() {
      const t = this.t
      return [{ val: 60, label: t.min1 }, { val: 180, label: t.min3 }, { val: 300, label: t.min5 }]
    },
  },
}
</script>

<style scoped>
.duration-page {
  width: 100vw; height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #0d2b4e 0%, #061525 70%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4vmin;
}
.title { color: #c8e0ff; font-size: 4vmin; font-weight: 700; }
.options { display: flex; gap: 3vmin; }
.dur-btn {
  width: 20vmin; padding: 3vmin 2vmin; font-size: 2.8vmin; font-weight: 700;
  border-radius: 1.5vmin; cursor: pointer;
  background: rgba(20,60,100,0.7); border: 0.3vmin solid rgba(100,180,255,0.2); color: #c8e0ff;
  transition: all 0.2s;
}
.dur-btn:hover { background: rgba(30,80,140,0.9); }
.dur-btn.selected { background: linear-gradient(135deg,#1a5fa8,#2e8fd4); border-color: rgba(100,180,255,0.6); box-shadow: 0 0 2vmin rgba(46,143,212,0.5); }
.start-btn {
  padding: 2vmin 6vmin; font-size: 2.8vmin; font-weight: 700; border-radius: 1.5vmin; cursor: pointer;
  background: linear-gradient(135deg,#1a5fa8,#2e8fd4); border: none; color: #fff;
  box-shadow: 0 0.5vmin 2vmin rgba(46,143,212,0.4);
}
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.back-btn {
  background: transparent; border: none; color: rgba(200,224,255,0.5); font-size: 2vmin; cursor: pointer;
}
.back-btn:hover { color: #c8e0ff; }
</style>
