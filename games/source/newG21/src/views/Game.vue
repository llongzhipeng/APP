<template>
  <div class="game">
    <!-- 顶部 HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t('difficulty') }}</span>
          <span class="hud-value">{{ currentDiff.level }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t('score') }}</span>
          <span class="hud-value">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t('timeLeft') }}</span>
          <span class="hud-value">{{ formatMS(remainingSec) }}</span>
        </div>
      </div>

      <div class="hud-center">
        <div class="requirement">
          {{ phase === 'showing' ? t('memorize') : t('clickInOrder') }}
        </div>
        <!-- 答题倒计时进度条（始终占位以固定 HUD 高度） -->
        <div class="round-timer" :style="{ visibility: phase === 'input' ? 'visible' : 'hidden' }">
          <div class="round-timer-fill" :style="{ width: (roundRatio * 100) + '%' }"></div>
        </div>
      </div>

      <div class="hud-right">
        <button v-if="showBatchSkip" class="g-btn secondary small" @click="onSkipClick">{{ t('skipGame') }}</button>
        <button class="g-btn ghost small" @click="onExit">{{ t('exit') }}</button>
      </div>
    </div>

    <!-- 游戏舞台 -->
    <div class="stage" @click="onStageClick">
      <div
        v-for="(s, i) in stars"
        :key="roundId + '-' + i"
        class="star-wrap"
        :style="{ left: s.x + '%', top: s.y + '%' }"
      >
        <img
          v-if="starVisible(s)"
          :src="starSrc(s)"
          class="star"
          :class="{
            pop: starVisible(s),
            hit: s.justClicked,
            placeholder: phase === 'input' && !s.clicked,
            clicked: phase === 'input' && s.clicked
          }"
          @click.stop="onStarClick(i)"
        />
        <div
          v-if="phase === 'showing' && s.shown && !s.orderHidden"
          class="order-num"
        >{{ i + 1 }}</div>
      </div>

      <!-- 反馈提示 -->
      <transition name="fb">
        <div v-if="feedback" class="feedback" :class="feedback.type">{{ feedback.text }}</div>
      </transition>
    </div>

    <!-- 退出确认 -->
    <div v-if="showExitConfirm" class="modal-mask">
      <div class="modal">
        <p>{{ t('confirmExit') }}</p>
        <div class="modal-btns">
          <button class="g-btn ghost" @click="cancelExit">{{ t('cancel') }}</button>
          <button class="g-btn" @click="confirmExit">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { resolveImage } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { ref, reactive, computed, onMounted, onBeforeUnmount } from '@vue/composition-api'
import { DIFFICULTIES } from '../config.js'
import { useI18n } from '../i18n.js'
import { generateStarPositions, saveHistory } from '../utils.js'
import { playVoice, stopVoice } from '../voice.js'
import { submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'xxlx'

const props = defineProps({
  durationMin: { type: Number, required: true },
  archiveId: { type: [Number, String], default: -1 },
})
const emit = defineEmits(['finish', 'exit'])
const i18n = useI18n()
const t = i18n.t
const lang = computed(() => i18n.lang)

// ==== 状态 ====
const diffIndex = ref(Math.max(0, getBatchStartDifficultyForGame('xxlx') - 1)) // 0..6 => 难度 1..7
const currentDiff = computed(() => DIFFICULTIES[diffIndex.value])

const score = ref(0)
const remainingSec = ref(props.durationMin * 60)

// stars: { x, y, shown, clicked, justClicked, orderHidden }
//   shown       - showing 阶段是否已依次出现
//   clicked     - input 阶段用户是否已点击（点击后 2.png 变回 1.png）
//   orderHidden - showing 阶段的序号是否已隐藏
const stars = ref([])
const roundId = ref(0)
const phase = ref('idle')      // 'showing' | 'input' | 'feedback' | 'finished'
const clickOrder = ref([])     // 用户点击的星星下标序列
const roundStartAt = ref(0)
const roundDeadline = ref(0)   // performance.now() 到期时间
const roundRatio = ref(1)

const feedback = ref(null)
const showExitConfirm = ref(false)
const paused = ref(false)
const showBatchSkip = shouldShowPbBatchSkip()
let pauseStartTime = 0

// 每 60 秒窗口统计
const winStats = reactive({ total: 0, correct: 0, startAt: 0 })

// 全局统计
const stats = reactive({
  total: 0,
  success: 0,
  fail: 0,
  sumResponseMs: 0,
  levelHistogram: {}
})

// ==== 定时器 ====
let mainTick = null
let roundTick = null
let roundTimerId = null
let phaseTimers = []
function pushTimer(id) { phaseTimers.push(id) }
function clearPhaseTimers() { phaseTimers.forEach(clearTimeout); phaseTimers = [] }

onMounted(() => {
  winStats.startAt = Date.now()
  startMainTick()
  startNextRound()
})
onBeforeUnmount(() => {
  clearAll()
  stopVoice()
})

function clearAll() {
  clearInterval(mainTick); mainTick = null
  cancelAnimationFrame(roundTick); roundTick = null
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }
  clearPhaseTimers()
}

