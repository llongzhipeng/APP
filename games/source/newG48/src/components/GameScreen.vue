<template>
  <div class="game" ref="root">
    <!-- Background layer -->
    <div class="bg" :style="bgStyle"></div>
    <div class="bg-overlay"></div>

    <!-- Unified HUD bar (spans entire top) -->
    <div class="hud-bar" ref="hudBar">
      <div class="hud-cell stat">
        <div class="label">{{ t('difficulty') }}</div>
        <div class="value">
          <span class="lvl-chip" :class="'lvl'+difficulty.level">Lv {{ difficulty.level }}</span>
        </div>
      </div>
      <div class="hud-cell stat">
        <div class="label">{{ t('score') }}</div>
        <div class="value score-value">{{ score }}</div>
      </div>
      <div class="hud-cell stat">
        <div class="label">{{ t('timeLeft') }}</div>
        <div class="value time-value">{{ formatTime(timeLeft) }}</div>
      </div>
      <div class="hud-cell rule">
        <div class="rule-pill">{{ t('ruleBanner') }}</div>
      </div>
      <div class="hud-cell left">
        <button v-if="showBatchSkip" class="side-btn skip" @click="onBatchSkip">{{ t('skipGame') }}</button>
        <button class="side-btn back" @click="pauseGame">{{ t('back') }}</button>
      </div>
    </div>

    <!-- Play area -->
    <div
      class="play-area"
      ref="area"
      @mousemove="onMove"
      @touchmove.prevent="onTouchMove"
      @touchstart.prevent="onTouchMove"
    >
      <img
        v-for="s in stars"
        :key="s.id"
        class="star"
        :src="s.happy ? imgHappy : imgSad"
        :style="{
          left: s.x + 'px',
          top: s.y + 'px',
          width: starSize + 'px',
          height: starSize + 'px'
        }"
      />

      <div
        v-if="running && !paused"
        class="basket"
        :style="{
          left: basketX + 'px',
          top: basketY + 'px',
          width: basketW + 'px',
          height: basketH + 'px'
        }"
      >
        <svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="basketGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#f59e0b"/>
              <stop offset="1" stop-color="#a16207"/>
            </linearGradient>
          </defs>
          <ellipse cx="60" cy="94" rx="48" ry="4" fill="rgba(0,0,0,0.4)"/>
          <path d="M14 32 Q60 8 106 32" stroke="#a16207" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M14 32 L 106 32 L 96 88 Q94 94 88 94 L 32 94 Q26 94 24 88 Z" fill="url(#basketGrad)"/>
          <path d="M14 32 L 106 32 L 104 40 L 16 40 Z" fill="#fbbf24"/>
          <g stroke="#78350f" stroke-width="1.5">
            <line x1="26" y1="40" x2="30" y2="92"/>
            <line x1="42" y1="40" x2="42" y2="92"/>
            <line x1="60" y1="40" x2="60" y2="92"/>
            <line x1="78" y1="40" x2="78" y2="92"/>
            <line x1="94" y1="40" x2="90" y2="92"/>
          </g>
          <g stroke="#78350f" stroke-width="1.2" fill="none">
            <path d="M16 52 L 104 52"/>
            <path d="M18 68 L 102 68"/>
            <path d="M20 82 L 100 82"/>
          </g>
        </svg>
      </div>

      <div
        v-for="f in floats"
        :key="f.id"
        class="float-score"
        :class="{ pos: f.val > 0, neg: f.val < 0 }"
        :style="{ left: f.x + 'px', top: f.y + 'px' }"
      >{{ f.val > 0 ? '+' + f.val : f.val }}</div>
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
        <div class="banner-text">
          <div>{{ diffBanner.type === 'up' ? t('difficultyUp') : t('difficultyDown') }}</div>
          <div class="sub">Lv {{ diffBanner.newLevel }}</div>
        </div>
      </div>
    </transition>

    <!-- Pause Modal -->
    <div class="pause-mask" v-if="paused">
      <div class="pause-modal">
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
import { i18n, t } from '../i18n.js'
import { getDifficulty } from '../difficulty.js'
import { saveRecord } from '../store.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import { resolveImage, resolveVoice } from '../assets.js'

const IMG_HAPPY = resolveImage('/images/1.png') // 开心星星
const IMG_SAD = resolveImage('/images/2.png') // 不开心星星
const IMG_BG = resolveImage('/images/bac.png') // 背景图

const GAME_TYPE = 'qxsjzl' // 情绪收集之旅
const BASE_FALL_SPEED = 130 // px/sec at speed=1.0

export default {
  name: 'GameScreen',
  props: {
    duration: { type: Number, required: true }, // 训练时长（秒）
    showBatchSkip: { type: Boolean, default: false }, // 批次跳过
  },
  data() {
    return {
      w: 0, h: 0,
      running: false,
      paused: false,
      countdown: 3,

      difficultyLevel: getBatchStartDifficultyForGame(GAME_TYPE), // HUD 当前难度
      score: 0,

      timeLeft: 0,
      time: 0,
      lastFrameTime: 0,
      rafId: 0,

      stars: [],
      starSize: 80,

      basketX: 0, basketY: 0,
      basketW: 120, basketH: 100,

      total: 0,
      success: 0,
      fail: 0,
      reactSum: 0,
      reactCount: 0,

      windowStart: 0,
      windowSuccess: 0,
      windowFail: 0,

      diffBanner: null,
      diffBannerTimer: null,

      floats: [],
      idCounter: 1,

      voiceAudio: null,

      // Top Y below the HUD bar - stars enter from here
      spawnTopY: 0
    }
  },
  computed: {
    difficulty() { return getDifficulty(this.difficultyLevel) },
    lang() { return i18n.lang },
    imgHappy() { return IMG_HAPPY },
    imgSad() { return IMG_SAD },
    bgStyle() {
      return {
        background: `url('${IMG_BG}') center/cover no-repeat`
      }
    },
  },
  mounted() {
    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('keydown', this.onKey)
    this.timeLeft = this.duration
    this.startCountdown()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('keydown', this.onKey)
    cancelAnimationFrame(this.rafId)
    if (this.diffBannerTimer) clearTimeout(this.diffBannerTimer)
    if (this.voiceAudio) { try { this.voiceAudio.pause() } catch(e){} }
  },
  methods: {
    t,
    playVoice() {
      try {
        const folder = i18n.lang === 'en' ? 'english' : 'chinese'
        if (this.voiceAudio) { try { this.voiceAudio.pause() } catch(e){} }
        const audio = new Audio(resolveVoice(`/voice/${folder}/1.mp3`))
        audio.volume = 1
        this.voiceAudio = audio
        const p = audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch (e) { /* ignore */ }
    },
    resize() {
      const rect = this.$refs.root.getBoundingClientRect()
      this.w = rect.width
      this.h = rect.height
      const min = Math.min(this.w, this.h)
      this.starSize = Math.max(80, Math.round(min * 0.14))
      this.basketW = Math.max(90, Math.round(min * 0.16))
      this.basketH = Math.round(this.basketW * 0.85)
      // Measure HUD bar bottom edge so stars emerge from below it
      this.$nextTick(() => {
        const hud = this.$refs.hudBar
        if (hud) {
          const hudRect = hud.getBoundingClientRect()
          this.spawnTopY = hudRect.bottom - rect.top + 8
        } else {
          this.spawnTopY = this.h * 0.13
        }
      })
      if (this.basketX + this.basketW > this.w) this.basketX = this.w - this.basketW
      if (this.basketY + this.basketH > this.h) this.basketY = this.h - this.basketH - 20
      if (this.basketX <= 0) this.basketX = this.w / 2 - this.basketW / 2
      if (this.basketY <= 0) this.basketY = this.h - this.basketH - 40
    },
    formatTime(sec) {
      const s = Math.max(0, Math.ceil(sec))
      const m = Math.floor(s / 60)
      const r = s % 60
      return `${m}:${String(r).padStart(2, '0')}`
    },
    startCountdown() {
      this.difficultyLevel = getBatchStartDifficultyForGame(GAME_TYPE) // 重开起始难度
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
      this.time = 0
      this.windowStart = 0
      this.lastFrameTime = performance.now()
      this.basketX = this.w / 2 - this.basketW / 2
      this.basketY = this.h - this.basketH - 40
      this.spawnInitialStars()
      this.playVoice() // Voice cue on first entry
      this.loop()
    },
    loop() {
      if (!this.running) return
      const now = performance.now()
      const dt = Math.min(50, now - this.lastFrameTime)
      this.lastFrameTime = now
      if (!this.paused) this.update(dt)
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
      // Stars fall straight down. Wrap to top when off-bottom.
      const speed = BASE_FALL_SPEED * this.difficulty.speed
      for (const s of this.stars) {
        s.y += speed * (dt / 1000)
      }
      // Recycle off-screen stars back to top (avoid overlap)
      for (const s of this.stars) {
        if (s.y > this.h) {
          this.respawnAtTop(s)
        }
      }
      this.checkCollisions()
      if (this.time - this.windowStart >= 60000) {
        this.evaluateDifficultyWindow()
        this.windowStart = this.time
        this.windowSuccess = 0
        this.windowFail = 0
      }
    },
    // Find non-overlapping X position given a target Y (respecting existing stars)
    findFreeX(y, excludeId) {
      const size = this.starSize
      const pad = 6
      const maxX = Math.max(1, this.w - size)
      for (let tries = 0; tries < 25; tries++) {
        const x = Math.random() * maxX
        let ok = true
        for (const other of this.stars) {
          if (other.id === excludeId) continue
          if (Math.abs(other.x - x) < size + pad && Math.abs(other.y - y) < size + pad) {
            ok = false
            break
          }
        }
        if (ok) return x
      }
      let bestX = 0, bestGap = -1
      for (let i = 0; i < 12; i++) {
        const x = (i / 11) * maxX
        let minDist = Infinity
        for (const other of this.stars) {
          if (other.id === excludeId) continue
          if (Math.abs(other.y - y) < size + pad) {
            const d = Math.abs(other.x - x)
            if (d < minDist) minDist = d
          }
        }
        if (minDist > bestGap) { bestGap = minDist; bestX = x }
      }
      return bestX
    },
    respawnAtTop(s) {
      // Emerge right at HUD bottom edge - never behind the HUD
      s.y = this.spawnTopY
      s.x = this.findFreeX(s.y, s.id)
    },
    spawnStar(happy) {
      // Initial spawn: distributed in the upper portion of the play area (below HUD, not behind it)
      const playHeight = Math.max(1, this.h - this.spawnTopY - this.starSize)
      const y = this.spawnTopY + Math.random() * playHeight * 0.5
      const id = this.idCounter++
      const x = this.findFreeX(y, id)
      this.stars.push({ id, happy, x, y, bornAt: this.time })
    },
    spawnInitialStars() {
      this.stars = []
      const cfg = this.difficulty
      // Stagger initial y so they enter over time
      for (let i = 0; i < cfg.happy; i++) this.spawnStar(true)
      for (let i = 0; i < cfg.sad; i++) this.spawnStar(false)
    },
    rebalanceStars() {
      const cfg = this.difficulty
      const happyCount = this.stars.filter(s => s.happy).length
      const sadCount = this.stars.filter(s => !s.happy).length
      for (let i = happyCount; i < cfg.happy; i++) this.spawnStar(true)
      for (let i = sadCount; i < cfg.sad; i++) this.spawnStar(false)
      if (happyCount > cfg.happy || sadCount > cfg.sad) {
        const keptHappy = []
        const keptSad = []
        for (const s of this.stars) {
          if (s.happy && keptHappy.length < cfg.happy) keptHappy.push(s)
          else if (!s.happy && keptSad.length < cfg.sad) keptSad.push(s)
        }
        this.stars = [...keptHappy, ...keptSad]
      }
    },
    checkCollisions() {
      const bx = this.basketX, by = this.basketY, bw = this.basketW, bh = this.basketH
      const pad = 0.12
      const hx = bx + bw * pad
      const hy = by + bh * pad
      const hw = bw * (1 - pad * 2)
      const hh = bh * (1 - pad * 2)
      const remaining = []
      let changed = false
      for (const s of this.stars) {
        // Skip stars that haven't fully entered the play area yet
        if (s.y < this.spawnTopY - this.starSize * 0.5) { remaining.push(s); continue }
        const overlap =
          s.x < hx + hw &&
          s.x + this.starSize > hx &&
          s.y < hy + hh &&
          s.y + this.starSize > hy
        if (overlap) {
          this.onStarHit(s)
          changed = true
        } else {
          remaining.push(s)
        }
      }
      if (changed) {
        this.stars = remaining
        this.rebalanceStars()
      }
    },
    onStarHit(s) {
      const cfg = this.difficulty
      const pts = Math.round(5 * cfg.coeff)
      const delta = s.happy ? pts : -pts
      this.score += delta
      this.total++
      this.reactSum += (this.time - s.bornAt)
      this.reactCount++
      if (s.happy) { this.success++; this.windowSuccess++ }
      else         { this.fail++;    this.windowFail++ }
      const fid = this.idCounter++
      this.floats.push({ id: fid, val: delta, x: s.x + this.starSize/2, y: s.y })
      setTimeout(() => {
        this.floats = this.floats.filter(f => f.id !== fid)
      }, 800)
    },
    evaluateDifficultyWindow() {
      const total = this.windowSuccess + this.windowFail
      if (total === 0) return
      const rate = this.windowSuccess / total
      if (rate > 0.9 && this.difficultyLevel < 6) {
        this.difficultyLevel++
        this.showDiffBanner('up', this.difficultyLevel)
        this.rebalanceStars()
        this.playVoice()
      } else if (rate < 0.7 && this.difficultyLevel > 1) {
        this.difficultyLevel--
        this.showDiffBanner('down', this.difficultyLevel)
        this.rebalanceStars()
        this.playVoice()
      }
    },
    showDiffBanner(type, newLevel) {
      this.diffBanner = { type, newLevel }
      if (this.diffBannerTimer) clearTimeout(this.diffBannerTimer)
      this.diffBannerTimer = setTimeout(() => { this.diffBanner = null }, 2200)
    },
    onMove(e) {
      if (!this.running || this.paused) return
      const rect = this.$refs.area.getBoundingClientRect()
      this.moveBasketTo(e.clientX - rect.left, e.clientY - rect.top)
    },
    onTouchMove(e) {
      if (!this.running || this.paused) return
      const t0 = e.touches && e.touches[0]
      if (!t0) return
      const rect = this.$refs.area.getBoundingClientRect()
      this.moveBasketTo(t0.clientX - rect.left, t0.clientY - rect.top)
    },
    moveBasketTo(x, y) {
      this.basketX = Math.max(0, Math.min(this.w - this.basketW, x - this.basketW / 2))
      this.basketY = Math.max(0, Math.min(this.h - this.basketH, y - this.basketH / 2))
    },
    onKey(e) {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.running) { this.pauseGame(); e.preventDefault() }
      }
    },
    onBatchSkip() { skipPbBatchGame() },
    onExitGame() {
      if (!this.running) return
      this.endGame()
    },
    pauseGame() { if (this.running) this.paused = true },
    resumeGame() { this.paused = false; this.lastFrameTime = performance.now() },
    confirmQuit() {
      this.paused = false
      this.running = false
      cancelAnimationFrame(this.rafId)
      leavePbGameWindow({ confirm: false })
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
        difficulty: this.difficultyLevel, // HUD 当前难度
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
.bg {
  position: absolute; inset: 0;
}
.bg-overlay {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(76, 29, 149, 0.25), transparent 65%),
    linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%);
  pointer-events: none;
}
.play-area {
  position: absolute; inset: 0; z-index: 2;
  cursor: none;
  touch-action: none;
  user-select: none;
}

.star {
  position: absolute;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.55));
  will-change: transform, left, top;
}
.basket {
  position: absolute;
  pointer-events: none;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.55));
  will-change: left, top;
}
.basket svg { width: 100%; height: 100%; display: block; }

