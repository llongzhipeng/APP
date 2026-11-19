<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ t('history.title') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="records.length === 0" class="no-record">
          {{ t('history.noRecord') }}
        </div>

        <div v-else class="table-wrap">
          <table class="hist-table">
            <thead>
              <tr>
                <th v-for="h in t('history.headers')" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rec, idx) in records" :key="idx">
                <td>{{ rec.date }}</td>
                <td>{{ formatDuration(rec.duration) }}</td>
                <td>{{ rec.total }}</td>
                <td class="cell-ok">{{ rec.success }}</td>
                <td class="cell-fail">{{ rec.fail }}</td>
                <td>{{ rec.rate }}</td>
                <td>{{ rec.avgTime }}s</td>
                <td class="cell-score">{{ rec.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <button v-if="records.length > 0" class="clear-btn" @click="clearRecords">
          {{ t('history.clear') }}
        </button>
        <button class="close-full-btn" @click="$emit('close')">{{ t('history.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game11HistoryModal'
};
</script>

<script setup>
import { ref } from '@vue/composition-api'

const props = defineProps({ t: Function })
defineEmits(['close'])

const records = ref(loadRecords())

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem('ballTrackHistory') || '[]')
  } catch (e) {
    return []
  }
}

function clearRecords() {
  if (!confirm(props.t('history.confirmClear'))) return
  localStorage.removeItem('ballTrackHistory')
  records.value = []
}

function formatDuration(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return sec ? `${m}分${sec}秒` : `${m}分钟`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(102, 78, 162, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 2vh 2vw;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  width: min(96vw, 900px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.5vh 3vw;
  border-bottom: 1px solid rgba(102, 126, 234, 0.12);
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-header h2 {
  color: #fff;
  font-size: clamp(1rem, 2vw, 1.6rem);
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: clamp(28px, 3vw, 40px);
  height: clamp(28px, 3vw, 40px);
  border-radius: 50%;
  font-size: clamp(12px, 1.2vw, 16px);
  cursor: pointer;
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2.5vh 3vw;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.no-record {
  color: #aaa;
  text-align: center;
  font-size: clamp(13px, 1.3vw, 16px);
  padding: 6vh 0;
}

.table-wrap {
  overflow-x: auto;
}

.hist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(11px, 1vw, 13px);
  white-space: nowrap;
}

.hist-table th {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 1vh 1.2vw;
  text-align: center;
  font-weight: 700;
  border: 1px solid rgba(102, 126, 234, 0.15);
  position: sticky;
  top: 0;
}

.hist-table td {
  color: #444;
  padding: 0.8vh 1.2vw;
  text-align: center;
  border: 1px solid rgba(102, 126, 234, 0.08);
}

.hist-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.04);
}

.cell-ok { color: #4CAF50; font-weight: 600; }
.cell-fail { color: #F44336; font-weight: 600; }
.cell-score { color: #764ba2; font-weight: 700; }

.modal-footer {
  padding: 2vh 3vw;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 1.5vw;
  flex-shrink: 0;
}

.clear-btn {
  padding: 1.2vh 2.5vw;
  border: 1.5px solid rgba(244, 67, 54, 0.4);
  border-radius: 50px;
  background: rgba(244, 67, 54, 0.06);
  color: #F44336;
  font-size: clamp(12px, 1.2vw, 15px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover {
  background: rgba(244, 67, 54, 0.12);
  transform: translateY(-2px);
}

.close-full-btn {
  padding: 1.2vh 2.5vw;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: clamp(12px, 1.2vw, 15px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.35);
}
.close-full-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 18px rgba(102, 126, 234, 0.5);
}
</style>
