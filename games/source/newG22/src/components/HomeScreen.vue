<template>
  <div class="home">
    <!-- Animated background -->
    <div class="bg">
      <div class="road-lines">
        <div class="line" v-for="n in 6" :key="n" :style="{ animationDelay: (n * -1.2) + 's' }"></div>
      </div>
      <div class="stars">
        <div class="star" v-for="n in 40" :key="n"
             :style="{
               left: rand(n, 100) + '%',
               top: rand(n * 2, 100) + '%',
               animationDelay: (rand(n * 3, 30) / 10) + 's',
               opacity: 0.2 + rand(n * 4, 60) / 100
             }"></div>
      </div>
    </div>

    <!-- Lang toggle -->
    <button class="lang-btn" @click="toggleLang">
      <span :class="{ active: lang === 'zh' }">中</span>
      <span class="sep">/</span>
      <span :class="{ active: lang === 'en' }">EN</span>
    </button>

    <div class="content">
      <!-- Logo / car icon -->
      <div class="logo">
        <svg viewBox="0 0 200 120" class="car-icon">
          <defs>
            <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ff5757"/>
              <stop offset="0.5" stop-color="#e11d48"/>
              <stop offset="1" stop-color="#7f1d1d"/>
            </linearGradient>
            <linearGradient id="carShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#fff" stop-opacity="0.6"/>
              <stop offset="1" stop-color="#fff" stop-opacity="0"/>
            </linearGradient>
            <radialGradient id="light" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#fff59d"/>
              <stop offset="1" stop-color="#fff59d" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="100" cy="112" rx="80" ry="6" fill="rgba(0,0,0,0.4)"/>
          <path d="M30 80 Q35 55 60 45 L 140 45 Q165 55 170 80 L 170 95 Q170 100 165 100 L 35 100 Q30 100 30 95 Z" fill="url(#carBody)"/>
          <path d="M55 62 Q60 50 72 48 L 128 48 Q140 50 145 62 L 135 68 L 65 68 Z" fill="#0e1a35" opacity="0.85"/>
          <path d="M60 65 Q65 55 75 53 L 125 53 Q135 55 140 65 Z" fill="#3b82f6" opacity="0.5"/>
          <rect x="35" y="78" width="130" height="6" fill="url(#carShine)"/>
          <circle cx="60" cy="98" r="12" fill="#111"/>
          <circle cx="60" cy="98" r="5" fill="#666"/>
          <circle cx="140" cy="98" r="12" fill="#111"/>
          <circle cx="140" cy="98" r="5" fill="#666"/>
          <ellipse cx="175" cy="75" rx="12" ry="7" fill="url(#light)"/>
          <ellipse cx="25" cy="75" rx="8" ry="5" fill="#ff3838" opacity="0.9"/>
        </svg>
      </div>

      <h1 class="title">{{ t('appTitle') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>

      <div class="menu">
        <button class="btn btn-primary" @click="$emit('start')">
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          </span>
          {{ t('startGame') }}
        </button>
        <button class="btn btn-secondary" @click="$emit('rules')">
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13 9h-2V7h2v2m0 8h-2v-6h2v6M12 2A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z"/></svg>
          </span>
          {{ t('rules') }}
        </button>
        <button class="btn btn-secondary" @click="$emit('history')">
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13 3a9 9 0 00-9 9H1l4 4 4-4H6a7 7 0 1114 0 7 7 0 01-7 7c-1.9 0-3.7-.8-5-2l-1.4 1.4A9 9 0 0013 21a9 9 0 000-18m-1 5v5l4.3 2.5.7-1.1-3.5-2.1V8H12z"/></svg>
          </span>
          {{ t('history') }}
        </button>
      </div>
    </div>

    <div class="footer">Cognitive Rehabilitation Training</div>
  </div>
</template>

<script>
import { i18n, setLang, t } from '../i18n.js'

export default {
  name: 'HomeScreen',
  computed: {
    lang() { return i18n.lang }
  },
  methods: {
    t,
    toggleLang() { setLang(i18n.lang === 'zh' ? 'en' : 'zh') },
    rand(seed, max) {
      const x = Math.sin(seed * 9999) * 10000
      return Math.floor(Math.abs(x - Math.floor(x)) * max)
    }
  }
}
</script>

<style scoped>
.home {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 20%, #1e3a8a 0%, #0b1020 60%, #05070f 100%);
  overflow: hidden;
}
.bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.stars .star {
  position: absolute; width: 2px; height: 2px; background: #fff; border-radius: 50%;
  animation: twinkle 3s infinite ease-in-out;
}
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}
.road-lines {
  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 200%; height: 45%;
  background: linear-gradient(180deg, transparent 0%, #0f172a 60%);
  perspective: 400px;
}
.road-lines .line {
  position: absolute; left: 50%; bottom: -20%;
  width: 4vw; height: 22vh;
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  transform-origin: center bottom;
  animation: road 4s linear infinite;
  border-radius: 4px;
  opacity: 0.7;
}
@keyframes road {
  0% { transform: translateX(-50%) translateY(-120%) scaleY(0.1) scaleX(0.02); opacity: 0; }
  30% { opacity: 0.6; }
  100% { transform: translateX(-50%) translateY(0) scaleY(1) scaleX(1); opacity: 0.9; }
}

.lang-btn {
  position: absolute; top: 3vmin; right: 3vmin;
  padding: 1.4vmin 2.4vmin; border-radius: 999px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 2vmin;
  backdrop-filter: blur(10px); z-index: 10; letter-spacing: 1px;
  transition: all 0.2s;
}
.lang-btn:hover { background: rgba(255,255,255,0.15); }
.lang-btn .active { color: #fbbf24; font-weight: bold; }
.lang-btn .sep { margin: 0 0.6vmin; opacity: 0.4; }

.content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  padding: 2vmin 4vmin;
}
.logo {
  width: 32vmin;
  filter: drop-shadow(0 3vmin 4vmin rgba(255, 60, 60, 0.4));
  animation: float 3s ease-in-out infinite;
}
.car-icon { width: 100%; height: auto; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.2vmin); }
}
.title {
  font-size: 8vmin;
  font-weight: 900;
  letter-spacing: 0.05em;
  margin-top: 2vmin;
  background: linear-gradient(180deg, #fff 0%, #fbbf24 50%, #ef4444 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 40px rgba(251, 191, 36, 0.4);
}
.subtitle {
  font-size: 2.4vmin;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.2em;
  margin-top: 1.2vmin;
  margin-bottom: 6vmin;
}
.menu {
  display: flex; flex-direction: column; gap: 2.5vmin;
  width: 50vmin;
  max-width: 90vw;
}
.btn {
  display: flex; align-items: center; justify-content: center; gap: 1.4vmin;
  padding: 2.2vmin 2.5vmin;
  border-radius: 2vmin;
  border: 0;
  font-size: 2.8vmin;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.btn-icon { display: flex; align-items: center; }
.btn-icon svg { width: 3.2vmin; height: 3.2vmin; min-width: 20px; min-height: 20px; }
.btn:hover { transform: translateY(-0.5vmin); }
.btn:active { transform: translateY(0); }

.btn-primary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}
.btn-primary:hover {
  box-shadow: 0 15px 40px rgba(239, 68, 68, 0.6), inset 0 1px 0 rgba(255,255,255,0.3);
}
.btn-secondary {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
}
.btn-secondary:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.3);
}
.footer {
  position: absolute; bottom: 2vmin; left: 0; right: 0; text-align: center;
  color: rgba(255,255,255,0.3); font-size: 1.6vmin; letter-spacing: 0.2em;
}
</style>
