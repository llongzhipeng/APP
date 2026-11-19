<template>
  <div id="app">
    <HomePage
      v-if="screen === 'home'"
      :lang="lang"
      @start="screen = 'tutorial'"
      @rules="showRules = true"
      @history="showHistory = true"
      @toggle-lang="toggleLang"
    />
    <TutorialModal
      v-else-if="screen === 'tutorial'"
      :lang="lang"
      @done="onTutorialDone"
      @skip="onTutorialDone"
    />
    <DurationSelect
      v-else-if="screen === 'duration'"
      :lang="lang"
      @selected="onDurationSelected"
      @back="screen = 'home'"
    />
    <GamePage
      v-else-if="screen === 'game'"
      :lang="lang"
      :duration="gameDuration"
      @end="onGameEnd"
      @back="screen = 'home'"
    />

    <ResultModal v-if="showResult" :lang="lang" :result="gameResult" @close="showResult = false" />
    <RulesModal v-if="showRules" :lang="lang" @close="showRules = false" />
    <HistoryModal v-if="showHistory" :lang="lang" :history="history" @close="showHistory = false" />
  </div>
</template>

<script>
import HomePage from './src/components/HomePage.vue'
import TutorialModal from './src/components/TutorialModal.vue'
import DurationSelect from './src/components/DurationSelect.vue'
import GamePage from './src/components/GamePage.vue'
import ResultModal from './src/components/ResultModal.vue'
import RulesModal from './src/components/RulesModal.vue'
import HistoryModal from './src/components/HistoryModal.vue'
import { applyBatchTutorialEntry, afterBatchTutorial } from '@/utils/pbGameBatchEntry'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'

const GAME_TYPE = 'jmtz' // 积木挑战

export default {
  name: 'Game24App',
  components: { HomePage, TutorialModal, DurationSelect, GamePage, ResultModal, RulesModal, HistoryModal },
  data() {
    return {
      screen: 'home', // 当前界面
      lang: 'zh', // 语言
      gameDuration: 60, // 训练时长（秒）
      showRules: false, // 规则弹窗
      showHistory: false, // 历史弹窗
      showResult: false, // 结算弹窗
      gameResult: null, // 本局结果
      history: JSON.parse(localStorage.getItem('blockChallengeHistory') || '[]'), // 本地历史
      archiveId: -1, // 患者档案 ID
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.gameDuration = dur },
      openTutorial: () => { this.screen = 'tutorial' },
    })
  },
  methods: {
    /**
     * <summary>
     * 切换中英文
     * </summary>
     */
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    /**
     * <summary>
     * 时长选定后进入游戏
     * </summary>
     */
    onDurationSelected(dur) { this.gameDuration = dur; this.screen = 'game' },
    /**
     * <summary>
     * 教程结束：批次模式直接开局，否则进时长选择
     * </summary>
     */
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.onDurationSelected(dur))) return
      this.screen = 'duration'
    },
    /**
     * <summary>
     * 本局结束：上传记录并展示结算
     * </summary>
     */
    onGameEnd(result) {
      this.gameResult = result
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        minTime: 0,
        maxTime: 0,
        avgTime: toPbGameSeconds(result.avgReaction),
        score: result.score || 0,
        successCount: result.correctRounds || 0,
        failCount: result.wrongRounds || 0,
        trainDuration: result.duration != null ? result.duration : this.gameDuration,
        difficultyLevel: result.finalLevel || 1,
      })
      const record = {
        trainTime: new Date().toLocaleString(),
        project: '积木挑战',
        level: result.finalLevel,
        duration: result.durationLabel,
        total: result.totalRounds,
        success: result.correctRounds,
        fail: result.wrongRounds,
        rate: result.totalRounds > 0 ? Math.round(result.correctRounds / result.totalRounds * 100) + '%' : '0%',
        avgReaction: result.avgReaction,
        score: result.score,
      }
      this.history.unshift(record)
      localStorage.setItem('blockChallengeHistory', JSON.stringify(this.history.slice(0, 100)))
      this.showResult = true
      this.screen = 'home'
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
#app {
  width: 100vw;
  height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #0a1428;
  color: #e8f0ff;
}
</style>
