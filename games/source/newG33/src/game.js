// Core game logic: rectangular room, entities placed on a 5×5 grid.
// Direction judged with 8-sector clockwise polar zones around the asker (0°=front).

export const DIFFICULTY = [
  { level: 1, refSelfOnly: true,  chars: 0, items: 1, coeff: 1.0 },
  { level: 2, refSelfOnly: false, chars: 1, items: 1, coeff: 1.5 },
  { level: 3, refSelfOnly: false, chars: 2, items: 1, coeff: 2.0 },
  { level: 4, refSelfOnly: false, chars: 2, items: 2, coeff: 2.5 },
  { level: 5, refSelfOnly: false, chars: 3, items: 2, coeff: 3.0 },
  { level: 6, refSelfOnly: false, chars: 3, items: 3, coeff: 3.5 },
]

export const MAX_LEVEL = 6
export const MIN_LEVEL = 1

// 8 directions clockwise from forward.
export const DIRS = ['front', 'frontRight', 'right', 'backRight', 'back', 'backLeft', 'left', 'frontLeft']
export const DIR_LABEL = {
  front: 'dirFront', frontRight: 'dirFrontRight', right: 'dirRight', backRight: 'dirBackRight',
  back: 'dirBack', backLeft: 'dirBackLeft', left: 'dirLeft', frontLeft: 'dirFrontLeft',
}

// Available items (matches i18n keys and Scene item art).
export const ITEMS = [
  { key: 'itemApple', kind: 'apple' },
  { key: 'itemCup',   kind: 'cup'   },
  { key: 'itemBook',  kind: 'book'  },
  { key: 'itemPhone', kind: 'phone' },
  { key: 'itemKey',   kind: 'key'   },
  { key: 'itemPen',   kind: 'pen'   },
  { key: 'itemClock', kind: 'clock' },
  { key: 'itemPlant', kind: 'plant' },
]

// Characters (each has a distinct shirt color for identification).
export const CHARACTERS = [
  { key: 'charA', shirt: '#3b82f6', shirt2: '#1e3a8a', hair: '#111827' },
  { key: 'charB', shirt: '#ec4899', shirt2: '#831843', hair: '#7c2d12' },
  { key: 'charC', shirt: '#10b981', shirt2: '#064e3b', hair: '#1f2937' },
]

// Room grid: entities occupy discrete cells for clean 45° geometry.
// We use a 5×5 grid whose center cell (2,2) is reserved for "self".
// Cells range from (0,0) top-left to (4,4) bottom-right.
export const GRID = 5

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickN(arr, n) { return shuffle(arr).slice(0, n) }
function randInt(n) { return Math.floor(Math.random() * n) }

// All cells except the center (self) cell.
function allCells() {
  const cells = []
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (!(r === 2 && c === 2)) cells.push({ r, c })
    }
  }
  return cells
}

// World coordinates: grid col=x, row=y (y+ downward on screen, but that's fine).
function cellVec(cell) { return { x: cell.c - 2, y: cell.r - 2 } }

// Convert facing (0..7) to a unit vector. facing 0 = up (-y), then clockwise.
export function facingVec(f) {
  const ang = f * Math.PI / 4
  return { x: Math.sin(ang), y: -Math.cos(ang) }
}

// Local direction from asker's frame given world dx,dy and facing (0..7 sector index).
function worldToLocalDir(dx, dy, facing) {
  const fwd = facingVec(facing)
  // 90° clockwise on screen (y-down) = (-fwd.y, fwd.x)
  const right = { x: -fwd.y, y: fwd.x }
  const f = dx * fwd.x + dy * fwd.y
  const r = dx * right.x + dy * right.y
  let ang = Math.atan2(r, f)              // -PI..PI, +CW from forward
  if (ang < 0) ang += Math.PI * 2
  return Math.round(ang / (Math.PI / 4)) % 8
}

function sampleOptions(correctIdx) {
  const others = [0,1,2,3,4,5,6,7].filter(i => i !== correctIdx)
  return shuffle([correctIdx, ...pickN(others, 3)]).map(i => DIRS[i])
}

/**
 * Generate a question.
 *
 * Layout: 5×5 room grid. Self sits at center cell (2,2) with random facing 0..7.
 * Other characters occupy other cells with random facings.
 * Items occupy remaining cells.
 * Direction is answered from the asker's local frame (self or a specified character).
 * The asker's cell becomes the polar origin; item position vector = item - asker.
 */
export function generateQuestion(level) {
  const cfg = DIFFICULTY[level - 1]

  const selfFacing = randInt(8)

  // Reserve distinct cells for chars + items (self is always at center).
  const pool = allCells()
  const need = cfg.chars + cfg.items
  const cells = pickN(pool, need)
  const charCells = cells.slice(0, cfg.chars)
  const itemCells = cells.slice(cfg.chars)

  const chosenChars = pickN(CHARACTERS, cfg.chars).map((c, i) => ({
    ...c, cell: charCells[i], facing: randInt(8),
  }))
  const chosenItems = pickN(ITEMS, cfg.items).map((it, i) => ({
    ...it, cell: itemCells[i],
  }))

  // Choose asker.
  let askerType, askCell, askFacing, askCharKey
  if (cfg.refSelfOnly || cfg.chars === 0) {
    askerType = 'self'; askCell = { r: 2, c: 2 }; askFacing = selfFacing; askCharKey = 'whoSelf'
  } else {
    const pool = [{ type: 'self' }, ...chosenChars.map(c => ({ type: 'char', c }))]
    const chosen = pick(pool)
    if (chosen.type === 'self') {
      askerType = 'self'; askCell = { r: 2, c: 2 }; askFacing = selfFacing; askCharKey = 'whoSelf'
    } else {
      askerType = 'char'; askCell = chosen.c.cell; askFacing = chosen.c.facing; askCharKey = chosen.c.key
    }
  }

  const askItem = pick(chosenItems)

  const av = cellVec(askCell)
  const iv = cellVec(askItem.cell)
  const dx = iv.x - av.x
  const dy = iv.y - av.y
  const correctIdx = worldToLocalDir(dx, dy, askFacing)
  const correctDir = DIRS[correctIdx]

  return {
    level, coeff: cfg.coeff,
    selfFacing,
    chars: chosenChars,
    items: chosenItems,
    askerType,
    askCell,
    askFacing,
    askCharKey,
    askItem,
    correctDir,
    options: sampleOptions(correctIdx),
  }
}

// -------- Adaptive difficulty tracker (60s windows) --------
export class AdaptiveTracker {
  constructor(startLevel = 1) { this.level = startLevel; this.window = { correct: 0, total: 0 } }
  record(ok) { this.window.total += 1; if (ok) this.window.correct += 1 }
  tick() {
    const { correct, total } = this.window
    if (total > 0) {
      const rate = correct / total
      if (rate >= 0.9 && this.level < MAX_LEVEL) this.level += 1
      else if (rate <= 0.7 && this.level > MIN_LEVEL) this.level -= 1
    }
    this.window = { correct: 0, total: 0 }
    return this.level
  }
}

// -------- Local history --------
const HISTORY_KEY = 'newG33.history.v1'
export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch (_) { return [] }
}
export function saveHistoryRecord(rec) {
  const list = loadHistory()
  list.unshift(rec)
  if (list.length > 200) list.length = 200
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}
export function clearHistory() { localStorage.removeItem(HISTORY_KEY) }
export function formatDateTime(ts) {
  const d = new Date(ts)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
