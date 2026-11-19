<template>
  <div class="game">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="stats">
        <div class="stat"><span class="stat-label">{{ t.difficulty }}</span><span class="stat-val">{{ difficulty }}</span></div>
        <div class="stat"><span class="stat-label">{{ t.score }}</span><span class="stat-val">{{ score }}</span></div>
        <div class="stat"><span class="stat-label">{{ t.timeLeft }}</span><span class="stat-val" :class="{urgent: totalRemaining <= 10}">{{ formatTime(totalRemaining) }}</span></div>
      </div>
      <div class="task">{{ t.task }}</div>
      <div class="top-actions">
        <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t.skipGame }}</button>
        <button class="back-btn" @click="handleBack">✕ {{ t.back }}</button>
      </div>
    </div>

    <!-- Main body: legend + grid -->
    <div class="game-body" v-if="level">
      <!-- Left legend sidebar -->
      <div class="legend">
        <div class="legend-title">{{ t.legend }}</div>
        <div class="legend-item">
          <div class="legend-cell"><img :src="resolveImage('/images/1.png')"/></div>
          <div class="legend-text">{{ t.warehouse }}</div>
        </div>
        <div class="legend-item">
          <div class="legend-cell"><img :src="resolveImage('/images/2.png')"/></div>
          <div class="legend-text">{{ t.delivery }}</div>
        </div>
        <div class="legend-item">
          <div class="legend-cell"><img :src="resolveImage('/images/4.png')"/></div>
          <div class="legend-text">{{ t.endpoint }}</div>
        </div>
        <div class="legend-item">
          <div class="legend-cell"><img :src="resolveImage('/images/3.png')"/></div>
          <div class="legend-text">{{ lang === 'zh' ? '货车' : 'Truck' }}</div>
        </div>
        <div class="legend-item">
          <div class="legend-cell obstacle-cell"></div>
          <div class="legend-text">{{ lang === 'zh' ? '障碍物' : 'Obstacle' }}</div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid-wrap">
        <div class="grid" :style="gridStyle">
          <div
            v-for="(cell, i) in cellData"
            :key="i"
            class="cell"
            :class="{
              obstacle: cell.type === 3,
              visited: cell.visited,
              current: cell.current,
              delivered: cell.delivered
            }"
            @click="clickCell(cell.r, cell.c)"
          >
            <img v-if="cell.type === 1" :src="resolveImage('/images/1.png')" class="cell-img"/>
            <img v-if="cell.type === 2" :src="resolveImage('/images/2.png')" class="cell-img"/>
            <img v-if="cell.type === 4" :src="resolveImage('/images/4.png')" class="cell-img"/>
            <img v-if="cell.current && cell.type === 0" :src="resolveImage('/images/3.png')" class="cell-img truck-img" :class="{ 'face-right': truckFacing === 'right' }"/>
            <span v-if="cell.delivered" class="check-mark">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="bottom-bar">
      <button class="action-btn" @click="resetPath">↺ {{ t.reset }}</button>
      <div v-if="feedback" class="feedback" :class="feedback.type">{{ feedback.text }}</div>
    </div>

    <!-- Back confirmation -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="cancelBack">
      <div class="modal">
        <p>{{ t.confirmBack }}</p>
        <div class="modal-buttons">
          <button class="modal-btn" @click="cancelBack">{{ t.no }}</button>
          <button class="modal-btn primary" @click="confirmExit">{{ t.yes }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { generateLevel, DIFFICULTIES } from '../game.js'
import { submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'shdr'

export default {
  name: 'GameView',
  props: ['t', 'duration', 'lang', 'archiveId'],
  data() {
    return {
      difficulty: getBatchStartDifficultyForGame('shdr'),
      score: 0,
      totalRemaining: this.duration,
      level: null,
      playerPath: [],
      totalTimer: null,
      feedback: null,
      correctStreak: 0,
      wrongStreak: 0,
      stats: { total: 0, success: 0, fail: 0, reactionSum: 0 },
      questionStartMs: 0,
      showConfirm: false,
      paused: false,
      submitting: false,
      audio: null,
      gridPx: { w: 0, h: 0 },
      resizeObserver: null,
      resizeHandler: null,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    gridStyle() {
      if (!this.level) return {}
      const base = {
        gridTemplateColumns: `repeat(${this.level.cols}, 1fr)`,
        gridTemplateRows: `repeat(${this.level.rows}, 1fr)`
      }
      if (this.gridPx.w > 0 && this.gridPx.h > 0) {
        base.width = this.gridPx.w + 'px'
        base.height = this.gridPx.h + 'px'
      }
      return base
    },
    currentPos() {
      if (!this.playerPath.length) return null
      return this.playerPath[this.playerPath.length - 1]
    },
    truckFacing() {
      // Determine facing from last horizontal move; default 'left' (image is left-facing)
      const path = this.playerPath
      for (let i = path.length - 1; i >= 1; i--) {
        const dc = path[i].c - path[i - 1].c
        if (dc > 0) return 'right'
        if (dc < 0) return 'left'
      }
      return 'left'
    },
    cellData() {
      if (!this.level) return []
      const cells = []
      const pathSet = new Set(this.playerPath.map(p => p.r + ',' + p.c))
      const deliveredSet = new Set()
      for (const p of this.playerPath) {
        if (this.level.deliveryPoints.some(d => d.r === p.r && d.c === p.c)) {
          deliveredSet.add(p.r + ',' + p.c)
        }
      }
      const cur = this.currentPos
      for (let r = 0; r < this.level.rows; r++) {
        for (let c = 0; c < this.level.cols; c++) {
          const type = this.level.grid[r][c]
          const isCurrent = cur && cur.r === r && cur.c === c
          const isVisited = pathSet.has(r + ',' + c) && !isCurrent
          const isDelivered = type === 2 && deliveredSet.has(r + ',' + c)
          cells.push({ r, c, type, current: isCurrent, visited: isVisited, delivered: isDelivered })
        }
      }
      return cells
    }
  },
  mounted() {
    this.startNewQuestion()
    this.startTotalTimer()
    this.$nextTick(() => this.setupResize())
  },
  beforeDestroy() {
    this.clearTimers()
    this.teardownResize()
    if (this.audio) { try { this.audio.pause() } catch (e) {} this.audio = null }
  },
  watch: {
    level() { this.$nextTick(() => this.recomputeGridSize()) }
  },
  methods: { resolveImage,
    formatTime(sec) {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    startTotalTimer() {
      this.totalTimer = setInterval(() => {
        if (this.paused) return
        this.totalRemaining--
        if (this.totalRemaining <= 0) this.endGame()
      }, 1000)
    },
    clearTimers() {
      if (this.totalTimer) { clearInterval(this.totalTimer); this.totalTimer = null }
    },
    setupResize() {
      this.recomputeGridSize()
      this.resizeHandler = () => this.recomputeGridSize()
      window.addEventListener('resize', this.resizeHandler)
      window.addEventListener('orientationchange', this.resizeHandler)
      const wrap = this.$el && this.$el.querySelector('.grid-wrap')
      if (wrap && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.recomputeGridSize())
        this.resizeObserver.observe(wrap)
      }
    },
    teardownResize() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        window.removeEventListener('orientationchange', this.resizeHandler)
        this.resizeHandler = null
      }
      if (this.resizeObserver) { this.resizeObserver.disconnect(); this.resizeObserver = null }
    },
    recomputeGridSize() {
      if (!this.level) return
      const wrap = this.$el && this.$el.querySelector('.grid-wrap')
      if (!wrap) return
      const wrapW = wrap.clientWidth
      const wrapH = wrap.clientHeight
      if (wrapW <= 0 || wrapH <= 0) return
      const cols = this.level.cols
      const rows = this.level.rows
      // Grid has padding 1vmin and gap 0.4vmin - account approximately via 2% margin
      const availW = wrapW * 0.98
      const availH = wrapH * 0.98
      const cellByW = availW / cols
      const cellByH = availH / rows
      const cell = Math.floor(Math.min(cellByW, cellByH))
      const vmin = Math.min(window.innerWidth, window.innerHeight) / 100
      const padGap = 2 * vmin + (Math.max(cols, rows) - 1) * 0.4 * vmin
      // Recompute more precisely with pad/gap included
      const cellW = Math.floor((wrapW - 2 * vmin - (cols - 1) * 0.4 * vmin) / cols)
      const cellH = Math.floor((wrapH - 2 * vmin - (rows - 1) * 0.4 * vmin) / rows)
      const size = Math.max(10, Math.min(cellW, cellH))
      this.gridPx = {
        w: size * cols + (cols - 1) * 0.4 * vmin + 2 * vmin,
        h: size * rows + (rows - 1) * 0.4 * vmin + 2 * vmin
      }
    },
    startNewQuestion() {
      this.level = generateLevel(this.difficulty)
      this.playerPath = [{ r: this.level.warehouse.r, c: this.level.warehouse.c }]
      this.feedback = null
      this.submitting = false
      this.questionStartMs = Date.now()
      this.playPrompt()
    },
    playPrompt() {
      try {
        const src = this.lang === 'en' ? resolveVoice('/voice/english/1.mp3') : resolveVoice('/voice/chinese/1.mp3')
        if (!this.audio) this.audio = new Audio()
        this.audio.pause()
        this.audio.src = src
        this.audio.currentTime = 0
        const p = this.audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch (e) {}
    },
    clickCell(r, c) {
      if (this.submitting || this.paused) return
      if (!this.currentPos) return
      const cur = this.currentPos
      if (r === cur.r && c === cur.c) return
      if (Math.abs(r - cur.r) + Math.abs(c - cur.c) !== 1) return
      if (this.level.grid[r][c] === 3) return
      this.playerPath.push({ r, c })
      // Complete: all delivery visited AND at endpoint
      const deliveredSet = new Set()
      for (const p of this.playerPath) {
        if (this.level.deliveryPoints.some(d => d.r === p.r && d.c === p.c)) {
          deliveredSet.add(p.r + ',' + p.c)
        }
      }
      const atEndpoint = r === this.level.endpoint.r && c === this.level.endpoint.c
      if (deliveredSet.size === this.level.deliveryPoints.length && atEndpoint) {
        this.submitAnswer()
      }
    },
    resetPath() {
      if (this.submitting) return
      if (!this.level) return
      this.playerPath = [{ r: this.level.warehouse.r, c: this.level.warehouse.c }]
    },
    submitAnswer() {
      if (this.submitting) return
      this.submitting = true
      const playerSteps = this.playerPath.length - 1
      const optimal = this.level.optimalSteps
      const reaction = (Date.now() - this.questionStartMs) / 1000
      this.stats.total++
      this.stats.reactionSum += reaction
      if (playerSteps === optimal) {
        const coeff = DIFFICULTIES[this.difficulty - 1].coeff
        const gained = Math.round(5 * coeff)
        this.score += gained
        this.stats.success++
        this.correctStreak++
        this.wrongStreak = 0
        this.feedback = { type: 'correct', text: this.t.correct + ' +' + gained }
        if (this.correctStreak >= 3 && this.difficulty < 6) {
          this.difficulty++
          this.correctStreak = 0
        }
      } else {
        this.stats.fail++
        this.wrongStreak++
        this.correctStreak = 0
        this.feedback = { type: 'wrong', text: this.t.wrong }
        if (this.wrongStreak >= 2 && this.difficulty > 1) {
          this.difficulty--
          this.wrongStreak = 0
        }
      }
      setTimeout(() => {
        if (this.totalRemaining > 0) this.startNewQuestion()
      }, 900)
    },
    onSkipClick() {
      skipPbBatchGame()
    },
    handleBack() {
      this.paused = true
      this.showConfirm = true
    },
    cancelBack() {
      this.showConfirm = false
      this.paused = false
    },
    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    confirmExit() {
      this.clearTimers() // 停止主倒计时
      leavePbGameWindow({ confirm: false })
    },
    endGame() {
      this.clearTimers()
      const total = this.stats.total || 0
      const success = this.stats.success
      const fail = this.stats.fail
      const rate = total > 0 ? Math.round((success / total) * 100) : 0
      const avgReaction = total > 0 ? (this.stats.reactionSum / total).toFixed(2) : '0.00'
      const avgReactionMs = total > 0 ? Math.round((this.stats.reactionSum / total) * 1000) : 0
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgReactionMs),
        score: this.score,
        successCount: success,
        failCount: fail,
        trainDuration: this.duration,
        difficultyLevel: this.difficulty,
      }).catch(() => {})
      const record = {
        time: new Date().toLocaleString(),
        finalDifficulty: this.difficulty,
        duration: (this.duration / 60) + (this.lang === 'en' ? 'min' : '分'),
        total, success, fail, rate,
        avgReaction,
        score: this.score
      }
      this.$emit('finish', record)
    }
  }
}
</script>

