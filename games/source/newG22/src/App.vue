<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <HomeScreen
        v-if="view === 'home'"
        key="home"
        @start="onStart"
        @rules="showRules = true"
        @history="view = 'history'"
      />
      <HistoryScreen
        v-else-if="view === 'history'"
        key="history"
        @back="view = 'home'"
      />
      <DurationSelect
        v-else-if="view === 'duration'"
        key="duration"
        @back="view = 'home'"
        @start="onStartGame"
      />
      <GameScreen
        v-else-if="view === 'game'"
        key="game"
        :duration="gameDuration"
        :show-batch-skip="showBatchSkip"
        @finish="onGameFinish"
        @quit="onQuit"
        @batch-skip="onBatchSkip"
      />
      <GameOverScreen
        v-else-if="view === 'gameover'"
        key="gameover"
        :result="lastResult"
        @again="view = 'duration'"
        @home="view = 'home'"
      />
    </transition>

    <RulesModal v-if="showRules" @close="showRules = false" />
    <TutorialModal v-if="showTutorial" @done="onTutorialDone" @skip="onTutorialDone" />
  </div>
</template>

<script>
import HomeScreen from './components/HomeScreen.vue'
import HistoryScreen from './components/HistoryScreen.vue'
import DurationSelect from './components/DurationSelect.vue'
import GameScreen from './components/GameScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import RulesModal from './components/RulesModal.vue'
import TutorialModal from './components/TutorialModal.vue'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'jssc'

export default {
  name: 'App',
  components: {
    HomeScreen, HistoryScreen, DurationSelect, GameScreen, GameOverScreen, RulesModal, TutorialModal
  },
  data() {
    return {
      view: 'home',
      showRules: false,
      showTutorial: false,
      gameDuration: 60,
      lastResult: null,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.gameDuration = dur },
      openTutorial: () => { this.showTutorial = true },
    })
  },
  methods: {
    onStart() {
      this.showTutorial = true
    },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.onStartGame(dur))) return
      this.view = 'duration'
    },
    onStartGame(duration) {
      this.gameDuration = duration
      this.view = 'game'
    },
    onGameFinish(result) {
      const r = result || {}
      const avgRaw = r.avgReact
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: avgRaw != null && Number(avgRaw) >= 1000
          ? msToPbGameSeconds(avgRaw)
          : toPbGameSeconds(avgRaw),
        score: r.score || 0,
        successCount: r.success || 0,
        failCount: r.fail || 0,
        trainDuration: r.duration || this.gameDuration,
        difficultyLevel: r.difficulty || 1,
      })
      this.lastResult = result
      this.view = 'gameover'
    },
    onQuit() {
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #fff;
  background: #0b1020;
}
#app { position: relative; }
button { font-family: inherit; cursor: pointer; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.fade-enter { opacity: 0; transform: scale(0.98); }
.fade-leave-to { opacity: 0; transform: scale(1.02); }
</style>
