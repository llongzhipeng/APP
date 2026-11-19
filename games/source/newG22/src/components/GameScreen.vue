<template>
  <div class="game" ref="root">
    <canvas ref="canvas" class="canvas"></canvas>

    <!-- Top HUD -->
    <div class="hud-top">
      <div class="hud-left">
        <div class="hud-item">
          <div class="label">{{ t('difficulty') }}</div>
          <div class="value">
            <span class="lvl-chip" :class="'lvl'+difficulty.level">Lv {{ difficulty.level }}</span>
          </div>
        </div>
        <div class="hud-item">
          <div class="label">{{ t('score') }}</div>
          <div class="value score-value">{{ score }}</div>
        </div>
        <div class="hud-item">
          <div class="label">{{ t('timeLeft') }}</div>
          <div class="value">{{ formatTime(timeLeft) }}</div>
        </div>
      </div>
      <div class="hud-center">
        <div class="rule-banner">{{ ruleText }}</div>
      </div>
      <div class="hud-right">
        <button
          v-if="showBatchSkip"
          class="skip-btn"
          type="button"
          @click="$emit('batch-skip')"
        >⏭ {{ lang === 'zh' ? '跳过游戏' : 'Skip' }}</button>
        <button class="quit-btn" @click="pauseGame">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
      </div>
    </div>

    <!-- Countdown -->
    <transition name="pop">
      <div class="countdown" v-if="countdown !== null">
        <div class="countdown-num" :class="{ go: countdown === 0 }">
          {{ countdown === 0 ? t('countdown.go') : countdown }}
        </div>
      </div>
    </transition>

    <!-- Difficulty change banner -->
    <transition name="banner">
      <div class="difficulty-banner" v-if="diffBanner" :class="diffBanner.type">
        <div class="banner-icon">{{ diffBanner.type === 'up' ? '🔥' : '💧' }}</div>
        <div class="banner-text">
          <div>{{ diffBanner.type === 'up' ? t('difficultyUp') : t('difficultyDown') }}</div>
          <div class="sub">Lv {{ diffBanner.newLevel }}</div>
        </div>
      </div>
    </transition>

    <!-- Invisible tap zones for touch input (always active while running) -->
    <div class="tap-zones" v-if="running && !paused">
      <div class="tap-zone left" @click="move(-1)" @touchstart.prevent="move(-1)"></div>
      <div class="tap-zone center" @click="stayCenter" @touchstart.prevent="stayCenter"></div>
      <div class="tap-zone right" @click="move(1)" @touchstart.prevent="move(1)"></div>
    </div>

    <!-- First-time control hint (shown once, auto-hides after first move or timeout) -->
    <transition name="hint-fade">
      <div class="ctrl-hint" v-if="showControlHint">
        <div class="hint-card">
          <div class="hint-title">{{ lang==='zh' ? '如何操作' : 'How to Play' }}</div>
          <div class="hint-body">
            <div class="hint-row">
              <div class="hint-keys">
                <div class="kbd">←</div><div class="kbd">↑</div><div class="kbd">→</div>
              </div>
              <div class="hint-text">{{ lang==='zh' ? '键盘方向键切换赛道' : 'Arrow keys to switch lanes' }}</div>
            </div>
            <div class="hint-row">
              <div class="hint-touch">
                <div class="touch-box"><span>◀</span></div>
                <div class="touch-box"><span>●</span></div>
                <div class="touch-box"><span>▶</span></div>
              </div>
              <div class="hint-text">{{ lang==='zh' ? '或点击/触摸屏幕左中右区域' : 'Or tap left / center / right of screen' }}</div>
            </div>
          </div>
          <button class="hint-btn" @click="dismissHint">{{ lang==='zh' ? '我知道了' : 'Got it' }}</button>
        </div>
      </div>
    </transition>

    <!-- On-screen buttons (first-time only, auto-hides after first move) -->
    <transition name="ctrls-fade">
      <div class="hud-bottom" v-if="showControls">
        <button class="lane-btn" @click.stop="move(-1)" :class="{ active: currentLane === 1 }">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <button class="lane-btn center" @click.stop="stayCenter" :class="{ active: currentLane === 2 }">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
        </button>
        <button class="lane-btn" @click.stop="move(1)" :class="{ active: currentLane === 3 }">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 11v2h12.17l-5.58 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4z"/></svg>
        </button>
      </div>
    </transition>

    <!-- Pause Modal -->
    <div class="pause-mask" v-if="paused">
      <div class="pause-modal">
        <div class="pause-icon">⏸</div>
        <h2>{{ t('pauseTitle') }}</h2>
        <p>{{ t('pauseTip') }}</p>
        <div class="pause-buttons">
          <button class="pbtn secondary" @click="resumeGame">{{ t('continue') }}</button>
          <button class="pbtn danger" @click="confirmQuit">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { i18n, t } from '../i18n.js'
