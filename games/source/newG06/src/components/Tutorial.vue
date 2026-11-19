<template>
  <div class="modal-mask">
    <div class="modal">
      <h2>{{ t.tutorialTitle }} ({{ step }}/3)</h2>

      <div class="demo">
        <div class="demo-board">
          <div
            v-for="card in demoCards"
            :key="card.id"
            class="demo-card"
            :class="{ revealed: card.showFace, matched: card.matched }"
          >
            <img class="demo-img" :src="card.showFace ? card.src : cardBack" alt="card" />
            <div v-if="card.matched" class="demo-badge">✓</div>
          </div>
        </div>
        <p class="demo-text">{{ stepText }}</p>
      </div>

      <div class="modal-footer">
        <button class="menu-btn" @click="$emit('skip')">{{ t.skip }}</button>
        <button class="menu-btn" :disabled="step === 1" @click="prev">{{ t.prev }}</button>
        <button v-if="step < 3" class="menu-btn primary" @click="next">{{ t.next }}</button>
        <button v-else class="menu-btn primary" @click="$emit('finish')">{{ t.finish }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { CARD_BACK, CARD_POOL } from '../game.js'

export default {
  name: 'Tutorial',
  props: { t: Object },
  data() {
    const sample = [CARD_POOL[0], CARD_POOL[1]]
    const cards = [
      { id: 0, src: sample[0] }, { id: 1, src: sample[1] },
      { id: 2, src: sample[1] }, { id: 3, src: sample[0] },
    ]
    return { step: 1, cardBack: CARD_BACK, cards }
  },
  computed: {
    stepText() {
      return [this.t.tutorialStep1, this.t.tutorialStep2, this.t.tutorialStep3][this.step - 1]
    },
    demoCards() {
      return this.cards.map((c, i) => {
        let showFace = false
        let matched = false
        if (this.step === 1) showFace = true
        else if (this.step === 3) {
          if (i === 0 || i === 3) { showFace = true; matched = true }
        }
        return { ...c, showFace, matched }
      })
    },
  },
  methods: {
    next() { if (this.step < 3) this.step++ },
    prev() { if (this.step > 1) this.step-- },
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.7);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: #1f1850; border: 1px solid #5d4cae; border-radius: 2vmin;
  padding: 3vmin; color: #fff; width: 70vmin; max-width: 95vw;
}
.modal h2 { text-align: center; font-size: 3vmin; margin-bottom: 2vmin; }
.demo { display: flex; flex-direction: column; align-items: center; gap: 2vmin; }
.demo-board {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5vmin;
  width: 40vmin;
}
.demo-card {
  aspect-ratio: 3/4; position: relative; border-radius: 1vmin; overflow: hidden;
  border: .4vmin solid #f6c04a; background: #1a1140;
  transition: border-color .3s, box-shadow .3s;
}
.demo-card.revealed { border-color: #c0b3ff; }
.demo-card.matched {
  border-color: #5cffb0;
  box-shadow: 0 0 1.2vmin #5cffb0, inset 0 0 1vmin rgba(92,255,176,.4);
}
.demo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.demo-badge {
  position: absolute; top: .6vmin; right: .6vmin;
  width: 3.4vmin; height: 3.4vmin; border-radius: 50%;
  background: #5cffb0; color: #062a18;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2vmin; font-weight: bold;
}
.demo-text { font-size: 2.2vmin; text-align: center; max-width: 60vmin; }
.modal-footer { margin-top: 2vmin; display: flex; justify-content: center; gap: 1.5vmin; }
.menu-btn {
  padding: 1.5vmin 3vmin; font-size: 2vmin; border-radius: 1vmin;
  border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.1);
  color: #fff; cursor: pointer;
}
.menu-btn:hover:not(:disabled) { background: rgba(255,255,255,.2); }
.menu-btn:disabled { opacity: .4; cursor: not-allowed; }
.menu-btn.primary {
  background: linear-gradient(180deg, #f6c04a, #c98212); border-color: #f6c04a;
  color: #2a1a05; font-weight: bold;
}
.menu-btn.primary:hover:not(:disabled),
.menu-btn.primary:focus,
.menu-btn.primary:focus-visible,
.menu-btn.primary:active {
  background: linear-gradient(180deg, #f6c04a, #c98212);
  border-color: #f6c04a;
  color: #2a1a05;
  outline: none;
}

@media (orientation: portrait) {
  .modal {
    width: 92vw; max-width: 92vw;
    padding: 5vmin 4vmin;
    padding-top: calc(5vmin + env(safe-area-inset-top));
    padding-bottom: calc(5vmin + env(safe-area-inset-bottom));
    max-height: 92vh; overflow: auto;
  }
  .modal h2 { font-size: max(5vmin, 20px); margin-bottom: 3vmin; }
  .demo-board { width: 60vmin; gap: 2.5vmin; }
  .demo-text {
    font-size: max(4vmin, 15px);
    max-width: 90%;
    line-height: 1.5;
  }
  .modal-footer {
    flex-wrap: wrap; gap: 2vmin;
  }
  .menu-btn {
    flex: 1 1 40%;
    padding: 14px 18px;
    font-size: max(4vmin, 16px);
    border-radius: 14px;
  }
}
</style>
