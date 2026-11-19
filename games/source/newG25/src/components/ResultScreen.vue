<template>
  <div class="result">
    <div class="bg">
      <div class="spot"></div>
      <div class="confetti" v-for="i in 40" :key="'c'+i" :style="confStyle(i)"></div>
    </div>
    <div class="wrap">
      <div class="trophy-block">
        <div class="trophy">🏆</div>
        <div class="rays"></div>
      </div>
      <div class="title-block">
        <div class="pre">▬ TRAINING COMPLETE ▬</div>
        <h2>{{ t.gameOver }}</h2>
      </div>
      <div class="score-big">
        <div class="score-lbl">{{ t.finalScore }}</div>
        <div class="score-num">{{ r.score }}</div>
      </div>
      <div class="stats">
        <div class="s">
          <div class="s-ico">✓</div>
          <div class="v ok">{{ r.success }}</div>
          <div class="k">{{ t.successCount }}</div>
        </div>
        <div class="s">
          <div class="s-ico">✗</div>
          <div class="v fail">{{ r.fail }}</div>
          <div class="k">{{ t.failCount }}</div>
        </div>
        <div class="s">
          <div class="s-ico">🎯</div>
          <div class="v">{{ r.total }}</div>
          <div class="k">{{ t.totalCount }}</div>
        </div>
        <div class="s">
          <div class="s-ico">📈</div>
          <div class="v hi">{{ r.rate }}%</div>
          <div class="k">{{ t.correctRate }}</div>
        </div>
        <div class="s">
          <div class="s-ico">⚡</div>
          <div class="v">{{ r.avgReaction }}<small>{{ t.reactionMs }}</small></div>
          <div class="k">{{ t.avgReaction }}</div>
        </div>
        <div class="s">
          <div class="s-ico">⭐</div>
          <div class="v">Lv.{{ r.avgLevel }}</div>
          <div class="k">{{ t.difficulty }}</div>
        </div>
      </div>
      <div class="btns">
        <button class="btn" @click="$emit('home')">🏠 {{ t.backHome }}</button>
        <button class="btn primary" @click="$emit('again')">🥊 {{ t.playAgain }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultScreen', props: ['t','r'],
  methods: {
    confStyle(i) {
      const colors = ['#ff3b4c', '#ffd166', '#3080ff', '#22c55e']
      const seed = i * 79
      return {
        left: (seed % 100) + '%',
        background: colors[i % colors.length],
        animationDelay: (i * 0.15) + 's',
        animationDuration: (3 + (i % 4)) + 's',
        transform: `rotate(${(seed * 13) % 360}deg)`,
      }
    }
  }
}
</script>

<style scoped>
.result { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 2vmin; }
.bg { position: absolute; inset: 0; z-index: 0; }
.bg { background:
  radial-gradient(ellipse at 50% 20%, rgba(255,180,80,.18), transparent 55%),
  radial-gradient(ellipse at 50% 0%, #2a1420 0%, #0a0510 60%),
  linear-gradient(180deg, #1a0a18, #0a0510);
}
.spot { position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
  width: 60vmin; height: 60vmin;
  background: radial-gradient(ellipse at top, rgba(255,215,120,.25), transparent 55%);
  filter: blur(3vmin);
}
.confetti {
  position: absolute; top: -5vmin; width: 0.9vmin; height: 1.5vmin;
  animation: confFall linear infinite;
  border-radius: 0.2vmin;
}
@keyframes confFall {
  from { transform: translateY(0) rotate(0);  opacity: 1; }
  to   { transform: translateY(110vh) rotate(720deg); opacity: 0.2; }
}

.wrap { position: relative; z-index: 1; color: #fff; text-align: center; width: min(90vw, 95vmin); max-height: 96vh; display: flex; flex-direction: column; align-items: center; }
.trophy-block { position: relative; display: inline-block; }
.trophy { font-size: 7vmin; animation: floaty 2s ease-in-out infinite;
  filter: drop-shadow(0 1vmin 2vmin rgba(255,180,80,.5));
  position: relative; z-index: 2;
}
@keyframes floaty { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-0.6vmin);} }
.rays {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 16vmin; height: 16vmin; border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(255,215,120,.4), transparent 30deg, rgba(255,215,120,.4) 60deg, transparent 90deg, rgba(255,215,120,.4) 120deg, transparent 150deg, rgba(255,215,120,.4) 180deg, transparent 210deg, rgba(255,215,120,.4) 240deg, transparent 270deg, rgba(255,215,120,.4) 300deg, transparent 330deg);
  filter: blur(1vmin);
  animation: spin 10s linear infinite;
  opacity: .7;
}
@keyframes spin { to { transform: translate(-50%,-50%) rotate(360deg); } }

.title-block { margin-top: 0.5vmin; }
.pre { color: #ffd166; letter-spacing: 0.4vmin; font-size: 1.4vmin; font-weight: 800; margin-bottom: 0.5vmin; }
h2 { font-size: 3.2vmin; letter-spacing: 0.3vmin; font-weight: 900;
  background: linear-gradient(180deg, #fff, #ffd166);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.score-big { margin: 1.5vmin 0; }
.score-lbl { color: rgba(255,255,255,.5); letter-spacing: 0.4vmin; font-size: 1.4vmin; }
.score-num { font-size: 8vmin; font-weight: 900; line-height: 1;
  background: linear-gradient(180deg, #ffd166 0%, #ff8a5b 50%, #ff5568 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 4vmin rgba(255,180,80,.4);
  font-family: 'Bebas Neue', 'Impact', sans-serif;
}

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2vmin; margin-bottom: 2vmin; width: 100%; }
.s { padding: 1.4vmin 1vmin;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  border: 0.15vmin solid rgba(255,255,255,.08); border-radius: 1vmin;
  transition: transform .2s;
}
.s:hover { transform: translateY(-0.3vmin); border-color: rgba(255,255,255,.2); }
.s-ico { font-size: 1.8vmin; margin-bottom: 0.3vmin; opacity: .8; }
.v { font-size: 2.4vmin; font-weight: 900; letter-spacing: 0.1vmin; }
.v small { font-size: 1.2vmin; opacity: .6; margin-left: 0.3vmin; }
.v.ok { color: #22c55e; text-shadow: 0 0 1.5vmin rgba(34,197,94,.4); }
.v.fail { color: #ff5568; text-shadow: 0 0 1.5vmin rgba(255,60,80,.4); }
.v.hi { color: #ffd166; text-shadow: 0 0 1.5vmin rgba(255,180,80,.4); }
.k { color: rgba(255,255,255,.55); letter-spacing: 0.2vmin; font-size: 1.2vmin; margin-top: 0.3vmin; }

.btns { display: flex; gap: 1.5vmin; justify-content: center; flex-wrap: wrap; }
.btn {
  padding: 1.4vmin 3vmin; border-radius: 1vmin;
  border: 0.15vmin solid rgba(255,255,255,.2); background: rgba(255,255,255,.06);
  color: #fff; cursor: pointer;
  font-size: 1.8vmin; font-weight: 700; letter-spacing: 0.2vmin;
  transition: all .2s;
}
.btn:hover { background: rgba(255,255,255,.14); transform: translateY(-0.2vmin); }
.btn.primary { background: linear-gradient(135deg, #ff3b4c, #b8102a); border-color: transparent;
  box-shadow: 0 0.6vmin 2vmin rgba(255,60,80,.5); }

@media (max-aspect-ratio: 3/4) { .stats { grid-template-columns: repeat(2, 1fr); } }
</style>
