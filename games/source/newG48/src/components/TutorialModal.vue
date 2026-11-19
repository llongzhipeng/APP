<template>
  <div class="modal-mask">
    <div class="modal">
      <div class="header">
        <h2>{{ t('tutorialTitle') }}</h2>
        <button class="skip" @click="$emit('skip')">{{ t('skip') }}</button>
      </div>

      <div class="body">
        <div class="demo">
          <div class="demo-scene">
            <!-- Step 1: two star examples -->
            <div class="star-row" v-if="step === 1">
              <div class="star-example">
                <img :src="imgHappy" class="star-img" />
                <div class="badge good">+5</div>
                <div class="star-label">{{ lang==='zh'?'开心 · 收集':'Happy · Catch' }}</div>
              </div>
              <div class="star-example">
                <img :src="imgSad" class="star-img" />
                <div class="badge bad">−5</div>
                <div class="star-label">{{ lang==='zh'?'不开心 · 躲避':'Sad · Avoid' }}</div>
              </div>
            </div>

            <!-- Step 2: basket chasing happy star -->
            <template v-if="step === 2">
              <img
                :src="imgHappy"
                class="demo-star"
                :style="{ left: happyX + '%', top: '20%' }"
              />
              <div class="demo-basket" :style="{ left: basketX + '%' }">
                <svg viewBox="0 0 60 50" class="basket-svg">
                  <path d="M8 18 L 52 18 L 46 44 Q46 48 42 48 L 18 48 Q14 48 14 44 Z" fill="#d97757"/>
                  <path d="M8 18 L 52 18 L 51 22 L 9 22 Z" fill="#e5946f"/>
                  <path d="M14 22 L 14 46 M20 22 L 20 46 M30 22 L 30 46 M40 22 L 40 46 M46 22 L 46 46" stroke="#7a3a24" stroke-width="1"/>
                  <path d="M8 18 Q30 4 52 18" stroke="#c5674a" stroke-width="3" fill="none"/>
                </svg>
              </div>
            </template>

            <!-- Step 3: basket dodges sad star -->
            <template v-if="step === 3">
              <img :src="imgSad" class="demo-star sad-flash" style="left: 45%; top: 15%;" />
              <div class="demo-basket" :style="{ left: dodgeX + '%' }">
                <svg viewBox="0 0 60 50" class="basket-svg">
                  <path d="M8 18 L 52 18 L 46 44 Q46 48 42 48 L 18 48 Q14 48 14 44 Z" fill="#d97757"/>
                  <path d="M8 18 L 52 18 L 51 22 L 9 22 Z" fill="#e5946f"/>
                  <path d="M14 22 L 14 46 M20 22 L 20 46 M30 22 L 30 46 M40 22 L 40 46 M46 22 L 46 46" stroke="#7a3a24" stroke-width="1"/>
                  <path d="M8 18 Q30 4 52 18" stroke="#c5674a" stroke-width="3" fill="none"/>
                </svg>
              </div>
              <div class="warn-pulse" style="left: 45%; top: 15%;"></div>
            </template>

            <!-- Step 4: level up demo -->
            <template v-if="step === 4">
              <div class="level-demo">
                <div class="lv-chip lv1">Lv 1</div>
                <div class="lv-arrow">→</div>
                <div class="lv-chip lv3">Lv 3</div>
                <div class="lv-arrow">→</div>
                <div class="lv-chip lv6">Lv 6</div>
              </div>
              <div class="perf">{{ lang==='zh'?'正确率 90% 以上，难度自动提升':'90%+ Accuracy · Level Up' }}</div>
            </template>
          </div>
        </div>

        <div class="info">
          <div class="step-indicator">
            <div class="dot" v-for="n in 4" :key="n" :class="{ active: n === step }"></div>
          </div>
          <h3>{{ t('tutorial'+step+'Title') }}</h3>
          <p>{{ t('tutorial'+step+'Desc') }}</p>
        </div>
      </div>

      <div class="footer">
        <button class="btn btn-secondary" :disabled="step===1" @click="prev">{{ t('prev') }}</button>
        <button class="btn btn-primary" @click="next">
          {{ step === 4 ? t('startNow') : t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
import { resolveImage } from '../assets.js'

const IMG_HAPPY = resolveImage('/images/1.png') // 开心星星
const IMG_SAD = resolveImage('/images/2.png') // 不开心星星

export default {
  name: 'TutorialModal',
  data() {
    return { step: 1, basketX: 20, happyX: 55, dodgeX: 20, timers: [] }
  },
  computed: {
    lang() { return i18n.lang },
    imgHappy() { return IMG_HAPPY },
    imgSad() { return IMG_SAD },
  },
  mounted() { this.runDemo() },
  beforeDestroy() { this.clearTimers() },
  methods: {
    t,
    prev() { if (this.step > 1) { this.step--; this.runDemo() } },
    next() {
      if (this.step < 4) { this.step++; this.runDemo() }
      else this.$emit('done')
    },
    clearTimers() { this.timers.forEach(clearTimeout); this.timers = [] },
    runDemo() {
      this.clearTimers()
      if (this.step === 2) {
        this.basketX = 20; this.happyX = 55
        this.timers.push(setTimeout(() => { this.basketX = 50 }, 400))
        this.timers.push(setTimeout(() => { this.happyX = 20; this.basketX = 20 }, 1600))
        this.timers.push(setTimeout(() => { this.basketX = 55 }, 2400))
      } else if (this.step === 3) {
        this.dodgeX = 45
        this.timers.push(setTimeout(() => { this.dodgeX = 15 }, 500))
        this.timers.push(setTimeout(() => { this.dodgeX = 75 }, 1800))
        this.timers.push(setTimeout(() => { this.dodgeX = 15 }, 3200))
      }
    }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(44, 39, 33, 0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: 100vmin; max-width: 96vw; max-height: 82vh;
  background: #ffffff;
  border-radius: 2.4vmin; overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(44, 39, 33, 0.18);
  display: flex; flex-direction: column;
  animation: slideUp 0.28s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.header {
  padding: 1.8vmin 3vmin;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 0.15vmin solid #f0eadf;
}
.header h2 {
  font-size: 3.2vmin; font-weight: 700;
  color: #2c2721;
}
.skip {
  padding: 1vmin 2.2vmin; border-radius: 1.2vmin;
  background: transparent; color: #7a7266;
  border: 0.2vmin solid #e5ddce;
  font-size: 2vmin;
  font-weight: 500;
}
.skip:hover { border-color: #d97757; color: #d97757; }

.body { padding: 2.4vmin 3vmin 1.6vmin; }

.demo {
  height: 32vmin;
  background: #faf6ef;
  border: 0.15vmin solid #f0eadf;
  border-radius: 2vmin; overflow: hidden; position: relative;
  margin-bottom: 2vmin;
}
.demo-scene { position: absolute; inset: 0; }

.star-row {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: space-evenly;
}
.star-example {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 1.6vmin;
}
.star-img {
  width: 16vmin; height: 16vmin; min-width: 100px; min-height: 100px;
  filter: drop-shadow(0 8px 16px rgba(44, 39, 33, 0.15));
}
.badge {
  position: absolute; top: -1vmin; right: -2vmin;
  padding: 0.8vmin 2vmin; border-radius: 999px;
  font-size: 2.6vmin; font-weight: 700; color: #fff;
}
.badge.good { background: #6aa77a; }
.badge.bad { background: #c5674a; }
.star-label {
  font-size: 2.6vmin; color: #4a423a; font-weight: 600;
}

.demo-star {
  position: absolute;
  width: 9vmin; height: 9vmin;
  min-width: 60px; min-height: 60px;
  transition: left 1.1s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 6px 10px rgba(44, 39, 33, 0.15));
}
.demo-star.sad-flash { animation: pulse-scale 1s ease-in-out infinite; }
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
.demo-basket {
  position: absolute; bottom: 12%;
  width: 10vmin; min-width: 68px;
  transition: left 0.9s cubic-bezier(0.34, 1.2, 0.64, 1);
  transform: translateX(-50%);
}
.basket-svg { width: 100%; height: auto; display: block; }
.warn-pulse {
  position: absolute;
  width: 12vmin; height: 12vmin;
  border-radius: 50%;
  transform: translate(-2vmin, -2vmin);
  background: radial-gradient(circle, rgba(197, 103, 74, 0.35), transparent 65%);
  animation: pulse-ring 1.5s ease-out infinite;
}
@keyframes pulse-ring {
  0% { transform: translate(-2vmin, -2vmin) scale(0.6); opacity: 1; }
  100% { transform: translate(-2vmin, -2vmin) scale(1.6); opacity: 0; }
}

.level-demo {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center; gap: 2vmin;
}
.lv-chip {
  padding: 1.8vmin 3.4vmin; border-radius: 1.4vmin;
  font-size: 3.4vmin; font-weight: 800; color: #fff;
}
.lv-arrow {
  font-size: 3.4vmin; color: #a89f92; font-weight: 700;
}
.lv1 { background: #7cb98f; }
.lv3 { background: #d4a94a; }
.lv6 { background: #a94a3a; }
.perf {
  position: absolute; bottom: 3vmin; left: 50%; transform: translateX(-50%);
  font-size: 2.4vmin; color: #4a423a; font-weight: 500;
  padding: 1vmin 2.4vmin; border-radius: 999px;
  background: #ffffff; border: 0.15vmin solid #e5ddce;
}

.info { text-align: center; }
.step-indicator { display: flex; justify-content: center; gap: 1.2vmin; margin-bottom: 1.4vmin; }
.dot {
  width: 1.2vmin; height: 1.2vmin; min-width: 9px; min-height: 9px; border-radius: 50%; background: #e5ddce;
  transition: all 0.3s;
}
.dot.active { background: #d97757; width: 3.4vmin; min-width: 24px; border-radius: 4px; }
.info h3 { font-size: 2.8vmin; margin-bottom: 0.6vmin; color: #2c2721; font-weight: 700; }
.info p { font-size: 2.2vmin; color: #6b6357; line-height: 1.6; }

.footer {
  padding: 1.6vmin 3vmin; border-top: 0.15vmin solid #f0eadf;
  display: flex; justify-content: space-between; gap: 2vmin;
}
.btn {
  padding: 1.2vmin 3.6vmin; border-radius: 1.4vmin; border: 0;
  font-weight: 600; font-size: 2.4vmin;
  min-width: 18vmin; transition: all 0.2s;
}
.btn-primary {
  background: #d97757; color: #fff;
}
.btn-primary:hover { background: #c5674a; }
.btn-secondary {
  background: #ffffff; color: #2c2721;
  border: 0.2vmin solid #e5ddce;
}
.btn-secondary:hover:not(:disabled) { border-color: #d97757; color: #d97757; }
.btn-secondary:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
