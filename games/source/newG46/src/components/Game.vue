<template>
  <div class="game-page">
    <!-- TOP HUD -->
    <header class="hud">
      <div class="hud-left">
        <div class="hud-card">
          <div class="hud-label">{{ t('gLevel') }}</div>
          <div class="hud-value">
            <span class="lv-badge">{{ level }}</span>
            <div class="stars">
              <span v-for="i in 6" :key="i" class="s" :class="{on: i <= level}">★</span>
            </div>
          </div>
        </div>

        <div class="hud-card">
          <div class="hud-label">{{ t('gScore') }}</div>
          <div class="hud-value score-val">{{ animatedScore }}</div>
        </div>

        <div class="hud-card time" :class="{low: sessionRemain <= 10}">
          <div class="hud-label">{{ t('gTime') }}</div>
          <div class="hud-value mono">{{ fmtTime(sessionRemain) }}</div>
        </div>
      </div>

      <div class="task-center">
        <div class="task-inner">
          <span>{{ t('gTaskPrefix') }}</span>
          <span class="num">{{ puzzle ? puzzle.total : '-' }}</span>
          <span>{{ t('gTaskSuffix') }}</span>
        </div>
        <div class="puzzle-progress">
          <span v-for="i in (puzzle ? puzzle.total : 0)" :key="i"
                class="pp" :class="{on: i <= found.length}">
            <span v-if="i <= found.length">✓</span><span v-else>{{ i }}</span>
          </span>
        </div>
      </div>

      <div class="hud-right">
        <button v-if="showBatchSkip" class="ctrl-btn skip" @click="onBatchSkip">{{ t('gSkipBatch') || t('gSkip') }}</button>
        <button class="ctrl-btn back" @click="onReturn">{{ t('gReturn') }}</button>
      </div>
    </header>

    <div class="round-bar-wrap">
      <div class="round-bar">
        <div class="round-fill" :class="{low: roundPct < 30}" :style="{ width: roundPct + '%' }"/>
      </div>
      <div class="round-text">{{ roundRemain.toFixed(1) }}{{ t('seconds') }}</div>
    </div>

    <main class="field">
      <div class="scene-wrap left" :class="feedbackClass('left')">
        <div class="scene-frame">
          <PuzzleScene v-if="puzzle"
                       :image-url="puzzle.leftUrl"
                       :width="puzzle.width"
                       :height="puzzle.height"
                       side="left"
                       :found-markers="found"
                       :wrong="wrongLeft"
                       :reveal="revealing ? puzzle.diffs.filter(d => !found.find(f => f.id === d.id)) : []"
                       @scene-click="onSceneClick"/>
        </div>
        <div class="frame-tag left-tag">A</div>
      </div>

      <div class="divider">
        <div class="div-line"/>
        <div class="div-line"/>
      </div>

      <div class="scene-wrap right" :class="feedbackClass('right')">
        <div class="scene-frame">
          <PuzzleScene v-if="puzzle"
                       :image-url="puzzle.rightUrl"
                       :width="puzzle.width"
                       :height="puzzle.height"
                       side="right"
                       :found-markers="found"
                       :wrong="wrongRight"
                       :reveal="revealing ? puzzle.diffs.filter(d => !found.find(f => f.id === d.id)) : []"
                       @scene-click="onSceneClick"/>
        </div>
        <div class="frame-tag right-tag">B</div>
      </div>
    </main>

    <transition name="toast">
      <div v-if="toast" class="toast" :class="toast.kind">
        <span>{{ toast.msg }}</span>
      </div>
    </transition>

    <div v-if="paused" class="pause-mask" @click.self="paused=false; resumeSession()">
      <div class="pause-card">
        <div class="pause-title">{{ t('pauseTitle') }}</div>
        <div class="pause-desc">{{ t('pauseDesc') }}</div>
        <div class="pause-acts">
          <button class="pause-btn cancel" @click="paused=false; resumeSession()">{{ t('cancelReturn') }}</button>
          <button class="pause-btn confirm" @click="onConfirmReturn">{{ t('confirmReturn') }}</button>
        </div>
      </div>
    </div>

    <transition name="burst">
      <div v-if="levelChange" class="level-burst" :class="levelChange.dir">
        <div class="burst-inner">
          <div class="burst-text">{{ levelChange.dir === 'up' ? 'LEVEL UP' : 'LEVEL DOWN' }}</div>
          <div class="burst-sub">→ L{{ levelChange.to }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { generatePuzzle } from '../puzzles.js'
import { playFound, unlockAudio, stopAllAudio } from '../audio.js'
import PuzzleScene from './PuzzleScene.vue'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'hyjj'

export default {
  name: 'Game',
  components: { PuzzleScene },
  props: {
    duration: { type: Number, default: 180 },
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      animatedScore: 0,
      puzzle: null,
      found: [],
      wrongLeft: null,
      wrongRight: null,
      sessionRemain: this.duration,
      roundRemain: 15,
      paused: false,
      toast: null,
      revealing: false,
      levelChange: null,
      stats: { totalAttempts: 0, correct: 0, wrong: 0, totalRT: 0, rounds: 0 },
      window: { correct: 0, attempts: 0, elapsed: 0 },
      roundStart: 0,
      lastFoundAt: 0,
    }
  },
  computed: {
    roundPct() {
      if (!this.puzzle) return 100
      return Math.max(0, Math.min(100, (this.roundRemain / this.puzzle.timeLimit) * 100))
    },
  },
  mounted() {
    this.level = getBatchStartDifficultyForGame(GAME_TYPE)
    this._interval = setInterval(this.tick, 100)
    this.newPuzzle()
  },
  beforeDestroy() {
    clearInterval(this._interval)
    clearTimeout(this._promptTimer)
    stopAllAudio()
  },
  methods: {
    t,
    fmtTime(s) {
      s = Math.max(0, Math.ceil(s))
      const m = Math.floor(s / 60), r = s % 60
      return `${m}:${r < 10 ? '0' + r : r}`
    },
    tick() {
      if (this.paused) return
      const dt = 0.1
      this.sessionRemain -= dt
      this.window.elapsed += dt

      if (this.animatedScore < this.score) this.animatedScore = Math.min(this.score, this.animatedScore + Math.ceil((this.score - this.animatedScore) / 6) + 1)

      if (this.window.elapsed >= 60) this.evaluateWindow()

      if (this.sessionRemain <= 0) {
        this.sessionRemain = 0
        this.endSession()
        return
      }
      if (this.revealing || !this.puzzle) return
      this.roundRemain -= dt
      if (this.roundRemain <= 0) {
        this.timeoutRound()
      }
    },
    evaluateWindow() {
      if (this.window.attempts > 0) {
        const rate = this.window.correct / this.window.attempts
        if (rate >= 0.9 && this.level < 6) {
          this.level++
          this.showLevelChange('up', this.level)
        } else if (rate <= 0.7 && this.level > 1) {
          this.level--
          this.showLevelChange('down', this.level)
        }
      }
      this.window = { correct: 0, attempts: 0, elapsed: 0 }
    },
    showLevelChange(dir, to) {
      this.levelChange = { dir, to }
      setTimeout(() => { this.levelChange = null }, 1600)
    },
    async newPuzzle() {
      this.puzzle = null
      this.found = []
      clearTimeout(this._promptTimer)
      const p = await generatePuzzle(this.level)
      this.puzzle = p
      this.roundRemain = p.timeLimit
      this.roundStart = Date.now()
      this.lastFoundAt = this.roundStart
      this.wrongLeft = this.wrongRight = null
      // Announce puzzle diff count 1.5s after the round starts.
      this._promptTimer = setTimeout(() => {
        if (this.puzzle === p && !this.paused && !this.revealing) playFound(p.total)
      }, 1000)
    },
    onSceneClick({ x, y, side }) {
      if (this.paused || this.revealing) return
      unlockAudio()
      // Ignore clicks on spots that are already found — no penalty, no advance.
      if (this.found.find(f => Math.hypot(f.x - x, f.y - y) <= f.r)) return
      const undone = this.puzzle.diffs.filter(d => !this.found.find(f => f.id === d.id))
      const hit = undone.find(d => Math.hypot(d.x - x, d.y - y) <= d.r)
      const now = Date.now()
      const rt = now - this.lastFoundAt
      this.stats.totalAttempts++
      this.window.attempts++
      if (hit) {
        this.stats.correct++
        this.window.correct++
        this.stats.totalRT += rt
        this.lastFoundAt = now
        this.found.push(hit)
        const pts = Math.round(5 * this.puzzle.coef)
        this.score += pts
        this.showToast('good', `+${pts}`)
        if (this.found.length >= this.puzzle.total) {
          this.showToast('perfect', t('perfect'))
          setTimeout(() => this.newPuzzle(), 700)
        }
      } else {
        this.stats.wrong++
        if (side === 'left') { this.wrongLeft = { x, y }; setTimeout(() => this.wrongLeft = null, 500) }
        else { this.wrongRight = { x, y }; setTimeout(() => this.wrongRight = null, 500) }
        this.showToast('bad', t('wrong'))
        // On any wrong click, advance to the next puzzle.
        this.revealing = true
        setTimeout(() => {
          this.revealing = false
          this.stats.rounds++
          this.newPuzzle()
        }, 700)
      }
    },
    timeoutRound() {
      this.revealing = true
      this.showToast('timeup', t('timeup'))
      const missed = this.puzzle.total - this.found.length
      this.stats.wrong += missed
      this.stats.totalAttempts += missed
      this.window.attempts += missed
      setTimeout(() => {
        this.revealing = false
        this.stats.rounds++
        this.newPuzzle()
      }, 1500)
    },
    onSkipRound() {
      // Reserved for skip-current-question logic.
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    onReturn() { this.paused = true; clearTimeout(this._promptTimer); stopAllAudio() },
    resumeSession() {},
    onConfirmReturn() {
      this.paused = false
      stopAllAudio()
      this.$emit('quit')
    },
    endSession(early = false) {
      clearInterval(this._interval)
      const totalTime = this.duration - Math.max(0, this.sessionRemain)
      const total = this.stats.correct + this.stats.wrong
      const accuracy = total > 0 ? this.stats.correct / total : 0
      const avgRT = this.stats.correct > 0 ? Math.round(this.stats.totalRT / this.stats.correct) : 0
      const record = {
        date: Date.now(),
        project: t('project'),
        level: this.level,
        duration: Math.round(totalTime),
        total,
        correct: this.stats.correct,
        wrong: this.stats.wrong,
        accuracy,
        avgRT,
        score: this.score,
      }
      this.$emit('finish', record)
    },
    showToast(kind, msg) {
      this.toast = { kind, msg }
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => this.toast = null, 1200)
    },
    feedbackClass(side) {
      if (side === 'left' && this.wrongLeft) return 'shake'
      if (side === 'right' && this.wrongRight) return 'shake'
      return ''
    },
  },
}
</script>

