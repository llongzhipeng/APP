<template>
  <div class="modal-view" @click.self="$emit('nav', { to: 'home' })">
    <div class="modal paper">
      <header class="modal-header">
        <h2>{{ t('rulesTitle') }}</h2>
        <button class="close-x" @click="$emit('nav', { to: 'home' })" aria-label="close">✕</button>
      </header>
      <div class="modal-body">
        <ol class="rule-list">
          <li>{{ t('ruleLine1') }}</li>
          <li>{{ t('ruleLine2') }}</li>
          <li>{{ t('ruleLine3') }}</li>
          <li>{{ t('ruleLine4') }}</li>
          <li>{{ t('ruleLine5') }}</li>
        </ol>

        <h3 class="table-title">{{ t('difficultyTable') }}</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('colLevel') }}</th>
                <th>{{ t('colType') }}</th>
                <th>{{ t('colComplexity') }}</th>
                <th>{{ t('colOptions') }}</th>
                <th>{{ t('colCoef') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in DIFFICULTIES" :key="d.level">
                <td><span class="lv-chip">{{ d.level }}</span></td>
                <td>{{ d.type === 'syn' ? t('typeSyn') : t('typeAnt') }}</td>
                <td>{{ t('cx' + capitalize(d.complexity)) }}</td>
                <td>{{ d.options }}</td>
                <td><b>{{ d.coef }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <footer class="modal-footer">
        <button class="btn btn-primary" @click="$emit('nav', { to: 'home' })">{{ t('ok') }}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { DIFFICULTIES } from '../wordBank.js'
import { i18nMixin } from '../i18n.js'
export default {
  name: 'RulesModal',
  mixins: [i18nMixin],
  data() { return { DIFFICULTIES } },
  methods: { capitalize(s) { return s[0].toUpperCase() + s.slice(1) } },
}
</script>

<style scoped>
.modal-view {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 4vmin;
  background: rgba(122,58,30,.15);
}
.modal {
  width: min(85vmin, 100%);
  max-height: 92%;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 3vmin 3.5vmin;
  border-bottom: 0.2vmin solid var(--c-line);
  background: var(--c-paper-soft);
}
.modal-header h2 { font-size: 3.6vmin; font-weight: 700; color: var(--c-title); letter-spacing: 0.2vmin; }
.close-x {
  width: 4vmin; height: 4vmin; border-radius: 50%;
  background: var(--c-paper);
  border: 0.25vmin solid var(--c-line-2);
  color: var(--c-brown);
  font-size: 2vmin;
  transition: background .2s;
}
.close-x:hover { background: var(--c-orange); color: #fff; border-color: var(--c-orange-dim); }

.modal-body {
  padding: 3vmin 3.5vmin;
  overflow-y: auto;
  font-size: 2.2vmin;
  line-height: 1.8;
  color: #4a3a26;
}
.rule-list { padding-left: 3vmin; }
.rule-list li { margin-bottom: 1vmin; }
.rule-list li::marker { color: var(--c-orange); font-weight: 700; }

.table-title { margin: 3vmin 0 1.5vmin; font-size: 2.6vmin; font-weight: 700; color: var(--c-title); }
.table-wrap {
  overflow-x: auto;
  border-radius: 1.5vmin;
  border: 0.25vmin solid var(--c-line);
  background: var(--c-paper-soft);
}
table { width: 100%; border-collapse: collapse; }
th, td {
  padding: 1.6vmin 1.4vmin;
  text-align: center;
  font-size: 2.1vmin;
  border-bottom: 0.15vmin solid #eadfc4;
}
tbody tr:last-child td { border-bottom: none; }
thead th {
  background: #efe3c8;
  color: var(--c-brown);
  font-weight: 700;
  letter-spacing: 0.15vmin;
}
tbody tr:hover { background: #fff2e0; }

.lv-chip {
  display: inline-block;
  min-width: 3.4vmin; padding: 0.4vmin 1.4vmin;
  border-radius: 3vmin;
  background: linear-gradient(135deg, var(--c-orange), var(--c-orange-dim));
  color: #fff; font-weight: 700;
}

.modal-footer {
  display: flex; justify-content: flex-end;
  padding: 2.5vmin 3.5vmin;
  border-top: 0.2vmin solid var(--c-line);
  background: var(--c-paper-soft);
}
</style>
