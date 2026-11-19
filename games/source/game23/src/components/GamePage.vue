<template>
  <div class="game-page" :style="bgStyle">
    <div class="bg-img"></div>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.difficulty }}</span>
          <span class="hud-val diff-val">Lv.{{ difficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-val score-val">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-val" :class="timeLeft <= 10 ? 'time-urgent' : 'time-val'">{{ timeLeft }}s</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.adjustIn }}</span>
          <span class="hud-val window-val">{{ 60 - windowTimer }}s</span>
        </div>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ lang === 'zh' ? '跳过游戏' : 'Skip' }}</button>
        <button class="back-btn" @click="confirmBack">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Instruction -->
    <div class="instruction">
      <span v-if="memorizing">{{ lang === 'zh' ? `请记住锁孔形状… ${memorizeLeft}s` : `Memorize the keyholes… ${memorizeLeft}s` }}</span>
      <span v-else>{{ t.instruction }}</span>
    </div>

    <!-- Game area -->
    <div class="game-area">
      <!-- Lock (left) -->
      <div class="chest-section">
        <div class="lock-card" :class="{ 'open-anim': chestOpen, 'memorize-glow': memorizing }">
          <LockSvg :parts="currentQ ? currentQ.lockParts : []" :open="chestOpen" :hidden="!memorizing && !chestOpen ? true : false" />
          <transition name="unlock">
            <div v-if="chestOpen" class="unlock-burst">
              <div class="unlock-check">✓</div>
              <div v-for="n in 8" :key="n" class="spark" :style="sparkStyle(n)"></div>
            </div>
          </transition>
        </div>
        <div class="arrow">→</div>
      </div>

      <!-- Keys (right) -->
      <div class="keys-section">
        <template v-if="memorizing">
          <div class="key-placeholder" v-for="i in (currentQ ? currentQ.options.length : 0)" :key="i">
            <div class="placeholder-q">?</div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(key, i) in currentQ ? currentQ.options : []"
            :key="i"
            class="key-card"
            :class="{
              selected: selectedIdx === i,
              correct: answered && i === currentQ.correctIdx,
              wrong: answered && selectedIdx === i && i !== currentQ.correctIdx,
              disabled: answered
            }"
            @click="selectKey(i)"
          >
            <KeySvg :shapes="key.shapes" />
          </div>
        </template>
      </div>
    </div>

    <!-- Difficulty toast -->
    <transition name="toast">
      <div v-if="diffToast" class="diff-toast" :class="diffToast">
        {{ diffToast === 'up' ? (lang === 'zh' ? '难度提升！' : 'Level Up!') : (lang === 'zh' ? '难度降低' : 'Level Down') }}
        Lv.{{ difficulty }}
      </div>
    </transition>

    <!-- Game over modal -->
    <div v-if="gameOver" class="modal-backdrop">
      <div class="gameover-card">
        <h2>{{ lang === 'zh' ? '游戏结束' : 'Game Over' }}</h2>
        <div class="go-stats">
          <div class="go-row"><span>{{ lang === 'zh' ? '总得分' : 'Score' }}</span><span class="highlight">{{ score }}</span></div>
          <div class="go-row"><span>{{ lang === 'zh' ? '总题数' : 'Total' }}</span><span>{{ totalTrials }}</span></div>
          <div class="go-row"><span>{{ lang === 'zh' ? '答对' : 'Correct' }}</span><span class="c-correct">{{ correctTrials }}</span></div>
          <div class="go-row"><span>{{ lang === 'zh' ? '答错' : 'Wrong' }}</span><span class="c-wrong">{{ totalTrials - correctTrials }}</span></div>
          <div class="go-row"><span>{{ lang === 'zh' ? '正确率' : 'Accuracy' }}</span><span>{{ accuracyStr }}</span></div>
          <div class="go-row"><span>{{ lang === 'zh' ? '平均反应' : 'Avg React' }}</span><span>{{ avgTimeStr }}</span></div>
        </div>
        <button class="go-btn" @click="doEnd">{{ lang === 'zh' ? '确认' : 'OK' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import messages from '../i18n.js'
import LockSvg from './LockSvg.vue'
import KeySvg from './KeySvg.vue'
import { bgImage } from '../../utils/images.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'yspp'
const props = defineProps({ lang: String, duration: { type: Number, default: 60 } })
const emit = defineEmits(['end', 'back'])
const t = computed(() => messages[props.lang] || messages.zh)
const showBatchSkip = shouldShowPbBatchSkip() // 仅一键启动显示
const bgStyle = { background: `url('${bgImage}') center/contain no-repeat, #0d0618` } // 背景样式

/**
 * <summary>
 * 批次跳过当前游戏
 * </summary>
 */
function onBatchSkip() { skipPbBatchGame() }

// ── Shape pool & similarity groups ───────────────────────────────────────────
const SHAPES = ['circle', 'square', 'rect', 'triangle', 'quad', 'diamond', 'star', 'hex', 'oct']
// Visually-similar shapes share a group. Used to pick confusing distractors.
const SIM_GROUPS = [
  ['square', 'rect'],
  ['triangle', 'quad', 'diamond'],
  ['star', 'hex', 'oct'],
]
const SIM_MAP = {}
SIM_GROUPS.forEach(g => g.forEach(s => { SIM_MAP[s] = g.filter(x => x !== s) }))
function similarsOf(shape) { return SIM_MAP[shape] || [] }

// ── Difficulty config ─────────────────────────────────────────────────────────
// `simRatio` = probability each distractor option uses a similar-shape variant
// `swap`     = if true, distractor is built by swapping ONE part with a similar one (else fully regenerated)
const DIFF_CONFIG = {
  1: { parts: 1, options: 2, coefficient: 1,   simRatio: 0,    swap: false },
  2: { parts: 1, options: 3, coefficient: 1.5, simRatio: 0.5,  swap: false },
  3: { parts: 2, options: 3, coefficient: 2,   simRatio: 0.6,  swap: true  },
  4: { parts: 2, options: 4, coefficient: 2.5, simRatio: 0.75, swap: true  },
  5: { parts: 3, options: 4, coefficient: 3,   simRatio: 0.85, swap: true  },
  6: { parts: 3, options: 4, coefficient: 3.5, simRatio: 1,    swap: true  },
}

const MEMORIZE_MS = 5000

// ── State ─────────────────────────────────────────────────────────────────────
const difficulty    = ref(getBatchStartDifficultyForGame(GAME_TYPE)) // 起始难度
const score         = ref(0)
const timeLeft      = ref(props.duration)
const gameOver      = ref(false)
const currentQ      = ref(null)
const selectedIdx   = ref(null)
const answered      = ref(false)
const chestOpen     = ref(false)
const memorizing    = ref(false)   // true during the 5s reveal phase
const memorizeLeft  = ref(0)       // countdown shown to user

const totalTrials   = ref(0)
const correctTrials = ref(0)
const reactionTimes = ref([])
const windowTrials  = ref(0)
const windowCorrect = ref(0)
const windowTimer   = ref(0)
const diffToast     = ref(null)

let mainTimer = null
let memorizeTimer = null
let trialStart = 0
let endedEmitted = false // 是否已向 App 上报结束（防重复）

const accuracyStr = computed(() =>
  totalTrials.value === 0 ? '—' : Math.round(correctTrials.value / totalTrials.value * 100) + '%'
)
const avgTimeStr = computed(() => {
  if (!reactionTimes.value.length) return '—'
  const avg = reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length
  return (avg / 1000).toFixed(2) + 's'
})

// ── Question generation ───────────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function randShapes(n) {
  return shuffle([...SHAPES]).slice(0, n)
}

// Build a distractor by swapping ONE shape (preferring similars) — won't match target.
function buildSwapDistractor(correct, preferSimilar) {
  const shapes = [...correct]
  // Try multiple times to avoid duplicate
  for (let attempt = 0; attempt < 8; attempt++) {
    const idx = Math.floor(Math.random() * shapes.length)
    const orig = correct[idx]
    let pool
    if (preferSimilar) {
      const sims = similarsOf(orig)
      pool = sims.length ? sims : SHAPES.filter(s => s !== orig)
    } else {
      pool = SHAPES.filter(s => s !== orig)
    }
    const next = pool[Math.floor(Math.random() * pool.length)]
    shapes[idx] = next
    if (shapes.join() !== correct.join()) return shapes
    shapes[idx] = orig
  }
  // Fallback: change first part to any other shape
  const others = SHAPES.filter(s => s !== correct[0])
  return [others[Math.floor(Math.random() * others.length)], ...correct.slice(1)]
}

// Build a fully fresh distractor with the same `parts` count.
function buildFreshDistractor(correct, preferSimilar) {
  for (let attempt = 0; attempt < 12; attempt++) {
    let shapes
    if (preferSimilar) {
      // Map each part of correct to a similar shape (or random if no similars)
      shapes = correct.map(s => {
        const sims = similarsOf(s)
        if (sims.length && Math.random() < 0.8) return sims[Math.floor(Math.random() * sims.length)]
        const others = SHAPES.filter(x => x !== s)
        return others[Math.floor(Math.random() * others.length)]
      })
    } else {
      shapes = randShapes(correct.length)
    }
    if (shapes.join() !== correct.join()) return shapes
  }
  return buildSwapDistractor(correct, preferSimilar)
}

function genQuestion() {
  const cfg = DIFF_CONFIG[difficulty.value]
  const correctShapes = randShapes(cfg.parts)

  const options = [{ shapes: correctShapes }]
  const seen = new Set([correctShapes.join()])

  for (let i = 1; i < cfg.options; i++) {
    const useSimilar = Math.random() < cfg.simRatio
    let shapes
    for (let tries = 0; tries < 10; tries++) {
      shapes = cfg.swap
        ? buildSwapDistractor(correctShapes, useSimilar)
        : buildFreshDistractor(correctShapes, useSimilar)
      if (!seen.has(shapes.join())) break
    }
    seen.add(shapes.join())
    options.push({ shapes })
  }

  shuffle(options)
  const correctIdx = options.findIndex(o => o.shapes.join() === correctShapes.join())

  return { lockParts: correctShapes, options, correctIdx }
}

// ── Game flow ─────────────────────────────────────────────────────────────────
function nextQuestion() {
  chestOpen.value = false
  selectedIdx.value = null
  answered.value = false
  currentQ.value = genQuestion()
  startMemorize()
}

function startMemorize() {
  clearInterval(memorizeTimer)
  memorizing.value = true
  memorizeLeft.value = Math.ceil(MEMORIZE_MS / 1000)
  const startedAt = Date.now()
  memorizeTimer = setInterval(() => {
    const elapsed = Date.now() - startedAt
    memorizeLeft.value = Math.max(0, Math.ceil((MEMORIZE_MS - elapsed) / 1000))
    if (elapsed >= MEMORIZE_MS) {
      clearInterval(memorizeTimer)
      memorizing.value = false
      // reaction time starts when keys become selectable
      trialStart = Date.now()
    }
  }, 100)
}

function selectKey(i) {
  if (memorizing.value || answered.value || gameOver.value) return
  selectedIdx.value = i
  answered.value = true
  const isCorrect = i === currentQ.value.correctIdx
  totalTrials.value++
  windowTrials.value++

  if (isCorrect) {
    chestOpen.value = true
    const cfg = DIFF_CONFIG[difficulty.value]
    score.value += Math.round(5 * cfg.coefficient)
    correctTrials.value++
    windowCorrect.value++
    reactionTimes.value.push(Date.now() - trialStart)
  }

  setTimeout(() => {
    if (!gameOver.value) nextQuestion()
  }, isCorrect ? 900 : 700)
}

function adjustDifficulty() {
  if (windowTrials.value === 0) return
  const rate = windowCorrect.value / windowTrials.value
  let changed = null
  if (rate >= 0.9 && difficulty.value < 6) { difficulty.value++; changed = 'up' }
  else if (rate <= 0.7 && difficulty.value > 1) { difficulty.value--; changed = 'down' }
  if (changed) {
    diffToast.value = changed
    setTimeout(() => { diffToast.value = null }, 2000)
  }
  windowTrials.value = 0
  windowCorrect.value = 0
}

/**
 * <summary>
 * 倒计时结束：展示结算并自动上报（触发批次下一关）
 * </summary>
 */
function endGame() {
  clearInterval(mainTimer)
  clearInterval(memorizeTimer)
  gameOver.value = true
  doEnd()
}

/**
 * <summary>
 * 结束并回传本局结果给 App 上传（幂等，只触发一次）
 * </summary>
 */
function doEnd() {
  if (endedEmitted) return
  endedEmitted = true
  const avgMs = reactionTimes.value.length
    ? reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length : 0
  const durationLabel = props.duration === 60 ? '1min' : props.duration === 180 ? '3min' : '5min'
  const avgSec = avgMs > 0 ? avgMs / 1000 : 0
  emit('end', {
    score: score.value,
    finalLevel: difficulty.value,
    total: totalTrials.value,
    correct: correctTrials.value,
    wrong: totalTrials.value - correctTrials.value,
    avgReaction: avgSec,
    minReaction: reactionTimes.value.length ? Math.min(...reactionTimes.value) / 1000 : 0,
    maxReaction: reactionTimes.value.length ? Math.max(...reactionTimes.value) / 1000 : 0,
    durationLabel,
  })
}

/**
 * <summary>
 * 确认退出并关闭游戏窗口
 * </summary>
 */
function confirmBack() {
  leavePbGameWindow()
}

function sparkStyle(n) {
  const angle = (n / 8) * 360
  return {
    '--a': `${angle}deg`,
    animationDelay: `${(n % 4) * 0.05}s`,
  }
}

onMounted(() => {
  nextQuestion()
  mainTimer = setInterval(() => {
    if (gameOver.value) return
    timeLeft.value--
    windowTimer.value++
    if (windowTimer.value >= 60) {
      adjustDifficulty()
      windowTimer.value = 0
    }
    if (timeLeft.value <= 0) endGame()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(mainTimer)
  clearInterval(memorizeTimer)
})
</script>

<style scoped>
.game-page {
  width: 100vw; height: 100vh;
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}
.bg-img {
  position: absolute; inset: 0;
  z-index: 0;
  pointer-events: none;
  background: rgba(5, 2, 12, 0.35);
}
.bg-img::after {
  display: none;
}
.hud {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  padding: clamp(10px,2vh,20px) clamp(16px,3vw,32px);
  background: rgba(13,6,24,0.85);
  border-bottom: 1px solid rgba(168,85,247,0.3);
  flex-shrink: 0;
}
.hud-left { display: flex; gap: clamp(20px,4vw,60px); align-items: center; }
.hud-item { display: flex; flex-direction: column; align-items: center; }
.hud-label { font-size: clamp(14px,2vmin,20px); color: rgba(200,150,255,0.7); }
.hud-val { font-size: clamp(24px,4.5vmin,48px); font-weight: 700; }
.diff-val { color: #fbbf24; }
.score-val { color: #4ade80; }
.time-val { color: #a78bfa; }
.time-urgent { color: #f87171; animation: blink 0.5s step-end infinite; }
.window-val { color: #c084fc; }
.hud-right { display: flex; align-items: center; gap: clamp(8px, 1.5vw, 16px); }
@keyframes blink { 50% { opacity: 0.3; } }
.back-btn {
  padding: clamp(10px,2vh,18px) clamp(20px,3vw,36px);
  font-size: clamp(16px,2.5vmin,24px);
  font-weight: 700;
  background: rgba(239,68,68,0.2);
  border: 1px solid rgba(239,68,68,0.5);
  color: #fca5a5;
  border-radius: 0.8vmin;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover { background: rgba(239,68,68,0.4); }
.skip-btn {
  background: rgba(74,144,217,0.2);
  border-color: rgba(74,144,217,0.5);
  color: #93c5fd;
}
.skip-btn:hover { background: rgba(74,144,217,0.4); }

.instruction {
  position: relative; z-index: 1;
  text-align: center;
  font-size: clamp(18px,3vmin,32px);
  font-weight: 700;
  color: #e8d5ff;
  padding: clamp(10px,1.5vh,18px);
  background: rgba(13,6,24,0.6);
  flex-shrink: 0;
  text-shadow: 0 0 1vmin rgba(168,85,247,0.8);
}

.game-area {
  position: relative; z-index: 1;
  flex: 1; min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(20px,6vw,80px);
  padding: clamp(10px,2vh,30px) clamp(20px,4vw,60px);
}

.chest-section {
  display: flex; flex-direction: row; align-items: center; gap: clamp(8px,2vmin,20px);
}
.lock-card {
  width: clamp(220px, 38vmin, 460px);
  height: clamp(240px, 44vmin, 520px);
  padding: 1vmin;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: visible;
  filter: drop-shadow(0 0.5vmin 2vmin rgba(0,0,0,0.6));
  transition: filter 0.3s, transform 0.3s;
}
.lock-card.memorize-glow {
  filter: drop-shadow(0 0 2.5vmin rgba(168,85,247,0.7));
  animation: memPulse 1.2s ease-in-out infinite;
}
@keyframes memPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.03); }
}
.lock-card.open-anim {
  filter: drop-shadow(0 0 3vmin rgba(251,191,36,0.9));
  animation: lockShake 0.5s ease;
}
@keyframes lockShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-0.5vmin) rotate(-2deg); }
  40% { transform: translateX(0.5vmin) rotate(2deg); }
  60% { transform: translateX(-0.3vmin) rotate(-1deg); }
  80% { transform: translateX(0.3vmin) rotate(1deg); }
}

.unlock-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.unlock-check {
  position: absolute;
  top: -3vmin;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(28px, 6vmin, 60px);
  font-weight: 900;
  color: #4ade80;
  text-shadow:
    0 0 1vmin rgba(74,222,128,0.9),
    0 0 3vmin rgba(74,222,128,0.7);
  animation: checkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes checkPop {
  0%   { transform: translateX(-50%) scale(0) translateY(2vmin); opacity: 0; }
  60%  { transform: translateX(-50%) scale(1.2) translateY(-0.5vmin); opacity: 1; }
  100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
}
.spark {
  position: absolute;
  top: 55%; left: 50%;
  width: 1vmin; height: 1vmin;
  margin: -0.5vmin 0 0 -0.5vmin;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 1.5vmin #fbbf24, 0 0 3vmin rgba(251,191,36,0.6);
  animation: sparkFly 0.8s ease-out forwards;
}
@keyframes sparkFly {
  0%   { transform: rotate(var(--a)) translateY(0); opacity: 1; }
  100% { transform: rotate(var(--a)) translateY(-10vmin); opacity: 0; }
}
.unlock-enter-active { transition: opacity 0.2s; }
.unlock-leave-active { transition: opacity 0.3s; }
.unlock-enter-from, .unlock-leave-to { opacity: 0; }
.arrow {
  font-size: clamp(28px, 6vmin, 56px);
  color: #e8d5ff;
  font-weight: 900;
  text-shadow: 0 0 1vmin rgba(168,85,247,0.8);
}
.chest-label {
  font-size: clamp(12px,2vmin,18px);
  color: rgba(200,150,255,0.7);
  font-weight: 600;
}

.keys-section {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px,2vmin,24px);
  justify-content: center;
  align-items: center;
  max-width: 60vw;
}
.key-card {
  background: rgba(45,16,96,0.7);
  border: 0.3vmin solid rgba(168,85,247,0.4);
  border-radius: 1.5vmin;
  padding: 1.5vmin;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0.3vmin 1.5vmin rgba(0,0,0,0.4);
  width: 16vmin;
  height: 30vmin;
}
.key-placeholder {
  width: 16vmin;
  height: 30vmin;
  background: rgba(45,16,96,0.5);
  border: 0.3vmin dashed rgba(168,85,247,0.4);
  border-radius: 1.5vmin;
  display: flex; align-items: center; justify-content: center;
}
.placeholder-q {
  font-size: clamp(40px, 8vmin, 80px);
  font-weight: 900;
  color: rgba(200,150,255,0.5);
  font-family: 'Arial Black', sans-serif;
}
.key-card:hover:not(.disabled) {
  transform: translateY(-0.4vmin) scale(1.05);
  border-color: rgba(168,85,247,0.8);
  box-shadow: 0 0.8vmin 2.5vmin rgba(168,85,247,0.4);
}
.key-card.correct {
  border-color: #4ade80;
  background: rgba(74,222,128,0.15);
  box-shadow: 0 0 2vmin rgba(74,222,128,0.5);
}
.key-card.wrong {
  border-color: #f87171;
  background: rgba(248,113,113,0.15);
  box-shadow: 0 0 2vmin rgba(248,113,113,0.4);
}
.key-card.disabled { cursor: default; }

/* Toast */
.diff-toast {
  position: fixed;
  top: clamp(60px,10vh,100px);
  left: 50%; transform: translateX(-50%);
  padding: clamp(8px,1.5vh,14px) clamp(18px,3vw,32px);
  border-radius: 2vmin;
  font-size: clamp(14px,2.4vmin,22px);
  font-weight: 700;
  pointer-events: none;
  z-index: 60;
  white-space: nowrap;
}
.diff-toast.up   { background: rgba(74,222,128,0.9); color: #052e16; }
.diff-toast.down { background: rgba(248,113,113,0.9); color: #450a0a; }
.toast-enter-active, .toast-leave-active { transition: opacity .4s, transform .4s; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(-16px); }

/* Game over modal */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.gameover-card {
  background: linear-gradient(135deg, #1e0a3c, #2d1060);
  border: 1px solid rgba(168,85,247,0.5);
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  width: min(90vw, 380px);
  color: #e8d5ff;
  box-shadow: 0 0 5vmin rgba(168,85,247,0.4);
  display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
}
.gameover-card h2 { font-size: clamp(20px,4vmin,32px); color: #c084fc; font-weight: 900; }
.go-stats { width: 100%; display: flex; flex-direction: column; gap: 1vmin; }
.go-row {
  display: flex; justify-content: space-between;
  font-size: clamp(13px,2vmin,18px);
  padding: 0.6vmin 1vmin;
  background: rgba(255,255,255,0.05);
  border-radius: 0.5vmin;
}
.go-row span:last-child { font-weight: 700; }
.highlight { color: #fbbf24; font-size: 1.2em; }
.c-correct { color: #4ade80; }
.c-wrong { color: #f87171; }
.go-btn {
  padding: 1.5vmin 5vmin;
  background: linear-gradient(135deg, #6b21a8, #a855f7);
  color: #fff;
  border: none;
  border-radius: 1vmin;
  font-size: clamp(14px,2.2vmin,20px);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.go-btn:hover { opacity: 0.85; }
</style>
