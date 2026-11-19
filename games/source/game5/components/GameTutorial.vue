<template>
  <div class="tutorial-overlay" @click.self="skipTutorial">
    <div class="tutorial-modal">
      <button @click="skipTutorial" class="skip-btn">{{ t('退出') }}</button>

      <div class="tutorial-content">
        <!-- 步骤指示器和导航按钮 -->
        <div class="tutorial-header">
          <div class="step-indicators">
            <div
              v-for="i in 4"
              :key="i"
              :class="['step-dot', { active: currentStep === i }]"
            ></div>
          </div>

          <!-- 导航按钮 -->
          <div class="tutorial-nav">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="nav-btn prev-btn"
            >
              ← {{ t('tutorial.prev') }}
            </button>
            <button
              v-if="currentStep < 4"
              @click="nextStep"
              class="nav-btn next-btn"
            >
              {{ t('tutorial.next') }} →
            </button>
            <button
              v-if="currentStep === 4"
              @click="startGame"
              class="nav-btn start-btn"
            >
              {{ t('tutorial.start') }}
            </button>
          </div>
        </div>

        <!-- 步骤1: 题目展示 -->
        <div v-if="currentStep === 1" class="tutorial-step">
          <h2>{{ t('tutorial.step1.title') }}</h2>
          <p class="tutorial-desc">{{ t('tutorial.step1.desc') }}</p>

          <div class="demo-area">
            <div class="demo-question-section animate-fade-in">
              <h3>{{ t('question') }}:</h3>
              <div class="demo-required-items">
                <div class="demo-required-item animate-scale-in" style="animation-delay: 0.2s">
                  {{ t('items.beverage') }}
                </div>
                <div class="demo-required-item animate-scale-in" style="animation-delay: 0.4s">
                  {{ t('items.cookie') }}
                </div>
              </div>
              <div class="demo-timer animate-pulse">
                <span class="timer-icon">⏱</span> 5s
              </div>
            </div>
          </div>

          <div class="tutorial-hint animate-bounce">
            <span class="hint-icon">💡</span>
            {{ t('tutorial.step1.hint') }}
          </div>
        </div>

        <!-- 步骤2: 选择商品 -->
        <div v-if="currentStep === 2" class="tutorial-step">
          <h2>{{ t('tutorial.step2.title') }}</h2>
          <p class="tutorial-desc">{{ t('tutorial.step2.desc') }}</p>

          <div class="demo-area">
            <div class="demo-shopping-section">
              <div class="demo-items-grid">
                <div
                  v-for="(item, index) in demoItems"
                  :key="item.name"
                  :class="[
                    'demo-item-card',
                    { selected: item.selected },
                    'animate-slide-up'
                  ]"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                >
                  <img :src="item.image" :alt="t(`items.${item.name}`)" class="demo-item-image" />
                  <div class="demo-item-name">{{ t(`items.${item.name}`) }}</div>
                  <div class="demo-item-price">¥{{ item.price }}</div>
                  <div v-if="item.selected" class="check-mark animate-check">✓</div>
                </div>
              </div>

              <div class="demo-cart animate-fade-in" style="animation-delay: 0.8s">
                <h4>{{ t('tutorial.cart') }}</h4>
                <div class="demo-cart-items">
                  <span class="cart-item">{{ t('items.beverage') }} (¥5)</span>
                  <span class="cart-item">{{ t('items.cookie') }} (¥3)</span>
                </div>
                <button class="demo-checkout-btn animate-pulse">
                  {{ t('checkout') }}
                </button>
              </div>
            </div>
          </div>

          <div class="tutorial-hint animate-bounce">
            <span class="hint-icon">💡</span>
            {{ t('tutorial.step2.hint') }}
          </div>
        </div>

        <!-- 步骤3: 选择价格 -->
        <div v-if="currentStep === 3" class="tutorial-step">
          <h2>{{ t('tutorial.step3.title') }}</h2>
          <p class="tutorial-desc">{{ t('tutorial.step3.desc') }}</p>

          <div class="demo-area">
            <div class="demo-checkout-section">
              <h3 class="animate-fade-in">{{ t('selectPrice') }}</h3>
              <div class="demo-price-options">
                <button
                  v-for="(price, index) in demoPrices"
                  :key="price"
                  :class="[
                    'demo-price-btn',
                    { correct: price === 8, wrong: price !== 8 && showAnswer },
                    'animate-scale-in'
                  ]"
                  :style="{ animationDelay: `${index * 0.15}s` }"
                >
                  ¥{{ price }}
                  <span v-if="price === 8 && showAnswer" class="correct-mark">✓</span>
                </button>
              </div>
            </div>
          </div>

          <div class="tutorial-hint animate-bounce">
            <span class="hint-icon">💡</span>
            {{ t('tutorial.step3.hint') }}
          </div>
        </div>

        <!-- 步骤4: 完成 -->
        <div v-if="currentStep === 4" class="tutorial-step">
          <h2>{{ t('tutorial.step4.title') }}</h2>
          <p class="tutorial-desc">{{ t('tutorial.step4.desc') }}</p>

          <div class="demo-area">
            <div class="demo-success animate-scale-in">
              <div class="success-icon"></div>
              <div class="success-message">{{ t('correct') }}</div>
              <div class="demo-score">+5 {{ t('score') }}</div>
            </div>

            <div class="demo-features">
              <div class="feature-item animate-slide-up" style="animation-delay: 0.2s">
                <span class="feature-icon"></span>
                <span>{{ t('tutorial.step4.feature1') }}</span>
              </div>
              <div class="feature-item animate-slide-up" style="animation-delay: 0.4s">
                <span class="feature-icon"></span>
                <span>{{ t('tutorial.step4.feature2') }}</span>
              </div>
              <div class="feature-item animate-slide-up" style="animation-delay: 0.6s">
                <span class="feature-icon">⏱</span>
                <span>{{ t('tutorial.step4.feature3') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n'
const demoItemImages = {
  beverage: require('../public/image/item/Beverage.png'),
  cookie: require('../public/image/item/Cookie.png'),
  milk: require('../public/image/item/Milk.png'),
  cola: require('../public/image/item/Cola.png')
}
export default {
  name: 'GameTutorial',
  emits: ['close', 'start-game'],
  setup(_, { emit }) {
    const { t } = useI18n()
    const currentStep = ref(1)
    const showAnswer = ref(false)

    const demoItems = ref([
      { name: 'beverage', price: 5, image: demoItemImages.beverage, selected: true },
      { name: 'cookie', price: 3, image: demoItemImages.cookie, selected: true },
      { name: 'milk', price: 4, image: demoItemImages.milk, selected:false },
      { name: 'cola', price: 6, image: demoItemImages.cola, selected: false }
    ])
 

    const demoPrices = [8, 12, 6, 10]

    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value++
        if (currentStep.value === 3) {
          // 在第3步显示答案
          setTimeout(() => {
            showAnswer.value = true
          }, 1500)
        }
      }
    }

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
        showAnswer.value = false
      }
    }

    const skipTutorial = () => {
      emit('close')
    }

    const startGame = () => {
      emit('start-game')
    }

    return {
      t,
      currentStep,
      showAnswer,
      demoItems,
      demoPrices,
      nextStep,
      prevStep,
      skipTutorial,
      startGame
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
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.tutorial-modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideUp 0.4s ease-out;
}

