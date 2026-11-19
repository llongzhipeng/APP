<template>
  <div id="app">
    <HomeScreen
      v-if="screen === 'home'"
      :t="t"
      :show-lang-btn="true"
      @start="onStart"
      @show-rules="showRules = true"
      @show-history="showHistory = true"
      @toggle-lang="toggleLang"
    />

    <DurationScreen
      v-else-if="screen === 'duration'"
      :t="t"
      :lang="lang"
      @select="onSelectDuration"
      @back="goHome"
    />

    <GameScreen
      v-else-if="screen === 'game'"
      :key="gameKey"
      :t="t"
      :lang="lang"
      :duration="selectedDuration"
      @game-over="onGameOver"
      @exit-game="goHome"
    />

    <GameOverScreen
      v-else-if="screen === 'gameover'"
      :t="t"
      :result="gameResult"
      @play-again="onPlayAgain"
      @home="goHome"
    />

    <RulesModal v-if="showRules" :t="t" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :t="t" @close="showHistory = false" />
    <TutorialModal v-if="showTutorial" :t="t" @done="onTutorialDone" />
  </div>
</template>

<script>
import { translations } from './i18n.js'
import { saveHistory } from './gameConfig.js'
import HomeScreen from './components/HomeScreen.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationScreen from './components/DurationScreen.vue'
import GameScreen from './components/GameScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'szfbyy'

export default {
  name: 'App',
  components: {
    HomeScreen, RulesModal, HistoryModal,
    TutorialModal, DurationScreen, GameScreen, GameOverScreen
  },
  data() {
    return {
      lang: 'zh',
      screen: 'home',
      showRules: false,
      showHistory: false,
      showTutorial: false,
      selectedDuration: 60,
      gameKey: 0,
      gameResult: null,
      archiveId: -1,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  computed: {
    t() { return translations[this.lang] }
  },
  mounted() {
    this.updateScale()
    this._onResize = () => this.updateScale()
    window.addEventListener('resize', this._onResize)
    window.addEventListener('orientationchange', this._onResize)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this._onResize)
    }
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.selectedDuration = sec },
      openTutorial: () => { this.showTutorial = true },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onResize)
    window.removeEventListener('orientationchange', this._onResize)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this._onResize)
    }
  },
  methods: {
    // Set the root font-size proportional to the smaller side of the actual
    // viewport, using a fixed design canvas. Everything else in the app is
    // sized in `rem`, so this makes the layout look identical on Chrome,
    // Edge, or any other browser regardless of how much URL bar / toolbar
    // chrome they take up.
    //
    // Prefer visualViewport when available — Edge Android reports
    // window.innerHeight including area that's actually covered by system
    // UI, which caused the numpad's bottom row to be clipped there.
    updateScale() {
      const vv = window.visualViewport
      const w = vv ? vv.width : window.innerWidth
      const h = vv ? vv.height : window.innerHeight
      const DESIGN_W = 960
      const DESIGN_H = 620
      const scale = Math.min(w / DESIGN_W, h / DESIGN_H)
      const fs = Math.max(9, Math.min(scale * 16, 34))
      document.documentElement.style.fontSize = fs + 'px'
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onStart() { this.showTutorial = true },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.onSelectDuration(sec))) return
      this.screen = 'duration'
    },
    onSelectDuration(seconds) {
      this.selectedDuration = seconds
      this.screen = 'game'
      this.gameKey++
    },
    onGameOver(result) {
      this.gameResult = result
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(result.avgReactionTime ? Math.round(result.avgReactionTime * 1000) : 0),
        score: result.finalScore ? Math.round(result.finalScore) : 0,
        successCount: result.totalCorrect,
        failCount: result.totalQuestions - result.totalCorrect,
        trainDuration: result.duration,
        difficultyLevel: result.maxDifficulty,
      }).catch(() => {})
      this.screen = 'gameover'

      const failCount = result.totalQuestions - result.totalCorrect
      const successRate = result.totalQuestions > 0
        ? Math.round((result.totalCorrect / result.totalQuestions) * 100) + '%'
        : '0%'

      saveHistory({
        date: new Date().toLocaleString(this.lang === 'zh' ? 'zh-CN' : 'en-US'),
        project: this.lang === 'zh' ? '数字风暴（语音版）' : 'Digital Storm (Voice)',
        maxDifficulty: result.maxDifficulty,
        duration: result.duration,
        totalQuestions: result.totalQuestions,
        totalCorrect: result.totalCorrect,
        failCount,
        successRate,
        avgReactionTime: result.avgReactionTime,
        finalScore: result.finalScore
      })
    },
    onPlayAgain() { this.screen = 'duration' },
    goHome() { this.screen = 'home' }
  }
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* Root font-size is set dynamically in App.vue::updateScale() so the whole
     UI scales proportionally with the viewport on every browser. */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #0a0e27;
  color: #fff;
  user-select: none;
  -webkit-user-select: none;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

#app > * {
  position: absolute;
  inset: 0;
}

@media (orientation: portrait) {
  html, body {
    overflow: auto;
  }
  #app {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
