<template>
  <div class="modal-mask">
    <div class="modal tut">
      <div class="modal-title">{{ t('tutorialTitle') }}</div>
      <div class="stage-wrap">
        <canvas ref="canvas" class="tut-canvas"></canvas>
        <div class="step-dots">
          <span v-for="i in 4" :key="i" :class="{ active: i-1 === step }"></span>
        </div>
      </div>
      <div class="step-desc">{{ t('tutorialSteps')[step] }}</div>
      <div class="btn-row">
        <button class="btn ghost" @click="prev" :disabled="step===0">{{ t('prev') }}</button>
        <button class="btn ghost" @click="skip">{{ t('skipTut') }}</button>
        <button class="btn primary" @click="next">{{ step===3 ? t('startTraining') : t('next') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n'
import { SpaceBackground, Asteroid, Particle, Shockwave, Cockpit, sceneScale } from '../game/engine'

export default {
  name: 'TutorialModal',
  data () { return { step: 0 } },
  mounted () {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
    this.resize()
    this.bg = new SpaceBackground(this.W, this.H)
    this.cockpit = new Cockpit(this.W, this.H)
    this.setupStep()
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop.bind(this))
  },
  beforeDestroy () {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    t,
    resize () {
      const r = this.canvas.getBoundingClientRect()
      this.W = r.width; this.H = r.height
      this.canvas.width = this.W * this.dpr
      this.canvas.height = this.H * this.dpr
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      this.scale = sceneScale(this.W, this.H) * 0.9
      if (this.bg) this.bg.resize(this.W, this.H)
      if (this.cockpit) this.cockpit.resize(this.W, this.H)
    },
    prev () { if (this.step > 0) { this.step--; this.setupStep() } },
    next () { if (this.step === 3) { this.$emit('finish'); return } this.step++; this.setupStep() },
    skip () { this.$emit('finish') },
    setupStep () {
      this.asteroids = []; this.particles = []; this.shocks = []
      this.pointer = null
      this.scriptT = 0
      this.script = []
      const cx = this.W / 2
      const spawnAt = (isRed, x, delay) => this.script.push({ at: delay, act: () => {
        const a = new Asteroid(this.W, this.H, isRed, 0.6, this.scale)
        a.x = x; a.y = -60; a.vx = 0; a.vy = 70
        this.asteroids.push(a)
      }})
      const clickAt = (delay, targetIdx) => this.script.push({ at: delay, act: () => {
        const a = this.asteroids[targetIdx]; if (!a) return
        this.pointer = { x: a.x, y: a.y, ttl: 0.6 }
        setTimeout(() => {
          if (a.dead) return
          a.dead = true
          const color = a.isRed ? [255, 130, 60] : [180, 180, 190]
          for (let k = 0; k < 26; k++) this.particles.push(new Particle(a.x, a.y, { color }))
          this.shocks.push(new Shockwave(a.x, a.y, color, 80 * this.scale))
        }, 200)
      }})
      if (this.step === 0) {
        // Show asteroids of both colors approaching
        spawnAt(true, cx - this.W * 0.22, 0.3)
        spawnAt(false, cx + this.W * 0.05, 0.9)
        spawnAt(true, cx + this.W * 0.24, 1.5)
      } else if (this.step === 1) {
        // Click the red
        spawnAt(true, cx, 0.2)
        clickAt(1.5, 0)
      } else if (this.step === 2) {
        // Gray - do NOT click
        spawnAt(false, cx, 0.3)
      } else if (this.step === 3) {
        spawnAt(true, cx - this.W * 0.18, 0.2)
        spawnAt(false, cx, 0.5)
        spawnAt(true, cx + this.W * 0.18, 0.9)
        clickAt(1.6, 0)
        clickAt(2.6, 2)
      }
    },
    loop (now) {
      this.raf = requestAnimationFrame(this.loop.bind(this))
      let dt = (now - this.last) / 1000
      if (dt > 0.05) dt = 0.05
      this.last = now
      this.scriptT += dt
      for (let i = this.script.length - 1; i >= 0; i--) {
        if (this.scriptT >= this.script[i].at) { this.script[i].act(); this.script.splice(i, 1) }
      }
      if (this.script.length === 0 && this.asteroids.length === 0 && this.particles.length === 0 && this.scriptT > 4) {
        this.setupStep()
      }
      this.bg.update(dt)
      for (const a of this.asteroids) a.update(dt)
      for (let i = this.asteroids.length - 1; i >= 0; i--) {
        if (this.asteroids[i].offscreen(this.cockpit.playfieldBottom)) this.asteroids.splice(i, 1)
      }
      this.asteroids = this.asteroids.filter(a => !a.dead)
      for (const p of this.particles) p.update(dt)
      this.particles = this.particles.filter(p => !p.dead)
      for (const s of this.shocks) s.update(dt)
      this.shocks = this.shocks.filter(s => !s.dead)
      if (this.pointer) { this.pointer.ttl -= dt; if (this.pointer.ttl <= 0) this.pointer = null }
      const c = this.ctx
      c.clearRect(0, 0, this.W, this.H)
      this.bg.draw(c)
      c.save(); c.beginPath(); c.rect(0, 0, this.W, this.cockpit.playfieldBottom); c.clip()
      for (const a of this.asteroids) a.draw(c)
      for (const p of this.particles) p.draw(c)
      for (const s of this.shocks) s.draw(c)
      c.restore()
      this.cockpit.draw(c)
      // Step 2: cross over gray asteroid
      if (this.step === 2 && this.asteroids[0]) {
        const a = this.asteroids[0]
        c.strokeStyle = '#e05050'; c.lineWidth = 3
        c.beginPath(); c.arc(a.x, a.y, a.radius + 10, 0, Math.PI * 2); c.stroke()
        c.beginPath()
        c.moveTo(a.x - a.radius * 0.7, a.y - a.radius * 0.7)
        c.lineTo(a.x + a.radius * 0.7, a.y + a.radius * 0.7)
        c.stroke()
      }
      // Simulated cursor
      if (this.pointer) {
        const p = this.pointer
        const a = Math.min(1, p.ttl / 0.6)
        c.save()
        c.strokeStyle = `rgba(180,220,255,${a})`
        c.lineWidth = 1.5
        c.beginPath(); c.arc(p.x, p.y, 14, 0, Math.PI * 2); c.stroke()
        c.beginPath()
        c.moveTo(p.x - 22, p.y); c.lineTo(p.x - 6, p.y)
        c.moveTo(p.x + 6, p.y); c.lineTo(p.x + 22, p.y)
        c.moveTo(p.x, p.y - 22); c.lineTo(p.x, p.y - 6)
        c.moveTo(p.x, p.y + 6); c.lineTo(p.x, p.y + 22)
        c.stroke()
        c.restore()
      }
    },
  },
}
</script>

<style scoped>
@import './modal.css';
.modal.tut { max-width: min(85vmin, 96vw); padding: 3vmin 3vmin; }
.stage-wrap { position: relative; }
.tut-canvas {
  width: 100%; height: min(45vmin, 50vh);
  background: #000;
  border-radius: 1vmin;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block;
}
.step-dots { position: absolute; bottom: 1.4vmin; left: 50%; transform: translateX(-50%); display: flex; gap: 1vmin; }
.step-dots span { width: 0.9vmin; height: 0.9vmin; min-width: 6px; min-height: 6px; border-radius: 50%; background: rgba(255,255,255,0.25); transition: 0.25s; }
.step-dots span.active { background: #6ec8ea; width: 2.4vmin; border-radius: 99px; }
.step-desc {
  margin-top: 2vh;
  text-align: center;
  color: #d0dae5;
  font-size: 2vmin;
  line-height: 1.5;
  min-height: 3em;
}
.btn-row { display: flex; gap: 1.5vmin; margin-top: 2.5vh; justify-content: center; flex-wrap: wrap; }
.btn { display: inline-block; margin: 0; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
