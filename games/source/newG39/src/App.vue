<template>
  <div class="app-root" :style="scaleStyle">
    <transition name="fade" mode="out-in">
      <Home v-if="view==='home'" key="home" @start="onStart" @rules="showRules=true" @history="go('history')" />
      <Tutorial v-else-if="view==='tutorial'" key="tut" @done="onTutorialDone" @skip="onTutorialDone" />
      <Duration v-else-if="view==='duration'" key="dur" @back="go('home')" @start="onStartGame" />
      <Game v-else-if="view==='game'" key="game" :duration="duration" :show-batch-skip="showBatchSkip" @finish="onFinish" @quit="onQuit" @batch-skip="onBatchSkip" />
      <Result v-else-if="view==='result'" key="res" :result="lastResult" @again="onStart" @home="go('home')" />
      <History v-else-if="view==='history'" key="hist" @back="go('home')" />
    </transition>

    <!-- Rules dialog (accessible from home) -->
    <transition name="fade">
      <div v-if="showRules" class="overlay" @click.self="showRules=false">
        <div class="card rules-card">
          <h2>{{ t('rulesTitle') }}</h2>
          <div class="scroll rules-body">
            <p v-for="(l,i) in t('rulesBody')" :key="i">{{ l }}</p>
          </div>
          <button class="btn" @click="showRules=false">{{ t('close') }}</button>
        </div>
      </div>
    </transition>

    <!-- Language toggle (hidden during game) -->
    <button v-if="!inGame" class="lang-btn" @click="toggleLang">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>
      <span>{{ t('lang') }}</span>
    </button>
  </div>
</template>

<script>
import { store, actions, t } from './store'
import Home from './components/Home.vue'
import Tutorial from './components/Tutorial.vue'
import Duration from './components/Duration.vue'
import Game from './components/Game.vue'
import Result from './components/Result.vue'
import History from './components/History.vue'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'shhd' // 守护花朵 gameType

export default {
  components: { Home, Tutorial, Duration, Game, Result, History },
  data () {
    return {
      store, // 全局 store
      showRules: false, // 规则弹窗
      vw: window.innerWidth, // 视口宽
      vh: window.innerHeight, // 视口高
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    }
  },
  computed: {
    view () { return this.store.view },
    duration () { return this.store.duration },
    lastResult () { return this.store.lastResult },
    inGame () { return this.view === 'game' },
    t () { const _ = this.store.lang; return t },
    scaleStyle () {
      const dw = 1600, dh = 900
      const s = Math.min(this.vw / dw, this.vh / dh)
      return {
        '--scale': s,
        '--dw': dw + 'px',
        '--dh': dh + 'px'
      }
    }
  },
  created () {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted () {
    window.addEventListener('resize', this.onResize)
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { actions.setDuration(dur) },
      openTutorial: () => { actions.go('tutorial') },
    })
  },
  methods: {
    go (v) { actions.go(v) },
    onStart () { actions.go('tutorial') },
    onTutorialDone () {
      if (afterBatchTutorial(GAME_TYPE, (dur) => {
        actions.setDuration(dur)
        actions.go('game')
      })) return
      actions.go('duration')
    },
    onStartGame (sec) { actions.setDuration(sec); actions.go('game') },
    onFinish (result) {
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(result.avgMs || 0),
        score: result.score || 0,
        successCount: result.success || 0,
        failCount: result.fail || 0,
        trainDuration: result.duration || this.duration,
        difficultyLevel: result.level || 1,
      })
      actions.saveResult(result)
      actions.go('result')
    },
    onQuit () {
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip () {
      skipPbBatchGame()
    },
    toggleLang () { actions.setLang(this.store.lang === 'zh' ? 'en' : 'zh') },
    onResize () { this.vw = window.innerWidth; this.vh = window.innerHeight }
  },
  beforeDestroy () { window.removeEventListener('resize', this.onResize) }
}
</script>

<style>
.app-root {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(1200px 800px at 20% 10%, #12314a 0%, transparent 60%),
    radial-gradient(1000px 700px at 90% 90%, #1a4d3a 0%, transparent 60%),
    linear-gradient(135deg,#0a1526,#0d1a1a);
}
.lang-btn {
  position: fixed; top: 3vmin; right: 3vmin; z-index: 100;
  display: inline-flex; align-items: center; gap: 1vmin;
  padding: 1.4vmin 2.4vmin;
  border-radius: 999px;
  color: #fff;
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255,255,255,.32);
  font-weight: 800; letter-spacing: .06em;
  font-size: 2vmin;
  transition: transform .12s, background .2s;
}
.lang-btn svg { width: 2.4vmin; height: 2.4vmin; }
.lang-btn:hover { background: rgba(255,255,255,.22); transform: translateY(-2px); }

.rules-card { max-width: 74vmin; width: 94%; padding: 5vmin 5.5vmin; }
.rules-card h2 { margin-bottom: 2.6vmin; font-size: 3.6vmin; letter-spacing: .05em; }
.rules-body { max-height: 50vh; margin-bottom: 3vmin; }
.rules-body p { line-height: 1.9; color: #e2e8f0; margin-bottom: 1.4vmin; font-size: 2.2vmin; }
.rules-card .btn { width: 100%; padding: 1.15em; font-size: 2.4vmin; }
</style>
