<template>
  <div class="home">
    <!-- Language toggle -->
    <div class="topbar">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#ffb547" stroke-width="2"/>
            <path d="M13 25 L13 15 L20 20 L27 15 L27 25" fill="none"
                  stroke="#ffb547" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-title">{{ t('appTitle') }}</div>
          <div class="brand-sub">{{ t('subtitle') }}</div>
        </div>
      </div>
      <button class="btn btn-ghost lang-btn" @click="onLang">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"/>
          <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/>
        </svg>
        {{ t('lang') }}
      </button>
    </div>

    <!-- Hero -->
    <div class="hero">
      <!-- Decorative background metronomes -->
      <div class="deco deco-l"><Metronome side="left"  :bpm="55" :running="true" hintText="A" /></div>
      <div class="deco deco-r"><Metronome side="right" :bpm="55" :running="true" hintText="L" /></div>

      <div class="hero-inner card">
        <h1 class="hero-title">{{ t('appTitle') }}</h1>
        <p class="hero-desc">{{ t('subtitle') }}</p>

        <div class="menu">
          <button class="btn btn-primary btn-lg menu-btn" @click="$emit('nav','start')">
            <span class="menu-ico">▶</span>{{ t('start') }}
          </button>
          <button class="btn btn-lg menu-btn" @click="$emit('nav','rules')">
            <span class="menu-ico">?</span>{{ t('rules') }}
          </button>
          <button class="btn btn-lg menu-btn" @click="$emit('nav','history')">
            <span class="menu-ico">▤</span>{{ t('history') }}
          </button>
          <button class="btn btn-ghost btn-lg menu-btn" @click="$emit('nav','skip')">
            <span class="menu-ico">⏭</span>{{ t('skip') }}
          </button>
        </div>
      </div>
    </div>

    <div class="foot">© Rhythm Tap · Cognitive Training</div>
  </div>
</template>

<script>
import Metronome from '../components/Metronome.vue'
import { toggleLang, i18nMixin } from '../i18n.js'
import { unlockAudio } from '../audio.js'
export default {
  mixins: [i18nMixin],
  components: { Metronome },
  methods: {
    onLang() { unlockAudio(); toggleLang() }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.brand { display: flex; align-items: center; gap: 1rem; }
.brand-logo { width: clamp(48px, 5.5vmin, 76px); aspect-ratio: 1; }
.brand-title { font-size: clamp(1.3rem, 2.4vmin, 1.9rem); font-weight: 700; letter-spacing: .05em; }
.brand-sub   { font-size: clamp(.85rem, 1.6vmin, 1.15rem); color: var(--ink-dim); letter-spacing: .1em; }
.lang-btn { padding: .6em 1.2em; font-size: clamp(1rem, 1.9vmin, 1.35rem); }

.hero {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vmin, 3rem);
}
.hero-inner {
  position: relative;
  z-index: 2;
  padding: clamp(2rem, 5vmin, 4rem) clamp(2rem, 5vmin, 4rem);
  text-align: center;
  width: min(820px, 94vw);
}
.hero-title {
  font-size: clamp(2.4rem, 6.5vmin, 4.4rem);
  font-weight: 800;
  letter-spacing: .04em;
  background: linear-gradient(180deg, #fff 0%, #ffcf90 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin-bottom: .3em;
}
.hero-desc {
  color: var(--ink-mid);
  font-size: clamp(1.05rem, 2.1vmin, 1.5rem);
  margin-bottom: 1.8em;
}
.menu {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.1rem;
}
.menu-btn {
  width: 100%;
  justify-content: center;
  padding: .9em .9em;
  font-size: clamp(1rem, 2vmin, 1.4rem);
  min-width: 0;
  overflow: hidden;
}
.menu-ico {
  display: inline-block;
  width: 1.2em;
  flex-shrink: 0;
  text-align: center;
  opacity: .9;
}

.deco {
  position: absolute;
  width: clamp(120px, 20vmin, 260px);
  aspect-ratio: 5 / 8;
  opacity: .35;
  z-index: 1;
  pointer-events: none;
}
.deco-l { top: 15%;    left: 6%; }
.deco-r { bottom: 12%; right: 6%; }

.foot {
  text-align: center;
  padding: .7rem;
  font-size: .75rem;
  color: var(--ink-dim);
  letter-spacing: .12em;
}

@media (max-width: 640px) {
  .menu { grid-template-columns: 1fr; }
  .deco-l, .deco-r { display: none; }
}
</style>
