// Semantic word pools grouped by theme to make semantic encoding meaningful.
// Distractors are drawn from OTHER groups (semantic distractors from similar
// categories) so the training targets both order + semantic encoding.
export const WORDS = {
  zh: {
    fruit:    ['苹果','香蕉','葡萄','西瓜','橙子','桃子','梨','草莓','菠萝','樱桃'],
    animal:   ['老虎','熊猫','兔子','大象','狐狸','长颈鹿','企鹅','海豚','松鼠','狮子'],
    vehicle:  ['汽车','火车','飞机','轮船','自行车','公交车','地铁','摩托车','热气球','出租车'],
    color:    ['红色','蓝色','绿色','黄色','紫色','橙色','粉色','黑色','白色','棕色'],
    food:     ['米饭','面条','饺子','包子','披萨','汉堡','蛋糕','面包','牛奶','酸奶'],
    body:     ['眼睛','鼻子','耳朵','嘴巴','手指','脚趾','头发','眉毛','肩膀','膝盖'],
    nature:   ['太阳','月亮','星星','云朵','大海','高山','河流','森林','沙漠','彩虹'],
    school:   ['铅笔','橡皮','课本','书包','黑板','粉笔','尺子','作业','老师','同学'],
  },
  en: {
    fruit:    ['apple','banana','grape','melon','orange','peach','pear','berry','pineapple','cherry'],
    animal:   ['tiger','panda','rabbit','elephant','fox','giraffe','penguin','dolphin','squirrel','lion'],
    vehicle:  ['car','train','plane','ship','bike','bus','subway','scooter','balloon','taxi'],
    color:    ['red','blue','green','yellow','purple','orange','pink','black','white','brown'],
    food:     ['rice','noodle','dumpling','bun','pizza','burger','cake','bread','milk','yogurt'],
    body:     ['eye','nose','ear','mouth','finger','toe','hair','brow','shoulder','knee'],
    nature:   ['sun','moon','star','cloud','sea','mountain','river','forest','desert','rainbow'],
    school:   ['pencil','eraser','book','bag','board','chalk','ruler','homework','teacher','friend'],
  }
}

// Difficulty table from spec
export const DIFF = [
  { level: 1, count: 2, distract: 0, coeff: 1.0 },
  { level: 2, count: 3, distract: 1, coeff: 1.5 },
  { level: 3, count: 3, distract: 2, coeff: 2.0 },
  { level: 4, count: 4, distract: 1, coeff: 2.5 },
  { level: 5, count: 4, distract: 1, coeff: 3.0 },
  { level: 6, count: 5, distract: 0, coeff: 3.5 },
]

function pickN(arr, n) {
  const c = arr.slice()
  const out = []
  while (out.length < n && c.length) {
    out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0])
  }
  return out
}

// Build a question for given level and language
export function buildQuestion(level, lang) {
  const cfg = DIFF.find(d => d.level === level)
  const pools = WORDS[lang]
  const themeKeys = Object.keys(pools)
  const primaryKey = themeKeys[Math.floor(Math.random() * themeKeys.length)]
  const target = pickN(pools[primaryKey], cfg.count)

  let distractors = []
  if (cfg.distract > 0) {
    // pull distractors from a different (semantically close) pool
    const others = themeKeys.filter(k => k !== primaryKey)
    const dKey = others[Math.floor(Math.random() * others.length)]
    distractors = pickN(pools[dKey], cfg.distract)
  }
  // shuffle final board
  const board = pickN([...target, ...distractors], target.length + distractors.length)
  return { target, board, coeff: cfg.coeff, level }
}
