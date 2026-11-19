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
      @done="screen = 'duration'"
      @skip="screen = 'duration'"
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
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import ResultModal from './components/ResultModal.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'

export default {
  components: { HomePage, TutorialModal, DurationSelect, GamePage, ResultModal, RulesModal, HistoryModal },
  data() {
    return {
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
  methods: {
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    onDurationSelected(dur) { this.gameDuration = dur; this.screen = 'game' },
    onGameEnd(result) {
      this.gameResult = result
      fetch('/pbgamerecord/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainType: 'memory', gameType: 'slbj',
          minTime: 0, maxTime: 0,
          avgTime: result.avgReaction, score: result.score
        })
      }).catch(() => {})
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
