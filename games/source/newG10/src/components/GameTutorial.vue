<template>
  <div class="tutorial-overlay" @click.self="skipTutorial">
    <div class="tutorial-modal">
      <button @click="skipTutorial" class="skip-btn">{{ t('tutorial.skip') }}</button>

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

        <!-- 步骤1: 记住购物清单 -->
        <div v-if="currentStep === 1" class="tutorial-step">
          <h2>{{ t('tutorial.step1.title') }}</h2>
          <p class="tutorial-desc">{{ t('tutorial.step1.desc') }}</p>

          <div class="demo-area">
            <div class="demo-question-section animate-fade-in">
              <h3>{{ t('question') }}</h3>
              <div class="demo-required-items">
                <div class="demo-required-item animate-scale-in" style="animation-delay: 0.2s">
                  <img :src="resolveImage('/image/item/Beverage.png')" class="demo-required-img" />
                  <span>{{ t('items.beverage') }}</span>
                </div>
                <div class="demo-required-item animate-scale-in" style="animation-delay: 0.4s">
                  <img :src="resolveImage('/image/item/Cookie.png')" class="demo-required-img" />
                  <span>{{ t('items.cookie') }}</span>
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

        <!-- 步骤2: 从货架拖入购物车 -->
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
                  <div v-if="item.selected" class="check-mark animate-check">✓</div>
                </div>
              </div>

              <div class="demo-cart-preview animate-fade-in" style="animation-delay: 0.8s">
                <img :src="resolveImage('/image/1.png')" class="demo-cart-img" />
                <div class="demo-cart-badge">2</div>
              </div>
            </div>
          </div>

          <div class="tutorial-hint animate-bounce">
            <span class="hint-icon">💡</span>
            {{ t('tutorial.step2.hint') }}
          </div>
        </div>

        <!-- 步骤3: 确认购物 -->
        <div v-if="currentStep === 3" class="tutorial-step">
          <h2>{{ t('tutorial.step3.title') }}</h2>
          <p class="tutorial-desc">{{ t('tutorial.step3.desc') }}</p>

          <div class="demo-area">
            <div class="demo-confirm-section">
              <div class="demo-cart-big animate-scale-in">
                <img :src="resolveImage('/image/1.png')" class="demo-cart-big-img" />
                <div class="demo-cart-contents">
                  <img :src="resolveImage('/image/item/Beverage.png')" class="demo-cart-item" />
                  <img :src="resolveImage('/image/item/Cookie.png')" class="demo-cart-item" />
                </div>
              </div>
              <button class="demo-confirm-btn animate-pulse">
                {{ t('confirmCart') }}
              </button>
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
              <div class="success-icon">✓</div>
              <div class="success-message">{{ t('correct') }}</div>
              <div class="demo-score">+5 {{ t('score') }}</div>
            </div>

            <div class="demo-features">
              <div class="feature-item animate-slide-up" style="animation-delay: 0.2s">
                <span class="feature-icon">⭐</span>
                <span>{{ t('tutorial.step4.feature1') }}</span>
              </div>
              <div class="feature-item animate-slide-up" style="animation-delay: 0.4s">
                <span class="feature-icon">📊</span>
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
import { resolveImage } from '../assets'
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n'

