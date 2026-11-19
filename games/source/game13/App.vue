<template>
  <div id="app-root">
    <!-- Language toggle: shown only outside game -->
    <button
      v-if="page !== 'game'"
      class="lang-btn"
      @click="toggleLang"
    >{{ t.langToggle }}</button>

    <HomePage
      v-if="page === 'home'"
      :t="t"
      @start="page = 'tutorial'"
      @history="page = 'history'"
    />
    <TutorialModal
      v-if="page === 'tutorial'"
      :t="t"
      @skip="onTutorialDone"
      @done="onTutorialDone"
    />
    <DurationSelect
      v-if="page === 'duration'"
      :t="t"
      @confirm="startGame"
    />
    <GamePage
      v-if="page === 'game'"
      :t="t"
      :duration="gameDuration"
      @exit="page = 'home'"
      @done="onGameDone"
    />
    <HistoryPage
      v-if="page === 'history'"
      :t="t"
      @back="page = 'home'"
    />
  </div>
</template>

<script>

import { ref, computed,getCurrentInstance,provide, onMounted } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { messages } from './data/i18n.js'
import HomePage from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage from './components/GamePage.vue'
import HistoryPage from './components/HistoryPage.vue'

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
  components: { HomePage, TutorialModal, DurationSelect, GamePage, HistoryPage },
  setup() {
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
    provide('archiveId', archiveId);
    const lang = ref('zh')
    const page = ref('home')
    const gameDuration = ref(60)

    const t = computed(() => messages[lang.value])

    function toggleLang() {
      lang.value = lang.value === 'zh' ? 'en' : 'zh'
    }

    function startGame(duration) {
      gameDuration.value = duration
      page.value = 'game'
    }

    function onTutorialDone() {
      if (afterBatchTutorial('qbqz', startGame)) return
      page.value = 'duration'
    }

    function onGameDone() {
      page.value = 'home'
    }

    onMounted(() => {
      applyBatchTutorialEntry('qbqz', {
        setDuration: (duration) => { gameDuration.value = duration },
        openTutorial: () => { page.value = 'tutorial' },
      })
    })

    return { lang, page, gameDuration, t, toggleLang, startGame, onTutorialDone, onGameDone }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", Roboto, sans-serif;
}

html, body, #app, #app-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  min-height: 100vh;
}

#app-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  font-family: inherit;
}

.lang-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.lang-btn:hover {
  background-color: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.title {
  font-size: 32px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f0f0f0;
}
</style>
