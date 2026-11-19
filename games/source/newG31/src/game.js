// Game logic: difficulty levels, scoring, sequence generation, and history persistence.

import { NOTE_NAMES } from './audio.js'

// Difficulty configuration per spec
export const LEVELS = [
  // idx 0 unused for readability
  null,
  { level: 1, bottles: 2, noteKinds: 2, sequenceLen: 3, factor: 1.0, timeLimit: 15 },
  { level: 2, bottles: 3, noteKinds: 2, sequenceLen: 3, factor: 1.5, timeLimit: 15 },
  { level: 3, bottles: 3, noteKinds: 3, sequenceLen: 4, factor: 2.0, timeLimit: 15 },
  { level: 4, bottles: 4, noteKinds: 3, sequenceLen: 4, factor: 2.5, timeLimit: 30 },
  { level: 5, bottles: 4, noteKinds: 4, sequenceLen: 5, factor: 3.0, timeLimit: 30 },
  { level: 6, bottles: 5, noteKinds: 4, sequenceLen: 5, factor: 3.5, timeLimit: 30 }
]

export function baseScoreFor(level) {
  return 5 * LEVELS[level].factor
}

// Fisher–Yates shuffle
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Canonical water level per note. A struck bottle (spoon on the side) vibrates the
// glass + water column: MORE water → LOWER pitch, LESS water → HIGHER pitch.
// So Do (lowest) is the fullest bottle and Si (highest) is the emptiest.
// Values distributed across [0.15, 0.9] so the difference between adjacent notes is
// visible without any bottle looking empty or overflowing.
export const NOTE_WATER = {
  Do:  0.90,
  Re:  0.78,
  Mi:  0.66,
  Fa:  0.54,
  Sol: 0.42,
  La:  0.30,
  Si:  0.18
}

// Build the bottle set for a level: randomly pick N distinct notes from the C-major
// scale, then sort them in scale order so bottles read left→right as ascending pitch.
// Water level is bound to the NOTE (not the slot), so each pitch always looks the same
// amount full — teaching the correct "more water = lower pitch" physical relationship.
export function buildBottles(level) {
  const cfg = LEVELS[level]
  const scaleIdx = NOTE_NAMES.map((_, i) => i)
  const picked = shuffle(scaleIdx).slice(0, cfg.bottles).sort((a, b) => a - b)
  return picked.map((noteIdx, i) => {
    const note = NOTE_NAMES[noteIdx]
    return {
      id: i,
      note,
      waterLevel: NOTE_WATER[note]
    }
  })
}

// Build a random melody: choose `noteKinds` distinct bottles as the pool, then draw
// a sequence of `sequenceLen` notes from that pool. Avoid three same notes in a row.
export function buildSequence(level, bottles) {
  const cfg = LEVELS[level]
  const kinds = Math.min(cfg.noteKinds, bottles.length)
  const pool = shuffle(bottles).slice(0, kinds)
  const seq = []
  for (let i = 0; i < cfg.sequenceLen; i++) {
    let pick, guard = 0
    do {
      pick = pool[Math.floor(Math.random() * pool.length)]
      guard++
    } while (
      guard < 12 &&
      seq.length >= 2 &&
      seq[seq.length - 1].id === pick.id &&
      seq[seq.length - 2].id === pick.id
    )
    seq.push(pick)
  }
  // Guarantee we actually exercise every note in the pool at least once when possible
  // (otherwise a "3-kinds" round could accidentally use only 2 notes).
  if (kinds >= 2 && cfg.sequenceLen >= kinds) {
    const used = new Set(seq.map(n => n.id))
    pool.forEach(p => {
      if (!used.has(p.id)) {
        const slot = Math.floor(Math.random() * seq.length)
        seq[slot] = p
      }
    })
  }
  return seq
}

// ---- History ----
const HISTORY_KEY = 'melody_copier_history_v1'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch (e) {
    return []
  }
}

export function saveHistoryEntry(entry) {
  const all = loadHistory()
  all.unshift(entry)
  // Keep last 50
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all.slice(0, 50)))
}

export function formatDate(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
