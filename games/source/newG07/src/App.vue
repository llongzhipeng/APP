<template>
  <div class="app">
    <img class="bg" :src="resolveImage('/images/bacground.png')" />

    <!-- HOME -->
    <div v-if="page === 'home'" class="page home-page">
      <button v-if="showLang" class="lang-btn" @click="toggleLang">{{ lang === 'zh' ? 'EN' : '中文' }}</button>
      <div class="home-card" :class="{ tablet: isTablet }">
        <h1 class="home-title">{{ T.title }}</h1>
        <button class="btn" @click="goTutorial">{{ T.start }}</button>
        <button class="btn" @click="rulesOpen = true">{{ T.rules }}</button>
        <button class="btn" @click="histOpen = true">{{ T.history }}</button>
      </div>
    </div>

    <!-- RULES -->
    <div v-if="rulesOpen" class="overlay" @click.self="rulesOpen = false">
      <div class="modal">
        <h2>{{ T.rules }}</h2>
        <ul class="rules-list">
          <li v-for="(r, i) in T.rulesList" :key="i">{{ r }}</li>
        </ul>
        <button class="btn" @click="rulesOpen = false">{{ T.close }}</button>
      </div>
    </div>

    <!-- HISTORY -->
    <div v-if="histOpen" class="overlay" @click.self="histOpen = false">
      <div class="modal modal-lg">
        <h2>{{ T.histTitle }}</h2>
        <p v-if="!history.length" class="empty-tip">{{ T.noRecord }}</p>
        <div v-else class="tbl-scroll">
          <table>
            <thead><tr><th v-for="c in T.histCols" :key="c">{{ c }}</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in history" :key="i">
                <td>{{ r.time }}</td><td>{{ T.gameTitle }}</td><td>{{ r.level }}</td>
                <td>{{ r.dur }}</td><td>{{ r.total }}</td><td>{{ r.success }}</td>
                <td>{{ r.fail }}</td><td>{{ r.rate }}</td><td>{{ r.avgTime }}</td><td>{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn" @click="histOpen = false">{{ T.close }}</button>
      </div>
    </div>

    <!-- TUTORIAL -->
    <div v-if="page === 'tutorial'" class="overlay">
      <div class="tut-box">
        <div class="tut-caption">{{ T.tutCaptions[tutStep] }}</div>
        <div class="tut-scene">
          <!-- Slide 0: memorize - show real sheep with pulse ring on black sheep -->
          <template v-if="tutStep === 0">
            <div v-for="s in tutSheep" :key="s.id" class="s-wrap" :style="sPos(s)">
              <img :src="s.black ? resolveImage('/images/2.png') : resolveImage('/images/1.png')" class="s-img" />
              <div v-if="s.black" class="pulse-ring"></div>
            </div>
            <div class="tut-timer">3s</div>
          </template>
          <!-- Slide 1: recall - all silhouettes, cursor points to where black sheep was -->
          <template v-if="tutStep === 1">
            <div v-for="s in tutSheep" :key="s.id" class="s-wrap" :style="sPos(s)">
              <img :src="resolveImage('/images/3.png')" class="s-img" :class="{ bounce: s.black }" />
            </div>
            <div class="tut-cursor">👆</div>
          </template>
          <!-- Slide 2: found + score popup -->
          <template v-if="tutStep === 2">
            <div class="tut-found-wrap">
              <img :src="resolveImage('/images/2.png')" class="s-img tut-found-img" />
              <div class="score-pop">+5</div>
            </div>
          </template>
        </div>
        <div class="tut-dots">
          <span v-for="i in 3" :key="i" :class="['dot', { active: tutStep === i - 1 }]"></span>
        </div>
        <div class="tut-nav">
          <button class="btn btn-tut" v-if="tutStep > 0" @click="tutStep--">{{ T.prev }}</button>
          <button class="btn btn-tut btn-skip" @click="finishTutorial">{{ T.skip }}</button>
          <button class="btn btn-tut" v-if="tutStep < 2" @click="tutStep++">{{ T.next }}</button>
          <button class="btn btn-tut" v-if="tutStep === 2" @click="finishTutorial">{{ T.done }}</button>
        </div>
      </div>
    </div>

    <!-- DURATION SELECT -->
    <div v-if="page === 'duration'" class="overlay">
      <div class="dur-box">
        <h2>{{ T.selectDur }}</h2>
        <div class="dur-btns">
          <button v-for="d in DURATIONS" :key="d.v"
                  class="btn btn-dur"
                  :class="{ selected: selectedDur === d.v }"
                  @click="selectedDur = d.v">
            {{ lang === 'zh' ? d.zh : d.en }}
          </button>
        </div>
        <button class="btn" :disabled="!selectedDur" @click="beginGame(selectedDur)">{{ T.start }}</button>
      </div>
    </div>

    <!-- GAME -->
    <div v-if="page === 'game'" class="page game-page">
      <div class="game-hd">
        <div class="hd-info">
          <span>{{ T.lv }}: {{ levelIdx + 1 }}</span>
          <span>{{ T.scoreLabel }}: {{ score }}</span>
          <span>{{ T.time }}: {{ timeLeft }}s</span>
        </div>
        <div class="hd-task">{{ phase === 'memorize' ? T.taskMemorize : T.taskRecall }}</div>
        <div class="hd-actions">
          <button v-if="showBatchSkip" class="btn btn-sm btn-skip" @click="onBatchSkip">{{ T.skipGame }}</button>
          <button class="btn btn-sm return-btn" @click="showConfirmExit">{{ T.return }}</button>
        </div>
      </div>
      <div class="game-area" :class="{ tablet: isTablet }">
        <div v-for="s in sheep" :key="s.id"
             class="s-wrap"
             :class="{ found: s.found, wrong: s.wrong, silhouette: phase === 'recall', reveal: phase === 'reveal' }"
             :style="sPos(s, true)"
             @click="clickSheep(s)">
          <img :src="sheepImg(s)" class="s-img" />
          <div v-if="s.found" class="found-mark">✓</div>
          <div v-if="s.wrong" class="wrong-mark">✗</div>
          <div v-if="phase === 'reveal' && s.black && !s.found" class="hint-ring"></div>
        </div>
        <div v-if="phase === 'reveal' && lastResult" class="feedback-toast" :class="lastResult">
          {{ lastResult === 'right' ? T.right : T.wrong }}
        </div>
      </div>
    </div>

    <!-- CONFIRM EXIT -->
    <div v-if="confirmExit" class="overlay">
      <div class="modal confirm-modal">
        <p>{{ T.confirmMsg }}</p>
        <div class="confirm-btns">
          <button class="btn btn-sm return-btn" @click="doReturn">{{ T.return }}</button>
          <button class="btn btn-sm btn-skip" @click="cancelReturn">{{ T.cancel }}</button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div v-if="page === 'result'" class="overlay">
      <div class="result-box">
        <h2>{{ T.gameOver }}</h2>
        <div class="result-grid">
          <span>{{ T.scoreLabel }}</span><strong>{{ score }}</strong>
          <span>{{ T.totalLabel }}</span><strong>{{ totalAttempts }}</strong>
          <span>{{ T.successLabel }}</span><strong>{{ successCount }}</strong>
          <span>{{ T.failLabel }}</span><strong>{{ failCount }}</strong>
          <span>{{ T.rateLabel }}</span><strong>{{ rateDisp }}</strong>
          <span>{{ T.avgLabel }}</span><strong>{{ avgDisp }}s</strong>
        </div>
        <button class="btn" @click="backHome">{{ T.backHome }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage, resolveVoice } from './assets'
const LEVELS = [
  { black: 1, white: 3, factor: 1 },
  { black: 1, white: 5, factor: 1.5 },
  { black: 2, white: 5, factor: 2 },
  { black: 2, white: 7, factor: 2.5 },
  { black: 3, white: 7, factor: 3 },
  { black: 3, white: 9, factor: 3.5 },
  { black: 4, white: 9, factor: 4 },
]

const DURATIONS = [
  { v: 60,  zh: '1 分钟', en: '1 min' },
  { v: 180, zh: '3 分钟', en: '3 min' },
  { v: 300, zh: '5 分钟', en: '5 min' },
]

const I18N = {
  zh: {
    title: '寻找黑羊', start: '开始游戏', rules: '规则介绍', history: '历史记录',
    close: '关闭', histTitle: '训练记录', noRecord: '暂无记录', gameTitle: '寻找黑羊',
    histCols: ['训练时间','训练项目','难度','时长','总次数','成功','失败','成功率','平均反应时长','得分'],
    rulesList: [
      '游戏目标：找出并点击所有黑羊',
      '难度1: 1黑3白  难度2: 1黑5白',
      '难度3: 2黑5白  难度4: 2黑7白',
      '难度5: 3黑7白  难度6: 3黑9白',
      '难度7: 4黑9白',
      '每60秒统计正确率：>90%升级，<70%降级',
      '得分：5 × 难度系数（每题）',
    ],
    prev: '上一步', next: '下一步', skip: '跳过', done: '完成',
    tutCaptions: [
      '第一步：记住黑羊的位置（3 秒）',
      '第二步：羊群消失后，点击黑羊所在的位置',
      '第三步：点对得分！',
    ],
    selectDur: '选择训练时长',
    lv: '难度', scoreLabel: '得分', time: '剩余时间',
    task: '请找出并点击所有黑羊',
    taskMemorize: '请记住黑羊的位置',
    taskRecall: '请点击黑羊的位置',
    return: '返回',
    skipGame: '跳过',
    confirmMsg: '确定要退出游戏吗？',
    cancel: '取消',
    gameOver: '游戏结束',
    totalLabel: '总次数', successLabel: '成功', failLabel: '失败',
    rateLabel: '成功率', avgLabel: '平均反应时长', backHome: '返回首页',
    right: '答对了！', wrong: '答错了',
  },
  en: {
    title: 'Find the Black Sheep', start: 'Start Game', rules: 'Rules', history: 'History',
    close: 'Close', histTitle: 'Training History', noRecord: 'No records yet', gameTitle: 'Find the Black Sheep',
    histCols: ['Time','Game','Level','Duration','Total','Success','Fail','Rate','Avg Time','Score'],
    rulesList: [
      'Goal: Find and click all black sheep',
      'Lv1: 1B+3W   Lv2: 1B+5W',
      'Lv3: 2B+5W   Lv4: 2B+7W',
      'Lv5: 3B+7W   Lv6: 3B+9W',
      'Lv7: 4B+9W',
      'Every 60s: acc>90%→up, <70%→down',
      'Score: 5 × difficulty factor per answer',
    ],
    prev: 'Prev', next: 'Next', skip: 'Skip', done: 'Done',
    tutCaptions: [
      'Step 1: Memorize the black sheep positions (3s)',
      'Step 2: After the sheep disappear, click where the black sheep were',
      'Step 3: Correct clicks earn points!',
    ],
    selectDur: 'Select Duration',
    lv: 'Level', scoreLabel: 'Score', time: 'Time',
    task: 'Find and click all black sheep',
    taskMemorize: 'Remember the black sheep positions',
    taskRecall: 'Click the black sheep positions',
    return: 'Back',
    skipGame: 'Skip',
    confirmMsg: 'Exit the game?',
    cancel: 'Cancel',
    gameOver: 'Game Over',
    totalLabel: 'Total', successLabel: 'Success', failLabel: 'Failed',
    rateLabel: 'Rate', avgLabel: 'Avg Time', backHome: 'Home',
    right: 'Correct!', wrong: 'Wrong',
  }
}

import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'App',
  data: function () {
    return {
      DURATIONS: DURATIONS,
      lang: 'zh',
      page: 'home',
      showLang: true,
      rulesOpen: false,
      histOpen: false,
      tutStep: 0,
      selectedDur: null,
      confirmExit: false,
      paused: false,
      phase: 'memorize', // 'memorize' | 'recall' | 'reveal'
      lastResult: null,  // 'right' | 'wrong' | null
      isTablet: false,
      tutSheep: [
        { id: 1, black: false, x: 8,  y: 15 },
        { id: 2, black: false, x: 58, y: 12 },
        { id: 3, black: true,  x: 33, y: 42 },
        { id: 4, black: false, x: 70, y: 48 },
      ],
      levelIdx: 0,
      score: 0,
      timeLeft: 0,
      sheep: [],
      totalAttempts: 0,
      successCount: 0,
      failCount: 0,
      responseTimes: [],
      periodCorrect: 0,
      periodTotal: 0,
      history: JSON.parse(localStorage.getItem('sheepHistory') || '[]'),
      // Non-reactive helpers held on the instance to keep them addressable.
      _gameTimer: null,
      _memorizeTimer: null,
      _revealTimer: null,
      _audioEl: null,
      _roundStart: 0,
      _periodStart: 0,
      _chosenDur: 60,
      archiveId: null, // 患者档案 ID
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  computed: {
    T: function () { return I18N[this.lang] },
    rateDisp: function () {
      return this.totalAttempts
        ? Math.round(this.successCount / this.totalAttempts * 100) + '%'
        : '0%'
    },
    avgDisp: function () {
      if (!this.responseTimes.length) return '0.0'
      var sum = 0
      for (var i = 0; i < this.responseTimes.length; i++) sum += this.responseTimes[i]
      return (sum / this.responseTimes.length).toFixed(1)
    },
  },
  created: function () {
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
  },
  mounted: function () {
    this.detectTablet()
    this._onResize = this.detectTablet.bind(this)
    window.addEventListener('resize', this._onResize)
    applyBatchTutorialEntry('xzhy', {
      setDuration: function (dur) { this.selectedDur = dur }.bind(this),
      setStartDifficulty: function (lv) { this.levelIdx = Math.max(0, lv - 1) }.bind(this),
      openTutorial: function () { this.goTutorial() }.bind(this),
    })
  },
  beforeDestroy: function () {
    if (this._gameTimer) clearInterval(this._gameTimer)
    if (this._memorizeTimer) clearTimeout(this._memorizeTimer)
    if (this._revealTimer) clearTimeout(this._revealTimer)
    if (this._onResize) window.removeEventListener('resize', this._onResize)
  },
  methods: { resolveImage,
    detectTablet: function () {
      var w = window.innerWidth
      var h = window.innerHeight
      var coarse = window.matchMedia('(pointer: coarse)').matches
      var hoverNone = window.matchMedia('(hover: none)').matches
      var ua = /Android|iPad|Tablet|Mobile/i.test(navigator.userAgent)
      this.isTablet = coarse || hoverNone || ua || w <= 1600 || (w / h) < 1.7
    },
    toggleLang: function () {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
    },
    sPos: function (s, persp) {
      var style = { left: s.x + '%', top: s.y + '%' }
      if (persp) style.zIndex = s.black ? 50 : Math.round(s.y)
      return style
    },
    sheepImg: function (s) {
      // memorize / reveal: real images; recall: silhouette for every position.
      if (this.phase === 'recall') return resolveImage('/images/3.png')
      return s.black ? resolveImage('/images/2.png') : resolveImage('/images/1.png')
    },
    goTutorial: function () {
      this.tutStep = 0
      this.page = 'tutorial'
    },
    genSheep: function (lv) {
      var items = []
      var ASPECT = 16 / 9
      function dist (a, b) {
        var dx = a.x - b.x
        var dy = (a.y - b.y) * ASPECT
        return Math.sqrt(dx * dx + dy * dy)
      }
      var MIN_WW = 22
      var MIN_BW = 30
      var yBase = this.isTablet ? 38 : 66
      var yRange = this.isTablet ? 28 : 18
      function tryPlace (isBlack) {
        for (var t = 0; t < 500; t++) {
          var x = 8 + Math.random() * 78
          var y = yBase + Math.random() * yRange
          var cand = { x: x, y: y }
          var ok = true
          for (var i = 0; i < items.length; i++) {
            var o = items[i]
            var min = (isBlack || o.black) ? MIN_BW : MIN_WW
            if (dist(cand, o) < min) { ok = false; break }
          }
          if (ok) return cand
        }
        return null
      }
      for (var i = 0; i < lv.black; i++) {
        var p = tryPlace(true) || { x: 10 + i * 25, y: yBase + (i % 2) * 8 }
        items.push({ id: items.length, black: true, x: p.x, y: p.y, found: false, wrong: false })
      }
      for (var j = 0; j < lv.white; j++) {
        var q = tryPlace(false) || { x: 5 + Math.random() * 80, y: yBase + Math.random() * yRange }
        items.push({ id: items.length, black: false, x: q.x, y: q.y, found: false, wrong: false })
      }
      return items
    },
    playVoice: function (n) {
      try {
        if (this._audioEl) { this._audioEl.pause(); this._audioEl.currentTime = 0 }
        var folder = this.lang === 'zh' ? 'chinese' : 'english'
        this._audioEl = new Audio(resolveVoice('/voice/' + folder + '/' + n + '.mp3'))
        var p = this._audioEl.play()
        if (p && p.catch) p.catch(function () {})
      } catch (e) {}
    },
    newRound: function () {
      var self = this
      if (this._memorizeTimer) { clearTimeout(this._memorizeTimer); this._memorizeTimer = null }
      if (this._revealTimer) { clearTimeout(this._revealTimer); this._revealTimer = null }
      this.lastResult = null
      this.sheep = this.genSheep(LEVELS[this.levelIdx])
      this.phase = 'memorize'
      this.playVoice(1)
      this._memorizeTimer = setTimeout(function () {
        self.phase = 'recall'
        self._roundStart = Date.now()
        self.playVoice(2)
      }, 3000)
    },
    beginGame: function (dur, startDiff) {
      var self = this
      this._chosenDur = dur
      this.selectedDur = dur
      this.levelIdx = startDiff != null ? Math.max(0, startDiff - 1) : Math.max(0, getBatchStartDifficultyForGame('xzhy') - 1)
      this.score = 0
      this.timeLeft = dur
      this.totalAttempts = 0
      this.successCount = 0
      this.failCount = 0
      this.responseTimes = []
      this.periodCorrect = 0
      this.periodTotal = 0
      this._periodStart = Date.now()
      this.showLang = false
      this.page = 'game'
      this.newRound()

      this._gameTimer = setInterval(function () {
        if (self.paused) return
        self.timeLeft--

        var elapsed = (Date.now() - self._periodStart) / 1000
        if (elapsed >= 60) {
          var rate = self.periodTotal > 0 ? self.periodCorrect / self.periodTotal : 0
          if (rate > 0.9 && self.levelIdx < LEVELS.length - 1) self.levelIdx++
          else if (rate < 0.7 && self.levelIdx > 0) self.levelIdx--
          self.periodCorrect = 0
          self.periodTotal = 0
          self._periodStart = Date.now()
        }

        if (self.timeLeft <= 0) self.endGame()
      }, 1000)
    },
    clickSheep: function (s) {
      var self = this
      if (this.phase !== 'recall') return
      if (s.found || s.wrong) return
      var idx = this.sheep.indexOf(s)
      this.totalAttempts++
      this.periodTotal++
      var rt = (Date.now() - this._roundStart) / 1000
      this.responseTimes.push(rt)

      if (s.black) {
        this.successCount++
        this.periodCorrect++
        this.score += 5 * LEVELS[this.levelIdx].factor
        var okItem = {}
        for (var k in s) okItem[k] = s[k]
        okItem.found = true
        this.sheep.splice(idx, 1, okItem)
        this.lastResult = 'right'
        // Only advance when every black sheep has been found.
        var allFound = true
        for (var i = 0; i < this.sheep.length; i++) {
          if (this.sheep[i].black && !this.sheep[i].found) { allFound = false; break }
        }
        if (!allFound) {
          // Brief flash of the "right" toast, then keep recalling.
          this._revealTimer = setTimeout(function () { self.lastResult = null }, 700)
          return
        }
      } else {
        this.failCount++
        var badItem = {}
        for (var kk in s) badItem[kk] = s[kk]
        badItem.wrong = true
        this.sheep.splice(idx, 1, badItem)
        this.lastResult = 'wrong'
      }
      // Enter reveal phase: show real sheep so user sees the answer, then auto-advance.
      this.phase = 'reveal'
      this._revealTimer = setTimeout(function () {
        if (self.timeLeft > 0) self.newRound()
      }, 1200)
    },
    endGame: function () {
      if (this._gameTimer) { clearInterval(this._gameTimer); this._gameTimer = null }
      if (this._memorizeTimer) { clearTimeout(this._memorizeTimer); this._memorizeTimer = null }
      if (this._revealTimer) { clearTimeout(this._revealTimer); this._revealTimer = null }
      if (this._audioEl) { this._audioEl.pause(); this._audioEl = null }
      var durLabel = this.lang === 'zh'
        ? (this._chosenDur === 60 ? '1分钟' : this._chosenDur === 180 ? '3分钟' : '5分钟')
        : (this._chosenDur === 60 ? '1 min' : this._chosenDur === 180 ? '3 min' : '5 min')
      var sum = 0
      for (var i = 0; i < this.responseTimes.length; i++) sum += this.responseTimes[i]
      var rec = {
        time: new Date().toLocaleString(),
        level: this.levelIdx + 1,
        dur: durLabel,
        total: this.totalAttempts,
        success: this.successCount,
        fail: this.failCount,
        rate: this.totalAttempts
          ? Math.round(this.successCount / this.totalAttempts * 100) + '%'
          : '0%',
        avgTime: this.responseTimes.length
          ? (sum / this.responseTimes.length).toFixed(1) + 's'
          : '0.0s',
        score: this.score,
      }
      this.history.unshift(rec)
      localStorage.setItem('sheepHistory', JSON.stringify(this.history.slice(0, 50)))
      var avgMs = this.responseTimes.length
        ? Math.round(sum / this.responseTimes.length * 1000)
        : 0
      submitPbGameEndRecord(this.archiveId, 'xzhy', {
        score: this.score,
        avgTime: toPbGameSeconds(avgMs),
        successCount: this.successCount,
        failCount: this.failCount,
        trainDuration: this._chosenDur,
        difficultyLevel: this.levelIdx + 1,
      }).catch(function () {})
      this.showLang = true
      this.page = 'result'
    },
    finishTutorial: function () {
      if (afterBatchTutorial('xzhy', function (dur, startDiff) {
        this.beginGame(dur, startDiff)
      }.bind(this))) return
      this.page = 'duration'
    },
    backHome: function () { this.page = 'home' },
    showConfirmExit: function () {
      this.confirmExit = true
      this.paused = true
    },
    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    doReturn: function () {
      this.confirmExit = false // 关闭确认框
      this.paused = false // 解除暂停态
      if (this._gameTimer) { clearInterval(this._gameTimer); this._gameTimer = null } // 主倒计时
      if (this._memorizeTimer) { clearTimeout(this._memorizeTimer); this._memorizeTimer = null } // 记忆阶段
      if (this._revealTimer) { clearTimeout(this._revealTimer); this._revealTimer = null } // 揭晓阶段
      if (this._audioEl) { this._audioEl.pause(); this._audioEl = null } // 停止语音
      leavePbGameWindow({ confirm: false })
    },
    cancelReturn: function () {
      this.confirmExit = false
      this.paused = false
    },
    onBatchSkip: function () {
      skipPbBatchGame() // 跳过当前批次游戏
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body { background: #0f2744; color: #e8f4fd; }

.app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
}

.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.page, .overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.overlay {
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* HOME */
.home-page { display: flex; align-items: center; justify-content: center; }

.lang-btn {
  position: absolute;
  top: 2vh;
  right: 2vw;
  padding: .4em .9em;
  background: rgba(255,255,255,.85);
  border: none;
  border-radius: .5em;
  font-size: 1.6vmin;
  cursor: pointer;
  z-index: 2;
}

.home-card {
  background: rgba(255,255,255,.88);
  border-radius: 2vmin;
  padding: 5vmin 6vmin;
  display: flex;
  flex-direction: column;
  gap: 2.5vh;
  align-items: center;
  box-shadow: 0 .5vmin 2vmin rgba(0,0,0,.3);
}
.home-card.tablet {
  gap: 3.5vh;
  padding: 6vmin 8vmin;
}

.home-title {
  font-size: 5vmin;
  color: #333;
  margin-bottom: 1vh;
  font-weight: bold;
  letter-spacing: 0.2vmin;
}

.btn {
  padding: 1.5vmin 4vmin;
  font-size: 2.2vmin;
  border: none;
  border-radius: 1vmin;
  background: #3498db;
  color: #fff;
  cursor: pointer;
  min-width: 20vmin;
  font-weight: 600;
  transition: opacity .2s, background .2s;
}
.btn:hover { opacity: .85; }
.btn-sm { padding: .8vmin 2vmin; font-size: 1.8vmin; min-width: auto; }
.btn-tut {
  padding: 1.8vmin 4.5vmin;
  font-size: 2.6vmin;
  min-width: 18vmin;
  border-radius: 1.2vmin;
  font-weight: 700;
}
.btn-skip { background: #888; }
.btn-skip:hover { background: #555; }
.btn-dur { font-size: 2.5vmin; padding: 1.2em 2.5em; }
.btn-dur.selected { background: #1a5fa8; outline: .3vmin solid #ff9800; }
.btn:disabled { background: #aaa; cursor: not-allowed; }

/* MODAL */
.modal {
  background: #fff;
  border-radius: 1.5vmin;
  padding: 3vmin 4vmin;
  max-width: 70vw;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2vmin;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,.3);
}
.modal h2 { font-size: 2.5vmin; color: #333; text-align: center; }
.modal-lg { max-width: 90vw; }
.rules-list { padding-left: 2em; }
.rules-list li { font-size: 1.8vmin; line-height: 2; color: #444; }
.empty-tip { text-align: center; color: #888; font-size: 1.8vmin; }
.tbl-scroll { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 1.4vmin; }
th, td { border: 1px solid #ddd; padding: .5em .8em; white-space: nowrap; }
th { background: #f0f4ff; }

/* TUTORIAL */
.tut-box {
  background: rgba(255,255,255,.95);
  border-radius: 2vmin;
  width: 70vw;
  height: 65vh;
  display: flex;
  flex-direction: column;
  padding: 2vmin;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,.35);
}

.tut-scene {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 1vmin;
  background: rgba(180,220,180,.25);
}

.tut-caption {
  text-align: center;
  font-size: 2.2vmin;
  font-weight: bold;
  color: #1565c0;
  padding: .8vmin 0 1vmin;
}

.tut-timer {
  position: absolute;
  top: 1vmin;
  right: 1.5vmin;
  background: #ff5722;
  color: #fff;
  font-weight: bold;
  font-size: 2vmin;
  padding: .3em .8em;
  border-radius: 1vmin;
}

.tut-dots {
  display: flex;
  justify-content: center;
  gap: 1vmin;
  padding: 1vmin 0 .5vmin;
}
.dot {
  width: 1.2vmin;
  height: 1.2vmin;
  border-radius: 50%;
  background: #ccc;
}
.dot.active { background: #4a90d9; }

.tut-nav {
  display: flex;
  justify-content: center;
  gap: 3vmin;
  padding-top: 1.2vmin;
}

/* sheep wrapper */
.s-wrap {
  position: absolute;
  width: 20vmin;
  height: 20vmin;
  cursor: pointer;
  transition: transform .15s;
}
.s-wrap:hover { transform: scale(1.1); }
.s-wrap.found { opacity: .5; pointer-events: none; }
.s-wrap.wrong { animation: shake .5s; }

.s-wrap.silhouette .s-img { filter: none; }
.s-wrap.silhouette { animation: fadeIn .4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.s-img { width: 100%; height: 100%; object-fit: contain; }

.found-mark {
  position: absolute;
  top: -1vmin;
  right: -1vmin;
  background: #4caf50;
  color: #fff;
  border-radius: 50%;
  width: 2.5vmin;
  height: 2.5vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4vmin;
}

.wrong-mark {
  position: absolute;
  top: -1vmin;
  right: -1vmin;
  background: #e53935;
  color: #fff;
  border-radius: 50%;
  width: 2.5vmin;
  height: 2.5vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6vmin;
  font-weight: bold;
}

.hint-ring {
  position: absolute;
  inset: -1vmin;
  border: .5vmin solid #ffeb3b;
  border-radius: 50%;
  box-shadow: 0 0 2vmin rgba(255,235,59,.8);
  animation: pulse 1s infinite;
  pointer-events: none;
}

.feedback-toast {
  position: absolute;
  top: 4vmin;
  left: 50%;
  transform: translateX(-50%);
  padding: 1.2vmin 3vmin;
  font-size: 3vmin;
  font-weight: bold;
  border-radius: 1vmin;
  color: #fff;
  z-index: 100;
  animation: toastPop .3s ease;
  pointer-events: none;
}
.feedback-toast.right { background: #4caf50; }
.feedback-toast.wrong { background: #e53935; }
@keyframes toastPop {
  0% { transform: translate(-50%, -1vmin) scale(.7); opacity: 0; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

.s-wrap.reveal { pointer-events: none; }

/* Tutorial animations */
.pulse-ring {
  position: absolute;
  inset: -1vmin;
  border: .4vmin solid #ff5722;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%   { transform: scale(.9); opacity: 1; }
  50%  { transform: scale(1.2); opacity: .6; }
  100% { transform: scale(.9); opacity: 1; }
}

.bounce { animation: bounce 1s infinite; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10%); }
}

.tut-cursor {
  position: absolute;
  font-size: 4vmin;
  animation: moveCursor 2s infinite;
  pointer-events: none;
}
@keyframes moveCursor {
  0%   { left: 60%; top: 70%; }
  50%  { left: 38%; top: 50%; }
  70%  { left: 36%; top: 48%; transform: scale(.85); }
  100% { left: 60%; top: 70%; }
}

.tut-found-wrap {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -60%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tut-found-img { width: 12vmin; height: 12vmin; animation: pop .6s ease; }
.score-pop {
  font-size: 4vmin;
  font-weight: bold;
  color: #ff9800;
  animation: scoreFloat 1.5s infinite;
}
@keyframes pop {
  0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); }
}
@keyframes scoreFloat {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50%       { transform: translateY(-2vmin); opacity: .8; }
}

/* DURATION */
.dur-box {
  background: rgba(255,255,255,.92);
  border-radius: 2vmin;
  padding: 4vmin 6vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,.3);
}
.dur-box h2 { font-size: 3vmin; color: #333; }
.dur-btns { display: flex; gap: 3vmin; }

/* GAME */
.game-page { display: flex; flex-direction: column; }

.game-hd {
  flex: 0 0 9vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2vw;
  background: rgba(0,0,0,.45);
}

.hd-info {
  display: flex;
  gap: 2.5vmin;
  color: #fff;
  font-size: 2vmin;
  font-weight: bold;
}

.hd-task {
  color: #ffe082;
  font-size: 2.2vmin;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.return-btn { background: #e53935; }
.return-btn:hover { background: #b71c1c; }

.game-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* RESULT */
.result-box {
  background: rgba(255,255,255,.95);
  border-radius: 2vmin;
  padding: 4vmin 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vmin;
  min-width: 40vmin;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,.35);
}
.result-box h2 { font-size: 3vmin; color: #333; }
.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2vmin 3vmin;
  font-size: 2vmin;
  color: #444;
  width: 100%;
}
.result-grid strong { color: #1565c0; font-size: 2.2vmin; }

.confirm-modal { text-align: center; min-width: 30vmin; }
.confirm-modal p { font-size: 2.2vmin; margin-bottom: 2vmin; }
.confirm-btns { display: flex; justify-content: center; gap: 2vmin; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-1vmin); }
  75%       { transform: translateX(1vmin); }
}

.hd-actions { display: flex; gap: 1.2vmin; align-items: center; }

/* ---------- Portrait (phone / mini-program web-view) ---------- */
@media (orientation: portrait) {
  .lang-btn {
    font-size: max(2.6vmin, 14px);
    padding: .6em 1em;
    border-radius: 1vmin;
    top: calc(1.5vh + env(safe-area-inset-top));
  }

  .home-card {
    width: 84vw;
    padding: 8vmin 6vmin;
    gap: 2.5vh;
    border-radius: 3vmin;
  }
  .home-title {
    font-size: max(7vmin, 22px);
    letter-spacing: .3vmin;
  }

  .btn {
    width: 80%;
    min-width: 0;
    padding: max(2.4vmin, 12px) max(4vmin, 16px);
    font-size: max(4vmin, 16px);
    border-radius: 2vmin;
  }
  .btn-sm {
    width: auto;
    padding: max(1.6vmin, 8px) max(2.8vmin, 12px);
    font-size: max(3.2vmin, 14px);
    border-radius: 1.6vmin;
  }
  .btn-dur {
    width: 80%;
    font-size: max(4.2vmin, 17px);
    padding: 1em 1.5em;
  }

  /* Modal */
  .modal {
    max-width: 92vw;
    width: 92vw;
    max-height: 82vh;
    padding: max(4vmin, 16px);
    border-radius: 3vmin;
    gap: 3vmin;
  }
  .modal h2 { font-size: max(4.8vmin, 20px); }
  .modal-lg { max-width: 94vw; width: 94vw; }
  .rules-list { padding-left: 1.5em; }
  .rules-list li { font-size: max(3.4vmin, 15px); line-height: 1.7; }
  .empty-tip { font-size: max(3.4vmin, 15px); }

  /* History table -> card list */
  .tbl-scroll { overflow: visible; }
  table, thead, tbody, tr, td, th { display: block; }
  thead { display: none; }
  table { font-size: max(3.2vmin, 14px); border: none; }
  tbody tr {
    border: 1px solid #ddd;
    border-radius: 1.5vmin;
    padding: 2vmin 2.5vmin;
    margin-bottom: 2vmin;
    background: #fafcff;
  }
  tbody td {
    border: none;
    padding: .4em 0;
    white-space: normal;
    display: flex;
    justify-content: space-between;
    gap: 1em;
  }
  tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #555;
  }

  /* Tutorial */
  .tut-box {
    width: 92vw;
    height: 78vh;
    padding: 3vmin;
    border-radius: 3vmin;
  }
  .tut-caption { font-size: max(4vmin, 16px); }
  .tut-timer { font-size: max(3.8vmin, 15px); }
  .tut-nav { gap: 3vmin; flex-wrap: wrap; }
  .dot { width: 2vmin; height: 2vmin; }

  /* Duration select */
  .dur-box {
    width: 86vw;
    padding: 6vmin 5vmin;
    border-radius: 3vmin;
    gap: 3.5vmin;
  }
  .dur-box h2 { font-size: max(5vmin, 20px); }
  .dur-btns { flex-direction: column; gap: 2.5vmin; width: 100%; align-items: center; }

  /* Game HUD */
  .game-hd {
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: max(1.5vmin, 8px) 3vw;
    padding-top: calc(max(1.5vmin, 8px) + env(safe-area-inset-top));
    gap: 1.5vmin;
  }
  .hd-info {
    gap: 3vmin;
    font-size: max(3.2vmin, 13px);
    flex-wrap: wrap;
  }
  .hd-task {
    font-size: max(3.6vmin, 14px);
    flex-basis: 100%;
    order: 3;
  }
  .hd-actions {
    order: 2;
    gap: 1.5vmin;
  }

  /* Sheep sizing in portrait */
  .s-wrap { width: 22vmin; height: 22vmin; }
  .found-mark, .wrong-mark {
    width: max(4vmin, 18px);
    height: max(4vmin, 18px);
    font-size: max(2.4vmin, 11px);
  }
  .feedback-toast {
    font-size: max(4.5vmin, 18px);
    padding: 2vmin 4vmin;
    top: 3vmin;
  }

  /* Result */
  .result-box {
    width: 90vw;
    padding: 6vmin 5vmin;
    padding-bottom: calc(6vmin + env(safe-area-inset-bottom));
    border-radius: 3vmin;
    min-width: 0;
  }
  .result-box h2 { font-size: max(5.5vmin, 22px); }
  .result-grid {
    grid-template-columns: 1fr;
    gap: 1.6vmin 2vmin;
    font-size: max(3.8vmin, 15px);
    row-gap: 1.2vmin;
  }
  .result-grid > span { color: #666; }
  .result-grid strong { font-size: max(4vmin, 16px); text-align: right; }

  /* Confirm modal */
  .confirm-modal { min-width: 0; width: 84vw; }
  .confirm-modal p { font-size: max(4vmin, 16px); }
  .confirm-btns { gap: 3vmin; flex-wrap: wrap; }
}
</style>
