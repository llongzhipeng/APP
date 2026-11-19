import { resolveVoice } from './assets'
// 语音播报：中文用 chinese 目录，英文用 english 目录
// 1.mp3 = 记忆星星顺序（showing 阶段）
// 2.mp3 = 依次点亮星星（input 阶段）

const cache = {}

function getAudio(langKey, n) {
  const key = `${langKey}_${n}`
  if (!cache[key]) {
    const audio = new Audio(resolveVoice(`/voice/${langKey}/${n}.mp3`))
    audio.preload = 'auto'
    cache[key] = audio
  }
  return cache[key]
}

let currentAudio = null

export function playVoice(lang, n) {
  const langKey = lang === 'zh' ? 'chinese' : 'english'
  // 先停止上一个语音，避免重叠
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
  const audio = getAudio(langKey, n)
  currentAudio = audio
  try {
    audio.currentTime = 0
    const p = audio.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch (e) { /* 忽略播放错误 */ }
}

export function stopVoice() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}
