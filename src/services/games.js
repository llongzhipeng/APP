const definitions = [
  [1, 'jyjz', '记忆矩阵', '记忆力', 'memory-matrix'],
  [2, 'jyhsz', '记忆画师', '记忆力', 'memory-painter'],
  [3, 'xwsd', '寻物圣殿', '抽象能力'],
  [4, 'sslk', '速算连连看', '运算能力'],
  [5, 'csgw', '超市购物', '运算能力'],
  [6, 'szqb', '数字快捕', '注意力', 'number-catch'],
  [7, 'ystz', '颜色挑战', '注意力', 'color-response'],
  [8, 'ljlt', '逻辑链条', '抽象能力'],
  [9, 'szfb', '数字风暴', '记忆力'],
  [10, 'mzxh', '迷宫巡航', '视空间能力'],
  [11, 'dtqq', '动态追球', '视空间能力'],
  [12, 'bdx', '比大小', '抽象能力'],
  [13, 'qbqz', '残缺补全', '视空间能力'],
  [14, 'wpgl', '物品归类', '抽象能力'],
  [15, 'hsxb', '化石寻宝', '记忆力'],
  [16, 'hylx', '海洋序列', '抽象能力'],
  [17, 'spotdiff', '找不同', '视空间能力'],
  [18, 'mjmy', '面孔记忆', '记忆力'],
  [19, 'lxds', '联想大师', '记忆力'],
  [20, 'zlss', '注意力搜索', '注意力'],
  [21, 'szlx', '数字连线', '记忆力'],
  [22, 'mcgf', '命名工坊', '记忆力'],
  [23, 'yspp', '钥匙匹配', '记忆力'],
  [24, 'jmtz', '积木挑战', '记忆力'],
  [25, 'slbj', '数量比较', '记忆力'],
  ['newG01', 'hmtz', '海马体挑战', '记忆力'],
  ['newG02', 'lccj', '连词成句', '语言能力'],
  ['newG03', 'syz', '数鸭子', '运算能力'],
  ['newG04', 'yshy', '颜色回忆', '记忆力'],
  ['newG05', 'ctdc', '餐厅点餐', '记忆力'],
  ['newG06', 'jyfp', '记忆翻牌', '记忆力'],
  ['newG07', 'xzhy', '寻找黑羊', '记忆力'],
  ['newG08', 'slzt', '数列侦探', '抽象能力'],
  ['newG09', 'dds', '打地鼠', '执行能力'],
  ['newG10', 'gwqd', '购物清单', '记忆力'],
  ['newG11', 'xzxm', '寻找小猫', '执行能力'],
  ['newG12', 'qxjy', '情绪记忆', '记忆力'],
  ['newG13', 'dwygp', '动物园购票', '运算能力'],
  ['newG14', 'szfbyy', '数字风暴（语音版）', '记忆力'],
  ['newG15', 'zysxt', '左右手协调', '视空间能力'],
  ['newG17', 'xgws', '小狗喂食', '记忆力'],
  ['newG19', 'cyjc', '成语纠错', '语言能力'],
  ['newG20', 'shdr', '送货达人', '注意力'],
  ['newG21', 'xxlx', '星星连线', '记忆力'],
  ['newG22', 'jssc', '极速赛车', '执行能力'],
  ['newG23', 'stct', '视听冲突', '执行能力'],
  ['newG24', 'hzxly', '汉字训练营', '语言能力'],
  ['newG25', 'qjyx', '拳击游戏', '执行能力'],
  ['newG26', 'jzqj', '节奏敲击', '执行能力'],
  ['newG27', 'jyzbtxj', '记忆藏宝图（细节）', '记忆力'],
  ['newG28', 'aqcfsb', '安全厨房（识别）', '执行能力'],
  ['newG29', 'xhshz', '星海守护者', '执行能力'],
  ['newG31', 'yjfzj', '音阶复制机', '记忆力'],
  ['newG32', 'ktxx', '课堂学习', '执行能力'],
  ['newG33', 'sjzh', '视角转换', '视空间能力'],
  ['newG34', 'ktccy', '看图猜成语', '语言能力'],
  ['newG35', 'cyfl', '词义分类', '语言能力'],
  ['newG36', 'cyfs', '词语复述', '记忆力'],
  ['newG37', 'fltzs', '分类挑战赛', '抽象能力'],
  ['newG38', 'yhjsq', '烟花计数器', '执行能力'],
  ['newG39', 'shhd', '守护花朵', '执行能力'],
  ['newG40', 'kjjx', '空间镜像', '视空间能力'],
  ['newG41', 'tktxj', '太空探险家', '执行能力'],
  ['newG42', 'rwda', '人物档案', '记忆力'],
  ['newG43', 'ptds', '拼图大师', '记忆力'],
  ['newG44', 'szszs', '时钟设置师', '执行能力'],
  ['newG45', 'zhzt', '折痕侦探', '视空间能力'],
  ['newG46', 'hyjj', '火眼金睛', '视空间能力'],
  ['newG47', 'jyzbtwz', '记忆藏宝图（位置）', '记忆力'],
  ['newG48', 'qxsjzl', '情绪收集之旅', '社会能力'],
  ['newG49', 'aqcfwd', '安全厨房（问答）', '执行能力'],
  ['newG50', 'cytk', '成语填空', '语言能力'],
  ['newG51', 'ghdr', '规划达人', '执行能力'],
]

export const games = definitions.map(([source, key, title, category, oldKey]) => ({
  key, title, category, directory: typeof source === 'number' ? 'game' + source : source, oldKey,
}))

export function findGame(key) {
  return games.find(game => game.key === key || game.directory === key || (game.oldKey && game.oldKey === key))
}

export function gameURL(game, task, channel) {
  let prefix = '/hybrid/html/training'
  let platform = 'app'
  // #ifdef H5
  prefix = new URL('./static/web/training', window.location.href).pathname
  platform = 'h5'
  // #endif
  const requestedSeconds = Number(task.durationSeconds ?? (task.estimatedMinutes * 60))
  const seconds = requestedSeconds > 0 && Number.isFinite(requestedSeconds) ? Math.round(requestedSeconds) : 180
  const query = Object.entries({ game: game.key, channel, platform, seconds, difficulty: task.difficulty })
    .map(([key, value]) => key + '=' + encodeURIComponent(value)).join('&')
  return `${prefix}/${game.directory}/index.html?${query}`
}

const catalogCategories = {
  mzxh: '记忆力', szqb: '执行能力', hylx: '执行能力', shdr: '执行能力',
  dtqq: '注意力', dds: '注意力', xzxm: '注意力', jssc: '注意力',
  stct: '注意力', qjyx: '注意力', xhshz: '注意力', yhjsq: '注意力', tktxj: '注意力',
  lxds: '抽象能力', mcgf: '抽象能力', jmtz: '抽象能力', slbj: '运算能力',
  qxjy: '社会能力', mjmy: '社会能力',
}

export const trainingCategories = [
  ['视空间能力', '视空间能力'],
  ['记忆力', '记忆能力'],
  ['执行能力', '执行能力'],
  ['注意力', '注意能力'],
  ['抽象能力', '抽象能力'],
  ['运算能力', '计算能力'],
  ['语言能力', '语言能力'],
  ['社会能力', '社会能力'],
]

export function catalogCategory(game) {
  return catalogCategories[game.key] || game.category
}
