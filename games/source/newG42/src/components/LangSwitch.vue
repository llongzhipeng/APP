<template>
  <button class="lang-btn" v-show="!disabled" :disabled="disabled" @click="toggle">
    <span>{{ label }}</span>
  </button>
</template>

<script>
import { i18n, setLang } from '../i18n.js'

export default {
  name: 'LangSwitch',
  props: { disabled: { type: Boolean, default: false } },
  computed: {
    label() { return i18n.lang === 'zh' ? '中 / EN' : 'EN / 中' }
  },
  methods: {
    toggle() {
      if (this.disabled) return
      setLang(i18n.lang === 'zh' ? 'en' : 'zh')
    }
  }
}
</script>

<style scoped>
.lang-btn {
  padding: calc(var(--u) * 0.8) calc(var(--u) * 1.4);
  border-radius: var(--radius);
  font-size: calc(var(--u) * 1.15);
  font-weight: 500;
  color: var(--ink-2);
  background: transparent;
  border: 1px solid var(--line-2);
  letter-spacing: 0.08em;
  transition: all 0.15s ease;
}
.lang-btn:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--ink-3);
}
</style>
