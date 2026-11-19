<template>
  <div class="game-page">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="stat">
          <div class="label">{{ t('difficulty') }}</div>
          <div class="value">{{ level }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('score') }}</div>
          <div class="value">{{ score }}</div>
        </div>
        <div class="stat">
          <div class="label">{{ t('timeLeft') }}</div>
          <div class="value" :class="{ warn: timeLeft <= 10 }">{{ formatTime(timeLeft) }}</div>
        </div>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t('skipGame') }}</button>
        <button class="exit-btn" @click="onExit">{{ t('back') }}</button>
      </div>
    </div>

    <!-- Question -->
    <div v-if="q" class="stage">
      <div class="rule">{{ rulePrompt }}</div>

      <div class="question-timer">
        <div class="qt-bar" :style="{ width: qtPct + '%' }"></div>
      </div>

      <div class="idiom-container">
        <div
          v-for="(ch, i) in idiomChars"
          :key="i"
          class="idiom-tile"
          :class="{
            selectable: canPickIdiomChar,
            picked: pickedIdiomIdx === i,
            correctPick: revealAnswer && i === q.idx && pickedIdiomIdx === i,
            wrongPick: revealAnswer && pickedIdiomIdx === i && i !== q.idx,
            showAnswer: revealAnswer && i === q.idx && pickedIdiomIdx !== i
          }"
          @click="onIdiomClick(i)"
        >{{ ch }}</div>
      </div>

      <!-- Stage 1: pick wrong char via choices (levels 1-3) -->
      <div v-if="stage === 'pickWrong' && currentLevel.mode === 'pickWrong'" class="hint">{{ t('hintPickWrong') }}</div>
      <div v-if="stage === 'pickWrong' && currentLevel.mode === 'pickWrong'" class="choices">
        <button
          v-for="(c, i) in q.choices"
          :key="i"
          class="choice"
          :class="{
            correctCh: revealAnswer && c === q.wrongChar,
            wrongCh: revealAnswer && pickedChoice === c && c !== q.wrongChar
          }"
          :disabled="revealAnswer"
          @click="onPickWrong(c)"
        >{{ c }}</button>
      </div>

      <!-- Stage 1 for pickCorrect / inputCorrect: click wrong char in idiom -->
      <div v-if="stage === 'pickWrongInIdiom'" class="hint">{{ t('hintPickWrong') }}</div>

      <!-- Stage 2: pick correct char (levels 4-5) -->
      <div v-if="stage === 'pickCorrect'" class="hint">{{ t('hintPickCorrect') }}</div>
      <div v-if="stage === 'pickCorrect'" class="choices">
        <button
          v-for="(c, i) in q.correctChoices"
          :key="i"
          class="choice"
          :class="{
            correctCh: revealAnswer && c === q.correctChar,
            wrongCh: revealAnswer && pickedChoice === c && c !== q.correctChar
          }"
          :disabled="revealAnswer"
          @click="onPickCorrect(c)"
        >{{ c }}</button>
      </div>

      <!-- Stage 2: input correct char (level 6) -->
      <div v-if="stage === 'inputCorrect'" class="hint">{{ t('hintType') }}</div>
      <div v-if="stage === 'inputCorrect'" class="input-row">
        <input
          ref="charInput"
          v-model="typedInput"
          class="char-input"
          maxlength="1"
          :disabled="revealAnswer"
          @keydown.enter="onSubmitTyped"
        />
        <button class="submit-btn" @click="onSubmitTyped" :disabled="!typedInput || revealAnswer">{{ t('submit') }}</button>
      </div>

      <!-- Feedback -->
      <div v-if="feedback" class="feedback" :class="feedback.type">
        <div class="fb-title">{{ feedback.title }}</div>
        <div v-if="feedback.detail" class="fb-detail">{{ feedback.detail }}</div>
      </div>
    </div>

    <!-- Exit confirm -->
    <div v-if="showExitConfirm" class="confirm-overlay" @click.self="cancelExit">
      <div class="confirm-card">
        <div class="confirm-text">{{ t('exitConfirm') }}</div>
        <div class="confirm-btns">
          <button class="mini-btn" @click="cancelExit">{{ t('back') }}</button>
          <button class="mini-btn primary" @click="doExit">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from '../assets'
