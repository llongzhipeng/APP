<template>
  <div class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">{{ t('rulesTitle') }}</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Difficulty table -->
        <div class="section-title">📋 {{ t('rulesTitle') }}</div>
        <div class="rules-table">
          <div class="row row-header">
            <span>{{ t('rulesLevel') }}</span>
            <span>{{ t('rulesRule') }}</span>
            <span>{{ t('rulesCards') }}</span>
            <span>{{ t('rulesTime') }}</span>
            <span>{{ t('rulesCoeff') }}</span>
          </div>
          <div class="row" v-for="d in diffs" :key="d.level" :class="{ 'row-alt': d.level % 2 === 0 }">
            <span>{{ d.level }}</span>
            <span>{{ ruleLabel(d.rule) }}</span>
            <span>{{ d.cardCount }}</span>
            <span>{{ d.timeLimit }}s</span>
            <span>× {{ d.coefficient }}</span>
          </div>
        </div>

        <!-- Smart difficulty -->
        <div class="section-title">⚡ {{ t('rulesAdjTitle') }}</div>
        <p class="section-text">{{ t('rulesAdjContent') }}</p>

        <!-- Scoring -->
        <div class="section-title">🏆 {{ t('rulesScoreTitle') }}</div>
        <p class="section-text">{{ t('rulesScoreContent') }}</p>
        <div class="score-grid">
          <div class="score-chip" v-for="d in diffs" :key="d.level">
            <span class="chip-lv">Lv {{ d.level }}</span>
            <span class="chip-pts">+{{ 5 * d.coefficient }} pts</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="$emit('close')">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t, langState } from '../utils/i18n.js'
import { DIFFICULTIES } from '../utils/gameData.js'

export default {
  name: 'RulesModal',
  emits: ['close'],
  computed: {
    diffs() { return DIFFICULTIES },
  },
  methods: {
    t,
    ruleLabel(rule) {
      const isZh = langState.current === 'zh'
      if (rule === 'color')    return isZh ? '颜色' : 'Color'
      if (rule === 'quantity') return isZh ? '数量' : 'Quantity'
      return isZh ? '形状' : 'Shape'
    },
  },
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background: #fff;
  border-radius: 2vmin;
  width: min(90vw, 80vmin);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.3);
}

.modal-header {
  background: #4A90E2;
  color: white;
  padding: 2vmin 3vmin;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title {
  font-size: 2.4vmin;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2.2vmin;
  cursor: pointer;
  padding: 0.3vmin 0.8vmin;
  border-radius: 0.5vmin;
  opacity: 0.8;
}
.close-btn:hover { opacity: 1; background: rgba(255,255,255,0.15); }

.modal-body {
  overflow-y: auto;
  padding: 2.5vmin 3vmin;
  display: flex;
  flex-direction: column;
  gap: 1.5vmin;
}

.section-title {
  font-size: 2vmin;
  font-weight: 700;
  color: #4A90E2;
  margin-top: 0.5vmin;
}

.section-text {
  font-size: 1.7vmin;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* Table */
.rules-table {
  border-radius: 1vmin;
  overflow: hidden;
  border: 0.15vmin solid #dde3f0;
  font-size: 1.7vmin;
}

.row {
  display: grid;
  grid-template-columns: 0.5fr 1.2fr 0.7fr 0.8fr 0.7fr;
  padding: 0.9vmin 1.5vmin;
  border-bottom: 0.1vmin solid #eee;
  align-items: center;
}
.row:last-child { border-bottom: none; }

.row-header {
  background: #4A90E2;
  color: white;
  font-weight: 700;
}
.row-alt { background: #f5f7ff; }

/* Score grid */
.score-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2vmin;
}

.score-chip {
  background: #f5f7ff;
  border: 0.2vmin solid #c5cae9;
  border-radius: 0.8vmin;
  padding: 0.6vmin 1.3vmin;
  display: flex;
  gap: 1vmin;
  align-items: center;
  font-size: 1.6vmin;
}

.chip-lv { color: #888; }
.chip-pts { font-weight: 700; color: #4A90E2; }

.modal-footer {
  padding: 1.5vmin 3vmin;
  border-top: 0.15vmin solid #eee;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-close {
  padding: 0.9vmin 3vmin;
  font-size: 1.8vmin;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 0.8vmin;
  cursor: pointer;
  font-weight: 600;
}
.btn-close:hover { background: #357abd; }
</style>
