<template>
  <div class="home-page">
    <div class="home-content">
      <h1 class="game-title">{{ t.appTitle }}</h1>
      <p class="game-subtitle">{{ t.subtitle }}</p>
      <div class="btn-group">
        <button class="btn btn-primary" @click="$emit('start')">{{ t.startGame }}</button>
        <button class="btn btn-secondary" @click="showRules = true">{{ t.rules }}</button>
        <button class="btn btn-secondary" @click="$emit('history')">{{ t.history }}</button>
      </div>
    </div>

    <!-- Rules Modal -->
    <div v-if="showRules" class="modal-overlay" @click.self="showRules = false">
      <div class="modal-box">
        <h2 class="modal-title">{{ t.rulesTitle }}</h2>
        <ul class="rules-list">
          <li v-for="(rule, i) in t.rulesContent" :key="i">{{ rule }}</li>
        </ul>
        <div class="difficulty-table">
          <table>
            <thead>
              <tr>
                <th>难度</th><th>缺失数</th><th>选项数</th><th>时限</th><th>系数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in diffConfig" :key="d.level">
                <td>{{ d.level }}</td>
                <td>{{ d.missingCount }}</td>
                <td>{{ d.trayCount }}</td>
                <td>{{ d.timeLimit }}s</td>
                <td>{{ d.coefficient }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary" @click="showRules = false">{{ t.rulesClose }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { DIFFICULTY_CONFIG } from '../data/puzzles.js'

export default {
  name: 'HomePage',
  props: { t: Object },
  setup() {
    const showRules = ref(false)
    return { showRules, diffConfig: DIFFICULTY_CONFIG }
  }
}
</script>

<style scoped>
.home-page {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.home-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3vh;
}

.game-title {
  font-size: clamp(28px, 6vmin, 64px);
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.05em;
}

.game-subtitle {
  font-size: clamp(12px, 2vmin, 22px);
  color: #666;
  letter-spacing: 0.2em;
  margin-top: -2vh;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  width: clamp(140px, 28vmin, 280px);
}

.btn {
  padding: 1em 2em;
  border-radius: 0.7em;
  font-size: clamp(13px, 2vmin, 20px);
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}
.btn-secondary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-box {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 1em;
  padding: 3vh 3vw;
  max-width: 90vw;
  width: clamp(280px, 60vmin, 550px);
  display: flex;
  flex-direction: column;
  gap: 2vh;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-title {
  font-size: clamp(16px, 3vmin, 26px);
  color: #667eea;
  text-align: center;
  font-weight: 700;
}

.rules-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1vh;
}
.rules-list li {
  font-size: clamp(11px, 1.8vmin, 17px);
  color: #555;
  padding-left: 1.2em;
  position: relative;
  line-height: 1.5;
}
.rules-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
}

.difficulty-table {
  overflow-x: auto;
}
.difficulty-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(11px, 1.6vmin, 15px);
}
.difficulty-table th,
.difficulty-table td {
  padding: 0.5em 0.8em;
  text-align: center;
  border: 1px solid #e0e0e0;
}
.difficulty-table th {
  background: #667eea;
  color: #fff;
  font-weight: 600;
}
.difficulty-table td {
  color: #555;
}
.difficulty-table tr:nth-child(even) td {
  background: #f9f9f9;
}
</style>