import { LEVELS, MAX_ANSWER_MS, WINDOW_MS, BASE_SCORE } from '../data/levels'
import { idioms, getIdiomsByLevel, getDistractors, shuffle } from '../data/idioms'
import { t as i18nT } from '../data/i18n'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

export default {
  name: 'GamePage',
  props: ['lang', 'duration'],
  data() {
    return {
      level: getBatchStartDifficultyForGame('cyjc'),
      pendingLevel: null,
      score: 0,
      timeLeft: this.duration,
      // gameplay state
      q: null,
      stage: 'pickWrong', // pickWrong | pickWrongInIdiom | pickCorrect | inputCorrect | reveal
      pickedIdiomIdx: -1,
      pickedChoice: null,
      typedInput: '',
      revealAnswer: false,
      feedback: null,
      // timers
      gameTimer: null,
      questionTimer: null,
      questionStartMs: 0,
      qtPct: 100,
      qtRaf: null,
      // adaptive difficulty
      windowStartMs: 0,
      windowStats: { correct: 0, total: 0 },
      windowTimer: null,
      // overall stats
      stats: {
        total: 0, correct: 0, fail: 0,
        reactionTimes: []
      },
      // exit
      showExitConfirm: false,
      paused: false,
      pauseStartTime: 0,
      usedIdioms: [],
      // audio
      audio: null,
      showBatchSkip: shouldShowPbBatchSkip(),
    }
  },
  computed: {
    currentLevel() { return LEVELS[this.level - 1] },
    canPickIdiomChar() {
      return this.stage === 'pickWrongInIdiom' && !this.revealAnswer
    },
    idiomChars() { return this.q ? this.q.wrong.split('') : [] },
    rulePrompt() {
      const mode = this.currentLevel.mode
      if (mode === 'inputCorrect') return this.t('promptInputCorrect')
      if (mode === 'pickCorrect') return this.t('promptPickCorrect')
      return this.t('promptPickWrong')
    }
  },
  methods: {
    t(k, p) { return i18nT(this.lang, k, p) },
    formatTime(sec) {
      const m = Math.floor(sec / 60), s = sec % 60
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    },
    pickIdiom() {
      // 按当前难度筛选题库
      const levelPool = getIdiomsByLevel(this.level)
      // Avoid repeating within same session until pool exhausted
      let pool = levelPool.filter(it => !this.usedIdioms.includes(idioms.indexOf(it)))
      if (pool.length === 0) {
        // 清空该难度用过的题目
        this.usedIdioms = this.usedIdioms.filter(
          idx => !levelPool.includes(idioms[idx])
        )
        pool = levelPool
      }
      const i = Math.floor(Math.random() * pool.length)
      const chosen = pool[i]
      const originalIdx = idioms.indexOf(chosen)
      this.usedIdioms.push(originalIdx)
      return chosen
    },
    buildQuestion() {
      const lv = this.currentLevel
      const it = this.pickIdiom()
      const q = {
        ...it,
        choices: [],
        correctChoices: []
      }
      if (lv.mode === 'pickWrong') {
        // Choices include wrong char + distractors from idiom (not the wrong char)
        const others = it.wrong.split('').filter(c => c !== it.wrongChar)
        const shuffledOthers = shuffle(others)
        const pool = [it.wrongChar, ...shuffledOthers]
        q.choices = shuffle(pool.slice(0, lv.choices))
        // If choices didn't include wrongChar due to slicing, ensure it
        if (!q.choices.includes(it.wrongChar)) {
          q.choices[0] = it.wrongChar
          q.choices = shuffle(q.choices)
        }
      } else if (lv.mode === 'pickCorrect') {
        const distractors = getDistractors(it.wrongChar, it.correctChar, lv.choices - 1)
        q.correctChoices = shuffle([it.correctChar, ...distractors])
      }
      return q
    },
    nextQuestion() {
      if (this.pendingLevel != null) {
        this.level = this.pendingLevel
        this.pendingLevel = null
      }
      this.pickedIdiomIdx = -1
      this.pickedChoice = null
      this.typedInput = ''
      this.revealAnswer = false
      this.feedback = null
      this.q = this.buildQuestion()
      const lv = this.currentLevel
      if (lv.mode === 'pickWrong') {
        this.stage = 'pickWrong'
      } else {
        this.stage = 'pickWrongInIdiom'
      }
      this.questionStartMs = Date.now()
      this.startQuestionTimer()
      this.playQuestionVoice()
      if (lv.mode === 'inputCorrect') {
        // focus later
      }
    },
    playQuestionVoice() {
      try {
        if (this.audio) {
          this.audio.pause()
          this.audio.currentTime = 0
        }
        const folder = this.lang === 'en' ? 'english' : 'chinese'
        const src = resolveVoice(`/voice/${folder}/1.mp3`)
        this.audio = new Audio(src)
        this.audio.play().catch(() => {})
      } catch (e) {}
    },
    stopAudio() {
      try {
        if (this.audio) {
          this.audio.pause()
          this.audio.currentTime = 0
          this.audio = null
        }
      } catch (e) {}
    },
    startQuestionTimer() {
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      this.qtPct = 100
      // 用 setInterval 更稳定，兼容平板/iPad Safari
      this.qtRaf = setInterval(() => {
        if (this.paused) return
        const elapsed = Date.now() - this.questionStartMs
        this.qtPct = Math.max(0, 100 - (elapsed / MAX_ANSWER_MS) * 100)
        if (this.qtPct <= 0 || this.revealAnswer) {
          clearInterval(this.qtRaf)
        }
      }, 100)
      this.questionTimer = setTimeout(() => {
        if (!this.revealAnswer) this.onTimeout()
      }, MAX_ANSWER_MS)
    },
    onIdiomClick(i) {
      if (!this.canPickIdiomChar) return
      this.pickedIdiomIdx = i
      const lv = this.currentLevel
      if (i !== this.q.idx) {
        // wrong pick - mark fail
        this.recordAnswer(false)
        this.showRevealAndAdvance()
      } else {
        // correct pick of wrong char - move to stage 2
        if (lv.mode === 'pickCorrect') {
          this.stage = 'pickCorrect'
        } else if (lv.mode === 'inputCorrect') {
          this.stage = 'inputCorrect'
          this.$nextTick(() => {
            if (this.$refs.charInput) this.$refs.charInput.focus()
          })
        }
      }
    },
    onPickWrong(c) {
      if (this.revealAnswer) return
      this.pickedChoice = c
      const ok = c === this.q.wrongChar
      // Also visually pick in the idiom
      if (ok) {
        this.pickedIdiomIdx = this.q.idx
      }
      this.recordAnswer(ok)
      this.showRevealAndAdvance()
    },
    onPickCorrect(c) {
      if (this.revealAnswer) return
      this.pickedChoice = c
      const ok = c === this.q.correctChar
      this.recordAnswer(ok)
      this.showRevealAndAdvance()
    },
    onSubmitTyped() {
      if (this.revealAnswer || !this.typedInput) return
      const ok = this.typedInput.trim() === this.q.correctChar
      this.recordAnswer(ok)
      this.showRevealAndAdvance()
    },
    onTimeout() {
      this.recordAnswer(false, true)
      this.showRevealAndAdvance()
    },
    recordAnswer(correct, timeout) {
      const rt = Date.now() - this.questionStartMs
      this.stats.total++
      this.windowStats.total++
      if (correct) {
        this.stats.correct++
        this.windowStats.correct++
        this.score += BASE_SCORE * this.currentLevel.coeff
        this.stats.reactionTimes.push(rt)
        this.feedback = { type: 'ok', title: this.t('correct') }
      } else {
        this.stats.fail++
        this.feedback = {
          type: 'bad',
          title: timeout ? this.t('timeUp') : this.t('wrong'),
          detail: this.t('correctAnswerIs') + this.q.correct + ' (' + this.q.correctChar + ')'
        }
      }
    },
    showRevealAndAdvance() {
      this.revealAnswer = true
      clearInterval(this.qtRaf)
      clearTimeout(this.questionTimer)
      setTimeout(() => {
        if (this.timeLeft > 0) this.nextQuestion()
      }, 1300)
    },
    startGameTimer() {
      this.gameTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft--
        if (this.timeLeft <= 0) {
          this.timeLeft = 0
          this.endGame()
        }
      }, 1000)
    },
    startAdaptiveWindow() {
      this.windowStats = { correct: 0, total: 0 }
      this.windowStartMs = Date.now()
      clearInterval(this.windowTimer)
      this.windowTimer = setInterval(() => this.evaluateAdaptive(), WINDOW_MS)
    },
    evaluateAdaptive() {
      const w = this.windowStats
      if (w.total > 0) {
        const rate = w.correct / w.total
        let nextLevel = this.level
        if (rate >= 0.9 && this.level < LEVELS.length) {
          nextLevel = this.level + 1
        } else if (rate <= 0.7 && this.level > 1) {
          nextLevel = this.level - 1
        }
        if (nextLevel !== this.level) this.pendingLevel = nextLevel
      }
      this.windowStats = { correct: 0, total: 0 }
    },
    endGame() {
      clearInterval(this.gameTimer)
      clearInterval(this.windowTimer)
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      this.stopAudio()
      const summary = {
        durationSec: this.duration,
        finalLevel: this.level,
        score: Math.round(this.score * 10) / 10,
        total: this.stats.total,
        correct: this.stats.correct,
        fail: this.stats.fail,
        rate: this.stats.total ? this.stats.correct / this.stats.total : 0,
        avgRt: this.stats.reactionTimes.length
          ? Math.round(this.stats.reactionTimes.reduce((a,b)=>a+b,0) / this.stats.reactionTimes.length)
          : 0,
        finishedAt: Date.now()
      }
      this.$emit('end', summary)
    },
    onExit() {
      this.paused = true
      this.pauseStartTime = Date.now()
      // pause the question timer so it doesn't fire while modal shows
      clearTimeout(this.questionTimer)
      clearInterval(this.qtRaf)
      // pause voice prompt
      try { if (this.audio) this.audio.pause() } catch (e) {}
      this.showExitConfirm = true
    },
    cancelExit() {
      this.showExitConfirm = false
      // resume voice prompt
      try { if (this.audio && this.audio.paused && !this.audio.ended) this.audio.play().catch(() => {}) } catch (e) {}
      if (this.paused && this.pauseStartTime) {
        const delta = Date.now() - this.pauseStartTime
        if (this.questionStartMs) this.questionStartMs += delta
        if (this.windowStartMs) this.windowStartMs += delta
        // restart question timer with remaining time
        if (!this.revealAnswer && this.q) {
          const elapsed = Date.now() - this.questionStartMs
          const remaining = Math.max(0, MAX_ANSWER_MS - elapsed)
          this.qtRaf = setInterval(() => {
            if (this.paused) return
            const el = Date.now() - this.questionStartMs
            this.qtPct = Math.max(0, 100 - (el / MAX_ANSWER_MS) * 100)
            if (this.qtPct <= 0 || this.revealAnswer) {
              clearInterval(this.qtRaf)
            }
          }, 100)
          this.questionTimer = setTimeout(() => {
            if (!this.revealAnswer) this.onTimeout()
          }, remaining)
        }
      }
      this.paused = false
    },
    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传（不 emit end）
     * </summary>
     */
    doExit() {
      this.showExitConfirm = false // 关闭确认框
      clearInterval(this.gameTimer) // 主倒计时
      clearInterval(this.windowTimer) // 自适应窗口
      clearTimeout(this.questionTimer) // 题目时限
      clearInterval(this.qtRaf) // 题目进度刷新
      this.stopAudio() // 停止语音
      leavePbGameWindow({ confirm: false })
    },
    onSkipClick() {
      skipPbBatchGame()
    }
  },
  mounted() {
    this.nextQuestion()
    this.startGameTimer()
    this.startAdaptiveWindow()
  },
  beforeDestroy() {
    clearInterval(this.gameTimer)
    clearInterval(this.windowTimer)
    clearTimeout(this.questionTimer)
    clearInterval(this.qtRaf)
    this.stopAudio()
  }
}
</script>

