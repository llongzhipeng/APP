// Web Audio engine — generates Do Re Mi Fa Sol La Si (C-major scale)
// Uses additive synthesis for a bell/glass-like timbre resembling struck water bottles.

// Solfège → frequency (C5 octave, equal temperament)
export const NOTES = {
  Do:  523.25, // C5
  Re:  587.33, // D5
  Mi:  659.25, // E5
  Fa:  698.46, // F5
  Sol: 783.99, // G5
  La:  880.00, // A5
  Si:  987.77  // B5
}

export const NOTE_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']

// Water-level percentage (higher water → lower air column → higher pitch when tapped-top,
// but for bottle-with-water blown, lower water = lower pitch). We use a visual mapping
// so higher water renders as taller liquid; pitch increases with note index in a nice gradient.
export const NOTE_COLORS = {
  Do:  '#ff6b6b',
  Re:  '#ffa94d',
  Mi:  '#ffd43b',
  Fa:  '#69db7c',
  Sol: '#4dabf7',
  La:  '#845ef7',
  Si:  '#e64980'
}

let ctx = null
function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Play a single note with bell/glass-bottle timbre.
export function playNote(noteName, duration = 0.9, when = 0, volume = 0.5) {
  const ac = ensureCtx()
  const freq = NOTES[noteName]
  if (!freq) return
  const t0 = ac.currentTime + when

  const master = ac.createGain()
  master.gain.setValueAtTime(0.0001, t0)
  master.gain.exponentialRampToValueAtTime(volume, t0 + 0.01)
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  master.connect(ac.destination)

  // Fundamental + harmonics (bell-like)
  const partials = [
    { mult: 1,    gain: 1.0,  type: 'sine'     },
    { mult: 2,    gain: 0.35, type: 'sine'     },
    { mult: 3.01, gain: 0.18, type: 'sine'     },
    { mult: 4.2,  gain: 0.10, type: 'triangle' },
    { mult: 5.4,  gain: 0.05, type: 'sine'     }
  ]
  partials.forEach(p => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = p.type
    o.frequency.setValueAtTime(freq * p.mult, t0)
    g.gain.setValueAtTime(p.gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration * 0.95)
    o.connect(g).connect(master)
    o.start(t0)
    o.stop(t0 + duration + 0.05)
  })
}

// Play a short "tap" click sound (for UI feedback / conductor's stick)
export function playTap() {
  const ac = ensureCtx()
  const t0 = ac.currentTime
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(1800, t0)
  o.frequency.exponentialRampToValueAtTime(400, t0 + 0.05)
  g.gain.setValueAtTime(0.15, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08)
  o.connect(g).connect(ac.destination)
  o.start(t0)
  o.stop(t0 + 0.1)
}

export function playCorrect() {
  playNote('Do', 0.25, 0, 0.35)
  playNote('Mi', 0.25, 0.12, 0.35)
  playNote('Sol', 0.5, 0.24, 0.4)
}

export function playWrong() {
  const ac = ensureCtx()
  const t0 = ac.currentTime
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(220, t0)
  o.frequency.exponentialRampToValueAtTime(110, t0 + 0.4)
  g.gain.setValueAtTime(0.001, t0)
  g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45)
  o.connect(g).connect(ac.destination)
  o.start(t0)
  o.stop(t0 + 0.5)
}

// ---- Voice prompts (mp3 files under /public/voice) ----
let currentVoice = null

// Play a voice file and resolve when it finishes (or errors).
// lang: 'zh' | 'en'; id: 1 | 2
export function playVoice(lang, id) {
  return new Promise(resolve => {
    stopVoice()
    const folder = lang === 'en' ? 'english' : 'chinese'
    const audio = new Audio(`voice/${folder}/${id}.mp3`)
    audio.volume = 1.0
    currentVoice = audio
    const done = () => {
      if (currentVoice === audio) currentVoice = null
      audio.removeEventListener('ended', done)
      audio.removeEventListener('error', done)
      resolve()
    }
    audio.addEventListener('ended', done)
    audio.addEventListener('error', done)
    // If play() rejects (autoplay policy), resolve anyway so the game doesn't hang.
    const p = audio.play()
    if (p && typeof p.catch === 'function') p.catch(() => done())
  })
}

export function stopVoice() {
  if (currentVoice) {
    try { currentVoice.pause(); currentVoice.currentTime = 0 } catch (e) {}
    currentVoice = null
  }
}
