<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ t('rulesTitle') }}</h2>
        <button class="close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="section">
          <div class="section-icon">🎯</div>
          <div>
            <h3>{{ t('ruleGoal') }}</h3>
            <p>{{ t('ruleGoalText') }}</p>
          </div>
        </div>
        <div class="section">
          <div class="section-icon">🏎️</div>
          <div>
            <h3>{{ t('rulesTitle') }}</h3>
            <p>{{ t('ruleText') }}</p>
          </div>
        </div>
        <div class="section">
          <div class="section-icon">📊</div>
          <div>
            <h3>{{ t('ruleDifficulty') }}</h3>
            <p>{{ t('ruleDifficultyText') }}</p>
            <div class="diff-table">
              <div class="row header">
                <span>Lv</span>
                <span>{{ lang==='zh'? '速度':'Speed' }}</span>
                <span>{{ lang==='zh'? '频率':'Freq' }}</span>
                <span>{{ lang==='zh'? '系数':'Coeff' }}</span>
              </div>
              <div class="row" v-for="d in difficulties" :key="d.level">
                <span class="lvl" :class="'lvl'+d.level">{{ d.level }}</span>
                <span>{{ d.speed }}</span>
                <span>{{ d.freq }}</span>
                <span>×{{ d.coeff }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="section">
          <div class="section-icon">⭐</div>
          <div>
            <h3>{{ t('ruleScore') }}</h3>
            <p>{{ t('ruleScoreText') }}</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
export default {
  name: 'RulesModal',
  computed: {
    lang() { return i18n.lang },
    difficulties() {
      const zh = i18n.lang === 'zh'
      return [
        { level: 1, speed: zh?'慢':'Slow',       freq: '7s', coeff: 1 },
        { level: 2, speed: zh?'较慢':'Slower',   freq: '6s', coeff: 1.5 },
        { level: 3, speed: zh?'中等':'Medium',   freq: '5s', coeff: 2 },
        { level: 4, speed: zh?'中等':'Medium',   freq: '4s', coeff: 2.5 },
        { level: 5, speed: zh?'快':'Fast',       freq: '3s', coeff: 3 },
        { level: 6, speed: zh?'较快':'Faster',   freq: '3s', coeff: 3.5 }
      ]
    }
  },
  methods: { t }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; backdrop-filter: blur(6px);
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: min(680px, 92vw); max-height: 88vh;
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
.modal-header {
  padding: 1.4em 1.6em;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.2);
}
.modal-header h2 {
  font-size: clamp(18px, 2vw, 22px); font-weight: 700;
  background: linear-gradient(90deg, #fbbf24, #ef4444);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.close {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.08); color: #fff;
  border: 0; font-size: 22px; line-height: 1;
}
.close:hover { background: rgba(239, 68, 68, 0.4); }
.modal-body { padding: 1.5em; overflow-y: auto; }
.section {
  display: flex; gap: 1em; margin-bottom: 1.5em;
}
.section-icon {
  font-size: 28px; width: 48px; height: 48px; flex: 0 0 48px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(251, 191, 36, 0.15); border-radius: 12px;
}
.section h3 {
  font-size: clamp(14px, 1.6vw, 16px); margin-bottom: 0.3em;
  color: #fbbf24;
}
.section p {
  font-size: clamp(12px, 1.4vw, 14px);
  line-height: 1.6; color: rgba(255,255,255,0.75);
}
.diff-table {
  margin-top: 0.8em;
  background: rgba(0,0,0,0.25); border-radius: 10px; overflow: hidden;
}
.row {
  display: grid; grid-template-columns: 60px 1fr 1fr 1fr;
  padding: 0.55em 0.8em; font-size: 13px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.row.header { background: rgba(255,255,255,0.05); font-weight: 600; color: #fbbf24; border-top: 0; }
.row .lvl {
  display: inline-block; width: 26px; height: 26px; border-radius: 50%;
  text-align: center; line-height: 26px; font-weight: 700; font-size: 12px; color: #000;
}
.lvl1 { background: #86efac; } .lvl2 { background: #4ade80; }
.lvl3 { background: #facc15; } .lvl4 { background: #fb923c; }
.lvl5 { background: #f87171; } .lvl6 { background: #dc2626; color: #fff; }
.modal-footer {
  padding: 1.2em; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: flex-end;
}
.btn {
  padding: 0.7em 2em; border-radius: 10px; border: 0;
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
  font-weight: 600; font-size: 14px;
}
</style>
