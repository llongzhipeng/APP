<template>
  <div class="overlay">
    <div class="box">
      <h2 class="title">{{ t.selectDuration }}</h2>
      <div class="options">
        <button
          v-for="d in durations" :key="d.val"
          class="dur-btn"
          :class="{ selected: selected === d.val }"
          @click="selected = d.val"
        >{{ d.label }}</button>
      </div>
      <button class="start-btn" :disabled="!selected" @click="$emit('start', selected)">{{ t.confirmStart }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String })
defineEmits(['start'])
const t = computed(() => messages[props.lang] || messages.zh)
const selected = ref(null)
const durations = computed(() => [
  { val: 60, label: t.value.min1 },
  { val: 180, label: t.value.min3 },
  { val: 300, label: t.value.min5 },
])
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.box {
  background: linear-gradient(160deg, #0e1a30, #060e1a);
  border: 0.2vmin solid rgba(100,150,255,0.3); border-radius: 2vmin;
  padding: 4vmin 5vmin; display: flex; flex-direction: column; align-items: center; gap: 3vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.title { color: #e8f0ff; font-size: 3vmin; font-weight: 800; }
.options { display: flex; gap: 2vmin; }
.dur-btn {
  padding: 2vmin 3.5vmin; font-size: 2.2vmin; font-weight: 700;
  border-radius: 1.2vmin; cursor: pointer; border: 0.2vmin solid rgba(100,150,255,0.3);
  background: rgba(30,50,100,0.6); color: #e8f0ff; transition: all 0.2s;
}
.dur-btn:hover { background: rgba(50,80,150,0.8); }
.dur-btn.selected {
  background: linear-gradient(135deg, #2a4a8a, #4a7acc);
  border-color: rgba(100,150,255,0.7); box-shadow: 0 0 1.5vmin rgba(74,122,204,0.5);
}
.start-btn {
  padding: 1.8vmin 5vmin; font-size: 2.4vmin; font-weight: 800;
  border-radius: 1.2vmin; cursor: pointer;
  background: linear-gradient(135deg, #2a4a8a, #4a7acc);
  border: 0.2vmin solid rgba(100,150,255,0.4); color: #e8f0ff; transition: all 0.2s;
}
.start-btn:hover:not(:disabled) { background: linear-gradient(135deg, #3a5a9a, #5a8adc); }
.start-btn:disabled { opacity: 0.4; cursor: default; }
</style>
