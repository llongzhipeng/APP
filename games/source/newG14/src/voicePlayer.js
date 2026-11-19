import { resolveVoice } from './assets'
// Voice player. All playback goes through Web Audio (AudioBufferSourceNode)
// with a single AudioContext kept HOT for the whole session by a silent loop.
//
// Why not <audio> elements? On Edge Android the <audio> media pipeline is
// suspended after a few seconds of idle even when Web Audio is being kept
// alive — which caused the first digit of every round after the first to be
// silent. Web Audio has a single pipeline we can pin.
//
// SpeechSynthesis is the last-ditch fallback only if a clip fails to LOAD.

// ---------- On-screen diagnostic log (visible without USB debug) ----------
const DIAG_LOG = []
export function getDiagLog() { return DIAG_LOG.slice() }
export function clearDiagLog() { DIAG_LOG.length = 0 }
function log(...args) {
  const line = args.map((a) => {
    if (a && typeof a === 'object') { try { return JSON.stringify(a) } catch (e) { return String(a) } }
    return String(a)
  }).join(' ')
  const stamped = `[${(performance.now() / 1000).toFixed(2)}s] ${line}`
  DIAG_LOG.push(stamped)
  if (DIAG_LOG.length > 200) DIAG_LOG.splice(0, DIAG_LOG.length - 200)
  try { console.log('[voice]', line) } catch (e) {}
}
// -------------------------------------------------------------------------

const bufferCache = {}         // key: `${folder}/${name}` → AudioBuffer
const bufferLoading = {}       // key → Promise<AudioBuffer|null>
const loadFailed = new Set()   // keys that failed to load/decode

let audioCtx = null

function folderFor(lang) { return lang === 'en' ? 'english' : 'chinese' }
function cacheKey(lang, name) { return `${folderFor(lang)}/${name}` }

function ensureCtx() {
  if (audioCtx) return audioCtx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) audioCtx = new AC()
  } catch (e) { audioCtx = null }
  return audioCtx
}

function loadBuffer(lang, name) {
  const key = cacheKey(lang, name)
  if (bufferCache[key]) return Promise.resolve(bufferCache[key])
  if (loadFailed.has(key)) return Promise.resolve(null)
  if (bufferLoading[key]) return bufferLoading[key]

  const ctx = ensureCtx()
  if (!ctx) return Promise.resolve(null)

  const promise = fetch(resolveVoice(`/voice/${key}.mp3`))
    .then((res) => {
      if (!res.ok) throw new Error('http ' + res.status)
      return res.arrayBuffer()
    })
    .then((arr) => new Promise((resolve, reject) => {
      // decodeAudioData supports both promise and callback forms
      const p = ctx.decodeAudioData(arr.slice(0), resolve, reject)
      if (p && typeof p.then === 'function') p.then(resolve, reject)
    }))
    .then((buf) => {
      bufferCache[key] = buf
      log('LOADED', key, `dur=${buf.duration.toFixed(3)}s`, `ch=${buf.numberOfChannels}`, `sr=${buf.sampleRate}`)
      return buf
    })
    .catch((e) => {
      loadFailed.add(key)
      log('LOAD-FAIL', key, e && e.message)
      return null
    })
    .finally(() => { delete bufferLoading[key] })

  bufferLoading[key] = promise
  return promise
}

export function preloadAll(lang = 'zh') {
  ensureCtx()
  for (let i = 0; i <= 9; i++) loadBuffer(lang, String(i))
  loadBuffer(lang, 'order')
  loadBuffer(lang, 'Reversed')
}

// Must be called synchronously inside a user gesture.
let audioUnlocked = false
export function unlockAudio(lang = 'zh') {
  const ctx = ensureCtx()
  if (!ctx) { preloadAll(lang); return }

  if (!audioUnlocked) {
    if (ctx.state === 'suspended') { try { ctx.resume() } catch (e) {} }

    // 0.6s silent buffer warms the Android output pipeline so the first real
    // clip isn't quiet due to the driver's fade-in / AGC ramp.
    try {
      const s = ctx.createBufferSource()
      s.buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.6)), ctx.sampleRate)
      s.connect(ctx.destination)
      s.start(0)
    } catch (e) {}

    // Keep the audio output HOT for the whole session via a silent, looping
    // Web Audio buffer routed through a zero-gain node. Prevents Edge Android
    // from suspending the pipeline during the 15s answer phase.
    try {
      const keepAlive = ctx.createBufferSource()
      keepAlive.buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.05)), ctx.sampleRate)
      keepAlive.loop = true
      const g = ctx.createGain()
      g.gain.value = 0
      keepAlive.connect(g).connect(ctx.destination)
      keepAlive.start(0)
    } catch (e) {}

    audioUnlocked = true
  }

  preloadAll(lang)

  // Warm the speech-synth fallback path too.
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      window.speechSynthesis.speak(u)
    }
  } catch (e) {}
}

