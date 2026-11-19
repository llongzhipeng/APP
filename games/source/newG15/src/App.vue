<template>
  <div id="app" :style="rootStyle">
    <HomeView v-if="view === 'home'" :t="t" @go="setView" @toggle-lang="toggleLang" />
    <RulesView v-else-if="view === 'rules'" :t="t" @go="setView" />
    <HistoryView v-else-if="view === 'history'" :t="t" @go="setView" />
    <TutorialView
      v-else-if="view === 'tutorial'"
      :t="t"
      @skip="onTutorialDone"
      @done="onTutorialDone"
    />
    <DurationView
      v-else-if="view === 'duration'"
      :t="t"
      @choose="onDurationChosen"
      @go="setView"
    />
    <GameView
      v-else-if="view === 'game'"
      :t="t"
      :lang="lang"
      :duration="chosenDuration"
      @finish="onGameFinish"
    />
    <ResultView
      v-else-if="view === 'result'"
      :t="t"
      :result="lastResult"
      @go="setView"
    />
  </div>
</template>

<script>
import { messages } from './i18n.js'
import { saveRecord } from './utils/storage.js'
import HomeView from './views/HomeView.vue'
import RulesView from './views/RulesView.vue'
import HistoryView from './views/HistoryView.vue'
import TutorialView from './views/TutorialView.vue'
import DurationView from './views/DurationView.vue'
import GameView from './views/GameView.vue'
import ResultView from './views/ResultView.vue'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'zysxt'

export default {
  name: 'App',
  components: {
    HomeView, RulesView, HistoryView,
    TutorialView, DurationView, GameView, ResultView
  },
  data() {
    return {
      view: 'home',
      lang: 'zh',
      chosenDuration: 60,
      lastResult: null,
      unit: 10,
      archiveId: -1,
    }
  },
  computed: {
    t() { return messages[this.lang] },
    rootStyle() {
      return { '--u': `${this.unit}px` }
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.computeUnit()
    window.addEventListener('resize', this.computeUnit)
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.chosenDuration = sec },
      openTutorial: () => { this.view = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computeUnit)
  },
  methods: {
    computeUnit() {
      const w = window.innerWidth
      const h = window.innerHeight
      // Base design canvas: 1280 x 720. Scale to fit whichever axis is tighter.
      const scale = Math.min(w / 1280, h / 720)
      // Base unit = 10px; clamp so it stays legible on tiny/huge screens.
      const u = Math.max(6, Math.min(22, 10 * scale))
      this.unit = u
    },
    setView(v) { this.view = v },
    toggleLang() {
      // Only allow toggling when not in game or countdown
      if (this.view === 'game') return
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (sec) => {
        this.chosenDuration = sec
        this.view = 'game'
      })) return
      this.view = 'duration'
    },
    onDurationChosen(seconds) {
      this.chosenDuration = seconds
      this.view = 'game'
    },
    onGameFinish(result) {
      this.lastResult = result
      saveRecord(result)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(result.avgRt || 0),
        score: result.score || 0,
        successCount: result.success,
        failCount: result.fail,
        trainDuration: result.duration,
        difficultyLevel: result.finalLevel,
      }).catch(() => {})
      this.view = 'result'
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: #1e2233;
  color: #333;
}
body { background: #0f2744; color: #e8f4fd; }
button { font-family: inherit; }
</style>
