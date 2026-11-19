<template>
  <div class="home">
    <button class="lang-btn" v-show="showLang" @click="toggleLang">{{ t('langSwitch') }}</button>

    <div class="title-wrap">
      <h1 class="title">{{ t('appTitle') }}</h1>
      <p class="subtitle">{{ t('appSubtitle') }}</p>
    </div>

    <div class="faces-row">
      <div class="face-preview" v-for="e in emotions" :key="e.key">
        <img :src="resolveImage(`/images/${e.folder}/1.png`)" :alt="e.key" />
        <span>{{ e[i18n.lang] }}</span>
      </div>
    </div>

    <div class="buttons">
      <button class="menu-btn primary" @click="$emit('start')">{{ t('startGame') }}</button>
      <button class="menu-btn" @click="$emit('rules')">{{ t('rules') }}</button>
      <button class="menu-btn" @click="$emit('history') ">{{ t('history') }}</button>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
import { i18n, setLang, t } from '../i18n.js'
import { EMOTIONS } from '../gameConfig.js'

export default {
  name: 'HomeScreen',
  props: { showLang: { type: Boolean, default: true } },
  data() {
    return { i18n, emotions: EMOTIONS }
  },
  methods: { resolveImage,
    t,
    toggleLang() {
      setLang(i18n.lang === 'zh' ? 'en' : 'zh')
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 3vh, 32px);
  padding: clamp(12px, 3vh, 28px) 3vmin;
  position: relative;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%);
  overflow-y: auto;
}

.lang-btn {
  position: absolute;
  top: clamp(8px, 2.5vmin, 20px);
  right: clamp(8px, 2.5vmin, 20px);
  width: clamp(36px, 6vmin, 56px);
  height: clamp(36px, 6vmin, 56px);
  border-radius: 50%;
  border: 0.3vmin solid #6366f1;
  background: white;
  color: #6366f1;
  font-size: clamp(12px, 2.2vmin, 20px);
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}
.lang-btn:hover { transform: scale(1.08); }

.title-wrap { text-align: center; }
.title {
  font-size: clamp(28px, 7vmin, 68px);
  font-weight: bold;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1vh;
}
.subtitle {
  font-size: clamp(12px, 2.2vmin, 22px);
  color: #64748b;
}

.faces-row {
  display: flex;
  gap: clamp(12px, 3vmin, 28px);
  flex-wrap: wrap;
  justify-content: center;
}
.face-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8vh;
}
.face-preview img {
  width: clamp(60px, 12vmin, 130px);
  height: clamp(60px, 12vmin, 130px);
  border-radius: 50%;
  object-fit: cover;
  border: 0.5vmin solid white;
  box-shadow: 0 1vmin 3vmin rgba(99,102,241,0.2);
}
.face-preview span {
  font-size: clamp(12px, 2vmin, 20px);
  color: #475569;
  font-weight: 500;
}

.buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: clamp(12px, 2.5vmin, 28px);
  justify-content: center;
  width: 100%;
  max-width: min(90vw, 900px);
}
.menu-btn {
  flex: 1 1 180px;
  min-height: clamp(44px, 7vmin, 64px);
  padding: 1.5vmin 3vmin;
  border-radius: 999px;
  border: none;
  font-size: clamp(14px, 2.4vmin, 22px);
  font-weight: 600;
  cursor: pointer;
  background: white;
  color: #6366f1;
  box-shadow: 0 0.6vmin 2vmin rgba(99,102,241,0.15);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}
.menu-btn:hover {
  transform: translateY(-0.4vmin);
  box-shadow: 0 1vmin 2.5vmin rgba(99,102,241,0.25);
}
.menu-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .home {
    padding: calc(6vh + env(safe-area-inset-top)) 5vw calc(4vh + env(safe-area-inset-bottom));
    gap: 4vh;
    justify-content: flex-start;
  }
  .title { font-size: max(9vmin, 28px); }
  .subtitle { font-size: max(3.6vmin, 14px); line-height: 1.5; padding: 0 2vw; }
  .faces-row { gap: 4vmin; }
  .face-preview img {
    width: max(18vmin, 64px);
    height: max(18vmin, 64px);
  }
  .face-preview span { font-size: max(3vmin, 13px); }
  .buttons {
    flex-direction: column;
    flex-wrap: nowrap;
    width: 82%;
    gap: 2.2vh;
  }
  .menu-btn {
    flex: 0 0 auto;
    width: 100%;
    min-height: max(9vmin, 52px);
    font-size: max(4vmin, 17px);
    border-radius: 999px;
  }
  .lang-btn {
    top: calc(1.5vh + env(safe-area-inset-top));
    right: 4vw;
    width: max(9vmin, 42px);
    height: max(9vmin, 42px);
    font-size: max(3.2vmin, 14px);
  }
}
</style>
