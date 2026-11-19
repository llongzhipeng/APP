<template>
  <div class="home">
    <!-- Decorative forest silhouette -->
    <svg class="deco" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="sky" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#3a8fb7" stop-opacity=".55"/>
          <stop offset="100%" stop-color="#0a1526" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b4a2f"/>
          <stop offset="100%" stop-color="#0a1f16"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)"/>
      <g opacity=".45">
        <path d="M0 700 L60 620 L120 700 L180 610 L250 700 L310 630 L370 700 L440 600 L500 700 L560 620 L620 700 L700 590 L760 700 L820 620 L880 700 L960 580 L1020 700 L1080 630 L1140 700 L1220 590 L1280 700 L1340 620 L1400 700 L1480 600 L1540 700 L1600 640 L1600 900 L0 900 Z" fill="#0f3323"/>
      </g>
      <rect y="720" width="1600" height="180" fill="url(#ground)"/>
      <g fill="#ffe082">
        <circle cx="200" cy="200" r="2.5"><animate attributeName="opacity" values="0;1;0" dur="3.2s" repeatCount="indefinite"/></circle>
        <circle cx="1400" cy="300" r="3"><animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" begin="1s"/></circle>
        <circle cx="900" cy="150" r="2"><animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" begin=".6s"/></circle>
        <circle cx="1200" cy="500" r="2.5"><animate attributeName="opacity" values="0;1;0" dur="3.6s" repeatCount="indefinite" begin="1.4s"/></circle>
        <circle cx="450" cy="420" r="2"><animate attributeName="opacity" values="0;1;0" dur="3.4s" repeatCount="indefinite" begin=".2s"/></circle>
        <circle cx="700" cy="340" r="3"><animate attributeName="opacity" values="0;1;0" dur="4.2s" repeatCount="indefinite" begin="2s"/></circle>
      </g>
    </svg>

    <div class="brand">
      <div class="brand-flower">
        <Daisy hide-grass />
      </div>
      <h1 class="title">{{ t('title') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>
    </div>

    <div class="actions">
      <button class="btn big" @click="$emit('start')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        {{ t('start') }}
      </button>
      <button class="btn ghost big" @click="$emit('rules')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        {{ t('rules') }}
      </button>
      <button class="btn ghost big" @click="$emit('history')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 109-9M3 12l3-3M3 12l3 3M12 7v5l3 2"/></svg>
        {{ t('history') }}
      </button>
    </div>
  </div>
</template>

<script>
import { store, t } from '../store'
import Daisy from './Daisy.vue'
export default {
  components: { Daisy },
  data () { return { store } },
  computed: { t () { const _ = this.store.lang; return t } }
}
</script>

<style scoped>
.home {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4vmin;
}
.deco { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
.brand { position: relative; z-index: 1; text-align: center; margin-bottom: 6vh; }
.brand-flower {
  width: 26vmin; height: 30vmin; margin: 0 auto 2.4vmin;
  filter: drop-shadow(0 16px 36px rgba(236,72,153,.45));
  animation: float 4s ease-in-out infinite;
}
@keyframes float { 0%,100% { transform: translateY(0) rotate(-3deg) } 50% { transform: translateY(-14px) rotate(3deg) } }
.title {
  font-size: 8vmin;
  font-weight: 900;
  background: linear-gradient(135deg,#a7f3d0,#fde68a 40%,#fbcfe8);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  letter-spacing: .06em;
  text-shadow: 0 4px 40px rgba(167,243,208,.15);
}
.subtitle { margin-top: 1.6vmin; font-size: 2.4vmin; color: #e2e8f0; letter-spacing: .3em; }
.actions { position: relative; z-index: 1; display: flex; gap: 2.6vmin; flex-wrap: wrap; justify-content: center; }
.btn.big {
  padding: 1.1em 2.8em;
  font-size: 2.8vmin;
  border-radius: 999px;
  min-width: 26vmin;
}
.btn.big svg { margin-right: .6em; width: 1.2em; height: 1.2em; }
</style>
