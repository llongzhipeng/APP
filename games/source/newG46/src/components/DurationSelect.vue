<template>
  <div class="dur-page">
    <div class="dur-content">
      <div class="dur-title">{{ t('durationTitle') }}</div>
      <div class="dur-desc">{{ t('durationDesc') }}</div>

      <div class="dur-grid">
        <div class="dur-card" :class="{active: sel===60}" @click="sel=60">
          <div class="dur-num">1</div>
          <div class="dur-unit">MIN</div>
          <div class="dur-tag">{{ t('min1') }}</div>
        </div>
        <div class="dur-card" :class="{active: sel===180}" @click="sel=180">
          <div class="dur-num">3</div>
          <div class="dur-unit">MIN</div>
          <div class="dur-tag">{{ t('min3') }}</div>
        </div>
        <div class="dur-card" :class="{active: sel===300}" @click="sel=300">
          <div class="dur-num">5</div>
          <div class="dur-unit">MIN</div>
          <div class="dur-tag">{{ t('min5') }}</div>
        </div>
      </div>

      <div class="dur-actions">
        <button class="a-btn back" @click="$emit('back')">{{ t('back') }}</button>
        <button class="a-btn start" @click="$emit('start', sel)">{{ t('beginTraining') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'DurationSelect',
  data() { return { sel: 180 } },
  methods: { t },
}
</script>

<style scoped>
.dur-page {
  position: absolute; inset: 0; overflow: hidden;
  background: #f6efe0;
  color: #3a2f1f;
  display: flex; align-items: center; justify-content: center;
}
.dur-content { text-align: center; padding: 2em; }
.dur-title {
  font-size: 3em; font-weight: 800; letter-spacing: 0.2em;
  color: #4a3a1e; margin-bottom: 0.4em;
}
.dur-desc { color: #8a7550; font-size: 1.1em; margin-bottom: 2em; letter-spacing: 0.15em; }

.dur-grid { display: flex; gap: 1.5em; justify-content: center; margin-bottom: 2.5em; flex-wrap: wrap; }
.dur-card {
  width: 11em; height: 13em;
  border-radius: 1em;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  color: #4a3a1e;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: all .2s;
}
.dur-card:hover { background: #f0e2be; }
.dur-card.active {
  border-color: #c99a4b;
  background: #f6e6c1;
  box-shadow: 0 0.3em 1em rgba(201,154,75,.25);
}
.dur-num {
  font-size: 5em; font-weight: 800; line-height: 1;
  color: #b98738;
}
.dur-unit {
  font-size: 0.95em; font-weight: 700; letter-spacing: 0.35em;
  color: #8a7550; margin-top: 0.4em;
}
.dur-tag {
  margin-top: 1em; padding: 0.3em 1em; border-radius: 999px;
  font-size: 0.9em; font-weight: 500;
  background: #f0e2be; color: #6b5a3a;
}

.dur-actions { display: flex; gap: 1.2em; justify-content: center; }
.a-btn {
  padding: 0.9em 2.4em; border-radius: 999px;
  font-size: 1.1em; font-weight: 600; letter-spacing: 0.15em;
  cursor: pointer; transition: all .2s; border: 1px solid transparent;
}
.a-btn.back { background: #fff8e8; border-color: #d9c9a3; color: #6b5a3a; }
.a-btn.back:hover { background: #f0e2be; }
.a-btn.start { background: #c99a4b; color: #fff; }
.a-btn.start:hover { background: #b98738; }
</style>
