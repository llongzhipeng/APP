<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t.rulesTitle }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="table-wrap">
          <table class="rules-table">
            <thead>
              <tr>
                <th>{{ t.diffLevel }}</th>
                <th>{{ lang === 'zh' ? '图片数量' : 'Images' }}</th>
                <th>{{ lang === 'zh' ? '词语卡片' : 'Cards' }}</th>
                <th>{{ lang === 'zh' ? '有干扰项' : 'Distractors' }}</th>
                <th>{{ lang === 'zh' ? '难度系数' : 'Coeff' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in t.rulesRows" :key="row.level">
                <td><span class="level-tag">{{ row.level }}</span></td>
                <td>{{ row.images }}</td>
                <td>{{ row.cards }}</td>
                <td>{{ row.distractor ? (lang === 'zh' ? '是' : 'Yes') : (lang === 'zh' ? '否' : 'No') }}</td>
                <td><span class="coeff-tag">× {{ row.coeff }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rule-block">
          <h3>{{ lang === 'zh' ? '智能难度调整' : 'Auto Difficulty' }}</h3>
          <p>{{ lang === 'zh' ? '每60秒统计正确率：≥90% 升级，＜70% 降级，其余不变' : 'Every 60s: ≥90% accuracy → level up; <70% → level down' }}</p>
        </div>
        <div class="rule-block">
          <h3>{{ lang === 'zh' ? '计分规则' : 'Scoring' }}</h3>
          <p>{{ lang === 'zh' ? '每答对一题得分 = 5 × 难度系数' : 'Score per correct answer = 5 × difficulty coefficient' }}</p>
        </div>
      </div>
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
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.72);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #0a1e35, #061525);
  border: 0.2vmin solid rgba(100,200,255,0.3); border-radius: 2vmin;
  width: min(80vmin, 96vw); max-height: 88vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2vmin 3vmin; border-bottom: 0.15vmin solid rgba(100,200,255,0.2); flex-shrink: 0;
}
.modal-header h2 { color: #e8f4ff; font-size: 2.5vmin; font-weight: 800; }
.close-btn { background: none; border: none; color: rgba(232,244,255,0.6); font-size: 2.5vmin; cursor: pointer; padding: 0.3vmin 0.8vmin; border-radius: 0.5vmin; transition: color 0.2s; }
.close-btn:hover { color: #e8f4ff; }
.modal-body { overflow-y: auto; padding: 2vmin 3vmin; display: flex; flex-direction: column; gap: 2vmin; }
.table-wrap { overflow-x: auto; }
.rules-table { width: 100%; border-collapse: collapse; font-size: 1.6vmin; min-width: 40vmin; }
.rules-table th { background: rgba(45,156,219,0.2); color: rgba(232,244,255,0.9); padding: 1.2vmin 1.5vmin; text-align: center; font-weight: 700; border-bottom: 0.15vmin solid rgba(100,200,255,0.3); }
.rules-table td { padding: 1vmin 1.5vmin; text-align: center; color: rgba(232,244,255,0.75); border-bottom: 0.1vmin solid rgba(255,255,255,0.06); }
.rules-table tr:hover td { background: rgba(255,255,255,0.04); }
.level-tag { display: inline-block; width: 3vmin; height: 3vmin; line-height: 3vmin; border-radius: 50%; background: rgba(45,156,219,0.5); color: #e8f4ff; font-weight: 800; font-size: 1.6vmin; }
.coeff-tag { color: #a5d6a7; font-weight: 700; }
.rule-block { background: rgba(255,255,255,0.04); border-radius: 1vmin; padding: 1.5vmin 2vmin; border-left: 0.4vmin solid rgba(45,156,219,0.6); }
.rule-block h3 { color: #e8f4ff; font-size: 1.8vmin; font-weight: 700; margin-bottom: 0.8vmin; }
.rule-block p { color: rgba(232,244,255,0.7); font-size: 1.6vmin; line-height: 1.6; }
</style>
