<template>
  <div id="app-root" :style="rootStyle">
    <transition name="page" mode="out-in">
      <Home v-if="page === 'home'" key="home" @go="onGo"/>
      <DurationSelect v-else-if="page === 'duration'" key="duration" @back="page='home'" @start="onStart"/>
      <Game v-else-if="page === 'game'" key="game"
            :duration="duration"
            :show-batch-skip="showBatchSkip"
            @finish="onFinish"
            @quit="onQuit"
            @batch-skip="onBatchSkip"/>
      <Result v-else-if="page === 'result'" key="result" :record="record" @home="onHome" @again="onAgain"/>
    </transition>

    <Rules v-if="modal === 'rules'" @close="modal=null"/>
    <History v-if="modal === 'history'" @close="modal=null"/>
    <Tutorial v-if="modal === 'tutorial'" @done="onTutorialDone" @skip="onTutorialDone"/>
  </div>
</template>

<script>
import { store } from './i18n.js'
import { saveHistoryEntry } from './history.js'
import { unlockAudio } from './audio.js'
import Home from './components/Home.vue'
import Rules from './components/Rules.vue'
import History from './components/History.vue'
import Tutorial from './components/Tutorial.vue'
import DurationSelect from './components/DurationSelect.vue'
import Game from './components/Game.vue'
import Result from './components/Result.vue'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'hyjj'

export default {
  name: 'App',
  components: { Home, Rules, History, Tutorial, DurationSelect, Game, Result },
  data() {
    return {
      page: 'home',      // home | duration | game | result
      modal: null,       // rules | history | tutorial | null
      duration: 180,
      record: null,
      scale: 1,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    rootStyle() { return { fontSize: (16 * this.scale) + 'px' } },
  },
  mounted() {
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    // Unlock audio on the first user interaction anywhere.
    const unlock = () => { unlockAudio() }
    window.addEventListener('pointerdown', unlock, { once: true, capture: true })
    window.addEventListener('keydown', unlock, { once: true, capture: true })
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.duration = sec },
      openTutorial: () => { this.modal = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScale)
  },
  methods: {
    updateScale() {
      const w = window.innerWidth, h = window.innerHeight
      let s = Math.min(w / 1280, h / 720)
      if (s < 0.55) s = 0.55
      if (s > 1.8) s = 1.8
      this.scale = s
    },
    onGo(target) {
      if (target === 'rules' || target === 'history') { this.modal = target; return }
      if (target === 'tutorial') { this.modal = 'tutorial'; return }
    },
    onTutorialDone() {
      this.modal = null
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.onStart(sec))) return
      this.page = 'duration'
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    onQuit() {
      leavePbGameWindow({ confirm: false })
    },
    onStart(secs) {
      this.duration = secs
      store.inGame = true
      this.page = 'game'
    },
    onFinish(record) {
      store.inGame = false
      saveHistoryEntry(record)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(record.avgRT),
        score: record.score || 0,
        successCount: record.correct || 0,
        failCount: record.wrong || 0,
        trainDuration: record.duration || this.duration,
        difficultyLevel: record.level || 1,
      })
      this.record = record
      this.page = 'result'
    },
    onHome() { this.page = 'home' },
    onAgain() { this.page = 'duration' },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app, #app-root { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  background: #05070f; color: #fff;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
button { font-family: inherit; -webkit-tap-highlight-color: transparent; outline: none; }

/* Page transitions */
.page-enter-active, .page-leave-active { transition: opacity .4s ease, transform .4s ease; }
.page-enter { opacity: 0; transform: scale(1.02); }
.page-leave-to { opacity: 0; transform: scale(0.98); }

/* Custom scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,201,64,.35); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,201,64,.55); }
</style>
