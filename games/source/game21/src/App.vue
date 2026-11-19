<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :lang="lang"
      @start="screen = 'tutorial'"
      @rules="screen = 'rules'"
      @history="screen = 'history'"
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
      @selected="onDurationSelected"
      @back="screen = 'home'"
    />
    <GamePage
      v-else-if="screen === 'game'"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @quit="screen = 'home'"
    />
    <ResultPage v-else-if="screen === 'result'" :lang="lang" :result="gameResult" @close="screen = 'home'" />
    <RulesPage  v-else-if="screen === 'rules'"  :lang="lang" @close="screen = 'home'" />
    <HistoryPage v-else-if="screen === 'history'" :lang="lang" :history="history" @close="screen = 'home'" />
  </div>
</template>

<script>
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import ResultPage from './components/ResultPage.vue'
import RulesPage from './components/RulesPage.vue'
import HistoryPage from './components/HistoryPage.vue'

export default {
  name: 'App',
  components: { HomePage, TutorialModal, DurationSelect, GamePage, ResultPage, RulesPage, HistoryPage },
  data() {
    return {
      screen: 'home',
      lang: 'zh',
      gameDuration: 60,
      gameResult: null,
      history: JSON.parse(localStorage.getItem('numberLineHistory') || '[]'),
    }
  },
  methods: {
    onDurationSelected(dur) { this.gameDuration = dur; this.screen = 'game' },
    onGameEnd(result) {
      this.gameResult = result
      fetch('/pbgamerecord/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainType: 'memory',
          gameType: 'szlx',
          minTime: 0,
          maxTime: 0,
          avgTime: result.avgReaction,
          score: result.score
        })
      }).catch(() => {})
      const record = {
        trainTime: new Date().toLocaleString(),
        project: '数字连线',
        maxDifficulty: result.maxDifficulty,
        total: result.totalRounds,
        success: result.successRounds,
        fail: result.failRounds,
        rate: result.successRate + '%',
        avgReaction: result.avgReaction,
        score: result.score,
      }
      this.history.unshift(record)
      localStorage.setItem('numberLineHistory', JSON.stringify(this.history.slice(0, 100)))
      this.screen = 'result'
    }
  }
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
