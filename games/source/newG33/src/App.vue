<template>
  <div id="app" :class="['app', 'lang-' + i18n.state.lang]">
    <!-- Language switch (hidden during game, per spec) -->
    <button v-if="showLangSwitch" class="lang-btn" @click="toggleLang">
      <span :class="{ active: i18n.state.lang === 'zh' }">{{ t('langZh') }}</span>
      <span class="sep">/</span>
      <span :class="{ active: i18n.state.lang === 'en' }">{{ t('langEn') }}</span>
    </button>

    <!-- ============ HOME ============ -->
    <transition name="fade">
      <section v-if="view === 'home'" class="view home">
        <div class="brand">
          <div class="brand-logo">
            <svg viewBox="0 0 64 64" width="100%" height="100%">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="100%" stop-color="#6366f1"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#lg)"/>
              <path d="M14 40 L32 20 L50 40 Z" fill="#fff" opacity="0.95"/>
              <circle cx="32" cy="34" r="4" fill="#6366f1"/>
            </svg>
          </div>
          <h1 class="brand-title">{{ t('appTitle') }}</h1>
          <p class="brand-subtitle">{{ t('appSubtitle') }}</p>
        </div>
        <div class="home-buttons">
          <button class="btn btn-primary big" @click="onStart">
            <span class="btn-ic">▶</span>{{ t('btnStart') }}
          </button>
          <button class="btn btn-secondary big" @click="view = 'rules'">
            <span class="btn-ic">?</span>{{ t('btnRules') }}
          </button>
          <button class="btn btn-secondary big" @click="openHistory">
            <span class="btn-ic">📊</span>{{ t('btnHistory') }}
          </button>
        </div>
        <div class="home-foot">© Perspective Shift · Cognitive Training</div>
      </section>
    </transition>

    <!-- ============ RULES ============ -->
    <transition name="fade">
      <section v-if="view === 'rules'" class="view panel-view">
        <div class="panel">
          <div class="panel-head">
            <h2>{{ t('rulesTitle') }}</h2>
            <button class="icon-btn" @click="view = 'home'" :title="t('btnClose')">✕</button>
          </div>
          <ul class="rules-list">
            <li v-for="(line, i) in t('rulesBody')" :key="i">
              <span class="num">{{ i + 1 }}</span>
              <span>{{ line }}</span>
            </li>
          </ul>
          <div class="panel-foot">
            <button class="btn btn-primary" @click="view = 'home'">{{ t('btnBack') }}</button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ============ HISTORY ============ -->
    <transition name="fade">
      <section v-if="view === 'history'" class="view panel-view">
        <div class="panel wide">
          <div class="panel-head">
            <h2>{{ t('historyTitle') }}</h2>
            <div class="head-actions">
              <button class="btn btn-ghost small" @click="onClearHistory" v-if="history.length">
                {{ t('btnClear') }}
              </button>
              <button class="icon-btn" @click="view = 'home'" :title="t('btnClose')">✕</button>
            </div>
          </div>
          <div v-if="!history.length" class="empty">{{ t('historyEmpty') }}</div>
          <div v-else class="table-wrap">
            <table class="hist-table">
              <thead>
                <tr>
                  <th>{{ t('colTime') }}</th>
                  <th>{{ t('colGame') }}</th>
                  <th>{{ t('colDiff') }}</th>
                  <th>{{ t('colDuration') }}</th>
                  <th>{{ t('colTotal') }}</th>
                  <th>{{ t('colSuccess') }}</th>
                  <th>{{ t('colFail') }}</th>
                  <th>{{ t('colRate') }}</th>
                  <th>{{ t('colAvgRt') }}</th>
                  <th>{{ t('colScore') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in history" :key="i">
                  <td>{{ formatDateTime(r.time) }}</td>
                  <td>{{ t('appTitle') }}</td>
                  <td>Lv.{{ r.finalLevel }}</td>
                  <td>{{ r.duration }} {{ t('durMin') }}</td>
                  <td>{{ r.total }}</td>
                  <td class="ok">{{ r.correct }}</td>
                  <td class="bad">{{ r.wrong }}</td>
                  <td>{{ r.total ? ((r.correct / r.total) * 100).toFixed(0) : 0 }}%</td>
                  <td>{{ r.avgRt }} {{ t('ms') }}</td>
                  <td class="score">{{ r.score }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="panel-foot">
            <button class="btn btn-primary" @click="view = 'home'">{{ t('btnBack') }}</button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ============ TUTORIAL ============ -->
    <transition name="fade">
      <section v-if="view === 'tutorial'" class="view panel-view">
        <div class="panel tutorial">
          <div class="panel-head">
            <h2>{{ t('tutTitle') }}</h2>
            <button class="btn btn-ghost small" @click="onTutorialDone">{{ t('tutSkip') }}</button>
          </div>
          <div class="tut-stage">
            <div class="tut-scene">
              <Scene :question="tutQuestion" :t="t" />
            </div>
            <div class="tut-caption">{{ t('tutStep' + tutStep) }}</div>
            <div class="tut-options">
              <button
                v-for="d in tutQuestion.options" :key="d"
                :class="['opt', tutStep >= 3 && d === tutQuestion.correctDir ? 'opt-correct' : '']"
                disabled>
                {{ t(dirLabel(d)) }}
              </button>
            </div>
          </div>
          <div class="panel-foot spread">
            <button class="btn btn-secondary" :disabled="tutStep === 1" @click="tutStep -= 1">
              {{ t('tutPrev') }}
            </button>
            <div class="dots">
              <span v-for="n in 4" :key="n" :class="['dot', { active: tutStep === n }]"></span>
            </div>
            <button v-if="tutStep < 4" class="btn btn-primary" @click="tutStep += 1">
              {{ t('tutNext') }}
            </button>
            <button v-else class="btn btn-primary" @click="onTutorialDone">
              {{ t('tutStart') }}
            </button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ============ DURATION SELECT ============ -->
    <transition name="fade">
      <section v-if="view === 'duration'" class="view panel-view">
        <div class="panel">
          <div class="panel-head">
            <h2>{{ t('durTitle') }}</h2>
            <button class="icon-btn" @click="view = 'home'" :title="t('btnClose')">✕</button>
          </div>
          <div class="dur-grid">
            <button
              v-for="m in [1, 3, 5]" :key="m"
              :class="['dur-card', { active: selectedDuration === m }]"
              @click="selectedDuration = m">
              <div class="dur-num">{{ m }}</div>
              <div class="dur-unit">{{ t('durMin') }}</div>
            </button>
          </div>
          <div class="panel-foot spread">
            <button class="btn btn-secondary" @click="view = 'home'">{{ t('btnBack') }}</button>
            <button class="btn btn-primary" @click="beginGame">{{ t('durStart') }}</button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ============ GAME ============ -->
    <transition name="fade">
      <section v-if="view === 'game'" class="view game-view">
        <!-- Full-screen scene as background -->
        <div class="scene-fill">
          <Scene v-if="q" :question="q" :t="t" />
        </div>

        <!-- Top HUD (floating glass) -->
        <div class="hud">
          <div class="hud-left">
            <div class="hud-chip">
              <span class="chip-label">{{ t('hudDiff') }}</span>
              <span class="chip-value">Lv.{{ currentLevel }}</span>
              <span class="chip-sub">×{{ currentCoeff.toFixed(1) }}</span>
            </div>
            <div class="hud-chip">
              <span class="chip-label">{{ t('hudScore') }}</span>
              <span class="chip-value score-num">{{ score }}</span>
            </div>
            <div class="hud-chip" :class="{ warn: timeLeft <= 10 }">
              <span class="chip-label">{{ t('hudTime') }}</span>
              <span class="chip-value">{{ formatTime(timeLeft) }}</span>
            </div>
          </div>
          <div class="hud-center">
            <div class="qtext">
              <span v-if="q">
                {{ t('qFromPerspective', { who: t(q.askCharKey) }) }}，{{ t('qWhereIs', { item: t(q.askItem.key) }) }}
              </span>
            </div>
          </div>
          <div class="hud-right">
            <button v-if="showBatchSkip" class="btn btn-ghost" @click="onBatchSkip">{{ t('btnSkipGame') }}</button>
            <button class="btn btn-ghost" @click="onPause">{{ t('btnBack') }}</button>
          </div>
        </div>

        <!-- Options (floating at bottom) -->
        <div class="options-dock">
          <div class="options">
            <button
              v-for="d in (q ? q.options : [])" :key="d"
              :class="['opt-btn', feedback && d === feedback.correct ? 'opt-correct' : '',
                                  feedback && feedback.picked === d && d !== feedback.correct ? 'opt-wrong' : '']"
              :disabled="!!feedback"
              @click="answer(d)">
              {{ t(dirLabel(d)) }}
            </button>
          </div>
        </div>

        <!-- Feedback toast -->
        <transition name="pop">
          <div v-if="feedback" :class="['feedback', feedback.ok ? 'ok' : 'bad']">
            <div class="fb-icon">{{ feedback.ok ? '✓' : '✕' }}</div>
            <div class="fb-text">
              {{ feedback.ok ? t('correct') : t('wrong') }}
              <span v-if="!feedback.ok" class="fb-sub">
                {{ t('correctAnswer', { ans: t(dirLabel(feedback.correct)) }) }}
              </span>
            </div>
          </div>
        </transition>

        <!-- Pause overlay -->
        <transition name="fade">
          <div v-if="paused" class="modal-mask" @click.self="onResume">
            <div class="modal">
              <h3>{{ t('pauseTitle') }}</h3>
              <p>{{ t('pauseTip') }}</p>
              <div class="modal-actions">
                <button class="btn btn-secondary" @click="onResume">{{ t('btnCancel') }}</button>
                <button class="btn btn-primary danger" @click="endGame(true)">{{ t('btnEnd') }}</button>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </transition>

    <!-- ============ RESULT ============ -->
    <transition name="fade">
      <section v-if="view === 'result'" class="view panel-view">
        <div class="panel result">
          <div class="result-head">
            <h2>{{ t('resultTitle') }}</h2>
            <div class="badge">{{ t('saved') }}</div>
          </div>
          <div class="result-score-wrap">
            <div class="result-score-label">{{ t('resultScore') }}</div>
            <div class="result-score-value">{{ lastRun.score }}</div>
          </div>
          <div class="result-grid">
            <div class="rcard"><div class="rk">{{ t('resultTotal') }}</div><div class="rv">{{ lastRun.total }}</div></div>
            <div class="rcard"><div class="rk">{{ t('resultCorrect') }}</div><div class="rv ok">{{ lastRun.correct }}</div></div>
            <div class="rcard"><div class="rk">{{ t('resultWrong') }}</div><div class="rv bad">{{ lastRun.wrong }}</div></div>
            <div class="rcard"><div class="rk">{{ t('resultRate') }}</div>
              <div class="rv">{{ lastRun.total ? ((lastRun.correct / lastRun.total) * 100).toFixed(0) : 0 }}%</div>
            </div>
            <div class="rcard"><div class="rk">{{ t('resultAvgRt') }}</div><div class="rv">{{ lastRun.avgRt }} {{ t('ms') }}</div></div>
            <div class="rcard"><div class="rk">{{ t('colDiff') }}</div><div class="rv">Lv.{{ lastRun.finalLevel }}</div></div>
          </div>
          <div class="panel-foot spread">
            <button class="btn btn-secondary" @click="view = 'home'">{{ t('btnHome') }}</button>
            <button class="btn btn-primary" @click="onStart">{{ t('btnReplay') }}</button>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
import Scene from './components/Scene.vue'
import { createI18n } from './i18n.js'
import { voice } from './voice.js'
import {
  DIFFICULTY, generateQuestion, AdaptiveTracker,
  loadHistory, saveHistoryRecord, clearHistory, formatDateTime,
  DIR_LABEL,
} from './game.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'sjzh' // 视角转换 gameType

const i18n = createI18n('zh')

export default {
  name: 'App',
  components: { Scene },
  data() {
    return {
      i18n,
      view: 'home',
      selectedDuration: 3,
      tracker: null,
      q: null,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      totalCount: 0,
      reactionSum: 0,
      questionStartAt: 0,
      timeLeft: 0,
      totalSeconds: 0,
      _mainTimer: null,
      _windowElapsed: 0,
      feedback: null,
      paused: false,
      tutStep: 1,
      tutQuestion: null,
      history: [],
      lastRun: {},
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    }
  },
  computed: {
    currentLevel() { return this.tracker ? this.tracker.level : 1 },
    currentCoeff() { return DIFFICULTY[this.currentLevel - 1].coeff },
    showLangSwitch() { return this.view !== 'game' },
  },
  created() {
    this.tutQuestion = this.buildTutQuestion()
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.selectedDuration = dur },
      openTutorial: () => { this.onStart() },
    })
  },
  methods: {
    t(k, p) { return this.i18n.t(k, p) },
    dirLabel(d) { return DIR_LABEL[d] },
    dirAngle(d) {
      // 8-way clockwise from front (up). front=0°, right=90°, back=180°, left=270°.
      const map = { front: 0, frontRight: 45, right: 90, backRight: 135, back: 180, backLeft: 225, left: 270, frontLeft: 315 }
      return map[d] || 0
    },
    toggleLang() {
      this.i18n.setLang(this.i18n.state.lang === 'zh' ? 'en' : 'zh')
      this.$forceUpdate()
    },
    formatTime(s) {
      const m = Math.floor(s / 60)
      const r = s % 60
      return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    },
    formatDateTime,
    onStart() {
      this.tutStep = 1
      this.tutQuestion = this.buildTutQuestion()
      this.view = 'tutorial'
    },
    finishTutorial() { this.onTutorialDone() },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => {
        this.selectedDuration = dur
        this.beginGame()
      })) return
      this.view = 'duration'
    },
    openHistory() {
      this.history = loadHistory()
      this.view = 'history'
    },
    onClearHistory() {
      if (confirm(this.t('confirmClear'))) {
        clearHistory()
        this.history = []
      }
    },
    beginGame() {
      this.tracker = new AdaptiveTracker(getBatchStartDifficultyForGame(GAME_TYPE))
      this.score = 0
      this.correctCount = 0
      this.wrongCount = 0
      this.totalCount = 0
      this.reactionSum = 0
      this.totalSeconds = this.selectedDuration * 60
      this.timeLeft = this.totalSeconds
      this._windowElapsed = 0
      this.feedback = null
      this.paused = false
      this.nextQuestion()
      this.view = 'game'
      this.startTimers()
    },
    startTimers() {
      this.stopTimers()
      this._mainTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft -= 1
        this._windowElapsed += 1
        if (this._windowElapsed >= 60) {
          this._windowElapsed = 0
          this.tracker.tick()
        }
        if (this.timeLeft <= 0) this.endGame(false)
      }, 1000)
    },
    stopTimers() {
      if (this._mainTimer) clearInterval(this._mainTimer)
      this._mainTimer = null
    },
    nextQuestion() {
      this.feedback = null
      this.q = generateQuestion(this.tracker.level)
      this.questionStartAt = Date.now()
      // Play voice prompt: role clip, then item clip.
      voice.playQuestion(this.i18n.state.lang, this.q.askCharKey, this.q.askItem.key)
    },
    answer(dir) {
      if (this.feedback || this.paused) return
      const rt = Date.now() - this.questionStartAt
      const ok = dir === this.q.correctDir
      this.reactionSum += rt
      this.totalCount += 1
      if (ok) {
        this.correctCount += 1
        this.score += Math.round(5 * this.q.coeff)
      } else {
        this.wrongCount += 1
      }
      this.tracker.record(ok)
      this.feedback = { ok, picked: dir, correct: this.q.correctDir }
      setTimeout(() => {
        if (this.view === 'game' && this.timeLeft > 0 && !this.paused) this.nextQuestion()
      }, ok ? 700 : 1200)
    },
    onPause() { this.paused = true; voice.stop() },
    onResume() { this.paused = false },
    onSkipGame() {
      // 保留：跳过当前题（非批次跳过）
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    endGame(early) {
      this.stopTimers()
      voice.stop()
      // 中途返回：关窗，不上传、不进结果页（与其他平板游戏一致）
      if (early) {
        this.paused = false
        this.feedback = null
        leavePbGameWindow({ confirm: false })
        return
      }
      const avgRt = this.totalCount ? Math.round(this.reactionSum / this.totalCount) : 0
      const record = {
        time: Date.now(),
        duration: this.selectedDuration,
        finalLevel: this.tracker.level,
        total: this.totalCount,
        correct: this.correctCount,
        wrong: this.wrongCount,
        score: this.score,
        avgRt,
        early: false,
      }
      saveHistoryRecord(record)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(avgRt),
        score: this.score || 0,
        successCount: this.correctCount,
        failCount: this.wrongCount,
        trainDuration: this.selectedDuration,
        difficultyLevel: this.tracker.level,
      })
      this.lastRun = record
      this.paused = false
      this.feedback = null
      this.view = 'result'
    },
    buildTutQuestion() { return generateQuestion(2) },
  },
  beforeDestroy() { this.stopTimers(); voice.stop() },
}
</script>

