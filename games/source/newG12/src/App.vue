<template>
  <div id="app">
    <HomeScreen v-if="state === 'home'"
      :show-lang="true"
      @start="showTutorial"
      @rules="showRules = true"
      @history="showHistory = true" />

    <GameScreen v-else-if="state === 'game'"
      :duration-min="durationMin"
      @finish="onFinish" />

    <ResultScreen v-else-if="state === 'result'"
      :record="lastRecord"
      @home="goHome"
      @again="showTutorial" />

    <RulesModal v-if="showRules" @close="showRules = false" />
    <HistoryModal v-if="showHistory" @close="showHistory = false" />
    <TutorialModal v-if="showTutorialModal"
      @done="onTutorialDone"
      @skip="onTutorialDone" />
    <DurationModal v-if="showDuration"
      @choose="onDuration" />
  </div>
</template>

<script>
import HomeScreen from './components/HomeScreen.vue'
import GameScreen from './components/GameScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationModal from './components/DurationModal.vue'
import { saveHistoryRecord } from './store.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'qxjy'

export default {
  name: 'App',
  components: {
    HomeScreen, GameScreen, ResultScreen,
    RulesModal, HistoryModal, TutorialModal, DurationModal
  },
  data() {
    return {
      state: 'home',
      showRules: false,
      showHistory: false,
      showTutorialModal: false,
      showDuration: false,
      durationMin: 1,
      lastRecord: null,
      archiveId: -1,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (min) => { this.durationMin = min },
      openTutorial: () => { this.showTutorial() },
    })
  },
  methods: {
    showTutorial() {
      this.state = 'home'
      this.showTutorialModal = true
    },
    onTutorialDone() {
      this.showTutorialModal = false
      if (afterBatchTutorial(GAME_TYPE, (min) => this.onDuration(min))) return
      this.showDuration = true
    },
    onDuration(min) {
      this.durationMin = min
      this.showDuration = false
      this.state = 'game'
    },
    onFinish(record) {
      this.lastRecord = record
      if (record.total > 0) saveHistoryRecord(record)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(record.avgRt ? Math.round(record.avgRt * 1000) : 0),
        score: record.score ? Math.round(record.score) : 0,
        successCount: record.correct,
        failCount: record.wrong,
        trainDuration: record.durationMin,
        difficultyLevel: record.maxLevel,
      }).catch(() => {})
      this.state = 'result'
    },
    goHome() {
      this.state = 'home'
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  font-family: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}
body { background: #0f2744; color: #e8f4fd; }
button { font-family: inherit; }
</style>
