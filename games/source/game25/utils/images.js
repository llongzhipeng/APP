const fruitCtx = require.context('../public/images/elements/fruits', false, /\.png$/)
const animalCtx = require.context('../public/images/elements/animals', false, /\.png$/)

export function fruitImage(file) {
  return fruitCtx(`./${file}`)
}

export function animalImage(file) {
  return animalCtx(`./${file}`)
}

export const FRUIT_FILES = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png']
export const ANIMAL_FILES = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png']

export const FRUIT_IMGS = FRUIT_FILES.map(fruitImage)
export const ANIMAL_IMGS = ANIMAL_FILES.map(animalImage)
