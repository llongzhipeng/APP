// Web Audio metronome & SFX engine
import { resolveVoice } from './assets.js'

let ctx = null

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function unlockAudio() { ensureCtx() }

// Wood-block / claves "哒" tick: low-mid pitched thud + short noise transient.
// Left slightly higher wood, right slightly deeper — clearly percussive, not shrill.
export function playTick(side = 'left', when = 0, gain = 1.0) {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = when > 0 ? when : ac.currentTime

  // Fundamental pitch — low mid range, wood-block character.
  const freq = side === 'left' ? 380 : 300

  // Body: sine at fundamental for warmth
  const body = ac.createOscillator()
  body.type = 'sine'
  body.frequency.setValueAtTime(freq * 1.6, t0)                  // pitched onset
  body.frequency.exponentialRampToValueAtTime(freq, t0 + 0.02)   // quick pitch drop
  body.frequency.exponentialRampToValueAtTime(freq * 0.7, t0 + 0.14)

  const bodyGain = ac.createGain()
  bodyGain.gain.setValueAtTime(0.0001, t0)
  bodyGain.gain.exponentialRampToValueAtTime(0.85 * gain, t0 + 0.004)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22)

  // Overtone (adds "wood" character)
  const over = ac.createOscillator()
  over.type = 'triangle'
  over.frequency.setValueAtTime(freq * 2.2, t0)
  over.frequency.exponentialRampToValueAtTime(freq * 1.5, t0 + 0.08)
  const overGain = ac.createGain()
  overGain.gain.setValueAtTime(0.0001, t0)
  overGain.gain.exponentialRampToValueAtTime(0.25 * gain, t0 + 0.004)
  overGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.10)

  // Noise transient (attack "click" — mid-band, not shrill)
  const bufferSize = Math.floor(ac.sampleRate * 0.04)
  const noiseBuf = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuf
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 1.4
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.35 * gain, t0)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03)

  // Stereo panning per side
  const panner = ac.createStereoPanner ? ac.createStereoPanner() : null
  const out = ac.createGain()
  out.gain.value = 1

  body.connect(bodyGain)
  over.connect(overGain)
  noise.connect(bp).connect(noiseGain)
  if (panner) {
    panner.pan.value = side === 'left' ? -0.55 : 0.55
    bodyGain.connect(panner)
    overGain.connect(panner)
    noiseGain.connect(panner)
    panner.connect(out)
  } else {
    bodyGain.connect(out)
    overGain.connect(out)
    noiseGain.connect(out)
  }
  out.connect(ac.destination)

  body.start(t0);   body.stop(t0 + 0.26)
  over.start(t0);   over.stop(t0 + 0.14)
  noise.start(t0);  noise.stop(t0 + 0.05)
}

// Feedback SFX
function envTone(freq, dur = 0.15, type = 'sine', peak = 0.35) {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = ac.currentTime
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// Bell-style metronome tick (used at difficulty ≥ 2). Sharper, brighter, still
// stereo-panned so left/right differ. Built from a two-tone bell envelope.
export function playTickBell(side = 'left', gain = 0.9) {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = ac.currentTime
  const base = side === 'left' ? 880 : 660
  const partials = [
    { f: base,      d: 0.18, a: 0.55 },
    { f: base * 1.5, d: 0.14, a: 0.28 },
    { f: base * 2,   d: 0.10, a: 0.18 }
  ]
  const panner = ac.createStereoPanner ? ac.createStereoPanner() : null
  const out = ac.createGain()
  out.gain.value = gain
  partials.forEach(p => {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(p.f, t0)
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(p.a, t0 + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + p.d)
    osc.connect(g)
    if (panner) g.connect(panner); else g.connect(out)
    osc.start(t0); osc.stop(t0 + p.d + 0.02)
  })
  if (panner) { panner.pan.value = side === 'left' ? -0.55 : 0.55; panner.connect(out) }
  out.connect(ac.destination)
}

// Wood-block confirmation for a correct hit (used at difficulty ≥ 2). Reuses
// the same voicing family as playTick but slightly brighter and mono-centered.
export function playHitWood(side = 'left') {
  playTick(side, 0, 0.85)
}

export function playPerfect() {
  envTone(880, 0.09, 'sine', 0.3)
  setTimeout(() => envTone(1320, 0.14, 'sine', 0.3), 40)
}
export function playGood() {
  envTone(660, 0.12, 'sine', 0.28)
}
export function playMiss() {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = ac.currentTime
  const osc = ac.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(240, t0)
  osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.2)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + 0.28)
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => setTimeout(() => envTone(f, 0.15, 'triangle', 0.25), i * 80))
}
export function playLevelDown() {
  const notes = [523, 415, 349]
  notes.forEach((f, i) => setTimeout(() => envTone(f, 0.18, 'triangle', 0.22), i * 90))
}

// ---- Voice prompt (HTMLAudioElement, static file under /voice) ----
let _voiceEl = null
export function playVoice(lang = 'zh') {
  return new Promise((resolve) => {
    let done = false
    const finish = () => { if (done) return; done = true; cleanup(); resolve() }
    let el = null
    const cleanup = () => {
      if (!el) return
      try {
        el.removeEventListener('ended', finish)
        el.removeEventListener('error', finish)
      } catch (e) {}
    }
    try {
      const src = resolveVoice(lang === 'en' ? '/voice/english/1.mp3' : '/voice/chinese/1.mp3')
      if (_voiceEl) { try { _voiceEl.pause(); _voiceEl.src = '' } catch (e) {} }
      el = new Audio(src)
      _voiceEl = el
      el.preload = 'auto'
      el.volume = 1
      el.addEventListener('ended', finish, { once: true })
      el.addEventListener('error', finish, { once: true })
      // Hard fallback: if the file never loads / plays on this device, don't
      // freeze the game — resolve after 3s at most.
      setTimeout(finish, 3500)
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => finish())
    } catch (e) { finish() }
  })
}
export function stopVoice() {
  if (_voiceEl) { try { _voiceEl.pause(); _voiceEl.src = '' } catch (e) {} _voiceEl = null }
}
