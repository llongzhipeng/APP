<template>
  <div class="image-display">
    <div v-if="displayTimeLeft > 0" class="display-header">
      <div class="countdown-badge">
        <span class="countdown-label">{{ t('memorizeTime') }}</span>
        <span class="countdown-number">{{ displayTimeLeft }}s</span>
      </div>
    </div>

    <div class="image-grid">
      <div
        v-for="elementId in displayElements"
        :key="elementId"
        class="image-item"
      >
        <img
          :src="getElementPath(elementId)"
          :alt="`Element ${elementId}`"
          class="element-image"
          @error="handleImageError"
        />
      </div>
    </div>

    <div v-if="mode === 'missing'" class="missing-hint">
      {{ t('question') }}
    </div>
  </div>
</template>

<script>
import { getElementById } from '../../config/elements.js'

export default {
  name: 'ImageDisplay',
  inject: ['i18n'],
  props: {
    elements: {
      type: Array,
      required: true
    },
    removedElements: {
      type: Array,
      default: () => []
    },
    mode: {
      type: String,
      default: 'full', // 'full' | 'missing'
      validator: value => ['full', 'missing'].includes(value)
    },
    displayTimeLeft: {
      type: Number,
      default: 0
    }
  },
  computed: {
    t() {
      return key => this.i18n.t(key)
    },
    displayElements() {
      if (this.mode === 'full') {
        return this.elements
      }
      // 缺失模式：过滤掉被移除的元素
      return this.elements.filter(
        id => !this.removedElements.includes(id)
      )
    }
  },
  methods: {
    getElement(id) {
      return getElementById(id)
    },
    getElementPath(id) {
      const element = getElementById(id)
      return element ? element.path : ''
    },
    handleImageError(event) {
      console.error('Image load failed:', event.target.src)
      // 可以设置一个默认的占位图
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
    }
  }
}
</script>

<style scoped>
.image-display {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.display-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  padding: 12px 24px;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  animation: pulse-badge 1s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  }
}

.countdown-label {
  font-size: 16px;
  font-weight: 500;
}

.countdown-number {
  font-size: 32px;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.image-item {
  width: 160px;
  height: 160px;
  position: relative;
}

.element-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  background: #f5f5f5;
}

.image-item:hover .element-image {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.missing-hint {
  text-align: center;
  font-size: 20px;
  color: #666;
  margin-top: 20px;
  font-weight: 500;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .image-display {
    padding: 15px;
    margin-bottom: 20px;
  }

  .display-header {
    margin-bottom: 15px;
  }

  .countdown-badge {
    padding: 10px 20px;
    gap: 10px;
  }

  .countdown-label {
    font-size: 14px;
  }

  .countdown-number {
    font-size: 24px;
  }

  .image-grid {
    gap: 12px;
    padding: 15px 10px;
  }

  .image-item {
    width: 110px;
    height: 110px;
  }

  .missing-hint {
    font-size: 16px;
    margin-top: 15px;
  }
}

@media (max-width: 480px) {
  .image-display {
    padding: 12px;
  }

  .countdown-badge {
    padding: 8px 16px;
  }

  .countdown-label {
    font-size: 12px;
  }

  .countdown-number {
    font-size: 20px;
  }

  .image-grid {
    gap: 10px;
    padding: 10px;
  }

  .image-item {
    width: 80px;
    height: 80px;
  }

  .missing-hint {
    font-size: 14px;
  }
}
</style>