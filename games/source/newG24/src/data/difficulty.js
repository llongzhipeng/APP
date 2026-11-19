// 难度配置
// 每级：干扰项数量、记忆时间、答题时间、难度系数
export const DIFFICULTY = [
  { level: 1, leftDistractors: 0, rightDistractors: 0, similar: false, memoryTime: 4,   answerTime: 10, score: 1   },
  { level: 2, leftDistractors: 1, rightDistractors: 1, similar: false, memoryTime: 4,   answerTime: 10, score: 1.5 },
  { level: 3, leftDistractors: 1, rightDistractors: 1, similar: false, memoryTime: 4,   answerTime: 10, score: 2   },
  { level: 4, leftDistractors: 2, rightDistractors: 1, similar: true,  memoryTime: 3,   answerTime: 8,  score: 2.5 },
  { level: 5, leftDistractors: 2, rightDistractors: 2, similar: true,  memoryTime: 3,   answerTime: 8,  score: 3   },
  { level: 6, leftDistractors: 3, rightDistractors: 3, similar: true,  memoryTime: 3,   answerTime: 8,  score: 3.5 },
  { level: 7, leftDistractors: 4, rightDistractors: 4, similar: true,  memoryTime: 2.7, answerTime: 6,  score: 4   },
  { level: 8, leftDistractors: 5, rightDistractors: 4, similar: true,  memoryTime: 2.7, answerTime: 6,  score: 4.5 },
  { level: 9, leftDistractors: 5, rightDistractors: 5, similar: true,  memoryTime: 2.7, answerTime: 6,  score: 5   },
];

export function getDifficulty(level) {
  return DIFFICULTY[Math.max(0, Math.min(DIFFICULTY.length - 1, level - 1))];
}
