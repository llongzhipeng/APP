<template>
  <div id="app">
    <div class="stage" :class="'view-'+view">
      <HomePage v-if="view==='home'" :t="t"
        @start="onStartClick" @rules="showRules=true" @history="view='history'"
        @toggle-lang="toggleLang"/>
      <HistoryPage v-if="view==='history'" :t="t" @back="view='home'"/>
      <DurationPage v-if="view==='duration'" :t="t" :lang="lang"
        @back="view='home'" @start="onDurationPicked"/>
      <GamePage v-if="view==='game'" :t="t" :lang="lang" :duration="duration" :show-batch-skip="showBatchSkip" :key="gameKey"
        @finish="onFinish" @quit="onQuit" @batch-skip="onBatchSkip"/>
      <ResultPage v-if="view==='result'" :t="t" :record="lastRecord"
        @home="view='home'" @again="view='duration'"/>

      <RulesModal v-if="showRules" :t="t" :lang="lang" @close="showRules=false"/>
      <TutorialModal v-if="showTutorial" :t="t" @done="onTutorialDone"/>
    </div>
  </div>
</template>

<script>
import HomePage from './components/HomePage.vue'
import HistoryPage from './components/HistoryPage.vue'
import DurationPage from './components/DurationPage.vue'
import GamePage from './components/GamePage.vue'
import ResultPage from './components/ResultPage.vue'
import RulesModal from './components/RulesModal.vue'
import TutorialModal from './components/TutorialModal.vue'
import { createI18n } from './i18n.js'
import { saveHistoryRecord } from './storage.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'fltzs' // 分类挑战赛 gameType

export default {
  name: 'App',
  components: { HomePage, HistoryPage, DurationPage, GamePage, ResultPage, RulesModal, TutorialModal },
  mixins: [createI18n()],
  data() {
    return {
      view: 'home', // 当前视图
      showRules: false, // 规则弹窗
      showTutorial: false, // 教程弹窗
      duration: 60, // 训练时长（秒）
      gameKey: 0, // 强制重挂载 GamePage
      lastRecord: { score: 0, rate: 0, avgReact: 0, total: 0, success: 0, fail: 0, difficulty: 1 },
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    }
  },
  created() {
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
    onStartClick() { this.showTutorial = true },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.onDurationPicked(dur))) return
      this.view = 'duration'
    },
    onDurationPicked(sec) {
      this.duration = sec
      this.gameKey++
      this.view = 'game'
    },
    onFinish(rec) {
      this.lastRecord = rec
      saveHistoryRecord({ time: Date.now(), ...rec })
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(rec.avgReact || 0),
        score: rec.score || 0,
        successCount: rec.success || 0,
        failCount: rec.fail || 0,
        trainDuration: rec.duration || this.duration,
        difficultyLevel: rec.difficulty || 1,
      })
      this.view = 'result'
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
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  background: #030814; color: #eaf4ff; overscroll-behavior: none;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
#app { position: relative; }
.stage { position: relative; width: 100%; height: 100%; }
button { font-family: inherit; }
button:focus { outline: none; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgba(120,200,255,.3); border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
</style>
