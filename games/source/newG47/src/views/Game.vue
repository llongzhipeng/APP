<template>
  <div class="game-view">
    <!-- 顶部 HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item level">
          <div>
            <div class="hud-label">{{ t('difficulty') }}</div>
            <div class="hud-value">Lv.{{ difficulty }} <span class="coef">×{{ curCoef }}</span></div>
          </div>
        </div>
        <div class="hud-item score">
          <div>
            <div class="hud-label">{{ t('score') }}</div>
            <div class="hud-value">{{ score }}</div>
          </div>
        </div>
        <div class="hud-item time" :class="{ danger: totalLeft < 15 }">
          <div>
            <div class="hud-label">{{ t('timeLeft') }}</div>
            <div class="hud-value">{{ formatTime(totalLeft) }}</div>
          </div>
        </div>
      </div>
      <div class="question-title">
        <transition name="qfade" mode="out-in">
          <div v-if="phase === 'view'" key="v" class="qt view">{{ t('memorize') }}</div>
          <div v-else-if="phase === 'quiz' && round" key="q" class="qt quiz">
            {{ questionText }}
          </div>
          <div v-else-if="phase === 'feedback'" key="f" class="qt" :class="lastResult">
            {{ lastResult === 'correct' ? t('correct') : (lastResult === 'timeout' ? t('timeout') : t('wrong')) }}
          </div>
          <div v-else key="g" class="qt">{{ t('getReady') }}</div>
        </transition>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="pause-btn skip-btn" @click="onBatchSkip">⏭ {{ t('skip') }}</button>
        <button class="pause-btn" @click="pause" :disabled="phase === 'countdown'">↩ {{ t('back') }}</button>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="stage">
      <div class="room-container" v-if="round && (phase === 'view' || phase === 'quiz' && showRoomFading)">
        <Room :scene="round.scene" :placements="round.placements" :fading="phase === 'quiz'" />
        <!-- 观察倒计时环 -->
        <div v-if="phase === 'view'" class="mem-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="6"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ringG)" stroke-width="6"
              :stroke-dasharray="282.6"
              :stroke-dashoffset="282.6 * (1 - phaseProgress)"
              transform="rotate(-90 50 50)" stroke-linecap="round"/>
            <defs>
              <linearGradient id="ringG"><stop offset="0" stop-color="#ffd166"/><stop offset="1" stop-color="#ef476f"/></linearGradient>
            </defs>
          </svg>
          <div class="ring-num">{{ Math.ceil(phaseTimeLeft) }}</div>
        </div>
      </div>

      <!-- 答题：位置选项（迷你地图风格） -->
      <transition name="quiz-in">
        <div v-if="phase === 'quiz' && round" class="quiz-panel">
          <div class="answer-timer" v-if="!quizLocked">
            <div class="at-track"><div class="at-bar" :style="{ width: (phaseTimeLeft / 15 * 100) + '%' }"></div></div>
            <span>{{ Math.ceil(phaseTimeLeft) }}s</span>
          </div>
          <!-- 语音播报中：不显示选项，避免误点无响应 -->
          <div v-if="quizLocked" class="listen-hint">
            <div class="lh-wave"><span></span><span></span><span></span><span></span><span></span></div>
            <div class="lh-text">{{ store.lang === 'zh' ? '请听题…' : 'Listen…' }}</div>
          </div>
          <div v-else class="pos-options">
            <button v-for="pid in round.question.options" :key="pid"
              class="pos-option" :class="{ picked: picked === pid }"
              @click="answer(pid)">
              <div class="mini-map">
                <div class="mm-cell"
                  v-for="p in positions" :key="p.id"
                  :class="{ active: p.id === pid }"
                  :style="{ left: (p.x - 8) + '%', top: (p.y - 12) + '%' }">
                  <span v-if="p.id === pid">{{ p.id }}</span>
                </div>
              </div>
              <div class="pos-name">{{ t(posKey(pid)) }}</div>
            </button>
          </div>
        </div>
      </transition>

      <!-- 3-2-1 倒计时 -->
      <transition name="pop">
        <div v-if="phase === 'countdown'" class="big-count">
          <div class="bc-num">{{ countNum }}</div>
        </div>
      </transition>

      <!-- 反馈闪光 -->
      <transition name="flash">
        <div v-if="phase === 'feedback'" class="flash-layer" :class="lastResult">
          <div class="flash-inner">
            <div class="flash-text">
              {{ lastResult === 'correct' ? '+' + lastGain : (t(lastResult === 'timeout' ? 'timeout' : 'wrong')) }}
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 暂停弹窗 -->
    <div v-if="paused" class="pause-overlay">
      <div class="pause-card">
        <h3>{{ t('exitConfirm') }}</h3>
        <div class="pause-btns">
          <button class="btn" @click="paused = false; resume()">{{ t('resume') }}</button>
          <button class="btn danger" @click="confirmExit()">{{ t('yes') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Room from '../components/Room.vue'
import { t as trans } from '../i18n.js'
import { store, DIFFICULTY, COLOR_HEX, POSITIONS, makeRound, posById } from '../store.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'jyzbtwz' // 记忆藏宝图（位置）

export default {
  name: 'Game',
  components: { Room },
  props: {
    duration: { type: Number, default: 180 }, // 训练时长（秒）
    showBatchSkip: { type: Boolean, default: false }, // 批次跳过按钮
  },
  data() {
    return {
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE), // HUD 当前难度
      score: 0,
      totalLeft: this.duration,
      round: null,
      phase: 'countdown',
      phaseTimeLeft: 3,
      phaseProgress: 0,
      countNum: '3',
      picked: null,
      lastResult: null,
      lastGain: 0,
      quizStartAt: 0,
      stats: { total: 0, correct: 0, wrong: 0, reactSum: 0, maxLevel: 1 },
      cycle: { start: 0, total: 0, correct: 0 },
      tickTimer: null,
      paused: false,
      showRoomFading: true,
      audio: null,
      quizLocked: false,
      positions: POSITIONS,
      store
    }
  },
  computed: {
    curCoef() { return DIFFICULTY[this.difficulty - 1].coef },
    questionText() {
      if (!this.round) return ''
      const q = this.round.question
      if (q.type === 'position') {
        return trans(store.lang, 'qPosition', { item: trans(store.lang, q.item) })
      }
      return ''
    }
  },
  mounted() { this.startCountdown() },
  beforeDestroy() { this.clearTimer(); this.stopAudio() },
  methods: {
    t(k) { return trans(store.lang, k) },
    posKey(id) { const p = posById(id); return p ? p.key : '' },
    formatTime(s) {
      s = Math.max(0, Math.ceil(s))
      const m = Math.floor(s / 60), r = s % 60
      return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    },
    colorHex(c) { return COLOR_HEX[c] || '#ccc' },
    clearTimer() { if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null } },

    stopAudio() {
      if (this.audio) {
        try { this.audio.pause(); this.audio.currentTime = 0 } catch (e) {}
        this.audio = null
      }
    },
    playVoice(idx) {
      return new Promise((resolve) => {
        this.stopAudio()
        const folder = store.lang === 'en' ? 'english' : 'chinese'
        const src = `voice/${folder}/${idx}.mp3`
        const a = new Audio(src)
        this.audio = a
        const done = () => { if (this.audio === a) this.audio = null; resolve() }
        a.onended = done
        a.onerror = done
        a.play().catch(done)
      })
    },

    startCountdown() {
      this.difficulty = getBatchStartDifficultyForGame(GAME_TYPE) // 开局/重开起始难度
      this.stats.maxLevel = this.difficulty
      this.phase = 'countdown'
      this.countNum = '3'
      let n = 3
      const iv = setInterval(() => {
        n--
        if (n <= 0) { clearInterval(iv); this.countNum = ''; this.startRound() }
        else this.countNum = String(n)
      }, 700)
    },

    startRound() {
      this.round = makeRound(this.difficulty)
      this.picked = null
      this.phase = 'view'
      this.phaseTimeLeft = this.round.cfg.viewTime
      this.phaseProgress = 0
      this.showRoomFading = true
      this.quizLocked = false
      this.playVoice(1)
      this.startTick()
    },

    startTick() {
      this.clearTimer()
      const step = 0.1
      const viewDur = this.round ? this.round.cfg.viewTime : 5
      this.tickTimer = setInterval(() => {
        if (this.paused) return
        this.totalLeft -= step
        if (this.totalLeft <= 0) { this.totalLeft = 0; this.endGame(); return }
        if (Math.floor((this.duration - this.totalLeft) / 60) > Math.floor((this.duration - this.totalLeft - step) / 60)) {
          this.evaluateDifficulty()
        }
        if (this.phase === 'view') {
          this.phaseTimeLeft -= step
          this.phaseProgress = 1 - this.phaseTimeLeft / viewDur
          if (this.phaseTimeLeft <= 0) this.enterQuiz()
        } else if (this.phase === 'quiz') {
          if (this.quizLocked) return
          this.phaseTimeLeft -= step
          if (this.phaseTimeLeft <= 0) this.finishAnswer(null, true)
        }
      }, step * 1000)
    },

    enterQuiz() {
      this.phase = 'quiz'
      this.phaseTimeLeft = 15
      this.quizLocked = true
      setTimeout(() => { this.showRoomFading = false }, 800)
      this.playVoice(2).then(() => {
        if (this.phase !== 'quiz') return
        this.quizLocked = false
        this.quizStartAt = performance.now()
      })
    },

    answer(o) {
      if (this.phase !== 'quiz' || this.quizLocked) return
      this.picked = o
      this.finishAnswer(o, false)
    },

    finishAnswer(o, timeout) {
      const react = performance.now() - this.quizStartAt
      this.stats.reactSum += react
      this.stats.total++
      this.cycle.total++
      const correct = !timeout && o === this.round.question.correct
      if (correct) {
        const gain = Math.round(5 * DIFFICULTY[this.difficulty - 1].coef)
        this.score += gain
        this.lastGain = gain
        this.stats.correct++
        this.cycle.correct++
        this.lastResult = 'correct'
      } else {
        this.stats.wrong++
        this.lastResult = timeout ? 'timeout' : 'wrong'
      }
      this.phase = 'feedback'
      setTimeout(() => { if (this.totalLeft > 0) this.startRound() }, 1400)
    },

    evaluateDifficulty() {
      if (this.cycle.total === 0) { this.cycle = { start: 0, total: 0, correct: 0 }; return }
      const rate = this.cycle.correct / this.cycle.total
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
      else if (rate <= 0.7 && this.difficulty > 1) this.difficulty--
      if (this.difficulty > this.stats.maxLevel) this.stats.maxLevel = this.difficulty
      this.cycle = { start: 0, total: 0, correct: 0 }
    },

    pause() {
      if (this.phase === 'countdown') return
      this.paused = true
      this.stopAudio()
    },
    resume() {},
    /**
     * <summary>
     * 批次跳过：不上传记录，进入下一款游戏
     * </summary>
     */
    onBatchSkip() { skipPbBatchGame() },
    /**
     * <summary>
     * 暂停确认退出：关窗返回，不上传
     * </summary>
     */
    confirmExit() {
      this.clearTimer()
      this.stopAudio()
      this.paused = false
      leavePbGameWindow({ confirm: false })
    },
    /**
     * <summary>
     * 倒计时结束：汇总成绩并交由 App 上传
     * </summary>
     */
    endGame() {
      this.clearTimer(); this.stopAudio()
      const result = {
        score: this.score,
        total: this.stats.total,
        correct: this.stats.correct,
        wrong: this.stats.wrong,
        avgReact: this.stats.total ? Math.round(this.stats.reactSum / this.stats.total) : 0,
        maxLevel: Math.max(this.stats.maxLevel, this.difficulty),
        difficulty: this.difficulty, // HUD 当前难度（上传用）
        duration: this.duration - Math.ceil(this.totalLeft)
      }
      this.$emit('finish', result)
    }
  }
}
</script>

