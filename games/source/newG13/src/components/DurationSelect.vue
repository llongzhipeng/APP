<template>
  <div class="duration-page">
    <div class="content">
      <h2 class="title">{{ t('selectDuration') }}</h2>
      <div class="btn-row">
        <button
          class="dur-btn"
          :class="{ active: picked === 60 }"
          @click="picked = 60"
        >
          <div class="big">1</div>
          <div class="sub">{{ t('duration1') }}</div>
        </button>
        <button
          class="dur-btn"
          :class="{ active: picked === 180 }"
          @click="picked = 180"
        >
          <div class="big">3</div>
          <div class="sub">{{ t('duration3') }}</div>
        </button>
        <button
          class="dur-btn"
          :class="{ active: picked === 300 }"
          @click="picked = 300"
        >
          <div class="big">5</div>
          <div class="sub">{{ t('duration5') }}</div>
        </button>
      </div>

      <div class="action-row">
        <button class="action-btn back" @click="$emit('go', 'home')">← {{ t('back') }}</button>
        <button
          class="action-btn primary"
          :disabled="!picked"
          @click="$emit('select', picked)"
        >
          {{ t('startGame') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
export default {
  name: 'DurationSelect',
  props: { t: { type: Function, required: true } },
  data() { return { picked: null }; },
};
</script>

<style scoped>
.duration-page {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #7ec8f2 0%, #b8e2f7 45%, #f9e79b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.duration-page::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url(~@/views/game/newG13/public/images/bac.png);
  background-size: cover;
  background-position: center;
  opacity: 0.4;
}
.content {
  position: relative;
  z-index: 2;
  text-align: center;
  background: rgba(255,255,255,0.9);
  padding: 5vmin 6vmin;
  border-radius: 2.5vmin;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,0.15);
}
.title {
  color: #ff8c1a;
  font-size: 4vmin;
  margin-bottom: 3vmin;
  font-weight: 900;
}
.btn-row {
  display: flex;
  gap: 3vmin;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3.5vmin;
}
.dur-btn {
  width: 22vmin;
  height: 22vmin;
  border-radius: 2vmin;
  border: 0.4vmin solid transparent;
  background: linear-gradient(180deg, #ffe0b8, #ffcf8f);
  color: #ff8c1a;
  cursor: pointer;
  box-shadow: 0 0.8vmin 2vmin rgba(255,140,26,0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5vmin;
  transition: transform 0.15s, box-shadow 0.15s;
  font-weight: 900;
}
.dur-btn:hover { transform: translateY(-0.5vmin) scale(1.03); }
.dur-btn.active {
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  color: #fff;
  border-color: #fff;
  box-shadow: 0 0.8vmin 2.5vmin rgba(255,140,26,0.55), 0 0 0 0.5vmin rgba(255,140,26,0.35);
  transform: translateY(-0.5vmin) scale(1.05);
}
.dur-btn .big {
  font-size: 8vmin;
  font-weight: 900;
  line-height: 1;
}
.dur-btn .sub {
  font-size: 2vmin;
  font-weight: 700;
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 2.5vmin;
  flex-wrap: wrap;
}
.action-btn {
  padding: 1.5vmin 4vmin;
  font-size: 2.4vmin;
  font-weight: 800;
  border-radius: 999px;
  cursor: pointer;
  min-width: 18vmin;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
  box-shadow: 0 0.6vmin 1.6vmin rgba(0,0,0,0.15);
}
.action-btn:hover:not(:disabled) { transform: translateY(-0.3vmin); }
.action-btn.back {
  background: #fff;
  color: #888;
  border: 0.3vmin solid #ccc;
}
.action-btn.primary {
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  color: #fff;
  border: 0.3vmin solid #ff8c1a;
}
.action-btn.primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  background: #ccc;
  border-color: #ccc;
  box-shadow: none;
}

@media (orientation: portrait) {
  .content {
    width: 88vw;
    padding: 7vmin 5vmin;
    border-radius: 3vmin;
    padding-top: calc(7vmin + env(safe-area-inset-top));
    padding-bottom: calc(7vmin + env(safe-area-inset-bottom));
  }
  .title {
    font-size: max(6vmin, 20px);
    margin-bottom: 5vmin;
  }
  .btn-row {
    gap: 3.5vmin;
    margin-bottom: 5vmin;
  }
  .dur-btn {
    width: 32vmin;
    height: 32vmin;
    border-radius: 3vmin;
  }
  .dur-btn .big { font-size: max(10vmin, 32px); }
  .dur-btn .sub { font-size: max(3vmin, 13px); }
  .action-row {
    flex-direction: column-reverse;
    gap: 2.5vmin;
    align-items: stretch;
  }
  .action-btn {
    width: 100%;
    min-width: 0;
    font-size: max(4.4vmin, 17px);
    padding: 2.4vmin 3vmin;
    border-radius: 999px;
  }
}
</style>
