<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ L.title }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="intro">{{ L.intro }}</p>

        <div class="level-table">
          <div class="table-header">
            <span>{{ L.levelCol }}</span>
            <span>{{ L.rule }}</span>
            <span>{{ L.options }}</span>
            <span>{{ L.time }}</span>
            <span>{{ L.coeff }}</span>
          </div>

          <div class="table-row" v-for="row in levels" :key="row.lv">
            <span class="lv-badge">Lv.{{ row.lv }}</span>
            <span>{{ row.rule }}</span>
            <span>{{ row.opts }}</span>
            <span>10s</span>
            <span class="coeff">×{{ row.coeff }}</span>
          </div>
        </div>

        <div class="scoring-note">
          <h3>{{ L.scoringTitle }}</h3>
          <p>{{ L.scoringText }}</p>
        </div>

        <div class="adaptive-note">
          <h3>{{ L.adaptTitle }}</h3>
          <p>{{ L.adaptText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game14RulesModal'
};
</script>

<script setup>
import { computed } from '@vue/composition-api'

const props = defineProps({ language: String })
defineEmits(['close'])

const lang = computed(() => props.language || 'zh')

const texts = {
  zh: {
    title: '游戏规则',
    intro: '游戏目标：尽可能多的对物品进行归类训练，提升抽象思维能力。',
    levelCol: '难度',
    rule: '规则',
    options: '选项',
    time: '时限',
    coeff: '系数',
    scoringTitle: '计分规则',
    scoringText: '难度1答对得5分，后续每级得分 = 5 × 难度系数。',
    adaptTitle: '智能难度调整',
    adaptText: '每30秒统计正确率：≥90%自动升级，<70%自动降级。',
    levels: [
      { lv: 1, rule: '明显归类（水果/蔬菜，动物/植物）', opts: 2, coeff: 1 },
      { lv: 2, rule: '模糊归类（家具/电器，金属/非金属）', opts: 2, coeff: 1.5 },
      { lv: 3, rule: '双重属性归类（颜色+类型）', opts: 4, coeff: 2 },
      { lv: 4, rule: '双重属性归类（难度更高）', opts: 4, coeff: 2.5 },
      { lv: 5, rule: '找出不同项（明显分类）', opts: 4, coeff: 3 },
      { lv: 6, rule: '找出不同项（模糊分类）', opts: 4, coeff: 3.5 }
    ]
  },
  en: {
    title: 'Game Rules',
    intro: 'Goal: Classify as many items as possible to train abstract thinking.',
    levelCol: 'Level',
    rule: 'Rule',
    options: 'Options',
    time: 'Time',
    coeff: 'Coeff.',
    scoringTitle: 'Scoring',
    scoringText: 'Level 1 correct = 5 pts. Higher levels: pts = 5 × coefficient.',
    adaptTitle: 'Adaptive Difficulty',
    adaptText: 'Every 30s: accuracy ≥90% → level up, <70% → level down.',
    levels: [
      { lv: 1, rule: 'Obvious (Fruit/Veg, Animal/Plant)', opts: 2, coeff: 1 },
      { lv: 2, rule: 'Ambiguous (Furniture/Appliance, Metal/Non-metal)', opts: 2, coeff: 1.5 },
      { lv: 3, rule: 'Dual attribute (color + type)', opts: 4, coeff: 2 },
      { lv: 4, rule: 'Dual attribute (harder distractors)', opts: 4, coeff: 2.5 },
      { lv: 5, rule: 'Find the odd one (obvious)', opts: 4, coeff: 3 },
      { lv: 6, rule: 'Find the odd one (ambiguous)', opts: 4, coeff: 3.5 }
    ]
  }
}

const L = computed(() => texts[lang.value] || texts.zh)

const levels = computed(() => L.value.levels)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
  backdrop-filter: blur(4px);
  padding: 2vmin;
}

.modal-box {
  background: white;
  border-radius: 2vmin;
  width: 90vmin;
  max-width: 96vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2vmin 3vmin;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: clamp(16px, 3vmin, 30px);
  font-weight: 800;
  color: white;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  width: 4vmin;
  height: 4vmin;
  border-radius: 50%;
  cursor: pointer;
  font-size: clamp(12px, 2vmin, 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 28px;
  min-height: 28px;
}

.close-btn:hover { background: rgba(255,255,255,0.4); }

.modal-body {
  overflow-y: auto;
  padding: 2.5vmin 3vmin;
  flex: 1;
}

.intro {
  font-size: clamp(12px, 2vmin, 18px);
  color: #475569;
  margin-bottom: 2.5vmin;
  line-height: 1.6;
}

.level-table {
  border: 1px solid #e2e8f0;
  border-radius: 1vmin;
  overflow: hidden;
  margin-bottom: 2.5vmin;
  font-size: clamp(10px, 1.7vmin, 16px);
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 3fr 1fr 1fr 1fr;
  background: linear-gradient(135deg, #1e40af, #4c1d95);
  color: white;
  font-weight: 700;
  gap: 0;
}

.table-header > span,
.table-row > span {
  padding: 1.2vmin 1vmin;
  border-right: 1px solid rgba(0,0,0,0.06);
}

.table-header > span:last-child,
.table-row > span:last-child {
  border-right: none;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 3fr 1fr 1fr 1fr;
  border-top: 1px solid #e2e8f0;
  align-items: center;
}

.table-row:nth-child(even) { background: #f8fafc; }

.lv-badge {
  font-weight: 800;
  color: #2563eb;
}

.coeff {
  font-weight: 700;
  color: #d97706;
}

.scoring-note,
.adaptive-note {
  background: #f1f5f9;
  border-radius: 1vmin;
  padding: 1.8vmin 2vmin;
  margin-bottom: 1.5vmin;
  border-left: 4px solid #2563eb;
}

.scoring-note h3,
.adaptive-note h3 {
  font-size: clamp(12px, 2vmin, 18px);
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 0.5vmin;
}

.scoring-note p,
.adaptive-note p {
  font-size: clamp(11px, 1.8vmin, 16px);
  color: #475569;
  line-height: 1.5;
}
</style>