// Force-resume the AudioContext and wait until it's actually running.
// Some Android browsers reach 'suspended' between rounds; if we start a
// BufferSource while suspended the clip is silently discarded.
async function ensureRunning() {
  const ctx = ensureCtx()
  if (!ctx) return null
  if (ctx.state !== 'running') {
    try { await ctx.resume() } catch (e) {}
    // Give the context a beat to actually transition.
    for (let i = 0; i < 20 && ctx.state !== 'running'; i++) {
      await new Promise((r) => setTimeout(r, 15))
    }
  }
  return ctx
}

// Kick the context awake before a round AND play a short silent buffer to
// pre-ramp the Android output pipeline. Without this, the first digit of
// every round comes out quiet because the audio driver's AGC/fade-in ramp
// eats the first ~150ms of the clip.
//
// We warm BOTH pipelines because on Edge Android the digit clips actually
// play through HTMLAudioElement (Web Audio can't decode them), which is a
// completely separate output path from the Web Audio warmup buffer.
export async function warmupForRound(lang = 'zh') {
  const ctx = await ensureRunning()
  if (ctx) {
    try {
      const s = ctx.createBufferSource()
      s.buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.4)), ctx.sampleRate)
      s.connect(ctx.destination)
      s.start(0)
      log('WARMUP webaudio prime played')
    } catch (e) {
      log('WARMUP webaudio prime failed', e && e.message)
    }
  }

  // Warm the HTML audio pipeline by silently playing the first digit clip
  // at volume 0. This opens the Android media output gate so the first real
  // digit clip of the round starts at full volume instead of climbing out
  // of the AGC ramp.
  try {
    const key = cacheKey(lang, '0')
    const a = new Audio(resolveVoice(`/voice/${key}.mp3`))
    a.volume = 0
    a.muted = true
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        log('WARMUP html prime started')
        // Let it run ~350ms then stop; enough to open the output gate.
        setTimeout(() => { try { a.pause() } catch (e) {} }, 350)
      }).catch((e) => log('WARMUP html prime rejected', e && e.message))
    }
  } catch (e) {
    log('WARMUP html prime threw', e && e.message)
  }
}

function speakFallback(text, lang) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(resolve, 400); return
    }
    try {
      const u = new SpeechSynthesisUtterance(String(text))
      u.rate = 1
      u.pitch = 1
      u.lang = lang === 'en' ? 'en-US' : 'zh-CN'
      let done = false
      const finish = () => { if (!done) { done = true; resolve() } }
      u.onend = finish
      u.onerror = finish
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
      setTimeout(finish, 1500)
    } catch (e) { setTimeout(resolve, 400) }
  })
}

// HTMLAudio fallback for clips Web Audio can't decode (Edge Android rejects
// certain mp3 encodings via decodeAudioData but the HTML5 media pipeline
// accepts them). Returns { promise, stop }.
function playHtmlAudio(name, lang) {
  const key = cacheKey(lang, name)
  let stopped = false
  let audio = null
  const promise = new Promise((resolve) => {
    let done = false
    const finish = (why) => { if (!done) { done = true; log('HTML-PLAY', key, 'finish', why); resolve() } }
    try {
      audio = new Audio(resolveVoice(`/voice/${key}.mp3`))
      audio.preload = 'auto'
      audio.onended = () => finish('ended')
      audio.onerror = () => finish('error')
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.then(() => log('HTML-PLAY', key, 'play() ok'))
         .catch((e) => { log('HTML-PLAY', key, 'play() FAIL', e && e.message); finish('play-rejected') })
      } else {
        log('HTML-PLAY', key, 'play() sync')
      }
      // Safety timeout
      setTimeout(() => finish('timeout'), 5000)
    } catch (e) {
      log('HTML-PLAY', key, 'THREW', e && e.message)
      finish('threw')
    }
  })
  return {
    promise,
    stop() {
      stopped = true
      if (audio) { try { audio.pause() } catch (e) {} }
    }
  }
}

