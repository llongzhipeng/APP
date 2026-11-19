<template>
  <div v-if="show" class="tutorial-overlay" @click.self="handleClose">
    <div class="tutorial-modal">
      <div class="tutorial-header">
        <h2>{{ t('tutorialTitle') }}</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="tutorial-content">
        <div class="tutorial-step" :class="{ active: currentStep === 1 }">
          <div class="step-left">
            <div class="step-number">1</div>
            <div class="step-demo">
              <div class="demo-container memorize-demo">
                <div class="demo-elements">
                  <div v-for="(imgId, index) in demoImages.step1" :key="imgId" class="demo-element" :style="{ animationDelay: (index * 0.1) + 's' }">
                    <img :src="getImagePath(imgId)" :alt="`Element ${imgId}`" class="element-img" />
                  </div>
                </div>
                <div class="demo-timer">{{ t('memorizeTime') }}: 5s</div>
              </div>
            </div>
            <div class="step-text">
              <h3>{{ t('tutorialStep1Title') }}</h3>
              <p>{{ t('tutorialStep1Desc') }}</p>
            </div>
          </div>
          <div class="step-right">
            <div class="tutorial-nav-buttons">
              <button v-if="currentStep > 1" class="btn-nav btn-prev" @click="prevStep">
                {{ t('previous') }}
              </button>
              <button v-if="currentStep < 3" class="btn-nav btn-next" @click="nextStep">
                {{ t('next') }}
              </button>
              <button v-else class="btn-nav btn-start" @click="handleStart">
                {{ t('startTraining') }}
              </button>
            </div>
          </div>
        </div>

        <div class="tutorial-step" :class="{ active: currentStep === 2 }">
          <div class="step-left">
            <div class="step-number">2</div>
            <div class="step-demo">
              <div class="demo-container answer-demo">
                <div class="demo-elements">
                  <div v-for="(imgId, index) in demoImages.step2.display" :key="index" class="demo-element" :class="{ removed: imgId === null }">
                    <img v-if="imgId !== null" :src="getImagePath(imgId)" :alt="`Element ${imgId}`" class="element-img" />
                    <div v-else class="element-removed">?</div>
                  </div>
                </div>
                <div class="demo-options">
                  <div v-for="(imgId, index) in demoImages.step2.options" :key="imgId" class="demo-option" :class="{ correct: index === 0 }">
                    <img :src="getImagePath(imgId)" :alt="`Option ${imgId}`" class="option-img" />
                  </div>
                </div>
              </div>
            </div>
            <div class="step-text">
              <h3>{{ t('tutorialStep2Title') }}</h3>
              <p>{{ t('tutorialStep2Desc') }}</p>
            </div>
          </div>
          <div class="step-right">
            <div class="tutorial-nav-buttons">
              <button v-if="currentStep > 1" class="btn-nav btn-prev" @click="prevStep">
                {{ t('previous') }}
              </button>
              <button v-if="currentStep < 3" class="btn-nav btn-next" @click="nextStep">
                {{ t('next') }}
              </button>
              <button v-else class="btn-nav btn-start" @click="handleStart">
                {{ t('startTraining') }}
              </button>
            </div>
          </div>
        </div>

        <div class="tutorial-step" :class="{ active: currentStep === 3 }">
          <div class="step-left">
            <div class="step-number">3</div>
            <div class="step-demo">
              <div class="demo-container multi-select-demo">
                <div class="demo-elements">
                  <div v-for="(imgId, index) in demoImages.step3.display" :key="index" class="demo-element small" :class="{ removed: imgId === null }">
                    <img v-if="imgId !== null" :src="getImagePath(imgId)" :alt="`Element ${imgId}`" class="element-img" />
                    <div v-else class="element-removed">?</div>
                  </div>
                </div>
                <div class="demo-options">
                  <div v-for="(imgId, index) in demoImages.step3.options" :key="imgId" class="demo-option" :class="{ selected: index === 0 || index === 2 }">
                    <img :src="getImagePath(imgId)" :alt="`Option ${imgId}`" class="option-img" />
                    <div v-if="index === 0 || index === 2" class="check-mark">✓</div>
                  </div>
                </div>
                <div class="demo-counter">{{ t('selectCount') }}: 2/2</div>
              </div>
            </div>
            <div class="step-text">
              <h3>{{ t('tutorialStep3Title') }}</h3>
              <p>{{ t('tutorialStep3Desc') }}</p>
            </div>
          </div>
          <div class="step-right">
            <div class="tutorial-nav-buttons">
              <button v-if="currentStep > 1" class="btn-nav btn-prev" @click="prevStep">
                {{ t('previous') }}
              </button>
              <button v-if="currentStep < 3" class="btn-nav btn-next" @click="nextStep">
                {{ t('next') }}
              </button>
              <button v-else class="btn-nav btn-start" @click="handleStart">
                {{ t('startTraining') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="tutorial-footer">
        <div class="step-indicators">
          <span
            v-for="n in 3"
            :key="n"
            class="indicator"
            :class="{ active: currentStep === n }"
            @click="currentStep = n"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getElementById } from '../config/elements'

export default {
  name: 'TutorialModal',
  inject: ['i18n'],
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentStep: 1,
      // 使用真实图片ID进行演示
      demoImages: {
        // 步骤1：展示4个元素进行记忆
        step1: [1, 5, 10, 15],

        // 步骤2：4个元素，移除1个（第2个位置），显示4个选项
        step2: {
          display: [1, null, 10, 15], // null表示被移除
          options: [5, 20, 25, 30] // 第1个是正确答案
        },

        // 步骤3：5个元素，移除2个，显示4个选项（2个正确）
        step3: {
          display: [101, null, 108, null, 115], // 2个null表示被移除
          options: [105, 120, 110, 125] // 第1和第3个是正确答案
        }
      }
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.currentStep = 1
      }
    }
  },
  methods: {
    getImagePath(id) {
      const element = getElementById(id)
      return element ? element.path : ''
    },
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    handleClose() {
      this.$emit('close')
    },
    handleStart() {
      this.$emit('start')
    }
  }
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tutorial-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tutorial-header h2 {
  color: white;
  font-size: 32px;
  margin: 0;
  font-weight: bold;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.tutorial-content {
  position: relative;
  min-height: 400px;
}

.tutorial-step {
  position: absolute;
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  display: flex;
  gap: 20px;
  align-items: center;
}

.tutorial-step.active {
  opacity: 1;
  pointer-events: auto;
  position: relative;
}

.step-left {
  flex: 1;
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.step-right {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
}

.tutorial-nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-nav {
  padding: 14px 28px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 140px;
}

.btn-nav.btn-next,
.btn-nav.btn-start {
  background: white;
  color: #667eea;
}

.btn-nav.btn-next:hover,
.btn-nav.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

.btn-nav.btn-prev {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-nav.btn-prev:hover {
  background: rgba(255, 255, 255, 0.3);
}

.step-number {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.step-demo {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.demo-elements {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-element {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.demo-element.small {
  width: 70px;
  height: 70px;
}

.element-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.memorize-demo .demo-element {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.element-removed {
  font-size: 36px;
  color: #999;
  font-weight: bold;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.demo-timer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
}

.demo-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.demo-option {
  background: #f0f0f0;
  border: 3px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.demo-option.correct {
  border-color: #4caf50;
  background: #e8f5e9;
  animation: highlight 1.5s ease-in-out infinite;
}

@keyframes highlight {
  0%, 100% {
    box-shadow: 0 0 0 rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
  }
}

.demo-option.selected {
  border-color: #2196F3;
  background: #e3f2fd;
}

.option-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.check-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background-color: #2196F3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.demo-counter {
  background: #2196F3;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 16px;
}

.step-text {
  flex: 1;
  color: white;
}

.step-text h3 {
  font-size: 24px;
  margin: 0 0 15px 0;
  font-weight: bold;
}

.step-text p {
  font-size: 16px;
  line-height: 1.8;
  margin: 0;
  opacity: 0.95;
}

.tutorial-footer {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-indicators {
  display: flex;
  gap: 12px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

/* 响应式布局 - 平板和手机 */
@media (max-width: 1024px) {
  .tutorial-modal {
    padding: 30px 20px;
    max-height: 90vh;
    width: 95%;
  }

  .tutorial-header h2 {
    font-size: 24px;
  }

  .tutorial-content {
    min-height: auto;
  }

  .tutorial-step {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .step-left {
    flex-direction: column;
    gap: 20px;
  }

  .step-right {
    min-width: auto;
    width: 100%;
  }

  .tutorial-nav-buttons {
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }

  .btn-nav {
    flex: 1;
    max-width: 180px;
  }

  .step-demo {
    padding: 20px;
    min-height: 250px;
  }

  .demo-element {
    width: 60px;
    height: 60px;
  }

  .demo-element.small {
    width: 55px;
    height: 55px;
  }

  .option-img {
    width: 50px;
    height: 50px;
  }

  .step-text h3 {
    font-size: 20px;
  }

  .step-text p {
    font-size: 14px;
  }

  .tutorial-footer {
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .tutorial-modal {
    padding: 20px 15px;
  }

  .tutorial-header h2 {
    font-size: 20px;
  }

  .step-number {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .step-demo {
    padding: 15px;
    min-height: 200px;
  }

  .demo-elements {
    gap: 10px;
  }

  .demo-element {
    width: 50px;
    height: 50px;
  }

  .demo-element.small {
    width: 45px;
    height: 45px;
  }

  .demo-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .demo-option {
    padding: 15px;
  }

  .option-img {
    width: 40px;
    height: 40px;
  }

  .btn-nav {
    padding: 12px 20px;
    font-size: 14px;
    min-width: auto;
  }
}
</style>
