<template>
  <div id="app">
    <!-- 全局语言切换按钮 - 仅在游戏未开始时显示 -->
    <div v-if="!isGameStarted" class="language-switcher">
      <button
        @click="switchLanguage"
        class="lang-btn"
        :title="locale === 'zh' ? 'Switch to English' : '切换到中文'"
      >
        {{ locale === 'zh' ? 'EN' : '中' }}
      </button>
    </div>

    <HomePage
      v-if="!isGameStarted && !showTutorial"
      @start-game="showTutorialModal"
    />

    <GameTutorial
      v-if="showTutorial"
      @close="closeTutorial"
      @start-game="startGameAfterTutorial"
    />

    <GamePage
      v-if="isGameStarted && !showTutorial"
      :duration="gameDuration"
      @back-home="backToHome"
    />
  </div>
</template>

<script>
import { ref, computed, provide, getCurrentInstance, onMounted } from '@vue/composition-api';
import { applyBatchTutorialEntry } from '@/utils/pbGameBatchEntry';
import HomePage from './views/HomePage.vue'
import GamePage from './views/GamePage.vue'
import GameTutorial from './components/GameTutorial.vue'
import i18n from './i18n'


const resolveArchiveId = (route) => {
  const fromQuery = route && route.query && route.query.archiveId;
  if (fromQuery != null && fromQuery !== '' && fromQuery !== '-1') return fromQuery;
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) {
    const id = new URLSearchParams(hash.slice(qIndex + 1)).get('archiveId');
    if (id != null && id !== '' && id !== '-1') return id;
  }
  const stored = sessionStorage.getItem('pbGameArchiveId');
  if (stored != null && stored !== '' && stored !== '-1') return stored;
  return -1;
};
export default {
  name: 'App',
  components: {
    HomePage,
    GamePage,
    GameTutorial
  },
  setup() {
     const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));
    provide('archiveId', archiveId);
    const isGameStarted = ref(false)
    const showTutorial = ref(false)
    const gameDuration = ref(1)
    const locale = computed(() => i18n.locale)

    const switchLanguage = () => {
      i18n.locale = i18n.locale === 'zh' ? 'en' : 'zh'
    }

    const showTutorialModal = (duration) => {
      gameDuration.value = duration
      showTutorial.value = true
    }

    const closeTutorial = () => {
      showTutorial.value = false
    }

    const startGameAfterTutorial = () => {
      showTutorial.value = false
      isGameStarted.value = true
    }

    const backToHome = () => {
      isGameStarted.value = false
      showTutorial.value = false
    }

    onMounted(() => {
      applyBatchTutorialEntry('csgw', {
        setDuration: (duration) => { gameDuration.value = duration },
        openTutorial: () => { showTutorial.value = true },
      })
    })

    return {
      isGameStarted,
      showTutorial,
      gameDuration,
      locale,
      switchLanguage,
      showTutorialModal,
      closeTutorial,
      startGameAfterTutorial,
      backToHome
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}

.language-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.lang-btn {
  background: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.3s;
}

.lang-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .language-switcher {
    top: 10px;
    right: 10px;
  }

  .lang-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
