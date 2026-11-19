<template>
  <div id="app">
    <div v-if="view === 'home'" class="lang-switch">
      <button class="btn btn-secondary" @click="toggleLanguage">
        {{ language === 'zh' ? 'English' : '中文' }}
      </button>
    </div>

    <HomePage
      v-if="view === 'home'"
      :language="language"
      @start="view = 'tutorial'"
      @show-rules="showRules = true"
      @show-history="showHistory = true"
    />

    <TutorialModal
      v-else-if="view === 'tutorial'"
      :language="language"
      @done="onTutorialDone"
    />

    <DurationSelect
      v-else-if="view === 'duration'"
      :language="language"
      @select="startGame"
    />

    <GamePage
      v-else-if="view === 'game'"
      :language="language"
      :duration="selectedDuration"
      @end="onGameEnd"
      @return-home="view = 'home'"
    />

    <ResultPage
      v-else-if="view === 'result'"
      :language="language"
      :result="gameResult"
      @again="view = 'duration'"
      @home="view = 'home'"
    />

    <RulesModal
      v-if="showRules"
      :language="language"
      @close="showRules = false"
    />

    <HistoryModal
      v-if="showHistory"
      :language="language"
      @close="showHistory = false"
    />
  </div>
</template>

<script>
export default {
  name: 'Game14App'
};
</script>

<script setup>
import { ref ,getCurrentInstance, onMounted} from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import './style.css'
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import ResultPage from './components/ResultPage.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import api from '@/api';
import { getTrainTypeForGame } from '@/utils/pbGameRegistry';
const language = ref('zh')
const view = ref('home')
const showRules = ref(false)
const showHistory = ref(false)
const selectedDuration = ref(60)
const gameResult = ref(null)

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

function toggleLanguage() {
  language.value = language.value === 'zh' ? 'en' : 'zh'
}

function startGame(duration) {
  selectedDuration.value = duration
  view.value = 'game'
}

function onTutorialDone() {
  if (afterBatchTutorial('wpgl', startGame)) return
  view.value = 'duration'
}

onMounted(() => {
  applyBatchTutorialEntry('wpgl', {
    setDuration: (duration) => { selectedDuration.value = duration },
    openTutorial: () => { view.value = 'tutorial' },
  })
})

function onGameEnd(result) {
  gameResult.value = result
 const body= {
  archiveId: archiveId.value,
      trainType: getTrainTypeForGame('wpgl'),
      gameType: 'wpgl',
      minTime: result.minResponseTime ,
      maxTime: result.maxResponseTime ,
      avgTime: result.avgResponseTime ,
      score: result.score,
      successCount: result.correct,
      failCount: result.incorrect,
      trainDuration: result.duration,
      difficultyLevel: result.level,
    }
    api.submitPbGameRecord(body).catch(() => {});
  view.value = 'result'
}
</script>

<style>
/* App.vue specific styles - global styles in style.css */
</style>
