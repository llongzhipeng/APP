export const bgImage = require('../public/images/bacground.png')

const animalCtx = require.context('../public/images', true, /\.png$/)

export function animalImage(type, index) {
  return animalCtx(`./${type}/${index}.png`)
}
