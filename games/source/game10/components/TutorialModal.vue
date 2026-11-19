<template>
  <div class="modal-backdrop">
    <div class="tut-card card">
      <!-- Header -->
      <div class="tut-header">
        <span class="tut-title">{{ t('tutorialTitle') }}</span>
        <button class="btn btn-secondary skip-btn" @click="$emit('skip')">{{ t('tutorialSkip') }}</button>
      </div>

      <!-- Step content -->
      <div class="tut-body">
        <!-- Step 1: watch the maze appear -->
        <div v-if="step === 0" class="tut-step">
          <p class="step-label">{{ lang === 'zh' ? '① 迷宫出现' : '① Maze appears' }}</p>
          <div class="demo-maze">
            <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="demo-svg">
              <!-- Grid of images -->
              <g v-for="r in demoMaze.gridSize" :key="`row${r}`">
                <g v-for="c in demoMaze.gridSize" :key="`cell${r}-${c}`">
                  <image
                    :x="(c-1)*CS" :y="(r-1)*CS"
                    :width="CS + 5" :height="CS + 5"
                    :href="getTutCellImage(r-1, c-1)"
                    preserveAspectRatio="none"
                  />
                </g>
              </g>
              <!-- Start -->
              <image
                :x="demoMaze.path[0].c*CS"
                :y="demoMaze.path[0].r*CS"
                :width="CS" :height="CS"
                :href="originImage"
              />
              <!-- End -->
              <image
                :x="demoMaze.path[demoMaze.path.length-1].c*CS"
                :y="demoMaze.path[demoMaze.path.length-1].r*CS"
                :width="CS" :height="CS"
                :href="terminusImage"
              />
            </svg>
          </div>
          <p class="step-desc">{{ lang === 'zh' ? '迷宫由多条走廊组成，有起点 S 和终点 E。' : 'The maze has corridors, a start S and end E.' }}</p>
        </div>

        <!-- Step 2: robot animates path -->
        <div v-if="step === 1" class="tut-step">
          <p class="step-label">{{ lang === 'zh' ? '② 机器人演示路径' : '② Robot shows the path' }}</p>
          <div class="demo-maze">
            <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="demo-svg">
              <!-- Grid of images -->
              <g v-for="r in demoMaze.gridSize" :key="`row${r}`">
                <g v-for="c in demoMaze.gridSize" :key="`cell${r}-${c}`">
                  <image
                    :x="(c-1)*CS" :y="(r-1)*CS"
                    :width="CS + 5" :height="CS + 5"
                    :href="getTutCellImage(r-1, c-1)"
                    preserveAspectRatio="none"
                  />
                </g>
              </g>
              <!-- Robot image -->
              <image
                v-if="robotStep < demoMaze.path.length"
                :x="demoMaze.path[Math.min(robotStep,demoMaze.path.length-1)].c*CS"
                :y="demoMaze.path[Math.min(robotStep,demoMaze.path.length-1)].r*CS"
                :width="CS"
                :height="CS"
                :href="robotImage"
              />
            </svg>
          </div>
          <p class="step-desc">{{ lang === 'zh' ? '红点代表机器人，它会沿正确路径移动。' : 'The red dot is the robot tracing the correct path.' }}</p>
        </div>

        <!-- Step 3: player traces path -->
        <div v-if="step === 2" class="tut-step">
          <p class="step-label">{{ lang === 'zh' ? '③ 你来复现路径' : '③ You trace the path' }}</p>
          <div class="demo-maze">
            <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="demo-svg" @click.self="() => {}">
              <!-- Grid of images -->
              <g v-for="r in demoMaze.gridSize" :key="`row${r}`">
                <g v-for="c in demoMaze.gridSize" :key="`cell${r}-${c}`">
                  <image
                    :x="(c-1)*CS" :y="(r-1)*CS"
                    :width="CS + 5" :height="CS + 5"
                    :href="getTutCellImage(r-1, c-1)"
                    preserveAspectRatio="none"
                  />
                </g>
              </g>
              <!-- Player clicks -->
              <g v-for="(cell, idx) in demoMaze.path" :key="`p${idx}`">
                <rect
                  v-if="idx <= playerStep"
                  :x="cell.c*CS" :y="cell.r*CS"
                  :width="CS" :height="CS"
                  fill="#1976D2" rx="4"
                  style="cursor:pointer"
                  @click="advancePlayer"
                />
              </g>
              <!-- Next click hint -->
              <rect
                v-if="playerStep < demoMaze.path.length - 1"
                :x="demoMaze.path[playerStep+1].c*CS"
                :y="demoMaze.path[playerStep+1].r*CS"
                :width="CS" :height="CS"
                fill="#f5f5f5" rx="4"
                style="cursor:pointer; opacity:0.8"
                @click="advancePlayer"
              />
              <!-- Pulsing hint ring -->
              <circle
                v-if="playerStep < demoMaze.path.length - 1"
                :cx="demoMaze.path[playerStep+1].c*CS+CS/2"
                :cy="demoMaze.path[playerStep+1].r*CS+CS/2"
                r="12" fill="none" stroke="#FFF176" stroke-width="3"
                class="pulse-ring"
                style="pointer-events:none"
              />
              <!-- Start label -->
              <text
                :x="demoMaze.path[0].c*CS+CS/2"
                :y="demoMaze.path[0].r*CS+CS/2+5"
                text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">S</text>
            </svg>
          </div>
          <p class="step-desc">{{ lang === 'zh' ? '路径消失后，点击格子来重现路径（蓝色高亮引导）。' : 'After path fades, click cells to retrace it (blue = your path).' }}</p>
        </div>

        <!-- Step 4: scoring -->
        <div v-if="step === 3" class="tut-step">
          <p class="step-label">{{ lang === 'zh' ? '④ 得分与难度' : '④ Score & Difficulty' }}</p>
          <div class="score-demo">
            <div class="score-row"><span>{{ lang === 'zh' ? '答对得分' : 'Points per correct' }}</span><span class="score-val">{{ lang === 'zh' ? '5 × 难度系数' : '5 × coefficient' }}</span></div>
            <div class="score-row"><span>{{ lang === 'zh' ? '每30秒自动调整难度' : 'Auto adjust difficulty every 30s' }}</span></div>
            <div class="score-row up"><span>≥ 90%</span><span>→ {{ lang === 'zh' ? '难度升级' : 'Harder' }} ⬆</span></div>
            <div class="score-row dn"><span>≤ 70%</span><span>→ {{ lang === 'zh' ? '难度降低' : 'Easier' }} ⬇</span></div>
          </div>
          <p class="step-desc">{{ lang === 'zh' ? '尽力记忆路径，积累高分！' : 'Memorize the path and aim for a high score!' }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="tut-nav">
        <button class="btn btn-secondary" :disabled="step === 0" @click="step--">{{ t('tutorialPrev') }}</button>
        <div class="step-dots">
          <span v-for="i in 4" :key="i" class="dot" :class="{active: step === i-1}" @click="step = i-1"/>
        </div>
        <button v-if="step < 3" class="btn btn-primary" @click="step++">{{ t('tutorialNext') }}</button>
        <button v-else class="btn btn-success" @click="$emit('done')">{{ lang === 'zh' ? '开始' : 'Start' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game10TutorialModal'
};
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from '@vue/composition-api'
import { useI18n } from '../i18n.js'
import { generateMaze } from '../mazeGenerator.js'
import originImage from '../public/image/interaction/origin.jpg'
import terminusImage from '../public/image/interaction/terminus.jpg'
import floorTileImage from '../public/image/ground/floor_tile.jpg'
import wallImage from '../public/image/wall/Horizontal_wall.jpg'
import robotImage from '../public/1.jpg'

const props = defineProps({ lang: String })
defineEmits(['done', 'skip'])
const t = useI18n(() => props.lang)

const step       = ref(0)
const robotStep  = ref(0)
const playerStep = ref(0)

// Demo maze (difficulty 2, trial 0)
const demoMaze = generateMaze(2, 0)

const CS = 32
const svgW = computed(() => demoMaze.gridSize * CS + 5)
const svgH = computed(() => demoMaze.gridSize * CS + 5)

function getTutCellImage(r, c) {
  const key = `${r},${c}`
  const isPath = demoMaze.pathSet.has(key)
  return isPath ? floorTileImage : wallImage
}

let robotTimer = null

function startRobotAnim() {
  robotStep.value = 0
  clearInterval(robotTimer)
  robotTimer = setInterval(() => {
    if (robotStep.value < demoMaze.path.length - 1) {
      robotStep.value++
    } else {
      clearInterval(robotTimer)
      setTimeout(() => { robotStep.value = 0; startRobotAnim() }, 1200)
    }
  }, 400)
}

function advancePlayer() {
  if (playerStep.value < demoMaze.path.length - 1) playerStep.value++
  else playerStep.value = 0
}

watch(step, (s) => {
  if (s === 1) startRobotAnim()
  else { clearInterval(robotTimer); robotStep.value = 0 }
  if (s === 2) playerStep.value = 0
})

onMounted(() => {})
onUnmounted(() => clearInterval(robotTimer))
</script>

<style scoped>
.tut-card {
  width: min(90vw, 520px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2vh, 20px);
  overflow: hidden;
}

.tut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tut-title {
  font-size: clamp(16px, 2.8vmin, 24px);
  font-weight: 700;
  color: #4A90E2;
}
.skip-btn { font-size: clamp(12px, 1.8vmin, 16px); padding: 6px 14px; }

.tut-body { flex: 1; overflow: hidden; }

.tut-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(8px, 1.5vh, 16px);
}

.step-label {
  font-size: clamp(14px, 2.2vmin, 20px);
  font-weight: 600;
  color: #FFB74D;
  align-self: flex-start;
}
.step-desc {
  font-size: clamp(12px, 1.8vmin, 16px);
  color: #666;
  text-align: center;
  max-width: 380px;
}

.demo-maze {
  width: 100%;
  display: flex;
  justify-content: center;
}
.demo-svg {
  width: min(260px, 50vmin);
  height: min(260px, 50vmin);
  border-radius: 8px;
}

@keyframes pulse {
  0%   { opacity: 1;   r: 12; }
  50%  { opacity: .4;  r: 16; }
  100% { opacity: 1;   r: 12; }
}
.pulse-ring { animation: pulse 0.9s ease-in-out infinite; }

.score-demo {
  background: #f8f9fa;
  border-radius: 10px;
  padding: clamp(10px,2vh,18px) clamp(14px,3vw,24px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 320px;
  font-size: clamp(13px, 2vmin, 17px);
  border: 1px solid #e0e0e0;
}
.score-row { display: flex; justify-content: space-between; align-items: center; color: #333; }
.score-val { font-weight: 700; color: #FFB74D; }
.score-row.up span:last-child { color: #81C784; }
.score-row.dn span:last-child { color: #EF9A9A; }

.tut-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.tut-nav .btn { min-width: 70px; }
.step-dots { display: flex; gap: 8px; }
.dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: background .2s;
}
.dot.active { background: #1976D2; }
</style>
