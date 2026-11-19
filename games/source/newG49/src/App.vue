<template>
  <div id="app" :class="['view-'+view, 'lang-'+i18n.lang]">
    <!-- SCALE WRAPPER: keeps a 16:9 stage fully visible in any window -->
    <div class="stage-wrap">
      <div class="stage" :style="stageStyle">

        <!-- LANGUAGE TOGGLE (hidden in-game) -->
        <button v-if="langBtnVisible" class="lang-toggle" @click="toggleLang">
          <span>{{ i18n.lang === 'zh' ? 'EN' : '中文' }}</span>
        </button>

        <!-- ================= HOME ================= -->
        <section v-if="view==='home'" class="home">
          <div class="home-bg">
            <div class="glow-orb a"></div><div class="glow-orb b"></div><div class="glow-orb c"></div>
          </div>
          <div class="home-panel">
            <div class="home-logo">
              <svg viewBox="0 0 200 200" width="140" height="140">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff6b3d"/><stop offset="100%" stop-color="#ffb84d"/>
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="86" fill="#fff5e8" stroke="url(#lg1)" stroke-width="6"/>
                <path d="M60 130 Q80 60 100 60 Q120 60 140 130 Z" fill="url(#lg1)"/>
                <path d="M78 130 Q90 90 100 90 Q110 90 122 130 Z" fill="#fff2a8"/>
                <path d="M60 132 L140 132 L140 148 L60 148 Z" fill="#3d5a3a"/>
                <circle cx="100" cy="140" r="6" fill="#7cf58a"/>
              </svg>
            </div>
            <h1 class="title">{{ i18n.t('appTitle') }}</h1>
            <p class="subtitle">{{ i18n.t('subtitle') }}</p>
            <div class="home-buttons three">
              <button class="btn primary big" @click="goto('duration')">
                <span class="ic">▶</span> {{ i18n.t('startGame') }}
              </button>
              <button class="btn big" @click="goto('rules')">
                <span class="ic">📖</span> {{ i18n.t('rules') }}
              </button>
              <button class="btn big" @click="goto('history')">
                <span class="ic">📊</span> {{ i18n.t('history') }}
              </button>
            </div>
          </div>
        </section>

        <!-- ================= RULES ================= -->
        <section v-else-if="view==='rules'" class="pane">
          <div class="pane-card">
            <div class="pane-head">
              <h2>{{ i18n.t('rulesTitle') }}</h2>
              <button class="close" @click="goto('home')">✕</button>
            </div>
            <ol class="rules-list">
              <li v-for="(r,i) in i18n.t('rulesContent')" :key="i">{{ r }}</li>
            </ol>
          </div>
        </section>

        <!-- ================= HISTORY ================= -->
        <section v-else-if="view==='history'" class="pane">
          <div class="pane-card wide">
            <div class="pane-head">
              <h2>{{ i18n.t('historyTitle') }}</h2>
              <button class="close" @click="goto('home')">✕</button>
            </div>
            <div v-if="!history.length" class="empty">{{ i18n.t('noHistory') }}</div>
            <div v-else class="table-wrap">
              <table class="tbl">
                <thead><tr>
                  <th>{{ i18n.t('time') }}</th><th>{{ i18n.t('project') }}</th>
                  <th>{{ i18n.t('level') }}</th><th>{{ i18n.t('duration') }}</th>
                  <th>{{ i18n.t('total') }}</th><th>{{ i18n.t('success') }}</th>
                  <th>{{ i18n.t('fail') }}</th><th>{{ i18n.t('rate') }}</th>
                  <th>{{ i18n.t('reactTime') }}</th><th>{{ i18n.t('scoreCol') }}</th>
                </tr></thead>
                <tbody>
                  <tr v-for="(h,i) in history" :key="i">
                    <td>{{ h.time }}</td><td>{{ i18n.t('appTitle') }}</td>
                    <td>{{ h.finalLevel }}</td><td>{{ h.duration }}{{ i18n.t('seconds') }}</td>
                    <td>{{ h.total }}</td><td>{{ h.correct }}</td>
                    <td>{{ h.wrong }}</td>
                    <td>{{ h.total ? Math.round(h.correct*100/h.total) : 0 }}%</td>
                    <td>{{ h.avgRt }}s</td><td>{{ h.score }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- ================= DURATION SELECT ================= -->
        <section v-else-if="view==='duration'" class="pane">
          <div class="pane-card">
            <div class="pane-head">
              <h2>{{ i18n.t('chooseDuration') }}</h2>
              <button class="close" @click="goto('home')">✕</button>
            </div>
            <div class="duration-grid">
              <button class="dur-card" :class="{active: pendingDuration===180}" @click="pendingDuration = 180">
                <div class="dur-num">3</div><div class="dur-lbl">{{ i18n.t('threeMin') }}</div>
                <div v-if="pendingDuration===180" class="dur-check">✓</div>
              </button>
              <button class="dur-card featured" :class="{active: pendingDuration===300}" @click="pendingDuration = 300">
                <div class="dur-num">5</div><div class="dur-lbl">{{ i18n.t('fiveMin') }}</div>
                <div v-if="pendingDuration===300" class="dur-check">✓</div>
              </button>
              <button class="dur-card" :class="{active: pendingDuration===600}" @click="pendingDuration = 600">
                <div class="dur-num">10</div><div class="dur-lbl">{{ i18n.t('tenMin') }}</div>
                <div v-if="pendingDuration===600" class="dur-check">✓</div>
              </button>
            </div>
            <div class="pane-actions space">
              <button class="btn ghost" @click="goto('home')">{{ i18n.t('back') }}</button>
              <button class="btn primary" :disabled="!pendingDuration" @click="startGame(pendingDuration)">
                <span class="ic">▶</span> {{ i18n.t('startGame') }}
              </button>
            </div>
          </div>
        </section>

        <!-- ================= TUTORIAL ================= -->
        <section v-else-if="view==='tutorial'" class="pane">
          <div class="pane-card wide tutorial-card">
            <div class="pane-head">
              <h2>{{ i18n.t('tutorial') }} <span class="step-pill">{{ tutStep+1 }} / 4</span></h2>
              <button class="close" @click="finishTutorial">✕</button>
            </div>
            <div class="tut-stage">
              <div class="tut-scene">
                <KitchenScene :active-hazards="['oilFire']"/>
                <!-- step 0: just show hazard -->
                <div v-if="tutStep===0" class="tut-callout">
                  <div class="tut-badge">1</div>
                  <div>{{ i18n.t('tips.tutorialStep1') }}</div>
                </div>
                <!-- step 1: show question with options (pick mode demo) -->
                <div v-if="tutStep===1" class="tut-panel">
                  <div class="tut-panel-tag">{{ i18n.t('hazards.oilFire') }}</div>
                  <h3>{{ i18n.t('pickCorrect') }}</h3>
                  <div class="opt-list tut-opts">
                    <div class="opt-row">
                      <span class="opt-mark"></span>
                      <span class="opt-text">{{ i18n.lang==='zh' ? '用水浇灭' : 'Douse with water' }}</span>
                    </div>
                    <div class="opt-row">
                      <span class="opt-mark"></span>
                      <span class="opt-text">{{ i18n.lang==='zh' ? '盖上锅盖' : 'Put on the pot lid' }}</span>
                    </div>
                    <div class="opt-row">
                      <span class="opt-mark"></span>
                      <span class="opt-text">{{ i18n.lang==='zh' ? '移动油锅' : 'Move the oil pan' }}</span>
                    </div>
                  </div>
                </div>
                <!-- step 2: show the correct answer highlighted -->
                <div v-if="tutStep===2" class="tut-panel">
                  <div class="tut-panel-tag">{{ i18n.t('hazards.oilFire') }}</div>
                  <h3>{{ i18n.t('pickCorrect') }}</h3>
                  <div class="opt-list tut-opts">
                    <div class="opt-row">
                      <span class="opt-mark"></span>
                      <span class="opt-text">{{ i18n.lang==='zh' ? '用水浇灭' : 'Douse with water' }}</span>
                    </div>
                    <div class="opt-row picked right">
                      <span class="opt-mark"></span>
                      <span class="opt-text">✓ {{ i18n.lang==='zh' ? '盖上锅盖' : 'Put on the pot lid' }}</span>
                    </div>
                    <div class="opt-row">
                      <span class="opt-mark"></span>
                      <span class="opt-text">{{ i18n.lang==='zh' ? '移动油锅' : 'Move the oil pan' }}</span>
                    </div>
                  </div>
                </div>
                <!-- step 3: score animation -->
                <div v-if="tutStep===3" class="tut-score">
                  <div class="score-flash">+10</div>
                  <div class="score-lbl">{{ i18n.lang==='zh' ? '答对，得分 +10' : 'Correct! +10' }}</div>
                </div>
              </div>
            </div>
            <div class="pane-actions space">
              <button class="btn ghost" @click="finishTutorial">{{ i18n.t('skipTutorial') }}</button>
              <div class="btn-group">
                <button class="btn" :disabled="tutStep===0" @click="tutStep=Math.max(0,tutStep-1)">{{ i18n.t('prev') }}</button>
                <button class="btn primary" @click="tutStep < 3 ? tutStep++ : finishTutorial()">
                  {{ tutStep < 3 ? i18n.t('next') : i18n.t('startGame') }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ================= GAME ================= -->
        <section v-else-if="view==='game'" class="game">
          <!-- HUD -->
          <div class="hud">
            <div class="hud-left">
              <div class="hud-cell">
                <div class="hud-lbl">{{ i18n.t('difficulty') }}</div>
                <div class="hud-val diff">
                  <span v-for="n in 7" :key="n" class="diff-dot" :class="{on: n<=level}"></span>
                  <span class="lvl">Lv {{ level }}</span>
                </div>
              </div>
              <div class="hud-cell">
                <div class="hud-lbl">{{ i18n.t('score') }}</div>
                <div class="hud-val score-val">{{ score }}</div>
              </div>
              <div class="hud-cell">
                <div class="hud-lbl">{{ i18n.t('timeLeft') }}</div>
                <div class="hud-val timer" :class="{low: totalTime <= 10}">{{ fmt(totalTime) }}</div>
              </div>
            </div>

            <div class="hud-center">
              <div class="hud-task">{{ i18n.t('task') }}</div>
              <div class="hud-quest">{{ currentDef && currentDef.mode==='judge' ? i18n.t('judgeAction') : i18n.t('pickCorrect') }}</div>
              <div class="qtime-bar"><div class="qtime-fill" :style="{width: qtimePct+'%'}"></div></div>
            </div>

            <div class="hud-right">
              <button v-if="showBatchSkip" class="btn ghost sm" @click="onBatchSkip">
                <span class="ic">⏭</span> {{ i18n.t('skip') }}
              </button>
              <button class="btn ghost sm" @click="pauseGame">
                <span class="ic">↩</span> {{ i18n.t('back') }}
              </button>
            </div>
          </div>

          <!-- Kitchen with active hazard -->
          <div class="scene">
            <KitchenScene :active-hazards="currentHazards"/>

            <!-- Question overlay panel — floating card on right -->
            <transition name="qslide">
              <div v-if="activeQuestion" class="q-panel" :class="'pos-'+panelPos">
                <div class="q-panel-head">
                  <div class="q-panel-head-row">
                    <div class="q-tag">{{ i18n.t('hazards.'+activeQuestion.hazardId) }}</div>
                    <div class="q-timer" :class="{low: qtimeLeft <= 3}">{{ qtimeLeft }}s</div>
                  </div>
                  <h3 class="q-title">{{ i18n.t('questions.'+activeQuestion.hazardId) }}</h3>
                  <p class="q-tip">{{ activeQuestion.mode === 'judge' ? i18n.t('tips.judgeTip') : i18n.t('tips.pickAll') }}</p>
                </div>

                <div class="q-panel-options">
                  <!-- JUDGE MODE — single action, two verdict buttons -->
                  <div v-if="activeQuestion.mode === 'judge'" class="judge-block">
                    <div class="judge-action">
                      <span class="opt-text">{{ activeQuestion.options[0].text }}</span>
                    </div>
                    <div class="judge-buttons">
                      <button class="btn judge-btn right-btn"
                        :class="{picked: judgePick==='right', showAnswer: submitted, correct: submitted && activeQuestion.options[0].correct}"
                        :disabled="submitted"
                        @click="pickJudge('right')">
                        <span class="ic">✓</span> {{ i18n.t('isRight') }}
                      </button>
                      <button class="btn judge-btn wrong-btn"
                        :class="{picked: judgePick==='wrong', showAnswer: submitted, correct: submitted && !activeQuestion.options[0].correct}"
                        :disabled="submitted"
                        @click="pickJudge('wrong')">
                        <span class="ic">✕</span> {{ i18n.t('isWrong') }}
                      </button>
                    </div>
                  </div>

                  <!-- PICK MODE — single-select from N options, laid out in a grid -->
                  <div v-else class="opt-list" :class="'cols-'+activeQuestion.options.length">
                    <button v-for="(op,i) in activeQuestion.options" :key="i"
                      class="opt-row"
                      :class="{picked: pickIdx===i, right: submitted && op.correct, wrongPick: submitted && pickIdx===i && !op.correct}"
                      :disabled="submitted"
                      @click="pickOption(i)">
                      <span class="opt-mark"></span>
                      <span class="opt-text">{{ op.text }}</span>
                      <span v-if="submitted && op.correct" class="opt-icon ok">✓</span>
                      <span v-else-if="submitted && pickIdx===i" class="opt-icon bad">✕</span>
                    </button>
                  </div>
                </div>

                <div class="q-verdict-slot">
                  <div v-if="submitted" class="q-verdict" :class="lastVerdict">
                    <span v-if="lastVerdict==='correct'">{{ i18n.t('correct') }} · +{{ lastGain }}</span>
                    <span v-else>{{ i18n.t('wrong') }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <!-- floating toast -->
            <transition name="fade">
              <div v-if="toast" class="toast" :class="toast.type">
                <div class="toast-ic">{{ toast.type==='correct' ? '✓' : '✕' }}</div>
                <div>
                  <div class="toast-title">{{ toast.title }}</div>
                  <div class="toast-sub" v-if="toast.gain>0">+{{ toast.gain }}</div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Pause modal -->
          <transition name="fade">
            <div v-if="paused" class="q-modal">
              <div class="q-card small pause-card">
                <h3>{{ i18n.t('pauseTitle') }}</h3>
                <p>{{ i18n.t('pauseTip') }}</p>
                <div class="q-actions">
                  <button class="btn ghost" @click="confirmLeave">{{ i18n.t('endGame') }}</button>
                  <button class="btn primary" @click="resumeGame">{{ i18n.t('resume') }}</button>
                </div>
              </div>
            </div>
          </transition>
        </section>

        <!-- ================= RESULT ================= -->
        <section v-else-if="view==='result'" class="pane">
          <div class="pane-card result-card">
            <div class="result-head">
              <div class="trophy">🏆</div>
              <h2>{{ i18n.t('gameOver') }}</h2>
              <div class="big-score">{{ session.score }}<span>{{ i18n.t('yourScore') }}</span></div>
            </div>
            <div class="stat-grid">
              <div class="stat"><div class="st-lbl">{{ i18n.t('totalQuestions') }}</div><div class="st-val">{{ session.total }}</div></div>
              <div class="stat ok"><div class="st-lbl">{{ i18n.t('correctCount') }}</div><div class="st-val">{{ session.correct }}</div></div>
              <div class="stat err"><div class="st-lbl">{{ i18n.t('wrongCount') }}</div><div class="st-val">{{ session.wrong }}</div></div>
              <div class="stat"><div class="st-lbl">{{ i18n.t('accuracy') }}</div><div class="st-val">{{ session.total ? Math.round(session.correct*100/session.total) : 0 }}%</div></div>
              <div class="stat"><div class="st-lbl">{{ i18n.t('avgReaction') }}</div><div class="st-val">{{ session.avgRt }}s</div></div>
              <div class="stat"><div class="st-lbl">{{ i18n.t('difficulty') }}</div><div class="st-val">Lv {{ session.finalLevel }}</div></div>
            </div>
            <div class="pane-actions center">
              <button class="btn ghost" @click="goto('home')">{{ i18n.t('home') }}</button>
              <button class="btn primary" @click="goto('duration')">{{ i18n.t('playAgain') }}</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script>
import KitchenScene from './components/KitchenScene.vue'
import { createI18n } from './i18n.js'
import { DIFFICULTY, buildOptions, pickHazard } from './scenarios.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'aqcfwd' // 安全厨房（问答）
const STAGE_W = 1600
const STAGE_H = 900

// Approximate horizontal position (in stage px) of each hazard on the kitchen scene.
// Used to place the question card on the opposite side so it doesn't cover the hazard.
const HAZARD_X = {
  coffeeFire:     135,  // far left counter
  faucet:         350,  // sink area, left-center
  microwaveFire:  600,  // above counter, left-center
  stoveOn:        820,  // stove left burner, center
  gasLeak:        900,  // above stove, center
  hoodFire:       900,  // range hood, center
  oilFire:       1000,  // stove right burner, center-right
  outletSpark:   1098,  // outlet on backsplash, right-center
  toasterFire:   1220,  // toaster, right
  knives:        1340   // knife block, far right
}

export default {
  name: 'App',
  components: { KitchenScene },
  data() {
    return {
      i18n: createI18n(),
      view: 'home',
      scale: 1,
      tutStep: 0,
      // game state
      level: getBatchStartDifficultyForGame(GAME_TYPE), // HUD 当前难度
      score: 0,
      totalTime: 60,
      qtimeLeft: 15,
      qtimeMax: 15,
      currentHazards: [],   // ids currently displayed (always length 1 in choice mode)
      activeQuestion: null, // { hazardId, mode, options }
      pickIdx: -1,
      judgePick: null,
      submitted: false,
      lastVerdict: null,
      lastGain: 0,
      paused: false,
      toast: null,
      history: [],
      session: { total: 0, correct: 0, wrong: 0, score: 0, finalLevel: 1, duration: 0, avgRt: 0, rtSum: 0 },
      pendingDuration: 180,
      window: { correct: 0, total: 0, startAt: 0 },
      questionOpenedAt: 0,
      duration: 60,
      lastHazardId: null,
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 批次跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    stageStyle() {
      return {
        width: STAGE_W + 'px',
        height: STAGE_H + 'px',
        transform: `translate(-50%,-50%) scale(${this.scale})`
      }
    },
    langBtnVisible() {
      return ['home', 'rules', 'history', 'duration', 'result'].includes(this.view)
    },
    qtimePct() {
      return Math.max(0, (this.qtimeLeft / this.qtimeMax) * 100)
    },
    currentDef() {
      return DIFFICULTY[this.level]
    },
    // Place the question card on the side opposite the active hazard so it never
    // covers the highlighted item. Left third -> right, right third -> left, center -> left.
    panelPos() {
      if (!this.activeQuestion) return 'right'
      const x = HAZARD_X[this.activeQuestion.hazardId] != null ? HAZARD_X[this.activeQuestion.hazardId] : 800
      if (x < STAGE_W / 3) return 'right'          // hazard is on the left -> card on right
      if (x > STAGE_W * 2 / 3) return 'left'       // hazard is on the right -> card on left
      return 'left'                                 // hazard in center -> card on left (kitchen has more room there)
    }
  },
  mounted() {
    this.resize()
    window.addEventListener('resize', this.resize)
    this.history = JSON.parse(localStorage.getItem('sk49_history') || '[]')
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.pendingDuration = sec; this.duration = sec },
      openTutorial: () => { this.tutStep = 0; this.view = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    this.stopTimers()
  },
  methods: {
    resize() {
      const w = window.innerWidth, h = window.innerHeight
      this.scale = Math.min(w / STAGE_W, h / STAGE_H)
    },
    toggleLang() {
      this.i18n.set(this.i18n.lang === 'zh' ? 'en' : 'zh')
      this.$forceUpdate()
    },
    goto(v) { this.view = v },
    startGame(sec) {
      this.duration = sec
      this.tutStep = 0
      this.view = 'tutorial'
    },
    finishTutorial() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.launchGame(dur))) return
      this.launchGame(this.duration)
    },
    /**
     * <summary>
     * 教程完成后真正开局：重置统计并进入游戏
     * </summary>
     */
    launchGame(sec) {
      this.duration = sec
      this.level = getBatchStartDifficultyForGame(GAME_TYPE) // 起始难度
      this.score = 0
      this.totalTime = this.duration
      this.session = { total: 0, correct: 0, wrong: 0, score: 0, finalLevel: this.level, duration: this.duration, avgRt: 0, rtSum: 0 }
      this.window = { correct: 0, total: 0, startAt: this.duration }
      this.lastHazardId = null
      this.view = 'game'
      this.$nextTick(() => { this.spawnRound(); this.startTimers() })
    },
    startTimers() {
      this.stopTimers()
      this._mainT = setInterval(() => {
        if (this.paused) return
        this.totalTime--
        if (this.totalTime <= 0) return this.endGame()
        if (this.activeQuestion && !this.submitted) {
          this.qtimeLeft--
          if (this.qtimeLeft <= 0) this.timeoutQuestion()
        }
        if ((this.window.startAt - this.totalTime) >= 60) this.evaluateDifficulty()
      }, 1000)
    },
    stopTimers() { if (this._mainT) { clearInterval(this._mainT); this._mainT = null } },
    evaluateDifficulty() {
      const { correct, total } = this.window
      if (total > 0) {
        const rate = correct / total
        if (rate >= 0.9 && this.level < 7) this.level++
        else if (rate <= 0.7 && this.level > 1) this.level--
      }
      this.window = { correct: 0, total: 0, startAt: this.totalTime }
    },
    spawnRound() {
      const def = DIFFICULTY[this.level]
      const hazardId = pickHazard(this.lastHazardId)
      this.lastHazardId = hazardId
      this.currentHazards = [hazardId]
      this.qtimeMax = def.time
      this.qtimeLeft = def.time
      this.submitted = false
      this.pickIdx = -1
      this.judgePick = null
      this.lastVerdict = null
      this.lastGain = 0
      const q = buildOptions(hazardId, this.level, this.i18n.lang)
      this.activeQuestion = { hazardId, mode: q.mode, options: q.options }
      this.questionOpenedAt = Date.now()
      this.playPrompt()
    },
    playPrompt() {
      try {
        if (this._voice) { this._voice.pause(); this._voice.currentTime = 0 }
        const folder = this.i18n.lang === 'zh' ? 'chinese' : 'english'
        this._voice = new Audio(`voice/${folder}/1.mp3`)
        this._voice.volume = 0.9
        const p = this._voice.play()
        if (p && p.catch) p.catch(() => {})
      } catch (e) { /* ignore */ }
    },
    pickOption(i) {
      if (this.submitted) return
      this.pickIdx = i
      this.submitAnswer()
    },
    pickJudge(v) {
      if (this.submitted) return
      this.judgePick = v
      this.submitAnswer()
    },
    submitAnswer() {
      const q = this.activeQuestion
      if (!q) return
      const rt = (Date.now() - this.questionOpenedAt) / 1000
      let isCorrect = false
      if (q.mode === 'judge') {
        const truthful = q.options[0].correct
        isCorrect = (this.judgePick === 'right' && truthful) || (this.judgePick === 'wrong' && !truthful)
      } else {
        isCorrect = this.pickIdx >= 0 && !!q.options[this.pickIdx].correct
      }
      this.submitted = true
      this.session.total++
      this.session.rtSum += rt
      this.session.avgRt = +(this.session.rtSum / this.session.total).toFixed(2)
      let gain = 0
      if (isCorrect) {
        gain = Math.round(5 * DIFFICULTY[this.level].coef)
        this.session.correct++
        this.score += gain
        this.session.score = this.score
        this.window.correct++
        this.lastVerdict = 'correct'
      } else {
        this.session.wrong++
        this.lastVerdict = 'wrong'
      }
      this.lastGain = gain
      this.window.total++
      this.toast = {
        type: isCorrect ? 'correct' : 'wrong',
        title: isCorrect ? this.i18n.t('correct') : this.i18n.t('wrong'),
        gain
      }
      setTimeout(() => { this.toast = null }, 1200)
      // brief feedback, then next round
      setTimeout(() => {
        if (this.view === 'game' && !this.paused) this.spawnRound()
      }, 1100)
    },
    timeoutQuestion() {
      // count timeout as wrong; then advance
      this.session.total++
      this.session.wrong++
      this.window.total++
      this.submitted = true
      this.lastVerdict = 'wrong'
      this.lastGain = 0
      this.toast = { type: 'wrong', title: this.i18n.t('wrong'), gain: 0 }
      setTimeout(() => { this.toast = null }, 1200)
      setTimeout(() => {
        if (this.view === 'game' && !this.paused) this.spawnRound()
      }, 1000)
    },
    skipInGame() { /* 题目内跳过：保留占位 */ },
    onBatchSkip() { skipPbBatchGame() },
    confirmLeave() {
      this.stopTimers()
      if (this._voice) { try { this._voice.pause() } catch (e) {} }
      this.paused = false
      leavePbGameWindow({ confirm: false })
    },
    pauseGame() { this.paused = true },
    resumeGame() { this.paused = false },
    endGame() {
      this.stopTimers()
      if (this._voice) { try { this._voice.pause() } catch(e){} }
      this.paused = false
      this.activeQuestion = null
      this.session.finalLevel = this.level // 展示用峰值
      const rec = {
        time: new Date().toLocaleString(),
        finalLevel: this.level,
        duration: this.duration,
        total: this.session.total,
        correct: this.session.correct,
        wrong: this.session.wrong,
        avgRt: this.session.avgRt,
        score: this.session.score
      }
      const arr = JSON.parse(localStorage.getItem('sk49_history') || '[]')
      arr.unshift(rec)
      localStorage.setItem('sk49_history', JSON.stringify(arr.slice(0, 50)))
      this.history = arr
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(this.session.avgRt || 0),
        score: this.session.score || 0,
        successCount: this.session.correct || 0,
        failCount: this.session.wrong || 0,
        trainDuration: this.duration,
        difficultyLevel: this.level || 1, // HUD 当前难度
      })
      this.view = 'result'
    },
    fmt(s) { const m = Math.floor(s/60), r = s%60; return `${m}:${String(r).padStart(2,'0')}` }
  }
}
</script>

