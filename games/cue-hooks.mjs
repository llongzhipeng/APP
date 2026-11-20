import { parse } from '@babel/parser'

// Paths refer to the original games' response and difficulty state. Total attempts
// are used only where the game derives failures from total minus correct.
const hooks = {
  game1: ['gameState.successTimes', '', 'gameState.currentDifficulty', 'gameState.totalTimes'],
  game2: ['this.statistics.correctCount', 'this.statistics.incorrectCount', 'this.currentDifficulty'],
  game3: ['this.correctAnswers', '', 'this.currentDifficulty', 'this.totalQuestions'],
  game4: ['gameState.successCount', 'gameState.failCount', 'gameState.difficultyLevel'],
  game5: ['successAnswered.value', 'failedAnswered.value', 'difficulty.value'],
  game6: ['totalPopped.value', 'windowWrongClicks.value', 'currentDifficulty.value'],
  game7: ['correctAnswers.value', '', 'difficulty.value', 'totalQuestions.value'],
  game8: ['this.totalCorrect', 'this.totalWrong', 'this.currentLevel'],
  game9: ['totalCorrect.value', '', 'difficultyIndex.value', 'totalQuestions.value'],
  game10: ['correctTrials.value', '', 'difficulty.value', 'totalTrials.value'],
  game11: ['gs.correctRounds', '', 'gs.difficulty', 'gs.totalRounds'],
  game12: ['this.correctCount', '', 'this.difficulty', 'this.questionCount'],
  game13: ['totalCorrect.value', 'wrongFlashIdx.value', 'difficulty.value'],
  game14: ['totalCorrect.value', '', 'currentLevel.value', 'totalAnswered.value'],
  game15: ['correctRounds.value', 'wrongRounds.value', 'difficulty.value'],
  game16: ['this.successQ', 'this.failQ', 'this.level'],
  game17: ['correctRounds.value', 'wrongRounds.value', 'difficulty.value'],
  game18: ['totalCorrect.value', 'totalWrong.value', 'level.value'],
  game19: ['correctRounds.value', 'wrongRounds.value', 'difficulty.value'],
  game20: ['this.totalCorrect', 'this.totalWrong', 'this.level'],
  game21: ['this.successRounds', 'this.failRounds', 'this.difficulty'],
  game22: ['correctRounds', 'wrongRounds', 'level.value'],
  game23: ['correctTrials.value', '', 'difficulty.value', 'totalTrials.value'],
  game24: ['this.correctRounds', 'this.wrongRounds', 'this.difficulty'],
  game25: ['this.correctRounds', 'this.wrongRounds', 'this.difficulty'],
  newG01: ['this.stats.correct', '', 'this.difficulty', 'this.stats.total'],
  newG02: ['this.sessionOk', '', 'this.difficulty', 'this.sessionTotal'],
  newG03: ['this.correctAnswers', '', 'this.difficulty', 'this.totalAnswers'],
  newG04: ['this.totalCorrect', '', 'this.level', 'this.totalAnswered'],
  newG05: ['this.okQ', '', 'this.difficulty', 'this.totalQ'],
  newG06: ['this.totalSuccess', 'this.totalFail', 'this.level'],
  newG07: ['this.successCount', 'this.failCount', 'self.levelIdx'],
  newG08: ['this.stats.correct', '', 'this.difficulty', 'this.stats.total'],
  newG09: ['this.totalHits', 'this.score', 'this.diffLevel'],
  newG10: ['successAnswered.value', 'failedAnswered.value', 'difficulty.value'],
  newG11: ['this.stats.success', 'this.stats.fail', 'this.currentDifficultyIdx'],
  newG12: ['this.windowCorrect', '', 'this.currentLevel', 'this.windowTotal'],
  newG13: ['this.correctCount', 'this.wrongCount', 'this.level'],
  newG14: ['this.totalCorrect', '', 'this.difficultyIndex', 'this.totalQuestions'],
  newG15: ['', '', 'this.level'],
  newG17: ['this.totalCorrect', 'this.totalWrong', 'this.difficulty'],
  newG19: ['this.stats.correct', 'this.stats.fail', 'this.level'],
  newG20: ['this.stats.success', 'this.stats.fail', 'this.difficulty'],
  newG21: ['stats.success', 'stats.fail', 'diffIndex.value'],
  newG22: ['this.success', 'this.fail', 'this.difficultyLevel'],
  newG23: ['this.session.correct', 'this.session.wrong', 'this.level'],
  newG24: ['this.stats.success', 'this.stats.fail', 'this.level'],
  newG25: ['this.success', 'this.fail', 'this.level'],
  newG26: ['this.stats.success', 'this.stats.fail', 'this.level'],
  newG27: ['this.stats.correct', 'this.stats.wrong', 'this.difficulty'],
  newG28: ['this.session.correct', 'this.session.wrong', 'this.level'],
  newG29: ['', '', 'this.level'],
  newG30: ['this.windowStats.correct', '', 'this.difficulty', 'this.windowStats.total'],
  newG31: ['this.stats.success', 'this.stats.fail', 'this.level'],
  newG32: ['this.success', 'this.fail', 'this.level'],
  newG33: ['this.correctCount', 'this.wrongCount', 'this.level'],
  newG34: ['this.stats.correct', 'this.stats.fail', 'this.level'],
  newG35: ['this.totalCorrect', 'this.totalWrong', 'this.level'],
  newG36: ['this.sessionStats.ok', 'this.sessionStats.bad', 'this.level'],
  newG37: ['this.success', 'this.fail', 'this.difficulty'],
  newG38: ['this.game.correctQ', 'this.game.wrongQ', 'this.game.difficulty'],
  newG39: ['this.success', 'this.fail', 'this.level'],
  newG40: ['this.success', 'this.fail', 'this.currentDifficulty'],
  newG41: ['this.correct', 'this.wrong', 'this.level'],
  newG42: ['this.correct', 'this.wrong', 'this.level'],
  newG43: ['this.stats.success', 'this.stats.fail', 'this.level'],
  newG44: ['this.session.correct', 'this.session.wrong', 'this.level'],
  newG45: ['this.session.correct', 'this.session.wrong', 'this.level'],
  newG46: ['this.stats.correct', 'this.stats.wrong', 'this.level'],
  newG47: ['this.stats.correct', 'this.stats.wrong', 'this.difficulty'],
  newG48: ['this.success', 'this.fail', 'this.difficultyLevel'],
  newG49: ['this.session.correct', 'this.session.wrong', 'this.level'],
  newG50: ['this.stats.correct', 'this.stats.fail', 'this.level'],
  newG51: ['this.correctCount', 'this.wrongCount', 'this.difficulty'],
  newG52: ['this.sessionStats.correct', 'this.sessionStats.wrong', 'this.difficulty'],
}

