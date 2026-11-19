<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">{{ t('rulesTitle') }}</div>
        <button class="icon-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <section class="block">
          <h3>{{ t('ruleGoal') }}</h3>
          <p>{{ t('ruleGoalDesc') }}</p>
        </section>
        <section class="block">
          <h3>{{ t('ruleFlow') }}</h3>
          <p>{{ t('ruleFlowDesc') }}</p>
        </section>
        <section class="block">
          <h3>{{ t('ruleDifficulty') }}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('thDifficulty') }}</th>
                <th>{{ t('thInfoCount') }}</th>
                <th>{{ t('thMemTime') }}</th>
                <th>{{ t('thDistTime') }}</th>
                <th>{{ t('thCoef') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in difficulties" :key="d.level">
                <td><span class="rn">{{ roman[d.level-1] }}</span></td>
                <td>{{ d.infoCount }}</td>
                <td>{{ d.memTime }}{{ t('seconds') }}</td>
                <td>{{ d.distTime }}{{ t('seconds') }}</td>
                <td>×{{ d.coef }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section class="block">
          <h3>{{ t('ruleAdaptive') }}</h3>
          <p>{{ t('ruleAdaptiveDesc') }}</p>
        </section>
        <section class="block">
          <h3>{{ t('ruleScore') }}</h3>
          <p>{{ t('ruleScoreDesc') }}</p>
        </section>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="$emit('close')">{{ t('confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { DIFFICULTIES } from '../data/config.js'

export default {
  name: 'RulesModal',
  data() { return { difficulties: DIFFICULTIES, roman: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ'] } },
  methods: { t }
}
</script>

<style scoped>
.block { margin-bottom: calc(var(--u) * 2.2); }
.block:last-child { margin-bottom: 0; }
.block h3 {
  font-size: calc(var(--u) * 1.05);
  margin: 0 0 calc(var(--u) * 1);
  color: var(--ink-3);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.block p {
  color: var(--ink-2);
  line-height: 1.75;
  font-size: calc(var(--u) * 1.25);
  margin: 0;
  font-weight: 300;
}
.rn {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.4);
  color: var(--accent);
  letter-spacing: 0.05em;
}
</style>
