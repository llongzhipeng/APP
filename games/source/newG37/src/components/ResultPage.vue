<template>
  <div class="page">
    <div class="bg"><div class="grid"></div><div class="glow g1"></div><div class="glow g2"></div>
      <div class="confetti">
        <span v-for="i in 24" :key="i" :style="cstyle(i)"></span>
      </div>
    </div>
    <div class="content">
      <div class="crown">🏆</div>
      <div class="title">{{ t.resultTitle }}</div>
      <div class="score-big">
        <div class="lbl">{{ t.totalScore }}</div>
        <div class="num">{{ animScore }}</div>
      </div>

      <div class="cards">
        <div class="card"><div class="cl">{{ t.accuracy }}</div><div class="cv">{{ record.rate }}%</div></div>
        <div class="card"><div class="cl">{{ t.avgReact }}</div><div class="cv">{{ record.avgReact }}<span class="u">ms</span></div></div>
        <div class="card"><div class="cl">{{ t.totalCount }}</div><div class="cv">{{ record.total }}</div></div>
        <div class="card ok"><div class="cl">{{ t.successCount }}</div><div class="cv">{{ record.success }}</div></div>
        <div class="card err"><div class="cl">{{ t.failCount }}</div><div class="cv">{{ record.fail }}</div></div>
        <div class="card"><div class="cl">{{ t.difficulty }}</div><div class="cv">L{{ record.difficulty }}</div></div>
      </div>

      <div class="actions">
        <button class="btn" @click="$emit('home')">← {{ t.backHome }}</button>
        <button class="btn primary" @click="$emit('again')">↻ {{ t.playAgain }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultPage',
  props: ['t', 'record'],
  data() { return { animScore: 0 } },
  mounted() {
    // 数字滚动动画
    const target = this.record.score || 0
    const start = performance.now()
    const dur = 1200
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      this.animScore = Math.round(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  },
  methods: {
    cstyle(i) {
      const colors = ['#4facfe','#00f2fe','#7ed957','#ffd453','#b37feb','#ff8a5b']
      const c = colors[i % colors.length]
      return {
        left: (Math.random()*100)+'%',
        background: c,
        animationDelay: (Math.random()*3)+'s',
        animationDuration: (3 + Math.random()*3)+'s'
      }
    }
  }
}
</script>

<style scoped>
.page { position: relative; width: 100%; height: 100%; overflow: hidden;
  background: radial-gradient(ellipse at top,#0d2a4d 0%,#061225 60%,#030814 100%); color: #eaf4ff; }
.bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.grid { position: absolute; inset: 0; background-image:
  linear-gradient(rgba(100,180,255,.05) 1px, transparent 1px),
  linear-gradient(90deg,rgba(100,180,255,.05) 1px, transparent 1px);
  background-size: 60px 60px; mask-image: radial-gradient(ellipse at center,#000 30%,transparent 75%); }
.glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .55; }
.g1 { width: 40vw; height: 40vw; background: #1c56c9; top: -12vw; left: -10vw; }
.g2 { width: 40vw; height: 40vw; background: #b37feb; bottom: -12vw; right: -10vw; }
.confetti { position: absolute; inset: 0; overflow: hidden; }
.confetti span { position: absolute; top: -10%; width: 10px; height: 18px; border-radius: 2px;
  animation: fall linear infinite; opacity: .8; }
@keyframes fall { to { transform: translateY(120vh) rotate(720deg); opacity: 0; } }

.content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4vh 4vw; box-sizing: border-box; }
.crown { font-size: 10vh; filter: drop-shadow(0 0 30px rgba(255,212,83,.6)); animation: bounce 1.6s ease infinite; }
@keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1vh) } }
.title { font-size: 4vh; font-weight: 900; letter-spacing: .12em; margin-top: 1vh;
  background: linear-gradient(90deg,#4facfe,#00f2fe,#b37feb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.score-big { margin: 3vh 0; text-align: center; padding: 2vh 5vh; border-radius: 20px;
  background: linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.01));
  border: 1px solid rgba(120,200,255,.25); backdrop-filter: blur(10px); }
.score-big .lbl { font-size: 1.6vh; color: #7ea6d0; letter-spacing: .2em; text-transform: uppercase; }
.score-big .num { font-size: 12vh; font-weight: 900; line-height: 1;
  background: linear-gradient(180deg,#ffd453,#ff8a5b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 30px rgba(255,212,83,.3)); font-variant-numeric: tabular-nums; }

.cards { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 1.4vh; width: min(920px,90vw); margin-bottom: 4vh; }
.card { padding: 2vh 1vh; border-radius: 14px; text-align: center;
  background: linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
  border: 1px solid rgba(120,200,255,.2); transition: .2s; }
.card:hover { transform: translateY(-4px); border-color: rgba(120,200,255,.5); }
.card.ok { border-color: rgba(126,217,87,.35); background: linear-gradient(180deg,rgba(126,217,87,.12),transparent); }
.card.err { border-color: rgba(255,107,107,.35); background: linear-gradient(180deg,rgba(255,107,107,.12),transparent); }
.cl { font-size: 1.3vh; color: #7ea6d0; letter-spacing: .18em; text-transform: uppercase; }
.cv { margin-top: .8vh; font-size: 3vh; font-weight: 800; color: #eaf4ff; font-variant-numeric: tabular-nums; }
.cv .u { font-size: 1.4vh; color: #7ea6d0; margin-left: 4px; }

.actions { display: flex; gap: 2vh; }
.btn { padding: 2vh 3.5vh; font-size: 2vh; font-weight: 700; letter-spacing: .08em;
  background: rgba(255,255,255,.08); color: #eaf4ff; border: 1px solid rgba(120,200,255,.35);
  border-radius: 999px; cursor: pointer; transition: .25s; }
.btn:hover { background: rgba(80,180,255,.2); transform: translateY(-2px); }
.btn.primary { background: linear-gradient(90deg,#4facfe,#00c8ff); color: #05203c; border-color: transparent;
  box-shadow: 0 16px 40px rgba(79,172,254,.4); }

@media (max-width: 900px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
  .score-big .num { font-size: 8vh; }
}
</style>