// Play one clip through Web Audio. Returns { promise, stop }.
function playClip(name, lang, fallbackText) {
  let stopped = false
  let source = null
  let htmlCtl = null
  const key = cacheKey(lang, name)

  const promise = (async () => {
    log('PLAY', key, 'requested')
    const ctx = await ensureRunning()
    if (!ctx) { log('PLAY', key, 'NO-CTX -> HTML audio'); htmlCtl = playHtmlAudio(name, lang); return htmlCtl.promise }
    log('PLAY', key, 'ctx.state=', ctx.state)
    const buf = await loadBuffer(lang, name)
    if (stopped) { log('PLAY', key, 'stopped-before-start'); return }
    if (!buf) {
      log('PLAY', key, 'NO-BUFFER -> HTML audio')
      htmlCtl = playHtmlAudio(name, lang)
      const r = await htmlCtl.promise
      htmlCtl = null
      return r
    }

    if (ctx.state !== 'running') {
      log('PLAY', key, 'ctx not running, resuming again')
      try { await ctx.resume() } catch (e) {}
    }

    await new Promise((resolve) => {
      let done = false
      const finish = (why) => { if (!done) { done = true; log('PLAY', key, 'finish', why); resolve() } }
      try {
        source = ctx.createBufferSource()
        source.buffer = buf
        source.connect(ctx.destination)
        source.onended = () => finish('onended')
        source.start(0)
        log('PLAY', key, 'START ok, ctx.state=', ctx.state, 'sink=', ctx.destination.channelCount)
      } catch (e) {
        log('PLAY', key, 'START THREW', e && e.message)
        finish('threw'); return
      }
      // Safety timeout in case onended doesn't fire
      setTimeout(() => finish('timeout'), Math.ceil(buf.duration * 1000) + 500)
    })
  })()

  return {
    promise,
    stop() {
      stopped = true
      if (source) {
        try { source.stop(0) } catch (e) {}
        try { source.disconnect() } catch (e) {}
        source = null
      }
      if (htmlCtl) { try { htmlCtl.stop() } catch (e) {} }
    }
  }
}

// Play the rule prompt clip.
export function playRule(rule, lang = 'zh') {
  const name = rule === 'reverse' ? 'Reversed' : 'order'
  const fallback = lang === 'en'
    ? (rule === 'reverse' ? 'Enter digits in reverse order' : 'Enter digits in order')
    : (rule === 'reverse' ? '请按照数字出现的逆序依次输入' : '请按照数字出现的顺序依次输入')
  return playClip(name, lang, fallback).promise
}

// Play a sequence of digits with `gap` ms between them, then (optionally) the
// rule prompt clip. Callback signature unchanged.
export function playSequence(digits, gap = 900, onDigit, lang = 'zh', rule = null) {
  let cancelled = false
  let currentTimeout = null
  let currentClip = null

  const promise = (async () => {
    for (let i = 0; i < digits.length; i++) {
      if (cancelled) return
      if (onDigit) onDigit(i, digits[i])
      currentClip = playClip(String(digits[i]), lang, String(digits[i]))
      await currentClip.promise
      currentClip = null
      if (cancelled) return
      if (i === digits.length - 1) break
      await new Promise((r) => { currentTimeout = setTimeout(r, gap) })
    }
    if (cancelled) return
    if (onDigit) onDigit(-1, null)

    if (rule) {
      await new Promise((r) => { currentTimeout = setTimeout(r, 400) })
      if (cancelled) return
      if (onDigit) onDigit(-2, null)
      const name = rule === 'reverse' ? 'Reversed' : 'order'
      const fallback = lang === 'en'
        ? (rule === 'reverse' ? 'Enter digits in reverse order' : 'Enter digits in order')
        : (rule === 'reverse' ? '请按照数字出现的逆序依次输入' : '请按照数字出现的顺序依次输入')
      currentClip = playClip(name, lang, fallback)
      await currentClip.promise
      currentClip = null
      if (cancelled) return
      if (onDigit) onDigit(-3, null)
    }
  })()

  return {
    promise,
    cancel() {
      cancelled = true
      if (currentTimeout) clearTimeout(currentTimeout)
      if (currentClip) currentClip.stop()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel() } catch (e) {}
      }
    }
  }
}
