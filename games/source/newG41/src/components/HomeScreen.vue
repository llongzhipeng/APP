<template>
  <div class="home">
    <Starfield />
    <div class="content">
      <div class="title-wrap">
        <div class="logo">
          <svg viewBox="0 0 120 120" class="logo-svg">
            <defs>
              <radialGradient id="logoGrad" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#7ab8ff"/>
                <stop offset="100%" stop-color="#2a3e9a"/>
              </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="42" fill="url(#logoGrad)"/>
            <ellipse cx="60" cy="60" rx="58" ry="14" fill="none" stroke="#8bc4ff" stroke-width="2.5" opacity=".8" transform="rotate(-20 60 60)"/>
            <circle cx="45" cy="48" r="6" fill="#fff" opacity=".55"/>
          </svg>
        </div>
        <h1 class="title">{{ t.appName }}</h1>
        <div class="subtitle">{{ t.subtitle }}</div>
      </div>

      <div class="menu">
        <button class="btn btn-primary" @click="$emit('start')">
          <span class="btn-glow"></span>
          <span class="btn-text">{{ t.startGame }}</span>
        </button>
        <button class="btn btn-ghost" @click="$emit('rules')">{{ t.rules }}</button>
        <button class="btn btn-ghost" @click="$emit('history')">{{ t.history }}</button>
      </div>
    </div>

    <button class="lang" @click="$emit('toggle-lang')">
      <span :class="{active: lang==='zh'}">中</span>
      <span class="sep">/</span>
      <span :class="{active: lang==='en'}">EN</span>
    </button>
  </div>
</template>

<script>
import Starfield from './Starfield.vue'
export default {
  name: 'HomeScreen',
  components: { Starfield },
  props: { t: Object, lang: String }
}
</script>

<style scoped>
.home {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: #fff;
}
.content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3em;
  padding: 4vh 4vw;
}
.title-wrap { text-align: center; }
.logo { width: 8em; height: 8em; margin: 0 auto 0.6em; animation: float 5s ease-in-out infinite; filter: drop-shadow(0 0 30px rgba(120, 180, 255, 0.5)); }
.logo-svg { width: 100%; height: 100%; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }

.title {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: clamp(2.4em, 6vw, 4.5em);
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(180deg, #fff 0%, #a5c8ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 40px rgba(120, 180, 255, 0.4);
  margin-bottom: 0.3em;
}
.subtitle {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  color: #a5b8e0;
  font-size: clamp(0.9em, 1.4vw, 1.1em);
  letter-spacing: 0.4em;
  text-transform: uppercase;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1.3em;
  align-items: stretch;
  min-width: 22em;
}
.btn {
  position: relative;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 1.35em;
  letter-spacing: 0.2em;
  padding: 1.15em 2.5em;
  border-radius: 999px;
  border: 2px solid rgba(140, 180, 255, 0.45);
  background: rgba(20, 30, 70, 0.5);
  color: #e0ecff;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
  overflow: hidden;
}
.btn:hover {
  transform: translateY(-3px);
  border-color: #7fb0ff;
  color: #fff;
  box-shadow: 0 10px 30px rgba(100, 160, 255, 0.35);
}
.btn-primary {
  background: linear-gradient(135deg, #3d5afe 0%, #7c4dff 50%, #ff4dcb 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 30px rgba(90, 100, 255, 0.5), inset 0 1px 0 rgba(255,255,255,.3);
}
.btn-primary:hover { box-shadow: 0 15px 40px rgba(90, 100, 255, 0.7); }
.btn-glow {
  position: absolute; inset: -50%;
  background: conic-gradient(from 0deg, transparent, rgba(255,255,255,.35), transparent 30%);
  animation: spin 4s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.btn-text { position: relative; z-index: 1; }

.lang {
  position: absolute;
  top: 2em;
  right: 2em;
  z-index: 3;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1.05em;
  padding: 0.7em 1.5em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.45);
  background: rgba(10, 15, 40, 0.55);
  color: #a5c0ee;
  backdrop-filter: blur(10px);
  cursor: pointer;
  letter-spacing: 0.15em;
  transition: all .25s;
}
.lang:hover { border-color: #7fb0ff; color: #fff; }
.lang .active { color: #fff; }
.lang .sep { margin: 0 .3em; opacity: .5; }
</style>
