<template>
  <div class="duration-page">
    <div class="duration-card">
      <h2 class="dur-title">{{ t.selectDuration }}</h2>
      <div class="options">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="dur-btn"
          :class="{ selected: selected === opt.value }"
          @click="selected = opt.value"
        >
          <span class="dur-icon">{{ opt.icon }}</span>
          <span class="dur-label">{{ t[opt.key] }}</span>
        </button>
      </div>
      <button class="btn btn-confirm" @click="confirm" :disabled="!selected">
        {{ t.confirm }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'

export default {
  name: 'DurationSelect',
  props: { t: Object },
  setup(props, { emit }) {
    const selected = ref(60)
    const options = [
      { value: 60,  key: 'min1', icon: '⏱' },
      { value: 180, key: 'min3', icon: '⏳' },
      { value: 300, key: 'min5', icon: '🕐' },
    ]
    function confirm() {
      if (selected.value) emit('confirm', selected.value)
    }
    return { selected, options, confirm }
  }
}
</script>

<style scoped>
.duration-page {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.duration-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 1.2em;
  padding: 4vh 4vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vh;
  width: clamp(240px, 60vmin, 480px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.dur-title {
  font-size: clamp(16px, 3vmin, 28px);
  color: #667eea;
  text-align: center;
  font-weight: 700;
}

.options {
  display: flex;
  gap: 2vmin;
  flex-wrap: wrap;
  justify-content: center;
}

.dur-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  width: clamp(80px, 16vmin, 140px);
  padding: 1.5em 1em;
  border-radius: 1em;
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  color: #333;
  font-family: inherit;
  transition: all 0.2s;
  cursor: pointer;
}
.dur-btn:hover {
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}
.dur-btn.selected {
  background: #667eea;
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.dur-icon {
  font-size: clamp(22px, 4vmin, 40px);
}
.dur-label {
  font-size: clamp(12px, 2vmin, 18px);
  font-weight: 600;
}

.btn-confirm {
  padding: 0.8em 3em;
  border-radius: 0.7em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: clamp(13px, 2.2vmin, 20px);
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
.btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
