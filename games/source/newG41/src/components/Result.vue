<template>
  <div class="result">
    <Starfield />
    <div class="page">
      <div class="card">
        <div class="card-body">
          <div class="head">
            <div class="rank-badge">
              <div class="rank">{{ rank }}</div>
            </div>
            <h2 class="title">{{ t.resultTitle }}</h2>
          </div>

          <div class="hero">
            <div class="hero-label">{{ t.finalScore }}</div>
            <div class="hero-value">{{ animScore }}</div>
          </div>

          <div class="stats">
            <div class="s-card">
              <div class="s-label">{{ t.finalTotal }}</div>
              <div class="s-value">{{ result.total }}</div>
            </div>
            <div class="s-card">
              <div class="s-label">{{ t.finalSuccess }}</div>
              <div class="s-value ok">{{ result.correct }}</div>
            </div>
            <div class="s-card">
              <div class="s-label">{{ t.finalFail }}</div>
              <div class="s-value bad">{{ result.wrong }}</div>
            </div>
            <div class="s-card">
              <div class="s-label">{{ t.finalRate }}</div>
              <div class="s-value">{{ rate }}%</div>
            </div>
            <div class="s-card">
              <div class="s-label">{{ t.finalAvg }}</div>
              <div class="s-value">{{ result.avgRT }}<span class="unit">{{ t.ms }}</span></div>
            </div>
            <div class="s-card">
              <div class="s-label">{{ t.difficulty }}</div>
              <div class="s-value lv">Lv {{ result.maxLevel }}</div>
            </div>
          </div>
        </div>

        <div class="controls">
          <button class="btn" @click="$emit('again')">🔄 {{ t.playAgain }}</button>
          <button class="btn primary" @click="$emit('home')">🏠 {{ t.backHome }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Starfield from './Starfield.vue'
export default {
  name: 'Result',
  components: { Starfield },
  props: { t: Object, lang: String, result: Object },
  data() { return { animScore: 0, timer: null } },
  computed: {
    rate() { return this.result.total ? Math.round(this.result.correct / this.result.total * 100) : 0 },
    rank() {
      const r = this.rate
      if (r >= 95) return 'S'
      if (r >= 85) return 'A'
      if (r >= 70) return 'B'
      if (r >= 50) return 'C'
      return 'D'
    }
  },
  mounted() {
    const target = this.result.score
    const step = Math.max(1, Math.ceil(target / 40))
    this.timer = setInterval(() => {
      this.animScore = Math.min(target, this.animScore + step)
      if (this.animScore >= target) clearInterval(this.timer)
    }, 30)
  },
  beforeDestroy() { clearInterval(this.timer) }
}
</script>

<style scoped>
.result { position: absolute; inset: 0; overflow: hidden; color: #fff; }
.page {
  position: relative; z-index: 2;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 2vh 2vw;
}
.card {
  width: min(62em, 94vw);
  max-height: 96vh;
  display: flex; flex-direction: column;
  border-radius: 1.4em;
  border: 1px solid rgba(140, 180, 255, 0.3);
  background: rgba(10, 15, 40, 0.6);
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
  overflow: hidden;
}
.card-body {
  flex: 1;
  overflow-y: auto;
  padding: 2em 2.5em 1em;
  display: flex; flex-direction: column; align-items: center; gap: 1em;
  min-height: 0;
}

.head { display: flex; flex-direction: column; align-items: center; gap: 0.5em; }
.rank-badge {
  width: 5.5em; height: 5.5em;
  border-radius: 999px;
  background: conic-gradient(from 0deg, #3d5afe, #7c4dff, #ff4dcb, #ffd43b, #3d5afe);
  padding: 4px;
  animation: rotate 6s linear infinite;
  filter: drop-shadow(0 0 24px rgba(255, 220, 120, 0.55));
  display: flex; align-items: center; justify-content: center;
}
.rank-badge::before {
  content: '';
  position: absolute;
  width: calc(5.5em - 8px); height: calc(5.5em - 8px);
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #1a2050, #050820);
}
@keyframes rotate { to { transform: rotate(360deg); } }
.rank {
  position: relative;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 2.6em;
  background: linear-gradient(180deg, #ffd43b, #ff8a00);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 30px rgba(255, 212, 59, 0.6);
  z-index: 1;
}
.title {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: 1.5em;
  letter-spacing: 0.25em;
  color: #a5c8ff;
  font-weight: 700;
}

.hero { text-align: center; }
.hero-label {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  color: #8fa8d8;
  letter-spacing: 0.3em;
  font-size: 0.85em;
  margin-bottom: 0.1em;
}
.hero-value {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 4em;
  background: linear-gradient(180deg, #fff, #ffd43b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  text-shadow: 0 0 40px rgba(255, 220, 120, 0.4);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8em;
  width: 100%;
  max-width: 44em;
}
.s-card {
  padding: 0.85em 0.6em;
  border-radius: 0.9em;
  border: 1px solid rgba(140, 180, 255, 0.28);
  background: rgba(20, 30, 70, 0.5);
  text-align: center;
}
.s-label {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  color: #a5c0ee;
  font-size: 0.8em;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.3em;
}
.s-value {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 1.7em;
  color: #fff;
  line-height: 1.1;
}
.s-value.ok { color: #69db7c; }
.s-value.bad { color: #ff8787; }
.s-value.lv { color: #ff7ac0; }
.unit { font-size: 0.5em; opacity: 0.6; margin-left: 0.2em; }

.controls {
  flex-shrink: 0;
  display: flex; gap: 1em; justify-content: center;
  padding: 1em 2em 1.5em;
  border-top: 1px solid rgba(140, 180, 255, 0.15);
  background: rgba(5, 10, 30, 0.4);
}
.btn {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  padding: 0.9em 2em;
  font-size: 1.05em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.5);
  background: rgba(20, 30, 70, 0.6);
  color: #e0ecff;
  cursor: pointer;
  letter-spacing: 0.2em;
  transition: all .25s;
}
.btn:hover { border-color: #7fb0ff; color: #fff; transform: translateY(-2px); }
.btn.primary {
  background: linear-gradient(135deg, #3d5afe 0%, #7c4dff 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 24px rgba(90, 100, 255, 0.4);
}
</style>
