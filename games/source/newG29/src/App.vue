<template>
  <div id="app">
    <template v-if="scene === 'home'">
      <HomeScreen
        @start="onStart"
        @rules="showRules = true"
        @history="showHistory = true"
        @skip="onSkip"
      />
    </template>
    <GameScreen
      v-if="scene === 'game'"
      :duration="duration"
      :show-batch-skip="showBatchSkip"
      @finish="onFinish"
      @quit="onQuit"
      @batch-skip="onBatchSkip"
    />
    <TutorialModal v-if="showTutorial" @finish="onTutorialDone" />
    <DurationSelect v-if="showDuration" @choose="onChooseDuration" @back="showDuration = false" />
    <ResultScreen v-if="showResult" :result="result" @again="onAgain" @home="onHome" />
    <RulesModal v-if="showRules" @close="showRules = false" />
    <HistoryModal v-if="showHistory" @close="showHistory = false" />
  </div>
</template>

<script>
import HomeScreen from './components/HomeScreen.vue'
import GameScreen from './components/GameScreen.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import ResultScreen from './components/ResultScreen.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import { saveHistory } from './i18n'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'xhshz'

export default {
  name: 'App',
  components: { HomeScreen, GameScreen, TutorialModal, DurationSelect, ResultScreen, RulesModal, HistoryModal },
  data () {
    return {
      scene: 'home',
      showTutorial: false,
      showDuration: false,
      showResult: false,
      showRules: false,
      showHistory: false,
      duration: 60,
      result: null,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created () {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted () {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur },
      openTutorial: () => { this.showTutorial = true },
    })
  },
  methods: {
    onStart () { this.showTutorial = true },
    onSkip () { /* button only, no functionality per spec */ },
    onTutorialDone () {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.onChooseDuration(dur))) return
      this.showDuration = true
    },
    onChooseDuration (v) {
      this.duration = v
      this.showDuration = false
      this.scene = 'game'
    },
    onFinish (res) {
      const r = res || {}
      const avgRaw = r.avgReactionMs
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: avgRaw != null ? msToPbGameSeconds(avgRaw) : 0,
        score: r.score || 0,
        successCount: r.correct || 0,
        failCount: r.wrong || 0,
        trainDuration: r.duration != null ? r.duration : this.duration,
        difficultyLevel: r.level != null ? r.level : 1,
      })
      this.result = r
      saveHistory(r)
      this.scene = 'home'
      this.showResult = true
    },
    onQuit () { leavePbGameWindow({ confirm: false }) },
    onBatchSkip () { skipPbBatchGame() },
    onAgain () { this.showResult = false; this.showDuration = true },
    onHome () { this.showResult = false },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  background: #000; color: #e6efff;
  -webkit-font-smoothing: antialiased;
}
button { font-family: inherit; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 3px; }
::-webkit-scrollbar-track { background: transparent; }
</style>
