<template>
  <div class="game-page">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-item">{{ t.difficulty }}: <strong>{{ difficulty }}</strong></div>
      <div class="hud-item">{{ t.score }}: <strong>{{ score }}</strong></div>
      <div class="hud-center">{{ phase === 'mem' ? t.memPhase : t.clickPhase }}</div>
      <div class="hud-item">{{ t.timeLeft }}: <strong>{{ timeLeftDisplay }}</strong></div>
      <div class="quit-group">
         <button v-if="showBatchSkip" class="quit-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skip }}</button>
        <button class="quit-btn" @click="onQuitClick">{{ t.quit }}</button>
      </div>
    </div>

    <!-- Ocean -->
    <div class="ocean">
      <div
        v-for="fish in fishes" :key="fish.id"
        class="fish-wrap"
        :class="{ clickable: phase === 'click', wrong: fish.wrong, correct: fish.correct, gone: fish.gone }"
        :style="fish.style"
        @click="onFishClick(fish)"
      >
        <img :src="fish.src" class="fish-img" />
        <span class="fish-num" :class="{ hidden: phase === 'click' }">{{ fish.num }}</span>
        <span v-if="fish.correct" class="fish-badge correct-badge">✓</span>
        <span v-if="fish.wrong" class="fish-badge wrong-badge">✗</span>
      </div>

      <!-- Mem countdown overlay -->
      <div v-if="phase === 'mem'" class="mem-bar">
        <div class="mem-fill" :style="{ width: memPct + '%' }"></div>
      </div>

      <!-- Feedback flash -->
      <transition name="fade">
        <div v-if="feedback" class="feedback-flash" :class="feedback">
          {{ feedback === 'correct' ? t.correct : t.wrong }}
        </div>
      </transition>
    </div>

    <!-- Quit confirm -->
    <div v-if="showQuit" class="overlay">
      <div class="confirm-box">
        <p>{{ t.quitConfirm }}</p>
        <div class="confirm-btns">
          <button class="cbtn yes" @click="doQuit">{{ t.quitYes }}</button>
          <button class="cbtn no" @click="cancelQuit">{{ t.quitNo }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fishImage } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const LEVELS = [
  { fish: 2, mem: 5, min: 1, max: 10, consecutive: true,  coef: 1   },
  { fish: 2, mem: 5, min: 1, max: 10, consecutive: false, coef: 1.5 },
  { fish: 3, mem: 5, min: 1, max: 10, consecutive: true,  coef: 2   },
  { fish: 3, mem: 5, min: 1, max: 20, consecutive: true,  coef: 2.5 },
  { fish: 4, mem: 8, min: 1, max: 20, consecutive: false, coef: 3   },
  { fish: 4, mem: 8, min: 1, max: 50, consecutive: true,  coef: 3.5 },
]

function pickNums(level) {
  const { fish, min, max, consecutive } = LEVELS[level - 1]
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  if (consecutive) {
    const start = Math.floor(Math.random() * (pool.length - fish + 1))
    return pool.slice(start, start + fish).sort(() => Math.random() - 0.5)
  }
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, fish)
}

function randPos(existing, size) {
  const margin = 20
  for (let i = 0; i < 100; i++) {
    const x = margin + Math.random() * (820 - size - margin * 2)
    const y = margin + Math.random() * (480 - size - margin * 2)
    const ok = existing.every(e => Math.hypot(e.x - x, e.y - y) > size + 20)
    if (ok) return { x, y }
  }
  return { x: Math.random() * 700, y: Math.random() * 400 }
}

