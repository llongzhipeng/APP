const ctx = require.context('../public/images', false, /\.png$/)

export function faceImage(name) {
  const key = String(name).replace(/\.png$/, '')
  return ctx(`./${key}.png`)
}
