<template>
  <div id="app">
    <div class="app-container">
      <transition name="fade" mode="out-in">
        <Home
          v-if="page === 'home'"
          key="home"
          :lang="lang"
          @go="onGo"
          @toggle-lang="toggleLang"
        />
        <Rules
          v-else-if="page === 'rules'"
          key="rules"
          :lang="lang"
          @back="onGo('home')"
        />
        <History
          v-else-if="page === 'history'"
          key="history"
          :lang="lang"
          @back="onGo('home')"
        />
        <Tutorial
          v-else-if="page === 'tutorial'"
          key="tutorial"
          :lang="lang"
          @done="onTutorialDone"
          @skip="onTutorialDone"
        />
        <DurationSelect
          v-else-if="page === 'duration'"
          key="duration"
          :lang="lang"
          @select="onDurationSelected"
          @back="onGo('home')"
        />
        <Game
          v-else-if="page === 'game'"
          key="game"
          :lang="lang"
          :duration="duration"
          :show-batch-skip="showBatchSkip"
          @end="onGameEnd"
          @quit="onQuit"
          @batch-skip="onBatchSkip"
        />
        <Result
          v-else-if="page === 'result'"
          key="result"
          :lang="lang"
          :result="result"
          @go="onGo"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import Home from './pages/Home.vue';
import Rules from './pages/Rules.vue';
import History from './pages/History.vue';
import Tutorial from './pages/Tutorial.vue';
import DurationSelect from './pages/DurationSelect.vue';
import Game from './pages/Game.vue';
import Result from './pages/Result.vue';
import { saveHistoryRecord } from './utils/storage.js';
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper';
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry';
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy';

const GAME_TYPE = 'ktccy'; // 看图猜成语 gameType

export default {
  components: { Home, Rules, History, Tutorial, DurationSelect, Game, Result },
  data() {
    return {
      page: 'home', // 当前页面
      lang: 'zh', // 语言
      duration: 60, // 训练时长（秒）
      result: null, // 本局结果
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    };
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
    this.showBatchSkip = shouldShowPbBatchSkip();
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.duration = dur; },
      openTutorial: () => { this.page = 'tutorial'; },
    });
  },
  methods: {
    onGo(target) { this.page = target; },
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh'; },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.onDurationSelected(dur))) return;
      this.page = 'duration';
    },
    onDurationSelected(d) { this.duration = d; this.page = 'game'; },
    onGameEnd(summary) {
      this.result = summary;
      saveHistoryRecord(summary);
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(summary.avgRt || 0),
        score: summary.score || 0,
        successCount: summary.correct || 0,
        failCount: summary.fail || 0,
        trainDuration: summary.durationSec || this.duration,
        difficultyLevel: summary.finalLevel || 1,
      });
      this.page = 'result';
    },
    onQuit() {
      leavePbGameWindow({ confirm: false });
    },
    onBatchSkip() {
      skipPbBatchGame();
    },
  },
};
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: #000;
  color: #333;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app {
  width: 100vw; height: 100vh;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.app-container {
  width: 100vw; height: 100vh;
  position: relative; overflow: hidden;
}
button { font-family: inherit; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
