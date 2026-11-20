<template>
  <div class="game-page">
    <svg viewBox="0 0 1600 900" class="bg-svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8ed"/>
          <stop offset="100%" stop-color="#f2e5d4"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bgGrad)"/>
      <g opacity="0.05" stroke="#4A90D9" stroke-width="1">
        <line v-for="x in 17" :key="'vl'+x" :x1="x*100" y1="0" :x2="x*100" y2="900"/>
        <line v-for="y in 10" :key="'hl'+y" x1="0" :y1="y*100" x2="1600" :y2="y*100"/>
      </g>
    </svg>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.level }}</span>
          <span class="hud-value level-badge">{{ difficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-value">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-value" :class="{ 'time-urgent': gameTimeLeft <= 10 }">{{ formatTime(gameTimeLeft) }}</span>
        </div>
      </div>
      <div class="hud-center">
        <span class="task-msg">{{ t.taskMsg }}</span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ lang === 'zh' ? '跳过游戏' : 'Skip' }}</button>
        <button class="back-btn" @click="onBackClick">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Game area -->
    <div class="game-area">
      <!-- Left: target piece (single shape, centered in its own viewBox) -->
      <div class="left-panel">
        <div class="panel-label">{{ lang === 'zh' ? '目标积木' : 'Target Piece' }}</div>
        <div class="target-wrap">
          <svg :viewBox="targetViewBox" class="single-svg">
            <polygon
              :points="targetPiece.points"
              :fill="targetColor"
              stroke="#0a1428"
              stroke-width="0.5"
              :transform="targetTransform"
            />
          </svg>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Right: full tangram, user clicks the matching piece -->
      <div class="right-panel">
        <div class="panel-label">
          {{ lang === 'zh'
            ? `点击右侧七巧板中形状相同的那一块（共 ${pieceCount} 块）`
            : `Click the matching piece in the tangram (${pieceCount} pieces)` }}
        </div>
        <div class="tangram-wrap">
          <svg viewBox="-2 -2 104 104" class="tangram-svg">
            <polygon
              v-for="(p, i) in currentPieces"
              :key="roundKey + '-' + i"
              :points="p.points"
              :fill="p.color"
              :stroke="pieceStroke(i, p)"
              :stroke-width="pieceStrokeWidth(i, p)"
              class="clickable-piece"
              :class="{
                'piece-correct': answered && p.isCorrect,
                'piece-wrong': answered && i === selectedIdx && !p.isCorrect,
                'piece-reveal': answered && !isCorrectAnswer && p.isCorrect,
              }"
              @click="onSelect(i)"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Feedback -->
    <transition name="feedback-fade">
      <div v-if="feedback" class="feedback-overlay">
        <div class="feedback-msg" :class="feedback">
          <div class="feedback-icon">{{ feedback === 'correct' ? '✓' : '✗' }}</div>
          <div class="feedback-text">{{ feedback === 'correct' ? t.correct : t.wrong }}</div>
        </div>
      </div>
    </transition>

    <!-- Confirm back -->
    <div v-if="showBackConfirm" class="confirm-overlay" @click.self="cancelBack">
      <div class="confirm-box">
        <p class="confirm-text">{{ t.confirmBack }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="cancelBack">{{ t.cancel }}</button>
          <button class="cbtn confirm-ok" @click="forceBack">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
import { TANGRAMS, PIECE_COLORS, PIECES_PER_DIFFICULTY } from '../tangrams.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'jmtz'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Bounding box of an SVG polygon-points string
function bbox(pointsStr) {
  const pts = pointsStr.trim().split(/\s+/).map(s => s.split(',').map(Number))
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of pts) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY }
}

