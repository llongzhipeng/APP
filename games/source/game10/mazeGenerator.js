// ─── Difficulty configuration ───────────────────────────────────────────────
export const DIFFICULTY_CONFIG = {
  1: { turns: 0, gridSize: 7,  answerTime: 10, coefficient: 1   },
  2: { turns: 1, gridSize: 7,  answerTime: 10, coefficient: 1.5 },
  3: { turns: 2, gridSize: 9,  answerTime: 10, coefficient: 2   },
  4: { turns: 3, gridSize: 9,  answerTime: 15, coefficient: 2.5 },
  5: { turns: 3, gridSize: 11, answerTime: 13, coefficient: 3   },
  6: { turns: 4, gridSize: 11, answerTime: 20, coefficient: 3.5 },
}

export function getDifficultyConfig(d) {
  return DIFFICULTY_CONFIG[Math.max(1, Math.min(6, d))]
}

// ─── Segment colors & landmarks ──────────────────────────────────────────────
const SEG_COLORS = ['#4FC3F7', '#81C784', '#FFB74D', '#F06292', '#CE93D8', '#80CBC4']
const LANDMARKS  = ['★', '♥', '▲', '◆', '●', '✦']

// ─── Detect turn indices in a path ──────────────────────────────────────────
function findTurnIndices(path) {
  const turns = []
  for (let i = 1; i < path.length - 1; i++) {
    const dr1 = path[i].r - path[i - 1].r
    const dc1 = path[i].c - path[i - 1].c
    const dr2 = path[i + 1].r - path[i].r
    const dc2 = path[i + 1].c - path[i].c
    if (dr1 !== dr2 || dc1 !== dc2) turns.push(i)
  }
  return turns
}

