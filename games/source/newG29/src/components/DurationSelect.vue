<template>
  <div class="modal-mask" @click.self="$emit('back')">
    <div class="modal">
      <div class="modal-title">{{ t('chooseDuration') }}</div>
      <div class="options">
        <button class="opt" v-for="o in options" :key="o.v"
          :class="{ active: selected === o.v }"
          @click="selected = o.v">
          <div class="opt-num">{{ o.n }}</div>
          <div class="opt-unit">{{ t('minutes') }}</div>
        </button>
      </div>
      <div class="btn-row">
        <button class="btn ghost" @click="$emit('back')">{{ t('back') }}</button>
        <button class="btn primary" :disabled="!selected" @click="onStart">{{ t('startTraining') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import { t } from '../i18n'
export default {
  name: 'DurationSelect',
  data () {
    return {
      selected: 60,
      options: [{ n: 1, v: 60 }, { n: 3, v: 180 }, { n: 5, v: 300 }],
    }
  },
  methods: {
    t,
    onStart () { if (this.selected) this.$emit('choose', this.selected) },
  },
}
</script>
<style scoped>
@import './modal.css';
.options { display: flex; gap: 2vmin; justify-content: center; margin-top: 1vh; flex-wrap: nowrap; }
.opt {
  width: 14vmin; height: 16vmin; min-width: 90px; min-height: 100px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6vmin;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e6efff;
  border-radius: 1vmin;
  cursor: pointer; transition: 0.15s;
  font-family: inherit;
}
.opt:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
}
.opt.active {
  border-color: #3aa8d8;
  background: rgba(58, 168, 216, 0.15);
}
.opt.active .opt-num { color: #6ec8ea; }
.opt-num { font-size: 4.5vmin; font-weight: 600; color: #e6efff; line-height: 1; }
.opt-unit { font-size: 1.5vmin; color: rgba(200, 220, 240, 0.65); letter-spacing: 0.1vmin; }
.btn-row { display: flex; justify-content: center; gap: 2vmin; margin-top: 4vh; }
.btn { display: inline-block; margin: 0; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
