<template>
  <div class="tutorial-page">
    <div class="tutorial-card">
      <div class="tutorial-header">
        <h2>{{ t('tutorialTitle') }}</h2>
        <button class="skip-btn" @click="$emit('done')">{{ t('skip') }}</button>
      </div>

      <div class="step-indicators">
        <span
          v-for="i in 4"
          :key="i"
          class="step-dot"
          :class="{ active: step === i }"
        ></span>
      </div>

      <!-- Step 1 -->
      <div v-if="step === 1" class="step-content">
        <h3 class="step-title">{{ t('tutorial1Title') }}</h3>
        <p class="step-text">{{ t('tutorial1') }}</p>
      </div>

      <!-- Step 2 -->
      <div v-else-if="step === 2" class="step-content">
        <h3 class="step-title">{{ t('tutorial2Title') }}</h3>
        <p class="step-text">{{ t('tutorial2') }}</p>
      </div>

      <!-- Step 3: visual example -->
      <div v-else-if="step === 3" class="step-content">
        <h3 class="step-title">{{ t('tutorial3Title') }}</h3>
        <p class="step-text">{{ t('tutorial3Desc') }}</p>
        <div class="example-box">
          <div class="example-word" style="color:#64B5F6">
            {{ lang === 'zh' ? '红' : 'Red' }}
          </div>
          <div class="example-options">
            <div
              v-for="c in exampleColors"
              :key="c.key"
              class="ex-btn"
              :style="{ background: c.hex }"
              :class="{ highlighted: c.key === 'blue' }"
            >
              {{ lang === 'zh' ? c.zh : c.en }}
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4 -->
      <div v-else-if="step === 4" class="step-content">
        <h3 class="step-title">{{ t('tutorial4Title') }}</h3>
        <p class="step-text">{{ t('tutorial4') }}</p>
      </div>

      <div class="tutorial-footer">
        <button class="nav-btn" :class="{ invisible: step === 1 }" @click="prev">
          {{ t('prev') }}
        </button>
        <span class="step-label">{{ step }} / 4</span>
        <button class="nav-btn primary" @click="next">
          {{ step === 4 ? t('finish') : t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { translations } from '../i18n.js'

export default {
  name: 'TutorialModal',
  props: { lang: String },
  emits: ['done'],
  setup(props, { emit }) {
    const step = ref(1)
    const t = (key) => translations[props.lang][key] || key

    const exampleColors = [
      { key: 'red',    hex: '#E57373', zh: '红色', en: 'Red'    },
      { key: 'green',  hex: '#81C784', zh: '绿色', en: 'Green'  },
      { key: 'blue',   hex: '#64B5F6', zh: '蓝色', en: 'Blue'   },
      { key: 'yellow', hex: '#FFD54F', zh: '黄色', en: 'Yellow' },
    ]

    const next = () => {
      if (step.value < 4) { step.value++ } else { emit('done') }
    }
    const prev = () => { if (step.value > 1) step.value-- }

    return { step, t, exampleColors, next, prev }
  },
}
</script>

<style scoped>
.tutorial-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 4vmin 5vmin;
  width: 88%;
  max-width: 560px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 3vmin;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tutorial-header h2 { font-size: 3vmin; color: #333; }

.skip-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  font-size: 1.8vmin;
  padding: 0.5vmin 1.5vmin;
  border-radius: 6px;
  cursor: pointer;
}
.skip-btn:hover { color: #333; border-color: #999; }

.step-indicators {
  display: flex;
  gap: 1.2vmin;
  justify-content: center;
}
.step-dot {
  width: 1.5vmin;
  height: 1.5vmin;
  border-radius: 50%;
  background: #e0e0e0;
  transition: background 0.3s;
}
.step-dot.active { background: #4A90E2; }

.step-content { min-height: 20vmin; }
.step-title {
  font-size: 2.5vmin;
  font-weight: 600;
  color: #4A90E2;
  margin-bottom: 2vmin;
}
.step-text {
  font-size: 2vmin;
  color: #555;
  line-height: 1.7;
}

.example-box {
  margin-top: 2vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vmin;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 3vmin 2vmin;
}
.example-word {
  font-size: 10vmin;
  font-weight: 700;
}
.example-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5vmin;
  width: 100%;
}
.ex-btn {
  padding: 1.2vmin 0;
  text-align: center;
  border-radius: 6px;
  font-size: 2vmin;
  font-weight: 600;
  color: #fff;
  opacity: 0.5;
  transition: opacity 0.2s, box-shadow 0.2s;
}
.ex-btn.highlighted {
  opacity: 1;
  box-shadow: 0 0 0 3px #4A90E2;
}

.tutorial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.step-label {
  font-size: 1.8vmin;
  color: #999;
}
.nav-btn {
  padding: 1.2vmin 3.5vmin;
  font-size: 2vmin;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-btn:hover { background: #e9e9e9; }
.nav-btn.primary {
  background: #4A90E2;
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}
.nav-btn.primary:hover {
  background: #357abd;
}
.nav-btn.invisible { visibility: hidden; }
</style>
