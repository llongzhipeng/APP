import { submitRecord } from '../../../session'
import { getTrainTypeForGame } from '../../../utils/pbGameRegistry'

export function resolveArchiveId() { return null }
export function orZero(value) {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

export const toPbGameSeconds = seconds => Math.round(orZero(seconds) * 100) / 100
export const msToPbGameSeconds = milliseconds => toPbGameSeconds(orZero(milliseconds) / 1000)

export function submitPbGameEndRecord(archiveId, gameType, metrics) {
  return submitRecord({ ...metrics, gameType, trainType: getTrainTypeForGame(gameType) })
}
