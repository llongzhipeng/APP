// 全局状态、难度配置、位置题库、历史记录
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

// 房间中可放置物品的 6 个位置槽（横向 3 x 纵向 2）
// 顺序：1 左上、2 中上、3 右上、4 左下、5 中下、6 右下
export const POSITIONS = [
  { id: 1, key: 'posTopLeft',      x: 18, y: 32 },
  { id: 2, key: 'posTopCenter',    x: 50, y: 28 },
  { id: 3, key: 'posTopRight',     x: 82, y: 32 },
  { id: 4, key: 'posBottomLeft',   x: 20, y: 72 },
  { id: 5, key: 'posBottomCenter', x: 50, y: 76 },
  { id: 6, key: 'posBottomRight',  x: 80, y: 72 }
]

// 可高亮/摆放的物品类型
export const ITEM_TYPES = ['vase', 'book', 'clock', 'shirt', 'pants', 'skirt']

export const store = Vue.observable({
  lang: 'zh',
  history: []
})

export function setLang(l) { store.lang = l }

const HISTORY_KEY = 'mtm_pos_history_v1'

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

// 生成一次房间场景 + 题目（位置回忆）
// 返回 { scene, placements, question, cfg }
// placements: [{ item, pos, color, hi }]
// question: { type:'position', item, correct, options:[posId,...] }
export function makeRound(difficulty) {
  const cfg = DIFFICULTY[difficulty - 1]

  // 随机挑选 4 种物品，随机放入 4 个位置槽
  const itemsInRound = shuffle(ITEM_TYPES.slice()).slice(0, 4)
  const posSlots = shuffle(POSITIONS.slice()).slice(0, 4)

  // 前 cfg.highlights 个物品做高亮 —— 这些是可能被出题的物品
  const placements = itemsInRound.map((it, i) => ({
    item: it,
    pos: posSlots[i].id,
    color: pick(COLORS),
    hi: i < cfg.highlights
  }))

  const scene = {
    clock: { hour: rand(1, 12), minute: [0, 15, 30, 45][rand(0, 3)] },
    booksCount: rand(3, 5)
  }

  // 以第一个高亮物品为出题对象
  const target = placements.find(p => p.hi)
  const correctPos = target.pos
  const wrongCandidates = POSITIONS.map(p => p.id).filter(id => id !== correctPos)
  const options = shuffle([correctPos, ...shuffle(wrongCandidates).slice(0, 3)])

  const question = {
    type: 'position',
    item: target.item,
    correct: correctPos,
    options
  }

  return { scene, placements, question, cfg }
}

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function pick(arr) { return arr[rand(0, arr.length - 1)] }
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function posById(id) { return POSITIONS.find(p => p.id === id) }
