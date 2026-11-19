<template>
  <div class="mask">
    <div class="modal">
      <div class="head">
        <div class="step-badge">STEP {{ step+1 }} / {{ steps.length }}</div>
        <h2 class="title">{{ steps[step].title }}</h2>
      </div>

      <div class="body">
        <div class="demo-area">
          <!-- Step 0: Welcome -->
          <div v-if="step===0" class="demo">
            <div class="welcome-glove">
              <svg viewBox="0 0 200 220" width="100%" height="100%">
                <defs>
                  <radialGradient :id="'twg'" cx="35%" cy="30%" r="70%">
                    <stop offset="0" stop-color="#ff8090"/>
                    <stop offset=".45" stop-color="#e01e35"/>
                    <stop offset="1" stop-color="#6b0716"/>
                  </radialGradient>
                </defs>
                <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
                <path :fill="`url(#twg)`" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z"/>
                <path :fill="`url(#twg)`" d="M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
                <ellipse cx="80" cy="55" rx="20" ry="30" fill="#fff" opacity=".25"/>
              </svg>
            </div>
            <div class="pulse-rings">
              <div class="ring r1"></div>
              <div class="ring r2"></div>
              <div class="ring r3"></div>
            </div>
          </div>

          <!-- Step 1: Spot targets -->
          <div v-else-if="step===1" class="demo demo-targets">
            <div class="tgrid">
              <div class="tg-cell"><div class="btarget red highlight"><span></span></div></div>
              <div class="tg-cell"><div class="btarget blue"><span></span></div></div>
              <div class="tg-cell"><div class="btarget blue"><span></span></div></div>
              <div class="tg-cell"><div class="btarget red highlight"><span></span></div></div>
            </div>
            <div class="ptr">
              <svg viewBox="0 0 40 40" width="6vmin" height="6vmin">
                <path fill="#ffd166" d="M4 4 L36 16 L20 20 L16 36 Z" stroke="#fff" stroke-width="1"/>
              </svg>
            </div>
          </div>

          <!-- Step 2: Switch glove -->
          <div v-else-if="step===2" class="demo demo-switch">
            <div class="switch-row">
              <div class="glove-mini" :class="{on: switching}">
                <svg viewBox="0 0 200 220" width="100%" height="100%">
                  <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
                  <path fill="#e01e35" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
                </svg>
              </div>
              <div class="space-key">
                <div class="key-cap">SPACE</div>
                <div class="key-hint">↕</div>
              </div>
              <div class="glove-mini" :class="{on: !switching}">
                <svg viewBox="0 0 200 220" width="100%" height="100%">
                  <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
                  <path fill="#2f80ff" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Step 3: Strike -->
          <div v-else class="demo demo-strike">
            <div class="btarget red big"><span></span></div>
            <div class="flying-glove">
              <svg viewBox="0 0 200 220" width="100%" height="100%">
                <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
                <path fill="#e01e35" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
              </svg>
            </div>
            <div class="hit-mark">HIT!</div>
            <div class="score-pop">+10</div>
          </div>
        </div>

        <div class="text-area">
          <div class="tut-icon">{{ ['👋','👀','⌨️','💥'][step] }}</div>
          <p class="desc">{{ steps[step].desc }}</p>
        </div>
      </div>

      <div class="foot">
        <button class="btn ghost" @click="$emit('skip')">{{ t.skipTutorial }}</button>
        <div class="dots">
          <span v-for="i in steps.length" :key="i" class="dot" :class="{active: step===i-1}" @click="step=i-1"></span>
        </div>
        <div class="nav">
          <button class="btn" v-if="step>0" @click="step--">◀ {{ t.prev }}</button>
          <button class="btn primary" v-if="step<steps.length-1" @click="step++">{{ t.next }} ▶</button>
          <button class="btn primary" v-else @click="$emit('done')">🥊 {{ t.startTraining }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TutorialModal', props: ['t'],
  data() { return { step: 0, switching: true, _tmr: null } },
  computed: { steps() { return this.t.tutorialSteps } },
  mounted() { this._tmr = setInterval(() => this.switching = !this.switching, 900) },
  beforeDestroy() { clearInterval(this._tmr) }
}
</script>

