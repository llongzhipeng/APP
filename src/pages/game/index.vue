<script setup>
import { ref } from 'vue'
import { onBackPress, onLoad, onUnload } from '@dcloudio/uni-app'
import { findGame, gameURL } from '../../services/games'
import { completeTask, getSession, getTodayPlan, logout } from '../../services/training'

const task = ref(null)
const url = ref('')
const error = ref('')
const status = ref('')
const practiceMode = ref(false)
const channel = Date.now().toString(36) + Math.random().toString(36).slice(2)
let session
let planId
let game
let result
let savePromise
let saved = false
let leaving = false
let promptOpen = false

onLoad(async ({ plan, task: taskId, practice }) => {
  // #ifdef H5
  window.addEventListener('message', onFrameMessage)
  window.addEventListener('training-native-back', requestBack)
  // #endif
  session = getSession()
  if (!session) {
    logout()
    return
  }
  try {
    if (practice) {
      game = findGame(practice)
      if (!game) throw new Error('这个游戏尚未接入，请返回全部训练。')
      practiceMode.value = true
      task.value = { title: game.title, difficulty: 1, estimatedMinutes: 3 }
      uni.setNavigationBarTitle({ title: game.title })
      url.value = gameURL(game, task.value, channel)
      return
    }
    const dailyPlan = await getTodayPlan(session)
    const selected = dailyPlan.tasks.find(item => matchId(item.id, taskId))
    if (!matchId(dailyPlan.id, plan) || !selected || selected.completed) {
      throw new Error('任务已变更或已完成，请返回查看今日方案')
    }
    game = findGame(selected.gameKey)
    if (!game) throw new Error('这个游戏尚未接入，请返回今日训练。')
    planId = dailyPlan.id
    task.value = selected
    uni.setNavigationBarTitle({ title: selected.title })
    url.value = gameURL(game, selected, channel)
  } catch (cause) {
    error.value = cause.message
  }
})

onUnload(() => {
  // #ifdef H5
  window.removeEventListener('message', onFrameMessage)
  window.removeEventListener('training-native-back', requestBack)
  // #endif
})

onBackPress(({ from }) => {
  if (from === 'navigateBack' || leaving || !result || saved) return false
  requestBack()
  return true
})

function matchId(value, queryValue) {
  return String(value) === queryValue || encodeURIComponent(value) === queryValue
}

function onFrameMessage(event) {
  // #ifdef H5
  const frame = document.getElementById('training-game-frame')
  if (event.origin === window.location.origin && event.source === frame?.contentWindow) {
    onGameMessage(event.data)
  }
  // #endif
}

function onWebViewMessage(event) {
  const payload = event.detail?.data
  if (Array.isArray(payload)) payload.forEach(onGameMessage)
  else onGameMessage(payload)
}

function onGameMessage(data) {
  if (leaving || !data || data.source !== 'training-game' || data.channel !== channel || data.gameType !== game?.key) return
  if (practiceMode.value && data.type === 'finished') status.value = '练习结束'
  if (!practiceMode.value && (data.type === 'finished' || data.type === 'exit') && data.result && !result) {
    const { score, durationSeconds } = data.result
    if (Number.isFinite(score) && Number.isFinite(durationSeconds) && durationSeconds >= 0) {
      result = data.result
      saveResult()
    }
  }
  if (data.type === 'exit') requestBack()
}

function saveResult() {
  if (saved) return Promise.resolve(true)
  if (savePromise) return savePromise
  status.value = '正在保存…'
  savePromise = completeTask(session, planId, task.value.id, result)
    .then(() => {
      saved = true
      status.value = '已记录本次训练'
      uni.showToast({ title: '训练已记录', icon: 'success' })
      return true
    })
    .catch(() => {
      status.value = '保存失败'
      uni.showToast({ title: '保存失败，返回时可重试', icon: 'none' })
      return false
    })
    .finally(() => { savePromise = null })
  return savePromise
}

function goBack() {
  if (leaving) return
  leaving = true
  uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/today/index' }) })
}

async function requestBack() {
  if (leaving || promptOpen) return
  if (!result || saved || await saveResult()) {
    goBack()
    return
  }
  if (promptOpen) return
  promptOpen = true
  uni.showModal({
    title: '训练结果未保存',
    content: '可以再次提交结果，或退出本次训练。',
    confirmText: '重新提交',
    cancelText: '退出',
    success(answer) {
      promptOpen = false
      if (answer.confirm) requestBack()
      else if (answer.cancel) goBack()
    },
    fail() { promptOpen = false },
  })
}
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="game-shell">
    <view class="game-bar topbar">
      <view class="topbar-inner">
        <button class="secondary" @click="requestBack">{{ practiceMode ? '返回全部训练' : '返回今日训练' }}</button>
        <text>{{ task?.title || '训练游戏' }}</text>
        <text v-if="status" class="status">{{ status }}</text>
      </view>
    </view>
    <iframe v-if="url" id="training-game-frame" allow="autoplay" :src="url" :title="task.title" />
    <view v-if="!url" class="state">
      <text v-if="error" class="error" role="alert">{{ error }}</text>
      <text v-else>正在加载训练任务…</text>
      <button v-if="error" class="secondary" @click="requestBack">返回任务清单</button>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef APP-PLUS -->
  <web-view v-if="url" :src="url" @message="onWebViewMessage" />
  <view v-if="!url" class="state">
    <text v-if="error" class="error" role="alert">{{ error }}</text>
    <text v-else>正在加载训练任务…</text>
    <button v-if="error" class="secondary" @click="requestBack">返回任务清单</button>
  </view>
  <!-- #endif -->
</template>

<style scoped>
.game-shell { display: flex; flex-direction: column; height: 100vh; height: 100dvh; }
.game-bar { flex: 0 0 auto; }
.game-bar .topbar-inner { min-height: 50px; padding-top: 6px; padding-bottom: 6px; font-weight: 750; }
.status { font-size: 12px; color: #315e73; }
#training-game-frame { display: block; width: 100%; min-height: 0; flex: 1 1 0; border: 0; }
.state { display: grid; gap: 12px; justify-items: center; text-align: center; padding: 28px 16px; }
</style>
