<template>
  <div id="app">
    <button v-if="!langLocked" class="lang-btn" @click="toggleLang">{{ lang==='zh'?'EN':'中' }}</button>

    <!-- Home -->
    <div v-if="phase==='home'" class="screen home">
      <h1>{{ t('title') }}</h1>
      <p class="sub">{{ t('sub') }}</p>
      <div class="btn-col">
        <button class="btn primary" @click="phase='tutorial'">{{ t('start') }}</button>
        <button class="btn" @click="phase='rules'">{{ t('rules') }}</button>
        <button class="btn" @click="phase='history'">{{ t('history') }}</button>
      </div>
    </div>

    <!-- Rules -->
    <div v-if="phase==='rules'" class="overlay" @click.self="phase='home'">
      <div class="modal">
        <h2>{{ t('rulesTitle') }}</h2>
        <table class="rules-table">
          <tr><th>{{ t('level') }}</th><th>{{ t('pattern') }}</th><th>{{ t('missingPos') }}</th><th>{{ t('coef') }}</th></tr>
          <tr v-for="l in levelDefs" :key="l.id">
            <td>{{ l.id }}</td><td>{{ l.example }}</td><td>{{ lang==='zh'?l.posZh:l.posEn }}</td><td>{{ l.coef }}</td>
          </tr>
        </table>
        <p class="rule-note">{{ t('adjustNote') }}</p>
        <p class="rule-note">{{ t('scoreNote') }}</p>
        <button class="btn primary" @click="phase='home'">{{ t('close') }}</button>
      </div>
    </div>

    <!-- History -->
    <div v-if="phase==='history'" class="overlay" @click.self="phase='home'">
      <div class="modal wide">
        <h2>{{ t('historyTitle') }}</h2>
        <div v-if="history.length===0" class="empty">{{ t('noHistory') }}</div>
        <div v-else class="tbl-wrap">
          <table>
            <tr><th v-for="h in histHeaders" :key="h">{{ h }}</th></tr>
            <tr v-for="(r,i) in history" :key="i">
              <td>{{ r.time }}</td><td>{{ r.project }}</td><td>{{ r.level }}</td><td>{{ r.dur }}</td>
              <td>{{ r.total }}</td><td>{{ r.correct }}</td><td>{{ r.wrong }}</td>
              <td>{{ r.rate }}</td><td>{{ r.avg }}</td><td>{{ r.score }}</td>
            </tr>
          </table>
        </div>
        <button class="btn primary mt" @click="phase='home'">{{ t('close') }}</button>
      </div>
    </div>

    <!-- Tutorial -->
    <div v-if="phase==='tutorial'" class="overlay tutorial-overlay">
      <div class="modal tutorial">
        <div class="tut-body">
          <!-- Step 0: number seq, blank at end -->
          <div v-if="tutStep===0" class="tut-demo">
            <div class="seq-row">
              <div v-for="(v,i) in [2,4,6]" :key="i" class="seq-card num">{{ v }}</div>
              <div class="seq-card blank">?</div>
            </div>
            <div class="opts-row">
              <div v-for="o in [6,8,10,5]" :key="o" class="opt-card" :class="{highlight:o===8}">{{ o }}</div>
            </div>
          </div>
          <!-- Step 1: number seq, blank in middle -->
          <div v-if="tutStep===1" class="tut-demo">
            <div class="seq-row">
              <div class="seq-card num">3</div>
              <div class="seq-card blank">?</div>
              <div class="seq-card num">7</div>
              <div class="seq-card num">9</div>
              <div class="seq-card num">11</div>
            </div>
            <div class="opts-row">
              <div v-for="o in [4,5,6,8]" :key="o" class="opt-card" :class="{highlight:o===5}">{{ o }}</div>
            </div>
          </div>
          <!-- Step 2: blocks pattern, middle blank -->
          <div v-if="tutStep===2" class="tut-demo">
            <div class="seq-row">
              <div v-for="(v,i) in [2,4,null,8,10]" :key="i" class="seq-card" :class="{blank:v===null, num:v!==null}">
                <div v-if="v!==null" class="blocks"><div v-for="b in v" :key="b" class="blk"></div></div>
                <template v-else>?</template>
              </div>
            </div>
            <div class="opts-row">
              <div v-for="o in [5,6,7,9]" :key="o" class="opt-card blocks-opt" :class="{highlight:o===6}">
                <div class="blocks"><div v-for="b in o" :key="b" class="blk"></div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tut-nav">
          <button v-if="tutStep>0" class="btn sm" @click="tutStep--">{{ t('prev') }}</button>
          <button class="btn sm" @click="onTutorialDone">{{ t('skip') }}</button>
          <button v-if="tutStep<2" class="btn sm primary" @click="tutStep++">{{ t('next') }}</button>
          <button v-else class="btn sm primary" @click="onTutorialDone">{{ t('done') }}</button>
        </div>
      </div>
    </div>

    <!-- Duration -->
    <div v-if="phase==='duration'" class="screen">
      <h2 class="dur-title">{{ t('selectDur') }}</h2>
      <div class="btn-row mt">
        <button class="btn lg" :class="{primary: pendingDur===1}" @click="pendingDur=1">1 {{ t('min') }}</button>
        <button class="btn lg" :class="{primary: pendingDur===3}" @click="pendingDur=3">3 {{ t('min') }}</button>
        <button class="btn lg" :class="{primary: pendingDur===5}" @click="pendingDur=5">5 {{ t('min') }}</button>
      </div>
      <div class="btn-row mt">
        <button class="btn" @click="phase='home';pendingDur=null">{{ t('back') }}</button>
        <button class="btn primary lg" :disabled="!pendingDur" @click="pendingDur && startGame(pendingDur)">{{ t('startNow') }}</button>
      </div>
    </div>

    <!-- Game -->
    <div v-if="phase==='game'" class="screen game">
      <div class="game-header">
        <div class="hud">
          <span>{{ t('level') }}: <b>{{ difficulty }}</b></span>
          <span>{{ t('score') }}: <b>{{ score }}</b></span>
          <span>{{ t('time') }}: <b>{{ fmt(timeLeft) }}</b></span>
        </div>
        <div class="rule-text">{{ ruleText }}</div>
        <button v-if="showBatchSkip" class="btn sm secondary skip-btn" @click="onSkipClick">{{ t('skipGame') }}</button>
        <button class="btn sm warn" @click="onReturn">{{ t('return') }}</button>
      </div>

      <div v-if="currentQ" class="game-body">
        <!-- Sequence -->
        <div class="seq-row big">
          <div v-for="(v,i) in currentQ.seq" :key="i" class="seq-card" :class="seqCardClass(i)">
            <template v-if="i!==currentQ.mi">
              <span v-if="difficulty<=3">{{ v }}</span>
              <div v-else class="blocks" :class="{g7: difficulty===6}"><div v-for="b in v" :key="b" class="blk"></div></div>
            </template>
            <template v-else-if="selectedOpt!==null">
              <span v-if="difficulty<=3">{{ selectedOpt }}</span>
              <div v-else class="blocks" :class="{g7: difficulty===6}"><div v-for="b in selectedOpt" :key="b" class="blk"></div></div>
            </template>
            <template v-else><span class="q-mark">?</span></template>
          </div>
        </div>

        <!-- Options -->
        <div class="opts-grid">
          <button v-for="o in currentQ.opts" :key="o"
            class="opt-btn" :class="optClass(o)"
            :disabled="answered || paused || selectedOpt!==null" @click="checkAnswer(o)">
            <span v-if="difficulty<=3">{{ o }}</span>
            <div v-else class="blocks" :class="{g7: difficulty===6}"><div v-for="b in o" :key="b" class="blk"></div></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Quit confirm -->
    <div v-if="showQuitConfirm" class="overlay">
      <div class="modal small">
        <p class="confirm-text">{{ t('confirmQuit') }}</p>
        <div class="btn-row confirm-row">
          <button class="btn" @click="cancelQuit">{{ t('cancelQuit') }}</button>
          <button class="btn warn" @click="confirmQuit">{{ t('confirmEnd') }}</button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="phase==='result'" class="screen">
      <h2>{{ t('over') }}</h2>
      <div class="stats-grid mt">
        <div class="stat"><span>{{ t('finalScore') }}</span><strong>{{ score }}</strong></div>
        <div class="stat"><span>{{ t('totalQ') }}</span><strong>{{ stats.total }}</strong></div>
        <div class="stat"><span>{{ t('correct') }}</span><strong>{{ stats.correct }}</strong></div>
        <div class="stat"><span>{{ t('wrong') }}</span><strong>{{ stats.total - stats.correct }}</strong></div>
        <div class="stat"><span>{{ t('rate') }}</span><strong>{{ stats.total>0?Math.round(stats.correct/stats.total*100):0 }}%</strong></div>
        <div class="stat"><span>{{ t('avgTime') }}</span><strong>{{ stats.correct>0?(stats.rxMs/stats.correct/1000).toFixed(1)+'s':'-' }}</strong></div>
      </div>
      <button class="btn primary mt" @click="goHome">{{ t('backHome') }}</button>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from './assets'
