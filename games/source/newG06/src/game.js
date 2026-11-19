import { resolveImage } from './assets'
// Difficulty configuration per readme
export const DIFFICULTIES = [
  { level: 1, rows: 2, cols: 2, memorize: 5, coef: 1,   timeLimit: 15 },
  { level: 2, rows: 2, cols: 3, memorize: 7, coef: 1.5, timeLimit: 15 },
  { level: 3, rows: 2, cols: 3, memorize: 5, coef: 2,   timeLimit: 15 },
  { level: 4, rows: 2, cols: 4, memorize: 7, coef: 2.5, timeLimit: 30 },
  { level: 5, rows: 2, cols: 4, memorize: 5, coef: 3,   timeLimit: 30 },
  { level: 6, rows: 2, cols: 5, memorize: 7, coef: 3.5, timeLimit: 30 },
]

export function getDifficulty(level) {
  return DIFFICULTIES.find(d => d.level === level) || DIFFICULTIES[0]
}

export const CARD_BACK = resolveImage('/images/bac.jpg')
export const CARD_POOL = Array.from({ length: 14 }, (_, i) => resolveImage(`/images/${i + 1}.png`))

export function pickCardFaces(pairs) {
  const pool = [...CARD_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, pairs)
}

export function buildBoard(rows, cols) {
  const total = rows * cols
  const pairs = total / 2
  const faces = pickCardFaces(pairs)
  const cards = []
  faces.forEach((src, i) => {
    cards.push({ id: i * 2,     pairId: i, src, matched: false, flipped: false })
    cards.push({ id: i * 2 + 1, pairId: i, src, matched: false, flipped: false })
  })
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}
