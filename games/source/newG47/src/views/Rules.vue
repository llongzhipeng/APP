<template>
  <div class="page">
    <button class="back-btn" @click="$emit('go', 'home')">← {{ t('back') }}</button>
    <div class="card">
      <h2>{{ t('rulesTitle') }}</h2>
      <ol>
        <li v-for="(line, i) in t('rulesContent')" :key="i">{{ line }}</li>
      </ol>
      <div class="difficulty-table">
        <div class="row header">
          <span>{{ t('difficulty') }}</span><span>#</span><span>{{ t('memorizeCountdown') }}</span><span>×</span>
        </div>
        <div class="row" v-for="d in DIFFICULTY" :key="d.level">
          <span>Lv.{{ d.level }}</span><span>{{ d.highlights }}</span><span>{{ d.viewTime }}s</span><span>{{ d.coef }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { t as trans } from '../i18n.js'
import { store, DIFFICULTY } from '../store.js'
export default {
  name: 'Rules',
  data() { return { DIFFICULTY } },
  methods: { t(k) { return trans(store.lang, k) } }
}
</script>
<style scoped>
.page { position: absolute; inset: 0; background: linear-gradient(135deg, #1a1a3e, #2d1b5e); overflow: auto; padding: 6vh 5vw; }
.back-btn {
  background: linear-gradient(135deg, #ef476f, #ffd166);
  border: none;
  color: #fff;
  padding: 1.6vmin 3.2vmin;
  border-radius: 999px;
  cursor: pointer;
  margin-bottom: 3vmin;
  font-size: 2.4vmin;
  font-weight: 700;
  box-shadow: 0 1.2vmin 2.4vmin rgba(239, 71, 111, 0.45);
  transition: all .2s;
}
.back-btn:hover { transform: translateY(-3px); box-shadow: 0 1.6vmin 3vmin rgba(239, 71, 111, 0.55); }
.card {
  max-width: 720px; margin: 0 auto;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 24px; padding: 40px;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0,0,0,0.35);
}
h2 { font-size: 1.8em; margin-bottom: 24px; background: linear-gradient(135deg, #ffd166, #ef476f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
ol { padding-left: 20px; line-height: 2; }
ol li { margin-bottom: 6px; }
.difficulty-table { margin-top: 24px; border-radius: 12px; overflow: hidden; }
.row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 12px; text-align: center; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.08); }
.row.header { background: rgba(255,255,255,0.15); font-weight: 700; }
</style>
