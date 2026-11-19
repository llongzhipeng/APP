<template>
  <div class="game-bg" :style="{backgroundImage:`url(${bgImage})`}">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-stats">
        <span>{{ t.level }}: {{ level }}</span>
        <span>{{ t.score }}: {{ score }}</span>
        <span :class="{warn: timeLeft<=10}">{{ t.time }}: {{ timeLeft }}s</span>
      </div>
      <div class="hud-task">{{ t.task }}</div>
      <div class="hud-actions">
        <button v-if="showBatchSkip" class="return-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skip }}</button>
        <button class="return-btn" @click="pauseAndShowQuit">{{ t.back }}</button>
      </div>
    </div>

    <!-- Circles -->
    <div class="circles-area">
      <div class="circles-wrap">
        <div class="circles-row">
          <template v-for="(c,i) in circles.slice(0,5)">
            <div :key="'c'+i" class="circle" :class="{blank: c.blank && !c.answered, active: isActiveBlank(i), answered: c.answered, correct: c.correct, wrong: c.wrong}">
              <img v-if="!c.blank || c.answered" :src="c.img" />
              <span v-else class="q">?</span>
            </div>
            <div v-if="i<4" :key="'l'+i" class="line"></div>
          </template>
        </div>
        <div class="row-arrow">↓</div>
        <div class="circles-row">
          <template v-for="(c,i) in circles.slice(5)">
            <div :key="'c2'+i" class="circle" :class="{blank: c.blank && !c.answered, active: isActiveBlank(i+5), answered: c.answered, correct: c.correct, wrong: c.wrong}">
              <img v-if="!c.blank || c.answered" :src="c.img" />
              <span v-else class="q">?</span>
            </div>
            <div v-if="i<4" :key="'l2'+i" class="line"></div>
          </template>
        </div>
      </div>
    </div>

    <!-- Options -->
    <div class="options-area">
      <div class="options-row">
        <div v-for="(o,i) in options" :key="i" class="opt" :class="{selected: o.selected, showCorrect: o.showCorrect, wrong: o.wrong}" @click="answer(i)">
          <img :src="o.img" />
        </div>
      </div>
    </div>

    <!-- Feedback flash -->
    <transition name="flash">
      <div v-if="feedback" class="feedback" :class="feedback">
        {{ feedback==='correct' ? '✓' : '✗' }}
      </div>
    </transition>

    <!-- Confirm quit modal -->
    <div v-if="showConfirmQuit" class="overlay" style="z-index:150">
      <div class="result-box">
        <h2>{{ t.quitTitle }}</h2>
        <div style="display:flex;gap:3vmin;justify-content:center;margin-top:3vmin">
          <button class="done-btn" @click="onQuitConfirm">{{ t.quitYes }}</button>
          <button class="done-btn" style="background:rgba(100,150,200,0.3);border:0.2vmin solid rgba(100,200,255,0.4)" @click="resumeFromQuit">{{ t.quitNo }}</button>
        </div>
      </div>
    </div>

    <!-- Result modal -->
    <div v-if="showResult" class="overlay">
      <div class="result-box">
        <h2>{{ t.done }}</h2>
        <div class="result-grid">
          <div><span>{{ t.level }}</span><strong>{{ level }}</strong></div>
          <div><span>{{ t.score }}</span><strong>{{ score }}</strong></div>
          <div><span>{{ t.total }}</span><strong>{{ totalQ }}</strong></div>
          <div><span>{{ t.success }}</span><strong>{{ successQ }}</strong></div>
          <div><span>{{ t.fail }}</span><strong>{{ failQ }}</strong></div>
          <div><span>{{ t.rate }}</span><strong>{{ rate }}%</strong></div>
          <div><span>{{ t.avg }}</span><strong>{{ avgReaction }}s</strong></div>
        </div>
        <button class="done-btn" @click="emitEnd">{{ t.confirm }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { bgImage, animalImage } from '../../utils/images'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const ANIMALS = ['fishi','sea_horse','starfish','sea_turtle','hirm']

const LEVELS = [
  null,
  {types:2, opts:2, coef:1},
  {types:2, opts:3, coef:1.5},
  {types:3, opts:3, coef:2},
  {types:3, opts:4, coef:2.5},
  {types:4, opts:4, coef:3},
  {types:4, opts:4, coef:3.5}
]

const I18N = {
  zh:{level:'难度',score:'得分',time:'剩余',task:'根据规律，选出空白圆圈中的海洋动物',back:'返回',skip:'跳过游戏',done:'训练结束',total:'总题数',success:'正确',fail:'错误',rate:'正确率',avg:'平均反应',confirm:'确认',quitTitle:'确定要退出训练吗?',quitYes:'退出',quitNo:'继续'},
  en:{level:'Level',score:'Score',time:'Left',task:'Find the missing sea creature by the pattern',back:'Back',skip:'Skip Game',done:'Done',total:'Total',success:'Correct',fail:'Wrong',rate:'Rate',avg:'Avg RT',confirm:'OK',quitTitle:'Quit training?',quitYes:'Quit',quitNo:'Continue'}
}

function randInt(n) { return Math.floor(Math.random()*n) }
function shuffle(a) { for(let i=a.length-1;i>0;i--){const j=randInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a }

export default {
  props: ['lang','duration'],
  data() {
    return {
      bgImage,
      level: getBatchStartDifficultyForGame('hylx'), score: 0,
      timeLeft: this.duration * 60,
      circles: [], options: [],
      feedback: null,
      showResult: false,
      totalQ: 0, successQ: 0, failQ: 0,
      reactionTimes: [],
      questionStart: 0,
      // per-60s window tracking
      windowStart: 0, windowSuccess: 0, windowTotal: 0,
      timer: null, windowTimer: null,
      answered: false,
      showConfirmQuit: false,
      showBatchSkip: shouldShowPbBatchSkip(),
      blankQueue: [],
      currentBlankStep: 0,
      ended: false
    }
  },
  computed: {
    t() { return I18N[this.lang] },
    rate() { return this.totalQ ? Math.round(this.successQ/this.totalQ*100) : 0 },
    avgReaction() { return this.reactionTimes.length ? (this.reactionTimes.reduce((a,b)=>a+b,0)/this.reactionTimes.length/1000).toFixed(1) : 0 }
  },
  mounted() {
    const setVh = () => document.documentElement.style.setProperty('--real-vh', window.innerHeight + 'px')
    setVh()
    window.addEventListener('resize', setVh)
    this._setVh = setVh
    this.genQuestion()
    this.timer = setInterval(() => {
      this.timeLeft--
      if (this.timeLeft <= 0) this.endGame()
    }, 1000)
    this.windowTimer = setInterval(() => this.adjustDifficulty(), 60000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    clearInterval(this.windowTimer)
    window.removeEventListener('resize', this._setVh)
  },
  methods: {
    pauseAndShowQuit() {
      clearInterval(this.timer)
      this.showConfirmQuit = true
    },
    resumeFromQuit() {
      this.showConfirmQuit = false
      this.timer = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) this.endGame()
      }, 1000)
    },
    onQuitConfirm() {
      clearInterval(this.timer)
      clearInterval(this.windowTimer)
      this.showConfirmQuit = false
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    getAnimalTypes(n) {
      return shuffle([...ANIMALS]).slice(0, n)
    },
    genQuestion() {
      this.answered = false
      const cfg = LEVELS[this.level]
      const types = this.getAnimalTypes(cfg.types)
      const pattern = []
      for (let i = 0; i < 10; i++) pattern.push(types[i % types.length])

      const blankCount = this.level >= 4 ? 2 : 1
      // sort ascending = left-to-right, top-to-bottom order
      this.blankQueue = shuffle([...Array(9).keys()].map(i=>i+1)).slice(0, blankCount).sort((a,b)=>a-b)
      this.currentBlankStep = 0

      this.circles = pattern.map((type, i) => ({
        blank: this.blankQueue.includes(i),
        img: animalImage(type, randInt(4) + 1),
        type, answered: false, correct: false, wrong: false
      }))

      this.buildOptions()
      this.questionStart = Date.now()
    },
    buildOptions() {
      const cfg = LEVELS[this.level]
      // include ALL correct types for all blanks, then pad with distractors
      const correctTypes = [...new Set(this.blankQueue.map(idx => this.circles[idx].type))]
      const usedTypes = [...new Set(this.circles.map(c => c.type))]
      const wrongPool = shuffle(
        usedTypes.filter(t => !correctTypes.includes(t))
          .concat(shuffle(ANIMALS.filter(a => !usedTypes.includes(a))))
      )
      const optTypes = [...correctTypes, ...wrongPool].slice(0, cfg.opts)
      this.options = shuffle(optTypes.map(t => ({
        img: animalImage(t, randInt(4) + 1),
        type: t, showCorrect: false, selected: false, wrong: false
      })))
    },
    isActiveBlank(idx) {
      return !this.answered && this.blankQueue[this.currentBlankStep] === idx
    },
    answer(i) {
      if (this.answered) return
      const opt = this.options[i]
      const rt = Date.now() - this.questionStart
      const blankIdx = this.blankQueue[this.currentBlankStep]
      const correctType = this.circles[blankIdx].type

      if (opt.type === correctType) {
        opt.selected = true
        this.circles[blankIdx].answered = true; this.circles[blankIdx].correct = true
        this.score += Math.round(5 * LEVELS[this.level].coef)
        this.successQ++; this.windowSuccess++
        this.totalQ++; this.windowTotal++
        this.reactionTimes.push(rt)
        this.feedback = 'correct'

        const hasMore = this.currentBlankStep < this.blankQueue.length - 1
        setTimeout(() => {
          this.feedback = null
          if (hasMore) {
            this.currentBlankStep++
            this.questionStart = Date.now()
            // options stay — no rebuild
          } else {
            this.genQuestion()
          }
        }, 600)
      } else {
        this.answered = true
        opt.wrong = true
        this.options.forEach(o => { if (o.type === correctType) o.showCorrect = true })
        this.blankQueue.slice(this.currentBlankStep).forEach(idx => {
          this.circles[idx].answered = true; this.circles[idx].wrong = true
        })
        this.failQ++
        this.totalQ++; this.windowTotal++
        this.reactionTimes.push(rt)
        this.feedback = 'wrong'
        setTimeout(() => { this.feedback = null; this.genQuestion() }, 900)
      }
    },
    adjustDifficulty() {
      if (this.windowTotal === 0) return
      const rate = this.windowSuccess / this.windowTotal
      if (rate >= 0.9 && this.level < 6) this.level++
      else if (rate < 0.7 && this.level > 1) this.level--
      this.windowSuccess = 0; this.windowTotal = 0
    },
    endGame() {
      if (this.ended) return
      this.ended = true
      clearInterval(this.timer)
      clearInterval(this.windowTimer)
      this.$emit('end', this.buildResult())
      this.showResult = true
    },
    buildResult() {
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      return {
        time, level: this.level, duration: this.duration,
        total: this.totalQ, success: this.successQ, fail: this.failQ,
        rate: this.rate, avgReaction: this.avgReaction, score: this.score
      }
    },
    emitEnd() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.game-bg { width:100vw; height:100vh; height:var(--real-vh, 100vh); background-size:cover; background-position:center; display:flex; flex-direction:column; overflow:hidden; }

.hud { display:flex; align-items:center; justify-content:space-between; padding:1.5vmin 2.5vmin; background:rgba(0,15,40,0.82); backdrop-filter:blur(8px); border-bottom:0.15vmin solid rgba(100,200,255,0.25); flex-shrink:0; }
.hud-stats { display:flex; gap:2.5vmin; color:#7ee8ff; font-size:clamp(10px,2vmin,22px); font-weight:700; }
.hud-stats .warn { color:#f87171; animation:blink 0.6s infinite alternate; }
@keyframes blink { from{opacity:1} to{opacity:0.4} }
.hud-task { color:#7ee8ff; font-size:clamp(13px,2.8vmin,32px); font-weight:700; text-align:center; flex:1; padding:0 2vmin; text-shadow:0 0 1vmin rgba(100,220,255,0.5); }
.hud-actions { display:flex; gap:10px; align-items:center; }
.return-btn { background:rgba(239,68,68,0.25); border:0.2vmin solid rgba(239,68,68,0.6); color:#fca5a5; padding:0.8vmin 2vmin; border-radius:0.8vmin; font-size:clamp(10px,1.8vmin,20px); cursor:pointer; }
.return-btn:hover { background:rgba(239,68,68,0.45); }

.circles-area { height:58%; flex:none; display:flex; align-items:center; justify-content:center; padding:0.5vh 2vw; }
.circles-wrap { display:flex; flex-direction:column; align-items:center; gap:1vh; width:100%; }
.circles-row { display:flex; align-items:center; justify-content:center; width:100%; }
.row-arrow { color:#7ee8ff; font-size:clamp(14px,2.5vh,32px); line-height:1; }
/* 每行5圆圈+4连线，圆圈尺寸 = (100vw - 4vw padding - 4*1.5vw line) / 5 ≈ 17.6vw，再限高 */
.circle { width:calc((96vw - 4*1.5vw) / 5); height:calc((96vw - 4*1.5vw) / 5); max-width:calc(var(--real-vh, 100vh) * 0.21); max-height:calc(var(--real-vh, 100vh) * 0.21); border-radius:50%; border:0.4vmin solid rgba(100,200,255,0.55); background:rgba(0,30,70,0.7); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; transition:all 0.3s; }
.circle.blank { border-color:rgba(255,215,0,0.4); border-width:0.5vmin; }
.circle.active { border-color:#ffd700; box-shadow:0 0 2.5vmin rgba(255,215,0,0.8); animation:pulse 1s infinite alternate; }
@keyframes pulse { from{box-shadow:0 0 1.5vmin rgba(255,215,0,0.5)} to{box-shadow:0 0 3vmin rgba(255,215,0,1)} }
.circle.correct { border-color:#22c55e; box-shadow:0 0 2vmin rgba(34,197,94,0.6); }
.circle.wrong { border-color:#ef4444; box-shadow:0 0 2vmin rgba(239,68,68,0.6); }
.circle img { width:78%; height:78%; object-fit:contain; }
.q { color:#ffd700; font-size:calc((96vw - 4*1.5vw) / 5 * 0.38); font-weight:900; }
.line { width:1.5vw; min-width:8px; height:0.3vmin; background:rgba(100,200,255,0.4); flex-shrink:0; }

.options-area { height:34%; flex:none; padding:0.5vh 2vw 1vh; display:flex; justify-content:center; align-items:center; }
.options-row { display:flex; gap:3vw; justify-content:center; }
/* 最多4个选项，尺寸填满底部区域 */
.opt { width:calc((94vw - 3*3vw) / 4); height:calc((94vw - 3*3vw) / 4); max-width:calc(var(--real-vh, 100vh) * 0.27); max-height:calc(var(--real-vh, 100vh) * 0.27); border-radius:1.5vmin; border:0.3vmin solid rgba(100,200,255,0.4); background:rgba(0,30,70,0.75); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; overflow:hidden; }
.opt:hover { border-color:#7ee8ff; transform:scale(1.06); box-shadow:0 4px 16px rgba(0,150,255,0.4); }
.opt.selected { border-color:#22c55e; background:rgba(34,197,94,0.2); box-shadow:0 0 2vmin rgba(34,197,94,0.5); }
.opt.showCorrect { border-color:#22c55e; background:rgba(34,197,94,0.2); }
.opt.wrong { border-color:#ef4444; background:rgba(239,68,68,0.2); }
.opt img { width:80%; height:80%; object-fit:contain; }

.feedback { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); font-size:clamp(40px,15vmin,160px); font-weight:900; pointer-events:none; z-index:100; }
.feedback.correct { color:#22c55e; text-shadow:0 0 3vmin rgba(34,197,94,0.8); }
.feedback.wrong { color:#ef4444; text-shadow:0 0 3vmin rgba(239,68,68,0.8); }
.flash-enter-active,.flash-leave-active { transition:all 0.25s; }
.flash-enter,.flash-leave-to { opacity:0; transform:translate(-50%,-50%) scale(0.5); }

.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.78); display:flex; align-items:center; justify-content:center; z-index:200; }
.result-box { background:linear-gradient(160deg,#001a3a,#002a5a); border:0.2vmin solid rgba(100,200,255,0.4); border-radius:2.5vmin; padding:4vmin 5vmin; min-width:40vmin; text-align:center; }
.result-box h2 { color:#7ee8ff; font-size:clamp(14px,3.5vmin,40px); margin-bottom:3vmin; }
.result-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2vmin; margin-bottom:3vmin; }
.result-grid div { display:flex; flex-direction:column; gap:0.5vmin; }
.result-grid span { color:rgba(150,210,255,0.7); font-size:clamp(9px,1.5vmin,16px); }
.result-grid strong { color:#7ee8ff; font-size:clamp(12px,2.5vmin,28px); font-weight:800; }
.done-btn { background:linear-gradient(135deg,#0077cc,#00c6ff); border:none; color:#fff; padding:1.4vmin 5vmin; border-radius:1.2vmin; font-size:clamp(12px,2.2vmin,24px); font-weight:700; cursor:pointer; }
.done-btn:hover { opacity:0.85; }
</style>
