<template>
  <div class="home">
    <!-- 顶部品牌 & 语言 -->
    <div class="topbar">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 40 40"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#00f2fe"/></linearGradient></defs><path d="M8 22 L20 6 L32 22 L26 22 L26 34 L14 34 L14 22 Z" fill="url(#lg)"/></svg>
        </div>
        <div class="brand-text">
          <div class="brand-title">{{ t.appTitle }}</div>
          <div class="brand-sub">{{ t.subtitle }}</div>
        </div>
      </div>
      <button class="btn-lang" @click="$emit('toggle-lang')">
        <span class="globe">🌐</span>{{ t.lang }}
      </button>
    </div>

    <!-- 背景装饰 -->
    <div class="bg">
      <div class="grid"></div>
      <div class="glow g1"></div>
      <div class="glow g2"></div>
      <div class="orb o1"></div>
      <div class="orb o2"></div>
      <div class="orb o3"></div>
    </div>

    <!-- 主内容 -->
    <div class="hero">
      <div class="hero-visual">
        <div class="factory">
          <div class="conveyor">
            <div class="belt"></div>
            <div class="item i1"></div>
            <div class="item i2"></div>
            <div class="item i3"></div>
          </div>
          <div class="bins">
            <div class="bin b1"></div>
            <div class="bin b2"></div>
            <div class="bin b3"></div>
          </div>
          <div class="screen">
            <div class="screen-title">{{ t.appTitle }}</div>
            <div class="screen-dots"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>

      <div class="menu">
        <h1 class="title">
          <span class="t1">{{ t.appTitle }}</span>
        </h1>
        <p class="tagline">{{ t.subtitle }}</p>

        <button class="mbtn primary" @click="$emit('start')">
          <span class="ic">▶</span>{{ t.start }}
        </button>
        <button class="mbtn" @click="$emit('rules')">
          <span class="ic">📖</span>{{ t.rules }}
        </button>
        <button class="mbtn" @click="$emit('history')">
          <span class="ic">📊</span>{{ t.history }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  props: ['t']
}
</script>

