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
              <td>{{ d.level }}</td>
              <td>{{ d.rule === 'forward' ? t.rulesForward : t.rulesReverse }}</td>
              <td>{{ d.count }}</td>
              <td>{{ d.maxTime }}s</td>
              <td>{{ d.coefficient }}</td>
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
  setup() {
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
  max-height: 85dvh;
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

.table-wrap {
  overflow-x: auto;
}

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

tr:last-child td {
  border-bottom: none;
}

tr:nth-child(even) td {
  background: rgba(255,255,255,0.03);
}

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
.btn-close:hover {
  opacity: 0.85;
}
</style>
