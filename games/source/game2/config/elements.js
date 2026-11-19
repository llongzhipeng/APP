// 图片元素库配置
// 图片资源统一从 game2/public 读取

const elementImages = require.context('../public/images/elements', true, /\.png$/)

function resolveElementImage(category, id) {
  return elementImages(`./${category}/${String(id).padStart(3, '0')}.png`)
}

// 动物类元素 (ID: 1-100)
const animals = []
for (let i = 1; i <= 100; i++) {
  animals.push({
    id: i,
    path: resolveElementImage('animals', i),
    category: 'animals',
    name: `Animal ${i}`
  })
}

// 家具类元素 (ID: 101-200)
const furniture = []
for (let i = 101; i <= 200; i++) {
  furniture.push({
    id: i,
    path: resolveElementImage('furniture', i),
    category: 'furniture',
    name: `Furniture ${i}`
  })
}

// 水果类元素 (ID: 201-300)
const fruits = []
for (let i = 201; i <= 300; i++) {
  fruits.push({
    id: i,
    path: resolveElementImage('fruits', i),
    category: 'fruits',
    name: `Fruit ${i}`
  })
}

export const ELEMENT_LIBRARY = {
  animals,
  furniture,
  fruits
}

// 获取所有元素的扁平数组
export function getAllElements() {
  return [...ELEMENT_LIBRARY.animals, ...ELEMENT_LIBRARY.furniture, ...ELEMENT_LIBRARY.fruits]
}

// 根据ID获取元素
export function getElementById(id) {
  const allElements = getAllElements()
  return allElements.find(e => e.id === id)
}

// 根据分类获取元素
export function getElementsByCategory(category) {
  return ELEMENT_LIBRARY[category] || []
}

// 获取随机元素
export function getRandomElements(count) {
  const allElements = getAllElements()
  const shuffled = [...allElements].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
