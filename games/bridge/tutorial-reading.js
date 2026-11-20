import './tutorial-reading.css'

// Each game keeps its own layout. Select the panel containing its tutorial controls.
const panels = {
  game1: '.tutorial-modal',
  game2: '.tutorial-modal',
  game3: '.tutorial-container',
  game4: '.tutorial-modal',
  game5: '.tutorial-content',
  game6: '.tutorial-modal',
  game7: '.tutorial-card',
  game8: '.modal',
  game9: '.tutorial-box',
  game10: '.tut-card',
  game11: '.tutorial-modal',
  game12: '.tutorial-box',
  game13: '.tutorial-box',
  game14: '.tutorial-modal',
  game15: '.tutorial-box',
  game16: '.overlay .box',
  game17: '.tutorial-box',
  game18: '.overlay .box',
  game19: '.tutorial-box',
  game20: '.modal-overlay .modal',
  game21: '.modal-box',
  game22: '.tutorial-box',
  game23: '.tutorial-card',
  game24: '.tutorial-box',
  game25: '.tutorial-box',
  newG01: '.tutorial-box',
  newG02: '.tut-box',
  newG03: '.tutorial-screen',
  newG04: '.overlay .modal',
  newG05: '.tut-modal',
  newG06: '.modal-mask .modal',
  newG07: '.tut-box',
  newG08: '.modal.tutorial',
  newG09: '.tutorial-box',
  newG10: '.tutorial-content',
  newG11: '.modal.tutorial',
  newG12: '.modal-backdrop .modal',
  newG13: '.tutorial-box',
  newG14: '.tutorial-box',
  newG15: '.tutorial-modal',
  newG17: '.tutorial-card',
  newG19: '.tutorial-card',
  newG20: '.tutorial .card',
  newG21: '.tutorial .panel',
  newG22: '.modal-mask .modal',
  newG23: '.tutorial-page .card',
  newG24: '.tutorial-card',
  newG25: '.mask .modal',
  newG26: '.tut-modal',
  newG27: '.overlay .modal',
  newG28: '.tutorial-card',
  newG29: '.modal.tut',
  newG30: '.scene.tutorial',
  newG31: '.modal',
  newG32: '.tutorial .modal',
  newG33: '.panel.tutorial',
  newG34: '.tutorial-card',
  newG35: '.tut-view .tut',
  newG36: '.modal.tut',
  newG37: '.mask .modal',
  newG38: '.tutorial-card',
  newG39: '.card.tut',
  newG40: '.modal.tutorial',
  newG41: '.tutorial .content',
  newG42: '.modal.tutorial',
  newG43: '.modal.tutorial',
  newG44: '.page.panel .card.mid',
  newG45: '.page.panel .card.mid',
  newG46: '.tut-card',
  newG47: '.overlay .modal',
  newG48: '.modal-mask .modal',
  newG49: '.tutorial-card',
  newG50: '.tutorial-card',
  newG51: '.tut-card',
  newG52: '.modal-mask .modal',
}

let selector
let observer
let currentPanel
let queuedFrame
let settleTimer

export function initializeTutorialReading(directory) {
  selector = panels[directory]
}

export function showReadableTutorial() {
  if (!selector) return
  observer ??= new MutationObserver(scheduleRefresh)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  window.addEventListener('resize', resizeTutorial)
  scheduleRefresh()
  clearTimeout(settleTimer)
  // Some panels animate into position after Vue mounts them.
  settleTimer = setTimeout(resizeTutorial, 500)
}

export function hideReadableTutorial() {
  observer?.disconnect()
  window.removeEventListener('resize', resizeTutorial)
  clearTimeout(settleTimer)
  cancelAnimationFrame(queuedFrame)
  queuedFrame = undefined
  currentPanel?.removeAttribute('data-training-tutorial')
  currentPanel = undefined
}

function resizeTutorial() {
  currentPanel?.removeAttribute('data-training-tutorial')
  for (const node of currentPanel?.querySelectorAll('[data-tutorial-font]') || []) {
    node.removeAttribute('data-tutorial-font')
    node.style.removeProperty('--tutorial-font-size')
  }
  scheduleRefresh()
}

function scheduleRefresh() {
  if (queuedFrame) return
  queuedFrame = requestAnimationFrame(refresh)
}

function isTutorialText(node) {
  const containsWords = /(?:[\u3400-\u9fff].*){2}|[a-z]{2,}/i
  return Array.from(node.childNodes).some(child =>
    child.nodeType === Node.TEXT_NODE && containsWords.test(child.textContent))
}

function refresh() {
  queuedFrame = undefined
  const panel = Array.from(document.querySelectorAll(selector)).find(node => node.offsetHeight > 0)
  if (!panel) {
    if (currentPanel) hideReadableTutorial()
    return
  }
  if (panel !== currentPanel) {
    currentPanel?.removeAttribute('data-training-tutorial')
    currentPanel = panel
  }
  const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1
  const targets = []
  for (const node of panel.querySelectorAll('article,button,div,h1,h2,h3,h4,label,li,p,small,span,strong,b,em,[role="button"]')) {
    if (node.hasAttribute('data-tutorial-font') || !isTutorialText(node) || !node.getClientRects().length) continue
    const original = parseFloat(getComputedStyle(node).fontSize)
    const isButton = node.matches('button,[role="button"]')
    const heading = node.matches('h1,h2,h3,h4,[class*="title"]')
    const visualMinimum = heading ? 24 : 20
    const originalVisualSize = original * scale
    const size = Math.max(visualMinimum, originalVisualSize * 1.18) / scale
    if (originalVisualSize < 34) targets.push({ node, size, isButton })
  }
  if (!panel.hasAttribute('data-training-tutorial')) {
    const originalMax = getComputedStyle(panel).maxHeight
    const viewportMax = `${(window.innerHeight - 16) / scale}px`
    panel.dataset.trainingTutorial = 'readable'
    panel.style.setProperty('--tutorial-original-max', originalMax === 'none' ? viewportMax : originalMax)
    panel.style.setProperty('--tutorial-viewport-max', viewportMax)
    panel.style.setProperty('--tutorial-touch-height', `${44 / scale}px`)
  }
  for (const { node, size, isButton } of targets) {
    node.dataset.tutorialFont = isButton ? 'button' : 'text'
    node.style.setProperty('--tutorial-font-size', `${size.toFixed(2)}px`)
  }
}
