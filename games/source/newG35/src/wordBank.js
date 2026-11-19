// Word bank keyed by complexity tier. Each entry has both zh and en form,
// carrying synonyms, antonyms, and unrelated distractors used to fill options.
//
// The game engine selects an entry, picks the correct answer (a syn or ant)
// and fills the remaining option slots from other entries' antonyms/synonyms
// plus a distractor pool. This keeps generated questions varied yet coherent.

export const DIFFICULTIES = [
  { level: 1, type: 'syn', complexity: 'common', options: 2, coef: 1 },
  { level: 2, type: 'syn', complexity: 'common', options: 3, coef: 1.5 },
  { level: 3, type: 'syn', complexity: 'mid',    options: 3, coef: 2 },
  { level: 4, type: 'ant', complexity: 'mid',    options: 4, coef: 2.5 },
  { level: 5, type: 'ant', complexity: 'hard',   options: 3, coef: 3 },
  { level: 6, type: 'ant', complexity: 'hard',   options: 4, coef: 3.5 },
]

const bank = {
  zh: {
    common: [
      { w: '高兴', syn: ['快乐', '开心', '愉快'], ant: ['悲伤', '难过', '沮丧'] },
      { w: '漂亮', syn: ['美丽', '好看', '俊俏'], ant: ['丑陋', '难看'] },
      { w: '快速', syn: ['迅速', '敏捷', '飞快'], ant: ['缓慢', '迟缓'] },
      { w: '聪明', syn: ['机灵', '伶俐', '智慧'], ant: ['愚笨', '迟钝'] },
      { w: '勇敢', syn: ['英勇', '无畏'],         ant: ['胆小', '怯懦'] },
      { w: '干净', syn: ['洁净', '整洁'],         ant: ['肮脏', '污秽'] },
      { w: '安静', syn: ['宁静', '寂静'],         ant: ['吵闹', '嘈杂'] },
      { w: '简单', syn: ['容易', '简易'],         ant: ['复杂', '困难'] },
      { w: '寒冷', syn: ['冰冷', '严寒'],         ant: ['温暖', '炎热'] },
      { w: '明亮', syn: ['明朗', '光亮'],         ant: ['昏暗', '阴暗'] },
      { w: '善良', syn: ['和善', '仁慈'],         ant: ['凶恶', '邪恶'] },
      { w: '富有', syn: ['富裕', '丰厚'],         ant: ['贫穷', '贫困'] },
    ],
    mid: [
      { w: '谨慎', syn: ['小心', '慎重', '审慎'], ant: ['鲁莽', '轻率'] },
      { w: '慷慨', syn: ['大方', '豪爽'],         ant: ['吝啬', '小气'] },
      { w: '谦虚', syn: ['谦逊', '虚心'],         ant: ['骄傲', '自大'] },
      { w: '勤奋', syn: ['努力', '刻苦'],         ant: ['懒惰', '懈怠'] },
      { w: '诚实', syn: ['老实', '真诚'],         ant: ['虚伪', '狡诈'] },
      { w: '温柔', syn: ['温和', '柔和'],         ant: ['粗暴', '暴躁'] },
      { w: '清晰', syn: ['明晰', '清楚'],         ant: ['模糊', '朦胧'] },
      { w: '宽阔', syn: ['宽广', '辽阔'],         ant: ['狭窄', '狭小'] },
      { w: '果断', syn: ['决断', '坚决'],         ant: ['犹豫', '迟疑'] },
      { w: '严肃', syn: ['庄重', '郑重'],         ant: ['轻浮', '随意'] },
      { w: '沉着', syn: ['冷静', '镇定'],         ant: ['慌张', '惊慌'] },
      { w: '崭新', syn: ['全新', '新颖'],         ant: ['陈旧', '破旧'] },
    ],
    hard: [
      { w: '斑斓', syn: ['绚烂', '斑驳', '缤纷'], ant: ['单调', '素净'] },
      { w: '惆怅', syn: ['忧郁', '怅然'],         ant: ['欢畅', '愉悦'] },
      { w: '睿智', syn: ['明智', '英明'],         ant: ['愚昧', '昏聩'] },
      { w: '缄默', syn: ['沉默', '沉寂'],         ant: ['喧哗', '喧嚣'] },
      { w: '迂回', syn: ['曲折', '迂曲'],         ant: ['直接', '径直'] },
      { w: '恪守', syn: ['遵守', '信守'],         ant: ['违背', '背弃'] },
      { w: '婉约', syn: ['含蓄', '委婉'],         ant: ['直白', '直率'] },
      { w: '熠熠', syn: ['闪耀', '璀璨'],         ant: ['黯淡', '暗淡'] },
      { w: '磅礴', syn: ['宏伟', '雄浑'],         ant: ['渺小', '微弱'] },
      { w: '娴熟', syn: ['熟练', '精通'],         ant: ['生疏', '陌生'] },
      { w: '恬静', syn: ['恬淡', '安详'],         ant: ['喧闹', '躁动'] },
      { w: '峻峭', syn: ['陡峭', '险峻'],         ant: ['平缓', '低平'] },
    ],
  },
  en: {
    common: [
      { w: 'Happy',     syn: ['Joyful', 'Cheerful', 'Glad'],   ant: ['Sad', 'Gloomy'] },
      { w: 'Beautiful', syn: ['Pretty', 'Lovely', 'Gorgeous'], ant: ['Ugly', 'Plain'] },
      { w: 'Fast',      syn: ['Quick', 'Rapid', 'Swift'],      ant: ['Slow', 'Sluggish'] },
      { w: 'Smart',     syn: ['Clever', 'Bright'],             ant: ['Foolish', 'Dull'] },
      { w: 'Brave',     syn: ['Bold', 'Courageous'],           ant: ['Cowardly', 'Timid'] },
      { w: 'Clean',     syn: ['Tidy', 'Spotless'],             ant: ['Dirty', 'Filthy'] },
      { w: 'Quiet',     syn: ['Silent', 'Calm'],               ant: ['Noisy', 'Loud'] },
      { w: 'Easy',      syn: ['Simple', 'Effortless'],         ant: ['Difficult', 'Hard'] },
      { w: 'Cold',      syn: ['Chilly', 'Icy'],                ant: ['Warm', 'Hot'] },
      { w: 'Bright',    syn: ['Luminous', 'Radiant'],          ant: ['Dark', 'Dim'] },
      { w: 'Kind',      syn: ['Gentle', 'Benevolent'],         ant: ['Cruel', 'Mean'] },
      { w: 'Rich',      syn: ['Wealthy', 'Affluent'],          ant: ['Poor', 'Needy'] },
    ],
    mid: [
      { w: 'Cautious',  syn: ['Careful', 'Prudent'],           ant: ['Reckless', 'Rash'] },
      { w: 'Generous',  syn: ['Giving', 'Lavish'],             ant: ['Stingy', 'Miserly'] },
      { w: 'Humble',    syn: ['Modest', 'Meek'],               ant: ['Arrogant', 'Proud'] },
      { w: 'Diligent',  syn: ['Industrious', 'Assiduous'],     ant: ['Lazy', 'Idle'] },
      { w: 'Honest',    syn: ['Truthful', 'Sincere'],          ant: ['Deceitful', 'Dishonest'] },
      { w: 'Gentle',    syn: ['Tender', 'Soft'],               ant: ['Rough', 'Harsh'] },
      { w: 'Clear',     syn: ['Distinct', 'Lucid'],            ant: ['Vague', 'Blurry'] },
      { w: 'Wide',      syn: ['Broad', 'Vast'],                ant: ['Narrow', 'Tight'] },
      { w: 'Decisive',  syn: ['Resolute', 'Firm'],             ant: ['Hesitant', 'Wavering'] },
      { w: 'Serious',   syn: ['Solemn', 'Grave'],              ant: ['Frivolous', 'Casual'] },
      { w: 'Composed',  syn: ['Calm', 'Poised'],               ant: ['Flustered', 'Panicked'] },
      { w: 'Novel',     syn: ['Fresh', 'New'],                 ant: ['Old', 'Worn'] },
    ],
    hard: [
      { w: 'Resplendent', syn: ['Splendid', 'Dazzling'],       ant: ['Dull', 'Drab'] },
      { w: 'Melancholy',  syn: ['Gloomy', 'Wistful'],          ant: ['Cheerful', 'Joyous'] },
      { w: 'Sagacious',   syn: ['Wise', 'Astute'],             ant: ['Foolish', 'Obtuse'] },
      { w: 'Reticent',    syn: ['Reserved', 'Silent'],         ant: ['Talkative', 'Loquacious'] },
      { w: 'Circuitous',  syn: ['Winding', 'Roundabout'],      ant: ['Direct', 'Straight'] },
      { w: 'Adhere',      syn: ['Comply', 'Uphold'],           ant: ['Violate', 'Breach'] },
      { w: 'Subtle',      syn: ['Nuanced', 'Delicate'],        ant: ['Blatant', 'Obvious'] },
      { w: 'Radiant',     syn: ['Shining', 'Beaming'],         ant: ['Dim', 'Murky'] },
      { w: 'Majestic',    syn: ['Grand', 'Stately'],           ant: ['Trivial', 'Petty'] },
      { w: 'Adept',       syn: ['Skilled', 'Proficient'],      ant: ['Inept', 'Clumsy'] },
      { w: 'Tranquil',    syn: ['Peaceful', 'Placid'],         ant: ['Turbulent', 'Chaotic'] },
      { w: 'Steep',       syn: ['Sheer', 'Precipitous'],       ant: ['Gentle', 'Level'] },
    ],
  },
}

