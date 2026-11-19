<template>
  <div class="stage game">
    <!-- Top HUD -->
    <div class="hud">
      <div class="hud-side">
        <div class="stat">
          <div class="k">{{ t('difficulty') }}</div>
          <div class="v"><span class="rn">{{ roman[level-1] }}</span><span class="coef">×{{ diff.coef }}</span></div>
        </div>
        <div class="sep"></div>
        <div class="stat">
          <div class="k">{{ t('score') }}</div>
          <div class="v accent">{{ Math.round(score) }}</div>
        </div>
        <div class="sep"></div>
        <div class="stat">
          <div class="k">{{ t('timeLeft') }}</div>
          <div class="v" :class="{warn: sessionLeft <= 10}">{{ formatTime(sessionLeft) }}</div>
        </div>
      </div>

      <div class="hud-side">
        <button v-if="showBatchSkip" class="top-btn" @click="onBatchSkip">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
          <span>{{ t('skipBatchGame') }}</span>
        </button>
        <button class="top-btn" @click="pause">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span>{{ t('back') }}</span>
        </button>
      </div>
    </div>

    <!-- Phase progress -->
    <div class="phase-bar">
      <span class="ps" :class="{active: phase==='memorize', done: phaseDone.memorize}">
        <em>01</em>{{ t('memorizeTitle') }}
      </span>
      <span class="p-line"></span>
      <span class="ps" :class="{active: phase==='interference', done: phaseDone.interference, muted: diff.distTime===0}">
        <em>02</em>{{ t('interferenceTitle') }}
      </span>
      <span class="p-line"></span>
      <span class="ps" :class="{active: phase==='question'}">
        <em>03</em>{{ t('questionTitle') }}
      </span>
    </div>

    <!-- Content -->
    <div class="content">
      <transition name="fade" mode="out-in">
        <!-- Memorize -->
        <section v-if="phase === 'memorize'" key="mem" class="panel">
          <div class="panel-head">
            <div class="eyebrow">{{ t('memorizeTitle') }}</div>
            <div class="cd-ring">
              <svg viewBox="0 0 40 40" width="100%" height="100%">
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--line)" stroke-width="2"/>
                <circle cx="20" cy="20" r="17" fill="none"
                        stroke="var(--accent)" stroke-width="2" stroke-linecap="round"
                        :stroke-dasharray="107"
                        :stroke-dashoffset="107 * (1 - phaseRatio)"
                        transform="rotate(-90 20 20)"/>
              </svg>
              <span>{{ phaseLeft }}</span>
            </div>
          </div>
          <ProfileCard :profile="profile" :fields="visibleFields" :size="cardSize" />
        </section>

        <!-- Interference -->
        <section v-else-if="phase === 'interference'" key="int" class="panel">
          <div class="panel-head">
            <div class="eyebrow">{{ t('interferenceTitle') }}</div>
            <div class="cd-ring">
              <svg viewBox="0 0 40 40" width="100%" height="100%">
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--line)" stroke-width="2"/>
                <circle cx="20" cy="20" r="17" fill="none"
                        stroke="var(--warn)" stroke-width="2" stroke-linecap="round"
                        :stroke-dasharray="107"
                        :stroke-dashoffset="107 * (1 - phaseRatio)"
                        transform="rotate(-90 20 20)"/>
              </svg>
              <span>{{ phaseLeft }}</span>
            </div>
          </div>

          <div class="dist">
            <div class="dist-eq">
              <span class="d-num">{{ currentSub }}</span>
              <span class="d-op">−</span>
              <span class="d-num">3</span>
              <span class="d-op">=</span>
              <span class="d-num q">?</span>
            </div>
            <div class="dist-keys">
              <button v-for="(opt, i) in distOpts" :key="i"
                      class="d-key"
                      :class="{ ok: distFeedback === 'ok' && opt === currentSub - 3,
                                bad: distFeedback === 'bad' && opt === distPicked }"
                      :disabled="distFeedback !== null"
                      @click="answerDist(opt)">{{ opt }}</button>
            </div>
            <div class="dist-hint">{{ t('interferenceHint') }} · {{ distSteps.length }}</div>
          </div>
        </section>

        <!-- Question -->
        <section v-else key="q" class="panel">
          <div class="panel-head">
            <div class="eyebrow">{{ t('questionTitle') }}</div>
            <div class="cd-ring">
              <svg viewBox="0 0 40 40" width="100%" height="100%">
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--line)" stroke-width="2"/>
                <circle cx="20" cy="20" r="17" fill="none"
                        stroke="var(--ok)" stroke-width="2" stroke-linecap="round"
                        :stroke-dasharray="107"
                        :stroke-dashoffset="107 * (1 - phaseRatio)"
                        transform="rotate(-90 20 20)"/>
              </svg>
              <span>{{ phaseLeft }}</span>
            </div>
          </div>

          <div class="q-block">
            <div class="q-title">{{ questionText }}</div>
            <div class="q-opts">
              <button v-for="(opt, i) in qOpts" :key="i"
                      class="q-opt"
                      :class="{ ok: qFeedback && i === qCorrectIndex,
                                bad: qFeedback === 'bad' && i === qPicked && i !== qCorrectIndex,
                                dim: qFeedback && i !== qCorrectIndex && i !== qPicked }"
                      :disabled="qFeedback !== null"
                      @click="answerQ(i)">
                <span class="q-idx">{{ 'ABCD'[i] }}</span>
                <span class="q-txt">{{ opt }}</span>
              </button>
            </div>
          </div>
        </section>
      </transition>

      <transition name="fade">
        <div v-if="toast" class="toast" :class="toast.kind">
          <span>{{ toast.text }}</span>
          <span v-if="toast.gain" class="gain">+{{ toast.gain }}</span>
        </div>
      </transition>
    </div>

    <!-- Pause -->
    <div v-if="paused" class="modal-mask">
      <div class="modal" style="width: min(70vw, calc(var(--u) * 42)); text-align: center;">
        <div class="modal-title" style="text-align:center; margin-bottom: calc(var(--u) * 1);">{{ t('pausedTitle') }}</div>
        <p style="color: var(--ink-3); margin: 0 0 calc(var(--u) * 2.4); font-size: calc(var(--u) * 1.25);">{{ t('pausedDesc') }}</p>
        <div class="row gap-1" style="justify-content: center;">
          <button class="btn btn-ghost btn-lg" @click="onConfirmQuit">{{ t('quit') }}</button>
          <button class="btn btn-primary btn-lg" @click="resume">{{ t('resume') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t, i18n } from '../i18n.js'
import { DIFFICULTIES, ANSWER_TIME_LIMIT, BASE_POINT, UPGRADE_STREAK, DOWNGRADE_STREAK } from '../data/config.js'
import { generateProfile, POOLS } from '../data/characters.js'
import { playCue, stopCue } from '../utils/voice.js'
import ProfileCard from '../components/ProfileCard.vue'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'rwda'

function pickFields(count) {
  const extras = ['age','gender','job','hobby','city','company','education']
  const shuffled = extras.slice().sort(() => Math.random() - 0.5)
  return ['name', ...shuffled.slice(0, count - 1)]
}

export default {
  name: 'Game',
  components: { ProfileCard },
  props: {
    duration: { type: Number, required: true },
    showBatchSkip: { type: Boolean, default: false },
  },
  data() {
    return {
      level: getBatchStartDifficultyForGame(GAME_TYPE), score: 0, correctStreak: 0, wrongStreak: 0,
      total: 0, correct: 0, wrong: 0, reactSum: 0,
      sessionLeft: this.duration * 60, sessionTimer: null,
      profile: null, fieldsShown: [],
      phase: 'memorize', phaseDone: { memorize: false, interference: false },

      // Countdown state.
      // We drive a smooth `phaseRatio` (0..1) via requestAnimationFrame,
      // while `phaseLeft` (integer seconds) is derived for text display.
      phaseTotal: 0,     // total seconds for the phase
      phaseStart: 0,     // performance.now() when phase started
      phasePausedAt: 0,  // performance.now() when paused (for adjustment)
      phaseElapsed: 0,   // accumulated elapsed ms
      phaseLeft: 0,      // integer seconds remaining (for text)
      phaseRatio: 1,     // 1 → full, 0 → done  (drives the SVG ring smoothly)
      rafId: null,
      phaseOnEnd: null,

      currentSub: 30, distSteps: [], distOpts: [], distPicked: null, distFeedback: null,
      questionField: null, questionText: '', qOpts: [], qCorrectIndex: 0,
      qPicked: null, qFeedback: null, qStartAt: 0,
      toast: null, toastTimer: null, paused: false,
      roman: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ'],
      cardSize: 'min(50vh, calc(var(--u) * 42))'
    }
  },
  computed: {
    lang() { return i18n.lang },
    diff() { return DIFFICULTIES[this.level - 1] },
    visibleFields() {
      return this.fieldsShown.filter(k => k !== 'name').map(k => this.buildDisplay(k))
    }
  },
  mounted() {
    this.level = getBatchStartDifficultyForGame(GAME_TYPE)
    this.startSessionTimer()
    this.newRound()
  },
  beforeDestroy() {
    this.clearAllTimers()
    stopCue()
  },
  methods: {
    t,

    // ---------- session ----------
    startSessionTimer() {
      this.sessionTimer = setInterval(() => {
        if (this.paused) return
        this.sessionLeft--
        if (this.sessionLeft <= 0) this.endSession()
      }, 1000)
    },
    endSession() {
      this.clearAllTimers()
      stopCue()
      const avgReact = this.correct > 0 ? this.reactSum / this.correct : 0
      this.$emit('finish', {
        level: this.level,
        duration: this.duration * 60,
        total: this.total, correct: this.correct, wrong: this.wrong,
        score: this.score, avgReact
      })
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    onSkipClick() {
      // Reserved for skip-current-question logic.
    },
    clearAllTimers() {
      clearInterval(this.sessionTimer); this.sessionTimer = null
      cancelAnimationFrame(this.rafId); this.rafId = null
      clearTimeout(this.toastTimer)
    },

    pause() {
      if (this.paused) return
      this.paused = true
      this.phasePausedAt = performance.now()
      cancelAnimationFrame(this.rafId); this.rafId = null
      stopCue()
    },
    resume() {
      if (!this.paused) return
      // Shift phaseStart forward by the paused duration to keep the ring position.
      if (this.phasePausedAt) {
        this.phaseStart += (performance.now() - this.phasePausedAt)
        this.phasePausedAt = 0
      }
      this.paused = false
      this.runRaf()
    },
    onConfirmQuit() {
      this.clearAllTimers()
      stopCue()
      this.paused = false
      this.$emit('quit')
    },
    quit() { this.endSession() },

    // ---------- round ----------
    newRound() {
      this.profile = generateProfile()
      this.fieldsShown = pickFields(this.diff.infoCount)
      this.phaseDone = { memorize: false, interference: false }
      this.startMemorize()
    },

    startMemorize() {
      this.phase = 'memorize'
      playCue(1)   // "请记忆以下人物档案"
      this.startPhaseCountdown(this.diff.memTime, () => {
        this.phaseDone.memorize = true
        if (this.diff.distTime > 0) this.startInterference()
        else this.startQuestion()
      })
    },
    startInterference() {
      this.phase = 'interference'
      this.currentSub = 30
      this.distSteps = []
      this.distPicked = null
      this.distFeedback = null
      this.rollDistOpts()
      this.startPhaseCountdown(this.diff.distTime, () => {
        this.phaseDone.interference = true
        this.startQuestion()
      })
    },
    rollDistOpts() {
      const correct = this.currentSub - 3
      const set = new Set()
      while (set.size < 3) {
        const off = (Math.floor(Math.random() * 6) - 3) || 1
        const v = correct + off
        if (v !== correct && v > -20) set.add(v)
      }
      const arr = [correct, ...set]
      arr.sort(() => Math.random() - 0.5)
      this.distOpts = arr
    },
    answerDist(v) {
      if (this.distFeedback !== null) return
      this.distPicked = v
      const correct = this.currentSub - 3
      if (v === correct) {
        this.distFeedback = 'ok'
        setTimeout(() => {
          if (this.phase !== 'interference') return
          this.currentSub = correct
          this.distSteps.push(correct)
          this.distFeedback = null; this.distPicked = null
          this.rollDistOpts()
        }, 300)
      } else {
        this.distFeedback = 'bad'
        setTimeout(() => {
          if (this.phase !== 'interference') return
          this.distFeedback = null; this.distPicked = null
        }, 360)
      }
    },

    startQuestion() {
      this.phase = 'question'
      this.qPicked = null; this.qFeedback = null
      this.qStartAt = performance.now()
      this.buildQuestion()
      playCue(2)   // "请回忆该人物的信息"
      this.startPhaseCountdown(ANSWER_TIME_LIMIT, () => {
        if (this.qFeedback === null) this.answerQ(-1, true)
      })
    },
    buildQuestion() {
      const askable = this.fieldsShown
      const key = askable[Math.floor(Math.random() * askable.length)]
      this.questionField = key
      this.questionText = t('q' + key[0].toUpperCase() + key.slice(1))
      const correct = this.buildDisplay(key).display
      const distractors = new Set()
      const pool = this.optionPool(key)
      let guard = 0
      while (distractors.size < 3 && guard++ < 60) {
        const v = pool[Math.floor(Math.random() * pool.length)]
        if (v !== correct) distractors.add(v)
      }
      const arr = [correct, ...distractors]
      arr.sort(() => Math.random() - 0.5)
      this.qOpts = arr
      this.qCorrectIndex = arr.indexOf(correct)
    },
    optionPool(key) {
      const g = this.lang
      const namePool = [...POOLS.namesM, ...POOLS.namesF].map(o => o[g])
      switch (key) {
        case 'name':      return namePool
        case 'age':       return this.ageDistractors()
        case 'gender':    return [t('genderMale'), t('genderFemale')]
        case 'job':       return POOLS.jobs.map(o => o[g])
        case 'hobby':     return POOLS.hobbies.map(o => o[g])
        case 'city':      return POOLS.cities.map(o => o[g])
        case 'company':   return POOLS.companies.map(o => o[g])
        case 'education': return POOLS.educations.map(o => o[g])
      }
      return []
    },
    ageDistractors() {
      const base = this.profile.age
      const suffix = (this.lang === 'zh' ? t('yearsOld') : t('ageUnit'))
      const set = new Set()
      while (set.size < 8) {
        const off = Math.floor(Math.random() * 14) - 7
        if (off === 0) continue
        const v = base + off
        if (v >= 18 && v <= 80) set.add(v + suffix)
      }
      return Array.from(set)
    },
    buildDisplay(key) {
      const p = this.profile
      const g = this.lang
      let display = '', label = ''
      switch (key) {
        case 'name':      display = p.name[g];       label = 'fieldName'; break
        case 'age':       display = p.age + (g === 'zh' ? t('yearsOld') : t('ageUnit')); label = 'fieldAge'; break
        case 'gender':    display = p.gender === 'M' ? t('genderMale') : t('genderFemale'); label = 'fieldGender'; break
        case 'job':       display = p.job[g];        label = 'fieldJob'; break
        case 'hobby':     display = p.hobby[g];      label = 'fieldHobby'; break
        case 'city':      display = p.city[g];       label = 'fieldCity'; break
        case 'company':   display = p.company[g];    label = 'fieldCompany'; break
        case 'education': display = p.education[g];  label = 'fieldEducation'; break
      }
      return { key, label, display }
    },
    answerQ(i, timeout = false) {
      if (this.qFeedback !== null) return
      const now = performance.now()
      const reactSec = (now - this.qStartAt) / 1000
      this.qPicked = i
      const isCorrect = i === this.qCorrectIndex
      this.total++
      if (isCorrect) {
        this.correct++
        this.reactSum += reactSec
        const gain = Math.round(BASE_POINT * this.diff.coef * 10) / 10
        this.score = Math.round((this.score + gain) * 10) / 10
        this.correctStreak++; this.wrongStreak = 0
        this.qFeedback = 'ok'
        this.showToast('ok', t('correct'), gain)
        if (this.correctStreak >= UPGRADE_STREAK && this.level < DIFFICULTIES.length) {
          this.level++; this.correctStreak = 0
        }
      } else {
        this.wrong++
        this.correctStreak = 0; this.wrongStreak++
        this.qFeedback = 'bad'
        this.showToast('bad', timeout ? (this.lang==='zh'?'超时':'Timeout') : t('wrong'))
        if (this.wrongStreak >= DOWNGRADE_STREAK && this.level > 1) {
          this.level--; this.wrongStreak = 0
        }
      }
      cancelAnimationFrame(this.rafId); this.rafId = null
      this.phaseOnEnd = null
      setTimeout(() => { if (this.sessionLeft > 0) this.newRound() }, 1100)
    },

    // ---------- smooth countdown ----------
    startPhaseCountdown(seconds, onEnd) {
      cancelAnimationFrame(this.rafId); this.rafId = null
      this.phaseTotal = seconds
      this.phaseStart = performance.now()
      this.phasePausedAt = 0
      this.phaseLeft = seconds
      this.phaseRatio = 1
      this.phaseOnEnd = onEnd
      if (seconds <= 0) { onEnd && onEnd(); return }
      this.runRaf()
    },
    runRaf() {
      const step = () => {
        if (this.paused) return
        const elapsedMs = performance.now() - this.phaseStart
        const totalMs = this.phaseTotal * 1000
        const remainMs = Math.max(0, totalMs - elapsedMs)
        this.phaseRatio = remainMs / totalMs
        this.phaseLeft = Math.ceil(remainMs / 1000)
        if (remainMs <= 0) {
          this.phaseRatio = 0
          this.phaseLeft = 0
          this.rafId = null
          const cb = this.phaseOnEnd
          this.phaseOnEnd = null
          cb && cb()
          return
        }
        this.rafId = requestAnimationFrame(step)
      }
      this.rafId = requestAnimationFrame(step)
    },

    showToast(kind, text, gain) {
      this.toast = { kind, text, gain }
      clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => { this.toast = null }, 1000)
    },
    formatTime(s) {
      const m = Math.floor(s / 60); const sec = s % 60
      return `${m}:${String(sec).padStart(2,'0')}`
    }
  }
}
</script>

<style scoped>
.game {
  padding: calc(var(--u) * 1.4) calc(var(--u) * 3);
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: calc(var(--u) * 0.8);
}

/* HUD */
.hud {
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(var(--u) * 1.4) calc(var(--u) * 1.8);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.hud-side { display: flex; align-items: center; gap: calc(var(--u) * 2); }
.hud-side + .hud-side { gap: calc(var(--u) * 1); }

.stat { display: flex; flex-direction: column; gap: calc(var(--u) * 0.3); min-width: calc(var(--u) * 8); }
.k { font-size: calc(var(--u) * 0.9); color: var(--ink-3); letter-spacing: 0.22em; text-transform: uppercase; }
.v { font-family: var(--font-serif); font-size: calc(var(--u) * 2); font-variant-numeric: tabular-nums; display: flex; align-items: baseline; gap: calc(var(--u) * 0.6); letter-spacing: 0.04em; }
.v.accent { color: var(--accent); }
.v.warn { color: var(--bad); }
.rn { color: var(--accent); }
.coef { font-family: var(--font-sans); font-size: calc(var(--u) * 1.15); color: var(--ink-3); }
.sep { width: 1px; height: calc(var(--u) * 3.4); background: var(--line); }

/* Labeled top-right buttons */
.top-btn {
  display: inline-flex; align-items: center;
  gap: calc(var(--u) * 0.6);
  padding: calc(var(--u) * 1) calc(var(--u) * 1.6);
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--line-2);
  color: var(--ink-2);
  font-size: calc(var(--u) * 1.2);
  font-weight: 500;
  letter-spacing: 0.08em;
  transition: all 0.15s ease;
}
.top-btn:hover { color: var(--ink); border-color: var(--ink-3); background: var(--surface); }
.top-btn:last-child {
  color: var(--accent);
  border-color: rgba(212,180,131,0.5);
}
.top-btn:last-child:hover {
  color: var(--accent-2);
  border-color: var(--accent);
  background: rgba(212,180,131,0.08);
}

/* Phase progress */
.phase-bar {
  display: flex; align-items: center; justify-content: center;
  gap: calc(var(--u) * 1);
  margin: calc(var(--u) * 1) 0 calc(var(--u) * 0.4);
}
.ps {
  display: inline-flex; align-items: baseline; gap: calc(var(--u) * 0.8);
  color: var(--ink-3);
  font-size: calc(var(--u) * 1.1);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: color 0.3s ease;
}
.ps em {
  font-style: normal;
  font-family: var(--font-serif);
  color: var(--ink-4);
  font-size: calc(var(--u) * 1.4);
}
.ps.active { color: var(--ink); }
.ps.active em { color: var(--accent); }
.ps.done { color: var(--ink-2); }
.ps.done em { color: var(--ok); }
.ps.muted { opacity: 0.35; }
.p-line { width: calc(var(--u) * 2.5); height: 1px; background: var(--line-2); }

/* Content */
.content {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: calc(var(--u) * 1) 0;
}
.panel {
  display: flex; flex-direction: column;
  align-items: center;
  gap: calc(var(--u) * 1.4);
  width: 100%;
  max-width: calc(var(--u) * 76);
  min-height: 0;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%;
  max-width: calc(var(--u) * 50);
}
.eyebrow {
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 1.1);
  letter-spacing: 0.28em;
  color: var(--ink-3);
  text-transform: uppercase;
}
.cd-ring {
  position: relative;
  width: calc(var(--u) * 4);
  height: calc(var(--u) * 4);
}
.cd-ring span {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.6);
  font-variant-numeric: tabular-nums;
}

