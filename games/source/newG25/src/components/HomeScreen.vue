<template>
  <div class="home">
    <!-- Arena background: crowd, spotlight, ring ropes -->
    <div class="arena-bg">
      <div class="ceiling"></div>
      <div class="spot spot1"></div>
      <div class="spot spot2"></div>
      <div class="spot spot3"></div>
      <div class="crowd"></div>
      <div class="floor"></div>
      <!-- Ring ropes -->
      <div class="rope rope-red"></div>
      <div class="rope rope-white"></div>
      <div class="rope rope-blue"></div>
      <!-- particles / dust -->
      <div class="dust" v-for="i in 20" :key="'d'+i" :style="dustStyle(i)"></div>
    </div>

    <!-- Language toggle -->
    <button class="lang-btn" @click="$emit('toggle-lang')">
      <span class="globe">🌐</span>
      <span>{{ lang==='zh' ? 'EN' : '中' }}</span>
    </button>

    <!-- Hanging boxing glove logo -->
    <div class="brand">
      <div class="glove-wrap">
        <div class="chain"></div>
        <svg class="big-glove" viewBox="0 0 200 220" width="100%" height="100%">
          <defs>
            <radialGradient id="gloveGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ff8090"/>
              <stop offset="45%" stop-color="#e01e35"/>
              <stop offset="100%" stop-color="#6b0716"/>
            </radialGradient>
            <linearGradient id="cuffGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#f5f1e6"/>
              <stop offset="1" stop-color="#a89f88"/>
            </linearGradient>
            <filter id="gloveShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="6" result="off"/>
              <feMerge><feMergeNode in="off"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <!-- Cuff/wrist -->
          <path fill="url(#cuffGrad)" d="M55 175 L145 175 L150 210 L50 210 Z"/>
          <path fill="#8b7d63" opacity=".4" d="M50 200 L150 200 L150 210 L50 210 Z"/>
          <!-- Main glove body -->
          <path filter="url(#gloveShadow)" fill="url(#gloveGrad)" d="M60 30 Q60 10 100 10 Q170 10 170 60 L170 110 Q170 140 155 155 L155 175 L45 175 L45 155 Q30 140 30 110 L30 60 Q30 30 60 30 Z"/>
          <!-- Thumb -->
          <path fill="url(#gloveGrad)" d="M45 100 Q20 95 22 125 Q24 150 45 145 Z"/>
          <!-- Highlight -->
          <ellipse cx="80" cy="55" rx="20" ry="30" fill="#fff" opacity=".22"/>
          <ellipse cx="75" cy="50" rx="8" ry="14" fill="#fff" opacity=".35"/>
          <!-- Stitching detail -->
          <path fill="none" stroke="#4a0512" stroke-width="1.5" stroke-dasharray="3 3" d="M100 30 Q100 90 100 165"/>
          <!-- Brand text on glove -->
          <text x="100" y="140" text-anchor="middle" fill="#fff" opacity=".9"
                font-family="Impact,Arial" font-size="14" letter-spacing="2">CHAMPION</text>
        </svg>
      </div>
      <div class="title-block">
        <div class="pre-title">▬ PROFESSIONAL TRAINING ▬</div>
        <h1 class="title">{{ t.appTitle }}</h1>
        <div class="sub">{{ t.subtitle }}</div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="actions">
      <button class="mega-btn primary" @click="$emit('go','tutorial')">
        <span class="btn-ico">🥊</span>
        <span class="btn-txt">{{ t.startGame }}</span>
        <span class="btn-arrow">▶</span>
      </button>
      <div class="mini-actions">
        <button class="mini-btn" @click="$emit('go','rules')">
          <span class="ico">📖</span><span>{{ t.rules }}</span>
        </button>
        <button class="mini-btn" @click="$emit('go','history')">
          <span class="ico">📊</span><span>{{ t.history }}</span>
        </button>
        <button class="mini-btn ghost" @click="$emit('go','skip')">
          <span class="ico">⏭</span><span>{{ t.skip }}</span>
        </button>
      </div>
    </div>

    <div class="footer">© {{ year }} · Boxing Attention Trainer</div>
  </div>
</template>

