<template>
  <div class="game">
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">{{ t.difficulty }}: <b>{{ level }}</b></div>
        <div class="hud-item">{{ t.score }}: <b>{{ score }}</b></div>
        <div class="hud-item">{{ t.timeLeft }}: <b>{{ formatTime(remaining) }}</b></div>
      </div>
      <div class="hud-center">
        <div class="capsule">
          <div class="capsule-row">
            <span class="dot" :class="phase"></span>
            <span class="rule-text">{{ t.rule }}</span>
          </div>
          <div class="phase-text" :class="phase">
            <template v-if="phase === 'memorize'">{{ t.memorize }} <b>{{ memorizeLeft }}s</b></template>
            <template v-else-if="phase === 'play'">{{ t.matching }} <b>{{ roundTimeLeft }}s</b></template>
          </div>
        </div>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="skip-btn" @click="onBatchSkip">{{ t.skipGame }}</button>
        <button class="back-btn" @click="openBackDialog">{{ t.back }}</button>
      </div>
    </div>

    <div class="board-wrap">
      <div
        class="board"
        :style="{
          gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
          gridTemplateRows: `repeat(${cfg.rows}, 1fr)`,
          width: boardWidth,
          height: boardHeight,
        }"
      >
        <div
          v-for="card in cards"
          :key="card.id"
          class="card"
          :class="{
            matched: card.matched,
            picked: card === firstPick,
            revealed: phase === 'play' && card.flipped && !card.matched && card !== firstPick,
            facedown: !card.flipped && !card.matched,
          }"
          @click="onCardClick(card)"
        >
          <img
            class="card-img"
            :src="(card.flipped || card.matched) ? card.src : cardBack"
            alt="card"
          />
          <div v-if="card.matched" class="match-badge">✓</div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="levelChangeMsg" class="banner">{{ levelChangeMsg }}</div>
    </transition>

    <transition name="pop">
      <div v-if="feedback" class="feedback" :class="feedback.kind">{{ feedback.text }}</div>
    </transition>

    <div v-if="confirmBack" class="modal-mask" @click.self="resumeFromDialog">
      <div class="modal">
        <p>{{ t.confirmBack }}</p>
        <div class="modal-footer">
          <button class="menu-btn" @click="resumeFromDialog">{{ t.no }}</button>
          <button class="menu-btn primary" @click="confirmLeave">{{ t.yes }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from '../assets'
import { getDifficulty, buildBoard, CARD_BACK } from '../game.js'
import { submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

export default {
  name: 'Game',
  props: { t: Object, lang: String, duration: Number, archiveId: [String, Number], startDifficulty: Number },
  data() {
    return {
      // 与 game13 一致：开局难度只走公共方法（批次用方案等级，否则默认 1）
      level: getBatchStartDifficultyForGame('jyfp'),
      score: 0,
      remaining: this.duration,
      phase: 'memorize',
      cards: [],
      cardBack: CARD_BACK,
      firstPick: null,
      locked: true,
      memorizeLeft: 0,
      roundTimeLeft: 0,
      attemptStart: 0,
      lastClickTime: 0,
      reactionTimes: [],
      windowOps: 0,
      windowSuccess: 0,
      windowStart: 0,
      totalRounds: 0,
      totalSuccess: 0,
      totalFail: 0,
      confirmBack: false,
      paused: false,
      levelChangeMsg: '',
      feedback: null,
      _feedbackTimer: null,
      _mainTimer: null,
      _phaseTimer: null,
      _ended: false,
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  created() {
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
  },
  computed: {
    cfg() { return getDifficulty(this.level) },
    boardWidth() {
      const cols = this.cfg.cols
      const w = Math.min(92, cols * 18)
      return `${w}vmin`
    },
    boardHeight() {
      const rows = this.cfg.rows
      const cols = this.cfg.cols
      const w = Math.min(92, cols * 18)
      const cardW = w / cols
      const cardH = cardW * 1.35
      return `${cardH * rows}vmin`
    },
  },
  mounted() {
    this._audio = new Audio()
    this._mainTimer = setInterval(this.tick, 100)
    this.startRound()
  },
  beforeDestroy() {
    clearInterval(this._mainTimer)
    clearTimeout(this._phaseTimer)
    clearTimeout(this._feedbackTimer)
    if (this._audio) { this._audio.pause(); this._audio.src = '' }
  },
  methods: {
    tick() {
      if (this._ended || this.paused) return
      this.remaining = Math.max(0, this.remaining - 0.1)
      // memorize countdown shown text update happens via timers below.
      // Adaptive: evaluate per 60s boundary using elapsed
      const elapsed = this.duration - this.remaining
      if (elapsed - this.windowStart >= 60) {
        this.evalAdaptive()
        this.windowStart = elapsed
      }
      if (this.remaining <= 0) {
        this.endGame()
      }
    },
    startRound() {
      if (this._ended) return
      clearTimeout(this._phaseTimer)
      this.cards = buildBoard(this.cfg.rows, this.cfg.cols).map(c => ({ ...c, flipped: true }))
      this.firstPick = null
      this.lastClickTime = 0
      this.locked = true
      this.phase = 'memorize'
      this.memorizeLeft = this.cfg.memorize
      this.playVoice(1)
      this._memorizeTick()
    },
    onBatchSkip() {
      skipPbBatchGame() // 跳过当前批次游戏
    },
    openBackDialog() {
      this.paused = true
      this.confirmBack = true
    },
    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    confirmLeave() {
      this._ended = true // 阻止后续回合/结束逻辑
      clearInterval(this._mainTimer) // 主倒计时
      clearTimeout(this._phaseTimer) // 阶段计时
      this.confirmBack = false // 关闭确认框
      leavePbGameWindow({ confirm: false })
    },
    resumeFromDialog() {
      this.confirmBack = false
      this.paused = false
    },
    _memorizeTick() {
      if (this._ended) return
      if (this.paused) {
        this._phaseTimer = setTimeout(this._memorizeTick, 200)
        return
      }
      if (this.memorizeLeft <= 0) {
        this.cards = this.cards.map(c => ({ ...c, flipped: false }))
        this.phase = 'play'
        this.roundTimeLeft = this.cfg.timeLimit
        this.locked = false
        this.playVoice(2)
        this._roundTick()
        return
      }
      this._phaseTimer = setTimeout(() => {
        this.memorizeLeft--
        this._memorizeTick()
      }, 1000)
    },
    _roundTick() {
      if (this._ended || this.phase !== 'play') return
      if (this.paused) {
        this._phaseTimer = setTimeout(this._roundTick, 200)
        return
      }
      if (this.roundTimeLeft <= 0) {
        this.endRound(false)
        return
      }
      this._phaseTimer = setTimeout(() => {
        if (this.phase === 'play') {
          this.roundTimeLeft--
          this._roundTick()
        }
      }, 1000)
    },
    onCardClick(card) {
      if (this.locked || this.paused || this.phase !== 'play') return
      // revealed or matched cards cannot be clicked again
      if (card.flipped || card.matched) return

      // first pick of this attempt
      if (!this.firstPick) {
        const now = Date.now()
        if (this.lastClickTime) this.reactionTimes.push(now - this.lastClickTime)
        this.lastClickTime = now
        card.flipped = true
        this.firstPick = card
        this.attemptStart = now
        return
      }

      // second pick → evaluate match
      const now = Date.now()
      this.reactionTimes.push(now - this.lastClickTime)
      this.lastClickTime = now
      card.flipped = true
      this.locked = true
      this.windowOps++
      const a = this.firstPick
      const b = card
      if (a.pairId === b.pairId) {
        this.windowSuccess++
        this.showFeedback('correct')
        setTimeout(() => {
          a.matched = true
          b.matched = true
          this.firstPick = null
          this.locked = false
          if (this.cards.every(c => c.matched)) this.endRound(true)
        }, 400)
      } else {
        this.showFeedback('wrong')
        setTimeout(() => {
          // both stay face-up but unmatched (burned); clear pick state
          this.firstPick = null
          this.locked = false
          // dead-end check: no face-down cards remain but not all matched
          const noneFaceDown = this.cards.every(c => c.flipped || c.matched)
          const allMatched = this.cards.every(c => c.matched)
          if (noneFaceDown && !allMatched) this.endRound(false)
        }, 700)
      }
    },
    showFeedback(kind) {
      clearTimeout(this._feedbackTimer)
      this.feedback = { kind, text: kind === 'correct' ? this.t.correct : this.t.wrong }
      this._feedbackTimer = setTimeout(() => { this.feedback = null }, 900)
    },
    playVoice(n) {
      if (!this._audio) return
      const folder = this.lang === 'en' ? 'english' : 'chinese'
      try {
        this._audio.pause()
        this._audio.src = resolveVoice(`/voice/${folder}/${n}.mp3`)
        this._audio.currentTime = 0
        const p = this._audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch (e) {}
    },
    endRound(success) {
      if (this._ended) return
      this.totalRounds++
      if (success) {
        this.totalSuccess++
        this.score += 5 * this.cfg.coef
      } else {
        this.totalFail++
      }
      this.phase = 'roundEnd'
      this.locked = true
      clearTimeout(this._phaseTimer)
      this._phaseTimer = setTimeout(() => this.startRound(), 1000)
    },
    evalAdaptive() {
      if (this.windowOps === 0) {
        this.windowSuccess = 0
        return
      }
      const rate = this.windowSuccess / this.windowOps
      const oldLevel = this.level
      if (rate > 0.9 && this.level < 6) this.level++
      else if (rate < 0.7 && this.level > 1) this.level--
      this.windowOps = 0
      this.windowSuccess = 0
      if (this.level !== oldLevel) {
        this.levelChangeMsg = this.level > oldLevel ? this.t.levelUp : this.t.levelDown
        setTimeout(() => { this.levelChangeMsg = '' }, 1500)
        // restart current round with new difficulty
        this.startRound()
      }
    },
    formatTime(s) {
      s = Math.ceil(s)
      const m = Math.floor(s / 60)
      const sec = s % 60
      return `${m}:${sec.toString().padStart(2, '0')}`
    },
    endGame() {
      if (this._ended) return
      this._ended = true
      clearInterval(this._mainTimer)
      clearTimeout(this._phaseTimer)
      const avgReact = this.reactionTimes.length
        ? Math.round(this.reactionTimes.reduce((a,b)=>a+b,0) / this.reactionTimes.length)
        : 0
      const rate = this.totalRounds
        ? Math.round(this.totalSuccess * 100 / this.totalRounds)
        : 0
      const now = new Date()
      const pad = n => n.toString().padStart(2, '0')
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      submitPbGameEndRecord(this.archiveId, 'jyfp', {
        score: Math.round(this.score) || 0,
        avgTime: toPbGameSeconds(avgReact || 0),
        successCount: this.totalSuccess,
        failCount: this.totalFail,
        trainDuration: this.duration,
        difficultyLevel: this.level,
      }).catch(() => {})
      this.$emit('end', {
        time: timeStr,
        level: this.level,
        duration: this.duration,
        total: this.totalRounds,
        success: this.totalSuccess,
        fail: this.totalFail,
        rate,
        avgReact,
        score: Math.round(this.score),
      })
    },
  },
}
</script>

<style scoped>
.game {
  position: relative; width: 100%; height: 100%;
  background: #1a1140;
  color: #fff; overflow: hidden;
  display: flex; flex-direction: column;
}
.hud {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: center;
  padding: 2vmin 3vmin; gap: 2vmin;
}
.hud-left { display: flex; gap: 2vmin; }
.hud-item {
  background: rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.25);
  padding: 1vmin 2vmin; border-radius: 1vmin; font-size: 2vmin;
}
.hud-center { display: flex; justify-content: center; flex: 1; }
.capsule {
  display: inline-flex; flex-direction: column; align-items: center; gap: .6vmin;
  padding: 1.2vmin 2.5vmin;
  background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.05));
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 2.2vmin;
  box-shadow: 0 .4vmin 1.2vmin rgba(0,0,0,.35), inset 0 .1vmin 0 rgba(255,255,255,.15);
  backdrop-filter: blur(4px);
  font-size: 2vmin; color: #fff;
  max-width: 90%;
}
.capsule-row {
  display: inline-flex; align-items: center; gap: 1vmin;
}
.capsule .dot {
  width: 1.4vmin; height: 1.4vmin; border-radius: 50%;
  background: #9aa; box-shadow: 0 0 1vmin currentColor;
  flex-shrink: 0;
}
.capsule .dot.memorize { background: #f6c04a; color: #f6c04a; animation: pulse 1.2s ease-in-out infinite; }
.capsule .dot.play     { background: #5cffb0; color: #5cffb0; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%      { transform: scale(1.3); opacity: .7; }
}
.capsule .rule-text { opacity: .9; white-space: nowrap; }
.capsule .phase-text { font-weight: bold; white-space: nowrap; font-size: 1.9vmin; }
.capsule .phase-text.memorize { color: #f6c04a; }
.capsule .phase-text.play     { color: #5cffb0; }
.capsule .phase-text b { font-variant-numeric: tabular-nums; margin-left: .3vmin; }
.hud-right { display: flex; gap: 1.2vmin; align-items: center; }
.back-btn {
  padding: 1.2vmin 2.5vmin; font-size: 2vmin; border-radius: 1vmin;
  background: rgba(200,40,40,.5); color: #fff; border: 1px solid rgba(255,255,255,.3); cursor: pointer;
}
.back-btn:hover { background: rgba(220,60,60,.7); }
.skip-btn {
  padding: 1.2vmin 2.5vmin; font-size: 2vmin; border-radius: 1vmin;
  background: rgba(120,120,140,.5); color: #fff;
  border: 1px solid rgba(255,255,255,.3); cursor: pointer;
}
.skip-btn:hover { background: rgba(150,150,170,.7); }
.board-wrap {
  position: relative; z-index: 2; flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 2vmin;
}
.board {
  display: grid; gap: 3vmin;
}
.card {
  position: relative; cursor: pointer;
  border-radius: 1vmin; overflow: hidden;
  border: .4vmin solid #f6c04a;
  background: #1a1140;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card.facedown:hover { transform: translateY(-.4vmin); }
.card.revealed {
  border-color: #6b5e9e;
  opacity: .55;
  filter: grayscale(.4);
  cursor: not-allowed;
}
.card.picked {
  border-color: #ffe9a8;
  box-shadow: 0 0 1.6vmin #ffe9a8, inset 0 0 1.2vmin rgba(255,233,168,.4);
  cursor: default;
}
.card.matched {
  border-color: #5cffb0;
  box-shadow: 0 0 1.6vmin #5cffb0, inset 0 0 1.2vmin rgba(92,255,176,.4);
  cursor: default;
}
.match-badge {
  position: absolute; top: .6vmin; right: .6vmin;
  width: 4vmin; height: 4vmin; border-radius: 50%;
  background: #5cffb0; color: #062a18;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.6vmin; font-weight: bold;
  box-shadow: 0 .3vmin .8vmin rgba(0,0,0,.5);
}

.banner {
  position: absolute; top: 12vmin; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,.7); color: #f6c04a; padding: 2vmin 4vmin;
  font-size: 3vmin; border-radius: 1vmin; z-index: 5;
  border: 1px solid #f6c04a;
}
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

.feedback {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  padding: 2vmin 5vmin; font-size: 5vmin; font-weight: bold;
  border-radius: 1.5vmin; z-index: 6; pointer-events: none;
  text-shadow: 0 .3vmin 1vmin rgba(0,0,0,.6);
}
.feedback.correct { color: #5cffb0; border: .4vmin solid #5cffb0; background: rgba(0,40,20,.5); }
.feedback.wrong   { color: #ff6b6b; border: .4vmin solid #ff6b6b; background: rgba(50,0,0,.5); }
.pop-enter-active { transition: transform .25s cubic-bezier(.2,1.4,.4,1), opacity .25s; }
.pop-leave-active { transition: transform .25s, opacity .25s; }
.pop-enter { transform: translate(-50%, -50%) scale(.4); opacity: 0; }
.pop-leave-to { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }

.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.7);
  display: flex; align-items: center; justify-content: center; z-index: 300;
}
.modal {
  background: #1f1850; border: 1px solid #5d4cae; border-radius: 2vmin;
  padding: 3vmin 4vmin; color: #fff; min-width: 40vmin; text-align: center;
}
.modal p { font-size: 2.4vmin; margin-bottom: 2vmin; }
.modal-footer { display: flex; justify-content: center; gap: 2vmin; }
.menu-btn {
  padding: 1.2vmin 3vmin; font-size: 2vmin; border-radius: 1vmin;
  border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.1);
  color: #fff; cursor: pointer;
}
.menu-btn.primary {
  background: linear-gradient(180deg, #f6c04a, #c98212); border-color: #f6c04a;
  color: #2a1a05; font-weight: bold;
}

@media (orientation: portrait) {
  .hud {
    flex-wrap: wrap;
    padding: 2vmin 3vmin;
    padding-top: calc(2vmin + env(safe-area-inset-top));
    gap: 2vmin;
  }
  .hud-left {
    order: 1; flex: 1 1 auto; flex-wrap: wrap; gap: 1.5vmin;
  }
  .hud-item {
    padding: 6px 10px;
    font-size: max(3.2vmin, 13px);
    border-radius: 8px;
  }
  .hud-right {
    order: 2; gap: 2vmin;
  }
  .back-btn, .skip-btn {
    padding: 10px 16px;
    font-size: max(3.4vmin, 14px);
    border-radius: 10px;
  }
  .hud-center {
    order: 3; flex: 1 1 100%;
  }
  .capsule {
    width: 100%; max-width: 100%;
    padding: 2vmin 3vmin;
    font-size: max(3.4vmin, 14px);
    border-radius: 14px;
  }
  .capsule .rule-text {
    white-space: normal; text-align: center;
    font-size: max(3.4vmin, 14px);
  }
  .capsule .phase-text {
    font-size: max(3.6vmin, 15px);
  }
  .capsule .dot { width: 2.4vmin; height: 2.4vmin; }
  .board-wrap {
    padding: 3vmin 2vmin;
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
  }
  .board { gap: 2vmin; }
  .match-badge {
    width: max(5vmin, 20px); height: max(5vmin, 20px);
    font-size: max(3.4vmin, 14px);
  }
  .banner {
    top: auto; bottom: 12vmin;
    font-size: max(4.5vmin, 18px);
    padding: 2.5vmin 5vmin;
    max-width: 90vw;
  }
  .feedback {
    font-size: max(8vmin, 32px);
    padding: 3vmin 6vmin;
  }
  .modal {
    width: 90vw; max-width: 90vw; min-width: 0;
    padding: 5vmin 4vmin;
  }
  .modal p { font-size: max(4vmin, 16px); margin-bottom: 3vmin; }
  .modal-footer { gap: 3vmin; }
  .menu-btn {
    padding: 14px 20px;
    font-size: max(4vmin, 16px);
    border-radius: 12px;
    min-width: 30vw;
  }
}
</style>
