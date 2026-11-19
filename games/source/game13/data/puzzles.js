// 8 image-based puzzles, each divided into a 4×3 grid (12 cells total)

const puzzleImages = {
  1: require('../public/image/elements/1.jpg'),
  2: require('../public/image/elements/2.jpg'),
  3: require('../public/image/elements/3.jpg'),
  4: require('../public/image/elements/4.jpg'),
  5: require('../public/image/elements/5.jpg'),
  6: require('../public/image/elements/6.jpg'),
  7: require('../public/image/elements/7.jpg'),
  8: require('../public/image/elements/8.jpg')
}

export const IMAGE_PUZZLES = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  imageId: i + 1,
  cols: 4,
  rows: 3,
}))

// Difficulty configuration
export const DIFFICULTY_CONFIG = [
  { level: 1, missingCount: 2, trayCount: 4,  timeLimit: 10, coefficient: 1   },
  { level: 2, missingCount: 3, trayCount: 5,  timeLimit: 10, coefficient: 1.5 },
  { level: 3, missingCount: 4, trayCount: 6,  timeLimit: 10, coefficient: 2   },
  { level: 4, missingCount: 5, trayCount: 7,  timeLimit: 15, coefficient: 2.5 },
  { level: 5, missingCount: 6, trayCount: 8,  timeLimit: 15, coefficient: 3   },
  { level: 6, missingCount: 6, trayCount: 9,  timeLimit: 15, coefficient: 3.5 },
]

// Get image URL
export function getImageUrl(imageId) {
  return puzzleImages[imageId]
}

/**
 * Get CSS background style for a cell to show a portion of an image.
 *
 * Technique: background-size = cols*100% × rows*100%, so the full image
 * is spread across all grid cells. background-position X%/Y% aligns the
 * correct slice to show in each cell.
 *
 * @param {number} imageId - which image (1-8)
 * @param {number} displayIdx - which cell index in that image's grid
 * @param {number} cols - grid columns of that image
 * @param {number} rows - grid rows of that image
 */
export function getCellBgStyle(imageId, displayIdx, cols, rows) {
  const col = displayIdx % cols
  const row = Math.floor(displayIdx / cols)
  const xPct = cols <= 1 ? 0 : (col / (cols - 1)) * 100
  const yPct = rows <= 1 ? 0 : (row / (rows - 1)) * 100
  return {
    backgroundImage:    `url(${getImageUrl(imageId)})`,
    backgroundSize:     `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat:   'no-repeat',
  }
}

/**
 * Generate a puzzle round for the given difficulty level.
 * Returns: { puzzle, missingIndices, trayPieces, config }
 *
 * Each tray piece has:
 *   { id, imageId, displayIdx, cols, rows, originalIndex, isCorrect }
 *
 * originalIndex: the board cell index this piece belongs to (-1 for distractors)
 * displayIdx: which cell of imageId to show (for background-position)
 */
export function generateRound(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty - 1]
  const puzzle = IMAGE_PUZZLES[Math.floor(Math.random() * IMAGE_PUZZLES.length)]
  const { cols, rows, imageId } = puzzle
  const totalCells = cols * rows

  // Randomly select missing cell indices
  const allIndices = Array.from({ length: totalCells }, (_, i) => i)
  shuffle(allIndices)
  const missingIndices = allIndices.slice(0, config.missingCount)

  // Correct pieces: show the matching portion of the puzzle image
  const correctPieces = missingIndices.map(idx => ({
    id:            `correct-${idx}-${Date.now()}`,
    imageId,
    displayIdx:    idx,
    cols,
    rows,
    originalIndex: idx,
    isCorrect:     true,
  }))

  // Distractor pieces: show random portions of OTHER images
  const distractorCount = config.trayCount - config.missingCount
  const otherPuzzles = IMAGE_PUZZLES.filter(p => p.id !== puzzle.id)
  const distractors = []
  for (let i = 0; i < distractorCount; i++) {
    const src = otherPuzzles[Math.floor(Math.random() * otherPuzzles.length)]
    const srcTotal = src.cols * src.rows
    const srcIdx   = Math.floor(Math.random() * srcTotal)
    distractors.push({
      id:            `distractor-${i}-${srcIdx}-${Math.random().toString(36).slice(2)}`,
      imageId:       src.imageId,
      displayIdx:    srcIdx,
      cols:          src.cols,
      rows:          src.rows,
      originalIndex: -1,
      isCorrect:     false,
    })
  }

  const trayPieces = [...correctPieces, ...distractors]
  shuffle(trayPieces)

  return { puzzle, missingIndices, trayPieces, config }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}
