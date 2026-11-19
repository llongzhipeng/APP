<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h2 class="modal-title">{{ t.tutorialTitle }}</h2>
      <div class="tutorial-stage">
        <!-- Step 1: fish appear with numbers -->
        <div v-if="step === 0" class="tut-step">
          <div class="tut-ocean">
            <div v-for="f in tutFish" :key="f.id" class="tut-fish-wrap" :style="f.style">
              <img :src="f.src" class="tut-fish-img" />
              <span class="tut-number">{{ f.num }}</span>
            </div>
          </div>
          <p class="tut-hint">{{ t.lang === 'EN' ? 'Fish appear with numbers — memorize them!' : '小鱼出现，记住它们身上的数字！' }}</p>
        </div>
        <!-- Step 2: numbers hidden -->
        <div v-else-if="step === 1" class="tut-step">
          <div class="tut-ocean">
            <div v-for="f in tutFish" :key="f.id" class="tut-fish-wrap" :style="f.style">
              <img :src="f.src" class="tut-fish-img" />
              <span class="tut-number hidden">?</span>
            </div>
          </div>
          <p class="tut-hint">{{ t.lang === 'EN' ? 'Numbers are hidden — remember the order!' : '数字隐藏了，凭记忆找到顺序！' }}</p>
        </div>
        <!-- Step 3: click in order demo -->
        <div v-else-if="step === 2" class="tut-step">
          <div class="tut-ocean">
            <div
              v-for="f in tutFish" :key="f.id"
              class="tut-fish-wrap"
              :class="{ clicked: clickedIds.includes(f.id), next: f.id === nextId }"
              :style="f.style"
              @click="tutClick(f)"
            >
              <img :src="f.src" class="tut-fish-img" />
              <span class="tut-number hidden">?</span>
              <span v-if="clickedIds.includes(f.id)" class="tut-check">✓</span>
              <span v-if="f.id === nextId" class="tut-arrow">👆</span>
            </div>
          </div>
          <p class="tut-hint">{{ t.lang === 'EN' ? 'Click fish from smallest to largest number!' : '按数字从小到大依次点击小鱼！' }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="tut-btn skip" @click="$emit('done')">{{ t.tutorialSkip }}</button>
        <div class="step-dots">
          <span v-for="i in 3" :key="i" class="dot" :class="{ active: step === i-1 }"></span>
        </div>
        <div class="nav-btns">
          <button v-if="step > 0" class="tut-btn nav" @click="step--">{{ t.tutorialPrev }}</button>
          <button v-if="step < 2" class="tut-btn nav primary" @click="nextStep">{{ t.tutorialNext }}</button>
          <button v-else class="tut-btn nav primary" @click="$emit('done')">{{ t.tutorialStart }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fishImage } from '../../utils/images'

export default {
  name: 'TutorialModal',
  props: { t: Object },
  emits: ['done'],
  data() {
    return {
      step: 0,
      clickedIds: [],
      tutFish: [
        { id: 0, num: 3, src: fishImage(1), style: { left: '15%', top: '30%' } },
        { id: 1, num: 7, src: fishImage(2), style: { left: '50%', top: '20%' } },
        { id: 2, num: 1, src: fishImage(3), style: { left: '72%', top: '45%' } },
      ],
    }
  },
  computed: {
    sortedFish() {
      return [...this.tutFish].sort((a, b) => a.num - b.num)
    },
    nextId() {
      const remaining = this.sortedFish.filter(f => !this.clickedIds.includes(f.id))
      return remaining.length ? remaining[0].id : -1
    },
  },
  methods: {
    nextStep() {
      this.clickedIds = []
      this.step++
    },
    tutClick(f) {
      if (f.id === this.nextId) {
        this.clickedIds.push(f.id)
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: absolute; inset: 0; z-index: 100;
  background: rgba(0,10,30,0.7); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: rgba(0,30,70,0.92); border: 1px solid rgba(0,180,255,0.3);
  border-radius: 24px; padding: 36px 44px; width: 680px;
  color: #fff; display: flex; flex-direction: column; gap: 24px;
}
.modal-title { font-size: 26px; font-weight: 800; text-align: center; color: #7ee8fa; }
.tutorial-stage { height: 260px; }
.tut-step { height: 100%; display: flex; flex-direction: column; gap: 12px; }
.tut-ocean {
  flex: 1; position: relative;
  background: rgba(0,100,180,0.15); border-radius: 16px;
  border: 1px solid rgba(0,180,255,0.2);
}
.tut-fish-wrap {
  position: absolute; width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform 0.2s;
}
.tut-fish-wrap.next { animation: bounce 0.6s ease-in-out infinite alternate; }
.tut-fish-wrap.clicked { opacity: 0.4; }
@keyframes bounce { from{transform:scale(1)} to{transform:scale(1.15)} }
.tut-fish-img { width: 70px; height: 70px; object-fit: contain; }
.tut-number {
  position: absolute; top: -4px; right: -4px;
  background: #ff6b35; color: #fff; border-radius: 50%;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; border: 2px solid #fff;
}
.tut-number.hidden { background: rgba(0,0,0,0.5); }
.tut-check {
  position: absolute; top: -4px; right: -4px;
  background: #4caf50; color: #fff; border-radius: 50%;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800;
}
.tut-arrow { position: absolute; bottom: -24px; font-size: 18px; }
.tut-hint { text-align: center; font-size: 15px; color: rgba(255,255,255,0.8); }
.modal-footer { display: flex; align-items: center; justify-content: space-between; }
.step-dots { display: flex; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.3); }
.dot.active { background: #7ee8fa; }
.nav-btns { display: flex; gap: 10px; }
.tut-btn {
  padding: 8px 20px; border-radius: 20px; border: none;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.tut-btn.skip { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
.tut-btn.skip:hover { background: rgba(255,255,255,0.2); }
.tut-btn.nav { background: rgba(255,255,255,0.15); color: #fff; }
.tut-btn.nav.primary { background: linear-gradient(135deg, #00b4ff, #0066cc); color: #fff; }
.tut-btn.nav:hover { transform: translateY(-2px); }
</style>
