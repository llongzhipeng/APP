import { IMAGES, POLY_PATHS, COLORS } from './config.js'

import { resolveImage } from '../assets'
function rand(arr, exclude = []) {
  const pool = arr.filter((_, i) => !exclude.includes(i))
  return pool[Math.floor(Math.random() * pool.length)]
}
function randIdx(arr, exclude = []) {
  const pool = arr.map((_, i) => i).filter(i => !exclude.includes(i))
  return pool[Math.floor(Math.random() * pool.length)]
}
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function pickColors(n, exclude = []) {
  const pool = COLORS.map((_, i) => i).filter(i => !exclude.includes(i))
  const result = []
  while (result.length < n) {
    const idx = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    result.push(idx)
  }
  return result
}

// Level 1: images
export function genLevel1() {
  const all = IMAGES.map((_, i) => i)
  const targetIdx = randIdx(IMAGES)
  const distIdxs = shuffle(all.filter(i => i !== targetIdx)).slice(0, 3)
  const target = { type: 'image', src: resolveImage(`/images/${IMAGES[targetIdx]}.png`), id: targetIdx }
  const options = shuffle([target, ...distIdxs.map(i => ({ type: 'image', src: resolveImage(`/images/${IMAGES[i]}.png`), id: i }))])
  return { targets: [target], options, correctId: target.id }
}

// Level 2: basic shapes (circle, rect, triangle) + solid color
const BASIC = ['circle', 'rect', 'triangle']
export function genLevel2() {
  const form = rand(BASIC)
  const [fillIdx] = pickColors(1)
  const target = { type: 'basic', form, fill: COLORS[fillIdx], id: `${form}-${fillIdx}` }

  const otherForms = BASIC.filter(f => f !== form)
  const [c2] = pickColors(1, [fillIdx])
  const distractors = [
    { type: 'basic', form: otherForms[0], fill: COLORS[fillIdx], id: `${otherForms[0]}-${fillIdx}` },
    { type: 'basic', form: otherForms[1], fill: COLORS[fillIdx], id: `${otherForms[1]}-${fillIdx}` },
    { type: 'basic', form, fill: COLORS[c2], id: `${form}-${c2}` },
  ]
  return { targets: [target], options: shuffle([target, ...distractors]), correctId: target.id }
}

// Level 3: irregular polygon + single color
export function genLevel3() {
  const pathIdx = randIdx(POLY_PATHS)
  const [fillIdx] = pickColors(1)
  const target = { type: 'poly', path: pathIdx, fill: COLORS[fillIdx], id: `p${pathIdx}-${fillIdx}` }

  const p2 = randIdx(POLY_PATHS, [pathIdx])
  const p3 = randIdx(POLY_PATHS, [pathIdx, p2])
  const [c2] = pickColors(1, [fillIdx])
  const distractors = [
    { type: 'poly', path: p2, fill: COLORS[fillIdx], id: `p${p2}-${fillIdx}` },
    { type: 'poly', path: pathIdx, fill: COLORS[c2], id: `p${pathIdx}-${c2}` },
    { type: 'poly', path: p3, fill: COLORS[c2], id: `p${p3}-${c2}` },
  ]
  return { targets: [target], options: shuffle([target, ...distractors]), correctId: target.id }
}

// Level 4: irregular polygon + two colors (fill + stroke)
export function genLevel4() {
  const pathIdx = randIdx(POLY_PATHS)
  const [fillIdx, strokeIdx] = pickColors(2)
  const target = { type: 'poly', path: pathIdx, fill: COLORS[fillIdx], stroke: COLORS[strokeIdx], id: `p${pathIdx}-${fillIdx}-${strokeIdx}` }

  const p2 = randIdx(POLY_PATHS, [pathIdx])
  const distractors = [
    { type: 'poly', path: pathIdx, fill: COLORS[strokeIdx], stroke: COLORS[fillIdx], id: `p${pathIdx}-${strokeIdx}-${fillIdx}` },
    { type: 'poly', path: p2, fill: COLORS[fillIdx], stroke: COLORS[strokeIdx], id: `p${p2}-${fillIdx}-${strokeIdx}` },
    { type: 'poly', path: p2, fill: COLORS[strokeIdx], stroke: COLORS[fillIdx], id: `p${p2}-${strokeIdx}-${fillIdx}` },
  ]
  return { targets: [target], options: shuffle([target, ...distractors]), correctId: target.id }
}

// Level 5-6: two items, each with two colors
function makeMultiItem(paths, fills, strokes) {
  return {
    type: 'multi',
    items: [
      { path: paths[0], fill: fills[0], stroke: strokes[0] },
      { path: paths[1], fill: fills[1], stroke: strokes[1] },
    ],
    id: `m${paths[0]}-${fills[0]}-${strokes[0]}-${paths[1]}-${fills[1]}-${strokes[1]}`
  }
}
export function genLevel56() {
  const p1 = randIdx(POLY_PATHS)
  const p2 = randIdx(POLY_PATHS, [p1])
  const [f1, s1, f2, s2] = pickColors(4)
  const target = makeMultiItem([p1, p2], [COLORS[f1], COLORS[f2]], [COLORS[s1], COLORS[s2]])

  const p3 = randIdx(POLY_PATHS, [p1, p2])
  const distractors = [
    makeMultiItem([p3, p2], [COLORS[f1], COLORS[f2]], [COLORS[s1], COLORS[s2]]),
    makeMultiItem([p1, p2], [COLORS[s1], COLORS[f2]], [COLORS[f1], COLORS[s2]]),
    makeMultiItem([p1, p3], [COLORS[f1], COLORS[f2]], [COLORS[s1], COLORS[s2]]),
  ]
  return {
    targets: target.items.map(it => ({ type: 'poly', ...it })),
    options: shuffle([target, ...distractors]),
    correctId: target.id,
  }
}

export function generateQuestion(difficulty) {
  switch (difficulty) {
    case 1: return genLevel1()
    case 2: return genLevel2()
    case 3: return genLevel3()
    case 4: return genLevel4()
    case 5:
    case 6: return genLevel56()
    default: return genLevel1()
  }
}
