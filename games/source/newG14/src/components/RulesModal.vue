<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <h2 class="modal-title">{{ t.rulesTitle }}</h2>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.rulesLevel }}</th>
              <th>{{ t.rulesRule }}</th>
              <th>{{ t.rulesCount }}</th>
              <th>{{ t.rulesTime }}</th>
              <th>{{ t.rulesCoeff }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in difficulties" :key="d.level">
              <td :data-label="t.rulesLevel">{{ d.level }}</td>
              <td :data-label="t.rulesRule">{{ d.rule === 'forward' ? t.rulesForward : t.rulesReverse }}</td>
              <td :data-label="t.rulesCount">{{ d.count }}</td>
              <td :data-label="t.rulesTime">{{ d.maxTime }}s</td>
              <td :data-label="t.rulesCoeff">{{ d.coefficient }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rules-extra">
        <div class="rules-section">
          <h3>{{ t.rulesScoringTitle }}</h3>
          <p>{{ t.rulesScoringDesc }}</p>
        </div>
        <div class="rules-section">
          <h3>{{ t.rulesDiffAdjTitle }}</h3>
          <p>{{ t.rulesDiffAdjDesc }}</p>
        </div>
      </div>

      <button class="btn-close" @click="$emit('close')">{{ t.close }}</button>
    </div>
  </div>
</template>

<script>
import { DIFFICULTIES } from '../gameConfig.js'
export default {
  name: 'RulesModal',
  props: {
    t: { type: Object, required: true }
  },
  emits: ['close'],
  data() {
    return { difficulties: DIFFICULTIES }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(0.3rem);
}

.modal-box {
  background: linear-gradient(135deg, #141830, #1e2040);
  border: 0.1rem solid rgba(0, 212, 255, 0.3);
  border-radius: 1rem;
  padding: 2rem 2.5rem;
  width: min(90vw, 36rem);
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.modal-title {
  color: #00d4ff;
  font-size: 1.3rem;
  text-align: center;
  margin: 0;
}

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  color: #e0e8ff;
}

th {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  padding: 0.5rem 0.6rem;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding: 0.45rem 0.6rem;
  text-align: center;
  border-bottom: 0.05rem solid rgba(255,255,255,0.07);
}

tr:last-child td { border-bottom: none; }
tr:nth-child(even) td { background: rgba(255,255,255,0.03); }

.rules-extra {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.rules-section h3 {
  color: #00d4ff;
  font-size: 0.9rem;
  margin: 0 0 0.3rem;
}

.rules-section p {
  color: #b0c0e0;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

.btn-close {
  align-self: center;
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}
.btn-close:hover { opacity: 0.85; }

@media (orientation: portrait) {
  .modal-box {
    width: 92vw;
    max-height: 88vh;
    padding: 1.6rem 1.2rem;
    padding-top: calc(1.6rem + env(safe-area-inset-top));
    padding-bottom: calc(1.6rem + env(safe-area-inset-bottom));
    border-radius: 1.2rem;
    gap: 1.4rem;
  }
  .modal-title { font-size: max(5vmin, 18px); }
  /* Convert table to card list */
  .table-wrap { overflow-x: visible; }
  table, thead, tbody, tr, td { display: block; width: 100%; }
  thead { display: none; }
  tr {
    background: rgba(255,255,255,0.04);
    border: 0.1rem solid rgba(0,212,255,0.18);
    border-radius: 0.8rem;
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.6rem;
  }
  tr:nth-child(even) td { background: transparent; }
  td {
    border-bottom: 0.05rem dashed rgba(255,255,255,0.08);
    padding: 0.4rem 0;
    text-align: left;
    font-size: max(3.4vmin, 13px);
    display: flex;
    justify-content: space-between;
  }
  tr td:last-child { border-bottom: none; }
  td::before {
    content: attr(data-label);
    color: rgba(0,212,255,0.75);
    font-weight: 600;
    margin-right: 0.6rem;
  }
  .rules-section h3 { font-size: max(3.8vmin, 15px); }
  .rules-section p { font-size: max(3.4vmin, 13px); }
  .btn-close {
    width: 80%;
    padding: 1rem;
    font-size: max(4vmin, 15px);
    border-radius: 0.7rem;
  }
}
</style>
