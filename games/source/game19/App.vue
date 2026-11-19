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
    <ResultModal v-if="showResult" :lang="lang" :result="gameResult" @close="showResult = false" />
    <RulesModal v-if="showRules" :lang="lang" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :lang="lang" :history="history" @close="showHistory = false" />
  </div>
</template>

<script>
export default { name: 'Game19App' }
</script>

<script setup>
import { ref, onMounted, getCurrentInstance } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, orZero, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import ResultModal from './src/components/ResultModal.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'

const GAME_TYPE = 'lxds'
const instance = getCurrentInstance()
const archiveId = ref(resolveArchiveId(instance.proxy.$route))
const screen = ref('home')
const lang = ref('zh')
const gameDuration = ref(60)
const showRules = ref(false)
const showHistory = ref(false)
const showResult = ref(false)
const gameResult = ref(null)
const history = ref(JSON.parse(localStorage.getItem('associationHistory') || '[]'))

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
  gameResult.value = result
  submitPbGameEndRecord(archiveId.value, GAME_TYPE, {
    minTime: orZero(result.minReactionTime),
    maxTime: orZero(result.maxReactionTime),
    avgTime: toPbGameSeconds(result.avgReaction),
    score: result.score,
    successCount: result.correctRounds,
    failCount: result.wrongRounds,
    trainDuration: result.duration,
    difficultyLevel: result.finalLevel,
  })
  history.value.unshift({
    trainTime: new Date().toLocaleString(),
    project: '联想大师',
    level: result.finalLevel,
    duration: result.duration,
    total: result.totalRounds,
    success: result.correctRounds,
    fail: result.wrongRounds,
    rate: result.totalRounds > 0 ? Math.round(result.correctRounds / result.totalRounds * 100) + '%' : '0%',
    avgReaction: result.avgReaction,
    score: result.score,
  })
  localStorage.setItem('associationHistory', JSON.stringify(history.value.slice(0, 100)))
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
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}
</style>
