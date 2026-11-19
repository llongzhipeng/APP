<template>
  <div class="duration-page">
    <div class="duration-center">
      <div class="duration-icon">⏱️</div>
      <h2 class="duration-title">{{ t.selectDuration }}</h2>

      <div class="duration-options">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="duration-btn"
          :class="{ selected: selected === opt.value }"
          @click="selected = opt.value"
        >
          <span class="dur-num">{{ opt.num }}</span>
          <span class="dur-unit">{{ opt.unit }}</span>
        </button>
      </div>

      <button class="confirm-btn" @click="confirm">
        {{ t.startGame2 }} ▶
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game6DurationSelect'
};
</script>

<script setup>
import { ref, computed } from '@vue/composition-api'

const props = defineProps({ t: Object })
const emit = defineEmits(['selected'])

const selected = ref(60)

const options = computed(() => {
  const isZh = props.t.langToggle === 'EN'
  return [
    { value: 60, num: '1', unit: isZh ? '分钟' : 'Min' },
    { value: 180, num: '3', unit: isZh ? '分钟' : 'Min' },
    { value: 300, num: '5', unit: isZh ? '分钟' : 'Min' },
  ]
})

function confirm() {
  emit('selected', selected.value)
}
</script>

<style scoped>
.duration-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.duration-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
}

.duration-icon {
  font-size: 60px;
  animation: spin 4s linear infinite;
}
@keyframes spin {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.duration-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.duration-options {
  display: flex;
  gap: 20px;
}

.duration-btn {
  width: 110px;
  height: 110px;
  border-radius: 16px;
  border: none;
  background: white;
  color: #333;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.duration-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
.duration-btn.selected {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.dur-num {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
}
.dur-unit {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
}

.confirm-btn {
  padding: 15px 60px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.confirm-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
</style>
