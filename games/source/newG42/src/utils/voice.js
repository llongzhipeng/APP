// Small voice-cue helper. Plays /public/voice/{lang}/{n}.mp3.
// 1.mp3 → memorize cue, 2.mp3 → recall cue.
import { i18n } from '../i18n.js'
import { resolveVoice } from '../assets.js'

let current = null // 当前播放中的 Audio 实例

/**
 * <summary>
 * 播放记忆/回忆语音提示（经 resolveVoice 解析打包路径）
 * </summary>
 */
export function playCue(n) {
  try {
    stopCue()
    const dir = i18n.lang === 'en' ? 'english' : 'chinese' // 语音语言目录
    const audio = new Audio(resolveVoice(`/voice/${dir}/${n}.mp3`)) // 提示音实例
    audio.volume = 1
    current = audio
    // Fire and forget; ignore autoplay rejection so game keeps flowing.
    const p = audio.play() // play Promise
    if (p && p.catch) p.catch(() => {})
  } catch (e) {
    /* noop */
  }
}

/**
 * <summary>
 * 停止当前语音提示
 * </summary>
 */
export function stopCue() {
  if (current) {
    try { current.pause() } catch (e) {}
    current = null
  }
}
