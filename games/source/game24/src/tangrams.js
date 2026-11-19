// 60 tangram designs: 6 difficulties × 10 designs each.
// Each design fills a 100×100 unit square exactly (no gaps, no overlaps).
// Within ONE design, every piece has a UNIQUE shape (only one correct answer).
//
// Design rules used to guarantee uniqueness:
//   • Rectangle-grid designs: each row's height is distinct from other rows' heights,
//     and within a row all cell widths are distinct.
//   • Corner-fan designs: cut points along the perimeter are spaced unevenly so each
//     triangle has a different base/orientation.

// ───────────────── helpers ─────────────────

function v_stripes(cuts) {
  const xs = [0, ...cuts, 100]
  return xs.slice(0, -1).map((x, i) =>
    `${x},0 ${xs[i + 1]},0 ${xs[i + 1]},100 ${x},100`
  )
}

function h_stripes(cuts) {
  const ys = [0, ...cuts, 100]
  return ys.slice(0, -1).map((y, i) =>
    `0,${y} 100,${y} 100,${ys[i + 1]} 0,${ys[i + 1]}`
  )
}

function rows_grid(rows) {
  const out = []
  for (const r of rows) {
    for (let i = 0; i < r.xs.length - 1; i++) {
      out.push(`${r.xs[i]},${r.y0} ${r.xs[i + 1]},${r.y0} ${r.xs[i + 1]},${r.y1} ${r.xs[i]},${r.y1}`)
    }
  }
  return out
}

// fractions: ascending values in (0, 2). t∈[0,1] walks right edge top→bottom;
// t∈[1,2] walks bottom edge right→left. Returns N+1 triangles from corner (0,0).
function corner_fan(fractions) {
  // Auto-insert t=1 (the (100,100) corner) when missing, so triangles tile correctly
  const cuts = [...fractions]
  if (!cuts.includes(1)) {
    const idx = cuts.findIndex(c => c > 1)
    if (idx === -1) cuts.push(1); else cuts.splice(idx, 0, 1)
  }
  const pt = (t) => t <= 1 ? [100, t * 100] : [(2 - t) * 100, 100]
  const out = []
  let prev = [100, 0]
  for (const t of cuts) {
    const cur = pt(t)
    out.push(`0,0 ${prev[0]},${prev[1]} ${cur[0]},${cur[1]}`)
    prev = cur
  }
  out.push(`0,0 ${prev[0]},${prev[1]} 0,100`)
  return out
}

// ───────────────── designs ─────────────────

const D1 = [ // 3 pieces each
  rows_grid([{ y0: 0, y1: 35, xs: [0, 60, 100] }, { y0: 35, y1: 100, xs: [0, 100] }]),   // 1
  rows_grid([{ y0: 0, y1: 45, xs: [0, 100] }, { y0: 45, y1: 100, xs: [0, 38, 100] }]),   // 2
  corner_fan([0.5]),                                                                     // 3
  rows_grid([{ y0: 0, y1: 60, xs: [0, 65, 100] }, { y0: 60, y1: 100, xs: [0, 100] }]),   // 4
  rows_grid([{ y0: 0, y1: 40, xs: [0, 45, 100] }, { y0: 40, y1: 100, xs: [0, 100] }]),   // 5
  rows_grid([{ y0: 0, y1: 30, xs: [0, 100] }, { y0: 30, y1: 100, xs: [0, 45, 100] }]),   // 6
  rows_grid([{ y0: 0, y1: 30, xs: [0, 55, 100] }, { y0: 30, y1: 100, xs: [0, 100] }]),   // 7
  rows_grid([{ y0: 0, y1: 65, xs: [0, 100] }, { y0: 65, y1: 100, xs: [0, 42, 100] }]),   // 8
  corner_fan([1.3]),                                                                     // 9
  rows_grid([{ y0: 0, y1: 25, xs: [0, 100] }, { y0: 25, y1: 100, xs: [0, 55, 100] }])    // 10
]

