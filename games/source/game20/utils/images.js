const ctx = require.context('../public/images/elements', true, /\.jpg$/)

export function elementImage(cat, n) {
  return ctx(`./${cat}/${n}.jpg`)
}
