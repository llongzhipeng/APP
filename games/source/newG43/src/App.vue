<template>
  <div id="app">
    <!-- 语言切换 -->
    <button
      class="lang-btn"
      v-if="showLangBtn"
      @click="toggleLang"
    >{{ t.lang }}</button>

    <!-- 首页 -->
    <div v-if="screen==='home'" class="home">
      <h1 class="title">{{ t.title }}</h1>
      <div class="menu">
        <button class="btn primary" @click="onStart">{{ t.start }}</button>
        <button class="btn" @click="showRules=true">{{ t.rules }}</button>
        <button class="btn" @click="showHistory=true">{{ t.history }}</button>
        <button class="btn ghost">{{ t.skip }}</button>
      </div>
    </div>

    <!-- 规则弹窗 -->
    <div v-if="showRules" class="modal-mask" @click.self="showRules=false">
      <div class="modal">
        <h2>{{ t.rulesTitle }}</h2>
        <ul class="rules-list">
          <li v-for="(l,i) in t.rulesContent" :key="i">{{ l }}</li>
        </ul>
        <button class="btn" @click="showRules=false">{{ t.close }}</button>
      </div>
    </div>

    <!-- 历史记录 -->
    <div v-if="showHistory" class="modal-mask" @click.self="showHistory=false">
      <div class="modal wide">
        <h2>{{ t.historyTitle }}</h2>
        <div v-if="!history.length" class="empty">{{ t.noHistory }}</div>
        <table v-else class="hist-table">
          <thead>
            <tr>
              <th>{{ lang==='zh'?'时间':'Time' }}</th>
              <th>{{ t.difficulty }}</th>
              <th>{{ lang==='zh'?'时长':'Duration' }}</th>
              <th>{{ t.total }}</th>
              <th>{{ t.success }}</th>
              <th>{{ t.rate }}</th>
              <th>{{ t.avgTime }}</th>
              <th>{{ t.score }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h,i) in history" :key="i">
              <td>{{ h.time }}</td>
              <td>{{ h.maxLevel }}</td>
              <td>{{ h.duration }}s</td>
              <td>{{ h.total }}</td>
              <td>{{ h.success }}</td>
              <td>{{ h.rate }}%</td>
              <td>{{ h.avg }}s</td>
              <td>{{ h.score }}</td>
            </tr>
          </tbody>
        </table>
        <button class="btn" @click="showHistory=false">{{ t.close }}</button>
      </div>
    </div>

    <!-- 教程 -->
    <div v-if="screen==='tutorial'" class="modal-mask">
      <div class="modal tutorial">
        <h2>{{ t.tutorialTitle }}</h2>
        <div class="tut-body">
          <div class="tut-step">{{ t.tutorialSteps[tutStep] }}</div>
          <div class="tut-demo">
            <div v-if="tutStep===0" class="demo-fragment">
              <div class="fragment-box small" :style="demoFragmentStyle"></div>
            </div>
            <div v-else-if="tutStep===1" class="demo-butterfly">
              <div class="tut-butterfly-wrap">
                <Butterfly />
              </div>
            </div>
            <div v-else-if="tutStep===2" class="demo-choices">
              <img :src="img(1)" class="choice-img correct-demo" />
              <img :src="img(2)" class="choice-img" />
              <img :src="img(3)" class="choice-img" />
            </div>
            <div v-else class="demo-final">🎉</div>
          </div>
        </div>
        <div class="tut-actions">
          <button class="btn" v-if="tutStep>0" @click="tutStep--">{{ t.prev }}</button>
          <button class="btn ghost" @click="finishTutorial">{{ t.skipTutorial }}</button>
          <button
            class="btn primary"
            v-if="tutStep<t.tutorialSteps.length-1"
            @click="tutStep++"
          >{{ t.next }}</button>
          <button
            class="btn primary"
            v-else
            @click="finishTutorial"
          >{{ t.startGame }}</button>
        </div>
      </div>
    </div>

    <!-- 选择时长 -->
    <div v-if="screen==='duration'" class="duration">
      <h2>{{ t.selectDuration }}</h2>
      <div class="dur-list">
        <button class="btn dur" :class="{active:duration===60}" @click="duration=60">{{ t.min1 }}</button>
        <button class="btn dur" :class="{active:duration===180}" @click="duration=180">{{ t.min3 }}</button>
        <button class="btn dur" :class="{active:duration===300}" @click="duration=300">{{ t.min5 }}</button>
      </div>
      <div class="dur-actions">
        <button class="btn" @click="screen='home'">{{ t.back }}</button>
        <button class="btn primary" @click="beginGame">{{ t.startGame }}</button>
      </div>
    </div>

    <!-- 游戏页 -->
    <div v-if="screen==='game'" class="game">
      <div class="game-top">
        <div class="hud">
          <div>{{ t.difficulty }}: <b>{{ level }}</b></div>
          <div>{{ t.score }}: <b>{{ score }}</b></div>
          <div>{{ t.timeLeft }}: <b>{{ formatTime(remaining) }}</b></div>
        </div>
        <div class="q-title"><span class="q-pill">{{ phaseTitle }}</span></div>
        <button v-if="showBatchSkip" class="btn back-btn" @click="onBatchSkip">{{ t.skipBatchGame || '跳过游戏' }}</button>
        <button class="btn back-btn" @click="pauseGame">{{ t.back }}</button>
      </div>

      <div class="game-body">
        <div v-if="phase==='memorize'" class="phase memorize">
          <div class="fragment-box big" :style="fragmentStyle"></div>
          <div class="phase-sub">{{ memorizeCountdown }}{{ t.seconds }}</div>
        </div>

        <div v-else-if="phase==='distract'" class="phase distract">
          <div class="phase-sub">{{ distractCountdown }}{{ t.seconds }}</div>
          <div class="butterfly-area">
            <div
              v-for="b in butterflies"
              :key="b.id"
              class="butterfly-wrap"
              :style="{ left: b.x+'%', top: b.y+'%' }"
              @click="catchButterfly(b)"
            >
              <Butterfly :color="b.color" />
            </div>
          </div>
        </div>

        <div v-else-if="phase==='choose'" class="phase choose">
          <div class="phase-sub">{{ chooseCountdown }}{{ t.seconds }}</div>
          <div class="choices" :class="'cols-'+options.length">
            <img
              v-for="(op,i) in options"
              :key="i"
              :src="img(op)"
              class="choice-img big-choice"
              :class="{picked:pickedIdx===i, correct:showResult && op===answer, wrong:showResult && pickedIdx===i && op!==answer}"
              @click="pick(i, op)"
            />
          </div>
          <div class="feedback" v-if="feedback">{{ feedback }}</div>
        </div>
      </div>
    </div>

    <!-- 暂停 -->
    <div v-if="paused" class="modal-mask">
      <div class="modal">
        <h2>{{ t.pause }}</h2>
        <div class="pause-actions">
          <button class="btn primary" @click="resumeGame">{{ t.resume }}</button>
          <button class="btn" @click="confirmExit">{{ t.exit }}</button>
        </div>
      </div>
    </div>

    <!-- 结算 -->
    <div v-if="screen==='result'" class="modal-mask">
      <div class="modal result">
        <h2>{{ t.gameOver }}</h2>
        <div class="stat-row"><span>{{ t.yourScore }}</span><b>{{ score }}</b></div>
        <div class="stat-row"><span>{{ t.total }}</span><b>{{ stats.total }}</b></div>
        <div class="stat-row"><span>{{ t.success }}</span><b>{{ stats.success }}</b></div>
        <div class="stat-row"><span>{{ t.fail }}</span><b>{{ stats.fail }}</b></div>
        <div class="stat-row"><span>{{ t.rate }}</span><b>{{ stats.rate }}%</b></div>
        <div class="stat-row"><span>{{ t.avgTime }}</span><b>{{ stats.avg }}{{ t.seconds }}</b></div>
        <button class="btn primary" @click="goHome">{{ t.backHome }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { messages, DIFFICULTY } from './i18n.js'
import Butterfly from './Butterfly.vue'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import { resolveImage, resolveVoice } from './assets.js'

const GAME_TYPE = 'ptds'

const TOTAL_IMAGES = 15
const BUTTERFLY_COLORS = ['#ff7043', '#42a5f5', '#ab47bc', '#66bb6a', '#ffca28', '#ec407a']

export default {
  name: 'App',
  components: { Butterfly },
  data() {
    return {
      lang: 'zh',
      screen: 'home',
      showRules: false,
      showHistory: false,
      showLangBtn: true,

      tutStep: 0,
      duration: 60,

      level: 1,
      score: 0,
      remaining: 60,
      mainTimer: null,

      streakCorrect: 0,
      streakWrong: 0,

      phase: 'memorize',
      currentImage: 1,
      fragmentSrc: '',
      options: [],
      answer: 1,
      pickedIdx: -1,
      showResult: false,
      feedback: '',
      questionStart: 0,

      memorizeCountdown: 3,
      memorizeTimer: null,
      distractCountdown: 0,
      distractTimer: null,
      butterflies: [],
      butterflySpawner: null,
      chooseTimer: null,
      chooseCountdown: 15,

      paused: false,

      audio: null,

      stats: { total: 0, success: 0, fail: 0, rate: 0, avg: 0 },
      reactionTimes: [],
      maxLevel: 1,

      history: [],
      archiveId: -1,
      showBatchSkip: false,
    }
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route)
    this.showBatchSkip = shouldShowPbBatchSkip()
  },
  computed: {
    t() { return messages[this.lang] },
    diff() { return DIFFICULTY[this.level - 1] },
    fragmentStyle() {
      return {
        backgroundImage: `url(${this.fragmentSrc})`,
        backgroundPosition: 'center center',
        backgroundSize: 'contain'
      }
    },
    demoFragmentStyle() {
      return {
        backgroundImage: `url(${resolveImage('/images/1/1.png')})`,
        backgroundPosition: 'center center',
        backgroundSize: 'contain'
      }
    },
    phaseTitle() {
      if (this.phase === 'memorize') return this.t.memorize
      if (this.phase === 'distract') return this.t.distraction
      return this.t.choose
    }
  },
  mounted() {
    try {
      const h = localStorage.getItem('puzzle_history')
      if (h) this.history = JSON.parse(h)
    } catch (e) {}
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.duration = sec },
      openTutorial: () => { this.tutStep = 0; this.screen = 'tutorial' },
    })
  },
  beforeDestroy() {
    this.clearAllTimers()
  },
  methods: {
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    img(n) { return resolveImage(`/images/${n}.png`) },
    playVoice(n) {
      try {
        if (this.audio) { this.audio.pause(); this.audio.currentTime = 0 }
        const folder = this.lang === 'zh' ? 'chinese' : 'english'
        this.audio = new Audio(resolveVoice(`/voice/${folder}/${n}.mp3`))
        this.audio.play().catch(() => {})
      } catch (e) {}
    },
    stopVoice() {
      if (this.audio) { try { this.audio.pause() } catch (e) {} this.audio = null }
    },

    onStart() {
      this.tutStep = 0
      this.screen = 'tutorial'
    },
    finishTutorial() {
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.beginGame(sec))) return
      this.screen = 'duration'
    },
    onBatchSkip() {
      skipPbBatchGame()
    },
    confirmExit() {
      this.clearAllTimers()
      this.stopVoice()
      this.paused = false
      leavePbGameWindow({ confirm: false })
    },
    beginGame(duration) {
      if (duration != null) this.duration = duration
      this.showLangBtn = false
      this.screen = 'game'
      this.level = getBatchStartDifficultyForGame(GAME_TYPE)
      this.score = 0
      this.streakCorrect = 0
      this.streakWrong = 0
      this.remaining = this.duration
      this.stats = { total: 0, success: 0, fail: 0, rate: 0, avg: 0 }
      this.reactionTimes = []
      this.maxLevel = 1
      this.startMainTimer()
      this.nextQuestion()
    },
    startMainTimer() {
      this.clearMain()
      this.mainTimer = setInterval(() => {
        if (this.paused) return
        this.remaining--
        if (this.remaining <= 0) {
          this.endGame()
        }
      }, 1000)
    },
    clearMain() {
      if (this.mainTimer) { clearInterval(this.mainTimer); this.mainTimer = null }
    },
    clearQuestionTimers() {
      if (this.memorizeTimer) { clearInterval(this.memorizeTimer); this.memorizeTimer = null }
      if (this.distractTimer) { clearInterval(this.distractTimer); this.distractTimer = null }
      if (this.butterflySpawner) { clearInterval(this.butterflySpawner); this.butterflySpawner = null }
      if (this.chooseTimer) { clearInterval(this.chooseTimer); this.chooseTimer = null }
    },
    clearAllTimers() {
      this.clearMain()
      this.clearQuestionTimers()
    },
    nextQuestion() {
      this.clearQuestionTimers()
      this.showResult = false
      this.feedback = ''
      this.pickedIdx = -1

      const d = this.diff
      const answer = 1 + Math.floor(Math.random() * TOTAL_IMAGES)
      this.currentImage = answer
      this.answer = answer

      const pool = new Set([answer])
      while (pool.size < d.options) {
        pool.add(1 + Math.floor(Math.random() * TOTAL_IMAGES))
      }
      const opts = Array.from(pool)
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]]
      }
      this.options = opts

      // Pick a pre-cut fragment file from public/images/{answer}/{1..5}.png
      const k = 1 + Math.floor(Math.random() * 5)
      this.fragmentSrc = resolveImage(`/images/${answer}/${k}.png`)

      this.phase = 'memorize'
      this.memorizeCountdown = 3
      this.playVoice(1)
      this.memorizeTimer = setInterval(() => {
        if (this.paused) return
        this.memorizeCountdown--
        if (this.memorizeCountdown <= 0) {
          clearInterval(this.memorizeTimer); this.memorizeTimer = null
          this.startDistract()
        }
      }, 1000)
    },
    startDistract() {
      const d = this.diff
      if (d.distract <= 0) {
        this.startChoose()
        return
      }
      this.phase = 'distract'
      this.distractCountdown = d.distract
      this.butterflies = []
      this.spawnButterfly()
      this.butterflySpawner = setInterval(() => {
        if (this.paused) return
        this.spawnButterfly()
      }, 1500)
      this.distractTimer = setInterval(() => {
        if (this.paused) return
        this.distractCountdown--
        if (this.distractCountdown <= 0) {
          clearInterval(this.distractTimer); this.distractTimer = null
          clearInterval(this.butterflySpawner); this.butterflySpawner = null
          this.butterflies = []
          this.startChoose()
        }
      }, 1000)
    },
    spawnButterfly() {
      if (this.butterflies.length >= 4) this.butterflies.shift()
      this.butterflies.push({
        id: Date.now() + Math.random(),
        x: 5 + Math.random() * 85,
        y: 5 + Math.random() * 75,
        color: BUTTERFLY_COLORS[Math.floor(Math.random() * BUTTERFLY_COLORS.length)]
      })
    },
    catchButterfly(b) {
      this.butterflies = this.butterflies.filter(x => x.id !== b.id)
    },
    startChoose() {
      this.phase = 'choose'
      this.playVoice(2)
      this.questionStart = Date.now()
      this.chooseCountdown = 15
      this.chooseTimer = setInterval(() => {
        if (this.paused) return
        this.chooseCountdown--
        if (this.chooseCountdown <= 0) {
          clearInterval(this.chooseTimer); this.chooseTimer = null
          this.handleAnswer(-1, null, true)
        }
      }, 1000)
    },
    pick(idx, op) {
      if (this.showResult) return
      this.pickedIdx = idx
      this.handleAnswer(idx, op, false)
    },
    handleAnswer(idx, op, timeout) {
      if (this.chooseTimer) { clearInterval(this.chooseTimer); this.chooseTimer = null }
      const reaction = timeout ? 15 : (Date.now() - this.questionStart) / 1000
      this.reactionTimes.push(reaction)
      this.showResult = true
      this.stats.total++
      const correct = !timeout && op === this.answer
      if (correct) {
        const gain = 5 * this.diff.coef
        this.score += gain
        this.stats.success++
        this.streakCorrect++
        this.streakWrong = 0
        this.feedback = this.t.correct + ' +' + gain
      } else {
        this.stats.fail++
        this.streakWrong++
        this.streakCorrect = 0
        this.feedback = timeout ? this.t.timeout : this.t.wrong
      }

      if (this.streakCorrect >= 3 && this.level < 6) {
        this.level++
        this.streakCorrect = 0
      } else if (this.streakWrong >= 2 && this.level > 1) {
        this.level--
        this.streakWrong = 0
      }
      if (this.level > this.maxLevel) this.maxLevel = this.level

      setTimeout(() => {
        if (this.remaining > 0 && this.screen === 'game') {
          this.nextQuestion()
        }
      }, 1200)
    },
    pauseGame() { this.paused = true },
    resumeGame() { this.paused = false },
    endGame() {
      this.clearAllTimers()
      this.stopVoice()
      this.paused = false
      const total = this.stats.total
      const success = this.stats.success
      this.stats.rate = total ? Math.round(success / total * 100) : 0
      const avg = this.reactionTimes.length
        ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
        : 0
      this.stats.avg = avg.toFixed(2)
      const rec = {
        time: new Date().toLocaleString(),
        maxLevel: this.maxLevel,
        duration: this.duration,
        total, success,
        fail: this.stats.fail,
        rate: this.stats.rate,
        avg: this.stats.avg,
        score: this.score
      }
      this.history.unshift(rec)
      if (this.history.length > 20) this.history.pop()
      try { localStorage.setItem('puzzle_history', JSON.stringify(this.history)) } catch (e) {}
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(Number(this.stats.avg) || 0),
        score: this.score ? Math.round(this.score) : 0,
        successCount: success || 0,
        failCount: this.stats.fail || 0,
        trainDuration: this.duration,
        difficultyLevel: this.level || 1,
      })
      this.screen = 'result'
    },
    onSkipClick() {
      // Reserved for skip-current-question logic.
    },
    goHome() {
      this.screen = 'home'
      this.showLangBtn = true
    },
    formatTime(s) {
      const m = Math.floor(s / 60)
      const sec = s % 60
      return m + ':' + (sec < 10 ? '0' + sec : sec)
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%;
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  overflow: hidden;
}
body { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
#app { position: relative; width: 100vw; height: 100vh; color: #333; }

/* Language toggle */
.lang-btn {
  position: fixed; top: 2vmin; right: 2vmin;
  padding: 1.4vmin 3vmin;
  border: none; border-radius: 999px;
  background: #fff; color: #333;
  box-shadow: 0 0.4vmin 1vmin rgba(0,0,0,0.15);
  cursor: pointer; z-index: 100;
  font-size: 2.4vmin; font-weight: 600;
  min-width: 60px;
}

/* Home */
.home {
  height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4vmin;
}
.title {
  font-size: 8vmin; color: #d2691e;
  text-shadow: 0.4vmin 0.4vmin 0 #fff; margin-bottom: 2vmin;
  letter-spacing: 0.05em;
}
.menu {
  display: flex; flex-direction: column;
  gap: 2vmin; width: 40vmin; min-width: 240px;
}

/* Buttons */
.btn {
  padding: 2vmin 4vmin;
  border: none; border-radius: 1.4vmin;
  background: #fff; color: #333;
  cursor: pointer;
  font-size: 2.8vmin; font-weight: 600;
  box-shadow: 0 0.6vmin 1.6vmin rgba(0,0,0,0.15);
  transition: transform 0.1s;
  min-height: 44px;
}
.btn:hover { transform: translateY(-0.4vmin); }
.btn.primary { background: #ff7043; color: #fff; }
.btn.ghost { background: transparent; box-shadow: none; color: #666; }

/* Modal */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.modal {
  background: #fff; border-radius: 2vmin;
  padding: 3.5vmin 4vmin;
  min-width: 50vmin; max-width: 85vw;
  max-height: 88vh; overflow: auto;
  box-shadow: 0 1.6vmin 4vmin rgba(0,0,0,0.2);
}
.modal.wide { min-width: 80vmin; }
.modal h2 {
  margin-bottom: 2vmin; color: #d2691e;
  font-size: 3.6vmin;
}

.rules-list {
  padding-left: 3vmin; margin-bottom: 2vmin;
  line-height: 1.8; font-size: 2.6vmin;
}
.empty { padding: 2vmin 0; color: #999; font-size: 2.6vmin; }
.hist-table {
  border-collapse: collapse; width: 100%;
  margin-bottom: 2vmin; font-size: 2vmin;
}
.hist-table th, .hist-table td {
  border: 1px solid #eee; padding: 1vmin 1.4vmin; text-align: center;
}
.hist-table th { background: #fff3e0; }

/* Tutorial */
.tutorial .tut-body {
  min-height: 30vmin;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2vmin;
}
.tut-step { font-size: 2.6vmin; text-align: center; color: #555; max-width: 60vmin; }
.tut-demo {
  display: flex; align-items: center; justify-content: center;
  gap: 2vmin; min-height: 20vmin;
}
.demo-choices { display: flex; gap: 1.5vmin; }
.demo-choices .choice-img { width: 12vmin; height: 12vmin; min-width: 80px; min-height: 80px; }
.correct-demo { outline: 0.6vmin solid #4caf50; }
.demo-final { font-size: 10vmin; }
.tut-butterfly-wrap {
  width: 20vmin; height: 20vmin; min-width: 120px; min-height: 120px;
  display: flex; align-items: center; justify-content: center;
}
.tut-actions {
  display: flex; gap: 1.5vmin; justify-content: flex-end; margin-top: 2vmin;
  flex-wrap: wrap;
}

/* Duration */
.duration {
  height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 5vmin;
}
.duration h2 { font-size: 4vmin; color: #d2691e; }
.dur-list { display: flex; gap: 3vmin; flex-wrap: wrap; justify-content: center; }
.btn.dur {
  min-width: 16vmin; padding: 3vmin 4vmin;
  font-size: 3.2vmin;
}
.btn.dur.active { background: #ff7043; color: #fff; }
.dur-actions { display: flex; gap: 3vmin; }

/* Game */
.game {
  height: 100vh;
  display: flex; flex-direction: column;
  padding: 2vmin;
}
.game-top {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2vmin; margin-bottom: 2vmin;
}
.hud {
  display: flex; gap: 2.5vmin;
  background: rgba(255,255,255,0.8);
  padding: 1.4vmin 2.4vmin; border-radius: 1.2vmin;
  font-size: 2.6vmin; font-weight: 600;
}
.hud b { color: #d2691e; margin-left: 0.4vmin; }
.q-title { flex: 1; text-align: center; }
.q-pill {
  display: inline-block;
  padding: 1.2vmin 3vmin;
  background: linear-gradient(135deg, #ff8a65, #ff7043);
  color: #fff;
  border-radius: 999px;
  font-size: 2.8vmin;
  font-weight: 700;
  box-shadow: 0 0.6vmin 1.6vmin rgba(255,112,67,0.35);
  letter-spacing: 0.02em;
}
.back-btn { font-size: 2.4vmin; padding: 1.4vmin 3vmin; }

.game-body {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  min-height: 0;
}
.phase {
  display: flex; flex-direction: column;
  align-items: center; gap: 2vmin;
  width: 100%; height: 100%; justify-content: center;
}
.phase-sub { color: #666; font-size: 2.8vmin; font-weight: 600; }

.fragment-box {
  background-repeat: no-repeat;
  border: 0.6vmin solid #d2691e;
  border-radius: 1.2vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.15);
}
.fragment-box.big { width: 34vmin; height: 34vmin; min-width: 200px; min-height: 200px; }
.fragment-box.small { width: 18vmin; height: 18vmin; min-width: 120px; min-height: 120px; }

/* Distraction */
.butterfly-area {
  position: relative;
  width: 92%; height: 78%;
  background: rgba(255,255,255,0.35);
  border-radius: 1.6vmin;
  border: 2px dashed rgba(210,105,30,0.3);
}
.butterfly-wrap {
  position: absolute;
  width: 14vmin; height: 14vmin;
  min-width: 90px; min-height: 90px;
  cursor: pointer;
  animation: fly 2.2s ease-in-out infinite alternate;
}
@keyframes fly {
  from { transform: translate(0, 0) rotate(-6deg); }
  to   { transform: translate(1.5vmin, -2vmin) rotate(6deg); }
}

/* Choices */
.choices {
  display: grid; gap: 2.5vmin;
  width: 100%;
  max-width: 130vmin;
  justify-content: center;
}
.choices.cols-2 { grid-template-columns: repeat(2, minmax(0, 26vmin)); }
.choices.cols-3 { grid-template-columns: repeat(3, minmax(0, 22vmin)); }
.choices.cols-4 { grid-template-columns: repeat(4, minmax(0, 20vmin)); }
.choice-img {
  width: 100%; aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 1.2vmin;
  border: 0.6vmin solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
  background: #fff;
  min-width: 120px;
}
.choice-img.big-choice { min-width: 140px; }
.choice-img:hover { transform: scale(1.04); }
.choice-img.picked { border-color: #2196f3; }
.choice-img.correct { border-color: #4caf50; box-shadow: 0 0 2vmin #4caf50; }
.choice-img.wrong { border-color: #f44336; }
.feedback { font-size: 3.2vmin; font-weight: 700; color: #d2691e; }

/* Pause / Result */
.pause-actions { display: flex; gap: 2vmin; justify-content: center; }
.result .stat-row {
  display: flex; justify-content: space-between;
  padding: 1vmin 0; border-bottom: 1px dashed #eee;
  min-width: 40vmin; font-size: 2.6vmin;
}
.result .btn { margin-top: 2vmin; width: 100%; }
</style>
