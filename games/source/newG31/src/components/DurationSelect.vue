<template>
  <div class="duration">
    <div class="card">
      <h2>{{ t('selectDuration') }}</h2>
      <div class="options">
        <div v-for="opt in options" :key="opt.value"
             class="option"
             :class="{ selected: selected === opt.value }"
             @click="selected = opt.value">
          <div class="clock">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="#fff" stroke="#4dabf7" stroke-width="4"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ffd166" stroke-width="6"
                      stroke-dasharray="264" :stroke-dashoffset="264 - (264 * opt.value / 5)"
                      transform="rotate(-90 50 50)" stroke-linecap="round"/>
              <text x="50" y="58" text-anchor="middle" font-size="26" font-weight="800" fill="#2b3f6a">
                {{ opt.value }}
              </text>
            </svg>
          </div>
          <div class="label">{{ t(opt.key) }}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn ghost" @click="$emit('back')">← {{ t('back') }}</button>
        <button class="btn primary" @click="$emit('start', selected)">
          {{ t('startGame') }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'DurationSelect',
  props: { lang: String },
  data() {
    return {
      selected: 3,
      options: [
        { value: 1, key: 'min1' },
        { value: 3, key: 'min3' },
        { value: 5, key: 'min5' }
      ]
    }
  },
  methods: { t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.duration {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.card {
  background: rgba(255,255,255,0.95);
  border-radius: 28px;
  padding: 48px 60px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.3);
  max-width: 900px;
  width: 100%;
}
h2 {
  color: #2b3f6a;
  font-size: 32px;
  text-align: center;
  margin-bottom: 40px;
  font-weight: 800;
}
.options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}
.option {
  padding: 30px 20px;
  border-radius: 20px;
  background: linear-gradient(180deg, #f8faff, #e7f5ff);
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
}
.option:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.15);
}
.option.selected {
  border-color: #ffd166;
  background: linear-gradient(180deg, #fff9db, #ffec99);
  box-shadow: 0 14px 30px rgba(255, 209, 102, 0.4);
}
.clock { width: 120px; height: 120px; margin: 0 auto 16px; }
.label {
  font-size: 22px;
  font-weight: 700;
  color: #2b3f6a;
}
.actions {
  display: flex; justify-content: space-between;
}
.btn {
  padding: 16px 40px; border-radius: 14px; border: none;
  cursor: pointer; font-size: 18px; font-weight: 700;
  transition: all 0.2s;
}
.btn.ghost { background: #e9ecef; color: #495057; }
.btn.primary {
  background: linear-gradient(135deg, #ff6b6b, #ffd166);
  color: #fff;
  box-shadow: 0 8px 20px rgba(255,107,107,0.4);
}
.btn:hover { transform: translateY(-2px); }
</style>
