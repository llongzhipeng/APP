<template>
  <div class="duration-page">
    <button class="back-btn" @click="$emit('back')">{{ t('back') }}</button>
    <div class="title">{{ t('selectDuration') }}</div>
    <div class="options">
      <button
        v-for="d in durations"
        :key="d.sec"
        class="d-btn"
        :class="{ active: selected === d.sec }"
        @click="selected = d.sec"
      >
        <div class="num">{{ d.min }}</div>
        <div class="unit">{{ t('minute1') }}</div>
      </button>
    </div>
    <div class="action-row">
      <button
        class="action-btn primary"
        :disabled="!selected"
        @click="$emit('select', selected)"
      >{{ t('startGame') }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js';
export default {
  name: 'DurationSelect',
  props: ['lang'],
  data() { return {
    selected: null,
    durations: [{ sec: 60, min: 1 }, { sec: 180, min: 3 }, { sec: 300, min: 5 }],
  }; },
  methods: { t(k, p) { return t(this.lang, k, p); } },
};
</script>

<style scoped>
.duration-page {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  padding: 4vmin;
  position: relative;
}
.back-btn {
  position: absolute; top: 3vmin; left: 3vmin;
  padding: 1.2vmin 2.5vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
}
.title {
  font-size: 4.5vmin; font-weight: 700;
  color: #7a3a1e; margin-bottom: 6vmin;
  letter-spacing: 0.3vmin;
}
.options { display: flex; gap: 4vmin; margin-bottom: 7vmin; }
.d-btn {
  width: 22vmin; height: 22vmin;
  background: #fff;
  border: 0.4vmin solid #b08b4f;
  border-radius: 3vmin;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 0.8vmin 2vmin rgba(122,90,44,.15);
  color: #7a5a2c;
}
@media (hover: hover) {
  .d-btn:hover { transform: translateY(-1vmin); border-color: #d97742; }
}
.d-btn.active {
  background: linear-gradient(135deg, #d97742, #b04e1e);
  color: #fff; border-color: #a34418;
  transform: translateY(-1vmin);
  box-shadow: 0 1.2vmin 2.4vmin rgba(122,90,44,.28);
}
.d-btn .num { font-size: 8vmin; font-weight: 800; }
.d-btn .unit { font-size: 2.4vmin; font-weight: 600; margin-top: 1vmin; }

.action-row { display: flex; gap: 3vmin; }
.action-btn {
  padding: 1.8vmin 4.5vmin;
  font-size: 2.6vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  border-radius: 1.5vmin;
  color: #7a5a2c;
  cursor: pointer;
  font-weight: 600;
  transition: all .18s;
  min-width: 22vmin;
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.12);
}
.action-btn:disabled { opacity: .4; cursor: not-allowed; }
.action-btn.primary {
  background: linear-gradient(135deg, #d97742, #b04e1e);
  color: #fff; border-color: #a34418;
}
.action-btn.primary:hover:not(:disabled) { background: linear-gradient(135deg, #e28855, #bd5a24); }
</style>
