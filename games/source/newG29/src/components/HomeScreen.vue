<template>
  <div class="home-root">
    <canvas ref="bg" class="bg-canvas"></canvas>
    <div class="overlay">
      <button class="lang-btn" @click="toggleLang" v-if="!hideLang">{{ langLabel }}</button>
      <div class="brand">
        <div class="title">{{ t('title') }}</div>
        <div class="subtitle">{{ t('subtitle') }}</div>
      </div>
      <div class="menu">
        <button class="menu-btn primary" @click="$emit('start')">{{ t('start') }}</button>
        <button class="menu-btn" @click="$emit('rules')">{{ t('rules') }}</button>
        <button class="menu-btn" @click="$emit('history')">{{ t('history') }}</button>
        <button class="menu-btn ghost" @click="$emit('skip')">{{ t('skip') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { store, t, dict } from '../i18n'
import { SpaceBackground } from '../game/engine'
export default {
  name: 'HomeScreen',
  props: { hideLang: Boolean },
  computed: {
    langLabel () { return dict[store.lang].langBtn },
  },
  mounted () {
    const c = this.$refs.bg
    this.ctx = c.getContext('2d')
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
    this.resize()
    this.bg = new SpaceBackground(this.W, this.H)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop.bind(this))
  },
  beforeDestroy () {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    t,
    toggleLang () { store.lang = store.lang === 'zh' ? 'en' : 'zh' },
    resize () {
      const r = this.$el.getBoundingClientRect()
      this.W = r.width; this.H = r.height
      const c = this.$refs.bg
      c.width = this.W * this.dpr; c.height = this.H * this.dpr
      c.style.width = this.W + 'px'; c.style.height = this.H + 'px'
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      if (this.bg) this.bg.resize(this.W, this.H)
    },
    loop (now) {
      this.raf = requestAnimationFrame(this.loop.bind(this))
      const dt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      this.bg.update(dt)
      this.ctx.clearRect(0, 0, this.W, this.H)
      this.bg.draw(this.ctx)
      // vignette
      const g = this.ctx.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.2, this.W / 2, this.H / 2, this.H * 0.9)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.6)')
      this.ctx.fillStyle = g
      this.ctx.fillRect(0, 0, this.W, this.H)
    },
  },
}
</script>

<style scoped>
.home-root { position: absolute; inset: 0; overflow: hidden; background: #000; }
.bg-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4vh 4vw; }
.lang-btn {
  position: absolute; top: 2.5vh; right: 2.5vw;
  padding: 1vmin 2vmin;
  border-radius: 0.6vmin;
  background: rgba(255, 255, 255, 0.08);
  color: #e6efff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 1.9vmin; font-weight: 500;
  cursor: pointer;
  transition: 0.15s;
}
.lang-btn:hover { background: rgba(255, 255, 255, 0.14); }
.brand { text-align: center; margin-bottom: 7vh; }
.title {
  font-size: 6vmin; font-weight: 600;
  color: #f0f6ff;
  letter-spacing: 0.3vmin;
}
.subtitle {
  color: rgba(200, 220, 240, 0.55);
  font-size: 1.8vmin; letter-spacing: 0.4vmin;
  margin-top: 1.2vh;
  text-transform: uppercase;
}
.menu { display: flex; flex-direction: column; gap: 1.6vh; width: min(30vmin, 78vw); }
.menu-btn {
  padding: 1.6vmin 2vmin;
  font-size: 2.1vmin;
  color: #e6efff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.8vmin;
  cursor: pointer;
  transition: 0.15s;
  text-align: center;
  font-family: inherit;
  font-weight: 500;
}
.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.28);
}
.menu-btn.primary {
  background: #3aa8d8;
  border-color: #3aa8d8;
  color: #fff;
}
.menu-btn.primary:hover { background: #4bbde9; border-color: #4bbde9; }
.menu-btn.ghost { background: transparent; opacity: 0.75; }
</style>
