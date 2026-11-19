<template>
  <div class="game-root" ref="root">
    <canvas ref="canvas" class="game-canvas"
      @mousedown="onClick" @touchstart.prevent="onTouch"
      @mousemove="onMove"></canvas>

    <div class="hud">
      <div class="hud-panel top-left">
        <div class="hud-row"><span class="lbl">{{ t('difficulty') }}</span><span class="val lvl">{{ level }}</span></div>
        <div class="hud-row"><span class="lbl">{{ t('score') }}</span><span class="val">{{ score }}</span></div>
        <div class="hud-row"><span class="lbl">{{ t('timeLeft') }}</span><span class="val">{{ fmtTime(totalLeft) }}</span></div>
      </div>
      <div class="hud-center">
        <div class="rule-hint">{{ t('ruleHint') }}</div>
        <div class="q-timer"><div class="q-fill" :style="{width: (qLeft/15*100) + '%'}"></div></div>
      </div>
      <div class="hud-actions">
        <button v-if="showBatchSkip" class="back-btn" type="button" @click="$emit('batch-skip')">{{ t('skipGame') || '跳过' }}</button>
        <button class="back-btn" type="button" @click="pause">{{ t('back') }}</button>
      </div>
    </div>

    <div class="modal-mask" v-if="paused">
      <div class="modal pause-modal">
        <div class="pause-title">{{ t('pauseTitle') }}</div>
        <div class="btn-row">
          <button class="btn primary" @click="resume">{{ t('resume') }}</button>
          <button class="btn ghost" @click="$emit('quit')">{{ t('quit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t, store } from '../i18n'
import {
  SpaceBackground, Asteroid, Particle, Shockwave,
  Cockpit, difficultyOf, sceneScale,
} from '../game/engine'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'xhshz'

export default {
  name: 'GameScreen',
  props: {
    duration: { type: Number, required: true },
    showBatchSkip: { type: Boolean, default: false },
  },
  data () {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      totalLeft: this.duration,
      qLeft: 15,
      paused: false,
      results: [],
      windowResults: [],
      windowStart: 0,
    }
  },
  mounted () {
    this.level = getBatchStartDifficultyForGame(GAME_TYPE)
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this.pointer = { x: 0, y: 0, visible: false }
    this.resize()
    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
    this._onKey = e => { if (e.code === 'Escape') this.pause() }
    window.addEventListener('keydown', this._onKey)
    this.bg = new SpaceBackground(this.W, this.H)
    this.cockpit = new Cockpit(this.W, this.H)
    this.asteroids = []
    this.particles = []
    this.shocks = []
    this.windowStart = performance.now()
    this.startTs = performance.now()
    this.spawnQuestion()
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
    this.playDifficultyVoice()
  },
  beforeDestroy () {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this._onResize)
    window.removeEventListener('keydown', this._onKey)
  },
  methods: {
    t,
    resize () {
      const r = this.$refs.root.getBoundingClientRect()
      this.W = r.width; this.H = r.height
      this.canvas.width = this.W * this.dpr
      this.canvas.height = this.H * this.dpr
      this.canvas.style.width = this.W + 'px'
      this.canvas.style.height = this.H + 'px'
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      this.scale = sceneScale(this.W, this.H)
      if (this.bg) this.bg.resize(this.W, this.H)
      if (this.cockpit) this.cockpit.resize(this.W, this.H)
    },
    fmtTime (s) {
      s = Math.max(0, Math.round(s))
      const m = Math.floor(s / 60), ss = s % 60
      return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss
    },
    onMove (e) {
      const r = this.canvas.getBoundingClientRect()
      this.pointer.x = e.clientX - r.left
      this.pointer.y = e.clientY - r.top
      this.pointer.visible = true
    },
    onClick (e) {
      const r = this.canvas.getBoundingClientRect()
      this.shootAt(e.clientX - r.left, e.clientY - r.top)
    },
    onTouch (e) {
      const t = e.touches[0]; if (!t) return
      const r = this.canvas.getBoundingClientRect()
      this.shootAt(t.clientX - r.left, t.clientY - r.top)
    },
    shootAt (x, y) {
      if (this.paused) return
      if (y > this.cockpit.playfieldBottom) return // ignore clicks on the dashboard
      if (!this.qFirstShotTs) this.qFirstShotTs = performance.now()
      // Find topmost asteroid containing the point
      let hit = null
      for (let i = this.asteroids.length - 1; i >= 0; i--) {
        const a = this.asteroids[i]
        if (!a.dead && a.contains(x, y)) { hit = a; break }
      }
      if (hit) {
        hit.dead = true
        this.explode(hit.x, hit.y, hit.isRed)
        if (hit.isRed) this.qRedRemaining--
        else this.qWrongShots++
        if (this.qRedRemaining <= 0 && !this._finTimer) {
          this._finTimer = setTimeout(() => { this._finTimer = null; if (!this.paused) this.finishQuestion() }, 260)
        }
      } else {
        // small feedback ripple at click point
        this.shocks.push(new Shockwave(x, y, [140, 200, 255], 40))
      }
    },
    spawnQuestion () {
      const cfg = difficultyOf(this.level)
      this.asteroids = []
      const items = []
      for (let i = 0; i < cfg.red; i++) items.push(true)
      for (let i = 0; i < cfg.gray; i++) items.push(false)
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i], items[j]] = [items[j], items[i]]
      }
      items.forEach((isRed, idx) => {
        const a = new Asteroid(this.W, this.H, isRed, cfg.speed, this.scale)
        a.y -= idx * (85 + Math.random() * 45) * this.scale
        this.asteroids.push(a)
      })
      this.qLeft = 15
      this.qStart = performance.now()
      this.qRedRemaining = cfg.red
      this.qWrongShots = 0
      this.qFirstShotTs = null
    },
    finishQuestion () {
      const cfg = difficultyOf(this.level)
      const correct = this.qRedRemaining === 0 && this.qWrongShots === 0
      const reactionMs = this.qFirstShotTs ? (performance.now() - this.qStart) : 15000
      if (correct) this.score += Math.round(5 * cfg.coef)
      this.results.push({ correct, reactionMs })
      this.windowResults.push({ correct, reactionMs })
      this.asteroids = []
      this.spawnQuestion()
    },
    checkWindowAdjust () {
      const now = performance.now()
      if (now - this.windowStart >= 60000) {
        if (this.windowResults.length) {
          const acc = this.windowResults.filter(r => r.correct).length / this.windowResults.length
          const prev = this.level
          if (acc >= 0.9 && this.level < 6) this.level++
          else if (acc < 0.7 && this.level > 1) this.level--
          if (this.level !== prev) this.playDifficultyVoice()
        }
        this.windowResults = []
        this.windowStart = now
      }
    },
    playDifficultyVoice () {
      try {
        const folder = store.lang === 'zh' ? 'chinese' : 'english'
        if (!this._voice) this._voice = new Audio()
        this._voice.pause()
        this._voice.src = `voice/${folder}/1.mp3`
        this._voice.currentTime = 0
        const p = this._voice.play(); if (p && p.catch) p.catch(() => {})
      } catch (e) {}
    },
    pause () {
      if (this.paused) return
      this.paused = true; this.pauseTs = performance.now()
    },
    resume () {
      if (!this.paused) return
      const delta = performance.now() - this.pauseTs
      this.startTs += delta; this.windowStart += delta; this.qStart += delta
      if (this.qFirstShotTs) this.qFirstShotTs += delta
      this.last = performance.now(); this.paused = false
    },
    quit () {
      this.$emit('finish', this.buildResult())
    },
    buildResult () {
      const total = this.results.length
      const correct = this.results.filter(r => r.correct).length
      const wrong = total - correct
      const avgMs = total ? this.results.reduce((s, r) => s + r.reactionMs, 0) / total : 0
      return {
        total, correct, wrong,
        accuracy: total ? correct / total : 0,
        avgReactionMs: avgMs, score: this.score, level: this.level,
        duration: this.duration, date: new Date().toISOString(),
      }
    },
    explode (x, y, isRed) {
      const baseColor = isRed ? [255, 130, 60] : [180, 180, 190]
      const n = 28
      for (let i = 0; i < n; i++) this.particles.push(new Particle(x, y, {
        smin: 80, smax: 300,
        color: [baseColor[0] + Math.random() * 40 - 20, baseColor[1] + Math.random() * 40 - 20, baseColor[2] + Math.random() * 40 - 20],
      }))
      for (let i = 0; i < 8; i++) this.particles.push(new Particle(x, y, { smin: 200, smax: 480, color: [255, 240, 200] }))
      this.shocks.push(new Shockwave(x, y, isRed ? [255, 150, 80] : [200, 210, 230], 90 * this.scale))
    },
    loop (now) {
      this.raf = requestAnimationFrame(this.loop)
      if (this.paused) { this.last = now; return }
      let dt = (now - this.last) / 1000
      if (dt > 0.05) dt = 0.05
      this.last = now
      this.totalLeft = Math.max(0, this.duration - (now - this.startTs) / 1000)
      if (this.totalLeft <= 0) { this.$emit('finish', this.buildResult()); return }
      this.qLeft = Math.max(0, 15 - (now - this.qStart) / 1000)
      if (this.qLeft <= 0) this.finishQuestion()
      this.checkWindowAdjust()
      this.bg.update(dt)
      for (const a of this.asteroids) a.update(dt)
      // Remove asteroids that leave the playfield (bottom of window / into dashboard)
      for (let i = this.asteroids.length - 1; i >= 0; i--) {
        if (this.asteroids[i].offscreen(this.cockpit.playfieldBottom)) this.asteroids.splice(i, 1)
      }
      this.asteroids = this.asteroids.filter(a => !a.dead)
      for (const p of this.particles) p.update(dt)
      this.particles = this.particles.filter(p => !p.dead)
      for (const s of this.shocks) s.update(dt)
      this.shocks = this.shocks.filter(s => !s.dead)
      // Render
      const c = this.ctx
      c.clearRect(0, 0, this.W, this.H)
      this.bg.draw(c)
      c.save()
      c.beginPath(); c.rect(0, 0, this.W, this.cockpit.playfieldBottom); c.clip()
      for (const a of this.asteroids) a.draw(c)
      for (const p of this.particles) p.draw(c)
      for (const s of this.shocks) s.draw(c)
      c.restore()
      this.cockpit.draw(c)
      // Reticle
      if (this.pointer.visible && this.pointer.y < this.cockpit.playfieldBottom) {
        this.drawReticle(c, this.pointer.x, this.pointer.y)
      }
    },
    drawReticle (ctx, x, y) {
      ctx.save()
      ctx.strokeStyle = 'rgba(180, 220, 255, 0.7)'
      ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x - 22, y); ctx.lineTo(x - 6, y)
      ctx.moveTo(x + 6, y); ctx.lineTo(x + 22, y)
      ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 6)
      ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 22)
      ctx.stroke()
      ctx.restore()
    },
  },
}
</script>

