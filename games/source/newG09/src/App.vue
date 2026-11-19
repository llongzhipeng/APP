<template>
  <div id="app">
    <!-- HOME -->
    <template v-if="screen === 'home'">
      <div class="scene" :style="containerStyle">
        <img :src="resolveImage('/image/1.jpg')" class="bg-img" />
        <div class="home-overlay">
          <h1 class="game-title">{{ t('title') }}</h1>
          <div class="home-btns">
            <button class="btn-main" @click="screen='tutorial'">{{ t('startGame') }}</button>
            <button class="btn-main" @click="screen='rules'">{{ t('rules') }}</button>
            <button class="btn-main" @click="screen='history'">{{ t('history') }}</button>
          </div>
        </div>
        <button class="lang-btn" @click="lang = lang==='zh'?'en':'zh'">{{ lang==='zh'?'EN':'中文' }}</button>
      </div>
    </template>

    <!-- RULES -->
    <template v-if="screen === 'rules'">
      <div class="scene" :style="containerStyle">
        <img :src="resolveImage('/image/1.jpg')" class="bg-img" />
        <div class="modal-box">
          <h2>{{ t('rulesTitle') }}</h2>
          <table class="rules-table">
            <thead><tr><th>{{ t('diff') }}</th><th>{{ t('holes') }}</th><th>{{ t('interval') }}</th><th>{{ t('duration') }}</th><th>{{ t('coeff') }}</th></tr></thead>
            <tbody>
              <tr v-for="(d,i) in DIFFICULTIES" :key="i">
                <td>{{ i+1 }}</td><td>{{ d.holes }}</td><td>{{ d.spawnInterval/1000 }}s</td><td>{{ d.displayDuration/1000 }}s</td><td>{{ d.coefficient }}</td>
              </tr>
            </tbody>
          </table>
          <button class="btn-main" @click="screen='home'" style="margin-top:16px">{{ t('back') }}</button>
        </div>
      </div>
    </template>

    <!-- TUTORIAL -->
    <template v-if="screen === 'tutorial'">
      <div class="scene" :style="containerStyle">
        <img :src="resolveImage('/image/1.jpg')" class="bg-img" />
        <div class="modal-box tutorial-box">
          <div class="tut-step" v-if="tutStep===0">
            <div class="tut-demo">
              <div class="tut-hole"><div class="tut-mole" :class="{pop: tutAnim}"><img :src="resolveImage('/image/Diglett.png')" /></div></div>
            </div>
          </div>
          <div class="tut-step" v-if="tutStep===1">
            <div class="tut-demo">
              <div class="tut-hole tut-hit" :class="{shake: tutAnim}">
                <div class="tut-mole show"><img :src="resolveImage('/image/Diglett.png')" /></div>
                <div class="tut-cursor" :class="{swing: tutAnim}">🔨</div>
              </div>
            </div>
          </div>
          <div class="tut-step" v-if="tutStep===2">
            <div class="tut-demo">
              <div class="tut-score-anim" :class="{rise: tutAnim}">+5</div>
              <div style="font-size:2em">🏆</div>
            </div>
          </div>
          <div class="tut-nav">
            <button class="btn-sm" @click="tutStep>0&&(tutStep--)" :disabled="tutStep===0">{{ t('prev') }}</button>
            <span>{{ tutStep+1 }} / 3</span>
            <button class="btn-sm" @click="tutStep<2?(tutStep++):onTutorialDone()">{{ tutStep<2?t('next'):t('start') }}</button>
            <button class="btn-sm" @click="onTutorialDone()">{{ t('skip') }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- DURATION -->
    <template v-if="screen === 'duration'">
      <div class="scene" :style="containerStyle">
        <img :src="resolveImage('/image/1.jpg')" class="bg-img" />
        <div class="modal-box">
          <h2>{{ t('selectDuration') }}</h2>
          <div class="dur-btns">
            <button class="btn-dur" @click="startGame(60)">1 {{ t('min') }}</button>
            <button class="btn-dur" @click="startGame(180)">3 {{ t('min') }}</button>
            <button class="btn-dur" @click="startGame(300)">5 {{ t('min') }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- GAME -->
    <template v-if="screen === 'game'">
      <div class="scene game-scene" :style="containerStyle" ref="gameScene" @mousemove="onSceneMouseMove">
        <img :src="curDiff.bg" class="bg-img" />
        <div class="hud">
          <span>{{ t('diff') }}: {{ diffLevel }}</span>
          <span>{{ t('score') }}: {{ score }}</span>
          <span>{{ t('timeLeft') }}: {{ timeLeft }}s</span>
        </div>
        <button v-if="showBatchSkip" class="skip-btn" @click="onSkipClick">{{ t('skipGame') }}</button>
        <button class="back-btn" @click="requestQuit">{{ t('back') }}</button>
        <div
          v-for="mole in activeMoles" :key="mole.id"
          class="mole-wrap"
          :class="{'mole-hit': mole.hitting, 'mine-wrap': mole.type==='mine'}"
          :style="moleStyle(mole)"
          @click.stop="hitItem(mole)"
        >
          <img v-if="mole.exploded" :src="resolveImage('/image/beng.png')" class="mole-img explode-img" />
          <img v-else :src="mole.type==='mine' ? resolveImage('/image/landmine.png') : resolveImage('/image/Diglett.png')" class="mole-img" />
        </div>
        <div class="hammer-cursor" :class="{swing: hammerSwing}" :style="hammerStyle">🔨</div>
        <div
          v-for="fx in scoreFx" :key="'fx'+fx.id"
          class="score-fx" :class="{minus: fx.value < 0}"
          :style="{left: fx.x+'px', top: fx.y+'px'}"
        >{{ fx.value > 0 ? '+'+fx.value : fx.value }}</div>
        <div v-if="showQuitConfirm" class="confirm-mask" @click.self="cancelQuit">
          <div class="confirm-box">
            <p class="confirm-text">{{ t('quitConfirm') }}</p>
            <div class="confirm-btns">
              <button class="btn-sm confirm-cancel" @click="cancelQuit">{{ t('cancel') }}</button>
              <button class="btn-sm confirm-ok" @click="confirmQuit">{{ t('confirm') }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- RESULT -->
    <template v-if="screen === 'result'">
      <div class="scene" :style="containerStyle">
        <img :src="resolveImage('/image/1.jpg')" class="bg-img" />
        <div class="modal-box">
          <h2>{{ t('result') }}</h2>
          <div class="result-grid">
            <div>{{ t('score') }}: <b>{{ lastRecord.score }}</b></div>
            <div>{{ t('totalHits') }}: {{ lastRecord.total }}</div>
            <div>{{ t('success') }}: {{ lastRecord.success }}</div>
            <div>{{ t('fail') }}: {{ lastRecord.fail }}</div>
            <div>{{ t('accuracy') }}: {{ lastRecord.accuracy }}%</div>
            <div>{{ t('avgReaction') }}: {{ lastRecord.avgReactionTime }}ms</div>
          </div>
          <button class="btn-main" @click="screen='home'" style="margin-top:16px">{{ t('back') }}</button>
        </div>
      </div>
    </template>

    <!-- HISTORY -->
    <template v-if="screen === 'history'">
      <div class="scene" :style="containerStyle">
        <img :src="resolveImage('/image/1.jpg')" class="bg-img" />
        <div class="modal-box history-box">
          <h2>{{ t('history') }}</h2>
          <div class="hist-scroll">
            <table class="rules-table" v-if="history.length">
              <thead><tr><th>{{ t('date') }}</th><th>{{ t('diff') }}</th><th>{{ t('timeSec') }}</th><th>{{ t('score') }}</th><th>{{ t('accuracy') }}</th></tr></thead>
              <tbody>
                <tr v-for="(r,i) in history" :key="i">
                  <td>{{ r.date }}</td><td>{{ r.difficulty }}</td><td>{{ r.duration }}s</td><td>{{ r.score }}</td><td>{{ r.accuracy }}%</td>
                </tr>
              </tbody>
            </table>
            <div v-else style="padding:20px;text-align:center">{{ t('noHistory') }}</div>
          </div>
          <button class="btn-main" @click="screen='home'" style="margin-top:12px">{{ t('back') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { resolveImage } from './assets'
const DIFFICULTIES = [
  { holes:4, spawnInterval:3000, displayDuration:2500, coefficient:1,   bg:resolveImage('/image/1.jpg') },
  { holes:5, spawnInterval:2500, displayDuration:2000, coefficient:1.5, bg:resolveImage('/image/2.jpg') },
  { holes:6, spawnInterval:2000, displayDuration:1800, coefficient:2,   bg:resolveImage('/image/3.jpg') },
  { holes:7, spawnInterval:1800, displayDuration:1500, coefficient:2.5, bg:resolveImage('/image/4.png') },
  { holes:8, spawnInterval:1500, displayDuration:1300, coefficient:3,   bg:resolveImage('/image/5.jpg') },
  { holes:9, spawnInterval:1300, displayDuration:1000, coefficient:3.5, bg:resolveImage('/image/6.jpg') },
];

const HOLE_POSITIONS = [
  [[38.13,26.63],[38.37,72.86],[75.31,25.89],[75.44,73.5]],
  [[38.13,26.53],[38.31,72.89],[53.53,49.92],[75.27,25.82],[75.38,73.53]],
  [[27.56,49.56],[37.81,25.57],[38.1,74.08],[53.23,49.58],[75.32,25.9],[75.45,73.53]],
  [[36.01,25.84],[35.81,74.47],[54.23,49.98],[55.1,12.65],[55.38,87.54],[75.26,25.82],[75.37,73.51]],
  [[32.26,50.18],[36.02,25.91],[36.05,74.49],[54.34,49.98],[55.21,12.71],[55.51,87.41],[75.44,25.86],[75.54,73.51]],
  [[29.18,49.96],[36.59,25.52],[36.99,74.0],[51.53,50.0],[57.63,15.47],[58.19,83.76],[75.8,28.48],[80.38,49.79],[76.42,71.43]]
];

const I18N = {
  zh: {
    title:'打地鼠', startGame:'开始游戏', rules:'规则介绍', history:'历史记录',
    rulesTitle:'难度规则', diff:'难度', holes:'洞口', interval:'间隔(秒)', duration:'停留(秒)', coeff:'系数',
    back:'返回', skip:'跳过', prev:'上一步', next:'下一步', start:'开始',
    selectDuration:'选择训练时长', min:'分钟',
    score:'得分', timeLeft:'剩余时间',
    result:'游戏结果', totalHits:'总次数', success:'命中', fail:'失败',
    accuracy:'正确率', avgReaction:'平均反应',
    date:'日期', timeSec:'时长', noHistory:'暂无记录',
    quitConfirm:'确定要退出本次游戏吗？', confirm:'确定', cancel:'取消',
    skipGame:'跳过',
  },
  en: {
    title:'Whack-a-Mole', startGame:'Start Game', rules:'Rules', history:'History',
    rulesTitle:'Difficulty Rules', diff:'Diff', holes:'Holes', interval:'Interval(s)', duration:'Duration(s)', coeff:'Coeff',
    back:'Back', skip:'Skip', prev:'Prev', next:'Next', start:'Start',
    selectDuration:'Select Duration', min:'Min',
    score:'Score', timeLeft:'Time Left',
    result:'Result', totalHits:'Total', success:'Hit', fail:'Miss',
    accuracy:'Accuracy', avgReaction:'Avg Reaction',
    date:'Date', timeSec:'Duration', noHistory:'No records',
    quitConfirm:'Are you sure you want to quit the game?', confirm:'Confirm', cancel:'Cancel',
    skipGame:'Skip',
  }
};

import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const GAME_TYPE = 'dds'

export default {
  name: 'App',
  data() {
    return {
      DIFFICULTIES,
      screen: 'home',
      lang: 'zh',
      tutStep: 0,
      tutAnim: false,
      tutTimer: null,
      diffLevel: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      timeLeft: 0,
      gameDuration: 60,
      activeMoles: [],
      moleId: 0,
      spawnTimer: null,
      gameTimer: null,
      periodTimer: null,
      periodHits: 0,
      periodTotal: 0,
      totalHits: 0,
      totalMoles: 0,
      reactionTimes: [],
      lastRecord: {},
      history: JSON.parse(localStorage.getItem('wam-history') || '[]'),
      mouseX: 0,
      mouseY: 0,
      hammerSwing: false,
      scoreFx: [],
      fxId: 0,
      showQuitConfirm: false,
      paused: false,
      pauseAt: 0,
      nextSpawnAt: 0,
      pausedSpawnRemaining: 0,
      archiveId: -1,
      showBatchSkip: shouldShowPbBatchSkip(),
    };
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route);
  },
  computed: {
    /**
     * 舞台铺满视口（洞口为百分比坐标，背景 stretch 后仍对齐）
     */
    containerStyle() {
      return { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }; // 全屏尺寸，避免固定宽高比留边
    },
    curDiff() { return DIFFICULTIES[this.diffLevel - 1]; },
    holes() { return HOLE_POSITIONS[this.diffLevel - 1]; },
    hammerStyle() {
      return { left: this.mouseX + 'px', top: this.mouseY + 'px' };
    },
  },
  watch: {
    tutStep() {
      this.tutAnim = false;
      this.$nextTick(() => { this.tutAnim = true; });
    },
    screen(v) {
      if (v === 'tutorial') { this.tutStep = 0; this.$nextTick(() => { this.tutAnim = true; }); }
    }
  },
  methods: { resolveImage,
    t(k) { return (I18N[this.lang] || I18N.zh)[k] || k; },
    onTutorialDone() {
      if (afterBatchTutorial(GAME_TYPE, (sec) => this.startGame(sec))) return;
      this.screen = 'duration';
    },
    onSkipClick() { skipPbBatchGame(); },

    startGame(seconds) {
      this.gameDuration = seconds;
      this.timeLeft = seconds;
      this.diffLevel = getBatchStartDifficultyForGame(GAME_TYPE);
      this.score = 0;
      this.activeMoles = [];
      this.moleId = 0;
      this.totalHits = 0;
      this.totalMoles = 0;
      this.reactionTimes = [];
      this.periodHits = 0;
      this.periodTotal = 0;
      this.paused = false;
      this.showQuitConfirm = false;
      this.screen = 'game';
      this.$nextTick(() => { this.scheduleSpawn(); this.startTimers(); });
    },

    scheduleSpawn() {
      clearTimeout(this.spawnTimer);
      const delay = this.curDiff.spawnInterval;
      this.nextSpawnAt = Date.now() + delay;
      this.spawnTimer = setTimeout(() => {
        this.spawnMole();
        this.scheduleSpawn();
      }, delay);
    },

    spawnMole() {
      const usedHoles = new Set(this.activeMoles.map(m => m.holeIndex));
      const available = [];
      for (let i = 0; i < this.curDiff.holes; i++) {
        if (!usedHoles.has(i)) available.push(i);
      }
      if (!available.length) return;
      const holeIndex = available[Math.floor(Math.random() * available.length)];
      const id = ++this.moleId;
      const isMine = Math.random() < 0.3;
      const now = Date.now();
      const mole = {
        id, holeIndex, spawnTime: now, hitting: false,
        type: isMine ? 'mine' : 'mole', exploded: false,
        expireAt: now + this.curDiff.displayDuration,
        expireTimer: null,
      };
      mole.expireTimer = setTimeout(() => { this.removeMole(id); }, this.curDiff.displayDuration);
      this.activeMoles.push(mole);
      if (!isMine) {
        this.totalMoles++;
        this.periodTotal++;
      }
    },

    hitItem(mole) {
      if (this.paused) return;
      if (mole.hitting) return;
      this.hammerSwing = false;
      this.$nextTick(() => { this.hammerSwing = true; });
      setTimeout(() => { this.hammerSwing = false; }, 250);
      if (mole.type === 'mine') {
        mole.hitting = true;
        mole.exploded = true;
        this.score -= 10;
        this.showScoreFx(-10);
        setTimeout(() => { this.removeMole(mole.id); }, 400);
        return;
      }
      const rt = Date.now() - mole.spawnTime;
      this.reactionTimes.push(rt);
      const gain = Math.round(5 * this.curDiff.coefficient);
      this.score += gain;
      this.showScoreFx(gain);
      this.totalHits++;
      this.periodHits++;
      mole.hitting = true;
      setTimeout(() => { this.removeMole(mole.id); }, 200);
    },

    showScoreFx(value) {
      const id = ++this.fxId;
      const fx = { id, value, x: this.mouseX, y: this.mouseY };
      this.scoreFx.push(fx);
      setTimeout(() => {
        const i = this.scoreFx.findIndex(f => f.id === id);
        if (i !== -1) this.scoreFx.splice(i, 1);
      }, 700);
    },

    removeMole(id) {
      const idx = this.activeMoles.findIndex(m => m.id === id);
      if (idx !== -1) {
        const m = this.activeMoles[idx];
        if (m.expireTimer) clearTimeout(m.expireTimer);
        this.activeMoles.splice(idx, 1);
      }
    },

    requestQuit() {
      this.pauseGame();
      this.showQuitConfirm = true;
    },
    cancelQuit() {
      this.showQuitConfirm = false;
      this.resumeGame();
    },
    confirmQuit() {
      this.showQuitConfirm = false;
      clearTimeout(this.spawnTimer);
      clearInterval(this.gameTimer);
      clearInterval(this.periodTimer);
      this.activeMoles = [];
      leavePbGameWindow({ confirm: false });
    },

    pauseGame() {
      if (this.paused) return;
      this.paused = true;
      const now = Date.now();
      this.pauseAt = now;
      clearInterval(this.gameTimer);
      clearInterval(this.periodTimer);
      clearTimeout(this.spawnTimer);
      this.pausedSpawnRemaining = Math.max(0, this.nextSpawnAt - now);
      this.activeMoles.forEach(m => {
        if (m.expireTimer) { clearTimeout(m.expireTimer); m.expireTimer = null; }
        m.remaining = Math.max(0, m.expireAt - now);
      });
    },
    resumeGame() {
      if (!this.paused) return;
      this.paused = false;
      const now = Date.now();
      const pauseDelta = now - this.pauseAt;
      this.activeMoles.forEach(m => {
        const remaining = m.remaining != null ? m.remaining : Math.max(0, m.expireAt - now);
        m.expireAt = now + remaining;
        m.spawnTime += pauseDelta;
        const id = m.id;
        m.expireTimer = setTimeout(() => { this.removeMole(id); }, remaining);
      });
      const delay = this.pausedSpawnRemaining || this.curDiff.spawnInterval;
      this.nextSpawnAt = now + delay;
      this.spawnTimer = setTimeout(() => {
        this.spawnMole();
        this.scheduleSpawn();
      }, delay);
      this.startTimers();
    },

    moleStyle(mole) {
      const [top, left] = this.holes[mole.holeIndex];
      return {
        position: 'absolute',
        left: left + '%',
        top: top + '%',
        transform: 'translate(-50%, -50%)',
        width: '16%',
        cursor: 'none',
        zIndex: 10,
      };
    },

    onSceneMouseMove(e) {
      const rect = this.$refs.gameScene && this.$refs.gameScene.getBoundingClientRect();
      if (!rect) return;
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    },

    startTimers() {
      clearInterval(this.gameTimer);
      this.gameTimer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) this.endGame(false);
      }, 1000);

      clearInterval(this.periodTimer);
      this.periodTimer = setInterval(() => {
        if (this.periodTotal > 0) {
          const acc = this.periodHits / this.periodTotal;
          if (acc > 0.9 && this.diffLevel < 6) this.diffLevel++;
          else if (acc < 0.7 && this.diffLevel > 1) this.diffLevel--;
        }
        this.periodHits = 0;
        this.periodTotal = 0;
        this.scheduleSpawn();
      }, 60000);
    },

    endGame() {
      clearTimeout(this.spawnTimer);
      clearInterval(this.gameTimer);
      clearInterval(this.periodTimer);
      this.activeMoles = [];
      const elapsed = this.gameDuration - this.timeLeft;
      const fail = this.totalMoles - this.totalHits;
      const accuracy = this.totalMoles ? Math.round(this.totalHits / this.totalMoles * 100) : 0;
      const avgRT = this.reactionTimes.length
        ? Math.round(this.reactionTimes.reduce((a,b) => a+b, 0) / this.reactionTimes.length)
        : 0;
      const now = new Date();
      const date = now.toLocaleDateString('zh-CN') + ' ' + now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
      this.lastRecord = {
        date, project:'打地鼠', difficulty: this.diffLevel,
        duration: elapsed, total: this.totalMoles,
        success: this.totalHits, fail,
        accuracy, avgReactionTime: avgRT, score: this.score
      };
      this.history.unshift(this.lastRecord);
      if (this.history.length > 50) this.history.pop();
      localStorage.setItem('wam-history', JSON.stringify(this.history));
      submitPbGameEndRecord(this.archiveId, GAME_TYPE, {
        avgTime: toPbGameSeconds(avgRT),
        score: this.score,
        successCount: this.totalHits,
        failCount: fail,
        trainDuration: elapsed,
        difficultyLevel: this.diffLevel,
      }).catch(() => {});
      this.screen = 'result';
    },
  },
  mounted() {
    applyBatchTutorialEntry(GAME_TYPE, {
      setDuration: (sec) => { this.gameDuration = sec; },
      openTutorial: () => { this.screen = 'tutorial'; this.tutStep = 0; },
    });
  },
  beforeDestroy() {
    clearTimeout(this.spawnTimer);
    clearInterval(this.gameTimer);
    clearInterval(this.periodTimer);
  },
};
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #0d2b0d; }

#app {
  width: 100vw; height: 100vh; overflow: hidden;
  background: #0d2b0d;
}

