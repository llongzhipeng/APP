<template>
  <canvas ref="cv" class="starfield" />
</template>

<script>
// Animated deep-space starfield with parallax layers, twinkles and drifting nebulae.
export default {
  name: 'Starfield',
  props: {
    density: { type: Number, default: 1 },
    interactive: { type: Boolean, default: false }
  },
  data() {
    return { rafId: 0, stars: [], nebulae: [], meteors: [], w: 0, h: 0, t: 0 }
  },
  mounted() {
    this.init()
    this.loop()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.$refs.cv.parentNode)
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy() {
    cancelAnimationFrame(this.rafId)
    if (this.ro) this.ro.disconnect()
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    init() {
      this.resize()
      const area = this.w * this.h
      const n = Math.min(420, Math.max(120, Math.floor(area / 6000 * this.density)))
      this.stars = new Array(n).fill(0).map(() => this.makeStar())
      this.nebulae = new Array(4).fill(0).map(() => this.makeNebula())
    },
    makeStar() {
      const layer = Math.random() // 0..1 depth
      return {
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: 0.3 + layer * 1.6,
        a: 0.3 + Math.random() * 0.7,
        vy: 0.05 + layer * 0.35,
        tw: Math.random() * Math.PI * 2,
        twSpd: 0.005 + Math.random() * 0.02,
        hue: 200 + Math.random() * 60
      }
    },
    makeNebula() {
      return {
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: 180 + Math.random() * 280,
        hue: [220, 280, 190, 320][Math.floor(Math.random() * 4)],
        a: 0.08 + Math.random() * 0.1,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08
      }
    },
    resize() {
      const cv = this.$refs.cv
      if (!cv) return
      const rect = cv.parentNode.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      this.w = rect.width
      this.h = rect.height
      cv.width = this.w * dpr
      cv.height = this.h * dpr
      cv.style.width = this.w + 'px'
      cv.style.height = this.h + 'px'
      const ctx = cv.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    maybeMeteor() {
      if (this.meteors.length < 2 && Math.random() < 0.004) {
        this.meteors.push({
          x: Math.random() * this.w * 0.6,
          y: -20,
          vx: 4 + Math.random() * 3,
          vy: 3 + Math.random() * 2,
          life: 0, max: 60 + Math.random() * 30
        })
      }
    },
    loop() {
      this.rafId = requestAnimationFrame(this.loop)
      this.t++
      const cv = this.$refs.cv
      if (!cv) return
      const ctx = cv.getContext('2d')
      // Deep space background gradient
      const g = ctx.createRadialGradient(this.w * 0.5, this.h * 0.55, 0, this.w * 0.5, this.h * 0.55, Math.max(this.w, this.h))
      g.addColorStop(0, '#0d1233')
      g.addColorStop(0.5, '#070a1e')
      g.addColorStop(1, '#02030a')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, this.w, this.h)

      // Nebulae
      ctx.globalCompositeOperation = 'lighter'
      for (const n of this.nebulae) {
        n.x += n.vx; n.y += n.vy
        if (n.x < -n.r) n.x = this.w + n.r
        if (n.x > this.w + n.r) n.x = -n.r
        if (n.y < -n.r) n.y = this.h + n.r
        if (n.y > this.h + n.r) n.y = -n.r
        const rg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
        rg.addColorStop(0, `hsla(${n.hue}, 90%, 60%, ${n.a})`)
        rg.addColorStop(1, 'hsla(0,0%,0%,0)')
        ctx.fillStyle = rg
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'

      // Stars
      for (const s of this.stars) {
        s.tw += s.twSpd
        s.y += s.vy
        if (s.y > this.h + 4) { s.y = -4; s.x = Math.random() * this.w }
        const tw = 0.5 + Math.abs(Math.sin(s.tw)) * 0.5
        ctx.fillStyle = `hsla(${s.hue}, 100%, 90%, ${s.a * tw})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
        if (s.r > 1.2) {
          ctx.fillStyle = `hsla(${s.hue}, 100%, 80%, ${0.15 * tw})`
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2); ctx.fill()
        }
      }

      // Meteors
      this.maybeMeteor()
      ctx.globalCompositeOperation = 'lighter'
      this.meteors = this.meteors.filter(m => {
        m.x += m.vx; m.y += m.vy; m.life++
        const alpha = Math.max(0, 1 - m.life / m.max)
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(m.x, m.y)
        ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12)
        ctx.stroke()
        return m.life < m.max && m.x < this.w + 40 && m.y < this.h + 40
      })
      ctx.globalCompositeOperation = 'source-over'
    }
  }
}
</script>

<style scoped>
.starfield {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}
</style>
