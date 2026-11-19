<template>
  <div class="gameplay" ref="root">
    <Starfield />

    <!-- HUD (all in one horizontal line: stats | question capsule | buttons) -->
    <div class="hud">
      <div class="hud-left">
        <div class="stat">
          <div class="stat-label">{{ t.difficulty }}</div>
          <div class="stat-value lv">Lv {{ level }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t.score }}</div>
          <div class="stat-value score">{{ score }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">{{ t.timeLeft }}</div>
          <div class="stat-value time" :class="{critical: totalRemain <= 10}">
            {{ formatTime(totalRemain) }}
          </div>
        </div>
      </div>

      <div class="hud-center">
        <div class="q-capsule" :class="{shake: feedback === 'wrong'}">
          <div class="q-label">{{ t.question }}</div>
          <div class="q-targets">
            <template v-for="(name, i) in targets">
              <span :key="'t'+i" class="target-chip"
                :class="{done: i < currentIndex, current: i === currentIndex}">
                <span class="idx">{{ i + 1 }}</span>
                <span class="nm">{{ name }}</span>
                <span v-if="i < currentIndex" class="check">✓</span>
              </span>
              <span v-if="i < targets.length - 1" :key="'a'+i" class="arrow">→</span>
            </template>
          </div>
          <div class="qtimer">
            <div class="qtimer-fill" :style="{width: (qTimeLeft / QUESTION_TIME * 100) + '%'}"
              :class="{warn: qTimeLeft <= 5}"></div>
            <div class="qtimer-text">{{ qTimeLeft.toFixed(1) }}{{ t.seconds }}</div>
          </div>
        </div>
      </div>

      <div class="hud-right">
        <button v-if="showBatchSkip" class="hud-btn" @click="onBatchSkipClick">⏭ {{ t.skipBatchGame || t.skipGame }}</button>
        <button class="hud-btn" @click="onPause">◀ {{ t.back }}</button>
      </div>
    </div>

    <!-- Play field -->
    <div class="field" ref="field">
      <transition-group name="planet-tr" tag="div" class="field-inner">
        <Planet v-for="p in planets" :key="p.uid"
          :name="p.name"
          :theme="p.theme"
          :seed="p.seed"
          :state="p.state"
          :highlight="false"
          :disabled="p.disabled || paused || countdownActive"
          :scale="planetScale"
          :style="{ left: (p.x * 100) + '%', top: (p.y * 100) + '%', width: planetSize + 'px' }"
          @click="onPlanetClick(p)" />
      </transition-group>

      <!-- Feedback overlay -->
      <transition name="fb">
        <div v-if="feedback" class="feedback" :class="feedback">
          <div v-if="feedback === 'correct'" class="fb-icon">✓</div>
          <div v-else-if="feedback === 'wrong'" class="fb-icon">✕</div>
          <div v-else class="fb-icon">⌛</div>
          <div class="fb-text">{{ feedbackText }}</div>
        </div>
      </transition>

      <!-- Countdown overlay -->
      <transition name="cd">
        <div v-if="countdownActive" class="countdown">
          <div class="cd-num" :key="countdownNum">{{ countdownText }}</div>
        </div>
      </transition>
    </div>

    <!-- Pause modal -->
    <transition name="modal">
      <div v-if="paused" class="pause-mask">
        <div class="pause-box">
          <div class="pause-icon">⏸</div>
          <h3>{{ t.pauseTip }}</h3>
          <div class="pause-actions">
            <button class="btn" @click="onResume">▶ {{ t.resume }}</button>
            <button class="btn danger" @click="onQuit">✕ {{ t.quit }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Starfield from './Starfield.vue'
import Planet from './Planet.vue'
import { DIFFICULTY, MAX_LEVEL, MIN_LEVEL, QUESTION_TIME, ADJUST_INTERVAL, PLANET_THEMES, pick, shuffle, generatePositions } from '../utils/game.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'tktxj'

let _uid = 0

export default {
  name: 'GamePlay',
  components: { Starfield, Planet },
  props: {
    t: Object,
    lang: String,
    duration: { type: Number, default: 180 }, // seconds
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      QUESTION_TIME,
      level: 1,
      score: 0,
      totalRemain: this.duration,
      qTimeLeft: QUESTION_TIME,
      planets: [],
      targets: [],
      currentIndex: 0,
      paused: false,
      countdownActive: true,
      countdownNum: 3,
      feedback: '',
      feedbackText: '',
      // stats
      total: 0,
      correct: 0,
      wrong: 0,
      rtSum: 0,
      maxLevel: 1,
      questionStart: 0,
      // adjust window stats
      windowCorrect: 0,
      windowTotal: 0,
      windowStart: 0,
      // layout
      fieldW: 800,
      fieldH: 480,
      planetSize: 120,
      planetScale: 1,
      // timers
      tickTimer: null,
      qTimer: null,
      cdTimer: null,
      fbTimer: null,
      audio: null,
    }
  },
  computed: {
    countdownText() {
      if (this.countdownNum > 0) return this.countdownNum
      return this.t.go
    }
  },
  mounted() {
    this.ro = new ResizeObserver(() => this.updateLayout())
    this.ro.observe(this.$refs.field)
    window.addEventListener('resize', this.updateLayout)
    this.updateLayout()
    this.startCountdown()
  },
  beforeDestroy() {
    if (this.ro) this.ro.disconnect()
    window.removeEventListener('resize', this.updateLayout)
    clearInterval(this.tickTimer)
    clearInterval(this.qTimer)
    clearInterval(this.cdTimer)
    clearTimeout(this.fbTimer)
    if (this.audio) { try { this.audio.pause() } catch(e) {} this.audio = null }
  },
  methods: {
    formatTime(s) {
      s = Math.max(0, Math.ceil(s))
      const m = Math.floor(s / 60), ss = s % 60
      return `${m}:${ss.toString().padStart(2, '0')}`
    },
    updateLayout() {
      const el = this.$refs.field
      if (!el) return
      const rect = el.getBoundingClientRect()
      this.fieldW = rect.width
      this.fieldH = rect.height
      // Compute planet size based on how many planets we have.
      const cfg = DIFFICULTY[this.level]
      const count = cfg ? cfg.planetCount : 8
      // Fit N planets accounting for visual footprint (ring/aura ~1.5x planetSize,
      // label pill ~0.35x planetSize below). Conservative divisor prevents overlap
      // on narrow/short viewports like tablets.
      const area = this.fieldW * this.fieldH
      const size = Math.sqrt(area / count) / 1.9
      this.planetSize = Math.max(52, Math.min(170, size))
      this.planetScale = this.planetSize / 140
    },
    startCountdown() {
      this.countdownActive = true
      this.countdownNum = 3
      this.cdTimer = setInterval(() => {
        this.countdownNum--
        if (this.countdownNum < 0) {
          clearInterval(this.cdTimer)
          this.countdownActive = false
          this.startGame()
        }
      }, 800)
    },
    startGame() {
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.maxLevel = this.level
      this.windowStart = performance.now()
      this.nextQuestion()
      this.tickTimer = setInterval(() => this.tick(), 100)
    },
    tick() {
      if (this.paused) return
      this.totalRemain -= 0.1
      this.qTimeLeft -= 0.1
      // 60s adjustment window
      const elapsedInWindow = (performance.now() - this.windowStart) / 1000
      if (elapsedInWindow >= ADJUST_INTERVAL) this.adjustDifficulty()
      if (this.qTimeLeft <= 0) this.timeoutQuestion()
      if (this.totalRemain <= 0) this.finish()
    },
    adjustDifficulty() {
      if (this.windowTotal > 0) {
        const rate = this.windowCorrect / this.windowTotal
        if (rate >= 0.9 && this.level < MAX_LEVEL) this.level++
        else if (rate <= 0.7 && this.level > MIN_LEVEL) this.level--
      }
      this.windowCorrect = 0
      this.windowTotal = 0
      this.windowStart = performance.now()
      if (this.level > this.maxLevel) this.maxLevel = this.level
    },
    nextQuestion() {
      const cfg = DIFFICULTY[this.level]
      if (this.level > this.maxLevel) this.maxLevel = this.level
      const planetCount = cfg.planetCount
      const targetCount = cfg.targets()
      const names = pick(this.t.planetNames, planetCount)
      const themes = shuffle(PLANET_THEMES).slice(0, planetCount)
      this.updateLayout()
      // Iteratively shrink planet size until we can place N non-overlapping planets.
      // Visual planet (with ring/aura) is ~1.35x planetSize wide; name label sits below.
      let positions = null
      let attempts = 0
      while (attempts < 8) {
        const visualR = this.planetSize * 0.68 * this.planetScale
        const labelH = this.planetSize * 0.4
        const marginX = Math.min(0.45, visualR / Math.max(1, this.fieldW))
        const marginY = Math.min(0.4, visualR / Math.max(1, this.fieldH))
        const marginBottom = Math.min(0.5, (visualR + labelH) / Math.max(1, this.fieldH))
        const aspect = this.fieldW / Math.max(1, this.fieldH)
        const footprint = 2 * visualR + labelH * 0.7
        const minDist = Math.min(0.95, footprint / Math.max(1, this.fieldH))
        const result = generatePositions(planetCount, {
          aspect, minDist, marginX, marginY, marginBottom, strict: true
        })
        if (result && result.length === planetCount) { positions = result; break }
        // shrink 12% and retry
        this.planetSize = Math.max(48, this.planetSize * 0.88)
        this.planetScale = this.planetSize / 140
        attempts++
      }
      if (!positions) {
        // Final fallback: grid layout with the current (shrunk) size.
        const aspect = this.fieldW / Math.max(1, this.fieldH)
        const visualR = this.planetSize * 0.68 * this.planetScale
        const labelH = this.planetSize * 0.4
        const marginX = Math.min(0.45, visualR / Math.max(1, this.fieldW))
        const marginY = Math.min(0.4, visualR / Math.max(1, this.fieldH))
        const marginBottom = Math.min(0.5, (visualR + labelH) / Math.max(1, this.fieldH))
        positions = generatePositions(planetCount, {
          aspect, minDist: 0.001, marginX, marginY, marginBottom
        })
      }
      this.planets = names.map((n, i) => ({
        uid: ++_uid,
        name: n,
        theme: themes[i],
        seed: (Math.random() * 1e6) | 0,
        x: positions[i].x,
        y: positions[i].y,
        state: '',
        disabled: false
      }))
      const chosen = shuffle(this.planets.slice()).slice(0, targetCount)
      this.targets = chosen.map(p => p.name)
      this.currentIndex = 0
      this.qTimeLeft = QUESTION_TIME
      this.questionStart = performance.now()
      this.playQuestionVoice()
    },
    playQuestionVoice() {
      // Play the "Find these planets in order" voice prompt.
      // Language-specific file lives at /voice/{chinese|english}/1.mp3.
      try {
        if (this.audio) {
          this.audio.pause()
          this.audio.currentTime = 0
        }
        const dir = this.lang === 'en' ? 'english' : 'chinese'
        this.audio = new Audio(`voice/${dir}/1.mp3`)
        this.audio.volume = 0.9
        const p = this.audio.play()
        if (p && p.catch) p.catch(() => { /* autoplay blocked; ignore */ })
      } catch (e) { /* ignore */ }
    },
    onPlanetClick(p) {
      if (this.paused || this.countdownActive || this.feedback) return
      if (p.state) return
      const expected = this.targets[this.currentIndex]
      if (p.name === expected) {
        p.state = 'correct'
        this.currentIndex++
        if (this.currentIndex >= this.targets.length) {
          this.finishQuestion(true)
        }
      } else {
        p.state = 'wrong'
        this.finishQuestion(false)
      }
    },
    finishQuestion(ok) {
      const rt = performance.now() - this.questionStart
      this.total++
      this.windowTotal++
      if (ok) {
        this.correct++
        this.windowCorrect++
        this.rtSum += rt
        const cfg = DIFFICULTY[this.level]
        const gained = Math.round(5 * cfg.coef)
        this.score += gained
        this.feedback = 'correct'
        this.feedbackText = `${this.t.correct} +${gained}`
      } else {
        this.wrong++
        this.feedback = 'wrong'
        this.feedbackText = this.t.wrong
      }
      this.fbTimer = setTimeout(() => {
        this.feedback = ''
        if (this.totalRemain > 0) this.nextQuestion()
      }, 900)
    },
    timeoutQuestion() {
      if (this.feedback) return
      this.total++
      this.windowTotal++
      this.wrong++
      this.qTimeLeft = 0
      this.feedback = 'timeout'
      this.feedbackText = this.t.timeout
      this.fbTimer = setTimeout(() => {
        this.feedback = ''
        if (this.totalRemain > 0) this.nextQuestion()
      }, 900)
    },
    onPause() { this.paused = true },
    onResume() { this.paused = false },
    onQuit() { this.$emit('quit') },
    onBatchSkipClick() { this.$emit('batch-skip') },
    onSkip() {
      // Reserved for skip-current-question logic.
    },
    finish() {
      clearInterval(this.tickTimer)
      clearInterval(this.qTimer)
      const avgRT = this.correct > 0 ? Math.round(this.rtSum / this.correct) : 0
      this.$emit('finish', {
        score: this.score,
        total: this.total,
        correct: this.correct,
        wrong: this.wrong,
        avgRT,
        level: this.level,
        duration: this.duration,
      })
    }
  },
  watch: {
    level() { this.updateLayout() }
  }
}
</script>

<style scoped>
.gameplay {
  position: absolute; inset: 0;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* HUD */
.hud {
  position: relative; z-index: 3;
  display: flex; justify-content: space-between; align-items: stretch;
  padding: 0.6vh 1.4vw;
  gap: 0.7em;
  flex-wrap: nowrap;
}
.hud-left { display: flex; gap: 0.6em; align-items: stretch; flex-shrink: 0; }
.hud-center { flex: 1; min-width: 0; display: flex; align-items: stretch; justify-content: center; }
.hud-right { display: flex; gap: 0.6em; align-items: stretch; flex-shrink: 0; }
.stat {
  background: rgba(10, 15, 40, 0.65);
  border: 1.5px solid rgba(140, 180, 255, 0.45);
  border-radius: 0.7em;
  padding: 0.4em 1em;
  backdrop-filter: blur(10px);
  min-width: 6em;
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
  display: flex; flex-direction: column; justify-content: center;
}
.stat-label {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: 0.75em;
  letter-spacing: 0.2em;
  color: #a5c0ee;
  text-transform: uppercase;
  font-weight: 600;
}
.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 1.6em;
  margin-top: 0.1em;
  line-height: 1;
}
.lv { color: #ff7ac0; }
.score { color: #ffd43b; }
.time { color: #7fdbff; }
.time.critical { color: #ff6b6b; animation: pulse-red 0.6s ease-in-out infinite; }
@keyframes pulse-red { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

.hud-right { display: flex; gap: 1em; align-items: stretch; flex-shrink: 0; }
.hud-btn {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  padding: 0.5em 1.1em;
  font-size: 0.9em;
  border-radius: 0.7em;
  border: 1.5px solid rgba(140, 180, 255, 0.45);
  background: rgba(10, 15, 40, 0.65);
  color: #e0ecff;
  cursor: pointer;
  backdrop-filter: blur(10px);
  letter-spacing: 0.12em;
  transition: all .2s;
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
  display: flex; align-items: center; justify-content: center;
}
.hud-btn:hover { background: rgba(90, 120, 220, 0.5); color: #fff; border-color: #7fb0ff; transform: translateY(-2px); }

/* Question capsule (centered in HUD, same horizontal line as stats/buttons) */
.q-capsule {
  position: relative;
  display: flex; flex-direction: column; justify-content: center;
  width: 100%;
  padding: 0.35em 1.2em 0.55em;
  background: rgba(10, 15, 40, 0.65);
  border: 1.5px solid rgba(255, 220, 120, 0.55);
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 25px rgba(255, 220, 120, 0.18), 0 0 30px rgba(255, 220, 120, 0.1) inset;
}
.q-label {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  color: #ffd43b;
  font-size: 0.85em;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-align: center;
  margin-bottom: 0.35em;
  text-transform: uppercase;
}
.q-targets {
  display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 0.55em;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: 1.35em;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 0.2em;
}
.q-targets::-webkit-scrollbar { display: none; }
.target-chip {
  display: inline-flex; align-items: center; gap: 0.5em;
  padding: 0.5em 1.1em;
  border-radius: 999px;
  background: rgba(30, 40, 90, 0.7);
  border: 2px solid rgba(140, 180, 255, 0.4);
  transition: all .3s;
  white-space: nowrap;
  flex-shrink: 0;
}
.target-chip .idx {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.7em; height: 1.7em; border-radius: 999px;
  background: rgba(140, 180, 255, 0.25);
  font-weight: 800; font-size: 0.95em;
}
.target-chip .nm { font-weight: 700; letter-spacing: 0.05em; font-size: 1.05em; }
.target-chip.current {
  background: linear-gradient(135deg, rgba(255, 212, 59, 0.3), rgba(255, 138, 0, 0.3));
  border-color: #ffd43b;
  box-shadow: 0 0 20px rgba(255, 212, 59, 0.4);
  animation: chip-pulse 1.2s ease-in-out infinite;
}
.target-chip.current .idx { background: #ffd43b; color: #000; }
@keyframes chip-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
.target-chip.done {
  background: rgba(81, 207, 102, 0.2);
  border-color: rgba(81, 207, 102, 0.5);
  color: #b2f2bb;
}
.target-chip.done .idx { background: #51cf66; color: #000; }
.target-chip .check { color: #51cf66; font-weight: 900; }
.arrow { color: #8fa8d8; font-weight: 700; }

.qtimer {
  position: relative;
  height: 4px;
  margin-top: 0.3em;
  background: rgba(140, 180, 255, 0.18);
  border-radius: 999px;
  overflow: hidden;
}
.qtimer-fill {
  height: 100%;
  background: linear-gradient(90deg, #51cf66, #7fdbff);
  transition: width 0.1s linear;
  border-radius: 999px;
  box-shadow: 0 0 8px rgba(127, 219, 255, 0.6);
}
.qtimer-fill.warn { background: linear-gradient(90deg, #ff6b6b, #ffd43b); box-shadow: 0 0 10px rgba(255, 107, 107, 0.6); }
.qtimer-text {
  position: absolute; right: 0.6em; top: -1.3em;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.7em;
  font-weight: 700;
  color: #a5c0ee;
}

.q-capsule.shake { animation: shake .4s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

/* Field */
.field {
  flex: 1;
  position: relative;
  margin: 0.6vh 1.4vw 1vh;
  border-radius: 1em;
  background: rgba(5, 10, 30, 0.3);
  border: 1px solid rgba(140, 180, 255, 0.15);
  overflow: hidden;
  min-height: 0;
  box-shadow: 0 20px 60px rgba(0,0,0,.4) inset;
}
.field-inner { position: absolute; inset: 0; }

/* Feedback */
.feedback {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 20;
  pointer-events: none;
}
.fb-icon {
  font-size: 8em;
  font-weight: 900;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 40px currentColor;
  animation: pop 0.4s cubic-bezier(.34,1.56,.64,1);
}
.fb-text {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 1.5em;
  letter-spacing: 0.15em;
  margin-top: 0.3em;
}
.feedback.correct .fb-icon, .feedback.correct .fb-text { color: #51cf66; }
.feedback.wrong .fb-icon, .feedback.wrong .fb-text { color: #ff6b6b; }
.feedback.timeout .fb-icon, .feedback.timeout .fb-text { color: #ffa94d; }
@keyframes pop { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.fb-enter-active, .fb-leave-active { transition: opacity .3s; }
.fb-enter, .fb-leave-to { opacity: 0; }

/* Countdown */
.countdown {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(2, 5, 20, 0.5);
  backdrop-filter: blur(4px);
  z-index: 30;
}
.cd-num {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 12em;
  color: #ffd43b;
  text-shadow: 0 0 60px rgba(255, 212, 59, 0.8);
  animation: cd 0.8s ease-out;
}
@keyframes cd {
  0% { transform: scale(0.4); opacity: 0; }
  40% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.cd-enter-active, .cd-leave-active { transition: opacity .3s; }
.cd-leave-to, .cd-enter { opacity: 0; }

/* Pause */
.pause-mask {
  position: absolute; inset: 0;
  z-index: 50;
  background: rgba(2, 5, 20, 0.75);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
}
.pause-box {
  padding: 3.5em 5em;
  border-radius: 2em;
  border: 2px solid rgba(140, 180, 255, 0.45);
  background: linear-gradient(180deg, rgba(30, 40, 90, 0.95), rgba(15, 20, 55, 0.95));
  text-align: center;
  box-shadow: 0 30px 100px rgba(0,0,0,.7), 0 0 40px rgba(120, 180, 255, 0.2) inset;
}
.pause-icon { font-size: 6em; margin-bottom: 0.3em; color: #7fdbff; text-shadow: 0 0 30px rgba(127, 219, 255, 0.6); }
.pause-box h3 {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: 2em; letter-spacing: 0.25em;
  margin-bottom: 1.8em;
  color: #e0ecff;
  font-weight: 700;
}
.pause-actions { display: flex; gap: 1.4em; justify-content: center; }
.btn {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  padding: 1.1em 2.5em;
  font-size: 1.1em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.5);
  background: rgba(60, 80, 160, 0.5);
  color: #fff;
  cursor: pointer;
  letter-spacing: 0.2em;
  transition: all .2s;
}
.btn:hover { background: rgba(90, 120, 220, 0.7); transform: translateY(-2px); }
.btn.danger { border-color: rgba(255, 120, 120, 0.6); background: rgba(200, 60, 80, 0.5); }
.btn.danger:hover { background: rgba(220, 80, 100, 0.7); }

.modal-enter-active, .modal-leave-active { transition: opacity .3s; }
.modal-enter, .modal-leave-to { opacity: 0; }

.planet-tr-enter-active, .planet-tr-leave-active { transition: opacity .4s, transform .4s; }
.planet-tr-enter, .planet-tr-leave-to { opacity: 0; transform: scale(.5) translate(-50%, -50%); }
</style>
