const base = new URL('./', import.meta.url)
let activeDialog

export async function loadTrialCatalog() {
  const response = await fetch(new URL('catalog.json', base))
  if (!response.ok) throw new Error('无法读取试玩游戏目录')
  const catalog = await response.json()
  for (const game of catalog.games) game.cover = new URL(game.cover, base).href
  return catalog
}

export function openTrial(game, { difficulty = 1, seconds = 180, lang = 'zh' } = {}) {
  if (!/^(?:game|newG)\d+$/.test(game.directory)) throw new Error('无效的游戏目录')
  if (base.origin !== location.origin) throw new Error('试玩组件需要和管理系统部署在同一来源')
  if (!document.querySelector('link[data-training-trial]')) {
    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = new URL('trial.css', base).href
    style.dataset.trainingTrial = ''
    document.head.append(style)
  }

  activeDialog?.close()
  const channel = crypto.randomUUID()
  const url = new URL('games/' + game.directory + '/index.html', base)
  url.search = new URLSearchParams({
    game: game.gameType, channel, platform: 'h5', seconds, difficulty, lang,
  })

  const dialog = document.createElement('dialog')
  dialog.className = 'training-trial'
  dialog.setAttribute('aria-label', game.title)
  const header = document.createElement('header')
  const title = document.createElement('strong')
  title.textContent = game.title
  const back = document.createElement('button')
  back.type = 'button'
  back.textContent = '返回游戏列表'
  back.addEventListener('click', () => dialog.close())
  header.append(title, back)
  const iframe = document.createElement('iframe')
  iframe.title = game.title
  iframe.allow = 'autoplay; fullscreen'
  dialog.append(header, iframe)

  function receive(event) {
    if (event.origin !== base.origin || event.source !== iframe.contentWindow) return
    const message = event.data
    if (message?.source !== 'training-game' || message.channel !== channel ||
        message.gameType !== game.gameType) return
    if (message.type === 'exit' || message.type === 'skip') dialog.close()
  }

  dialog.addEventListener('close', () => {
    window.removeEventListener('message', receive)
    dialog.remove()
    if (activeDialog === dialog) activeDialog = undefined
  }, { once: true })
  document.body.append(dialog)
  window.addEventListener('message', receive)
  activeDialog = dialog
  dialog.showModal()
  iframe.src = url.href
}
