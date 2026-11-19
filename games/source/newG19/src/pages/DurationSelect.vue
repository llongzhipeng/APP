<template>
  <div class="duration-page">
    <div class="title">{{ t('selectDuration') }}</div>
    <div class="options">
      <button
        class="d-btn"
        :class="{ active: selected === 60 }"
        @click="selected = 60"
      >
        <div class="num">1</div>
        <div class="unit">{{ t('minute1') }}</div>
      </button>
      <button
        class="d-btn"
        :class="{ active: selected === 180 }"
        @click="selected = 180"
      >
        <div class="num">3</div>
        <div class="unit">{{ t('minute3') }}</div>
      </button>
      <button
        class="d-btn"
        :class="{ active: selected === 300 }"
        @click="selected = 300"
      >
        <div class="num">5</div>
        <div class="unit">{{ t('minute5') }}</div>
      </button>
    </div>

    <div class="action-row">
      <button class="action-btn" @click="$emit('back')">{{ t('back') }}</button>
      <button
        class="action-btn primary"
        :disabled="!selected"
        @click="$emit('select', selected)"
      >{{ t('startGame') }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'
export default {
  name: 'DurationSelect',
  props: ['lang'],
  data() {
    return { selected: null }
  },
  methods: {
    t(k, p) { return t(this.lang, k, p) }
  }
}
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
  .d-btn:hover {
    transform: translateY(-1vmin);
    border-color: #d97742;
  }
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
@media (hover: hover) {
  .action-btn:hover:not(:disabled) {
    transform: translateY(-0.3vmin);
    box-shadow: 0 0.6vmin 1.6vmin rgba(122,90,44,.22);
  }
}
.action-btn:disabled { opacity: .4; cursor: not-allowed; }
.action-btn.primary {
  background: linear-gradient(135deg, #d97742, #b04e1e);
  color: #fff; border-color: #a34418;
}
.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #e28855, #bd5a24);
}

@media (orientation: portrait) {
  .duration-page {
    padding: calc(4vmin + env(safe-area-inset-top)) 6vw calc(4vmin + env(safe-area-inset-bottom));
  }
  .title { font-size: max(6vmin, 20px); margin-bottom: 8vmin; letter-spacing: 0.2vmin; }
  .options {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3vmin;
    margin-bottom: 8vmin;
    width: 80vw;
  }
  .d-btn {
    width: 100%; height: auto;
    flex-direction: row;
    gap: 4vmin;
    padding: 4vmin 5vmin;
    border-radius: 3vmin;
    border-width: 0.5vmin;
  }
  .d-btn .num { font-size: max(10vmin, 36px); }
  .d-btn .unit { font-size: max(4vmin, 16px); margin-top: 0; }
  .action-row { flex-direction: row; gap: 3vw; width: 82vw; justify-content: space-between; }
  .action-btn {
    flex: 1;
    padding: 3vmin 3vmin;
    font-size: max(4.2vmin, 16px);
    min-width: 0;
    border-radius: 2.5vmin;
    border-width: 0.4vmin;
  }
}
</style>
