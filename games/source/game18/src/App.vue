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
      @done="screen = 'duration'"
      @skip="screen = 'duration'"
    />
    <DurationSelect
      v-else-if="screen === 'duration'"
      :lang="lang"
      @selected="d => { gameDuration = d; screen = 'game' }"
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

<script setup>
import { ref } from '@vue/composition-api'
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import ResultModal from './components/ResultModal.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'

const screen = ref('home')
const lang = ref('zh')
const gameDuration = ref(60)
const showRules = ref(false)
const showHistory = ref(false)
const showResult = ref(false)
const gameResult = ref(null)
const history = ref(JSON.parse(localStorage.getItem('faceMemoryHistory') || '[]'))

function onGameEnd(result) {
  gameResult.value = result
  fetch('/pbgamerecord/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trainType: 'memory',
      gameType: 'mjmy',
      minTime: 0,
      maxTime: 0,
      avgTime: parseFloat(result.avgRT || 0) * 1000,
      score: result.score
    })
  }).catch(() => {})
  const record = {
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
  }
  history.value.unshift(record)
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
