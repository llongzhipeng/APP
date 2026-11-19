<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal card rules-modal">
      <div class="modal-head">
        <h2>{{ t('rulesTitle') }}</h2>
        <button class="btn btn-ghost" @click="$emit('close')">{{ t('close') }}</button>
      </div>

      <section class="sec">
        <p>{{ t('rulesIntro') }}</p>
      </section>

      <section class="sec">
        <h3>{{ t('rulesHow') }}</h3>
        <p>{{ t('rulesHowText') }}</p>
      </section>

      <section class="sec">
        <h3>{{ t('rulesLevels') }}</h3>
        <div class="table-wrap">
          <table class="lvl-table">
            <thead>
              <tr>
                <th>{{ t('levelCol') }}</th>
                <th>{{ t('tempoCol') }}</th>
                <th>{{ t('toleranceCol') }}</th>
                <th>{{ t('coefCol') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in LEVELS" :key="l.level">
                <td><span class="lvl-badge">{{ l.level }}</span></td>
                <td>{{ t(l.labelKey) }} · {{ l.bpm }} BPM</td>
                <td>± {{ l.tolerance }} {{ t('unit_s') }}</td>
                <td>{{ l.coef.toFixed(1) }}×</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec">
        <h3>{{ t('rulesAdaptive') }}</h3>
        <p>{{ t('rulesAdaptiveText') }}</p>
      </section>

      <section class="sec">
        <h3>{{ t('rulesScore') }}</h3>
        <p>{{ t('rulesScoreText') }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import { LEVELS } from '../difficulty.js'
import { i18nMixin } from '../i18n.js'
export default { mixins: [i18nMixin], data() { return { LEVELS } } }
</script>

<style scoped>
.rules-modal { width: min(92vw, 780px); }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.modal-head h2 { font-size: 1.5rem; font-weight: 700; }
.sec { margin: 1rem 0; }
.sec h3 {
  font-size: 1.1rem; color: var(--accent); margin-bottom: .5rem;
  letter-spacing: .05em;
}
.sec p { color: var(--ink-mid); line-height: 1.7; }
.table-wrap { overflow-x: auto; }
.lvl-table { width: 100%; border-collapse: collapse; margin-top: .6rem; }
.lvl-table th, .lvl-table td {
  padding: .7em 1em;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.lvl-table th { color: var(--ink-dim); font-size: .85rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
.lvl-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.8em; height: 1.8em; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #2a1a05; font-weight: 700;
}
</style>
