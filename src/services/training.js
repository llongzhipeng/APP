import { games } from './games'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
export const isDemo = !baseUrl
export const demoCode = 'DEMO-2026-001'
export const demoPin = '123456'
const sessionKey = `training-session:${baseUrl || 'demo'}`


export function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function getSession() {
  const session = uni.getStorageSync(sessionKey)
  return session && session.token && session.patient ? session : null
}

export function logout() {
  uni.removeStorageSync(sessionKey)
  uni.reLaunch({ url: '/pages/login/index' })
}

function request(path, method, { data, token } = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + path,
      method,
      data,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 12000,
      success({ statusCode, data: body }) {
        if (statusCode >= 200 && statusCode < 300) {
          resolve(body)
        } else if (statusCode === 401 && token) {
          logout()
          reject(new Error('登录已过期，请重新登录'))
        } else if (statusCode === 401 || statusCode === 403) {
          reject(new Error('训练码或 PIN 不正确'))
        } else {
          reject(new Error('服务暂时不可用，请稍后重试'))
        }
      },
      fail() { reject(new Error('网络连接失败，请检查网络后重试')) },
    })
  })
}

export async function signIn(trainingCode, pin) {
  let session
  if (isDemo) {
    if (trainingCode.toUpperCase() !== demoCode || pin !== demoPin) {
      throw new Error('训练码或 PIN 不正确')
    }
    session = { token: 'local-demo', patient: { id: 'demo', name: '演示用户', mrn: 'DEMO-001' } }
  } else {
    session = await request('/api/v1/auth/training-login', 'POST', { data: { trainingCode, pin } })
  }
  if (!session?.token || !session?.patient?.id) throw new Error('登录数据异常，请重试')
  uni.setStorageSync(sessionKey, session)
}

function demoProgressKey(planId) {
  return `training-progress:demo:${planId}`
}

export async function getTodayPlan(session) {
  if (!isDemo) {
    const plan = await request('/api/v1/training/plans/today', 'GET', { token: session.token })
    if (!plan?.id || !plan?.date || !Array.isArray(plan.tasks)) {
      throw new Error('训练方案数据异常，请刷新重试')
    }
    return plan
  }
  const date = dayKey()
  const id = `demo-${date}`
  const progress = uni.getStorageSync(demoProgressKey(id)) || {}
  return {
    id,
    date,
    tasks: games.map(({ key, title, category, oldKey }) => ({
      id: key, gameKey: key, title, category, difficulty: 2, estimatedMinutes: 3,
      completed: Boolean(progress[key] || (oldKey && progress[oldKey])),
    })),
  }
}

export async function completeTask(session, planId, taskId, result) {
  if (!isDemo) {
    const path = `/api/v1/training/plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(taskId)}/result`
    await request(path, 'PUT', { token: session.token, data: result })
    return
  }
  const key = demoProgressKey(planId)
  const progress = uni.getStorageSync(key) || {}
  uni.setStorageSync(key, { ...progress, [taskId]: result })
}
