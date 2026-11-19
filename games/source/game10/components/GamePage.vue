<template>
  <div class="game-wrap">
    <!-- ── Top HUD ────────────────────────────────────────────────── -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t('difficulty') }}</span>
          <span class="hud-val diff-val">Lv.{{ difficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t('score') }}</span>
          <span class="hud-val score-val">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t('timeLeft') }}</span>
          <span class="hud-val" :class="totalTimeLeft <= 10 ? 'time-urgent' : 'time-val'">
            {{ totalTimeLeft }}s
          </span>
        </div>
        <!-- 30s window countdown -->
        <div class="hud-item">
          <span class="hud-label">{{ lang === 'zh' ? '难度调整' : 'Adjust in' }}</span>
          <span class="hud-val window-val">{{ 30 - windowTimer }}s</span>
        </div>
      </div>
      <div class="hud-btns">
        <button v-if="showBatchSkip" class="btn btn-danger back-btn skip-btn" @click="onBatchSkip">⏭ {{ t('skip') }}</button>
        <button class="btn btn-danger back-btn" @click="confirmBack">{{ t('backBtn') }}</button>
      </div>
    </div>

    <!-- ── Status bar ─────────────────────────────────────────────── -->
    <div class="status-bar" :class="statusClass">
      {{ statusMsg }}
    </div>

    <!-- ── Maze area ──────────────────────────────────────────────── -->
    <div class="maze-area">
      <MazeDisplay
        :maze="maze"
        :phase="phase"
        :robot-index="robotIndex"
        :player-visited="playerVisited"
        :player-head="playerHead"
        @cell-click="onCellClick"
      />
    </div>

    <!-- ── Answer timer bar (player phase) ────────────────────────── -->
    <div class="answer-timer-wrap" v-if="phase === 'player'">
      <div class="answer-timer-track">
        <div
          class="answer-timer-fill"
          :style="{ width: answerTimePct + '%' }"
          :class="answerTimeLeft <= 3 ? 'urgent' : ''"
        />
      </div>
      <span class="answer-time-label">{{ answerTimeLeft }}s</span>
    </div>
    <div class="answer-timer-wrap placeholder" v-else />

    <!-- ── Difficulty change toast ────────────────────────────────── -->
    <transition name="diff-toast">
      <div v-if="diffToast" class="diff-toast" :class="diffToast">
        {{ diffToast === 'up'
            ? (lang === 'zh' ? '🎯 难度提升！' : '🎯 Level Up!')
            : (lang === 'zh' ? '📉 难度降低' : '📉 Level Down') }}
        &nbsp; Lv.{{ difficulty }}
      </div>
    </transition>

    <!-- ── Result overlay ─────────────────────────────────────────── -->
    <transition name="result-fade">
      <div v-if="resultOverlay" class="result-overlay" :class="resultOverlay">
        {{ resultOverlay === 'correct' ? t('correct') : resultOverlay === 'wrong' ? t('wrong') : t('timeUp') }}
      </div>
    </transition>

    <!-- ── Game-over modal ────────────────────────────────────────── -->
    <div v-if="gameOver" class="modal-backdrop">
      <div class="gameover-card card">
        <h2>{{ t('gameOver') }}</h2>
        <div class="go-stats">
          <div class="go-row"><span>{{ t('totalScore') }}</span><span class="go-val highlight">{{ score }}</span></div>
          <div class="go-row"><span>{{ t('totalTrials') }}</span><span class="go-val">{{ totalTrials }}</span></div>
          <div class="go-row"><span>{{ t('correctCount') }}</span><span class="go-val">{{ correctTrials }}</span></div>
          <div class="go-row"><span>{{ t('accuracy') }}</span><span class="go-val">{{ accuracyStr }}</span></div>
          <div class="go-row"><span>{{ t('avgTime') }}</span><span class="go-val">{{ avgTimeStr }}</span></div>
        </div>
        <BatchTrainActions :home-text="t('backHome')" @home="doBack" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game10GamePage',
};
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted,inject } from '@vue/composition-api'
import { useI18n } from '../i18n.js'
import { generateMaze, getDifficultyConfig } from '../mazeGenerator.js'
import MazeDisplay from './MazeDisplay.vue'
import api from '@/api'
import { getTrainTypeForGame } from '@/utils/pbGameRegistry'
import BatchTrainActions from '@/components/pbGame/BatchTrainActions.vue'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ lang: String, duration: { type: Number, default: 60 } })
const emit = defineEmits(['end', 'back'])
const t = useI18n(() => props.lang)