export default {
  methods: { resolveImage },
  name: 'GameTutorial',
  emits: ['close', 'start-game'],
  setup(_, { emit }) {
    const { t } = useI18n()
    const currentStep = ref(1)

    const demoItems = ref([
      { name: 'beverage', image: resolveImage('/image/item/Beverage.png'), selected: true },
      { name: 'cookie', image: resolveImage('/image/item/Cookie.png'), selected: true },
      { name: 'milk', image: resolveImage('/image/item/Milk.png'), selected: false },
      { name: 'cola', image: resolveImage('/image/item/Cola.png'), selected: false }
    ])

    const nextStep = () => {
      if (currentStep.value < 4) currentStep.value++
    }

    const prevStep = () => {
      if (currentStep.value > 1) currentStep.value--
    }

    const skipTutorial = () => {
      emit('close')
    }

    const startGame = () => {
      emit('start-game')
    }

    return {
      t,
      resolveImage,
      currentStep,
      demoItems,
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
  border-radius: 2.4vmin;
  max-width: 120vmin;
  width: 92%;
  max-height: 92vh;
  max-height: calc(var(--real-vh, 1vh) * 92);
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideUp 0.4s ease-out;
}

.skip-btn {
  position: absolute;
  top: 2vmin;
  right: 2vmin;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 1vmin;
  padding: 1.2vmin 2.2vmin;
  cursor: pointer;
  font-size: 2vmin;
  font-weight: 600;
  z-index: 10;
  transition: background 0.3s;
}

.skip-btn:hover {
  background: #ff5252;
}

.tutorial-content {
  padding: 6vmin 4.5vmin 4vmin;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tutorial-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  margin-bottom: 3.5vmin;
  padding-bottom: 2.5vmin;
  border-bottom: 2px solid #eee;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 1.5vmin;
}

.step-dot {
  width: 1.8vmin;
  height: 1.8vmin;
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
  font-size: 4.2vmin;
  margin-bottom: 2vmin;
}

.tutorial-desc {
  color: #666;
  font-size: 2.4vmin;
  margin-bottom: 3.5vmin;
  line-height: 1.6;
}

.demo-area {
  margin: 3vmin 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3vmin;
}

.demo-question-section {
  background: #f8f9fa;
  padding: 4vmin;
  border-radius: 1.4vmin;
  box-shadow: 0 0.4vmin 1.2vmin rgba(0,0,0,0.1);
}

.demo-question-section h3 {
  color: #667eea;
  font-size: 3vmin;
  margin-bottom: 2.5vmin;
}

.demo-required-items {
  display: flex;
  gap: 2vmin;
  justify-content: center;
  margin-bottom: 2.5vmin;
  flex-wrap: wrap;
}

.demo-required-item {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 1.8vmin 2.4vmin;
  border-radius: 1.4vmin;
  font-size: 2.4vmin;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vmin;
  min-width: 13vmin;
}

.demo-required-img {
  width: 9vmin;
  height: 9vmin;
  object-fit: contain;
}

.demo-timer {
  font-size: 3.4vmin;
  color: #ff6b6b;
  font-weight: bold;
}

.timer-icon {
  font-size: 3.8vmin;
}

.demo-shopping-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
}

.demo-items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2vmin;
  width: 100%;
  max-width: 90vmin;
}

.demo-item-card {
  background: white;
  border: 0.3vmin solid transparent;
  border-radius: 1.4vmin;
  padding: 1.8vmin;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0.2vmin 0.8vmin rgba(0,0,0,0.08);
}

.demo-item-card.selected {
  border-color: #667eea;
  background: #f0f0ff;
  box-shadow: 0 0 0 0.4vmin rgba(102,126,234,0.2);
}

.demo-item-image {
  width: 100%;
  height: 10vmin;
  object-fit: contain;
  margin-bottom: 1vmin;
}

.demo-item-name {
  font-size: 2vmin;
  font-weight: 600;
  color: #333;
}

.check-mark {
  position: absolute;
  top: 0.8vmin;
  right: 0.8vmin;
  width: 3.2vmin;
  height: 3.2vmin;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2vmin;
  font-weight: bold;
}

.demo-cart-preview {
  position: relative;
  display: inline-block;
}

.demo-cart-img {
  height: 13vmin;
  object-fit: contain;
}

.demo-cart-badge {
  position: absolute;
  top: -1vmin;
  right: -1.4vmin;
  background: #ff6b6b;
  color: white;
  border-radius: 999px;
  padding: 0.6vmin 1.6vmin;
  font-size: 2.2vmin;
  font-weight: bold;
}

.demo-confirm-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3.5vmin;
}

.demo-cart-big {
  position: relative;
  background: white;
  border: 0.4vmin dashed #667eea;
  border-radius: 2vmin;
  padding: 3vmin 5vmin;
  display: flex;
  align-items: center;
  gap: 3vmin;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-cart-big-img {
  height: 14vmin;
  object-fit: contain;
}

.demo-cart-contents {
  display: flex;
  gap: 1.5vmin;
}

.demo-cart-item {
  width: 8vmin;
  height: 8vmin;
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 1vmin;
  padding: 0.6vmin;
}

.demo-confirm-btn {
  padding: 2vmin 5.5vmin;
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  border: none;
  border-radius: 1.4vmin;
  font-size: 2.6vmin;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0.4vmin 1.2vmin rgba(64,192,87,0.35);
}

.demo-success {
  text-align: center;
  padding: 3vmin 5vmin;
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  border-radius: 2vmin;
  color: white;
}

.success-icon {
  font-size: 10vmin;
  font-weight: bold;
  margin-bottom: 1.5vmin;
}

.success-message {
  font-size: 4.2vmin;
  font-weight: bold;
  margin-bottom: 1.5vmin;
}

.demo-score {
  font-size: 3vmin;
  font-weight: bold;
}

.demo-features {
  display: flex;
  flex-direction: column;
  gap: 2vmin;
  max-width: 60vmin;
  margin: 2vmin auto 0;
  width: 100%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1.8vmin;
  background: #f8f9fa;
  padding: 2.2vmin;
  border-radius: 1.4vmin;
  font-size: 2.2vmin;
  color: #333;
}

.feature-icon {
  font-size: 3.4vmin;
}

.tutorial-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fff3cd;
  color: #856404;
  padding: 1.8vmin 2.4vmin;
  border-radius: 1.4vmin;
  font-size: 2.2vmin;
  margin-top: 3vmin;
}

