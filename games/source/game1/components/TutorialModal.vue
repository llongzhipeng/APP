<template>
  <div class="modal-mask" v-if="visible">
    <div class="modal-content tutorial-modal">
      <h2 class="tutorial-title">{{ t('tutorial.title') }}</h2>

      <!-- 动画演示区域 -->
      <div class="demo-container">
        <!-- 演示用的迷你矩阵 (3x3) -->
        <div class="demo-matrix" :class="{ 'demo-observing': isObserving }">
          <div
            v-for="(cell, index) in demoMatrix"
            :key="index"
            class="demo-cell"
            :class="{
              'demo-lit': cell.isLit,
              'demo-clicked': cell.isClicked,
              'demo-correct': cell.isCorrect,
              'demo-wrong': cell.isWrong
            }"
            @click="handleDemoClick(index)"
          >
          </div>
        </div>

        <!-- 提示文字 -->
        <div class="demo-instruction">
          <div v-if="demoPhase === 'intro'" class="instruction-text">
            {{ t('tutorial.demo.intro') }}
          </div>
          <div v-else-if="demoPhase === 'showing'" class="instruction-text pulse">
            {{ t('tutorial.demo.showing') }}
          </div>
          <div v-else-if="demoPhase === 'ready'" class="instruction-text highlight">
            {{ t('tutorial.demo.ready') }}
          </div>
          <div v-else-if="demoPhase === 'success'" class="instruction-text success">
            {{ t('tutorial.demo.success') }}
          </div>
          <div v-else-if="demoPhase === 'fail'" class="instruction-text error">
            {{ t('tutorial.demo.fail') }}
          </div>
        </div>

        <!-- 演示控制按钮 -->
        <div class="demo-controls" v-if="demoPhase === 'intro'">
          <button class="btn btn-secondary" @click="startDemo">
            {{ t('tutorial.demo.start') }}
          </button>
        </div>
      </div>

      <!-- 说明列表 - 紧凑版 -->
      <div class="tutorial-explanation">
        <div class="explanation-item">
          <span class="step-number">1</span>
          <span class="step-text">{{ t('tutorial.explain.step1.title') }}</span>
        </div>
        <div class="explanation-item">
          <span class="step-number">2</span>
          <span class="step-text">{{ t('tutorial.explain.step2.title') }}</span>
        </div>
        <div class="explanation-item">
          <span class="step-number">3</span>
          <span class="step-text">{{ t('tutorial.explain.step3.title') }}</span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="tutorial-footer">
        <button class="btn btn-primary btn-large" @click="startGame">
          {{ t('tutorial.startGame') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game1TutorialModal'
};
</script>

<script setup>
import { ref, inject, watch } from '@vue/composition-api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const t = inject('t')

// 演示矩阵状态 (3x3 = 9个方块)
const demoMatrix = ref(Array.from({ length: 9 }, () => ({
  isLit: false,
  isClicked: false,
  isCorrect: false,
  isWrong: false
})))

const demoPhase = ref('intro') // intro, showing, ready, success, fail
const isObserving = ref(false)
const demoSequence = ref([]) // 演示序列
const userSequence = ref([]) // 用户点击序列

// 重置演示状态
const resetDemo = () => {
  demoMatrix.value.forEach(cell => {
    cell.isLit = false
    cell.isClicked = false
    cell.isCorrect = false
    cell.isWrong = false
  })
  userSequence.value = []
  demoPhase.value = 'intro'
  isObserving.value = false
}

// 开始演示
const startDemo = async () => {
  resetDemo()

  // 生成随机序列 (3个方块)
  const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  demoSequence.value = []
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * indices.length)
    demoSequence.value.push(indices[randomIndex])
    indices.splice(randomIndex, 1)
  }

  demoPhase.value = 'showing'
  isObserving.value = true

  // 依次点亮方块
  for (let i = 0; i < demoSequence.value.length; i++) {
    const index = demoSequence.value[i]

    // 点亮
    demoMatrix.value[index].isLit = true
    await sleep(1000) // 亮1秒

    // 熄灭
    demoMatrix.value[index].isLit = false
    await sleep(300) // 间隔0.3秒
  }

  // 进入答题阶段
  demoPhase.value = 'ready'
  isObserving.value = false
}

