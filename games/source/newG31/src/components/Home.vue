<template>
  <div class="home">
    <!-- Language toggle -->
    <button class="lang-btn" @click="$emit('toggle-lang')">
      <span :class="{ on: lang === 'zh' }">中文</span>
      <span class="sep">/</span>
      <span :class="{ on: lang === 'en' }">EN</span>
    </button>

    <!-- Decorative floating notes -->
    <div class="floaters">
      <span v-for="n in 12" :key="n" class="floater" :style="floatStyle(n)">♪</span>
    </div>

    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ffd166"/>
              <stop offset="1" stop-color="#ef476f"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="54" fill="url(#lg)" stroke="#fff" stroke-width="4"/>
          <path d="M45 30 L45 78 A10 10 0 1 1 40 68 L40 40 L78 32 L78 68 A10 10 0 1 1 73 58 L73 42 L45 47"
                fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>{{ t('title') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>
    </div>

    <!-- Buttons -->
    <div class="menu">
      <button class="menu-btn primary" @click="$emit('start')">
        <span class="icon">▶</span> {{ t('start') }}
      </button>
      <button class="menu-btn" @click="$emit('rules')">
        <span class="icon">📖</span> {{ t('rules') }}
      </button>
      <button class="menu-btn" @click="$emit('history')">
        <span class="icon">📊</span> {{ t('history') }}
      </button>
      <button class="menu-btn ghost">
        <span class="icon">⤳</span> {{ t('skip') }}
      </button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'Home',
  props: { lang: String },
  methods: {
    t(k) { return t(this.lang, k) },
    floatStyle(n) {
      const left = (n * 83) % 100
      const delay = (n * 0.7) % 6
      const size = 20 + (n * 7) % 30
      const dur = 8 + (n % 5) * 2
      return {
        left: left + '%',
        fontSize: size + 'px',
        animationDelay: -delay + 's',
        animationDuration: dur + 's'
      }
    }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}
.lang-btn {
  position: absolute;
  top: 24px; right: 30px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.4);
  color: #fff;
  border-radius: 30px;
  padding: 10px 22px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  backdrop-filter: blur(6px);
  transition: all 0.2s;
  z-index: 10;
}
.lang-btn:hover { background: rgba(255,255,255,0.28); }
.lang-btn .on { color: #ffd166; font-weight: 700; }
.lang-btn .sep { margin: 0 6px; opacity: 0.6; }

.floaters { position: absolute; inset: 0; pointer-events: none; }
.floater {
  position: absolute; bottom: -40px;
  color: rgba(255,255,255,0.4);
  animation: floatUp linear infinite;
  text-shadow: 0 0 8px rgba(255,255,255,0.5);
}
@keyframes floatUp {
  0% { transform: translateY(0) rotate(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
}

.logo { text-align: center; margin-bottom: 50px; }
.logo-icon {
  width: 130px; height: 130px;
  margin: 0 auto 20px;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
  animation: bounce 3s ease-in-out infinite;
}
@keyframes bounce {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.logo h1 {
  color: #fff;
  font-size: 54px;
  font-weight: 800;
  letter-spacing: 2px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 30px rgba(255,209,102,0.4);
  margin-bottom: 12px;
}
.subtitle {
  color: rgba(255,255,255,0.85);
  font-size: 20px;
  letter-spacing: 4px;
  font-weight: 300;
}

.menu {
  display: grid;
  grid-template-columns: repeat(2, 260px);
  gap: 22px;
}
.menu-btn {
  padding: 22px 30px;
  border-radius: 18px;
  font-size: 20px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  color: #fff;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  transition: all 0.25s;
  display: flex; align-items: center; justify-content: center;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
.menu-btn:hover {
  transform: translateY(-3px);
  background: rgba(255,255,255,0.28);
  box-shadow: 0 14px 30px rgba(0,0,0,0.3);
}
.menu-btn.primary {
  grid-column: span 2;
  background: linear-gradient(135deg, #ff6b6b, #ffd166);
  border-color: rgba(255,255,255,0.6);
  font-size: 24px;
  padding: 26px;
}
.menu-btn.primary:hover {
  background: linear-gradient(135deg, #ff5252, #ffca4d);
}
.menu-btn.ghost {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
}
.menu-btn .icon { font-size: 22px; }
</style>
