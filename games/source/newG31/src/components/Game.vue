<template>
  <div class="game">
    <!-- HUD -->
    <div class="hud">
      <div class="stats">
        <div class="stat">
          <span class="label">{{ t('difficulty') }}</span>
          <span class="value diff">Lv.{{ level }}</span>
        </div>
        <div class="stat">
          <span class="label">{{ t('score') }}</span>
          <span class="value score">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="label">{{ t('timeLeft') }}</span>
          <span class="value time" :class="{ warning: totalRemain <= 10 }">
            {{ formatTime(totalRemain) }}
          </span>
        </div>
      </div>
      <div class="hud-actions">
        <button v-if="showBatchSkip" class="back-btn" type="button" @click="$emit('batch-skip')">
          <span>⏭</span> {{ t('skipGame') || '跳过' }}
        </button>
        <button class="back-btn" type="button" @click="pause">
          <span>⏸</span> {{ t('back') }}
        </button>
      </div>
    </div>

    <!-- Prompt -->
    <div class="prompt">
      <div class="round-tag">{{ t('round', { n: round }) }}</div>
      <div class="phase-text">
        <span v-if="phase === 'listen'">🎼 {{ t('listen') }}</span>
        <span v-else-if="phase === 'replay'">🎹 {{ t('replay') }}</span>
        <span v-else-if="phase === 'correct'" class="correct-msg">✓ {{ t('correct') }} +{{ lastScore }}</span>
        <span v-else-if="phase === 'wrong'" class="wrong-msg">✗ {{ t('wrong') }}</span>
      </div>
      <div class="round-timer" v-if="phase === 'replay'">
        <div class="bar">
          <div class="fill" :style="{ width: (roundRemain / roundLimit * 100) + '%' }"></div>
        </div>
        <span>{{ roundRemain.toFixed(1) }}s</span>
      </div>
    </div>

    <!-- Stage: bottles + conductor -->
    <div class="stage">
      <div class="conductor-track" :style="conductorStyle">
        <Conductor :tapping="conductorTapping"/>
      </div>

      <div class="bottles" ref="bottlesRow">
        <div v-for="(b, i) in bottles" :key="b.id" class="bottle-slot" ref="slots">
          <Bottle
            :note="b.note"
            :color="colorFor(b.note)"
            :water-level="b.waterLevel"
            :active="activeIdx === i"
            :disabled="phase !== 'replay'"
            @tap="onTap(i)"
          />
        </div>
      </div>

      <!-- User sequence progress -->
      <div class="seq-progress" v-if="phase === 'replay' || phase === 'listen'">
        <div v-for="(s, i) in sequence" :key="i" class="seq-dot"
             :class="{
               filled: userProgress > i,
               current: userProgress === i && phase === 'replay',
               listen: phase === 'listen' && listenIdx === i
             }">
          {{ userProgress > i ? '♪' : (i + 1) }}
        </div>
      </div>
    </div>

    <!-- Pause modal -->
    <div v-if="paused" class="pause-mask" @click.self="resume">
      <div class="pause-modal">
        <h3>{{ t('paused') }}</h3>
        <p>{{ t('confirmQuit') }}</p>
        <div class="pause-actions">
          <button class="btn primary" @click="resume">{{ t('resume') }}</button>
          <button class="btn danger" @click="$emit('quit')">{{ t('quit') }}</button>
        </div>
      </div>
    </div>

    <!-- Feedback flash -->
    <div v-if="flash" class="flash" :class="flash"></div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import Bottle from './Bottle.vue'
import Conductor from './Conductor.vue'
import { NOTE_COLORS, playNote, playCorrect, playWrong, playVoice, stopVoice } from '../audio.js'
import { LEVELS, baseScoreFor, buildBottles, buildSequence } from '../game.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'yjfzj'

