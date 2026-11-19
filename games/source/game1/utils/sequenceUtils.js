/**
 * 生成不重复的亮起序列
 * @param {number} matrixSize 矩阵尺寸（2-6）
 * @param {number} lightCount 亮起方块数量（难度+1）
 * @returns {Array} 坐标序列，格式如 ["0,0", "1,2"]
 */
export const generateSequence = (matrixSize, lightCount) => {
  const sequence = [];
  const totalCells = matrixSize * matrixSize;
  
  // 确保亮起数量不超过总格子数
  const safeLightCount = Math.min(lightCount, totalCells);

  while (sequence.length < safeLightCount) {
    const randomNum = Math.floor(Math.random() * totalCells);
    const row = Math.floor(randomNum / matrixSize);
    const col = randomNum % matrixSize;
    const coord = `${row},${col}`;
    
    if (!sequence.includes(coord)) {
      sequence.push(coord);
    }
  }
  return sequence;
};

/**
 * 验证用户点击序列是否正确
 * @param {Array} userSequence 用户点击序列
 * @param {Array} correctSequence 正确序列
 * @returns {boolean} 验证结果
 */
export const validateSequence = (userSequence, correctSequence) => {
  if (userSequence.length !== correctSequence.length) return false;
  return userSequence.every((coord, index) => coord === correctSequence[index]);
};