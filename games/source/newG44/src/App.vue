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
                <stop offset="0%" stop-color="#f7c15a"/>
                <stop offset="100%" stop-color="#a5b4fc"/>
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="26" fill="none" stroke="url(#lg1)" stroke-width="4"/>
            <circle cx="32" cy="32" r="21" fill="#fdfaf1"/>
            <line x1="32" y1="32" x2="32" y2="16" stroke="#1a1410" stroke-width="3" stroke-linecap="round"/>
            <line x1="32" y1="32" x2="44" y2="32" stroke="#1a1410" stroke-width="3" stroke-linecap="round"/>
            <circle cx="32" cy="32" r="2.4" fill="#c69a48"/>
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
      <div class="foot-hint">CLOCK SETTER · v1.0</div>
    </div>
    </transition>

    <!-- ================= RULES ================= -->
    <transition name="fade">
    <div v-if="view==='rules'" class="page panel" key="rules">
      <div class="card wide">
        <div class="card-head">
          <h2>{{ t('rules') }}</h2>
          <button class="icon-btn" @click="view='home'">✕</button>
        </div>
        <div class="rules-body">
          <div class="rule-item"><span class="badge b1">1</span><p>{{ t('rule1') }}</p></div>
          <div class="rule-item"><span class="badge b2">2</span><p>{{ t('rule2') }}</p></div>
          <div class="rule-item"><span class="badge b3">3</span><p>{{ t('rule3') }}</p></div>
          <div class="diff-table">
            <div class="dt-head">
              <div>{{ t('lv') }}</div><div>{{ t('time_type') }}</div><div>{{ t('min_prec') }}</div><div>{{ t('tol') }}</div><div>{{ t('coef') }}</div>
            </div>
            <div class="dt-row" v-for="d in DIFF" :key="d.level">
              <div><span class="lv-chip" :class="'lv'+d.level">L{{ d.level }}</span></div>
              <div>{{ t(d.typeKey) }}</div>
              <div>{{ d.minStep }}°</div>
              <div>±{{ d.tol }}°</div>
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
          <button class="icon-btn" @click="view='home'">✕</button>
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
    <div v-if="view==='tutorial'" class="page panel" key="tutorial">
      <div class="card mid">
        <div class="card-head">
          <h2>{{ t('tutorial') }}</h2>
          <div class="steps-dots">
            <span v-for="(s,i) in tutorSteps" :key="i" class="dot" :class="{on: i===tutorStep}"/>
          </div>
        </div>
        <div class="tutor-demo">
          <div class="demo-scene">
            <div class="demo-clock">
              <Clock :hourDeg="tutorSteps[tutorStep].hourDeg"
                     :minuteDeg="tutorSteps[tutorStep].minDeg"
                     :interactive="false" />
              <div class="demo-cue" v-if="tutorSteps[tutorStep].cue">
                {{ tutorSteps[tutorStep].cue }}
              </div>
            </div>
            <div class="demo-target">
              <div class="dt-lbl">{{ t('target') }}</div>
              <div class="dt-time">{{ tutorSteps[tutorStep].target }}</div>
            </div>
          </div>
          <div class="demo-hint">{{ tutorSteps[tutorStep].hint }}</div>
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
          <button class="icon-btn" @click="view='home'">✕</button>
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
          <span>🎯 {{ t('target') }}：</span>
          <b class="rp-time">{{ targetDisplay }}</b>
          <span class="rp-badge" v-if="curDiff().hasSecond">SEC</span>
        </div>
        <div class="topbar-actions">
          <button v-if="showBatchSkip" class="icon-btn back-btn-hud" @click="onBatchSkip">⏭ {{ t('skipBatchGame') || t('skip_game') }}</button>
          <button class="icon-btn back-btn-hud" @click="pauseAsk">← {{ t('back') }}</button>
        </div>
      </div>

      <div class="progress-track"><div class="progress-fill" :style="{width: progressPct+'%'}"/></div>

      <div class="stage">
        <div class="q-timer-ring">
          <svg viewBox="0 0 60 60" width="4em" height="4em">
            <circle cx="30" cy="30" r="26" class="ring-bg"/>
            <circle cx="30" cy="30" r="26" class="ring-fg"
              :stroke-dasharray="163.36" :stroke-dashoffset="ringOffset"/>
          </svg>
          <div class="q-timer-txt">{{ qRemain }}</div>
        </div>

        <div class="clock-stage">
          <Clock
            :hourDeg="userAngles.hourDeg"
            :minuteDeg="userAngles.minuteDeg"
            :secondDeg="userAngles.secondDeg"
            :showSecond="curDiff().hasSecond"
            :interactive="!paused && !feedback"
            :snapMinute="curDiff().snap"
            @update="onClockUpdate"
          />
        </div>

        <div class="answers">
          <div class="readout">
            <span class="ro-lbl">{{ t('current') }}</span>
            <span class="ro-val">{{ liveHM }}<i v-if="curDiff().hasSecond">:{{ liveS }}</i></span>
          </div>
          <button class="ans-btn ghost" @click="resetHands" :disabled="!!feedback || paused">
            ↺ {{ t('reset') }}
          </button>
          <button class="ans-btn ok" @click="submitAnswer" :disabled="!!feedback || paused">
            <span class="ab-ico">✔</span>
            <span class="ab-txt">{{ t('submit') }}</span>
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
            <button class="btn ghost" @click="confirmQuit">{{ t('quit') }}</button>
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
import Clock from './components/Clock.vue'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'szszs'

