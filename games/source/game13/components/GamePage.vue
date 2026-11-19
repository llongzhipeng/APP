<template>
  <div class="game-page">
    <!-- TOP BAR -->
    <div class="top-bar">
      <div class="top-left">
        <div class="stat">
          <span class="stat-label">{{ t.difficulty }}</span>
          <span class="stat-value diff-badge" :style="{ background: diffColor }">{{ difficulty }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t.score }}</span>
          <span class="stat-value score-val">{{ score }}</span>
        </div>
        <div class="stat timer-stat" :class="{ 'timer-urgent': gameTimeLeft <= 10 }">
          <span class="stat-label">{{ t.timeLeft }}</span>
          <span class="stat-value">{{ formatTime(gameTimeLeft) }}</span>
        </div>
      </div>
      <div class="top-center">
        <span class="instruction">{{ t.instruction }}</span>
      </div>
      <div class="top-right">
        <button v-if="showBatchSkip" class="exit-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skip }}</button>
        <button class="exit-btn" @click="confirmExit">{{ t.returnGame }}</button>
      </div>
    </div>

    <!-- PUZZLE NAVIGATION BAR -->
    <div class="puzzle-nav-bar">
      <button class="nav-btn" :disabled="currentIndex === 0" @click="goToPrevious">
        ← {{ t.prevPuzzle }}
      </button>
      <div class="puzzle-counter">
        <span class="current-num">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total-num">{{ puzzleList.length }}</span>
        <span v-if="isPuzzleCompleted" class="completed-badge">✓</span>
      </div>
      <div class="nav-right">
        <button class="nav-btn" @click="goToNext">{{ t.nextPuzzle }} →</button>
        <button v-if="isRowLayout" class="side-toggle" :class="{ 'tray-left': trayOnLeft }" @click="trayOnLeft = !trayOnLeft">
          <span class="toggle-track"><span class="toggle-thumb">{{ trayOnLeft ? '左' : '右' }}</span></span>
        </button>
      </div>
    </div>

    <!-- MAIN GAME AREA -->
    <div class="game-area" :class="{ 'row-layout': isRowLayout, 'tray-left': isRowLayout && trayOnLeft }" :style="{ '--piece-size': pieceSize + 'px' }" ref="gameArea">
      <!-- Feedback overlay -->
      <transition name="feedback">
        <div
          v-if="feedbackMsg"
          class="feedback-overlay"
          :class="feedbackType"
        >
          <span>{{ feedbackMsg }}</span>
        </div>
      </transition>

      <!-- PUZZLE BOARD -->
      <div
        v-if="currentPuzzle"
        class="puzzle-board"
        :style="boardStyle"
      >
        <div
          v-for="idx in cellIndices"
          :key="idx"
          class="puzzle-cell"
          :data-cell-idx="idx"
          :class="{
            'is-hole':      isHole(idx) && !isPlaced(idx),
            'is-placed':    isPlaced(idx),
            'drop-hover':   dropHoverIdx === idx,
            'correct-flash': correctFlashIdx === idx,
            'wrong-flash':  wrongFlashIdx === idx,
          }"
          :style="cellStyle(idx)"
          @dragover.prevent="onDragOver(idx)"
          @dragleave="onDragLeave(idx)"
          @drop.prevent="onDrop(idx)"
        >
          <span v-if="isHole(idx) && !isPlaced(idx)" class="hole-num">{{ holeNumber(idx) }}</span>
        </div>
      </div>

      <!-- TRAY -->
      <div class="tray-area">
        <div class="tray-label">— {{ trayPieces.length > 0 ? trayPieces.length : '✓' }} —</div>
        <div
          class="piece-tray"
          :class="{ 'two-col': trayPieces.length > 1 }"
        >
          <div
            v-for="piece in trayPieces"
            :key="piece.id"
            class="tray-piece"
            :class="{ dragging: draggingId === piece.id }"
            :style="pieceStyle(piece)"
            draggable="true"
            @dragstart="onDragStart(piece)"
            @dragend="onDragEnd"
            @touchstart.prevent="onTouchStart(piece, $event)"
            @touchmove.prevent="onTouchMove($event)"
            @touchend.prevent="onTouchEnd($event)"
          />
        </div>
      </div>
    </div>

    <!-- GAME OVER OVERLAY -->
    <div v-if="gameOver" class="gameover-overlay">
      <div class="gameover-card">
        <h2>{{ t.gameOver }}</h2>
        <div class="final-score">
          <span class="score-label">{{ t.finalScore }}</span>
          <span class="score-big">{{ score }}</span>
        </div>
        <div class="stats-grid">
          <div class="stat-row">
            <span>{{ t.colTotal }}</span><span>{{ totalAttempts }}</span>
          </div>
          <div class="stat-row">
            <span>{{ t.colSuccess }}</span><span class="green">{{ totalCorrect }}</span>
          </div>
          <div class="stat-row">
            <span>{{ t.colFail }}</span><span class="red">{{ totalAttempts - totalCorrect }}</span>
          </div>
          <div class="stat-row">
            <span>{{ t.colRate }}</span>
            <span>{{ totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0 }}%</span>
          </div>
          <div class="stat-row">
            <span>{{ t.colAvgTime }}</span><span>{{ avgReactionTime }}s</span>
          </div>
        </div>
        <div class="gameover-btns">
          <BatchTrainActions :home-text="t.backHome" @home="$emit('exit')" />
          <button class="btn btn-primary" @click="restartGame">{{ t.playAgain }}</button>
        </div>
      </div>
    </div>

    <!-- EXIT CONFIRM DIALOG -->
    <div v-if="showExitConfirm" class="modal-overlay" @click.self="resumeGame">
      <div class="confirm-box">
        <p style="font-size:clamp(13px,2vmin,18px);margin-bottom:1.5em;">游戏已暂停，确定要退出吗？</p>
        <div style="display:flex;gap:1em;justify-content:center;">
          <button class="btn btn-secondary" @click="resumeGame">继续游戏</button>
          <button class="btn btn-primary" @click="doExit">确定退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick ,inject} from '@vue/composition-api'
