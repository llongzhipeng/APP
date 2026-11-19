// Space game engine (Canvas 2D)
// - Parallax starfield & subtle nebulae
// - Procedural asteroids with craters and rim lighting (scale-aware)
// - Click-to-destroy: no ship, no bullets, first-person cockpit view
// - Simple, restrained cockpit dashboard

const DIFFICULTY = [
  null,
  { red: 3, gray: 1, speed: 0.9, coef: 1 },
  { red: 4, gray: 2, speed: 1.0, coef: 1.5 },
  { red: 5, gray: 2, speed: 1.25, coef: 2 },
  { red: 6, gray: 3, speed: 1.35, coef: 2.5 },
  { red: 7, gray: 3, speed: 1.6, coef: 3 },
  { red: 8, gray: 4, speed: 1.75, coef: 3.5 },
]
export function difficultyOf (lvl) { return DIFFICULTY[Math.max(1, Math.min(6, lvl))] }

const rand = (a, b) => a + Math.random() * (b - a)
const randi = (a, b) => Math.floor(rand(a, b + 1))
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const TAU = Math.PI * 2

// Screen-size scale factor: asteroids ~ 5% of min dimension
export function sceneScale (w, h) {
  return clamp(Math.min(w, h) / 900, 0.45, 1.4)
}

// ---------- Stars ----------
class Star {
  constructor (w, h, layer) { this.layer = layer; this.reset(w, h, true) }
  reset (w, h, initial) {
    this.x = Math.random() * w
    this.y = initial ? Math.random() * h : -6
    const base = [0.5, 1.0, 1.7][this.layer]
    this.r = base * rand(0.4, 1.2)
    this.v = [6, 18, 40][this.layer] * rand(0.8, 1.2)
    this.tw = rand(0, TAU); this.tws = rand(0.5, 1.6)
  }
  update (dt, w, h) { this.y += this.v * dt; this.tw += dt * this.tws; if (this.y > h + 4) this.reset(w, h, false) }
  draw (ctx) {
    const a = 0.6 + Math.sin(this.tw) * 0.25
    ctx.globalAlpha = clamp(a, 0.15, 1)
    ctx.fillStyle = '#e6efff'
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }
}

class Nebula {
  constructor (w, h) {
    this.x = Math.random() * w; this.y = Math.random() * h
    this.r = rand(220, 380)
    // Cooler, subtler palette (no rainbow)
    const p = [
      ['rgba(60,110,180,', 'rgba(20,35,70,'],
      ['rgba(90,80,150,', 'rgba(30,25,60,'],
      ['rgba(50,90,130,', 'rgba(15,25,45,'],
    ]
    this.p = p[randi(0, p.length - 1)]
    this.vy = rand(2, 5); this.a = rand(0.06, 0.12)
  }
  update (dt, w, h) { this.y += this.vy * dt; if (this.y - this.r > h) { this.y = -this.r; this.x = Math.random() * w } }
  draw (ctx) {
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r)
    g.addColorStop(0, this.p[0] + this.a + ')')
    g.addColorStop(0.6, this.p[1] + (this.a * 0.5) + ')')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, TAU); ctx.fill()
  }
}