const D2 = [ // 4 pieces each
  rows_grid([{ y0: 0, y1: 55, xs: [0, 65, 100] }, { y0: 55, y1: 100, xs: [0, 45, 100] }]),                                            // 1 (top h=55/widths 65,35; bot h=45/widths 45,55)
  corner_fan([0.3, 0.7]),                                                                                                            // 2 (all <1, auto-inserts t=1)
  rows_grid([{ y0: 0, y1: 32, xs: [0, 38, 100] }, { y0: 32, y1: 100, xs: [0, 55, 100] }]),                                           // 3
  rows_grid([{ y0: 0, y1: 48, xs: [0, 55, 100] }, { y0: 48, y1: 100, xs: [0, 40, 100] }]),                                           // 4
  rows_grid([{ y0: 0, y1: 30, xs: [0, 100] }, { y0: 30, y1: 100, xs: [0, 25, 60, 100] }]),                                           // 5
  rows_grid([{ y0: 0, y1: 35, xs: [0, 55, 100] }, { y0: 35, y1: 100, xs: [0, 25, 100] }]),                                           // 6 (heights 35/65; widths 55,45 / 25,75)
  rows_grid([{ y0: 0, y1: 25, xs: [0, 100] }, { y0: 25, y1: 60, xs: [0, 100] }, { y0: 60, y1: 100, xs: [0, 45, 100] }]),             // 7
  rows_grid([{ y0: 0, y1: 55, xs: [0, 45, 100] }, { y0: 55, y1: 100, xs: [0, 65, 100] }]),                                           // 8 (avoid swap with D2-1: heights 55/45)
  corner_fan([0.25, 1.5]),                                                                                                           // 9
  rows_grid([{ y0: 0, y1: 35, xs: [0, 40, 100] }, { y0: 35, y1: 100, xs: [0, 55, 100] }])                                            // 10 (heights 35/65; widths 40,60 / 55,45)
]

const D3 = [ // 5 pieces each
  rows_grid([{ y0: 0, y1: 20, xs: [0, 100] }, { y0: 20, y1: 55, xs: [0, 40, 100] }, { y0: 55, y1: 100, xs: [0, 65, 100] }]),         // 1
  rows_grid([{ y0: 0, y1: 28, xs: [0, 38, 100] }, { y0: 28, y1: 62, xs: [0, 55, 100] }, { y0: 62, y1: 100, xs: [0, 100] }]),         // 2
  rows_grid([{ y0: 0, y1: 22, xs: [0, 100] }, { y0: 22, y1: 58, xs: [0, 42, 100] }, { y0: 58, y1: 100, xs: [0, 55, 100] }]),         // 3
  corner_fan([0.15, 0.4, 0.75]),                                                                                                     // 4
  rows_grid([{ y0: 0, y1: 35, xs: [0, 28, 100] }, { y0: 35, y1: 70, xs: [0, 45, 100] }, { y0: 70, y1: 100, xs: [0, 100] }]),         // 5
  rows_grid([{ y0: 0, y1: 40, xs: [0, 65, 100] }, { y0: 40, y1: 70, xs: [0, 45, 100] }, { y0: 70, y1: 100, xs: [0, 100] }]),         // 6
  rows_grid([{ y0: 0, y1: 25, xs: [0, 45, 100] }, { y0: 25, y1: 60, xs: [0, 28, 100] }, { y0: 60, y1: 100, xs: [0, 100] }]),         // 7
  rows_grid([{ y0: 0, y1: 32, xs: [0, 22, 58, 100] }, { y0: 32, y1: 100, xs: [0, 45, 100] }]),                                       // 8
  rows_grid([{ y0: 0, y1: 28, xs: [0, 45, 100] }, { y0: 28, y1: 100, xs: [0, 22, 58, 100] }]),                                       // 9
  rows_grid([{ y0: 0, y1: 42, xs: [0, 100] }, { y0: 42, y1: 75, xs: [0, 38, 100] }, { y0: 75, y1: 100, xs: [0, 55, 100] }])          // 10
]

