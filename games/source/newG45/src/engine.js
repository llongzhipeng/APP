// Fold & punch simulation engine for 折痕侦探 (Crease Detective)
// Coordinate system: original unfolded paper occupies [0,1] x [0,1]
// Each "layer" is an affine matrix [a,b,c,d,e,f] mapping folded coords (u,v) -> original (x,y):
//   x = a*u + c*v + e
//   y = b*u + d*v + f
// The folded paper occupies a visible rectangle in folded coords.
// After a fold, the visible rect shrinks and each existing layer is duplicated: one unchanged,
// one pre-composed with a reflection across the fold line.

export const DIFFICULTY_CONFIG = {
  1: { folds: 1, holes: 1, allowDiagonal: false, coef: 1.0 },
  2: { folds: 2, holes: 1, allowDiagonal: false, coef: 1.5 },
  3: { folds: 1, holes: 2, allowDiagonal: true,  coef: 2.0 },
  4: { folds: 2, holes: 2, allowDiagonal: true,  coef: 2.5 },
  5: { folds: 3, holes: 1, allowDiagonal: true,  coef: 3.0 },
  6: { folds: 3, holes: 2, allowDiagonal: true,  coef: 3.5 }
}

export const MAX_DIFFICULTY = 6
export const MIN_DIFFICULTY = 1

const identity = () => [1, 0, 0, 1, 0, 0]

const applyMat = (m, u, v) => [
  m[0] * u + m[2] * v + m[4],
  m[1] * u + m[3] * v + m[5]
]

// Precompose m with reflection across vertical line u = k (in folded coords):
// new(u,v) = m(2k - u, v)
const preReflectV = (m, k) => [
  -m[0], -m[1],
   m[2],  m[3],
  2 * k * m[0] + m[4],
  2 * k * m[1] + m[5]
]

// Precompose m with reflection across horizontal line v = k:
// new(u,v) = m(u, 2k - v)
const preReflectH = (m, k) => [
   m[0],  m[1],
  -m[2], -m[3],
  2 * k * m[2] + m[4],
  2 * k * m[3] + m[5]
]

// Precompose m with reflection across line v = u (diagonal /):
// new(u,v) = m(v, u)
const preReflectDiag1 = (m) => [
  m[2], m[3], m[0], m[1], m[4], m[5]
]

// Precompose m with reflection across line v = -u + s (anti-diagonal \):
// new(u,v) = m(s - v, s - u)
const preReflectDiag2 = (m, s) => {
  // m(s - v, s - u) = m[0]*(s-v) + m[2]*(s-u) + m[4], m[1]*(s-v) + m[3]*(s-u) + m[5]
  // = -m[2]*u - m[0]*v + (m[0]*s + m[2]*s + m[4]), -m[3]*u - m[1]*v + (m[1]*s + m[3]*s + m[5])
  return [
    -m[2], -m[3],
    -m[0], -m[1],
    (m[0] + m[2]) * s + m[4],
    (m[1] + m[3]) * s + m[5]
  ]
}

// A fold operation on a PaperState.
// FoldTypes:
//   'V_LR' : fold left half over right (visible right)
//   'V_RL' : fold right half over left (visible left)
//   'H_TB' : fold top half over bottom (visible bottom)
//   'H_BT' : fold bottom half over top (visible top)
//   'D_TL' : diagonal fold, keep top-left triangle visible (fold bottom-right onto top-left along / diagonal)
//   'D_BR' : diagonal fold, keep bottom-right triangle visible
//   'D_TR' : diagonal fold, keep top-right triangle visible (along \ diagonal)
//   'D_BL' : diagonal fold, keep bottom-left triangle visible
// Diagonal folds require the current visible region to be square (equal side lengths).

export function createPaper() {
  return {
    // visible region in folded coordinates
    rect: { x0: 0, y0: 0, x1: 1, y1: 1 },
    // for diagonal folds, we may have triangular shape. Represented as polygon in folded coords
    shape: [ [0,0], [1,0], [1,1], [0,1] ], // polygon vertices CCW in folded coords
    layers: [ identity() ],
    folds: [] // list of applied folds (for animation replay)
  }
}

function width(p)  { return p.rect.x1 - p.rect.x0 }
function height(p) { return p.rect.y1 - p.rect.y0 }
function isSquare(p) {
  return Math.abs(width(p) - height(p)) < 1e-9 && p.shape.length === 4
}

