import { difficultyFor, durationFor, isActiveBatchGame } from '../session'

export { isActiveBatchGame }
export const getBatchStartDifficultyForGame = difficultyFor

export function applyBatchTutorialEntry(key, { setDuration, setStartDifficulty, openTutorial }) {
  if (!isActiveBatchGame(key)) return
  setDuration(durationFor(key))
  setStartDifficulty?.(difficultyFor(key))
  openTutorial()
}

export function applyBatchDirectStart(key, { setDuration, startGame }) {
  if (!isActiveBatchGame(key)) return
  setDuration(durationFor(key))
  startGame()
}

export function afterBatchTutorial(key, startGame) {
  if (!isActiveBatchGame(key)) return false
  startGame(durationFor(key), difficultyFor(key))
  return true
}
