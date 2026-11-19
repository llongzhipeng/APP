<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ t('rules.title') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="intro">{{ t('rules.intro') }}</p>
        <p class="goal">{{ t('rules.goal') }}</p>

        <h3 class="section-title">{{ t('rules.howTitle') }}</h3>
        <ol class="how-list">
          <li v-for="item in t('rules.how')" :key="item">{{ item }}</li>
        </ol>

        <h3 class="section-title">{{ t('rules.diffTitle') }}</h3>
        <div class="table-wrap">
          <table class="diff-table">
            <thead>
              <tr>
                <th v-for="h in t('rules.diffHeaders')" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in t('rules.diffData')" :key="row[0]">
                <td v-for="cell in row" :key="cell">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="section-title">{{ t('rules.adjustTitle') }}</h3>
        <p class="adjust-text">{{ t('rules.adjust') }}</p>

        <h3 class="section-title">{{ t('rules.scoreTitle') }}</h3>
        <p class="adjust-text">{{ t('rules.scoreText') }}</p>
      </div>

      <div class="modal-footer">
        <button class="close-full-btn" @click="$emit('close')">{{ t('rules.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game11RulesModal'
};
</script>

<script setup>
defineProps({ t: Function })
defineEmits(['close'])
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
  width: min(92vw, 700px);
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
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.intro, .goal, .adjust-text {
  color: #555;
  font-size: clamp(12px, 1.2vw, 15px);
  line-height: 1.6;
}

.section-title {
  color: #667eea;
  font-size: clamp(12px, 1.2vw, 15px);
  font-weight: 700;
  margin-top: 1vh;
  padding-bottom: 0.5vh;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.how-list {
  padding-left: 2em;
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
}
.how-list li {
  color: #555;
  font-size: clamp(12px, 1.1vw, 14px);
  line-height: 1.5;
}

.table-wrap {
  overflow-x: auto;
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(11px, 1vw, 13px);
}

.diff-table th {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 1vh 1.2vw;
  text-align: center;
  font-weight: 700;
  border: 1px solid rgba(102, 126, 234, 0.15);
  white-space: nowrap;
}

.diff-table td {
  color: #444;
  padding: 0.8vh 1.2vw;
  text-align: center;
  border: 1px solid rgba(102, 126, 234, 0.08);
}

.diff-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.04);
}

.modal-footer {
  padding: 2vh 3vw;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.close-full-btn {
  padding: 1.2vh 3vw;
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