<style>
/* ============ RESET / GLOBAL ============ */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
  background: radial-gradient(1200px 800px at 30% 20%, #2a3550 0%, #131a2c 55%, #0a0e18 100%);
  color: #f2ecdc;
  -webkit-font-smoothing: antialiased;
}
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }

/* ============ SCALE STAGE ============ */
.stage-wrap { position: fixed; inset: 0; overflow: hidden; }
.stage {
  position: absolute; left: 50%; top: 50%;
  transform-origin: center center;
  background: transparent;
}

/* language toggle */
.lang-toggle {
  position: absolute; right: 32px; top: 28px; z-index: 60;
  padding: 10px 18px; border-radius: 22px;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
  color: #f2ecdc; font-weight: 600; letter-spacing: 1px;
  transition: transform .15s, background .2s;
}
.lang-toggle:hover { background: rgba(255,255,255,0.16); transform: translateY(-1px); }

/* ============ BUTTONS ============ */
.btn {
  padding: 12px 22px; border-radius: 12px;
  background: linear-gradient(180deg,#2b3350,#1c2340);
  color: #ecefff; font-weight: 600; font-size: 15px;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform .12s, box-shadow .15s, filter .15s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 8px 22px rgba(0,0,0,0.3); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary {
  background: linear-gradient(180deg, #ff8a3d, #ff5a1f);
  border-color: #ff5a1f; color: #fff;
  box-shadow: 0 6px 18px rgba(255,90,31,0.35);
}
.btn.ghost { background: transparent; border: 1px solid rgba(255,255,255,0.2); }
.btn.big { padding: 16px 30px; font-size: 17px; border-radius: 14px; min-width: 220px; justify-content: center; }
.btn.sm { padding: 8px 14px; font-size: 13px; border-radius: 10px; }
.btn-group { display: inline-flex; gap: 10px; }
.ic { font-size: 1.05em; }

/* ============ HOME ============ */
.home {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.home-bg { position: absolute; inset: 0; overflow: hidden; }
.glow-orb { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(90px); opacity: 0.45; }
.glow-orb.a { background: #ff6b3d; top: -120px; left: -120px; }
.glow-orb.b { background: #3d78ff; bottom: -160px; right: -100px; }
.glow-orb.c { background: #7cf58a; top: 40%; left: 55%; opacity: 0.25; }
.home-panel {
  position: relative; z-index: 2;
  text-align: center;
  padding: 40px 60px;
  background: rgba(20, 26, 46, 0.55);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
.home-logo { display: flex; justify-content: center; margin-bottom: 12px; }
.title { font-size: 56px; font-weight: 800; letter-spacing: 4px;
  background: linear-gradient(180deg,#fff,#ffd7a8); -webkit-background-clip: text; background-clip: text; color: transparent; }
.subtitle { margin-top: 8px; font-size: 18px; opacity: 0.75; letter-spacing: 2px; }
.home-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 36px; }
.home-buttons.three { grid-template-columns: repeat(3, 1fr); }

/* ============ PANE (rules/history/duration/tutorial/result) ============ */
.pane { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.pane-card {
  background: rgba(20,26,46,0.85);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px 36px;
  min-width: 620px; max-width: 90%;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
.pane-card.wide { min-width: 1000px; }
.pane-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.pane-head h2 { font-size: 26px; }
.close { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); font-size: 18px; }
.close:hover { background: rgba(255,255,255,0.18); }
.rules-list { padding-left: 22px; line-height: 1.9; font-size: 16px; }
.rules-list li { margin-bottom: 10px; }
.pane-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; }
.pane-actions.center { justify-content: center; }
.pane-actions.space { justify-content: space-between; }

/* history table */
.empty { text-align: center; padding: 40px; opacity: 0.6; }
.table-wrap { max-height: 500px; overflow: auto; border-radius: 8px; }
.tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
.tbl th, .tbl td { padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
.tbl th { background: rgba(255,255,255,0.05); position: sticky; top: 0; }

/* duration */
.duration-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin: 28px 0 12px; }
.dur-card { position: relative; padding: 40px 20px; border-radius: 16px;
  background: linear-gradient(180deg, #23294a, #171b30);
  border: 2px solid rgba(255,255,255,0.06);
  transition: transform .18s, border-color .2s, box-shadow .2s;
}
.dur-card:hover { transform: translateY(-4px); border-color: #ff8a3d; }
.dur-card.featured { border-color: rgba(255,138,61,0.5); background: linear-gradient(180deg,#3a2c48,#221830); }
.dur-card.active { border-color: #ff8a3d; box-shadow: 0 0 0 4px rgba(255,138,61,0.25), 0 10px 30px rgba(255,90,31,0.3); }
.dur-check { position: absolute; top: 12px; right: 14px; width: 26px; height: 26px; border-radius: 50%;
  background: #ff8a3d; color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(255,138,61,0.5); }
.dur-num { font-size: 68px; font-weight: 800; color: #ffb84d; }
.dur-lbl { margin-top: 6px; letter-spacing: 2px; opacity: 0.85; }

/* tutorial */
.tutorial-card { min-width: 1100px; }
.step-pill { font-size: 14px; padding: 4px 12px; background: rgba(255,138,61,0.25); border-radius: 12px; margin-left: 12px; vertical-align: middle; }
.tut-stage { position: relative; height: 500px; background: #0d1220; border-radius: 12px; overflow: hidden; margin: 8px 0; }
.tut-scene { position: absolute; inset: 0; }
.tut-callout {
  position: absolute; left: 40px; top: 40px;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px 14px 14px;
  background: rgba(20,26,46,0.9); border-radius: 12px;
  border: 1px solid rgba(255,138,61,0.4); font-size: 16px;
}
.tut-badge { width: 34px; height: 34px; border-radius: 50%; background: #ff8a3d; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 800; }
.tut-panel {
  position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
  width: 360px; padding: 22px;
  background: rgba(20,26,46,0.96); border-radius: 14px; border: 1px solid rgba(255,138,61,0.3);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}
.tut-panel-tag { display: inline-block; padding: 3px 10px; border-radius: 8px; background: rgba(255,138,61,0.2);
  color: #ffb84d; font-size: 12px; letter-spacing: 1px; margin-bottom: 8px; }
.tut-panel h3 { font-size: 17px; margin-bottom: 12px; line-height: 1.4; }
.tut-opts .opt-row { padding: 10px 12px; background: rgba(255,255,255,0.04); border-radius: 8px; margin-bottom: 6px; font-size: 14px;
  border: 1px solid rgba(255,255,255,0.06); cursor: default; }
.tut-opts .opt-row.picked.right { background: rgba(124,245,138,0.15); border-color: rgba(124,245,138,0.5); }
.tut-score { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
.score-flash { font-size: 100px; font-weight: 800; color: #ffb84d; text-shadow: 0 6px 30px rgba(255,138,61,0.7); animation: pop .5s ease; }
.score-lbl { font-size: 22px; margin-top: 12px; }
@keyframes pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

/* ============ GAME ============ */
.game { position: absolute; inset: 0; display: flex; flex-direction: column; }
.hud {
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; padding: 16px 28px;
  background: linear-gradient(180deg, rgba(10,14,24,0.92), rgba(10,14,24,0.7));
  border-bottom: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
}
.hud-left { display: flex; gap: 30px; align-items: center; min-width: 480px; }
.hud-cell { min-width: 130px; }
.hud-lbl { font-size: 11px; opacity: 0.6; letter-spacing: 2px; margin-bottom: 4px; }
.hud-val { font-weight: 700; font-size: 22px; }
.hud-val.timer { color: #7cf58a; font-family: 'SF Mono', Consolas, monospace; }
.hud-val.timer.low { color: #ff5a5a; animation: blink .8s infinite; }
@keyframes blink { 50% { opacity: 0.45; } }
.hud-val.score-val { color: #ffb84d; }
.diff { display: flex; align-items: center; gap: 4px; }
.diff-dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.15); }
.diff-dot.on { background: #ff8a3d; box-shadow: 0 0 8px rgba(255,138,61,0.6); }
.lvl { margin-left: 8px; font-size: 14px; opacity: 0.85; }
.hud-center { flex: 1; text-align: center; max-width: 520px; }
.hud-task { font-size: 11px; opacity: 0.55; letter-spacing: 3px; }
.hud-quest { font-size: 20px; font-weight: 600; margin-top: 4px; }
.qtime-bar { margin: 8px auto 0; width: 70%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.qtime-fill { height: 100%; background: linear-gradient(90deg, #ff5a1f, #ffb84d); transition: width 1s linear; }
.hud-right { display: flex; gap: 10px; align-items: center; }

.scene { position: relative; flex: 1; overflow: hidden; background: #14192a; }

/* Question floating card — anchored to left or right so it doesn't cover the hazard */
.q-panel {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 460px; max-width: 40%;
  padding: 22px 24px;
  background: linear-gradient(180deg, rgba(24,30,52,0.96), rgba(15,20,38,0.96));
  border: 1px solid rgba(255,255,255,0.1); border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  z-index: 25;
  display: flex; flex-direction: column; gap: 14px;
  transition: left .35s cubic-bezier(.4,.0,.2,1), right .35s cubic-bezier(.4,.0,.2,1);
}
.q-panel.pos-left  { left: 32px;  right: auto; }
.q-panel.pos-right { right: 32px; left: auto; }
.q-panel-head { display: flex; flex-direction: column; gap: 6px; }
.q-panel-options { }
.q-panel-head-row { display: flex; align-items: center; gap: 12px; }
.q-tag {
  display: inline-block; padding: 4px 12px; border-radius: 10px;
  background: rgba(255,138,61,0.2); color: #ffb84d;
  font-size: 12px; letter-spacing: 2px; font-weight: 600;
}
.q-timer { font-family: 'SF Mono', Consolas, monospace; font-size: 16px; color: #7cf58a; font-weight: 700; }
.q-timer.low { color: #ff5a5a; animation: blink .6s infinite; }
.q-title { font-size: 18px; line-height: 1.4; }
.q-tip { opacity: 0.6; font-size: 13px; }

/* pick mode options — vertical inside narrow floating card */
.opt-list { display: flex; flex-direction: column; gap: 10px; }
.opt-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer; transition: all .15s;
  text-align: left; width: 100%;
  color: #ecefff; font-size: 15px;
}
.opt-row:hover:not(:disabled) { background: rgba(255,255,255,0.09); transform: translateY(-2px); }
.opt-mark {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.35); position: relative;
  flex-shrink: 0;
}
.opt-row.picked .opt-mark { background: #ff8a3d; border-color: #ff8a3d; box-shadow: 0 0 10px rgba(255,138,61,0.5); }
.opt-row.picked .opt-mark::after { content: ''; position: absolute; left: 4px; top: 4px; width: 8px; height: 8px; background: #fff; border-radius: 50%; }
.opt-text { flex: 1; }
.opt-icon { font-weight: 800; font-size: 18px; margin-left: 8px; }
.opt-icon.ok { color: #7cf58a; }
.opt-icon.bad { color: #ff5a5a; }
.opt-row.right { background: rgba(124,245,138,0.18); border-color: #7cf58a; }
.opt-row.wrongPick { background: rgba(255,90,90,0.18); border-color: #ff5a5a; }

/* judge mode — stacked vertically */
.judge-block { display: flex; flex-direction: column; gap: 14px; }
.judge-action {
  padding: 18px 20px; border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,138,61,0.12), rgba(255,138,61,0.05));
  border: 1px dashed rgba(255,138,61,0.35);
  text-align: center;
}
.judge-action .opt-text { font-size: 19px; font-weight: 600; color: #fff2c8; }
.judge-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.judge-btn { padding: 14px; font-size: 17px; justify-content: center; border-radius: 12px; }
.judge-btn.right-btn { background: linear-gradient(180deg, #2a5a3a, #1a3d26); border-color: #3a6a4a; color: #cff0d8; }
.judge-btn.right-btn:hover:not(:disabled) { background: linear-gradient(180deg, #3a7a4a, #245234); }
.judge-btn.wrong-btn { background: linear-gradient(180deg, #5a2a2a, #3d1a1a); border-color: #6a3a3a; color: #f0cfcf; }
.judge-btn.wrong-btn:hover:not(:disabled) { background: linear-gradient(180deg, #7a3a3a, #522424); }
.judge-btn.picked { box-shadow: 0 0 0 3px rgba(255,138,61,0.5); }
.judge-btn.showAnswer.correct { background: linear-gradient(180deg,#3a9a4a,#256a34); border-color: #7cf58a; color: #fff; }
.judge-btn.showAnswer:not(.correct).picked { background: linear-gradient(180deg,#9a3a3a,#6a2424); border-color: #ff5a5a; color: #fff; }

/* verdict below options */
.q-verdict-slot { display: flex; justify-content: center; }
.q-verdict { padding: 10px 18px; text-align: center; border-radius: 10px; font-weight: 700; letter-spacing: 2px; }
.q-verdict.correct { background: rgba(124,245,138,0.15); color: #7cf58a; border: 1px solid rgba(124,245,138,0.35); }
.q-verdict.wrong { background: rgba(255,90,90,0.15); color: #ff9090; border: 1px solid rgba(255,90,90,0.35); }

.qslide-enter-active, .qslide-leave-active { transition: opacity .25s, transform .25s; }
.qslide-enter, .qslide-leave-to { opacity: 0; transform: translateY(-46%) scale(0.96); }

/* toast */
.toast {
  position: absolute; top: 40px; left: 50%; transform: translateX(-50%); z-index: 30;
  display: flex; align-items: center; gap: 14px;
  padding: 14px 26px; border-radius: 14px;
  background: rgba(10,14,24,0.92); border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}
.toast.correct { border-color: #7cf58a; }
.toast.wrong { border-color: #ff5a5a; }
.toast-ic { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; }
.toast.correct .toast-ic { background: #7cf58a; color: #05230b; }
.toast.wrong .toast-ic { background: #ff5a5a; color: #2a0505; }
.toast-title { font-weight: 700; }
.toast-sub { font-size: 13px; opacity: 0.8; color: #ffb84d; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* pause modal */
.q-modal {
  position: absolute; inset: 0; z-index: 40;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.q-card {
  width: 560px; max-width: 92%; padding: 28px 30px;
  background: linear-gradient(180deg, #1c2340, #131a2c);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6);
}
.q-card.small { width: 420px; text-align: center; }
.q-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; align-items: center; }
.pause-card h3 { font-size: 24px; margin-bottom: 10px; }
.pause-card p { opacity: 0.7; margin-bottom: 20px; }
.pause-card .q-actions { justify-content: center; }

/* result */
.result-card { text-align: center; min-width: 720px; }
.result-head { padding: 10px 0 20px; }
.trophy { font-size: 60px; }
.big-score { margin-top: 18px; font-size: 84px; font-weight: 800;
  background: linear-gradient(180deg,#ffd28a,#ff8a3d); -webkit-background-clip: text; background-clip: text; color: transparent; }
.big-score span { display: block; font-size: 14px; letter-spacing: 3px; opacity: 0.7; -webkit-text-fill-color: #f2ecdc; }
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0; }
.stat { padding: 18px; background: rgba(255,255,255,0.04); border-radius: 12px; }
.st-lbl { font-size: 12px; letter-spacing: 2px; opacity: 0.7; }
.st-val { font-size: 28px; font-weight: 700; margin-top: 6px; }
.stat.ok .st-val { color: #7cf58a; }
.stat.err .st-val { color: #ff8080; }
</style>
