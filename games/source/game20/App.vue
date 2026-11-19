<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :lang="lang"
      :lang-hidden="langHidden"
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
      :key="gameKey"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @back="screen = 'home'"
    />

    <ResultModal v-if="showResult" :lang="lang" :result="gameResult" @close="onResultClose" />
    <RulesModal v-if="showRules" :lang="lang" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :lang="lang" :history="history" @close="showHistory = false" />
  </div>
</template>

<script>
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, orZero, msToPbGameSeconds, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import ResultModal from './src/components/ResultModal.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'

export default {
  name: 'Game20App',
  components: { HomePage, TutorialModal, DurationSelect, GamePage, ResultModal, RulesModal, HistoryModal },
  data() {
    return {
      archiveId: resolveArchiveId(this.$route),
      screen: 'home',
      lang: 'zh',
      gameDuration: 60,
      gameKey: 0,
      showRules: false,
      showHistory: false,
      showResult: false,
      gameResult: null,
      history: JSON.parse(localStorage.getItem('attentionSearchHistory') || '[]'),
    }
  },
  computed: {
    langHidden() { return this.screen === 'game' },
  },
  mounted() {
    applyBatchTutorialEntry('zlss', {
      setDuration: (dur) => { this.gameDuration = dur },
      openTutorial: () => { this.screen = 'tutorial' },
    })
  },
  methods: {
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    onTutorialDone() {
      if (afterBatchTutorial('zlss', (dur) => this.onDurationSelected(dur))) return
      this.screen = 'duration'
    },
    onDurationSelected(dur) {
      this.gameDuration = dur
      this.gameKey++
      this.screen = 'game'
    },
    onGameEnd(result) {
      submitPbGameEndRecord(this.archiveId, 'zlss', {
        minTime: msToPbGameSeconds(orZero(result.minReactionTime)),
        maxTime: msToPbGameSeconds(orZero(result.maxReactionTime)),
        avgTime: toPbGameSeconds(result.avgReaction),
        score: result.score,
        successCount: result.correctRounds,
        failCount: result.wrongRounds,
        trainDuration: result.duration != null ? result.duration : this.gameDuration, // 秒，归一化为分钟
        difficultyLevel: result.finalLevel,
      })
      const record = {
        trainTime: new Date().toLocaleString(),
        level: result.finalLevel,
        duration: result.durationLabel,
        total: result.totalRounds,
        success: result.correctRounds,
        fail: result.wrongRounds,
        rate: result.totalRounds > 0 ? Math.round(result.correctRounds / result.totalRounds * 100) + '%' : '0%',
        avgReaction: result.avgReaction,
        score: result.score,
      }
      this.history.unshift(record)
      localStorage.setItem('attentionSearchHistory', JSON.stringify(this.history.slice(0, 100)))
      this.gameResult = result
      this.showResult = true
      this.screen = 'home'
    },
    onResultClose() { this.showResult = false },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
#app {
  width: 100vw; height: 100vh; overflow: hidden;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}
</style>
