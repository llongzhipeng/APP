<template>
  <div class="gameover">
    <div class="confetti">
      <div v-for="n in 30" :key="n" class="c"
           :style="confettiStyle(n)"></div>
    </div>

    <div class="card">
      <div class="trophy">
        <div class="trophy-emoji">🏆</div>
        <div class="trophy-ring"></div>
      </div>

      <h1>{{ t('gameOverTitle') }}</h1>

      <div class="score-block">
        <div class="score-label">{{ t('finalScore') }}</div>
        <div class="score-value">{{ animatedScore }}</div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="s-icon">🎯</div>
          <div class="s-label">{{ t('finalRate') }}</div>
          <div class="s-value" :style="{ color: rateColor }">{{ result.rate }}%</div>
        </div>
        <div class="stat">
          <div class="s-icon">📊</div>
          <div class="s-label">{{ t('finalDifficulty') }}</div>
          <div class="s-value"><span class="lvl-chip" :class="'lvl'+result.difficulty">Lv {{ result.difficulty }}</span></div>
        </div>
        <div class="stat">
          <div class="s-icon">🚧</div>
          <div class="s-label">{{ t('totalObs') }}</div>
          <div class="s-value">{{ result.total }}</div>
        </div>
        <div class="stat">
          <div class="s-icon">✅</div>
          <div class="s-label">{{ t('successCount') }}</div>
          <div class="s-value ok">{{ result.success }}</div>
        </div>
        <div class="stat">
          <div class="s-icon">💥</div>
          <div class="s-label">{{ t('failCount') }}</div>
          <div class="s-value bad">{{ result.fail }}</div>
        </div>
        <div class="stat">
          <div class="s-icon">⚡</div>
          <div class="s-label">{{ t('avgReact') }}</div>
          <div class="s-value">{{ result.avgReact }}<span class="unit">{{ t('unit.ms') }}</span></div>
        </div>
      </div>

      <div class="buttons">
        <button class="btn secondary" @click="$emit('home')">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span>{{ t('backHome') }}</span>
        </button>
        <button class="btn primary" @click="$emit('again')">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          <span>{{ t('playAgain') }}</span>
        </button>
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
      if (r >= 90) return '#34d399'
      if (r >= 70) return '#facc15'
      return '#f87171'
    }
  },
  mounted() {
    // Animate score count-up
    const target = this.result.score
    const dur = 1200
    const start = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      this.animatedScore = Math.round(target * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    tick()
  },
  methods: {
    t,
    confettiStyle(n) {
      const seed = n * 137.5
      const left = (Math.sin(seed) * 0.5 + 0.5) * 100
      const delay = (n % 10) * 0.15
      const dur = 2 + (n % 4) * 0.5
      const colors = ['#fbbf24', '#ef4444', '#22d3ee', '#a78bfa', '#34d399', '#f472b6']
      const color = colors[n % colors.length]
      return {
        left: left + '%',
        background: color,
        animationDelay: delay + 's',
        animationDuration: dur + 's',
        transform: `rotate(${(n * 47) % 360}deg)`
      }
    }
  }
}
</script>

<style scoped>
.gameover {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0b1020 60%, #05070f 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 3vh 4vw; overflow: hidden;
}

.confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.c {
  position: absolute; top: -20px; width: 10px; height: 14px; border-radius: 2px;
  animation: fall linear infinite;
  opacity: 0.85;
}
@keyframes fall {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(120vh) rotate(720deg); }
}

.card {
  position: relative; z-index: 2;
  width: min(680px, 92vw); max-height: 92vh; overflow-y: auto;
  padding: 4vh 4vw;
  background: linear-gradient(160deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  backdrop-filter: blur(20px);
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  text-align: center;
  animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }

.trophy {
  position: relative;
  width: clamp(80px, 12vw, 120px); height: clamp(80px, 12vw, 120px);
  margin: 0 auto 2vh;
  display: flex; align-items: center; justify-content: center;
}
.trophy-emoji {
  font-size: clamp(50px, 8vw, 80px);
  filter: drop-shadow(0 10px 20px rgba(251, 191, 36, 0.6));
  animation: bounce 1.6s ease-in-out infinite;
  z-index: 2;
}
.trophy-ring {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 65%);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 0.8; } }

.card h1 {
  font-size: clamp(24px, 3.5vw, 36px); font-weight: 900;
  background: linear-gradient(90deg, #fff 0%, #fbbf24 50%, #ef4444 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 3vh; letter-spacing: 0.05em;
}
.score-block { margin-bottom: 3vh; }
.score-label {
  font-size: clamp(11px, 1.3vw, 14px); color: rgba(255,255,255,0.5);
  letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 0.6em;
}
.score-value {
  font-size: clamp(60px, 10vw, 100px); font-weight: 900;
  background: linear-gradient(180deg, #fef3c7, #fbbf24 50%, #f97316);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 40px rgba(251, 191, 36, 0.4);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2vw;
  margin-bottom: 3vh;
}
.stat {
  padding: 1.5vh 1vw;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
}
.s-icon { font-size: 22px; margin-bottom: 4px; }
.s-label {
  font-size: clamp(10px, 1.1vw, 12px); color: rgba(255,255,255,0.55);
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;
}
.s-value {
  font-size: clamp(16px, 2vw, 22px); font-weight: 800;
  color: #fff; font-variant-numeric: tabular-nums;
}
.s-value.ok { color: #34d399; }
.s-value.bad { color: #f87171; }
.s-value .unit { font-size: 0.6em; opacity: 0.7; margin-left: 3px; font-weight: 500; }

.lvl-chip {
  display: inline-block; padding: 2px 10px; border-radius: 6px;
  font-size: clamp(11px, 1.3vw, 14px); font-weight: 800; color: #000;
}
.lvl-chip.lvl1 { background: #86efac; } .lvl-chip.lvl2 { background: #4ade80; }
.lvl-chip.lvl3 { background: #facc15; } .lvl-chip.lvl4 { background: #fb923c; }
.lvl-chip.lvl5 { background: #f87171; color: #fff; } .lvl-chip.lvl6 { background: #dc2626; color: #fff; }

.buttons { display: flex; gap: 1em; justify-content: center; flex-wrap: wrap; }
.btn {
  display: flex; align-items: center; gap: 8px;
  padding: 1em 2em; border-radius: 12px; border: 0;
  font-size: clamp(13px, 1.5vw, 15px); font-weight: 700;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); min-width: 140px;
  justify-content: center;
}
.btn.primary {
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
  box-shadow: 0 10px 30px rgba(239,68,68,0.4);
}
.btn.primary:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(239,68,68,0.6); }
.btn.secondary {
  background: rgba(255,255,255,0.08); color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}
.btn.secondary:hover { background: rgba(255,255,255,0.15); }

@media (max-width: 600px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
