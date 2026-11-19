<template>
  <div class="tutorial-mask">
    <div class="tutorial-modal">
      <div class="modal-header">
        <span class="title">{{ t.tutorial.title }}</span>
        <span class="step-indicator">{{ t.tutorial.step }} {{ step + 1 }} {{ t.tutorial.of }} {{ steps.length }}</span>
      </div>

      <!-- Demo stage: shows split screen with animated stimulus and hand button pulse -->
      <div class="demo-stage">
        <div class="split left" :class="{ flash: current.stimSide === 'left' }"></div>
        <div class="split right" :class="{ flash: current.stimSide === 'right' }"></div>
        <div class="center-hint">
          <div class="hint-badge">{{ hintText }}</div>
          <div class="mapping-tag">{{ current.invert ? t.tutorial.invertMap : t.tutorial.normalMap }}</div>
        </div>
        <div class="hand-buttons">
          <div class="hand-btn left-btn" :class="{ pulse: current.handSide === 'left' }">
            <div class="key-cap">A</div>
            <div class="label">{{ t.tutorial.leftHand }}</div>
          </div>
          <div class="hand-btn right-btn" :class="{ pulse: current.handSide === 'right' }">
            <div class="key-cap">L</div>
            <div class="label">{{ t.tutorial.rightHand }}</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="skip-btn" @click="$emit('skip')">{{ t.tutorial.skip }}</button>
        <div class="nav">
          <button class="nav-btn" :disabled="step === 0" @click="prev">{{ t.tutorial.prev }}</button>
          <button v-if="step < steps.length - 1" class="nav-btn primary" @click="next">{{ t.tutorial.next }}</button>
          <button v-else class="nav-btn primary" @click="$emit('done')">{{ t.tutorial.done }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TutorialView',
  props: { t: { type: Object, required: true } },
  data() {
    return {
      step: 0,
      steps: [
        { stimSide: 'left',  handSide: 'left',  invert: false },
        { stimSide: 'right', handSide: 'right', invert: false },
        { stimSide: 'left',  handSide: 'right', invert: true  },
        { stimSide: 'right', handSide: 'left',  invert: true  }
      ]
    }
  },
  computed: {
    current() { return this.steps[this.step] },
    hintText() {
      const s = this.current
      if (!s.invert && s.stimSide === 'left') return this.t.tutorial.hintLeft
      if (!s.invert && s.stimSide === 'right') return this.t.tutorial.hintRight
      if (s.invert && s.stimSide === 'left') return this.t.tutorial.hintLeftInv
      return this.t.tutorial.hintRightInv
    }
  },
  methods: {
    prev() { if (this.step > 0) this.step-- },
    next() { if (this.step < this.steps.length - 1) this.step++ }
  }
}
</script>

