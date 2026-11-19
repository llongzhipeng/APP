<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ t('rulesTitle') }}</h2>
        <button class="close" @click="$emit('close')">{{ t('close') }}</button>
      </div>
      <div class="modal-body">
        <section class="block">
          <h3>{{ t('ruleGoal') }}</h3>
          <p>{{ t('ruleGoalText') }}</p>
        </section>
        <section class="block">
          <h3>{{ t('ruleHow') }}</h3>
          <p>{{ t('ruleHowText') }}</p>
        </section>
        <section class="block">
          <h3>{{ t('ruleDifficulty') }}</h3>
          <p>{{ t('ruleDifficultyText') }}</p>
          <div class="diff-table">
            <div class="row header">
              <span>Lv</span>
              <span>{{ lang==='zh'? '开心':'Happy' }}</span>
              <span>{{ lang==='zh'? '不开心':'Sad' }}</span>
              <span>{{ lang==='zh'? '速度':'Speed' }}</span>
              <span>{{ lang==='zh'? '系数':'Coeff' }}</span>
            </div>
            <div class="row" v-for="d in difficulties" :key="d.level">
              <span class="lvl" :class="'lvl'+d.level">{{ d.level }}</span>
              <span>{{ d.happy }}</span>
              <span>{{ d.sad }}</span>
              <span>{{ d.speedLabel }}</span>
              <span>×{{ d.coeff }}</span>
            </div>
          </div>
        </section>
        <section class="block">
          <h3>{{ t('ruleScore') }}</h3>
          <p>{{ t('ruleScoreText') }}</p>
        </section>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
import { DIFFICULTIES } from '../difficulty.js'

export default {
  name: 'RulesModal',
  computed: {
    lang() { return i18n.lang },
    difficulties() {
      const zh = i18n.lang === 'zh'
      const speedName = (s) => {
        if (s <= 0.3) return zh?'极慢':'V.Slow'
        if (s <= 0.5) return zh?'慢':'Slow'
        if (s <= 1.0) return zh?'正常':'Normal'
        return zh?'快':'Fast'
      }
      return DIFFICULTIES.map(d => ({ ...d, speedLabel: speedName(d.speed) }))
    }
  },
  methods: { t }
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(44, 39, 33, 0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: 100vmin; max-width: 96vw; max-height: 82vh;
  background: #ffffff;
  border-radius: 2.4vmin; overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(44, 39, 33, 0.18);
  display: flex; flex-direction: column;
  animation: slideUp 0.28s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.modal-header {
  padding: 1.8vmin 3vmin;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 0.15vmin solid #f0eadf;
}
.modal-header h2 {
  font-size: 3.6vmin; font-weight: 700;
  color: #2c2721;
  letter-spacing: 0.02em;
}
.close {
  padding: 1vmin 2.2vmin; border-radius: 1.2vmin;
  background: #ffffff; color: #6b6357;
  border: 0.2vmin solid #e5ddce;
  font-size: 2.2vmin;
  font-weight: 600;
  transition: all 0.2s;
}
.close:hover { border-color: #d97757; color: #d97757; }

.modal-body { padding: 2.4vmin 3vmin; overflow-y: auto; color: #2c2721; }
.block { margin-bottom: 2vmin; }
.block:last-child { margin-bottom: 0; }
.block h3 {
  font-size: 2.8vmin;
  color: #2c2721;
  font-weight: 700;
  margin-bottom: 0.6vmin;
  letter-spacing: 0.02em;
}
.block p {
  font-size: 2.2vmin;
  line-height: 1.6; color: #4a423a;
}

.diff-table {
  margin-top: 1.2vmin;
  background: #faf6ef; border-radius: 1.4vmin; overflow: hidden;
  border: 0.15vmin solid #f0eadf;
}
.row {
  display: grid; grid-template-columns: 7vmin 1fr 1fr 1fr 1fr;
  padding: 1vmin 1.8vmin; font-size: 2.2vmin;
  border-top: 0.15vmin solid #f0eadf;
  align-items: center;
  color: #2c2721;
}
.row.header {
  background: #f5efe4;
  font-weight: 700; color: #6b6357;
  border-top: 0;
  font-size: 2vmin;
  letter-spacing: 0.04em;
}
.row .lvl {
  display: inline-block; width: 3.8vmin; height: 3.8vmin; min-width: 28px; min-height: 28px; border-radius: 50%;
  text-align: center; line-height: 3.8vmin; font-weight: 700; font-size: 2vmin; color: #fff;
}
.lvl1 { background: #7cb98f; }
.lvl2 { background: #6aa77a; }
.lvl3 { background: #d4a94a; }
.lvl4 { background: #d47f4a; }
.lvl5 { background: #c5674a; }
.lvl6 { background: #a94a3a; }

.modal-footer {
  padding: 1.6vmin 3vmin; border-top: 0.15vmin solid #f0eadf;
  display: flex; justify-content: flex-end;
}
.btn {
  padding: 1.2vmin 3.6vmin; border-radius: 1.4vmin; border: 0;
  background: #d97757; color: #fff;
  font-weight: 600; font-size: 2.4vmin;
  transition: all 0.2s;
}
.btn:hover { background: #c5674a; }
</style>
