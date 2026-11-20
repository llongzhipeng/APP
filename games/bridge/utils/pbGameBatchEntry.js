import { difficultyFor, durationFor, isActiveBatchGame } from '../session'
import { endTutorialNarration, openTutorialNarration, readGameOverview } from '../audio/cues.js'
import { showReadableTutorial, hideReadableTutorial } from '../tutorial-reading.js'

export { isActiveBatchGame }
export const getBatchStartDifficultyForGame = difficultyFor

export function applyBatchTutorialEntry(key, { setDuration, setStartDifficulty, openTutorial }) {
  if (!isActiveBatchGame(key)) return
  setDuration(durationFor(key))
  setStartDifficulty?.(difficultyFor(key))
  openTutorial()
  showReadableTutorial()
  openTutorialNarration()
}

export function applyBatchDirectStart(key, { setDuration, startGame }) {
  if (!isActiveBatchGame(key)) return
  setDuration(durationFor(key))
  startGame()
  readGameOverview()
}

export function afterBatchTutorial(key, startGame) {
  if (!isActiveBatchGame(key)) return false
  endTutorialNarration()
  hideReadableTutorial()
  startGame(durationFor(key), difficultyFor(key))
  return true
}
