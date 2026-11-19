<template>
  <div id="app">
    <HomePage v-if="page==='home'" :lang="lang" :batch-open-tutorial="batchOpenTutorial" @start="onStart" @history="page='history'" @toggle-lang="toggleLang" />
    <GamePage v-else-if="page==='game'" :lang="lang" :duration="duration" :archive-id="archiveId" @end="onGameEnd" @back="page='home'" />
    <HistoryPage v-else-if="page==='history'" :lang="lang" @back="page='home'" />
  </div>
</template>

<script>
import HomePage from './views/HomePage.vue'
import GamePage from './views/GamePage.vue'
import HistoryPage from './views/HistoryPage.vue'
import { resolveArchiveId } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry } from '@/utils/pbGameBatchEntry'

export default {
  components: { HomePage, GamePage, HistoryPage },
  data() {
    return {
      page: 'home',
      lang: 'zh',
      duration: 3,
      archiveId: null, // 患者档案 ID
      batchOpenTutorial: false, // 批次模式自动打开教程
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
  },
  mounted() {
    applyBatchTutorialEntry('yshy', {
      setDuration: (dur) => { this.duration = dur },
      openTutorial: () => { this.batchOpenTutorial = true },
    })
  },
  methods: {
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    onStart(dur) { this.duration = dur; this.page = 'game' },
    onGameEnd() { this.page = 'home' },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100vw;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', sans-serif;
  background: #1a1a2e;
  color: #e8e8f0;
  user-select: none;
}
body { background: #0f2744; color: #e8f4fd; }
button {
  cursor: pointer;
  border: none;
  outline: none;
  font-family: inherit;
}
</style>