<style scoped>
.game-page {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  padding: 3vmin;
  position: relative;
}
.hud {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 1vmin;
}
.hud-left { display: flex; gap: 3vmin; }
.stat {
  background: #fff;
  padding: 1.5vmin 2.5vmin;
  border-radius: 1.5vmin;
  border: 0.25vmin solid #b08b4f;
  min-width: 14vmin;
  text-align: center;
  box-shadow: 0 0.4vmin 1vmin rgba(122,90,44,.12);
}
.stat .label { font-size: 1.8vmin; color: #8a6a3a; letter-spacing: 0.1vmin; }
.stat .value { font-size: 3.6vmin; font-weight: 700; color: #7a3a1e; }
.stat .value.warn { color: #d33; animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: 0.5; } }
.exit-btn {
  padding: 1.4vmin 2.6vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
}
.exit-btn:hover { background: #fff8ec; }
.hud-right { display: flex; gap: 1.5vmin; align-items: center; }
.skip-btn {
  padding: 1.4vmin 2.6vmin;
  font-size: 2.2vmin;
  background: #ececec;
  border: 0.25vmin solid #bbb;
  color: #555;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
}
.skip-btn:hover { background: #dcdcdc; }

.stage {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 3vmin;
  position: relative;
}
.rule {
  font-size: 3.4vmin;
  font-weight: 700;
  color: #7a3a1e;
  margin-bottom: 3vmin;
  text-align: center;
  letter-spacing: 0.2vmin;
}
.question-timer {
  width: 70vmin; height: 1.2vmin;
  background: #e8ddc8;
  border-radius: 1vmin;
  overflow: hidden;
  margin-bottom: 4vmin;
}
.qt-bar {
  height: 100%;
  background: linear-gradient(90deg, #58a058, #d97742);
  border-radius: 1vmin;
  transition: width 0.1s linear;
}
.idiom-container {
  display: flex; gap: 2vmin;
  margin-bottom: 4vmin;
}
.idiom-tile {
  width: 14vmin; height: 14vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 2vmin;
  font-size: 8vmin; font-weight: 700;
  color: #333;
  transition: all .25s;
  user-select: none;
}
.idiom-tile.selectable { cursor: pointer; }
@media (hover: hover) {
  .idiom-tile.selectable:hover { transform: translateY(-0.8vmin); box-shadow: 0 0.8vmin 1.6vmin rgba(122,90,44,.2); }
}
.idiom-tile.picked { background: #fff2e0; border-color: #d97742; }
.idiom-tile.correctPick { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; }
.idiom-tile.wrongPick { background: #ffd6cc; border-color: #d55; color: #c22; }
.idiom-tile.showAnswer { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; box-shadow: 0 0 0 0.5vmin rgba(88,160,88,.3); }

.hint {
  font-size: 2.5vmin;
  color: #8a6a3a;
  margin-bottom: 2vmin;
  font-weight: 600;
}
.choices { display: flex; gap: 2vmin; flex-wrap: wrap; justify-content: center; }
.choice {
  width: 12vmin; height: 12vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 2vmin;
  font-size: 6vmin; font-weight: 700;
  color: #333;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 0.5vmin 1.2vmin rgba(122,90,44,.12);
}
@media (hover: hover) {
  .choice:hover:not(:disabled) { transform: translateY(-0.8vmin); border-color: #b08b4f; }
}
.choice:disabled { cursor: default; }
.choice.correctCh { background: #d3f0d3; border-color: #58a058; color: #2b7a2b; }
.choice.wrongCh { background: #ffd6cc; border-color: #d55; color: #c22; }

.input-row { display: flex; gap: 2vmin; align-items: center; }
.char-input {
  width: 14vmin; height: 14vmin;
  font-size: 8vmin; font-weight: 700;
  text-align: center;
  background: #fff;
  border: 0.35vmin solid #d0b48a;
  border-radius: 2vmin;
  color: #333;
  outline: none;
}
.char-input:focus { border-color: #d97742; box-shadow: 0 0 0 0.5vmin rgba(217,119,66,.2); }
.submit-btn {
  padding: 2vmin 3vmin;
  font-size: 2.4vmin;
  background: linear-gradient(135deg, #d97742, #b04e1e);
  color: #fff;
  border: 0.25vmin solid #a34418;
  border-radius: 1.5vmin;
  cursor: pointer;
  font-weight: 700;
}
.submit-btn:disabled { opacity: .4; cursor: not-allowed; }

.feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 32vmin;
  padding: 3vmin 5vmin;
  border-radius: 2vmin;
  font-size: 3.2vmin;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 1.5vmin 4vmin rgba(0,0,0,.25);
  z-index: 80;
  animation: fbPop .25s;
}
.feedback.ok { background: #d3f0d3; color: #2b7a2b; border: 0.3vmin solid #58a058; }
.feedback.bad { background: #ffd6cc; color: #c22; border: 0.3vmin solid #d55; }
.fb-detail { font-size: 2.4vmin; font-weight: 500; margin-top: 1vmin; }
@keyframes fbPop {
  from { opacity: 0; transform: translate(-50%, -50%) scale(.85); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.confirm-overlay {
  position: absolute; inset: 0;
  background: rgba(30,20,10,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 60;
}
.confirm-card {
  background: #fdf9f0;
  padding: 4vmin;
  border-radius: 2vmin;
  border: 0.3vmin solid #b08b4f;
  min-width: 40vmin;
}
.confirm-text { font-size: 2.6vmin; color: #7a3a1e; margin-bottom: 3vmin; text-align: center; }
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
.mini-btn {
  padding: 1.5vmin 3vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  border-radius: 1.2vmin;
  color: #7a5a2c;
  font-weight: 600;
  cursor: pointer;
}
.mini-btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }

@media (orientation: portrait) {
  .game-page {
    padding: calc(2vmin + env(safe-area-inset-top)) 3vmin calc(2vmin + env(safe-area-inset-bottom));
  }
  .hud {
    flex-wrap: wrap;
    gap: 2vmin;
    padding-top: env(safe-area-inset-top);
  }
  .hud-left { gap: 2vmin; flex-wrap: wrap; width: 100%; justify-content: space-between; }
  .stat {
    padding: 1.5vmin 2vmin;
    min-width: 0;
    flex: 1;
    border-radius: 2vmin;
  }
  .stat .label { font-size: max(2.4vmin, 12px); }
  .stat .value { font-size: max(4.5vmin, 20px); }
  .hud-right { width: 100%; justify-content: flex-end; gap: 2.5vmin; }
  .exit-btn, .skip-btn {
    padding: 2.2vmin 4vmin;
    font-size: max(3.2vmin, 15px);
    border-radius: 4vmin;
    border-width: 0.4vmin;
  }
  .rule { font-size: max(4.5vmin, 18px); margin-bottom: 3vmin; letter-spacing: 0.1vmin; }
  .question-timer { width: 88vw; height: 1.6vmin; }
  .idiom-container { gap: 2.2vmin; margin-bottom: 5vmin; }
  .idiom-tile {
    width: min(19vw, 22vmin);
    height: min(19vw, 22vmin);
    font-size: max(10vw, 40px);
    border-radius: 2.5vmin;
    border-width: 0.5vmin;
  }
  .hint { font-size: max(4vmin, 16px); margin-bottom: 3vmin; }
  .choices { gap: 3vmin; }
  .choice {
    width: min(20vw, 22vmin);
    height: min(20vw, 22vmin);
    font-size: max(9vw, 36px);
    border-radius: 2.5vmin;
    border-width: 0.5vmin;
  }
  .input-row { gap: 3vmin; flex-wrap: wrap; justify-content: center; }
  .char-input {
    width: min(28vw, 22vmin);
    height: min(28vw, 22vmin);
    font-size: max(12vw, 44px);
  }
  .submit-btn {
    padding: 2.5vmin 5vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 2vmin;
  }
  .feedback {
    min-width: 60vw;
    max-width: 88vw;
    padding: 4vmin 5vmin;
    font-size: max(5vmin, 20px);
    border-radius: 3vmin;
  }
  .fb-detail { font-size: max(3.6vmin, 14px); }
  .confirm-card {
    min-width: 0;
    width: 90vw;
    padding: 5vmin 4vmin;
    border-radius: 3vmin;
  }
  .confirm-text { font-size: max(4vmin, 16px); margin-bottom: 4vmin; }
  .mini-btn {
    padding: 2.2vmin 4vmin;
    font-size: max(3.6vmin, 15px);
    border-radius: 2vmin;
  }
}
</style>
