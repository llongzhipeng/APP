<template>
  <div id="app-root">
    <!-- Language toggle (hidden during game) -->
    <button
      v-if="currentView !== 'game'"
      class="lang-btn"
      @click="toggleLang"
    >
      {{ t('langToggle') }}
    </button>

    <!-- Views -->
    <HomePage
      v-if="currentView === 'home'"
      @start-game="onStartGame"
      @show-rules="showRules = true"
      @show-history="currentView = 'history'"
    />

    <GamePage
      v-if="currentView === 'game'"
      :duration="selectedDuration"
      @game-ended="onGameEnded"
    />

    <ResultPage
      v-if="currentView === 'result'"
      :result="gameResult"
      @back-home="currentView = 'home'"
    />

    <HistoryPage
      v-if="currentView === 'history'"
      @back="currentView = 'home'"
    />

    <!-- Overlays (shown above home page) -->
    <TutorialModal
      v-if="showTutorial"
      @done="onTutorialDone"
      @skip="onTutorialDone"
    />

    <DurationSelect
      v-if="showDuration"
      @selected="onDurationSelected"
    />

    <RulesModal
      v-if="showRules"
      @close="showRules = false"
    />
  </div>
</template>

<script>
import { t, langState } from './utils/i18n.js'
import HomePage       from './components/HomePage.vue'
import TutorialModal  from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage       from './components/GamePage.vue'
import RulesModal     from './components/RulesModal.vue'
import HistoryPage    from './components/HistoryPage.vue'
import ResultPage     from './components/ResultPage.vue'
import api from '@/api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const resolveArchiveId = (route) => {
  const fromQuery = route && route.query && route.query.archiveId;
  if (fromQuery != null && fromQuery !== '') return fromQuery;
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) {
    const id = new URLSearchParams(hash.slice(qIndex + 1)).get('archiveId');
    if (id != null && id !== '') return id;
  }
  return -1;
};
export default {
  name: 'App',
  components: {
    HomePage, TutorialModal, DurationSelect,
    GamePage, RulesModal, HistoryPage, ResultPage,
  },

  data() {
    return {
      archiveId: -1,
      currentView: 'home',   // 'home' | 'game' | 'result' | 'history'
      showTutorial: false,
      showDuration: false,
      showRules: false,
      selectedDuration: 60,
      gameResult: null,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
  },

  mounted() {
    applyBatchTutorialEntry('ljlt', {
      setDuration: (secs) => { this.selectedDuration = secs },
      openTutorial: () => { this.showTutorial = true },
    })
  },

  methods: {
    t,
    toggleLang() {
      langState.current = langState.current === 'zh' ? 'en' : 'zh'
    },
    onStartGame() {
      this.showTutorial = true
    },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial('ljlt', (secs) => this.onDurationSelected(secs))) return
      this.showDuration = true
    },
    onDurationSelected(secs) {
      this.showDuration = false
      this.selectedDuration = secs
      this.currentView = 'game'
    },
    onGameEnded(result) {
      this.gameResult = result
      let mintime = parseFloat(result.minReaction / 1000).toFixed(2);
      let maxtime = parseFloat(result.maxReaction / 1000).toFixed(2);
      const body = {
      trainType: 'abstract',
      gameType: 'ljlt',
      archiveId: this.archiveId,
      minTime: mintime,
      maxTime: maxtime,
      avgTime: parseFloat(result.avgReaction / 1000).toFixed(2),
      score: result.score,
      successCount: result.correct,
      failCount: result.wrong,
      trainDuration: result.duration,
      difficultyLevel: result.level,
      }
       api.submitPbGameRecord(body).catch(() => {});

      this.currentView = 'result'
    },
  },
}
</script>

<style>
/* Global reset */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#app-root {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Language toggle button */
.lang-btn {
  position: fixed;
  top: 1.5vmin;
  right: 1.8vmin;
  z-index: 500;
  background: rgba(255,255,255,0.2);
  border: 0.2vmin solid rgba(255,255,255,0.45);
  color: white;
  font-size: 1.7vmin;
  font-weight: 600;
  padding: 0.5vmin 1.4vmin;
  border-radius: 0.8vmin;
  cursor: pointer;
  letter-spacing: 0.05em;
  backdrop-filter: blur(4px);
  transition: background 0.15s;
}

.lang-btn:hover {
  background: rgba(255,255,255,0.3);
}
</style>