<script>
export default {
  name: 'HomeScreen',
  props: ['t', 'lang'],
  computed: { year() { return new Date().getFullYear() } },
  methods: {
    dustStyle(i) {
      const seed = i * 137
      return {
        left: (seed % 100) + '%',
        top: ((seed * 3) % 100) + '%',
        animationDelay: (i * 0.4) + 's',
        animationDuration: (5 + (i % 5)) + 's',
      }
    }
  }
}
</script>

<style scoped>
.home {
  position: relative; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
}

/* === ARENA BACKGROUND === */
.arena-bg {
  position: absolute; inset: 0; z-index: 0; overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 0%, #2a1420 0%, #0a0510 60%),
    linear-gradient(180deg, #1a0a18 0%, #0a0510 100%);
}
.ceiling {
  position: absolute; top: 0; left: 0; right: 0; height: 25%;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.6) 0 8vmin, transparent 8vmin 10vmin),
    linear-gradient(180deg, rgba(0,0,0,.8), transparent);
}
.spot {
  position: absolute; width: 80vmin; height: 100vmin;
  background: radial-gradient(ellipse at top, rgba(255,220,180,.28) 0%, transparent 55%);
  transform-origin: top center; filter: blur(2vmin);
  animation: sway 8s ease-in-out infinite alternate;
}
.spot1 { left: 10%; top: -10%; transform: rotate(-15deg); }
.spot2 { left: 50%; top: -10%; transform: translateX(-50%); }
.spot3 { right: 10%; top: -10%; transform: rotate(15deg); animation-delay: -4s; }
@keyframes sway {
  from { transform: translateX(-50%) rotate(-3deg); }
  to   { transform: translateX(-50%) rotate(3deg); }
}
.spot1 { animation-name: sway1; }
.spot3 { animation-name: sway3; }
@keyframes sway1 { from { transform: rotate(-18deg);} to { transform: rotate(-12deg);} }
@keyframes sway3 { from { transform: rotate(12deg);} to { transform: rotate(18deg);} }

