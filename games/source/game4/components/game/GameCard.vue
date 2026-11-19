<template>
  <div :class="['card', { selected: isSelected, disappearing: isDisappearing }]" @click="handleClick">
    <div class="card-inner">
      <span class="card-value">{{ card.value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameCard',
  props: {
    card: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isDisappearing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const handleClick = () => {
      if (!props.isDisappearing) {
        emit('select', props.card);
      }
    };

    return {
      handleClick
    };
  }
};
</script>

<style scoped>
.card {
  aspect-ratio: 1;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow:
    3px 3px 8px rgba(0, 0, 0, 0.1),
    -3px -3px 8px rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card:hover:not(.disappearing):not(.selected) {
  transform: scale(1.03);
  box-shadow:
    5px 5px 12px rgba(0, 0, 0, 0.15),
    -3px -3px 8px rgba(255, 255, 255, 0.8);
}

.card:active:not(.disappearing):not(.selected) {
  transform: scale(0.98);
}

.card.selected,
.card.selected:hover,
.card.selected:active {
  background: linear-gradient(145deg, #667eea, #764ba2);
  box-shadow:
    3px 3px 12px rgba(102, 126, 234, 0.4),
    -2px -2px 6px rgba(255, 255, 255, 0.1);
  /* 不使用向上位移和明显放大，避免在小尺寸屏上凸出到
     顶部目标值区域造成相互遮挡；用颜色/阴影提供选中反馈 */
  transform: scale(1.02);
}

.card.selected .card-value {
  color: white;
}

.card.disappearing {
  animation: disappear 0.4s ease-out forwards;
  pointer-events: none;
}

.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.card-value {
  font-size: clamp(20px, 4vw, 40px);
  font-weight: bold;
  color: #333;
  transition: color 0.3s;
}

@keyframes disappear {
  0% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.5);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card {
    border-radius: 10px;
  }
}
</style>