<style scoped>
.tutorial-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.tutorial-modal {
  width: min(90vw, calc(var(--u) * 70));
  height: min(85vh, calc(var(--u) * 55));
  background: #fff;
  border-radius: calc(var(--u) * 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
.modal-header {
  padding: calc(var(--u) * 1.2) calc(var(--u) * 2);
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header .title { font-size: calc(var(--u) * 1.8); font-weight: 600; }
.modal-header .step-indicator { font-size: calc(var(--u) * 1.3); opacity: 0.9; }
.demo-stage {
  flex: 1;
  position: relative;
  display: flex;
  background: #fafbfd;
}
.split {
  flex: 1;
  transition: background-color .25s ease;
  background: #e8ecf5;
}
.split.right { border-left: 2px dashed #cfd6e6; }
.split.flash {
  animation: flashRed 1.2s ease-in-out infinite;
}
@keyframes flashRed {
  0%, 100% { background: #e8ecf5; }
  50% { background: #ff4d4f; }
}
.center-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 3;
}
.hint-badge {
  padding: calc(var(--u) * 1) calc(var(--u) * 1.8);
  background: rgba(255,255,255,0.95);
  border: 2px solid #667eea;
  color: #333;
  font-size: calc(var(--u) * 1.6);
  font-weight: 600;
  border-radius: calc(var(--u) * 0.8);
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
.mapping-tag {
  margin-top: calc(var(--u) * 0.8);
  font-size: calc(var(--u) * 1.2);
  color: #667eea;
}
.hand-buttons {
  position: absolute;
  bottom: calc(var(--u) * 2);
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 calc(var(--u) * 3);
  z-index: 2;
}
.hand-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--u) * 0.5);
  transition: transform .2s;
}
.hand-btn .key-cap {
  width: calc(var(--u) * 5);
  height: calc(var(--u) * 5);
  border-radius: calc(var(--u) * 0.8);
  background: #fff;
  border: 3px solid #b0b8cc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--u) * 2.4);
  font-weight: 700;
  color: #333;
  box-shadow: 0 4px 0 #b0b8cc;
}
.hand-btn .label { font-size: calc(var(--u) * 1.2); color: #555; }
.hand-btn.pulse .key-cap {
  animation: pulseKey 1.2s ease-in-out infinite;
  border-color: #52c41a;
  color: #52c41a;
}
@keyframes pulseKey {
  0%, 100% { transform: translateY(0); box-shadow: 0 4px 0 #52c41a; }
  50% { transform: translateY(3px); box-shadow: 0 1px 0 #52c41a; background: #f6ffed; }
}
.modal-footer {
  padding: calc(var(--u) * 1.2) calc(var(--u) * 2);
  border-top: 1px solid #eef0f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}
.skip-btn {
  padding: calc(var(--u) * 1.2) calc(var(--u) * 2.6);
  font-size: calc(var(--u) * 1.7);
  font-weight: 600;
  background: #f0f2f8;
  color: #555;
  border: 2px solid #b8bfd0;
  border-radius: calc(var(--u) * 0.7);
  cursor: pointer;
  min-width: calc(var(--u) * 10);
}
.nav { display: flex; gap: calc(var(--u) * 1.4); }
.nav-btn {
  padding: calc(var(--u) * 1.3) calc(var(--u) * 3);
  font-size: calc(var(--u) * 1.9);
  font-weight: 700;
  border: 2px solid #667eea;
  background: #fff;
  color: #667eea;
  border-radius: calc(var(--u) * 0.7);
  cursor: pointer;
  min-width: calc(var(--u) * 11);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.nav-btn.primary {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
  box-shadow: 0 4px 14px rgba(102,126,234,0.5);
}

@media (orientation: portrait) {
  .tutorial-modal {
    width: 94vw;
    height: 80vh;
    border-radius: 3vmin;
  }
  .modal-header {
    padding: 2.4vmin 3.6vmin;
    padding-top: calc(2.4vmin + env(safe-area-inset-top));
  }
  .modal-header .title { font-size: max(4vmin, 16px); }
  .modal-header .step-indicator { font-size: max(3vmin, 12px); }
  .hint-badge {
    padding: 2vmin 3vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 2vmin;
  }
  .mapping-tag { font-size: max(3vmin, 12px); margin-top: 1.4vmin; }
  .hand-buttons { padding: 0 6vw; bottom: 3vmin; }
  .hand-btn .key-cap {
    width: max(11vmin, 44px);
    height: max(11vmin, 44px);
    font-size: max(5.4vmin, 22px);
    border-radius: 2vmin;
  }
  .hand-btn .label { font-size: max(2.8vmin, 12px); }
  .modal-footer {
    padding: 2.4vmin 3.2vmin;
    padding-bottom: calc(2.4vmin + env(safe-area-inset-bottom));
    flex-wrap: wrap;
    gap: 2vmin;
  }
  .skip-btn {
    padding: 2.6vmin 4.4vmin;
    font-size: max(4vmin, 16px);
    border-radius: 2.4vmin;
    min-width: 24vw;
  }
  .nav { gap: 3vmin; }
  .nav-btn {
    padding: 2.8vmin 5vmin;
    font-size: max(4.4vmin, 18px);
    border-radius: 2.4vmin;
    min-width: 28vw;
  }
}
</style>
