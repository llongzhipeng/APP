<template>
  <div id="app" class="app-root">
    <!-- Night sky background -->
    <div class="sky">
      <div class="stars stars-1"></div>
      <div class="stars stars-2"></div>
      <div class="stars stars-3"></div>
      <div class="moon"></div>
      <div class="city"></div>
    </div>

    <!-- Language switcher (hidden in-game) -->
    <button
      v-if="view !== 'game'"
      class="lang-btn"
      @click="toggleLang"
      :aria-label="t.langAria"
    >
      <span class="lang-icon">🌐</span>
      <span class="lang-text">{{ lang === 'zh' ? 'EN' : '中文' }}</span>
    </button>

    <!-- ========== HOME ========== -->
    <transition name="fade">
      <section v-if="view === 'home'" class="view home">
        <div class="title-wrap">
          <h1 class="game-title">
            <span class="title-icon">🎆</span>
            <span class="title-text">{{ t.gameTitle }}</span>
          </h1>
          <p class="subtitle">{{ t.subtitle }}</p>
        </div>
        <div class="home-buttons">
          <button class="btn btn-primary" @click="startFlow">
            <span class="btn-glow"></span>
            <span class="btn-label">▶ {{ t.startGame }}</span>
          </button>
          <button class="btn btn-secondary" @click="view = 'rules'">
            <span class="btn-label">📖 {{ t.rules }}</span>
          </button>
          <button class="btn btn-secondary" @click="openHistory">
            <span class="btn-label">📊 {{ t.history }}</span>
          </button>
        </div>
      </section>
    </transition>

    <!-- ========== RULES ========== -->
    <transition name="fade">
      <section v-if="view === 'rules'" class="view panel-view" @click.self="view = 'home'">
        <div class="glass-card">
          <h2 class="card-title">📖 {{ t.rules }}</h2>
          <div class="rules-content">
            <p>{{ t.rulesIntro }}</p>
            <div class="difficulty-table">
              <div class="dt-head">
                <span>{{ t.difficulty }}</span>
                <span>{{ t.sparkRange }}</span>
                <span>{{ t.showTime }}</span>
                <span>{{ t.coef }}</span>
              </div>
              <div v-for="d in difficulties" :key="d.level" class="dt-row">
                <span class="lvl-badge">Lv.{{ d.level }}</span>
                <span>{{ d.min }}-{{ d.max }}</span>
                <span>{{ d.showTime }}s</span>
                <span>×{{ d.coef }}</span>
              </div>
            </div>
            <ul class="rule-list">
              <li>⏱️ {{ t.rule1 }}</li>
              <li>🎯 {{ t.rule2 }}</li>
              <li>🏆 {{ t.rule3 }}</li>
            </ul>
          </div>
          <button class="btn btn-back" @click="view = 'home'">← {{ t.back }}</button>
        </div>
      </section>
    </transition>

    <!-- ========== TUTORIAL ========== -->
    <transition name="fade">
      <section v-if="view === 'tutorial'" class="view panel-view">
        <div class="glass-card tutorial-card">
          <div class="tut-header">
            <h2 class="card-title">{{ t.tutorial }} ({{ tutStep + 1 }}/4)</h2>
            <button class="skip-btn" @click="finishTutorial">{{ t.skip }} ›</button>
          </div>

          <div class="tut-stage">
            <div v-if="tutStep === 0" class="tut-content">
              <div class="tut-fw-area">
                <FireworkBurst :count="4" :animate="true" :key="'tut0-'+tutAnim" />
              </div>
              <div class="tut-caption">👀 {{ t.tut1 }}</div>
            </div>
            <div v-if="tutStep === 1" class="tut-content">
              <div class="tut-fw-area">
                <FireworkBurst :count="4" :animate="false" :staticMode="true" :highlight="true" />
                <div class="tut-count-badge">4</div>
              </div>
              <div class="tut-caption">🔢 {{ t.tut2 }}</div>
            </div>
            <div v-if="tutStep === 2" class="tut-content">
              <div class="tut-options-demo">
                <button class="opt-btn opt-demo">3</button>
                <button class="opt-btn opt-demo opt-correct-demo">4 ✓</button>
                <button class="opt-btn opt-demo">5</button>
                <button class="opt-btn opt-demo">6</button>
              </div>
              <div class="tut-caption">👆 {{ t.tut3 }}</div>
            </div>
            <div v-if="tutStep === 3" class="tut-content">
              <div class="tut-score-demo">
                <div class="score-chip">+5 {{ t.pts }}</div>
                <div class="score-arrow">➜</div>
                <div class="score-chip score-chip-big">+17.5 {{ t.pts }}</div>
              </div>
              <div class="tut-caption">🏆 {{ t.tut4 }}</div>
            </div>
          </div>

          <div class="tut-controls">
            <button class="btn btn-secondary btn-sm" :disabled="tutStep === 0" @click="tutPrev">‹ {{ t.prev }}</button>
            <div class="tut-dots">
              <span v-for="i in 4" :key="i" class="dot" :class="{ active: tutStep === i-1 }"></span>
            </div>
            <button v-if="tutStep < 3" class="btn btn-primary btn-sm" @click="tutNext">{{ t.next }} ›</button>
            <button v-else class="btn btn-primary btn-sm" @click="finishTutorial">{{ t.start }} ▶</button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ========== DURATION SELECT ========== -->
    <transition name="fade">
      <section v-if="view === 'duration'" class="view panel-view">
        <div class="glass-card">
          <h2 class="card-title">⏱ {{ t.chooseDuration }}</h2>
          <div class="duration-grid">
            <button
              v-for="d in [1,3,5]"
              :key="d"
              class="dur-card"
              :class="{ selected: selectedDuration === d }"
              @click="selectedDuration = d"
            >
              <div class="dur-num">{{ d }}</div>
              <div class="dur-unit">{{ t.min }}</div>
              <div class="dur-desc">{{ d === 1 ? t.quick : d === 3 ? t.standard : t.deep }}</div>
            </button>
          </div>
          <div class="dur-actions">
            <button class="btn btn-back" @click="view = 'home'">← {{ t.back }}</button>
            <button class="btn btn-primary" :disabled="!selectedDuration" @click="beginGame">
              ▶ {{ t.startGame }}
            </button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ========== GAME ========== -->
    <transition name="fade">
      <section v-if="view === 'game'" class="view game-view">
        <div class="hud hud-left">
          <div class="hud-item">
            <div class="hud-label">{{ t.difficulty }}</div>
            <div class="hud-value">Lv.{{ game.difficulty }}</div>
          </div>
          <div class="hud-item">
            <div class="hud-label">{{ t.score }}</div>
            <div class="hud-value hud-score">{{ game.score.toFixed(1) }}</div>
          </div>
          <div class="hud-item">
            <div class="hud-label">{{ t.timeLeft }}</div>
            <div class="hud-value" :class="{ warn: game.timeLeft <= 10 }">
              {{ formatTime(game.timeLeft) }}
            </div>
          </div>
        </div>

        <div class="hud hud-right">
          <button v-if="showBatchSkip" class="hud-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
          <button class="hud-btn" @click="requestPause('back')">✕ {{ t.back }}</button>
        </div>

        <div class="game-prompt">
          <div class="prompt-badge">{{ t.prompt }}</div>
        </div>

        <div class="fw-stage">
          <FireworkBurst
            v-if="game.showFireworks"
            :key="'q-'+game.questionId+'-'+game.fireworkKey"
            :count="game.currentCount"
            :animate="true"
          />
          <div v-if="game.feedback" class="feedback" :class="'feedback-'+game.feedback.type">
            <div class="fb-icon">{{ game.feedback.type === 'correct' ? '✓' : game.feedback.type === 'wrong' ? '✗' : '⏰' }}</div>
            <div class="fb-text">
              {{ game.feedback.type === 'correct' ? t.correct : game.feedback.type === 'wrong' ? t.wrong : t.timeup }}
              <span v-if="game.feedback.type !== 'correct'" class="fb-ans">{{ t.answer }}: {{ game.currentCount }}</span>
            </div>
          </div>
        </div>

        <div v-if="game.showOptions" class="options-panel">
          <div class="options-title">{{ t.chooseCount }}</div>
          <div class="options-row">
            <button
              v-for="opt in game.options"
              :key="opt"
              class="opt-btn"
              :class="{
                'opt-correct': game.answered && opt === game.currentCount,
                'opt-wrong': game.answered && opt === game.userAnswer && opt !== game.currentCount
              }"
              :disabled="game.answered"
              @click="submitAnswer(opt)"
            >
              {{ opt }}
            </button>
          </div>
          <div class="answer-timer">
            <div class="atimer-fill" :style="{ width: (game.answerTimeLeft / 15 * 100) + '%' }"></div>
          </div>
        </div>

        <transition name="fade">
          <div v-if="game.paused" class="modal-mask">
            <div class="glass-card modal-card">
              <h3 class="modal-title">⏸ {{ t.paused }}</h3>
              <p class="modal-text">{{ game.pauseReason === 'back' ? t.confirmBack : t.confirmSkip }}</p>
              <div class="modal-actions">
                <button class="btn btn-secondary btn-sm" @click="resumeGame">{{ t.cancel }} · {{ t.continueGame }}</button>
                <button class="btn btn-primary btn-sm" @click="confirmLeave">✓ {{ t.confirm }}</button>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </transition>

    <!-- ========== RESULT ========== -->
    <transition name="fade">
      <section v-if="view === 'result'" class="view panel-view">
        <div class="glass-card result-card">
          <div class="result-crown">🏆</div>
          <h2 class="card-title">{{ t.trainingComplete }}</h2>
          <div class="result-score">
            <div class="rs-label">{{ t.finalScore }}</div>
            <div class="rs-value">{{ lastResult.score.toFixed(1) }}</div>
          </div>
          <div class="result-grid">
            <div class="rg-item"><div class="rg-label">{{ t.total }}</div><div class="rg-val">{{ lastResult.total }}</div></div>
            <div class="rg-item"><div class="rg-label">{{ t.correctCount }}</div><div class="rg-val">{{ lastResult.correct }}</div></div>
            <div class="rg-item"><div class="rg-label">{{ t.wrongCount }}</div><div class="rg-val">{{ lastResult.wrong }}</div></div>
            <div class="rg-item"><div class="rg-label">{{ t.accuracy }}</div><div class="rg-val">{{ lastResult.acc }}%</div></div>
            <div class="rg-item"><div class="rg-label">{{ t.avgRt }}</div><div class="rg-val">{{ lastResult.avgRt }}s</div></div>
            <div class="rg-item"><div class="rg-label">{{ t.duration }}</div><div class="rg-val">{{ lastResult.durationMin }}{{ t.min }}</div></div>
          </div>
          <div class="dur-actions">
            <button class="btn btn-secondary" @click="view = 'home'">🏠 {{ t.home }}</button>
            <button class="btn btn-primary" @click="startFlow">🔄 {{ t.playAgain }}</button>
          </div>
        </div>
      </section>
    </transition>

    <!-- ========== HISTORY ========== -->
    <transition name="fade">
      <section v-if="view === 'history'" class="view panel-view" @click.self="view = 'home'">
        <div class="glass-card history-card">
          <h2 class="card-title">📊 {{ t.history }}</h2>
          <div v-if="!history.length" class="history-empty">
            <div class="empty-icon">📭</div>
            <div>{{ t.noHistory }}</div>
          </div>
          <div v-else class="history-table-wrap">
            <table class="history-table">
              <thead>
                <tr>
                  <th>{{ t.time }}</th>
                  <th>{{ t.project }}</th>
                  <th>{{ t.difficulty }}</th>
                  <th>{{ t.duration }}</th>
                  <th>{{ t.total }}</th>
                  <th>{{ t.correctCount }}</th>
                  <th>{{ t.wrongCount }}</th>
                  <th>{{ t.accuracy }}</th>
                  <th>{{ t.avgRt }}</th>
                  <th>{{ t.score }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(h, i) in history" :key="i">
                  <td>{{ h.time }}</td>
                  <td>{{ lang === 'zh' ? '烟花计数器' : 'Firework Counter' }}</td>
                  <td>Lv.{{ h.finalDifficulty }}</td>
                  <td>{{ h.durationMin }}{{ t.min }}</td>
                  <td>{{ h.total }}</td>
                  <td>{{ h.correct }}</td>
                  <td>{{ h.wrong }}</td>
                  <td>{{ h.acc }}%</td>
                  <td>{{ h.avgRt }}s</td>
                  <td class="td-score">{{ Number(h.score).toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="dur-actions">
            <button class="btn btn-back" @click="view = 'home'">← {{ t.back }}</button>
            <button v-if="history.length" class="btn btn-secondary btn-sm" @click="clearHistory">🗑 {{ t.clearHistory }}</button>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper';
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry';
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy';

// ---------- Firework Burst Component (Canvas-based, realistic) ----------
// A real firework: rocket launches from bottom, bursts, N sparks fly out
// with gravity, air drag, and glowing trails. Number of sparks equals `count`
// so the player can actually count them.
const PALETTE = [
  { core: '#fff2c8', c1: '#ffd166', c2: '#ff8a3d' }, // gold
  { core: '#ffe0ec', c1: '#ff6b9d', c2: '#c026d3' }, // pink
  { core: '#e0f2ff', c1: '#7bdff2', c2: '#2563eb' }, // blue
  { core: '#ecdcff', c1: '#c084fc', c2: '#7c3aed' }, // purple
  { core: '#e0ffe8', c1: '#84fab0', c2: '#059669' }, // green
  { core: '#ffe4d0', c1: '#ff8a5b', c2: '#dc2626' }, // red
  { core: '#e6fff9', c1: '#5eead4', c2: '#0891b2' }, // teal
  { core: '#fff4b8', c1: '#fde047', c2: '#ca8a04' }, // yellow
];

const FireworkBurst = {
  name: 'FireworkBurst',
  props: {
    count: { type: Number, required: true },
    animate: { type: Boolean, default: true },
    // When staticMode is true, render a frozen "post-burst" frame so the
    // sparks are clearly countable (used by the tutorial).
    staticMode: { type: Boolean, default: false },
    highlight: { type: Boolean, default: false },
  },
  data() {
    return {
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      w: 0,
      h: 0,
    };
  },
  mounted() {
    this.canvas = this.$refs.cv;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.$el);
    this.reset();
    this.raf = requestAnimationFrame(this.loop);
  },
  beforeDestroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect();
  },
  watch: {
    count() { this.reset(); },
  },
  methods: {
    resize() {
      const rect = this.$el.getBoundingClientRect();
      this.w = rect.width;
      this.h = rect.height;
      this.canvas.width = Math.max(1, Math.floor(this.w * this.dpr));
      this.canvas.height = Math.max(1, Math.floor(this.h * this.dpr));
      this.canvas.style.width = this.w + 'px';
      this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },
    reset() {
      // Choose one color palette per firework so all sparks share a theme
      // (this is how real chrysanthemum fireworks look — easy to count).
      this.palette = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.startTime = performance.now();
      // Target burst point (upper-middle of canvas)
      this.burstX = 0.5;         // relative to width
      this.burstY = 0.42;        // relative to height
      // Rocket
      this.rocket = {
        x: this.burstX,
        y: 1.0,
        trail: [],
      };
      this.exploded = false;
      this.sparks = [];
      this.flashT = 0;

      if (this.staticMode) {
        // Skip straight to the post-burst frame at t≈0.9s
        this.exploded = true;
        this.buildSparks();
        this.simulateTo(0.9);
        this.flashT = 0;
      }
    },
    buildSparks() {
      const n = this.count;
      const sparks = [];
      // Base speed scaled so sparks fit the stage regardless of size.
      // vmin-ish: use short edge as reference
      const ref = Math.min(this.w, this.h);
      const baseSpeed = ref * 0.32; // px per second
      for (let i = 0; i < n; i++) {
        // Evenly distributed angles + small jitter → chrysanthemum shape
        const a = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * (Math.PI / (n * 2 + 2));
        // Slight speed variance so it looks organic
        const v = baseSpeed * (0.88 + Math.random() * 0.24);
        sparks.push({
          x: this.burstX * this.w,
          y: this.burstY * this.h,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1.6 + Math.random() * 0.5, // seconds
          age: 0,
          trail: [],
          hueShift: (Math.random() - 0.5) * 0.15,
          sparkle: Math.random() < 0.6, // some sparks twinkle at the end
        });
      }
      this.sparks = sparks;
    },
    // Advance particle physics by dt (seconds)
    stepSparks(dt) {
      const gravity = Math.min(this.w, this.h) * 0.35; // px/s^2 downward
      const drag = 1.6; // per second
      for (const s of this.sparks) {
        s.age += dt;
        // record trail (subsample)
        s.trail.push({ x: s.x, y: s.y, a: 1 - s.age / s.life });
        if (s.trail.length > 14) s.trail.shift();
        // integrate
        const k = Math.exp(-drag * dt);
        s.vx *= k;
        s.vy = s.vy * k + gravity * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
    },
    simulateTo(t) {
      // Advance in fixed steps for stable static render
      const step = 1 / 60;
      let elapsed = 0;
      while (elapsed < t) {
        this.stepSparks(Math.min(step, t - elapsed));
        elapsed += step;
      }
    },
    loop() {
      this.raf = requestAnimationFrame(this.loop);
      const ctx = this.ctx;
      if (!ctx || this.w === 0) return;
      const now = performance.now();
      const t = (now - this.startTime) / 1000;

      // Fade the canvas each frame to create a natural motion-blur/trail glow.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(4, 6, 26, 0.22)';
      ctx.fillRect(0, 0, this.w, this.h);

      if (this.staticMode) {
        // Draw once, held frame
        this.drawSparks(1);
        return;
      }

      // --- Rocket launch phase ---
      const launchDur = 0.7; // seconds
      if (!this.exploded) {
        const p = Math.min(1, t / launchDur);
        // Ease-out so it slows at the apex
        const eased = 1 - Math.pow(1 - p, 2.4);
        this.rocket.y = 1.0 - (1.0 - this.burstY) * eased;
        this.rocket.trail.push({ x: this.rocket.x * this.w, y: this.rocket.y * this.h });
        if (this.rocket.trail.length > 18) this.rocket.trail.shift();
        this.drawRocket();
        if (p >= 1) {
          this.exploded = true;
          this.flashT = 0;
          this.buildSparks();
        }
        return;
      }

      // --- Explosion flash ---
      this.flashT += 1 / 60;
      if (this.flashT < 0.35) {
        this.drawFlash(this.flashT / 0.35);
      }

      // --- Sparks ---
      const dt = Math.min(1 / 30, 1 / 60); // stable timestep
      this.stepSparks(dt);
      this.drawSparks();
    },
    drawRocket() {
      const ctx = this.ctx;
      const rx = this.rocket.x * this.w;
      const ry = this.rocket.y * this.h;
      // Trail
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.rocket.trail.length; i++) {
        const p = this.rocket.trail[i];
        const alpha = i / this.rocket.trail.length;
        const size = 1 + alpha * 3.2;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        g.addColorStop(0, `rgba(255, 240, 200, ${alpha * 0.9})`);
        g.addColorStop(1, 'rgba(255, 180, 80, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Rocket head (bright white hot core)
      const g2 = ctx.createRadialGradient(rx, ry, 0, rx, ry, 8);
      g2.addColorStop(0, '#ffffff');
      g2.addColorStop(0.5, '#ffe9a8');
      g2.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(rx, ry, 8, 0, Math.PI * 2);
      ctx.fill();
    },
    drawFlash(p) {
      const ctx = this.ctx;
      const cx = this.burstX * this.w;
      const cy = this.burstY * this.h;
      const R = Math.min(this.w, this.h) * (0.05 + p * 0.28);
      const alpha = (1 - p) * 0.95;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.35, `rgba(${this.hexToRgb(this.palette.core)},${alpha * 0.9})`);
      g.addColorStop(1, `rgba(${this.hexToRgb(this.palette.c2)},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
    },
    drawSparks(forceAlpha) {
      const ctx = this.ctx;
      ctx.globalCompositeOperation = 'lighter';
      const c1rgb = this.hexToRgb(this.palette.c1);
      const c2rgb = this.hexToRgb(this.palette.c2);
      const coreRgb = this.hexToRgb(this.palette.core);

      for (const s of this.sparks) {
        const lifeRatio = Math.min(1, s.age / s.life);
        const alpha = forceAlpha !== undefined ? forceAlpha : Math.max(0, 1 - lifeRatio);

        // Trail
        if (s.trail.length > 1) {
          for (let i = 1; i < s.trail.length; i++) {
            const p0 = s.trail[i - 1];
            const p1 = s.trail[i];
            const ta = (i / s.trail.length) * alpha * 0.85;
            ctx.strokeStyle = `rgba(${c1rgb},${ta})`;
            ctx.lineWidth = 1.4 + (i / s.trail.length) * 1.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        }

        // Outer glow
        const R = 6 + (1 - lifeRatio) * 4;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, R * 2.4);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.3, `rgba(${coreRgb},${alpha * 0.9})`);
        g.addColorStop(0.7, `rgba(${c1rgb},${alpha * 0.5})`);
        g.addColorStop(1, `rgba(${c2rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, R * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle twinkle near end of life
        if (s.sparkle && lifeRatio > 0.55 && !forceAlpha) {
          const tw = (Math.sin(s.age * 30) + 1) * 0.5 * alpha;
          ctx.fillStyle = `rgba(255,240,200,${tw})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    hexToRgb(hex) {
      const h = hex.replace('#', '');
      const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    },
  },
  render(h) {
    return h('div', { class: ['fw-burst', { 'fw-static': this.staticMode, 'fw-highlight': this.highlight }] }, [
      h('canvas', { ref: 'cv', class: 'fw-canvas' }),
    ]);
  },
};

// ---------- Difficulty Config ----------
// Must match the launch duration inside FireworkBurst (`launchDur = 0.7s`).
// The rule's "呈现时间" counts only the visible-burst window, so we add this
// as an offset before hiding the fireworks.
const FIREWORK_LAUNCH_MS = 700;
const DIFFICULTIES = [
  { level: 1, min: 1, max: 3,  showTime: 3.0, coef: 1.0 },
  { level: 2, min: 2, max: 5,  showTime: 3.0, coef: 1.5 },
  { level: 3, min: 3, max: 7,  showTime: 2.0, coef: 2.0 },
  { level: 4, min: 4, max: 9,  showTime: 2.0, coef: 2.5 },
  { level: 5, min: 5, max: 11, showTime: 1.5, coef: 3.0 },
  { level: 6, min: 6, max: 12, showTime: 1.5, coef: 3.5 },
];

// ---------- i18n ----------
const I18N = {
  zh: {
    langAria: '切换语言',
    gameTitle: '烟花计数器',
    subtitle: '训练视觉注意广度与快速计数能力',
    startGame: '开始游戏',
    rules: '规则介绍',
    history: '历史记录',
    back: '返回',
    rulesIntro: '在短短几秒内观察夜空绽放的烟花，数一数共有几颗火花，然后从选项中选择正确答案。',
    difficulty: '难度',
    sparkRange: '火花数量',
    showTime: '呈现时间',
    coef: '难度系数',
    rule1: '每题答题最长 15 秒',
    rule2: '每 60 秒统计正确率，≥90% 升级，≤70% 降级',
    rule3: '得分 = 5 × 难度系数（每答对一题）',
    tutorial: '游戏教程',
    skip: '跳过教程',
    prev: '上一步',
    next: '下一步',
    start: '开始',
    tut1: '烟花会在夜空中短暂绽放',
    tut2: '在有限时间内数出火花数量',
    tut3: '从下方选项中选择正确数字',
    tut4: '答对越多、难度越高，得分越高',
    pts: '分',
    chooseDuration: '选择训练时长',
    min: '分钟',
    quick: '快速体验',
    standard: '标准训练',
    deep: '深度训练',
    score: '得分',
    timeLeft: '剩余时间',
    skipGame: '跳过游戏',
    prompt: '请数一数有几颗火花',
    chooseCount: '选择火花数量',
    correct: '答对了！',
    wrong: '答错了',
    timeup: '超时',
    answer: '正确答案',
    paused: '游戏已暂停',
    confirmBack: '确定要返回吗？本次训练将结束。',
    confirmSkip: '确定要跳过并结束本次训练吗？',
    continueGame: '继续',
    confirm: '确认',
    trainingComplete: '训练完成！',
    finalScore: '最终得分',
    total: '总次数',
    correctCount: '答对',
    wrongCount: '答错',
    accuracy: '正确率',
    avgRt: '平均反应',
    duration: '时长',
    home: '返回首页',
    playAgain: '再来一次',
    noHistory: '暂无训练记录',
    time: '训练时间',
    project: '训练项目',
    clearHistory: '清空记录',
  },
  en: {
    langAria: 'Toggle Language',
    gameTitle: 'Firework Counter',
    subtitle: 'Train visual attention span & rapid counting',
    startGame: 'Start Game',
    rules: 'Rules',
    history: 'History',
    back: 'Back',
    rulesIntro: 'Watch fireworks bloom in the night sky for a few seconds — count the sparks and pick the correct answer.',
    difficulty: 'Difficulty',
    sparkRange: 'Sparks',
    showTime: 'Show Time',
    coef: 'Coefficient',
    rule1: 'Up to 15 s per question',
    rule2: 'Every 60 s: accuracy ≥90% level up, ≤70% level down',
    rule3: 'Score = 5 × coefficient per correct answer',
    tutorial: 'Tutorial',
    skip: 'Skip Tutorial',
    prev: 'Prev',
    next: 'Next',
    start: 'Start',
    tut1: 'Fireworks bloom briefly in the sky',
    tut2: 'Count the sparks within the time limit',
    tut3: 'Pick the correct number from options below',
    tut4: 'The harder the level, the higher the score',
    pts: 'pts',
    chooseDuration: 'Choose Training Duration',
    min: 'min',
    quick: 'Quick Session',
    standard: 'Standard',
    deep: 'Deep Training',
    score: 'Score',
    timeLeft: 'Time Left',
    skipGame: 'Skip Game',
    prompt: 'How many sparks are there?',
    chooseCount: 'Choose the count',
    correct: 'Correct!',
    wrong: 'Wrong',
    timeup: 'Time Up',
    answer: 'Answer',
    paused: 'Paused',
    confirmBack: 'Return to home? Current training will end.',
    confirmSkip: 'Skip and end this training session?',
    cancel: 'Cancel',
    continueGame: 'Continue',
    confirm: 'Confirm',
    trainingComplete: 'Training Complete!',
    finalScore: 'Final Score',
    total: 'Total',
    correctCount: 'Correct',
    wrongCount: 'Wrong',
    accuracy: 'Accuracy',
    avgRt: 'Avg RT',
    duration: 'Duration',
    home: 'Home',
    playAgain: 'Play Again',
    noHistory: 'No training records yet',
    time: 'Time',
    project: 'Project',
    clearHistory: 'Clear',
  },
};

const HISTORY_KEY = 'fireworkCounter.history.v1';
const LANG_KEY = 'fireworkCounter.lang';
const GAME_TYPE = 'yhjsq'; // 烟花计数器 gameType

export default {
  name: 'App',
  components: { FireworkBurst },
  data() {
    return {
      view: 'home',
      lang: localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh',
      difficulties: DIFFICULTIES,
      tutStep: 0,
      tutAnim: 0,
      selectedDuration: null,
      history: [],
      lastResult: { score: 0, total: 0, correct: 0, wrong: 0, acc: 0, avgRt: 0, durationMin: 0 },
      game: {
        difficulty: 1,
        score: 0,
        totalTime: 60,
        timeLeft: 60,
        showFireworks: false,
        showOptions: false,
        currentCount: 0,
        options: [],
        answered: false,
        userAnswer: null,
        feedback: null,
        questionId: 0,
        fireworkKey: 0,
        answerTimeLeft: 15,
        totalQ: 0,
        correctQ: 0,
        wrongQ: 0,
        rtSum: 0,
        winTotal: 0,
        winCorrect: 0,
        winStart: 0,
        paused: false,
        pauseReason: null,
        pauseWasInFirework: false,
        pauseWasInOptions: false,
        pauseFireworkRemainingMs: 0,
        answerStart: 0,
        answerPauseAccum: 0,
        answerPauseStart: 0,
        startedAt: 0,
        pauseAccum: 0,
        pauseStart: 0,
        questionStartedAt: 0,
      },
      timers: { mainRaf: null, showTimeout: null, answerRaf: null, feedbackTimeout: null },
      archiveId: -1, // 患者 archiveId
      showBatchSkip: false, // 是否显示批次跳过
    };
  },
  computed: {
    t() { return I18N[this.lang]; },
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
    this.showBatchSkip = shouldShowPbBatchSkip();
  },
  mounted() {
    this.loadHistory();
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (dur) => { this.selectedDuration = dur; },
      openTutorial: () => { this.startFlow(); },
    });
  },
  beforeDestroy() { this.clearAllTimers(); },
  methods: {
    toggleLang() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh';
      localStorage.setItem(LANG_KEY, this.lang);
    },
    formatTime(s) {
      s = Math.max(0, Math.ceil(s));
      const m = Math.floor(s / 60);
      const ss = s % 60;
      return `${m}:${ss.toString().padStart(2, '0')}`;
    },
    loadHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        this.history = raw ? JSON.parse(raw) : [];
      } catch (e) { this.history = []; }
    },
    saveHistory(rec) {
      this.history.unshift(rec);
      if (this.history.length > 100) this.history.length = 100;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    },
    clearHistory() {
      this.history = [];
      localStorage.removeItem(HISTORY_KEY);
    },
    openHistory() { this.loadHistory(); this.view = 'history'; },

    startFlow() {
      this.tutStep = 0;
      this.tutAnim = 0;
      this.selectedDuration = null;
      this.view = 'tutorial';
      this.$nextTick(() => { this.tutAnim++; });
    },
    tutNext() { this.tutStep++; this.tutAnim++; },
    tutPrev() { this.tutStep--; this.tutAnim++; },
    finishTutorial() { this.onTutorialDone(); },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (dur) => {
        this.selectedDuration = dur;
        this.beginGame();
      })) return;
      this.view = 'duration';
    },

    beginGame() {
      if (!this.selectedDuration) return;
      const total = this.selectedDuration * 60;
      Object.assign(this.game, {
        difficulty: getBatchStartDifficultyForGame(GAME_TYPE),
        score: 0,
        totalTime: total,
        timeLeft: total,
        showFireworks: false,
        showOptions: false,
        currentCount: 0,
        options: [],
        answered: false,
        userAnswer: null,
        feedback: null,
        questionId: 0,
        fireworkKey: 0,
        answerTimeLeft: 15,
        totalQ: 0,
        correctQ: 0,
        wrongQ: 0,
        rtSum: 0,
        winTotal: 0,
        winCorrect: 0,
        winStart: 0,
        paused: false,
        pauseReason: null,
        pauseWasInFirework: false,
        pauseWasInOptions: false,
        pauseFireworkRemainingMs: 0,
        answerStart: 0,
        answerPauseAccum: 0,
        answerPauseStart: 0,
        startedAt: performance.now(),
        pauseAccum: 0,
        pauseStart: 0,
      });
      this.view = 'game';
      this.startMainTimer();
      this.nextQuestion();
    },

    startMainTimer() {
      const tick = () => {
        if (this.view !== 'game') return;
        if (!this.game.paused) {
          const elapsed = (performance.now() - this.game.startedAt - this.game.pauseAccum) / 1000;
          const left = this.game.totalTime - elapsed;
          this.game.timeLeft = left;
          const windowIdx = Math.floor(elapsed / 60);
          if (windowIdx > this.game.winStart) {
            this.adjustDifficulty();
            this.game.winStart = windowIdx;
            this.game.winTotal = 0;
            this.game.winCorrect = 0;
          }
          if (left <= 0) {
            this.endGame(false);
            return;
          }
        }
        this.timers.mainRaf = requestAnimationFrame(tick);
      };
      this.timers.mainRaf = requestAnimationFrame(tick);
    },

    adjustDifficulty() {
      if (this.game.winTotal === 0) return;
      const acc = this.game.winCorrect / this.game.winTotal;
      if (acc >= 0.9 && this.game.difficulty < 6) this.game.difficulty++;
      else if (acc <= 0.7 && this.game.difficulty > 1) this.game.difficulty--;
    },

    nextQuestion() {
      if (this.view !== 'game' || this.game.paused) return;
      if (this.game.timeLeft <= 0.2) return;
      const cfg = DIFFICULTIES[this.game.difficulty - 1];
      const range = cfg.max - cfg.min + 1;
      const count = cfg.min + Math.floor(Math.random() * range);
      this.game.currentCount = count;
      this.game.questionId++;
      this.game.fireworkKey++;
      this.game.answered = false;
      this.game.userAnswer = null;
      this.game.feedback = null;
      this.game.options = this.buildOptions(count);
      this.game.showFireworks = true;
      this.game.showOptions = false;
      this.playPrompt();

      const totalMs = cfg.showTime * 1000 + FIREWORK_LAUNCH_MS;
      this.game.fireworkShowStartedAt = performance.now();
      this.game.fireworkTotalMs = totalMs;
      this.scheduleFireworkEnd(totalMs);
    },

    scheduleFireworkEnd(remainingMs) {
      if (this.timers.showTimeout) clearTimeout(this.timers.showTimeout);
      this.timers.showTimeout = setTimeout(() => {
        if (this.view !== 'game') return;
        this.game.showFireworks = false;
        this.game.showOptions = true;
        this.game.questionStartedAt = performance.now();
        this.game.answerStart = performance.now();
        this.game.answerPauseAccum = 0;
        this.game.answerPauseStart = 0;
        this.startAnswerTimer();
      }, remainingMs);
    },

    playPrompt() {
      // Play "count the sparks" voice cue.
      // File served from public/voice/{chinese|english}/1.mp3.
      try {
        if (!this.promptAudio) this.promptAudio = new Audio();
        const audio = this.promptAudio;
        // Guard: if a cue is still playing, let it finish — don't stack it.
        if (!audio.paused && !audio.ended && audio.currentTime > 0) return;
        const folder = this.lang === 'zh' ? 'chinese' : 'english';
        const targetSrc = `voice/${folder}/1.mp3`;
        if (!audio.src || !audio.src.endsWith(targetSrc)) {
          audio.src = targetSrc;
        }
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) { /* audio playback is best-effort */ }
    },

    buildOptions(correct) {
      const set = new Set([correct]);
      const globalMin = 1;
      const globalMax = 13;
      let guard = 0;
      while (set.size < 4 && guard++ < 60) {
        const delta = (Math.floor(Math.random() * 4) + 1) * (Math.random() < 0.5 ? -1 : 1);
        let v = correct + delta;
        if (v < globalMin) v = correct + Math.abs(delta);
        if (v > globalMax) v = correct - Math.abs(delta);
        if (v >= globalMin && v <= globalMax) set.add(v);
      }
      return Array.from(set).sort((a, b) => a - b);
    },

    startAnswerTimer() {
      const tick = () => {
        if (this.view !== 'game') return;
        if (this.game.answered) return;
        if (this.game.paused) {
          this.timers.answerRaf = requestAnimationFrame(tick);
          return;
        }
        const elapsed = (performance.now() - this.game.answerStart - this.game.answerPauseAccum) / 1000;
        this.game.answerTimeLeft = Math.max(0, 15 - elapsed);
        if (this.game.answerTimeLeft <= 0) {
          this.handleTimeout();
          return;
        }
        this.timers.answerRaf = requestAnimationFrame(tick);
      };
      this.game.answerTimeLeft = 15;
      this.timers.answerRaf = requestAnimationFrame(tick);
    },

    submitAnswer(opt) {
      if (this.game.answered) return;
      this.game.answered = true;
      this.game.userAnswer = opt;
      const rt = (performance.now() - this.game.questionStartedAt) / 1000;
      const correct = opt === this.game.currentCount;
      this.game.totalQ++;
      this.game.winTotal++;
      this.game.rtSum += rt;
      if (correct) {
        this.game.correctQ++;
        this.game.winCorrect++;
        const cfg = DIFFICULTIES[this.game.difficulty - 1];
        this.game.score += 5 * cfg.coef;
        this.game.feedback = { type: 'correct' };
      } else {
        this.game.wrongQ++;
        this.game.feedback = { type: 'wrong' };
      }
      this.timers.feedbackTimeout = setTimeout(() => {
        if (this.view !== 'game') return;
        this.game.showOptions = false;
        this.game.feedback = null;
        this.nextQuestion();
      }, 900);
    },

    handleTimeout() {
      if (this.game.answered) return;
      this.game.answered = true;
      this.game.totalQ++;
      this.game.wrongQ++;
      this.game.winTotal++;
      this.game.rtSum += 15;
      this.game.feedback = { type: 'timeup' };
      this.timers.feedbackTimeout = setTimeout(() => {
        if (this.view !== 'game') return;
        this.game.showOptions = false;
        this.game.feedback = null;
        this.nextQuestion();
      }, 1100);
    },

    requestPause(reason) {
      if (this.game.paused) return;
      this.game.paused = true;
      this.game.pauseReason = reason || 'back';
      const now = performance.now();
      this.game.pauseStart = now;
      // Remember the exact phase we paused in so resume can restore it.
      if (this.game.showFireworks) {
        this.game.pauseWasInFirework = true;
        const elapsed = now - this.game.fireworkShowStartedAt;
        this.game.pauseFireworkRemainingMs = Math.max(0, this.game.fireworkTotalMs - elapsed);
        // Stop the pending "hide fireworks" timer and hide the current
        // burst — we'll replay it fresh on resume so the user can count again.
        if (this.timers.showTimeout) {
          clearTimeout(this.timers.showTimeout);
          this.timers.showTimeout = null;
        }
        this.game.showFireworks = false;
      } else if (this.game.showOptions && !this.game.answered) {
        this.game.pauseWasInOptions = true;
        this.game.answerPauseStart = now;
      }
    },
    resumeGame() {
      const now = performance.now();
      if (this.game.pauseStart) {
        this.game.pauseAccum += now - this.game.pauseStart;
        this.game.pauseStart = 0;
      }
      if (this.game.pauseWasInFirework) {
        this.game.pauseWasInFirework = false;
        // Replay the same question's firework from scratch so the player
        // gets the full presentation window they were interrupted from.
        const cfg = DIFFICULTIES[this.game.difficulty - 1];
        const totalMs = cfg.showTime * 1000 + FIREWORK_LAUNCH_MS;
        this.game.fireworkKey++;
        this.game.fireworkShowStartedAt = performance.now();
        this.game.fireworkTotalMs = totalMs;
        this.game.showFireworks = true;
        this.scheduleFireworkEnd(totalMs);
      } else if (this.game.pauseWasInOptions) {
        this.game.pauseWasInOptions = false;
        if (this.game.answerPauseStart) {
          this.game.answerPauseAccum += now - this.game.answerPauseStart;
          this.game.answerPauseStart = 0;
        }
      }
      this.game.paused = false;
      this.game.pauseReason = null;
    },
    endGame() {
      this.clearAllTimers();
      const total = this.game.totalQ;
      const correct = this.game.correctQ;
      const wrong = this.game.wrongQ;
      const acc = total ? Math.round((correct / total) * 100) : 0;
      const avgRt = total ? (this.game.rtSum / total).toFixed(2) : '0.00';
      const record = {
        time: this.nowStr(),
        finalDifficulty: this.game.difficulty,
        durationMin: this.selectedDuration,
        total, correct, wrong,
        acc, avgRt,
        score: Number(this.game.score.toFixed(1)),
      };
      this.lastResult = { ...record };
      this.saveHistory(record);
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(parseFloat(avgRt) || 0),
        score: record.score || 0,
        successCount: correct,
        failCount: wrong,
        trainDuration: this.selectedDuration,
        difficultyLevel: this.game.difficulty,
      });
      this.game.paused = false;
      this.view = 'result';
    },
    confirmLeave() {
      this.clearAllTimers();
      this.game.paused = false;
      leavePbGameWindow({ confirm: false });
    },
    onBatchSkip() {
      skipPbBatchGame();
    },
    nowStr() {
      const d = new Date();
      const p = n => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    },
    clearAllTimers() {
      if (this.timers.mainRaf) cancelAnimationFrame(this.timers.mainRaf);
      if (this.timers.answerRaf) cancelAnimationFrame(this.timers.answerRaf);
      if (this.timers.showTimeout) clearTimeout(this.timers.showTimeout);
      if (this.timers.feedbackTimeout) clearTimeout(this.timers.feedbackTimeout);
      this.timers.mainRaf = this.timers.answerRaf = null;
      this.timers.showTimeout = this.timers.feedbackTimeout = null;
    },
  },
};
</script>

<style>
/* ==================== Reset & Root ==================== */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Roboto, sans-serif;
  color: #f0f4ff;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
button { font-family: inherit; cursor: pointer; border: none; outline: none; background: none; color: inherit; }
button:disabled { cursor: not-allowed; }

.app-root {
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at 50% 100%, #1a1b4b 0%, #0b0d2e 40%, #04061a 100%);
  overflow: hidden;
  font-size: 2vmin;
}

/* ==================== Night Sky ==================== */
.sky { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.stars {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.9), transparent),
    radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1.5px 1.5px at 40% 60%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 85% 75%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1.5px 1.5px at 55% 45%, rgba(255,255,255,0.9), transparent),
    radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 30% 15%, rgba(255,255,255,0.8), transparent);
  animation: twinkle 4s ease-in-out infinite alternate;
}
.stars-2 {
  background-image:
    radial-gradient(1px 1px at 8% 45%, rgba(180,200,255,0.8), transparent),
    radial-gradient(1px 1px at 62% 82%, rgba(200,220,255,0.7), transparent),
    radial-gradient(1.5px 1.5px at 78% 35%, rgba(255,240,220,0.9), transparent),
    radial-gradient(1px 1px at 45% 88%, rgba(220,220,255,0.6), transparent);
  animation-duration: 6s; animation-delay: 1s;
}
.stars-3 {
  background-image:
    radial-gradient(2px 2px at 25% 55%, rgba(255,255,220,0.9), transparent),
    radial-gradient(1.5px 1.5px at 88% 55%, rgba(220,230,255,0.8), transparent);
  animation-duration: 5s; animation-delay: 2s;
}
@keyframes twinkle { from { opacity: 0.5; } to { opacity: 1; } }

.moon {
  position: absolute; top: 8%; right: 10%;
  width: 8vmin; height: 8vmin; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff9e6 0%, #f5e6a8 40%, #d4b874 100%);
  box-shadow:
    0 0 6vmin 1vmin rgba(255, 240, 180, 0.15),
    0 0 12vmin 2vmin rgba(255, 240, 180, 0.08);
}
.city {
  position: absolute; left: 0; right: 0; bottom: 0; height: 12vmin;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  clip-path: polygon(
    0 100%, 0 60%, 4% 55%, 8% 65%, 12% 45%, 16% 55%, 22% 40%, 28% 60%, 34% 35%,
    40% 50%, 46% 30%, 52% 55%, 58% 40%, 64% 60%, 70% 35%, 76% 55%, 82% 45%,
    88% 60%, 94% 40%, 100% 55%, 100% 100%
  );
  opacity: 0.7;
}

/* ==================== Language Button ==================== */
.lang-btn {
  position: absolute; top: 2.4vmin; right: 2.4vmin; z-index: 30;
  display: flex; align-items: center; gap: 0.6em;
  padding: 1.2vmin 2.2vmin;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  color: #fff; font-size: 2.2vmin; font-weight: 500;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}
.lang-btn:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(120,150,255,0.25);
}
.lang-icon { font-size: 1.1em; }

/* ==================== Views ==================== */
.view {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 3vmin;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.fade-enter, .fade-leave-to { opacity: 0; transform: translateY(6px); }

/* ==================== HOME ==================== */
.home { flex-direction: column; gap: 6vmin; }
.title-wrap { text-align: center; }
.game-title {
  display: flex; align-items: center; justify-content: center; gap: 0.5em;
  font-size: 7.5vmin;
  font-weight: 900; letter-spacing: 0.02em;
  background: linear-gradient(135deg, #ffd166 0%, #ff8ac6 50%, #7bdff2 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 24px rgba(255,138,198,0.35));
  animation: title-float 4s ease-in-out infinite;
}
@keyframes title-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-0.4vmin); } }
.title-icon {
  -webkit-text-fill-color: initial;
  filter: drop-shadow(0 2px 12px rgba(255,180,80,0.6));
  animation: icon-spin 6s linear infinite;
}
@keyframes icon-spin { to { transform: rotate(360deg); } }
.subtitle {
  margin-top: 2vmin;
  font-size: 2.6vmin; color: rgba(220,225,255,0.75); letter-spacing: 0.06em;
}
.home-buttons { display: flex; flex-direction: column; gap: 2.4vmin; width: min(48vmin, 420px); }

/* ==================== Buttons ==================== */
.btn {
  position: relative;
  padding: 2.4vmin 3vmin;
  border-radius: 1.6vmin;
  font-size: 2.6vmin; font-weight: 600; letter-spacing: 0.05em;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.15);
  white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #c471ed 50%, #6366f1 100%);
  color: #fff;
  box-shadow:
    0 10px 30px rgba(196,113,237,0.4),
    inset 0 1px 0 rgba(255,255,255,0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 15px 40px rgba(196,113,237,0.55),
    inset 0 1px 0 rgba(255,255,255,0.4);
}
.btn-primary:disabled { opacity: 0.4; }
.btn-secondary {
  background: rgba(255,255,255,0.08);
  color: #e8ecff;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(255,255,255,0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(120,150,255,0.25);
}
.btn-back {
  padding: 1.8vmin 2.6vmin; font-size: 2.2vmin;
  background: rgba(255,255,255,0.06);
  color: #d0d6ff;
  border-radius: 1.2vmin;
}
.btn-back:hover { background: rgba(255,255,255,0.12); }
.btn-sm { padding: 1.6vmin 2.6vmin; font-size: 2.2vmin; border-radius: 1.2vmin; }
.btn-glow {
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  animation: glow-sweep 3s ease-in-out infinite;
}
@keyframes glow-sweep { to { left: 100%; } }
.btn-label { position: relative; z-index: 1; }

/* ==================== Glass Card ==================== */
.panel-view { padding: 4vmin; }
.glass-card {
  width: min(94vw, 960px);
  max-height: 92vh;
  padding: 4vmin 5vmin;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 2vmin;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 20px 60px rgba(0,0,10,0.5),
    inset 0 1px 0 rgba(255,255,255,0.15);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 2.4vmin;
}
.glass-card::-webkit-scrollbar { width: 6px; }
.glass-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

.card-title {
  font-size: 3.4vmin; font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* ==================== Rules ==================== */
.rules-content { display: flex; flex-direction: column; gap: 2vmin; font-size: 2.2vmin; line-height: 1.7; color: #d8ddff; }
.difficulty-table {
  border-radius: 1.2vmin; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 2vmin;
}
.dt-head, .dt-row {
  display: grid; grid-template-columns: 1.2fr 1.5fr 1.2fr 1.2fr;
  padding: 1.4vmin 1.8vmin; align-items: center; text-align: center;
}
.dt-head {
  background: rgba(120,120,200,0.25);
  font-weight: 700; color: #fff;
}
.dt-row {
  border-top: 1px solid rgba(255,255,255,0.06);
  transition: background 0.2s;
}
.dt-row:hover { background: rgba(255,255,255,0.05); }
.lvl-badge {
  display: inline-block; padding: 0.4vmin 1.2vmin; border-radius: 999px;
  background: linear-gradient(135deg, #ff6b9d, #6366f1); font-weight: 700; font-size: 1.9vmin; color: #fff;
}
.rule-list { list-style: none; display: flex; flex-direction: column; gap: 1vmin; padding-left: 0; font-size: 2.1vmin; }
.rule-list li { padding: 1.2vmin 1.6vmin; background: rgba(255,255,255,0.04); border-radius: 1vmin; }

/* ==================== Tutorial ==================== */
.tutorial-card { min-height: 60vh; }
.tut-header { display: flex; justify-content: space-between; align-items: center; }
.skip-btn {
  color: rgba(220,220,255,0.7); font-size: 2.1vmin;
  padding: 1vmin 1.6vmin; border-radius: 0.8vmin;
  transition: all 0.2s;
}
.skip-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
.tut-stage {
  flex: 1;
  min-height: 40vh;
  display: flex; align-items: center; justify-content: center;
  border-radius: 1.5vmin;
  background: linear-gradient(180deg, rgba(10,15,50,0.6) 0%, rgba(5,10,40,0.4) 100%);
  overflow: hidden; position: relative;
}
.tut-content {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3vmin;
  padding: 3vmin;
}
.tut-fw-area {
  position: relative;
  width: 55vmin; height: 40vmin;
  display: flex; align-items: center; justify-content: center;
}
.tut-count-badge {
  position: absolute;
  top: -1vmin; right: 2vmin;
  width: 9vmin; height: 9vmin; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 4vmin; font-weight: 800;
  background: linear-gradient(135deg, #ffd166, #ff8ac6);
  color: #2b1055;
  box-shadow: 0 6px 20px rgba(255,180,80,0.5);
  animation: bounce 1s ease-in-out infinite;
}
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1vmin); } }
.tut-caption {
  font-size: 2.6vmin; color: #e8ecff; text-align: center; font-weight: 500;
}
.tut-options-demo { display: flex; gap: 1.5vmin; flex-wrap: wrap; justify-content: center; }
.opt-demo { pointer-events: none; }
.opt-correct-demo {
  background: linear-gradient(135deg, #10b981, #34d399) !important;
  color: #fff !important;
  animation: pulse-glow 1.2s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
  50% { box-shadow: 0 0 0 1.2vmin rgba(52,211,153,0); }
}
.tut-score-demo { display: flex; align-items: center; gap: 2vmin; }
.score-chip {
  padding: 1.6vmin 2.2vmin; border-radius: 1.2vmin;
  background: rgba(255,255,255,0.08); font-size: 2.4vmin; font-weight: 700;
}
.score-chip-big {
  background: linear-gradient(135deg, #ffd166, #ff6b9d);
  color: #2b1055; font-size: 3vmin;
  box-shadow: 0 8px 24px rgba(255,138,198,0.4);
}
.score-arrow { font-size: 3.6vmin; color: #a78bfa; }
.tut-controls {
  display: flex; align-items: center; justify-content: space-between; gap: 2vmin;
  padding-top: 1vmin;
}
.tut-dots { display: flex; gap: 1.2vmin; }
.dot {
  width: 1.4vmin; height: 1.4vmin; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: all 0.3s;
}
.dot.active {
  background: linear-gradient(135deg, #ff6b9d, #6366f1);
  width: 3.6vmin; border-radius: 999px;
}

/* ==================== Duration ==================== */
.duration-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2vmin; }
.dur-card {
  padding: 3vmin 2vmin;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 1.4vmin;
  display: flex; flex-direction: column; align-items: center; gap: 0.5vmin;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.dur-card:hover {
  transform: translateY(-3px);
  background: rgba(255,255,255,0.1);
  border-color: rgba(196,113,237,0.5);
}
.dur-card.selected {
  background: linear-gradient(135deg, rgba(255,107,157,0.25) 0%, rgba(99,102,241,0.25) 100%);
  border-color: #c471ed;
  box-shadow: 0 10px 30px rgba(196,113,237,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
}
.dur-num {
  font-size: 9vmin; font-weight: 900;
  background: linear-gradient(135deg, #ffd166, #ff8ac6);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  line-height: 1;
}
.dur-unit { font-size: 2.4vmin; color: #b8bfd8; letter-spacing: 0.1em; }
.dur-desc { font-size: 2vmin; color: rgba(220,220,255,0.65); margin-top: 0.6vmin; }
.dur-actions { display: flex; gap: 1.5vmin; justify-content: space-between; }
.dur-actions .btn { flex: 1; }

/* ==================== GAME ==================== */
.game-view { padding: 0; }
.hud { position: absolute; z-index: 10; display: flex; gap: 1.8vmin; }
.hud-left { top: 2.4vmin; left: 2.4vmin; }
.hud-right { top: 2.4vmin; right: 2.4vmin; flex-direction: column; }
.hud-item {
  min-width: 14vmin;
  padding: 1.8vmin 2.4vmin;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 1.4vmin;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: 0.4vmin;
  box-shadow: 0 6px 20px rgba(0,0,20,0.3);
}
.hud-label { font-size: 1.8vmin; color: rgba(220,220,255,0.65); letter-spacing: 0.1em; }
.hud-value { font-size: 3vmin; font-weight: 800; color: #fff; }
.hud-value.hud-score {
  background: linear-gradient(135deg, #ffd166, #ff8ac6);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hud-value.warn { color: #ff6b6b; animation: warn-pulse 0.8s ease-in-out infinite; }
@keyframes warn-pulse { 50% { opacity: 0.55; } }

.hud-btn {
  padding: 1.8vmin 2.6vmin;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 1.2vmin;
  color: #e8ecff; font-size: 2.2vmin; font-weight: 500;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.2s;
  white-space: nowrap;
}
.hud-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }

.game-prompt {
  position: absolute; top: 3.5vmin; left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
}
.prompt-badge {
  display: inline-flex; align-items: center; gap: 1.2vmin;
  padding: 1.6vmin 3.2vmin;
  background:
    linear-gradient(135deg, rgba(255,209,102,0.22) 0%, rgba(255,138,198,0.22) 50%, rgba(123,223,242,0.22) 100%),
    rgba(20,20,50,0.45);
  border: 1.5px solid rgba(255,255,255,0.28);
  border-radius: 999px;
  font-size: 2.6vmin; font-weight: 700; letter-spacing: 0.08em;
  color: #fff;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 8px 28px rgba(196,113,237,0.35),
    inset 0 1px 0 rgba(255,255,255,0.25);
}
.prompt-badge::before {
  content: '✨';
  font-size: 2.6vmin;
  filter: drop-shadow(0 0 8px rgba(255,220,140,0.9));
}
.prompt-badge::after {
  content: '✨';
  font-size: 2.6vmin;
  filter: drop-shadow(0 0 8px rgba(255,220,140,0.9));
}

.fw-stage {
  position: absolute; inset: 0;
  padding-top: 14vmin;
  padding-bottom: 26vmin;
  padding-left: 4vmin;
  padding-right: 4vmin;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}

/* ==================== Firework (Canvas) ==================== */
.fw-burst {
  position: relative;
  width: 70vmin; height: 70vmin;
  max-width: 100%; max-height: 100%;
}
.fw-static { width: 100%; height: 100%; }
.fw-canvas {
  display: block;
  width: 100%; height: 100%;
  border-radius: 1.5vmin;
}
.fw-highlight { animation: highlight-pulse-box 1.6s ease-in-out infinite; }
@keyframes highlight-pulse-box {
  0%,100% { filter: brightness(1); }
  50% { filter: brightness(1.25); }
}

/* ==================== Options ==================== */
.options-panel {
  position: absolute; bottom: 6vmin; left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 1.6vmin;
  width: min(90vw, 900px);
}
.options-title {
  padding: 1vmin 2vmin;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  font-size: 1.9vmin; color: rgba(255,255,255,0.85); letter-spacing: 0.06em;
  text-align: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.options-row {
  display: flex; gap: 2vmin; justify-content: center; width: 100%;
}
.opt-btn {
  flex: 1;
  max-width: 18vmin;
  padding: 2.4vmin 2vmin;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 1.6vmin;
  color: #fff; font-size: 5vmin; font-weight: 800;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 10px 30px rgba(0,0,20,0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}
.opt-btn:not(:disabled):hover {
  transform: translateY(-4px) scale(1.04);
  border-color: rgba(196,113,237,0.7);
  box-shadow:
    0 15px 40px rgba(196,113,237,0.4),
    inset 0 1px 0 rgba(255,255,255,0.3);
}
.opt-btn:not(:disabled):active { transform: translateY(-1px) scale(0.98); }
.opt-btn.opt-correct {
  background: linear-gradient(135deg, #10b981, #34d399) !important;
  border-color: #34d399 !important;
  animation: correct-flash 0.6s ease;
}
.opt-btn.opt-wrong {
  background: linear-gradient(135deg, #ef4444, #f87171) !important;
  border-color: #f87171 !important;
  animation: shake 0.4s ease;
}
@keyframes correct-flash {
  0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.9); }
  100% { box-shadow: 0 0 0 3vmin rgba(52,211,153,0); }
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-1vmin); }
  75% { transform: translateX(1vmin); }
}

.answer-timer {
  width: min(60vw, 500px);
  height: 0.8vmin;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
  overflow: hidden;
}
.atimer-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #ffd166 60%, #ef4444 100%);
  transition: width 0.1s linear;
  border-radius: 999px;
}

/* ==================== Feedback ==================== */
.feedback {
  display: flex; flex-direction: column; align-items: center; gap: 1vmin;
  padding: 3vmin 4vmin;
  border-radius: 2vmin;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid rgba(255,255,255,0.15);
  animation: feedback-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes feedback-in {
  0% { opacity: 0; transform: scale(0.6); }
  100% { opacity: 1; transform: scale(1); }
}
.fb-icon { font-size: 8vmin; font-weight: 900; line-height: 1; }
.feedback-correct .fb-icon { color: #34d399; text-shadow: 0 0 3vmin rgba(52,211,153,0.6); }
.feedback-wrong .fb-icon { color: #f87171; text-shadow: 0 0 3vmin rgba(248,113,113,0.6); }
.feedback-timeup .fb-icon { color: #fbbf24; text-shadow: 0 0 3vmin rgba(251,191,36,0.6); }
.fb-text { font-size: 2.8vmin; font-weight: 600; text-align: center; }
.fb-ans { display: block; margin-top: 0.6vmin; font-size: 2.2vmin; color: rgba(220,220,255,0.8); }

/* ==================== Modal ==================== */
.modal-mask {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,10,0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 3vmin;
}
.modal-card { width: min(80vmin, 640px); max-height: none; }
.modal-title { font-size: 3.2vmin; font-weight: 700; text-align: center; }
.modal-text { color: #d0d6ff; text-align: center; font-size: 2.2vmin; line-height: 1.6; }
.modal-actions { display: flex; gap: 1.5vmin; justify-content: center; flex-wrap: wrap; }
.modal-actions .btn { flex: 1; min-width: 40%; }

/* ==================== Result ==================== */
.result-card { align-items: center; text-align: center; }
.result-crown {
  font-size: 8vmin;
  animation: crown-bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 6px 20px rgba(255,180,80,0.5));
}
@keyframes crown-bounce { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-1.5vmin) scale(1.05); } }
.result-score { display: flex; flex-direction: column; align-items: center; gap: 0.8vmin; }
.rs-label { font-size: 2.2vmin; color: rgba(220,220,255,0.75); letter-spacing: 0.15em; }
.rs-value {
  font-size: 12vmin; font-weight: 900; line-height: 1;
  background: linear-gradient(135deg, #ffd166 0%, #ff8ac6 50%, #7bdff2 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 20px rgba(255,138,198,0.4));
}
.result-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5vmin;
  width: 100%;
}
.rg-item {
  padding: 2vmin 1vmin;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.2vmin;
  display: flex; flex-direction: column; align-items: center; gap: 0.5vmin;
}
.rg-label { font-size: 1.8vmin; color: rgba(220,220,255,0.65); }
.rg-val { font-size: 2.8vmin; font-weight: 700; color: #fff; }

/* ==================== History ==================== */
.history-card { width: min(96vw, 1100px); }
.history-empty { text-align: center; padding: 6vmin 2vmin; color: rgba(220,220,255,0.6); }
.empty-icon { font-size: 8vmin; margin-bottom: 2vmin; opacity: 0.5; }
.history-table-wrap { overflow-x: auto; border-radius: 1vmin; }
.history-table {
  width: 100%; border-collapse: separate; border-spacing: 0;
  font-size: 1.8vmin;
}
.history-table th, .history-table td {
  padding: 1.4vmin 0.8vmin; text-align: center; white-space: nowrap;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.history-table th {
  background: rgba(120,120,200,0.25);
  font-weight: 700; color: #fff;
  position: sticky; top: 0;
}
.history-table tr:hover td { background: rgba(255,255,255,0.04); }
.td-score {
  font-weight: 800;
  background: linear-gradient(135deg, #ffd166, #ff8ac6);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* ==================== Landscape Small Screen ==================== */
@media (max-height: 500px) {
  .game-prompt { top: 2vmin; }
  .prompt-badge { font-size: 2vmin; padding: 1vmin 2vmin; }
  .fw-stage { padding-top: 8vmin; }
}
</style>
