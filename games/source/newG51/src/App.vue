<template>
  <div id="app" :class="['screen-'+screen, lang]">
    <!-- Top decoration -->
    <div class="bg-decor">
      <div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
    </div>

    <!-- Language toggle -->
    <button
      v-if="screen !== 'game'"
      class="lang-btn"
      @click="toggleLang"
    >
      <span class="globe">🌐</span> {{ t.langBtn }}
    </button>

    <!-- ============ HOME ============ -->
    <transition name="fade">
    <section v-if="screen === 'home'" class="home">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 100 100" width="72" height="72">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#7ea0ff"/><stop offset="1" stop-color="#4a5fd6"/>
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#bg)"/>
            <path d="M28 40 L44 56 L72 28" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="76" cy="66" r="10" fill="#ffcc33"/>
            <path d="M70 66 L74 70 L82 62" stroke="#4a5fd6" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="title">{{ t.appTitle }}</h1>
        <p class="subtitle">{{ t.subtitle }}</p>
      </div>
      <div class="menu">
        <button class="btn btn-primary" @click="onStart">
          <span class="btn-ico">▶</span>{{ t.startGame }}
        </button>
        <button class="btn btn-secondary" @click="showRules = true">
          <span class="btn-ico">📖</span>{{ t.rules }}
        </button>
        <button class="btn btn-secondary" @click="screen='history'">
          <span class="btn-ico">📊</span>{{ t.history }}
        </button>
      </div>
    </section>
    </transition>

    <!-- ============ RULES MODAL ============ -->
    <transition name="pop">
    <div v-if="showRules" class="modal-mask" @click.self="showRules=false">
      <div class="modal card">
        <h2>{{ t.rulesTitle }}</h2>
        <ol class="rules">
          <li v-for="(r,i) in t.rulesBody" :key="i">{{ r }}</li>
        </ol>
        <button class="btn btn-primary sm" @click="showRules=false">{{ t.close }}</button>
      </div>
    </div>
    </transition>

    <!-- ============ TUTORIAL ============ -->
    <transition name="fade">
    <section v-if="screen === 'tutorial'" class="tutorial">
      <div class="card tut-card">
        <div class="tut-head">
          <h2>{{ t.tutorialTitle }}</h2>
          <button class="chip" @click="skipTutorial">{{ t.skip }}</button>
        </div>
        <div class="tut-body">
          <TutorialStep :step="tutStep" :lang="lang" :t="t"/>
        </div>
        <div class="tut-dots">
          <span v-for="i in 4" :key="i" :class="['dot',{active:tutStep===i-1}]" />
        </div>
        <div class="tut-nav">
          <button class="btn btn-secondary sm" :disabled="tutStep===0" @click="tutStep--">{{ t.prev }}</button>
          <button v-if="tutStep < 3" class="btn btn-primary sm" @click="tutStep++">{{ t.next }}</button>
          <button v-else class="btn btn-primary sm" @click="onTutorialDone">{{ t.startNow }}</button>
        </div>
      </div>
    </section>
    </transition>

    <!-- ============ DURATION ============ -->
    <transition name="fade">
    <section v-if="screen === 'duration'" class="duration">
      <div class="card dur-card">
        <h2>{{ t.chooseDuration }}</h2>
        <div class="dur-list">
          <button v-for="m in [1,3,5]" :key="m"
            class="dur-item"
            :class="{selected: pickedDuration === m}"
            @click="pickedDuration = m">
            <div class="dur-num">{{ m }}</div>
            <div class="dur-lbl">{{ t.minute }}</div>
            <div class="dur-hint">⏱</div>
            <div v-if="pickedDuration === m" class="dur-check">✓</div>
          </button>
        </div>
        <div class="row dur-actions">
          <button class="btn btn-secondary" @click="screen='home'">
            <span class="btn-ico">←</span>{{ t.back }}
          </button>
          <button class="btn btn-primary" :disabled="!pickedDuration" @click="startGame(pickedDuration)">
            <span class="btn-ico">▶</span>{{ t.startGame }}
          </button>
        </div>
      </div>
    </section>
    </transition>

    <!-- ============ GAME ============ -->
    <section v-if="screen === 'game'" class="game" @dragover.prevent>
      <header class="game-top">
        <div class="stat">
          <span class="stat-lbl">{{ t.difficulty }}</span>
          <span class="stat-val">Lv.{{ difficulty }}</span>
        </div>
        <div class="stat">
          <span class="stat-lbl">{{ t.score }}</span>
          <span class="stat-val gold">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="stat-lbl">{{ t.timeLeft }}</span>
          <span class="stat-val" :class="{danger: timeLeft<10}">{{ formatTime(timeLeft) }}</span>
        </div>
        <div class="task-title">
          <span class="task-tag">{{ t.task }}：</span>
          <h2>{{ currentTaskName }}</h2>
        </div>
        <button v-if="showBatchSkip" class="skip-btn" @click="onBatchSkip">
          {{ t.skipBatch }}
        </button>
        <button class="back-btn" @click="requestBack">
          <span>✕</span>{{ t.back }}
        </button>
      </header>

      <div class="game-body">
        <p class="drag-hint">{{ t.dragHint }}</p>

        <!-- Step slots -->
        <div class="slots">
          <div v-for="(s,i) in stepCount" :key="'slot'+i"
            class="slot"
            :class="{filled: slotItems[i], correct: feedback[i]==='ok', wrong: feedback[i]==='no'}"
            @dragover.prevent
            @drop="onDrop(i)"
            @dragenter.prevent
          >
            <div class="slot-badge">{{ stepLabel(i+1) }}</div>
            <div class="slot-inner">
              <div v-if="slotItems[i]" class="chip-img"
                :draggable="!answered"
                @dragstart="onDragStart($event, slotItems[i], i)"
                @touchstart="onTouchStart($event, slotItems[i], i)"
              >
                <img :src="slotItems[i].url" alt=""/>
                <div v-if="showText" class="chip-txt">{{ slotItems[i].label }}</div>
              </div>
              <div v-else class="slot-empty">
                <div class="slot-arrow">↓</div>
                <div class="slot-drop">{{ t.dropHere }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Palette -->
        <div class="palette-wrap">
          <div class="palette">
            <div v-for="(p, idx) in palette" :key="'p'+p.id"
              class="chip-img palette-item"
              :draggable="!answered"
              @dragstart="onDragStart($event, p, -1)"
              @touchstart="onTouchStart($event, p, -1)"
              :style="{visibility: p.placed ? 'hidden':'visible'}"
            >
              <img :src="p.url" alt=""/>
              <div v-if="showText" class="chip-txt">{{ p.label }}</div>
            </div>
          </div>
        </div>

        <!-- Feedback banner -->
        <transition name="pop">
          <div v-if="answered" class="feedback" :class="allCorrect ? 'ok':'no'">
            <span class="fb-ico">{{ allCorrect ? '✓' : '✗' }}</span>
            <span class="fb-msg">{{ allCorrect ? t.correct : t.wrong }}</span>
          </div>
        </transition>
      </div>

      <!-- floating touch clone -->
      <div v-if="touchGhost" class="touch-ghost" :style="{left:touchGhost.x+'px', top:touchGhost.y+'px'}">
        <img :src="touchGhost.url"/>
      </div>
    </section>

    <!-- confirm back -->
    <transition name="pop">
    <div v-if="showConfirmBack" class="modal-mask" @click.self="cancelBack">
      <div class="modal card confirm">
        <div class="confirm-ico">⚠</div>
        <p>{{ t.confirmBack }}</p>
        <div class="row">
          <button class="btn btn-secondary sm" @click="cancelBack">{{ t.no }}</button>
          <button class="btn btn-secondary sm" @click="confirmLeave">{{ t.yes }}</button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ============ RESULT ============ -->
    <transition name="fade">
    <section v-if="screen === 'result'" class="result">
      <div class="card res-card">
        <h2>{{ t.resultTitle }}</h2>
        <div class="score-hero">
          <div class="hero-num">{{ lastResult.score }}</div>
          <div class="hero-lbl">{{ t.finalScore }}</div>
        </div>
        <div class="grid stats-grid">
          <div class="cell"><div class="k">{{ t.trainDifficulty }}</div><div class="v">Lv.{{ lastResult.maxDifficulty }}</div></div>
          <div class="cell"><div class="k">{{ t.duration }}</div><div class="v">{{ lastResult.duration }}{{ t.minute }}</div></div>
          <div class="cell"><div class="k">{{ t.totalCount }}</div><div class="v">{{ lastResult.total }}</div></div>
          <div class="cell"><div class="k">{{ t.successCount }}</div><div class="v ok">{{ lastResult.correct }}</div></div>
          <div class="cell"><div class="k">{{ t.failCount }}</div><div class="v no">{{ lastResult.wrong }}</div></div>
          <div class="cell"><div class="k">{{ t.successRate }}</div><div class="v">{{ lastResult.rate }}%</div></div>
          <div class="cell"><div class="k">{{ t.avgReaction }}</div><div class="v">{{ lastResult.avgReaction }}{{ t.seconds }}</div></div>
          <div class="cell"><div class="k">{{ t.trainTime }}</div><div class="v tiny">{{ lastResult.time }}</div></div>
        </div>
        <div class="row">
          <button class="btn btn-secondary" @click="screen='home'">{{ t.backHome }}</button>
          <button class="btn btn-primary" @click="onStart">{{ t.playAgain }}</button>
        </div>
      </div>
    </section>
    </transition>

    <!-- ============ HISTORY ============ -->
    <transition name="fade">
    <section v-if="screen === 'history'" class="history">
      <div class="card hist-card">
        <div class="hist-head">
          <h2>{{ t.history }}</h2>
          <div class="row">
            <button v-if="records.length" class="btn btn-secondary sm" @click="tryClear">{{ t.clearHistory }}</button>
            <button class="btn btn-secondary sm" @click="screen='home'">{{ t.backHome }}</button>
          </div>
        </div>
        <div v-if="!records.length" class="empty">{{ t.noHistory }}</div>
        <div v-else class="hist-table-wrap">
          <table class="hist-table">
            <thead>
              <tr>
                <th>{{ t.trainTime }}</th>
                <th>{{ t.trainItem }}</th>
                <th>{{ t.trainDifficulty }}</th>
                <th>{{ t.duration }}</th>
                <th>{{ t.totalCount }}</th>
                <th>{{ t.successCount }}</th>
                <th>{{ t.failCount }}</th>
                <th>{{ t.successRate }}</th>
                <th>{{ t.avgReaction }}</th>
                <th>{{ t.finalScore }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in records" :key="i">
                <td>{{ r.time }}</td>
                <td>{{ t.appTitle }}</td>
                <td>Lv.{{ r.maxDifficulty }}</td>
                <td>{{ r.duration }}{{ t.minute }}</td>
                <td>{{ r.total }}</td>
                <td class="ok">{{ r.correct }}</td>
                <td class="no">{{ r.wrong }}</td>
                <td>{{ r.rate }}%</td>
                <td>{{ r.avgReaction }}{{ t.seconds }}</td>
                <td class="gold">{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    </transition>
  </div>
</template>

<script>
import { dict } from './i18n.js'
import { taskGroups, difficultyConfig, taskImages } from './tasks.js'
import TutorialStep from './TutorialStep.vue'
import { resolveVoice } from './assets.js'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'ghdr' // 规划达人
const HISTORY_KEY = 'planning_master_history_v1'

export default {
  name: 'App',
  components: { TutorialStep },
  data() {
    return {
      lang: 'zh',
      screen: 'home', // home | tutorial | duration | game | result | history
      showRules: false,
      showConfirmBack: false,
      tutStep: 0,
      pickedDuration: null,
      // game state
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE), // HUD 当前难度
      pendingDifficulty: 1, // applied on next question load so board doesn't flash mid-level-change
      timerPaused: false,   // paused while confirm-back dialog is open
      score: 0,
      duration: 1, // minutes
      timeLeft: 60,
      timer: null,
      currentTaskKey: '',
      currentTaskImages: [], // ordered by step 1..n
      palette: [], // shuffled { id, url, label, correctIdx, placed }
      slotItems: [], // idx -> palette item or null
      feedback: [], // idx -> 'ok'|'no'|null
      answered: false,
      allCorrect: false,
      questionStart: 0,
      // session stats
      totalCount: 0,
      correctCount: 0,
      wrongCount: 0,
      streakCorrect: 0,
      streakWrong: 0,
      maxDifficulty: 1,
      reactionTotal: 0,
      records: [],
      lastResult: {},
      // touch drag
      touchGhost: null,
      touchItem: null,
      touchSourceSlot: -1,
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 批次跳过
    }
  },
  computed: {
    t() {
      const base = dict[this.lang]
      return {
        ...base,
        skipBatch: this.lang === 'zh' ? '跳过游戏' : 'Skip Game',
      }
    },
    cfg() { return difficultyConfig[this.difficulty] },
    stepCount() { return this.cfg.steps },
    showText() { return this.cfg.showText },
    currentTaskName() {
      const tasks = this.t.tasks || {}
      const task = tasks[this.currentTaskKey]
      return (task && task.name) || ''
    }
  },
  mounted() {
    this.loadRecords()
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
    const l = localStorage.getItem('pm_lang')
    if (l === 'en' || l === 'zh') this.lang = l
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (mins) => { this.pickedDuration = mins },
      openTutorial: () => { this.tutStep = 0; this.screen = 'tutorial' },
    })
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    if (this._audio) { try { this._audio.pause() } catch(e){} this._audio = null }
  },
  methods: {
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
      localStorage.setItem('pm_lang', this.lang)
    },
    stepLabel(n) {
      return this.t.step.replace('{n}', n)
    },
    formatTime(s) {
      const m = Math.floor(s/60), ss = s%60
      return `${m}:${ss.toString().padStart(2,'0')}`
    },
    onStart() {
      this.tutStep = 0
      this.pickedDuration = null
      this.screen = 'tutorial'
    },
    requestBack() {
      // Pause the countdown while the confirmation dialog is open.
      this.timerPaused = true
      this.showConfirmBack = true
    },
    cancelBack() {
      // Resume the countdown and hide the dialog.
      this.showConfirmBack = false
      this.timerPaused = false
    },
    skipTutorial() {
      this.onTutorialDone()
    },
    /**
     * <summary>
     * 教程完成：批次模式直接开局，否则进入时长选择
     * </summary>
     */
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (mins) => this.startGame(mins))) return
      this.pickedDuration = null
      this.screen = 'duration'
    },
    onBatchSkip() { skipPbBatchGame() },
    onSkipClick() { /* 题目内跳过：保留占位 */ },
    /**
     * <summary>
     * 确认中途退出：关窗返回，不上传
     * </summary>
     */
    confirmLeave() {
      if (this.timer) { clearInterval(this.timer); this.timer = null }
      if (this._audio) { try { this._audio.pause() } catch(e){} this._audio = null }
      this.showConfirmBack = false
      this.timerPaused = false
      leavePbGameWindow({ confirm: false })
    },
    startGame(mins) {
      this.duration = mins
      this.timeLeft = mins * 60
      this.difficulty = getBatchStartDifficultyForGame(GAME_TYPE) // 起始难度
      this.pendingDifficulty = this.difficulty
      this.timerPaused = false
      this.maxDifficulty = this.difficulty
      this.score = 0
      this.totalCount = 0
      this.correctCount = 0
      this.wrongCount = 0
      this.streakCorrect = 0
      this.streakWrong = 0
      this.reactionTotal = 0
      this.screen = 'game'
      this.$nextTick(() => {
        this.timer = setInterval(() => {
          if (this.timerPaused) return
          this.timeLeft--
          if (this.timeLeft <= 0) this.endGame(false)
        }, 1000)
        this.nextQuestion()
      })
    },
    nextQuestion() {
      // Apply any pending difficulty change from the previous evaluation so
      // the board renders with the new step count in one atomic swap.
      this.difficulty = this.pendingDifficulty
      const cfg = difficultyConfig[this.difficulty]
      const pool = taskGroups[cfg.steps]
      const key = pool[Math.floor(Math.random()*pool.length)]
      this.currentTaskKey = key
      const urls = taskImages(key)
      // Build palette with correct index preserved
      const items = urls.map((url, i) => ({
        id: `${key}-${i}-${Date.now()}-${Math.random()}`,
        url,
        label: this.t.tasks[key].steps[i],
        correctIdx: i,
        placed: false
      }))
      // Shuffle palette order (until different from correct order)
      let shuffled
      do {
        shuffled = [...items].sort(() => Math.random()-0.5)
      } while (shuffled.every((it, i) => it.correctIdx === i) && items.length > 1)
      this.palette = shuffled
      this.slotItems = new Array(cfg.steps).fill(null)
      this.feedback = new Array(cfg.steps).fill(null)
      this.answered = false
      this.allCorrect = false
      this.questionStart = Date.now()
      this.playPrompt()
    },
    playPrompt() {
      // Per-question voice prompt: /voice/{chinese|english}/1.mp3
      try {
        if (this._audio) { this._audio.pause(); this._audio.currentTime = 0 }
        const folder = this.lang === 'en' ? 'english' : 'chinese'
        const a = new Audio(resolveVoice(`/voice/${folder}/1.mp3`))
        a.volume = 1
        this._audio = a
        // Some browsers reject autoplay without user gesture; the first click
        // (Start Game) already qualifies so subsequent .play() calls work.
        const p = a.play()
        if (p && p.catch) p.catch(() => { /* ignore autoplay rejection */ })
      } catch (e) { /* no-op */ }
    },
    onDragStart(e, item, fromSlot) {
      if (this.answered) return
      e.dataTransfer.setData('text/plain', item.id)
      e.dataTransfer.effectAllowed = 'move'
      this._dragItem = item
      this._dragSource = fromSlot
    },
    onDrop(slotIdx) {
      if (this.answered) return
      const item = this._dragItem
      if (!item) return
      // If slot occupied swap
      const existing = this.slotItems[slotIdx]
      const src = this._dragSource
      if (src === -1) {
        // from palette
        item.placed = true
      } else {
        this.$set(this.slotItems, src, null)
      }
      if (existing) {
        if (src === -1) {
          existing.placed = false
        } else {
          this.$set(this.slotItems, src, existing)
        }
      }
      this.$set(this.slotItems, slotIdx, item)
      this._dragItem = null
      this._dragSource = null
      this.checkAllFilled()
    },
    // ---- touch drag support ----
    onTouchStart(e, item, fromSlot) {
      if (this.answered) return
      const touch = e.touches[0]
      this.touchItem = item
      this.touchSourceSlot = fromSlot
      this.touchGhost = { x: touch.clientX, y: touch.clientY, url: item.url }
      const move = (ev) => {
        const t = ev.touches[0]
        this.touchGhost = { x: t.clientX, y: t.clientY, url: item.url }
        ev.preventDefault()
      }
      const end = (ev) => {
        const t = ev.changedTouches[0]
        const el = document.elementFromPoint(t.clientX, t.clientY)
        const slot = el && el.closest('.slot')
        if (slot) {
          const idx = Array.from(slot.parentNode.children).indexOf(slot)
          this._dragItem = this.touchItem
          this._dragSource = this.touchSourceSlot
          this.onDrop(idx)
        }
        this.touchGhost = null
        this.touchItem = null
        document.removeEventListener('touchmove', move)
        document.removeEventListener('touchend', end)
      }
      document.addEventListener('touchmove', move, { passive: false })
      document.addEventListener('touchend', end)
    },
    checkAllFilled() {
      if (this.slotItems.every(x => x !== null)) {
        this.evaluate()
      }
    },
    evaluate() {
      this.answered = true
      const ok = this.slotItems.every((it, i) => it && it.correctIdx === i)
      this.allCorrect = ok
      this.feedback = this.slotItems.map((it,i) => (it && it.correctIdx === i) ? 'ok' : 'no')
      const reaction = (Date.now() - this.questionStart) / 1000
      this.reactionTotal += reaction
      this.totalCount++
      if (ok) {
        this.correctCount++
        this.streakCorrect++
        this.streakWrong = 0
        this.score += Math.round(5 * this.cfg.coef)
        if (this.streakCorrect >= 3 && this.pendingDifficulty < 6) {
          this.pendingDifficulty++
          this.streakCorrect = 0
          if (this.pendingDifficulty > this.maxDifficulty) this.maxDifficulty = this.pendingDifficulty
        }
      } else {
        this.wrongCount++
        this.streakWrong++
        this.streakCorrect = 0
        if (this.streakWrong >= 2 && this.pendingDifficulty > 1) {
          this.pendingDifficulty--
          this.streakWrong = 0
        }
      }
      // auto-advance after brief pause
      setTimeout(() => {
        if (this.screen === 'game' && this.timeLeft > 0) {
          this.nextQuestion()
        }
      }, 1200)
    },
    endGame(manual) {
      if (this.timer) { clearInterval(this.timer); this.timer = null }
      if (this._audio) { try { this._audio.pause() } catch(e){} this._audio = null }
      const total = this.totalCount
      const avgR = total ? (this.reactionTotal/total).toFixed(1) : '0.0'
      const rate = total ? Math.round(this.correctCount*100/total) : 0
      const now = new Date()
      const pad = n => n.toString().padStart(2,'0')
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      const result = {
        time: timeStr,
        maxDifficulty: this.difficulty, // 展示用当前难度
        duration: this.duration,
        total: total,
        correct: this.correctCount,
        wrong: this.wrongCount,
        rate,
        avgReaction: avgR,
        score: this.score
      }
      this.lastResult = result
      if (total > 0) {
        this.records.unshift(result)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.records.slice(0,100)))
        submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
          avgTime: toPbGameSeconds(avgR),
          score: this.score || 0,
          successCount: this.correctCount || 0,
          failCount: this.wrongCount || 0,
          trainDuration: this.duration, // 分钟制游戏
          difficultyLevel: this.difficulty || 1, // HUD 当前难度
        })
      }
      this.showConfirmBack = false
      this.screen = 'result'
    },
    loadRecords() {
      try {
        this.records = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      } catch(e){ this.records = [] }
    },
    tryClear() {
      if (confirm(this.t.confirmClear)) {
        this.records = []
        localStorage.removeItem(HISTORY_KEY)
      }
    }
  }
}
</script>

