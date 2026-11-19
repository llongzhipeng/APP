// Preloaded prompt-audio player.
// Files live at public/voice/{chinese|english}/{1|2}.mp3
//   1.mp3 → 近义词 / synonym prompt
//   2.mp3 → 反义词 / antonym prompt
import { resolveVoice } from './assets.js'

const cache = {} // Audio 实例缓存

/**
 * <summary>
 * 按语言与题型取预加载 Audio（近义=1 / 反义=2）
 * </summary>
 */
function get(locale, kind) {
  const folder = locale === 'en' ? 'english' : 'chinese' // 语音目录
  const n = kind === 'syn' ? 1 : 2 // 文件序号
  const key = `${folder}/${n}` // 缓存键
  if (!cache[key]) {
    const a = new Audio(resolveVoice(`/voice/${folder}/${n}.mp3`)) // webpack 解析后的 URL
    a.preload = 'auto'
    cache[key] = a
  }
  return cache[key]
}

let currentAudio = null // 当前播放实例

/**
 * <summary>
 * 播放提示音（近义词 / 反义词）
 * </summary>
 */
export function playPrompt(locale, kind) {
  try {
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    const a = get(locale, kind) // 目标音频
    a.currentTime = 0
    const p = a.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
    currentAudio = a
  } catch (_) { /* ignore autoplay/browser restrictions */ }
}

/**
 * <summary>
 * 停止当前提示音
 * </summary>
 */
export function stopPrompt() {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
}
