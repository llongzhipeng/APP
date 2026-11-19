import tutorials from './tutorials.json'

let tutorial
let tutorialOpen = false
let lastTutorialClip = ''
let tutorialTimer
let voice
let voiceTimer
let audioContext
const effects = new Map()
const effectSources = new Map()
let attempts = 0
let successes = 0
let failures = 0
let flushPending = false
let stopped = false

function play(clip, previous) {
  previous?.pause()
  const player = new Audio(`../training-audio/${clip}.mp3`)
  player.play().catch(() => {})
  return player
}

function prepareEffects() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  audioContext ??= new AudioContext()
  for (const [name, effect] of effects) {
    effect.buffer ??= fetch(effect.player.src)
      .then(response => {
        if (!response.ok) throw new Error('Unable to load training sound')
        return response.arrayBuffer()
      })
      .then(data => audioContext.decodeAudioData(data))
      .catch(() => null)
  }
  // A tap also unlocks audio in WebViews that require a user gesture.
  audioContext.resume().catch(() => {})
}

async function playEffect(name) {
  const effect = effects.get(name)
  const buffer = await effect.buffer
  if (stopped) return
  if (buffer && audioContext.state === 'running') {
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    effectSources.get(name)?.stop()
    effectSources.set(name, source)
    source.onended = () => {
      source.disconnect()
      if (effectSources.get(name) === source) effectSources.delete(name)
    }
    source.start()
    return
  }
  effect.player.currentTime = 0
  effect.player.play().catch(() => {})
}

function cancelVoice() {
  clearTimeout(voiceTimer)
  if (voice) {
    voice.pause()
    voice = undefined
  }
}

function readTutorial(force = false) {
  if (!tutorial) return
  const screenText = document.body.innerText || ''
  const clip = tutorialOpen
    ? tutorial.steps.find(step => screenText.includes(step.anchor))?.clip || tutorial.overview
    : tutorial.overview
  if (!force && clip === lastTutorialClip) return
  lastTutorialClip = clip
  cancelVoice()
  voice = play(clip)
}

export function replayInstructions() {
  readTutorial(true)
}

export function openTutorialNarration() {
  tutorialOpen = true
  lastTutorialClip = ''
  // Let the original game's view update before selecting the visible step.
  clearTimeout(tutorialTimer)
  tutorialTimer = setTimeout(readTutorial, 420)
}

export function readGameOverview() {
  clearTimeout(tutorialTimer)
  tutorialTimer = setTimeout(readTutorial, 420)
}

export function endTutorialNarration() {
  if (!tutorialOpen) return
  tutorialOpen = false
  clearTimeout(tutorialTimer)
  cancelVoice()
}

export function initializeTrainingAudio(directory) {
  tutorial = tutorials[directory]
  for (const name of ['correct', 'incorrect']) {
    const player = new Audio(`../training-audio/${name}.mp3`)
    player.preload = 'auto'
    effects.set(name, { player })
  }
  document.addEventListener('click', event => {
    if (audioContext?.state !== 'running') prepareEffects()
    if (!tutorialOpen) return
    const button = event.target.closest?.('button,[role="button"]')
    const label = button?.textContent?.trim() || ''
    if (/跳过|开始(?:游戏|训练|挑战)|马上开始|^(?:Skip|Start)/i.test(label)) {
      endTutorialNarration()
    } else if (/下一步|上一步|下一页|上一页|Next|Prev/i.test(label)) {
      clearTimeout(tutorialTimer)
      tutorialTimer = setTimeout(readTutorial, 420)
    }
  }, true)
  window.addEventListener('pagehide', stopTrainingAudio)
  window.addEventListener('pageshow', () => { stopped = false })
}

export function stopTrainingAudio() {
  stopped = true
  endTutorialNarration()
  clearTimeout(tutorialTimer)
  cancelVoice()
  for (const effect of effects.values()) effect.player.pause()
  for (const source of effectSources.values()) source.stop()
  effectSources.clear()
}

function queueOutcome() {
  if (flushPending) return
  flushPending = true
  queueMicrotask(() => {
    const passed = successes > 0
    const failed = failures > 0 || attempts > successes
    successes = 0
    failures = 0
    attempts = 0
    flushPending = false
    if ((!passed && !failed) || stopped) return
    endTutorialNarration()
    playEffect(failed ? 'incorrect' : 'correct')
  })
}

export function trainingOutcome(correct, value = correct) {
  if (correct) successes++
  else failures++
  queueOutcome()
  return value
}

// Returns the original expression value, including the old value for a postfix increment.
export function trainingMutation(kind, before, value, after) {
  const delta = Number(after) - Number(before)
  if (!Number.isFinite(delta) || delta === 0) return value
  if (kind === 'level') {
    if (stopped) return value
    endTutorialNarration()
    clearTimeout(voiceTimer)
    voiceTimer = setTimeout(() => { voice = play(delta > 0 ? 'up' : 'down', voice) }, 270)
  } else if (kind === 'decrease-failure' ? delta < 0 : delta > 0) {
    if (kind === 'attempt') attempts += delta
    else if (kind === 'success') successes += delta
    else failures++
    queueOutcome()
  }
  return value
}
