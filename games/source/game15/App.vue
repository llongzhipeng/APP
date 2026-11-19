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

    <ResultModal
      v-if="showResult"
      :lang="lang"
      :result="gameResult"
      @close="onResultClose"
    />
    <RulesModal
      v-if="showRules"
      :lang="lang"
      @close="showRules = false"
    />
    <HistoryModal
      v-if="showHistory"
      :lang="lang"
      :history="history"
      @close="showHistory = false"
    />
  </div>
</template>

<script>
export default {
  name: 'Game15App'
};
</script>

<script setup>
import { ref, computed, watch, getCurrentInstance, onMounted } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import ResultModal from './components/ResultModal.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import api from '@/api';
import messages from './i18n.js'

const screen = ref('home')
const lang = ref('zh')
const t = computed(() => messages[lang.value] || messages.zh)
const gameDuration = ref(60)
const showRules = ref(false)
const showHistory = ref(false)
const showResult = ref(false)
const gameResult = ref(null)
const history = ref(JSON.parse(localStorage.getItem('fossilHistory') || '[]'))
const resolveArchiveId = (route) => {
  const fromQuery = route && route.query && route.query.archiveId;
  if (fromQuery != null && fromQuery !== '') return fromQuery;
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) {
    const id = new URLSearchParams(hash.slice(qIndex + 1)).get('archiveId');
    if (id != null && id !== '') return id;
  }
  return -1;
};

const instance = getCurrentInstance()
const archiveId = ref(resolveArchiveId(instance.proxy.$route))

function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
}

function onDurationSelected(dur) {
  gameDuration.value = dur
  screen.value = 'game'
}

function onTutorialDone() {
  if (afterBatchTutorial('hsxb', onDurationSelected)) return
  screen.value = 'duration'
}

onMounted(() => {
  applyBatchTutorialEntry('hsxb', {
    setDuration: (dur) => { gameDuration.value = dur },
    openTutorial: () => { screen.value = 'tutorial' },
  })
})

function onGameEnd(result) {
  gameResult.value = result

  const body={
      archiveId: archiveId.value,
      trainType: 'memory',
      gameType: 'hsxb',
      minTime:  0,
      maxTime:  0,
      avgTime: result.avgReaction,
      score: result.score,
      successCount: result.correctRounds,
      failCount: result.wrongRounds,
      trainDuration: result.duration,
      difficultyLevel: result.finalLevel,
    }
    api.submitPbGameRecord(body).catch(() => {});
  const record = {
    trainTime: new Date().toLocaleString(),
    project: '化石寻宝',
    level: result.finalLevel,
    duration: result.durationLabel,
    total: result.totalRounds,
    success: result.correctRounds,
    fail: result.wrongRounds,
    rate: result.totalRounds > 0 ? Math.round(result.correctRounds / result.totalRounds * 100) + '%' : '0%',
    avgReaction: result.avgReaction?result.avgReaction+t.value.sec
    : '--',
    score: result.score,
  }
  history.value.unshift(record)
  localStorage.setItem('fossilHistory', JSON.stringify(history.value.slice(0, 100)))
  showResult.value = true
  screen.value = 'home'
}

function onResultClose() {
  showResult.value = false
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}
</style>