import { generateRound, DIFFICULTY_CONFIG, getCellBgStyle } from '../data/puzzles.js'
import api from '@/api'
import { getTrainTypeForGame } from '@/utils/pbGameRegistry'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
const DIFFICULTY_COLORS = [
  '#4caf50','#8bc34a','#f5a623','#ff9800','#ff5722','#e94560'
]

export default {
  name: 'GamePage',
  components: { BatchTrainActions },
  props: {
    t:        Object,
    duration: { type: Number, default: 60 }
  },
  setup(props, { emit }) {
    // ─── State ───────────────────────────────────────────────────────────
    const difficulty     = ref(getBatchStartDifficultyForGame('qbqz'))
    const score          = ref(0)
    const gameTimeLeft   = ref(props.duration)

    const puzzleList      = ref([])        // Array of puzzle objects
    const currentIndex    = ref(0)         // Current puzzle index
    const draggingId      = ref(null)
    const draggingPiece   = ref(null)
    const dropHoverIdx    = ref(-1)
    const archiveId = inject('archiveId', ref(-1));
    const correctFlashIdx = ref(-1)
    const wrongFlashIdx   = ref(-1)
    const feedbackMsg     = ref('')
    const feedbackType    = ref('')

    const totalCorrect    = ref(0)
    const totalAttempts   = ref(0)
    const reactionTimes   = ref([])

    const periodCorrect   = ref(0)
    const periodTotal     = ref(0)
    const lastPeriod      = ref(0)

    const gameOver        = ref(false)
    const showExitConfirm = ref(false)
    const gameArea        = ref(null)

    let gameTimer   = null

    // ─── Computed ─────────────────────────────────────────────────────────
    const diffColor = computed(() => DIFFICULTY_COLORS[difficulty.value - 1])

    const config = computed(() => DIFFICULTY_CONFIG[difficulty.value - 1])

    // Current puzzle data
    const currentPuzzle = computed(() => {
      if (!puzzleList.value.length || currentIndex.value >= puzzleList.value.length) return null
      return puzzleList.value[currentIndex.value]
    })

    const missingIndices = computed(() => (currentPuzzle.value && currentPuzzle.value.missingIndices) || [])
    const trayPieces = computed(() => (currentPuzzle.value && currentPuzzle.value.trayPieces) || [])
    const placedMap = computed(() => (currentPuzzle.value && currentPuzzle.value.placedMap) || {})
    const isPuzzleCompleted = computed(() => (currentPuzzle.value && currentPuzzle.value.completed) || false)

    // 0-based indices array for v-for on the board
    const cellIndices = computed(() => {
      if (!currentPuzzle.value) return []
      const total = currentPuzzle.value.puzzle.cols * currentPuzzle.value.puzzle.rows
      return Array.from({ length: total }, (_, i) => i)
    })

    // Board container style: grid template + explicit width derived from aspect ratio
    const boardStyle = computed(() => {
      if (!currentPuzzle.value) return {}
      const { cols, rows } = currentPuzzle.value.puzzle
      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows:    `repeat(${rows}, 1fr)`,
        width:  boardSize.value.w + 'px',
        height: boardSize.value.h + 'px',
      }
    })

    const avgReactionTime = computed(() => {
      if (!reactionTimes.value.length) return 0
      const avg = reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length
      return avg.toFixed(1)
    })

    // ─── Helpers ──────────────────────────────────────────────────────────
    function isHole(idx)   { return missingIndices.value.includes(idx) }
    function isPlaced(idx) { return placedMap.value[idx] !== undefined }
    function holeNumber(idx) { return missingIndices.value.indexOf(idx) + 1 }

    // Style for a board cell: show image slice, or empty for unfilled holes
    function cellStyle(idx) {
      if (!currentPuzzle.value) return {}
      if (isHole(idx) && !isPlaced(idx)) return {}   // hole: CSS class handles appearance
      const { imageId, cols, rows } = currentPuzzle.value.puzzle
      return getCellBgStyle(imageId, idx, cols, rows)
    }

    // Style for a tray piece: show corresponding image slice at piece size
    function pieceStyle(piece) {
      return {
        ...getCellBgStyle(piece.imageId, piece.displayIdx, piece.cols, piece.rows),
        width:  'var(--piece-size)',
        height: 'var(--piece-size)',
      }
    }

    function formatTime(s) {
      const m   = Math.floor(s / 60)
      const sec = s % 60
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }

    // ─── Puzzle Generation ───────────────────────────────────────────────
    function generatePuzzleList() {
      // Start with just 1 puzzle; subsequent ones generated on-demand in goToNext()
      const round = generateRound(difficulty.value)
      puzzleList.value = [{
        puzzle: round.puzzle,
        missingIndices: round.missingIndices,
        trayPieces: round.trayPieces,
        placedMap: {},
        completed: false,
        startTime: Date.now(),
        completionTime: null,
      }]
      currentIndex.value = 0
      if (puzzleList.value[0]) puzzleList.value[0].startTime = Date.now()
    }

    // ─── Navigation ───────────────────────────────────────────────────────
    function goToPrevious() {
      if (currentIndex.value > 0) {
        currentIndex.value--
        dropHoverIdx.value = -1
        draggingId.value = null
        draggingPiece.value = null
      }
    }

    function goToNext() {
      // Generate new puzzle if at the end
      if (currentIndex.value >= puzzleList.value.length - 1) {
        const round = generateRound(difficulty.value)
        puzzleList.value.push({
          puzzle: round.puzzle,
          missingIndices: round.missingIndices,
          trayPieces: round.trayPieces,
          placedMap: {},
          completed: false,
          startTime: Date.now(),
          completionTime: null,
        })
      }
      currentIndex.value++
      if (!puzzleList.value[currentIndex.value].startTime) {
        puzzleList.value[currentIndex.value].startTime = Date.now()
      }
      dropHoverIdx.value = -1
      draggingId.value = null
      draggingPiece.value = null
    }

    // ─── Timers ───────────────────────────────────────────────────────────
    function startGameTimer() {
      gameTimer = setInterval(() => {
        if (gameTimeLeft.value <= 0) {
          clearInterval(gameTimer)
          endGame()
          return
        }
        gameTimeLeft.value--
        const elapsed = props.duration - gameTimeLeft.value
        const period  = Math.floor(elapsed / 60)
        if (period > lastPeriod.value) {
          adjustDifficulty()
          lastPeriod.value = period
        }
      }, 1000)
    }

    // ─── Difficulty Adjustment ────────────────────────────────────────────
    function adjustDifficulty() {
      if (periodTotal.value === 0) return
      const rate = periodCorrect.value / periodTotal.value
      if (rate >= 0.9)     difficulty.value = Math.min(6, difficulty.value + 1)
      else if (rate < 0.7) difficulty.value = Math.max(1, difficulty.value - 1)
      periodCorrect.value = 0
      periodTotal.value   = 0
    }

    // ─── Puzzle Events ────────────────────────────────────────────────────
    function onPuzzleComplete() {
      const puzzle = puzzleList.value[currentIndex.value]
      if (!puzzle || puzzle.completed) return

      const elapsed = (Date.now() - puzzle.startTime) / 1000
      reactionTimes.value.push(parseFloat(elapsed.toFixed(1)))

      puzzle.completed = true
      puzzle.completionTime = Date.now()
      totalCorrect.value++
      totalAttempts.value++
      periodCorrect.value++
      periodTotal.value++
      score.value += 5 * config.value.coefficient

      showFeedback('success', props.t.puzzleSuccess)
      setTimeout(() => {
        hideFeedback()
        goToNext()
      }, 1000)
    }

    function showFeedback(type, msg) {
      feedbackType.value = type
      feedbackMsg.value  = msg
    }
    function hideFeedback() {
      feedbackMsg.value  = ''
      feedbackType.value = ''
    }

    // ─── Drag & Drop ──────────────────────────────────────────────────────
    function onDragStart(piece) {
      if (isPuzzleCompleted.value) return
      draggingId.value    = piece.id
      draggingPiece.value = piece
    }
    function onDragEnd() {
      draggingId.value    = null
      draggingPiece.value = null
      dropHoverIdx.value  = -1
    }
    function onDragOver(idx) {
      if (isPuzzleCompleted.value) return
      if (!isHole(idx) || isPlaced(idx)) return
      dropHoverIdx.value = idx
    }
    function onDragLeave(idx) {
      if (dropHoverIdx.value === idx) dropHoverIdx.value = -1
    }
    function onDrop(idx) {
      dropHoverIdx.value = -1
      if (isPuzzleCompleted.value) return
      if (!draggingPiece.value) return
      if (!isHole(idx) || isPlaced(idx)) return
      _placePiece(draggingPiece.value, idx)
      draggingId.value    = null
      draggingPiece.value = null
    }

    function _placePiece(piece, idx) {
      const puzzle = puzzleList.value[currentIndex.value]
      if (piece.originalIndex === idx) {
        puzzle.placedMap[idx] = true
        puzzle.trayPieces = puzzle.trayPieces.filter(p => p.id !== piece.id)
        correctFlashIdx.value = idx
        setTimeout(() => { correctFlashIdx.value = -1 }, 500)
        const allPlaced = puzzle.missingIndices.every(i => puzzle.placedMap[i] !== undefined)
        if (allPlaced) nextTick(() => onPuzzleComplete())
      } else {
        wrongFlashIdx.value = idx
        setTimeout(() => { wrongFlashIdx.value = -1 }, 500)
      }
    }

    // ─── Touch Drag (tablet support) ─────────────────────────────────────
    let touchGhost = null

    function onTouchStart(piece, event) {
      if (isPuzzleCompleted.value) return
      draggingId.value    = piece.id
      draggingPiece.value = piece

      // Create ghost element that follows the finger
      const t = event.touches[0]
      const src = event.currentTarget
      const rect = src.getBoundingClientRect()
      touchGhost = document.createElement('div')
      touchGhost.style.cssText = `
        position: fixed;
        width: ${rect.width}px;
        height: ${rect.height}px;
        left: ${t.clientX - rect.width / 2}px;
        top: ${t.clientY - rect.height / 2}px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.85;
        border-radius: 5px;
        border: 2px solid #667eea;
        ${src.style.cssText}
      `
      document.body.appendChild(touchGhost)
    }

    function onTouchMove(event) {
      if (!draggingPiece.value) return
      const t = event.touches[0]
      if (touchGhost) {
        touchGhost.style.left = `${t.clientX - touchGhost.offsetWidth / 2}px`
        touchGhost.style.top  = `${t.clientY - touchGhost.offsetHeight / 2}px`
      }
      // Highlight hole under finger
      touchGhost && (touchGhost.style.pointerEvents = 'none')
      const el = document.elementFromPoint(t.clientX, t.clientY)
      const cell = el && el.closest('[data-cell-idx]')
      dropHoverIdx.value = cell ? parseInt(cell.dataset.cellIdx) : -1
    }

    function onTouchEnd(event) {
      if (!draggingPiece.value) return
      const t = event.changedTouches[0]
      if (touchGhost) { touchGhost.remove(); touchGhost = null }

      const el = document.elementFromPoint(t.clientX, t.clientY)
      const cell = el && el.closest('[data-cell-idx]')
      const idx = cell ? parseInt(cell.dataset.cellIdx) : -1

      dropHoverIdx.value = -1
      if (idx >= 0 && isHole(idx) && !isPlaced(idx)) {
        _placePiece(draggingPiece.value, idx)
      }
      draggingId.value    = null
      draggingPiece.value = null
    }

    // ─── Game Control ─────────────────────────────────────────────────────
    function endGame() {
      clearInterval(gameTimer)
      gameOver.value = true
      saveHistory()
    }

    function saveHistory() {
      const times = reactionTimes.value
      const body={
         archiveId: archiveId.value,
          trainType: getTrainTypeForGame('qbqz'),
          gameType: 'qbqz',
          minTime: times.length ? Math.min(...times) : 0,
          maxTime: times.length ? Math.max(...times) : 0,
          avgTime: times.length ? parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)) : 0,
          score: score.value,
          successCount: totalCorrect.value,
          failCount: totalAttempts.value - totalCorrect.value,
          trainDuration: props.duration,
          difficultyLevel: difficulty.value,
        }
        api.submitPbGameRecord(body).catch(() => {});
      const completedCount = puzzleList.value.filter(p => p.completed).length
      const record = {
        time:       new Date().toLocaleString(),
        project:    props.t.projectName,
        difficulty: difficulty.value,
        duration:   props.duration,
        total:      completedCount,
        success:    totalCorrect.value,
        fail:       completedCount - totalCorrect.value,
        rate:       completedCount > 0
                      ? Math.round(totalCorrect.value / completedCount * 100) + '%'
                      : '0%',
        avgTime:    avgReactionTime.value + 's',
        score:      score.value,
      }
      try {
        const key  = 'game13_history'
        const prev = JSON.parse(localStorage.getItem(key) || '[]')
        prev.unshift(record)
        if (prev.length > 50) prev.length = 50
        localStorage.setItem(key, JSON.stringify(prev))
      } catch (e) { console.warn('history save failed', e) }
    }

    function confirmExit() {
      clearInterval(gameTimer)
      gameTimer = null
      showExitConfirm.value = true
    }

    function resumeGame() {
      showExitConfirm.value = false
      if (!gameOver.value && !gameTimer) {
        startGameTimer()
      }
    }
    
    const showBatchSkip = shouldShowPbBatchSkip()
    function onBatchSkip() { skipPbBatchGame() }

    function doExit() {
      clearInterval(gameTimer)
       showExitConfirm.value = false
      leavePbGameWindow({ confirm: false })
      emit('exit')
    }

    function restartGame() {
      difficulty.value    = getBatchStartDifficultyForGame('qbqz')
      score.value         = 0
      gameTimeLeft.value  = props.duration
      totalCorrect.value  = 0
      totalAttempts.value = 0
      reactionTimes.value = []
      periodCorrect.value = 0
      periodTotal.value   = 0
      lastPeriod.value    = 0
      gameOver.value      = false
      feedbackMsg.value   = ''
      clearInterval(gameTimer)
      generatePuzzleList()
      startGameTimer()
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────
    const isRowLayout = ref(false)
    const trayOnLeft  = ref(true)
    const pieceSize   = ref(100)
    const boardSize   = ref({ w: 0, h: 0 })

    function checkLayout() {
      const W = window.innerWidth
      const H = window.innerHeight
      isRowLayout.value = H < W * 0.7

      const puzzleCols = (currentPuzzle.value && currentPuzzle.value.puzzle.cols) || 4
      const puzzleRows = (currentPuzzle.value && currentPuzzle.value.puzzle.rows) || 3
      const ratio = puzzleCols / puzzleRows

      if (isRowLayout.value) {
        // 横屏：选项区宽44%，可用高度扣除顶栏
        const trayH = H - 160
        const trayW = W * 0.44
        pieceSize.value = Math.floor(Math.min(trayW / 2 - 20, trayH / 3 - 20))

        const availH = H - 160
        const availW = W * 0.54
        const bw = Math.min(availH * ratio, availW)
        boardSize.value = { w: Math.floor(bw), h: Math.floor(bw / ratio) }
      } else {
        // 竖屏：棋盘占45vh，顶栏约110px，剩余给选项
        const boardH = H * 0.45
        const remaining = H - boardH - 110 - 20
        // 两列，最多3行
        pieceSize.value = Math.floor(Math.min(remaining / 3 - 12, W / 2 - 20))

        const availH = H * 0.45
        const availW = W * 0.96
        const bw = Math.min(availH * ratio, availW)
        boardSize.value = { w: Math.floor(bw), h: Math.floor(bw / ratio) }
      }
      pieceSize.value = Math.max(50, Math.min(pieceSize.value, 200))
    }

    onMounted(() => {
      generatePuzzleList()
      startGameTimer()
      checkLayout()
      window.addEventListener('resize', checkLayout)
      window.addEventListener('orientationchange', checkLayout)
    })
    onUnmounted(() => {
      clearInterval(gameTimer)
      window.removeEventListener('resize', checkLayout)
      window.removeEventListener('orientationchange', checkLayout)
    })

    return {
      difficulty, score, gameTimeLeft,
      puzzleList, currentIndex, currentPuzzle, missingIndices, placedMap, trayPieces,
      draggingId, dropHoverIdx, correctFlashIdx, wrongFlashIdx,
      feedbackMsg, feedbackType, isPuzzleCompleted,
      totalCorrect, totalAttempts, avgReactionTime,
      gameOver, showExitConfirm, gameArea,
      diffColor, boardStyle, cellIndices, isRowLayout, trayOnLeft, pieceSize,
      isHole, isPlaced, holeNumber, cellStyle, pieceStyle, formatTime,
      onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
      onTouchStart, onTouchMove, onTouchEnd,
      confirmExit, doExit, restartGame, goToPrevious, goToNext,
      showBatchSkip, onBatchSkip,resumeGame
    }
  }
}
</script>