// ── Game state ────────────────────────────────────────────────────────────────
const difficulty    = ref(getBatchStartDifficultyForGame('mzxh'))
const score         = ref(0)
const totalTimeLeft = ref(props.duration)
const phase         = ref('idle')       // 'idle' | 'watching' | 'player' | 'result'
const gameOver      = ref(false)
const resultOverlay = ref(null)         // 'correct' | 'wrong' | 'timeup'

// maze
const maze         = ref(null)
const robotIndex   = ref(0)
const playerVisited = ref(new Set())
const playerHead   = ref(-1)

// answer timer
const answerTimeLeft = ref(10)
const answerTimePct  = computed(() => {
  const max = getDifficultyConfig(difficulty.value).answerTime
  return (answerTimeLeft.value / max) * 100
})

// stats
const totalTrials   = ref(0)
const correctTrials = ref(0)
const trialTimes    = ref([])       // ms per correct trial
const trialNum      = ref(0)

// difficulty-window stats (every 30s)
const windowTrials  = ref(0)
const windowCorrect = ref(0)
const windowTimer   = ref(0)        // counts seconds in current 30s window
const diffToast     = ref(null)     // 'up' | 'down' | null (shown when difficulty changes)
const archiveId = inject('archiveId', ref(-1));

const accuracyStr = computed(() => {
  if (totalTrials.value === 0) return '—'
  return ((correctTrials.value / totalTrials.value) * 100).toFixed(1) + '%'
})
const avgTimeStr = computed(() => {
  if (trialTimes.value.length === 0) return '—'
  const avg = trialTimes.value.reduce((a, b) => a + b, 0) / trialTimes.value.length
  return (avg / 1000).toFixed(2) + 's'
})

// ── Status bar ────────────────────────────────────────────────────────────────
const statusMsg = computed(() => {
  if (phase.value === 'watching') return t('watching')
  if (phase.value === 'player')   return t('yourTurn')
  return ''
})
const statusClass = computed(() => ({
  'status-watching': phase.value === 'watching',
  'status-player':   phase.value === 'player',
}))

// ── Timers ────────────────────────────────────────────────────────────────────
let mainTimer    = null
let robotTimer   = null
let answerTimer  = null
let trialStartTs = 0

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  startMainTimer()
  nextTrial()
})
onUnmounted(() => {
  clearInterval(mainTimer)
  clearInterval(robotTimer)
  clearInterval(answerTimer)
})

