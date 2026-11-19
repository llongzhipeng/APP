/**
 * 游戏难度配置
 * 包含6个难度等级的详细设置
 */

export const DIFFICULTY_LEVELS = [
  {
    level: 1,
    name: '难度1',
    nameEn: 'Level 1',
    targetRange: [7, 20],       // 目标值范围
    cardCount: 8,               // 卡片数量
    cardValueRange: [1, 15],    // 卡片数值范围（确保能组成目标值）
    timeLimit: 10,              // 答题时间限制（秒）
    coefficient: 1,             // 难度系数
    rule: 2,                    // 规则：2张卡片相加
    description: '请快速找出2个相加起来等于目标值的数字卡片，并依次点击它们',
    descriptionEn: 'Find 2 cards that add up to the target value and click them'
  },
  {
    level: 2,
    name: '难度2',
    nameEn: 'Level 2',
    targetRange: [7, 20],
    cardCount: 10,
    cardValueRange: [1, 15],
    timeLimit: 10,
    coefficient: 1.5,
    rule: 2,
    description: '请快速找出2个相加起来等于目标值的数字卡片，并依次点击它们',
    descriptionEn: 'Find 2 cards that add up to the target value and click them'
  },
  {
    level: 3,
    name: '难度3',
    nameEn: 'Level 3',
    targetRange: [7, 20],
    cardCount: 12,
    cardValueRange: [1, 15],
    timeLimit: 10,
    coefficient: 2,
    rule: 2,
    description: '请快速找出2个相加起来等于目标值的数字卡片，并依次点击它们',
    descriptionEn: 'Find 2 cards that add up to the target value and click them'
  },
  {
    level: 4,
    name: '难度4',
    nameEn: 'Level 4',
    targetRange: [10, 30],
    cardCount: 14,
    cardValueRange: [1, 20],
    timeLimit: 10,
    coefficient: 2.5,
    rule: 2,
    description: '请快速找出2个相加起来等于目标值的数字卡片，并依次点击它们',
    descriptionEn: 'Find 2 cards that add up to the target value and click them'
  },
  {
    level: 5,
    name: '难度5',
    nameEn: 'Level 5',
    targetRange: [10, 30],
    cardCount: 16,
    cardValueRange: [1, 20],
    timeLimit: 10,
    coefficient: 3,
    rule: 2,
    description: '请快速找出2个相加起来等于目标值的数字卡片，并依次点击它们',
    descriptionEn: 'Find 2 cards that add up to the target value and click them'
  },
  {
    level: 6,
    name: '难度6',
    nameEn: 'Level 6',
    targetRange: [10, 30],
    cardCount: 18,
    cardValueRange: [1, 20],
    timeLimit: 10,
    coefficient: 3.5,
    rule: 2,
    description: '请快速找出2个相加起来等于目标值的数字卡片，并依次点击它们',
    descriptionEn: 'Find 2 cards that add up to the target value and click them'
  }
];

/**
 * 根据难度等级获取配置
 * @param {number} level - 难度等级 (1-6)
 * @returns {object} 难度配置对象
 */
export function getDifficultyConfig(level) {
  const config = DIFFICULTY_LEVELS.find(d => d.level === level);
  return config || DIFFICULTY_LEVELS[0];
}

/**
 * 难度调整规则
 */
export const DIFFICULTY_ADJUSTMENT = {
  CHECK_INTERVAL: 30,        // 每30秒检查一次
  UPGRADE_THRESHOLD: 0.9,    // 正确率>90%提升难度
  DOWNGRADE_THRESHOLD: 0.7,  // 正确率<70%降低难度
  MIN_LEVEL: 1,              // 最低难度
  MAX_LEVEL: 6               // 最高难度
};

/**
 * 训练时长选项（秒）
 */
export const DURATION_OPTIONS = [
  { value: 60, label: '1分钟', labelEn: '1 Minute' },
  { value: 180, label: '3分钟', labelEn: '3 Minutes' },
  { value: 300, label: '5分钟', labelEn: '5 Minutes' }
];
