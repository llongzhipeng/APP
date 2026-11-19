<template>
  <div id="app">
    <HomeScreen v-if="view==='home'" :t="t" :lang="lang" @go="onGo" @toggle-lang="toggleLang" />
    <RulesModal v-if="showRules" :t="t" @close="showRules=false" />
    <HistoryScreen v-if="showHistory" :t="t" @close="showHistory=false" />
    <TutorialModal v-if="view==='tutorial'" :t="t" @done="onTutorialDone" @skip="onTutorialDone" />
    <DurationScreen v-if="view==='duration'" :t="t" @back="view='home'" @start="startGame" />
    <GameScreen
      v-if="view==='game'"
      :t="t"
      :duration="duration"
      :show-batch-skip="showBatchSkip"
      @finish="onFinish"
      @quit="onQuit"
      @batch-skip="onBatchSkip"
    />
    <ResultScreen v-if="view==='result'" :t="t" :r="lastRecord" @again="view='duration'" @home="view='home'" />
  </div>
</template>

<script>
import { messages } from './utils/i18n'
import { saveRecord } from './utils/storage'
import HomeScreen from './components/HomeScreen.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryScreen from './components/HistoryScreen.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationScreen from './components/DurationScreen.vue'
import GameScreen from './components/GameScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'qjyx'

export default {
  name: 'App',
  components: { HomeScreen, RulesModal, HistoryScreen, TutorialModal, DurationScreen, GameScreen, ResultScreen },
  data() {
    return {
      lang: 'zh',
      view: 'home',
      showRules: false,
      showHistory: false,
      duration: 180,
      lastRecord: null,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  computed: {
    t() { return messages[this.lang] }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    this._vh = () => document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
    this._vh()
    window.addEventListener('resize', this._vh)
    window.addEventListener('orientationchange', this._vh)
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur },
      openTutorial: () => { this.view = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._vh)
    window.removeEventListener('orientationchange', this._vh)
  },
  methods: {
    toggleLang() {
      if (this.view === 'game') return
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onGo(target) {
      if (target === 'tutorial') this.view = 'tutorial'
      else if (target === 'rules') this.showRules = true
      else if (target === 'history') this.showHistory = true
      else if (target === 'skip') {}
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.view = 'duration'
    },
    startGame(dur) { this.duration = dur; this.view = 'game' },
    onFinish(record) {
      const r = record || {}
      const avgRaw = r.avgReaction
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: avgRaw != null ? msToPbGameSeconds(avgRaw) : 0,
        score: r.score || 0,
        successCount: r.success || 0,
        failCount: r.fail || 0,
        trainDuration: r.duration != null ? r.duration : this.duration,
        difficultyLevel: r.level != null ? r.level : 1,
      })
      saveRecord(r)
      this.lastRecord = r
      this.view = 'result'
    },
    onQuit() { leavePbGameWindow({ confirm: false }) },
    onBatchSkip() { skipPbBatchGame() },
  }
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden;
  font-family: 'Bebas Neue', 'Impact', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #0a0510; color: #fff; -webkit-font-smoothing: antialiased;
}
#app { height: 100vh; height: calc(var(--real-vh, 1vh) * 100); position: relative; }
button { font-family: inherit; }
::-webkit-scrollbar { width: 1vmin; height: 1vmin; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
</style>
