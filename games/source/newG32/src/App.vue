<template>
  <div id="app" class="stage">
    <transition name="page" mode="out-in">
      <Home         v-if="page==='home'"      key="home"     @start="goto('tutorial')" @rules="goto('rules')" @history="goto('history')" />
      <Tutorial     v-else-if="page==='tutorial'" key="tut"  @skip="onTutorialDone" @done="onTutorialDone" @back="goto('home')" />
      <DurationSelect v-else-if="page==='duration'" key="dur" @select="startGame" @back="goto('tutorial')" />
      <Game         v-else-if="page==='game'"  key="game"    :duration="duration" :show-batch-skip="showBatchSkip" @finish="finish" @quit="onQuit" @batch-skip="onBatchSkip" />
      <Result       v-else-if="page==='result'" key="res"    :result="lastResult" @home="goto('home')" @again="goto('duration')" />
      <Rules        v-else-if="page==='rules'"  key="rules"  @back="goto('home')" />
      <History      v-else-if="page==='history'" key="hist"  @back="goto('home')" />
    </transition>
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
import { lockLang } from './i18n'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'ktxx' // 课堂学习 gameType

export default {
  name: 'App',
  components: { Home, Tutorial, DurationSelect, Game, Result, Rules, History },
  data() {
    return {
      page: 'home', // 当前页面
      duration: 60, // 训练时长（秒）
      lastResult: null, // 本局结果
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
      openTutorial: () => { this.goto('tutorial') },
    })
  },
  methods: {
    goto(p) { this.page = p; lockLang(p === 'game') },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.goto('duration')
    },
    startGame(sec) { this.duration = sec; this.goto('game') },
    finish(result) {
      if (result) {
        submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
          avgTime: msToPbGameSeconds(result.avgMs || 0),
          score: result.score || 0,
          successCount: result.success || 0,
          failCount: result.fail || 0,
          trainDuration: result.duration || this.duration,
          difficultyLevel: result.levels || 1,
        })
      }
      this.lastResult = result
      lockLang(false)
      this.page = result ? 'result' : 'home'
    },
    onQuit() {
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
  },
}
</script>

<style>
:root {
  /* fluid root font: 12px on tiny screens up to 22px on huge */
  font-size: clamp(11px, 1.35vmin, 22px);
}
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #app { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
               'Hiragino Sans GB', 'Microsoft YaHei', Roboto, Helvetica, Arial, sans-serif;
  color: #eaeaea;
  background: #0e1116;
  user-select: none;
}
button { font-family: inherit; cursor: pointer; border: none; outline: none; background: none; color: inherit; }
.stage {
  position: fixed; inset: 0;
  display: flex; align-items: stretch; justify-content: stretch;
  overflow: hidden;
}
.stage > * { flex: 1; min-width: 0; min-height: 0; }

/* Page transitions */
.page-enter-active, .page-leave-active { transition: opacity .35s ease, transform .35s ease; }
.page-enter { opacity: 0; transform: scale(1.02); }
.page-leave-to { opacity: 0; transform: scale(.98); }

/* Shared design tokens */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5em;
  padding: 1.5vmin 3vmin; border-radius: 999px; font-weight: 700;
  font-size: 2.2vmin; letter-spacing: .02em;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
}
.btn:active { transform: translateY(1px) scale(.98); }
.btn-primary {
  background: linear-gradient(135deg, #ffb347, #ff7a3d);
  color: #fff; box-shadow: 0 .5rem 1.5rem rgba(255, 122, 61, .35);
}
.btn-primary:hover { box-shadow: 0 .75rem 2rem rgba(255, 122, 61, .5); }
.btn-secondary {
  background: rgba(255,255,255,.08); color: #fff;
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(10px);
}
.btn-secondary:hover { background: rgba(255,255,255,.14); }
.btn-ghost { color: #fff; background: transparent; padding: .5em 1em; }
.btn-ghost:hover { background: rgba(255,255,255,.08); }

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
</style>
