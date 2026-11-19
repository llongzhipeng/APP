<template>
  <div class="home-view">
    <div class="hero">
      <div class="hero-title">{{ t('appTitle') }}</div>
      <div class="hero-sub">{{ t('appSubtitle') }}</div>
    </div>

    <div class="menu">
      <button class="btn btn-primary big" @click="$emit('nav', { to: 'tutorial' })">{{ t('start') }}</button>
      <button class="btn big" @click="$emit('nav', { to: 'rules' })">{{ t('rules') }}</button>
      <button class="btn big" @click="$emit('nav', { to: 'history' })">{{ t('history') }}</button>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n.js'
export default { name: 'HomeView', mixins: [i18nMixin] }
</script>

<style scoped>
.home-view {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 4vmin;
}
.hero { text-align: center; margin-bottom: 7vmin; }
.hero-title {
  font-size: 9vmin;
  font-weight: 700;
  color: var(--c-title);
  letter-spacing: 0.8vmin;
  text-shadow: 0 0.4vmin 0 rgba(0,0,0,.05);
}
.hero-sub {
  font-size: 2.6vmin;
  color: var(--c-brown-dim);
  margin-top: 2.5vmin;
  letter-spacing: 0.3vmin;
}
.menu {
  display: flex; flex-direction: column; gap: 2.5vmin;
  width: 34vmin;
}
.btn.big { padding: 2vmin 3vmin; font-size: 2.6vmin; }
</style>