<style scoped>
.game-page {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

/* TOP BAR */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-height: 0;
}
.top-left {
  display: flex;
  align-items: center;
  gap: 2vmin;
  flex-shrink: 0;
}
.stat {
  display: flex;
  align-items: center;
  gap: 0.4em;
}
.stat-label {
  font-size: clamp(10px, 1.5vmin, 14px);
  color: #666;
}
.stat-value {
  font-size: clamp(13px, 2vmin, 20px);
  font-weight: 700;
  color: #333;
}
.diff-badge {
  display: inline-block;
  padding: 0.1em 0.6em;
  border-radius: 0.4em;
  color: white;
  background: #667eea;
  font-size: clamp(12px, 1.8vmin, 18px);
  transition: background 0.4s;
}
.score-val { color: #667eea; }
.timer-urgent .stat-value {
  color: #F44336;
  animation: blink 0.6s step-end infinite;
}
@keyframes blink { 50% { opacity: 0.4; } }
.top-center { flex: 1; text-align: center; }
.instruction {
  font-size: clamp(13px, 2vmin, 20px);
  color: #444;
  font-weight: 500;
  line-height: 1.3;
}
.top-right { flex-shrink: 0; display: flex; align-items: center; gap: 10px; }
.exit-btn {
  padding: 0.4em 1.2em;
  border-radius: 0.5em;
  background: white;
  border: 2px solid #e94560;
  color: #e94560;
  font-size: clamp(11px, 1.6vmin, 15px);
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}
.exit-btn:hover {
  background: #e94560;
  color: white;
}

/* PUZZLE NAVIGATION BAR */
.puzzle-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
  gap: 1vw;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
/* Side toggle switch */
.side-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}
.toggle-track {
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #ccc;
  padding: 3px;
  transition: background 0.25s;
}
.side-toggle.tray-left .toggle-track { background: #667eea; }
.toggle-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: transform 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: #555;
  user-select: none;
}
.side-toggle.tray-left .toggle-thumb { transform: translateX(20px); }
.nav-btn {
  padding: 0.4em 1em;
  border-radius: 0.5em;
  background: white;
  border: 2px solid #4caf50;
  color: #4caf50;
  font-size: clamp(11px, 1.5vmin, 14px);
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}
.nav-btn:hover:not(:disabled) {
  background: #4caf50;
  color: white;
  transform: translateY(-1px);
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.puzzle-counter {
  display: flex;
  align-items: baseline;
  gap: 0.3em;
  font-size: clamp(14px, 2.2vmin, 20px);
  font-weight: 700;
  color: #333;
}
.current-num { color: #667eea; font-size: 1.3em; }
.separator { color: #999; }
.total-num { color: #666; }
.completed-badge {
  margin-left: 0.5em;
  color: #4caf50;
  font-size: 1.2em;
}

/* GAME AREA */
.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 1vh 2vw;
  gap: 1vh;
  position: relative;
  background: #f5f7fa;
  overflow: hidden;
}

/* Row layout: tray on right, board on left */
.game-area.row-layout {
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1vw;
  padding: 1vh 0.5vw;
}
.game-area.row-layout .tray-area {
  flex-direction: column;
  height: calc(100vh - 160px);
  flex: 0 0 44%;
  justify-content: center;
  align-items: center;
  padding: 0;
}
.game-area.row-layout .piece-tray {
  padding: 2px;
  gap: clamp(5px, 1vmin, 10px);
  justify-content: center;
  align-content: center;
}
/* Tray on left variant */
.game-area.row-layout.tray-left {
  flex-direction: row-reverse;
}

/* FEEDBACK OVERLAY */
.feedback-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  font-size: clamp(24px, 6vmin, 56px);
  font-weight: 900;
  letter-spacing: 0.05em;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.feedback-overlay.success { color: #4caf50; }
.feedback-overlay.timeout { color: #e94560; }
.feedback-enter-active { animation: feedbackPop  0.3s ease-out; }
.feedback-leave-active { animation: feedbackFade 0.3s ease-in;  }
@keyframes feedbackPop  { from { transform: translate(-50%,-50%) scale(0.5); opacity: 0; } }
@keyframes feedbackFade { to   { transform: translate(-50%,-50%) scale(1.3); opacity: 0; } }

/* ── PUZZLE BOARD ───────────────────────────────────────────────────────── */
.puzzle-board {
  display: grid;
  gap: 0;
  border: 3px solid #667eea;
  border-radius: 8px;
  overflow: hidden;   /* clips rounded corners cleanly */
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
  background: white;
}

/* Each cell is 1/4 × 1/3 of the board, shows its image slice */
.puzzle-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* thin separator lines between cells */
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
  transition: transform 0.12s, box-shadow 0.12s;
}

/* Unfilled hole: blank with dashed border */
.is-hole {
  background: rgba(102, 126, 234, 0.1) !important;
  box-shadow: inset 0 0 0 2px rgba(102, 126, 234, 0.4) !important;
  cursor: copy;
}
.is-hole::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 2px dashed rgba(102, 126, 234, 0.5);
  border-radius: 3px;
  pointer-events: none;
}
.is-hole:hover {
  background: rgba(102, 126, 234, 0.15) !important;
  box-shadow: inset 0 0 0 2px rgba(102, 126, 234, 0.6) !important;
}

/* Drag-over highlight */
.drop-hover {
  box-shadow: inset 0 0 0 3px #667eea, 0 0 16px rgba(102, 126, 234, 0.6) !important;
  transform: scale(1.04);
  z-index: 5;
}

/* Correct placement: pop-in animation */
.is-placed {
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08) !important;
  animation: placePop 0.35s ease-out;
}
@keyframes placePop {
  0%   { transform: scale(0.65); }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1);    }
}

