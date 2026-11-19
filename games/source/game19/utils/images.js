const ctx = require.context('../public/images', true, /\.png$/)

export function pairImage(category, folder, index) {
  return ctx(`./${category}/${folder}/${index}.png`)
}
