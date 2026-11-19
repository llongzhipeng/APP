<template>
  <div class="start-screen">
    <div class="start-container">
      <h1 class="game-title">{{ t('appName') }}</h1>

      <div class="duration-section">
        <h2>{{ t('selectDuration') }}</h2>
        <div class="duration-options">
          <button
            v-for="option in durationOptions"
            :key="option.value"
            class="duration-btn"
            :class="{ active: selectedDuration === option.value }"
            @click="selectedDuration = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <button class="start-btn" @click="showTutorial">
        {{ t('startTraining') }}
      </button>

      <div class="action-buttons">
        <button class="action-btn" @click="viewRecords">
          {{ t('viewRecords') }}
        </button>
        <button class="action-btn" @click="viewRules">
          {{ t('viewRules') }}
        </button>
      </div>
    </div>

    <TutorialModal
      :show="isTutorialVisible"
      @close="isTutorialVisible = false"
      @start="startGame"
    />
  </div>
</template>

<script>
import TutorialModal from './TutorialModal.vue'

export default {
  name: 'StartScreen',
  inject: ['i18n'],
  components: {
    TutorialModal
  },
  data() {
    return {
      selectedDuration: 60,
      isTutorialVisible: false
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    },
    durationOptions() {
      return [
        { value: 60, label: this.t('duration1Min') },
        { value: 180, label: this.t('duration3Min') },
        { value: 300, label: this.t('duration5Min') }
      ]
    }
  },
  methods: {
    showTutorial() {
      this.isTutorialVisible = true
    },
    startGame() {
      this.isTutorialVisible = false
      this.$emit('start', this.selectedDuration)
    },
    viewRecords() {
      this.$emit('view-records')
    },
    viewRules() {
      this.$emit('view-rules')
    }
  }
}
</script>

<style scoped>
.start-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.start-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.game-title {
  font-size: 48px;
  color: #333;
  margin-bottom: 60px;
  font-weight: 700;
}

.duration-section {
  margin-bottom: 60px;
}

.duration-section h2 {
  font-size: 24px;
  color: #666;
  margin-bottom: 30px;
  font-weight: 500;
}

.duration-options {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.duration-btn {
  flex: 1;
  padding: 20px 30px;
  font-size: 18px;
  border: 2px solid #ddd;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.duration-btn:hover {
  border-color: #4CAF50;
  background-color: #f0f9f1;
}

.duration-btn.active {
  background-color: #4CAF50;
  color: #fff;
  border-color: #4CAF50;
  transform: scale(1.05);
}

.start-btn {
  padding: 18px 60px;
  font-size: 24px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);
}

.start-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.action-btn {
  padding: 12px 30px;
  font-size: 16px;
  background-color: #fff;
  color: #4CAF50;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: #4CAF50;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.action-btn:active {
  transform: translateY(0);
}
</style>
