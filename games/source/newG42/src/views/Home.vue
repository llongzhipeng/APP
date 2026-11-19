<template>
  <div class="home stage">
    <header class="topbar">
      <div class="brand">
        <div class="mark">CP</div>
        <div class="brand-txt">
          <div class="brand-name">{{ t('appTitle') }}</div>
          <div class="brand-sub">{{ t('appSubtitle') }}</div>
        </div>
      </div>
      <LangSwitch />
    </header>

    <main class="hero">
      <div class="eyebrow">{{ lang === 'zh' ? '长时记忆训练' : 'Memory Training Suite' }}</div>
      <h1 class="title">{{ t('appTitle') }}</h1>
      <div class="rule"></div>
      <p class="desc">
        {{ lang === 'zh'
          ? '呈现一份人物档案，完成注意干扰任务，再从记忆中唤回关键细节。'
          : 'Study a character dossier, complete an attentional distractor, then recall the details.' }}
      </p>

      <div class="actions">
        <button class="btn btn-primary btn-lg" @click="$emit('start')">{{ t('startGame') }}</button>
        <button class="btn btn-ghost btn-lg" @click="showRules = true">{{ t('rules') }}</button>
        <button class="btn btn-ghost btn-lg" @click="showHistory = true">{{ t('history') }}</button>
      </div>
    </main>

    <RulesModal v-if="showRules" @close="showRules = false" />
    <HistoryModal v-if="showHistory" @close="showHistory = false" />
  </div>
</template>

<script>
import LangSwitch from '../components/LangSwitch.vue'
import RulesModal from '../components/RulesModal.vue'
import HistoryModal from '../components/HistoryModal.vue'
import { t, i18n } from '../i18n.js'

export default {
  name: 'Home',
  components: { LangSwitch, RulesModal, HistoryModal },
  data() { return { showRules: false, showHistory: false } },
  computed: { lang() { return i18n.lang } },
  methods: { t }
}
</script>

<style scoped>
.home {
  padding: calc(var(--u) * 3);
  align-items: stretch;
  justify-content: flex-start;
  flex-direction: column;
}

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(var(--u) * 1) calc(var(--u) * 1);
}
.brand { display: flex; align-items: center; gap: calc(var(--u) * 1.2); }
.mark {
  width: calc(var(--u) * 3.6); height: calc(var(--u) * 3.6);
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: calc(var(--u) * 1.2);
  letter-spacing: 0.05em;
  color: var(--ink-2);
}
.brand-name {
  font-size: calc(var(--u) * 1.5);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.brand-sub {
  font-size: calc(var(--u) * 1.05);
  color: var(--ink-3);
  margin-top: 2px;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 calc(var(--u) * 2);
  max-width: calc(var(--u) * 70);
  margin: 0 auto;
}

.eyebrow {
  font-size: calc(var(--u) * 1.1);
  letter-spacing: 0.32em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: calc(var(--u) * 2);
}

.title {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 8);
  font-weight: 400;
  margin: 0;
  line-height: 1;
  letter-spacing: 0.08em;
  color: var(--ink);
}

.rule {
  width: calc(var(--u) * 5);
  height: 1px;
  background: var(--accent);
  margin: calc(var(--u) * 2.4) 0;
}

.desc {
  font-size: calc(var(--u) * 1.5);
  color: var(--ink-2);
  line-height: 1.85;
  margin: 0 0 calc(var(--u) * 4);
  max-width: calc(var(--u) * 50);
  font-weight: 300;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--u) * 1);
}
</style>
