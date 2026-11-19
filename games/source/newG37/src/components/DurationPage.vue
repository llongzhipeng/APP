<template>
  <div class="page">
    <div class="topbar">
      <button class="back" @click="$emit('back')">← {{ t.back }}</button>
      <div class="title">{{ t.durationTitle }}</div>
      <span class="ph"></span>
    </div>
    <div class="bg"><div class="grid"></div><div class="glow g1"></div><div class="glow g2"></div></div>
    <div class="content">
      <div class="cards">
        <div v-for="d in durations" :key="d.min" class="card" :class="{ active: pick===d.min }"
          @click="pick=d.min" :style="{ '--c1': d.c1, '--c2': d.c2 }">
          <div class="num">{{ d.min }}</div>
          <div class="unit">{{ t.minute }}</div>
          <div class="desc">{{ d.desc[lang] }}</div>
          <div class="ring"></div>
        </div>
      </div>
      <button class="go" :disabled="!pick" @click="$emit('start', pick*60)">
        <span>▶</span>{{ t.start }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DurationPage',
  props: ['t','lang'],
  data() {
    return {
      pick: 1,
      durations: [
        { min: 1, c1: '#4facfe', c2: '#00f2fe', desc: { zh: '快速体验', en: 'Quick Try' } },
        { min: 3, c1: '#7ed957', c2: '#00c853', desc: { zh: '推荐时长', en: 'Recommended' } },
        { min: 5, c1: '#b37feb', c2: '#722ed1', desc: { zh: '完整训练', en: 'Full Session' } }
      ]
    }
  }
}
</script>

<style scoped>
.page { position: relative; width: 100%; height: 100%;
  background: radial-gradient(ellipse at top,#0d2a4d 0%,#061225 60%,#030814 100%); color: #eaf4ff; overflow: hidden; }
.topbar { position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between;
  padding: 2.5vh 3vw; border-bottom: 1px solid rgba(80,180,255,.15); }
.back { padding: 1.2vh 2vh; background: rgba(255,255,255,.08); color: #eaf4ff;
  border: 1px solid rgba(120,200,255,.35); border-radius: 10px; cursor: pointer; font-size: 1.8vh; }
.back:hover { background: rgba(80,180,255,.2); }
.title { font-size: 2.4vh; font-weight: 700; letter-spacing: .12em;
  background: linear-gradient(90deg,#4facfe,#00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ph { width: 80px; }
.bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.grid { position: absolute; inset: 0; background-image:
  linear-gradient(rgba(100,180,255,.05) 1px, transparent 1px),
  linear-gradient(90deg,rgba(100,180,255,.05) 1px, transparent 1px);
  background-size: 60px 60px; mask-image: radial-gradient(ellipse at center,#000 30%,transparent 75%); }
.glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .5; }
.g1 { width: 40vw; height: 40vw; background: #1c56c9; top: -10vw; left: -10vw; }
.g2 { width: 40vw; height: 40vw; background: #00d1c7; bottom: -10vw; right: -10vw; }

.content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5vh; height: calc(100% - 10vh); padding: 0 4vw; box-sizing: border-box; }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3vw; width: min(900px,90vw); }
.card { position: relative; padding: 4vh 2vh; border-radius: 20px;
  background: linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
  border: 2px solid rgba(120,200,255,.15); cursor: pointer; text-align: center; transition: all .3s cubic-bezier(.2,.9,.3,1.2);
  overflow: hidden; }
.card:hover { transform: translateY(-6px); border-color: rgba(120,200,255,.4); }
.card.active { border-color: transparent; background: linear-gradient(180deg,rgba(79,172,254,.18),rgba(79,172,254,.05));
  box-shadow: 0 0 0 3px var(--c1), 0 20px 50px rgba(79,172,254,.3); transform: translateY(-6px); }
.card.active::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,var(--c1),var(--c2)); opacity: .1; }
.card .ring { position: absolute; inset: -20% -20% auto auto; width: 40%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle,var(--c1) 0%, transparent 70%); opacity: 0; transition: .3s; }
.card.active .ring { opacity: .5; }
.ico { font-size: 6vh; margin-bottom: 1vh; filter: drop-shadow(0 0 20px var(--c1)); display: none; }
.num { font-size: 8vh; line-height: 1; font-weight: 900;
  background: linear-gradient(180deg,var(--c1),var(--c2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.unit { font-size: 2vh; color: #a0c4e8; letter-spacing: .1em; margin-top: .8vh; }
.desc { margin-top: 2vh; font-size: 1.7vh; color: #7ea6d0; letter-spacing: .05em; }

.go { padding: 2.4vh 6vh; font-size: 2.4vh; font-weight: 700; letter-spacing: .1em;
  background: linear-gradient(90deg,#4facfe,#00c8ff); color: #05203c; border: none; border-radius: 999px; cursor: pointer;
  box-shadow: 0 20px 50px rgba(79,172,254,.4); display: flex; align-items: center; gap: 1vh; transition: .3s; }
.go span { display: inline-flex; align-items: center; justify-content: center; width: 3.4vh; height: 3.4vh; border-radius: 50%;
  background: rgba(255,255,255,.4); }
.go:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 24px 60px rgba(79,172,254,.55); }
.go:disabled { opacity: .4; cursor: not-allowed; box-shadow: none; }

@media (max-width: 700px) {
  .cards { grid-template-columns: 1fr; gap: 2vh; }
}
</style>