export default {
  name: 'GamePage',
  props: { t: Object, duration: Number },
  emits: ['end', 'quit'],
  data() {
    const startDifficulty = getBatchStartDifficultyForGame('szlx')
    return {
      difficulty: startDifficulty,
      score: 0,
      timeLeft: this.duration,
      phase: 'mem',   // 'mem' | 'click'
      fishes: [],
      nextClickIdx: 0,
      feedback: null,
      showQuit: false,
      showBatchSkip: shouldShowPbBatchSkip(),
      memTimer: null,
      memElapsed: 0,
      gameTimer: null,
      // stats
      totalRounds: 0,
      successRounds: 0,
      failRounds: 0,
      reactionTimes: [],
      roundStartTime: 0,
      // adaptive
      windowStart: 0,
      windowCorrect: 0,
      windowTotal: 0,
      maxDifficulty: startDifficulty,
    }
  },
  computed: {
    timeLeftDisplay() {
      const m = Math.floor(this.timeLeft / 60)
      const s = this.timeLeft % 60
      return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`
    },
    memPct() {
      const mem = LEVELS[this.difficulty - 1].mem
      return Math.max(0, 100 - (this.memElapsed / mem) * 100)
    },
  },
  mounted() {
    this.windowStart = Date.now()
    this.startRound()
    this.gameTimer = setInterval(() => {
      this.timeLeft--
      // adaptive check every 60s
      const elapsed = Math.floor((Date.now() - this.windowStart) / 1000)
      if (elapsed >= 60) {
        this.adaptDifficulty()
        this.windowStart = Date.now()
        this.windowCorrect = 0
        this.windowTotal = 0
      }
      if (this.timeLeft <= 0) this.endGame()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.gameTimer)
    clearTimeout(this.memTimer)
  },
  methods: {
    startRound() {
      const nums = pickNums(this.difficulty)
      const sorted = [...nums].sort((a, b) => a - b)
      const size = 150
      const positions = []
      this.fishes = nums.map((num, i) => {
        const pos = randPos(positions, size)
        positions.push(pos)
        return {
          id: i,
          num,
          sortedIdx: sorted.indexOf(num),
          src: fishImage((i % 4) + 1),
          style: { left: pos.x + 'px', top: pos.y + 'px', width: size + 'px', height: size + 'px' },
          wrong: false, correct: false, gone: false,
        }
      })
      this.nextClickIdx = 0
      this.phase = 'mem'
      this.memElapsed = 0
      const mem = LEVELS[this.difficulty - 1].mem
      const tick = () => {
        this.memElapsed += 0.1
        if (this.memElapsed >= mem) {
          this.phase = 'click'
          this.roundStartTime = Date.now()
        } else {
          this.memTimer = setTimeout(tick, 100)
        }
      }
      this.memTimer = setTimeout(tick, 100)
    },
    onFishClick(fish) {
      if (this.phase !== 'click' || fish.correct || fish.gone) return
      const sorted = [...this.fishes].sort((a, b) => a.num - b.num)
      const expected = sorted[this.nextClickIdx]
      if (fish.id === expected.id) {
        fish.correct = true
        this.nextClickIdx++
        if (this.nextClickIdx === this.fishes.length) {
          // round complete
          const rt = Date.now() - this.roundStartTime
          this.reactionTimes.push(rt)
          this.score += Math.round(5 * LEVELS[this.difficulty - 1].coef)
          this.totalRounds++
          this.successRounds++
          this.windowCorrect++
          this.windowTotal++
          this.showFeedback('correct')
          setTimeout(() => this.startRound(), 800)
        }
      } else {
        fish.wrong = true
        this.totalRounds++
        this.failRounds++
        this.windowTotal++
        this.showFeedback('wrong')
        setTimeout(() => this.startRound(), 800)
      }
    },
    showFeedback(type) {
      this.feedback = type
      setTimeout(() => { this.feedback = null }, 600)
    },
    adaptDifficulty() {
      if (this.windowTotal === 0) return
      const rate = this.windowCorrect / this.windowTotal
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
      else if (rate < 0.7 && this.difficulty > 1) this.difficulty--
      if (this.difficulty > this.maxDifficulty) this.maxDifficulty = this.difficulty
    },
    endGame() {
      clearInterval(this.gameTimer)
      clearTimeout(this.memTimer)
      const avg = this.reactionTimes.length
        ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
        : 0
      this.$emit('end', {
        score: this.score,
        totalRounds: this.totalRounds,
        successRounds: this.successRounds,
        failRounds: this.failRounds,
        successRate: this.totalRounds > 0 ? Math.round((this.successRounds / this.totalRounds) * 100) : 0,
        avgReaction: avg,
       maxDifficulty: this.difficulty, // 与 HUD 当前难度一致（供上传）
      })
    },
    onQuitClick() {
      clearInterval(this.gameTimer)
      this.showQuit = true
    },
    cancelQuit() {
      this.showQuit = false
      this.gameTimer = setInterval(() => {
        this.timeLeft--
        const elapsed = Math.floor((Date.now() - this.windowStart) / 1000)
        if (elapsed >= 60) {
          this.adaptDifficulty()
          this.windowStart = Date.now()
          this.windowCorrect = 0
          this.windowTotal = 0
        }
        if (this.timeLeft <= 0) this.endGame()
      }, 1000)
    },
    doQuit() {
      clearInterval(this.gameTimer)
      clearTimeout(this.memTimer)
      this.showQuit = false
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
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.hud {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px;
  position: relative; z-index: 10;
  color: #fff; font-size: 16px; flex-shrink: 0;
}
.hud-item {
  white-space: nowrap;
  background: rgba(0,20,50,0.65); backdrop-filter: blur(6px);
  padding: 5px 14px; border-radius: 20px;
  border: 1px solid rgba(0,180,255,0.25);
}
.hud-item strong { color: #7ee8fa; font-size: 18px; }
.hud-center {
  flex: 1; text-align: center; font-size: 17px; color: #fff; font-weight: 700;
  background: rgba(0,20,50,0.65); backdrop-filter: blur(6px);
  padding: 5px 20px; border-radius: 20px;
  border: 1px solid rgba(0,180,255,0.25);
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}
.quit-group { display: flex; align-items: center; gap: 10px; }
.quit-btn {
  margin-left: auto; padding: 6px 18px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1);
  color: #fff; font-size: 14px; cursor: pointer;
}
.quit-btn:hover { background: rgba(255,255,255,0.2); }
.ocean {
  flex: 1; position: relative; overflow: hidden;
}
.fish-wrap {
  position: absolute; display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s;
  animation: fishSwim 4s ease-in-out infinite;
}
.fish-wrap.clickable { cursor: pointer; }
.fish-wrap.clickable:hover { transform: scale(1.12); }
.fish-wrap.correct { opacity: 0.5; }
.fish-wrap.wrong { animation: shake 0.3s; }
@keyframes fishSwim {
  0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)}
}
@keyframes shake {
  0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)}
}
.fish-img { width: 100%; height: 100%; object-fit: contain; }
.fish-num {
  position: absolute; top: 0; right: 0;
  background: #ff6b35; color: #fff; border-radius: 50%;
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 900; border: 3px solid #fff;
  transition: all 0.3s;
}
.fish-num.hidden { background: rgba(0,0,0,0.45); color: transparent; }
.fish-badge {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 900; border: 3px solid #fff;
}
.correct-badge { background: #4caf50; color: #fff; }
.wrong-badge { background: #f44336; color: #fff; }
.mem-bar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 6px;
  background: rgba(255,255,255,0.15);
}
.mem-fill { height: 100%; background: linear-gradient(90deg, #00b4ff, #7ee8fa); transition: width 0.1s linear; }
.feedback-flash {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 48px; font-weight: 900; pointer-events: none;
  text-shadow: 0 0 20px currentColor;
}
.feedback-flash.correct { color: #4caf50; }
.feedback-flash.wrong { color: #f44336; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }
.overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.confirm-box {
  background: rgba(0,30,70,0.95); border: 1px solid rgba(0,180,255,0.3);
  border-radius: 20px; padding: 36px 48px; color: #fff;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
  font-size: 18px;
}
.confirm-btns { display: flex; gap: 16px; }
.cbtn {
  padding: 10px 32px; border-radius: 20px; border: none;
  font-size: 16px; font-weight: 700; cursor: pointer;
}
.cbtn.yes { background: #f44336; color: #fff; }
.cbtn.no { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
</style>