import { getDifficulty } from '../difficulty.js'
import { saveRecord } from '../store.js'
import {
  drawScene, drawCar, drawObstacle, drawSpeedLines, drawExplosion, drawScorePop,
  laneX, laneY, laneScale
} from '../game/render.js'

export default {
  name: 'GameScreen',
  props: {
    duration: { type: Number, required: true },
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      w: 0,
      h: 0,
      dpr: 1,

      // Game state
      running: false,
      paused: false,
      countdown: 3,
      timeLeft: 0,
      startedAt: 0,
      elapsed: 0, // paused-aware
      pauseStart: 0,

      // Car / lane
      currentLane: 2,
      targetLane: 2,
      carLaneVisual: 2, // smoothly interpolated

      // Difficulty
      difficultyLevel: getBatchStartDifficultyForGame('jssc'),

      // Score
      score: 0,

      // Stats
      total: 0,
      success: 0,
      fail: 0,
      reactSum: 0,   // sum of reaction times (ms)
      reactCount: 0,
      lastObstacleSpawn: 0,

      // Windowed accuracy tracking
      windowStart: 0,
      windowSuccess: 0,
      windowFail: 0,

      // Effects
      diffBanner: null,
      diffBannerTimer: null,

      // Onboarding
      showControlHint: false,
      showControls: false,
      hasMoved: false,
      controlsHideTimer: null,

      // Runtime objects
      obstacles: [], // { z, lane, type, spawnTime, id, judged, hit, judgedTime }
      effects: [],   // explosions, score pops
      time: 0,       // ms elapsed within running
      roadScroll: 0,

      // Loop control
      rafId: 0,
      lastFrameTime: 0
    }
  },
  computed: {
    difficulty() { return getDifficulty(this.difficultyLevel) },
    lang() { return i18n.lang },
    ruleText() {
      return i18n.lang === 'zh'
        ? '请驾驶车辆并注意躲避障碍物'
        : 'Drive and dodge the obstacles'
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('keydown', this.onKey)
    this.timeLeft = this.duration
    // First time seeing the game? show onboarding hint and wait for dismiss
    const seen = localStorage.getItem('newG22_ctrl_hint_seen')
    if (!seen) {
      this.showControlHint = true
      this.showControls = true
      // Countdown starts when user dismisses the hint
    } else {
      this.startCountdown()
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('keydown', this.onKey)
    cancelAnimationFrame(this.rafId)
    if (this.diffBannerTimer) clearTimeout(this.diffBannerTimer)
    if (this.controlsHideTimer) clearTimeout(this.controlsHideTimer)
  },
  methods: {
    t,
    resize() {
      const rect = this.$refs.root.getBoundingClientRect()
      this.w = rect.width
      this.h = rect.height
      this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      this.canvas.width = this.w * this.dpr
      this.canvas.height = this.h * this.dpr
      this.canvas.style.width = this.w + 'px'
      this.canvas.style.height = this.h + 'px'
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    },
    formatTime(sec) {
      const s = Math.max(0, Math.ceil(sec))
      const m = Math.floor(s / 60)
      const r = s % 60
      return `${m}:${String(r).padStart(2, '0')}`
    },
    startCountdown() {
      this.countdown = 3
      const tick = () => {
        setTimeout(() => {
          this.countdown--
          if (this.countdown < 0) {
            this.countdown = null
            this.startGame()
          } else {
            tick()
          }
        }, 800)
      }
      tick()
    },
    startGame() {
      this.running = true
      this.startedAt = performance.now()
      this.lastFrameTime = this.startedAt
      this.time = 0
      this.elapsed = 0
      this.windowStart = 0
      this.lastObstacleSpawn = 0
      this.playDifficultyVoice()
      this.loop()
    },
    loop() {
      if (!this.running) return
      const now = performance.now()
      const dt = Math.min(50, now - this.lastFrameTime) // clamp for tab-switches
      this.lastFrameTime = now
      if (!this.paused) {
        this.update(dt)
      }
      this.render()
      this.rafId = requestAnimationFrame(() => this.loop())
    },
    update(dt) {
      this.time += dt
      this.timeLeft = this.duration - this.time / 1000
      if (this.timeLeft <= 0) {
        this.timeLeft = 0
        this.endGame()
        return
      }
      // Road scroll speed based on difficulty
      this.roadScroll += (this.difficulty.carSpeed / 400) * (dt / 16.67) * 0.15

      // Smooth lane transition
      const laneEasing = 0.18
      this.carLaneVisual += (this.currentLane - this.carLaneVisual) * laneEasing

      // Spawn obstacles
      if (this.time - this.lastObstacleSpawn > this.difficulty.obstacleInterval) {
        this.spawnObstacle()
        this.lastObstacleSpawn = this.time
      }

      // Move obstacles forward
      const zSpeed = (this.difficulty.carSpeed / 400) * (dt / 1000) * 0.55
      for (const o of this.obstacles) {
        o.z += zSpeed
      }

      // Judge obstacles that reach the car (z >= 0.78)
      for (const o of this.obstacles) {
        if (!o.judged && o.z >= 0.78) {
          o.judged = true
          o.judgedTime = this.time
          if (o.lane === this.currentLane) {
            // Obstacle stayed in car's lane → collision
            o.hit = true
            this.fail++
            this.windowFail++
            this.total++
            const react = this.time - o.spawnTime
            this.reactSum += react
            this.reactCount++
            this.effects.push({
              type: 'explosion',
              x: laneX(this.w, this.currentLane, 0.82),
              y: laneY(this.h, this.h * 0.4, 0.82) - 20,
              start: this.time,
              dur: 700
            })
            this.effects.push({
              type: 'text',
              x: this.w / 2,
              y: this.h * 0.5,
              text: t('crashed'),
              color: '#ef4444',
              start: this.time,
              dur: 900
            })
          } else if (o.spawnLane === o.spawnCarLane) {
            // Obstacle was spawned in the car's driving lane and player dodged → score
            this.success++
            this.windowSuccess++
            this.total++
            const react = this.time - o.spawnTime
            this.reactSum += react
            this.reactCount++
            const pts = Math.round(5 * this.difficulty.coeff)
            this.score += pts
            this.effects.push({
              type: 'text',
              x: laneX(this.w, o.lane, 0.82),
              y: laneY(this.h, this.h * 0.4, 0.82) - 20,
              text: '+' + pts,
              color: '#fbbf24',
              start: this.time,
              dur: 900
            })
          }
          // Otherwise: obstacle was never in car's lane → no score, no penalty
        }
      }

      // Remove obstacles that passed
      this.obstacles = this.obstacles.filter(o => o.z < 1.15)
      // Remove finished effects
      this.effects = this.effects.filter(e => this.time - e.start < e.dur)

      // Difficulty auto-adjust every 60s
      if (this.time - this.windowStart >= 60000) {
        this.evaluateDifficultyWindow()
        this.windowStart = this.time
        this.windowSuccess = 0
        this.windowFail = 0
      }
    },
    spawnObstacle() {
      // Obstacles primarily appear ahead in the car's current driving lane
      const rand = Math.random()
      let lane
      if (rand < 0.85) {
        lane = this.currentLane
      } else {
        const options = [1, 2, 3].filter(l => l !== this.currentLane)
        lane = options[Math.floor(Math.random() * options.length)]
      }
      const types = ['cone', 'barrier', 'oildrum', 'rock']
      const type = types[Math.floor(Math.random() * types.length)]
      this.obstacles.push({
        id: Math.random(),
        lane,
        spawnLane: lane,
        spawnCarLane: this.currentLane,
        z: 0,
        type,
        spawnTime: this.time,
        judged: false,
        hit: false
      })
    },
    evaluateDifficultyWindow() {
      const total = this.windowSuccess + this.windowFail
      if (total === 0) return
      const rate = this.windowSuccess / total
      if (rate >= 0.9 && this.difficultyLevel < 6) {
        this.difficultyLevel++
        this.showDiffBanner('up', this.difficultyLevel)
        this.playDifficultyVoice()
      } else if (rate < 0.7 && this.difficultyLevel > 1) {
        this.difficultyLevel--
        this.showDiffBanner('down', this.difficultyLevel)
        this.playDifficultyVoice()
      }
    },
    playDifficultyVoice() {
      try {
        const folder = i18n.lang === 'zh' ? 'chinese' : 'english'
        const audio = new Audio(resolveVoice(`/voice/${folder}/1.mp3`))
        audio.volume = 1
        const p = audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch (e) { /* ignore */ }
    },
    showDiffBanner(type, newLevel) {
      this.diffBanner = { type, newLevel }
      if (this.diffBannerTimer) clearTimeout(this.diffBannerTimer)
      this.diffBannerTimer = setTimeout(() => { this.diffBanner = null }, 2500)
    },
    render() {
      const { ctx, w, h } = this
      const state = { time: this.time, roadScroll: this.roadScroll }
      ctx.clearRect(0, 0, w, h)
      drawScene(ctx, w, h, state)

      // Speed lines
      drawSpeedLines(ctx, w, h, this.difficulty.carSpeed, this.time)

      const horizonY = h * 0.4

      // Draw obstacles sorted by z (far to near)
      const sorted = [...this.obstacles].sort((a, b) => a.z - b.z)
      for (const o of sorted) {
        if (o.z < 0 || o.z > 1.1) continue
        const x = laneX(w, o.lane, o.z)
        const y = laneY(h, horizonY, o.z)
        const scale = laneScale(o.z) * (Math.min(w, h) / 700)
        drawObstacle(ctx, x, y, scale, o.type)
      }

      // Draw car (visual lane interpolated)
      const carZ = 0.82
      const carX = laneX(w, this.carLaneVisual, carZ)
      const carY = laneY(h, horizonY, carZ) - Math.min(w, h) * 0.02
      const carScale = laneScale(carZ) * (Math.min(w, h) / 620)
      const tilt = (this.currentLane - this.carLaneVisual) * 0.12
      drawCar(ctx, carX, carY, carScale, tilt)

      // Draw effects
      for (const e of this.effects) {
        const progress = (this.time - e.start) / e.dur
        if (e.type === 'explosion') {
          drawExplosion(ctx, e.x, e.y, progress)
        } else if (e.type === 'text') {
          drawScorePop(ctx, e.x, e.y, e.text, e.color, progress)
        }
      }
    },
    move(dir) {
      if (!this.running || this.paused) return
      const newLane = Math.max(1, Math.min(3, this.currentLane + dir))
      if (newLane !== this.currentLane) {
        this.currentLane = newLane
        this.onFirstMove()
      }
    },
    stayCenter() {
      if (!this.running || this.paused) return
      if (this.currentLane !== 2) {
        this.currentLane = 2
        this.onFirstMove()
      }
    },
    onFirstMove() {
      if (this.hasMoved) return
      this.hasMoved = true
      // Fade out on-screen buttons after a brief delay so user sees they responded
      if (this.controlsHideTimer) clearTimeout(this.controlsHideTimer)
      this.controlsHideTimer = setTimeout(() => {
        this.showControls = false
      }, 1200)
    },
    dismissHint() {
      this.showControlHint = false
      localStorage.setItem('newG22_ctrl_hint_seen', '1')
      // Fallback: hide on-screen buttons after 10s even if user hasn't moved
      if (this.controlsHideTimer) clearTimeout(this.controlsHideTimer)
      this.controlsHideTimer = setTimeout(() => {
        if (!this.hasMoved) this.showControls = false
      }, 10000)
      // Countdown was deferred; start it now
      if (this.countdown === 3 && !this.running) this.startCountdown()
    },
    onKey(e) {
      if (!this.running || this.paused) return
      if (e.key === 'ArrowLeft') { this.move(-1); e.preventDefault() }
      else if (e.key === 'ArrowRight') { this.move(1); e.preventDefault() }
      else if (e.key === 'ArrowUp') { this.stayCenter(); e.preventDefault() }
      else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { this.pauseGame(); e.preventDefault() }
    },
    pauseGame() {
      if (!this.running) return
      this.paused = true
    },
    resumeGame() {
      this.paused = false
      // Reset lastFrameTime so no big dt after resume
      this.lastFrameTime = performance.now()
    },
    confirmQuit() {
      this.running = false
      this.paused = false
      this.$emit('quit')
    },
    endGame() {
      this.running = false
      cancelAnimationFrame(this.rafId)
      const total = this.success + this.fail
      const rate = total === 0 ? 0 : Math.round((this.success / total) * 100)
      const avgReact = this.reactCount === 0 ? 0 : Math.round(this.reactSum / this.reactCount)
      const record = {
        time: Date.now(),
        duration: this.duration,
        difficulty: this.difficultyLevel,
        total: this.total,
        success: this.success,
        fail: this.fail,
        rate,
        avgReact,
        score: this.score
      }
      saveRecord(record)
      this.$emit('finish', record)
    }
  }
}
</script>

<style scoped>
.game {
  position: absolute; inset: 0;
  overflow: hidden;
  background: #05070f;
}
.canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  display: block;
}

/* Invisible tap zones layered over the canvas (below HUD) */
.tap-zones {
  position: absolute; inset: 0;
  display: flex; z-index: 2;
}
.tap-zone { flex: 1; cursor: pointer; }

.hud-top {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 2.5vmin 3vmin; z-index: 5;
  pointer-events: none;
  gap: 2vmin;
}
.hud-top > * { pointer-events: auto; }
.hud-left {
  display: flex; gap: 3vmin;
  background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(12px);
  padding: 2vmin 3vmin; border-radius: 2vmin;
  border: 1px solid rgba(255,255,255,0.1);
}
.hud-item {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.4vmin;
  min-width: 10vmin;
}
.hud-item .label {
  font-size: 1.6vmin; color: rgba(255,255,255,0.65);
  letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
}
.hud-item .value {
  font-size: 3vmin; font-weight: 800; color: #fff;
  font-variant-numeric: tabular-nums; line-height: 1.1;
}
.score-value {
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.lvl-chip {
  display: inline-block; padding: 0.4vmin 1.6vmin; border-radius: 1vmin;
  font-size: 2.2vmin; font-weight: 800; color: #000;
}
.lvl-chip.lvl1 { background: #86efac; }
.lvl-chip.lvl2 { background: #4ade80; }
.lvl-chip.lvl3 { background: #facc15; }
.lvl-chip.lvl4 { background: #fb923c; }
.lvl-chip.lvl5 { background: #f87171; color: #fff; }
.lvl-chip.lvl6 { background: #dc2626; color: #fff; }

.hud-center {
  position: absolute; top: 3vmin; left: 50%; transform: translateX(-50%);
  z-index: 4;
  max-width: 60vw;
}
.rule-banner {
  display: inline-block;
  background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(12px);
  padding: 1.6vmin 3.5vmin; border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 2vmin; color: rgba(255,255,255,0.95); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 100%;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}
.hud-right {
  display: flex;
  align-items: center;
  gap: 1.2vmin;
}
.skip-btn {
  padding: 1.4vmin 2.4vmin;
  min-height: 44px;
  border-radius: 1.4vmin;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(250, 204, 21, 0.45);
  color: #fde68a;
  font-size: 1.8vmin;
  font-weight: 600;
  white-space: nowrap;
}
.skip-btn:hover { background: rgba(250, 204, 21, 0.25); }
.quit-btn {
  width: 6.5vmin; height: 6.5vmin; min-width: 44px; min-height: 44px; border-radius: 1.4vmin;
  background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.quit-btn svg { width: 3vmin; height: 3vmin; min-width: 20px; min-height: 20px; }
.quit-btn:hover { background: rgba(239, 68, 68, 0.5); }

.hud-bottom {
  position: absolute; bottom: 3vmin; left: 3vmin; right: 3vmin;
  display: flex; justify-content: space-between; gap: 3vmin;
  z-index: 6; pointer-events: none;
}
.hud-bottom .lane-btn { pointer-events: auto; }
.lane-btn {
  width: 10vmin; height: 10vmin; min-width: 64px; min-height: 64px;
  border-radius: 2vmin;
  background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(12px);
  border: 2px solid rgba(255,255,255,0.15);
  color: #fff; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}
.lane-btn svg { width: 5vmin; height: 5vmin; min-width: 32px; min-height: 32px; }
.lane-btn:hover { background: rgba(15, 23, 42, 0.92); border-color: rgba(255,255,255,0.3); }
.lane-btn:active { transform: scale(0.94); }
.lane-btn.active {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: #fbbf24;
  color: #000;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
}
.ctrls-fade-enter-active, .ctrls-fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.ctrls-fade-enter, .ctrls-fade-leave-to { opacity: 0; transform: translateY(2vmin); }

/* Control hint overlay */
.ctrl-hint {
  position: absolute; inset: 0; z-index: 25;
  background: rgba(5, 7, 15, 0.7); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.hint-card {
  width: 70vmin; max-width: 92vw;
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3vmin;
  padding: 5vmin;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6);
  text-align: center;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(3vmin); } to { opacity: 1; transform: none; } }
.hint-title {
  font-size: 3.6vmin; font-weight: 800;
  background: linear-gradient(90deg, #fbbf24, #ef4444);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 3vmin;
}
.hint-body { display: flex; flex-direction: column; gap: 3vmin; margin-bottom: 4vmin; }
.hint-row { display: flex; align-items: center; gap: 3vmin; text-align: left; }
.hint-keys { display: flex; gap: 1vmin; flex: 0 0 auto; }
.kbd {
  width: 6vmin; height: 6vmin; min-width: 44px; min-height: 44px; border-radius: 1vmin;
  background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.25);
  color: #fbbf24; font-size: 3.4vmin; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 -3px 0 rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.3);
}
.hint-touch { display: flex; gap: 0.6vmin; flex: 0 0 auto; }
.touch-box {
  width: 6vmin; height: 6vmin; min-width: 44px; min-height: 44px; border-radius: 1vmin;
  background: rgba(96,165,250,0.15); border: 2px dashed rgba(96,165,250,0.6);
  color: #93c5fd; font-size: 2.4vmin;
  display: flex; align-items: center; justify-content: center;
}
.hint-text { font-size: 2.2vmin; color: rgba(255,255,255,0.85); flex: 1; line-height: 1.5; }
.hint-btn {
  padding: 2vmin 5vmin; border-radius: 999px; border: 0;
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
  font-size: 2.4vmin; font-weight: 700;
  box-shadow: 0 10px 30px rgba(239,68,68,0.4);
  transition: all 0.2s;
}
.hint-btn:hover { transform: translateY(-0.4vmin); box-shadow: 0 15px 40px rgba(239,68,68,0.55); }
.hint-fade-enter-active, .hint-fade-leave-active { transition: opacity 0.3s; }
.hint-fade-enter, .hint-fade-leave-to { opacity: 0; }

/* Countdown */
.countdown {
  position: absolute; inset: 0; z-index: 20;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 60%);
}
.countdown-num {
  font-size: 24vmin; font-weight: 900;
  color: #fff;
  text-shadow: 0 0 6vmin rgba(251, 191, 36, 1), 0 0 10vmin rgba(239, 68, 68, 0.8);
  animation: countPop 0.8s ease-out;
}
.countdown-num.go {
  background: linear-gradient(180deg, #fbbf24, #ef4444);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 60px rgba(251, 191, 36, 1);
}
@keyframes countPop {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.pop-enter-active { transition: all 0.3s; }
.pop-leave-active { transition: all 0.3s; }
.pop-enter, .pop-leave-to { opacity: 0; transform: scale(0.5); }

/* Difficulty banner */
.difficulty-banner {
  position: absolute; top: 15%; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 2vmin;
  padding: 2.5vmin 5vmin;
  border-radius: 999px;
  z-index: 15;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.difficulty-banner.up {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 20px 50px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.4);
}
.difficulty-banner.down {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  box-shadow: 0 20px 50px rgba(14, 165, 233, 0.4);
}
.banner-icon { font-size: 5vmin; }
.banner-text > div:first-child {
  font-size: 3vmin; font-weight: 800; color: #fff;
  letter-spacing: 0.05em;
}
.banner-text .sub { font-size: 2vmin; color: rgba(255,255,255,0.9); }

.banner-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.banner-leave-active { transition: all 0.4s ease; }
.banner-enter { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.8); }
.banner-leave-to { opacity: 0; transform: translateX(-50%) translateY(-20px); }

/* Pause */
.pause-mask {
  position: absolute; inset: 0; z-index: 30;
  background: rgba(5, 7, 15, 0.85); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.25s;
}
.pause-modal {
  padding: 6vmin 8vmin; border-radius: 3vmin; text-align: center;
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 30px 80px rgba(0,0,0,0.6);
  max-width: 90vw;
}
.pause-icon { font-size: 10vmin; margin-bottom: 2vmin; }
.pause-modal h2 {
  font-size: 4vmin; margin-bottom: 2vmin;
  background: linear-gradient(90deg, #fbbf24, #ef4444);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.pause-modal p { color: rgba(255,255,255,0.75); margin-bottom: 4vmin; font-size: 2.2vmin; }
.pause-buttons { display: flex; gap: 2vmin; justify-content: center; }
.pbtn {
  padding: 1.8vmin 4vmin; border-radius: 1.6vmin; border: 0;
  font-size: 2.2vmin; font-weight: 600; min-width: 18vmin;
  transition: all 0.2s;
}
.pbtn.secondary {
  background: rgba(255,255,255,0.08); color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}
.pbtn.secondary:hover { background: rgba(255,255,255,0.15); }
.pbtn.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
  box-shadow: 0 6px 20px rgba(239,68,68,0.35);
}
.pbtn.danger:hover { box-shadow: 0 8px 24px rgba(239,68,68,0.5); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
