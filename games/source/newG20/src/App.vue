<template>
  <div id="app">
    <HomeView v-if="view === 'home'" :t="t" @nav="navigate" @toggle-lang="toggleLang" />
    <RulesView v-else-if="view === 'rules'" :t="t" @nav="navigate" />
    <HistoryView v-else-if="view === 'history'" :t="t" @nav="navigate" />
    <TutorialView v-else-if="view === 'tutorial'" :t="t" @done="onTutorialDone" />
    <DurationView v-else-if="view === 'duration'" :t="t" :lang="lang" @select="startGame" @nav="navigate" />
    <GameView v-else-if="view === 'game'" :t="t" :duration="duration" :lang="lang" :archive-id="archiveId" @finish="onGameFinish" />
    <GameOverView v-else-if="view === 'gameover'" :t="t" :record="lastRecord" @nav="navigate" />
  </div>
</template>

<script>
import { messages } from './i18n.js'
import HomeView from './views/HomeView.vue'
import RulesView from './views/RulesView.vue'
import HistoryView from './views/HistoryView.vue'
import TutorialView from './views/TutorialView.vue'
import DurationView from './views/DurationView.vue'
import GameView from './views/GameView.vue'
import GameOverView from './views/GameOverView.vue'
import { resolveArchiveId } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'shdr'

export default {
  name: 'App',
  components: { HomeView, RulesView, HistoryView, TutorialView, DurationView, GameView, GameOverView },
  data() {
    return {
      view: 'home',
      lang: 'zh',
      duration: 60,
      lastRecord: null,
      archiveId: -1,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.duration = sec },
      openTutorial: () => { this.view = 'tutorial' },
    })
  },
  computed: {
    t() {
      return { ...messages[this.lang], lang: this.lang }
    }
  },
  methods: {
    navigate(target) {
      this.view = target
    },
    toggleLang() {
      // Only allowed outside of game
      if (this.view === 'game') return
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.startGame(sec))) return
      this.view = 'duration'
    },
    startGame(seconds) {
      this.duration = seconds
      this.view = 'game'
    },
    onGameFinish(record) {
      // Save to localStorage
      try {
        const raw = localStorage.getItem('g20_history')
        const arr = raw ? JSON.parse(raw) : []
        arr.push(record)
        // Keep last 100
        if (arr.length > 100) arr.splice(0, arr.length - 100)
        localStorage.setItem('g20_history', JSON.stringify(arr))
      } catch (e) {}
      this.lastRecord = record
      this.view = 'gameover'
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body { background: #0f2744; color: #e8f4fd; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #2c3e50;
}
button { font-family: inherit; }
/* Base font size scales with viewport */
html { font-size: clamp(14px, 1.9vmin, 22px); }

@media (orientation: portrait) {
  html { font-size: clamp(15px, 3.4vmin, 20px); }
}
</style>
