<template>
  <div id="app">
    <transition name="page-fade" mode="out-in">
      <Home v-if="view === 'home'" key="home" @go="go" @toggle-lang="toggleLang" />
      <Rules v-else-if="view === 'rules'" key="rules" @go="go" />
      <History v-else-if="view === 'history'" key="history" @go="go" />
      <Duration v-else-if="view === 'duration'" key="dur" @go="go" @start="startGame" />
      <Game
        v-else-if="view === 'game'"
        key="game"
        :duration="duration"
        :show-batch-skip="showBatchSkip"
        @finish="onFinish"
        @quit="onQuit"
        @batch-skip="onBatchSkip"
      />
      <Result v-else-if="view === 'result'" key="res" :result="result" @go="go" @toggle-lang="toggleLang" />
    </transition>
    <Tutorial v-if="showTutorial" @done="onTutorialDone" />
  </div>
</template>
<script>
import Home from './views/Home.vue'
import Rules from './views/Rules.vue'
import History from './views/History.vue'
import Tutorial from './views/Tutorial.vue'
import Duration from './views/Duration.vue'
import Game from './views/Game.vue'
import Result from './views/Result.vue'
import { store, setLang, loadHistory, saveHistoryItem } from './store.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'jyzbtxj'

export default {
  name: 'App',
  components: { Home, Rules, History, Tutorial, Duration, Game, Result },
  data() {
    return {
      view: 'home',
      showTutorial: false,
      duration: 180,
      result: null,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    loadHistory()
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur },
      openTutorial: () => { this.showTutorial = true },
    })
  },
  methods: {
    go(v) {
      if (v === 'tutorial') { this.showTutorial = true; return }
      this.view = v
    },
    toggleLang() { setLang(store.lang === 'zh' ? 'en' : 'zh') },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.view = 'duration'
    },
    startGame(seconds) { this.duration = seconds; this.view = 'game' },
    onFinish(r) {
      this.result = r
      const avgRaw = r.avgReact
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: avgRaw != null ? msToPbGameSeconds(avgRaw) : 0,
        score: r.score || 0,
        successCount: r.correct || 0,
        failCount: r.wrong || 0,
        trainDuration: r.duration != null ? r.duration : this.duration,
        difficultyLevel: r.difficulty != null ? r.difficulty : 1,
      })
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      const date = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      saveHistoryItem({
        date,
        maxLevel: r.maxLevel,
        duration: r.duration,
        total: r.total,
        correct: r.correct,
        wrong: r.wrong,
        avgReact: r.avgReact,
        score: r.score
      })
      this.view = 'result'
    },
    onQuit() { leavePbGameWindow({ confirm: false }) },
    onBatchSkip() { skipPbBatchGame() },
  }
}
</script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
  background: #0f0f2a;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
#app { position: relative; }
button { font-family: inherit; }
html { font-size: clamp(14px, 2vmin + 6px, 26px); }

.page-fade-enter-active, .page-fade-leave-active { transition: opacity .35s ease, transform .35s ease; }
.page-fade-enter { opacity: 0; transform: scale(0.98); }
.page-fade-leave-to { opacity: 0; transform: scale(1.02); }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
</style>
