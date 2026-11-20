<template>
  <div class="game-wrap">
    <!-- Header -->
    <div class="header">
      <div class="info-group">
        <span class="info-item"><span class="info-label">{{ T.difficulty }}</span><span class="info-val">{{ level }}</span></span>
        <span class="info-item"><span class="info-label">{{ T.score }}</span><span class="info-val score">{{ score }}</span></span>
        <span class="info-item"><span class="info-label">{{ T.timeLeft }}</span><span class="info-val" :class="{urgent: timeLeft<=10}">{{ fmtTime(timeLeft) }}</span></span>
      </div>
      <div class="header-actions">
        <button v-if="showBatchSkip" class="btn-skip" @click="onBatchSkip">{{ T.skipGame }}</button>
        <button class="btn-return" @click="onAskReturn">{{ T.returnGame }}</button>
      </div>
    </div>

    <!-- Question bar -->
    <div class="question-bar">
      <template v-if="phase==='memory'">
        <span class="phase-text">{{ T.rememberColor }}</span>
        <span class="color-badge" :style="{background: targetColor.hex}"></span>
        <span class="color-name">{{ targetColor[lang] }}</span>
        <span class="phase-text">{{ T.findColorSuffix }}</span>
        <span class="mem-count">{{ memCountdown }}</span>
      </template>
      <template v-else-if="phase==='recall'||phase==='feedback'">
        <span class="phase-text">{{ T.findColor }}</span>
        <span class="color-badge" :style="{background: targetColor.hex}"></span>
        <span class="color-name">{{ targetColor[lang] }}</span>
        <span class="phase-text">{{ T.findColorSuffix }}</span>
      </template>
    </div>

    <!-- Game board -->
    <div class="board-wrap" ref="boardWrap">
      <div class="board" :style="boardStyle">
        <div
          v-for="(blk, i) in blocks"
          :key="roundKey+'-'+i"
          class="block"
          :style="blockStyle(blk, i)"
          :class="blockClass(i)"
          @click="onClickBlock(i)"
        >
          <span v-if="clickedMap[i]" class="feedback-icon">
            {{ clickedMap[i] === 'correct' ? '✓' : '✗' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Confirm return dialog -->
    <div class="overlay" v-if="askReturn" @click.self="cancelReturn">
      <div class="confirm-box">
        <p>{{ T.confirmReturn }}</p>
        <div class="confirm-btns">
          <button class="btn-yes" @click="doReturn">{{ T.yes }}</button>
          <button class="btn-no" @click="cancelReturn">{{ T.no }}</button>
        </div>
      </div>
    </div>

    <!-- Result modal -->
    <ResultModal v-if="showResult" :lang="lang" :stats="finalStats" @again="restartGame" @home="$emit('back')" />
  </div>
</template>

<script>
import { resolveVoice } from '../assets'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { t } from '../i18n.js'
import { LEVELS, BLOCK_COLORS, generateRound, saveRecord } from '../gameConfig.js'
import ResultModal from '../components/ResultModal.vue'
import { submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  components: { ResultModal },
  props: ['lang', 'duration', 'archiveId'],
  data() {
    return {
      level: getBatchStartDifficultyForGame('yshy'),
      score: 0,
      timeLeft: 0,
      phase: 'memory', // memory | recall | feedback
      blocks: [],
      targetColor: { hex: '#fff', zh: '?', en: '?' },
      memCountdown: 5,
      answeredIdx: -1,
      answeredCorrect: false,
      clickedMap: {},
      targetIndices: [],
      roundKey: 0,
      // timers
      gameTimer: null,
      phaseTimer: null,
      // stats
      totalAnswered: 0,
      totalCorrect: 0,
      reactionTimes: [],
      questionStartTime: 0,
      // 60s interval stats
      intervalStart: 0,
      intervalCorrect: 0,
      intervalTotal: 0,
      askReturn: false,
      paused: false,
      pauseStartTime: 0,
      showResult: false,
      finalStats: null,
      audioMem: null,
      audioRecall: null,
      wrapW: 0,
      wrapH: 0,
      resizeObs: null,
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  created() {
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
  },
  computed: {
    T() { return t[this.lang] },
    cfg() { return LEVELS[this.level - 1] },
    gridDims() {
      const n = this.blocks.length || 1
      const cols = Math.ceil(Math.sqrt(n))
      const rows = Math.ceil(n / cols)
      return { cols, rows }
    },
    boardStyle() {
      const { cols, rows } = this.gridDims
      const MAX = 640
      const w = this.wrapW || 0
      const h = this.wrapH || 0
      // fit a cols:rows box inside w × h, capped by MAX on longest side
      let bw = w, bh = (w * rows) / cols
      if (bh > h) { bh = h; bw = (h * cols) / rows }
      const maxSide = Math.max(bw, bh)
      if (maxSide > MAX) {
        const s = MAX / maxSide
        bw *= s; bh *= s
      }
      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: bw ? `${Math.floor(bw)}px` : 'auto',
        height: bh ? `${Math.floor(bh)}px` : 'auto',
      }
    },
  },
  mounted() {
    this.initAudio(); this.startGame()
    this.$nextTick(() => this.setupBoardResize())
  },
  beforeDestroy() {
    this.clearTimers(); this.stopAudio()
    if (this.resizeObs) this.resizeObs.disconnect()
    window.removeEventListener('resize', this.measureBoard)
  },
  watch: {
    lang() { this.initAudio() },
  },
  methods: {
    setupBoardResize() {
      this.measureBoard()
      if (typeof ResizeObserver !== 'undefined' && this.$refs.boardWrap) {
        this.resizeObs = new ResizeObserver(() => this.measureBoard())
        this.resizeObs.observe(this.$refs.boardWrap)
      }
      window.addEventListener('resize', this.measureBoard)
    },
    measureBoard() {
      const el = this.$refs.boardWrap
      if (!el) return
      // subtract padding so board doesn't overflow
      const cs = getComputedStyle(el)
      const px = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const py = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      this.wrapW = Math.max(0, el.clientWidth - px)
      this.wrapH = Math.max(0, el.clientHeight - py)
    },
    initAudio() {
      this.stopAudio()
      const folder = this.lang === 'zh' ? 'chinese' : 'english'
      this.audioMem = new Audio(resolveVoice(`/voice/${folder}/1.mp3`))
      this.audioRecall = new Audio(resolveVoice(`/voice/${folder}/2.mp3`))
      this.audioMem.load()
      this.audioRecall.load()
    },
    stopAudio() {
      [this.audioMem, this.audioRecall].forEach(a => {
        if (a) { try { a.pause(); a.currentTime = 0 } catch (e) {} }
      })
    },
    playAudio(which) {
      const a = which === 'mem' ? this.audioMem : this.audioRecall
      if (!a) return
      try {
        a.pause(); a.currentTime = 0
        const p = a.play()
        if (p && p.catch) p.catch(err => console.warn('[audio]', which, err.message))
      } catch (e) { console.warn('[audio]', which, e) }
    },
    fmtTime(s) {
      const m = Math.floor(s / 60), sec = s % 60
      return `${m}:${sec.toString().padStart(2,'0')}`
    },
    startGame() {
      this.level = getBatchStartDifficultyForGame('yshy'); this.score = 0
      this.timeLeft = this.duration * 60
      this.totalAnswered = 0; this.totalCorrect = 0; this.reactionTimes = []
      this.intervalCorrect = 0; this.intervalTotal = 0
      this.intervalStart = this.timeLeft
      this.showResult = false
      this.clearTimers()
      this.gameTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft--
        // 60s difficulty adjustment (counted down)
        const elapsed = this.intervalStart - this.timeLeft
        if (elapsed >= 60) {
          this.adjustDifficulty()
          this.intervalStart = this.timeLeft
          this.intervalCorrect = 0; this.intervalTotal = 0
        }
        if (this.timeLeft <= 0) this.endGame()
      }, 1000)
      this.startRound()
    },
    clearTimers() {
      clearInterval(this.gameTimer); clearTimeout(this.phaseTimer)
    },
    startRound() {
      if (this.timeLeft <= 0) return
      const { blocks, targetColor } = generateRound(this.level)
      this.blocks = blocks; this.targetColor = targetColor
      this.targetIndices = blocks.reduce((acc, b, i) => { if (b.hex === targetColor.hex) acc.push(i); return acc }, [])
      this.clickedMap = {}
      this.roundKey++; this.answeredIdx = -1; this.answeredCorrect = false
      this.phase = 'memory'; this.memCountdown = this.cfg.memTime
      this.playAudio('mem')
      this.runMemCountdown()
    },
    runMemCountdown() {
      clearTimeout(this.phaseTimer)
      if (this.memCountdown > 0) {
        this.phaseTimer = setTimeout(() => {
          if (this.paused) { this.runMemCountdown(); return }
          this.memCountdown--; this.runMemCountdown()
        }, 1000)
      } else {
        this.phase = 'recall'
        this.questionStartTime = Date.now()
        this.playAudio('recall')
      }
    },
    blockStyle(blk, i) {
      if (this.phase === 'memory') return { background: blk.hex }
      if (this.phase === 'recall') {
        const st = this.clickedMap[i]
        if (st === 'correct') return { background: '#27ae60' }
        if (st === 'wrong') return { background: '#c0392b' }
        return { background: '#1e2f5a' }
      }
      if (this.phase === 'feedback') {
        const st = this.clickedMap[i]
        if (st === 'correct') return { background: '#27ae60' }
        if (st === 'wrong') return { background: '#c0392b' }
        // reveal remaining correct blocks that weren't clicked
        if (!this.answeredCorrect && blk.hex === this.targetColor.hex) {
          return { background: blk.hex, opacity: 0.7 }
        }
      }
      return { background: '#1e2f5a' }
    },
    blockClass(i) {
      return {
        clickable: this.phase === 'recall' && !this.clickedMap[i],
        answered: !!this.clickedMap[i],
      }
    },
    onClickBlock(i) {
      if (this.phase !== 'recall') return
      if (this.clickedMap[i]) return
      const blk = this.blocks[i]
      const correct = blk.hex === this.targetColor.hex
      this.$set
        ? this.$set(this.clickedMap, i, correct ? 'correct' : 'wrong')
        : (this.clickedMap = { ...this.clickedMap, [i]: correct ? 'correct' : 'wrong' })
      if (!correct) {
        const rt = (Date.now() - this.questionStartTime) / 1000
        this.reactionTimes.push(rt)
        this.totalAnswered++; this.intervalTotal++
        this.answeredIdx = i; this.answeredCorrect = false
        this.phase = 'feedback'
        clearTimeout(this.phaseTimer)
        this.phaseTimer = setTimeout(() => this.startRound(), 1000)
        return
      }
      const allClicked = this.targetIndices.every(idx => this.clickedMap[idx] === 'correct')
      if (allClicked) {
        const rt = (Date.now() - this.questionStartTime) / 1000
        this.reactionTimes.push(rt)
        this.totalAnswered++; this.intervalTotal++
        this.totalCorrect++; this.intervalCorrect++
        this.score += Math.round(5 * this.cfg.coeff)
        this.answeredIdx = i; this.answeredCorrect = true
        this.phase = 'feedback'
        clearTimeout(this.phaseTimer)
        this.phaseTimer = setTimeout(() => this.startRound(), 1000)
      }
    },
    adjustDifficulty() {
      if (this.intervalTotal === 0) return
      const rate = this.intervalCorrect / this.intervalTotal
      if (rate >= 0.9 && this.level < 6) this.level++
      else if (rate < 0.7 && this.level > 1) this.level--
    },
    endGame() {
      this.clearTimers()
      this.phase = 'feedback'
      const avgRt = this.reactionTimes.length
        ? (this.reactionTimes.reduce((a,b)=>a+b,0)/this.reactionTimes.length).toFixed(1)
        : 0
      submitPbGameEndRecord(this.archiveId, 'yshy', {
        score: this.score || 0,
        avgTime: toPbGameSeconds(this.reactionTimes.length ? Math.round(this.reactionTimes.reduce(function (a, b) { return a + b }, 0) / this.reactionTimes.length * 1000) : 0),
        successCount: this.totalCorrect,
        failCount: this.totalAnswered - this.totalCorrect,
        trainDuration: this.duration,
        difficultyLevel: this.level,
      }).catch(() => {})
      const rate = this.totalAnswered ? (this.totalCorrect / this.totalAnswered * 100).toFixed(1) : 0
      this.finalStats = {
        date: new Date().toLocaleString(),
        project: this.lang === 'zh' ? '颜色回忆' : 'Color Memory',
        difficulty: this.level,
        duration: this.duration,
        total: this.totalAnswered,
        success: this.totalCorrect,
        fail: this.totalAnswered - this.totalCorrect,
        successRate: rate + '%',
        avgReaction: avgRt + 's',
        score: this.score,
      }
      saveRecord(this.finalStats)
      this.showResult = true
    },
    doReturn() { this.clearTimers(); this.stopAudio(); leavePbGameWindow({ confirm: false }) },
    onBatchSkip() {
      skipPbBatchGame() // 跳过当前批次游戏
    },
    onAskReturn() {
      this.paused = true
      this.pauseStartTime = Date.now()
      this.askReturn = true
      if (this.audioMem) try { this.audioMem.pause() } catch (e) {}
      if (this.audioRecall) try { this.audioRecall.pause() } catch (e) {}
    },
    cancelReturn() {
      this.askReturn = false
      if (this.paused && this.phase === 'recall' && this.questionStartTime) {
        this.questionStartTime += Date.now() - this.pauseStartTime
      }
      this.paused = false
    },
    restartGame() { this.startGame() },
  },
}
</script>

<style scoped>
.game-wrap {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  padding: 1.5vmin;
  background: linear-gradient(145deg, #fff6f9, #f5e4ec);
  color: #3b2537;
  overflow: hidden;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1vmin 2vmin;
  background: #fffafc; border: 1px solid #e7ccd9; border-radius: 1.5vmin;
  flex-shrink: 0; flex-wrap: wrap; gap: 1.5vmin;
}
.info-group { display: flex; gap: clamp(16px, 4vmin, 40px); flex-wrap: wrap; }
.info-item { display: flex; flex-direction: column; align-items: center; gap: 0.3vmin; }
.info-label { font-size: clamp(11px, 1.6vmin, 18px); color: #6b5062; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
.info-val { font-size: clamp(18px, 2.8vmin, 30px); font-weight: 700; color: #3b2537; }
.info-val.score { color: #87501a; }
.info-val.urgent { color: #a12636; animation: blink 0.6s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.btn-return {
  background: #f9e2e7; color: #922839;
  padding: clamp(8px, 1vmin, 14px) clamp(16px, 2.5vmin, 32px);
  border-radius: 1.2vmin;
  font-size: clamp(14px, 2vmin, 22px); font-weight: 600;
  border: 1px solid rgba(231,76,60,.3); transition: all .2s;
  flex-shrink: 0;
}
.btn-return:hover { background: rgba(231,76,60,.35); }
.header-actions { display: flex; align-items: center; gap: 1.5vmin; flex-shrink: 0; }
.btn-skip {
  background: #f1e3ee; color: #54354b;
  padding: clamp(8px, 1vmin, 14px) clamp(16px, 2.5vmin, 32px);
  border-radius: 1.2vmin;
  font-size: clamp(14px, 2vmin, 22px); font-weight: 600;
  border: 1px solid rgba(255,255,255,.2); transition: all .2s;
}
.btn-skip:hover { background: #e9d5e4; }

.question-bar {
  display: flex; align-items: center; justify-content: center;
  gap: 1.5vmin; padding: 1vmin 1.5vmin;
  flex-shrink: 0; flex-wrap: wrap; min-height: 6vmin;
}
.phase-text { font-size: clamp(16px, 2.6vmin, 28px); color: #52364b; font-weight: 500; }
.color-badge { width: clamp(20px, 3.6vmin, 40px); height: clamp(20px, 3.6vmin, 40px); border-radius: 0.8vmin; border: 2px solid #704f64; flex-shrink: 0; }
.color-name { font-size: clamp(18px, 2.8vmin, 30px); font-weight: 700; color: #3b2537; }
.mem-count { font-size: clamp(20px, 3.2vmin, 34px); font-weight: 700; color: #69528a; min-width: 3vmin; text-align: center; }

.board-wrap {
  flex: 1 1 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 1vmin;
  overflow: hidden;
}
/* Tablet: shift board upward so it isn't clipped by browser bottom UI */
@media (min-width: 600px) and (max-width: 1366px) and (pointer: coarse) {
  .board-wrap {
    align-items: flex-start;
    padding-top: 1vmin;
  }
}
.board {
  display: grid; gap: 1.5vmin;
}
.block {
  border-radius: 1.5vmin; transition: background .4s;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255,255,255,.1);
}
.block.clickable { cursor: pointer; }
.block.clickable:hover { transform: scale(1.06); border-color: rgba(255,255,255,.4); }
.block.answered { transform: scale(1.08); }
.feedback-icon { font-size: 5vmin; color: #fff; font-weight: 700; }

.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.confirm-box {
  background: #16213e; border-radius: 2vmin; padding: 3vmin 4vmin;
  display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
}
.confirm-box p { font-size: 2.5vmin; color: #e0eaf8; text-align: center; }
.confirm-btns { display: flex; gap: 2vmin; }
.btn-yes {
  background: #e74c3c; color: #fff;
  padding: 1.2vmin 4vmin; border-radius: 1.2vmin; font-size: 2vmin; font-weight: 600;
}
.btn-no {
  background: rgba(255,255,255,.1); color: #c5d8f5;
  padding: 1.2vmin 4vmin; border-radius: 1.2vmin; font-size: 2vmin;
}

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .game-wrap {
    padding: 2vmin;
    padding-top: calc(2vmin + env(safe-area-inset-top));
    padding-bottom: calc(2vmin + env(safe-area-inset-bottom));
  }
  .header {
    padding: 2vmin 3vmin;
    border-radius: 3vmin;
    gap: 2vmin;
  }
  .info-group { gap: clamp(14px, 4vw, 32px); width: 100%; justify-content: space-around; }
  .info-label { font-size: max(2.6vw, 12px); }
  .info-val { font-size: max(4.4vw, 18px); }
  .header-actions { width: 100%; justify-content: space-between; gap: 2vw; }
  .btn-skip,
  .btn-return {
    flex: 1;
    padding: max(2.4vw, 12px) max(4vw, 18px);
    border-radius: 2.4vw;
    font-size: max(3.6vw, 15px);
  }
  .question-bar {
    gap: 2.4vw; padding: 2vw 3vw;
    min-height: max(10vw, 44px);
  }
  .phase-text { font-size: max(4vw, 16px); }
  .color-badge { width: max(6vw, 24px); height: max(6vw, 24px); border-radius: 1.6vw; }
  .color-name { font-size: max(4.4vw, 18px); }
  .mem-count { font-size: max(5.2vw, 22px); }
  .board-wrap { padding: 2vw; align-items: center; }
  .board { gap: 2.4vw; }
  .block { border-radius: 3vw; }
  .feedback-icon { font-size: max(8vw, 28px); }
  .confirm-box {
    width: 90vw; max-width: 90vw;
    padding: 6vw 6vw;
    border-radius: 4vw;
    gap: 4vw;
  }
  .confirm-box p { font-size: max(4.4vw, 18px); }
  .confirm-btns { width: 100%; gap: 4vw; }
  .btn-yes, .btn-no {
    flex: 1;
    padding: max(3.2vw, 14px) 0;
    border-radius: 2.4vw;
    font-size: max(4vw, 16px);
  }
}
</style>