<style scoped>
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa, #e0eefc);
  padding: 1.5vmin 2vmin;
  gap: 1.5vmin;
  overflow: hidden;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2vmin;
  flex-wrap: wrap;
}
.stats { display: flex; gap: 1.5vmin; }
.stat {
  background: #fff;
  padding: 1vmin 2vmin;
  border-radius: 1.5vmin;
  box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  min-width: 12vmin;
  align-items: center;
}
.stat-label { font-size: 1.7vmin; color: #7f8c8d; margin-bottom: 0.3vmin; }
.stat-val { font-size: 2.6vmin; font-weight: 700; color: #2c3e50; }
.stat-val.urgent { color: #e74c3c; animation: blink 0.5s infinite; }
@keyframes blink { 50% { opacity: 0.5; } }
.task {
  font-size: 2.2vmin;
  color: #2c3e50;
  font-weight: 600;
  background: #fff8e1;
  padding: 1.2vmin 2vmin;
  border-radius: 999px;
  border: 0.3vmin solid #ffd54f;
  flex: 1;
  text-align: center;
  max-width: 60vmin;
}
.back-btn {
  padding: 1.2vmin 2.4vmin;
  border: none;
  background: #e74c3c;
  color: #fff;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 600;
  font-size: 2.2vmin;
  box-shadow: 0 0.4vmin 1vmin rgba(231,76,60,0.3);
}
.back-btn:hover { background: #c0392b; }
.top-actions { display: flex; gap: 1.2vmin; align-items: center; }
.skip-btn {
  padding: 1.2vmin 2.4vmin;
  border: none;
  background: #95a5a6;
  color: #fff;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 600;
  font-size: 2.2vmin;
  box-shadow: 0 0.4vmin 1vmin rgba(127,140,141,0.3);
}
.skip-btn:hover { background: #7f8c8d; }
.game-body {
  flex: 1;
  display: flex;
  gap: 2vmin;
  min-height: 0;
  align-items: stretch;
}
.legend {
  background: #fff;
  border-radius: 2vmin;
  padding: 2vmin 2vmin;
  box-shadow: 0 0.4vmin 1.5vmin rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 1.6vmin;
  min-width: 22vmin;
  align-self: center;
  max-height: 100%;
  overflow: auto;
}
.legend-title {
  font-size: 2.2vmin;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  padding-bottom: 1vmin;
  border-bottom: 0.2vmin solid #ecf0f1;
  margin-bottom: 0.5vmin;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 1.2vmin;
}
.legend-cell {
  width: 7vmin;
  height: 7vmin;
  background: #f4e0b5;
  border-radius: 1vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.legend-cell img { width: 82%; height: 82%; object-fit: contain; }
.legend-cell.obstacle-cell {
  background: #5d5d6b;
  background-image: repeating-linear-gradient(45deg, #4a4a58 0, #4a4a58 0.8vmin, #5d5d6b 0.8vmin, #5d5d6b 1.6vmin);
}
.legend-text {
  font-size: 2vmin;
  color: #2c3e50;
  font-weight: 600;
}
.grid-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  min-width: 0;
}
.grid {
  display: grid;
  gap: 0.4vmin;
  background: #b8935a;
  padding: 1vmin;
  border-radius: 1.5vmin;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,0.15);
}
.cell {
  background: #f4e0b5;
  border-radius: 0.8vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  min-width: 0;
  min-height: 0;
}
.cell.obstacle {
  background: #5d5d6b;
  cursor: not-allowed;
  background-image: repeating-linear-gradient(45deg, #4a4a58 0, #4a4a58 0.8vmin, #5d5d6b 0.8vmin, #5d5d6b 1.6vmin);
}
.cell.visited { background: #ffe4b3; }
.cell.current { background: #fff59d; box-shadow: inset 0 0 0 0.4vmin #f39c12; }
.cell.delivered { background: #c8e6c9; }
.cell-img { width: 80%; height: 80%; object-fit: contain; pointer-events: none; }
.truck-img { z-index: 5; filter: drop-shadow(0 0.3vmin 0.5vmin rgba(0,0,0,0.3)); transition: transform 0.2s; }
.truck-img.face-right { transform: scaleX(-1); }
.check-mark {
  position: absolute;
  top: 0.3vmin;
  right: 0.6vmin;
  color: #2e7d32;
  font-weight: bold;
  font-size: 2vmin;
  z-index: 3;
  text-shadow: 0 0 0.5vmin white;
}
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2vmin;
  min-height: 5vmin;
}
.action-btn {
  padding: 1vmin 2.4vmin;
  border: none;
  background: #4a90e2;
  color: #fff;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 2.1vmin;
  box-shadow: 0 0.4vmin 1vmin rgba(74,144,226,0.3);
}
.action-btn:hover { background: #357abd; }
.feedback {
  padding: 1vmin 2.5vmin;
  border-radius: 999px;
  font-weight: 700;
  font-size: 2.3vmin;
  animation: pop 0.3s ease-out;
}
.feedback.correct { background: #d4edda; color: #155724; border: 0.3vmin solid #2ecc71; }
.feedback.wrong { background: #f8d7da; color: #721c24; border: 0.3vmin solid #e74c3c; }
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.3);
  text-align: center;
}
.modal p { font-size: 2.6vmin; margin-bottom: 3vmin; color: #2c3e50; }
.modal-buttons { display: flex; gap: 2vmin; justify-content: center; }
.modal-btn {
  padding: 1.4vmin 3vmin;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 2.2vmin;
  background: #ecf0f1;
  color: #2c3e50;
  min-width: 12vmin;
}
.modal-btn.primary { background: #e74c3c; color: #fff; }
.modal-btn:hover { opacity: 0.85; }

@media (orientation: portrait) {
  .game {
    padding: 1.5vmin 2vmin;
    padding-top: calc(1.5vmin + env(safe-area-inset-top));
    padding-bottom: calc(1.5vmin + env(safe-area-inset-bottom));
    gap: 1.2vmin;
  }
  .top-bar {
    gap: 1.2vmin;
    justify-content: space-between;
  }
  .stats { gap: 1vmin; width: 100%; justify-content: space-between; order: 1; }
  .stat {
    flex: 1;
    min-width: 0;
    padding: 1.2vmin 1vmin;
    border-radius: 1.6vmin;
  }
  .stat-label { font-size: max(2.6vmin, 12px); }
  .stat-val { font-size: max(4vmin, 18px); }
  .task {
    font-size: max(3.2vmin, 14px);
    padding: 1.4vmin 2vmin;
    max-width: none;
    width: 100%;
    order: 3;
  }
  .top-actions { order: 2; width: 100%; justify-content: flex-end; }
  .skip-btn, .back-btn {
    font-size: max(3.4vmin, 15px);
    padding: 1.6vmin 3.4vmin;
    border-radius: 2vmin;
  }
  .game-body {
    flex-direction: column;
    gap: 1.5vmin;
  }
  .legend {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: 0;
    width: 100%;
    padding: 1.5vmin;
    gap: 1.2vmin 2vmin;
    align-self: stretch;
    max-height: none;
  }
  .legend-title {
    width: 100%;
    font-size: max(3.2vmin, 14px);
    padding-bottom: 0.6vmin;
    margin-bottom: 0.2vmin;
  }
  .legend-cell { width: max(6vmin, 26px); height: max(6vmin, 26px); }
  .legend-text { font-size: max(2.8vmin, 12px); }
  .bottom-bar { flex-wrap: wrap; gap: 1.5vmin; }
  .action-btn {
    font-size: max(3.4vmin, 15px);
    padding: 1.4vmin 3.4vmin;
    width: 80%;
  }
  .feedback { font-size: max(3.4vmin, 15px); }
  .modal { padding: 5vmin 6vmin; width: 90vw; max-width: 90vw; border-radius: 3vmin; }
  .modal p { font-size: max(4vmin, 17px); }
  .modal-btn { font-size: max(3.6vmin, 15px); padding: 2vmin 4vmin; min-width: 26vmin; border-radius: 2.4vmin; }
  .check-mark { font-size: max(3vmin, 12px); }
}
</style>
