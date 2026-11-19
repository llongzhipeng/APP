// 出题引擎：加权抽字 + 干扰项生成 + 频次调整
import { LR_HANZI, SIMILAR, COMMON_PARTS } from '../data/hanzi.js';
import { getDifficulty } from '../data/difficulty.js';

// 每个汉字的权重记录：{char: weight}
// 初始权重 1，答对 *0.6（降频），答错 *1.6（升频），下限 0.15，上限 5
export function createWeights() {
  const w = {};
  LR_HANZI.forEach(h => { w[h.char] = 1; });
  return w;
}

export function updateWeight(weights, char, correct) {
  const cur = weights[char] != null ? weights[char] : 1;
  const next = correct ? cur * 0.6 : cur * 1.6;
  weights[char] = Math.max(0.15, Math.min(5, next));
}

// 加权随机抽取一个字
function weightedPick(weights) {
  const total = LR_HANZI.reduce((s, h) => s + (weights[h.char] != null ? weights[h.char] : 1), 0);
  let r = Math.random() * total;
  for (const h of LR_HANZI) {
    r -= (weights[h.char] != null ? weights[h.char] : 1);
    if (r <= 0) return h;
  }
  return LR_HANZI[LR_HANZI.length - 1];
}

// 从池子里挑 n 个不同的、且不等于 exclude 的部件
function pickDistractors(pool, n, excludeSet) {
  const candidates = pool.filter(p => !excludeSet.has(p));
  // 洗牌
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, n);
}

// 生成一道题
export function generateQuestion(level, weights) {
  const cfg = getDifficulty(level);
  const hz = weightedPick(weights);

  // 干扰项池
  const leftSimilar = SIMILAR[hz.left] || [];
  const rightSimilar = SIMILAR[hz.right] || [];

  const excludeLeft = new Set([hz.left, hz.right]);
  const excludeRight = new Set([hz.right, hz.left]);

  let leftDistractors, rightDistractors;
  if (cfg.similar) {
    // 优先用相似部件
    leftDistractors = pickDistractors(
      [...leftSimilar, ...COMMON_PARTS],
      cfg.leftDistractors,
      excludeLeft
    );
    rightDistractors = pickDistractors(
      [...rightSimilar, ...COMMON_PARTS],
      cfg.rightDistractors,
      excludeRight
    );
  } else {
    leftDistractors = pickDistractors(COMMON_PARTS, cfg.leftDistractors, excludeLeft);
    rightDistractors = pickDistractors(COMMON_PARTS, cfg.rightDistractors, excludeRight);
  }

  // 左侧候选（正确 + 干扰），并打乱
  const leftOptions = shuffle([hz.left, ...leftDistractors]);
  const rightOptions = shuffle([hz.right, ...rightDistractors]);

  return {
    char: hz.char,
    left: hz.left,
    right: hz.right,
    leftOptions,
    rightOptions,
    memoryTime: cfg.memoryTime,
    answerTime: cfg.answerTime,
    scoreMultiplier: cfg.score,
    level,
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
