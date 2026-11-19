<template>
  <div class="dur-view">
    <div class="dur paper">
      <button class="back-btn" @click="$emit('nav', { to: 'home' })">
        <span>←</span> {{ t('back') }}
      </button>

      <h2 class="dur-title">{{ t('durationTitle') }}</h2>
      <p class="dur-tip">{{ t('durationTip') }}</p>

      <div class="dur-cards">
        <button
          v-for="(m, i) in mins"
          :key="m"
          class="dur-card"
          :class="{ selected: selected === m }"
          :style="{ '--i': i }"
          @click="selected = m"
        >
          <div class="dur-num">{{ m }}</div>
          <div class="dur-unit">{{ m === 1 ? t('minute') : t('minutes') }}</div>
          <div class="dur-check" v-if="selected === m">✓</div>
        </button>
      </div>

      <button class="btn btn-primary start-btn" :disabled="!selected" @click="start">
        {{ t('start') }}
      </button>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n.js'
export default {
  name: 'DurationSelect',
  mixins: [i18nMixin],
  data() { return { mins: [1, 3, 5], selected: 3 } },
  methods: {
    start() {
      if (!this.selected) return
      this.$emit('nav', { to: 'game', data: { duration: this.selected * 60 } })
    },
  },
}
</script>

<style scoped>
.dur-view {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
}
.dur {
  width: min(100vmin, 100%);
  padding: 5vmin;
  display: flex; flex-direction: column; align-items: center;
  gap: 3vmin;
  position: relative;
}
.back-btn {
  position: absolute; top: 2.5vmin; left: 2.5vmin;
  padding: 1vmin 2vmin;
  background: var(--c-paper);
  border: 0.25vmin solid var(--c-line-2);
  border-radius: 3vmin;
  font-size: 2.2vmin;
  color: var(--c-brown);
  display: inline-flex; align-items: center; gap: 0.6vmin;
  transition: background .2s;
  box-shadow: var(--shadow-sm);
}
.back-btn:hover { background: var(--c-paper-soft); }

.dur-title {
  font-size: 5vmin;
  font-weight: 700;
  color: var(--c-title);
  letter-spacing: 0.4vmin;
  text-align: center;
}
.dur-tip { color: var(--c-brown-dim); font-size: 2.4vmin; }

.dur-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 3vmin;
  width: 100%;
  max-width: 80vmin;
}
.dur-card {
  position: relative;
  aspect-ratio: 1 / 1.15;
  border-radius: 2vmin;
  background: var(--c-paper);
  border: 0.35vmin solid var(--c-line);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6vmin;
  box-shadow: var(--shadow-sm);
  transition: all .25s;
  animation: cardIn .5s calc(var(--i) * .08s) both;
}
@keyframes cardIn { from { opacity: 0; transform: translateY(2vmin); } to { opacity: 1; transform: none; } }
.dur-card:hover { transform: translateY(-0.8vmin); border-color: var(--c-orange); box-shadow: var(--shadow-md); }
.dur-card.selected {
  background: linear-gradient(135deg, #fff2e0, #ffe6cc);
  border-color: var(--c-orange);
  box-shadow: 0 1.2vmin 3vmin rgba(217,119,66,.35);
}
.dur-num {
  font-size: 12vmin;
  font-weight: 800;
  line-height: 1;
  color: var(--c-title);
}
.dur-unit {
  font-size: 2.6vmin;
  color: var(--c-brown-dim);
  font-weight: 600;
  letter-spacing: 0.15vmin;
}
.dur-check {
  position: absolute; top: 12%; right: 14%;
  width: 3.4vmin; height: 3.4vmin; border-radius: 50%;
  background: var(--c-orange);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 2vmin;
  font-weight: 800;
  animation: pop .3s;
}
@keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

.start-btn {
  margin-top: 1vmin;
  min-width: 24vmin;
  font-size: 2.8vmin;
}
</style>