<style>
:root {
  --bg-a: #eef2ff;
  --bg-b: #dbeafe;
  --ink: #0f172a;
  --ink-dim: #475569;
  --ink-soft: #64748b;
  --card: #ffffff;
  --brand: #6366f1;
  --brand-2: #38bdf8;
  --accent: #f59e0b;
  --ok: #10b981;
  --bad: #ef4444;
  --line: rgba(15, 23, 42, 0.08);
  --shadow: 0 1.4vmin 4vmin rgba(30, 41, 59, 0.15);
  --radius: 1.8vmin;
  --radius-sm: 1.1vmin;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  font-size: 2vmin;
  line-height: 1.5;
}
.app {
  position: relative; width: 100vw; height: 100vh; overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(99,102,241,0.18), transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(56,189,248,0.18), transparent 55%),
    linear-gradient(135deg, #eef2ff, #e0f2fe);
}
.view {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 2.4vmin;
}
.fade-enter-active, .fade-leave-active { transition: opacity .35s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
.pop-enter-active { transition: all .28s cubic-bezier(.2,1.2,.4,1); }
.pop-leave-active { transition: all .2s ease; }
.pop-enter { transform: translate(-50%, -60%) scale(.85); opacity: 0; }
.pop-leave-to { transform: translate(-50%, -50%) scale(.9); opacity: 0; }

/* Language switch */
.lang-btn {
  position: absolute; top: 2.4vmin; right: 2.4vmin; z-index: 20;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
  border: 1px solid var(--line); border-radius: 999px;
  padding: 0.9vmin 1.8vmin; font-size: 1.8vmin; color: var(--ink-dim);
  cursor: pointer; box-shadow: var(--shadow);
  transition: transform .15s ease;
}
.lang-btn:hover { transform: translateY(-1px); }
.lang-btn .active { color: var(--brand); font-weight: 700; }
.lang-btn .sep { margin: 0 0.6vmin; color: var(--ink-soft); }

/* Buttons */
.btn {
  border: none; cursor: pointer; user-select: none;
  padding: 1.4vmin 3vmin; border-radius: 999px;
  font-size: 2vmin; font-weight: 600;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
  display: inline-flex; align-items: center; gap: 0.8vmin;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-2px); }
