/** webpack 静态资源解析（替代 /images 绝对路径） */
const __imgCtx = require.context('../public/images', true, /\.(png|jpe?g|gif|svg|webp|bmp)$/i)

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
 * 解析图片资源为 webpack 打包后的可用 URL
 * </summary>
 */
export function resolveImage(p) {
  const key = normalizeKey(p, ['images/', 'image/'])
  try { return __imgCtx(key) } catch (e) {
    return typeof p === 'string' ? p : ''
  }
}
