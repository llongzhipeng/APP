import { catalogCategory, findGame, games } from './games'

const defaultUrl = 'https://attentiondev.drbrain.net/drain-doctor-service'
const baseUrl = (import.meta.env.VITE_API_BASE_URL || defaultUrl).trim().replace(/\/+$/, '')
export const isDemo = import.meta.env.VITE_TRAINING_DEMO === 'true'
export const demoCode = 'DEMO-2026-001'
export const demoPin = '123456'
const sessionKey = isDemo ? 'training-session:demo' : 'training-pin-session:' + baseUrl

export function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function getSession() {
  const session = uni.getStorageSync(sessionKey)
  return session?.token && session.patient?.id != null ? session : null
}

export function logout() {
  uni.removeStorageSync(sessionKey)
  uni.reLaunch({ url: '/pages/login/index' })
}

function request(path, method, data, token) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + path, method, data,
      header: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      timeout: 12000,
      success({ statusCode, data: body }) {
        const code = body?.code
        if (statusCode >= 200 && statusCode < 300 && (code === 200 || code === '200')) {
          resolve(body.data)
          return
        }
        if (token && (statusCode === 401 || String(code) === '401')) {
          if (getSession()?.token === token) logout()
          reject(new Error('登录已过期，请重新登录'))
          return
        }
        reject(new Error(typeof body?.msg === 'string' && body.msg.trim()
          ? body.msg : token ? '请求失败，请刷新后重试' : '登录失败，请检查训练码和 PIN'))
      },
      fail() { reject(new Error('网络连接失败，请检查网络后重试')) },
    })
  })
}

export async function signIn(trainingCode, pin) {
  let session
  if (isDemo) {
    if (trainingCode.toUpperCase() !== demoCode || pin !== demoPin) throw new Error('训练码或 PIN 不正确')
    session = { token: 'local-demo', patient: { id: 'demo', name: '演示用户', storeNo: 'DEMO-001' } }
  } else {
    const data = await request('/login/pin', 'POST', { code: trainingCode, pin })
    const user = data?.user
    const archive = data?.archive
    const id = data?.archiveId ?? (typeof archive === 'object' ? archive?.id : archive)
    if (!/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) || typeof data?.token !== 'string' || !data.token.trim()) {
      throw new Error('登录返回的令牌或患者档案号无效')
    }
    const storeNo = String(user?.storeNo ?? '').trim()
    session = {
      token: data.token,
      patient: { id: Number(id), name: user?.name?.trim() || archive?.name || '档案号 ' + id, storeNo },
    }
  }
  uni.setStorageSync(sessionKey, session)
}

function normalizeTask(row) {
  if (!row || row.id == null || row.planId == null || typeof row.gameType !== 'string') {
    throw new Error('今日计划缺少任务编号或游戏类型')
  }
  const type = row.gameType.trim()
  const game = findGame(type) || games.find(item => item.title === type)
  const duration = Number(row.duration)
  const trained = Number(row.completeDuration ?? 0)
  const level = Number(row.level ?? 1)
  if (row.duration == null || ![0, 1, '0', '1'].includes(row.status) ||
      !Number.isInteger(duration) || duration < 0 || !Number.isInteger(trained) || trained < 0 || !Number.isInteger(level)) {
    throw new Error('今日计划中的时长、难度或状态无效')
  }
  return {
    id: String(row.planId) + '-' + String(row.id),
    gameKey: game?.key || type, title: game?.title || type,
    difficulty: level, estimatedMinutes: duration, completedMinutes: trained,
    completed: Number(row.status) === 1, updatedAt: row.updateTime || '',
    playable: Boolean(game) && duration > 0 && level >= 1 && level <= 6,
  }
}

function demoProgressKey(planId) {
  return 'training-progress:demo:' + planId
}

export async function getTodayPlan(session) {
  const date = dayKey()
  if (!isDemo) {
    const archiveId = session.patient.id
    const rows = (await request('/pbgamerecord/plan/today', 'GET', { archiveId }, session.token)) ?? []
    if (!Array.isArray(rows)) throw new Error('今日计划返回格式异常，请刷新重试')
    return { id: archiveId + '-' + date, date, tasks: rows.map(normalizeTask) }
  }
  const id = 'demo-' + date
  const progress = uni.getStorageSync(demoProgressKey(id)) || {}
  return {
    id, date,
    tasks: games.map(({ key, title, oldKey }) => {
      const record = progress[key] || (oldKey && progress[oldKey])
      return {
        id: key, gameKey: key, title, difficulty: 2, estimatedMinutes: 3,
        completedMinutes: (record?.durationSeconds || 0) / 60, completed: Boolean(record), playable: true,
      }
    }),
  }
}

const trainTypes = {
  '视空间能力': 'space', '记忆力': 'memory', '执行能力': 'attention', '注意力': 'implement',
  '抽象能力': 'abstract', '运算能力': 'capacity', '语言能力': 'language', '社会能力': 'society',
}

function metric(value, integer = false) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return integer ? Math.round(n) : n
}

export async function completeTask(session, planId, task, result) {
  if (!isDemo) {
    const game = findGame(task.gameKey)
    if (!game) throw new Error('任务对应的游戏无效')
    const record = {
      archiveId: session.patient.id, gameType: game.key, trainType: trainTypes[catalogCategory(game)],
      minTime: metric(result.minTime), maxTime: metric(result.maxTime), avgTime: metric(result.avgTime),
      score: metric(result.score), difficultyLevel: metric(result.difficultyLevel ?? task.difficulty, true),
      successCount: metric(result.successCount, true), failCount: metric(result.failCount, true),
      trainDuration: Math.round(result.durationSeconds / 60),
    }
    await request('/pbgamerecord/add', 'POST', record, session.token)
    return
  }
  const key = demoProgressKey(planId)
  const progress = uni.getStorageSync(key) || {}
  uni.setStorageSync(key, { ...progress, [task.id]: result })
}
