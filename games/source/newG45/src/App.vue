<template>
  <div id="app" :style="rootStyle">

    <!-- ================= HOME ================= -->
    <transition name="fade">
    <div v-if="view==='home'" class="page home" key="home">
      <div class="bg-decor">
        <div class="paper-orn p1"/>
        <div class="paper-orn p2"/>
        <div class="paper-orn p3"/>
      </div>
      <button class="lang-btn" @click="toggleLang">{{ lang==='cn' ? 'EN' : '中' }}</button>
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 64 64" width="1em" height="1em">
            <polygon points="10,10 54,10 54,54 10,54" fill="#fdfaf0" stroke="#8a6f47" stroke-width="2.5"/>
            <polyline points="10,10 32,32 54,10" fill="none" stroke="#8a6f47" stroke-width="2" stroke-dasharray="4 3"/>
            <circle cx="24" cy="40" r="3.5" fill="#2a2419"/>
            <circle cx="40" cy="44" r="3.5" fill="#2a2419"/>
          </svg>
        </div>
        <h1 class="title">{{ t('title') }}</h1>
        <p class="subtitle">{{ t('subtitle') }}</p>
      </div>
      <div class="menu">
        <button class="cta cta-primary" @click="startFlow">
          <span class="cta-ico">▶</span>
          <span class="cta-txt">{{ t('start') }}</span>
        </button>
        <button class="cta cta-ghost" @click="view='rules'">
          <span class="cta-ico">?</span>
          <span class="cta-txt">{{ t('rules') }}</span>
        </button>
        <button class="cta cta-ghost" @click="loadHistory(); view='history'">
          <span class="cta-ico">≡</span>
          <span class="cta-txt">{{ t('history') }}</span>
        </button>
      </div>
      <div class="foot-hint">Crease Detective · v1.0</div>
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
          <div class="rule-item"><span class="badge">1</span><p>{{ t('rule1') }}</p></div>
          <div class="rule-item"><span class="badge">2</span><p>{{ t('rule2') }}</p></div>
          <div class="rule-item"><span class="badge">3</span><p>{{ t('rule3') }}</p></div>
          <div class="diff-table">
            <div class="dt-head">
              <div>{{ t('lv') }}</div><div>{{ t('foldType') }}</div><div>{{ t('foldCnt') }}</div><div>{{ t('holeCnt') }}</div><div>{{ t('coef') }}</div>
            </div>
            <div class="dt-row" v-for="d in DIFF" :key="d.level">
              <div><span class="lv-chip">L{{ d.level }}</span></div>
              <div>{{ d.diag ? t('foldMix') : t('foldFlat') }}</div>
              <div>{{ d.folds }}</div>
              <div>{{ d.holes }}</div>
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
          <div style="display:flex; gap:0.6em; align-items:center;">
            <button v-if="history.length" class="btn ghost small" @click="askClearHist=true">{{ t('clear') }}</button>
            <button class="icon-btn" @click="view='home'" :aria-label="t('back')">✕</button>
          </div>
        </div>
        <div class="hist-wrap">
          <div v-if="!history.length" class="empty">
            <div class="empty-ico">
              <svg viewBox="0 0 64 64" width="1em" height="1em">
                <polygon points="12,10 44,10 52,20 52,54 12,54" fill="none" stroke="#c5b892" stroke-width="2"/>
                <polyline points="44,10 44,20 52,20" fill="none" stroke="#c5b892" stroke-width="2"/>
                <line x1="20" y1="30" x2="44" y2="30" stroke="#dccdac" stroke-width="1.5"/>
                <line x1="20" y1="38" x2="44" y2="38" stroke="#dccdac" stroke-width="1.5"/>
                <line x1="20" y1="46" x2="36" y2="46" stroke="#dccdac" stroke-width="1.5"/>
              </svg>
            </div>
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
      <div v-if="askClearHist" class="modal">
        <div class="modal-box card">
          <h3>{{ t('clearConfirmT') }}</h3>
          <p class="modal-sub">{{ t('clearConfirmS') }}</p>
          <div class="modal-btns">
            <button class="btn ghost" @click="askClearHist=false">{{ t('cancel') }}</button>
            <button class="btn danger" @click="doClearHist">{{ t('confirm') }}</button>
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
            <template v-for="(item, idx) in tutorCurrent.papers">
              <div class="demo-paper" :key="'p'+idx">
                <div class="dp-inner">
                  <PaperSvg :shape="item.shape" :holes="item.holes||[]" :punches="item.punches||[]"
                            :fold-line="item.foldLine" :fold-arrow="item.foldArrow"/>
                </div>
                <div class="dp-label">{{ t(item.label) }}</div>
              </div>
              <div v-if="idx < tutorCurrent.papers.length-1" class="demo-arrow" :key="'a'+idx">→</div>
            </template>
          </div>
          <div class="demo-hint">{{ tutorCurrent.hint }}</div>
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
      <!-- Top bar -->
      <div class="topbar">
        <div class="hud">
          <div class="hud-item">
            <div class="hud-lbl">{{ t('lv') }}</div>
            <div class="hud-val"><span class="lv-chip">L{{ level }}</span></div>
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
        <div class="prompt-wrap">
          <div class="rule-pill">{{ t('gamePrompt') }}</div>
          <div class="q-timer">
            <div class="q-timer-bar" :style="{width:(qRemain/15*100)+'%'}" :class="{warn:qRemain<=5}"/>
            <span class="q-timer-text">{{ qRemain }}s</span>
          </div>
        </div>
        <div class="topbar-right">
          <button v-if="showBatchSkip" class="btn ghost small" @click="onBatchSkip">{{ t('skipBatchGame') || t('skipQ') }}</button>
          <button class="btn ghost small" @click="handleSkip">{{ t('skipQ') }}</button>
          <button class="btn ghost small" @click="pauseAsk">{{ t('back') }}</button>
        </div>
      </div>

      <!-- Main game area -->
      <div class="stage" v-if="current">
        <!-- Question row: fold sequence -->
        <div class="question-row">
          <div class="q-label">{{ t('foldedPaper') }}</div>
          <div class="fold-sequence">
            <template v-for="(step,i) in current.foldSteps">
              <div class="fold-cell" :key="'fs'+i">
                <div class="fold-paper">
                  <PaperSvg :shape="step.before.shape"
                            :fold-line="foldLineForStep(step)"
                            :fold-arrow="foldArrowForStep(step)"/>
                </div>
                <div class="fold-num">{{ i+1 }}</div>
              </div>
              <div class="fold-arrow" :key="'fa'+i">→</div>
            </template>
            <div class="fold-cell final" :key="'ff'">
              <div class="fold-paper big">
                <PaperSvg :shape="current.finalPaper.shape" :punches="current.punches"/>
              </div>
              <div class="fold-num final-tag">{{ t('punch') }}</div>
            </div>
          </div>
        </div>

        <!-- Options row -->
        <div class="options-row">
          <div class="q-label">{{ t('chooseAnswer') }}</div>
          <div class="options">
            <button v-for="(opt,i) in current.options" :key="i"
                    class="opt-btn"
                    :class="{
                      correct: revealed && i===current.correctIndex,
                      wrong: revealed && selectedIndex===i && i!==current.correctIndex,
                      disabled: revealed
                    }"
                    @click="onSelectOption($event, i)">
              <div class="opt-label">{{ 'ABCD'[i] }}</div>
              <div class="opt-paper">
                <PaperSvg :shape="fullSq" :holes="opt"/>
              </div>
              <div v-if="revealed && i===current.correctIndex" class="opt-mark ok">✔</div>
              <div v-if="revealed && selectedIndex===i && i!==current.correctIndex" class="opt-mark no">✘</div>
            </button>
          </div>
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
          <div class="result-trophy">
            <svg viewBox="0 0 64 64" width="1em" height="1em">
              <path d="M20 12 h24 v14 a12 12 0 0 1 -24 0 z" fill="#e8c46a" stroke="#8a6f47" stroke-width="2"/>
              <path d="M20 16 h-6 a6 6 0 0 0 0 12 h6" fill="none" stroke="#8a6f47" stroke-width="2"/>
              <path d="M44 16 h6 a6 6 0 0 1 0 12 h-6" fill="none" stroke="#8a6f47" stroke-width="2"/>
              <rect x="26" y="38" width="12" height="6" fill="#8a6f47"/>
              <rect x="18" y="44" width="28" height="7" rx="1.5" fill="#3d3226"/>
            </svg>
          </div>
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
          <button class="btn ghost" @click="view='home'">{{ t('home') }}</button>
          <button class="btn primary" @click="startFlow">{{ t('again') }}</button>
        </div>
      </div>
    </div>
    </transition>

  </div>
