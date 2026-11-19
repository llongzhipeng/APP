<template>
  <div id="app">
    <!-- Home Screen -->
    <HomeScreen
      v-if="screen === 'home'"
      :t="t"
      :show-lang-btn="true"
      @start="onStart"
      @show-rules="showRules = true"
      @show-history="showHistory = true"
      @toggle-lang="toggleLang"
    />

    <!-- Duration Selection -->
    <DurationScreen
      v-else-if="screen === 'duration'"
      :t="t"
      @select="onSelectDuration"
    />

    <!-- Game Screen -->
    <GameScreen
      v-else-if="screen === 'game'"
      :key="gameKey"
      :t="t"
      :duration="selectedDuration"
      @game-over="onGameOver"
      @exit-game="goHome"
    />

    <!-- Game Over Screen -->
    <GameOverScreen
      v-else-if="screen === 'gameover'"
      :t="t"
      :result="gameResult"
      @play-again="onPlayAgain"
      @home="goHome"
    />

    <!-- Modals -->
    <RulesModal v-if="showRules" :t="t" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :t="t" @close="showHistory = false" />
    <TutorialModal v-if="showTutorial" :t="t" @done="onTutorialDone" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted,getCurrentInstance } from '@vue/composition-api'
import { translations } from './i18n.js'
import { saveHistory } from './gameConfig.js'
import HomeScreen from './components/HomeScreen.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationScreen from './components/DurationScreen.vue'
import GameScreen from './components/GameScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'

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
    HomeScreen, RulesModal, HistoryModal,
    TutorialModal, DurationScreen, GameScreen, GameOverScreen
  },
  setup() {
    let prevRootFontSize = ''
    let prevRootFontSizePriority = ''
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
    onMounted(() => {
      const rootStyle = document.documentElement.style
      prevRootFontSize = rootStyle.getPropertyValue('font-size')
      prevRootFontSizePriority = rootStyle.getPropertyPriority('font-size')
      rootStyle.setProperty('font-size', '16px', 'important')

      applyBatchTutorialEntry('szfb', {
        setDuration: (duration) => { selectedDuration.value = duration },
        openTutorial: () => { showTutorial.value = true },
      })
    })

    onUnmounted(() => {
      const rootStyle = document.documentElement.style
      if (prevRootFontSize) {
        rootStyle.setProperty('font-size', prevRootFontSize, prevRootFontSizePriority || '')
      } else {
        rootStyle.removeProperty('font-size')
      }
    })

    const lang = ref('zh')
    const t = computed(() => translations[lang.value])

    const screen = ref('home') // home | duration | game | gameover
    const showRules = ref(false)
    const showHistory = ref(false)
    const showTutorial = ref(false)

    const selectedDuration = ref(60)
    const gameKey = ref(0)
    const gameResult = ref(null)

    function toggleLang() {
      lang.value = lang.value === 'zh' ? 'en' : 'zh'
    }

    function onStart() {
      showTutorial.value = true
    }

    function onTutorialDone() {
      showTutorial.value = false
      if (afterBatchTutorial('szfb', (duration) => onSelectDuration(duration))) return
      screen.value = 'duration'
    }

    function onSelectDuration(seconds) {
      selectedDuration.value = seconds
      screen.value = 'game'
      gameKey.value++
    }

    function onGameOver(result) {
      gameResult.value = result
     const body = {
         archiveId: archiveId.value,
          trainType: 'memory',
          gameType: 'szfb',
          minTime: result.minReactionTime,
          maxTime: result.maxReactionTime,
          avgTime: result.avgReactionTime,
          score: result.finalScore,
          successCount: result.totalCorrect,
          failCount: result.totalQuestions - result.totalCorrect,
          trainDuration: result.duration,
          difficultyLevel: result.maxDifficulty,
        }
        api.submitPbGameRecord(body).catch(() => {});
      screen.value = 'gameover'

      const failCount = result.totalQuestions - result.totalCorrect
      const successRate = result.totalQuestions > 0
        ? Math.round((result.totalCorrect / result.totalQuestions) * 100) + '%'
        : '0%'

      saveHistory({
        date: new Date().toLocaleString(lang.value === 'zh' ? 'zh-CN' : 'en-US'),
        project: lang.value === 'zh' ? '数字风暴' : 'Digital Storm',
        maxDifficulty: result.maxDifficulty,
        duration: result.duration,
        totalQuestions: result.totalQuestions,
        totalCorrect: result.totalCorrect,
        failCount,
        successRate,
        avgReactionTime: result.avgReactionTime,
        finalScore: result.finalScore
      })
    }

    function onPlayAgain() {
      screen.value = 'duration'
    }

    function goHome() {
      screen.value = 'home'
    }

    return {
      t, screen,
      showRules, showHistory, showTutorial,
      selectedDuration, gameKey, gameResult,
      toggleLang, onStart, onTutorialDone,
      onSelectDuration, onGameOver, onPlayAgain, goHome
    }
  }
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #0a0e27;
  color: #fff;
  user-select: none;
  -webkit-user-select: none;
}

#app {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

/* All screens fill the viewport */
#app > * {
  position: absolute;
  inset: 0;
}
</style>
