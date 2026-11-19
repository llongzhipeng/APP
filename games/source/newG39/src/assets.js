/** webpack 静态资源解析（替代 /voice 绝对路径与 import.meta.env） */
const __voiceCtx = require.context('../public/voice', true, /\.(mp3|wav)$/i)

function normalizeKey(p, stripPrefixes) {
  let s = String(p || '')
  s = s.replace(/^\/+/, '')
  for (let i = 0; i < stripPrefixes.length; i++) {
    const pre = stripPrefixes[i]
    if (s.indexOf(pre) === 0) { s = s.slice(pre.length); break }
  }
  return './' + s.replace(/^\.\//, '')
}

export function resolveVoice(p) {
  const key = normalizeKey(p, ['voice/'])
  try { return __voiceCtx(key) } catch (e) { return typeof p === 'string' ? p : '' }
}
