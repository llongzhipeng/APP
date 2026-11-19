import { idiomsByTiers, CHAR_POOL } from '../data/idioms.js'
import { DIFFICULTY_CONFIG } from '../data/difficulty.js'

function randInt(n) { return Math.floor(Math.random() * n) }
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function pickN(arr, n, exclude = new Set()) {
  const pool = arr.filter(x => !exclude.has(x))
  return shuffle(pool).slice(0, n)
}

/**
 * 生成一道题
 * @param {number} level 1-6
 * @param {string[]} recentIdioms 最近出过的成语，避免重复
 * @returns {object} { idiom, blanks:[{index,answer}], options:[chars], meaning }
 */
export function generateQuestion(level, recentIdioms = []) {
  const cfg = DIFFICULTY_CONFIG[level]
  const pool = idiomsByTiers(cfg.tiers).filter(it => !recentIdioms.includes(it.idiom))
  const chosen = (pool.length ? pool : idiomsByTiers(cfg.tiers))[randInt(pool.length || idiomsByTiers(cfg.tiers).length)]

  const chars = chosen.idiom.split('')
  // 随机挑 blanks 个位置作为缺字
  const idxAll = shuffle([0, 1, 2, 3]).slice(0, cfg.blanks).sort((a, b) => a - b)
  const blanks = idxAll.map(i => ({ index: i, answer: chars[i] }))

  let options = []
  if (!cfg.input) {
    // 生成选项：包含正确答案 + 干扰字
    const correctChars = blanks.map(b => b.answer)
    const exclude = new Set(correctChars)
    const distractors = pickN(CHAR_POOL, cfg.options - correctChars.length, exclude)
    options = shuffle([...correctChars, ...distractors])
    // 若选项数量少于所需 blanks（如 level1 options=2 blanks=1），保证 options 数量正确
    if (options.length < cfg.options) {
      const extra = pickN(CHAR_POOL, cfg.options - options.length, new Set(options))
      options = shuffle([...options, ...extra])
    }
  }

  return {
    idiom: chosen.idiom,
    meaning: chosen.meaning,
    blanks,      // [{index, answer}]
    options,     // 供选择的候选字
    inputMode: cfg.input,
    level,
    coef: cfg.coef
  }
}
