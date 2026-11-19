// Difficulty configuration
// level -> { positionFixed, targetCount (fn or number), planetCount, coef }
export const DIFFICULTY = [
  null, // 1-indexed
  { level: 1, positionFixed: true,  targets: () => 1, planetCount: 4,  coef: 1 },
  { level: 2, positionFixed: true,  targets: () => 2, planetCount: 6,  coef: 1.5 },
  { level: 3, positionFixed: true,  targets: () => 3, planetCount: 8,  coef: 2 },
  { level: 4, positionFixed: false, targets: () => 4, planetCount: 10, coef: 2.5 },
  { level: 5, positionFixed: false, targets: () => (Math.random() < 0.5 ? 4 : 5), planetCount: 12, coef: 3 },
  { level: 6, positionFixed: false, targets: () => (Math.random() < 0.5 ? 5 : 6), planetCount: 14, coef: 3.5 },
]

export const MAX_LEVEL = 6
export const MIN_LEVEL = 1
export const QUESTION_TIME = 15 // seconds
export const ADJUST_INTERVAL = 60 // seconds

// Beautiful palette of planet color themes (each with 2-3 gradient stops)
export const PLANET_THEMES = [
  { name: 'ember',    a: '#ff6b6b', b: '#c92a2a', ring: '#ffb4a2', glow: '#ff6b6b' },
  { name: 'ocean',    a: '#4dabf7', b: '#1864ab', ring: '#a5d8ff', glow: '#4dabf7' },
  { name: 'gaia',     a: '#51cf66', b: '#2b8a3e', ring: '#b2f2bb', glow: '#51cf66' },
  { name: 'aurora',   a: '#cc5de8', b: '#6741d9', ring: '#e599f7', glow: '#cc5de8' },
  { name: 'solar',    a: '#ffd43b', b: '#e67700', ring: '#ffec99', glow: '#ffd43b' },
  { name: 'ice',      a: '#66d9e8', b: '#0c8599', ring: '#c5f6fa', glow: '#66d9e8' },
  { name: 'rose',     a: '#ff8fa3', b: '#c9184a', ring: '#ffccd5', glow: '#ff8fa3' },
  { name: 'nebula',   a: '#845ef7', b: '#3b2f7a', ring: '#b197fc', glow: '#845ef7' },
  { name: 'sand',     a: '#f4a261', b: '#b25516', ring: '#ffd8a8', glow: '#f4a261' },
  { name: 'lime',     a: '#c0eb75', b: '#5c940d', ring: '#e9fac8', glow: '#c0eb75' },
  { name: 'mint',     a: '#38d9a9', b: '#0b7a5f', ring: '#96f2d7', glow: '#38d9a9' },
  { name: 'grape',    a: '#e64980', b: '#862e9c', ring: '#faa2c1', glow: '#e64980' },
  { name: 'sky',      a: '#74c0fc', b: '#1c7ed6', ring: '#a5d8ff', glow: '#74c0fc' },
  { name: 'copper',   a: '#e8590c', b: '#7a2e02', ring: '#ffbc84', glow: '#e8590c' },
]

// Shuffle helper (Fisher-Yates)
export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick(arr, n) { return shuffle(arr).slice(0, n) }

// Generate planet positions inside a normalized playfield [0..1]x[0..1]
// opts.marginX / marginY / marginBottom are normalized paddings (0..1),
// used to keep planets (with ring/aura + name label) fully inside the field.
export function generatePositions(count, opts = {}) {
  const marginX = opts.marginX != null ? opts.marginX : 0.08
  const marginY = opts.marginY != null ? opts.marginY : 0.08
  const marginBottom = opts.marginBottom != null ? opts.marginBottom : marginY
  const aspect = opts.aspect != null ? opts.aspect : 16 / 9
  const minDist = opts.minDist != null ? opts.minDist : 0.18
  const strict = opts.strict != null ? opts.strict : false
  const positions = []
  const maxAttempts = 8000
  let attempts = 0
  const usableY = 1 - marginY - marginBottom
  while (positions.length < count && attempts < maxAttempts) {
    attempts++
    const x = marginX + Math.random() * (1 - 2 * marginX)
    const y = marginY + Math.random() * usableY
    let ok = true
    for (const p of positions) {
      const dx = (p.x - x) * aspect
      const dy = p.y - y
      if (Math.sqrt(dx * dx + dy * dy) < minDist) { ok = false; break }
    }
    if (ok) positions.push({ x, y })
  }
  // Grid fallback if crowding prevented placing all planets
  if (positions.length < count) {
    if (strict) return null
    const cols = Math.ceil(Math.sqrt(count * aspect))
    const rows = Math.ceil(count / cols)
    positions.length = 0
    for (let i = 0; i < count; i++) {
      const c = i % cols
      const r = Math.floor(i / cols)
      const x = marginX + (c + 0.5) / cols * (1 - 2 * marginX)
      const y = marginY + (r + 0.5) / rows * usableY
      positions.push({ x, y })
    }
  }
  return positions
}

// Format ms -> "1.23s" or "534ms"
export function formatRT(ms) {
  if (ms >= 1000) return (ms / 1000).toFixed(2) + 's'
  return Math.round(ms) + 'ms'
}
