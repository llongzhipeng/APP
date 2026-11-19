<template>
  <div id="app-outer" :style="{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }">
    <div id="game21-stage" :style="appStyle">
      <HomePage
        v-if="page === 'home'"
        :t="t"
        :showLang="showLang"
        @start="page = 'tutorial'"
        @rules="page = 'rules'"
        @history="page = 'history'"
        @toggleLang="toggleLang"
      />
      <RulesPage v-else-if="page === 'rules'" :t="t" @back="page = 'home'" />
      <HistoryPage v-else-if="page === 'history'" :t="t" @back="page = 'home'" />
      <TutorialModal v-else-if="page === 'tutorial'" :t="t" @done="onTutorialDone" />
      <DurationSelect v-else-if="page === 'duration'" :t="t" @selected="startGame" />
      <GamePage
        v-else-if="page === 'game'"
        :t="t"
        :duration="gameDuration"
        @end="onGameEnd"
        @quit="onQuit"
      />
      <ResultPage
        v-else-if="page === 'result'"
        :t="t"
        :result="gameResult"
        @playAgain="page = 'tutorial'"
        @home="page = 'home'"
      />
    </div>
  </div>
</template>

<script>
import { leavePbGameWindow } from '@/utils/pbGameBatchLegacy'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { bgImage } from './utils/images'
import { translations } from './src/i18n'
import HomePage from './src/components/HomePage.vue'
import RulesPage from './src/components/RulesPage.vue'
import HistoryPage from './src/components/HistoryPage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import ResultPage from './src/components/ResultPage.vue'

const BASE_W = 1440
const BASE_H = 900

export default {
  name: 'App',
  components: { HomePage, RulesPage, HistoryPage, TutorialModal, DurationSelect, GamePage, ResultPage },
  data() {
    return {
      archiveId: resolveArchiveId(this.$route),
      page: 'home',
      lang: 'zh',
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      gameDuration: 60,
      gameResult: null,
      bgImage,
    }
  },
  computed: {
    t() { return translations[this.lang] },
    showLang() { return this.page === 'home' },
    appStyle() {
      return {
        transformOrigin: 'top left',
        transform: `scale(${this.scale})`,
        left: this.offsetX + 'px',
        top: this.offsetY + 'px',
      }
    },
  },
  mounted() {
    this.calcScale()
    window.addEventListener('resize', this.calcScale)
    applyBatchTutorialEntry('szlx', {
      setDuration: (dur) => { this.gameDuration = dur },
      openTutorial: () => { this.page = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcScale)
  },
  methods: {
    calcScale() {
      const s = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H)
      this.scale = s
      this.offsetX = (window.innerWidth - BASE_W * s) / 2
      this.offsetY = (window.innerHeight - BASE_H * s) / 2
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onTutorialDone() {
      if (afterBatchTutorial('szlx', (secs) => this.startGame(secs))) return
      this.page = 'duration'
    },
    startGame(secs) {
      this.gameDuration = secs
      this.page = 'game'
    },
    onQuit() {
      leavePbGameWindow({ confirm: false })
    },
    onGameEnd(result) {
      this.gameResult = result
      const history = JSON.parse(localStorage.getItem('fishLinkHistory') || '[]')
      history.unshift({
        date: new Date().toLocaleString(),
        project: this.t.projectName,
        difficulty: result.maxDifficulty,
        duration: this.gameDuration,
        total: result.totalRounds,
        success: result.successRounds,
        fail: result.failRounds,
        rate: result.successRate,
        avgTime: result.avgReaction,
        score: result.score,
      })
      localStorage.setItem('fishLinkHistory', JSON.stringify(history.slice(0, 100)))
      submitPbGameEndRecord(this.archiveId, 'szlx', {
        minTime: 0,
        maxTime: 0,
        avgTime: msToPbGameSeconds(result.avgReaction),
        score: result.score,
        successCount: result.successRounds,
        failCount: result.failRounds,
        trainDuration: this.gameDuration,
        difficultyLevel: result.maxDifficulty,
      })
      this.page = 'result'
    },
  },
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
/* 嵌套在主站 #app 内时，用 fixed 铺满视口，避免被全局 #app 样式限宽导致 PC 右侧白屏 */
#app-outer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
  background-color: #0a1a3a;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
#game21-stage {
  width: 1440px;
  height: 900px;
  transform-origin: top left;
  overflow: hidden;
  position: absolute;
}
</style>