function startMainTick() {
  mainTick = setInterval(() => {
    if (paused.value) return
    remainingSec.value -= 1
    const elapsed = props.durationMin * 60 - remainingSec.value
    if (elapsed > 0 && elapsed % 60 === 0) {
      adjustDifficulty()
    }
    if (remainingSec.value <= 0) {
      remainingSec.value = 0
      finishGame()
    }
  }, 1000)
}

function adjustDifficulty() {
  if (winStats.total > 0) {
    const rate = winStats.correct / winStats.total * 100
    if (rate >= 90 && diffIndex.value < DIFFICULTIES.length - 1) {
      diffIndex.value += 1
    } else if (rate <= 70 && diffIndex.value > 0) {
      diffIndex.value -= 1
    }
  }
  winStats.total = 0
  winStats.correct = 0
  winStats.startAt = Date.now()
}

// ==== 单局回合 ====
function starVisible(s) {
  if (phase.value === 'showing') return s.shown
  // input / feedback / idle 期间只要星星在阵列中就展示（占位符或点亮态）
  return phase.value === 'input' || phase.value === 'feedback'
}

function starSrc(s) {
  if (phase.value === 'input' && !s.clicked) return resolveImage('/images/2.png')
  return resolveImage('/images/1.png')
}

function startNextRound() {
  clearPhaseTimers()
  feedback.value = null
  roundRatio.value = 1
  cancelAnimationFrame(roundTick); roundTick = null
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }

  const diff = currentDiff.value
  const positions = generateStarPositions(diff.starCount)
  stars.value = positions.map(p => ({
    x: p.x, y: p.y,
    shown: false, clicked: false,
    justClicked: false, orderHidden: false
  }))
  roundId.value += 1
  clickOrder.value = []
  phase.value = 'showing'
  // 语音提示：请记忆星星出现的顺序
  playVoice(i18n.lang, 1)

  // 依次让星星以 1.png 出现（700ms 间隔）
  const showInterval = 700
  for (let i = 0; i < diff.starCount; i++) {
    const idx = i
    pushTimer(setTimeout(() => {
      if (!stars.value[idx]) return
      stars.value[idx].shown = true
    }, showInterval * (i + 1)))
  }
  // 全部出现后 700ms 隐藏序号，再过 400ms 进入 input 阶段（此时 1.png 全部消失，2.png 出现）
  const allShownMs = showInterval * (diff.starCount + 1)
  pushTimer(setTimeout(() => {
    stars.value.forEach(s => { s.orderHidden = true })
  }, allShownMs + 700))
  pushTimer(setTimeout(() => {
    beginInputPhase()
  }, allShownMs + 1100))
}

function beginInputPhase() {
  phase.value = 'input'
  // 语音提示：请依次点亮星星
  playVoice(i18n.lang, 2)
  const now = performance.now()
  roundStartAt.value = now
  const durationMs = currentDiff.value.maxTime * 1000
  roundDeadline.value = now + durationMs
  roundRatio.value = 1

  // 使用 setInterval 计时，兼容平板浏览器后台/低帧场景（requestAnimationFrame 会被节流）
  cancelAnimationFrame(roundTick); roundTick = null
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }
  roundTimerId = setInterval(() => {
    if (paused.value) return
    const t = performance.now()
    const left = roundDeadline.value - t
    if (left <= 0) {
      roundRatio.value = 0
      clearInterval(roundTimerId); roundTimerId = null
      onTimeout()
      return
    }
    roundRatio.value = left / durationMs
  }, 100)
}

