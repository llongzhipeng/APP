<template>
  <div class="duration-page">
    <div class="card">
      <div class="title-row">
        <div class="title-icon">⏱</div>
        <h2>{{ t('selectDuration') }}</h2>
      </div>

      <div class="options">
        <button
          v-for="opt in options"
          :key="opt.minutes"
          class="duration-btn"
          :class="{ selected: selected === opt.minutes }"
          @click="select(opt.minutes)"
        >
          <span class="dur-num">{{ opt.minutes }}</span>
          <span class="dur-unit">{{ t('durationUnit') }}</span>
          <div class="dur-desc">{{ opt.desc }}</div>
        </button>
      </div>

      <button
        class="start-btn"
        :class="{ ready: selected !== null }"
        :disabled="selected === null"
        @click="$emit('select', selected)"
      >
        {{ language === 'zh' ? '开始训练' : 'Start Training' }}
      </button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'DurationSelect',
  props: {
    language: { type: String, required: true },
  },
  emits: ['select'],
  data() {
    return { selected: null }
  },
  computed: {
    options() {
      const zh = this.language === 'zh'
      return [
        { minutes: 1, desc: zh ? '快速训练' : 'Quick' },
        { minutes: 3, desc: zh ? '标准训练' : 'Standard' },
        { minutes: 5, desc: zh ? '深度训练' : 'Extended' },
      ]
    },
  },
  methods: {
    t(key) { return t(this.language, key) },
    select(m) { this.selected = m },
  },
}
</script>

<style scoped>
.duration-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title-icon {
  font-size: 32px;
}
.title-row h2 {
  margin: 0;
  font-size: 26px;
  color: #333;
  font-weight: 800;
}

.options {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.duration-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  border: 3px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
  gap: 6px;
}
.duration-btn:hover {
  border-color: #5C6BC0;
  background: #f0f1fd;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(92,107,192,0.15);
}
.duration-btn.selected {
  border-color: #5C6BC0;
  background: #5C6BC0;
  box-shadow: 0 4px 16px rgba(92,107,192,0.3);
  transform: translateY(-3px);
}
.dur-num {
  font-size: 48px;
  font-weight: 900;
  color: #333;
  line-height: 1;
}
.duration-btn.selected .dur-num { color: #fff; }
.dur-unit {
  font-size: 16px;
  color: #666;
  font-weight: 600;
}
.duration-btn.selected .dur-unit { color: rgba(255,255,255,0.85); }
.dur-desc {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}
.duration-btn.selected .dur-desc { color: rgba(255,255,255,0.7); }

.start-btn {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 24px;
  font-size: 18px;
  font-weight: 700;
  background: #ddd;
  color: #999;
  cursor: not-allowed;
  transition: all 0.25s;
  letter-spacing: 0.5px;
}
.start-btn.ready {
  background: #4CAF50;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(76,175,80,0.3);
}
.start-btn.ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76,175,80,0.4);
}

</style>
