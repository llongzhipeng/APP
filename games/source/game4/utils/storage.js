/**
 * 本地存储管理工具
 */

const STORAGE_KEY = 'math_match_records';

/**
 * 保存训练记录
 * @param {object} record - 训练记录对象
 */
export function saveRecord(record) {
  try {
    const records = getRecords();
    records.unshift(record); // 最新的记录放在前面

    // 限制最多保存100条记录
    if (records.length > 100) {
      records.length = 100;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('保存记录失败:', error);
    return false;
  }
}

/**
 * 获取所有训练记录
 * @returns {Array} 训练记录数组
 */
export function getRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取记录失败:', error);
    return [];
  }
}

/**
 * 清空所有训练记录
 * @returns {boolean} 是否成功
 */
export function clearRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清空记录失败:', error);
    return false;
  }
}

/**
 * 获取最后一次的难度等级
 * @returns {number} 难度等级
 */
export function getLastDifficulty() {
  try {
    const difficulty = localStorage.getItem('last_difficulty');
    return difficulty ? parseInt(difficulty) : 1;
  } catch (error) {
    return 1;
  }
}

/**
 * 保存最后一次的难度等级
 * @param {number} level - 难度等级
 */
export function saveLastDifficulty(level) {
  try {
    localStorage.setItem('last_difficulty', level.toString());
  } catch (error) {
    console.error('保存难度失败:', error);
  }
}
