<template>
  <div id="app" :style="rootStyle">
    <!-- ================= HOME ================= -->
    <transition name="fade">
    <div v-if="view==='home'" class="page home" key="home">
      <div class="bg-orbs"><div class="orb o1"/><div class="orb o2"/><div class="orb o3"/></div>
      <button class="lang-btn glass" @click="toggleLang">
        <span class="lang-dot"/> {{ lang==='cn' ? 'EN' : '中' }}
      </button>
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 64 64" width="1em" height="1em">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#7ee8fa"/>
                <stop offset="100%" stop-color="#eec0c6"/>
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="26" fill="none" stroke="url(#lg1)" stroke-width="4"/>
            <path d="M20 40 Q 32 12 44 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <circle cx="32" cy="34" r="4" fill="#fff"/>
          </svg>
        </div>
        <div>
          <h1 class="title">{{ t('title') }}</h1>
          <p class="subtitle">{{ t('subtitle') }}</p>
        </div>
      </div>
      <div class="menu">
        <button class="cta cta-primary" @click="startFlow">
          <span class="cta-ico">▶</span>
          <span class="cta-txt">{{ t('start') }}</span>
        </button>
        <button class="cta cta-ghost" @click="view='rules'">
          <span class="cta-ico">📖</span>
          <span class="cta-txt">{{ t('rules') }}</span>
        </button>
        <button class="cta cta-ghost" @click="loadHistory(); view='history'">
          <span class="cta-ico">📊</span>
          <span class="cta-txt">{{ t('history') }}</span>
        </button>
      </div>
      <div class="foot-hint">{{ t('foot') }}</div>
    </div>
    </transition>

    <!-- ================= RULES ================= -->
    <transition name="fade">
    <div v-if="view==='rules'" class="page panel" key="rules">
      <div class="card wide">
        <div class="card-head">
          <h2>{{ t('rules') }}</h2>
          <button class="icon-btn" @click="view='home'" :aria-label="t('back')">✕</button>
        </div>
        <div class="rules-body">
          <div class="rule-item"><span class="badge b1">1</span><p>{{ t('rule1') }}</p></div>
          <div class="rule-item"><span class="badge b2">2</span><p>{{ t('rule2') }}</p></div>
          <div class="rule-item"><span class="badge b3">3</span><p>{{ t('rule3') }}</p></div>
          <div class="diff-table">
            <div class="dt-head">
              <div>{{ t('lv') }}</div><div>{{ t('consist') }}</div><div>{{ t('cnum') }}</div><div>{{ t('tlimit') }}</div><div>{{ t('coef') }}</div>
            </div>
            <div class="dt-row" v-for="d in DIFF" :key="d.level">
              <div><span class="lv-chip" :class="'lv'+d.level">L{{ d.level }}</span></div>
              <div>
                <span class="tag" :class="d.consistent?'ok':'no'">{{ d.consistent ? t('yes') : t('no') }}</span>
              </div>
              <div>{{ d.count }}</div>
              <div>{{ d.time }}s</div>
              <div>×{{ d.coef }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </transition>

    <!-- ================= HISTORY ================= -->
    <transition name="fade">
    <div v-if="view==='history'" class="page panel" key="history">
      <div class="card wide">
        <div class="card-head">
          <h2>{{ t('history') }}</h2>
          <button class="icon-btn" @click="view='home'" :aria-label="t('back')">✕</button>
        </div>
        <div class="hist-wrap">
          <div v-if="!history.length" class="empty">
            <div class="empty-ico">📭</div>
            <div>{{ t('nohist') }}</div>
          </div>
          <div v-else class="hist-list">
            <div class="hist-card" v-for="(h,i) in history" :key="i">
              <div class="hc-head">
                <div class="hc-time">{{ h.time }}</div>
                <div class="hc-score">{{ h.score }}<span>pt</span></div>
              </div>
              <div class="hc-stats">
                <div><span>{{ t('h_lv') }}</span><b>L{{ h.level }}</b></div>
                <div><span>{{ t('h_dur') }}</span><b>{{ h.duration }}s</b></div>
                <div><span>{{ t('h_tot') }}</span><b>{{ h.total }}</b></div>
                <div><span>{{ t('h_ok') }}</span><b class="ok">{{ h.correct }}</b></div>
                <div><span>{{ t('h_fail') }}</span><b class="no">{{ h.wrong }}</b></div>
                <div><span>{{ t('h_rate') }}</span><b>{{ h.rate }}%</b></div>
                <div><span>{{ t('h_rt') }}</span><b>{{ h.avgRt }}ms</b></div>
              </div>
              <div class="hc-bar"><div :style="{width: h.rate+'%'}" class="hc-bar-fill"/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </transition>

    <!-- ================= TUTORIAL ================= -->
    <transition name="fade">
    <div v-if="view==='tutorial'" class="page panel tutorial-page" key="tutorial">
      <div class="card mid">
        <div class="card-head">
          <h2>{{ t('tutorial') }}</h2>
          <div class="steps-dots">
            <span v-for="(s,i) in tutorSteps" :key="i" class="dot" :class="{on: i===tutorStep}"/>
          </div>
        </div>
        <div class="tutor-demo">
          <div class="demo-scene">
            <div class="demo-word" :style="{ color: tutorSteps[tutorStep].fontColor }">
              {{ tutorSteps[tutorStep].word }}
            </div>
            <div class="demo-audio">
              <span class="sound-wave"><i/><i/><i/><i/><i/></span>
              <span class="heard">{{ tutorSteps[tutorStep].heard }}</span>
            </div>
          </div>
          <div class="demo-hint">{{ tutorSteps[tutorStep].hint }}</div>
          <div class="demo-actions">
            <span class="chip ok" :class="{active: tutorSteps[tutorStep].answer==='yes'}">✔ {{ t('same') }}</span>
            <span class="chip no" :class="{active: tutorSteps[tutorStep].answer==='no'}">✘ {{ t('diff') }}</span>
          </div>
        </div>
        <div class="tutor-nav">
          <button class="btn ghost" :disabled="tutorStep===0" @click="tutorStep--">← {{ t('prev') }}</button>
          <button class="btn text" @click="onTutorialDone">{{ t('skip') }}</button>
          <button class="btn primary" v-if="tutorStep<tutorSteps.length-1" @click="tutorStep++">{{ t('next') }} →</button>
          <button class="btn primary" v-else @click="onTutorialDone">{{ t('done') }} →</button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ================= DURATION ================= -->
    <transition name="fade">
    <div v-if="view==='duration'" class="page panel" key="duration">
      <div class="card mid">
        <div class="card-head">
          <h2>{{ t('choose_dur') }}</h2>
          <button class="icon-btn" @click="view='home'" :aria-label="t('back')">✕</button>
        </div>
        <div class="dur-grid">
          <button
            v-for="opt in DURATION_OPTS" :key="opt.val"
            class="dur-card"
            :class="{sel: pickedDur===opt.val}"
            @click="pickedDur=opt.val">
            <div class="dur-mins">{{ opt.mins }}</div>
            <div class="dur-unit">{{ t('min') }}</div>
            <div class="dur-desc">{{ t(opt.desc) }}</div>
          </button>
        </div>
        <div class="dur-actions">
          <button class="btn ghost" @click="view='home'">← {{ t('back') }}</button>
          <button class="btn primary large" :disabled="!pickedDur" @click="beginGame(pickedDur)">
            {{ t('confirm_start') }} →
          </button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ================= GAME ================= -->
    <transition name="fade">
    <div v-if="view==='game'" class="page game" key="game">
      <div class="topbar">
        <div class="hud">
          <div class="hud-item">
            <div class="hud-lbl">{{ t('lv') }}</div>
            <div class="hud-val"><span class="lv-chip" :class="'lv'+level">L{{ level }}</span></div>
          </div>
          <div class="hud-item">
            <div class="hud-lbl">{{ t('score') }}</div>
            <div class="hud-val">{{ score }}</div>
          </div>
          <div class="hud-item">
            <div class="hud-lbl">{{ t('remain') }}</div>
            <div class="hud-val mono">{{ fmtTime(remain) }}</div>
          </div>
        </div>
        <div class="rule-pill">
          <span>{{ t('rule1') }}</span>
        </div>
        <div class="topbar-actions">
          <button v-if="showBatchSkip" class="btn skip-batch" type="button" @click="onBatchSkip">
            ⏭ {{ t('skip_game') }}
          </button>
          <button class="icon-btn round" @click="pauseAsk" :aria-label="t('back')">
            <span>⏸</span>
          </button>
        </div>
      </div>

      <div class="progress-track"><div class="progress-fill" :style="{width: progressPct+'%'}"/></div>

      <div class="stage">
        <div class="stimulus-wrap">
          <div v-if="!canAnswer && audioPlaying" class="listen-hint">
            <span class="sound-wave big"><i/><i/><i/><i/><i/></span>
            <span>{{ t('listening') }}</span>
          </div>
          <div v-if="current" class="stimulus" :class="{ready: canAnswer}">
            <div class="stimulus-word" :style="{ color: current.fontColor }">
              {{ current.displayText }}
            </div>
          </div>
        </div>

        <div class="q-timer-ring">
          <svg viewBox="0 0 60 60" width="4em" height="4em">
            <circle cx="30" cy="30" r="26" class="ring-bg"/>
            <circle cx="30" cy="30" r="26" class="ring-fg"
              :stroke-dasharray="163.36" :stroke-dashoffset="ringOffset"/>
          </svg>
          <div class="q-timer-txt">{{ qRemain }}</div>
        </div>

        <div class="answers">
          <button class="ans-btn ok" @click="answer(true)" :disabled="!canAnswer">
            <span class="ab-ico">✔</span>
            <span class="ab-txt">{{ t('same') }}</span>
            <span class="ab-kbd">A</span>
          </button>
          <button class="ans-btn no" @click="answer(false)" :disabled="!canAnswer">
            <span class="ab-ico">✘</span>
            <span class="ab-txt">{{ t('diff') }}</span>
            <span class="ab-kbd">L</span>
          </button>
        </div>

        <transition name="pop">
          <div v-if="feedback" class="feedback" :class="feedback.type">
            <div class="fb-icon">{{ feedback.type==='ok' ? '✔' : '✘' }}</div>
            <div class="fb-text">{{ feedback.text }}</div>
          </div>
        </transition>

        <transition name="pop">
          <div v-if="levelToast" class="level-toast" :class="levelToast.dir">
            <span>{{ levelToast.dir==='up' ? '▲' : '▼' }}</span>
            <b>{{ t(levelToast.dir==='up'?'lv_up':'lv_down') }} L{{ level }}</b>
          </div>
        </transition>
      </div>

      <transition name="fade">
      <div v-if="paused" class="modal">
        <div class="modal-box card">
          <div class="modal-icon">⏸</div>
          <h3>{{ t('paused_q') }}</h3>
          <p class="modal-sub">{{ t('paused_sub') }}</p>
          <div class="modal-btns">
            <button class="btn ghost" @click="abortLeave">{{ t('quit') }}</button>
            <button class="btn primary" @click="resumeGame">{{ t('resume') }}</button>
          </div>
        </div>
      </div>
      </transition>
    </div>
    </transition>

    <!-- ================= RESULT ================= -->
    <transition name="fade">
    <div v-if="view==='result'" class="page panel" key="result">
      <div class="card mid">
        <div class="result-head">
          <div class="result-trophy">🏆</div>
          <h2>{{ t('result') }}</h2>
          <p class="result-sub">{{ t('result_sub') }}</p>
        </div>
        <div class="result-score">
          <span class="rs-val">{{ session.score }}</span>
          <span class="rs-unit">{{ t('score') }}</span>
        </div>
        <div class="result-grid">
          <div class="rg-item"><div class="rg-lbl">{{ t('h_tot') }}</div><div class="rg-val">{{ session.total }}</div></div>
          <div class="rg-item ok"><div class="rg-lbl">{{ t('h_ok') }}</div><div class="rg-val">{{ session.correct }}</div></div>
          <div class="rg-item no"><div class="rg-lbl">{{ t('h_fail') }}</div><div class="rg-val">{{ session.wrong }}</div></div>
          <div class="rg-item"><div class="rg-lbl">{{ t('h_rate') }}</div><div class="rg-val">{{ session.rate }}%</div></div>
          <div class="rg-item"><div class="rg-lbl">{{ t('h_rt') }}</div><div class="rg-val">{{ session.avgRt }}<span>ms</span></div></div>
          <div class="rg-item"><div class="rg-lbl">{{ t('h_lv') }}</div><div class="rg-val">L{{ level }}</div></div>
        </div>
        <div class="result-actions">
          <button class="btn ghost" @click="view='home'">🏠 {{ t('home') }}</button>
          <button class="btn primary" @click="startFlow">↻ {{ t('again') }}</button>
        </div>
      </div>
    </div>
    </transition>
  </div>
</template>

<script>
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import { resolveVoice } from './assets'

const GAME_TYPE = 'stct'

const COLORS = ['red','yellow','blue','green','black','white','purple']
const COLOR_HEX = {
  red:'#ef4444', yellow:'#eab308', blue:'#3b82f6', green:'#22c55e',
  black:'#111827', white:'#f9fafb', purple:'#a855f7'
}
const CN_MAP = { red:'红', yellow:'黄', blue:'蓝', green:'绿', black:'黑', white:'白', purple:'紫' }
const EN_MAP = { red:'Red', yellow:'Yellow', blue:'Blue', green:'Green', black:'Black', white:'White', purple:'Purple' }

const DIFF = [
  { level:1, consistent:true,  count:2, time:10, coef:1   },
  { level:2, consistent:true,  count:2, time:7,  coef:1.5 },
  { level:3, consistent:true,  count:3, time:5,  coef:2   },
  { level:4, consistent:false, count:3, time:10, coef:2.5 },
  { level:5, consistent:false, count:4, time:7,  coef:3   },
  { level:6, consistent:false, count:4, time:5,  coef:3.5 },
]

const DURATION_OPTS = [
  { val: 60,  mins: 1, desc: 'dur_quick' },
  { val: 180, mins: 3, desc: 'dur_normal' },
  { val: 300, mins: 5, desc: 'dur_deep' },
]

const I18N = {
  cn: {
    title:'视听冲突', subtitle:'视听双任务认知训练',
    foot:'Cognitive Training · v1.0',
    start:'开始训练', rules:'规则介绍', history:'训练记录',
    back:'返回', tutorial:'新手教程', prev:'上一步', next:'下一步', skip:'跳过教程', done:'开始训练',
    choose_dur:'选择训练时长', min:'分钟', confirm_start:'开始训练',
    dur_quick:'快速体验', dur_normal:'标准训练', dur_deep:'深度训练',
    lv:'难度', score:'得分', remain:'剩余', same:'一致', diff:'不一致',
    paused_q:'训练已暂停', paused_sub:'点击继续恢复训练，或结束返回主页', resume:'继续训练', quit:'结束返回',
    skip_game:'跳过游戏',
    result:'训练完成', result_sub:'本次训练已完成，继续保持！', home:'返回主页', again:'再来一局',
    consist:'字体一致', cnum:'颜色数', tlimit:'时限', coef:'系数',
    yes:'一致', no:'不一致',
    rule1:'请判断听到的颜色词与屏幕上的颜色词是否一致',
    rule2:'每 60 秒统计正确率：>90% 难度升级，<70% 难度降低',
    rule3:'得分 = 5 × 当前难度系数（每答对一题）',
    h_time:'时间', h_lv:'难度', h_dur:'时长', h_tot:'总数', h_ok:'成功', h_fail:'失败',
    h_rate:'成功率', h_rt:'平均反应', h_score:'得分', nohist:'暂无训练记录',
    listening:'请听语音…',
    lv_up:'难度升级', lv_down:'难度降低',
    correct_fb:'回答正确', wrong_fb:'回答错误', timeout_fb:'超时未答',
  },
  en: {
    title:'Audio-Visual Conflict', subtitle:'Audio-Visual Dual-Task Cognitive Training',
    foot:'Cognitive Training · v1.0',
    start:'Start Training', rules:'Rules', history:'History',
    back:'Back', tutorial:'Tutorial', prev:'Prev', next:'Next', skip:'Skip', done:'Start',
    choose_dur:'Choose Duration', min:'min', confirm_start:'Start Training',
    dur_quick:'Quick', dur_normal:'Standard', dur_deep:'Extended',
    lv:'Level', score:'Score', remain:'Time', same:'Match', diff:'Differ',
    paused_q:'Training Paused', paused_sub:'Resume to continue or quit to return', resume:'Resume', quit:'Quit',
    skip_game:'Skip Game',
    result:'Session Complete', result_sub:'Great job — keep it up!', home:'Home', again:'Play Again',
    consist:'Font consistent', cnum:'Colors', tlimit:'Limit', coef:'Coef',
    yes:'Match', no:'Differ',
    rule1:'Judge whether the spoken color word matches the color word on screen',
    rule2:'Accuracy is checked every 60s: >90% level up, <70% level down',
    rule3:'Score = 5 × difficulty coefficient per correct answer',
    h_time:'Time', h_lv:'Level', h_dur:'Duration', h_tot:'Total', h_ok:'OK', h_fail:'Fail',
    h_rate:'Rate', h_rt:'Avg RT', h_score:'Score', nohist:'No records yet',
    listening:'Listening…',
    skip_q:'Skip',
    lv_up:'Level Up', lv_down:'Level Down',
    correct_fb:'Correct', wrong_fb:'Wrong', timeout_fb:'Time out',
  }
}

export default {
  name: 'App',
  data(){
    return {
      lang: 'cn',
      view: 'home',
      DIFF, DURATION_OPTS,
      tutorStep: 0,
      pickedDur: null,
      // game state
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      remain: 0,
      duration: 60,
      qRemain: 0,
      current: null,
      canAnswer: false,
      audioPlaying: false,
      paused: false,
      feedback: null,
      levelToast: null,
      // stats window
      winCorrect: 0,
      winTotal: 0,
      winStart: 0,
      // session totals
      session: { score:0, total:0, correct:0, wrong:0, rate:0, avgRt:0 },
      rtSum: 0,
      qStartAt: 0,
      history: [],
      // scale
      scale: 1,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created(){
    this._mainTimer = null
    this._qTimer = null
    this._audioEls = []
    this._levelChangedForNext = false
    this._curDiffTime = 10
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed:{
    rootStyle(){ return { fontSize: (16*this.scale)+'px' } },
    progressPct(){ return this.duration ? ((this.duration-this.remain)/this.duration*100) : 0 },
    ringOffset(){
      const C = 2*Math.PI*26
      const total = this._curDiffTime || 10
      return C * (1 - this.qRemain/total)
    },
    tutorSteps(){
      const w = this.lang==='cn' ? CN_MAP : EN_MAP
      return [
        { word: w.red, fontColor: COLOR_HEX.red, heard: w.red,
          hint: this.lang==='cn'?'屏幕："红"，听到："红" → 一致':'Screen: Red, Heard: Red → Match',
          answer: 'yes' },
        { word: w.blue, fontColor: COLOR_HEX.blue, heard: w.green,
          hint: this.lang==='cn'?'屏幕："蓝"，听到："绿" → 不一致':'Screen: Blue, Heard: Green → Differ',
          answer: 'no' },
        { word: w.yellow, fontColor: COLOR_HEX.purple, heard: w.yellow,
          hint: this.lang==='cn'?'注意：以文字含义为准，不以颜色为准':'Note: judge by the WORD meaning, not the ink color',
          answer: 'yes' },
      ]
    }
  },
  mounted(){
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    window.addEventListener('keydown', this.onKey)
    this.loadHistory()
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: function (dur) { this.pickedDur = dur; this.duration = dur }.bind(this),
      openTutorial: function () { this.tutorStep = 0; this.view = 'tutorial' }.bind(this),
    })
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.updateScale)
    window.removeEventListener('keydown', this.onKey)
    this.clearTimers()
  },
  methods:{
    t(k){ return (I18N[this.lang] && I18N[this.lang][k]) || k },
    toggleLang(){ this.lang = this.lang==='cn' ? 'en' : 'cn' },
    onTutorialDone(){
      if (afterBatchTutorial(GAME_TYPE, function (dur) { this.beginGame(dur) }.bind(this))) return
      this.view = 'duration'
    },
    onBatchSkip(){ skipPbBatchGame() },
    fmtTime(s){
      s = Math.max(0,s|0)
      const m = String(Math.floor(s/60)).padStart(2,'0')
      const r = String(s%60).padStart(2,'0')
      return `${m}:${r}`
    },
    onKey(e){
      if (this.view!=='game' || !this.canAnswer) return
      if (e.key==='a' || e.key==='A') this.answer(true)
      else if (e.key==='l' || e.key==='L') this.answer(false)
    },
    updateScale(){
      const w = window.innerWidth, h = window.innerHeight
      this.scale = Math.min(w/1280, h/720)
      if (this.scale < 0.4) this.scale = 0.4
    },
    startFlow(){ this.tutorStep = 0; this.pickedDur = null; this.view='tutorial' },

    // ============= game flow =============
    beginGame(dur){
      this.duration = dur
      this.remain = dur
      this.score = 0
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.winCorrect = 0; this.winTotal = 0; this.winStart = 0
      this.session = { score:0, total:0, correct:0, wrong:0, rate:0, avgRt:0 }
      this.rtSum = 0
      this.view = 'game'
      this.paused = false
      this.feedback = null
      this.levelToast = null
      this.$nextTick(()=>{
        this.startMainTimer()
        this.nextQuestion(true)
      })
    },
    startMainTimer(){
      this.clearTimers()
      this._mainTimer = setInterval(()=>{
        if (this.paused) return
        this.remain--
        const elapsed = this.duration - this.remain
        if (elapsed - this.winStart >= 60){ this.evaluateWindow() }
        if (this.remain <= 0){ this.endGame() }
      }, 1000)
    },
    evaluateWindow(){
      let changed = null
      if (this.winTotal > 0){
        const rate = this.winCorrect / this.winTotal
        if (rate > 0.9 && this.level < 6){ this.level++; changed = 'up' }
        else if (rate < 0.7 && this.level > 1){ this.level--; changed = 'down' }
      }
      this.winCorrect = 0; this.winTotal = 0
      this.winStart = this.duration - this.remain
      this._levelChangedForNext = !!changed
      if (changed){
        this.levelToast = { dir: changed }
        setTimeout(()=>{ this.levelToast = null }, 1600)
      }
    },
    curDiff(){ return DIFF[this.level-1] },
    randPick(arr,n){
      const a = arr.slice()
      const out = []
      for (let i=0;i<n && a.length;i++){
        const idx = Math.floor(Math.random()*a.length)
        out.push(a.splice(idx,1)[0])
      }
      return out
    },
    nextQuestion(forcePreamble=false){
      const d = this.curDiff()
      this._curDiffTime = d.time
      const pool = this.randPick(COLORS, d.count)
      const displayed = pool[Math.floor(Math.random()*pool.length)]
      let fontColorName
      if (d.consistent) fontColorName = displayed
      else {
        const rest = pool.filter(c=>c!==displayed)
        fontColorName = rest[Math.floor(Math.random()*rest.length)] || displayed
      }
      const shouldMatch = Math.random() < 0.5
      const spoken = shouldMatch ? displayed : (pool.filter(c=>c!==displayed)[Math.floor(Math.random()*(pool.length-1))] || displayed)

      const w = this.lang==='cn' ? CN_MAP : EN_MAP
      this.current = {
        displayText: w[displayed],
        fontColor: COLOR_HEX[fontColorName],
        displayed, spoken,
        expected: displayed === spoken,
      }
      this.canAnswer = false
      this.qRemain = d.time
      const playPreamble = forcePreamble || this._levelChangedForNext
      this._levelChangedForNext = false
      this.playSequence(playPreamble, spoken)
    },
    playSequence(withPreamble, colorName){
      this.stopAudio()
      this.audioPlaying = true
      const folder = this.lang === 'cn' ? 'chinese' : 'english'
      const seq = []
      if (withPreamble) seq.push(resolveVoice('/voice/' + folder + '/1.mp3'))
      seq.push(resolveVoice('/voice/' + folder + '/' + colorName + '.mp3'))
      let i = 0
      const playNext = ()=>{
        if (i>=seq.length){
          this.audioPlaying = false
          this.canAnswer = true
          this.qStartAt = Date.now()
          clearInterval(this._qTimer)
          this._qTimer = setInterval(()=>{
            if (this.paused) return
            this.qRemain--
            if (this.qRemain <= 0){ this.timeout() }
          }, 1000)
          return
        }
        const a = new Audio(seq[i])
        this._audioEls.push(a)
        a.onended = ()=>{ i++; playNext() }
        a.onerror = ()=>{ i++; playNext() }
        a.play().catch(()=>{ i++; playNext() })
      }
      playNext()
    },
    stopAudio(){
      this._audioEls.forEach(a=>{ try{ a.pause() }catch(e){} })
      this._audioEls = []
      this.audioPlaying = false
    },
    answer(userSaysMatch){
      if (!this.canAnswer || !this.current) return
      const rt = Date.now() - this.qStartAt
      const correct = userSaysMatch === this.current.expected
      this.session.total++
      this.winTotal++
      this.rtSum += rt
      if (correct){
        this.session.correct++
        this.winCorrect++
        this.score += 5 * this.curDiff().coef
      } else {
        this.session.wrong++
      }
      this.canAnswer = false
      clearInterval(this._qTimer)
      this.feedback = { type: correct?'ok':'no', text: this.t(correct?'correct_fb':'wrong_fb') }
      setTimeout(()=>{
        this.feedback = null
        if (this.view==='game' && !this.paused) this.nextQuestion(false)
      }, 900)
    },
    timeout(){
      if (!this.current) return
      this.session.total++
      this.session.wrong++
      this.winTotal++
      this.canAnswer = false
      clearInterval(this._qTimer)
      this.feedback = { type:'no', text: this.t('timeout_fb') }
      setTimeout(()=>{
        this.feedback = null
        if (this.view==='game' && !this.paused) this.nextQuestion(false)
      }, 900)
    },
    pauseAsk(){ this.paused = true; this.stopAudio() },
    resumeGame(){
      this.paused = false
      this.nextQuestion(false)
    },
    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    abortLeave(){
      this.clearTimers() // 停止主/题目计时
      this.stopAudio() // 停止语音
      this.paused = false // 解除暂停态
      leavePbGameWindow({ confirm: false })
    },
    /**
     * <summary>
     * 倒计时结束：汇总成绩并上传训练记录
     * </summary>
     */
    endGame(){
      this.clearTimers()
      this.stopAudio()
      const s = this.session
      s.score = Math.round(this.score)
      s.rate = s.total ? Math.round(100*s.correct/s.total) : 0
      s.avgRt = s.total ? Math.round(this.rtSum/s.total) : 0
      const trainDuration = this.duration
      this.saveHistory({
        time: this.nowStr(),
        level: this.level,
        duration: trainDuration,
        total: s.total, correct: s.correct, wrong: s.wrong,
        rate: s.rate, avgRt: s.avgRt, score: s.score,
      })
      const avgRaw = s.avgRt
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: avgRaw != null && Number(avgRaw) >= 1000
          ? msToPbGameSeconds(avgRaw)
          : toPbGameSeconds(avgRaw),
        score: s.score || 0,
        successCount: s.correct || 0,
        failCount: s.wrong || 0,
        trainDuration: trainDuration || this.duration,
        difficultyLevel: this.level || 1,
      })
      this.paused = false
      this.view = 'result'
    },
    clearTimers(){
      clearInterval(this._mainTimer); this._mainTimer=null
      clearInterval(this._qTimer); this._qTimer=null
    },
    nowStr(){
      const d = new Date()
      const p = n=>String(n).padStart(2,'0')
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    loadHistory(){
      try { this.history = JSON.parse(localStorage.getItem('g23_history')||'[]') } catch(e){ this.history=[] }
    },
    saveHistory(rec){
      this.loadHistory()
      this.history.unshift(rec)
      if (this.history.length>100) this.history = this.history.slice(0,100)
      localStorage.setItem('g23_history', JSON.stringify(this.history))
    }
  }
}
</script>