</template>

<script>
import { generateQuestion, DIFFICULTY_CONFIG, createPaper, applyFold } from './engine.js'
import { loadHistory as loadHist, saveRecord, clearHistory as clrHist } from './store.js'
import { resolveArchiveId, submitPbGameEndRecord, msToPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import PaperSvg from './components/PaperSvg.vue'

const GAME_TYPE = 'zhzt'

const DIFF = [
  { level:1, folds:1, holes:1, diag:false, coef:1   },
  { level:2, folds:2, holes:1, diag:false, coef:1.5 },
  { level:3, folds:1, holes:2, diag:true,  coef:2   },
  { level:4, folds:2, holes:2, diag:true,  coef:2.5 },
  { level:5, folds:3, holes:1, diag:true,  coef:3   },
  { level:6, folds:3, holes:2, diag:true,  coef:3.5 },
]
const DURATION_OPTS = [
  { val:60,  mins:1, desc:'dur_quick' },
  { val:180, mins:3, desc:'dur_normal' },
  { val:300, mins:5, desc:'dur_deep' },
]
const I18N = {
  cn:{
    title:'折痕侦探', subtitle:'空间想象 · 心理旋转 · 视知觉训练',
    start:'开始训练', rules:'规则介绍', history:'训练记录',
    back:'返回', tutorial:'新手教程', prev:'上一步', next:'下一步', skip:'跳过教程', done:'开始训练',
    choose_dur:'选择训练时长', min:'分钟', confirm_start:'开始训练',
    dur_quick:'快速体验', dur_normal:'标准训练', dur_deep:'深度训练',
    lv:'难度', score:'得分', remain:'剩余',
    gamePrompt:'根据折叠与打孔位置，推理出展开后的图案', skipQ:'跳过', skipBatchGame:'跳过游戏',
    foldedPaper:'折叠过程', punch:'打孔', chooseAnswer:'选择正确的展开图案',
    paused_q:'训练已暂停', paused_sub:'点击继续恢复训练，或结束返回主页', resume:'继续训练', quit:'结束返回',
    result:'训练完成', result_sub:'本次训练已完成，继续保持！', home:'返回主页', again:'再来一局',
    foldType:'折叠方式', foldCnt:'折叠次数', holeCnt:'打孔数量', coef:'系数',
    foldFlat:'对折', foldMix:'对折 / 对角折',
    rule1:'观察纸张的折叠方式和打孔位置，推理出纸张展开后的图案',
    rule2:'每 60 秒统计正确率：>90% 难度升级，<70% 难度降低',
    rule3:'得分 = 5 × 当前难度系数（每答对一题）；每题限时 15 秒',
    h_time:'时间', h_lv:'难度', h_dur:'时长', h_tot:'总数', h_ok:'成功', h_fail:'失败',
    h_rate:'成功率', h_rt:'平均反应', nohist:'暂无训练记录',
    lv_up:'难度升级', lv_down:'难度降低',
    correct_fb:'回答正确', wrong_fb:'回答错误', timeout_fb:'超时未答', skip_fb:'已跳过',
    clear:'清空', clearConfirmT:'清空所有记录？', clearConfirmS:'此操作不可撤销', confirm:'确定', cancel:'取消',
    tut_h1:'原始纸张', tut_h3:'折叠后', tut_h5:'展开后',
    tut_step1:'我们从一张正方形的纸开始。',
    tut_step2:'将纸沿虚线方向对折，纸张变成两层。',
    tut_step3:'在折叠后的纸上打一个孔，会同时穿过两层。',
    tut_step4:'展开后就会看到两个对称的孔。',
    tut_step5:'游戏中，请从四个选项中选出正确的展开图案。',
  },
  en:{
    title:'Crease Detective', subtitle:'Spatial · Mental Rotation · Visual Perception',
    start:'Start Training', rules:'Rules', history:'History',
    back:'Back', tutorial:'Tutorial', prev:'Prev', next:'Next', skip:'Skip', done:'Start',
    choose_dur:'Choose Duration', min:'min', confirm_start:'Start Training',
    dur_quick:'Quick', dur_normal:'Standard', dur_deep:'Extended',
    lv:'Level', score:'Score', remain:'Time',
    gamePrompt:'From folds and punches, deduce the unfolded pattern', skipQ:'Skip', skipBatchGame:'Skip Game',
    foldedPaper:'Fold Sequence', punch:'Punch', chooseAnswer:'Pick the correct unfolded pattern',
    paused_q:'Training Paused', paused_sub:'Resume to continue or quit to return', resume:'Resume', quit:'Quit',
    result:'Session Complete', result_sub:'Great job — keep it up!', home:'Home', again:'Play Again',
    foldType:'Fold Type', foldCnt:'Folds', holeCnt:'Holes', coef:'Coef',
    foldFlat:'Flat', foldMix:'Flat / Diagonal',
    rule1:'Observe how the paper is folded and punched, then deduce the unfolded pattern',
    rule2:'Accuracy is checked every 60s: >90% level up, <70% level down',
    rule3:'Score = 5 × difficulty coefficient per correct; 15 sec limit per question',
    h_time:'Time', h_lv:'Level', h_dur:'Duration', h_tot:'Total', h_ok:'OK', h_fail:'Fail',
    h_rate:'Rate', h_rt:'Avg RT', nohist:'No records yet',
    lv_up:'Level Up', lv_down:'Level Down',
    correct_fb:'Correct', wrong_fb:'Wrong', timeout_fb:'Time out', skip_fb:'Skipped',
    clear:'Clear', clearConfirmT:'Clear all records?', clearConfirmS:'This cannot be undone', confirm:'Confirm', cancel:'Cancel',
    tut_h1:'Original', tut_h3:'Folded', tut_h5:'Unfolded',
    tut_step1:'Start with a square sheet of paper.',
    tut_step2:'Fold along the dashed line — the paper doubles up.',
    tut_step3:'Punch one hole through the folded paper.',
    tut_step4:'Unfold to see two symmetric holes.',
    tut_step5:'In the game, choose the correct unfolded pattern from four options.',
  }
}

export default {
  name:'App',
  components:{ PaperSvg },
  data(){
    return {
      lang:'cn',
      view:'home',
      DIFF, DURATION_OPTS,
      tutorStep:0,
      pickedDur:null,
      askClearHist:false,
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score:0, remain:0, duration:60,
      qRemain:15, _curQTime:15,
      current:null, revealed:false, selectedIndex:-1,
      paused:false, feedback:null, levelToast:null,
      winCorrect:0, winTotal:0, winStart:0,
      session:{ score:0, total:0, correct:0, wrong:0, rate:0, avgRt:0 },
      rtSum:0, qStartAt:0,
      history:[],
      scale:1,
      archiveId: -1,
      showBatchSkip: false,
      fullSq:[[0,0],[1,0],[1,1],[0,1]]
    }
  },
  created(){
    this._mainTimer=null; this._qTimer=null; this._promptAudio=null
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed:{
    rootStyle(){ return { fontSize: (16*this.scale)+'px' } },
    tutorSteps(){
      const orig = createPaper()
      const folded = applyFold(orig, 'V_RL')
      const punchU = 0.25, punchV = 0.5
      return [
        { hint:this.t('tut_step1'), papers:[ { shape:orig.shape, label:'tut_h1' } ] },
        { hint:this.t('tut_step2'), papers:[
          { shape:orig.shape, label:'tut_h1', foldLine:{x1:0.5,y1:0,x2:0.5,y2:1}, foldArrow:'M 90,50 Q 50,25 15,50' }
        ] },
        { hint:this.t('tut_step3'), papers:[
          { shape:folded.shape, label:'tut_h3', punches:[{u:punchU,v:punchV,r:0.07}] }
        ] },
        { hint:this.t('tut_step4'), papers:[
          { shape:folded.shape, label:'tut_h3', punches:[{u:punchU,v:punchV,r:0.07}] },
          { shape:orig.shape, label:'tut_h5', holes:[{x:0.25,y:0.5,r:0.07},{x:0.75,y:0.5,r:0.07}] }
        ] },
        { hint:this.t('tut_step5'), papers:[
          { shape:folded.shape, label:'tut_h3', punches:[{u:punchU,v:punchV,r:0.07}] },
          { shape:orig.shape, label:'tut_h5', holes:[{x:0.25,y:0.5,r:0.07},{x:0.75,y:0.5,r:0.07}] }
        ] }
      ]
    },
    tutorCurrent(){ return this.tutorSteps[this.tutorStep] }
  },
  mounted(){
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    if (window.visualViewport){
      window.visualViewport.addEventListener('resize', this.updateScale)
      window.visualViewport.addEventListener('scroll', this.updateScale)
    }
    this.loadHistory()
    const saved = localStorage.getItem('g45_lang')
    if (saved==='cn' || saved==='en') this.lang = saved
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
  watch:{ lang(v){ try{ localStorage.setItem('g45_lang', v) }catch(e){} } },
  methods:{
    t(k){ return (I18N[this.lang] && I18N[this.lang][k]) || k },
    toggleLang(){ if (this.view==='game') return; this.lang = this.lang==='cn'?'en':'cn' },
    fmtTime(s){ s=Math.max(0,s|0); const m=String(Math.floor(s/60)).padStart(2,'0'); const r=String(s%60).padStart(2,'0'); return `${m}:${r}` },
    updateScale(){
      const vv = window.visualViewport
      const w = vv ? vv.width  : window.innerWidth
      const h = vv ? vv.height : window.innerHeight
      this.scale = Math.min(w/1280, h/720)
      if (this.scale < 0.4) this.scale = 0.4
      if (this.scale > 1.8) this.scale = 1.8
      document.documentElement.style.setProperty('--app-h', h + 'px')
    },
    startFlow(){ this.tutorStep=0; this.pickedDur=null; this.view='tutorial' },
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
    loadHistory(){ this.history = loadHist().map(r=>this.normalizeHistRec(r)) },
    normalizeHistRec(r){
      return {
        time: r.at ? this.fmtDate(r.at) : (r.time||''),
        level: r.finalDifficulty || r.level || 1,
        duration: r.durationSec || r.duration || 0,
        total: r.total || 0,
        correct: r.correct || 0,
        wrong: r.wrong || 0,
        rate: (r.total ? Math.round((r.correct||0)/r.total*100) : 0),
        avgRt: r.avgTimeMs != null ? r.avgTimeMs : (r.avgRt || 0),
        score: r.score || 0
      }
    },
    fmtDate(iso){ const d=new Date(iso); const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}` },
    doClearHist(){ clrHist(); this.history=[]; this.askClearHist=false },

    beginGame(dur){
      this.duration=dur; this.remain=dur
      this.score=0; this.level=getBatchStartDifficultyForGame(GAME_TYPE)
      this.winCorrect=0; this.winTotal=0; this.winStart=0
      this.session={ score:0, total:0, correct:0, wrong:0, rate:0, avgRt:0 }
      this.rtSum=0
      this.view='game'; this.paused=false
      this.feedback=null; this.levelToast=null
      this.$nextTick(()=>{ this.startMainTimer(); this.nextQuestion() })
    },
    startMainTimer(){
      this.clearTimers()
      this._mainTimer=setInterval(()=>{
        if (this.paused) return
        this.remain--
        const elapsed=this.duration-this.remain
        if (elapsed-this.winStart>=60){ this.evaluateWindow() }
        if (this.remain<=0){ this.endGame(false) }
      },1000)
    },
    evaluateWindow(){
      let changed=null
      if (this.winTotal>0){
        const rate=this.winCorrect/this.winTotal
        if (rate>=0.9 && this.level<6){ this.level++; changed='up' }
        else if (rate<=0.7 && this.level>1){ this.level--; changed='down' }
      }
      this.winCorrect=0; this.winTotal=0
      this.winStart=this.duration-this.remain
      if (changed){
        this.levelToast={ dir:changed }
        setTimeout(()=>{ this.levelToast=null },1600)
      }
    },
    nextQuestion(){
      this.current = generateQuestion(this.level)
      this.selectedIndex=-1; this.revealed=false; this.feedback=null
      this._curQTime=15; this.qRemain=15
      this.qStartAt=Date.now()
      this.playPrompt()
      clearInterval(this._qTimer)
      this._qTimer=setInterval(()=>{
        if (this.paused) return
        if (this.revealed) return
        this.qRemain--
        if (this.qRemain<=0) this.handleTimeout()
      },1000)
    },
    onSelectOption(e, i){
      if (e && e.currentTarget && e.currentTarget.blur) e.currentTarget.blur()
      this.selectOption(i)
    },
    selectOption(i){
      if (this.revealed || this.paused) return
      this.selectedIndex=i; this.revealed=true
      const rt=Date.now()-this.qStartAt
      this.rtSum+=rt
      const correct = i===this.current.correctIndex
      this.session.total++; this.winTotal++
      if (correct){
        const cfg=DIFFICULTY_CONFIG[this.level]
        this.score += Math.round(5*cfg.coef)
        this.session.correct++; this.winCorrect++
        this.feedback={ type:'ok', text:this.t('correct_fb') }
      } else {
        this.session.wrong++
        this.feedback={ type:'no', text:this.t('wrong_fb') }
      }
      setTimeout(()=>{ this.feedback=null; if (this.view==='game' && !this.paused && this.remain>0) this.nextQuestion() },900)
    },
    handleTimeout(){
      if (this.revealed) return
      this.revealed=true
      this.session.total++; this.session.wrong++; this.winTotal++
      this.rtSum += this._curQTime*1000
      this.feedback={ type:'no', text:this.t('timeout_fb') }
      setTimeout(()=>{ this.feedback=null; if (this.view==='game' && !this.paused && this.remain>0) this.nextQuestion() },900)
    },
    handleSkip(){
      if (this.revealed || this.paused) return
      this.revealed=true
      this.session.total++; this.session.wrong++; this.winTotal++
      this.rtSum += (Date.now()-this.qStartAt)
      this.feedback={ type:'no', text:this.t('skip_fb') }
      setTimeout(()=>{ this.feedback=null; if (this.view==='game' && !this.paused && this.remain>0) this.nextQuestion() },500)
    },
    pauseAsk(){ this.paused=true; this.stopPrompt() },
    resumeGame(){ this.paused=false },
    endGame(userQuit){
      this.clearTimers()
      this.stopPrompt()
      const s=this.session
      s.score=Math.round(this.score)
      s.rate = s.total ? Math.round(100*s.correct/s.total) : 0
      s.avgRt = s.total ? Math.round(this.rtSum/s.total) : 0
      const rec={
        at: new Date().toISOString(),
        finalDifficulty: this.level,
        durationSec: userQuit ? (this.duration-this.remain) : this.duration,
        total: s.total, correct: s.correct, wrong: s.wrong,
        avgTimeMs: s.avgRt, score: s.score
      }
      saveRecord(rec)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: msToPbGameSeconds(s.avgRt),
        score: s.score || 0,
        successCount: s.correct || 0,
        failCount: s.wrong || 0,
        trainDuration: userQuit ? (this.duration - this.remain) : this.duration,
        difficultyLevel: this.level || 1,
      })
      this.paused=false
      this.view='result'
    },
    onSkipClick(){
      // Reserved for skip-current-question logic.
    },
    clearTimers(){ clearInterval(this._mainTimer); this._mainTimer=null; clearInterval(this._qTimer); this._qTimer=null },
    playPrompt(){
      try {
        if (this._promptAudio){ this._promptAudio.pause(); this._promptAudio=null }
        const src = (this.lang==='en' ? 'voice/english/1.mp3' : 'voice/chinese/1.mp3')
        const a = new Audio(src)
        this._promptAudio = a
        a.play().catch(()=>{})
      } catch(e){}
    },
    stopPrompt(){ if (this._promptAudio){ try{ this._promptAudio.pause() }catch(e){} this._promptAudio=null } },

    foldLineForStep(step){
      const { x0,y0,x1,y1 } = step.before.rect
      const mx=(x0+x1)/2, my=(y0+y1)/2
      const t=step.foldType
      if (t==='V_LR' || t==='V_RL') return { x1:mx,y1:y0,x2:mx,y2:y1 }
      if (t==='H_TB' || t==='H_BT') return { x1:x0,y1:my,x2:x1,y2:my }
      if (t==='D_TL' || t==='D_BR') return { x1:x0,y1:y0,x2:x1,y2:y1 }
      if (t==='D_TR' || t==='D_BL') return { x1:x1,y1:y0,x2:x0,y2:y1 }
      return null
    },
    foldArrowForStep(step){
      const { x0,y0,x1,y1 } = step.before.rect
      const cx=(x0+x1)/2, cy=(y0+y1)/2
      const t=step.foldType
      const seg={
        V_RL:{ from:[x1-0.08, cy], to:[x0+0.08, cy] },
        V_LR:{ from:[x0+0.08, cy], to:[x1-0.08, cy] },
        H_TB:{ from:[cx, y0+0.08], to:[cx, y1-0.08] },
        H_BT:{ from:[cx, y1-0.08], to:[cx, y0+0.08] },
        D_BR:{ from:[x0+0.12,y0+0.12], to:[x1-0.14,y1-0.14] },
        D_TL:{ from:[x1-0.12,y1-0.12], to:[x0+0.14,y0+0.14] },
        D_BL:{ from:[x1-0.12,y0+0.12], to:[x0+0.14,y1-0.14] },
        D_TR:{ from:[x0+0.12,y1-0.12], to:[x1-0.14,y0+0.14] }
      }[t]
      if (!seg) return null
      const [fx,fy]=seg.from, [tx,ty]=seg.to
      const midx=(fx+tx)/2, midy=(fy+ty)/2
      const dx=tx-fx, dy=ty-fy, len=Math.hypot(dx,dy)||1
      const nx=-dy/len, ny=dx/len
      const cxp=(midx+nx*0.1)*100, cyp=(midy+ny*0.1)*100
      return `M ${(fx*100).toFixed(2)},${(fy*100).toFixed(2)} Q ${cxp.toFixed(2)},${cyp.toFixed(2)} ${(tx*100).toFixed(2)},${(ty*100).toFixed(2)}`
    }
  }
}
</script>

<style>
/* ========== Reset & base ========== */
* { margin:0; padding:0; box-sizing:border-box; }
html, body, #app { width:100%; height:100%; overflow:hidden; font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif; -webkit-font-smoothing: antialiased; }
#app { height:100vh; height:100dvh; height:var(--app-h, 100dvh); }
body {
  background: #f4f0e6;
  color: #2a2419;
}
#app {
  background:
    radial-gradient(ellipse 1200px 800px at 20% 10%, rgba(255,255,255,0.7), transparent 60%),
    radial-gradient(ellipse 900px 700px at 90% 90%, rgba(200,147,79,0.09), transparent 60%),
    linear-gradient(135deg, #f6f2e8 0%, #ebe4d3 100%);
}
button { font-family:inherit; }
button:focus-visible { outline: 2px solid rgba(138,111,71,0.4); outline-offset: 2px; }

.page { width:100%; height:100vh; height:100dvh; height:var(--app-h, 100dvh); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2vh; position:relative; overflow:hidden; }
.panel { gap:1em; }

/* ========== Transitions ========== */
.fade-enter-active,.fade-leave-active { transition: opacity .35s ease, transform .35s ease; }
.fade-enter,.fade-leave-to { opacity:0; transform: translateY(8px); }
.pop-enter-active,.pop-leave-active { transition: transform .3s ease, opacity .3s ease; }
.pop-enter,.pop-leave-to { opacity:0; transform: scale(.85); }

/* ========== Home ========== */
.home { justify-content:center; align-items:center; gap:2.5em; z-index:1; }
.bg-decor { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.paper-orn { position:absolute; background: linear-gradient(135deg, #fdfaf0, #ecdfbf); box-shadow: 0 20px 50px rgba(90,70,40,0.1); border-radius: 3px; opacity:0.55; }
.paper-orn.p1 { width:22em; height:22em; top:-8em; left:-8em; transform: rotate(-15deg); }
.paper-orn.p2 { width:18em; height:18em; bottom:-6em; right:-5em; transform: rotate(18deg); }
.paper-orn.p3 { width:12em; height:12em; top:60%; left:15%; transform: rotate(28deg); opacity:0.4; }

.brand { display:flex; flex-direction:column; align-items:center; gap:0.5em; z-index:1; text-align:center; }
.brand-logo { font-size:5em; line-height:1; filter: drop-shadow(0 8px 18px rgba(138,111,71,0.25)); }
.title { font-size:3.2em; font-weight:700; letter-spacing:0.08em; color:#2a2419; font-family:'Georgia','Songti SC','STSong',serif; margin-top:0.2em; }
.subtitle { font-size:1.05em; opacity:0.55; margin-top:0.4em; letter-spacing:0.15em; color:#6b5a3a; }

.menu { display:flex; flex-direction:column; gap:0.9em; width:min(24em,80vw); z-index:1; }
.cta {
  display:flex; align-items:center; gap:1em; padding:1.05em 1.5em;
  font-size:1.15em; font-weight:600; border:none; border-radius:0.7em; cursor:pointer;
  transition: transform .15s ease, box-shadow .2s ease;
}
.cta-ico { font-size:0.9em; width:1.8em; height:1.8em; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; }
.cta-txt { flex:1; text-align:left; letter-spacing:0.05em; }
.cta:hover { transform: translateY(-2px); }
.cta-primary { background: linear-gradient(135deg,#3d3226,#2a2419); color:#fdfaf0; box-shadow: 0 8px 24px rgba(42,36,25,0.25); }
.cta-primary .cta-ico { background: rgba(232,196,106,0.25); color:#e8c46a; }
.cta-primary:hover { box-shadow: 0 12px 32px rgba(42,36,25,0.35); }
.cta-ghost { background: #fdfaf0; color:#3d3226; border:1px solid rgba(138,111,71,0.25); }
.cta-ghost .cta-ico { background: rgba(138,111,71,0.12); color:#8a6f47; }
.cta-ghost:hover { background: #fff; box-shadow: 0 8px 20px rgba(90,70,40,0.1); }

.lang-btn { position:absolute; top:1.5em; right:1.5em; width:3em; height:3em; border-radius:50%; background:#fdfaf0; border:1px solid rgba(138,111,71,0.3); color:#3d3226; cursor:pointer; font-weight:700; font-size:1em; letter-spacing:0.05em; z-index:2; transition: all .2s; font-family: 'Georgia',serif; }
.lang-btn:hover { transform: scale(1.06); box-shadow: 0 6px 16px rgba(90,70,40,0.15); }
.foot-hint { position:absolute; bottom:1.5em; font-size:0.8em; opacity:0.4; letter-spacing:0.25em; z-index:1; color:#6b5a3a; }

/* ========== Buttons ========== */
.btn { padding:0.85em 1.7em; font-size:1.05em; font-weight:600; border:none; border-radius:0.6em; cursor:pointer; transition: transform .15s ease, box-shadow .2s ease, background .2s; letter-spacing:0.05em; }
.btn:disabled { opacity:0.35; cursor:not-allowed; }
.btn.primary { background: linear-gradient(135deg,#3d3226,#2a2419); color:#fdfaf0; box-shadow: 0 6px 18px rgba(42,36,25,0.2); }
.btn.primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(42,36,25,0.3); }
.btn.primary.large { padding:1em 2.2em; font-size:1.15em; }
.btn.ghost { background: #fdfaf0; color:#3d3226; border:1px solid rgba(138,111,71,0.25); }
.btn.ghost:hover:not(:disabled) { background: #fff; box-shadow: 0 4px 12px rgba(90,70,40,0.08); }
.btn.text { background:transparent; color:#8a6f47; opacity:0.7; }
.btn.text:hover { opacity:1; }
.btn.small { padding:0.5em 1.1em; font-size:0.95em; border-radius:2em; }
.btn.danger { background: linear-gradient(135deg,#a5432b,#722c1c); color:#fdfaf0; box-shadow: 0 6px 18px rgba(114,44,28,0.3); }
.btn.danger:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 10px 24px rgba(114,44,28,0.4); }

.icon-btn { width:2.6em; height:2.6em; border-radius:50%; border:1px solid rgba(138,111,71,0.25); background:#fdfaf0; color:#3d3226; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1em; transition: all .2s; }
.icon-btn:hover { background:#fff; box-shadow: 0 4px 12px rgba(90,70,40,0.1); }
.icon-btn.round { font-size:1.2em; }

/* ========== Card ========== */
.card {
  background:#fdfaf0;
  border-radius:1.2em;
  box-shadow: 0 30px 80px rgba(60,45,20,0.12), 0 1px 0 rgba(255,255,255,0.8) inset;
  padding: 2em 2.2em; z-index:1;
  width:min(50em,92vw);
  border: 1px solid rgba(138,111,71,0.1);
}
.card.wide { width:min(72em,94vw); max-height:88vh; display:flex; flex-direction:column; }
.card.mid { width:min(60em,94vw); }
.card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.4em; padding-bottom:1em; border-bottom:1px solid rgba(138,111,71,0.15); }
.card-head h2 { font-size:1.7em; letter-spacing:0.05em; color:#2a2419; font-family:'Georgia','Songti SC',serif; font-weight:700; }

/* ========== Rules ========== */
.rules-body { overflow:auto; padding-right:0.5em; }
.rule-item { display:flex; gap:1em; align-items:flex-start; margin-bottom:1em; padding:1em 1.2em; background: rgba(138,111,71,0.05); border-radius:0.6em; border-left:3px solid #8a6f47; }
.rule-item p { line-height:1.7; color:#3d3226; font-size:1.02em; }
.badge { width:2em; height:2em; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; background: linear-gradient(135deg,#8a6f47,#5c4a30); color:#fdfaf0; font-size:0.95em; }

.diff-table { margin-top:1.2em; border-radius:0.7em; overflow:hidden; border:1px solid rgba(138,111,71,0.15); }
.dt-head, .dt-row { display:grid; grid-template-columns: 1fr 1.8fr 1fr 1fr 1fr; gap:0.5em; align-items:center; }
.dt-head { background: rgba(138,111,71,0.12); padding:0.85em 1em; font-weight:700; letter-spacing:0.05em; text-align:center; color:#5c4a30; font-size:0.95em; }
.dt-row { padding:0.85em 1em; text-align:center; border-top:1px solid rgba(138,111,71,0.1); color:#3d3226; }
.dt-row:hover { background: rgba(138,111,71,0.04); }

.lv-chip { display:inline-block; padding:0.2em 0.85em; border-radius:1em; font-size:0.9em; font-weight:700; background: linear-gradient(135deg,#3d3226,#2a2419); color:#fdfaf0; letter-spacing:0.05em; font-family:'Georgia',serif; }

/* ========== History ========== */
.hist-wrap { overflow:auto; padding-right:0.5em; max-height:65vh; }
.empty { text-align:center; padding:3.5em 1em; color:#8a6f47; opacity:0.7; }
.empty-ico { font-size:3.5em; margin-bottom:0.4em; line-height:1; }
.hist-list { display:grid; gap:1em; grid-template-columns: repeat(auto-fill, minmax(21em, 1fr)); }
.hist-card { background: rgba(255,252,242,0.7); padding:1.1em 1.3em; border-radius:0.7em; border:1px solid rgba(138,111,71,0.15); }
.hc-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.7em; }
.hc-time { font-size:0.9em; color:#8a6f47; }
.hc-score { font-size:1.7em; font-weight:800; color:#2a2419; font-family:'Georgia',serif; }
.hc-score span { font-size:0.5em; color:#8a6f47; margin-left:0.3em; font-weight:500; }
.hc-stats { display:grid; grid-template-columns: repeat(2,1fr); gap:0.4em 1.2em; font-size:0.92em; margin-bottom:0.7em; color:#3d3226; }
.hc-stats > div { display:flex; justify-content:space-between; }
.hc-stats span { color:#8a6f47; }
.hc-stats b.ok { color:#4b7a3a; }
.hc-stats b.no { color:#a5432b; }
.hc-bar { height:0.4em; background: rgba(138,111,71,0.15); border-radius:1em; overflow:hidden; }
.hc-bar-fill { height:100%; background: linear-gradient(90deg,#8a6f47,#3d3226); transition: width .4s; }

/* ========== Tutorial ========== */
.steps-dots { display:flex; gap:0.4em; }
.dot { width:0.55em; height:0.55em; border-radius:50%; background: rgba(138,111,71,0.25); transition: all .3s; }
.dot.on { background:#3d3226; width:1.6em; border-radius:1em; }
.tutor-demo { background: rgba(138,111,71,0.05); border:1px solid rgba(138,111,71,0.15); border-radius:0.8em; padding:1.5em; margin-bottom:1.2em; }
.demo-scene { display:flex; align-items:center; justify-content:center; gap:1.5em; padding:0.5em 0 1.2em; flex-wrap:wrap; min-height:12em; }
.demo-paper { display:flex; flex-direction:column; align-items:center; gap:0.6em; }
.dp-inner { width:11em; height:11em; background:rgba(138,111,71,0.06); border:1px solid rgba(138,111,71,0.2); border-radius:0.5em; padding:0.6em; box-shadow: 0 6px 20px rgba(90,70,40,0.1); }
.dp-label { font-size:0.9em; color:#8a6f47; letter-spacing:0.05em; font-weight:600; }
.demo-arrow { font-size:2em; color:#8a6f47; opacity:0.6; }
.demo-hint { text-align:center; font-size:1.05em; color:#3d3226; padding:0.9em; background:#fff; border-radius:0.5em; line-height:1.5; letter-spacing:0.02em; }
.tutor-nav { display:flex; gap:0.7em; justify-content:space-between; align-items:center; }
.tutor-nav .btn { min-width:8em; }

/* ========== Duration ========== */
.dur-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:1.5em; margin: 2em 0 2em; }
.dur-card {
  background:#fff; border:2px solid rgba(138,111,71,0.15); border-radius:1em;
  padding:2em 1em; cursor:pointer; text-align:center; color:#2a2419; transition: all .2s;
  min-height:15em; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:0.5em;
}
.dur-card:hover { border-color:#8a6f47; transform: translateY(-4px); box-shadow: 0 12px 30px rgba(90,70,40,0.12); }
.dur-card.sel { border-color:#3d3226; background: linear-gradient(135deg,#3d3226,#2a2419); color:#fdfaf0; box-shadow: 0 14px 34px rgba(42,36,25,0.3); transform: translateY(-4px); }
.dur-mins { font-size: 7em; font-weight: 800; line-height: 1; letter-spacing: -0.03em; font-family:'Georgia',serif; color:inherit; }
.dur-card.sel .dur-mins { color:#e8c46a; }
.dur-unit { font-size:1.4em; font-weight:600; letter-spacing:0.1em; margin-top:-0.1em; color:#8a6f47; }
.dur-card.sel .dur-unit { color:#dccdac; }
.dur-desc { font-size:1em; margin-top:1em; padding-top:0.9em; border-top:1px solid rgba(138,111,71,0.2); width:70%; letter-spacing:0.05em; color:#8a6f47; font-weight:500; }
.dur-card.sel .dur-desc { color:#dccdac; border-top-color: rgba(220,205,172,0.25); }
.dur-actions { display:flex; justify-content:space-between; align-items:center; gap:1em; margin-top:0.5em; }
.dur-actions .btn { min-width:8em; }

/* ========== Game ========== */
.game { justify-content:flex-start; padding:0.8em 1em; gap:0.8em; }
.topbar {
  width:100%; display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:1em;
  background:#fdfaf0; border:1px solid rgba(138,111,71,0.15); border-radius:0.7em;
  padding:0.6em 0.9em; box-shadow: 0 4px 16px rgba(90,70,40,0.06);
}
.hud { display:flex; gap:0.7em; }
.hud-item { background: rgba(138,111,71,0.08); padding:0.4em 0.8em; border-radius:0.5em; }
.hud-lbl { font-size:0.72em; color:#8a6f47; letter-spacing:0.12em; text-transform:uppercase; font-weight:600; }
.hud-val { font-size:1.4em; font-weight:700; margin-top:0.15em; color:#2a2419; font-family:'Georgia',serif; }
.hud-val.mono { font-variant-numeric: tabular-nums; }

.prompt-wrap { display:flex; flex-direction:column; align-items:center; gap:0.5em; min-width:0; }
.rule-pill { background: rgba(138,111,71,0.08); padding:0.5em 1.2em; border-radius:2em; font-size:0.95em; color:#3d3226; font-weight:600; letter-spacing:0.05em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
.q-timer { position:relative; width:min(24em,60%); height:0.5em; background: rgba(138,111,71,0.15); border-radius:1em; overflow:hidden; }
.q-timer-bar { height:100%; background: linear-gradient(90deg,#8a6f47,#3d3226); transition: width 1s linear; border-radius:1em; }
.q-timer-bar.warn { background: linear-gradient(90deg,#a5432b,#722c1c); }
.q-timer-text { position:absolute; right:0; top:-1.4em; font-size:0.78em; color:#8a6f47; font-weight:700; letter-spacing:0.05em; }

.topbar-right { display:flex; gap:0.6em; align-items:center; }

.stage { flex:1; width:100%; display:flex; flex-direction:column; gap:1em; min-height:0; position:relative; }

/* --- Question row: fold sequence --- */
.question-row {
  background:#fdfaf0; border:1px solid rgba(138,111,71,0.15); border-radius:0.7em;
  padding:0.7em 1em; display:flex; flex-direction:column; gap:0.5em;
  box-shadow: 0 4px 16px rgba(90,70,40,0.06);
}
.q-label { font-size:0.85em; color:#8a6f47; letter-spacing:0.2em; text-transform:uppercase; font-weight:700; text-align:center; }
.fold-sequence { display:flex; align-items:center; justify-content:center; gap:0.8em; flex-wrap:wrap; }
.fold-cell { display:flex; flex-direction:column; align-items:center; gap:0.4em; }
.fold-paper {
  width:7em; height:7em;
  background:rgba(138,111,71,0.06); border:1px solid rgba(138,111,71,0.25); border-radius:0.4em;
  padding:0.5em; box-shadow: 0 6px 18px rgba(90,70,40,0.1);
}
.fold-paper.big {
  width:9em; height:9em;
  border:1.5px solid #8a6f47;
  box-shadow: 0 10px 26px rgba(138,111,71,0.2);
}
.fold-num { font-size:0.85em; color:#8a6f47; font-weight:600; letter-spacing:0.05em; }
.fold-num.final-tag { color:#a5432b; font-weight:700; }
.fold-arrow { font-size:1.6em; color:#8a6f47; opacity:0.55; font-weight:300; }

/* --- Options row --- */
.options-row {
  flex:1;
  background:#fdfaf0; border:1px solid rgba(138,111,71,0.15); border-radius:0.7em;
  padding:0.7em 1em; display:flex; flex-direction:column; gap:0.5em; min-height:0;
  box-shadow: 0 4px 16px rgba(90,70,40,0.06);
}
.options { flex:1; display:grid; grid-template-columns: repeat(4,1fr); gap:1em; min-height:0; }
.opt-btn {
  position:relative; background:#fff; border:2px solid rgba(138,111,71,0.2);
  border-radius:0.8em; padding:0.8em; cursor:pointer; color:#2a2419;
  display:flex; flex-direction:column; align-items:center; gap:0.5em;
  transition: transform .15s ease, box-shadow .2s ease, border-color .2s;
  min-height:0;
}
.opt-btn:hover:not(.disabled) { border-color:#8a6f47; }
@media (hover: hover) {
  .opt-btn:hover:not(.disabled) { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(90,70,40,0.15); }
}
.opt-btn.disabled { cursor:default; }
.opt-btn:focus { outline:none; }
.opt-btn:focus-visible { outline: 2px solid rgba(138,111,71,0.4); outline-offset: 2px; }
.opt-btn.correct { border-color:#4b7a3a; background: linear-gradient(135deg, rgba(75,122,58,0.1), rgba(75,122,58,0.02)); animation: pop .4s ease; }
.opt-btn.wrong { border-color:#a5432b; background: linear-gradient(135deg, rgba(165,67,43,0.1), rgba(165,67,43,0.02)); animation: shakeX .35s ease; }
@keyframes pop { 0%,100% { transform:none } 50% { transform: scale(1.04) } }
@keyframes shakeX { 0%,100% { transform:none } 25% { transform:translateX(-6px) } 75% { transform:translateX(6px) } }
.opt-label { font-size:1em; font-weight:800; letter-spacing:0.15em; color:#8a6f47; font-family:'Georgia',serif; }
.opt-paper { flex:1; width:100%; min-height:0; display:flex; align-items:center; justify-content:center; background: rgba(138,111,71,0.06); border-radius:0.4em; padding:0.6em; }
.opt-paper > svg { width:100%; height:100%; display:block; }
.opt-mark { position:absolute; top:0.55em; right:0.55em; width:1.8em; height:1.8em; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fdfaf0; font-size:1em; }
.opt-mark.ok { background: linear-gradient(135deg,#4b7a3a,#2f5525); }
.opt-mark.no { background: linear-gradient(135deg,#a5432b,#722c1c); }

/* --- Feedback / toast --- */
.feedback { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; z-index:200; }
.fb-icon { font-size:8em; font-weight:900; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.15)); }
.fb-text { font-size:1.8em; font-weight:700; margin-top:0.2em; letter-spacing:0.1em; }
.feedback.ok .fb-icon, .feedback.ok .fb-text { color:#4b7a3a; }
.feedback.no .fb-icon, .feedback.no .fb-text { color:#a5432b; }

.level-toast { position:absolute; top:1em; left:50%; transform: translateX(-50%); padding:0.7em 1.4em; border-radius:2em; display:flex; align-items:center; gap:0.5em; font-weight:700; font-size:1em; box-shadow: 0 8px 24px rgba(0,0,0,0.15); color:#fdfaf0; z-index:150; }
.level-toast.up { background: linear-gradient(135deg,#4b7a3a,#2f5525); }
.level-toast.down { background: linear-gradient(135deg,#a5432b,#722c1c); }

/* ========== Modal ========== */
.modal { position:fixed; inset:0; background: rgba(42,36,25,0.5); backdrop-filter: blur(6px); display:flex; align-items:center; justify-content:center; z-index:300; }
.modal-box { text-align:center; padding:2.2em 2.5em; min-width:min(28em,90vw); }
.modal-icon { font-size:2.6em; margin-bottom:0.3em; color:#8a6f47; }
.modal-box h3 { font-size:1.5em; margin-bottom:0.4em; font-family:'Georgia','Songti SC',serif; color:#2a2419; letter-spacing:0.03em; }
.modal-sub { color:#8a6f47; margin-bottom:1.5em; font-size:1em; letter-spacing:0.03em; }
.modal-btns { display:flex; gap:1em; justify-content:center; }
.modal-btns .btn { min-width:8em; }

/* ========== Result ========== */
.result-head { text-align:center; margin-bottom:0.5em; }
.result-trophy { font-size:4em; margin-bottom:0.2em; line-height:1; filter: drop-shadow(0 6px 14px rgba(232,196,106,0.4)); }
.result-head h2 { font-size:2em; margin-bottom:0.3em; color:#2a2419; font-family:'Georgia','Songti SC',serif; letter-spacing:0.05em; }
.result-sub { color:#8a6f47; font-size:1em; }
.result-score { text-align:center; margin:1.5em 0; padding:1.5em; background: linear-gradient(135deg,#3d3226,#2a2419); border-radius:0.9em; box-shadow: 0 15px 35px rgba(42,36,25,0.2); }
.rs-val { font-size:5em; font-weight:800; color:#e8c46a; line-height:1; font-family:'Georgia',serif; letter-spacing:-0.02em; }
.rs-unit { display:block; color:#dccdac; letter-spacing:0.25em; margin-top:0.3em; font-size:0.85em; text-transform:uppercase; font-weight:600; }
.result-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:0.8em; margin-bottom:1.5em; }
.rg-item { background: rgba(138,111,71,0.06); border:1px solid rgba(138,111,71,0.15); padding:1em; border-radius:0.7em; text-align:center; }
.rg-item.ok { border-color: rgba(75,122,58,0.35); background: rgba(75,122,58,0.05); }
.rg-item.no { border-color: rgba(165,67,43,0.35); background: rgba(165,67,43,0.05); }
.rg-lbl { font-size:0.78em; color:#8a6f47; letter-spacing:0.1em; text-transform:uppercase; font-weight:600; }
.rg-val { font-size:1.6em; font-weight:800; margin-top:0.2em; color:#2a2419; font-family:'Georgia',serif; }
.rg-val span { font-size:0.55em; color:#8a6f47; margin-left:0.2em; font-weight:500; }
.rg-item.ok .rg-val { color:#4b7a3a; }
.rg-item.no .rg-val { color:#a5432b; }
.result-actions { display:flex; gap:1em; justify-content:center; }
.result-actions .btn { min-width:9em; }

/* Scrollbar */
::-webkit-scrollbar { width:8px; height:8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(138,111,71,0.35); border-radius:4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(138,111,71,0.6); }
</style>
