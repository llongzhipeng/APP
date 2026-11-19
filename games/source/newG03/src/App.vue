<template>
  <div class="app-root">
    <button v-if="showLangBtn" class="lang-btn" @click="toggleLang">
      {{ lang === 'zh' ? 'EN' : '中文' }}
    </button>
    <Home v-if="view==='home'" :lang="lang" @start="view='tutorial'" @history="onHistory" @rules="onRules" />
    <Tutorial v-else-if="view==='tutorial'" :lang="lang" @done="onTutorialDone" @skip="onTutorialDone" />
    <Duration v-else-if="view==='duration'" :lang="lang" @selected="startGame" />
    <Game v-else-if="view==='game'" :lang="lang" :duration="gameDuration" :archive-id="archiveId" :start-difficulty="batchStartDifficulty" @over="onGameOver" @exit="view='home'" />
    <Result v-else-if="view==='result'" :lang="lang" :record="lastRecord" @home="view='home'" />

    <!-- Rules modal -->
    <div v-if="showRules" class="modal-overlay" @click.self="showRules=false">
      <div class="modal-box">
        <h2>{{ t('rulesTitle') }}</h2>
        <pre class="rules-text">{{ t('rulesContent') }}</pre>
        <button class="btn-primary" @click="showRules=false">{{ t('close') }}</button>
      </div>
    </div>

    <!-- History modal -->
    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory=false">
      <div class="modal-box history-box">
        <h2>{{ t('history') }}</h2>
        <p v-if="!historyList.length" class="no-data">{{ t('noHistory') }}</p>
        <div v-else class="history-table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                <th>{{ t('trainTime') }}</th>
                <th>{{ t('diffLevel') }}</th>
                <th>{{ t('duration') }}</th>
                <th>{{ t('totalQ') }}</th>
                <th>{{ t('correctQ') }}</th>
                <th>{{ t('wrongQ') }}</th>
                <th>{{ t('accuracy') }}</th>
                <th>{{ t('avgTime') }}</th>
                <th>{{ t('totalScore') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in historyList" :key="i">
                <td>{{ r.time }}</td>
                <td>{{ r.maxLevel }}</td>
                <td>{{ r.duration }}{{ t('s') }}</td>
                <td>{{ r.total }}</td>
                <td>{{ r.correct }}</td>
                <td>{{ r.wrong }}</td>
                <td>{{ r.accuracy }}%</td>
                <td>{{ r.avgMs }}ms</td>
                <td>{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn-primary" @click="showHistory=false">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from './i18n.js'
import Home from './views/Home.vue'
import Tutorial from './views/Tutorial.vue'
import Duration from './views/Duration.vue'
import Game from './views/Game.vue'
import Result from './views/Result.vue'
import { resolveArchiveId } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'

export default {
  components: { Home, Tutorial, Duration, Game, Result },
  data() {
    return {
      view: 'home',
      lang: 'zh',
      gameDuration: 60,
      lastRecord: null,
      showRules: false,
      showHistory: false,
      historyList: JSON.parse(localStorage.getItem('duckHistory') || '[]'),
      archiveId: null, // 患者档案 ID
      batchStartDifficulty: 1, // 批次起始难度
    }
  },
  computed: {
    showLangBtn() { return this.view !== 'game' }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
  },
  mounted() {
    applyBatchTutorialEntry('syz', {
      setDuration: (dur) => { this.gameDuration = dur },
      setStartDifficulty: (lv) => { this.batchStartDifficulty = lv },
      openTutorial: () => { this.view = 'tutorial' },
    })
  },
  methods: {
    t(key) { return t(this.lang, key) },
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    startGame(sec, startDiff) {
      this.gameDuration = sec
      if (startDiff != null) this.batchStartDifficulty = startDiff
      this.view = 'game'
    },
    onTutorialDone() {
      if (afterBatchTutorial('syz', (dur, startDiff) => this.startGame(dur, startDiff))) return
      this.view = 'duration'
    },
    onGameOver(record) {
      this.lastRecord = record
      this.historyList.unshift(record)
      localStorage.setItem('duckHistory', JSON.stringify(this.historyList.slice(0, 50)))
      this.view = 'result'
    },
    onHistory() { this.showHistory = true },
    onRules() { this.showRules = true }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app, .app-root { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Microsoft YaHei', sans-serif; }

.lang-btn {
  position: fixed; top: 2vh; right: 2vw; z-index: 999;
  padding: 1vmin 2.4vmin; background: rgba(255,255,255,0.9);
  border: 2px solid #4a9eff; border-radius: 2vmin;
  cursor: pointer; font-size: 2.2vmin; color: #2270c4; font-weight: 700;
  transition: background 0.2s;
}
.lang-btn:hover { background: #4a9eff; color: #fff; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-box {
  background: #fff; border-radius: 2vmin; padding: 4vmin 5vmin;
  max-width: 90vw; max-height: 85vh; overflow-y: auto;
  display: flex; flex-direction: column; gap: 3vmin; align-items: center;
  box-shadow: 0 1vmin 4vmin rgba(0,0,0,0.25);
}
.modal-box h2 { font-size: 3.2vmin; color: #1a5ca8; }
.rules-text { white-space: pre-wrap; font-size: 2.3vmin; color: #333; line-height: 1.8; }
.no-data { color: #888; font-size: 2.2vmin; }
.history-box { max-width: 95vw; }
.history-table-wrap { overflow-x: auto; width: 100%; }
.history-table { border-collapse: collapse; font-size: 1.9vmin; white-space: nowrap; }
.history-table th, .history-table td { border: 1px solid #ddd; padding: 1vmin 1.4vmin; text-align: center; }
.history-table th { background: #e8f0ff; color: #1a5ca8; }
.btn-primary {
  padding: 1.5vmin 5vmin; background: #4a9eff; color: #fff;
  border: none; border-radius: 3vmin; cursor: pointer;
  font-size: 2.4vmin; font-weight: 700; transition: background 0.2s;
}
.btn-primary:hover { background: #2270c4; }

body { background: #0f2744; color: #e8f4fd; }

/* ---------- Portrait (mobile / WeChat web-view) ---------- */
@media (orientation: portrait) {
  .lang-btn {
    top: calc(2vh + env(safe-area-inset-top));
    padding: 2vmin 4vmin;
    font-size: max(3.4vmin, 14px);
    border-radius: 4vmin;
  }

  .modal-box {
    width: 92vw;
    max-width: 92vw;
    padding: 6vmin 5vmin;
    padding-bottom: calc(6vmin + env(safe-area-inset-bottom));
    border-radius: 4vmin;
    gap: 4vmin;
  }
  .modal-box h2 { font-size: max(5vmin, 20px); }
  .rules-text { font-size: max(3.6vmin, 14px); line-height: 1.7; }
  .no-data { font-size: max(3.4vmin, 14px); }
  .btn-primary {
    padding: 2.4vmin 8vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 5vmin;
    width: 80%;
  }

  /* History table -> card list */
  .history-box { width: 94vw; max-width: 94vw; }
  .history-table-wrap { overflow: visible; }
  .history-table { display: block; width: 100%; white-space: normal; }
  .history-table thead { display: none; }
  .history-table tbody { display: block; width: 100%; }
  .history-table tr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1vmin 2vmin;
    background: #f0f7ff;
    border-radius: 2vmin;
    padding: 3vmin;
    margin-bottom: 2.4vmin;
  }
  .history-table td {
    display: block;
    border: none;
    padding: 0.6vmin 0;
    font-size: max(3vmin, 12px);
    color: #1a3a7a;
    text-align: left;
  }
}
</style>