function onStarClick(i) {
  if (phase.value !== 'input') return
  const s = stars.value[i]
  if (s.clicked) return

  s.clicked = true
  s.justClicked = true
  setTimeout(() => { s.justClicked = false }, 400)
  clickOrder.value.push(i)

  // 全部点完后再判断顺序
  if (clickOrder.value.length >= stars.value.length) {
    evaluateRound()
  }
}

function evaluateRound() {
  const correct = clickOrder.value.every((idx, k) => idx === k)
  if (correct) onRoundCorrect()
  else onRoundWrong()
}

function onStageClick() { /* 舞台空白点击不做处理 */ }

function onRoundCorrect() {
  cancelAnimationFrame(roundTick); roundTick = null
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }
  const responseMs = performance.now() - roundStartAt.value
  const diff = currentDiff.value
  const gained = 5 * diff.coef
  score.value += gained

  stats.total += 1
  stats.success += 1
  stats.sumResponseMs += responseMs
  stats.levelHistogram[diff.level] = (stats.levelHistogram[diff.level] || 0) + 1
  winStats.total += 1
  winStats.correct += 1

  showFeedback('correct', `+${gained}  ${t('correct')}`)
  phase.value = 'feedback'
  pushTimer(setTimeout(() => {
    if (remainingSec.value > 0) startNextRound()
  }, 900))
}

function onRoundWrong() {
  cancelAnimationFrame(roundTick); roundTick = null
  if (roundTimerId) { clearInterval(roundTimerId); roundTimerId = null }
  const responseMs = performance.now() - roundStartAt.value
  const diff = currentDiff.value
  stats.total += 1
  stats.fail += 1
  stats.sumResponseMs += responseMs
  stats.levelHistogram[diff.level] = (stats.levelHistogram[diff.level] || 0) + 1
  winStats.total += 1

  showFeedback('wrong', t('wrong'))
  phase.value = 'feedback'
  pushTimer(setTimeout(() => {
    if (remainingSec.value > 0) startNextRound()
  }, 1000))
}

function onTimeout() {
  const diff = currentDiff.value
  const responseMs = diff.maxTime * 1000
  stats.total += 1
  stats.fail += 1
  stats.sumResponseMs += responseMs
  stats.levelHistogram[diff.level] = (stats.levelHistogram[diff.level] || 0) + 1
  winStats.total += 1

  showFeedback('wrong', t('timeout'))
  phase.value = 'feedback'
  pushTimer(setTimeout(() => {
    if (remainingSec.value > 0) startNextRound()
  }, 1000))
}

function showFeedback(type, text) {
  feedback.value = { type, text }
  pushTimer(setTimeout(() => { feedback.value = null }, 800))
}

function onSkipClick() {
  skipPbBatchGame()
}

function onExit() {
  paused.value = true
  pauseStartTime = performance.now()
  showExitConfirm.value = true
}
function cancelExit() {
  showExitConfirm.value = false
  if (paused.value && pauseStartTime) {
    const delta = performance.now() - pauseStartTime
    if (roundStartAt.value) roundStartAt.value += delta
    if (roundDeadline.value) roundDeadline.value += delta
  }
  paused.value = false
}
/**
 * <summary>
 * 中途确认返回：只清定时器并离开，不上传训练数据
 * </summary>
 */
function confirmExit() {
  showExitConfirm.value = false // 关闭确认框
  clearAll() // 停止计时/语音
  leavePbGameWindow({ confirm: false })
}