/* Interference */
.dist {
  width: 100%;
  max-width: calc(var(--u) * 44);
  display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--u) * 3);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.dist-eq {
  display: inline-flex; align-items: baseline; gap: calc(var(--u) * 1.4);
  font-family: var(--font-serif);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  margin-bottom: calc(var(--u) * 2.4);
}
.d-num { font-size: calc(var(--u) * 4.2); color: var(--ink); letter-spacing: 0.04em; }
.d-op  { font-size: calc(var(--u) * 2.6); color: var(--ink-3); }
.d-num.q { color: var(--accent); }
.dist-keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: calc(var(--u) * 1);
  width: 100%;
  margin-bottom: calc(var(--u) * 1.4);
}
.d-key {
  padding: calc(var(--u) * 1.8) 0;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--line-2);
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 2.6);
  font-variant-numeric: tabular-nums;
  transition: all 0.15s ease;
}
.d-key:hover:not(:disabled) { border-color: var(--ink-3); background: var(--surface); }
.d-key.ok  { border-color: var(--ok); color: var(--ok); background: rgba(124,195,142,0.08); }
.d-key.bad { border-color: var(--bad); color: var(--bad); background: rgba(217,122,122,0.08); animation: shake 0.3s; }
@keyframes shake { 0%,100% {transform: translateX(0)} 25% {transform: translateX(-3px)} 75% {transform: translateX(3px)} }
.dist-hint { font-size: calc(var(--u) * 1.05); color: var(--ink-3); letter-spacing: 0.14em; }