// ── Main countdown (1s tick) ──────────────────────────────────────────────────
function startMainTimer() {
  mainTimer = setInterval(() => {
    if (gameOver.value) return
    totalTimeLeft.value--
    windowTimer.value++

    // Difficulty adjustment every 30s
    if (windowTimer.value >= 30) {
      adjustDifficulty()
      windowTimer.value = 0
      windowTrials.value  = 0
      windowCorrect.value = 0
    }

    if (totalTimeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

// ── Difficulty auto-adjust ────────────────────────────────────────────────────
function adjustDifficulty() {
  if (windowTrials.value === 0) return
  const rate = windowCorrect.value / windowTrials.value
  let changed = null
  if (rate >= 0.9 && difficulty.value < 6) {
    difficulty.value++
    changed = 'up'
  } else if (rate <= 0.7 && difficulty.value > 1) {
    difficulty.value--
    changed = 'down'
  }
  if (changed) {
    diffToast.value = changed
    setTimeout(() => { diffToast.value = null }, 2000)
  }
}

// ── Trial lifecycle ───────────────────────────────────────────────────────────
function nextTrial() {
  if (gameOver.value) return
  clearInterval(robotTimer)
  clearInterval(answerTimer)

  maze.value          = generateMaze(difficulty.value, trialNum.value)
  trialNum.value++
  robotIndex.value    = 0
  playerVisited.value = new Set()
  playerHead.value    = -1
  resultOverlay.value = null
  phase.value         = 'idle'

  // Short pause then start robot animation
  setTimeout(() => startRobotPhase(), 400)
}

function startRobotPhase() {
  phase.value      = 'watching'
  robotIndex.value = 0

  robotTimer = setInterval(() => {
    if (robotIndex.value < maze.value.path.length - 1) {
      robotIndex.value++
    } else {
      clearInterval(robotTimer)
      // Pause briefly after robot finishes, then start player phase
      setTimeout(() => startPlayerPhase(), 600)
    }
  }, 450)
}

function startPlayerPhase() {
  phase.value       = 'player'
  playerHead.value  = -1        // player must click index 0 first
  playerVisited.value = new Set()

  const cfg = getDifficultyConfig(difficulty.value)
  answerTimeLeft.value = cfg.answerTime
  trialStartTs = Date.now()

  answerTimer = setInterval(() => {
    answerTimeLeft.value--
    if (answerTimeLeft.value <= 0) {
      clearInterval(answerTimer)
      recordResult(false, 'timeup')
    }
  }, 1000)
}

// ── Player input ──────────────────────────────────────────────────────────────
function onCellClick(idx) {
  if (phase.value !== 'player') return

  const expected = playerHead.value + 1

  if (idx === expected) {
    // Correct click
    playerVisited.value = new Set([...playerVisited.value, idx])
    playerHead.value = idx

    if (idx === maze.value.path.length - 1) {
      // Reached the end!
      clearInterval(answerTimer)
      recordResult(true, 'correct')
    }
  } else {
    // Wrong cell
    clearInterval(answerTimer)
    recordResult(false, 'wrong')
  }
}

// ── Record trial result ───────────────────────────────────────────────────────
function recordResult(isCorrect, type) {
  phase.value         = 'result'
  resultOverlay.value = type
  totalTrials.value++
  windowTrials.value++

  if (isCorrect) {
    const cfg = getDifficultyConfig(difficulty.value)
    score.value += Math.round(5 * cfg.coefficient)
    correctTrials.value++
    windowCorrect.value++
    const elapsed = Date.now() - trialStartTs
    trialTimes.value.push(elapsed)
  }

  // After brief display, move to next trial
  setTimeout(() => {
    resultOverlay.value = null
    if (!gameOver.value) nextTrial()
  }, 900)
}

// ── End game ──────────────────────────────────────────────────────────────────
function endGame() {
  clearInterval(mainTimer)
  clearInterval(robotTimer)
  clearInterval(answerTimer)
  phase.value    = 'idle'
  gameOver.value = true

  // Save to localStorage
  saveHistory()
}

function saveHistory() {
  const record = {
    time:       new Date().toLocaleString(),
    item:       props.lang === 'zh' ? '迷宫巡航' : 'Maze Navigation',
    difficulty: difficulty.value,
    duration:   props.duration,
    total:      totalTrials.value,
    success:    correctTrials.value,
    failure:    totalTrials.value - correctTrials.value,
    rate:       totalTrials.value > 0
                  ? ((correctTrials.value / totalTrials.value) * 100).toFixed(1) + '%'
                  : '0%',
    avgReaction: trialTimes.value.length > 0
                  ? ((trialTimes.value.reduce((a,b)=>a+b,0)/trialTimes.value.length)/1000).toFixed(2) + 's'
                  : '—',
    score:      score.value,
  }
  const avgMs = trialTimes.value.length > 0
    ? trialTimes.value.reduce((a, b) => a + b, 0) / trialTimes.value.length
    : 0
  const body={
    archiveId: archiveId.value,
      trainType: getTrainTypeForGame('mzxh'),
      gameType: 'mzxh',
      minTime: trialTimes.value.length ? Math.min(...trialTimes.value) / 1000 : 0,
      maxTime: trialTimes.value.length ? Math.max(...trialTimes.value) / 1000 : 0,
      avgTime: parseFloat((avgMs / 1000).toFixed(2)),
      score: score.value,
      successCount: correctTrials.value,
      failCount: totalTrials.value - correctTrials.value,
      trainDuration: props.duration,
      difficultyLevel: difficulty.value,
    }
    api.submitPbGameRecord(body).catch(() => {});
  const history = JSON.parse(localStorage.getItem('mazeHistory') || '[]')
  history.unshift(record)
  localStorage.setItem('mazeHistory', JSON.stringify(history.slice(0, 50)))
}

const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

function confirmBack() {
  if (!leavePbGameWindow()) return
  clearInterval(mainTimer)
  clearInterval(robotTimer)
  clearInterval(answerTimer)
}

function doBack() {
  emit('end')
}
</script>

<style scoped>
.game-wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

/* ── HUD ── */
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(6px,1.2vh,14px) clamp(10px,2vw,20px);
  background: #f8f9fa;
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
}
.hud-left {
  display: flex;
  gap: clamp(12px, 3vw, 36px);
  align-items: center;
}
.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hud-label {
  font-size: clamp(10px, 1.5vmin, 14px);
  color: #666;
}
.hud-val {
  font-size: clamp(16px, 3vmin, 28px);
  font-weight: 700;
}
.diff-val  { color: #FFB74D; }
.score-val { color: #81C784; }
.time-val  { color: #4A90E2; }
.time-urgent { color: #EF5350; animation: blink 0.5s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }

.back-btn { font-size: clamp(12px,1.8vmin,16px); padding: 6px 14px; }
.hud-btns { display: flex; gap: 10px; align-items: center; }

/* ── Status ── */
.status-bar {
  text-align: center;
  font-size: clamp(13px, 2.2vmin, 20px);
  font-weight: 600;
  padding: clamp(4px,0.8vh,10px);
  min-height: clamp(24px, 4vh, 44px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.status-watching { color: #FFB74D; }
.status-player   { color: #81C784; }

/* ── Maze area ── */
.maze-area {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(4px, 1vh, 12px);
  overflow: hidden;
}

/* ── Answer timer bar ── */
.answer-timer-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: clamp(4px,0.8vh,10px) clamp(10px,2vw,20px);
  flex-shrink: 0;
  min-height: clamp(24px, 4vh, 44px);
}
.answer-timer-wrap.placeholder { min-height: clamp(24px, 4vh, 44px); }
.answer-timer-track {
  flex: 1;
  height: clamp(6px, 1vh, 12px);
  background: #e0e0e0;
  border-radius: 9999px;
  overflow: hidden;
}
.answer-timer-fill {
  height: 100%;
  background: #1976D2;
  border-radius: 9999px;
  transition: width 0.9s linear, background .3s;
}
.answer-timer-fill.urgent { background: #EF5350; }
.answer-time-label {
  font-size: clamp(12px, 1.8vmin, 16px);
  color: #666;
  min-width: 30px;
  text-align: right;
}

/* ── Result overlay ── */
.result-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(24px, 5vmin, 48px);
  font-weight: 800;
  padding: clamp(12px,2vh,24px) clamp(24px,4vw,48px);
  border-radius: 16px;
  pointer-events: none;
  z-index: 50;
}
.result-overlay.correct { background: rgba(46,125,50,.9); color: #fff; }
.result-overlay.wrong   { background: rgba(183,28,28,.9); color: #fff; }
.result-overlay.timeup  { background: rgba(230,81,0,.9);  color: #fff; }

.result-fade-enter-active, .result-fade-leave-active { transition: opacity .3s; }
.result-fade-enter-from, .result-fade-leave-to { opacity: 0; }

/* ── Difficulty toast ── */
.diff-toast {
  position: fixed;
  top: clamp(60px, 10vh, 100px);
  left: 50%;
  transform: translateX(-50%);
  padding: clamp(8px,1.5vh,14px) clamp(18px,3vw,32px);
  border-radius: 24px;
  font-size: clamp(14px, 2.4vmin, 20px);
  font-weight: 700;
  pointer-events: none;
  z-index: 60;
  white-space: nowrap;
}
.diff-toast.up   { background: rgba(46,125,50,.92);   color: #fff; }
.diff-toast.down { background: rgba(183,28,28,.92);   color: #fff; }

.diff-toast-enter-active, .diff-toast-leave-active { transition: opacity .4s, transform .4s; }
.diff-toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.diff-toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(-16px); }

/* ── Window countdown ── */
.window-val { color: #CE93D8; }

/* ── Game-over modal ── */
.gameover-card {
  width: min(90vw, 380px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 2.5vh, 24px);
}
.gameover-card h2 {
  font-size: clamp(20px, 4vmin, 32px);
  color: #4A90E2;
  font-weight: 800;
}
.go-stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: clamp(10px,2vh,18px);
  border: 1px solid #e0e0e0;
}
.go-row {
  display: flex;
  justify-content: space-between;
  font-size: clamp(13px, 2vmin, 18px);
  color: #333;
}
.go-val { font-weight: 700; }
.highlight { color: #FFB74D; font-size: 1.2em; }
</style>