function finishGame() {
  if (phase.value === 'finished') return
  phase.value = 'finished'
  clearAll()

  const hist = stats.levelHistogram
  let mainLevel = currentDiff.value.level
  let mx = 0
  for (const lv in hist) {
    if (hist[lv] > mx) { mx = hist[lv]; mainLevel = Number(lv) }
  }

  const rate = stats.total ? Math.round(stats.success / stats.total * 100) : 0
  const avgMs = stats.total ? Math.round(stats.sumResponseMs / stats.total) : 0

  const record = {
    time: Date.now(),
    durationMin: props.durationMin,
    difficultyDisplay: Object.keys(hist).sort((a,b)=>Number(a)-Number(b)).join('/') || String(currentDiff.value.level),
    difficultyMain: mainLevel,
    total: stats.total,
    success: stats.success,
    fail: stats.fail,
    rate,
    avgMs,
    score: Math.round(score.value)
  }
  saveHistory(record)
  submitPbGameEndRecord(props.archiveId, GAME_TYPE, {
    avgTime: toPbGameSeconds(avgMs || 0),
    score: score.value,
    successCount: stats.success,
    failCount: stats.fail,
    trainDuration: props.durationMin,
    difficultyLevel: currentDiff.value.level, // 上传 = 页面当前难度，不用众数
  }).catch(() => {})
  emit('finish', record)
}

function formatMS(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
</script>

<style scoped>
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.hud {
  display: flex;
  align-items: center;
  padding: 2vmin 3vmin;
  gap: 2vmin;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 0.2vmin solid rgba(255, 224, 100, 0.3);
  min-height: 12vmin;
  box-sizing: border-box;
}
.hud-left {
  display: flex;
  gap: 2.5vmin;
  min-width: 40%;
}
.hud-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.8vmin 1.6vmin;
  background: rgba(255, 224, 100, 0.15);
  border: 0.2vmin solid #ffe066;
  border-radius: 1vmin;
  min-width: 12vmin;
}
.hud-label {
  font-size: 1.6vmin;
  color: #ffe066;
  opacity: 0.85;
}
.hud-value {
  font-size: 3vmin;
  color: #fff;
  font-weight: bold;
  line-height: 1.1;
}
.hud-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vmin;
}
.requirement {
  padding: 1.2vmin 3.5vmin;
  font-size: 2.6vmin;
  color: #ffe066;
  text-align: center;
  font-weight: bold;
  background: linear-gradient(180deg, rgba(255, 224, 100, 0.25) 0%, rgba(255, 184, 77, 0.18) 100%);
  border: 0.3vmin solid #ffe066;
  border-radius: 999px;
  box-shadow: 0 0 2vmin rgba(255, 224, 100, 0.45), inset 0 0 1.2vmin rgba(255, 255, 255, 0.15);
  text-shadow: 0 0 1.5vmin rgba(255, 224, 100, 0.55);
  letter-spacing: 0.2vmin;
}
.round-timer {
  width: 40vmin;
  height: 1.2vmin;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1vmin;
  overflow: hidden;
}
.round-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6a3d, #ffe066);
  transition: width 0.1s linear;
}
.hud-right {
  display: flex;
  min-width: 12vmin;
  justify-content: flex-end;
}
.g-btn.small {
  padding: 1vmin 2.4vmin;
  font-size: 2.2vmin;
}

