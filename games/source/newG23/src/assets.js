/** webpack 静态资源解析（替代 /images /voice 绝对路径） */
const __voiceCtx = require.context('../public/voice', true, /\.mp3$/i)

function normalizeKey(p, stripPrefixes) {
  let s = String(p || '')
  s = s.replace(/^\/+/, '')
  for (let i = 0; i < stripPrefixes.length; i++) {
    const pre = stripPrefixes[i]
    if (s.indexOf(pre) === 0) { s = s.slice(pre.length); break }
  }
  return './' + s.replace(/^\.\//, '')
}

export function resolveImage(p) { return typeof p === 'string' ? p : '' }

export function resolveVoice(p) {
  const key = normalizeKey(p, ['voice/'])
  try { return __voiceCtx(key) } catch (e) { return typeof p === 'string' ? p : '' }
}

export function resolveAsset(p) {
  const s = String(p || '')
  if (/voice\//.test(s) || /\.mp3(\?|$)/i.test(s)) return resolveVoice(s)
  return resolveImage(s)
}
