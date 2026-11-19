import { getItemImagePath } from '../config/items.js';

// 工具函数 - 数组打乱
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 工具函数 - 生成题目选项
export function generateOptions(targetItem, difficulty, allItems) {
  const options = [];

  // 添加正确答案
  const targetImageIndex = Math.floor(Math.random() * targetItem.images.length);
  const targetImage = getItemImagePath(targetItem.name, targetItem.images[targetImageIndex]);
  const rotation = difficulty.rotation && Math.random() > 0.5;

  options.push({
    name: targetItem.name,
    image: targetImage,
    isCorrect: true,
    rotation: rotation
  });

  // 生成错误选项
  const wrongItems = [];

  if (difficulty.needInterference) {
    // 需要包含干扰项(相似物品)
    const interferenceItem = allItems.find(item => item.name === targetItem.interference);
    if (interferenceItem) {
      const interferenceImageIndex = Math.floor(Math.random() * interferenceItem.images.length);
      wrongItems.push({
        name: interferenceItem.name,
        image: getItemImagePath(interferenceItem.name, interferenceItem.images[interferenceImageIndex]),
        isCorrect: false,
        rotation: false
      });
    }
  }

  // 填充其他错误选项(不与目标物品和其干扰项相同)
  const availableItems = allItems.filter(item =>
    item.name !== targetItem.name &&
    item.name !== targetItem.interference
  );

  while (wrongItems.length < 3) {
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const randomImageIndex = Math.floor(Math.random() * randomItem.images.length);

    // 确保不重复
    if (!wrongItems.find(item => item.name === randomItem.name)) {
      wrongItems.push({
        name: randomItem.name,
        image: getItemImagePath(randomItem.name, randomItem.images[randomImageIndex]),
        isCorrect: false,
        rotation: false
      });
    }
  }

  // 合并并打乱选项
  const allOptions = [...options, ...wrongItems];
  return shuffleArray(allOptions);
}

// 工具函数 - 格式化时间
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 工具函数 - 计算平均值
export function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}
