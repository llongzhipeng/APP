// localStorage 封装
const STORAGE_KEY = 'memory_painter_records'

export const storage = {
  // 获取所有训练记录
  getRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Failed to load training records:', e)
      return []
    }
  },

  // 保存单条训练记录
  saveRecord(record) {
    try {
      const records = this.getRecords()
      records.push(record)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      return true
    } catch (e) {
      console.error('Failed to save training record:', e)
      return false
    }
  },

  // 清空所有训练记录
  clearRecords() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (e) {
      console.error('Failed to clear training records:', e)
      return false
    }
  },

  // 获取最近N条记录
  getRecentRecords(count) {
    const records = this.getRecords()
    return records.slice(-count).reverse()
  },

  // 导出为CSV格式
  exportToCSV() {
    const records = this.getRecords()
    if (records.length === 0) {
      return ''
    }

    // CSV表头
    const headers = [
      '训练时间',
      '训练项目',
      '平均难度',
      '时长(秒)',
      '总次数',
      '成功次数',
      '失败次数',
      '成功率',
      '平均反应时长(秒)',
      '得分'
    ]

    // CSV数据行
    const rows = records.map(r => [
      r.trainingTime,
      r.projectName,
      r.averageDifficulty.toFixed(2),
      r.duration,
      r.totalCount,
      r.successCount,
      r.failureCount,
      (r.successRate * 100).toFixed(1) + '%',
      r.averageResponseTime.toFixed(2),
      r.score
    ])

    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return csvContent
  },

  // 下载CSV文件
  downloadCSV() {
    const csv = this.exportToCSV()
    if (!csv) {
      alert('没有可导出的记录')
      return
    }

    // 添加BOM以支持中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `memory_painter_records_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // 获取统计数据
  getStatistics() {
    const records = this.getRecords()
    if (records.length === 0) {
      return null
    }

    const totalRecords = records.length
    const totalScore = records.reduce((sum, r) => sum + r.score, 0)
    const totalQuestions = records.reduce((sum, r) => sum + r.totalCount, 0)
    const totalCorrect = records.reduce((sum, r) => sum + r.successCount, 0)
    const avgScore = totalScore / totalRecords
    const avgAccuracy = totalCorrect / totalQuestions

    return {
      totalRecords,
      totalScore,
      avgScore: avgScore.toFixed(1),
      totalQuestions,
      totalCorrect,
      avgAccuracy: (avgAccuracy * 100).toFixed(1) + '%'
    }
  }
}
