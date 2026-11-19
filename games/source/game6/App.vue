<template>
  <!-- 全屏容器，居中显示缩放后的app -->
  <div id="app-outer">
    <div id="app">
      <HomePage
        v-if="page === 'home'"
        :t="t"
        @start="goTutorial"
        @rules="page = 'rules'"
        @history="page = 'history'"
        @toggleLang="toggleLang"
      />
      <RulesPage
        v-else-if="page === 'rules'"
        :t="t"
        @back="page = 'home'"
      />
      <HistoryPage
        v-else-if="page === 'history'"
        :t="t"
        @back="page = 'home'"
      />
      <TutorialModal
        v-else-if="page === 'tutorial'"
        :t="t"
        @done="onTutorialDone"
      />
      <DurationSelect
        v-else-if="page === 'duration'"
        :t="t"
        @selected="startGame"
      />
      <GamePage
        v-else-if="page === 'game'"
        :t="t"
        :duration="gameDuration"
        @end="onGameEnd"
        @quit="onQuit"
      />
      <ResultPage
        v-else-if="page === 'result'"
        :t="t"
        :result="gameResult"
        :duration="gameDuration"
        @playAgain="goTutorial"
        @home="page = 'home'"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed ,getCurrentInstance, onMounted} from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { translations } from './i18n'
import HomePage from './components/HomePage.vue'
import RulesPage from './components/RulesPage.vue'
import HistoryPage from './components/HistoryPage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import ResultPage from './components/ResultPage.vue'
import { leavePbGameWindow } from '@/utils/pbGameBatchLegacy'
import api from '@/api'

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
  name: 'Game6App',
  components: {
    HomePage,
    RulesPage,
    HistoryPage,
    TutorialModal,
    DurationSelect,
    GamePage,
    ResultPage
  },
  setup() {
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
    const lang = ref('zh')
    const page = ref('home')
    const gameDuration = ref(60)
    const gameResult = ref(null)
    const t = computed(() => translations[lang.value])

    function toggleLang() {
      lang.value = lang.value === 'zh' ? 'en' : 'zh'
    }

    function goTutorial() {
      page.value = 'tutorial'
    }

    function onTutorialDone() {
      if (afterBatchTutorial('szqb', startGame)) return
      page.value = 'duration'
    }

    function startGame(durationSecs) {
      gameDuration.value = durationSecs
      page.value = 'game'
    }

    function onGameEnd(result) {
      gameResult.value = result
      console.log(result.minReactionTime)
    let mintime = parseFloat(result.minReactionTime / 1000).toFixed(2);
   let maxtime = parseFloat(result.maxReactionTime / 1000).toFixed(2);
   const body = {
      trainType: 'attention',
      gameType: 'szqb',
      archiveId: archiveId.value,
      minTime: mintime,
      maxTime: maxtime,
      avgTime: parseFloat(result.avgReactionTime / 1000).toFixed(2),
      score: result.score,
      successCount: result.totalPopped,
      failCount: result.totalCorrectAppeared - result.totalPopped,
      trainDuration: gameDuration.value,
      difficultyLevel: result.maxDifficulty,
    }
  api.submitPbGameRecord(body).catch(() => {});
      const history = JSON.parse(localStorage.getItem('numberCatchHistory') || '[]')
      history.unshift({
        date: new Date().toLocaleString(),
        project: t.value.projectName,
        difficulty: result.maxDifficulty,
        duration: gameDuration.value,
        total: result.totalCorrectAppeared,
        success: result.totalPopped,
        fail: result.totalCorrectAppeared - result.totalPopped,
        rate: result.totalCorrectAppeared > 0
          ? Math.round((result.totalPopped / result.totalCorrectAppeared) * 100)
          : 0,
        avgTime: result.avgReactionTime,
        score: result.score
      })
      localStorage.setItem('numberCatchHistory', JSON.stringify(history.slice(0, 100)))
      page.value = 'result'
    }

    function onQuit() {
      leavePbGameWindow({ confirm: false })
    }

    onMounted(() => {
      applyBatchTutorialEntry('szqb', {
        setDuration: (duration) => { gameDuration.value = duration },
        openTutorial: () => { page.value = 'tutorial' },
      })
    })

    return {
      lang,
      page,
      gameDuration,
      gameResult,
      t,
      toggleLang,
      goTutorial,
      onTutorialDone,
      startGame,
      onGameEnd,
      onQuit,
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #764ba2;
}

/* 全屏外层：占满视口，背景兜底，作为绝对定位的参考容器 */
#app-outer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

/* 内层：占满全屏 */
#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}
</style>
