<template>
  <div class="tutorial">
    <Starfield />
    <div class="content">
      <div class="stage">
        <!-- Step preview area -->
        <div class="preview">
          <!-- Step 1: show 4 planets in space -->
          <div v-if="step === 1" class="scene">
            <Planet v-for="(p, i) in demoPlanets1" :key="i"
              :name="p.name" :theme="p.theme" :seed="p.seed"
              :style="{ left: p.x + '%', top: p.y + '%', width: '18%' }"
              :disabled="true" />
          </div>

          <!-- Step 2: highlight order 1,2 -->
          <div v-if="step === 2" class="scene">
            <div class="prompt-preview">
              <span class="tag">{{ t.question }}:</span>
              <span class="order">1. {{ demoOrder[0] }} → 2. {{ demoOrder[1] }}</span>
            </div>
            <Planet v-for="(p, i) in demoPlanets2" :key="i"
              :name="p.name" :theme="p.theme" :seed="p.seed"
              :highlight="p.highlight"
              :style="{ left: p.x + '%', top: p.y + '%', width: '18%' }"
              :disabled="true" />
          </div>

          <!-- Step 3: click animation -->
          <div v-if="step === 3" class="scene">
            <Planet v-for="(p, i) in demoPlanets2" :key="i"
              :name="p.name" :theme="p.theme" :seed="p.seed"
              :state="p.demoState"
              :style="{ left: p.x + '%', top: p.y + '%', width: '18%' }"
              :disabled="true" />
            <div class="finger" :style="{ left: fingerX + '%', top: fingerY + '%' }">👆</div>
          </div>

          <!-- Step 4: score up -->
          <div v-if="step === 4" class="scene celebrate">
            <div class="big-score">+{{ Math.round(5 * 3.5) }}</div>
            <div class="cheer">🎉</div>
            <Planet v-for="(p, i) in demoPlanets4" :key="i"
              :name="p.name" :theme="p.theme" :seed="p.seed"
              :style="{ left: p.x + '%', top: p.y + '%', width: '15%' }"
              :disabled="true" />
          </div>
        </div>

        <div class="caption">{{ captions[step - 1] }}</div>
      </div>

      <div class="dots">
        <span v-for="n in 4" :key="n" class="dot" :class="{active: n === step}"></span>
      </div>

      <div class="controls">
        <button class="btn ghost" @click="$emit('skip')">{{ t.skip }}</button>
        <button class="btn" :disabled="step === 1" @click="step > 1 && step--">◀ {{ t.prev }}</button>
        <button v-if="step < 4" class="btn primary" @click="step++">{{ t.next }} ▶</button>
        <button v-else class="btn primary" @click="$emit('done')">{{ t.startPlay }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Starfield from './Starfield.vue'
import Planet from './Planet.vue'
import { PLANET_THEMES } from '../utils/game.js'

export default {
  name: 'Tutorial',
  components: { Starfield, Planet },
  props: { t: Object, lang: String },
  data() {
    const names = this.t.planetNames
    const demoPlanets1 = [
      { name: names[0], theme: PLANET_THEMES[0], seed: 1, x: 20, y: 40 },
      { name: names[1], theme: PLANET_THEMES[2], seed: 2, x: 45, y: 30 },
      { name: names[2], theme: PLANET_THEMES[4], seed: 3, x: 70, y: 45 },
      { name: names[3], theme: PLANET_THEMES[6], seed: 4, x: 82, y: 68 }
    ]
    const demoPlanets2 = [
      { name: names[0], theme: PLANET_THEMES[0], seed: 1, x: 20, y: 40, highlight: true, demoState: '' },
      { name: names[1], theme: PLANET_THEMES[2], seed: 2, x: 45, y: 30, highlight: false, demoState: '' },
      { name: names[2], theme: PLANET_THEMES[4], seed: 3, x: 70, y: 45, highlight: true, demoState: '' },
      { name: names[3], theme: PLANET_THEMES[6], seed: 4, x: 82, y: 68, highlight: false, demoState: '' }
    ]
    const demoPlanets4 = [
      { name: names[5], theme: PLANET_THEMES[7], seed: 5, x: 30, y: 55 },
      { name: names[6], theme: PLANET_THEMES[9], seed: 6, x: 55, y: 45 },
      { name: names[7], theme: PLANET_THEMES[11], seed: 7, x: 75, y: 60 }
    ]
    return {
      step: 1,
      demoPlanets1,
      demoPlanets2,
      demoPlanets4,
      demoOrder: [names[0], names[2]],
      fingerX: 50, fingerY: 50,
      animTimer: null
    }
  },
  computed: {
    captions() {
      return [this.t.tutorialStep1, this.t.tutorialStep2, this.t.tutorialStep3, this.t.tutorialStep4]
    }
  },
  watch: {
    step(v) {
      clearInterval(this.animTimer)
      if (v === 3) this.animateStep3()
    }
  },
  methods: {
    animateStep3() {
      // finger moves to planet[0], click, then to planet[2], click
      const seq = [
        { x: 20, y: 42 },
        { action: 'click', idx: 0 },
        { x: 70, y: 47 },
        { action: 'click', idx: 2 }
      ]
      let i = 0
      const run = () => {
        if (this.step !== 3) return
        const s = seq[i % seq.length]
        if (s.action === 'click') {
          this.demoPlanets2.forEach((p, k) => { p.demoState = k === s.idx ? 'correct' : '' })
        } else {
          this.demoPlanets2.forEach(p => p.demoState = '')
          this.fingerX = s.x; this.fingerY = s.y
        }
        i++
        this.animTimer = setTimeout(run, 900)
      }
      run()
    }
  },
  beforeDestroy() { clearInterval(this.animTimer); clearTimeout(this.animTimer) }
}
</script>

<style scoped>
.tutorial { position: absolute; inset: 0; overflow: hidden; color: #fff; }
.content {
  position: relative; z-index: 2;
  height: 100%; display: flex; flex-direction: column; padding: 4vh 4vw;
}
.stage { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1em; min-height: 0; }
.preview {
  flex: 1;
  width: 100%;
  max-width: 60em;
  border-radius: 1.5em;
  border: 1px solid rgba(140, 180, 255, 0.25);
  background: rgba(10, 15, 40, 0.35);
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
  min-height: 0;
  box-shadow: 0 20px 60px rgba(0,0,0,.5) inset;
}
.scene { position: absolute; inset: 0; }

.prompt-preview {
  position: absolute; top: 1em; left: 50%; transform: translateX(-50%);
  padding: 0.7em 1.5em;
  background: rgba(20, 30, 70, 0.85);
  border: 1px solid rgba(255, 220, 120, 0.5);
  border-radius: 999px;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  letter-spacing: 0.05em;
  z-index: 5;
}
.prompt-preview .tag { color: #a5c8ff; margin-right: 0.6em; }
.prompt-preview .order { color: #ffd43b; }

.finger {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 3em;
  transition: all 0.7s cubic-bezier(.34,1.56,.64,1);
  z-index: 10;
  filter: drop-shadow(0 0 15px rgba(255,255,255,0.5));
}

.celebrate { display: flex; align-items: center; justify-content: center; }
.big-score {
  position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 6em;
  color: #ffd43b;
  text-shadow: 0 0 40px rgba(255, 212, 59, 0.8);
  animation: rise 1.5s ease-out infinite;
  z-index: 5;
}
@keyframes rise { 0%{transform:translate(-50%,-50%) scale(.8); opacity:0} 30%{opacity:1} 100%{transform:translate(-50%,-120%) scale(1.2); opacity:0} }
.cheer { position: absolute; top: 30%; font-size: 5em; animation: bounce 1s ease-in-out infinite; z-index: 4; }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }

.caption {
  text-align: center;
  color: #e0ecff;
  font-size: 1.5em;
  font-weight: 500;
  line-height: 1.55;
  max-width: 40em;
  padding: 0 1em;
}

.dots { display: flex; gap: 0.7em; justify-content: center; margin: 1.2em 0; }
.dot { width: 1em; height: 1em; border-radius: 999px; background: rgba(140, 180, 255, 0.35); transition: all .3s; }
.dot.active { background: linear-gradient(135deg, #3d5afe, #7c4dff); width: 3em; }

.controls { display: flex; gap: 1.2em; justify-content: center; flex-wrap: wrap; }
.btn {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  padding: 1em 2.2em;
  font-size: 1.15em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.45);
  background: rgba(20, 30, 70, 0.55);
  color: #e0ecff;
  cursor: pointer;
  letter-spacing: 0.18em;
  font-weight: 700;
  transition: all .2s;
  backdrop-filter: blur(10px);
}
.btn:hover:not(:disabled) { background: rgba(90, 120, 220, 0.5); color: #fff; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn.ghost { background: transparent; color: #8fa8d8; }
.btn.primary {
  background: linear-gradient(135deg, #3d5afe 0%, #7c4dff 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 5px 20px rgba(90, 100, 255, 0.4);
}
</style>
