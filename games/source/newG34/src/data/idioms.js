// Idiom pools backed by /public/images/{simple,medium,abstract}/{n}.png
import { resolveImage } from '../assets.js'

const SIMPLE_ANSWERS = [
  '井底之蛙','画蛇添足','滴水穿石','盲人摸象','守株待兔',
  '对牛弹琴','狐假虎威','亡羊补牢','刻舟求剑','拔苗助长',
  '走马观花','一箭双雕','雪中送炭','胸有成竹','守口如瓶',
  '程门立雪','班门弄斧','画龙点睛','四面楚歌','掩耳盗铃',
];

const MEDIUM_ANSWERS = [
  '打草惊蛇','杯水车薪','掩耳盗铃','对牛弹琴','指鹿为马',
  '螳臂当车','凿壁偷光','口是心非','平分秋色','颠三倒四',
];

const ABSTRACT_ANSWERS = [
  '半信半疑','无中生有','独具匠心','了如指掌','旁门左道',
  '人去楼空','任重道远','弱不禁风','三五成群','针锋相对',
];

/**
 * <summary>
 * 构建成语题库，图片路径经 resolveImage 解析
 * </summary>
 */
function buildBank(folder, answers) {
  return answers.map((answer, i) => ({
    answer,
    image: resolveImage(`/images/${folder}/${i + 1}.png`),
  }));
}

export const POOLS = {
  simple:   buildBank('simple',   SIMPLE_ANSWERS),
  medium:   buildBank('medium',   MEDIUM_ANSWERS),
  abstract: buildBank('abstract', ABSTRACT_ANSWERS),
};

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw a question that isn't in `avoid[]`. Falls back to any if pool exhausted.
export function drawQuestion(poolName, optionsCount, avoid = []) {
  const pool = POOLS[poolName];
  const remaining = pool.filter((p) => !avoid.includes(p.image));
  const bank = remaining.length ? remaining : pool;
  const q = bank[Math.floor(Math.random() * bank.length)];
  let options = [];
  if (optionsCount > 0) {
    const distractors = shuffle(pool.filter((p) => p.answer !== q.answer).map((p) => p.answer));
    options = shuffle([q.answer, ...distractors.slice(0, optionsCount - 1)]);
  }
  return { answer: q.answer, image: q.image, options };
}
