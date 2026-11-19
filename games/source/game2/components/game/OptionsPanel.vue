<template>
  <div class="options-panel">
    <div class="options-title">
      <div v-if="requiredCount > 1" class="selection-hint">
        {{ t('selectCount') }}: {{ selectedAnswers.length }}/{{ requiredCount }}
      </div>
    </div>
    <div class="options-grid">
      <button
        v-for="optionId in options"
        :key="optionId"
        class="option-btn"
        :class="getOptionClass(optionId)"
        :disabled="answered || isOptionDisabled(optionId)"
        @click="selectOption(optionId)"
      >
        <img
          :src="getElementPath(optionId)"
          :alt="`Option ${optionId}`"
          class="option-image"
        />
        <div v-if="selectedAnswers.includes(optionId) && !answered" class="selected-mark">✓</div>
      </button>
    </div>
  </div>
</template>

<script>
import { getElementById } from '../../config/elements.js'

export default {
  name: 'OptionsPanel',
  inject: ['i18n'],
  props: {
    options: {
      type: Array,
      required: true
    },
    selectedAnswers: {
      type: Array,
      default: () => []
    },
    correctAnswers: {
      type: Array,
      default: () => []
    },
    requiredCount: {
      type: Number,
      default: 1
    },
    answered: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  },
  methods: {
    selectOption(optionId) {
      if (!this.answered && !this.selectedAnswers.includes(optionId)) {
        this.$emit('select', optionId)
      }
    },
    getOptionClass(optionId) {
      if (!this.answered) {
        // 答题中，已选择的显示为选中状态
        if (this.selectedAnswers.includes(optionId)) {
          return 'selected'
        }
        return ''
      }

      // 显示反馈
      if (this.correctAnswers.includes(optionId)) {
        return 'correct'
      }

      if (this.selectedAnswers.includes(optionId) && !this.correctAnswers.includes(optionId)) {
        return 'incorrect'
      }

      return 'disabled'
    },
    isOptionDisabled(optionId) {
      // 如果已经选择过，不能再次选择
      return this.selectedAnswers.includes(optionId)
    },
    getElementPath(id) {
      const element = getElementById(id)
      return element ? element.path : ''
    }
  }
}
</script>

<style scoped>
.options-panel {
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 30px;
}

.options-title {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-bottom: 25px;
  font-weight: 600;
  min-height: 30px;
}

.selection-hint {
  margin-top: 8px;
  font-size: 16px;
  color: #4CAF50;
  font-weight: 700;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.option-btn {
  position: relative;
  padding: 0;
  border: 3px solid #ddd;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  height: 140px;
  overflow: hidden;
}

.option-btn:hover:not(:disabled) {
  border-color: #4CAF50;
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-btn.selected {
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}

.option-btn.correct {
  border-color: #4CAF50;
  background-color: #e8f5e9;
}

.option-btn.incorrect {
  border-color: #F44336;
  background-color: #ffebee;
}

.option-btn.disabled {
  opacity: 0.5;
}

.option-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.selected-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background-color: #2196F3;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.5);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .options-panel {
    padding: 20px;
    position: static;
  }

  .options-title {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .selection-hint {
    font-size: 14px;
  }

  .options-grid {
    gap: 12px;
  }

  .option-btn {
    height: 100px;
  }

  .selected-mark {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .options-panel {
    padding: 15px;
  }

  .options-title {
    font-size: 14px;
    margin-bottom: 15px;
  }

  .selection-hint {
    font-size: 13px;
  }

  .options-grid {
    gap: 10px;
  }

  .option-btn {
    height: 80px;
    border-width: 2px;
  }

  .selected-mark {
    width: 24px;
    height: 24px;
    font-size: 16px;
    top: 6px;
    right: 6px;
  }
}
</style>
