<template>
  <div class="tutorial-screen">
    <!-- Big pond stage: shows ducks INSIDE the pond area (matching background image) -->
    <div class="tut-stage">
      <div class="tut-pond-zone">
        <!-- Step 0: Ducks appear in pond -->
        <template v-if="step===0">
          <img v-for="d in tutDucks" :key="d.id" :src="d.src"
            class="tut-duck" :style="{left:d.x+'%',top:d.y+'%',width:d.s+'%'}" />
        </template>
        <!-- Step 1+: Same ducks + question bubble above -->
        <template v-else>
          <img v-for="d in tutDucks" :key="d.id" :src="d.src"
            class="tut-duck" :style="{left:d.x+'%',top:d.y+'%',width:d.s+'%'}" />
        </template>
      </div>

      <!-- Overlay UI on top -->
      <div class="tut-overlay">
        <div v-if="step===1 || step===2 || step===3" class="tut-question-bubble">
          <img :src="resolveImage('/images/2.png')" class="q-duck" />
          <span class="q-text">?</span>
        </div>

        <div v-if="step===2 || step===3" class="tut-answers">
          <div v-for="n in [1,2,3,4]" :key="n"
            class="tut-ans-btn"
            :class="{ correct: step===3 && n===2, pulse: step===3 && n===2 }">{{ n }}</div>
        </div>

        <div v-if="step===3" class="tut-check">✓</div>
      </div>
    </div>

    <!-- Controls at bottom -->
    <div class="tut-controls">
      <div class="tut-dots">
        <span v-for="i in 4" :key="i" class="dot" :class="{active: step===i-1}" @click="step=i-1"></span>
      </div>
      <div class="tut-nav">
        <button class="btn-skip" @click="$emit('skip')">{{ t('skip') }}</button>
        <button v-if="step>0" class="btn-nav" @click="step--">{{ t('prev') }}</button>
        <button v-if="step<3" class="btn-nav primary" @click="step++">{{ t('next') }}</button>
        <button v-else class="btn-nav primary" @click="$emit('done')">{{ t('startTrain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
import { t } from '../i18n.js'
export default {
  props: ['lang'],
  data() {
    return {
      step: 0,
      // Coordinates are within pond zone (0-100% of pond zone rectangle)
      tutDucks: [
        { id:1, src:resolveImage('/images/2.png'), x:5,  y:15, s:12 },
        { id:2, src:resolveImage('/images/2.png'), x:28, y:55, s:12 },
        { id:3, src:resolveImage('/images/1.png'), x:50, y:15, s:12 },
        { id:4, src:resolveImage('/images/1.png'), x:72, y:50, s:12 },
      ]
    }
  },
  methods: { t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.tutorial-screen {
  position: relative;
  width: 100%; height: 100%;
  background: url(~@/views/game/newG03/public/images/bacground.png) center/cover no-repeat;
  display: flex; flex-direction: column;
}
.tut-stage {
  position: relative;
  flex: 1;
  min-height: 0;
}

/* Pond zone matches actual water area in bacground.png */
.tut-pond-zone {
  position: absolute;
  top: 60%;
  left: 25%;
  width: 50%;
  height: 25.7%;
  overflow: hidden;
}
.tut-duck {
  position: absolute;
  object-fit: contain;
  animation: pop-in 0.4s ease both;
}
@keyframes pop-in { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }

.tut-overlay {
  position: absolute; inset: 0;
  pointer-events: none;
}
.tut-question-bubble {
  position: absolute; top: 6vmin; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 1.5vmin;
  background: rgba(255,255,255,0.95); border: 0.4vmin dashed #f5a623;
  border-radius: 2.5vmin; padding: 1.5vmin 3vmin;
}
.q-duck { width: 5vmin; }
.q-text { font-size: 5vmin; font-weight: 900; color: #f5a623; }

.tut-answers {
  position: absolute; bottom: 2vmin; left: 50%; transform: translateX(-50%);
  display: flex; gap: 3vmin;
}
.tut-ans-btn {
  width: 10vmin; height: 10vmin;
  background: rgba(74,158,255,0.95); color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 4vmin; font-weight: 900;
  box-shadow: 0 0.6vmin 1.5vmin rgba(0,0,0,0.3);
  border: 0.4vmin solid rgba(255,255,255,0.7);
}
.tut-ans-btn.correct { background: #22c55e; }
.tut-ans-btn.pulse { animation: pulse 0.6s ease infinite; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }

.tut-check {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  font-size: 15vmin; color: #22c55e; font-weight: 900;
  text-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.4);
}

.tut-controls {
  padding: 2vmin 3vmin 3vmin;
  background: rgba(255,255,255,0.9);
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  border-top: 0.3vmin solid rgba(0,0,0,0.1);
}
.tut-dots { display: flex; gap: 1.5vmin; }
.dot { width: 2vmin; height: 2vmin; border-radius: 50%; background: #ccc; cursor: pointer; }
.dot.active { background: #4a9eff; }
.tut-nav { display: flex; gap: 2.5vmin; align-items: center; }
.btn-skip {
  padding: 1.2vmin 3vmin; background: transparent; border: 0.3vmin solid #666;
  border-radius: 3vmin; cursor: pointer; font-size: 2.2vmin; color: #666; font-weight: 700;
}
.btn-nav {
  padding: 1.2vmin 3.5vmin; background: #ccc; border: none; border-radius: 3vmin;
  cursor: pointer; font-size: 2.2vmin; color: #fff; font-weight: 700;
  transition: background 0.2s;
}
.btn-nav.primary { background: #4a9eff; }
.btn-nav.primary:hover { background: #2270c4; }

/* ---------- Portrait (mobile / WeChat web-view) ---------- */
@media (orientation: portrait) {
  /* In portrait the background image water area is roughly middle band */
  .tut-pond-zone {
    top: 40%;
    left: 5%;
    width: 90%;
    height: 30%;
  }
  .tut-question-bubble {
    top: 4vmin;
    padding: 2.4vmin 4vmin;
    border-radius: 4vmin;
    gap: 2vmin;
  }
  .q-duck { width: 8vmin; }
  .q-text { font-size: max(7vmin, 24px); }

  .tut-answers { gap: 5vmin; bottom: 3vmin; }
  .tut-ans-btn {
    width: 15vmin; height: 15vmin;
    font-size: max(6vmin, 22px);
  }
  .tut-check { font-size: max(22vmin, 80px); }

  .tut-controls {
    padding: 3vmin 4vmin;
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
    gap: 3vmin;
  }
  .tut-dots { gap: 2.4vmin; }
  .dot { width: 3vmin; height: 3vmin; }
  .tut-nav { gap: 3vmin; flex-wrap: wrap; justify-content: center; }
  .btn-skip {
    padding: 2vmin 5vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 5vmin;
  }
  .btn-nav {
    padding: 2vmin 6vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 5vmin;
  }
}
</style>
