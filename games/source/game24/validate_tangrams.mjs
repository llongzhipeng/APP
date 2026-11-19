// Validation script for tangrams.js
import { TANGRAMS, PIECES_PER_DIFFICULTY } from './src/tangrams.js'

function polygonArea(pointsStr) {
  const pts = pointsStr.trim().split(/\s+/).map(p => p.split(',').map(Number))
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % pts.length]
    s += x0 * y1 - x1 * y0
  }
  return Math.abs(s) / 2
}

// Canonical key for a polygon's SHAPE (ignoring position, rotation, mirror)
// We compute sorted side lengths, rounded to 2 decimals — same shape -> same key.
function shapeKey(pointsStr) {
  const pts = pointsStr.trim().split(/\s+/).map(p => p.split(',').map(Number))
  const sides = []
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % pts.length]
    sides.push(Math.hypot(x1 - x0, y1 - y0).toFixed(2))
  }
  sides.sort()
  // Include area to distinguish polygons that happen to share sides
  const area = polygonArea(pointsStr).toFixed(2)
  return `${area}|${sides.join(',')}|n=${pts.length}`
}

let errors = 0
for (const diff of [1, 2, 3, 4, 5, 6]) {
  const designs = TANGRAMS[diff]
  const expected = PIECES_PER_DIFFICULTY[diff]
  if (!designs || designs.length !== 10) {
    console.log(`✗ D${diff}: expected 10 designs, got ${designs?.length}`)
    errors++
    continue
  }
  designs.forEach((design, di) => {
    const tag = `D${diff}-${di + 1}`
    if (design.length !== expected) {
      console.log(`✗ ${tag}: expected ${expected} pieces, got ${design.length}`)
      errors++
    }
    let totalArea = 0
    const keys = new Set()
    let dup = false
    for (const pts of design) {
      totalArea += polygonArea(pts)
      const k = shapeKey(pts)
      if (keys.has(k)) dup = true
      keys.add(k)
    }
    if (Math.abs(totalArea - 10000) > 0.5) {
      console.log(`✗ ${tag}: total area ${totalArea.toFixed(2)} != 10000`)
      errors++
    }
    if (dup) {
      console.log(`✗ ${tag}: contains duplicate piece shapes`)
      errors++
    }
  })
}
console.log(errors === 0 ? `\n✓ All 60 designs OK` : `\n${errors} error(s)`)
