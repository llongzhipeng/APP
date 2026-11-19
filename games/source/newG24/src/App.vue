<template>
  <div id="app" :class="{ 'lang-en': lang === 'en' }">
    <div class="stage" :style="stageStyle">

      <!-- ============ 首页 ============ -->
      <div v-if="page === 'home'" class="page home">
        <button class="lang-btn" @click="toggleLang">{{ t.lang }}</button>
        <h1 class="title">{{ t.title }}</h1>
        <div class="home-btns">
          <button class="big-btn primary" @click="goTutorial">{{ t.start }}</button>
          <button class="big-btn" @click="showRules = true">{{ t.rules }}</button>
          <button class="big-btn" @click="showHistory = true">{{ t.history }}</button>
          <button class="big-btn ghost">{{ t.skip }}</button>
        </div>
      </div>

      <!-- ============ 教程弹窗 ============ -->
      <div v-if="page === 'tutorial'" class="page tutorial">
        <div class="tutorial-card">
          <div class="tutorial-progress">
            <span v-for="(s, i) in t.tutorialSteps" :key="i"
                  :class="['dot', { active: i === tutorialStep }]"></span>
          </div>
          <div class="tutorial-demo">
            <!-- 左侧候选偏旁：第 3 步(index=2)出现，第 4 步(index=3)"女"已拖走 -->
            <div class="demo-side left">
              <div class="side-piece" v-if="tutorialStep >= 2 && tutorialStep < 3">女</div>
              <div class="side-piece placeholder" v-else-if="tutorialStep === 3"></div>
            </div>

            <!-- 中间米字格：使用与真实游戏一致的样式（横竖实线+斜虚线+同一 glyph 变轮廓） -->
            <div class="mizi-mini">
              <div class="mizi-mini-inner">
                <div class="mizi-char-mini"
                     :class="{ outline: tutorialStep >= 1 }"
                     :style="tutorialCharStyle">好</div>
              </div>
            </div>

            <!-- 右侧候选偏旁 -->
            <div class="demo-side right">
              <div class="side-piece" v-if="tutorialStep >= 2 && tutorialStep < 3">子</div>
              <div class="side-piece placeholder" v-else-if="tutorialStep === 3"></div>
            </div>
          </div>
          <p class="tutorial-text">{{ t.tutorialSteps[tutorialStep] }}</p>
          <div class="tutorial-btns">
            <button class="btn" v-if="tutorialStep > 0" @click="tutorialStep--">{{ t.prev }}</button>
            <button class="btn ghost" @click="onTutorialDone">{{ t.skipTutorial }}</button>
            <button class="btn primary" v-if="tutorialStep < t.tutorialSteps.length - 1" @click="tutorialStep++">{{ t.next }}</button>
            <button class="btn primary" v-else @click="onTutorialDone">{{ t.startNow }}</button>
          </div>
        </div>
      </div>

      <!-- ============ 时长选择 ============ -->
      <div v-if="page === 'duration'" class="page duration">
        <button class="lang-btn back-btn" @click="page='home'">{{ t.back }}</button>
        <h2 class="subtitle">{{ t.chooseDuration }}</h2>
        <div class="duration-btns">
          <button class="big-btn" :class="{active: pickedDur===180}" @click="pickedDur=180">{{ t.min3 }}</button>
          <button class="big-btn" :class="{active: pickedDur===300}" @click="pickedDur=300">{{ t.min5 }}</button>
          <button class="big-btn" :class="{active: pickedDur===600}" @click="pickedDur=600">{{ t.min10 }}</button>
        </div>
        <button class="big-btn primary" :disabled="!pickedDur" @click="startGame()">{{ t.startNow }}</button>
      </div>

      <!-- ============ 游戏页 ============ -->
      <div v-if="page === 'play'" class="page play">
        <div class="hud">
          <div class="hud-left">
            <div class="hud-item"><span>{{ t.difficulty }}</span><b>{{ level }}</b></div>
            <div class="hud-item"><span>{{ t.score }}</span><b>{{ score }}</b></div>
            <div class="hud-item"><span>{{ t.timeLeft }}</span><b>{{ formatTime(remaining) }}</b></div>
          </div>
          <div class="hud-req">{{ requirementText }}</div>
          <div class="hud-right">
            <button v-if="showBatchSkip" class="btn ghost" type="button" @click="onBatchSkip">{{ t.skipGame || '跳过' }}</button>
            <button class="btn" @click="pauseGame">{{ t.back }}</button>
          </div>
        </div>

        <div class="board">
          <div class="mizi">
            <div class="mizi-inner"
                 ref="miziInner"
                 @dragover.prevent
                 @drop="onDropAuto($event)">
              <!-- 记忆阶段：整字实心；答题阶段：同一个字变轮廓，
                   拖对哪半就把那半染成黑色（按字的偏旁分界比例，不是几何 50%） -->
              <div v-if="q" class="mizi-char"
                   :class="{
                     outline: phase !== 'memorize',
                     'fill-left':  !!filled.left,
                     'fill-right': !!filled.right
                   }"
                   :style="{ '--split': splitRatio + '%' }">
                {{ q.char }}
              </div>
              <!-- 错误反馈闪红 -->
              <div class="mizi-flash" :class="[flashSide]"></div>
            </div>
          </div>
          <div class="phase-bar">
            <div class="phase-bar-fill" :style="{ width: phaseProgress + '%' }"></div>
          </div>
          <div class="phase-tip">
            <template v-if="phase === 'memorize'">{{ t.memorize }}</template>
            <template v-else-if="phase === 'answer'">{{ t.assemble }}</template>
            <template v-else-if="phase === 'feedback'">{{ feedback }}</template>
          </div>
        </div>

        <div v-if="phase === 'answer' && q" class="sides">
          <div class="side left">
            <div v-for="(p, i) in leftAvailable" :key="'l'+i+p"
                 class="piece"
                 draggable="true"
                 @dragstart="onDragStart(p, 'left', $event)"
                 @touchstart="onTouchStart(p, 'left', $event)"
                 @touchmove="onTouchMove($event)"
                 @touchend="onTouchEnd($event)">
              {{ p }}
            </div>
          </div>
          <div class="side right">
            <div v-for="(p, i) in rightAvailable" :key="'r'+i+p"
                 class="piece"
                 draggable="true"
                 @dragstart="onDragStart(p, 'right', $event)"
                 @touchstart="onTouchStart(p, 'right', $event)"
                 @touchmove="onTouchMove($event)"
                 @touchend="onTouchEnd($event)">
              {{ p }}
            </div>
          </div>
        </div>

        <div v-if="paused" class="overlay">
          <div class="dialog">
            <p>{{ t.paused }}</p>
            <div class="dialog-btns">
              <button class="btn primary" @click="resumeGame">{{ t.resume }}</button>
              <button class="btn" @click="abortLeave">{{ t.quit }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 结算页 ============ -->
      <div v-if="page === 'result'" class="page result">
        <button class="lang-btn" @click="toggleLang">{{ t.lang }}</button>
        <h2 class="subtitle">{{ t.finalScore }}</h2>
        <div class="final-score">{{ score }}</div>
        <table class="record-table">
          <tr><th>{{ t.total }}</th><td>{{ stats.total }}</td></tr>
          <tr><th>{{ t.success }}</th><td>{{ stats.success }}</td></tr>
          <tr><th>{{ t.fail }}</th><td>{{ stats.fail }}</td></tr>
          <tr><th>{{ t.successRate }}</th><td>{{ successRate }}%</td></tr>
          <tr><th>{{ t.avgTime }}</th><td>{{ avgRt }} s</td></tr>
        </table>
        <div class="dialog-btns">
          <button class="btn primary" @click="restart">{{ t.playAgain }}</button>
          <button class="btn" @click="page='home'">{{ t.backHome }}</button>
        </div>
      </div>

      <!-- ============ 规则弹窗 ============ -->
      <div v-if="showRules" class="overlay">
        <div class="dialog wide">
          <h3>{{ t.rules }}</h3>
          <p style="text-align:left; line-height:1.6;">{{ t.rulesText }}</p>
          <div class="dialog-btns"><button class="btn primary" @click="showRules=false">{{ t.close }}</button></div>
        </div>
      </div>

      <!-- ============ 历史弹窗 ============ -->
      <div v-if="showHistory" class="overlay">
        <div class="dialog wide">
          <h3>{{ t.history }}</h3>
          <div v-if="history.length === 0" class="empty">{{ t.noRecord }}</div>
          <table v-else class="record-table history-table">
            <thead>
              <tr>
                <th>{{ t.trainTime }}</th>
                <th>{{ t.trainItem }}</th>
                <th>{{ t.trainLevel }}</th>
                <th>{{ t.duration }}</th>
                <th>{{ t.total }}</th>
                <th>{{ t.success }}</th>
                <th>{{ t.fail }}</th>
                <th>{{ t.successRate }}</th>
                <th>{{ t.avgTime }}</th>
                <th>{{ t.scoreCol }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in history" :key="i">
                <td>{{ r.time }}</td>
                <td>{{ t.game }}</td>
                <td>{{ r.maxLevel }}</td>
                <td>{{ r.duration }}s</td>
                <td>{{ r.total }}</td>
                <td>{{ r.success }}</td>
                <td>{{ r.fail }}</td>
                <td>{{ r.successRate }}%</td>
                <td>{{ r.avgRt }}s</td>
                <td>{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
          <div class="dialog-btns"><button class="btn primary" @click="showHistory=false">{{ t.close }}</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { I18N } from './i18n.js';
import { createWeights, updateWeight, generateQuestion } from './game/engine.js';
import { resolveVoice } from './assets.js';
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper';
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry';
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy';

const GAME_TYPE = 'hzxly';

export default {
  name: 'App',
  data() {
    return {
      lang: 'zh',
      page: 'home',
      showRules: false,
      showHistory: false,
      tutorialStep: 0,

      pickedDur: 180,
      duration: 180,
      remaining: 180,

      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      weights: null,
      q: null,
      phase: 'memorize',
      phaseTimer: null,
      phaseDeadline: 0,
      phaseProgress: 100,
      progressTimer: null,
      pausedAt: 0,

      filled: { left: '', right: '' },
      usedPieces: {},
      feedback: '',
      answerStart: 0,
      wrongAttempts: 0,
      flashSide: '',
      flashTimer: null,

      paused: false,
      gameTimer: null,

      windowTotal: 0,
      windowSuccess: 0,
      windowTimer: null,

      stats: { total: 0, success: 0, fail: 0, rtSum: 0 },
      maxLevelReached: 1,

      history: [],

      touchDrag: null,
      scaleFactor: 1,
      voiceAudio: null,
      archiveId: -1,
      showBatchSkip: false,
    };
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
    this.showBatchSkip = shouldShowPbBatchSkip();
  },
  computed: {
    t() { return I18N[this.lang]; },
    requirementText() { return this.t['reqL' + this.level]; },
    leftAvailable() {
      if (!this.q) return [];
      return this.q.leftOptions.filter(p => !this.usedPieces['L:'+p]);
    },
    rightAvailable() {
      if (!this.q) return [];
      return this.q.rightOptions.filter(p => !this.usedPieces['R:'+p]);
    },
    successRate() {
      return this.stats.total ? Math.round(this.stats.success / this.stats.total * 100) : 0;
    },
    avgRt() {
      return this.stats.success ? (this.stats.rtSum / this.stats.success).toFixed(2) : '0.00';
    },
    stageStyle() {
      return { transform: `translate(-50%, -50%) scale(${this.scaleFactor})` };
    },
    // 按左偏旁类型算切分比例：窄偏旁（忄/亻/氵…）占字宽 ~30%，一般 ~46%
    splitRatio() {
      if (!this.q) return 50;
      const narrow = new Set(['忄','亻','氵','冫','讠','礻','衤','弓','丬','阝']);
      const medium = new Set(['扌','女','口','日','目','木','禾','马','火','石','王','月','米','田','立','虫','车','贝','纟','饣','山','舟','矢','足','耳','酉','歹']);
      if (narrow.has(this.q.left)) return 30;
      if (medium.has(this.q.left)) return 46;
      return 50;
    },
    // 通过 CSS 类和 --split 变量控制染色，避免 :style 增量更新残留问题
    charFillStyle() {
      return {}; // 已废弃，仅为兼容旧引用（教程演示的 tutorialCharStyle 仍单独维护）
    },
    // 教程页演示"好"字的染色状态：step0 实心 / step1 轮廓 / step2 轮廓 / step3 已两侧染黑
    tutorialCharStyle() {
      if (this.tutorialStep < 1) return {};
      if (this.tutorialStep >= 3) {
        return {
          background: '#222',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextStroke: '0',
        };
      }
      return {};
    },
  },
  mounted() {
    this.loadHistory();
    this.resize();
    window.addEventListener('resize', this.resize);
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.pickedDur = dur; this.duration = dur; },
      openTutorial: () => { this.tutorialStep = 0; this.page = 'tutorial'; },
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
    this.clearAllTimers();
  },
  methods: {
    resize() {
      const baseW = 1280, baseH = 800;
      const sx = window.innerWidth / baseW;
      const sy = window.innerHeight / baseH;
      this.scaleFactor = Math.min(sx, sy);
    },
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh'; },
    goTutorial() { this.tutorialStep = 0; this.page = 'tutorial'; },
    goDurationPage() { this.page = 'duration'; },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => this.startGame(dur))) return;
      this.page = 'duration';
    },
    onBatchSkip() { skipPbBatchGame(); },

    /**
     * 开始一局游戏
     * @param {number} [dur] 训练时长（秒）；勿直接绑 @click="startGame"，否则会把 MouseEvent 当成时长
     */
    startGame(dur) {
      // 仅接受有效数字时长；点击事件 / NaN / 非法值一律忽略，沿用 pickedDur
      if (typeof dur === 'number' && Number.isFinite(dur) && dur > 0) {
        this.pickedDur = dur; // 本局选用的训练时长（秒）
      }
      this.duration = this.pickedDur; // 本局总时长（秒）
      this.remaining = this.pickedDur; // 剩余倒计时（秒）
      this.level = getBatchStartDifficultyForGame(GAME_TYPE);
      this.maxLevelReached = 1;
      this.score = 0;
      this.stats = { total: 0, success: 0, fail: 0, rtSum: 0 };
      this.weights = createWeights();
      this.paused = false;
      this.page = 'play';
      this.startGameTimer();
      this.startWindowTimer();
      this.nextQuestion();
    },

    startGameTimer() {
      this.clearIntervalByName('gameTimer');
      this.gameTimer = setInterval(() => {
        if (this.paused) return;
        this.remaining--;
        if (this.remaining <= 0) {
          this.remaining = 0;
          this.endGame();
        }
      }, 1000);
    },

    startWindowTimer() {
      this.windowTotal = 0;
      this.windowSuccess = 0;
      this.clearIntervalByName('windowTimer');
      this.windowTimer = setInterval(() => {
        if (this.paused) return;
        if (this.windowTotal >= 3) {
          const rate = this.windowSuccess / this.windowTotal;
          if (rate >= 0.9 && this.level < 9) this.level++;
          else if (rate < 0.7 && this.level > 1) this.level--;
          this.maxLevelReached = Math.max(this.maxLevelReached, this.level);
        }
        this.windowTotal = 0;
        this.windowSuccess = 0;
      }, 60000);
    },

    nextQuestion() {
      if (this.remaining <= 0) return;
      this.filled = { left: '', right: '' };
      this.usedPieces = {};
      this.feedback = '';
      this.wrongAttempts = 0;
      this.flashSide = '';
      this.q = generateQuestion(this.level, this.weights);
      this.phase = 'memorize';
      this.playVoice('memorize');
      this.startPhaseTimer(this.q.memoryTime * 1000, () => {
        this.phase = 'answer';
        this.answerStart = Date.now();
        this.playVoice('answer');
        this.startPhaseTimer(this.q.answerTime * 1000, () => this.onTimeout());
      });
    },

    // 播放阶段语音提示：中文 → voice/chinese/{1|2}.mp3；英文 → voice/english/{1|2}.mp3
    playVoice(phase) {
      try {
        const lang = this.lang === 'en' ? 'english' : 'chinese';
        const n = phase === 'memorize' ? 1 : 2;
        const url = resolveVoice(`/voice/${lang}/${n}.mp3`);
        if (this.voiceAudio) { this.voiceAudio.pause(); this.voiceAudio.currentTime = 0; }
        this.voiceAudio = new Audio(url);
        this.voiceAudio.play().catch(() => { /* 用户未交互或文件缺失时静默 */ });
      } catch (_) { /* ignore */ }
    },

    startPhaseTimer(ms, cb) {
      this.clearTimeoutByName('phaseTimer');
      this.clearIntervalByName('progressTimer');
      this.phaseDeadline = Date.now() + ms;
      this.phaseProgress = 100;
      const totalMs = ms;
      const tick = () => {
        if (this.paused) return;
        const left = this.phaseDeadline - Date.now();
        this.phaseProgress = Math.max(0, left / totalMs * 100);
        if (left <= 0) {
          this.clearIntervalByName('progressTimer');
          this.clearTimeoutByName('phaseTimer');
          cb();
        }
      };
      this.progressTimer = setInterval(tick, 50);
      this.phaseTimer = setTimeout(() => {
        // 由 tick 触发 cb，这里做保险
        if (this.phaseDeadline - Date.now() <= 0 && !this.paused) {
          this.clearIntervalByName('progressTimer');
          cb();
        }
      }, ms + 100);
    },

    onTimeout() {
      this.feedback = this.t.timeout;
      this.finishQuestion(false);
    },

    onDragStart(part, side, e) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ part, side }));
      e.dataTransfer.effectAllowed = 'move';
    },
    // 根据落点在米字格中的 x 位置决定放到左槽还是右槽
    sideFromPoint(clientX) {
      const el = this.$refs.miziInner;
      if (!el) return 'left';
      const rect = el.getBoundingClientRect();
      return clientX < rect.left + rect.width / 2 ? 'left' : 'right';
    },
    onDropAuto(e) {
      let data = {};
      try { data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}'); } catch (_) {}
      if (!data.part) return;
      const targetSide = this.sideFromPoint(e.clientX);
      this.placePart(data.part, data.side, targetSide);
    },

    onTouchStart(part, side, e) {
      const t = e.touches[0];
      const ghost = document.createElement('div');
      ghost.textContent = part;
      ghost.className = 'touch-ghost';
      ghost.style.left = t.clientX + 'px';
      ghost.style.top = t.clientY + 'px';
      document.body.appendChild(ghost);
      this.touchDrag = { part, side, ghost };
      e.preventDefault();
    },
    onTouchMove(e) {
      if (!this.touchDrag) return;
      const t = e.touches[0];
      this.touchDrag.ghost.style.left = t.clientX + 'px';
      this.touchDrag.ghost.style.top = t.clientY + 'px';
      e.preventDefault();
    },
    onTouchEnd(e) {
      if (!this.touchDrag) return;
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      const inMizi = el && el.closest && el.closest('.mizi-inner');
      if (inMizi) {
        const targetSide = this.sideFromPoint(t.clientX);
        this.placePart(this.touchDrag.part, this.touchDrag.side, targetSide);
      }
      document.body.removeChild(this.touchDrag.ghost);
      this.touchDrag = null;
    },

    placePart(part, fromSide, targetSide) {
      if (this.phase !== 'answer') return;
      if (this.filled[targetSide]) return;
      const correctPart = targetSide === 'left' ? this.q.left : this.q.right;
      if (part !== correctPart) {
        // 拖错：立即判负，闪红后进入下一题
        this.flashSide = targetSide;
        if (this.flashTimer) clearTimeout(this.flashTimer);
        this.flashTimer = setTimeout(() => { this.flashSide = ''; }, 400);
        this.feedback = this.t.wrong;
        this.finishQuestion(false);
        return;
      }
      // 拖对：填入（用于点亮该半边轮廓）
      this.$set(this.filled, targetSide, part);
      this.$set(this.usedPieces, (fromSide === 'left' ? 'L:' : 'R:') + part, true);
      if (this.filled.left && this.filled.right) {
        // 两侧都对了 —— 完成本题
        this.feedback = this.t.correct;
        this.finishQuestion(true);
      }
    },

    fillStatus(side) {
      if (this.phase !== 'feedback') return '';
      if (!this.filled[side]) return '';
      const correct = this.filled[side] === (side === 'left' ? this.q.left : this.q.right);
      return correct ? 'ok' : 'bad';
    },

    finishQuestion(ok) {
      this.clearTimeoutByName('phaseTimer');
      this.clearIntervalByName('progressTimer');
      this.phase = 'feedback';

      const rt = (Date.now() - this.answerStart) / 1000;
      this.stats.total++;
      this.windowTotal++;
      if (ok) {
        this.stats.success++;
        this.stats.rtSum += rt;
        this.windowSuccess++;
        this.score += Math.round(5 * this.q.scoreMultiplier);
      } else {
        this.stats.fail++;
      }
      updateWeight(this.weights, this.q.char, ok);

      setTimeout(() => {
        if (!this.paused && this.page === 'play' && this.remaining > 0) this.nextQuestion();
      }, 1200);
    },

    pauseGame() {
      this.paused = true;
      this.pausedAt = Date.now();
      if (this.voiceAudio) { try { this.voiceAudio.pause(); } catch (_) {} }
    },
    resumeGame() {
      if (this.pausedAt && this.phaseDeadline) {
        const delta = Date.now() - this.pausedAt;
        this.phaseDeadline += delta;
      }
      this.paused = false;
      this.pausedAt = 0;
      if (this.voiceAudio) { try { this.voiceAudio.play().catch(() => {}); } catch (_) {} }
    },

    endGame() {
      this.clearAllTimers();
      this.stopVoice();
      this.paused = false;
      this.saveRecord();
      const avgRaw = this.stats.success ? (this.stats.rtSum / this.stats.success) : 0;
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgRaw),
        score: this.score ? Math.round(this.score) : 0,
        successCount: this.stats.success || 0,
        failCount: this.stats.fail || 0,
        trainDuration: this.duration,
        difficultyLevel: this.level || 1,
      });
      this.page = 'result';
    },
    abortLeave() {
      this.clearAllTimers();
      this.stopVoice();
      this.paused = false;
      leavePbGameWindow({ confirm: false });
    },
    stopVoice() {
      if (this.voiceAudio) {
        try { this.voiceAudio.pause(); } catch (_) {}
        this.voiceAudio = null;
      }
    },

    restart() {
      this.pickedDur = this.duration;
      this.page = 'duration';
    },

    loadHistory() {
      try {
        const raw = localStorage.getItem('hanzi_history');
        this.history = raw ? JSON.parse(raw) : [];
      } catch (_) { this.history = []; }
    },
    saveRecord() {
      const rec = {
        time: new Date().toLocaleString(),
        maxLevel: this.maxLevelReached,
        duration: this.duration,
        total: this.stats.total,
        success: this.stats.success,
        fail: this.stats.fail,
        successRate: this.successRate,
        avgRt: this.avgRt,
        score: this.score,
      };
      this.history.unshift(rec);
      this.history = this.history.slice(0, 30);
      try { localStorage.setItem('hanzi_history', JSON.stringify(this.history)); } catch (_) {}
    },

    formatTime(s) {
      const m = Math.floor(s / 60), sec = s % 60;
      return `${m}:${sec.toString().padStart(2, '0')}`;
    },
    clearTimeoutByName(name) { if (this[name]) { clearTimeout(this[name]); this[name] = null; } },
    clearIntervalByName(name) { if (this[name]) { clearInterval(this[name]); this[name] = null; } },
    clearAllTimers() {
      this.clearIntervalByName('gameTimer');
      this.clearIntervalByName('windowTimer');
      this.clearIntervalByName('progressTimer');
      this.clearTimeoutByName('phaseTimer');
    },
  },
};
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #3d2b14;
  user-select: none;
  -webkit-user-select: none;
}
#app { position: relative; }
.stage {
  position: absolute; left: 50%; top: 50%;
  width: 1280px; height: 800px;
  transform-origin: center center;
  background: linear-gradient(135deg, #fdf6e3 0%, #eee1c4 100%);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  border-radius: 12px;
  overflow: hidden;
}

.btn, .big-btn {
  border: none; cursor: pointer;
  font-size: 20px; padding: 10px 24px;
  border-radius: 10px;
  background: #f0dcb2; color: #5b3f1a;
  transition: transform .15s, box-shadow .15s;
  box-shadow: 0 3px 0 #c0a370;
  font-weight: 600;
  font-family: inherit;
}
.btn:hover, .big-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 0 #c0a370; }
.btn:active, .big-btn:active { transform: translateY(1px); box-shadow: 0 1px 0 #c0a370; }
.btn:disabled, .big-btn:disabled { opacity: .5; cursor: not-allowed; }
.big-btn { font-size: 24px; padding: 16px 40px; min-width: 220px; }
.primary { background: #d97757; color: #fff; box-shadow: 0 3px 0 #a04d33; }
.primary:hover { box-shadow: 0 5px 0 #a04d33; }
.ghost { background: transparent; box-shadow: none; color: #6b4a1e; text-decoration: underline; }
.big-btn.active { outline: 4px solid #d97757; }

.page {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 30px; padding: 40px;
}
.lang-btn {
  position: absolute; top: 20px; right: 20px;
  padding: 8px 20px; border-radius: 20px;
  border: 2px solid #b8895a; background: #fff8e7; color: #5b3f1a;
  font-size: 16px; cursor: pointer; font-weight: 600;
  font-family: inherit;
}
.back-btn { left: 20px; right: auto; }
.title { font-size: 64px; color: #5b3f1a; letter-spacing: 8px; text-shadow: 2px 2px 0 #d4b98a; }
.subtitle { font-size: 40px; color: #5b3f1a; }
.home-btns { display: flex; flex-direction: column; gap: 20px; }
.duration-btns { display: flex; flex-direction: row; gap: 20px; }

.tutorial-card {
  background: #fff8e7; padding: 40px; border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex; flex-direction: column; align-items: center; gap: 24px;
  width: 780px;
}
.tutorial-progress { display: flex; gap: 10px; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: #d4b98a; transition: all .2s; }
.dot.active { background: #d97757; transform: scale(1.3); }
.tutorial-demo { display: flex; gap: 40px; align-items: center; justify-content: center; min-height: 240px; }

/* 教程米字格：与真实游戏保持一致 —— 深色边框、横竖实线 + 斜虚线（SVG） */
.mizi-mini {
  width: 220px; height: 220px;
  background: #fff; border: 3px solid #2d3a55;
  position: relative;
  display: flex; align-items: center; justify-content: center;
}
.mizi-mini-inner {
  width: 100%; height: 100%; position: relative;
  display: flex; align-items: center; justify-content: center;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><line x1='50' y1='0' x2='50' y2='100' stroke='%23f4b6a0' stroke-width='0.6'/><line x1='0' y1='50' x2='100' y2='50' stroke='%23f4b6a0' stroke-width='0.6'/><line x1='0' y1='0' x2='100' y2='100' stroke='%23f4b6a0' stroke-width='0.5' stroke-dasharray='2,1.5'/><line x1='100' y1='0' x2='0' y2='100' stroke='%23f4b6a0' stroke-width='0.5' stroke-dasharray='2,1.5'/></svg>");
  background-size: 100% 100%; background-repeat: no-repeat;
}
/* 汉字：默认实心，加 .outline 后变灰色空心，位置不动 —— 与真实游戏同一套机制 */
.mizi-char-mini {
  font-size: 150px; color: #222; font-weight: 800; z-index: 2;
  line-height: 1; user-select: none;
  transition: color .3s ease, -webkit-text-stroke-color .3s ease;
}
.mizi-char-mini.outline {
  color: transparent;
  -webkit-text-stroke: 2px #888;
  text-stroke: 2px #888;
}
/* 左右候选偏旁列（与真实游戏侧边风格一致） */
.demo-side {
  display: flex; flex-direction: column; gap: 16px;
  min-width: 80px; align-items: center;
}
.side-piece {
  width: 80px; height: 80px; border-radius: 12px;
  background: #d9b47a; color: #4a3218;
  display: flex; align-items: center; justify-content: center;
  font-size: 46px; font-weight: 800; box-shadow: 0 4px 0 #a08050;
}
.side-piece.placeholder {
  background: transparent; box-shadow: none;
  border: 2px dashed #c9a878;
  color: transparent;
}
.tutorial-text { font-size: 20px; color: #5b3f1a; text-align: center; line-height: 1.5; min-height: 60px; }
.tutorial-btns { display: flex; gap: 16px; }

.play { padding: 20px 30px; justify-content: flex-start; gap: 16px; }
.hud {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: rgba(91,63,26,0.08); padding: 12px 20px; border-radius: 12px;
}
.hud-left { display: flex; gap: 30px; }
.hud-item { display: flex; flex-direction: column; align-items: center; }
.hud-item span { font-size: 14px; color: #7a5a2e; }
.hud-item b { font-size: 26px; color: #5b3f1a; }
.hud-req { font-size: 18px; color: #5b3f1a; font-weight: 600; text-align: center; flex: 1; padding: 0 20px; }

.board {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; width: 100%; position: relative; z-index: 5;
}
.mizi {
  width: 380px; height: 380px;
  background: #2c3e50;
  border: 8px solid #3d2b14;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 0 40px rgba(0,0,0,0.4);
}
.mizi-inner {
  width: 100%; height: 100%;
  background: #fff;
  border: 2px solid #333;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  /* 横竖实线 + 两条斜虚线，用 SVG 保证等比铺满 */
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><line x1='50' y1='0' x2='50' y2='100' stroke='%23f4b6a0' stroke-width='0.6'/><line x1='0' y1='50' x2='100' y2='50' stroke='%23f4b6a0' stroke-width='0.6'/><line x1='0' y1='0' x2='100' y2='100' stroke='%23f4b6a0' stroke-width='0.5' stroke-dasharray='2,1.5'/><line x1='100' y1='0' x2='0' y2='100' stroke='%23f4b6a0' stroke-width='0.5' stroke-dasharray='2,1.5'/></svg>");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.mizi-char {
  font-size: 220px; font-weight: 800; color: #222; z-index: 2;
  transition: color .35s ease, -webkit-text-stroke-color .35s ease;
  line-height: 1; user-select: none;
}
/* 答题阶段：整字变成灰色轮廓（同一个 glyph、同一个位置、同一个字号，跟原字一模一样，只是变轮廓） */
.mizi-char.outline {
  color: transparent;
  -webkit-text-stroke: 2px #888;
  text-stroke: 2px #888;
  transition: color .3s ease, -webkit-text-stroke-color .3s ease;
}
/* 拖对左半：按 --split（每字自适应的偏旁分界比例）把左侧染黑，右侧仍为轮廓 */
.mizi-char.outline.fill-left {
  background-image: linear-gradient(to right,
    #222 0, #222 var(--split, 50%),
    transparent var(--split, 50%), transparent 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
/* 拖对右半 */
.mizi-char.outline.fill-right {
  background-image: linear-gradient(to right,
    transparent 0, transparent var(--split, 50%),
    #222 var(--split, 50%), #222 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
/* 两侧都对：整字染黑，去掉描边 */
.mizi-char.outline.fill-left.fill-right {
  background-image: none;
  background-color: #222;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-stroke: 0;
}
/* 错误闪红：覆盖对应半边一层红光后自动消失 */
.mizi-flash {
  position: absolute; inset: 0; z-index: 4;
  pointer-events: none;
}
.mizi-flash.left::before,
.mizi-flash.right::before {
  content: ''; position: absolute; top: 0; bottom: 0; width: 50%;
  background: rgba(220, 60, 60, 0.28);
  animation: flashFade .4s ease forwards;
}
.mizi-flash.left::before  { left: 0; }
.mizi-flash.right::before { right: 0; }
@keyframes flashFade {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

.phase-bar {
  width: 400px; height: 10px; background: #d4b98a;
  border-radius: 5px; overflow: hidden;
}
.phase-bar-fill { height: 100%; background: #d97757; transition: width .05s linear; }
.phase-tip { font-size: 22px; color: #5b3f1a; font-weight: 600; min-height: 30px; }

.sides {
  position: absolute; left: 0; right: 0; top: 120px; bottom: 20px;
  display: flex; justify-content: space-between; padding: 0 30px;
  pointer-events: none;
  z-index: 10;
}
.side {
  display: flex; flex-direction: column; gap: 14px;
  justify-content: center; pointer-events: auto;
  max-width: 220px; flex-wrap: wrap;
}
.piece {
  width: 90px; height: 90px; border-radius: 14px;
  background: linear-gradient(135deg, #f0dcb2, #d4b98a);
  color: #3d2b14;
  display: flex; align-items: center; justify-content: center;
  font-size: 52px; font-weight: 800;
  cursor: grab; box-shadow: 0 4px 0 #a08560, 0 8px 15px rgba(0,0,0,0.2);
  border: 3px solid #a08560;
  transition: transform .15s;
  touch-action: none;
}
.piece:hover { transform: scale(1.08); }
.piece:active { cursor: grabbing; transform: scale(0.95); }
.touch-ghost {
  position: fixed; z-index: 9999; pointer-events: none;
  width: 90px; height: 90px; margin-left: -45px; margin-top: -45px;
  border-radius: 14px; background: #d97757; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 52px; font-weight: 800;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
}

.overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.dialog {
  background: #fff8e7; padding: 40px; border-radius: 16px;
  min-width: 400px; text-align: center;
  display: flex; flex-direction: column; gap: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}
.dialog.wide { min-width: 700px; max-width: 900px; max-height: 640px; overflow: auto; }
.dialog h3 { font-size: 28px; color: #5b3f1a; }
.dialog p { font-size: 20px; color: #5b3f1a; }
.dialog-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

.final-score { font-size: 120px; color: #d97757; font-weight: 800; line-height: 1; }
.record-table { border-collapse: collapse; margin: 0 auto; }
.record-table th, .record-table td {
  padding: 10px 20px; border: 1px solid #d4b98a;
  font-size: 18px; color: #5b3f1a;
}
.record-table th { background: #f0dcb2; }
.history-table th, .history-table td { font-size: 13px; padding: 6px 8px; }
.empty { padding: 40px; color: #7a5a2e; font-size: 18px; }

.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
