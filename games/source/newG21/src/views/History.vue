<template>
  <div class="history-view">
    <div class="panel">
      <h2 class="ttl">{{ t('historyTitle') }}</h2>
      <div class="content">
        <div v-if="records.length === 0" class="empty">{{ t('noHistory') }}</div>
        <table v-else>
          <thead>
            <tr>
              <th>{{ t('colTime') }}</th>
              <th>{{ t('colProject') }}</th>
              <th>{{ t('colDifficulty') }}</th>
              <th>{{ t('colDuration') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th>{{ t('colSuccess') }}</th>
              <th>{{ t('colFail') }}</th>
              <th>{{ t('colRate') }}</th>
              <th>{{ t('colAvg') }}</th>
              <th>{{ t('colScore') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td :data-label="t('colTime')">{{ formatTime(r.time) }}</td>
              <td :data-label="t('colProject')">{{ t('gameTitle') }}</td>
              <td :data-label="t('colDifficulty')">{{ r.difficultyDisplay }}</td>
              <td :data-label="t('colDuration')">{{ r.durationMin }} {{ t('minutes') }}</td>
              <td :data-label="t('colTotal')">{{ r.total }}</td>
              <td :data-label="t('colSuccess')">{{ r.success }}</td>
              <td :data-label="t('colFail')">{{ r.fail }}</td>
              <td :data-label="t('colRate')">{{ r.rate }}%</td>
              <td :data-label="t('colAvg')">{{ r.avgMs }} ms</td>
              <td :data-label="t('colScore')">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="foot">
        <button class="g-btn ghost" v-if="records.length" @click="onClear">{{ t('clearHistory') }}</button>
        <button class="g-btn" @click="$emit('back')">{{ t('back') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from '@vue/composition-api'
import { useI18n } from '../i18n.js'
import { getHistory, clearHistory, formatTime } from '../utils.js'

const { t } = useI18n()
const records = ref(getHistory())

function onClear() {
  if (confirm(t('confirmClear'))) {
    clearHistory()
    records.value = []
  }
}
</script>

<style scoped>
.history-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vmin;
}
.panel {
  width: min(95vw, 160vmin);
  max-height: 88vh;
  background: rgba(15, 20, 60, 0.85);
  border: 0.3vmin solid rgba(255, 224, 100, 0.5);
  border-radius: 2vmin;
  padding: 4vmin;
  box-shadow: 0 1vmin 4vmin rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 2vmin;
  overflow: hidden;
}
.ttl {
  font-size: 4vmin;
  color: #ffe066;
  text-align: center;
}
.content {
  flex: 1;
  overflow: auto;
}
.empty {
  text-align: center;
  padding: 4vmin;
  color: rgba(255, 255, 255, 0.6);
  font-size: 2.4vmin;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.8vmin;
}
th, td {
  padding: 1vmin 0.8vmin;
  text-align: center;
  border: 0.15vmin solid rgba(255, 224, 100, 0.4);
  white-space: nowrap;
}
th { background: rgba(255, 224, 100, 0.18); color: #ffe066; position: sticky; top: 0; }
.foot {
  display: flex;
  justify-content: center;
  gap: 2vmin;
}

/* 竖屏适配：表格改卡片式 */
@media (orientation: portrait) {
  .history-view {
    padding: 3vmin;
    padding-top: calc(4vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
  }
  .panel {
    width: 94vw;
    max-height: 92vh;
    padding: 5vmin 4vmin;
    border-radius: max(2.4vmin, 14px);
    gap: 2.5vmin;
  }
  .ttl { font-size: max(5.5vmin, 22px); }
  .empty { font-size: max(3.6vmin, 16px); }
  table, thead, tbody, tr { display: block; width: 100%; }
  thead { display: none; }
  tr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.4vmin;
    padding: 2.4vmin;
    margin-bottom: 2vmin;
    background: rgba(255, 224, 100, 0.08);
    border: 0.3vmin solid rgba(255, 224, 100, 0.35);
    border-radius: max(1.6vmin, 10px);
  }
  td {
    display: flex;
    flex-direction: column;
    gap: 0.4vmin;
    padding: 0;
    border: 0;
    text-align: left;
    white-space: normal;
    font-size: max(3.2vmin, 14px);
    color: #fff;
  }
  td::before {
    content: attr(data-label);
    font-size: max(2.6vmin, 11px);
    color: #ffe066;
    opacity: 0.85;
  }
  .foot {
    flex-direction: column;
    gap: 2.5vmin;
    align-items: stretch;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .foot .g-btn {
    width: 100%;
    font-size: max(3.6vmin, 16px);
    padding: max(2.6vmin, 12px) max(4vmin, 18px);
    border-radius: max(2vmin, 12px);
  }
}
</style>
