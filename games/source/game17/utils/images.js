const ctx = require.context('../public/images', true, /\.png$/)

export function spotDiffImage(type, sub, file) {
  if (sub) return ctx(`./${type}/${sub}/${file}`)
  return ctx(`./${type}/${file}`)
}
