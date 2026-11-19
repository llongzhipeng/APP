<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ T.chooseTime }}</h2>
      <div class="options">
        <button
          v-for="opt in opts"
          :key="opt.val"
          class="opt-btn"
          :class="{active: selected===opt.val}"
          @click="selected=opt.val"
        >
          {{ T[opt.key] }}
        </button>
      </div>
      <button class="btn-start" :disabled="!selected" @click="onStart">{{ T.startNow }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  props: ['lang'],
  data() { return {
    opts: [{val:1,key:'min1'},{val:3,key:'min3'},{val:5,key:'min5'}],
    selected: null,
  } },
  computed: { T() { return t[this.lang] } },
  methods: {
    onStart() { if (this.selected) this.$emit('choose', this.selected) },
  },
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #16213e; border-radius: 2vmin; padding: 4vmin 5vmin;
  max-width: 92vw; max-height: 92vh; overflow-y: auto;
  display: flex; flex-direction: column; align-items: center; gap: 3vmin;
}
h2 { font-size: clamp(20px, 3vmin, 32px); color: #7eb8f7; text-align: center; }
.options { display: flex; gap: 2.5vmin; flex-wrap: wrap; justify-content: center; }
.opt-btn {
  background: #1e2f5a; color: #c5d8f5;
  padding: clamp(14px, 2.5vmin, 28px) clamp(24px, 5vmin, 54px);
  border-radius: 1.5vmin;
  font-size: clamp(18px, 2.8vmin, 30px); font-weight: 600;
  border: 2px solid #2a4080; transition: all .2s;
  min-width: 22vmin;
}
.opt-btn:hover { background: #2a4080; color: #fff; transform: translateY(-2px); }
.opt-btn.active { background: #3a7bd5; color: #fff; border-color: #7eb8f7; box-shadow: 0 0 2vmin rgba(126,184,247,.4); }
.btn-start {
  background: #27ae60; color: #fff;
  padding: clamp(12px, 1.8vmin, 22px) clamp(32px, 6vmin, 64px);
  border-radius: 1.5vmin;
  font-size: clamp(16px, 2.6vmin, 28px); font-weight: 700; letter-spacing: .05em;
  transition: all .2s;
}
.btn-start:hover:not(:disabled) { background: #2ecc71; transform: translateY(-2px); }
.btn-start:disabled { background: #2a4a3a; color: #6a8a7a; cursor: not-allowed; }

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .modal {
    width: 92vw; max-width: 92vw;
    padding: 6vw 5vw;
    border-radius: 4vw;
    gap: 5vw;
  }
  h2 { font-size: max(6vw, 22px); }
  .options { flex-direction: column; gap: 3vw; width: 100%; }
  .opt-btn {
    width: 100%;
    padding: max(4vw, 16px) 0;
    border-radius: 3vw;
    font-size: max(4.8vw, 18px);
    min-width: 0;
  }
  .btn-start {
    width: 100%;
    padding: max(4vw, 16px) 0;
    border-radius: 3vw;
    font-size: max(4.8vw, 18px);
  }
}
</style>
