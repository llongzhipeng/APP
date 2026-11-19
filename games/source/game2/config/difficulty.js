// 难度等级配置表（按照README要求配置）
export const DIFFICULTY_LEVELS = [
  {
    level: 1,
    elementCount: 2,
    displayTime: 5,
    removeCount: 1,
    answerTime: 10,
    coefficient: 1
  },
  {
    level: 2,
    elementCount: 3,
    displayTime: 8,
    removeCount: 1,
    answerTime: 10,
    coefficient: 1.5
  },
  {
    level: 3,
    elementCount: 3,
    displayTime: 6,
    removeCount: 1,
    answerTime: 10,
    coefficient: 2
  },
  {
    level: 4,
    elementCount: 4,
    displayTime: 10,
    removeCount: 2,
    answerTime: 10,
    coefficient: 2.5
  },
  {
    level: 5,
    elementCount: 4,
    displayTime: 8,
    removeCount: 2,
    answerTime: 10,
    coefficient: 3
  },
  {
    level: 6,
    elementCount: 5,
    displayTime: 10,
    removeCount: 2,
    answerTime: 10,
    coefficient: 3.5
  }
]

// 根据等级获取难度配置
export function getDifficultyConfig(level) {
  return DIFFICULTY_LEVELS.find(d => d.level === level) || DIFFICULTY_LEVELS[0]
}

// 获取最大难度等级
export function getMaxDifficulty() {
  return DIFFICULTY_LEVELS.length
}

// 获取最小难度等级
export function getMinDifficulty() {
  return 1
}
