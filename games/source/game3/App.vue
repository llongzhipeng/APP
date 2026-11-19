<template>
  <div id="app">
    <!-- 语言切换按钮 -->
    <LanguageSwitch
      :language="language"
      :hideInGame="gameState === 'playing'"
      @toggle="toggleLanguage"
    />

    <!-- 教程弹窗 -->
    <TutorialModal
      v-if="showTutorial"
      :t="t"
      :language="language"
      @start="startFromTutorial"
      @skip="skipTutorial"
    />

    <!-- 菜单界面 -->
    <MenuScreen
      v-if="gameState === 'menu'"
      :t="t"
      @start-game="handleStartGame"
      @show-rules="gameState = 'rules'"
      @show-history="gameState = 'history'"
    />

    <!-- 时长选择界面 -->
    <TimeSelect
      v-if="gameState === 'timeSelect'"
      :t="t"
      @select="startGame"
      @back="gameState = 'menu'"
    />

    <!-- 规则说明界面 -->
    <RulesScreen
      v-if="gameState === 'rules'"
      :t="t"
      @back="gameState = 'menu'"
    />

    <!-- 历史记录界面 -->
    <HistoryScreen
      v-if="gameState === 'history'"
      :t="t"
      :trainingHistory="trainingHistory"
      @back="gameState = 'menu'"
    />

    <!-- 游戏界面 -->
    <GameScreen
      v-if="gameState === 'playing'"
      :t="t"
      :currentDifficulty="currentDifficulty"
      :currentScore="currentScore"
      :remainingTime="remainingTime"
      :currentQuestion="currentQuestion"
      :options="options"
      :showFeedback="showFeedback"
      :selectedAnswerIndex="selectedAnswerIndex"
      :correctAnswerIndex="correctAnswerIndex"
      :canGoPrev="questionHistory.length > 1 && currentHistoryIndex > 0"
      :canGoNext="currentHistoryIndex < questionHistory.length - 1"
      @select-option="selectOption"
      @prev-question="prevQuestion"
      @next-question="nextQuestion"
      @end-game="endGame"
    />

    <!-- 结果界面 -->
    <ResultScreen
      v-if="gameState === 'result'"
      :t="t"
      :currentScore="currentScore"
      :totalQuestions="totalQuestions"
      :correctAnswers="correctAnswers"
      :avgReactionTime="avgReactionTime"
      @back="gameState = 'menu'"
    />
  </div>
</template>

<script>
import { itemsConfig } from './config/items.js';
import { difficultyConfig } from './config/difficulty.js';
import { translate } from './locales/index.js';
import { storageService } from './services/storage.js';
import { generateOptions, calculateAverage } from './utils/gameHelpers.js';

