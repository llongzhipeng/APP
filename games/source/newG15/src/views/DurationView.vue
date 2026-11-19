<template>
  <div class="duration-view">
    <div class="content">
      <h2 class="title">{{ t.duration.title }}</h2>
      <div class="options">
        <button
          class="opt"
          :class="{ selected: selected === 60 }"
          @click="selected = 60"
        >
          <div class="opt-num">1</div>
          <div class="opt-label">{{ t.duration.m1 }}</div>
        </button>
        <button
          class="opt"
          :class="{ selected: selected === 180 }"
          @click="selected = 180"
        >
          <div class="opt-num">3</div>
          <div class="opt-label">{{ t.duration.m3 }}</div>
        </button>
        <button
          class="opt"
          :class="{ selected: selected === 300 }"
          @click="selected = 300"
        >
          <div class="opt-num">5</div>
          <div class="opt-label">{{ t.duration.m5 }}</div>
        </button>
      </div>
      <div class="actions">
        <button class="back-btn" @click="$emit('go', 'home')">{{ t.duration.back }}</button>
        <button
          class="start-btn"
          :disabled="!selected"
          @click="onStart"
        >{{ t.duration.start }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DurationView',
  props: { t: { type: Object, required: true } },
  data() {
    return { selected: null }
  },
  methods: {
    onStart() {
      if (!this.selected) return
      this.$emit('choose', this.selected)
    }
  }
}
</script>

<style scoped>
.duration-view {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.content { text-align: center; color: #fff; padding: calc(var(--u) * 2); }
.title {
  font-size: calc(var(--u) * 3);
  margin-bottom: calc(var(--u) * 3);
  text-shadow: 0 3px 10px rgba(0,0,0,0.25);
}
.options {
  display: flex;
  gap: calc(var(--u) * 2.5);
  margin-bottom: calc(var(--u) * 3);
  justify-content: center;
}
.opt {
  width: calc(var(--u) * 12);
  height: calc(var(--u) * 12);
  border-radius: calc(var(--u) * 1.2);
  background: rgba(255,255,255,0.95);
  color: #333;
  border: 4px solid transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--u) * 0.6);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  transition: transform .18s, border-color .18s, box-shadow .18s;
}
.opt:hover { transform: translateY(-4px); }
.opt.selected {
  border-color: #ffd54f;
  box-shadow: 0 8px 26px rgba(255,213,79,0.45), 0 0 0 4px rgba(255,213,79,0.2);
  transform: translateY(-4px);
}
.opt-num { font-size: calc(var(--u) * 4.5); font-weight: 700; color: #667eea; }
.opt-label { font-size: calc(var(--u) * 1.4); color: #555; }

.actions {
  display: flex;
  justify-content: center;
  gap: calc(var(--u) * 2);
}
.back-btn,
.start-btn {
  padding: calc(var(--u) * 1.6) calc(var(--u) * 4);
  font-size: calc(var(--u) * 2);
  font-weight: 700;
  min-width: calc(var(--u) * 14);
  border-radius: calc(var(--u) * 0.8);
  cursor: pointer;
  transition: transform .15s, opacity .15s, box-shadow .15s;
}
.back-btn {
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 3px solid #fff;
}
.start-btn {
  background: #ffd54f;
  color: #4a3800;
  border: 3px solid #ffd54f;
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
}
.start-btn:hover:not(:disabled) { transform: translateY(-2px); }
.start-btn:disabled {
  background: rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.5);
  border-color: rgba(255,255,255,0.35);
  cursor: not-allowed;
  box-shadow: none;
}

@media (orientation: portrait) {
  .content {
    padding: 5vw;
    padding-top: calc(5vw + env(safe-area-inset-top));
    padding-bottom: calc(5vw + env(safe-area-inset-bottom));
    width: 100%;
  }
  .title { font-size: max(6vmin, 22px); margin-bottom: 5vh; }
  .options {
    flex-direction: column;
    gap: 3vmin;
    margin-bottom: 5vh;
    align-items: center;
  }
  .opt {
    width: 80%;
    height: auto;
    flex-direction: row;
    justify-content: center;
    gap: 4vmin;
    padding: 3vmin 4vmin;
    border-radius: 3vmin;
  }
  .opt-num { font-size: max(8vmin, 32px); }
  .opt-label { font-size: max(3.6vmin, 15px); }
  .actions { gap: 4vmin; }
  .back-btn, .start-btn {
    padding: 3.5vmin 6vmin;
    font-size: max(4.5vmin, 18px);
    border-radius: 2.5vmin;
    min-width: 36vw;
  }
}
</style>
