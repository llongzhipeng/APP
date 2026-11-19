<template>
  <div class="duration-page">
    <div class="duration-box">
      <h2 class="dur-title">{{ t.selectDuration }}</h2>
      <div class="dur-options">
        <button
          v-for="opt in options" :key="opt.val"
          class="dur-btn"
          :class="{ selected: selected === opt.val }"
          @click="selected = opt.val"
        >
          <span class="dur-icon">⏱</span>
          <span class="dur-label">{{ t[opt.key] }}</span>
        </button>
      </div>
      <button class="start-btn" :disabled="!selected" @click="$emit('selected', selected)">
        ▶ {{ t.startGame }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DurationSelect',
  props: { t: Object },
  emits: ['selected'],
  data() {
    return {
      selected: null,
      options: [
        { val: 60, key: 'min1' },
        { val: 180, key: 'min3' },
        { val: 300, key: 'min5' },
      ],
    }
  },
}
</script>

<style scoped>
.duration-page {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.duration-box {
  background: rgba(0,30,60,0.82); backdrop-filter: blur(10px);
  border: 1px solid rgba(0,180,255,0.3); border-radius: 24px;
  padding: 50px 60px; display: flex; flex-direction: column;
  align-items: center; gap: 36px; color: #fff;
}
.dur-title { font-size: 28px; font-weight: 800; color: #7ee8fa; }
.dur-options { display: flex; gap: 24px; }
.dur-btn {
  width: 140px; height: 140px; border-radius: 20px;
  border: 2px solid rgba(0,180,255,0.3);
  background: rgba(0,100,180,0.2); color: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; cursor: pointer; transition: all 0.3s; font-size: 16px;
}
.dur-btn:hover { border-color: #7ee8fa; background: rgba(0,180,255,0.2); transform: translateY(-4px); }
.dur-btn.selected { border-color: #7ee8fa; background: rgba(0,180,255,0.3); box-shadow: 0 0 20px rgba(0,180,255,0.4); }
.dur-icon { font-size: 36px; }
.dur-label { font-size: 18px; font-weight: 700; }
.start-btn {
  padding: 14px 60px; border-radius: 30px; border: none;
  background: linear-gradient(135deg, #f093fb, #f5576c); color: #fff;
  font-size: 20px; font-weight: 800; cursor: pointer; transition: all 0.3s;
}
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.start-btn:not(:disabled):hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
</style>
