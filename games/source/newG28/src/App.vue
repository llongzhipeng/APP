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
            <div class="home-buttons">
              <button class="btn primary big" @click="goto('duration')">
                <span class="ic">▶</span> {{ i18n.t('startGame') }}
              </button>
              <button class="btn big" @click="goto('rules')">
                <span class="ic">📖</span> {{ i18n.t('rules') }}
              </button>
              <button class="btn big" @click="goto('history')">
                <span class="ic">📊</span> {{ i18n.t('history') }}
              </button>
              <button class="btn big ghost" @click="skipGame">
                <span class="ic">⏭</span> {{ i18n.t('skip') }}
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
              <h2>{{ i18n.t('tutorial') }} <span class="step-pill">{{ tutStep+1 }} / 3</span></h2>
              <button class="close" @click="onTutorialDone">✕</button>
            </div>
            <div class="tut-stage">
              <div class="tut-scene">
                <KitchenScene :active-hazards="tutorialHazards[tutStep]" @hazard="tutHazardClick"/>
                <div v-if="tutStep===2" class="tut-score">
                  <div class="score-flash">+15</div>
                  <div class="score-lbl">{{ i18n.lang==='zh' ? '识别成功，得分 +15' : 'Identified! +15' }}</div>
                </div>
              </div>
              <div class="tut-tip">
                <div v-if="tutStep===0">{{ i18n.lang==='zh' ? '第一步：观察厨房，找到闪烁高亮的安全隐患。' : 'Step 1: Observe the kitchen and find the blinking hazards.' }}</div>
                <div v-else-if="tutStep===1">{{ i18n.lang==='zh' ? '第二步：直接点击隐患位置进行识别。' : 'Step 2: Tap directly on the hazard to identify it.' }}</div>
                <div v-else>{{ i18n.lang==='zh' ? '第三步：识别越多、越快，得分越高！' : 'Step 3: The more you find and the faster, the higher your score!' }}</div>
              </div>
            </div>
            <div class="pane-actions space">
              <button class="btn ghost" @click="onTutorialDone">{{ i18n.t('skipTutorial') }}</button>
              <div>
                <button class="btn" :disabled="tutStep===0" @click="tutStep=Math.max(0,tutStep-1)">{{ i18n.t('prev') }}</button>
                <button class="btn primary" @click="tutStep < 2 ? tutStep++ : onTutorialDone()">
                  {{ tutStep < 2 ? i18n.t('next') : i18n.t('startGame') }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ================= GAME ================= -->
        <section v-else-if="view==='game'" class="game">
          <!-- HUD -->
          <div class="hud">
            <div class="hud-cell">
              <div class="hud-lbl">{{ i18n.t('difficulty') }}</div>
              <div class="hud-val diff">
                <span v-for="n in 7" :key="n" class="diff-dot" :class="{on: n<=level}"></span>
                <span class="lvl">{{ level }}</span>
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
            <div class="hud-center">
              <div class="hud-task">{{ i18n.t('task') }}</div>
              <div class="hud-quest">{{ i18n.t('findHazards') }}
                <span class="q-count">（{{ i18n.lang==='zh' ? currentHazards.length+' 处' : currentHazards.length+' hazards' }}）</span>
              </div>
              <div class="qtime-bar"><div class="qtime-fill" :style="{width: qtimePct+'%'}"></div></div>
            </div>
            <button v-if="showBatchSkip" class="btn ghost back-btn" type="button" @click="onBatchSkip">
              <span class="ic">⏭</span> {{ i18n.t('skipGame') || '跳过' }}
            </button>
            <button class="btn ghost back-btn" @click="pauseGame">
              <span class="ic">↩</span> {{ i18n.t('back') }}
            </button>
          </div>

          <!-- Kitchen -->
          <div class="scene">
            <KitchenScene :active-hazards="currentHazards" :found-hazards="foundList" @hazard="onHazardClick"/>
            <!-- floating feedback toast -->
            <transition name="fade">
              <div v-if="toast" class="toast" :class="toast.type">
                <div class="toast-ic">{{ toast.type==='correct' ? '✓' : '✕' }}</div>
                <div>
                  <div class="toast-title">{{ toast.title }}</div>
                  <div v-if="toast.gain" class="toast-sub">+{{ toast.gain }}</div>
                </div>
              </div>
            </transition>
            <!-- found progress bar -->
            <div class="found-hud">
              <span class="found-lbl">{{ i18n.lang==='zh' ? '已找出' : 'Found' }}</span>
              <span class="found-num">{{ foundList.length }} / {{ currentHazards.length }}</span>
              <div class="found-dots">
                <span v-for="(h,i) in currentHazards" :key="h" class="fd-dot" :class="{on: foundList.includes(h)}"></span>
              </div>
            </div>
          </div>

          <!-- Pause modal -->
          <transition name="fade">
            <div v-if="paused" class="q-modal">
              <div class="q-card small pause-card">
                <h3>{{ i18n.t('pauseTitle') }}</h3>
                <p>{{ i18n.t('pauseTip') }}</p>
                <div class="q-actions">
                  <button class="btn ghost" @click="abortLeave">{{ i18n.t('endGame') }}</button>
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
import { DIFFICULTY, pickHazards } from './scenarios.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'aqcfsb'

const STAGE_W = 1600
const STAGE_H = 900

export default {
  name: 'App',
  components: { KitchenScene },
  data() {
    return {
      i18n: createI18n(),
      langTick: 0,
      view: 'home',
      // scale
      scale: 1,
      // tutorial
      tutStep: 0,
      tutorialHazards: [['oilFire'], ['oilFire'], ['oilFire']],
      // game
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      totalTime: 60,     // remaining game time
      qtimeLeft: 15,
      qtimeMax: 15,
      currentHazards: [], // ids of hazards currently on scene (round)
      answered: {},
      foundList: [],
      roundStartAt: 0,
      paused: false,
      toast: null,
      history: [],
      // session stats
      session: { total: 0, correct: 0, wrong: 0, score: 0, finalLevel: 1, duration: 0, avgRt: 0, rtSum: 0 },
      pendingDuration: 300,
      // adaptive difficulty window
      window: { correct: 0, total: 0, startAt: 0 },
      duration: 60,
      archiveId: -1,
      showBatchSkip: false,
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
    }
  },
  mounted() {
    this.resize()
    window.addEventListener('resize', this.resize)
    this.history = JSON.parse(localStorage.getItem('sk_history') || '[]')
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.pendingDuration = dur; this.duration = dur },
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
      this.langTick++
      this.$forceUpdate()
    },
    goto(v) { this.view = v },
    skipGame() { /* placeholder — no-op per readme */ },
    startGame(sec) {
      this.duration = sec
      this.pendingDuration = sec
      this.tutStep = 0
      this.view = 'tutorial'
    },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.beginGame(dur))) return
      this.beginGame()
    },
    beginGame(sec) {
      if (sec != null) {
        this.duration = sec
        this.pendingDuration = sec
      }
      this.finishTutorial()
    },
    finishTutorial() {
      // initialize game state
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.score = 0
      this.totalTime = this.duration
      this.session = { total: 0, correct: 0, wrong: 0, score: 0, finalLevel: 1, duration: this.duration, avgRt: 0, rtSum: 0 }
      this.window = { correct: 0, total: 0, startAt: this.duration }
      this.view = 'game'
      this.$nextTick(() => { this.spawnRound(); this.startTimers() })
    },
    startTimers() {
      this.stopTimers()
      this._mainT = setInterval(() => {
        if (this.paused) return
        this.totalTime--
        if (this.totalTime <= 0) return this.endGame()
        // per-question countdown
        this.qtimeLeft--
        if (this.qtimeLeft <= 0) this.timeoutRound()
        // adaptive difficulty check
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
      this.currentHazards = pickHazards(def.hazards)
      this.qtimeMax = def.time
      this.qtimeLeft = def.time
      this.foundList = []
      this.roundStartAt = Date.now()
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
      } catch (e) { /* audio not available */ }
    },
    onHazardClick(hazardId) {
      if (this.paused) return
      if (this.foundList.includes(hazardId)) return
      const rt = (Date.now() - this.roundStartAt) / 1000
      this.foundList.push(hazardId)
      const gain = Math.round(5 * DIFFICULTY[this.level].coef)
      this.score += gain
      this.session.score = this.score
      this.session.total++
      this.session.correct++
      this.session.rtSum += rt
      this.session.avgRt = +(this.session.rtSum / this.session.total).toFixed(2)
      this.window.correct++
      this.window.total++
      this.toast = { type: 'correct', title: this.i18n.t('correct'), gain }
      setTimeout(() => { this.toast = null }, 1200)
      // round complete → next
      if (this.foundList.length >= this.currentHazards.length) {
        setTimeout(() => this.spawnRound(), 700)
      }
    },
    timeoutRound() {
      const missed = this.currentHazards.filter(h => !this.foundList.includes(h))
      missed.forEach(() => {
        this.session.total++
        this.session.wrong++
        this.window.total++
      })
      if (missed.length) {
        this.toast = { type: 'wrong', title: this.i18n.t('wrong'), gain: 0 }
        setTimeout(() => { this.toast = null }, 1200)
      }
      this.spawnRound()
    },
    pauseGame() { this.paused = true },
    resumeGame() { this.paused = false },
    endGame() {
      this.stopTimers()
      if (this._voice) { try { this._voice.pause() } catch(e){} }
      this.paused = false
      this.session.finalLevel = this.level
      const rec = {
        time: new Date().toLocaleString(),
        finalLevel: this.session.finalLevel,
        duration: this.duration,
        total: this.session.total,
        correct: this.session.correct,
        wrong: this.session.wrong,
        avgRt: this.session.avgRt,
        score: this.session.score
      }
      const arr = JSON.parse(localStorage.getItem('sk_history') || '[]')
      arr.unshift(rec)
      localStorage.setItem('sk_history', JSON.stringify(arr.slice(0, 50)))
      this.history = arr
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(this.session.avgRt),
        score: this.session.score ? Math.round(this.session.score) : 0,
        successCount: this.session.correct || 0,
        failCount: this.session.wrong || 0,
        trainDuration: this.duration,
        difficultyLevel: this.level || 1,
      })
      this.view = 'result'
    },
    abortLeave() {
      this.stopTimers()
      if (this._voice) { try { this._voice.pause() } catch(e){} }
      this.paused = false
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip() { skipPbBatchGame() },
    tutHazardClick() { if (this.tutStep < 2) this.tutStep = Math.max(this.tutStep, 1) },
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
  padding: 14px 26px; border-radius: 28px;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
  color: #f2ecdc; font-weight: 700; font-size: 20px; letter-spacing: 2px;
  transition: transform .15s, background .2s;
}
.lang-toggle:hover { background: rgba(255,255,255,0.16); transform: translateY(-1px); }

