<template>
  <div class="game-root">
    <div class="game-bg">
      <!-- HUD: top bar -->
      <div class="hud">
        <div class="hud-info">
          <span>{{ t('difficulty') }}: <b>{{ difficulty }}</b></span>
          <span>{{ t('score') }}: <b>{{ score }}</b></span>
          <span>{{ t('timeLeft') }}: <b>{{ fmtTime }}</b></span>
        </div>
        <div class="hud-actions">
          <button v-if="showBatchSkip" class="skip-btn" @click="onBatchSkip">{{ t('skipGame') }}</button>
          <button class="exit-btn" @click="confirmExit">{{ t('returnGame') }}</button>
        </div>
      </div>

      <!-- Question -->
      <div class="question-bar">
        <span class="q-text">{{ questionText }}</span>
      </div>

      <!-- Pond zone: strictly between 1/3 top and 1/7 bottom, centered -->
      <div class="pond-zone" ref="pond" :style="pondStyle">
        <img
          v-for="duck in ducks"
          :key="duck.id"
          :src="duck.type==='yellow' ? resolveImage('/images/2.png') : resolveImage('/images/1.png')"
          class="duck-img"
          :style="{ left: duck.x+'%', top: duck.y+'%', width: duck.size+'%', aspectRatio: '1 / 1' }"
        />
      </div>

      <!-- Answer buttons -->
      <div class="answers-bar">
        <button
          v-for="ans in answers"
          :key="ans"
          class="ans-btn"
          :class="feedback && ans===selectedAns ? (ans===correctAns?'correct':'wrong') : ''"
          :disabled="!!feedback"
          @click="checkAnswer(ans)"
        >{{ ans }}</button>
      </div>

      <!-- Brief feedback flash -->
      <transition name="fade">
        <div v-if="feedback" class="feedback-flash" :class="feedback">
          {{ feedback==='correct' ? t('correct') : t('wrong') }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from '../assets'
import { t } from '../i18n.js'
import { submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const LEVELS = [
  { level:1, yellow:[2,3], white:[2,3], coef:1 },
  { level:2, yellow:[3,4], white:[2,3], coef:1.5 },
  { level:3, yellow:[3,4], white:[3,4], coef:2 },
  { level:4, yellow:[3,4], white:[4,5], coef:2.5 },
  { level:5, yellow:[4,5], white:[4,5], coef:3 },
  { level:6, yellow:[5,6], white:[5,6], coef:3.5 },
]

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Max duck size (% of pond-zone width). Smaller = crowds less.
const MAX_DUCK_SIZE = 14

export default {
  props: ['lang', 'duration', 'archiveId', 'startDifficulty'],
  data() {
    return {
      // 与 game13 一致：开局难度只走公共方法（批次用方案等级，否则默认 1）
      difficulty: getBatchStartDifficultyForGame('syz'),
      score: 0,
      timeLeft: this.duration,
      ducks: [],
      correctAns: 0,
      answers: [],
      questionType: 'yellow',
      feedback: null,
      selectedAns: null,
      periodCorrect: 0,
      periodTotal: 0,
      periodElapsed: 0,
      totalAnswers: 0,
      correctAnswers: 0,
      maxDifficulty: getBatchStartDifficultyForGame('syz'),
      responseTimes: [],
      questionStart: 0,
      currentAudio: null,
      isTablet: false,
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  created() {
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
  },
  computed: {
    fmtTime() {
      const m = Math.floor(this.timeLeft / 60)
      const s = this.timeLeft % 60
      return m > 0 ? `${m}:${s.toString().padStart(2,'0')}` : `${s}s`
    },
    questionText() {
      return t(this.lang, this.questionType === 'yellow' ? 'qYellow' : this.questionType === 'white' ? 'qWhite' : 'qAll')
    },
    // On smaller (tablet) viewports the browser chrome eats vertical space,
    // pushing the pond up into the question bar. Nudge it down a bit so the
    // ducks stay clear of the top bar.
    pondStyle() {
      return this.isTablet ? { top: '52%' } : {}
    },
  },
  mounted() {
    this.detectTablet()
    this.newRound()
    this._onResize = () => { this.detectTablet(); this.newRound() }
    window.addEventListener('resize', this._onResize)
    window.addEventListener('orientationchange', this._onResize)
    this._timer = setInterval(() => {
      this.timeLeft--
      this.periodElapsed++
      if (this.periodElapsed >= 60) {
        this.adjustDifficulty()
        this.periodElapsed = 0
        this.periodCorrect = 0
        this.periodTotal = 0
      }
      if (this.timeLeft <= 0) this.endGame()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this._timer)
    window.removeEventListener('resize', this._onResize)
    window.removeEventListener('orientationchange', this._onResize)
    if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null }
  },
  methods: { resolveImage,
    t(k) { return t(this.lang, k) },
    levelConfig() { return LEVELS[this.difficulty - 1] },

    // Treat a "small" viewport (typical tablet browser with URL bar + system
    // bars eating vertical space) as a tablet. Threshold picked so a desktop
    // window is comfortably above it, but a landscape tablet viewport
    // (~<= 900px tall or <= 1280px wide) trips it.
    detectTablet() {
      const w = window.innerWidth
      const h = window.innerHeight
      this.isTablet = h <= 900 || w <= 1280
    },

    playPromptAudio() {
      const dir = this.lang === 'zh' ? 'chinese' : 'english'
      // all -> 1.mp3, white -> 2.mp3, yellow -> 3.mp3
      const trackByType = { all: 1, white: 2, yellow: 3 }
      const track = trackByType[this.questionType]
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

    newRound() {
      const cfg = this.levelConfig()
      const yCount = rand(cfg.yellow[0], cfg.yellow[1])
      const wCount = rand(cfg.white[0], cfg.white[1])
      const types = shuffle([...Array(yCount).fill('yellow'), ...Array(wCount).fill('white')])
      const total = yCount + wCount

      // Measure the pond zone in real pixels so we can place ducks without
      // clipping. Falls back to a 3:1 aspect if the ref isn't ready yet
      // (matches ~50vw × 30vh on a 16:9 tablet in landscape).
      const pond = this.$refs.pond
      const pondW = pond ? pond.clientWidth  : 900
      const pondH = pond ? pond.clientHeight : 300
      const pondAspect = pondW / pondH

      // Grid layout so ducks stay inside pond zone, non-overlapping.
      let cols = Math.max(2, Math.round(Math.sqrt(total * pondAspect)))
      let rows = Math.ceil(total / cols)
      while (cols * rows < total) cols++

      const cellWpx = pondW / cols
      const cellHpx = pondH / rows
      // Duck is square (aspect ~1:1). Cap so it fits in the smaller cell dim.
      const maxDuckPx = (MAX_DUCK_SIZE / 100) * pondW
      const duckPx = Math.min(maxDuckPx, Math.min(cellWpx, cellHpx) * 0.85)
      // Convert back to percentages relative to their own axis.
      const sizePctW = (duckPx / pondW) * 100
      const sizePctH = (duckPx / pondH) * 100
      const cellWpct = 100 / cols
      const cellHpct = 100 / rows

      const cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) cells.push({ r, c })
      }
      shuffle(cells)

      this.ducks = types.map((type, i) => {
        const { r, c } = cells[i]
        const maxOffX = Math.max(0, cellWpct - sizePctW)
        const maxOffY = Math.max(0, cellHpct - sizePctH)
        return {
          id: i, type,
          x: c * cellWpct + Math.random() * maxOffX,
          y: r * cellHpct + Math.random() * maxOffY,
          size: sizePctW,
        }
      })

      const qtypes = ['yellow', 'white', 'all']
      this.questionType = qtypes[Math.floor(Math.random() * 3)]
      this.correctAns = this.questionType === 'yellow' ? yCount
                      : this.questionType === 'white' ? wCount
                      : total

      const opts = new Set([this.correctAns])
      let attempts = 0
      while (opts.size < 4 && attempts < 200) {
        attempts++
        const off = rand(1, 4) * (Math.random() < 0.5 ? 1 : -1)
        const c = this.correctAns + off
        if (c > 0) opts.add(c)
      }
      this.answers = shuffle([...opts])
      this.feedback = null
      this.selectedAns = null
      this.questionStart = Date.now()
      this.playPromptAudio()
    },

    checkAnswer(ans) {
      if (this.feedback) return
      this.selectedAns = ans
      const rt = Date.now() - this.questionStart
      this.responseTimes.push(rt)
      this.totalAnswers++
      this.periodTotal++

      if (ans === this.correctAns) {
        const pts = Math.round(5 * this.levelConfig().coef)
        this.score += pts
        this.correctAnswers++
        this.periodCorrect++
        this.feedback = 'correct'
      } else {
        this.feedback = 'wrong'
      }
      if (this.difficulty > this.maxDifficulty) this.maxDifficulty = this.difficulty

      setTimeout(() => this.newRound(), 700)
    },

    adjustDifficulty() {
      if (this.periodTotal === 0) return
      const rate = this.periodCorrect / this.periodTotal
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
      else if (rate <= 0.7 && this.difficulty > 1) this.difficulty--
    },

    endGame() {
      clearInterval(this._timer)
      if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null }
      const totalMs = this.responseTimes.reduce((a, b) => a + b, 0)
      const avgMs = this.responseTimes.length ? Math.round(totalMs / this.responseTimes.length) : 0
      const wrong = this.totalAnswers - this.correctAnswers
      const accuracy = this.totalAnswers ? Math.round(this.correctAnswers / this.totalAnswers * 100) : 0
      submitPbGameEndRecord(this.archiveId, 'syz', {
        score: this.score || 0,
        avgTime: toPbGameSeconds(avgMs || 0),
        successCount: this.correctAnswers,
        failCount: wrong,
        trainDuration: this.duration,
        difficultyLevel: this.difficulty, // 上传 = 页面当前难度
      }).catch(() => {})
      this.$emit('over', {
        time: new Date().toLocaleString(),
        maxLevel: this.maxDifficulty,
        duration: this.duration,
        total: this.totalAnswers,
        correct: this.correctAnswers,
        wrong,
        accuracy,
        avgMs,
        score: this.score,
      })
    },

    onBatchSkip() {
      skipPbBatchGame() // 跳过当前批次游戏
    },

    confirmExit() {
      if (confirm(this.lang === 'zh' ? '确定退出游戏？' : 'Exit game?')) {
        clearInterval(this._timer)
        if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null }
        leavePbGameWindow({ confirm: false })
      }
    }
  }
}
</script>

<style scoped>
.game-root { width: 100%; height: 100%; }
.game-bg {
  position: relative; width: 100%; height: 100%;
  background: url(~@/views/game/newG03/public/images/bacground.png) center/cover no-repeat;
  display: flex; flex-direction: column;
}

/* HUD */
.hud {
  position: relative; z-index: 10;
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0,30,80,0.72); padding: 1.5vmin 3vmin;
  flex-shrink: 0;
}
.hud-info { display: flex; gap: 4vmin; color: #fff; font-size: 2.8vmin; font-weight: 700; }
.hud-info b { color: #ffd700; margin-left: 0.6vmin; }
.hud-actions { display: flex; align-items: center; gap: 1.6vmin; }
.exit-btn {
  padding: 1.2vmin 3vmin; background: #e53935; color: #fff;
  border: none; border-radius: 2.5vmin; cursor: pointer;
  font-size: 2.4vmin; font-weight: 700;
}
.skip-btn {
  padding: 1.2vmin 3vmin; background: #6b7280; color: #fff;
  border: none; border-radius: 2.5vmin; cursor: pointer;
  font-size: 2.4vmin; font-weight: 700;
  transition: background 0.2s;
}
.skip-btn:hover { background: #4b5563; }

/* Question */
.question-bar {
  position: relative; z-index: 10;
  text-align: center; padding: 1.5vmin 2vmin;
  background: rgba(255,255,255,0.9);
  flex-shrink: 0;
}
.q-text { font-size: 3.4vmin; color: #1a3a7a; font-weight: 900; }

/* Pond zone — sits above the answer buttons, no overlap */
.pond-zone {
  position: absolute;
  top: 45%;
  left: 25%;
  width: 50%;
  height: 30%;
  overflow: hidden;
}
.duck-img {
  position: absolute;
  object-fit: contain;
  animation: duck-appear 0.35s ease both;
}
@keyframes duck-appear {
  from { opacity: 0; transform: scale(0.3) rotate(-15deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}

/* Answers */
.answers-bar {
  position: absolute; bottom: 3vmin; left: 0; right: 0; z-index: 10;
  display: flex; justify-content: center; gap: 4vmin; padding: 0 4vmin;
}
.ans-btn {
  min-width: 10vmin; min-height: 10vmin;
  width: 10vmin; height: 10vmin;
  border-radius: 50%; background: rgba(74,158,255,0.95); color: #fff;
  border: 0.5vmin solid rgba(255,255,255,0.7); font-size: 4.2vmin;
  font-weight: 900; cursor: pointer;
  transition: transform 0.15s, background 0.2s;
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.35);
  margin: 0 1.5vmin;
}
.ans-btn:hover:not(:disabled) { transform: scale(1.12); background: #2270c4; }
.ans-btn:disabled { cursor: not-allowed; }
.ans-btn.correct { background: #22c55e !important; border-color: #fff; }
.ans-btn.wrong   { background: #e53935 !important; border-color: #fff; }

/* Feedback flash */
.feedback-flash {
  position: absolute; top: 42%; left: 50%; transform: translate(-50%,-50%);
  font-size: 10vmin; font-weight: 900; z-index: 20;
  text-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.5); pointer-events: none;
}
.feedback-flash.correct { color: #22c55e; }
.feedback-flash.wrong   { color: #e53935; }
.fade-enter-active,.fade-leave-active { transition: opacity 0.3s; }
.fade-enter,.fade-leave-to { opacity: 0; }

/* ---------- Portrait (mobile / WeChat web-view) ---------- */
@media (orientation: portrait) {
  .hud {
    padding: 2.4vmin 3vmin;
    padding-top: calc(2.4vmin + env(safe-area-inset-top));
    flex-wrap: wrap;
    gap: 1.6vmin;
  }
  .hud-info {
    gap: 3vmin;
    font-size: max(3.4vmin, 14px);
    flex-wrap: wrap;
  }
  .hud-actions { gap: 2vmin; }
  .exit-btn, .skip-btn {
    padding: 2vmin 4vmin;
    border-radius: 4vmin;
    font-size: max(3.4vmin, 14px);
  }

  .question-bar { padding: 2.4vmin 3vmin; }
  .q-text { font-size: max(4.4vmin, 16px); }

  /* Pond: wider + taller so ducks are legible in portrait */
  .pond-zone {
    top: 30%;
    left: 5%;
    width: 90%;
    height: 40%;
  }

  /* Answer buttons: bigger, add safe-area padding */
  .answers-bar {
    gap: 5vmin;
    padding: 0 4vmin calc(2vmin + env(safe-area-inset-bottom));
    bottom: calc(3vmin + env(safe-area-inset-bottom));
    flex-wrap: wrap;
  }
  .ans-btn {
    min-width: 16vmin; min-height: 16vmin;
    width: 16vmin; height: 16vmin;
    font-size: max(6vmin, 22px);
    border-radius: 50%;
  }

  .feedback-flash { font-size: max(14vmin, 40px); }
}
</style>
