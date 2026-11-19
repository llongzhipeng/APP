<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :lang="lang"
      @toggleLang="toggleLang"
      @start="screen = 'tutorial'"
      @rules="showRules = true"
      @history="showHistory = true"
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
      @select="onDurationSelected"
    />
    <GamePage
      v-else-if="screen === 'game'"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @close="onGameClose"
    />
    <RulesModal v-if="showRules" :lang="lang" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :lang="lang" :records="history" @close="showHistory = false" />
  </div>
</template>

<script>
export default {
  name: 'Game16App',
}
</script>

<script setup>
import { ref, onMounted, getCurrentInstance } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'

const GAME_TYPE = 'hylx'

const instance = getCurrentInstance()
const archiveId = ref(resolveArchiveId(instance.proxy.$route))
const screen = ref('home')
const lang = ref('zh')
const gameDuration = ref(1)
const showRules = ref(false)
const showHistory = ref(false)
const history = ref(JSON.parse(localStorage.getItem('game16_history') || '[]'))

function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
}

function onDurationSelected(dur) {
  gameDuration.value = dur
  screen.value = 'game'
}

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

function onGameEnd(result) {
  submitPbGameEndRecord(archiveId.value, GAME_TYPE, {
    minTime: 0,
    maxTime: 0,
    avgTime: toPbGameSeconds(result.avgReaction),
    score: result.score,
    successCount: result.success,
    failCount: result.fail,
    trainDuration: result.duration,
    difficultyLevel: result.level,
  })

  history.value.unshift({
    time: result.time,
    level: result.level,
    duration: result.duration,
    total: result.total,
    success: result.success,
    fail: result.fail,
    rate: result.rate,
    avgReaction: result.avgReaction,
    score: result.score,
  })
  localStorage.setItem('game16_history', JSON.stringify(history.value.slice(0, 100)))
}

function onGameClose() {
  screen.value = 'home'
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
#app {
  width: 100vw;
  height: 100vh;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}
</style>