<style>
:root {
  --primary: #4a5fd6;
  --primary-2: #7ea0ff;
  --primary-dark: #3446a8;
  --accent: #ffcc33;
  --ok: #28c665;
  --no: #e74c5c;
  --bg-a: #f5f8ff;
  --bg-b: #e5ecff;
  --panel: #ffffff;
  --panel-2: #fbfcff;
  --text: #1a2540;
  --text-mute: #6b7794;
  --border: #e4e9f5;
  --shadow: 0 6px 24px rgba(74, 95, 214, 0.12), 0 2px 6px rgba(0,0,0,0.05);
  --shadow-lg: 0 20px 60px rgba(74, 95, 214, 0.22);
  --radius: 18px;
}
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif; color: var(--text); background: linear-gradient(135deg, var(--bg-a), var(--bg-b)); }

#app {
  position: fixed; inset: 0;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 2vmin;
}

/* Decorative background */
.bg-decor { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-decor .orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .5; }
.orb.o1 { width: 40vmin; height: 40vmin; background: #a3b8ff; top: -8%; left: -6%; }
.orb.o2 { width: 50vmin; height: 50vmin; background: #ffd7a0; bottom: -12%; right: -8%; }
.orb.o3 { width: 30vmin; height: 30vmin; background: #b5f0d5; top: 45%; left: 60%; }

.lang-btn {
  position: absolute; top: 2vmin; right: 2vmin;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(10px);
  border: 1px solid var(--border); color: var(--text);
  border-radius: 999px; padding: 0.9vmin 2vmin;
  font-size: 1.9vmin; cursor: pointer; z-index: 10;
  box-shadow: var(--shadow); display: flex; align-items: center; gap: .6vmin;
  transition: transform .15s ease, box-shadow .15s ease;
}
.lang-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
.lang-btn .globe { font-size: 2.2vmin; }

/* Buttons */
.btn {
  border: 0; cursor: pointer;
  font-size: 2.2vmin; font-weight: 600;
  padding: 1.6vmin 3.6vmin; border-radius: 999px;
  display: inline-flex; align-items: center; gap: 1vmin; justify-content: center;
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s;
  min-width: 22vmin;
}
.btn.sm { font-size: 1.9vmin; padding: 1.2vmin 2.6vmin; min-width: 12vmin; }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg, #6a82f0, #4a5fd6); color: #fff; box-shadow: 0 6px 18px rgba(74,95,214,.35); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(74,95,214,.45); }
.btn-secondary { background: #fff; color: var(--primary); border: 2px solid var(--primary); box-shadow: 0 3px 10px rgba(74,95,214,.12); }
.btn-secondary:hover:not(:disabled) { transform: translateY(-2px); background: #f0f4ff; }
.btn-ico { font-size: 2.4vmin; }

/* Full-screen sections: absolute-positioned so Vue's cross-fade transition
   stacks leaving + entering pages on top of each other instead of letting
   the parent flex row briefly show them side-by-side (which caused the
   horizontal flicker during page switches). */
.home, .tutorial, .duration, .result, .history {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
  z-index: 2;
}

/* Home */
.home {
  flex-direction: column; gap: 5vmin;
}
.brand { text-align: center; }
.brand-logo { filter: drop-shadow(0 8px 20px rgba(74,95,214,.3)); }
.brand-logo svg { width: 14vmin; height: 14vmin; }
.title {
  font-size: 8vmin; font-weight: 800; margin-top: 1vmin;
  background: linear-gradient(135deg, #4a5fd6, #7ea0ff);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  letter-spacing: 0.1vmin;
}
.subtitle { font-size: 2.4vmin; color: var(--text-mute); margin-top: 1vmin; letter-spacing: .3vmin; }
.menu { display: flex; flex-direction: column; gap: 2vmin; margin-top: 3vmin; }
.menu .btn { width: 32vmin; }

/* Card */
.card {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 4vmin;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  max-width: 92vw; max-height: 92vh; overflow: auto;
}
.card h2 { font-size: 3.4vmin; margin-bottom: 2vmin; }

/* Modal */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(20, 28, 60, .5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal { min-width: 48vmin; max-width: 70vmin; }
.modal .rules { padding-left: 3vmin; margin: 2vmin 0; }
.modal .rules li { font-size: 2vmin; line-height: 1.8; color: var(--text); margin-bottom: 1vmin; }
.modal .btn { display: block; margin: 2vmin auto 0; }
.confirm { min-width: 40vmin; text-align: center; }
.confirm-ico { font-size: 6vmin; color: #ffb020; margin-bottom: 1vmin; }
.confirm p { font-size: 2.4vmin; margin-bottom: 2vmin; }
.row { display: flex; gap: 2vmin; justify-content: center; margin-top: 2vmin; }

/* Tutorial */
.tut-card { min-width: 70vmin; max-width: 90vmin; }
.tut-head { display: flex; justify-content: space-between; align-items: center; }
.chip { background: #eef2ff; color: var(--primary); border: 0; border-radius: 999px; padding: 1vmin 2vmin; cursor: pointer; font-size: 1.8vmin; }
.chip:hover { background: #dee5ff; }
.tut-body { margin: 3vmin 0; min-height: 40vmin; }
.tut-dots { display: flex; justify-content: center; gap: 1.2vmin; margin: 2vmin 0; }
.dot { width: 1.4vmin; height: 1.4vmin; border-radius: 50%; background: #d5deee; transition: background .2s, width .2s; }
.dot.active { background: var(--primary); width: 3.5vmin; border-radius: 999px; }
.tut-nav { display: flex; justify-content: space-between; gap: 2vmin; }

/* Duration */
.dur-card { min-width: 70vmin; text-align: center; }
.dur-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3vmin; margin-top: 3vmin; }
.dur-item {
  background: linear-gradient(160deg, #fbfcff, #eef2ff);
  border: 2px solid var(--border); border-radius: var(--radius);
  padding: 4vmin 2vmin; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 1vmin;
  transition: transform .2s, border-color .2s, box-shadow .2s;
  position: relative; overflow: hidden;
}
.dur-item:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: var(--shadow-lg); }
.dur-item.selected { border-color: var(--primary); background: linear-gradient(160deg, #e8efff, #d5deff); box-shadow: 0 12px 28px rgba(74,95,214,.25); transform: translateY(-4px); }
.dur-check { position: absolute; top: 1.5vmin; left: 1.5vmin; width: 3vmin; height: 3vmin; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.8vmin; font-weight: 700; }
.dur-actions { margin-top: 3vmin; }
.dur-num { font-size: 10vmin; font-weight: 800; background: linear-gradient(135deg, #4a5fd6, #7ea0ff); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1; }
.dur-lbl { font-size: 2.4vmin; color: var(--text-mute); }
.dur-hint { position: absolute; top: 1.5vmin; right: 2vmin; font-size: 2.4vmin; opacity: .5; }

/* Game */
.game { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 2vmin; z-index: 2; }
.game-top {
  display: grid;
  grid-template-columns: auto auto auto 1fr auto auto;
  gap: 1.5vmin; align-items: center;
  background: rgba(255,255,255,.85); backdrop-filter: blur(10px);
  border-radius: 999px; padding: .8vmin 2.4vmin;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.stat { display: flex; flex-direction: row; align-items: baseline; gap: .6vmin; padding: 0 1.2vmin; border-right: 1px solid var(--border); }
.stat-lbl { font-size: 1.8vmin; color: var(--text-mute); letter-spacing: .1vmin; }
.stat-val { font-size: 2.4vmin; font-weight: 700; color: var(--primary); font-variant-numeric: tabular-nums; }
.stat-val.gold { color: #e8a11c; }
.stat-val.danger { color: var(--no); animation: pulse .8s ease-in-out infinite; }
@keyframes pulse { 50% { transform: scale(1.06); } }

.task-title { display: flex; flex-direction: row; align-items: baseline; justify-content: center; gap: .4vmin; text-align: center; }
.task-tag { font-size: 2.4vmin; color: var(--text-mute); letter-spacing: .1vmin; }
.task-title h2 { font-size: 3.2vmin; color: var(--text); font-weight: 700; line-height: 1.2; }

.back-btn {
  background: linear-gradient(135deg, #ff8080, #e74c5c);
  color: #fff; border: 0; border-radius: 999px;
  padding: 1.2vmin 2.4vmin; cursor: pointer;
  font-size: 1.8vmin; font-weight: 600;
  display: flex; align-items: center; gap: .6vmin;
  box-shadow: 0 3px 12px rgba(231,76,92,.3);
  transition: transform .15s ease;
}
.back-btn:hover { transform: translateY(-1px); }

.game-body { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 2vmin 0; gap: 4vmin; overflow: hidden; }
.drag-hint { font-size: 3vmin; color: var(--text-mute); font-weight: 500; }

.slots {
  display: flex; gap: 2vmin;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  padding: 0 2vmin;
  flex-shrink: 0;
}
.slot {
  flex: 0 1 26vmin;
  min-width: 18vmin;
  max-width: 30vmin;
  max-height: 30vh;
  aspect-ratio: 1;
  background: linear-gradient(160deg, #ffffff, #f0f4ff);
  border: 2px dashed #c5d0eb;
  border-radius: 16px;
  padding: 1.5vmin;
  position: relative;
  display: flex; flex-direction: column;
  transition: all .25s ease;
}
.slot.filled { border-style: solid; background: #fff; }
.slot.correct { border-color: var(--ok); background: linear-gradient(160deg, #e9fbee, #d0f4dc); box-shadow: 0 0 0 3px rgba(40,198,101,.25); }
.slot.wrong { border-color: var(--no); background: linear-gradient(160deg, #fde9ec, #f8d0d5); animation: shake .35s ease; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-1vmin); } 75% { transform: translateX(1vmin); } }
.slot-badge {
  position: absolute; top: -1.6vmin; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, #6a82f0, #4a5fd6);
  color: #fff; padding: .6vmin 2vmin; border-radius: 999px;
  font-size: 2vmin; font-weight: 700; letter-spacing: .1vmin;
  box-shadow: 0 3px 10px rgba(74,95,214,.35);
  white-space: nowrap;
}
.slot-inner { flex: 1; display: flex; align-items: center; justify-content: center; margin-top: 1vmin; }
.slot-empty { display: flex; flex-direction: column; align-items: center; gap: 1vmin; color: #a8b3d0; }
.slot-arrow { font-size: 4vmin; animation: bounce 1.4s ease-in-out infinite; }
@keyframes bounce { 50% { transform: translateY(.6vmin); } }
.slot-drop { font-size: 2vmin; }

.chip-img {
  background: #fff; border-radius: 12px;
  overflow: hidden; cursor: grab;
  box-shadow: 0 4px 14px rgba(0,0,0,.1);
  border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center;
  width: 100%; height: 100%;
  transition: transform .15s ease, box-shadow .15s ease;
  user-select: none;
}
.chip-img:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.15); }
.chip-img:active { cursor: grabbing; transform: scale(.98); }
.chip-img img { width: 100%; height: 100%; object-fit: contain; flex: 1; min-height: 0; padding: .8vmin; pointer-events: none; }
.chip-txt { font-size: 2.2vmin; font-weight: 600; color: var(--text); padding: 1vmin; text-align: center; background: linear-gradient(180deg, #f8faff, #eef2fb); width: 100%; border-top: 1px solid var(--border); }

.palette-wrap { flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; padding: 2vmin; min-height: 0; overflow: hidden; }
.palette {
  display: flex; gap: 2vmin; flex-wrap: wrap;
  align-items: center; justify-content: center;
  padding: 2.5vmin;
  background: rgba(255,255,255,.7); backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  max-width: 130vmin;
  max-height: 100%;
  overflow: auto;
}
.palette-item { width: 26vmin; height: 26vmin; max-width: 30vmin; max-height: 30vh; }

.feedback {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  padding: 3vmin 5vmin; border-radius: 20px;
  background: rgba(255,255,255,.95); backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
  display: flex; align-items: center; gap: 2vmin;
  z-index: 20;
  font-weight: 800; font-size: 4vmin;
}
.feedback.ok { color: var(--ok); border: 2px solid var(--ok); }
.feedback.no { color: var(--no); border: 2px solid var(--no); }
.fb-ico { font-size: 6vmin; }

.touch-ghost {
  position: fixed; transform: translate(-50%, -50%);
  width: 20vmin; height: 20vmin;
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: var(--shadow-lg);
  pointer-events: none; z-index: 200;
  opacity: .85;
}
.touch-ghost img { width: 100%; height: 100%; object-fit: contain; }

/* Result */
.res-card { min-width: 70vmin; max-width: 90vmin; text-align: center; }
.score-hero {
  padding: 3vmin;
  background: linear-gradient(135deg, #4a5fd6, #7ea0ff);
  border-radius: 16px;
  color: #fff; margin: 2vmin 0;
  box-shadow: 0 10px 30px rgba(74,95,214,.25);
}
.hero-num { font-size: 10vmin; font-weight: 800; line-height: 1; }
.hero-lbl { font-size: 2.4vmin; letter-spacing: .3vmin; opacity: .9; margin-top: 1vmin; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5vmin; margin: 2vmin 0; }
.stats-grid .cell { background: #f5f8ff; border-radius: 12px; padding: 1.6vmin 1vmin; }
.stats-grid .k { font-size: 1.6vmin; color: var(--text-mute); }
.stats-grid .v { font-size: 2.6vmin; font-weight: 700; color: var(--text); margin-top: .4vmin; font-variant-numeric: tabular-nums; }
.stats-grid .v.ok { color: var(--ok); } .stats-grid .v.no { color: var(--no); } .stats-grid .v.gold { color: #e8a11c; }
.stats-grid .v.tiny { font-size: 1.6vmin; }

/* History */
.hist-card { width: 92vmin; max-width: 92vw; }
.hist-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2vmin; }
.hist-table-wrap { max-height: 60vh; overflow: auto; border-radius: 12px; border: 1px solid var(--border); }
.hist-table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
.hist-table th, .hist-table td { padding: 1.2vmin 1vmin; text-align: center; border-bottom: 1px solid var(--border); white-space: nowrap; }
.hist-table th { background: linear-gradient(180deg, #f0f4ff, #e5ecff); color: var(--primary); font-weight: 700; position: sticky; top: 0; }
.hist-table tr:hover td { background: #f8faff; }
.hist-table .ok { color: var(--ok); font-weight: 600; }
.hist-table .no { color: var(--no); font-weight: 600; }
.hist-table .gold { color: #e8a11c; font-weight: 700; }
.empty { text-align: center; padding: 5vmin; color: var(--text-mute); font-size: 2.2vmin; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
.pop-enter-active { animation: popIn .3s cubic-bezier(.34,1.56,.64,1); }
.pop-leave-active { animation: popIn .2s reverse; }
@keyframes popIn { 0% { opacity: 0; transform: scale(.85); } 100% { opacity: 1; transform: scale(1); } }

.skip-btn {
  background: #eef2ff; color: var(--primary);
  border: 1px solid var(--border); border-radius: 999px;
  padding: 1.2vmin 2.4vmin; cursor: pointer;
  font-size: 1.8vmin; font-weight: 600;
  display: flex; align-items: center; gap: .6vmin;
  transition: transform .15s ease, background .15s ease;
}
.skip-btn:hover { transform: translateY(-1px); background: #dde5ff; }

/* Extra scaling for very narrow screens */
@media (max-aspect-ratio: 3/4) {
  .slots { max-height: 40vh; }
  .palette-item { width: 20vmin; height: 20vmin; }
}

/* ===================== Portrait (mobile / WeChat web-view) ===================== */
@media (orientation: portrait) {
  #app { padding: 3vmin; }

  .lang-btn {
    top: calc(2vmin + env(safe-area-inset-top));
    font-size: max(2.8vmin, 14px);
    padding: 1.6vmin 3vmin;
  }
  .lang-btn .globe { font-size: max(3.2vmin, 16px); }

  /* Buttons: bigger, rounder, wider */
  .btn {
    font-size: max(3.8vmin, 16px);
    padding: 2.8vmin 5vmin;
    border-radius: 999px;
    min-width: 60vw;
  }
  .btn.sm { font-size: max(3.4vmin, 15px); padding: 2vmin 4vmin; min-width: 30vw; }
  .btn-ico { font-size: max(4vmin, 18px); }

  /* Home */
  .home { gap: 6vmin; padding-top: calc(6vmin + env(safe-area-inset-top)); }
  .brand-logo svg { width: 26vmin; height: 26vmin; }
  .title { font-size: max(9vmin, 28px); }
  .subtitle { font-size: max(3.6vmin, 14px); }
  .menu { gap: 3vmin; margin-top: 4vmin; }
  .menu .btn { width: 80vw; }

  /* Card / Modal */
  .card { padding: 5vmin; max-width: 94vw; }
  .card h2 { font-size: max(5vmin, 20px); }
  .modal { min-width: 90vw; max-width: 92vw; }
  .modal .rules li { font-size: max(3.4vmin, 14px); }
  .confirm { min-width: 82vw; }
  .confirm-ico { font-size: max(9vmin, 40px); }
  .confirm p { font-size: max(3.8vmin, 15px); }

  /* Tutorial */
  .tut-card { min-width: 90vw; max-width: 94vw; }
  .tut-body { min-height: 50vh; }
  .chip { font-size: max(3vmin, 13px); padding: 1.8vmin 3vmin; }
  .tut-nav .btn { min-width: 32vw; }

  /* Duration */
  .dur-card { min-width: 90vw; }
  .dur-list { grid-template-columns: 1fr; gap: 3vmin; }
  .dur-item { padding: 5vmin 3vmin; flex-direction: row; justify-content: center; gap: 3vmin; }
  .dur-num { font-size: max(12vmin, 44px); }
  .dur-lbl { font-size: max(3.8vmin, 15px); }
  .dur-actions .btn { min-width: 38vw; }

  /* Game top HUD: stack into 2 rows to fit narrow width */
  .game { padding: 2vmin; }
  .game-top {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    row-gap: 1.5vmin;
    border-radius: 20px;
    padding: 2.5vmin 3vmin;
    padding-top: calc(2.5vmin + env(safe-area-inset-top));
  }
  .stat { padding: 0 1vmin; border-right: 0; }
  .stat-lbl { font-size: max(2.4vmin, 11px); }
  .stat-val { font-size: max(4vmin, 16px); }
  .task-title { grid-column: 1 / -1; grid-row: 2; }
  .task-tag { font-size: max(2.6vmin, 12px); letter-spacing: 0; }
  .task-title h2 { font-size: max(3.6vmin, 14px); }

  .skip-btn, .back-btn {
    grid-row: 2;
    font-size: max(3vmin, 13px);
    padding: 1.6vmin 2.6vmin;
  }
  .skip-btn { grid-column: 1; }
  .back-btn { grid-column: 3; }
  .task-title { grid-column: 2; }

  .drag-hint { font-size: max(3vmin, 13px); text-align: center; padding: 0 2vmin; }

  /* Slots: cap size, tighten gap */
  .slots { gap: 2vmin; padding: 0 1vmin; flex-wrap: wrap; }
  .slot { flex: 1 1 40vw; min-width: 36vw; max-width: 46vw; }
  .slot-badge { font-size: max(2.6vmin, 11px); padding: .6vmin 2vmin; }
  .slot-drop { font-size: max(2.6vmin, 11px); }
  .chip-txt { font-size: max(2.8vmin, 12px); }

  /* Palette: bigger touch targets, single/double column */
  .palette { padding: 3vmin; gap: 3vmin; max-width: 96vw; }
  .palette-item { width: 32vw; height: 32vw; max-width: 40vw; max-height: 40vw; }

  .feedback {
    font-size: max(5vmin, 20px);
    padding: 4vmin 6vmin;
  }
  .fb-ico { font-size: max(8vmin, 32px); }

  .touch-ghost { width: 32vw; height: 32vw; }

  /* Result */
  .res-card { min-width: 90vw; max-width: 94vw; }
  .hero-num { font-size: max(14vmin, 50px); }
  .hero-lbl { font-size: max(3.6vmin, 14px); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 2vmin; }
  .stats-grid .k { font-size: max(2.8vmin, 12px); }
  .stats-grid .v { font-size: max(4vmin, 16px); }
  .stats-grid .v.tiny { font-size: max(2.6vmin, 11px); }

  /* History: convert table into card list */
  .hist-card { width: 94vw; max-width: 94vw; }
  .hist-head { flex-direction: column; align-items: stretch; gap: 2vmin; }
  .hist-head .row { justify-content: flex-end; }
  .hist-table-wrap { max-height: 68vh; border: 0; }
  .hist-table, .hist-table thead, .hist-table tbody, .hist-table tr, .hist-table th, .hist-table td { display: block; }
  .hist-table thead { display: none; }
  .hist-table tr {
    background: #f5f8ff; border-radius: 14px;
    padding: 2.5vmin 3vmin; margin-bottom: 2vmin;
    border: 1px solid var(--border);
  }
  .hist-table td {
    padding: 1vmin 0;
    text-align: left;
    border-bottom: 1px dashed var(--border);
    font-size: max(3.2vmin, 13px);
    white-space: normal;
    display: flex; justify-content: space-between; gap: 2vmin;
  }
  .hist-table td:last-child { border-bottom: 0; }
  .hist-table td::before {
    content: attr(data-label);
    color: var(--text-mute);
    font-size: max(2.8vmin, 11px);
    text-transform: uppercase;
    letter-spacing: .1vmin;
  }
  .empty { font-size: max(3.6vmin, 14px); padding: 8vmin 3vmin; }

  /* Safe-area bottom padding on scrollable pages */
  .home, .tutorial, .duration, .result, .history {
    padding-bottom: calc(4vmin + env(safe-area-inset-bottom));
  }
  .game-body { padding-bottom: calc(2vmin + env(safe-area-inset-bottom)); }
}
</style>
