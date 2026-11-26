import { buildTrialURL, isTrialMessage, loadTrialCatalog } from './trial.js'

const params = new URLSearchParams(location.search)
const title = document.getElementById('game-title')
const status = document.getElementById('game-status')
const container = document.getElementById('game-container')
const exitButton = document.getElementById('exit-game')
const gameType = params.get('game')
const parentChannel = params.get('channel')
const embedded = window.parent !== window
const lang = params.get('lang') === 'en' ? 'en' : 'zh'

function originFromQuery() {
  try {
    const url = new URL(params.get('parentOrigin'))
    return ['https:', 'http:'].includes(url.protocol) && url.origin === params.get('parentOrigin')
      ? url.origin : null
  } catch {
    return null
  }
}

function integerParam(key, fallback, min, max) {
  const raw = params.get(key)
  const value = Number(raw)
  return raw && Number.isInteger(value) && value >= min && value <= max ? value : fallback
}

function renderCatalog(games) {
  const list = document.createElement('ul')
  list.className = 'training-player-catalog'
  for (const game of games) {
    const item = document.createElement('li')
    const link = document.createElement('a')
    link.href = '?' + new URLSearchParams({ game: game.gameType, lang })
    link.textContent = game.title
    item.append(link)
    list.append(item)
  }
  container.append(list)
}

async function start() {
  const { games } = await loadTrialCatalog()
  if (!gameType && !embedded) {
    status.hidden = true
    renderCatalog(games)
    return
  }
  const game = games.find(item => item.gameType === gameType)
  if (!game) throw new Error('没有找到这款游戏，请检查链接里的游戏码。')

  const parentOrigin = embedded ? originFromQuery() : null
  const channel = crypto.randomUUID()
  const frame = document.createElement('iframe')
  frame.title = game.title
  frame.allow = 'autoplay; fullscreen'
  frame.src = buildTrialURL(game, {
    channel, lang,
    difficulty: integerParam('difficulty', 1, 1, 6),
    seconds: integerParam('seconds', 180, 1, 3600),
  }).href

  function receive(event) {
    if (!isTrialMessage(event, frame, gameType, channel)) return
    if (event.data.type === 'ready') status.hidden = true
    if (event.data.type === 'exit' || event.data.type === 'skip') finish(event.data.type)
  }

  function finish(type) {
    window.removeEventListener('message', receive)
    frame.remove()
    exitButton.hidden = true
    status.textContent = '试玩已结束'
    status.hidden = false
    if (parentOrigin && parentChannel) {
      window.parent.postMessage({ source: 'drbrain-training-preview', type, gameType, channel: parentChannel }, parentOrigin)
    }
    if (!embedded) {
      const catalog = document.createElement('a')
      catalog.href = './play.html'
      catalog.textContent = '返回游戏列表'
      container.append(catalog)
    }
  }

  title.textContent = document.title = game.title
  exitButton.hidden = false
  exitButton.addEventListener('click', () => finish('exit'), { once: true })
  window.addEventListener('message', receive)
  container.append(frame)
}

start().catch(error => {
  status.textContent = error.message
})
