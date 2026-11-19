export const LEVELS = [
  { level: 1, blocks: 2, colors: 2, memTime: 5, coeff: 1 },
  { level: 2, blocks: 3, colors: 2, memTime: 5, coeff: 1.5 },
  { level: 3, blocks: 4, colors: 3, memTime: 5, coeff: 2 },
  { level: 4, blocks: 5, colors: 3, memTime: 5, coeff: 2.5 },
  { level: 5, blocks: 6, colors: 4, memTime: 5, coeff: 3 },
  { level: 6, blocks: 7, colors: 4, memTime: 5, coeff: 3.5 },
]

export const BLOCK_COLORS = [
  { hex: '#E74C3C', zh: '红色', en: 'Red' },
  { hex: '#3498DB', zh: '蓝色', en: 'Blue' },
  { hex: '#2ECC71', zh: '绿色', en: 'Green' },
  { hex: '#F1C40F', zh: '黄色', en: 'Yellow' },
  { hex: '#9B59B6', zh: '紫色', en: 'Purple' },
  { hex: '#E67E22', zh: '橙色', en: 'Orange' },
]

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateRound(level) {
  const cfg = LEVELS[level - 1]
  const usedColors = shuffle(BLOCK_COLORS).slice(0, cfg.colors)
  const blocks = []
  for (let i = 0; i < cfg.blocks; i++) {
    blocks.push(usedColors[i % cfg.colors])
  }
  const shuffledBlocks = shuffle(blocks)
  const targetColor = usedColors[Math.floor(Math.random() * usedColors.length)]
  return { blocks: shuffledBlocks, targetColor }
}

export function saveRecord(record) {
  const records = JSON.parse(localStorage.getItem('colorMemoryRecords') || '[]')
  records.unshift(record)
  localStorage.setItem('colorMemoryRecords', JSON.stringify(records.slice(0, 100)))
}

export function getRecords() {
  return JSON.parse(localStorage.getItem('colorMemoryRecords') || '[]')
}
