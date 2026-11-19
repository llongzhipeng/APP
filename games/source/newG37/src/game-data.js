// 游戏数据配置：难度、物品、桶

// 难度配置
export const DIFFICULTY = {
  1: { level: 1, bins: 2, speed: 60, factor: 1,   mode: 'color'    }, // 慢
  2: { level: 2, bins: 3, speed: 90, factor: 1.5, mode: 'color'    }, // 中
  3: { level: 3, bins: 4, speed: 130, factor: 2,   mode: 'color'    }, // 较快
  4: { level: 4, bins: 2, speed: 60, factor: 2.5, mode: 'recycle'  }, // 慢
  5: { level: 5, bins: 2, speed: 90, factor: 3,   mode: 'recycle'  }, // 中
  6: { level: 6, bins: 2, speed: 130, factor: 3.5, mode: 'metal'    }  // 较快
}

// 颜色桶（用于难度 1-3）
export const COLOR_BINS = [
  { id: 'red',    key: 'binRed',    color: '#ff4d4f', gradient: 'linear-gradient(180deg, #ff6b6b, #d9363e)' },
  { id: 'blue',   key: 'binBlue',   color: '#1890ff', gradient: 'linear-gradient(180deg, #4facfe, #0c72d1)' },
  { id: 'green',  key: 'binGreen',  color: '#52c41a', gradient: 'linear-gradient(180deg, #7ed957, #2e9d19)' },
  { id: 'yellow', key: 'binYellow', color: '#faad14', gradient: 'linear-gradient(180deg, #ffd453, #d18d0a)' },
  { id: 'purple', key: 'binPurple', color: '#9254de', gradient: 'linear-gradient(180deg, #b37feb, #6b3fb2)' }
]

// 可回收物品
const RECYCLABLE_ITEMS = [
  { emoji: '📰', name: { zh: '报纸', en: 'Newspaper' } },
  { emoji: '📚', name: { zh: '书本', en: 'Book' } },
  { emoji: '📦', name: { zh: '纸箱', en: 'Box' } },
  { emoji: '🥤', name: { zh: '饮料瓶', en: 'Bottle' } },
  { emoji: '🍾', name: { zh: '玻璃瓶', en: 'Glass Bottle' } },
  { emoji: '🥫', name: { zh: '易拉罐', en: 'Can' } },
  { emoji: '🎒', name: { zh: '背包', en: 'Backpack' } },
  { emoji: '🧸', name: { zh: '布偶玩具', en: 'Plush Toy' } }
]

// 不可回收物品
const NON_RECYCLABLE_ITEMS = [
  { emoji: '🍚', name: { zh: '剩饭', en: 'Leftover' } },
  { emoji: '🍌', name: { zh: '果皮', en: 'Peel' } },
  { emoji: '🔋', name: { zh: '废电池', en: 'Battery' } },
  { emoji: '🚬', name: { zh: '烟蒂', en: 'Cigarette Butt' } },
  { emoji: '🍈', name: { zh: '榴莲壳', en: 'Durian Shell' } }
]

// 金属物品
const METAL_ITEMS = [
  { emoji: '🍳', name: { zh: '铁锅', en: 'Iron Pot' } },
  { emoji: '🔪', name: { zh: '菜刀', en: 'Knife' } },
  { emoji: '✂️', name: { zh: '剪刀', en: 'Scissors' } },
  { emoji: '🔑', name: { zh: '钥匙', en: 'Key' } },
  { emoji: '🔩', name: { zh: '螺丝钉', en: 'Screw' } },
  { emoji: '🔨', name: { zh: '锤子', en: 'Hammer' } },
  { emoji: '🗝️', name: { zh: '门锁', en: 'Lock' } }
]

// 非金属物品
const NON_METAL_ITEMS = [
  { emoji: '🛍️', name: { zh: '塑料袋', en: 'Plastic Bag' } },
  { emoji: '🧴', name: { zh: '塑料瓶', en: 'Plastic Bottle' } },
  { emoji: '🧩', name: { zh: '玩具', en: 'Toy' } },
  { emoji: '🍶', name: { zh: '玻璃', en: 'Glass' } },
  { emoji: '🏺', name: { zh: '陶瓷', en: 'Ceramic' } },
  { emoji: '🪵', name: { zh: '木材', en: 'Wood' } },
  { emoji: '🧵', name: { zh: '纺织品', en: 'Textile' } }
]

// 颜色物品池（图形化：每个物品一个几何形状 + 颜色）
const COLOR_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']

// 生成颜色题（简单：单一颜色特征）
export function pickColorTask(binCount) {
  const bins = COLOR_BINS.slice(0, binCount)
  const targetBin = bins[Math.floor(Math.random() * bins.length)]
  const shape = COLOR_SHAPES[Math.floor(Math.random() * COLOR_SHAPES.length)]
  return {
    item: {
      type: 'color',
      color: targetBin.color,
      gradient: targetBin.gradient,
      shape,
      binId: targetBin.id
    },
    bins,
    ruleKey: targetBin.key,   // 用于显示当前分类项目
    ruleColor: targetBin.color
  }
}

// 生成可回收题
export function pickRecycleTask() {
  const bins = [
    { id: 'recycle',   key: 'binRecycle',   color: '#13c2c2', gradient: 'linear-gradient(180deg, #5ce8e8, #0a8a8a)' },
    { id: 'noRecycle', key: 'binNoRecycle', color: '#8c8c8c', gradient: 'linear-gradient(180deg, #bfbfbf, #595959)' }
  ]
  const pool = Math.random() < 0.5 ? RECYCLABLE_ITEMS : NON_RECYCLABLE_ITEMS
  const item = pool[Math.floor(Math.random() * pool.length)]
  const binId = pool === RECYCLABLE_ITEMS ? 'recycle' : 'noRecycle'
  return {
    item: { type: 'emoji', emoji: item.emoji, name: item.name, binId },
    bins,
    ruleKey: null,
    ruleText: { zh: '按可回收 / 不可回收分类', en: 'Sort by Recyclable / Non-Recyclable' }
  }
}

// 生成金属题
export function pickMetalTask() {
  const bins = [
    { id: 'metal',    key: 'binMetal',    color: '#5b8def', gradient: 'linear-gradient(180deg, #8fb3ff, #3a5fb0)' },
    { id: 'nonMetal', key: 'binNonMetal', color: '#f759ab', gradient: 'linear-gradient(180deg, #ff85c0, #c41d7f)' }
  ]
  const pool = Math.random() < 0.5 ? METAL_ITEMS : NON_METAL_ITEMS
  const item = pool[Math.floor(Math.random() * pool.length)]
  const binId = pool === METAL_ITEMS ? 'metal' : 'nonMetal'
  return {
    item: { type: 'emoji', emoji: item.emoji, name: item.name, binId },
    bins,
    ruleKey: null,
    ruleText: { zh: '按金属 / 非金属分类', en: 'Sort by Metal / Non-Metal' }
  }
}

export function pickTask(level) {
  const cfg = DIFFICULTY[level]
  if (cfg.mode === 'color')   return { ...pickColorTask(cfg.bins), difficulty: cfg }
  if (cfg.mode === 'recycle') return { ...pickRecycleTask(), difficulty: cfg }
  if (cfg.mode === 'metal')   return { ...pickMetalTask(), difficulty: cfg }
}
