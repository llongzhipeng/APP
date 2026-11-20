<script setup>
import { getTrainingLanguage, setTrainingLanguage } from '../../services/language'
import { computed, ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import Brand from '../../components/Brand.vue'
import TrainingCard from '../../components/TrainingCard.vue'
import { catalogCategory, games, trainingCategories } from '../../services/games'
import { dayKey, getSession, getTodayPlan, isDemo, logout } from '../../services/training'

const session = ref(null)
const plan = ref(null)
const busy = ref(false)
const openingTask = ref(false)
const error = ref('')
const view = ref('today')
const category = ref(trainingCategories[0][0])
const language = ref(getTrainingLanguage())
function switchLanguage() {
  language.value = language.value === 'zh' ? 'en' : 'zh'
  setTrainingLanguage(language.value)
}
const tasks = computed(() => plan.value?.tasks ?? [])
const nextTask = computed(() => tasks.value.find(task => !task.completed && task.playable))
const canOpenTask = computed(() => !busy.value && !error.value && !openingTask.value)
const library = computed(() => games.filter(game => catalogCategory(game) === category.value))
const completed = computed(() => tasks.value.filter(task => task.completed).length)
const remaining = computed(() => tasks.value.reduce((sum, task) =>
  sum + (task.completed ? 0 : Math.max(0, task.estimatedMinutes - task.completedMinutes)), 0))
function taskNote(task) {
  const parts = [task.estimatedMinutes + ' 分钟', '难度 ' + task.difficulty + ' 级']
  if (task.completed || task.completedMinutes) parts.push('已训练 ' + Number(task.completedMinutes.toFixed(2)) + ' 分钟')
  if (task.completed && task.updatedAt) parts.push('状态更新于 ' + task.updatedAt)
  if (!task.completed && !task.playable) parts.push('暂不可启动')
  return parts.join(' · ')
}
const percent = computed(() => tasks.value.length ? Math.round(100 * completed.value / tasks.value.length) : 0)
const dateText = computed(() => {
  const [year, month, day] = (plan.value?.date || dayKey()).split('-').map(Number)
  return `${month}月${day}日 星期${'日一二三四五六'[new Date(year, month - 1, day).getDay()]}`
})
let lastLoad = 0

async function refresh() {
  const current = getSession()
  if (!current) {
    logout()
    return
  }
  const load = ++lastLoad
  session.value = current
  busy.value = true
  error.value = ''
  try {
    const next = await getTodayPlan(current)
    if (load === lastLoad) plan.value = next
  } catch (cause) {
    if (load === lastLoad) error.value = cause.message
  } finally {
    if (load === lastLoad) {
      busy.value = false
      uni.stopPullDownRefresh()
    }
  }
}

onShow(refresh)
onPullDownRefresh(refresh)

function openTask(task) {
  if (!canOpenTask.value || !task?.playable || task.completed) return
  const planId = encodeURIComponent(plan.value.id)
  const taskId = encodeURIComponent(task.id)
  openingTask.value = true
  uni.navigateTo({
    url: `/pages/game/index?plan=${planId}&task=${taskId}`,
    fail: () => uni.showToast({ title: '暂时无法打开训练，请重试', icon: 'none' }),
    complete: () => { openingTask.value = false },
  })
}

function openPractice(game) {
  uni.navigateTo({ url: `/pages/game/index?practice=${encodeURIComponent(game.key)}` })
}
</script>

<template>
  <view class="workspace">
    <view class="sidebar">
      <Brand compact />
      <view class="workspace-nav">
        <button class="nav-item" :class="{ selected: view === 'today' }" @click="view = 'today'">
          <image class="icon" src="/static/icons/clock.png" mode="aspectFit" />
          今日训练
        </button>
        <button class="nav-item" :class="{ selected: view === 'library' }" @click="view = 'library'">
          <image class="icon" src="/static/icons/brain.png" mode="aspectFit" />
          全部训练
        </button>
      </view>
    </view>

    <view class="workspace-main">
      <view class="workspace-header">
        <text class="workspace-title">训练工作台</text>
        <view v-if="session" class="account">
          <view class="avatar"><image class="icon" src="/static/icons/person.png" mode="aspectFit" /></view>
          <view class="account-details">
            <text class="patient">{{ session.patient.name }}</text>
            <text v-if="session.patient.mrn" class="mrn">病历号 {{ session.patient.mrn }}</text>
          </view>
          <button class="exit language-toggle" aria-label="切换训练语言 / Switch training language" @click="switchLanguage">{{ language === 'en' ? 'Training · English' : '训练语言 · 中文' }}</button>
          <button class="exit" @click="logout">退出</button>
        </view>
      </view>

      <view class="content">
        <template v-if="view === 'today'">
          <view class="heading">
            <view>
              <text class="date">{{ dateText }}</text>
              <text class="headline">今日训练</text>
            </view>
            <button class="secondary" :disabled="busy" @click="refresh">{{ busy ? '刷新中…' : '刷新方案' }}</button>
          </view>
          <view v-if="plan" class="progress-card">
            <view class="progress-summary">
              <view>
                <text class="stat-label">今日完成进度</text>
                <view class="total"><text class="count">{{ completed }}</text><text>/ {{ tasks.length }} 项</text></view>
              </view>
              <view class="time-stat">
                <text class="stat-label">剩余时长</text>
                <view class="minutes">{{ Number(remaining.toFixed(2)) }} <text>分钟</text></view>
              </view>
            </view>
            <view class="progress-line">
              <view class="progress-track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
                <view class="progress-fill" :style="{ width: percent + '%' }" />
              </view>
              <text class="progress-label">{{ percent }}%</text>
            </view>
          </view>
          <view class="section">
            <view class="section-heading">
              <view class="section-title">
                <text>今日训练任务</text>
                <text v-if="isDemo" class="demo-note">演示方案</text>
              </view>
              <button class="primary quick-start" :disabled="!canOpenTask || !nextTask" @click="openTask(nextTask)">一键启动</button>
            </view>
            <view v-if="error" class="empty" role="alert">{{ error }}</view>
            <view v-else-if="busy && !plan" class="empty">正在加载今日方案…</view>
            <view v-else-if="!tasks.length" class="empty">今天暂无训练任务</view>
            <view v-else class="daily-list">
              <TrainingCard v-for="task in tasks" :key="task.id" task-row :game-key="task.gameKey" :title="task.title"
                :note="taskNote(task)"
                :completed="task.completed" :disabled="task.completed || !task.playable || !canOpenTask" @select="openTask(task)" />
            </view>
          </view>
        </template>

        <template v-else>
          <view class="heading">
            <view>
              <text class="headline">全部训练</text>
              <text class="library-description">按能力选择游戏进行自由练习</text>
            </view>
          </view>
          <view class="section">
            <scroll-view scroll-x class="category-scroll">
              <view class="category-bar">
                <button v-for="[key, label] in trainingCategories" :key="key"
                  class="category-tab" :class="{ active: category === key }" @click="category = key">{{ label }}</button>
              </view>
            </scroll-view>
            <view class="training-grid library-grid">
              <TrainingCard v-for="game in library" :key="game.key" :game-key="game.key" :title="game.title" @select="openPractice(game)" />
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<style scoped>
.workspace { min-height: 100vh; background: #f1f5fc; color: #172846; }
.sidebar { padding: 10px 18px; background: #fff; border-bottom: 1px solid #dde5f1; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.workspace-nav { display: flex; gap: 6px; }
.nav-item { min-height: 44px; border-radius: 8px; padding: 7px 11px; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0; font-weight: 650; font-size: 14px; line-height: 1.2; white-space: nowrap; background: transparent; color: #4a5e7b; }
.nav-item.selected { color: #264cce; background: #eaf0ff; }
.nav-item .icon { width: 17px; height: 17px; }
.workspace-main { min-width: 0; }
.workspace-header { display: flex; min-height: 59px; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 24px; background: #fff; border-bottom: 1px solid #dde5f1; }
.workspace-title { color: #273b5c; font-size: 16px; font-weight: 750; }
.account { display: flex; align-items: center; gap: 8px; }
.avatar { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; background: #edf2ff; }
.avatar .icon { width: 18px; height: 18px; }
.account-details { display: flex; flex-direction: column; gap: 1px; overflow-wrap: anywhere; }
.patient { color: #213857; font-size: 13px; font-weight: 700; }
.mrn { color: #5c6c86; font-size: 11px; }
.exit { min-height: 44px; padding: 8px; margin: 0; line-height: 1.3; color: #405a93; background: transparent; font-size: 13px; }
.content { padding: 24px 24px 40px; max-width: 1440px; margin: 0 auto; }
.heading, .progress-summary, .section-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.heading { margin-bottom: 16px; }
.heading .secondary { min-height: 44px; color: #2949ac; background: #fff; border: 1px solid #d9e4f4; }
.date, .library-description { display: block; color: #536686; font-size: 14px; line-height: 1.6; }
.headline { display: block; color: #233b75; font-size: 27px; font-weight: 800; line-height: 1.25; }
.library-description { margin-top: 5px; }
.progress-card, .section { border-radius: 13px; border: 1px solid #dce5f2; background: #fff; box-shadow: 0 3px 10px #1c3d7310; }
.progress-card { padding: 15px 18px; margin-bottom: 16px; }
.stat-label { font-size: 13px; color: #536686; font-weight: 600; }
.total { display: flex; align-items: baseline; gap: 6px; margin-top: 2px; color: #536686; font-weight: 650; }
.count { color: #284fca; font-size: 32px; font-weight: 800; line-height: 1; }
.time-stat { text-align: right; }
.minutes { font-weight: 800; font-size: 23px; margin-top: 2px; }
.minutes text { font-size: 13px; }
.progress-line { display: flex; align-items: center; gap: 10px; margin-top: 11px; }
.progress-track { flex: 1; height: 7px; border-radius: 7px; background: #e8effd; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 7px; background: #3861e0; transition: width .2s; }
.progress-label { font-size: 12px; color: #466394; }
.section { overflow: hidden; }
.section-heading { border-bottom: 1px solid #e2e9f6; min-height: 49px; padding: 9px 14px; font-size: 16px; font-weight: 750; }
.section-title { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 9px; }
.quick-start { min-height: 44px; padding: 8px 17px; border-radius: 8px; background: #3658d3; font-size: 14px; white-space: nowrap; flex-shrink: 0; }
.quick-start[disabled] { background: #e8edf7; color: #526383; }
.daily-list { display: grid; gap: 8px; padding: 12px 14px; }
.demo-note { color: #536686; font-size: 12px; font-weight: 550; }
.category-scroll { background: #f5f7fc; border-bottom: 1px solid #e0e8f7; white-space: nowrap; }
.category-bar { display: inline-flex; align-items: stretch; padding: 4px 8px 0; gap: 3px; }
.category-tab {
  min-height: 46px; flex: none; padding: 8px 12px; margin: 0;
  border-bottom: 3px solid transparent; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; background: transparent; color: #4a5e7b;
  font-size: 14px; line-height: 1.25; font-weight: 650; white-space: nowrap;
}
.category-tab.active { background: #fff; color: #284fca; border-bottom-color: #466af0; }
.training-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 12px; }
.empty { padding: 26px 14px; text-align: center; color: #5b6c87; }
@media (max-width: 500px) { .sidebar { padding: 8px 10px; } .nav-item { font-size: 12px; gap: 5px; } .nav-item .icon { display: none; } .content, .workspace-header { padding-left: 13px; padding-right: 13px; } .avatar { display: none; } }
@media (min-width: 670px) {
  .training-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 14px; gap: 12px; }
  .content { padding-top: 26px; }
}
@media (min-width: 900px) and (orientation: landscape) {
  .workspace { display: grid; grid-template-columns: 182px minmax(0, 1fr); }
  .sidebar { display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; padding: 18px 12px; border-right: 1px solid #dde5f1; border-bottom: 0; }
  .workspace-nav { flex-direction: column; margin-top: 23px; gap: 5px; }
  .nav-item { justify-content: flex-start; padding-left: 12px; }
  .training-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (min-width: 1200px) and (orientation: landscape) {
  .training-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
</style>