// ─── Build robot path by difficulty ─────────────────────────────────────────
function buildRobotPath(gs, turns, seed) {
  let rng = seed
  const random = () => {
    rng = (rng * 9301 + 49297) % 233280
    return rng / 233280
  }

  const margin = 1
  const topR  = margin
  const botR  = gs - margin - 1
  const leftC = margin
  const rightC = gs - margin - 1
  const midR  = Math.floor((topR + botR) / 2)

  // Build path in canonical form: left→right or top→bottom
  const path = []
  let r, c

  if (turns === 0) {
    // Use seed bits directly — completely bypasses LCG to avoid patterns
    const horizontal = (seed & 0x80) !== 0
    if (horizontal) {
      r = topR + (seed >>> 16) % (botR - topR + 1)
      c = leftC; path.push({ r, c })
      while (c < rightC) { c++; path.push({ r, c }) }
    } else {
      c = leftC + (seed >>> 8) % (rightC - leftC + 1)
      r = topR; path.push({ r, c })
      while (r < botR) { r++; path.push({ r, c }) }
    }

  } else if (turns === 1) {
    const goDown = random() > 0.5
    r = goDown
      ? topR + Math.floor(random() * (midR - topR + 1))
      : midR + 1 + Math.floor(random() * (botR - midR - 1))
    c = leftC; path.push({ r, c })
    const hLen = Math.floor(gs / 2) + Math.floor(random() * 2)
    for (let i = 0; i < hLen && c < rightC; i++) { c++; path.push({ r, c }) }
    const vLen = goDown ? botR - r : r - topR
    for (let i = 0; i < vLen; i++) { r += goDown ? 1 : -1; path.push({ r, c }) }

  } else if (turns === 2) {
    r = topR + Math.floor(random() * Math.floor((botR - topR) / 2))
    c = leftC; path.push({ r, c })
    const h1 = Math.max(2, Math.floor(gs / 3) + Math.floor(random() * 2))
    for (let i = 0; i < h1 && c < rightC - 1; i++) { c++; path.push({ r, c }) }
    const vLen = Math.max(2, Math.floor((botR - topR) / 2) + Math.floor(random() * 2))
    for (let i = 0; i < vLen && r < botR; i++) { r++; path.push({ r, c }) }
    const h2 = Math.max(2, Math.floor(gs / 3) + Math.floor(random() * 2))
    for (let i = 0; i < h2 && c < rightC; i++) { c++; path.push({ r, c }) }

  } else if (turns === 3) {
    r = topR + Math.floor(random() * Math.floor((botR - topR) / 3))
    c = leftC; path.push({ r, c })
    const h1 = Math.max(2, Math.floor(gs / 4) + Math.floor(random() * 2))
    for (let i = 0; i < h1 && c < rightC - 2; i++) { c++; path.push({ r, c }) }
    const vDown = Math.max(2, Math.floor((botR - topR) / 2) + Math.floor(random() * 2))
    for (let i = 0; i < vDown && r < botR; i++) { r++; path.push({ r, c }) }
    const h2 = Math.max(2, Math.floor(gs / 4) + Math.floor(random() * 2))
    for (let i = 0; i < h2 && c < rightC; i++) { c++; path.push({ r, c }) }
    const vUp = Math.max(2, Math.floor(vDown * 0.7))
    for (let i = 0; i < vUp && r > topR; i++) { r--; path.push({ r, c }) }

  } else {
    r = topR + Math.floor(random() * Math.floor((botR - topR) / 3))
    c = leftC; path.push({ r, c })
    const step = Math.max(2, Math.floor((rightC - leftC) / 5))
    const vLen = Math.max(2, Math.floor((botR - topR) / 2))
    for (let i = 0; i < step && c < rightC - 2; i++) { c++; path.push({ r, c }) }
    for (let i = 0; i < vLen && r < botR; i++)        { r++; path.push({ r, c }) }
    for (let i = 0; i < step && c < rightC - 2; i++) { c++; path.push({ r, c }) }
    for (let i = 0; i < vLen && r > topR; i++)        { r--; path.push({ r, c }) }
    const h5 = Math.max(2, Math.floor(step * 1.5))
    for (let i = 0; i < h5 && c < rightC; i++)        { c++; path.push({ r, c }) }
  }

  // ── Rotate path into one of 4 directions using seed bits directly ────────────
  // bits 4-5 of seed give 0-3, independent of LCG
  const dir = (seed >>> 4) & 0x3
  if (dir === 0) return path  // no transform needed

  return path.map(({ r: pr, c: pc }) => {
    if (dir === 1) return { r: pr,          c: gs - 1 - pc }  // mirror horizontal
    if (dir === 2) return { r: pc,          c: pr }            // transpose (L→R becomes T→B)
    if (dir === 3) return { r: gs - 1 - pc, c: pr }            // transpose + mirror
    return { r: pr, c: pc }
  })
}

// ─── Add distraction paths ──────────────────────────────────────────────────
// All fake branches must fork FROM the robot path to deceive the user
function addDistractionPaths(grid, robotPath, gs, seed, minFloor) {
  let rng = seed + 12345
  const random = () => {
    rng = (rng * 9301 + 49297) % 233280
    return rng / 233280
  }

  // Mark robot path in grid
  for (const { r, c } of robotPath) {
    grid[r][c] = true
  }

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  const countFloor = () => {
    let n = 0
    for (let r = 0; r < gs; r++)
      for (let c = 0; c < gs; c++)
        if (grid[r][c]) n++
    return n
  }

  const addBranch = (startR, startC, maxLen) => {
    const shuffled = [...dirs].sort(() => random() - 0.5)
    for (const [dr, dc] of shuffled) {
      const nr = startR + dr, nc = startC + dc
      if (nr < 0 || nr >= gs || nc < 0 || nc >= gs) continue
      if (grid[nr][nc]) continue

      let r = nr, c = nc
      const len = 2 + Math.floor(random() * maxLen)
      for (let j = 0; j < len; j++) {
        if (r < 0 || r >= gs || c < 0 || c >= gs) break
        grid[r][c] = true
        if (j > 0 && random() > 0.55) {
          const turnDirs = dirs.filter(d => d[0] !== -dr || d[1] !== -dc)
          const [tdr, tdc] = turnDirs[Math.floor(random() * turnDirs.length)]
          r += tdr; c += tdc
        } else {
          r += dr; c += dc
        }
      }
      return true
    }
    return false
  }

  // ── Key fix: at every turn point, extend a fake branch in the OLD direction ──
  // This hides the "wall ahead = turn here" hint from the user
  for (let i = 1; i < robotPath.length - 1; i++) {
    const prev = robotPath[i - 1]
    const curr = robotPath[i]
    const next = robotPath[i + 1]
    const dr = curr.r - prev.r
    const dc = curr.c - prev.c
    const dr2 = next.r - curr.r
    const dc2 = next.c - curr.c
    // Turn detected: old direction (dr,dc) is different from new direction
    if (dr !== dr2 || dc !== dc2) {
      // Extend fake branch continuing straight in OLD direction from the turn cell
      const len = 2 + Math.floor(random() * 3)
      let r = curr.r + dr, c = curr.c + dc
      for (let j = 0; j < len; j++) {
        if (r < 0 || r >= gs || c < 0 || c >= gs) break
        grid[r][c] = true
        r += dr; c += dc
      }
    }
  }

  // Spread branches across the robot path
  const step = Math.max(1, Math.floor(robotPath.length / 5))
  for (let i = 0; i < robotPath.length; i += step) {
    const { r, c } = robotPath[i]
    addBranch(r, c, 4)
  }

  // Keep adding branches until minFloor tiles are open
  let attempts = 0
  while (countFloor() < minFloor && attempts < 200) {
    attempts++
    const idx = Math.floor(random() * robotPath.length)
    const { r, c } = robotPath[idx]
    addBranch(r, c, 5)
  }
}

