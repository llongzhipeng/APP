<template>
  <div class="tutorial">
    <div class="panel">
      <h2 class="ttl">{{ t('tutorialTitle') }}</h2>

      <div class="stage" :key="step">
        <div
          v-for="(pos, i) in currentStars"
          :key="i"
          class="star-wrap"
          :style="{ left: pos.x + '%', top: pos.y + '%' }"
        >
          <img
            v-if="isStarVisible(i)"
            :src="starSrc(i)"
            class="star"
            :class="{
              pop: isStarVisible(i),
              hit: hitIdx === i,
              placeholder: stage === 'input' && !clickedIdx.includes(i)
            }"
          />
          <!-- 顺序数字：仅在“出现阶段”提示 -->
          <div v-if="stage === 'showing' && appearedIdx.includes(i)" class="order-num">{{ i + 1 }}</div>
        </div>

        <!-- 手型光标动画 -->
        <div
          v-if="cursor.show"
          class="cursor"
          :style="{ left: cursor.x + '%', top: cursor.y + '%' }"
        >👆</div>

        <!-- 步骤指示 -->
        <div class="step-tag">{{ t('tutorialStep', { n: step + 1, total: totalSteps }) }}</div>
      </div>

      <div class="foot">
        <button class="g-btn ghost" @click="$emit('skip')">{{ t('skip') }}</button>
        <button class="g-btn secondary" :disabled="step === 0" @click="prev">{{ t('prev') }}</button>
        <button class="g-btn" @click="next">{{ step === totalSteps - 1 ? t('startGame') : t('next') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { resolveImage } from '../assets'
import { ref, onMounted, onBeforeUnmount, watch } from '@vue/composition-api'
import { useI18n } from '../i18n.js'

const emit = defineEmits(['finish', 'skip'])
const { t } = useI18n()

const totalSteps = 3
const step = ref(0)

const sequences = [
  [ { x: 30, y: 32 }, { x: 68, y: 55 } ],
  [ { x: 30, y: 32 }, { x: 68, y: 55 } ],
  [ { x: 22, y: 32 }, { x: 55, y: 25 }, { x: 78, y: 60 } ]
]

const currentStars = ref(sequences[0])
const stage = ref('showing')  // 'showing' | 'input' | 'done'
const appearedIdx = ref([])
const clickedIdx = ref([])
const hitIdx = ref(-1)
const cursor = ref({ show: false, x: 0, y: 0 })

let timers = []
function clearTimers() {
  timers.forEach(clearTimeout)
  timers = []
}
function wait(ms) {
  return new Promise(r => timers.push(setTimeout(r, ms)))
}

function isStarVisible(i) {
  if (stage.value === 'showing') return appearedIdx.value.includes(i)
  return true // input / done 期间都显示（占位符或已点亮）
}
function starSrc(i) {
  if (stage.value === 'input' && !clickedIdx.value.includes(i)) return resolveImage('/images/2.png')
  return resolveImage('/images/1.png')
}

async function runStep() {
  clearTimers()
  const stars = sequences[step.value]
  currentStars.value = stars
  appearedIdx.value = []
  clickedIdx.value = []
  hitIdx.value = -1
  cursor.value = { show: false, x: 0, y: 0 }
  stage.value = 'showing'

  // 阶段 1：星星依次出现（1.png + 序号）
  for (let i = 0; i < stars.length; i++) {
    await wait(700)
    appearedIdx.value = [...appearedIdx.value, i]
  }
  await wait(900)

  // 阶段 2：星星消失 → 2.png 占位符
  stage.value = 'input'
  await wait(700)

  // 阶段 3：手型光标依次点击占位符，2.png 变回 1.png
  for (let i = 0; i < stars.length; i++) {
    const p = stars[i]
    cursor.value = { show: true, x: p.x + 4, y: p.y + 8 }
    await wait(650)
    clickedIdx.value = [...clickedIdx.value, i]
    hitIdx.value = i
    await wait(400)
    hitIdx.value = -1
    await wait(150)
  }

  cursor.value.show = false
  stage.value = 'done'

  // 循环播放
  await wait(1700)
  runStep()
}

function prev() { if (step.value > 0) step.value -= 1 }
function next() {
  if (step.value === totalSteps - 1) emit('finish')
  else step.value += 1
}

watch(step, () => runStep())
onMounted(() => runStep())
onBeforeUnmount(() => clearTimers())
</script>

<style scoped>
.tutorial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
}
.panel {
  width: min(90vw, 140vmin);
  height: min(88vh, 90vmin);
  background: rgba(15, 20, 60, 0.85);
  border: 0.3vmin solid rgba(255, 224, 100, 0.5);
  border-radius: 2vmin;
  padding: 3vmin;
  display: flex;
  flex-direction: column;
  gap: 2vmin;
  box-shadow: 0 1vmin 4vmin rgba(0, 0, 0, 0.5);
}
.ttl {
  font-size: 3.6vmin;
  color: #ffe066;
  text-align: center;
}
.stage {
  flex: 1;
  position: relative;
  border-radius: 1.5vmin;
  background:
    radial-gradient(2px 2px at 20% 30%, #fff, transparent),
    radial-gradient(2px 2px at 70% 15%, #fff, transparent),
    radial-gradient(2px 2px at 40% 70%, #fff, transparent),
    radial-gradient(2px 2px at 85% 55%, #fff, transparent),
    radial-gradient(2px 2px at 15% 85%, #fff, transparent),
    linear-gradient(180deg, #0a0e2c 0%, #1a1f4a 100%);
  overflow: hidden;
}
.star-wrap {
  position: absolute;
  transform: translate(-50%, -50%);
}
.star {
  width: 12vmin;
  height: 12vmin;
  opacity: 0;
  transform: scale(0.4);
  transition: opacity 0.4s, transform 0.4s;
  filter: drop-shadow(0 0 1.5vmin rgba(255, 240, 150, 0.7));
}
.star.pop {
  opacity: 1;
  transform: scale(1);
}
.star.hit {
  animation: hit 0.4s ease-out;
}
.star.placeholder {
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
.cursor {
  position: absolute;
  font-size: 6vmin;
  transform: translate(-30%, -20%);
  pointer-events: none;
  transition: all 0.5s ease-out;
  filter: drop-shadow(0 0.4vmin 0.8vmin rgba(0, 0, 0, 0.6));
}
.step-tag {
  position: absolute;
  top: 1.5vmin;
  right: 1.5vmin;
  padding: 0.6vmin 1.4vmin;
  background: rgba(255, 224, 100, 0.2);
  border: 0.2vmin solid #ffe066;
  border-radius: 1vmin;
  color: #ffe066;
  font-size: 2vmin;
}
.foot {
  display: flex;
  gap: 2vmin;
  justify-content: center;
}

/* 竖屏适配 */
@media (orientation: portrait) {
  .tutorial {
    padding: 3vmin;
    padding-top: calc(4vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
  }
  .panel {
    width: 94vw;
    height: min(85vh, 160vmin);
    padding: 4vmin 3vmin;
    border-radius: max(2.4vmin, 14px);
    gap: 2.5vmin;
  }
  .ttl { font-size: max(5.2vmin, 20px); }
  .star { width: max(16vmin, 60px); height: max(16vmin, 60px); }
  .order-num {
    width: max(6vmin, 24px);
    height: max(6vmin, 24px);
    line-height: max(6vmin, 24px);
    font-size: max(3.4vmin, 14px);
  }
  .cursor { font-size: max(9vmin, 34px); }
  .step-tag {
    top: 2vmin;
    right: 2vmin;
    padding: 1vmin 2vmin;
    font-size: max(2.8vmin, 12px);
    border-radius: max(1.4vmin, 8px);
  }
  .foot {
    flex-direction: column;
    gap: 2.5vmin;
    align-items: stretch;
  }
  .foot .g-btn {
    width: 100%;
    font-size: max(3.6vmin, 16px);
    padding: max(2.6vmin, 12px) max(4vmin, 18px);
    border-radius: max(2vmin, 12px);
  }
}
</style>
