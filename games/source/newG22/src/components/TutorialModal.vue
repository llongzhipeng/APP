<template>
  <div class="modal-mask">
    <div class="modal">
      <div class="header">
        <h2>{{ t('tutorialTitle') }}</h2>
        <button class="skip" @click="$emit('skip')">{{ t('skip') }} →</button>
      </div>

      <div class="body">
        <!-- Demo canvas / illustration -->
        <div class="demo">
          <div class="demo-scene" :class="'step-'+step">
            <!-- Road -->
            <div class="road">
              <div class="lane-divider left"></div>
              <div class="lane-divider right"></div>
              <div class="dashes">
                <div class="dash" v-for="n in 8" :key="'dl'+n"
                     :style="{ animationDelay: (n * -0.4) + 's', left: '33.33%' }"></div>
                <div class="dash" v-for="n in 8" :key="'dr'+n"
                     :style="{ animationDelay: (n * -0.4) + 's', left: '66.66%' }"></div>
              </div>
              <!-- Car -->
              <div class="car" :class="'lane-'+carLane">
                <svg viewBox="0 0 100 140">
                  <defs>
                    <linearGradient id="dbody" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#ff5757"/>
                      <stop offset="1" stop-color="#991b1b"/>
                    </linearGradient>
                  </defs>
                  <ellipse cx="50" cy="130" rx="35" ry="4" fill="rgba(0,0,0,0.5)"/>
                  <path d="M20 25 Q25 10 35 8 L 65 8 Q75 10 80 25 L 82 110 Q82 118 74 118 L 26 118 Q18 118 18 110 Z" fill="url(#dbody)"/>
                  <path d="M28 30 Q32 22 40 22 L 60 22 Q68 22 72 30 L 72 55 Q68 60 60 60 L 40 60 Q32 60 28 55 Z" fill="#0e1a35"/>
                  <rect x="22" y="70" width="56" height="30" rx="4" fill="#ef4444" opacity="0.7"/>
                  <rect x="14" y="35" width="8" height="18" fill="#111"/>
                  <rect x="78" y="35" width="8" height="18" fill="#111"/>
                  <rect x="14" y="85" width="8" height="18" fill="#111"/>
                  <rect x="78" y="85" width="8" height="18" fill="#111"/>
                </svg>
              </div>
              <!-- Obstacle demo -->
              <div class="obstacle" v-if="showObstacle" :class="'lane-'+obstacleLane">
                <svg viewBox="0 0 60 80">
                  <ellipse cx="30" cy="72" rx="20" ry="4" fill="rgba(0,0,0,0.4)"/>
                  <path d="M12 68 L 48 68 L 40 20 L 20 20 Z" fill="#f97316"/>
                  <path d="M20 20 L 40 20 L 32 30 L 28 30 Z" fill="#c2410c"/>
                  <rect x="14" y="45" width="32" height="3" fill="#fff"/>
                  <rect x="14" y="55" width="32" height="3" fill="#fff"/>
                </svg>
              </div>
            </div>

            <!-- Overlay hints -->
            <div class="hint hint-1" v-if="step===1">
              <div class="arrow-down"></div>
              <div class="label">{{ lang==='zh'?'3 条赛道':'3 Lanes' }}</div>
            </div>

            <div class="hint hint-2" v-if="step===2">
              <div class="pulse-ring"></div>
            </div>

            <div class="hint hint-3" v-if="step===3">
              <div class="keys">
                <div class="key" :class="{active: carLane===1}">←</div>
                <div class="key">↑</div>
                <div class="key" :class="{active: carLane===3}">→</div>
              </div>
            </div>

            <div class="hint hint-4" v-if="step===4">
              <div class="score-pop">+{{ 5 * (step) }}</div>
            </div>
          </div>
        </div>

        <div class="info">
          <div class="step-indicator">
            <div class="dot" v-for="n in 4" :key="n" :class="{ active: n === step }"></div>
          </div>
          <h3>{{ t('tutorial'+step+'Title') }}</h3>
          <p>{{ t('tutorial'+step+'Desc') }}</p>
        </div>
      </div>

      <div class="footer">
        <button class="btn btn-secondary" :disabled="step===1" @click="prev">{{ t('prev') }}</button>
        <button class="btn btn-primary" @click="next">
          {{ step === 4 ? t('startNow') : t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
export default {
  name: 'TutorialModal',
  data() {
    return {
      step: 1,
      carLane: 2,
      showObstacle: false,
      obstacleLane: 2,
      timers: []
    }
  },
  computed: {
    lang() { return i18n.lang }
  },
  mounted() { this.runDemo() },
  beforeDestroy() { this.clearTimers() },
  methods: {
    t,
    prev() { if (this.step > 1) { this.step--; this.runDemo() } },
    next() {
      if (this.step < 4) { this.step++; this.runDemo() }
      else this.$emit('done')
    },
    clearTimers() { this.timers.forEach(clearTimeout); this.timers = [] },
    runDemo() {
      this.clearTimers()
      this.carLane = 2
      this.showObstacle = false
      if (this.step === 1) {
        // Just show the lanes
      } else if (this.step === 2) {
        // Obstacle appears in car's lane
        this.timers.push(setTimeout(() => { this.obstacleLane = 2; this.showObstacle = true }, 400))
      } else if (this.step === 3) {
        // Show switching
        this.timers.push(setTimeout(() => { this.obstacleLane = 2; this.showObstacle = true }, 300))
        this.timers.push(setTimeout(() => { this.carLane = 3 }, 1300))
        this.timers.push(setTimeout(() => { this.showObstacle = false; this.carLane = 2 }, 2300))
        this.timers.push(setTimeout(() => { this.obstacleLane = 3; this.showObstacle = true }, 2700))
        this.timers.push(setTimeout(() => { this.carLane = 1 }, 3600))
      } else if (this.step === 4) {
        // Success animation
        this.timers.push(setTimeout(() => { this.obstacleLane = 2; this.showObstacle = true }, 400))
        this.timers.push(setTimeout(() => { this.carLane = 3 }, 1300))
      }
    }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: 90vmin; max-width: 96vw; max-height: 92vh;
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  border-radius: 3vmin; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
  display: flex; flex-direction: column;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
.header {
  padding: 2.4vmin 3vmin; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.header h2 {
  font-size: 3vmin; font-weight: 700;
  background: linear-gradient(90deg, #fbbf24, #ef4444);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.skip {
  padding: 1vmin 2vmin; border-radius: 999px; background: transparent;
  border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.75);
  font-size: 1.8vmin;
}
.skip:hover { color: #fff; border-color: rgba(255,255,255,0.4); }

.body { padding: 3vmin; }

/* Demo scene */
.demo {
  height: 42vmin;
  background: linear-gradient(180deg, #0c1224 0%, #1e293b 100%);
  border-radius: 2vmin; overflow: hidden; position: relative;
  border: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 2.4vmin;
}
.demo-scene { position: absolute; inset: 0; perspective: 500px; overflow: hidden; }
.road {
  position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 80%; height: 100%;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  transform-origin: bottom center;
}
.lane-divider {
  position: absolute; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15));
}
.lane-divider.left { left: 0; } .lane-divider.right { right: 0; }
.dashes { position: absolute; inset: 0; }
.dash {
  position: absolute; width: 4px; height: 20px; background: #facc15;
  border-radius: 2px; top: -20px;
  animation: dashMove 1.6s linear infinite;
}
@keyframes dashMove {
  0% { top: -20px; opacity: 0; transform: scale(0.5); }
  20% { opacity: 0.9; }
  100% { top: 100%; opacity: 0.9; transform: scale(1.4); }
}

.car {
  position: absolute; bottom: 20px;
  width: 15%; max-width: 70px;
  transition: left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 6px 12px rgba(255, 60, 60, 0.5));
}
.car.lane-1 { left: 8%; }
.car.lane-2 { left: 42%; }
.car.lane-3 { left: 76%; }

.obstacle {
  position: absolute; top: 20px;
  width: 12%; max-width: 55px;
  animation: obstacleMove 2.5s linear;
  filter: drop-shadow(0 6px 10px rgba(0,0,0,0.5));
}
.obstacle.lane-1 { left: 10%; }
.obstacle.lane-2 { left: 44%; }
.obstacle.lane-3 { left: 78%; }
@keyframes obstacleMove {
  0% { top: 20px; transform: scale(0.4); opacity: 0.5; }
  60% { opacity: 1; }
  100% { top: 75%; transform: scale(1.4); opacity: 1; }
}

/* Hints */
.hint { position: absolute; z-index: 10; pointer-events: none; }
.hint-1 { top: 20%; left: 50%; transform: translateX(-50%); text-align: center; }
.arrow-down {
  width: 0; height: 0; margin: 0 auto;
  border-left: 12px solid transparent; border-right: 12px solid transparent;
  border-top: 16px solid #fbbf24;
  animation: bounce 1.2s infinite;
}
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.hint-1 .label {
  color: #fbbf24; font-weight: 700; margin-top: 0.8vmin;
  font-size: 2.4vmin;
}

.pulse-ring {
  position: absolute; top: 40%; left: 44%; width: 12%; height: 30%;
  border: 3px solid #ef4444; border-radius: 1.5vmin;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
  100% { transform: scale(1.3); opacity: 0; box-shadow: 0 0 0 20px rgba(239,68,68,0); }
}

.keys { position: absolute; bottom: 1.5vmin; left: 50%; transform: translateX(-50%); display: flex; gap: 1.4vmin; }
.key {
  width: 6vmin; height: 6vmin; min-width: 42px; min-height: 42px; border-radius: 1vmin;
  background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2);
  color: #fff; display: flex; align-items: center; justify-content: center; font-size: 3vmin; font-weight: bold;
  transition: all 0.2s;
}
.key.active { background: #fbbf24; color: #000; border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; transform: scale(1.1); }

.score-pop {
  position: absolute; top: 30%; left: 50%; transform: translateX(-50%);
  color: #fbbf24; font-size: 6vmin; font-weight: 900;
  text-shadow: 0 4px 20px rgba(251, 191, 36, 0.6);
  animation: scorePop 1.5s ease-out infinite;
}
@keyframes scorePop {
  0% { transform: translateX(-50%) translateY(0) scale(0.6); opacity: 0; }
  30% { transform: translateX(-50%) translateY(-2vmin) scale(1.2); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-5vmin) scale(1); opacity: 0; }
}

.info { text-align: center; }
.step-indicator { display: flex; justify-content: center; gap: 1.4vmin; margin-bottom: 2vmin; }
.dot {
  width: 1.4vmin; height: 1.4vmin; min-width: 10px; min-height: 10px; border-radius: 50%; background: rgba(255,255,255,0.2);
  transition: all 0.3s;
}
.dot.active { background: #fbbf24; width: 4vmin; min-width: 28px; border-radius: 4px; }
.info h3 { font-size: 3vmin; margin-bottom: 1vmin; color: #fff; }
.info p { font-size: 2.2vmin; color: rgba(255,255,255,0.75); line-height: 1.6; }

.footer {
  padding: 2.4vmin 3vmin; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: space-between; gap: 2vmin;
}
.btn {
  padding: 1.6vmin 4vmin; border-radius: 1.6vmin; border: 0;
  font-weight: 600; font-size: 2.4vmin;
  min-width: 18vmin; transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
  box-shadow: 0 6px 20px rgba(239,68,68,0.35);
}
.btn-primary:hover { transform: translateY(-0.4vmin); box-shadow: 0 8px 24px rgba(239,68,68,0.5); }
.btn-secondary {
  background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15);
}
.btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.15); }
.btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
