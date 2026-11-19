<template>
  <div class="tutorial-wrap" :style="bgStyle">
    <div class="tutorial-card">
      <h2 class="tut-title">{{ lang === 'zh' ? '游戏教程' : 'Tutorial' }}</h2>

      <!-- Step 1: lock + pick matching key -->
      <div v-if="step === 0" class="tut-step">
        <p class="step-desc">{{ lang === 'zh' ? '挂锁上有形状镂空的锁孔，选择钥匙齿板形状与锁孔一致的那把' : 'The padlock has shape keyholes. Pick the key whose bit shape matches.' }}</p>
        <div class="demo-area">
          <div class="demo-lock">
            <LockSvg :parts="['circle']" />
          </div>
          <div class="demo-arrow">→</div>
          <div class="demo-keys">
            <div class="demo-key correct-key" @click="demoClick(0)">
              <KeySvg :shapes="['circle']" />
            </div>
            <div class="demo-key" @click="demoClick(1)">
              <KeySvg :shapes="['square']" />
            </div>
          </div>
        </div>
        <p v-if="demoSelected === 0" class="demo-feedback correct">{{ lang === 'zh' ? '正确！锁梁会自动弹开' : 'Correct! The shackle pops open.' }}</p>
        <p v-else-if="demoSelected === 1" class="demo-feedback wrong">{{ lang === 'zh' ? '错误，再试试' : 'Wrong, try again' }}</p>
      </div>

      <!-- Step 2: unlock animation -->
      <div v-if="step === 1" class="tut-step">
        <p class="step-desc">{{ lang === 'zh' ? '答对后锁梁向上弹起，挂锁打开！' : 'On a correct pick, the shackle springs open and the lock unlocks!' }}</p>
        <div class="demo-area center">
          <div class="demo-lock open-demo">
            <LockSvg :parts="['star']" :open="true" />
          </div>
        </div>
      </div>

      <!-- Step 3: difficulty info -->
      <div v-if="step === 2" class="tut-step">
        <p class="step-desc">{{ lang === 'zh' ? '难度越高，锁孔形状组合越多（最多 3 个），选项也越多，最高难度的干扰项会更相似' : 'Higher difficulty = more shape parts (up to 3) and more options. Top level uses near-identical distractors.' }}</p>
        <div class="demo-area">
          <div class="demo-lock">
            <LockSvg :parts="['circle','square']" />
          </div>
          <div class="demo-arrow">→</div>
          <div class="demo-keys">
            <div class="demo-key" v-for="(s, idx) in [['circle','square'],['triangle','circle'],['square','triangle']]" :key="idx">
              <KeySvg :shapes="s" />
            </div>
          </div>
        </div>
      </div>

      <div class="tut-nav">
        <button v-if="step > 0" class="nav-btn" @click="step--">{{ lang === 'zh' ? '上一步' : 'Prev' }}</button>
        <button class="nav-btn skip" @click="$emit('skip')">{{ lang === 'zh' ? '跳过' : 'Skip' }}</button>
        <button v-if="step < 2" class="nav-btn primary" @click="step++">{{ lang === 'zh' ? '下一步' : 'Next' }}</button>
        <button v-else class="nav-btn primary" @click="$emit('done')">{{ lang === 'zh' ? '开始游戏' : 'Start' }}</button>
      </div>

      <div class="step-dots">
        <span v-for="i in 3" :key="i" :class="['dot', step === i-1 ? 'active' : '']"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from '@vue/composition-api'
import LockSvg from './LockSvg.vue'
import KeySvg from './KeySvg.vue'
import { bgImage } from '../../utils/images.js'
defineProps({ lang: String })
defineEmits(['done', 'skip'])
const step = ref(0)
const demoSelected = ref(null)
const bgStyle = { background: `url('${bgImage}') center/contain no-repeat, #0d0618` }
function demoClick(i) { demoSelected.value = i }
</script>

<style scoped>
.tutorial-wrap {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.tutorial-wrap::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(5,2,12,0.6); pointer-events: none;
}
.tutorial-card {
  position: relative; z-index: 1;
  background: rgba(30,10,60,0.92);
  border: 1px solid rgba(168,85,247,0.5);
  border-radius: 2vmin;
  padding: 5vmin 8vmin;
  width: min(99vw, 1700px);
  color: #e8d5ff;
  box-shadow: 0 0 5vmin rgba(168,85,247,0.4);
}
.tut-title { font-size: 3.5vmin; font-weight: 900; color: #c084fc; text-align: center; margin-bottom: 3vmin; }
.tut-step { display: flex; flex-direction: column; align-items: center; gap: 3vmin; }
.step-desc { font-size: 2.4vmin; color: #d8c5f0; text-align: center; }
.demo-area {
  display: flex; align-items: center; justify-content: center; gap: 4vmin;
  width: 100%; padding: 2vmin 0;
}
.demo-area.center { justify-content: center; }
.demo-lock {
  width: 22vmin; height: 26vmin;
  display: flex; align-items: center; justify-content: center;
  filter: drop-shadow(0 0.5vmin 1.5vmin rgba(0,0,0,0.5));
  flex-shrink: 0;
}
.demo-lock.open-demo { animation: lockGlow 1.2s ease-in-out infinite alternate; }
@keyframes lockGlow {
  from { filter: drop-shadow(0 0.5vmin 1.5vmin rgba(0,0,0,0.5)); }
  to   { filter: drop-shadow(0 0 3vmin rgba(251,191,36,0.9)); }
}
.demo-arrow {
  font-size: 5vmin; color: #e8d5ff; font-weight: 900;
  text-shadow: 0 0 1vmin rgba(168,85,247,0.8);
}
.demo-keys { display: flex; gap: 2.5vmin; align-items: center; }
.demo-key {
  width: 10vmin; height: 22vmin;
  background: rgba(255,255,255,0.08);
  border: 0.3vmin solid rgba(168,85,247,0.4);
  border-radius: 1.5vmin;
  display: flex; align-items: center; justify-content: center;
  padding: 1vmin;
  cursor: pointer;
  transition: all 0.2s;
}
.demo-key:hover { background: rgba(168,85,247,0.2); transform: scale(1.05); }
.correct-key { border-color: rgba(74,222,128,0.5); }
.demo-feedback { font-size: 2.8vmin; font-weight: 700; }
.demo-feedback.correct { color: #4ade80; }
.demo-feedback.wrong { color: #f87171; }
.tut-nav { display: flex; gap: 2.5vmin; justify-content: center; margin-top: 3vmin; }
.nav-btn {
  padding: 1.5vmin 4vmin;
  font-size: 2.2vmin; font-weight: 700;
  border-radius: 1vmin; cursor: pointer;
  border: 0.2vmin solid rgba(200,150,255,0.4);
  background: transparent; color: #c084fc;
  transition: all 0.2s;
}
.nav-btn:hover { background: rgba(168,85,247,0.2); }
.nav-btn.primary { background: linear-gradient(135deg, #6b21a8, #a855f7); color: #fff; border-color: transparent; }
.nav-btn.primary:hover { opacity: 0.85; }
.nav-btn.skip { color: rgba(200,150,255,0.5); font-size: 1.8vmin; }
.step-dots { display: flex; gap: 1vmin; justify-content: center; margin-top: 1.5vmin; }
.dot { width: 1.2vmin; height: 1.2vmin; border-radius: 50%; background: rgba(200,150,255,0.3); }
.dot.active { background: #a855f7; }
</style>