const I18N = {
  title:{zh:'数列侦探',en:'Sequence Detective'},
  sub:{zh:'推演规律，补全序列',en:'Find patterns, complete sequences'},
  start:{zh:'开始游戏',en:'Start Game'},
  rules:{zh:'规则介绍',en:'Rules'},
  history:{zh:'历史记录',en:'History'},
  rulesTitle:{zh:'游戏规则',en:'Game Rules'},
  historyTitle:{zh:'历史记录',en:'History'},
  close:{zh:'关闭',en:'Close'},
  noHistory:{zh:'暂无记录',en:'No records yet'},
  prev:{zh:'上一步',en:'Prev'},
  next:{zh:'下一步',en:'Next'},
  skip:{zh:'跳过',en:'Skip'},
  done:{zh:'完成',en:'Done'},
  selectDur:{zh:'选择训练时长',en:'Select Duration'},
  min:{zh:'分钟',en:'Min'},
  back:{zh:'返回',en:'Back'},
  startNow:{zh:'开始游戏',en:'Start Game'},
  level:{zh:'难度',en:'Level'},
  score:{zh:'得分',en:'Score'},
  time:{zh:'剩余',en:'Time'},
  return:{zh:'返回',en:'Return'},
  confirmQuit:{zh:'确定要结束本次训练吗？',en:'End this session?'},
  confirmEnd:{zh:'结束训练',en:'End Session'},
  cancelQuit:{zh:'继续游戏',en:'Continue'},
  over:{zh:'训练结束',en:'Game Over'},
  finalScore:{zh:'最终得分',en:'Final Score'},
  totalQ:{zh:'总题数',en:'Total'},
  correct:{zh:'答对',en:'Correct'},
  wrong:{zh:'答错',en:'Wrong'},
  rate:{zh:'正确率',en:'Rate'},
  avgTime:{zh:'平均反应时',en:'Avg Time'},
  backHome:{zh:'返回首页',en:'Back to Home'},
  adjustNote:{zh:'每60秒统计正确率：>90%升级，<70%降级',en:'Every 60s: >90% accuracy→up, <70%→down'},
  scoreNote:{zh:'得分=5×难度系数（答对每题）',en:'Score = 5 × coefficient per correct answer'},
  pattern:{zh:'规律',en:'Pattern'},
  missingPos:{zh:'缺失位置',en:'Missing'},
  coef:{zh:'系数',en:'Coef'},
  skipGame:{zh:'跳过',en:'Skip'},
}

