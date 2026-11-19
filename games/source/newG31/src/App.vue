<template>
  <div id="app" :class="'bg-' + scene">
    <div class="bg-glow"></div>
    <div class="bg-stars"><span v-for="n in 40" :key="n" class="star" :style="starStyle(n)"></span></div>

    <div class="stage-wrap" :style="stageStyle">
      <div class="stage-inner">
        <Home
          v-if="scene === 'home'"
          :lang="lang"
          @toggle-lang="toggleLang"
          @start="scene = 'tutorial'"
          @rules="showRules = true"
          @history="showHistory = true"
        />
        <Tutorial
          v-if="scene === 'tutorial'"
          :lang="lang"
          @skip="onTutorialDone"
          @done="onTutorialDone"
        />
        <DurationSelect
          v-if="scene === 'duration'"
          :lang="lang"
          @back="scene = 'home'"
          @start="startGame"
        />
        <Game
          v-if="scene === 'game'"
          :lang="lang"
          :duration-min="durationMin"
          :show-batch-skip="showBatchSkip"
          @end="endGame"
          @quit="onQuit"
          @batch-skip="onBatchSkip"
        />
        <Result
          v-if="scene === 'result'"
          :lang="lang"
          :result="lastResult"
          @home="scene = 'home'"
          @replay="scene = 'duration'"
        />
      </div>
    </div>

    <Rules v-if="showRules" :lang="lang" @close="showRules = false"/>
    <History v-if="showHistory" :lang="lang" @close="showHistory = false"/>
  </div>
</template>

<script>
import Home from './components/Home.vue'
import Tutorial from './components/Tutorial.vue'
import DurationSelect from './components/DurationSelect.vue'
import Game from './components/Game.vue'
import Result from './components/Result.vue'
import Rules from './components/Rules.vue'
import History from './components/History.vue'
import { saveHistoryEntry } from './game.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'yjfzj'
const DESIGN_W = 1280
const DESIGN_H = 800

export default {
  name: 'App',
  components: { Home, Tutorial, DurationSelect, Game, Result, Rules, History },
  data() {
    return {
      lang: 'zh',
      scene: 'home',
      showRules: false,
      showHistory: false,
      durationMin: 3,
      lastResult: null,
      scale: 1,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  computed: {
    stageStyle() {
      return {
        width: DESIGN_W + 'px',
        height: DESIGN_H + 'px',
        transform: `translate(-50%, -50%) scale(${this.scale})`
      }
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.durationMin = dur },
      openTutorial: () => { this.scene = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScale)
  },
  methods: {
    updateScale() {
      const w = window.innerWidth, h = window.innerHeight
      this.scale = Math.min(w / DESIGN_W, h / DESIGN_H)
    },
    toggleLang() {
      if (this.scene !== 'home' && this.scene !== 'result') return
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.scene = 'duration'
    },
    startGame(min) {
      this.durationMin = min
      this.scene = 'game'
    },
    endGame(result) {
      const r = result || {}
      const avgRaw = r.avgRt
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgRaw),
        score: r.score || 0,
        successCount: r.success || 0,
        failCount: r.fail || 0,
        trainDuration: r.duration != null ? r.duration : this.durationMin,
        difficultyLevel: r.level != null ? r.level : 1,
      })
      this.lastResult = result
      if (result.total > 0) saveHistoryEntry(result)
      this.scene = 'result'
    },
    onQuit() { leavePbGameWindow({ confirm: false }) },
    onBatchSkip() { skipPbBatchGame() },
    starStyle(n) {
      const top = (n * 47) % 100
      const left = (n * 73) % 100
      const size = 1 + (n % 3)
      const dur = 2 + (n % 5)
      return {
        top: top + '%',
        left: left + '%',
        width: size + 'px',
        height: size + 'px',
        animationDuration: dur + 's',
        animationDelay: -(n % 5) + 's'
      }
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

#app {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #1a1a4e 0%, #4a2570 40%, #7048e8 100%);
  color: #fff;
}
#app.bg-home    { background: linear-gradient(135deg, #1a1a4e 0%, #4a2570 40%, #7048e8 100%); }
#app.bg-game    { background: linear-gradient(180deg, #0c1445 0%, #23378a 55%, #4a6cf7 100%); }

.bg-glow {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(circle at 20% 30%, rgba(255,209,102,0.25), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(239,71,111,0.22), transparent 45%),
    radial-gradient(circle at 50% 100%, rgba(77,171,247,0.25), transparent 50%);
  pointer-events: none;
  animation: drift 20s ease-in-out infinite;
}
@keyframes drift {
  0%,100% { transform: translate(0,0); }
  50% { transform: translate(2%, -2%); }
}
.bg-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255,255,255,0.9);
  animation: twinkle ease-in-out infinite alternate;
  opacity: 0.6;
}
@keyframes twinkle { to { opacity: 0.1; transform: scale(0.5); } }

.stage-wrap {
  position: absolute;
  top: 50%; left: 50%;
  transform-origin: center center;
  will-change: transform;
}
.stage-inner {
  width: 100%; height: 100%;
  position: relative;
}
button { font-family: inherit; }
</style>
