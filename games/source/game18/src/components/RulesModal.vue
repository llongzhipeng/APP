<template>
  <div class="overlay">
    <div class="box">
      <h2 class="title">{{ t.rulesTitle }}</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.diffLevel }}</th>
              <th>{{ lang === 'zh' ? '面孔数' : 'Faces' }}</th>
              <th>{{ lang === 'zh' ? '选项数' : 'Options' }}</th>
              <th>{{ lang === 'zh' ? '难度系数' : 'Coeff' }}</th>
              <th>{{ lang === 'zh' ? '得分/题' : 'Pts/Q' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in t.rulesRows" :key="r.level">
              <td>{{ r.level }}</td>
              <td>{{ r.faces }}</td>
              <td>{{ r.options }}</td>
              <td>{{ r.coeff }}</td>
              <td>{{ Math.round(5 * r.coeff) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="note">{{ lang === 'zh' ? '每60秒根据正确率自动调整难度（≥90%升级，≤70%降级）' : 'Difficulty auto-adjusts every 60s (≥90% upgrade, ≤70% downgrade)' }}</p>
      <button class="close-btn" @click="$emit('close')">{{ t.close }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.box {
  background: linear-gradient(160deg, #0e1a30, #060e1a);
  border: 0.2vmin solid rgba(100,150,255,0.3); border-radius: 2vmin;
  padding: 3vmin 4vmin; width: min(70vmin, 95vw);
  display: flex; flex-direction: column; align-items: center; gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.title { color: #e8f0ff; font-size: 3vmin; font-weight: 800; }
.table-wrap { width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
th, td { padding: 1vmin 1.5vmin; text-align: center; border-bottom: 0.1vmin solid rgba(100,150,255,0.15); }
th { color: rgba(200,220,255,0.7); font-weight: 700; }
td { color: #e8f0ff; }
tr:hover td { background: rgba(100,150,255,0.05); }
.note { font-size: 1.7vmin; color: rgba(200,220,255,0.6); text-align: center; }
.close-btn {
  padding: 1.5vmin 4vmin; font-size: 2vmin; font-weight: 700;
  border-radius: 1vmin; cursor: pointer;
  background: rgba(255,255,255,0.1); border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #e8f0ff; transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.2); }
</style>
