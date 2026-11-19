<template>
  <div id="app" :class="'lang-' + locale">
    <!-- Language switch is hidden while the game is running per spec. -->
    <button
      v-if="showLangBtn"
      class="lang-switch"
      :title="t('langTip')"
      @click="toggleLang"
    >
      {{ t('lang') }}
    </button>

    <transition name="view" mode="out-in">
      <component :is="currentView" :key="view" v-bind="viewProps" @nav="onNav" />
    </transition>
  </div>
</template>

<script>
import { i18n, setLocale, i18nMixin } from './i18n.js'
import HomeView from './components/HomeView.vue'
import RulesModal from './components/RulesModal.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GameView from './components/GameView.vue'
import ResultView from './components/ResultView.vue'
import HistoryView from './components/HistoryView.vue'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { shouldShowPbBatchSkip } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'cyfl' // 词义分类 gameType

export default {
  name: 'App',
  mixins: [i18nMixin],
  data() {
    return {
      view: 'home', // 当前视图
      payload: null, // 子视图传参
      durationMin: 3, // 训练时长（分钟）
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    }
  },
  computed: {
    currentView() {
      return {
        home: HomeView,
        rules: RulesModal,
        tutorial: TutorialModal,
        duration: DurationSelect,
        game: GameView,
        result: ResultView,
        history: HistoryView,
      }[this.view]
    },
    viewProps() {
      if (this.view === 'game') {
        return {
          duration: ((this.payload && this.payload.duration) || this.durationMin * 60),
          showBatchSkip: this.showBatchSkip,
        }
      }
      if (this.view === 'result') return { record: this.payload }
      return {}
    },
    showLangBtn() { return this.view !== 'game' },
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.durationMin = dur },
      openTutorial: () => { this.view = 'tutorial' },
    })
  },
  methods: {
    onNav({ to, data } = {}) {
      if (to === 'result' && data) {
        submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
          avgTime: msToPbGameSeconds(data.avgRT || 0),
          score: data.score || 0,
          successCount: data.correct || 0,
          failCount: data.wrong || 0,
          trainDuration: this.durationMin,
          difficultyLevel: data.finalLevel || 1,
        })
      }
      if (to === 'duration') {
        if (afterBatchTutorial(GAME_TYPE, (dur) => {
          this.durationMin = dur
          this.view = 'game'
          this.payload = { duration: dur * 60 }
        })) return
      }
      this.payload = data != null ? data : null
      this.view = to
    },
    toggleLang() {
      setLocale(i18n.locale === 'zh' ? 'en' : 'zh')
    },
  },
}
</script>

<style>
/* --- Global reset / typography ------------------------------------- */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  background: #000;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
:focus-visible { outline: 2px solid rgba(217,119,66,.5); outline-offset: 3px; border-radius: 8px; }

/* Design tokens — warm print-inspired palette from newG19. */
:root {
  --fs-xs: 1.6vmin;
  --fs-sm: 2vmin;
  --fs-md: 2.4vmin;
  --fs-lg: 2.8vmin;
  --fs-xl: 3.6vmin;
  --fs-2xl: 5vmin;
  --fs-hero: 9vmin;

  --c-bg-1: #f6f2ea;
  --c-bg-2: #e8ddc8;
  --c-paper: #ffffff;
  --c-paper-soft: #fff8ec;
  --c-line: #d0b48a;
  --c-line-2: #b08b4f;

  --c-brown: #7a5a2c;
  --c-brown-dim: #8a6a3a;
  --c-title: #7a3a1e;
  --c-orange: #d97742;
  --c-orange-dim: #b04e1e;

  --c-ok: #58a058;
  --c-ok-bg: #d3f0d3;
  --c-ok-text: #2b7a2b;
  --c-err: #d55555;
  --c-err-bg: #ffd6cc;
  --c-err-text: #c22;
  --c-warn: #d33;

  --shadow-sm: 0 0.4vmin 1.2vmin rgba(122,90,44,.15);
  --shadow-md: 0 0.6vmin 1.8vmin rgba(122,90,44,.22);
  --shadow-lg: 0 1.2vmin 3vmin rgba(122,90,44,.28);
}

#app {
  width: 100vw; height: 100vh;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 0%, var(--c-bg-1), var(--c-bg-2));
}

.lang-switch {
  position: fixed; top: 2.4vmin; right: 2.4vmin; z-index: 100;
  padding: 0.8vmin 1.6vmin;
  border-radius: 999px;
  background: rgba(255,255,255,.85);
  border: 1px solid var(--c-line);
  font-size: var(--fs-sm);
  color: var(--c-brown);
  box-shadow: var(--shadow-sm);
}

/* Shared buttons used by home / rules / tutorial / result / history */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding: 1.6vmin 3vmin;
  border-radius: 1.5vmin;
  border: 0.25vmin solid var(--c-line-2);
  background: var(--c-paper);
  color: var(--c-brown);
  font-size: var(--fs-md);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.btn:hover { transform: translateY(-0.3vmin); box-shadow: var(--shadow-md); background: var(--c-paper-soft); }
.btn:active { transform: translateY(1px) scale(.98); }
.btn:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: var(--shadow-sm); }
.btn-primary {
  background: linear-gradient(135deg, var(--c-orange), var(--c-orange-dim));
  color: #fff;
  border-color: #a34418;
}
.btn-primary:hover { background: linear-gradient(135deg, #e28855, #bd5a24); }
.btn-danger {
  background: linear-gradient(135deg, #d55555, #a33333);
  color: #fff;
  border-color: #922;
}
.btn-danger:hover { background: linear-gradient(135deg, #e66666, #b44444); }

.view-enter-active, .view-leave-active { transition: opacity .3s ease, transform .3s ease; }
.view-enter { opacity: 0; transform: scale(.98); }
.view-leave-to { opacity: 0; transform: scale(1.02); }
</style>
