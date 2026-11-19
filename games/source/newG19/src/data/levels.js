// 难度配置
export const LEVELS = [
  { level: 1, mode: 'pickWrong',   choices: 2, coeff: 1,   rule: '找出下列成语中的错别字' },
  { level: 2, mode: 'pickWrong',   choices: 3, coeff: 1.5, rule: '找出下列成语中的错别字' },
  { level: 3, mode: 'pickWrong',   choices: 3, coeff: 2,   rule: '找出下列成语中的错别字' },
  { level: 4, mode: 'pickCorrect', choices: 4, coeff: 2.5, rule: '找出下列成语中的错别字并选择正确的字' },
  { level: 5, mode: 'pickCorrect', choices: 3, coeff: 3,   rule: '找出下列成语中的错别字并选择正确的字' },
  { level: 6, mode: 'inputCorrect',choices: 0, coeff: 3.5, rule: '找出下列成语中的错别字并输入正确字' }
]

export const MAX_ANSWER_MS = 15000
export const WINDOW_MS = 60000
export const BASE_SCORE = 5
