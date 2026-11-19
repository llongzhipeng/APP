<template>
  <div class="root">
    <div class="scale-box" :style="scaleStyle">

      <!-- HOME -->
      <div v-if="page==='home'" class="page home">
        <button v-if="!gamePlayed" class="lang-btn" @click="toggleLang">{{ lang==='zh'?'EN':'中' }}</button>
        <h1 class="title">{{ t('title') }}</h1>
        <div class="home-btns">
          <button @click="page='tutorial'">{{ t('start') }}</button>
          <button @click="rulesOpen=true">{{ t('rules') }}</button>
          <button @click="historyOpen=true">{{ t('history') }}</button>
        </div>
        <!-- Rules modal -->
        <div v-if="rulesOpen" class="overlay" @click="rulesOpen=false">
          <div class="modal" @click.stop>
            <h2>{{ t('rules') }}</h2>
            <ul>
              <li>{{ t('r1') }}</li><li>{{ t('r2') }}</li>
              <li>{{ t('r3') }}</li><li>{{ t('r4') }}</li>
            </ul>
            <button @click="rulesOpen=false">{{ t('close') }}</button>
          </div>
        </div>
        <!-- History modal -->
        <div v-if="historyOpen" class="overlay" @click="historyOpen=false">
          <div class="modal wide" @click.stop>
            <h2>{{ t('history') }}</h2>
            <table v-if="histList.length">
              <thead><tr><th>{{ t('hDate') }}</th><th>{{ t('hDiff') }}</th><th>{{ t('hScore') }}</th><th>{{ t('hTotal') }}</th><th>{{ t('hOk') }}</th><th>{{ t('hRate') }}</th></tr></thead>
              <tbody><tr v-for="(r,i) in histList" :key="i">
                <td>{{ r.date }}</td><td>{{ r.diff }}</td><td>{{ r.score }}</td><td>{{ r.total }}</td><td>{{ r.ok }}</td><td>{{ r.rate }}%</td>
              </tr></tbody>
            </table>
            <p v-else>{{ t('noHist') }}</p>
            <button @click="historyOpen=false">{{ t('close') }}</button>
          </div>
        </div>
      </div>

      <!-- TUTORIAL -->
      <div v-else-if="page==='tutorial'" class="page tutorial">
        <div class="modal wide tut-modal">
          <div class="tut-body">
            <div v-if="tutStep===0" class="tut-step">
              <div class="tut-customer">
                <img :src="resolveImage('/images/2.jpg')" class="tut-img"/>
                <div class="speech-bubble tut-bubble">{{ t('tutItem1') }}</div>
              </div>
              <p class="tut-hint">{{ t('tut1') }}</p>
            </div>
            <div v-else-if="tutStep===1" class="tut-step">
              <div class="tut-customer">
                <img :src="resolveImage('/images/2.jpg')" class="tut-img"/>
                <div class="speech-bubble tut-bubble">{{ t('tutItem1') }}、{{ t('tutItem2') }}</div>
              </div>
              <p class="tut-hint">{{ t('tut2') }}</p>
            </div>
            <div v-else class="tut-step">
              <div class="demo-opts">
                <button class="opt-btn demo-sel">{{ t('tutItem1') }}</button>
                <button class="opt-btn demo-sel">{{ t('tutItem2') }}</button>
                <button class="opt-btn">{{ t('tutItem3') }}</button>
              </div>
              <p class="tut-hint">{{ t('tut3') }}</p>
            </div>
          </div>
          <div class="tut-nav">
            <button v-if="tutStep>0" @click="tutStep--">{{ t('prev') }}</button>
            <button @click="finishTutorial">{{ t('skip') }}</button>
            <button v-if="tutStep<2" @click="tutStep++">{{ t('next') }}</button>
            <button v-else @click="finishTutorial">{{ t('done') }}</button>
          </div>
        </div>
      </div>

      <!-- DURATION SELECT -->
      <div v-else-if="page==='duration'" class="page duration">
        <h2>{{ t('selectDur') }}</h2>
        <div class="dur-btns">
          <button
            v-for="m in [1,3,5]" :key="m"
            :class="{ sel: selectedDur === m }"
            @click="selectedDur = m"
          >{{ m }} {{ t('min') }}</button>
        </div>
        <button class="ready-btn" :disabled="!selectedDur" @click="startGame(selectedDur)">{{ t('startNow') }}</button>
      </div>

      <!-- PLAYING -->
      <div v-else-if="page==='playing'" class="page playing">
        <!-- Full-screen background image -->
        <img :src="ordering ? resolveImage('/images/2.jpg') : resolveImage('/images/1.jpg')" class="bg-img"/>
        <div class="bg-mask"></div>

        <!-- Speech bubble near customer face -->
        <div v-if="ordering && bubble" class="speech-bubble game-bubble">{{ bubble }}</div>

        <!-- HUD -->
        <div class="hud">
          <span>{{ t('diff') }}: {{ difficulty }}</span>
          <span>{{ t('score') }}: {{ score }}</span>
          <span>{{ t('time') }}: {{ fmtTime(remain) }}</span>
        </div>
        <button v-if="showBatchSkip" class="skip-btn" @click="onBatchSkip">{{ t('skipGame') }}</button>
        <button class="back-btn" @click="pauseGame">{{ t('back') }}</button>

        <!-- Bottom panel -->
        <div class="bottom-panel">
          <p class="task-label">{{ ordering ? t('taskOrder') : t('taskSelect') }}</p>
          <div v-if="!ordering && opts.length" class="opts-grid">
            <button
              v-for="(o,i) in opts" :key="i"
              class="opt-btn"
              :class="{ sel: picked.includes(o.key), ok: resultMap[o.key]==='ok', err: resultMap[o.key]==='err', miss: resultMap[o.key]==='miss' }"
              :disabled="showFb"
              @click="pick(o.key)"
            >{{ o.name }}</button>
          </div>
          <div v-if="!ordering && opts.length" class="progress">
            {{ t('progress') }}: {{ picked.length }} / {{ order.length }}
          </div>
          <div v-if="showFb" class="feedback" :class="lastOk?'fb-ok':'fb-err'">
            {{ lastOk ? t('correct') : t('wrong') }}
          </div>
        </div>

        <!-- Pause modal -->
        <div v-if="paused" class="overlay">
          <div class="modal">
            <h2>{{ t('paused') }}</h2>
            <p style="margin-bottom: 20px;">{{ t('backConfirm') }}</p>
            <div style="display:flex; gap:16px; justify-content:center;">
              <button class="btn-cancel" @click="resumeGame">{{ t('cancel') }}</button>
              <button @click="confirmLeave">{{ t('confirmBack') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- RESULT -->
      <div v-else-if="page==='result'" class="page result">
        <h2>{{ t('over') }}</h2>
        <div class="result-stats">
          <p>{{ t('score') }}: <strong>{{ score }}</strong></p>
          <p>{{ t('total') }}: {{ totalQ }}</p>
          <p>{{ t('correct') }}: {{ okQ }}</p>
          <p>{{ t('rate') }}: {{ totalQ ? Math.round(okQ/totalQ*100) : 0 }}%</p>
        </div>
        <button @click="goHome">{{ t('goHome') }}</button>
      </div>

    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from './assets'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const FOODS = [
  {e:'🍜',zh:'面条',en:'Noodles'},{e:'🍚',zh:'米饭',en:'Rice'},{e:'🍱',zh:'便当',en:'Bento'},
  {e:'🍣',zh:'寿司',en:'Sushi'},{e:'🍛',zh:'咖喱',en:'Curry'},{e:'🍝',zh:'意面',en:'Pasta'},
  {e:'🥗',zh:'沙拉',en:'Salad'},{e:'🍲',zh:'火锅',en:'Hotpot'},{e:'🥩',zh:'牛排',en:'Steak'},
  {e:'🍗',zh:'鸡腿',en:'Chicken'},{e:'🍤',zh:'炸虾',en:'Shrimp'},{e:'🥟',zh:'饺子',en:'Dumplings'},
  {e:'🌮',zh:'玉米卷',en:'Taco'},{e:'🍕',zh:'披萨',en:'Pizza'},{e:'🍔',zh:'汉堡',en:'Burger'},
  {e:'🌭',zh:'热狗',en:'Hotdog'},{e:'🥪',zh:'三明治',en:'Sandwich'},{e:'🍰',zh:'蛋糕',en:'Cake'},
  {e:'🧆',zh:'丸子',en:'Falafel'},{e:'🍦',zh:'冰淇淋',en:'Ice Cream'},
]

const DIFF = [
  {level:1,items:1,dis:1,coef:1},
  {level:2,items:2,dis:1,coef:1.5},
  {level:3,items:3,dis:1,coef:2},
  {level:4,items:3,dis:2,coef:2.5},
  {level:5,items:4,dis:1,coef:3},
  {level:6,items:4,dis:2,coef:3.5},
  {level:7,items:5,dis:2,coef:4},
]

const I18N = {
  zh: {
    title:'餐厅点餐',start:'开始游戏',rules:'规则介绍',history:'历史记录',close:'关闭',
    r1:'记住顾客点的所有菜品',r2:'点击顾客点过的所有菜品（顺序无所谓）',r3:'每题最长30秒',r4:'难度每60秒自动调整',
    hDate:'日期',hDiff:'难度',hScore:'得分',hTotal:'总题数',hOk:'正确',hRate:'正确率',noHist:'暂无记录',
    tut1:'顾客会逐一说出他要点的菜',tut2:'记住所有菜品',tut3:'点击顾客点过的所有菜品（顺序不限）',
    tutItem1:'面条',tutItem2:'披萨',tutItem3:'汉堡',
    prev:'上一步',next:'下一步',skip:'跳过',done:'开始',
    selectDur:'选择训练时长',min:'分钟',startNow:'开始游戏',
    diff:'难度',score:'得分',time:'剩余时间',back:'返回',
    taskOrder:'请记住顾客点餐的内容',taskSelect:'请选择顾客刚刚所点的餐品',
    progress:'已选',
    correct:'回答正确！',wrong:'回答错误！',
    paused:'游戏已暂停',backConfirm:'确认返回首页吗？返回后本次训练将结束。',cancel:'取消',confirmBack:'确认返回',
    over:'游戏结束',total:'总题数',rate:'正确率',goHome:'返回首页',
    skipGame:'跳过',
  },
  en: {
    title:'Restaurant Order',start:'Start Game',rules:'Rules',history:'History',close:'Close',
    r1:'Remember all dishes the customer ordered',r2:'Click all dishes ordered (order doesn\'t matter)',r3:'Max 30s per question',r4:'Difficulty auto-adjusts every 60s',
    hDate:'Date',hDiff:'Diff',hScore:'Score',hTotal:'Total',hOk:'Correct',hRate:'Rate',noHist:'No records yet',
    tut1:'Customer will say each dish one by one',tut2:'Remember all dishes',tut3:'Click all dishes (order not required)',
    tutItem1:'Noodles',tutItem2:'Pizza',tutItem3:'Burger',
    prev:'Prev',next:'Next',skip:'Skip',done:'Start',
    selectDur:'Select Duration',min:'min',startNow:'Start Game',
    diff:'Diff',score:'Score',time:'Time',back:'Back',
    taskOrder:'Remember the customer\'s order',taskSelect:'Select the dishes the customer just ordered',
    progress:'Selected',
    correct:'Correct!',wrong:'Wrong!',
    paused:'Paused',backConfirm:'Return to home? Current session will end.',cancel:'Cancel',confirmBack:'Confirm',
    over:'Game Over',total:'Total',rate:'Rate',goHome:'Home',
    skipGame:'Skip',
  },
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function sleep(ms, isPaused) {
  return new Promise(resolve => {
    let elapsed = 0
    const iv = setInterval(() => {
      if (isPaused()) return
      elapsed += 50
      if (elapsed >= ms) { clearInterval(iv); resolve() }
    }, 50)
  })
}

export default {
  data() {
    return {
      page: 'home',
      lang: 'zh',
      gamePlayed: false,
      rulesOpen: false,
      historyOpen: false,
      tutStep: 0,
      selectedDur: 0,
      // game state
      difficulty: 1,
      score: 0,
      remain: 0,
      totalQ: 0,
      okQ: 0,
      order: [],       // current question required dishes
      opts: [],        // shuffled options shown
      picked: [],      // player selections
      ordering: false,
      bubble: '',
      showFb: false,
      lastOk: false,
      resultMap: {},   // opt -> 'ok'|'err'|'miss'
      histList: [],
      paused: false,
      // ticker-based timing (ms precision)
      ticker: null,
      lastTickTs: 0,
      remainMs: 0,
      qRemainMs: 0,    // 0 means no active question timer
      diffElapsedMs: 0,
      // window rate tracking
      winQ: 0,
      winOk: 0,
      scale: 1,
      BASE_W: 1280,
      BASE_H: 720,
      voiceAudio: null,
      archiveId: null, // 患者档案 ID
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  computed: {
    scaleStyle() {
      return {
        width: this.BASE_W + 'px',
        height: this.BASE_H + 'px',
        transform: `scale(${this.scale})`,
        transformOrigin: 'center center',
      }
    },
  },
  created() {
    this.histList = JSON.parse(localStorage.getItem('rts_hist') || '[]')
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
  },
  mounted() {
    applyBatchTutorialEntry('ctdc', {
      setDuration: (dur) => { this.selectedDur = dur },
      setStartDifficulty: (lv) => { this.difficulty = lv },
      openTutorial: () => { this.page = 'tutorial'; this.tutStep = 0 },
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScale)
    this.stopTicker()
    this.stopVoice()
  },
  methods: { resolveImage,
    t(k) { return (I18N[this.lang] || I18N.zh)[k] || k },
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    updateScale() {
      this.scale = Math.min(window.innerWidth / this.BASE_W, window.innerHeight / this.BASE_H)
    },
    fmtTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` },
    playVoice(n) {
      this.stopVoice()
      const folder = this.lang === 'zh' ? 'chinese' : 'english'
      const a = new Audio(resolveVoice(`/voice/${folder}/${n}.mp3`))
      this.voiceAudio = a
      a.play().catch(() => {})
    },
    stopVoice() {
      if (this.voiceAudio) {
        try { this.voiceAudio.pause(); this.voiceAudio.currentTime = 0 } catch(e) {}
        this.voiceAudio = null
      }
    },
    startTicker() {
      this.lastTickTs = Date.now()
      this.ticker = setInterval(() => {
        if (this.paused) { this.lastTickTs = Date.now(); return }
        const now = Date.now()
        const dt = now - this.lastTickTs
        this.lastTickTs = now
        this.remainMs -= dt
        this.remain = Math.max(0, Math.ceil(this.remainMs / 1000))
        // difficulty adjustment every 60s
        this.diffElapsedMs += dt
        if (this.diffElapsedMs >= 60000) {
          this.diffElapsedMs = 0
          this.adjustDiff()
        }
        // question timer
        if (this.qRemainMs > 0) {
          this.qRemainMs -= dt
          if (this.qRemainMs <= 0) {
            this.qRemainMs = 0
            this.submitAnswer()
          }
        }
        if (this.remainMs <= 0) this.endGame()
      }, 100)
    },
    stopTicker() { clearInterval(this.ticker); this.ticker = null },
    startGame(minutes, startDiff) {
      if (!minutes) return
      this.gamePlayed = true
      this.selectedDur = minutes
      this.difficulty = startDiff != null ? startDiff : getBatchStartDifficultyForGame('ctdc')
      this.score = 0
      this.totalQ = 0
      this.okQ = 0
      this.remainMs = minutes * 60 * 1000
      this.remain = minutes * 60
      this.qRemainMs = 0
      this.diffElapsedMs = 0
      this.winQ = 0
      this.winOk = 0
      this.paused = false
      this.page = 'playing'
      this.startTicker()
      this.nextRound()
    },
    adjustDiff() {
      if (!this.winQ) return
      const rate = this.winOk / this.winQ
      if (rate >= 0.9 && this.difficulty < 7) this.difficulty++
      else if (rate <= 0.7 && this.difficulty > 1) this.difficulty--
      this.winQ = 0
      this.winOk = 0
    },
    async nextRound() {
      if (this.page !== 'playing') return
      this.opts = []
      this.picked = []
      this.resultMap = {}
      this.showFb = false
      this.bubble = ''
      this.qRemainMs = 0
      const cfg = DIFF[this.difficulty - 1]
      const pool = shuffle(FOODS)
      const chosen = pool.slice(0, cfg.items)
      const disPool = pool.slice(cfg.items, cfg.items + cfg.dis)
      this.order = chosen.map(f => f[this.lang])
      // ordering animation
      this.ordering = true
      this.playVoice(1)
      const isPaused = () => this.paused
      await sleep(400, isPaused)
      if (this.page !== 'playing') return
      for (const f of chosen) {
        this.bubble = this.bubble ? `${this.bubble}、${f[this.lang]}` : f[this.lang]
        await sleep(1100, isPaused)
        if (this.page !== 'playing') return
      }
      // keep the full order visible briefly before switching to selection
      await sleep(800, isPaused)
      if (this.page !== 'playing') return
      this.ordering = false
      this.bubble = ''
      this.playVoice(2)
      const allOpts = shuffle([
        ...chosen.map(f => ({ e: f.e, name: f[this.lang], key: f[this.lang] })),
        ...disPool.map(f => ({ e: f.e, name: f[this.lang], key: f[this.lang] })),
      ])
      this.opts = allOpts
      // start 30s question timer via ticker
      this.qRemainMs = 30000
    },
    pick(opt) {
      if (this.showFb || this.paused) return
      const idx = this.picked.indexOf(opt)
      if (idx >= 0) {
        this.picked.splice(idx, 1)
        return
      }
      if (this.picked.length >= this.order.length) return
      this.picked.push(opt)
      if (this.picked.length === this.order.length) {
        this.qRemainMs = 0
        this.submitAnswer()
      }
    },
    submitAnswer() {
      this.qRemainMs = 0
      this.totalQ++
      this.winQ++
      const orderSet = new Set(this.order)
      const pickedSet = new Set(this.picked)
      const correct = this.picked.length === this.order.length &&
        this.picked.every(p => orderSet.has(p))
      if (correct) {
        const coef = DIFF[this.difficulty - 1].coef
        this.score += Math.round(5 * coef)
        this.okQ++
        this.winOk++
        this.lastOk = true
        this.picked.forEach(o => { this.$set(this.resultMap, o, 'ok') })
      } else {
        this.lastOk = false
        this.picked.forEach(o => {
          this.$set(this.resultMap, o, orderSet.has(o) ? 'ok' : 'err')
        })
        // highlight missed required items
        this.order.forEach(o => {
          if (!pickedSet.has(o)) this.$set(this.resultMap, o, 'miss')
        })
      }
      this.showFb = true
      setTimeout(() => {
        if (this.page === 'playing' && !this.paused) this.nextRound()
        else if (this.page === 'playing') {
          // if paused during feedback, wait for resume
          const waitResume = setInterval(() => {
            if (!this.paused) { clearInterval(waitResume); this.nextRound() }
          }, 200)
        }
      }, 1500)
    },
    finishTutorial() {
      this.tutStep = 0
      if (afterBatchTutorial('ctdc', (dur, startDiff) => this.startGame(dur, startDiff))) return
      this.page = 'duration'
    },
    /**
     * <summary>
     * 中途确认返回：只停计时/语音并离开，不上传训练数据
     * </summary>
     */
    confirmLeave() {
      this.stopTicker() // 停止主循环
      this.stopVoice() // 停止语音
      leavePbGameWindow({ confirm: false })
    },
    onBatchSkip() {
      skipPbBatchGame() // 跳过当前批次游戏
    },
    pauseGame() { this.paused = true },
    resumeGame() { this.paused = false; this.lastTickTs = Date.now() },
    endGame() {
      this.stopTicker()
      this.stopVoice()
      submitPbGameEndRecord(this.archiveId, 'ctdc', {
        score: this.score || 0,
        successCount: this.okQ,
        failCount: this.totalQ - this.okQ,
        trainDuration: this.selectedDur,
        difficultyLevel: this.difficulty,
      }).catch(() => {})
      const rec = {
        date: new Date().toLocaleDateString(),
        diff: this.difficulty,
        score: this.score,
        total: this.totalQ,
        ok: this.okQ,
        rate: this.totalQ ? Math.round(this.okQ / this.totalQ * 100) : 0,
      }
      this.histList.unshift(rec)
      localStorage.setItem('rts_hist', JSON.stringify(this.histList.slice(0, 50)))
      this.paused = false
      this.page = 'result'
    },
    goHome() {
      this.gamePlayed = false
      this.selectedDur = 0
      this.page = 'home'
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #16213e; font-family: sans-serif; overflow: hidden; }

.root {
  width: 100vw; height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex; align-items: center; justify-content: center;
}
.scale-box { position: relative; overflow: hidden; }

.page {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; position: relative;
}

/* HOME */
.home { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
.lang-btn { position: absolute; top: 24px; right: 24px; padding: 8px 18px; border: 2px solid #e94560; border-radius: 20px; background: transparent; color: #e94560; cursor: pointer; font-size: 15px; z-index: 10; }
.title { font-size: 52px; margin-bottom: 48px; color: #e94560; text-shadow: 0 0 20px #e94560aa; }
.home-btns { display: flex; gap: 24px; }
.home-btns button { padding: 16px 40px; font-size: 20px; border: none; border-radius: 12px; cursor: pointer; background: #e94560; color: #fff; transition: transform .1s; }
.home-btns button:hover { transform: scale(1.05); }

/* MODALS */
.overlay { position: absolute; inset: 0; background: #000a; display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #16213e; border: 2px solid #e94560; border-radius: 16px; padding: 32px; min-width: 380px; color: #fff; text-align: center; }
.modal.wide { min-width: 560px; }
.modal h2 { color: #e94560; margin-bottom: 16px; font-size: 24px; }
.modal ul { padding-left: 20px; margin-bottom: 20px; line-height: 2; text-align: left; }
.modal button { padding: 10px 28px; background: #e94560; border: none; border-radius: 8px; color: #fff; cursor: pointer; font-size: 15px; }
.modal button.btn-cancel { background: #555; }
.modal table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
.modal th, .modal td { border: 1px solid #334; padding: 8px 10px; text-align: center; }
.modal th { background: #0f3460; }

/* TUTORIAL */
.tutorial { background: #16213e; }
.tut-modal { display: flex; flex-direction: column; gap: 20px; min-width: 640px; max-width: 860px; }
.tut-body { min-height: 300px; display: flex; align-items: center; justify-content: center; }
.tut-step { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.tut-customer { position: relative; display: inline-block; }
.tut-img { width: 220px; height: 220px; object-fit: cover; border-radius: 12px; }
.tut-bubble { top: 20%; left: 105%; }
.tut-hint { font-size: 26px; color: #e6edf6; text-align: center; font-weight: bold; line-height: 1.5; }
.tut-nav { display: flex; gap: 20px; justify-content: center; }
.tut-nav button { padding: 14px 36px; background: #e94560; border: none; border-radius: 10px; color: #fff; cursor: pointer; font-size: 20px; font-weight: bold; }
.demo-opts { display: flex; gap: 20px; }

/* DURATION */
.duration { background: #16213e; gap: 40px; }
.duration h2 { font-size: 40px; color: #e94560; }
.dur-btns { display: flex; gap: 32px; }
.dur-btns button {
  padding: 28px 60px; font-size: 30px; font-weight: bold; background: #0f3460;
  border: 2px solid #1e3a5f; border-radius: 16px; color: #fff; cursor: pointer;
  transition: all .2s;
}
.dur-btns button:hover { background: #1e3a5f; }
.dur-btns button.sel { background: #e94560; border-color: #f5a623; color: #fff; }
.ready-btn { padding: 20px 72px; font-size: 28px; background: #f5a623; border: none; border-radius: 12px; color: #fff; cursor: pointer; margin-top: 20px; font-weight: bold; }
.ready-btn:disabled { background: #555; cursor: not-allowed; opacity: 0.6; }

/* PLAYING - full screen background */
.playing { padding: 0; overflow: hidden; }
.bg-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 1;
}
.bg-mask {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #00000055 0%, #00000000 40%, #00000000 60%, #000000cc 100%);
  z-index: 2;
}

.hud {
  position: absolute; top: 20px; left: 20px;
  display: flex; gap: 20px;
  background: #16213edd; border: 1px solid #e94560;
  padding: 10px 20px; border-radius: 10px;
  font-size: 17px; color: #a8b2c1;
  z-index: 10;
}
.hud span { font-weight: bold; color: #fff; }
.back-btn {
  position: absolute; top: 20px; right: 20px;
  padding: 10px 24px; background: #e94560; border: none; border-radius: 8px;
  color: #fff; cursor: pointer; font-size: 15px; z-index: 10;
}
.skip-btn {
  position: absolute; top: 20px; right: 120px;
  padding: 10px 24px; background: #6b7280; border: none; border-radius: 8px;
  color: #fff; cursor: pointer; font-size: 15px; z-index: 10;
}

.game-bubble {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  padding: 14px 28px;
  max-width: 70%;
  text-align: center;
  z-index: 20;
}
.game-bubble::before, .game-bubble::after {
  left: 50%; top: auto; bottom: -12px;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-right-color: transparent;
  border-top-color: #f5a623;
}
.game-bubble::after {
  bottom: -8px;
  border: 6px solid transparent;
  border-top-color: #fffde7;
}

.bottom-panel {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 20px 32px 26px;
  background: linear-gradient(180deg, #00000000 0%, #000000cc 30%, #000000ee 100%);
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  z-index: 5;
}
.task-label {
  font-size: 22px; color: #fff; font-weight: bold;
  background: #e94560cc; padding: 8px 24px; border-radius: 20px;
}
.opts-grid { display: flex; flex-wrap: wrap; gap: 18px; justify-content: center; max-width: 92%; }
.opt-btn {
  min-width: 170px; min-height: 84px;
  font-size: 26px; font-weight: bold; padding: 14px 24px;
  background: #1e3a5fee; border: 2px solid #2a5a8f;
  border-radius: 12px; color: #fff; cursor: pointer;
  transition: all .15s;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.3;
}
.opt-btn:hover:not(:disabled) { background: #2a5a8fee; transform: scale(1.05); }
.opt-btn.sel { background: #0f3460ee; border-color: #f5a623; }
.opt-btn.demo-sel { background: #0f3460; border-color: #4caf50; }
.opt-btn.ok { background: #1b5e20ee; border-color: #4caf50; }
.opt-btn.err { background: #7f0000ee; border-color: #e94560; }
.opt-btn.miss { background: #4a4a00ee; border-color: #f5a623; }
.opt-btn:disabled { cursor: default; }

.progress { color: #f5a623; font-size: 16px; font-weight: bold; }
.feedback { font-size: 24px; font-weight: bold; padding: 6px 24px; border-radius: 10px; }
.fb-ok { color: #4caf50; }
.fb-err { color: #ff6b6b; }

/* Speech bubble base */
.speech-bubble {
  background: #fffde7;
  color: #333;
  border: 3px solid #f5a623;
  border-radius: 16px;
  padding: 12px 20px;
  font-weight: bold;
  box-shadow: 0 4px 16px #0006;
  position: absolute;
}
.tut-bubble {
  font-size: 17px; white-space: nowrap;
}
.tut-bubble::before {
  content: '';
  position: absolute;
  left: -14px; top: 50%;
  transform: translateY(-50%);
  border: 7px solid transparent;
  border-right-color: #f5a623;
}
.tut-bubble::after {
  content: '';
  position: absolute;
  left: -10px; top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #fffde7;
}

/* RESULT */
.result { background: #16213e; }
.result h2 { font-size: 40px; color: #e94560; margin-bottom: 32px; }
.result-stats { background: #0f3460; border-radius: 16px; padding: 28px 48px; margin-bottom: 32px; font-size: 20px; line-height: 2.2; text-align: center; }
.result-stats strong { color: #f5a623; font-size: 28px; }
.result button { padding: 14px 40px; background: #e94560; border: none; border-radius: 10px; color: #fff; font-size: 18px; cursor: pointer; }

/* ============ PORTRAIT (mobile / WeChat web-view) ============ */
@media (orientation: portrait) {
  html, body { overflow-y: auto; overflow-x: hidden; }
  .root { height: 100vh; height: 100dvh; align-items: stretch; justify-content: stretch; }
  /* Neutralize fixed 1280x720 scale-box; use natural flow */
  .scale-box {
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    transform: none !important;
  }
  .page {
    padding: calc(16px + env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom));
    justify-content: flex-start;
    gap: 20px;
  }

  /* HOME */
  .lang-btn {
    top: calc(16px + env(safe-area-inset-top));
    right: 16px;
    font-size: max(3.6vmin, 14px);
    padding: 10px 20px;
    border-radius: 24px;
  }
  .title {
    font-size: max(8vmin, 32px);
    margin-top: 8vh;
    margin-bottom: 6vh;
    text-align: center;
    padding: 0 8px;
  }
  .home { justify-content: center; }
  .home-btns { flex-direction: column; gap: 16px; width: 84%; }
  .home-btns button {
    width: 100%;
    padding: 18px 24px;
    font-size: max(4.5vmin, 18px);
    border-radius: 16px;
  }

  /* MODAL */
  .modal, .modal.wide {
    min-width: 0 !important;
    width: 90vw;
    max-width: 92vw;
    max-height: 85vh;
    padding: 22px 18px;
    border-radius: 18px;
    overflow-y: auto;
  }
  .modal h2 { font-size: max(5vmin, 20px); }
  .modal ul { font-size: max(3.8vmin, 15px); line-height: 1.8; }
  .modal button {
    padding: 14px 28px;
    font-size: max(4vmin, 16px);
    border-radius: 12px;
    min-width: 44%;
  }
  /* History table → card list */
  .modal table, .modal thead, .modal tbody, .modal tr, .modal th, .modal td { display: block; width: 100%; }
  .modal thead { display: none; }
  .modal tbody tr {
    border: 1px solid #334;
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 10px 12px;
    background: #0f3460;
  }
  .modal tbody td {
    border: none;
    text-align: left;
    padding: 4px 0;
    font-size: max(3.6vmin, 14px);
  }
  .modal tbody td { color: #fff; }

  /* TUTORIAL */
  .tut-modal { width: 92vw; max-width: 92vw; min-width: 0 !important; }
  .tut-body { min-height: 220px; }
  .tut-img { width: 44vw; height: 44vw; max-width: 220px; max-height: 220px; }
  .tut-bubble { position: static; margin-top: 12px; white-space: normal; font-size: max(4vmin, 15px); }
  .tut-bubble::before, .tut-bubble::after { display: none; }
  .tut-customer { display: flex; flex-direction: column; align-items: center; }
  .tut-hint { font-size: max(4vmin, 15px); padding: 0 6px; }
  .tut-nav { flex-wrap: wrap; gap: 12px; }
  .tut-nav button { padding: 12px 22px; font-size: max(4vmin, 15px); border-radius: 12px; min-width: 40%; }
  .demo-opts { flex-wrap: wrap; gap: 12px; justify-content: center; }

  /* DURATION */
  .duration { justify-content: center; }
  .duration h2 { font-size: max(6vmin, 24px); text-align: center; }
  .dur-btns { flex-direction: column; gap: 16px; width: 80%; }
  .dur-btns button {
    width: 100%;
    padding: 20px 24px;
    font-size: max(4.8vmin, 18px);
    border-radius: 18px;
  }
  .ready-btn {
    width: 80%;
    padding: 18px 24px;
    font-size: max(5vmin, 18px);
    border-radius: 16px;
  }

  /* PLAYING */
  .playing { padding: 0; }
  .hud {
    top: calc(12px + env(safe-area-inset-top));
    left: 12px;
    right: 12px;
    gap: 10px;
    padding: 10px 14px;
    font-size: max(3.4vmin, 13px);
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .skip-btn {
    top: calc(12px + env(safe-area-inset-top) + 60px);
    left: 12px;
    right: auto;
    padding: 10px 18px;
    font-size: max(3.6vmin, 14px);
    border-radius: 10px;
  }
  .back-btn {
    top: calc(12px + env(safe-area-inset-top) + 60px);
    right: 12px;
    padding: 10px 18px;
    font-size: max(3.6vmin, 14px);
    border-radius: 10px;
  }
  .game-bubble {
    top: 30%;
    font-size: max(4.6vmin, 16px);
    padding: 12px 20px;
    max-width: 86%;
    border-radius: 18px;
  }
  .bottom-panel {
    padding: 20px 14px calc(24px + env(safe-area-inset-bottom));
    gap: 12px;
  }
  .task-label {
    font-size: max(4.2vmin, 15px);
    padding: 10px 18px;
    border-radius: 22px;
    text-align: center;
  }
  .opts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    max-width: 100%;
  }
  .opt-btn {
    min-width: 0;
    width: 100%;
    min-height: 60px;
    font-size: max(4vmin, 15px);
    padding: 12px 10px;
    border-radius: 14px;
  }
  .progress { font-size: max(3.8vmin, 14px); }
  .feedback { font-size: max(5vmin, 18px); padding: 8px 20px; border-radius: 12px; }

  /* RESULT */
  .result { justify-content: center; }
  .result h2 { font-size: max(7vmin, 26px); margin-bottom: 24px; text-align: center; }
  .result-stats {
    width: 88%;
    padding: 20px 22px;
    font-size: max(4.2vmin, 16px);
    line-height: 2;
    border-radius: 18px;
  }
  .result-stats strong { font-size: max(5.6vmin, 22px); }
  .result button {
    width: 80%;
    padding: 16px 24px;
    font-size: max(4.6vmin, 17px);
    border-radius: 14px;
  }
}
</style>
