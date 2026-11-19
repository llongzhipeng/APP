<template>
  <div id="app" :class="['theme', lang]">
    <!-- Fluid stage that scales to viewport, keeps a 16:9 design area -->
    <div class="stage-wrap" :style="stageStyle">
      <div class="stage">
        <!-- ================= HOME ================= -->
        <transition name="fade">
          <div v-if="screen==='home'" class="scene home">
            <div class="bg bg-home">
              <div class="blob b1"></div>
              <div class="blob b2"></div>
              <div class="blob b3"></div>
              <div class="grid-lines"></div>
            </div>
            <button class="lang-btn" @click="toggleLang" v-if="langBtnVisible">
              <span class="globe">🌐</span>{{ t.lang }}
            </button>

            <div class="home-inner">
              <div class="home-left">
                <div class="badge">EDU · MEMORY TRAINING</div>
                <h1 class="title">{{ t.appTitle }}</h1>
                <p class="subtitle">{{ t.appSubtitle }}</p>
                <div class="home-btns">
                  <button class="btn primary" @click="goTutorial">
                    <span class="ico">▶</span>{{ t.start }}
                  </button>
                  <button class="btn ghost" @click="showRules=true">
                    <span class="ico">📖</span>{{ t.rules }}
                  </button>
                  <button class="btn ghost" @click="showHistory=true">
                    <span class="ico">🏅</span>{{ t.history }}
                  </button>
                </div>
              </div>
              <div class="home-right">
                <div class="hero-card">
                  <Teacher :speaking="true" :size="'hero'"/>
                  <div class="floating-words">
                    <span class="fw fw1">{{ lang==='zh'?'苹果':'apple' }}</span>
                    <span class="fw fw2">{{ lang==='zh'?'太阳':'sun' }}</span>
                    <span class="fw fw3">{{ lang==='zh'?'火车':'train' }}</span>
                    <span class="fw fw4">{{ lang==='zh'?'月亮':'moon' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- ============ DURATION SELECT ============ -->
        <transition name="fade">
          <div v-if="screen==='duration'" class="scene duration">
            <div class="bg bg-home"><div class="blob b1"></div><div class="blob b2"></div></div>
            <div class="dur-inner">
              <h2 class="dur-title">{{ t.durationTitle }}</h2>
              <div class="dur-cards">
                <div v-for="m in [1,3,5]" :key="m"
                     :class="['dur-card', {active: durationMin===m}]"
                     @click="durationMin=m">
                  <div class="dur-num">{{ m }}</div>
                  <div class="dur-lbl">{{ t.minute }}</div>
                  <div class="dur-glow"></div>
                </div>
              </div>
              <div class="dur-actions">
                <button class="btn ghost" @click="screen='home'">
                  <span class="ico">←</span>{{ t.back }}
                </button>
                <button class="btn primary" @click="startGame">
                  <span class="ico">▶</span>{{ t.startGame }}
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ================ GAME =================== -->
        <transition name="fade">
          <div v-if="screen==='game'" class="scene game">
            <!-- Classroom background -->
            <div class="bg bg-class">
              <div class="cls-wall"></div>
              <div class="cls-floor"></div>
              <div class="cls-board">
                <div class="board-frame">
                  <div class="board-inner">
                    <div class="chalk-line l1"></div>
                    <div class="chalk-line l2"></div>
                    <div class="prompt-box">
                      <div class="prompt-title">{{ promptTitle }}</div>
                      <div class="prompt-sub">
                        <template v-if="phase==='listen'">
                          <span class="dot d1"></span><span class="dot d2"></span><span class="dot d3"></span>
                          <span class="listen-text">{{ t.listenNow }}</span>
                        </template>
                        <template v-else-if="phase==='answer'">
                          {{ userPicks.length }} / {{ curQ.target.length }}
                        </template>
                        <template v-else-if="phase==='countdown'">
                          {{ countdown }}
                        </template>
                      </div>
                      <!-- listening bubbles -->
                      <div v-if="phase==='listen'" class="listen-bubbles">
                        <div v-for="(w,i) in curQ.target" :key="i"
                             :class="['bubble', {on: listenIdx>=i}]">
                          {{ w }}
                        </div>
                      </div>
                      <!-- user's picks preview -->
                      <div v-else-if="phase==='answer'" class="pick-track">
                        <div v-for="i in curQ.target.length" :key="i"
                             :class="['pick-slot', {filled: userPicks[i-1] != null, correct: userPicks[i-1] && userPicks[i-1].ok, wrong: userPicks[i-1] && !userPicks[i-1].ok}]">
                          {{ userPicks[i-1] ? userPicks[i-1].word : '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cls-desks">
                <div class="desk" v-for="i in 3" :key="i"></div>
              </div>
            </div>

            <!-- HUD -->
            <div class="hud hud-left">
              <div class="hud-card">
                <div class="hud-lbl">{{ t.difficulty }}</div>
                <div class="hud-val">
                  <span class="lvl-num">{{ level }}</span>
                  <span class="lvl-dots">
                    <i v-for="n in 6" :key="n" :class="{on: n<=level}"></i>
                  </span>
                </div>
              </div>
              <div class="hud-card">
                <div class="hud-lbl">{{ t.score }}</div>
                <div class="hud-val score-val">{{ score }}</div>
              </div>
              <div class="hud-card">
                <div class="hud-lbl">{{ t.timeLeft }}</div>
                <div class="hud-val">{{ formatTime(remaining) }}</div>
                <div class="mini-bar"><div class="mini-fill" :style="{width: (remaining/totalDuration*100)+'%'}"></div></div>
              </div>
            </div>

            <!-- Teacher + speaker -->
            <div class="teacher-holder">
              <Teacher :speaking="phase==='listen'" :size="'game'"/>
              <button class="speaker-btn" @click="replayListen" :disabled="phase!=='listen' && phase!=='answer'">
                <span class="sp-ico">🔊</span>
                <span class="sp-txt">{{ t.replay }}</span>
              </button>
            </div>

            <!-- Right actions -->
            <div class="right-actions">
              <button class="round-btn" @click="pauseGame">
                <span>←</span><em>{{ t.back }}</em>
              </button>
              <button v-if="showBatchSkip" class="round-btn skip" @click="onBatchSkip">
                <span>⏭</span><em>{{ t.skipGame }}</em>
              </button>
              <button class="round-btn skip" @click="skipRound">
                <span>»</span><em>{{ t.skip }}</em>
              </button>
            </div>

            <!-- Answer board -->
            <div class="answer-board" v-if="phase==='answer' || phase==='feedback'">
              <div class="qtimer">
                <div class="qtimer-track">
                  <div class="qtimer-fill" :style="{width: (qtimeLeft/15*100)+'%', background: qtimeLeft<5? '#ff5a6a':'linear-gradient(90deg,#ffca3a,#ff8a3a)'}"></div>
                </div>
                <div class="qtimer-num">{{ Math.ceil(qtimeLeft) }}s</div>
              </div>
              <div :class="['word-grid', 'g'+curQ.board.length]">
                <button v-for="(w,i) in curQ.board" :key="w+i"
                        :class="['word-btn', wordState(w)]"
                        :disabled="phase!=='answer' || pickedSet.has(w)"
                        @click="pickWord(w)">
                  <span class="wb-inner">{{ w }}</span>
                </button>
              </div>
            </div>

            <!-- Feedback flash overlay -->
            <transition name="flash">
              <div v-if="feedback" :class="['flash-lay', feedback.kind]">
                <div class="flash-emoji">
                  {{ feedback.kind==='ok'?'✓':feedback.kind==='bad'?'✗':'⏱' }}
                </div>
                <div class="flash-txt">
                  {{ feedback.kind==='ok'?t.correct:feedback.kind==='bad'?t.wrong:t.timeout }}
                </div>
                <div v-if="feedback.gain" class="flash-gain">+{{ feedback.gain }}</div>
              </div>
            </transition>
          </div>
        </transition>

        <!-- ============= RESULT ================= -->
        <transition name="fade">
          <div v-if="screen==='result'" class="scene result">
            <div class="bg bg-home"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
            <div class="result-inner">
              <div class="confetti"><i v-for="n in 24" :key="n" :style="confettiStyle(n)"></i></div>
              <div class="rs-badge">🏆</div>
              <h2 class="rs-title">{{ t.resultTitle }}</h2>
              <div class="rs-score">
                <div class="rs-score-lbl">{{ t.finalScore }}</div>
                <div class="rs-score-num">{{ score }}</div>
              </div>
              <div class="rs-stats">
                <div class="rs-stat"><div class="s-lbl">{{ t.stat_total }}</div><div class="s-val">{{ sessionStats.total }}</div></div>
                <div class="rs-stat ok"><div class="s-lbl">{{ t.stat_ok }}</div><div class="s-val">{{ sessionStats.ok }}</div></div>
                <div class="rs-stat bad"><div class="s-lbl">{{ t.stat_bad }}</div><div class="s-val">{{ sessionStats.bad }}</div></div>
                <div class="rs-stat"><div class="s-lbl">{{ t.stat_rate }}</div><div class="s-val">{{ sessionStats.rate }}%</div></div>
                <div class="rs-stat"><div class="s-lbl">{{ t.stat_rt }}</div><div class="s-val">{{ sessionStats.avgRT }}s</div></div>
              </div>
              <div class="rs-actions">
                <button class="btn ghost" @click="backHome">
                  <span class="ico">🏠</span>{{ t.backHome }}
                </button>
                <button class="btn primary" @click="playAgain">
                  <span class="ico">↻</span>{{ t.playAgain }}
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ============ Rules Modal ============ -->
        <transition name="modal">
          <div v-if="showRules" class="modal-mask" @click.self="showRules=false">
            <div class="modal">
              <div class="modal-head"><h3>{{ t.rulesTitle }}</h3><button class="x" @click="showRules=false">×</button></div>
              <div class="modal-body">
                <ul class="rule-list">
                  <li v-for="(r,i) in t.rulesBody" :key="i"><span class="num">{{ i+1 }}</span>{{ r }}</li>
                </ul>
                <div class="diff-table">
                  <div class="dt-row dt-h">
                    <div>{{ t.difficulty }}</div><div>#</div><div>±</div><div>×</div>
                  </div>
                  <div class="dt-row" v-for="d in DIFF" :key="d.level">
                    <div>Lv{{ d.level }}</div><div>{{ d.count }}</div><div>{{ d.distract }}</div><div>{{ d.coeff }}</div>
                  </div>
                </div>
              </div>
              <div class="modal-foot"><button class="btn primary" @click="showRules=false">{{ t.close }}</button></div>
            </div>
          </div>
        </transition>

        <!-- ============ History Modal ============ -->
        <transition name="modal">
          <div v-if="showHistory" class="modal-mask" @click.self="showHistory=false">
            <div class="modal wide">
              <div class="modal-head"><h3>{{ t.history }}</h3><button class="x" @click="showHistory=false">×</button></div>
              <div class="modal-body">
                <div v-if="!history.length" class="empty-h">📭 {{ t.noHistory }}</div>
                <table v-else class="hist-table">
                  <thead>
                    <tr><th v-for="c in t.historyCols" :key="c">{{ c }}</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(h,i) in history" :key="i">
                      <td>{{ h.time }}</td><td>Lv{{ h.level }}</td><td>{{ h.duration }}m</td>
                      <td>{{ h.total }}</td><td class="ok">{{ h.ok }}</td><td class="bad">{{ h.bad }}</td>
                      <td>{{ h.rate }}%</td><td>{{ h.avgRT }}s</td><td class="score">{{ h.score }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="modal-foot"><button class="btn primary" @click="showHistory=false">{{ t.close }}</button></div>
            </div>
          </div>
        </transition>

        <!-- ============ Tutorial Modal ============ -->
        <transition name="modal">
          <div v-if="showTutorial" class="modal-mask">
            <div class="modal tut">
              <div class="modal-head">
                <h3>{{ t.tutorialTitle }} · {{ tutStep+1 }}/4</h3>
                <button class="x" @click="closeTutorial">×</button>
              </div>
              <div class="modal-body tut-body">
                <div class="tut-visual">
                  <!-- Step-by-step visual demo -->
                  <div v-if="tutStep===0" class="tut-scene">
                    <Teacher :speaking="true" :size="'tut'"/>
                    <div class="tut-bubbles">
                      <span class="tb on">{{ demoWords[0] }}</span>
                      <span class="tb on d2">{{ demoWords[1] }}</span>
                      <span class="tb on d3">{{ demoWords[2] }}</span>
                    </div>
                  </div>
                  <div v-else-if="tutStep===1" class="tut-scene">
                    <div class="brain-illu">🧠</div>
                    <div class="tut-order">
                      <span>1. {{ demoWords[0] }}</span>
                      <span>2. {{ demoWords[1] }}</span>
                      <span>3. {{ demoWords[2] }}</span>
                    </div>
                  </div>
                  <div v-else-if="tutStep===2" class="tut-scene">
                    <div class="tut-board-mini">
                      <button v-for="(w,i) in demoBoard" :key="w+i"
                              :class="['word-btn tut-wb', demoPicks.indexOf(w)>-1?'picked':'', demoPicks.length<3 && w===demoWords[demoPicks.length]?'hint':'']"
                              @click="tutPick(w)">
                        {{ w }}
                      </button>
                    </div>
                    <div class="tut-hint">👆 {{ t.yourTurn }}</div>
                  </div>
                  <div v-else-if="tutStep===3" class="tut-scene">
                    <div class="tut-check">✓</div>
                    <div class="tut-plus">+5 × 系数</div>
                  </div>
                </div>
                <h4>{{ t.tutorialSteps[tutStep].title }}</h4>
                <p>{{ t.tutorialSteps[tutStep].desc }}</p>
              </div>
              <div class="modal-foot tut-foot">
                <button class="btn ghost" @click="closeTutorial">{{ t.skip }}</button>
                <div class="tut-dots">
                  <i v-for="n in 4" :key="n" :class="{on: n-1===tutStep}"></i>
                </div>
                <div class="tut-nav">
                  <button class="btn ghost sm" :disabled="tutStep===0" @click="tutStep--">{{ t.prev }}</button>
                  <button v-if="tutStep<3" class="btn primary sm" @click="tutStep++">{{ t.next }}</button>
                  <button v-else class="btn primary sm" @click="finishTutorial">{{ t.gotIt }}</button>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- ============ Pause Modal ============ -->
        <transition name="modal">
          <div v-if="showPause" class="modal-mask">
            <div class="modal pause-modal">
              <div class="pause-ico">⏸</div>
              <h3>{{ t.pauseTitle }}</h3>
              <p>{{ t.pauseBody }}</p>
              <div class="modal-foot">
                <button class="btn ghost" @click="quitGame">{{ t.quit }}</button>
                <button class="btn primary" @click="resumeGame">{{ t.resume }}</button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ============ Countdown overlay ============ -->
        <transition name="fade">
          <div v-if="preCountdown>0" class="pre-count">
            <div class="pc-num">{{ preCountdown }}</div>
          </div>
        </transition>

      </div>
    </div>
  </div>
</template>

<script>
import { messages } from './i18n.js'
import { DIFF, buildQuestion } from './words.js'
import Teacher from './Teacher.vue'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const STORAGE_KEY = 'wordrecall.history.v1'
const LANG_KEY = 'wordrecall.lang'
const GAME_TYPE = 'cyfs' // 词语复述 gameType

export default {
  name: 'App',
  components: { Teacher },
  data() {
    return {
      lang: (localStorage.getItem(LANG_KEY) || (navigator.language||'zh').startsWith('zh') ? 'zh' : 'en'),
      screen: 'home',
      showRules: false,
      showHistory: false,
      showTutorial: false,
      showPause: false,
      tutStep: 0,
      demoPicks: [],
      // game state
      durationMin: 3,
      totalDuration: 180,
      remaining: 180,
      level: 1,
      score: 0,
      curQ: { target: [], board: [], coeff: 1, level: 1 },
      phase: 'idle', // idle | countdown | listen | answer | feedback
      listenIdx: -1,
      userPicks: [],
      qtimeLeft: 15,
      qStart: 0,
      feedback: null,
      preCountdown: 0,
      // stats
      windowStart: 0,
      windowStats: { ok: 0, total: 0 },
      sessionStats: { total: 0, ok: 0, bad: 0, rt: [], rate: 0, avgRT: 0 },
      history: [],
      // scaling
      scale: 1,
      viewportW: 0,
      viewportH: 0,
      DIFF,
      // timers
      tickId: null,
      qTickId: null,
      listenTimeouts: [],
      voices: [],
      // Audio manifest: { zh: {word: filename}, en: {...} }
      audioManifest: null,
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    t() { return messages[this.lang] },
    langBtnVisible() { return this.screen !== 'game' },
    promptTitle() {
      if (this.phase === 'listen') return this.t.listenNow
      if (this.phase === 'answer') return this.t.yourTurn
      if (this.phase === 'countdown') return this.t.ready
      return ''
    },
    pickedSet() {
      const s = new Set()
      this.userPicks.forEach(p => s.add(p.word))
      return s
    },
    demoWords() {
      return this.lang==='zh' ? ['苹果','太阳','火车'] : ['apple','sun','train']
    },
    demoBoard() {
      const d = this.lang==='zh' ? ['苹果','太阳','火车','月亮','汽车'] : ['apple','sun','train','moon','car']
      return d
    },
    pickVoiceName() {
      const v = this.pickVoice(this.lang)
      return v ? `${v.name}[${v.lang}]` : '(none)'
    },
    stageStyle() {
      return { '--scale': this.scale }
    },
    voiceProfiles() {
      // Baidu tts per= parameter maps to distinct voices:
      //   0=度小美(女) 1=度小宇(成年男) 3=度逍遥(情感男) 4=度丫丫(儿童女)
      //   5=度小娇(女) 106=度博文(成年男) 110=度小童(童声) 111=度小萌(女)
      //   103=度米朵(成年女) 5003=度逍遥-精品 4103=度博文-精品 4106=度小宇-精品
      const baiduZh = (enc, per) =>
        `https://tts.baidu.com/text2audio?tex=${enc}&cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=${per}`
      const zh = (enc) => ({
        youdaoStd:     `https://dict.youdao.com/dictvoice?audio=${enc}&le=zh`,
        bd_yu:         baiduZh(enc, 1),      // 度小宇 成年男
        bd_yao:        baiduZh(enc, 3),      // 度逍遥 情感男
        bd_bo:         baiduZh(enc, 106),    // 度博文 成年男
        bd_yu_hd:      baiduZh(enc, 4106),   // 度小宇 精品
        bd_bo_hd:      baiduZh(enc, 4103),   // 度博文 精品
        bd_yao_hd:     baiduZh(enc, 5003),   // 度逍遥 精品
      })
      const baiduEn = (enc, per) =>
        `https://tts.baidu.com/text2audio?tex=${enc}&cuid=baike&lan=EN&ctp=1&pdt=301&vol=9&rate=32&per=${per}`
      const en = (enc) => ({
        youdaoStd:     `https://dict.youdao.com/dictvoice?audio=${enc}&le=en&type=1`,
        bd_yu:         baiduEn(enc, 1),
        bd_yao:        baiduEn(enc, 3),
        bd_bo:         baiduEn(enc, 106),
        bd_yu_hd:      baiduEn(enc, 4106),
        bd_bo_hd:      baiduEn(enc, 4103),
        bd_yao_hd:     baiduEn(enc, 5003),
      })
      const build = (which) => (word, lang) => {
        const enc = encodeURIComponent(word)
        const src = lang === 'zh' ? zh(enc) : en(enc)
        return which.map(k => src[k]).filter(Boolean)
      }
      return [
        { id: 'auto',       label: '🤖 自动 (推荐 · 云扬)',           kind: 'native', voiceMatch: /Yunyang/i },
        // ==== Native ====
        { id: 'nv-yunyang',  label: '💻 Yunyang · 云扬 (专业播音男)',  kind: 'native', voiceMatch: /Yunyang/i },
        { id: 'nv-yunjian',  label: '💻 Yunjian · 云健 (新闻男主播)',  kind: 'native', voiceMatch: /Yunjian/i },
        { id: 'nv-yunxi',    label: '💻 Yunxi · 云希 (成年男声)',      kind: 'native', voiceMatch: /Yunxi(?!a)/i },
        { id: 'nv-yunhao',   label: '💻 Yunhao · 云皓 (深沉男声)',     kind: 'native', voiceMatch: /Yunhao/i },
        { id: 'nv-yunfeng',  label: '💻 Yunfeng · 云枫 (磁性男声)',    kind: 'native', voiceMatch: /Yunfeng/i },
        { id: 'nv-yunze',    label: '💻 Yunze · 云泽 (沉稳男声)',      kind: 'native', voiceMatch: /Yunze/i },
        { id: 'nv-yunjie',   label: '💻 Yunjie · 云杰 (清晰男声)',     kind: 'native', voiceMatch: /Yunjie/i },
        { id: 'nv-kangkang', label: '💻 Kangkang · 康康 (经典男声)',   kind: 'native', voiceMatch: /Kangkang/i },
        // ==== Cloud ====
        { id: 'yd-std',     label: '☁️ 有道·标准',                    kind: 'cloud', buildUrls: build(['youdaoStd']) },
        { id: 'bd-yu',      label: '☁️ 百度·度小宇 (成年男)',          kind: 'cloud', buildUrls: build(['bd_yu']) },
        { id: 'bd-yu-hd',   label: '☁️ 百度·度小宇 精品 (成年男)',     kind: 'cloud', buildUrls: build(['bd_yu_hd']) },
        { id: 'bd-bo',      label: '☁️ 百度·度博文 (成年男)',          kind: 'cloud', buildUrls: build(['bd_bo']) },
        { id: 'bd-bo-hd',   label: '☁️ 百度·度博文 精品 (成年男)',     kind: 'cloud', buildUrls: build(['bd_bo_hd']) },
        { id: 'bd-yao',     label: '☁️ 百度·度逍遥 (情感男)',          kind: 'cloud', buildUrls: build(['bd_yao']) },
        { id: 'bd-yao-hd',  label: '☁️ 百度·度逍遥 精品 (情感男)',     kind: 'cloud', buildUrls: build(['bd_yao_hd']) },
      ]
    },
  },
  mounted() {
    this.loadHistory()
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    this.initTTS()
    this.loadAudioManifest()
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.durationMin = dur },
      openTutorial: () => { this.goTutorial() },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScale)
    this.clearAllTimers()
  },
  watch: {
    lang(v) { localStorage.setItem(LANG_KEY, v) }
  },
  methods: {
    updateScale() {
      const w = window.innerWidth, h = window.innerHeight
      this.viewportW = w; this.viewportH = h
      const s = Math.min(w / 1600, h / 900)
      this.scale = s
    },
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    loadHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) this.history = JSON.parse(raw)
      } catch(e){}
    },
    saveHistoryEntry(entry) {
      this.history.unshift(entry)
      if (this.history.length > 50) this.history = this.history.slice(0,50)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history))
    },
    // -------- Tutorial --------
    goTutorial() { this.tutStep=0; this.demoPicks=[]; this.showTutorial=true },
    closeTutorial() { this.onTutorialDone() },
    finishTutorial() { this.onTutorialDone() },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial(GAME_TYPE, (dur) => {
        this.durationMin = dur
        this.startGame()
      })) return
      this.screen = 'duration'
    },
    tutPick(w) {
      if (this.demoPicks.length>=3) return
      const need = this.demoWords[this.demoPicks.length]
      if (w === need) this.demoPicks.push(w)
    },
    // -------- Game start --------
    startGame() {
      // Warm up TTS on user gesture — some tablets need a synchronous
      // speak() call inside a user tap to unlock later utterances.
      this.warmUpTTS()
      this.totalDuration = this.durationMin * 60
      this.remaining = this.totalDuration
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.score = 0
      this.sessionStats = { total: 0, ok: 0, bad: 0, rt: [], rate: 0, avgRT: 0 }
      this.windowStart = 0
      this.windowStats = { ok: 0, total: 0 }
      this.screen = 'game'
      // pre-countdown 3-2-1
      this.preCountdown = 3
      const tick = () => {
        setTimeout(() => {
          this.preCountdown--
          if (this.preCountdown > 0) tick()
          else this._beginTick()
        }, 800)
      }
      tick()
    },
    _beginTick() {
      this.tickId = setInterval(() => {
        if (this.showPause) return
        this.remaining -= 1
        // difficulty adjust every 60s
        const elapsed = this.totalDuration - this.remaining
        if (elapsed > 0 && elapsed % 60 === 0) {
          this.adjustDifficulty()
        }
        if (this.remaining <= 0) {
          this.finishSession()
        }
      }, 1000)
      this.nextQuestion()
    },
    adjustDifficulty() {
      const w = this.windowStats
      if (w.total > 0) {
        const rate = w.ok / w.total
        if (rate >= 0.9 && this.level < 6) this.level++
        else if (rate < 0.7 && this.level > 1) this.level--
      }
      this.windowStats = { ok: 0, total: 0 }
    },
    nextQuestion() {
      if (this.remaining <= 0) return
      this.curQ = buildQuestion(this.level, this.lang)
      this.userPicks = []
      this.feedback = null
      this.phase = 'listen'
      this.listenIdx = -1
      this.playListen()
    },
    playListen() {
      this.listenTimeouts.forEach(id => clearTimeout(id))
      this.listenTimeouts = []
      this.listenIdx = -1
      // Only cancel prior speech if actually speaking, and give the queue a
      // moment before starting the first word — several tablet browsers drop
      // the first utterance if speak() is invoked immediately after cancel().
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
        }
        window.speechSynthesis && window.speechSynthesis.resume && window.speechSynthesis.resume()
      } catch(e){}
      const kick = setTimeout(() => {
        this._speakSeq(this.curQ.target.slice(), 0, () => {
          const id = setTimeout(() => this.startAnswerPhase(), 500)
          this.listenTimeouts.push(id)
        })
      }, 260)
      this.listenTimeouts.push(kick)
    },
    _speakSeq(words, i, done) {
      if (this.phase !== 'listen') { this.log('_speakSeq abort: phase='+this.phase); return }
      if (i >= words.length) { this.log('_speakSeq done'); done && done(); return }
      this.listenIdx = i
      const w = words[i]
      const advance = (why) => {
        this.log(`word[${i}] ${w} → advance(${why})`)
        const id = setTimeout(() => this._speakSeq(words, i+1, done), 380)
        this.listenTimeouts.push(id)
      }
      this.speakOne(w, advance)
    },
    // Unified speak: play pre-generated Yunyang MP3.
    // Fall back to native TTS only if the local file is missing.
    speakOne(word, onDone) {
      this._speakLocal(word, onDone)
    },
    _speakLocal(word, onDone) {
      const map = this.audioManifest && this.audioManifest[this.lang]
      const fname = map && map[word]
      if (!fname) {
        this.log(`local "${word}" → not in manifest, falling back to native`)
        this._speakNative(word, onDone)
        return
      }
      const url = `audio/${this.lang}/${fname}`
      this.log(`local speak: ${url}`)
      let advanced = false
      const advance = (why) => {
        if (advanced) return
        advanced = true
        onDone && onDone(why)
      }
      try {
        const audio = new Audio(url)
        audio.preload = 'auto'
        audio.onplay = () => this.log(`local "${word}" → onplay`)
        audio.onended = () => { this.log(`local "${word}" → onended`); advance('local-onended') }
        audio.onerror = () => {
          const err = audio.error
          this.log(`local "${word}" → onerror code=${err?err.code:'?'}, falling back to native`)
          if (!advanced) { advanced = true; this._speakNative(word, onDone) }
        }
        const p = audio.play()
        if (p && p.catch) {
          p.catch(err => {
            this.log(`local "${word}" → play() rejected: ${err.name||err.message||''}, falling back`)
            if (!advanced) { advanced = true; this._speakNative(word, onDone) }
          })
        }
        const fb = setTimeout(() => {
          if (!advanced) {
            this.log(`local "${word}" → 3s timeout, falling back to native`)
            advanced = true
            this._speakNative(word, onDone)
          }
        }, 3000)
        this.listenTimeouts.push(fb)
      } catch(e) {
        this.log(`local speak threw: ${e.message}`)
        this._speakNative(word, onDone)
      }
    },
    loadAudioManifest() {
      fetch('audio/manifest.json')
        .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP '+r.status)))
        .then(m => {
          this.audioManifest = m
          const zc = Object.keys(m.zh||{}).length
          const ec = Object.keys(m.en||{}).length
          this.log(`✅ audio manifest loaded: zh=${zc}, en=${ec}`)
        })
        .catch(e => {
          this.log(`❌ audio manifest load failed: ${e.message} — will fall back to native TTS`)
        })
    },
    _speakNative(word, onDone, voiceMatch) {
      const u = new SpeechSynthesisUtterance(word)
      u.lang = this.lang === 'zh' ? 'zh-CN' : 'en-US'
      u.rate = 0.85
      u.pitch = 0.9
      u.volume = 1
      const v = voiceMatch ? this.findVoice(voiceMatch) : this.pickVoice(this.lang)
      if (v) { u.voice = v; this.log(`native voice=${v.name}[${v.lang}]`) }
      else { this.log(`native voice=(none matched, falling back to default)`) }
      let advanced = false
      const advance = (why) => {
        if (advanced) return
        advanced = true
        onDone && onDone(why)
      }
      u.onstart = () => this.log(`native "${word}" → onstart`)
      u.onend = () => advance('native-onend')
      u.onerror = (e) => {
        this.log(`native "${word}" → onerror ${e.error||''} — falling back to cloud`)
        // Fall back to cloud audio on error
        if (!advanced) { advanced = true; this._speakCloud(word, onDone) }
      }
      const fb = setTimeout(() => {
        if (!advanced) {
          this.log(`native "${word}" → timeout 2500ms, falling back to cloud`)
          advanced = true; this._speakCloud(word, onDone)
        }
      }, 2500)
      this.listenTimeouts.push(fb)
      try {
        window.speechSynthesis.speak(u)
        this.log(`native speak() queued: "${word}"`)
      } catch(e) {
        this.log('native speak() threw, using cloud: '+e.message)
        advance('exception'); this._speakCloud(word, onDone)
      }
    },
    _speakCloud(word, onDone, overrideUrls) {
      // Try multiple public TTS endpoints in order — the first one that plays wins.
      // NO crossOrigin: HTML5 <audio> plays fine without CORS as long as we don't
      // read pixels/buffers.
      const isZh = this.lang === 'zh'
      const enc = encodeURIComponent(word)
      const defaultUrls = isZh ? [
        `https://dict.youdao.com/dictvoice?audio=${enc}&type=1`,
        `https://tts.baidu.com/text2audio?tex=${enc}&cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=1`,
        `https://fanyi.baidu.com/gettts?lan=zh&text=${enc}&spd=3&source=web&per=1`,
        `https://dict.youdao.com/dictvoice?audio=${enc}&le=zh`,
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${enc}&tl=zh-CN&client=tw-ob`,
      ] : [
        `https://dict.youdao.com/dictvoice?audio=${enc}&type=1`,
        `https://tts.baidu.com/text2audio?tex=${enc}&cuid=baike&lan=EN&ctp=1&pdt=301&vol=9&rate=32&per=1`,
        `https://fanyi.baidu.com/gettts?lan=en&text=${enc}&spd=3&source=web&per=1`,
        `https://dict.youdao.com/dictvoice?audio=${enc}&le=en`,
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${enc}&tl=en&client=tw-ob`,
      ]
      const urls = (overrideUrls && overrideUrls.length) ? overrideUrls : defaultUrls
      let advanced = false
      const advance = (why) => {
        if (advanced) return
        advanced = true
        onDone && onDone(why)
      }
      const tryOne = (idx) => {
        if (advanced) return
        if (idx >= urls.length) {
          this.log(`cloud "${word}" → all ${urls.length} sources failed`)
          advance('cloud-all-failed')
          return
        }
        const url = urls[idx]
        const short = url.split('?')[0].replace(/^https?:\/\//,'')
        try {
          const audio = new Audio()
          audio.preload = 'auto'
          // Deliberately NOT setting crossOrigin
          let started = false
          audio.onplay = () => { started = true; this.log(`cloud[${idx}] "${word}" → onplay (${short})`) }
          audio.onended = () => { this.log(`cloud[${idx}] "${word}" → onended`); advance('cloud-onended') }
          audio.onerror = (e) => {
            const err = audio.error
            this.log(`cloud[${idx}] "${word}" → onerror code=${err?err.code:'?'} ${short}`)
            if (!started) tryOne(idx+1)
            else advance('cloud-onerror')
          }
          audio.src = url
          const p = audio.play()
          if (p && p.then) {
            p.then(() => this.log(`cloud[${idx}] "${word}" → play() ok`))
             .catch(err => {
                this.log(`cloud[${idx}] "${word}" → play() rejected: ${err.name||err.message||''}`)
                if (!started) tryOne(idx+1)
             })
          }
          // Timeout per source
          setTimeout(() => {
            if (!started && !advanced) { this.log(`cloud[${idx}] "${word}" → 3.5s timeout, next`); tryOne(idx+1) }
          }, 3500)
          this.log(`cloud speak(): ${short}`)
        } catch(e) {
          this.log(`cloud[${idx}] threw: ${e.message}`)
          tryOne(idx+1)
        }
      }
      tryOne(0)
    },
    replayListen() {
      if (this.phase === 'listen' || this.phase === 'answer') {
        try { window.speechSynthesis && window.speechSynthesis.cancel() } catch(e){}
        const words = this.curQ.target.slice()
        const speakOne = (idx) => {
          if (idx >= words.length) return
          this.speakOne(words[idx], () => setTimeout(() => speakOne(idx+1), 380))
        }
        speakOne(0)
      }
    },
    // ---- TTS init & voice picking ----
    log() { /* debug logging removed */ },
    initTTS() {
      if (!window.speechSynthesis) return
      const load = () => {
        this.voices = window.speechSynthesis.getVoices() || []
      }
      load()
      try { window.speechSynthesis.onvoiceschanged = load } catch(e) {}
      setTimeout(load, 500)
      setTimeout(load, 1500)
    },
    pickVoice(lang) {
      const list = this.voices || []
      if (!list.length) return null
      const wantZh = lang === 'zh'
      const langRe = wantZh ? /^zh|Chinese|Mandarin/i : /^en|English/i
      // Premium broadcast-quality male voices (Azure / Windows / macOS / mobile).
      // Order matters — earlier entries are preferred.
      const preferred = wantZh
        ? [/Yunyang/i, /Yunjian/i, /Yunxi(?!a)/i, /Kangkang/i, /Yunfeng/i, /Yunhao/i, /Yunze/i, /Hanhan/i, /Tian-Tian/i]
        : [/Guy/i, /Davis/i, /Tony/i, /Christopher/i, /Brandon/i, /Jason/i, /Roger/i, /Steffan/i, /Andrew/i, /Brian/i, /Eric/i, /Ryan/i, /Alex/i, /Daniel/i, /Fred/i, /Arthur/i]
      const maleRe = /male|man|\bmr\b|男|Yun[a-z]*|Kang|Guy|Davis|Tony|Christopher|Brandon|Jason|Roger|Andrew|Brian|Eric|Ryan|Alex|Daniel|Fred|Arthur|Rocko/i
      const femaleRe = /female|woman|\bms\b|女|girl|Xiaoxiao|Xiaoyi|Xiaomo|Xiaohan|Xiaorou|Xiaoshuang|Samantha|Karen|Victoria|Moira|Tessa|Zira|Hazel|Aria|Jenny|Michelle|Ana|Nancy|Sara/i
      const langMatches = list.filter(v => langRe.test(v.lang) || langRe.test(v.name))
      // 1. Try preferred broadcast male voices in order
      for (const re of preferred) {
        const hit = langMatches.find(v => re.test(v.name))
        if (hit) return hit
      }
      // 2. Any male-hinted voice in the right language
      const male = langMatches.find(v => maleRe.test(v.name) && !femaleRe.test(v.name))
      if (male) return male
      // 3. Any non-female voice in the right language
      const nonFemale = langMatches.find(v => !femaleRe.test(v.name))
      if (nonFemale) return nonFemale
      // 4. Any voice in the right language
      if (langMatches.length) return langMatches[0]
      // 5. Fallback: default or first
      return list.find(v => v.default) || list[0]
    },
    findVoice(match) {
      // match: RegExp (specific voice), or 'male' / 'female' (gender heuristic)
      const list = this.voices || []
      if (!list.length) return null
      const wantZh = this.lang === 'zh'
      const langRe = wantZh ? /^zh|Chinese|Mandarin/i : /^en|English/i
      const langMatches = list.filter(v => langRe.test(v.lang) || langRe.test(v.name))
      if (match instanceof RegExp) {
        // Prefer language-matched candidate; else fall back to any voice matching the regex
        return langMatches.find(v => match.test(v.name))
            || list.find(v => match.test(v.name))
            || this.pickVoice(this.lang)
      }
      const maleRe   = /male|man|\bmr\b|男|Yun[a-z]*|Kang|Guy|Davis|Tony|Christopher|Brandon|Jason|Roger|Andrew|Brian|Eric|Ryan|Alex|Daniel|Fred|Arthur|Rocko/i
      const femaleRe = /female|woman|\bms\b|女|girl|Xiao[a-z]*|Samantha|Karen|Victoria|Moira|Tessa|Zira|Hazel|Aria|Jenny|Michelle|Ana|Nancy|Sara/i
      if (match === 'female') {
        return langMatches.find(v => femaleRe.test(v.name)) || langMatches[0] || null
      }
      return langMatches.find(v => maleRe.test(v.name) && !femaleRe.test(v.name))
          || langMatches.find(v => !femaleRe.test(v.name))
          || langMatches[0] || null
    },
    previewProfile(pid) {
      try { window.speechSynthesis && window.speechSynthesis.cancel() } catch(e) {}
      const word = this.lang === 'zh' ? '你好，欢迎进入词语复述训练' : 'Hello, welcome to word recall'
      this.log(`preview profile=${pid}`)
      this.speakOne(word, (why) => this.log(`preview done (${why})`), pid)
    },
    setVoiceProfile(pid) {
      this.voiceProfile = pid
      try { localStorage.setItem('wr_voice', pid) } catch(e) {}
      this.log(`voice profile set → ${pid}`)
    },
    warmUpTTS() {
      if (!window.speechSynthesis) { this.log('warmUp skipped: no TTS'); return }
      try {
        window.speechSynthesis.cancel()
        window.speechSynthesis.resume && window.speechSynthesis.resume()
        const u = new SpeechSynthesisUtterance(' ')
        u.volume = 0; u.rate = 1
        u.lang = this.lang === 'zh' ? 'zh-CN' : 'en-US'
        const v = this.pickVoice(this.lang)
        if (v) u.voice = v
        u.onstart = () => this.log('warmUp: onstart')
        u.onend = () => this.log('warmUp: onend')
        u.onerror = (e) => this.log('warmUp: onerror ' + (e.error||e.message||''))
        window.speechSynthesis.speak(u)
        this.log(`warmUp speak() called. voice=${v?v.name+'['+v.lang+']':'(none)'}`)
      } catch(e) { this.log('warmUp exception: ' + e.message) }
    },
    speak(word) {
      try {
        if (!window.speechSynthesis) return
        const u = new SpeechSynthesisUtterance(word)
        u.lang = this.lang === 'zh' ? 'zh-CN' : 'en-US'
        u.rate = 0.9
        const v = this.pickVoice(this.lang)
        if (v) u.voice = v
        window.speechSynthesis.speak(u)
      } catch(e){}
    },
    startAnswerPhase() {
      this.phase = 'answer'
      this.qtimeLeft = 15
      this.qStart = Date.now()
      this.qTickId = setInterval(() => {
        if (this.showPause) return
        this.qtimeLeft -= 0.1
        if (this.qtimeLeft <= 0) {
          this.qtimeLeft = 0
          this.finishRound('timeout')
        }
      }, 100)
    },
    pickWord(w) {
      if (this.phase !== 'answer') return
      const idx = this.userPicks.length
      const need = this.curQ.target[idx]
      const ok = (w === need)
      this.userPicks.push({ word: w, ok })
      if (!ok) {
        this.finishRound('wrong')
        return
      }
      if (this.userPicks.length === this.curQ.target.length) {
        this.finishRound('correct')
      }
    },
    finishRound(kind) {
      clearInterval(this.qTickId)
      this.qTickId = null
      const rt = (Date.now() - this.qStart) / 1000
      this.sessionStats.total++
      this.windowStats.total++
      let gain = 0
      if (kind === 'correct') {
        gain = Math.round(5 * this.curQ.coeff)
        this.score += gain
        this.sessionStats.ok++
        this.windowStats.ok++
        this.sessionStats.rt.push(rt)
        this.feedback = { kind: 'ok', gain }
      } else if (kind === 'wrong') {
        this.sessionStats.bad++
        this.feedback = { kind: 'bad', gain: 0 }
      } else {
        this.sessionStats.bad++
        this.feedback = { kind: 'timeout', gain: 0 }
      }
      this.phase = 'feedback'
      setTimeout(() => {
        this.feedback = null
        if (this.remaining > 0) this.nextQuestion()
      }, 1100)
    },
    skipRound() {
      if (this.phase === 'listen' || this.phase === 'answer' || this.phase === 'feedback') {
        clearInterval(this.qTickId)
        this.listenTimeouts.forEach(id => clearTimeout(id))
        this.listenTimeouts = []
        this.sessionStats.total++
        this.sessionStats.bad++
        this.windowStats.total++
        this.feedback = { kind: 'bad', gain: 0 }
        this.phase = 'feedback'
        setTimeout(() => {
          this.feedback = null
          if (this.remaining > 0) this.nextQuestion()
        }, 700)
      }
    },
    pauseGame() {
      this.showPause = true
    },
    resumeGame() { this.showPause = false },
    quitGame() {
      this.showPause = false
      leavePbGameWindow({ confirm: false })
    },
    finishSession(early=false) {
      this.clearAllTimers()
      const s = this.sessionStats
      const rate = s.total ? Math.round(s.ok / s.total * 100) : 0
      const avgRT = s.rt.length ? +(s.rt.reduce((a,b)=>a+b,0)/s.rt.length).toFixed(2) : 0
      s.rate = rate; s.avgRT = avgRT
      const now = new Date()
      const pad = n => String(n).padStart(2,'0')
      const entry = {
        time: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
        level: this.level,
        duration: this.durationMin,
        total: s.total, ok: s.ok, bad: s.bad,
        rate, avgRT, score: this.score,
      }
      this.saveHistoryEntry(entry)
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgRT),
        score: this.score || 0,
        successCount: s.ok,
        failCount: s.bad,
        trainDuration: this.durationMin,
        difficultyLevel: this.level,
      })
      this.screen = 'result'
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    clearAllTimers() {
      if (this.tickId) clearInterval(this.tickId); this.tickId=null
      if (this.qTickId) clearInterval(this.qTickId); this.qTickId=null
      this.listenTimeouts.forEach(id => clearTimeout(id))
      this.listenTimeouts = []
      try { window.speechSynthesis && window.speechSynthesis.cancel() } catch(e){}
    },
    playAgain() { this.screen='home'; setTimeout(()=>this.goTutorial(), 100) },
    backHome() { this.screen='home' },
    formatTime(sec) {
      sec = Math.max(0, Math.floor(sec))
      const m = Math.floor(sec/60), s = sec%60
      return `${m}:${String(s).padStart(2,'0')}`
    },
    wordState(w) {
      // used for coloring during answer/feedback
      if (this.phase === 'feedback') {
        const idx = this.curQ.target.indexOf(w)
        if (idx > -1) return 'reveal-ok'
      }
      const picked = this.userPicks.find(p => p.word === w)
      if (picked) return picked.ok ? 'picked-ok' : 'picked-bad'
      return ''
    },
    confettiStyle(n) {
      const colors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#ff8fab','#c589ff']
      return {
        left: (Math.random()*100)+'%',
        background: colors[n%colors.length],
        animationDelay: (Math.random()*1.2)+'s',
        transform: `rotate(${Math.random()*360}deg)`
      }
    }
  }
}
</script>

<style>
/* ===================== Global ===================== */
* { margin:0; padding:0; box-sizing:border-box; }
html, body, #app { width:100%; height:100%; overflow:hidden; }
body {
  font-family: 'Noto Sans SC','Poppins','Baloo 2', system-ui, sans-serif;
  background: #0b1230;
  color: #1a1f3a;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
button { font-family: inherit; cursor: pointer; border:none; outline:none; }

.theme { width:100%; height:100%; position:relative; }
.stage-wrap {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(1200px 800px at 20% 10%, #2a3466, #0b1230 70%);
  overflow: hidden;
}
.stage {
  width: 1600px; height: 900px; position: relative;
  transform: scale(var(--scale, 1));
  transform-origin: center center;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 60px 120px rgba(0,0,0,.35);
}

.scene { position:absolute; inset:0; }

/* ===================== Backgrounds ===================== */
.bg { position:absolute; inset:0; overflow:hidden; }
.bg-home {
  background:
    radial-gradient(900px 500px at 15% 20%, #ffe1e9 0%, transparent 60%),
    radial-gradient(700px 500px at 85% 15%, #dbe6ff 0%, transparent 65%),
    radial-gradient(700px 700px at 80% 90%, #fff6d6 0%, transparent 70%),
    linear-gradient(135deg, #fef5ff 0%, #eef4ff 60%, #fff2f4 100%);
}
.blob {
  position:absolute; border-radius:50%;
  filter: blur(60px); opacity:.55;
  animation: floatBlob 14s ease-in-out infinite alternate;
}
.b1 { width:520px; height:520px; background:#ffb3c7; top:-120px; left:-80px; }
.b2 { width:460px; height:460px; background:#a8c6ff; bottom:-140px; right:-60px; animation-delay:-4s;}
.b3 { width:360px; height:360px; background:#ffe391; top:40%; left:60%; animation-delay:-8s;}
@keyframes floatBlob {
  from { transform: translate(0,0) scale(1); }
  to { transform: translate(40px,-30px) scale(1.08); }
}
.grid-lines {
  position:absolute; inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 75%);
  opacity: .25;
}

/* ===================== Home ===================== */
.lang-btn {
  position:absolute; right:36px; top:32px; z-index:20;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(10px);
  padding: 12px 22px; border-radius:999px;
  font-weight:700; font-size:18px; color:#3448a3;
  box-shadow: 0 8px 24px rgba(60,80,180,.15);
  display:flex; align-items:center; gap:8px;
  transition: transform .2s;
}
.lang-btn:hover { transform: translateY(-2px); }
.lang-btn .globe { font-size:20px; }

.home-inner {
  position:absolute; inset:0;
  display:grid; grid-template-columns: 1fr 1fr; align-items:center;
  padding: 0 90px;
}
.badge {
  display:inline-block; padding:8px 18px; border-radius:999px;
  background: linear-gradient(90deg,#ff6b8a,#ffab6b);
  color:#fff; font-weight:800; font-size:14px; letter-spacing:.15em;
  box-shadow: 0 8px 20px rgba(255,110,140,.35);
}
.title {
  font-size: 96px; font-weight: 900; line-height:1;
  margin: 24px 0 12px;
  background: linear-gradient(135deg,#3a3fa1 0%, #7b3ff0 45%, #ff5c8a 100%);
  -webkit-background-clip: text; background-clip:text; color:transparent;
  letter-spacing: -.02em;
}
.subtitle {
  font-size:24px; color:#4a5079; font-weight:500; margin-bottom:44px;
  letter-spacing:.05em;
}
.home-btns { display:flex; flex-direction:column; gap:16px; width:340px; }
.btn {
  padding: 18px 28px; border-radius:20px; font-size:20px; font-weight:800;
  display:flex; align-items:center; justify-content:center; gap:12px;
  transition: transform .18s, box-shadow .18s;
  border: 2px solid transparent;
}
.btn .ico { font-size:22px; }
.btn.primary {
  background: linear-gradient(135deg,#5b6cff 0%,#8b5cff 50%,#e15cff 100%);
  color:#fff; box-shadow: 0 14px 32px rgba(120,90,240,.42);
}
.btn.primary:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(120,90,240,.55); }
.btn.ghost {
  background: rgba(255,255,255,.85); color:#3d47a4;
  border-color: rgba(80,80,180,.15);
  box-shadow: 0 6px 18px rgba(60,80,180,.1);
}
.btn.ghost:hover { transform: translateY(-2px); background:#fff; }
.btn.sm { padding: 16px 30px; font-size: 20px; }
.btn:disabled { opacity:.4; cursor:not-allowed; transform:none !important; box-shadow:none; }

.home-right { display:flex; justify-content:center; align-items:center; }
.hero-card {
  position:relative;
  width:520px; height:600px;
  background: linear-gradient(160deg,#fff 0%, #f2f4ff 100%);
  border-radius: 40px;
  box-shadow: 0 40px 80px rgba(60,50,180,.2), inset 0 -4px 0 rgba(0,0,0,.05);
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
}
.hero-card::before {
  content:''; position:absolute; inset:14px; border-radius:30px;
  border: 2px dashed rgba(120,90,240,.15);
  pointer-events:none;
}
.floating-words { position:absolute; inset:0; pointer-events:none; }
.fw {
  position:absolute; padding:10px 20px; border-radius:14px;
  background:#fff; box-shadow: 0 10px 24px rgba(60,80,180,.18);
  font-weight:800; font-size:22px; color:#3d47a4;
  animation: bob 4s ease-in-out infinite alternate;
}
.fw1 { top:8%; left:8%; color:#e14e7c; background:#ffe1eb; }
.fw2 { top:14%; right:6%; color:#e18a1a; background:#fff2d6; animation-delay:-1s; }
.fw3 { bottom:14%; left:6%; color:#3a8a4c; background:#d9f4de; animation-delay:-2s; }
.fw4 { bottom:8%; right:8%; color:#4a5ecc; background:#dbe6ff; animation-delay:-3s; }
@keyframes bob {
  from { transform: translateY(-6px); }
  to { transform: translateY(8px); }
}

/* ===================== Duration ===================== */
.dur-inner {
  position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:60px;
}
.dur-title {
  font-size:64px; font-weight:900;
  background: linear-gradient(135deg,#3a3fa1,#e15cff);
  -webkit-background-clip: text; background-clip:text; color:transparent;
}
.dur-cards { display:flex; gap:36px; }
.dur-card {
  position:relative; width:240px; height:280px; border-radius:32px;
  background: #fff; box-shadow: 0 20px 50px rgba(60,80,180,.15);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  cursor:pointer; transition: transform .25s, box-shadow .25s;
  border:3px solid transparent; overflow:hidden;
}
.dur-card:hover { transform: translateY(-8px); }
.dur-card.active {
  border-color:#7b5cff;
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 30px 60px rgba(120,90,240,.35);
}
.dur-num {
  font-size: 140px; font-weight:900; line-height:1;
  background: linear-gradient(135deg,#5b6cff,#e15cff);
  -webkit-background-clip: text; background-clip:text; color:transparent;
}
.dur-lbl { font-size:22px; color:#5a6390; font-weight:700; margin-top:6px; }
.dur-glow {
  position:absolute; inset:0;
  background: radial-gradient(circle at 50% 100%, rgba(120,90,240,.2), transparent 70%);
  opacity:0; transition:opacity .3s;
}
.dur-card.active .dur-glow { opacity:1; }
.dur-actions { display:flex; gap:24px; }
.dur-actions .btn { min-width:200px; }

/* ===================== Game / Classroom ===================== */
.bg-class {
  background: linear-gradient(180deg,#f4dfc4 0%, #e6cba3 55%, #b98e64 55%, #a97852 100%);
}
.cls-wall { position:absolute; inset:0 0 45% 0;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.03) 0 2px, transparent 2px 60px),
    linear-gradient(180deg,#fbeacf 0%,#f0d5aa 100%);
}
.cls-floor { position:absolute; left:0; right:0; bottom:0; height:45%;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 2px, transparent 2px 90px),
    linear-gradient(180deg,#c99368 0%,#9a6b45 100%);
}
.cls-board {
  position:absolute; left:50%; top:60px;
  transform: translateX(-50%);
  width: 1000px; height: 460px;
}
.board-frame {
  width:100%; height:100%;
  background: linear-gradient(180deg,#6a4a2c 0%,#4a331c 100%);
  border-radius: 22px;
  padding: 22px;
  box-shadow:
    0 30px 60px rgba(0,0,0,.35),
    inset 0 4px 0 rgba(255,255,255,.15),
    inset 0 -6px 0 rgba(0,0,0,.35);
}
.board-inner {
  width:100%; height:100%;
  background: radial-gradient(ellipse at 50% 40%, #2a5a3c 0%, #1a3a26 90%);
  border-radius: 14px;
  position:relative;
  overflow:hidden;
  box-shadow: inset 0 10px 30px rgba(0,0,0,.5);
}
.chalk-line {
  position:absolute; height:2px; background:rgba(255,255,255,.15); border-radius:2px;
}
.l1 { top:34px; left:26px; right:26px; }
.l2 { bottom:20px; left:26px; right:26px; }
.prompt-strap {
  position:absolute; top:-14px; left:50%; transform:translateX(-50%);
  padding: 8px 26px; border-radius: 999px;
  background: linear-gradient(90deg,#ff9ec6,#ffbf6a);
  color:#fff; font-weight:800; font-size:16px; letter-spacing:.1em;
  box-shadow: 0 8px 20px rgba(0,0,0,.35);
}
.prompt-box {
  position:absolute; inset: 40px 40px 30px 40px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  color:#fff;
  font-family:'Baloo 2','Noto Sans SC',sans-serif;
}
.prompt-title { font-size:44px; font-weight:800; text-shadow: 0 2px 6px rgba(0,0,0,.4); letter-spacing:.05em; }
.prompt-sub {
  margin-top:10px; font-size:22px; color:#cfead6; font-weight:600;
  display:flex; align-items:center; gap:8px;
}
.prompt-sub .dot {
  width:10px; height:10px; border-radius:50%; background:#fff;
  animation: blink 1.4s infinite;
}
.dot.d2 { animation-delay:.2s; }
.dot.d3 { animation-delay:.4s; }
@keyframes blink { 0%,100%{opacity:.3} 50%{opacity:1} }

.listen-bubbles { margin-top:20px; display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
.bubble {
  padding: 14px 26px; border-radius:16px;
  background: rgba(255,255,255,.15); color:#e2f5e8;
  font-size:32px; font-weight:800; letter-spacing:.05em;
  border: 2px dashed rgba(255,255,255,.3);
  transition: all .35s cubic-bezier(.34,1.56,.64,1);
  opacity: .4; transform: scale(.92);
}
.bubble.on {
  background: linear-gradient(135deg,#ffca3a,#ff8a3a);
  color:#3a2010; border-color:transparent;
  opacity:1; transform: scale(1.08);
  box-shadow: 0 10px 30px rgba(255,180,60,.5);
}

.pick-track { margin-top:20px; display:flex; gap:14px; }
.pick-slot {
  width:110px; height:70px; border-radius:14px;
  background: rgba(255,255,255,.08); border: 3px dashed rgba(255,255,255,.35);
  display:flex; align-items:center; justify-content:center;
  color:#fff; font-size:24px; font-weight:800;
  transition: all .3s;
}
.pick-slot.filled { background: rgba(255,255,255,.9); color:#3a2010; border-style:solid; }
.pick-slot.correct { background: linear-gradient(135deg,#a4e878,#5fc84a); color:#fff; border-color: transparent; box-shadow:0 8px 20px rgba(80,180,60,.4); }
.pick-slot.wrong { background: linear-gradient(135deg,#ff8080,#ef4444); color:#fff; border-color:transparent; box-shadow:0 8px 20px rgba(220,50,50,.4); }

/* HUD */
.hud {
  position:absolute; z-index:8;
  display:flex; gap:16px;
}
.hud-left { top:28px; left:28px; }
.hud-card {
  min-width:140px; padding: 14px 20px 12px;
  background: rgba(255,255,255,.95); border-radius: 20px;
  box-shadow: 0 10px 26px rgba(0,0,0,.15);
  backdrop-filter: blur(10px);
}
.hud-lbl { font-size:14px; font-weight:700; color:#8a90b8; letter-spacing:.15em; }
.hud-val { font-size:32px; font-weight:900; color:#2b3170; margin-top:2px; line-height:1.1; display:flex; align-items:center; gap:10px;}
.lvl-num { color:#7b5cff; }
.lvl-dots { display:flex; gap:5px; }
.lvl-dots i { width:8px; height:8px; border-radius:50%; background:#e0e3f2; }
.lvl-dots i.on { background: linear-gradient(90deg,#5b6cff,#e15cff); }
.score-val { background: linear-gradient(135deg,#ff8a3a,#ff5c8a); -webkit-background-clip:text; background-clip:text; color:transparent; }
.mini-bar { margin-top:6px; height:6px; background:#e6e8f5; border-radius:6px; overflow:hidden; }
.mini-fill { height:100%; background: linear-gradient(90deg,#5b6cff,#e15cff); border-radius:6px; transition: width 1s linear; }

/* Teacher holder */
.teacher-holder {
  position:absolute; left:60px; bottom:20px; z-index:5;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.speaker-btn {
  padding: 12px 22px; border-radius:999px;
  background: linear-gradient(135deg,#ffb84a,#ff6f4a);
  color:#fff; font-weight:800; font-size:18px;
  display:flex; align-items:center; gap:10px;
  box-shadow: 0 10px 26px rgba(255,120,60,.4);
  transition: transform .2s;
}
.speaker-btn:hover { transform: translateY(-3px); }
.speaker-btn:disabled { opacity:.5; transform:none; }
.sp-ico { font-size:22px; }

/* Right actions */
.right-actions {
  position:absolute; top:28px; right:28px; z-index:9;
  display:flex; flex-direction:column; gap:14px;
}
.round-btn {
  width:96px; height:96px; border-radius:24px;
  background: rgba(255,255,255,.95);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  color:#3d47a4; font-weight:800; font-size:16px;
  box-shadow: 0 10px 26px rgba(0,0,0,.15);
  transition: transform .18s;
  gap:2px;
}
.round-btn span { font-size:34px; line-height:1; }
.round-btn em { font-style:normal; font-size:14px; letter-spacing:.05em; }
.round-btn:hover { transform: translateY(-3px); }
.round-btn.skip { background: linear-gradient(135deg,#ff9a5a,#ff5c7a); color:#fff; }

/* Answer board */
.answer-board {
  position:absolute; left:50%; bottom:36px;
  transform: translateX(-50%);
  width: 1080px;
  display:flex; flex-direction:column; gap:14px;
  z-index:6;
}
.qtimer { display:flex; align-items:center; gap:14px; padding: 0 8px; }
.qtimer-track {
  flex:1; height:14px; background:#fff; border-radius:10px; overflow:hidden;
  box-shadow: inset 0 2px 6px rgba(0,0,0,.15), 0 4px 12px rgba(0,0,0,.15);
}
.qtimer-fill { height:100%; border-radius:10px; transition: width .1s linear; }
.qtimer-num { min-width:56px; text-align:center; padding:6px 12px; border-radius:12px;
  background:#fff; font-weight:900; color:#2b3170; font-size:20px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15); }

.word-grid { display:grid; gap:20px; }
.word-grid.g2 { grid-template-columns: repeat(2, 1fr); }
.word-grid.g3, .word-grid.g4 { grid-template-columns: repeat(4, 1fr); }
.word-grid.g5 { grid-template-columns: repeat(5, 1fr); }
.word-grid.g6 { grid-template-columns: repeat(6, 1fr); }
.word-btn {
  height: 108px; border-radius: 24px;
  background: linear-gradient(180deg,#ffffff 0%,#f1f4ff 100%);
  color:#2b3170; font-size:36px; font-weight:900; letter-spacing:.05em;
  box-shadow:
    0 12px 24px rgba(60,80,180,.18),
    inset 0 3px 0 rgba(255,255,255,.9),
    inset 0 -6px 0 rgba(60,80,180,.12);
  transition: transform .12s, box-shadow .18s, background .2s;
  position:relative;
  overflow:hidden;
}
.word-btn::before {
  content:''; position:absolute; inset:6px; border-radius:20px;
  border: 2px solid rgba(120,140,255,.15);
  pointer-events:none;
}
.word-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px rgba(60,80,180,.28), inset 0 3px 0 rgba(255,255,255,.9), inset 0 -6px 0 rgba(60,80,180,.12);
}
.word-btn:active:not(:disabled) { transform: translateY(-1px) scale(.98); }
.word-btn:disabled { opacity:.5; }
.word-btn.picked-ok {
  background: linear-gradient(180deg,#a4e878,#5fc84a); color:#fff;
  box-shadow: 0 10px 22px rgba(80,180,60,.4), inset 0 3px 0 rgba(255,255,255,.4);
}
.word-btn.picked-bad {
  background: linear-gradient(180deg,#ff8a80,#ef4444); color:#fff;
  animation: shake .4s;
  box-shadow: 0 10px 22px rgba(220,50,50,.4), inset 0 3px 0 rgba(255,255,255,.4);
}
.word-btn.reveal-ok {
  background: linear-gradient(180deg,#ffe28a,#ffaa3a); color:#5a2b00;
  box-shadow: 0 10px 22px rgba(255,170,60,.35);
}
@keyframes shake {
  0%,100%{transform:translateX(0);} 25%{transform:translateX(-8px);} 75%{transform:translateX(8px);}
}
.wb-inner { position:relative; z-index:1; }

/* Flash feedback */
.flash-lay {
  position:absolute; inset:0; z-index:15; pointer-events:none;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background: rgba(0,0,0,.2);
}
.flash-emoji { font-size:180px; line-height:1; filter: drop-shadow(0 12px 24px rgba(0,0,0,.35)); }
.flash-txt { font-size:56px; font-weight:900; color:#fff; margin-top:16px; text-shadow:0 4px 12px rgba(0,0,0,.4); }
.flash-gain { margin-top:12px; font-size:44px; font-weight:900; color:#fffa66; text-shadow:0 4px 12px rgba(0,0,0,.4); }
.flash-lay.ok .flash-emoji { color:#5fc84a; }
.flash-lay.bad .flash-emoji { color:#ff5a6a; }
.flash-lay.timeout .flash-emoji { color:#ffab3a; }
.flash-enter-active, .flash-leave-active { transition: opacity .3s, transform .3s; }
.flash-enter, .flash-leave-to { opacity:0; transform: scale(.7); }

/* Pre-countdown */
.pre-count {
  position:absolute; inset:0; z-index:30;
  background: rgba(0,0,0,.5);
  display:flex; align-items:center; justify-content:center;
}
.pc-num {
  width:280px; height:280px; border-radius:50%;
  background: linear-gradient(135deg,#5b6cff,#e15cff);
  display:flex; align-items:center; justify-content:center;
  font-size:180px; font-weight:900; color:#fff;
  box-shadow: 0 40px 80px rgba(0,0,0,.35);
  animation: pcPulse .8s ease-out;
}
@keyframes pcPulse {
  from { transform: scale(.5); opacity:0; }
  to { transform: scale(1); opacity:1; }
}

/* ===================== Result ===================== */
.result-inner {
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.confetti { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.confetti i {
  position:absolute; top:-20px; width:12px; height:18px; border-radius:3px;
  animation: fall 3.5s linear infinite;
}
@keyframes fall {
  to { transform: translateY(1000px) rotate(720deg); }
}
.rs-badge { font-size:120px; filter: drop-shadow(0 12px 24px rgba(255,180,50,.5)); animation: bob 2.5s ease-in-out infinite alternate; }
.rs-title {
  font-size:64px; font-weight:900; margin-top:10px;
  background: linear-gradient(135deg,#5b6cff,#e15cff);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.rs-score {
  margin-top:20px; display:flex; flex-direction:column; align-items:center;
  padding: 22px 60px; border-radius:32px;
  background:#fff; box-shadow: 0 20px 50px rgba(60,80,180,.15);
}
.rs-score-lbl { font-size:20px; color:#8a90b8; letter-spacing:.2em; font-weight:700; }
.rs-score-num {
  font-size:120px; font-weight:900; line-height:1;
  background: linear-gradient(135deg,#ff8a3a,#ff5c8a);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.rs-stats { display:flex; gap:16px; margin-top:26px; }
.rs-stat {
  min-width:140px; padding:18px 22px; border-radius:20px;
  background:#fff; box-shadow: 0 10px 24px rgba(60,80,180,.12);
  text-align:center;
}
.rs-stat.ok .s-val { color:#3aa650; }
.rs-stat.bad .s-val { color:#e2493a; }
.s-lbl { font-size:14px; color:#8a90b8; font-weight:700; letter-spacing:.1em; }
.s-val { font-size:32px; font-weight:900; color:#2b3170; margin-top:4px; }
.rs-actions { display:flex; gap:20px; margin-top:34px; }
.rs-actions .btn { min-width:200px; }

/* ===================== Modal ===================== */
.modal-mask {
  position:absolute; inset:0; z-index:50;
  background: rgba(20,25,60,.55);
  backdrop-filter: blur(6px);
  display:flex; align-items:center; justify-content:center;
}
.modal {
  width: 620px; max-height: 85%;
  background:#fff; border-radius: 28px;
  box-shadow: 0 40px 80px rgba(0,0,0,.35);
  display:flex; flex-direction:column;
  overflow:hidden;
}
.modal.wide { width: 900px; }
.modal.tut { width: 720px; }
.modal-head {
  display:flex; justify-content:space-between; align-items:center;
  padding: 22px 28px;
  background: linear-gradient(135deg,#5b6cff 0%,#e15cff 100%);
  color:#fff;
}
.modal-head h3 { font-size:26px; font-weight:800; }
.modal-head .x {
  width:36px; height:36px; border-radius:50%;
  background: rgba(255,255,255,.2); color:#fff; font-size:24px;
  display:flex; align-items:center; justify-content:center;
}
.modal-head .x:hover { background: rgba(255,255,255,.35); }
.modal-body { padding: 26px 30px; overflow-y:auto; }
.modal-foot {
  padding: 18px 28px; border-top: 1px solid #eef0f7;
  display:flex; justify-content:flex-end; gap:14px;
}
.modal-enter-active, .modal-leave-active { transition: opacity .3s; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
.modal-enter, .modal-leave-to { opacity:0; }
.modal-enter .modal, .modal-leave-to .modal { transform: scale(.85) translateY(20px); }

.rule-list { list-style:none; display:flex; flex-direction:column; gap:14px; margin-bottom:20px; }
.rule-list li {
  padding: 14px 18px 14px 56px; position:relative;
  background:#f4f6ff; border-radius:14px; font-size:16px; color:#2b3170; font-weight:500;
  line-height:1.5;
}
.rule-list .num {
  position:absolute; left:14px; top:50%; transform:translateY(-50%);
  width:30px; height:30px; border-radius:50%;
  background: linear-gradient(135deg,#5b6cff,#e15cff); color:#fff;
  display:flex; align-items:center; justify-content:center; font-weight:900;
}
.diff-table {
  border-radius:14px; overflow:hidden; border:1px solid #eef0f7;
}
.dt-row { display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px 16px; font-size:15px; font-weight:600; color:#2b3170; }
.dt-row:not(.dt-h):nth-child(odd) { background:#fafbff; }
.dt-h { background: linear-gradient(90deg,#eef1ff,#f7ecff); font-weight:800; color:#5b6cff; }

.empty-h { text-align:center; padding:40px; color:#8a90b8; font-size:20px; }
.hist-table { width:100%; border-collapse:collapse; font-size:14px; }
.hist-table th { background:#f4f6ff; padding: 12px 8px; color:#5b6cff; font-weight:800; text-align:left; position:sticky; top:0; }
.hist-table td { padding: 12px 8px; border-bottom:1px solid #eef0f7; color:#2b3170; }
.hist-table td.ok { color:#3aa650; font-weight:800; }
.hist-table td.bad { color:#e2493a; font-weight:800; }
.hist-table td.score { color:#7b5cff; font-weight:900; }

/* Tutorial */
.tut-body { display:flex; flex-direction:column; align-items:center; text-align:center; }
.tut-visual {
  width:100%; height: 240px;
  background: linear-gradient(160deg,#f4f7ff,#faf1ff);
  border-radius:18px; margin-bottom:18px;
  display:flex; align-items:center; justify-content:center;
  position:relative;
}
.tut-body h4 { font-size:22px; font-weight:800; color:#2b3170; margin-bottom:8px; }
.tut-body p { font-size:16px; color:#5a6390; line-height:1.6; max-width: 90%; }
.tut-scene { display:flex; align-items:center; gap:20px; }
.tut-bubbles { display:flex; flex-direction:column; gap:10px; }
.tb {
  padding: 8px 20px; border-radius:14px;
  background: linear-gradient(135deg,#ffca3a,#ff8a3a); color:#3a2010;
  font-weight:800; font-size:20px;
  animation: tbIn .5s ease-out both;
}
.tb.d2 { animation-delay: .4s; }
.tb.d3 { animation-delay: .8s; }
@keyframes tbIn { from{opacity:0; transform: translateX(-20px);} to{opacity:1; transform:translateX(0);} }
.brain-illu { font-size:100px; }
.tut-order { display:flex; flex-direction:column; gap:8px; font-size:22px; font-weight:800; color:#5b6cff; }
.tut-board-mini { display:flex; gap:12px; }
.tut-wb {
  width: 96px; height: 60px; font-size:20px; border-radius:14px;
  background:#fff; color:#2b3170; font-weight:800;
  box-shadow: 0 6px 14px rgba(60,80,180,.18);
  border: 2px solid transparent;
}
.tut-wb.picked { background: linear-gradient(180deg,#a4e878,#5fc84a); color:#fff; }
.tut-wb.hint { border-color:#7b5cff; animation: pulseHint 1.2s infinite; }
@keyframes pulseHint { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
.tut-hint { position:absolute; bottom:20px; color:#8a90b8; font-size:14px; }
.tut-check {
  width:120px; height:120px; border-radius:50%;
  background: linear-gradient(135deg,#a4e878,#5fc84a); color:#fff;
  display:flex; align-items:center; justify-content:center;
  font-size:80px; font-weight:900;
  box-shadow: 0 20px 40px rgba(80,180,60,.4);
  animation: pop .6s cubic-bezier(.34,1.56,.64,1);
}
.tut-plus { margin-left:20px; font-size:36px; font-weight:900; color:#ff8a3a; }
@keyframes pop { from { transform: scale(.4); } to { transform: scale(1); } }

.tut-foot { display:flex; justify-content:space-between; align-items:center; }
.tut-dots { display:flex; gap:8px; }
.tut-dots i { width:10px; height:10px; border-radius:50%; background:#e0e3f2; transition: all .3s; }
.tut-dots i.on { width:26px; border-radius:6px; background: linear-gradient(90deg,#5b6cff,#e15cff); }
.tut-nav { display:flex; gap:14px; }
.tut-nav .btn.sm { min-width: 120px; }
.tut-foot .btn.ghost { min-width: 100px; }

/* Pause */
.pause-modal {
  width:460px; padding: 40px 30px 20px;
  align-items:center; text-align:center;
}
.pause-modal { display:flex; flex-direction:column; align-items:center; }
.pause-ico {
  width:96px; height:96px; border-radius:50%;
  background: linear-gradient(135deg,#5b6cff,#e15cff);
  color:#fff; font-size:56px;
  display:flex; align-items:center; justify-content:center;
  margin-bottom: 20px; box-shadow: 0 20px 40px rgba(120,90,240,.35);
}
.pause-modal h3 { font-size:28px; font-weight:900; color:#2b3170; }
.pause-modal p { margin-top:10px; color:#5a6390; font-size:16px; }
.pause-modal .modal-foot { border:none; width:100%; padding: 26px 0 6px; justify-content:center; }

/* transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .35s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* English tweak */
.theme.en .title { font-family:'Poppins',sans-serif; letter-spacing:-.03em; }
.theme.en .word-btn { font-size: 30px; text-transform: capitalize; }
.theme.en .bubble { text-transform: capitalize; }

/* ============ Voice picker ============ */
.voice-fab {
  position: fixed; right: 12px; bottom: 12px;
  width: 44px; height: 44px; border-radius: 50%;
  border: none; background: linear-gradient(135deg,#ff5c8a,#ffca3a);
  color: #fff; font-size: 22px; cursor: pointer; z-index: 9998;
  box-shadow: 0 6px 18px rgba(0,0,0,.35);
}
.voice-panel {
  position: fixed; right: 12px; bottom: 64px;
  width: min(94vw, 520px); max-height: 70vh;
  background: rgba(20,24,42,.98); color: #eef2ff;
  border: 1px solid rgba(255,255,255,.14); border-radius: 14px;
  z-index: 9998; display: flex; flex-direction: column;
  font: 14px/1.4 'Noto Sans SC', sans-serif;
  box-shadow: 0 20px 60px rgba(0,0,0,.55);
}
.voice-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.1);
  font-weight: 700; color: #ffd76a;
}
.voice-head b { color: #7ee8ff; }
.vh-close {
  background: rgba(255,255,255,.08); color: #eef2ff; border: none;
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 18px;
}
.voice-body { overflow-y: auto; padding: 8px; }
.voice-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding: 10px 12px; margin: 4px 0;
  background: rgba(255,255,255,.04); border-radius: 10px;
  border: 1px solid transparent;
}
.voice-row.active { border-color: #7ee8ff; background: rgba(126,232,255,.08); }
.vr-label { display: flex; flex-direction: column; }
.vr-name { font-weight: 600; font-size: 15px; }
.vr-kind { font-size: 11px; opacity: .55; margin-top: 2px; }
.vr-btns { display: flex; gap: 6px; flex-shrink: 0; }
.vr-try, .vr-use {
  padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600;
}
.vr-try { background: rgba(255,255,255,.1); color: #eef2ff; }
.vr-use { background: linear-gradient(135deg,#ff5c8a,#ffca3a); color: #fff; }
.voice-row.active .vr-use { background: #2ecc71; }
</style>
