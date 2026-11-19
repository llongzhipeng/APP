<template>
  <div id="app">
    <!-- 全局语言切换按钮 - 仅在首页显示 -->
    <div v-if="screen === 'home'" class="language-switcher">
      <button
        @click="switchLanguage"
        class="lang-btn"
        :title="locale === 'zh' ? 'Switch to English' : '切换到中文'"
      >
        {{ locale === 'zh' ? 'EN' : '中' }}
      </button>
    </div>

    <HomePage
      v-if="screen === 'home'"
      @start-game="goToTutorial"
    />

    <GameTutorial
      v-if="screen === 'tutorial'"
      @close="goToDuration"
      @start-game="goToDuration"
    />

    <DurationSelect
      v-if="screen === 'duration'"
      @back="goToTutorial"
      @start-game="startGameWithDuration"
    />

    <GamePage
      v-if="screen === 'game'"
      :duration="gameDuration"
      :archive-id="archiveId"
      @back-home="backToHome"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from '@vue/composition-api'
import HomePage from './views/HomePage.vue'
import GamePage from './views/GamePage.vue'
import GameTutorial from './components/GameTutorial.vue'
import DurationSelect from './views/DurationSelect.vue'
import i18n from './i18n'
import { resolveArchiveId } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'gwqd'

export default {
  name: 'App',
  components: {
    HomePage,
    GamePage,
    GameTutorial,
    DurationSelect
  },
  setup() {
    const screen = ref('home') // 'home' | 'tutorial' | 'duration' | 'game'
    const gameDuration = ref(1)
    const locale = computed(() => i18n.locale)
    const archiveId = ref(-1)

    let vhHandler = null

    onMounted(() => {
      const instance = getCurrentInstance()
      if (instance && instance.proxy) {
        archiveId.value = resolveArchiveId(instance.proxy.$route)
      }
      applyBatchTutorialEntry(GAME_TYPE, {
        setDuration: (min) => { gameDuration.value = min },
        openTutorial: () => { screen.value = 'tutorial' },
      })
      vhHandler = () => {
        document.documentElement.style.setProperty(
          '--real-vh',
          `${window.innerHeight * 0.01}px`
        )
      }
      vhHandler()
      window.addEventListener('resize', vhHandler)
      window.addEventListener('orientationchange', vhHandler)
    })

    onUnmounted(() => {
      if (vhHandler) {
        window.removeEventListener('resize', vhHandler)
        window.removeEventListener('orientationchange', vhHandler)
      }
    })

    const switchLanguage = () => {
      i18n.locale = i18n.locale === 'zh' ? 'en' : 'zh'
    }

    const goToTutorial = () => {
      screen.value = 'tutorial'
    }

    const goToDuration = () => {
      if (afterBatchTutorial(GAME_TYPE, (min) => startGameWithDuration(min))) return
      screen.value = 'duration'
    }

    const startGameWithDuration = (duration) => {
      gameDuration.value = duration
      screen.value = 'game'
    }

    const backToHome = () => {
      screen.value = 'home'
    }

    return {
      screen,
      gameDuration,
      locale,
      archiveId,
      switchLanguage,
      goToTutorial,
      goToDuration,
      startGameWithDuration,
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

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  width: 100vw;
  height: 100vh;
  height: calc(var(--real-vh, 1vh) * 100);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}

.language-switcher {
  position: fixed;
  top: 2vmin;
  right: 2vmin;
  z-index: 9999;
}

.lang-btn {
  background: white;
  border: none;
  border-radius: 1vmin;
  padding: 1.4vmin 2.8vmin;
  font-size: 2.4vmin;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0.2vmin 0.8vmin rgba(0,0,0,0.2);
  transition: all 0.3s;
}

.lang-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0.4vmin 1.2vmin rgba(0,0,0,0.3);
}

body { background: #0f2744; color: #e8f4fd; }

/* 手机竖屏（微信 web-view）适配 */
@media (orientation: portrait) {
  .language-switcher {
    top: calc(2vmin + env(safe-area-inset-top));
    right: 3vmin;
  }
  .lang-btn {
    padding: 2vmin 3.6vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 2vmin;
  }
}
</style>
