<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <h2 class="modal-title">{{ t('rulesTitle') }}</h2>

      <div class="rules-content">
        <section>
          <h3>{{ t('rulesGoal') }}</h3>
          <p>{{ t('rulesGoalText') }}</p>
        </section>
        <section>
          <h3>{{ t('rulesPlay') }}</h3>
          <p>{{ t('rulesPlayText') }}</p>
        </section>
        <section>
          <h3>{{ t('rulesLevels') }}</h3>
          <p class="hint">{{ t('rulesLevelHint') }}</p>
          <table>
            <thead>
              <tr>
                <th v-for="h in t('rulesLevelHeaders')" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in difficulties" :key="d.level">
                <td>{{ d.level }}</td>
                <td>{{ d.faces }}</td>
                <td>{{ d.displayTime }}</td>
                <td>{{ d.options }}</td>
                <td>{{ d.coefficient }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section>
          <h3>{{ t('rulesAdaptive') }}</h3>
          <p>{{ t('rulesAdaptiveText') }}</p>
        </section>
        <section>
          <h3>{{ t('rulesScore') }}</h3>
          <p>{{ t('rulesScoreText') }}</p>
        </section>
      </div>

      <button class="close-btn" @click="$emit('close')">{{ t('close') }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { DIFFICULTIES } from '../gameConfig.js'
export default {
  name: 'RulesModal',
  data() { return { difficulties: DIFFICULTIES } },
  methods: { t }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  width: min(80vmin, 92vw);
  max-height: 90vh;
  background: white;
  border-radius: 3vmin;
  padding: 4vmin;
  display: flex;
  flex-direction: column;
  gap: 2vmin;
}
.modal-title {
  font-size: 4vmin;
  color: #4f46e5;
  text-align: center;
}
.rules-content {
  overflow-y: auto;
  padding-right: 1vmin;
  display: flex; flex-direction: column; gap: 2vmin;
}
section h3 {
  font-size: 2.6vmin;
  color: #1e293b;
  margin-bottom: 0.6vmin;
}
section p {
  font-size: 2.2vmin;
  color: #475569;
  line-height: 1.6;
}
.hint { margin-bottom: 1.2vmin; color: #6366f1; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 2.1vmin;
}
th, td {
  border: 0.15vmin solid #e2e8f0;
  padding: 1vmin;
  text-align: center;
}
th { background: #f1f5f9; color: #334155; }
.close-btn {
  align-self: center;
  padding: 1.4vmin 5vmin;
  border-radius: 3vmin;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  font-size: 2.4vmin;
  cursor: pointer;
}

/* ==== Portrait (mobile) ==== */
@media (orientation: portrait) {
  .modal {
    width: 94vw;
    max-height: 90vh;
    padding: 5vmin 4vmin calc(4vmin + env(safe-area-inset-bottom));
    padding-top: calc(5vmin + env(safe-area-inset-top));
    border-radius: 4vmin;
    gap: 3vmin;
  }
  .modal-title { font-size: max(5.5vmin, 20px); }
  section h3 { font-size: max(4vmin, 16px); margin-bottom: 1vmin; }
  section p { font-size: max(3.4vmin, 14px); }
  table { font-size: max(3vmin, 12px); }
  th, td { padding: 1.5vmin 0.8vmin; }
  .close-btn {
    width: 80%;
    padding: 2.6vmin 6vmin;
    font-size: max(3.8vmin, 16px);
    border-radius: 4vmin;
  }
}
</style>
