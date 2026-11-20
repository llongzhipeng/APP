<template>
  <div class="game" ref="stage">
    <!-- 顶部HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="stat">
          <div class="lbl">{{ t.difficulty }}</div>
          <div class="val diff"><span class="lv">L{{ difficulty }}</span></div>
        </div>
        <div class="stat">
          <div class="lbl">{{ t.score }}</div>
          <div class="val score">{{ score }}</div>
        </div>
        <div class="stat">
          <div class="lbl">{{ t.timeLeft }}</div>
          <div class="val time" :class="{ danger: timeLeft<=10 }">{{ fmtTime(timeLeft) }}</div>
        </div>
      </div>
      <div class="hud-center">
        <div class="ruleboard">
          <div class="rb-glow"></div>
          <div class="rb-label">RULE • 规则</div>
          <div class="rb-content">
            <template v-if="task && task.item.type === 'color'">
              <span>{{ t.rulePrefix }}</span>
              <span class="chip" :style="{ background: task.item.gradient }">{{ t[task.ruleKey] }}</span>
              <span>{{ t.ruleSuffix }}</span>
            </template>
            <template v-else-if="task">
              <span>{{ task.ruleText[lang] }}</span>
            </template>
          </div>
          <!-- 时间进度条 -->
          <div class="qbar">
            <div class="qbar-fill" :style="{ width: qProgress + '%', background: qProgress<30 ? 'linear-gradient(90deg,#ff6b6b,#ff8a5b)' : 'linear-gradient(90deg,#4facfe,#00f2fe)' }"></div>
          </div>
        </div>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="hbtn" @click="$emit('batch-skip')">{{ t.skipGame }}</button>
        <button class="hbtn ghost" @click="pause">← {{ t.back }}</button>
      </div>
    </div>

    <!-- 工厂舞台 -->
    <div class="factory" ref="factory">
      <!-- 背景装饰: 工业管道 & 侧面支架 -->
      <div class="pipes">
        <div class="pipe-top"></div>
        <div class="pipe-bolts">
          <span v-for="i in 12" :key="i"></span>
        </div>
        <div class="warn-tape"></div>
      </div>

      <!-- 传送带 -->
      <div class="conveyor" ref="conveyor">
        <!-- 支架 -->
        <div class="leg leg-l"><div class="leg-cap"></div><div class="leg-bar"></div><div class="leg-foot"></div></div>
        <div class="leg leg-r"><div class="leg-cap"></div><div class="leg-bar"></div><div class="leg-foot"></div></div>
        <!-- 传送带主体 -->
        <div class="belt-frame">
          <!-- 端头滚筒 -->
          <div class="drum drum-l">
            <div class="drum-face" :style="{ animationDuration: drumSpin + 's' }">
              <span v-for="i in 8" :key="i" :style="{ transform: `rotate(${i*45}deg)` }"></span>
            </div>
          </div>
          <div class="drum drum-r">
            <div class="drum-face" :style="{ animationDuration: drumSpin + 's' }">
              <span v-for="i in 8" :key="i" :style="{ transform: `rotate(${i*45}deg)` }"></span>
            </div>
          </div>
          <!-- 传送带面 -->
          <div class="belt-surface">
            <div class="belt-shadow-top"></div>
            <div class="belt-plates" :style="{ animationDuration: beltSpeed + 's' }">
              <div class="plate" v-for="i in 18" :key="i"></div>
            </div>
            <div class="belt-edge"></div>
            <div class="belt-shadow-bot"></div>
          </div>
          <!-- 底部滚轴排 -->
          <div class="under-rollers">
            <div class="ur" v-for="i in 10" :key="i" :style="{ animationDuration: drumSpin + 's' }"></div>
          </div>
        </div>
        <!-- 方向箭头 LED -->
        <div class="arrows">
          <span v-for="i in 5" :key="i" :style="{ animationDelay: (i*0.15) + 's' }">▶</span>
        </div>
        <!-- 当前物品 -->
        <div v-if="task && itemVisible" class="cargo"
          ref="cargo"
          :class="{ dragging: dragging, ['size-'+itemSize]: true }"
          :style="itemStyle"
          @mousedown="onGrab" @touchstart.prevent="onGrab">
          <template v-if="task.item.type==='color'">
            <ShapeItem :shape="task.item.shape" :color="task.item.color"/>
          </template>
          <template v-else>
            <div class="emoji-item">
              <span class="emoji">{{ task.item.emoji }}</span>
              <span class="ename">{{ task.item.name[lang] }}</span>
            </div>
          </template>
          <!-- 物品阴影 -->
          <div class="cargo-shadow"></div>
        </div>
        <!-- 反馈提示 -->
        <transition name="feedback">
          <div v-if="feedback" class="feedback" :class="feedback.type">
            <div class="fb-ico">{{ feedback.type==='correct' ? '✓' : '✕' }}</div>
            <div class="fb-text">{{ feedback.text }}</div>
            <div v-if="feedback.type==='correct'" class="fb-score">+{{ feedback.plus }}</div>
          </div>
        </transition>
      </div>

      <!-- 分类桶 -->
      <div class="bins-stage">
        <div class="floor"></div>
        <div class="bins-row" :class="'bins-'+binsView.length">
          <div v-for="(b, idx) in binsView" :key="b.id"
            class="bin"
            :class="{ hover: hoverBin===b.id, drop: dropAnim===b.id, ['bin-size-'+itemSize]: true }"
            :ref="'bin-'+b.id"
            :style="binStyle(idx, b)">
            <div class="bin-lid-wrap">
              <div class="bin-lid"><div class="handle"></div></div>
            </div>
            <div class="bin-body">
              <div class="bin-inner"></div>
              <div class="bin-shine"></div>
              <div class="bin-stripes"></div>
              <div class="bin-label">{{ b.text }}</div>
              <div class="bin-tag">{{ String(idx+1).padStart(2,'0') }}</div>
            </div>
            <div class="bin-base"></div>
            <div v-if="hoverBin===b.id" class="bin-ring"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 倒计时开始 -->
    <div v-if="countdown>0" class="countdown">
      <div class="cd-num">{{ countdown===4 ? t.ready : (countdown===0 ? t.go : countdown) }}</div>
    </div>

    <!-- 暂停/退出弹窗 -->
    <div v-if="paused" class="mask">
      <div class="pause-modal">
        <div class="pause-icon">⏸</div>
        <h2>{{ t.pauseTitle }}</h2>
        <p>{{ t.pauseText }}</p>
        <div class="pbtns">
          <button class="pbtn" @click="resume">{{ t.cancelEnd }}</button>
          <button class="pbtn danger" @click="endGame(true)">{{ t.confirmEnd }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShapeItem from './ShapeItem.vue'
import { DIFFICULTY, pickTask } from '../game-data.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'

const GAME_TYPE = 'fltzs' // 分类挑战赛 gameType

export default {
  name: 'GamePage',
  components: { ShapeItem },
  props: ['t', 'lang', 'duration', 'showBatchSkip'],
  data() {
    return {
      difficulty: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      timeLeft: this.duration || 60,
      countdown: 4,
      paused: false,
      task: null,
      qDeadline: 0,   // 每题剩余到期时间
      qStart: 0,
      qLimit: 15000,
      qProgress: 100,
      itemVisible: false,
      itemX: 0,           // 传送带内 X 百分比
      itemStart: 0,       // 起始时间
      itemDuration: 8000, // 从进入到离开传送带的时间
      itemPaused: false,
      dragging: false,
      dragOffsetX: 0, dragOffsetY: 0,
      cargoAbs: null,   // 当拖拽时切换到 absolute {x,y}
      hoverBin: null,
      dropAnim: null,
      feedback: null,
      // 统计
      total: 0, success: 0, fail: 0,
      reactTimes: [],
      // 60秒内窗口
      windowStart: 0, windowTotal: 0, windowSuccess: 0,
      // 桶位置洗牌顺序（记录本题各桶在渲染中的下标顺序）
      binShuffleSeed: 0,
      // timers
      loopRAF: 0,
      globalTimer: null,
      countdownTimer: null,
      difficultyTimer: null,
      lastTs: 0
    }
  },
  computed: {
    beltSpeed() {
      const cfg = DIFFICULTY[this.difficulty]
      // 慢60/中90/较快130 → 传送带皮带动画速度
      return cfg.speed === 60 ? 2.4 : cfg.speed === 90 ? 1.6 : 1.1
    },
    drumSpin() {
      // 端头滚筒转动周期，跟随皮带速度
      return this.beltSpeed * 0.5
    },
    // 物品大小分级：难度 4-6 使用大号
    itemSize() {
      return this.difficulty >= 4 ? 'lg' : 'md'
    },
    binsView() {
      if (!this.task) return []
      // 每题使用洗牌顺序
      const bins = this.task.bins.map(b => ({ ...b, text: this.t[b.key] }))
      const order = this.shuffleOrder(bins.length, this.binShuffleSeed)
      return order.map(i => bins[i])
    },
    itemStyle() {
      if (this.cargoAbs) {
        return {
          position: 'fixed',
          left: this.cargoAbs.x + 'px',
          top: this.cargoAbs.y + 'px',
          transform: 'translate(-50%,-50%) scale(1.12)',
          zIndex: 30,
          transition: 'none',
          cursor: 'grabbing'
        }
      }
      return {
        left: this.itemX + '%',
        transform: 'translate(-50%,-50%)',
        cursor: 'grab',
        transition: 'none'
      }
    }
  },
  mounted() {
    this.startCountdown()
    window.addEventListener('mousemove', this.onMove)
    window.addEventListener('mouseup', this.onRelease)
    window.addEventListener('touchmove', this.onMove, { passive: false })
    window.addEventListener('touchend', this.onRelease)
  },
  beforeDestroy() {
    this.stopAllTimers()
    window.removeEventListener('mousemove', this.onMove)
    window.removeEventListener('mouseup', this.onRelease)
    window.removeEventListener('touchmove', this.onMove)
    window.removeEventListener('touchend', this.onRelease)
    if (this._audio) { try { this._audio.pause() } catch (e) {} this._audio = null }
  },
  methods: {
    stopAllTimers() {
      if (this.loopRAF) cancelAnimationFrame(this.loopRAF)
      if (this.globalTimer) clearInterval(this.globalTimer)
      if (this.countdownTimer) clearInterval(this.countdownTimer)
      if (this.difficultyTimer) clearInterval(this.difficultyTimer)
    },
    fmtTime(s) {
      const m = Math.floor(s/60), r = s%60
      return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`
    },
    startCountdown() {
      this.countdown = 4
      this.countdownTimer = setInterval(() => {
        this.countdown -= 1
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.countdown = 0
          setTimeout(() => { this.countdown = -1; this.startGame() }, 500)
        }
      }, 900)
    },
    startGame() {
      this.windowStart = performance.now()
      // 总倒计时
      this.globalTimer = setInterval(() => {
        if (this.paused) return
        this.timeLeft -= 1
        if (this.timeLeft <= 0) this.endGame(false)
      }, 1000)
      // 每60秒智能调整难度
      this.difficultyTimer = setInterval(() => {
        if (this.paused) return
        this.adjustDifficulty()
      }, 60000)
      this.newTask()
      this.lastTs = performance.now()
      this.loop()
    },
    loop() {
      this.loopRAF = requestAnimationFrame(this.loop)
      const now = performance.now()
      const dt = now - this.lastTs
      this.lastTs = now
      if (this.paused || !this.task || !this.itemVisible || this.dragging) return

      // 更新每题倒计时
      const elapsed = now - this.qStart
      this.qProgress = Math.max(0, 100 - (elapsed / this.qLimit) * 100)
      if (elapsed >= this.qLimit) {
        this.onTimeout()
        return
      }
      // 传送带移动
      const cfg = DIFFICULTY[this.difficulty]
      // 每秒移动 %：慢=8, 中=12, 快=18
      const pctPerSec = cfg.speed === 60 ? 8 : cfg.speed === 90 ? 12 : 18
      this.itemX += pctPerSec * (dt / 1000)
      if (this.itemX > 108) {
        // 物品滑出传送带 → 超时
        this.onTimeout()
      }
    },
    newTask() {
      this.task = pickTask(this.difficulty)
      this.qStart = performance.now()
      this.qLimit = 15000
      this.qProgress = 100
      this.itemX = -8
      this.itemVisible = true
      this.cargoAbs = null
      this.dragging = false
      this.hoverBin = null
      // 洗牌桶位置，让位置每题都变化
      this.binShuffleSeed = Math.floor(Math.random() * 1e9) + Date.now() % 1000
      // 每题开始播放语音提示
      this.playPrompt()
    },
    playPrompt() {
      try {
        const src = this.lang === 'en' ? 'voice/english/1.mp3' : 'voice/chinese/1.mp3'
        if (!this._audio) this._audio = new Audio()
        this._audio.pause()
        this._audio.src = src
        this._audio.currentTime = 0
        const p = this._audio.play()
        if (p && p.catch) p.catch(() => {}) // 忽略自动播放策略拒绝
      } catch (e) { /* 忽略 */ }
    },
    shuffleOrder(n, seed) {
      const arr = Array.from({length: n}, (_,i) => i)
      // 基于 seed 的确定性 Fisher-Yates
      let s = seed || 1
      const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    },
    binStyle(idx, b) {
      return { '--bg': b.gradient, '--c': b.color, '--i': idx }
    },
    onGrab(e) {
      if (!this.itemVisible || this.paused) return
      this.dragging = true
      const p = this.pointer(e)
      const rect = this.$refs.cargo.getBoundingClientRect()
      this.cargoAbs = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
      this.dragOffsetX = p.x - this.cargoAbs.x
      this.dragOffsetY = p.y - this.cargoAbs.y
    },
    onMove(e) {
      if (!this.dragging) return
      if (e.cancelable) e.preventDefault()
      const p = this.pointer(e)
      this.cargoAbs = { x: p.x - this.dragOffsetX, y: p.y - this.dragOffsetY }
      // 检测悬停桶
      this.hoverBin = this.detectBin(p.x, p.y)
    },
    onRelease(e) {
      if (!this.dragging) return
      const p = this.pointer(e)
      const binId = this.detectBin(p.x, p.y)
      this.dragging = false
      if (binId) {
        this.resolveDrop(binId)
      } else {
        // 放回传送带
        this.cargoAbs = null
      }
      this.hoverBin = null
    },
    pointer(e) {
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
      return { x: e.clientX, y: e.clientY }
    },
    detectBin(x, y) {
      if (!this.task) return null
      for (const b of this.task.bins) {
        const el = this.$refs['bin-'+b.id]
        if (!el) continue
        const node = Array.isArray(el) ? el[0] : el
        const r = node.getBoundingClientRect()
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return b.id
      }
      return null
    },
    resolveDrop(binId) {
      const correct = binId === this.task.item.binId
      const react = performance.now() - this.qStart
      this.total += 1
      this.windowTotal += 1
      this.reactTimes.push(react)
      if (correct) {
        this.success += 1
        this.windowSuccess += 1
        const plus = Math.round(5 * DIFFICULTY[this.difficulty].factor)
        this.score += plus
        this.feedback = { type: 'correct', text: this.t.correct, plus }
      } else {
        this.fail += 1
        this.feedback = { type: 'wrong', text: this.t.wrong }
      }
      this.dropAnim = binId
      this.itemVisible = false
      setTimeout(() => { this.dropAnim = null }, 500)
      setTimeout(() => { this.feedback = null; if (this.timeLeft>0 && !this.paused) this.newTask() }, 900)
    },
    onTimeout() {
      this.total += 1
      this.windowTotal += 1
      this.fail += 1
      this.feedback = { type: 'wrong', text: this.t.timeout }
      this.itemVisible = false
      setTimeout(() => { this.feedback = null; if (this.timeLeft>0 && !this.paused) this.newTask() }, 900)
    },
    adjustDifficulty() {
      if (this.windowTotal === 0) return
      const rate = this.windowSuccess / this.windowTotal
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty += 1
      else if (rate <= 0.7 && this.difficulty > 1) this.difficulty -= 1
      this.windowTotal = 0
      this.windowSuccess = 0
    },
    pause() {
      this.paused = true
    },
    resume() {
      this.paused = false
      // 重置每题起始时间以避免暂停期计时
      this.qStart = performance.now() - (100 - this.qProgress) / 100 * this.qLimit
      this.lastTs = performance.now()
    },
    endGame(userEnded) {
      this.stopAllTimers()
      // 中途点返回确认退出：与其他平板游戏一致，关窗/回退，不上传、不进结果页
      if (userEnded) {
        this.$emit('quit')
        return
      }
      const avg = this.reactTimes.length ? Math.round(this.reactTimes.reduce((a,b)=>a+b,0) / this.reactTimes.length) : 0
      const rate = this.total ? Math.round(this.success / this.total * 100) : 0
      this.$emit('finish', {
        difficulty: this.difficulty,
        duration: this.duration,
        score: this.score,
        total: this.total,
        success: this.success,
        fail: this.fail,
        rate,
        avgReact: avg,
        userEnded
      })
    },
  }
}
</script>

<style scoped>
.game { position: relative; width: 100%; height: 100%; overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(80,180,255,.14), transparent 45%),
    radial-gradient(ellipse at 80% 100%, rgba(179,127,235,.12), transparent 55%),
    linear-gradient(180deg,#f5fbf0 0%,#e8f1e3 65%,#dcead9 100%);
  color: #2c4637; user-select: none; }

/* ==== HUD ==== */
.hud { position: absolute; top: 0; left: 0; right: 0; z-index: 10; padding: 2vh 3vw;
  display: grid; grid-template-columns: auto 1fr auto; gap: 2vw; align-items: center; }
.hud-left { display: flex; gap: 1.5vw; }
.stat { padding: 1.2vh 1.6vh; min-width: 90px;
  background: #fcfff9;
  border: 1px solid rgba(120,200,255,.25); border-radius: 12px; backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0,0,0,.2); }
.stat .lbl { font-size: 1.2vh; letter-spacing: .2em; color: #4c6759; text-transform: uppercase; }
.stat .val { font-size: 2.6vh; font-weight: 800; margin-top: .3vh;
  color: #254735; }
.val.diff .lv { color:#674588; }
.val.score { color:#824c19; }
.val.time { color: #245b60; background: none; -webkit-text-fill-color: initial; font-variant-numeric: tabular-nums; }
.val.time.danger { color: #a3263a; animation: dpulse .8s ease infinite; }
@keyframes dpulse { 50% { opacity: .5 } }

.hud-center { display: flex; justify-content: center; }
.ruleboard { position: relative; width: min(560px, 44vw); padding: 1.6vh 3vh 1.4vh;
  background: #f9fff7;
  border: 1px solid rgba(80,180,255,.5); border-radius: 16px;
  box-shadow: 0 0 40px rgba(79,172,254,.25) inset, 0 20px 40px rgba(0,0,0,.4); overflow: hidden; }
.rb-glow { position: absolute; inset: -20% -30% auto -30%; height: 60%; background: radial-gradient(ellipse,rgba(79,172,254,.35),transparent 70%); pointer-events: none; }
.rb-label { font-size: 1.2vh; letter-spacing: .3em; color: #3f6661; opacity: .85; }
.rb-content { font-size: 2.4vh; margin-top: .6vh; letter-spacing: .04em; text-align: center; }
.chip { display: inline-block; margin: 0 .6vh; padding: .4vh 1.6vh; border-radius: 8px; color: #fff; font-weight: 800;
  box-shadow: 0 6px 16px rgba(0,0,0,.4); }
.qbar { margin-top: 1.2vh; height: 4px; background: #d3e3d9; border-radius: 2px; overflow: hidden; }
.qbar-fill { height: 100%; transition: width .1s linear; box-shadow: 0 0 10px currentColor; }

.hud-right { display: flex; gap: 1vh; }
.hbtn { padding: 1.2vh 2vh; background: #f8e4e6; color: #90263b;
  border: 1px solid rgba(255,107,107,.4); border-radius: 10px; cursor: pointer; font-size: 1.7vh; font-weight: 600;
  transition: .2s; backdrop-filter: blur(8px); }
.hbtn:hover { background: #f3d4d8; }
.hbtn.ghost { background: #fcfff9; color: #2c4637; border-color: rgba(120,200,255,.35); }
.hbtn.ghost:hover { background: rgba(80,180,255,.2); }

/* ==== 工厂舞台 ==== */
.factory { position: absolute; top: 14vh; left: 4vw; right: 4vw; bottom: 3vh;
  display: flex; flex-direction: column; }

/* 顶部工业管道装饰 */
.pipes { position: absolute; top: 0; left: -4vw; right: -4vw; height: 3vh; z-index: 0; pointer-events: none; }
.pipe-top { position: absolute; inset: 0 0 auto 0; height: 100%;
  background:
    linear-gradient(180deg, #253c5f 0%, #0f1e37 40%, #1a2d4d 60%, #0a1730 100%);
  border-top: 1px solid rgba(120,200,255,.35);
  border-bottom: 1px solid rgba(0,0,0,.5);
  box-shadow: 0 6px 20px rgba(0,0,0,.4) inset, 0 -2px 0 rgba(255,255,255,.08) inset; }
.pipe-bolts { position: absolute; inset: 0; display: flex; justify-content: space-around; align-items: center; padding: 0 4%; }
.pipe-bolts span { width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #7fa2d1, #1a2a44);
  box-shadow: 0 0 4px rgba(0,0,0,.6), 0 0 0 2px rgba(0,0,0,.3); }
.warn-tape { position: absolute; bottom: -6px; left: 0; right: 0; height: 6px;
  background: repeating-linear-gradient(45deg,#ffcc00 0 12px,#1a1a1a 12px 24px); opacity: .55; }

/* ===== 传送带 (顶级工业级) ===== */
.conveyor { position: relative; height: 42%; margin-top: 5vh; padding: 0 6vh; }

/* 支架 */
.leg { position: absolute; bottom: -4vh; width: 3vh; height: 8vh; z-index: 0; }
.leg-l { left: 8vh; }
.leg-r { right: 8vh; }
.leg-cap { width: 100%; height: 12%; background: linear-gradient(180deg,#4a6a95,#22344f); border-radius: 4px 4px 0 0;
  box-shadow: 0 2px 4px rgba(0,0,0,.5); }
.leg-bar { width: 60%; margin-left: 20%; height: 70%;
  background: linear-gradient(90deg,#1a2d4d 0%,#3a5578 50%,#1a2d4d 100%);
  border-left: 1px solid rgba(0,0,0,.4); border-right: 1px solid rgba(0,0,0,.4);
  box-shadow: inset 2px 0 0 rgba(255,255,255,.08); }
.leg-foot { width: 140%; margin-left: -20%; height: 16%; background: linear-gradient(180deg,#3a5578,#1a2d4d);
  border-radius: 4px; box-shadow: 0 6px 12px rgba(0,0,0,.5); }

.belt-frame { position: relative; height: 100%; z-index: 2; }

/* 端头大滚筒 */
.drum { position: absolute; top: 50%; transform: translateY(-50%); width: 12vh; aspect-ratio: 1; z-index: 3; }
.drum-l { left: -6vh; }
.drum-r { right: -6vh; }
.drum-face { position: relative; width: 100%; height: 100%; border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, #b6c8e0 0%, #7a90b3 25%, #3d5273 55%, #1a2740 85%, #0a1224 100%);
  box-shadow:
    0 12px 24px rgba(0,0,0,.6),
    inset 0 0 0 2px rgba(0,0,0,.5),
    inset 0 -8px 12px rgba(0,0,0,.5),
    inset 0 8px 12px rgba(255,255,255,.15);
  animation: drumSpin linear infinite; }
.drum-face::before { content:''; position:absolute; inset: 12%; border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, rgba(255,255,255,.25), transparent 55%);
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.35); }
.drum-face::after { content:''; position:absolute; inset: 42%; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%,#334860,#0d1a2e);
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.5); }
.drum-face span { position: absolute; top: 50%; left: 50%; width: 4px; height: 45%;
  transform-origin: 50% 0; background: linear-gradient(180deg,rgba(0,0,0,.6),rgba(0,0,0,0));
  margin-left: -2px; margin-top: 0; }
@keyframes drumSpin { to { transform: rotate(360deg) } }

/* 传送带面 */
.belt-surface { position: absolute; inset: 30% 0; z-index: 2; overflow: hidden;
  background: linear-gradient(180deg, #1a2a48 0%, #0c1830 50%, #1a2a48 100%);
  border-top: 2px solid rgba(0,0,0,.5); border-bottom: 2px solid rgba(0,0,0,.5);
  box-shadow: inset 0 8px 16px rgba(0,0,0,.6), inset 0 -8px 16px rgba(0,0,0,.6); }
.belt-shadow-top { position: absolute; inset: 0 0 auto 0; height: 25%;
  background: linear-gradient(180deg, rgba(0,0,0,.55), transparent); pointer-events: none; z-index: 3; }
.belt-shadow-bot { position: absolute; inset: auto 0 0 0; height: 25%;
  background: linear-gradient(0deg, rgba(0,0,0,.55), transparent); pointer-events: none; z-index: 3; }
.belt-edge { position: absolute; inset: 45% 0 auto 0; height: 1px; background: rgba(255,255,255,.05); }

.belt-plates { position: absolute; inset: 0; display: flex; align-items: stretch;
  animation: platesSlide linear infinite; will-change: transform; }
.plate { flex: 0 0 auto; width: 6vh; height: 100%; margin-right: 2px; position: relative;
  background:
    linear-gradient(180deg, #3a5478 0%, #1e304d 45%, #253d5e 55%, #0e1a2e 100%);
  border-left: 1px solid rgba(255,255,255,.08);
  border-right: 1px solid rgba(0,0,0,.5);
  box-shadow: inset 0 2px 0 rgba(255,255,255,.1); }
.plate::before { content:''; position: absolute; top: 30%; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent); }
.plate::after { content:''; position: absolute; bottom: 30%; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,.5), transparent); }
@keyframes platesSlide { to { transform: translateX(-6.35vh); } }

/* 底部小滚轴排 */
.under-rollers { position: absolute; left: 3%; right: 3%; bottom: 8%; display: flex; justify-content: space-between; z-index: 1; }
.ur { width: 4vh; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%,#5c7fb0,#1a2a44,#0a1220);
  box-shadow: 0 4px 8px rgba(0,0,0,.6), inset 0 -3px 4px rgba(0,0,0,.4);
  position: relative; animation: drumSpin linear infinite; }
.ur::after { content:''; position: absolute; top: 50%; left: 50%; width: 2px; height: 40%;
  background: rgba(0,0,0,.5); transform-origin: 50% 0; margin-left: -1px; }

/* LED 方向箭头 */
.arrows { position: absolute; top: 8%; left: 50%; transform: translateX(-50%); display: flex; gap: 1.2vh;
  z-index: 4; opacity: .85; pointer-events: none; }
.arrows span { color: #4facfe; font-size: 2vh; text-shadow: 0 0 8px #4facfe; animation: arrowBlink 1.2s linear infinite; }
@keyframes arrowBlink { 0%,60% { opacity: .3 } 30% { opacity: 1 } }

/* 物品 */
.cargo { position: absolute; top: 50%; z-index: 20; touch-action: none;
  width: 12vh; height: 12vh; min-width: 90px; min-height: 90px;
  filter: drop-shadow(0 12px 16px rgba(0,0,0,.5)); }
.cargo.size-lg { width: 16vh; height: 16vh; min-width: 130px; min-height: 130px; }
.cargo.dragging { filter: drop-shadow(0 24px 30px rgba(0,0,0,.7)); }
.cargo-shadow { position: absolute; left: 10%; right: 10%; bottom: -18%; height: 8%; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%); z-index: -1; }

.emoji-item { width: 100%; height: 100%; border-radius: 22px;
  background: linear-gradient(180deg,#ffffff,#dae4f0);
  border: 1px solid rgba(255,255,255,.6);
  box-shadow:
    0 10px 24px rgba(0,0,0,.4),
    inset 0 -8px 14px rgba(0,0,0,.08),
    inset 0 2px 6px rgba(255,255,255,.9);
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px; }
.emoji { font-size: 5vh; line-height: 1; }
.ename { margin-top: 4px; font-size: 1.3vh; color: #05203c; font-weight: 700; letter-spacing: .05em; white-space: nowrap; }
.cargo.size-lg .emoji { font-size: 7.5vh; }
.cargo.size-lg .ename { font-size: 1.9vh; margin-top: 6px; }

.feedback { position: absolute; top: 40%; left: 50%; transform: translate(-50%,-50%);
  padding: 2vh 3vh; border-radius: 20px; text-align: center; z-index: 25;
  backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.feedback.correct { background: #ddf5e1; border: 2px solid #4c9967; color: #1c5c39; }
.feedback.wrong { background: #fce5e6; border: 2px solid #c3676b; color: #8c273a; }
.fb-ico { font-size: 5vh; font-weight: 900; line-height: 1; }
.fb-text { margin-top: .5vh; font-size: 1.8vh; letter-spacing: .1em; }
.fb-score { margin-top: .5vh; font-size: 2.4vh; font-weight: 900; color: inherit; }
.feedback-enter-active, .feedback-leave-active { transition: all .3s cubic-bezier(.2,.9,.3,1.2); }
.feedback-enter, .feedback-leave-to { opacity: 0; transform: translate(-50%,-40%) scale(.7); }

/* ==== 分类桶舞台 ==== */
.bins-stage { position: relative; flex: 1; margin-top: 4vh; padding-top: 2vh; }
.floor { position: absolute; left: -4vw; right: -4vw; bottom: 0; height: 60%;
  background:
    linear-gradient(180deg, transparent, rgba(80,180,255,.05) 30%, rgba(80,180,255,.08) 100%);
  border-top: 1px solid rgba(80,180,255,.15);
  mask-image: linear-gradient(180deg, black, black); }
.floor::before { content:''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(120,200,255,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120,200,255,.08) 1px, transparent 1px);
  background-size: 5vh 5vh;
  mask-image: linear-gradient(180deg, transparent, black); }

.bins-row { position: relative; display: flex; justify-content: space-around; align-items: flex-end;
  height: 100%; padding: 0 2%; gap: 3vw; z-index: 2; }
.bin { position: relative; flex: 1; max-width: 24vh; min-width: 130px; height: 100%;
  display: flex; flex-direction: column; align-items: center;
  transition: transform .25s cubic-bezier(.2,.9,.3,1.2); }
.bin.bin-size-lg { max-width: 30vh; min-width: 160px; }
.bin.hover { transform: translateY(-1.4vh) scale(1.05); }
.bin.drop { animation: binDrop .5s ease; }
@keyframes binDrop { 0%,100% { transform: translateY(0) } 40% { transform: translateY(1.2vh) scale(.96) } }

/* 盖子容器 —— 用 transform-origin 实现开盖旋转 */
.bin-lid-wrap { width: 108%; height: 14%; position: relative; z-index: 3;
  transform-origin: 0% 100%; /* 左下角为铰链 */
  transition: transform .35s cubic-bezier(.5,-.2,.2,1.4); }
.bin.hover .bin-lid-wrap { transform: rotate(-55deg) translateY(-5%); }
.bin-lid { width: 100%; height: 100%; background: var(--bg); filter: brightness(1.2);
  border-radius: 12px 12px 4px 4px;
  box-shadow: 0 6px 15px rgba(0,0,0,.4), inset 0 -4px 8px rgba(0,0,0,.2); position: relative; }
.handle { position: absolute; top: -35%; left: 32%; right: 32%; height: 40%; border-radius: 10px 10px 0 0;
  background: linear-gradient(180deg, rgba(255,255,255,.35), var(--c));
  border: 1px solid rgba(0,0,0,.25); box-shadow: 0 2px 6px rgba(0,0,0,.4); }

.bin-body { position: relative; width: 100%; flex: 1; background: var(--bg);
  border-radius: 4px 4px 20px 20px;
  box-shadow:
    0 20px 40px rgba(0,0,0,.5),
    inset 0 -30px 40px rgba(0,0,0,.3),
    inset 0 6px 12px rgba(255,255,255,.15);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 2.1vh; letter-spacing: .06em;
  text-shadow: 0 2px 8px rgba(0,0,0,.5); text-align: center; padding: 0 1vh; }
.bin.bin-size-lg .bin-body { font-size: 2.8vh; }
.bin-inner { position: absolute; top: 0; left: 6%; right: 6%; height: 22%;
  background: radial-gradient(ellipse at center 20%, rgba(0,0,0,.55), transparent 70%);
  border-radius: 0 0 50% 50%/0 0 100% 100%; pointer-events: none; }
.bin-shine { position: absolute; top: 8%; left: 10%; width: 22%; height: 65%; border-radius: 40%;
  background: linear-gradient(180deg, rgba(255,255,255,.4), transparent); filter: blur(4px); }
.bin-stripes { position: absolute; inset: 60% 0 20% 0; opacity: .12;
  background: repeating-linear-gradient(90deg, #000 0 6px, transparent 6px 20px); }
.bin-label { position: relative; z-index: 2; }
.bin-tag { position: absolute; top: 1.2vh; right: 1vh; font-size: 1.2vh; letter-spacing: .15em;
  color: rgba(255,255,255,.55); font-weight: 700;
  background: rgba(0,0,0,.25); padding: 2px 6px; border-radius: 4px; }

.bin-base { width: 112%; height: 4%; background: rgba(0,0,0,.5); border-radius: 4px 4px 10px 10px; margin-top: -1%;
  box-shadow: 0 6px 15px rgba(0,0,0,.5); }
.bin-ring { position: absolute; inset: -8% -6%; border-radius: 20px; border: 3px dashed var(--c);
  animation: ringPulse 1.1s ease-in-out infinite; box-shadow: 0 0 40px var(--c); pointer-events: none; }
@keyframes ringPulse { 0%,100% { opacity: .5; transform: scale(1) } 50% { opacity: 1; transform: scale(1.03) } }

/* ==== 倒计时 ==== */
.countdown { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center;
  background: rgba(238,247,234,.74); backdrop-filter: blur(6px); }
.cd-num { font-size: 20vh; font-weight: 900; letter-spacing: .1em;
  color: #245b60; animation: cdpulse .9s ease infinite; }
@keyframes cdpulse { 0% { opacity: 0; transform: scale(.6) } 60% { opacity: 1; transform: scale(1.15) } 100% { opacity: 1; transform: scale(1) } }

/* ==== 暂停弹窗 ==== */
.mask { position: absolute; inset: 0; background: rgba(3,10,22,.78); backdrop-filter: blur(10px);
  z-index: 60; display: flex; align-items: center; justify-content: center; }
.pause-modal { width: min(560px, 92vw); padding: 5vh 5vh; background: linear-gradient(180deg,#0e2447,#061128);
  border: 1px solid rgba(80,180,255,.35); border-radius: 24px; text-align: center;
  box-shadow: 0 30px 90px rgba(0,0,0,.6); }
.pause-icon { font-size: 8vh; color: #7ff0ff; text-shadow: 0 0 30px rgba(127,240,255,.4); }
.pause-modal h2 { margin: 1vh 0 1.5vh; font-size: 3vh; color: #eaf4ff; letter-spacing: .12em; font-weight: 700; }
.pause-modal p { margin: 0 0 4vh; color: #a0c4e8; font-size: 2vh; line-height: 1.6; }
.pbtns { display: flex; gap: 2vh; justify-content: center; flex-wrap: nowrap; }
.pbtn { flex: 1; max-width: 200px; padding: 2vh 3vh; border-radius: 12px; font-size: 2vh; font-weight: 700; cursor: pointer;
  background: linear-gradient(90deg,#4facfe,#00c8ff); color: #05203c; border: none; letter-spacing: .06em;
  box-shadow: 0 12px 30px rgba(79,172,254,.35); white-space: nowrap;
  transition: transform .2s ease, box-shadow .2s ease; }
.pbtn.danger { background: linear-gradient(90deg,#ff6b6b,#d9363e); color: #fff; box-shadow: 0 12px 30px rgba(255,107,107,.35); }
.pbtn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(79,172,254,.5); }
.pbtn.danger:hover { box-shadow: 0 16px 40px rgba(255,107,107,.5); }

@media (max-width: 900px) {
  .hud { grid-template-columns: 1fr; gap: 1.5vh; padding: 1.5vh 3vw; }
  .hud-center { order: -1; }
  .ruleboard { width: 100%; }
  .stat { min-width: 60px; padding: .8vh 1vh; }
  .stat .val { font-size: 2.2vh; }
  .factory { top: 26vh; }
  .conveyor { padding: 0 4vh; }
  .drum { width: 8vh; }
  .drum-l { left: -4vh; } .drum-r { right: -4vh; }
}
</style>
