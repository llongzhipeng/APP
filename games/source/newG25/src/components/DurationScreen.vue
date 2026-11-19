<template>
  <div class="dur">
    <div class="bg">
      <div class="spot"></div>
      <div class="grid-lines"></div>
    </div>
    <div class="wrap">
      <div class="header">
        <div class="pre">▬ ROUND SETUP ▬</div>
        <h2>{{ t.selectDuration }}</h2>
      </div>

      <div class="cards">
        <div class="card" :class="{active: sel===60}" @click="sel=60">
          <div class="icon">⏱</div>
          <div class="num-line"><span class="big">1</span><span class="unit">MIN</span></div>
          <div class="desc">{{ t.oneMin }}</div>
          <div class="tag">Quick</div>
        </div>
        <div class="card featured" :class="{active: sel===180}" @click="sel=180">
          <div class="ribbon">★ RECOMMENDED ★</div>
          <div class="icon">🥊</div>
          <div class="num-line"><span class="big">3</span><span class="unit">MIN</span></div>
          <div class="desc">{{ t.threeMin }}</div>
          <div class="tag">Standard</div>
        </div>
        <div class="card" :class="{active: sel===360}" @click="sel=360">
          <div class="icon">🔥</div>
          <div class="num-line"><span class="big">6</span><span class="unit">MIN</span></div>
          <div class="desc">{{ t.sixMin }}</div>
          <div class="tag">Intense</div>
        </div>
      </div>

      <div class="foot">
        <button class="btn" @click="$emit('back')">◀ {{ t.back }}</button>
        <button class="btn primary" @click="$emit('start', sel)">
          <span>🥊</span> {{ t.startTraining }} <span>▶</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'DurationScreen', props: ['t'], data() { return { sel: 180 } } }
</script>

<style scoped>
.dur { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4vmin; }
.bg { position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse at 50% 0%, #2a1420 0%, #0a0510 60%),
    linear-gradient(180deg, #1a0a18, #0a0510); }
.spot { position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
  width: 100vmin; height: 100vmin;
  background: radial-gradient(ellipse at top, rgba(255,200,150,.18), transparent 55%);
  filter: blur(2vmin);
}
.grid-lines { position: absolute; inset: 0;
  background:
    repeating-linear-gradient(0deg, transparent 0 6vmin, rgba(255,60,80,.04) 6vmin 6.1vmin),
    repeating-linear-gradient(90deg, transparent 0 6vmin, rgba(255,60,80,.04) 6vmin 6.1vmin);
}

.wrap { position: relative; z-index: 1; width: min(90vw, 130vmin); text-align: center; color: #fff; }
.header { margin-bottom: 5vmin; }
.pre { color: #ff5568; font-size: 1.8vmin; letter-spacing: 0.6vmin; font-weight: 800; margin-bottom: 1.5vmin; }
h2 { font-size: 5vmin; font-weight: 900; letter-spacing: 0.4vmin;
  background: linear-gradient(180deg, #fff, #ffd0d5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3vmin; margin-bottom: 5vmin; }
.card { position: relative; padding: 5vmin 3vmin 4vmin;
  border-radius: 2vmin;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  border: 0.3vmin solid rgba(255,255,255,.1); cursor: pointer;
  transition: all .3s;
  overflow: hidden;
}
.card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% -20%, rgba(255,60,80,.15), transparent 60%);
  opacity: 0; transition: opacity .3s;
}
.card:hover { transform: translateY(-1vmin); border-color: rgba(255,255,255,.3); }
.card:hover::before { opacity: 1; }
.card.active {
  border-color: #ff3b4c;
  background: linear-gradient(180deg, rgba(255,60,80,.25), rgba(255,60,80,.03));
  box-shadow: 0 2vmin 5vmin rgba(255,60,80,.4), 0 0 0 0.4vmin rgba(255,60,80,.15);
  transform: translateY(-1vmin);
}
.card.active::before { opacity: 1; }
.card.featured { border-color: rgba(255,180,80,.4); }
.card.featured.active { border-color: #ff3b4c; }
.ribbon {
  position: absolute; top: 1.5vmin; left: 50%; transform: translateX(-50%);
  padding: 0.6vmin 2vmin; font-size: 1.4vmin; font-weight: 800; letter-spacing: 0.3vmin;
  background: linear-gradient(90deg, #ffd166, #ff8a5b); color: #23150a;
  border-radius: 99px;
  box-shadow: 0 0.4vmin 1vmin rgba(255,180,80,.4);
  white-space: nowrap;
}
.icon { font-size: 6vmin; margin: 3vmin 0 1vmin; filter: drop-shadow(0 1vmin 2vmin rgba(0,0,0,.4)); }
.num-line { display: flex; align-items: baseline; justify-content: center; gap: 1vmin; margin-bottom: 1vmin; }
.big {
  font-size: 12vmin; font-weight: 900; line-height: 1;
  background: linear-gradient(180deg, #fff 0%, #ffb0b8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0.4vmin 2vmin rgba(255,60,80,.3);
  font-family: 'Bebas Neue', 'Impact', sans-serif;
}
.unit { font-size: 3vmin; color: rgba(255,255,255,.6); font-weight: 700; letter-spacing: 0.3vmin; }
.desc { color: rgba(255,255,255,.7); font-size: 2.2vmin; letter-spacing: 0.2vmin; margin-bottom: 1.5vmin; }
.tag { display: inline-block; padding: 0.6vmin 1.6vmin;
  background: rgba(255,255,255,.08); border: 0.15vmin solid rgba(255,255,255,.15);
  border-radius: 99px; font-size: 1.5vmin; letter-spacing: 0.3vmin;
  color: rgba(255,255,255,.7);
}

.foot { display: flex; gap: 2vmin; justify-content: center; }
.btn {
  display: flex; align-items: center; gap: 1vmin;
  padding: 2vmin 4vmin; border-radius: 1.2vmin;
  border: 0.2vmin solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.06); color: #fff; cursor: pointer;
  font-size: 2.4vmin; font-weight: 700; letter-spacing: 0.3vmin;
  transition: all .2s;
}
.btn:hover { background: rgba(255,255,255,.14); transform: translateY(-0.3vmin); }
.btn.primary {
  background: linear-gradient(135deg, #ff3b4c, #b8102a);
  border-color: transparent;
  box-shadow: 0 1vmin 3vmin rgba(255,60,80,.5);
  padding: 2vmin 5vmin; font-size: 2.6vmin;
}
.btn.primary:hover { box-shadow: 0 1.5vmin 4vmin rgba(255,60,80,.7); }

@media (max-aspect-ratio: 4/5) {
  .cards { grid-template-columns: 1fr; }
}
</style>
