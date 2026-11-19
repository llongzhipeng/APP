<template>
  <div class="game-page">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-item">{{ t.level }}: {{ level }}</div>
      <div class="hud-item">{{ t.score }}: {{ score }}</div>
      <div class="hud-item" :class="{urgent: timeLeft <= 10}">{{ t.timeLeft }}: {{ timeLeft }}{{ t.sec }}</div>
    </div>
    <div class="top-hint">{{ t.findTarget }}</div>
    <div class="back-group">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
      <button class="back-btn" @click="confirmBack">{{ t.backBtn }}</button>
    </div>

    <!-- Items grid -->
    <div class="items-area">
      <div class="items-grid" :style="gridStyle">
        <div
          v-for="(item) in displayItems"
          :key="item.id"
          class="item-card"
          :class="itemClass(item)"
          @click="onClickItem(item)"
        >
          <img :src="item.src" alt="" />
        </div>
      </div>
    </div>

    <!-- Target bar -->
    <div class="target-bar">
      <div class="target-imgs">
        <div class="target-img-wrap" v-for="(src, i) in targetSrcs" :key="i">
          <span class="target-label">{{ t.targetLabel }}</span>
          <img :src="src" class="target-img" />
        </div>
      </div>
    </div>

    <!-- Feedback flash -->
    <transition name="fade">
      <div v-if="feedback" class="feedback" :class="feedback">
        {{ feedback === 'correct' ? t.correct : t.wrong }}
      </div>
    </transition>

    <!-- Confirm back dialog -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>{{ t.confirmBack }}</p>
        <div class="confirm-btns">
          <button @click="doBack">{{ t.confirm }}</button>
          <button @click="cancelBack">{{ t.cancel }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
import { elementImage } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const DIFFICULTY = [
  null,
  { targets: 1, distractors: 5, distTypes: 1, coeff: 1 },
  { targets: 1, distractors: 7, distTypes: 1, coeff: 1.5 },
  { targets: 2, distractors: 9, distTypes: 1, coeff: 2 },
  { targets: 2, distractors: 11, distTypes: 2, coeff: 2.5 },
  { targets: 3, distractors: 13, distTypes: 2, coeff: 3 },
  { targets: 3, distractors: 15, distTypes: 2, coeff: 3.5 },
]

const CATEGORIES = [
  { name: 'animal', files: Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0')) },
  { name: 'botany', files: Array.from({length:10},(_,i)=>i+11) },
  { name: 'electric_appliance', files: Array.from({length:10},(_,i)=>i+21) },
  { name: 'fruits', files: Array.from({length:10},(_,i)=>i+31) },
  { name: 'furniture', files: Array.from({length:10},(_,i)=>i+41) },
  { name: 'metal', files: Array.from({length:10},(_,i)=>i+51) },
  { name: 'nonmetal', files: Array.from({length:10},(_,i)=>i+61) },
  { name: 'Other', files: Array.from({length:10},(_,i)=>i+71) },
  { name: 'vegetable', files: Array.from({length:10},(_,i)=>i+81) },
]

function imgSrc(cat, n) {
  return elementImage(cat, n)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n)
}

let _uid = 0
function uid() { return ++_uid }

export default {
  props: { lang: String, duration: Number },
  emits: ['end', 'back'],
  data() {
    return {
      level: getBatchStartDifficultyForGame('zlss'),
      score: 0,
      timeLeft: this.duration,
      displayItems: [],
      targetSrcs: [],
      // per-round tracking
      roundStart: 0,
      reactionTimes: [],
      // per-60s window tracking
      windowCorrect: 0,
      windowTotal: 0,
      windowStart: 0,
      // overall stats
      totalCorrect: 0,
      totalWrong: 0,
      // clicked targets in current round
      clickedTargets: new Set(),
      feedback: null,
      showConfirm: false,
      showBatchSkip: shouldShowPbBatchSkip(),
      _timer: null,
      _windowTimer: null,
    }
  },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    gridStyle() {
      const n = this.displayItems.length
      const cols = n <= 6 ? 3 : n <= 12 ? 4 : 5
      const rows = Math.ceil(n / cols)
      // available area: viewport minus HUD (~7vmin) and target bar (~12vmin), with padding
      const gap = 1.5
      const availH = (100 - 7 - 22 - 4) / rows - gap   // vmin
      const availW = (100 - 6) / cols - gap              // vmin
      const size = Math.min(availH, availW)
      return {
        gridTemplateColumns: `repeat(${cols}, ${size}vmin)`,
        gridTemplateRows: `repeat(${rows}, ${size}vmin)`,
      }
    },
  },
  mounted() {
    this._vhHandler = () => document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`)
    this._vhHandler()
    window.addEventListener('resize', this._vhHandler)
    this.startRound()
    this._timer = setInterval(() => {
      this.timeLeft--
      if (this.timeLeft <= 0) this.endGame()
    }, 1000)
    this.windowStart = Date.now()
    this._windowTimer = setInterval(() => this.checkWindowAccuracy(), 60000)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._vhHandler)
    clearInterval(this._timer)
    clearInterval(this._windowTimer)
  },
  methods: {
    startRound() {
      const cfg = DIFFICULTY[this.level]
      const totalNeeded = cfg.targets + cfg.distractors

      // Pick distractor categories (different from target category)
      const allCats = shuffle(CATEGORIES)
      const targetCat = allCats[0]
      const distCats = allCats.slice(1, 1 + cfg.distTypes)

      // Pick target images
      const targetFiles = pickRandom(targetCat.files, cfg.targets)
      const targetImgs = targetFiles.map(n => ({ cat: targetCat.name, n, src: imgSrc(targetCat.name, n) }))

      // Pick distractor images (enough from distractor categories, no overlap with targets)
      const distItems = []
      let distCatIdx = 0
      while (distItems.length < cfg.distractors) {
        const dc = distCats[distCatIdx % distCats.length]
        const available = dc.files.filter(n => !targetFiles.includes(n) || dc.name !== targetCat.name)
        const needed = Math.min(cfg.distractors - distItems.length, available.length)
        const picked = pickRandom(available, needed)
        picked.forEach(n => distItems.push({ cat: dc.name, n, src: imgSrc(dc.name, n) }))
        distCatIdx++
        if (distCatIdx > 20) break // safety
      }

      // Build display items: targets + distractors shuffled
      const items = [
        ...targetImgs.map(img => ({ id: uid(), src: img.src, isTarget: true, clicked: false })),
        ...distItems.slice(0, cfg.distractors).map(img => ({ id: uid(), src: img.src, isTarget: false, clicked: false })),
      ]

      this.displayItems = shuffle(items)
      this.targetSrcs = targetImgs.map(img => img.src)
      this.clickedTargets = new Set()
      this.roundStart = Date.now()
    },

    itemClass(item) {
      if (item.clicked && item.isTarget) return 'correct'
      if (item.clicked && !item.isTarget) return 'wrong'
      return ''
    },

    onClickItem(item) {
      if (item.clicked) return
      item.clicked = true

      const rt = Date.now() - this.roundStart
      this.reactionTimes.push(rt)
      this.windowTotal++

      if (item.isTarget) {
        this.clickedTargets.add(item.id)
        const cfg = DIFFICULTY[this.level]
        this.score += Math.round(5 * cfg.coeff)
        this.totalCorrect++
        this.windowCorrect++
        this.showFeedback('correct')

        // Check if all targets found
        const allTargetsFound = this.displayItems
          .filter(i => i.isTarget)
          .every(i => i.clicked)
        if (allTargetsFound) {
          setTimeout(() => this.startRound(), 400)
        }
      } else {
        this.totalWrong++
        this.showFeedback('wrong')
        setTimeout(() => this.startRound(), 600)
      }
    },

    showFeedback(type) {
      this.feedback = type
      setTimeout(() => { this.feedback = null }, 600)
    },

    checkWindowAccuracy() {
      const total = this.windowTotal
      if (total === 0) return
      const rate = this.windowCorrect / total
      if (rate >= 0.9 && this.level < 6) this.level++
      else if (rate < 0.7 && this.level > 1) this.level--
      this.windowCorrect = 0
      this.windowTotal = 0
    },

    confirmBack() {
      clearInterval(this._timer)
      clearInterval(this._windowTimer)
      this.showConfirm = true
    },

    onBatchSkip() {
      skipPbBatchGame()
    },

    cancelBack() {
      this.showConfirm = false
      this._timer = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) this.endGame()
      }, 1000)
      this._windowTimer = setInterval(() => this.checkWindowAccuracy(), 60000)
    },

    doBack() {
      clearInterval(this._timer)
      clearInterval(this._windowTimer)
      this.showConfirm = false
      leavePbGameWindow({ confirm: false })
    },

    endGame() {
      clearInterval(this._timer)
      clearInterval(this._windowTimer)
      const total = this.totalCorrect + this.totalWrong
      const avgReaction = this.reactionTimes.length
        ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length / 100) / 10
        : 0
      const durationLabel = this.duration === 60 ? '1min' : this.duration === 180 ? '3min' : '5min'
      this.$emit('end', {
        finalLevel: this.level,
        score: this.score,
        totalRounds: total,
        correctRounds: this.totalCorrect,
        wrongRounds: this.totalWrong,
        avgReaction,
        duration: this.duration, // 训练时长（秒），供上传 trainDuration
        durationLabel,
        minReactionTime: this.reactionTimes.length ? Math.min(...this.reactionTimes) : 0,
        maxReactionTime: this.reactionTimes.length ? Math.max(...this.reactionTimes) : 0,
      })
    },
  },
}
</script>

<style scoped>
.game-page {
  width: 100vw; height: 100vh; height: calc(var(--real-vh, 1vh) * 100);
  background: radial-gradient(ellipse at 50% 20%, #0d2b4e 0%, #061525 70%);
  display: flex; flex-direction: column;
  box-sizing: border-box; overflow: hidden; position: relative;
}
.hud {
  position: absolute; top: 1.5vmin; left: 2vmin;
  display: flex; gap: 3vmin; align-items: center;
}
.hud-item { color: #c8e0ff; font-size: 2vmin; font-weight: 600; }
.hud-item.urgent { color: #ff6b6b; animation: blink 0.5s ease-in-out infinite; }
.top-hint {
  position: absolute; top: 1.5vmin; left: 50%; transform: translateX(-50%);
  color: rgba(200,224,255,0.8); font-size: 2vmin; white-space: nowrap;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.back-group {
  position: absolute; top: 1.5vmin; right: 2vmin;
  display: flex; align-items: center; gap: 10px;
}
.back-btn {
  padding: 0.8vmin 2vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: rgba(20,60,100,0.8); border: 0.2vmin solid rgba(100,180,255,0.3); color: #c8e0ff;
}
.back-btn:hover { background: rgba(30,80,140,0.9); }

.items-area {
  margin-top: 6vmin;
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1vmin 3vmin;
  box-sizing: border-box;
  overflow: hidden;
}
.items-grid {
  display: grid;
  gap: 1.5vmin;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-height: 100%;
  grid-auto-rows: 1fr;
}
.item-card {
  background: rgba(255,255,255,0.08);
  border: 0.3vmin solid rgba(255,255,255,0.1);
  border-radius: 1.2vmin;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; overflow: hidden;
}
.item-card:hover { transform: scale(1.05); border-color: rgba(100,180,255,0.4); background: rgba(100,180,255,0.1); }
.item-card.correct { border-color: #4caf50; background: rgba(76,175,80,0.25); pointer-events: none; }
.item-card.wrong { border-color: #f44336; background: rgba(244,67,54,0.25); pointer-events: none; }
.item-card img { width: 80%; height: 80%; object-fit: contain; }

.target-bar {
  width: 100%; padding: 1.5vmin 3vmin;
  background: rgba(10,30,60,0.95);
  border-top: 0.3vmin solid rgba(100,180,255,0.3);
  display: flex; align-items: center; justify-content: center;
  box-sizing: border-box; flex-shrink: 0;
}
.target-imgs { display: flex; gap: 3vmin; justify-content: center; }
.target-img-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.5vmin; }
.target-label { color: #64b4ff; font-size: 1.8vmin; font-weight: 700; }
.target-img { width: 16vmin; height: 16vmin; object-fit: contain; background: rgba(255,255,255,0.12); border-radius: 2vmin; padding: 0.8vmin; border: 0.3vmin solid rgba(100,180,255,0.4); }

.feedback {
  position: fixed; top: 40%; left: 50%; transform: translate(-50%,-50%);
  font-size: 6vmin; font-weight: 900; pointer-events: none; z-index: 50;
}
.feedback.correct { color: #4caf50; text-shadow: 0 0 2vmin rgba(76,175,80,0.8); }
.feedback.wrong { color: #f44336; text-shadow: 0 0 2vmin rgba(244,67,54,0.8); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.confirm-box {
  background: #0d2b4e; border: 0.2vmin solid rgba(100,180,255,0.3);
  border-radius: 2vmin; padding: 4vmin 5vmin; text-align: center;
}
.confirm-box p { color: #c8e0ff; font-size: 2.5vmin; margin-bottom: 3vmin; }
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
.confirm-btns button {
  padding: 1.2vmin 3vmin; font-size: 2vmin; border-radius: 1vmin; cursor: pointer;
  background: rgba(20,60,100,0.8); border: 0.2vmin solid rgba(100,180,255,0.3); color: #c8e0ff;
}
.confirm-btns button:first-child { background: linear-gradient(135deg,#1a5fa8,#2e8fd4); }
</style>
