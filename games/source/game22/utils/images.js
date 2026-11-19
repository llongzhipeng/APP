const ctx = require.context('../public/images', false, /\.png$/)

export function itemImage(name) {
  return ctx(`./${name}.png`)
}
