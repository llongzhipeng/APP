const query = new URLSearchParams(window.location.search)
const gameType = query.get('game')
const channel = query.get('channel')
const native = query.get('platform') === 'app'
const minuteGames = new Set([
  'csgw', 'bdx', 'hylx', 'lccj', 'yshy', 'ctdc', 'slzt', 'gwqd', 'xzxm', 'qxjy', 'xgws',
  'xxlx', 'yjfzj', 'sjzh', 'cyfl', 'cyfs', 'yhjsq', 'kjjx', 'rwda', 'ghdr',
])
const seconds = Number(query.get('seconds'))
const parsedLevel = Number(query.get('difficulty'))
let latestResult
let nativeReady = false
const queue = []

export function isActiveBatchGame(key) {
  return Boolean(channel) && key === gameType
}

export function difficultyFor(key) {
  return isActiveBatchGame(key) && Number.isInteger(parsedLevel)
    ? Math.min(6, Math.max(1, parsedLevel))
    : 1
}

export function durationFor(key) {
  const duration = Number.isFinite(seconds) && seconds > 0 ? seconds : 180
  return minuteGames.has(key) ? duration / 60 : duration
}

function emit(type, extra = {}) {
  if (!channel) return
  const data = { source: 'training-game', channel, gameType, type, ...extra }
  if (!native) {
    if (window.parent !== window) window.parent.postMessage(data, window.location.origin)
    return
  }
  if (nativeReady) {
    window.uni.webView.postMessage({ data })
  } else {
    queue.push(data)
  }
}

export function initializeGameBridge() {
  if (native) {
    // The official SDK dispatches this event once its App service bridge is available.
    document.addEventListener('UniAppJSBridgeReady', () => {
      nativeReady = true
      while (queue.length) window.uni.webView.postMessage({ data: queue.shift() })
    }, { once: true })
  }
  emit('ready')
}

export function submitRecord(record) {
  if (latestResult) return Promise.resolve()
  const { archiveId, trainDuration, ...metrics } = record
  const duration = Number(trainDuration)
  latestResult = {
    ...metrics,
    score: Number(metrics.score) || 0,
    durationSeconds: Number.isFinite(duration) && duration > 0
      ? Math.round(duration * (minuteGames.has(gameType) ? 60 : 1))
      : Math.round(durationFor(gameType) * (minuteGames.has(gameType) ? 60 : 1)),
  }
  emit('finished', { result: latestResult })
  return Promise.resolve()
}

export function leave() {
  emit('exit', latestResult ? { result: latestResult } : {})
}

export function skip() {
  emit('skip', latestResult ? { result: latestResult } : {})
}
