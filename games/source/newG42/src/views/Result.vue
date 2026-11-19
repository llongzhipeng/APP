<template>
  <div class="stage result">
    <div class="wrap">
      <div class="eyebrow">{{ lang==='zh' ? '训练报告' : 'Session Report' }}</div>
      <h1>{{ t('resultTitle') }}</h1>
      <div class="rule"></div>

      <div class="score-block">
        <div class="k">{{ t('score') }}</div>
        <div class="v">{{ Math.round(payload.score) }}<em>pts</em></div>
      </div>

      <div class="metrics">
        <div class="m">
          <div class="mk">{{ t('thTotal') }}</div>
          <div class="mv">{{ payload.total }}</div>
        </div>
        <div class="m">
          <div class="mk">{{ t('thSuccess') }}</div>
          <div class="mv ok">{{ payload.correct }}</div>
        </div>
        <div class="m">
          <div class="mk">{{ t('thFail') }}</div>
          <div class="mv bad">{{ payload.wrong }}</div>
        </div>
        <div class="m">
          <div class="mk">{{ t('thRate') }}</div>
          <div class="mv">{{ rate }}%</div>
        </div>
        <div class="m">
          <div class="mk">{{ t('thReact') }}</div>
          <div class="mv">{{ payload.avgReact ? payload.avgReact.toFixed(2) : '-' }}s</div>
        </div>
        <div class="m">
          <div class="mk">{{ t('thLevel') }}</div>
          <div class="mv rn">{{ roman[payload.level-1] }}</div>
        </div>
      </div>

      <div class="saved">— {{ t('savedTip') }} —</div>

      <div class="actions">
        <button class="btn btn-ghost btn-lg" @click="$emit('home')">{{ t('home') }}</button>
        <button class="btn btn-primary btn-lg" @click="$emit('again')">{{ t('playAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t, i18n } from '../i18n.js'
export default {
  name: 'Result',
  props: { payload: { type: Object, required: true } },
  data() { return { roman: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ'] } },
  computed: {
    lang() { return i18n.lang },
    rate() { return this.payload.total ? Math.round(this.payload.correct / this.payload.total * 100) : 0 }
  },
  methods: { t }
}
</script>

<style scoped>
.result { padding: calc(var(--u) * 3); }
.wrap { width: 100%; max-width: calc(var(--u) * 60); text-align: center; }

.eyebrow {
  font-size: calc(var(--u) * 1.05);
  letter-spacing: 0.32em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 2);
}
h1 {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 4);
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.06em;
}
.rule { width: calc(var(--u) * 4); height: 1px; background: var(--accent); margin: calc(var(--u) * 2) auto calc(var(--u) * 4); }

.score-block { margin-bottom: calc(var(--u) * 4); }
.score-block .k {
  font-size: calc(var(--u) * 1.05);
  letter-spacing: 0.28em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 1);
}
.score-block .v {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 9);
  font-weight: 400;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.score-block .v em {
  font-style: normal;
  font-size: calc(var(--u) * 1.6);
  color: var(--ink-3);
  margin-left: calc(var(--u) * 0.6);
  letter-spacing: 0.06em;
  font-family: var(--font-sans);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: calc(var(--u) * 3);
}
.m {
  padding: calc(var(--u) * 2) calc(var(--u) * 1.4);
  border-right: 1px solid var(--line);
}
.m:nth-child(3n) { border-right: none; }
.m:nth-child(n+4) { border-top: 1px solid var(--line); }
.mk {
  font-size: calc(var(--u) * 1);
  letter-spacing: 0.22em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 0.8);
}
.mv {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 2.4);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.mv.ok { color: var(--ok); }
.mv.bad { color: var(--bad); }
.mv.rn { color: var(--accent); }

.saved {
  color: var(--ink-3);
  font-size: calc(var(--u) * 1.15);
  letter-spacing: 0.14em;
  margin-bottom: calc(var(--u) * 3);
}

.actions { display: flex; justify-content: center; gap: calc(var(--u) * 1); }
</style>
