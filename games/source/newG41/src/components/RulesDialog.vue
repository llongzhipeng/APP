<template>
  <Modal :show="show" :title="t.rulesTitle" @close="$emit('close')">
    <ul class="rules-list">
      <li v-for="(line, i) in t.rulesContent" :key="i">
        <span class="num">{{ i + 1 }}</span>
        <span class="txt">{{ line }}</span>
      </li>
    </ul>
    <div class="difficulty-table">
      <div class="dt-row dt-head">
        <div>Lv</div><div>{{ t.colDifficulty }}</div><div>{{ posLabel }}</div><div>{{ targetsLabel }}</div><div>{{ totalLabel }}</div><div>{{ coefLabel }}</div>
      </div>
      <div v-for="row in rows" :key="row.lv" class="dt-row">
        <div class="lv">{{ row.lv }}</div>
        <div>Lv {{ row.lv }}</div>
        <div>{{ row.pos }}</div>
        <div>{{ row.targets }}</div>
        <div>{{ row.planets }}</div>
        <div>×{{ row.coef }}</div>
      </div>
    </div>
    <template #footer>
      <button class="btn" @click="$emit('close')">{{ t.close }}</button>
    </template>
  </Modal>
</template>

<script>
import Modal from './Modal.vue'
export default {
  name: 'RulesDialog',
  components: { Modal },
  props: { show: Boolean, t: Object, lang: String },
  computed: {
    posLabel() { return this.lang === 'zh' ? '位置' : 'Position' },
    targetsLabel() { return this.lang === 'zh' ? '目标' : 'Targets' },
    totalLabel() { return this.lang === 'zh' ? '星球总数' : 'Planets' },
    coefLabel() { return this.lang === 'zh' ? '系数' : 'Coef.' },
    rows() {
      const fixed = this.lang === 'zh' ? '固定' : 'Fixed'
      const random = this.lang === 'zh' ? '随机' : 'Random'
      return [
        { lv: 1, pos: fixed, targets: '1', planets: 4, coef: 1 },
        { lv: 2, pos: fixed, targets: '2', planets: 6, coef: 1.5 },
        { lv: 3, pos: fixed, targets: '3', planets: 8, coef: 2 },
        { lv: 4, pos: random, targets: '4', planets: 10, coef: 2.5 },
        { lv: 5, pos: random, targets: '4-5', planets: 12, coef: 3 },
        { lv: 6, pos: random, targets: '5-6', planets: 14, coef: 3.5 },
      ]
    }
  }
}
</script>

<style scoped>
.rules-list { list-style: none; padding: 0; margin: 0 0 1.5em; }
.rules-list li {
  display: flex; align-items: flex-start; gap: 0.9em;
  padding: 0.7em 0;
  border-bottom: 1px dashed rgba(140, 180, 255, 0.15);
  line-height: 1.6;
}
.rules-list .num {
  flex-shrink: 0;
  width: 1.8em; height: 1.8em;
  border-radius: 999px;
  background: linear-gradient(135deg, #3d5afe, #7c4dff);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
}
.difficulty-table {
  border: 1px solid rgba(140, 180, 255, 0.2);
  border-radius: 0.8em;
  overflow: hidden;
}
.dt-row {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr 1fr 0.8fr;
  padding: 0.7em 1em;
  border-bottom: 1px solid rgba(140, 180, 255, 0.1);
  font-size: 0.95em;
}
.dt-row:last-child { border-bottom: none; }
.dt-head { background: rgba(60, 80, 160, 0.3); font-weight: 700; color: #a5c8ff; font-family: 'Orbitron', 'Noto Sans SC', sans-serif; }
.lv { font-family: 'Orbitron', sans-serif; font-weight: 700; color: #ffd43b; }
.btn {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  padding: 0.9em 2.4em;
  font-size: 1.05em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.5);
  background: rgba(60, 80, 160, 0.4);
  color: #e0ecff;
  cursor: pointer;
  letter-spacing: 0.15em;
  transition: all .2s;
}
.btn:hover { background: rgba(90, 120, 220, 0.6); color: #fff; }
</style>
