<template>
  <div class="duration-screen">
    <h2 class="dur-title">{{ t.selectDuration }}</h2>
    <div class="dur-btns">
      <button class="dur-btn" @click="$emit('select', 60)">
        <span class="dur-number">1</span>
        <span class="dur-label">{{ t.dur1 }}</span>
      </button>
      <button class="dur-btn" @click="$emit('select', 180)">
        <span class="dur-number">3</span>
        <span class="dur-label">{{ t.dur3 }}</span>
      </button>
      <button class="dur-btn" @click="$emit('select', 300)">
        <span class="dur-number">5</span>
        <span class="dur-label">{{ t.dur5 }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DurationScreen',
  props: {
    t: { type: Object, required: true }
  },
  emits: ['select']
}
</script>

<style scoped>
.duration-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0d1b4b 100%);
  gap: 5vh;
}

.dur-title {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0;
}

.dur-btns {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.dur-btn {
  width: 9rem;
  height: 9rem;
  border-radius: 1rem;
  background: rgba(255,255,255,0.07);
  border: 0.15rem solid rgba(0, 212, 255, 0.3);
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;
  font-family: inherit;
}
.dur-btn:hover {
  background: rgba(0, 212, 255, 0.15);
  border-color: #00d4ff;
  transform: translateY(-0.2rem);
  box-shadow: 0 0.4rem 1.5rem rgba(0, 212, 255, 0.25);
}
.dur-btn:active {
  transform: translateY(0);
}

.dur-number {
  font-size: 3rem;
  font-weight: 900;
  color: #00d4ff;
  line-height: 1;
}

.dur-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.03em;
}
</style>
