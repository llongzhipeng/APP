// Kitchen hazard scenarios. Each hazard has:
//   id, i18nKey (used for hazard name / question), correctAnswers, wrongAnswers
//   answers combine into an option list, and we validate correctness by set membership.
// Answer strings themselves are localized here inline (both zh & en) to keep options tight.
export const HAZARDS = [
  {
    id: 'gasLeak',
    correct: [
      { zh: '打开窗户', en: 'Open the window' },
      { zh: '熄灭明火', en: 'Extinguish open flame' },
      { zh: '关闭燃气阀门', en: 'Close the gas valve' },
      { zh: '迅速撤离', en: 'Evacuate quickly' },
      { zh: '拨打 119', en: 'Call 119 / fire dept' }
    ],
    wrong: [
      { zh: '开灯', en: 'Turn on lights' },
      { zh: '打开抽油烟机', en: 'Turn on range hood' },
      { zh: '按门铃', en: 'Ring the doorbell' },
      { zh: '在厨房内打电话', en: 'Make phone calls indoors' },
      { zh: '使用打火机', en: 'Use a lighter' }
    ]
  },
  {
    id: 'stoveOn',
    correct: [
      { zh: '关闭燃气阀门', en: 'Close gas valve' }
    ],
    wrong: [
      { zh: '用水泼浇', en: 'Splash with water' },
      { zh: '置之不理', en: 'Ignore it' }
    ]
  },
  {
    id: 'oilFire',
    correct: [
      { zh: '用湿毛巾覆盖', en: 'Cover with wet towel' },
      { zh: '盖上锅盖', en: 'Put on the pot lid' },
      { zh: '大量蔬菜倒入锅中', en: 'Pour vegetables into pan' },
      { zh: '关闭燃气阀门', en: 'Close gas valve' }
    ],
    wrong: [
      { zh: '用水浇灭', en: 'Douse with water' },
      { zh: '移动油锅', en: 'Move the oil pan' },
      { zh: '用面粉扑灭', en: 'Smother with flour' }
    ]
  },
  {
    id: 'coffeeFire', kind: 'appliance',
    correct: [
      { zh: '切断电源', en: 'Cut the power' },
      { zh: '使用灭火器', en: 'Use fire extinguisher' },
      { zh: '拨打 119', en: 'Call 119' }
    ],
    wrong: [
      { zh: '用水扑灭', en: 'Extinguish with water' },
      { zh: '用手去拔电源', en: 'Grab plug bare-handed' }
    ]
  },
  {
    id: 'microwaveFire', kind: 'appliance',
    correct: [
      { zh: '切断电源', en: 'Cut the power' },
      { zh: '使用灭火器', en: 'Use fire extinguisher' },
      { zh: '拨打 119', en: 'Call 119' }
    ],
    wrong: [
      { zh: '用水扑灭', en: 'Extinguish with water' },
      { zh: '用手去拔电源', en: 'Grab plug bare-handed' }
    ]
  },
  {
    id: 'toasterFire', kind: 'appliance',
    correct: [
      { zh: '切断电源', en: 'Cut the power' },
      { zh: '使用灭火器', en: 'Use fire extinguisher' },
      { zh: '拨打 119', en: 'Call 119' }
    ],
    wrong: [
      { zh: '用水扑灭', en: 'Extinguish with water' },
      { zh: '用手去拔电源', en: 'Grab plug bare-handed' }
    ]
  },
  {
    id: 'hoodFire', kind: 'appliance',
    correct: [
      { zh: '切断电源', en: 'Cut the power' },
      { zh: '使用灭火器', en: 'Use fire extinguisher' },
      { zh: '拨打 119', en: 'Call 119' }
    ],
    wrong: [
      { zh: '用水扑灭', en: 'Extinguish with water' },
      { zh: '用手去拔电源', en: 'Grab plug bare-handed' }
    ]
  },
  {
    id: 'knives',
    correct: [
      { zh: '固定存放', en: 'Store in a fixed rack' },
      { zh: '刀刃朝下', en: 'Blade pointing down' },
      { zh: '刀刃朝内', en: 'Blade pointing inward' },
      { zh: '及时收纳', en: 'Put away promptly' }
    ],
    wrong: [
      { zh: '刀刃朝上', en: 'Blade pointing up' },
      { zh: '刀刃朝外', en: 'Blade pointing outward' },
      { zh: '刀放在桌子边缘', en: 'Leave on counter edge' },
      { zh: '与其他餐具混放', en: 'Mix with other utensils' }
    ]
  },
  {
    id: 'faucet',
    correct: [
      { zh: '关闭水阀', en: 'Close the valve' }
    ],
    wrong: [
      { zh: '触碰被水浸泡的电器', en: 'Touch soaked appliance' }
    ]
  },
  {
    id: 'outletSpark',
    correct: [
      { zh: '立即断电', en: 'Cut power immediately' },
      { zh: '联系专业电工', en: 'Call a certified electrician' }
    ],
    wrong: [
      { zh: '继续使用', en: 'Keep using it' },
      { zh: '自行拆卸修理', en: 'Disassemble to fix it' },
      { zh: '湿布擦拭插座', en: 'Wipe with wet cloth' }
    ]
  }
]

export const HAZARD_MAP = Object.fromEntries(HAZARDS.map(h => [h.id, h]))

// Difficulty table per readme
// levels 1..7 -> { hazardCount, timeLimit(s), coefficient }
export const DIFFICULTY = [
  null,
  { hazards: 1, time: 15, coef: 1 },
  { hazards: 1, time: 10, coef: 1.5 },
  { hazards: 2, time: 15, coef: 2 },
  { hazards: 2, time: 15, coef: 2.5 },
  { hazards: 3, time: 15, coef: 3 },
  { hazards: 3, time: 10, coef: 3.5 },
  { hazards: 4, time: 15, coef: 4 }
]

// Generate an option pool for a single hazard.
// We choose 1 correct + N (1..3) wrong, then shuffle. N grows with difficulty.
export function buildOptions(hazardId, level, lang) {
  const h = HAZARD_MAP[hazardId]
  // difficulty influences wrong count range
  const wrongCounts = [null, 1, 1, 2, 2, 2, 3, 3]
  const wrongN = Math.min(wrongCounts[level] || 2, h.wrong.length)
  // choose one correct answer at random for single-select style, but keep all corrects tracked
  const correctPool = h.correct.map(o => ({ text: o[lang], correct: true }))
  const wrongPool = shuffled(h.wrong).slice(0, wrongN).map(o => ({ text: o[lang], correct: false }))
  // for multi-correct hazards, allow all corrects; for single-correct, keep 1
  const correctOptions = correctPool.length > 1 ? correctPool : [correctPool[0]]
  return shuffled([...correctOptions, ...wrongPool])
}

function shuffled(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// pick n distinct hazards for a round
export function pickHazards(n) {
  return shuffled(HAZARDS.map(h => h.id)).slice(0, n)
}