const LEVELS = [
  {id:1,type:1,end:true, coef:1.0, example:'2,4,6,_',posZh:'末尾',posEn:'End'},
  {id:2,type:2,end:true, coef:1.5, example:'3,5,7,9,11,_',posZh:'末尾',posEn:'End'},
  {id:3,type:3,end:true, coef:2.0, example:'7,14,21,28,_',posZh:'末尾',posEn:'End'},
  {id:4,type:1,end:false,coef:2.5, example:'2,4,_,8,10',posZh:'中间',posEn:'Middle'},
  {id:5,type:2,end:false,coef:3.0, example:'3,5,_,9,11',posZh:'中间',posEn:'Middle'},
  {id:6,type:3,end:false,coef:3.5, example:'7,_,21',posZh:'中间',posEn:'Middle'},
]

import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'slzt'

const RULE_TEXT = {
  zh:[
    '请找出以下数字的规律，补全末尾',
    '请找出以下数字的规律，补全末尾',
    '请找出以下数字的规律，补全末尾',
    '请找出以下积木的规律，补全中间',
    '请找出以下积木的规律，补全中间',
    '请找出以下积木的规律，补全中间',
  ],
  en:[
    'Find the number pattern to complete the end',
    'Find the number pattern to complete the end',
    'Find the number pattern to complete the end',
    'Find the block pattern to complete the middle',
    'Find the block pattern to complete the middle',
    'Find the block pattern to complete the middle',
  ],
}

