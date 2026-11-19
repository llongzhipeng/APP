<template>
  <div class="rules-view">
    <div class="panel">
      <h2 class="ttl">{{ t('rulesTitle') }}</h2>
      <div class="content">
        <p>{{ t('rulesIntro') }}</p>
        <p>{{ t('rulesGoal') }}</p>
        <p>{{ t('rulesPlay') }}</p>
        <p>{{ t('rulesOp') }}</p>
        <p class="strong">{{ t('rulesDiff') }}</p>
        <table>
          <thead>
            <tr>
              <th>{{ lang === 'zh' ? '难度' : 'Level' }}</th>
              <th>{{ lang === 'zh' ? '星星数量' : 'Stars' }}</th>
              <th>{{ lang === 'zh' ? '最长答题时间(秒)' : 'Max Time (s)' }}</th>
              <th>{{ lang === 'zh' ? '难度系数' : 'Coef' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in DIFFICULTIES" :key="d.level">
              <td>{{ d.level }}</td>
              <td>{{ d.starCount }}</td>
              <td>{{ d.maxTime }}</td>
              <td>{{ d.coef }}</td>
            </tr>
          </tbody>
        </table>
        <p>{{ t('rulesScore') }}</p>
        <p>{{ t('rulesAuto') }}</p>
      </div>
      <button class="g-btn" @click="$emit('back')">{{ t('back') }}</button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../i18n.js'
import { DIFFICULTIES } from '../config.js'
import { computed } from '@vue/composition-api'
const i18n = useI18n()
const t = i18n.t
const lang = computed(() => i18n.lang)
</script>

<style scoped>
.rules-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vmin;
}
.panel {
  width: min(88vw, 130vmin);
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
  overflow-y: auto;
  font-size: 2.2vmin;
  line-height: 1.7;
  padding-right: 1vmin;
}
.content p { margin-bottom: 1.2vmin; }
.strong { font-weight: bold; color: #ffe066; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2vmin 0 1.6vmin;
  font-size: 2vmin;
}
th, td {
  padding: 1vmin;
  text-align: center;
  border: 0.15vmin solid rgba(255, 224, 100, 0.4);
}
th { background: rgba(255, 224, 100, 0.18); color: #ffe066; }
.panel > .g-btn { align-self: center; }

/* 竖屏适配 */
@media (orientation: portrait) {
  .rules-view {
    padding: 3vmin;
    padding-top: calc(4vmin + env(safe-area-inset-top));
    padding-bottom: calc(3vmin + env(safe-area-inset-bottom));
  }
  .panel {
    width: 92vw;
    max-height: 90vh;
    padding: 5vmin 4vmin;
    border-radius: max(2.4vmin, 14px);
    gap: 2.5vmin;
  }
  .ttl { font-size: max(5.5vmin, 22px); }
  .content { font-size: max(3.4vmin, 15px); line-height: 1.75; }
  .content p { margin-bottom: 2vmin; }
  table { font-size: max(3vmin, 13px); }
  th, td { padding: 1.4vmin 0.6vmin; }
  .panel > .g-btn {
    width: 80%;
    font-size: max(3.6vmin, 16px);
    padding: max(2.6vmin, 12px) max(4vmin, 18px);
    border-radius: max(2vmin, 12px);
  }
}
</style>
