<template>
  <div id="app" :style="bgStyle">
    <!-- 顶部语言按钮：游戏中禁用并隐藏 -->
    <button
      v-if="view !== 'game'"
      class="lang-btn"
      @click="toggleLang"
    >{{ t('langBtn') }}</button>

    <Home
      v-if="view === 'home'"
      @start="onStart"
      @rules="view = 'rules'"
      @history="view = 'history'"
    />
    <Rules
      v-else-if="view === 'rules'"
      @back="view = 'home'"
    />
    <History
      v-else-if="view === 'history'"
      @back="view = 'home'"
    />
    <Tutorial
      v-else-if="view === 'tutorial'"
      @finish="onTutorialDone"
      @skip="onTutorialDone"
    />
    <Duration
      v-else-if="view === 'duration'"
      @select="onSelectDuration"
      @back="view = 'home'"
    />
    <Game
      v-else-if="view === 'game'"
      :duration-min="durationMin"
      :archive-id="archiveId"
      @finish="onGameFinish"
      @exit="view = 'home'"
    />
    <Result
      v-else-if="view === 'result'"
      :summary="lastSummary"
      @again="view = 'tutorial'"
      @home="view = 'home'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from '@vue/composition-api'
import Home from './views/Home.vue'
import Rules from './views/Rules.vue'
import History from './views/History.vue'
import Tutorial from './views/Tutorial.vue'
import Duration from './views/Duration.vue'
import Game from './views/Game.vue'
import Result from './views/Result.vue'
import { useI18n } from './i18n.js'
import { resolveArchiveId } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveImage } from './assets'

const GAME_TYPE = 'xxlx'

const { t, toggleLang } = useI18n()
const inst = getCurrentInstance()
const archiveId = ref(resolveArchiveId(inst.proxy.$route))

const view = ref('home')
const durationMin = ref(1)
const lastSummary = ref(null)

onMounted(() => {
  applyBatchTutorialEntry(GAME_TYPE, {
    setDuration: (min) => { durationMin.value = min },
    openTutorial: () => { view.value = 'tutorial' },
  })
})

const bgStyle = computed(() => ({
  backgroundImage: 'url(' + resolveImage('/images/bac.png') + ')',
}))

function onStart() {
  view.value = 'tutorial'
}
function onTutorialDone() {
  if (afterBatchTutorial(GAME_TYPE, (min) => {
    durationMin.value = min
    view.value = 'game'
  })) return
  view.value = 'duration'
}
function onSelectDuration(m) {
  durationMin.value = m
  view.value = 'game'
}
function onGameFinish(summary) {
  lastSummary.value = summary
  view.value = 'result'
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  color: #fff;
  user-select: none;
}
body { background: #0f2744; color: #e8f4fd; }
#app {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #0a0e2c;
}
.lang-btn {
  position: absolute;
  top: 2.2vmin;
  right: 2.2vmin;
  z-index: 100;
  padding: 1vmin 2.2vmin;
  font-size: 2.4vmin;
  font-weight: bold;
  border: 0.3vmin solid #ffe066;
  border-radius: 1vmin;
  background: rgba(0, 0, 0, 0.35);
  color: #ffe066;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-btn:hover {
  background: #ffe066;
  color: #1a1a3d;
}
button { font-family: inherit; }

/* 通用按钮 */
.g-btn {
  padding: 1.6vmin 4vmin;
  font-size: 2.6vmin;
  font-weight: bold;
  color: #1a1a3d;
  background: linear-gradient(180deg, #ffe98a 0%, #ffb84d 100%);
  border: 0.3vmin solid #fff2a8;
  border-radius: 1.2vmin;
  cursor: pointer;
  box-shadow: 0 0.6vmin 1.6vmin rgba(255, 200, 60, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
}
.g-btn:hover:not(:disabled) {
  transform: translateY(-0.4vmin);
  box-shadow: 0 1vmin 2.4vmin rgba(255, 200, 60, 0.55);
}
.g-btn:active:not(:disabled) { transform: translateY(0); }
.g-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.g-btn.secondary {
  background: linear-gradient(180deg, #7bb0ff 0%, #4a7ed6 100%);
  color: #fff;
  border-color: #a8d0ff;
  box-shadow: 0 0.6vmin 1.6vmin rgba(80, 140, 240, 0.35);
}
.g-btn.ghost {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}

/* 竖屏适配（微信小程序 web-view / 手机） */
@media (orientation: portrait) {
  .lang-btn {
    top: calc(2.2vmin + env(safe-area-inset-top));
    right: 3vmin;
    padding: max(1.6vmin, 8px) max(3vmin, 14px);
    font-size: max(2.6vmin, 14px);
    border-radius: max(1.4vmin, 8px);
  }
  .g-btn {
    padding: max(2.4vmin, 12px) max(5vmin, 20px);
    font-size: max(3.2vmin, 16px);
    border-radius: max(1.8vmin, 10px);
  }
}
</style>
