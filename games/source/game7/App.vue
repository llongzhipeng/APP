<template>
  <div id="app">
    <!-- Language toggle: hidden during game -->
    <button
      v-show="view !== 'game'"
      class="lang-btn"
      @click="toggleLang"
    >{{ t('switchLang') }}</button>

    <HomePage
      v-if="view === 'home'"
      :lang="lang"
      @start="view = 'tutorial'"
      @rules="view = 'rules'"
      @history="view = 'history'"
    />

    <TutorialModal
      v-else-if="view === 'tutorial'"
      :lang="lang"
      @done="onTutorialDone"
    />

    <DurationSelector
      v-else-if="view === 'duration'"
      :lang="lang"
      @select="onDurationSelect"
    />

    <GamePage
      v-else-if="view === 'game'"
      :lang="lang"
      :duration="duration"
      @end="onGameEnd"
    />

    <ResultModal
      v-else-if="view === 'result'"
      :lang="lang"
      :result="result"
      @home="view = 'home'"
    />

    <HistoryPage
      v-else-if="view === 'history'"
      :lang="lang"
      @back="view = 'home'"
    />

    <RulesPage
      v-else-if="view === 'rules'"
      :lang="lang"
      @back="view = 'home'"
    />
  </div>
</template>

<script>
import { ref ,getCurrentInstance, onMounted} from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { translations } from './i18n.js'
import { HISTORY_KEY } from './gameConfig.js'
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelector from './components/DurationSelector.vue'
import GamePage from './components/GamePage.vue'
import ResultModal from './components/ResultModal.vue'
import HistoryPage from './components/HistoryPage.vue'
import RulesPage from './components/RulesPage.vue'
import api from '@/api'
import { getTrainTypeForGame } from '@/utils/pbGameRegistry'

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
export default {
  name: 'App',
  components: { HomePage, TutorialModal, DurationSelector, GamePage, ResultModal, HistoryPage, RulesPage },
  setup() {
    const lang = ref('zh')
    const view = ref('home')
    const duration = ref(60)
    const result = ref(null)
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
    const t = (key) => translations[lang.value][key] || key

    const toggleLang = () => {
      lang.value = lang.value === 'zh' ? 'en' : 'zh'
    }

    const onDurationSelect = (secs) => {
      duration.value = secs
      view.value = 'game'
    }

    const onTutorialDone = () => {
      if (afterBatchTutorial('ystz', (secs) => onDurationSelect(secs))) return
      view.value = 'duration'
    }

    const onGameEnd = (record) => {
      result.value = record
      let mintime = parseFloat(record.minReactionTime / 1000).toFixed(2);
     let maxtime = parseFloat(record.maxReactionTime / 1000).toFixed(2);
     const body = {
      trainType: getTrainTypeForGame('ystz'),
      gameType: 'ystz',
      archiveId: archiveId.value,
      minTime: mintime,
      maxTime: maxtime,
      avgTime: parseFloat(record.avgReactionTime / 1000).toFixed(2),
      score: record.score,
      successCount: record.correct,
      failCount: record.wrong,
      trainDuration: record.duration,
      difficultyLevel: record.maxDifficulty,
      }
       api.submitPbGameRecord(body).catch(() => {});
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      history.unshift(record)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      view.value = 'result'
    }

    onMounted(() => {
      applyBatchTutorialEntry('ystz', {
        setDuration: (secs) => { duration.value = secs },
        openTutorial: () => { view.value = 'tutorial' },
      })
    })

    return { lang, view, duration, result, t, toggleLang, onTutorialDone, onDurationSelect, onGameEnd }
  },
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #ffffff;
  color: #333;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.lang-btn {
  position: fixed;
  top: 2vmin;
  right: 2.5vmin;
  z-index: 1000;
  padding: 0.8vmin 2vmin;
  font-size: 1.8vmin;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.lang-btn:hover { background: #e9e9e9; }
</style>