/* ============ BUTTONS ============ */
.btn {
  padding: 16px 30px; border-radius: 14px;
  background: linear-gradient(180deg,#2b3350,#1c2340);
  color: #ecefff; font-weight: 700; font-size: 22px;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform .12s, box-shadow .15s, filter .15s;
  display: inline-flex; align-items: center; gap: 10px;
}
.btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 8px 22px rgba(0,0,0,0.3); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn.primary {
  background: linear-gradient(180deg, #ff8a3d, #ff5a1f);
  border-color: #ff5a1f; color: #fff;
  box-shadow: 0 6px 18px rgba(255,90,31,0.35);
}
.btn.ghost { background: transparent; border: 1px solid rgba(255,255,255,0.2); }
.btn.big { padding: 22px 42px; font-size: 26px; border-radius: 16px; min-width: 280px; justify-content: center; }
.ic { font-size: 1.1em; }

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
  padding: 56px 72px;
  background: rgba(20, 26, 46, 0.55);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
.home-logo { display: flex; justify-content: center; margin-bottom: 12px; }
.title { font-size: 78px; font-weight: 800; letter-spacing: 6px;
  background: linear-gradient(180deg,#fff,#ffd7a8); -webkit-background-clip: text; background-clip: text; color: transparent; }
.subtitle { margin-top: 14px; font-size: 26px; opacity: 0.85; letter-spacing: 3px; }
.home-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 44px; }

/* ============ PANE ============ */
.pane { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.pane-card {
  background: rgba(20,26,46,0.85);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  border-radius: 22px;
  padding: 40px 46px;
  min-width: 720px; max-width: 92%;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
.pane-card.wide { min-width: 1100px; }
.pane-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px; }
.pane-head h2 { font-size: 36px; font-weight: 800; }
.close { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,0.08); font-size: 24px; }
.close:hover { background: rgba(255,255,255,0.18); }
.rules-list { padding-left: 28px; line-height: 2.0; font-size: 22px; }
.rules-list li { margin-bottom: 14px; }
.pane-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 28px; }
.pane-actions.center { justify-content: center; }
.pane-actions.space { justify-content: space-between; }

/* history table */
.empty { text-align: center; padding: 50px; opacity: 0.7; font-size: 20px; }
.table-wrap { max-height: 520px; overflow: auto; border-radius: 8px; }
.tbl { width: 100%; border-collapse: collapse; font-size: 17px; }
.tbl th, .tbl td { padding: 14px 14px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
.tbl th { background: rgba(255,255,255,0.05); position: sticky; top: 0; font-size: 16px; }

/* duration */
.duration-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin: 32px 0 16px; }
.dur-card { position: relative; padding: 50px 20px; border-radius: 18px;
  background: linear-gradient(180deg, #23294a, #171b30);
  border: 2px solid rgba(255,255,255,0.06);
  transition: transform .18s, border-color .2s, box-shadow .2s;
}
.dur-card:hover { transform: translateY(-4px); border-color: #ff8a3d; }
.dur-card.featured { border-color: rgba(255,138,61,0.5); background: linear-gradient(180deg,#3a2c48,#221830); }
.dur-card.active { border-color: #ff8a3d; box-shadow: 0 0 0 4px rgba(255,138,61,0.25), 0 10px 30px rgba(255,90,31,0.3); }
.dur-check { position: absolute; top: 14px; right: 16px; width: 34px; height: 34px; border-radius: 50%;
  background: #ff8a3d; color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 20px; box-shadow: 0 4px 12px rgba(255,138,61,0.5); }
.dur-num { font-size: 96px; font-weight: 800; color: #ffb84d; line-height: 1; }
.dur-lbl { margin-top: 14px; letter-spacing: 3px; opacity: 0.9; font-size: 24px; font-weight: 600; }

/* tutorial */
.tutorial-card { min-width: 1180px; }
.step-pill { font-size: 20px; padding: 6px 16px; background: rgba(255,138,61,0.25); border-radius: 14px; margin-left: 16px; vertical-align: middle; font-weight: 600; }
.tut-stage { position: relative; height: 520px; background: #0d1220; border-radius: 12px; overflow: hidden; margin: 8px 0; }
.tut-scene { position: absolute; inset: 0; }
.tut-panel {
  position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
  width: 400px; padding: 26px;
  background: rgba(20,26,46,0.95); border-radius: 14px; border: 1px solid rgba(255,138,61,0.3);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}
.tut-panel h3 { font-size: 22px; margin-bottom: 14px; }
.tut-opts .opt-row { padding: 12px 14px; background: rgba(255,255,255,0.04); border-radius: 8px; margin-bottom: 8px; font-size: 19px; }
.tut-opts .opt-row.picked { background: rgba(124,245,138,0.15); border: 1px solid rgba(124,245,138,0.4); }
.tut-score { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
.score-flash { font-size: 130px; font-weight: 800; color: #ffb84d; text-shadow: 0 6px 30px rgba(255,138,61,0.7); animation: pop .5s ease; }
.score-lbl { font-size: 28px; margin-top: 14px; }
@keyframes pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

/* ============ GAME ============ */
.game { position: absolute; inset: 0; display: flex; flex-direction: column; }
.hud {
  display: grid;
  grid-template-columns: 240px 180px 220px 1fr 180px;
  align-items: center; gap: 28px;
  padding: 22px 32px;
  background: linear-gradient(180deg, rgba(10,14,24,0.9), rgba(10,14,24,0.7));
  border-bottom: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
}
.hud-lbl { font-size: 16px; opacity: 0.75; letter-spacing: 3px; margin-bottom: 6px; font-weight: 600; }
.hud-val { font-weight: 800; font-size: 30px; }
.hud-val.timer { color: #7cf58a; font-family: 'SF Mono', Consolas, monospace; font-size: 34px; }
.hud-val.timer.low { color: #ff5a5a; animation: blink .8s infinite; }
@keyframes blink { 50% { opacity: 0.45; } }
.hud-val.score-val { color: #ffb84d; font-size: 34px; }
.diff { display: flex; align-items: center; gap: 5px; }
.diff-dot { width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.15); }
.diff-dot.on { background: #ff8a3d; box-shadow: 0 0 8px rgba(255,138,61,0.6); }
.lvl { margin-left: 10px; font-size: 26px; }
.hud-center { text-align: center; }
.hud-task { font-size: 15px; opacity: 0.65; letter-spacing: 4px; font-weight: 600; }
.hud-quest { font-size: 28px; font-weight: 700; margin-top: 6px; }
.q-count { font-size: 20px; opacity: 0.85; margin-left: 8px; color: #ffb84d; }
.qtime-bar { margin: 10px auto 0; width: 60%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.qtime-fill { height: 100%; background: linear-gradient(90deg, #ff5a1f, #ffb84d); transition: width 1s linear; }
.back-btn { justify-self: end; font-size: 20px !important; padding: 14px 24px !important; }

.scene { position: relative; flex: 1; overflow: hidden; background: #14192a; }

/* toast */
.toast {
  position: absolute; top: 40px; left: 50%; transform: translateX(-50%); z-index: 30;
  display: flex; align-items: center; gap: 18px;
  padding: 18px 34px; border-radius: 16px;
  background: rgba(10,14,24,0.9); border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}
.toast.correct { border-color: #7cf58a; }
.toast.wrong { border-color: #ff5a5a; }
.toast.partial { border-color: #ffb84d; }
.toast-ic { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; }
.toast.correct .toast-ic { background: #7cf58a; color: #05230b; }
.toast.wrong .toast-ic { background: #ff5a5a; color: #2a0505; }
.toast.partial .toast-ic { background: #ffb84d; color: #2a1600; }
.toast-title { font-weight: 800; font-size: 24px; }
.toast-sub { font-size: 18px; opacity: 0.85; margin-top: 2px; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* Question modal */
.q-modal {
  position: absolute; inset: 0; z-index: 40;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.q-card {
  width: 720px; max-width: 92%; padding: 36px 40px;
  background: linear-gradient(180deg, #1c2340, #131a2c);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6);
}
.q-card.small { width: 520px; text-align: center; }
.q-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 20px; }
.q-tag {
  display: inline-block; padding: 6px 16px; border-radius: 12px;
  background: rgba(255,138,61,0.2); color: #ffb84d;
  font-size: 18px; letter-spacing: 3px; margin-bottom: 12px; font-weight: 600;
}
.q-title h3 { font-size: 28px; line-height: 1.4; font-weight: 700; }
.q-tip { margin: 10px 0 22px; opacity: 0.75; font-size: 18px; }
.opt-list { display: flex; flex-direction: column; gap: 12px; }
.opt-row {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px; border-radius: 14px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: all .15s;
}
.opt-row:hover { background: rgba(255,255,255,0.08); }
.opt-row input { display: none; }
.opt-mark {
  width: 28px; height: 28px; border-radius: 8px;
  border: 2px solid rgba(255,255,255,0.4); position: relative;
  flex-shrink: 0;
}
.opt-row.picked .opt-mark { background: #ff8a3d; border-color: #ff8a3d; }
.opt-row.picked .opt-mark::after { content: '✓'; position: absolute; left: 4px; top: 0px; color: #fff; font-size: 20px; font-weight: 800; }
.opt-text { font-size: 22px; font-weight: 500; line-height: 1.4; }
.opt-row.right { background: rgba(124,245,138,0.15); border-color: #7cf58a; }
.opt-row.wrongPick { background: rgba(255,90,90,0.15); border-color: #ff5a5a; }
.opt-row.missed { background: rgba(255,184,77,0.12); border-color: #ffb84d; }
.q-actions { display: flex; justify-content: flex-end; gap: 14px; margin-top: 26px; align-items: center; }
.submitted-hint { font-size: 20px; color: #ffb84d; letter-spacing: 3px; opacity: 0.9; animation: hintPulse 1.2s ease-in-out infinite; font-weight: 600; }
@keyframes hintPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
.pause-card h3 { font-size: 32px; margin-bottom: 14px; }
.pause-card p { opacity: 0.8; margin-bottom: 24px; font-size: 20px; }
.pause-card .q-actions { justify-content: center; }

.qzoom-enter-active, .qzoom-leave-active { transition: opacity .2s, transform .2s; }
.qzoom-enter, .qzoom-leave-to { opacity: 0; transform: scale(0.96); }

/* result */
.result-card { text-align: center; min-width: 820px; }
.result-head { padding: 14px 0 24px; }
.trophy { font-size: 78px; }
.big-score { margin-top: 22px; font-size: 108px; font-weight: 800; line-height: 1;
  background: linear-gradient(180deg,#ffd28a,#ff8a3d); -webkit-background-clip: text; background-clip: text; color: transparent; }
.big-score span { display: block; font-size: 20px; letter-spacing: 4px; opacity: 0.8; -webkit-text-fill-color: #f2ecdc; margin-top: 8px; font-weight: 600; }
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin: 26px 0; }
.stat { padding: 24px; background: rgba(255,255,255,0.04); border-radius: 14px; }
.st-lbl { font-size: 17px; letter-spacing: 3px; opacity: 0.8; font-weight: 600; }
.st-val { font-size: 38px; font-weight: 800; margin-top: 8px; }
.stat.ok .st-val { color: #7cf58a; }
.stat.err .st-val { color: #ff8080; }

/* found progress HUD (identification mode) */
.found-hud {
  position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%);
  display: flex; align-items: center; gap: 16px; z-index: 20;
  padding: 14px 26px; border-radius: 16px;
  background: rgba(10,14,24,0.85); border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.found-lbl { font-size: 20px; opacity: 0.85; letter-spacing: 2px; font-weight: 600; }
.found-num { font-size: 26px; font-weight: 800; color: #ffb84d; }
.found-dots { display: flex; gap: 6px; margin-left: 6px; }
.fd-dot { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); }
.fd-dot.on { background: #7cf58a; border-color: #7cf58a; box-shadow: 0 0 10px rgba(124,245,138,0.6); }

/* tutorial tip banner */
.tut-tip {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 18px 24px; text-align: center;
  background: rgba(10,14,24,0.85); border-top: 1px solid rgba(255,138,61,0.35);
  font-size: 22px; font-weight: 600; letter-spacing: 2px;
}
</style>
