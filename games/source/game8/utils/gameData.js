// Fixed reference card deck (cards are always the same, in fixed order)
export const CARD_DECK = [
  { id: 0, quantity: 1, color: 'red',    shape: 'circle'   },
  { id: 1, quantity: 2, color: 'blue',   shape: 'triangle' },
  { id: 2, quantity: 3, color: 'yellow', shape: 'square'   },
  { id: 3, quantity: 4, color: 'green',  shape: 'star'     },
  { id: 4, quantity: 5, color: 'purple', shape: 'diamond'  },
]

export const COLOR_VALUES = {
  red:    '#E53935',
  blue:   '#1E88E5',
  yellow: '#F9A825',
  green:  '#43A047',
  purple: '#8E24AA',
}

// Difficulty configuration (levels 1–6)
export const DIFFICULTIES = [
  { level: 1, rule: 'color',    cardCount: 4, timeLimit: 10, coefficient: 1   },
  { level: 2, rule: 'quantity', cardCount: 4, timeLimit: 8,  coefficient: 1.5 },
  { level: 3, rule: 'shape',    cardCount: 4, timeLimit: 6,  coefficient: 2   },
  { level: 4, rule: 'color',    cardCount: 5, timeLimit: 10, coefficient: 2.5 },
  { level: 5, rule: 'quantity', cardCount: 5, timeLimit: 8,  coefficient: 3   },
  { level: 6, rule: 'shape',    cardCount: 5, timeLimit: 6,  coefficient: 3.5 },
]

export function getDifficulty(level) {
  return DIFFICULTIES[level - 1]
}

/**
 * Generate a target card for the given correct card and rule.
 * The target card's rule-attribute matches the correct card.
 * The other two attributes come from other cards (to create ambiguity).
 */
export function generateTargetCard(correctCard, rule, cardCount) {
  const deck = CARD_DECK.slice(0, cardCount)
  const others = deck.filter(c => c.id !== correctCard.id)

  const target = {}
  target[rule] = correctCard[rule]

  const otherAttrs = ['color', 'quantity', 'shape'].filter(a => a !== rule)
  otherAttrs.forEach(attr => {
    const src = others[Math.floor(Math.random() * others.length)]
    target[attr] = src[attr]
  })

  return target
}

/** Pick a random card index from the active deck */
export function pickCorrectCard(cardCount) {
  const deck = CARD_DECK.slice(0, cardCount)
  return deck[Math.floor(Math.random() * deck.length)]
}

/** Calculate points earned for a correct answer at the given level */
export function calcPoints(level) {
  return 5 * getDifficulty(level).coefficient
}

/** Format milliseconds to "X.Xs" */
export function formatMs(ms) {
  return (ms / 1000).toFixed(1)
}

/** Format seconds to "M:SS" */
export function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}
