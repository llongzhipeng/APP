<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <Home v-if="screen === 'home'" key="home" @start="onStart" />
      <DurationSelect v-else-if="screen === 'duration'" key="dur"
                      @back="screen = 'home'"
                      @start="onDurationChosen" />
      <Game v-else-if="screen === 'game'" key="game"
            :duration="duration"
            :show-batch-skip="showBatchSkip"
            @finish="onFinish"
            @quit="onQuit"
            @batch-skip="onBatchSkip" />
      <Result v-else-if="screen === 'result'" key="res"
              :payload="result"
              @again="screen = 'duration'"
              @home="screen = 'home'" />
    </transition>

    <Tutorial v-if="tutorialOn" @done="onTutorialDone" />
  </div>
</template>

<script>
import './styles/global.css'
import Home from './views/Home.vue'
import DurationSelect from './views/DurationSelect.vue'
import Game from './views/Game.vue'
import Result from './views/Result.vue'
import Tutorial from './components/Tutorial.vue'
import { saveHistory } from './utils/storage.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'rwda' // 游戏类型标识

export default {
  name: 'App',
  components: { Home, DurationSelect, Game, Result, Tutorial },
  data() {
    return {
      screen: 'home',   // home | duration | game | result
      tutorialOn: false, // 是否显示教程
      duration: 3, // 训练时长（分钟）
      result: null, // 结算数据
      archiveId: -1, // 档案 ID
      showBatchSkip: false, // 批次模式是否显示跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    this.updateAppH() // 写入真实视口高度 CSS 变量
    window.addEventListener('resize', this.updateAppH)
    window.addEventListener('orientationchange', this.updateAppH)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateAppH)
      window.visualViewport.addEventListener('scroll', this.updateAppH)
    }
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (min) => { this.duration = min },
      openTutorial: () => { this.tutorialOn = true },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateAppH)
    window.removeEventListener('orientationchange', this.updateAppH)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.updateAppH)
      window.visualViewport.removeEventListener('scroll', this.updateAppH)
    }
  },
  methods: {
    /**
     * <summary>
     * 同步真实可视高度到 --app-h，供 --u 等尺寸变量计算
     * </summary>
     */
    updateAppH() {
      const vv = window.visualViewport // Visual Viewport API
      const h = vv ? vv.height : window.innerHeight // 可视高度（px）
      document.documentElement.style.setProperty('--app-h', h + 'px')
    },
    onStart() { this.tutorialOn = true },
    onTutorialDone() {
      this.tutorialOn = false
      if (afterBatchTutorial(GAME_TYPE, (min) => this.onDurationChosen(min))) return
      this.screen = 'duration'
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    onQuit() {
      leavePbGameWindow({ confirm: false })
    },
    onDurationChosen(min) {
      this.duration = min
      this.screen = 'game'
    },
    onFinish(payload) {
      const record = {
        time: Date.now(),
        level: payload.level,
        duration: payload.duration,
        total: payload.total,
        correct: payload.correct,
        wrong: payload.wrong,
        score: Math.round(payload.score),
        avgReact: payload.avgReact
      }
      saveHistory(record)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(payload.avgReact),
        score: Math.round(payload.score) || 0,
        successCount: payload.correct || 0,
        failCount: payload.wrong || 0,
        trainDuration: this.duration,
        difficultyLevel: payload.level || 1,
      })
      this.result = payload
      this.screen = 'result'
    }
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.32s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
