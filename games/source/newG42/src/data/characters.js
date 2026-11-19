// Character pool. Every field has both zh & en so questions and options
// can be rendered in either language without swapping the profile mid-game.
// Ages are integers. Gender is 'M' or 'F'.
import { resolveImage } from '../assets.js'

const jobs = [
  { zh: '医生', en: 'Doctor' },
  { zh: '教师', en: 'Teacher' },
  { zh: '工程师', en: 'Engineer' },
  { zh: '律师', en: 'Lawyer' },
  { zh: '会计师', en: 'Accountant' },
  { zh: '设计师', en: 'Designer' },
  { zh: '记者', en: 'Journalist' },
  { zh: '警察', en: 'Police Officer' },
  { zh: '厨师', en: 'Chef' },
  { zh: '飞行员', en: 'Pilot' },
  { zh: '护士', en: 'Nurse' },
  { zh: '程序员', en: 'Programmer' },
  { zh: '建筑师', en: 'Architect' },
  { zh: '摄影师', en: 'Photographer' },
  { zh: '心理咨询师', en: 'Therapist' },
  { zh: '销售经理', en: 'Sales Manager' }
]

const hobbies = [
  { zh: '摄影', en: 'Photography' },
  { zh: '登山', en: 'Hiking' },
  { zh: '烹饪', en: 'Cooking' },
  { zh: '书法', en: 'Calligraphy' },
  { zh: '钢琴', en: 'Piano' },
  { zh: '绘画', en: 'Painting' },
  { zh: '跑步', en: 'Running' },
  { zh: '瑜伽', en: 'Yoga' },
  { zh: '围棋', en: 'Go' },
  { zh: '阅读', en: 'Reading' },
  { zh: '骑行', en: 'Cycling' },
  { zh: '游泳', en: 'Swimming' },
  { zh: '园艺', en: 'Gardening' },
  { zh: '滑雪', en: 'Skiing' },
  { zh: '街舞', en: 'Street Dance' }
]

const cities = [
  { zh: '北京', en: 'Beijing' },
  { zh: '上海', en: 'Shanghai' },
  { zh: '广州', en: 'Guangzhou' },
  { zh: '深圳', en: 'Shenzhen' },
  { zh: '杭州', en: 'Hangzhou' },
  { zh: '成都', en: 'Chengdu' },
  { zh: '南京', en: 'Nanjing' },
  { zh: '武汉', en: 'Wuhan' },
  { zh: '西安', en: 'Xi’an' },
  { zh: '苏州', en: 'Suzhou' },
  { zh: '厦门', en: 'Xiamen' },
  { zh: '青岛', en: 'Qingdao' }
]

const companies = [
  { zh: '协和医院', en: 'Union Hospital' },
  { zh: '清华大学', en: 'Tsinghua University' },
  { zh: '华为技术', en: 'Huawei' },
  { zh: '腾讯科技', en: 'Tencent' },
  { zh: '阿里巴巴', en: 'Alibaba' },
  { zh: '中国银行', en: 'Bank of China' },
  { zh: '国家电网', en: 'State Grid' },
  { zh: '光明日报社', en: 'Guangming Daily' },
  { zh: '央视新闻', en: 'CCTV News' },
  { zh: '中航工业', en: 'AVIC' },
  { zh: '同仁堂', en: 'Tongrentang' },
  { zh: '万科集团', en: 'Vanke Group' }
]

const educations = [
  { zh: '本科', en: 'Bachelor' },
  { zh: '硕士', en: 'Master' },
  { zh: '博士', en: 'PhD' },
  { zh: '大专', en: 'Associate' }
]

const namesM = [
  { zh: '李明', en: 'Li Ming' },
  { zh: '张伟', en: 'Zhang Wei' },
  { zh: '王强', en: 'Wang Qiang' },
  { zh: '陈昊', en: 'Chen Hao' },
  { zh: '刘洋', en: 'Liu Yang' },
  { zh: '赵峰', en: 'Zhao Feng' },
  { zh: '周航', en: 'Zhou Hang' },
  { zh: '孙宇', en: 'Sun Yu' },
  { zh: '林涛', en: 'Lin Tao' },
  { zh: '黄磊', en: 'Huang Lei' }
]

const namesF = [
  { zh: '李婷', en: 'Li Ting' },
  { zh: '王芳', en: 'Wang Fang' },
  { zh: '张丽', en: 'Zhang Li' },
  { zh: '陈雪', en: 'Chen Xue' },
  { zh: '刘悦', en: 'Liu Yue' },
  { zh: '赵敏', en: 'Zhao Min' },
  { zh: '周雅', en: 'Zhou Ya' },
  { zh: '孙琳', en: 'Sun Lin' },
  { zh: '林静', en: 'Lin Jing' },
  { zh: '黄婧', en: 'Huang Jing' }
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// Number of avatar images available in /public/images/{man,woman}/.
// Keep in sync with the actual files (currently 1.png .. N.png).
const AVATAR_COUNT = { M: 4, F: 4 } // 男女头像数量

/**
 * <summary>
 * 按性别随机选取头像，经 resolveImage 转为 webpack 可访问 URL
 * </summary>
 */
export function randomAvatar(gender) {
  const n = AVATAR_COUNT[gender] || 1 // 该性别头像总数
  const idx = 1 + Math.floor(Math.random() * n) // 随机序号（1-based）
  const dir = gender === 'M' ? 'man' : 'woman' // 头像目录
  return resolveImage(`/images/${dir}/${idx}.png`)
}

// A profile always has all fields defined; the game selects a subset per level.
export function generateProfile() {
  const gender = Math.random() < 0.5 ? 'M' : 'F'
  const name = pick(gender === 'M' ? namesM : namesF)
  const age = 22 + Math.floor(Math.random() * 40) // 22–61
  return {
    name,
    age,
    gender,
    avatar: randomAvatar(gender),
    job: pick(jobs),
    hobby: pick(hobbies),
    city: pick(cities),
    company: pick(companies),
    education: pick(educations)
  }
}

// Pools for building distractor options that "look right" (same field type).
export const POOLS = { jobs, hobbies, cities, companies, educations, namesM, namesF }