// Neutral distractors — unrelated concrete nouns.
const distractors = {
  zh: {
    common: ['桌子', '椅子', '树木', '河流', '汽车', '书本', '杯子', '花朵', '窗户', '雨伞', '钟表', '道路'],
    mid:    ['眺望', '徘徊', '沉思', '领悟', '斟酌', '踌躇', '涵盖', '回眸'],
    hard:   ['皓月', '馥郁', '氤氲', '旖旎', '迤逦', '缱绻', '踯躅', '夙愿'],
  },
  en: {
    common: ['Table', 'Chair', 'River', 'Car', 'Book', 'Cup', 'Flower', 'Window', 'Umbrella', 'Clock', 'Road', 'Tree'],
    mid:    ['Gaze', 'Wander', 'Ponder', 'Grasp', 'Weigh', 'Vacillate', 'Encompass', 'Reminisce'],
    hard:   ['Moonlit', 'Fragrant', 'Ethereal', 'Enchanting', 'Meandering', 'Yearning', 'Lingering', 'Aspiration'],
  },
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build one question for the given difficulty level & locale.
export function makeQuestion(level, locale) {
  const cfg = DIFFICULTIES.find(d => d.level === level) || DIFFICULTIES[0]
  const pool = bank[locale][cfg.complexity]
  const entry = pick(pool)

  const correctPool = cfg.type === 'syn' ? entry.syn : entry.ant
  const correct = pick(correctPool)

  // Build distractor set: opposite-relation words of this entry (strong red herring)
  // + other entries' words + neutral distractors.
  const oppositePool = cfg.type === 'syn' ? entry.ant : entry.syn
  const others = pool.filter(e => e.w !== entry.w).flatMap(e => [...e.syn, ...e.ant, e.w])
  const dPool = shuffle([...oppositePool, ...others, ...distractors[locale][cfg.complexity]])

  const used = new Set([entry.w, correct])
  const wrongs = []
  for (const w of dPool) {
    if (wrongs.length >= cfg.options - 1) break
    if (!used.has(w)) { wrongs.push(w); used.add(w) }
  }

  const options = shuffle([correct, ...wrongs])
  return {
    word: entry.w,
    type: cfg.type,          // 'syn' | 'ant'
    options,
    correct,
    level: cfg.level,
    coef: cfg.coef,
  }
}
