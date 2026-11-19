<template>
  <div id="app">
    <div v-if="shouldShowHeader" class="app-header">
      <h1 class="app-title">{{ t('appName') }}</h1>
      <LanguageSwitcher :disabled="isGameInProgress" @language-changed="handleLanguageChange" />
    </div>

    <div class="app-content">
      <StartScreen
        v-if="currentView === 'start'"
        @start="handleStart"
        @view-records="handleViewRecords"
        @view-rules="handleViewRules"
      />

      <GameContainer
        v-if="currentView === 'game'"
        :duration="selectedDuration"
        :key="gameKey"
        @game-finished="handleGameFinished"
        @back="handleBackToStart"
      />

      <ResultScreen
        v-if="currentView === 'result'"
        :record="latestRecord"
        @back="handleBackToStart"
      />

      <RecordsScreen
        v-if="currentView === 'records'"
        @back="handleBackToStart"
      />

      <RulesScreen
        v-if="currentView === 'rules'"
        @back="handleBackToStart"
      />
    </div>
  </div>
</template>

<script>
import { createI18n } from './i18n'
import { storage } from './utils/storage'
import LanguageSwitcher from './components/ui/LanguageSwitcher.vue'
import StartScreen from './components/StartScreen.vue'
import GameContainer from './components/GameContainer.vue'
import ResultScreen from './components/ResultScreen.vue'
import RecordsScreen from './components/RecordsScreen.vue'
import RulesScreen from './components/RulesScreen.vue'
import api from '@/api';
import { applyBatchDirectStart } from '@/utils/pbGameBatchEntry';

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
    LanguageSwitcher,
    StartScreen,
    GameContainer,
    ResultScreen,
    RecordsScreen,
    RulesScreen
  },

  data() {
    return {
      i18n: createI18n(),
      archiveId: -1,
      currentView: 'start', // start | game | result | records | rules
      selectedDuration: 60,
      latestRecord: null,
      gameKey: 0
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
    applyBatchDirectStart('jyhsz', {
      setDuration: (duration) => { this.selectedDuration = duration },
      startGame: () => {
        this.currentView = 'game'
        this.gameKey++
      },
    })
  },
  provide() {
    return {
      i18n: this.i18n
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    },
    isGameInProgress() {
      return this.currentView === 'game'
    },
    shouldShowHeader() {
      // 只在训练记录和游戏规则页面显示header
      return this.currentView === 'records' || this.currentView === 'rules'
    }
  },
  mounted() {
  },
  methods: {
    handleStart(duration) {
      this.selectedDuration = duration
      this.currentView = 'game'
      this.gameKey++
    },

    handleGameFinished(record) {
      // 保存训练记录
      storage.saveRecord(record)

      // 显示结果页面
      this.latestRecord = record
      this.currentView = 'result'
      // body: JSON.stringify({
      //     trainType: 'memory',
      //     gameType: 'jyhsz',
      //     minTime: record.minResponseTime,
      //     maxTime: record.maxResponseTime,
      //     avgTime: record.averageResponseTime,
      //     score: record.score
      //   })

      const body = {
          archiveId: this.archiveId,
          trainType: 'memory',
          gameType: 'jyhsz',
          minTime : parseFloat(record.minResponseTime).toFixed(2),
          maxTime : parseFloat(record.maxResponseTime).toFixed(2),
          avgTime:  parseFloat(record.averageResponseTime).toFixed(2),
          score: record.score,
          successCount: record.successCount,
          failCount: record.failureCount,
          trainDuration: record.duration,
          difficultyLevel: record.difficultyLevel,
          };
          console.log('Submitting game record:', body);
      api.submitPbGameRecord(body).catch(() => {});
    },

    handleBackToStart() {
      this.currentView = 'start'
      this.latestRecord = null
    },

    handleLanguageChange() {
      // i18n现在是响应式的，无需手动刷新
    },

    handleViewRecords() {
      this.currentView = 'records'
    },

    handleViewRules() {
      this.currentView = 'rules'
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.app-header {
  background-color: #fff;
  padding: 20px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 28px;
  color: #4CAF50;
  font-weight: 700;
}

.app-content {
  padding: 20px;
}

.app-content:only-child {
  padding: 0;
  min-height: 100vh;
}
</style>
