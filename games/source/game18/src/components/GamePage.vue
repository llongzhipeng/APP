<template>
  <div class="game-page">
    <div class="bg"></div>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-item">
        <span class="hud-label">{{ t.level }}</span>
        <span class="hud-val">{{ level }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">{{ t.score }}</span>
        <span class="hud-val">{{ score }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">{{ t.timeLeft }}</span>
        <span class="hud-val" :class="{ urgent: timeLeft <= 10 }">{{ timeLeft }}s</span>
      </div>
      <div class="back-group">
         <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
        <button class="back-btn" @click="confirmBack = true">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Game area -->
    <div class="game-area">
      <!-- Phase: memorize -->
      <div v-if="phase === 'memorize'" class="phase-box">
        <p class="phase-label">{{ t.rememberFaces }}</p>
        <div class="face-row">
          <div v-for="(img, i) in targetFaces" :key="i" class="face-card large">
            <img :src="faceImage(img)" class="face-img" />
          </div>
        </div>
        <div class="countdown-bar">
          <div class="countdown-fill" :style="{ width: memorizeProgress + '%' }"></div>
        </div>
      </div>

      <!-- Phase: answer — one option at a time -->
      <div v-if="phase === 'answer'" class="phase-box">
        <p class="phase-label">{{ t.chooseFace }}</p>
        <p class="option-counter">{{ currentOptIdx + 1 }} / {{ options.length }}</p>
        <div class="face-card large" :class="optFeedback ? (optFeedback === 'correct' ? 'card-correct' : 'card-wrong') : ''">
          <img :src="faceImage(options[currentOptIdx].img)" class="face-img" />
          <div v-if="optFeedback" class="opt-overlay">
            <span>{{ optFeedback === 'correct' ? '✓' : '✗' }}</span>
          </div>
        </div>
        <div class="yes-no-row">
          <button class="yn-btn yes" :disabled="!!optFeedback" @click="answerYesNo(true)">{{ t.yes }}</button>
          <button class="yn-btn no"  :disabled="!!optFeedback" @click="answerYesNo(false)">{{ t.no }}</button>
        </div>
      </div>
    </div>

    <!-- Confirm back dialog -->
    <div v-if="confirmBack" class="dialog-overlay">
      <div class="dialog">
        <p>{{ t.confirmBack }}</p>
        <div class="dialog-btns">
          <button class="d-btn cancel" @click="confirmBack = false">{{ t.cancel }}</button>
         <button class="d-btn confirm" @click="forceBack">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from '@vue/composition-api'
import messages from '../i18n.js'
import { faceImage } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ lang: String, duration: Number })
const emit = defineEmits(['back', 'end'])

const t = computed(() => messages[props.lang] || messages.zh)

const LEVELS = [
  { faces: 1, options: 1, coeff: 1 },
  { faces: 1, options: 2, coeff: 1.5 },
  { faces: 1, options: 3, coeff: 2 },
  { faces: 2, options: 2, coeff: 2.5 },
  { faces: 2, options: 3, coeff: 3 },
  { faces: 2, options: 4, coeff: 3.5 },
]
const ALL_FACES = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]

const level = ref(getBatchStartDifficultyForGame('mjmy'))
const score = ref(0)
const timeLeft = ref(props.duration)
const phase = ref('memorize')
const targetFaces = ref([])
const options = ref([])
const currentOptIdx = ref(0)
const optFeedback = ref('')   // 'correct' | 'wrong' | ''
const confirmBack = ref(false)
const memorizeProgress = ref(100)

const windowCorrect = ref(0)
const windowTotal = ref(0)
const windowStart = ref(0)
const totalCorrect = ref(0)
const totalWrong = ref(0)
const reactionTimes = ref([])
let questionStartTime = 0

let gameTimer = null
let memorizeTimer = null
let memorizeInterval = null
let nextTimer = null
let memorizeStart = 0
let pauseStart = 0

