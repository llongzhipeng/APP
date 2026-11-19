import tutorials from './tutorials.json'

let tutorial
let tutorialOpen = false
let lastTutorialClip = ''
let tutorialTimer
let voice
let voiceTimer
let sound
let lastSoundAt = 0
let attempts = 0
let successes = 0
let failures = 0
let flushPending = false

function play(clip, previous) {
  previous?.pause()
  const player = new Audio(`../training-audio/${clip}.mp3`)
  player.play().catch(() => {})
  return player
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
  document.addEventListener('click', event => {
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
}

export function stopTrainingAudio() {
  endTutorialNarration()
  clearTimeout(tutorialTimer)
  cancelVoice()
  sound?.pause()
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
    if ((!passed && !failed) || tutorialOpen || Date.now() - lastSoundAt < 120) return
    lastSoundAt = Date.now()
    sound = play(passed ? 'correct' : 'incorrect', sound)
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
    if (tutorialOpen) return value
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
