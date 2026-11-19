<template>
  <div class="modal-mask">
    <div class="modal">
      <div class="modal-title">{{ t('resultTitle') }}</div>
      <div class="stats">
        <div class="stat big">
          <div class="v">{{ result.score }}</div>
          <div class="l">{{ t('finalScore') }}</div>
        </div>
        <div class="grid">
          <div class="stat"><div class="v">{{ result.total }}</div><div class="l">{{ t('total') }}</div></div>
          <div class="stat"><div class="v good">{{ result.correct }}</div><div class="l">{{ t('correct') }}</div></div>
          <div class="stat"><div class="v bad">{{ result.wrong }}</div><div class="l">{{ t('wrong') }}</div></div>
          <div class="stat"><div class="v">{{ (result.accuracy*100).toFixed(0) }}%</div><div class="l">{{ t('accuracy') }}</div></div>
          <div class="stat"><div class="v">Lv{{ result.level }}</div><div class="l">{{ t('difficulty') }}</div></div>
          <div class="stat"><div class="v">{{ (result.avgReactionMs/1000).toFixed(2) }}s</div><div class="l">{{ t('avgTime') }}</div></div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn ghost" @click="$emit('home')">{{ t('home') }}</button>
        <button class="btn primary" @click="$emit('again')">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import { t } from '../i18n'
export default {
  name: 'ResultScreen',
  props: { result: { type: Object, required: true } },
  methods: { t },
}
</script>
<style scoped>
@import './modal.css';
.stats { text-align: center; }
.stat.big { margin-bottom: 3vh; }
.stat.big .v { font-size: 8vmin; font-weight: 600; color: #6ec8ea; line-height: 1; }
.stat.big .l { font-size: 1.7vmin; color: rgba(200, 220, 240, 0.6); margin-top: 0.5vh; text-transform: uppercase; letter-spacing: 0.2vmin; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5vmin; }
.stat {
  padding: 1.6vmin 1vmin;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8vmin;
}
.stat .v { font-size: 2.6vmin; font-weight: 600; color: #fff; }
.stat .v.good { color: #7cd9a4; }
.stat .v.bad { color: #e08070; }
.stat .l { font-size: 1.3vmin; color: rgba(200, 220, 240, 0.55); margin-top: 0.4vh; text-transform: uppercase; letter-spacing: 0.15vmin; }
.btn-row { display: flex; justify-content: center; gap: 2vmin; margin-top: 3vh; }
.btn { display: inline-block; margin: 0; }
</style>