const D4 = [ // 6 pieces each
  rows_grid([{ y0: 0, y1: 45, xs: [0, 22, 52, 100] }, { y0: 45, y1: 100, xs: [0, 28, 62, 100] }]),                                   // 1
  rows_grid([{ y0: 0, y1: 38, xs: [0, 22, 52, 100] }, { y0: 38, y1: 70, xs: [0, 45, 100] }, { y0: 70, y1: 100, xs: [0, 100] }]),     // 2
  rows_grid([{ y0: 0, y1: 25, xs: [0, 38, 72, 100] }, { y0: 25, y1: 62, xs: [0, 55, 100] }, { y0: 62, y1: 100, xs: [0, 100] }]),     // 3
  corner_fan([0.15, 0.35, 0.6, 1.6]),                                                                                                // 4 (auto-inserts t=1 → 5 cuts → 6 pieces)
  rows_grid([{ y0: 0, y1: 42, xs: [0, 28, 62, 100] }, { y0: 42, y1: 75, xs: [0, 55, 100] }, { y0: 75, y1: 100, xs: [0, 100] }]),     // 5
  rows_grid([{ y0: 0, y1: 18, xs: [0, 100] }, { y0: 18, y1: 58, xs: [0, 22, 58, 100] }, { y0: 58, y1: 100, xs: [0, 45, 100] }]),     // 6
  rows_grid([{ y0: 0, y1: 38, xs: [0, 45, 100] }, { y0: 38, y1: 72, xs: [0, 22, 58, 100] }, { y0: 72, y1: 100, xs: [0, 100] }]),     // 7
  rows_grid([{ y0: 0, y1: 28, xs: [0, 100] }, { y0: 28, y1: 68, xs: [0, 22, 58, 100] }, { y0: 68, y1: 100, xs: [0, 45, 100] }]),     // 8
  rows_grid([{ y0: 0, y1: 32, xs: [0, 22, 58, 100] }, { y0: 32, y1: 68, xs: [0, 45, 100] }, { y0: 68, y1: 100, xs: [0, 100] }]),     // 9
  rows_grid([{ y0: 0, y1: 35, xs: [0, 22, 55, 100] }, { y0: 35, y1: 72, xs: [0, 100] }, { y0: 72, y1: 100, xs: [0, 55, 100] }])      // 10
]

const D5 = [ // 7 pieces each
  rows_grid([{ y0: 0, y1: 25, xs: [0, 22, 55, 100] }, { y0: 25, y1: 60, xs: [0, 28, 62, 100] }, { y0: 60, y1: 100, xs: [0, 100] }]), // 1 (3+3+1=7)
  rows_grid([{ y0: 0, y1: 28, xs: [0, 42, 100] }, { y0: 28, y1: 62, xs: [0, 28, 62, 100] }, { y0: 62, y1: 100, xs: [0, 55, 100] }]), // 2 (2+3+2=7)
  rows_grid([{ y0: 0, y1: 32, xs: [0, 32, 65, 100] }, { y0: 32, y1: 62, xs: [0, 100] }, { y0: 62, y1: 100, xs: [0, 28, 62, 100] }]), // 3 (3+1+3=7)
  corner_fan([0.12, 0.28, 0.48, 0.72, 1.55]),                                                                                        // 4 (auto-insert t=1 → 6 cuts → 7 pieces)
  rows_grid([{ y0: 0, y1: 22, xs: [0, 28, 55, 100] }, { y0: 22, y1: 58, xs: [0, 32, 65, 100] }, { y0: 58, y1: 100, xs: [0, 100] }]), // 5 (3+3+1=7) heights 22/36/42
  rows_grid([{ y0: 0, y1: 32, xs: [0, 25, 58, 100] }, { y0: 32, y1: 70, xs: [0, 55, 100] }, { y0: 70, y1: 100, xs: [0, 42, 100] }]), // 6 (3+2+2=7) heights 32/38/30
  rows_grid([{ y0: 0, y1: 18, xs: [0, 100] }, { y0: 18, y1: 55, xs: [0, 25, 58, 100] }, { y0: 55, y1: 100, xs: [0, 22, 52, 100] }]), // 7 (1+3+3=7)
  rows_grid([{ y0: 0, y1: 27, xs: [0, 38, 100] }, { y0: 27, y1: 58, xs: [0, 25, 58, 100] }, { y0: 58, y1: 100, xs: [0, 52, 100] }]), // 8 (2+3+2=7)
  rows_grid([{ y0: 0, y1: 38, xs: [0, 42, 100] }, { y0: 38, y1: 70, xs: [0, 100] }, { y0: 70, y1: 100, xs: [0, 18, 38, 65, 100] }]), // 9 (2+1+4=7)
  rows_grid([{ y0: 0, y1: 28, xs: [0, 22, 52, 100] }, { y0: 28, y1: 62, xs: [0, 28, 62, 100] }, { y0: 62, y1: 100, xs: [0, 100] }])  // 10 (3+3+1=7)
]

