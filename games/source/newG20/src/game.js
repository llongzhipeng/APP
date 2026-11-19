// Game logic: cell types, difficulty config, level generator, path solver

export const CELL = {
  EMPTY: 0,
  WAREHOUSE: 1,
  DELIVERY: 2,
  OBSTACLE: 3,
  ENDPOINT: 4
}

export const DIFFICULTIES = [
  { level: 1, rows: 5, cols: 5, deliveryMin: 1, deliveryMax: 1, obstacles: 2, coeff: 1, pattern: 'scatter' },
  { level: 2, rows: 5, cols: 6, deliveryMin: 1, deliveryMax: 1, obstacles: 3, coeff: 1.5, pattern: 'scatter' },
  { level: 3, rows: 6, cols: 6, deliveryMin: 2, deliveryMax: 2, obstacles: 4, coeff: 2, pattern: 'semi' },
  { level: 4, rows: 7, cols: 7, deliveryMin: 3, deliveryMax: 3, obstacles: 5, coeff: 2.5, pattern: 'semi' },
  { level: 5, rows: 8, cols: 8, deliveryMin: 3, deliveryMax: 4, obstacles: 6, coeff: 3, pattern: 'maze' },
  { level: 6, rows: 9, cols: 9, deliveryMin: 4, deliveryMax: 4, obstacles: 7, coeff: 3.5, pattern: 'maze' }
]

const rand = (n) => Math.floor(Math.random() * n)
const key = (r, c) => r + ',' + c

// BFS shortest path length between two cells; -1 if unreachable
export function bfsDistance(grid, sr, sc, tr, tc) {
  const rows = grid.length, cols = grid[0].length
  if (sr === tr && sc === tc) return 0
  const visited = new Uint8Array(rows * cols)
  const queue = [[sr, sc, 0]]
  visited[sr * cols + sc] = 1
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
  while (queue.length) {
    const [r, c, d] = queue.shift()
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (grid[nr][nc] === CELL.OBSTACLE) continue
      if (visited[nr * cols + nc]) continue
      if (nr === tr && nc === tc) return d + 1
      visited[nr * cols + nc] = 1
      queue.push([nr, nc, d + 1])
    }
  }
  return -1
}

// BFS returning full distance map from a source
function bfsAll(grid, sr, sc) {
  const rows = grid.length, cols = grid[0].length
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1))
  dist[sr][sc] = 0
  const queue = [[sr, sc]]
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
  while (queue.length) {
    const [r, c] = queue.shift()
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (grid[nr][nc] === CELL.OBSTACLE) continue
      if (dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return dist
}

// TSP: shortest total distance from warehouse visiting all delivery points, ending at endpoint
export function optimalTotal(grid, warehouse, deliveryPoints, endpoint) {
  const points = [warehouse, ...deliveryPoints, endpoint]
  const startIdx = 0
  const endIdx = points.length - 1
  const n = points.length
  const distMaps = points.map(p => bfsAll(grid, p.r, p.c))
  const pairDist = Array.from({ length: n }, () => new Array(n).fill(-1))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      pairDist[i][j] = distMaps[i][points[j].r][points[j].c]
    }
  }
  // Delivery-point indices (must all be visited between start and end)
  const targets = []
  for (let i = 1; i < n - 1; i++) targets.push(i)
  let best = Infinity
  const perm = (arr, start) => {
    if (start === arr.length) {
      let total = 0
      let prev = startIdx
      for (const idx of arr) {
        if (pairDist[prev][idx] < 0) return
        total += pairDist[prev][idx]
        prev = idx
      }
      if (pairDist[prev][endIdx] < 0) return
      total += pairDist[prev][endIdx]
      if (total < best) best = total
      return
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]]
      perm(arr, start + 1)
      ;[arr[start], arr[i]] = [arr[i], arr[start]]
    }
  }
  if (targets.length === 0) {
    // No delivery points — direct warehouse → endpoint
    best = pairDist[startIdx][endIdx]
    if (best < 0) best = Infinity
  } else {
    perm(targets, 0)
  }
  return best === Infinity ? -1 : best
}

function randomCells(rows, cols, count, exclude) {
  const excludeSet = new Set(exclude.map(p => key(p.r, p.c)))
  const cells = []
  let attempts = 0
  while (cells.length < count && attempts < 500) {
    attempts++
    const r = rand(rows), c = rand(cols)
    const k = key(r, c)
    if (excludeSet.has(k)) continue
    excludeSet.add(k)
    cells.push({ r, c })
  }
  return cells
}

function placeSemiObstacles(rows, cols, count, targets, exclude) {
  // Cluster obstacles adjacent to delivery points
  const excludeSet = new Set(exclude.map(p => key(p.r, p.c)))
  const candidates = []
  for (const t of targets) {
    const around = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]
    for (const [dr, dc] of around) {
      const r = t.r + dr, c = t.c + dc
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue
      const k = key(r, c)
      if (excludeSet.has(k)) continue
      candidates.push({ r, c })
    }
  }
  // Shuffle
  candidates.sort(() => Math.random() - 0.5)
  const result = []
  for (const cand of candidates) {
    if (result.length >= count) break
    const k = key(cand.r, cand.c)
    if (excludeSet.has(k)) continue
    excludeSet.add(k)
    result.push(cand)
  }
  // Fill any remaining randomly
  while (result.length < count) {
    const extra = randomCells(rows, cols, 1, [...exclude, ...result])
    if (!extra.length) break
    result.push(...extra)
  }
  return result
}

