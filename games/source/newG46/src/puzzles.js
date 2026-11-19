// Procedural scene generator for 火眼金睛.
//
// Each round we build a random scene as an SVG string, then produce TWO variants:
// - left  (baseline)
// - right (baseline with N parts mutated per the level spec)
//
// The scene is served to <PuzzleScene> as a data: URL so it renders through the
// existing image code path. Diff hotspots come out of the generator directly —
// count/tier/coords are always in lockstep with what the image depicts.
//
// Difficulty grid (redme.md):
//   L1: 1 diff  obvious 1.0x 15s   L2: 2 obvious 1.5x 15s   L3: 3 medium 2.0x 15s
//   L4: 3~4 medium 2.5x 30s        L5: 4~5 subtle 3.0x 30s  L6: 5 subtle 3.5x 30s

const W = 1024, H = 768

const randI = (a, b) => Math.floor(a + Math.random() * (b - a + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickDiff = (arr, cur) => {
  const others = arr.filter(x => x !== cur)
  return others[Math.floor(Math.random() * others.length)]
}
// For obvious-tier mutations we want the swap to be perceptually far, not just
// "different". Colors: max HSL hue distance. Non-colors: any different value.
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
function hueOf(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255
  const g = parseInt(hex.slice(3,5), 16) / 255
  const b = parseInt(hex.slice(5,7), 16) / 255
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn
  if (!d) return 0
  let h
  if (mx === r) h = ((g - b) / d) % 6
  else if (mx === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h *= 60
  return (h + 360) % 360
}
function pickFar(arr, cur) {
  const others = arr.filter(x => x !== cur)
  if (!others.length) return cur
  if (isHex(cur) && others.every(isHex)) {
    const ch = hueOf(cur)
    let best = others[0], bestD = -1
    for (const o of others) {
      const dh = Math.abs(hueOf(o) - ch)
      const d = Math.min(dh, 360 - dh)
      if (d > bestD) { bestD = d; best = o }
    }
    return best
  }
  return others[Math.floor(Math.random() * others.length)]
}
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

export const LEVEL_CONFIG = {
  1: { count: 1,           tier: 'obvious', coef: 1.0, time: 15 },
  2: { count: 2,           tier: 'obvious', coef: 1.5, time: 15 },
  3: { count: 3,           tier: 'medium',  coef: 2.0, time: 15 },
  4: { countRange: [3, 4], tier: 'medium',  coef: 2.5, time: 30 },
  5: { countRange: [4, 5], tier: 'subtle',  coef: 3.0, time: 30 },
  6: { count: 5,           tier: 'subtle',  coef: 3.5, time: 30 },
}

function levelDiffCount(level) {
  const c = LEVEL_CONFIG[level]
  if (c.count) return c.count
  const [a, b] = c.countRange
  return randI(a, b)
}

// ---------------------------------------------------------------------------
// Palette pools (used by mutators)
// ---------------------------------------------------------------------------
const BRIGHT = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#ff6b81']
const SOFT   = ['#fab1a0', '#a29bfe', '#81ecec', '#ffeaa7', '#fdcb6e', '#55efc4', '#74b9ff', '#dfe6e9']
const NEUTRAL = ['#2d3436', '#636e72', '#8b6f47', '#5d4037', '#95a5a6']
const SKY = ['#cfeaff', '#ffeadf', '#e6f4ff', '#fef6d5', '#e8f7ee', '#f0e6ff']
const GROUND = ['#8ad38f', '#c8a878', '#b48a5a', '#7ec9d3', '#e2c69a']

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------
function svgWrap(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`
}
function toDataUrl(svg) {
  // encodeURIComponent handles the # in colours; keep it simple & UTF-safe.
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// ---------------------------------------------------------------------------
// Object factories — each returns { render(spec), parts }.
// parts: { partId: { tier, hotspot: {x,y,r}, variants, mutator?(spec, tier) } }
// A mutator lets a part support tier-scaled mutations (e.g. subtle = smaller
// tilt) even when its base variant set is discrete.
// ---------------------------------------------------------------------------

// --- Balloon ---
function makeBalloon(cx, cy, size = 1) {
  const rx = 90 * size, ry = 110 * size
  return {
    parts: {
      color:   { tier: 'obvious', hotspot: { x: cx, y: cy, r: rx * 1.05 }, variants: BRIGHT.slice(0, 6) },
      pattern: { tier: 'medium',  hotspot: { x: cx, y: cy, r: rx * 0.6 },  variants: ['none', 'stripes', 'dots', 'star'] },
      string:  { tier: 'subtle',  hotspot: { x: cx, y: cy + ry + 60, r: 40 }, variants: ['straight', 'wavy'] },
    },
    render(spec) {
      const c = spec.color
      const patternId = `bp-${Math.random().toString(36).slice(2, 7)}`
      let overlay = ''
      if (spec.pattern === 'stripes') {
        overlay = `<g clip-path="url(#${patternId})"><rect x="${cx - rx}" y="${cy - ry}" width="${rx*2}" height="${ry*2}" fill="url(#${patternId}-st)"/></g>`
      } else if (spec.pattern === 'dots') {
        let dots = ''
        for (let i = 0; i < 12; i++) {
          const a = i * (Math.PI * 2 / 12)
          dots += `<circle cx="${cx + Math.cos(a) * rx * 0.55}" cy="${cy + Math.sin(a) * ry * 0.55}" r="8" fill="rgba(255,255,255,0.7)"/>`
        }
        overlay = dots
      } else if (spec.pattern === 'star') {
        overlay = `<polygon points="${starPts(cx, cy, rx * 0.35, 5)}" fill="rgba(255,255,255,0.75)"/>`
      }
      const stringPath = spec.string === 'wavy'
        ? `M ${cx} ${cy + ry} q -18 30 0 60 t 0 60 t 0 60`
        : `M ${cx} ${cy + ry} L ${cx} ${cy + ry + 180}`
      const defs = spec.pattern === 'stripes'
        ? `<defs>
             <clipPath id="${patternId}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>
             <pattern id="${patternId}-st" width="24" height="24" patternUnits="userSpaceOnUse">
               <rect width="24" height="24" fill="none"/><rect y="0" width="24" height="10" fill="rgba(255,255,255,0.55)"/>
             </pattern>
           </defs>`
        : ''
      return defs +
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" stroke="#333" stroke-width="3.5"/>` +
        overlay +
        `<polygon points="${cx-8},${cy+ry} ${cx+8},${cy+ry} ${cx},${cy+ry+18}" fill="#333"/>` +
        `<path d="${stringPath}" stroke="#333" stroke-width="2.5" fill="none"/>`
    },
  }
}

// --- House ---
function makeHouse(cx, cy) {
  return {
    parts: {
      roofColor:   { tier: 'obvious', hotspot: { x: cx, y: cy - 80, r: 100 }, variants: ['#c0392b', '#3498db', '#2ecc71', '#f1c40f', '#8e44ad', '#2c3e50'] },
      wallColor:   { tier: 'obvious', hotspot: { x: cx, y: cy + 60, r: 90 },  variants: ['#f7d794', '#e74c3c', '#a3e4d7', '#dfe6e9', '#fab1a0', '#9b59b6'] },
      doorColor:   { tier: 'obvious', hotspot: { x: cx, y: cy + 100, r: 50 }, variants: ['#5d4037', '#c0392b', '#2c3e50', '#2ecc71', '#e67e22'] },
      chimney:     { tier: 'medium',  hotspot: { x: cx + 90, y: cy - 130, r: 40 }, variants: ['on', 'off'] },
      windowShape: { tier: 'medium',  hotspot: { x: cx - 70, y: cy + 20, r: 45 }, variants: ['square', 'circle', 'arch'] },
      doorShape:   { tier: 'medium',  hotspot: { x: cx, y: cy + 100, r: 40 },  variants: ['flat', 'arch'] },
      handleSide:  { tier: 'subtle',  hotspot: { x: cx, y: cy + 110, r: 25 },  variants: ['left', 'right'] },
      windowGrid:  { tier: 'subtle',  hotspot: { x: cx + 70, y: cy + 20, r: 40 }, variants: ['cross', 'horizontal', 'vertical'] },
    },
    render(spec) {
      const roof = `<polygon points="${cx-140},${cy-40} ${cx},${cy-160} ${cx+140},${cy-40}" fill="${spec.roofColor}" stroke="#333" stroke-width="3.5"/>`
      const chimney = spec.chimney === 'on'
        ? `<rect x="${cx+70}" y="${cy-140}" width="30" height="60" fill="#8b2a1e" stroke="#333" stroke-width="2.5"/>`
        : ''
      const wall = `<rect x="${cx-120}" y="${cy-40}" width="240" height="200" fill="${spec.wallColor}" stroke="#333" stroke-width="3.5"/>`

      const winLeft  = renderWindow(cx - 70, cy + 20, spec.windowShape, spec.windowGrid, '#87ceeb')
      const winRight = renderWindow(cx + 70, cy + 20, spec.windowShape, spec.windowGrid, '#87ceeb')

      const door = spec.doorShape === 'arch'
        ? `<path d="M ${cx-25} ${cy+160} L ${cx-25} ${cy+100} Q ${cx-25} ${cy+70} ${cx} ${cy+70} Q ${cx+25} ${cy+70} ${cx+25} ${cy+100} L ${cx+25} ${cy+160} Z" fill="${spec.doorColor}" stroke="#333" stroke-width="3"/>`
        : `<rect x="${cx-25}" y="${cy+80}" width="50" height="80" fill="${spec.doorColor}" stroke="#333" stroke-width="3"/>`
      const handleX = spec.handleSide === 'left' ? cx - 15 : cx + 15
      const handle = `<circle cx="${handleX}" cy="${cy+120}" r="4" fill="#f1c40f" stroke="#333" stroke-width="1.5"/>`

      return roof + chimney + wall + winLeft + winRight + door + handle
    },
  }
}

function renderWindow(cx, cy, shape, grid, fill) {
  let frame
  if (shape === 'circle') frame = `<circle cx="${cx}" cy="${cy}" r="30" fill="${fill}" stroke="#333" stroke-width="2.5"/>`
  else if (shape === 'arch') frame = `<path d="M ${cx-28} ${cy+28} L ${cx-28} ${cy-5} Q ${cx-28} ${cy-32} ${cx} ${cy-32} Q ${cx+28} ${cy-32} ${cx+28} ${cy-5} L ${cx+28} ${cy+28} Z" fill="${fill}" stroke="#333" stroke-width="2.5"/>`
  else frame = `<rect x="${cx-30}" y="${cy-30}" width="60" height="60" fill="${fill}" stroke="#333" stroke-width="2.5"/>`
  let bars = ''
  if (grid === 'cross') bars = `<line x1="${cx}" y1="${cy-30}" x2="${cx}" y2="${cy+30}" stroke="#333" stroke-width="2"/><line x1="${cx-30}" y1="${cy}" x2="${cx+30}" y2="${cy}" stroke="#333" stroke-width="2"/>`
  else if (grid === 'horizontal') bars = `<line x1="${cx-30}" y1="${cy}" x2="${cx+30}" y2="${cy}" stroke="#333" stroke-width="2"/>`
  else if (grid === 'vertical') bars = `<line x1="${cx}" y1="${cy-30}" x2="${cx}" y2="${cy+30}" stroke="#333" stroke-width="2"/>`
  return frame + bars
}

// --- Tree ---
function makeTree(cx, cy) {
  return {
    parts: {
      canopyColor: { tier: 'obvious', hotspot: { x: cx, y: cy - 40, r: 60 }, variants: ['#2ecc71', '#27ae60', '#f39c12', '#e67e22', '#e74c3c', '#8e44ad'] },
      canopyShape: { tier: 'medium',  hotspot: { x: cx, y: cy - 40, r: 55 }, variants: ['round', 'triangle', 'cloud'] },
      fruit:       { tier: 'subtle',  hotspot: { x: cx, y: cy - 40, r: 55 }, variants: ['none', 'apples', 'stars'] },
    },
    render(spec) {
      let canopy
      if (spec.canopyShape === 'triangle') {
        canopy = `<polygon points="${cx-60},${cy} ${cx},${cy-110} ${cx+60},${cy}" fill="${spec.canopyColor}" stroke="#1e6e3a" stroke-width="2.5"/>`
      } else if (spec.canopyShape === 'cloud') {
        canopy = `<g fill="${spec.canopyColor}" stroke="#1e6e3a" stroke-width="2">
          <circle cx="${cx-25}" cy="${cy-30}" r="30"/><circle cx="${cx+25}" cy="${cy-30}" r="30"/>
          <circle cx="${cx}" cy="${cy-55}" r="34"/><circle cx="${cx}" cy="${cy-15}" r="26"/>
        </g>`
      } else {
        canopy = `<circle cx="${cx}" cy="${cy-40}" r="55" fill="${spec.canopyColor}" stroke="#1e6e3a" stroke-width="2.5"/>`
      }
      let fruit = ''
      if (spec.fruit === 'apples') {
        for (const [dx, dy] of [[-25,-40],[20,-55],[10,-20],[-15,-15],[28,-25]]) fruit += `<circle cx="${cx+dx}" cy="${cy+dy}" r="6" fill="#e74c3c"/>`
      } else if (spec.fruit === 'stars') {
        for (const [dx, dy] of [[-22,-42],[22,-52],[8,-18]]) fruit += `<polygon points="${starPts(cx+dx, cy+dy, 8, 5)}" fill="#f4c430"/>`
      }
      const trunk = `<rect x="${cx-10}" y="${cy}" width="20" height="60" fill="#6d4c41" stroke="#333" stroke-width="2"/>`
      return canopy + fruit + trunk
    },
  }
}

// --- Sun / Moon ---
function makeSun(cx, cy) {
  return {
    parts: {
      color: { tier: 'obvious', hotspot: { x: cx, y: cy, r: 55 }, variants: ['#ffd94a', '#e74c3c', '#3498db', '#ffffff'] },
      rays:  { tier: 'medium',  hotspot: { x: cx, y: cy, r: 80 }, variants: ['on', 'off'] },
      face:  { tier: 'subtle',  hotspot: { x: cx, y: cy, r: 40 }, variants: ['none', 'smile'] },
    },
    render(spec) {
      let rays = ''
      if (spec.rays === 'on') {
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4
          rays += `<line x1="${cx + Math.cos(a) * 55}" y1="${cy + Math.sin(a) * 55}" x2="${cx + Math.cos(a) * 78}" y2="${cy + Math.sin(a) * 78}" stroke="#e6b800" stroke-width="4" stroke-linecap="round"/>`
        }
      }
      const body = `<circle cx="${cx}" cy="${cy}" r="42" fill="${spec.color}" stroke="#e6b800" stroke-width="3"/>`
      const face = spec.face === 'smile'
        ? `<circle cx="${cx-14}" cy="${cy-6}" r="4" fill="#333"/><circle cx="${cx+14}" cy="${cy-6}" r="4" fill="#333"/><path d="M ${cx-14} ${cy+12} Q ${cx} ${cy+24} ${cx+14} ${cy+12}" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
        : ''
      return rays + body + face
    },
  }
}

// --- Flower ---
function makeFlower(cx, cy) {
  return {
    parts: {
      petalColor: { tier: 'obvious', hotspot: { x: cx, y: cy, r: 40 }, variants: ['#e91e63', '#9b59b6', '#f39c12', '#3498db', '#e74c3c'] },
      petals:     { tier: 'medium',  hotspot: { x: cx, y: cy, r: 40 }, variants: [4, 5, 6, 8] },
      center:     { tier: 'subtle',  hotspot: { x: cx, y: cy, r: 12 }, variants: ['#f6d743', '#ffffff', '#333333'] },
    },
    render(spec) {
      let petals = ''
      const n = spec.petals
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / n)
        const px = cx + Math.cos(a) * 22, py = cy + Math.sin(a) * 22
        petals += `<circle cx="${px}" cy="${py}" r="18" fill="${spec.petalColor}" stroke="#333" stroke-width="1.5"/>`
      }
      const stem = `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy+90}" stroke="#2e9149" stroke-width="5"/>`
      const center = `<circle cx="${cx}" cy="${cy}" r="12" fill="${spec.center}" stroke="#333" stroke-width="1.5"/>`
      return stem + petals + center
    },
  }
}

