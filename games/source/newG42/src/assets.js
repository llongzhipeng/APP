/** webpack 静态资源解析（替代 /images /voice 绝对路径） */
const __imgCtx = require.context('../public/images', true, /\.(png|jpe?g|gif|svg|webp|bmp)$/i) // 图片上下文
const __voiceCtx = require.context('../public/voice', true, /\.mp3$/i) // 语音上下文

/**
 * <summary>
 * 规范化资源 key，去掉前导斜杠与指定前缀，得到 require.context 可用的相对路径
 * </summary>
 */
function normalizeKey(p, stripPrefixes) {
  let s = String(p || '') // 原始路径
  s = s.replace(/^\/+/, '')
  for (let i = 0; i < stripPrefixes.length; i++) {
    const pre = stripPrefixes[i] // 待剥离前缀
    if (s.indexOf(pre) === 0) { s = s.slice(pre.length); break }
  }
  return './' + s.replace(/^\.\//, '')
}

/**
 * <summary>
 * 解析图片资源为 webpack 打包后的可用 URL
 * </summary>
 */
export function resolveImage(p) {
  const key = normalizeKey(p, ['images/', 'image/']) // context 查找 key
  try { return __imgCtx(key) } catch (e) {
    return typeof p === 'string' ? p : ''
  }
}

/**
 * <summary>
 * 解析语音资源为 webpack 打包后的可用 URL
 * </summary>
 */
export function resolveVoice(p) {
  const key = normalizeKey(p, ['voice/']) // context 查找 key
  try { return __voiceCtx(key) } catch (e) { return typeof p === 'string' ? p : '' }
}
