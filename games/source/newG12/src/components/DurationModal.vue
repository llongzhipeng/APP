<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h2 class="modal-title">{{ t('durationTitle') }}</h2>
      <div class="options">
        <button class="dur-btn" :class="{ selected: selected === 1 }" @click="selected = 1">
          <span class="num">1</span>
          <span class="unit">{{ t('minute') }}</span>
        </button>
        <button class="dur-btn" :class="{ selected: selected === 3 }" @click="selected = 3">
          <span class="num">3</span>
          <span class="unit">{{ t('minute') }}</span>
        </button>
        <button class="dur-btn" :class="{ selected: selected === 5 }" @click="selected = 5">
          <span class="num">5</span>
          <span class="unit">{{ t('minute') }}</span>
        </button>
      </div>

      <button class="start-btn" :disabled="!selected" @click="onStart">
        {{ t('startGame') }}
      </button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'DurationModal',
  data() { return { selected: null } },
  methods: {
    t,
    onStart() {
      if (this.selected) this.$emit('choose', this.selected)
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  width: min(80vmin, 92vw);
  background: white;
  border-radius: 3vmin;
  padding: 6vmin 4vmin;
  display: flex; flex-direction: column; align-items: center; gap: 4vmin;
}
.modal-title {
  font-size: 4vmin;
  color: #4f46e5;
  text-align: center;
}
.options {
  display: flex;
  gap: 3vmin;
  flex-wrap: wrap;
  justify-content: center;
}
.dur-btn {
  width: 20vmin;
  height: 20vmin;
  border-radius: 3vmin;
  border: 0.3vmin solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1vmin;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s;
}
.dur-btn:hover {
  transform: translateY(-1vmin);
  border-color: #6366f1;
  box-shadow: 0 1.5vmin 3vmin rgba(99,102,241,0.2);
}
.dur-btn.selected {
  border-color: #6366f1;
  background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
  box-shadow: 0 1.5vmin 3vmin rgba(99,102,241,0.25);
}
.num {
  font-size: 8vmin;
  font-weight: bold;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.unit {
  font-size: 2.4vmin;
  color: #64748b;
}
.start-btn {
  padding: 1.8vmin 6vmin;
  border-radius: 3.5vmin;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  font-size: 2.8vmin;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  box-shadow: 0 1vmin 3vmin rgba(99,102,241,0.3);
}
.start-btn:hover:not(:disabled) {
  transform: translateY(-0.4vmin);
  box-shadow: 0 1.5vmin 3.5vmin rgba(99,102,241,0.4);
}
.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .modal {
    width: 92vw;
    padding: 8vmin 5vmin calc(6vmin + env(safe-area-inset-bottom));
    border-radius: 4vmin;
    gap: 5vmin;
  }
  .modal-title { font-size: max(5.5vmin, 20px); }
  .options { gap: 4vmin; }
  .dur-btn {
    width: 26vmin;
    height: 26vmin;
    border-radius: 4vmin;
  }
  .num { font-size: max(10vmin, 40px); }
  .unit { font-size: max(3.4vmin, 14px); }
  .start-btn {
    width: 80%;
    padding: 3vmin 6vmin;
    font-size: max(4.2vmin, 18px);
    border-radius: 5vmin;
  }
}
</style>