<style scoped>
.game-root { position: absolute; inset: 0; overflow: hidden; background: #000; cursor: crosshair; }
.game-canvas { display: block; width: 100%; height: 100%; }
.hud { position: absolute; inset: 0; pointer-events: none; }
.top-left {
  pointer-events: auto;
  position: absolute; top: 2vh; left: 2vw;
  padding: 1.2vmin 1.8vmin;
  background: rgba(10, 16, 26, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.8vmin;
  color: #e6efff;
  min-width: 18vmin;
}
.hud-row { display: flex; justify-content: space-between; gap: 2vmin; font-size: 1.9vmin; margin: 0.25vmin 0; align-items: baseline; }
.lbl { color: rgba(200, 220, 240, 0.65); text-transform: uppercase; font-size: 1.4vmin; letter-spacing: 0.15vmin; }
.val { color: #fff; font-weight: 600; font-size: 2.2vmin; }
.val.lvl { color: #ffd76a; }
.hud-center {
  position: absolute; top: 2vh; left: 50%; transform: translateX(-50%);
  padding: 1vmin 2.2vmin 1.2vmin;
  background: rgba(10, 16, 26, 0.55);
  border: 1px solid rgba(255, 100, 100, 0.35);
  border-radius: 0.8vmin;
  color: #ffdad2; text-align: center;
}
.rule-hint { font-size: 2vmin; letter-spacing: 0.12vmin; }
.q-timer { margin-top: 0.8vmin; width: 24vmin; height: 0.5vmin; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
.q-fill { height: 100%; background: linear-gradient(90deg, #ff6a3a, #ffd76a); transition: width 0.1s linear; }
.hud-actions {
  pointer-events: auto;
  position: absolute;
  top: 2vh;
  right: 2vw;
  display: flex;
  align-items: center;
  gap: 1.2vmin;
  flex-wrap: nowrap;
}
.back-btn {
  pointer-events: auto;
  position: relative;
  top: auto;
  right: auto;
  padding: 1vmin 2.2vmin;
  border-radius: 0.6vmin;
  background: rgba(10, 16, 26, 0.6); color: #e6efff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 1.9vmin; font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}
.back-btn:hover { background: rgba(30, 40, 55, 0.85); border-color: rgba(255, 255, 255, 0.3); }
.modal-mask {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); z-index: 20;
}
.modal {
  background: #101720;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.4vmin; padding: 4vmin 5vmin;
  color: #e6efff; text-align: center;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}
.pause-title { font-size: 2.6vmin; margin-bottom: 3vh; }
.btn-row { display: flex; gap: 2vmin; justify-content: center; }
.btn {
  padding: 1.4vmin 3.5vmin; border-radius: 0.8vmin; cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  color: #e6efff; font-size: 2vmin; font-weight: 500;
  transition: 0.15s; min-width: 14vmin;
  font-family: inherit;
}
.btn:hover { background: rgba(255, 255, 255, 0.08); }
.btn.primary { background: #3aa8d8; border-color: #3aa8d8; color: #fff; }
.btn.primary:hover { background: #4bbde9; }
.btn.ghost { background: transparent; }
</style>
