// 全局状态、难度配置、题库、历史记录
import Vue from 'vue'

// 难度表：[等级, 高亮数量, 观察秒, 系数]
export const DIFFICULTY = [
  { level: 1, highlights: 1, viewTime: 5, coef: 1 },
  { level: 2, highlights: 1, viewTime: 4, coef: 1.5 },
  { level: 3, highlights: 1, viewTime: 3, coef: 2 },
  { level: 4, highlights: 2, viewTime: 5, coef: 2.5 },
  { level: 5, highlights: 2, viewTime: 4, coef: 3 },
  { level: 6, highlights: 2, viewTime: 3, coef: 3.5 }
]

export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white']
export const COLOR_HEX = {
  red: '#e74c3c', blue: '#3498db', green: '#2ecc71', yellow: '#f1c40f',
  purple: '#9b59b6', pink: '#ff8fbd', orange: '#e67e22', white: '#f5f5f5'
}

// 可高亮的物品类型
export const ITEM_TYPES = ['vase', 'book', 'clock', 'shirt', 'pants', 'skirt']

export const store = Vue.observable({
  lang: 'zh',
  history: []
})

export function setLang(l) { store.lang = l }

const HISTORY_KEY = 'mtm_history_v1'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    store.history = raw ? JSON.parse(raw) : []
  } catch (e) { store.history = [] }
}

export function saveHistoryItem(item) {
  store.history.unshift(item)
  if (store.history.length > 50) store.history.length = 50
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(store.history)) } catch (e) {}
}

export function clearHistory() {
  store.history = []
  try { localStorage.removeItem(HISTORY_KEY) } catch (e) {}
}

// 生成一次房间场景 + 题目
// 返回 { scene, question }
// scene 描述房间当前每个物品的状态（颜色、数量、时间等），并标记哪些被高亮
// question 描述这一题问什么
export function makeRound(difficulty) {
  const cfg = DIFFICULTY[difficulty - 1]
  // 基础场景：所有物品固定但颜色/数量随机
  const scene = {
    clock: { hour: rand(1, 12), minute: [0, 15, 30, 45][rand(0, 3)] },
    books: makeBooks(),
    vase: { color: pick(COLORS) },
    shirt: { color: pick(COLORS) },
    pants: { color: pick(COLORS) },
    skirt: { color: pick(COLORS) }
  }

  // 选择高亮物品（按数量），基于 cfg.highlights
  const candidates = ['vase', 'book', 'clock', 'shirt', 'pants', 'skirt']
  const highlights = shuffle(candidates).slice(0, cfg.highlights)

  // 出题：以第一个高亮物品出题
  const target = highlights[0]
  let question = null
  if (target === 'vase') {
    question = colorQ('vase', scene.vase.color)
  } else if (target === 'book') {
    question = countQ(scene.books.length)
  } else if (target === 'clock') {
    question = clockQ(scene.clock)
  } else if (target === 'shirt') {
    question = colorQ('shirt', scene.shirt.color)
  } else if (target === 'pants') {
    question = colorQ('pants', scene.pants.color)
  } else if (target === 'skirt') {
    question = colorQ('skirt', scene.skirt.color)
  }

  return { scene, highlights, question, cfg }
}

function makeBooks() {
  const n = rand(3, 6)
  const arr = []
  for (let i = 0; i < n; i++) arr.push({ color: pick(COLORS) })
  return arr
}

function colorQ(itemKey, correctColor) {
  const opts = shuffle([correctColor, ...shuffle(COLORS.filter(c => c !== correctColor)).slice(0, 3)])
  return { type: 'color', item: itemKey, correct: correctColor, options: opts }
}
function countQ(correct) {
  const set = new Set([correct])
  while (set.size < 4) set.add(rand(3, 7))
  return { type: 'count', correct, options: shuffle([...set]) }
}
function clockQ(clock) {
  const correct = `${pad(clock.hour)}:${pad(clock.minute)}`
  const set = new Set([correct])
  while (set.size < 4) {
    const h = rand(1, 12), m = [0, 15, 30, 45][rand(0, 3)]
    set.add(`${pad(h)}:${pad(m)}`)
  }
  return { type: 'clock', correct, options: shuffle([...set]) }
}

function pad(n) { return String(n).padStart(2, '0') }
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function pick(arr) { return arr[rand(0, arr.length - 1)] }
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