.btn:not(:disabled):active { transform: translateY(0); }
.btn.big { padding: 1.8vmin 4.5vmin; font-size: 2.4vmin; min-width: 30vmin; justify-content: center; }
.btn.small { padding: 0.8vmin 1.8vmin; font-size: 1.6vmin; }
.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  box-shadow: 0 1vmin 2.4vmin rgba(99,102,241,0.35);
}
.btn-primary.danger {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1vmin 2.4vmin rgba(239,68,68,0.35);
}
.btn-secondary {
  background: #fff; color: var(--ink); border: 1px solid var(--line);
  box-shadow: 0 0.6vmin 1.6vmin rgba(15,23,42,0.06);
}
.btn-ghost {
  background: rgba(255,255,255,0.7); color: var(--ink-dim);
  border: 1px solid var(--line);
}
.btn-ic {
  width: 2.4vmin; height: 2.4vmin; border-radius: 50%;
  background: rgba(255,255,255,0.18); display: inline-flex;
  align-items: center; justify-content: center; font-size: 1.6vmin;
}
.btn-secondary .btn-ic { background: rgba(99,102,241,0.12); color: var(--brand); }
.icon-btn {
  width: 4vmin; height: 4vmin; border-radius: 50%;
  background: rgba(15,23,42,0.06); border: none; cursor: pointer;
  color: var(--ink-dim); font-size: 2vmin;
}
.icon-btn:hover { background: rgba(15,23,42,0.12); }
.head-actions { display: flex; gap: 1vmin; align-items: center; }

