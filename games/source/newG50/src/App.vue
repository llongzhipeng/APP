<template>
  <div class="cytk-game-app">
    <div class="app-container">
      <transition name="fade" mode="out-in">
        <HomeScreen
          v-if="scene === 'home'" key="home"
          :lang="lang"
          @go="onGo" @toggle-lang="toggleLang"
        />
        <RulesScreen
          v-else-if="scene === 'rules'" key="rules"
          :lang="lang" @back="onGo('home')"
        />
        <HistoryScreen
          v-else-if="scene === 'history'" key="history"
          :lang="lang" @back="onGo('home')"
        />
        <TutorialScreen
          v-else-if="scene === 'tutorial'" key="tut"
          :lang="lang"
          @done="onTutorialDone" @skip="onTutorialDone"
        />
        <DurationSelect
          v-else-if="scene === 'duration'" key="dur"
          :lang="lang"
          @select="onDurationSelected" @back="onGo('home')"
        />
        <GameScreen
          v-else-if="scene === 'game'" key="game"
          :lang="lang" :duration="duration"
          :show-batch-skip="showBatchSkip"
          @end="onGameEnd"
          @quit="onQuit"
          @batch-skip="onBatchSkip"
        />
        <ResultScreen
          v-else-if="scene === 'result'" key="res"
          :lang="lang" :result="result"
          @go="onGo"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import HomeScreen from './components/HomeScreen.vue'
import RulesScreen from './components/RulesModal.vue'
import HistoryScreen from './components/HistoryScreen.vue'
import TutorialScreen from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GameScreen from './components/GameScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import { saveHistory } from './utils/storage.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'cytk' // 成语填空

export default {
  components: { HomeScreen, RulesScreen, HistoryScreen, TutorialScreen, DurationSelect, GameScreen, ResultScreen },
  data() {
    return {
      scene: 'home', // 当前场景
      lang: 'zh', // 语言
      duration: 60, // 训练时长（秒）
      result: null, // 本局结果
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 批次跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur },
      openTutorial: () => { this.scene = 'tutorial' },
    })
  },
  methods: {
    onGo(target) { this.scene = target },
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.onDurationSelected(dur))) return
      this.scene = 'duration'
    },
    onDurationSelected(d) {
      this.duration = d
      this.scene = 'game'
    },
    onGameEnd(summary) {
      const s = summary || {}
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(s.avgReact),
        score: s.score || 0,
        successCount: s.correct || 0,
        failCount: s.wrong || 0,
        trainDuration: s.duration || this.duration,
        difficultyLevel: s.endLevel || 1,
      })
      this.result = summary
      saveHistory(summary)
      this.scene = 'result'
    },
    onQuit() { leavePbGameWindow({ confirm: false }) },
    onBatchSkip() { skipPbBatchGame() },
  }
}
</script>

<style>
/* 嵌入主应用路由时须铺满视口；原 main.css 仅在独立 main.js 入口加载 */
.cytk-game-app {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  z-index: 0;
}
.cytk-game-app .app-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
