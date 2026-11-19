<template>
  <div class="tutorial-overlay">
    <div class="tutorial-container">
      <h2 class="tutorial-title">{{ t('tutorialTitle') }}</h2>

      <div class="tutorial-content">
        <div class="tutorial-step" :class="{ active: currentStep === 1 }">
          <div class="step-number">1</div>
          <div class="step-demo">
            <div class="demo-question">{{ demoQuestion }}</div>
          </div>
          <p class="step-text">{{ t('tutorialStep1') }}</p>
        </div>

        <div class="tutorial-step" :class="{ active: currentStep === 2 }">
          <div class="step-number">2</div>
          <div class="step-demo">
            <div class="demo-options">
              <div
                v-for="(option, index) in demoOptions"
                :key="index"
                class="demo-option"
                :class="{
                  correct: currentStep >= 3 && option.isCorrect,
                  selected: currentStep >= 3 && selectedOption === index
                }"
                @click="selectDemoOption(index)"
              >
                <img :src="option.image" :alt="option.name" />
              </div>
            </div>
          </div>
          <p class="step-text">{{ t('tutorialStep2') }}</p>
        </div>

        <div class="tutorial-step" :class="{ active: currentStep === 3 }">
          <div class="step-number">3</div>
          <div class="step-demo">
            <div class="demo-score">
              <span class="score-label">{{ t('score') }}:</span>
              <span class="score-value animate">+{{ scoreDemo }}</span>
            </div>
          </div>
          <p class="step-text">{{ t('tutorialStep3') }}</p>
        </div>

        <div class="tutorial-step" :class="{ active: currentStep === 4 }">
          <div class="step-number">4</div>
          <div class="step-demo">
            <div class="demo-countdown">
              <div class="countdown-text">{{ Math.ceil(countdownTime) }}{{ t('seconds') }}</div>
            </div>
          </div>
          <p class="step-text">{{ t('tutorialStep4') }}</p>
        </div>
      </div>

      <div class="tutorial-navigation">
        <div class="step-dots">
          <span
            v-for="n in 4"
            :key="n"
            class="dot"
            :class="{ active: currentStep === n }"
          ></span>
        </div>

        <div class="tutorial-buttons">
          <button @click="skipTutorial" class="skip-btn">
            {{ t('skipTutorial') }}
          </button>
          <button
            v-if="currentStep < 4"
            @click="nextStep"
            class="next-btn"
          >
            {{ t('nextStep') }}
          </button>
          <button
            v-else
            @click="startGame"
            class="start-btn"
          >
            {{ t('startNow') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { itemsConfig } from '../config/items.js';
import { shuffleArray } from '../utils/gameHelpers.js';
import { getItemImagePath } from '../config/items.js';

export default {
  name: 'TutorialModal',
  props: {
    t: {
      type: Function,
      required: true
    },
    language: {
      type: String,
      required: true
    }
  },
  emits: ['start', 'skip'],
  data() {
    return {
      currentStep: 1,
      demoItem: null,
      demoOptions: [],
      selectedOption: -1,
      scoreDemo: 5,
      countdownTime: 6,
      countdownTimer: null
    }
  },
  computed: {
    demoItemName() {
      if (!this.demoItem) return '';
      return this.language === 'zh' ? this.demoItem.zh : this.demoItem.en;
    },
    demoQuestion() {
      const space = this.language === 'zh' ? '' : ' ';
      return this.t('findItem') + space + this.demoItemName;
    }
  },
  mounted() {
    this.initDemo();
  },
  beforeUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
  methods: {
    initDemo() {
      // 随机选择一个演示物品
      this.demoItem = itemsConfig[Math.floor(Math.random() * itemsConfig.length)];

      // 生成演示选项
      const options = [];

      // 正确答案
      const targetImageIndex = Math.floor(Math.random() * this.demoItem.images.length);
      options.push({
        name: this.demoItem.name,
        image: getItemImagePath(this.demoItem.name, this.demoItem.images[targetImageIndex]),
        isCorrect: true
      });

      // 错误选项
      const wrongItems = itemsConfig.filter(item => item.name !== this.demoItem.name);
      for (let i = 0; i < 3; i++) {
        const randomItem = wrongItems[Math.floor(Math.random() * wrongItems.length)];
        const randomImageIndex = Math.floor(Math.random() * randomItem.images.length);
        options.push({
          name: randomItem.name,
          image: getItemImagePath(randomItem.name, randomItem.images[randomImageIndex]),
          isCorrect: false
        });
      }

      this.demoOptions = shuffleArray(options);
    },

    nextStep() {
      if (this.currentStep < 4) {
        this.currentStep++;

        // 如果到第4步，启动倒计时演示
        if (this.currentStep === 4) {
          this.startCountdownDemo();
        }
      }
    },

    selectDemoOption(index) {
      if (this.currentStep === 2) {
        this.selectedOption = index;
        setTimeout(() => {
          this.nextStep();
        }, 500);
      }
    },

    startCountdownDemo() {
      this.countdownTime = 6;

      this.countdownTimer = setInterval(() => {
        this.countdownTime -= 0.1;

        if (this.countdownTime <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTime = 0;
        }
      }, 100);
    },

    skipTutorial() {
      this.$emit('skip');
    },

    startGame() {
      this.$emit('start');
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.tutorial-container {
  background: white;
  border-radius: 20px;
  padding: 30px 40px;
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tutorial-title {
  text-align: center;
  color: #667eea;
  font-size: 28px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.tutorial-navigation {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  flex-shrink: 0;
  order: -1;
}

.step-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s;
}

.dot.active {
  background: #667eea;
  transform: scale(1.3);
}

.tutorial-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.skip-btn,
.next-btn,
.start-btn {
  padding: 10px 25px;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.skip-btn {
  background: #f5f5f5;
  color: #666;
}

.skip-btn:hover {
  background: #e0e0e0;
}

.next-btn {
  background: #667eea;
  color: white;
}

.next-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.start-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.tutorial-content {
  flex: 1;
  overflow-y: auto;
  margin: 0 -10px;
  padding: 0 10px;
}

.tutorial-step {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: #f5f5f5;
  opacity: 0.5;
  transition: all 0.3s;
}

.tutorial-step.active {
  opacity: 1;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border: 2px solid #667eea;
  transform: scale(1.02);
}

.step-number {
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.step-demo {
  flex: 1;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-question {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: center;
  padding: 0 10px;
}

.demo-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.demo-option {
  background: white;
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.demo-option:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.demo-option.selected {
  border-color: #f5576c;
  background: #fff5f7;
}

.demo-option.correct {
  border-color: #4caf50;
  background: #f1f8f4;
}

.demo-option img {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
}

.demo-score {
  font-size: 32px;
  font-weight: bold;
}

.score-label {
  color: #666;
}

.score-value {
  color: #4caf50;
  margin-left: 10px;
}

.score-value.animate {
  animation: scoreUp 0.5s ease-out;
}

@keyframes scoreUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.demo-countdown {
  width: 100%;
}

.countdown-text {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.step-text {
  flex: 1;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tutorial-container {
    padding: 20px;
  }

  .tutorial-title {
    font-size: 22px;
  }

  .tutorial-step {
    flex-direction: column;
    text-align: center;
  }

  .demo-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
