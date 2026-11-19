<template>
  <div class="duration-page" :style="bgStyle">
    <h2 class="title">{{ t.selectDuration }}</h2>
    <div class="options">
      <button class="dur-btn" @click="$emit('selected', 60)">{{ t.min1 }}</button>
      <button class="dur-btn" @click="$emit('selected', 180)">{{ t.min3 }}</button>
      <button class="dur-btn" @click="$emit('selected', 300)">{{ t.min5 }}</button>
    </div>
    <button class="back-btn" @click="$emit('back')">← {{ lang === 'zh' ? '返回' : 'Back' }}</button>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
import { bgImage } from '../../utils/images.js'
const props = defineProps({ lang: String })
defineEmits(['selected', 'back'])
const t = computed(() => messages[props.lang] || messages.zh)
const bgStyle = { background: `url('${bgImage}') center/contain no-repeat, #0d0618` }
</script>

<style scoped>
.duration-page {
  width: 100vw; height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 5vmin;
  position: relative;
}
.duration-page::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(5,2,12,0.15); pointer-events: none;
}
.title {
  font-size: 4vmin; font-weight: 800; color: #fde68a;
  position: relative; z-index: 1;
  text-shadow: 0 0 1.5vmin rgba(168,85,247,0.9), 0 0.3vmin 1vmin rgba(0,0,0,0.6);
}
.options { display: flex; gap: 4vmin; position: relative; z-index: 1; }
.dur-btn {
  padding: 3vmin 5vmin;
  font-size: 2.8vmin;
  font-weight: 700;
  background: linear-gradient(135deg, #6b21a8, #a855f7);
  color: #fff;
  border: none;
  border-radius: 1.5vmin;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0.5vmin 2vmin rgba(168,85,247,0.4);
}
.dur-btn:hover { transform: translateY(-0.4vmin) scale(1.05); box-shadow: 0 1vmin 3vmin rgba(168,85,247,0.6); }
.back-btn {
  position: relative; z-index: 1;
  background: rgba(30,10,60,0.75);
  border: 0.2vmin solid rgba(200,150,255,0.6);
  color: #e8d5ff;
  font-size: 2vmin;
  padding: 1vmin 3vmin;
  border-radius: 1vmin;
  cursor: pointer;
  transition: background 0.2s;
  backdrop-filter: blur(2px);
}
.back-btn:hover { background: rgba(168,85,247,0.35); }
</style>
