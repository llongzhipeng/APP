// 物品配置文件
export const itemsConfig = [
  {
    name: 'automobile',
    zh: '汽车',
    en: 'automobile',
    interference: 'trucks',
    images: ['023.png', '024.png']
  },
  {
    name: 'trucks',
    zh: '卡车',
    en: 'trucks',
    interference: 'automobile',
    images: ['025.png', '026.png']
  },
  {
    name: 'basketball',
    zh: '篮球',
    en: 'basketball',
    interference: 'football',
    images: ['003.png', '004.png']
  },
  {
    name: 'football',
    zh: '足球',
    en: 'football',
    interference: 'basketball',
    images: ['001.png', '002.png']
  },
  {
    name: 'besom',
    zh: '扫把',
    en: 'besom',
    interference: 'mop',
    images: ['027.png', '028.png']
  },
  {
    name: 'mop',
    zh: '拖把',
    en: 'mop',
    interference: 'besom',
    images: ['029.png', '030.png']
  },
  {
    name: 'cabinet',
    zh: '衣柜',
    en: 'cabinet',
    interference: 'fridge',
    images: ['013.png', '014.png']
  },
  {
    name: 'fridge',
    zh: '冰箱',
    en: 'fridge',
    interference: 'cabinet',
    images: ['015.png', '016.png']
  },
  {
    name: 'computer',
    zh: '电脑',
    en: 'computer',
    interference: 'television',
    images: ['011.png', '012.png']
  },
  {
    name: 'television',
    zh: '电视机',
    en: 'television',
    interference: 'computer',
    images: ['009.png', '010.png']
  },
  {
    name: 'cycling',
    zh: '自行车',
    en: 'cycling',
    interference: 'electromobile',
    images: ['019.png', '020.png']
  },
  {
    name: 'electromobile',
    zh: '电动车',
    en: 'electromobile',
    interference: 'cycling',
    images: ['017.png', '018.png']
  },
  {
    name: 'duck_egg',
    zh: '鸭蛋',
    en: 'duck egg',
    interference: 'egg',
    images: ['007.png', '008.png']
  },
  {
    name: 'egg',
    zh: '鸡蛋',
    en: 'egg',
    interference: 'duck_egg',
    images: ['005.png', '006.png']
  },
  {
    name: 'pen',
    zh: '钢笔',
    en: 'pen',
    interference: 'pencil',
    images: ['021.png', '022.png']
  },
  {
    name: 'pencil',
    zh: '铅笔',
    en: 'pencil',
    interference: 'pen',
    images: ['031.png', '032.png']
  }
];

// 获取物品图片路径
export function getItemImagePath(itemName, imageName) {
  return require(`../public/image/elements/${itemName}/${imageName}`);
}