/* HOME */
.home { flex-direction: column; gap: 4vmin; }
.brand { text-align: center; }
.brand-logo {
  width: 14vmin; height: 14vmin; margin: 0 auto 1.6vmin;
  filter: drop-shadow(0 1.4vmin 2.4vmin rgba(99,102,241,0.35));
}
.brand-title {
  font-size: 6.4vmin; font-weight: 800; letter-spacing: 0.4vmin;
  background: linear-gradient(135deg, #38bdf8, #6366f1 60%, #a855f7);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.brand-subtitle {
  font-size: 2.2vmin; color: var(--ink-dim); margin-top: 0.8vmin; letter-spacing: 0.2vmin;
}
.home-buttons { display: flex; flex-direction: column; gap: 1.6vmin; }
.home-foot {
  position: absolute; bottom: 2vmin; font-size: 1.5vmin; color: var(--ink-soft);
  letter-spacing: 0.2vmin;
}

/* Panels */
.panel-view { align-items: center; justify-content: center; }
.panel {
  width: min(88vw, 100vmin); max-height: 92vh;
  background: var(--card); border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex; flex-direction: column; overflow: hidden;
}
.panel.wide { width: min(94vw, 160vmin); }
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2.4vmin 3vmin; border-bottom: 1px solid var(--line);
}
.panel-head h2 { font-size: 3vmin; font-weight: 700; color: var(--ink); }
.panel-foot {
  padding: 2vmin 3vmin; display: flex; justify-content: center; gap: 1.6vmin;
  border-top: 1px solid var(--line);
}
.panel-foot.spread { justify-content: space-between; align-items: center; }
.rules-list {
  list-style: none; padding: 2.4vmin 3vmin; display: flex; flex-direction: column; gap: 1.8vmin;
  font-size: 2vmin; color: var(--ink-dim); line-height: 1.7;
}
.rules-list li { display: flex; gap: 1.6vmin; align-items: flex-start; }
.rules-list .num {
  flex-shrink: 0;
  width: 3vmin; height: 3vmin; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  color: #fff; font-size: 1.6vmin; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  margin-top: 0.3vmin;
}

