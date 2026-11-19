// Task metadata: folder paths under /images/{group}/{folder}/{n}.{ext}
// The image files are numbered 1..stepCount and their order = correct sequence.
import { resolveImage } from './assets.js'

const TWO   = '/images/two'
const THREE = '/images/three'
const FOUR  = '/images/four'

// Each entry: { dir, ext, steps }
export const tasksData = {
  // ---- 2-step tasks ----
  drinking:          { dir: `${TWO}/drinking`,           ext: 'jpg', steps: 2 },
  switch_light:      { dir: `${TWO}/switch_light`,       ext: 'jpg', steps: 2 },
  drop_litter:       { dir: `${TWO}/drop_litter`,        ext: 'jpg', steps: 2 },
  wearing_glasses:   { dir: `${TWO}/wearing_glasses`,    ext: 'jpg', steps: 2 },
  answer_the_phone:  { dir: `${TWO}/answer_the_phone`,   ext: 'jpg', steps: 2 },
  open_tv:           { dir: `${TWO}/Turn_on_the_TV`,     ext: 'jpg', steps: 2 },
  wash_hands:        { dir: `${TWO}/Wash_hands`,         ext: 'jpg', steps: 2 },

  // ---- 3-step tasks ----
  brush_teeth:       { dir: `${THREE}/Brushing_teeth`,        ext: 'jpg', steps: 3 },
  wash_face:         { dir: `${THREE}/Wash_face`,             ext: 'png', steps: 3 },
  hang_clothes:      { dir: `${THREE}/hang_out_the_clothes`,  ext: 'png', steps: 3 },
  make_tea:          { dir: `${THREE}/Make_tea`,              ext: 'png', steps: 3 },
  take_medicine:     { dir: `${THREE}/Take_medicine`,         ext: 'png', steps: 3 },
  fold_clothes:      { dir: `${THREE}/Folding_clothes`,       ext: 'png', steps: 3 },
  charging:          { dir: `${THREE}/Charging`,              ext: 'jpg', steps: 3 },

  // ---- 4-step tasks ----
  cook_rice:         { dir: `${FOUR}/Steaming_rice`,          ext: 'png', steps: 4 },
  fry_egg:           { dir: `${FOUR}/Fried_egg`,              ext: 'png', steps: 4 },
  change_bed_sheets: { dir: `${FOUR}/Change_the_bed_sheets`,  ext: 'png', steps: 4 },
  take_temperature:  { dir: `${FOUR}/Take_temperature`,       ext: 'png', steps: 4 },
  make_sandwich:     { dir: `${FOUR}/Make_a_sandwich`,        ext: 'png', steps: 4 },
  iron_clothes:      { dir: `${FOUR}/Iron_clothes`,           ext: 'png', steps: 4 }
}

export const taskGroups = {
  2: ['drinking', 'switch_light', 'drop_litter', 'wearing_glasses', 'answer_the_phone', 'open_tv', 'wash_hands'],
  3: ['brush_teeth', 'wash_face', 'hang_clothes', 'make_tea', 'take_medicine', 'fold_clothes', 'charging'],
  4: ['cook_rice', 'fry_egg', 'change_bed_sheets', 'take_temperature', 'make_sandwich', 'iron_clothes']
}

// Difficulty settings: [stepCount, showText, coefficient]
export const difficultyConfig = {
  1: { steps: 2, showText: true,  coef: 1   },
  2: { steps: 2, showText: false, coef: 1.5 },
  3: { steps: 3, showText: true,  coef: 2   },
  4: { steps: 3, showText: false, coef: 2.5 },
  5: { steps: 4, showText: true,  coef: 3   },
  6: { steps: 4, showText: false, coef: 3.5 }
}

/**
 * <summary>
 * 返回任务步骤图片 URL 列表（经 resolveImage 解析）
 * </summary>
 */
export function taskImages(key) {
  const t = tasksData[key]
  if (!t) return []
  const arr = []
  for (let i = 1; i <= t.steps; i++) arr.push(resolveImage(`${t.dir}/${i}.${t.ext}`))
  return arr
}
