<template>
  <div class="modal-mask">
    <div class="modal">
      <h2>🎓 {{ t('tutorial') }} <span class="step-badge">{{ step + 1 }} / {{ steps.length }}</span></h2>

      <div class="stage">
        <p class="step-title">{{ t(steps[step].titleKey) }}</p>

        <!-- Bottles row (all steps share same 3 bottles) -->
        <div class="demo">
          <div v-if="step === 0 || step === 1" class="conductor-slot" :style="{ transform: 'translateX(' + conductorX + 'px)' }">
            <Conductor :tapping="conductorTapping"/>
          </div>
          <div class="bottles-row">
            <div v-for="(b, i) in demoBottles" :key="i" class="bottle-cell">
              <Bottle
                :note="b.note"
                :color="colorFor(b.note)"
                :water-level="b.waterLevel"
                :active="activeIdx === i"
                :hint="step === 2 && hintIdx === i"
                :disabled="step !== 2"
                @tap="onDemoTap(i)"
              />
            </div>
          </div>

          <div v-if="step === 2" class="user-seq">
            <span v-for="(n, i) in demoSeq" :key="i" class="seq-slot"
                  :class="{ filled: userProgress > i, current: userProgress === i }">
              {{ userProgress > i ? '✓' : (i + 1) }}
            </span>
          </div>

          <div v-if="step === 3" class="celebration">
            <div class="big-star">⭐</div>
            <div class="score-pop">+7.5</div>
          </div>
        </div>

        <p class="step-desc">{{ t('watchDemo') }}</p>
      </div>

      <div class="controls">
        <button class="btn ghost" @click="$emit('skip')">{{ t('skipTutorial') }}</button>
        <div class="dots">
          <span v-for="(_, i) in steps" :key="i" class="dot" :class="{ on: i === step }"></span>
        </div>
        <div class="nav">
          <button class="btn" :disabled="step === 0" @click="prev">← {{ t('prev') }}</button>
          <button class="btn primary" @click="next">
            {{ step === steps.length - 1 ? t('startGame') : t('next') + ' →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { NOTE_COLORS, playNote, playCorrect } from '../audio.js'
import { NOTE_WATER } from '../game.js'
import Bottle from './Bottle.vue'
import Conductor from './Conductor.vue'

export default {
  name: 'Tutorial',
  components: { Bottle, Conductor },
  props: { lang: String },
  data() {
    return {
      step: 0,
      steps: [
        { titleKey: 'tutorialStep1' },
        { titleKey: 'tutorialStep2' },
        { titleKey: 'tutorialStep3' },
        { titleKey: 'tutorialStep4' }
      ],
      demoBottles: [
        { note: 'Do',  waterLevel: NOTE_WATER.Do },
        { note: 'Mi',  waterLevel: NOTE_WATER.Mi },
        { note: 'Sol', waterLevel: NOTE_WATER.Sol }
      ],
      demoSeq: [0, 2, 1],
      activeIdx: -1,
      conductorX: 0,
      conductorTapping: false,
      hintIdx: -1,
      userProgress: 0,
      timers: []
    }
  },
  mounted() { this.playStep() },
  beforeDestroy() { this.clearTimers() },
  methods: {
    t(k) { return t(this.lang, k) },
    colorFor(n) { return NOTE_COLORS[n] },
    clearTimers() { this.timers.forEach(clearTimeout); this.timers = [] },
    schedule(fn, ms) { const id = setTimeout(fn, ms); this.timers.push(id); return id },

    prev() { if (this.step > 0) { this.step--; this.playStep() } },
    next() {
      if (this.step === this.steps.length - 1) { this.$emit('done') }
      else { this.step++; this.playStep() }
    },

    playStep() {
      this.clearTimers()
      this.activeIdx = -1
      this.hintIdx = -1
      this.userProgress = 0
      this.conductorX = 0
      if (this.step === 0 || this.step === 1) this.playConductor()
      else if (this.step === 2) this.showHint()
      else if (this.step === 3) this.celebrate()
    },
    playConductor() {
      const positions = [-130, 0, 130]
      this.demoSeq.forEach((idx, i) => {
        this.schedule(() => {
          this.conductorX = positions[idx]
          this.schedule(() => {
            this.conductorTapping = true
            this.activeIdx = idx
            playNote(this.demoBottles[idx].note, 0.8, 0, 0.4)
            this.schedule(() => { this.conductorTapping = false; this.activeIdx = -1 }, 500)
          }, 350)
        }, i * 1100)
      })
      this.schedule(() => this.playStep(), this.demoSeq.length * 1100 + 800)
    },
    showHint() {
      const advance = (i) => {
        if (i >= this.demoSeq.length) {
          this.schedule(() => { this.userProgress = 0; this.hintIdx = this.demoSeq[0]; advance(0) }, 1200)
          return
        }
        this.hintIdx = this.demoSeq[i]
      }
      advance(0)
    },
    onDemoTap(i) {
      if (this.step !== 2) return
      if (i === this.demoSeq[this.userProgress]) {
        playNote(this.demoBottles[i].note, 0.6, 0, 0.4)
        this.activeIdx = i
        this.schedule(() => { this.activeIdx = -1 }, 400)
        this.userProgress++
        this.hintIdx = this.demoSeq[this.userProgress] != null ? this.demoSeq[this.userProgress] : -1
        if (this.userProgress >= this.demoSeq.length) {
          this.schedule(() => { this.userProgress = 0; this.hintIdx = this.demoSeq[0] }, 1200)
        }
      }
    },
    celebrate() { playCorrect() }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,20,0.6);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: linear-gradient(160deg, #fff, #f2f6ff);
  border-radius: 28px;
  padding: 34px 42px;
  width: 720px; max-width: 94vw;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  animation: pop 0.28s cubic-bezier(.2,.9,.35,1.3);
}
@keyframes pop { from { transform: scale(0.9); opacity: 0; } }
h2 {
  color: #2b3f6a; font-size: 26px; text-align: center;
  margin-bottom: 20px;
  display: flex; align-items: center; justify-content: center; gap: 14px;
}
.step-badge {
  background: #4dabf7; color: #fff;
  padding: 4px 14px; border-radius: 20px; font-size: 14px;
}
.stage {
  min-height: 340px;
  background: linear-gradient(180deg, #e7f5ff, #d0ebff);
  border-radius: 20px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.step-title {
  text-align: center; font-size: 18px; color: #1971c2;
  font-weight: 700; margin-bottom: 16px;
}
.step-desc { text-align: center; color: #666; margin-top: 12px; font-size: 13px; }
.demo {
  position: relative;
  min-height: 260px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.conductor-slot {
  position: absolute; top: 0; left: 50%;
  transform: translateX(0);
  margin-left: -70px;
  transition: transform 0.5s cubic-bezier(.68,-0.2,.27,1.2);
}
.bottles-row {
  display: flex; gap: 30px; margin-top: 120px;
}
.bottle-cell { width: 90px; }
.bottle-cell >>> .bottle-wrap { width: 90px; height: 200px; }
.user-seq { display: flex; gap: 12px; margin-top: 12px; }
.seq-slot {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 2px dashed #adb5bd;
  display: flex; align-items: center; justify-content: center;
  color: #adb5bd; font-weight: 700;
}
.seq-slot.filled { background: #37b24d; color: #fff; border-color: #37b24d; border-style: solid; }
.seq-slot.current { border-color: #f59f00; color: #f59f00; animation: blink 0.8s infinite; }
@keyframes blink { 50% { opacity: 0.4; } }
.celebration {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 20px;
}
.big-star { font-size: 100px; animation: spin 1.4s ease-in-out infinite; }
.score-pop { font-size: 44px; color: #ef476f; font-weight: 800; }
@keyframes spin {
  0%,100% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.3) rotate(20deg); }
}

.controls {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 22px;
}
.dots { display: flex; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #ced4da; transition: all 0.2s; }
.dot.on { background: #4dabf7; width: 30px; border-radius: 6px; }
.nav { display: flex; gap: 10px; }
.btn {
  padding: 14px 30px; border-radius: 14px; border: none;
  cursor: pointer; font-size: 18px; font-weight: 700;
  background: #e9ecef; color: #495057;
  transition: all 0.2s;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }
.btn.primary {
  background: linear-gradient(135deg, #4dabf7, #339af0);
  color: #fff;
  padding: 14px 34px;
}
.btn.ghost { background: transparent; color: #868e96; font-size: 16px; }
</style>
