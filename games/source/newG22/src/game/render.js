// Rendering utilities for the racing game
// Uses HTML5 Canvas with fake 3D perspective

// Polyfill: CanvasRenderingContext2D.roundRect is missing on older Android
// browsers / WebViews. Without this, drawCar throws mid-render and the car
// appears as just a shadow + rear wing.
if (typeof CanvasRenderingContext2D !== 'undefined' &&
    !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r]
    else if (Array.isArray(r)) {
      if (r.length === 1) r = [r[0], r[0], r[0], r[0]]
      else if (r.length === 2) r = [r[0], r[1], r[0], r[1]]
      else if (r.length === 3) r = [r[0], r[1], r[2], r[1]]
    } else r = [0, 0, 0, 0]
    const maxR = Math.min(Math.abs(w), Math.abs(h)) / 2
    const [tl, tr, br, bl] = r.map(v => Math.min(Math.max(v, 0), maxR))
    this.moveTo(x + tl, y)
    this.lineTo(x + w - tr, y)
    this.quadraticCurveTo(x + w, y, x + w, y + tr)
    this.lineTo(x + w, y + h - br)
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
    this.lineTo(x + bl, y + h)
    this.quadraticCurveTo(x, y + h, x, y + h - bl)
    this.lineTo(x, y + tl)
    this.quadraticCurveTo(x, y, x + tl, y)
    return this
  }
}

export function drawScene(ctx, w, h, state) {
  const skyH = h * 0.4
  const horizonY = skyH

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, skyH)
  sky.addColorStop(0, '#0b1329')
  sky.addColorStop(0.4, '#1e3a8a')
  sky.addColorStop(0.75, '#7c3aed')
  sky.addColorStop(1, '#f97316')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, skyH)

  // Sun/moon disc
  const sunX = w * 0.5
  const sunY = skyH * 0.7
  const sunR = Math.min(w, h) * 0.06
  const sunGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 3.5)
  sunGrad.addColorStop(0, 'rgba(255, 240, 200, 1)')
  sunGrad.addColorStop(0.15, 'rgba(255, 180, 100, 0.7)')
  sunGrad.addColorStop(0.5, 'rgba(255, 100, 50, 0.2)')
  sunGrad.addColorStop(1, 'rgba(255, 100, 50, 0)')
  ctx.fillStyle = sunGrad
  ctx.fillRect(0, 0, w, skyH)

  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 240, 200, 0.95)'
  ctx.fill()

  // Mountain silhouettes
  drawMountains(ctx, w, skyH, state)

  // Stars in upper sky
  drawStars(ctx, w, skyH * 0.5, state.time)

  // Ground / grass on sides + road
  drawGround(ctx, w, h, horizonY, state)
}