const levelConfig = computed(() => LEVELS[level.value - 1])
const MEMORIZE_MS = 3000

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function newQuestion() {
  optFeedback.value = ''
  currentOptIdx.value = 0
  const cfg = levelConfig.value
  const shuffled = shuffle(ALL_FACES)
  const newTargets = shuffled.slice(0, cfg.faces)
  targetFaces.value.splice(0, targetFaces.value.length, ...newTargets)

  // Always include all target faces; fill remaining slots with distractors
  // Level 1 (faces=1, options=1): 50% show target, 50% show distractor
  const targets = shuffle([...targetFaces.value])
  const distractors = shuffle(ALL_FACES.filter(f => !targetFaces.value.includes(f)))
  const optList = []
  let tIdx = 0, dIdx = 0
  for (let i = 0; i < cfg.options; i++) {
    const preferTarget = Math.random() < 0.5
    if (preferTarget && tIdx < targets.length) {
      optList.push({ img: targets[tIdx++], isTarget: true })
    } else if (dIdx < distractors.length) {
      optList.push({ img: distractors[dIdx++], isTarget: false })
    } else if (tIdx < targets.length) {
      optList.push({ img: targets[tIdx++], isTarget: true })
    }
  }
  options.value = shuffle(optList)

  phase.value = 'memorize'
  memorizeProgress.value = 100
  memorizeStart = Date.now()
  clearInterval(memorizeInterval)
  memorizeInterval = setInterval(() => {
    memorizeProgress.value = Math.max(0, 100 - ((Date.now() - memorizeStart) / MEMORIZE_MS) * 100)
  }, 50)
  clearTimeout(memorizeTimer)
  memorizeTimer = setTimeout(() => {
    clearInterval(memorizeInterval)
    phase.value = 'answer'
    questionStartTime = Date.now()
  }, MEMORIZE_MS)
}

function answerYesNo(yes) {
  if (optFeedback.value) return
  const rt = (Date.now() - questionStartTime) / 1000
  reactionTimes.value.push(rt)
  const isCorrect = yes === options.value[currentOptIdx.value].isTarget
  windowTotal.value++
  if (isCorrect) {
    windowCorrect.value++
    totalCorrect.value++
    score.value += Math.round(5 * levelConfig.value.coeff)
  } else {
    totalWrong.value++
  }
  optFeedback.value = isCorrect ? 'correct' : 'wrong'

  clearTimeout(nextTimer)
  nextTimer = setTimeout(() => {
    optFeedback.value = ''
    if (currentOptIdx.value < options.value.length - 1) {
      currentOptIdx.value++
      questionStartTime = Date.now()
    } else {
      newQuestion()
    }
  }, 800)
}

function checkDifficultyAdjust() {
  if (windowTotal.value === 0) return
  const rate = windowCorrect.value / windowTotal.value
  if (rate >= 0.9 && level.value < 6) level.value++
  else if (rate <= 0.7 && level.value > 1) level.value--
  windowCorrect.value = 0
  windowTotal.value = 0
}

