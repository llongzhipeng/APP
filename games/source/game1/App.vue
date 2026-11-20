<template>
  <div id="app">
    <div class="lang-switch" v-if="!shouldHideLangSwitch">
      <button class="btn btn-secondary" @click="toggleLang">{{ lang === 'zh' ? 'English' : '中文' }}</button>
    </div>
    <!-- 主页 -->
    <div v-if="currentView === 'home'">
      <h1 class="title">{{ t('home.title') }}</h1>
      <div class="flex-center" style="gap: 20px; margin: 50px 0; flex-wrap: wrap;">
        <button class="btn btn-primary" @click="goToSettings">{{ t('home.start') }}</button>
        <button class="btn btn-secondary" @click="goToHistory">{{ t('home.history') }}</button>
        <button class="btn btn-secondary" @click="showRuleModal = true">{{ t('home.rules') }}</button>
      </div>
    </div>

    <!-- 游戏设置 -->
    <GameSettings
      v-if="currentView === 'settings'"
      @confirm="startGame"
      @back="goToHome"
    />

    <!-- 游戏页面 -->
    <GameMatrix
      v-if="currentView === 'game'"
      :training-duration="selectedDuration"
      @gameOver="showResult"
      @back="goToHome"
    />

    <!-- 结果页面 -->
    <GameResult
      v-if="currentView === 'result'"
      :record="currentRecord"
      @playAgain="goToSettings"
      @viewHistory="goToHistory"
      @goHome="goToHome"
    />

    <!-- 历史记录 -->
    <HistoryRecords
      v-if="currentView === 'history'"
      @back="goToHome"
    />

    <!-- 规则弹窗 -->
    <RuleModal
      :visible="showRuleModal"
      @close="showRuleModal = false"
    />

    <!-- 教程弹窗 -->
    <TutorialModal
      :visible="showTutorialModal"
      @close="closeTutorialAndStartGame"
    />
  </div>
</template>

<script>
import { bindTrainingLanguage } from '@/language.js'
import { ref, provide, computed, getCurrentInstance, onMounted } from '@vue/composition-api';
import { applyBatchTutorialEntry } from '@/utils/pbGameBatchEntry';

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
import './style.css';
import GameSettings from './components/GameSettings.vue';
import GameMatrix from './components/GameMatrix.vue';
import GameResult from './components/GameResult.vue';
import HistoryRecords from './components/HistoryRecords.vue';
import RuleModal from './components/RuleModal.vue';
import TutorialModal from './components/TutorialModal.vue';

