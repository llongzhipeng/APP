<template>
  <div class="game" @mousemove="onMouseMove" ref="arena">
    <div class="bg">
      <div class="ceiling"></div>
      <div class="spot"></div>
      <div class="crowd"></div>
      <div class="floor"></div>
    </div>

    <!-- HUD -->
    <div class="hud-top">
      <div class="hud-left">
        <div class="stat lvl">
          <div class="lbl">{{ t.difficulty }}</div>
          <div class="val">
            <span class="big">Lv.{{ level }}</span>
            <div class="stars">
              <span v-for="i in 6" :key="i" class="star" :class="{on: i<=level}">★</span>
            </div>
          </div>
        </div>
        <div class="stat score">
          <div class="lbl">{{ t.score }}</div>
          <div class="val"><span class="big score-num">{{ score }}</span></div>
        </div>
        <div class="stat time">
          <div class="lbl">{{ t.timeLeft }}</div>
          <div class="val"><span class="big timer" :class="{low: timeLeft<=10}">{{ fmtTime(timeLeft) }}</span></div>
        </div>
      </div>

      <!-- Task (centered in top bar) -->
      <div class="hud-task">
        <div class="task-title">▬ {{ t.task }} ▬</div>
        <div class="task-content">
          <div class="task-glove" :style="{'--tc': activeColor.hex}">
            <svg viewBox="0 0 200 220">
              <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
              <path :fill="activeColor.hex" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
            </svg>
          </div>
          <div class="task-txt">{{ taskText }}</div>
          <div class="task-target">
            <div v-for="c in currentTargetColors" :key="c.key" class="chip" :style="{background: c.hex, boxShadow:`0 0 1.5vmin ${c.hex}`}"></div>
          </div>
        </div>
      </div>

      <div class="hud-right">
        <div class="combo" v-if="combo>=2"><span class="cx">×{{ combo }}</span><span class="cl">{{ t.combo }}</span></div>
        <button v-if="showBatchSkip" class="ret-btn" type="button" @click="$emit('batch-skip')">⏭ {{ t.skipGame || '跳过' }}</button>
        <button class="ret-btn" @click.stop="pause">⏸ {{ t.back }}</button>
      </div>
    </div>

    <!-- Grid arena -->
    <div class="arena">
      <div class="grid-frame">
        <div class="grid" :style="gridStyle">
          <div v-for="cell in cells" :key="cell.id" class="cell">
            <div v-if="cell.color" class="target"
                 :class="{ hit: cell.hit, miss: cell.miss, done: roundDone && !cell.hit, gray: cell.gray }"
                 :style="{ '--c': cell.color.hex, '--c2': darken(cell.color.hex) }"
                 @click.stop="onTargetClick(cell, $event)">
              <div class="stand"></div>
              <div class="face">
                <div class="ring r1"></div>
                <div class="ring r2"></div>
                <div class="ring r3"></div>
                <div class="bull"></div>
                <div class="shine"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="round-bar">
          <div class="round-fill" :style="{width: roundPct + '%', background: roundColor}"></div>
        </div>
      </div>
      <div v-for="p in popups" :key="p.id" class="popup" :class="p.kind" :style="{left: p.x+'px', top: p.y+'px'}">{{ p.text }}</div>
    </div>

    <div class="hint-bottom">
      <div class="glove-hint">
        <div v-for="(c, i) in availableColors" :key="c.key" class="hint-glove" :class="{on: i===activeColorIdx}" :style="{color: c.hex}">🥊</div>
      </div>
      <span class="hint-txt">{{ t.tips }}</span>
    </div>

    <!-- Side switch-glove button (tablet-friendly) -->
    <button v-if="availableColors.length > 1" class="switch-btn"
            :style="{ '--sc': activeColor.hex, '--sc2': darken(activeColor.hex) }"
            @click.stop="switchColor">
      <div class="switch-icon">
        <svg viewBox="0 0 200 220">
          <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
          <path :fill="activeColor.hex" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
          <ellipse cx="80" cy="55" rx="16" ry="24" fill="#fff" opacity=".22"/>
        </svg>
        <div class="switch-arrows">⇄</div>
      </div>
      <div class="switch-label">{{ t.switchColor || 'SWITCH' }}</div>
      <div class="switch-dots">
        <span v-for="(c, i) in availableColors" :key="c.key"
              class="sw-dot" :class="{on: i===activeColorIdx}"
              :style="{ background: c.hex }"></span>
      </div>
    </button>

    <!-- Glove cursor -->
    <div class="glove-cursor" :style="{ left: mouse.x+'px', top: mouse.y+'px' }" :class="{punch: punching}">
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <defs>
          <radialGradient :id="'gg-'+activeColor.key" cx="35%" cy="30%" r="70%">
            <stop offset="0" :stop-color="lighten(activeColor.hex)"/>
            <stop offset=".45" :stop-color="activeColor.hex"/>
            <stop offset="1" :stop-color="darken(activeColor.hex)"/>
          </radialGradient>
        </defs>
        <path fill="#f0e8d5" d="M55 175 L145 175 L150 210 L50 210 Z"/>
        <path fill="#8b7d63" opacity=".4" d="M50 200 L150 200 L150 210 L50 210 Z"/>
        <path :fill="`url(#gg-${activeColor.key})`" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z"/>
        <path :fill="`url(#gg-${activeColor.key})`" d="M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
        <ellipse cx="80" cy="55" rx="18" ry="26" fill="#fff" opacity=".2"/>
        <path fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5" stroke-dasharray="3 3" d="M100 30 Q100 90 100 165"/>
      </svg>
    </div>

    <!-- Pause -->
    <div class="mask" v-if="paused">
      <div class="paused-modal">
        <div class="pause-icon">⏸</div>
        <h2>{{ t.paused }}</h2>
        <p>{{ t.confirmEnd }}</p>
        <div class="btns">
          <button class="btn" @click="resume">▶ {{ t.resume }}</button>
          <button class="btn danger" @click="$emit('quit')">■ {{ t.endGame }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDifficulty, COLOR_POOL, pickColors, shuffle } from '../utils/config'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'qjyx'
