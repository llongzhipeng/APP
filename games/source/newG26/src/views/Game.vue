<template>
  <div class="game" @touchstart="onTouch" @mousedown="onTouch">
    <!-- Top HUD -->
    <div class="hud">
      <div class="hud-cell">
        <div class="hud-lbl">{{ t('gameLevel') }}</div>
        <div class="hud-val level-val">
          <span class="lvl-badge">{{ level }}</span>
          <span class="lvl-name">{{ t(levelInfo.labelKey) }}</span>
        </div>
      </div>
      <div class="hud-cell">
        <div class="hud-lbl">{{ t('gameScore') }}</div>
        <div class="hud-val score-val">{{ score }}</div>
      </div>
      <div class="hud-cell">
        <div class="hud-lbl">{{ t('gameTime') }}</div>
        <div class="hud-val time-val" :class="{low: remain <= 10}">
          {{ fmtTime(remain) }}
        </div>
      </div>
      <div class="hud-cell hud-right">
        <button v-if="showBatchSkip" class="btn btn-ghost" type="button" @click="$emit('batch-skip')">
          ⏭ {{ t('skipGame') || '跳过' }}
        </button>
        <button class="btn btn-ghost" @click="onPause">
          ⏸ {{ t('back') }}
        </button>
      </div>
    </div>

    <!-- Task hint (pill) -->
    <div class="task-hint-wrap">
      <div class="task-hint">
        <span class="task-dot"></span>
        <span class="task-text">{{ t('gameTask') }}</span>
      </div>
    </div>

    <!-- Playfield -->
    <div class="field">
      <!-- Left column -->
      <div class="side-col left" :class="{ 'expect': expected === 'left', 'flash-ok': flash.left === 'ok', 'flash-bad': flash.left === 'bad' }"
           @click="onSide('left')">
        <div class="mn-holder">
          <Metronome side="left" :bpm="levelInfo.bpm/2" :running="mnRunning"
                     :hintText="t('tapLeft')" :glow="expected === 'left'"
                     @beat="onMetronomeBeat('left')" />
        </div>
        <div class="side-fb" v-if="feedback.left">
          <div :class="['fb', 'fb-' + feedback.left.kind]">
            {{ t(feedback.left.textKey) }}
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Right column -->
      <div class="side-col right" :class="{ 'expect': expected === 'right', 'flash-ok': flash.right === 'ok', 'flash-bad': flash.right === 'bad' }"
           @click="onSide('right')">
        <div class="mn-holder">
          <Metronome side="right" :bpm="levelInfo.bpm/2" :running="mnRunning"
                     :hintText="t('tapRight')" :glow="expected === 'right'"
                     @beat="onMetronomeBeat('right')" />
        </div>
        <div class="side-fb" v-if="feedback.right">
          <div :class="['fb', 'fb-' + feedback.right.kind]">
            {{ t(feedback.right.textKey) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Voice prompt indicator -->
    <transition name="fade">
      <div v-if="voicePlaying && !finished" class="voice-veil">
        <div class="voice-card">
          <div class="voice-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="voice-text">
            {{ lang === 'zh' ? '语音提示中，请注意听…' : 'Voice prompt playing…' }}
          </div>
        </div>
      </div>
    </transition>

    <!-- Level change toast -->
    <transition name="fade">
      <div v-if="levelToast" class="lv-toast" :class="levelToast.dir">
        <div class="lv-toast-ico">{{ levelToast.dir === 'up' ? '▲' : '▼' }}</div>
        <div class="lv-toast-body">
          <div class="lv-toast-title">
            {{ levelToast.dir === 'up' ? t('lvUpTitle') : t('lvDownTitle') }}
          </div>
          <div class="lv-toast-sub">
            {{ t('gameLevel') }} {{ levelToast.lv }} · {{ t(getLevelInfo(levelToast.lv).labelKey) }}
          </div>
        </div>
      </div>
    </transition>

    <!-- Pause overlay -->
    <transition name="fade">
      <div v-if="paused && !finished" class="overlay">
        <div class="modal card pause-modal">
          <div class="pause-ico">⏸</div>
          <h2>{{ t('paused') }}</h2>
          <p>{{ t('pauseTip') }}</p>
          <div class="row gap-2 pause-actions">
            <button class="btn btn-ghost btn-lg" @click="$emit('quit')">
              {{ t('endGame') }}
            </button>
            <button class="btn btn-primary btn-lg" @click="onResume">
              {{ t('resume') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Result overlay -->
    <transition name="fade">
      <div v-if="finished" class="overlay">
        <div class="modal card result-modal">
          <div class="result-ico">🏁</div>
          <h2>{{ t('resultTitle') }}</h2>
          <div class="result-score">{{ score }}</div>
          <div class="result-score-lbl">{{ t('resultScore') }}</div>

          <div class="result-grid">
            <div class="rg-cell">
              <div class="rg-num">{{ (accuracyPct).toFixed(1) }}%</div>
              <div class="rg-lbl">{{ t('resultAccuracy') }}</div>
            </div>
            <div class="rg-cell">
              <div class="rg-num">{{ stats.total }}</div>
              <div class="rg-lbl">{{ t('resultTotal') }}</div>
            </div>
            <div class="rg-cell">
              <div class="rg-num ok">{{ stats.success }}</div>
              <div class="rg-lbl">{{ t('resultSuccess') }}</div>
            </div>
            <div class="rg-cell">
              <div class="rg-num bad">{{ stats.fail }}</div>
              <div class="rg-lbl">{{ t('resultFail') }}</div>
            </div>
            <div class="rg-cell">
              <div class="rg-num">{{ stats.avgRt.toFixed(0) }}<span class="unit"> ms</span></div>
              <div class="rg-lbl">{{ t('resultAvgRt') }}</div>
            </div>
            <div class="rg-cell">
              <div class="rg-num">{{ maxLevel }}</div>
              <div class="rg-lbl">{{ t('resultMaxLevel') }}</div>
            </div>
          </div>

          <div class="row gap-2 result-actions">
            <button class="btn btn-ghost btn-lg" @click="$emit('home')">
              {{ t('backHome') }}
            </button>
            <button class="btn btn-primary btn-lg" @click="$emit('restart')">
              {{ t('playAgain') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Metronome from '../components/Metronome.vue'
import { LEVELS, getLevel } from '../difficulty.js'
import { playTick, playTickBell, playHitWood, playPerfect, playGood, playMiss, playLevelUp, playLevelDown, playVoice, stopVoice, unlockAudio } from '../audio.js'
import { saveRecord } from '../history.js'
import { i18nStore, i18nMixin } from '../i18n.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'jzqj'

export default {
  mixins: [i18nMixin],
  components: { Metronome },
  props: {
    duration: { type: Number, default: 60 },
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      remain: this.duration,
      running: false,
      paused: false,
      finished: false,

      expected: null,           // 'left' | 'right' | null
      lastBeatTime: 0,          // performance.now() ms of last beat
      lastBeatSide: null,
      beatConsumed: true,       // whether current beat has been resolved
      nextBeatSide: 'left',     // side of next beat
      nextBeatAt: 0,            // scheduled time ms
      sameSideStreak: 0,        // consecutive beats on the same side

      totalRt: 0,
      streak: 0,
      maxLevel: 1,

      // Feedback flashes per side
      flash: { left: null, right: null },
      feedback: { left: null, right: null },
      levelToast: null,

      // 60s window tracking
      windowStart: 0,
      windowHits: 0,
      windowMisses: 0,

      // Stats
      stats: {
        total: 0,
        success: 0,
        fail: 0,
        avgRt: 0
      },

      // Timers
      loopRaf: null,
      countdownTimer: null,
      startedAt: 0,
      pauseStartedAt: 0,
      pausedTotalMs: 0,

      // Voice prompt gate
      voicePlaying: false,
      voiceStartedAt: 0
    }
  },
  computed: {
    levelInfo() { return getLevel(this.level) },
    accuracyPct() {
      return this.stats.total ? (this.stats.success / this.stats.total * 100) : 0
    },
    // Metronome only animates while the game is actively running (not paused,
    // not finished, not blocked by voice prompt).
    mnRunning() {
      return this.running && !this.paused && !this.finished && !this.voicePlaying
    }
  },
  mounted() {
    unlockAudio()
    window.addEventListener('keydown', this.onKey)
    this.begin()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKey)
    this.stopLoops()
    stopVoice()
  },
  methods: {
    getLevelInfo(lv) { return getLevel(lv) },
    fmtTime(s) {
      s = Math.max(0, Math.floor(s))
      const m = Math.floor(s / 60), r = s % 60
      return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`
    },
    begin() {
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.running = true
      this.startedAt = performance.now()
      this.windowStart = this.startedAt
      const interval = this.beatIntervalMs()
      this.nextBeatSide = Math.random() < 0.5 ? 'left' : 'right'
      this.sameSideStreak = 0
      this.nextBeatAt = this.startedAt + interval  // lead-in
      this.beatConsumed = true
      this.loop()
      this.countdownTimer = setInterval(() => {
        if (this.paused || this.finished || this.voicePlaying) return
        this.remain -= 1
        if (this.remain <= 0) this.finish()
      }, 1000)
      // Initial voice prompt before the game formally begins
      this.runVoicePrompt()
    },
    runVoicePrompt() {
      // Freeze the scheduler & countdown while the prompt plays
      this.voicePlaying = true
      this.voiceStartedAt = performance.now()
      const lang = i18nStore.lang === 'en' ? 'en' : 'zh'
      playVoice(lang).then(() => {
        if (this.finished) { this.voicePlaying = false; return }
        // Shift scheduling timestamps forward by the voice duration so the
        // next beat still fires after a full interval (no beat-storm on resume)
        const paused = performance.now() - this.voiceStartedAt
        this.nextBeatAt += paused
        this.lastBeatTime += paused
        this.windowStart += paused
        this.voicePlaying = false
      })
    },
    stopLoops() {
      if (this.loopRaf) cancelAnimationFrame(this.loopRaf)
      this.loopRaf = null
      if (this.countdownTimer) clearInterval(this.countdownTimer)
      this.countdownTimer = null
    },
    beatIntervalMs() {
      // Combined beat rate — alternate sides so effective side BPM = levelInfo.bpm / 2
      return 60000 / this.levelInfo.bpm
    },
    // Randomized side selection. Both hands should get roughly equal training,
    // so we cap the same-side streak at 2 (i.e., after two consecutive beats
    // on one side, force a switch).
    pickNextSide(currentSide) {
      if (this.sameSideStreak >= 2) {
        this.sameSideStreak = 1
        return currentSide === 'left' ? 'right' : 'left'
      }
      const pick = Math.random() < 0.5 ? 'left' : 'right'
      if (pick === currentSide) this.sameSideStreak += 1
      else this.sameSideStreak = 1
      return pick
    },
    loop() {
      const step = () => {
        if (!this.running) return
        if (!this.paused && !this.finished && !this.voicePlaying) {
          const now = performance.now()

          // Time to fire a beat?
          if (now >= this.nextBeatAt) {
            // Resolve previous beat if not consumed -> miss
            if (!this.beatConsumed) {
              this.registerMiss(this.expected)
            }
            const side = this.nextBeatSide
            this.expected = side
            this.lastBeatTime = now
            this.lastBeatSide = side
            this.beatConsumed = false
            playTick(side)

            // Schedule next beat with a randomized side. To keep both hands
            // trained fairly, we bias slightly against repeating the same side
            // three times in a row.
            this.nextBeatSide = this.pickNextSide(side)
            this.nextBeatAt = now + this.beatIntervalMs()
          }

          // If beat has expired past tolerance, mark as miss immediately (to give quick feedback)
          if (!this.beatConsumed) {
            const tolMs = this.levelInfo.tolerance * 1000
            if (now - this.lastBeatTime > tolMs) {
              this.registerMiss(this.expected)
              this.beatConsumed = true
              this.expected = null
            }
          }

          // 60s window difficulty adjustment
          if (now - this.windowStart >= 60000) {
            this.evalWindow()
          }
        }
        this.loopRaf = requestAnimationFrame(step)
      }
      this.loopRaf = requestAnimationFrame(step)
    },
    evalWindow() {
      const total = this.windowHits + this.windowMisses
      let changed = false
      if (total > 0) {
        const acc = this.windowHits / total
        if (acc >= 0.9 && this.level < LEVELS.length) {
          this.level++
          changed = true
          this.showLevelToast('up', this.level)
          playLevelUp()
        } else if (acc <= 0.7 && this.level > 1) {
          this.level--
          changed = true
          this.showLevelToast('down', this.level)
          playLevelDown()
        }
        if (this.level > this.maxLevel) this.maxLevel = this.level
      }
      this.windowHits = 0
      this.windowMisses = 0
      this.windowStart = performance.now()
      // On any difficulty change, play the language voice prompt before
      // the game continues (also update beat interval by shifting nextBeatAt).
      if (changed) {
        // Reset current beat so the next beat is scheduled fresh at the new tempo
        this.beatConsumed = true
        this.expected = null
        this.nextBeatSide = Math.random() < 0.5 ? 'left' : 'right'
        this.sameSideStreak = 0
        this.nextBeatAt = performance.now() + this.beatIntervalMs()
        this.runVoicePrompt()
      }
    },
    showLevelToast(dir, lv) {
      this.levelToast = { dir, lv, id: Date.now() }
      clearTimeout(this._toastT)
      this._toastT = setTimeout(() => { this.levelToast = null }, 2400)
    },

    onMetronomeBeat(/* side */) { /* visual feedback handled by our scheduler */ },

    onKey(e) {
      if (this.paused || this.finished || this.voicePlaying) return
      const k = e.key.toLowerCase()
      if (k === 'a') { e.preventDefault(); this.handleTap('left') }
      else if (k === 'l') { e.preventDefault(); this.handleTap('right') }
      else if (k === 'escape') { this.onPause() }
    },
    onTouch(e) {
      // Prevent default handled at element level. This is a catch-all for touch to unlock audio.
      unlockAudio()
    },
    onSide(side) {
      if (this.paused || this.finished || this.voicePlaying) return
      this.handleTap(side)
    },

    handleTap(side) {
      const now = performance.now()

      // If a beat is currently pending and this side matches
      if (this.expected && !this.beatConsumed) {
        const dt = now - this.lastBeatTime
        const tolMs = this.levelInfo.tolerance * 1000
        if (side !== this.expected) {
          // wrong hand
          this.registerMiss(side, 'wrongHand')
          this.beatConsumed = true
          this.expected = null
          return
        }
        if (dt <= tolMs) {
          // Hit!
          this.beatConsumed = true
          this.registerHit(side, dt)
          this.expected = null
          return
        }
      }
      // Otherwise it's an extra tap — mark as miss on that side
      this.registerMiss(side, 'hitMiss')
    },

    registerHit(side, dt) {
      const pts = Math.round(5 * this.levelInfo.coef)
      this.score += pts
      this.stats.total += 1
      this.stats.success += 1
      this.totalRt += dt
      this.stats.avgRt = this.totalRt / this.stats.success
      this.streak += 1
      this.windowHits += 1

      // Perfect if within 40% of tolerance
      const tolMs = this.levelInfo.tolerance * 1000
      const kind = dt <= tolMs * 0.4 ? 'perfect' : 'good'
      this.flash[side] = 'ok'
      this.feedback[side] = { kind, textKey: kind === 'perfect' ? 'hitPerfect' : 'hitGood' }
      if (kind === 'perfect') playPerfect(); else playGood()
      setTimeout(() => { this.flash[side] = null; this.feedback[side] = null }, 550)
    },
    registerMiss(side, textKey = 'hitMiss') {
      this.stats.total += 1
      this.stats.fail += 1
      this.streak = 0
      this.windowMisses += 1
      if (side) {
        this.flash[side] = 'bad'
        this.feedback[side] = { kind: 'miss', textKey }
        setTimeout(() => { this.flash[side] = null; this.feedback[side] = null }, 500)
      }
      playMiss()
    },

    onPause() {
      if (this.finished || this.paused) return
      this.paused = true
      this.pauseStartedAt = performance.now()
    },
    onResume() {
      if (!this.paused) return
      const pausedFor = performance.now() - this.pauseStartedAt
      this.pausedTotalMs += pausedFor
      // Shift beat scheduling forward by pause duration
      this.nextBeatAt += pausedFor
      this.lastBeatTime += pausedFor
      this.windowStart += pausedFor
      this.paused = false
    },
    onEnd() { this.finish() },
    finish() {
      if (this.finished) return
      this.finished = true
      this.running = false
      this.voicePlaying = false
      stopVoice()
      this.stopLoops()
      if (this.level > this.maxLevel) this.maxLevel = this.level

      // Save record
      const rec = {
        id: Date.now(),
        date: Date.now(),
        duration: this.duration,
        maxLevel: this.maxLevel,
        total: this.stats.total,
        success: this.stats.success,
        fail: this.stats.fail,
        avgRt: this.stats.avgRt || 0,
        score: this.score
      }
      saveRecord(rec)
      this.$emit('finish', {
        duration: this.duration,
        level: this.level,
        total: this.stats.total,
        success: this.stats.success,
        fail: this.stats.fail,
        avgRt: this.stats.avgRt || 0,
        score: this.score,
      })
    },
  }
}
</script>

<style scoped>
.game {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: clamp(0.6rem, 1.6vmin, 1.2rem);
  box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
}

/* HUD */
.hud {
  position: relative;
  z-index: 30;
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  gap: clamp(0.6rem, 1.4vmin, 1.2rem);
  align-items: center;
  padding: clamp(0.7rem, 1.6vmin, 1.1rem) clamp(1rem, 2.2vmin, 1.6rem);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}
.hud-cell { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
.hud-right {
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: nowrap;
}
.hud-right .btn {
  padding: 0.55em 1em;
  font-size: clamp(0.85rem, 1.6vmin, 1.15rem);
}
.hud-lbl {
  font-size: clamp(.8rem, 1.5vmin, 1.05rem);
  color: var(--ink-dim);
  letter-spacing: .12em;
  text-transform: uppercase;
  font-weight: 600;
}
.hud-val {
  font-size: clamp(1.35rem, 3vmin, 2.1rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.level-val { display: flex; align-items: center; gap: .6rem; }
.lvl-name { font-size: clamp(1rem, 1.9vmin, 1.35rem); color: var(--ink-mid); font-weight: 500; }
.lvl-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.6em; height: 1.6em; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #2a1a05; font-weight: 800;
  font-size: clamp(1.1rem, 2.2vmin, 1.5rem);
}
.score-val { color: var(--accent); }
.time-val { color: var(--ink); }
.time-val.low { color: var(--bad); animation: pulseWarn 1s ease-in-out infinite; }
@keyframes pulseWarn {
  0%,100% { opacity: 1; }
  50% { opacity: .6; }
}

/* Task hint — capsule pill */
.task-hint-wrap {
  display: flex;
  justify-content: center;
  margin: clamp(0.55rem, 1.5vmin, 1.1rem) 0;
  flex-shrink: 0;
}
.task-hint {
  display: inline-flex;
  align-items: center;
  gap: .7em;
  padding: .55em 1.35em;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255,181,71,.16), rgba(255,138,61,.08));
  border: 1.5px solid rgba(255,181,71,.5);
  color: var(--ink);
  font-size: clamp(0.95rem, 2vmin, 1.4rem);
  font-weight: 600;
  letter-spacing: .04em;
  box-shadow: 0 6px 20px rgba(255,138,61,.18), inset 0 1px 0 rgba(255,255,255,.08);
  backdrop-filter: blur(8px);
  max-width: 96%;
}
.task-dot {
  display: inline-block;
  width: .7em; height: .7em; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent);
  animation: taskBlink 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
.task-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@keyframes taskBlink {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: .35; transform: scale(.7); }
}

/* Field */
.field {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: clamp(0.5rem, 1.5vmin, 1.2rem);
  min-height: 0;
  overflow: hidden;
}
.side-col {
  position: relative;
  border-radius: var(--r-xl);
  padding: clamp(0.5rem, 1.4vmin, 1rem);
  background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all .2s ease;
  cursor: pointer;
  overflow: hidden;
  min-height: 0;
}
.side-col.left  { --sc: var(--left);  }
.side-col.right { --sc: var(--right); }
.side-col.expect {
  border-color: var(--sc);
  box-shadow: 0 0 0 4px rgba(255,255,255,.03), 0 0 48px color-mix(in srgb, var(--sc) 60%, transparent);
  background:
    radial-gradient(60% 100% at 50% 100%, color-mix(in srgb, var(--sc) 20%, transparent), transparent),
    linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01));
}
.side-col.flash-ok {
  border-color: var(--good);
  animation: flashOk .4s ease-out;
}
.side-col.flash-bad {
  border-color: var(--bad);
  animation: flashBad .4s ease-out;
}
@keyframes flashOk {
  0% { box-shadow: 0 0 0 0 rgba(102, 209, 158, .6); }
  100% { box-shadow: 0 0 0 40px rgba(102, 209, 158, 0); }
}
@keyframes flashBad {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, .6); }
  100% { box-shadow: 0 0 0 40px rgba(255, 107, 107, 0); }
}
.mn-holder {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  max-width: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.side-fb {
  position: absolute;
  top: 12%;
  left: 0; right: 0;
  display: flex; justify-content: center;
  pointer-events: none;
}
.fb {
  padding: .4em 1.1em;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: .08em;
  animation: fbPop .5s ease-out;
}
.fb-perfect { background: linear-gradient(135deg, #ffe28a, var(--accent)); color: #2a1a05; }
.fb-good    { background: rgba(102,209,158,.9); color: #05271a; }
.fb-miss    { background: rgba(255,107,107,.9); color: #2a0505; }
@keyframes fbPop {
  0% { transform: translateY(20px) scale(.7); opacity: 0; }
  30% { transform: translateY(-4px) scale(1.1); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* Divider */
.divider {
  width: clamp(2px, .5vmin, 4px);
  height: 60%;
  align-self: center;
  background: linear-gradient(180deg, transparent, var(--border-strong), transparent);
  position: relative;
}
.streak {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  text-align: center;
  padding: .5em .9em;
  background: rgba(0,0,0,.55);
  border: 1px solid var(--accent);
  border-radius: 12px;
  min-width: 4em;
  animation: streakPulse .5s ease-out;
}
.streak-num { font-size: 1.6rem; font-weight: 800; color: var(--accent); }
.streak-lbl { font-size: .7rem; color: var(--ink-dim); letter-spacing: .15em; }
@keyframes streakPulse {
  0% { transform: translate(-50%,-50%) scale(1.3); }
  100% { transform: translate(-50%,-50%) scale(1); }
}

/* Pause modal */
.pause-modal {
  text-align: center;
  width: min(92vw, 620px);
  padding: clamp(1.4rem, 3vmin, 2.2rem) clamp(2rem, 4vmin, 3.2rem);
}
.pause-ico { font-size: clamp(2.4rem, 5vmin, 3.6rem); color: var(--accent); }
.pause-modal h2 { font-size: clamp(1.4rem, 2.8vmin, 2rem); margin: .3em 0; }
.pause-modal p { color: var(--ink-mid); margin-bottom: 1.2em; font-size: clamp(.95rem, 1.9vmin, 1.3rem); }
.pause-actions { justify-content: center; gap: 1rem; }
.pause-actions .btn { padding: .8em 1.6em; font-size: clamp(1rem, 2vmin, 1.35rem); }

/* Result modal */
.result-modal {
  text-align: center;
  width: min(94vw, 640px);
  max-height: 92vh;
  padding: clamp(1rem, 2.4vmin, 1.8rem) clamp(1.2rem, 2.6vmin, 2rem);
  display: flex;
  flex-direction: column;
  gap: clamp(.4rem, 1vmin, .8rem);
}
.result-ico { font-size: clamp(1.8rem, 3.2vmin, 2.4rem); }
.result-modal h2 {
  font-size: clamp(1.2rem, 2.4vmin, 1.6rem); font-weight: 700; margin: .1em 0;
  color: var(--ink-mid); letter-spacing: .1em;
}
.result-score {
  font-size: clamp(2.6rem, 6.5vmin, 4.4rem);
  font-weight: 900;
  background: linear-gradient(180deg, #fff, var(--accent));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.result-score-lbl {
  color: var(--ink-dim);
  letter-spacing: .12em;
  font-size: clamp(.9rem, 1.7vmin, 1.15rem);
  margin-bottom: .6rem;
}
.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .6rem;
  margin-bottom: .8rem;
}
.rg-cell {
  padding: clamp(.5rem, 1.2vmin, .8rem) .3rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}
.rg-num {
  font-size: clamp(1.15rem, 2.4vmin, 1.55rem); font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.rg-num.ok { color: var(--good); }
.rg-num.bad { color: var(--bad); }
.rg-num .unit { font-size: .7em; color: var(--ink-dim); font-weight: 500; margin-left: .15em; }
.rg-lbl {
  font-size: clamp(.75rem, 1.5vmin, 1rem);
  color: var(--ink-dim); letter-spacing: .05em; margin-top: .2em;
}
.result-actions { justify-content: center; gap: 1rem; }
.result-actions .btn { padding: .8em 1.6em; font-size: clamp(1rem, 2vmin, 1.35rem); }

/* Voice prompt veil */
.voice-veil {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 10, 26, 0.55);
  backdrop-filter: blur(6px);
  z-index: 20;
  pointer-events: none; /* allow pause / A / L to still work above the veil */
}
.voice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: clamp(1.4rem, 3vmin, 2.4rem) clamp(2rem, 4vmin, 3rem);
  background: rgba(20, 28, 60, 0.85);
  border: 2px solid var(--accent);
  border-radius: var(--r-lg);
  box-shadow: 0 20px 60px rgba(0,0,0,.4), 0 0 40px rgba(255,181,71,.25);
}
.voice-wave {
  display: flex;
  gap: .35rem;
  align-items: flex-end;
  height: clamp(40px, 6vmin, 64px);
}
.voice-wave span {
  display: inline-block;
  width: clamp(6px, 1vmin, 10px);
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  border-radius: 4px;
  animation: voiceBar 1s ease-in-out infinite;
}
.voice-wave span:nth-child(1) { animation-delay: 0s;    height: 40%; }
.voice-wave span:nth-child(2) { animation-delay: .15s;  height: 70%; }
.voice-wave span:nth-child(3) { animation-delay: .3s;   height: 100%; }
.voice-wave span:nth-child(4) { animation-delay: .45s;  height: 70%; }
.voice-wave span:nth-child(5) { animation-delay: .6s;   height: 40%; }
@keyframes voiceBar {
  0%,100% { transform: scaleY(.4); }
  50%     { transform: scaleY(1); }
}
.voice-text {
  color: var(--ink);
  font-size: clamp(1.1rem, 2.2vmin, 1.55rem);
  font-weight: 600;
  letter-spacing: .05em;
}

/* Level toast */
.lv-toast {
  position: absolute;
  top: 22%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: .9rem;
  padding: 1em 1.5em;
  border-radius: var(--r-lg);
  background: rgba(0,0,0,.75);
  border: 2px solid;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-soft);
  z-index: 30;
  animation: lvPop .4s cubic-bezier(.2,1.2,.4,1);
  pointer-events: none;
}
.lv-toast.up   { border-color: var(--good); color: var(--good); }
.lv-toast.down { border-color: var(--warn); color: var(--warn); }
.lv-toast-ico { font-size: 1.8rem; font-weight: 900; }
.lv-toast-title { font-size: 1.15rem; font-weight: 800; letter-spacing: .08em; color: var(--ink); }
.lv-toast-sub { font-size: .85rem; color: var(--ink-mid); }
@keyframes lvPop {
  0% { opacity: 0; transform: translate(-50%, -14px) scale(.85); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
}

/* Compact layout on narrow / tablet screens */
@media (max-width: 900px) {
  .hud {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto;
  }
  .hud-right {
    grid-column: 1 / -1;
    justify-content: flex-end;
    flex-direction: row;
  }
  .result-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-height: 720px), (max-width: 1180px) and (orientation: landscape) {
  .game { padding: 0.5rem 0.7rem; }
  .hud { padding: 0.55rem 0.9rem; gap: 0.5rem; }
  .task-hint-wrap { margin: 0.4rem 0; }
  .task-hint { padding: 0.45em 1.1em; font-size: clamp(0.85rem, 1.8vmin, 1.2rem); }
  .hud-val { font-size: clamp(1.15rem, 2.6vmin, 1.7rem); }
}

@media (max-width: 700px) {
  .hud { grid-template-columns: 1fr 1fr; }
  .hud-right { grid-column: span 2; }
  .result-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
