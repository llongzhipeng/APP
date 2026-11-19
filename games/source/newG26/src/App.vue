<template>
  <div id="rt-app" class="app-shell">
    <Home v-if="screen === 'home'" @nav="onNav" />

    <transition name="fade">
      <Rules v-if="modal === 'rules'" @close="closeModal" />
    </transition>
    <transition name="fade">
      <History v-if="modal === 'history'" @close="closeModal" />
    </transition>

    <transition name="fade">
      <Tutorial v-if="screen === 'tutorial'"
                @skip="onTutorialDone" @done="onTutorialDone" />
    </transition>

    <transition name="fade">
      <DurationSelect v-if="screen === 'duration'"
                      @back="screen = 'home'"
                      @start="startGame" />
    </transition>

    <Game v-if="screen === 'game'"
          :duration="duration"
          :show-batch-skip="showBatchSkip"
          :key="gameKey"
          @home="goHome"
          @restart="restart"
          @finish="onGameFinish"
          @quit="onQuit"
          @batch-skip="onBatchSkip" />
  </div>
</template>

<script>
import './styles/global.css'
import { i18nMixin } from './i18n.js'
import Home from './views/Home.vue'
import Rules from './views/Rules.vue'
import History from './views/History.vue'
import Tutorial from './views/Tutorial.vue'
import DurationSelect from './views/DurationSelect.vue'
import Game from './views/Game.vue'
import { unlockAudio } from './audio.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'jzqj'

export default {
  mixins: [i18nMixin],
  components: { Home, Rules, History, Tutorial, DurationSelect, Game },
  data() {
    return {
      screen: 'home',
      modal: null,
      duration: 60,
      gameKey: 0,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur },
      openTutorial: () => { this.screen = 'tutorial' },
    })
  },
  methods: {
    onNav(k) {
      unlockAudio()
      if (k === 'start') { this.screen = 'tutorial' }
      else if (k === 'rules') { this.modal = 'rules' }
      else if (k === 'history') { this.modal = 'history' }
      else if (k === 'skip') { /* per spec: no functionality */ }
    },
    closeModal() { this.modal = null },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.screen = 'duration'
    },
    startGame(sec) {
      this.duration = sec
      this.gameKey++
      this.screen = 'game'
    },
    onGameFinish(rec) {
      const r = rec || {}
      const avgRaw = r.avgRt
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: avgRaw != null ? msToPbGameSeconds(avgRaw) : 0,
        score: r.score || 0,
        successCount: r.success || 0,
        failCount: r.fail || 0,
        trainDuration: r.duration != null ? r.duration : this.duration,
        difficultyLevel: r.level != null ? r.level : 1,
      })
    },
    onQuit() { leavePbGameWindow({ confirm: false }) },
    onBatchSkip() { skipPbBatchGame() },
    goHome() { this.screen = 'home' },
    restart() { this.screen = 'duration' },
  }
}
</script>
