<template>
  <div class="root">
    <div class="stage-wrap">
      <div class="stage" :style="stageStyle">
        <!-- Persistent background -->
        <img class="bg" :src="bgImg" />

        <!-- Language toggle (hidden during game) -->
        <button
          v-if="showLangBtn"
          class="lang-btn"
          @click="toggleLang"
        >
          {{ t('langBtn') }}
        </button>

        <!-- HOME -->
        <div v-if="screen === 'home'" class="screen home">
          <div class="title">{{ t('gameTitle') }}</div>
          <button class="menu-btn primary" @click="onStartGame">{{ t('startGame') }}</button>
          <button class="menu-btn" @click="screen = 'rules'">{{ t('rules') }}</button>
          <button class="menu-btn" @click="screen = 'history'">{{ t('history') }}</button>
        </div>

        <!-- RULES -->
        <div v-if="screen === 'rules'" class="screen modal-screen">
          <div class="modal-card">
            <div class="modal-title">{{ t('rulesTitle') }}</div>
            <p class="modal-text">{{ t('rulesText') }}</p>
            <table class="rules-table">
              <thead>
                <tr>
                  <th>{{ t('difficulty') }}</th>
                  <th>{{ lang === 'zh' ? '蹦起数' : 'Jumps' }}</th>
                  <th>{{ lang === 'zh' ? '总数' : 'Total' }}</th>
                  <th>{{ lang === 'zh' ? '干扰(秒)' : 'Distract(s)' }}</th>
                  <th>{{ lang === 'zh' ? '系数' : 'Coef' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(lv, i) in levels" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ lv.jumpMin }} - {{ lv.jumpMax }}</td>
                  <td>{{ lv.total }}</td>
                  <td>{{ lv.distractTime }}</td>
                  <td>{{ lv.coef }}</td>
                </tr>
              </tbody>
            </table>
            <button class="menu-btn" @click="screen = 'home'">{{ t('close') }}</button>
          </div>
        </div>

        <!-- HISTORY -->
        <div v-if="screen === 'history'" class="screen modal-screen">
          <div class="modal-card wide">
            <div class="modal-title">{{ t('historyTitle') }}</div>
            <div v-if="!history.length" class="no-history">{{ t('noHistory') }}</div>
            <table v-else class="history-table">
              <thead>
                <tr>
                  <th>{{ t('trainingTime') }}</th>
                  <th>{{ t('itemName') }}</th>
                  <th>{{ t('level') }}</th>
                  <th>{{ t('length') }}</th>
                  <th>{{ t('totalCount') }}</th>
                  <th>{{ t('successCount') }}</th>
                  <th>{{ t('failCount') }}</th>
                  <th>{{ t('successRate') }}</th>
                  <th>{{ t('avgReaction') }}</th>
                  <th>{{ t('score') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in history" :key="i">
                  <td>{{ r.time }}</td>
                  <td>{{ r.item }}</td>
                  <td>{{ r.difficulty }}</td>
                  <td>{{ Math.round(r.duration / 60) }}{{ t('minute') }}</td>
                  <td>{{ r.totalCount }}</td>
                  <td>{{ r.successCount }}</td>
                  <td>{{ r.failCount }}</td>
                  <td>{{ r.successRate }}%</td>
                  <td>{{ r.avgReactionMs }} ms</td>
                  <td>{{ r.score }}</td>
                </tr>
              </tbody>
            </table>
            <button class="menu-btn" @click="screen = 'home'">{{ t('close') }}</button>
          </div>
        </div>

        <!-- TUTORIAL -->
        <div v-if="screen === 'tutorial'" class="screen modal-screen">
          <div class="modal-card tutorial-card">
            <div class="modal-title">{{ t('tutorialTitle') }}</div>

            <!-- Visual tutorial: mini game preview -->
            <div class="tut-stage">
              <!-- Step 1: dogs sitting -->
              <div v-if="tutorialStep === 0" class="tut-scene">
                <div class="tut-caption">{{ t('tutorialStep1') }}</div>
                <div class="tut-dogs">
                  <img v-for="i in 4" :key="i" class="tut-dog" :src="dogImg" />
                </div>
              </div>
              <!-- Step 2: two dogs jumping -->
              <div v-if="tutorialStep === 1" class="tut-scene">
                <div class="tut-caption">{{ t('tutorialStep2') }}</div>
                <div class="tut-dogs">
                  <img class="tut-dog tut-jump" :src="dogJumpImg" />
                  <img class="tut-dog" :src="dogImg" />
                  <img class="tut-dog tut-jump" :src="dogJumpImg" />
                  <img class="tut-dog" :src="dogImg" />
                </div>
              </div>
              <!-- Step 3: distractor -->
              <div v-if="tutorialStep === 2" class="tut-scene">
                <div class="tut-caption">{{ t('tutorialStep3') }}</div>
                <div class="tut-math">
                  <div class="big-num">20 - 3 = ?</div>
                  <div class="tut-options">
                    <button class="tut-opt highlight">17</button>
                    <button class="tut-opt">15</button>
                    <button class="tut-opt">18</button>
                    <button class="tut-opt">14</button>
                  </div>
                </div>
              </div>
              <!-- Step 4: recall -->
              <div v-if="tutorialStep === 3" class="tut-scene">
                <div class="tut-caption">{{ t('tutorialStep4') }}</div>
                <div class="tut-math">
                  <div class="big-num">? </div>
                  <div class="tut-options">
                    <button class="tut-opt">1</button>
                    <button class="tut-opt highlight">2</button>
                    <button class="tut-opt">3</button>
                    <button class="tut-opt">4</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="tut-nav">
              <button class="menu-btn" @click="prevTutorialStep" :disabled="tutorialStep === 0">
                {{ t('prev') }}
              </button>
              <button class="menu-btn" @click="onTutorialDone">{{ t('skip') }}</button>
              <button class="menu-btn primary" @click="nextTutorialStep">
                {{ tutorialStep === 3 ? t('start') : t('next') }}
              </button>
            </div>
          </div>
        </div>

        <!-- DURATION -->
        <div v-if="screen === 'duration'" class="screen modal-screen">
          <div class="modal-card">
            <div class="modal-title">{{ t('duration') }}</div>
            <div class="dur-row">
              <button
                class="dur-btn"
                :class="{ selected: selectedDurationMins === 1 }"
                @click="selectedDurationMins = 1"
              >1 {{ t('minute') }}</button>
              <button
                class="dur-btn"
                :class="{ selected: selectedDurationMins === 3 }"
                @click="selectedDurationMins = 3"
              >3 {{ t('minute') }}</button>
              <button
                class="dur-btn"
                :class="{ selected: selectedDurationMins === 5 }"
                @click="selectedDurationMins = 5"
              >5 {{ t('minute') }}</button>
            </div>
            <div class="dur-actions">
              <button class="menu-btn" @click="onBackFromDuration">{{ t('back') }}</button>
              <button
                class="menu-btn primary"
                :disabled="!selectedDurationMins"
                @click="startGameFromDuration"
              >{{ t('startGame') }}</button>
            </div>
          </div>
        </div>

        <!-- GAME -->
        <div v-if="screen === 'game'" class="screen game">
          <!-- HUD -->
          <div class="hud">
            <div class="hud-item">{{ t('difficulty') }}: <b>{{ difficulty }}</b></div>
            <div class="hud-item">{{ t('score') }}: <b>{{ score }}</b></div>
            <div class="hud-item">{{ t('time') }}: <b>{{ formatTime(timeLeft) }}</b></div>
          </div>

          <!-- Center task text -->
          <div class="task-text">{{ taskText }}</div>

          <!-- Skip button (empty handler, reserved) -->
          <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t('skipGame') }}</button>

          <!-- Back button -->
          <button class="back-btn" @click="exitGame">{{ t('back') }}</button>

          <!-- Dogs -->
          <div class="dog-area">
            <div
              v-for="dog in dogs"
              :key="dog.id"
              class="dog"
              :class="{ jumping: dog.jumping }"
              :style="dogStyle(dog)"
            >
              <img :src="dog.jumping ? dogJumpImg : dogImg" />
            </div>
          </div>

          <!-- Distractor overlay -->
          <div v-if="gamePhase === 'distract'" class="game-overlay distract-overlay">
            <div class="distract-info">
              {{ lang === 'zh' ? '干扰任务剩余' : 'Distractor left' }}: {{ distractTimeLeft }}{{ t('seconds') }}
            </div>
            <div class="distract-num">{{ distractCurrent }} - 3 = ?</div>
            <div class="distract-options">
              <button
                v-for="opt in distractOptions"
                :key="opt"
                class="opt-btn"
                @click="selectDistract(opt, $event)"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- Recall overlay -->
          <div v-if="gamePhase === 'recall'" class="game-overlay recall-overlay">
            <div class="recall-info">
              {{ lang === 'zh' ? '答题剩余' : 'Answer left' }}: {{ recallTimeLeft }}{{ t('seconds') }}
            </div>
            <div class="recall-q">{{ t('recallQuestion') }}</div>
            <div class="recall-options">
              <button
                v-for="opt in recallOptions"
                :key="opt"
                class="opt-btn recall-opt"
                @click="onRecallClick(opt, $event)"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- Feedback overlay -->
          <div v-if="gamePhase === 'feedback'" class="game-overlay feedback-overlay">
            <div class="feedback-text" :class="{ ok: lastCorrect, no: !lastCorrect }">
              {{ lastCorrect ? t('correct') : (lastAnswerWasTimeout ? t('timeout') : t('wrong')) }}
            </div>
            <div class="feedback-sub">
              {{ lang === 'zh' ? '正确答案' : 'Answer' }}: {{ jumpCount }}
            </div>
          </div>
        </div>

        <!-- RESULT -->
        <div v-if="screen === 'result'" class="screen modal-screen">
          <div class="modal-card">
            <div class="modal-title">{{ t('resultTitle') }}</div>
            <div class="result-grid">
              <div><span>{{ t('score') }}</span><b>{{ score }}</b></div>
              <div><span>{{ t('difficulty') }}</span><b>{{ difficulty }}</b></div>
              <div><span>{{ t('totalCount') }}</span><b>{{ questionCount }}</b></div>
              <div><span>{{ t('successCount') }}</span><b>{{ totalCorrect }}</b></div>
              <div><span>{{ t('failCount') }}</span><b>{{ totalWrong }}</b></div>
              <div><span>{{ t('successRate') }}</span><b>{{ successRate }}%</b></div>
              <div><span>{{ t('avgReaction') }}</span><b>{{ avgReaction }} ms</b></div>
            </div>
            <div class="result-actions">
              <button class="menu-btn primary" @click="onStartGame">{{ t('playAgain') }}</button>
              <button class="menu-btn" @click="screen = 'home'">{{ t('home') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from './assets'
import { LEVELS } from './levels.js'
import { i18n } from './i18n.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'xgws'

const DESIGN_W = 1280
const DESIGN_H = 800

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default {
  name: 'App',
  data() {
    return {
      lang: 'zh',
      screen: 'home',
      winW: window.innerWidth,
      winH: window.innerHeight,
      // Config
      levels: LEVELS,
      duration: 60,
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE),
      // Runtime
      score: 0,
      timeLeft: 60,
      timerId: null,
      // Round
      dogs: [],
      jumpCount: 0,
      gamePhase: 'idle', // idle | show | distract | recall | feedback
      // Distractor
      distractCurrent: 20,
      distractOptions: [],
      distractTimeLeft: 0,
      distractTimerId: null,
      // Recall
      recallTimeLeft: 15,
      recallTimerId: null,
      recallStartTime: 0,
      lastCorrect: null,
      lastAnswerWasTimeout: false,
      // Stats
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalReactionMs: 0,
      questionCount: 0,
      // Tutorial
      tutorialStep: 0,
      // Duration select
      selectedDurationMins: null,
      // Voice
      currentAudio: null,
      // History
      history: [],
      // Assets
      bgImg: resolveImage('/images/bac.png'),
      dogImg: resolveImage('/images/1.png'),
      dogJumpImg: resolveImage('/images/2.png'),
      // Timeouts stored to allow cancellation on exit
      pendingTimeouts: [],
      archiveId: -1,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    scale() {
      return Math.min(this.winW / DESIGN_W, this.winH / DESIGN_H)
    },
    stageStyle() {
      return {
        width: DESIGN_W + 'px',
        height: DESIGN_H + 'px',
        transform: `translate(-50%, -50%) scale(${this.scale})`,
      }
    },
    showLangBtn() {
      return this.screen !== 'game'
    },
    currentLevel() {
      return LEVELS[Math.min(this.difficulty - 1, LEVELS.length - 1)]
    },
    recallOptions() {
      // Options cover a reasonable range around max jump count (5)
      return [1, 2, 3, 4, 5, 6, 7]
    },
    taskText() {
      if (this.gamePhase === 'show') return this.t('memorize')
      if (this.gamePhase === 'distract') return this.t('distractTask')
      if (this.gamePhase === 'recall') return this.t('recallQuestion')
      return ''
    },
    successRate() {
      if (!this.questionCount) return 0
      return Math.round((this.totalCorrect / this.questionCount) * 100)
    },
    avgReaction() {
      if (!this.totalCorrect) return 0
      return Math.round(this.totalReactionMs / this.totalCorrect)
    },
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  mounted() {
    window.addEventListener('resize', this.onResize)
    const stored = localStorage.getItem('g17_history')
    if (stored) {
      try { this.history = JSON.parse(stored) } catch (e) { /* ignore */ }
    }
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (min) => { this.selectedDurationMins = min },
      openTutorial: () => { this.tutorialStep = 0; this.screen = 'tutorial' },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    this.clearAllTimers()
  },
  methods: {
    t(key) {
      return (i18n[this.lang] && i18n[this.lang][key]) || key
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    onResize() {
      this.winW = window.innerWidth
      this.winH = window.innerHeight
    },
    formatTime(sec) {
      const s = Math.max(0, sec)
      const m = Math.floor(s / 60)
      const ss = s % 60
      return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    },
    dogStyle(dog) {
      return {
        left: dog.x + 'px',
        top: dog.y + 'px',
      }
    },
    // ---------- Navigation ----------
    onStartGame() {
      this.tutorialStep = 0
      this.screen = 'tutorial'
    },
    prevTutorialStep() {
      if (this.tutorialStep > 0) this.tutorialStep--
    },
    skipTutorial() {
      this.onTutorialDone()
    },
    onTutorialDone() {
      this.selectedDurationMins = null
      if (afterBatchTutorial(GAME_TYPE, (min) => this.selectDuration(min))) return
      this.screen = 'duration'
    },
    nextTutorialStep() {
      if (this.tutorialStep < 3) this.tutorialStep++
      else this.onTutorialDone()
    },
    onBackFromDuration() {
      this.selectedDurationMins = null
      this.screen = 'home'
    },
    startGameFromDuration() {
      if (!this.selectedDurationMins) return
      this.selectDuration(this.selectedDurationMins)
    },
    playVoice(n) {
      try {
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.currentAudio.currentTime = 0
          this.currentAudio = null
        }
        const folder = this.lang === 'zh' ? 'chinese' : 'english'
        const audio = new Audio(resolveVoice(`/voice/${folder}/${n}.mp3`))
        audio.play().catch(() => { /* autoplay/missing file: ignore */ })
        this.currentAudio = audio
      } catch (e) { /* ignore */ }
    },
    selectDuration(mins) {
      this.duration = mins * 60
      this.timeLeft = this.duration
      this.score = 0
      this.difficulty = getBatchStartDifficultyForGame(GAME_TYPE)
      this.consecutiveCorrect = 0
      this.consecutiveWrong = 0
      this.totalCorrect = 0
      this.totalWrong = 0
      this.totalReactionMs = 0
      this.questionCount = 0
      this.screen = 'game'
      this.startGameTimer()
      this.startRound()
    },
    startGameTimer() {
      if (this.timerId) clearInterval(this.timerId)
      this.timerId = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) this.endGame()
      }, 1000)
    },
    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    exitGame() {
      if (window.confirm(this.t('confirmExit'))) {
        this.clearAllTimers() // 停止所有计时/语音
        leavePbGameWindow({ confirm: false })
      }
    },
    onSkipClick() {
      skipPbBatchGame()
    },
    endGame() {
      this.clearAllTimers()
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(Math.round(this.avgReaction || 0)),
        score: this.score,
        successCount: this.totalCorrect,
        failCount: this.totalWrong,
        trainDuration: this.duration / 60,
        difficultyLevel: this.difficulty,
      }).catch(() => {})
      const record = {
        time: new Date().toLocaleString(),
        item: this.t('gameTitle'),
        difficulty: this.difficulty,
        duration: this.duration,
        totalCount: this.questionCount,
        successCount: this.totalCorrect,
        failCount: this.totalWrong,
        successRate: this.successRate,
        avgReactionMs: this.avgReaction,
        score: this.score,
      }
      this.history.unshift(record)
      this.history = this.history.slice(0, 50)
      try { localStorage.setItem('g17_history', JSON.stringify(this.history)) } catch (e) { /* ignore */ }
      this.screen = 'result'
      this.gamePhase = 'idle'
    },
    clearAllTimers() {
      if (this.timerId) { clearInterval(this.timerId); this.timerId = null }
      if (this.distractTimerId) { clearInterval(this.distractTimerId); this.distractTimerId = null }
      if (this.recallTimerId) { clearInterval(this.recallTimerId); this.recallTimerId = null }
      this.pendingTimeouts.forEach(id => clearTimeout(id))
      this.pendingTimeouts = []
      if (this.currentAudio) {
        try { this.currentAudio.pause() } catch (e) { /* ignore */ }
        this.currentAudio = null
      }
    },
    scheduleTimeout(fn, ms) {
      const id = setTimeout(() => {
        this.pendingTimeouts = this.pendingTimeouts.filter(x => x !== id)
        fn()
      }, ms)
      this.pendingTimeouts.push(id)
      return id
    },
    // ---------- Round ----------
    startRound() {
      if (this.screen !== 'game' || this.timeLeft <= 0) return
      const level = this.currentLevel
      this.dogs = this.generateDogs(level.total)
      // Random jump count within the level's inclusive range
      const range = level.jumpMax - level.jumpMin + 1
      this.jumpCount = level.jumpMin + Math.floor(Math.random() * range)
      this.gamePhase = 'show'
      this.playVoice(1)
      this.playJumpSequence(this.jumpCount)
    },
    // Dogs placed in the horizontal band:
    //   vertical: between 1/2 and 6/7 of stage height (per user note)
    //   horizontal: spread across stage with small jitter, non-overlapping via cell grid
    //   For multi-row layouts, row 2 is offset horizontally by half a cell
    //   (staggered like garden shrubs) so a jumping bottom-row dog does not
    //   line up under and clip through the top-row dog.
    generateDogs(total) {
      const dogs = []
      const rows = total <= 5 ? 1 : 2
      const cols = Math.ceil(total / rows)
      const areaTop = DESIGN_H * 0.5 - 10
      const areaBottom = DESIGN_H * (6 / 7) - 40
      const areaLeft = 90
      const areaRight = DESIGN_W - 90
      const usableW = areaRight - areaLeft
      const usableH = areaBottom - areaTop
      // For staggered rows we need room for a half-cell offset, so use
      // (cols + 0.5) worth of horizontal slots when there are two rows.
      const slotDivisor = rows > 1 ? cols + 0.5 : cols
      const cellW = usableW / slotDivisor
      const rowGap = rows > 1 ? usableH / (rows - 1 + 0.001) : 0
      let idx = 0
      for (let r = 0; r < rows; r++) {
        const remaining = total - r * cols
        const rowCount = Math.min(cols, remaining)
        // Row 2 is horizontally offset by cellW/2 → staggered vs. row 1
        const stagger = (rows > 1 && r === 1) ? cellW / 2 : 0
        // Centre this row's dogs when it has fewer than 'cols' (last row)
        const centerOffset = (cols - rowCount) * cellW / 2
        for (let c = 0; c < rowCount; c++) {
          const jitterX = (Math.random() * 20 - 10)
          const jitterY = (Math.random() * 12 - 6)
          const cx = areaLeft + stagger + centerOffset + cellW * c + cellW / 2 + jitterX
          const cy = rows === 1
            ? areaTop + usableH / 2 + jitterY
            : areaTop + r * rowGap + jitterY
          dogs.push({
            id: idx++,
            x: cx - 55, // dog is 110px wide, so offset to centre
            y: cy - 60, // dog is 120px tall
            jumping: false,
          })
        }
      }
      return dogs
    },
    playJumpSequence(count) {
      // Choose which dogs will jump
      const indices = shuffle([...Array(this.dogs.length).keys()])
      const chosen = indices.slice(0, count)
      let i = 0
      const doNext = () => {
        if (this.screen !== 'game') return
        if (i >= chosen.length) {
          this.scheduleTimeout(() => this.startDistractor(), 600)
          return
        }
        const idx = chosen[i]
        this.$set(this.dogs[idx], 'jumping', true)
        this.scheduleTimeout(() => {
          if (this.dogs[idx]) this.$set(this.dogs[idx], 'jumping', false)
          i++
          this.scheduleTimeout(doNext, 250)
        }, 800)
      }
      this.scheduleTimeout(doNext, 700) // initial pause so user sees the scene
    },
    // ---------- Distractor ----------
    startDistractor() {
      if (this.screen !== 'game') return
      this.gamePhase = 'distract'
      this.distractCurrent = this.currentLevel.distractStart
      this.distractTimeLeft = this.currentLevel.distractTime
      this.setDistractOptions()
      this.playVoice(2)
      if (this.distractTimerId) clearInterval(this.distractTimerId)
      this.distractTimerId = setInterval(() => {
        this.distractTimeLeft--
        if (this.distractTimeLeft <= 0) {
          clearInterval(this.distractTimerId)
          this.distractTimerId = null
          this.startRecall()
        }
      }, 1000)
    },
    setDistractOptions() {
      const correct = this.distractCurrent - 3
      const opts = new Set([correct])
      const pool = [correct - 3, correct - 2, correct - 1, correct + 1, correct + 2, correct + 3]
        .filter(v => v >= 0)
      shuffle(pool)
      for (const v of pool) {
        if (opts.size >= 4) break
        opts.add(v)
      }
      // Fallback: if we still don't have 4 distinct non-negative options, pad upward
      let pad = correct + 4
      while (opts.size < 4) { opts.add(pad); pad++ }
      this.distractOptions = shuffle([...opts])
    },
    selectDistract(val, event) {
      // Blur immediately so the tap doesn't leave the button in focus/hover
      // state on touch devices (iPad / Android tablets).
      if (event && event.currentTarget && event.currentTarget.blur) {
        event.currentTarget.blur()
      }
      const correct = this.distractCurrent - 3
      if (val === correct) {
        // Avoid presenting a negative next-question to the user
        this.distractCurrent = correct < 3 ? this.currentLevel.distractStart : correct
      }
      this.setDistractOptions()
    },
    // ---------- Recall ----------
    startRecall() {
      if (this.screen !== 'game') return
      this.gamePhase = 'recall'
      this.recallTimeLeft = 15
      this.recallStartTime = Date.now()
      this.playVoice(3)
      if (this.recallTimerId) clearInterval(this.recallTimerId)
      this.recallTimerId = setInterval(() => {
        this.recallTimeLeft--
        if (this.recallTimeLeft <= 0) {
          clearInterval(this.recallTimerId)
          this.recallTimerId = null
          this.submitRecall(-1, true)
        }
      }, 1000)
    },
    onRecallClick(opt, event) {
      if (event && event.currentTarget && event.currentTarget.blur) {
        event.currentTarget.blur()
      }
      this.submitRecall(opt)
    },
    submitRecall(answer, timedOut = false) {
      if (this.recallTimerId) { clearInterval(this.recallTimerId); this.recallTimerId = null }
      this.questionCount++
      const reaction = Date.now() - this.recallStartTime
      const correct = !timedOut && answer === this.jumpCount
      this.lastCorrect = correct
      this.lastAnswerWasTimeout = timedOut
      if (correct) {
        this.score += Math.round(5 * this.currentLevel.coef)
        this.totalCorrect++
        this.totalReactionMs += reaction
        this.consecutiveCorrect++
        this.consecutiveWrong = 0
        if (this.consecutiveCorrect >= 3 && this.difficulty < LEVELS.length) {
          this.difficulty++
          this.consecutiveCorrect = 0
        }
      } else {
        this.totalWrong++
        this.consecutiveWrong++
        this.consecutiveCorrect = 0
        if (this.consecutiveWrong >= 2 && this.difficulty > 1) {
          this.difficulty--
          this.consecutiveWrong = 0
        }
      }
      this.gamePhase = 'feedback'
      this.scheduleTimeout(() => {
        if (this.screen === 'game' && this.timeLeft > 0) this.startRound()
      }, 1400)
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #1a1a1a; }

.root {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: url(~@/views/game/newG17/public/images/bac.png) center center / cover no-repeat #6ab04c;
}

.stage-wrap { position: absolute; inset: 0; }
.stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  background: #6ab04c;
}
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

/* Language toggle */
.lang-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 50;
  padding: 10px 20px;
  border: 2px solid #fff;
  background: rgba(0,0,0,0.35);
  color: #fff;
  font-size: 20px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: bold;
}
@media (hover: hover) {
  .lang-btn:hover { background: rgba(0,0,0,0.55); }
}

/* Screens */
.screen {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 10;
}

/* HOME */
.home .title {
  font-size: 72px;
  color: #fff;
  text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
  margin-bottom: 60px;
  font-weight: bold;
  letter-spacing: 4px;
}
.menu-btn {
  padding: 16px 60px;
  margin: 12px;
  font-size: 24px;
  border-radius: 40px;
  border: 3px solid #fff;
  background: rgba(255,255,255,0.9);
  color: #333;
  cursor: pointer;
  font-weight: bold;
  min-width: 260px;
  transition: transform .1s, background .2s;
}
.menu-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.menu-btn.primary { background: #f39c12; color: #fff; border-color: #e67e22; }
@media (hover: hover) {
  .menu-btn:hover:not(:disabled) { background: #fff; transform: translateY(-2px); }
  .menu-btn.primary:hover { background: #e67e22; }
}

/* Modal-like screens (over background) */
.modal-screen {
  background: rgba(0,0,0,0.55);
}
.modal-card {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  max-width: 700px;
  min-width: 500px;
  max-height: 700px;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  text-align: center;
}
.modal-card.wide { max-width: 1100px; min-width: 900px; }
.modal-title {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 24px;
}
.modal-text {
  font-size: 18px;
  color: #555;
  line-height: 1.7;
  margin-bottom: 20px;
  text-align: left;
}

/* Rules */
.rules-table, .history-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 16px;
}
.rules-table th, .rules-table td,
.history-table th, .history-table td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: center;
}
.rules-table th, .history-table th {
  background: #34495e;
  color: #fff;
  font-weight: bold;
}
.rules-table tr:nth-child(even),
.history-table tr:nth-child(even) { background: #f8f9fa; }
.no-history { padding: 40px; color: #888; font-size: 20px; }

/* Tutorial */
.tutorial-card { width: 800px; max-width: 800px; }
.tut-stage {
  height: 320px;
  background: #eaf7d5;
  border-radius: 12px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tut-scene { width: 100%; text-align: center; }
.tut-caption {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: bold;
}
.tut-dogs {
  display: flex;
  justify-content: center;
  gap: 30px;
  align-items: flex-end;
}
.tut-dog {
  width: 90px;
  height: 100px;
  object-fit: contain;
}
.tut-jump {
  animation: tutJump 1s ease-in-out infinite;
}
@keyframes tutJump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-28px); }
}
.tut-math { padding: 20px; }
.big-num { font-size: 48px; font-weight: bold; color: #2c3e50; margin-bottom: 24px; }
.tut-options { display: flex; gap: 16px; justify-content: center; }
.tut-opt {
  padding: 12px 28px;
  font-size: 22px;
  border: 2px solid #bdc3c7;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  min-width: 70px;
}
.tut-opt.highlight {
  background: #2ecc71;
  color: #fff;
  border-color: #27ae60;
  transform: scale(1.05);
}
.tut-nav { display: flex; justify-content: center; gap: 12px; margin-top: 12px; }

/* Duration */
.dur-row { display: flex; gap: 20px; justify-content: center; margin-top: 20px; }
.dur-btn {
  padding: 22px 40px;
  font-size: 26px;
  border: 3px solid #3498db;
  background: #fff;
  color: #3498db;
  border-radius: 16px;
  cursor: pointer;
  font-weight: bold;
  min-width: 180px;
}
.dur-btn.selected { background: #3498db; color: #fff; box-shadow: 0 0 0 4px rgba(52,152,219,0.25); }
@media (hover: hover) {
  .dur-btn:hover { background: #3498db; color: #fff; }
}
.dur-actions { display: flex; gap: 16px; justify-content: center; margin-top: 30px; }

/* GAME */
.game { display: block; }
.hud {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 16px;
  z-index: 20;
}
.hud-item {
  background: rgba(0,0,0,0.55);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 20px;
}
.hud-item b { color: #f1c40f; margin-left: 6px; }

.task-text {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  padding: 8px 26px;
  background: rgba(0,0,0,0.45);
  border-radius: 22px;
  z-index: 15;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  white-space: nowrap;
}

.back-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 24px;
  background: rgba(231,76,60,0.9);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 24px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  z-index: 20;
}
@media (hover: hover) {
  .back-btn:hover { background: #c0392b; }
}

/* Dogs */
.dog-area {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.dog {
  position: absolute;
  width: 110px;
  height: 120px;
  transition: transform .35s cubic-bezier(.5,-.2,.5,1.4);
}
.dog img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.3));
}
.dog.jumping {
  transform: translateY(-80px) scale(1.05);
  z-index: 5;
}

/* Overlays */
.game-overlay {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255,255,255,0.96);
  padding: 44px 64px;
  border-radius: 28px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.35);
  z-index: 30;
  text-align: center;
  min-width: 640px;
}
.distract-info, .recall-info {
  font-size: 22px;
  color: #7f8c8d;
  margin-bottom: 18px;
}
.distract-num, .recall-q {
  font-size: 60px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 32px;
}
.distract-options, .recall-options {
  display: flex;
  gap: 22px;
  justify-content: center;
  flex-wrap: wrap;
}
.opt-btn {
  padding: 22px 36px;
  font-size: 46px;
  border: 4px solid #3498db;
  background: #fff;
  color: #3498db;
  border-radius: 18px;
  cursor: pointer;
  font-weight: bold;
  min-width: 130px;
  transition: transform .1s, background .15s;
  -webkit-tap-highlight-color: transparent;
}
.opt-btn:focus { outline: none; }
.recall-opt { border-color: #e67e22; color: #e67e22; }
@media (hover: hover) {
  .opt-btn:hover { background: #3498db; color: #fff; transform: translateY(-2px); }
  .recall-opt:hover { background: #e67e22; color: #fff; }
}
/* Explicitly reset visual state on touch devices after tap so the previous
   answer doesn't stay highlighted for the next question. */
@media (hover: none) {
  .opt-btn, .opt-btn:focus, .opt-btn:active { background: #fff; color: #3498db; transform: none; }
  .recall-opt, .recall-opt:focus, .recall-opt:active { background: #fff; color: #e67e22; transform: none; }
}

/* Feedback */
.feedback-overlay { padding: 40px 60px; min-width: 400px; }
.feedback-text {
  font-size: 56px;
  font-weight: bold;
  margin-bottom: 16px;
}
.feedback-text.ok { color: #27ae60; }
.feedback-text.no { color: #e74c3c; }
.feedback-sub { font-size: 22px; color: #555; }

/* Result */
.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  margin: 24px 0;
  font-size: 20px;
}
.result-grid > div {
  display: flex;
  justify-content: space-between;
  padding: 10px 18px;
  background: #f4f6f8;
  border-radius: 10px;
}
.result-grid b { color: #e67e22; }
.result-actions { display: flex; gap: 16px; justify-content: center; margin-top: 20px; }

/* Skip button — secondary grey, sits to the left of the back button */
.skip-btn {
  position: absolute;
  top: 20px;
  right: 140px;
  padding: 10px 24px;
  background: rgba(127, 140, 141, 0.9);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 24px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  z-index: 20;
}
@media (hover: hover) {
  .skip-btn:hover { background: #616a6b; }
}

/* ============================================================
   Portrait (phone) overrides — used in WeChat web-view etc.
   ============================================================ */
@media (orientation: portrait) {
  /* Language toggle: larger tap target, safe-area aware */
  .lang-btn {
    top: calc(12px + env(safe-area-inset-top));
    right: 12px;
    padding: 12px 22px;
    font-size: max(3.6vmin, 16px);
    border-radius: 28px;
  }

  /* HOME */
  .home .title {
    font-size: max(9vmin, 32px);
    margin-bottom: 40px;
    letter-spacing: 2px;
    text-align: center;
    padding: 0 6vw;
  }
  .menu-btn {
    padding: 18px 28px;
    margin: 10px 0;
    font-size: max(4.4vmin, 18px);
    border-radius: 48px;
    min-width: 0;
    width: 82%;
    max-width: 520px;
  }

  /* Modal cards: fit the viewport */
  .modal-card,
  .modal-card.wide,
  .tutorial-card {
    min-width: 0;
    width: 92vw;
    max-width: 92vw;
    max-height: 82vh;
    padding: 24px 18px;
    border-radius: 22px;
  }
  .modal-title {
    font-size: max(5.5vmin, 22px);
    margin-bottom: 16px;
  }
  .modal-text {
    font-size: max(3.6vmin, 15px);
    line-height: 1.65;
  }

  /* Tables → card-list style (row becomes stacked card) */
  .rules-table, .history-table {
    display: block;
    font-size: max(3.4vmin, 14px);
    margin: 12px 0;
  }
  .rules-table thead, .history-table thead { display: none; }
  .rules-table tbody, .history-table tbody { display: block; }
  .rules-table tr, .history-table tr {
    display: block;
    background: #f8f9fa !important;
    border: 1px solid #ddd;
    border-radius: 12px;
    margin-bottom: 10px;
    padding: 8px 10px;
  }
  .rules-table td, .history-table td {
    display: flex;
    justify-content: space-between;
    border: none;
    padding: 6px 4px;
    text-align: right;
  }
  /* Tutorial */
  .tut-stage { height: 42vh; }
  .tut-caption { font-size: max(4vmin, 16px); }
  .tut-dogs { gap: 12px; }
  .tut-dog { width: 18vw; height: 20vw; max-width: 90px; max-height: 100px; }
  .big-num { font-size: max(7vmin, 30px); }
  .tut-opt {
    padding: 12px 18px;
    font-size: max(4.4vmin, 18px);
    min-width: 60px;
    border-radius: 14px;
  }
  .tut-nav { flex-wrap: wrap; gap: 8px; }
  .tut-nav .menu-btn { width: auto; flex: 1 1 30%; padding: 12px 8px; font-size: max(3.6vmin, 15px); }

  /* Duration screen: stack the 3 options vertically */
  .dur-row { flex-direction: column; gap: 12px; align-items: center; }
  .dur-btn {
    width: 82%;
    max-width: 520px;
    min-width: 0;
    padding: 18px 20px;
    font-size: max(5vmin, 20px);
    border-radius: 18px;
  }
  .dur-actions { flex-direction: column; gap: 10px; align-items: center; }
  .dur-actions .menu-btn { width: 82%; }

  /* GAME HUD: wrap, safe-area aware */
  .hud {
    top: 12px;
    left: 12px;
    right: 12px;
    gap: 8px;
    flex-wrap: wrap;
    padding-top: env(safe-area-inset-top);
  }
  .hud-item {
    padding: 8px 14px;
    font-size: max(3.4vmin, 14px);
    border-radius: 16px;
  }

  /* Task caption below HUD */
  .task-text {
    top: calc(96px + env(safe-area-inset-top));
    font-size: max(4vmin, 16px);
    padding: 6px 18px;
    max-width: 90vw;
    white-space: normal;
    text-align: center;
  }

  /* Back / Skip: pinned top-right, safe area aware */
  .back-btn {
    top: calc(12px + env(safe-area-inset-top));
    right: 12px;
    padding: 10px 18px;
    font-size: max(3.6vmin, 15px);
  }
  .skip-btn {
    top: calc(12px + env(safe-area-inset-top));
    right: 108px;
    padding: 10px 16px;
    font-size: max(3.6vmin, 15px);
  }

  /* Overlays: use viewport width, add safe-area bottom */
  .game-overlay {
    min-width: 0;
    width: 92vw;
    padding: 22px 18px calc(22px + env(safe-area-inset-bottom));
    border-radius: 20px;
  }
  .distract-info, .recall-info { font-size: max(3.4vmin, 14px); }
  .distract-num, .recall-q {
    font-size: max(7.5vmin, 28px);
    margin-bottom: 18px;
  }
  .distract-options, .recall-options { gap: 10px; }
  .opt-btn {
    padding: 12px 16px;
    font-size: max(5.2vmin, 20px);
    min-width: 60px;
    border-radius: 12px;
    flex: 1 1 40%;
  }

  /* Feedback */
  .feedback-overlay { min-width: 0; width: 88vw; padding: 28px 24px; }
  .feedback-text { font-size: max(9vmin, 36px); }
  .feedback-sub { font-size: max(4vmin, 16px); }

  /* Result: 2-col grid → single column, wider spacing */
  .result-grid {
    grid-template-columns: 1fr;
    font-size: max(3.8vmin, 15px);
    gap: 10px;
  }
  .result-grid > div { padding: 10px 14px; }
  .result-actions { flex-direction: column; gap: 10px; }
  .result-actions .menu-btn { width: 82%; }
}
</style>