<style scoped>
.mask {
  position: fixed; inset: 0; z-index: 100;
  background: radial-gradient(ellipse at center, rgba(20,5,15,.85), rgba(0,0,0,.95));
  backdrop-filter: blur(1vmin);
  display: flex; align-items: center; justify-content: center; padding: 3vmin;
}
.modal {
  width: min(92vw, 130vmin); max-height: 92vh;
  background: linear-gradient(160deg, #241028 0%, #150818 100%);
  border: 0.3vmin solid rgba(255,60,80,.35);
  border-radius: 2.5vmin; color: #fff;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,.7), 0 0 6vmin rgba(255,60,80,.15) inset;
  display: flex; flex-direction: column; overflow: hidden;
}
.head { padding: 3vmin 4vmin 1vmin; text-align: center; border-bottom: 0.15vmin solid rgba(255,255,255,.06); }
.step-badge {
  display: inline-block; padding: 0.6vmin 2vmin;
  background: linear-gradient(90deg, #ff3b4c, #ff8a5b);
  border-radius: 99px; font-size: 1.6vmin; font-weight: 800; letter-spacing: 0.4vmin;
  color: #fff; margin-bottom: 1.5vmin;
}
.title { font-size: 4vmin; font-weight: 900; letter-spacing: 0.3vmin; margin-bottom: 1.5vmin; }

.body {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 3vmin;
  padding: 3vmin 4vmin; flex: 1; min-height: 0;
}
.demo-area {
  position: relative;
  background: radial-gradient(circle at 50% 40%, rgba(255,255,255,.06), transparent 70%);
  border: 0.2vmin solid rgba(255,255,255,.1); border-radius: 2vmin;
  min-height: 40vmin;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.demo { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

/* Step 0 */
.welcome-glove { width: 22vmin; height: 26vmin; animation: bob 2s ease-in-out infinite; z-index: 2;
  filter: drop-shadow(0 2vmin 3vmin rgba(255,60,80,.4)); }
@keyframes bob { 0%,100%{ transform: translateY(0) rotate(-4deg);} 50%{ transform: translateY(-1.5vmin) rotate(4deg);} }
.pulse-rings { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.pulse-rings .ring {
  position: absolute; width: 30vmin; height: 30vmin; border-radius: 50%;
  border: 0.3vmin solid rgba(255,60,80,.4); animation: pring 2.4s ease-out infinite;
}
.pulse-rings .r2 { animation-delay: -.8s; }
.pulse-rings .r3 { animation-delay: -1.6s; }
@keyframes pring { 0% { transform: scale(.5); opacity: 1;} 100% { transform: scale(1.4); opacity: 0;} }

/* Boxing target */
.btarget {
  position: relative; width: 12vmin; height: 12vmin; border-radius: 50%;
  box-shadow: 0 1vmin 2vmin rgba(0,0,0,.5), 0 -0.4vmin 1vmin rgba(0,0,0,.4) inset;
}
.btarget.red   { background: radial-gradient(circle at 35% 30%, #ffb0b8 0%, #ff3b4c 30%, #a10a1a 100%); }
.btarget.blue  { background: radial-gradient(circle at 35% 30%, #b7d3ff 0%, #3080ff 30%, #0a3a9a 100%); }
.btarget::before {
  content: ''; position: absolute; inset: 22%; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff, #e6e6e6 60%, #b0b0b0 100%);
  box-shadow: 0 0.3vmin 0.6vmin rgba(0,0,0,.3);
}
.btarget span {
  position: absolute; inset: 40%; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #ff5568, #6b0716);
  box-shadow: 0 0.2vmin 0.4vmin rgba(0,0,0,.4);
}
.btarget.blue span { background: radial-gradient(circle at 40% 35%, #4a90ff, #0a3a9a); }
.btarget.highlight { animation: hlPulse 1.2s infinite; }
@keyframes hlPulse {
  0%,100% { box-shadow: 0 1vmin 2vmin rgba(0,0,0,.5), 0 0 0 0 rgba(255,60,80,.6); }
  50%     { box-shadow: 0 1vmin 2vmin rgba(0,0,0,.5), 0 0 0 1.5vmin rgba(255,60,80,0); }
}

/* Step 1 */
.tgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2vmin; }
.tg-cell { display: flex; align-items: center; justify-content: center; }
.ptr {
  position: absolute; top: 20%; right: 20%;
  animation: pointBob 1.4s ease-in-out infinite;
  filter: drop-shadow(0 0.5vmin 1vmin rgba(0,0,0,.5));
}
@keyframes pointBob { 0%,100%{ transform: translate(0,0);} 50%{ transform: translate(-1vmin, -1vmin);} }

/* Step 2 */
.demo-switch { gap: 3vmin; }
.switch-row { display: flex; align-items: center; gap: 3vmin; }
.glove-mini { width: 14vmin; height: 16vmin; opacity: .3; transition: all .35s; filter: grayscale(.7); }
.glove-mini.on { opacity: 1; filter: drop-shadow(0 0.5vmin 1vmin rgba(255,60,80,.4)); transform: scale(1.15) rotate(-8deg); }
.glove-mini:last-child.on { filter: drop-shadow(0 0.5vmin 1vmin rgba(50,120,255,.4)); transform: scale(1.15) rotate(8deg); }
.space-key { display: flex; flex-direction: column; align-items: center; gap: 0.8vmin; }
.key-cap {
  padding: 1.2vmin 2.4vmin; font-family: monospace; font-weight: 800; font-size: 2vmin;
  background: linear-gradient(180deg, #444, #222);
  color: #fff; border: 0.3vmin solid #666; border-radius: 1vmin;
  box-shadow: 0 0.6vmin 0 #111, 0 1vmin 2vmin rgba(0,0,0,.5);
  letter-spacing: 0.3vmin;
  animation: keyPress 1.8s infinite;
}
@keyframes keyPress {
  0%,100% { transform: translateY(0); box-shadow: 0 0.6vmin 0 #111, 0 1vmin 2vmin rgba(0,0,0,.5); }
  50% { transform: translateY(0.4vmin); box-shadow: 0 0.2vmin 0 #111, 0 0.4vmin 1vmin rgba(0,0,0,.5); }
}
.key-hint { color: rgba(255,255,255,.5); font-size: 2vmin; }

/* Step 3 */
.demo-strike { position: relative; }
.btarget.big { width: 16vmin; height: 16vmin; }
.flying-glove {
  position: absolute; width: 14vmin; height: 16vmin;
  animation: fly 1.6s infinite;
  filter: drop-shadow(0 1vmin 2vmin rgba(0,0,0,.5));
}
@keyframes fly {
  0%   { top: 10%;  left: 5%;  transform: rotate(-40deg) scale(0.7); }
  40%  { top: 30%;  left: 30%; transform: rotate(-10deg) scale(0.9); }
  50%  { top: 35%;  left: 35%; transform: rotate(0deg) scale(1.1); }
  60%  { top: 30%;  left: 30%; transform: rotate(-10deg) scale(0.9); }
  100% { top: 10%;  left: 5%;  transform: rotate(-40deg) scale(0.7); }
}
.hit-mark {
  position: absolute; top: 20%; right: 20%;
  font-size: 4vmin; font-weight: 900; color: #ffd166;
  text-shadow: 0 0 3vmin #ff3b4c, 0.3vmin 0.3vmin 0 #6b0716;
  animation: hitAnim 1.6s infinite;
  letter-spacing: 0.3vmin;
}
@keyframes hitAnim {
  0%, 45% { opacity: 0; transform: scale(.5) rotate(-10deg); }
  50%, 70% { opacity: 1; transform: scale(1.2) rotate(5deg); }
  100% { opacity: 0; transform: scale(1.5) rotate(-5deg); }
}
.score-pop {
  position: absolute; bottom: 30%; right: 25%;
  font-size: 3vmin; font-weight: 800; color: #22c55e;
  text-shadow: 0 0 2vmin #22c55e;
  animation: scorePop 1.6s infinite;
}
@keyframes scorePop {
  0%, 45% { opacity: 0; transform: translateY(2vmin); }
  55% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4vmin); }
}

.text-area {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 2vmin;
}
.tut-icon { font-size: 8vmin; margin-bottom: 2vmin; filter: drop-shadow(0 1vmin 2vmin rgba(255,60,80,.3)); }
.desc { color: rgba(255,255,255,.85); font-size: 2.4vmin; line-height: 1.7; letter-spacing: 0.1vmin; }

.foot {
  padding: 2vmin 4vmin 3vmin; display: flex; justify-content: space-between; align-items: center;
  border-top: 0.15vmin solid rgba(255,255,255,.06);
  background: rgba(0,0,0,.15);
}
.dots { display: flex; gap: 1vmin; }
.dot {
  width: 2vmin; height: 0.6vmin; background: rgba(255,255,255,.15); border-radius: 99px; cursor: pointer;
  transition: all .3s;
}
.dot.active { width: 4vmin; background: linear-gradient(90deg,#ff3b4c,#ff8a5b); }
.nav { display: flex; gap: 1.5vmin; }
.btn {
  padding: 1.4vmin 3vmin; border-radius: 1vmin; border: 0.2vmin solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.06); color: #fff; cursor: pointer;
  font-size: 2vmin; font-weight: 700; letter-spacing: 0.2vmin;
  transition: all .2s;
}
.btn:hover { background: rgba(255,255,255,.14); transform: translateY(-0.2vmin); }
.btn.primary {
  background: linear-gradient(135deg, #ff3b4c, #b8102a);
  border-color: transparent; box-shadow: 0 0.8vmin 2vmin rgba(255,60,80,.4);
}
.btn.ghost { background: transparent; opacity: .7; }

@media (max-aspect-ratio: 3/4) {
  .body { grid-template-columns: 1fr; }
}
</style>