// ---------- Asteroid ----------
export class Asteroid {
  constructor (w, h, isRed, speedMul, scale) {
    this.isRed = isRed
    this.scale = scale
    // Base radius scaled to screen
    this.radius = rand(38, 55) * scale
    this.x = rand(this.radius + 20, w - this.radius - 20)
    this.y = -this.radius - rand(10, 200)
    this.z = 1
    this.vx = rand(-25, 25) * scale
    this.vy = rand(90, 130) * speedMul * scale
    this.rot = rand(0, TAU); this.vrot = rand(-0.6, 0.6)
    this.dead = false
    const pts = randi(11, 15)
    this.poly = []
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * TAU
      const r = this.radius * rand(0.82, 1.08)
      this.poly.push([Math.cos(a) * r, Math.sin(a) * r])
    }
    this.craters = []
    const cn = randi(3, 6)
    for (let i = 0; i < cn; i++) {
      this.craters.push({
        x: rand(-this.radius * 0.55, this.radius * 0.55),
        y: rand(-this.radius * 0.55, this.radius * 0.55),
        r: rand(this.radius * 0.08, this.radius * 0.22),
      })
    }
    this._buildTexture()
  }
  _buildTexture () {
    const R = this.radius * 1.3
    const size = Math.ceil(R * 2)
    const c = document.createElement('canvas')
    c.width = size; c.height = size
    const g = c.getContext('2d')
    g.translate(R, R)
    const lx = -this.radius * 0.5, ly = -this.radius * 0.5
    const grad = g.createRadialGradient(lx, ly, this.radius * 0.15, 0, 0, this.radius * 1.15)
    if (this.isRed) {
      grad.addColorStop(0, '#e8b8a0'); grad.addColorStop(0.3, '#c25a3a')
      grad.addColorStop(0.7, '#802018'); grad.addColorStop(1, '#2a0606')
    } else {
      grad.addColorStop(0, '#c4cdd6'); grad.addColorStop(0.3, '#8a929c')
      grad.addColorStop(0.7, '#4a525c'); grad.addColorStop(1, '#181b20')
    }
    g.beginPath()
    this.poly.forEach((p, i) => { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]) })
    g.closePath(); g.fillStyle = grad; g.fill()
    g.save(); g.clip()
    // Soft rim light
    const rim = g.createRadialGradient(lx, ly, this.radius * 0.4, lx, ly, this.radius * 1.6)
    rim.addColorStop(0, 'rgba(255,255,255,0.18)'); rim.addColorStop(0.5, 'rgba(255,255,255,0)')
    g.fillStyle = rim; g.beginPath(); g.arc(0, 0, this.radius * 1.6, 0, TAU); g.fill()
    // Shadow terminator
    const sh = g.createRadialGradient(this.radius * 0.4, this.radius * 0.4, this.radius * 0.2,
      this.radius * 0.4, this.radius * 0.4, this.radius * 1.6)
    sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.55)')
    g.fillStyle = sh; g.beginPath(); g.arc(0, 0, this.radius * 1.6, 0, TAU); g.fill()
    // Craters
    this.craters.forEach(cr => {
      const cg = g.createRadialGradient(cr.x - cr.r * 0.3, cr.y - cr.r * 0.3, 0, cr.x, cr.y, cr.r)
      cg.addColorStop(0, 'rgba(0,0,0,0.55)'); cg.addColorStop(0.8, 'rgba(0,0,0,0.15)')
      cg.addColorStop(1, 'rgba(255,255,255,0.05)')
      g.fillStyle = cg; g.beginPath(); g.arc(cr.x, cr.y, cr.r, 0, TAU); g.fill()
    })
    // subtle speckles
    g.fillStyle = 'rgba(0,0,0,0.2)'
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * TAU, rr = Math.random() * this.radius * 0.9
      g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr, Math.random() * 1.4, 0, TAU); g.fill()
    }
    g.restore()
    g.beginPath()
    this.poly.forEach((p, i) => { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]) })
    g.closePath(); g.lineWidth = 1
    g.strokeStyle = this.isRed ? 'rgba(50,10,10,0.9)' : 'rgba(20,20,25,0.9)'
    g.stroke()
    this._tex = c; this._texR = R
  }
  update (dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.rot += this.vrot * dt }
  offscreen (limit) { return this.y - this.radius > limit + 20 }
  contains (px, py) {
    const dx = px - this.x, dy = py - this.y
    return dx * dx + dy * dy <= this.radius * this.radius
  }
  draw (ctx) {
    const R = this._texR
    ctx.save()
    ctx.translate(this.x, this.y); ctx.rotate(this.rot)
    ctx.drawImage(this._tex, -R, -R)
    ctx.restore()
  }
}

// ---------- Particles / Shockwave ----------
export class Particle {
  constructor (x, y, opts = {}) {
    this.x = x; this.y = y
    const a = rand(0, TAU), s = rand(opts.smin || 60, opts.smax || 260)
    this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s
    this.life = rand(0.4, 0.9); this.age = 0; this.r = rand(1.5, 3.5)
    this.color = opts.color || [255, 200, 120]; this.dead = false
  }
  update (dt) {
    this.age += dt; this.x += this.vx * dt; this.y += this.vy * dt
    this.vx *= 0.96; this.vy *= 0.96
    if (this.age >= this.life) this.dead = true
  }
  draw (ctx) {
    const a = 1 - this.age / this.life
    ctx.globalAlpha = clamp(a, 0, 1)
    const c = this.color
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3)
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`)
    g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`)
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 3, 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }
}

