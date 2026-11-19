<template>
  <div class="game" @contextmenu.prevent>
    <!-- Classroom background -->
    <div class="wall"></div>
    <div class="floor"></div>
    <div class="poster poster--left">A B C</div>
    <div class="poster poster--right">1 2 3</div>
    <div class="clock">
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="46" fill="#f5efdc" stroke="#8b5a1e" stroke-width="4"/>
        <circle cx="50" cy="50" r="3" fill="#333"/>
        <line x1="50" y1="50" x2="50" y2="20" stroke="#333" stroke-width="3" stroke-linecap="round"
          :transform="`rotate(${clockA} 50 50)`" />
        <line x1="50" y1="50" x2="72" y2="50" stroke="#c33" stroke-width="2" stroke-linecap="round"
          :transform="`rotate(${clockB} 50 50)`" />
      </svg>
    </div>

    <!-- HUD top-left -->
    <div class="hud hud--left">
      <div class="hud-item">
        <div class="hud-label">{{ t('difficulty') }}</div>
        <div class="hud-value"><span class="lv-badge">L{{ level }}</span></div>
      </div>
      <div class="hud-item">
        <div class="hud-label">{{ t('score') }}</div>
        <div class="hud-value score">{{ score }}</div>
      </div>
      <div class="hud-item">
        <div class="hud-label">{{ t('timeLeft') }}</div>
        <div class="hud-value time" :class="{low: timeLeft<=10}">{{ mmss(timeLeft) }}</div>
      </div>
    </div>

    <!-- Right side buttons -->
    <div class="hud hud--right">
      <button v-if="showBatchSkip" class="round-btn skip" @click="$emit('batch-skip')">
        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        {{ t('skipGame') }}
      </button>
      <button class="round-btn back" @click="askExit">
        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/></svg>
        {{ t('back') }}
      </button>
    </div>

    <!-- Rule banner centered -->
    <div class="rule-banner">
      <div class="tag">{{ t('ruleTip') }}</div>
      <div class="txt">{{ ruleText }}</div>
    </div>

    <!-- Countdown bar below rule banner -->
    <div class="cd-bar-wrap">
      <div class="cd-bar-track">
        <div class="cd-bar-fill"
             :style="{ width: cdBarPct + '%', background: ringColor }"></div>
      </div>
    </div>

    <!-- Blackboard center -->
    <div class="board-wrap">
      <div class="board">
        <div class="board-inner">
          <!-- Single question centered -->
          <transition name="pop">
            <div
              v-if="currentQ"
              :key="currentQ.id"
              class="q-item"
              :class="{ shake: currentQ.status==='wrong', vanish: currentQ.status==='hit' }"
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <g>
                  <circle    v-if="currentQ.shape==='circle'"    cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="4"/>
                  <rect      v-else-if="currentQ.shape==='square'"  x="8" y="8" width="84" height="84" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
                  <polygon   v-else-if="currentQ.shape==='triangle'" points="50,8 92,88 8,88" fill="none" stroke="currentColor" stroke-width="4"/>
                  <polygon   v-else-if="currentQ.shape==='diamond'"  points="50,6 94,50 50,94 6,50" fill="none" stroke="currentColor" stroke-width="4"/>
                  <polygon   v-else-if="currentQ.shape==='pentagon'" points="50,8 92,38 76,88 24,88 8,38" fill="none" stroke="currentColor" stroke-width="4"/>
                  <polygon   v-else-if="currentQ.shape==='hexagon'"  points="25,10 75,10 95,50 75,90 25,90 5,50" fill="none" stroke="currentColor" stroke-width="4"/>
                  <text x="50" y="68" text-anchor="middle" fill="currentColor" font-size="50" font-weight="800" font-family="'Comic Sans MS','PingFang SC',cursive">{{ currentQ.n }}</text>
                </g>
              </svg>
            </div>
          </transition>
        </div>
        <div class="chalk-tray">
          <div class="chalk chalk--white"></div>
          <div class="chalk chalk--yellow"></div>
          <div class="chalk chalk--pink"></div>
          <div class="eraser"></div>
        </div>
        <!-- Bird interference: 1-8 random birds -->
        <div v-if="birdOn" class="birds-layer">
          <div v-for="b in birds" :key="b.id" class="bird" :style="b.style">
            <svg viewBox="0 0 200 100" width="100%" height="100%">
              <!-- tail -->
              <path fill="#2a2118" d="M18 52 L4 48 L4 56 Z"/>
              <!-- body -->
              <ellipse cx="90" cy="52" rx="52" ry="16" fill="#3a2a18"/>
              <ellipse cx="90" cy="46" rx="48" ry="12" fill="#5a3f22"/>
              <!-- head -->
              <circle cx="142" cy="42" r="18" fill="#3a2a18"/>
              <circle cx="142" cy="40" r="15" fill="#5a3f22"/>
              <!-- eye -->
              <circle cx="148" cy="38" r="3.5" fill="#fff"/>
              <circle cx="149" cy="38" r="2" fill="#111"/>
              <!-- beak -->
              <path fill="#f5a623" d="M158 40 L176 44 L158 47 Z"/>
              <path fill="#d4881a" d="M158 44 L176 44 L158 47 Z"/>
              <!-- legs -->
              <line x1="86" y1="66" x2="82" y2="76" stroke="#f5a623" stroke-width="2"/>
              <line x1="96" y1="66" x2="92" y2="76" stroke="#f5a623" stroke-width="2"/>
              <!-- wings -->
              <g class="wing wing-back" :style="{ animationDuration: b.flap + 's' }">
                <path fill="#2a1e10" d="M78 44 Q60 8 30 20 Q52 30 66 50 Z"/>
              </g>
              <g class="wing wing-front" :style="{ animationDuration: b.flap + 's' }">
                <path fill="#6b4a24" d="M84 40 Q66 4 32 14 Q60 28 78 46 Z"/>
                <path fill="#8b6634" d="M82 40 Q70 18 46 20 Q66 26 78 44 Z"/>
                <path stroke="#3a2a18" stroke-width="1.2" fill="none" d="M60 22 Q70 30 76 42"/>
                <path stroke="#3a2a18" stroke-width="1.2" fill="none" d="M50 20 Q64 28 72 40"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard bottom -->
    <div class="keyboard-wrap">
      <div class="desk"></div>
      <div class="keyboard">
        <button
          v-for="n in keys" :key="n"
          class="key" :class="{ press: pressed===n, correct: flash===n && flashType==='ok', wrong: flash===n && flashType==='no' }"
          @pointerdown="onKey(n)"
        >
          <span>{{ n }}</span>
        </button>
      </div>
    </div>

    <!-- Feedback toast -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="'toast--' + toast.type">
        {{ toast.msg }}
      </div>
    </transition>

    <!-- Countdown overlay -->
    <transition name="fade">
      <div v-if="countdown!==null" class="countdown">
        <div class="cd-num">{{ countdown === 0 ? t('countdownGo') : countdown }}</div>
      </div>
    </transition>

    <!-- Pause / exit dialog -->
    <transition name="fade">
      <div v-if="paused" class="pause">
        <div class="dialog">
          <div class="pause-title">{{ t('confirmExit') }}</div>
          <div class="pause-desc">{{ t('confirmExitDesc') }}</div>
          <div class="pause-actions">
            <button class="btn btn-secondary" @click="resume">{{ t('cancel') }}</button>
            <button class="btn btn-primary" @click="doExit">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { i18nMixin, state as i18nState } from '../i18n'