// 处理用户点击
const handleDemoClick = async (index) => {
  if (demoPhase.value !== 'ready') return
  if (demoMatrix.value[index].isClicked) return // 防止重复点击

  userSequence.value.push(index)
  demoMatrix.value[index].isClicked = true

  // 检查当前点击是否正确
  const currentIndex = userSequence.value.length - 1
  if (demoSequence.value[currentIndex] !== index) {
    // 点击错误
    demoMatrix.value[index].isWrong = true
    demoPhase.value = 'fail'

    await sleep(1500)
    // 重新开始演示
    startDemo()
    return
  }

  // 检查是否全部完成
  if (userSequence.value.length === demoSequence.value.length) {
    // 全部正确
    demoPhase.value = 'success'
    demoSequence.value.forEach(idx => {
      demoMatrix.value[idx].isCorrect = true
    })

    await sleep(1500)
    // 重新开始演示
    startDemo()
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const startGame = () => {
  resetDemo()
  emit('close')
}

// 监听 visible 变化，重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetDemo()
  }
})
</script>

<style scoped>
.tutorial-modal {
  max-width: 500px;
  max-height: 85vh;
  padding: 20px;
  position: relative;
  overflow-y: auto;
}

.tutorial-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-container {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.demo-matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 200px;
  margin: 0 auto 15px;
}

.demo-matrix.demo-observing .demo-cell {
  cursor: not-allowed;
  opacity: 0.8;
}

.demo-cell {
  aspect-ratio: 1;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-cell:hover:not(.demo-observing .demo-cell) {
  transform: scale(1.05);
  border-color: #667eea;
}

.demo-cell.demo-lit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
  transform: scale(1.1);
  animation: pulse-glow 0.5s ease-in-out;
}

.demo-cell.demo-clicked {
  background: #9e9e9e;
  border-color: #757575;
}

.demo-cell.demo-correct {
  background: #4caf50;
  border-color: #4caf50;
  animation: success-pop 0.5s ease-out;
}

.demo-cell.demo-wrong {
  background: #f44336;
  border-color: #f44336;
  animation: shake 0.5s ease-out;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
  }
}

@keyframes success-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.demo-instruction {
  text-align: center;
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.instruction-text {
  font-size: 15px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.instruction-text.pulse {
  color: #667eea;
  animation: pulse-text 1.5s ease-in-out infinite;
}

.instruction-text.highlight {
  color: #ff9800;
  background: #fff3e0;
  font-weight: bold;
}

.instruction-text.success {
  color: #4caf50;
  background: #e8f5e9;
  font-weight: bold;
}

.instruction-text.error {
  color: #f44336;
  background: #ffebee;
  font-weight: bold;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.demo-controls {
  text-align: center;
  margin-top: 8px;
}

.demo-controls .btn {
  padding: 8px 24px;
  font-size: 15px;
}

.tutorial-explanation {
  margin-bottom: 15px;
}

.explanation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.explanation-item:hover {
  background: #e9ecef;
  transform: translateX(3px);
}

.step-number {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.step-text {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.tutorial-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.btn-large {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: bold;
  min-width: 180px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tutorial-modal {
    padding: 15px;
    max-height: 90vh;
  }

  .tutorial-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .demo-container {
    padding: 15px;
    margin-bottom: 12px;
  }

  .demo-matrix {
    max-width: 180px;
    gap: 6px;
    margin-bottom: 12px;
  }

  .instruction-text {
    font-size: 14px;
    padding: 6px 12px;
  }

  .demo-instruction {
    min-height: 40px;
  }

  .step-number {
    width: 26px;
    height: 26px;
    min-width: 26px;
    font-size: 13px;
  }

  .step-text {
    font-size: 13px;
  }

  .explanation-item {
    padding: 6px 10px;
    margin-bottom: 8px;
  }

  .btn-large {
    padding: 10px 24px;
    font-size: 15px;
    min-width: 150px;
  }
}
</style>
