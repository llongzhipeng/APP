<template>
  <div id="app" :class="['app-root', `lang-${lang}`]">
    <HomePage
      v-if="view === 'home'"
      :lang="lang"
      @start="view = 'tutorial'"
      @rules="view = 'rules'"
      @history="view = 'history'"
      @toggle-lang="toggleLang"
    />

    <TutorialModal
      v-if="view === 'tutorial'"
      :lang="lang"
      @done="onTutorialDone"
      @skip="onTutorialDone"
    />

    <DurationSelect
      v-if="view === 'duration'"
      :lang="lang"
      @select="startGame"
      @back="view = 'home'"
    />

    <GamePage
      v-if="view === 'game'"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @back="view = 'home'"
    />

    <HistoryPage
      v-if="view === 'history'"
      :lang="lang"
      @back="view = 'home'"
    />

    <RulesPage
      v-if="view === 'rules'"
      :lang="lang"
      @back="view = 'home'"
    />
  </div>
</template>

<script>
import { bindTrainingLanguage } from '@/language.js'
import { ref,getCurrentInstance,provide, onMounted } from '@vue/composition-api'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import HomePage      from './components/HomePage.vue'
import TutorialModal from './components/TutorialModal.vue'
import DurationSelect from './components/DurationSelect.vue'
import GamePage       from './components/GamePage.vue'
import HistoryPage    from './components/HistoryPage.vue'
import RulesPage      from './components/RulesPage.vue'



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
  name: 'Game10App',
  components: {
    HomePage,
    TutorialModal,
    DurationSelect,
    GamePage,
    HistoryPage,
    RulesPage
  },
  setup() {
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
   provide('archiveId', archiveId);
    const view = ref('home');
    const lang = ref('zh');
    bindTrainingLanguage(() => lang.value, value => { lang.value = value })
    const gameDuration = ref(60);

    function toggleLang() {
      lang.value = lang.value === 'zh' ? 'en' : 'zh';
    }

    function onTutorialDone() {
      if (afterBatchTutorial('mzxh', (seconds) => startGame(seconds))) return
      view.value = 'duration'
    }

    function startGame(seconds) {
      gameDuration.value = seconds;
      view.value = 'game';
    }

    function onGameEnd() {
      view.value = 'home';
    }

    onMounted(() => {
      applyBatchTutorialEntry('mzxh', {
        setDuration: (seconds) => { gameDuration.value = seconds },
        openTutorial: () => { view.value = 'tutorial' },
      })
    })

    return {
      view,
      lang,
      gameDuration,
      toggleLang,
      onTutorialDone,
      startGame,
      onGameEnd
    };
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", Roboto, sans-serif;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

#app {
  width: 100%;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ── shared card ─────────────────────────────────── */
.card {
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* ── responsive base button ──────────────────────── */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: normal;
  transition: all 0.2s ease;
  user-select: none;
}

.btn:hover {
  transform: scale(1.02);
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: #4A90E2;
  color: white;
}

.btn-primary:hover {
  background-color: #357abd;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9e9e9;
}

.btn-success {
  background-color: #4CAF50;
  color: white;
}

.btn-success:hover {
  background-color: #45a049;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #da190b;
}

/* ── overlay modal backdrop ──────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* ── responsive ──────────────────────── */
@media (max-width: 768px) {
  .btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
