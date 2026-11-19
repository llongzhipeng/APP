<template>
  <div class="app-root">
    <HomePage
      v-if="screen === 'home'"
      :t="t"
      :lang="lang"
      @start-game="onStartGame"
      @show-rules="showRulesModal = true"
      @show-history="showHistoryModal = true"
      @toggle-lang="toggleLang"
    />

    <TutorialModal
      v-if="screen === 'tutorial'"
      :t="t"
      @finish="onTutorialDone"
      @skip="onTutorialDone"
    />

    <DurationSelect
      v-if="screen === 'duration'"
      :t="t"
      @select="onDurationSelect"
      @back="screen = 'home'"
    />

    <GamePage
      v-if="screen === 'game'"
      :t="t"
      :duration="selectedDuration"
      @game-end="onGameEnd"
      @return-home="onReturnHome"
    />

    <RulesModal v-if="showRulesModal" :t="t" @close="showRulesModal = false" />
    <HistoryModal v-if="showHistoryModal" :t="t" @close="showHistoryModal = false" />
  </div>
</template>

<script>
import { ref, computed ,getCurrentInstance,provide, onMounted} from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import zh from './locales/zh'
import en from './locales/en'
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import RulesModal from './components/RulesModal.vue'
import HistoryModal from './components/HistoryModal.vue'



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
  name: 'Game11App',
  components: {
    HomePage,
    TutorialModal,
    DurationSelect,
    GamePage,
    RulesModal,
    HistoryModal
  },
  setup() {
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
    provide('archiveId', archiveId);
    const screen = ref('home')
    const lang = ref('zh')
    const selectedDuration = ref(60)
    const showRulesModal = ref(false)
    const showHistoryModal = ref(false)
    const locale = computed(() => (lang.value === 'zh' ? zh : en))

    function t(key) {
      const keys = key.split('.')
      let val = locale.value
      for (const k of keys) {
        val = val ? val[k] : undefined
        if (val === undefined) return key
      }
      return val == null ? key : val
    }

    function toggleLang() {
      lang.value = lang.value === 'zh' ? 'en' : 'zh'
    }

    function onStartGame() {
      screen.value = 'tutorial'
    }

    function onTutorialDone() {
      if (afterBatchTutorial('dtqq', (duration) => onDurationSelect(duration))) return
      screen.value = 'duration'
    }

    function onDurationSelect(duration) {
      selectedDuration.value = duration
      screen.value = 'game'
    }

    function saveHistory(result) {
      try {
        const history = JSON.parse(localStorage.getItem('ballTrackHistory') || '[]')
        history.unshift({ date: new Date().toLocaleString(), ...result })
        if (history.length > 100) history.length = 100
        localStorage.setItem('ballTrackHistory', JSON.stringify(history))
      } catch (e) {
        // ignore localStorage errors
      }
    }

    function onGameEnd(result) {
      saveHistory(result)
      screen.value = 'home'
    }

    function onReturnHome() {
      screen.value = 'home'
    }

    onMounted(() => {
      applyBatchTutorialEntry('dtqq', {
        setDuration: (duration) => { selectedDuration.value = duration },
        openTutorial: () => { screen.value = 'tutorial' },
      })
    })

    return {
      screen,
      lang,
      selectedDuration,
      showRulesModal,
      showHistoryModal,
      t,
      toggleLang,
      onStartGame,
      onTutorialDone,
      onDurationSelect,
      onGameEnd,
      onReturnHome
    }
  }
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.app-root {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
