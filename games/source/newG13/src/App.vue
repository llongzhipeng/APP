<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :t="t"
      @start="onStartGame"
      @rules="showRules = true"
      @history="showHistory = true"
      @toggle-lang="toggleLang"
    />
    <DurationSelect
      v-else-if="screen === 'duration'"
      :t="t"
      @select="onDurationSelected"
      @go="goTo"
    />
    <GamePage
      v-else-if="screen === 'game'"
      :t="t"
      :lang="lang"
      :duration-sec="durationSec"
      @end="onGameEnd"
    />

    <Tutorial
      v-if="showTutorial"
      :t="t"
      :lang="lang"
      @done="onTutorialDone"
    />
    <RulesModal
      v-if="showRules"
      :t="t"
      :lang="lang"
      @close="showRules = false"
    />
    <HistoryModal
      v-if="showHistory"
      :t="t"
      @close="showHistory = false"
    />
    <ResultModal
      v-if="showResult"
      :t="t"
      :result="lastResult"
      @again="playAgain"
      @home="goHomeFromResult"
    />
  </div>
</template>

<script>
import { createI18n, translations } from './i18n.js';
import { saveHistory, formatDateTime } from './gameLogic.js';
import HomePage from './components/HomePage.vue';
import DurationSelect from './components/DurationSelect.vue';
import GamePage from './components/GamePage.vue';
import Tutorial from './components/Tutorial.vue';
import RulesModal from './components/RulesModal.vue';
import HistoryModal from './components/HistoryModal.vue';
import ResultModal from './components/ResultModal.vue';
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry';

const GAME_TYPE = 'dwygp';

export default {
  name: 'App',
  components: {
    HomePage, DurationSelect, GamePage,
    Tutorial, RulesModal, HistoryModal, ResultModal,
  },
  data() {
    const i18n = createI18n();
    return {
      screen: 'home',
      lang: i18n.lang,
      durationSec: 60,
      showRules: false,
      showHistory: false,
      showTutorial: false,
      showResult: false,
      lastResult: null,
      archiveId: -1,
    };
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.durationSec = sec; },
      openTutorial: () => { this.showTutorial = true; },
    });
  },
  methods: {
    t(key) {
      return (translations[this.lang] && translations[this.lang][key]) || key;
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('zoo_lang', this.lang);
    },
    goTo(screen) {
      this.screen = screen;
    },
    onStartGame() {
      this.showTutorial = true;
    },
    onTutorialDone() {
      this.showTutorial = false;
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.onDurationSelected(sec))) return;
      this.screen = 'duration';
    },
    onDurationSelected(sec) {
      this.durationSec = sec;
      this.screen = 'game';
    },
    onGameEnd(result) {
      this.lastResult = result;
      const rate = result.totalCount
        ? Math.round((result.correctCount / result.totalCount) * 100)
        : 0;
      saveHistory({
        date: formatDateTime(Date.now()),
        duration: result.durationPlayed,
        totalCount: result.totalCount,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        successRate: rate,
        avgReactionTime: result.avgReactionTime,
        score: result.score,
        maxDifficulty: result.maxDifficulty,
      });
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(result.avgReactionTime ? Math.round(result.avgReactionTime * 1000) : 0),
        score: result.score ? Math.round(result.score) : 0,
        successCount: result.correctCount,
        failCount: result.wrongCount,
        trainDuration: result.durationPlayed,
        difficultyLevel: result.maxDifficulty,
      }).catch(() => {});
      this.screen = 'home';
      this.showResult = true;
    },
    playAgain() {
      this.showResult = false;
      this.screen = 'duration';
    },
    goHomeFromResult() {
      this.showResult = false;
      this.screen = 'home';
    },
  },
};
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif;
  -webkit-user-select: none; user-select: none;
}
body { background: #0f2744; color: #e8f4fd; }
#app { position: relative; background: #f5f5f5; }
button { font-family: inherit; }
</style>
