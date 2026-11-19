<template>
  <div class="modal-mask" @click.self="skip">
    <div class="modal tutorial">
      <div class="modal-header">
        <div>
          <div class="eyebrow">{{ t('tutorialTitle') }}</div>
          <div class="steps">
            <i v-for="n in 3" :key="n" :class="{active: step === n-1, done: step > n-1}"></i>
            <span class="sn">{{ step+1 }} / 3</span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="skip">{{ t('skip') }}</button>
      </div>

      <div class="modal-body body-center">
        <transition name="fade" mode="out-in">
          <!-- Step 1: dossier -->
          <div v-if="step === 0" key="s0" class="step">
            <ProfileCard :profile="demoProfile" :fields="demoFields" size="calc(var(--u) * 40)" />
            <div class="step-desc">
              <div class="dtitle">{{ t('tutorialStep1') }}</div>
              <div class="dtext">{{ t('tutorialStep1Desc') }}</div>
            </div>
          </div>

          <!-- Step 2: distractor -->
          <div v-else-if="step === 1" key="s1" class="step">
            <div class="dist-demo">
              <div class="dist-eq">
                <span class="num">30</span>
                <span class="op">−</span>
                <span class="num">3</span>
                <span class="op">=</span>
                <span class="num q">?</span>
              </div>
              <div class="keys">
                <button v-for="n in [24,27,25,28]" :key="n"
                        class="key"
                        :class="{ok: picked===n && n===27, bad: picked===n && n!==27}"
                        @click="pick(n)">{{ n }}</button>
              </div>
            </div>
            <div class="step-desc">
              <div class="dtitle">{{ t('tutorialStep2') }}</div>
              <div class="dtext">{{ t('tutorialStep2Desc') }}</div>
            </div>
          </div>

          <!-- Step 3: recall -->
          <div v-else key="s2" class="step">
            <div class="qcard">
              <div class="qtitle">{{ t('qJob') }}</div>
              <div class="qopts">
                <button v-for="o in demoOpts" :key="o.k"
                        class="qopt"
                        :class="{ok: picked===o.k && o.correct, bad: picked===o.k && !o.correct}"
                        @click="pick(o.k)">
                  <span class="qidx">{{ o.k }}</span>
                  <span class="qtxt">{{ o.text }}</span>
                </button>
              </div>
            </div>
            <div class="step-desc">
              <div class="dtitle">{{ t('tutorialStep3') }}</div>
              <div class="dtext">{{ t('tutorialStep3Desc') }}</div>
            </div>
          </div>
        </transition>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" :disabled="step===0" @click="step--">{{ t('prev') }}</button>
        <button v-if="step < 2" class="btn btn-primary" @click="step++">{{ t('next') }}</button>
        <button v-else class="btn btn-primary" @click="$emit('done')">{{ t('startGame') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t, i18n } from '../i18n.js'
import ProfileCard from './ProfileCard.vue'
import { randomAvatar } from '../data/characters.js'

export default {
  name: 'Tutorial',
  components: { ProfileCard },
  data() {
    return {
      step: 0,
      picked: null,
      // Fixed demo profile so tutorial is stable across steps
      demoProfile: {
        name: { zh: '李明', en: 'Li Ming' },
        age: 32,
        gender: 'M',
        avatar: randomAvatar('M'),
        job: { zh: '医生', en: 'Doctor' }
      }
    }
  },
  computed: {
    lang() { return i18n.lang },
    demoFields() {
      return [
        { key: 'age',    label: 'fieldAge',    display: '32' + (this.lang==='zh' ? '岁' : ' yrs') },
        { key: 'gender', label: 'fieldGender', display: t('genderMale') },
        { key: 'job',    label: 'fieldJob',    display: this.lang==='zh' ? '医生' : 'Doctor' }
      ]
    },
    demoOpts() {
      const zh = this.lang === 'zh'
      return [
        { k: 'A', text: zh?'教师':'Teacher', correct: false },
        { k: 'B', text: zh?'医生':'Doctor',  correct: true  },
        { k: 'C', text: zh?'律师':'Lawyer',  correct: false },
        { k: 'D', text: zh?'厨师':'Chef',    correct: false }
      ]
    }
  },
  watch: { step() { this.picked = null } },
  methods: {
    t,
    skip() { this.$emit('done') },
    pick(v) { this.picked = v }
  }
}
</script>

<style scoped>
.tutorial { width: min(92vw, calc(var(--u) * 76)); }
.eyebrow {
  font-size: calc(var(--u) * 1);
  letter-spacing: 0.28em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 0.6);
}
.steps { display: flex; align-items: center; gap: calc(var(--u) * 0.5); }
.steps i {
  width: calc(var(--u) * 2.4); height: 2px;
  background: var(--line-2);
  transition: background 0.3s;
  display: inline-block;
}
.steps i.active { background: var(--accent); }
.steps i.done   { background: var(--ok); }
.sn {
  font-family: var(--font-serif);
  color: var(--ink-3);
  font-size: calc(var(--u) * 1.15);
  margin-left: calc(var(--u) * 0.8);
  letter-spacing: 0.06em;
}

