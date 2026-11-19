<template>
  <div class="main-menu">
    <div class="menu-container">
      <!-- 语言切换按钮 -->
      <div class="language-toggle">
        <button @click="toggleLanguage" class="lang-btn">
          {{ currentLang === 'zh' ? 'EN' : '中文' }}
        </button>
      </div>

      <!-- 标题 -->
      <div class="title-section">
        <h1 class="title">{{ t('menu.title') }}</h1>
        <p class="subtitle">{{ t('menu.subtitle') }}</p>
      </div>

      <!-- 选择训练时长 -->
      <div class="duration-section">
        <h2 class="section-title">{{ t('menu.selectDuration') }}</h2>
        <div class="duration-options">
          <button
            v-for="option in durationOptions"
            :key="option.value"
            @click="selectDuration(option.value)"
            :class="['duration-btn', { active: selectedDuration === option.value }]"
          >
            {{ currentLang === 'zh' ? option.label : option.labelEn }}
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button @click="startGame" :disabled="!selectedDuration" class="btn btn-primary">
          {{ t('menu.startGame') }}
        </button>
        <button @click="showRules" class="btn btn-secondary">
          {{ t('menu.viewRules') }}
        </button>
        <button @click="showRecords" class="btn btn-secondary">
          {{ t('menu.viewRecords') }}
        </button>
      </div>
    </div>

    <!-- 游戏规则弹窗 -->
    <div v-if="rulesVisible" class="modal-overlay" @click="rulesVisible = false">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ t('rules.title') }}</h2>
        <div class="rules-list">
          <p v-for="i in 7" :key="i" class="rule-item">
            {{ i }}. {{ t(`rules.rule${i}`) }}
          </p>
        </div>
        <button @click="rulesVisible = false" class="btn btn-primary">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';
import { DURATION_OPTIONS } from '../config/difficulty.js';
import { t, getCurrentLanguage, setLanguage } from '../i18n/index.js';

export default {
  name: 'MainMenu',
  emits: ['start-game', 'view-records'],
  setup(_props, { emit }) {
    const selectedDuration = ref(null);
    const rulesVisible = ref(false);
    const currentLang = ref(getCurrentLanguage());

    const durationOptions = DURATION_OPTIONS;

    const selectDuration = (value) => {
      selectedDuration.value = value;
    };

    const startGame = () => {
      if (selectedDuration.value) {
        emit('start-game', selectedDuration.value);
      }
    };

    const showRules = () => {
      rulesVisible.value = true;
    };

    const showRecords = () => {
      emit('view-records');
    };

    const toggleLanguage = () => {
      const newLang = currentLang.value === 'zh' ? 'en' : 'zh';
      setLanguage(newLang);
      currentLang.value = newLang;
    };

    return {
      selectedDuration,
      rulesVisible,
      currentLang,
      durationOptions,
      selectDuration,
      startGame,
      showRules,
      showRecords,
      toggleLanguage,
      t
    };
  }
};
</script>

<style scoped>
.main-menu {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.menu-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.language-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
}

.lang-btn {
  padding: 8px 16px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  color: #667eea;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.lang-btn:hover {
  background: #667eea;
  color: white;
}

.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #667eea;
  margin: 0 0 10px 0;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.duration-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.duration-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.duration-btn {
  flex: 1;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: white;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.duration-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.duration-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f0f4ff;
  transform: translateY(-2px);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 28px;
  color: #667eea;
  margin-bottom: 20px;
  text-align: center;
}

.rules-list {
  margin-bottom: 30px;
}

.rule-item {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 15px;
  padding-left: 10px;
}

@media (max-width: 768px) {
  .menu-container {
    padding: 30px 20px;
  }

  .title {
    font-size: 36px;
  }

  .duration-options {
    flex-direction: column;
  }
}
</style>