/* Question */
.q-block {
  width: 100%;
  max-width: calc(var(--u) * 60);
  padding: calc(var(--u) * 3);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.q-title {
  text-align: center;
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 2.6);
  font-weight: 400;
  letter-spacing: 0.04em;
  padding-bottom: calc(var(--u) * 2);
  border-bottom: 1px solid var(--line);
  margin-bottom: calc(var(--u) * 2);
}
.q-opts { display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u) * 1); }
.q-opt {
  display: flex; align-items: center; gap: calc(var(--u) * 1.2);
  padding: calc(var(--u) * 1.8) calc(var(--u) * 2);
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--line-2);
  color: var(--ink);
  text-align: left;
  font-size: calc(var(--u) * 1.9);
  transition: all 0.15s ease;
}
.q-opt:hover:not(:disabled) { border-color: var(--ink-3); background: var(--surface); }
.q-opt.ok  { border-color: var(--ok); color: var(--ok); background: rgba(124,195,142,0.08); }
.q-opt.bad { border-color: var(--bad); color: var(--bad); background: rgba(217,122,122,0.08); animation: shake 0.3s; }
.q-opt.dim { opacity: 0.4; }
.q-idx {
  width: calc(var(--u) * 2.8); height: calc(var(--u) * 2.8);
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid var(--line-2);
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.5);
  color: var(--ink-2);
  flex-shrink: 0;
}
.q-opt.ok  .q-idx { border-color: var(--ok); color: var(--ok); }
.q-opt.bad .q-idx { border-color: var(--bad); color: var(--bad); }

/* Toast */
.toast {
  position: absolute;
  top: calc(var(--u) * 0.5);
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: calc(var(--u) * 0.8);
  padding: calc(var(--u) * 0.8) calc(var(--u) * 1.6);
  border-radius: 999px;
  font-size: calc(var(--u) * 1.15);
  letter-spacing: 0.14em;
  background: var(--surface);
  border: 1px solid var(--line-2);
  z-index: 10;
}
.toast.ok  { color: var(--ok); border-color: var(--ok); }
.toast.bad { color: var(--bad); border-color: var(--bad); }
.gain { color: var(--accent); font-family: var(--font-serif); }
</style>