// Compute new shape after cropping polygon to a half-plane.
// half-plane defined by function keep(x,y) returning true if point kept.
// Uses Sutherland-Hodgman.
function clipPolygon(poly, keep, intersect) {
  const out = []
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const cur = poly[i]
    const prev = poly[(i - 1 + n) % n]
    const curIn = keep(cur[0], cur[1])
    const prevIn = keep(prev[0], prev[1])
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur))
      out.push(cur)
    } else if (prevIn) {
      out.push(intersect(prev, cur))
    }
  }
  return out
}

export function applyFold(paper, foldType) {
  const p = paper
  const { x0, y0, x1, y1 } = p.rect
  const midX = (x0 + x1) / 2
  const midY = (y0 + y1) / 2
  const newPaper = {
    rect: { ...p.rect },
    shape: p.shape.map(pt => [pt[0], pt[1]]),
    layers: p.layers.slice(),
    folds: p.folds.concat([foldType])
  }
  const dupLayers = (reflectFn) => {
    const reflected = p.layers.map(reflectFn)
    // Visible layers = original layers (that stay) + reflected (the folded-over side)
    newPaper.layers = p.layers.concat(reflected)
  }
  switch (foldType) {
    case 'V_RL': { // fold right half onto left, visible left [x0, midX]
      dupLayers(m => preReflectV(m, midX))
      newPaper.rect = { x0, y0, x1: midX, y1 }
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => x <= midX + 1e-9,
        (a, b) => {
          const t = (midX - a[0]) / (b[0] - a[0])
          return [midX, a[1] + t * (b[1] - a[1])]
        })
      break
    }
    case 'V_LR': { // fold left half onto right, visible right [midX, x1]
      dupLayers(m => preReflectV(m, midX))
      newPaper.rect = { x0: midX, y0, x1, y1 }
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => x >= midX - 1e-9,
        (a, b) => {
          const t = (midX - a[0]) / (b[0] - a[0])
          return [midX, a[1] + t * (b[1] - a[1])]
        })
      break
    }
    case 'H_TB': { // fold top onto bottom, visible bottom [y0, midY]
      dupLayers(m => preReflectH(m, midY))
      newPaper.rect = { x0, y0, x1, y1: midY }
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => y <= midY + 1e-9,
        (a, b) => {
          const t = (midY - a[1]) / (b[1] - a[1])
          return [a[0] + t * (b[0] - a[0]), midY]
        })
      break
    }
    case 'H_BT': { // fold bottom onto top, visible top [midY, y1]
      dupLayers(m => preReflectH(m, midY))
      newPaper.rect = { x0, y0: midY, x1, y1 }
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => y >= midY - 1e-9,
        (a, b) => {
          const t = (midY - a[1]) / (b[1] - a[1])
          return [a[0] + t * (b[0] - a[0]), midY]
        })
      break
    }
    // Diagonal folds — only valid if visible square [x0,y0,x1,y1] and shape currently square.
    // Line "/" through (x0,y0)-(x1,y1) requires that; use v = u shifted: line is (y - y0) = (x - x0)
    case 'D_BR': { // keep lower-right triangle (below line "/" y = x - (x0 - y0))
      // Line: y - y0 = x - x0  => y = x + (y0 - x0)
      // Reflect across this line: (u,v) -> (v + (x0 - y0), u + (y0 - x0)) with x0=y0 assumption in canonical.
      // Since visible is square with corner (x0,y0)-(x1,y1) and side s = x1-x0 = y1-y0:
      // define shifted coords: u' = u - x0, v' = v - y0. Reflect across v' = u' means (u',v')->(v',u').
      // In world coords: (u,v) -> (x0 + (v - y0), y0 + (u - x0)) = (v + x0 - y0, u + y0 - x0)
      const dx = x0 - y0
      const dy = y0 - x0
      const reflectFn = (m) => {
        // new(u,v) = m(v + dx, u + dy)
        // = m[0]*(v+dx) + m[2]*(u+dy) + m[4], m[1]*(v+dx) + m[3]*(u+dy) + m[5]
        return [
          m[2], m[3], m[0], m[1],
          m[0] * dx + m[2] * dy + m[4],
          m[1] * dx + m[3] * dy + m[5]
        ]
      }
      dupLayers(reflectFn)
      // Kept half: y <= x + (y0 - x0), i.e., y - x <= y0 - x0
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => (y - x) <= (y0 - x0) + 1e-9,
        (a, b) => {
          // param t where (a[1] + t*(b[1]-a[1])) - (a[0] + t*(b[0]-a[0])) = y0 - x0
          const denom = (b[1] - a[1]) - (b[0] - a[0])
          const t = ((y0 - x0) - (a[1] - a[0])) / denom
          return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
        })
      break
    }
    case 'D_TL': { // keep upper-left triangle (above line "/")
      const dx = x0 - y0
      const dy = y0 - x0
      const reflectFn = (m) => [
        m[2], m[3], m[0], m[1],
        m[0] * dx + m[2] * dy + m[4],
        m[1] * dx + m[3] * dy + m[5]
      ]
      dupLayers(reflectFn)
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => (y - x) >= (y0 - x0) - 1e-9,
        (a, b) => {
          const denom = (b[1] - a[1]) - (b[0] - a[0])
          const t = ((y0 - x0) - (a[1] - a[0])) / denom
          return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
        })
      break
    }
    case 'D_TR': { // fold along "\" diagonal (from top-left to bottom-right of square), keep top-right
      // Line: (y - y1) = -(x - x0) => y + x = x0 + y1 = s (where s = x0+y1)
      // Reflect (u,v) across v + u = s: (u,v) -> (s - v, s - u)
      const s = x0 + y1  // for square: x0 + y1 = x1 + y0
      const reflectFn = (m) => preReflectDiag2(m, s)
      dupLayers(reflectFn)
      // Kept: y + x >= s
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => (x + y) >= s - 1e-9,
        (a, b) => {
          const denom = (b[0] - a[0]) + (b[1] - a[1])
          const t = (s - a[0] - a[1]) / denom
          return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
        })
      break
    }
    case 'D_BL': {
      const s = x0 + y1
      const reflectFn = (m) => preReflectDiag2(m, s)
      dupLayers(reflectFn)
      newPaper.shape = clipPolygon(p.shape,
        (x, y) => (x + y) <= s + 1e-9,
        (a, b) => {
          const denom = (b[0] - a[0]) + (b[1] - a[1])
          const t = (s - a[0] - a[1]) / denom
          return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
        })
      break
    }
  }
  return newPaper
}

