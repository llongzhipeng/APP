<template>
  <div class="rules-page">
    <button class="back-btn" @click="$emit('back')">{{ t('back') }}</button>
    <div class="content">
      <h1 class="title">{{ t('rulesTitle') }}</h1>
      <p class="desc">{{ t('rulesDesc') }}</p>

      <h2 class="section">{{ t('rulesLevels') }}</h2>
      <ul class="level-list">
        <li><b>1.</b> {{ t('rulesL1') }}</li>
        <li><b>2.</b> {{ t('rulesL2') }}</li>
        <li><b>3.</b> {{ t('rulesL3') }}</li>
        <li><b>4.</b> {{ t('rulesL4') }}</li>
        <li><b>5.</b> {{ t('rulesL5') }}</li>
        <li><b>6.</b> {{ t('rulesL6') }}</li>
      </ul>

      <p class="note">{{ t('rulesAdaptive') }}</p>
      <p class="note">{{ t('rulesScore') }}</p>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'
export default {
  name: 'RulesPage',
  props: ['lang'],
  methods: { t(k, p) { return t(this.lang, k, p) } }
}
</script>

<style scoped>
.rules-page {
  width: 100%; height: 100%;
  padding: 6vmin 8vmin 4vmin;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  overflow-y: auto;
  position: relative;
}
.back-btn {
  position: absolute; top: 3vmin; left: 3vmin;
  padding: 1.2vmin 2.5vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  color: #7a5a2c;
  border-radius: 3vmin;
  cursor: pointer;
  font-weight: 600;
}
.back-btn:hover { background: #fff8ec; }
.content { max-width: 90vmin; margin: 0 auto; }
.title { font-size: 5vmin; color: #7a3a1e; margin-bottom: 2.5vmin; letter-spacing: 0.3vmin; }
.desc { font-size: 2.4vmin; color: #555; margin-bottom: 3vmin; line-height: 1.6; }
.section { font-size: 3vmin; color: #7a3a1e; margin: 3vmin 0 1.5vmin; }
.level-list {
  list-style: none; padding: 0;
  background: #fff; border-radius: 2vmin;
  border: 0.25vmin solid #b08b4f;
  padding: 2vmin 3vmin;
  box-shadow: 0 0.4vmin 1.6vmin rgba(122,90,44,.1);
}
.level-list li {
  font-size: 2.4vmin;
  padding: 1vmin 0;
  color: #333;
  border-bottom: 0.1vmin solid #f0e4c8;
}
.level-list li:last-child { border-bottom: none; }
.level-list b { color: #d97742; margin-right: 1vmin; }
.note {
  margin-top: 2vmin;
  font-size: 2.2vmin;
  color: #7a5a2c;
  background: #fff8ec;
  padding: 1.5vmin 2vmin;
  border-left: 0.5vmin solid #d97742;
  border-radius: 1vmin;
  line-height: 1.5;
}

@media (orientation: portrait) {
  .rules-page {
    padding: calc(16vmin + env(safe-area-inset-top)) 5vw calc(6vmin + env(safe-area-inset-bottom));
    overflow-y: auto;
  }
  .back-btn {
    top: calc(3vmin + env(safe-area-inset-top));
    left: 4vw;
    padding: 2vmin 4vmin;
    font-size: max(3.6vmin, 14px);
    border-radius: 4vmin;
    border-width: 0.4vmin;
  }
  .content { max-width: 100%; }
  .title { font-size: max(7vmin, 24px); margin-bottom: 3vmin; }
  .desc { font-size: max(4vmin, 15px); line-height: 1.6; }
  .section { font-size: max(4.6vmin, 17px); margin: 4vmin 0 2vmin; }
  .level-list { padding: 3vmin 4vmin; border-radius: 2.5vmin; }
  .level-list li { font-size: max(4vmin, 15px); padding: 1.6vmin 0; }
  .note { font-size: max(3.8vmin, 14px); padding: 2.5vmin 3vmin; border-radius: 1.5vmin; }
}
</style>
