import { saveAs } from 'file-saver';

/**
 * 生成唯一ID（简化版UUID）
 * @returns {string} 唯一ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 保存训练记录到本地存储
 * @param {Object} record 训练记录对象
 */
export const saveRecord = (record, lang = 'zh') => {
  const newRecord = {
    recordId: generateId(),
    trainingTime: new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US'),
    trainingItem: lang === 'zh' ? '记忆矩阵' : 'Memory Matrix',
    ...record
  };

  const existingRecords = JSON.parse(localStorage.getItem('memoryMatrixRecords') || '[]');
  existingRecords.unshift(newRecord); // 最新记录在前
  localStorage.setItem('memoryMatrixRecords', JSON.stringify(existingRecords));
  return newRecord;
};

/**
 * 获取所有历史记录
 * @returns {Array} 历史记录数组
 */
export const getHistoryRecords = () => {
  return JSON.parse(localStorage.getItem('memoryMatrixRecords') || '[]');
};

/**
 * 导出记录为CSV文件
 * @param {Array} records 要导出的记录数组
 */
export const exportRecordsToCsv = (records, lang = 'zh', messages) => {
  if (records.length === 0) {
    alert(lang === 'zh' ? '暂无训练记录可导出！' : 'No records to export');
    return;
  }

  const fallbackHeaders = ['训练时间','训练项目','难度等级','实际时长(秒)','总次数','成功次数','失败次数','成功率(%)','平均反应时长(毫秒)','总分'];
  const headersList = (messages && messages[lang] && messages[lang].csv && messages[lang].csv.headers) || fallbackHeaders;
  const headers = headersList.join(',');

  // 处理记录数据
  const rows = records.map(record => [
    record.trainingTime,
    record.trainingItem,
    record.difficultyLevel,
    record.actualDuration,
    record.totalTimes,
    record.successTimes,
    record.failTimes,
    record.successRate.toFixed(1),
    record.averageReactionTime,
    record.score
  ].join(','));

  // 拼接CSV内容
  const csvContent = `${headers}\n${rows.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 下载文件
  const filename = lang === 'zh' ? `记忆矩阵训练记录_${new Date().toLocaleDateString()}.csv` : `MemoryMatrix_${new Date().toLocaleDateString()}.csv`;
  saveAs(blob, filename);
};