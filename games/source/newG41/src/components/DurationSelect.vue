<template>
  <div class="duration">
    <Starfield />
    <div class="content">
      <button class="back" @click="$emit('back')">◀ {{ t.back }}</button>
      <h2 class="title">{{ t.durationTitle }}</h2>
      <div class="cards">
        <button v-for="opt in options" :key="opt.min"
          class="card" :class="{selected: selected === opt.min}"
          @click="selected = opt.min">
          <div class="card-inner">
            <div class="min">{{ opt.min }}</div>
            <div class="unit">{{ t.minute }}</div>
            <div class="sub">{{ opt.sub }}</div>
          </div>
          <div class="card-glow"></div>
        </button>
      </div>
      <button class="start" :disabled="!selected" @click="$emit('start', selected * 60)">
        {{ t.startPlay }}
      </button>
    </div>
  </div>
</template>

<script>
import Starfield from './Starfield.vue'
export default {
  name: 'DurationSelect',
  components: { Starfield },
  props: { t: Object, lang: String },
  data() { return { selected: 3 } },
  computed: {
    options() {
      return [
        { min: 1, sub: this.lang === 'zh' ? '快速体验' : 'Quick' },
        { min: 3, sub: this.lang === 'zh' ? '标准训练' : 'Standard' },
        { min: 5, sub: this.lang === 'zh' ? '深度训练' : 'Extended' },
      ]
    }
  }
}
</script>

<style scoped>
.duration { position: absolute; inset: 0; overflow: hidden; color: #fff; }
.content {
  position: relative; z-index: 2;
  height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2.5em; padding: 4vh 4vw;
}
.back {
  position: absolute; top: 2em; left: 2em;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  padding: 0.8em 1.7em;
  font-size: 1.05em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.45);
  background: rgba(10, 15, 40, 0.55);
  color: #e0ecff;
  cursor: pointer;
  backdrop-filter: blur(10px);
  letter-spacing: 0.15em;
  transition: all .2s;
}
.back:hover { border-color: #7fb0ff; color: #fff; }

.title {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.6em, 3vw, 2.6em);
  font-weight: 900;
  letter-spacing: 0.2em;
  background: linear-gradient(180deg, #fff, #a5c8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.cards { display: flex; gap: 2.5em; flex-wrap: wrap; justify-content: center; }
.card {
  position: relative;
  width: 14em; height: 16em;
  border-radius: 1.5em;
  border: 2px solid rgba(140, 180, 255, 0.35);
  background: linear-gradient(180deg, rgba(30, 40, 90, 0.5), rgba(15, 20, 55, 0.6));
  color: #e0ecff;
  cursor: pointer;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all .35s cubic-bezier(.34,1.56,.64,1);
  padding: 0;
}
.card-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.card .min {
  font-family: 'Orbitron', sans-serif;
  font-size: 5.5em; font-weight: 900;
  line-height: 1;
  background: linear-gradient(180deg, #fff, #a5c8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.card .unit { font-family: 'Orbitron', 'Noto Sans SC', sans-serif; letter-spacing: 0.3em; margin-top: 0.5em; opacity: .85; font-size: 1.1em; font-weight: 600; }
.card .sub { margin-top: 1.1em; font-size: 1em; opacity: 0.75; letter-spacing: 0.15em; }
.card:hover { transform: translateY(-8px); border-color: #7fb0ff; box-shadow: 0 15px 40px rgba(100, 160, 255, 0.3); }
.card.selected {
  border-color: transparent;
  background: linear-gradient(135deg, rgba(61, 90, 254, 0.4), rgba(124, 77, 255, 0.4), rgba(255, 77, 203, 0.3));
  box-shadow: 0 15px 50px rgba(120, 100, 255, 0.5), 0 0 0 2px rgba(255, 220, 120, 0.7) inset;
}
.card.selected .min { color: #ffd43b; -webkit-text-fill-color: #ffd43b; background: none; }
.card-glow {
  position: absolute; inset: -50%;
  background: conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,.15) 30%, transparent 60%);
  opacity: 0;
  transition: opacity .3s;
  animation: rotate 8s linear infinite;
}
.card.selected .card-glow { opacity: 1; }
@keyframes rotate { to { transform: rotate(360deg); } }

.start {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 900;
  font-size: 1.5em;
  letter-spacing: 0.25em;
  padding: 1.1em 3.5em;
  border-radius: 999px;
  border: none;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #3d5afe 0%, #7c4dff 50%, #ff4dcb 100%);
  box-shadow: 0 15px 40px rgba(120, 100, 255, 0.5);
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
}
.start:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(120, 100, 255, 0.7); }
.start:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
