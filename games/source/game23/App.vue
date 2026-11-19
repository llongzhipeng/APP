<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :lang="lang"
      @start="screen = 'tutorial'"
      @rules="showRules = true"
      @history="showHistory = true"
      @toggle-lang="toggleLang"
    />
    <TutorialModal
      v-else-if="screen === 'tutorial'"
      :lang="lang"
      @done="onTutorialDone"
      @skip="onTutorialDone"
    />
    <DurationSelect
      v-else-if="screen === 'duration'"
      :lang="lang"
      @selected="onDurationSelected"
      @back="screen = 'home'"
    />
    <GamePage
      v-else-if="screen === 'game'"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @back="screen = 'home'"
    />
    <RulesModal v-if="showRules" :lang="lang" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :lang="lang" :history="history" @close="showHistory = false" />
    <ResultModal v-if="showResult" :lang="lang" :result="gameResult" @close="showResult = false" />
  </div>
</template>

<script>
export default { name: 'Game23App' }
</script>

<script setup>
import { ref, onMounted, getCurrentInstance } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, orZero, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'
import ResultModal from './src/components/ResultModal.vue'

const GAME_TYPE = 'yspp' // 钥匙匹配
const instance = getCurrentInstance()
const archiveId = ref(resolveArchiveId(instance.proxy.$route)) // 患者档案 ID
const screen = ref('home') // 当前界面
const lang = ref('zh') // 语言
const gameDuration = ref(60) // 训练时长（秒）
const showRules = ref(false) // 规则弹窗
const showHistory = ref(false) // 历史弹窗
const showResult = ref(false) // 结算弹窗
const gameResult = ref(null) // 本局结果
const history = ref(JSON.parse(localStorage.getItem('keyMatchHistory') || '[]')) // 本地历史

/**
 * <summary>
 * 切换中英文
 * </summary>
 */
function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
}

/**
 * <summary>
 * 时长选定后进入游戏
 * </summary>
 */
function onDurationSelected(dur) {
  gameDuration.value = dur
  screen.value = 'game'
}

/**
 * <summary>
 * 教程结束：批次模式直接开局，否则进时长选择
 * </summary>
 */
function onTutorialDone() {
  if (afterBatchTutorial(GAME_TYPE, onDurationSelected)) return
  screen.value = 'duration'
}

onMounted(() => {
  applyBatchTutorialEntry(GAME_TYPE, {
    setDuration: (dur) => { gameDuration.value = dur },
    openTutorial: () => { screen.value = 'tutorial' },
  })
})

/**
 * <summary>
 * 本局结束：上传记录并展示结算
 * </summary>
 */
function onGameEnd(result) {
  gameResult.value = result
  submitPbGameEndRecord(archiveId.value, GAME_TYPE, {
    minTime: toPbGameSeconds(orZero(result.minReaction)),
    maxTime: toPbGameSeconds(orZero(result.maxReaction)),
    avgTime: toPbGameSeconds(result.avgReaction),
    score: result.score || 0,
    successCount: result.correct || 0,
    failCount: result.wrong || 0,
    trainDuration: gameDuration.value,
    difficultyLevel: result.finalLevel || 1,
  })
  history.value.unshift({
    trainTime: new Date().toLocaleString(),
    project: lang.value === 'zh' ? '钥匙匹配' : 'Key Match',
    level: result.finalLevel,
    duration: result.durationLabel,
    total: result.total,
    success: result.correct,
    fail: result.wrong,
    rate: result.total > 0 ? Math.round(result.correct / result.total * 100) + '%' : '0%',
    avgReaction: result.avgReaction,
    score: result.score,
  })
  localStorage.setItem('keyMatchHistory', JSON.stringify(history.value.slice(0, 100)))
  showResult.value = true
  screen.value = 'home'
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
#app {
  width: 100vw;
  height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #0d0618;
  color: #e8d5ff;
}
</style>