export default {
  props: { lang: String, duration: Number },
  emits: ['end', 'back'],
  data() {
    return {
      roundKey: 0,
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE), // 起始难度
      score: 0,
      gameTimeLeft: this.duration,
      currentPieces: [],   // [{ points, color, isCorrect }]
      targetIdx: 0,        // index of the piece that is the "correct" answer
      targetColor: '#888', // color for the left preview (intentionally different from the right piece)
      targetRotation: 0,   // 0/90/180/270, applied to left target preview only
      targetMirror: 1,     // 1 or -1 (horizontal flip), applied to left target preview only
      selectedIdx: null,
      answered: false,
      feedback: null,
      showBackConfirm: false,
      showBatchSkip: shouldShowPbBatchSkip(), // 仅一键启动显示跳过
      totalRounds: 0,
      correctRounds: 0,
      wrongRounds: 0,
      windowCorrect: 0,
      windowTotal: 0,
      windowStart: Date.now(),
      totalReactionMs: 0,
      reactionCount: 0,
      roundStartTime: 0,
      gameTimer: null,
      feedbackTimer: null,
    }
  },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    pieceCount() { return PIECES_PER_DIFFICULTY[this.difficulty] || 3 },
    targetPiece() {
      return this.currentPieces[this.targetIdx] || { points: '', color: '#888' }
    },
    targetViewBox() {
      // Same scale as right tangram (104×104 viewBox over 55vmin) but centered on the piece,
      // so size matches but position doesn't give the answer away.
      if (!this.targetPiece.points) return '-2 -2 104 104'
      const b = bbox(this.targetPiece.points)
      const cx = (b.minX + b.maxX) / 2
      const cy = (b.minY + b.maxY) / 2
      return `${cx - 52} ${cy - 52} 104 104`
    },
    targetTransform() {
      if (!this.targetPiece.points) return ''
      const b = bbox(this.targetPiece.points)
      const cx = (b.minX + b.maxX) / 2
      const cy = (b.minY + b.maxY) / 2
      // rotate then mirror around the piece's bbox center
      return `rotate(${this.targetRotation} ${cx} ${cy}) translate(${cx} ${cy}) scale(${this.targetMirror} 1) translate(${-cx} ${-cy})`
    },
    isCorrectAnswer() {
      const piece = this.selectedIdx != null ? this.currentPieces[this.selectedIdx] : null
      return this.answered && piece && piece.isCorrect
    },
  },
  mounted() {
    this.startRound()
    this.startGameTimer()
  },
  beforeDestroy() { this.clearTimers() },
  methods: {
    pieceStroke(i, p) {
      if (!this.answered) return '#0a1428'
      // reveal correct piece after a wrong pick
      if (!this.isCorrectAnswer && p.isCorrect) return '#22c55e'
      if (i === this.selectedIdx) return '#fff'
      return '#0a1428'
    },
    pieceStrokeWidth(i, p) {
      if (!this.answered) return '0.5'
      if (!this.isCorrectAnswer && p.isCorrect) return '2.2'
      if (i === this.selectedIdx) return '1.5'
      return '0.5'
    },
    startRound() {
      this.roundKey++
      this.selectedIdx = null
      this.answered = false
      this.feedback = null

      const designs = TANGRAMS[this.difficulty]
      const design = designs[Math.floor(Math.random() * designs.length)]

      // Assign each piece a color (shuffled palette) and pick a random one as the target
      const colors = shuffle(PIECE_COLORS).slice(0, design.length)
      this.targetIdx = Math.floor(Math.random() * design.length)
      this.currentPieces = design.map((pts, i) => ({
        points: pts,
        color: colors[i],
        isCorrect: i === this.targetIdx,
      }))
      // Pick a target preview color that's different from the correct piece's color
      const correctColor = colors[this.targetIdx]
      const otherColors = PIECE_COLORS.filter(c => c !== correctColor)
      this.targetColor = otherColors[Math.floor(Math.random() * otherColors.length)]
      this.targetRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)]
      this.targetMirror = Math.random() < 0.5 ? -1 : 1
      this.roundStartTime = Date.now()
    },

    onSelect(idx) {
      if (this.answered) return
      this.answered = true
      this.selectedIdx = idx
      const correct = this.currentPieces[idx].isCorrect
      this.feedback = correct ? 'correct' : 'wrong'
      this.totalRounds++
      if (correct) {
        this.correctRounds++
        this.score += Math.round(5 * (1 + (this.difficulty - 1) * 0.5))
        const rt = (Date.now() - this.roundStartTime) / 1000
        this.totalReactionMs += rt
        this.reactionCount++
        this.windowCorrect++
      } else {
        this.wrongRounds++
      }
      this.windowTotal++

      const elapsed = (Date.now() - this.windowStart) / 1000
      if (elapsed >= 60) {
        this.adjustDifficulty()
        this.windowStart = Date.now()
        this.windowCorrect = 0
        this.windowTotal = 0
      }

      clearTimeout(this.feedbackTimer)
      this.feedbackTimer = setTimeout(() => {
        this.feedback = null
        if (this.gameTimeLeft > 0) this.startRound()
      }, correct ? 900 : 1600)
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
      return `${m}:${ss.toString().padStart(2, '0')}`
    },

    endGame() {
      const avgReaction = this.reactionCount > 0
        ? this.totalReactionMs / this.reactionCount
        : 0
      const durationSec = this.duration
      const durationLabel = durationSec === 60 ? this.t.min1 : durationSec === 180 ? this.t.min3 : this.t.min5
      this.$emit('end', {
        score: this.score,
        finalLevel: this.difficulty,
        totalRounds: this.totalRounds,
        correctRounds: this.correctRounds,
        wrongRounds: this.wrongRounds,
        duration: this.duration,
        durationLabel,
        avgReaction,
      })
    },

    clearTimers() {
      clearInterval(this.gameTimer)
      clearTimeout(this.feedbackTimer)
    },

    /**
     * <summary>
     * 批次跳过当前游戏
     * </summary>
     */
    onBatchSkip() { skipPbBatchGame() },
    onBackClick() { this.clearTimers(); this.showBackConfirm = true },
    cancelBack() {
      this.showBackConfirm = false
      this.startGameTimer()
    },
    startGameTimer() {
      clearInterval(this.gameTimer)
      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--
        if (this.gameTimeLeft <= 0) {
          this.clearTimers()
          this.endGame()
        }
      }, 1000)
    },
    /**
     * <summary>
     * 确认退出并关闭游戏窗口
     * </summary>
     */
    forceBack() {
      this.clearTimers()
      this.showBackConfirm = false
      leavePbGameWindow({ confirm: false })
    }
  }
}
</script>

