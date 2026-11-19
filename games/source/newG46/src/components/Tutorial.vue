<template>
  <div class="tut-mask" @click.self="$emit('skip')">
    <div class="tut-card">
      <div class="tut-head">
        <div class="tut-title">{{ t('tutorialTitle') }}</div>
        <div class="tut-step">{{ t('tutStep')(step+1, total) }}</div>
      </div>

      <div class="tut-demo">
        <div class="demo-side">
          <div class="side-label">A</div>
          <svg viewBox="0 0 400 300" class="demo-svg">
            <!-- baseline scene -->
            <rect width="400" height="300" fill="#cfeaff"/>
            <rect x="0" y="220" width="400" height="80" fill="#8ad38f"/>
            <!-- sun -->
            <circle cx="330" cy="60" r="24" fill="#ffd94a" stroke="#e6b800" stroke-width="2"/>
            <!-- house -->
            <polygon points="140,150 200,90 260,150" fill="#c0392b" stroke="#333" stroke-width="2"/>
            <rect x="150" y="150" width="100" height="90" fill="#f7d794" stroke="#333" stroke-width="2"/>
            <rect x="185" y="185" width="30" height="55" fill="#5d4037" stroke="#333" stroke-width="2"/>
            <!-- tree -->
            <circle cx="70" cy="170" r="28" fill="#2ecc71" stroke="#1e6e3a" stroke-width="2"/>
            <rect x="65" y="195" width="10" height="30" fill="#6d4c41" stroke="#333" stroke-width="1.5"/>
            <!-- flower -->
            <line x1="330" y1="240" x2="330" y2="200" stroke="#2e9149" stroke-width="3"/>
            <circle cx="330" cy="195" r="10" fill="#e91e63" stroke="#333" stroke-width="1.5"/>
          </svg>
        </div>

        <div class="demo-mid">
          <div class="vs">VS</div>
        </div>

        <div class="demo-side" :class="{shake: showShake}">
          <div class="side-label">B</div>
          <svg viewBox="0 0 400 300" class="demo-svg">
            <rect width="400" height="300" fill="#cfeaff"/>
            <rect x="0" y="220" width="400" height="80" fill="#8ad38f"/>
            <!-- diff #1: sun with rays (always visible on B) -->
            <g>
              <line v-for="i in 8" :key="i"
                    :x1="330 + Math.cos((i-1)*Math.PI/4) * 30"
                    :y1="60 + Math.sin((i-1)*Math.PI/4) * 30"
                    :x2="330 + Math.cos((i-1)*Math.PI/4) * 42"
                    :y2="60 + Math.sin((i-1)*Math.PI/4) * 42"
                    stroke="#e6b800" stroke-width="3" stroke-linecap="round"/>
            </g>
            <circle cx="330" cy="60" r="24" fill="#ffd94a" stroke="#e6b800" stroke-width="2"/>

            <!-- diff #2: wall color (teal instead of yellow) -->
            <polygon points="140,150 200,90 260,150" fill="#c0392b" stroke="#333" stroke-width="2"/>
            <rect x="150" y="150" width="100" height="90" fill="#a3e4d7" stroke="#333" stroke-width="2"/>
            <rect x="185" y="185" width="30" height="55" fill="#5d4037" stroke="#333" stroke-width="2"/>

            <!-- tree (unchanged) -->
            <circle cx="70" cy="170" r="28" fill="#2ecc71" stroke="#1e6e3a" stroke-width="2"/>
            <rect x="65" y="195" width="10" height="30" fill="#6d4c41" stroke="#333" stroke-width="1.5"/>

            <!-- diff #3: flower color (blue instead of pink) -->
            <line x1="330" y1="240" x2="330" y2="200" stroke="#2e9149" stroke-width="3"/>
            <circle cx="330" cy="195" r="10" fill="#3498db" stroke="#333" stroke-width="1.5"/>

            <!-- Step 1: green check on the flower (one found) -->
            <g v-if="step >= 1">
              <circle cx="330" cy="195" r="18" fill="none" stroke="#22e07a" stroke-width="3"/>
              <path d="M 322 195 l 5 6 l 11 -13" stroke="#22e07a" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </g>

            <!-- Step 2: red X on empty sky + shake -->
            <g v-if="step === 2">
              <circle cx="100" cy="60" r="18" fill="none" stroke="#ff4757" stroke-width="3"/>
              <line x1="90" y1="50" x2="110" y2="70" stroke="#ff4757" stroke-width="3.5" stroke-linecap="round"/>
              <line x1="110" y1="50" x2="90" y2="70" stroke="#ff4757" stroke-width="3.5" stroke-linecap="round"/>
            </g>

            <!-- Step 3: level/HUD overlay hint arrows (checked all three) -->
            <g v-if="step >= 3">
              <circle cx="330" cy="60" r="30" fill="none" stroke="#22e07a" stroke-width="3"/>
              <path d="M 320 60 l 6 7 l 14 -16" stroke="#22e07a" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="205" cy="195" r="30" fill="none" stroke="#22e07a" stroke-width="3"/>
              <path d="M 195 195 l 6 7 l 14 -16" stroke="#22e07a" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </div>
      </div>

      <div class="tut-hint">
        <span class="hint-num">{{ step+1 }}</span>
        <span>{{ t('tutHints')[step] }}</span>
      </div>

      <div class="tut-actions">
        <button class="tut-btn ghost" @click="$emit('skip')">{{ t('skip') }}</button>
        <button class="tut-btn" :disabled="step === 0" @click="step > 0 && step--">{{ t('prev') }}</button>
        <button v-if="step < total-1" class="tut-btn primary" @click="onNext">{{ t('next') }}</button>
        <button v-else class="tut-btn primary" @click="$emit('done')">{{ t('startNow') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'Tutorial',
  data() { return { step: 0, total: 4, showShake: false, Math } },
  methods: {
    t,
    onNext() {
      // On the wrong-click step (index 1 → next is 2) trigger a shake preview.
      if (this.step === 1) {
        this.showShake = true
        setTimeout(() => { this.showShake = false }, 500)
      }
      this.step++
    },
  },
}
</script>

<style scoped>
.tut-mask {
  position: fixed; inset: 0; z-index: 90;
  background: rgba(74,58,30,0.35); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; animation: fade .3s;
  font-size: 1em;
}
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
.tut-card {
  width: min(60em, 92vw); padding: 2em;
  background: #fff8e8;
  border: 1px solid #d9c9a3; border-radius: 1.2em;
  box-shadow: 0 1em 3em rgba(74,58,30,.2);
  color: #3a2f1f; animation: pop .4s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pop { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.tut-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4em; }
.tut-title { font-size: 1.6em; font-weight: 700; color: #4a3a1e; letter-spacing: 0.15em; }
.tut-step {
  padding: 0.35em 0.9em; background: #f6e6c1; border: 1px solid #d9c9a3;
  color: #6b5a3a; border-radius: 999px; font-size: 0.9em; font-weight: 600;
}

.tut-demo {
  display: grid; grid-template-columns: 1fr 3.5em 1fr; gap: 1em;
  margin-bottom: 1.4em;
}
.demo-side {
  position: relative; border-radius: 0.8em; overflow: hidden;
  border: 1px solid #d9c9a3;
}
.demo-side.shake { animation: shake .5s; border-color: #c0392b; }
@keyframes shake { 0%,100% { transform: translateX(0);} 20% { transform: translateX(-8px);} 40% { transform: translateX(8px);} 60% { transform: translateX(-5px);} 80% { transform: translateX(5px);} }
.side-label {
  position: absolute; top: 0.5em; left: 0.7em; z-index: 2;
  padding: 0.2em 0.7em; background: #c99a4b; color: #fff;
  font-size: 0.95em; font-weight: 700; letter-spacing: 0.15em; border-radius: 0.4em;
}
.demo-svg { width: 100%; height: auto; display: block; background: #fff8e8; }
.demo-mid { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.vs {
  font-size: 1.3em; font-weight: 800;
  color: #b98738;
  letter-spacing: 0.2em;
}

.tut-hint {
  display: flex; align-items: center; gap: 0.8em;
  padding: 1em 1.2em; background: #f6e6c1; border-left: 3px solid #c99a4b;
  border-radius: 0.6em; font-size: 1.02em; line-height: 1.6; color: #4a3a1e;
  margin-bottom: 1.4em;
}
.hint-num {
  flex-shrink: 0; width: 2em; height: 2em; border-radius: 50%;
  background: #c99a4b; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1em;
}

.tut-actions { display: flex; gap: 0.8em; justify-content: flex-end; }
.tut-btn {
  padding: 0.75em 1.6em; border-radius: 999px;
  background: #f6efe0; border: 1px solid #d9c9a3;
  color: #6b5a3a; font-weight: 600; letter-spacing: 0.08em; cursor: pointer;
  font-size: 1.02em; transition: all .2s;
}
.tut-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tut-btn:not(:disabled):hover { background: #f0e2be; }
.tut-btn.ghost { background: transparent; }
.tut-btn.primary {
  background: #c99a4b;
  border-color: #c99a4b;
  color: #fff;
}
.tut-btn.primary:hover { background: #b98738; border-color: #b98738; }
</style>