.stage {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.star-wrap {
  position: absolute;
  transform: translate(-50%, -50%);
}
.star {
  width: 12vmin;
  height: 12vmin;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.3);
  transition: opacity 0.35s ease-out, transform 0.35s ease-out;
  filter: drop-shadow(0 0 1.5vmin rgba(255, 240, 150, 0.7));
}
.star.pop {
  opacity: 1;
  transform: scale(1);
}
.star.hit {
  animation: hit 0.4s ease-out;
}
/* 2.png 占位符：加粗、加深虚线（多层 drop-shadow 形成描边 + 高对比） */
.star.placeholder {
  cursor: pointer;
  filter:
    drop-shadow(0.25vmin 0 0 #6b3400)
    drop-shadow(-0.25vmin 0 0 #6b3400)
    drop-shadow(0 0.25vmin 0 #6b3400)
    drop-shadow(0 -0.25vmin 0 #6b3400)
    drop-shadow(0.25vmin 0.25vmin 0 #6b3400)
    drop-shadow(-0.25vmin -0.25vmin 0 #6b3400)
    brightness(0.85)
    contrast(2)
    saturate(2.5);
}
.star.placeholder:hover {
  filter:
    drop-shadow(0.3vmin 0 0 #8a4300)
    drop-shadow(-0.3vmin 0 0 #8a4300)
    drop-shadow(0 0.3vmin 0 #8a4300)
    drop-shadow(0 -0.3vmin 0 #8a4300)
    drop-shadow(0 0 1.2vmin rgba(255, 200, 60, 0.85))
    brightness(0.95)
    contrast(2)
    saturate(3);
  transform: scale(1.06);
}
.star.clicked {
  cursor: default;
}
@keyframes hit {
  0% { transform: scale(1); }
  40% { transform: scale(1.35); filter: brightness(2) drop-shadow(0 0 3vmin #fff); }
  100% { transform: scale(1); filter: drop-shadow(0 0 1.5vmin rgba(255, 240, 150, 0.7)); }
}
.order-num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4.5vmin;
  height: 4.5vmin;
  line-height: 4.5vmin;
  text-align: center;
  background: #ffe066;
  color: #1a1a3d;
  border-radius: 50%;
  font-weight: bold;
  font-size: 2.6vmin;
  box-shadow: 0 0 1.2vmin rgba(255, 224, 100, 0.9), 0 0 0 0.3vmin rgba(26, 26, 61, 0.6);
  z-index: 2;
  pointer-events: none;
}
.feedback {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2vmin 5vmin;
  font-size: 5vmin;
  font-weight: bold;
  border-radius: 2vmin;
  pointer-events: none;
}
.feedback.correct {
  background: rgba(80, 220, 120, 0.85);
  color: #fff;
  text-shadow: 0 0 2vmin rgba(255, 255, 255, 0.6);
}
.feedback.wrong {
  background: rgba(240, 80, 80, 0.85);
  color: #fff;
  text-shadow: 0 0 2vmin rgba(255, 255, 255, 0.6);
}
.fb-enter-active, .fb-leave-active { transition: all 0.25s ease; }
.fb-enter-from, .fb-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal {
  background: rgba(20, 25, 70, 0.95);
  padding: 4vmin 6vmin;
  border-radius: 2vmin;
  border: 0.3vmin solid #ffe066;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
}
.modal p { font-size: 3vmin; color: #fff; }
.modal-btns { display: flex; gap: 2vmin; }

/* 竖屏适配 */
@media (orientation: portrait) {
  .hud {
    flex-wrap: wrap;
    padding: 2.5vmin 3vmin;
    padding-top: calc(2.5vmin + env(safe-area-inset-top));
    gap: 2vmin;
    min-height: auto;
  }
  .hud-left {
    order: 1;
    flex: 1 1 auto;
    min-width: 0;
    gap: 1.6vmin;
    flex-wrap: wrap;
  }
  .hud-right {
    order: 2;
    min-width: auto;
    gap: 1.5vmin;
  }
  .hud-center {
    order: 3;
    width: 100%;
    flex: 0 0 100%;
  }
  .hud-item {
    padding: 1vmin 1.6vmin;
    min-width: 0;
  }
  .hud-label {
    font-size: max(1.8vmin, 11px);
  }
  .hud-value {
    font-size: max(3.2vmin, 16px);
  }
  .requirement {
    padding: 1.4vmin 3vmin;
    font-size: max(2.8vmin, 15px);
  }
  .round-timer {
    width: 80vw;
    height: max(1.6vmin, 8px);
  }
  .g-btn.small {
    padding: max(1.4vmin, 8px) max(2.6vmin, 12px);
    font-size: max(2.4vmin, 13px);
    border-radius: max(1.2vmin, 8px);
  }
  .star {
    width: max(16vmin, 60px);
    height: max(16vmin, 60px);
  }
  .order-num {
    width: max(6vmin, 24px);
    height: max(6vmin, 24px);
    line-height: max(6vmin, 24px);
    font-size: max(3.4vmin, 14px);
  }
  .feedback {
    padding: 2.4vmin 6vmin;
    font-size: max(6vmin, 26px);
    border-radius: max(2.2vmin, 12px);
  }
  .modal {
    width: 90vw;
    padding: 5vmin 4vmin;
    padding-bottom: calc(5vmin + env(safe-area-inset-bottom));
    border-radius: max(2.4vmin, 14px);
    gap: 3.5vmin;
  }
  .modal p { font-size: max(3.4vmin, 16px); }
  .modal-btns { gap: 3vmin; }
}
</style>
