<template>
  <div id="app">
    <div class="app-container">
      <transition name="fade" mode="out-in">
        <Home
          v-if="page === 'home'"
          key="home"
          :lang="lang"
          @go="onGo"
          @toggle-lang="toggleLang"
        />
        <Rules
          v-else-if="page === 'rules'"
          key="rules"
          :lang="lang"
          @back="onGo('home')"
        />
        <History
          v-else-if="page === 'history'"
          key="history"
          :lang="lang"
          @back="onGo('home')"
        />
        <Tutorial
          v-else-if="page === 'tutorial'"
          key="tutorial"
          :lang="lang"
          @done="onTutorialDone"
          @skip="onTutorialDone"
        />
        <DurationSelect
          v-else-if="page === 'duration'"
          key="duration"
          :lang="lang"
          @select="onDurationSelected"
          @back="onGo('home')"
        />
        <Game
          v-else-if="page === 'game'"
          key="game"
          :lang="lang"
          :duration="duration"
          @end="onGameEnd"
        />
        <Result
          v-else-if="page === 'result'"
          key="result"
          :lang="lang"
          :result="result"
          @go="onGo"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import Home from './pages/Home.vue'
import Rules from './pages/Rules.vue'
import History from './pages/History.vue'
import Tutorial from './pages/Tutorial.vue'
import DurationSelect from './pages/DurationSelect.vue'
import Game from './pages/Game.vue'
import Result from './pages/Result.vue'
import { saveHistoryRecord } from './utils/storage.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'cyjc'

export default {
  components: { Home, Rules, History, Tutorial, DurationSelect, Game, Result },
  data() {
    return {
      page: 'home',
      lang: 'zh',
      duration: 60,
      result: null,
      archiveId: -1,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.duration = sec },
      openTutorial: () => { this.page = 'tutorial' },
    })
  },
  methods: {
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (sec) => {
        this.duration = sec
        this.page = 'game'
      })) return
      this.page = 'duration'
    },
    onGo(target) { this.page = target },
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    onDurationSelected(d) {
      this.duration = d
      this.page = 'game'
    },
    onGameEnd(summary) {
      this.result = summary
      const s = summary || {}
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(s.avgRt || 0),
        score: s.score || 0,
        successCount: s.correct,
        failCount: s.fail,
        trainDuration: s.durationSec || this.duration,
        difficultyLevel: s.finalLevel,
      }).catch(function () {})
      saveHistoryRecord(summary)
      this.page = 'result'
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: #000;
  color: #333;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
button { font-family: inherit; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }

@media (orientation: portrait) {
  body { background: #f6f2ea; color: #333; }
  button { touch-action: manipulation; }
}
</style>
