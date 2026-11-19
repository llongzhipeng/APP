<template>
  <div class="overlay" @click.self="$emit('back')">
    <div class="modal card dur-modal">
      <div class="dur-head">
        <h2>{{ t('durationTitle') }}</h2>
        <p>{{ t('durationDesc') }}</p>
      </div>

      <div class="dur-grid">
        <button v-for="opt in options" :key="opt.value"
                class="dur-card" :class="{selected: selected === opt.value}"
                @click="selected = opt.value">
          <div class="dur-num">{{ opt.num }}</div>
          <div class="dur-unit">{{ t('unit_min') }}</div>
          <div class="dur-lbl">{{ t(opt.key) }}</div>
        </button>
      </div>

      <div class="dur-actions">
        <button class="btn btn-ghost btn-lg" @click="$emit('back')">
          {{ t('back') }}
        </button>
        <button class="btn btn-primary btn-lg"
                :disabled="!selected"
                @click="$emit('start', selected)">
          {{ t('startTrain') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n.js'
export default {
  mixins: [i18nMixin],
  data() { return {
    selected: 60,
    options: [
      { value: 60,  num: 1, key: 'min1' },
      { value: 180, num: 3, key: 'min3' },
      { value: 360, num: 6, key: 'min6' }
    ]
  } }
}
</script>

<style scoped>
.dur-modal { width: min(94vw, 820px); text-align: center; padding: clamp(1.6rem, 3vmin, 2.6rem); }
.dur-head h2 { font-size: clamp(1.8rem, 3.6vmin, 2.8rem); font-weight: 700; margin-bottom: .3em; }
.dur-head p { color: var(--ink-mid); font-size: clamp(1rem, 2vmin, 1.4rem); }
.dur-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem; margin: 2rem 0;
}
.dur-card {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  padding: 1.8rem .6rem;
  color: var(--ink);
  cursor: pointer;
  transition: all .18s ease;
  display: flex; flex-direction: column; align-items: center; gap: .1rem;
}
.dur-card:hover { border-color: var(--border-strong); background: var(--surface-strong); transform: translateY(-2px); }
.dur-card.selected {
  border-color: var(--accent);
  background: linear-gradient(180deg, rgba(255,181,71,.18), rgba(255,138,61,.08));
  box-shadow: 0 6px 22px rgba(255,138,61,.25);
}
.dur-num {
  font-size: clamp(3rem, 7.5vmin, 5rem); font-weight: 800; line-height: 1;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.dur-unit { color: var(--ink-mid); font-size: clamp(.95rem, 1.8vmin, 1.25rem); margin-top: .2rem; }
.dur-lbl { color: var(--ink); margin-top: .6rem; font-weight: 600; font-size: clamp(1.05rem, 2.1vmin, 1.5rem); }
.dur-actions {
  display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;
}
@media (max-width: 500px) {
  .dur-grid { grid-template-columns: 1fr; }
}
</style>