const D6 = [ // 7 pieces each — more elaborate
  rows_grid([{ y0: 0, y1: 28, xs: [0, 58, 100] }, { y0: 28, y1: 65, xs: [0, 22, 58, 100] }, { y0: 65, y1: 100, xs: [0, 52, 100] }]), // 1
  rows_grid([{ y0: 0, y1: 32, xs: [0, 42, 100] }, { y0: 32, y1: 68, xs: [0, 28, 62, 100] }, { y0: 68, y1: 100, xs: [0, 52, 100] }]), // 2
  corner_fan([0.1, 0.22, 0.4, 0.6, 0.85]),                                                                                           // 3 (auto-insert t=1 → 6 cuts → 7 pieces)
  rows_grid([{ y0: 0, y1: 22, xs: [0, 18, 42, 72, 100] }, { y0: 22, y1: 58, xs: [0, 100] }, { y0: 58, y1: 100, xs: [0, 42, 100] }]), // 4 (4+1+2=7)
  rows_grid([{ y0: 0, y1: 18, xs: [0, 100] }, { y0: 18, y1: 45, xs: [0, 22, 52, 100] }, { y0: 45, y1: 75, xs: [0, 42, 100] }, { y0: 75, y1: 100, xs: [0, 100] }]), // 5 (1+3+2+1=7)
  rows_grid([{ y0: 0, y1: 32, xs: [0, 22, 55, 100] }, { y0: 32, y1: 65, xs: [0, 45, 100] }, { y0: 65, y1: 100, xs: [0, 38, 100] }]), // 6 (3+2+2=7)
  rows_grid([{ y0: 0, y1: 38, xs: [0, 42, 100] }, { y0: 38, y1: 72, xs: [0, 28, 62, 100] }, { y0: 72, y1: 100, xs: [0, 52, 100] }]), // 7 (2+3+2=7)
  rows_grid([{ y0: 0, y1: 28, xs: [0, 32, 68, 100] }, { y0: 28, y1: 62, xs: [0, 55, 100] }, { y0: 62, y1: 100, xs: [0, 25, 62, 100] }]), // 8 (3+2+3=8 oops) — fix below
  rows_grid([{ y0: 0, y1: 25, xs: [0, 32, 65, 100] }, { y0: 25, y1: 62, xs: [0, 52, 100] }, { y0: 62, y1: 100, xs: [0, 42, 100] }]),     // 9 (3+2+2=7)
  rows_grid([{ y0: 0, y1: 15, xs: [0, 100] }, { y0: 15, y1: 55, xs: [0, 22, 55, 100] }, { y0: 55, y1: 100, xs: [0, 28, 62, 100] }])     // 10 (1+3+3=7)
]
// Fix D6-8: above was 3+2+3=8. Replace with proper 7-piece layout.
D6[7] = rows_grid([
  { y0: 0, y1: 28, xs: [0, 32, 65, 100] },
  { y0: 28, y1: 62, xs: [0, 55, 100] },
  { y0: 62, y1: 100, xs: [0, 42, 100] },
]) // 3+2+2 = 7

export const TANGRAMS = { 1: D1, 2: D2, 3: D3, 4: D4, 5: D5, 6: D6 }

export function polygonCentroid(pointsStr) {
  const pts = pointsStr.trim().split(/\s+/).map(p => p.split(',').map(Number))
  let cx = 0, cy = 0, area = 0
  for (let i = 0, n = pts.length; i < n; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % n]
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  area *= 0.5
  cx /= (6 * area)
  cy /= (6 * area)
  return { x: cx, y: cy }
}

export const PIECE_COLORS = [
  '#E85C3A', '#4A90D9', '#4CAF50', '#E8A838',
  '#9C27B0', '#26C6DA', '#EC407A'
]

export const PIECES_PER_DIFFICULTY = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 7 }
