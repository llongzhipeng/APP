// 难度配置文件
export const difficultyConfig = [
  {
    level: 1,
    time: 15,
    coefficient: 1,
    needInterference: false,
    rotation: false
  },
  {
    level: 2,
    time: 10,
    coefficient: 1.5,
    needInterference: false,
    rotation: false
  },
  {
    level: 3,
    time: 10,
    coefficient: 2,
    needInterference: false,
    rotation: true
  },
  {
    level: 4,
    time: 10,
    coefficient: 2.5,
    needInterference: true,
    rotation: false
  },
  {
    level: 5,
    time: 10,
    coefficient: 3,
    needInterference: true,
    rotation: true
  },
  {
    level: 6,
    time: 8,
    coefficient: 3.5,
    needInterference: true,
    rotation: true
  }
];

// 难度调整规则
export const difficultyAdjustment = {
  minAnswers: 3,        // 最少答题数才进行难度调整
  upgradeThreshold: 0.9, // 升级阈值 (90%)
  downgradeThreshold: 0.7, // 降级阈值 (70%)
  timeWindow: 30000      // 统计时间窗口 (30秒)
};