// --- Cloud (existence + shape) ---
function makeCloud(cx, cy) {
  return {
    parts: {
      exists: { tier: 'obvious', hotspot: { x: cx, y: cy, r: 60 }, variants: ['on', 'off'] },
      color:  { tier: 'subtle',  hotspot: { x: cx, y: cy, r: 50 }, variants: ['#ffffff', '#dfe6e9', '#e8e8e8'] },
    },
    render(spec) {
      if (spec.exists === 'off') return ''
      return `<g fill="${spec.color}" stroke="#c8ccd4" stroke-width="2">
        <ellipse cx="${cx-30}" cy="${cy+8}" rx="34" ry="20"/>
        <ellipse cx="${cx+30}" cy="${cy+8}" rx="34" ry="20"/>
        <ellipse cx="${cx}" cy="${cy-8}" rx="38" ry="24"/>
      </g>`
    },
  }
}

// --- Bird (existence) ---
function makeBird(cx, cy) {
  return {
    parts: {
      exists: { tier: 'obvious', hotspot: { x: cx, y: cy, r: 40 }, variants: ['on', 'off'] },
    },
    render(spec) {
      if (spec.exists === 'off') return ''
      return `<g stroke="#333" stroke-width="4" fill="none" stroke-linecap="round">
        <path d="M ${cx-25} ${cy} q 12 -14 25 0"/><path d="M ${cx} ${cy} q 12 -14 25 0"/>
      </g>`
    },
  }
}

