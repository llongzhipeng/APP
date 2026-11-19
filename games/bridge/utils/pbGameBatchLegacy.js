import { leave } from '../session'

export function leavePbGameWindow({ confirm = true } = {}) {
  if (confirm && !window.confirm('退出本次训练？')) return false
  leave()
  return true
}

export function shouldShowPbBatchSkip() {
  return false
}

export function skipPbBatchGame() {
  leave()
}
