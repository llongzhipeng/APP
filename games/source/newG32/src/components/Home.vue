<template>
  <div class="home">
    <!-- Animated backdrop -->
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
    <div class="bg-grid"></div>

    <!-- Language toggle -->
    <button class="lang-toggle" @click="onLang" :disabled="langLocked" v-show="!langLocked">
      <span class="dot"></span>{{ t('langBtn') }}
    </button>

    <div class="hero">
      <div class="badge">CLASSROOM · 训练</div>
      <h1 class="title">{{ t('appTitle') }}</h1>
      <p class="subtitle">{{ t('subTitle') }}</p>

      <div class="menu">
        <button class="menu-card menu-card--primary" @click="$emit('start')">
          <div class="icon">
            <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="menu-text">
            <div class="menu-title">{{ t('startGame') }}</div>
          </div>
        </button>
        <button class="menu-card" @click="$emit('rules')">
          <div class="icon">
            <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M4 4h16v2H4V4m0 4h16v2H4V8m0 4h10v2H4v-2m0 4h16v2H4v-2m0 4h10v2H4v-2Z"/></svg>
          </div>
          <div class="menu-text"><div class="menu-title">{{ t('rules') }}</div></div>
        </button>
        <button class="menu-card" @click="$emit('history')">
          <div class="icon">
            <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M13 3a9 9 0 1 0 8.94 10H20a7 7 0 1 1-1.79-6.44L15 10h7V3l-2.24 2.24A9 9 0 0 0 13 3m-1 5v5l4.28 2.54L17 14.33l-3.5-2.08V8H12Z"/></svg>
          </div>
          <div class="menu-text"><div class="menu-title">{{ t('history') }}</div></div>
        </button>
      </div>
    </div>

    <div class="footer">© Classroom Learning · v1.0</div>
  </div>
</template>

<script>
import { i18nMixin, toggleLang } from '../i18n'
export default {
  mixins: [i18nMixin],
  methods: { onLang() { toggleLang() } },
}
</script>

<style scoped>
.home {
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at top, #1a2436 0%, #0b1018 55%, #06090e 100%);
  overflow: hidden;
}
.bg-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: .55;
  pointer-events: none;
}
.bg-orb--1 { width: 40vmax; height: 40vmax; background: #ff7a3d; top: -10vmax; left: -10vmax; }
.bg-orb--2 { width: 35vmax; height: 35vmax; background: #4a7bff; bottom: -12vmax; right: -12vmax; }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 3rem 3rem;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}
.lang-toggle {
  position: absolute; top: 3vmin; right: 3vmin;
  display: flex; align-items: center; gap: .6em;
  padding: 1.4vmin 2.4vmin; border-radius: 999px; z-index: 10;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
  color: #fff; font-weight: 700; font-size: 2.4vmin; backdrop-filter: blur(10px);
  transition: all .2s;
}
.lang-toggle:hover { background: rgba(255,255,255,.2); }
.dot { width: .5em; height: .5em; border-radius: 50%; background: #4ade80; box-shadow: 0 0 10px #4ade80; }

.hero {
  position: relative; z-index: 5;
  display: flex; flex-direction: column; align-items: center;
  gap: 2vmin; padding: 4vmin; max-width: 90vw;
}
.badge {
  padding: .8vmin 2vmin; border-radius: 999px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
  font-size: 1.8vmin; letter-spacing: .3em; color: rgba(255,255,255,.8);
  font-weight: 600;
}
.title {
  font-size: 10vmin;
  font-weight: 900;
  background: linear-gradient(180deg, #fff 0%, #ffb347 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  letter-spacing: .02em; line-height: 1.1;
  text-shadow: 0 4px 40px rgba(255, 179, 71, .3);
}
.subtitle {
  font-size: 2.6vmin;
  color: rgba(255,255,255,.7); letter-spacing: .1em; font-weight: 500;
}

.menu {
  margin-top: 5vmin;
  display: grid; grid-template-columns: repeat(3, minmax(22vmin, 1fr));
  gap: 2.5vmin; width: min(80vmin, 92vw);
}
@media (max-width: 640px) { .menu { grid-template-columns: 1fr; gap: 2vmin; } }

.menu-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1.5vmin; padding: 4vmin 2vmin;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12);
  border-radius: 2vmin; color: #fff; backdrop-filter: blur(20px);
  transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
}
.menu-card:hover {
  transform: translateY(-6px); background: rgba(255,255,255,.1);
  border-color: rgba(255,255,255,.3);
  box-shadow: 0 2vmin 4vmin rgba(0,0,0,.4);
}
.menu-card--primary {
  background: linear-gradient(135deg, #ff8a3d 0%, #ff5f3d 100%);
  border-color: transparent;
  box-shadow: 0 1.5vmin 3.5vmin rgba(255, 122, 61, .4);
}
.menu-card--primary:hover {
  box-shadow: 0 2.5vmin 5vmin rgba(255, 122, 61, .6);
}
.icon {
  width: 6vmin; height: 6vmin; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.18); border-radius: 50%;
  font-size: 3.5vmin;
}
.menu-card--primary .icon { background: rgba(255,255,255,.3); }
.menu-title { font-size: 2.6vmin; font-weight: 800; letter-spacing: .05em; }

.footer {
  position: absolute; bottom: 2vmin; left: 0; right: 0; text-align: center;
  font-size: 1.6vmin; color: rgba(255,255,255,.35); letter-spacing: .2em;
}
</style>