.skip-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  z-index: 10;
  transition: background 0.3s;
}

.skip-btn:hover {
  background: #ff5252;
}

.tutorial-content {
  padding: 50px 30px 30px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tutorial-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s;
}

.step-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.3);
}

.tutorial-step {
  text-align: center;
}

.tutorial-step h2 {
  color: #667eea;
  font-size: 32px;
  margin-bottom: 15px;
}

.tutorial-desc {
  color: #666;
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.demo-area {
  margin: 40px 0;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-question-section {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.demo-question-section h3 {
  color: #667eea;
  font-size: 24px;
  margin-bottom: 20px;
}

.demo-required-items {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.demo-required-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: bold;
}

.demo-timer {
  font-size: 28px;
  color: #ff6b6b;
  font-weight: bold;
}

.timer-icon {
  font-size: 32px;
}

.demo-shopping-section {
  width: 100%;
}

.demo-items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.demo-item-card {
  background: #f5f5f5;
  border: 3px solid transparent;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-item-card.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #764ba2;
}

.demo-item-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
  border-radius: 8px;
}

.demo-item-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.demo-item-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.demo-item-card.selected .demo-item-price {
  color: white;
}

.check-mark {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 24px;
  color: white;
}

.demo-cart {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.demo-cart h4 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 20px;
}

.demo-cart-items {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.cart-item {
  background: #e0e7ff;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.demo-checkout-btn {
  padding: 12px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.demo-checkout-section h3 {
  color: #667eea;
  font-size: 28px;
  margin-bottom: 30px;
}

.demo-price-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.demo-price-btn {
  padding: 25px;
  background: #f5f5f5;
  border: 3px solid #667eea;
  border-radius: 12px;
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.demo-price-btn.correct {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  border-color: #40c057;
  transform: scale(1.05);
}

.demo-price-btn.wrong {
  opacity: 0.5;
}

.correct-mark {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 32px;
}

.demo-success {
  text-align: center;
  padding: 40px;
}

.success-icon {
  font-size: 100px;
  margin-bottom: 20px;
}

.success-message {
  font-size: 36px;
  color: #51cf66;
  font-weight: bold;
  margin-bottom: 15px;
}

.demo-score {
  font-size: 28px;
  color: #667eea;
  font-weight: bold;
}

.demo-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 40px auto 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  font-size: 18px;
}

.feature-icon {
  font-size: 32px;
}

.tutorial-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #fff3cd;
  color: #856404;
  padding: 15px 20px;
  border-radius: 12px;
  font-size: 16px;
  margin-top: 30px;
}

.hint-icon {
  font-size: 24px;
}

.tutorial-nav {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.nav-btn {
  padding: 15px 40px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.prev-btn {
  background: #e0e0e0;
  color: #666;
}

.prev-btn:hover {
  background: #d0d0d0;
}

.next-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.start-btn {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  font-size: 20px;
  padding: 15px 50px;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(81, 207, 102, 0.4);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUpAnim {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes checkAnim {
  from {
    opacity: 0;
    transform: scale(0) rotate(-45deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-out;
  animation-fill-mode: both;
}

.animate-slide-up {
  animation: slideUpAnim 0.5s ease-out;
  animation-fill-mode: both;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}

.animate-check {
  animation: checkAnim 0.5s ease-out;
}

/* 响应式设计 - 小屏幕适配 */
@media (max-width: 768px) {
  .tutorial-modal {
    width: 95%;
    max-height: 95vh;
    border-radius: 12px;
  }

  .tutorial-content {
    padding: 45px 15px 20px;
  }

  .tutorial-header {
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .tutorial-step h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .tutorial-desc {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .demo-area {
    margin: 20px 0;
    min-height: auto;
  }

  .demo-question-section {
    padding: 20px;
  }

  .demo-question-section h3 {
    font-size: 18px;
  }

  .demo-required-items {
    flex-direction: column;
    gap: 10px;
  }

  .demo-required-item {
    padding: 10px 20px;
    font-size: 16px;
  }

  .demo-timer {
    font-size: 20px;
  }

  .demo-items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .demo-item-card {
    padding: 10px;
  }

  .demo-item-image {
    height: 50px;
  }

  .demo-item-name {
    font-size: 12px;
  }

  .demo-item-price {
    font-size: 14px;
  }

  .demo-cart {
    padding: 15px;
  }

  .demo-cart h4 {
    font-size: 16px;
  }

  .demo-checkout-btn {
    padding: 10px 30px;
    font-size: 16px;
  }

  .demo-checkout-section h3 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .demo-price-options {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    max-width: 100%;
  }

  .demo-price-btn {
    padding: 15px;
    font-size: 20px;
  }

  .success-message {
    font-size: 24px;
  }

  .demo-score {
    font-size: 20px;
  }

  .demo-features {
    gap: 15px;
    margin-top: 20px;
  }

  .feature-item {
    padding: 15px;
    font-size: 14px;
  }

  .feature-icon {
    font-size: 24px;
  }

  .tutorial-hint {
    padding: 12px 15px;
    font-size: 14px;
    margin-top: 20px;
  }

  .tutorial-nav {
    flex-wrap: wrap;
    gap: 10px;
  }

  .nav-btn {
    padding: 12px 30px;
    font-size: 16px;
  }

  .start-btn {
    font-size: 16px;
    padding: 12px 40px;
  }
}

/* 超小屏幕（手机竖屏） */
@media (max-width: 480px) {
  .tutorial-step h2 {
    font-size: 20px;
  }

  .tutorial-desc {
    font-size: 13px;
  }

  .demo-items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .demo-price-options {
    gap: 8px;
  }

  .demo-price-btn {
    padding: 12px;
    font-size: 18px;
  }
}
</style>