const messages = {
  zh: {
    home: {
      title: '记忆矩阵 - 认知训练游戏',
      start: '开始训练',
      history: '历史记录',
      rules: '游戏规则'
    },
    settings: {
      title: '记忆矩阵 - 训练设置',
      choose: '选择训练时长：',
      confirm: '确认开始',
      back: '返回主页'
    },
    duration: { '60': '1分钟', '180': '3分钟', '300': '5分钟' },
    game: {
      difficulty: '当前难度',
      remaining: '剩余时间',
      showing: '请记住方块亮起的顺序...',
      verifying: '验证中...',
      prompt: '请按顺序点击方块',
      score: '当前得分',
      back: '返回主页（终止训练）',
      skip: '跳过游戏',
      correct: '答对了！',
      wrong: '答错了',
      prev: '上一题',
      next: '下一题',
      noticeUp: level => `难度升级！当前等级：${level}`,
      noticeDown: level => `难度降低！当前等级：${level}`
    },
    result: {
      title: '训练结果',
      duration: '训练时长：',
      difficulty: '最终难度：',
      total: '答题总次数：',
      success: '成功次数：',
      fail: '失败次数：',
      rate: '成功率：',
      reaction: '平均反应时长：',
      score: '总得分：',
      playAgain: '重新训练',
      viewHistory: '查看历史记录',
      goHome: '返回主页'
    },
    history: {
      title: '训练历史记录',
      export: '导出CSV',
      empty: '暂无训练数据，开始你的第一次训练吧～',
      back: '返回主页',
      th: {
        time: '训练时间',
        level: '难度等级',
        duration: '时长(秒)',
        total: '总次数',
        success: '成功次数',
        rate: '成功率(%)',
        score: '总分'
      }
    },
    rule: {
      title: '游戏规则',
      lines: [
        '1. 训练时长可选：1分钟、3分钟、5分钟，默认1分钟；',
        '2. 游戏开始后，屏幕会显示方格矩阵，部分方块会按顺序亮起；',
        '3. 方块亮起结束后，请按相同顺序点击方格；',
        '4. 难度规则：每30秒统计一次正确率，≥90%升级，<70%降级（1级最低，6级最高）；',
        '5. 评分规则：答对1题得 5×难度系数 分，答错不得分；',
        '6. 训练过程中可随时点击返回键终止训练，数据会自动保存。'
      ],
      ok: '我知道了'
    },
    tutorial: {
      title: '游戏教程演示',
      startGame: '开始游戏',
      demo: {
        intro: '点击下方按钮开始演示',
        start: '开始演示',
        showing: '请记住方块亮起的顺序...',
        ready: '现在请按顺序点击方块！',
        success: '太棒了！答对了！',
        fail: '答错了，让我们再试一次'
      },
      explain: {
        step1: {
          title: '① 观察：记住方块点亮顺序'
        },
        step2: {
          title: '② 答题：按顺序点击方块'
        },
        step3: {
          title: '③ 升级：根据表现调整难度'
        }
      }
    },
    csv: {
      headers: ['训练时间','训练项目','难度等级','实际时长(秒)','总次数','成功次数','失败次数','成功率(%)','平均反应时长(毫秒)','总分']
    }
  },
  en: {
    home: {
      title: 'Memory Matrix - Cognitive Training',
      start: 'Start Training',
      history: 'History',
      rules: 'Rules'
    },
    settings: {
      title: 'Memory Matrix - Settings',
      choose: 'Select training duration:',
      confirm: 'Start',
      back: 'Back to Home'
    },
    duration: { '60': '1 min', '180': '3 min', '300': '5 min' },
    game: {
      difficulty: 'Difficulty',
      remaining: 'Time Left',
      showing: 'Memorize the sequence...',
      verifying: 'Verifying...',
      prompt: 'Click squares in order',
      score: 'Score',
      back: 'Back (Stop Training)',
      skip: 'Skip Game',
      correct: 'Correct!',
      wrong: 'Wrong',
      prev: 'Prev',
      next: 'Next',
      noticeUp: level => `Level up! Now: ${level}`,
      noticeDown: level => `Level down. Now: ${level}`
    },
    result: {
      title: 'Results',
      duration: 'Duration:',
      difficulty: 'Final Difficulty:',
      total: 'Total Attempts:',
      success: 'Correct:',
      fail: 'Wrong:',
      rate: 'Accuracy:',
      reaction: 'Avg Reaction:',
      score: 'Score:',
      playAgain: 'Train Again',
      viewHistory: 'View History',
      goHome: 'Home'
    },
    history: {
      title: 'Training History',
      export: 'Export CSV',
      empty: 'No records yet — start your first session!',
      back: 'Back to Home',
      th: {
        time: 'Time',
        level: 'Level',
        duration: 'Duration(s)',
        total: 'Attempts',
        success: 'Correct',
        rate: 'Accuracy(%)',
        score: 'Score'
      }
    },
    rule: {
      title: 'Game Rules',
      lines: [
        '1. Duration options: 1, 3, 5 minutes (default 1).',
        '2. A grid appears; some squares light up in order.',
        '3. After lights off, click squares in the same order.',
        '4. Difficulty adjusts every 30s: ≥90% up, <70% down (1-6).',
        '5. Scoring: correct = 5 × difficulty coefficient; wrong = 0.',
        '6. You can stop anytime via back; data auto-saves.'
      ],
      ok: 'Got it'
    },
    tutorial: {
      title: 'Game Tutorial',
      startGame: 'Start Game',
      demo: {
        intro: 'Click the button below to start the demo',
        start: 'Start Demo',
        showing: 'Memorize the sequence...',
        ready: 'Now click the squares in order!',
        success: 'Great! Correct!',
        fail: 'Wrong answer, let\'s try again'
      },
      explain: {
        step1: {
          title: '① Observe: Memorize lighting order'
        },
        step2: {
          title: '② Answer: Click in sequence'
        },
        step3: {
          title: '③ Scale: Auto-adjust difficulty'
        }
      }
    },
    csv: {
      headers: ['Time','Item','Level','Duration(s)','Total','Correct','Wrong','Accuracy(%)','Avg Reaction(ms)','Score']
    }
  }
};

export default {
  name: 'Game1App',
  components: {
    GameSettings,
    GameMatrix,
    GameResult,
    HistoryRecords,
    RuleModal,
    TutorialModal
  },
  setup() {
    const instance = getCurrentInstance();
    const archiveId = ref(resolveArchiveId(instance.proxy.$route));

    const lang = ref('zh');
    bindTrainingLanguage(() => lang.value, value => { lang.value = value })
    const t = (key, ...args) => {
      const path = key.split('.');
      let cur = messages[lang.value];
      for (const p of path) {
        cur = cur ? cur[p] : undefined;
      }
      return typeof cur === 'function' ? cur(...args) : (cur == null ? key : cur);
    };

    provide('t', t);
    provide('lang', lang);
    provide('messages', messages);
    provide('archiveId', archiveId);

    const currentView = ref('home');
    const showRuleModal = ref(false);
    const showTutorialModal = ref(false);
    const selectedDuration = ref(60);
    const currentRecord = ref({});

    const shouldHideLangSwitch = computed(() => {
      return currentView.value === 'game' || currentView.value === 'result';
    });

    const toggleLang = () => {
      lang.value = lang.value === 'zh' ? 'en' : 'zh';
    };

    const goToHome = () => {
      currentView.value = 'home';
    };

    const goToSettings = () => {
      currentView.value = 'settings';
    };

    const goToHistory = () => {
      currentView.value = 'history';
    };

    const startGame = (duration) => {
      selectedDuration.value = duration;
      showTutorialModal.value = true;
    };

    const closeTutorialAndStartGame = () => {
      showTutorialModal.value = false;
      currentView.value = 'game';
    };

    const showResult = (record) => {
      currentRecord.value = record;
      currentView.value = 'result';
    };

    onMounted(() => {
      applyBatchTutorialEntry('jyjz', {
        setDuration: (duration) => { selectedDuration.value = duration },
        openTutorial: () => { showTutorialModal.value = true },
      })
    });

    return {
      lang,
      t,
      currentView,
      showRuleModal,
      showTutorialModal,
      selectedDuration,
      currentRecord,
      shouldHideLangSwitch,
      toggleLang,
      goToHome,
      goToSettings,
      goToHistory,
      startGame,
      closeTutorialAndStartGame,
      showResult
    };
  }
};
</script>
