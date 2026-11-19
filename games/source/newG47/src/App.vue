<template>
  <div id="app">
    <transition name="page-fade" mode="out-in">
      <Home v-if="view === 'home'" key="home" @go="go" @toggle-lang="toggleLang" />
      <Rules v-else-if="view === 'rules'" key="rules" @go="go" />
      <History v-else-if="view === 'history'" key="history" @go="go" />
      <Duration v-else-if="view === 'duration'" key="dur" @go="go" @start="startGame" />
      <Game
        v-else-if="view === 'game'"
        key="game"
        :duration="duration"
        :show-batch-skip="showBatchSkip"
        @finish="onFinish"
      />
      <Result v-else-if="view === 'result'" key="res" :result="result" @go="go" @toggle-lang="toggleLang" />
    </transition>
    <Tutorial v-if="showTutorial" @done="onTutorialDone" />
  </div>
</template>
<script>
import Home from './views/Home.vue'
import Rules from './views/Rules.vue'
import History from './views/History.vue'
import Tutorial from './views/Tutorial.vue'
import Duration from './views/Duration.vue'
import Game from './views/Game.vue'
import Result from './views/Result.vue'
import { store, setLang, loadHistory, saveHistoryItem } from './store.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { shouldShowPbBatchSkip } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'jyzbtwz' // 记忆藏宝图（位置）

export default {
  name: 'App',
  components: { Home, Rules, History, Tutorial, Duration, Game, Result },
  data() {
    return {
      view: 'home', // 当前视图
      showTutorial: false, // 是否显示教程
      duration: 180, // 训练时长（秒）
      result: null, // 本局结果
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route) // 解析患者 ID
    this.showBatchSkip = shouldShowPbBatchSkip() // 批次模式显示跳过
    loadHistory()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur }, // 方案时长（秒）
      openTutorial: () => { this.showTutorial = true }, // 打开教程
    })
  },
  methods: {
    go(v) {
      if (v === 'tutorial') { this.showTutorial = true; return }
      this.view = v
    },
    toggleLang() { setLang(store.lang === 'zh' ? 'en' : 'zh') },
    /**
     * <summary>
     * 教程完成：批次模式直接开局，否则进入时长选择
     * </summary>
     */
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return
      this.view = 'duration'
    },
    startGame(seconds) {
      this.duration = seconds // 训练时长
      this.view = 'game'
    },
    /**
     * <summary>
     * 自然结束：保存本地记录并上传训练数据
     * </summary>
     */
    onFinish(r) {
      this.result = r
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      const date = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      saveHistoryItem({
        date,
        maxLevel: r.maxLevel,
        duration: r.duration,
        total: r.total,
        correct: r.correct,
        wrong: r.wrong,
        avgReact: r.avgReact,
        score: r.score
      })
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: r.avgReact != null ? msToPbGameSeconds(r.avgReact) : 0,
        score: r.score || 0,
        successCount: r.correct || 0,
        failCount: r.wrong || 0,
        trainDuration: r.duration || this.duration,
        difficultyLevel: r.difficulty || 1,
      })
      this.view = 'result'
    },
  }
}
</script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
  background: #0f0f2a;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
#app { position: relative; }
button { font-family: inherit; }
html { font-size: clamp(14px, 2vmin + 6px, 26px); }

.page-fade-enter-active, .page-fade-leave-active { transition: opacity .35s ease, transform .35s ease; }
.page-fade-enter { opacity: 0; transform: scale(0.98); }
.page-fade-leave-to { opacity: 0; transform: scale(1.02); }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
</style>