<style scoped>
.game-view {
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 30%, #2b3a7a 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #4a2a6a 0%, transparent 50%),
    linear-gradient(180deg, #0f0f2a 0%, #1a1a3e 100%);
  display: flex; flex-direction: column;
  padding: 2vh 2vw;
  overflow: hidden;
}
.hud { display: grid; grid-template-columns: auto 1fr auto; gap: 2vmin; align-items: center; padding-bottom: 2vh; }
.hud-left { display: flex; gap: 1.5vmin; }
.hud-item {
  display: flex; align-items: center; gap: 1.5vmin;
  padding: 1.6vmin 2vmin;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.22);
  border-radius: 2vmin;
  color: #fff; min-width: 18vmin;
  box-shadow: 0 1vmin 2.4vmin rgba(0,0,0,0.3);
}
.hud-label { font-size: 1.6vmin; opacity: 0.75; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
.hud-value { font-size: 3vmin; font-weight: 900; letter-spacing: 0.4px; }
.hud-item.level { background: linear-gradient(135deg, rgba(255,209,102,0.3), rgba(239,71,111,0.18)); border-color: rgba(255,209,102,0.5); }
.hud-item.score { background: linear-gradient(135deg, rgba(110,231,255,0.3), rgba(52,152,219,0.18)); border-color: rgba(110,231,255,0.5); }
.hud-item.time.danger { animation: dp 0.8s ease infinite; }
@keyframes dp { 50% { background: rgba(239,71,111,0.45); border-color: #ef476f; } }
.coef { font-size: 1.8vmin; opacity: 0.75; margin-left: 0.6vmin; }

.question-title { display: flex; justify-content: center; }
.qt {
  padding: 1.6vmin 3vmin;
  background: rgba(255,255,255,0.13); backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 999px;
  color: #fff; font-size: 2.6vmin; font-weight: 700;
  text-align: center;
  box-shadow: 0 1.2vmin 3vmin rgba(0,0,0,0.35);
  min-width: 30vmin; max-width: 70vw;
}
.qt.view { background: linear-gradient(135deg, rgba(255,209,102,0.4), rgba(239,71,111,0.3)); border-color: rgba(255,209,102,0.6); }
.qt.correct { background: rgba(46, 204, 113, 0.45); border-color: #2ecc71; }
.qt.wrong, .qt.timeout { background: rgba(239, 71, 111, 0.45); border-color: #ef476f; }

.hud-right { display: flex; gap: 1.2vmin; }
.pause-btn {
  padding: 1.4vmin 2.2vmin;
  background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.28);
  color: #fff; border-radius: 1.6vmin; cursor: pointer;
  font-size: 2.2vmin; font-weight: 700;
  transition: all .2s;
}
.pause-btn:hover:not(:disabled) { background: rgba(255,255,255,0.22); transform: scale(1.03); }
.pause-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.skip-btn { background: linear-gradient(135deg, rgba(255,143,189,0.3), rgba(155,89,182,0.22)); border-color: rgba(255,143,189,0.5); }

.stage { flex: 1; position: relative; display: flex; justify-content: center; align-items: center; min-height: 0; }
.room-container { width: 100%; height: 100%; max-width: min(100%, calc(100vh * 1.6)); aspect-ratio: 16/10; position: relative; }

.mem-ring { position: absolute; top: 2vmin; right: 2vmin; width: 14vmin; height: 14vmin; z-index: 10; }
.mem-ring svg { width: 100%; height: 100%; filter: drop-shadow(0 0.6vmin 1.4vmin rgba(0,0,0,0.55)); }
.ring-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 5vmin; text-shadow: 0 0.4vmin 1vmin rgba(0,0,0,0.7); }

.quiz-panel { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2vh 4vw; gap: 3vh; }
.answer-timer { display: flex; align-items: center; gap: 2vmin; width: min(70vmin, 82%); color: #fff; font-weight: 700; font-size: 2.4vmin; }
.at-track { flex: 1; height: 1.6vmin; background: rgba(255,255,255,0.18); border-radius: 999px; overflow: hidden; }
.at-bar { height: 100%; background: linear-gradient(90deg, #6ee7ff, #ef476f); transition: width .1s linear; box-shadow: 0 0 1.6vmin #6ee7ff; }

.pos-options {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 2.2vmin;
  width: min(96vmin, 92%);
}
.pos-option {
  padding: 1.8vmin 1.6vmin;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
  border: 2.5px solid rgba(255,255,255,0.25);
  border-radius: 2vmin;
  color: #fff; font-weight: 700;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1.6vmin;
  transition: all .2s;
  box-shadow: 0 1.2vmin 2.6vmin rgba(0,0,0,0.35);
}
.pos-option:hover { transform: translateY(-4px); background: rgba(255,255,255,0.18); border-color: #ffd166; box-shadow: 0 1.8vmin 3.6vmin rgba(255,209,102,0.4); }
.pos-option.picked { border-color: #6ee7ff; background: rgba(110,231,255,0.28); transform: scale(0.97); }

.mini-map {
  position: relative;
  width: 100%; aspect-ratio: 16/10;
  border-radius: 1.2vmin;
  background: linear-gradient(180deg, #f6ecd8 0%, #ebd7b0 52%, #b48a5b 52.5%, #a87848 100%);
  border: 2px solid rgba(255,255,255,0.35);
  overflow: hidden;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.3);
}
.mm-cell {
  position: absolute;
  width: 16%; height: 24%;
  border: 1px dashed rgba(0,0,0,0.35);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 900; font-size: 2vmin;
}
.mm-cell.active {
  background: radial-gradient(circle, #ffd166 0%, #ef476f 90%);
  border: 2px solid #fff;
  box-shadow: 0 0 8px #ffd166, 0 0 16px #ef476f;
  animation: mmPulse 1s ease-in-out infinite;
}
@keyframes mmPulse {
  0%, 100% { box-shadow: 0 0 8px #ffd166, 0 0 16px #ef476f; }
  50% { box-shadow: 0 0 14px #ffd166, 0 0 26px #ef476f; }
}
.pos-name {
  font-size: 3.4vmin; font-weight: 900;
  letter-spacing: 0.4px;
  background: linear-gradient(135deg, #ffd166, #ef476f);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* 语音播报中的提示（选项显示前的过渡） */
.listen-hint {
  display: flex; flex-direction: column; align-items: center; gap: 2.4vmin;
  padding: 4vmin;
  color: #fff;
}
.lh-wave { display: flex; align-items: flex-end; gap: 1.2vmin; height: 8vmin; }
.lh-wave span {
  display: inline-block;
  width: 1.2vmin; height: 100%;
  background: linear-gradient(180deg, #6ee7ff, #ef476f);
  border-radius: 999px;
  animation: lhw 1s ease-in-out infinite;
}
.lh-wave span:nth-child(2) { animation-delay: .12s; }
.lh-wave span:nth-child(3) { animation-delay: .24s; }
.lh-wave span:nth-child(4) { animation-delay: .36s; }
.lh-wave span:nth-child(5) { animation-delay: .48s; }
@keyframes lhw { 0%, 100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }
.lh-text {
  font-size: 3.2vmin; font-weight: 800; letter-spacing: 2px;
  background: linear-gradient(135deg, #ffd166, #ef476f);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

.big-count { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 20; }
.bc-num { font-size: min(36vh, 40vmin); font-weight: 900; color: #fff; background: linear-gradient(135deg, #ffd166 0%, #ef476f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 1vmin 4vmin rgba(239,71,111,0.7)); animation: bcp 0.7s ease; }
@keyframes bcp { 0% { transform: scale(0.3); opacity: 0; } 40% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }

.flash-layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 30; }
.flash-inner { text-align: center; }
.flash-text { font-size: 8vmin; font-weight: 900; color: #fff; text-shadow: 0 0.6vmin 1.4vmin rgba(0,0,0,0.7); }
.flash-layer.correct .flash-text { color: #6efaa0; }
.flash-layer.wrong .flash-text, .flash-layer.timeout .flash-text { color: #ff8fbd; }
.flash-enter-active { animation: fin 0.4s ease; }
.flash-leave-active { animation: fout 0.4s ease; }
@keyframes fin { 0% { opacity: 0; transform: scale(0.4); } 100% { opacity: 1; transform: scale(1); } }
@keyframes fout { 100% { opacity: 0; transform: scale(1.2); } }

.pause-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.78); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; }
.pause-card { background: linear-gradient(180deg, #2d1b5e, #1a1a3e); border: 1px solid rgba(255,255,255,0.15); border-radius: 3vmin; padding: 5vmin 6vmin; text-align: center; color: #fff; box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.6); max-width: 90vw; }
.pause-card h3 { margin-bottom: 3vmin; font-size: 3.2vmin; }
.pause-btns { display: flex; gap: 2vmin; justify-content: center; }
.pause-btns .btn { padding: 1.8vmin 3vmin; border: 1.5px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.12); color: #fff; border-radius: 1.6vmin; cursor: pointer; font-size: 2.4vmin; font-weight: 700; }
.pause-btns .btn:hover { transform: translateY(-2px); }
.pause-btns .btn.danger { background: linear-gradient(135deg, #ef476f, #b23a5a); border-color: transparent; }

.qfade-enter-active, .qfade-leave-active { transition: all .3s; }
.qfade-enter, .qfade-leave-to { opacity: 0; transform: translateY(-8px); }
.quiz-in-enter-active { transition: all .5s; }
.quiz-in-enter { opacity: 0; transform: scale(0.9); }
.pop-enter-active { animation: bcp 0.5s; }
.pop-leave-active { transition: all .2s; }
.pop-leave-to { opacity: 0; transform: scale(1.3); }
</style>
