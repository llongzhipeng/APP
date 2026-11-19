<template>
  <div id="app">
    <transition :name="transName" mode="out-in">
      <HomeScreen v-if="screen === 'home'" key="home"
        :t="t" :lang="lang"
        @start="goto('tutorial')"
        @rules="showRules = true"
        @history="showHistory = true"
        @toggle-lang="toggleLang" />

      <Tutorial v-else-if="screen === 'tutorial'" key="tut"
        :t="t" :lang="lang"
        @skip="onTutorialDone" @done="onTutorialDone" />

      <DurationSelect v-else-if="screen === 'duration'" key="dur"
        :t="t" :lang="lang"
        @back="goto('home')"
        @start="onStartGame" />

      <GamePlay v-else-if="screen === 'play'" key="play"
        :t="t" :lang="lang"
        :duration="duration"
        :show-batch-skip="showBatchSkip"
        @finish="onFinish"
        @quit="onQuit"
        @batch-skip="onBatchSkip" />

      <Result v-else-if="screen === 'result'" key="res"
        :t="t" :lang="lang" :result="result"
        @again="goto('duration')"
        @home="goto('home')" />
    </transition>

    <RulesDialog :show="showRules" :t="t" :lang="lang" @close="showRules = false" />
    <HistoryDialog :show="showHistory" :t="t" :records="history"
      @close="showHistory = false"
      @clear="clearAllHistory" />
  </div>
</template>

<script>
import HomeScreen from './components/HomeScreen.vue'
import Tutorial from './components/Tutorial.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePlay from './components/GamePlay.vue'
import Result from './components/Result.vue'
import RulesDialog from './components/RulesDialog.vue'
import HistoryDialog from './components/HistoryDialog.vue'
import { i18n } from './utils/i18n.js'
import { loadHistory, appendRecord, clearHistory, loadLang, saveLang } from './utils/storage.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'tktxj'

export default {
  name: 'App',
  components: { HomeScreen, Tutorial, DurationSelect, GamePlay, Result, RulesDialog, HistoryDialog },
  data() {
    return {
      screen: 'home',
      transName: 'fade',
      lang: loadLang(),
      showRules: false,
      showHistory: false,
      duration: 180,
      result: null,
      history: loadHistory(),
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  computed: { t() { return i18n[this.lang] } },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.duration = sec },
      openTutorial: () => { this.goto('tutorial') },
    })
  },
  methods: {
    goto(s) {
      this.transName = 'fade'
      this.screen = s
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
      saveLang(this.lang)
    },
    onStartGame(sec) {
      this.duration = sec
      this.goto('play')
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.onStartGame(sec))) return
      this.goto('duration')
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    onQuit() {
      leavePbGameWindow({ confirm: false })
    },
    onFinish(r) {
      this.result = r
      const now = new Date()
      const pad = (n) => n.toString().padStart(2, '0')
      const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      appendRecord({ time, ...r })
      this.history = loadHistory()
      const avgRaw = r.avgRT
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(avgRaw),
        score: r.score || 0,
        successCount: r.correct || 0,
        failCount: r.wrong || 0,
        trainDuration: r.duration || this.duration,
        difficultyLevel: r.level || 1,
      })
      this.goto('result')
    },
    clearAllHistory() {
      clearHistory()
      this.history = []
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #02030a;
  color: #fff;
  font-family: 'Noto Sans SC', 'Orbitron', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}
body { position: fixed; inset: 0; }
button { font-family: inherit; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: rgba(10, 15, 40, 0.3); }
::-webkit-scrollbar-thumb { background: rgba(140, 180, 255, 0.3); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(140, 180, 255, 0.5); }

/* Responsive root font-size.
   Scale is driven mainly by viewport HEIGHT (vh) because whether the game
   "fits one screen" depends on height. A small width term keeps ultra-wide
   layouts balanced. Capped so large external monitors don't over-inflate. */
html { font-size: clamp(13px, 1.2vh + 0.35vw, 22px); }

.fade-enter-active, .fade-leave-active { transition: opacity .35s, transform .35s; }
.fade-enter, .fade-leave-to { opacity: 0; transform: scale(0.98); }
</style>