// Level -> parameters. `snap` is angular step (deg) for minute hand while dragging.
const DIFF = [
  { level:1, typeKey:'d_hour',    minStep:60, tol:15, coef:1,   snap:30, hasSecond:false },
  { level:2, typeKey:'d_half',    minStep:30, tol:10, coef:1.5, snap:6,  hasSecond:false },
  { level:3, typeKey:'d_quarter', minStep:15, tol:5,  coef:2,   snap:6,  hasSecond:false },
  { level:4, typeKey:'d_min5',    minStep:5,  tol:3,  coef:2.5, snap:3,  hasSecond:false },
  { level:5, typeKey:'d_min1',    minStep:1,  tol:1,  coef:3,   snap:1,  hasSecond:false },
  { level:6, typeKey:'d_sec',     minStep:1,  tol:1,  coef:3.5, snap:1,  hasSecond:true  },
]

const DURATION_OPTS = [
  { val: 60,  mins: 1, desc: 'dur_quick' },
  { val: 180, mins: 3, desc: 'dur_normal' },
  { val: 300, mins: 5, desc: 'dur_deep' },
]

const I18N = {
  cn: {
    title:'时钟设置师', subtitle:'时间认知 · 视动协调 · 空间定位',
    start:'开始训练', rules:'规则介绍', history:'训练记录',
    back:'返回', tutorial:'新手教程', prev:'上一步', next:'下一步', skip:'跳过教程', done:'开始训练',
    skipBatchGame:'跳过游戏', skip_game:'跳过游戏', skipGame:'跳过游戏',
    choose_dur:'选择训练时长', min:'分钟', confirm_start:'开始训练',
    dur_quick:'快速体验', dur_normal:'标准训练', dur_deep:'深度训练',
    lv:'难度', score:'得分', remain:'剩余', current:'当前', submit:'提交答案', reset:'重置',
    target:'目标时间',
    paused_q:'训练已暂停', paused_sub:'点击继续恢复训练，或结束返回主页', resume:'继续训练', quit:'结束返回',
    result:'训练完成', result_sub:'本次训练已完成，继续保持！', home:'返回主页', again:'再来一局',
    time_type:'时间类型', min_prec:'分针精度', tol:'容错范围', coef:'系数',
    d_hour:'整点', d_half:'整点+半点', d_quarter:'含一刻钟', d_min5:'精确到 5 分', d_min1:'精确到 1 分', d_sec:'精确到秒',
    rule1:'拖动时针与分针，把钟面调整到题目要求的时间。',
    rule2:'每题最长 30 秒，超时视为答错；难度越高容错越小。',
    rule3:'得分 = 5 × 当前难度系数。每 60 秒统计正确率：≥90% 升级，<70% 降级。',
    h_time:'时间', h_lv:'难度', h_dur:'时长', h_tot:'总数', h_ok:'成功', h_fail:'失败',
    h_rate:'成功率', h_rt:'平均反应', h_score:'得分', nohist:'暂无训练记录',
    lv_up:'难度升级', lv_down:'难度降低',
    correct_fb:'回答正确', wrong_fb:'回答错误', timeout_fb:'超时未答',
    tut1_hint:'观察题目要求的目标时间，如 3:00',
    tut2_hint:'按住时针或分针，直接拖动它们旋转',
    tut3_hint:'把指针拖到目标位置，然后点击"提交答案"',
    tut4_hint:'高难度下容错范围极小，请精准对位！',
  },
  en: {
    title:'Clock Setter', subtitle:'Time · Visuo-motor · Spatial Location',
    start:'Start Training', rules:'Rules', history:'History',
    back:'Back', tutorial:'Tutorial', prev:'Prev', next:'Next', skip:'Skip', done:'Start',
    skipBatchGame:'Skip Game', skip_game:'Skip Game', skipGame:'Skip Game',
    choose_dur:'Choose Duration', min:'min', confirm_start:'Start Training',
    dur_quick:'Quick', dur_normal:'Standard', dur_deep:'Extended',
    lv:'Level', score:'Score', remain:'Time', current:'Now', submit:'Submit', reset:'Reset',
    target:'Target',
    paused_q:'Training Paused', paused_sub:'Resume to continue or quit to return', resume:'Resume', quit:'Quit',
    result:'Session Complete', result_sub:'Great job — keep it up!', home:'Home', again:'Play Again',
    time_type:'Type', min_prec:'Min step', tol:'Tolerance', coef:'Coef',
    d_hour:'Hour', d_half:'Hour+Half', d_quarter:'Quarter', d_min5:'5-min', d_min1:'1-min', d_sec:'Second',
    rule1:'Drag the hour and minute hands to match the requested time.',
    rule2:'30 s per question, timeout counts as wrong; higher level, smaller tolerance.',
    rule3:'Score = 5 × level coefficient. Every 60 s: ≥90% level up, <70% level down.',
    h_time:'Time', h_lv:'Level', h_dur:'Duration', h_tot:'Total', h_ok:'OK', h_fail:'Fail',
    h_rate:'Rate', h_rt:'Avg RT', h_score:'Score', nohist:'No records yet',
    lv_up:'Level Up', lv_down:'Level Down',
    correct_fb:'Correct', wrong_fb:'Wrong', timeout_fb:'Time out',
    tut1_hint:'Read the target time first, e.g. 3:00',
    tut2_hint:'Press and drag the hour or minute hand',
    tut3_hint:'Align to target, then press Submit',
    tut4_hint:'High level = tiny tolerance. Be precise!',
  }
}

