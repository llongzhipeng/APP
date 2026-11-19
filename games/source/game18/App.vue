<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :lang="lang"
      @start="screen = 'tutorial'"
      @rules="showRules = true"
      @history="showHistory = true"
      @toggle-lang="lang = lang === 'zh' ? 'en' : 'zh'"
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
      @start="onDurationSelected"
    />
    <GamePage
      v-else-if="screen === 'game'"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @back="screen = 'home'"
    />
    <ResultModal v-if="showResult" :lang="lang" :result="gameResult" @home="showResult = false" />
    <RulesModal v-if="showRules" :lang="lang" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :lang="lang" :history="history" @close="showHistory = false" />
  </div>
</template>

<script>
export default { name: 'Game18App' }
</script>

<script setup>
import { ref, onMounted, getCurrentInstance } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import ResultModal from './src/components/ResultModal.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'

const GAME_TYPE = 'mjmy'
const instance = getCurrentInstance()
const archiveId = ref(resolveArchiveId(instance.proxy.$route))
const screen = ref('home')
const lang = ref('zh')
const gameDuration = ref(60)
const showRules = ref(false)
const showHistory = ref(false)
const showResult = ref(false)
const gameResult = ref(null)
const history = ref(JSON.parse(localStorage.getItem('faceMemoryHistory') || '[]'))

function onDurationSelected(d) {
  gameDuration.value = d
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
  gameResult.value = result
  submitPbGameEndRecord(archiveId.value, GAME_TYPE, {
    minTime: 0,
    maxTime: 0,
    avgTime: toPbGameSeconds(result.avgRT),
    score: result.score,
    successCount: result.correct,
    failCount: result.wrong,
    trainDuration: result.duration,
    difficultyLevel: result.level,
  })
  history.value.unshift({
    trainTime: new Date().toLocaleString(),
    project: '面孔记忆',
    level: result.level,
    duration: result.duration,
    total: result.total,
    success: result.correct,
    fail: result.wrong,
    rate: result.rate + '%',
    avgReaction: result.avgRT + 's',
    score: result.score,
  })
  localStorage.setItem('faceMemoryHistory', JSON.stringify(history.value.slice(0, 100)))
  showResult.value = true
  screen.value = 'home'
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
#app {
  width: 100vw; height: 100vh;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}
</style>