function placeMazeObstacles(rows, cols, count, exclude) {
  // Create small wall segments (2-cell chunks)
  const excludeSet = new Set(exclude.map(p => key(p.r, p.c)))
  const result = []
  let attempts = 0
  while (result.length < count && attempts < 500) {
    attempts++
    const r = rand(rows), c = rand(cols)
    const horizontal = Math.random() > 0.5
    const dr = horizontal ? 0 : 1
    const dc = horizontal ? 1 : 0
    const cells = [{ r, c }, { r: r + dr, c: c + dc }]
    let ok = true
    for (const cell of cells) {
      if (cell.r < 0 || cell.r >= rows || cell.c < 0 || cell.c >= cols) { ok = false; break }
      if (excludeSet.has(key(cell.r, cell.c))) { ok = false; break }
    }
    if (!ok) continue
    for (const cell of cells) {
      if (result.length >= count) break
      excludeSet.add(key(cell.r, cell.c))
      result.push(cell)
    }
  }
  return result
}

// Generate level with retries to ensure reachability
export function generateLevel(difficulty) {
  const config = DIFFICULTIES[difficulty - 1]
  const { rows, cols, deliveryMin, deliveryMax, obstacles, pattern } = config
  const numDelivery = deliveryMin + rand(deliveryMax - deliveryMin + 1)

  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(CELL.EMPTY))

    // Place warehouse (prefer corners)
    const corners = [
      { r: 0, c: 0 },
      { r: 0, c: cols - 1 },
      { r: rows - 1, c: 0 },
      { r: rows - 1, c: cols - 1 }
    ]
    const wIdx = rand(4)
    const warehouse = corners[wIdx]
    // Endpoint = opposite / different corner
    const otherCorners = corners.filter((_, i) => i !== wIdx)
    const endpoint = otherCorners[rand(otherCorners.length)]
    if (warehouse.r === endpoint.r && warehouse.c === endpoint.c) continue

    grid[warehouse.r][warehouse.c] = CELL.WAREHOUSE
    grid[endpoint.r][endpoint.c] = CELL.ENDPOINT

    // Delivery points
    const deliveryPoints = []
    let dAttempts = 0
    while (deliveryPoints.length < numDelivery && dAttempts < 300) {
      dAttempts++
      const r = rand(rows), c = rand(cols)
      if (grid[r][c] !== CELL.EMPTY) continue
      const distW = Math.abs(r - warehouse.r) + Math.abs(c - warehouse.c)
      const distE = Math.abs(r - endpoint.r) + Math.abs(c - endpoint.c)
      if (distW < 2 && Math.random() > 0.3) continue
      if (distE < 2 && Math.random() > 0.3) continue
      const tooClose = deliveryPoints.some(p => Math.abs(p.r - r) + Math.abs(p.c - c) < 2)
      if (tooClose && Math.random() > 0.4) continue
      grid[r][c] = CELL.DELIVERY
      deliveryPoints.push({ r, c })
    }
    if (deliveryPoints.length < numDelivery) continue

    // Obstacles
    let obstacleCells
    const exclude = [warehouse, endpoint, ...deliveryPoints]
    if (pattern === 'scatter') {
      obstacleCells = randomCells(rows, cols, obstacles, exclude)
    } else if (pattern === 'semi') {
      obstacleCells = placeSemiObstacles(rows, cols, obstacles, deliveryPoints, exclude)
    } else {
      obstacleCells = placeMazeObstacles(rows, cols, obstacles, exclude)
    }
    if (obstacleCells.length < obstacles) continue
    for (const ob of obstacleCells) grid[ob.r][ob.c] = CELL.OBSTACLE

    // Verify reachability
    const total = optimalTotal(grid, warehouse, deliveryPoints, endpoint)
    if (total < 0) continue
    if (total < 2) continue

    return { grid, warehouse, deliveryPoints, endpoint, obstacles: obstacleCells, optimalSteps: total, rows, cols }
  }
  // Fallback
  const cfg = DIFFICULTIES[difficulty - 1]
  const grid = Array.from({ length: cfg.rows }, () => new Array(cfg.cols).fill(CELL.EMPTY))
  const warehouse = { r: 0, c: 0 }
  const endpoint = { r: cfg.rows - 1, c: cfg.cols - 1 }
  grid[0][0] = CELL.WAREHOUSE
  grid[endpoint.r][endpoint.c] = CELL.ENDPOINT
  const deliveryPoints = [{ r: 0, c: cfg.cols - 1 }]
  grid[0][cfg.cols - 1] = CELL.DELIVERY
  const total = optimalTotal(grid, warehouse, deliveryPoints, endpoint)
  return { grid, warehouse, deliveryPoints, endpoint, obstacles: [], optimalSteps: total, rows: cfg.rows, cols: cfg.cols }
}
