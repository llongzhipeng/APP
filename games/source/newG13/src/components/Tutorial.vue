<template>
  <div class="tutorial-mask">
    <div class="tutorial-box">
      <div class="tutorial-header">
        <h2 class="tutorial-title">{{ t('tutorialTitle') }} {{ step }}/4</h2>
        <button class="skip-btn" @click="$emit('done')">{{ t('skip') }}</button>
      </div>

      <div class="tutorial-scene">
        <!-- step 1: characters + prices -->
        <div v-if="step === 1" class="demo demo-scene">
          <div class="demo-group">
            <div class="demo-imgs">
              <img :src="resolveImage('/images/adult/1.png')" alt="adult" class="demo-img" />
              <img :src="resolveImage('/images/adult/2.png')" alt="adult" class="demo-img" />
            </div>
            <div class="demo-price">10 {{ t('yuan') }}/{{ lang === 'zh' ? '张' : 'ticket' }}</div>
          </div>
        </div>

        <!-- step 2: question -->
        <div v-if="step === 2" class="demo demo-question">
          <div class="q-text">2 × 10 {{ t('yuan') }} = ?</div>
        </div>

        <!-- step 3: options -->
        <div v-if="step === 3" class="demo demo-options">
          <button class="demo-opt">15</button>
          <button class="demo-opt highlight">20</button>
          <button class="demo-opt">25</button>
          <button class="demo-opt">30</button>
        </div>

        <!-- step 4: feedback -->
        <div v-if="step === 4" class="demo demo-result">
          <div class="result-icon">✓</div>
          <div class="result-text">+5</div>
        </div>
      </div>

      <div class="tutorial-desc">{{ stepDesc }}</div>

      <div class="tutorial-nav">
        <button class="nav-btn" :disabled="step === 1" @click="prev">{{ t('prev') }}</button>
        <div class="dots">
          <span class="dot" :class="{ active: step === i }" v-for="i in 4" :key="i"></span>
        </div>
        <button class="nav-btn primary" @click="next">
          {{ step === 4 ? t('startNow') : t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
export default {
  name: 'Tutorial',
  props: {
    t: { type: Function, required: true },
    lang: { type: String, required: true },
  },
  data() {
    return { step: 1 };
  },
  computed: {
    stepDesc() { return this.t('tStep' + this.step + 'Desc'); },
  },
  methods: { resolveImage,
    prev() { if (this.step > 1) this.step--; },
    next() {
      if (this.step < 4) this.step++;
      else this.$emit('done');
    },
  },
};
</script>

<style scoped>
.tutorial-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: flex-start; justify-content: center; z-index: 200;
  padding: 2vmin;
  padding-top: 3vh;
}
.tutorial-box {
  position: relative;
  background: linear-gradient(160deg, #fff 60%, #fff6e5);
  border: 0.3vmin solid #ff8c1a;
  border-radius: 2vmin;
  width: min(90vmin, 96vw);
  max-height: 92vh;
  padding: 3vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.4);
  display: flex; flex-direction: column; gap: 2vmin;
  overflow: hidden;
}
.tutorial-header {
  display: flex; align-items: center; justify-content: space-between;
}
.tutorial-title {
  color: #ff8c1a; font-size: 2.6vmin; font-weight: 800;
}
.skip-btn {
  background: rgba(255,140,26,0.15);
  border: 0.2vmin solid #ff8c1a;
  color: #ff8c1a;
  font-size: 1.7vmin;
  font-weight: 700;
  padding: 0.6vmin 1.6vmin;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s;
}
.skip-btn:hover { background: rgba(255,140,26,0.3); }

.tutorial-scene {
  flex: 1;
  min-height: 45vh;
  background: url(~@/views/game/newG13/public/images/bac.png) center/cover no-repeat, linear-gradient(180deg, #cfe9fb, #f5e5b6);
  border-radius: 1.5vmin;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 2vmin;
  position: relative;
  overflow: hidden;
}
.tutorial-scene::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(255,255,255,0.15);
}
.demo {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1.5vmin;
}
.demo-scene {
  flex-direction: row;
  align-items: flex-end;
  gap: 3vmin;
  padding-bottom: 3vh;
  width: 100%;
}
.demo-group {
  display: flex; flex-direction: column;
  align-items: center; gap: 1vmin;
}
.demo-imgs {
  display: flex; align-items: flex-end; gap: 1vmin;
}
.demo-img {
  height: 32vh;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0.6vmin 1vmin rgba(0,0,0,0.25));
}
.demo-price {
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  color: #fff;
  padding: 0.6vmin 1.6vmin;
  border-radius: 999px;
  font-size: 2.2vmin;
  font-weight: 900;
  box-shadow: 0 0.6vmin 1.2vmin rgba(255,140,26,0.4);
}
.demo-question { flex: 1; justify-content: center; }
.q-text {
  font-size: 8vmin;
  color: #ff8c1a;
  font-weight: 900;
  text-shadow: 0.4vmin 0.4vmin 0 rgba(255,255,255,0.8);
}
.demo-options {
  flex-direction: row;
  gap: 2vmin;
  flex-wrap: wrap;
  justify-content: center;
}
.demo-opt {
  min-width: 10vmin;
  padding: 1.4vmin 2.2vmin;
  font-size: 3vmin;
  font-weight: 900;
  border-radius: 1.2vmin;
  border: 0.3vmin solid #ff8c1a;
  background: #fff;
  color: #ff8c1a;
  cursor: default;
}
.demo-opt.highlight {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
  transform: scale(1.15);
  box-shadow: 0 0.8vmin 2vmin rgba(76,175,80,0.5);
}
.demo-result { justify-content: center; }
.result-icon {
  width: 22vmin;
  height: 22vmin;
  background: #4caf50;
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14vmin;
  font-weight: 900;
  box-shadow: 0 0.8vmin 2.5vmin rgba(76,175,80,0.5);
}
.result-text {
  font-size: 5vmin;
  color: #4caf50;
  font-weight: 900;
}