.body-center { display: flex; align-items: center; justify-content: center; }
.step {
  display: flex;
  gap: calc(var(--u) * 3);
  align-items: center;
  padding: calc(var(--u) * 1);
}
.step-desc { max-width: calc(var(--u) * 20); }
.dtitle {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 2);
  color: var(--ink);
  margin-bottom: calc(var(--u) * 1);
  letter-spacing: 0.04em;
}
.dtext {
  font-size: calc(var(--u) * 1.25);
  color: var(--ink-3);
  line-height: 1.75;
  font-weight: 300;
}

/* Distractor demo */
.dist-demo {
  width: calc(var(--u) * 34);
  padding: calc(var(--u) * 3);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.dist-eq {
  display: flex; justify-content: center; align-items: baseline;
  gap: calc(var(--u) * 1.2);
  font-family: var(--font-serif);
  margin-bottom: calc(var(--u) * 2);
  font-variant-numeric: tabular-nums;
}
.num { font-size: calc(var(--u) * 3.4); }
.op  { font-size: calc(var(--u) * 2); color: var(--ink-3); }
.num.q { color: var(--accent); }
.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: calc(var(--u) * 0.8); }
.key {
  padding: calc(var(--u) * 1.3) 0;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line-2);
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.6);
  font-variant-numeric: tabular-nums;
  transition: all 0.15s ease;
}
.key:hover { border-color: var(--ink-3); }
.key.ok  { border-color: var(--ok); color: var(--ok); background: rgba(124,195,142,0.08); }
.key.bad { border-color: var(--bad); color: var(--bad); background: rgba(217,122,122,0.08); }

/* Recall demo */
.qcard {
  width: calc(var(--u) * 34);
  padding: calc(var(--u) * 3);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.qtitle {
  text-align: center;
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.6);
  color: var(--ink);
  padding-bottom: calc(var(--u) * 1.4);
  border-bottom: 1px solid var(--line);
  margin-bottom: calc(var(--u) * 1.6);
}
.qopts { display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u) * 0.8); }
.qopt {
  display: flex; align-items: center; gap: calc(var(--u) * 0.8);
  padding: calc(var(--u) * 1.2) calc(var(--u) * 1.4);
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line-2);
  color: var(--ink);
  text-align: left;
  font-size: calc(var(--u) * 1.3);
  transition: all 0.15s ease;
}
.qopt:hover { border-color: var(--ink-3); }
.qidx {
  width: calc(var(--u) * 2); height: calc(var(--u) * 2);
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--line-2);
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.05);
  color: var(--ink-2);
}
.qopt.ok  { border-color: var(--ok); color: var(--ok); background: rgba(124,195,142,0.08); }
.qopt.ok .qidx { border-color: var(--ok); color: var(--ok); }
.qopt.bad { border-color: var(--bad); color: var(--bad); background: rgba(217,122,122,0.08); }
.qopt.bad .qidx { border-color: var(--bad); color: var(--bad); }
</style>