.float-score {
  position: absolute;
  font-size: 4.4vmin;
  font-weight: 800;
  pointer-events: none;
  animation: floatUp 0.8s ease-out forwards;
  text-shadow: 0 3px 10px rgba(0,0,0,0.7);
  transform: translateX(-50%);
  font-variant-numeric: tabular-nums;
}
.float-score.pos { color: #a3e0b3; }
.float-score.neg { color: #f6a58e; }
@keyframes floatUp {
  from { transform: translateX(-50%) translateY(0); opacity: 1; }
  to { transform: translateX(-50%) translateY(-8vmin); opacity: 0; }
}

/* Unified HUD bar */
.hud-bar {
  position: absolute; top: 2.4vmin; left: 3vmin; right: 3vmin;
  z-index: 8;
  display: flex; align-items: stretch;
  background: rgba(255, 255, 255, 0.96);
  border: 0.15vmin solid rgba(44, 39, 33, 0.08);
  border-radius: 2vmin;
  box-shadow: 0 1vmin 3vmin rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.hud-cell {
  padding: 1.8vmin 2.8vmin;
  display: flex; flex-direction: column; justify-content: center;
  gap: 0.5vmin;
  position: relative;
}
.hud-cell + .hud-cell::before {
  content: '';
  position: absolute; left: 0; top: 22%; bottom: 22%;
  width: 1px; background: #f0eadf;
}
.hud-cell.left {
  padding: 1.4vmin 2vmin;
  align-items: center; justify-content: center;
  gap: 1.2vmin;
  flex-direction: row;
}
.hud-cell.stat { min-width: 14vmin; }
.hud-cell.rule { flex: 1; align-items: center; justify-content: center; padding: 1.6vmin; }
.rule-pill {
  display: inline-block;
  padding: 1.2vmin 3vmin;
  background: #fdf2ea;
  border: 0.15vmin solid #f0d9c6;
  border-radius: 999px;
  font-size: 2.4vmin;
  color: #a05a3d;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 100%;
}
.hud-cell .label {
  font-size: 1.8vmin; color: #7a7266;
  letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
}
.hud-cell .value {
  font-size: 3.6vmin; font-weight: 800; color: #2c2721;
  font-variant-numeric: tabular-nums; line-height: 1.1;
}
.score-value { color: #d97757; }
.time-value { color: #6b6357; }
.lvl-chip {
  display: inline-block; padding: 0.6vmin 2vmin; border-radius: 1vmin;
  font-size: 2.8vmin; font-weight: 700; color: #fff;
}
.lvl-chip.lvl1 { background: #7cb98f; }
.lvl-chip.lvl2 { background: #6aa77a; }
.lvl-chip.lvl3 { background: #d4a94a; }
.lvl-chip.lvl4 { background: #d47f4a; }
.lvl-chip.lvl5 { background: #c5674a; }
.lvl-chip.lvl6 { background: #a94a3a; }

.side-btn {
  padding: 1.4vmin 2.4vmin;
  border-radius: 1.2vmin;
  background: #ffffff;
  border: 0.2vmin solid #e5ddce;
  color: #2c2721;
  font-size: 2.2vmin;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}
.side-btn:hover { border-color: #d97757; color: #d97757; }
.side-btn.back {
  background: #d97757;
  border-color: #d97757;
  color: #fff;
}
.side-btn.back:hover { background: #c5674a; border-color: #c5674a; color: #fff; }

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
  text-shadow: 0 4px 30px rgba(217, 119, 87, 0.9), 0 0 40px rgba(0, 0, 0, 0.5);
  animation: countPop 0.8s ease-out;
}
.countdown-num.go {
  color: #ffd6a8;
}
@keyframes countPop {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.pop-enter-active, .pop-leave-active { transition: all 0.3s; }
.pop-enter, .pop-leave-to { opacity: 0; transform: scale(0.5); }

/* Difficulty banner */
.difficulty-banner {
  position: absolute; top: 18%; left: 50%; transform: translateX(-50%);
  padding: 2.4vmin 4.8vmin;
  border-radius: 1.6vmin;
  z-index: 15;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,0.25);
  background: #ffffff;
  border: 0.2vmin solid #f0eadf;
}
.difficulty-banner.up { border-color: #d97757; }
.difficulty-banner.down { border-color: #6aa77a; }
.banner-text > div:first-child {
  font-size: 3.2vmin; font-weight: 800; color: #2c2721;
  letter-spacing: 0.03em;
}
.banner-text .sub {
  font-size: 2.2vmin; color: #7a7266;
  margin-top: 0.4vmin;
}
.difficulty-banner.up .banner-text > div:first-child { color: #d97757; }
.difficulty-banner.down .banner-text > div:first-child { color: #6aa77a; }
.banner-enter-active { transition: all 0.35s ease; }
.banner-leave-active { transition: all 0.35s ease; }
.banner-enter { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.banner-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* Pause */
.pause-mask {
  position: absolute; inset: 0; z-index: 30;
  background: rgba(44, 39, 33, 0.5);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s;
}
.pause-modal {
  padding: 6vmin 8vmin; border-radius: 2.4vmin; text-align: center;
  background: #ffffff;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.35);
  max-width: 90vw; min-width: 60vmin;
}
.pause-modal h2 {
  font-size: 4.2vmin; margin-bottom: 1.6vmin;
  color: #2c2721; font-weight: 700;
}
.pause-modal p { color: #6b6357; margin-bottom: 4vmin; font-size: 2.6vmin; line-height: 1.6; }
.pause-buttons { display: flex; gap: 2vmin; justify-content: center; }
.pbtn {
  padding: 1.6vmin 4vmin; border-radius: 1.4vmin; border: 0;
  font-size: 2.6vmin; font-weight: 600; min-width: 18vmin;
  transition: all 0.2s;
}
.pbtn.secondary {
  background: #ffffff; color: #2c2721;
  border: 0.2vmin solid #e5ddce;
}
.pbtn.secondary:hover { border-color: #d97757; color: #d97757; }
.pbtn.danger {
  background: #d97757; color: #fff;
}
.pbtn.danger:hover { background: #c5674a; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
