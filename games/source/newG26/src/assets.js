/** webpack 静态资源解析（替代 /voice 绝对路径） */
const __voiceCtx = require.context('../public/voice', true, /\.mp3$/i)

/**
 * <summary>
 * 规范化资源 key，去掉前导斜杠与指定前缀
 * </summary>
 */
function normalizeKey(p, stripPrefixes) {
  let s = String(p || '')
  s = s.replace(/^\/+/, '')
  for (let i = 0; i < stripPrefixes.length; i++) {
    const pre = stripPrefixes[i]
    if (s.indexOf(pre) === 0) { s = s.slice(pre.length); break }
  }
  return './' + s.replace(/^\.\//, '')
}

/**
 * <summary>
 * 解析语音资源为 webpack 打包后的可用 URL
 * </summary>
 */
export function resolveVoice(p) {
  const key = normalizeKey(p, ['voice/'])
  try { return __voiceCtx(key) } catch (e) { return typeof p === 'string' ? p : '' }
}