.scene { width: 100%; height: 100%; }
.bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; display: block; }

.home-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 3%;
}
.game-title {
  color: #fff; font-size: 4.5vmin; text-shadow: 0 2px 8px rgba(0,0,0,.7);
  font-weight: bold; letter-spacing: 4px;
}
.home-btns { display: flex; flex-direction: column; align-items: center; }

.btn-main {
  background: rgba(34,100,34,0.85); color: #fff; border: 2px solid #7cfc00;
  border-radius: 8px; padding: 1.5vmin 5vmin; font-size: 2.5vmin; cursor: pointer;
  min-width: 30vmin; margin: 1vmin 0; transition: background .2s;
}
.btn-main:hover { background: rgba(60,160,60,0.95); }

.lang-btn {
  position: absolute; top: 2%; right: 2%;
  background: rgba(0,0,0,0.5); color: #fff; border: 1px solid #aaa;
  border-radius: 6px; padding: 0.8vmin 2vmin; font-size: 1.8vmin; cursor: pointer; z-index: 20;
}

.modal-box {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: rgba(10,40,10,0.92); border: 2px solid #5a9e5a; border-radius: 12px;
  padding: 3vmin 4vmin; color: #fff; min-width: 50vmin; max-width: 90%;
  z-index: 20; text-align: center;
}
.modal-box h2 { font-size: 3vmin; margin-bottom: 2vmin; color: #7cfc00; }

.rules-table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
.rules-table th, .rules-table td {
  border: 1px solid #5a9e5a; padding: 1vmin 1.5vmin; text-align: center;
}
.rules-table th { background: rgba(80,150,80,0.4); }

.dur-btns { display: flex; gap: 3vmin; justify-content: center; margin-top: 2vmin; }
.btn-dur {
  background: #2d7a2d; color: #fff; border: 2px solid #7cfc00;
  border-radius: 8px; padding: 2vmin 4vmin; font-size: 2.5vmin; cursor: pointer;
}
.btn-dur:hover { background: #3da83d; }

.tutorial-box { min-width: 60vmin; max-width: 95vw; }
.tut-step { min-height: 20vmin; display: flex; align-items: center; justify-content: center; }
.tut-demo { display: flex; align-items: center; justify-content: center; gap: 4vmin; position: relative; }
.tut-hole {
  width: 12vmin; height: 10vmin; background: rgba(30,15,0,0.8);
  border-radius: 50%; position: relative; display: flex; align-items: flex-end; justify-content: center;
  overflow: hidden; border: 3px solid #6b3a00;
}
.tut-mole { width: 80%; position: absolute; bottom: -100%; transition: bottom 0.5s ease-out; }
.tut-mole.pop, .tut-mole.show { bottom: 0; }
.tut-mole img { width: 100%; height: auto; }
.tut-cursor { font-size: 4vmin; position: absolute; top: -1vmin; right: -4vmin; transition: transform 0.3s; }
.tut-cursor.swing { transform: rotate(45deg) translate(1vmin, 1vmin); }
.tut-hit { overflow: visible; }
.tut-score-anim {
  font-size: 5vmin; color: #ffdd00; font-weight: bold;
  opacity: 0; transform: translateY(0); transition: opacity 0.5s, transform 0.6s;
  position: absolute;
}
.tut-score-anim.rise { opacity: 1; transform: translateY(-4vmin); }
.tut-nav {
  display: flex; gap: 2vmin; align-items: center; justify-content: center;
  margin-top: 3vmin; font-size: 3vmin; color: #fff;
  flex-wrap: nowrap; white-space: nowrap;
}
.tut-nav .btn-sm {
  background: #2d7a2d; color: #fff; border: 2px solid #7cfc00;
  border-radius: 10px; padding: 1.5vmin 3vmin; font-size: 2.6vmin; cursor: pointer;
  font-weight: bold; white-space: nowrap; flex-shrink: 0;
}
.tut-nav .btn-sm:hover { background: #3da83d; }
.tut-nav .btn-sm:disabled { opacity: 0.4; cursor: default; }
.btn-sm {
  background: #2d7a2d; color: #fff; border: 1px solid #7cfc00;
  border-radius: 6px; padding: 0.8vmin 2.5vmin; font-size: 1.8vmin; cursor: pointer;
}
.btn-sm:disabled { opacity: 0.4; cursor: default; }

.hud {
  position: absolute; top: 2%; left: 2%; z-index: 20;
  background: rgba(0,0,0,0.55); border-radius: 8px; padding: 1vmin 2vmin;
  color: #fff; font-size: 2vmin; display: flex; gap: 3vmin;
}
.back-btn {
  position: absolute; top: 2%; right: 2%; z-index: 20;
  background: rgba(150,30,30,0.8); color: #fff; border: 1px solid #ff6666;
  border-radius: 6px; padding: 0.8vmin 2vmin; font-size: 1.8vmin; cursor: pointer;
}

.mole-wrap { position: absolute; z-index: 10; }
.mole-img { width: 100%; height: auto; display: block; animation: mole-pop 0.15s ease-out; }
@keyframes mole-pop { from { transform: scaleY(0.2); } to { transform: scaleY(1); } }
.mole-hit .mole-img { animation: mole-die 0.2s ease-in forwards; }
@keyframes mole-die { to { transform: scale(1.3); opacity: 0; } }
.mine-wrap .mole-img { animation: mine-pop 0.2s ease-out; }
@keyframes mine-pop { from { transform: scale(0.3) rotate(-15deg); } to { transform: scale(1) rotate(0); } }
.explode-img { animation: explode 0.4s ease-out forwards !important; }
@keyframes explode {
  0% { transform: scale(0.5); opacity: 1; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}

.game-scene { cursor: none; }
.game-scene .hud, .game-scene .back-btn { cursor: default; }
.hammer-cursor {
  position: absolute; font-size: 8vmin; pointer-events: none; z-index: 100;
  transform: translate(-20%, -70%) rotate(-20deg);
  transition: transform 0.12s ease-out;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}
.hammer-cursor.swing { transform: translate(-20%, -70%) rotate(45deg) scale(1.1); }

.score-fx {
  position: absolute; font-size: 4vmin; font-weight: bold; color: #ffdd00;
  pointer-events: none; z-index: 101; text-shadow: 0 2px 4px rgba(0,0,0,0.7);
  animation: score-rise 0.7s ease-out forwards;
  transform: translate(-50%, -100%);
}
.score-fx.minus { color: #ff4444; }
@keyframes score-rise {
  0% { opacity: 1; transform: translate(-50%, -100%); }
  100% { opacity: 0; transform: translate(-50%, -220%); }
}

.history-box { max-height: 80vh; }
.hist-scroll { max-height: 50vmin; overflow-y: auto; }
.result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2vmin; font-size: 2vmin; padding: 1vmin 0; }

.confirm-mask {
  position: absolute; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; cursor: default;
}
.confirm-box {
  background: rgba(10,40,10,0.98); border: 2px solid #7cfc00; border-radius: 12px;
  padding: 3vmin 4vmin; color: #fff; min-width: 40vmin; text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
.confirm-text { font-size: 2.4vmin; margin-bottom: 2.5vmin; color: #fff; }
.confirm-btns { display: flex; gap: 2vmin; justify-content: center; }
.confirm-ok { background: #2d7a2d; }
.confirm-cancel { background: #7a2d2d; border-color: #ff9999; }

.skip-btn {
  position: absolute; top: 2%; right: calc(2% + 12vmin); z-index: 20;
  background: rgba(80,80,80,0.8); color: #fff; border: 1px solid #aaa;
  border-radius: 6px; padding: 0.8vmin 2vmin; font-size: 1.8vmin; cursor: pointer;
}
.skip-btn:hover { background: rgba(110,110,110,0.9); }

@media (orientation: portrait) {
  .game-title { font-size: max(6vmin, 22px); letter-spacing: 2px; }
  .btn-main {
    font-size: max(3.5vmin, 16px); padding: max(2vmin, 12px) max(6vmin, 24px);
    min-width: 80%; border-radius: 14px; margin: max(1.5vmin, 8px) 0;
  }
  .home-btns { width: 100%; align-items: stretch; padding: 0 5%; }

  .lang-btn {
    font-size: max(2.6vmin, 13px); padding: max(1vmin, 6px) max(2.5vmin, 12px);
    border-radius: 8px;
    top: calc(2% + env(safe-area-inset-top));
  }

  .modal-box {
    min-width: unset; width: 90vw; max-width: 90vw;
    padding: max(4vmin, 20px) max(4vmin, 18px);
    border-radius: 16px;
  }
  .modal-box h2 { font-size: max(4vmin, 18px); }

  /* rules & history: table -> card style */
  .rules-table, .rules-table thead, .rules-table tbody,
  .rules-table tr, .rules-table th, .rules-table td { display: block; width: 100%; }
  .rules-table thead { display: none; }
  .rules-table tr {
    background: rgba(80,150,80,0.15); border: 1px solid #5a9e5a;
    border-radius: 10px; margin-bottom: max(1.5vmin, 8px); padding: max(1.5vmin, 8px);
  }
  .rules-table td {
    border: none; text-align: center; font-size: max(2.8vmin, 14px);
    padding: max(0.6vmin, 4px) max(1vmin, 6px); display: inline-block; width: auto;
  }
  .rules-table td + td::before {
    content: '·'; margin: 0 0.6em; color: #7cfc00;
  }

  .dur-btns { flex-direction: column; gap: max(2vmin, 12px); }
  .btn-dur {
    font-size: max(3.5vmin, 16px); padding: max(2vmin, 12px) max(6vmin, 24px);
    width: 100%; border-radius: 12px;
  }

  .tutorial-box { min-width: unset; width: 90vw; }
  .tut-nav {
    flex-wrap: wrap; gap: max(1.5vmin, 8px);
  }
  .btn-sm { font-size: max(2.8vmin, 14px); padding: max(1.2vmin, 8px) max(3vmin, 14px); border-radius: 8px; }
  .tut-hole { width: max(22vmin, 90px); height: max(18vmin, 76px); }
  .tut-cursor { font-size: max(6vmin, 26px); }

  .hud {
    top: 0; left: 0; right: auto;
    padding: calc(max(1.2vmin, 8px) + env(safe-area-inset-top)) max(2vmin, 10px) max(1.2vmin, 8px);
    font-size: max(3vmin, 13px); gap: max(2vmin, 10px);
    border-radius: 0 0 8px 0;
  }
  .back-btn {
    top: calc(2% + env(safe-area-inset-top));
    font-size: max(3vmin, 13px); padding: max(1vmin, 6px) max(2.5vmin, 12px);
    border-radius: 8px;
  }
  .skip-btn {
    top: calc(2% + env(safe-area-inset-top));
    right: calc(2% + max(16vmin, 76px));
    font-size: max(3vmin, 13px); padding: max(1vmin, 6px) max(2.5vmin, 12px);
    border-radius: 8px;
  }

  .result-grid { grid-template-columns: 1fr; gap: max(1.5vmin, 8px); font-size: max(3.2vmin, 15px); }
  .hist-scroll { max-height: 60vh; padding-bottom: env(safe-area-inset-bottom); }

  .confirm-box {
    min-width: unset; width: 90vw; padding: max(4vmin, 20px) max(4vmin, 18px);
    border-radius: 16px;
  }
  .confirm-text { font-size: max(3.6vmin, 16px); }
  .confirm-btns { gap: max(3vmin, 14px); }
  .confirm-btns .btn-sm { flex: 1; font-size: max(3.2vmin, 15px); padding: max(1.5vmin, 10px); }

  .score-fx { font-size: max(5vmin, 22px); }
  .hammer-cursor { font-size: max(10vmin, 44px); }
}
</style>
