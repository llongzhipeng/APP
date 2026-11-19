<template>
  <div id="app" :class="['screen-' + screen]">
    <!-- Ambient background -->
    <div class="bg-layer">
      <div class="bg-grid"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
      <div class="bg-noise"></div>
    </div>

    <!-- Language toggle (hidden in-game) -->
    <button
      v-if="screen !== 'playing'"
      class="lang-toggle"
      @click="toggleLang"
      :title="lang === 'zh' ? 'Switch to English' : '切换为中文'"
    >
      <span class="lang-icon">🌐</span>
      <span class="lang-text">{{ lang === 'zh' ? 'EN' : '中' }}</span>
    </button>

    <!-- ============ HOME ============ -->
    <transition name="fade-scale" mode="out-in">
    <section v-if="screen === 'home'" class="home">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 80 80" class="brand-svg">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#7ce7ff"/>
                <stop offset="1" stop-color="#8f7dff"/>
              </linearGradient>
            </defs>
            <rect x="6" y="6" width="30" height="30" rx="6" fill="none" stroke="url(#lg1)" stroke-width="3"/>
            <rect x="44" y="6" width="30" height="30" rx="6" fill="none" stroke="url(#lg1)" stroke-width="3"/>
            <rect x="6" y="44" width="30" height="30" rx="6" fill="none" stroke="url(#lg1)" stroke-width="3"/>
            <rect x="44" y="44" width="30" height="30" rx="6" fill="none" stroke="url(#lg1)" stroke-width="3"/>
            <circle cx="21" cy="21" r="6" fill="url(#lg1)"/>
            <circle cx="59" cy="59" r="6" fill="url(#lg1)"/>
            <line x1="40" y1="0" x2="40" y2="80" stroke="url(#lg1)" stroke-width="1.5" stroke-dasharray="3 3"/>
          </svg>
        </div>
        <h1 class="brand-title">{{ t.title }}</h1>
        <div class="brand-subtitle">{{ t.subtitle }}</div>
        <div class="brand-tag">{{ t.tagline }}</div>
      </div>

      <div class="home-actions">
        <button class="btn btn-primary btn-lg" @click="goStart">
          <span class="btn-glow"></span>
          <span class="btn-icon">▶</span>
          <span>{{ t.startGame }}</span>
        </button>
        <button class="btn btn-ghost" @click="showRules = true">
          <span class="btn-icon">📖</span>
          <span>{{ t.rules }}</span>
        </button>
        <button class="btn btn-ghost" @click="screen = 'history'">
          <span class="btn-icon">📊</span>
          <span>{{ t.history }}</span>
        </button>
      </div>

      <div class="home-foot">Cognitive Training · Visual Attention</div>
    </section>
    </transition>

    <!-- ============ HISTORY ============ -->
    <transition name="fade-scale" mode="out-in">
    <section v-if="screen === 'history'" class="page history">
      <header class="page-head">
        <button class="btn btn-back" @click="screen = 'home'">
          <span>‹</span> {{ t.back }}
        </button>
        <h2>{{ t.history }}</h2>
        <button v-if="history.length" class="btn btn-danger-ghost" @click="clearHistory">{{ t.clear }}</button>
        <span v-else style="width:80px"></span>
      </header>
      <div class="history-wrap" v-if="history.length">
        <div class="history-table">
          <div class="thead">
            <div>{{ t.h.time }}</div>
            <div>{{ t.h.project }}</div>
            <div>{{ t.h.difficulty }}</div>
            <div>{{ t.h.duration }}</div>
            <div>{{ t.h.total }}</div>
            <div>{{ t.h.success }}</div>
            <div>{{ t.h.fail }}</div>
            <div>{{ t.h.rate }}</div>
            <div>{{ t.h.avg }}</div>
            <div>{{ t.h.score }}</div>
          </div>
          <div class="trow" v-for="(r, i) in history" :key="i">
            <div>{{ r.time }}</div>
            <div>{{ t.title }}</div>
            <div>Lv.{{ r.maxDifficulty }}</div>
            <div>{{ formatMs(r.durationMs) }}</div>
            <div>{{ r.total }}</div>
            <div class="ok">{{ r.success }}</div>
            <div class="bad">{{ r.fail }}</div>
            <div>{{ r.total ? Math.round(r.success/r.total*100) : 0 }}%</div>
            <div>{{ r.avgMs }}ms</div>
            <div class="score-cell">{{ r.score }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <div class="empty-icon">🗂️</div>
        <div>{{ t.noHistory }}</div>
      </div>
    </section>
    </transition>

    <!-- ============ DURATION SELECT ============ -->
    <transition name="fade-scale" mode="out-in">
    <section v-if="screen === 'duration'" class="page duration">
      <header class="page-head">
        <button class="btn btn-back" @click="screen = 'home'">
          <span>‹</span> {{ t.back }}
        </button>
        <h2>{{ t.selectDuration }}</h2>
        <span style="width:80px"></span>
      </header>
      <div class="duration-grid">
        <button
          v-for="d in durations"
          :key="d"
          class="dur-card"
          :class="{ active: selectedDuration === d }"
          @click="selectedDuration = d"
        >
          <div class="dur-num">{{ d }}</div>
          <div class="dur-unit">{{ t.minute }}</div>
          <div class="dur-hint">{{ d === 1 ? t.durShort : d === 3 ? t.durNormal : t.durDeep }}</div>
        </button>
      </div>
      <div class="duration-actions">
        <button class="btn btn-primary btn-lg" :disabled="!selectedDuration" @click="beginGame()">
          <span class="btn-glow"></span>
          <span class="btn-icon">▶</span>
          <span>{{ t.startGame }}</span>
        </button>
      </div>
    </section>
    </transition>

    <!-- ============ PLAYING ============ -->
    <transition name="fade-scale" mode="out-in">
    <section v-if="screen === 'playing'" class="game">
      <!-- HUD -->
      <header class="hud">
        <div class="hud-left">
          <div class="stat">
            <div class="stat-label">{{ t.difficulty }}</div>
            <div class="stat-val diff-val">Lv.{{ currentDifficulty }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">{{ t.score }}</div>
            <div class="stat-val score-val">{{ score }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">{{ t.timeLeft }}</div>
            <div class="stat-val time-val" :class="{ warn: sessionRemain <= 10 }">{{ formatTime(sessionRemain) }}</div>
          </div>
        </div>

        <div class="hud-center">
          <div class="task-tag">{{ t.task }}</div>
          <div class="task-desc">{{ taskDescription }}</div>
        </div>

        <div class="hud-right">
          <button v-if="showBatchSkip" class="hud-btn skip-batch" @click="onBatchSkip" :title="t.skipGame">
            <span>⏭</span><span class="hud-btn-txt">{{ t.skipGame }}</span>
          </button>
          <button class="hud-btn skip" @click="skipQuestion" :title="t.skip">
            <span>⏭</span><span class="hud-btn-txt">{{ t.skip }}</span>
          </button>
          <button class="hud-btn back" @click="pauseAndConfirmExit" :title="t.back">
            <span>⎋</span><span class="hud-btn-txt">{{ t.back }}</span>
          </button>
        </div>
      </header>

      <!-- Question timer bar -->
      <div class="qbar">
        <div class="qbar-fill" :style="{ width: (qTimeLeft / 15 * 100) + '%', background: qTimeLeft < 5 ? 'linear-gradient(90deg,#ff6a88,#ff3d6e)' : 'linear-gradient(90deg,#7ce7ff,#8f7dff)' }"></div>
      </div>

      <!-- Play area -->
      <div class="play-area">
        <div class="mirror-stage" :class="['axis-' + question.axis, { swapped: question.swap }]">
          <!-- Grid A (with target) -->
          <div class="grid-panel panel-a" :style="{ order: question.swap ? 2 : 0 }">
            <div class="panel-title"><span class="pt-badge">A</span><span class="pt-label">{{ lang === 'zh' ? '目标区' : 'TARGET' }}</span></div>
            <div class="grid-wrap">
              <div class="grid" :style="gridStyle(question.rows, question.cols)" :data-rows="question.rows" :data-cols="question.cols">
                <div v-for="i in question.rows * question.cols"
                     :key="'a'+i"
                     class="cell cell-a"
                     :class="{ 'has-target': i - 1 === question.targetIndex }">
                  <div v-if="i - 1 === question.targetIndex" class="target">
                    <div class="target-core"></div>
                    <div class="target-ring"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mirror divider -->
          <div class="mirror-divider" :style="{ order: 1 }">
            <div class="divider-line"></div>
            <div class="divider-badge">
              <svg v-if="question.axis === 'lr'" viewBox="0 0 24 24" width="22" height="22">
                <path d="M12 3v18M8 8l-4 4 4 4M16 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="22" height="22">
                <path d="M3 12h18M8 8l4-4 4 4M8 16l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="divider-line"></div>
          </div>

          <!-- Grid B (answer) -->
          <div class="grid-panel panel-b" :style="{ order: question.swap ? 0 : 2 }">
            <div class="panel-title"><span class="pt-badge pt-badge-b">B</span><span class="pt-label">{{ lang === 'zh' ? '答题区' : 'ANSWER' }}</span></div>
            <div class="grid-wrap">
              <div class="grid" :style="gridStyle(question.rows, question.cols)" :data-rows="question.rows" :data-cols="question.cols">
                <button
                  v-for="i in question.rows * question.cols"
                  :key="'b'+i"
                  class="cell cell-b"
                  :class="feedbackClass(i - 1)"
                  :disabled="!!feedback"
                  @click="answer(i - 1)"
                >
                  <div v-if="feedback && (i - 1) === question.answerIndex" class="reveal">
                    <div class="target-core reveal-core"></div>
                  </div>
                  <div v-if="feedback === 'wrong' && (i - 1) === wrongIndex" class="wrong-mark">✕</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback banner -->
        <transition name="pop">
          <div v-if="feedback" class="fb-banner" :class="'fb-' + feedback">
            <span v-if="feedback === 'right'">✓ {{ t.correct }} · +{{ lastGain }}</span>
            <span v-else-if="feedback === 'wrong'">✕ {{ t.wrong }}</span>
            <span v-else>⏱ {{ t.timeout }}</span>
          </div>
        </transition>
      </div>

      <!-- Pause overlay -->
      <transition name="fade">
        <div v-if="paused" class="modal-mask">
          <div class="modal">
            <div class="modal-icon">⏸</div>
            <h3>{{ t.confirmExit }}</h3>
            <p>{{ t.confirmExitDesc }}</p>
            <div class="modal-actions">
              <button class="btn btn-ghost" @click="resumeGame">{{ t.cancel }}</button>
              <button class="btn btn-danger" @click="exitGame">{{ t.exit }}</button>
            </div>
          </div>
        </div>
      </transition>
    </section>
    </transition>

    <!-- ============ RESULT ============ -->
    <transition name="fade-scale" mode="out-in">
    <section v-if="screen === 'result'" class="page result">
      <div class="result-card">
        <div class="result-body">
          <div class="result-badge">
            <svg viewBox="0 0 60 60" width="56" height="56">
              <circle cx="30" cy="30" r="26" fill="none" stroke="#7ce7ff" stroke-width="3"/>
              <path d="M18 30l9 9 15-18" fill="none" stroke="#7ce7ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>{{ t.resultTitle }}</h2>
          <div class="result-score">
            <div class="rs-label">{{ t.finalScore }}</div>
            <div class="rs-val">{{ lastResult.score }}</div>
          </div>
          <div class="result-stats">
            <div class="rstat"><div class="v">{{ lastResult.total }}</div><div class="l">{{ t.h.total }}</div></div>
            <div class="rstat"><div class="v ok">{{ lastResult.success }}</div><div class="l">{{ t.h.success }}</div></div>
            <div class="rstat"><div class="v bad">{{ lastResult.fail }}</div><div class="l">{{ t.h.fail }}</div></div>
            <div class="rstat"><div class="v">{{ lastResult.total ? Math.round(lastResult.success/lastResult.total*100) : 0 }}%</div><div class="l">{{ t.h.rate }}</div></div>
            <div class="rstat"><div class="v">{{ lastResult.avgMs }}ms</div><div class="l">{{ t.h.avg }}</div></div>
            <div class="rstat"><div class="v">Lv.{{ lastResult.maxDifficulty }}</div><div class="l">{{ t.h.difficulty }}</div></div>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn btn-ghost" @click="screen = 'home'">{{ t.home }}</button>
          <button class="btn btn-primary" @click="goStart">
            <span class="btn-glow"></span>{{ t.again }}
          </button>
        </div>
      </div>
    </section>
    </transition>

    <!-- ============ RULES MODAL ============ -->
    <transition name="fade">
    <div v-if="showRules" class="modal-mask" @click.self="showRules = false">
      <div class="modal modal-wide">
        <h3>{{ t.rules }}</h3>
        <div class="rules-body">
          <p>{{ t.ruleP1 }}</p>
          <p>{{ t.ruleP2 }}</p>
          <ul>
            <li>{{ t.ruleL1 }}</li>
            <li>{{ t.ruleL2 }}</li>
            <li>{{ t.ruleL3 }}</li>
          </ul>
          <div class="lv-table">
            <div class="lvh"><div>Lv</div><div>{{ t.mirror }}</div><div>{{ t.grid }}</div><div>{{ t.coef }}</div></div>
            <div class="lvr" v-for="l in levels" :key="l.level">
              <div>Lv.{{ l.level }}</div>
              <div>{{ mirrorLabel(l.axis) }}</div>
              <div>{{ l.rows }}×{{ l.cols }}</div>
              <div>×{{ l.coef }}</div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showRules = false">{{ t.gotIt }}</button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ============ TUTORIAL MODAL ============ -->
    <transition name="fade">
    <div v-if="showTutorial" class="modal-mask">
      <div class="modal modal-wide tutorial">
        <div class="tut-head">
          <h3>{{ t.tutorial }} · {{ tutorialStep + 1 }} / {{ tutorialSteps.length }}</h3>
          <button class="tut-skip" @click="finishTutorial">{{ t.skipTutorial }} ›</button>
        </div>

        <div class="tut-body">
          <div class="tut-title">{{ tutorialSteps[tutorialStep].title }}</div>
          <div class="tut-demo">
            <div class="mirror-stage" :class="'axis-' + tutorialSteps[tutorialStep].axis">
              <div class="grid-panel panel-a">
                <div class="panel-title"><span class="pt-badge">A</span><span class="pt-label">{{ lang === 'zh' ? '目标区' : 'TARGET' }}</span></div>
                <div class="grid-wrap">
                  <div class="grid" :style="gridStyle(tutorialSteps[tutorialStep].rows, tutorialSteps[tutorialStep].cols)" :data-rows="tutorialSteps[tutorialStep].rows" :data-cols="tutorialSteps[tutorialStep].cols">
                    <div v-for="i in tutorialSteps[tutorialStep].rows * tutorialSteps[tutorialStep].cols"
                         :key="'ta'+i"
                         class="cell cell-a"
                         :class="{ 'has-target': i - 1 === tutorialSteps[tutorialStep].targetIndex }">
                      <div v-if="i - 1 === tutorialSteps[tutorialStep].targetIndex" class="target">
                        <div class="target-core"></div>
                        <div class="target-ring"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mirror-divider">
                <div class="divider-line"></div>
                <div class="divider-badge">
                  <svg v-if="tutorialSteps[tutorialStep].axis === 'lr'" viewBox="0 0 24 24" width="22" height="22">
                    <path d="M12 3v18M8 8l-4 4 4 4M16 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="22" height="22">
                    <path d="M3 12h18M8 8l4-4 4 4M8 16l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="divider-line"></div>
              </div>

              <div class="grid-panel panel-b">
                <div class="panel-title"><span class="pt-badge pt-badge-b">B</span><span class="pt-label">{{ lang === 'zh' ? '答题区' : 'ANSWER' }}</span></div>
                <div class="grid-wrap">
                  <div class="grid" :style="gridStyle(tutorialSteps[tutorialStep].rows, tutorialSteps[tutorialStep].cols)" :data-rows="tutorialSteps[tutorialStep].rows" :data-cols="tutorialSteps[tutorialStep].cols">
                    <div v-for="i in tutorialSteps[tutorialStep].rows * tutorialSteps[tutorialStep].cols"
                         :key="'tb'+i"
                         class="cell cell-b"
                         :class="{
                           'demo-correct': tutorialStep >= 1 && i - 1 === tutorialSteps[tutorialStep].answerIndex,
                           'demo-hint': tutorialStep === 0 && i - 1 === tutorialSteps[tutorialStep].answerIndex
                         }">
                      <div v-if="tutorialStep >= 1 && i - 1 === tutorialSteps[tutorialStep].answerIndex" class="reveal">
                        <div class="target-core reveal-core"></div>
                      </div>
                      <div v-else-if="tutorialStep === 0 && i - 1 === tutorialSteps[tutorialStep].answerIndex" class="pulse-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="tut-caption">{{ tutorialSteps[tutorialStep].caption }}</div>
        </div>

        <div class="tut-nav">
          <button class="btn btn-ghost" :disabled="tutorialStep === 0" @click="tutorialStep--">‹ {{ t.prev }}</button>
          <div class="tut-dots">
            <span v-for="(s, idx) in tutorialSteps" :key="idx"
                  class="dot" :class="{ active: idx === tutorialStep }"></span>
          </div>
          <button class="btn btn-primary" @click="nextTutorial">
            {{ tutorialStep === tutorialSteps.length - 1 ? t.startNow : t.next }} ›
          </button>
        </div>
      </div>
    </div>
    </transition>
  </div>
</template>

<script>
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'kjjx'

const I18N = {
  zh: {
    title: '空间镜像',
    subtitle: 'Spatial Mirror',
    tagline: '视觉注意力持续定位训练',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    back: '返回',
    clear: '清空',
    selectDuration: '选择训练时长',
    minute: '分钟',
    durShort: '轻度体验',
    durNormal: '标准训练',
    durDeep: '深度训练',
    difficulty: '难度',
    score: '得分',
    timeLeft: '剩余',
    task: '当前题目',
    skip: '跳过',
    skipGame: '跳过游戏',
    correct: '正确',
    wrong: '错误',
    timeout: '超时',
    confirmExit: '暂停中',
    confirmExitDesc: '确认要结束本次训练并返回吗？',
    cancel: '取消',
    exit: '确认结束',
    resultTitle: '训练完成',
    finalScore: '最终得分',
    home: '返回首页',
    again: '再来一局',
    noHistory: '还没有训练记录',
    ruleP1: '本训练分为左右镜像与上下镜像。屏幕两侧分别显示 N×M 的方格。',
    ruleP2: 'A 侧方格中会出现一个目标物，你需要根据镜像规则，在 B 侧选择目标物对应位置。',
    ruleL1: '每题最长答题时间 15 秒',
    ruleL2: '每 60 秒统计一次正确率，≥90% 升级，≤70% 降级',
    ruleL3: '得分 = 5 × 难度系数（每答对一题）',
    mirror: '镜像',
    grid: '网格',
    coef: '系数',
    gotIt: '知道了',
    tutorial: '游戏教程',
    skipTutorial: '跳过教程',
    prev: '上一步',
    next: '下一步',
    startNow: '开始训练',
    tutTitle1: '第 1 步 · 找到 A 侧目标',
    tutTitle2: '第 2 步 · 左右镜像映射',
    tutTitle3: '第 3 步 · 上下镜像映射',
    tutCap1: '仔细观察 A 侧亮点位置，闪烁位置就是应该在 B 侧选择的答案。',
    tutCap2: '左右镜像：A 侧靠左则 B 侧靠右，行不变，列取镜像。',
    tutCap3: '上下镜像：A 侧靠上则 B 侧靠下，列不变，行取镜像。',
    h: { time: '训练时间', project: '项目', difficulty: '难度', duration: '时长', total: '总数', success: '正确', fail: '失败', rate: '正确率', avg: '平均反应', score: '得分' }
  },
  en: {
    title: 'Spatial Mirror',
    subtitle: 'Cognitive Training',
    tagline: 'Sustained Visual Attention Training',
    startGame: 'Start',
    rules: 'How to Play',
    history: 'History',
    back: 'Back',
    clear: 'Clear',
    selectDuration: 'Choose Duration',
    minute: 'min',
    durShort: 'Warm-up',
    durNormal: 'Standard',
    durDeep: 'Deep Focus',
    difficulty: 'Level',
    score: 'Score',
    timeLeft: 'Time',
    task: 'Task',
    skip: 'Skip',
    skipGame: 'Skip Game',
    correct: 'Correct',
    wrong: 'Wrong',
    timeout: 'Timeout',
    confirmExit: 'Paused',
    confirmExitDesc: 'Exit this session and return?',
    cancel: 'Cancel',
    exit: 'Exit',
    resultTitle: 'Session Complete',
    finalScore: 'Final Score',
    home: 'Home',
    again: 'Play Again',
    noHistory: 'No records yet',
    ruleP1: 'The game features horizontal and vertical mirror layouts with N×M grids on both sides.',
    ruleP2: 'A target appears on side A. Pick its mirrored position on side B.',
    ruleL1: 'Up to 15 s per question',
    ruleL2: 'Accuracy checked every 60 s — ≥90% level up, ≤70% level down',
    ruleL3: 'Score = 5 × difficulty coefficient per correct answer',
    mirror: 'Mirror',
    grid: 'Grid',
    coef: 'Coef.',
    gotIt: 'Got it',
    tutorial: 'Tutorial',
    skipTutorial: 'Skip',
    prev: 'Prev',
    next: 'Next',
    startNow: 'Start',
    tutTitle1: 'Step 1 · Spot the Target',
    tutTitle2: 'Step 2 · Left-Right Mirror',
    tutTitle3: 'Step 3 · Top-Bottom Mirror',
    tutCap1: 'Watch the highlighted cell on A. The blinking cell on B shows the correct answer.',
    tutCap2: 'Horizontal mirror: same row, column is flipped.',
    tutCap3: 'Vertical mirror: same column, row is flipped.',
    h: { time: 'Time', project: 'Project', difficulty: 'Level', duration: 'Duration', total: 'Total', success: 'Correct', fail: 'Wrong', rate: 'Accuracy', avg: 'Avg RT', score: 'Score' }
  }
}

const LEVELS = [
  { level: 1, axis: 'lr',   rows: 2, cols: 2, coef: 1 },
  { level: 2, axis: 'lr',   rows: 2, cols: 3, coef: 1.5 },
  { level: 3, axis: 'tb',   rows: 3, cols: 3, coef: 2 },
  { level: 4, axis: 'tb',   rows: 3, cols: 4, coef: 2.5 },
  { level: 5, axis: 'both', rows: 2, cols: 2, coef: 3 },
  { level: 6, axis: 'both', rows: 3, cols: 3, coef: 3.5 },
]

export default {
  name: 'App',
  data() {
    return {
      lang: 'zh',
      screen: 'home',
      showRules: false,
      showTutorial: false,
      tutorialStep: 0,
      durations: [1, 3, 5],
      selectedDuration: 3,

      currentDifficulty: 1,
      maxDifficulty: 1,
      score: 0,
      question: { axis: 'lr', rows: 2, cols: 2, targetIndex: 0, answerIndex: 0 },
      qTimeLeft: 15,
      sessionRemain: 180,
      feedback: null,
      wrongIndex: -1,
      lastGain: 0,
      paused: false,

      total: 0,
      success: 0,
      fail: 0,
      rtSum: 0,
      questionStartAt: 0,

      windowCorrect: 0,
      windowTotal: 0,

      lastTargetKey: '',

      _qTimer: null,
      _sessionTimer: null,
      _fbTimer: null,

      history: [],
      lastResult: {},

      levels: LEVELS,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    t() { return I18N[this.lang] },
    taskDescription() {
      const axis = this.question.axis
      if (this.lang === 'zh') {
        const map = { lr: '左右镜像', tb: '上下镜像' }
        return `请根据【${map[axis]}】规则，在 B 侧选择目标物的对应位置`
      } else {
        const map = { lr: 'horizontal', tb: 'vertical' }
        return `Pick the target's ${map[axis]}-mirror position on side B`
      }
    },
    tutorialSteps() {
      return [
        { title: this.t.tutTitle1, caption: this.t.tutCap1, axis: 'lr', rows: 2, cols: 2, targetIndex: 0, answerIndex: 1 },
        { title: this.t.tutTitle2, caption: this.t.tutCap2, axis: 'lr', rows: 2, cols: 3, targetIndex: 0, answerIndex: 2 },
        { title: this.t.tutTitle3, caption: this.t.tutCap3, axis: 'tb', rows: 3, cols: 3, targetIndex: 1, answerIndex: 7 },
      ]
    }
  },
  watch: {
    screen()        { this.sizeGrids() },
    tutorialStep()  { this.sizeGrids() },
    showTutorial()  { this.sizeGrids() },
    'question.rows'()  { this.sizeGrids() },
    'question.cols'()  { this.sizeGrids() },
    'question.axis'()  { this.sizeGrids() },
    'question.swap'()  { this.sizeGrids() },
  },
  mounted() {
    try {
      const raw = localStorage.getItem('sm_history')
      if (raw) this.history = JSON.parse(raw)
      const l = localStorage.getItem('sm_lang')
      if (l) this.lang = l
    } catch (e) {}
    // Tablet browsers: the URL bar changes visible height and 100vh
    // does not reflect it, so bottom buttons in modals get pushed off-screen.
    // Track the real visible height via visualViewport and expose it as --app-h.
    this.updateViewport()
    window.addEventListener('resize', this.updateViewport)
    window.addEventListener('orientationchange', this.updateViewport)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateViewport)
      window.visualViewport.addEventListener('scroll', this.updateViewport)
    }
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.selectedDuration = dur },
      openTutorial: () => { this.tutorialStep = 0; this.showTutorial = true },
    })
  },
  beforeDestroy() {
    clearInterval(this._qTimer)
    clearInterval(this._sessionTimer)
    clearTimeout(this._fbTimer)
    if (this._audio) { try { this._audio.pause() } catch(e){} }
    window.removeEventListener('resize', this.updateViewport)
    window.removeEventListener('orientationchange', this.updateViewport)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.updateViewport)
      window.visualViewport.removeEventListener('scroll', this.updateViewport)
    }
  },
  methods: {
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
      try { localStorage.setItem('sm_lang', this.lang) } catch(e){}
    },
    updateViewport() {
      const vv = window.visualViewport
      const h = vv ? vv.height : window.innerHeight
      document.documentElement.style.setProperty('--app-h', h + 'px')
      this.sizeGrids()
    },
    mirrorLabel(axis) {
      if (this.lang === 'zh') return { lr: '左右', tb: '上下', both: '左右+上下' }[axis]
      return { lr: 'Horizontal', tb: 'Vertical', both: 'Both' }[axis]
    },
    formatTime(s) {
      s = Math.max(0, Math.floor(s))
      const m = Math.floor(s / 60), r = s % 60
      return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`
    },
    formatMs(ms) {
      const s = Math.floor(ms / 1000)
      const m = Math.floor(s / 60), r = s % 60
      return `${m}:${String(r).padStart(2,'0')}`
    },
    playPrompt(difficulty, axis) {
      // Voice prompt rules:
      //   Lv 1-2 → 1.mp3
      //   Lv 3-4 → 2.mp3
      //   Lv 5-6 → 1.mp3 if this question is LR mirror, 2.mp3 if TB mirror
      let track
      if (difficulty <= 2) track = '1.mp3'
      else if (difficulty <= 4) track = '2.mp3'
      else track = axis === 'lr' ? '1.mp3' : '2.mp3'
      const folder = this.lang === 'zh' ? 'chinese' : 'english'
      const url = `voice/${folder}/${track}`
      try {
        if (!this._audio) this._audio = new Audio()
        this._audio.pause()
        this._audio.src = url
        this._audio.currentTime = 0
        const p = this._audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch (e) {}
    },
    gridStyle(rows, cols) {
      // Keep track only of the CSS grid template; the actual width/height are
      // measured and applied by sizeGrids() so this works reliably on tablet
      // browsers where container query units resolve to 0.
      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }
    },
    sizeGrids() {
      this.$nextTick(() => {
        const grids = document.querySelectorAll('.grid[data-rows][data-cols]')
        grids.forEach(grid => {
          const wrap = grid.parentElement
          if (!wrap) return
          const W = wrap.clientWidth
          const H = wrap.clientHeight
          const rows = +grid.dataset.rows
          const cols = +grid.dataset.cols
          if (!rows || !cols || W <= 0 || H <= 0) return
          // Fit the largest cols:rows rectangle inside W×H, keeping cells square.
          let w = Math.min(W, H * cols / rows)
          let h = w * rows / cols
          grid.style.width = w + 'px'
          grid.style.height = h + 'px'
        })
      })
    },
    goStart() {
      this.tutorialStep = 0
      this.showTutorial = true
    },
    nextTutorial() {
      if (this.tutorialStep < this.tutorialSteps.length - 1) {
        this.tutorialStep++
      } else {
        this.finishTutorial()
      }
    },
    finishTutorial() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.beginGame(dur))) return
      this.selectedDuration = this.selectedDuration || 3
      this.screen = 'duration'
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    /**
     * <summary>开局：写入训练时长（分钟）并启动会话倒计时</summary>
     * @param {number} [duration] 训练时长（分钟）；勿直接绑 @click="beginGame"，否则会把 MouseEvent 当成时长
     */
    beginGame(duration) {
      const mins = Number(duration) // 归一化后的分钟数
      if (Number.isFinite(mins) && mins > 0) {
        this.selectedDuration = mins
      } else if (!Number.isFinite(Number(this.selectedDuration)) || Number(this.selectedDuration) <= 0) {
        this.selectedDuration = 3 // 回退默认 3 分钟，避免剩余时间变成 NaN
      }
      this.currentDifficulty = getBatchStartDifficultyForGame(GAME_TYPE)
      this.maxDifficulty = this.currentDifficulty
      this.score = 0
      this.total = 0
      this.success = 0
      this.fail = 0
      this.rtSum = 0
      this.windowCorrect = 0
      this.windowTotal = 0
      this.lastTargetKey = ''
      this.feedback = null
      this.paused = false
      this.sessionRemain = this.selectedDuration * 60 // 剩余秒数
      this.screen = 'playing'
      this.startSessionTimer()
      this.nextQuestion()
    },
    startSessionTimer() {
      clearInterval(this._sessionTimer)
      this._sessionTimer = setInterval(() => {
        if (this.paused) return
        this.sessionRemain--
        const elapsed = this.selectedDuration * 60 - this.sessionRemain
        if (elapsed > 0 && elapsed % 60 === 0) {
          this.evaluateWindow()
        }
        if (this.sessionRemain <= 0) {
          this.endGame()
        }
      }, 1000)
    },
    evaluateWindow() {
      if (this.windowTotal > 0) {
        const rate = this.windowCorrect / this.windowTotal
        if (rate >= 0.9 && this.currentDifficulty < LEVELS.length) {
          this.currentDifficulty++
        } else if (rate <= 0.7 && this.currentDifficulty > 1) {
          this.currentDifficulty--
        }
        if (this.currentDifficulty > this.maxDifficulty) this.maxDifficulty = this.currentDifficulty
      }
      this.windowCorrect = 0
      this.windowTotal = 0
    },
    nextQuestion() {
      clearTimeout(this._fbTimer)
      this.feedback = null
      this.wrongIndex = -1
      const lv = LEVELS[this.currentDifficulty - 1]
      let axis = lv.axis
      if (axis === 'both') axis = Math.random() < 0.5 ? 'lr' : 'tb'
      const total = lv.rows * lv.cols
      // Pick a target that differs from the previous one (for this grid size)
      let targetIndex
      const key = `${lv.rows}x${lv.cols}`
      const prev = this.lastTargetKey === key ? this.lastTargetIndex : -1
      if (total <= 1) {
        targetIndex = 0
      } else {
        do { targetIndex = Math.floor(Math.random() * total) } while (targetIndex === prev)
      }
      this.lastTargetKey = key
      this.lastTargetIndex = targetIndex
      const r = Math.floor(targetIndex / lv.cols)
      const c = targetIndex % lv.cols
      let ansR = r, ansC = c
      if (axis === 'lr') ansC = lv.cols - 1 - c
      else ansR = lv.rows - 1 - r
      const answerIndex = ansR * lv.cols + ansC
      const swap = Math.random() < 0.5
      this.question = {
        axis: axis,
        rows: lv.rows, cols: lv.cols,
        targetIndex, answerIndex,
        swap
      }
      this.playPrompt(this.currentDifficulty, axis)
      this.qTimeLeft = 15
      this.questionStartAt = Date.now()
      clearInterval(this._qTimer)
      this._qTimer = setInterval(() => {
        if (this.paused) return
        this.qTimeLeft = Math.max(0, this.qTimeLeft - 0.1)
        if (this.qTimeLeft <= 0) {
          clearInterval(this._qTimer)
          this.handleTimeout()
        }
      }, 100)
    },
    answer(idx) {
      if (this.feedback) return
      clearInterval(this._qTimer)
      // Blur the tapped cell so touch browsers don't leave a lingering
      // hover/focus state on it when the next question renders.
      try {
        const el = document.activeElement
        if (el && typeof el.blur === 'function') el.blur()
      } catch (e) {}
      const rt = Date.now() - this.questionStartAt
      this.rtSum += rt
      this.total++
      this.windowTotal++
      if (idx === this.question.answerIndex) {
        this.success++
        this.windowCorrect++
        const coef = LEVELS[this.currentDifficulty - 1].coef
        this.lastGain = Math.round(5 * coef * 10) / 10
        this.score = Math.round((this.score + this.lastGain) * 10) / 10
        this.feedback = 'right'
      } else {
        this.fail++
        this.wrongIndex = idx
        this.feedback = 'wrong'
      }
      if (this.currentDifficulty > this.maxDifficulty) this.maxDifficulty = this.currentDifficulty
      this._fbTimer = setTimeout(() => this.nextQuestion(), 900)
    },
    handleTimeout() {
      this.total++
      this.windowTotal++
      this.fail++
      this.feedback = 'timeout'
      this._fbTimer = setTimeout(() => this.nextQuestion(), 900)
    },
    skipQuestion() {
      if (this.feedback) return
      clearInterval(this._qTimer)
      this.total++
      this.windowTotal++
      this.fail++
      this.feedback = 'timeout'
      this._fbTimer = setTimeout(() => this.nextQuestion(), 700)
    },
    feedbackClass(idx) {
      if (!this.feedback) return ''
      if (idx === this.question.answerIndex) return 'is-correct'
      if (idx === this.wrongIndex) return 'is-wrong'
      return 'is-dim'
    },
    pauseAndConfirmExit() { this.paused = true },
    resumeGame() { this.paused = false },
    exitGame() {
      this.paused = false
      clearInterval(this._qTimer)
      clearInterval(this._sessionTimer)
      clearTimeout(this._fbTimer)
      leavePbGameWindow({ confirm: false })
    },
    endGame() {
      clearInterval(this._qTimer)
      clearInterval(this._sessionTimer)
      clearTimeout(this._fbTimer)
      const durationMs = (this.selectedDuration * 60 - Math.max(0, this.sessionRemain)) * 1000
      const record = {
        time: this.formatDate(new Date()),
        maxDifficulty: this.maxDifficulty,
        durationMs,
        total: this.total,
        success: this.success,
        fail: this.fail,
        avgMs: this.total ? Math.round(this.rtSum / this.total) : 0,
        score: this.score
      }
      this.lastResult = record
      this.history.unshift(record)
      if (this.history.length > 50) this.history = this.history.slice(0, 50)
      try { localStorage.setItem('sm_history', JSON.stringify(this.history)) } catch(e){}
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(record.avgMs),
        score: this.score ? Math.round(this.score) : 0,
        successCount: this.success || 0,
        failCount: this.fail || 0,
        trainDuration: this.selectedDuration,
        difficultyLevel: this.currentDifficulty || 1,
      })
      this.screen = 'result'
    },
    formatDate(d) {
      const p = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    clearHistory() {
      this.history = []
      try { localStorage.removeItem('sm_history') } catch(e){}
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #f5f7fb;
  --panel: #ffffff;
  --ink: #1a2138;
  --ink-2: #56607a;
  --ink-3: #8b93aa;
  --line: #e6e9f2;
  --line-2: #d6dbe8;
  --brand: #3b6eff;
  --brand-2: #5b8bff;
  --brand-soft: #eaf0ff;
  --accent-a: #3b6eff;
  --accent-b: #f97066;
  --ok: #16a34a;
  --bad: #ef4444;
  --warn: #f59e0b;
  --shadow-sm: 0 1px 2px rgba(20,30,60,0.06), 0 2px 8px rgba(20,30,60,0.04);
  --shadow-md: 0 4px 14px rgba(20,30,60,0.08), 0 10px 30px rgba(20,30,60,0.06);
  --shadow-lg: 0 10px 30px rgba(20,30,60,0.10), 0 24px 60px rgba(20,30,60,0.10);
  --radius: 16px;
}
html, body, #app { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: 'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
#app {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  min-height: var(--app-h, 100dvh);
  height: var(--app-h, 100dvh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Bumped-up base font — everything scales in em */
  font-size: clamp(15px, 1.4vmin + 0.5vmax, 22px);
}

/* --- Ambient background (soft, minimal) --- */
.bg-layer { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; background: var(--bg); }
.bg-grid, .bg-noise, .orb-3 { display: none; }
.bg-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.35; }
.orb-1 { width: 44vmax; height: 44vmax; background: #c9d7ff; left: -14vmax; top: -18vmax; }
.orb-2 { width: 34vmax; height: 34vmax; background: #ffe1d5; right: -12vmax; bottom: -14vmax; }

/* --- Language toggle --- */
.lang-toggle {
  position: fixed; top: 1.2em; right: 1.2em; z-index: 100;
  display: flex; align-items: center; gap: 0.5em;
  padding: 0.6em 1.1em;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--ink);
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}
.lang-toggle:hover { border-color: var(--brand); color: var(--brand); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.lang-icon { font-size: 1.1em; }
.lang-text { font-weight: 700; letter-spacing: 0.05em; }

/* --- Buttons --- */
.btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.55em;
  padding: 0.85em 1.7em;
  border-radius: 12px;
  font-family: inherit; font-size: 1em; font-weight: 600;
  border: 1px solid var(--line-2);
  background: var(--panel);
  color: var(--ink);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.btn:hover { transform: translateY(-2px); border-color: var(--brand); color: var(--brand); box-shadow: var(--shadow-md); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-lg { padding: 1.1em 2.6em; font-size: 1.15em; border-radius: 14px; }
.btn-primary {
  background: var(--brand);
  color: #fff; border: 1px solid var(--brand);
  box-shadow: 0 6px 18px -4px rgba(59,110,255,0.45);
}
.btn-primary:hover { background: #2f5cee; color: #fff; border-color: #2f5cee; box-shadow: 0 10px 22px -4px rgba(59,110,255,0.55); }
.btn-glow { display: none; }
.btn-ghost { background: var(--panel); }
.btn-danger { background: var(--bad); color: #fff; border: 1px solid var(--bad); }
.btn-danger:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
.btn-danger-ghost { color: var(--bad); border-color: #fecaca; background: #fff5f5; }
.btn-danger-ghost:hover { background: #ffe4e4; border-color: var(--bad); color: var(--bad); }
.btn-back { padding: 0.75em 1.3em; }
.btn-back span:first-child { font-size: 1.3em; line-height: 1; }
.btn-icon { font-size: 1.1em; }

/* --- HOME --- */
.home {
  position: relative; z-index: 1;
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2em;
  gap: 2.4em;
}
.brand { display: flex; flex-direction: column; align-items: center; gap: 0.9em; text-align: center; }
.brand-logo {
  width: 6.5em; height: 6.5em; display: grid; place-items: center;
  border-radius: 24px;
  background: var(--panel);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-md);
  animation: logoIdle 6s ease-in-out infinite;
}
.brand-svg { width: 68%; height: 68%; color: var(--brand); }
.brand-svg [stop-color="#7ce7ff"] { stop-color: var(--brand) !important; }
.brand-svg [stop-color="#8f7dff"] { stop-color: var(--brand-2) !important; }
@keyframes logoIdle {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.brand-title {
  font-size: 4em; font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.brand-subtitle { font-size: 1.1em; letter-spacing: 0.35em; color: var(--brand); font-weight: 600; }
.brand-tag { color: var(--ink-2); font-size: 1.1em; letter-spacing: 0.05em; }
.home-actions { display: flex; flex-direction: column; gap: 0.9em; align-items: stretch; min-width: 20em; }
.home-actions .btn { justify-content: center; min-width: 18em; font-size: 1.1em; padding: 1em 2em; }
.home-actions .btn-primary { font-size: 1.2em; padding: 1.15em 2.4em; }
.home-foot { position: absolute; bottom: 1.3em; font-size: 0.85em; letter-spacing: 0.25em; color: var(--ink-3); }

/* --- Generic page --- */
.page {
  position: relative; z-index: 1;
  flex: 1; display: flex; flex-direction: column;
  padding: 1.6em 2em;
  gap: 1.6em;
  overflow: hidden;
}
.page-head { display: flex; align-items: center; justify-content: space-between; gap: 1em; }
.page-head h2 { font-size: 1.9em; font-weight: 700; letter-spacing: 0.01em; }

/* --- History --- */
.history-wrap { flex: 1; overflow: auto; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.5em; box-shadow: var(--shadow-sm); }
.history-table { display: flex; flex-direction: column; }
.thead, .trow {
  display: grid;
  grid-template-columns: 1.6fr 1.2fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.8fr 1fr 0.8fr;
  gap: 0.6em;
  padding: 1em 1.1em;
  align-items: center;
  font-size: 0.95em;
}
.thead { color: var(--ink-3); font-weight: 700; letter-spacing: 0.06em; border-bottom: 1px solid var(--line); font-size: 0.85em; text-transform: uppercase; }
.trow { border-radius: 10px; transition: background 0.2s; }
.trow:hover { background: var(--brand-soft); }
.trow + .trow { border-top: 1px solid var(--line); }
.trow .ok { color: var(--ok); font-weight: 600; }
.trow .bad { color: var(--bad); font-weight: 600; }
.score-cell { color: var(--brand); font-weight: 700; }
.empty { flex: 1; display: grid; place-items: center; gap: 1em; color: var(--ink-3); font-size: 1.1em; }
.empty-icon { font-size: 4.5em; opacity: 0.5; }

/* --- Duration --- */
.duration { align-items: center; justify-content: center; }
.duration .page-head { align-self: stretch; }
.duration-grid { display: flex; gap: 1.8em; margin-top: 1em; }
.dur-card {
  width: 15em; padding: 2.6em 1.8em;
  background: var(--panel); border: 2px solid var(--line-2); border-radius: 22px;
  color: var(--ink); cursor: pointer; font-family: inherit;
  display: flex; flex-direction: column; align-items: center; gap: 0.3em;
  transition: all 0.25s cubic-bezier(.4,0,.2,1);
  box-shadow: var(--shadow-sm);
}
.dur-card:hover { transform: translateY(-4px); border-color: var(--brand); box-shadow: var(--shadow-md); }
.dur-card.active {
  border-color: var(--brand);
  background: var(--brand-soft);
  box-shadow: 0 0 0 4px rgba(59,110,255,0.14), var(--shadow-md);
}
.dur-num { font-size: 5em; font-weight: 800; color: var(--brand); line-height: 1; }
.dur-unit { color: var(--ink-2); font-size: 1.2em; letter-spacing: 0.1em; margin-top: 0.35em; }
.dur-hint { color: var(--ink-3); font-size: 1em; margin-top: 0.9em; letter-spacing: 0.08em; }
.duration-actions { margin-top: 1.6em; }

/* --- Game / HUD --- */
.game {
  position: relative; z-index: 1;
  flex: 1;
  display: flex; flex-direction: column;
  padding: 1em 1.4em 1.2em;
  gap: 1em;
  overflow: hidden;
}
.hud {
  display: grid; grid-template-columns: 1.1fr 1.4fr 1fr;
  gap: 1.2em;
  padding: 1.1em 1.4em;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}
.hud-left { display: flex; gap: 2em; align-items: center; }
.stat { display: flex; flex-direction: column; gap: 0.1em; }
.stat-label { font-size: 0.85em; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); font-weight: 600; }
.stat-val { font-size: 1.9em; font-weight: 800; line-height: 1.1; }
.diff-val { color: var(--brand); }
.score-val { color: var(--ink); }
.time-val { color: var(--ink); transition: color 0.3s; }
.time-val.warn { color: var(--bad); animation: pulse 0.8s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

.hud-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.35em; text-align: center; }
.task-tag { font-size: 0.8em; letter-spacing: 0.2em; color: var(--brand); text-transform: uppercase; font-weight: 700; }
.task-desc { font-size: 1.15em; color: var(--ink); font-weight: 600; }

.hud-right { display: flex; gap: 0.7em; justify-content: flex-end; align-items: center; }
.hud-btn {
  display: flex; align-items: center; gap: 0.5em;
  padding: 0.8em 1.2em;
  background: var(--panel); border: 1px solid var(--line-2); border-radius: 12px;
  color: var(--ink); cursor: pointer; font-family: inherit; font-size: 1em; font-weight: 600;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}
.hud-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
@media (hover: none) {
  .hud-btn:hover { transform: none; box-shadow: var(--shadow-sm); }
  .hud-btn.skip:hover { border-color: var(--line-2); color: var(--ink); }
  .hud-btn.back:hover { border-color: var(--line-2); color: var(--ink); }
}
.hud-btn.skip:hover { border-color: var(--warn); color: var(--warn); }
.hud-btn.back:hover { border-color: var(--bad); color: var(--bad); }
.hud-btn-txt { font-weight: 600; }

.qbar { height: 6px; border-radius: 6px; background: var(--line); overflow: hidden; }
.qbar-fill { height: 100%; transition: width 0.1s linear, background 0.3s; border-radius: 6px; }

/* Play area */
.play-area {
  flex: 1;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  min-height: 0;
  min-width: 0;
}
.mirror-stage {
  display: flex; align-items: stretch; justify-content: center;
  gap: 1.6em;
  width: 100%; height: 100%;
  max-width: 100%;
  min-height: 0; min-width: 0;
}
.mirror-stage.axis-tb { flex-direction: column; gap: 1em; }
.grid-panel {
  flex: 1 1 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.9em;
  min-width: 0; min-height: 0;
  padding: 0.2em;
}

/* Panel title — BIG and clearly visible */
.panel-title {
  display: inline-flex; align-items: center; gap: 0.6em;
  padding: 0.45em 1.1em 0.45em 0.45em;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  font-size: 1em;
  flex-shrink: 0;
}
.pt-badge {
  display: grid; place-items: center;
  width: 2em; height: 2em;
  border-radius: 50%;
  background: var(--accent-a);
  color: #fff;
  font-weight: 800; font-size: 1.15em;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(59,110,255,0.35);
}
.pt-badge-b { background: var(--accent-b); box-shadow: 0 2px 6px rgba(249,112,102,0.35); }
.pt-label {
  font-size: 1em; font-weight: 700; letter-spacing: 0.12em;
  color: var(--ink);
  text-transform: uppercase;
}

/* Grid wrap = flex-item space; grid preserves aspect ratio so every cell is a perfect square */
.grid-wrap {
  flex: 1 1 0;
  min-width: 0; min-height: 0;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.grid {
  display: grid; gap: 0.6em;
  /* width/height are measured and assigned by sizeGrids() so that every
     cell stays a perfect square across tablet browsers (Chrome / Edge)
     where container-query units resolve to 0. */
}
.cell {
  position: relative;
  background: var(--panel);
  border: 2px solid var(--line-2);
  border-radius: 14px;
  min-width: 0; min-height: 0;
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  display: grid; place-items: center;
  overflow: hidden;
  font-family: inherit; color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.panel-a .cell { border-color: #dbe4ff; background: #f4f7ff; }
.panel-a .cell.has-target { border-color: var(--accent-a); background: #eaf0ff; }
.panel-b .cell { border-color: #fee2d9; background: #fff8f5; }
.cell-b { cursor: pointer; }
@media (hover: hover) {
  .cell-b:hover:not(:disabled) { border-color: var(--accent-b); background: #ffefe6; transform: scale(1.03); box-shadow: var(--shadow-md); }
}
.cell-b:active:not(:disabled) { transform: scale(0.98); }
.cell-b:focus { outline: none; }
.cell-b:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.cell-b.is-correct { border-color: var(--ok); background: #dcfce7; box-shadow: 0 0 0 3px rgba(22,163,74,0.18); }
.cell-b.is-wrong { border-color: var(--bad); background: #fee2e2; box-shadow: 0 0 0 3px rgba(239,68,68,0.18); animation: shake 0.35s; }
.cell-b.is-dim { opacity: 0.45; }
@keyframes shake { 0%,100%{ transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

/* Target */
.target {
  position: relative; width: 62%; height: 62%;
  display: grid; place-items: center;
}
.target-core {
  position: absolute;
  width: 68%; height: 68%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #7aa2ff, var(--accent-a) 55%, #274bd6 100%);
  box-shadow: 0 6px 18px rgba(59,110,255,0.45), inset 0 0 10px rgba(255,255,255,0.35);
  animation: coreBeat 1.4s ease-in-out infinite;
}
.target-ring {
  position: absolute; width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid var(--accent-a);
  animation: ringPulse 1.4s ease-out infinite;
}
@keyframes coreBeat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes ringPulse {
  0% { transform: scale(0.7); opacity: 0.85; }
  100% { transform: scale(1.35); opacity: 0; }
}
.reveal { position: relative; width: 62%; height: 62%; display: grid; place-items: center; }
.reveal-core { width: 68%; height: 68%; background: radial-gradient(circle at 30% 30%, #8ff0b5, var(--ok) 55%, #0f7a37 100%); box-shadow: 0 6px 18px rgba(22,163,74,0.45), inset 0 0 10px rgba(255,255,255,0.35); animation: none; }
.wrong-mark { position: absolute; font-size: 2.6em; font-weight: 800; color: var(--bad); }

/* Divider */
.mirror-divider { display: flex; align-items: center; justify-content: center; gap: 0.7em; }
.axis-lr .mirror-divider { flex-direction: column; align-self: stretch; }
.axis-tb .mirror-divider { flex-direction: row; width: 60%; align-self: center; }
.divider-line { flex: 1; }
.axis-lr .divider-line { width: 2px; background: linear-gradient(180deg, transparent, var(--line-2), transparent); }
.axis-tb .divider-line { height: 2px; background: linear-gradient(90deg, transparent, var(--line-2), transparent); }
.divider-badge {
  width: 2.8em; height: 2.8em; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--panel); border: 1px solid var(--line);
  color: var(--brand);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

/* Feedback banner */
.fb-banner {
  position: absolute; bottom: 1em; left: 50%; transform: translateX(-50%);
  padding: 0.9em 1.8em; border-radius: 999px;
  font-weight: 700; letter-spacing: 0.04em; font-size: 1.1em;
  box-shadow: var(--shadow-md);
}
.fb-right { background: #dcfce7; color: var(--ok); border: 1px solid #86efac; }
.fb-wrong { background: #fee2e2; color: var(--bad); border: 1px solid #fca5a5; }
.fb-timeout { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }

/* Modals */
.modal-mask {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(20,25,45,0.42); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: grid; place-items: center;
  padding: 2em;
  /* Track the actual visible viewport height so the mask never exceeds it
     even when the tablet URL bar is showing. */
  height: var(--app-h, 100dvh);
  overflow: hidden;
}
.modal {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 2.2em 2.2em 1.8em;
  max-width: 32em;
  /* Cap the modal to the visible viewport minus the mask padding so the
     bottom action buttons stay reachable on tablet browsers. */
  max-height: calc(var(--app-h, 100dvh) - 4em);
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; gap: 1em; align-items: center; text-align: center;
  overflow: hidden;
}
.modal-wide { max-width: 48em; width: 92%; }
.modal-icon { font-size: 3.2em; flex-shrink: 0; }
.modal h3 { font-size: 1.55em; font-weight: 700; flex-shrink: 0; }
.modal p { color: var(--ink-2); line-height: 1.7; font-size: 1.05em; }
.modal-actions { display: flex; gap: 1em; margin-top: 0.6em; flex-shrink: 0; }

.rules-body { text-align: left; width: 100%; display: flex; flex-direction: column; gap: 0.9em; overflow: auto; flex: 1 1 auto; min-height: 0; }
.rules-body p { color: var(--ink-2); line-height: 1.75; font-size: 1.02em; }
.rules-body ul { padding-left: 1.3em; color: var(--ink-2); line-height: 2; font-size: 1.02em; }
.lv-table { margin-top: 0.6em; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.lvh, .lvr { display: grid; grid-template-columns: 0.7fr 1.4fr 1fr 0.8fr; padding: 0.8em 1.1em; align-items: center; font-size: 1em; }
.lvh { background: #f2f4fa; color: var(--ink-2); font-weight: 700; letter-spacing: 0.05em; }
.lvr { border-top: 1px solid var(--line); }

/* Tutorial */
.tut-head { width: 100%; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.tut-skip { background: none; border: none; color: var(--ink-3); cursor: pointer; font-family: inherit; font-size: 1em; padding: 0.4em 0.6em; font-weight: 600; }
.tut-skip:hover { color: var(--brand); }
.tut-body { width: 100%; display: flex; flex-direction: column; gap: 1.1em; align-items: center; flex: 1 1 auto; min-height: 0; overflow: auto; }
.tut-title { font-size: 1.3em; font-weight: 700; color: var(--brand); flex-shrink: 0; }
.tut-demo { width: 100%; height: 26em; max-height: 52vh; display: flex; align-items: center; justify-content: center; padding: 1em; background: #f6f8fd; border-radius: 14px; border: 1px solid var(--line); overflow: hidden; flex-shrink: 0; }
.tut-demo .mirror-stage { max-width: 100%; height: 100%; gap: 0.8em; }
.tut-demo .grid-panel { gap: 0.5em; padding: 0.1em; }
.tut-demo .panel-title { font-size: 0.85em; }
.tut-caption { color: var(--ink-2); line-height: 1.7; text-align: center; max-width: 36em; font-size: 1.05em; }
.tut-nav { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.4em; flex-shrink: 0; }
.tut-dots { display: flex; gap: 0.4em; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--line-2); transition: all 0.3s; }
.dot.active { background: var(--brand); width: 26px; border-radius: 5px; }
.demo-correct { border-color: var(--ok) !important; background: #dcfce7 !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.18); }
.demo-hint { border-color: var(--brand) !important; background: var(--brand-soft) !important; }
.pulse-dot { width: 48%; height: 48%; border-radius: 50%; background: var(--brand); box-shadow: 0 0 0 6px rgba(59,110,255,0.15); animation: pulseHint 1s ease-in-out infinite; }
@keyframes pulseHint { 0%,100% { transform: scale(0.85); opacity: 0.7; } 50% { transform: scale(1.05); opacity: 1; } }

/* Result */
.result { align-items: center; justify-content: center; }
.result-card {
  padding: 2em 2.4em 1.6em; max-width: 44em; width: 100%;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; gap: 1.1em; align-items: center;
  /* Cap the card to visible viewport; inner .result-body scrolls if needed,
     leaving .result-actions pinned to the bottom of the card. */
  max-height: calc(var(--app-h, 100dvh) - 3em);
  overflow: hidden;
}
.result-body {
  width: 100%;
  display: flex; flex-direction: column; gap: 1.1em; align-items: center;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}
.result-badge { flex-shrink: 0; width: 5.2em; height: 5.2em; display: grid; place-items: center; border-radius: 50%; background: var(--brand-soft); border: 1px solid #d0defc; color: var(--brand); }
.result-badge svg circle, .result-badge svg path { stroke: currentColor; }
.result-card h2 { font-size: 2em; font-weight: 700; flex-shrink: 0; }
.result-score { text-align: center; flex-shrink: 0; }
.rs-label { color: var(--ink-3); letter-spacing: 0.25em; text-transform: uppercase; font-size: 0.95em; font-weight: 600; }
.rs-val { font-size: 5em; font-weight: 800; color: var(--brand); line-height: 1; margin-top: 0.2em; }
.result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1em; width: 100%; flex-shrink: 0; }
.rstat { padding: 1.1em; background: #f6f8fd; border: 1px solid var(--line); border-radius: 12px; text-align: center; }
.rstat .v { font-size: 1.7em; font-weight: 800; color: var(--ink); }
.rstat .v.ok { color: var(--ok); }
.rstat .v.bad { color: var(--bad); }
.rstat .l { color: var(--ink-3); font-size: 0.9em; letter-spacing: 0.1em; margin-top: 0.25em; text-transform: uppercase; font-weight: 600; }
.result-actions { display: flex; gap: 1em; margin-top: 0.4em; flex-shrink: 0; }

/* Transitions — pure fade (no scale/transform to avoid layout shift) */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
.fade-scale-enter-active, .fade-scale-leave-active { transition: opacity 0.22s ease; }
.fade-scale-enter, .fade-scale-leave-to { opacity: 0; }
/* Anchor every screen (home / history / duration / playing / result) to fill
   #app absolutely. This way whichever one is mounted always occupies the same
   box, and swapping between them cannot change the outer layout — no shake. */
.home, .page, .game {
  position: absolute;
  inset: 0;
}
.pop-enter-active { transition: all 0.3s cubic-bezier(.34,1.56,.64,1); }
.pop-leave-active { transition: all 0.2s; }
.pop-enter, .pop-leave-to { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }

/* Responsive */
@media (max-width: 820px) {
  #app { font-size: clamp(14px, 3.4vw, 18px); }
  .hud { grid-template-columns: 1fr; gap: 0.8em; }
  .hud-center { order: -1; }
  .hud-right { justify-content: center; }
  .brand-title { font-size: 2.8em; }
  .thead, .trow { font-size: 0.8em; padding: 0.7em 0.6em; }
  .duration-grid { flex-direction: column; }
  .dur-card { width: 100%; padding: 1.4em; }
  .result-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Short viewports (landscape tablet browsers with the URL bar visible).
   Shrink big display elements so buttons / footers never get pushed off. */
@media (max-height: 760px) {
  #app { font-size: clamp(13px, 1.15vmin + 0.4vmax, 18px); }
  .home { gap: 1.4em; padding: 1em; }
  .brand { gap: 0.4em; }
  .brand-logo { width: 4.6em; height: 4.6em; }
  .brand-title { font-size: 2.8em; }
  .brand-subtitle { font-size: 0.95em; letter-spacing: 0.25em; }
  .brand-tag { font-size: 0.95em; }
  .home-actions { gap: 0.6em; min-width: 16em; }
  .home-actions .btn { font-size: 1em; padding: 0.7em 1.4em; min-width: 15em; }
  .home-actions .btn-primary { font-size: 1.05em; padding: 0.8em 1.6em; }
  .home-foot { display: none; }

  .result-card { padding: 1.4em 1.8em 1.2em; gap: 0.8em; }
  .result-card h2 { font-size: 1.55em; }
  .result-badge { width: 3.8em; height: 3.8em; }
  .rs-val { font-size: 3.2em; }
  .rs-label { font-size: 0.8em; }
  .rstat { padding: 0.7em; }
  .rstat .v { font-size: 1.3em; }
  .rstat .l { font-size: 0.75em; }

  .modal { padding: 1.4em 1.6em 1.2em; gap: 0.7em; }
  .modal h3 { font-size: 1.25em; }
  .modal-icon { font-size: 2.2em; }

  .tut-demo { height: 20em; max-height: 44vh; padding: 0.6em; }
  .tut-title { font-size: 1.1em; }
  .tut-caption { font-size: 0.95em; line-height: 1.5; }
}
</style>