export default {
  data() {
    return {
      phase: 'home',
      lang: 'zh',
      langLocked: false,
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      timeLeft: 0,
      totalDur: 0,
      currentQ: null,
      answered: false,
      selectedOpt: null,
      tutStep: 0,
      pendingDur: null,
      showQuitConfirm: false,
      paused: false,
      pauseStart: 0,
      stats: {total:0,correct:0,rxMs:0,rxStart:0},
      periodStats: {total:0,correct:0},
      periodCounter: 0,
      gameTimer: null,
      currentAudio: null,
      history: JSON.parse(localStorage.getItem('seqHistory')||'[]'),
      archiveId: -1,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (min) => { this.pendingDur = min },
      openTutorial: () => { this.phase = 'tutorial'; this.tutStep = 0 },
    })
  },
  computed: {
    levelDefs() { return LEVELS },
    lv() { return LEVELS[this.difficulty-1] },
    ruleText() { return RULE_TEXT[this.lang][this.difficulty-1] },
    histHeaders() {
      return this.lang==='zh'
        ? ['训练时间','训练项目','难度','时长','总次数','成功','失败','成功率','平均反应时','得分']
        : ['Time','Project','Level','Duration','Total','Correct','Wrong','Rate','AvgTime','Score']
    },
  },
  methods: {
    t(k) { return (I18N[k]||{})[this.lang]||k },
    toggleLang() { this.lang = this.lang==='zh'?'en':'zh' },
    onTutorialDone() {
      this.tutStep = 0
      if (afterBatchTutorial(GAME_TYPE, (min) => this.startGame(min))) return
      this.phase = 'duration'
      this.pendingDur = null
    },
    fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` },
    optClass(o) {
      if (!this.answered) return ''
      if (o===this.currentQ.answer) return 'correct'
      if (o===this.selectedOpt) return 'wrong'
      return ''
    },
    seqCardClass(i) {
      const isBlank = i===this.currentQ.mi
      if (!isBlank) return 'num'
      if (this.answered) {
        return this.selectedOpt===this.currentQ.answer ? 'filled correct' : 'filled wrong'
      }
      if (this.selectedOpt!==null) return 'filled'
      return 'blank'
    },
    playVoice() {
      const dir = this.lang==='zh' ? 'chinese' : 'english'
      const file = this.difficulty<=3 ? '1.mp3' : '2.mp3'
      try {
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.currentAudio.currentTime = 0
        }
        const audio = new Audio(resolveVoice(`/voice/${dir}/${file}`))
        this.currentAudio = audio
        audio.play().catch(()=>{})
      } catch(e) {}
    },

    genQ() {
      const lv = this.lv
      const isBlock = !lv.end
      let fn, len, startN
      if (lv.type===1) {
        startN = isBlock ? 1 : Math.floor(Math.random()*5)+1
        len = lv.end ? 4 : 5
        fn = i => (startN+i)*2
      } else if (lv.type===2) {
        startN = isBlock ? 1 : Math.floor(Math.random()*5)+1
        len = 5
        fn = i => (startN+i)*2+1
      } else {
        if (isBlock) {
          startN = 1
          len = 3
        } else {
          startN = Math.floor(Math.random()*3)+1
          len = 5
        }
        fn = i => (startN+i)*7
      }
      const seq = Array.from({length:len},(_,i)=>fn(i))
      const mi = lv.end ? len-1 : Math.floor(len/2)
      const answer = seq[mi]
      const used = new Set([answer])
      const distractors = []
      while (distractors.length<3) {
        let d
        if (lv.type===3) {
          const base = Math.round(answer/7)
          const off = [-2,-1,1,2,3][Math.floor(Math.random()*5)]
          d = (base+off)*7
        } else {
          const offsets = [-4,-2,2,4,6,-6]
          d = answer + offsets[Math.floor(Math.random()*offsets.length)]
        }
        if (d>0 && !used.has(d)) { used.add(d); distractors.push(d) }
      }
      const opts = [answer,...distractors].sort(()=>Math.random()-0.5)
      this.currentQ = {seq, mi, opts, answer}
      this.answered = false
      this.selectedOpt = null
      this.stats.rxStart = Date.now()
      this.playVoice()
    },

    checkAnswer(o) {
      if (this.answered || this.paused || this.selectedOpt!==null) return
      this.selectedOpt = o
      const rx = Date.now()-this.stats.rxStart
      setTimeout(()=>{
        if (this.phase!=='game') return
        this.answered = true
        const ok = o===this.currentQ.answer
        this.stats.total++
        this.periodStats.total++
        if (ok) {
          this.stats.correct++
          this.periodStats.correct++
          this.score += Math.round(5*this.lv.coef)
          this.stats.rxMs += rx
        }
        setTimeout(()=>{ if (this.phase==='game') this.genQ() }, 900)
      }, 450)
    },

    startGame(min) {
      this.totalDur = min*60
      this.timeLeft = min*60
      this.difficulty = getBatchStartDifficultyForGame(GAME_TYPE)
      this.score = 0
      this.stats = {total:0,correct:0,rxMs:0,rxStart:0}
      this.periodStats = {total:0,correct:0}
      this.periodCounter = 0
      this.paused = false
      this.showQuitConfirm = false
      this.langLocked = true
      this.phase = 'game'
      this.genQ()
      this.gameTimer = setInterval(()=>{
        if (this.paused) return
        this.timeLeft--
        this.periodCounter++
        if (this.periodCounter >= 60) {
          const {total,correct} = this.periodStats
          if (total>0) {
            const r = correct/total
            if (r>0.9 && this.difficulty<6) this.difficulty++
            else if (r<0.7 && this.difficulty>1) this.difficulty--
          }
          this.periodStats = {total:0,correct:0}
          this.periodCounter = 0
        }
        if (this.timeLeft<=0) this.endGame()
      },1000)
    },

    onSkipClick() {
      skipPbBatchGame()
    },

    onReturn() {
      this.paused = true
      this.pauseStart = Date.now()
      this.showQuitConfirm = true
    },

    cancelQuit() {
      if (this.pauseStart) {
        this.stats.rxStart += Date.now() - this.pauseStart
      }
      this.pauseStart = 0
      this.paused = false
      this.showQuitConfirm = false
    },

    confirmQuit() {
      this.showQuitConfirm = false
      clearInterval(this.gameTimer)
      this.gameTimer = null
      if (this.currentAudio) { try { this.currentAudio.pause() } catch (e) {} this.currentAudio = null }
      leavePbGameWindow({ confirm: false })
    },

    endGame() {
      clearInterval(this.gameTimer)
      this.gameTimer = null
      if (this.currentAudio) { try{this.currentAudio.pause()}catch(e){} this.currentAudio = null }
      this.langLocked = false
      const rec = {
        time: new Date().toLocaleString(),
        project: '数列侦探',
        level: this.difficulty,
        dur: this.totalDur/60+'min',
        total: this.stats.total,
        correct: this.stats.correct,
        wrong: this.stats.total-this.stats.correct,
        rate: this.stats.total>0 ? Math.round(this.stats.correct/this.stats.total*100)+'%' : '0%',
        avg: this.stats.correct>0 ? (this.stats.rxMs/this.stats.correct/1000).toFixed(1)+'s' : '-',
        score: this.score,
      }
      this.history.unshift(rec)
      if (this.history.length>50) this.history = this.history.slice(0,50)
      localStorage.setItem('seqHistory', JSON.stringify(this.history))
      const avgMs = this.stats.correct > 0 ? Math.round(this.stats.rxMs / this.stats.correct) : 0
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgMs),
        score: this.score,
        successCount: this.stats.correct,
        failCount: this.stats.total - this.stats.correct,
        trainDuration: this.totalDur / 60,
        difficultyLevel: this.difficulty,
      }).catch(() => {})
      this.phase = 'result'
    },

    goHome() { this.phase='home' },
  }
}
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100vw;height:100vh;overflow:hidden;font-family:sans-serif}
#app{
  width:100vw;height:100vh;
  font-size:clamp(14px,2.6vmin,40px);
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
  color:#eee;position:relative;
}
.lang-btn{position:absolute;top:1.2em;right:1.5em;padding:.5em 1.1em;border:1px solid #5b8dee;border-radius:1.2em;background:transparent;color:#5b8dee;cursor:pointer;font-size:1em;z-index:100}
.lang-btn:hover{background:#5b8dee;color:#fff}

/* screens */
.screen{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;padding:1.5em}
.home h1{font-size:3.6em;letter-spacing:.05em;color:#5b8dee;margin-bottom:.4em}
.home .sub{font-size:1.5em;color:#aaa;margin-bottom:2em}
.dur-title{font-size:1.8em;color:#5b8dee}
.btn-col{display:flex;flex-direction:column;gap:1em;width:16em}
.btn{padding:.85em 1.8em;border:none;border-radius:.6em;cursor:pointer;font-size:1.2em;background:#2a2a4a;color:#ccc;transition:.2s}
.btn:hover:not(:disabled){background:#3a3a6a}
.btn.primary{background:#5b8dee;color:#fff}
.btn.primary:hover:not(:disabled){background:#4a7ddd}
.btn.sm{padding:.55em 1.1em;font-size:1em}
.btn.lg{padding:1em 2.4em;font-size:1.4em}
.btn.warn{background:#c0392b;color:#fff}
.btn.warn:hover:not(:disabled){background:#a93226}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-row{display:flex;gap:1.2em;align-items:center;justify-content:center;flex-wrap:wrap}
.mt{margin-top:1.5em}

/* overlay & modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:50}
.modal{background:#1e2a45;border-radius:1em;padding:2em 2.2em;max-width:92vw;max-height:88vh;overflow-y:auto;min-width:24em}
.modal.wide{max-width:96vw;min-width:44em}
.modal.small{min-width:22em;text-align:center}
.modal h2{font-size:1.8em;margin-bottom:1em;color:#5b8dee}
.rule-note{margin:.6em 0;font-size:1em;color:#aaa}
.tbl-wrap{overflow-x:auto;margin:.6em 0}
.empty{text-align:center;color:#888;padding:2em;font-size:1.1em}
.confirm-text{font-size:1.3em;margin-bottom:1.5em;color:#eee}
.confirm-row{justify-content:center;gap:1em}

/* tables */
table{border-collapse:collapse;width:100%;font-size:1em}
th,td{border:1px solid #2a3a5a;padding:.5em .8em;text-align:center}
th{background:#16213e;color:#5b8dee}
.rules-table td:first-child{font-weight:bold;color:#f39c12}

/* tutorial */
.tutorial-overlay{background:#e5efdf}
.modal.tutorial{min-width:32em;background:#f8fff5;color:#253c2c;border:1px solid #cbdcc8}
.modal.tutorial h2{color:#245d45}
.modal.tutorial .opt-card:not(.highlight){color:#eaf3ff}
.tut-body{padding:1.2em 0}
.tut-demo{display:flex;flex-direction:column;align-items:center;gap:1.4em}
.tut-nav{display:flex;gap:.9em;justify-content:center;margin-top:1.4em;flex-wrap:wrap}
.opts-row{display:flex;gap:.9em;flex-wrap:wrap;justify-content:center}
.opt-card{padding:.6em 1.1em;border-radius:.6em;background:#2a3a5a;min-width:3.5em;text-align:center;font-size:1.2em}
.opt-card.highlight{background:#27ae60;color:#fff;font-weight:bold}

/* seq row */
.seq-row{display:flex;align-items:center;gap:.9em;flex-wrap:wrap;justify-content:center}
.seq-row.big{gap:1.2em}
.seq-card{
  display:flex;align-items:center;justify-content:center;
  min-width:4.2em;min-height:4.2em;border-radius:.7em;
  background:#2a4370;border:2px solid #6a8ec4;
  box-shadow:0 2px 6px rgba(0,0,0,.35);
  font-size:1.6em;font-weight:bold;color:#eaf3ff;
}
.seq-row.big .seq-card{min-width:4.4em;min-height:4.4em;font-size:2em}
.seq-card.blank{background:#3a2a10;border-color:#f39c12;color:#f39c12}
.seq-card.filled{background:#345590;border-color:#8fb0e0;color:#fff;animation:seqPop .25s ease-out}
.seq-card.filled.correct{background:#1a3a2a;border-color:#27ae60;color:#2ecc71}
.seq-card.filled.wrong{background:#3a1a1a;border-color:#c0392b;color:#e74c3c}
@keyframes seqPop{from{transform:scale(.6);opacity:.3}to{transform:scale(1);opacity:1}}
.q-mark{color:#f39c12;font-size:1.1em}

/* game */
.game{padding:1em 1em 2em;justify-content:flex-start;background:linear-gradient(145deg,#f3faee,#e3efdd);color:#253c2c}
.game-header{
  width:100%;display:flex;align-items:center;justify-content:space-between;
  background:#fcfffa;border:1px solid #cbdcc8;border-radius:.8em;padding:.9em 1.4em;margin-bottom:1.2em;
  gap:1em;
}
.hud{display:flex;gap:1.8em;font-size:1.15em}
.hud span{color:#435c4b}
.hud b{color:#245d45}
.rule-text{flex:1;text-align:center;color:#314d3c;font-size:1.15em;padding:0 .8em}
.game .seq-card { background:#fafff8; border-color:#9cb49b; color:#284735; }
.game .seq-card.blank { background:#fff1d3; border-color:#bc8c43; color:#744c16; }
.game .seq-card.filled.correct { background:#dcf4e3; border-color:#2c7b51; color:#1b5b3b; }
.game .seq-card.filled.wrong { background:#f9e4e5; border-color:#b75b60; color:#8c2639; }
.game-body{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:1.8em;width:100%;padding-bottom:1em;
}
.opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:1em;width:min(28em,80%)}
.opt-btn{
  display:flex;align-items:center;justify-content:center;
  min-height:3.2em;padding:.6em;border:2px solid #6a8ec4;
  border-radius:.7em;background:#fafff8;color:#284735;
  box-shadow:0 2px 6px rgba(0,0,0,.35);
  cursor:pointer;font-size:1.5em;font-weight:bold;transition:.15s;
}
.opt-btn:hover:not(:disabled){background:#e5f3e1;border-color:#7ba182}
.opt-btn.correct{border-color:#2c7b51;background:#dcf4e3;color:#1b5b3b}
.opt-btn.wrong{border-color:#b75b60;background:#f9e4e5;color:#8c2639}
.opt-btn:disabled{cursor:default}

/* blocks (levels 4-6) */
.blocks{
  display:grid;
  grid-template-columns:repeat(5, .55em);
  gap:.16em;
  justify-content:center;
  align-content:center;
}
.blk{
  width:.55em;height:.55em;background:#f39c12;border-radius:.1em;
  box-shadow:0 1px 2px rgba(0,0,0,.4);
}
.blocks.g7{grid-template-columns:repeat(7, .42em);gap:.13em}
.blocks.g7 .blk{width:.42em;height:.42em}
.opt-btn .blocks{grid-template-columns:repeat(5, .65em);gap:.18em}
.opt-btn .blocks .blk{width:.65em;height:.65em}
.opt-btn .blocks.g7{grid-template-columns:repeat(7, .5em);gap:.15em}
.opt-btn .blocks.g7 .blk{width:.5em;height:.5em}
.opt-card.blocks-opt{padding:.6em .8em;min-height:2.6em;display:flex;align-items:center;justify-content:center}

/* result */
.stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1em;width:min(36em,92%)}
.stat{background:#1a2a40;border-radius:.7em;padding:1.2em;text-align:center}
.stat span{display:block;color:#aaa;font-size:1em;margin-bottom:.5em}
.stat strong{font-size:1.9em;color:#5b8dee}

body { background: #0f2744; color: #e8f4fd; }

/* secondary (skip) button — muted grey */
.btn.secondary{background:#4a5568;color:#e2e8f0}
.btn.secondary:hover:not(:disabled){background:#5a6578}

/* ---------- 竖屏适配（手机 / web-view） ---------- */
@media (orientation: portrait) {
  #app{
    font-size: clamp(15px, 4vmin, 26px);
  }
  .lang-btn{
    top: calc(.6em + env(safe-area-inset-top));
    right: 1em;
    font-size: max(3.2vmin, 14px);
    padding:.5em 1em;
  }

  /* home */
  .screen{padding: calc(1em + env(safe-area-inset-top)) 1em calc(1em + env(safe-area-inset-bottom))}
  .home h1{font-size: max(7.5vmin, 26px); text-align:center; margin-bottom:.5em}
  .home .sub{font-size: max(3.8vmin, 15px); text-align:center; margin-bottom:1.6em}
  .dur-title{font-size: max(4.5vmin, 18px); text-align:center}
  .btn-col{width: 82%; gap:.9em}
  .btn{
    padding:.9em 1.4em; border-radius:1em;
    font-size: max(4vmin, 16px);
  }
  .btn.lg{padding:1em 1.6em; font-size: max(4.6vmin, 18px); border-radius:1.1em}
  .btn.sm{padding:.55em 1em; font-size: max(3.6vmin, 14px); border-radius:.8em}
  .btn-row{gap:.7em}

  /* overlay / modal */
  .modal{
    min-width: 0; width: 90vw; max-width: 92vw; max-height: 85vh;
    padding: 1.4em 1.2em; border-radius:1.1em;
  }
  .modal.wide{min-width: 0; width: 92vw; max-width: 94vw}
  .modal.small{min-width: 0; width: 82vw}
  .modal.tutorial{min-width: 0; width: 92vw}
  .modal h2{font-size: max(5vmin, 20px); margin-bottom:.8em}
  .rule-note{font-size: max(3.4vmin, 13px)}
  .confirm-text{font-size: max(4vmin, 15px)}
  .confirm-row{flex-direction: column-reverse; gap:.7em}
  .confirm-row .btn{width:100%}

  /* tables → card-ish stacking for rules & history */
  table{font-size: max(3.2vmin, 12px)}
  th,td{padding:.4em .35em}
  .tbl-wrap{overflow-x:auto; -webkit-overflow-scrolling:touch}

  /* tutorial */
  .tut-nav{gap:.55em}
  .opts-row{gap:.6em}
  .opt-card{padding:.55em .9em; min-width:2.8em; font-size: max(3.8vmin, 15px)}

  /* seq cards */
  .seq-row{gap:.55em}
  .seq-row.big{gap:.7em}
  .seq-card{
    min-width: max(11vmin, 46px);
    min-height: max(11vmin, 46px);
    font-size: max(5vmin, 20px);
    border-radius:.6em;
  }
  .seq-row.big .seq-card{
    min-width: max(13vmin, 52px);
    min-height: max(13vmin, 52px);
    font-size: max(6vmin, 22px);
  }
  .blocks{max-width: max(9vmin, 38px); gap:.1em}
  .blk{width: max(1.6vmin, 6px); height: max(1.6vmin, 6px)}
  .opt-btn .blocks{max-width: max(13vmin, 54px)}
  .opt-btn .blk{width: max(2vmin, 8px); height: max(2vmin, 8px)}

  /* game */
  .game{padding: calc(.6em + env(safe-area-inset-top)) .8em calc(1em + env(safe-area-inset-bottom))}
  .game-header{
    flex-wrap: wrap;
    padding:.7em .9em;
    padding-top: calc(.7em + env(safe-area-inset-top));
    gap:.5em;
    margin-bottom:.9em;
    border-radius:.7em;
  }
  .hud{
    order:1; width:100%;
    gap:.9em; justify-content:space-between;
    font-size: max(3.6vmin, 13px);
    flex-wrap:wrap;
  }
  .rule-text{
    order:3; width:100%; flex:none;
    text-align:center; padding:.2em 0;
    font-size: max(3.6vmin, 13px);
  }
  .skip-btn{order:2}
  .game-header > .btn.warn{order:2}

  .game-body{gap:1.1em; padding-bottom:.6em}
  .opts-grid{
    grid-template-columns: 1fr 1fr;
    gap:.7em; width: 94%;
  }
  .opt-btn{
    min-height: max(11vmin, 52px);
    padding:.5em;
    font-size: max(5vmin, 20px);
    border-radius:.7em;
  }

  /* result */
  .stats-grid{
    grid-template-columns: 1fr 1fr;
    gap:.7em; width: 94%;
  }
  .stat{padding:.9em .6em; border-radius:.7em}
  .stat span{font-size: max(3.2vmin, 12px); margin-bottom:.3em}
  .stat strong{font-size: max(5.6vmin, 22px)}
}
</style>
