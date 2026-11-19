import { store } from './i18n.js'
import { resolveVoice } from './assets.js'

// Web Audio API implementation: fully decoded PCM buffers played through an AudioContext.
// This avoids the Android Chrome "fade-in" behavior seen with HTMLAudioElement, where
// media playback ramps volume from 0 over ~200ms on the first play.

let ctx = null
let masterGain = null
const buffers = {}   // key `${lang}/${n}` -> AudioBuffer
const loading = {}   // key -> Promise
let currentSource = null

function ensureCtx() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  masterGain = ctx.createGain()
  masterGain.gain.value = 1
  masterGain.connect(ctx.destination)
  return ctx
}

function url(lang, n) {
  const folder = lang === 'zh' ? 'chinese' : 'english'
  return resolveVoice(`/voice/${folder}/${n}.mp3`)
}

async function loadBuffer(lang, n) {
  const c = ensureCtx()
  if (!c) return null
  const k = `${lang}/${n}`
  if (buffers[k]) return buffers[k]
  if (loading[k]) return loading[k]
  loading[k] = (async () => {
    try {
      const res = await fetch(url(lang, n))
      const arr = await res.arrayBuffer()
      const buf = await new Promise((resolve, reject) => {
        // Use callback form for Safari compatibility.
        c.decodeAudioData(arr, resolve, reject)
      })
      buffers[k] = buf
      return buf
    } catch (e) {
      console.warn('[audio] load failed', url(lang, n), e)
      return null
    } finally {
      delete loading[k]
    }
  })()
  return loading[k]
}

export async function playFound(n) {
  if (!n || n < 1 || n > 5) return
  const c = ensureCtx()
  if (!c) return
  if (c.state === 'suspended') { try { await c.resume() } catch (e) { /* ignore */ } }
  const lang = store.lang === 'zh' ? 'zh' : 'en'
  const buf = await loadBuffer(lang, n)
  if (!buf) return
  try {
    if (currentSource) { try { currentSource.stop() } catch (e) { /* ignore */ } currentSource = null }
    const src = c.createBufferSource()
    src.buffer = buf
    src.connect(masterGain)
    src.onended = () => { if (currentSource === src) currentSource = null }
    src.start(0)
    currentSource = src
  } catch (e) {
    console.warn('[audio] play failed', e)
  }
}

// Call once inside a user-gesture handler to unlock the AudioContext.
let unlocked = false
export function unlockAudio() {
  if (unlocked) return
  const c = ensureCtx()
  if (!c) return
  unlocked = true
  if (c.state === 'suspended') { c.resume().catch(() => {}) }
  // Warm the cache so first playback in-game has zero fetch latency.
  ;['zh', 'en'].forEach(l => { for (let i = 1; i <= 5; i++) loadBuffer(l, i) })
}

export function stopAllAudio() {
  if (currentSource) { try { currentSource.stop() } catch (e) { /* ignore */ } currentSource = null }
}
