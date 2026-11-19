import { resolveImage } from './assets'
export const DIFFICULTY_CONFIG = [
  null,
  { level: 1, types: 1, priceMin: 1, priceMax: 5,  allowMul: true,  coef: 1   },
  { level: 2, types: 1, priceMin: 1, priceMax: 10, allowMul: true,  coef: 1.5 },
  { level: 3, types: 2, priceMin: 1, priceMax: 5,  allowMul: false, coef: 2   },
  { level: 4, types: 2, priceMin: 1, priceMax: 10, allowMul: false, coef: 2.5 },
  { level: 5, types: 3, priceMin: 1, priceMax: 5,  allowMul: false, coef: 3   },
  { level: 6, types: 3, priceMin: 1, priceMax: 10, allowMul: true,  coef: 3.5 },
];

export const MAX_LEVEL = 6;
export const MIN_LEVEL = 1;
export const QUESTION_TIME_LIMIT = 15;

const TYPE_KEYS = ['adult', 'child', 'aged'];
const IMAGE_DIRS = { adult: 'adult', child: 'child', aged: 'the_aged' };

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickImage(typeKey) {
  const dir = IMAGE_DIRS[typeKey];
  const idx = randInt(1, 2);
  return resolveImage(`/images/${dir}/${idx}.png`);
}

function pickImages(typeKey, count) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(pickImage(typeKey));
  return arr;
}

export function generateQuestion(level) {
  const cfg = DIFFICULTY_CONFIG[level];
  const typeKeys = shuffle(TYPE_KEYS).slice(0, cfg.types);

  const groups = typeKeys.map((k) => {
    const price = randInt(cfg.priceMin, cfg.priceMax);
    let count;
    if (cfg.allowMul && cfg.types === 1) {
      count = randInt(2, 3);
    } else if (cfg.allowMul && cfg.types === 3) {
      count = randInt(1, 2);
    } else {
      count = 1;
    }
    return {
      typeKey: k,
      price,
      count,
      images: pickImages(k, count),
    };
  });

  const answer = groups.reduce((s, g) => s + g.price * g.count, 0);
  const options = buildOptions(answer);

  return { level, groups, answer, options };
}

function buildOptions(answer) {
  const set = new Set();
  set.add(answer);
  const spread = Math.max(3, Math.round(answer * 0.2));
  let guard = 0;
  while (set.size < 4 && guard < 50) {
    guard++;
    const delta = randInt(1, spread + 3) * (Math.random() < 0.5 ? -1 : 1);
    const v = answer + delta;
    if (v > 0 && v !== answer) set.add(v);
  }
  while (set.size < 4) {
    set.add(answer + set.size);
  }
  return shuffle([...set]);
}

const HISTORY_KEY = 'zoo_ticket_history';

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(record) {
  const list = loadHistory();
  list.unshift(record);
  const limited = list.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function formatDateTime(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
