<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <button class="close" @click="$emit('close')">×</button>
      <h2>📖 {{ t('rules') }}</h2>
      <ul class="rules-list">
        <li v-for="(line, i) in t('rulesText')" :key="i">{{ line }}</li>
      </ul>
      <div class="level-table">
        <div class="row header">
          <div>{{ t('difficultyLevel') }}</div>
          <div>🍾</div>
          <div>♪</div>
          <div>×</div>
        </div>
        <div v-for="lv in levels" :key="lv.level" class="row">
          <div>Lv.{{ lv.level }}</div>
          <div>{{ lv.bottles }}</div>
          <div>{{ lv.noteKinds }}</div>
          <div>{{ lv.factor }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { LEVELS } from '../game.js'
export default {
  name: 'Rules',
  props: { lang: String },
  computed: { levels() { return LEVELS.filter(Boolean) } },
  methods: { t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,20,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: fade 0.2s;
}
@keyframes fade { from { opacity: 0; } }
.modal {
  background: linear-gradient(160deg, #fff, #f2f6ff);
  border-radius: 24px;
  padding: 40px;
  width: 560px;
  max-width: 92vw;
  max-height: 88vh;
  overflow: auto;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  position: relative;
  animation: pop 0.28s cubic-bezier(.2,.9,.35,1.3);
}
@keyframes pop { from { transform: scale(0.85); opacity: 0; } }
.close {
  position: absolute; top: 14px; right: 18px;
  background: none; border: none; font-size: 32px;
  cursor: pointer; color: #888; line-height: 1;
}
.close:hover { color: #333; }
h2 {
  color: #2b3f6a;
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
}
.rules-list {
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
}
.rules-list li {
  padding: 12px 16px;
  background: rgba(77, 171, 247, 0.08);
  border-left: 4px solid #4dabf7;
  border-radius: 8px;
  margin-bottom: 10px;
  color: #333;
  font-size: 15px;
  line-height: 1.5;
}
.level-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #dae2f0;
}
.row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 10px 16px;
  align-items: center;
  text-align: center;
  color: #333;
}
.row.header {
  background: #4dabf7;
  color: #fff;
  font-weight: 700;
}
.row:not(.header):nth-child(even) { background: #f6f9ff; }
</style>