<style scoped>
.game-page {
  position: absolute; inset: 0; overflow: hidden;
  background: #f6efe0;
  display: flex; flex-direction: column;
  color: #3a2f1f;
  padding: 1em 1.2em;
  gap: 0.8em;
}

.hud {
  display: grid; grid-template-columns: auto 1fr auto;
  gap: 1.2em; align-items: center;
  padding: 0.8em 1.2em;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  border-radius: 0.9em;
}
.hud-left { display: flex; gap: 0.8em; }
.hud-card {
  display: flex; flex-direction: column; gap: 0.25em;
  padding: 0.55em 1em; min-width: 6em;
  background: #f6efe0;
  border: 1px solid #e5d5ad;
  border-radius: 0.6em;
}
.hud-label { font-size: 0.75em; letter-spacing: 0.2em; color: #8a7550; font-weight: 600; text-transform: uppercase; }
.hud-value {
  font-size: 1.6em; font-weight: 700; letter-spacing: 0.03em;
  display: flex; align-items: center; gap: 0.4em;
  color: #4a3a1e;
}
.hud-value.mono { font-variant-numeric: tabular-nums; }
.lv-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.5em; height: 1.5em;
  border-radius: 0.35em;
  background: #c99a4b;
  color: #fff; font-weight: 800;
  font-size: 0.85em;
}
.stars .s { color: #e5d5ad; font-size: 0.55em; margin: 0 0.05em; }
.stars .s.on { color: #c99a4b; }
.score-val { color: #b98738; }
.hud-card.time.low .hud-value { color: #c0392b; }

.task-center { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5em; }
.task-inner {
  display: inline-flex; align-items: center; gap: 0.4em;
  padding: 0.45em 1.3em;
  background: #f6e6c1;
  border: 1px solid #d9c9a3;
  border-radius: 999px;
  color: #6b5a3a;
  font-size: 1em; font-weight: 600; letter-spacing: 0.05em;
  white-space: nowrap;
}
.task-inner .num {
  display: inline-block; padding: 0 0.5em; border-radius: 999px;
  background: #c99a4b; color: #fff;
  font-weight: 800; font-size: 1.1em;
}
.puzzle-progress { display: flex; gap: 0.35em; }
.pp {
  min-width: 1.7em; height: 1.7em;
  border-radius: 0.45em; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9em;
  background: #f6efe0; color: #8a7550;
  border: 1px solid #e5d5ad;
  transition: all .3s;
}
.pp.on { background: #6b8e5a; color: #fff; border-color: #6b8e5a; }

.hud-right { display: flex; gap: 0.6em; }
.ctrl-btn {
  padding: 0.65em 1.3em; border-radius: 0.6em;
  background: #f6efe0; border: 1px solid #d9c9a3;
  color: #6b5a3a; font-weight: 600; letter-spacing: 0.08em; cursor: pointer;
  font-size: 1em;
  transition: all .2s;
}
.ctrl-btn:hover { background: #f0e2be; }
.ctrl-btn.back:hover { background: #e8c8b8; border-color: #c0392b; color: #7a1f10; }

.round-bar-wrap { display: flex; align-items: center; gap: 0.8em; padding: 0 0.2em; }
.round-bar { flex: 1; height: 0.45em; background: #e5d5ad; border-radius: 999px; overflow: hidden; }
.round-fill {
  height: 100%;
  background: linear-gradient(90deg, #6b8e5a, #c99a4b, #c0392b);
  border-radius: 999px;
  transition: width .1s linear;
}
.round-fill.low { animation: barpulse 0.5s ease-in-out infinite; }
@keyframes barpulse { 50% { opacity: 0.55; } }
.round-text { font-size: 0.95em; color: #6b5a3a; font-weight: 600; font-variant-numeric: tabular-nums; min-width: 4.2em; text-align: right; }

.field {
  flex: 1; display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1em; align-items: stretch; min-height: 0;
}
.scene-wrap { position: relative; }
.scene-frame {
  height: 100%; border-radius: 0.9em; overflow: hidden;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  transition: border-color .2s;
}
.frame-tag {
  position: absolute; top: -0.7em; left: 1.2em;
  padding: 0.2em 0.9em;
  background: #c99a4b;
  color: #fff; font-weight: 700; letter-spacing: 0.15em;
  border-radius: 999px; font-size: 1em;
}
.scene-wrap.shake .scene-frame { animation: shake .4s; border-color: #c0392b; }
@keyframes shake { 0%,100% { transform: translateX(0);} 20% { transform: translateX(-6px);} 40% { transform: translateX(6px);} 60% { transform: translateX(-4px);} 80% { transform: translateX(4px);} }

.divider { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.8em; width: 1.5em; }
.div-line { flex: 1; width: 1px; background: #d9c9a3; }

.toast {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  z-index: 30;
  padding: 0.85em 2em; border-radius: 0.8em;
  font-size: 1.8em; font-weight: 700; letter-spacing: 0.15em;
  background: #fff8e8; border: 1px solid #d9c9a3;
  box-shadow: 0 0.6em 2em rgba(74,58,30,.15);
}
.toast.good { color: #6b8e5a; border-color: #6b8e5a; }
.toast.bad  { color: #c0392b; border-color: #c0392b; }
.toast.perfect { color: #b98738; border-color: #c99a4b; }
.toast.timeup { color: #8a7550; }
.toast-enter-active, .toast-leave-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translate(-50%,-50%) scale(0.7); }

.pause-mask {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(74,58,30,0.35); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.pause-card {
  width: min(28em, 88vw); padding: 2.2em 2em; text-align: center;
  background: #fff8e8;
  border: 1px solid #d9c9a3; border-radius: 1.2em;
  box-shadow: 0 1em 3em rgba(74,58,30,.2);
}
.pause-title { font-size: 1.6em; font-weight: 700; letter-spacing: 0.12em; color: #4a3a1e; margin-bottom: 0.5em; }
.pause-desc { color: #6b5a3a; font-size: 1.02em; line-height: 1.6; margin-bottom: 1.6em; }
.pause-acts { display: flex; gap: 1em; justify-content: center; }
.pause-btn { padding: 0.75em 1.6em; border-radius: 999px; font-weight: 600; letter-spacing: 0.08em; cursor: pointer; font-size: 1.05em; border: 1px solid transparent; }
.pause-btn.cancel { background: #f6efe0; color: #6b5a3a; border-color: #d9c9a3; }
.pause-btn.confirm { background: #c0392b; color: #fff; }

.level-burst {
  position: absolute; inset: 0; z-index: 40;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.burst-inner {
  padding: 1.4em 2.6em; text-align: center;
  background: #fff8e8;
  border-radius: 1em; border: 1px solid #c99a4b;
  box-shadow: 0 0.6em 2em rgba(74,58,30,.15);
}
.burst-text { font-size: 1.6em; font-weight: 800; letter-spacing: 0.3em; color: #4a3a1e; }
.level-burst.up .burst-text { color: #6b8e5a; }
.level-burst.down .burst-text { color: #c0392b; }
.burst-sub { margin-top: 0.3em; font-size: 1.15em; color: #6b5a3a; font-weight: 600; }
.burst-enter-active { transition: all .5s cubic-bezier(.34,1.56,.64,1); }
.burst-leave-active { transition: all .3s; }
.burst-enter { opacity: 0; transform: scale(.5); }
.burst-leave-to { opacity: 0; transform: scale(1.15); }
</style>
