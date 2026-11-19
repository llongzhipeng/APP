// Available images for the game
const IMAGES = [
  require('./public/image/elements/1.jpg'),
  require('./public/image/elements/2.jpg'),
  require('./public/image/elements/3.jpg'),
  require('./public/image/elements/4.jpg'),
  require('./public/image/elements/5.jpg'),
]

// SVG shape definitions (path in 100×100 viewBox)
const SHAPES = [
  { name: 'circle',        path: 'M50,10 A40,40 0 1,1 49.99,10 Z' },
  { name: 'triangle',      path: 'M50,8 L92,88 L8,88 Z' },
  { name: 'square',        path: 'M15,15 L85,15 L85,85 L15,85 Z' },
  { name: 'rectangle',     path: 'M10,28 L90,28 L90,72 L10,72 Z' },
  { name: 'diamond',       path: 'M50,8 L92,50 L50,92 L8,50 Z' },
  { name: 'parallelogram', path: 'M25,75 L90,75 L75,25 L10,25 Z' },
  { name: 'trapezoid',     path: 'M20,75 L80,75 L65,25 L35,25 Z' },
]

const SHAPE_COLORS = ['#FF7043','#5C6BC0','#43A047','#FFA726','#E91E63','#00ACC1','#8D6E63']

// Time limit per question in seconds, by difficulty level
export const TIME_LIMITS = [10, 10, 8, 8, 5, 5]

// Difficulty coefficients for scoring
export const DIFF_COEFFICIENTS = [1, 1.5, 2, 2.5, 3, 3.5]

const BASE_SCORE = 5

// Size difference ranges by difficulty (percentage of reference size)
const SIZE_DIFF_RANGES = {
  1: { min: 38, max: 55 },
  2: { min: 38, max: 55 },
  3: { min: 22, max: 34 },
  4: { min: 22, max: 34 },
  5: { min: 8,  max: 16 },
  6: { min: 8,  max: 16 },
}

function buildOptions(difficulty) {
  const refPct = 75
  const diffRange = SIZE_DIFF_RANGES[difficulty]
  const correctIndex = Math.floor(Math.random() * 4)
  const options = []

  for (let i = 0; i < 4; i++) {
    if (i === correctIndex) {
      options.push({ sizePct: refPct, rotation: 0 })
    } else {
      const diffPct = diffRange.min + Math.random() * (diffRange.max - diffRange.min)
      const larger = Math.random() < 0.5
      const sizePct = larger
        ? Math.min(refPct * (1 + diffPct / 100), 95)
        : Math.max(refPct * (1 - diffPct / 100), 20)
      options.push({ sizePct: Math.round(sizePct), rotation: 0 })
    }
  }
  return { options, correctIndex }
}

/**
 * Generate a question — randomly either an image or a shape.
 */
export function generateQuestion(difficulty) {
  // Even levels: rotate reference (random direction, ±15~45°); odd levels: no rotation
  let rotation = 0
  if (difficulty % 2 === 0) {
    const angle = 15 + Math.round(Math.random() * 30) // 15~45°
    rotation = Math.random() < 0.5 ? angle : -angle   // random clockwise/counter-clockwise
  }
  const { options, correctIndex } = buildOptions(difficulty)

  if (Math.random() < 0.5) {
    // Image question
    return {
      type: 'image',
      imageUrl: IMAGES[Math.floor(Math.random() * IMAGES.length)],
      refRotation: rotation,
      options,
      correctIndex,
      timeLimit: TIME_LIMITS[difficulty - 1],
    }
  } else {
    // Shape question
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)]
    return {
      type: 'shape',
      shapePath: shape.path,
      shapeColor: color,
      refRotation: rotation,
      options,
      correctIndex,
      timeLimit: TIME_LIMITS[difficulty - 1],
    }
  }
}

/**
 * Calculate score for a correct answer at the given difficulty.
 */
export function calculateScore(difficulty) {
  return BASE_SCORE * DIFF_COEFFICIENTS[difficulty - 1]
}

/**
 * Format seconds as M:SS string.
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) {
    return `${m}:${String(s).padStart(2, '0')}`
  }
  return String(s)
}

/**
 * Load game history from localStorage.
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem('game12_history')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/**
 * Save a game result to localStorage history.
 */
export function saveHistory(entry) {
  const history = loadHistory()
  history.unshift(entry)
  if (history.length > 100) history.splice(100)
  localStorage.setItem('game12_history', JSON.stringify(history))
}

/**
 * Clear all history from localStorage.
 */
export function clearHistory() {
  localStorage.removeItem('game12_history')
}
