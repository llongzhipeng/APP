<template>
  <div id="app">
    <!-- HOME -->
    <div v-if="screen==='home'" class="screen home">
      <button v-if="!gameActive" class="lang-btn" @click="toggleLang">{{ lang==='zh'?'EN':'中' }}</button>
      <div class="home-inner">
        <div class="home-title">🧠 {{ T.gameTitle }}</div>
        <div class="home-btns">
          <button class="btn btn-primary" @click="onStartClick">{{ T.startGame }}</button>
          <button class="btn btn-secondary" @click="showRules=true">{{ T.rules }}</button>
          <button class="btn btn-secondary" @click="showHistory=true">{{ T.history }}</button>
        </div>
      </div>
    </div>

    <!-- DURATION SELECT -->
    <div v-if="screen==='duration'" class="screen duration">
      <div class="modal-box">
        <h2>{{ T.selectDuration }}</h2>
        <div class="dur-btns">
          <button
            class="btn"
            :class="pendingDuration===60 ? 'btn-primary' : 'btn-secondary'"
            @click="pendingDuration=60"
          >{{ T.min1 }}</button>
          <button
            class="btn"
            :class="pendingDuration===180 ? 'btn-primary' : 'btn-secondary'"
            @click="pendingDuration=180"
          >{{ T.min3 }}</button>
          <button
            class="btn"
            :class="pendingDuration===300 ? 'btn-primary' : 'btn-secondary'"
            @click="pendingDuration=300"
          >{{ T.min5 }}</button>
        </div>
        <button
          class="btn btn-primary dur-start-btn"
          :disabled="!pendingDuration"
          @click="pendingDuration && startGame(pendingDuration)"
        >{{ T.startNow }}</button>
      </div>
    </div>

    <!-- GAME -->
    <div v-if="screen==='game'" class="screen game">
      <div class="hud">
        <div class="hud-info">
          <span>{{ T.difficulty }}: <b>{{ difficulty }}</b></span>
          <span>{{ T.score }}: <b>{{ score }}</b></span>
          <span>{{ T.timeLeft }}: <b>{{ timeLeft }}s</b></span>
        </div>
        <div class="hud-actions">
          <button v-if="showBatchSkip" class="btn btn-sm btn-secondary" @click="onBatchSkip">{{ T.skip }}</button>
          <button class="btn btn-sm btn-danger" @click="onQuitClick">{{ T.quit }}</button>
        </div>
      </div>

      <div class="game-body">
        <!-- Memorize phase -->
        <div v-if="gamePhase==='memorize'" class="phase-box">
          <div class="phase-label">{{ T.memorize }}</div>
          <div class="phase-timer">
            <div class="timer-bar" :style="{width: (phaseTime/maxPhaseTime*100)+'%'}"></div>
          </div>
          <div class="targets" :class="{'targets-multi': currentQ && currentQ.targets.length>1}">
            <div v-for="(item,i) in (currentQ ? currentQ.targets : [])" :key="i" class="target-item">
              <ShapeItem :item="item" />
            </div>
          </div>
        </div>

        <!-- Answer phase -->
        <div v-if="gamePhase==='answer'" class="phase-box">
          <div class="phase-label">{{ T.choose }}</div>
          <div class="phase-timer">
            <div class="timer-bar timer-bar-answer" :style="{width: (phaseTime/maxPhaseTime*100)+'%'}"></div>
          </div>
          <div class="options-grid">
            <div
              v-for="(opt,i) in (currentQ ? currentQ.options : [])"
              :key="i"
              class="option-card"
              :class="{
                'opt-correct': answered && opt.id === currentQ.correctId,
                'opt-wrong': answered && selectedId === opt.id && opt.id !== currentQ.correctId
              }"
              @click="selectOption(opt)"
            >
              <ShapeItem :item="opt" />
            </div>
          </div>
        </div>

        <!-- Feedback -->
        <div v-if="gamePhase==='feedback'" class="phase-box feedback-box">
          <div class="feedback-icon" :class="lastCorrect ? 'fb-correct' : 'fb-wrong'">
            {{ lastCorrect ? '✓' : '✗' }}
          </div>
          <div class="feedback-text">{{ lastCorrect ? T.correct : (lastTimeout ? T.timeout : T.wrong) }}</div>
          <div v-if="diffNotice" class="diff-notice">{{ diffNotice === 'up' ? T.levelUp : T.levelDown }}</div>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div v-if="screen==='result'" class="screen result">
      <div class="result-box">
        <h2>{{ T.gameOver }}</h2>
        <div class="result-grid">
          <div class="res-item"><span>{{ T.totalScore }}</span><b>{{ score }}</b></div>
          <div class="res-item"><span>{{ T.totalRounds }}</span><b>{{ stats.total }}</b></div>
          <div class="res-item"><span>{{ T.successCount }}</span><b>{{ stats.correct }}</b></div>
          <div class="res-item"><span>{{ T.failCount }}</span><b>{{ stats.total - stats.correct }}</b></div>
          <div class="res-item"><span>{{ T.accuracy }}</span><b>{{ stats.total ? Math.round(stats.correct/stats.total*100) : 0 }}%</b></div>
          <div class="res-item"><span>{{ T.avgReaction }}</span><b>{{ avgReaction }}s</b></div>
        </div>
        <button class="btn btn-primary" @click="goHome">{{ T.backHome }}</button>
      </div>
    </div>

    <!-- TUTORIAL MODAL -->
    <div v-if="showTutorial" class="overlay">
      <div class="modal-box tutorial-box">
        <div class="tutorial-steps">
          <div class="tut-step" :class="{active: tutStep===0}">
            <div class="tut-phase-label">① {{ T.tutorialStep1 }}</div>
            <div class="tut-demo-item">
              <ShapeItem :item="tutDemoItem" />
            </div>
            <div class="tut-bar"><div class="timer-bar tut-anim"></div></div>
          </div>
          <div class="tut-step" :class="{active: tutStep===1}">
            <div class="tut-phase-label">② {{ T.tutorialStep2 }}</div>
            <div class="tut-demo-blank">?</div>
            <div class="tut-bar"><div class="timer-bar timer-bar-answer tut-anim2"></div></div>
          </div>
          <div class="tut-step" :class="{active: tutStep===2}">
            <div class="tut-phase-label">③ {{ T.tutorialStep3 }}</div>
            <div class="tut-options">
              <div v-for="(o,i) in tutOptions" :key="i" class="tut-opt">
                <ShapeItem :item="o" />
              </div>
            </div>
          </div>
          <div class="tut-step" :class="{active: tutStep===3}">
            <div class="tut-phase-label">④ {{ T.tutorialStep4 }}</div>
            <div class="tut-options">
              <div v-for="(o,i) in tutOptions" :key="i" class="tut-opt" :class="{'tut-correct': i===0}">
                <ShapeItem :item="o" />
              </div>
            </div>
            <div class="feedback-icon fb-correct" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:4vmin">✓</div>
          </div>
        </div>
        <div class="tut-nav">
          <button class="btn btn-sm btn-secondary" @click="skipTutorial">{{ T.skip }}</button>
          <div class="tut-dots">
            <span v-for="i in 4" :key="i" class="dot" :class="{active: tutStep===i-1}" @click="tutStep=i-1"></span>
          </div>
          <div>
            <button v-if="tutStep>0" class="btn btn-sm btn-secondary" @click="tutStep--">{{ T.prev }}</button>
            <button v-if="tutStep<3" class="btn btn-sm btn-primary" @click="tutStep++">{{ T.next }}</button>
            <button v-if="tutStep===3" class="btn btn-sm btn-primary" @click="skipTutorial">{{ T.startNow }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- RULES MODAL -->
    <div v-if="showRules" class="overlay">
      <div class="modal-box">
        <h2>{{ T.rulesTitle }}</h2>
        <ul class="rules-list">
          <li v-for="(r,i) in T.rulesItems" :key="i">{{ r }}</li>
        </ul>
        <button class="btn btn-primary" @click="showRules=false">{{ T.close }}</button>
      </div>
    </div>

    <!-- HISTORY MODAL -->
    <div v-if="showHistory" class="overlay">
      <div class="modal-box history-box">
        <h2>{{ T.historyTitle }}</h2>
        <div v-if="history.length===0" class="no-history">{{ T.noHistory }}</div>
        <div v-else class="history-table-wrap">
          <table class="history-table">
            <thead>
              <tr><th v-for="h in T.historyHeaders" :key="h">{{ h }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in history" :key="i">
                <td>{{ r.date }}</td>
                <td>{{ r.difficulty }}</td>
                <td>{{ r.duration }}s</td>
                <td>{{ r.total }}</td>
                <td>{{ r.correct }}</td>
                <td>{{ r.total - r.correct }}</td>
                <td>{{ r.total ? Math.round(r.correct/r.total*100) : 0 }}%</td>
                <td>{{ r.avgReaction }}s</td>
                <td>{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary" @click="showHistory=false">{{ T.close }}</button>
      </div>
    </div>

    <!-- QUIT CONFIRM -->
    <div v-if="showQuit" class="overlay">
      <div class="modal-box small-box">
        <p>{{ T.confirmQuit }}</p>
        <div class="confirm-btns">
          <button class="btn btn-danger" @click="onConfirmQuit">{{ T.confirm }}</button>
          <button class="btn btn-secondary" @click="cancelQuit">{{ T.cancel }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from './assets'
import { t } from './utils/i18n.js'
import { DIFFICULTY } from './utils/config.js'
import { generateQuestion } from './utils/shapeGen.js'
import ShapeItem from './components/ShapeItem.vue'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const TUT_DEMO_ITEM = { type: 'basic', form: 'circle', fill: '#e74c3c', id: 'demo-0' }
const TUT_OPTIONS = [
  { type: 'basic', form: 'circle', fill: '#e74c3c', id: 'demo-0' },
  { type: 'basic', form: 'rect',   fill: '#e74c3c', id: 'demo-1' },
  { type: 'basic', form: 'triangle', fill: '#e74c3c', id: 'demo-2' },
  { type: 'basic', form: 'circle', fill: '#3498db', id: 'demo-3' },
]

export default {
  components: { ShapeItem },
  data() {
    return {
      lang: 'zh',
      screen: 'home',
      gameActive: false,
      showRules: false,
      showHistory: false,
      showTutorial: false,
      showQuit: false,
      paused: false,
      pauseStartTime: 0,
      pendingDuration: null,
      tutStep: 0,
      tutDemoItem: TUT_DEMO_ITEM,
      tutOptions: TUT_OPTIONS,

      difficulty: 1,
      score: 0,
      totalDuration: 60,
      timeLeft: 60,
      gamePhase: 'memorize',
      phaseTime: 0,
      maxPhaseTime: 5,
      currentQ: null,
      selectedId: null,
      answered: false,
      lastCorrect: false,
      lastTimeout: false,
      diffNotice: null,

      stats: { total: 0, correct: 0, reactions: [] },
      windowStats: { startTime: 0, rounds: [] },
      roundStartTime: 0,

      mainTimer: null,
      phaseTimer: null,
      currentAudio: null,

      history: JSON.parse(localStorage.getItem('hippo_history') || '[]'),
      archiveId: null, // 患者档案 ID
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
  },
  computed: {
    T() { return t[this.lang] },
    avgReaction() {
      if (!this.stats.reactions.length) return 0
      const avg = this.stats.reactions.reduce((a, b) => a + b, 0) / this.stats.reactions.length
      return (avg / 1000).toFixed(1)
    },
  },
  methods: {
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },

    onStartClick() {
      this.tutStep = 0
      this.showTutorial = true
    },

    skipTutorial() {
      this.showTutorial = false
      if (afterBatchTutorial('hmtz', (dur, startDiff) => {
        this.startGame(dur, startDiff)
      })) return
      this.pendingDuration = null
      this.screen = 'duration'
    },

    onBatchSkip() {
      skipPbBatchGame() // 跳过当前批次游戏
    },

    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    onConfirmQuit() {
      clearInterval(this.mainTimer) // 主倒计时
      clearInterval(this.phaseTimer) // 阶段计时
      if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null } // 停止语音
      this.gameActive = false // 标记游戏未在进行
      this.paused = false // 解除暂停态
      this.showQuit = false // 关闭确认框
      leavePbGameWindow({ confirm: false }) // 确认后离开游戏窗口
    },

    onQuitClick() {
      this.paused = true
      this.pauseStartTime = Date.now()
      this.showQuit = true
    },

    cancelQuit() {
      if (this.pauseStartTime && this.gamePhase === 'answer') {
        this.roundStartTime += Date.now() - this.pauseStartTime
      }
      this.pauseStartTime = 0
      this.paused = false
      this.showQuit = false
    },

    playVoice(track) {
      // track: 1 = memorize prompt, 2 = choose prompt
      const dir = this.lang === 'zh' ? 'chinese' : 'english'
      try {
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.currentAudio.currentTime = 0
        }
        const audio = new Audio(resolveVoice(`/voice/${dir}/${track}.mp3`))
        this.currentAudio = audio
        audio.play().catch(() => {})
      } catch (e) {}
    },

    startGame(duration, startDiff) {
      this.screen = 'game'
      this.gameActive = true
      this.totalDuration = duration
      this.timeLeft = duration
      this.difficulty = startDiff != null ? startDiff : getBatchStartDifficultyForGame('hmtz')
      this.score = 0
      this.stats = { total: 0, correct: 0, reactions: [] }
      this.windowStats = { startTime: Date.now(), rounds: [] }
      this.showQuit = false

      this.mainTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft--
        if (this.timeLeft <= 0) this.endGame(false)
      }, 1000)

      this.startRound()
    },

    startRound() {
      this.currentQ = generateQuestion(this.difficulty)
      this.selectedId = null
      this.answered = false
      this.diffNotice = null
      this.roundStartTime = Date.now()
      const cfg = DIFFICULTY[this.difficulty]
      this.maxPhaseTime = cfg.memoryTime
      this.phaseTime = cfg.memoryTime
      this.gamePhase = 'memorize'
      this.playVoice(1)

      this.phaseTimer = setInterval(() => {
        if (this.paused) return
        this.phaseTime -= 0.1
        if (this.phaseTime <= 0) {
          clearInterval(this.phaseTimer)
          if (this.gamePhase === 'memorize') this.startAnswerPhase()
          else if (this.gamePhase === 'answer') this.resolveAnswer(null)
        }
      }, 100)
    },

    startAnswerPhase() {
      const cfg = DIFFICULTY[this.difficulty]
      this.maxPhaseTime = cfg.answerTime
      this.phaseTime = cfg.answerTime
      this.gamePhase = 'answer'
      this.playVoice(2)
      this.roundStartTime = Date.now()

      this.phaseTimer = setInterval(() => {
        if (this.paused) return
        this.phaseTime -= 0.1
        if (this.phaseTime <= 0) {
          clearInterval(this.phaseTimer)
          this.resolveAnswer(null)
        }
      }, 100)
    },

    selectOption(opt) {
      if (this.answered || this.gamePhase !== 'answer') return
      clearInterval(this.phaseTimer)
      this.resolveAnswer(opt)
    },

    resolveAnswer(opt) {
      this.answered = true
      const correct = opt && opt.id === this.currentQ.correctId
      this.lastCorrect = correct
      this.lastTimeout = !opt
      this.selectedId = opt ? opt.id : null
      const reaction = opt ? Date.now() - this.roundStartTime : null

      this.stats.total++
      if (correct) {
        this.stats.correct++
        this.score += Math.round(5 * DIFFICULTY[this.difficulty].coeff)
        if (reaction) this.stats.reactions.push(reaction)
      }

      this.windowStats.rounds.push({ correct })
      if (Date.now() - this.windowStats.startTime >= 60000) {
        this.adjustDifficulty()
        this.windowStats = { startTime: Date.now(), rounds: [] }
      }

      this.gamePhase = 'feedback'
      setTimeout(() => {
        if (this.timeLeft > 0) this.startRound()
      }, 1200)
    },

    adjustDifficulty() {
      const rounds = this.windowStats.rounds
      if (!rounds.length) return
      const acc = rounds.filter(r => r.correct).length / rounds.length
      if (acc >= 0.9 && this.difficulty < 6) {
        this.difficulty++
        this.diffNotice = 'up'
      } else if (acc <= 0.7 && this.difficulty > 1) {
        this.difficulty--
        this.diffNotice = 'down'
      }
    },

    endGame(manual) {
      clearInterval(this.mainTimer)
      clearInterval(this.phaseTimer)
      if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null }
      this.gameActive = false
      this.paused = false
      this.showQuit = false

      const record = {
        date: new Date().toLocaleDateString(),
        difficulty: this.difficulty,
        duration: this.totalDuration - this.timeLeft,
        total: this.stats.total,
        correct: this.stats.correct,
        score: this.score,
        avgReaction: this.avgReaction,
      }
      this.history.unshift(record)
      if (this.history.length > 50) this.history.pop()
      localStorage.setItem('hippo_history', JSON.stringify(this.history))

      // 上报训练数据到后端
      const avgMs = this.stats.reactions.length
        ? Math.round(this.stats.reactions.reduce((a, b) => a + b, 0) / this.stats.reactions.length)
        : 0
      submitPbGameEndRecord(this.archiveId, 'hmtz', {
        score: this.score,
        avgTime: toPbGameSeconds(avgMs),
        successCount: this.stats.correct,
        failCount: this.stats.total - this.stats.correct,
        trainDuration: this.totalDuration - this.timeLeft,
        difficultyLevel: this.difficulty,
      }).catch(() => {})

      this.screen = 'result'
    },

    goHome() {
      this.screen = 'home'
    },
  },
  mounted() {
    this._vhHandler = () => {
      document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
    }
    this._vhHandler()
    window.addEventListener('resize', this._vhHandler)
    window.addEventListener('orientationchange', this._vhHandler)
    applyBatchTutorialEntry('hmtz', {
      setDuration: (dur) => { this.pendingDuration = dur },
      setStartDifficulty: (lv) => { this.difficulty = lv },
      openTutorial: () => { this.tutStep = 0; this.showTutorial = true },
    })
  },
  beforeDestroy() {
    clearInterval(this.mainTimer)
    clearInterval(this.phaseTimer)
    if (this._vhHandler) {
      window.removeEventListener('resize', this._vhHandler)
      window.removeEventListener('orientationchange', this._vhHandler)
    }
  },
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; font-family: sans-serif; }
body { background: #0f2744; color: #e8f4fd; }
#app { height: 100vh; height: calc(var(--real-vh, 1vh) * 100); }
</style>

<style scoped>
.screen {
  width: 100vw; height: 100vh;
  height: calc(var(--real-vh, 1vh) * 100);
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0f2744 0%, #1a4a7a 100%);
  color: #e8f4fd;
  overflow: hidden;
}

/* HOME */
.home { position: relative; }
.lang-btn {
  position: absolute; top: 2vh; right: 2vw;
  padding: 0.8vmin 1.5vmin; border-radius: 1vmin;
  background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer; font-size: 1.8vmin;
}
.lang-btn:hover { background: rgba(255,255,255,0.25); }
.home-inner { text-align: center; }
.home-title { font-size: 5vmin; font-weight: bold; margin-bottom: 5vh; letter-spacing: 0.2vmin; }
.home-btns { display: flex; flex-direction: column; gap: 2vh; align-items: center; }

/* BUTTONS */
.btn {
  padding: 1.5vmin 4vmin; border-radius: 1vmin; border: none;
  cursor: pointer; font-size: 2.2vmin; font-weight: 600; transition: opacity .2s;
}
.btn:hover { opacity: 0.85; }
.btn-primary { background: #3498db; color: #fff; min-width: 20vmin; }
.btn-secondary { background: rgba(255,255,255,0.12); color: #e8f4fd; border: 1px solid rgba(255,255,255,0.25); }
.btn-danger { background: #e74c3c; color: #fff; }
.btn-sm { padding: 0.8vmin 2vmin; font-size: 1.8vmin; }

/* DURATION */
.duration { }
.modal-box {
  background: rgba(255,255,255,0.08); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 2vmin;
  padding: 4vmin 5vmin; text-align: center; max-width: 90vw;
}
.modal-box h2 { font-size: 3vmin; margin-bottom: 3vh; }
.dur-btns { display: flex; gap: 2vmin; justify-content: center; flex-wrap: wrap; margin-bottom: 3vh; }
.dur-start-btn { min-width: 24vmin; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* GAME HUD */
.game { flex-direction: column; justify-content: flex-start; padding: 0; }
.hud {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 1.5vh 2vw; background: rgba(0,0,0,0.3);
}
.hud-info { display: flex; gap: 3vmin; font-size: 2vmin; }
.hud-info span b { color: #3db5ff; }
.hud-actions { display: flex; gap: 1.5vmin; align-items: center; }

/* GAME BODY */
.game-body {
  flex: 1; width: 100%; display: flex; align-items: center; justify-content: center;
  padding: 2vh 3vw;
  min-height: 0;
}
.phase-box { width: 100%; max-width: 70vmin; text-align: center; min-height: 0; }
.phase-label { font-size: 2.5vmin; margin-bottom: 1.5vh; opacity: 0.85; }
.phase-timer { width: 100%; height: 1vmin; background: rgba(255,255,255,0.15); border-radius: 99px; overflow: hidden; margin-bottom: 3vh; }
.timer-bar { height: 100%; background: #3498db; border-radius: 99px; transition: width 0.1s linear; }
.timer-bar-answer { background: #e67e22; }

.targets { display: flex; justify-content: center; gap: 4vmin; }
.target-item {
  --avail-h: calc(var(--real-vh, 1vh) * 100 - 22vmin);
  width: min(20vmin, var(--avail-h), 200px);
  height: min(20vmin, var(--avail-h), 200px);
}
.targets-multi .target-item {
  width: min(18vmin, var(--avail-h));
  height: min(18vmin, var(--avail-h));
}

.options-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2vmin;
  width: 100%; max-width: 60vmin; margin: 0 auto;
  /* Constrain each cell so 2 rows + gap fit inside the game body */
  --cell-max: calc((var(--real-vh, 1vh) * 100 - 24vmin) / 2);
  grid-auto-rows: minmax(0, var(--cell-max));
}
.option-card {
  background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.15);
  border-radius: 1.5vmin; cursor: pointer; padding: 1.5vmin;
  aspect-ratio: 1; transition: border-color .15s, background .15s;
  display: flex; align-items: center; justify-content: center;
  max-height: var(--cell-max);
  min-width: 0; min-height: 0;
}
.option-card:hover:not(.opt-correct):not(.opt-wrong) { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.14); }
.opt-correct { border-color: #2ecc71 !important; background: rgba(46,204,113,0.2) !important; }
.opt-wrong { border-color: #e74c3c !important; background: rgba(231,76,60,0.2) !important; }

/* FEEDBACK */
.feedback-box { display: flex; flex-direction: column; align-items: center; gap: 2vh; }
.feedback-icon { font-size: 10vmin; line-height: 1; }
.fb-correct { color: #2ecc71; }
.fb-wrong { color: #e74c3c; }
.feedback-text { font-size: 3vmin; }
.diff-notice { font-size: 2vmin; color: #f1c40f; padding: 0.5vmin 2vmin; border: 1px solid #f1c40f; border-radius: 99px; }

/* RESULT */
.result-box { text-align: center; }
.result-box h2 { font-size: 4vmin; margin-bottom: 3vh; }
.result-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2vmin 4vmin; margin-bottom: 3vh; }
.res-item { display: flex; flex-direction: column; gap: 0.5vh; }
.res-item span { font-size: 1.5vmin; opacity: 0.7; }
.res-item b { font-size: 3.5vmin; color: #3db5ff; }

/* TUTORIAL */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.tutorial-box { position: relative; min-width: 50vmin; min-height: 40vmin; }
.tutorial-steps { position: relative; min-height: 30vmin; }
.tut-step { display: none; flex-direction: column; align-items: center; gap: 1.5vh; }
.tut-step.active { display: flex; }
.tut-phase-label { font-size: 2.2vmin; opacity: 0.8; }
.tut-demo-item { width: 18vmin; height: 18vmin; }
.tut-bar { width: 100%; height: 1vmin; background: rgba(255,255,255,0.15); border-radius: 99px; overflow: hidden; }
@keyframes tut-drain { from { width: 100% } to { width: 0% } }
.tut-anim { animation: tut-drain 3s linear infinite; }
.tut-anim2 { background: #e67e22; animation: tut-drain 2s linear infinite; }
.tut-demo-blank { width: 18vmin; height: 18vmin; border: 3px dashed rgba(255,255,255,0.3); border-radius: 1vmin; display: flex; align-items: center; justify-content: center; font-size: 6vmin; opacity: 0.4; }
.tut-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5vmin; width: 28vmin; }
.tut-opt { background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.15); border-radius: 1vmin; padding: 1vmin; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.tut-correct { border-color: #2ecc71 !important; background: rgba(46,204,113,0.2) !important; }
.tut-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 2.5vh; }
.tut-dots { display: flex; gap: 1vmin; }
.dot { width: 1.2vmin; height: 1.2vmin; border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer; }
.dot.active { background: #3498db; }

/* RULES & HISTORY */
.rules-list { text-align: left; margin: 2vh 0; padding-left: 2vmin; }
.rules-list li { margin-bottom: 1.2vh; font-size: 1.9vmin; line-height: 1.5; }
.history-box { max-width: 90vw; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; }
.history-table-wrap { overflow: auto; flex: 1; margin-bottom: 2vh; }
.history-table { width: 100%; border-collapse: collapse; font-size: 1.6vmin; white-space: nowrap; }
.history-table th, .history-table td { padding: 0.8vmin 1.5vmin; border-bottom: 1px solid rgba(255,255,255,0.1); }
.history-table th { opacity: 0.6; }
.no-history { text-align: center; opacity: 0.5; padding: 3vh 0; font-size: 2vmin; }
.small-box { min-width: 30vmin; }
.small-box p { font-size: 2.2vmin; margin-bottom: 3vh; }
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
</style>
