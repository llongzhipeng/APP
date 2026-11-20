<template>
  <div class="overlay">
    <div class="modal">
      <div class="step-area">
        <!-- Step 1: Colors visible -->
        <div class="demo-scene" v-if="step===0">
          <div class="demo-blocks">
            <div v-for="(c,i) in demoColors3" :key="i" class="demo-block" :style="{background:c}" :class="{revealed:true}" />
          </div>
          <div class="demo-label">{{ stepLabels[0] }}</div>
        </div>
        <!-- Step 2: Colors hidden -->
        <div class="demo-scene" v-else-if="step===1">
          <div class="demo-blocks">
            <div v-for="i in 3" :key="i" class="demo-block hidden-block" />
          </div>
          <div class="demo-label">{{ stepLabels[1] }}</div>
        </div>
        <!-- Step 3: Question shown -->
        <div class="demo-scene" v-else-if="step===2">
          <div class="question-card">
            <div class="q-arrow">?</div>
            <div class="q-color-box" :style="{background: demoColors3[0]}" />
          </div>
          <div class="demo-blocks">
            <div v-for="i in 3" :key="i" class="demo-block hidden-block" />
          </div>
          <div class="demo-label">{{ stepLabels[2] }}</div>
        </div>
        <!-- Step 4: Correct block clicked -->
        <div class="demo-scene" v-else-if="step===3">
          <div class="question-card">
            <div class="q-arrow">?</div>
            <div class="q-color-box" :style="{background: demoColors3[0]}" />
          </div>
          <div class="demo-blocks">
            <div v-for="(c,i) in demoColors3" :key="i" class="demo-block"
              :style="{background: i===0 ? c : '#2a3a5a'}"
              :class="{'correct-pulse': i===0}" />
          </div>
          <div class="demo-label">{{ stepLabels[3] }}</div>
        </div>
      </div>

      <div class="dots">
        <span v-for="i in 4" :key="i" class="dot" :class="{active: step===i-1}" @click="step=i-1" />
      </div>

      <div class="actions">
        <button class="btn-skip" @click="$emit('skip')">{{ T.skip }}</button>
        <button class="btn-nav" v-if="step>0" @click="step--">{{ T.prev }}</button>
        <button class="btn-nav btn-next" v-if="step<3" @click="step++">{{ T.next }}</button>
        <button class="btn-done" v-if="step===3" @click="$emit('done')">{{ T.startNow }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  props: ['lang'],
  data() { return { step: 0, demoColors3: ['#E74C3C','#3498DB','#2ECC71'] } },
  computed: {
    T() { return t[this.lang] },
    stepLabels() {
      return [this.T.tutStep1, this.T.tutStep2, this.T.tutStep3, this.T.tutStep4]
    },
  },
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: #f3e3ec;
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #fff9fc; color: #3b2537; border: 1px solid #e7ccd9; border-radius: 2vmin; padding: 3vmin;
  width: min(70vmin, 92vw); max-height: 92vh; overflow-y: auto;
  display: flex; flex-direction: column;
  align-items: center; gap: 2.5vmin;
}
.step-area { width: 100%; min-height: 28vmin; }
.demo-scene { display: flex; flex-direction: column; align-items: center; gap: 2vmin; }
.demo-blocks { display: flex; gap: 2vmin; justify-content: center; }
.demo-block {
  width: 10vmin; height: 10vmin; border-radius: 1.5vmin;
  transition: background .5s; border: 2px solid rgba(255,255,255,.15);
}
.hidden-block { background: #2a3a5a !important; }
.demo-label { font-size: 2.2vmin; color: #6b5062; text-align: center; }
.question-card {
  display: flex; align-items: center; gap: 1.5vmin;
  background: #f3e5ee; border-radius: 1.5vmin;
  padding: 1.2vmin 2.5vmin;
}
.q-arrow { font-size: 3.5vmin; font-weight: 700; color: #54354b; }
.q-color-box { width: 4vmin; height: 4vmin; border-radius: 0.8vmin; border: 2px solid rgba(255,255,255,.3); }
.correct-pulse { animation: pulse .6s ease; }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
.dots { display: flex; gap: 1.5vmin; }
.dot {
  width: 1.5vmin; height: 1.5vmin; border-radius: 50%;
  background: #2a3a5a; cursor: pointer; transition: background .2s;
}
.dot.active { background: #3a7bd5; }
.actions {
  display: flex; gap: 1.6vmin; align-items: center;
  flex-wrap: wrap; justify-content: center; width: 100%;
}
.btn-skip {
  background: transparent; color: #6b5062;
  font-size: clamp(13px, 1.8vmin, 18px); text-decoration: underline;
  padding: 0.6vmin 1.2vmin;
}
.btn-nav {
  background: #f1e3ee; color: #54354b;
  padding: clamp(8px, 1.2vmin, 16px) clamp(16px, 3vmin, 30px);
  border-radius: 1.2vmin; font-size: clamp(14px, 2vmin, 22px);
  min-width: 12vmin;
}
.btn-nav:hover { background: #e9d5e4; }
.btn-done {
  background: #3a7bd5; color: #fff;
  padding: clamp(8px, 1.2vmin, 16px) clamp(16px, 3vmin, 30px);
  border-radius: 1.2vmin; font-size: clamp(14px, 2vmin, 22px); font-weight: 600;
  min-width: 12vmin;
}
.btn-done:hover { background: #4e8fe0; }

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .modal {
    width: 92vw;
    padding: 5vw;
    border-radius: 4vw;
    gap: 5vw;
  }
  .step-area { min-height: 50vw; }
  .demo-scene { gap: 4vw; }
  .demo-blocks { gap: 4vw; }
  .demo-block { width: 18vw; height: 18vw; border-radius: 3vw; }
  .demo-label { font-size: max(4vw, 15px); }
  .question-card { gap: 3vw; padding: 3vw 5vw; border-radius: 3vw; }
  .q-arrow { font-size: max(7vw, 26px); }
  .q-color-box { width: 8vw; height: 8vw; border-radius: 2vw; }
  .dots { gap: 3vw; }
  .dot { width: 3vw; height: 3vw; }
  .actions { gap: 3vw; }
  .btn-skip { font-size: max(3.6vw, 14px); }
  .btn-nav, .btn-done {
    padding: max(3vw, 12px) max(5vw, 20px);
    border-radius: 2.4vw;
    font-size: max(4vw, 15px);
    min-width: 24vw;
  }
}
</style>
