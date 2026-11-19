<template>
  <div class="duration">
    <div class="card">
      <h2>{{ t.duration }}</h2>
      <div class="options">
        <button
          v-for="opt in options"
          :key="opt.sec"
          class="dur-btn"
          :class="{ active: pending === opt.sec }"
          @click="pending = opt.sec"
        >
          <div class="dur-num">{{ opt.num }}</div>
          <div class="dur-label">{{ lang === 'zh' ? '分钟' : 'min' }}</div>
        </button>
      </div>
      <div class="actions">
        <button class="back-btn" @click="$emit('nav', 'home')">← {{ t.back }}</button>
        <button
          class="start-btn"
          :disabled="!pending"
          @click="pending && $emit('select', pending)"
        >{{ t.confirmStart }}</button>
      </div>
      <div v-if="!pending" class="hint">{{ t.pleaseSelectDuration }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DurationView',
  props: ['t', 'lang'],
  data() {
    return {
      pending: null,
      options: [
        { sec: 60, num: 1 },
        { sec: 180, num: 3 },
        { sec: 300, num: 5 }
      ]
    }
  }
}
</script>

<style scoped>
.duration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vmin;
  background: linear-gradient(135deg, #87ceeb 0%, #98d8e8 50%, #b8e6c9 100%);
}
.card {
  background: #fff;
  border-radius: 3vmin;
  padding: 5vmin 6vmin;
  max-width: 90vw;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.15);
  text-align: center;
}
h2 { color: #2c3e50; margin-bottom: 4vmin; font-size: 3.6vmin; }
.options {
  display: flex;
  gap: 3vmin;
  justify-content: center;
  margin-bottom: 4vmin;
  flex-wrap: wrap;
}
.dur-btn {
  width: 22vmin;
  height: 22vmin;
  border-radius: 3vmin;
  border: 0.4vmin solid transparent;
  background: #ecf0f1;
  color: #2c3e50;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 1vmin 2.5vmin rgba(0,0,0,0.08);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dur-btn:hover { transform: translateY(-0.6vmin); box-shadow: 0 1.6vmin 3.5vmin rgba(0,0,0,0.15); }
.dur-btn.active {
  background: linear-gradient(135deg, #6bc5f5, #4a90e2);
  color: #fff;
  border-color: #2c6ec5;
  box-shadow: 0 1.6vmin 3.5vmin rgba(74,144,226,0.45);
}
.dur-num { font-size: 6vmin; line-height: 1; }
.dur-label { font-size: 2.2vmin; margin-top: 0.6vmin; }
.actions {
  display: flex;
  gap: 3vmin;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.back-btn {
  padding: 1.6vmin 4vmin;
  border: none;
  background: #ecf0f1;
  color: #2c3e50;
  border-radius: 999px;
  font-size: 2.4vmin;
  cursor: pointer;
  font-weight: 600;
  min-width: 18vmin;
}
.back-btn:hover { background: #dfe6e9; }
.start-btn {
  padding: 1.6vmin 4vmin;
  border: none;
  background: linear-gradient(135deg, #ff9a56, #ff6a3d);
  color: #fff;
  border-radius: 999px;
  font-size: 2.4vmin;
  cursor: pointer;
  font-weight: 700;
  min-width: 22vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(255,106,61,0.4);
  transition: all 0.15s;
}
.start-btn:hover:not(:disabled) { transform: translateY(-0.3vmin); box-shadow: 0 1.2vmin 2.5vmin rgba(255,106,61,0.55); }
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.hint {
  margin-top: 2vmin;
  font-size: 1.9vmin;
  color: #95a5a6;
}

@media (orientation: portrait) {
  .duration {
    padding: 3vmin;
    padding-top: calc(3vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
  }
  .card {
    padding: 5vmin 4vmin;
    width: 90vw;
    max-width: 90vw;
    border-radius: 3.6vmin;
  }
  h2 { font-size: max(5vmin, 20px); margin-bottom: 5vmin; }
  .options {
    flex-direction: column;
    align-items: stretch;
    gap: 2.4vmin;
    margin-bottom: 5vmin;
  }
  .dur-btn {
    width: 100%;
    height: auto;
    padding: 3.5vmin 2vmin;
    flex-direction: row;
    gap: 3vmin;
    border-radius: 2.6vmin;
  }
  .dur-num { font-size: max(8vmin, 32px); }
  .dur-label { font-size: max(3.6vmin, 15px); margin-top: 0; }
  .actions { gap: 2.4vmin; }
  .back-btn, .start-btn {
    font-size: max(3.8vmin, 16px);
    padding: 2.4vmin 4vmin;
    min-width: 36vw;
    border-radius: 2.8vmin;
  }
  .hint { font-size: max(3vmin, 12px); }
}
</style>
