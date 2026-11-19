export const bgImage = require('../public/images/bacground.png')

const ctx = require.context('../public/images', false, /\.png$/)

export function fishImage(index) {
  return ctx(`./${index}.png`)
}
