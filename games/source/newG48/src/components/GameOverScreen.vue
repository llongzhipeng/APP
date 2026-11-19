<template>
  <div class="gameover">
    <div class="card">
      <div class="title-row">{{ t('gameOverTitle') }}</div>

      <div class="score-block">
        <div class="score-label">{{ t('finalScore') }}</div>
        <div class="score-value">{{ animatedScore }}</div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="s-label">{{ t('finalRate') }}</div>
          <div class="s-value" :style="{ color: rateColor }">{{ result.rate }}%</div>
        </div>
        <div class="stat">
          <div class="s-label">{{ t('finalDifficulty') }}</div>
          <div class="s-value"><span class="lvl-chip" :class="'lvl'+result.difficulty">Lv {{ result.difficulty }}</span></div>
        </div>
        <div class="stat">
          <div class="s-label">{{ t('totalObs') }}</div>
          <div class="s-value">{{ result.total }}</div>
        </div>
        <div class="stat">
          <div class="s-label">{{ t('successCount') }}</div>
          <div class="s-value ok">{{ result.success }}</div>
        </div>
        <div class="stat">
          <div class="s-label">{{ t('failCount') }}</div>
          <div class="s-value bad">{{ result.fail }}</div>
        </div>
        <div class="stat">
          <div class="s-label">{{ t('avgReact') }}</div>
          <div class="s-value">{{ result.avgReact }}<span class="unit">{{ t('unit.ms') }}</span></div>
        </div>
      </div>

      <div class="buttons">
        <button class="btn secondary" @click="$emit('home')">{{ t('backHome') }}</button>
        <button class="btn primary" @click="$emit('again')">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'GameOverScreen',
  props: { result: { type: Object, required: true } },
  data() { return { animatedScore: 0 } },
  computed: {
    rateColor() {
      const r = this.result.rate
      if (r >= 90) return '#6aa77a'
      if (r >= 70) return '#d4a94a'
      return '#c5674a'
    }
  },
  mounted() {
    const target = this.result.score
    const dur = 1000
    const start = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      this.animatedScore = Math.round(target * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    tick()
  },
  methods: { t }
}
</script>

<style scoped>
.gameover {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, #fef4e8 0%, #faf6ef 55%, #f2ebde 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 3vh 4vw; overflow: hidden;
}

.card {
  position: relative; z-index: 2;
  width: 100vmin; max-width: 92vw; max-height: 92vh; overflow-y: auto;
  padding: 5vh 6vmin;
  background: #ffffff;
  border: 0.15vmin solid #f0eadf;
  border-radius: 2.8vmin;
  box-shadow: 0 3vmin 8vmin rgba(44, 39, 33, 0.15);
  text-align: center;
  animation: slideUp 0.35s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

.title-row {
  font-size: 5vmin;
  font-weight: 700;
  color: #2c2721;
  letter-spacing: 0.04em;
  margin-bottom: 3vh;
}

.score-block { margin-bottom: 4vh; }
.score-label {
  font-size: 2.2vmin; color: #7a7266;
  letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 0.8vmin;
}
.score-value {
  font-size: 14vmin; font-weight: 800;
  color: #d97757;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.8vmin;
  margin-bottom: 4vh;
}
.stat {
  padding: 2.4vh 1vw;
  background: #faf6ef;
  border: 0.15vmin solid #f0eadf;
  border-radius: 1.6vmin;
}
.s-label {
  font-size: 1.9vmin; color: #7a7266;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.8vmin;
}
.s-value {
  font-size: 3.4vmin; font-weight: 700;
  color: #2c2721; font-variant-numeric: tabular-nums;
}
.s-value.ok { color: #6aa77a; }
.s-value.bad { color: #c5674a; }
.s-value .unit { font-size: 0.55em; opacity: 0.7; margin-left: 4px; font-weight: 500; }

.lvl-chip {
  display: inline-block; padding: 0.6vmin 1.8vmin; border-radius: 1vmin;
  font-size: 2.4vmin; font-weight: 700; color: #fff;
}
.lvl-chip.lvl1 { background: #7cb98f; }
.lvl-chip.lvl2 { background: #6aa77a; }
.lvl-chip.lvl3 { background: #d4a94a; }
.lvl-chip.lvl4 { background: #d47f4a; }
.lvl-chip.lvl5 { background: #c5674a; }
.lvl-chip.lvl6 { background: #a94a3a; }

.buttons { display: flex; gap: 2vmin; justify-content: center; flex-wrap: wrap; }
.btn {
  padding: 1.6vmin 3.6vmin; border-radius: 1.4vmin; border: 0;
  font-size: 2.6vmin; font-weight: 600;
  transition: all 0.2s;
  min-width: 22vmin;
}
.btn.primary {
  background: #d97757; color: #fff;
}
.btn.primary:hover { background: #c5674a; }
.btn.secondary {
  background: #ffffff; color: #2c2721;
  border: 0.2vmin solid #e5ddce;
}
.btn.secondary:hover { border-color: #d97757; color: #d97757; }

@media (max-width: 600px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