import { LEVELS, ruleKind, ruleText as ruleTextFn, saveHistory } from '../game'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'ktxx' // 课堂学习 gameType

const ALL_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon']
let uid = 0

export default {
  mixins: [i18nMixin],
  props: {
    duration: { type: Number, default: 60 },
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      timeLeft: this.duration,
      currentQ: null,        // single active question
      spawnTimer: null,
      tickTimer: null,
      countdown: 3,
      paused: false,
      pressed: -1, flash: -1, flashType: '',
      toast: null,
      total: 0, success: 0, fail: 0, rtSum: 0,
      windowStart: this.duration,
      winTotal: 0, winSuccess: 0,
      clockA: 0, clockB: 0,
      birds: [],
      keys: [0,1,2,3,4,5,6,7,8,9],
    }
  },
  computed: {
    birdOn() { return LEVELS[this.level].interferer && this.countdown === null && !this.paused },
    ruleText() { void this.lang; return ruleTextFn(this.level, i18nState.lang) },
    ringColor() {
      if (!this.currentQ) return '#6fd88a'
      const r = this.currentQ.remain / this.currentQ.max
      if (r < 0.3) return '#ff6b6b'
      if (r < 0.6) return '#ffd76a'
      return '#6fd88a'
    },
    cdBarPct() {
      if (!this.currentQ) return 0
      return Math.max(0, Math.min(100, (this.currentQ.remain / this.currentQ.max) * 100))
    },
  },
  watch: {
    birdOn(v) {
      if (v) this.spawnBirdFlock()
      else { this.birds = []; clearInterval(this._birdIv); this._birdIv = null }
    },
  },
  mounted() {
    this.startCountdown()
    window.addEventListener('keydown', this.onKeyDown)
  },
  beforeDestroy() {
    clearInterval(this.tickTimer)
    clearTimeout(this.spawnTimer)
    if (this._birdIv) clearInterval(this._birdIv)
    if (this._audio) { this._audio.pause(); this._audio = null }
    window.removeEventListener('keydown', this.onKeyDown)
  },
  methods: {
    spawnBirdFlock() {
      // 1-8 random birds, refreshed every flock cycle
      const gen = () => {
        const n = 1 + Math.floor(Math.random() * 8)
        const arr = []
        for (let i = 0; i < n; i++) {
          const top = 5 + Math.random() * 55   // percent within board
          const dur = 4 + Math.random() * 5    // seconds to cross
          const delay = Math.random() * 4      // stagger
          const size = 8 + Math.random() * 8   // vmin
          const flap = 0.25 + Math.random() * 0.25
          arr.push({
            id: 'b' + Date.now() + '-' + i,
            style: `top:${top}%; width:${size}vmin; height:${size*0.5}vmin; animation-duration:${dur}s; animation-delay:-${delay}s;`,
            flap,
          })
        }
        this.birds = arr
      }
      gen()
      this._birdIv = setInterval(gen, 8000)
    },
    onKeyDown(e) {
      if (e.key >= '0' && e.key <= '9') this.onKey(parseInt(e.key))
      if (e.key === 'Escape') this.askExit()
    },
    mmss(sec) {
      sec = Math.max(0, Math.ceil(sec))
      const m = Math.floor(sec / 60), s = sec % 60
      return (m<10?'0':'')+m + ':' + (s<10?'0':'')+s
    },
    startCountdown() {
      this.countdown = 3
      const step = () => {
        setTimeout(() => {
          this.countdown--
          if (this.countdown < 0) {
            this.countdown = null
            this.startPlay()
          } else step()
        }, 800)
      }
      step()
    },
    startPlay() {
      this.tickTimer = setInterval(() => this.tick(1 / 30), 1000 / 30)
      // Play voice for initial level, then spawn first question
      this.announceLevelAndSpawn(500)
    },
    voiceTrackFor(level) {
      // L1-2 → 1.mp3 (order), L3-4 → 2.mp3 (circle), L5-6 → 3.mp3 (nonTriangle)
      if (level <= 2) return 1
      if (level <= 4) return 2
      return 3
    },
    playRuleVoice(cb) {
      const track = this.voiceTrackFor(this.level)
      const dir = i18nState.lang === 'en' ? 'english' : 'chinese'
      try {
        if (this._audio) { this._audio.pause(); this._audio.onended = null; this._audio = null }
        const audio = new Audio(`voice/${dir}/${track}.mp3`)
        this._audio = audio
        const finish = () => { audio.onended = null; audio.onerror = null; if (cb) cb() }
        audio.onended = finish
        audio.onerror = finish
        const p = audio.play()
        if (p && p.catch) p.catch(() => finish())
      } catch (e) { if (cb) cb() }
    },
    announceLevelAndSpawn(initialDelay) {
      // Voice-gate the first spawn of a new rule category
      this._voiceGate = true
      this._announcedTrack = this.voiceTrackFor(this.level)
      clearTimeout(this.spawnTimer)
      this.spawnTimer = setTimeout(() => {
        this.playRuleVoice(() => {
          this._voiceGate = false
          if (!this.paused && this.timeLeft > 0) this.spawnNext()
        })
      }, initialDelay || 0)
    },
    spawnNext() {
      if (this.paused || this.timeLeft <= 0 || this._voiceGate) return
      const cfg = LEVELS[this.level]
      const kind = ruleKind(this.level)
      let shape
      const r = Math.random()
      if (kind === 'order') {
        shape = ALL_SHAPES[Math.floor(Math.random() * ALL_SHAPES.length)]
      } else if (kind === 'circle') {
        // 55% target (circle), 45% distractor
        shape = r < 0.55 ? 'circle' : ['triangle','square','diamond','pentagon','hexagon'][Math.floor(Math.random()*5)]
      } else {
        // nonTriangle: 30% triangle distractor, 70% target
        shape = r < 0.3 ? 'triangle' : ['circle','square','diamond','pentagon','hexagon'][Math.floor(Math.random()*5)]
      }
      const n = Math.floor(Math.random() * 10) // 0-9
      const isTarget = this.isTargetShape(shape)
      this.currentQ = {
        id: ++uid,
        n, shape, isTarget,
        max: cfg.maxTime, remain: cfg.maxTime,
        status: 'live',
        bornAt: performance.now(),
      }
    },
    isTargetShape(shape) {
      const k = ruleKind(this.level)
      if (k === 'order') return true
      if (k === 'circle') return shape === 'circle'
      return shape !== 'triangle'
    },
    tick(dt) {
      if (this.paused) return
      this.timeLeft -= dt
      this.clockA = (this.clockA + dt * 6) % 360
      this.clockB = (this.clockB + dt * 60) % 360

      const q = this.currentQ
      if (q && q.status === 'live') {
        q.remain -= dt
        if (q.remain <= 0) {
          // Timeout: for target = fail; for non-target = correct skip
          if (q.isTarget) this.recordFail(q, 'timeout')
          else this.recordCorrectSkip(q)
          this.despawnAndNext()
        }
      }
      if (this.windowStart - this.timeLeft >= 60) this.evaluateWindow()
      if (this.timeLeft <= 0) {
        this.timeLeft = 0
        this.endGame()
      }
    },
    evaluateWindow() {
      const rate = this.winTotal ? this.winSuccess / this.winTotal : 0
      const oldLevel = this.level
      if (rate >= 0.9 && this.level < 6) { this.level++; this.showToast('LEVEL UP · L' + this.level, 'ok') }
      else if (rate <= 0.7 && this.level > 1) { this.level--; this.showToast('LEVEL DOWN · L' + this.level, 'no') }
      this.winTotal = 0; this.winSuccess = 0
      this.windowStart = this.timeLeft
      if (this.level !== oldLevel) {
        // Difficulty changed → announce (per user spec) and gate spawning
        this.currentQ = null
        this.announceLevelAndSpawn(200)
      }
    },
    despawnAndNext(delay) {
      // clear current, schedule next
      const gap = delay != null ? delay : 350
      clearTimeout(this.spawnTimer)
      this.spawnTimer = setTimeout(() => {
        this.currentQ = null
        this.$nextTick(() => {
          this.spawnTimer = setTimeout(() => this.spawnNext(), 200)
        })
      }, gap)
    },
    onKey(n) {
      if (this.countdown !== null || this.paused) return
      this.pressed = n
      setTimeout(() => this.pressed = -1, 120)
      const q = this.currentQ
      if (!q || q.status !== 'live') return
      // Correct if: target shape AND matching digit
      if (q.isTarget && q.n === n) {
        this.recordSuccess(q)
        this.despawnAndNext(500)
      } else {
        // Wrong: pressed on non-target OR pressed wrong digit
        this.recordFail(q, 'wrong')
        this.despawnAndNext(500)
      }
    },
    recordSuccess(q) {
      const rt = performance.now() - q.bornAt
      this.rtSum += rt
      this.total++; this.success++
      this.winTotal++; this.winSuccess++
      const pts = Math.round(5 * LEVELS[this.level].coef)
      this.score += pts
      this.flash = q.n; this.flashType = 'ok'
      setTimeout(() => this.flash = -1, 300)
      this.showToast(this.t('correct'), 'ok')
      q.status = 'hit'
    },
    recordCorrectSkip(q) {
      // correctly skipped a non-target
      this.total++; this.success++
      this.winTotal++; this.winSuccess++
      // no score, but counts as correct behavior
    },
    recordFail(q, kind) {
      this.total++; this.fail++
      this.winTotal++
      if (q) {
        q.status = 'wrong'
        this.flash = q.n; this.flashType = 'no'
        setTimeout(() => this.flash = -1, 400)
      }
      this.showToast(kind === 'timeout' ? this.t('timeout') : this.t('wrong'), 'no')
    },
    showToast(msg, type) {
      this.toast = { msg, type }
      clearTimeout(this._t)
      this._t = setTimeout(() => this.toast = null, 450)
    },
    askExit() { this.paused = true },
    resume() { this.paused = false },
    doExit() { this.$emit('quit') },
    endGame(early) {
      clearInterval(this.tickTimer); clearTimeout(this.spawnTimer)
      this.paused = false
      const rate = this.total ? Math.round(this.success / this.total * 100) : 0
      const avgMs = this.success ? Math.round(this.rtSum / this.success) : 0
      const now = new Date()
      const pad = v => (v<10?'0':'')+v
      const rec = {
        time: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
        duration: this.duration,
        levels: this.level,
        total: this.total, success: this.success, fail: this.fail,
        rate, avgMs, score: this.score,
        early: !!early,
      }
      saveHistory(rec)
      this.$emit('finish', rec)
    },
  },
}
</script>