// Given a punch at (u, v) in folded coords, compute all resulting hole positions on original paper.
// Returns array of {x, y} in [0,1]²
export function punchToHoles(paper, u, v, radius = 0.05) {
  const seen = []
  for (const m of paper.layers) {
    const [x, y] = applyMat(m, u, v)
    // dedupe positions that overlap (within tolerance)
    if (!seen.some(s => Math.hypot(s.x - x, s.y - y) < radius * 0.8)) {
      seen.push({ x, y, r: radius })
    }
  }
  return seen
}

// Check if a point is inside polygon (ray casting)
export function pointInPolygon(pt, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1]
    const xj = poly[j][0], yj = poly[j][1]
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi + 1e-12) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

// Sample a random punch position inside current visible shape, with margin.
function sampleInsideShape(shape, margin = 0.08, rng = Math.random) {
  // bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of shape) {
    if (p[0] < minX) minX = p[0]
    if (p[1] < minY) minY = p[1]
    if (p[0] > maxX) maxX = p[0]
    if (p[1] > maxY) maxY = p[1]
  }
  for (let i = 0; i < 200; i++) {
    const x = minX + rng() * (maxX - minX)
    const y = minY + rng() * (maxY - minY)
    // Check margins from polygon edges
    if (!pointInPolygon([x, y], shape)) continue
    if (!pointInPolygon([x + margin, y], shape)) continue
    if (!pointInPolygon([x - margin, y], shape)) continue
    if (!pointInPolygon([x, y + margin], shape)) continue
    if (!pointInPolygon([x, y - margin], shape)) continue
    // Avoid super-close to fold lines by margin already handled via bbox contract
    return [x, y]
  }
  return [ (minX + maxX) / 2, (minY + maxY) / 2 ]
}

function pickRandom(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)]
}