export default {
  name: 'Game',
  components: { Bottle, Conductor },
  props: {
    lang: String,
    durationMin: Number,
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      round: 0,
      score: 0,
      bottles: [],
      sequence: [],
      userProgress: 0,
      activeIdx: -1,
      listenIdx: -1,
      conductorTargetX: 0,
      conductorTapping: false,
      phase: 'idle', // 'listen' | 'replay' | 'correct' | 'wrong' | 'idle'
      lastScore: 0,
      flash: null,
      // Timers
      totalRemain: 0,
      roundRemain: 0,
      roundLimit: 15,
      // Interval refs
      tickId: null,
      roundTickId: null,
      timers: [],
      // Round stats
      roundStartTs: 0,
      currentInterval: {
        success: 0, fail: 0, startMs: 0
      },
      // Session stats
      stats: {
        total: 0, success: 0, fail: 0,
        totalScore: 0, rts: [], maxLevel: 1
      },
      paused: false,
      pauseState: null
    }
  },
  computed: {
    conductorStyle() {
      return {
        transform: `translateX(${this.conductorTargetX}px)`,
        transition: 'transform 0.45s cubic-bezier(.68,-0.2,.27,1.2)'
      }
    }
  },
  mounted() {
    this.level = getBatchStartDifficultyForGame(GAME_TYPE)
    this.totalRemain = this.durationMin * 60
    this.currentInterval.startMs = performance.now()
    this.startTotalTimer()
    this.nextRound()
  },
  beforeDestroy() {
    this._destroyed = true
    stopVoice()
    this.clearAll()
  },
  methods: {
    t(k, v) { return t(this.lang, k, v) },
    colorFor(n) { return NOTE_COLORS[n] },
    formatTime(s) {
      const m = Math.floor(s / 60), sec = Math.floor(s % 60)
      return `${m}:${String(sec).padStart(2,'0')}`
    },
    clearAll() {
      if (this.tickId) clearInterval(this.tickId)
      if (this.roundTickId) clearInterval(this.roundTickId)
      this.timers.forEach(clearTimeout)
      this.timers = []
    },
    schedule(fn, ms) {
      // Wrap so that if we're paused when the timer fires, we defer execution
      // until resume — this pauses the whole listen/replay sequence, not just the clock.
      const wrapped = () => {
        if (this.paused) {
          const wait = () => {
            if (this.paused) { const id = setTimeout(wait, 100); this.timers.push(id) }
            else fn()
          }
          wait()
        } else {
          fn()
        }
      }
      const id = setTimeout(wrapped, ms)
      this.timers.push(id)
      return id
    },

    startTotalTimer() {
      this.tickId = setInterval(() => {
        if (this.paused) return
        this.totalRemain -= 1
        // Every 60s adaptive-difficulty check
        const elapsed = this.durationMin * 60 - this.totalRemain
        if (elapsed > 0 && elapsed % 60 === 0) {
          this.evaluateDifficulty()
        }
        if (this.totalRemain <= 0) {
          this.totalRemain = 0
          this.endGame()
        }
      }, 1000)
    },

    evaluateDifficulty() {
      const { success, fail } = this.currentInterval
      const total = success + fail
      if (total > 0) {
        const rate = success / total
        if (rate >= 0.9 && this.level < 6) this.level++
        else if (rate < 0.7 && this.level > 1) this.level--
      }
      this.currentInterval = { success: 0, fail: 0, startMs: performance.now() }
    },

    nextRound() {
      if (this.totalRemain <= 0) return
      this.round++
      const cfg = LEVELS[this.level]
      this.roundLimit = cfg.timeLimit
      this.bottles = buildBottles(this.level)
      this.sequence = buildSequence(this.level, this.bottles)
      this.userProgress = 0
      this.phase = 'intro'
      this.stats.maxLevel = Math.max(this.stats.maxLevel, this.level)

      // Voice prompt #1 (e.g. "Listen to the melody"), then play the conductor's sequence.
      this.waitIfPaused().then(() => playVoice(this.lang, 1)).then(() => {
        if (this._destroyed || this.totalRemain <= 0) return
        this.schedule(() => this.playSequence(), 200)
      })
    },

    // Returns a promise that resolves as soon as the game is not paused.
    waitIfPaused() {
      return new Promise(resolve => {
        const check = () => {
          if (!this.paused) resolve()
          else setTimeout(check, 120)
        }
        check()
      })
    },

    getBottleX(idx) {
      // Compute the offset of each bottle relative to the row center in px.
      const slots = this.$refs.slots
      if (!slots || !slots[idx]) return 0
      const row = this.$refs.bottlesRow
      const rowRect = row.getBoundingClientRect()
      const slotRect = slots[idx].getBoundingClientRect()
      const rowCenter = rowRect.left + rowRect.width / 2
      const slotCenter = slotRect.left + slotRect.width / 2
      // Divide by current scale (from root style)? App-level scaling handled by transform; local px still consistent.
      return slotCenter - rowCenter
    },

    playSequence() {
      this.phase = 'listen'
      this.listenIdx = -1
      const step = 900
      this.sequence.forEach((note, i) => {
        this.schedule(() => {
          const bottleIdx = this.bottles.findIndex(b => b.id === note.id)
          this.conductorTargetX = this.getBottleX(bottleIdx)
          this.listenIdx = i
          this.schedule(() => {
            this.conductorTapping = true
            this.activeIdx = bottleIdx
            playNote(note.note, 0.8, 0, 0.5)
            this.schedule(() => {
              this.conductorTapping = false
              this.activeIdx = -1
            }, 480)
          }, 380)
        }, i * step)
      })
      this.schedule(() => {
        this.listenIdx = -1
        this.phase = 'prompt'
        // Voice prompt #2 (e.g. "Now replay the melody"), then start the replay timer.
        this.waitIfPaused().then(() => playVoice(this.lang, 2)).then(() => {
          if (this._destroyed || this.totalRemain <= 0) return
          this.startReplay()
        })
      }, this.sequence.length * step + 400)
    },

    startReplay() {
      this.phase = 'replay'
      this.userProgress = 0
      this.roundRemain = this.roundLimit
      this.roundStartTs = performance.now()
      if (this.roundTickId) clearInterval(this.roundTickId)
      this.roundTickId = setInterval(() => {
        if (this.paused) return
        this.roundRemain -= 0.1
        if (this.roundRemain <= 0) {
          this.roundRemain = 0
          clearInterval(this.roundTickId)
          this.fail()
        }
      }, 100)
    },

    onTap(bottleIdx) {
      if (this.phase !== 'replay') return
      const expected = this.sequence[this.userProgress]
      const chosen = this.bottles[bottleIdx]
      this.activeIdx = bottleIdx
      playNote(chosen.note, 0.7, 0, 0.5)
      this.schedule(() => { if (this.activeIdx === bottleIdx) this.activeIdx = -1 }, 500)
      const correct = chosen.id === expected.id
      if (correct) {
        this.userProgress++
        if (this.userProgress >= this.sequence.length) {
          // Let the bottle note ring out before the "correct" fanfare plays
          clearInterval(this.roundTickId)
          this.phase = 'settling'
          this.schedule(() => this.succeed(), 550)
        }
      } else {
        // Same for wrong: play the tapped note first, then the error sound
        clearInterval(this.roundTickId)
        this.phase = 'settling'
        this.schedule(() => this.fail(), 550)
      }
    },

    succeed() {
      clearInterval(this.roundTickId)
      const rt = (performance.now() - this.roundStartTs) / 1000
      const gained = baseScoreFor(this.level)
      this.lastScore = gained
      this.score += gained
      this.stats.total++
      this.stats.success++
      this.stats.totalScore += gained
      this.stats.rts.push(rt)
      this.currentInterval.success++
      this.phase = 'correct'
      this.flash = 'ok'
      playCorrect()
      this.schedule(() => { this.flash = null }, 500)
      this.schedule(() => this.nextRound(), 1600)
    },

    fail() {
      clearInterval(this.roundTickId)
      const rt = (performance.now() - this.roundStartTs) / 1000
      this.stats.total++
      this.stats.fail++
      this.stats.rts.push(rt)
      this.currentInterval.fail++
      this.phase = 'wrong'
      this.flash = 'bad'
      playWrong()
      this.schedule(() => { this.flash = null }, 500)
      this.schedule(() => this.nextRound(), 1600)
    },

    pause() {
      this.paused = true
      // Freeze round timer
      this.pauseState = { roundRemain: this.roundRemain }
    },
    resume() {
      this.paused = false
    },
    quit() {
      this.paused = false
      this.endGame()
    },

    endGame() {
      this.clearAll()
      const s = this.stats
      const rate = s.total ? Math.round(s.success / s.total * 100) : 0
      const avgRt = s.rts.length ? (s.rts.reduce((a,b) => a+b, 0) / s.rts.length) : 0
      const finalScore = Math.round(s.totalScore * 10) / 10
      this.$emit('end', {
        ts: Date.now(),
        duration: this.durationMin,
        level: this.level,
        total: s.total,
        success: s.success,
        fail: s.fail,
        rate,
        avgRt,
        score: finalScore,
        maxLevel: s.maxLevel
      })
    },
  }
}
</script>