.hint-icon {
  font-size: 2.8vmin;
}

.tutorial-nav {
  display: flex;
  justify-content: center;
  gap: 2vmin;
}

.nav-btn {
  padding: 1.8vmin 4.5vmin;
  border: none;
  border-radius: 1.4vmin;
  font-size: 2.4vmin;
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
  font-size: 2.6vmin;
  padding: 1.8vmin 5.5vmin;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(81, 207, 102, 0.4);
}

/* 动画 */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideUpAnim {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes checkAnim {
  from { opacity: 0; transform: scale(0) rotate(-45deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}

.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-scale-in { animation: scaleIn 0.5s ease-out; animation-fill-mode: both; }
.animate-slide-up { animation: slideUpAnim 0.5s ease-out; animation-fill-mode: both; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
.animate-bounce { animation: bounce 2s ease-in-out infinite; }
.animate-check { animation: checkAnim 0.5s ease-out; }

/* 极窄屏叠加：改为2列网格 */
@media (max-width: 600px) {
  .demo-required-items { flex-direction: column; }
  .demo-items-grid { grid-template-columns: repeat(2, 1fr); }
}

/* 手机竖屏（微信 web-view）适配 */
@media (orientation: portrait) {
  .tutorial-modal {
    width: 94vw;
    max-width: 94vw;
    max-height: 92vh;
    max-height: calc(var(--real-vh, 1vh) * 92);
    border-radius: 3vmin;
  }
  .skip-btn {
    top: calc(2vmin + env(safe-area-inset-top));
    right: 2.5vmin;
    padding: 2vmin 3vmin;
    font-size: max(3.4vmin, 14px);
    border-radius: 2vmin;
  }
  .tutorial-content {
    padding: 10vmin 4vmin 4vmin;
    padding-top: calc(10vmin + env(safe-area-inset-top));
    padding-bottom: calc(4vmin + env(safe-area-inset-bottom));
  }
  .tutorial-step h2 { font-size: max(5.4vmin, 20px); }
  .tutorial-desc { font-size: max(3.6vmin, 14px); }
  .step-dot { width: 3vmin; height: 3vmin; }

  .demo-required-items { flex-direction: column; gap: 2.5vmin; }
  .demo-required-item {
    font-size: max(3.6vmin, 14px);
    padding: 2.5vmin 3vmin;
    min-width: 40vmin;
  }
  .demo-required-img { width: 14vmin; height: 14vmin; }
  .demo-question-section h3 { font-size: max(4.2vmin, 16px); }
  .demo-timer { font-size: max(4.4vmin, 17px); }

  .demo-items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5vmin;
  }
  .demo-item-card { padding: 2.5vmin; border-radius: 2vmin; }
  .demo-item-image { height: 16vmin; }
  .demo-item-name { font-size: max(3.2vmin, 13px); }

  .demo-cart-img { height: 20vmin; }
  .demo-cart-badge { font-size: max(3.4vmin, 13px); padding: 1vmin 2.4vmin; }
  .demo-cart-big-img { height: 22vmin; }
  .demo-cart-item { width: 12vmin; height: 12vmin; }
  .demo-confirm-btn {
    padding: 3vmin 6vmin;
    font-size: max(4vmin, 15px);
    border-radius: 2vmin;
  }

  .demo-success { padding: 5vmin 4vmin; border-radius: 3vmin; }
  .success-icon { font-size: max(14vmin, 60px); }
  .success-message { font-size: max(5.4vmin, 20px); }
  .demo-score { font-size: max(4vmin, 15px); }
  .feature-item {
    font-size: max(3.4vmin, 14px);
    padding: 3vmin;
    border-radius: 2vmin;
  }
  .feature-icon { font-size: max(4.4vmin, 17px); }

  .tutorial-hint {
    font-size: max(3.4vmin, 13px);
    padding: 2.5vmin 3vmin;
    border-radius: 2vmin;
  }

  .tutorial-nav {
    flex-direction: column;
    gap: 2.5vmin;
    width: 100%;
  }
  .nav-btn {
    padding: 2.6vmin 4vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 2vmin;
    width: 80%;
    margin: 0 auto;
  }
  .start-btn {
    font-size: max(4vmin, 16px);
    padding: 2.6vmin 4vmin;
  }
}
</style>