<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body, #app { width:100%; height:100%; overflow:hidden; font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif; -webkit-font-smoothing: antialiased; }
body {
  background:
    radial-gradient(1200px 800px at 10% 10%, rgba(99,102,241,0.35), transparent 60%),
    radial-gradient(1000px 700px at 90% 30%, rgba(236,72,153,0.25), transparent 60%),
    radial-gradient(900px 700px at 50% 100%, rgba(56,189,248,0.28), transparent 60%),
    linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color:#f8fafc;
}
button { font-family:inherit; }

.page { width:100%; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2vh; position:relative; }
.panel { gap:1em; }

/* ====== transitions ====== */
.fade-enter-active,.fade-leave-active { transition: opacity .35s ease, transform .35s ease; }
.fade-enter,.fade-leave-to { opacity:0; transform: translateY(8px); }
.pop-enter-active,.pop-leave-active { transition: transform .3s ease, opacity .3s ease; }
.pop-enter,.pop-leave-to { opacity:0; transform: scale(.85); }

/* ====== bg orbs ====== */
.bg-orbs { position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:0; }
.orb { position:absolute; border-radius:50%; filter: blur(60px); opacity:0.55; animation: float 14s ease-in-out infinite; }
.orb.o1 { width:22em; height:22em; background:#6366f1; top:-6em; left:-6em; }
.orb.o2 { width:20em; height:20em; background:#ec4899; bottom:-6em; right:-4em; animation-delay:-6s; }
.orb.o3 { width:16em; height:16em; background:#22d3ee; top:40%; left:50%; animation-delay:-3s; }
@keyframes float {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(2em,-1em) scale(1.05); }
}

/* ====== glass / card ====== */
.glass, .card {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 10px 40px rgba(0,0,0,0.35);
}
.card { padding: 2em; border-radius: 1.4em; z-index:1; width:min(50em,92vw); }
.card.wide { width:min(70em,94vw); max-height:88vh; display:flex; flex-direction:column; }
.card.mid { width:min(64em,94vw); }
.card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2em; }
.card-head h2 { font-size:1.6em; letter-spacing:0.05em; }

/* ====== home ====== */
.home { justify-content:center; align-items:center; gap:2em; z-index:1; }
.brand { display:flex; align-items:center; gap:1em; z-index:1; }
.brand-logo { font-size:4em; line-height:1; filter: drop-shadow(0 6px 16px rgba(120,140,255,0.5)); }
.title { font-size:2.6em; font-weight:800; letter-spacing:0.06em; background: linear-gradient(90deg,#a5b4fc,#f0abfc,#7dd3fc); -webkit-background-clip:text; background-clip:text; color:transparent; }
.subtitle { font-size:1em; opacity:0.7; margin-top:0.2em; letter-spacing:0.1em; }
.menu { display:flex; flex-direction:column; gap:0.9em; width:min(24em,80vw); z-index:1; }
.cta {
  display:flex; align-items:center; gap:0.9em; padding:1em 1.4em;
  font-size:1.15em; font-weight:600; border:none; border-radius:0.9em; cursor:pointer;
  transition: transform .15s ease, box-shadow .2s ease;
  color:#fff;
}
.cta-ico { font-size:1.2em; width:1.6em; height:1.6em; display:inline-flex; align-items:center; justify-content:center; border-radius:0.5em; background: rgba(255,255,255,0.14); }
.cta-txt { flex:1; text-align:left; }
.cta:hover { transform: translateY(-2px); }
.cta-primary {
  background: linear-gradient(135deg,#6366f1,#8b5cf6 55%,#ec4899);
  box-shadow: 0 8px 24px rgba(139,92,246,0.45);
}
.cta-primary:hover { box-shadow: 0 12px 32px rgba(139,92,246,0.6); }
.cta-ghost { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); }
.cta-ghost:hover { background: rgba(255,255,255,0.14); }

.lang-btn { position:absolute; top:1.5em; right:1.5em; padding:0.7em 1.4em; border:none; border-radius:2em; color:#fff; cursor:pointer; display:flex; align-items:center; gap:0.6em; font-weight:600; font-size:1.1em; letter-spacing:0.05em; z-index:2; transition: transform .15s ease, background .2s; }
.lang-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.18); }
.lang-dot { width:0.6em; height:0.6em; border-radius:50%; background:#22d3ee; box-shadow: 0 0 10px #22d3ee; }
.foot-hint { position:absolute; bottom:1.5em; font-size:0.85em; opacity:0.5; letter-spacing:0.2em; z-index:1; }

/* ====== buttons ====== */
.btn { padding:0.75em 1.5em; font-size:1em; font-weight:600; border:none; border-radius:0.7em; cursor:pointer; transition: transform .15s ease, box-shadow .2s ease; color:#fff; }
.btn:disabled { opacity:0.4; cursor:not-allowed; }
.btn.primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow: 0 6px 18px rgba(99,102,241,0.4); }
.btn.primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(99,102,241,0.55); }
.btn.primary.large { padding:0.95em 2em; font-size:1.1em; }
.btn.ghost { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); }
.btn.ghost:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
.btn.text { background:transparent; opacity:0.7; }
.btn.text:hover { opacity:1; }
.icon-btn { width:2.2em; height:2.2em; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1em; }
.icon-btn:hover { background: rgba(255,255,255,0.16); }
.icon-btn.round { font-size:1.2em; }

/* ====== rules ====== */
.rules-body { overflow:auto; padding-right:0.5em; }
.rule-item { display:flex; gap:1em; align-items:flex-start; margin-bottom:1em; padding:0.9em 1em; background:rgba(255,255,255,0.04); border-radius:0.6em; }
.rule-item p { line-height:1.7; opacity:0.9; }
.badge { width:1.8em; height:1.8em; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
.b1 { background: linear-gradient(135deg,#6366f1,#8b5cf6); }
.b2 { background: linear-gradient(135deg,#ec4899,#f43f5e); }
.b3 { background: linear-gradient(135deg,#22d3ee,#3b82f6); }

.diff-table { margin-top:1em; border-radius:0.8em; overflow:hidden; border:1px solid rgba(255,255,255,0.1); }
.dt-head, .dt-row { display:grid; grid-template-columns: 1fr 1.6fr 1fr 1fr 1fr; gap:0.5em; align-items:center; }
.dt-head { background:rgba(255,255,255,0.08); padding:0.7em 1em; font-weight:600; letter-spacing:0.05em; opacity:0.9; text-align:center; }
.dt-row { padding:0.7em 1em; text-align:center; border-top:1px solid rgba(255,255,255,0.06); }
.dt-row:hover { background: rgba(255,255,255,0.04); }

.lv-chip { display:inline-block; padding:0.15em 0.7em; border-radius:1em; font-size:0.85em; font-weight:700; color:#fff; letter-spacing:0.05em; }
.lv1 { background:linear-gradient(135deg,#22c55e,#10b981); }
.lv2 { background:linear-gradient(135deg,#22d3ee,#0ea5e9); }
.lv3 { background:linear-gradient(135deg,#6366f1,#8b5cf6); }
.lv4 { background:linear-gradient(135deg,#a855f7,#d946ef); }
.lv5 { background:linear-gradient(135deg,#ec4899,#f43f5e); }
.lv6 { background:linear-gradient(135deg,#f97316,#ef4444); }

.tag { display:inline-block; padding:0.2em 0.7em; border-radius:0.5em; font-size:0.85em; font-weight:600; }
.tag.ok { background: rgba(34,197,94,0.2); color:#4ade80; border:1px solid rgba(74,222,128,0.4); }
.tag.no { background: rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(248,113,113,0.4); }

/* ====== history ====== */
.hist-wrap { overflow:auto; padding-right:0.5em; max-height:65vh; }
.empty { text-align:center; padding:3em 1em; opacity:0.6; }
.empty-ico { font-size:3em; margin-bottom:0.5em; }
.hist-list { display:grid; gap:0.9em; grid-template-columns: repeat(auto-fill, minmax(20em, 1fr)); }
.hist-card { background:rgba(255,255,255,0.05); padding:1em 1.2em; border-radius:0.8em; border:1px solid rgba(255,255,255,0.08); }
.hc-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.6em; }
.hc-time { font-size:0.85em; opacity:0.7; }
.hc-score { font-size:1.5em; font-weight:800; background: linear-gradient(90deg,#a5b4fc,#f0abfc); -webkit-background-clip:text; background-clip:text; color:transparent; }
.hc-score span { font-size:0.55em; opacity:0.6; margin-left:0.2em; color:#fff; -webkit-text-fill-color:#fff; }
.hc-stats { display:grid; grid-template-columns: repeat(2,1fr); gap:0.3em 1em; font-size:0.85em; margin-bottom:0.7em; }
.hc-stats > div { display:flex; justify-content:space-between; }
.hc-stats span { opacity:0.6; }
.hc-stats b.ok { color:#4ade80; }
.hc-stats b.no { color:#f87171; }
.hc-bar { height:0.35em; background: rgba(255,255,255,0.1); border-radius:1em; overflow:hidden; }
.hc-bar-fill { height:100%; background: linear-gradient(90deg,#22c55e,#3b82f6); transition: width .4s; }

/* ====== tutorial ====== */
.tutorial-page { background:linear-gradient(145deg,#fff6fa,#f1e7f7); color:#352944; }
.tutorial-page .card { background:#fffafd; border-color:#e4d4e9; }
.tutorial-page .tutor-demo { background:#f4edf7; border-color:#e4d4e9; }
.tutorial-page .demo-hint { background:#eae0f0; }
.tutorial-page .demo-word { background:#dbe2ee; }
.tutorial-page .chip.ok { color:#17663d; }
.tutorial-page .chip.no { color:#9c283b; }
.tutorial-page .dot { background:#d6c5e3; }
.tutorial-page .dot.on { background:#6350a5; }
.tutorial-page .btn.ghost, .tutorial-page .btn.text { color:#4b3761; }
.tutorial-page .btn.ghost { border-color:#dbcbe4; }

.steps-dots { display:flex; gap:0.4em; }
.dot { width:0.6em; height:0.6em; border-radius:50%; background: rgba(255,255,255,0.2); transition: all .3s; }
.dot.on { background: #a5b4fc; width:1.6em; border-radius:1em; }
.tutor-demo { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:1em; padding:1.5em; margin-bottom:1.2em; }
.demo-scene { display:flex; align-items:center; justify-content:center; gap:2.5em; padding:1em 0 1.5em; }
.demo-word { font-size:4em; font-weight:900; text-shadow: 0 4px 12px rgba(0,0,0,0.3); background:rgba(255,255,255,0.08); padding:0.1em 0.5em; border-radius:0.15em; }
.demo-audio { display:flex; flex-direction:column; align-items:center; gap:0.5em; }
.demo-audio .heard { font-size:1.4em; font-weight:600; opacity:0.9; }
.sound-wave { display:inline-flex; align-items:flex-end; gap:0.15em; height:1.2em; }
.sound-wave i { display:block; width:0.15em; background:#a5b4fc; border-radius:0.1em; animation: wave 1s ease-in-out infinite; }
.sound-wave i:nth-child(1){ height:40%; animation-delay:-0.4s; }
.sound-wave i:nth-child(2){ height:70%; animation-delay:-0.2s; }
.sound-wave i:nth-child(3){ height:100%; }
.sound-wave i:nth-child(4){ height:60%; animation-delay:-0.3s; }
.sound-wave i:nth-child(5){ height:80%; animation-delay:-0.1s; }
.sound-wave.big { height:2.5em; gap:0.25em; }
.sound-wave.big i { width:0.3em; background:#a5b4fc; }
@keyframes wave { 0%,100%{ transform:scaleY(0.4); } 50%{ transform:scaleY(1); } }
.demo-hint { text-align:center; opacity:0.8; margin:0.5em 0 1em; padding:0.7em; background:rgba(0,0,0,0.15); border-radius:0.5em; }
.demo-actions { display:flex; gap:1em; justify-content:center; }
.chip { padding:0.5em 1.2em; border-radius:2em; font-weight:600; opacity:0.35; transition: all .3s; border:1px solid transparent; }
.chip.active { opacity:1; transform: scale(1.05); }
.chip.ok { background: rgba(34,197,94,0.2); color:#4ade80; border-color: rgba(74,222,128,0.4); }
.chip.no { background: rgba(239,68,68,0.2); color:#f87171; border-color: rgba(248,113,113,0.4); }
.tutor-nav { display:flex; gap:0.6em; justify-content:space-between; align-items:center; }

/* ====== duration ====== */
.dur-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:1.5em; margin: 2em 0 2em; }
.dur-card {
  background:rgba(255,255,255,0.05); border:2px solid rgba(255,255,255,0.12); border-radius:1.4em;
  padding:2em 1em; cursor:pointer; text-align:center; color:#fff; transition: all .2s;
  min-height:16em; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:0.5em;
  position:relative; overflow:hidden;
}
.dur-card::before {
  content:''; position:absolute; inset:0; background: radial-gradient(circle at 50% 0%, rgba(165,180,252,0.15), transparent 70%);
  opacity:0; transition:opacity .3s;
}
.dur-card:hover { background:rgba(255,255,255,0.1); transform: translateY(-4px); }
.dur-card:hover::before { opacity:1; }
.dur-card.sel { border-color:#a5b4fc; background: linear-gradient(135deg, rgba(99,102,241,0.28), rgba(139,92,246,0.28)); box-shadow: 0 12px 32px rgba(99,102,241,0.4); }
.dur-card.sel::before { opacity:1; }
.dur-mins {
  font-size: 8em; font-weight: 900; line-height: 0.9;
  background: linear-gradient(180deg, #ffffff 0%, #a5b4fc 60%, #f0abfc 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  letter-spacing: -0.04em;
  filter: drop-shadow(0 4px 12px rgba(165,180,252,0.35));
}
.dur-unit { font-size:1.8em; opacity:0.9; font-weight:600; letter-spacing:0.1em; margin-top:-0.2em; }
.dur-desc { font-size:1.15em; opacity:0.75; margin-top:1.2em; padding-top:1em; border-top:1px solid rgba(255,255,255,0.15); width:70%; font-weight:500; letter-spacing:0.05em; }
.dur-actions { display:flex; justify-content:space-between; align-items:center; gap:1em; margin-top:0.5em; }

/* ====== game ====== */
.game { justify-content:flex-start; padding:0; background:linear-gradient(145deg,#fff6fa,#f1e7f7); color:#352944; }
.topbar { width:100%; display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:1em; padding:1.2em 1.8em; }
.hud { display:flex; gap:0.8em; justify-self:start; }
.hud-item { background:#fffafd; border:1px solid #e4d4e9; padding:0.5em 1em; border-radius:0.7em; min-width:5em; }
.hud-lbl { font-size:0.75em; opacity:0.6; letter-spacing:0.1em; text-transform:uppercase; }
.hud-val { font-size:1.3em; font-weight:700; margin-top:0.1em; }
.hud-val.mono { font-variant-numeric: tabular-nums; }
.topbar .icon-btn.round { justify-self:end; background:#fffafd; color:#4b3761; border-color:#dbcbe4; }
.topbar-actions .btn.ghost { background:#fffafd; color:#4b3761; border-color:#dbcbe4; }
.topbar-actions { justify-self:end; display:flex; gap:0.6em; align-items:center; }
.btn.small { padding:0.55em 1.2em; font-size:0.95em; }

.rule-pill {
  justify-self:center;
  background: #fffafd;
  border: 1px solid #e4d4e9;
  padding: 0.7em 1.6em; border-radius: 2em;
  font-size: 1.25em; font-weight:500; white-space: nowrap;
  display:inline-flex; align-items:center; gap:0.5em;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  letter-spacing: 0.03em;
}
.rp-ico { font-size:1.1em; }

.progress-track { width:calc(100% - 3.6em); margin: 0 1.8em; height:0.35em; background:#e1d2e7; border-radius:1em; overflow:hidden; }
.progress-fill { height:100%; background: linear-gradient(90deg,#22d3ee,#6366f1,#ec4899); transition: width 1s linear; }

.stage { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; gap:1.5em; position:relative; padding:1em; }
.stimulus-wrap { position:relative; display:flex; flex-direction:column; align-items:center; gap:0.8em; }
.listen-hint { display:flex; flex-direction:column; align-items:center; gap:0.4em; opacity:0.85; }
.listen-hint span:last-child { font-size:1em; opacity:0.8; letter-spacing:0.1em; }
.stimulus {
  background: #cbd5e1;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 1.2em;
  padding: 0.25em 1em;
  transition: all .3s ease;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
}
.stimulus.ready {
  border-color: rgba(165,180,252,0.85);
  box-shadow: 0 12px 40px rgba(0,0,0,0.35), 0 0 40px rgba(165,180,252,0.5);
}
.stimulus-word {
  font-size: 15em; font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1.05;
  text-shadow: 0 2px 4px rgba(0,0,0,0.12);
}

.q-timer-ring { position:relative; display:inline-block; }
.q-timer-ring svg { transform: rotate(-90deg); }
.ring-bg { fill:none; stroke:#d7c7e3; stroke-width:5; }
.ring-fg { fill:none; stroke:url(#lg1); stroke-width:5; stroke-linecap:round; transition: stroke-dashoffset 1s linear; stroke:#6350a5; }
.q-timer-txt { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:1.4em; font-weight:700; }

.answers { display:flex; gap:1.5em; }
.ans-btn {
  position:relative;
  padding: 1em 2.2em; font-size: 1.3em; border: none; border-radius: 1em;
  cursor: pointer; font-weight: 700; color: #fff;
  display:flex; align-items:center; gap:0.7em; min-width:10em; justify-content:center;
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s;
}
.ans-btn:hover:not(:disabled) { transform: translateY(-3px); }
.ans-btn:disabled { opacity:0.45; cursor:not-allowed; }
.ans-btn.ok { background: linear-gradient(135deg,#22c55e,#10b981); box-shadow: 0 8px 24px rgba(34,197,94,0.35); }
.ans-btn.ok:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(34,197,94,0.5); }
.ans-btn.no { background: linear-gradient(135deg,#ef4444,#f43f5e); box-shadow: 0 8px 24px rgba(239,68,68,0.35); }
.ans-btn.no:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(239,68,68,0.5); }
.ab-ico { font-size:1.2em; }
.ab-kbd { font-size:0.65em; opacity:0.7; background:rgba(0,0,0,0.25); padding:0.15em 0.5em; border-radius:0.3em; margin-left:0.4em; }

.feedback { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; z-index:200; }
.fb-icon { font-size:9em; font-weight:900; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.4)); }
.fb-text { font-size:2em; font-weight:700; margin-top:0.2em; }
.feedback.ok { color:#17663d; }
.feedback.no { color:#9c283b; }

.level-toast {
  position:absolute; top:1em; left:50%; transform: translateX(-50%);
  padding:0.6em 1.2em; border-radius:2em; display:flex; align-items:center; gap:0.5em;
  font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,0.3);
}
.level-toast.up { background:#dcf5e6; color:#17663d; }
.level-toast.down { background:#fbe1e8; color:#9c283b; }

/* ====== modal ====== */
.modal { position:fixed; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; }
.modal-box { text-align:center; }
.modal-icon { font-size:3em; margin-bottom:0.3em; }
.modal-box h3 { font-size:1.5em; margin-bottom:0.3em; }
.modal-sub { opacity:0.7; margin-bottom:1.3em; }
.modal-btns { display:flex; gap:0.8em; justify-content:center; }

/* ====== result ====== */
.result-head { text-align:center; margin-bottom:1em; }
.result-trophy { font-size:3em; margin-bottom:0.2em; filter: drop-shadow(0 4px 12px rgba(250,204,21,0.5)); }
.result-head h2 { font-size:1.8em; margin-bottom:0.2em; }
.result-sub { opacity:0.7; font-size:0.95em; }
.result-score { text-align:center; margin:1.5em 0; }
.rs-val { font-size:4.5em; font-weight:900; background:linear-gradient(135deg,#a5b4fc,#f0abfc,#7dd3fc); -webkit-background-clip:text; background-clip:text; color:transparent; line-height:1; }
.rs-unit { display:block; opacity:0.6; letter-spacing:0.2em; margin-top:0.2em; }
.result-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:0.7em; margin-bottom:1.5em; }
.rg-item { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); padding:0.9em; border-radius:0.7em; text-align:center; }
.rg-item.ok { border-color: rgba(74,222,128,0.3); }
.rg-item.no { border-color: rgba(248,113,113,0.3); }
.rg-lbl { font-size:0.8em; opacity:0.6; letter-spacing:0.1em; text-transform:uppercase; }
.rg-val { font-size:1.6em; font-weight:800; margin-top:0.2em; }
.rg-val span { font-size:0.55em; opacity:0.6; margin-left:0.2em; font-weight:500; }
.rg-item.ok .rg-val { color:#4ade80; }
.rg-item.no .rg-val { color:#f87171; }
.result-actions { display:flex; gap:0.8em; justify-content:center; }
</style>
