<template>
  <div class="home">
    <button class="lang-btn" @click="toggleLang">
      <span :class="{ active: lang === 'zh' }">中文</span>
      <span class="sep">/</span>
      <span :class="{ active: lang === 'en' }">EN</span>
    </button>

    <div class="content">
      <h1 class="title">{{ t('appTitle') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>

      <div class="menu">
        <button class="btn btn-primary" @click="$emit('start')">{{ t('startGame') }}</button>
        <button class="btn btn-secondary" @click="$emit('rules')">{{ t('rules') }}</button>
        <button class="btn btn-secondary" @click="$emit('history')">{{ t('history') }}</button>
      </div>
    </div>

    <div class="footer">Cognitive Rehabilitation Training</div>
  </div>
</template>

<script>
import { i18n, setLang, t } from '../i18n.js'

export default {
  name: 'HomeScreen',
  computed: { lang() { return i18n.lang } },
  methods: {
    t,
    toggleLang() { setLang(i18n.lang === 'zh' ? 'en' : 'zh') }
  }
}
</script>

<style scoped>
.home {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(ellipse at 50% 15%, #fef4e8 0%, #faf6ef 55%, #f2ebde 100%);
  overflow: hidden;
}

.lang-btn {
  position: absolute; top: 3vmin; right: 3vmin;
  padding: 1.6vmin 3vmin; border-radius: 999px;
  background: #ffffff; border: 1px solid #e5ddce;
  color: #6b6357; font-size: 2.4vmin;
  z-index: 10; letter-spacing: 1px;
  transition: all 0.2s;
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.1);
}
.lang-btn:hover { border-color: #d97757; }
.lang-btn .active { color: #d97757; font-weight: 700; }
.lang-btn .sep { margin: 0 0.8vmin; color: #d8d0be; }

.content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  padding: 2vmin 4vmin;
  max-width: 100vmin;
}
.title {
  font-size: 8.5vmin;
  font-weight: 800;
  color: #2c2721;
  letter-spacing: 0.04em;
  text-align: center;
}
.subtitle {
  font-size: 2.8vmin;
  color: #7a7266;
  letter-spacing: 0.2em;
  margin-top: 2.5vmin;
  margin-bottom: 8vmin;
  text-align: center;
}
.menu {
  display: flex; flex-direction: column; gap: 2.5vmin;
  width: 40vmin;
  min-width: 320px;
  max-width: 90vw;
}
.btn {
  padding: 2.4vmin 3vmin;
  border-radius: 1.6vmin;
  font-size: 3vmin;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  box-shadow: 0 0.5vmin 1.6vmin rgba(122,90,44,.12);
}
.btn-primary {
  background: #d97757;
  color: #fff;
  border-color: #d97757;
}
.btn-primary:hover {
  background: #c5674a;
  border-color: #c5674a;
  transform: translateY(-0.3vmin);
}
.btn-secondary {
  background: #ffffff;
  color: #2c2721;
  border-color: #e5ddce;
}
.btn-secondary:hover {
  border-color: #d97757;
  color: #d97757;
  transform: translateY(-0.3vmin);
}
.footer {
  position: absolute; bottom: 3vmin; left: 0; right: 0; text-align: center;
  color: #a89f92; font-size: 1.9vmin; letter-spacing: 0.3em;
}
</style>
