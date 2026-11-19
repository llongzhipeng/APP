<template>
  <div class="stage duration">
    <div class="topbar">
      <button class="icon-btn" @click="$emit('back')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <LangSwitch />
    </div>

    <div class="wrapper">
      <div class="head">
        <div class="eyebrow">{{ lang === 'zh' ? '第 二 步 · 训练时长' : 'Step Ⅱ · Duration' }}</div>
        <h1>{{ t('durationTitle') }}</h1>
        <div class="rule"></div>
        <p>{{ t('durationDesc') }}</p>
      </div>

      <div class="cards">
        <button v-for="opt in opts" :key="opt.m"
                class="dcard"
                :class="{active: selected === opt.m}"
                @click="selected = opt.m"
                @dblclick="start">
          <div class="dtag">{{ opt.tag }}</div>
          <div class="dnum"><span>{{ opt.m }}</span><em>{{ lang==='zh' ? '分钟' : 'min' }}</em></div>
          <div class="ddesc">{{ opt.desc }}</div>
        </button>
      </div>

      <div class="foot">
        <button class="btn btn-ghost btn-lg" @click="$emit('back')">{{ t('back') }}</button>
        <button class="btn btn-primary btn-lg" @click="start">{{ t('startGame') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import LangSwitch from '../components/LangSwitch.vue'
import { t, i18n } from '../i18n.js'

export default {
  name: 'DurationSelect',
  components: { LangSwitch },
  data() { return { selected: 3 } },
  computed: {
    lang() { return i18n.lang },
    opts() {
      const zh = this.lang === 'zh'
      return [
        { m: 1, tag: t('minTag'),    desc: zh ? '快速热身'   : 'Warm-up'   },
        { m: 3, tag: t('minTagMid'), desc: zh ? '标准训练'   : 'Standard'  },
        { m: 5, tag: t('minTagLong'),desc: zh ? '深度练习'   : 'Deep dive' }
      ]
    }
  },
  methods: { t, start() { this.$emit('start', this.selected) } }
}
</script>

<style scoped>
.duration { padding: calc(var(--u) * 2) calc(var(--u) * 3); flex-direction: column; align-items: stretch; justify-content: flex-start; }

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(var(--u) * 1);
  flex-shrink: 0;
}

.wrapper {
  flex: 1;
  min-height: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: calc(var(--u) * 3);
  width: 100%;
  max-width: calc(var(--u) * 76);
  margin: 0 auto;
  text-align: center;
  padding: calc(var(--u) * 1) 0;
}

.head { margin-bottom: 0; }
.eyebrow {
  font-size: calc(var(--u) * 1.05);
  letter-spacing: 0.32em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 1.4);
}
.head h1 {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 3.6);
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.06em;
}
.rule { width: calc(var(--u) * 4); height: 1px; background: var(--accent); margin: calc(var(--u) * 1.4) auto; }
.head p { color: var(--ink-3); font-size: calc(var(--u) * 1.3); margin: 0; font-weight: 300; }

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(var(--u) * 2);
  margin-bottom: 0;
  width: 100%;
}
.dcard {
  padding: calc(var(--u) * 2.4);
  text-align: left;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  transition: border-color 0.15s ease, transform 0.15s ease;
  color: inherit;
}
.dcard:hover { border-color: var(--ink-4); }
.dcard.active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}
.dtag {
  font-size: calc(var(--u) * 1);
  letter-spacing: 0.24em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 1.4);
}
.dnum { display: flex; align-items: baseline; gap: calc(var(--u) * 0.6); }
.dnum span {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 5);
  font-weight: 400;
  color: var(--ink);
  line-height: 1;
}
.dnum em {
  font-style: normal;
  font-size: calc(var(--u) * 1.4);
  color: var(--ink-3);
  letter-spacing: 0.05em;
}
.ddesc { margin-top: calc(var(--u) * 1); color: var(--ink-3); font-size: calc(var(--u) * 1.2); }

.foot { display: flex; justify-content: center; gap: calc(var(--u) * 1); flex-shrink: 0; }
</style>
