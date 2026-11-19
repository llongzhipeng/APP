<template>
  <div class="duration">
    <div class="panel">
      <h2>{{ t.chooseDuration }}</h2>
      <div class="opts">
        <button
          v-for="opt in options"
          :key="opt.val"
          class="opt"
          :class="{ active: selected === opt.val }"
          @click="selected = opt.val"
        >{{ opt.label }}</button>
      </div>
      <div class="footer">
        <div class="hint">
          <span v-if="selected">{{ t.durationPicked }}: <b>{{ selectedLabel }}</b></span>
          <span v-else class="placeholder">&nbsp;</span>
        </div>
        <button class="start-btn" :disabled="!selected" @click="confirm">{{ t.startNow }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DurationSelect',
  props: { t: Object },
  data: () => ({ selected: null }),
  computed: {
    options() {
      return [
        { val: 60,  label: this.t.min1 },
        { val: 180, label: this.t.min3 },
        { val: 300, label: this.t.min5 },
      ]
    },
    selectedLabel() {
      const o = this.options.find(o => o.val === this.selected)
      return o ? o.label : ''
    },
  },
  methods: {
    confirm() { if (this.selected) this.$emit('choose', this.selected) },
  },
}
</script>

<style scoped>
.duration {
  position: fixed; inset: 0; background: rgba(0,0,0,.7);
  display: flex; align-items: center; justify-content: center; z-index: 150;
}
.panel {
  background: #1f1850; border: 1px solid #5d4cae; border-radius: 2vmin;
  padding: 4vmin 6vmin; color: #fff; text-align: center;
}
.panel h2 { font-size: 3vmin; margin-bottom: 3vmin; }
.opts { display: flex; gap: 2vmin; justify-content: center; margin-bottom: 3vmin; }
.opt {
  padding: 2.5vmin 4vmin; font-size: 2.4vmin;
  background: rgba(255,255,255,.1); color: #fff;
  border: 2px solid rgba(255,255,255,.3); border-radius: 1.5vmin; cursor: pointer;
  transition: transform .15s, background .15s, border-color .15s;
}
.opt:hover { transform: translateY(-.4vmin); background: rgba(255,255,255,.2); }
.opt.active {
  background: linear-gradient(180deg, #f6c04a, #c98212);
  color: #2a1a05; font-weight: bold; border-color: #f6c04a;
}
.footer { display: flex; flex-direction: column; align-items: center; gap: 2vmin; }
.hint { font-size: 2vmin; min-height: 2.5vmin; opacity: .9; }
.placeholder { visibility: hidden; }
.start-btn {
  padding: 2vmin 6vmin; font-size: 2.6vmin; font-weight: bold;
  background: linear-gradient(180deg, #f6c04a, #c98212);
  color: #2a1a05; border: none; border-radius: 1.5vmin; cursor: pointer;
  transition: transform .15s, opacity .15s;
}
.start-btn:hover:not(:disabled) { transform: translateY(-.4vmin); }
.start-btn:disabled { opacity: .4; cursor: not-allowed; }

@media (orientation: portrait) {
  .panel {
    width: 90vw; max-width: 90vw;
    padding: 6vmin 5vmin;
    padding-bottom: calc(6vmin + env(safe-area-inset-bottom));
  }
  .panel h2 { font-size: max(5vmin, 20px); margin-bottom: 4vmin; }
  .opts { flex-direction: column; gap: 2.5vmin; }
  .opt {
    width: 100%;
    padding: 16px 20px;
    font-size: max(4.5vmin, 18px);
    border-radius: 14px;
  }
  .hint { font-size: max(3.6vmin, 14px); }
  .start-btn {
    width: 100%;
    padding: 18px 24px;
    font-size: max(5vmin, 20px);
    border-radius: 14px;
  }
}
</style>