export default {
  name: 'App',
  components: { Clock },
  data(){
    return {
      lang: 'cn',
      view: 'home',
      DIFF, DURATION_OPTS,
      tutorStep: 0,
      pickedDur: null,
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      remain: 0,
      duration: 60,
      qRemain: 0,
      target: { h:3, m:0, s:0 },
      userAngles: { hourDeg: 0, minuteDeg: 0, secondDeg: 0 },
      paused: false,
      feedback: null,
      levelToast: null,
      winCorrect: 0, winTotal: 0, winStart: 0,
      session: { score:0, total:0, correct:0, wrong:0, rate:0, avgRt:0 },
      rtSum: 0,
      qStartAt: 0,
      history: [],
      scale: 1,
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created(){
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
    this._mainTimer = null
    this._qTimer = null
    this._promptAudio = null
  },
  computed:{
    rootStyle(){ return { fontSize: (16*this.scale)+'px' } },
    progressPct(){ return this.duration ? ((this.duration-this.remain)/this.duration*100) : 0 },
    ringOffset(){
      const C = 2*Math.PI*26
      return C * (1 - this.qRemain/30)
    },
    targetDisplay(){
      const t = this.target
      const hh = String(t.h===0?12:t.h).padStart(2,'0')
      const mm = String(t.m).padStart(2,'0')
      if (this.curDiff().hasSecond) return `${hh}:${mm}:${String(t.s).padStart(2,'0')}`
      return `${hh}:${mm}`
    },
    liveHM(){
      const h = Math.floor(this.userAngles.hourDeg / 30) % 12
      const hh = h===0 ? 12 : h
      const m = Math.round(this.userAngles.minuteDeg / 6) % 60
      return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    },
    liveS(){
      return String(Math.round(this.userAngles.secondDeg / 6) % 60).padStart(2,'0')
    },
    tutorSteps(){
      return [
        { hourDeg: 0,   minDeg: 0,   target: '03:00', cue: '👀', hint: this.t('tut1_hint') },
        { hourDeg: 45,  minDeg: 200, target: '03:00', cue: '✋', hint: this.t('tut2_hint') },
        { hourDeg: 90,  minDeg: 0,   target: '03:00', cue: '✓',  hint: this.t('tut3_hint') },
        { hourDeg: 90,  minDeg: 0,   target: '03:00', cue: '★',  hint: this.t('tut4_hint') },
      ]
    }
  },
  mounted(){
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    if (window.visualViewport){
      window.visualViewport.addEventListener('resize', this.updateScale)
      window.visualViewport.addEventListener('scroll', this.updateScale)
    }
    this.loadHistory()
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.pickedDur = sec },
      openTutorial: () => { this.tutorStep = 0; this.view = 'tutorial' },
    })
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.updateScale)
    if (window.visualViewport){
      window.visualViewport.removeEventListener('resize', this.updateScale)
      window.visualViewport.removeEventListener('scroll', this.updateScale)
    }
    this.clearTimers()
  },
  methods:{
    t(k){ return (I18N[this.lang] && I18N[this.lang][k]) || k },
    toggleLang(){ this.lang = this.lang==='cn' ? 'en' : 'cn' },
    fmtTime(s){
      s = Math.max(0,s|0)
      const m = String(Math.floor(s/60)).padStart(2,'0')
      const r = String(s%60).padStart(2,'0')
      return `${m}:${r}`
    },
    updateScale(){
      const vv = window.visualViewport
      const w = vv ? vv.width  : window.innerWidth
      const h = vv ? vv.height : window.innerHeight
      this.scale = Math.min(w/1280, h/720)
      if (this.scale < 0.4) this.scale = 0.4
      document.documentElement.style.setProperty('--app-h', h + 'px')
    },
    startFlow(){ this.tutorStep = 0; this.pickedDur = null; this.view='tutorial' },
    onTutorialDone(){
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.beginGame(dur))) return
      this.view = 'duration'
    },
    onBatchSkip(){ skipPbBatchGame() },
    confirmQuit(){
      this.clearTimers()
      this.stopPrompt()
      this.paused = false
      leavePbGameWindow({ confirm: false })
    },
    curDiff(){ return DIFF[this.level-1] },

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
        this.nextQuestion()
      })
    },
    startMainTimer(){
      this.clearTimers()
      this._mainTimer = setInterval(()=>{
        if (this.paused) return
        this.remain--
        const elapsed = this.duration - this.remain
        if (elapsed - this.winStart >= 60){ this.evaluateWindow() }
        if (this.remain <= 0){ this.endGame(false) }
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
      if (changed){
        this.levelToast = { dir: changed }
        setTimeout(()=>{ this.levelToast = null }, 1600)
      }
    },
    makeTarget(){
      const d = this.curDiff()
      const h = Math.floor(Math.random()*12)
      let m = 0, s = 0
      if (d.minStep === 60) m = 0
      else if (d.minStep === 30) m = Math.random()<0.5 ? 0 : 30
      else if (d.minStep === 15) m = [0,15,30,45][Math.floor(Math.random()*4)]
      else if (d.minStep === 5) m = Math.floor(Math.random()*12)*5
      else m = Math.floor(Math.random()*60)
      if (d.hasSecond) s = Math.floor(Math.random()*60)
      return { h, m, s }
    },
    nextQuestion(){
      this.target = this.makeTarget()
      // Start hands at distinct positions so the user can easily grab each one.
      // Hour → 9 (270°), Minute → 6 (180°), Second → 3 (90°).
      this.userAngles = { hourDeg: 270, minuteDeg: 180, secondDeg: 90 }
      this.qRemain = 30
      this.qStartAt = Date.now()
      this.feedback = null
      this.playPrompt()
      clearInterval(this._qTimer)
      this._qTimer = setInterval(()=>{
        if (this.paused) return
        this.qRemain--
        if (this.qRemain <= 0){ this.timeout() }
      }, 1000)
    },
    onClockUpdate(a){ this.userAngles = a },
    playPrompt(){
      try {
        if (this._promptAudio){ try { this._promptAudio.pause() } catch(_){} }
        const folder = this.lang === 'cn' ? 'chinese' : 'english'
        const a = new Audio(`voice/${folder}/1.mp3`)
        this._promptAudio = a
        a.play().catch(()=>{})
      } catch(_){}
    },
    stopPrompt(){
      if (this._promptAudio){ try { this._promptAudio.pause() } catch(_){} this._promptAudio = null }
    },
    resetHands(){ this.userAngles = { hourDeg: 270, minuteDeg: 180, secondDeg: 90 } },
    angleDelta(a, b){
      let d = Math.abs(((a-b)%360+360)%360)
      if (d > 180) d = 360-d
      return d
    },
    judge(){
      const d = this.curDiff()
      // Hands are independent, so judge each axis against its own target position.
      const tHour = (this.target.h % 12) * 30
      const tMin = this.target.m * 6
      const tSec = this.target.s * 6
      const dHr = this.angleDelta(this.userAngles.hourDeg, tHour)
      const dMin = this.angleDelta(this.userAngles.minuteDeg, tMin)
      // Hour hand always snaps to whole hours (step 30°), so any tolerance ≥ 15° accepts an exact hit.
      const okHM = dHr <= 15 && dMin <= d.tol
      if (!d.hasSecond) return okHM
      const dSec = this.angleDelta(this.userAngles.secondDeg, tSec)
      return okHM && dSec <= 6
    },
    submitAnswer(){
      if (this.feedback || this.paused) return
      const rt = Date.now() - this.qStartAt
      const ok = this.judge()
      this.session.total++
      this.winTotal++
      this.rtSum += rt
      if (ok){
        this.session.correct++
        this.winCorrect++
        this.score += 5 * this.curDiff().coef
      } else {
        this.session.wrong++
      }
      clearInterval(this._qTimer)
      this.feedback = { type: ok?'ok':'no', text: ok ? this.t('correct_fb') : this.t('wrong_fb')+' · '+this.targetDisplay }
      setTimeout(()=>{
        this.feedback = null
        if (this.view==='game' && !this.paused) this.nextQuestion()
      }, 900)
    },
    timeout(){
      this.session.total++
      this.session.wrong++
      this.winTotal++
      clearInterval(this._qTimer)
      this.feedback = { type:'no', text: this.t('timeout_fb')+' · '+this.targetDisplay }
      setTimeout(()=>{
        this.feedback = null
        if (this.view==='game' && !this.paused) this.nextQuestion()
      }, 900)
    },
    pauseAsk(){ this.paused = true; this.stopPrompt() },
    resumeGame(){ this.paused = false },
    endGame(userQuit){
      this.clearTimers()
      this.stopPrompt()
      const s = this.session
      s.score = Math.round(this.score)
      s.rate = s.total ? Math.round(100*s.correct/s.total) : 0
      s.avgRt = s.total ? Math.round(this.rtSum/s.total) : 0
      this.saveHistory({
        time: this.nowStr(),
        level: this.level,
        duration: this.duration - (userQuit?this.remain:0),
        total: s.total, correct: s.correct, wrong: s.wrong,
        rate: s.rate, avgRt: s.avgRt, score: s.score,
      })
      this.paused = false
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(s.avgRt),
        score: s.score || 0,
        successCount: s.correct || 0,
        failCount: s.wrong || 0,
        trainDuration: this.duration,
        difficultyLevel: this.level || 1,
      })
      this.view = 'result'
    },
    onSkipClick(){
      // Reserved for skip-current-question logic.
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
      try { this.history = JSON.parse(localStorage.getItem('g44_history')||'[]') } catch(e){ this.history=[] }
    },
    saveHistory(rec){
      this.loadHistory()
      this.history.unshift(rec)
      if (this.history.length>100) this.history = this.history.slice(0,100)
      localStorage.setItem('g44_history', JSON.stringify(this.history))
    }
  }
}
</script>