import LanguageSwitch from './components/LanguageSwitch.vue';
import MenuScreen from './components/MenuScreen.vue';
import TutorialModal from './components/TutorialModal.vue';
import TimeSelect from './components/TimeSelect.vue';
import RulesScreen from './components/RulesScreen.vue';
import HistoryScreen from './components/HistoryScreen.vue';
import GameScreen from './components/GameScreen.vue';
import ResultScreen from './components/ResultScreen.vue';
import api from '@/api';
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry';

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
    LanguageSwitch,
    MenuScreen,
    TutorialModal,
    TimeSelect,
    RulesScreen,
    HistoryScreen,
    GameScreen,
    ResultScreen
  },

  data() {
    return {
      archiveId: -1,
      language: 'zh',
      gameState: 'menu', // menu, timeSelect, rules, history, playing, result
      showTutorial: false,

      // 游戏状态
      currentDifficulty: 1,
      currentScore: 0,
      remainingTime: 0,
      totalGameTime: 0,
      currentQuestion: '',
      options: [],
      correctAnswerIndex: -1,
      gameTimer: null,
      questionHistory: [],
      currentHistoryIndex: -1,

      // 答题反馈状态
      showFeedback: false,
      selectedAnswerIndex: -1,

      // 统计数据
      totalQuestions: 0,
      correctAnswers: 0,
      reactionTimes: [],
      questionStartTime: 0,

      // 难度调整相关 - 分段统计
      currentSegmentAnswers: [], // 当前时间段(30秒)的答题记录
      lastDifficultyCheckTime: 0, // 上次检查难度的时间
      difficultyCheckInterval: 30, // 难度检查间隔(秒)

      // 训练记录
      trainingHistory: []
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
  },
  computed: {
    avgReactionTime() {
      return calculateAverage(this.reactionTimes);
    }
  },
  mounted() {
    // 加载语言设置
    this.language = storageService.getLanguage();

    // 加载历史记录
    this.trainingHistory = storageService.getTrainingHistory();

    applyBatchTutorialEntry('xwsd', {
      setDuration: (duration) => { this._batchDuration = duration },
      openTutorial: () => { this.showTutorial = true },
    })
  },
  methods: {
    t(key) {
      return translate(this.language, key);
    },

    toggleLanguage() {
      this.language = this.language === 'zh' ? 'en' : 'zh';
      storageService.saveLanguage(this.language);
    },

    handleStartGame() {
      // 每次都显示教程
      this.showTutorial = true;
    },

    startFromTutorial() {
      this.showTutorial = false;
      if (afterBatchTutorial('xwsd', (duration) => this.startGame(duration))) return
      this.gameState = 'timeSelect';
    },

    skipTutorial() {
      this.showTutorial = false;
      if (afterBatchTutorial('xwsd', (duration) => this.startGame(duration))) return
      this.gameState = 'timeSelect';
    },

    startGame(duration) {
      this.gameState = 'playing';
      this.currentDifficulty = getBatchStartDifficultyForGame('xwsd');
      this.currentScore = 0;
      this.remainingTime = duration;
      this.totalGameTime = duration;
      this.totalQuestions = 0;
      this.correctAnswers = 0;
      this.reactionTimes = [];

      this.currentSegmentAnswers = [];
      this.lastDifficultyCheckTime = 0;
      this.questionHistory = [];
      this.currentHistoryIndex = -1;
      this.showFeedback = false;
      this.selectedAnswerIndex = -1;

      // 开始游戏计时器
      this.gameTimer = setInterval(() => {
        this.remainingTime -= 0.1;

        // 检查是否到达30秒检查点
        const elapsedTime = this.totalGameTime - this.remainingTime;
        const currentSegment = Math.floor(elapsedTime / this.difficultyCheckInterval);
        const lastSegment = Math.floor(this.lastDifficultyCheckTime / this.difficultyCheckInterval);

        if (currentSegment > lastSegment) {
          // 进入新的30秒时间段,检查并调整难度
          this.checkAndAdjustDifficulty();
          this.lastDifficultyCheckTime = elapsedTime;
        }

        if (this.remainingTime <= 0) {
          this.endGame();
        }
      }, 100);

      this.generateQuestion();
    },

    generateQuestion() {
      const targetItem = itemsConfig[Math.floor(Math.random() * itemsConfig.length)];
      const difficulty = difficultyConfig[this.currentDifficulty - 1];
      this.questionStartTime = Date.now();
      const itemName = this.language === 'zh' ? targetItem.zh : targetItem.en;
      const question = this.t('findItem') + (this.language === 'zh' ? '' : ' ') + itemName;
      const options = generateOptions(targetItem, difficulty, itemsConfig);
      const correctAnswerIndex = options.findIndex(opt => opt.isCorrect);

      const entry = { question, options, correctAnswerIndex, answered: false, selectedAnswerIndex: -1, scored: false };
      this.questionHistory.push(entry);
      this.currentHistoryIndex = this.questionHistory.length - 1;
      this.loadQuestion(this.currentHistoryIndex);
    },

    loadQuestion(index) {
      const entry = this.questionHistory[index];
      this.currentQuestion = entry.question;
      this.options = entry.options;
      this.correctAnswerIndex = entry.correctAnswerIndex;
      this.showFeedback = entry.answered;
      this.selectedAnswerIndex = entry.selectedAnswerIndex;
      this.questionStartTime = Date.now();
    },

    selectOption(index) {
      if (this.showFeedback) return;

      const entry = this.questionHistory[this.currentHistoryIndex];
      if (entry.answered) return;

      const reactionTime = (Date.now() - this.questionStartTime) / 1000;
      this.reactionTimes.push(reactionTime);

      this.totalQuestions++;
      const isCorrect = index === this.correctAnswerIndex;

      if (isCorrect) {
        this.correctAnswers++;
        const difficulty = difficultyConfig[this.currentDifficulty - 1];
        this.currentScore += Math.round(5 * difficulty.coefficient);
      }

      this.currentSegmentAnswers.push({ correct: isCorrect });

      entry.answered = true;
      entry.selectedAnswerIndex = index;
      entry.scored = true;

      this.showFeedback = true;
      this.selectedAnswerIndex = index;

      setTimeout(() => {
        this.generateQuestion();
      }, 600);
    },

    prevQuestion() {
      if (this.currentHistoryIndex > 0) {
        this.currentHistoryIndex--;
        this.loadQuestion(this.currentHistoryIndex);
      }
    },

    nextQuestion() {
      if (this.currentHistoryIndex < this.questionHistory.length - 1) {
        this.currentHistoryIndex++;
        this.loadQuestion(this.currentHistoryIndex);
      }
    },

    checkAndAdjustDifficulty() {
      // 如果当前时间段没有答题记录,不调整
      if (this.currentSegmentAnswers.length === 0) return;

      // 计算当前时间段的正确率
      const correctCount = this.currentSegmentAnswers.filter(answer => answer.correct).length;
      const accuracy = correctCount / this.currentSegmentAnswers.length;

      // 根据正确率调整难度
      if (accuracy >= 0.9 && this.currentDifficulty < 6) {
        this.currentDifficulty++;
        console.log(`难度提升至 ${this.currentDifficulty} (正确率: ${(accuracy * 100).toFixed(1)}%)`);
      } else if (accuracy < 0.7 && this.currentDifficulty > 1) {
        this.currentDifficulty--;
        console.log(`难度降低至 ${this.currentDifficulty} (正确率: ${(accuracy * 100).toFixed(1)}%)`);
      } else {
        console.log(`难度保持 ${this.currentDifficulty} (正确率: ${(accuracy * 100).toFixed(1)}%)`);
      }

      // 清空当前时间段的答题记录,开始新的时间段
      this.currentSegmentAnswers = [];
    },

    endGame() {
      clearInterval(this.gameTimer);

      // 保存训练记录
      const record = {
        time: new Date().toLocaleString(),
        difficultyLevel: this.currentDifficulty,
        duration: this.totalGameTime,
        totalCount: this.totalQuestions,
        successCount: this.correctAnswers,
        failCount: this.totalQuestions - this.correctAnswers,
        successRate: this.totalQuestions > 0
          ? ((this.correctAnswers / this.totalQuestions * 100).toFixed(1))
          : 0,
        avgReactionTime: this.avgReactionTime.toFixed(2),
        score: this.currentScore
      };

      storageService.saveTrainingRecord(record);
      this.trainingHistory = storageService.getTrainingHistory();
      const times = this.reactionTimes;
      const body = {
          archiveId: this.archiveId,
          trainType: 'abstract',
          gameType: 'xwsd',
          minTime: times.length ? Math.min(...times) : 0,
          maxTime: times.length ? Math.max(...times) : 0,
          avgTime: parseFloat(record.avgReactionTime),
          score: record.score,
          successCount: this.correctAnswers,
          failCount: this.totalQuestions - this.correctAnswers,
          trainDuration: this.totalGameTime,
          difficultyLevel: this.currentDifficulty,
          };

      api.submitPbGameRecord(body).catch(() => {});

      this.gameState = 'result';
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
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}
</style>
