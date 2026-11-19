<template>
  <div class="duration">
    <div class="panel">
      <h2 class="ttl">{{ t('selectDuration') }}</h2>
      <div class="choices">
        <button
          v-for="opt in options"
          :key="opt.min"
          class="choice"
          :class="{ selected: selected === opt.min }"
          @click="selected = opt.min"
        >
          <div class="num">{{ opt.min }}</div>
          <div class="lbl">{{ t(opt.key) }}</div>
        </button>
      </div>

      <button
        class="g-btn big"
        :disabled="selected === null"
        @click="onStart"
      >{{ t('startGame') }}</button>

      <button class="g-btn ghost" @click="$emit('back')">{{ t('back') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n.js'
const { t } = useI18n()
const emit = defineEmits(['select', 'back'])

const options = [
  { min: 1, key: 'min1' },
  { min: 3, key: 'min3' },
  { min: 5, key: 'min5' }
]
const selected = ref(null)

function onStart() {
  if (selected.value !== null) emit('select', selected.value)
}
</script>

<style scoped>
.duration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel {
  padding: 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  background: rgba(15, 20, 60, 0.75);
  border: 0.3vmin solid rgba(255, 224, 100, 0.5);
  border-radius: 2vmin;
  box-shadow: 0 1vmin 4vmin rgba(0, 0, 0, 0.5);
}
.ttl {
  font-size: 4vmin;
  color: #ffe066;
}
.choices {
  display: flex;
  gap: 4vmin;
  margin: 1vmin 0;
}
.choice {
  width: 22vmin;
  height: 22vmin;
  border-radius: 2vmin;
  border: 0.4vmin solid #ffe066;
  background: linear-gradient(180deg, rgba(255, 224, 100, 0.15) 0%, rgba(255, 184, 77, 0.15) 100%);
  color: #ffe066;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1vmin;
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s, border-color 0.2s;
}
.choice:hover {
  transform: translateY(-1vmin);
  background: linear-gradient(180deg, rgba(255, 224, 100, 0.35) 0%, rgba(255, 184, 77, 0.35) 100%);
  box-shadow: 0 1vmin 3vmin rgba(255, 224, 100, 0.4);
}
.choice.selected {
  background: linear-gradient(180deg, rgba(255, 224, 100, 0.55) 0%, rgba(255, 184, 77, 0.55) 100%);
  color: #1a1a3d;
  border-color: #fff2a8;
  box-shadow: 0 1vmin 3vmin rgba(255, 224, 100, 0.6), inset 0 0 2vmin rgba(255, 255, 255, 0.4);
}
.num {
  font-size: 10vmin;
  font-weight: bold;
  line-height: 1;
}
.lbl {
  font-size: 2.6vmin;
}
.big {
  min-width: 30vmin;
  padding: 2vmin 4vmin;
  font-size: 3vmin;
}

/* 竖屏适配 */
@media (orientation: portrait) {
  .duration {
    padding: 4vmin 4vmin;
    padding-top: calc(6vmin + env(safe-area-inset-top));
    padding-bottom: calc(4vmin + env(safe-area-inset-bottom));
  }
  .panel {
    width: 90vw;
    padding: 6vmin 5vmin;
    gap: 4vmin;
    border-radius: max(2.4vmin, 14px);
  }
  .ttl {
    font-size: max(5.5vmin, 22px);
    text-align: center;
  }
  .choices {
    gap: 3vmin;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  .choice {
    width: max(24vmin, 90px);
    height: max(24vmin, 90px);
    border-radius: max(2.4vmin, 12px);
  }
  .num { font-size: max(11vmin, 40px); }
  .lbl { font-size: max(3vmin, 14px); }
  .big {
    width: 100%;
    min-width: 0;
    font-size: max(4vmin, 18px);
    padding: max(2.8vmin, 14px) max(4vmin, 18px);
    border-radius: max(2vmin, 12px);
  }
}
</style>