const GRAY_COLOR = { key: 'gray', hex: '#4a4a55', ring: '#6a6a75', name: { zh: '灰', en: 'GRAY' } }

export default {
  name: 'GameScreen',
  props: ['t', 'duration', 'showBatchSkip'],
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      timeLeft: this.duration,
      cells: [],
      currentTargetColors: [],
      activeColorIdx: 0,
      availableColors: [],
      roundStart: 0,
      roundMax: 10000,
      roundTimer: null,
      mainTimer: null,
      minuteTimer: null,
      mouse: { x: -200, y: -200 },
      paused: false,
      total: 0, success: 0, fail: 0,
      reactionSum: 0,
      levelHistory: [],
      winCorrect: 0, winTotal: 0,
      combo: 0,
      popups: [], popupSeq: 0,
      running: false,
      roundDone: false,      // <-- prevents further scoring after round finished
      roundHits: 0,
      roundTargetHits: 1,
      punching: false,
      pausedElapsed: 0,
      currentAudio: null,
      pendingLevelChangeVoice: false,
      firstAnnounce: true,
    }
  },
  computed: {
    diff() { return getDifficulty(this.level) },
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.diff.gridC}, 1fr)`,
        gridTemplateRows: `repeat(${this.diff.gridR}, 1fr)`,
      }
    },
    activeColor() { return this.availableColors[this.activeColorIdx] || COLOR_POOL[0] },
    currentLang() { return this.t.lang === 'EN' ? 'zh' : 'en' },
    taskText() {
      const colors = this.currentTargetColors.map(c => c.name[this.currentLang]).join(' / ')
      if (this.currentLang === 'zh') return `用 ${colors} 拳套打击 ${colors} 靶心`
      return `HIT the ${colors} target with the ${colors} glove`
    },
    roundPct() {
      const elapsed = Date.now() - this.roundStart
      return Math.max(0, 100 - (elapsed / this.roundMax) * 100)
    },
    roundColor() {
      const p = this.roundPct
      if (p > 50) return 'linear-gradient(90deg, #22c55e, #a3e635)'
      if (p > 25) return 'linear-gradient(90deg, #f5b301, #ff8a5b)'
      return 'linear-gradient(90deg, #ff5568, #b8102a)'
    }
  },
  mounted() {
    this.start()
    window.addEventListener('keydown', this.onKey)
  },
  beforeDestroy() {
    this.cleanup()
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    darken(hex) { return this.mix(hex, -60) },
    lighten(hex) { return this.mix(hex, 60) },
    mix(hex, d) {
      const n = parseInt(hex.slice(1), 16)
      const clamp = v => Math.max(0, Math.min(255, v))
      const r = clamp(((n>>16)&255) + d)
      const g = clamp(((n>>8)&255) + d)
      const b = clamp((n&255) + d)
      return '#' + ((r<<16)|(g<<8)|b).toString(16).padStart(6, '0')
    },
    fmtTime(s) {
      const m = Math.floor(s / 60), ss = s % 60
      return `${m}:${String(ss).padStart(2,'0')}`
    },
    start() {
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.running = true
      this.mainTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft--
        if (this.timeLeft <= 0) this.finish()
      }, 1000)
      this.minuteTimer = setInterval(() => {
        if (this.paused) return
        this.evaluateDifficulty()
      }, 60000)
      this.nextRound()
      this._raf = () => {
        this.$forceUpdate()
        if (this.running) requestAnimationFrame(this._raf)
      }
      requestAnimationFrame(this._raf)
    },
    evaluateDifficulty() {
      if (this.winTotal === 0) return
      const rate = this.winCorrect / this.winTotal
      let changed = false
      if (rate >= 0.9 && this.level < 6) { this.level++; changed = true }
      else if (rate < 0.7 && this.level > 1) { this.level--; changed = true }
      this.winCorrect = 0; this.winTotal = 0
      if (changed) this.pendingLevelChangeVoice = true
    },
    playVoice(track) {
      try {
        const dir = this.currentLang === 'zh' ? 'chinese' : 'english'
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.currentAudio.currentTime = 0
        }
        const audio = new Audio(`voice/${dir}/${track}.mp3`)
        this.currentAudio = audio
        audio.play().catch(() => {})
        return audio
      } catch (_) { return null }
    },
    playRoundStartVoice() {
      // Voice track = target color index + 1 (red=1, blue=2, green=3, yellow=4)
      const targetKey = this.currentTargetColors[0].key
      const idx = COLOR_POOL.findIndex(c => c.key === targetKey)
      const track = idx + 1
      this.playVoice(track)
    },
    announceRound() {
      // Play voice ONLY when:
      //  - first entry to the game (this.firstAnnounce still true), or
      //  - difficulty just changed (pendingLevelChangeVoice)
      if (this.pendingLevelChangeVoice) {
        this.pendingLevelChangeVoice = false
        this.firstAnnounce = false
        // Level change: play "switch glove" prompt (5.mp3), then color prompt
        const audio = this.playVoice(5)
        if (audio) {
          const onEnd = () => {
            audio.removeEventListener('ended', onEnd)
            this.playRoundStartVoice()
          }
          audio.addEventListener('ended', onEnd)
          setTimeout(() => {
            audio.removeEventListener('ended', onEnd)
            if (this.currentAudio === audio) this.playRoundStartVoice()
          }, 5000)
        } else {
          this.playRoundStartVoice()
        }
      } else if (this.firstAnnounce) {
        this.firstAnnounce = false
        // First entry to the game: play the color prompt only
        this.playRoundStartVoice()
      }
      // Otherwise: no voice — level unchanged, not first round → silent
    },
    nextRound() {
      const d = this.diff
      const total = d.gridR * d.gridC
      const cols = pickColors(d.colors)
      this.availableColors = cols
      if (this.activeColorIdx >= cols.length) this.activeColorIdx = 0

      // Pick THIS round's target color from the color pool (colors = pool size)
      const targetColor = shuffle(cols)[0]
      this.currentTargetColors = [targetColor]

      // Build cells: EXACTLY targetCount cells are the target color, rest are GRAY (unclickable)
      const need = d.targetCount
      const arr = []
      for (let i = 0; i < need; i++) arr.push({ color: targetColor, gray: false })
      for (let i = need; i < total; i++) arr.push({ color: GRAY_COLOR, gray: true })
      this.cells = shuffle(arr).map((c, i) => ({
        id: `${Date.now()}-${i}-${Math.random()}`,
        color: c.color, gray: c.gray, hit: false, miss: false
      }))
      this.roundStart = Date.now()
      this.roundMax = d.maxTime * 1000
      this.roundTargetHits = d.targetCount
      this.roundHits = 0
      this.roundDone = false

      clearTimeout(this.roundTimer)
      this.roundTimer = setTimeout(() => this.roundTimeout(), this.roundMax)

      this.announceRound()
    },
    roundTimeout() {
      if (this.roundDone) return
      this.roundDone = true
      // count as fail if user hadn't completed
      if (this.roundHits < this.roundTargetHits) {
        this.total++
        this.fail++
        this.winTotal++
        this.combo = 0
        this.showPopup(window.innerWidth/2, window.innerHeight/2, '⏰ ' + this.t.timeoutTip, 'miss')
      }
      this.levelHistory.push(this.level)
      setTimeout(() => this.nextRound(), 400)
    },
    onTargetClick(cell, e) {
      if (this.paused || this.roundDone || cell.hit || cell.miss) return
      // Must hit the BULLSEYE (center), not just the target ring
      const rect = e.currentTarget.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx, dy = e.clientY - cy
      const dist = Math.sqrt(dx*dx + dy*dy)
      // Bull area = inner 25% radius of the target (bull + white center ring)
      const bullR = rect.width * 0.25
      const hitBull = dist <= bullR

      const isGray = cell.gray
      const isTargetColor = !isGray && cell.color.key === this.currentTargetColors[0].key
      const gloveMatch = !isGray && cell.color.key === this.activeColor.key
      const correct = isTargetColor && gloveMatch && hitBull

      this.punching = true
      setTimeout(() => this.punching = false, 150)

      const reaction = Date.now() - this.roundStart
      this.total++
      this.winTotal++
      if (correct) {
        cell.hit = true
        this.success++
        this.winCorrect++
        this.reactionSum += reaction
        this.combo++
        const pts = Math.round(5 * this.diff.coef)
        const bonus = this.combo >= 3 ? Math.floor(this.combo/2) : 0
        this.score += pts + bonus
        this.showPopup(e.clientX, e.clientY, `✓ ${this.t.correctTip} +${pts + bonus}`, 'ok')
        this.roundHits++
        if (this.roundHits >= this.roundTargetHits) {
          this.roundDone = true
          clearTimeout(this.roundTimer)
          this.levelHistory.push(this.level)
          setTimeout(() => this.nextRound(), 450)
        }
      } else {
        cell.miss = true
        this.fail++
        this.combo = 0
        this.showPopup(e.clientX, e.clientY, `✗ ${this.t.wrongTip}`, 'miss')
        // Wrong click ends the round
        this.roundDone = true
        clearTimeout(this.roundTimer)
        this.levelHistory.push(this.level)
        setTimeout(() => this.nextRound(), 700)
      }
    },
    onMouseMove(e) { this.mouse.x = e.clientX; this.mouse.y = e.clientY },
    switchColor() {
      if (this.paused || !this.availableColors.length) return
      this.activeColorIdx = (this.activeColorIdx + 1) % this.availableColors.length
    },
    onKey(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        this.switchColor()
      } else if (e.code === 'Escape') this.pause()
    },
    showPopup(x, y, text, kind) {
      const id = ++this.popupSeq
      this.popups.push({ id, x, y, text, kind })
      setTimeout(() => { this.popups = this.popups.filter(p => p.id !== id) }, 900)
    },
    pause() {
      if (this.paused) return
      this.paused = true
      this.pausedElapsed = Date.now() - this.roundStart
      // Pause any voice prompt currently playing
      if (this.currentAudio) {
        try { this.currentAudio.pause() } catch (_) {}
      }
    },
    resume() {
      this.paused = false
      // shift roundStart so elapsed carries over
      this.roundStart = Date.now() - this.pausedElapsed
      // Resume the voice prompt from where it left off
      if (this.currentAudio) {
        try { this.currentAudio.play().catch(() => {}) } catch (_) {}
      }
    },
    endNow() { this.finish() },
    finish() {
      if (!this.running) return
      this.cleanup()
      const rate = this.total ? Math.round((this.success/this.total)*100) : 0
      const avgReaction = this.success ? Math.round(this.reactionSum/this.success) : 0
      this.$emit('finish', {
        ts: Date.now(), duration: this.duration - this.timeLeft,
        level: this.level,
        total: this.total, success: this.success, fail: this.fail,
        rate, avgReaction, score: this.score,
      })
    },
    cleanup() {
      this.running = false
      clearInterval(this.mainTimer); clearInterval(this.minuteTimer); clearTimeout(this.roundTimer)
      if (this.currentAudio) { try { this.currentAudio.pause() } catch (_) {} this.currentAudio = null }
    }
  }
}
</script>

<style scoped>
.game { position: relative; width: 100%; height: 100%; overflow: hidden; cursor: none;
  display: flex; flex-direction: column;
}
.bg { position: absolute; inset: 0; z-index: 0; overflow: hidden;
  background: radial-gradient(ellipse at 50% 0%, #2a1420 0%, #0a0510 60%), linear-gradient(180deg, #1a0a18, #0a0510);
}
.ceiling {
  position: absolute; top: 0; left: 0; right: 0; height: 15%;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.7) 0 8vmin, transparent 8vmin 10vmin),
    linear-gradient(180deg, rgba(0,0,0,.8), transparent);
}
.spot { position: absolute; top: -5%; left: 50%; transform: translateX(-50%);
  width: 90vmin; height: 90vmin;
  background: radial-gradient(ellipse at top, rgba(255,210,150,.2), transparent 55%);
  filter: blur(2vmin);
}
.crowd { position: absolute; left: 0; right: 0; bottom: 15%; height: 20%;
  background:
    radial-gradient(ellipse 3vmin 3.5vmin at 10% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 3.5vmin at 25% 95%, #0a0308 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 3.5vmin at 40% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 3.5vmin at 55% 95%, #0a0308 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 3.5vmin at 70% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 3.5vmin at 85% 95%, #0a0308 60%, transparent 62%),
    linear-gradient(180deg, transparent, rgba(0,0,0,.5) 70%);
  opacity: .6;
}
.floor { position: absolute; left: 0; right: 0; bottom: 0; height: 15%;
  background: linear-gradient(180deg, #1a0a18, #0a0510);
  border-top: 0.3vmin solid rgba(255,255,255,.08);
  box-shadow: 0 -2vmin 4vmin rgba(0,0,0,.6) inset;
}
.rope { display: none; }

/* HUD */
.hud-top { position: relative; z-index: 3;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5vmin 2vmin; gap: 2vmin;
}
.hud-left { display: flex; gap: 1.5vmin; flex-shrink: 0; }
.hud-right { display: flex; gap: 1.5vmin; align-items: center; flex-shrink: 0; }

/* Task centered inside HUD */
.hud-task { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1vmin 2.5vmin;
  background: linear-gradient(180deg, rgba(255,60,80,.18), rgba(255,60,80,.04));
  border: 0.2vmin solid rgba(255,60,80,.35);
  border-radius: 1.2vmin;
  box-shadow: 0 0.6vmin 2vmin rgba(0,0,0,.4);
  max-width: 70vw;
}
.hud-task .task-title { color: #ff8a99; font-size: 1.2vmin; letter-spacing: 0.5vmin; font-weight: 800; text-align: center; }
.hud-task .task-content { display: flex; align-items: center; justify-content: center; gap: 1.5vmin; margin-top: 0.3vmin; }
.hud-task .task-glove { width: 3.6vmin; height: 4vmin; filter: drop-shadow(0 0.4vmin 0.8vmin var(--tc)); flex-shrink: 0; }
.hud-task .task-txt { color: #fff; font-size: 2vmin; font-weight: 800; letter-spacing: 0.15vmin;
  font-family: 'Bebas Neue','Impact',sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hud-task .task-target { display: flex; gap: 0.4vmin; flex-shrink: 0; }
.hud-task .chip { width: 1.6vmin; height: 1.6vmin; border-radius: 50%; }
.stat {
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  border: 0.2vmin solid rgba(255,255,255,.12); border-radius: 1.2vmin;
  padding: 1.2vmin 2vmin; backdrop-filter: blur(1vmin);
  min-width: 18vmin;
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,.4);
}
.stat .lbl { color: rgba(255,255,255,.55); font-size: 1.4vmin; letter-spacing: 0.3vmin; font-weight: 700; text-transform: uppercase; }
.stat .val { margin-top: 0.4vmin; }
.stat .big { font-size: 3.2vmin; font-weight: 900; letter-spacing: 0.1vmin;
  font-family: 'Bebas Neue','Impact',sans-serif; }
.score-num { color: #ffd166; text-shadow: 0 0 2vmin rgba(255,180,80,.4); }
.timer.low { color: #ff5568; animation: blink 0.8s infinite; }
@keyframes blink { 50% { opacity: .4; } }
.stars { display: flex; gap: 0.2vmin; margin-top: 0.2vmin; }
.star { color: rgba(255,255,255,.15); font-size: 1.4vmin; }
.star.on { color: #ffd166; text-shadow: 0 0 0.5vmin #ffd166; }

.combo {
  padding: 1.2vmin 2vmin; border-radius: 99px;
  background: linear-gradient(90deg, #ffd166, #ff8a5b); color: #23150a;
  font-weight: 900; letter-spacing: 0.3vmin;
  display: flex; align-items: center; gap: 0.8vmin;
  animation: comboPop .3s ease;
  box-shadow: 0 0.5vmin 1.5vmin rgba(255,180,80,.5);
}
@keyframes comboPop { from { transform: scale(.5);} to { transform: scale(1);} }
.combo .cx { font-size: 2.8vmin; }
.combo .cl { font-size: 1.6vmin; }

.ret-btn {
  padding: 1.4vmin 2.2vmin; font-size: 2vmin; font-weight: 700; letter-spacing: 0.2vmin;
  background: rgba(255,255,255,.08); color: #fff;
  border: 0.2vmin solid rgba(255,255,255,.15); border-radius: 1vmin; cursor: pointer;
}
.ret-btn:hover { background: rgba(255,80,90,.3); border-color: rgba(255,80,90,.5); }

/* Task legacy (unused after moving into HUD) */
.task-bar { display: none; }

/* Arena */
.arena { position: relative; z-index: 1; flex: 1; margin: 0 auto;
  width: min(92vw, 140vmin); display: flex; align-items: flex-start; justify-content: center;
  padding: 0.5vmin 2vmin 1vmin;
  min-height: 0;
}
.grid-frame {
  position: relative;
  width: 100%; height: 100%;
  max-height: 82vh;
  padding: 1.5vmin;
  background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(0,0,0,.15));
  border: 0.3vmin solid rgba(255,255,255,.08); border-radius: 2vmin;
  box-shadow: 0 2vmin 5vmin rgba(0,0,0,.5), 0 0 3vmin rgba(255,60,80,.1) inset;
}
.grid { display: grid; gap: 1.5vmin; width: 100%; height: 100%; }
.cell { display: flex; align-items: center; justify-content: center; position: relative; min-width: 0; min-height: 0; }
.target { position: relative; width: 100%; height: 100%; max-width: 18vmin; max-height: 18vmin;
  aspect-ratio: 1; cursor: none; transition: transform .12s; }
.target .stand {
  position: absolute; bottom: -1vmin; left: 50%; transform: translateX(-50%);
  width: 40%; height: 12%; background: linear-gradient(180deg, #4a3020, #1a0e08);
  border-radius: 0 0 1vmin 1vmin;
  box-shadow: 0 0.4vmin 0.8vmin rgba(0,0,0,.6);
}
.target .face { position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--c) 0%, var(--c2) 100%);
  box-shadow:
    0 1vmin 2vmin rgba(0,0,0,.6),
    0 -0.3vmin 0.8vmin rgba(0,0,0,.4) inset,
    0 0.3vmin 0.8vmin rgba(255,255,255,.15) inset;
}
.target .ring { position: absolute; border-radius: 50%;
  background: rgba(255,255,255,.9);
  box-shadow: 0 0.2vmin 0.4vmin rgba(0,0,0,.3) inset;
}
.target .r1 { inset: 12%; }
.target .r2 { inset: 22%; background: var(--c); }
.target .r3 { inset: 32%; background: #fff; }
.target .bull { position: absolute; inset: 42%; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--c) 0%, var(--c2) 100%);
  box-shadow: 0 0.15vmin 0.3vmin rgba(0,0,0,.4);
}
.target .shine { position: absolute; top: 8%; left: 15%; width: 30%; height: 25%;
  background: radial-gradient(ellipse, rgba(255,255,255,.5), transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.target:hover:not(.done):not(.hit):not(.miss) { transform: scale(1.05) translateY(-0.3vmin); }
.target:hover .face { box-shadow:
    0 1.5vmin 2.5vmin rgba(0,0,0,.6),
    0 0 0 0.4vmin rgba(255,255,255,.2),
    0 -0.3vmin 0.8vmin rgba(0,0,0,.4) inset;
}
.target.hit { animation: hitFx .5s forwards; }
@keyframes hitFx {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35) rotate(10deg); filter: brightness(1.8); }
  60%  { transform: scale(1.15) rotate(-10deg); }
  100% { transform: scale(0) rotate(0); opacity: 0; }
}
.target.miss { animation: missFx .4s forwards; }
@keyframes missFx {
  0%,100% { transform: translateX(0); filter: brightness(1); }
  20% { transform: translateX(-1vmin); filter: brightness(.6); }
  40% { transform: translateX(1vmin); filter: brightness(.6); }
  60% { transform: translateX(-0.8vmin) rotate(-3deg); }
  80% { transform: translateX(0.8vmin) rotate(3deg); }
}
.target.done { opacity: .35; filter: grayscale(.8); transform: scale(.92); pointer-events: none; }
.target.gray { opacity: .55; }
.target.gray .face { background: radial-gradient(circle at 35% 30%, #6a6a75 0%, #2a2a30 100%);
  box-shadow: 0 1vmin 2vmin rgba(0,0,0,.6), 0 -0.3vmin 0.8vmin rgba(0,0,0,.4) inset;
}
.target.gray .r2, .target.gray .bull { background: radial-gradient(circle at 35% 30%, #6a6a75 0%, #2a2a30 100%); }
.target.gray .shine { opacity: .3; }
.target.gray:hover { opacity: .7; transform: scale(1.02); }

.round-bar { position: absolute; left: 2vmin; right: 2vmin; bottom: 0.6vmin;
  height: 0.6vmin; background: rgba(255,255,255,.08); border-radius: 99px; overflow: hidden;
}
.round-fill { height: 100%; transition: width .1s linear;
  box-shadow: 0 0 1vmin currentColor; }

.popup { position: fixed; transform: translate(-50%,-50%); pointer-events: none; z-index: 5;
  font-weight: 900; font-size: 3vmin; letter-spacing: 0.2vmin;
  animation: floatUp .9s forwards;
  font-family: 'Bebas Neue','Impact',sans-serif;
}
.popup.ok { color: #ffd166; text-shadow: 0 0 2vmin #ff8a5b, 0.3vmin 0.3vmin 0 #6b0716; }
.popup.miss { color: #ff5568; text-shadow: 0 0 2vmin #6b0716; }
@keyframes floatUp {
  from { opacity: 0; transform: translate(-50%, 1vmin) scale(.5); }
  20%  { opacity: 1; transform: translate(-50%, 0) scale(1.2); }
  40%  { transform: translate(-50%, 0) scale(1); }
  to   { opacity: 0; transform: translate(-50%, -8vmin) scale(.9); }
}

.hint-bottom { position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: center; gap: 2vmin;
  padding: 1.5vmin 0; color: rgba(255,255,255,.5); font-size: 1.6vmin; letter-spacing: 0.3vmin;
}
.glove-hint { display: flex; gap: 0.8vmin; }
.hint-glove { font-size: 2.4vmin; opacity: .25; filter: grayscale(1); transition: all .25s; transform: scale(.85); }
.hint-glove.on { opacity: 1; filter: none; transform: scale(1.15); text-shadow: 0 0 1vmin currentColor; }
.hint-txt { font-weight: 600; }

.glove-cursor { position: fixed; pointer-events: none; z-index: 10;
  width: 10vmin; height: 12vmin;
  transform: translate(-25%, -15%) rotate(-15deg);
  transition: transform .1s;
  filter: drop-shadow(0 1vmin 2vmin rgba(0,0,0,.6));
}
.glove-cursor.punch { transform: translate(-25%, -15%) rotate(-15deg) scale(0.85); }

/* Pause */
.mask { position: fixed; inset: 0; z-index: 100; cursor: default;
  background: radial-gradient(ellipse at center, rgba(20,5,15,.85), rgba(0,0,0,.95));
  backdrop-filter: blur(1vmin);
  display: flex; align-items: center; justify-content: center;
}
.paused-modal {
  background: linear-gradient(160deg, #241028, #150818);
  border: 0.3vmin solid rgba(255,60,80,.35); border-radius: 2.5vmin;
  padding: 5vmin 6vmin; text-align: center; color: #fff; max-width: 90vw;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,.7);
}
.pause-icon { font-size: 8vmin; margin-bottom: 1vmin; }
.paused-modal h2 { font-size: 4vmin; letter-spacing: 0.4vmin; margin-bottom: 1vmin; font-weight: 900; }
.paused-modal p { color: rgba(255,255,255,.65); font-size: 2vmin; margin-bottom: 3vmin; letter-spacing: 0.2vmin; }
.btns { display: flex; gap: 2vmin; justify-content: center; }
.btn { padding: 1.6vmin 3.5vmin; border-radius: 1vmin; border: 0.2vmin solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.06); color: #fff; cursor: pointer;
  font-size: 2.2vmin; font-weight: 700; letter-spacing: 0.3vmin;
}
.btn:hover { background: rgba(255,255,255,.14); transform: translateY(-0.3vmin); }
.btn.danger { background: linear-gradient(135deg, #ff3b4c, #b8102a); border-color: transparent;
  box-shadow: 0 1vmin 2vmin rgba(255,60,80,.5); }
/* === SIDE SWITCH-GLOVE BUTTON (tablet/mobile friendly) === */
.switch-btn {
  position: fixed; left: 2vmin; top: 50%; transform: translateY(-50%);
  z-index: 60; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 0.8vmin;
  padding: 1.8vmin 1.2vmin;
  border-radius: 2vmin;
  background: linear-gradient(160deg, rgba(255,255,255,.12), rgba(0,0,0,.35));
  border: 0.3vmin solid var(--sc, #fff);
  box-shadow:
    0 0 3vmin var(--sc, rgba(255,255,255,.4)),
    0 0.6vmin 2vmin rgba(0,0,0,.5),
    inset 0 0 1.5vmin rgba(0,0,0,.3);
  backdrop-filter: blur(1vmin);
  color: #fff;
  transition: all .18s ease-out;
  user-select: none; -webkit-tap-highlight-color: transparent;
  animation: switchPulse 2.2s ease-in-out infinite;
}
@keyframes switchPulse {
  0%,100% { box-shadow: 0 0 3vmin var(--sc), 0 0.6vmin 2vmin rgba(0,0,0,.5), inset 0 0 1.5vmin rgba(0,0,0,.3); }
  50%     { box-shadow: 0 0 5vmin var(--sc), 0 0.6vmin 2vmin rgba(0,0,0,.5), inset 0 0 1.5vmin rgba(0,0,0,.3); }
}
.switch-btn:hover { transform: translateY(-50%) scale(1.06); }
.switch-btn:active { transform: translateY(-50%) scale(.94); }
.switch-icon { position: relative; width: 8vmin; height: 8vmin; }
.switch-icon svg { width: 100%; height: 100%;
  filter: drop-shadow(0 0.4vmin 0.8vmin rgba(0,0,0,.4));
}
.switch-arrows {
  position: absolute; right: -1vmin; bottom: -0.4vmin;
  width: 3.4vmin; height: 3.4vmin; border-radius: 50%;
  background: linear-gradient(135deg, #ffd166, #ff8a5b);
  color: #23150a; font-weight: 900; font-size: 2.2vmin; line-height: 3.4vmin; text-align: center;
  box-shadow: 0 0.3vmin 0.8vmin rgba(0,0,0,.5);
}
.switch-label {
  font-size: 1.4vmin; font-weight: 800; letter-spacing: 0.25vmin;
  color: #fff; text-shadow: 0 0.2vmin 0.4vmin rgba(0,0,0,.6);
}
.switch-dots { display: flex; gap: 0.5vmin; }
.sw-dot {
  width: 1.2vmin; height: 1.2vmin; border-radius: 50%;
  opacity: .35; border: 0.15vmin solid rgba(255,255,255,.4);
  transition: all .2s;
}
.sw-dot.on {
  opacity: 1; transform: scale(1.35);
  box-shadow: 0 0 1.2vmin currentColor;
  border-color: #fff;
}
@media (pointer: fine) {
  .switch-btn { left: 1.5vmin; padding: 1.2vmin 0.9vmin; }
}

</style>