/* Correct flash: green glow */
.correct-flash {
  animation: correctAnim 0.5s ease-out;
}
@keyframes correctAnim {
  0%   { box-shadow: inset 0 0 0 1px rgba(76,175,80,0), 0 0 0 0 rgba(76,175,80,0.9); }
  40%  { box-shadow: inset 0 0 0 1px rgba(76,175,80,0.6), 0 0 0 12px rgba(76,175,80,0); }
  100% { box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08); }
}

/* Wrong drop: red shake */
.wrong-flash {
  animation: wrongAnim 0.45s ease-out;
}
@keyframes wrongAnim {
  0%, 100% { transform: translateX(0); }
  20%  { transform: translateX(-7px); }
  40%  { transform: translateX( 7px); }
  60%  { transform: translateX(-4px); }
  80%  { transform: translateX( 4px); }
}

/* Hole number hint */
.hole-num {
  font-size: clamp(9px, 1.6vmin, 15px);
  color: rgba(102, 126, 234, 0.6);
  font-weight: 700;
  user-select: none;
  position: relative;
  z-index: 1;
}

/* ── TRAY ───────────────────────────────────────────────────────────────── */
.tray-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6vh;
  width: 100%;
}
.tray-label {
  font-size: clamp(10px, 1.4vmin, 13px);
  color: #999;
  letter-spacing: 0.1em;
}
.piece-tray {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(7px, 1.6vmin, 16px);
  justify-content: center;
  padding: clamp(8px, 1.2vmin, 14px);
  background: transparent;
  border: none;
  min-height: calc(var(--piece-size) + 28px);
  max-width: 94vw;
}
.piece-tray.two-col {
  display: grid;
  grid-template-columns: repeat(2, var(--piece-size));
}
.piece-tray.three-col {
  display: grid;
  grid-template-columns: repeat(3, var(--piece-size));
}