const adaptiveAssignment = /(?:\b(?:newLevel|nextLevel|pendingLevel|pendingDifficulty|pendingDifficultyIndex)\b|[+-]\s*1\b)/

function instrumentScript(script, directory, stats) {
  const [correct, wrong, level, total] = hooks[directory] || []
  const fields = new Map([[correct, 'success'], [wrong, 'failure'], [level, 'level'], [total, 'attempt']].filter(([path]) => path))
  const changes = []
  const source = node => script.slice(node.start, node.end)
  const key = node => source(node).replace(/\s/g, '')

  function visit(node) {
    if (!node || typeof node.type !== 'string') return
    let replacement
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      const target = key(node.left || node.argument)
      const kind = fields.get(target)
      const operator = node.operator
      const original = source(node)
      if (kind && ['++', '+=', '--', '-='].includes(operator)) {
        const cue = target === 'this.score' ? 'decrease-failure' : kind
        replacement = `trainingMutation(${JSON.stringify(cue)}, ${target}, (${original}), ${target})`
      } else if (operator === '=' && kind === 'level' && adaptiveAssignment.test(source(node.right))) {
        replacement = `trainingMutation('level', ${target}, (${original}), ${target})`
      } else if (operator === '=' && target === 'wrongFlashIdx.value' && source(node.right) === 'idx' && kind === 'failure') {
        replacement = `trainingOutcome(false, (${original}))`
      }
      if (replacement) stats.add(kind)
    } else if (node.type === 'CallExpression' && directory === 'newG15' && key(node.callee) === 'this.showFeedback') {
      replacement = `this.showFeedback(trainingOutcome(${source(node.arguments[0])}))`
      stats.add('outcome')
    } else if (node.type === 'CallExpression' && directory === 'newG29' && key(node.callee) === 'this.results.push') {
      replacement = `trainingOutcome(correct, (${source(node)}))`
      stats.add('outcome')
    }
    if (replacement) {
      changes.push({ start: node.start, end: node.end, replacement })
      return
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit)
      else visit(value)
    }
  }

  visit(parse(script, { sourceType: 'unambiguous' }))
  if (!changes.length) return script
  let result = script
  for (const { start, end, replacement } of changes.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, start) + replacement + result.slice(end)
  }
  return "import { trainingMutation, trainingOutcome } from '@/audio/cues.js';\n" + result
}

export function installCueHooks(code, file, directory, stats) {
  if (/(?:tutorial|demo|rules|result|history|records|i18n|config|locales|\/(?:data|public)\/)/i.test(file)) return code
  return file.endsWith('.vue')
    ? code.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_, open, script, close) =>
        open + instrumentScript(script, directory, stats) + close)
    : instrumentScript(code, directory, stats)
}