<style scoped>
.game {
  position: relative; width: 100%; height: 100%;
  overflow: hidden;
  background:
    linear-gradient(180deg, #f4e2b8 0%, #e6c98a 50%, #8b5a1e 50%, #6b4315 100%);
}
.wall {
  position: absolute; top: 0; left: 0; right: 0; height: 55%;
  background:
    linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,0) 30%),
    repeating-linear-gradient(90deg, transparent 0 4rem, rgba(0,0,0,.03) 4rem 4.05rem);
}
.floor {
  position: absolute; bottom: 0; left: 0; right: 0; height: 45%;
  background:
    linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.35)),
    repeating-linear-gradient(90deg, #7a4a15 0 6rem, #6b3f10 6rem 6.1rem, #7a4a15 6.1rem 12rem);
}
.poster {
  position: absolute; top: 5vmin; width: 8vmin; height: 6vmin;
  background: #fff; color: #c3352a;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-family: 'Comic Sans MS', cursive; font-size: 2vmin;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.25);
  border: .3rem solid #fff;
  transform: rotate(-4deg);
}
.poster--left  { left: 3%; background: #ffe27a; color: #c3352a; }
.poster--right { right: 3%; background: #a8d8ff; color: #1a4b8b; transform: rotate(4deg); }
.clock {
  position: absolute; top: 4vmin; right: 14%; width: 7vmin; height: 7vmin;
  filter: drop-shadow(0 .3rem .5rem rgba(0,0,0,.3));
}

/* HUD — bumped to newG01 scale */
.hud {
  position: absolute; top: 2vmin; display: flex; gap: 1.5vmin; z-index: 20;
}
.hud--left { left: 2vmin; }
.hud--right { right: 2vmin; flex-direction: row; align-items: center; gap: 1.2vmin; }
.hud-item {
  background: rgba(20, 24, 35, .88);
  border: 1px solid rgba(255,255,255,.12);
  padding: 1.4vmin 2vmin; border-radius: 1.2vmin; min-width: 12vmin;
  backdrop-filter: blur(10px);
  box-shadow: 0 .8vmin 1.5vmin rgba(0,0,0,.4);
}
.hud-label { font-size: 1.6vmin; color: rgba(255,255,255,.65); letter-spacing: .15em; text-transform: uppercase; font-weight: 600; }
.hud-value { font-size: 3.4vmin; font-weight: 800; color: #fff; margin-top: .3vmin; line-height: 1; }
.hud-value.score { color: #ffd76a; }
.hud-value.time { font-variant-numeric: tabular-nums; }
.hud-value.time.low { color: #ff6b6b; animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: .5; } }
.lv-badge {
  display: inline-block; padding: .1em .55em; border-radius: .5vmin;
  background: linear-gradient(135deg, #ffb347, #ff7a3d); font-size: 3vmin;
}

.round-btn {
  display: inline-flex; align-items: center; gap: .5em;
  padding: 1.4vmin 2.4vmin; border-radius: 999px; color: #fff;
  background: rgba(20, 24, 35, .88); border: 1px solid rgba(255,255,255,.18);
  font-weight: 700; font-size: 2.2vmin; backdrop-filter: blur(10px);
  box-shadow: 0 .8vmin 1.5vmin rgba(0,0,0,.35);
}
.round-btn:hover { background: rgba(40, 44, 55, .95); }
.round-btn.skip { background: rgba(255, 122, 61, .92); border-color: rgba(255,255,255,.2); }
.round-btn.skip:hover { background: rgba(255, 122, 61, 1); }

/* Rule banner */
.rule-banner {
  position: absolute; left: 50%; top: 2vmin; transform: translateX(-50%);
  display: flex; align-items: center; gap: 1.2vmin;
  background: linear-gradient(180deg, rgba(20,24,35,.92), rgba(20,24,35,.78));
  border: 1px solid rgba(255,255,255,.12);
  padding: 1.2vmin 2.4vmin; border-radius: 999px;
  z-index: 15; backdrop-filter: blur(10px);
  box-shadow: 0 .8vmin 1.5vmin rgba(0,0,0,.4);
  max-width: min(70vmin, 70vw);
}
.rule-banner .tag {
  padding: .3em 1em; border-radius: 999px; font-size: 1.6vmin; font-weight: 800;
  background: #ffb347; color: #1a1a1a; letter-spacing: .05em; white-space: nowrap; flex-shrink: 0;
}
.rule-banner .txt {
  color: #fff; font-weight: 600; font-size: 2vmin;
  white-space: normal; line-height: 1.3;
}

/* Countdown bar under rule banner */
.cd-bar-wrap {
  position: absolute; left: 50%; top: 7vmin; transform: translateX(-50%);
  width: min(50vmin, 60vw);
  z-index: 15;
  padding-top: 1.2vmin;
}
.cd-bar-track {
  width: 100%; height: 1.2vmin;
  background: rgba(20,24,35,.6);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 999px; overflow: hidden;
  box-shadow: inset 0 .2vmin .4vmin rgba(0,0,0,.4);
}
.cd-bar-fill {
  height: 100%; border-radius: 999px;
  transition: width .1s linear, background .3s;
  box-shadow: 0 0 1vmin currentColor;
}

/* Blackboard */
.board-wrap {
  position: absolute; top: 12vmin; left: 50%; transform: translateX(-50%);
  width: min(72%, 68vmin); height: 42%;
  display: flex; align-items: center; justify-content: center;
}
.board {
  position: relative; width: 100%; height: 100%;
  background: radial-gradient(ellipse at center, #2a5a3d 0%, #1e4230 55%, #163524 100%);
  border-radius: .8vmin;
  border: 1.4vmin solid transparent;
  border-image: linear-gradient(135deg, #a8721f 0%, #6b4515 50%, #a8721f 100%) 1;
  box-shadow:
    0 1.5rem 3rem rgba(0,0,0,.5),
    inset 0 0 6rem rgba(0,0,0,.4),
    inset 0 0 1rem rgba(255,255,255,.05);
}
.board::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(255,255,255,.06), transparent 30%),
    radial-gradient(ellipse at 70% 60%, rgba(255,255,255,.05), transparent 40%);
  pointer-events: none;
}
.board-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.q-item {
  position: relative;
  width: 22vmin; height: 22vmin;
  color: #f5efdc;
  filter: drop-shadow(0 0 .4rem rgba(0,0,0,.5));
}
.q-item.shake { animation: shake .3s ease; color: #ff6b6b; }
.q-item.vanish { animation: vanish .35s ease forwards; color: #ffd76a; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1vmin); }
  75% { transform: translateX(1vmin); }
}
@keyframes vanish {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
.pop-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.pop-enter { transform: scale(.2) rotate(-20deg); opacity: 0; }
.pop-leave-active { transition: all .3s ease; }

.chalk-tray {
  position: absolute; bottom: -1vmin; left: 8%; right: 8%; height: 1vmin;
  background: linear-gradient(180deg, #8b5a1e, #6b4515);
  border-radius: 0 0 .3rem .3rem;
  display: flex; gap: 1vmin; align-items: center; padding: 0 1.5vmin;
}
.chalk { width: 3vmin; height: .5vmin; border-radius: .2rem; margin-top: -.8vmin; }
.chalk--white  { background: #f5efdc; }
.chalk--yellow { background: #ffd76a; }
.chalk--pink   { background: #ffb3c8; }
.eraser {
  width: 4vmin; height: 1.4vmin; margin-top: -1.2vmin; margin-left: auto;
  background: linear-gradient(180deg, #4a2f10, #3a2408);
  border-top: .4vmin solid #f5efdc;
  border-radius: .2rem;
}

/* ==== Realistic flapping bird ==== */
.birds-layer {
  position: absolute; inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}
.bird {
  position: absolute; left: -18%;
  animation: fly linear infinite;
  filter: drop-shadow(0 .5rem .5rem rgba(0,0,0,.4));
  pointer-events: none;
}
.bird svg { overflow: visible; }
.wing { transform-origin: 78px 44px; }
.wing-back  { animation: flapBack  .35s ease-in-out infinite; }
.wing-front { animation: flapFront .35s ease-in-out infinite; }
@keyframes flapFront {
  0%   { transform: rotate(-8deg) scaleY(1); }
  35%  { transform: rotate(-55deg) scaleY(.85); }
  70%  { transform: rotate(15deg)  scaleY(1); }
  100% { transform: rotate(-8deg) scaleY(1); }
}
@keyframes flapBack {
  0%   { transform: rotate(-4deg) scaleY(1); }
  35%  { transform: rotate(-40deg) scaleY(.9); }
  70%  { transform: rotate(10deg)  scaleY(1); }
  100% { transform: rotate(-4deg) scaleY(1); }
}
@keyframes fly {
  0%   { left: -18%; transform: translateY(0) scaleX(1); }
  15%  { transform: translateY(-3vmin) scaleX(1); }
  30%  { transform: translateY(2vmin)  scaleX(1); }
  50%  { transform: translateY(-2vmin) scaleX(1); }
  70%  { transform: translateY(3vmin)  scaleX(1); }
  85%  { transform: translateY(-1vmin) scaleX(1); }
  100% { left: 120%; transform: translateY(0) scaleX(1); }
}

/* Keyboard */
.keyboard-wrap {
  position: absolute; bottom: 3vmin; left: 50%; transform: translateX(-50%);
  width: min(90%, 92vmin);
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  z-index: 15;
}
.desk {
  position: absolute; left: -10%; right: -10%; top: 30%; bottom: -4vmin;
  background: linear-gradient(180deg, #5a3a10, #3a2408);
  border-radius: .8vmin;
  box-shadow: inset 0 .4vmin 0 rgba(255,255,255,.05), 0 1.5vmin 3vmin rgba(0,0,0,.5);
  z-index: -1;
}
.keyboard {
  display: grid; grid-template-columns: repeat(10, 1fr);
  gap: 1.8vmin; width: 100%;
  padding: 2.2vmin;
  background: linear-gradient(180deg, #2a2a2f, #1a1a1e);
  border-radius: 1.5vmin;
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 1.5vmin 3vmin rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);
}
.key {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #f8f2df, #d9cea8);
  color: #3a2a10; font-weight: 800;
  font-size: 4.6vmin;
  border-radius: 1.4vmin;
  box-shadow:
    0 .5vmin 0 #8b7a4a,
    0 .7vmin 1vmin rgba(0,0,0,.3),
    inset 0 1px 0 rgba(255,255,255,.6);
  transition: all .08s ease;
  font-family: 'Comic Sans MS', 'PingFang SC', cursive;
}
.key:hover { background: linear-gradient(180deg, #fff8e5, #e5d9b0); }
.key.press, .key:active {
  transform: translateY(.4vmin);
  box-shadow: 0 .1vmin 0 #8b7a4a, 0 .2vmin .4vmin rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.4);
}
.key.correct {
  background: linear-gradient(180deg, #a8f0b8, #6fd88a);
  box-shadow: 0 .5vmin 0 #3f8f52, 0 0 2vmin rgba(111, 216, 138, .7);
  color: #14421e;
}
.key.wrong {
  background: linear-gradient(180deg, #ffb3b3, #ff7070);
  box-shadow: 0 .5vmin 0 #8f3f3f, 0 0 2vmin rgba(255, 112, 112, .6);
  color: #4a1414;
  animation: keyshake .2s ease;
}
@keyframes keyshake { 25% { transform: translateX(-.3vmin); } 75% { transform: translateX(.3vmin); } }

/* Toast */
.toast {
  position: absolute; top: 18%; left: 50%; transform: translate(-50%, -50%);
  padding: .8vmin 2vmin; border-radius: 999px;
  font-size: 2.2vmin; font-weight: 700;
  z-index: 30; pointer-events: none;
}
.toast--ok { background: rgba(111, 216, 138, .95); color: #14421e; box-shadow: 0 0 1.5vmin rgba(111, 216, 138, .6); }
.toast--no { background: rgba(255, 112, 112, .95); color: #4a1414; box-shadow: 0 0 1.5vmin rgba(255, 112, 112, .5); }
.toast-enter-active, .toast-leave-active { transition: all .15s ease; }
.toast-enter { opacity: 0; transform: translate(-50%, -70%) scale(.7); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -30%) scale(1.1); }

/* Countdown */
.countdown {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.5); z-index: 40; backdrop-filter: blur(4px);
}
.cd-num {
  font-size: 20vmin; font-weight: 900;
  background: linear-gradient(180deg, #ffd76a, #ff7a3d);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: pop .8s ease;
  text-shadow: 0 .5rem 3rem rgba(255, 122, 61, .5);
}
@keyframes pop {
  0%   { transform: scale(2); opacity: 0; }
  30%  { transform: scale(1); opacity: 1; }
  70%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(.5); opacity: 0; }
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* Pause dialog */
.pause {
  position: absolute; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.65); backdrop-filter: blur(6px);
}
.dialog {
  width: min(50vmin, 90vw);
  background: linear-gradient(180deg, #1c2331, #141822);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 2vmin; padding: 3.5vmin;
  box-shadow: 0 2rem 5rem rgba(0,0,0,.6);
  text-align: center;
}
.pause-title { font-size: 3vmin; font-weight: 800; color: #fff; margin-bottom: 1vmin; }
.pause-desc { color: rgba(255,255,255,.65); margin-bottom: 3vmin; font-size: 2vmin; }
.pause-actions { display: flex; gap: 2vmin; }
.pause-actions .btn { flex: 1; font-size: 2.2vmin; padding: 1.5vmin 2vmin; }
</style>
