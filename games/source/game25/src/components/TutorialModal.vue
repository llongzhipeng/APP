<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tutorial-title">{{ t.tutorialTitle }}</h2>
      <div class="step-dots">
        <span v-for="i in 3" :key="i" class="dot" :class="{ active: step === i - 1 }"></span>
      </div>
      <div class="demo-area">
        <!-- Step 0: Show items scattered -->
        <div v-if="step === 0" class="demo-step">
          <div class="demo-scatter">
            <img v-for="(item, i) in demoItems0" :key="i" :src="item.src" class="demo-img" :style="item.style" />
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '屏幕上分布着不同种类的水果/动物' : 'Different fruits/animals are scattered on screen' }}</p>
        </div>
        <!-- Step 1: Count each type -->
        <div v-if="step === 1" class="demo-step">
          <div class="demo-counts">
            <div v-for="(g, i) in demoGroups" :key="i" class="demo-group">
              <img :src="g.src" class="demo-group-img" />
              <span class="demo-count">{{ g.name }} × {{ g.count }}</span>
            </div>
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '数一数每种的数量' : 'Count each type' }}</p>
        </div>
        <!-- Step 2: Choose the most -->
        <div v-if="step === 2" class="demo-step">
          <div class="demo-choices">
            <div v-for="(g, i) in demoGroups" :key="i" class="demo-choice" :class="{ winner: g.count === maxCount }">
              <img :src="g.src" class="demo-choice-img" />
              <span class="demo-choice-count">{{ g.name }}</span>
              <span class="demo-choice-count">{{ g.count }}</span>
              <span v-if="g.count === maxCount" class="winner-mark">✓</span>
            </div>
          </div>
          <p class="demo-hint">{{ lang === 'zh' ? '选择数量最多的一项！' : 'Choose the item with the most!' }}</p>
        </div>
      </div>
      <div class="tutorial-nav">
        <button class="nav-btn" @click="$emit('skip')">{{ t.skip }}</button>
        <div class="nav-arrows">
          <button class="nav-btn" :disabled="step === 0" @click="step--">{{ t.prev }}</button>
          <button class="nav-btn primary" @click="onNext">{{ step === 2 ? t.skip : t.next }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
import { fruitImage } from '../../utils/images'

export default {
  props: { lang: String },
  data() {
    return {
      step: 0,
      demoGroups: [
        { src: fruitImage('8.png'), name: '苹果', count: 3 },
        { src: fruitImage('1.png'), name: '桃子', count: 5 },
      ],
      demoItems0: [
        { src: fruitImage('8.png'), style: { top: '5%',  left: '10%' } },
        { src: fruitImage('8.png'), style: { top: '40%', left: '25%' } },
        { src: fruitImage('8.png'), style: { top: '65%', left: '5%'  } },
        { src: fruitImage('1.png'), style: { top: '5%',  left: '55%' } },
        { src: fruitImage('1.png'), style: { top: '30%', left: '70%' } },
        { src: fruitImage('1.png'), style: { top: '58%', left: '52%' } },
        { src: fruitImage('1.png'), style: { top: '70%', left: '78%' } },
        { src: fruitImage('1.png'), style: { top: '15%', left: '40%' } },
      ],
    }
  },
  computed: {
    t() { return messages[this.lang] || messages.zh },
    maxCount() { return Math.max(...this.demoGroups.map(g => g.count)) },
  },
  methods: {
    onNext() {
      if (this.step < 2) this.step++
      else this.$emit('done')
    },
  },
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.tutorial-box {
  background: #fff; border: 0.2vmin solid #d0c8b8; border-radius: 2vmin;
  padding: 3vmin 4vmin; width: min(65vmin, 92vw);
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.15);
}
.tutorial-title { color: #333; font-size: 3vmin; font-weight: 800; }
.step-dots { display: flex; gap: 1.2vmin; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: #d0c8b8; transition: background 0.3s; }
.dot.active { background: #4caf50; }
.demo-area { width: 100%; min-height: 30vmin; display: flex; align-items: center; justify-content: center; }
.demo-step { display: flex; flex-direction: column; align-items: center; gap: 2vmin; width: 100%; }
.demo-scatter { position: relative; width: 100%; height: 28vmin; }
.demo-img { position: absolute; width: 6vmin; height: 6vmin; object-fit: contain; }
.demo-counts { display: flex; gap: 4vmin; align-items: center; justify-content: center; }
.demo-group { display: flex; flex-direction: column; align-items: center; gap: 1vmin; }
.demo-group-img { width: 7vmin; height: 7vmin; object-fit: contain; }
.demo-count { font-size: 2.5vmin; font-weight: 800; color: #333; }
.demo-choices { display: flex; gap: 3vmin; align-items: center; justify-content: center; }
.demo-choice {
  display: flex; flex-direction: column; align-items: center; gap: 1vmin;
  padding: 1.5vmin; border-radius: 1.5vmin; border: 0.3vmin solid #d0c8b8;
  background: #f9f6f0; position: relative; transition: all 0.3s;
}
.demo-choice.winner { border-color: #5cb85c; background: #d4edda; }
.demo-choice-img { width: 7vmin; height: 7vmin; object-fit: contain; }
.demo-choice-count { font-size: 2.2vmin; font-weight: 800; color: #333; }
.winner-mark { position: absolute; top: -1.5vmin; right: -1vmin; font-size: 2.5vmin; color: #4caf50; font-weight: 900; }
.demo-hint { font-size: 2vmin; color: #666; text-align: center; }
.tutorial-nav { width: 100%; display: flex; justify-content: space-between; align-items: center; }
.nav-arrows { display: flex; gap: 1.5vmin; }
.nav-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: #f0ebe2; border: 0.2vmin solid #c8bfb0;
  color: #444; font-weight: 600; transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) { background: #e5dfd5; }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.primary { background: linear-gradient(135deg, #4caf50, #66bb6a); border-color: #a5d6a7; color: #fff; }
.nav-btn.primary:hover { background: linear-gradient(135deg, #43a047, #5cb860); }
</style>
