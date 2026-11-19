<template>
  <div class="game-page">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.level }}</span>
          <span class="hud-value">{{ difficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-value gold">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-value" :class="{ urgent: gameTimeLeft <= 10 }">{{ formatTime(gameTimeLeft) }}</span>
        </div>
      </div>
      <div class="hud-center">
        <span class="task-msg">{{ t.taskMsg }}</span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
        <button class="back-btn" @click="onBackClick">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Scatter area -->
    <div class="scatter-area">
      <div class="scatter-grid" :style="scatterGridStyle">
        <img
          v-for="(item, i) in scatterItems"
          :key="roundKey + '-' + i"
          :src="item.src"
          class="scatter-img"
        />
      </div>
    </div>

    <!-- Choice buttons -->
    <div class="choices-area">
      <button
        v-for="(choice, i) in choices"
        :key="i"
        class="choice-btn"
        :class="choiceClass(choice)"
        :disabled="answered"
        @click="onChoose(choice)"
      >
        <img :src="choice.src" class="choice-img" />
        <span class="choice-label">{{ choice.name }}</span>
        <span class="choice-count">{{ answered ? choice.count : '?' }}</span>
      </button>
    </div>

    <!-- Feedback overlay -->
    <transition name="fade">
      <div v-if="feedbackType" class="feedback-overlay">
        <div class="feedback-msg" :class="feedbackType">
          {{ feedbackType === 'correct' ? t.correct : t.wrong }}
        </div>
      </div>
    </transition>

    <!-- Back confirm -->
    <div v-if="showBackConfirm" class="confirm-overlay" @click.self="showBackConfirm = false">
      <div class="confirm-box">
        <p class="confirm-text">{{ t.confirmBack }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="cancelBack">{{ t.cancel }}</button>
          <button class="cbtn confirm" @click="forceBack">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
import { FRUIT_IMGS, ANIMAL_IMGS } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const LEVELS = [
  { kinds: 2, min: 1, max: 5,  coeff: 1,   largeDiff: true  },
  { kinds: 2, min: 3, max: 7,  coeff: 1.5, largeDiff: false },
  { kinds: 3, min: 1, max: 5,  coeff: 2,   largeDiff: false },
  { kinds: 3, min: 3, max: 7,  coeff: 2.5, largeDiff: false },
  { kinds: 4, min: 3, max: 7,  coeff: 3,   largeDiff: false },
  { kinds: 4, min: 4, max: 10, coeff: 3.5, largeDiff: false },
]

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

const FRUIT_NAMES  = {'1.png':'桃子','2.png':'橘子','3.png':'柚子','4.png':'西瓜','5.png':'葡萄','6.png':'樱桃','7.png':'猕猴桃','8.png':'苹果','9.png':'梨'}
const ANIMAL_NAMES = {'1.png':'猴子','2.png':'山羊','3.png':'大象','4.png':'小狗','5.png':'奶牛','6.png':'松鼠','7.png':'狮子','8.png':'狐狸','9.png':'狼','10.png':'兔子','11.png':'小猫','12.png':'老虎'}

function pickN(pool, n) {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}

function generateCounts(cfg) {
  const { kinds, min, max, largeDiff } = cfg
  let counts
  let attempts = 0
  do {
    counts = Array.from({ length: kinds }, () => randInt(min, max))
    const maxVal = Math.max(...counts)
    const maxCount = counts.filter(c => c === maxVal).length
    if (maxCount > 1) continue
    if (largeDiff) {
      const sorted = [...counts].sort((a, b) => b - a)
      if (sorted[0] - sorted[1] < 3) continue
    }
    break
  } while (++attempts < 200)
  return counts
}

function placeItems(kindList) {
  const items = []
  for (const { src, count } of kindList) {
    for (let j = 0; j < count; j++) items.push({ src })
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = randInt(0, i); [items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

export default {
  props: { lang: String, duration: Number },
  data() {
    return {
      difficulty: getBatchStartDifficultyForGame('slbj'),
      score: 0,
      gameTimeLeft: this.duration,
      roundKey: 0,
      scatterItems: [],
      choices: [],
      answered: false,
      feedbackType: null,
      showBackConfirm: false,
      showBatchSkip: shouldShowPbBatchSkip(),
      totalRounds: 0,
      correctRounds: 0,
      wrongRounds: 0,
      windowStart: Date.now(),
      windowCorrect: 0,
      windowTotal: 0,
      roundStartTime: 0,
      totalReactionMs: 0,
      reactionCount: 0,
      gameTimer: null,
      feedbackTimer: null,
    }
  },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    cfg() { return LEVELS[this.difficulty - 1] },
    gridCols() {
      const total = this.scatterItems.length
      return Math.ceil(Math.sqrt(total * 1.5))
    },
    gridRows() {
      return Math.ceil(this.scatterItems.length / this.gridCols)
    },
    scatterGridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${this.gridRows}, 1fr)`,
      }
    },
  },
  mounted() {
    this._vhHandler = () => document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
    this._vhHandler()
    window.addEventListener('resize', this._vhHandler)
    this.startRound()
    this.gameTimer = setInterval(() => {
      this.gameTimeLeft--
      if (this.gameTimeLeft <= 0) {
        this.clearTimers()
        this.endGame()
      }
    }, 1000)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._vhHandler)
    this.clearTimers()
  },
  methods: {
    startRound() {
      this.roundKey++
      this.answered = false
      this.feedbackType = null
      const cfg = this.cfg
      const isFruitRound = Math.random() < 0.5
      const pool    = isFruitRound ? FRUIT_IMGS  : ANIMAL_IMGS
      const nameMap = isFruitRound ? FRUIT_NAMES : ANIMAL_NAMES
      const counts  = generateCounts({ kinds: cfg.kinds, min: cfg.min, max: cfg.max, largeDiff: cfg.largeDiff })
      const kindList = pickN(pool, cfg.kinds).map((src, i) => ({
        src, name: nameMap[src.split('/').pop()], count: counts[i],
      }))
      const maxCount = Math.max(...kindList.map(k => k.count))
      this.choices = kindList.map(k => ({ ...k, isMax: k.count === maxCount }))
      this.scatterItems = placeItems(kindList)
      this.roundStartTime = Date.now()
    },
    onChoose(choice) {
      if (this.answered) return
      this.answered = true
      const correct = choice.isMax
      this.totalRounds++
      if (correct) {
        this.correctRounds++
        this.windowCorrect++
        this.score += Math.round(5 * this.cfg.coeff)
        const rt = (Date.now() - this.roundStartTime) / 1000
        this.totalReactionMs += rt
        this.reactionCount++
      } else {
        this.wrongRounds++
      }
      this.windowTotal++
      this.feedbackType = correct ? 'correct' : 'wrong'

      // Check 60s window
      const elapsed = (Date.now() - this.windowStart) / 1000
      if (elapsed >= 60) {
        this.adjustDifficulty()
        this.windowStart = Date.now()
        this.windowCorrect = 0
        this.windowTotal = 0
      }

      clearTimeout(this.feedbackTimer)
      this.feedbackTimer = setTimeout(() => {
        if (this.gameTimeLeft > 0) this.startRound()
      }, 1000)
    },
    choiceClass(choice) {
      if (!this.answered) return ''
      if (choice.isMax) return 'correct'
      return 'wrong'
    },
    adjustDifficulty() {
      if (this.windowTotal === 0) return
      const rate = this.windowCorrect / this.windowTotal
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
      else if (rate < 0.7 && this.difficulty > 1) this.difficulty--
    },
    formatTime(s) {
      const m = Math.floor(s / 60)
      const ss = s % 60
      return `${m}:${String(ss).padStart(2, '0')}`
    },
    endGame() {
      const avgReaction = this.reactionCount > 0
        ? (this.totalReactionMs / this.reactionCount).toFixed(1) + this.t.sec
        : '--'
      this.$emit('end', {
        score: this.score,
        finalLevel: this.difficulty,
        totalRounds: this.totalRounds,
        correctRounds: this.correctRounds,
        wrongRounds: this.wrongRounds,
        duration: this.duration,
        avgReaction,
      })
    },
    clearTimers() {
      clearInterval(this.gameTimer)
      clearTimeout(this.feedbackTimer)
    },
    onBackClick() {
      this.clearTimers()
      this.showBackConfirm = true
    },
    cancelBack() {
      this.showBackConfirm = false
      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--
        if (this.gameTimeLeft <= 0) { this.clearTimers(); this.endGame() }
      }, 1000)
    },
    forceBack() {
      this.clearTimers()
      this.showBackConfirm = false
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
  },
}
</script>

<style scoped>
.game-page {
  width: 100vw; height: 100vh; height: calc(var(--real-vh, 1vh) * 100);
  background: #f5f0e8;
  display: flex; flex-direction: column; overflow: hidden; position: relative;
}
.hud {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.5vmin 3vmin; flex-shrink: 0; z-index: 10; position: relative;
}
.hud-left { display: flex; gap: 2vmin; }
.hud-item {
  background: #fff; padding: 1.2vmin 2vmin; border-radius: 1.5vmin;
  border: 0.2vmin solid #d0c8b8;
  display: flex; flex-direction: column; align-items: center; gap: 0.3vmin;
  box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.08);
}
.hud-label { font-size: 1.2vmin; color: #888; }
.hud-value { font-size: 2.5vmin; font-weight: 800; color: #333; }
.hud-value.gold { color: #d4900a; }
.hud-value.urgent { color: #e03030; animation: blink 0.6s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }
.hud-center { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 2vmin; }
.task-msg {
  font-size: 2.2vmin; color: #444; font-weight: 700;
  background: #fff; padding: 1.5vmin 3vmin; border-radius: 1.5vmin;
  border: 0.2vmin solid #d0c8b8; text-align: center;
  box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.08);
}
.hud-right { display: flex; align-items: center; gap: 10px; }
.back-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.6vmin; font-weight: 700;
  background: #ffe8e8; border: 0.2vmin solid #f0b0b0;
  color: #c0392b; border-radius: 1.2vmin; cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { background: #ffd0d0; }

/* Scatter area */
.scatter-area {
  flex: 1 1 0; min-height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;
  padding: 1vmin;
}
.scatter-grid {
  display: grid; gap: 0.3vmin;
  width: 100%; height: 100%; overflow: hidden;
}
.scatter-img {
  width: 100%; height: 100%; min-width: 0; min-height: 0; object-fit: contain;
}

/* Choices */
.choices-area {
  display: flex; justify-content: center; align-items: center; flex-wrap: wrap;
  gap: 2vmin; padding: 2vmin 3vmin; flex-shrink: 0;
  background: #ede8df; border-top: 0.15vmin solid #d0c8b8;
}
.choice-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.8vmin;
  padding: 1.2vmin 2vmin; border-radius: 2vmin; cursor: pointer;
  background: #fff; border: 0.3vmin solid #c8e6c9;
  transition: all 0.2s; min-width: 13vmin;
  box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.08);
}
.choice-btn:hover:not(:disabled) { transform: translateY(-0.5vmin) scale(1.05); background: #f0faf0; }
.choice-btn:disabled { cursor: default; }
.choice-btn.correct { background: #d4edda; border-color: #5cb85c; box-shadow: 0 0 2vmin rgba(92,184,92,0.4); }
.choice-btn.wrong { background: #fde8e8; border-color: #e57373; }
.choice-img { width: 9vmin; height: 9vmin; object-fit: contain; }
.choice-label { font-size: 2vmin; font-weight: 800; color: #444; }
.choice-count { font-size: 2.5vmin; font-weight: 900; color: #333; }

/* Feedback */
.feedback-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  pointer-events: none; z-index: 50;
}
.feedback-msg {
  font-size: 8vmin; font-weight: 900; padding: 2vmin 5vmin; border-radius: 2vmin;
  animation: pop 0.3s ease-out;
}
.feedback-msg.correct { color: #2e7d32; background: rgba(212,237,218,0.95); border: 0.3vmin solid #5cb85c; }
.feedback-msg.wrong { color: #c62828; background: rgba(253,232,232,0.95); border: 0.3vmin solid #e57373; }
@keyframes pop { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* Confirm */
.confirm-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.confirm-box {
  background: #fff; border: 0.2vmin solid #d0c8b8; border-radius: 2vmin;
  padding: 3.5vmin 5vmin; display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  box-shadow: 0 1vmin 4vmin rgba(0,0,0,0.15);
}
.confirm-text { color: #333; font-size: 2.2vmin; font-weight: 600; }
.confirm-btns { display: flex; gap: 2vmin; }
.cbtn { padding: 1.2vmin 3.5vmin; font-size: 2vmin; font-weight: 700; border-radius: 1vmin; cursor: pointer; transition: all 0.2s; }
.cbtn.cancel { background: #f0ebe2; border: 0.2vmin solid #c8bfb0; color: #555; }
.cbtn.cancel:hover { background: #e5dfd5; }
.cbtn.confirm { background: linear-gradient(135deg, #4caf50, #66bb6a); border: 0.2vmin solid #a5d6a7; color: #fff; }
.cbtn.confirm:hover { background: linear-gradient(135deg, #43a047, #5cb860); }
</style>