<style scoped>
.game-page {
  width: 100vw; height: 100vh;
  background: #fff8ed;
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}
.bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }

.hud {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.5vmin 3vmin; min-height: 8vmin; flex-shrink: 0;
  position: relative; z-index: 10;
}
.hud-left { display: flex; gap: 2vmin; }
.hud-item {
  background: #fffdf8; backdrop-filter: blur(4px);
  padding: 1.2vmin 2vmin; border-radius: 1.5vmin;
  border: 0.2vmin solid rgba(74,144,217,0.5);
  display: flex; flex-direction: column; align-items: center; gap: 0.3vmin;
}
.hud-label { font-size: 1.2vmin; color: #50637a; }
.hud-value { font-size: 2.5vmin; font-weight: 800; color: #2d4158; }
.level-badge { color: #815108; }
.time-urgent { color: #a2293d !important; animation: blink 0.6s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }
.hud-center { flex: 1; text-align: center; display: flex; align-items: center; justify-content: center; padding: 0 2vmin; }
.task-msg {
  font-size: 2vmin; color: #2d4158; font-weight: 700;
  background: #fffdf8; backdrop-filter: blur(6px);
  padding: 1.5vmin 3vmin; border-radius: 2vmin;
  border: 0.2vmin solid rgba(74,144,217,0.5);
}
.hud-right { display: flex; align-items: center; gap: 1.2vmin; }
.back-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.6vmin; font-weight: 700;
  background: rgba(80,10,10,0.8); border: 0.2vmin solid rgba(239,68,68,0.6);
  color: #fca5a5; border-radius: 1.2vmin; cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { background: rgba(127,29,29,1); }
.skip-btn {
  background: rgba(20,60,120,0.85);
  border-color: rgba(74,144,217,0.7);
  color: #93c5fd;
}
.skip-btn:hover { background: rgba(30,80,150,1); }

.game-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 3vmin; padding: 1vmin 3vmin;
  position: relative; z-index: 10; overflow: hidden;
}

.left-panel, .right-panel {
  display: flex; flex-direction: column; align-items: center; gap: 1.5vmin;
}
.left-panel { flex-shrink: 0; }
.right-panel { flex-shrink: 0; }
.panel-label { font-size: 1.7vmin; color: #3e5068; font-weight: 600; text-align: center; }

.target-wrap, .tangram-wrap {
  background: #fffdf7; border: 0.3vmin solid rgba(74,144,217,0.5);
  border-radius: 2vmin; padding: 2vmin;
  box-shadow: 0 0.5vmin 2vmin rgba(74,144,217,0.2);
  display: flex; align-items: center; justify-content: center;
}
.single-svg { width: 55vmin; height: 55vmin; display: block; }
.tangram-svg { width: 55vmin; height: 55vmin; display: block; }

.clickable-piece { cursor: pointer; transition: filter 0.18s, transform 0.18s; transform-origin: center; transform-box: fill-box; }
.clickable-piece:hover { filter: brightness(1.15); }
.piece-correct { filter: brightness(1.25) saturate(1.4); }
.piece-wrong { opacity: 0.5; }
.piece-reveal { filter: brightness(1.35) saturate(1.5) drop-shadow(0 0 1.5px #22c55e); animation: revealPulse 0.7s ease-in-out infinite alternate; }
@keyframes revealPulse { from { filter: brightness(1.25) saturate(1.4) drop-shadow(0 0 1px #22c55e); } to { filter: brightness(1.5) saturate(1.6) drop-shadow(0 0 2.5px #22c55e); } }

.divider {
  width: 0.15vmin; height: 50vh;
  background: linear-gradient(to bottom, transparent, rgba(74,144,217,0.4), transparent);
  flex-shrink: 0;
}

.feedback-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 100; }
.feedback-msg { display: flex; flex-direction: column; align-items: center; gap: 2vmin; padding: 4vmin 6vmin; border-radius: 3vmin; animation: feedbackPop 0.6s ease-out; }
.feedback-msg.correct { background: rgba(34,197,94,0.95); border: 0.4vmin solid #86efac; box-shadow: 0 0 4vmin rgba(34,197,94,0.8); }
.feedback-msg.wrong { background: rgba(239,68,68,0.95); border: 0.4vmin solid #fca5a5; box-shadow: 0 0 4vmin rgba(239,68,68,0.8); }
.feedback-icon { font-size: 12vmin; font-weight: 900; color: white; }
.feedback-text { font-size: 4vmin; font-weight: 800; color: white; }
@keyframes feedbackPop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
.feedback-fade-enter-active, .feedback-fade-leave-active { transition: opacity 0.3s; }
.feedback-fade-enter, .feedback-fade-leave-to { opacity: 0; }

.confirm-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 50; }
.confirm-box { background: linear-gradient(160deg, #0e1e3a, #060e1e); border: 0.2vmin solid rgba(100,180,255,0.3); border-radius: 2vmin; padding: 3.5vmin 5vmin; display: flex; flex-direction: column; align-items: center; gap: 2.5vmin; }
.confirm-text { color: #e8f0ff; font-size: 2.2vmin; font-weight: 600; }
.confirm-btns { display: flex; gap: 2vmin; }
.cbtn { padding: 1.2vmin 3.5vmin; font-size: 2vmin; font-weight: 700; border-radius: 1vmin; cursor: pointer; transition: all 0.2s; }
.cbtn.cancel { background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2); color: #e8f0ff; }
.cbtn.cancel:hover { background: rgba(255,255,255,0.2); }
.cbtn.confirm-ok { background: linear-gradient(135deg, #2A5EA8, #4A90D9); border: 0.2vmin solid rgba(100,180,255,0.4); color: #e8f0ff; }
.cbtn.confirm-ok:hover { background: linear-gradient(135deg, #3A70C0, #5AA8F0); }
</style>
