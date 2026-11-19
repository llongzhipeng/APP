<template>
  <div id="app">
    <Home
      v-if="screen === 'home'"
      :t="t" :lang="lang" :records="records"
      @start="screen = 'tutorial'"
      @toggle-lang="toggleLang"
    />
    <Tutorial
      v-if="screen === 'tutorial'"
      :t="t"
      @skip="onTutorialDone"
      @finish="onTutorialDone"
    />
    <DurationSelect
      v-if="screen === 'duration'"
      :t="t"
      @choose="onChooseDuration"
    />
    <Game
      v-if="screen === 'game'"
      :t="t" :lang="lang" :duration="duration" :archive-id="archiveId" :start-difficulty="batchStartDifficulty"
      @end="onGameEnd"
    />
    <Result
      v-if="screen === 'result'"
      :t="t" :record="lastRecord"
      @home="screen = 'home'"
    />
  </div>
</template>

<script>
import Home from './components/Home.vue'
import Tutorial from './components/Tutorial.vue'
import DurationSelect from './components/DurationSelect.vue'
import Game from './components/Game.vue'
import Result from './components/Result.vue'
import { messages } from './i18n.js'
import { resolveArchiveId } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const STORAGE_KEY = 'memoryFlip.records'

export default {
  name: 'App',
  components: { Home, Tutorial, DurationSelect, Game, Result },
  data() {
    let records = []
    try {
      records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (e) {}
    return {
      lang: 'zh',
      screen: 'home',
      duration: 60,
      lastRecord: null,
      records,
      archiveId: null, // 患者档案 ID
      batchStartDifficulty: 1, // 批次起始难度
    }
  },
  computed: {
    t() { return messages[this.lang] },
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
  },
  mounted() {
    applyBatchTutorialEntry('jyfp', {
      setDuration: (dur) => { this.duration = dur },
      setStartDifficulty: (lv) => { this.batchStartDifficulty = lv },
      openTutorial: () => { this.screen = 'tutorial' },
    })
  },
  methods: {
    toggleLang() {
      if (this.screen !== 'home') return
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onChooseDuration(sec, startDiff) {
      this.duration = sec
      if (startDiff != null) this.batchStartDifficulty = startDiff
      this.screen = 'game'
    },
    onTutorialDone() {
      if (afterBatchTutorial('jyfp', (dur, startDiff) => this.onChooseDuration(dur, startDiff))) return
      this.screen = 'duration'
    },
    onGameEnd(record) {
      this.lastRecord = record
      this.records.unshift(record)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records.slice(0, 100))) } catch(e) {}
      this.screen = 'result'
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0a0820;
  user-select: none;
}
button { font-family: inherit; }

@media (orientation: portrait) {
  body { -webkit-text-size-adjust: 100%; }
}
</style>