// --- Star (existence + count) ---
function makeStar(cx, cy) {
  return {
    parts: {
      exists: { tier: 'medium', hotspot: { x: cx, y: cy, r: 22 }, variants: ['on', 'off'] },
      color:  { tier: 'subtle', hotspot: { x: cx, y: cy, r: 20 }, variants: ['#f4c430', '#ffffff', '#3498db'] },
    },
    render(spec) {
      if (spec.exists === 'off') return ''
      return `<polygon points="${starPts(cx, cy, 18, 5)}" fill="${spec.color}" stroke="#c9992a" stroke-width="1.5"/>`
    },
  }
}

// --- Utility: star polygon points ---
function starPts(cx, cy, r, spikes) {
  const pts = []
  for (let k = 0; k < spikes * 2; k++) {
    const rr = k % 2 === 0 ? r : r * 0.45
    const a = -Math.PI / 2 + k * Math.PI / spikes
    pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`)
  }
  return pts.join(' ')
}

// ---------------------------------------------------------------------------
// Scene templates — each combines several object factories at chosen anchors.
// ---------------------------------------------------------------------------
const SCENES = [
  {
    key: 'countryside',
    make() {
      return [
        { id: 'sun',    obj: makeSun(randI(760, 900), randI(110, 170)) },
        { id: 'cloudL', obj: makeCloud(randI(220, 320), randI(120, 180)) },
        { id: 'cloudR', obj: makeCloud(randI(500, 620), randI(140, 200)) },
        { id: 'bird',   obj: makeBird(randI(360, 460), randI(200, 260)) },
        { id: 'tree',   obj: makeTree(randI(130, 200), randI(470, 520)) },
        { id: 'house',  obj: makeHouse(randI(500, 620), randI(410, 450)) },
        { id: 'flower', obj: makeFlower(randI(780, 880), randI(500, 540)) },
      ]
    },
  },
  {
    key: 'sky',
    make() {
      return [
        { id: 'sun',     obj: makeSun(randI(760, 880), randI(110, 180)) },
        { id: 'cloud1',  obj: makeCloud(randI(180, 260), randI(140, 200)) },
        { id: 'cloud2',  obj: makeCloud(randI(400, 500), randI(200, 260)) },
        { id: 'cloud3',  obj: makeCloud(randI(600, 700), randI(120, 180)) },
        { id: 'bird1',   obj: makeBird(randI(300, 380), randI(300, 360)) },
        { id: 'bird2',   obj: makeBird(randI(520, 620), randI(340, 400)) },
        { id: 'balloon', obj: makeBalloon(randI(440, 560), randI(430, 490), 0.9) },
      ]
    },
  },
  {
    key: 'garden',
    make() {
      return [
        { id: 'sun',    obj: makeSun(randI(780, 890), randI(120, 180)) },
        { id: 'cloud',  obj: makeCloud(randI(200, 320), randI(140, 200)) },
        { id: 'tree1',  obj: makeTree(randI(120, 200), randI(460, 510)) },
        { id: 'tree2',  obj: makeTree(randI(830, 900), randI(460, 510)) },
        { id: 'flower1', obj: makeFlower(randI(280, 340), randI(510, 550)) },
        { id: 'flower2', obj: makeFlower(randI(440, 500), randI(510, 550)) },
        { id: 'flower3', obj: makeFlower(randI(600, 660), randI(510, 550)) },
        { id: 'star',    obj: makeStar(randI(400, 600), randI(230, 280)) },
      ]
    },
  },
  {
    key: 'party',
    make() {
      return [
        { id: 'sun',      obj: makeSun(randI(120, 200), randI(120, 180)) },
        { id: 'balloon1', obj: makeBalloon(randI(230, 280), randI(300, 350), 0.6) },
        { id: 'balloon2', obj: makeBalloon(randI(420, 480), randI(260, 310), 0.7) },
        { id: 'balloon3', obj: makeBalloon(randI(620, 680), randI(300, 350), 0.6) },
        { id: 'star1',    obj: makeStar(randI(340, 400), randI(180, 230)) },
        { id: 'star2',    obj: makeStar(randI(560, 620), randI(180, 230)) },
        { id: 'flower',   obj: makeFlower(randI(780, 860), randI(500, 540)) },
        { id: 'tree',     obj: makeTree(randI(130, 190), randI(470, 510)) },
      ]
    },
  },
]

// ---------------------------------------------------------------------------
// Diff planning
// ---------------------------------------------------------------------------

// Collect all mutable parts across all instances, tagged by tier.
// Only parts with >=2 variants can produce a visible diff.
function collectParts(instances) {
  const parts = []
  for (const inst of instances) {
    for (const [pid, def] of Object.entries(inst.obj.parts)) {
      if (!def.variants || def.variants.length < 2) continue
      parts.push({
        instId: inst.id,
        pid,
        tier: def.tier,
        hotspot: def.hotspot,
        variants: def.variants,
      })
    }
  }
  return parts
}

// Filter parts by tier. Lower tiers "include" the current tier plus easier ones,
// so a subtle round can still contain a medium/obvious diff — but preference is
// weighted toward the requested tier.
function eligibleForTier(parts, tier) {
  const byTier = { obvious: [], medium: [], subtle: [] }
  for (const p of parts) byTier[p.tier].push(p)
  // Weight: preferred tier first, then adjacent.
  if (tier === 'obvious') return [...byTier.obvious]
  if (tier === 'medium')  return [...byTier.medium, ...byTier.obvious]
  return [...byTier.subtle, ...byTier.medium, ...byTier.obvious]
}

// Ensure chosen diff hotspots don't overlap (so the player can distinguish them).
function nonOverlapping(chosen, cand, minGap = 30) {
  for (const c of chosen) {
    // Same instance: only one diff per instance is allowed anyway.
    if (c.instId === cand.instId) return false
    const dx = c.hotspot.x - cand.hotspot.x
    const dy = c.hotspot.y - cand.hotspot.y
    const minDist = c.hotspot.r + cand.hotspot.r - minGap
    if (Math.hypot(dx, dy) < Math.max(minDist, 40)) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Scene rendering
// ---------------------------------------------------------------------------
function baselineSpec(instances) {
  const specs = {}
  for (const inst of instances) {
    const s = {}
    for (const [pid, def] of Object.entries(inst.obj.parts)) {
      // For existence-type parts, always default to visible so the object
      // renders; mutation may still flip it off (that becomes the diff).
      if (def.variants.length === 2 && def.variants[0] === 'on' && def.variants[1] === 'off') {
        s[pid] = 'on'
      } else {
        s[pid] = pick(def.variants)
      }
    }
    specs[inst.id] = s
  }
  return specs
}

function renderScene(instances, specs, palette) {
  const bg = `<rect width="${W}" height="${H}" fill="${palette.sky}"/>`
  const ground = `<rect x="0" y="560" width="${W}" height="208" fill="${palette.ground}"/><rect x="0" y="560" width="${W}" height="8" fill="rgba(0,0,0,0.15)"/>`
  const body = instances.map(inst => inst.obj.render(specs[inst.id])).join('')
  return svgWrap(bg + ground + body)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
let _sessionSeq = 0

export async function generatePuzzle(level) {
  const cfg = LEVEL_CONFIG[level]
  const n = levelDiffCount(level)

  const scene = pick(SCENES)
  const instances = scene.make()
  const palette = { sky: pick(SKY), ground: pick(GROUND) }

  const leftSpec  = baselineSpec(instances)
  const rightSpec = {}
  for (const id in leftSpec) rightSpec[id] = { ...leftSpec[id] }

  // Pick N mutation targets that (a) match the tier preference, (b) are on
  // distinct instances, (c) have non-overlapping hotspots.
  const pool = shuffle(eligibleForTier(collectParts(instances), cfg.tier))
  const chosen = []
  for (const cand of pool) {
    if (chosen.length >= n) break
    if (!nonOverlapping(chosen, cand)) continue
    chosen.push(cand)
  }

  // Rare fallback: if we somehow can't find N distinct spots, relax the tier
  // filter and try any part.
  if (chosen.length < n) {
    const wider = shuffle(collectParts(instances))
    for (const cand of wider) {
      if (chosen.length >= n) break
      if (chosen.find(c => c.instId === cand.instId && c.pid === cand.pid)) continue
      if (!nonOverlapping(chosen, cand)) continue
      chosen.push(cand)
    }
  }
  if (chosen.length < n) {
    // Regenerate with a different scene rather than serve fewer diffs than requested.
    return generatePuzzle(level)
  }

  const diffs = []
  chosen.forEach((c, i) => {
    const cur = leftSpec[c.instId][c.pid]
    // Obvious tier: maximise perceptual distance so the diff is unmistakable.
    // Medium/subtle: any different variant is fine.
    const nxt = c.tier === 'obvious' ? pickFar(c.variants, cur) : pickDiff(c.variants, cur)
    rightSpec[c.instId][c.pid] = nxt
    diffs.push({ id: `d${i+1}`, x: c.hotspot.x, y: c.hotspot.y, r: c.hotspot.r })
  })

  const leftSvg  = renderScene(instances, leftSpec,  palette)
  const rightSvg = renderScene(instances, rightSpec, palette)

  return {
    id: `gen-${++_sessionSeq}`,
    leftUrl:  toDataUrl(leftSvg),
    rightUrl: toDataUrl(rightSvg),
    width: W,
    height: H,
    diffs,
    total: diffs.length,
    timeLimit: cfg.time,
    coef: cfg.coef,
  }
}