.tray-piece {
  border-radius: 5px;
  cursor: grab;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  user-select: none;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.tray-piece:hover {
  transform: scale(1.12) translateY(-4px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  z-index: 10;
}
.tray-piece:active { cursor: grabbing; }
.tray-piece.dragging {
  opacity: 0.35;
  transform: scale(0.88);
}

/* ── GAME OVER ──────────────────────────────────────────────────────────── */
.gameover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.gameover-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 1.2em;
  padding: 4vh 5vw;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2.5vh;
  width: clamp(260px, 65vmin, 500px);
  animation: cardIn 0.4s ease-out;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
@keyframes cardIn {
  from { transform: scale(0.8) translateY(30px); opacity: 0; }
}
.gameover-card h2 { font-size: clamp(20px, 4vmin, 36px); color: #667eea; }
.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3em;
}
.score-label { font-size: clamp(11px, 1.8vmin, 16px); color: #666; }
.score-big {
  font-size: clamp(36px, 8vmin, 72px);
  font-weight: 900;
  color: #667eea;
  line-height: 1;
}
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.7vh;
  background: #f9f9f9;
  border-radius: 0.7em;
  padding: 1.2em;
  border: 1px solid #e0e0e0;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: clamp(11px, 1.7vmin, 16px);
  color: #555;
}
.stat-row .green { color: #4caf50; font-weight: 700; }
.stat-row .red   { color: #e94560; font-weight: 700; }
.gameover-btns { display: flex; gap: 1em; justify-content: center; }
.btn {
  padding: 0.7em 2em;
  border-radius: 0.6em;
  font-size: clamp(12px, 1.8vmin, 17px);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 16px rgba(102, 126, 234, 0.6); }
.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}
.btn-secondary:hover { background: #f0f0f0; }

/* EXIT CONFIRM */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}
.confirm-box {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 1em;
  padding: 3vh 3vw;
  text-align: center;
  color: #333;
  width: clamp(220px, 50vmin, 380px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}
</style>
