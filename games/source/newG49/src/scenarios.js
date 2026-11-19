// Kitchen hazard scenarios — CHOICE MODE.
// Each round we show ONE hazard on the kitchen scene and ask the user which
// response(s) is correct. Levels 1–2 present a single option (judge right/wrong);
// levels 3–7 present N options where exactly one is correct and user picks it.
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

// Difficulty table for choice mode (readme newG49):
//   1: 1 option (judge true/false)              15s   coef 1
//   2: 1 option (judge true/false)              10s   coef 1.5
//   3: 2 options, pick the correct one          15s   coef 2
//   4: 2 options, pick the correct one          10s   coef 2.5
//   5: 3 options                                15s   coef 3
//   6: 3 options                                10s   coef 3.5
//   7: 4 options                                10s   coef 4
export const DIFFICULTY = [
  null,
  { options: 1, mode: 'judge',  time: 15, coef: 1   },
  { options: 1, mode: 'judge',  time: 10, coef: 1.5 },
  { options: 2, mode: 'pick',   time: 15, coef: 2   },
  { options: 2, mode: 'pick',   time: 10, coef: 2.5 },
  { options: 3, mode: 'pick',   time: 15, coef: 3   },
  { options: 3, mode: 'pick',   time: 10, coef: 3.5 },
  { options: 4, mode: 'pick',   time: 10, coef: 4   }
]

function shuffled(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a round for a hazard at a given difficulty level.
// Returns { mode, options } where each option = { text, correct }.
// - judge mode: exactly 1 option; it is either correct or wrong (random 50/50)
// - pick mode:  N options; exactly 1 correct, N-1 distinct wrong ones
export function buildOptions(hazardId, level, lang) {
  const h = HAZARD_MAP[hazardId]
  const def = DIFFICULTY[level]
  if (def.mode === 'judge') {
    // 50/50: present a correct or a wrong action; the user judges it
    const useCorrect = Math.random() < 0.5 && h.correct.length > 0
    const pool = useCorrect ? h.correct : h.wrong
    const o = pool[Math.floor(Math.random() * pool.length)]
    return {
      mode: 'judge',
      options: [{ text: o[lang], correct: useCorrect }]
    }
  }
  // pick mode
  const wantWrong = Math.min(def.options - 1, h.wrong.length)
  const correctOne = h.correct[Math.floor(Math.random() * h.correct.length)]
  const wrongPick = shuffled(h.wrong).slice(0, wantWrong)
  // if hazard doesn't have enough wrongs, pad from cross-hazard wrong pool
  let padding = []
  if (wrongPick.length < def.options - 1) {
    const need = def.options - 1 - wrongPick.length
    const others = HAZARDS.filter(x => x.id !== hazardId).flatMap(x => x.wrong)
    padding = shuffled(others).slice(0, need)
  }
  const opts = shuffled([
    { text: correctOne[lang], correct: true },
    ...wrongPick.map(o => ({ text: o[lang], correct: false })),
    ...padding.map(o => ({ text: o[lang], correct: false }))
  ])
  return { mode: 'pick', options: opts }
}

// pick a single hazard for a round; avoid repeating the previous one when possible
export function pickHazard(excludeId) {
  const pool = HAZARDS.map(h => h.id).filter(id => id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}