.tutorial-desc {
  text-align: center;
  font-size: 2.2vmin;
  color: #555;
  padding: 0 1em;
  font-weight: 600;
}
.tutorial-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1vmin;
}
.nav-btn {
  padding: 1.2vmin 3vmin;
  font-size: 2vmin;
  font-weight: 700;
  border-radius: 999px;
  border: 0.3vmin solid #ff8c1a;
  background: #fff;
  color: #ff8c1a;
  cursor: pointer;
  min-width: 12vmin;
  transition: transform 0.15s;
}
.nav-btn:hover:not(:disabled) { transform: translateY(-0.3vmin); }
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.nav-btn.primary {
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  color: #fff;
}
.dots { display: flex; gap: 0.8vmin; }
.dot {
  width: 1.2vmin; height: 1.2vmin;
  border-radius: 50%;
  background: #ddd;
  transition: background 0.2s, transform 0.2s;
}
.dot.active {
  background: #ff8c1a;
  transform: scale(1.3);
}

@media (orientation: portrait) {
  .tutorial-mask {
    padding: 2vmin;
    padding-top: calc(2vmin + env(safe-area-inset-top));
    padding-bottom: calc(2vmin + env(safe-area-inset-bottom));
    align-items: center;
  }
  .tutorial-box {
    width: 92vw;
    max-height: 94vh;
    padding: 4vmin;
    border-radius: 3vmin;
    gap: 2.5vmin;
  }
  .tutorial-title { font-size: max(4.4vmin, 17px); }
  .skip-btn {
    font-size: max(3.2vmin, 13px);
    padding: 1vmin 2.4vmin;
  }
  .tutorial-scene {
    min-height: 38vh;
    border-radius: 2vmin;
  }
  .demo-img { height: 26vh; }
  .demo-price { font-size: max(3.6vmin, 14px); padding: 1vmin 2.2vmin; }
  .q-text { font-size: max(11vmin, 36px); }
  .demo-options { gap: 2.5vmin; }
  .demo-opt {
    min-width: 18vmin;
    font-size: max(4.4vmin, 17px);
    padding: 2vmin 2.8vmin;
    border-radius: 2vmin;
  }
  .result-icon {
    width: 28vmin; height: 28vmin;
    font-size: max(16vmin, 60px);
  }
  .result-text { font-size: max(7vmin, 28px); }
  .tutorial-desc {
    font-size: max(3.6vmin, 14px);
    padding: 0;
  }
  .tutorial-nav { gap: 1.5vmin; }
  .nav-btn {
    padding: 1.8vmin 2.4vmin;
    font-size: max(3.4vmin, 14px);
    min-width: 20vmin;
    border-radius: 999px;
  }
  .dot { width: 2vmin; height: 2vmin; }
}
</style>