<style scoped>
.home { position: relative; width: 100%; height: 100%; overflow: hidden;
  background: radial-gradient(ellipse at top, #0d2a4d 0%, #061225 60%, #030814 100%); color: #eaf4ff; }

/* topbar */
.topbar { position: absolute; top: 2.2vh; left: 3vw; right: 3vw; display: flex; justify-content: space-between; align-items: center; z-index: 5; }
.brand { display: flex; align-items: center; gap: 1.2vw; }
.logo { width: 5vh; height: 5vh; min-width: 40px; min-height: 40px; }
.brand-title { font-size: 2.6vh; font-weight: 800; letter-spacing: .12em; background: linear-gradient(90deg,#4facfe,#00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}
.brand-sub { font-size: 1.5vh; color: #7ea6d0; letter-spacing: .05em; }
.btn-lang { display: flex; align-items: center; gap: .5em; padding: 1vh 2vh; background: rgba(255,255,255,.08); border: 1px solid rgba(120,200,255,.4);
  border-radius: 999px; color: #eaf4ff; cursor: pointer; font-size: 1.8vh; backdrop-filter: blur(10px); transition: .2s; }
.btn-lang:hover { background: rgba(80,180,255,.2); transform: translateY(-1px); }
.globe { font-size: 1.8vh; }

/* background */
.bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.grid { position: absolute; inset: 0; background-image:
  linear-gradient(rgba(100,180,255,.06) 1px, transparent 1px),
  linear-gradient(90deg, rgba(100,180,255,.06) 1px, transparent 1px);
  background-size: 60px 60px; mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%); }
.glow { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .55; }
.g1 { width: 40vw; height: 40vw; background: #1c56c9; top: -10vw; left: -8vw; }
.g2 { width: 45vw; height: 45vw; background: #00d1c7; bottom: -12vw; right: -10vw; }
.orb { position: absolute; border-radius: 50%; opacity: .7; }
.orb.o1 { width: 8px; height: 8px; background: #4facfe; box-shadow: 0 0 20px #4facfe; top: 20%; left: 15%; animation: float 6s ease-in-out infinite; }
.orb.o2 { width: 6px; height: 6px; background: #00f2fe; box-shadow: 0 0 18px #00f2fe; top: 60%; left: 70%; animation: float 8s ease-in-out infinite reverse; }
.orb.o3 { width: 10px; height: 10px; background: #b37feb; box-shadow: 0 0 22px #b37feb; top: 40%; left: 45%; animation: float 7s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-20px) } }

/* hero layout */
.hero { position: relative; z-index: 2; display: grid; grid-template-columns: 1.2fr 1fr;
  align-items: center; gap: 4vw; padding: 12vh 6vw 6vh; height: 100%; box-sizing: border-box; }

.hero-visual { display: flex; justify-content: center; align-items: center; }
.factory { position: relative; width: 100%; max-width: 620px; aspect-ratio: 1.1/1; }
.screen { position: absolute; top: 0; left: 8%; right: 8%; height: 26%; background: linear-gradient(180deg,#0e2a4d,#031224);
  border: 2px solid rgba(80,180,255,.35); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 0 40px rgba(80,180,255,.25) inset, 0 10px 30px rgba(0,0,0,.5); }
.screen-title { font-size: 2.4vh; letter-spacing: .3em; color: #7ff0ff; text-shadow: 0 0 12px rgba(127,240,255,.7); }
.screen-dots { display: flex; gap: 6px; margin-top: 1vh; }
.screen-dots span { width: 10px; height: 10px; border-radius: 50%; background: #4facfe;
  box-shadow: 0 0 10px #4facfe; animation: blink 1.4s ease-in-out infinite; }
.screen-dots span:nth-child(2) { animation-delay: .2s; background: #b37feb; box-shadow: 0 0 10px #b37feb; }
.screen-dots span:nth-child(3) { animation-delay: .4s; background: #00f2fe; box-shadow: 0 0 10px #00f2fe; }
@keyframes blink { 0%,100% { opacity: .3 } 50% { opacity: 1 } }

.conveyor { position: absolute; top: 34%; left: 2%; right: 2%; height: 20%;
  background: linear-gradient(180deg,#1c3050,#0a1729); border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(100,180,255,.25); box-shadow: 0 12px 30px rgba(0,0,0,.4); }
.belt { position: absolute; inset: 20% 0; background:
  repeating-linear-gradient(90deg,#2a4a7a 0 30px,#1a3560 30px 60px);
  animation: slide 2s linear infinite; }
@keyframes slide { from { background-position: 0 0 } to { background-position: 60px 0 } }
.item { position: absolute; top: 20%; width: 12%; aspect-ratio: 1; border-radius: 50%;
  animation: drift 6s linear infinite; }
.i1 { background: radial-gradient(circle at 30% 30%, #ff9a9a, #d9363e); left: -12%; animation-delay: 0s; }
.i2 { background: radial-gradient(circle at 30% 30%, #7ed957, #2e9d19); left: -12%; animation-delay: 2s; border-radius: 20%; }
.i3 { background: radial-gradient(circle at 30% 30%, #ffd453, #d18d0a); left: -12%; animation-delay: 4s; }
@keyframes drift { from { left: -12% } to { left: 112% } }

.bins { position: absolute; bottom: 4%; left: 4%; right: 4%; height: 30%; display: flex; justify-content: space-around; align-items: flex-end; }
.bin { width: 26%; height: 100%; border-radius: 14px 14px 8px 8px; position: relative; box-shadow: 0 12px 30px rgba(0,0,0,.5); }
.bin::before { content:''; position:absolute; left:-5%; right:-5%; top:-6%; height: 14%; border-radius: 20px; background: inherit; filter: brightness(1.15); }
.b1 { background: linear-gradient(180deg,#ff6b6b,#8b1a1f); }
.b2 { background: linear-gradient(180deg,#7ed957,#1c6b0f); }
.b3 { background: linear-gradient(180deg,#ffd453,#8b5a05); }

/* menu */
.menu { display: flex; flex-direction: column; align-items: flex-start; gap: 2vh; }
.title { margin: 0; font-size: 6vh; line-height: 1; font-weight: 900; letter-spacing: .06em; }
.t1 { background: linear-gradient(90deg,#4facfe 0%,#00f2fe 50%,#b37feb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(79,172,254,.2); }
.tagline { margin: 0 0 2vh; font-size: 2vh; color: #9dbfe4; letter-spacing: .05em; }

.mbtn { display: flex; align-items: center; gap: 1.2vh; width: 100%; max-width: 340px; padding: 2vh 2.5vh; font-size: 2.2vh; font-weight: 600;
  background: rgba(255,255,255,.06); color: #eaf4ff; border: 1px solid rgba(120,200,255,.3); border-radius: 14px; cursor: pointer;
  backdrop-filter: blur(10px); transition: all .25s ease; letter-spacing: .04em; }
.mbtn .ic { display: inline-flex; align-items: center; justify-content: center; width: 3.4vh; height: 3.4vh; border-radius: 8px;
  background: rgba(79,172,254,.2); color: #7ff0ff; font-size: 1.8vh; }
.mbtn:hover { transform: translateY(-2px); border-color: rgba(120,200,255,.7); background: rgba(80,180,255,.14); }
.mbtn.primary { background: linear-gradient(90deg,#4facfe,#00c8ff); border-color: transparent; color: #0a1e33;
  box-shadow: 0 12px 30px rgba(79,172,254,.4); }
.mbtn.primary .ic { background: rgba(255,255,255,.35); color: #fff; }
.mbtn.primary:hover { box-shadow: 0 16px 40px rgba(79,172,254,.55); }

/* responsive */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; padding: 12vh 5vw 4vh; gap: 2vh; }
  .hero-visual { max-height: 34vh; }
  .factory { max-width: 380px; }
  .title { font-size: 5vh; }
}
</style>