// ─── Main generator ──────────────────────────────────────────────────────────
export function generateMaze(difficulty, trialNum) {
  const config = getDifficultyConfig(difficulty)
  const { gridSize: gs, turns } = config

  // Build robot path according to difficulty
  // Use non-linear seed so consecutive trialNums produce very different paths
  const seed = (trialNum * 2654435761 ^ difficulty * 40503) >>> 0
  const path = buildRobotPath(gs, turns, seed)

  // Create grid and add distraction paths (difficulty 1-2 needs ≥30 floor tiles, 3+ needs ≥50% of grid)
  const grid = Array(gs).fill(null).map(() => Array(gs).fill(false))
  const minFloor = difficulty <= 2 ? 30 : Math.floor(gs * gs * 0.5)
  addDistractionPaths(grid, path, gs, (seed ^ 0xDEADBEEF) >>> 0, minFloor)

  // Build pathSet from grid (all walkable cells)
  const pathSet = new Set()
  for (let r = 0; r < gs; r++) {
    for (let c = 0; c < gs; c++) {
      if (grid[r][c]) pathSet.add(`${r},${c}`)
    }
  }

  // Build connections (all adjacent path cells)
  const connections = new Set()
  for (let r = 0; r < gs; r++) {
    for (let c = 0; c < gs; c++) {
      if (grid[r][c]) {
        if (c + 1 < gs && grid[r][c + 1]) connections.add(`${r},${c},H`)
        if (r + 1 < gs && grid[r + 1][c]) connections.add(`${r},${c},V`)
      }
    }
  }

  // Assign per-cell segment color
  const turnIndices = findTurnIndices(path)
  const segmentColors = new Array(path.length)
  let seg = 0
  for (let i = 0; i < path.length; i++) {
    segmentColors[i] = SEG_COLORS[seg % SEG_COLORS.length]
    if (turnIndices.includes(i)) seg++
  }

  // Assign landmarks at turn points
  const landmarkMap = {}
  turnIndices.forEach((idx, i) => {
    const { r, c } = path[idx]
    landmarkMap[`${r},${c}`] = LANDMARKS[i % LANDMARKS.length]
  })

  return {
    gridSize: gs,
    path,
    pathSet,
    connections,
    segmentColors,
    landmarkMap,
    config,
  }
}

// ─── Connection helper (available for external use) ──────────────────────────
// eslint-disable-next-line no-unused-vars
export function hasConnection(connections, r1, c1, r2, c2) {
  if (r1 === r2) {
    return connections.has(`${r1},${Math.min(c1, c2)},H`)
  } else {
    return connections.has(`${Math.min(r1, r2)},${c1},V`)
  }
}
