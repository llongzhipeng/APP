<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :language="language"
      @start-game="goTutorial"
      @show-rules="screen = 'rules'"
      @show-history="goHistory"
      @toggle-language="toggleLang"
    />

    <RulesModal
      v-if="screen === 'rules'"
      :language="language"
      @close="screen = 'home'"
    />

    <TutorialModal
      v-if="screen === 'tutorial'"
      :language="language"
      @done="onTutorialDone"
    />

    <DurationSelect
      v-if="screen === 'duration'"
      :language="language"
      @select="startGame"
    />

    <GameScene
      v-if="screen === 'game'"
      :language="language"
      :duration="gameDuration"
      @game-end="onGameEnd"
    />

    <ResultPage
      v-if="screen === 'result'"
      :language="language"
      :result="gameResult"
      @back-home="screen = 'home'"
      @view-history="goHistory"
    />

    <HistoryPage
      v-if="screen === 'history'"
      :language="language"
      :history="history"
      @back="screen = 'home'"
      @history-cleared="history = []"
    />
  </div>
</template>

<script>
import HomePage       from './components/HomePage.vue'
import RulesModal     from './components/RulesModal.vue'
import TutorialModal  from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GameScene      from './components/GameScene.vue'
import ResultPage     from './components/ResultPage.vue'
import HistoryPage    from './components/HistoryPage.vue'
import { loadHistory, saveHistory } from './gameUtils.js'
import api from '@/api'
import { getTrainTypeForGame } from '@/utils/pbGameRegistry'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
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
  components: {
    HomePage, RulesModal, TutorialModal,
    DurationSelect, GameScene, ResultPage, HistoryPage,
  },
  data() {
    return {
      archiveId: -1,
      screen: 'home',
      language: 'zh',
      gameDuration: 1,
      gameResult: null,
      history: [],
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
  },
  mounted() {
    applyBatchTutorialEntry('bdx', {
      setDuration: (minutes) => { this.gameDuration = minutes },
      openTutorial: () => { this.screen = 'tutorial' },
    })
  },
  methods: {
    toggleLang() {
      this.language = this.language === 'zh' ? 'en' : 'zh'
    },
    goTutorial() {
      this.screen = 'tutorial'
    },
    onTutorialDone() {
      if (afterBatchTutorial('bdx', (minutes) => this.startGame(minutes))) return
      this.screen = 'duration'
    },
    goHistory() {
      this.history = loadHistory()
      this.screen = 'history'
    },
    startGame(minutes) {
      this.gameDuration = minutes
      this.screen = 'game'
    },
    onGameEnd(result) {
      this.gameResult = result
      saveHistory(result)
      const body={
        archiveId: this.archiveId,
          trainType: getTrainTypeForGame('bdx'),
          gameType: 'bdx',
          minTime: 0 ,
          maxTime: 0,
          avgTime: result.avgTime,
          score: result.score,
          successCount: result.correct,
          failCount: result.wrong,
          trainDuration: result.duration,
          difficultyLevel: result.difficulty,
        }
        api.submitPbGameRecord(body).catch(() => {});
      this.history = loadHistory()
      this.screen = 'result'
    },
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

button {
  font-family: inherit;
  cursor: pointer;
}

button:focus-visible {
  outline: 2px solid #4A90E2;
  outline-offset: 2px;
}
</style>
