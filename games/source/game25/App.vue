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
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import ResultModal from './src/components/ResultModal.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'

export default {
  name: 'Game25App',
  components: { HomePage, TutorialModal, DurationSelect, GamePage, ResultModal, RulesModal, HistoryModal },
  data() {
    return {
      archiveId: resolveArchiveId(this.$route),
      screen: 'home',
      lang: 'zh',
      gameDuration: 60,
      showRules: false,
      showHistory: false,
      showResult: false,
      gameResult: null,
      history: JSON.parse(localStorage.getItem('countCompareHistory') || '[]'),
    }
  },
  mounted() {
    applyBatchTutorialEntry('slbj', {
      setDuration: (dur) => { this.gameDuration = dur },
      openTutorial: () => { this.screen = 'tutorial' },
    })
  },
  methods: {
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    onTutorialDone() {
      if (afterBatchTutorial('slbj', (dur) => this.onDurationSelected(dur))) return
      this.screen = 'duration'
    },
    onDurationSelected(dur) { this.gameDuration = dur; this.screen = 'game' },
    onGameEnd(result) {
      this.gameResult = result
      submitPbGameEndRecord(this.archiveId, 'slbj', {
        minTime: 0,
        maxTime: 0,
        avgTime: toPbGameSeconds(result.avgReaction),
        score: result.score,
        successCount: result.correctRounds,
        failCount: result.wrongRounds,
        trainDuration: result.duration,
        difficultyLevel: result.finalLevel,
      })
      const record = {
        trainTime: new Date().toLocaleString(),
        project: this.lang === 'zh' ? '数量比较' : 'Count Compare',
        level: result.finalLevel,
        duration: result.duration,
        total: result.totalRounds,
        success: result.correctRounds,
        fail: result.wrongRounds,
        rate: result.totalRounds > 0 ? Math.round(result.correctRounds / result.totalRounds * 100) + '%' : '0%',
        avgReaction: result.avgReaction,
        score: result.score,
      }
      this.history.unshift(record)
      localStorage.setItem('countCompareHistory', JSON.stringify(this.history.slice(0, 100)))
      this.showResult = true
      this.screen = 'home'
    },
  },
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