onMounted(() => {
  windowStart.value = Date.now()
  newQuestion()
  gameTimer = setInterval(() => {
    if (confirmBack.value) return
    timeLeft.value--
    const elapsed = Math.floor((Date.now() - windowStart.value) / 1000)
    if (elapsed > 0 && elapsed % 60 === 0) {
      checkDifficultyAdjust()
      windowStart.value = Date.now()
    }
    if (timeLeft.value <= 0) endGame()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(gameTimer)
  clearTimeout(memorizeTimer)
  clearInterval(memorizeInterval)
  clearTimeout(nextTimer)
})

watch(confirmBack, (isOpen) => {
  if (isOpen && phase.value === 'memorize') {
    clearInterval(memorizeInterval)
    clearTimeout(memorizeTimer)
    pauseStart = Date.now()
  } else if (!isOpen && pauseStart && phase.value === 'memorize') {
    const pauseDuration = Date.now() - pauseStart
    memorizeStart += pauseDuration
    pauseStart = 0
    const remaining = Math.max(0, MEMORIZE_MS - (Date.now() - memorizeStart))
    if (remaining > 0) {
      memorizeInterval = setInterval(() => {
        memorizeProgress.value = Math.max(0, 100 - ((Date.now() - memorizeStart) / MEMORIZE_MS) * 100)
      }, 50)
      memorizeTimer = setTimeout(() => {
        clearInterval(memorizeInterval)
        phase.value = 'answer'
        questionStartTime = Date.now()
      }, remaining)
    } else {
      phase.value = 'answer'
      questionStartTime = Date.now()
    }
  }
})

const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

function forceBack() {
  clearInterval(gameTimer)
  clearTimeout(memorizeTimer)
  clearInterval(memorizeInterval)
  clearTimeout(nextTimer)
  confirmBack.value = false
  leavePbGameWindow({ confirm: false })
}

function endGame() {
  clearInterval(gameTimer)
  clearTimeout(memorizeTimer)
  clearInterval(memorizeInterval)
  clearTimeout(nextTimer)
  const total = totalCorrect.value + totalWrong.value
  const avgRT = reactionTimes.value.length
    ? (reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length).toFixed(2)
    : 0
  emit('end', {
    score: score.value, level: level.value, total,
    correct: totalCorrect.value, wrong: totalWrong.value,
    rate: total ? Math.round((totalCorrect.value / total) * 100) : 0,
    avgRT, duration: props.duration,
  })
}
</script>

<style scoped>
.game-page { width: 100vw; height: 100vh; overflow: hidden; display: flex; flex-direction: column; position: relative; }
.bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 20%, #1a2a4a 0%, #060e1a 70%); z-index: 0; }
.hud {
  position: relative; z-index: 10; display: flex; align-items: center; gap: 3vmin;
  padding: 2vmin 3vmin; background: rgba(10,20,50,0.7); backdrop-filter: blur(4px);
  border-bottom: 0.15vmin solid rgba(100,150,255,0.2);
}
.hud-item { display: flex; flex-direction: column; align-items: center; min-width: 8vmin; }
.hud-label { font-size: 1.5vmin; color: rgba(200,220,255,0.6); }
.hud-val { font-size: 2.8vmin; font-weight: 800; color: #e8f0ff; }
.hud-val.urgent { color: #ff6b6b; animation: blink 0.5s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.back-group { display: flex; align-items: center; gap: 10px;   margin-left: auto;  }
.back-btn {
  margin-left: auto; padding: 1vmin 2.5vmin; font-size: 1.8vmin; font-weight: 700;
  border-radius: 1vmin; cursor: pointer; background: rgba(255,255,255,0.1);
  border: 0.2vmin solid rgba(255,255,255,0.2); color: #e8f0ff; transition: all 0.2s;
}
.back-btn:hover { background: rgba(255,255,255,0.2); }
.game-area { position: relative; z-index: 5; flex: 1; display: flex; align-items: center; justify-content: center; }
.phase-box { display: flex; flex-direction: column; align-items: center; gap: 3vmin; padding: 2vmin; }
.phase-label { font-size: 3vmin; font-weight: 700; color: #e8f0ff; text-align: center; }
.option-counter { font-size: 2vmin; color: rgba(200,220,255,0.6); }
.face-row { display: flex; gap: 4vmin; justify-content: center; }
.face-card {
  border-radius: 2vmin; border: 0.4vmin solid rgba(100,150,255,0.5);
  background: rgba(20,40,80,0.6); overflow: hidden;
  box-shadow: 0 0.5vmin 3vmin rgba(0,0,0,0.5); position: relative;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.face-card.large { width: 28vmin; height: 28vmin; }
.face-card.card-correct { border-color: #4caf50; box-shadow: 0 0 2vmin rgba(76,175,80,0.6); }
.face-card.card-wrong  { border-color: #f44336; box-shadow: 0 0 2vmin rgba(244,67,54,0.6); }
.face-img { width: 100%; height: 100%; object-fit: cover; }
.opt-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.35); font-size: 10vmin; font-weight: 900;
  animation: feedPop 0.25s ease-out;
}
.card-correct .opt-overlay { color: #4caf50; }
.card-wrong  .opt-overlay { color: #f44336; }
@keyframes feedPop { 0%{transform:scale(0.4);opacity:0} 100%{transform:scale(1);opacity:1} }
.countdown-bar { width: 50vmin; height: 1vmin; background: rgba(255,255,255,0.15); border-radius: 1vmin; overflow: hidden; }
.countdown-fill { height: 100%; background: linear-gradient(90deg, #4a7acc, #7aacff); transition: width 0.1s linear; border-radius: 1vmin; }
.yes-no-row { display: flex; gap: 5vmin; }
.yn-btn {
  padding: 2.5vmin 8vmin; font-size: 3vmin; font-weight: 800;
  border-radius: 1.5vmin; cursor: pointer; border: none; color: #fff; transition: all 0.2s;
  box-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.3);
}
.yn-btn.yes { background: linear-gradient(135deg, #1a5c2a, #2e9c4a); }
.yn-btn.no  { background: linear-gradient(135deg, #5c1a1a, #9c2e2e); }
.yn-btn:hover:not(:disabled) { transform: scale(1.06); }
.yn-btn:disabled { opacity: 0.45; cursor: default; }
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; }
.dialog {
  background: linear-gradient(160deg, #0e1a30, #060e1a);
  border: 0.2vmin solid rgba(100,150,255,0.3); border-radius: 1.5vmin;
  padding: 3vmin 4vmin; display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  color: #e8f0ff; font-size: 2.2vmin; font-weight: 600;
}
.dialog-btns { display: flex; gap: 2vmin; }
.d-btn { padding: 1.2vmin 3vmin; font-size: 2vmin; font-weight: 700; border-radius: 1vmin; cursor: pointer; border: 0.2vmin solid rgba(255,255,255,0.2); transition: all 0.2s; }
.d-btn.cancel  { background: rgba(255,255,255,0.1); color: #e8f0ff; }
.d-btn.cancel:hover { background: rgba(255,255,255,0.2); }
.d-btn.confirm { background: linear-gradient(135deg, #2a4a8a, #4a7acc); color: #e8f0ff; border-color: rgba(100,150,255,0.4); }
.d-btn.confirm:hover { background: linear-gradient(135deg, #3a5a9a, #5a8adc); }
</style>
