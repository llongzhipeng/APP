<template>
  <div class="duration-screen">
    <h2 class="dur-title">{{ t.selectDuration }}</h2>
    <p class="dur-hint">{{ t.durHint }}</p>

    <div class="dur-btns">
      <button
        v-for="opt in options"
        :key="opt.seconds"
        class="dur-btn"
        :class="{ selected: selected === opt.seconds }"
        @click="selected = opt.seconds"
      >
        <span class="dur-number">{{ opt.number }}</span>
        <span class="dur-label">{{ opt.label }}</span>
      </button>
    </div>

    <div class="dur-actions">
      <button class="action-btn back-btn" @click="$emit('back')">
        <span class="btn-arrow">&#8592;</span>
        {{ t.durBack }}
      </button>
      <button
        class="action-btn start-btn"
        :disabled="selected === null"
        @click="onStart"
      >
        {{ t.durStart }}
        <span class="btn-arrow">&#8594;</span>
      </button>
    </div>
  </div>
</template>

<script>
import { unlockAudio } from '../voicePlayer.js'

export default {
  name: 'DurationScreen',
  props: {
    t: { type: Object, required: true },
    lang: { type: String, default: 'zh' }
  },
  emits: ['select', 'back'],
  data() {
    return {
      selected: null
    }
  },
  computed: {
    options() {
      return [
        { seconds: 60,  number: '1', label: this.t.dur1 },
        { seconds: 180, number: '3', label: this.t.dur3 },
        { seconds: 300, number: '5', label: this.t.dur5 }
      ]
    }
  },
  methods: {
    onStart() {
      if (this.selected === null) return
      // Prime the audio pipeline while we still have the user gesture,
      // so the very first digit of the first round is audible on tablets.
      try { unlockAudio(this.lang) } catch (e) {}
      this.$emit('select', this.selected)
    }
  }
}
</script>

<style scoped>
.duration-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0d1b4b 100%);
  gap: 3vh;
  padding: 3vh 4vw;
}

.dur-title {
  color: #fff;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0;
}

.dur-hint {
  color: rgba(255,255,255,0.6);
  font-size: 1.05rem;
  letter-spacing: 0.05em;
  margin: 0;
}

.dur-btns {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.dur-btn {
  width: 11rem;
  height: 11rem;
  border-radius: 1rem;
  background: rgba(255,255,255,0.07);
  border: 0.15rem solid rgba(0, 212, 255, 0.3);
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-family: inherit;
  position: relative;
}
.dur-btn:hover {
  background: rgba(0, 212, 255, 0.12);
  border-color: #00d4ff;
  transform: translateY(-0.2rem);
  box-shadow: 0 0.4rem 1.5rem rgba(0, 212, 255, 0.25);
}
.dur-btn:active { transform: translateY(0); }
.dur-btn.selected {
  background: rgba(0, 212, 255, 0.22);
  border-color: #00d4ff;
  box-shadow: 0 0 1.5rem rgba(0, 212, 255, 0.5), inset 0 0 1rem rgba(0, 212, 255, 0.25);
  transform: translateY(-0.2rem);
}
.dur-btn.selected::after {
  content: '✓';
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  font-size: 1.1rem;
  color: #00d4ff;
  font-weight: 900;
}

.dur-number {
  font-size: 4rem;
  font-weight: 900;
  color: #00d4ff;
  line-height: 1;
}

.dur-label {
  font-size: 1.15rem;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.03em;
}

.dur-actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5vh;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 2.2rem;
  border-radius: 0.6rem;
  font-size: 1.15rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}

.back-btn {
  background: rgba(255,255,255,0.08);
  border: 0.12rem solid rgba(255,255,255,0.2);
  color: #fff;
}
.back-btn:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.35);
}

.start-btn {
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  border: 0.12rem solid transparent;
  color: #fff;
  box-shadow: 0 0.3rem 1rem rgba(0, 120, 255, 0.35);
}
.start-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #22e0ff, #0088ff);
  transform: translateY(-0.15rem);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 120, 255, 0.5);
}
.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-arrow { font-size: 1.25rem; line-height: 1; }

@media (orientation: portrait) {
  .duration-screen {
    justify-content: center;
    padding: calc(4vh + env(safe-area-inset-top)) 5vw calc(3vh + env(safe-area-inset-bottom));
    gap: 3.5vh;
  }
  .dur-title { font-size: max(6vmin, 22px); }
  .dur-hint { font-size: max(3.6vmin, 14px); }
  .dur-btns {
    flex-direction: column;
    gap: 1.4rem;
    width: 82%;
    max-width: 22rem;
  }
  .dur-btn {
    width: 100%;
    height: auto;
    min-height: max(18vmin, 6rem);
    flex-direction: row;
    justify-content: center;
    gap: 1.2rem;
    padding: 1.2rem 1rem;
    border-radius: 1.2rem;
  }
  .dur-number { font-size: max(9vmin, 34px); }
  .dur-label { font-size: max(4vmin, 15px); }
  .dur-actions {
    width: 82%;
    max-width: 22rem;
    gap: 1rem;
  }
  .action-btn {
    flex: 1;
    justify-content: center;
    font-size: max(4vmin, 15px);
    padding: 1rem 1rem;
    border-radius: 0.8rem;
  }
}
</style>