/* History */
.table-wrap { overflow: auto; padding: 1vmin 2vmin; }
.hist-table { width: 100%; border-collapse: collapse; font-size: 1.7vmin; }
.hist-table th, .hist-table td {
  padding: 1.2vmin 1vmin; text-align: center; border-bottom: 1px solid var(--line);
}
.hist-table th { background: rgba(99,102,241,0.06); color: var(--ink-dim); font-weight: 600; }
.hist-table td.ok { color: var(--ok); font-weight: 700; }
.hist-table td.bad { color: var(--bad); font-weight: 700; }
.hist-table td.score { color: var(--brand); font-weight: 800; }
.empty { padding: 6vmin; text-align: center; color: var(--ink-soft); font-size: 2vmin; }

/* Duration */
.dur-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2vmin; padding: 3vmin;
}
.dur-card {
  border: 2px solid var(--line);
  background: linear-gradient(180deg, #fff, #f8fafc);
  border-radius: var(--radius);
  padding: 4vmin 2vmin; cursor: pointer;
  transition: all .2s ease;
  display: flex; flex-direction: column; align-items: center; gap: 0.6vmin;
}
.dur-card:hover { transform: translateY(-3px); border-color: var(--brand-2); }
.dur-card.active {
  border-color: var(--brand);
  background: linear-gradient(180deg, #eef2ff, #e0e7ff);
  box-shadow: 0 1.6vmin 3.2vmin rgba(99,102,241,0.25);
}
.dur-num { font-size: 8vmin; font-weight: 800; color: var(--brand); line-height: 1; }
.dur-unit { font-size: 2vmin; color: var(--ink-dim); }

/* Tutorial */
.panel.tutorial { width: min(92vw, 130vmin); }
.tut-stage {
  padding: 2vmin 3vmin;
  display: flex; flex-direction: column; align-items: center; gap: 1.6vmin;
}
.tut-scene { width: 100%; height: 46vh; }
.tut-caption {
  font-size: 2.2vmin; color: var(--ink); font-weight: 500;
  text-align: center; padding: 1vmin 2vmin;
  background: rgba(99,102,241,0.08); border-radius: var(--radius-sm);
}
.tut-options {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2vmin;
  width: min(90%, 80vmin);
}
.opt {
  padding: 1.4vmin; border-radius: var(--radius-sm);
  border: 2px solid var(--line); background: #fff;
  font-size: 1.8vmin; font-weight: 600; color: var(--ink-dim);
  cursor: default;
}
.opt.opt-correct { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-color: var(--ok); color: #065f46; }
.dots { display: flex; gap: 0.8vmin; }
.dot { width: 1vmin; height: 1vmin; border-radius: 50%; background: var(--line); transition: all .2s; }
.dot.active { background: var(--brand); transform: scale(1.4); }

/* GAME — full-screen with dedicated middle scene band */
.game-view {
  padding: 0;
  display: flex;
  flex-direction: column;
}
.scene-fill {
  position: absolute;
  top: calc(2vmin + 8vmin);      /* below HUD */
  left: 2vmin;
  right: 2vmin;
  bottom: calc(2vmin + 14vmin);  /* above options dock */
  z-index: 1;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.hud {
  position: absolute; top: 2vmin; left: 2vmin; right: 2vmin; z-index: 10;
  display: grid; grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 1.4vmin 2vmin;
  background: rgba(255,255,255,0.82); backdrop-filter: blur(14px);
  border-radius: var(--radius); box-shadow: var(--shadow);
  gap: 1.6vmin;
  border: 1px solid rgba(255,255,255,0.7);
}
.hud-left { display: flex; gap: 1.2vmin; }
.hud-right { display: flex; gap: 1vmin; justify-content: flex-end; }
.hud-chip {
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  padding: 1vmin 1.6vmin; display: flex; align-items: baseline; gap: 0.6vmin;
  min-width: 12vmin;
}
.hud-chip.warn { background: linear-gradient(135deg, #fef3c7, #fee2e2); border-color: #f87171; }
.hud-chip.warn .chip-value { color: var(--bad); animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: 0.5; } }
.chip-label { font-size: 1.5vmin; color: var(--ink-soft); }
.chip-value { font-size: 2.4vmin; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.chip-value.score-num { color: var(--brand); }
.chip-sub { font-size: 1.4vmin; color: var(--accent); font-weight: 600; }
.qtext {
  text-align: center; font-size: 3vmin; font-weight: 800; color: var(--ink);
  padding: 1.2vmin 2vmin;
  background: linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15));
  border-radius: var(--radius-sm);
  border: 1px solid rgba(99,102,241,0.15);
}
.options-dock {
  position: absolute; left: 2vmin; right: 2vmin; bottom: 2vmin; z-index: 10;
  padding: 1.6vmin 2vmin;
  background: rgba(255,255,255,0.82); backdrop-filter: blur(14px);
  border-radius: var(--radius); box-shadow: var(--shadow);
  border: 1px solid rgba(255,255,255,0.7);
}
.options {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.4vmin;
}
.opt-btn {
  position: relative;
  padding: 2.8vmin 1.2vmin;
  border-radius: var(--radius-sm);
  border: 2px solid var(--line);
  background: linear-gradient(180deg, #fff, #f8fafc);
  font-size: 3.6vmin; font-weight: 800; color: var(--ink);
  letter-spacing: 0.2vmin;
  cursor: pointer; transition: all .15s ease;
  display: flex; align-items: center; justify-content: center; gap: 1vmin;
  box-shadow: 0 0.6vmin 1.4vmin rgba(15,23,42,0.06);
}
.opt-btn:not(:disabled):hover {
  transform: translateY(-3px);
  border-color: var(--brand-2);
  box-shadow: 0 1.2vmin 2.4vmin rgba(56,189,248,0.25);
}
.opt-btn:disabled { cursor: not-allowed; }
.opt-btn.opt-correct {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
  border-color: var(--ok); color: #064e3b;
  animation: correctPulse .5s ease;
}
.opt-btn.opt-wrong {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  border-color: var(--bad); color: #7f1d1d;
  animation: shake .4s ease;
}
@keyframes correctPulse { 50% { transform: scale(1.05); } }
@keyframes shake {
  20% { transform: translateX(-6px); } 40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); } 80% { transform: translateX(4px); }
}
.opt-arrow { display: none; }

.feedback {
  position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%);
  padding: 2vmin 3.4vmin; border-radius: var(--radius);
  color: #fff; display: flex; align-items: center; gap: 1.6vmin;
  z-index: 40; box-shadow: 0 2vmin 4vmin rgba(0,0,0,0.25);
  font-size: 2.4vmin; font-weight: 700;
}
.feedback.ok { background: linear-gradient(135deg, #10b981, #059669); }
.feedback.bad { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.fb-icon {
  width: 4.4vmin; height: 4.4vmin; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center; font-size: 3vmin;
}
.fb-sub { display: block; font-size: 1.7vmin; font-weight: 500; opacity: 0.9; margin-top: 0.2vmin; }

/* Modal */
.modal-mask {
  position: absolute; inset: 0;
  background: rgba(15,23,42,0.55); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #fff; border-radius: var(--radius);
  padding: 3.4vmin 4vmin; min-width: 40vmin; max-width: 80vmin;
  box-shadow: var(--shadow); text-align: center;
}
.modal h3 { font-size: 3vmin; margin-bottom: 1.2vmin; color: var(--ink); }
.modal p { color: var(--ink-dim); font-size: 1.9vmin; margin-bottom: 2.4vmin; }
.modal-actions { display: flex; gap: 1.2vmin; justify-content: center; flex-wrap: wrap; }

/* Result */
.result-head {
  padding: 2.4vmin 3vmin; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--line);
}
.result-head h2 {
  font-size: 3.2vmin;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.badge {
  padding: 0.4vmin 1.4vmin; background: #dcfce7; color: #065f46;
  border-radius: 999px; font-size: 1.5vmin; font-weight: 600;
}
.result-score-wrap { text-align: center; padding: 3vmin; }
.result-score-label { font-size: 1.8vmin; color: var(--ink-soft); letter-spacing: 0.3vmin; }
.result-score-value {
  font-size: 10vmin; font-weight: 900; line-height: 1;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 1vmin 2vmin rgba(245,158,11,0.35));
}
.result-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4vmin;
  padding: 0 3vmin 2vmin;
}
.rcard {
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  border-radius: var(--radius-sm);
  padding: 1.6vmin; text-align: center;
  border: 1px solid var(--line);
}
.rk { font-size: 1.5vmin; color: var(--ink-soft); }
.rv { font-size: 3vmin; font-weight: 800; color: var(--ink); margin-top: 0.4vmin; font-variant-numeric: tabular-nums; }
.rv.ok { color: var(--ok); }
.rv.bad { color: var(--bad); }

@media (max-width: 640px) {
  .hud { grid-template-columns: 1fr; }
  .hud-right { justify-content: center; }
  .options { grid-template-columns: repeat(2, 1fr); }
  .result-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
