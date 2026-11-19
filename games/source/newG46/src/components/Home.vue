<template>
  <div class="home-page">
    <button v-if="!store.inGame" class="lang-btn" @click="onLang">{{ t('langToggle') }}</button>

    <div class="hero">
      <h1 class="title">{{ t('title') }}</h1>
      <div class="subtitle">{{ t('subtitle') }}</div>
    </div>

    <div class="menu">
      <button class="menu-btn primary" @click="$emit('go','tutorial')">{{ t('start') }}</button>
      <button class="menu-btn" @click="$emit('go','rules')">{{ t('rules') }}</button>
      <button class="menu-btn" @click="$emit('go','history')">{{ t('history') }}</button>
    </div>

    <div class="footer-mark">© Eagle Eye · Visual Training</div>
  </div>
</template>

<script>
import { store, t, toggleLang } from '../i18n.js'
export default {
  name: 'Home',
  data() { return { store } },
  methods: {
    t,
    onLang() { toggleLang() },
  },
}
</script>

<style scoped>
.home-page {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3em;
  background: #f6efe0;
  color: #3a2f1f;
  overflow: hidden;
}

.lang-btn {
  position: absolute; top: 1.5em; right: 1.5em; z-index: 20;
  padding: 0.65em 1.4em;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  color: #6b5a3a; font-size: 1em; font-weight: 600; letter-spacing: 0.1em;
  border-radius: 999px; cursor: pointer;
  transition: all .2s;
}
.lang-btn:hover { background: #f0e2be; }

.hero { text-align: center; }
.title {
  font-size: 4.2em;
  font-weight: 800; letter-spacing: 0.25em;
  color: #4a3a1e;
  margin: 0;
}
.subtitle {
  font-size: 1.1em;
  color: #8a7550; letter-spacing: 0.35em; margin-top: 0.8em;
  font-weight: 400;
}

.menu {
  display: flex; flex-direction: column;
  width: min(24em, 78vw);
}
.menu-btn {
  display: block; width: 100%;
  margin-bottom: 1em;
  padding: 1em 2em;
  font-size: 1.15em; font-weight: 600; letter-spacing: 0.15em;
  color: #4a3a1e;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  border-radius: 999px;
  cursor: pointer;
  transition: all .2s;
  line-height: 1.2;
}
.menu-btn:last-child { margin-bottom: 0; }
.menu-btn:hover { background: #f0e2be; transform: translateY(-1px); }
.menu-btn.primary {
  background: #c99a4b;
  border-color: #c99a4b;
  color: #fff;
}
.menu-btn.primary:hover { background: #b98738; border-color: #b98738; }

.footer-mark {
  position: absolute; bottom: 1.2em; left: 0; right: 0; text-align: center;
  font-size: 0.8em; color: #a99674; letter-spacing: 0.3em;
}
</style>