function drawMountains(ctx, w, skyH, state) {
  ctx.save()
  const layers = [
    { color: '#1e1b4b', ampl: 0.5, freq: 1.2, y: skyH * 0.9 },
    { color: '#312e81', ampl: 0.35, freq: 2.1, y: skyH * 0.85 },
    { color: '#4c1d95', ampl: 0.25, freq: 3.4, y: skyH * 0.8 }
  ]
  for (const L of layers) {
    ctx.fillStyle = L.color
    ctx.beginPath()
    ctx.moveTo(0, skyH)
    for (let x = 0; x <= w; x += 20) {
      const t = (x / w) * Math.PI * L.freq
      const y = L.y - Math.sin(t) * skyH * 0.15 * L.ampl - Math.cos(t * 1.7) * skyH * 0.08 * L.ampl
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, skyH)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawStars(ctx, w, h, time) {
  ctx.save()
  for (let i = 0; i < 60; i++) {
    const x = ((i * 137.5) % 100) / 100 * w
    const y = ((i * 79.3) % 100) / 100 * h
    const size = ((i % 3) + 1) * 0.6
    const twinkle = 0.4 + 0.6 * Math.sin(time * 0.003 + i)
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawGround(ctx, w, h, horizonY, state) {
  const groundH = h - horizonY

  // Grass gradient (side)
  const grass = ctx.createLinearGradient(0, horizonY, 0, h)
  grass.addColorStop(0, '#052e16')
  grass.addColorStop(0.5, '#166534')
  grass.addColorStop(1, '#22c55e')
  ctx.fillStyle = grass
  ctx.fillRect(0, horizonY, w, groundH)

  // Road: perspective trapezoid
  const roadTopHalf = w * 0.05
  const roadBotHalf = w * 0.42
  const cx = w / 2
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx - roadTopHalf, horizonY)
  ctx.lineTo(cx + roadTopHalf, horizonY)
  ctx.lineTo(cx + roadBotHalf, h)
  ctx.lineTo(cx - roadBotHalf, h)
  ctx.closePath()
  ctx.clip()

  // Road fill (darker at horizon)
  const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h)
  roadGrad.addColorStop(0, '#1a1a2e')
  roadGrad.addColorStop(0.5, '#252542')
  roadGrad.addColorStop(1, '#2d2d4a')
  ctx.fillStyle = roadGrad
  ctx.fillRect(cx - roadBotHalf, horizonY, roadBotHalf * 2, groundH)

  // Ground grid lines for depth feeling
  drawRoadLines(ctx, w, h, horizonY, roadTopHalf, roadBotHalf, state)

  ctx.restore()

  // Road edges (yellow curbs)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - roadTopHalf, horizonY)
  ctx.lineTo(cx - roadBotHalf, h)
  ctx.moveTo(cx + roadTopHalf, horizonY)
  ctx.lineTo(cx + roadBotHalf, h)
  ctx.stroke()
}

function drawRoadLines(ctx, w, h, horizonY, topHalf, botHalf, state) {
  const cx = w / 2
  const groundH = h - horizonY

  // Horizontal ground strips alternating light/dark (parallax scroll)
  const scroll = state.roadScroll
  const stripCount = 40
  for (let i = 0; i < stripCount; i++) {
    // z in [0..1], where 1 = near, 0 = far
    let z = (i + (scroll % 1)) / stripCount
    // Nonlinear for depth
    z = Math.pow(z, 2.2)
    const y = horizonY + groundH * z
    const halfW = topHalf + (botHalf - topHalf) * z
    const nextZ = Math.pow((i + 1 + (scroll % 1)) / stripCount, 2.2)
    const yNext = horizonY + groundH * nextZ
    if (Math.floor(i + Math.floor(scroll)) % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)'
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
    }
    ctx.fillRect(cx - halfW * 1.1, y, halfW * 2.2, yNext - y + 1)
  }

  // Lane dividers (dashed yellow lines) - two lines dividing 3 lanes
  for (const laneEdge of [-1 / 3, 1 / 3]) {
    const dashCount = 24
    for (let i = 0; i < dashCount; i++) {
      let z = ((i + scroll) % dashCount) / dashCount
      z = Math.pow(z, 2.2)
      const y = horizonY + groundH * z
      const halfW = topHalf + (botHalf - topHalf) * z
      const nextZ = Math.pow(((i + scroll) % dashCount + 0.4) / dashCount, 2.2)
      const yNext = horizonY + groundH * nextZ
      const laneX = cx + halfW * laneEdge
      const dashW = 3 + z * 8
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(laneX - dashW / 2, y, dashW, Math.max(2, yNext - y))
    }
  }
}

// Given a lane index (1,2,3) and z depth (0 far, 1 near), return screen x
export function laneX(w, lane, z) {
  const cx = w / 2
  const topHalf = w * 0.05
  const botHalf = w * 0.42
  const halfW = topHalf + (botHalf - topHalf) * z
  // Lane centers at -2/3, 0, 2/3 of full width => (lane - 2) * 2/3
  const laneOffset = ((lane - 2) * (2 / 3)) * halfW
  return cx + laneOffset
}

export function laneY(h, horizonY, z) {
  return horizonY + (h - horizonY) * z
}

export function laneScale(z) {
  // Scale of objects: near = big, far = tiny
  return 0.15 + z * 0.85
}

// Draw a stylized sports car at (x, y) with scale
export function drawCar(ctx, x, y, scale, tilt = 0) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.rotate(tilt)

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.beginPath()
  ctx.ellipse(0, 50, 55, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  // Rear wing
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(-45, 20, 90, 6)
  ctx.fillStyle = '#e11d48'
  ctx.fillRect(-45, 22, 90, 3)

  // Wheels
  ctx.fillStyle = '#0a0a0a'
  ctx.beginPath(); ctx.roundRect(-52, -20, 10, 30, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(42, -20, 10, 30, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(-52, 10, 10, 30, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(42, 10, 10, 30, 3); ctx.fill()
  // Rims
  ctx.fillStyle = '#666'
  ctx.beginPath(); ctx.arc(-47, -5, 3, 0, Math.PI * 2); ctx.arc(47, -5, 3, 0, Math.PI * 2); ctx.arc(-47, 25, 3, 0, Math.PI * 2); ctx.arc(47, 25, 3, 0, Math.PI * 2); ctx.fill()

  // Main body (red gradient)
  const bodyGrad = ctx.createLinearGradient(0, -40, 0, 45)
  bodyGrad.addColorStop(0, '#fca5a5')
  bodyGrad.addColorStop(0.15, '#ef4444')
  bodyGrad.addColorStop(0.5, '#dc2626')
  bodyGrad.addColorStop(1, '#7f1d1d')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.moveTo(-38, -45)
  ctx.quadraticCurveTo(-42, -20, -44, 5)
  ctx.quadraticCurveTo(-45, 30, -42, 42)
  ctx.lineTo(42, 42)
  ctx.quadraticCurveTo(45, 30, 44, 5)
  ctx.quadraticCurveTo(42, -20, 38, -45)
  ctx.quadraticCurveTo(0, -50, -38, -45)
  ctx.closePath()
  ctx.fill()

  // Top shine
  const shineGrad = ctx.createLinearGradient(0, -45, 0, 0)
  shineGrad.addColorStop(0, 'rgba(255,255,255,0.5)')
  shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shineGrad
  ctx.beginPath()
  ctx.moveTo(-32, -42)
  ctx.quadraticCurveTo(0, -48, 32, -42)
  ctx.quadraticCurveTo(28, -30, 0, -28)
  ctx.quadraticCurveTo(-28, -30, -32, -42)
  ctx.closePath()
  ctx.fill()

  // Windshield / cockpit
  ctx.fillStyle = '#0e1a35'
  ctx.beginPath()
  ctx.moveTo(-30, -30)
  ctx.quadraticCurveTo(0, -35, 30, -30)
  ctx.lineTo(28, 0)
  ctx.quadraticCurveTo(0, -3, -28, 0)
  ctx.closePath()
  ctx.fill()

  // Cockpit reflection
  const glass = ctx.createLinearGradient(0, -30, 0, 0)
  glass.addColorStop(0, 'rgba(96, 165, 250, 0.6)')
  glass.addColorStop(1, 'rgba(96, 165, 250, 0)')
  ctx.fillStyle = glass
  ctx.beginPath()
  ctx.moveTo(-25, -28)
  ctx.quadraticCurveTo(0, -32, 25, -28)
  ctx.quadraticCurveTo(20, -18, 0, -20)
  ctx.quadraticCurveTo(-20, -18, -25, -28)
  ctx.closePath()
  ctx.fill()

  // Side stripe / accents
  ctx.fillStyle = '#000'
  ctx.fillRect(-40, 5, 80, 2)
  ctx.fillStyle = '#facc15'
  ctx.fillRect(-30, 8, 60, 1)

  // Headlights
  const light = ctx.createRadialGradient(-25, -40, 1, -25, -40, 8)
  light.addColorStop(0, '#fffbea')
  light.addColorStop(0.5, '#fbbf24')
  light.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = light
  ctx.beginPath(); ctx.arc(-25, -40, 8, 0, Math.PI * 2); ctx.fill()
  const light2 = ctx.createRadialGradient(25, -40, 1, 25, -40, 8)
  light2.addColorStop(0, '#fffbea')
  light2.addColorStop(0.5, '#fbbf24')
  light2.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = light2
  ctx.beginPath(); ctx.arc(25, -40, 8, 0, Math.PI * 2); ctx.fill()

  // Tail lights (red)
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(-35, 35, 12, 5)
  ctx.fillRect(23, 35, 12, 5)

  // Number
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('07', 0, -10)

  ctx.restore()
}

// Draw obstacle - varied types for visual richness
export function drawObstacle(ctx, x, y, scale, type = 'cone') {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.ellipse(0, 40, 40, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  if (type === 'cone') {
    // Traffic cone
    // Base
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath()
    ctx.ellipse(0, 35, 30, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#333'
    ctx.fillRect(-28, 30, 56, 6)

    // Cone body
    const grad = ctx.createLinearGradient(-20, -40, 20, 35)
    grad.addColorStop(0, '#fdba74')
    grad.addColorStop(0.5, '#f97316')
    grad.addColorStop(1, '#c2410c')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(-22, 30)
    ctx.lineTo(22, 30)
    ctx.lineTo(6, -45)
    ctx.lineTo(-6, -45)
    ctx.closePath()
    ctx.fill()

    // White reflective stripes
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.moveTo(-17, 10); ctx.lineTo(17, 10); ctx.lineTo(15, 4); ctx.lineTo(-15, 4); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(-13, -10); ctx.lineTo(13, -10); ctx.lineTo(11, -16); ctx.lineTo(-11, -16); ctx.closePath(); ctx.fill()

    // Top ball
    ctx.fillStyle = '#c2410c'
    ctx.beginPath(); ctx.arc(0, -45, 4, 0, Math.PI * 2); ctx.fill()
  } else if (type === 'barrier') {
    // Concrete barrier
    const grad = ctx.createLinearGradient(0, -20, 0, 30)
    grad.addColorStop(0, '#f3f4f6')
    grad.addColorStop(0.5, '#d1d5db')
    grad.addColorStop(1, '#6b7280')
    ctx.fillStyle = grad
    ctx.fillRect(-32, -20, 64, 55)
    // Top
    ctx.fillStyle = '#e5e7eb'
    ctx.beginPath()
    ctx.moveTo(-32, -20)
    ctx.lineTo(32, -20)
    ctx.lineTo(28, -26)
    ctx.lineTo(-28, -26)
    ctx.closePath()
    ctx.fill()
    // Warning stripes
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#000' : '#facc15'
      ctx.fillRect(-32 + i * 13, 5, 13, 15)
    }
    ctx.fillStyle = '#000'
    ctx.fillRect(-32, 25, 64, 3)
  } else if (type === 'oildrum') {
    // Oil drum
    const grad = ctx.createLinearGradient(-25, 0, 25, 0)
    grad.addColorStop(0, '#450a0a')
    grad.addColorStop(0.3, '#dc2626')
    grad.addColorStop(0.5, '#ef4444')
    grad.addColorStop(0.7, '#dc2626')
    grad.addColorStop(1, '#450a0a')
    ctx.fillStyle = grad
    ctx.fillRect(-25, -40, 50, 80)
    // Top ellipse
    ctx.fillStyle = '#7f1d1d'
    ctx.beginPath(); ctx.ellipse(0, -40, 25, 6, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 2
    ctx.strokeRect(-25, -20, 50, 3)
    ctx.strokeRect(-25, 15, 50, 3)
    // Warning symbol
    ctx.fillStyle = '#facc15'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('!', 0, 5)
  } else if (type === 'rock') {
    // Rock/boulder
    const grad = ctx.createRadialGradient(-8, -15, 5, 0, 0, 40)
    grad.addColorStop(0, '#9ca3af')
    grad.addColorStop(0.6, '#4b5563')
    grad.addColorStop(1, '#1f2937')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(-30, 25)
    ctx.quadraticCurveTo(-38, 5, -30, -20)
    ctx.quadraticCurveTo(-10, -35, 15, -30)
    ctx.quadraticCurveTo(35, -15, 32, 10)
    ctx.quadraticCurveTo(25, 30, 0, 30)
    ctx.closePath()
    ctx.fill()
    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.ellipse(-8, -18, 12, 8, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// Speed lines effect
export function drawSpeedLines(ctx, w, h, speed, time) {
  ctx.save()
  const count = Math.min(30, Math.floor(speed / 40))
  for (let i = 0; i < count; i++) {
    const seed = i * 137.5
    const x = (Math.sin(seed) * 0.5 + 0.5) * w
    const startY = ((time * 0.5 + seed * 7) % h)
    const len = 20 + (i % 5) * 8
    const alpha = 0.15 + (i % 3) * 0.05
    const grad = ctx.createLinearGradient(x, startY, x, startY + len)
    grad.addColorStop(0, `rgba(255,255,255,0)`)
    grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`)
    grad.addColorStop(1, `rgba(255,255,255,0)`)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, startY + len)
    ctx.stroke()
  }
  ctx.restore()
}

// Explosion / crash effect
export function drawExplosion(ctx, x, y, progress) {
  // progress 0..1
  ctx.save()
  ctx.translate(x, y)
  const r = 20 + progress * 80
  const alpha = 1 - progress

  // Bright core
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
  g.addColorStop(0, `rgba(255,255,255,${alpha})`)
  g.addColorStop(0.15, `rgba(255,240,150,${alpha * 0.9})`)
  g.addColorStop(0.4, `rgba(251, 146, 60, ${alpha * 0.7})`)
  g.addColorStop(0.7, `rgba(239, 68, 68, ${alpha * 0.4})`)
  g.addColorStop(1, `rgba(0,0,0,0)`)
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill()

  // Particles
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const dist = progress * 100
    const px = Math.cos(angle) * dist
    const py = Math.sin(angle) * dist
    const size = 4 * (1 - progress)
    ctx.fillStyle = `rgba(251, 146, 60, ${alpha})`
    ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

// Score pop-up
export function drawScorePop(ctx, x, y, text, color, progress) {
  ctx.save()
  const alpha = 1 - progress
  const dy = progress * 60
  const scale = 0.5 + progress * 1.2
  ctx.translate(x, y - dy)
  ctx.scale(scale, scale)
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = color
  ctx.shadowBlur = 20
  ctx.fillText(text, 0, 0)
  ctx.restore()
}
