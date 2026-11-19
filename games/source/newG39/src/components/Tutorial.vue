<template>
  <div class="overlay tut-overlay">
    <div class="card tut">
      <div class="tut-head">
        <h2>{{ t('tutorial') }}</h2>
        <span class="step-tag">{{ step + 1 }} / {{ steps.length }}</span>
      </div>

      <div class="tut-stage">
        <div class="stage-inner">
          <!-- background sky/ground -->
          <svg viewBox="0 0 800 400" class="stage-bg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="tutSky" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#a4c9b8"/>
                <stop offset="60%" stop-color="#6ea27a"/>
                <stop offset="100%" stop-color="#2e5a34"/>
              </linearGradient>
              <radialGradient id="tutGround" cx="50%" cy="80%" r="80%">
                <stop offset="0%" stop-color="#6e9758"/>
                <stop offset="100%" stop-color="#152615"/>
              </radialGradient>
            </defs>
            <rect width="800" height="400" fill="url(#tutSky)"/>
            <path d="M0 250 Q400 210 800 240 L800 400 L0 400 Z" fill="url(#tutGround)"/>
          </svg>

          <!-- Two demo trees -->
          <div class="tut-tree left"><Tree /></div>
          <div class="tut-tree right">
            <Tree />
            <!-- Fire indicator on step >= 2 -->
            <div v-if="step >= 2" class="tut-fire">
              <svg viewBox="0 0 60 80">
                <path d="M30 6 C 47 22, 54 46, 40 62 C 52 56, 56 44, 50 34 C 62 58, 52 76, 30 78 C 8 76, -2 58, 10 34 C 4 44, 8 56, 20 62 C 6 46, 13 22, 30 6 Z" fill="#ff7a1a"/>
                <path d="M30 26 C 40 38, 44 52, 36 62 C 44 58, 46 48, 42 40 C 48 54, 42 70, 30 70 C 18 70, 12 54, 18 40 C 14 48, 16 58, 24 62 C 16 52, 20 38, 30 26 Z" fill="#ffd247">
                  <animate attributeName="opacity" values=".7;1;.7" dur=".5s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
          </div>

          <!-- Center daisy -->
          <div class="tut-daisy"><Daisy hide-grass /></div>

          <!-- Demo bugs -->
          <div v-if="step >= 1" class="tut-bug b1"><svg viewBox="0 0 60 60"><ellipse cx="30" cy="34" rx="18" ry="14" fill="#2a1608" stroke="#0e0703" stroke-width="1.5"/><circle cx="30" cy="20" r="7" fill="#2a1608" stroke="#0e0703"/><g stroke="#0e0703" stroke-width="2" stroke-linecap="round"><line x1="20" y1="30" x2="8" y2="20"/><line x1="20" y1="36" x2="6" y2="36"/><line x1="20" y1="42" x2="8" y2="52"/><line x1="40" y1="30" x2="52" y2="20"/><line x1="40" y1="36" x2="54" y2="36"/><line x1="40" y1="42" x2="52" y2="52"/></g></svg></div>
          <div v-if="step >= 1" class="tut-bug b2"><svg viewBox="0 0 60 60"><ellipse cx="30" cy="34" rx="18" ry="14" fill="#2a1608" stroke="#0e0703" stroke-width="1.5"/><circle cx="30" cy="20" r="7" fill="#2a1608" stroke="#0e0703"/><g stroke="#0e0703" stroke-width="2" stroke-linecap="round"><line x1="20" y1="30" x2="8" y2="20"/><line x1="20" y1="36" x2="6" y2="36"/><line x1="20" y1="42" x2="8" y2="52"/><line x1="40" y1="30" x2="52" y2="20"/><line x1="40" y1="36" x2="54" y2="36"/><line x1="40" y1="42" x2="52" y2="52"/></g></svg></div>

          <!-- Cursor/click ripple -->
          <div v-if="step === 1" class="click-hint b1-hint"></div>
          <div v-if="step === 2" class="click-hint fire-hint"></div>

          <!-- Difficulty bar -->
          <div v-if="step === 3" class="diff-bar">
            <div class="diff-bar-inner"></div>
            <span>LEVEL UP</span>
          </div>
        </div>
      </div>

      <div class="tut-text">
        <h3>{{ steps[step].title }}</h3>
        <p>{{ steps[step].desc }}</p>
      </div>

      <div class="tut-dots">
        <span v-for="(s,i) in steps" :key="i" :class="{active:i===step}" @click="step=i"></span>
      </div>

      <div class="tut-actions">
        <button class="btn ghost big" :disabled="step===0" @click="prev">{{ t('prev') }}</button>
        <button class="btn ghost big" @click="$emit('skip')">{{ t('skip') }}</button>
        <button v-if="step<steps.length-1" class="btn big" @click="next">{{ t('next') }}</button>
        <button v-else class="btn big" @click="$emit('done')">{{ t('startGame') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { store, t } from '../store'
import Daisy from './Daisy.vue'
import Tree from './Tree.vue'
export default {
  components: { Daisy, Tree },
  data () { return { store, step: 0 } },
  computed: {
    t () { const _ = this.store.lang; return t },
    steps () { const _ = this.store.lang; return t('tutorialSteps') }
  },
  methods: {
    next () { if (this.step < this.steps.length - 1) this.step++ },
    prev () { if (this.step > 0) this.step-- }
  }
}
</script>

<style scoped>
.tut-overlay { position: absolute; inset: 0; z-index: 40; }
.tut { width: min(100vmin, 96vw); padding: 4vmin 5vmin 3.6vmin; }
.tut-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2.2vmin; }
.tut-head h2 { font-size: 3.8vmin; letter-spacing: .05em; }
.step-tag { font-size: 2.2vmin; color: #cbd5e1; letter-spacing: .1em; font-weight: 700; }

.tut-stage {
  aspect-ratio: 800/400;
  width: 100%;
  border-radius: 1.8vmin; overflow: hidden;
  background: #0a1a13;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), inset 0 20px 40px -20px rgba(0,0,0,.6);
  margin-bottom: 2vmin;
  position: relative;
}
.stage-inner { position: absolute; inset: 0; }
.stage-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.tut-tree { position: absolute; bottom: 20%; width: 26%; }
.tut-tree.left { left: 2%; }
.tut-tree.right { right: 2%; }
.tut-fire {
  position: absolute; left: 50%; top: 15%;
  transform: translate(-50%,-50%);
  width: 30%; aspect-ratio: 60/80;
  filter: drop-shadow(0 0 12px rgba(255,140,20,.9));
}
.tut-fire svg { width: 100%; height: 100%; }
.tut-daisy {
  position: absolute; left: 50%; bottom: 6%;
  transform: translateX(-50%);
  width: 22%; aspect-ratio: 260/360;
  filter: drop-shadow(0 12px 20px rgba(0,0,0,.5));
}
.tut-bug {
  position: absolute;
  width: 8%; aspect-ratio: 1/1;
  animation: bugCrawl 4s ease-in-out infinite alternate;
}
.tut-bug.b1 { left: 12%; top: 22%; }
.tut-bug.b2 { right: 12%; top: 26%; animation-delay: 1s; }
.tut-bug svg { width: 100%; height: 100%; }
@keyframes bugCrawl {
  0% { transform: translate(0,0) scale(1) }
  100% { transform: translate(30%,60%) scale(1.05) }
}
.click-hint {
  position: absolute;
  width: 6%; aspect-ratio: 1/1;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #fbbf24;
  animation: clickPulse 1.2s ease-out infinite;
}
.click-hint.b1-hint { left: 12%; top: 22%; }
.click-hint.fire-hint { right: 15%; top: 18%; }
@keyframes clickPulse {
  0% { transform: scale(.4); opacity: 1 }
  100% { transform: scale(2); opacity: 0 }
}
.diff-bar {
  position: absolute; left: 50%; top: 10%;
  transform: translateX(-50%);
  width: 44%; height: 3.4vmin;
  background: rgba(0,0,0,.5);
  border-radius: 999px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.diff-bar-inner {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 60%; background: linear-gradient(90deg,#22c55e,#facc15);
  animation: diffFill 3s ease-in-out infinite;
  border-radius: 999px;
}
@keyframes diffFill { 0%,100% { width: 40% } 50% { width: 92% } }
.diff-bar span { position: relative; font-weight: 900; font-size: 1.6vmin; letter-spacing: .12em; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.5); }

.tut-text h3 { font-size: 3vmin; margin-bottom: 1.2vmin; color: #fbcfe8; }
.tut-text p { color: #e2e8f0; line-height: 1.75; font-size: 2.2vmin; }
.tut-dots { display: flex; justify-content: center; gap: 1.2vmin; margin: 2.4vmin 0; }
.tut-dots span { width: 1.4vmin; height: 1.4vmin; border-radius: 999px; background: rgba(255,255,255,.22); cursor: pointer; transition: .2s; }
.tut-dots span.active { background: #ec4899; width: 4vmin; }
.tut-actions { display: flex; gap: 1.4vmin; justify-content: flex-end; flex-wrap: wrap; }
.tut-actions .btn.big { padding: 1.05em 2.4em; font-size: 2.2vmin; min-width: 16vmin; }
.tut-actions .btn:disabled { opacity: .4; cursor: not-allowed; }
</style>
