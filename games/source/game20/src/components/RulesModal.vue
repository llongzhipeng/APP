<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>{{ t.rulesTitle }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ t.diffLevel }}</th>
            <th>{{ lang==='zh'?'目标物':'Targets' }}</th>
            <th>{{ lang==='zh'?'干扰项':'Distractors' }}</th>
            <th>{{ lang==='zh'?'干扰种类':'Dist.Types' }}</th>
            <th>{{ lang==='zh'?'难度系数':'Coeff' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in t.rulesRows" :key="r.level">
            <td>{{ r.level }}</td><td>{{ r.targets }}</td><td>{{ r.distractors }}</td><td>{{ r.distTypes }}</td><td>{{ r.coeff }}</td>
          </tr>
        </tbody>
      </table>
      <p class="note">{{ lang==='zh'?'每60秒根据正确率自动调整难度（≥90%升级，<70%降级）':'Difficulty auto-adjusts every 60s (≥90% up, <70% down)' }}</p>
      <button class="close-btn" @click="$emit('close')">{{ t.close }}</button>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String },
  emits: ['close'],
  computed: { t() { return messages[this.lang] || messages.zh } },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: linear-gradient(135deg, #0d2b4e, #0a1e35);
  border: 0.2vmin solid rgba(100,180,255,0.3);
  border-radius: 2vmin; padding: 4vmin 5vmin; max-width: 80vw;
  display: flex; flex-direction: column; align-items: center; gap: 2.5vmin;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.6);
}
h2 { color: #c8e0ff; font-size: 3.5vmin; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 1vmin 2vmin; text-align: center; font-size: 1.8vmin; color: rgba(200,224,255,0.85); border-bottom: 0.1vmin solid rgba(255,255,255,0.1); }
th { color: #64b4ff; font-weight: 700; }
.note { color: rgba(200,224,255,0.5); font-size: 1.6vmin; text-align: center; }
.close-btn {
  padding: 1.2vmin 3.5vmin; font-size: 2vmin; font-weight: 700; border-radius: 1.2vmin; cursor: pointer;
  background: linear-gradient(135deg,#1a5fa8,#2e8fd4); border: none; color: #fff;
}
</style>
