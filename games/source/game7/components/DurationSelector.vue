<template>
  <div class="duration-page">
    <div class="duration-card">
      <h2 class="dur-title">{{ t('selectDuration') }}</h2>

      <div class="options">
        <button
          v-for="opt in options"
          :key="opt.secs"
          class="dur-btn"
          :class="{ selected: selected === opt.secs }"
          @click="selected = opt.secs"
        >
          <span class="dur-label">{{ t(opt.key) }}</span>
          <span class="dur-desc">{{ opt.secs }}s</span>
        </button>
      </div>

      <button class="start-btn" @click="$emit('select', selected)">
        {{ t('startNow') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { translations } from '../i18n.js'

export default {
  name: 'DurationSelector',
  props: { lang: String },
  emits: ['select'],
  setup(props) {
    const t = (key) => translations[props.lang][key] || key
    const selected = ref(60)
    const options = [
      { key: 'min1', secs: 60  },
      { key: 'min3', secs: 180 },
      { key: 'min5', secs: 300 },
    ]
    return { t, selected, options }
  },
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

.duration-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 5vmin 6vmin;
  width: 85%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4vmin;
}

.dur-title {
  font-size: 3vmin;
  font-weight: 600;
  color: #333;
}

.options {
  display: flex;
  gap: 3vmin;
  width: 100%;
}

.dur-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vmin;
  padding: 3vmin 1vmin;
  background: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.dur-btn:hover {
  background: #e3f2fd;
  border-color: #4A90E2;
  color: #333;
}
.dur-btn.selected {
  background: #4A90E2;
  border-color: #357abd;
  color: #fff;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.dur-label {
  font-size: 2.8vmin;
  font-weight: 600;
}
.dur-desc {
  font-size: 1.5vmin;
  opacity: 0.7;
}

.start-btn {
  width: 60%;
  padding: 2vmin 0;
  font-size: 2.5vmin;
  font-weight: 600;
  background: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
  transition: all 0.2s;
}
.start-btn:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}
</style>