// Generate a puzzle question for given difficulty.
// Returns:
//   {
//     difficulty,
//     foldSteps: [{ before: PaperState, foldType, after: PaperState }],
//     finalPaper: PaperState,
//     punches: [{u, v, r}] in final folded coords,
//     correctHoles: [{x,y,r}] in original coords,   <-- answer
//     options: [ [ {x,y,r} ], ... ]  // 4 option arrays; correctIndex marks correct
//     correctIndex,
//   }
export function generateQuestion(difficulty, rng = Math.random) {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  const foldSteps = []
  let paper = createPaper()

  for (let i = 0; i < cfg.folds; i++) {
    const candidates = []
    // flat folds always allowed
    candidates.push('V_RL', 'V_LR', 'H_TB', 'H_BT')
    // diagonal only when square
    if (cfg.allowDiagonal && isSquare(paper)) {
      candidates.push('D_BR', 'D_TL', 'D_TR', 'D_BL')
    }
    // Weight: give diagonals reasonable share
    const foldType = pickRandom(candidates, rng)
    const before = paper
    const after = applyFold(paper, foldType)
    foldSteps.push({ before, foldType, after })
    paper = after
  }

  const finalPaper = paper
  const punches = []
  for (let i = 0; i < cfg.holes; i++) {
    // Ensure holes are spaced apart in folded coords
    let attempts = 0
    while (attempts++ < 50) {
      const [u, v] = sampleInsideShape(finalPaper.shape, 0.11, rng)
      if (punches.every(p => Math.hypot(p.u - u, p.v - v) > 0.22)) {
        punches.push({ u, v, r: 0.045 })
        break
      }
      if (attempts === 50) punches.push({ u, v, r: 0.045 })
    }
  }

  // Compute correct holes
  const correctHoles = []
  for (const pu of punches) {
    for (const h of punchToHoles(finalPaper, pu.u, pu.v, pu.r)) {
      correctHoles.push(h)
    }
  }
  // dedupe
  const dedup = []
  for (const h of correctHoles) {
    if (!dedup.some(d => Math.hypot(d.x - h.x, d.y - h.y) < 0.03)) dedup.push(h)
  }

  // Generate distractors
  const options = [dedup]
  const distractorStrategies = [
    // remove one hole (if enough)
    (holes) => holes.length > 1 ? holes.slice(0, -1) : null,
    // mirror across x = 0.5
    (holes) => holes.map(h => ({ x: 1 - h.x, y: h.y, r: h.r })),
    // mirror across y = 0.5
    (holes) => holes.map(h => ({ x: h.x, y: 1 - h.y, r: h.r })),
    // rotate 180
    (holes) => holes.map(h => ({ x: 1 - h.x, y: 1 - h.y, r: h.r })),
    // shift one hole
    (holes) => holes.map((h, i) => i === 0 ? { x: Math.max(0.1, Math.min(0.9, h.x + 0.25)), y: h.y, r: h.r } : h),
    // duplicate: use holes from applying only first N-1 folds (fewer layers)
    (holes) => {
      if (foldSteps.length < 2) return null
      const partial = foldSteps[foldSteps.length - 2].after
      const list = []
      for (const pu of punches) {
        for (const h of punchToHoles(partial, pu.u, pu.v, pu.r)) list.push(h)
      }
      const dd = []
      for (const h of list) if (!dd.some(d => Math.hypot(d.x - h.x, d.y - h.y) < 0.03)) dd.push(h)
      return dd
    },
    // add a random extra hole
    (holes) => {
      const nh = holes.slice()
      nh.push({ x: 0.5 + (rng() - 0.5) * 0.6, y: 0.5 + (rng() - 0.5) * 0.6, r: (holes[0] && holes[0].r) || 0.045 })
      return nh
    }
  ]

  // Shuffle strategies
  const shuffled = distractorStrategies.slice().sort(() => rng() - 0.5)
  for (const strat of shuffled) {
    if (options.length >= 4) break
    const cand = strat(dedup)
    if (!cand || cand.length === 0) continue
    // Check not equal to any existing option
    if (options.some(o => holesEqual(o, cand))) continue
    options.push(cand)
  }
  // Pad if needed
  while (options.length < 4) {
    const nh = dedup.map(h => ({ x: 0.5 + (rng() - 0.5) * 0.7, y: 0.5 + (rng() - 0.5) * 0.7, r: h.r }))
    if (!options.some(o => holesEqual(o, nh))) options.push(nh)
    else options.push(nh)
  }

  // Shuffle options and track correct index
  const indices = [0, 1, 2, 3]
  indices.sort(() => rng() - 0.5)
  const shuffledOptions = indices.map(i => options[i])
  const correctIndex = indices.indexOf(0)

  return {
    difficulty,
    foldSteps,
    finalPaper,
    punches,
    correctHoles: dedup,
    options: shuffledOptions,
    correctIndex
  }
}

function holesEqual(a, b) {
  if (a.length !== b.length) return false
  const used = new Set()
  for (const ha of a) {
    let matched = -1
    for (let i = 0; i < b.length; i++) {
      if (used.has(i)) continue
      if (Math.hypot(ha.x - b[i].x, ha.y - b[i].y) < 0.04) { matched = i; break }
    }
    if (matched < 0) return false
    used.add(matched)
  }
  return true
}
