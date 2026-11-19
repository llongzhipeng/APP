<template>
  <div v-if="visible" class="tutorial-overlay" @click.self="handleClose">
    <div class="tutorial-modal">
      <!-- 标题 -->
      <div class="tutorial-header">
        <h2>{{ t('tutorial.title') }}</h2>
        <button @click="handleClose" class="close-btn">×</button>
      </div>

      <!-- 教程步骤 -->
      <div class="tutorial-content">
        <!-- 步骤指示器 -->
        <div class="step-indicators">
          <div
            v-for="i in totalSteps"
            :key="i"
            :class="['step-dot', { active: currentStep === i }]"
          ></div>
        </div>

        <!-- 步骤1: 目标值介绍 -->
        <div v-if="currentStep === 1" class="tutorial-step step-1">
          <h3>{{ t('tutorial.step1Title') }}</h3>
          <p class="step-desc">{{ t('tutorial.step1Desc') }}</p>

          <div class="demo-area">
            <div class="demo-target pulse">
              <span class="demo-target-label">{{ t('game.target') }}</span>
              <span class="demo-target-value">15</span>
            </div>
          </div>

          <div class="step-tip">
            <span class="tip-icon">💡</span>
            <span>{{ t('tutorial.step1Tip') }}</span>
          </div>
        </div>

        <!-- 步骤2: 选择卡片 -->
        <div v-if="currentStep === 2" class="tutorial-step step-2">
          <h3>{{ t('tutorial.step2Title') }}</h3>
          <p class="step-desc">{{ t('tutorial.step2Desc') }}</p>

          <div class="demo-area">
            <div class="demo-target-small">
              <span class="demo-target-value">15</span>
            </div>

            <div class="demo-cards">
              <div
                v-for="(card, index) in demoCards"
                :key="index"
                :class="['demo-card', {
                  selected: selectedDemoCards.includes(index),
                  'animate-select': animatingCards.includes(index)
                }]"
              >
                {{ card }}
              </div>
            </div>

            <div class="equation" v-if="selectedDemoCards.length > 0">
              <span v-for="(idx, i) in selectedDemoCards" :key="i">
                {{ demoCards[idx] }}
                <span v-if="i < selectedDemoCards.length - 1"> + </span>
              </span>
              <span v-if="selectedDemoCards.length === 2"> = 15 ✓</span>
            </div>
          </div>

          <div class="step-tip">
            <span class="tip-icon">👆</span>
            <span>{{ t('tutorial.step2Tip') }}</span>
          </div>
        </div>

        <!-- 步骤3: 卡片消失和刷新 -->
        <div v-if="currentStep === 3" class="tutorial-step step-3">
          <h3>{{ t('tutorial.step3Title') }}</h3>
          <p class="step-desc">{{ t('tutorial.step3Desc') }}</p>

          <div class="demo-area">
            <div class="demo-cards-grid">
              <div
                v-for="(card, index) in step3Cards"
                :key="index"
                :class="['demo-card-small', {
                  disappear: card.disappearing,
                  'new-card': card.isNew
                }]"
              >
                {{ card.value }}
              </div>
            </div>
          </div>

          <div class="step-tip">
            <span class="tip-icon">✨</span>
            <span>{{ t('tutorial.step3Tip') }}</span>
          </div>
        </div>

        <!-- 步骤4: 难度提升 -->
        <div v-if="currentStep === 4" class="tutorial-step step-4">
          <h3>{{ t('tutorial.step4Title') }}</h3>
          <p class="step-desc">{{ t('tutorial.step4Desc') }}</p>

          <div class="demo-area">
            <div class="difficulty-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: difficultyProgress + '%' }"></div>
              </div>
              <div class="progress-labels">
                <span>{{ t('common.difficulty') }} 1</span>
                <span class="highlight">{{ t('common.difficulty') }} 2</span>
                <span>{{ t('common.difficulty') }} 3</span>
              </div>
            </div>

            <div class="accuracy-display">
              <div class="accuracy-item">
                <span class="accuracy-label">{{ t('tutorial.accuracy') }}</span>
                <span class="accuracy-value success">92%</span>
              </div>
              <div class="arrow">→</div>
              <div class="level-up">
                <span class="level-up-text">{{ t('game.levelUp') }}</span>
              </div>
            </div>
          </div>

          <div class="step-tip">
            <span class="tip-icon">🎯</span>
            <span>{{ t('tutorial.step4Tip') }}</span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="tutorial-footer">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="btn btn-secondary"
        >
          {{ t('tutorial.previous') }}
        </button>

        <div class="spacer"></div>

        <label class="checkbox-label">
          <input type="checkbox" v-model="dontShowAgain" />
          <span>{{ t('tutorial.dontShowAgain') }}</span>
        </label>

        <button
          v-if="currentStep < totalSteps"
          @click="nextStep"
          class="btn btn-primary"
        >
          {{ t('tutorial.next') }}
        </button>

        <button
          v-else
          @click="handleStart"
          class="btn btn-primary btn-start"
        >
          {{ t('tutorial.startGame') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from '@vue/composition-api';
import { t } from '../../i18n/index.js';

export default {
  name: 'TutorialModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'start'],
  setup(props, { emit }) {
    const currentStep = ref(1);
    const totalSteps = 4;
    const dontShowAgain = ref(false);

    // 演示数据
    const demoCards = [3, 7, 8, 5, 12];
    const selectedDemoCards = ref([]);
    const animatingCards = ref([]);

    // 步骤3的卡片
    const step3Cards = ref([
      { value: 3, disappearing: false, isNew: false },
      { value: 7, disappearing: false, isNew: false },
      { value: 8, disappearing: false, isNew: false },
      { value: 5, disappearing: false, isNew: false },
      { value: 12, disappearing: false, isNew: false },
      { value: 9, disappearing: false, isNew: false }
    ]);

    // 难度进度
    const difficultyProgress = ref(0);

    let step2Animation = null;
    let step3Animation = null;
    let step4Animation = null;

    // 步骤2动画：自动选择卡片
    const startStep2Animation = () => {
      selectedDemoCards.value = [];
      animatingCards.value = [];

      const animateCard = (index, delay) => {
        setTimeout(() => {
          animatingCards.value.push(index);
          setTimeout(() => {
            selectedDemoCards.value.push(index);
            animatingCards.value = animatingCards.value.filter(i => i !== index);
          }, 300);
        }, delay);
      };

      step2Animation = setTimeout(() => {
        animateCard(1, 0);      // 7
        animateCard(2, 800);    // 8
      }, 500);
    };

    // 步骤3动画：卡片消失和刷新
    const startStep3Animation = () => {
      const animate = () => {
        // 重置
        step3Cards.value.forEach(card => {
          card.disappearing = false;
          card.isNew = false;
        });

        // 1秒后开始消失
        setTimeout(() => {
          step3Cards.value[1].disappearing = true;
          step3Cards.value[2].disappearing = true;
        }, 1000);

        // 1.5秒后生成新卡片
        setTimeout(() => {
          step3Cards.value[1] = { value: 6, disappearing: false, isNew: true };
          step3Cards.value[2] = { value: 11, disappearing: false, isNew: true };
        }, 1500);

        // 2秒后移除新卡片标记
        setTimeout(() => {
          step3Cards.value[1].isNew = false;
          step3Cards.value[2].isNew = false;
        }, 2500);
      };

      animate();
      step3Animation = setInterval(animate, 4000);
    };

    // 步骤4动画：难度进度
    const startStep4Animation = () => {
      difficultyProgress.value = 0;

      const animate = () => {
        difficultyProgress.value = 0;
        let progress = 0;
        const interval = setInterval(() => {
          progress += 2;
          difficultyProgress.value = progress;
          if (progress >= 50) {
            clearInterval(interval);
          }
        }, 30);
      };

      animate();
      step4Animation = setInterval(animate, 3000);
    };

    // 清除所有动画
    const clearAnimations = () => {
      if (step2Animation) clearTimeout(step2Animation);
      if (step3Animation) clearInterval(step3Animation);
      if (step4Animation) clearInterval(step4Animation);
      selectedDemoCards.value = [];
      animatingCards.value = [];
      difficultyProgress.value = 0;
    };

    // 下一步
    const nextStep = () => {
      clearAnimations();
      currentStep.value++;

      if (currentStep.value === 2) {
        setTimeout(startStep2Animation, 100);
      } else if (currentStep.value === 3) {
        setTimeout(startStep3Animation, 100);
      } else if (currentStep.value === 4) {
        setTimeout(startStep4Animation, 100);
      }
    };

    // 上一步
    const prevStep = () => {
      clearAnimations();
      currentStep.value--;

      if (currentStep.value === 2) {
        setTimeout(startStep2Animation, 100);
      } else if (currentStep.value === 3) {
        setTimeout(startStep3Animation, 100);
      } else if (currentStep.value === 4) {
        setTimeout(startStep4Animation, 100);
      }
    };

    // 关闭
    const handleClose = () => {
      if (dontShowAgain.value) {
        localStorage.setItem('tutorial_completed', 'true');
      }
      clearAnimations();
      emit('close');
    };

    // 开始游戏
    const handleStart = () => {
      if (dontShowAgain.value) {
        localStorage.setItem('tutorial_completed', 'true');
      }
      clearAnimations();
      emit('start');
    };

    onMounted(() => {
      if (props.visible && currentStep.value === 1) {
        // 第一步不需要动画
      }
    });

    onUnmounted(() => {
      clearAnimations();
    });

    return {
      currentStep,
      totalSteps,
      dontShowAgain,
      demoCards,
      selectedDemoCards,
      animatingCards,
      step3Cards,
      difficultyProgress,
      nextStep,
      prevStep,
      handleClose,
      handleStart,
      t
    };
  }
};
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
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tutorial-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tutorial-header {
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tutorial-header h2 {
  margin: 0;
  font-size: 28px;
  color: #667eea;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.tutorial-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px 24px;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s;
}

.step-dot.active {
  background: #667eea;
  width: 32px;
  border-radius: 6px;
}

.tutorial-step {
  animation: stepFadeIn 0.4s ease-out;
}

@keyframes stepFadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tutorial-step h3 {
  font-size: 24px;
  color: #333;
  margin: 0 0 12px 0;
}

.step-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.demo-area {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

/* 步骤1样式 */
.demo-target {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 20px 40px;
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-target.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(245, 87, 108, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(245, 87, 108, 0.6);
  }
}

.demo-target-label {
  font-size: 14px;
  color: white;
  opacity: 0.9;
  margin-bottom: 8px;
}

.demo-target-value {
  font-size: 48px;
  font-weight: bold;
  color: white;
}

/* 步骤2样式 */
.demo-target-small {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  padding: 12px 24px;
}

.demo-target-small .demo-target-value {
  font-size: 32px;
  color: white;
  font-weight: bold;
}

.demo-cards {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-card {
  width: 80px;
  height: 80px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #333;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.demo-card.animate-select {
  animation: selectBounce 0.5s ease-out;
}

@keyframes selectBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.demo-card.selected {
  background: linear-gradient(145deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.equation {
  font-size: 24px;
  font-weight: bold;
  color: white;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  animation: equationFadeIn 0.3s ease-out;
}

@keyframes equationFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 步骤3样式 */
.demo-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.demo-card-small {
  width: 70px;
  height: 70px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  color: #333;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.4s;
}

.demo-card-small.disappear {
  animation: cardDisappear 0.5s ease-out forwards;
}

@keyframes cardDisappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.5);
  }
}

.demo-card-small.new-card {
  animation: cardAppear 0.5s ease-out;
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 步骤4样式 */
.difficulty-progress {
  width: 100%;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 6px;
  transition: width 0.3s ease-out;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  color: white;
  font-size: 14px;
}

.progress-labels .highlight {
  color: #ffd700;
  font-weight: bold;
}

.accuracy-display {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
  border-radius: 12px;
}

.accuracy-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.accuracy-label {
  font-size: 12px;
  color: white;
  opacity: 0.9;
  margin-bottom: 4px;
}

.accuracy-value {
  font-size: 32px;
  font-weight: bold;
}

.accuracy-value.success {
  color: #ffd700;
}

.arrow {
  font-size: 24px;
  color: white;
}

.level-up {
  padding: 8px 16px;
  background: #ffd700;
  border-radius: 8px;
  animation: levelUpBounce 1s ease-in-out infinite;
}

@keyframes levelUpBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.level-up-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.step-tip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  font-size: 15px;
  color: #333;
}

.tip-icon {
  font-size: 24px;
}

.tutorial-footer {
  padding: 20px 24px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.spacer {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #666;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary.btn-start {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 12px 32px;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f0f4ff;
}

@media (max-width: 768px) {
  .tutorial-modal {
    max-width: 95%;
  }

  .demo-cards {
    gap: 10px;
  }

  .demo-card {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .tutorial-footer {
    flex-wrap: wrap;
  }

  .checkbox-label {
    order: -1;
    flex: 1 100%;
    margin-bottom: 10px;
  }
}
</style>