.crowd {
  position: absolute; left: 0; right: 0; bottom: 22%; height: 30%;
  background:
    radial-gradient(ellipse 3vmin 4vmin at 5% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 15% 90%, #0a0308 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 25% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 35% 95%, #0a0308 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 45% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 55% 90%, #0a0308 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 65% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 75% 95%, #0a0308 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 85% 100%, #050205 60%, transparent 62%),
    radial-gradient(ellipse 3vmin 4vmin at 95% 90%, #0a0308 60%, transparent 62%),
    linear-gradient(180deg, transparent, rgba(0,0,0,.5) 70%);
  opacity: .7;
}
.floor {
  position: absolute; left: 0; right: 0; bottom: 0; height: 22%;
  background:
    linear-gradient(180deg, #1a0a18 0%, #0a0510 100%),
    repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2vmin, transparent 2vmin 4vmin);
  border-top: 0.3vmin solid rgba(255,255,255,.08);
  box-shadow: 0 -2vmin 4vmin rgba(0,0,0,.6) inset;
}
.rope {
  position: absolute; left: -5%; right: -5%; height: 0.8vmin;
  border-radius: 99px; box-shadow: 0 0.4vmin 0.8vmin rgba(0,0,0,.5);
}
.rope-red   { bottom: 20%; background: linear-gradient(180deg, #ff3040, #a10a1a); }
.rope-white { bottom: 16%; background: linear-gradient(180deg, #fff, #b8b8b8); }
.rope-blue  { bottom: 12%; background: linear-gradient(180deg, #3080ff, #0a3a9a); }

.dust {
  position: absolute; width: 0.4vmin; height: 0.4vmin; background: rgba(255,220,180,.6);
  border-radius: 50%; box-shadow: 0 0 1vmin rgba(255,220,180,.6);
  animation: float linear infinite;
}
@keyframes float {
  from { transform: translateY(0) translateX(0); opacity: 0; }
  20% { opacity: 1; }
  to { transform: translateY(-30vh) translateX(3vmin); opacity: 0; }
}

/* === LANG BUTTON === */
.lang-btn {
  position: absolute; top: 3vmin; right: 3vmin; z-index: 10;
  padding: 1.4vmin 2.6vmin; font-size: 2.2vmin; font-weight: 700;
  background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
  color: #fff; border: 0.2vmin solid rgba(255,255,255,.25);
  border-radius: 99px; cursor: pointer;
  display: flex; align-items: center; gap: 0.8vmin;
  backdrop-filter: blur(1vmin); letter-spacing: 0.3vmin;
  transition: all .2s;
}
.lang-btn:hover { background: rgba(255,255,255,.2); transform: translateY(-0.3vmin); box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,.4); }
.globe { font-size: 2.4vmin; }

/* === BRAND === */
.brand { position: relative; z-index: 2; display: flex; align-items: center; gap: 4vmin; margin-bottom: 5vmin; }
.glove-wrap { position: relative; width: 22vmin; height: 26vmin; animation: bob 3s ease-in-out infinite; }
.chain {
  position: absolute; top: -8vmin; left: 50%; transform: translateX(-50%);
  width: 0.5vmin; height: 8vmin;
  background: repeating-linear-gradient(180deg, #888 0 0.6vmin, #333 0.6vmin 1.2vmin);
  border-radius: 99px;
}
.big-glove { width: 100%; height: 100%; filter: drop-shadow(0 2vmin 3vmin rgba(255,60,80,.3)); }
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-1vmin) rotate(2deg); }
}

.title-block { color: #fff; }
.pre-title {
  color: #ff5568; letter-spacing: 0.6vmin; font-size: 1.8vmin;
  font-weight: 700; margin-bottom: 1.5vmin;
}
.title {
  font-size: 8vmin; font-weight: 900; letter-spacing: 0.5vmin; line-height: 1;
  background: linear-gradient(180deg, #fff 0%, #ffd0d5 50%, #ff5568 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0.4vmin 2vmin rgba(255,60,80,.3);
  font-family: 'Bebas Neue', 'Impact', sans-serif;
}
.sub { color: rgba(255,255,255,.6); font-size: 2.2vmin; margin-top: 1vmin; letter-spacing: 0.3vmin; }

/* === ACTIONS === */
.actions { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 3vmin; }
.mega-btn {
  display: flex; align-items: center; gap: 2vmin;
  padding: 2.4vmin 6vmin; font-size: 3.2vmin; font-weight: 800;
  border: none; border-radius: 1.5vmin; cursor: pointer;
  letter-spacing: 0.4vmin; text-transform: uppercase;
  transition: all .25s;
  position: relative; overflow: hidden;
}
.mega-btn.primary {
  background: linear-gradient(135deg, #ff3b4c 0%, #b8102a 100%);
  color: #fff;
  box-shadow:
    0 1vmin 3vmin rgba(255,60,80,.5),
    0 0 0 0.3vmin rgba(255,180,190,.2) inset,
    0 -0.5vmin 1vmin rgba(0,0,0,.3) inset;
}
.mega-btn.primary::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  animation: shine 3s infinite;
}
@keyframes shine { 0% { left: -100%; } 60%, 100% { left: 200%; } }
.mega-btn.primary:hover {
  transform: translateY(-0.5vmin) scale(1.03);
  box-shadow:
    0 1.5vmin 4vmin rgba(255,60,80,.7),
    0 0 0 0.3vmin rgba(255,180,190,.4) inset;
}
.btn-ico { font-size: 4vmin; }
.btn-arrow { font-size: 2.4vmin; opacity: .8; }

.mini-actions { display: flex; gap: 2vmin; }
.mini-btn {
  display: flex; align-items: center; gap: 1vmin;
  padding: 1.6vmin 3vmin; font-size: 2.2vmin; font-weight: 600;
  background: rgba(255,255,255,.06); color: #fff;
  border: 0.2vmin solid rgba(255,255,255,.15); border-radius: 1vmin; cursor: pointer;
  letter-spacing: 0.2vmin;
  backdrop-filter: blur(1vmin); transition: all .2s;
}
.mini-btn .ico { font-size: 2.4vmin; }
.mini-btn:hover { background: rgba(255,255,255,.14); transform: translateY(-0.3vmin); border-color: rgba(255,255,255,.35); }
.mini-btn.ghost { opacity: .7; }

.footer {
  position: absolute; bottom: 2vmin; left: 0; right: 0; text-align: center;
  color: rgba(255,255,255,.3); font-size: 1.4vmin; letter-spacing: 0.3vmin; z-index: 2;
}

@media (max-aspect-ratio: 3/4) {
  .brand { flex-direction: column; gap: 2vmin; text-align: center; }
  .title-block { text-align: center; }
}
</style>