<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body, #app { width:100%; height:100%; overflow:hidden; font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif; -webkit-font-smoothing: antialiased; }
#app { height:100vh; height:100dvh; height:var(--app-h, 100dvh); }
body {
  background:
    radial-gradient(1200px 800px at 10% 10%, rgba(99,102,241,0.35), transparent 60%),
    radial-gradient(1000px 700px at 90% 30%, rgba(236,72,153,0.22), transparent 60%),
    radial-gradient(900px 700px at 50% 100%, rgba(56,189,248,0.25), transparent 60%),
    linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color:#f8fafc;
}
button { font-family:inherit; }

.page { width:100%; height:100vh; height:100dvh; height:var(--app-h, 100dvh); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2vh; position:relative; overflow:hidden; }
.panel { gap:1em; }

.fade-enter-active,.fade-leave-active { transition: opacity .35s ease, transform .35s ease; }
.fade-enter,.fade-leave-to { opacity:0; transform: translateY(8px); }
.pop-enter-active,.pop-leave-active { transition: transform .3s ease, opacity .3s ease; }
.pop-enter,.pop-leave-to { opacity:0; transform: scale(.85); }

.bg-orbs { position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:0; }
.orb { position:absolute; border-radius:50%; filter: blur(60px); opacity:0.5; animation: float 14s ease-in-out infinite; }
.orb.o1 { width:22em; height:22em; background:#6366f1; top:-6em; left:-6em; }
.orb.o2 { width:20em; height:20em; background:#ec4899; bottom:-6em; right:-4em; animation-delay:-6s; }
.orb.o3 { width:16em; height:16em; background:#f7c15a; top:40%; left:50%; animation-delay:-3s; }
@keyframes float { 0%,100%{ transform:translate(0,0) scale(1) } 50%{ transform:translate(2em,-1em) scale(1.05) } }

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
.brand-logo { font-size:4em; line-height:1; filter: drop-shadow(0 6px 16px rgba(247,193,90,0.5)); }
.title { font-size:2.6em; font-weight:800; letter-spacing:0.06em; background: linear-gradient(90deg,#f7c15a,#f0abfc,#a5b4fc); -webkit-background-clip:text; background-clip:text; color:transparent; }
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
.cta-primary { background: linear-gradient(135deg,#f7c15a,#ec4899 55%,#8b5cf6); box-shadow: 0 8px 24px rgba(247,193,90,0.4); }
.cta-primary:hover { box-shadow: 0 12px 32px rgba(247,193,90,0.55); }
.cta-ghost { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); }
.cta-ghost:hover { background: rgba(255,255,255,0.14); }

.lang-btn { position:absolute; top:1.5em; right:1.5em; padding:0.7em 1.4em; border:none; border-radius:2em; color:#fff; cursor:pointer; display:flex; align-items:center; gap:0.6em; font-weight:600; font-size:1.1em; letter-spacing:0.05em; z-index:2; transition: transform .15s ease, background .2s; }
.lang-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.18); }
.lang-dot { width:0.6em; height:0.6em; border-radius:50%; background:#f7c15a; box-shadow: 0 0 10px #f7c15a; }
.foot-hint { position:absolute; bottom:1.5em; font-size:0.85em; opacity:0.5; letter-spacing:0.2em; z-index:1; }

/* ====== buttons ====== */
.btn { padding:0.75em 1.5em; font-size:1em; font-weight:600; border:none; border-radius:0.7em; cursor:pointer; transition: transform .15s ease, box-shadow .2s ease; color:#fff; }
.btn:disabled { opacity:0.4; cursor:not-allowed; }
.btn.primary { background: linear-gradient(135deg,#f7c15a,#ec4899); box-shadow: 0 6px 18px rgba(247,193,90,0.4); }
.btn.primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(247,193,90,0.55); }
.btn.primary.large { padding:0.95em 2em; font-size:1.1em; }
.btn.ghost { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); }
.btn.ghost:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
.btn.text { background:transparent; opacity:0.7; }
.btn.text:hover { opacity:1; }
.icon-btn { width:2.2em; height:2.2em; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1em; }
.icon-btn:hover { background: rgba(255,255,255,0.16); }
.icon-btn.round { font-size:1.2em; }
.icon-btn.back-btn-hud { width:auto; height:2.4em; border-radius:1.2em; padding:0 1.1em; font-size:0.95em; letter-spacing:0.05em; gap:0.3em; }

/* ====== rules ====== */
.rules-body { overflow:auto; padding-right:0.5em; }
.rule-item { display:flex; gap:1em; align-items:flex-start; margin-bottom:1em; padding:0.9em 1em; background:rgba(255,255,255,0.04); border-radius:0.6em; }
.rule-item p { line-height:1.7; opacity:0.9; }
.badge { width:1.8em; height:1.8em; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
.b1 { background: linear-gradient(135deg,#f7c15a,#ec4899); }
.b2 { background: linear-gradient(135deg,#ec4899,#8b5cf6); }
.b3 { background: linear-gradient(135deg,#22d3ee,#6366f1); }

.diff-table { margin-top:1em; border-radius:0.8em; overflow:hidden; border:1px solid rgba(255,255,255,0.1); }
.dt-head, .dt-row { display:grid; grid-template-columns: 1fr 1.4fr 1fr 1fr 1fr; gap:0.5em; align-items:center; }
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

/* ====== history ====== */
.hist-wrap { overflow:auto; padding-right:0.5em; max-height:65vh; }
.empty { text-align:center; padding:3em 1em; opacity:0.6; }
.empty-ico { font-size:3em; margin-bottom:0.5em; }
.hist-list { display:grid; gap:0.9em; grid-template-columns: repeat(auto-fill, minmax(20em, 1fr)); }
.hist-card { background:rgba(255,255,255,0.05); padding:1em 1.2em; border-radius:0.8em; border:1px solid rgba(255,255,255,0.08); }
.hc-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.6em; }
.hc-time { font-size:0.85em; opacity:0.7; }
.hc-score { font-size:1.5em; font-weight:800; background: linear-gradient(90deg,#f7c15a,#f0abfc); -webkit-background-clip:text; background-clip:text; color:transparent; }
.hc-score span { font-size:0.55em; opacity:0.6; margin-left:0.2em; color:#fff; -webkit-text-fill-color:#fff; }
.hc-stats { display:grid; grid-template-columns: repeat(2,1fr); gap:0.3em 1em; font-size:0.85em; margin-bottom:0.7em; }
.hc-stats > div { display:flex; justify-content:space-between; }
.hc-stats span { opacity:0.6; }
.hc-stats b.ok { color:#4ade80; }
.hc-stats b.no { color:#f87171; }
.hc-bar { height:0.35em; background: rgba(255,255,255,0.1); border-radius:1em; overflow:hidden; }
.hc-bar-fill { height:100%; background: linear-gradient(90deg,#f7c15a,#ec4899); transition: width .4s; }

/* ====== tutorial ====== */
.steps-dots { display:flex; gap:0.4em; }
.dot { width:0.6em; height:0.6em; border-radius:50%; background: rgba(255,255,255,0.2); transition: all .3s; }
.dot.on { background: #f7c15a; width:1.6em; border-radius:1em; }
.tutor-demo { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:1em; padding:1.5em; margin-bottom:1.2em; }
.demo-scene { display:flex; align-items:center; justify-content:center; gap:2em; padding:0.5em 0 1em; }
.demo-clock { position:relative; width:16em; height:16em; }
.demo-cue { position:absolute; top:-0.2em; right:-0.2em; font-size:2em; animation: pulse 1.2s infinite; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.15); opacity: 1 } }
.demo-target { display:flex; flex-direction:column; align-items:center; gap:0.4em; padding:1.2em 1.6em; background:linear-gradient(135deg,rgba(247,193,90,0.15),rgba(236,72,153,0.05)); border:1px solid rgba(247,193,90,0.35); border-radius:1em; }
.dt-lbl { font-size:0.85em; opacity:0.7; letter-spacing:0.15em; }
.dt-time { font-size:2.8em; font-weight:900; letter-spacing:0.06em; background: linear-gradient(180deg,#fff,#f7c15a); -webkit-background-clip:text; background-clip:text; color:transparent; font-variant-numeric: tabular-nums; }
.demo-hint { text-align:center; opacity:0.9; margin:0.5em 0 0; padding:0.9em; background:rgba(0,0,0,0.2); border-radius:0.6em; font-size:1.05em; }
.tutor-nav { display:flex; gap:0.6em; justify-content:space-between; align-items:center; }

/* ====== duration ====== */
.dur-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:1.5em; margin: 2em 0 2em; }
.dur-card {
  background:rgba(255,255,255,0.05); border:2px solid rgba(255,255,255,0.12); border-radius:1.4em;
  padding:2em 1em; cursor:pointer; text-align:center; color:#fff; transition: all .2s;
  min-height:16em; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:0.5em;
  position:relative; overflow:hidden;
}
.dur-card::before { content:''; position:absolute; inset:0; background: radial-gradient(circle at 50% 0%, rgba(247,193,90,0.15), transparent 70%); opacity:0; transition:opacity .3s; }
.dur-card:hover { background:rgba(255,255,255,0.1); transform: translateY(-4px); }
.dur-card:hover::before { opacity:1; }
.dur-card.sel { border-color:#f7c15a; background: linear-gradient(135deg, rgba(247,193,90,0.25), rgba(236,72,153,0.2)); box-shadow: 0 12px 32px rgba(247,193,90,0.4); }
.dur-card.sel::before { opacity:1; }
.dur-mins {
  font-size: 8em; font-weight: 900; line-height: 0.9;
  background: linear-gradient(180deg, #ffffff 0%, #f7c15a 60%, #f0abfc 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  letter-spacing: -0.04em;
  filter: drop-shadow(0 4px 12px rgba(247,193,90,0.4));
}
.dur-unit { font-size:1.8em; opacity:0.9; font-weight:600; letter-spacing:0.1em; margin-top:-0.2em; }
.dur-desc { font-size:1.15em; opacity:0.75; margin-top:1.2em; padding-top:1em; border-top:1px solid rgba(255,255,255,0.15); width:70%; font-weight:500; letter-spacing:0.05em; }
.dur-actions { display:flex; justify-content:space-between; align-items:center; gap:1em; margin-top:0.5em; }

/* ====== game ====== */
.game { justify-content:flex-start; padding:0; }
.topbar { width:100%; display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:1em; padding:1.2em 1.8em; }
.hud { display:flex; gap:0.8em; justify-self:start; }
.hud-item { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1); padding:0.5em 1em; border-radius:0.7em; min-width:5em; }
.hud-lbl { font-size:0.75em; opacity:0.6; letter-spacing:0.1em; text-transform:uppercase; }
.hud-val { font-size:1.3em; font-weight:700; margin-top:0.1em; }
.hud-val.mono { font-variant-numeric: tabular-nums; }
.topbar .icon-btn.round { justify-self:end; }
.topbar-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.6em;
  flex-wrap: nowrap;
}
.topbar-actions .icon-btn.back-btn-hud { justify-self: auto; }

.rule-pill {
  justify-self:center;
  background: linear-gradient(135deg, rgba(247,193,90,0.18), rgba(236,72,153,0.10));
  border: 1px solid rgba(247,193,90,0.35);
  padding: 0.7em 1.4em; border-radius: 2em;
  font-size: 1em; white-space: nowrap;
  display:inline-flex; align-items:center; gap:0.6em;
  box-shadow: 0 4px 14px rgba(247,193,90,0.15);
}
.rp-time { font-size:1.5em; font-weight:900; letter-spacing:0.1em; font-variant-numeric: tabular-nums; background: linear-gradient(180deg,#fff,#f7c15a); -webkit-background-clip:text; background-clip:text; color:transparent; }
.rp-badge { padding:0.15em 0.5em; background:#c53030; border-radius:0.3em; font-size:0.75em; font-weight:700; letter-spacing:0.15em; }

.progress-track { width:calc(100% - 3.6em); margin: 0 1.8em; height:0.35em; background:rgba(255,255,255,0.08); border-radius:1em; overflow:hidden; }
.progress-fill { height:100%; background: linear-gradient(90deg,#f7c15a,#ec4899,#6366f1); transition: width 1s linear; }

.stage { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; gap:1em; position:relative; padding:1em; min-height:0; }

.q-timer-ring { position:relative; display:inline-block; }
.q-timer-ring svg { transform: rotate(-90deg); }
.ring-bg { fill:none; stroke:rgba(255,255,255,0.1); stroke-width:5; }
.ring-fg { fill:none; stroke-width:5; stroke-linecap:round; transition: stroke-dashoffset 1s linear; stroke:#f7c15a; }
.q-timer-txt { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:1.4em; font-weight:700; }

.clock-stage {
  flex:1;
  min-height:0;
  aspect-ratio: 1 / 1;
  max-height: 55vh;
  display:flex; align-items:center; justify-content:center;
}
.clock-stage :deep(.clock-wrap) { width:100%; height:100%; }

.answers { display:flex; gap:1.2em; align-items:center; }
.readout {
  display:flex; flex-direction:column; align-items:flex-start; gap:0.15em;
  padding: 0.6em 1.2em; border-radius: 0.8em;
  background: rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.12);
}
.ro-lbl { font-size:0.7em; opacity:0.6; letter-spacing:0.15em; text-transform:uppercase; }
.ro-val { font-size:1.6em; font-weight:800; font-variant-numeric: tabular-nums; letter-spacing:0.08em; }
.ro-val i { color:#f87171; font-style:normal; }
.ans-btn {
  position:relative;
  padding: 0.9em 2em; font-size: 1.2em; border: none; border-radius: 0.9em;
  cursor: pointer; font-weight: 700; color: #fff;
  display:inline-flex; align-items:center; gap:0.6em;
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s;
}
.ans-btn:hover:not(:disabled) { transform: translateY(-3px); }
.ans-btn:disabled { opacity:0.45; cursor:not-allowed; }
.ans-btn.ok { background: linear-gradient(135deg,#22c55e,#10b981); box-shadow: 0 8px 24px rgba(34,197,94,0.35); }
.ans-btn.ok:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(34,197,94,0.5); }
.ans-btn.ghost { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); }
.ans-btn.ghost:hover:not(:disabled) { background: rgba(255,255,255,0.16); }
.ab-ico { font-size:1.2em; }

.feedback { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; z-index:200; }
.fb-icon { font-size:9em; font-weight:900; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.4)); }
.fb-text { font-size:1.6em; font-weight:700; margin-top:0.2em; padding:0.4em 1em; background:rgba(0,0,0,0.35); border-radius:0.5em; }
.feedback.ok { color:#4ade80; }
.feedback.no { color:#f87171; }

.level-toast {
  position:absolute; top:1em; left:50%; transform: translateX(-50%);
  padding:0.6em 1.2em; border-radius:2em; display:flex; align-items:center; gap:0.5em;
  font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,0.3); z-index:50;
}
.level-toast.up { background: linear-gradient(135deg,#22c55e,#10b981); }
.level-toast.down { background: linear-gradient(135deg,#f97316,#ef4444); }

/* ====== modal ====== */
.modal { position:fixed; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; }
.modal-box { text-align:center; width:min(32em, 92vw); }
.modal-icon { font-size:3em; margin-bottom:0.3em; color:#f7c15a; }
.modal-box h3 { font-size:1.5em; margin-bottom:0.3em; }
.modal-sub { opacity:0.7; margin-bottom:1.3em; font-size:1em; }
.modal-btns { display:flex; gap:0.8em; justify-content:center; }

/* ====== result ====== */
.result-head { text-align:center; margin-bottom:1em; }
.result-trophy { font-size:3em; margin-bottom:0.2em; filter: drop-shadow(0 4px 12px rgba(250,204,21,0.5)); }
.result-head h2 { font-size:1.8em; margin-bottom:0.2em; }
.result-sub { opacity:0.7; font-size:0.95em; }
.result-score { text-align:center; margin:1.5em 0; }
.rs-val { font-size:4.5em; font-weight:900; background:linear-gradient(135deg,#f7c15a,#f0abfc,#a5b4fc); -webkit-background-clip:text; background-clip:text; color:transparent; line-height:1; }
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