export class Shockwave {
  constructor (x, y, color, maxR) {
    this.x = x; this.y = y; this.r = 4; this.maxR = maxR || 80
    this.age = 0; this.life = 0.4
    this.color = color || [255, 180, 100]; this.dead = false
  }
  update (dt) {
    this.age += dt
    this.r = 4 + (this.maxR - 4) * (this.age / this.life)
    if (this.age >= this.life) this.dead = true
  }
  draw (ctx) {
    const a = 1 - this.age / this.life
    ctx.globalAlpha = a
    ctx.strokeStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${a})`
    ctx.lineWidth = 2.5 * a + 0.5
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, TAU); ctx.stroke()
    ctx.globalAlpha = 1
  }
}

// ---------- Background ----------
export class SpaceBackground {
  constructor (w, h) { this.resize(w, h) }
  resize (w, h) {
    this.w = w; this.h = h
    this.stars = []
    const density = (w * h) / 9000
    for (let i = 0; i < density; i++) this.stars.push(new Star(w, h, randi(0, 2)))
    this.nebulae = []
    for (let i = 0; i < 2; i++) this.nebulae.push(new Nebula(w, h))
  }
  update (dt) { for (const s of this.stars) s.update(dt, this.w, this.h); for (const n of this.nebulae) n.update(dt, this.w, this.h) }
  draw (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.h)
    g.addColorStop(0, '#020616'); g.addColorStop(1, '#050a1e')
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h)
    for (const n of this.nebulae) n.draw(ctx)
    for (const s of this.stars) s.draw(ctx)
  }
}

// ---------- Cockpit ----------
// A restrained first-person cockpit: window frame around the view + a slim
// dashboard band at the bottom. No gauges, no blinking lights, no faux radar.
export class Cockpit {
  constructor (w, h) { this.resize(w, h) }
  resize (w, h) {
    this.w = w; this.h = h
    this.dashH = clamp(h * 0.10, 60, 110)
    this.playfieldBottom = h - this.dashH
    this.strutW = clamp(w * 0.035, 22, 46)
    this.topH = clamp(h * 0.045, 22, 60)
    this._build()
  }
  _build () {
    const w = this.w, h = this.h, sW = this.strutW, tH = this.topH, dH = this.dashH
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const g = c.getContext('2d')
    // Frame color (dark neutral, not neon)
    const frameCol = '#1a2028'
    const edgeCol = '#0a0d12'
    // Top window frame
    g.fillStyle = frameCol; g.fillRect(0, 0, w, tH)
    g.strokeStyle = edgeCol; g.lineWidth = 1
    g.beginPath(); g.moveTo(0, tH + 0.5); g.lineTo(w, tH + 0.5); g.stroke()
    // Side struts
    g.fillRect(0, 0, sW, h - dH)
    g.fillRect(w - sW, 0, sW, h - dH)
    g.beginPath(); g.moveTo(sW + 0.5, tH); g.lineTo(sW + 0.5, h - dH); g.stroke()
    g.beginPath(); g.moveTo(w - sW - 0.5, tH); g.lineTo(w - sW - 0.5, h - dH); g.stroke()
    // Rounded inner corners (subtle bevel)
    g.strokeStyle = 'rgba(255,255,255,0.05)'
    g.lineWidth = 1
    g.beginPath(); g.moveTo(sW, tH + 0.5); g.lineTo(w - sW, tH + 0.5); g.stroke()
    // Dashboard
    const dashY = h - dH
    // Top edge highlight
    g.fillStyle = '#242a34'
    g.fillRect(0, dashY, w, 3)
    g.fillStyle = frameCol
    g.fillRect(0, dashY + 3, w, dH - 3)
    // Deep shadow beneath edge
    g.fillStyle = 'rgba(0,0,0,0.5)'
    g.fillRect(0, dashY + 3, w, 2)
    // Subtle horizontal panel divisions
    g.strokeStyle = 'rgba(255,255,255,0.04)'
    g.beginPath(); g.moveTo(0, dashY + dH * 0.55); g.lineTo(w, dashY + dH * 0.55); g.stroke()
    // Very subtle glass reflection near the top of the viewport
    g.save()
    const sh = g.createLinearGradient(0, tH, 0, tH + h * 0.15)
    sh.addColorStop(0, 'rgba(255,255,255,0.03)')
    sh.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = sh
    g.fillRect(sW, tH, w - sW * 2, h * 0.15)
    g.restore()
    this._tex = c
  }
  update () { /* static */ }
  draw (ctx) { ctx.drawImage(this._tex, 0, 0) }
}
