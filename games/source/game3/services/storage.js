// 本地存储服务
const STORAGE_KEY = 'objectFindingTemple';

export const storageService = {
  // 保存训练记录
  saveTrainingRecord(record) {
    const history = this.getTrainingHistory();
    history.unshift(record);
    localStorage.setItem(`${STORAGE_KEY}_history`, JSON.stringify(history));
  },

  // 获取训练记录
  getTrainingHistory() {
    const data = localStorage.getItem(`${STORAGE_KEY}_history`);
    return data ? JSON.parse(data) : [];
  },

  // 清空训练记录
  clearTrainingHistory() {
    localStorage.removeItem(`${STORAGE_KEY}_history`);
  },

  // 保存语言设置
  saveLanguage(language) {
    localStorage.setItem(`${STORAGE_KEY}_language`, language);
  },

  // 获取语言设置
  getLanguage() {
    return localStorage.getItem(`${STORAGE_KEY}_language`) || 'zh';
  },

  // 保存是否已观看教程
  setTutorialViewed() {
    localStorage.setItem(`${STORAGE_KEY}_tutorialViewed`, 'true');
  },

  // 检查是否已观看教程
  hasTutorialViewed() {
    return localStorage.getItem(`${STORAGE_KEY}_tutorialViewed`) === 'true';
  }
};