<style scoped>
.game {
  position: relative;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  padding: 24px 36px;
}
.hud {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
  gap: 16px;
}
.hud-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: auto;
}
.stats { display: flex; gap: 22px; }
.stat {
  background: rgba(255,255,255,0.9);
  padding: 12px 22px;
  border-radius: 14px;
  display: flex; flex-direction: column;
  align-items: center;
  min-width: 100px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}
.label { font-size: 12px; color: #868e96; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
.value { font-size: 26px; font-weight: 800; color: #2b3f6a; }
.value.diff { color: #7048e8; }
.value.score { color: #ef476f; }
.value.time { color: #339af0; font-variant-numeric: tabular-nums; }
.value.time.warning { color: #e03131; animation: pulse 1s infinite; }
@keyframes pulse { 50% { transform: scale(1.1); } }

.back-btn {
  background: rgba(255,255,255,0.9);
  border: none; border-radius: 14px;
  padding: 14px 22px; cursor: pointer;
  font-size: 16px; font-weight: 700; color: #495057;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  display: flex; align-items: center; gap: 8px;
}
.back-btn:hover { transform: translateY(-2px); }

.prompt {
  text-align: center; color: #fff;
  margin-bottom: 10px;
}
.round-tag {
  display: inline-block;
  background: rgba(0,0,0,0.25);
  padding: 4px 14px; border-radius: 20px;
  font-size: 13px; margin-bottom: 6px;
  letter-spacing: 1px;
}
.phase-text {
  font-size: 22px;
  font-weight: 700;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
.correct-msg { color: #b2f2bb; }
.wrong-msg { color: #ffc9c9; }
.round-timer {
  margin-top: 10px;
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
.bar {
  width: 260px; height: 10px;
  background: rgba(255,255,255,0.3);
  border-radius: 6px; overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #b2f2bb, #ffd166, #ff6b6b);
  transition: width 0.1s linear;
}

.stage {
  flex: 1;
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px;
}
.conductor-track {
  position: relative;
  height: 160px;
}
.bottles {
  display: flex; gap: 40px; align-items: flex-end;
  justify-content: center;
}
.bottle-slot { display: flex; }

.seq-progress {
  display: flex; gap: 12px;
  margin-top: 12px;
}
.seq-dot {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.6);
  color: rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  backdrop-filter: blur(4px);
}
.seq-dot.filled { background: #37b24d; border-color: #b2f2bb; }
.seq-dot.current { border-color: #ffd166; box-shadow: 0 0 20px rgba(255,209,102,0.7); animation: pulse 0.9s infinite; }
.seq-dot.listen { background: #ffd166; color: #2b3f6a; border-color: #fff; transform: scale(1.15); }

.pause-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,20,0.6);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.pause-modal {
  background: #fff;
  border-radius: 20px;
  padding: 40px 50px;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
}
.pause-modal h3 { color: #2b3f6a; font-size: 28px; margin-bottom: 12px; }
.pause-modal p { color: #666; margin-bottom: 22px; }
.pause-actions { display: flex; gap: 14px; justify-content: center; }
.pause-actions .btn {
  padding: 14px 30px; border-radius: 12px; border: none;
  cursor: pointer; font-size: 16px; font-weight: 700; color: #fff;
}
.pause-actions .btn.primary { background: linear-gradient(135deg, #4dabf7, #339af0); }
.pause-actions .btn.danger { background: linear-gradient(135deg, #ff6b6b, #ef476f); }
.pause-actions .btn:hover { transform: translateY(-2px); }

.flash {
  position: fixed; inset: 0;
  pointer-events: none;
  animation: flash 0.5s;
}
.flash.ok { background: radial-gradient(circle, rgba(55,178,77,0.4), transparent 70%); }
.flash.bad { background: radial-gradient(circle, rgba(224,49,49,0.4), transparent 70%); }
@keyframes flash { from { opacity: 1; } to { opacity: 0; } }
</style>
