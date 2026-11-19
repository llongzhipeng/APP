const elementImages = require.context('../public/image/elements', true, /\.jpg$/)

function getImagePath(relativePath) {
  return elementImages(`./${relativePath}`)
}

export const categories = {
  fruits: {
    zh: '水果', en: 'Fruits',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`fruits/${31 + i}.jpg`))
  },
  vegetable: {
    zh: '蔬菜', en: 'Vegetables',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`vegetable/${71 + i}.jpg`))
  },
  animal: {
    zh: '动物', en: 'Animals',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`animal/${String(i + 1).padStart(2, '0')}.jpg`))
  },
  botany: {
    zh: '植物', en: 'Plants',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`botany/${11 + i}.jpg`))
  },
  furniture: {
    zh: '家具', en: 'Furniture',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`furniture/${41 + i}.jpg`))
  },
  electric_appliance: {
    zh: '电器', en: 'Appliances',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`electric_appliance/${21 + i}.jpg`))
  },
  metal: {
    zh: '金属', en: 'Metal',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`metal/${51 + i}.jpg`))
  },
  nonmetal: {
    zh: '非金属', en: 'Non-metal',
    images: Array.from({ length: 10 }, (_, i) => getImagePath(`nonmetal/${61 + i}.jpg`))
  }
}

export const otherItems = [
  { src: getImagePath('Other/1.jpg'),  name: { zh: '白衬衫',   en: 'White Shirt' } },
  { src: getImagePath('Other/2.jpg'),  name: { zh: '大白鹅',   en: 'Big White Goose' } },
  { src: getImagePath('Other/3.jpg'),  name: { zh: '大黑狗',   en: 'Big Black Dog' } },
  { src: getImagePath('Other/4.jpg'),  name: { zh: '粉色脸盆', en: 'Pink Basin' } },
  { src: getImagePath('Other/5.jpg'),  name: { zh: '黑色山羊', en: 'Black Goat' } },
  { src: getImagePath('Other/6.jpg'),  name: { zh: '红苹果',   en: 'Red Apple' } },
  { src: getImagePath('Other/7.jpg'),  name: { zh: '黄瓶子',   en: 'Yellow Bottle' } },
  { src: getImagePath('Other/8.jpg'),  name: { zh: '蓝色拖鞋', en: 'Blue Slipper' } },
  { src: getImagePath('Other/9.jpg'),  name: { zh: '蓝鹦鹉',   en: 'Blue Parrot' } },
  { src: getImagePath('Other/10.jpg'), name: { zh: '狸花猫',   en: 'Tabby Cat' } }
]

export const levelConfig = [
  null,
  { coefficient: 1, optionCount: 2, timeLimit: 10, rule: { zh: '请对以下物品进行正确归类（单一属性）', en: 'Classify the item correctly (single attribute)' } },
  { coefficient: 1.5, optionCount: 2, timeLimit: 10, rule: { zh: '请对以下物品进行正确归类（单一属性）', en: 'Classify the item correctly (single attribute)' } },
  { coefficient: 2, optionCount: 4, timeLimit: 10, rule: { zh: '请对以下物品进行正确归类（双重属性）', en: 'Classify the item correctly (dual attribute)' } },
  { coefficient: 2.5, optionCount: 4, timeLimit: 10, rule: { zh: '请对以下物品进行正确归类（双重属性）', en: 'Classify the item correctly (dual attribute)' } },
  { coefficient: 3, optionCount: 4, timeLimit: 10, rule: { zh: '请找出以下物品中与其他不同的一项', en: 'Find the item that is different from the others' } },
  { coefficient: 3.5, optionCount: 4, timeLimit: 10, rule: { zh: '请找出以下物品中与其他不同的一项', en: 'Find the item that is different from the others' } }
]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateQuestion(level) {
  if (level === 1) {
    const pairs = [['fruits', 'vegetable'], ['animal', 'botany']]
    const pair = randomItem(pairs)
    const correctCat = randomItem(pair)
    const wrongCat = pair.find(c => c !== correctCat)
    const image = randomItem(categories[correctCat].images)
    return {
      type: 'classify',
      image,
      options: shuffle([
        { label: { zh: categories[correctCat].zh, en: categories[correctCat].en }, correct: true },
        { label: { zh: categories[wrongCat].zh, en: categories[wrongCat].en }, correct: false }
      ])
    }
  }

  if (level === 2) {
    const pairs = [['furniture', 'electric_appliance'], ['metal', 'nonmetal']]
    const pair = randomItem(pairs)
    const correctCat = randomItem(pair)
    const wrongCat = pair.find(c => c !== correctCat)
    const image = randomItem(categories[correctCat].images)
    return {
      type: 'classify',
      image,
      options: shuffle([
        { label: { zh: categories[correctCat].zh, en: categories[correctCat].en }, correct: true },
        { label: { zh: categories[wrongCat].zh, en: categories[wrongCat].en }, correct: false }
      ])
    }
  }

  if (level === 3 || level === 4) {
    const itemIndex = Math.floor(Math.random() * otherItems.length)
    const item = otherItems[itemIndex]
    const otherPool = otherItems.filter((_, i) => i !== itemIndex)

    let wrongItems
    if (level === 4) {
      // 优先选名称中含共同字符的干扰项，增加混淆难度
      const nameChars = new Set([...item.name.zh])
      const similar = otherPool.filter(o => [...o.name.zh].some(ch => nameChars.has(ch)))
      const dissimilar = otherPool.filter(o => ![...o.name.zh].some(ch => nameChars.has(ch)))
      wrongItems = shuffle([...similar, ...dissimilar]).slice(0, 3)
    } else {
      wrongItems = shuffle(otherPool).slice(0, 3)
    }

    return {
      type: 'classify-dual',
      image: item.src,
      options: shuffle([
        { label: { zh: item.name.zh, en: item.name.en }, correct: true },
        ...wrongItems.map(w => ({ label: { zh: w.name.zh, en: w.name.en }, correct: false }))
      ])
    }
  }

  if (level === 5) {
    const pairs = [['fruits', 'vegetable'], ['animal', 'botany']]
    const pair = randomItem(pairs)
    const mainCat = randomItem(pair)
    const oddCat = pair.find(c => c !== mainCat)
    const mainImages = shuffle([...categories[mainCat].images]).slice(0, 3)
    const oddImage = randomItem(categories[oddCat].images)
    return {
      type: 'oddone',
      images: shuffle([
        ...mainImages.map(src => ({ src, correct: false, category: mainCat })),
        { src: oddImage, correct: true, category: oddCat }
      ])
    }
  }

  if (level === 6) {
    const pairs = [['furniture', 'electric_appliance'], ['metal', 'nonmetal']]
    const pair = randomItem(pairs)
    const mainCat = randomItem(pair)
    const oddCat = pair.find(c => c !== mainCat)
    const mainImages = shuffle([...categories[mainCat].images]).slice(0, 3)
    const oddImage = randomItem(categories[oddCat].images)
    return {
      type: 'oddone',
      images: shuffle([
        ...mainImages.map(src => ({ src, correct: false, category: mainCat })),
        { src: oddImage, correct: true, category: oddCat }
      ])
    }
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('game14_history') || '[]')
  } catch (e) {
    return []
  }
}

export function saveHistory(record) {
  const history = getHistory()
  history.unshift(record)
  if (history.length > 100) history.splice(100)
  localStorage.setItem('game14_history', JSON.stringify(history))
}
